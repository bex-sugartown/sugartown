#!/usr/bin/env node
/**
 * collab-time — how long a document took to collaborate on.
 *
 * Reads Claude Code session transcripts and reports active time, Bex's message
 * count and the date range for one document, then prints a metadata block to
 * paste into that document.
 *
 * Usage:
 *   node scripts/collab-time.js 218
 *   node scripts/collab-time.js ST-218-blu-nami-congress-product-manager
 *   node scripts/collab-time.js PROJ-003 --json
 *   node scripts/collab-time.js 218 --loose     (count mention-only sessions too)
 *
 * Attribution: a session counts only when it EDITED a file whose path contains
 * the target, or ran a command naming the target. A session that merely mentions
 * it is listed as excluded, with its mention count, so a human can override with
 * --loose. This exists because a mention-only match over-counted by 310 minutes
 * on the first run (#218, 2026-11-27).
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const PROJECT_DIR = path.join(
  os.homedir(),
  '.claude/projects/-Users-beckyalice-SUGARTOWN-DEV-sugartown',
)
const CAPS = { tight: 5 * 60, loose: 15 * 60 }
const EDIT_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit', 'MultiEdit'])

const args = process.argv.slice(2)
const target = args.find((a) => !a.startsWith('--'))
const asJson = args.includes('--json')
const loose = args.includes('--loose')

if (!target) {
  console.error('usage: node scripts/collab-time.js <issue-number|slug|doc-id> [--json] [--loose]')
  process.exit(2)
}

// An issue number alone is too short to match safely on its own, so require it
// to appear in an issue-shaped context.
const isIssueNumber = /^\d+$/.test(target)
const needles = isIssueNumber
  ? [`issue comment ${target}`, `issues/${target}`, `issue view ${target}`, `ST-${target}-`, `#${target}`]
  : [target]

const mentions = (s) => needles.some((n) => s.includes(n))

function scanSession(file) {
  const out = { file, events: [], bexMsgs: 0, worked: false, mentionCount: 0, why: null }
  let text
  try {
    text = fs.readFileSync(path.join(PROJECT_DIR, file), 'utf8')
  } catch {
    return null
  }
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    if (!line.includes('collab-time') && mentions(line)) out.mentionCount++
    let o
    try {
      o = JSON.parse(line)
    } catch {
      continue
    }
    if (o.timestamp) {
      const d = new Date(o.timestamp)
      if (!Number.isNaN(+d)) out.events.push(d)
    }
    const msg = o.message
    if (!msg || typeof msg !== 'object') continue

    // Bex's own messages: user-role text that is not a system reminder or tool result.
    if (o.type === 'user') {
      const c = msg.content
      const txt =
        typeof c === 'string'
          ? c
          : Array.isArray(c)
            ? c.filter((b) => b && b.type === 'text').map((b) => b.text || '').join(' ')
            : ''
      if (txt.trim() && !txt.trim().startsWith('<')) out.bexMsgs++
    }

    // Did this session actually work on the target?
    for (const b of Array.isArray(msg.content) ? msg.content : []) {
      if (!b || b.type !== 'tool_use') continue
      const input = b.input || {}
      if (EDIT_TOOLS.has(b.name) && typeof input.file_path === 'string' && mentions(input.file_path)) {
        out.worked = true
        out.why = out.why || `edited ${path.basename(input.file_path)}`
      }
      if (b.name === 'Bash' && typeof input.command === 'string') {
        const cmd = input.command
        // Never let the measuring tool attribute the measuring session to its
        // own target. Found 2026-11-27: `collab-time PROJ-003` counted itself.
        const selfReferential = cmd.includes('collab-time')
        // Only writes count. A grep, ls or cat naming the target is reading
        // about it, not working on it.
        const isWrite =
          /\bgh\s+issue\s+(comment|edit|close|create)\b/.test(cmd) ||
          /\bgit\s+(add|commit|mv|rm)\b/.test(cmd) ||
          /\bsanity\s+(exec|schema\s+deploy)\b/.test(cmd)
        if (!selfReferential && isWrite && mentions(cmd)) {
          out.worked = true
          out.why = out.why || 'committed or commented on it'
        }
      }
      if (b.name && b.name.startsWith('mcp__Sanity__')) {
        const blob = JSON.stringify(input)
        if (mentions(blob)) {
          out.worked = true
          out.why = out.why || 'wrote or queried it in Sanity'
        }
      }
    }
  }
  out.events.sort((a, b) => a - b)
  return out
}

const activeSeconds = (events, cap) => {
  let total = 0
  for (let i = 0; i < events.length - 1; i++) {
    total += Math.min((events[i + 1] - events[i]) / 1000, cap)
  }
  return total
}

const hm = (sec) => {
  const m = Math.round(sec / 60)
  return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`
}
const ymd = (d) => d.toLocaleDateString('en-CA')

let files
try {
  files = fs.readdirSync(PROJECT_DIR).filter((f) => f.endsWith('.jsonl'))
} catch {
  console.error(`No transcripts at ${PROJECT_DIR}`)
  process.exit(1)
}

const scanned = files.map(scanSession).filter((s) => s && s.mentionCount > 0 && s.events.length > 1)
const counted = scanned.filter((s) => s.worked || loose)
const excluded = scanned.filter((s) => !s.worked && !loose)

if (!counted.length) {
  console.error(`No session worked on "${target}".`)
  if (excluded.length) {
    console.error(`${excluded.length} session(s) mention it without editing it. Re-run with --loose to include them.`)
  }
  process.exit(1)
}

// Per-day aggregation across every counted session.
const byDay = new Map()
let bexMsgs = 0
for (const s of counted) {
  bexMsgs += s.bexMsgs
  for (const d of s.events) {
    const k = ymd(d)
    if (!byDay.has(k)) byDay.set(k, [])
    byDay.get(k).push(d)
  }
}
const days = [...byDay.keys()].sort()
for (const k of days) byDay.get(k).sort((a, b) => a - b)

let tight = 0
let looseTotal = 0
for (const k of days) {
  tight += activeSeconds(byDay.get(k), CAPS.tight)
  looseTotal += activeSeconds(byDay.get(k), CAPS.loose)
}

const measured = ymd(new Date())
const range = days.length === 1 ? days[0] : `${days[0]} to ${days[days.length - 1]}`
const cmd = `pnpm collab:time ${target}`
const metadata =
  `${hm(looseTotal)} active across ${days.length} day${days.length === 1 ? '' : 's'}, ` +
  `${range} · ${bexMsgs} messages from Bex · measured ${measured} by \`${cmd}\``

if (asJson) {
  console.log(
    JSON.stringify(
      {
        target,
        activeSecondsTight: Math.round(tight),
        activeSecondsLoose: Math.round(looseTotal),
        days: days.length,
        firstDay: days[0],
        lastDay: days[days.length - 1],
        bexMessages: bexMsgs,
        sessionsCounted: counted.length,
        sessionsExcluded: excluded.length,
        measured,
        metadata,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

console.log(`\ncollab-time — ${target}\n`)
console.log(`${'day'.padEnd(12)}${'window'.padEnd(14)}${'active 5m'.padStart(10)}${'active 15m'.padStart(12)}`)
for (const k of days) {
  const e = byDay.get(k)
  const win = `${e[0].toTimeString().slice(0, 5)}-${e[e.length - 1].toTimeString().slice(0, 5)}`
  console.log(
    k.padEnd(12) +
      win.padEnd(14) +
      hm(activeSeconds(e, CAPS.tight)).padStart(10) +
      hm(activeSeconds(e, CAPS.loose)).padStart(12),
  )
}
console.log('-'.repeat(48))
console.log('TOTAL'.padEnd(26) + hm(tight).padStart(10) + hm(looseTotal).padStart(12))

console.log(`\nBex messages: ${bexMsgs}`)
console.log(`Sessions counted: ${counted.length}`)
for (const s of counted) console.log(`  + ${s.file.slice(0, 8)}  ${s.why || 'included via --loose'}`)
if (excluded.length) {
  console.log(`Sessions excluded (mention only, never edited it):`)
  for (const s of excluded) console.log(`  - ${s.file.slice(0, 8)}  ${s.mentionCount} mention(s)`)
  console.log(`  Re-run with --loose to include them.`)
}

console.log(`\nPaste into the document's metadata:\n`)
console.log(`| **Collaboration** | ${metadata} |`)
console.log()
