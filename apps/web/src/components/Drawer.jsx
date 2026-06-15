import { useEffect, useRef, useCallback } from 'react'
import styles from './Drawer.module.css'

/**
 * Drawer — generic slide-out panel shell (SUG-153).
 *
 * Owns: focus trap, body scroll lock, overlay, Escape close, slide transition,
 * close button. Content is the caller's concern (children).
 *
 * Used by Header (wraps DrawerNav) and PageSidebar / PlatformSidebar (sidebar content).
 */
export default function Drawer({ children, label, open, onClose }) {
  const drawerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => closeButtonRef.current?.focus())
    } else {
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const handleTabTrap = useCallback((e) => {
    if (e.key !== 'Tab' || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onKeyDown={handleTabTrap}
      >
        <div className={styles.drawerHeader}>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </>
  )
}
