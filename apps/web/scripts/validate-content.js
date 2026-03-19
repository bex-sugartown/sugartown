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
 *   G) Draft-only documents — docs that exist as drafts but have never been published,
 *      meaning their slugs would 404 in production (EPIC-0176)
 *   H) Minimum taxonomy coverage — categories ≥1, tags ≥3, tools ≥1 (articles/nodes)
 *      (EPIC-0183)
 *   I) Missing author attribution — every content doc should have ≥1 author (EPIC-0183)
 *   J) SEO metadata completeness — seo.title and seo.description (EPIC-0183)
 *
 * Flags:
 *   --strict   Treat quality warnings (H, I, J) as errors — exits non-zero
 *   --report   Output taxonomy utilization summary after all checks
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

const STRICT = process.argv.includes('--strict')
const REPORT = process.argv.includes('--report')

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

// Raw-perspective client — sees both drafts and published documents.
// Used by check G (draft-only detection) to compare draft vs published state.
const rawClient = createClient({
  projectId, dataset, apiVersion, useCdn: false, token,
  perspective: 'raw',
})

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
    "toolRefs": tools[]._ref,
    "toolCount": count(tools),
    "categoryCount": count(categories),
    "tagCount": count(tags),
    "authorCount": count(authors),
    "hasSeoTitle": defined(seo.title) && seo.title != "",
    "hasSeoDescription": defined(seo.description) && seo.description != ""
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
  },
  "taxonomyUsage": {
    "categories": *[_type == "category" && !(_id in path("drafts.**"))] {
      _id, name,
      "total": count(*[_type in ["article", "caseStudy", "node"] && references(^._id)])
    } | order(name),
    "tags": *[_type == "tag" && !(_id in path("drafts.**"))] {
      _id, name,
      "total": count(*[_type in ["article", "caseStudy", "node"] && references(^._id)])
    } | order(name),
    "tools": *[_type == "tool" && !(_id in path("drafts.**"))] {
      _id, name,
      "total": count(*[_type in ["article", "caseStudy", "node"] && references(^._id)])
    } | order(name)
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

  // ── G) Draft-only documents ──────────────────────────────────────────────
  //    Documents that exist only as drafts (never published) — their slugs
  //    would 404 in production. Uses raw perspective to see both states.
  //    EPIC-0176 · Content State Governance

  console.log('👻  Draft-Only Document Detection')
  console.log('──────────────────────────────────────────────')

  if (!token) {
    console.log('   ⏭️   Skipped — VITE_SANITY_TOKEN required for draft-only detection')
  } else {
    const ROUTED_TYPES = ['page', 'article', 'caseStudy', 'node', ...TAXONOMY_TYPES]

    // Fetch ALL documents (drafts.* and published) for routed types that have slugs
    const draftQuery = `*[_type in $routedTypes && defined(slug.current)] {
      _id,
      _type,
      title,
      name,
      "slug": slug.current
    }`

    let rawDocs
    try {
      rawDocs = await rawClient.fetch(draftQuery, { routedTypes: ROUTED_TYPES })
    } catch (err) {
      console.log(`   ⚠️   Raw-perspective query failed: ${err.message}`)
      rawDocs = []
    }

    // Separate into draft IDs and published IDs
    const publishedIds = new Set()
    const draftDocs = []

    for (const doc of rawDocs) {
      if (doc._id.startsWith('drafts.')) {
        draftDocs.push(doc)
      } else {
        publishedIds.add(doc._id)
      }
    }

    // A draft-only doc has a drafts.* ID but no matching published ID
    const draftOnly = draftDocs.filter((d) => {
      const publishedId = d._id.replace(/^drafts\./, '')
      return !publishedIds.has(publishedId)
    })

    if (draftOnly.length === 0) {
      console.log('   ✅  No draft-only documents with slugs detected')
    } else {
      console.log(
        `   ⚠️   ${draftOnly.length} draft-only document(s) — these will 404 in production:`,
      )
      for (const doc of draftOnly.sort((a, b) => a._type.localeCompare(b._type))) {
        const label = doc.title || doc.name || '(untitled)'
        console.log(`        [${doc._type}] "${label}" → /${doc.slug}`)
      }
      console.log(
        '        Fix: publish these documents in Sanity Studio, or delete if no longer needed.',
      )
      warnings += draftOnly.length
    }
  }
  console.log()

  // ── H) Minimum taxonomy coverage ──────────────────────────────────────────
  //    EPIC-0183: categories ≥1, tags ≥3, tools ≥1 (articles & nodes only)

  console.log('📊  Minimum Taxonomy Coverage (H)')
  console.log('──────────────────────────────────────────────')

  const MINIMUMS = {
    categories: 1,
    tags: 3,
    tools: { article: 1, node: 1, caseStudy: 0 },
  }

  let taxonomyGaps = 0
  const contentDocs = data.content ?? []

  for (const doc of contentDocs) {
    const issues = []
    if ((doc.categoryCount ?? 0) < MINIMUMS.categories) {
      issues.push(`categories: ${doc.categoryCount ?? 0}/${MINIMUMS.categories}`)
    }
    if ((doc.tagCount ?? 0) < MINIMUMS.tags) {
      issues.push(`tags: ${doc.tagCount ?? 0}/${MINIMUMS.tags}`)
    }
    const toolMin = MINIMUMS.tools[doc._type] ?? 0
    if (toolMin > 0 && (doc.toolCount ?? 0) < toolMin) {
      issues.push(`tools: ${doc.toolCount ?? 0}/${toolMin}`)
    }
    if (issues.length > 0) {
      const prefix = STRICT ? '❌' : '⚠️  '
      console.log(`   ${prefix} [${doc._type}] "${doc.title}" — ${issues.join(', ')}`)
      taxonomyGaps++
      if (STRICT) { errors++ } else { warnings++ }
    }
  }

  if (taxonomyGaps === 0) {
    console.log('   ✅  All content docs meet minimum taxonomy thresholds')
  } else {
    console.log(`\n   ${taxonomyGaps} doc(s) below minimum taxonomy coverage`)
  }
  console.log()

  // ── I) Missing author attribution ─────────────────────────────────────────
  //    EPIC-0183: every content doc should have ≥1 author

  console.log('👤  Author Attribution (I)')
  console.log('──────────────────────────────────────────────')

  let missingAuthors = 0

  for (const doc of contentDocs) {
    if ((doc.authorCount ?? 0) < 1) {
      const prefix = STRICT ? '❌' : '⚠️  '
      console.log(`   ${prefix} [${doc._type}] "${doc.title}" — no authors assigned`)
      missingAuthors++
      if (STRICT) { errors++ } else { warnings++ }
    }
  }

  if (missingAuthors === 0) {
    console.log('   ✅  All content docs have at least one author')
  }
  console.log()

  // ── J) SEO metadata completeness ──────────────────────────────────────────
  //    EPIC-0183: seo.title and seo.description should be set

  console.log('🔍  SEO Metadata Completeness (J)')
  console.log('──────────────────────────────────────────────')

  let seoGaps = 0

  for (const doc of contentDocs) {
    const issues = []
    if (!doc.hasSeoTitle) issues.push('missing seo.title')
    if (!doc.hasSeoDescription) issues.push('missing seo.description')
    if (issues.length > 0) {
      const prefix = STRICT ? '❌' : '⚠️  '
      console.log(`   ${prefix} [${doc._type}] "${doc.title}" — ${issues.join(', ')}`)
      seoGaps++
      if (STRICT) { errors++ } else { warnings++ }
    }
  }

  if (seoGaps === 0) {
    console.log('   ✅  All content docs have SEO title and description')
  }
  console.log()

  // ── Report: taxonomy utilization (--report) ──────────────────────────────

  if (REPORT) {
    console.log('📈  Taxonomy Utilization Report')
    console.log('══════════════════════════════════════════════')

    const usage = data.taxonomyUsage ?? {}

    for (const [type, items] of Object.entries(usage)) {
      if (!items || items.length === 0) continue
      const sorted = [...items].sort((a, b) => b.total - a.total)
      const unused = sorted.filter((i) => i.total === 0)
      const underused = sorted.filter((i) => i.total === 1)
      const top = sorted.slice(0, 5)

      console.log(`\n   ${type} (${items.length} total):`)
      console.log('     Most used:')
      for (const item of top) {
        console.log(`       ${item.name}: ${item.total} refs`)
      }
      if (unused.length > 0) {
        console.log(`     Unused (0 refs): ${unused.map((i) => i.name).join(', ')}`)
      }
      if (underused.length > 0) {
        console.log(`     Underused (1 ref): ${underused.map((i) => i.name).join(', ')}`)
      }
    }

    // Coverage summary
    const total = contentDocs.length
    const meetAll = contentDocs.filter((d) => {
      const toolMin = MINIMUMS.tools[d._type] ?? 0
      return (
        (d.categoryCount ?? 0) >= MINIMUMS.categories &&
        (d.tagCount ?? 0) >= MINIMUMS.tags &&
        (toolMin === 0 || (d.toolCount ?? 0) >= toolMin) &&
        (d.authorCount ?? 0) >= 1
      )
    }).length

    console.log(`\n   Coverage: ${meetAll} of ${total} content docs meet all minimums`)
    console.log()
  }

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
  if (STRICT) {
    console.log('   (--strict mode: quality warnings treated as errors)')
  }
  console.log()

  process.exit(errors > 0 ? 1 : 0)
}

run()
