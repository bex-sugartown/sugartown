import PriorityChip from '../priority-chip/PriorityChip'
import Chip from '../chip/Chip'
import Table, { TableWrap } from '../table/Table'
import styles from './RoadmapTable.module.css'

const PRIORITY_MAP = {
  High: 'high', Urgent: 'high',
  Medium: 'medium',
  Low: 'low',
  'No priority': 'none',
}

const COLUMNS = [
  { key: 'id',       label: 'ID',       width: 78  },
  { key: 'title',    label: 'Title'                 },
  { key: 'status',   label: 'Status',   width: 110 },
  { key: 'priority', label: 'Priority', width: 120 },
  { key: 'projects', label: 'Projects', width: 260 },
]

function renderRow(row) {
  return {
    id: row.url
      ? <a className={styles.idCell} href={row.url} target="_blank" rel="noopener noreferrer">{row.identifier}</a>
      : <span className={styles.idCell}>{row.identifier}</span>,
    title:    row.title,
    status:   <span className={styles.statusCell}>{row.status}</span>,
    priority: <PriorityChip level={PRIORITY_MAP[row.priority] ?? 'none'} />,
    projects: (
      <div className={styles.chipsCell}>
        {(row.projects ?? []).map((p) => (
          <Chip key={p.name} dotColor={p.colorHex} label={p.name} size="sm" />
        ))}
      </div>
    ),
  }
}

/**
 * RoadmapTable — sticky-thead epics table for a single roadmap lane.
 *
 * Composes <Table tone="subdued"> — no raw <table> element.
 * Caption + thead pin together via --st-table-sticky-offset on the wrapper.
 * LaneHeader is retired; lane label and epic count live in caption/captionMeta.
 */
export default function RoadmapTable({ lane, rows: epics = [] }) {
  const rows = epics.map(renderRow)

  return (
    <TableWrap>
      <div className={styles.roadmapLane}>
        <Table
          tone="subdued"
          layout="fixed"
          zebra={false}
          caption={lane?.label}
          captionMeta={epics.length ? `${epics.length} ${epics.length === 1 ? 'epic' : 'epics'}` : undefined}
          columns={COLUMNS}
          rows={rows}
        />
      </div>
    </TableWrap>
  )
}
