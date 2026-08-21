#!/usr/bin/env node
/**
 * check-renamed-headings.js — did a heading rename orphan an inbound reference?
 *
 * ST-101 S1, successor to ST-99. The one defect class that repeated across
 * ST-99's three QA-walkthrough runs (docs/shipped/ST-99-rules-change-qa.md):
 * a markdown heading in a rule-defining file gets renamed (or removed), and
 * some other live doc still names the old heading text — a dangling
 * cross-reference. Both real occurrences were correct renames; the only
 * defect was that nothing repointed the referrers. Mechanical enough to be a
 * grep (ST-99's own review), so it is one here.
 *
 * This is a session-run aid for Step 1 of the rule-file followability
 * walkthrough ("name the workflows the change touches"), not a pre-commit or
 * CI gate — decided 2026-08-21 (ST-101 S2). A blind gate over prose headings
 * risks false positives on short/generic heading text, which needs a human
 * to judge; the pre-commit hook is reserved for fast, unambiguous CSS
 * validators (see its own header comment), and this doesn't fit that shape.
 *
 * What counts as "live": everything this repo instructs a session to read,
 * per CLAUDE.md's own historical-docs exemption ("shipped epics, release
 * notes, post-mortems... record what was true when written, not live
 * instructions"). Excluded: docs/shipped/, docs/release-notes/,
 * docs/reviews/post-mortem/, docs/drafts/ (gitignored, local-only anyway),
 * zArchive/, CHANGELOG.md (same historical-record reasoning).
 *
 * Usage:
 *   node scripts/check-renamed-headings.js <file> [--against <git-ref>]
 *
 * <file>     path to the changed rule-defining file, relative to repo root
 * --against  git ref to diff against (default: HEAD — "what changed since
 *            the last commit", the normal mid-walkthrough case)
 *
 * Exit codes:
 *   0 — no headings removed, or none of the removed headings have live
 *       inbound references
 *   1 — at least one removed heading still has a live inbound reference
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, relative } from 'path'
import { spawnSync } from 'child_process'

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..')

const EXCLUDED_PREFIXES = [
  'docs/shipped/',
  'docs/release-notes/',
  'docs/reviews/post-mortem/',
  'docs/drafts/',
  'zArchive/',
]
const EXCLUDED_FILES = new Set(['CHANGELOG.md'])
const SCAN_ROOTS = ['docs', '.claude/skills', 'CLAUDE.md']

function run(cmd, args) {
  const res = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  return { code: res.status ?? 1, out: res.stdout || '', err: res.stderr || '' }
}

function extractHeadings(content) {
  const headings = new Set()
  for (const line of content.split('\n')) {
    const m = line.match(/^#{1,6}\s+(.+?)\s*$/)
    if (m) headings.add(m[1])
  }
  return headings
}

function isExcluded(relPath) {
  if (EXCLUDED_FILES.has(relPath)) return true
  return EXCLUDED_PREFIXES.some((p) => relPath.startsWith(p))
}

function liveDocFiles() {
  const files = []
  for (const scanRoot of SCAN_ROOTS) {
    const full = resolve(ROOT, scanRoot)
    if (!existsSync(full)) continue
    const { code, out } = run('git', ['ls-files', scanRoot])
    if (code !== 0) continue
    for (const f of out.split('\n')) {
      const t = f.trim()
      if (!t) continue
      if (!t.endsWith('.md')) continue
      if (isExcluded(t)) continue
      files.push(t)
    }
  }
  return files
}

function main() {
  const args = process.argv.slice(2)
  const file = args[0]
  if (!file) {
    console.error('Usage: node scripts/check-renamed-headings.js <file> [--against <git-ref>]')
    process.exit(2)
  }
  const againstIdx = args.indexOf('--against')
  const against = againstIdx !== -1 ? args[againstIdx + 1] : 'HEAD'

  const relFile = relative(ROOT, resolve(ROOT, file))
  const fullFile = resolve(ROOT, relFile)

  const old = run('git', ['show', `${against}:${relFile}`])
  if (old.code !== 0) {
    console.log(`   ℹ️   ${relFile} has no ${against} version (new file) — nothing to compare.`)
    process.exit(0)
  }
  if (!existsSync(fullFile)) {
    console.error(`   ⚠️   ${relFile} does not exist on disk — cannot read the new version.`)
    process.exit(2)
  }

  const oldHeadings = extractHeadings(old.out)
  const newHeadings = extractHeadings(readFileSync(fullFile, 'utf8'))
  const removed = [...oldHeadings].filter((h) => !newHeadings.has(h))

  console.log(`\n🔍  Renamed-heading check — ${relFile} vs ${against}`)
  console.log('══════════════════════════════════════════════\n')

  if (removed.length === 0) {
    console.log('   No headings removed. Nothing to check.\n')
    process.exit(0)
  }

  console.log(`   ${removed.length} heading(s) removed or renamed:`)
  for (const h of removed) console.log(`     - ${h}`)
  console.log('')

  const candidates = liveDocFiles().filter((f) => f !== relFile)
  const hits = []

  for (const heading of removed) {
    for (const candidate of candidates) {
      const content = readFileSync(resolve(ROOT, candidate), 'utf8')
      const lines = content.split('\n')
      lines.forEach((line, i) => {
        if (line.includes(heading)) {
          hits.push({ heading, file: candidate, line: i + 1, text: line.trim() })
        }
      })
    }
  }

  if (hits.length === 0) {
    console.log('   ✅  No live inbound references to the removed heading(s) found.\n')
    process.exit(0)
  }

  console.log(`   ❌  ${hits.length} possible dangling reference(s):\n`)
  for (const { heading, file: f, line, text } of hits) {
    console.log(`   "${heading}"`)
    console.log(`     ${f}:${line}`)
    console.log(`     ${text.slice(0, 120)}\n`)
  }
  console.log('   These may be false positives (a short heading matching incidentally) —')
  console.log('   judge each, don\'t auto-fix. A shipped doc is exempt by design; if a hit')
  console.log('   is inside docs/shipped/ this scan already excluded it, so any hit here')
  console.log('   is in a live doc.\n')
  process.exit(1)
}

main()
