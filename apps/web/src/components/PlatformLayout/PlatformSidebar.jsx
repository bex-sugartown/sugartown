import { useState, useEffect } from 'react'
import { NavLink, useMatch, useLocation } from 'react-router-dom'
import { PLATFORM_ROUTES } from '../../lib/routes'
import styles from './PlatformSidebar.module.css'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    to: PLATFORM_ROUTES.root,
    end: true,
  },
  {
    label: 'Governance',
    to: PLATFORM_ROUTES.governance,
    items: [
      { label: 'Roadmap', to: PLATFORM_ROUTES.roadmap },
      { label: 'Release process', to: `${PLATFORM_ROUTES.governance}#release-process` },
      { label: 'Recent releases', to: `${PLATFORM_ROUTES.governance}#recent-releases` },
      { label: 'Artifacts', to: `${PLATFORM_ROUTES.governance}#governance-artifacts` },
    ],
  },
  {
    label: 'Monorepo',
    to: PLATFORM_ROUTES.monorepo,
    items: [
      { label: 'Architecture', to: `${PLATFORM_ROUTES.monorepo}#workspace-topology` },
      { label: 'Build pipeline', to: `${PLATFORM_ROUTES.monorepo}#build-pipeline` },
      { label: 'Artifacts', to: `${PLATFORM_ROUTES.monorepo}#monorepo-artifacts` },
    ],
  },
  {
    label: 'CMS',
    to: PLATFORM_ROUTES.cms,
    items: [
      { label: 'Schema ERD', to: `${PLATFORM_ROUTES.cms}#schema-erd` },
      { label: 'Content model', to: `${PLATFORM_ROUTES.cms}#content-model` },
      { label: 'Relationships', to: `${PLATFORM_ROUTES.cms}#relationships` },
      { label: 'Artifacts', to: `${PLATFORM_ROUTES.cms}#cms-artifacts` },
    ],
  },
  {
    label: 'Design System',
    to: PLATFORM_ROUTES.designSystem,
    items: [
      { label: 'Token architecture', to: `${PLATFORM_ROUTES.designSystem}#token-architecture` },
      { label: 'Component registry', to: PLATFORM_ROUTES.dsRegistry },
      { label: 'Architecture', to: `${PLATFORM_ROUTES.designSystem}#architecture-figjam` },
      { label: 'Storybook', to: `${PLATFORM_ROUTES.designSystem}#storybook` },
      { label: 'Artifacts', to: `${PLATFORM_ROUTES.designSystem}#ds-artifacts` },
    ],
  },
]

// All hash segment IDs across all sections — observed by IntersectionObserver
const ALL_HASH_IDS = NAV_SECTIONS
  .flatMap((s) => s.items ?? [])
  .map((item) => item.to.split('#')[1])
  .filter(Boolean)

// ── Scroll-aware active section hook ────────────────────────────────────────
// Watches all section IDs via IntersectionObserver; returns the topmost
// visible section ID so the sidebar can highlight the correct anchor.
function useActiveSection() {
  const [activeId, setActiveId] = useState(null)
  const { pathname } = useLocation()

  useEffect(() => {
    setActiveId(null)

    function update() {
      // Use a tight 15% threshold so only sections that have nearly reached
      // the top of the viewport are considered. "Max top that's still ≤ threshold"
      // picks the section most recently crossed — not just the last in DOM order.
      const threshold = window.innerHeight * 0.15
      let active = null
      let maxTop = -Infinity
      for (const id of ALL_HASH_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= threshold && top > maxTop) {
          maxTop = top
          active = id
        }
      }
      // Fallback: if no section has crossed the threshold (user is at the very
      // top of the page), highlight the section whose heading is closest to the
      // viewport top from below (smallest positive top).
      if (!active) {
        let minTop = Infinity
        for (const id of ALL_HASH_IDS) {
          const el = document.getElementById(id)
          if (!el) continue
          const top = el.getBoundingClientRect().top
          if (top >= 0 && top < minTop) { minTop = top; active = id }
        }
      }
      setActiveId(active)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [pathname])

  return activeId
}

function SidebarSection({ section, activeId }) {
  const sectionMatch = useMatch({ path: section.to ?? '', end: false })
  const sectionActive = section.items?.length && !!sectionMatch

  if (!section.items?.length) {
    return (
      <div className={styles.section}>
        <NavLink
          to={section.to}
          end={section.end ?? false}
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
          }
        >
          {section.label}
        </NavLink>
      </div>
    )
  }

  return (
    <div className={`${styles.section} ${sectionActive ? styles.sectionActive : ''}`}>
      <NavLink
        to={section.to}
        end
        className={({ isActive }) =>
          `${styles.sectionLabel} ${isActive ? styles.sectionLabelActive : ''}`
        }
      >
        {section.label}
      </NavLink>
      <ul className={styles.navList}>
        {section.items.map((item) => {
          const hash = item.to.split('#')[1]
          const isScrollActive = hash ? activeId === hash : false
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={hash
                  // Hash links: NavLink.isActive fires on pathname alone — ignore it,
                  // use IntersectionObserver state only.
                  ? () => `${styles.navLink} ${isScrollActive ? styles.navLinkActive : ''}`
                  : ({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function PlatformSidebar() {
  const activeId = useActiveSection()

  return (
    <nav className={styles.platformSidebar} aria-label="Platform navigation">
      {/* Mobile: collapsible disclosure */}
      <details className={styles.disclosure}>
        <summary className={styles.summary}>Platform</summary>
        <div className={styles.inner}>
          {NAV_SECTIONS.map((s) => (
            <SidebarSection key={s.label} section={s} activeId={activeId} />
          ))}
        </div>
      </details>

      {/* Desktop: always-visible rail */}
      <div className={styles.rail}>
        {NAV_SECTIONS.map((s) => (
          <SidebarSection key={s.label} section={s} activeId={activeId} />
        ))}
      </div>
    </nav>
  )
}
