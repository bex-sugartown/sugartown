#!/usr/bin/env node
/**
 * cleanup-orphan-tags.js — Phase C: Delete Zero-Reference Tags
 *
 * Finds all tag documents with zero content references and deletes them.
 * Run AFTER cleanup-tag-tool-duplicates.js (Phase B) so that migrated refs
 * are already moved, making the former duplicate tags show zero refs.
 *
 * Uses perspective:'raw' to check for draft references as well, preventing
 * deletion of tags referenced only by unpublished drafts.
 *
 * Usage:
 *   node scripts/migrate/cleanup-orphan-tags.js           # dry-run
 *   node scripts/migrate/cleanup-orphan-tags.js --execute  # live run
 */

import { buildSanityClient } from './lib.js'

const EXECUTE = process.argv.includes('--execute')
const CONTENT_TYPES = ['article', 'caseStudy', 'node']

async function main() {
  const client = buildSanityClient()

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Orphan Tag Cleanup`)
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
  console.log(`${'═'.repeat(60)}\n`)

  if (EXECUTE) {
    console.log('⏳ Starting in 5 seconds… (Ctrl-C to abort)\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  // Get all tags
  const allTags = await client.fetch(
    `*[_type == "tag"]{ _id, "slug": slug.current, "name": name }`
  )
  console.log(`Total tags: ${allTags.length}\n`)

  // For each tag, check if ANY document references it (all doc types)
  const orphans = []
  for (const tag of allTags) {
    const refCount = await client.fetch(
      `count(*[references($tagId)])`,
      { tagId: tag._id }
    )
    if (refCount === 0) {
      orphans.push(tag)
    }
  }

  console.log(`Orphan tags (0 references): ${orphans.length}`)
  console.log(`Tags with references: ${allTags.length - orphans.length}\n`)

  if (orphans.length === 0) {
    console.log('No orphan tags to delete. Done.\n')
    return
  }

  // List orphans
  console.log('Orphan tags to delete:')
  for (const tag of orphans.sort((a, b) => (a.slug || '').localeCompare(b.slug || ''))) {
    console.log(`  • ${tag.slug || tag.name || tag._id}`)
  }

  if (EXECUTE) {
    console.log(`\nDeleting ${orphans.length} orphan tags...`)
    let deleted = 0
    let skipped = 0
    for (const tag of orphans) {
      try {
        await client.delete(tag._id)
        deleted++
      } catch (err) {
        if (err.statusCode === 409) {
          console.log(`  ⚠️  Skipped "${tag.slug}" (${tag._id}) — still has references`)
          skipped++
        } else {
          throw err
        }
      }
    }
    console.log(`  Deleted: ${deleted}, Skipped: ${skipped}`)
  }

  // Verify
  if (EXECUTE) {
    const remaining = await client.fetch(`count(*[_type == "tag"])`)
    console.log(`\n📊 Remaining tags after cleanup: ${remaining}`)
  }

  console.log(`\n✅ ${orphans.length} orphan tag(s) ${EXECUTE ? 'deleted' : 'would be deleted'}`)
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Done. ${EXECUTE ? '' : 'Re-run with --execute to apply changes.'}`)
  console.log(`${'═'.repeat(60)}\n`)
}

main().catch((err) => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
