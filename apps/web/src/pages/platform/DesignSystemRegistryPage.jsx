import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Callout from '../../design-system/components/callout/Callout'
import { PLATFORM_ROUTES } from '../../lib/routes'
import styles from './PlatformHubPage.module.css'

export default function DesignSystemRegistryPage() {
  usePlatformHero({
    title: 'Component Registry',
    subtitle: 'Live inventory of all DS primitives and web adapters. Stories, props, and usage examples for every component in the system.',
  })
  return (
    <>
      <SeoHead
        title="Component Registry — Design System"
        description="Sugartown design system component registry — live inventory of all DS primitives and web adapters."
      />
      <div className={styles.hub}>

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
