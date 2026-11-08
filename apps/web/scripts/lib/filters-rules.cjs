/**
 * filters-rules.cjs — the judging half of validate-filters.js (SUG-269, #93).
 *
 * Pure: archivePage + content items in, verdict out. No client, no env, no
 * process.exit, no console output. validate-filters.js fetches and prints; the
 * liveness probe feeds this same function a deliberately broken fixture.
 *
 * buildFilterModel here is a copy of src/lib/filterModel.js (see the note on it
 * below). That copy is what the gate has always judged; this epic does not
 * change what is judged.
 */

// ─── WP-era key guard ─────────────────────────────────────────────────────────
// Hard fail if any of these keys appear in GROQ projections or model output.
// They were purged in v0.11.0 and must not reappear.

const WP_KEYS = ['wp_category', 'wp_tag', 'gem_status', 'gem_related_project']

/**
 * detectWpKeys(obj, path) → string[]
 * Recursively walks an object and returns paths where WP-era keys are found.
 */
function detectWpKeys(obj, path = '') {
  if (!obj || typeof obj !== 'object') return []
  const found = []
  for (const key of Object.keys(obj)) {
    const fullPath = path ? `${path}.${key}` : key
    if (WP_KEYS.includes(key)) {
      found.push(fullPath)
    }
    found.push(...detectWpKeys(obj[key], fullPath))
  }
  return found
}

/**
 * detectWpKeysInString(str) → string[]
 * Checks a GROQ query string for WP-era key substrings.
 */
function detectWpKeysInString(str) {
  return WP_KEYS.filter((k) => str.includes(k))
}

// ─── FilterModel builder (inline — avoids ESM import from src/) ──────────────
// This is a copy of the logic in src/lib/filterModel.js so the script can run
// as a standalone Node script without a bundler. Keep in sync with filterModel.js.

const FACET_TYPE = {
  author:   'reference',
  project:  'reference',
  category: 'reference',
  tag:      'reference',
  tools:    'reference',
  status:   'enum',
  client:   'enum',
}

const DEFAULT_FACET_LABELS = {
  author:   'Author',
  project:  'Project',
  category: 'Category',
  tag:      'Tag',
  tools:    'Tool / Platform',
  status:   'Status',
  client:   'Client',
}

function extractFacetItems(item, facetId) {
  switch (facetId) {
    case 'author':   return item.authors ?? []
    case 'category': return item.categories ?? []
    case 'tag':      return item.tags ?? []
    case 'project': {
      const canonical = item.projects ?? []
      const legacy = item.relatedProjects ?? []
      const seen = new Set(canonical.map((p) => p._id))
      const merged = [...canonical]
      for (const p of legacy) {
        if (!seen.has(p._id)) { seen.add(p._id); merged.push(p) }
      }
      return merged
    }
    case 'tools':
      return item.tools ?? []
    case 'status': {
      if (!item.status) return []
      return [{ _id: item.status, name: item.status }]
    }
    case 'client': {
      if (!item.client) return []
      return [{ _id: item.client, name: item.client }]
    }
    default: return []
  }
}

function normalizeTaxonomyItem(raw, facetId) {
  if (!raw || !raw._id) return null
  const type = FACET_TYPE[facetId] ?? 'reference'

  if (type === 'enum') {
    return { id: raw._id, label: raw.name ?? raw._id }
  }

  if (!raw.slug) return null
  const base = {
    id:    raw._id,
    label: raw.name ?? raw.title ?? '(unnamed)',
    slug:  raw.slug,
  }
  if ((facetId === 'category' || facetId === 'project') && raw.colorHex) {
    base.colorHex = raw.colorHex
  }
  if (facetId === 'category' && raw.parent?._id) {
    base.parent = { id: raw.parent._id, label: raw.parent.name ?? '(unnamed)', slug: raw.parent.slug ?? '' }
  }
  return base
}

function buildFilterModel(archivePage, contentItems) {
  if (!archivePage) return { archive: null, facets: [], _error: 'archivePage is null' }

  const items = contentItems ?? []
  const facetConfigs = archivePage.filterConfig?.facets ?? []

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

  const sortedConfigs = [...configs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const facets = []

  for (const config of sortedConfigs) {
    if (config.enabled === false) continue
    const facetId = config.facet
    const type = FACET_TYPE[facetId] ?? 'reference'
    const label = config.label || DEFAULT_FACET_LABELS[facetId] || facetId
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

    // Skip empty facets
    if (tally.size === 0) continue

    const options = [...tally.values()].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.label.localeCompare(b.label)
    })

    facets.push({
      id:                   facetId,
      label,
      type,
      selection:            config.selection ?? 'multi',
      order:                config.order ?? 0,
      defaultSelectedSlugs: config.defaultSelectedSlugs ?? [],
      options,
    })
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

/**
 * Judge one archive: build its filter model and apply the error rules.
 * `fails` is true for every case validate-filters.js exits 1 on at the model stage:
 * buildFilterModel threw, it returned an _error, or WP-era keys are in its output.
 */
function judgeArchive(archivePage, contentItems) {
  let model
  try {
    model = buildFilterModel(archivePage, contentItems)
  } catch (err) {
    return { model: null, threw: err.message, modelError: null, wpKeysInModel: [], fails: true }
  }
  if (model._error) {
    return { model, threw: null, modelError: model._error, wpKeysInModel: [], fails: true }
  }
  const wpKeysInModel = detectWpKeys(model)
  return { model, threw: null, modelError: null, wpKeysInModel, fails: wpKeysInModel.length > 0 }
}

module.exports = { WP_KEYS, detectWpKeys, detectWpKeysInString, buildFilterModel, judgeArchive }
