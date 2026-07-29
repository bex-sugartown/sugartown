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
 * Interim value, set at SUG-243 Phase 1 to sit just above the measured total so
 * the liveness probe's control run passes on a clean tree. A cap set to the
 * Phase 3 *target* would make the gate red from the day it landed, and
 * `gateProbe` would report PROBE INVALID for the epic's whole duration rather
 * than proving anything.
 *
 * Phase 3 tightens this to the achieved figure plus 5%.
 */
const CAP_WORDS = 22_000

/** Files matching this are part of the surface when CLAUDE.md references them. */
const REFERENCE_PATTERN = /docs\/conventions\/[a-z0-9-]+\.md/g

/** Count words the way `wc -w` does: runs of non-whitespace. */
function countWords(text) {
  const trimmed = text.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
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
  { path: ROOT_DOC, words: countWords(rootText) },
  ...referenced.map((p) => ({ path: p, words: countWords(readFileSync(resolve(ROOT, p), 'utf8')) })),
]

const total = rows.reduce((sum, r) => sum + r.words, 0)
const over = total - CAP_WORDS

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ cap: CAP_WORDS, total, over, files: rows }, null, 2))
  process.exit(over > 0 ? 1 : 0)
}

console.log(`\n📏  Sugartown Instruction Surface Budget`)
console.log(`${'═'.repeat(46)}\n`)
console.log(`   Measured in words. The surface is ${ROOT_DOC} plus the`)
console.log(`   ${referenced.length} docs/conventions/ file(s) it references.\n`)

const width = Math.max(...rows.map((r) => r.path.length))
for (const r of rows) {
  console.log(`   ${String(r.words).padStart(6)}  ${r.path.padEnd(width)}`)
}

console.log(`\n${'─'.repeat(46)}`)
console.log(`   ${String(total).padStart(6)}  TOTAL`)
console.log(`   ${String(CAP_WORDS).padStart(6)}  CAP\n`)

if (over > 0) {
  console.error(`❌  Over budget by ${over} word(s).\n`)
  console.error(`    Moving text from ${ROOT_DOC} into a referenced conventions file`)
  console.error(`    will not help — both sides are counted. Shorten it, or move it`)
  console.error(`    somewhere a session does not read (the incident log, a rules`)
  console.error(`    audit, an epic doc) and link to it.\n`)
  process.exit(1)
}

console.log(`✅  Within budget — ${CAP_WORDS - total} word(s) of headroom.\n`)
