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
      { label: 'Release process', to: `${PLATFORM_ROUTES.governance}#release-process` },
      { label: 'Recent releases', to: `${PLATFORM_ROUTES.governance}#recent-releases` },
      { label: 'Artifacts', to: `${PLATFORM_ROUTES.governance}#artifacts` },
    ],
  },
  {
    label: 'Monorepo',
    to: PLATFORM_ROUTES.monorepo,
    items: [
      { label: 'Architecture', to: `${PLATFORM_ROUTES.monorepo}#workspace-topology` },
      { label: 'Build pipeline', to: `${PLATFORM_ROUTES.monorepo}#build-pipeline` },
      { label: 'Artifacts', to: `${PLATFORM_ROUTES.monorepo}#artifacts` },
    ],
  },
  {
    label: 'CMS',
    to: PLATFORM_ROUTES.cms,
    items: [
      { label: 'Schema ERD', to: `${PLATFORM_ROUTES.cms}#schema-erd` },
      { label: 'Content model', to: `${PLATFORM_ROUTES.cms}#content-model` },
      { label: 'Relationships', to: `${PLATFORM_ROUTES.cms}#relationships` },
      { label: 'Artifacts', to: `${PLATFORM_ROUTES.cms}#artifacts` },
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
      { label: 'Artifacts', to: `${PLATFORM_ROUTES.designSystem}#artifacts` },
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
