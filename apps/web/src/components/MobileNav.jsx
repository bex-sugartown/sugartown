import { useState, useEffect, useRef, useCallback } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { resolveNavLink } from '../lib/resolveNavUrl'
import { isExternalUrl } from '../lib/linkUtils'
import styles from './MobileNav.module.css'

/**
 * MobileNav — slide-out drawer with accordion submenus (SUG-37)
 *
 * Rendered by Header.jsx below the mobile breakpoint.
 * Accepts the same nav items array as the desktop NavigationItem list.
 */
export default function MobileNav({ items, cta, themeToggle, open, onClose }) {
  const drawerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  // Track which top-level accordion is expanded (by index), -1 = none
  const [expandedIndex, setExpandedIndex] = useState(-1)

  // ── Focus trap + body scroll lock ──
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement
      document.body.style.overflow = 'hidden'
      // Small delay so the drawer is visible before focusing
      requestAnimationFrame(() => closeButtonRef.current?.focus())
    } else {
      document.body.style.overflow = ''
      setExpandedIndex(-1)
      previousFocusRef.current?.focus()
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Focus trap — tab cycles within drawer
  const handleTabTrap = useCallback((e) => {
    if (e.key !== 'Tab' || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  const toggleAccordion = (index) => {
    setExpandedIndex(prev => prev === index ? -1 : index)
  }

  // Close drawer on nav link click
  const handleLinkClick = () => onClose()

  function renderLink(url, label, openInNewTab, className) {
    if (!url) return <span className={className}>{label}</span>
    if (isExternalUrl(url) || openInNewTab) {
      return (
        <a href={url} className={className} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
          {label}
        </a>
      )
    }
    return (
      <NavLink
        to={url}
        className={({ isActive }) => `${className} ${isActive ? styles.active : ''}`}
        end={url === '/'}
        onClick={handleLinkClick}
      >
        {label}
      </NavLink>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        onKeyDown={handleTabTrap}
      >
        {/* Close button */}
        <div className={styles.drawerHeader}>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className={styles.navList}>
          {items?.map((item, index) => {
            const { url, openInNewTab } = resolveNavLink(item)
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedIndex === index

            if (!hasChildren) {
              return (
                <div key={index} className={styles.navItemRow}>
                  {renderLink(url, item.label, openInNewTab, styles.navItem)}
                </div>
              )
            }

            return (
              <div key={index} className={styles.navItemRow}>
                {/* Accordion trigger — if item has a URL, render both a link and a toggle */}
                <div className={styles.accordionHeader}>
                  {url ? (
                    renderLink(url, item.label, openInNewTab, styles.navItem)
                  ) : (
                    <span className={styles.navItem}>{item.label}</span>
                  )}
                  <button
                    className={`${styles.accordionToggle} ${isExpanded ? styles.accordionToggleOpen : ''}`}
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.label} submenu`}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="6 8 10 12 14 8" />
                    </svg>
                  </button>
                </div>

                {/* Accordion children — single inner wrapper for grid-row animation */}
                <div className={`${styles.accordionPanel} ${isExpanded ? styles.accordionPanelOpen : ''}`}>
                  <div className={styles.accordionInner}>
                    {item.children.map((child, childIndex) => {
                      const { url: childUrl, openInNewTab: childNewTab } = resolveNavLink(child)
                      return (
                        <div key={childIndex}>
                          {renderLink(childUrl, child.label, childNewTab, styles.childItem)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* Footer — CTA + theme toggle */}
        <div className={styles.drawerFooter}>
          {themeToggle}
          {cta}
        </div>
      </div>
    </>
  )
}
