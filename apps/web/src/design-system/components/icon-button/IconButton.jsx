import styles from './IconButton.module.css'

/**
 * IconButton — icon-only action button.
 *
 * shape="square"  — 4px radius (default). Matches SegmentedControl icon variant.
 * shape="circle"  — full radius. Used by ThemeToggle and any floating action icon.
 *
 * Always requires an `aria-label` describing the action.
 * Pass the icon as children (Lucide or custom SVG).
 */
export default function IconButton({
  children,
  shape = 'square',
  onClick,
  className = '',
  disabled,
  ...props
}) {
  const shapeClass = shape === 'circle' ? styles.circle : styles.square
  const classes = [styles.iconButton, shapeClass, className].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
