/**
 * Callout — web app adapter of the DS Callout visual primitive.
 *
 * Mirrors: packages/design-system/src/components/Callout/Callout.tsx
 * CSS sync: Callout.module.css must match DS Callout.module.css (see MEMORY.md token drift rules).
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import { Heart, Info, Lightbulb, AlertTriangle, AlertOctagon } from 'lucide-react'
import styles from './Callout.module.css'

const VARIANT_ICONS = {
  default: <Heart size={18} />,
  info: <Info size={18} />,
  tip: <Lightbulb size={18} />,
  warn: <AlertTriangle size={18} />,
  danger: <AlertOctagon size={18} />,
}

export default function Callout({
  variant = 'default',
  icon,
  title,
  children,
  className,
}) {
  // icon={undefined} → use default; icon={null} → no icon; icon={<X/>} → custom
  const resolvedIcon = icon === undefined ? VARIANT_ICONS[variant] : icon

  const classNames = [
    styles.callout,
    styles[variant] ?? '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={classNames} role="note">
      {(resolvedIcon || title) && (
        <div className={styles.header}>
          {resolvedIcon && <span className={styles.icon}>{resolvedIcon}</span>}
          {title && <strong className={styles.title}>{title}</strong>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </aside>
  )
}
