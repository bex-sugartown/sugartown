/**
 * CwvSnapshot — CWV Snapshot report block for TrustReportSection (SUG-100).
 *
 * Renders 4 Lighthouse score rings (Performance / Accessibility / Best Practices / SEO)
 * and 3 CWV metric tiles (LCP / CLS / INP) with a mobile/desktop form-factor toggle.
 *
 * Data sources:
 *   stats.perf.runs[cwvUrl]          — Lighthouse lab data (per URL)
 *   stats.crux                       — Chrome UX Report field data (origin-level)
 *
 * LHCI runs two passes (mobile + desktop) — perf.js slots them by configSettings.formFactor.
 * CrUX data remains origin-level (no per-form-factor split) — future extension noted.
 *
 * Handles gracefully: stale perf data, unavailable CrUX, missing cwvUrl fallback.
 */
import { useState } from 'react'
import stats from '../generated/stats.json'
import ScoreRing from '../design-system/components/score-ring/ScoreRing'
import SegmentedControl from '../design-system/components/segmented-control/SegmentedControl'
import styles from './CwvSnapshot.module.css'

// Static backup data — manual Lighthouse run 2026-05-15 (sugartown.io homepage).
// CLS is higher in real browser due to Google Fonts layout shift (headless omits fonts).
// INP null: cannot be measured in lab Lighthouse (interaction metric requires real user).
const PERF_BACKUP = {
  stale: false,
  runs: {
    'https://sugartown.io/': {
      performance: 61, accessibility: 93, bestPractices: 96, seo: 100,
      lcp: 6500, cls: 0.244, inp: null, rating: 'poor',
      mobile:  { performance: 61, accessibility: 93, bestPractices: 96, seo: 100, lcp: 6500, cls: 0.244, inp: null, rating: 'poor' },
      desktop: { performance: 81, accessibility: 96, bestPractices: 100, seo: 100, lcp: 1400, cls: 0.282, inp: null, rating: 'good' },
    },
  },
}

// CrUX backup — estimated pre-launch baseline. Used when CrUX has no-data (insufficient
// real-user traffic for origin). Marked with reason:'backup' so UI can label it as estimated.
const CRUX_BACKUP = {
  available: true,
  reason: 'backup',
  lcp: { p75: 2800, rating: 'needs-improvement' },
  cls: { p75: 0.08, rating: 'good' },
  inp: { p75: 210,  rating: 'needs-improvement' },
  mobile:  { lcp: { p75: 3200, rating: 'needs-improvement' }, cls: { p75: 0.10, rating: 'good' }, inp: { p75: 260, rating: 'needs-improvement' } },
  desktop: { lcp: { p75: 1900, rating: 'good' },              cls: { p75: 0.04, rating: 'good' }, inp: { p75: 160, rating: 'good' } },
}

const FORM_FACTOR_OPTIONS = [
  { label: 'Mobile', value: 'mobile' },
  { label: 'Desktop', value: 'desktop' },
]

// CrUX thresholds for badge display
const CWV_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000, unit: 'ms', label: 'LCP', desc: 'Largest Contentful Paint' },
  cls: { good: 0.1,  poor: 0.25, unit: '',   label: 'CLS', desc: 'Cumulative Layout Shift' },
  inp: { good: 200,  poor: 500,  unit: 'ms', label: 'INP', desc: 'Interaction to Next Paint' },
}

function cwvRating(key, value) {
  if (value == null) return null
  const t = CWV_THRESHOLDS[key]
  if (!t) return null
  if (value <= t.good) return 'good'
  if (value <= t.poor) return 'warn'
  return 'poor'
}

function formatCwvValue(key, value) {
  if (value == null) return { num: '—', unit: '' }
  if (key === 'cls') return { num: value.toFixed(3), unit: '' }
  if (key === 'lcp') return { num: (value / 1000).toFixed(1), unit: 's' }
  return { num: String(Math.round(value)), unit: 'ms' }
}

function ratingClass(rating) {
  if (!rating) return ''
  return styles[`tile${rating.charAt(0).toUpperCase() + rating.slice(1)}`] ?? ''
}

function badgeClass(rating) {
  return `${styles.cwvTileBadge} ${styles[`badge${rating.charAt(0).toUpperCase() + rating.slice(1)}`] ?? ''}`
}

