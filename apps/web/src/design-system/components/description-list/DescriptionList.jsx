/**
 * DescriptionList — web adapter of the DS DescriptionList primitive.
 * Mirrors: packages/design-system/src/components/DescriptionList/DescriptionList.tsx
 */
import styles from './DescriptionList.module.css'

export default function DescriptionList({ items, columns = 1, ledger = false, className }) {
  return (
    <dl
      className={[
        styles.dl,
        columns === 2 ? styles.twoCol : styles.oneCol,
        ledger ? styles.ledger : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map(({ label, value }) => (
        <div key={label} className={styles.item}>
          <dt className={styles.term}>{label}</dt>
          <dd className={styles.detail}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
