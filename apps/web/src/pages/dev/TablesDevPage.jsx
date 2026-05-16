/**
 * /dev/tables — Table component test bench
 * Dev-only page. Uses real DS components, tokens, and CSS.
 * Not linked in nav; access directly at /dev/tables.
 *
 * Roadmap fixture = actual production data from stats.json (linearRoadmap).
 * Projects field omitted in stats pipeline — rendered as empty chip list.
 */
import Table, { TableWrap } from '../../design-system/components/table/Table'
import RoadmapTable from '../../design-system/components/roadmap-table/RoadmapTable'
import DataTable, { KindBadge } from '../../design-system/components/data-table/DataTable'
import styles from './TablesDevPage.module.css'

// ── Real prod roadmap data (from stats.json as of 2026-05-16) ─────────────────
const IN_PROGRESS = [
  {
    identifier: 'SUG-118',
    title: 'Platform Stats Page II — governance page design refresh',
    url: 'https://linear.app/sugartown/issue/SUG-118/platform-stats-page-ii-governance-page-design-refresh',
    priority: 'High',
    status: 'In Progress',
    projects: [],
  },
]

const BACKLOG = [
  { identifier: 'SUG-119', title: 'Table audit — converge to st-table', url: 'https://linear.app/sugartown/issue/SUG-119', priority: 'High', status: 'In Progress', projects: [] },
  { identifier: 'SUG-117', title: 'CWV mobile form-factor reporting', url: 'https://linear.app/sugartown/issue/SUG-117', priority: 'Medium', status: 'Backlog', projects: [] },
  { identifier: 'SUG-116', title: 'Ledger Button Update — baseline rule, sm/md/lg sizes, Storybook snapshot', url: 'https://linear.app/sugartown/issue/SUG-116', priority: 'Low', status: 'Todo', projects: [] },
  { identifier: 'SUG-114', title: 'Dynamic schema ERD — generate content model from deployed Sanity schema', url: 'https://linear.app/sugartown/issue/SUG-114', priority: 'Medium', status: 'Backlog', projects: [] },
  { identifier: 'SUG-107', title: 'Client taxonomy — audit & promote string field to reference doc', url: 'https://linear.app/sugartown/issue/SUG-107', priority: 'Medium', status: 'Backlog', projects: [] },
  { identifier: 'SUG-103', title: 'Publish component registry to platform/DS documentation', url: 'https://linear.app/sugartown/issue/SUG-103', priority: 'Medium', status: 'Todo', projects: [] },
  { identifier: 'SUG-97',  title: 'Studio schema field group audit + reorganisation', url: 'https://linear.app/sugartown/issue/SUG-97', priority: 'Medium', status: 'Backlog', projects: [] },
  { identifier: 'SUG-72',  title: 'Shopify MVP — /platform + /services content sections (follow-on)', url: 'https://linear.app/sugartown/issue/SUG-72', priority: 'Low', status: 'Backlog', projects: [] },
  { identifier: 'SUG-71',  title: 'Shopify MVP integration — /shop + commerce adapter seam (Pattern A)', url: 'https://linear.app/sugartown/issue/SUG-71', priority: 'Medium', status: 'Backlog', projects: [] },
  { identifier: 'SUG-60',  title: 'Video Section — embedded video support (Vimeo, YouTube, uploaded)', url: 'https://linear.app/sugartown/issue/SUG-60', priority: 'No priority', status: 'Backlog', projects: [] },
  { identifier: 'SUG-57',  title: 'Pink Moon Phase 5 — Academic layer (marginalia, index, glossary, running headers)', url: 'https://linear.app/sugartown/issue/SUG-57', priority: 'No priority', status: 'Backlog', projects: [] },
  { identifier: 'SUG-36',  title: 'Site-wide content search', url: 'https://linear.app/sugartown/issue/SUG-36', priority: 'Low', status: 'Backlog', projects: [] },
  { identifier: 'SUG-35',  title: 'Glossary: Term Definitions, Inline Annotations & Glossary Page', url: 'https://linear.app/sugartown/issue/SUG-35', priority: 'Medium', status: 'Backlog', projects: [] },
  { identifier: 'SUG-19',  title: 'KPI dashboard card family: stat-card, bar-card, insight-card', url: 'https://linear.app/sugartown/issue/SUG-19', priority: 'Medium', status: 'Backlog', projects: [] },
]

