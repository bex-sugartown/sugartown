#!/usr/bin/env node
/**
 * migrate-ai-taxonomy.js
 *
 * Collapses three over-specific AI sub-categories into a single "AI" category,
 * preserving the specificity as tags.
 *
 * Plan:
 *   1. Create category: AI (id: category-ai, slug: ai)
 *   2. Create tags: ai-automation, ai-collaboration, ai-entropy
 *   3. For each content doc referencing an old category:
 *        - unset the old category ref
 *        - append AI category ref (if not already present)
 *        - append the corresponding new tag ref (if not already present)
 *   4. Delete the three old category docs
 *
 * Usage:
 *   node scripts/migrate/migrate-ai-taxonomy.js           # dry-run
 *   node scripts/migrate/migrate-ai-taxonomy.js --execute
 */

import { buildSanityClient } from './lib.js'
import { randomBytes } from 'crypto'

const EXECUTE = process.argv.includes('--execute')

function nanoid() {
  return randomBytes(8).toString('hex')
}

const AI_CATEGORY_ID = 'category-ai'

const OLD_TO_NEW = {
  '17ccdd54-52cd-4dcf-b875-97f744dcd4bc': { slug: 'ai-entropy',       tagId: 'tag-ai-entropy' },
  'wp.category.293':                       { slug: 'ai-automation',    tagId: 'tag-ai-automation' },
  'wp.category.444':                       { slug: 'ai-collaboration', tagId: 'tag-ai-collaboration' },
}

const NEW_TAGS = [
  { _id: 'tag-ai-entropy',       name: 'AI Entropy',       slug: 'ai-entropy' },
  { _id: 'tag-ai-automation',    name: 'AI Automation',    slug: 'ai-automation' },
  { _id: 'tag-ai-collaboration', name: 'AI Collaboration', slug: 'ai-collaboration' },
]

async function main() {
  const client = buildSanityClient()

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  AI Taxonomy Migration`)
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
  console.log(`${'═'.repeat(60)}\n`)

  if (EXECUTE) {
    console.log('⏳ Starting in 5 seconds… (Ctrl-C to abort)\n')
    await new Promise(r => setTimeout(r, 5000))
  }

  // ── 1. Upsert AI category ────────────────────────────────────────────────────
  const existingAI = await client.fetch(`*[_id == $id][0]`, { id: AI_CATEGORY_ID })
  if (existingAI) {
    console.log(`  ✓ Category "AI" already exists`)
  } else {
    console.log(`  + Create category: AI (${AI_CATEGORY_ID})`)
    if (EXECUTE) {
      await client.createOrReplace({
        _id: AI_CATEGORY_ID,
        _type: 'category',
        name: 'AI',
        slug: { _type: 'slug', current: 'ai' },
      })
    }
  }

  // ── 2. Upsert new tags ───────────────────────────────────────────────────────
  const resolvedTagIds = {}
  for (const tag of NEW_TAGS) {
    const existing = await client.fetch(
      `*[_type == "tag" && slug.current == $slug][0]{ _id }`,
      { slug: tag.slug }
    )
    if (existing) {
      console.log(`  ✓ Tag "${tag.slug}" already exists (${existing._id})`)
      resolvedTagIds[tag.slug] = existing._id
    } else {
      console.log(`  + Create tag: ${tag.name} (${tag._id})`)
      resolvedTagIds[tag.slug] = tag._id
      if (EXECUTE) {
        await client.createOrReplace({
          _id: tag._id,
          _type: 'tag',
          name: tag.name,
          slug: { _type: 'slug', current: tag.slug },
        })
      }
    }
  }

  // ── 3. Migrate content docs ──────────────────────────────────────────────────
  const oldIds = Object.keys(OLD_TO_NEW)
  const refFilter = oldIds.map(id => `references("${id}")`).join(' || ')

  const docs = await client.fetch(
    `*[_type in ["article", "node", "caseStudy"] && (${refFilter})]{
      _id, _type, title,
      "categories": categories[]{ _key, _ref },
      "tags": tags[]{ _key, _ref }
    }`,
    {},
    { perspective: 'raw' }
  )

  console.log(`\n  Found ${docs.length} content docs to migrate\n`)

  let patched = 0
  for (const doc of docs) {
    const oldCatItems = (doc.categories ?? []).filter(c => OLD_TO_NEW[c._ref])
    if (!oldCatItems.length) continue

    const existingCatRefs = new Set((doc.categories ?? []).map(c => c._ref))
    const existingTagRefs  = new Set((doc.tags ?? []).map(t => t._ref))

    console.log(`  ${doc._id.padEnd(24)} "${(doc.title ?? '').slice(0, 45)}"`)

    for (const oldItem of oldCatItems) {
      const { slug, tagId } = OLD_TO_NEW[oldItem._ref]
      const resolvedTagId = resolvedTagIds[slug]
      const needsAI  = !existingCatRefs.has(AI_CATEGORY_ID)
      const needsTag = !existingTagRefs.has(resolvedTagId)

      console.log(`    - unset category: ${slug}`)
      if (needsAI)  console.log(`    + append category: AI`)
      if (needsTag) console.log(`    + append tag: ${slug}`)

      if (EXECUTE) {
        let patch = client.patch(doc._id)
          .unset([`categories[_key=="${oldItem._key}"]`])

        if (needsAI) {
          patch = patch.append('categories', [{
            _type: 'reference', _ref: AI_CATEGORY_ID, _key: nanoid(),
          }])
        }
        if (needsTag) {
          patch = patch.append('tags', [{
            _type: 'reference', _ref: resolvedTagId, _key: nanoid(),
          }])
        }

        await patch.commit()
        existingCatRefs.add(AI_CATEGORY_ID)
        existingTagRefs.add(resolvedTagId)
      }

      patched++
    }
  }

  // ── 4. Delete old categories ─────────────────────────────────────────────────
  console.log(`\n  Deleting 3 old AI sub-categories…`)
  for (const [id, { slug }] of Object.entries(OLD_TO_NEW)) {
    console.log(`  - ${slug} (${id})`)
    if (EXECUTE) {
      try {
        await client.delete(id)
        console.log(`    ✓ Deleted`)
      } catch (err) {
        if (err.statusCode === 409) {
          console.warn(`    ⚠️  Still has references — skipping`)
        } else {
          throw err
        }
      }
    }
  }

  console.log(`\n  Summary: ${patched} patch(es) applied`)
  console.log(`\n${'═'.repeat(60)}\n  Done.\n${'═'.repeat(60)}\n`)
}

main().catch(err => { console.error(err); process.exit(1) })
