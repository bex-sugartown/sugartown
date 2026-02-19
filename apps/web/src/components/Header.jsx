import { Link as RouterLink } from 'react-router-dom'
import { urlFor } from '../lib/sanity'
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

export default function Header({ siteSettings }) {
  if (!siteSettings) return null

  const { siteLogo, siteTitle, primaryNav, headerCta, preheader } = siteSettings

  return (
    <>
      {preheader && <Preheader preheader={preheader} />}

      <header className={styles.header}>
        <div className={styles.container}>
          {siteLogo?.asset && (
            <RouterLink to="/" className={styles.logoLink}>
              <img
                src={urlFor(siteLogo.asset).width(240).url()}
                alt={siteLogo.alt || `Logo: ${siteTitle || 'Home'}`}
                width={120}
                className={styles.logoImage}
              />
            </RouterLink>
          )}

          {primaryNav?.items && primaryNav.items.length > 0 && (
            <nav className={styles.nav}>
              {primaryNav.items.map((item, index) => (
                <NavigationItem
                  key={index}
                  label={item.label}
                  url={item.link?.url}
                  openInNewTab={item.link?.openInNewTab}
                />
              ))}
            </nav>
          )}

          {headerCta?.link && (
            <div className={styles.cta}>
              <Link
                label={headerCta.link.label || headerCta.internalTitle}
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
