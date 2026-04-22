/**
 * crux.js — crux namespace collector (SUG-67)
 *
 * Fetches Chrome UX Report (CrUX) origin-level data from the public API.
 * No authentication required — uses a free-tier public API key if provided,
 * falls back to unauthenticated request.
 *
 * CrUX only returns data for origins with sufficient traffic. If the origin
 * has no data yet, the collector returns { available: false, stale: false }.
 *
 * Output shape:
 * {
 *   fetchedAt: "2026-04-22T...",
 *   origin: "https://sugartown.io",
 *   available: true,
 *   lcp: { p75: 2100, rating: "good" },
 *   cls: { p75: 0.04, rating: "good" },
 *   inp: { p75: 180, rating: "good" }
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

export async function collectCrux() {
  const key = process.env.CRUX_API_KEY
  const url  = key ? `${CRUX_ENDPOINT}?key=${key}` : CRUX_ENDPOINT

  const body = JSON.stringify({
    origin: ORIGIN,
    metrics: ['largest_contentful_paint', 'cumulative_layout_shift', 'interaction_to_next_paint'],
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (res.status === 403) {
    // No API key or key lacks CrUX access — requires CRUX_API_KEY env var
    return { fetchedAt: new Date().toISOString(), origin: ORIGIN, available: false, reason: 'no-api-key' }
  }

  if (res.status === 404) {
    // Origin not in CrUX dataset (insufficient traffic)
    return { fetchedAt: new Date().toISOString(), origin: ORIGIN, available: false, reason: 'no-data' }
  }

  if (!res.ok) throw new Error(`CrUX API → ${res.status}`)

  const data = await res.json()
  const metrics = data.record?.metrics ?? {}

  function parseMetric(key, cruxKey) {
    const m = metrics[cruxKey]
    if (!m) return null
    const p75 = m.percentiles?.p75 ?? null
    return { p75, rating: rate(key, p75) }
  }

  return {
    fetchedAt: new Date().toISOString(),
    origin:    ORIGIN,
    available: true,
    lcp: parseMetric('lcp', 'largest_contentful_paint'),
    cls: parseMetric('cls', 'cumulative_layout_shift'),
    inp: parseMetric('inp', 'interaction_to_next_paint'),
  }
}
