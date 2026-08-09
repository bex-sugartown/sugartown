#!/usr/bin/env node
/**
 * validate-doc-budget.js — is the session-loaded instruction surface growing?
 *
 * Every session reads CLAUDE.md in full, plus whichever docs/conventions/ files
 * it points at. That whole set is the budget. This script measures it and fails
 * when it exceeds a cap.
 *
 * Two design choices, both made because the obvious version does not work.
 *
 * WORDS, NOT LINES. A line cap is met by pressing Enter less. When SUG-243's
 * verification review ran (2026-07-29), 322 of CLAUDE.md's 907 lines were blank
 * — collapsing them alone would have satisfied an "under 650 lines" target with
 * zero content removed. Words track what a reader actually has to get through.
 *
 * THE SURFACE, NOT ONE FILE. Capping CLAUDE.md alone is met by moving text into
 * docs/conventions/, which a session then follows a link to and reads anyway.
 * At the time of writing CLAUDE.md linked to 11 conventions files carrying 8,902
 * words against its own 12,855, so the escape hatch was larger than two-thirds of
 * the thing being capped. SUG-243's own method for hitting its target *is*
 * relocation, so a single-file cap would have scored the epic a success for doing
 * nothing.
 *
 * The reference list is parsed out of CLAUDE.md at runtime, never hardcoded. A
 * hardcoded list drifts, and drift between two declarations of the same fact is
 * most of this repo's incident log. An unresolvable reference is a hard failure
 * rather than a skipped file: silently dropping a file from the denominator is
 * the exact escape this gate exists to close.
 *
 * KNOWN BYPASS, recorded rather than solved: ~/.claude/projects/.../MEMORY.md is
 * auto-loaded into every session from outside the repo. No repo-side cap can
 * reach it. See CTL-025.
 *
 * Usage:
 *   pnpm validate:doc-budget
 *   pnpm validate:doc-budget --json
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** The document every session reads in full. The root of the surface. */
const ROOT_DOC = 'CLAUDE.md'

/**
 * Word budget for the whole surface.
 *
 * Raised to 26,000 at AOP-1 Phase 1 (2026-08-09), superseding the 20,150 set at
 * SUG-243 Phase 3 (achieved-plus-5% against 19,187 measured 2026-07-30).
 *
 * Derivation, all measured 2026-08-09, none copied:
 *
 *   19,946   current total          `pnpm validate:doc-budget`
 * +  5,419   technical-doc-style-guide.md, which AOP-3 (PRD §7 V2) must deliver
 *            into the session surface to close finding C2
 *            `wc -w docs/conventions/technical-doc-style-guide.md`
 * = 25,365
 * +    635   margin
 * = 26,000
 *
 * This is a raise, not a suspension — PRD §10 B1 offered both and §B1's caveat
 * argues the raise: suspending removes the only measurement of the instruction
 * surface during exactly the period AOP-3 restructures it.
 *
 * Reproduce with `pnpm validate:doc-budget`. Tighten only against a fresh
 * measurement, never an estimate: a cap set below the current total makes the
 * gate red on landing and `gateProbe` reports PROBE INVALID rather than proving
 * anything.
 */
const CAP_WORDS = 26_000

/**
 * Decision-point cap — added 2026-08-05.
 *
 * Words measure how much a session must read. They do not measure how many
 * times it must stop and decide, and those are different failure modes.
 * SUG-243's friction line records the rule-file write gate holding six times in
 * one session and being skipped on the seventh, with the explicit note that
 * "the wording was not at fault". That is a count failure, invisible to a word
 * cap: rewriting a gate more tersely reduces words and leaves the number of
 * stops unchanged.
 *
 * Measured 2026-08-05 by this script: 24 stops (16 in CLAUDE.md, 7 in
 * design-handoff-template.md, 1 in usage-doc-style-guide.md). Cap was 26 —
 * the achieved figure plus ~10%, the same method as CAP_WORDS.
 *
 * **Re-derived 2026-08-09 at AOP-1 Phase 1: 25 stops, cap 28.** The count rose
 * by one because `countDecisionPoints` was fixed to match `hard-stop` as well
 * as `hard stop`; the gate it had been missing since the counter was written is
 * `### Phase 0 hard-stop (visual spec gate)`. Nothing was added to the surface —
 * the stop was always there and was not being counted. 25 + ~10% = 28.
 *
 * The count remains a floor, not a total: five gate headings carry neither
 * keyword and stay invisible (listed in `countDecisionPoints`).
 *
 * **This cap has no probe.** The liveness probe for this gate pads *words* only,
 * so the stop half is unexercised — and AOP-1 Phase 2 rewrites the very heading
 * text this counter matches on, which could collapse the count toward zero while
 * the gate reports headroom. Tracked as AOP-1 review blocker B-4; do not run
 * Phase 2 before it is closed.
 *
 * Reproduce with `pnpm validate:doc-budget`. Tighten only against a fresh
 * measurement, never an estimate — a cap below the current total makes the gate
 * red on landing, and `gateProbe` then reports PROBE INVALID rather than proving
 * anything. A cap set far above the total is the opposite failure and just as
 * useless: the first draft of this constant was 60, which left 36 stops of
 * headroom and could never have fired.
 */
const CAP_DECISIONS = 28

/** Files matching this are part of the surface when CLAUDE.md references them. */
const REFERENCE_PATTERN = /docs\/conventions\/[a-z0-9-]+\.md/g

