/**
 * Route Registry — Canonical URL Authority
 *
 * Single source of truth for all URL patterns, canonical path building,
 * and route classification. Every URL in the app must be produced by
 * this module. No path strings should be hard-coded elsewhere.
 *
 * URL namespace scheme (industry standard multi-type CMS):
 *   /                         → homepage (singleton)
 *   /:slug                    → page type (root pages: /about, /contact, etc.)
 *   /articles/:slug           → article type
 *   /case-studies/:slug       → caseStudy type
 *   /nodes/:slug              → node type (knowledge graph)
 *   /articles                 → article archive landing
 *   /case-studies             → caseStudy archive landing
 *   /knowledge-graph          → node archive landing
 *   /tags/:slug               → tag taxonomy detail
 *   /categories/:slug         → category taxonomy detail
 *   /projects/:slug           → project taxonomy detail
 *   /people/:slug             → person taxonomy detail
 *   /tools/:slug              → tool taxonomy detail
 */

// ─── Namespace prefixes ──────────────────────────────────────────────────────

/** Maps Sanity _type to its URL namespace prefix. */
export const TYPE_NAMESPACES = {
  article: 'articles',
  caseStudy: 'case-studies',
  node: 'nodes',
  // "page" has no prefix — it resolves at root: /:slug
}

/**
 * Maps taxonomy Sanity _type to its URL namespace prefix.
 * Taxonomy detail pages are keyed by slug.current for tag/category/person,
 * and by projectId for project (projects have no slug field).
 *
 * ⚠️  PLURALIZATION WARNING — these are IRREGULAR. Never compute a URL segment
 * by appending 's' to the _type string:
 *   category + 's' = 'categorys'  ← WRONG  →  use 'categories'
 *   person   + 's' = 'persons'    ← WRONG  →  use 'people'
 * Always look up the prefix here. TaxonomyDetailPage back-link configs,
 * TAXONOMY_CONFIG entries, and any other code that builds taxonomy URLs
 * MUST use an explicit archivePath / prefix from this map — not string arithmetic.
 *
 * Examples:
 *   getCanonicalPath({ docType: 'tag', slug: 'ai-generated' }) → '/tags/ai-generated'
 *   getCanonicalPath({ docType: 'category', slug: 'systems' }) → '/categories/systems'
 *   getCanonicalPath({ docType: 'person', slug: 'bhead' })     → '/people/bhead'
 *   getCanonicalPath({ docType: 'project', slug: 'sugartown-cms' }) → '/projects/sugartown-cms'
 */
export const TAXONOMY_NAMESPACES = {
  tag: 'tags',
  category: 'categories',
  project: 'projects',
  person: 'people',
  tool: 'tools',
}

// ─── Archive paths ───────────────────────────────────────────────────────────

/**
 * Canonical archive (listing) paths.
 * These resolve to landing pages that do not require a Sanity doc lookup.
 * Used by the router and nav validation.
 */
export const ARCHIVE_PATHS = [
  '/articles',
  '/case-studies',
  '/knowledge-graph',
  '/nodes', // alternate — may redirect to /knowledge-graph in a later phase
]

// ─── Taxonomy base paths ─────────────────────────────────────────────────────

/**
 * Reserved taxonomy namespace prefixes (placeholder routes).
 * No live content required — rendered as "coming soon" until Stage 4.
 */
export const TAXONOMY_BASE_PATHS = [
  '/tags',
  '/categories',
  '/projects',
  '/people',
  '/tools',
]

// ─── Slug normalization ───────────────────────────────────────────────────────

/**
 * normalizeSlug(input) → string
 *
 * Strips leading/trailing slashes and whitespace.
 * Returns empty string if input is null/undefined/empty.
 * Does NOT force lower-case — Sanity slug fields already enforce it.
 */
export function normalizeSlug(input) {
  if (!input || typeof input !== 'string') return ''
  return input.replace(/^\/+|\/+$/g, '').trim()
}

// ─── Canonical path builder ───────────────────────────────────────────────────

/**
 * getCanonicalPath({ docType, slug }) → string
 *
 * Returns the canonical URL path for a given Sanity document.
 * This is the ONLY place URLs are constructed from doc type + slug.
 *
 * @param {object} params
 * @param {string} params.docType  – Sanity _type (e.g. "article", "page", "node")
 * @param {string} params.slug     – slug.current value
 * @returns {string} Canonical path (always starts with /)
 *
 * Examples:
 *   getCanonicalPath({ docType: 'article', slug: 'my-article' }) → '/articles/my-article'
 *   getCanonicalPath({ docType: 'caseStudy', slug: 'acme' })   → '/case-studies/acme'
 *   getCanonicalPath({ docType: 'node', slug: 'gpt-4' })       → '/nodes/gpt-4'
 *   getCanonicalPath({ docType: 'page', slug: 'about' })       → '/about'
 */
