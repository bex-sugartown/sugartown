import { useRef } from 'react'
import { useStickyState } from '../../design-system/hooks/useStickyState'
import PriorityChip from '../../design-system/components/priority-chip/PriorityChip'
import Chip from '../../design-system/components/chip/Chip'
import styles from './RoadmapTable.module.css'

const PRIORITY_MAP = {
  High: 'high', Urgent: 'high',
  Medium: 'medium',
  Low: 'low',
  'No priority': 'none',
}

/**
 * RoadmapTable — sticky-thead epics table for a single roadmap lane.
 * thead sticks at top: 38px (beneath the LaneHeader).
 */
export default function RoadmapTable({ rows, scrollRoot }) {
  const tableRef = useRef(null)
  const stuckState = useStickyState(tableRef, {
    root: scrollRoot?.current ?? null,
    rootMargin: '-38px 0px 0px 0px',
  })

  return (
    <table
      ref={tableRef}
      className={styles.table}
      data-thead-stuck={stuckState === 'pinned' ? 'true' : undefined}
    >
      <thead>
        <tr>
          <th className={styles.colId}>ID</th>
          <th>Title</th>
          <th className={styles.colStatus}>Status</th>
          <th className={styles.colPriority}>Priority</th>
          <th className={styles.colProjects}>Projects</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.identifier ?? row.id ?? row.title}>
            <td className={`${styles.idCell} ${styles.colId}`}>
              {row.url
                ? <a href={row.url} target="_blank" rel="noopener noreferrer">{row.identifier}</a>
                : row.identifier
              }
            </td>
            <td>{row.title}</td>
            <td className={`${styles.statusCell} ${styles.colStatus}`}>{row.status}</td>
            <td className={styles.colPriority}>
              <PriorityChip level={PRIORITY_MAP[row.priority] ?? 'none'} />
            </td>
            <td className={styles.colProjects}>
              <div className={styles.chipsCell}>
                {(row.projects ?? []).map((p) => (
                  <Chip key={p.name} dotColor={p.colorHex} label={p.name} size="sm" />
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
