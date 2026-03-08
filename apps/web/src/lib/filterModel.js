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
 * Content items (node, article, caseStudy) are the source of truth for what appears.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FilterModel — canonical output contract v2
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * @typedef {Object} FilterModelOption
 * @property {string}  id         - Sanity _id for reference facets; enum value string for status/client
 * @property {string}  label      - Display label (tag.name, enum value, etc.)
 * @property {string}  [slug]     - URL-friendly slug. Reference types only (author, category, tag, project, tool).
 *                                  Absent for enum facets (status, client) — use `id` as URL param value instead.
 * @property {string}  [colorHex] - Hex color. categories and projects only.
 * @property {number}  count      - Content items in the current archive scope with this value.
 * @property {{id: string, label: string, slug: string}} [parent]
 *                                - Parent category. Present only on category options when groupByParent=true.
 *
 * @typedef {Object} FilterModelFacet
 * @property {string}  id         - 'author' | 'project' | 'category' | 'tag' | 'tools' | 'status'
 * @property {string}  label      - Display label for UI (from config or DEFAULT_FACET_LABELS)
 * @property {'reference'|'enum'} type  - 'reference' for Sanity doc refs; 'enum' for string enum arrays
 * @property {'single'|'multi'}   selection - Selection mode
 * @property {number}  order      - Sort order within sidebar
 * @property {string[]} defaultSelectedSlugs - Pre-selected option slugs/values on load
 * @property {FilterModelOption[]} options  - Derived options, sorted by count desc then alpha
 * @property {boolean} [grouped]  - True if groupByParent was applied (category facet only)
 *
 * @typedef {Object} FilterModel
 * @property {{ id: string, slug: string, title: string, contentTypes: string[] }} archive
 * @property {FilterModelFacet[]} facets
 * @property {string}  [_error]   - Present only if something went wrong (archivePage null, etc.)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Field naming — canonical references:
 *
 *   archivePage.filterConfig.facets[]  → Stage 4 structured facet config. READ BY THIS FILE.
 *   archivePage.frontendFilters.*      → Legacy boolean toggles in Studio UI. NOT read here.
 *   archivePage.enableFrontendFilters  → Legacy master toggle. NOT read here.
 *
 * See archivePage.ts for full documentation of this distinction.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Facet type map ───────────────────────────────────────────────────────────
// Identifies which facets are reference-based (Sanity doc refs) vs enum-based
// (string arrays directly on content documents).

const FACET_TYPE = {
  author:   'reference',
  project:  'reference',
  category: 'reference',
  tag:      'reference',
  tools:    'reference',
  status:   'enum',
  client:   'enum',
}

// ─── Default facet labels ─────────────────────────────────────────────────────

const DEFAULT_FACET_LABELS = {
  author:   'Author',
  project:  'Project',
  category: 'Category',
  tag:      'Tag',
  tools:    'Tool / Platform',
  status:   'Status',
  client:   'Client',
}

// ─── Facet extractors ─────────────────────────────────────────────────────────
// Each extractor takes a content item and returns an array of objects suitable
// for normalization into FilterModelOption entries.

/**
 * extractFacetItems(item, facetId)
 *
 * Returns the raw values for a given facet from a content item.
 *
 * For reference facets: returns expanded taxonomy reference objects
 *   (each has _id, name/title, slug, colorHex? from facetsRawQuery).
 * For enum facets (tools, status): returns synthetic objects shaped like
 *   {_id: value, name: value} so they pass through normalizeTaxonomyItem unchanged.
 *
 * Merges canonical `projects` + legacy `relatedProjects` for project facet.
 *
 * @param {object} item    - content item from facetsRawQuery
 * @param {string} facetId - facet dimension identifier
 * @returns {Array}
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

    case 'tools':
      // tools[] is now a reference array — dereferenced by facetsRawQuery
      return item.tools ?? []

    case 'status': {
      // status is a single string field — emit as single-item array if set
      if (!item.status) return []
      return [{ _id: item.status, name: item.status }]
    }

    case 'client': {
      // client is a single string field — emit as single-item array if set
      if (!item.client) return []
      return [{ _id: item.client, name: item.client }]
    }

    default:
      return []
  }
}

/**
 * normalizeTaxonomyItem(raw, facetId)
 *
 * Normalizes a raw taxonomy reference (or synthetic enum object) into a
 * consistent FilterModelOption shape.
 *
 * Reference facets: require _id + slug (pre-aliased string from GROQ).
 * Enum facets (tools, status): only require _id; slug is omitted.
 *
 * @param {object} raw
 * @param {string} facetId
 * @returns {FilterModelOption|null}
 */
