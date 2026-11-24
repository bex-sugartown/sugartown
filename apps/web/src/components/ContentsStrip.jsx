import { useEffect, useRef } from 'react'
import { Chip } from '../design-system'
import styles from './ContentsStrip.module.css'

/**
 * ContentsStrip — sticky trigger chip for the sidebar drawer (SUG-153).
 *
 * Rendered by PageSidebar and PlatformSidebar below their breakpoint.
 * Fixed directly below the header; hidden above the breakpoint via CSS.
 *
 * The header is sticky and sits below the banner and preheader at scroll 0, so its bottom edge is
 * not a constant. The strip follows the header's bottom edge instead of assuming the header is at
 * the top of the viewport (#266).
 */
export default function ContentsStrip({ label, open, onOpen, breakpoint = 'lg' }) {
  const ref = useRef(null)

  useEffect(() => {
    const header = document.querySelector('header')
    let frame = 0
    const place = () => {
      frame = 0
      if (!ref.current || !header) return
      ref.current.style.top = `${Math.max(0, Math.round(header.getBoundingClientRect().bottom))}px`
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(place) }
    place()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={ref} className={`${styles.strip} ${breakpoint === 'md' ? styles.bpMd : styles.bpLg}`}>
      <Chip
        isActive={open}
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
      </Chip>
    </div>
  )
}
