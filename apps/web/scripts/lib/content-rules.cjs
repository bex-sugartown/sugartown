/**
 * content-rules.cjs — the judging half of validate-content.js (SUG-269, #93).
 *
 * Pure: the fetched Sanity data in, findings out. No client, no env, no
 * process.exit, no console output. validate-content.js fetches and prints; the
 * liveness probe feeds this same function a deliberately broken fixture.
 *
 * Errors (exit 1): archivePage with empty or invalid contentTypes, duplicate
 * slugs within one type. Under `strict`, the quality checks K, L, H, I and J also
 * count as errors. Everything else is a warning (exit 0).
 */

const VALID_ARCHIVE_CONTENT_TYPES = ['article', 'caseStudy', 'releaseNote', 'node', 'project', 'glossaryTerm']

// EPIC-0183 minimum taxonomy coverage (check H).
const MINIMUMS = {
  categories: 1,
  tags: 3,
  tools: { article: 1, node: 1, caseStudy: 0 },
}

// Matches numeric entities (&#8220;) and named entities (&amp; &nbsp; etc.)
// but NOT bare ampersands that are part of valid text
const ENTITY_RE = /&#\d+;|&[a-zA-Z]+;/

// What a typed citation looks like is defined once, in the renderer's parser (ST-221).
const { splitCitations } = require('../../src/lib/citations.js')
const typedCites = (text) => splitCitations(text).filter((p) => typeof p === 'object' && p).map((p) => p.cite)

/**
 * L) Citations (ST-221). A typed [N] in a Portable Text span renders as plain text, so it
 * should be a citationRef mark instead (kind 'typed'). A citationRef index or a typed [N] in
 * a table cell with no citations[] entry at that number links nowhere (kind 'dangling').
 */
function judgeCitations(doc) {
  const hits = []
  const n = doc.citationCount ?? 0
  for (const block of (doc.markBlocks ?? []).flat()) {
    if (!block) continue
    for (const d of block.defs ?? []) {
      if (d._type === 'citationRef' && !(d.index >= 1 && d.index <= n)) hits.push({ kind: 'dangling', where: 'mark', index: d.index })
    }
    for (const span of block.spans ?? []) {
      if (span._type !== 'span') continue
      for (const i of typedCites(span.text)) hits.push({ kind: 'typed', where: 'text', index: i, text: span.text ?? '' })
    }
  }
  for (const cell of (doc.tableCells ?? []).flat(2)) {
    for (const i of typedCites(cell)) if (i > n) hits.push({ kind: 'dangling', where: 'table', index: i, text: cell })
  }
  return hits
}

