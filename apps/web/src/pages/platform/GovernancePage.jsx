import { useRef } from 'react' // roadmapRef kept for future scroll-spy use
import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import StatCard from '../../components/StatCard'
import { Table, TableWrap, Swatch, Chip, Callout, Grid, SectionLabel } from '@sugartown/design-system'
import { MermaidDiagram } from '../../components/PageSections'
import CwvSnapshot from '../../components/CwvSnapshot'
import { PLATFORM_ROUTES, TRUST_LINKS } from '../../lib/routes'
import stats from '../../generated/stats.json'
import styles from './PlatformHubPage.module.css'
import pageSectionStyles from '../../components/PageSections.module.css'

// ── KindBadge — inline after DataTable shim deletion ──────
function KindBadge({ kind }) {
  const cls = { minor: styles.badgeMinor, major: styles.badgeMajor, patch: styles.badgePatch }
  return <span className={[styles.badge, cls[kind] ?? ''].filter(Boolean).join(' ')}>{kind}</span>
}

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

// ── Roadmap data ──────────────────────────────────────────
const PRIORITY_SWATCH = {
  high:   { color: 'var(--st-pri-high)', label: 'High' },
  medium: { color: 'var(--st-pri-med)',  label: 'Medium' },
  low:    { color: 'var(--st-pri-low)',  label: 'Low' },
  none:   { color: null,                 label: 'No priority' },
}

const PRIORITY_LEVEL = {
  High: 'high', Urgent: 'high',
  Medium: 'medium',
  Low: 'low',
  'No priority': 'none',
}

const PRIORITY_ORDER = ['high', 'medium', 'low', 'none']
const byPriority = (a, b) =>
  PRIORITY_ORDER.indexOf(PRIORITY_LEVEL[a.priority] ?? 'none') -
  PRIORITY_ORDER.indexOf(PRIORITY_LEVEL[b.priority] ?? 'none')

const roadmap    = stats.linearRoadmap ?? {}
const inProgress = roadmap.inProgress ?? []

const allBacklog = roadmap.backlog ?? []
const todo    = allBacklog.filter(e => e.status === 'Todo').sort(byPriority)
const backlog = allBacklog.filter(e => e.status !== 'Todo').sort(byPriority)

// noData: genuinely nothing to show — hide the table entirely
// isStale: data exists but came from last-good fallback — show with notice
const noData  = !roadmap.fetchedAt && !inProgress.length && !allBacklog.length
const isStale = roadmap.stale === true && !noData

const ROADMAP_COLUMNS = [
  { key: 'id',       label: 'ID',       width: 78  },
  { key: 'title',    label: 'Title'                 },
  { key: 'status',   label: 'Status',   width: 110 },
  { key: 'priority', label: 'Priority', width: 120 },
  { key: 'projects', label: 'Projects', width: 260 },
]

function toRoadmapRow(row, issueIdClass, statusCellClass, labelChipsClass) {
  const sw = PRIORITY_SWATCH[PRIORITY_LEVEL[row.priority] ?? 'none']
  return {
    id: <span className={issueIdClass}>{row.identifier}</span>,
    title:    row.title,
    status:   <span className={statusCellClass}>{row.status}</span>,
    priority: <Swatch color={sw.color} label={sw.label} />,
    projects: (
      <div className={labelChipsClass}>
        {(row.projects ?? []).map((p) => (
          <Chip key={p.name} dotColor={p.colorHex} label={p.name} size="sm" />
        ))}
      </div>
    ),
  }
}

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
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/workflows/release-assistant-prompt.md',
  },
]

const RELEASE_DIAGRAM = {
  _key: 'gov-release-process',
  // Node-for-node mapping verified against docs/workflows/release-assistant-prompt.md's
  // Step/Gate table — re-check there before editing either side alone (SUG-245).
  code: `flowchart LR
    A["Collect\\nSignals"] -->|"Collect"| B["Source of\\nTruth"]
    B -->|"Gate 1"| C["Normalize"]
    C -->|"Gate 2"| D["CHANGELOG\\nEntry"]
    D -->|"Gate 3"| E["Release\\nNotes"]
    E -->|"Gate 4"| F["Commit +\\nVersion"]
    F -->|"Gate 5"| G["Backlog\\nReconcile"]
    G -->|"Gate 6"| H["Backlog\\nWrite"]
    H -->|"Gate 7"| I["Backlog\\nCommit"]`,
  width: 'wide',
  caption: 'Release process — 7 gates',
}

