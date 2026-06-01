/**
 * Breadcrumb — web adapter of the DS Breadcrumb primitive (SUG-139).
 *
 * Mirrors: packages/design-system/src/components/Breadcrumb/Breadcrumb.tsx
 *
 * Key difference from DS Breadcrumb:
 *   - Uses react-router-dom <Link> instead of <a> for SPA navigation.
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
        // Pink on the last item only when it has siblings — sole back-links stay muted
        const isHighlighted = isLast && items.length > 1

        return (
          <span key={i} className={styles.crumb}>
            {i > 0 && <span className={styles.sep} aria-hidden="true">/</span>}
            {item.href ? (
              <Link
                to={item.href}
                className={[styles.link, isHighlighted && styles.current].filter(Boolean).join(' ')}
                aria-current={isLast ? 'page' : undefined}
              >
                {isFirst && <span className={styles.arrow} aria-hidden="true">← </span>}
                {item.label}
              </Link>
            ) : (
              <span className={styles.current} aria-current="page">
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
