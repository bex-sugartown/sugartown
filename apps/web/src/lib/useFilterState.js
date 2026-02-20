/**
 * useFilterState.js — URL-driven filter + pagination state hook.
 *
 * Single source of truth for all filter and pagination state in archive pages.
 * Reads from and writes to URL query params via React Router's useSearchParams.
 * No component-local state duplicates the URL.
 *
 * URL format:
 *   /articles?tags=ai,design&categories=systems&page=2
 *
 * Multi-value filter params are comma-separated slugs.
 * Unknown params are preserved (pass-through) and not stripped.
 *
 * API:
 *   activeFilters    { [facetId]: string[] }   — e.g. { tags: ['ai','design'] }
 *   currentPage      number                    — 1-indexed, default 1
 *   setFilter(facetId, slug, checked)          — toggle one slug in one facet
 *   clearFacet(facetId)                        — remove all slugs for a facet
 *   clearAll()                                 — remove all filter params + reset page
 *   setPage(n)                                 — update ?page=N
 *
 * Filter changes always reset page to 1.
 */

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

// Recognized facet IDs — only these are treated as filter params.
// Other URL params (e.g. ?utm_source=...) are preserved and ignored.
const FACET_IDS = ['author', 'project', 'category', 'tag']

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Parse a comma-separated param value into an array of non-empty strings.
 * e.g. "ai,design," → ["ai", "design"]
 */
function parseSlugs(value) {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Serialize an array of slugs into a comma-separated string.
 * Returns null if the array is empty (signals: remove the param).
 */
function serializeSlugs(slugs) {
  const filtered = slugs.filter(Boolean)
  return filtered.length > 0 ? filtered.join(',') : null
}

// ─── hook ────────────────────────────────────────────────────────────────────

export function useFilterState() {
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Read: parse activeFilters from URL ──────────────────────────────────
  const activeFilters = useMemo(() => {
    const filters = {}
    for (const facetId of FACET_IDS) {
      const slugs = parseSlugs(searchParams.get(facetId))
      if (slugs.length > 0) {
        filters[facetId] = slugs
      }
    }
    return filters
  }, [searchParams])

  // ── Read: parse currentPage from URL ────────────────────────────────────
  const currentPage = useMemo(() => {
    const raw = searchParams.get('page')
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n >= 1 ? n : 1
  }, [searchParams])

  // ── Write: setFilter ─────────────────────────────────────────────────────
  // Toggles a single slug within a facet's param.
  // Filter changes reset page to 1.
  const setFilter = useCallback(
    (facetId, slug, checked) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)

          const existing = parseSlugs(next.get(facetId))
          let updated

          if (checked) {
            // Add slug (deduplicate)
            updated = existing.includes(slug)
              ? existing
              : [...existing, slug]
          } else {
            // Remove slug
            updated = existing.filter((s) => s !== slug)
          }

          const serialized = serializeSlugs(updated)
          if (serialized) {
            next.set(facetId, serialized)
          } else {
            next.delete(facetId)
          }

          // Reset to page 1 on filter change
          next.delete('page')

          return next
        },
        { replace: false }
      )
    },
    [setSearchParams]
  )

  // ── Write: clearFacet ────────────────────────────────────────────────────
  // Removes all slugs for a single facet, resets page.
  const clearFacet = useCallback(
    (facetId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete(facetId)
          next.delete('page')
          return next
        },
        { replace: false }
      )
    },
    [setSearchParams]
  )

  // ── Write: clearAll ──────────────────────────────────────────────────────
  // Removes all filter params and page. Preserves other unrelated params.
  const clearAll = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const facetId of FACET_IDS) {
          next.delete(facetId)
        }
        next.delete('page')
        return next
      },
      { replace: false }
    )
  }, [setSearchParams])

  // ── Write: setPage ───────────────────────────────────────────────────────
  // Updates ?page=N. Removes the param if n === 1 (keeps URLs clean).
  const setPage = useCallback(
    (n) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (n <= 1) {
            next.delete('page')
          } else {
            next.set('page', String(n))
          }
          return next
        },
        { replace: false }
      )
    },
    [setSearchParams]
  )

  // ── Derived: hasActiveFilters ────────────────────────────────────────────
  const hasActiveFilters = Object.keys(activeFilters).length > 0

  return {
    activeFilters,
    currentPage,
    hasActiveFilters,
    setFilter,
    clearFacet,
    clearAll,
    setPage,
  }
}
