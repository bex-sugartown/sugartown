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

// ── Workflow lifecycle diagram (SUG-244) ──────────────────
// Layer badges verified against docs/ai/agentic-caucus/governance-coverage.md's
// evidence rows (see SUG-244's Governance-layer mapping table) — re-check there
// before changing which layer a phase is tagged with. L3/L4 are deliberately
// not badged on any node — explained in the legend paragraph below the diagram.
const WORKFLOW_DIAGRAM = {
  _key: 'gov-workflow-lifecycle',
  code: `flowchart LR
    A["Intake\\n[L1]"] --> B["Planning\\n[L5]"]
    B --> C["Design\\n[L5]"]
    C --> D["Implementation\\n[L6]"]
    D --> E["Verification\\n[L6]"]
    E --> F["Close-out\\n[L2]"]
    F --> G["Release\\n[L6]"]
    G --> H["Feedback\\n[L6]"]
    H -.-> B`,
  width: 'wide',
  caption: 'Epic lifecycle — 8 phases, layer-tagged',
}

// ── Governance doc index (SUG-244 Phase 2) ────────────────
// Paths re-verified against the live repo 2026-07-26 — both epics this table
// originally marked "pending" (SUG-241 feedback-loop.md, SUG-242 vspec naming)
// have since shipped, so no row is flagged proposed/pending anymore.
const GH = 'https://github.com/bex-sugartown/sugartown/blob/main/'
const WORKFLOW_DOCS = [
  { phase: 'Intake', docLabel: 'IA Brief + PRD-writer skill', docHref: `${GH}docs/briefs/ia-brief.md`, outputLabel: 'Linear issue (SUG-N assigned)', outputHref: null },
  { phase: 'Planning', docLabel: 'Epic Template + CLAUDE.md §Epic authoring', docHref: `${GH}docs/epic-template.md`, outputLabel: 'Backlog epic doc', outputHref: null },
  { phase: 'Design', docLabel: 'CLAUDE.md §Phase 0 + Design Handoff Template', docHref: `${GH}docs/conventions/design-handoff-template.md`, outputLabel: 'Vspec (drafts/ → shipped/ copy)', outputHref: null },
  { phase: 'Implementation', docLabel: 'CLAUDE.md conventions', docHref: `${GH}CLAUDE.md`, outputLabel: 'Commits, Storybook stories', outputHref: null },
  { phase: 'Verification', docLabel: 'VQA Workflow + CLAUDE.md §Visual Verification', docHref: `${GH}docs/conventions/vqa-workflow.md`, outputLabel: 'VQA table, Chromatic build', outputHref: null },
  { phase: 'Close-out', docLabel: 'CLAUDE.md §Session Discipline', docHref: `${GH}CLAUDE.md`, outputLabel: 'Shipped epic doc, mini-release commit', outputHref: null },
  { phase: 'Release', docLabel: 'Release Assistant', docHref: `${GH}docs/workflows/release-assistant-prompt.md`, outputLabel: 'CHANGELOG', outputHref: TRUST_LINKS.changelog },
  { phase: 'Feedback', docLabel: 'Feedback Loop', docHref: `${GH}docs/conventions/feedback-loop.md`, outputLabel: 'Backlog priorities (dated block)', outputHref: `${GH}docs/backlog/sugartown-backlog-priorities.md` },
]

const WORKFLOW_DOCS_COLUMNS = [
  { key: 'phase',  label: 'Phase',          width: 140 },
  { key: 'doc',    label: 'Governing doc'              },
  { key: 'output', label: 'Output artifact'             },
]

const linkOrText = (label, href) =>
  href ? <a href={href} target="_blank" rel="noopener noreferrer" className={styles.releaseVersionLink}>{label}</a> : label

const toWorkflowDocRow = (r) => ({
  phase: r.phase,
  doc: linkOrText(r.docLabel, r.docHref),
  output: linkOrText(r.outputLabel, r.outputHref),
})

// ── AI governance coverage tally — MOVED (SUG-256 Phase 3, 2026-08-02) ────────
// COVERAGE_TALLY now lives in GovernanceDraftPage.jsx, on a noindex route, while
// it is re-measured. Three of the claims around it were measurable as false or
// unbacked, and iterating on public claims about this platform's own rigour costs
// credibility on every deploy. §05 below keeps the workflow diagram and doc index
// (SUG-244), which publish attribution rather than sufficiency, and carries a
// dated notice where the tally was.
//
// Do not re-add a tally here without re-running the verification review.

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
          {/* Derived from `pnpm audit` via apps/web/scripts/stats/security.js, not
              hardcoded (SUG-256 Ph3 / CTL-029). The measurement date rides along at
              stats.security.fetchedAt. Was the string literal "0": no date, no source,
              and nothing failed when it stopped being true. */}
          <StatCard label="Vulnerabilities" value={stats.security?.vulnerabilities?.total ?? '—'} href={TRUST_LINKS.security} />
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
            name="AI GOVERNANCE WORKFLOW"
            title="Epic lifecycle, layer-tagged"
            kicker="8 phases"
          />
          <Callout variant="warn" title="COVERAGE MAP">
            The AI-governance coverage tally is being re-measured and is not published here
            while that work runs. Tracked as SUG-256, started 2026-08-02.
          </Callout>
          <Callout variant="info">
            Each phase is tagged with its primary AI-governance layer (L1 AI Inventory, L2
            Data Foundation, L5 Human Oversight, L6 Compliance &amp; Audit). L3 Data
            Security &amp; Access and L4 Model Assurance are not tied to a single node.
          </Callout>
          <MermaidDiagram
            _key={WORKFLOW_DIAGRAM._key}
            code={WORKFLOW_DIAGRAM.code}
            caption={WORKFLOW_DIAGRAM.caption}
            className={pageSectionStyles.mermaidSectionWide}
          />
          <TableWrap caption="Governance doc index" captionMeta="8 phases">
            <Table tone="subdued" zebra={false} columns={WORKFLOW_DOCS_COLUMNS} rows={WORKFLOW_DOCS.map(toWorkflowDocRow)} />
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
