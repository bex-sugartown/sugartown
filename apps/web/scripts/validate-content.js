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
 *   K) Spans carrying both a link and a glossary term mark — only one anchor renders (#143)
 *   L) Citations — a typed [N] in body text (should be a citationRef mark), or a citation
 *      number with no citations[] entry, which links nowhere (ST-221)
 *
 * Flags:
 *   --strict   Treat quality warnings (H, I, J, K, L) as errors — exits non-zero
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
import { judgeContent, findDraftOnly, MINIMUMS } from './lib/content-rules.cjs'

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
    '[validate-content] Running anonymously. Published content is fully visible since ' +
      'SUG-260 migrated the wp.* dotted ids; only draft-only detection is skipped, ' +
      'because drafts are still stored as `drafts.<id>`.\n',
  )
}

const STRICT = process.argv.includes('--strict')
const REPORT = process.argv.includes('--report')

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token, perspective: 'published' })

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
    "bodyBlocks": body[]{ _type, children[]{ _type, text } },
    "markBlocks": [
      ...content[_type == "block"],
      ...body[_type == "block"],
      ...sections[].content[_type == "block"]
    ]{ "defs": markDefs[]{ _key, _type, index }, "spans": children[]{ _type, text, marks } },
    "citationCount": count(citations),
    "tableCells": [
      ...content[_type == "tableBlock"],
      ...body[_type == "tableBlock"],
      ...sections[].content[_type == "tableBlock"]
    ].rows[].cells
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

  // The judging half lives in lib/content-rules.cjs so the liveness probe runs the same function.
  const verdict = judgeContent(data, { strict: STRICT })
  const {
    navIssues, missingTitle, missingSlug, contentMissingExcerpt, orphans,
    noArchivePages, archiveResults, duplicateSlugs, entityHits, doubleMarks, citationIssues,
    taxonomyGaps, missingAuthors, seoGaps, contentDocs, errors,
  } = verdict
  let { warnings } = verdict

  // ── A) Nav item quality ───────────────────────────────────────────────────

  console.log('🧭  Nav Item Quality')
  console.log('──────────────────────────────────────────────')

  for (const { kind, item, navTitle } of navIssues) {
    if (kind === 'missingUrl') {
      console.log(`   ⚠️   "${item.label}" — missing URL (nav: "${navTitle}")`)
    } else {
      console.log(
        `   ⚠️   "${item.label}" → ${item.url} — trailing slash (nav: "${navTitle}")`,
      )
    }
  }

  if (navIssues.length === 0) {
    console.log('   ✅  All nav items have valid URLs (no trailing slashes)')
  }
  console.log()

  // ── B) Missing required fields ────────────────────────────────────────────

  console.log('📋  Required Fields')
  console.log('──────────────────────────────────────────────')

  if (missingTitle.length > 0) {
    console.log(`   ⚠️   ${missingTitle.length} doc(s) missing title/name:`)
    for (const doc of missingTitle) {
      console.log(`        [${doc._type}] ${doc._id}`)
    }
  }

  if (missingSlug.length > 0) {
    console.log(`   ⚠️   ${missingSlug.length} doc(s) missing slug:`)
    for (const doc of missingSlug) {
      const label = doc.title || doc.name || '(untitled)'
      console.log(`        [${doc._type}] "${label}" — ${doc._id}`)
    }
  }

  // Content docs missing excerpts — soft warning
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

  for (const { doc, refId } of orphans) {
    console.log(
      `   ⚠️   [${doc._type}] "${doc.title}" references missing doc ${refId}`,
    )
  }

  if (orphans.length === 0) {
    console.log('   ✅  No orphaned taxonomy references detected')
  } else {
    console.log(
      `\n   ${orphans.length} orphaned ref(s) — referenced docs may be deleted or unpublished`,
    )
  }
  console.log()

  // ── D) Archive page validation ────────────────────────────────────────────

  console.log('📁  Archive Page Integrity')
  console.log('──────────────────────────────────────────────')

  if (noArchivePages) {
    console.log('   ⚠️   No published archivePage docs found')
  }

  for (const { ap, ct, kind, invalid } of archiveResults) {
    if (kind === 'empty') {
      console.log(
        `   ❌  archivePage "${ap.title}" (/${ap.slug}) — empty contentTypes array`,
      )
    } else if (kind === 'invalid') {
      console.log(
        `   ❌  archivePage "${ap.title}" (/${ap.slug}) — invalid contentType(s): ${invalid.join(', ')}`,
      )
    } else {
      console.log(`   ✅  /${ap.slug} → [${ct.join(', ')}]`)
    }
  }
  console.log()

  // ── E) Duplicate slugs within same type ───────────────────────────────────

  console.log('🔄  Slug Uniqueness (per type)')
  console.log('──────────────────────────────────────────────')

  for (const { type, slug, docs } of duplicateSlugs) {
    console.log(
      `   ❌  [${type}] slug "${slug}" used by ${docs.length} docs:`,
    )
    for (const d of docs) {
      const label = d.title || d.name || '(untitled)'
      console.log(`        → "${label}" (${d._id})`)
    }
  }

  if (duplicateSlugs.length === 0) {
    console.log('   ✅  No duplicate slugs within any type')
  }
  console.log()

  // ── F) HTML entities as literal strings in PortableText ──────────────────

  console.log('🔤  PortableText HTML Entity Check')
  console.log('──────────────────────────────────────────────')

  for (const { doc, hitSpans } of entityHits) {
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
  }

  if (entityHits.length === 0) {
    console.log('   ✅  No literal HTML entities found in PortableText spans')
  }
  console.log()

  // ── K) Spans carrying both a link and a glossary term ────────────────────

  console.log('🔗  Link + Glossary Term on One Span Check')
  console.log('──────────────────────────────────────────────')

  // The renderer draws one anchor when a span has both marks (#143), so this is a warning:
  // the second destination is silently dropped. Fix in Studio by removing one mark.
  for (const { doc, hits } of doubleMarks) {
    console.log(
      `   ⚠️   [${doc._type}] "${doc.title}" (/${doc.slug}) — ${hits.length} span(s) with both a link and a glossary term:`,
    )
    for (const text of hits.slice(0, 3)) console.log(`        Text: "${text.slice(0, 80)}"`)
    console.log('        Fix: in Studio, remove either the link or the glossary term from that text')
  }

  if (doubleMarks.length === 0) {
    console.log('   ✅  No span carries both a link and a glossary term')
  }
  console.log()

  // ── L) Citations ──────────────────────────────────────────────────────────
  //    ST-221. A typed [N] in body text renders as plain text; a number with no
  //    citations[] entry renders a pill that links nowhere.

  console.log('📎  Citation Links (L)')
  console.log('──────────────────────────────────────────────')

  for (const { doc, hits } of citationIssues) {
    const prefix = STRICT ? '❌' : '⚠️  '
    console.log(`   ${prefix} [${doc._type}] "${doc.title}" (/${doc.slug}) — ${hits.length} citation issue(s):`)
    for (const h of hits.slice(0, 5)) {
      const what = h.kind === 'typed'
        ? `typed [${h.index}] in body text; select the sentence it cites and apply the Citation Reference mark (number ${h.index}), then delete the typed [${h.index}]`
        : `[${h.index}] in a ${h.where === 'mark' ? 'Citation Reference mark' : 'table cell'} has no matching entry in Citations`
      console.log(`        ${what}`)
    }
  }

  if (citationIssues.length === 0) {
    console.log('   ✅  Every citation is linked and has a note')
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

    // A draft-only doc has a drafts.* ID but no matching published ID
    const draftOnly = findDraftOnly(rawDocs)

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

  for (const { doc, issues } of taxonomyGaps) {
    const prefix = STRICT ? '❌' : '⚠️  '
    console.log(`   ${prefix} [${doc._type}] "${doc.title}" — ${issues.join(', ')}`)
  }

  if (taxonomyGaps.length === 0) {
    console.log('   ✅  All content docs meet minimum taxonomy thresholds')
  } else {
    console.log(`\n   ${taxonomyGaps.length} doc(s) below minimum taxonomy coverage`)
  }
  console.log()

  // ── I) Missing author attribution ─────────────────────────────────────────
  //    EPIC-0183: every content doc should have ≥1 author

  console.log('👤  Author Attribution (I)')
  console.log('──────────────────────────────────────────────')

  for (const doc of missingAuthors) {
    const prefix = STRICT ? '❌' : '⚠️  '
    console.log(`   ${prefix} [${doc._type}] "${doc.title}" — no authors assigned`)
  }

  if (missingAuthors.length === 0) {
    console.log('   ✅  All content docs have at least one author')
  }
  console.log()

  // ── J) SEO metadata completeness ──────────────────────────────────────────
  //    EPIC-0183: seo.title and seo.description should be set

  console.log('🔍  SEO Metadata Completeness (J)')
  console.log('──────────────────────────────────────────────')

  for (const { doc, issues } of seoGaps) {
    const prefix = STRICT ? '❌' : '⚠️  '
    console.log(`   ${prefix} [${doc._type}] "${doc.title}" — ${issues.join(', ')}`)
  }

  if (seoGaps.length === 0) {
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
