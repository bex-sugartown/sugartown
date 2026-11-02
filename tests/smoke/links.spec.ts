import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from '@playwright/test'
import { checkInternalLinks } from './helpers/links'
import { PAGE_TYPES, discoverFirstDetail } from './helpers/discover'

// Internal link check (ST-159 phase 3). Method and limits: helpers/links.ts.
// One list for the internal check here and the weekly external check
// (scripts/check-external-links.mjs), so they cannot drift apart.
const SEEDS: string[] = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'helpers/seed-pages.json'), 'utf8'),
)

test('internal links on the seed pages all resolve to real pages', async ({ browser, baseURL }) => {
  test.setTimeout(240_000)
  const context = await browser.newContext()
  // Add one discovered detail page per page type to the static list (ST-166).
  // The weekly external check keeps the static list only (FSD D-4).
  const discoverPage = await context.newPage()
  const discovered: string[] = []
  for (const type of PAGE_TYPES) {
    discovered.push(await discoverFirstDetail(discoverPage, type.archive, type.pattern))
  }
  await discoverPage.close()
  const seeds = [...new Set([...SEEDS, ...discovered])]

  const { checked, failures } = await checkInternalLinks(context, new URL(baseURL!).origin, seeds)
  await context.close()

  console.log(`seed pages: ${seeds.length} (${SEEDS.length} static, ${discovered.length} discovered)`)
  console.log(`internal links checked: ${checked} unique targets from ${seeds.length} seed pages`)
  expect(checked, 'the crawl found almost no internal links, so it checked nothing').toBeGreaterThan(20)
  expect(failures, `broken internal links (${failures.length} of ${checked}):\n${failures.join('\n')}`).toEqual([])
})

// Liveness probe: a seed page that links to a path that does not exist must
// produce a failure. If the crawler ever stops detecting the NotFoundPage, this
// fails, so the gate cannot stay green while inert.
test('link check fails on a seed page with a broken link', async ({ browser, baseURL }) => {
  const origin = new URL(baseURL!).origin
  const context = await browser.newContext()
  await context.route(`${origin}/__link-probe__`, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><title>probe</title><body><a href="/this-route-does-not-exist-link-probe">broken</a></body></html>',
    }),
  )

  const { checked, failures } = await checkInternalLinks(context, origin, ['/__link-probe__'])
  await context.close()

  expect(checked).toBe(1)
  expect(failures.join('\n')).toContain('/this-route-does-not-exist-link-probe')
})

// Liveness probe: a same-page link (#x) must resolve against the page it sits on,
// not the site root (ST-166). Before the fix this reported '#x' as missing on '/'.
test('link check resolves a same-page anchor against its own page', async ({ browser, baseURL }) => {
  const origin = new URL(baseURL!).origin
  const context = await browser.newContext()
  await context.route(`${origin}/__anchor-probe__`, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><title>probe</title><body><h1>Probe</h1><a href="#x">same page</a><h2 id="x">target</h2></body></html>',
    }),
  )

  const { failures } = await checkInternalLinks(context, origin, ['/__anchor-probe__'])
  await context.close()

  expect(failures).toEqual([])
})
