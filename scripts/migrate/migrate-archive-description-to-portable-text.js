#!/usr/bin/env node
/**
 * migrate-archive-description-to-portable-text.js
 *
 * Converts archivePage.description from plain string to PortableText array.
 * SUG-11 changed the schema field type but existing data was not migrated.
 *
 * Usage:
 *   node scripts/migrate/migrate-archive-description-to-portable-text.js           # dry-run
 *   node scripts/migrate/migrate-archive-description-to-portable-text.js --execute  # live run
 */

import { buildSanityClient } from './lib.js'

const EXECUTE = process.argv.includes('--execute')

/**
 * Convert a plain string to a minimal PortableText array.
 * Splits on double newlines to create separate block paragraphs.
 */
function stringToPortableText(str) {
  if (!str) return []

  const paragraphs = str.split(/\n\n+/).filter(Boolean)

  return paragraphs.map((text, i) => ({
    _type: 'block',
    _key: `migrated-${i}`,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: `span-${i}`,
        text: text.trim(),
        marks: [],
      },
    ],
  }))
}

async function main() {
  const client = buildSanityClient()

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Archive Description → PortableText Migration`)
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
  console.log(`${'═'.repeat(60)}\n`)

  if (EXECUTE) {
    console.log('⏳ Starting in 5 seconds… (Ctrl-C to abort)\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  // Find archive pages where description is a string (not already an array)
  // We fetch all and check client-side since GROQ can't easily check field type
  const docs = await client.fetch(
    `*[_type == "archivePage" && defined(description)]{ _id, title, "slug": slug.current, description }`
  )

  // Filter to only those where description is a string (not already migrated)
  const toMigrate = docs.filter((doc) => typeof doc.description === 'string')

  console.log(`Archive pages with string description: ${toMigrate.length}`)
  console.log(`Archive pages already migrated: ${docs.length - toMigrate.length}\n`)

  if (toMigrate.length === 0) {
    console.log('All descriptions are already PortableText arrays. Done.\n')
    return
  }

  for (const doc of toMigrate) {
    const blocks = stringToPortableText(doc.description)
    console.log(`  📄 ${doc.title} (/${doc.slug})`)
    console.log(`     Current: "${doc.description.substring(0, 80)}…"`)
    console.log(`     → ${blocks.length} PortableText block(s)\n`)
  }

  if (!EXECUTE) {
    console.log(`🔵 Dry-run complete. Run with --execute to migrate ${toMigrate.length} documents.\n`)
    return
  }

  // Execute
  console.log('🔴 Applying patches…\n')
  let patched = 0

  for (const doc of toMigrate) {
    const blocks = stringToPortableText(doc.description)
    try {
      await client
        .patch(doc._id)
        .set({ description: blocks })
        .commit()
      patched++
      console.log(`  ✅ ${doc.title}`)
    } catch (err) {
      console.error(`  ❌ ${doc.title}: ${err.message}`)
    }
  }

  console.log(`\nPatched: ${patched}/${toMigrate.length} documents.\n`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
