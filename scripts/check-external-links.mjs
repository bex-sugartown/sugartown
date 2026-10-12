#!/usr/bin/env node
/**
 * check-external-links.mjs — ST-159 phase 4
 *
 * Weekly check of outbound links on the live site. Collects every external
 * link from the seed pages (tests/smoke/helpers/seed-pages.json, the same list
 * the internal link check uses), requests each once, and writes a Markdown
 * report. Advisory: it exits 0 on broken links and only fails if the crawl
 * itself breaks or finds nothing. The workflow turns the report into one
 * tracking issue (.github/workflows/external-links.yml).
 *
 * Usage: node scripts/check-external-links.mjs [origin] [report-path]
 *   origin       default https://sugartown.io
 *   report-path  default external-links-report.md
 */
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const origin = new URL(process.argv[2] ?? 'https://sugartown.io').origin
const reportPath = process.argv[3] ?? 'external-links-report.md'
const seeds = JSON.parse(readFileSync(join(here, '../tests/smoke/helpers/seed-pages.json'), 'utf8'))

const SKIP_HOSTS = new Set(['localhost', '127.0.0.1'])
// Hosts that refuse automated requests with 403/429 regardless of the link's health.
const BOT_BLOCKED = new Set(['www.linkedin.com', 'linkedin.com', 'x.com', 'twitter.com', 'www.instagram.com'])
const UA = 'Mozilla/5.0 (compatible; sugartown-link-check/1.0; +https://sugartown.io)'

const browser = await chromium.launch()
const context = await browser.newContext()
const found = new Map() // url -> first page it was seen on

for (const seed of seeds) {
  const page = await context.newPage()
  try {
    await page.goto(new URL(seed, origin).href)
    await page.waitForLoadState('networkidle')
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href))
    for (const href of hrefs) {
      let u
      try {
        u = new URL(href)
      } catch {
        continue
      }
      if (!/^https?:$/.test(u.protocol) || u.origin === origin || SKIP_HOSTS.has(u.hostname)) continue
      u.hash = ''
      if (!found.has(u.href)) found.set(u.href, seed)
    }
  } finally {
    await page.close()
  }
}
await browser.close()

if (found.size === 0) {
  console.error('external link check found no outbound links, so it checked nothing')
  process.exit(1)
}

async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        headers: { 'user-agent': UA },
        signal: AbortSignal.timeout(15_000),
      })
      if (res.ok) return { ok: true }
      if (method === 'GET' || ![403, 405, 501].includes(res.status)) return { ok: false, status: res.status }
    } catch (err) {
      if (method === 'GET') return { ok: false, status: err.name === 'TimeoutError' ? 'timeout' : 'unreachable' }
    }
  }
  return { ok: false, status: 'unknown' }
}

const broken = []
const skipped = []
const queue = [...found.entries()]
async function worker() {
  for (let item = queue.shift(); item; item = queue.shift()) {
    const [url, from] = item
    if (BOT_BLOCKED.has(new URL(url).hostname)) {
      skipped.push(url)
      continue
    }
    const r = await check(url)
    if (!r.ok) broken.push({ url, from, status: r.status })
  }
}
await Promise.all(Array.from({ length: 6 }, worker))

const date = new Date().toISOString().slice(0, 10)
const lines = [
  `External link check, ${date}, ${origin}`,
  '',
  `${found.size} outbound links checked from ${seeds.length} pages. ${broken.length} broken. ${skipped.length} skipped (hosts that block automated requests).`,
  '',
]
if (broken.length) {
  lines.push('| Link | Status | First seen on |', '|---|---|---|')
  for (const b of broken.sort((a, c) => a.url.localeCompare(c.url))) lines.push(`| ${b.url} | ${b.status} | ${b.from} |`)
} else {
  lines.push('No broken outbound links.')
}
writeFileSync(reportPath, lines.join('\n') + '\n')
console.log(lines.join('\n'))
// Advisory by design: a broken external link never fails a deploy workflow.
