#!/usr/bin/env node
/**
 * fix-richimage-asset-refs.js
 *
 * Fixes malformed richImage.asset data from the WordPress migration.
 *
 * Problem: richImage.asset should be { _type: 'image', asset: { _ref, _type: 'reference' } }
 * but the WP migration stored it as a flat reference { _ref, _type: 'reference' }.
 * This causes "Key 'asset' not allowed in ref" errors when editing in Studio.
 *
 * Checks three locations per document:
 *   1. sections[].content[] — current PT content (textSection bodies)
 *   2. content[] — legacy/deprecated PT content field
 *   3. featuredImage — legacy top-level image field
 *
 * Fix: Wrap each flat reference in the correct image type structure.
 *
 * Usage:
 *   node scripts/migrate/fix-richimage-asset-refs.js          # dry-run
 *   node scripts/migrate/fix-richimage-asset-refs.js --execute # apply patches
 */

import { buildSanityClient } from './lib.js'

const EXECUTE = process.argv.includes('--execute')
const client = buildSanityClient()

console.log('═'.repeat(60))
console.log('  richImage.asset Reference Fix')
console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
console.log('═'.repeat(60))

if (EXECUTE) {
  console.log('\n⏳ Starting in 5 seconds… (Ctrl-C to abort)')
  await new Promise(r => setTimeout(r, 5000))
}

// Find all documents that have ANY richImage with a flat asset reference
// across sections content, legacy content, or featuredImage
const query = `*[
  defined(sections[].content[_type == "richImage" && asset._type == "reference"])
  || defined(content[_type == "richImage" && asset._type == "reference"])
  || (featuredImage._type == "richImage" && featuredImage.asset._type == "reference")
]{
  _id,
  _type,
  title
}`

const docs = await client.fetch(query)
console.log(`\nFound ${docs.length} documents to check\n`)

let patched = 0
let imageCount = 0
let errors = 0

/**
 * Fix a richImage block's asset field if it's a flat reference.
 * Returns the fixed block and whether it was changed.
 */
function fixRichImageAsset(block) {
  if (block._type !== 'richImage') return { block, changed: false }
  if (!block.asset || block.asset._type !== 'reference') return { block, changed: false }

  return {
    block: {
      ...block,
      asset: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: block.asset._ref
        }
      }
    },
    changed: true
  }
}

/**
 * Fix all richImage blocks in a PT content array.
 * Returns { content, fixCount }.
 */
function fixContentArray(content) {
  if (!Array.isArray(content)) return { content, fixCount: 0 }
  let fixCount = 0
  const fixed = content.map(block => {
    const { block: fixedBlock, changed } = fixRichImageAsset(block)
    if (changed) fixCount++
    return fixedBlock
  })
  return { content: fixed, fixCount }
}

for (const doc of docs) {
  const fullDoc = await client.fetch(`*[_id == $id][0]`, { id: doc._id })
  if (!fullDoc) continue

  let totalFixes = 0
  const patch = {}

  // 1. Fix sections[].content[]
  if (fullDoc.sections) {
    let sectionsChanged = false
    const updatedSections = fullDoc.sections.map(section => {
      if (!section.content || !Array.isArray(section.content)) return section
      const { content: fixed, fixCount } = fixContentArray(section.content)
      if (fixCount > 0) {
        sectionsChanged = true
        totalFixes += fixCount
      }
      return { ...section, content: fixed }
    })
    if (sectionsChanged) patch.sections = updatedSections
  }

  // 2. Fix legacy content[] field
  if (fullDoc.content && Array.isArray(fullDoc.content)) {
    const { content: fixed, fixCount } = fixContentArray(fullDoc.content)
    if (fixCount > 0) {
      totalFixes += fixCount
      patch.content = fixed
    }
  }

  // 3. Fix featuredImage
  if (fullDoc.featuredImage?._type === 'richImage' && fullDoc.featuredImage?.asset?._type === 'reference') {
    totalFixes++
    patch.featuredImage = {
      ...fullDoc.featuredImage,
      asset: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: fullDoc.featuredImage.asset._ref
        }
      }
    }
  }

  if (totalFixes === 0) continue

  console.log(`📄 ${doc._type}/${doc._id}: "${doc.title}"`)
  const locations = []
  if (patch.sections) locations.push('sections')
  if (patch.content) locations.push('legacy content')
  if (patch.featuredImage) locations.push('featuredImage')
  console.log(`   ${totalFixes} ref(s) to fix in: ${locations.join(', ')}`)

  imageCount += totalFixes

  if (!EXECUTE) {
    patched++
    console.log('   📝 Would patch (dry-run)\n')
    continue
  }

  try {
    await client
      .patch(doc._id)
      .set(patch)
      .commit()

    patched++
    console.log('   💾 Patched successfully\n')
  } catch (err) {
    errors++
    console.log(`   ❌ Error: ${err.message}\n`)
  }
}

console.log('═'.repeat(60))
console.log('  Summary')
console.log('═'.repeat(60))
console.log(`  Documents scanned: ${docs.length}`)
console.log(`  Documents ${EXECUTE ? 'patched' : 'to patch'}: ${patched}`)
console.log(`  Images fixed: ${imageCount}`)
if (errors) console.log(`  Errors: ${errors}`)
console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTED' : '🔵 DRY-RUN (use --execute to apply)'}`)
