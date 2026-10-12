import { test } from '@playwright/test'
import { expectNoAxeViolations } from './helpers/axe'

// The five smoke routes (homepage, archive, detail, taxonomy, 404). A sample,
// not every page type: the close-out in ST-159 states the coverage gap.
// Each route waits for the same content its smoke spec asserts, so axe scans
// rendered content and not a loading state.
const ROUTES: { path: string; ready: (page: import('@playwright/test').Page) => Promise<void> }[] = [
  { path: '/', ready: (p) => p.locator('body').waitFor() },
  { path: '/articles', ready: (p) => p.locator('article').first().waitFor() },
  { path: '/tools/vercel', ready: (p) => p.getByRole('heading', { level: 1 }).waitFor() },
  { path: '/categories/governance', ready: (p) => p.getByText(/^\d+ items?$/).waitFor() },
  { path: '/this-route-does-not-exist-smoke-test', ready: (p) => p.getByRole('heading', { level: 1 }).waitFor() },
]

for (const route of ROUTES) {
  test(`axe: ${route.path} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(route.path)
    await route.ready(page)
    await page.waitForLoadState('networkidle')
    await expectNoAxeViolations(page, route.path)
  })
}
