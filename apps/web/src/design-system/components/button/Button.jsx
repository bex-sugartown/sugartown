import { Link as RouterLink } from 'react-router-dom'
import { isExternalUrl } from '../../../lib/linkUtils'
import styles from './Button.module.css'

/**
 * Button — web adapter
 *
 * Renders:
 *   - `<a target="_blank" rel="noopener noreferrer">` for external hrefs (http(s), mailto, tel)
 *   - React Router `<Link>` for internal hrefs (SPA navigation)
 *   - `<button>` when no href is provided
 *
 * The `openInNewTab` prop forces external-style rendering even for internal URLs
 * (matches the Sanity `openInNewTab` field on link/ctaButton objects).
 *
 * Callers no longer need to pass `target`/`rel` — Button handles it internally.
 * For backward compat, any extra props (including target/rel) still spread through.
 */
export default function Button({
  variant = 'primary',
  href,
  openInNewTab,
  onClick,
  children,
  className = '',
  ...props
}) {
  const variantClass =
    variant === 'secondary'
      ? styles.buttonSecondary
      : variant === 'tertiary'
        ? styles.buttonTertiary
        : styles.buttonPrimary

  const classes = `${styles.button} ${variantClass} ${className}`.trim()

  if (href) {
    const external = isExternalUrl(href) || openInNewTab

    if (external) {
      return (
        <a
          className={classes}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      )
    }

    // Internal path → React Router SPA navigation
    return (
      <RouterLink className={classes} to={href} {...props}>
        {children}
      </RouterLink>
    )
  }

  return (
    <button className={classes} onClick={onClick} type="button" {...props}>
      {children}
    </button>
  )
}
