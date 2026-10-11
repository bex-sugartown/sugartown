/**
 * GlossaryTermAnnotation — inline PT mark renderer for glossaryTermRef annotations.
 *
 * Uses createPortal + position:fixed so the popover escapes any overflow:hidden ancestor.
 * Hover is managed by React state (not CSS :hover) so moving the mouse into the popover
 * keeps it open — the popover itself is fully interactive (WCAG 1.4.13: hoverable).
 *
 * WCAG 1.4.13: dismissible via Escape, persistent while pointer is over term or popover.
 * Mobile (@media pointer: coarse): popover is suppressed; tap navigates to the term page.
 */
import { useState, useEffect, useRef, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { getCanonicalPath } from '../lib/routes'
import styles from '../pages/GlossaryPage.module.css'

export default function GlossaryTermAnnotation({ value, children }) {
  const termRef = value?.term
  const [shown, setShown] = useState(false)
  const [popoverPos, setPopoverPos] = useState(null)
  const termElRef = useRef(null)
  const hideTimer = useRef(null)
  const popoverId = useId()

  // Escape key — WCAG 1.4.13
  useEffect(() => {
    if (!shown) return
    const onKeyDown = (e) => { if (e.key === 'Escape') setShown(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shown])

  // Keep the fixed popover attached to its term while the page scrolls. It used to close on any
  // scroll, which also closed it when Tab scrolled the next term into view (ST-151); it now
  // follows the term and closes only once the term has left the viewport.
  useEffect(() => {
    if (!shown) return
    const onScroll = () => {
      const el = termElRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setShown(false)
        return
      }
      setPopoverPos({ left: rect.left + rect.width / 2, top: rect.top })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [shown])

  const scheduleHide = useCallback(() => {
    hideTimer.current = setTimeout(() => setShown(false), 100)
  }, [])

  const cancelHide = useCallback(() => {
    clearTimeout(hideTimer.current)
  }, [])

  const handleShow = useCallback(() => {
    cancelHide()
    if (termElRef.current) {
      const rect = termElRef.current.getBoundingClientRect()
      setPopoverPos({
        left: rect.left + rect.width / 2,
        top: rect.top,
      })
    }
    setShown(true)
  }, [cancelHide])

  if (!termRef?.slug) return <>{children}</>

  const href = getCanonicalPath({ docType: 'glossaryTerm', slug: termRef.slug })
  const preview = termRef.definitionPreview
  const plainPreview = preview
    ? preview.map((b) => b.children?.map((s) => s.text).join('')).join(' ')
    : null
  const Wrapper = value?._firstOccurrence ? 'dfn' : 'span'

  return (
    <>
      <Wrapper
        ref={termElRef}
        className={styles.glossaryLink}
        onMouseEnter={handleShow}
        onMouseLeave={scheduleHide}
        onFocus={handleShow}
        onBlur={scheduleHide}
      >
        {/* The link is the one tab stop and the trigger: it navigates, so it stays an <a>.
            (ST-151: the wrapper used to carry tabIndex=0 as well, giving two tab stops per term.) */}
        <Link
          to={href}
          style={{ color: 'inherit', textDecoration: 'none' }}
          aria-expanded={shown}
          aria-controls={shown ? popoverId : undefined}
        >
          {children}
        </Link>
      </Wrapper>
      {shown && popoverPos && createPortal(
        <span
          id={popoverId}
          className={styles.glossaryPopover}
          style={{
            position: 'fixed',
            left: popoverPos.left,
            top: popoverPos.top,
            transform: 'translate(-50%, calc(-100% - 8px))',
            display: 'block',
          }}
          role="tooltip"
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          <span className={styles.popoverTerm}>
            {termRef.term}
            {termRef.abbreviation && (
              <span className={styles.popoverAbbr}>{termRef.abbreviation}</span>
            )}
          </span>
          {plainPreview && (
            <span className={styles.popoverDefinition}>{plainPreview}</span>
          )}
          <Link to={href} className={styles.popoverLink}>
            Read full definition →
          </Link>
        </span>,
        document.body
      )}
    </>
  )
}
