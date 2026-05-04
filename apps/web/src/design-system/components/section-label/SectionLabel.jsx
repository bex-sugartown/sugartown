import styles from './SectionLabel.module.css'

/**
 * SectionLabel — three-zone folio row over a 1px ink baseline.
 *
 * Layout: §NN · name (mono left) | Cormorant title (centre) | mono kicker (right)
 * Props: number, name, title, kicker (all optional — render only if provided)
 */
export default function SectionLabel({ number, name, title, kicker, className }) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div className={styles.left}>
        {number && <span className={styles.number}>{number}</span>}
        {name   && <span className={styles.name}>{name}</span>}
      </div>
      {title  && <span className={styles.title}>{title}</span>}
      {kicker && <span className={styles.kicker}>{kicker}</span>}
    </div>
  )
}
