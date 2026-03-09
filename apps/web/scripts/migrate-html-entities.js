#!/usr/bin/env node
/**
 * migrate-html-entities.js — One-time migration: decode HTML entities in
 * `title`, `excerpt`, and PortableText `content` fields across all article,
 * caseStudy, and node documents.
 *
 * Background:
 *   The WordPress REST API import serialised smart quotes, dashes, ampersands,
 *   and ellipsis as numeric HTML entities (&#8217;, &#8220;, &#038;, etc.)
 *   rather than UTF-8 characters. `decodeHtml()` in htmlUtils.js handles this
 *   at render time, but the source data in Sanity should be clean Unicode.
 *
 * Entity map:
 *   &#8217; → '  (right single quote / apostrophe)
 *   &#8216; → '  (left single quote)
 *   &#8220; → "  (left double quote)
 *   &#8221; → "  (right double quote)
 *   &#8211; → –  (en dash)
 *   &#8212; → —  (em dash)
 *   &#8230; → …  (ellipsis)
 *   &#038;  → &  (ampersand, numeric form)
 *   &amp;   → &  (ampersand, named form)
 *   &nbsp;  → (space)
 *   &#NNN;  → Unicode char (generic numeric fallback)
 *
 * What this script does:
 *   For each article, caseStudy, or node document (raw perspective — includes drafts):
 *   - Decode HTML entities in `title` if present
 *   - Decode HTML entities in `excerpt` if present
 *   - Decode HTML entities in PortableText `content` span.text fields if present
 *   - Skip documents where no field changes after decoding
 *   - Patch only changed fields on affected documents
 *
 * Note: patching a published doc ID creates a new draft with the changes.
 * Drafts are patched in-place. Both are handled by patching the raw `_id`.
 *
 * Usage:
 *   node apps/web/scripts/migrate-html-entities.js           # dry-run (default)
 *   node apps/web/scripts/migrate-html-entities.js --execute # live writes
 *
 * Requires SANITY_AUTH_TOKEN (write-capable) in apps/web/.env
 */

import {readFileSync} from 'fs'
import {createClient} from '@sanity/client'

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = !process.argv.includes('--execute')

// Resolve .env relative to this script's location: scripts/ → web/ → .env
const envPath = new URL('../.env', import.meta.url).pathname
const env = readFileSync(envPath, 'utf8')
// Use the write-capable auth token; VITE_SANITY_TOKEN is read-only (viewer)
const token = env.match(/SANITY_AUTH_TOKEN=(.+)/)?.[1]?.trim()
if (!token) {
  console.error('ERROR: SANITY_AUTH_TOKEN not found in apps/web/.env')
  process.exit(1)
}

