import type { BrowserContext } from '@playwright/test'

// Internal link crawler for ST-159 phase 3. Crawls the running preview, not
// dist/: only content detail pages are prerendered, so a dist/ parse would miss
// every link on archive and taxonomy pages. The SPA answers 200 for any path,
// so a broken link shows up as the NotFoundPage h1, not as an HTTP status.
const SKIP_PREFIXES = ['/dev/']
const CONCURRENCY = 6

type Target = { path: string; hash: string }

function internalTarget(href: string, origin: string): Target | null {
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return null
  let url: URL
  try {
    url = new URL(href, origin)
  } catch {
    return null
  }
  if (url.origin !== origin) return null
  if (SKIP_PREFIXES.some((p) => url.pathname.startsWith(p))) return null
  return { path: url.pathname + url.search, hash: url.hash.replace(/^#/, '') }
}

async function collectLinks(context: BrowserContext, origin: string, path: string) {
  const page = await context.newPage()
  try {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href') || ''))
    return hrefs
      .map((h) => internalTarget(h, origin))
      .filter((t): t is Target => t !== null)
      .map((t) => ({ ...t, from: path }))
  } finally {
    await page.close()
  }
}

// Depth 1: every internal link on the seed pages, each unique target visited
// once. A redirect that ends on a real page passes; only a landing on
// "Page Not Found" or a missing #anchor fails.
export async function checkInternalLinks(context: BrowserContext, origin: string, seeds: string[]) {
  const found = (await Promise.all(seeds.map((s) => collectLinks(context, origin, s)))).flat()

  const unique = new Map<string, { hashes: Set<string>; from: string }>()
  for (const l of found) {
    const entry = unique.get(l.path) ?? { hashes: new Set<string>(), from: l.from }
    if (l.hash) entry.hashes.add(l.hash)
    unique.set(l.path, entry)
  }

  const failures: string[] = []
  const queue = [...unique.entries()]

  async function worker() {
    const page = await context.newPage()
    for (let item = queue.shift(); item; item = queue.shift()) {
      const [path, { hashes, from }] = item
      try {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        const h1 =
          (await page
            .getByRole('heading', { level: 1 })
            .first()
            .textContent({ timeout: 5_000 })
            .catch(() => null)) ?? ''
        if (h1.trim() === 'Page Not Found') {
          failures.push(`${path} (linked from ${from}): lands on Page Not Found`)
          continue
        }
        for (const hash of hashes) {
          const exists = await page.evaluate(
            (id) => !!(document.getElementById(id) || document.getElementsByName(id).length),
            hash,
          )
          if (!exists) failures.push(`${path}#${hash} (linked from ${from}): anchor not found`)
        }
      } catch (err) {
        failures.push(`${path} (linked from ${from}): ${(err as Error).message.split('\n')[0]}`)
      }
    }
    await page.close()
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  return { checked: unique.size, failures }
}
