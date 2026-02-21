#!/usr/bin/env node
/**
 * migrate:transform — Step 2: Transform WP export → Sanity import format
 *
 * Reads:  artifacts/wp_export.ndjson
 *         artifacts/image_manifest.json  (from migrate:images)
 * Writes: artifacts/sanity_import.ndjson
 *         artifacts/slug_collision_report.csv  (updated if needed)
 *
 * Transformations:
 *   - WP posts     → _type: "article" (NEVER "post")
 *   - WP gems CPT  → _type: "node"
 *   - WP case-studies CPT → _type: "caseStudy"
 *   - WP pages     → _type: "page"
 *   - WP authors   → _type: "person"
 *   - WP categories → _type: "category"
 *   - WP tags      → _type: "tag"
 *   - HTML → Portable Text (with risky-content fallback to legacySource.legacyHtml)
 *   - Featured images: WP URL → Sanity asset reference (from manifest)
 *   - Inline images: _wpImageUrl placeholder → Sanity asset reference (from manifest)
 *   - Taxonomy term IDs → Sanity _id references
 *   - Author login → person document _id reference
 *   - legacySource block populated on every document
 *   - Deterministic _id via makeId()
 *
 * Usage:
 *   node scripts/migrate/transform.js
 *   pnpm migrate:transform   (from repo root)
 *
 * Note: Run migrate:images BEFORE this step so the image manifest is populated.
 * Transform will continue without it (logging warnings) but inline/featured
 * images will be missing from the output.
 */

import { resolve } from 'path'
import {
  banner, section, ok, warn, info, fail,
  readNdjson, writeNdjson, readJson, writeCsv,
  makeId, md5, htmlToPortableText,
  refItem, ARTIFACTS_DIR,
} from './lib.js'

const EXPORT_FILE   = resolve(ARTIFACTS_DIR, 'wp_export.ndjson')
const MANIFEST_FILE = resolve(ARTIFACTS_DIR, 'image_manifest.json')
const OUTPUT_FILE   = resolve(ARTIFACTS_DIR, 'sanity_import.ndjson')

// ─── Image substitution ───────────────────────────────────────────────────────

function resolveImageRef(wpUrl, manifest) {
  if (!wpUrl || !manifest) return null
  const entry = manifest[wpUrl]
  if (!entry?.sanityAssetRef) return null
  return { _type: 'image', asset: { _type: 'reference', _ref: entry.sanityAssetRef } }
}

/**
 * Walk Portable Text blocks and replace _wpImageUrl placeholder blocks
 * with resolved Sanity image blocks using the manifest.
 */
function substituteInlineImages(blocks, manifest) {
  if (!blocks || !manifest) return blocks
  return blocks.map((block) => {
    if (block._type === 'image' && block._wpImageUrl) {
      const resolved = resolveImageRef(block._wpImageUrl, manifest)
      if (resolved) {
        return { ...resolved, _key: block._key, alt: block.alt ?? '' }
      }
      // No manifest entry — keep placeholder with a warning annotation
      warn(`  Unresolved inline image: ${block._wpImageUrl}`)
      return {
        _type: 'block',
        _key: block._key,
        style: 'normal',
        markDefs: [],
        children: [{
          _type: 'span',
          _key: block._key + '_txt',
          text: `[Image not migrated: ${block._wpImageUrl}]`,
          marks: [],
        }],
      }
    }
    return block
  })
}

// ─── Per-type transformers ────────────────────────────────────────────────────

function transformArticle(record, manifest, termLookup, personLookup) {
  const _id = makeId('article', record.wpId)
  const { blocks, usedFallback } = htmlToPortableText(record.rawHtml, _id)
  const finalBlocks = substituteInlineImages(blocks, manifest)

  const featuredImage = resolveImageRef(record.featuredMediaUrl, manifest)

  const categories = (record.termCategoryIds ?? [])
    .map((id) => termLookup.get(`category::${id}`))
    .filter(Boolean)
    .map(refItem)

  const tags = (record.termTagIds ?? [])
    .map((id) => termLookup.get(`tag::${id}`))
    .filter(Boolean)
    .map(refItem)

  const authors = record.authorLogin
    ? [refItem(personLookup.get(record.authorLogin) ?? makeId('person', record.authorLogin))]
    : []

  return {
    _id,
    _type: 'article',
    title: record.title,
    slug: { _type: 'slug', current: record.slug },
    excerpt: record.excerpt ?? '',
    ...(featuredImage ? { featuredImage } : {}),
    content: finalBlocks,
    authors,
    categories,
    tags,
    projects: [],
    publishedAt: record.publishedAt,
    updatedAt:   record.modifiedAt,
    ...(record.seoTitle || record.seoDesc ? {
      seo: {
        _type: 'seoMetadata',
        metaTitle: record.seoTitle ?? '',
        metaDescription: record.seoDesc ?? '',
      }
    } : {}),
    legacySource: buildLegacySource(record, usedFallback),
  }
}

