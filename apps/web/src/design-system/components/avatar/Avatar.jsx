/**
 * Avatar — web adapter of the DS Avatar primitive.
 * Mirrors: packages/design-system/src/components/Avatar/Avatar.tsx
 */
import styles from './Avatar.module.css'

function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export default function Avatar({ src, name, size = 'xl' }) {
  return (
    <div
      className={[styles.avatar, styles[size]].filter(Boolean).join(' ')}
      aria-label={name}
      role="img"
    >
      {src ? (
        <img src={src} alt={name} className={styles.image} />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {getInitials(name)}
        </span>
      )}
    </div>
  )
}
