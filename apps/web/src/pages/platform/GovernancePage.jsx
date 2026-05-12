import { Link } from 'react-router-dom'
import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import Tile from '../../design-system/components/tile/Tile'
import SectionContainer from '../../design-system/components/section-container/SectionContainer'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Card from '../../design-system/components/card/Card'
import DataTable, { KindBadge } from '../../design-system/components/data-table/DataTable'
import { MermaidDiagram } from '../../components/PageSections'
import { PLATFORM_ROUTES, TRUST_LINKS } from '../../lib/routes'
import stats from '../../generated/stats.json'
import styles from './PlatformHubPage.module.css'

const RELEASE_COLUMNS = [
  {
    key:   'version',
    label: 'Version',
    width: '110px',
    render: (val) => (
      <a
        href={TRUST_LINKS.changelog}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--st-color-brand-primary)', fontFamily: 'var(--st-font-family-mono)', fontSize: '0.875rem' }}
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

const RECENT_RELEASES = (stats.release?.latestN ?? []).slice(0, 5)

const ARTIFACTS = [
  {
    eyebrow: 'Brief',
    title: 'IA Brief',
    body: 'Locked route namespace, nav structure, and content creation rules for sugartown.io.',
    href: PLATFORM_ROUTES.root,
  },
  {
    eyebrow: 'Backlog',
    title: 'Backlog Priorities',
    body: 'Linear backlog — sequenced epic queue with dependency ordering.',
    href: 'https://linear.app/sugartown',
  },
  {
    eyebrow: 'Roadmap',
    title: 'Roadmap',
    body: 'Dynamically generated from Linear backlog. In-flight and upcoming epics.',
    href: PLATFORM_ROUTES.roadmap,
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
          <Tile label="In flight" value="3" href="https://linear.app/sugartown" />
          <Tile label="Current release" value="v0.23.19" href={TRUST_LINKS.changelog} />
          <Tile label="Epics shipped" value="95" href={TRUST_LINKS.commits} />
          <Tile label="Vulnerabilities" value="0" labelColor="brand" href={TRUST_LINKS.security} />
        </SectionContainer>

        <section id="roadmap" className={styles.section}>
          <SectionLabel name="Roadmap" kicker="In progress + upcoming" />
          <p style={{ fontSize: '0.875rem', color: 'var(--st-color-text-muted)', margin: '0.75rem 0 0.5rem' }}>
            Roadmap is generated from the Linear backlog.{' '}
            <Link to={PLATFORM_ROUTES.roadmap} style={{ color: 'var(--st-color-text-default)' }}>
              Full roadmap →
            </Link>
          </p>
        </section>

        <section id="release-process" className={styles.section}>
          <SectionLabel name="Release process" kicker="Gate model" />
          <MermaidDiagram section={RELEASE_DIAGRAM} />
        </section>

        <section id="recent-releases" className={styles.section}>
          <SectionLabel name="Recent releases" kicker="Last 5" />
          <DataTable columns={RELEASE_COLUMNS} rows={RECENT_RELEASES} variant="trust" />
          <div className={styles.trustLinks}>
            <a href={TRUST_LINKS.changelog} className={styles.trustLink} target="_blank" rel="noreferrer">
              Full changelog
            </a>
            <a href={TRUST_LINKS.commits} className={styles.trustLink} target="_blank" rel="noreferrer">
              Commit log
            </a>
          </div>
        </section>

        <section id="governance-artifacts" className={styles.section}>
          <SectionLabel name="Artifacts" className={styles.labelFlush} />
          <SectionContainer columns={3}>
            {ARTIFACTS.map((a) => (
              <Card
                key={a.title}
                eyebrow={a.eyebrow}
                title={a.title}
                excerpt={a.body}
                href={a.href}
              />
            ))}
          </SectionContainer>
        </section>
      </div>
    </>
  )
}
