import React from 'react';
import styles from './Sidebar.module.css';

export type SidebarSide = 'left' | 'right';
export type SidebarBreakpoint = 'md' | 'lg';
export type SidebarMobileStyle = 'appendix' | 'strip' | 'drawer';

export interface SidebarProps {
  /** Mobile toggle label ("On this page", "Platform", etc.) */
  label?: React.ReactNode;
  /** Which edge gets the border on desktop. Default: 'right'. */
  side?: SidebarSide;
  /** When the rail activates. 'lg' (default, 1024px) | 'md' (768px). */
  breakpoint?: SidebarBreakpoint;
  /**
   * appendix: flows below content with border-top (article/node sidebars, default)
   * strip:    full-width disclosure above content with border-bottom (nav rails)
   * drawer:   hidden on mobile; caller renders ContentsStrip + Drawer instead
   */
  mobileStyle?: SidebarMobileStyle;
  'aria-label'?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Sidebar — layout primitive.
 *
 * Provides: sticky inner panel, mobile <details> disclosure toggle,
 * responsive breakpoint, and border placement. Content is the caller's concern.
 */
export function Sidebar({
  label,
  side = 'right',
  breakpoint = 'lg',
  mobileStyle = 'appendix',
  'aria-label': ariaLabel,
  className,
  children,
}: SidebarProps) {
  const cls = [
    styles.sidebar,
    side === 'left' ? styles.sideLeft : styles.sideRight,
    breakpoint === 'md' ? styles.bpMd : styles.bpLg,
    mobileStyle === 'drawer' ? styles.mobileDrawer : mobileStyle === 'strip' ? styles.mobileStrip : styles.mobileAppendix,
    className,
  ].filter(Boolean).join(' ');

  return (
    <aside className={cls} aria-label={ariaLabel}>
      <details className={styles.panel} open>
        <summary className={styles.toggle}>{label}</summary>
        <div className={styles.content}>
          {children}
        </div>
      </details>
    </aside>
  );
}
