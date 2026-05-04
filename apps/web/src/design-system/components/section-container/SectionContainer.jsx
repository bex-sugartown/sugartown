/**
 * SectionContainer — semantic wrapper for shared-border Tile strips (SUG-99).
 *
 * Owns the outer box border and 2px ink top rule.
 * Children (Tiles) share 1px hairline dividers via bg-through-gap:
 *   inner grid bg = --st-color-rule-accent; gap: 1px
 *   each Tile child must carry background: var(--st-card-bg) to cover the gap.
 *
 * columns prop sets the grid repeat count (default: auto-fit, min 180px).
 */
import styles from './SectionContainer.module.css'

export default function SectionContainer({ children, columns, className }) {
  const innerStyle = columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined

  return (
    <div className={[styles.container, className].filter(Boolean).join(' ')}>
      <div className={styles.inner} style={innerStyle}>
        {children}
      </div>
    </div>
  )
}
