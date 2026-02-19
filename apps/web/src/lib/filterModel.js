/**
 * filterModel.js — Stage 4: Taxonomy Relationship Architecture
 *
 * Stable FilterModel builder for archive filter sidebars.
 *
 * Design contract:
 * - Receives an archivePage doc (with filterConfig) + raw content items (from facetsRawQuery)
 * - Derives available facet option values and counts from content usage
 * - Returns a stable FilterModel JSON object
 *
 * Key principle: relationships are derived from content usage, not from taxonomy docs.
 * Taxonomy docs (category, tag, project, person) are labels/metadata.
 * Content items (node, article, caseStudy, page) are the source of truth for what appears.
 *
 * FilterModel TypeScript contract (implemented here in plain JS):
 *
 * type FilterModel = {
 *   archive: {
 *     id: string
 *     slug: string
 *     title: string
 *     contentTypes: string[]
 *   }
 *   facets: Array<{
 *     id: 'author' | 'project' | 'category' | 'tag'
 *     label: string
 *     selection: 'single' | 'multi'
 *     order: number
 *     defaultSelectedSlugs?: string[]
 *     options: Array<{
 *       id: string       // Sanity _id
 *       title: string    // display name
 *       slug: string     // for URL params
 *       colorHex?: string // from Stage 2 (category / project only)
 *       count: number    // number of content items referencing this option
 *     }>
 *   }>
 * }
 */

// ─── Default facet labels ─────────────────────────────────────────────────────

const DEFAULT_FACET_LABELS = {
  author: 'Author',
  project: 'Project',
  category: 'Category',
  tag: 'Tag',
}

// ─── Facet extractors ─────────────────────────────────────────────────────────
// Each extractor takes a content item and returns an array of taxonomy option
// objects present on that item for the given facet dimension.

/**
 * extractFacetItems(item, facetId)
 *
 * Returns the array of taxonomy references on a content item for a given facet.
 * Merges canonical field (`projects`) with legacy field (`relatedProjects`) for project facet
 * so existing data is not lost.
 *
 * @param {object} item  - content item from facetsRawQuery
 * @param {string} facetId - 'author' | 'project' | 'category' | 'tag'
 * @returns {Array<{_id, slug, name|title, colorHex?, role?}>}
 */
function extractFacetItems(item, facetId) {
  switch (facetId) {
    case 'author':
      return item.authors ?? []
    case 'category':
      return item.categories ?? []
    case 'tag':
      return item.tags ?? []
    case 'project': {
      // Merge canonical `projects` + legacy `relatedProjects` — deduplicate by _id
      const canonical = item.projects ?? []
      const legacy = item.relatedProjects ?? []
      const seen = new Set(canonical.map((p) => p._id))
      const merged = [...canonical]
      for (const p of legacy) {
        if (!seen.has(p._id)) {
          seen.add(p._id)
          merged.push(p)
        }
      }
      return merged
    }
    default:
      return []
  }
}

/**
 * normalizeTaxonomyItem(raw, facetId)
 *
 * Normalizes a taxonomy reference object into a consistent shape.
 * PERSON_FRAGMENT uses `name`, others use `name` too.
 * All have `slug` as a pre-aliased string from GROQ (not slug.current).
 *
 * @param {object} raw
 * @param {string} facetId
 * @returns {{ id: string, title: string, slug: string, colorHex?: string }}
 */
function normalizeTaxonomyItem(raw, facetId) {
  if (!raw || !raw._id || !raw.slug) return null

  const base = {
    id: raw._id,
    title: raw.name ?? raw.title ?? '(unnamed)',
    slug: raw.slug,
  }

  // Include colorHex for category and project (Stage 2 integration)
  if ((facetId === 'category' || facetId === 'project') && raw.colorHex) {
    base.colorHex = raw.colorHex
  }

  return base
}

// ─── Core builder ─────────────────────────────────────────────────────────────

/**
 * buildFilterModel(archivePage, contentItems) → FilterModel
 *
 * Takes:
 * - archivePage: result of archivePageWithFilterConfigQuery (has filterConfig, contentTypes, etc.)
 * - contentItems: result of facetsRawQuery — all content items for the archive's contentTypes
 *
 * Returns a stable FilterModel JSON object.
 * Facets with no options are still included (as empty arrays) — UI decides whether to hide them.
 *
 * @param {object} archivePage
 * @param {Array}  contentItems
 * @returns {object} FilterModel
 */
export function buildFilterModel(archivePage, contentItems) {
  if (!archivePage) {
    return { archive: null, facets: [], _error: 'archivePage is null' }
  }

  const items = contentItems ?? []
  const facetConfigs = archivePage.filterConfig?.facets ?? []

  // If no filterConfig, produce a default model with all four facets enabled
  const configs = facetConfigs.length > 0
    ? facetConfigs
    : [
        { facet: 'author',   label: null, enabled: true, order: 1, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'project',  label: null, enabled: true, order: 2, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'category', label: null, enabled: true, order: 3, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'tag',      label: null, enabled: true, order: 4, selection: 'multi', defaultSelectedSlugs: [] },
      ]

  // Sort by configured order
  const sortedConfigs = [...configs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const facets = []

  for (const config of sortedConfigs) {
    // Skip disabled facets entirely
    if (config.enabled === false) continue

    const facetId = config.facet
    const label = config.label || DEFAULT_FACET_LABELS[facetId] || facetId

    // Tally: map from taxonomy _id → { optionData, count }
    const tally = new Map()

    for (const item of items) {
      const refs = extractFacetItems(item, facetId)
      for (const ref of refs) {
        const normalized = normalizeTaxonomyItem(ref, facetId)
        if (!normalized) continue

        if (tally.has(normalized.id)) {
          tally.get(normalized.id).count += 1
        } else {
          tally.set(normalized.id, { ...normalized, count: 1 })
        }
      }
    }

    // Sort options: by count descending, then alphabetically
    const options = [...tally.values()].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.title.localeCompare(b.title)
    })

    facets.push({
      id: facetId,
      label,
      selection: config.selection ?? 'multi',
      order: config.order ?? 0,
      defaultSelectedSlugs: config.defaultSelectedSlugs ?? [],
      options,
    })
  }

  return {
    archive: {
      id: archivePage._id,
      slug: archivePage.slug,
      title: archivePage.title,
      contentTypes: archivePage.contentTypes ?? [],
    },
    facets,
  }
}

// ─── Async entry point ────────────────────────────────────────────────────────

/**
 * fetchFilterModel(slug, sanityClient) → Promise<FilterModel>
 *
 * High-level convenience function.
 * Fetches the archivePage and its content items, then builds the FilterModel.
 * Used by validate-filters.js and can be used by archive page components.
 *
 * @param {string} slug - archive page slug (e.g., 'knowledge-graph', 'articles')
 * @param {import('@sanity/client').SanityClient} client
 * @returns {Promise<FilterModel>}
 */
export async function fetchFilterModel(slug, client) {
  const { archivePageWithFilterConfigQuery, facetsRawQuery } = await import('./queries.js')

  const archivePage = await client.fetch(archivePageWithFilterConfigQuery, { slug })
  if (!archivePage) {
    return {
      archive: { slug, title: null, contentTypes: [] },
      facets: [],
      _error: `No published archivePage doc found with slug "${slug}"`,
    }
  }

  const contentTypes = archivePage.contentTypes ?? []
  const contentItems = contentTypes.length > 0
    ? await client.fetch(facetsRawQuery, { contentTypes })
    : []

  return buildFilterModel(archivePage, contentItems)
}