// ── AI governance coverage (SUG-198) ──────────────────────
// Data sourced verbatim from docs/ai/agentic-caucus/governance-coverage.md v1.1
const POSTURE = {
  strong:    { color: 'var(--st-posture-strong)',    label: 'Strong' },
  partial:   { color: 'var(--st-posture-partial)',   label: 'Partial' },
  inherited: { color: 'var(--st-posture-inherited)', label: 'Inherited' },
  na:        { color: 'var(--st-posture-na)',        label: 'N/A' },
}

const COVERAGE_TALLY = [
  { label: 'Enforced automatically',          value: 18, body: 'Code and pre-commit hooks catch these, not just written policy.' },
  { label: 'Written down, followed by habit', value: 5,  body: 'Real, but no automated check yet.' },
  { label: 'Handled by our vendors',          value: 2,  body: 'Sanity, GitHub, and Netlify own these.' },
  { label: "Doesn't apply here",              value: 5,  body: 'No AI model is trained on this platform.' },
]

const COVERAGE_LAYERS = [
  { layer: '1 · AI Inventory',           posture: 'strong',    cover: 'Every agent named and deliberately deployed; risk-tiered A–D; per-agent model cards.' },
  { layer: '2 · Data Foundation',        posture: 'partial',   cover: 'Git as source of truth, verbatim content, full validator suite. Lineage and freshness tracked informally.' },
  { layer: '3 · Data Security & Access', posture: 'inherited', cover: 'Encryption and key management owned by Sanity, GitHub, Netlify, and the model providers.' },
  { layer: '4 · Model Assurance',        posture: 'partial',   cover: 'Model cards and drift detection strong; red-teaming via adversarial-verify patterns and validators.' },
  { layer: '5 · Human Oversight',        posture: 'strong',    cover: 'Epic gates, Phase 0, Visual QA, Content Write Gate. Agents propose; Bex decides.' },
  { layer: '6 · Compliance & Audit',     posture: 'strong',    cover: 'Enforced policy in code, standing incident log, data-handling note, full git / Linear / CHANGELOG audit trail.' },
]

const COVERAGE_COLUMNS = [
  { key: 'layer',   label: 'Layer',          width: 230 },
  { key: 'posture', label: 'Posture',        width: 130 },
  { key: 'cover',   label: 'What covers it'             },
]

const toCoverageRow = (r) => {
  const p = POSTURE[r.posture]
  return { layer: r.layer, posture: <Swatch color={p.color} label={p.label} />, cover: r.cover }
}

function RoadmapLane({ label, epics }) {
  const rows = epics.map((r) => toRoadmapRow(r, styles.issueId, styles.statusCell, styles.labelChips))
  const captionMeta = epics.length ? `${epics.length} ${epics.length === 1 ? 'epic' : 'epics'}` : undefined
  return (
    <TableWrap caption={label} captionMeta={captionMeta}>
      <Table tone="subdued" zebra={false} columns={ROADMAP_COLUMNS} rows={rows} />
    </TableWrap>
  )
}

