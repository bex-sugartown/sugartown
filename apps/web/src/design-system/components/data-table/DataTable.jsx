/**
 * @deprecated Use <Table tone="subdued" columns={...} rows={...} /> directly.
 * DataTable is a deprecated re-export shim over Table. Inline CSS variable injection
 * removed. Will be deleted in the next minor after SUG-119 ships.
 */
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

export default function DataTable({
  columns,
  rows,
  caption,
  variant = 'default',
  tone,
  className,
}) {
  // Map legacy `variant="trust"` to `tone="subdued"` for the new Table API
  const resolvedTone = tone ?? (variant === 'trust' ? 'subdued' : 'accent')

  return (
    <TableWrap className={className}>
      <Table tone={resolvedTone} caption={caption} columns={columns} rows={rows} />
    </TableWrap>
  )
}
