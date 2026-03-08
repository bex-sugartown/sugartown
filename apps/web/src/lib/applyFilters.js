/**
 * applyFilters.js — pure client-side filter logic.
 *
 * No React, no side effects, no imports. Deterministic given the same inputs.
 *
 * Filter semantics (per spec):
 *   - AND logic across facets: item must satisfy ALL active facets
 *   - OR logic within a facet: item needs at least one matching value
 *
 * Example:
 *   activeFilters = { tags: ['ai', 'design'], categories: ['systems'] }
 *   → item must have (tag 'ai' OR 'design') AND (category 'systems')
 *
 * Facet types:
 *
 *   Reference facets (Sanity doc refs) — match by slug:
 *     'author'   → item.authors[]    — [{ slug }]
 *     'project'  → item.projects[]   — [{ slug }]
 *     'category' → item.categories[] — [{ slug }]
 *     'tag'      → item.tags[]       — [{ slug }]
 *     'tools'    → item.tools[]      — [{ slug }]
 *
 *   Enum facets (plain string values) — match by value string:
 *     'status' → item.status   — string    (single status string)
 *     'client' → item.client   — string    (single client name string)
 *
 * Edge cases:
 *   - activeFilters is empty → return all items unchanged
 *   - Item missing a field → treated as no-match for that facet
 *   - Unknown facetId in activeFilters → silently ignored
 *   - Invalid value → simply won't match, item excluded gracefully
 */

// Reference facets: maps facet ID → array field name on content items.
// Each array item has a { slug } property used for matching.
const REFERENCE_FIELD_MAP = {
  author:   'authors',
  project:  'projects',
  category: 'categories',
  tag:      'tags',
  tools:    'tools',
}

// Enum facets: maps facet ID → { field, isArray }
// - isArray: true  → item[field] is a string[]; match if any element is in active set
// - isArray: false → item[field] is a string;   match if value is in active set
const ENUM_FIELD_MAP = {
  status: { field: 'status', isArray: false },
  client: { field: 'client', isArray: false },
}

/**
 * applyFilters(items, activeFilters) → filteredItems
 *
 * @param {Array}  items         — content items from Sanity (each has taxonomy arrays)
 * @param {object} activeFilters — { [facetId]: string[] } from useFilterState
 * @returns {Array} subset of items matching all active filter constraints
 */
export function applyFilters(items, activeFilters) {
  if (!items || items.length === 0) return []

  // Fast path: no active filters → return all items
  const facetEntries = Object.entries(activeFilters).filter(
    ([, values]) => values && values.length > 0
  )
  if (facetEntries.length === 0) return items

  return items.filter((item) => {
    // All active facets must match (AND)
    return facetEntries.every(([facetId, activeValues]) => {
      // ── Reference facets: match by slug ─────────────────────────────────
      const refField = REFERENCE_FIELD_MAP[facetId]
      if (refField) {
        const itemRefs = item[refField]
        if (!Array.isArray(itemRefs) || itemRefs.length === 0) return false
        // At least one slug on the item must be in the active set (OR)
        return itemRefs.some((ref) => ref?.slug && activeValues.includes(ref.slug))
      }

      // ── Enum facets: match by value string ───────────────────────────────
      const enumDef = ENUM_FIELD_MAP[facetId]
      if (enumDef) {
        const rawValue = item[enumDef.field]
        if (enumDef.isArray) {
          // tools[] — string array; at least one must match
          if (!Array.isArray(rawValue) || rawValue.length === 0) return false
          return rawValue.some((v) => typeof v === 'string' && activeValues.includes(v))
        } else {
          // status / client — single string; must match
          if (!rawValue || typeof rawValue !== 'string') return false
          return activeValues.includes(rawValue)
        }
      }

      // Unknown facet — pass through (don't exclude)
      return true
    })
  })
}

/**
 * paginateItems(items, currentPage, pageSize) → { pageItems, totalPages }
 *
 * Slices a filtered item array for the given page.
 * Used alongside applyFilters — always paginate the filtered result.
 *
 * @param {Array}  items       — already-filtered item array
 * @param {number} currentPage — 1-indexed
 * @param {number} pageSize    — items per page
 * @returns {{ pageItems: Array, totalPages: number }}
 */
export function paginateItems(items, currentPage, pageSize) {
  const total = items.length
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1
  const safePage = Math.max(1, Math.min(currentPage, totalPages || 1))
  const start = (safePage - 1) * pageSize
  const end = start + pageSize

  return {
    pageItems: items.slice(start, end),
    totalPages,
    totalItems: total,
  }
}
