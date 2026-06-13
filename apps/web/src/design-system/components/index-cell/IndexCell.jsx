/**
 * IndexCell — web adapter for DS IndexCell primitive.
 *
 * Mirrors: packages/design-system/src/components/IndexCell/IndexCell.tsx
 *
 * Key difference from DS IndexCell:
 *   - Uses react-router-dom <Link> instead of <a> for SPA navigation.
 */
import { Link } from 'react-router-dom'
import styles from './IndexCell.module.css'

export default function IndexCell({
  state = 'active',
  as: Tag = 'button',
  href,
  onClick,
  'aria-pressed': ariaPressed,
  'aria-label': ariaLabel,
  children,
  className,
}) {
  const classNames = [styles.cell, styles[state], className].filter(Boolean).join(' ')

  if (Tag === 'a' && href) {
    return (
      <Link to={href} className={classNames} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }

  if (Tag === 'button') {
    return (
      <button
        type="button"
        className={classNames}
        onClick={onClick}
        disabled={state === 'inactive'}
        aria-pressed={ariaPressed}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    )
  }

  return (
    <span className={classNames} aria-label={ariaLabel}>
      {children}
    </span>
  )
}
