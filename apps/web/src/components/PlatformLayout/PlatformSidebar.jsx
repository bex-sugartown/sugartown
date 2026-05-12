import { NavLink, useMatch } from 'react-router-dom'
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
    ],
  },
  {
    label: 'Monorepo',
    to: PLATFORM_ROUTES.monorepo,
    items: [
      { label: 'Architecture', to: `${PLATFORM_ROUTES.monorepo}#workspace-topology` },
      { label: 'Build pipeline', to: `${PLATFORM_ROUTES.monorepo}#build-pipeline` },
    ],
  },
  {
    label: 'CMS',
    to: PLATFORM_ROUTES.cms,
    items: [
      { label: 'Schema ERD', to: `${PLATFORM_ROUTES.cms}#schema-erd` },
      { label: 'Content model', to: `${PLATFORM_ROUTES.cms}#content-model` },
    ],
  },
  {
    label: 'Design System',
    to: PLATFORM_ROUTES.designSystem,
    items: [
      { label: 'Component registry', to: PLATFORM_ROUTES.dsRegistry },
    ],
  },
]

function SidebarSection({ section }) {
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
        {section.items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
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
