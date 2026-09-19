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

import { readFileSync } from 'fs'
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

function main(argv) {
  const args = argv.slice(2)
  const tIndex = args.indexOf('--template')
  const sIndex = args.indexOf('--stage')
  const templatePath = tIndex >= 0 ? resolve(args[tIndex + 1]) : DEFAULT_TEMPLATE
  const stage = sIndex >= 0 ? args[sIndex + 1] : 'start'
  const valueIndexes = [tIndex, sIndex].filter((i) => i >= 0).map((i) => i + 1)
  const docPath = args.find((a, i) => !a.startsWith('--') && !valueIndexes.includes(i))
  if (!docPath) {
    console.error('usage: node scripts/check-epic-doc.js <epic-doc.md> [--stage start|close-out] [--template path]')
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
