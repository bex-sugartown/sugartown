import { useState, useEffect } from 'react'
import { NavLink, useMatch, useLocation } from 'react-router-dom'
import { PLATFORM_ROUTES, TRUST_LINKS } from '../../lib/routes'
import useScrollspy from '../../lib/useScrollspy'
import Sidebar from '../../design-system/components/sidebar/Sidebar'
import SidebarNav from '../../design-system/components/sidebar-nav/SidebarNav'
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
      { label: 'Recent releases', to: `${PLATFORM_ROUTES.governance}#recent-releases` },
      { label: 'Roadmap', to: `${PLATFORM_ROUTES.governance}#roadmap` },
      { label: 'Release process', to: `${PLATFORM_ROUTES.governance}#release-process` },
      { label: 'Site performance', to: `${PLATFORM_ROUTES.governance}#site-performance` },
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
      { label: 'Schema Architecture', to: `${PLATFORM_ROUTES.cms}#schema-architecture` },
      { label: 'Relationships', to: `${PLATFORM_ROUTES.cms}#relationships` },
      { label: 'Content models', to: PLATFORM_ROUTES.cmsContentModels },
      { label: 'Artifacts', to: `${PLATFORM_ROUTES.cms}#cms-artifacts` },
    ],
  },
  {
    label: 'Design System',
    to: PLATFORM_ROUTES.designSystem,
    items: [
      { label: 'Token architecture', to: `${PLATFORM_ROUTES.designSystem}#token-architecture` },
      { label: 'Component registry', to: PLATFORM_ROUTES.dsRegistry },
      { label: 'Section modules', to: PLATFORM_ROUTES.dsSections },
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
  const { pathname } = useLocation()
  const sectionMatch = useMatch({ path: section.to ?? '', end: false })
  const sectionActive = section.items?.length && !!sectionMatch

  // For sub-items that are full routes (no hash), scrollspy never fires — derive
  // active state from the current pathname instead.
  const resolvedActiveId = activeId ?? (
    section.items?.find((item) => item.to && !item.to.includes('#') && pathname === item.to)?.to ?? null
  )

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
      <SidebarNav
        items={section.items.map((item) => ({
          id: item.to ? item.to.split('#')[1] ?? item.to : item.href,
          label: item.label,
          href: item.href ?? item.to,
          external: !!item.href,
        }))}
        activeId={resolvedActiveId}
      />
    </div>
  )
}

export default function PlatformSidebar() {
  const activeId = useActiveSection()

  return (
    <Sidebar
      label="Platform"
      side="left"
      breakpoint="md"
      mobileStyle="strip"
      aria-label="Platform navigation"
    >
      <nav>
        {NAV_SECTIONS.map((s) => (
          <SidebarSection key={s.label} section={s} activeId={activeId} />
        ))}
      </nav>
    </Sidebar>
  )
}
