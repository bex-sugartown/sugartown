#!/usr/bin/env node
/**
 * cleanup-tag-tool-duplicates.js — Phase B: Tag-Tool Duplicate Resolution
 *
 * Resolves tag-tool duplicates where the same concept exists as both a tag
 * and a tool. For 4 duplicates that have content references on the tag side,
 * migrates those refs to the corresponding tool. Then deletes all 25 duplicate
 * tags (including the 21 with zero refs).
 *
 * Usage:
 *   node scripts/migrate/cleanup-tag-tool-duplicates.js           # dry-run
 *   node scripts/migrate/cleanup-tag-tool-duplicates.js --execute  # live run
 */

import { buildSanityClient } from './lib.js'

const EXECUTE = process.argv.includes('--execute')
// All doc types that may reference tags (content + taxonomy)
const ALL_REF_TYPES = ['article', 'caseStudy', 'node', 'project', 'page', 'archivePage']

// ─── Tag-tool duplicate pairs (all 25) ─────────────────────────────────────
// Only the 4 marked 'migrate' have content refs that need moving.
// The rest have 0 tag refs and can be deleted directly.

const DUPLICATE_PAIRS = [
  { tagSlug: 'aem',          toolSlug: 'aem',          action: 'delete' },
  { tagSlug: 'acquia',       toolSlug: 'acquia',       action: 'delete' },
  { tagSlug: 'apple',        toolSlug: 'apple',        action: 'delete' },
  { tagSlug: 'celum',        toolSlug: 'celum',        action: 'delete' },
  { tagSlug: 'chatgpt',      toolSlug: 'chatgpt',      action: 'delete' },
  { tagSlug: 'claude',       toolSlug: 'claude',       action: 'delete' },
  { tagSlug: 'claude-code',  toolSlug: 'claude-code',  action: 'migrate' },
  { tagSlug: 'codex',        toolSlug: 'codex',        action: 'delete' },
  { tagSlug: 'contentful',   toolSlug: 'contentful',   action: 'delete' },
  { tagSlug: 'css',          toolSlug: 'css',           action: 'migrate' },
  { tagSlug: 'drupal',       toolSlug: 'drupal',       action: 'delete' },
  { tagSlug: 'figma',        toolSlug: 'figma',        action: 'delete' },
  { tagSlug: 'gemini',       toolSlug: 'gemini',       action: 'delete' },
  { tagSlug: 'git',          toolSlug: 'git',           action: 'delete' },
  { tagSlug: 'github',       toolSlug: 'github',       action: 'delete' },
  { tagSlug: 'linear',       toolSlug: 'linear',       action: 'delete' },
  { tagSlug: 'matplotlib',   toolSlug: 'matplotlib',   action: 'delete' },
  { tagSlug: 'mermaid',      toolSlug: 'mermaid',      action: 'delete' },
  { tagSlug: 'networkx',     toolSlug: 'networkx',     action: 'delete' },
  { tagSlug: 'oracle-atg',   toolSlug: 'oracle-atg',   action: 'delete' },
  { tagSlug: 'python',       toolSlug: 'python',       action: 'delete' },
  { tagSlug: 'react',        toolSlug: 'react',        action: 'migrate' },
  { tagSlug: 'sanity',       toolSlug: 'sanity',       action: 'delete' },
  { tagSlug: 'shopify',      toolSlug: 'shopify',      action: 'delete' },
  { tagSlug: 'storybook',    toolSlug: 'storybook',    action: 'migrate' },
]

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const client = buildSanityClient()

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Tag-Tool Duplicate Cleanup`)
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
  console.log(`${'═'.repeat(60)}\n`)

  if (EXECUTE) {
    console.log('⏳ Starting in 5 seconds… (Ctrl-C to abort)\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  // ── Step 1: Resolve tag and tool IDs ────────────────────────────────────
  const allTagSlugs = DUPLICATE_PAIRS.map((p) => p.tagSlug)
  const allToolSlugs = DUPLICATE_PAIRS.map((p) => p.toolSlug)

  const tags = await client.fetch(
    `*[_type == "tag" && slug.current in $slugs]{ _id, "slug": slug.current }`,
    { slugs: allTagSlugs }
  )
  const tools = await client.fetch(
    `*[_type == "tool" && slug.current in $slugs]{ _id, "slug": slug.current }`,
    { slugs: allToolSlugs }
  )

  const tagBySlug = Object.fromEntries(tags.map((t) => [t.slug, t._id]))
  const toolBySlug = Object.fromEntries(tools.map((t) => [t.slug, t._id]))

  console.log(`Found ${tags.length} / ${DUPLICATE_PAIRS.length} duplicate tags`)
  console.log(`Found ${tools.length} / ${DUPLICATE_PAIRS.length} matching tools\n`)

  // ── Step 2: Remove tag refs from ALL docs, migrate to tool where applicable ──
  let totalPatched = 0

  for (const pair of DUPLICATE_PAIRS) {
    const tagId = tagBySlug[pair.tagSlug]
    const toolId = toolBySlug[pair.toolSlug]

    if (!tagId) continue

    // Find ALL docs that reference this tag (any doc type)
    const docs = await client.fetch(
      `*[references($tagId)]{ _id, _type, "hasToolRef": references($toolId) }`,
      { tagId, toolId: toolId || '__none__' }
    )

    if (docs.length === 0) continue
    console.log(`── ${pair.tagSlug}: ${docs.length} doc(s) referencing tag`)

    for (const doc of docs) {
      if (doc.hasToolRef || !toolId) {
        // Already has the tool ref or no tool to migrate to — just remove the tag ref
        console.log(`  ${doc._id} (${doc._type}) — removing tag ref`)
        if (EXECUTE) {
          await client
            .patch(doc._id)
            .unset([`tags[_ref=="${tagId}"]`])
            .commit()
        }
      } else {
        // Add tool ref, remove tag ref
        console.log(`  ${doc._id} (${doc._type}) — adding tool ref + removing tag ref`)
        if (EXECUTE) {
          await client
            .patch(doc._id)
            .setIfMissing({ tools: [] })
            .append('tools', [{ _ref: toolId, _type: 'reference', _key: `tool-${pair.toolSlug}` }])
            .unset([`tags[_ref=="${tagId}"]`])
            .commit()
        }
      }
      totalPatched++
    }
  }

  console.log(`\n✅ Ref migration: ${totalPatched} doc(s) ${EXECUTE ? 'patched' : 'would be patched'}\n`)

  // ── Step 3: Delete all 25 duplicate tag documents ─────────────────────
  const tagIdsToDelete = DUPLICATE_PAIRS
    .map((p) => tagBySlug[p.tagSlug])
    .filter(Boolean)

  console.log(`── Deleting ${tagIdsToDelete.length} duplicate tag documents`)

  if (EXECUTE) {
    let deleted = 0
    let skipped = 0
    for (const id of tagIdsToDelete) {
      try {
        await client.delete(id)
        deleted++
      } catch (err) {
        if (err.statusCode === 409) {
          // Still has references — skip and report
          const slug = DUPLICATE_PAIRS.find((p) => tagBySlug[p.tagSlug] === id)?.tagSlug
          console.log(`  ⚠️  Skipped "${slug}" (${id}) — still has references`)
          skipped++
        } else {
          throw err
        }
      }
    }
    console.log(`  Deleted: ${deleted}, Skipped (still referenced): ${skipped}`)
  }

  console.log(`\n✅ Tag deletion: ${tagIdsToDelete.length} tag(s) ${EXECUTE ? 'deleted' : 'would be deleted'}`)

  // ── Step 4: Verify ────────────────────────────────────────────────────
  if (EXECUTE) {
    const remaining = await client.fetch(`count(*[_type == "tag"])`)
    console.log(`\n📊 Remaining tags: ${remaining}`)
  }

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Done. ${EXECUTE ? '' : 'Re-run with --execute to apply changes.'}`)
  console.log(`${'═'.repeat(60)}\n`)
}

main().catch((err) => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
