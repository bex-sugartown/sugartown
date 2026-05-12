import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import PlatformSidebar from './PlatformSidebar'
import styles from './PlatformLayout.module.css'

function useHashScroll() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    // Small delay lets the page paint before scrolling
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    return () => clearTimeout(t)
  }, [hash, pathname])
}

export default function PlatformLayout() {
  useHashScroll()
  return (
    <div className={styles.platformLayout}>
      <PlatformSidebar />
      <main className={styles.platformMain}>
        <Outlet />
      </main>
    </div>
  )
}
