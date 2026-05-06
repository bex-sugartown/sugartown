/**
 * perf.js — perf namespace collector (SUG-67, extended SUG-100)
 *
 * Reads Lighthouse CI JSON results from the .lighthouseci/ directory
 * (populated by the scheduled CI workflow) and normalises them into the
 * perf namespace.
 *
 * Falls back gracefully to { stale: true } if no Lighthouse results exist yet.
 *
 * Output shape (SUG-100: per-form-factor split):
 * {
 *   generatedAt: "2026-04-22T...",
 *   runs: {
 *     "https://sugartown.io/": {
 *       // Flat (single-form-factor, backward compat):
 *       url, lcp, cls, inp, performance, accessibility, seo, rating,
 *       // Per-form-factor (present when both presets ran):
 *       mobile:  { lcp, cls, inp, performance, accessibility, seo, bestPractices, rating } | null,
 *       desktop: { lcp, cls, inp, performance, accessibility, seo, bestPractices, rating } | null,
 *     },
 *     ...
 *   }
 * }
 *
 * Form-factor detection: reads configSettings.emulatedFormFactor or
 * configSettings.formFactor from the Lighthouse result. Desktop preset
 * sets emulatedFormFactor: "desktop"; mobile preset sets "mobile".
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

function extractFormFactor(result) {
  // Lighthouse 10+: configSettings.screenEmulation.disabled = true means desktop
  const cfg = result.configSettings ?? {}
  if (cfg.emulatedFormFactor) return cfg.emulatedFormFactor  // 'mobile' | 'desktop'
  if (cfg.formFactor)         return cfg.formFactor          // newer Lighthouse
  if (cfg.screenEmulation?.disabled === true) return 'desktop'
  return null  // unknown — treat as unkeyed (backward compat)
}

function extractRunData(url, result) {
  const cats = result.categories || {}
  const audits = result.audits || {}

  const lcp = audits['largest-contentful-paint']?.numericValue ?? null
  const cls = audits['cumulative-layout-shift']?.numericValue ?? null
  const inp = audits['interaction-to-next-paint']?.numericValue ?? null
  const perfScore = cats.performance?.score != null ? Math.round(cats.performance.score * 100) : null

  return {
    url,
    lcp: lcp != null ? Math.round(lcp) : null,
    cls: cls != null ? Math.round(cls * 1000) / 1000 : null,
    inp: inp != null ? Math.round(inp) : null,
    performance:   perfScore,
    accessibility: cats.accessibility?.score != null ? Math.round(cats.accessibility.score * 100) : null,
    bestPractices: cats['best-practices']?.score != null ? Math.round(cats['best-practices'].score * 100) : null,
    seo:           cats.seo?.score != null ? Math.round(cats.seo.score * 100) : null,
    rating:        lcp != null ? cwvRating('lcp', lcp) : null,
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

  // Group latest file per (url, formFactor) pair
  const byUrlFormFactor = new Map()  // key: `${url}::${formFactor|''}` → { file, result }
  for (const file of files) {
    try {
      const result = JSON.parse(readFileSync(join(LHCI_DIR, file), 'utf-8'))
      const url = result.finalUrl || result.requestedUrl
      if (!url) continue
      const ff = extractFormFactor(result) ?? ''
      const mapKey = `${url}::${ff}`
      const existing = byUrlFormFactor.get(mapKey)
      if (!existing || file > existing.file) {
        byUrlFormFactor.set(mapKey, { file, result })
      }
    } catch {}
  }

  const runs = {}

  for (const [mapKey, { result }] of byUrlFormFactor) {
    const [url, ff] = mapKey.split('::')
    const runData = extractRunData(url, result)

    if (!runs[url]) runs[url] = { url }

    if (ff === 'mobile') {
      runs[url].mobile = runData
    } else if (ff === 'desktop') {
      runs[url].desktop = runData
    } else {
      // No form-factor info — merge flat (backward compat with old single-preset runs)
      Object.assign(runs[url], runData)
    }
  }

  // For each URL: if only one form factor ran, mirror it as the flat fields for compat
  for (const [url, run] of Object.entries(runs)) {
    const hasFlat = run.performance != null
    if (!hasFlat) {
      const source = run.mobile ?? run.desktop
      if (source) Object.assign(runs[url], source)
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    runs,
  }
}
