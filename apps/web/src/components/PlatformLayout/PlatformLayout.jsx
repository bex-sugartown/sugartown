import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { pageBySlugQuery } from '../../lib/queries'
import { useSanityDoc } from '../../lib/useSanityDoc'
import { extractLeadHero } from '../../lib/heroUtils'
import PlatformSidebar from './PlatformSidebar'
import styles from './PlatformLayout.module.css'

function useHashScroll() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    return () => clearTimeout(t)
  }, [hash, pathname])
}

// Child routes hoist full-bleed content above the two-column layout via
// useOutletContext(). Context shape: { setHeroSlot, platformHeroSection }
// platformHeroSection carries the /platform page's hero bg/overlay/panel
// settings so subpages can inherit the visual treatment.
export default function PlatformLayout() {
  useHashScroll()
  const [heroSlot, setHeroSlot] = useState(null)
  const { data: platformPage } = useSanityDoc(pageBySlugQuery, { slug: 'platform' })
  const { leadHero: platformHeroSection } = extractLeadHero(platformPage?.sections)

  return (
    <>
      {heroSlot}
      <div className={styles.platformLayout}>
        <PlatformSidebar />
        <main className={styles.platformMain}>
          <Outlet context={{ setHeroSlot, platformHeroSection }} />
        </main>
      </div>
    </>
  )
}
