import { useEffect, useState } from 'react'
import { client, urlFor } from '../lib/sanity'
import { siteSettingsQuery } from '../lib/queries'
import NavigationItem from './atoms/NavigationItem'
import Link from './atoms/Link'
import styles from './Header.module.css'

export default function Header() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .fetch(siteSettingsQuery)
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching site settings:', error)
        setLoading(false)
      })
  }, [])

  if (loading) return null
  if (!settings) return null

  const navItems = settings.primaryNav?.items || []

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {settings.siteLogo?.asset && (
          <a href="/" className={styles.logoLink}>
            <img
              src={urlFor(settings.siteLogo.asset).width(240).url()}
              alt={settings.siteTitle || 'Logo'}
              width={120}
              className={styles.logoImage}
            />
          </a>
        )}

        {navItems.length > 0 && (
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavigationItem
                key={item._key}
                label={item.label}
                url={item.link?.url}
                openInNewTab={item.link?.openInNewTab}
              />
            ))}
          </nav>
        )}

        {settings.headerCta && (
          <div className={styles.cta}>
            <Link
              label={settings.headerCta.label}
              url={settings.headerCta.url}
              openInNewTab={settings.headerCta.openInNewTab}
              className={styles.ctaButton}
            />
          </div>
        )}
      </div>
    </header>
  )
}
