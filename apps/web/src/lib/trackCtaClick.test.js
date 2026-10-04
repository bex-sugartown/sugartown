// Run: pnpm --filter web test:unit (node's built-in runner; no extra dependency).
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

const store = {}
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v) },
}
globalThis.window = { location: { host: 'sugartown.io', hostname: 'sugartown.io' } }

const { trackCtaClick } = await import('./trackCtaClick.js')

const calls = []
const setConsentStored = (analytics) => {
  store['st-consent'] = JSON.stringify({ analytics, v: 1 })
}

beforeEach(() => {
  calls.length = 0
  for (const k of Object.keys(store)) delete store[k]
  window.gtag = (...args) => calls.push(args)
})

test('granted: sends one cta_click with the right params (external)', () => {
  setConsentStored('granted')
  trackCtaClick({ label: 'View the repo', style: 'primary', section: 'hero', url: 'https://github.com/bex-sugartown/sugartown' })
  assert.deepEqual(calls, [['event', 'cta_click', {
    cta_label: 'View the repo',
    cta_style: 'primary',
    cta_section: 'hero',
    link_url: 'https://github.com/bex-sugartown/sugartown',
    outbound: true,
  }]])
})

test('granted: internal path and own-host absolute URL are not outbound', () => {
  setConsentStored('granted')
  trackCtaClick({ label: 'Governance', style: 'tertiary', section: 'hero', url: '/platform/governance' })
  trackCtaClick({ label: 'Self', style: 'tertiary', section: 'hero', url: 'https://sugartown.io/code' })
  assert.equal(calls[0][2].outbound, false)
  assert.equal(calls[1][2].outbound, false)
})

test('denied: pushes nothing', () => {
  setConsentStored('denied')
  trackCtaClick({ label: 'x', style: 'primary', section: 'hero', url: 'https://github.com' })
  assert.equal(calls.length, 0)
})

test('no stored choice: pushes nothing', () => {
  trackCtaClick({ label: 'x', style: 'primary', section: 'hero', url: 'https://github.com' })
  assert.equal(calls.length, 0)
})

test('accepting later does not replay an earlier click', () => {
  trackCtaClick({ label: 'x', style: 'primary', section: 'hero', url: '/a' })
  setConsentStored('granted')
  assert.equal(calls.length, 0)
})
