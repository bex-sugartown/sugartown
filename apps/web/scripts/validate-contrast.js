#!/usr/bin/env node
/**
 * validate-contrast.js — WCAG 2.2 AA contrast for design-token colour pairs (#160)
 *
 * Resolves the colour tokens for each theme from the same CSS files the browser
 * loads, derives the pairs to check from token names, and fails when a pair is
 * below its threshold. #150 to #152 fixed token contrast by hand; this is the
 * guard that fails when a token change undoes it.
 *
 * Pairs are derived, never listed (CLAUDE.md §Building a mechanism, rule 3):
 *   text      --st-X-fg on --st-X-bg, for every X that has both       4.5:1
 *   text      --st-color-text-* on --st-color-bg-canvas / -surface    4.5:1
 *   non-text  NON_TEXT_BORDERS against the fill they enclose and the
 *             surface they sit on                                     3:1
 * NON_TEXT_BORDERS is the one hand-kept list: decorative hairlines (dividers,
 * card edges) are exempt from 1.4.11, so which borders carry meaning is a
 * judgement a name pattern cannot make.
 *
 * Themes (base tokens.css :root plus the theme block that applies):
 *   light-pink-moon, dark-pink-moon, light, light-shop, dark-shop
 *
 * Known failures live in contrast-allowlist.json next to this file. An entry
 * names the themes it covers, the pair, a date and an issue written "#123".
 * A theme listed on an entry whose pair now passes fails the run, so the list
 * cannot go stale.
 *
 * Usage: pnpm validate:contrast
 * Exits 1 on a failing pair that is not allowlisted, a bad or stale allowlist
 * entry, or if fewer than MIN_PAIRS pairs were checked (a check of nothing).
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STYLES = resolve(__dirname, '../src/design-system/styles')
const ALLOWLIST = resolve(__dirname, 'contrast-allowlist.json')

const TEXT_MIN = 4.5
const NON_TEXT_MIN = 3
const MIN_PAIRS = 40

// Borders that identify a control or chip boundary (WCAG 1.4.11). Add a token
// here when its visible edge is what tells a person the control is there.
const NON_TEXT_BORDERS = ['--st-chip-border']
// What a non-text border is measured against: the fill it encloses, and the surfaces around it.
const BORDER_FILL = { '--st-chip-border': '--st-chip-tag-bg' }
const SURROUNDS = ['--st-color-bg-canvas', '--st-color-bg-surface']

// ─── CSS reading ─────────────────────────────────────────────────

const read = (f) => readFileSync(resolve(STYLES, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

function blocks(css) {
  const out = []
  const re = /([^{}]+)\{([^{}]*)\}/g
  for (let m; (m = re.exec(css)); ) {
    const decls = {}
    for (const d of m[2].split(';')) {
      const i = d.indexOf(':')
      if (i < 0) continue
      const k = d.slice(0, i).trim()
      if (k.startsWith('--')) decls[k] = d.slice(i + 1).trim()
    }
    out.push({ sel: m[1].trim(), decls })
  }
  return out
}

const merge = (list) => Object.assign({}, ...list.map((b) => b.decls))
const forTheme = (bs, name) => merge(bs.filter((b) => b.sel.includes(`"${name}"`)))

const base = merge(blocks(read('tokens.css')).filter((b) => /(^|,)\s*:root\s*(,|$)/.test(b.sel)))
const pinkMoon = blocks(read('theme.pink-moon.css'))
const lightTheme = blocks(read('theme.light.css'))
const shop = blocks(read('theme.shop.css'))

const THEMES = {
  'light-pink-moon': { ...base, ...forTheme(pinkMoon, 'light-pink-moon') },
  'dark-pink-moon': { ...base, ...forTheme(pinkMoon, 'dark-pink-moon') },
  light: { ...base, ...forTheme(lightTheme, 'light') },
  'light-shop': { ...base, ...forTheme(pinkMoon, 'light-pink-moon'), ...forTheme(shop, 'light-shop') },
  'dark-shop': { ...base, ...forTheme(pinkMoon, 'dark-pink-moon'), ...forTheme(shop, 'dark-shop') },
}

// ─── Colour maths ────────────────────────────────────────────────

function resolveVar(vars, v, depth = 0) {
  if (depth > 20 || v == null) return null
  v = v.trim()
  const m = v.match(/^var\((--[a-z0-9-]+)(?:\s*,\s*(.+))?\)$/i)
  if (!m) return v
  const target = vars[m[1]]
  if (target === undefined) return m[2] ? resolveVar(vars, m[2], depth + 1) : null
  return resolveVar(vars, target, depth + 1)
}

const over = ([r, g, b, a], bd) => [r * a + bd[0] * (1 - a), g * a + bd[1] * (1 - a), b * a + bd[2] * (1 - a)]

function parseColor(raw, vars, backdrop) {
  const s = resolveVar(vars, raw)
  if (!s) return null
  let m
  if ((m = s.match(/^#([0-9a-f]{3,8})$/i))) {
    let h = m[1]
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
    const n = (i) => parseInt(h.slice(i, i + 2), 16)
    return over([n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1], backdrop)
  }
  if ((m = s.match(/^rgba?\(([^)]+)\)$/i))) {
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
    return over([p[0], p[1], p[2], p[3] ?? 1], backdrop)
  }
  if (s === 'transparent') return backdrop
  if ((m = s.match(/^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+)\)$/i))) {
    const a = parseColor(m[1], vars, backdrop)
    const b = parseColor(m[3], vars, backdrop)
    if (!a || !b) return null
    const t = parseFloat(m[2]) / 100
    return a.map((x, i) => x * t + b[i] * (1 - t))
  }
  return null
}

const lum = ([r, g, b]) => {
  const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

// ─── Pair derivation and checking ────────────────────────────────

const results = []
const unresolved = []

function check(theme, vars, canvas, kind, fgName, bgName, min) {
  if (!vars[fgName] || !vars[bgName]) return
  const bg = parseColor(vars[bgName], vars, canvas)
  const fg = bg && parseColor(vars[fgName], vars, bg)
  if (!bg || !fg) {
    unresolved.push(`[${theme}] ${fgName} on ${bgName}`)
    return
  }
  const r = ratio(fg, bg)
  results.push({ theme, kind, fg: fgName, bg: bgName, ratio: r, min, fgHex: hex(fg), bgHex: hex(bg), pass: r >= min })
}

for (const [theme, vars] of Object.entries(THEMES)) {
  const canvas = parseColor(vars['--st-color-bg-canvas'], vars, [255, 255, 255]) ?? [255, 255, 255]
  const names = Object.keys(vars)

  for (const fg of names.filter((n) => /-fg$/.test(n))) {
    check(theme, vars, canvas, 'text', fg, fg.replace(/-fg$/, '-bg'), TEXT_MIN)
  }
  for (const fg of names.filter((n) => /^--st-color-text-[a-z0-9-]+$/.test(n))) {
    for (const surface of SURROUNDS) check(theme, vars, canvas, 'text', fg, surface, TEXT_MIN)
  }
  for (const border of NON_TEXT_BORDERS) {
    check(theme, vars, canvas, 'non-text', border, BORDER_FILL[border], NON_TEXT_MIN)
    for (const surface of SURROUNDS) check(theme, vars, canvas, 'non-text', border, surface, NON_TEXT_MIN)
  }
}

// ─── Allowlist ───────────────────────────────────────────────────

const allow = JSON.parse(readFileSync(ALLOWLIST, 'utf8'))
const problems = []
const key = (t, f, b) => `${t}|${f}|${b}`
const allowed = new Set()
for (const e of allow) {
  if (!/^#\d+$/.test(e.issue || '') || !/^\d{4}-\d{2}-\d{2}$/.test(e.date || '') || !Array.isArray(e.themes) || !e.themes.length) {
    problems.push(`allowlist entry ${e.fg} on ${e.bg} needs themes, a date (YYYY-MM-DD) and an issue like "#123"`)
    continue
  }
  for (const t of e.themes) {
    if (!THEMES[t]) problems.push(`allowlist entry ${e.fg} on ${e.bg} names an unknown theme "${t}"`)
    allowed.add(key(t, e.fg, e.bg))
  }
}

const failing = results.filter((r) => !r.pass)
const unallowed = failing.filter((r) => !allowed.has(key(r.theme, r.fg, r.bg)))
const stale = [...allowed].filter((k) => !failing.some((r) => key(r.theme, r.fg, r.bg) === k))

// ─── Report ──────────────────────────────────────────────────────

console.log('\n🎨  Sugartown Token Contrast Validator (WCAG 2.2 AA)')
console.log('══════════════════════════════════════════════\n')
for (const theme of Object.keys(THEMES)) {
  const rs = results.filter((r) => r.theme === theme)
  console.log(`   ${theme.padEnd(16)} ${rs.length} pairs, ${rs.filter((r) => !r.pass).length} below threshold`)
}
console.log(`\n   ${results.length} pairs checked, ${failing.length} below threshold (${failing.length - unallowed.length} allowlisted), ${unresolved.length} unresolved\n`)
for (const u of unresolved) console.log(`   ⚠️   could not resolve ${u} to colours; not checked`)
if (unresolved.length) console.log('')

for (const r of unallowed) {
  console.log(`   ❌  [${r.theme}] ${r.kind} ${r.fg} on ${r.bg}: ${r.ratio.toFixed(2)}:1 (needs ${r.min}:1)  ${r.fgHex} on ${r.bgHex}`)
}
for (const k of stale) {
  const [t, f, b] = k.split('|')
  console.log(`   ❌  allowlist entry is stale, the pair now passes: [${t}] ${f} on ${b}. Remove it.`)
}
for (const p of problems) console.log(`   ❌  ${p}`)

let failed = unallowed.length + stale.length + problems.length
if (results.length < MIN_PAIRS) {
  console.log(`   ❌  only ${results.length} pairs were checked (floor ${MIN_PAIRS}); the pair derivation found almost nothing`)
  failed++
}

if (failed) {
  console.log('\n❌  Token contrast check failed. Fix the token, or allowlist the pair with a date and an open issue.\n')
  process.exit(1)
}
console.log('✅  Every derived colour pair meets its WCAG 2.2 AA threshold (allowlisted pairs excepted).\n')
