#!/usr/bin/env node
/**
 * validate-epic-docs.js — every non-Done Linear issue gets a backlog doc + a
 * priority-stack row (SUG-262, CTL-024).
 *
 *   pnpm validate:epic-docs
 *
 * `/new-epic` is the only path that produces a `docs/backlog/SUG-{N}-*.md` stub
 * and a `docs/backlog/sugartown-backlog-priorities.md` row. It runs at the start
 * of an epic, never mid-epic when a finding spawns a new issue. Six issues were
 * spun off that way between 2026-07-27 15:54 and 2026-07-28 12:44 with neither
 * artifact — one of them (SUG-256) then shipped work outside its stated Linear
 * scope, because no doc meant no Pre-Execution Completeness Gate to bound it.
 *
 * Data source: reuses `apps/web/scripts/stats/linear.js`'s `collectLinear()`
 * rather than a second Linear API client. That module already has the graceful
 * degradation this gate needs — missing `LINEAR_API_KEY` or an API failure
 * returns `{ stale: true }` instead of throwing.
 *
 * SKIPPED is not the same as PASS. If Linear data could not be fetched, this
 * script exits 0 but prints a GitHub Actions `::warning::` annotation and a
 * loud SKIPPED line — an honest "could not check", not a silent green. A
 * missing LINEAR_API_KEY that read as a pass would recreate exactly the failure
 * shape this whole validator chain exists to close: a gate reporting healthy
 * while checking nothing (INC-007, INC-010, INC-011).
 *
 * Nine historical orphans (SUG-164, 168, 169, 202, 233, 234, 235, 236, 237, all
 * pre-dating this gate) are allowlisted per SUG-262's own Non-Goals ("retrofitting
 * older orphans... out of scope here"). The allowlist self-prunes: an entry that
 * now has both artifacts is flagged as stale, so it does not silently outlive the
 * gap it was covering — same shape as validate-dead-refs.js's KNOWN_DEAD check.
 *
 * Exit codes:
 *   0 — every non-Done issue has both artifacts, or the check was SKIPPED (no
 *       live Linear data)
 *   1 — at least one non-Done issue is missing a backlog doc or a priority row
 */

import { readFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { collectLinear } from '../apps/web/scripts/stats/linear.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const BACKLOG_DIR = resolve(ROOT, 'docs/backlog')
const SHIPPED_DIR = resolve(ROOT, 'docs/shipped')
const PRIORITIES_FILE = resolve(ROOT, 'docs/backlog/sugartown-backlog-priorities.md')

// Historical orphans pre-dating this gate (SUG-262 Non-Goals: no retrofit).
// Measured 2026-08-04: all nine still non-Done in Linear.
const ALLOWLIST = new Set([
  'SUG-164', 'SUG-168', 'SUG-169', 'SUG-202',
  'SUG-233', 'SUG-234', 'SUG-235', 'SUG-236', 'SUG-237',
])

function docExists(identifier) {
  for (const dir of [BACKLOG_DIR, SHIPPED_DIR]) {
    const hit = readdirSync(dir).some((f) => f.startsWith(`${identifier}-`) && f.endsWith('.md'))
    if (hit) return true
  }
  return false
}

function hasPriorityRow(identifier, prioritiesText) {
  // Word-boundary match: \b prevents SUG-25 from matching inside SUG-256 — the
  // digit sequence's own edges are the only place a \b can fall.
  return new RegExp(`\\b${identifier}\\]`).test(prioritiesText)
}

async function main() {
  const data = await collectLinear()

  if (data.stale) {
    console.log('⚠️   validate:epic-docs — SKIPPED')
    console.log('   Could not reach Linear (missing LINEAR_API_KEY or API failure).')
    console.log('   This is NOT a pass: no issue was checked against docs/backlog/.')
    console.log('::warning::validate:epic-docs SKIPPED — Linear unreachable, no issues were checked')
    process.exit(0)
  }

  const prioritiesText = readFileSync(PRIORITIES_FILE, 'utf8')
  const nonDone = [...data.inProgress, ...data.backlog]

  const missing = []
  const staleAllowlist = []

  for (const issue of nonDone) {
    const hasDoc = docExists(issue.identifier)
    const hasRow = hasPriorityRow(issue.identifier, prioritiesText)

    if (ALLOWLIST.has(issue.identifier)) {
      if (hasDoc && hasRow) staleAllowlist.push(issue.identifier)
      continue
    }

    if (!hasDoc || !hasRow) {
      missing.push({
        identifier: issue.identifier,
        title: issue.title,
        url: issue.url,
        missingDoc: !hasDoc,
        missingRow: !hasRow,
      })
    }
  }

  console.log(`🔗  Sugartown Linear ↔ Backlog Doc Parity`)
  console.log('══════════════════════════════════════════════\n')
  console.log(`   Checked ${nonDone.length} non-Done issue(s), ${ALLOWLIST.size} allowlisted (historical)\n`)

  if (staleAllowlist.length > 0) {
    console.log(`   ⚠️   ${staleAllowlist.length} allowlist entr${staleAllowlist.length === 1 ? 'y' : 'ies'} now ha${staleAllowlist.length === 1 ? 's' : 've'} both artifacts and should be removed from ALLOWLIST:`)
    for (const id of staleAllowlist) console.log(`        ${id}`)
    console.log('')
  }

  if (missing.length === 0) {
    console.log('✅  Every non-Done issue has a backlog doc and a priority-stack row.')
    process.exit(0)
  }

  console.log(`❌  ${missing.length} issue(s) missing required artifacts:\n`)
  for (const m of missing) {
    const gaps = [m.missingDoc && 'no docs/backlog or docs/shipped stub', m.missingRow && 'no priority-stack row']
      .filter(Boolean)
      .join(', ')
    console.log(`   ${m.identifier} — ${m.title}`)
    console.log(`      ${gaps}`)
    console.log(`      ${m.url}\n`)
  }
  process.exit(1)
}

main().catch((err) => {
  console.error(`validate:epic-docs errored: ${err.message}`)
  process.exit(1)
})
