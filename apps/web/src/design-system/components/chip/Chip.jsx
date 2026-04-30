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
  // Rule-dot system props (SUG-88)
  variant,       // 'status' | 'tag' — activates rule-dot system; omit for legacy color-mix chips
  status,        // status key for dot color: 'evergreen' | 'validated' | 'exploring' | 'active' | 'draft' | 'deprecated'
  featured,      // boolean — pink rubric on variant="tag" chips only
  // Legacy props (unchanged — existing call sites continue working)
  label,
  href,
  onClick,
  isActive = false,
  color,
  colorHex,
  size = 'md',
  className,
  'aria-label': ariaLabel,
  children,
}) {
  const isInteractive = Boolean(href || onClick)
  const isRuleDot = variant === 'status' || variant === 'tag'

  const classNames = [
    styles.chip,
    // Rule-dot system modifiers
    isRuleDot && styles.ruleDot,
    variant === 'status' && styles.variantStatus,
    variant === 'tag' && styles.variantTag,
    featured && variant === 'tag' && styles.featured,
    // Interactive applies to all chip variants — rule-dot hover overrides color changes in CSS
    isInteractive && styles.interactive,
    !isRuleDot && isActive && styles.active,
    !isRuleDot && size === 'sm' && styles.sm,
    !isRuleDot && color && styles[color],
    // Size applies to rule-dot chips too (density control)
    isRuleDot && size === 'sm' && styles.sm,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Legacy color injection (only for non-rule-dot chips)
  const chipStyle = !isRuleDot && colorHex ? { '--chip-color': colorHex } : undefined

  // Content: rule-dot status chips prepend a semantic dot span
  const dotEl = variant === 'status' && status
    ? <span className={`${styles.dot} ${styles[`dot-${status}`] ?? ''}`} aria-hidden="true" />
    : null

  const content = isRuleDot
    ? <>{dotEl}{children ?? label}</>
    : label

  if (href) {
    return (
      <Link to={href} className={classNames} style={chipStyle} aria-label={ariaLabel}>
        {content}
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
        {content}
      </button>
    )
  }

  return (
    <span className={classNames} style={chipStyle} aria-label={ariaLabel}>
      {content}
    </span>
  )
}
