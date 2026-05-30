import { useSanityDoc } from '../lib/useSanityDoc'
import { latestArticleQuery, latestNodeQuery } from '../lib/queries'
import { getCanonicalPath } from '../lib/routes'
import { Grid } from '../design-system'
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

// ── Mini-releases Report ────────────────────────────────────────────────────

function MiniReleasesReport() {
  const patches = stats.release?.latestPatches ?? []

  return (
    <div className={styles.reportWrap}>
      <DataTable
        columns={RELEASE_COLUMNS}
        rows={patches}
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

// ── Recently Shipped Report ─────────────────────────────────────────────────

function formatTileDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function RecentlyShippedReport() {
  const { data: latestArticle, loading: articleLoading } = useSanityDoc(latestArticleQuery)
  const { data: latestNode, loading: nodeLoading } = useSanityDoc(latestNodeQuery)
  const release = stats.release?.current

  return (
    <div className={styles.reportWrap}>
      <Grid spacing="0" accentTop accentColor="ink" columns={3}>
        <Tile
          label="Release"
          title={release ? `v${release.version}` : '—'}
          body={release?.descriptor}
          meta={release ? `${release.date} · ${release.linearIssue ?? 'changelog'}` : null}
          href={TRUST_LINKS.changelog}
          labelColor="brand"
          titleSize="lg"
        />
        <Tile
          label="Article"
          title={latestArticle?.title}
          meta={[latestArticle?.category?.title, formatTileDate(latestArticle?.publishedAt)].filter(Boolean).join(' · ')}
          href={latestArticle ? getCanonicalPath({ docType: 'article', slug: latestArticle.slug }) : null}
          loading={articleLoading}
          labelColor="brand"
          titleSize="lg"
        />
        <Tile
          label="Node"
          title={latestNode?.title}
          meta={[latestNode?.category?.title, formatTileDate(latestNode?.publishedAt)].filter(Boolean).join(' · ')}
          href={latestNode ? getCanonicalPath({ docType: 'node', slug: latestNode.slug }) : null}
          loading={nodeLoading}
          labelColor="brand"
          titleSize="lg"
        />
      </Grid>
    </div>
  )
}

// ── Design System Stats Report ──────────────────────────────────────────────

function DesignSystemStatsReport() {
  const { ds } = stats

  const tokenSegments = ds?.tokens?.primitives != null
    ? [
        { label: 'Primitive', value: ds.tokens.primitives, color: 'var(--st-color-accent)' },
        { label: 'Semantic',  value: ds.tokens.semantic ?? 0, color: 'var(--st-color-seafoam)' },
        { label: 'Component', value: ds.tokens.component,  color: 'var(--st-color-violet)' },
      ]
    : []

  const dsComponents          = ds?.dsComponents ?? 0
  const webAdapters           = ds?.webAdapters ?? 0
  const dsWithStories         = ds?.dsComponentsWithStories ?? 0
  const coveragePct           = dsComponents > 0 ? Math.round((dsWithStories / dsComponents) * 100) : 0
  const tokenCompliance = ds?.tokenCompliance ?? null

  return (
    <div className={styles.reportWrap}>
      <div className={styles.tileGrid}>
        <Tile
          label="Design tokens"
          value={ds?.tokens?.total ?? '—'}
          bar={tokenSegments.length ? { segments: tokenSegments, total: ds.tokens.total } : undefined}
          legend
        />
        <Tile
          label="Components"
          value={dsComponents || '—'}
          sub={webAdapters > 0 ? `+ ${webAdapters} web adapters` : undefined}
        />
        <Tile
          label="Story coverage"
          value={coveragePct || '—'}
          unit="%"
          sub={dsComponents > 0 ? `${dsWithStories} of ${dsComponents} DS components` : undefined}
        />
        <Tile
          label="Token compliance"
          value={tokenCompliance != null ? tokenCompliance : '—'}
          unit="%"
          sub="CSS var refs using --st-* tokens"
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
  'recent-releases':     'Recent releases',
  'mini-releases':       'Mini-releases',
  'recently-shipped':    'Recently shipped',
  'design-system-stats': 'Design system',
  'cwv-snapshot':        'CWV Performance',
}

function ReportBlock({ reportKey, section }) {
  if (reportKey === 'recent-releases')     return <RecentReleasesReport />
  if (reportKey === 'mini-releases')       return <MiniReleasesReport />
  if (reportKey === 'recently-shipped')    return <RecentlyShippedReport />
  if (reportKey === 'design-system-stats') return <DesignSystemStatsReport />
  if (reportKey === 'cwv-snapshot')        return <CwvSnapshot section={section} />
  return null
}

// ── TrustReportSection ──────────────────────────────────────────────────────

export default function TrustReportSection({ section }) {
  const { heading, reports, reportType, _sectionId } = section ?? {}

  // Support legacy single-value reportType alongside new reports[] array.
  // recently-shipped is always rendered first regardless of Studio order.
  const rawList = reports?.length ? reports : (reportType ? [reportType] : [])
  const reportList = [
    ...rawList.filter(r => r === 'recently-shipped'),
    ...rawList.filter(r => r !== 'recently-shipped'),
  ]

  const sectionHeading = heading ? <h2 className={styles.sectionHeading}>{heading}</h2> : null

  if (reportList.length === 0) return null

  const cwvKicker = buildKicker()

  // Single report — original layout
  if (reportList.length === 1) {
    const key = reportList[0]
    // recently-shipped and mini-releases use SectionLabel (ledger style, no number)
    // cwv-snapshot always uses SectionLabel with a kicker
    // other variants use the plain h2 sectionHeading
    const useSectionLabel = key === 'recently-shipped' || key === 'mini-releases' || key === 'cwv-snapshot'
    return (
      <div id={_sectionId} className={styles.root}>
        {useSectionLabel
          ? <SectionLabel name={heading || REPORT_LABELS[key]} kicker={key === 'cwv-snapshot' ? cwvKicker : undefined} />
          : sectionHeading
        }
        <ReportBlock reportKey={key} section={section} />
      </div>
    )
  }

  // Multiple reports — render each with a SectionLabel above
  return (
    <div id={_sectionId} className={`${styles.root} ${styles.multiReportRoot}`}>
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
