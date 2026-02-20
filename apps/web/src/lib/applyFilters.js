/**
 * applyFilters.js — pure client-side filter logic.
 *
 * No React, no side effects, no imports. Deterministic given the same inputs.
 *
 * Filter semantics (per spec):
 *   - AND logic across facets: item must satisfy ALL active facets
 *   - OR logic within a facet: item needs at least one matching slug
 *
 * Example:
 *   activeFilters = { tags: ['ai', 'design'], categories: ['systems'] }
 *   → item must have (tag 'ai' OR 'design') AND (category 'systems')
 *
 * Taxonomy field mapping (matches filterModel.js extractFacetItems convention):
 *   'author'   → item.authors[]   — { slug }
 *   'project'  → item.projects[]  — { slug }
 *   'category' → item.categories[] — { slug }
 *   'tag'      → item.tags[]      — { slug }
 *
 * Edge cases:
 *   - activeFilters is empty → return all items unchanged
 *   - Item missing a taxonomy field → treated as empty array (no match for that facet)
 *   - Unknown facetId in activeFilters → silently ignored (not in FIELD_MAP)
 *   - Invalid slug → simply won't match, item excluded gracefully
 */

// Maps facet IDs (URL param names) to the item field they filter against.
// Matches the convention in filterModel.js extractFacetItems().
const FIELD_MAP = {
  author: 'authors',
  project: 'projects',
  category: 'categories',
  tag: 'tags',
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
    ([, slugs]) => slugs && slugs.length > 0
  )
  if (facetEntries.length === 0) return items

  return items.filter((item) => {
    // All active facets must match (AND)
    return facetEntries.every(([facetId, activeSlugs]) => {
      const field = FIELD_MAP[facetId]
      if (!field) return true // unknown facet — pass through

      const itemRefs = item[field]
      if (!Array.isArray(itemRefs) || itemRefs.length === 0) return false

      // At least one slug on the item must be in the active set (OR)
      return itemRefs.some((ref) => ref?.slug && activeSlugs.includes(ref.slug))
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
