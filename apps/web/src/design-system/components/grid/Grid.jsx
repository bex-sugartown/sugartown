import styles from './Grid.module.css'

/**
 * Grid — responsive tile/card grid with two spacing modes.
 *
 * spacing="lg"  → 32px open gap (--st-space-card-gap / space.6)
 * spacing="0"   → 1px bg-through-gap hairline (--st-space-0 / space.0)
 *                 Parent background shows through gap as hairline dividers.
 *                 Children must have an explicit background to cover it.
 *
 * accentTop adds a 2px brand-color rule on the grid's top edge.
 *
 * SUG-96
 */
export default function Grid({
  spacing = 'lg',
  columns,
  accentTop = false,
  className,
  children,
}) {
  const classNames = [
    styles.grid,
    styles[`spacing-${spacing}`],
    accentTop ? styles.accentTop : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  const style = columns ? { '--grid-columns': columns } : undefined

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  )
}
