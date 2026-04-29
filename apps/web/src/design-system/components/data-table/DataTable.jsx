import Table, { TableWrap } from '../table/Table'
import styles from './DataTable.module.css'

/**
 * KindBadge — version kind label chip (minor | patch | major).
 * Used inside DataTable release rows for the `kind` column.
 */
export function KindBadge({ kind }) {
  const classNames = [
    styles.badge,
    kind === 'minor' ? styles.badgeMinor : '',
    kind === 'major' ? styles.badgeMajor : '',
    kind === 'patch' ? styles.badgePatch : '',
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={classNames}>{kind}</span>
}

/**
 * DataTable — props-driven wrapper over the DS Table + TableWrap primitives.
 *
 * Adds a column config API and a `trust` variant that overrides the header
 * color tokens via inline style, keeping an identical spacing/layout/zebra
 * skeleton to the base Table.
 *
 * The `trust` variant uses --st-color-bg-surface-strong for the header bg
 * (subdued, not pink accent) and --st-color-text-default for header text
 * (WCAG AA on both light and dark).
 */
export default function DataTable({
  columns,
  rows,
  caption,
  variant = 'default',
  className,
}) {
  const trustStyle =
    variant === 'trust'
      ? {
          '--st-table-header-bg':    'var(--st-color-bg-surface-strong)',
          '--st-table-header-color': 'var(--st-color-text-default)',
        }
      : undefined

  return (
    <TableWrap className={className}>
      <Table style={trustStyle}>
        {caption && <caption className={styles.caption}>{caption}</caption>}
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
      </Table>
    </TableWrap>
  )
}
