import { test, expect } from '@playwright/test'

// #256: the homepage and the archive index pages must carry title, description, canonical and an
// H1 in the HTML itself. `request.get` never runs the page's scripts, so these read the served file.

const ROUTES = ['/', '/articles', '/case-studies', '/releases', '/nodes', '/library', '/knowledge-graph'] as const

for (const route of ROUTES) {
  test(`${route} serves title, description, canonical and H1 without client JS`, async ({ request }) => {
    const response = await request.get(route)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toMatch(/<title>[^<]{3,}<\/title>/)
    expect(html).toMatch(/<meta name="description" content="[^"]{20,}"/)
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+"/)
    expect(html).toMatch(/<h1>[^<]+<\/h1>/)
    expect((html.match(/<meta name="description"/g) ?? []).length, 'one description tag').toBe(1)
    expect((html.match(/<link rel="canonical"/g) ?? []).length, 'one canonical tag').toBe(1)
  })
}
