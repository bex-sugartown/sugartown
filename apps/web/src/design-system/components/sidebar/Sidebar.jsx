/**
 * Sidebar — layout primitive.
 *
 * Provides: sticky inner panel, mobile <details> disclosure toggle,
 * responsive breakpoint, and border placement. Content is the caller's concern.
 *
 * Props:
 *   label        — mobile toggle label ("On this page", "Platform", etc.)
 *   side         — "right" (default) | "left" — which edge gets the border on desktop
 *   breakpoint   — "lg" (default, 1024px) | "md" (768px) — when rail activates
 *   mobileStyle  — "appendix" (default) | "strip" | "drawer"
 *                    appendix: flows below content with border-top (article/node sidebars)
 *                    strip:    full-width disclosure above content with border-bottom (nav rails)
 *                    drawer:   hidden on mobile; caller renders ContentsStrip + Drawer instead
 *   aria-label   — passed through to the <aside> element
 */
import styles from './Sidebar.module.css'

export default function Sidebar({
  label,
  side = 'right',
  breakpoint = 'lg',
  mobileStyle = 'appendix',
  'aria-label': ariaLabel,
  className,
  children,
}) {
  const cls = [
    styles.sidebar,
    side === 'left' ? styles.sideLeft : styles.sideRight,
    breakpoint === 'md' ? styles.bpMd : styles.bpLg,
    mobileStyle === 'drawer' ? styles.mobileDrawer : mobileStyle === 'strip' ? styles.mobileStrip : styles.mobileAppendix,
    className,
  ].filter(Boolean).join(' ')

  return (
    <aside className={cls} aria-label={ariaLabel}>
      <details className={styles.panel} open>
        <summary className={styles.toggle}>{label}</summary>
        <div className={styles.content}>
          {children}
        </div>
      </details>
    </aside>
  )
}
