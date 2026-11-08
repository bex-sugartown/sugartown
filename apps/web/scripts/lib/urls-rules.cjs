/**
 * urls-rules.cjs — the judging half of validate-urls.js (SUG-269, #93).
 *
 * Pure: takes the fetched Sanity data, returns findings. No client, no env, no
 * process.exit, no console output. validate-urls.js fetches and prints; the
 * liveness probe (scripts/validate-liveness-probes.js) feeds this same function
 * a deliberately broken fixture. CommonJS so the synchronous probe harness can
 * `require` it; the ESM validator imports it by name.
 */

// Route registry (inline — mirrors src/lib/routes.js). Duplicated so the script has no bundler dependency.
const TYPE_NAMESPACES = {
  article: 'articles',
  caseStudy: 'case-studies',
  node: 'nodes',
  glossaryTerm: 'glossary',
  releaseNote: 'releases',
}

function getCanonicalPath({ docType, slug }) {
  if (!slug) return null
  const s = slug.replace(/^\/+|\/+$/g, '').trim()
  if (!s) return null
  if (docType === 'page') return `/${s}`
  const prefix = TYPE_NAMESPACES[docType]
  if (!prefix) return null
  return `/${prefix}/${s}`
}

const ARCHIVE_PATHS = ['/articles', '/case-studies', '/knowledge-graph', '/nodes', '/releases']
const TAXONOMY_BASE_PATHS = ['/tags', '/categories', '/projects', '/people', '/tools']

// Reserved namespace slugs that page documents must never use.
// A page slug matching any of these would shadow the canonical archive/taxonomy route.
const RESERVED_PAGE_SLUGS = [
  'articles',
  'case-studies',
  'knowledge-graph',
  'nodes',
  'releases',
  'tags',
  'categories',
  'projects',
  'people',
  'tools',
]

function validateNavItemUrl(rawUrl) {
  if (!rawUrl) return { valid: false, reason: 'url is empty/null' }
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return { valid: true }

  // Normalise trailing slash: /knowledge-graph/ → /knowledge-graph
  // (except root "/" which should stay as-is)
  const url = rawUrl.length > 1 ? rawUrl.replace(/\/+$/, '') : rawUrl

  if (url !== rawUrl) {
    // Trailing slash detected — warn about it but still check if the normalised path is valid
    const inner = validateNavItemUrl(url)
    if (inner.valid) {
      return {
        valid: false,
        reason: `trailing slash — canonical path is "${url}" (update in Sanity nav)`,
      }
    }
  }

  if (url === '/') return { valid: true }
  if (ARCHIVE_PATHS.includes(url)) return { valid: true }
  if (TAXONOMY_BASE_PATHS.some((b) => url === b || url.startsWith(b + '/'))) return { valid: true }
  const namespacePrefixes = Object.values(TYPE_NAMESPACES).map((p) => `/${p}/`)
  if (namespacePrefixes.some((prefix) => url.startsWith(prefix))) return { valid: true }
  const segments = url.replace(/^\//, '').split('/')
  const reserved = [
    ...Object.values(TYPE_NAMESPACES),
    ...ARCHIVE_PATHS.map((p) => p.replace(/^\//, '')),
    ...TAXONOMY_BASE_PATHS.map((p) => p.replace(/^\//, '')),
  ]
  if (segments.length === 1 && !reserved.includes(segments[0])) return { valid: true }
  return { valid: false, reason: `"${url}" does not match any canonical route pattern` }
}

/** One nav link: validity, plus the "archive route with no published archivePage" warning. */
function judgeNavLink(link, publishedArchiveSlugs) {
  const { valid, reason } = validateNavItemUrl(link.url)
  let archiveWarning = null
  if (valid && link.url) {
    const stripped = link.url.replace(/^\/|\/$/g, '')
    if (ARCHIVE_PATHS.includes(`/${stripped}`) && !publishedArchiveSlugs.has(stripped)) {
      archiveWarning = `no published archivePage doc with slug "${stripped}" — route will 404`
    }
  }
  const warnings = []
  if (!valid) warnings.push({ label: link.label, url: link.url, reason })
  if (archiveWarning) warnings.push({ label: link.label, url: link.url, reason: archiveWarning })
  return { label: link.label, url: link.url, ok: valid && !archiveWarning, warnings }
}

/**
 * Judge the data validate-urls.js fetches.
 *
 * Errors (exit 1): duplicate canonical URLs, reserved-namespace collisions.
 * Warnings (exit 0): published docs missing a slug, nav problems.
 */
function judgeUrls(data) {
  const { pages, articles, caseStudies, nodes, releaseNotes, archivePages } = data
  const missingSlug = [
    ...data.pagesNoSlug,
    ...data.articlesNoSlug,
    ...data.caseStudiesNoSlug,
    ...data.nodesNoSlug,
    ...data.releaseNotesNoSlug,
  ]

  const publishedArchiveSlugs = new Set(archivePages.map((a) => a.slug))

  const urlMap = new Map() // canonical path → doc info
  const duplicates = []
  const allDocs = [
    ...pages.map((d) => ({ ...d, docType: 'page' })),
    ...articles.map((d) => ({ ...d, docType: 'article' })),
    ...caseStudies.map((d) => ({ ...d, docType: 'caseStudy' })),
    ...nodes.map((d) => ({ ...d, docType: 'node' })),
    ...releaseNotes.map((d) => ({ ...d, docType: 'releaseNote' })),
  ]
  for (const doc of allDocs) {
    const path = getCanonicalPath({ docType: doc.docType, slug: doc.slug })
    if (!path) continue
    if (urlMap.has(path)) duplicates.push({ path, docs: [urlMap.get(path), doc] })
    else urlMap.set(path, doc)
  }

  const reservedCollisions = pages.filter((p) => RESERVED_PAGE_SLUGS.includes(p.slug))

  const navWarnings = []
  const navReport = []
  for (const nav of data.navItems ?? []) {
    if (!nav.items?.length) continue
    const items = nav.items.map((item) => {
      const judged = judgeNavLink(item, publishedArchiveSlugs)
      navWarnings.push(...judged.warnings)
      const children = (item.children ?? []).map((child) => {
        const c = judgeNavLink(child, publishedArchiveSlugs)
        navWarnings.push(...c.warnings)
        return c
      })
      return { ...judged, children }
    })
    navReport.push({ title: nav.title, items })
  }

  return {
    totalDocs: allDocs.length,
    duplicates,
    missingSlug,
    reservedCollisions,
    navReport,
    navWarnings,
    errors: duplicates.length + reservedCollisions.length,
    warnings: missingSlug.length + navWarnings.length,
  }
}

module.exports = { judgeUrls, getCanonicalPath, validateNavItemUrl, RESERVED_PAGE_SLUGS }
