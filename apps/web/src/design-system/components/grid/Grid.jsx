import styles from './Grid.module.css'

/**
 * Grid — responsive tile/card grid with two spacing modes.
 *
 * spacing="lg"        → 32px open gap (--st-space-card-gap / space.6)
 * spacing="0"         → 1px bg-through-gap hairline (--st-space-0 / space.0)
 *                       Parent background shows through gap as hairline dividers.
 *                       Children must have an explicit background to cover it.
 *
 * columns             → integer (e.g. 2). Fixed column count via --grid-columns.
 *                       Without this prop, auto-fit collapses intrinsically.
 *
 * tabletColumns       → integer. Overrides column count at tablet width (≤900px)
 *                       before mobile (≤600px) collapse to 1 col.
 *                       Use tabletColumns={2} to get a 2×2 layout from columns={4}.
 *
 * accentTop           → adds a 2px rule on the grid's top edge.
 * accentColor         → "brand" (default, pink) | "ink" (dark neutral).
 *                       Only applies when accentTop is true.
 *
 * SUG-96 | responsive collapse: SUG-104 | accentColor + tabletColumns: SUG-120
 */
export default function Grid({
  spacing = 'lg',
  columns,
  tabletColumns,
  accentTop = false,
  accentColor = 'brand',
  className,
  children,
}) {
  const classNames = [
    styles.grid,
    styles[`spacing-${spacing}`],
    accentTop ? styles[`accentTop-${accentColor}`] : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  const style = Object.assign(
    {},
    columns ? { '--grid-columns': columns } : {},
    tabletColumns ? { '--grid-columns-tablet': tabletColumns } : {},
  )

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  )
}
