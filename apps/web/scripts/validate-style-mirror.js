#!/usr/bin/env node
/**
 * validate-style-mirror.js
 *
 * Enforces byte-identical parity for the design-system style files that are
 * duplicated across the web app and the DS package. These files are NOT a single
 * source of truth — each exists in two locations and MUST stay identical:
 *
 *   apps/web/src/design-system/styles/<f>   ↔   packages/design-system/src/styles/<f>
 *
 * Why this exists (SUG / 2026-06-13):
 *   theme.pink-moon.css silently drifted — the DS-package copy decayed to a stale
 *   subset (93 missing tokens + 2 diverged values), so DS components rendered with
 *   fallback values in Storybook while production looked correct. validate:tokens
 *   did NOT catch it: it checks that every var(--st-*) reference RESOLVES, not that
 *   the two theme files carry the same override SET. "refs resolve" ≠ "themes match".
 *   This check closes that gap by asserting the files are byte-identical.
 *
 * tokens.css is generated to both locations by `pnpm tokens:build`; it is included
 * here as defense-in-depth (catches a divergent/partial regeneration).
 *
 * Fix on failure:
 *   - tokens.css            → run `pnpm tokens:build` (regenerates both copies)
 *   - theme.*.css / globals / utilities → these are hand-authored. The web copy is
 *     canonical (production). Copy apps/web → packages/design-system, e.g.:
 *       cp apps/web/src/design-system/styles/<f> packages/design-system/src/styles/<f>
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../../..')

const WEB_DIR = 'apps/web/src/design-system/styles'
const DS_DIR = 'packages/design-system/src/styles'

// The mirrored style files that MUST be byte-identical across both locations.
const MIRRORED = [
  'tokens.css',
  'theme.pink-moon.css',
  'theme.light.css',
  'globals.css',
  'utilities.css',
]

console.log('\n🪞  Sugartown Style-Mirror Parity Validator')
console.log('══════════════════════════════════════════════\n')
console.log(`   Comparing ${MIRRORED.length} style files across:`)
console.log(`     ${WEB_DIR}`)
console.log(`     ${DS_DIR}\n`)

let failures = 0

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

console.log('\n══════════════════════════════════════════════')

if (failures > 0) {
  console.log(`\n❌  ${failures} style file(s) have drifted between web and the DS package.\n`)
  console.log('   These files must be byte-identical. To fix:')
  console.log('     • tokens.css            → pnpm tokens:build')
  console.log('     • theme.*/globals/utilities → web copy is canonical; cp apps/web/... → packages/design-system/...\n')
  process.exit(1)
}

console.log('\n✅  All mirrored style files are byte-identical across web and the DS package.\n')
