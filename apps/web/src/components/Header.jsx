import { useState, useEffect, useRef } from 'react'
import { resolveNavLink } from '../lib/resolveNavUrl'
import { Link as RouterLink } from 'react-router-dom'
import { urlFor } from '../lib/sanity'
import { Button, Container } from '../design-system'
import { Menu } from 'lucide-react'
import NavigationItem from './atoms/NavigationItem'
import Drawer from './Drawer'
import DrawerNav from './DrawerNav'
import Preheader from './Preheader'
import ThemeToggle from './ThemeToggle'
import styles from './Header.module.css'

// Map Sanity CTA style values to DS Button variant props
// 'ghost' kept for backward compat with existing Sanity docs not yet re-saved
const CTA_STYLE_TO_VARIANT = { primary: 'primary', secondary: 'secondary', tertiary: 'tertiary', ghost: 'tertiary' }

export default function Header({ siteSettings }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () => {
      document.documentElement.style.setProperty('--st-header-height', `${el.offsetHeight}px`)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [siteSettings])

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

      <header ref={headerRef} className={`${styles.header}${scrolled ? ` ${styles.scrolled}` : ''}`}>
        <Container size="site" className={styles.inner}>
          {siteLogo?.asset && (
            <RouterLink to="/" className={styles.logoLink}>
              <img
                src={urlFor(siteLogo.asset).width(360).url()}
                alt={siteLogo.alt || `Logo: ${siteTitle || 'Home'}`}
                width={180}
                height={73}
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
              type="button"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile drawer */}
      <Drawer label="Navigation menu" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <DrawerNav
          items={primaryNav?.items}
          cta={ctaElement}
          themeToggle={<ThemeToggle />}
          footerColumns={footerColumns}
          socialLinks={socialLinks}
          copyrightText={copyrightText}
          siteTitle={siteTitle}
          onClose={() => setMobileOpen(false)}
        />
      </Drawer>
    </>
  )
}
