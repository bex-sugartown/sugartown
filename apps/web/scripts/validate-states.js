#!/usr/bin/env node
/**
 * validate-states.js — interaction-state coverage for design-system components (ST-252 post-mortem).
 *
 * Reads every component stylesheet and its TSX and checks, per component:
 *   - hover rule present            -> pressed (:active) rule present
 *   - clickable or focusable markup -> focus rule present (:focus-visible, or :focus for form fields)
 *   - `disabled` in the TSX         -> a disabled rule present
 *   - every `:hover` selector in any stylesheet sits inside `@media (hover: hover)` (#267), so a tap
 *     on a touch device does not leave the hover look behind; pressed stays the touch feedback
 *
 * The contract is docs/shipped/ST-251-*.md and ST-252-*.md. Known gaps live in
 * state-allowlist.json next to this file, each with a reason. A gap that is not allowlisted fails;
 * an allowlist entry whose gap is closed also fails, so the list only shrinks.
 *
 * Run: node scripts/validate-states.js   (pnpm validate:states)
 * Reader: .husky/pre-commit and the lint job in .github/workflows/ci.yml.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../..')
const DIRS = [
  join(ROOT, 'packages/design-system/src/components'),
  join(ROOT, 'apps/web/src/design-system/components'),
]
const allow = JSON.parse(readFileSync(resolve(__dirname, 'state-allowlist.json'), 'utf8'))

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')
const gaps = []

for (const dir of DIRS) {
  for (const name of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
    const folder = join(dir, name)
    const files = readdirSync(folder)
    const css = files.filter((f) => f.endsWith('.module.css')).map((f) => read(join(folder, f))).join('\n')
    const tsx = files.filter((f) => /\.(tsx|jsx)$/.test(f) && !/stories/.test(f)).map((f) => read(join(folder, f))).join('\n')
    if (!css) continue
    const hasHover = /:hover/.test(css)
    const clickable = /<(button|a|input|select|textarea|summary)\b|onClick|role=["'](button|tab|link|radio)["']/.test(tsx) || /<(Link|a)\b/.test(tsx)
    if (hasHover && !/:active/.test(css)) gaps.push(`${name}: pressed (:active)`)
    if ((hasHover || clickable) && clickable && !/:focus(-visible)?\b/.test(css)) gaps.push(`${name}: focus (:focus-visible or :focus)`)
    if (/\bdisabled\b/.test(tsx) && !/disabled/.test(css)) gaps.push(`${name}: disabled`)
  }
}

// #267: a `:hover` rule outside `@media (hover: hover)` sticks after a tap on touch devices.
const CSS_ROOTS = [join(ROOT, 'packages/design-system/src'), join(ROOT, 'apps/web/src')]
const cssFiles = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    if (n === 'node_modules' || n === 'generated') return []
    return statSync(p).isDirectory() ? cssFiles(p) : n.endsWith('.css') ? [p] : []
  })
const unguarded = []
for (const file of CSS_ROOTS.flatMap(cssFiles)) {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
  const stack = [] // one entry per open brace: its prelude text
  let prelude = ''
  let line = 1
  for (const ch of css) {
    if (ch === '\n') line++
    if (ch === '{') {
      const guarded = stack.some((p) => /@media[^{]*\(\s*hover\s*:\s*hover\s*\)/.test(p))
      if (/:hover\b/.test(prelude) && !prelude.trim().startsWith('@') && !guarded) {
        unguarded.push(`${file.slice(ROOT.length + 1)}:${line}  ${prelude.trim().replace(/\s+/g, ' ').slice(0, 70)}`)
      }
      stack.push(prelude)
      prelude = ''
    } else if (ch === '}') {
      stack.pop()
      prelude = ''
    } else if (ch === ';') {
      prelude = ''
    } else prelude += ch
  }
}

const allowed = new Map(allow.map((a) => [`${a.component}: ${a.state}`, a.reason]))
const unlisted = gaps.filter((g) => !allowed.has(g))
const stale = [...allowed.keys()].filter((k) => !gaps.includes(k))

console.log('\nSugartown interaction-state coverage')
console.log(`  ${gaps.length} gap(s) found, ${gaps.length - unlisted.length} allowlisted\n`)
if (unlisted.length) {
  console.log('Not allowlisted (add the state, or add an entry with a reason to scripts/state-allowlist.json):')
  unlisted.forEach((g) => console.log('  - ' + g))
}
if (stale.length) {
  console.log('Allowlist entries whose gap is closed (remove them from scripts/state-allowlist.json):')
  stale.forEach((g) => console.log('  - ' + g))
}
if (unguarded.length) {
  console.log('Hover rules outside @media (hover: hover) (wrap each one; keep a :focus-visible selector outside it):')
  unguarded.forEach((g) => console.log('  - ' + g))
}
if (unlisted.length || stale.length || unguarded.length) process.exit(1)
console.log('All components cover the states they declare.')
