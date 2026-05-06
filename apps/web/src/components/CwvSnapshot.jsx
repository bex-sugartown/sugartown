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
 * Both sources currently lack form-factor split (single run). The toggle is rendered
 * but shows the same data for both until crux.js + perf.js are extended with
 * per-form-factor runs (SUG-100 Phase B pipeline work).
 *
 * Handles gracefully: stale perf data, unavailable CrUX, missing cwvUrl fallback.
 */
import { useState } from 'react'
import stats from '../generated/stats.json'
import ScoreRing from '../design-system/components/score-ring/ScoreRing'
import SegmentedControl from '../design-system/components/segmented-control/SegmentedControl'
import styles from './CwvSnapshot.module.css'

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
  if (value == null) return '—'
  const t = CWV_THRESHOLDS[key]
  if (key === 'cls') return value.toFixed(3)
  return `${Math.round(value)}${t.unit}`
}

function CwvTile({ metricKey, p75, rating: ratingOverride }) {
  const t = CWV_THRESHOLDS[metricKey]
  const rating = ratingOverride ?? cwvRating(metricKey, p75)
  const displayValue = formatCwvValue(metricKey, p75)
  return (
    <div className={[styles.cwvTile, rating && styles[`tile${rating.charAt(0).toUpperCase() + rating.slice(1)}`]].filter(Boolean).join(' ')}>
      <span className={styles.cwvTileLabel}>{t.label}</span>
      <span className={styles.cwvTileValue}>{displayValue}</span>
      <span className={styles.cwvTileDesc}>{t.desc}</span>
      {rating && <span className={`${styles.cwvTileBadge} ${styles[`badge${rating.charAt(0).toUpperCase() + rating.slice(1)}`]}`}>{rating === 'warn' ? 'needs work' : rating}</span>}
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
  const perfData = stats.perf
  const perfRuns = perfData?.runs ?? {}
  // Resolve URL key: prefer section.cwvUrl, fall back to the first available run
  const origin = 'https://sugartown.io'
  const runKey = cwvUrl ?? origin
  // Per-form-factor runs will be at runs[key].mobile / runs[key].desktop once
  // perf.js is extended. For now fall through to flat run.
  const runFlat = perfRuns[runKey] ?? perfRuns[origin] ?? null
  const runForFormFactor = runFlat?.mobile ?? runFlat?.desktop ?? runFlat
  const perfAvailable = !perfData?.stale && runForFormFactor != null

  // ── CrUX (field data) ──────────────────────────────────────────────────────
  const cruxData = stats.crux
  // Per-form-factor: crux.mobile / crux.desktop when extended; fall through to flat
  const cruxForFormFactor = cruxData?.[formFactor] ?? cruxData
  const cruxAvailable = cruxData?.available === true

  return (
    <div className={styles.root}>
      {/* Form-factor toggle */}
      <div className={styles.toggleRow}>
        <SegmentedControl
          options={FORM_FACTOR_OPTIONS}
          value={formFactor}
          onChange={setFormFactor}
          aria-label="Form factor"
          variant="pill"
        />
      </div>

      {/* Score rings — Lighthouse lab scores */}
      <div className={styles.ringsSection}>
        <span className={styles.sourceLabel}>Lighthouse lab scores</span>
        {perfAvailable ? (
          <div className={styles.ringGrid}>
            <ScoreRing score={runForFormFactor.performance ?? 0}   label="Performance" />
            <ScoreRing score={runForFormFactor.accessibility ?? 0} label="Accessibility" />
            <ScoreRing score={runForFormFactor.bestPractices ?? runForFormFactor.seo ?? 0} label="Best Practices" />
            <ScoreRing score={runForFormFactor.seo ?? 0}           label="SEO" />
          </div>
        ) : (
          <DataUnavailable reason="no-lhci" />
        )}
      </div>

      {/* CWV tiles — Chrome UX Report field data */}
      <div className={styles.cwvSection}>
        <span className={styles.sourceLabel}>Chrome UX Report — p75 field data</span>
        {cruxAvailable ? (
          <div className={styles.cwvGrid}>
            {['lcp', 'cls', 'inp'].map((key) => (
              <CwvTile
                key={key}
                metricKey={key}
                p75={cruxForFormFactor?.[key]?.p75}
                rating={cruxForFormFactor?.[key]?.rating}
              />
            ))}
          </div>
        ) : (
          <DataUnavailable reason="no-crux" />
        )}
      </div>

      {/* Timestamp */}
      {(perfData?.generatedAt || cruxData?.fetchedAt) && (
        <p className={styles.timestamp}>
          Data collected {new Date(perfData?.generatedAt ?? cruxData?.fetchedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}
