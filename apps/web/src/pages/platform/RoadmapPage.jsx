import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import DataTable from '../../design-system/components/data-table/DataTable'
import Chip from '../../design-system/components/chip/Chip'
import Callout from '../../design-system/components/callout/Callout'
import Tile from '../../design-system/components/tile/Tile'
import SectionContainer from '../../design-system/components/section-container/SectionContainer'
import { TRUST_LINKS } from '../../lib/routes'
import stats from '../../generated/stats.json'
import styles from './PlatformHubPage.module.css'

const roadmap    = stats.linearRoadmap ?? {}
const inProgress = roadmap.inProgress ?? []
const backlog    = roadmap.backlog    ?? []
const shipped    = roadmap.shipped    ?? []
const isStale    = roadmap.stale === true || (!roadmap.fetchedAt && !inProgress.length && !backlog.length)

function PriorityBadge({ priority }) {
  const classMap = { Urgent: styles.priorityUrgent, High: styles.priorityHigh, Medium: styles.priorityMedium, Low: styles.priorityLow }
  return <span className={`${styles.priorityBadge} ${classMap[priority] ?? ''}`}>{priority ?? '—'}</span>
}

function LabelChips({ labels }) {
  if (!labels?.length) return null
  return <span className={styles.labelChips}>{labels.map(l => <Chip key={l} label={l} size="sm" />)}</span>
}

const BASE_COLUMNS = [
  {
    key: 'identifier', label: 'ID', width: '80px',
    render: (val, row) => (
      <a href={row.url} target="_blank" rel="noopener noreferrer" className={styles.issueId}>{val}</a>
    ),
  },
  { key: 'title',    label: 'Title' },
  { key: 'status',   label: 'Status',   width: '120px' },
  { key: 'priority', label: 'Priority', width: '100px', render: (val) => <PriorityBadge priority={val} /> },
  { key: 'labels',   label: 'Labels',   width: '200px', render: (val) => <LabelChips labels={val} /> },
]

const SHIPPED_COLUMNS = [
  ...BASE_COLUMNS.filter(c => c.key !== 'status'),
  {
    key: 'completedAt', label: 'Shipped', width: '110px',
    render: (val) => val ? <span style={{ whiteSpace: 'nowrap' }}>{val.slice(0, 10)}</span> : '—',
  },
]

export default function RoadmapPage() {
  usePlatformHero({
    title: 'Roadmap',
    subtitle: 'Epics in flight and upcoming, generated from the Linear backlog. Priority order reflects the sequenced dependency graph.',
  })

  return (
    <>
      <SeoHead
        title="Roadmap — Platform"
        description="Platform roadmap — epics in flight and upcoming, generated from the Linear backlog."
      />
      <div className={styles.hub}>

        <SectionContainer className={styles.statsSection}>
          <Tile label="In progress" value={inProgress.length} href="https://linear.app/sugartown" />
          <Tile label="Backlog"     value={backlog.length}    href="https://linear.app/sugartown" />
          <Tile label="Shipped"     value={shipped.length}    href={TRUST_LINKS.changelog} />
        </SectionContainer>

        {isStale && (
          <Callout>
            Live roadmap data is unavailable — <code>LINEAR_API_KEY</code> is not configured in this environment.
            The full backlog is on{' '}
            <a href="https://linear.app/sugartown" target="_blank" rel="noreferrer">Linear ↗</a>.
          </Callout>
        )}

        <section id="in-progress" className={styles.section}>
          <SectionLabel name="In progress" kicker={`${inProgress.length} epic${inProgress.length !== 1 ? 's' : ''}`} />
          {inProgress.length > 0
            ? <DataTable columns={BASE_COLUMNS} rows={inProgress} variant="trust" />
            : <p className={styles.empty}>No epics currently in progress.</p>
          }
        </section>

        <section id="backlog" className={styles.section}>
          <SectionLabel name="Backlog" kicker={`${backlog.length} epic${backlog.length !== 1 ? 's' : ''}`} />
          {backlog.length > 0
            ? <DataTable columns={BASE_COLUMNS} rows={backlog} variant="trust" />
            : <p className={styles.empty}>Backlog is empty.</p>
          }
        </section>

        <section id="shipped" className={styles.section}>
          <SectionLabel name="Shipped" kicker="Most recent 20" />
          {shipped.length > 0
            ? <DataTable columns={SHIPPED_COLUMNS} rows={shipped} variant="trust" />
            : (
              <Callout>
                Shipped data populates once <code>LINEAR_API_KEY</code> is wired into CI.
                Recent releases are in the{' '}
                <a href={TRUST_LINKS.changelog} target="_blank" rel="noreferrer">CHANGELOG ↗</a>.
              </Callout>
            )
          }
        </section>

      </div>
    </>
  )
}
