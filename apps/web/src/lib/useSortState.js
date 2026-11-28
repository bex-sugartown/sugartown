/**
 * useSortState.js — URL-driven archive sort state (ST-275).
 *
 * Mirrors useFilterState: the URL is the single source of truth. Changing the
 * sort resets `page`, and every other param (filters, view) is preserved.
 *
 * API:
 *   sort                         { key, dir }
 *   setSort(key)                 pick a key at its default direction; picking the
 *                                active key again flips the direction
 */

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { applySortParams, getSortOption, parseSort } from './archiveSort'

export function useSortState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const sort = useMemo(() => parseSort(searchParams), [searchParams])

  const setSort = useCallback(
    (key) => {
      setSearchParams(
        (prev) => {
          const current = parseSort(prev)
          const dir =
            current.key === key
              ? current.dir === 'asc' ? 'desc' : 'asc'
              : getSortOption(key).defaultDir
          return applySortParams(prev, { key, dir })
        },
        { replace: false }
      )
    },
    [setSearchParams]
  )

  return { sort, setSort }
}
