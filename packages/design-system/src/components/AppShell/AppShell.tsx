import React from 'react';
import styles from './AppShell.module.css';

export type AppShellSidebarWidth = 'sm' | 'md' | 'lg';

export interface AppShellProps {
  /** Header region — rendered full-width at the top */
  header?: React.ReactNode;
  /** Sidebar region — rendered left of main when present */
  sidebar?: React.ReactNode;
  /** Sidebar width token key */
  sidebarWidth?: AppShellSidebarWidth;
  /** Main content region */
  main?: React.ReactNode;
  /** Footer region — rendered full-width at the bottom */
  footer?: React.ReactNode;
  className?: string;
}

const SIDEBAR_WIDTH: Record<AppShellSidebarWidth, string> = {
  sm:  'var(--st-space-sidebar)',
  md:  '280px',
  lg:  '320px',
};

export function AppShell({ header, sidebar, sidebarWidth = 'sm', main, footer, className }: AppShellProps) {
  return (
    <div className={[styles.shell, className].filter(Boolean).join(' ')}>
      {header && <header className={styles.header}>{header}</header>}
      <div
        className={[styles.body, sidebar && styles.hasSidebar].filter(Boolean).join(' ')}
        style={sidebar ? { '--sidebar-width': SIDEBAR_WIDTH[sidebarWidth] } as React.CSSProperties : undefined}
      >
        {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}
        <main className={styles.main}>{main}</main>
      </div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  );
}
