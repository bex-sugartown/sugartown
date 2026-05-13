import { useState, useEffect } from 'react'
import { NavLink, useMatch, useLocation } from 'react-router-dom'
import { PLATFORM_ROUTES, TRUST_LINKS } from '../../lib/routes'
import useScrollspy from '../../lib/useScrollspy'
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
      { label: 'Roadmap', to: `${PLATFORM_ROUTES.governance}#roadmap` },
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
      { label: 'Storybook', href: TRUST_LINKS.storybook },
      { label: 'Artifacts', to: `${PLATFORM_ROUTES.designSystem}#ds-artifacts` },
    ],
  },
]

// All hash segment IDs across all sections — watched by scroll observer
const ALL_HASH_IDS = NAV_SECTIONS
  .flatMap((s) => s.items ?? [])
  .filter((item) => item.to)
  .map((item) => item.to.split('#')[1])
  .filter(Boolean)

// ── Scroll-aware active section hook ────────────────────────────────────────
// Delegates IO-based scrollspy to useScrollspy; handles hash-seeded initial
// state so the correct link is highlighted immediately on load/navigation.
function useActiveSection() {
  const { pathname, hash } = useLocation()
  // Seed from URL hash so the correct item is active immediately on load/navigation
  const [hashId, setHashId] = useState(() => (hash ? hash.slice(1) : null))

  useEffect(() => {
    setHashId(hash ? hash.slice(1) : null)
  }, [hash])

  // resetKey=pathname so the observer re-attaches when navigating between
  // platform pages (same IDs, different DOM elements after route change).
  const scrollActiveId = useScrollspy(ALL_HASH_IDS, {
    rootMargin: '0px 0px -85% 0px',
    resetKey: pathname,
  })

  // scrollActiveId wins once the observer fires; fall back to hash seed until then
  return scrollActiveId ?? hashId
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
        onClick={() => window.scrollTo(0, 0)}
        className={({ isActive }) =>
          `${styles.sectionLabel} ${isActive ? styles.sectionLabelActive : ''}`
        }
      >
        {section.label}
      </NavLink>
      <ul className={styles.navList}>
        {section.items.map((item) => {
          // External link — render plain <a>, no active state
          if (item.href) {
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.navLink}
                >
                  {item.label} ↗
                </a>
              </li>
            )
          }
          const hash = item.to.split('#')[1]
          const isScrollActive = hash ? activeId === hash : false
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={hash
                  // Hash links: NavLink.isActive fires on pathname alone — ignore it,
                  // use scroll-observer state only.
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
