/**
 * archiveSort.js — sort options, ordering and URL encoding for archive pages (ST-275).
 *
 * Sort is a URL query param pair beside the filter params:
 *   ?sort=updated            sort key; omitted for the default (published)
 *   ?order=asc|desc          direction; omitted when it equals the key's default
 * With neither param an archive renders newest published first, as before ST-275.
 * Sorting runs in the browser: every archive already fetches its full list and
 * paginates client-side (ArchivePage paginateItems), so queries only need to
 * project the fields below.
 */

/** @typedef {'published'|'updated'|'title'} SortKey */
/** @typedef {'asc'|'desc'} SortDir */

export const DEFAULT_SORT_KEY = 'published'

/**
 * `field` is the item property compared. `dateLabel` is the short label on a
 * card footer, and `columnHead` is the list's date column header.
 */
export const SORT_OPTIONS = [
  { key: 'published', label: 'Published', field: 'publishedAt', defaultDir: 'desc', dateLabel: 'PUB', columnHead: 'Published' },
  { key: 'updated', label: 'Updated', field: '_updatedAt', defaultDir: 'desc', dateLabel: 'UPD', columnHead: 'Updated' },
  { key: 'title', label: 'Alphabetical', field: 'title', defaultDir: 'asc', dateLabel: 'PUB', columnHead: 'Published' },
]

const BY_KEY = Object.fromEntries(SORT_OPTIONS.map((o) => [o.key, o]))

export function getSortOption(key) {
  return BY_KEY[key] ?? BY_KEY[DEFAULT_SORT_KEY]
}

/** Read the sort state from URLSearchParams. Unknown values fall back to the default. */
export function parseSort(searchParams) {
  const raw = searchParams.get('sort')
  const key = BY_KEY[raw] ? raw : DEFAULT_SORT_KEY
  const rawDir = searchParams.get('order')
  const dir = rawDir === 'asc' || rawDir === 'desc' ? rawDir : BY_KEY[key].defaultDir
  return { key, dir }
}

/**
 * Write the sort state onto a URLSearchParams copy. Default key and default
 * direction write nothing, so a default view keeps a clean URL.
 */
export function applySortParams(params, { key, dir }) {
  const next = new URLSearchParams(params)
  const opt = getSortOption(key)
  if (key === DEFAULT_SORT_KEY) next.delete('sort')
  else next.set('sort', key)
  if (dir === opt.defaultDir) next.delete('order')
  else next.set('order', dir)
  next.delete('page')
  return next
}

/** The item field that carries the date shown for a sort key (title sorting shows published). */
export function dateFieldFor(key) {
  return key === 'updated' ? '_updatedAt' : 'publishedAt'
}

/**
 * Return a new array ordered by the sort state. Items with no value for the
 * field sort last in either direction. Ties break on title so the order is stable.
 */
export function sortItems(items, { key, dir }) {
  const { field } = getSortOption(key)
  const sign = dir === 'asc' ? 1 : -1
  const isTitle = field === 'title'
  const norm = (v) => (isTitle ? String(v ?? '').toLowerCase() : v ?? '')
  return [...items].sort((a, b) => {
    const av = norm(a[field])
    const bv = norm(b[field])
    const aMissing = av === ''
    const bMissing = bv === ''
    if (aMissing !== bMissing) return aMissing ? 1 : -1
    const cmp = isTitle ? av.localeCompare(bv) : av < bv ? -1 : av > bv ? 1 : 0
    if (cmp !== 0) return cmp * sign
    return String(a.title ?? '').localeCompare(String(b.title ?? ''), undefined, { sensitivity: 'base' })
  })
}
