#!/usr/bin/env node
/**
 * Dead-reference validator (SUG-231 post-mortem, 2026-07-22).
 *
 * Two "this file contradicts itself" checks. Neither compares the web and
 * package copies of a component — parity between two files is a relation the
 * rest of the toolchain cannot see, and SUG-231 §Behavioural parity records why
 * automating it is disproportionate. These check ONE file against ITSELF, which
 * is tractable, and both survive SUG-224 deleting the second copy.
 *
 *   Check 1 — styles.X referenced but .X not defined in the sibling module.
 *             Caught Table's `styles.wide`: applied for variant="wide", defined
 *             in neither stylesheet, silently dropped by .filter(Boolean).
 *
 *   Check 2 — a destructured prop never referenced again in the file.
 *             Caught FilterBar's `onClearAll`, which sat behind an
 *             `// eslint-disable-next-line no-unused-vars` — the suppression was
 *             a signed confession that someone noticed and moved on.
 *
 * Both failure modes are invisible to lint, TypeScript and Chromatic: the code
 * is valid, the types check, and the rendered output is stable — just wrong.
 *
 * Exit 1 on any finding. Allowlist genuinely-intentional cases in KNOWN_DEAD
 * with a reason, the same burn-down shape as validate-style-mirror's KNOWN_DRIFT.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

const ROOTS = [
  'apps/web/src/design-system/components',
  'packages/design-system/src/components',
]

// Pre-existing dead references, grandfathered so this check can be wired into
// pre-commit without a blind fix pass. The check BLOCKS on anything not listed
// here — a new dead reference fails immediately. Same shape as
// validate-style-mirror's KNOWN_DRIFT. As each is resolved, DELETE it.
//
// Format: 'File.ext styles.name' or 'File.ext prop:name'.
//
// ── Correct by design, not a burn-down item ──────────────────────────────────
//   Container's `bleed` size means "no max-width constraint", so the absence of
//   a rule IS the implementation — Container.module.css says so in a comment.
//   Listed rather than fixed because making it honest (`bleed: ''` in
//   SIZE_CLASS) is a change to a mirrored pair for zero behavioural gain.
//
// ── Genuine burn-down (found by this check on first run, 2026-07-22) ─────────
//   Accordion `.accordionNumbered` / `.itemOpen` — the `numbered` variant's
//   wrapper class and the item open-state class are undefined in BOTH copies.
//   The variant still partly renders via `.triggerNumbered`/`.qNumber`, and the
//   open state via `.panelOpen`/`.chevronOpen`, so this is a partial no-op
//   rather than a visible break. Resolving it means either writing the missing
//   rules or deleting the references — a visual decision, not a cleanup.
//   Sidebar `.sidebar` — the stylesheet defines `.panel`/`.sideLeft`/`.sideRight`
//   and never `.sidebar`. Web-only component, no package counterpart.
const KNOWN_DEAD = new Set([
  'Container.tsx styles.bleed',   // by design — see above
  'Accordion.tsx styles.accordionNumbered',
  'Accordion.tsx styles.itemOpen',
  'Sidebar.jsx styles.sidebar',
])

// Props that are legitimately declared but not referenced in the body.
const PROP_EXEMPT = new Set([
  'children',   // often only spread or implicitly rendered
  'className',  // frequently forwarded via a computed list built elsewhere
  'key',        // React-reserved, stripped before render
])

function walk(dir, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const e of entries) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

/**
 * Every class name the stylesheet defines.
 *
 * Deliberately over-matches: it takes any `.identifier` token, so classes
 * nested in @media blocks (`.responsive` in Stack) and compound selectors
 * (`.toneSubdued.zebra` in Table) both count as defined. Over-matching risks a
 * missed dead reference; under-matching would produce false failures on valid
 * code, which is far worse for a blocking check.
 */
function definedClasses(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const names = new Set()
  for (const m of withoutComments.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) names.add(m[1])
  return names
}

/**
 * Strip JS comments before scanning.
 *
 * Without this, prose describing a removed reference re-triggers the check —
 * Table.jsx's comment explaining why `styles.wide` was deleted was itself
 * reported as a dead `styles.wide` reference on the first run of this script.
 */
function stripJsComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

