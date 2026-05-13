/**
 * TwoColumnLayout — flex shell for left- or right-sidebar page layouts.
 *
 * Handles: responsive stacking (column → row), centering, page gutter.
 * Does NOT render <main> — caller is responsible for semantic elements.
 *
 * For detail pages with full-span choreography (MetadataCard, challenge callout,
 * sidebar row pinning) use the CSS grid approach in pages.module.css instead.
 *
 * Props:
 *   placement  — "left" (default) | "right" — which side the sidebar appears
 *   sidebar    — ReactNode rendered in the sidebar slot
 *   breakpoint — "md" (default, 768px) | "lg" (1024px)
 *   children   — main content
 */
import styles from './TwoColumnLayout.module.css'

export default function TwoColumnLayout({
  sidebar,
  placement = 'left',
  breakpoint = 'md',
  className,
  children,
}) {
  const cls = [
    styles.layout,
    placement === 'right' ? styles.sidebarRight : styles.sidebarLeft,
    breakpoint === 'lg' ? styles.bpLg : styles.bpMd,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      {placement === 'left' ? (
        <>
          <div className={styles.sidebarSlot}>{sidebar}</div>
          <div className={styles.main}>{children}</div>
        </>
      ) : (
        <>
          <div className={styles.main}>{children}</div>
          <div className={styles.sidebarSlot}>{sidebar}</div>
        </>
      )}
    </div>
  )
}
