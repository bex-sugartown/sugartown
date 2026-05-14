import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import Tile from '../../design-system/components/tile/Tile'
import SectionContainer from '../../design-system/components/section-container/SectionContainer'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Card from '../../design-system/components/card/Card'
import DataTable, { KindBadge } from '../../design-system/components/data-table/DataTable'
import Chip from '../../design-system/components/chip/Chip'
import Callout from '../../design-system/components/callout/Callout'
import { MermaidDiagram } from '../../components/PageSections'
import { PLATFORM_ROUTES, TRUST_LINKS } from '../../lib/routes'
import stats from '../../generated/stats.json'
import styles from './PlatformHubPage.module.css'

// ── Release table ─────────────────────────────────────────
const RELEASE_COLUMNS = [
  {
    key: 'version', label: 'Version', width: '110px',
    render: (val) => (
      <a href={TRUST_LINKS.changelog} target="_blank" rel="noopener noreferrer" className={styles.releaseVersionLink}>
        {val}
      </a>
    ),
  },
  { key: 'date',       label: 'Date',        width: '110px', render: (val) => <span style={{ whiteSpace: 'nowrap' }}>{val}</span> },
  { key: 'kind',       label: 'Kind',        width: '80px',  render: (val) => <KindBadge kind={val?.toLowerCase()} /> },
  { key: 'descriptor', label: 'Description' },
]

const RECENT_RELEASES = (stats.release?.latestN ?? []).slice(0, 5)

// ── Roadmap tables ────────────────────────────────────────
const roadmap    = stats.linearRoadmap ?? {}
const inProgress = roadmap.inProgress ?? []
const backlog    = roadmap.backlog    ?? []
const isStale    = roadmap.stale === true || (!roadmap.fetchedAt && !inProgress.length && !backlog.length)

function PriorityBadge({ priority }) {
  const classMap = { Urgent: styles.priorityUrgent, High: styles.priorityHigh, Medium: styles.priorityMedium, Low: styles.priorityLow }
  return <span className={`${styles.priorityBadge} ${classMap[priority] ?? ''}`}>{priority ?? '—'}</span>
}

function LabelChips({ labels }) {
  if (!labels?.length) return null
  return <span className={styles.labelChips}>{labels.map(l => <Chip key={l} label={l} size="sm" />)}</span>
}

const ROADMAP_COLUMNS = [
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

// ── Artifacts ─────────────────────────────────────────────
const ARTIFACTS = [
  {
    eyebrow: 'Brief',
    title: 'IA Brief',
    body: 'Locked route namespace, nav structure, and content creation rules for sugartown.io.',
    href: PLATFORM_ROUTES.root,
  },
  {
    eyebrow: 'Conventions',
    title: 'CLAUDE.md',
    body: 'Session discipline, CSS protocol, schema conventions, and commit rules enforced by Claude Code.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/CLAUDE.md',
  },
  {
    eyebrow: 'Brief',
    title: 'AI Ethics & Operations',
    body: 'Principles and operating constraints for AI-assisted content, code, and decision-making on this platform.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/briefs/ai-ethics-and-operations.md',
  },
  {
    eyebrow: 'Prompt',
    title: 'Release Assistant',
    body: 'Structured prompt for running the mini-release sequence — CHANGELOG stub, version bump, and ship doc.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/release-assistant-prompt.md',
  },
]

const RELEASE_DIAGRAM = {
  _key: 'gov-release-process',
  code: `flowchart LR
    A["Git Log\\n+ Diff"] -->|"Collect"| B["Normalize\\nChanges"]
    B -->|"Gate 1"| C["CHANGELOG\\nEntry"]
    C -->|"Gate 2"| D["Release\\nNotes"]
    D -->|"Gate 3"| E["Version\\nBump"]
    E -->|"Gate 4"| F["Backlog\\nReconcile"]
    F -->|"Gate 5"| G["Ship"]

    style A fill:#1a2436,stroke:#ff247d,color:#f5f7fa
    style G fill:#1a2436,stroke:#2bd4aa,color:#f5f7fa`,
  width: 'wide',
  caption: 'Release process',
}

export default function GovernancePage() {
  usePlatformHero({
    title: 'Governance',
    subtitle: 'Release cadence, roadmap, and process conventions. Every epic is tracked in Linear, every release is versioned, every process decision is documented.',
  })
  return (
    <>
      <SeoHead
        title="Governance — Platform"
        description="Release cadence, roadmap, and process conventions for sugartown.io."
      />
      <div className={styles.hub}>

        <SectionContainer className={styles.statsSection}>
          <Tile label="In flight"       value={inProgress.length || '—'} href="https://linear.app/sugartown" />
          <Tile label="Current release" value={stats.release?.current?.version ?? '—'} href={TRUST_LINKS.changelog} />
          <Tile label="Epics shipped"   value={stats.repo?.epicsShipped ?? '—'} href={TRUST_LINKS.commits} />
          <Tile label="Vulnerabilities" value="0" labelColor="brand" href={TRUST_LINKS.security} />
        </SectionContainer>

        <section id="roadmap" className={styles.section}>
          <SectionLabel name="Roadmap" kicker="In progress + upcoming" />

          {isStale && (
            <Callout>
              Roadmap data pending next CI run. Full backlog on{' '}
              <a href="https://linear.app/sugartown" target="_blank" rel="noreferrer">Linear ↗</a>.
            </Callout>
          )}

          {!isStale && (
            <>
              <SectionLabel name="In progress" kicker={`${inProgress.length} epic${inProgress.length !== 1 ? 's' : ''}`} />
              {inProgress.length > 0
                ? <DataTable columns={ROADMAP_COLUMNS} rows={inProgress} variant="trust" />
                : <p className={styles.empty}>No epics currently in progress.</p>
              }

              <SectionLabel name="Backlog" kicker={`${backlog.length} epic${backlog.length !== 1 ? 's' : ''}`} />
              {backlog.length > 0
                ? <DataTable columns={ROADMAP_COLUMNS} rows={backlog} variant="trust" />
                : <p className={styles.empty}>Backlog is empty.</p>
              }
            </>
          )}
        </section>

        <section id="recent-releases" className={styles.section}>
          <SectionLabel name="Recent releases" kicker="Last 5" />
          <DataTable columns={RELEASE_COLUMNS} rows={RECENT_RELEASES} variant="trust" />
          <div className={styles.trustLinks}>
            <a href={TRUST_LINKS.changelog} className={styles.trustLink} target="_blank" rel="noreferrer">Full changelog</a>
            <a href={TRUST_LINKS.commits}   className={styles.trustLink} target="_blank" rel="noreferrer">Commit log</a>
          </div>
        </section>

        <section id="release-process" className={styles.section}>
          <SectionLabel name="Release process" kicker="Gate model" />
          <MermaidDiagram section={RELEASE_DIAGRAM} />
        </section>

        <section id="governance-artifacts" className={styles.section}>
          <SectionLabel name="Artifacts" className={styles.labelFlush} />
          <SectionContainer columns={3}>
            {ARTIFACTS.map((a) => (
              <Card key={a.title} eyebrow={a.eyebrow} title={a.title} excerpt={a.body} href={a.href} />
            ))}
          </SectionContainer>
        </section>

      </div>
    </>
  )
}
