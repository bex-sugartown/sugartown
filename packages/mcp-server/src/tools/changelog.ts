import { z } from 'zod'
import { readRepoFile } from '../lib/file-reader.js'

const CHANGELOG_PATH = ['CHANGELOG.md']

export const getChangelogInputSchema = {
  n: z.number().int().positive().optional().describe('Number of entries to return, counting [Unreleased] as the first entry when non-empty. Default 5.'),
}

export interface ChangelogEntry {
  version: string
  date?: string
  summary: string
  body: string
}

const SECTION_HEADER = /^## \[([^\]]+)\](?:\s*—\s*(.+))?$/

export function parseChangelog(): ChangelogEntry[] {
  const raw = readRepoFile(...CHANGELOG_PATH)
  const lines = raw.split('\n')

  const entries: ChangelogEntry[] = []
  let current: { version: string; date?: string; bodyLines: string[] } | undefined

  const flush = () => {
    if (!current) return
    const body = current.bodyLines.join('\n').trim()
    const firstLine = current.bodyLines.map((l) => l.trim()).find((l) => l.length > 0 && !l.startsWith('#') && l !== '---')
    entries.push({
      version: current.version,
      date: current.date,
      summary: firstLine ?? '',
      body,
    })
  }

  for (const line of lines) {
    const match = SECTION_HEADER.exec(line)
    if (match) {
      flush()
      current = { version: match[1], date: match[2]?.trim(), bodyLines: [] }
      continue
    }
    if (current) current.bodyLines.push(line)
  }
  flush()

  return entries
}

export function getChangelog(n = 5): ChangelogEntry[] {
  const sections = parseChangelog()
  const unreleased = sections.find((s) => s.version === 'Unreleased')
  const versioned = sections.filter((s) => s.version !== 'Unreleased')

  const result: ChangelogEntry[] = []
  if (unreleased && unreleased.body.trim().length > 0) {
    result.push(unreleased)
  }
  result.push(...versioned.slice(0, Math.max(0, n - result.length)))

  return result.slice(0, n)
}
