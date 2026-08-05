#!/usr/bin/env node
/**
 * monthly-evidence-digest.js — Phase 8 feedback loop, monthly product loop
 *
 * Reads apps/web/src/generated/stats.json (real, daily-collected pipeline
 * output — see CLAUDE.md §Generated stats files) and writes a dated
 * evidence block into docs/reports/evidence-digest.md: four numbers, three
 * sentences. Nothing measured after ship currently feeds back into planning —
 * this closes that loop. See SUG-241.
 *
 * Retargeted 2026-08-05: the digest previously lived inside
 * docs/backlog/sugartown-backlog-priorities.md, which was retired for
 * duplicating Linear by hand. This digest was the only content there with no
 * other home, because it is generated from the stats pipeline rather than
 * mirrored from Linear.
 *
 * Every number traces to a real stats.json field. If a source is
 * unavailable, the block says "unavailable" — never a defaulted zero.
 *
 * Idempotent per calendar day: re-running today replaces today's block
 * in place rather than duplicating it.
 *
 * Usage:
 *   pnpm collect:evidence-digest
 *   pnpm collect:evidence-digest -- --stats-path <path> --date YYYY-MM-DD
 *     (backfill from a historical stats.json snapshot, e.g. via
 *     `git show <sha>:apps/web/src/generated/stats.json` — the date flag
 *     dates the block by the snapshot's own day, not today)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function argValue(flag) {
  const i = process.argv.indexOf(flag)
  return i !== -1 ? process.argv[i + 1] : null
}

const STATS_PATH = argValue('--stats-path')
  ? resolve(process.cwd(), argValue('--stats-path'))
  : resolve(ROOT, 'apps/web/src/generated/stats.json')
const OVERRIDE_DATE = argValue('--date')
const DIGEST_PATH = resolve(ROOT, 'docs/reports/evidence-digest.md')

const SECTION_HEADING = '## 📊 Evidence Digest — monthly product signal'
const SECTION_INTRO =
  '> Written by `scripts/monthly-evidence-digest.js` (SUG-241) from real `stats.json`\n' +
  "> pipeline data. Every number traces to a live source; a source that's down writes\n" +
  '> `unavailable`, never a defaulted zero. Newest first.'

function today() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function fmtDate(d) {
  return new Date(d).toISOString().slice(0, 10)
}

function pct(n) {
  return n == null ? 'unavailable' : `${n}`
}

// ─── Gate liveness — the most recent CI run on main ─────────────────────────
//
// The other four numbers describe the product. This one describes whether
// anything is checking the product. CI ran red on `main` 212 consecutive times
// between 2026-05-10 and 2026-07-28 while this digest kept reporting healthy
// performance, security and content figures every month — all of them true, and
// all of them measured by a pipeline nobody could have known was passing.
//
// Reads GitHub rather than stats.json, so it degrades to "unavailable" when gh
// is missing or unauthenticated. A missing number is reported as missing; it is
// never silently omitted, because an absent row reads as "fine" (SUG-255).

function ciLiveness() {
  try {
    const raw = execFileSync(
      'gh',
      ['run', 'list', '--branch', 'main', '--workflow', 'CI', '--limit', '1',
       '--json', 'databaseId,conclusion,createdAt'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    )
    const [run] = JSON.parse(raw)
    if (!run) return { line: '- **Gate liveness:** no CI run found on `main`', sentence: 'No CI run was found on `main`.' }

    const when = fmtDate(run.createdAt)
    const outcome = run.conclusion || 'still running'
    const mark = run.conclusion === 'success' ? '' : ' ⚠️'
    return {
      line: `- **Gate liveness:** last CI run on \`main\` concluded \`${outcome}\`${mark} (${when}, run ${run.databaseId})`,
      sentence:
        run.conclusion === 'success'
          ? `The most recent CI run on \`main\` passed (run ${run.databaseId}, ${when}), so the figures above were measured by a pipeline known to be working.`
          : `The most recent CI run on \`main\` concluded \`${outcome}\` (run ${run.databaseId}, ${when}) — treat every figure above as unverified until it is green.`,
    }
  } catch {
    return {
      line: '- **Gate liveness:** unavailable (gh CLI missing or unauthenticated)',
      sentence: 'CI status could not be read this month, so the figures above are unverified.',
    }
  }
}

// ─── Pull the four numbers, guarding every field ───────────────────────────

function buildDigest(stats) {
  const homepagePerf = stats.perf?.runs?.['https://sugartown.io/']?.desktop?.performance
  const performanceScore = homepagePerf != null ? `${homepagePerf}/100` : 'unavailable'

  const vulnTotal = stats.security?.vulnerabilities?.total
  const vulnerabilities = vulnTotal != null ? `${vulnTotal}` : 'unavailable'

  const counts = stats.sanity?.counts
  const contentTypes = ['article', 'node', 'caseStudy', 'page']
  const contentDocs =
    counts && contentTypes.every((t) => counts[t] != null)
      ? contentTypes.reduce((sum, t) => sum + counts[t], 0)
      : 'unavailable'

  const backlogItems = stats.linearRoadmap?.backlog
  const backlogSize = Array.isArray(backlogItems) ? backlogItems.length : 'unavailable'

  const cruxAvailable = stats.crux?.available === true
  const cruxNote = cruxAvailable
    ? 'Field data (CrUX) is available this month.'
    : `Field data (CrUX) remains unavailable this month (${stats.crux?.reason ?? 'no reason given'}) — this loop still runs on lab data (Lighthouse) alone.`

  const statsDate = stats.generatedAt ? fmtDate(stats.generatedAt) : 'unknown date'

  const ci = ciLiveness()

  const sentences = [
    `Homepage Lighthouse performance held at ${performanceScore} (desktop) with ${vulnerabilities} known dependency vulnerabilit${vulnTotal === 1 ? 'y' : 'ies'}.`,
    `${contentDocs} published documents across article, node, case study, and page types; the Linear backlog holds ${backlogSize} open item${backlogSize === 1 ? '' : 's'} not yet started.`,
    `${cruxNote} Source: stats.json generated ${statsDate}.`,
    ci.sentence,
  ]

  return {
    date: OVERRIDE_DATE ?? today(),
    lines: [
      `- **Performance:** ${performanceScore} (homepage, desktop Lighthouse)`,
      `- **Security:** ${vulnerabilities} known vulnerabilit${vulnTotal === 1 ? 'y' : 'ies'}`,
      `- **Content:** ${contentDocs} published documents (article + node + caseStudy + page)`,
      `- **Backlog:** ${backlogSize} open Linear items`,
      ci.line,
    ],
    sentences,
  }
}

function renderBlock({ date, lines, sentences }) {
  return `### ${date}\n\n${lines.join('\n')}\n\n${sentences.join(' ')}\n`
}

// ─── Idempotent, date-sorted insert ─────────────────────────────────────────
// Parses every existing "### YYYY-MM-DD" block in the section into a list,
// replaces or adds the block for `date`, then re-renders the whole section
// sorted newest-first. Re-derives ordering from data every time rather than
// doing positional index arithmetic, so an out-of-order backfill (a date
// older than what's already present) still sorts correctly instead of just
// landing wherever it was spliced in.

function parseExistingBlocks(sectionBody) {
  const blocks = new Map() // date -> block text (trimmed)
  const trimmed = sectionBody.trim()
  if (!trimmed) return blocks

  // Split right before each "### YYYY-MM-DD" line — keeps each block's own
  // heading with its body, without an anchor/lookahead spanning the body
  // (a lazy [\s\S]*? bounded by a multiline $ mis-stops at the first line
  // break inside the body; tested and confirmed broken before this fix).
  const parts = trimmed.split(/\n(?=### \d{4}-\d{2}-\d{2}\n)/)
  for (const part of parts) {
    const m = part.match(/^### (\d{4}-\d{2}-\d{2})\n/)
    if (m) blocks.set(m[1], part.trim())
  }
  return blocks
}

function upsertDigest(fileContent, block, date) {
  const headingIdx = fileContent.indexOf(SECTION_HEADING)

  if (headingIdx === -1) {
    // Section doesn't exist yet — append it. The digest now owns its own file,
    // so there is no sibling section to anchor against; before 2026-08-05 this
    // branch positioned the section before "## 01 · Next" inside the retired
    // backlog-priorities doc.
    const newSection = `${SECTION_HEADING}\n\n${SECTION_INTRO}\n\n${block.trimEnd()}\n\n---\n`
    return `${fileContent.trimEnd()}\n\n${newSection}`
  }

  // Find the end of the section (next "---" divider after the heading).
  const sectionDividerIdx = fileContent.indexOf('\n---\n', headingIdx)
  if (sectionDividerIdx === -1) {
    throw new Error(`Could not find the end of "${SECTION_HEADING}" (expected a "---" divider)`)
  }

  const introEnd = fileContent.indexOf('\n\n', fileContent.indexOf(SECTION_INTRO) + SECTION_INTRO.length)
  const bodyStart = introEnd + 2
  const sectionBody = fileContent.slice(bodyStart, sectionDividerIdx)

  const blocks = parseExistingBlocks(sectionBody)
  blocks.set(date, block.trimEnd()) // insert or replace — idempotent per day

  const sortedBlocks = [...blocks.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0)) // newest first
    .map(([, text]) => text)

  const newBody = sortedBlocks.join('\n\n') + '\n\n'
  return fileContent.slice(0, bodyStart) + newBody + fileContent.slice(sectionDividerIdx + 1)
}

function run() {
  console.log('\n📊  Monthly Evidence Digest')
  console.log('══════════════════════════════════════════════\n')

  if (!existsSync(STATS_PATH)) {
    console.error(`   ❌ stats.json not found at ${STATS_PATH}`)
    process.exit(1)
  }

  const stats = JSON.parse(readFileSync(STATS_PATH, 'utf8'))
  const digest = buildDigest(stats)
  const block = renderBlock(digest)

  console.log(block)

  const digestContent = readFileSync(DIGEST_PATH, 'utf8')
  const updated = upsertDigest(digestContent, block, digest.date)
  writeFileSync(DIGEST_PATH, updated, 'utf8')

  console.log(`   ✅ Wrote evidence block for ${digest.date} to`)
  console.log(`      ${DIGEST_PATH}\n`)
}

run()
