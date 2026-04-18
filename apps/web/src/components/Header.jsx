import { useState, useEffect } from 'react'
import { resolveNavLink } from '../lib/resolveNavUrl'
import { Link as RouterLink } from 'react-router-dom'
import { urlFor } from '../lib/sanity'
import { Button } from '../design-system'
import NavigationItem from './atoms/NavigationItem'
import MobileNav from './MobileNav'
import Preheader from './Preheader'
import ThemeToggle from './ThemeToggle'
import styles from './Header.module.css'

// Map Sanity CTA style values to DS Button variant props
// 'ghost' kept for backward compat with existing Sanity docs not yet re-saved
const CTA_STYLE_TO_VARIANT = { primary: 'primary', secondary: 'secondary', tertiary: 'tertiary', ghost: 'tertiary' }

export default function Header({ siteSettings }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!siteSettings) return null

  const { siteLogo, siteTitle, primaryNav, headerCta, preheader, footerColumns, socialLinks, copyrightText } = siteSettings

  const ctaElement = headerCta?.url ? (
    <Button
      variant={CTA_STYLE_TO_VARIANT[headerCta.style] || 'primary'}
      href={headerCta.url}
      openInNewTab={headerCta.openInNewTab}
      className={styles.headerCtaButton}
    >
      {headerCta.label || headerCta.internalTitle}
    </Button>
  ) : null

  return (
    <>
      {preheader && <Preheader preheader={preheader} />}

      <header className={`${styles.header}${scrolled ? ` ${styles.scrolled}` : ''}`}>
        <div className={styles.container}>
          {siteLogo?.asset && (
            <RouterLink to="/" className={styles.logoLink}>
              <img
                src={urlFor(siteLogo.asset).width(360).url()}
                alt={siteLogo.alt || `Logo: ${siteTitle || 'Home'}`}
                width={180}
                className={styles.logoImage}
              />
            </RouterLink>
          )}

          {/* Desktop nav */}
          {primaryNav?.items && primaryNav.items.length > 0 && (
            <nav className={styles.nav}>
              {primaryNav.items.map((item, index) => {
                const {url, openInNewTab} = resolveNavLink(item)
                return (
                  <NavigationItem
                    key={index}
                    label={item.label}
                    url={url}
                    openInNewTab={openInNewTab}
                    children={item.children}
                  />
                )
              })}
            </nav>
          )}

          <div className={styles.cta}>
            {ctaElement}
            <ThemeToggle />

            {/* Hamburger — mobile only */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileNav
        items={primaryNav?.items}
        cta={ctaElement}
        themeToggle={<ThemeToggle />}
        footerColumns={footerColumns}
        socialLinks={socialLinks}
        copyrightText={copyrightText}
        siteTitle={siteTitle}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  )
}
