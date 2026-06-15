import styles from './ContentsStrip.module.css'

/**
 * ContentsStrip — sticky trigger chip for the sidebar drawer (SUG-153).
 *
 * Rendered by PageSidebar and PlatformSidebar below their breakpoint.
 * Fixed below the header; hidden above the breakpoint via CSS.
 */
export default function ContentsStrip({ label, open, onOpen, breakpoint = 'lg' }) {
  return (
    <div className={`${styles.strip} ${breakpoint === 'md' ? styles.bpMd : styles.bpLg}`}>
      <button
        className={`${styles.chip} ${open ? styles.active : ''}`}
        onClick={onOpen}
        aria-expanded={open}
        aria-label={`Open ${label}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="15" y2="12" />
          <line x1="3" y1="18" x2="11" y2="18" />
        </svg>
        {label}
      </button>
    </div>
  )
}