function transformPage(record, manifest) {
  const _id = makeId('page', record.wpId)
  const { blocks, usedFallback } = htmlToPortableText(record.rawHtml, _id)

  return {
    _id,
    _type: 'page',
    title: record.title,
    slug: { _type: 'slug', current: record.slug },
    sections: blocks.length ? [{
      _type: 'textSection',
      _key: `ts_${record.wpId}`,
      heading: '',
      content: substituteInlineImages(blocks, manifest),
    }] : [],
    template: 'default',
    legacySource: buildLegacySource(record, usedFallback),
  }
}

function transformNode(record, manifest, termLookup, personLookup) {
  const _id = makeId('node', record.wpId)
  const { blocks, usedFallback } = htmlToPortableText(record.rawHtml, _id)
  const finalBlocks = substituteInlineImages(blocks, manifest)

  const categories = (record.termCategoryIds ?? [])
    .map((id) => termLookup.get(`category::${id}`))
    .filter(Boolean).map(refItem)

  const tags = (record.termTagIds ?? [])
    .map((id) => termLookup.get(`tag::${id}`))
    .filter(Boolean).map(refItem)

  const authors = record.authorLogin
    ? [refItem(personLookup.get(record.authorLogin) ?? makeId('person', record.authorLogin))]
    : []

  return {
    _id,
    _type: 'node',
    title: record.title,
    slug: { _type: 'slug', current: record.slug },
    excerpt: record.excerpt ?? '',
    content: finalBlocks,
    aiTool: 'mixed',             // WP nodes predate AI tool tracking — default to mixed
    conversationType: 'learning',
    status: 'explored',
    authors,
    categories,
    tags,
    projects: [],
    publishedAt: record.publishedAt,
    updatedAt:   record.modifiedAt,
    legacySource: buildLegacySource(record, usedFallback),
  }
}

function transformCaseStudy(record, manifest, termLookup, personLookup) {
  const _id = makeId('caseStudy', record.wpId)
  const { blocks, usedFallback } = htmlToPortableText(record.rawHtml, _id)

  const featuredImage = resolveImageRef(record.featuredMediaUrl, manifest)

  const categories = (record.termCategoryIds ?? [])
    .map((id) => termLookup.get(`category::${id}`))
    .filter(Boolean).map(refItem)

  const tags = (record.termTagIds ?? [])
    .map((id) => termLookup.get(`tag::${id}`))
    .filter(Boolean).map(refItem)

  const authors = record.authorLogin
    ? [refItem(personLookup.get(record.authorLogin) ?? makeId('person', record.authorLogin))]
    : []

  return {
    _id,
    _type: 'caseStudy',
    title: record.title,
    slug: { _type: 'slug', current: record.slug },
    excerpt: record.excerpt ?? '',
    ...(featuredImage ? { featuredImage } : {}),
    sections: blocks.length ? [{
      _type: 'textSection',
      _key: `ts_${record.wpId}`,
      heading: '',
      content: substituteInlineImages(blocks, manifest),
    }] : [],
    publishedAt: record.publishedAt,
    authors,
    categories,
    tags,
    projects: [],
    legacySource: buildLegacySource(record, usedFallback),
  }
}

function transformCategory(record) {
  return {
    _id:  makeId('category', record.wpId),
    _type: 'category',
    name: record.name,
    slug: { _type: 'slug', current: record.slug },
    description: record.description ?? '',
    legacySource: buildLegacySource(record, false),
  }
}

function transformTag(record) {
  return {
    _id:  makeId('tag', record.wpId),
    _type: 'tag',
    name: record.name,
    slug: { _type: 'slug', current: record.slug },
    legacySource: buildLegacySource(record, false),
  }
}

