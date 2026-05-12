import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
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

// Child routes can hoist full-bleed content (e.g. a hero) above the two-column
// layout by calling setHeroSlot via useOutletContext().
export default function PlatformLayout() {
  useHashScroll()
  const [heroSlot, setHeroSlot] = useState(null)

  return (
    <>
      {heroSlot}
      <div className={styles.platformLayout}>
        <PlatformSidebar />
        <main className={styles.platformMain}>
          <Outlet context={setHeroSlot} />
        </main>
      </div>
    </>
  )
}
