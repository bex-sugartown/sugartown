/**
 * fix-richimage-refs.js
 *
 * Fixes richImage blocks where the `asset` field was stored as a direct
 * reference ({ _ref, _type: 'reference' }) instead of the correct image
 * object ({ _type: 'image', asset: { _ref, _type: 'reference' } }).
 *
 * This causes Studio to show the Image field as empty even though the
 * image renders in the PT preview and on the frontend.
 *
 * Affected documents (from audit):
 *   - wp.caseStudy.388 (Prestige Beauty Pilot) — key 0ln2p3fub
 *   - wp.caseStudy.166 (Beauty Retail) — key henflzbfz
 *
 * Usage: node scripts/migrate/fix-richimage-refs.js [--dry-run]
 */

import { createClient } from '@sanity/client'

const DRY_RUN = process.argv.includes('--dry-run')

const client = createClient({
  projectId: 'poalmzla',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
})

const FIXES = [
  {
    docId: 'wp.caseStudy.388',
    sectionKey: 'ts_388',
    imageKey: '0ln2p3fub',
    ref: 'image-b38a894e86773a1488a66137e8362f50070086b0-817x602-png',
    title: 'Prestige Beauty Pilot',
  },
  {
    docId: 'wp.caseStudy.166',
    sectionKey: 'ts_166',
    imageKey: 'henflzbfz',
    ref: 'image-1d713b04049019d8cb62eba71f2a9fac9c0d1866-1318x308-png',
    title: 'Beauty Retail: From Monolith to Microservice',
  },
]

async function fixDocument(fix) {
  const { docId, sectionKey, imageKey, ref, title } = fix

  // Fix both published and draft versions
  for (const id of [docId, `drafts.${docId}`]) {
    const doc = await client.getDocument(id)
    if (!doc) {
      console.log(`  ${id}: not found, skipping`)
      continue
    }

    // Find the section and richImage block
    const section = doc.sections?.find((s) => s._key === sectionKey)
    if (!section) {
      console.log(`  ${id}: section ${sectionKey} not found, skipping`)
      continue
    }

    const block = section.content?.find(
      (b) => b._key === imageKey && b._type === 'richImage'
    )
    if (!block) {
      console.log(`  ${id}: richImage ${imageKey} not found, skipping`)
      continue
    }

    // Check if already correct
    if (block.asset?._type === 'image' && block.asset?.asset?._ref) {
      console.log(`  ${id}: already correct, skipping`)
      continue
    }

    // Check if it has the broken direct ref
    if (block.asset?._ref && block.asset?._type === 'reference') {
      console.log(`  ${id}: found direct ref ${block.asset._ref}`)

      if (DRY_RUN) {
        console.log(`  ${id}: DRY RUN — would fix to nested image object`)
        continue
      }

      // Use transaction: unset the broken field, then set the correct one
      const path = `sections[_key=="${sectionKey}"].content[_key=="${imageKey}"].asset`
      await client
        .patch(id)
        .unset([path])
        .commit({ autoGenerateArrayKeys: true })

      await client
        .patch(id)
        .set({
          [path]: {
            _type: 'image',
            asset: { _ref: ref, _type: 'reference' },
          },
        })
        .commit({ autoGenerateArrayKeys: true })

      console.log(`  ${id}: fixed`)
    } else {
      console.log(`  ${id}: unexpected shape, skipping:`, JSON.stringify(block.asset))
    }
  }
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE RUN ===')
  console.log()

  for (const fix of FIXES) {
    console.log(`Fixing: ${fix.title} (${fix.docId})`)
    await fixDocument(fix)
    console.log()
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
