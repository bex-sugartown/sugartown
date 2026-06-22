/**
 * SidebarNav — shared anchor-link list for sidebar nav surfaces.
 *
 * Encapsulates: link rendering with active-state styling, useScrollspy
 * integration, optional collapsible wrapper, external-link treatment.
 *
 * Each sidebar shell (PageSidebar, PlatformSidebar, etc.) keeps its own
 * layout wrapper (sticky, gutter, breakpoint behaviour) but delegates
 * link list rendering to this component.
 *
 * Props:
 *   items       – { id, label, href, external?, level? }[]
 *                 id    = DOM element ID to observe for scrollspy
 *                 href  = link target (usually `#id` or full path with hash)
 *                 level = indent depth, 2 (default) or 3 (sub-item)
 *   label       – section heading rendered above the list
 *   activeId    – externally controlled active ID; if provided, skips internal scrollspy
 *   scrollspyOptions – { rootMargin, resetKey } forwarded to useScrollspy
 *   collapsible – wrap the list in a <details> element (default false)
 *   defaultOpen – initial open state when collapsible=true (default true)
 *   ariaLabel   – <nav> aria-label (default: value of label prop)
 */
import { useState, useEffect } from 'react'
import useScrollspy from '../../../lib/useScrollspy'
import styles from './SidebarNav.module.css'

export default function SidebarNav({
  items = [],
  label,
  activeId: externalActiveId,
  scrollspyOptions,
  collapsible = false,
  defaultOpen = true,
  ariaLabel,
}) {
  const [open, setOpen] = useState(defaultOpen)
  useEffect(() => { setOpen(defaultOpen) }, [defaultOpen])

  const ids = items.map((item) => item.id)
  // Always call useScrollspy (rules of hooks); ignore result when activeId is controlled externally
  const scrollActiveId = useScrollspy(ids, scrollspyOptions)
  const activeId = externalActiveId !== undefined ? externalActiveId : scrollActiveId

  const list = (
    <ul className={styles.navList}>
      {items.map((item) => {
        const isActive = activeId === item.id
        const isExternal = !!item.external
        const isSubItem = item.level === 3

        if (isExternal) {
          return (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.navLink} ${isSubItem ? styles.navLinkSub : ''}`}
              >
                {item.label} ↗
              </a>
            </li>
          )
        }

        return (
          <li key={item.id}>
            <a
              href={item.href}
              className={`${styles.navLink} ${isSubItem ? styles.navLinkSub : ''} ${isActive ? styles.navLinkActive : ''}`}
              aria-current={isActive ? 'location' : undefined}
            >
              {item.label}
            </a>
          </li>
        )
      })}
    </ul>
  )

  const nav = (
    <nav className={styles.sidebarNav} aria-label={ariaLabel ?? label}>
      {label && <p className={styles.label}>{label}</p>}
      {list}
    </nav>
  )

  if (!collapsible) return nav

  return (
    <details
      className={styles.collapsible}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className={styles.summary}>{label}</summary>
      <div className={styles.collapsibleInner}>{list}</div>
    </details>
  )
}
