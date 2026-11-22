/**
 * FilterStrip — horizontal bordered filter bar with a SHOW label and type chips.
 *
 * Each filter item is a DS Chip (Badge, or Badge — Color Dot when it carries `dotToken`, the CSS custom
 * property name for the dot colour). Rest, hover, selected, pressed and focus come from the Chip (ST-251).
 * The `count` prop renders a muted count string right-aligned after the chips.
 *
 * Usage:
 *   <FilterStrip
 *     filters={[
 *       { key: 'all', label: 'All' },
 *       { key: 'article', label: 'Articles',
 *         dotToken: '--st-kg-node-article',
 *       },
 *     ]}
 *     activeKey={typeFilter}
 *     onChange={handleFilterChange}
 *     count="45 items visible"
 *   />
 */
import styles from './FilterStrip.module.css'
import { Chip } from '../design-system'

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
        {filters.map(f => (
          <Chip
            key={f.key}
            variant="badge"
            isActive={activeKey === f.key}
            dotColor={f.dotToken ? `var(${f.dotToken})` : undefined}
            onClick={() => onChange(f.key)}
          >
            {f.label}
          </Chip>
        ))}
      </div>
      {count && (
        <span className={styles.count} aria-live="polite">{count}</span>
      )}
    </div>
  )
}
