import styles from './AppShell.module.css'

const SIDEBAR_WIDTH = {
  sm: 'var(--st-space-sidebar)',
  md: '280px',
  lg: '320px',
}

export default function AppShell({ header, sidebar, sidebarWidth = 'sm', main, footer, className }) {
  return (
    <div className={[styles.shell, className].filter(Boolean).join(' ')}>
      {header && <header className={styles.header}>{header}</header>}
      <div
        className={[styles.body, sidebar && styles.hasSidebar].filter(Boolean).join(' ')}
        style={sidebar ? { '--sidebar-width': SIDEBAR_WIDTH[sidebarWidth] } : undefined}
      >
        {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}
        <main className={styles.main}>{main}</main>
      </div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  )
}
