import { useLayoutEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import PageSections from '../PageSections'
import styles from './PlatformHero.module.css'

// Fallback band shown while the platform page hero loads from Sanity
function FallbackHero({ title, subtitle }) {
  return (
    <div className={styles.fallback}>
      <div className={styles.fallbackInner}>
        <p className={styles.eyebrow}>Platform</p>
        <h1 className={styles.heading}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  )
}

// Inherits bg image, overlay, and panel settings from the /platform page hero.
// Substitutes the subpage's own title/subtitle so each section has its identity
// while sharing the platform's visual treatment.
export default function usePlatformHero({ title, subtitle }) {
  const { setHeroSlot, platformHeroSection } = useOutletContext() ?? {}

  useLayoutEffect(() => {
    if (!setHeroSlot) return

    const node = platformHeroSection
      ? <PageSections sections={[{
          ...platformHeroSection,
          heading: title,
          subheading: subtitle ?? null,
          eyebrow: 'Platform',
          showStatRail: false,
          ctas: [],
        }]} />
      : <FallbackHero title={title} subtitle={subtitle} />

    setHeroSlot(node)
    return () => setHeroSlot(null)
  }, [setHeroSlot, platformHeroSection, title, subtitle])
}
