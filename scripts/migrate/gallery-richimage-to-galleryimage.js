/**
 * gallery-richimage-to-galleryimage.js
 *
 * Migrates gallery image array items from _type: 'richImage' to _type: 'galleryImage'.
 * The galleryImage schema is identical to richImage but omits the per-image overlay field.
 * Also strips any existing overlay data from gallery images.
 *
 * Usage: node scripts/migrate/gallery-richimage-to-galleryimage.js [--dry-run]
 */

import { createClient } from '@sanity/client'

const DRY_RUN = process.argv.includes('--dry-run')

// Token sourced from Sanity CLI auth (sanity debug --secrets)
const token = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_TOKEN

if (!token) {
  console.error('Set SANITY_AUTH_TOKEN or SANITY_TOKEN env var.')
  console.error('Hint: export SANITY_AUTH_TOKEN=$(sanity debug --secrets 2>&1 | grep "Auth token" | head -1 | sed "s/.*\'\\(.*\\)\'.*/\\1/")')
  process.exit(1)
}

const client = createClient({
  projectId: 'poalmzla',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

async function migrate() {
  // Find all documents with sections (simple filter, check images in JS)
  const docs = await client.fetch(`
    *[defined(sections) && count(sections[_type == "imageGallery"]) > 0]{
      _id,
      _type
    }
  `)

  console.log(`Found ${docs.length} documents with richImage gallery items`)
  if (docs.length === 0) {
    console.log('Nothing to migrate.')
    return
  }

  for (const doc of docs) {
    // Check both published and draft versions
    const idsToCheck = [doc._id]
    if (!doc._id.startsWith('drafts.')) {
      idsToCheck.push(`drafts.${doc._id}`)
    }

    for (const docId of idsToCheck) {
      // Verify the document exists
      const exists = await client.fetch(`defined(*[_id == $id][0])`, { id: docId })
      if (!exists) continue

      const fullDoc = await client.fetch(`*[_id == $id][0]`, { id: docId })
      if (!fullDoc?.sections) continue

      let patchNeeded = false
      const patches = []

      for (const section of fullDoc.sections) {
        if (section._type !== 'imageGallery' || !section.images) continue

        for (const image of section.images) {
          if (image._type === 'richImage') {
            patchNeeded = true
            const path = `sections[_key=="${section._key}"].images[_key=="${image._key}"]`

            // Change _type to galleryImage
            patches.push({ set: { [`${path}._type`]: 'galleryImage' } })

            // Strip overlay if present
            if (image.overlay) {
              patches.push({ unset: [`${path}.overlay`] })
            }
          }
        }
      }

      if (!patchNeeded) continue

      console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}${docId} (${fullDoc._type}):`)
      console.log(`  ${patches.length} patch operations`)

      if (!DRY_RUN) {
        let tx = client.transaction()
        for (const p of patches) {
          if (p.set) tx = tx.patch(docId, { set: p.set })
          if (p.unset) tx = tx.patch(docId, { unset: p.unset })
        }
        const result = await tx.commit()
        console.log(`  ✅ Committed (txn: ${result.transactionId})`)
      }
    }
  }

  console.log(`\n${DRY_RUN ? 'Dry run complete.' : 'Migration complete.'}`)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