const client = createClient({
  projectId: 'poalmzla',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

// ─── HTML entity decoder ──────────────────────────────────────────────────────

function decodeHtmlEntities(str) {
  if (!str) return str
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8216;/g, '\u2018') // left single quote
    .replace(/&#8217;/g, '\u2019') // right single quote / apostrophe
    .replace(/&#8220;/g, '\u201C') // left double quote
    .replace(/&#8221;/g, '\u201D') // right double quote
    .replace(/&#8211;/g, '\u2013') // en dash
    .replace(/&#8212;/g, '\u2014') // em dash
    .replace(/&#8230;/g, '\u2026') // ellipsis
    .replace(/&#038;/g, '&')       // ampersand (numeric form)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))) // generic fallback
}

function hasHtmlEntities(str) {
  if (!str) return false
  return /&#\d+;|&amp;|&lt;|&gt;|&quot;|&nbsp;|&#038;/.test(str)
}

// ─── PortableText block walkers ──────────────────────────────────────────────

/**
 * Check if any span.text in PortableText blocks contains HTML entities.
 */
function hasPortableTextEntities(blocks) {
  if (!blocks || !Array.isArray(blocks)) return false
  return blocks.some(
    (block) =>
      block._type === 'block' &&
      Array.isArray(block.children) &&
      block.children.some(
        (span) => span._type === 'span' && hasHtmlEntities(span.text)
      )
  )
}

/**
 * Decode HTML entities in all span.text fields within PortableText blocks.
 * Returns a new array (immutable). Non-block types are returned unchanged.
 */
function decodePortableTextBlocks(blocks) {
  if (!blocks || !Array.isArray(blocks)) return blocks
  return blocks.map((block) => {
    if (block._type !== 'block' || !Array.isArray(block.children)) return block
    return {
      ...block,
      children: block.children.map((span) => {
        if (span._type !== 'span' || !hasHtmlEntities(span.text)) return span
        return { ...span, text: decodeHtmlEntities(span.text) }
      }),
    }
  })
}

/**
 * Count how many spans in a PortableText array have HTML entities.
 */
function countAffectedSpans(blocks) {
  if (!blocks || !Array.isArray(blocks)) return 0
  let count = 0
  for (const block of blocks) {
    if (block._type !== 'block' || !Array.isArray(block.children)) continue
    for (const span of block.children) {
      if (span._type === 'span' && hasHtmlEntities(span.text)) count++
    }
  }
  return count
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n─── HTML Entity Migration ──────────────────────────────────────')
  console.log(`    Mode: ${DRY_RUN ? 'DRY RUN (pass --execute to apply)' : '⚠️  EXECUTE — writing to Sanity production'}`)
  console.log()

  // Fetch all content documents (raw = published + drafts)
  // Include `content` (PortableText array) so we can check span.text for entities
  const docs = await client.fetch(
    `*[_type in ["article", "caseStudy", "node"]] {
      _id, _type, title, excerpt, content
    }`,
    {},
    {perspective: 'raw'}
  )

  console.log(`Fetched ${docs.length} content documents.\n`)

  // Identify affected documents
  const toMigrate = []

  for (const doc of docs) {
    const excerptHasEntities = hasHtmlEntities(doc.excerpt)
    const titleHasEntities   = hasHtmlEntities(doc.title)
    const contentHasEntities = hasPortableTextEntities(doc.content)

    if (!excerptHasEntities && !titleHasEntities && !contentHasEntities) continue

    const newExcerpt  = excerptHasEntities ? decodeHtmlEntities(doc.excerpt) : null
    const newTitle    = titleHasEntities   ? decodeHtmlEntities(doc.title)   : null
    const newContent  = contentHasEntities ? decodePortableTextBlocks(doc.content) : null
    const spanCount   = contentHasEntities ? countAffectedSpans(doc.content) : 0

    toMigrate.push({doc, newExcerpt, newTitle, newContent, excerptHasEntities, titleHasEntities, contentHasEntities, spanCount})
  }

  console.log(`Found ${toMigrate.length} document(s) with HTML entities to decode.\n`)

  if (toMigrate.length === 0) {
    console.log('Nothing to do. Exiting.')
    return
  }

  // Log what will change
  for (const {doc, newExcerpt, newTitle, newContent, excerptHasEntities, titleHasEntities, contentHasEntities, spanCount} of toMigrate) {
    console.log(`  [${doc._type}] ${doc._id}`)
    if (titleHasEntities) {
      console.log(`    title (before): ${doc.title}`)
      console.log(`    title (after):  ${newTitle}`)
    }
    if (excerptHasEntities) {
      const before = (doc.excerpt ?? '').slice(0, 120).replace(/\n/g, ' ')
      const after  = (newExcerpt ?? '').slice(0, 120).replace(/\n/g, ' ')
      console.log(`    excerpt (before): ${before}…`)
      console.log(`    excerpt (after):  ${after}…`)
    }
    if (contentHasEntities) {
      console.log(`    content: ${spanCount} span(s) with HTML entities`)
    }
    console.log()
  }

  if (DRY_RUN) {
    console.log('─── DRY RUN complete — no writes made ──────────────────────────')
    console.log('    Re-run with --execute to apply the changes.')
    return
  }

  // Apply patches
  console.log('─── Applying patches ──────────────────────────────────────────\n')
  let successCount = 0
  let errorCount   = 0

  for (const {doc, newExcerpt, newTitle, newContent, excerptHasEntities, titleHasEntities, contentHasEntities} of toMigrate) {
    try {
      const patch = client.patch(doc._id)
      if (titleHasEntities)   patch.set({title:   newTitle})
      if (excerptHasEntities) patch.set({excerpt: newExcerpt})
      if (contentHasEntities) patch.set({content: newContent})
      await patch.commit()
      console.log(`  ✓ patched: ${doc._id}`)
      successCount++
    } catch (err) {
      console.error(`  ✗ ERROR patching ${doc._id}: ${err.message}`)
      errorCount++
    }
  }

  console.log(`\n─── Done ──────────────────────────────────────────────────────`)
  console.log(`    Patched: ${successCount} / ${toMigrate.length}`)
  if (errorCount > 0) console.log(`    Errors:  ${errorCount}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
