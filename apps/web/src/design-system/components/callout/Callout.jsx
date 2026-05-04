/**
 * Callout — web app adapter · row format (SUG-99)
 *
 * Two-column grid: solid label column (--st-card-label-bg) + body column.
 * 2px accent top border, 1px rule-accent box border. No radius.
 *
 * Variants: default (ink accent light / pink dark), info (pink), tip (violet),
 *           warn (orange), danger (maroon)
 *
 * Mirrors: packages/design-system/src/components/Callout/Callout.tsx
 */
import styles from './Callout.module.css'

export default function Callout({
  variant = 'default',
  number,
  title,
  children,
  className,
}) {
  const label = title || variant

  const classNames = [
    styles.callout,
    styles[variant] ?? '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={classNames} role="note">
      <div className={styles.labelCol}>
        {number && <span className={styles.number}>{number}</span>}
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.body}>{children}</div>
    </aside>
  )
}