function checkStyleRefs(file, src, findings) {
  const cssPath = file.replace(/\.(jsx?|tsx?)$/, '.module.css')
  let css
  try { css = readFileSync(cssPath, 'utf8') } catch { return } // no sibling module
  const defined = definedClasses(css)
  const seen = new Set()
  for (const m of src.matchAll(/\bstyles\.([A-Za-z_]\w*)/g)) {
    const name = m[1]
    if (seen.has(name) || defined.has(name)) continue
    seen.add(name)
    const key = `${basename(file)} styles.${name}`
    if (KNOWN_DEAD.has(key)) { grandfathered.add(key); continue }
    findings.push({
      file, kind: 'dead-style-ref',
      msg: `styles.${name} is referenced but .${name} is not defined in ${basename(cssPath)}`,
    })
  }
}

function checkDeadProps(file, src, findings) {
  // Match the destructured params of an exported component function.
  const fnRe = /export\s+(?:default\s+)?function\s+([A-Z]\w*)\s*\(\s*\{([^}]*)\}/g
  for (const m of src.matchAll(fnRe)) {
    const [, fnName, paramBlock] = m
    const bodyStart = m.index + m[0].length
    const body = src.slice(bodyStart)

    for (const raw of paramBlock.split(',')) {
      const part = raw.trim()
      if (!part || part.startsWith('...')) continue
      // `name`, `name = default`, `name: alias`
      const nameMatch = part.match(/^([A-Za-z_]\w*)\s*(?::\s*([A-Za-z_]\w*))?/)
      if (!nameMatch) continue
      const local = nameMatch[2] || nameMatch[1]
      if (PROP_EXEMPT.has(local)) continue

      const used = new RegExp(`\\b${local}\\b`).test(body)
      if (used) continue
      const key = `${basename(file)} prop:${local}`
      if (KNOWN_DEAD.has(key)) { grandfathered.add(key); continue }
      findings.push({
        file, kind: 'dead-prop',
        msg: `${fnName}() destructures \`${local}\` but never references it — the prop is inert`,
      })
    }
  }
}

console.log('\n🔎  Sugartown Dead-Reference Validator')
console.log('══════════════════════════════════════════════\n')

const findings = []
const grandfathered = new Set()
let scanned = 0

for (const root of ROOTS) {
  const files = walk(resolve(REPO_ROOT, root)).filter(
    (f) => /\.(jsx|tsx)$/.test(f) && !/\.stories\./.test(f) && !/\.d\.ts$/.test(f),
  )
  for (const f of files) {
    const src = stripJsComments(readFileSync(f, 'utf8'))
    scanned++
    checkStyleRefs(f, src, findings)
    checkDeadProps(f, src, findings)
  }
}

console.log(`   Scanned ${scanned} component files across:`)
for (const r of ROOTS) console.log(`     ${r}`)
console.log('')

function reportGrandfathered() {
  if (grandfathered.size === 0) return
  console.log(`   ⚠️   ${grandfathered.size} known dead reference(s) grandfathered on KNOWN_DEAD:`)
  for (const k of [...grandfathered].sort()) console.log(`        ${k}`)
  console.log('        (Container bleed is by design; the rest are a burn-down.)\n')
}

const stale = [...KNOWN_DEAD].filter((k) => !grandfathered.has(k))

if (findings.length === 0) {
  reportGrandfathered()
  if (stale.length) {
    console.log(`   ℹ️   ${stale.length} KNOWN_DEAD entr(y/ies) no longer match anything — delete them:`)
    for (const k of stale.sort()) console.log(`        ${k}`)
    console.log('')
  }
  console.log('✅  No new dead style references or inert props found.\n')
  process.exit(0)
}

reportGrandfathered()

for (const f of findings) {
  console.log(`   ❌  ${f.file.replace(REPO_ROOT + '/', '')}`)
  console.log(`       ${f.msg}`)
}

console.log(`\n❌  ${findings.length} dead reference(s) found.\n`)
console.log('   Each is code that looks live but does nothing. Fix by either')
console.log('   removing the reference or implementing what it promises.')
console.log('   If a case is genuinely intentional, add it to KNOWN_DEAD in')
console.log('   this script with a reason.\n')
process.exit(1)
