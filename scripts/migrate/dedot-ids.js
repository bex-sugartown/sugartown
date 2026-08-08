#!/usr/bin/env node
/**
 * dedot-ids.js — SUG-260 Phase 1/2: migrate wp.* dotted document ids
 *
 * Sanity treats dots in `_id` as path segments, and a dataset's public-read
 * grant covers one segment, so every `wp.<type>.<id>` document is invisible to
 * anonymous queries. This renames them to `<type>-<slug>` and rewrites every
 * inbound reference in the same transaction.
 *
 * Sanity has no rename: an id change is create-new plus delete-old. Both halves
 * live in ONE transaction, because partial state leaves references pointing at
 * documents that no longer exist. See the epic's Non-Goals.
 *
 * Usage:
 *   node scripts/migrate/dedot-ids.js              # dry-run + report
 *   node scripts/migrate/dedot-ids.js --execute    # live run
 *   node scripts/migrate/dedot-ids.js --json out.json
 *
 * Full spec: docs/backlog/SUG-260-migrate-wp-dotted-document-ids.md
 */

import { writeFileSync } from 'fs'
import { buildSanityClient } from './lib.js'
import {
  isWpId,
  buildIdMap,
  rewriteRefs,
  countMappedEdges,
  findDangling,
} from './dedot-id-map.js'

const EXECUTE = process.argv.includes('--execute')
const jsonFlag = process.argv.indexOf('--json')
const JSON_OUT = jsonFlag > -1 ? process.argv[jsonFlag + 1] : null

// Baselines measured 2026-08-08. The script asserts against them so a silently
// wrong filter fails closed instead of migrating a subset. Refresh deliberately,
// with the epic doc, never to make a red run go green.
const EXPECT = { docs: 111, edges: 612 }

/** Server-owned fields. Sending these back rejects or is silently ignored. */
const SYSTEM_FIELDS = ['_rev', '_createdAt', '_updatedAt', '_system']
const stripSystemFields = (doc) => {
  const out = { ...doc }
  for (const f of SYSTEM_FIELDS) delete out[f]
  return out
}

const line = (c = '─') => c.repeat(72)
const fail = (msg) => {
  console.error(`\n❌ ${msg}\n`)
  process.exit(1)
}

