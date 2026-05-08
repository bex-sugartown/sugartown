/**
 * FilterStrip — horizontal bordered filter bar with a SHOW label and type chips.
 *
 * Each filter item can carry an optional `colorToken` (CSS custom property name)
 * that drives the active chip's background and border via `--chip-color`.
 * If omitted, the active chip falls back to `--st-color-text-primary` (dark fill).
 *
 * Usage:
 *   <FilterStrip
 *     filters={[
 *       { key: 'all', label: 'All' },
 *       { key: 'article', label: 'Articles', colorToken: '--st-kg-node-article' },
 *     ]}
 *     activeKey={typeFilter}
 *     onChange={handleFilterChange}
 *   />
 */
import styles from './FilterStrip.module.css'

export default function FilterStrip({
  filters,
  activeKey,
  onChange,
  label = 'Show',
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
          return (
            <button
              key={f.key}
              type="button"
              className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
              style={f.colorToken ? { '--chip-color': `var(${f.colorToken})` } : undefined}
              onClick={() => onChange(f.key)}
              aria-pressed={isActive}
            >
              {f.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
