#!/usr/bin/env node
/**
 * migrate-node-content-to-sections.js
 *
 * Migrates the legacy `content` PortableText field on node documents
 * into a textSection inside the `sections[]` array.
 *
 * Strategy:
 * - Nodes with content + no sections: wrap content into a textSection, set as sections[0]
 * - Nodes with content + existing sections: prepend content as textSection before existing sections
 * - Nodes with no content: skip
 *
 * After migration, the `content` field is unset (cleaned up).
 * The frontend already renders sections via PageSections.jsx.
 *
 * Usage:
 *   node scripts/migrate/migrate-node-content-to-sections.js           # dry-run
 *   node scripts/migrate/migrate-node-content-to-sections.js --execute  # live run
 */

import { buildSanityClient } from './lib.js'

const EXECUTE = process.argv.includes('--execute')

function makeTextSection(content) {
  return {
    _type: 'textSection',
    _key: 'migrated-content',
    // No heading — the content blocks contain their own headings
    content,
  }
}

async function main() {
  const client = buildSanityClient()

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Node Legacy content → sections[] Migration`)
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
  console.log(`${'═'.repeat(60)}\n`)

  if (EXECUTE) {
    console.log('⏳ Starting in 5 seconds… (Ctrl-C to abort)\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  // Fetch all nodes with the legacy content field
  const nodes = await client.fetch(
    `*[_type == "node" && defined(content)]{
      _id,
      title,
      content,
      "sectionCount": count(sections),
      "hasSections": defined(sections) && count(sections) > 0
    }`
  )

  if (nodes.length === 0) {
    console.log('No nodes have legacy content field. Nothing to migrate.\n')
    return
  }

  const contentOnly = nodes.filter((n) => !n.hasSections)
  const contentAndSections = nodes.filter((n) => n.hasSections)

  console.log(`Nodes with legacy content field: ${nodes.length}`)
  console.log(`  Content only (no sections): ${contentOnly.length}`)
  console.log(`  Content + existing sections: ${contentAndSections.length}\n`)

  // Report
  for (const node of contentOnly) {
    console.log(`  📄 [content only] ${node.title}`)
    console.log(`     → Will create sections[] with 1 textSection\n`)
  }

  for (const node of contentAndSections) {
    console.log(`  📄 [content + ${node.sectionCount} sections] ${node.title}`)
    console.log(`     → Will prepend textSection before existing ${node.sectionCount} sections\n`)
  }

  if (!EXECUTE) {
    console.log(`🔵 Dry-run complete. Run with --execute to migrate ${nodes.length} nodes.\n`)
    return
  }

  // Execute
  console.log('🔴 Migrating…\n')
  let patched = 0
  let errors = 0

  for (const node of nodes) {
    const textSection = makeTextSection(node.content)

    try {
      if (node.hasSections) {
        // Prepend before existing sections
        await client
          .patch(node._id)
          .insert('before', 'sections[0]', [textSection])
          .unset(['content'])
          .commit()
      } else {
        // Create sections array with the textSection
        await client
          .patch(node._id)
          .set({ sections: [textSection] })
          .unset(['content'])
          .commit()
      }
      patched++
      console.log(`  ✅ ${node.title}`)
    } catch (err) {
      errors++
      console.error(`  ❌ ${node.title}: ${err.message}`)
    }
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`  Migrated: ${patched}/${nodes.length}`)
  if (errors > 0) console.log(`  Errors: ${errors}`)
  console.log(`${'─'.repeat(60)}\n`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
