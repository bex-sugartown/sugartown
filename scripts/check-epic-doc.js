#!/usr/bin/env node
/**
 * check-epic-doc.js — is this epic doc complete enough to start?
 *
 * Reads the required sections from `docs/epic-template.md` itself: every
 * `## Name [REQUIRED]` heading (exactly `[REQUIRED]`; conditional
 * `[REQUIRED if …]` sections are left to the session's judgement). The list
 * is never copied into this file, so the template stays the one definition.
 *
 * A section fails if it is missing, empty, still `TODO`, or only template
 * `{placeholder}` lines. The doc also needs a `**Visual:** yes | no` line, and
 * a `yes` doc must name its vspec path (`docs/drafts/….vspec.html`).
 *
 * `--stage close-out` (ST-130) checks the `## … [REQUIRED at close-out]`
 * sections instead, and each `### ` subsection the template gives them. Every
 * Follow-ups row must name an issue (`#N`) or say `declined`; `none` is valid.
 *
 * `--drift` (start review step 2) reports what changed in the rules since the
 * epic was last aligned: rule-defining files with commits after the doc's
 * `**Aligned:** YYYY-MM-DD` header date (first commit date if the line is
 * absent), plus backticked repo paths in the doc that no longer exist. It lists
 * evidence for the session to read; it does not judge the epic.
 *
 * Session-invoked, not a commit or CI gate. Start stage: the start review
 * (`docs/epic-template.md` §Pre-Execution Completeness Gate, run by
 * `.claude/rules/epics.md` and `/new-epic`). Close-out stage: CLAUDE.md §Epic
 * close-out sequence step 5c, before the move to `docs/shipped/`. Probed by
 * `scripts/validate-liveness-probes.js`.
 *
 * Usage:
 *   node scripts/check-epic-doc.js docs/backlog/ST-129-example.md [--stage start|close-out] [--template path]
 *
 * Exit codes:
 *   0 — complete
 *   1 — at least one gap (listed), or the doc or template could not be read
 *
 * Kill criterion: retire this script if, 60 days after it lands, it has not
 * stopped a single epic start. The template stays the one definition either way.
 *
 * ST-129 (#129)
 */

