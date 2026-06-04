/**
 * Metric — web adapter of the DS Metric primitive.
 * Mirrors: packages/design-system/src/components/Metric/Metric.tsx
 */
import styles from './Metric.module.css'

const TREND_SYMBOL = { up: '↑', down: '↓', neutral: '→' }

export default function Metric({ value, label, trend, className }) {
  return (
    <div className={[styles.metric, className].filter(Boolean).join(' ')}>
      <span className={styles.value}>{value}</span>
      {trend && (
        <span
          className={[styles.trend, styles[`trend--${trend}`]].join(' ')}
          aria-hidden="true"
        >
          {TREND_SYMBOL[trend]}
        </span>
      )}
      <span className={styles.label}>{label}</span>
    </div>
  )
}
