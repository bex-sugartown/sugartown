import { test } from '@playwright/test'
import { expectNoAxeViolations } from './helpers/axe'
import { PAGE_TYPES, discoverFirstDetail } from './helpers/discover'

// The five smoke routes (homepage, archive, detail, taxonomy, 404), then one
// discovered detail page for each of case study, node and glossary term below.
// Still a sample, not every page type: platform pages and /about are not covered (ST-166).
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
    await expectNoAxeViolations(page, route.path, 'light')
  })
}

// One real detail page per page type, found from its archive at run time (ST-166).
// The allowlist key is the page-type key, so entries do not depend on which item is first.
for (const type of PAGE_TYPES) {
  test(`axe: ${type.key} has no WCAG A/AA violations`, async ({ page }) => {
    const path = await discoverFirstDetail(page, type.archive, type.pattern)
    await page.goto(path)
    await page.getByRole('heading', { level: 1 }).first().waitFor()
    await page.waitForLoadState('networkidle')
    await expectNoAxeViolations(page, type.key, 'light')
  })
}
