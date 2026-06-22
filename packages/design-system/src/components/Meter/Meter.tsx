import styles from './Meter.module.css';

export interface MeterProps {
  /** Current value */
  value: number;
  /** Minimum value (default: 0) */
  min?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Accessible label — required for screen readers */
  label: string;
  /** Whether to show the numeric value as text */
  showValue?: boolean;
  className?: string;
}

export function Meter({ value, min = 0, max = 100, label, showValue = false, className }: MeterProps) {
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  return (
    <div className={[styles.meter, className].filter(Boolean).join(' ')}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.track} role="meter" aria-valuenow={clampedValue} aria-valuemin={min} aria-valuemax={max} aria-label={label}>
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
      {showValue && (
        <span className={styles.value} aria-hidden="true">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
