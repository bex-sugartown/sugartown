/**
 * content-rules.cjs — the judging half of validate-content.js (SUG-269, #93).
 *
 * Pure: the fetched Sanity data in, findings out. No client, no env, no
 * process.exit, no console output. validate-content.js fetches and prints; the
 * liveness probe feeds this same function a deliberately broken fixture.
 *
 * Errors (exit 1): archivePage with empty or invalid contentTypes, duplicate
 * slugs within one type. Under `strict`, the quality checks K, H, I and J also
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
    noArchivePages, archiveResults, duplicateSlugs, entityHits, doubleMarks,
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

module.exports = { judgeContent, findDraftOnly, MINIMUMS, VALID_ARCHIVE_CONTENT_TYPES }
