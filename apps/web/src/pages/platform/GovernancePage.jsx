import { Link } from 'react-router-dom'
import SeoHead from '../../components/SeoHead'
import Tile from '../../design-system/components/tile/Tile'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Card from '../../design-system/components/card/Card'
import { PLATFORM_ROUTES, TRUST_LINKS } from '../../lib/routes'
import styles from './PlatformHubPage.module.css'

const RECENT_RELEASES = [
  { version: 'v0.23.19', date: '2026-05-10', summary: 'CI: fixed LHCI autorun failure', epic: 'SUG-106' },
  { version: 'v0.23.18', date: '2026-05-09', summary: 'DS alignment — SchemaERD mock complete', epic: 'SUG-20' },
  { version: 'v0.23.17', date: '2026-05-02', summary: 'Person profile page + folio component', epic: 'SUG-98' },
  { version: 'v0.23.16', date: '2026-04-28', summary: 'CWV snapshot block + Lighthouse CI', epic: 'SUG-100' },
  { version: 'v0.23.15', date: '2026-04-20', summary: 'Ledger Tradition font stack (Cormorant + DM Sans)', epic: 'SUG-63' },
]

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

export default function GovernancePage() {
  return (
    <>
      <SeoHead
        title="Governance — Platform"
        description="Release cadence, roadmap, and process conventions for sugartown.io."
      />
      <div className={styles.hub}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Platform · Governance</p>
          <h1 className={styles.heading}>Governance</h1>
          <p className={styles.intro}>
            Release cadence, roadmap, and process conventions. Every epic is tracked in Linear,
            every release is versioned, every process decision is documented.
          </p>
        </header>

        <div className={styles.statsStrip}>
          <Tile label="In flight" value="3" />
          <Tile label="Current release" value="v0.23.19" />
          <Tile label="Epics shipped" value="95" />
          <Tile label="Vulnerabilities" value="0" labelColor="brand" />
        </div>

        <section className={styles.section}>
          <SectionLabel name="Roadmap" kicker="In progress + upcoming" />
          <p style={{ fontSize: '0.875rem', color: 'var(--st-color-text-muted)', margin: '0.75rem 0 0.5rem' }}>
            Roadmap is generated from the Linear backlog.{' '}
            <Link to={PLATFORM_ROUTES.roadmap} style={{ color: 'var(--st-color-text-default)' }}>
              Full roadmap →
            </Link>
          </p>
        </section>

        <section className={styles.section}>
          <SectionLabel name="Recent releases" kicker="Last 5" />
          <div className={styles.releaseStrip}>
            {RECENT_RELEASES.map((r) => (
              <div key={r.version} className={styles.releaseRow}>
                <span className={styles.releaseVersion}>{r.version}</span>
                <span className={styles.releaseSummary}>{r.summary} · {r.epic}</span>
                <span className={styles.releaseDate}>{r.date}</span>
              </div>
            ))}
          </div>
          <div className={styles.trustLinks}>
            <a href={TRUST_LINKS.changelog} className={styles.trustLink} target="_blank" rel="noreferrer">
              Full changelog ↗
            </a>
            <a href={TRUST_LINKS.commits} className={styles.trustLink} target="_blank" rel="noreferrer">
              Commit log ↗
            </a>
          </div>
        </section>

        <section className={styles.section}>
          <SectionLabel name="Artifacts" />
          <div className={styles.artifactGrid}>
            {ARTIFACTS.map((a) => (
              <Card
                key={a.title}
                eyebrow={a.eyebrow}
                title={a.title}
                body={a.body}
                titleLink={a.href}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
