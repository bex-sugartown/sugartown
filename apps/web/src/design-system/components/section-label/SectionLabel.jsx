import styles from './SectionLabel.module.css'

/**
 * SectionLabel — mono-caps heading with optional rule, plus folio variant.
 *
 * variant="default" (rule=true)  → flex row + ::after pseudo fills remaining width with a 2px ink rule.
 *                                  Use before data grids, stat strips, and card collections.
 * variant="default" (rule=false) → plain block-level label typography only.
 * variant="folio"                → three-zone row over a 1px ink baseline:
 *                                  §NN + name (left) | Cormorant title (centre) | mono kicker (right)
 *                                  Props: number, name, title, kicker
 */
export default function SectionLabel({
  variant = 'default',
  // default variant props
  as: Tag = 'p',
  rule = true,
  children,
  // folio variant props
  number,
  name,
  title,
  kicker,
  className,
}) {
  if (variant === 'folio') {
    return (
      <div className={[styles.folio, className].filter(Boolean).join(' ')}>
        <div className={styles.folioLeft}>
          {number && <span className={styles.folioNumber}>{number}</span>}
          {name   && <span className={styles.folioName}>{name}</span>}
        </div>
        {title  && <span className={styles.folioTitle}>{title}</span>}
        {kicker && <span className={styles.folioKicker}>{kicker}</span>}
      </div>
    )
  }

  const classes = [styles.label, rule && styles.rule, className].filter(Boolean).join(' ')
  return <Tag className={classes}>{children}</Tag>
}
