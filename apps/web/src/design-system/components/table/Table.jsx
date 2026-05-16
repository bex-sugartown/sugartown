/**
 * Table — web app adapter of the DS Table visual primitive.
 *
 * Mirrors: packages/design-system/src/components/Table/Table.tsx
 * CSS sync: Table.module.css must match DS Table.module.css (see MEMORY.md token drift rules).
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import styles from './Table.module.css'

export function TableWrap({ variant, children, className }) {
  const classNames = [
    styles.wrap,
    variant === 'wide' ? styles.wrapWide : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames}>
      {children}
    </div>
  )
}

export default function Table({
  tone = 'accent',
  variant = 'default',
  zebra,
  caption,
  captionMeta,
  columns,
  rows,
  layout = 'auto',
  density = 'comfortable',
  children,
  className,
  style,
}) {
  const zebraOn = zebra ?? (tone === 'accent')

  const classNames = [
    styles.table,
    tone === 'subdued'       ? styles.toneSubdued   : styles.toneAccent,
    variant === 'responsive' ? styles.responsive    : '',
    variant === 'wide'       ? styles.wide          : '',
    layout === 'fixed'       ? styles.layoutFixed   : '',
    density === 'compact'    ? styles.compact       : '',
    !zebraOn                 ? styles.noZebra       : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <table className={classNames} style={style}>
      {(caption || captionMeta) && (
        <caption className={styles.caption}>
          <span className={styles.captionLabel}>{caption}</span>
          {captionMeta && <span className={styles.captionMeta}>{captionMeta}</span>}
        </caption>
      )}
      {columns && rows ? (
        <>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </>
      ) : (
        children
      )}
    </table>
  )
}
