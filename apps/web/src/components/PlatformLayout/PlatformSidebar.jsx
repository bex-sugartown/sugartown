import { NavLink, useMatch } from 'react-router-dom'
import { PLATFORM_ROUTES } from '../../lib/routes'
import styles from './PlatformSidebar.module.css'

const NAV_SECTIONS = [
  {
    label: 'Platform',
    items: [{ label: 'Overview', to: PLATFORM_ROUTES.root, end: true }],
  },
  {
    label: 'Governance',
    root: PLATFORM_ROUTES.governance,
    items: [
      { label: 'Governance', to: PLATFORM_ROUTES.governance },
      { label: 'Roadmap', to: PLATFORM_ROUTES.roadmap },
    ],
  },
  {
    label: 'Monorepo',
    root: PLATFORM_ROUTES.monorepo,
    items: [
      { label: 'Monorepo', to: PLATFORM_ROUTES.monorepo },
    ],
  },
  {
    label: 'CMS',
    root: PLATFORM_ROUTES.cms,
    items: [
      { label: 'CMS', to: PLATFORM_ROUTES.cms },
    ],
  },
  {
    label: 'Design System',
    root: PLATFORM_ROUTES.designSystem,
    items: [
      { label: 'Design System', to: PLATFORM_ROUTES.designSystem },
      { label: 'Component Registry', to: PLATFORM_ROUTES.dsRegistry },
    ],
  },
]

function SidebarSection({ section }) {
  const sectionActive = useMatch({ path: section.root ?? '', end: false })

  return (
    <div className={`${styles.section} ${sectionActive ? styles.sectionActive : ''}`}>
      {section.root && (
        <span className={styles.sectionLabel}>{section.label}</span>
      )}
      <ul className={styles.navList}>
        {section.items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end ?? false}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function PlatformSidebar() {
  return (
    <nav className={styles.platformSidebar} aria-label="Platform navigation">
      {/* Mobile: collapsible disclosure */}
      <details className={styles.disclosure}>
        <summary className={styles.summary}>Platform</summary>
        <div className={styles.inner}>
          {NAV_SECTIONS.map((s) => (
            <SidebarSection key={s.label} section={s} />
          ))}
        </div>
      </details>

      {/* Desktop: always-visible rail */}
      <div className={styles.rail}>
        {NAV_SECTIONS.map((s) => (
          <SidebarSection key={s.label} section={s} />
        ))}
      </div>
    </nav>
  )
}
