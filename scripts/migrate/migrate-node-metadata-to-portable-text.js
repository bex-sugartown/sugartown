#!/usr/bin/env node
/**
 * migrate-node-metadata-to-portable-text.js
 *
 * Two migrations in one:
 * 1. Convert challenge/insight/actionItem from plain text to PortableText arrays
 * 2. Prepend an HR divider to the start of content[] on all nodes (visual separator
 *    between structured metadata fields and body content)
 *
 * Usage:
 *   node scripts/migrate/migrate-node-metadata-to-portable-text.js           # dry-run
 *   node scripts/migrate/migrate-node-metadata-to-portable-text.js --execute  # live run
 */

import { buildSanityClient } from './lib.js'

const EXECUTE = process.argv.includes('--execute')

/** Convert a plain string to a single-block PortableText array */
function stringToPortableText(str) {
  if (!str || typeof str !== 'string') return null

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

/** Create an HR divider block */
function makeDivider() {
  return {
    _type: 'divider',
    _key: 'hr-top',
    style: 'default',
  }
}

async function main() {
  const client = buildSanityClient()

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Node Metadata → PortableText + HR Divider Migration`)
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
  console.log(`${'═'.repeat(60)}\n`)

  if (EXECUTE) {
    console.log('⏳ Starting in 5 seconds… (Ctrl-C to abort)\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  // Fetch all nodes
  const nodes = await client.fetch(
    `*[_type == "node"]{ _id, title, challenge, insight, actionItem, "hasContent": defined(content), "firstBlockType": content[0]._type }`
  )

  console.log(`Total nodes: ${nodes.length}\n`)

  // Part 1: Metadata field migration
  const needsMetaMigration = nodes.filter(
    (n) =>
      (typeof n.challenge === 'string') ||
      (typeof n.insight === 'string') ||
      (typeof n.actionItem === 'string')
  )

  console.log(`── Part 1: Metadata fields (string → PortableText) ──`)
  console.log(`  Nodes needing migration: ${needsMetaMigration.length}\n`)

  for (const node of needsMetaMigration) {
    const fields = []
    if (typeof node.challenge === 'string') fields.push('challenge')
    if (typeof node.insight === 'string') fields.push('insight')
    if (typeof node.actionItem === 'string') fields.push('actionItem')
    console.log(`  📄 ${node.title}`)
    console.log(`     Fields: ${fields.join(', ')}\n`)
  }

  // Part 2: HR divider prepend
  const needsHR = nodes.filter(
    (n) => n.hasContent && n.firstBlockType !== 'divider'
  )

  console.log(`── Part 2: HR divider prepend ──`)
  console.log(`  Nodes with content needing HR: ${needsHR.length}`)
  console.log(`  Nodes already have HR at top: ${nodes.filter((n) => n.hasContent && n.firstBlockType === 'divider').length}`)
  console.log(`  Nodes without content: ${nodes.filter((n) => !n.hasContent).length}\n`)

  if (!EXECUTE) {
    console.log(`🔵 Dry-run complete. Run with --execute to apply changes.\n`)
    return
  }

  // Execute Part 1: Metadata migration
  console.log('🔴 Part 1: Migrating metadata fields…\n')
  let metaPatched = 0

  for (const node of needsMetaMigration) {
    const patch = {}
    if (typeof node.challenge === 'string') {
      patch.challenge = stringToPortableText(node.challenge)
    }
    if (typeof node.insight === 'string') {
      patch.insight = stringToPortableText(node.insight)
    }
    if (typeof node.actionItem === 'string') {
      patch.actionItem = stringToPortableText(node.actionItem)
    }

    try {
      await client.patch(node._id).set(patch).commit()
      metaPatched++
      console.log(`  ✅ ${node.title}`)
    } catch (err) {
      console.error(`  ❌ ${node.title}: ${err.message}`)
    }
  }

  // Execute Part 2: HR divider prepend
  console.log('\n🔴 Part 2: Prepending HR dividers…\n')
  let hrPatched = 0

  for (const node of needsHR) {
    try {
      await client
        .patch(node._id)
        .insert('before', 'content[0]', [makeDivider()])
        .commit()
      hrPatched++
      console.log(`  ✅ ${node.title}`)
    } catch (err) {
      console.error(`  ❌ ${node.title}: ${err.message}`)
    }
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`  Metadata migrated: ${metaPatched}/${needsMetaMigration.length}`)
  console.log(`  HR dividers added: ${hrPatched}/${needsHR.length}`)
  console.log(`${'─'.repeat(60)}\n`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
