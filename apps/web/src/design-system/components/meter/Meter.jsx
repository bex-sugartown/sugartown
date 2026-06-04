/**
 * Meter — web adapter of the DS Meter primitive.
 * Mirrors: packages/design-system/src/components/Meter/Meter.tsx
 */
import styles from './Meter.module.css'

export default function Meter({ value, min = 0, max = 100, label, showValue = false, className }) {
  const clampedValue = Math.min(Math.max(value, min), max)
  const percentage = ((clampedValue - min) / (max - min)) * 100

  return (
    <div className={[styles.meter, className].filter(Boolean).join(' ')}>
      {label && <span className={styles.label}>{label}</span>}
      <div
        className={styles.track}
        role="meter"
        aria-valuenow={clampedValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
      {showValue && (
        <span className={styles.value} aria-hidden="true">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}
