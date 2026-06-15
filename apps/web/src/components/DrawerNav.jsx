import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { resolveNavLink } from '../lib/resolveNavUrl'
import { isExternalUrl } from '../lib/linkUtils'
import SocialLink from './atoms/SocialLink'
import styles from './Drawer.module.css'

/**
 * DrawerNav — nav-specific content for the mobile Drawer.
 *
 * Extracted from Drawer.jsx so the Drawer shell can accept arbitrary children.
 * Rendered by Header.jsx inside <Drawer>.
 */
export default function DrawerNav({
  items, cta, themeToggle, footerColumns, socialLinks, copyrightText, siteTitle,
  onClose,
}) {
  const [expandedIndex, setExpandedIndex] = useState(-1)

  const toggleAccordion = (index) => {
    setExpandedIndex(prev => prev === index ? -1 : index)
  }

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
      <nav className={styles.navList}>
        {items?.map((item, index) => {
          const { url, openInNewTab } = resolveNavLink(item)
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedIndex === index
          const isLast = index === (items?.length ?? 0) - 1

          if (!hasChildren) {
            return (
              <div key={index}>
                <div className={styles.navItemRow}>
                  {renderLink(url, item.label, openInNewTab, styles.navItem)}
                </div>
                {!isLast && <hr className={styles.divider} />}
              </div>
            )
          }

          return (
            <div key={index}>
              <div className={styles.navItemRow}>
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
              {!isLast && <hr className={styles.divider} />}
            </div>
          )
        })}
      </nav>

      <div className={styles.drawerFooter}>
        {cta && <div className={styles.footerCta}>{cta}</div>}
        <hr className={styles.divider} />
        {footerColumns && footerColumns.length > 0 && (
          <div className={styles.footerLinks}>
            {footerColumns.flatMap((column, colIndex) =>
              (column.items ?? []).map((item, itemIndex) => {
                const { url, openInNewTab } = resolveNavLink(item)
                return (
                  <span key={`${colIndex}-${itemIndex}`}>
                    {renderLink(url, item.label, openInNewTab, styles.footerLink)}
                  </span>
                )
              })
            )}
          </div>
        )}
        {socialLinks && socialLinks.length > 0 && (
          <div className={styles.footerSocial}>
            <span className={styles.footerSocialLabel}>Connect</span>
            <div className={styles.footerSocialIcons}>
              {socialLinks.map((social, index) => (
                <SocialLink key={index} platform={social.icon} url={social.url} label={social.label} />
              ))}
            </div>
          </div>
        )}
        <hr className={styles.divider} />
        <div className={styles.footerBottom}>
          {themeToggle}
          {copyrightText && (
            <span className={styles.footerCopyright}>
              &copy; {new Date().getFullYear()} {siteTitle}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