import { readFileSync, existsSync } from 'fs'
import { execFileSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const DEFAULT_TEMPLATE = resolve(ROOT, 'docs/epic-template.md')

const MARKERS = { start: '[REQUIRED]', 'close-out': '[REQUIRED at close-out]' }
const VISUAL_LINE = /^\*\*Visual:\*\*\s*(yes|no)\b/im
// Braces excluded: an unfilled `{ID}-{slug}` template placeholder is not a path.
const VSPEC_PATH = /docs\/(drafts|shipped)\/[^\s`)'"{}]+\.vspec\.html/

/** Heading text reduced to a comparable key: no bracket suffix, no trailing colon, lower case. */
function normalise(heading) {
  return heading.replace(/\[.*?\]/g, '').replace(/:\s*$/, '').trim().toLowerCase()
}

function headingFor(stage) {
  const marker = MARKERS[stage]
  if (!marker) throw new Error(`unknown stage "${stage}" (use start or close-out)`)
  const escaped = marker.replace(/[[\]]/g, '\\$&')
  return new RegExp(`^##\\s+(.+?)\\s*${escaped}\\s*$`)
}

/** The section names the template requires at a stage, in template order. */
export function requiredSections(templatePath = DEFAULT_TEMPLATE, stage = 'start') {
  const heading = headingFor(stage)
  return readFileSync(templatePath, 'utf8')
    .split('\n')
    .map((line) => line.match(heading))
    .filter(Boolean)
    .map((m) => m[1].replace(/:\s*$/, '').trim())
}

/** For each close-out section, the `### ` subsection names the template gives it. */
export function requiredSubsections(templatePath = DEFAULT_TEMPLATE) {
  const heading = headingFor('close-out')
  const result = new Map()
  let current = null
  for (const line of readFileSync(templatePath, 'utf8').split('\n')) {
    const h2 = line.match(/^##\s+(.+)$/)
    if (h2) {
      const m = line.match(heading)
      current = m ? m[1].replace(/:\s*$/, '').trim() : null
      if (current) result.set(current, [])
      continue
    }
    const h3 = line.match(/^###\s+(.+)$/)
    if (current && h3) result.get(current).push(h3[1].trim())
  }
  return result
}

/** Map of normalised heading → body text, for one doc, at `## ` (level 2) or `### ` (level 3). */
function sectionsOf(text, level = 2) {
  const sections = new Map()
  let current = null
  const pattern = level === 2 ? /^##\s+(.+)$/ : /^###\s+(.+)$/
  for (const line of text.split('\n')) {
    if (level === 3 && /^##\s/.test(line)) current = null
    const h = line.match(pattern)
    if (h) {
      current = normalise(h[1])
      sections.set(current, [])
    } else if (current) {
      sections.get(current).push(line)
    }
  }
  return sections
}

/** Why a section body is not usable, or null if it is. */
function bodyProblem(lines) {
  const meaningful = lines
    .map((l) => l.replace(/<!--.*?-->/g, '').trim())
    .filter((l) => l && l !== '---')
  if (meaningful.length === 0) return 'empty'
  const withoutCode = meaningful.map((l) => l.replace(/`[^`]*`/g, ''))
  if (withoutCode.some((l) => /\bTODO\b/.test(l))) return 'still TODO'
  if (meaningful.every((l) => /^\{.*\}$/.test(l) || /^- \[ \] \{.*\}$/.test(l))) return 'only template placeholders'
  return null
}

/** Follow-ups rows that are unfilled template rows, or name neither an issue nor a decline. */
function unroutedFollowUps(lines) {
  return lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|') && !/^\|[\s|:-]+\|$/.test(l))
    .slice(1) // header row
    .filter((row) => /\{[^}]*\}/.test(row) || (!/#\d+/.test(row) && !/\bdeclined\b/i.test(row) && !/^\|\s*none\b/i.test(row)))
}

function checkCloseOut(docText, templatePath) {
  const gaps = []
  const sections = sectionsOf(docText)
  for (const [name, subs] of requiredSubsections(templatePath)) {
    const body = sections.get(normalise(name))
    if (!body) {
      gaps.push(`missing section: ## ${name}`)
      continue
    }
    if (subs.length === 0) {
      const problem = bodyProblem(body)
      if (problem) gaps.push(`## ${name}: ${problem}`)
      continue
    }
    const subsections = sectionsOf(body.join('\n'), 3)
    for (const sub of subs) {
      const subBody = subsections.get(normalise(sub))
      if (!subBody) gaps.push(`missing subsection: ## ${name} > ### ${sub}`)
      else {
        const problem = bodyProblem(subBody)
        if (problem) gaps.push(`### ${sub}: ${problem}`)
        else if (normalise(sub) === 'follow-ups') {
          for (const row of unroutedFollowUps(subBody)) gaps.push(`follow-up is a template row, or names no issue and is not declined: ${row}`)
        }
      }
    }
  }
  return gaps
}

/** All gaps in one doc at a stage, as human-readable strings. Empty array = complete. */
export function checkEpicDoc(docText, templatePath = DEFAULT_TEMPLATE, stage = 'start') {
  if (stage === 'close-out') return checkCloseOut(docText, templatePath)
  const gaps = []
  const sections = sectionsOf(docText)
  for (const name of requiredSections(templatePath, 'start')) {
    const body = sections.get(normalise(name))
    if (!body) gaps.push(`missing section: ## ${name}`)
    else {
      const problem = bodyProblem(body)
      if (problem) gaps.push(`## ${name}: ${problem}`)
    }
  }
  const visual = docText.match(VISUAL_LINE)
  if (!visual) gaps.push('missing header line: **Visual:** yes | no')
  else if (visual[1].toLowerCase() === 'yes' && !VSPEC_PATH.test(docText)) {
    gaps.push('**Visual:** yes, but no vspec path (docs/drafts/{ID}-{slug}.vspec.html) is named')
  }
  return gaps
}

// The rules an epic is written against. Release, cloud and export workflows are left out:
// they govern how work ships, not what an epic may say.
export const RULE_PATHSPECS = [
  'CLAUDE.md',
  'docs/ai/repo-map.md',
  '.claude/rules',
  'docs/conventions',
  'docs/epic-template.md',
  '.claude/skills/new-epic',
  '.claude/skills/new-tool',
  '.claude/skills/sugartown-epic-writer',
]
const ALIGNED_LINE = /^\*\*Aligned:\*\*\s*(\d{4}-\d{2}-\d{2})/im

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()
}

/** Drift evidence for one doc: { since, sinceSource, changed: [{file, subjects}], deadPaths: [] }. */
export function driftReport(docPath, docText) {
  const aligned = docText.match(ALIGNED_LINE)
  let since = aligned && aligned[1]
  let sinceSource = 'Aligned: line'
  if (!since) {
    const rel = resolve(docPath).replace(ROOT + '/', '')
    since = git(['log', '--diff-filter=A', '--follow', '--format=%as', '--', rel]).split('\n').pop() || ''
    sinceSource = 'no Aligned: line, using the doc\'s first commit date'
  }
  const changed = []
  if (since) {
    const out = git(['log', '--format=@@%as %s', '--name-only', '--', ...RULE_PATHSPECS])
    let subject = ''
    let newer = false
    const byFile = new Map()
    for (const line of out.split('\n')) {
      if (line.startsWith('@@')) {
        subject = line.slice(2)
        // ISO dates compare as strings. Commits on the Aligned day count as seen.
        newer = subject.slice(0, 10) > since
      } else if (line.trim() && newer) {
        if (!byFile.has(line)) byFile.set(line, [])
        byFile.get(line).push(subject)
      }
    }
    for (const [file, subjects] of byFile) changed.push({ file, subjects })
  }
  const deadPaths = [
    ...new Set(
      [...docText.matchAll(/`((?:apps|packages|scripts|docs|tokens|\.claude)\/[^\s`*{}<>]+\.[a-z]{1,5})`/g)].map((m) => m[1])
    ),
  ].filter((p) => !existsSync(resolve(ROOT, p)) && !p.startsWith('docs/drafts/'))
  return { since, sinceSource, changed, deadPaths }
}

function runDrift(docPath, docText) {
  const r = driftReport(docPath, docText)
  console.log(`${docPath}: drift since ${r.since || 'unknown'} (${r.sinceSource})`)
  if (r.changed.length) {
    console.log(`   ${r.changed.length} rule file(s) changed. Read these diffs against the epic:`)
    for (const c of r.changed) console.log(`   - ${c.file}  (${c.subjects.length} commit(s), latest: ${c.subjects[0]})`)
  }
  if (r.deadPaths.length) {
    console.log(`   ${r.deadPaths.length} path(s) named in the epic no longer exist:`)
    for (const p of r.deadPaths) console.log(`   - ${p}`)
  }
  const clean = r.since && !r.changed.length && !r.deadPaths.length
  if (clean) console.log('   ✓ no rule changes and no dead paths since the epic was aligned')
  else console.log('   Outside this repo: also read ../conventions/rules/ if it changed (git -C ../conventions log --since=' + (r.since || '<date>') + ').')
  return clean ? 0 : 1
}

function main(argv) {
  const args = argv.slice(2)
  const tIndex = args.indexOf('--template')
  const sIndex = args.indexOf('--stage')
  const templatePath = tIndex >= 0 ? resolve(args[tIndex + 1]) : DEFAULT_TEMPLATE
  const stage = sIndex >= 0 ? args[sIndex + 1] : 'start'
  const drift = args.includes('--drift')
  const valueIndexes = [tIndex, sIndex].filter((i) => i >= 0).map((i) => i + 1)
  const docPath = args.find((a, i) => !a.startsWith('--') && !valueIndexes.includes(i))
  if (!docPath) {
    console.error('usage: node scripts/check-epic-doc.js <epic-doc.md> [--stage start|close-out] [--template path] [--drift]')
    return 1
  }
  if (!MARKERS[stage]) {
    console.error(`✗ unknown --stage "${stage}" (use start or close-out)`)
    return 1
  }

  let docText
  try {
    docText = readFileSync(resolve(docPath), 'utf8')
  } catch (err) {
    console.error(`✗ cannot read ${docPath}: ${err.message}`)
    return 1
  }

  if (drift) return runDrift(docPath, docText)

  let gaps
  try {
    // A template with nothing required at this stage would pass every doc.
    if (requiredSections(templatePath, stage).length === 0) {
      console.error(`✗ ${templatePath} marks no sections ${MARKERS[stage]}, so there is nothing to check at stage ${stage}`)
      return 1
    }
    gaps = checkEpicDoc(docText, templatePath, stage)
  } catch (err) {
    console.error(`✗ cannot read template ${templatePath}: ${err.message}`)
    return 1
  }

  if (gaps.length === 0) {
    const detail = stage === 'close-out' ? 'close-out review and post-ship checks present' : `${requiredSections(templatePath).length} required sections, Visual line present`
    console.log(`✓ ${docPath}: ${stage} complete (${detail})`)
    return 0
  }
  const when = stage === 'close-out' ? 'before the doc moves to docs/shipped/' : 'before the epic starts'
  console.log(`✗ ${docPath}: ${gaps.length} ${stage} gap(s). Fill these ${when}:`)
  for (const g of gaps) console.log(`   - ${g}`)
  return 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv))
}
