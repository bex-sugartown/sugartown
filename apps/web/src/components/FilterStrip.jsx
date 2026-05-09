/**
 * FilterStrip — horizontal bordered filter bar with a SHOW label and type chips.
 *
 * Each filter item can carry `chipTokens` (bg, fg, border CSS custom property names)
 * and an optional `dotToken` (CSS custom property name for the colored dot prefix).
 * The `count` prop renders a muted count string right-aligned after the chips.
 *
 * Usage:
 *   <FilterStrip
 *     filters={[
 *       { key: 'all', label: 'All' },
 *       { key: 'article', label: 'Articles',
 *         chipTokens: { bg: '--st-kg-chip-article-bg', fg: '--st-kg-chip-article-fg', border: '--st-kg-chip-article-border' },
 *         dotToken: '--st-kg-node-article',
 *       },
 *     ]}
 *     activeKey={typeFilter}
 *     onChange={handleFilterChange}
 *     count="45 items visible"
 *   />
 */
import styles from './FilterStrip.module.css'

export default function FilterStrip({
  filters,
  activeKey,
  onChange,
  label = 'Show',
  count,
  className = '',
}) {
  return (
    <div className={`${styles.strip} ${className}`} role="group" aria-label={label}>
      {label && (
        <span className={styles.label} aria-hidden="true">{label}</span>
      )}
      <div className={styles.chips}>
        {filters.map(f => {
          const isActive = activeKey === f.key
          const { chipTokens, dotToken } = f
          const chipStyle = chipTokens ? {
            '--chip-bg':     `var(${chipTokens.bg})`,
            '--chip-fg':     `var(${chipTokens.fg})`,
            '--chip-border': `var(${chipTokens.border})`,
          } : undefined
          const dotStyle = dotToken ? { '--chip-dot': `var(${dotToken})` } : undefined
          return (
            <button
              key={f.key}
              type="button"
              className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
              style={chipStyle ? { ...chipStyle, ...dotStyle } : dotStyle}
              onClick={() => onChange(f.key)}
              aria-pressed={isActive}
            >
              {dotToken && <span className={styles.dot} aria-hidden="true" />}
              {f.label}
            </button>
          )
        })}
      </div>
      {count && (
        <span className={styles.count} aria-live="polite">{count}</span>
      )}
    </div>
  )
}
