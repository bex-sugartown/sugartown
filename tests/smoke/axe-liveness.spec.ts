import { test, expect } from '@playwright/test'
import { expectNoAxeViolations } from './helpers/axe'

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

  await expect(expectNoAxeViolations(page, '/__axe-liveness-probe__')).rejects.toThrow(
    /axe violations/,
  )
})
