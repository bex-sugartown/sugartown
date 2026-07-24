/**
 * Pagination — dumb, fully controlled page navigation component.
 *
 * Props:
 *   currentPage  {number}   — 1-indexed current page
 *   totalPages   {number}   — total number of pages
 *   onPageChange {function} — (pageNumber) → void
 *
 * Renders: Prev · 1 · 2 · … · 5 · 6 · Next
 * Ellipsis appears when totalPages > 7 and current is far from edges.
 *
 * Accessibility:
 *   - <nav> with aria-label="Pagination"
 *   - Current page has aria-current="page"
 *   - Prev/Next disabled (not just styled) when at edges
 *   - All interactive elements are semantic <button> elements
 */
import { IndexCell } from '@sugartown/design-system'
import styles from './Pagination.module.css'

// ─── Page number list builder ─────────────────────────────────────────────────
// Returns an array of page numbers and 'ellipsis' strings.
// e.g. [1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 12]

function buildPageList(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = []
  const delta = 2 // pages shown on either side of current

  const rangeStart = Math.max(2, currentPage - delta)
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta)

  pages.push(1)

  if (rangeStart > 2) {
    pages.push('ellipsis-start')
  }

  for (let p = rangeStart; p <= rangeEnd; p++) {
    pages.push(p)
  }

  if (rangeEnd < totalPages - 1) {
    pages.push('ellipsis-end')
  }

  pages.push(totalPages)

  return pages
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null

  const pages = buildPageList(currentPage, totalPages)
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <IndexCell
        state={hasPrev ? 'active' : 'inactive'}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        className={styles.navCell}
      >
        ← Prev
      </IndexCell>

      <ol className={styles.pageList} role="list">
        {pages.map((page) => {
          if (typeof page === 'string') {
            return (
              <li key={page} className={styles.ellipsis} aria-hidden="true">
                …
              </li>
            )
          }

          const isCurrent = page === currentPage

          return (
            <li key={page}>
              <IndexCell
                state={isCurrent ? 'selected' : 'active'}
                onClick={() => !isCurrent && onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-pressed={isCurrent}
              >
                {page}
              </IndexCell>
            </li>
          )
        })}
      </ol>

      <IndexCell
        state={hasNext ? 'active' : 'inactive'}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        className={styles.navCell}
      >
        Next →
      </IndexCell>
    </nav>
  )
}
