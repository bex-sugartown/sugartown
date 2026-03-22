#!/usr/bin/env node
/**
 * migrate-richImage-linkUrl-to-linkItem.js
 *
 * Backfills richImage.linkUrl → richImage.link (linkItem object).
 * Converts bare URL values into structured linkItem objects:
 *   { _type: 'linkItem', type: 'external', externalUrl: linkUrl, openInNewTab: false }
 *
 * Scope: sections[].images[].linkUrl on page, article, caseStudy, node documents.
 *
 * Usage:
 *   node scripts/migrate/migrate-richImage-linkUrl-to-linkItem.js           # dry-run
 *   node scripts/migrate/migrate-richImage-linkUrl-to-linkItem.js --execute  # live run
 *
 * Idempotency: Skips images where `link` is already defined.
 * Safety: Does not delete linkUrl — kept for backward compat.
 */

import { buildSanityClient } from './lib.js'

const EXECUTE = process.argv.includes('--execute')
const CONTENT_TYPES = ['page', 'article', 'caseStudy', 'node']

async function main() {
  const client = buildSanityClient()

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  richImage linkUrl → linkItem Migration`)
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
  console.log(`${'═'.repeat(60)}\n`)

  if (EXECUTE) {
    console.log('⏳ Starting in 5 seconds… (Ctrl-C to abort)\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  // Find documents with richImage objects that have linkUrl set
  // We need to look inside sections[].images[] for imageGallery sections
  const query = `*[
    _type in $types &&
    defined(sections) &&
    count(sections[_type == "imageGallery"].images[defined(linkUrl) && !defined(link)]) > 0
  ]{
    _id,
    _type,
    title,
    "galleries": sections[_type == "imageGallery"]{
      _key,
      "images": images[defined(linkUrl) && !defined(link)]{
        _key,
        linkUrl
      }
    }
  }`

  const docs = await client.fetch(query, { types: CONTENT_TYPES })

  // Count total images to migrate
  let totalImages = 0
  for (const doc of docs) {
    for (const gallery of doc.galleries || []) {
      totalImages += (gallery.images || []).length
    }
  }

  console.log(`Documents with linkUrl to migrate: ${docs.length}`)
  console.log(`Total images to migrate: ${totalImages}\n`)

  if (totalImages === 0) {
    console.log('No images need migration. Done.\n')
    return
  }

  // Report what we'll do
  for (const doc of docs) {
    console.log(`  📄 [${doc._type}] ${doc.title || doc._id}`)
    for (const gallery of doc.galleries || []) {
      for (const img of gallery.images || []) {
        console.log(`     → Image ${img._key}: ${img.linkUrl}`)
      }
    }
  }

  if (!EXECUTE) {
    console.log(`\n🔵 Dry-run complete. Run with --execute to apply ${totalImages} patches.\n`)
    return
  }

  // Execute patches
  console.log('\n🔴 Applying patches…\n')
  let patched = 0
  let errors = 0

  for (const doc of docs) {
    try {
      let transaction = client.transaction()

      for (const gallery of doc.galleries || []) {
        for (const img of gallery.images || []) {
          // Build the path to the specific image in the sections array
          // We use the section _key and image _key for precise targeting
          const path = `sections[_key=="${gallery._key}"].images[_key=="${img._key}"].link`

          transaction = transaction.patch(doc._id, (p) =>
            p.setIfMissing({
              [path]: {
                _type: 'linkItem',
                type: 'external',
                externalUrl: img.linkUrl,
                openInNewTab: false,
              },
            })
          )
          patched++
        }
      }

      await transaction.commit()
      console.log(`  ✅ ${doc._type}/${doc._id} — ${doc.galleries.reduce((n, g) => n + g.images.length, 0)} images`)
    } catch (err) {
      errors++
      console.error(`  ❌ ${doc._type}/${doc._id}: ${err.message}`)
    }
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`  Patched: ${patched} images across ${docs.length} documents`)
  if (errors > 0) console.log(`  Errors: ${errors}`)
  console.log(`${'─'.repeat(60)}\n`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
