/**
 * ConsentBanner — analytics consent bar, fixed to the bottom of the viewport.
 *
 * Shows on first visit (no stored choice) and when the footer's "Cookie
 * settings" control asks it to reopen. Accept and Reject are identical buttons
 * so neither choice is nudged. Escape does nothing and there is no close
 * button: leaving the bar open is allowed, dismissing without a choice is not.
 *
 * While open, the page gets bottom padding equal to the bar's height so the
 * footer can always be scrolled into view.
 *
 * Composes DS Callout (banner, labelled region), ButtonGroup and Button.
 * Consent state and GA loading live in lib/consent.js.
 *
 * Spec: docs/drafts/SUG-202-cookie-consent-banner.vspec.html
 * SUG-202 (#65) — Phase 2
 */
import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button, ButtonGroup, Callout } from '@sugartown/design-system'
import { getConsent, setConsent, CONSENT_OPEN_EVENT } from '../lib/consent'
import { PRIVACY_PATH } from '../lib/routes'
import styles from './ConsentBanner.module.css'

export default function ConsentBanner() {
  const [open, setOpen] = useState(() => getConsent() === null)
  const [current, setCurrent] = useState(() => getConsent())
  const [fromSettings, setFromSettings] = useState(false)
  const barRef = useRef(null)
  const returnFocusRef = useRef(null)

  useEffect(() => {
    function onOpen() {
      returnFocusRef.current = document.activeElement
      setCurrent(getConsent())
      setFromSettings(true)
      setOpen(true)
    }
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen)
  }, [])

  // Reopened from the footer: move focus into the bar.
  useEffect(() => {
    if (open && fromSettings) barRef.current?.querySelector('button')?.focus()
  }, [open, fromSettings])

  // Reserve space for the bar while it is open.
  useEffect(() => {
    if (!open || !barRef.current) return
    const bar = barRef.current
    const apply = () => { document.body.style.paddingBottom = `${bar.offsetHeight}px` }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(bar)
    return () => {
      observer.disconnect()
      document.body.style.paddingBottom = ''
    }
  }, [open])

  function choose(value) {
    setConsent(value)
    setCurrent(value)
    setOpen(false)
    setFromSettings(false)
    const target = returnFocusRef.current ?? document.querySelector('main')
    returnFocusRef.current = null
    if (!target) return
    if (target.tagName === 'MAIN' && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }

  if (!open) return null

  return (
    <div className={styles.fixedBar} ref={barRef}>
      <div className={styles.fixedBarInner}>
        <Callout variant="banner" title="Cookies" role="region" ariaLabel="Cookie consent">
          <div className={styles.consentBody}>
            <p className={styles.consentText}>
              Sugartown uses Google Analytics to see which pages get read. Nothing is tracked
              unless you accept. <RouterLink to={PRIVACY_PATH}>Privacy &amp; Terms</RouterLink>
              {fromSettings && current && (
                <span className={styles.consentMeta}>
                  Current choice: {current === 'granted' ? 'accepted' : 'rejected'}
                </span>
              )}
            </p>
            <ButtonGroup className={styles.consentActions} wrap={false}>
              <Button variant="secondary" size="sm" onClick={() => choose('granted')}>
                Accept analytics
              </Button>
              <Button variant="secondary" size="sm" onClick={() => choose('denied')}>
                Reject analytics
              </Button>
            </ButtonGroup>
          </div>
        </Callout>
      </div>
    </div>
  )
}