/** Count words the way `wc -w` does: runs of non-whitespace. */
function countWords(text) {
  const trimmed = text.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}

/**
 * Count the places a session has to stop and make a call: a declared gate, or a
 * checklist item it must tick.
 *
 * Deliberately counts headings and checkboxes rather than every occurrence of
 * the word "blocking" — prose that *describes* a gate is not another gate, and
 * counting mentions would make explaining a rule as expensive as adding one.
 */
function countDecisionPoints(text) {
  // `hard[ -]stop`, not `hard stop`: the hyphenated spelling was invisible to
  // this counter until 2026-08-09, so `### Phase 0 hard-stop (visual spec gate)`
  // — one of the heaviest gates in CLAUDE.md — was never counted. Measured
  // effect of the fix: 24 stops → 25.
  //
  // This still undercounts. Five gate headings carry neither keyword and remain
  // invisible: CLAUDE.md `Browser testing pre-flight` (:194), `Design handoff
  // evaluation gate` (:277), `React hooks — Outlet context pre-flight` (:281),
  // `Gate 3 — Framework-agnostic constraint` (:548), `Dark mode surface work —
  // pre-flight` (:802). Widening the pattern to catch them would change the cap
  // again, so it is a separate, measured change — not folded in here.
  const gateHeadings = text.match(/^#{2,4} .*(hard[ -]stop|blocking).*$/gim) || []
  const checkboxes = text.match(/^\s*- \[[ x]\] /gim) || []
  return gateHeadings.length + checkboxes.length
}

function readOrDie(relPath) {
  const full = resolve(ROOT, relPath)
  if (!existsSync(full)) {
    console.error(`\n❌  ${relPath} does not exist. The budget cannot be measured.\n`)
    process.exit(1)
  }
  return readFileSync(full, 'utf8')
}

const rootText = readOrDie(ROOT_DOC)

// Parse the referenced surface out of the root doc rather than trusting a list.
const referenced = [...new Set(rootText.match(REFERENCE_PATTERN) || [])].sort()

const missing = referenced.filter((p) => !existsSync(resolve(ROOT, p)))
if (missing.length > 0) {
  console.error(`\n❌  ${ROOT_DOC} references ${missing.length} file(s) that do not exist:\n`)
  for (const p of missing) console.error(`      ${p}`)
  console.error(
    `\n    Fix the reference or restore the file. A dangling link is not skipped —\n` +
      `    dropping a file from the measured surface is how this gate gets defeated.\n`
  )
  process.exit(1)
}

const rows = [
  { path: ROOT_DOC, words: countWords(rootText), decisions: countDecisionPoints(rootText) },
  ...referenced.map((p) => {
    const text = readFileSync(resolve(ROOT, p), 'utf8')
    return { path: p, words: countWords(text), decisions: countDecisionPoints(text) }
  }),
]

const total = rows.reduce((sum, r) => sum + r.words, 0)
const totalDecisions = rows.reduce((sum, r) => sum + r.decisions, 0)
const over = total - CAP_WORDS
const overDecisions = totalDecisions - CAP_DECISIONS

if (process.argv.includes('--json')) {
  console.log(
    JSON.stringify(
      { cap: CAP_WORDS, total, over, capDecisions: CAP_DECISIONS, totalDecisions, overDecisions, files: rows },
      null,
      2
    )
  )
  process.exit(over > 0 || overDecisions > 0 ? 1 : 0)
}

console.log(`\n📏  Sugartown Instruction Surface Budget`)
console.log(`${'═'.repeat(46)}\n`)
console.log(`   Measured in words. The surface is ${ROOT_DOC} plus the`)
console.log(`   ${referenced.length} docs/conventions/ file(s) it references.\n`)

const width = Math.max(...rows.map((r) => r.path.length))
for (const r of rows) {
  console.log(`   ${String(r.words).padStart(6)}  ${String(r.decisions).padStart(4)}  ${r.path.padEnd(width)}`)
}

console.log(`\n${'─'.repeat(46)}`)
console.log(`   ${String(total).padStart(6)}  ${String(totalDecisions).padStart(4)}  TOTAL`)
console.log(`   ${String(CAP_WORDS).padStart(6)}  ${String(CAP_DECISIONS).padStart(4)}  CAP`)
console.log(`    words  stops\n`)

let failed = false

if (over > 0) {
  console.error(`❌  Over the word budget by ${over} word(s).\n`)
  console.error(`    Moving text from ${ROOT_DOC} into a referenced conventions file`)
  console.error(`    will not help — both sides are counted. Shorten it, or move it`)
  console.error(`    somewhere a session does not read (the incident log, a rules`)
  console.error(`    audit, an epic doc) and link to it.\n`)
  failed = true
}

if (overDecisions > 0) {
  console.error(`❌  Over the decision budget by ${overDecisions} stop(s).\n`)
  console.error(`    A session has to stop and make ${totalDecisions} separate calls. Rewording`)
  console.error(`    will not help — this counts gates and checkboxes, not prose.`)
  console.error(`    Remove a gate, merge two that fire on the same condition, or`)
  console.error(`    make one conditional on the size of the change.\n`)
  failed = true
}

if (failed) process.exit(1)

console.log(
  `✅  Within budget — ${CAP_WORDS - total} word(s) and ${CAP_DECISIONS - totalDecisions} stop(s) of headroom.\n`
)
