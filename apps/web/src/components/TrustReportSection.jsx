import stats from '../generated/stats.json'
import { TRUST_LINKS } from '../lib/routes'
import StatTile from '../design-system/components/stat-tile/StatTile'
import DataTable, { KindBadge } from '../design-system/components/data-table/DataTable'
import styles from './TrustReportSection.module.css'

// ── Recent Releases Report ──────────────────────────────────────────────────

const RELEASE_COLUMNS = [
  {
    key:   'version',
    label: 'Version',
    width: '110px',
    render: (val) => (
      <a
        className={styles.versionLink}
        href={`${TRUST_LINKS.changelog}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {val}
      </a>
    ),
  },
  { key: 'date',       label: 'Date',        width: '110px',
    render: (val) => <span style={{ whiteSpace: 'nowrap' }}>{val}</span> },
  {
    key:    'kind',
    label:  'Kind',
    width:  '80px',
    render: (val) => <KindBadge kind={val?.toLowerCase()} />,
  },
  { key: 'descriptor', label: 'Description' },
]

function RecentReleasesReport() {
  const releases = stats.release?.latestN ?? []

  return (
    <div className={styles.reportWrap}>
      <DataTable
        columns={RELEASE_COLUMNS}
        rows={releases}
        variant="trust"
        caption="Recent releases"
      />
      <div className={styles.reportFooter}>
        <a href={TRUST_LINKS.changelog} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
          Full changelog
        </a>
      </div>
    </div>
  )
}

// ── Design System Stats Report ──────────────────────────────────────────────

function DesignSystemStatsReport() {
  const { ds, storybook, repo } = stats

  const tokenSegments = ds?.tokens?.byCategory
    ? [
        { label: 'Color',  value: ds.tokens.byCategory.color,  color: 'var(--st-color-accent)' },
        { label: 'Font',   value: ds.tokens.byCategory.font,   color: 'var(--st-color-seafoam)' },
        { label: 'Space',  value: ds.tokens.byCategory.space,  color: 'var(--st-color-lime)' },
        { label: 'Shadow', value: ds.tokens.byCategory.shadow, color: 'var(--st-color-violet)' },
        { label: 'Other',  value: ds.tokens.byCategory.other,  color: 'var(--st-color-border-medium)' },
      ]
    : []

  return (
    <div className={styles.reportWrap}>
      <div className={styles.tileGrid}>
        <StatTile
          label="Design tokens"
          value={ds?.tokens?.total ?? '—'}
          bar={tokenSegments.length ? { segments: tokenSegments, total: ds.tokens.total } : undefined}
          legend
        />
        <StatTile
          label="Components"
          value={ds?.componentFiles ?? '—'}
        />
        <StatTile
          label="Stories"
          value={storybook?.stories ?? '—'}
        />
        <StatTile
          label="Commits"
          value={repo?.commits ?? '—'}
        />
        <StatTile
          label="Epics shipped"
          value={repo?.epicsShipped ?? '—'}
        />
      </div>
      <div className={styles.reportFooter}>
        <a href={TRUST_LINKS.storybook} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
          Storybook
        </a>
        <a href={TRUST_LINKS.changelog} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
          Changelog
        </a>
      </div>
    </div>
  )
}

// ── TrustReportSection ──────────────────────────────────────────────────────

export default function TrustReportSection({ section }) {
  const { title, reportType } = section ?? {}

  const heading = title ? <h2 className={styles.sectionTitle}>{title}</h2> : null

  if (reportType === 'recent-releases') {
    return <>{heading}<RecentReleasesReport /></>
  }

  if (reportType === 'design-system-stats') {
    return <>{heading}<DesignSystemStatsReport /></>
  }

  return null
}
