import styles from './StatCard.module.css'

export default function StatCard({ label, value, sub, body, chip }) {
  return (
    <div className={styles.statCard}>
      {label && <div className={styles.label}>{label}</div>}
      {value && <div className={styles.value}>{value}</div>}
      {sub && <div className={styles.sub}>{sub}</div>}
      {body && <div className={styles.body}>{body}</div>}
      {chip && <div className={styles.chip}>{chip}</div>}
    </div>
  )
}
