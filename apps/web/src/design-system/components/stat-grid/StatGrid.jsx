import styles from './StatGrid.module.css'

/**
 * StatGrid — ruled cell grid for stats strips and artifact cards.
 * columns: 3 | 4
 */
export function StatGrid({ columns = 4, children, className }) {
  return (
    <div
      className={[styles.grid, styles[`cols${columns}`], className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}

/**
 * StatGridCell — individual cell within StatGrid.
 * In stats mode: label + value + optional signal (sub-label).
 * In artifact mode (foot prop): label + value + dashed-top-rule foot slot.
 */
export function StatGridCell({ label, value, signal, href, foot, children }) {
  const inner = (
    <div className={[styles.cell, foot != null && styles.artifact].filter(Boolean).join(' ')}>
      <span className={styles.cellLabel}>{label}</span>
      <span className={styles.cellValue}>{value ?? children}</span>
      {signal && <span className={styles.cellSignal}>{signal}</span>}
      {foot != null && <span className={styles.cellFoot}>{foot}</span>}
    </div>
  )

  if (href) {
    return (
      <a href={href} className={styles.cellLink} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    )
  }
  return inner
}
