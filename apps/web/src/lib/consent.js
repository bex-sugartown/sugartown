/**
 * consent.js — analytics consent and Google Analytics loading.
 *
 * The one place GA is loaded. Consent Mode v2, basic implementation: every
 * consent type defaults to `denied`, and gtag.js is not requested at all until
 * the visitor accepts. The stored choice lives in localStorage['st-consent'] as
 * { analytics: 'granted' | 'denied', v: CONSENT_VERSION }.
 *
 * Loaded from the app bundle rather than an inline script in index.html, so
 * prerendered pages (which carry the bundle but not inline scripts) get the
 * same behaviour.
 *
 * Usage:
 *   initAnalytics()            once, at startup (main.jsx)
 *   getConsent()               'granted' | 'denied' | null (null = ask)
 *   setConsent('granted')      store, apply, notify listeners
 *   openConsentSettings()      ask the banner to reopen (footer control)
 *   CONSENT_CHANGE_EVENT, CONSENT_OPEN_EVENT   window events the banner listens to
 *
 * SUG-202 (#65) — Phase 1
 */

const STORAGE_KEY = 'st-consent'
const GA_ID = 'G-00MF2Q9YJW'

// Bump to re-ask everyone, e.g. when the banner starts covering a new tool.
export const CONSENT_VERSION = 1

export const CONSENT_CHANGE_EVENT = 'st-consent-change'
export const CONSENT_OPEN_EVENT = 'st-consent-open'

let gaLoaded = false

function isLocalHost() {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local')
}

function gtag() {
  window.dataLayer = window.dataLayer || []
  // gtag.js expects the arguments object itself, not an array copy.
  window.dataLayer.push(arguments)
}

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export function getConsent() {
  const stored = readStored()
  if (!stored || stored.v !== CONSENT_VERSION) return null
  return stored.analytics === 'granted' || stored.analytics === 'denied' ? stored.analytics : null
}

function loadAnalytics() {
  if (gaLoaded || isLocalHost()) return
  gaLoaded = true
  gtag('consent', 'update', { analytics_storage: 'granted' })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  gtag('js', new Date())
  gtag('config', GA_ID)
}

function deleteAnalyticsCookies() {
  const host = window.location.hostname
  const domains = ['', host, `.${host.replace(/^www\./, '')}`]
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim()
    if (!name.startsWith('_ga')) return
    domains.forEach((d) => {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`
    })
  })
}

export function initAnalytics() {
  window.gtag = gtag
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  if (getConsent() === 'granted') loadAnalytics()
}

export function setConsent(value) {
  const previous = getConsent()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: value, v: CONSENT_VERSION }))
  } catch {
    // Storage blocked (private window): the choice applies to this page view only.
  }
  if (value === 'granted') {
    loadAnalytics()
  } else if (previous === 'granted' || gaLoaded) {
    gtag('consent', 'update', { analytics_storage: 'denied' })
    deleteAnalyticsCookies()
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }))
}

export function openConsentSettings() {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))
}
