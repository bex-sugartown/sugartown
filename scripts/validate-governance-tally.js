#!/usr/bin/env node
/**
 * Governance tally derivation check (CTL-027).
 *
 *   pnpm validate:governance-tally
 *
 * Three things must agree, or `/platform/governance` publishes a number nothing
 * backs:
 *
 *   1. DERIVED  — counted from the six layer tables in governance-coverage.md
 *   2. STATED   — the `### Tally` block in that same doc
 *   3. PUBLISHED— the COVERAGE_TALLY array rendered by GovernanceDraftPage.jsx
 *
 * Why derivation rather than a cross-reference check: the drift that has already
 * happened is the page drifting from its source. GovernancePage.jsx cited
 * coverage-doc v1.1, a version that never existed, while the doc header read v1.0
 * and its changelog ran to v1.2. A check that recomputes the number from the rows
 * makes that class of drift impossible to ship rather than merely detectable.
 *
 * This checks that the three agree. It does NOT check that any status value is
 * still true — a component marked Strong whose control went inert still counts as
 * Strong here. That is the residual gap, recorded in CTL-027's Bypass cell and
 * tracked as CTL-028.
 *
 * SUG-256 Phase 3 (2026-08-02): the tally moved off `/platform/governance` to the
 * noindex `/platform/governance-draft`, so PAGE points at GovernanceDraftPage.jsx.
 * The liveness probe in validate-enforcement-liveness.js mutates the same file and
 * derives its injection from the value it finds there — if you move this array
 * again, both must follow it, or the harness reports the GATE inert when the
 * PROBE is what broke.
 *
 * Exit codes:
 *   0 — all three agree
 *   1 — any disagreement, or a source could not be parsed
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const COVERAGE = resolve(ROOT, 'docs/ai/agentic-caucus/governance-coverage.md')
const PAGE = resolve(ROOT, 'apps/web/src/pages/platform/GovernanceDraftPage.jsx')

/** Status value in the coverage doc → the label the page renders it under. */
const STATUS_TO_LABEL = {
  Strong: 'Automated checks',
  Partial: 'Documented checks',
  Inherited: 'Vendor-owned checks',
  'N/A': 'Out-of-scope checks',
}

const errors = []

// ─── 1. DERIVED — count statuses across the six layer tables ─────────────────
// A layer table starts at a `### Layer N` heading and ends at the next `###` or
// a horizontal rule. The status is the second cell. ⚠️ is a liveness annotation,
// not part of the value, so it is stripped.

