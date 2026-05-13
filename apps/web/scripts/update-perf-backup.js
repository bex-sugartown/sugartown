#!/usr/bin/env node
/**
 * update-perf-backup.js — patch PERF_BACKUP in CwvSnapshot.jsx with latest LHCI results
 *
 * Usage:
 *   pnpm exec lhci autorun          # run Lighthouse CI first
 *   pnpm --filter web update:backup  # then run this
 *
 * Or from the repo root:
 *   pnpm lhci:update-backup
 *
 * What it does:
 *   1. Reads .lighthouseci/*.json (same logic as perf.js)
 *   2. Builds the PERF_BACKUP object
 *   3. Replaces the const block in CwvSnapshot.jsx in-place
 *   4. Prints a summary — you review and commit
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LHCI_DIR  = resolve(__dirname, '../../../.lighthouseci')
const CWV_FILE  = resolve(__dirname, '../src/components/CwvSnapshot.jsx')

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
  const cfg = result.configSettings ?? {}
  if (cfg.emulatedFormFactor) return cfg.emulatedFormFactor
  if (cfg.formFactor)         return cfg.formFactor
  if (cfg.screenEmulation?.disabled === true) return 'desktop'
  return null
}

function extractRunData(result) {
  const cats   = result.categories  || {}
  const audits = result.audits      || {}
  const lcp = audits['largest-contentful-paint']?.numericValue ?? null
  const cls = audits['cumulative-layout-shift']?.numericValue  ?? null
  const inp = audits['interaction-to-next-paint']?.numericValue ?? null
  return {
    performance:   cats.performance?.score    != null ? Math.round(cats.performance.score    * 100) : null,
    accessibility: cats.accessibility?.score  != null ? Math.round(cats.accessibility.score  * 100) : null,
    bestPractices: cats['best-practices']?.score != null ? Math.round(cats['best-practices'].score * 100) : null,
    seo:           cats.seo?.score            != null ? Math.round(cats.seo.score            * 100) : null,
    lcp:  lcp != null ? Math.round(lcp) : null,
    cls:  cls != null ? Math.round(cls * 1000) / 1000 : null,
    inp:  inp != null ? Math.round(inp) : null,
    rating: lcp != null ? cwvRating('lcp', lcp) : null,
  }
}

// ── Read LHCI results ──────────────────────────────────────────────────────

let files
try {
  files = readdirSync(LHCI_DIR).filter(f => f.endsWith('.json') && !f.startsWith('manifest'))
} catch {
  console.error(`\n✗  .lighthouseci/ not found at ${LHCI_DIR}`)
  console.error('   Run: pnpm exec lhci autorun   (from repo root)\n')
  process.exit(1)
}

if (files.length === 0) {
  console.error(`\n✗  No JSON result files in ${LHCI_DIR}`)
  console.error('   Run: pnpm exec lhci autorun   (from repo root)\n')
  process.exit(1)
}

// Group latest file per (url, formFactor)
const byKey = new Map()
for (const file of files) {
  try {
    const result = JSON.parse(readFileSync(join(LHCI_DIR, file), 'utf-8'))
    const url = result.finalUrl || result.requestedUrl
    if (!url) continue
    const ff  = extractFormFactor(result) ?? ''
    const key = `${url}::${ff}`
    const existing = byKey.get(key)
    if (!existing || file > existing.file) byKey.set(key, { file, result, url, ff })
  } catch { /* empty */ }
}

// Build runs object
const runs = {}
for (const { result, url, ff } of byKey.values()) {
  const data = extractRunData(result)
  if (!runs[url]) runs[url] = {}
  if (ff === 'mobile')        runs[url].mobile  = data
  else if (ff === 'desktop')  runs[url].desktop = data
  else                        Object.assign(runs[url], data)
}

// Mirror flat fields from form-factor if no flat data present
for (const [url, run] of Object.entries(runs)) {
  if (run.performance == null) {
    const src = run.mobile ?? run.desktop
    if (src) Object.assign(runs[url], src)
  }
}

if (Object.keys(runs).length === 0) {
  console.error('\n✗  Could not parse any valid Lighthouse results.\n')
  process.exit(1)
}

// ── Serialise PERF_BACKUP constant ────────────────────────────────────────

const date = new Date().toISOString().slice(0, 10)

function fmtRunData(d, indent) {
  const _pad = ' '.repeat(indent)
  return `{ performance: ${d.performance}, accessibility: ${d.accessibility}, bestPractices: ${d.bestPractices}, seo: ${d.seo}, lcp: ${d.lcp}, cls: ${d.cls}, inp: ${d.inp}, rating: '${d.rating}' }`
}

let runsStr = ''
for (const [url, run] of Object.entries(runs)) {
  const mobileStr  = run.mobile  ? fmtRunData(run.mobile,  0)  : 'null'
  const desktopStr = run.desktop ? fmtRunData(run.desktop, 0) : 'null'
  // flat fields
  const flat = `performance: ${run.performance}, accessibility: ${run.accessibility}, bestPractices: ${run.bestPractices}, seo: ${run.seo}, lcp: ${run.lcp}, cls: ${run.cls}, inp: ${run.inp}, rating: '${run.rating}'`
  runsStr += `    '${url}': {\n`
  runsStr += `      ${flat},\n`
  runsStr += `      mobile:  ${mobileStr},\n`
  runsStr += `      desktop: ${desktopStr},\n`
  runsStr += `    },\n`
}

const newConst =
`// Static backup data — last-known-good values from ${date} run.
// Update after each successful stats pipeline run.
const PERF_BACKUP = {
  stale: false,
  runs: {
${runsStr.trimEnd()}
  },
}`

// ── Patch CwvSnapshot.jsx ──────────────────────────────────────────────────

const src = readFileSync(CWV_FILE, 'utf-8')

// Match from the comment line through the closing `}` of the const
const BACKUP_RE = /\/\/ Static backup data[\s\S]*?^const PERF_BACKUP[\s\S]*?^}/m

if (!BACKUP_RE.test(src)) {
  console.error('\n✗  Could not locate PERF_BACKUP block in CwvSnapshot.jsx — pattern mismatch.\n')
  process.exit(1)
}

const updated = src.replace(BACKUP_RE, newConst)
writeFileSync(CWV_FILE, updated, 'utf-8')

// ── Summary ───────────────────────────────────────────────────────────────

console.log('\n✓  PERF_BACKUP updated in CwvSnapshot.jsx\n')
console.log(`   Date: ${date}`)
console.log(`   URLs: ${Object.keys(runs).length}`)
for (const [url, run] of Object.entries(runs)) {
  const path = url.replace('https://sugartown.io', '') || '/'
  const mob  = run.mobile  ? `mobile perf ${run.mobile.performance}` : ''
  const desk = run.desktop ? `desktop perf ${run.desktop.performance}` : ''
  console.log(`   ${path.padEnd(30)} ${mob}  ${desk}`)
}
console.log('\n   Review the diff, then:\n   git add apps/web/src/components/CwvSnapshot.jsx')
console.log('   git commit -m "chore(stats): update PERF_BACKUP from LHCI run"\n')