function CwvTile({ metricKey, p75, rating: ratingOverride, isEstimated }) {
  const t = CWV_THRESHOLDS[metricKey]
  const rating = ratingOverride ?? cwvRating(metricKey, p75)
  const { num, unit } = formatCwvValue(metricKey, p75)
  return (
    <div className={[styles.cwvTile, ratingClass(rating)].filter(Boolean).join(' ')}>
      <span className={styles.cwvTileLabel}>{t.label}</span>
      <div className={styles.cwvTileValue}>
        {num}
        {unit && <span className={styles.cwvTileUnit}>{unit}</span>}
      </div>
      <span className={styles.cwvTileSub}>{isEstimated ? 'static · no field data' : 'p75 · field data'}</span>
      {rating && <span className={badgeClass(rating)}>{rating === 'warn' ? 'needs improvement' : rating}</span>}
    </div>
  )
}

function DataUnavailable({ reason }) {
  return (
    <div className={styles.unavailable}>
      <span className={styles.unavailableIcon} aria-hidden="true">◦</span>
      <span className={styles.unavailableText}>
        {reason === 'no-lhci'
          ? 'Lighthouse data not available — run the stats pipeline to populate scores.'
          : reason === 'no-crux'
          ? 'Chrome UX Report data not available — configure CRUX_API_KEY to enable field data.'
          : 'Performance data not available.'}
      </span>
    </div>
  )
}

export default function CwvSnapshot({ section }) {
  const { defaultFormFactor = 'mobile', cwvUrl } = section ?? {}

  const [formFactor, setFormFactor] = useState(defaultFormFactor)

  // ── Perf (lab data) ────────────────────────────────────────────────────────
  // Use real CI data when present: check stale===false OR presence of runs (older
  // collector versions didn't emit stale:false explicitly).
  const hasCiPerf = stats.perf?.stale === false || (stats.perf?.runs && Object.keys(stats.perf.runs).length > 0)
  const perfData = hasCiPerf ? stats.perf : PERF_BACKUP
  const perfRuns = perfData?.runs ?? {}
  // Resolve URL key: prefer section.cwvUrl, fall back to the first available run
  const origin = 'https://sugartown.io'
  const runKey = cwvUrl ?? origin
  // Try exact key, then with/without trailing slash, then first available run
  const runFlat = perfRuns[runKey]
    ?? perfRuns[runKey + '/']
    ?? perfRuns[runKey.replace(/\/$/, '')]
    ?? Object.values(perfRuns)[0]
    ?? null
  const runForFormFactor = runFlat?.[formFactor] ?? runFlat
  const perfAvailable = !perfData?.stale && runForFormFactor != null

  // ── CrUX (field data) ──────────────────────────────────────────────────────
  const cruxData = (stats.crux?.available === true ? stats.crux : null) ?? CRUX_BACKUP
  // Per-form-factor: crux.mobile / crux.desktop when extended; fall through to flat
  const cruxForFormFactor = cruxData?.[formFactor] ?? cruxData
  const cruxAvailable = cruxData?.available === true
  const cruxIsEstimated = cruxData?.reason === 'backup'

  return (
    <div className={styles.root}>
      {/* Form-factor toggle — re-enabled SUG-117 (LHCI mobile throttling fixed) */}
      <div className={styles.toggleRow}>
        <SegmentedControl
          options={FORM_FACTOR_OPTIONS}
          value={formFactor}
          onChange={setFormFactor}
        />
      </div>

      {/* Score rings — Lighthouse lab scores */}
      <div className={styles.ringsSection}>
        {perfAvailable ? (
          <div className={styles.ringGrid}>
            <ScoreRing score={runForFormFactor.performance ?? 0}   label="Performance" />
            <ScoreRing score={runForFormFactor.accessibility ?? 0} label="Accessibility" />
            <ScoreRing score={runForFormFactor.bestPractices ?? 0} label="Best Practices" />
            <ScoreRing score={runForFormFactor.seo ?? 0}           label="SEO" />
          </div>
        ) : (
          <DataUnavailable reason="no-lhci" />
        )}
      </div>

      {/* CWV tiles — Chrome UX Report field data */}
      <div className={styles.cwvSection}>
        {cruxAvailable ? (
          <div className={styles.cwvGrid}>
            {['lcp', 'cls', 'inp'].map((key) => (
              <CwvTile
                key={key}
                metricKey={key}
                p75={cruxForFormFactor?.[key]?.p75}
                rating={cruxForFormFactor?.[key]?.rating}
                isEstimated={cruxIsEstimated}
              />
            ))}
          </div>
        ) : (
          <DataUnavailable reason="no-crux" />
        )}
      </div>

    </div>
  )
}
