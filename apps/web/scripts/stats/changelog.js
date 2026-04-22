/**
 * changelog.js — release namespace collector (SUG-67)
 *
 * Parses CHANGELOG.md and returns structured release data.
 * The CHANGELOG format is the contract — see docs/release-assistant-prompt.md.
 *
 * ## [x.y.z] — YYYY-MM-DD
 * Descriptor line (first non-empty, non-heading line after the version heading)
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const CHANGELOG_PATH = resolve(process.cwd(), '../../CHANGELOG.md')

function semverKind(curr, prev) {
  if (!prev) return 'PATCH'
  const [maj, min] = curr.split('.').map(Number)
  const [pmaj, pmin] = prev.split('.').map(Number)
  if (maj > pmaj) return 'MAJOR'
  if (min > pmin) return 'MINOR'
  return 'PATCH'
}

export function collectChangelog() {
  const text = readFileSync(CHANGELOG_PATH, 'utf-8')

  const headingRe = /^## \[(\d+\.\d+\.\d+)\] — (\d{4}-\d{2}-\d{2})/gm
  const positions = []
  let m

  while ((m = headingRe.exec(text)) !== null) {
    positions.push({
      version: m[1],
      date: m[2],
      contentStart: m.index + m[0].length,
    })
  }

  if (positions.length === 0) {
    throw new Error(`changelog.js: no ## [x.y.z] — date headings found in ${CHANGELOG_PATH}`)
  }

  const entries = positions.map((pos, i) => {
    const sectionEnd = i + 1 < positions.length ? positions[i + 1].contentStart - positions[i + 1].contentStart : text.length
    const nextPos = i + 1 < positions.length ? positions[i + 1].contentStart : text.length
    const section = text.slice(pos.contentStart, nextPos)

    const descriptor = section
      .split('\n')
      .map(l => l.trim())
      .find(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('---') && !l.startsWith('>'))
      || ''

    const linearMatch = section.match(/\bSUG-(\d+)\b/)
    const linearIssue = linearMatch ? `SUG-${linearMatch[1]}` : null
    const kind = semverKind(pos.version, positions[i + 1]?.version)

    return { version: pos.version, date: pos.date, descriptor, kind, linearIssue }
  })

  const count = entries.reduce(
    (acc, e) => {
      acc.total++
      if (e.kind === 'MAJOR') acc.major++
      else if (e.kind === 'MINOR') acc.minor++
      else acc.patch++
      return acc
    },
    { total: 0, major: 0, minor: 0, patch: 0 }
  )

  return {
    current: entries[0] || null,
    latestN: entries.slice(0, 5),
    count,
  }
}
