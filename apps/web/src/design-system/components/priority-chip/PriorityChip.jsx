/**
 * PriorityChip — web adapter.
 * Mirrors: packages/design-system/src/components/PriorityChip/PriorityChip.tsx
 */
import styles from './PriorityChip.module.css'

const LABELS = {
  high:   'High',
  medium: 'Medium',
  low:    'Low',
  none:   'No priority',
}

export default function PriorityChip({ level, className }) {
  const classNames = [styles.chip, styles[level], className].filter(Boolean).join(' ')
  return (
    <span className={classNames}>
      <span className={styles.swatch} aria-hidden="true" />
      {LABELS[level]}
    </span>
  )
}
