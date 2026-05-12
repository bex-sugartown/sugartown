import { useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import { PLATFORM_ROUTES } from '../../lib/routes'
import styles from './PlatformHero.module.css'

function HeroBand({ title, subtitle }) {
  return (
    <div className={styles.hero}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <Link to={PLATFORM_ROUTES.root} className={styles.eyebrowLink}>Platform</Link>
        </p>
        <h1 className={styles.heading}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  )
}

export default function usePlatformHero({ title, subtitle }) {
  const setHeroSlot = useOutletContext()
  useLayoutEffect(() => {
    if (!setHeroSlot) return
    setHeroSlot(<HeroBand title={title} subtitle={subtitle} />)
    return () => setHeroSlot(null)
  }, [setHeroSlot, title, subtitle])
}
