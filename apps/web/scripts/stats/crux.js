/**
 * crux.js — crux namespace collector (SUG-67, extended SUG-100)
 *
 * Fetches Chrome UX Report (CrUX) origin-level data from the public API.
 * No authentication required — uses a free-tier public API key if provided,
 * falls back to unauthenticated request.
 *
 * CrUX only returns data for origins with sufficient traffic. If the origin
 * has no data yet, the collector returns { available: false, stale: false }.
 *
 * Output shape (SUG-100: per-form-factor split):
 * {
 *   fetchedAt: "2026-04-22T...",
 *   origin: "https://sugartown.io",
 *   available: true,
 *   // Origin-blend (backward compat):
 *   lcp: { p75: 2100, rating: "good" },
 *   cls: { p75: 0.04, rating: "good" },
 *   inp: { p75: 180, rating: "good" },
 *   // Per-form-factor (null if insufficient traffic for that form factor):
 *   mobile:  { lcp: {...}, cls: {...}, inp: {...} } | null,
 *   desktop: { lcp: {...}, cls: {...}, inp: {...} } | null,
 * }
 */

const ORIGIN = 'https://sugartown.io'
const CRUX_ENDPOINT = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord'

// CrUX rating thresholds (milliseconds for LCP/INP, unitless for CLS)
const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  cls: { good: 0.1,  poor: 0.25 },
  inp: { good: 200,  poor: 500 },
}

function rate(metric, value) {
  const t = THRESHOLDS[metric]
  if (!t || value == null) return null
  if (value <= t.good) return 'good'
  if (value <= t.poor) return 'needs-improvement'
  return 'poor'
}

async function fetchCruxRecord(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res
}

function parseMetrics(metrics) {
  function parseMetric(key, cruxKey) {
    const m = metrics[cruxKey]
    if (!m) return null
    const p75 = m.percentiles?.p75 ?? null
    return { p75, rating: rate(key, p75) }
  }
  return {
    lcp: parseMetric('lcp', 'largest_contentful_paint'),
    cls: parseMetric('cls', 'cumulative_layout_shift'),
    inp: parseMetric('inp', 'interaction_to_next_paint'),
  }
}

export async function collectCrux() {
  const key = process.env.CRUX_API_KEY
  const url  = key ? `${CRUX_ENDPOINT}?key=${key}` : CRUX_ENDPOINT

  const METRICS = ['largest_contentful_paint', 'cumulative_layout_shift', 'interaction_to_next_paint']

  // Fetch origin-blend (backward compat) + per-form-factor in parallel
  const [blendRes, mobileRes, desktopRes] = await Promise.all([
    fetchCruxRecord(url, { origin: ORIGIN, metrics: METRICS }),
    fetchCruxRecord(url, { origin: ORIGIN, formFactor: 'PHONE',   metrics: METRICS }),
    fetchCruxRecord(url, { origin: ORIGIN, formFactor: 'DESKTOP', metrics: METRICS }),
  ])

  if (blendRes.status === 403) {
    return { fetchedAt: new Date().toISOString(), origin: ORIGIN, available: false, reason: 'no-api-key' }
  }

  if (blendRes.status === 404) {
    return { fetchedAt: new Date().toISOString(), origin: ORIGIN, available: false, reason: 'no-data' }
  }

  if (!blendRes.ok) throw new Error(`CrUX API → ${blendRes.status}`)

  const blendData   = await blendRes.json()
  const blendMetrics = blendData.record?.metrics ?? {}
  const blend = parseMetrics(blendMetrics)

  // Per-form-factor: 404 = insufficient traffic for that form factor (common for desktop)
  async function parseFormFactor(res) {
    if (res.status === 404 || !res.ok) return null
    const data = await res.json()
    return parseMetrics(data.record?.metrics ?? {})
  }

  const [mobile, desktop] = await Promise.all([
    parseFormFactor(mobileRes),
    parseFormFactor(desktopRes),
  ])

  return {
    fetchedAt: new Date().toISOString(),
    origin:    ORIGIN,
    available: true,
    ...blend,
    mobile,
    desktop,
  }
}
