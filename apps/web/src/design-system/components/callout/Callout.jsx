/**
 * Callout — web app adapter · Ledger Tradition structural treatment (SUG-80)
 *
 * Mirrors: packages/design-system/src/components/Callout/Callout.tsx
 * Structure: rule-pair box + CSS grid (label column | body column). No icon.
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import styles from './Callout.module.css'

export default function Callout({
  variant = 'default',
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
      <span className={styles.label}>{label}</span>
      <div className={styles.body}>{children}</div>
    </aside>
  )
}
