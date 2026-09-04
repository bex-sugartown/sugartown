#!/usr/bin/env node
/**
 * build-skills-index.js — regenerate the Claude Code half of docs/ai/skills-index.md.
 *
 * ST-112. CLAUDE.md §Building a mechanism, rule 3: a register is generated or it does not
 * exist. ST-103 found this index listing a retired skill and omitting six live ones, because
 * it was hand-maintained. Now the table between the two marker comments is derived from
 * .claude/skills/<name>/SKILL.md frontmatter and .claude/commands/<name>.md, and nothing
 * else in the file is touched: the Deprecated table (a record of what existed) and the
 * claude.ai section (not on disk) stay hand-maintained by design.
 *
 *   pnpm docs:skills-index          rewrite the generated block and the "Last updated" line
 *   pnpm docs:skills-index --check  exit 1 if the file on disk differs from what would be
 *                                   generated (for a session, /ship, or CI to call)
 *
 * Reader: docs/ai/README.md links the index. Kill criterion: retire this script if that
 * link goes. SKILLS_INDEX=<path> overrides the target, for tests against a copy.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const INDEX = process.env.SKILLS_INDEX || path.join(ROOT, 'docs/ai/skills-index.md')
const SKILLS = path.join(ROOT, '.claude/skills')
const COMMANDS = path.join(ROOT, '.claude/commands')
const START = '<!-- generated:claude-code-skills:start -->'
const END = '<!-- generated:claude-code-skills:end -->'

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/)
  const out = {}
  if (!m) return out
  const lines = m[1].split('\n')
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^(\w[\w-]*):\s*(.*)$/)
    if (!kv) continue
    let value = kv[2].trim()
    if (/^[>|][-+]?$/.test(value)) {
      // YAML block scalar: gather the indented continuation lines, join with spaces
      const parts = []
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) parts.push(lines[++i].trim())
      value = parts.join(' ')
    }
    out[kv[1]] = value.replace(/^["']|["']$/g, '')
  }
  return out
}

function firstSentence(s) {
  const t = s.replace(/\s+/g, ' ').trim()
  const m = t.match(/^(.+?[.!?])(\s|$)/)
  return (m ? m[1] : t).slice(0, 220)
}

function collect() {
  const rows = new Map()
  for (const dir of fs.readdirSync(SKILLS, { withFileTypes: true })) {
    if (!dir.isDirectory() || dir.name.startsWith('.') || dir.name === 'zArchive') continue
    const file = path.join(SKILLS, dir.name, 'SKILL.md')
    if (!fs.existsSync(file)) continue
    const fm = frontmatter(fs.readFileSync(file, 'utf8'))
    rows.set(fm.name || dir.name, { name: fm.name || dir.name, where: 'skills/', what: firstSentence(fm.description || '(no description)') })
  }
  if (fs.existsSync(COMMANDS)) {
    for (const f of fs.readdirSync(COMMANDS)) {
      if (!f.endsWith('.md')) continue
      const name = f.replace(/\.md$/, '')
      const text = fs.readFileSync(path.join(COMMANDS, f), 'utf8')
      const prompt = (text.match(/`\.\/([^`]+\.md)`/) || [])[1]
      const what = prompt ? `Thin command. Prompt: \`${prompt}\`` : firstSentence(text)
      if (rows.has(name)) rows.get(name).where = 'commands/ + skills/'
      else rows.set(name, { name, where: 'commands/', what })
    }
  }
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name))
}

function render(rows) {
  const lines = ['| Skill | Trigger | Where | What it does |', '|---|---|---|---|']
  for (const r of rows) lines.push(`| \`${r.name}\` | \`/${r.name}\` | \`${r.where}\` | ${r.what.replace(/\|/g, '\\|')} |`)
  return `${START}\n${lines.join('\n')}\n${END}`
}

function main() {
  const check = process.argv.includes('--check')
  const current = fs.readFileSync(INDEX, 'utf8')
  const a = current.indexOf(START), b = current.indexOf(END)
  if (a < 0 || b < 0) { console.error(`skills-index: markers ${START} / ${END} not found in ${INDEX}`); process.exit(2) }
  const today = new Date().toISOString().slice(0, 10)
  const rows = collect()
  let next = current.slice(0, a) + render(rows) + current.slice(b + END.length)
  const changed = next !== current
  if (changed) next = next.replace(/^\*\*Last updated:\*\* .*$/m, `**Last updated:** ${today} (generated block)`)
  if (check) {
    if (changed) { console.error('skills-index: STALE — run pnpm docs:skills-index'); process.exit(1) }
    console.log('skills-index: up to date'); return
  }
  if (changed) { fs.writeFileSync(INDEX, next); console.log(`skills-index: regenerated (${rows.length} rows)`) }
  else console.log('skills-index: no change')
}
main()
