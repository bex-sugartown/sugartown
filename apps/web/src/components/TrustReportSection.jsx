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
  const { ds, storybook } = stats

  const tokenSegments = ds?.tokens?.byCategory
    ? [
        { label: 'Color',  value: ds.tokens.byCategory.color,  color: 'var(--st-color-accent)' },
        { label: 'Font',   value: ds.tokens.byCategory.font,   color: 'var(--st-color-seafoam)' },
        { label: 'Space',  value: ds.tokens.byCategory.space,  color: 'var(--st-color-lime)' },
        { label: 'Shadow', value: ds.tokens.byCategory.shadow, color: 'var(--st-color-violet)' },
        { label: 'Other',  value: ds.tokens.byCategory.other,  color: 'var(--st-color-border-medium)' },
      ]
    : []

  const componentFiles  = ds?.componentFiles ?? 0
  const storybookComps  = storybook?.components ?? 0
  const coveragePct     = componentFiles > 0 ? Math.round((storybookComps / componentFiles) * 100) : 0

  return (
    <div className={styles.reportWrap}>
      <div className={styles.tileGrid}>
        <StatTile
          label="Design tokens"
          value={ds?.tokens?.total ?? '—'}
          sub={ds?.tokens?.primitives != null ? `${ds.tokens.primitives} primitive · ${ds.tokens.component} component` : undefined}
          bar={tokenSegments.length ? { segments: tokenSegments, total: ds.tokens.total } : undefined}
          legend
        />
        <StatTile
          label="Component tokens"
          value={ds?.tokens?.component ?? '—'}
          sub={ds?.tokens?.primitives != null ? `${ds.tokens.primitives} primitive tokens` : undefined}
        />
        <StatTile
          label="Components"
          value={componentFiles || '—'}
          sub={storybookComps > 0 ? `${storybookComps} with story coverage` : undefined}
        />
        <StatTile
          label="Stories"
          value={storybook?.stories ?? '—'}
          sub={storybookComps > 0 ? `${storybookComps} components covered` : undefined}
        />
        <StatTile
          label="Story coverage"
          value={coveragePct || '—'}
          unit="%"
          sub={`${storybookComps} of ${componentFiles} components`}
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
  const { heading, reportType } = section ?? {}

  const sectionHeading = heading ? <h2 className={styles.sectionHeading}>{heading}</h2> : null

  if (reportType === 'recent-releases') {
    return <>{sectionHeading}<RecentReleasesReport /></>
  }

  if (reportType === 'design-system-stats') {
    return <>{sectionHeading}<DesignSystemStatsReport /></>
  }

  return null
}