// ── Release table fixture ─────────────────────────────────────────────────────
const RELEASE_COLUMNS = [
  { key: 'version', label: 'Version', width: '110px' },
  { key: 'date',    label: 'Date',    width: '110px', render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
  { key: 'kind',    label: 'Kind',    width: '80px',  render: (v) => <KindBadge kind={v} /> },
  { key: 'desc',    label: 'Description' },
]

const RELEASE_ROWS = [
  { version: '0.23.30', date: '2026-05-16', kind: 'minor', desc: 'Table audit — tone prop, caption surface, LaneHeader retired.' },
  { version: '0.23.0',  date: '2026-04-27', kind: 'minor', desc: 'Trust data pipeline, Ledger Tradition design system, dynamic KG.' },
  { version: '0.22.0',  date: '2026-04-22', kind: 'minor', desc: 'Pink Moon implementation, Ledger Tradition font stack, page layout.' },
  { version: '0.21.0',  date: '2026-04-06', kind: 'minor', desc: 'Storybook v10 upgrade, Accordion component, full story coverage.' },
  { version: '0.20.0',  date: '2026-04-01', kind: 'patch', desc: 'Responsive mobile nav, image treatments, gallery.' },
]

// ── DS component registry fixture ─────────────────────────────────────────────
const REGISTRY_COLUMNS = [
  { key: 'component', label: 'Component' },
  { key: 'ds',        label: 'DS package', width: 120 },
  { key: 'web',       label: 'Web adapter', width: 120 },
  { key: 'story',     label: 'Storybook',   width: 120 },
  { key: 'dark',      label: 'Dark mode',   width: 120 },
]

const REGISTRY_ROWS = [
  { component: 'Button',          ds: '✅', web: '✅', story: '✅', dark: '✅' },
  { component: 'Card',            ds: '✅', web: '✅', story: '✅', dark: '✅' },
  { component: 'Chip',            ds: '✅', web: '✅', story: '✅', dark: '✅' },
  { component: 'Table',           ds: '✅', web: '✅', story: '✅', dark: '✅' },
  { component: 'FilterBar',       ds: '✅', web: '—',  story: '✅', dark: '✅' },
  { component: 'ScoreRing',       ds: '✅', web: '✅', story: '✅', dark: '✅' },
  { component: 'SegmentedControl',ds: '✅', web: '✅', story: '✅', dark: '✅' },
  { component: 'PriorityChip',    ds: '✅', web: '✅', story: '✅', dark: '⚠️' },
  { component: 'DataTable',       ds: '—',  web: '⚠️', story: '✅', dark: '⚠️' },
  { component: 'RoadmapTable',    ds: '—',  web: '✅', story: '✅', dark: '✅' },
]

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ id, label, children }) {
  return (
    <section id={id} className={styles.section}>
      <h2 className={styles.sectionTitle}>{label}</h2>
      {children}
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TablesDevPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.badge}>DEV</p>
        <h1 className={styles.title}>Table component test bench</h1>
        <p className={styles.subtitle}>Real DS components · Real tokens · Real CSS. Not linked in nav.</p>
      </header>

      <nav className={styles.nav}>
        <a href="#accent">Accent (default)</a>
        <a href="#subdued">Subdued</a>
        <a href="#roadmap-in-progress">RoadmapTable — In progress</a>
        <a href="#roadmap-backlog">RoadmapTable — Backlog</a>
        <a href="#releases">DataTable (deprecated)</a>
        <a href="#registry">DS registry (accent, many cols)</a>
      </nav>

      <main className={styles.main}>

        <Section id="accent" label="Table — tone=accent (default, zebra on)">
          <TableWrap caption="Component registry" captionMeta={`${REGISTRY_ROWS.length} components`}>
            <Table
              tone="accent"
              columns={REGISTRY_COLUMNS}
              rows={REGISTRY_ROWS}
            />
          </TableWrap>
        </Section>

        <Section id="subdued" label="Table — tone=subdued (zebra off)">
          <TableWrap caption="Component registry" captionMeta={`${REGISTRY_ROWS.length} components`}>
            <Table
              tone="subdued"
              zebra={false}
              columns={REGISTRY_COLUMNS}
              rows={REGISTRY_ROWS}
            />
          </TableWrap>
        </Section>

        <Section id="roadmap-in-progress" label="RoadmapTable — In progress (prod data, no projects)">
          <p className={styles.note}>
            Projects column is empty — <code>projects</code> field not returned by the stats pipeline.
            This is the real prod data shape from <code>stats.json</code>.
          </p>
          <RoadmapTable lane={{ label: 'In progress' }} rows={IN_PROGRESS} />
        </Section>

        <Section id="roadmap-backlog" label="RoadmapTable — Backlog (prod data, 14 epics)">
          <RoadmapTable lane={{ label: 'Backlog' }} rows={BACKLOG} />
        </Section>

        <Section id="releases" label="DataTable (deprecated shim) — trust/subdued variant">
          <DataTable
            variant="trust"
            caption="Recent releases"
            columns={RELEASE_COLUMNS}
            rows={RELEASE_ROWS}
          />
        </Section>

        <Section id="registry" label="Table — accent, many columns, layout=fixed">
          <TableWrap caption="Full DS registry" captionMeta={`${REGISTRY_ROWS.length} components`}>
            <Table
              tone="accent"
              layout="fixed"
              columns={REGISTRY_COLUMNS}
              rows={REGISTRY_ROWS}
            />
          </TableWrap>
        </Section>

      </main>
    </div>
  )
}
