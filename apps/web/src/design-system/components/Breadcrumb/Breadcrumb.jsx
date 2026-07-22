/**
 * Breadcrumb — web adapter of the DS Breadcrumb primitive (SUG-139).
 *
 * Mirrors: packages/design-system/src/components/Breadcrumb/Breadcrumb.tsx
 *
 * Known divergence from the package copy (SUG-231, deliberately not reconciled):
 *   - Uses react-router-dom <Link>; the package uses the SUG-230 link seam.
 *     These cannot converge while both copies exist — web is the app and has a
 *     router, the package must not import one.
 *   - Wraps each crumb in <span className={styles.crumb}> where the package
 *     uses React.Fragment. `.crumb` is `display: contents`, so the two render
 *     identically; converging is cosmetic churn on a file SUG-224 deletes.
 *   - The `.current` class still keys off `isLast` here, where the package
 *     keys it off `isLast && !item.href`. That is a deliberate visual choice
 *     (the trailing crumb reads pink regardless), kept separate from the
 *     aria-current semantics below.
 *
 * SUG-224 removes this file; the remaining differences resolve there.
 */
import { Link } from 'react-router-dom'
import styles from './Breadcrumb.module.css'

/**
 * @param {{ items: Array<{ label: string, href?: string }>, className?: string }} props
 */
export default function Breadcrumb({ items, className }) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={[styles.breadcrumb, className].filter(Boolean).join(' ')}>
      {items.map((item, i) => {
        const isFirst = i === 0
        const isLast = i === items.length - 1
        // Visual emphasis: the trailing crumb always reads pink.
        const isHighlighted = isLast
        // Semantics are NOT the same question (SUG-231). A trailing crumb that
        // still has an href points somewhere else — on /tools/vercel the last
        // crumb links to /tools — so marking it aria-current="page" tells a
        // screen reader the wrong element is the current page. Only an
        // unlinked trailing crumb is genuinely current.
        const isCurrent = isLast && !item.href

        return (
          <span key={i} className={styles.crumb}>
            {i > 0 && <span className={styles.sep} aria-hidden="true">/</span>}
            {item.href ? (
              <Link
                to={item.href}
                className={[styles.link, isHighlighted && styles.current].filter(Boolean).join(' ')}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {isFirst && <span className={styles.arrow} aria-hidden="true">← </span>}
                {item.label}
              </Link>
            ) : (
              <span className={styles.current} aria-current={isCurrent ? 'page' : undefined}>
                {isFirst && <span className={styles.arrow} aria-hidden="true">← </span>}
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
