import { NavLink } from 'react-router-dom'
import { validateNavItem } from '../../lib/routes'
import styles from './NavigationItem.module.css'

/**
 * NavigationItem
 *
 * Renders a nav link using React Router's NavLink for internal paths
 * (automatic active state via `aria-current`) or a plain <a> for
 * external URLs.
 *
 * Dev-only: warns via console if `url` is not a canonical path.
 */
export default function NavigationItem({ label, url, openInNewTab }) {
  const isExternal = url?.startsWith('http://') || url?.startsWith('https://')

  // Dev-only canonical URL validation
  if (import.meta.env.DEV && url) {
    const { valid, reason } = validateNavItem(url)
    if (!valid) {
      console.warn(
        `[nav] Non-canonical link detected — label="${label}" url="${url}" reason: ${reason}`,
      )
    }
  }

  if (isExternal || openInNewTab) {
    return (
      <a
        href={url}
        className={styles.navItem}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
    )
  }

  if (!url) {
    return <span className={styles.navItem}>{label}</span>
  }

  return (
    <NavLink
      to={url}
      className={({ isActive }) =>
        `${styles.navItem} ${isActive ? styles.active : ''}`
      }
      end={url === '/'}
    >
      {label}
    </NavLink>
  )
}