async function main() {
  const client = buildSanityClient()

  console.log(`\n${line('═')}`)
  console.log(`  SUG-260 — dedot document ids`)
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
  console.log(`${line('═')}\n`)

  console.log('Fetching every document (published and draft)…')
  const docs = await client.fetch('*[]')
  const byId = new Map(docs.map((d) => [d._id, d]))
  console.log(`  ${docs.length} documents\n`)

  // ── Build the map ────────────────────────────────────────────────────────
  const { mapping, collisions, noSlug, duplicates } = buildIdMap(docs)
  const { edges, sources } = countMappedEdges(docs, mapping)
  const danglingBefore = findDangling(docs)

  // Already migrated: nothing in scope and nothing to remap is success, not
  // failure. Without this, a re-run reports red against a pre-migration
  // baseline and reads like a broken dataset.
  if (mapping.size === 0 && edges === 0) {
    console.log('✅ Nothing in scope. The dataset carries no wp.* ids.')
    console.log(`   ${docs.length} documents · ${danglingBefore.length} dangling references`)
    console.log('   Migration already applied. Nothing to do.\n')
    return
  }

  // ── Pre-flight assertions ────────────────────────────────────────────────
  // Every one of these has to hold before a single mutation is queued.
  console.log('Pre-flight')
  const checks = [
    ['documents in scope', mapping.size, EXPECT.docs],
    ['reference edges to remap', edges, EXPECT.edges],
    ['id collisions with existing docs', collisions.length, 0],
    ['duplicate generated ids', duplicates.length, 0],
    ['in-scope docs with no slug', noSlug.length, 0],
    ['dangling refs before migration', danglingBefore.length, 0],
  ]
  let failed = false
  for (const [label, actual, expected] of checks) {
    const ok = actual === expected
    if (!ok) failed = true
    console.log(`  ${ok ? '✅' : '❌'} ${label.padEnd(36)} ${actual} (expected ${expected})`)
  }
  if (collisions.length) console.log(`     collisions: ${collisions.slice(0, 5).join(', ')}`)
  if (duplicates.length) console.log(`     duplicates: ${duplicates.slice(0, 5).join(', ')}`)
  if (noSlug.length) console.log(`     no slug: ${noSlug.slice(0, 5).join(', ')}`)
  if (danglingBefore.length) console.log(`     dangling: ${danglingBefore.slice(0, 5).join(', ')}`)
  if (failed) {
    fail(
      'Pre-flight failed. The dataset does not match the audited baseline.\n' +
        '   Re-run the Phase 0 audit and update the epic doc before touching anything.'
    )
  }
  console.log()

  // ── Plan ─────────────────────────────────────────────────────────────────
  // Three mutation classes:
  //   renames  — id changes (create new, delete old); refs inside also rewritten
  //   patches  — id unchanged, but the document references something renamed
  //   deletes  — the old ids, queued last
  const renames = []
  const patches = []

  for (const doc of docs) {
    const isRenamed = mapping.has(doc._id)
    const { doc: rewritten, rewritten: refCount } = rewriteRefs(doc, mapping)

    if (isRenamed) {
      // System fields are server-owned. _createdAt cannot be carried across a
      // create and is reset by Sanity on all 111 renamed docs — recorded in the
      // epic's Risks. publishedAt is a user field and survives untouched.
      const next = stripSystemFields({ ...rewritten, _id: mapping.get(doc._id) })
      renames.push({ from: doc._id, to: next._id, type: doc._type, refCount, doc: next })
    } else if (refCount > 0) {
      // Full-document replace, so system fields must come off here too or the
      // API rejects the payload.
      patches.push({ id: doc._id, type: doc._type, refCount, doc: stripSystemFields(rewritten) })
    }
  }

  const totalRefsRewritten =
    renames.reduce((n, r) => n + r.refCount, 0) + patches.reduce((n, p) => n + p.refCount, 0)

  if (totalRefsRewritten !== edges) {
    fail(
      `Rewrote ${totalRefsRewritten} references but counted ${edges}. ` +
        'The walk and the rewrite disagree; do not proceed.'
    )
  }

  console.log('Plan')
  console.log(`  ${renames.length} documents renamed (create + delete)`)
  console.log(`  ${patches.length} documents patched in place (references only)`)
  console.log(`  ${renames.length + patches.length} distinct documents touched`)
  console.log(`  ${totalRefsRewritten} references rewritten`)
  console.log(`  ${renames.filter((r) => r.refCount > 0).length} renamed docs also contain references`)
  console.log(`  ${renames.filter((r) => r.refCount === 0).length} renamed docs reference nothing`)

  const byType = {}
  for (const r of renames) byType[r.type] = (byType[r.type] ?? 0) + 1
  console.log(`  by type: ${Object.entries(byType).map(([t, n]) => `${t} ×${n}`).join(', ')}`)

  const payloadBytes = JSON.stringify([...renames.map((r) => r.doc), ...patches.map((p) => p.doc)]).length
  console.log(`  transaction payload: ${(payloadBytes / 1024 / 1024).toFixed(2)} MB\n`)

  // ── Post-state simulation ────────────────────────────────────────────────
  // Verify the rewritten set is referentially whole BEFORE mutating anything.
  const after = docs
    .filter((d) => !mapping.has(d._id))
    .map((d) => patches.find((p) => p.id === d._id)?.doc ?? d)
    .concat(renames.map((r) => r.doc))
  const danglingAfter = findDangling(after)
  const leftoverWp = after.filter((d) => isWpId(d._id)).map((d) => d._id)
  const staleRefs = []
  for (const doc of after) {
    const seen = new Set()
    // eslint-disable-next-line no-loop-func
    const check = (node) => {
      if (Array.isArray(node)) return node.forEach(check)
      if (node === null || typeof node !== 'object') return
      if (typeof node._ref === 'string' && isWpId(node._ref)) seen.add(node._ref)
      for (const [k, v] of Object.entries(node)) if (!k.startsWith('_')) check(v)
    }
    check(doc)
    for (const s of seen) staleRefs.push(`${doc._id} → ${s}`)
  }

  console.log('Simulated post-state')
  const post = [
    ['dangling references', danglingAfter.length, 0],
    ['documents still carrying a wp.* id', leftoverWp.length, 0],
    ['references still pointing at a wp.* id', staleRefs.length, 0],
    ['total documents', after.length, docs.length],
  ]
  let postFailed = false
  for (const [label, actual, expected] of post) {
    const ok = actual === expected
    if (!ok) postFailed = true
    console.log(`  ${ok ? '✅' : '❌'} ${label.padEnd(40)} ${actual} (expected ${expected})`)
  }
  if (danglingAfter.length) console.log(`     ${danglingAfter.slice(0, 5).join(', ')}`)
  if (staleRefs.length) console.log(`     ${staleRefs.slice(0, 5).join(', ')}`)
  if (postFailed) fail('Simulated post-state is not clean. Nothing was written.')
  console.log()

  // ── Report ───────────────────────────────────────────────────────────────
  const report = {
    generatedAt: new Date().toISOString(),
    mode: EXECUTE ? 'execute' : 'dry-run',
    counts: {
      documentsInDataset: docs.length,
      renamed: renames.length,
      patched: patches.length,
      touched: renames.length + patches.length,
      referencesRewritten: totalRefsRewritten,
      payloadBytes,
    },
    mapping: Object.fromEntries([...mapping].sort()),
    patchedDocuments: patches.map(({ id, type, refCount }) => ({ id, type, refCount })),
  }
  if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify(report, null, 2))
    console.log(`Report written to ${JSON_OUT}\n`)
  }

  console.log('Sample mapping')
  for (const [from, to] of [...mapping].slice(0, 6)) console.log(`  ${from.padEnd(24)} → ${to}`)
  console.log(`  … ${mapping.size - 6} more\n`)

  if (!EXECUTE) {
    console.log(line())
    console.log('🔵 DRY-RUN — nothing was written. Pass --execute to apply.')
    console.log(line())
    console.log('\nBefore executing:')
    console.log('  1. Take a dataset export:  npx sanity dataset export production')
    console.log('  2. Have a human review this report')
    console.log('  3. Phase 3 (token removal) is a separate step; do not bundle it\n')
    return
  }

  // ── Execute ──────────────────────────────────────────────────────────────
  console.log('🔴 EXECUTING in 10 seconds… (Ctrl-C to abort)\n')
  await new Promise((r) => setTimeout(r, 10_000))

  const tx = client.transaction()
  for (const r of renames) tx.createIfNotExists(r.doc)
  for (const p of patches) tx.createOrReplace(p.doc)
  for (const r of renames) tx.delete(r.from)

  console.log(`Committing ${renames.length * 2 + patches.length} mutations in one transaction…`)
  const result = await tx.commit({ visibility: 'sync' })
  console.log(`✅ Committed. ${result.results?.length ?? 0} mutations applied.\n`)
  console.log('Next: re-run this script. Pre-flight should report 0 documents in scope.')
  console.log('Then run the acceptance test:  pnpm validate:taxonomy   (with no token)\n')
}

main().catch((err) => {
  console.error('\n❌ Migration failed:', err.message)
  process.exit(1)
})
