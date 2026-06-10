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
  // Project dot-color mode (SUG-118): hex from Sanity project.colorHex
  dotColor,      // hex string — activates dotColor mode; renders 6px dot at this color
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
  const isDotColor = Boolean(dotColor)
  // tag + color: use the color-mix system instead of neutral ruleDot chassis
  const tagWithColor = variant === 'tag' && Boolean(color || colorHex)

  const classNames = [
    styles.chip,
    // Rule-dot system modifiers (skipped when tag has an explicit color)
    isRuleDot && !tagWithColor && styles.ruleDot,
    variant === 'status' && styles.variantStatus,
    variant === 'tag' && styles.variantTag,
    featured && variant === 'tag' && !tagWithColor && styles.featured,
    // dotColor mode — project chip with inline hex dot
    isDotColor && styles.ruleDot,
    isDotColor && styles.dotColor,
    // Interactive applies to all chip variants
    isInteractive && styles.interactive,
    !isRuleDot && !isDotColor && isActive && styles.active,
    // Color class: default chips, OR tag+color mode
    (!isRuleDot && !isDotColor || tagWithColor) && color && styles[color],
    // Size applies to all variants
    size === 'sm' && styles.sm,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // dotColor mode injects --chip-dot; legacy mode injects --chip-color
  const chipStyle = isDotColor
    ? { '--chip-dot': dotColor }
    : (colorHex && (!isRuleDot || tagWithColor) ? { '--chip-color': colorHex } : undefined)

  // Content: rule-dot status chips prepend a semantic dot span; dotColor mode too
  const dotEl = (variant === 'status' && status)
    ? <span className={`${styles.dot} ${styles[`dot-${status}`] ?? ''}`} aria-hidden="true" />
    : isDotColor
      ? <span className={styles.dot} aria-hidden="true" />
      : null

  const content = (isRuleDot || isDotColor)
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
