import styles from './SectionLabel.module.css'

/**
 * SectionLabel — three-zone folio row over a 1px ink baseline.
 *
 * Layout: §NN · name (mono left) | Cormorant title (centre) | mono kicker (right)
 * Props: number, name, title, kicker (all optional — render only if provided)
 */
export default function SectionLabel({ number, name, title, kicker, className }) {
  // When title is present it is the semantic heading; name is a decorative label.
  // When only name is present, name is the heading. Either way renders as h2.
  const NameEl = title ? 'span' : 'h2'
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div className={styles.left}>
        {number && <span className={styles.number}>{number}</span>}
        {name   && <NameEl className={styles.name}>{name}</NameEl>}
      </div>
      {title  && <h2 className={styles.title}>{title}</h2>}
      {kicker && <span className={styles.kicker}>{kicker}</span>}
    </div>
  )
}
