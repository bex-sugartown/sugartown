import { test, expect, type APIResponse } from '@playwright/test'
import { discoverFirstDetail } from './helpers/discover'

// #82: Google fetches the HTML, and the JSON-LD must be in it without client JS.
// `request.get` never runs the page's scripts, so these read the prerendered file itself.

type Node = { '@type': string; [key: string]: unknown }

async function jsonLdIn(response: APIResponse): Promise<Node[]> {
  expect(response.status()).toBe(200)
  const html = await response.text()
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  expect(blocks.length, 'exactly one JSON-LD block in the served HTML').toBe(1)
  const parsed = JSON.parse(blocks[0][1])
  return parsed['@graph'] ?? [parsed]
}

test('/about serves ProfilePage with mainEntity in the HTML, without client JS', async ({ request }) => {
  const graph = await jsonLdIn(await request.get('/about'))
  const profile = graph.find((n) => n['@type'] === 'ProfilePage')
  expect(profile, 'ProfilePage node').toBeTruthy()
  const mainEntity = profile!.mainEntity as { '@id': string }
  expect(mainEntity['@id']).toMatch(/\/people\/[^/]+\/#person$/)
  expect(graph.some((n) => n['@id'] === mainEntity['@id'] && n['@type'] === 'Person')).toBe(true)
})

for (const [label, archive, pattern, type] of [
  ['article', '/articles', /^\/articles\/[^/]+$/, 'Article'],
  ['node', '/nodes', /^\/nodes\/[^/]+$/, 'Article'],
  ['glossary term', '/glossary', /^\/glossary\/[^/]+$/, 'DefinedTerm'],
] as const) {
  test(`first ${label} serves ${type} JSON-LD in the HTML`, async ({ page, request }) => {
    const path = await discoverFirstDetail(page, archive, pattern)
    const graph = await jsonLdIn(await request.get(path))
    expect(graph.some((n) => n['@type'] === type)).toBe(true)
  })
}

test('the client keeps one JSON-LD block after React loads', async ({ page }) => {
  await page.goto('/about')
  await page.getByRole('heading', { level: 1 }).first().waitFor()
  await page.waitForLoadState('networkidle')
  expect(await page.locator('script[type="application/ld+json"]').count()).toBe(1)
  expect(await page.locator('script[type="application/ld+json"][data-prerendered]').count()).toBe(0)
})
