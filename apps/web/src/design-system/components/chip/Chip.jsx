/**
 * Chip — web app adapter of the DS Chip visual primitive.
 *
 * Mirrors: packages/design-system/src/components/Chip/Chip.tsx
 * CSS sync: Chip.module.css must match DS Chip.module.css (see MEMORY.md token drift rules).
 *
 * Key difference from DS Chip:
 *   - Uses react-router-dom <Link> instead of <a> for SPA navigation.
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import { Link } from 'react-router-dom'
import styles from './Chip.module.css'

export default function Chip({
  label,
  href,
  onClick,
  isActive = false,
  color,
  colorHex,
  size = 'md',
  className,
  'aria-label': ariaLabel,
}) {
  const isInteractive = Boolean(href || onClick)

  const classNames = [
    styles.chip,
    isInteractive && styles.interactive,
    isActive && styles.active,
    size === 'sm' && styles.sm,
    // Named color preset class — sets --chip-color via CSS token.
    // colorHex inline style takes precedence when both are present.
    color && styles[color],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Inject --chip-color so the CSS color-mix() expressions can resolve it
  const chipStyle = colorHex ? { '--chip-color': colorHex } : undefined

  if (href) {
    return (
      <Link
        to={href}
        className={classNames}
        style={chipStyle}
        aria-label={ariaLabel}
      >
        {label}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classNames}
        style={chipStyle}
        aria-label={ariaLabel}
        aria-pressed={isActive}
      >
        {label}
      </button>
    )
  }

  // Static span — no interaction, used for display-only taxonomy labels
  return (
    <span className={classNames} style={chipStyle} aria-label={ariaLabel}>
      {label}
    </span>
  )
}