function deriveFromLayerTables(src) {
  const counts = {}
  let inLayer = false

  for (const line of src.split('\n')) {
    if (/^### Layer /.test(line)) { inLayer = true; continue }
    if (/^### /.test(line) || /^---\s*$/.test(line)) { inLayer = false; continue }
    if (!inLayer || !line.startsWith('|')) continue

    const cells = line.split('|').map((c) => c.trim())
    if (cells.length < 4) continue

    const status = cells[2].replace(/⚠️/g, '').trim()
    if (!status || status === 'Status' || /^-+$/.test(status)) continue

    counts[status] = (counts[status] || 0) + 1
  }
  return counts
}

// ─── 2. STATED — the doc's own `### Tally` block ─────────────────────────────
// Rows read `| Strong (owned in code) | 18 |`, so the label is matched by prefix
// rather than equality.

function readStatedTally(src) {
  const start = src.indexOf('### Tally')
  if (start === -1) {
    errors.push('governance-coverage.md has no `### Tally` block')
    return null
  }
  const block = src.slice(start, src.indexOf('\n---', start))
  const stated = {}

  for (const line of block.split('\n')) {
    if (!line.startsWith('|')) continue
    const cells = line.split('|').map((c) => c.trim())
    if (cells.length < 4) continue
    const [, label, value] = cells
    if (!/^\d+$/.test(value)) continue

    const key = Object.keys(STATUS_TO_LABEL).find((s) => label.startsWith(s))
    if (key) stated[key] = Number(value)
    else if (label.startsWith('Gap')) stated.Gap = Number(value)
  }
  return stated
}

// ─── 3. PUBLISHED — COVERAGE_TALLY in GovernanceDraftPage.jsx ────────────────

function readPublishedTally(src) {
  const start = src.indexOf('const COVERAGE_TALLY')
  if (start === -1) {
    errors.push('GovernanceDraftPage.jsx has no `const COVERAGE_TALLY` — the page may have been restructured')
    return null
  }
  const block = src.slice(start, src.indexOf(']', start))
  const published = {}

  for (const m of block.matchAll(/label:\s*'([^']+)'[^}]*?value:\s*(\d+)/g)) {
    published[m[1]] = Number(m[2])
  }
  return published
}

// ─── Run ─────────────────────────────────────────────────────────────────────

for (const [label, path] of [['governance-coverage.md', COVERAGE], ['GovernanceDraftPage.jsx', PAGE]]) {
  if (!existsSync(path)) errors.push(`${label} not found at ${path}`)
}
if (errors.length) {
  console.error(`\n❌  ${errors.join('\n❌  ')}\n`)
  process.exit(1)
}

const coverageSrc = readFileSync(COVERAGE, 'utf8')
const derived = deriveFromLayerTables(coverageSrc)
const stated = readStatedTally(coverageSrc)
const published = readPublishedTally(readFileSync(PAGE, 'utf8'))

if (!stated || !published) {
  console.error(`\n❌  ${errors.join('\n❌  ')}\n`)
  process.exit(1)
}

const total = Object.values(derived).reduce((a, b) => a + b, 0)
if (total === 0) errors.push('No component rows found in the layer tables — the doc structure may have changed')

console.log('\n🧮  Sugartown Governance Tally Derivation')
console.log(`${'═'.repeat(46)}\n`)
console.log(`   ${'Status'.padEnd(12)} ${'derived'.padStart(8)} ${'stated'.padStart(7)} ${'published'.padStart(10)}\n`)

for (const [status, label] of Object.entries(STATUS_TO_LABEL)) {
  const d = derived[status] || 0
  const s = stated[status]
  const p = published[label]

  console.log(`   ${status.padEnd(12)} ${String(d).padStart(8)} ${String(s ?? '—').padStart(7)} ${String(p ?? '—').padStart(10)}`)

  if (s === undefined) errors.push(`\`${status}\` missing from the doc's ### Tally block`)
  else if (s !== d) errors.push(`\`${status}\`: doc's Tally says ${s}, layer tables give ${d}`)

  if (p === undefined) errors.push(`\`${label}\` missing from COVERAGE_TALLY in GovernanceDraftPage.jsx`)
  else if (p !== d) errors.push(`\`${label}\`: page publishes ${p}, layer tables give ${d}`)
}

// `Gap` is stated in the doc but has no page tile. Derive it so a Gap row
// appearing in a layer table cannot pass unnoticed.
const derivedGap = derived.Gap || 0
console.log(`   ${'Gap'.padEnd(12)} ${String(derivedGap).padStart(8)} ${String(stated.Gap ?? '—').padStart(7)} ${'n/a'.padStart(10)}`)
if (stated.Gap !== undefined && stated.Gap !== derivedGap) {
  errors.push(`\`Gap\`: doc's Tally says ${stated.Gap}, layer tables give ${derivedGap}`)
}

console.log(`\n${'─'.repeat(46)}`)
console.log(`   ${String(total).padStart(8)}  components counted\n`)

if (errors.length) {
  console.error(`❌  Governance tally does not agree across its three sources.\n`)
  for (const e of errors) console.error(`    • ${e}`)
  console.error(`\n    The layer tables are the source. Fix the doc's ### Tally block and`)
  console.error(`    COVERAGE_TALLY in GovernanceDraftPage.jsx to match what the rows say —`)
  console.error(`    do not edit the rows to match a published number.\n`)
  process.exit(1)
}

console.log(`✅  Derived, stated and published tallies agree across ${total} components.\n`)
