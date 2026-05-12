import { Outlet } from 'react-router-dom'
import PlatformSidebar from './PlatformSidebar'
import styles from './PlatformLayout.module.css'

export default function PlatformLayout() {
  return (
    <div className={styles.platformLayout}>
      <PlatformSidebar />
      <main className={styles.platformMain}>
        <Outlet />
      </main>
    </div>
  )
}