export function getCanonicalPath({ docType, slug }) {
  const s = normalizeSlug(slug)
  if (!s) {
    console.warn(`[routes] getCanonicalPath: empty slug for docType="${docType}"`)
    return '/'
  }

  if (docType === 'page' || docType === 'archivePage') {
    return `/${s}`
  }

  // Check content type namespaces first
  const contentPrefix = TYPE_NAMESPACES[docType]
  if (contentPrefix) {
    return `/${contentPrefix}/${s}`
  }

  // Check taxonomy namespaces
  const taxonomyPrefix = TAXONOMY_NAMESPACES[docType]
  if (taxonomyPrefix) {
    return `/${taxonomyPrefix}/${s}`
  }

  console.warn(`[routes] getCanonicalPath: unknown docType="${docType}", slug="${s}"`)
  return `/${s}`
}

// ─── Archive path for a doc type ─────────────────────────────────────────────

/**
 * getArchivePath(docType) → string | null
 *
 * Returns the canonical archive path for a content type.
 * "node" maps to /knowledge-graph (the featured archive name), with /nodes
 * as an alternate that the router also handles.
 */
export function getArchivePath(docType) {
  const map = {
    article: '/articles',
    caseStudy: '/case-studies',
    node: '/knowledge-graph',
  }
  return map[docType] ?? null
}

// ─── Route classification helpers ────────────────────────────────────────────

/**
 * isArchivePath(pathname) → boolean
 * Returns true if the pathname is a known archive landing page.
 */
export function isArchivePath(pathname) {
  return ARCHIVE_PATHS.includes(pathname)
}

/**
 * isTaxonomyPath(pathname) → boolean
 * Returns true if the pathname starts with a reserved taxonomy base path.
 */
export function isTaxonomyPath(pathname) {
  return TAXONOMY_BASE_PATHS.some((base) => pathname === base || pathname.startsWith(base + '/'))
}

// ─── Navigation validation (dev-only) ────────────────────────────────────────

/**
 * validateNavItem(url) → { valid: boolean, reason?: string }
 *
 * Dev-only check: warns if a nav item URL is not a recognised canonical path.
 * External URLs (http/https) are always considered valid and skipped.
 */
export function validateNavItem(rawUrl) {
  if (!rawUrl) return { valid: false, reason: 'url is empty/null' }

  // External links are out of scope
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return { valid: true }
  }

  // Normalise trailing slash (except root "/")
  const url = rawUrl.length > 1 ? rawUrl.replace(/\/+$/, '') : rawUrl

  if (url !== rawUrl) {
    // Trailing slash — check if the normalised path is valid, report either way
    const inner = validateNavItem(url)
    if (inner.valid) {
      return {
        valid: false,
        reason: `trailing slash — canonical path is "${url}" (update in Sanity nav)`,
      }
    }
  }

  // Root (homepage)
  if (url === '/') return { valid: true }

  // Known archive paths
  if (isArchivePath(url)) return { valid: true }

  // Reserved taxonomy paths
  if (isTaxonomyPath(url)) return { valid: true }

  // Namespaced content paths: /articles/*, /case-studies/*, /nodes/*
  const namespacePrefixes = Object.values(TYPE_NAMESPACES).map((p) => `/${p}/`)
  if (namespacePrefixes.some((prefix) => url.startsWith(prefix))) {
    return { valid: true }
  }

  // Root page: /:slug (single segment, no reserved prefix)
  // IMPORTANT: This also enforces that content-type paths appear with their namespace prefix.
  // e.g. /my-article (article type, no prefix) is rejected here because:
  //   - it has 1 segment, but "my-article" is not in reservedPrefixes
  //   wait — actually that would be accepted. The rejection happens below for multi-segment
  //   paths and for single-segment paths that ARE reserved prefixes (e.g. /articles alone).
  //
  // Non-canonical content paths like /articles-no-prefix/my-article (2 segments, no known
  // namespace prefix) fall through all checks above and are caught by the final `return false`.
  // A bare content slug /my-article (1 segment) resolves as a /:slug root page — this is
  // intentional: the router hands it to RootPage, which 404s if no page doc is found.
  const segments = url.replace(/^\//, '').split('/')
  const reservedPrefixes = [
    ...Object.values(TYPE_NAMESPACES),
    ...ARCHIVE_PATHS.map((p) => p.replace(/^\//, '')),
    ...TAXONOMY_BASE_PATHS.map((p) => p.replace(/^\//, '')),
  ]
  // Single-segment paths that are NOT reserved prefixes are valid root page candidates.
  // Single-segment paths that ARE reserved prefixes (e.g. /articles, /nodes) are already
  // caught by isArchivePath() above — so they won't reach this branch.
  if (segments.length === 1 && !reservedPrefixes.includes(segments[0])) {
    return { valid: true }
  }

  // All other paths — including multi-segment paths with unrecognised prefixes — are invalid.
  return {
    valid: false,
    reason: `"${url}" does not match any canonical route pattern`,
  }
}
