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
 * Session-invoked, not a commit or CI gate: run by `.claude/rules/epics.md`
 * §Incomplete epic doc hard stop and `/new-epic`'s stub activation gate when
 * an epic starts. Probed by `scripts/validate-liveness-probes.js`.
 *
 * Usage:
 *   node scripts/check-epic-doc.js docs/backlog/ST-129-example.md [--template path]
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

const REQUIRED_HEADING = /^##\s+(.+?)\s*\[REQUIRED\]\s*$/
const VISUAL_LINE = /^\*\*Visual:\*\*\s*(yes|no)\b/im
// Braces excluded: an unfilled `{ID}-{slug}` template placeholder is not a path.
const VSPEC_PATH = /docs\/(drafts|shipped)\/[^\s`)'"{}]+\.vspec\.html/

/** Heading text reduced to a comparable key: no bracket suffix, no trailing colon, lower case. */
function normalise(heading) {
  return heading.replace(/\[.*?\]/g, '').replace(/:\s*$/, '').trim().toLowerCase()
}

/** The section names the template marks as always required, in template order. */
export function requiredSections(templatePath = DEFAULT_TEMPLATE) {
  return readFileSync(templatePath, 'utf8')
    .split('\n')
    .map((line) => line.match(REQUIRED_HEADING))
    .filter(Boolean)
    .map((m) => m[1].replace(/:\s*$/, '').trim())
}

/** Map of normalised `## ` heading → body text, for one doc. */
function sectionsOf(text) {
  const sections = new Map()
  let current = null
  for (const line of text.split('\n')) {
    const h = line.match(/^##\s+(.+)$/)
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

/** All gaps in one doc, as human-readable strings. Empty array = complete. */
export function checkEpicDoc(docText, templatePath = DEFAULT_TEMPLATE) {
  const gaps = []
  const sections = sectionsOf(docText)
  for (const name of requiredSections(templatePath)) {
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
  const templatePath = tIndex >= 0 ? resolve(args[tIndex + 1]) : DEFAULT_TEMPLATE
  const docPath = args.find((a, i) => !a.startsWith('--') && (tIndex < 0 || i !== tIndex + 1))
  if (!docPath) {
    console.error('usage: node scripts/check-epic-doc.js <epic-doc.md> [--template path]')
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
    gaps = checkEpicDoc(docText, templatePath)
  } catch (err) {
    console.error(`✗ cannot read template ${templatePath}: ${err.message}`)
    return 1
  }

  if (gaps.length === 0) {
    console.log(`✓ ${docPath}: complete (${requiredSections(templatePath).length} required sections, Visual line present)`)
    return 0
  }
  console.log(`✗ ${docPath}: ${gaps.length} gap(s). Fill these before the epic starts:`)
  for (const g of gaps) console.log(`   - ${g}`)
  return 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv))
}
