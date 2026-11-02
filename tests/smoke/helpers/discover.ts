import type { Page } from '@playwright/test'

// Finds a real detail page at run time, so no test hardcodes a slug that can be
// unpublished (ST-166, R-7). An empty or changed archive throws: a gate that
// silently skips a page type is worse than one that fails.
export type PageType = {
  // Stable label used as the allowlist route key, instead of the discovered path,
  // so entries survive the first item changing when content is published.
  key: string
  archive: string
  pattern: RegExp
}

export const PAGE_TYPES: PageType[] = [
  { key: '/case-studies/:first', archive: '/case-studies', pattern: /^\/case-studies\/[^/]+$/ },
  { key: '/nodes/:first', archive: '/nodes', pattern: /^\/nodes\/[^/]+$/ },
  { key: '/glossary/:first', archive: '/glossary', pattern: /^\/glossary\/[^/]+$/ },
]

export async function discoverFirstDetail(page: Page, archivePath: string, pattern: RegExp): Promise<string> {
  await page.goto(archivePath)
  await page.getByRole('heading', { level: 1 }).first().waitFor()
  await page.waitForLoadState('networkidle')
  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href') || ''))
  const first = hrefs.find((h) => pattern.test(h))
  if (!first) {
    throw new Error(`discoverFirstDetail: no link matching ${pattern} on ${archivePath}`)
  }
  return first
}
