import { Link as RouterLink } from 'react-router-dom'
import { isExternalUrl } from '../../lib/linkUtils'
import styles from './Link.module.css'

/**
 * Link atom
 *
 * Uses React Router's Link for internal paths, plain <a> for external URLs.
 * External detection delegated to shared linkUtils.isExternalUrl().
 */
export default function Link({ label, url, openInNewTab, className = '' }) {
  if (isExternalUrl(url) || openInNewTab) {
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
