#!/usr/bin/env node
/**
 * Mean Time To Notice — computed from the incident log.
 *
 * The industry tracks MTTR (Mean Time To Recovery): how fast you fix what you already know
 * about. It says nothing about how long you did not know. This reports the other half.
 *
 * Source of truth: docs/ai/agentic-caucus/incident-log.md — hand-authored, machine-read.
 * Deliberately NOT named validate:* — it reports, it does not gate. Prefixing it validate:
 * would make validate:validators demand it be wired to a hook, which would be a lie about
 * what it does.
 *
 * Usage:  pnpm mttn            human-readable table
 *         pnpm mttn --json     machine output, for the GovernancePage tally
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LEDGER = join(REPO_ROOT, 'docs/ai/agentic-caucus/incident-log.md')

/** Entries look like:
 *    ### INC-011 — title
 *    **Introduced:** 2026-02-01 · **Noticed:** 2026-07-27 · **Severity:** High
 *    **Failure mode:** FM-X-02 (...) · **Found by:** investigation
 */
function parseLedger(src) {
  const out = []
  const blocks = src.split(/^### /m).slice(1)

  for (const block of blocks) {
    const id = block.match(/^(INC-\d+)/)?.[1]
    if (!id) continue

    const title = block.split('\n')[0].replace(/^INC-\d+\s*—\s*/, '').trim()
    const introduced = block.match(/\*\*Introduced:\*\*\s*(~?)(\d{4}-\d{2}-\d{2}|unknown)/)
    const noticed = block.match(/\*\*Noticed:\*\*\s*(\d{4}-\d{2}-\d{2})/)
    const severity = block.match(/\*\*Severity:\*\*\s*(\w+)/)?.[1] ?? '?'
    const foundBy = block.match(/\*\*Found by:\*\*\s*([^\n·]+)/)?.[1]?.trim() ?? '?'

    if (!introduced || !noticed) {
      console.error(`  ⚠️  ${id}: missing Introduced or Noticed — skipped`)
      continue
    }

    const approx = introduced[1] === '~'
    const known = introduced[2] !== 'unknown'
    const days = known
      ? Math.round((Date.parse(noticed[1]) - Date.parse(introduced[2])) / 86_400_000)
      : null

    out.push({ id, title, severity, foundBy, approx, days })
  }
  return out
}

function median(ns) {
  const s = [...ns].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

const entries = parseLedger(readFileSync(LEDGER, 'utf8'))
const measurable = entries.filter((e) => e.days !== null)
const days = measurable.map((e) => e.days)

if (!days.length) {
  console.error('No measurable incidents found. Has the ledger format changed?')
  process.exit(1)
}

const byGate = entries.filter((e) => e.foundBy === 'automated gate').length
const stats = {
  incidents: entries.length,
  measurable: measurable.length,
  unmeasurable: entries.length - measurable.length,
  meanDays: Math.round(days.reduce((a, b) => a + b, 0) / days.length),
  medianDays: median(days),
  longestDays: Math.max(...days),
  shortestDays: Math.min(...days),
  caughtByGate: `${byGate} of ${entries.length}`,
  foundBy: entries.reduce((acc, e) => ({ ...acc, [e.foundBy]: (acc[e.foundBy] ?? 0) + 1 }), {}),
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(stats, null, 2))
  process.exit(0)
}

console.log('\n⏱   Mean Time To Notice — Sugartown incident ledger')
console.log('══════════════════════════════════════════════\n')

for (const e of [...measurable].sort((a, b) => b.days - a.days)) {
  const d = `${e.days}${e.approx ? '~' : ''}`.padStart(5)
  console.log(`  ${d}d  ${e.id}  ${e.title.slice(0, 52).padEnd(54)}${e.foundBy}`)
}
for (const e of entries.filter((x) => x.days === null)) {
  console.log(`      —  ${e.id}  ${e.title.slice(0, 52).padEnd(54)}${e.foundBy} (introduced unknown)`)
}

console.log(`\n  MEAN TIME TO NOTICE   ${stats.meanDays} days`)
console.log(`  MEDIAN                ${stats.medianDays} days`)
console.log(`  RANGE                 ${stats.shortestDays}–${stats.longestDays} days`)
console.log(`  CAUGHT BY A GATE      ${stats.caughtByGate}`)
console.log(`\n  n = ${stats.measurable} measurable of ${stats.incidents} logged` +
  (stats.unmeasurable ? ` (${stats.unmeasurable} with an unknown introduction date, excluded rather than guessed)` : ''))
console.log('\n  Found by:', Object.entries(stats.foundBy).map(([k, v]) => `${k} ${v}`).join(' · '))
console.log('')