function transformPerson(record) {
  return {
    _id:  makeId('person', record.slug),  // slug = authorLogin
    _type: 'person',
    name: record.name || record.slug,
    slug: { _type: 'slug', current: record.slug },
    legacySource: buildLegacySource(record, false),
  }
}

// ─── legacySource builder ─────────────────────────────────────────────────────

function buildLegacySource(record, usedFallback) {
  return {
    _type: 'legacySource',
    system: 'wp',
    wpId:    record.wpId,
    wpType:  record.postType,
    wpUrl:   record.permalink ?? '',
    legacySlug: record.slug,
    importHash: md5(record.rawHtml ?? record.name ?? ''),
    importedAt: new Date().toISOString(),
    ...(usedFallback ? { legacyHtml: record.rawHtml ?? '' } : {}),
    ...(record.featuredMediaUrl ? { legacyFeaturedImageUrl: record.featuredMediaUrl } : {}),
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  banner('Sugartown — Transform (Step 2 of 5)')

  const records = readNdjson(EXPORT_FILE)
  if (!records.length) {
    fail(`No records found at ${EXPORT_FILE}`)
    fail('Run migrate:export first')
    process.exit(1)
  }
  info(`Loaded ${records.length} records from wp_export.ndjson`)

  const manifest = readJson(MANIFEST_FILE) ?? {}
  const manifestSize = Object.keys(manifest).length
  if (!manifestSize) {
    warn('Image manifest is empty or missing — run migrate:images first')
    warn('Continuing without image substitution (images will be missing)')
  } else {
    info(`Loaded image manifest: ${manifestSize} entries`)
  }

  // Build taxonomy lookup maps needed during transform
  // category::wpId → sanityId
  // tag::wpId → sanityId
  const termLookup = new Map()
  for (const r of records) {
    if (r.sanityType === 'category') termLookup.set(`category::${r.wpId}`, makeId('category', r.wpId))
    if (r.sanityType === 'tag')      termLookup.set(`tag::${r.wpId}`, makeId('tag', r.wpId))
  }

  // authorLogin → person _id
  const personLookup = new Map()
  for (const r of records) {
    if (r.sanityType === 'person') personLookup.set(r.slug, makeId('person', r.slug))
  }

  section('Transforming records')

  const output = []
  let ptFallbacks = 0

  // Transform taxonomy first so references are available
  const taxonomyOrder = ['category', 'tag', 'person']
  const contentOrder  = ['article', 'page', 'node', 'caseStudy']
  const ordered = [
    ...records.filter((r) => taxonomyOrder.includes(r.sanityType)),
    ...records.filter((r) => contentOrder.includes(r.sanityType)),
  ]

  for (const record of ordered) {
    let doc
    switch (record.sanityType) {
      case 'article':
        doc = transformArticle(record, manifest, termLookup, personLookup)
        if (doc.legacySource?.legacyHtml) ptFallbacks++
        break
      case 'page':
        doc = transformPage(record, manifest)
        if (doc.legacySource?.legacyHtml) ptFallbacks++
        break
      case 'node':
        doc = transformNode(record, manifest, termLookup, personLookup)
        if (doc.legacySource?.legacyHtml) ptFallbacks++
        break
      case 'caseStudy':
        doc = transformCaseStudy(record, manifest, termLookup, personLookup)
        if (doc.legacySource?.legacyHtml) ptFallbacks++
        break
      case 'category':
        doc = transformCategory(record)
        break
      case 'tag':
        doc = transformTag(record)
        break
      case 'person':
        doc = transformPerson(record)
        break
      default:
        warn(`Unknown sanityType "${record.sanityType}" for wpId ${record.wpId} — skipping`)
        continue
    }
    output.push(doc)
  }

  writeNdjson(OUTPUT_FILE, output)

  section('Summary')
  const counts = {}
  for (const doc of output) counts[doc._type] = (counts[doc._type] ?? 0) + 1
  for (const [type, count] of Object.entries(counts)) ok(`${count} ${type}`)
  if (ptFallbacks) warn(`${ptFallbacks} document(s) used legacyHtml fallback (PT conversion skipped)`)
  ok(`Total: ${output.length} documents → ${OUTPUT_FILE}`)
  info('\nNext step: pnpm migrate:import')
  console.log('══════════════════════════════════════════════\n')
}

main().catch((err) => {
  fail(`Unexpected error: ${err.message}`)
  console.error(err)
  process.exit(1)
})
