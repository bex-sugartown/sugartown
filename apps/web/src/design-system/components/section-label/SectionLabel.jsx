import styles from './SectionLabel.module.css'

/**
 * SectionLabel — mono-caps heading with optional extending horizontal rule.
 *
 * rule=true  → flex row + ::after pseudo fills remaining width with a 2px ink rule.
 *              Use before data grids, stat strips, and card collections.
 * rule=false → plain block-level label typography only.
 *              Use above prose blocks or single-field labels.
 */
export default function SectionLabel({ as: Tag = 'p', rule = true, children, className }) {
  const classes = [styles.label, rule && styles.rule, className].filter(Boolean).join(' ')
  return <Tag className={classes}>{children}</Tag>
}
