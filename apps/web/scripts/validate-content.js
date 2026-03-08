#!/usr/bin/env node
/**
 * validate-content.js — Dev-time Content Quality Validator
 *
 * Checks published Sanity documents for data quality issues:
 *   A) Nav items with trailing slashes or missing URLs
 *   B) Documents missing required fields (title, slug, excerpt)
 *   C) Orphaned taxonomy references (refs pointing to deleted/unpublished docs)
 *   D) archivePage docs with empty or invalid contentTypes
 *   E) Duplicate slugs within the same _type
 *   F) HTML entities as literal strings in PortableText spans (e.g. &#8220; &#8221;)
 *      — these are not decoded by @portabletext/react and render as raw codes in the UI
 *
 * Complements:
 *   validate:urls    — URL authority and routing correctness
 *   validate:filters — FilterModel / facet integrity
 *   validate:content — Content data quality (this script)
 *
 * Usage:
 *   pnpm validate:content
 *
 * Exits with code 1 if any errors are found, 0 if only warnings or clean.
 *
 * Environment variables required (reads from .env or process.env):
 *   VITE_SANITY_PROJECT_ID
 *   VITE_SANITY_DATASET
 *   VITE_SANITY_API_VERSION
 *   VITE_SANITY_TOKEN (optional but recommended — required to see wp.* dot-namespace
 *                      documents, which are only visible to authenticated queries)
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Load env from .env file ──────────────────────────────────────────────────

function loadEnv() {
  const envPath = resolve(__dirname, '../.env')
  try {
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env not found — rely on process.env (CI etc.)
  }
}

loadEnv()

// ─── Sanity client ────────────────────────────────────────────────────────────

const projectId = process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'
const token = process.env.VITE_SANITY_TOKEN // optional — required for wp.* dot-namespace IDs

if (!projectId) {
  console.error('[validate-content] ERROR: VITE_SANITY_PROJECT_ID is not set.')
  process.exit(1)
}

if (!token) {
  console.warn(
    '[validate-content] WARN: VITE_SANITY_TOKEN is not set — wp.* dot-namespace documents will not be visible. Set a read-only viewer token to get full coverage.\n',
  )
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

// ─── Known content types that require slugs ──────────────────────────────────

const CONTENT_TYPES = ['article', 'caseStudy', 'node']
const TAXONOMY_TYPES = ['category', 'tag', 'project', 'person', 'tool']
const ALL_SLUGGED_TYPES = ['page', ...CONTENT_TYPES, ...TAXONOMY_TYPES, 'archivePage']
const VALID_ARCHIVE_CONTENT_TYPES = ['article', 'caseStudy', 'node']

// ─── GROQ query — fetch everything we need in one round-trip ─────────────────

const query = `{
  "content": *[_type in $contentTypes && defined(slug.current)] {
    _id,
    _type,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    "authorRefs": authors[]._ref,
    "categoryRefs": categories[]._ref,
    "tagRefs": tags[]._ref,
    "projectRefs": projects[]._ref,
    "toolRefs": tools[]._ref
  },
  "portableTextDocs": *[_type in $contentTypes && defined(slug.current)] {
    _id,
    _type,
    title,
    "slug": slug.current,
    "contentBlocks": content[]{ _type, children[]{ _type, text } },
    "bodyBlocks": body[]{ _type, children[]{ _type, text } }
  },
  "taxonomies": *[_type in $taxonomyTypes && defined(slug.current)] {
    _id,
    _type,
    name,
    "slug": slug.current
  },
  "pages": *[_type == "page" && defined(slug.current)] {
    _id,
    _type,
    title,
    "slug": slug.current
  },
  "archivePages": *[_type == "archivePage" && defined(slug.current)] {
    _id,
    title,
    "slug": slug.current,
    contentTypes
  },
  "missingTitle": *[_type in $allTypes && !defined(title) && !defined(name)] {
    _id,
    _type
  },
  "missingSlug": *[_type in $allTypes && !defined(slug.current)] {
    _id,
    _type,
    title,
    name
  },
  "nav": *[_type == "navigation"][0...10] {
    _id,
    title,
    items[]{
      label,
      "url": link.url,
      children[]{
        label,
        "url": link.url
      }
    }
  }
}`

// ─── Run validation ───────────────────────────────────────────────────────────

async function run() {
  console.log('\n📝  Sugartown Content Quality Validator')
  console.log('══════════════════════════════════════════════\n')
  console.log(`   Project: ${projectId}  |  Dataset: ${dataset}\n`)

  let data
  try {
    data = await client.fetch(query, {
      contentTypes: CONTENT_TYPES,
      taxonomyTypes: TAXONOMY_TYPES,
      allTypes: ALL_SLUGGED_TYPES,
    })
  } catch (err) {
    console.error('[validate-content] Sanity fetch failed:', err.message)
    process.exit(1)
  }

  let errors = 0
  let warnings = 0

  // ── A) Nav item quality ───────────────────────────────────────────────────

  console.log('🧭  Nav Item Quality')
  console.log('──────────────────────────────────────────────')

  const navDocs = data.nav ?? []
  let navIssues = 0

  for (const nav of navDocs) {
    const allItems = [
      ...(nav.items ?? []),
      ...(nav.items ?? []).flatMap((i) => i.children ?? []),
    ]

    for (const item of allItems) {
      if (!item.url) {
        console.log(`   ⚠️   "${item.label}" — missing URL (nav: "${nav.title}")`)
        navIssues++
        warnings++
      } else if (item.url.length > 1 && item.url.endsWith('/')) {
        console.log(
          `   ⚠️   "${item.label}" → ${item.url} — trailing slash (nav: "${nav.title}")`,
        )
        navIssues++
        warnings++
      }
    }
  }

  if (navIssues === 0) {
    console.log('   ✅  All nav items have valid URLs (no trailing slashes)')
  }
  console.log()

  // ── B) Missing required fields ────────────────────────────────────────────

  console.log('📋  Required Fields')
  console.log('──────────────────────────────────────────────')

  const missingTitle = data.missingTitle ?? []
  const missingSlug = data.missingSlug ?? []

  if (missingTitle.length > 0) {
    console.log(`   ⚠️   ${missingTitle.length} doc(s) missing title/name:`)
    for (const doc of missingTitle) {
      console.log(`        [${doc._type}] ${doc._id}`)
    }
    warnings += missingTitle.length
  }

  if (missingSlug.length > 0) {
    console.log(`   ⚠️   ${missingSlug.length} doc(s) missing slug:`)
    for (const doc of missingSlug) {
      const label = doc.title || doc.name || '(untitled)'
      console.log(`        [${doc._type}] "${label}" — ${doc._id}`)
    }
    warnings += missingSlug.length
  }

  // Content docs missing excerpts — soft warning
  const contentMissingExcerpt = (data.content ?? []).filter(
    (d) => !d.excerpt || d.excerpt.trim() === '',
  )
  if (contentMissingExcerpt.length > 0) {
    console.log(
      `   ℹ️   ${contentMissingExcerpt.length} content doc(s) have no excerpt (cards will show no body text):`,
    )
    const maxShow = 5
    for (let i = 0; i < Math.min(contentMissingExcerpt.length, maxShow); i++) {
      const d = contentMissingExcerpt[i]
      console.log(`        [${d._type}] "${d.title}" (${d._id})`)
    }
    if (contentMissingExcerpt.length > maxShow) {
      console.log(`        … and ${contentMissingExcerpt.length - maxShow} more`)
    }
  }

  if (missingTitle.length === 0 && missingSlug.length === 0) {
    console.log('   ✅  All docs have required title/name and slug')
  }
  console.log()

  // ── C) Orphaned taxonomy references ───────────────────────────────────────

  console.log('🔗  Taxonomy Reference Integrity')
  console.log('──────────────────────────────────────────────')

  const validIds = new Set([
    ...(data.taxonomies ?? []).map((t) => t._id),
    ...(data.content ?? []).map((c) => c._id),
    ...(data.pages ?? []).map((p) => p._id),
  ])

  let orphanCount = 0

  for (const doc of data.content ?? []) {
    const allRefs = [
      ...(doc.authorRefs ?? []),
      ...(doc.categoryRefs ?? []),
      ...(doc.tagRefs ?? []),
      ...(doc.projectRefs ?? []),
      ...(doc.toolRefs ?? []),
    ]

    for (const refId of allRefs) {
      if (!refId) continue
      if (!validIds.has(refId)) {
        console.log(
          `   ⚠️   [${doc._type}] "${doc.title}" references missing doc ${refId}`,
        )
        orphanCount++
        warnings++
      }
    }
  }

  if (orphanCount === 0) {
    console.log('   ✅  No orphaned taxonomy references detected')
  } else {
    console.log(
      `\n   ${orphanCount} orphaned ref(s) — referenced docs may be deleted or unpublished`,
    )
  }
  console.log()

  // ── D) Archive page validation ────────────────────────────────────────────

  console.log('📁  Archive Page Integrity')
  console.log('──────────────────────────────────────────────')

  const archivePages = data.archivePages ?? []

  if (archivePages.length === 0) {
    console.log('   ⚠️   No published archivePage docs found')
    warnings++
  }

  for (const ap of archivePages) {
    const ct = ap.contentTypes ?? []
    if (ct.length === 0) {
      console.log(
        `   ❌  archivePage "${ap.title}" (/${ap.slug}) — empty contentTypes array`,
      )
      errors++
    } else {
      const invalid = ct.filter((t) => !VALID_ARCHIVE_CONTENT_TYPES.includes(t))
      if (invalid.length > 0) {
        console.log(
          `   ❌  archivePage "${ap.title}" (/${ap.slug}) — invalid contentType(s): ${invalid.join(', ')}`,
        )
        errors++
      } else {
        console.log(`   ✅  /${ap.slug} → [${ct.join(', ')}]`)
      }
    }
  }
  console.log()

  // ── E) Duplicate slugs within same type ───────────────────────────────────

  console.log('🔄  Slug Uniqueness (per type)')
  console.log('──────────────────────────────────────────────')

  const allDocs = [
    ...(data.content ?? []),
    ...(data.taxonomies ?? []),
    ...(data.pages ?? []),
  ]

  const slugsByType = new Map()
  for (const doc of allDocs) {
    const key = doc._type
    if (!slugsByType.has(key)) slugsByType.set(key, new Map())
    const typeMap = slugsByType.get(key)
    const slug = doc.slug
    if (!slug) continue
    if (typeMap.has(slug)) {
      typeMap.get(slug).push(doc)
    } else {
      typeMap.set(slug, [doc])
    }
  }

  let dupCount = 0
  for (const [type, slugMap] of slugsByType) {
    for (const [slug, docs] of slugMap) {
      if (docs.length > 1) {
        console.log(
          `   ❌  [${type}] slug "${slug}" used by ${docs.length} docs:`,
        )
        for (const d of docs) {
          const label = d.title || d.name || '(untitled)'
          console.log(`        → "${label}" (${d._id})`)
        }
        dupCount++
        errors++
      }
    }
  }

  if (dupCount === 0) {
    console.log('   ✅  No duplicate slugs within any type')
  }
  console.log()

  // ── F) HTML entities as literal strings in PortableText ──────────────────

  console.log('🔤  PortableText HTML Entity Check')
  console.log('──────────────────────────────────────────────')

  // Matches numeric entities (&#8220;) and named entities (&amp; &nbsp; etc.)
  // but NOT bare ampersands that are part of valid text
  const ENTITY_RE = /&#\d+;|&[a-zA-Z]+;/

  const portableDocs = data.portableTextDocs ?? []
  let entityIssues = 0

  for (const doc of portableDocs) {
    const hitSpans = []
    // nodes use `content`, articles/caseStudies use `body` — fetch both
    const allBlocks = [...(doc.contentBlocks ?? []), ...(doc.bodyBlocks ?? [])]

    for (const block of allBlocks) {
      if (block._type !== 'block') continue
      for (const span of block.children ?? []) {
        if (span._type !== 'span' || typeof span.text !== 'string') continue
        const matches = span.text.match(new RegExp(ENTITY_RE.source, 'g'))
        if (matches) {
          hitSpans.push({
            preview: span.text.slice(0, 80),
            entities: [...new Set(matches)],
          })
        }
      }
    }

    if (hitSpans.length > 0) {
      console.log(
        `   ⚠️   [${doc._type}] "${doc.title}" (/${doc.slug}) — ${hitSpans.length} span(s) with literal HTML entities:`,
      )
      const maxShow = 3
      for (let i = 0; i < Math.min(hitSpans.length, maxShow); i++) {
        const { preview, entities } = hitSpans[i]
        console.log(`        Entities: ${entities.join(', ')}`)
        console.log(`        Text: "${preview}${preview.length >= 80 ? '…' : ''}"`)
      }
      if (hitSpans.length > maxShow) {
        console.log(`        … and ${hitSpans.length - maxShow} more span(s)`)
      }
      console.log(
        `        Fix: apply decodePortableText() in the page component, or clean the source in Studio`,
      )
      entityIssues++
      warnings++
    }
  }

  if (entityIssues === 0) {
    console.log('   ✅  No literal HTML entities found in PortableText spans')
  }
  console.log()

  // ── Summary ─────────────────────────────────────────────────────────────────

  console.log('══════════════════════════════════════════════')

  if (errors === 0 && warnings === 0) {
    console.log('✅  All content quality checks passed.\n')
    process.exit(0)
  }

  if (errors > 0) {
    console.log(`❌  ${errors} ERROR(S) found — must be resolved.`)
  }
  if (warnings > 0) {
    console.log(`⚠️   ${warnings} WARNING(S) found — review in Sanity Studio.`)
  }
  console.log()

  process.exit(errors > 0 ? 1 : 0)
}

run()
