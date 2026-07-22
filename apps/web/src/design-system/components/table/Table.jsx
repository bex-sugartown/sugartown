/**
 * Table — web app adapter of the DS Table visual primitive.
 *
 * Mirrors: packages/design-system/src/components/Table/Table.tsx
 *
 * Caption surface lives in TableWrap (as a div ABOVE the table), not inside
 * <table> as a <caption> element. position:sticky on <caption> is broken
 * cross-browser — the div approach is reliable and keeps sticky behaviour correct.
 */
import styles from './Table.module.css'

export function TableWrap({
  caption,
  captionMeta,
  variant,
  children,
  className,
}) {
  const hasCaption = !!(caption || captionMeta)

  const wrapClass = [
    styles.tableWrap,
    hasCaption ? styles.hasCaption : '',
    variant === 'wide' ? styles.wrapWide : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapClass}>
      {hasCaption && (
        <div className={styles.caption}>
          <span className={styles.captionLabel}>{caption}</span>
          {captionMeta && <span className={styles.captionMeta}>{captionMeta}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

export default function Table({
  tone = 'accent',
  variant = 'default',
  zebra,
  layout = 'auto',
  density = 'comfortable',
  columns,
  rows,
  children,
  className,
  style,
}) {
  const zebraOn = zebra ?? (tone === 'accent')

  const classNames = [
    styles.table,
    tone === 'subdued'       ? styles.toneSubdued : styles.toneAccent,
    zebraOn && tone === 'subdued' ? styles.zebra : '',
    variant === 'responsive' ? styles.responsive  : '',
    // No `.wide` class on the <table> itself: `variant="wide"` is implemented
    // entirely by `.wrapWide` on TableWrap (full-bleed 100vw + overflow-x).
    // A `styles.wide` reference lived here with nothing behind it in either
    // stylesheet — it resolved to undefined and was silently dropped by the
    // filter below, so removing it changes no rendered output. SUG-231.
    layout === 'fixed'       ? styles.layoutFixed : '',
    density === 'compact'    ? styles.compact     : '',
    !zebraOn                 ? styles.noZebra     : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <table className={classNames} style={style}>
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
