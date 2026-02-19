import { Link as RouterLink } from 'react-router-dom'
import styles from './Link.module.css'

/**
 * Link atom
 *
 * Uses React Router's Link for internal paths, plain <a> for external URLs.
 */
export default function Link({ label, url, openInNewTab, className = '' }) {
  const isExternal = url?.startsWith('http://') || url?.startsWith('https://')

  if (isExternal || openInNewTab) {
    return (
      <a
        href={url}
        className={`${styles.link} ${className}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
    )
  }

  if (!url) {
    return <span className={`${styles.link} ${className}`}>{label}</span>
  }

  return (
    <RouterLink to={url} className={`${styles.link} ${className}`}>
      {label}
    </RouterLink>
  )
}
