/**
 * IndexGroup — web adapter for DS IndexGroup primitive.
 *
 * Mirrors: packages/design-system/src/components/IndexGroup/IndexGroup.tsx
 */
import styles from './IndexGroup.module.css'

export default function IndexGroup({
  children,
  label = 'Index navigation',
  className,
}) {
  return (
    <div
      className={[styles.group, className].filter(Boolean).join(' ')}
      aria-label={label}
      role="group"
    >
      {children}
    </div>
  )
}
