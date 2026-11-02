import { test, expect } from '@playwright/test'
import { expectNoAxeViolations, isAllowlisted } from './helpers/axe'
import type { AxeAllowEntry } from './helpers/axe-allowlist'

// Liveness probe for the axe gate (ST-159). Feeds the helper a page with a
// known WCAG AA violation (a 1.6:1 button and an image with no alt) and
// requires it to throw. If axe is misconfigured and finds nothing, this test
// fails, so the gate cannot stay green while inert. Runs on every smoke run.
test('axe gate fails on a page with known violations', async ({ page }) => {
  await page.setContent(`
    <!doctype html>
    <html lang="en">
      <head><title>axe liveness probe</title></head>
      <body>
        <main>
          <h1>Probe</h1>
          <button style="color:#cccccc;background:#ffffff">low contrast</button>
          <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">
        </main>
      </body>
    </html>
  `)

  await expect(expectNoAxeViolations(page, '/__axe-liveness-probe__', 'light')).rejects.toThrow(
    /axe violations/,
  )
})

// Liveness probe for the allowlist's theme match (ST-166). An entry recorded in
// light must not hide the same rule on the same route in dark. If matching
// ignores theme again, this fails.
test('allowlist entry recorded in light does not hide a dark violation', () => {
  const lightEntry: AxeAllowEntry[] = [
    { rule: 'color-contrast', route: '/probe', theme: 'light', date: '2026-11-02', issue: '#1', maxNodes: 5 },
  ]
  const violation = { id: 'color-contrast', nodes: 1 }
  expect(isAllowlisted(violation, '/probe', 'light', lightEntry)).toBe(true)
  expect(isAllowlisted(violation, '/probe', 'dark', lightEntry)).toBe(false)
})
