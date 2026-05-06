import stats from '../generated/stats.json'

function buildKicker() {
  const iso = stats.perf?.generatedAt ?? stats.crux?.fetchedAt
  if (!iso) return null
  const d = new Date(iso)
  const date = d.toISOString().slice(0, 10)
  const time = d.toISOString().slice(11, 16)
  return `Built ${date} · ${time} UTC`
}
import { TRUST_LINKS } from '../lib/routes'
import Tile from '../design-system/components/tile/Tile'
import DataTable, { KindBadge } from '../design-system/components/data-table/DataTable'
import SectionLabel from '../design-system/components/section-label/SectionLabel'
import CwvSnapshot from './CwvSnapshot'
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
  const releases = (stats.release?.latestN ?? []).filter(r => r.kind !== 'PATCH')

  return (
    <div className={styles.reportWrap}>
      <DataTable
        columns={RELEASE_COLUMNS}
        rows={releases}
        variant="trust"
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
        <Tile
          label="Design tokens"
          value={ds?.tokens?.total ?? '—'}
          sub={ds?.tokens?.primitives != null ? `${ds.tokens.primitives} primitive · ${ds.tokens.component} component` : undefined}
          bar={tokenSegments.length ? { segments: tokenSegments, total: ds.tokens.total } : undefined}
          legend
        />
        <Tile
          label="Components"
          value={componentFiles || '—'}
          sub={storybookComps > 0 ? `${storybookComps} with story coverage` : undefined}
        />
        <Tile
          label="Stories"
          value={storybook?.stories ?? '—'}
          sub={storybookComps > 0 ? `${storybookComps} components covered` : undefined}
        />
        <Tile
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

const REPORT_LABELS = {
  'recent-releases':    'Recent releases',
  'design-system-stats': 'Design system',
  'cwv-snapshot':       'Performance',
}

function ReportBlock({ reportKey, section }) {
  if (reportKey === 'recent-releases')    return <RecentReleasesReport />
  if (reportKey === 'design-system-stats') return <DesignSystemStatsReport />
  if (reportKey === 'cwv-snapshot')       return <CwvSnapshot section={section} />
  return null
}

// ── TrustReportSection ──────────────────────────────────────────────────────

export default function TrustReportSection({ section }) {
  const { heading, reports, reportType, _sectionId } = section ?? {}

  // Support legacy single-value reportType alongside new reports[] array
  const reportList = reports?.length ? reports : (reportType ? [reportType] : [])

  const sectionHeading = heading ? <h2 className={styles.sectionHeading}>{heading}</h2> : null

  if (reportList.length === 0) return null

  const cwvKicker = buildKicker()

  // Single report — original layout (no SectionLabel above)
  if (reportList.length === 1) {
    const key = reportList[0]
    return (
      <div id={_sectionId}>
        {sectionHeading}
        {key === 'cwv-snapshot' && (
          <SectionLabel name={REPORT_LABELS[key]} kicker={cwvKicker} />
        )}
        <ReportBlock reportKey={key} section={section} />
      </div>
    )
  }

  // Multiple reports — render each with a SectionLabel above
  return (
    <div id={_sectionId} className={styles.multiReportRoot}>
      {sectionHeading}
      {reportList.map((key, idx) => (
        <div key={key} className={styles.multiReportBlock}>
          <SectionLabel
            number={`0${idx + 1}`}
            name={REPORT_LABELS[key] ?? key}
            kicker={key === 'cwv-snapshot' ? cwvKicker : undefined}
          />
          <div className={styles.reportWrap}>
            <ReportBlock reportKey={key} section={section} />
          </div>
        </div>
      ))}
    </div>
  )
}
