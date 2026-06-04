import { Card } from '../design-system'
import styles from './StatCard.module.css'

/**
 * StatCard — Card-based replacement for Tile in statTileSection.
 * Composes DS Card with a metric/value/sub/body/chip layout.
 */
export default function StatCard({ label, value, sub, body, chip }) {
  return (
    <Card>
      <div className={styles.statCard}>
        {label && <div className={styles.label}>{label}</div>}
        {value && <div className={styles.value}>{value}</div>}
        {sub && <div className={styles.sub}>{sub}</div>}
        {body && <div className={styles.body}>{body}</div>}
        {chip && <div className={styles.chip}>{chip}</div>}
      </div>
    </Card>
  )
}
