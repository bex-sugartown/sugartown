import { Link } from 'react-router-dom'
import SeoHead from '../../components/SeoHead'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Callout from '../../design-system/components/callout/Callout'
import { PLATFORM_ROUTES } from '../../lib/routes'
import styles from './PlatformHubPage.module.css'

/**
 * DesignSystemRegistryPage — /platform/design-system/registry
 *
 * Stub page. Will be wired to a live component registry once Storybook
 * integration and component metadata pipeline are in place.
 */
export default function DesignSystemRegistryPage() {
  return (
    <>
      <SeoHead
        title="Component Registry — Design System"
        description="Sugartown design system component registry — live inventory of all DS primitives and web adapters."
      />
      <div className={styles.hub}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <Link to={PLATFORM_ROUTES.root} className={styles.eyebrowLink}>Platform</Link>
          </p>
          <h1 className={styles.heading}>Component Registry</h1>
          <p className={styles.intro}>
            Live inventory of all DS primitives and web adapters.
            Stories, props, and usage examples for every component in the system.
          </p>
        </header>

        <section className={styles.section}>
          <SectionLabel name="Registry" kicker="Coming soon" />
          <Callout>
            The component registry will surface live Storybook stories, prop tables,
            and token usage for every DS component. Pending Storybook integration
            pipeline work.
          </Callout>
        </section>

        <section className={styles.section}>
          <SectionLabel name="Design System Hub" kicker="Navigation" />
          <div className={styles.trustLinks}>
            <a href={PLATFORM_ROUTES.designSystem} className={styles.trustLink}>
              ← Back to Design System
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
