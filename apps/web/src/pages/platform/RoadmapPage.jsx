import SeoHead from '../../components/SeoHead'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Callout from '../../design-system/components/callout/Callout'
import { TRUST_LINKS } from '../../lib/routes'
import styles from './PlatformHubPage.module.css'

/**
 * RoadmapPage — /platform/roadmap
 *
 * Stub page. Will be wired to SUG-110 linearRoadmap data once SUG-110 Phase 2 ships.
 * The full roadmap is an unbounded list generated from the Linear backlog.
 */
export default function RoadmapPage() {
  return (
    <>
      <SeoHead
        title="Roadmap — Platform"
        description="Platform roadmap — epics in flight and upcoming, generated from the Linear backlog."
      />
      <div className={styles.hub}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Platform · Governance · Roadmap</p>
          <h1 className={styles.heading}>Roadmap</h1>
          <p className={styles.intro}>
            Epics in flight and upcoming, generated from the Linear backlog.
            Priority order reflects the sequenced dependency graph — not arbitrary ranking.
          </p>
        </header>

        <section className={styles.section}>
          <SectionLabel name="Linear backlog" kicker="Source of truth" />
          <Callout>
            Roadmap data wiring is pending SUG-110 Phase 2 (Linear backlog integration).
            In the meantime, the full backlog is visible on{' '}
            <a href="https://linear.app/sugartown" target="_blank" rel="noreferrer">Linear ↗</a>.
          </Callout>
        </section>

        <section className={styles.section}>
          <SectionLabel name="Changelog" kicker="Recent releases" />
          <div className={styles.trustLinks}>
            <a href={TRUST_LINKS.changelog} className={styles.trustLink} target="_blank" rel="noreferrer">
              CHANGELOG.md ↗
            </a>
            <a href={TRUST_LINKS.commits} className={styles.trustLink} target="_blank" rel="noreferrer">
              Commit log ↗
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
