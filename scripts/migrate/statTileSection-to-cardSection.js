#!/usr/bin/env node
/**
 * statTileSection-to-cardSection.js — SUG-151 schema rename migration
 *
 * Renames all sections[]{_type: "statTileSection"} to _type: "cardSection"
 * across page, article, caseStudy, and node documents.
 *
 * Pre-flight count (run before executing):
 *   count(*[_type in ["page","article","caseStudy","node"] && "statTileSection" in sections[]._type])
 *   Expected: 10
 *
 * Usage:
 *   node scripts/migrate/statTileSection-to-cardSection.js           # dry-run
 *   node scripts/migrate/statTileSection-to-cardSection.js --execute  # live run
 */

import { buildSanityClient } from './lib.js'

const EXECUTE = process.argv.includes('--execute')
const CONTENT_TYPES = ['page', 'article', 'caseStudy', 'node']

async function main() {
  const client = buildSanityClient()

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  statTileSection → cardSection migration`)
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
  console.log(`${'═'.repeat(60)}\n`)

  if (EXECUTE) {
    console.log('⏳ Starting in 5 seconds… (Ctrl-C to abort)\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  // Fetch all docs with at least one statTileSection
  const docs = await client.fetch(
    `*[_type in $types && "statTileSection" in sections[]._type]{
      _id,
      _type,
      "title": coalesce(title, name, _id),
      "sections": sections[]{_key, _type}
    }`,
    { types: CONTENT_TYPES }
  )

  console.log(`Documents with statTileSection: ${docs.length}\n`)

  if (docs.length === 0) {
    console.log('No documents to migrate. Done.\n')
    return
  }

  let patched = 0
  let sectionCount = 0

  for (const doc of docs) {
    const statTileSections = doc.sections.filter(s => s._type === 'statTileSection')
    sectionCount += statTileSections.length
    console.log(`  ${EXECUTE ? '✏️' : '🔵'} ${doc._type} — ${doc.title} (${statTileSections.length} section(s))`)

    if (EXECUTE) {
      // Patch each statTileSection individually by key
      for (const section of statTileSections) {
        await client
          .patch(doc._id)
          .set({ [`sections[_key=="${section._key}"]._type`]: 'cardSection' })
          .commit()
      }
    }
    patched++
  }

  console.log(`\n📊 Summary: ${patched} doc(s), ${sectionCount} section(s) ${EXECUTE ? 'patched' : 'would be patched'}`)

  // Idempotency verification (only after execute)
  if (EXECUTE) {
    const remaining = await client.fetch(
      `count(*[_type in $types && "statTileSection" in sections[]._type])`,
      { types: CONTENT_TYPES }
    )
    if (remaining === 0) {
      console.log('✅ Idempotency check passed — 0 statTileSection entries remaining')
    } else {
      console.log(`⚠️  ${remaining} statTileSection entries still present — re-run to patch`)
    }
  }

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Done. ${EXECUTE ? '' : 'Re-run with --execute to apply changes.'}`)
  console.log(`${'═'.repeat(60)}\n`)
}

main().catch((err) => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
