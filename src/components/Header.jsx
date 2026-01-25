import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { siteSettingsQuery } from '../lib/queries'
import Logo from './atoms/Logo'
import NavigationItem from './atoms/NavigationItem'
import Link from './atoms/Link'
import Preheader from './Preheader'
import styles from './Header.module.css'

/**
 * Get button style class based on CTA button style from Sanity
 */
function getButtonStyleClass(style) {
  switch (style) {
    case 'secondary':
      return styles.ctaButtonSecondary
    case 'ghost':
      return styles.ctaButtonGhost
    case 'primary':
    default:
      return styles.ctaButton
  }
}

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

  const { siteLogo, primaryNav, headerCta, preheader } = settings

  return (
    <>
      <Preheader preheader={preheader} />
      <header className={styles.header}>
        <div className={styles.container}>
          {siteLogo && (
            <Logo
              image={siteLogo}
              linkUrl="/"
            />
          )}

          {primaryNav?.items && primaryNav.items.length > 0 && (
            <nav className={styles.nav}>
              {primaryNav.items.map((item, index) => (
                <NavigationItem
                  key={index}
                  label={item.label}
                  url={item.link?.url}
                  openInNewTab={item.link?.openInNewTab}
                  children={item.children}
                />
              ))}
            </nav>
          )}

          {headerCta?.link && (
            <div className={styles.cta}>
              <Link
                label={headerCta.link.label}
                url={headerCta.link.url}
                openInNewTab={headerCta.link.openInNewTab}
                className={getButtonStyleClass(headerCta.style)}
              />
            </div>
          )}
        </div>
      </header>
    </>
  )
}
