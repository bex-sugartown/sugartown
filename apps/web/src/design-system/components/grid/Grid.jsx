import styles from './Grid.module.css'

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

  // Auto-collapse: 3+ col grids step down to 2 at tablet unless explicit tabletColumns is provided
  const resolvedTablet = tabletColumns ?? (columns >= 3 ? 2 : undefined)
  const style = Object.assign(
    {},
    columns ? { '--grid-columns': columns } : {},
    resolvedTablet ? { '--grid-columns-tablet': resolvedTablet } : {},
  )

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  )
}
