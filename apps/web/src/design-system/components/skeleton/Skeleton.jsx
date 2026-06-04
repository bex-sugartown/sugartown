/**
 * Skeleton — web adapter of the DS Skeleton primitive.
 * Mirrors: packages/design-system/src/components/Skeleton/Skeleton.tsx
 */
import styles from './Skeleton.module.css'

export default function Skeleton({ variant = 'text', width, height, className }) {
  return (
    <div
      className={[styles.skeleton, styles[variant], className].filter(Boolean).join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
