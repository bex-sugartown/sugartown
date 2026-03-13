import { useState, useRef, useEffect, useCallback } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { validateNavItem } from '../../lib/routes'
import { isExternalUrl } from '../../lib/linkUtils'
import { resolveNavLink } from '../../lib/resolveNavUrl'
import styles from './NavigationItem.module.css'

/**
 * NavigationItem
 *
 * Renders a nav link using React Router's NavLink for internal paths
 * (automatic active state via `aria-current`) or a plain <a> for
 * external URLs.
 *
 * Dropdown behaviour:
 *   - If `children[]` exist AND the parent has a URL → hover opens dropdown.
 *     Parent label is a clickable link (L1). Child items are L2.
 *   - If `children[]` exist AND the parent has NO URL → click toggles dropdown.
 *     Parent label acts as a trigger only.
 *
 * External detection delegated to shared linkUtils.isExternalUrl().
 * Dev-only: warns via console if `url` is not a canonical path.
 */
export default function NavigationItem({ label, url, openInNewTab, children }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const hoverTimeoutRef = useRef(null)

  const hasChildren = children && children.length > 0
  const hasUrl = Boolean(url)

  // Dev-only canonical URL validation
  if (import.meta.env.DEV && url) {
    const { valid, reason } = validateNavItem(url)
    if (!valid) {
      console.warn(
        `[nav] Non-canonical link detected — label="${label}" url="${url}" reason: ${reason}`,
      )
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Clean up hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (!hasChildren || !hasUrl) return
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setOpen(true)
  }, [hasChildren, hasUrl])

  const handleMouseLeave = useCallback(() => {
    if (!hasChildren || !hasUrl) return
    hoverTimeoutRef.current = setTimeout(() => setOpen(false), 150)
  }, [hasChildren, hasUrl])

  const handleTriggerClick = useCallback(() => {
    if (!hasChildren) return
    // Only toggle on click when there's no URL (label-only trigger)
    if (!hasUrl) {
      setOpen(prev => !prev)
    }
  }, [hasChildren, hasUrl])

  const handleKeyDown = useCallback((e) => {
    if (!hasChildren) return
    if (e.key === 'Escape') {
      setOpen(false)
    }
    if (e.key === 'Enter' || e.key === ' ') {
      if (!hasUrl) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
  }, [hasChildren, hasUrl])

  // ── Render the parent label element ──
  function renderLabel() {
    const chevron = hasChildren ? <span className={styles.chevron} aria-hidden="true" /> : null

    if (isExternalUrl(url) || openInNewTab) {
      return (
        <a
          href={url}
          className={`${styles.navItem} ${styles.dropdownTrigger}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
          {chevron}
        </a>
      )
    }

    if (!url) {
      return (
        <span
          className={`${styles.navItem} ${styles.dropdownTrigger}`}
          role="button"
          tabIndex={0}
          aria-expanded={hasChildren ? open : undefined}
          aria-haspopup={hasChildren ? 'true' : undefined}
          onClick={handleTriggerClick}
          onKeyDown={handleKeyDown}
        >
          {label}
          {chevron}
        </span>
      )
    }

    return (
      <NavLink
        to={url}
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''} ${hasChildren ? styles.dropdownTrigger : ''}`
        }
        end={url === '/'}
      >
        {label}
        {chevron}
      </NavLink>
    )
  }

  // ── Render child items in dropdown ──
  function renderChildren() {
    if (!hasChildren) return null

    return (
      <div className={styles.dropdownMenu} role="menu">
        {children.map((child, index) => {
          const { url: childUrl, openInNewTab: childNewTab } = resolveNavLink(child)

          if (!childUrl) {
            return (
              <span key={index} className={styles.childItem} role="menuitem">
                {child.label}
              </span>
            )
          }

          if (isExternalUrl(childUrl) || childNewTab) {
            return (
              <a
                key={index}
                href={childUrl}
                className={styles.childItem}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                {child.label}
              </a>
            )
          }

          return (
            <Link
              key={index}
              to={childUrl}
              className={styles.childItem}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {child.label}
            </Link>
          )
        })}
      </div>
    )
  }

  // ── Simple item (no children) ──
  if (!hasChildren) {
    if (isExternalUrl(url) || openInNewTab) {
      return (
        <a
          href={url}
          className={styles.navItem}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      )
    }

    if (!url) {
      return <span className={styles.navItem}>{label}</span>
    }

    return (
      <NavLink
        to={url}
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.active : ''}`
        }
        end={url === '/'}
      >
        {label}
      </NavLink>
    )
  }

  // ── Dropdown item ──
  return (
    <div
      ref={dropdownRef}
      className={`${styles.dropdown} ${open ? styles.open : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {renderLabel()}
      {renderChildren()}
    </div>
  )
}
