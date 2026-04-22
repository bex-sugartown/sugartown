/**
 * perf.js — perf namespace collector (SUG-67)
 *
 * Reads Lighthouse CI JSON results from the .lighthouseci/ directory
 * (populated by the scheduled CI workflow) and normalises them into the
 * perf namespace.
 *
 * Falls back gracefully to { stale: true } if no Lighthouse results exist yet.
 *
 * Output shape:
 * {
 *   generatedAt: "2026-04-22T...",
 *   runs: {
 *     homepage: { url, lcp, cls, inp, performance, accessibility, seo, rating },
 *     articlesArchive: { ... },
 *     ...
 *   }
 * }
 */

import { readdirSync, readFileSync } from 'fs'
import { resolve, join } from 'path'

const LHCI_DIR = resolve(process.cwd(), '../../.lighthouseci')

// CWV thresholds (ms / unitless)
const CWV_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  cls: { good: 0.1,  poor: 0.25 },
  inp: { good: 200,  poor: 500 },
}

function cwvRating(metric, value) {
  const t = CWV_THRESHOLDS[metric]
  if (!t || value == null) return null
  if (value <= t.good) return 'good'
  if (value <= t.poor) return 'needs-improvement'
  return 'poor'
}

// Map URL paths to human-readable run keys
const URL_KEY_MAP = [
  ['/articles', 'articlesArchive'],
  ['/case-studies', 'caseStudiesArchive'],
  ['/knowledge-graph', 'knowledgeGraph'],
  ['/platform', 'platform'],
  ['/about', 'about'],
]

function urlToKey(url) {
  try {
    const path = new URL(url).pathname
    if (path === '/') return 'homepage'
    for (const [prefix, key] of URL_KEY_MAP) {
      if (path.startsWith(prefix)) return key
    }
    // Detail page: /articles/some-slug → articles_some-slug
    return path.replace(/^\//, '').replace(/\//g, '_')
  } catch {
    return 'unknown'
  }
}

export function collectPerf() {
  let files = []
  try {
    files = readdirSync(LHCI_DIR).filter(f => f.endsWith('.json') && !f.startsWith('manifest'))
  } catch {
    throw new Error(`No Lighthouse CI output found at ${LHCI_DIR} — run lhci autorun first`)
  }

  if (files.length === 0) {
    throw new Error(`No JSON files in ${LHCI_DIR}`)
  }

  // Each file is a Lighthouse result; pick the latest run per URL
  const byUrl = new Map()
  for (const file of files) {
    try {
      const result = JSON.parse(readFileSync(join(LHCI_DIR, file), 'utf-8'))
      const url = result.finalUrl || result.requestedUrl
      if (!url) continue
      const existing = byUrl.get(url)
      // Keep the most recent result (files are named with timestamps)
      if (!existing || file > existing.file) {
        byUrl.set(url, { file, result })
      }
    } catch {}
  }

  const runs = {}
  for (const [url, { result }] of byUrl) {
    const key = urlToKey(url)
    const cats = result.categories || {}
    const audits = result.audits || {}

    const lcp = audits['largest-contentful-paint']?.numericValue ?? null
    const cls = audits['cumulative-layout-shift']?.numericValue ?? null
    const inp = audits['interaction-to-next-paint']?.numericValue ?? null

    // Overall performance score drives the rating label
    const perfScore = cats.performance?.score != null ? Math.round(cats.performance.score * 100) : null
    const rating = lcp != null ? cwvRating('lcp', lcp) : null

    runs[key] = {
      url,
      lcp: lcp != null ? Math.round(lcp) : null,
      cls: cls != null ? Math.round(cls * 1000) / 1000 : null,
      inp: inp != null ? Math.round(inp) : null,
      performance:   perfScore,
      accessibility: cats.accessibility?.score != null ? Math.round(cats.accessibility.score * 100) : null,
      seo:           cats.seo?.score != null ? Math.round(cats.seo.score * 100) : null,
      rating,
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    runs,
  }
}
