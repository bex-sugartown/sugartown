import styles from './SectionLabel.module.css'

/**
 * SectionLabel — three-zone folio row over a 1px ink baseline.
 *
 * Layout: §NN · name (mono left) | Cormorant title (centre) | mono kicker (right)
 * Props: number, name, title, kicker (all optional — render only if provided)
 * level: 'h2' | 'h3' | 'h4' — heading level for the title element (default 'h2')
 */
export default function SectionLabel({ number, name, title, kicker, level = 'h2', className }) {
  // When title is present it is the semantic heading; name is a decorative label.
  // When only name is present, name is the heading (at the given level).
  const TitleEl = level
  const NameEl = title ? 'span' : level
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div className={styles.left}>
        {number && <span className={styles.number}>{number}</span>}
        {name   && <NameEl className={styles.name}>{name}</NameEl>}
      </div>
      {title  && <TitleEl className={styles.title}>{title}</TitleEl>}
      {kicker && <span className={styles.kicker}>{kicker}</span>}
    </div>
  )
}
