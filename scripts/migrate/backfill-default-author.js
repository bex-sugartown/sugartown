#!/usr/bin/env node
/**
 * backfill-default-author.js — Phase D: Default Author Backfill
 *
 * Sets `authors[]` to [ref: wp.person.bhead] on all article, caseStudy, and
 * node documents that have no authors set. This makes the legacy `author`
 * string fallback in person.js dead code, safe to remove.
 *
 * Usage:
 *   node scripts/migrate/backfill-default-author.js           # dry-run
 *   node scripts/migrate/backfill-default-author.js --execute  # live run
 */

import { buildSanityClient } from './lib.js'

const EXECUTE = process.argv.includes('--execute')
const CONTENT_TYPES = ['article', 'caseStudy', 'node']
const DEFAULT_AUTHOR_ID = 'wp.person.bhead'

async function main() {
  const client = buildSanityClient()

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Default Author Backfill`)
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
  console.log(`  Default author: ${DEFAULT_AUTHOR_ID}`)
  console.log(`${'═'.repeat(60)}\n`)

  if (EXECUTE) {
    console.log('⏳ Starting in 5 seconds… (Ctrl-C to abort)\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  // Verify default author exists
  const authorDoc = await client.fetch(
    `*[_id == $id][0]{ _id, name, "slug": slug.current }`,
    { id: DEFAULT_AUTHOR_ID }
  )
  if (!authorDoc) {
    console.error(`❌ Default author document "${DEFAULT_AUTHOR_ID}" not found!`)
    process.exit(1)
  }
  console.log(`Default author: ${authorDoc.name} (/${authorDoc.slug})\n`)

  // Find docs with no authors
  const docs = await client.fetch(
    `*[_type in $types && (!defined(authors) || count(authors) == 0)]{ _id, _type, title }`,
    { types: CONTENT_TYPES }
  )

  console.log(`Documents needing author backfill: ${docs.length}\n`)

  if (docs.length === 0) {
    console.log('All documents already have authors. Done.\n')
    return
  }

  // Group by type for reporting
  const byType = {}
  for (const doc of docs) {
    byType[doc._type] = (byType[doc._type] || 0) + 1
  }
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`)
  }
  console.log()

  let patched = 0
  for (const doc of docs) {
    console.log(`  ${EXECUTE ? '✏️' : '🔵'} ${doc._type} — ${doc.title || doc._id}`)
    if (EXECUTE) {
      await client
        .patch(doc._id)
        .setIfMissing({ authors: [] })
        .append('authors', [{
          _ref: DEFAULT_AUTHOR_ID,
          _type: 'reference',
          _key: `author-default`
        }])
        .commit()
    }
    patched++
  }

  // Verify
  if (EXECUTE) {
    const remaining = await client.fetch(
      `count(*[_type in $types && (!defined(authors) || count(authors) == 0)])`,
      { types: CONTENT_TYPES }
    )
    console.log(`\n📊 Documents without authors after backfill: ${remaining}`)
  }

  console.log(`\n✅ ${patched} doc(s) ${EXECUTE ? 'patched' : 'would be patched'}`)
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Done. ${EXECUTE ? '' : 'Re-run with --execute to apply changes.'}`)
  console.log(`${'═'.repeat(60)}\n`)
}

main().catch((err) => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