export default function GovernancePage() {
  const roadmapRef = useRef(null)
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

        <Grid spacing="0" accentTop accentColor="ink" columns={4} tabletColumns={2} className={styles.statsSection}>
          <StatCard label="In flight"       value={inProgress.length || '—'} href="https://linear.app/sugartown" />
          <StatCard label="Current release" value={stats.release?.current?.version ?? '—'} href={TRUST_LINKS.changelog} />
          <StatCard label="Epics shipped"   value={stats.repo?.epicsShipped ?? '—'} href={TRUST_LINKS.commits} />
          <StatCard label="Vulnerabilities" value="0" href={TRUST_LINKS.security} />
        </Grid>

        <section id="recent-releases" className={styles.section}>
          <SectionLabel
            level="h3"
            number="§01"
            name="RECENT RELEASES"
            title="Latest shipped versions"
            kicker="Last 5"
          />
          <TableWrap><Table tone="subdued" columns={RELEASE_COLUMNS} rows={RECENT_RELEASES} /></TableWrap>
          <div className={styles.trustLinks}>
            <a href={TRUST_LINKS.changelog} className={styles.trustLink} target="_blank" rel="noreferrer">Full changelog</a>
            <a href={TRUST_LINKS.commits}   className={styles.trustLink} target="_blank" rel="noreferrer">Commit log</a>
          </div>
        </section>

        <section id="roadmap" className={styles.section}>
          <SectionLabel
            level="h3"
            number="§02"
            name="ROADMAP"
            title="Linear epics, in flight and on deck"
            kicker={noData ? '—' : `${inProgress.length + todo.length + backlog.length} epics`}
          />

          {noData && (
            <Callout>
              Roadmap data pending next CI run. Full backlog on{' '}
              <a href="https://linear.app/sugartown" target="_blank" rel="noreferrer">Linear ↗</a>.
            </Callout>
          )}

          {!noData && (
            <>
              {isStale && (
                <Callout variant="info">
                  Showing last available data. Full backlog on{' '}
                  <a href="https://linear.app/sugartown" target="_blank" rel="noreferrer">Linear ↗</a>.
                </Callout>
              )}
              <div ref={roadmapRef} className={styles.roadmapScroll}>
                {inProgress.length > 0
                  ? <RoadmapLane label="In progress" epics={inProgress} />
                  : <p className={styles.empty}>No epics currently in progress.</p>
                }

                {todo.length > 0 && <RoadmapLane label="To do" epics={todo} />}

                {backlog.length > 0
                  ? <RoadmapLane label="Backlog" epics={backlog} />
                  : <p className={styles.empty}>Backlog is empty.</p>
                }
              </div>
            </>
          )}
        </section>

        <section id="release-process" className={styles.section}>
          <SectionLabel
            level="h3"
            number="§03"
            name="RELEASE PROCESS"
            title="How a change reaches production"
            kicker="Gate model"
          />
          <MermaidDiagram
            _key={RELEASE_DIAGRAM._key}
            code={RELEASE_DIAGRAM.code}
            caption={RELEASE_DIAGRAM.caption}
            className={pageSectionStyles.mermaidSectionWide}
          />
        </section>

        <section id="site-performance" className={styles.section}>
          <SectionLabel
            level="h3"
            number="§04"
            name="SITE PERFORMANCE"
            title="Lighthouse + Core Web Vitals"
            kicker="Live data"
          />
          <CwvSnapshot section={{ cwvUrl: 'https://sugartown.io/' }} />
        </section>

        <section id="ai-governance" className={styles.section}>
          <SectionLabel
            level="h3"
            number="§05"
            name="AI GOVERNANCE COVERAGE"
            title="Enforced policy, measured"
            kicker="30 checks · 0 gaps"
          />
          <p className={styles.intro}>
            Every release is checked against 30 governance checkpoints across six areas —
            from who can publish what, to how model risk is tracked. Here&rsquo;s how those
            checks actually happen.
          </p>
          <Grid spacing="0" accentTop accentColor="ink" columns={4} tabletColumns={2} className={styles.statsSection}>
            {COVERAGE_TALLY.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} body={s.body} />
            ))}
          </Grid>
          <TableWrap caption="Six-layer coverage" captionMeta="6 layers">
            <Table tone="subdued" zebra={false} columns={COVERAGE_COLUMNS} rows={COVERAGE_LAYERS.map(toCoverageRow)} />
          </TableWrap>
        </section>

        <section id="governance-artifacts" className={styles.section}>
          <SectionLabel
            level="h3"
            number="§06"
            name="ARTIFACTS"
            title="Briefs, prompts, conventions"
            kicker={`${ARTIFACTS.length} documents`}
          />
          <Grid spacing="0" accentTop accentColor="ink" columns={4} tabletColumns={2}>
            {ARTIFACTS.map((a) => (
              <StatCard key={a.title} label={a.eyebrow} value={a.title} body={a.body} href={a.href} titleSize="xl" />
            ))}
          </Grid>
        </section>

      </div>
    </>
  )
}
