#!/usr/bin/env node
/**
 * validate-style-mirror.js
 *
 * Enforces byte-identical parity for the design-system files that are duplicated
 * across the web app and the DS package. These files are NOT a single source of
 * truth — each exists in two locations and MUST stay identical:
 *
 *   apps/web/src/design-system/styles/<f>          ↔  packages/design-system/src/styles/<f>
 *   apps/web/src/design-system/components (each <Name>.module.css, recursively)
 *                                                  ↔  packages/design-system/src/components
 *
 * Two passes:
 *   1. Style files — a fixed list of shared token/theme/global CSS (below).
 *   2. Component CSS mirrors (SUG-214) — every <Name>.module.css that exists in
 *      BOTH component trees. Matched by filename, because the containing dir name
 *      differs in case (web `codeblock/` vs package `CodeBlock/`). Files present in
 *      only one tree (web-only adapter styles with no DS-package counterpart) are
 *      reported as informational skips, not failures.
 *
 * Why this exists (SUG / 2026-06-13):
 *   theme.pink-moon.css silently drifted — the DS-package copy decayed to a stale
 *   subset (93 missing tokens + 2 diverged values), so DS components rendered with
 *   fallback values in Storybook while production looked correct. validate:tokens
 *   did NOT catch it: it checks that every var(--st-*) reference RESOLVES, not that
 *   the two theme files carry the same override SET. "refs resolve" ≠ "themes match".
 * Why the component pass exists (SUG-214 / 2026-07-16):
 *   CodeBlock.module.css drifted across 7 areas between web and the DS package and
 *   stayed invisible for epics because this validator only covered the style files.
 *   The component pass closes that gap.
 *
 * tokens.css is generated to both locations by `pnpm tokens:build`; it is included
 * in pass 1 as defense-in-depth (catches a divergent/partial regeneration).
 *
 * Fix on failure:
 *   - tokens.css            → run `pnpm tokens:build` (regenerates both copies)
 *   - theme.*.css / globals / utilities → hand-authored; the web copy is canonical
 *     (production). Copy apps/web → packages/design-system, e.g.:
 *       cp apps/web/src/design-system/styles/<f> packages/design-system/src/styles/<f>
 *   - component <Name>.module.css → hand-authored mirror. Reconcile per the CLAUDE.md
 *     Mirrored File Registry drift rule (DS package is canonical for component CSS),
 *     then make the two copies byte-identical.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, basename } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../../..')

const WEB_DIR = 'apps/web/src/design-system/styles'
const DS_DIR = 'packages/design-system/src/styles'

const WEB_COMPONENTS_DIR = 'apps/web/src/design-system/components'
const DS_COMPONENTS_DIR = 'packages/design-system/src/components'

// The mirrored style files that MUST be byte-identical across both locations.
const MIRRORED = [
  'tokens.css',
  'theme.pink-moon.css',
  'theme.light.css',
  'theme.shop.css',
  'globals.css',
  'utilities.css',
]

console.log('\n🪞  Sugartown Style-Mirror Parity Validator')
console.log('══════════════════════════════════════════════\n')

let failures = 0

// ── Pass 1 — style files (fixed list) ────────────────────────────────────────
console.log(`   Pass 1 — ${MIRRORED.length} style files across:`)
console.log(`     ${WEB_DIR}`)
console.log(`     ${DS_DIR}\n`)

for (const file of MIRRORED) {
  const webPath = resolve(REPO_ROOT, WEB_DIR, file)
  const dsPath = resolve(REPO_ROOT, DS_DIR, file)

  if (!existsSync(webPath) || !existsSync(dsPath)) {
    console.log(`   ⚠️   ${file} — missing in one location (web:${existsSync(webPath)} ds:${existsSync(dsPath)})`)
    failures++
    continue
  }

  const web = readFileSync(webPath)
  const ds = readFileSync(dsPath)

  if (web.equals(ds)) {
    console.log(`   ✅  ${file}`)
  } else {
    failures++
    console.log(`   ❌  ${file} — DRIFT: the two copies are not byte-identical`)
  }
}

// ── Pass 2 — component CSS mirrors (SUG-214) ─────────────────────────────────
// Recursively collect every *.module.css, indexed by filename. Filenames are
// unique per component (one <Name>.module.css each), so the basename is a safe key
// that sidesteps the web/package directory-case mismatch.
function collectModuleCss(absDir) {
  const map = new Map()
  if (!existsSync(absDir)) return map
  for (const ent of readdirSync(absDir, { withFileTypes: true })) {
    const full = resolve(absDir, ent.name)
    if (ent.isDirectory()) {
      for (const [k, v] of collectModuleCss(full)) map.set(k, v)
    } else if (ent.name.endsWith('.module.css')) {
      map.set(ent.name, full)
    }
  }
  return map
}

// Known pre-existing component drifts, grandfathered pending reconciliation. The check
// BLOCKS on any drift NOT in this set — a new component or a regression in a currently-
// clean pair fails immediately (the SUG-212 failure mode). As each pair is reconciled to
// byte-identical, DELETE it from this set; the validator then enforces it permanently. A
// grandfathered pair that becomes identical on its own is reported so the entry can be
// removed. Goal: this set shrinks to empty.
//
// Burndown owners (surfaced by SUG-214):
//   SUG-217 — the 9 smaller drifts — ✅ RECONCILED 2026-07-21, all removed from this set
//   SUG-218 — Callout.module.css (major divergence)
//   SUG-219 — Card.module.css
const KNOWN_DRIFT = new Set([
  'Callout.module.css',    // SUG-218
  'Card.module.css',       // SUG-219
])

const webComponents = collectModuleCss(resolve(REPO_ROOT, WEB_COMPONENTS_DIR))
const dsComponents = collectModuleCss(resolve(REPO_ROOT, DS_COMPONENTS_DIR))

const pairs = [...webComponents.keys()].filter((name) => dsComponents.has(name)).sort()
const webOnly = [...webComponents.keys()].filter((name) => !dsComponents.has(name)).sort()
const dsOnly = [...dsComponents.keys()].filter((name) => !webComponents.has(name)).sort()

console.log(`\n   Pass 2 — ${pairs.length} component CSS mirrors across:`)
console.log(`     ${WEB_COMPONENTS_DIR}`)
console.log(`     ${DS_COMPONENTS_DIR}\n`)

let grandfathered = 0
let staleAllowlist = 0

for (const name of pairs) {
  const identical = readFileSync(webComponents.get(name)).equals(readFileSync(dsComponents.get(name)))
  if (identical) {
    if (KNOWN_DRIFT.has(name)) {
      staleAllowlist++
      console.log(`   ✅  ${name} — now identical; DELETE it from KNOWN_DRIFT in this script`)
    } else {
      console.log(`   ✅  ${name}`)
    }
  } else if (KNOWN_DRIFT.has(name)) {
    grandfathered++
    console.log(`   ⚠️   ${name} — known drift, grandfathered (SUG-217/218/219 burndown)`)
  } else {
    failures++
    console.log(`   ❌  ${name} — DRIFT: the two copies are not byte-identical`)
  }
}

// One-sided files are legitimate (web-only adapter styles with no DS counterpart).
// Report them so coverage is transparent — never silently skipped — but do not fail.
if (webOnly.length > 0) {
  console.log(`\n   ℹ️   ${webOnly.length} web-only (no DS-package counterpart, not compared): ${webOnly.map((n) => basename(n, '.module.css')).join(', ')}`)
}
if (dsOnly.length > 0) {
  console.log(`   ℹ️   ${dsOnly.length} DS-package-only (no web counterpart, not compared): ${dsOnly.map((n) => basename(n, '.module.css')).join(', ')}`)
}

console.log('\n══════════════════════════════════════════════')

if (staleAllowlist > 0) {
  console.log(`\n   ℹ️   ${staleAllowlist} KNOWN_DRIFT entr(y/ies) are now byte-identical — delete them from the allowlist in validate-style-mirror.js.`)
}

if (failures > 0) {
  console.log(`\n❌  ${failures} mirrored file(s) have drifted between web and the DS package.\n`)
  console.log('   These files must be byte-identical. To fix:')
  console.log('     • tokens.css            → pnpm tokens:build')
  console.log('     • theme.*/globals/utilities → web copy is canonical; cp apps/web/... → packages/design-system/...')
  console.log('     • component <Name>.module.css → reconcile per the CLAUDE.md Mirrored File Registry, then make both copies byte-identical\n')
  process.exit(1)
}

const grandfatheredNote = grandfathered > 0
  ? ` (${grandfathered} component pair(s) grandfathered on KNOWN_DRIFT, burning down via SUG-217/218/219)`
  : ''
console.log(`\n✅  All enforced style + component mirrors are byte-identical across web and the DS package.${grandfatheredNote}\n`)