function normalizeTaxonomyItem(raw, facetId) {
  if (!raw || !raw._id) return null

  const type = FACET_TYPE[facetId] ?? 'reference'

  if (type === 'enum') {
    // Enum values: id = value string, label = value string, no slug
    return {
      id:    raw._id,
      label: raw.name ?? raw._id,
    }
  }

  // Reference types require a slug
  if (!raw.slug) return null

  const base = {
    id:    raw._id,
    label: raw.name ?? raw.title ?? '(unnamed)',
    slug:  raw.slug,
  }

  // colorHex for category and project (Stage 2 integration)
  if ((facetId === 'category' || facetId === 'project') && raw.colorHex) {
    base.colorHex = raw.colorHex
  }

  // parent for category (hierarchy support)
  if (facetId === 'category' && raw.parent?._id) {
    base.parent = {
      id:    raw.parent._id,
      label: raw.parent.name ?? '(unnamed)',
      slug:  raw.parent.slug ?? '',
    }
  }

  return base
}

// ─── Core builder ─────────────────────────────────────────────────────────────

/**
 * buildFilterModel(archivePage, contentItems, options?) → FilterModel
 *
 * Takes:
 * - archivePage: result of archivePageWithFilterConfigQuery
 *                (has filterConfig.facets[], contentTypes, etc.)
 * - contentItems: result of facetsRawQuery — all content items for this archive
 * - options: optional behaviour flags
 *   - groupByParent {boolean} (default false) — for category facet, attach parent
 *     metadata to each option. The UI epic can use this to render grouped lists.
 *     When false: flat list, no change to existing behavior.
 *     When true: options carry a `parent` property where applicable; facet gains `grouped: true`.
 *
 * Returns a stable FilterModel JSON object.
 * Facets with no options are omitted (empty facet groups add no value to the UI).
 *
 * @param {object}  archivePage
 * @param {Array}   contentItems
 * @param {{ groupByParent?: boolean }} [options]
 * @returns {FilterModel}
 */
export function buildFilterModel(archivePage, contentItems, options = {}) {
  if (!archivePage) {
    return { archive: null, facets: [], _error: 'archivePage is null' }
  }

  const { groupByParent = false } = options
  const items = contentItems ?? []
  const facetConfigs = archivePage.filterConfig?.facets ?? []

  // If no filterConfig, produce a default model with all supported facets
  const configs = facetConfigs.length > 0
    ? facetConfigs
    : [
        { facet: 'author',   label: null, enabled: true, order: 1, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'project',  label: null, enabled: true, order: 2, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'category', label: null, enabled: true, order: 3, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'tag',      label: null, enabled: true, order: 4, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'client',   label: null, enabled: true, order: 5, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'tools',    label: null, enabled: true, order: 6, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'status',   label: null, enabled: true, order: 7, selection: 'multi', defaultSelectedSlugs: [] },
      ]

  // Sort by configured order
  const sortedConfigs = [...configs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const facets = []

  for (const config of sortedConfigs) {
    // Skip disabled facets entirely
    if (config.enabled === false) continue

    const facetId = config.facet
    const type = FACET_TYPE[facetId] ?? 'reference'
    const label = config.label || DEFAULT_FACET_LABELS[facetId] || facetId

    // Tally: map from option id → { optionData, count }
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

    // Skip facets with no options — empty groups add no value to the filter UI
    if (tally.size === 0) continue

    // Sort options: by count descending, then alphabetically by label
    const options = [...tally.values()].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.label.localeCompare(b.label)
    })

    const facetEntry = {
      id:                  facetId,
      label,
      type,
      selection:           config.selection ?? 'multi',
      order:               config.order ?? 0,
      defaultSelectedSlugs: config.defaultSelectedSlugs ?? [],
      options,
    }

    // groupByParent flag for category facet (hierarchy support)
    if (facetId === 'category' && groupByParent) {
      facetEntry.grouped = true
      // parent metadata is already attached to each option by normalizeTaxonomyItem
      // The UI epic will use option.parent to render grouped lists
    }

    facets.push(facetEntry)
  }

  return {
    archive: {
      id:           archivePage._id,
      slug:         archivePage.slug,
      title:        archivePage.title,
      contentTypes: archivePage.contentTypes ?? [],
    },
    facets,
  }
}

// ─── Async entry point ────────────────────────────────────────────────────────

/**
 * fetchFilterModel(slug, sanityClient, options?) → Promise<FilterModel>
 *
 * High-level convenience function.
 * Fetches the archivePage and its content items, then builds the FilterModel.
 * Used by validate-filters.js and can be used by archive page components.
 *
 * @param {string} slug - archive page slug (e.g., 'knowledge-graph', 'articles')
 * @param {import('@sanity/client').SanityClient} client
 * @param {{ groupByParent?: boolean }} [options]
 * @returns {Promise<FilterModel>}
 */
export async function fetchFilterModel(slug, client, options = {}) {
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

  return buildFilterModel(archivePage, contentItems, options)
}