function judgeContent(data, { strict = false } = {}) {
  let errors = 0
  let warnings = 0

  // A) Nav item quality
  const navIssues = []
  for (const nav of data.nav ?? []) {
    const allItems = [
      ...(nav.items ?? []),
      ...(nav.items ?? []).flatMap((i) => i.children ?? []),
    ]
    for (const item of allItems) {
      if (!item.url) {
        navIssues.push({ kind: 'missingUrl', item, navTitle: nav.title })
        warnings++
      } else if (item.url.length > 1 && item.url.endsWith('/')) {
        navIssues.push({ kind: 'trailingSlash', item, navTitle: nav.title })
        warnings++
      }
    }
  }

  // B) Missing required fields
  const missingTitle = data.missingTitle ?? []
  const missingSlug = data.missingSlug ?? []
  warnings += missingTitle.length
  warnings += missingSlug.length
  const contentMissingExcerpt = (data.content ?? []).filter(
    (d) => !d.excerpt || d.excerpt.trim() === '',
  )

  // C) Orphaned taxonomy references
  const validIds = new Set([
    ...(data.taxonomies ?? []).map((t) => t._id),
    ...(data.content ?? []).map((c) => c._id),
    ...(data.pages ?? []).map((p) => p._id),
  ])
  const orphans = []
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
        orphans.push({ doc, refId })
        warnings++
      }
    }
  }

  // D) Archive page validation
  const archivePages = data.archivePages ?? []
  const noArchivePages = archivePages.length === 0
  if (noArchivePages) warnings++
  const archiveResults = archivePages.map((ap) => {
    const ct = ap.contentTypes ?? []
    if (ct.length === 0) {
      errors++
      return { ap, ct, kind: 'empty', invalid: [] }
    }
    const invalid = ct.filter((t) => !VALID_ARCHIVE_CONTENT_TYPES.includes(t))
    if (invalid.length > 0) {
      errors++
      return { ap, ct, kind: 'invalid', invalid }
    }
    return { ap, ct, kind: 'ok', invalid: [] }
  })

  // E) Duplicate slugs within same type
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
  const duplicateSlugs = []
  for (const [type, slugMap] of slugsByType) {
    for (const [slug, docs] of slugMap) {
      if (docs.length > 1) {
        duplicateSlugs.push({ type, slug, docs })
        errors++
      }
    }
  }

  // F) HTML entities as literal strings in PortableText
  const portableDocs = data.portableTextDocs ?? []
  const entityHits = []
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
      entityHits.push({ doc, hitSpans })
      warnings++
    }
  }

  // K) Spans carrying both a link and a glossary term
  const doubleMarks = []
  for (const doc of portableDocs) {
    const hits = []
    for (const block of (doc.markBlocks ?? []).flat()) {
      if (!block) continue // sections without content project to null
      const typeByKey = new Map((block.defs ?? []).map((d) => [d._key, d._type]))
      for (const span of block.spans ?? []) {
        if (span._type !== 'span') continue
        const types = (span.marks ?? []).map((m) => typeByKey.get(m))
        if (types.includes('link') && types.includes('glossaryTermRef')) {
          hits.push(span.text ?? '')
        }
      }
    }
    if (hits.length > 0) {
      doubleMarks.push({ doc, hits })
      if (strict) { errors++ } else { warnings++ }
    }
  }

  // L) Citations: typed [N] in body text, and citation numbers with no note
  const citationIssues = []
  for (const doc of portableDocs) {
    const hits = judgeCitations(doc)
    if (hits.length > 0) {
      citationIssues.push({ doc, hits })
      if (strict) { errors++ } else { warnings++ }
    }
  }

  // H) Minimum taxonomy coverage
  const contentDocs = data.content ?? []
  const taxonomyGaps = []
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
      taxonomyGaps.push({ doc, issues })
      if (strict) { errors++ } else { warnings++ }
    }
  }

  // I) Missing author attribution
  const missingAuthors = []
  for (const doc of contentDocs) {
    if ((doc.authorCount ?? 0) < 1) {
      missingAuthors.push(doc)
      if (strict) { errors++ } else { warnings++ }
    }
  }

  // J) SEO metadata completeness
  const seoGaps = []
  for (const doc of contentDocs) {
    const issues = []
    if (!doc.hasSeoTitle) issues.push('missing seo.title')
    if (!doc.hasSeoDescription) issues.push('missing seo.description')
    if (issues.length > 0) {
      seoGaps.push({ doc, issues })
      if (strict) { errors++ } else { warnings++ }
    }
  }

  return {
    navIssues, missingTitle, missingSlug, contentMissingExcerpt, orphans,
    noArchivePages, archiveResults, duplicateSlugs, entityHits, doubleMarks, citationIssues,
    taxonomyGaps, missingAuthors, seoGaps, contentDocs,
    errors, warnings,
  }
}

/** G) Draft-only documents: a drafts.* id with no matching published id. */
function findDraftOnly(rawDocs) {
  const publishedIds = new Set()
  const draftDocs = []
  for (const doc of rawDocs) {
    if (doc._id.startsWith('drafts.')) {
      draftDocs.push(doc)
    } else {
      publishedIds.add(doc._id)
    }
  }
  return draftDocs.filter((d) => {
    const publishedId = d._id.replace(/^drafts\./, '')
    return !publishedIds.has(publishedId)
  })
}

module.exports = { judgeContent, judgeCitations, findDraftOnly, MINIMUMS, VALID_ARCHIVE_CONTENT_TYPES }
