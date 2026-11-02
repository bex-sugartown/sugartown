import { test } from '@playwright/test'
import { expectNoAxeViolations } from './helpers/axe'
import type { Theme } from './helpers/axe-allowlist'
import { PAGE_TYPES, discoverFirstDetail } from './helpers/discover'
import { applyTheme, assertTheme } from './helpers/theme'

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

// Both themes run the same routes (ST-186). Light keeps its original test names.
const THEMES: Theme[] = ['light', 'dark']
const label = (theme: Theme) => (theme === 'light' ? 'axe' : `axe (${theme})`)

for (const theme of THEMES) {
  for (const route of ROUTES) {
    test(`${label(theme)}: ${route.path} has no WCAG A/AA violations`, async ({ page }) => {
      await applyTheme(page, theme)
      await page.goto(route.path)
      await route.ready(page)
      await page.waitForLoadState('networkidle')
      await assertTheme(page, theme)
      await expectNoAxeViolations(page, route.path, theme)
    })
  }

  // One real detail page per page type, found from its archive at run time (ST-166).
  // The allowlist key is the page-type key, so entries do not depend on which item is first.
  for (const type of PAGE_TYPES) {
    test(`${label(theme)}: ${type.key} has no WCAG A/AA violations`, async ({ page }) => {
      await applyTheme(page, theme)
      const path = await discoverFirstDetail(page, type.archive, type.pattern)
      await page.goto(path)
      await page.getByRole('heading', { level: 1 }).first().waitFor()
      await page.waitForLoadState('networkidle')
      await assertTheme(page, theme)
      await expectNoAxeViolations(page, type.key, theme)
    })
  }
}
