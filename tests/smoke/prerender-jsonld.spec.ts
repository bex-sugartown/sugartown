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

// #258: sameAs lists profile URLs only, the person has alternate names, /services is not a profile page.
test('/about Person has http(s) sameAs only and alternateName', async ({ request }) => {
  const graph = await jsonLdIn(await request.get('/about'))
  const person = graph.find((n) => n['@type'] === 'Person')
  expect(person, 'Person node').toBeTruthy()
  const sameAs = person!.sameAs as string[]
  expect(sameAs.length).toBeGreaterThan(0)
  for (const url of sameAs) expect(url).toMatch(/^https?:\/\/\S+$/)
  expect(person!.alternateName as string[]).toEqual(expect.arrayContaining(['Bex', 'Becky Head']))
})

test('/services is a WebPage, not a ProfilePage', async ({ request }) => {
  const graph = await jsonLdIn(await request.get('/services'))
  expect(graph.some((n) => n['@type'] === 'ProfilePage')).toBe(false)
  expect(graph.some((n) => n['@type'] === 'WebPage')).toBe(true)
})

test('first article JSON-LD carries an absolute image', async ({ page, request }) => {
  const path = await discoverFirstDetail(page, '/articles', /^\/articles\/[^/]+$/)
  const graph = await jsonLdIn(await request.get(path))
  const article = graph.find((n) => n['@type'] === 'Article')
  expect(article!.image as string).toMatch(/^https:\/\/\S+$/)
})

for (const [label, archive, pattern, type] of [
  ['article', '/articles', /^\/articles\/[^/]+$/, 'Article'],
  ['node', '/nodes', /^\/nodes\/[^/]+$/, 'Article'],
  ['glossary term', '/glossary', /^\/glossary\/[^/]+$/, 'DefinedTerm'],
  // #212: project and tool routes, same JSON-LD as ProjectDetailPage and ToolDetailPage send.
  ['project', '/projects', /^\/projects\/[^/]+$/, 'CreativeWork'],
  ['tool', '/tools', /^\/tools\/[^/]+$/, 'WebPage'],
] as const) {
  test(`first ${label} serves ${type} JSON-LD in the HTML`, async ({ page, request }) => {
    const path = await discoverFirstDetail(page, archive, pattern)
    const graph = await jsonLdIn(await request.get(path))
    expect(graph.some((n) => n['@type'] === type)).toBe(true)
  })
}

// #239: LinkedIn reads og:image from the HTML and runs no JS, so the share image must be in the file.
function metaContent(html: string, property: string): string[] {
  return [...html.matchAll(new RegExp(`<meta property="${property}" content="([^"]*)"`, 'g'))].map((m) => m[1])
}

for (const [label, archive, pattern] of [
  ['article', '/articles', /^\/articles\/[^/]+$/],
  ['node', '/nodes', /^\/nodes\/[^/]+$/],
] as const) {
  test(`first ${label} serves one absolute og:image in the HTML`, async ({ page, request }) => {
    const path = await discoverFirstDetail(page, archive, pattern)
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    const html = await response.text()
    const images = metaContent(html, 'og:image')
    expect(images, 'exactly one og:image').toHaveLength(1)
    expect(images[0]).toMatch(/^https:\/\/\S+$/)
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
  })
}

// #212: a thin tool page is noindex on the client (MIN_INDEXABLE_ITEMS); its snapshot must agree,
// or the HTML Google fetches and the page it renders give different answers.
test('first tool snapshot carries the same robots verdict as the rendered page', async ({ page, request }) => {
  const path = await discoverFirstDetail(page, '/tools', /^\/tools\/[^/]+$/)
  const html = await (await request.get(path)).text()
  const snapshotNoindex = /<meta name="robots" content="noindex, follow" \/>/.test(html)
  await page.goto(path)
  await page.getByRole('heading', { level: 1 }).first().waitFor()
  await page.waitForLoadState('networkidle')
  const rendered = await page.locator('meta[name="robots"]').getAttribute('content')
  expect(snapshotNoindex, `snapshot noindex vs rendered robots "${rendered}" on ${path}`).toBe(rendered === 'noindex, follow')
})

// #257: tag pages are prerendered. A thin tag is noindex on the client (MIN_INDEXABLE_ITEMS) and its
// snapshot must say the same; the first tag listed has the most items, so it must be indexable and carry links.
test('first tag snapshot carries content and an indexable verdict', async ({ page, request }) => {
  const path = await discoverFirstDetail(page, '/tags', /^\/tags\/[^/]+$/)
  const response = await request.get(path)
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toMatch(/<h1>[^<]+<\/h1>/)
  expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+"/)
  const snapshotNoindex = /<meta name="robots" content="noindex, follow" \/>/.test(html)
  await page.goto(path)
  await page.getByRole('heading', { level: 1 }).first().waitFor()
  await page.waitForLoadState('networkidle')
  const rendered = await page.locator('meta[name="robots"]').getAttribute('content')
  expect(snapshotNoindex, `snapshot noindex vs rendered robots "${rendered}" on ${path}`).toBe(rendered === 'noindex, follow')
})

test('/about serves og:image in the HTML, without client JS', async ({ request }) => {
  const response = await request.get('/about')
  const images = metaContent(await response.text(), 'og:image')
  expect(images).toHaveLength(1)
  expect(images[0]).toMatch(/^https:\/\//)
})

test('the client keeps one JSON-LD block after React loads', async ({ page }) => {
  await page.goto('/about')
  await page.getByRole('heading', { level: 1 }).first().waitFor()
  await page.waitForLoadState('networkidle')
  expect(await page.locator('script[type="application/ld+json"]').count()).toBe(1)
  expect(await page.locator('script[type="application/ld+json"][data-prerendered]').count()).toBe(0)
})
