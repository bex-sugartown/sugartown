#!/usr/bin/env node
/**
 * validate-validators.js — Enforcement-Visibility Meta-Check
 *
 * Enumerates every `validate:*` script across the root and every workspace
 * package.json, and asserts each one is actually referenced by name in
 * `.husky/pre-commit` or a `.github/workflows/*.yml` file — or is explicitly
 * listed in MANUAL_BY_DESIGN with a one-line reason.
 *
 * Exists because `validate:css-names`, `validate:taxonomy`, and
 * `validate:schema-parity` were all built to enforce a documented rule, then
 * silently ran on no hook and no CI job for months — CLAUDE.md and shipped
 * epic docs kept claiming coverage that didn't exist. This makes that class
 * of decay structurally impossible to repeat silently. See SUG-239.
 *
 * Usage:
 *   pnpm validate:validators
 *
 * Exit codes:
 *   0 — every validate:* script is wired or allowlisted
 *   1 — at least one validate:* script is neither wired nor allowlisted
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ─── Scripts that are deliberately manual — not run by any hook or CI job ─────
// Each entry needs a real reason. This list is audited, not a dumping ground.

const MANUAL_BY_DESIGN = {
  'validate:content': 'requires Sanity API + long runtime — run manually pre-PR, not on every commit or push',
}

// ─── Discover every package.json in the workspace ─────────────────────────────

function findWorkspacePackageJsons() {
  const files = [resolve(ROOT, 'package.json')]
  for (const group of ['apps', 'packages']) {
    const groupDir = resolve(ROOT, group)
    if (!existsSync(groupDir)) continue
    for (const entry of readdirSync(groupDir)) {
      const entryPath = join(groupDir, entry)
      if (!statSync(entryPath).isDirectory()) continue
      const pkgPath = join(entryPath, 'package.json')
      if (existsSync(pkgPath)) files.push(pkgPath)
    }
  }
  return files
}

// ─── Collect every validate:* script name, and which package.json files define it ─

function collectValidateScripts(pkgPaths) {
  const scripts = new Map() // name -> [relative package.json paths]
  for (const pkgPath of pkgPaths) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    const rel = pkgPath.replace(ROOT + '/', '')
    for (const name of Object.keys(pkg.scripts || {})) {
      if (!name.startsWith('validate:')) continue
      if (!scripts.has(name)) scripts.set(name, [])
      scripts.get(name).push(rel)
    }
  }
  return scripts
}

// ─── Check whether a script name is referenced (as itself, not as a prefix of
// a longer namespaced script name) in a block of hook/workflow text ────────────

function isReferenced(name, text) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\:]/g, '\\$&')
  const re = new RegExp(`(^|[^:\\w-])${escaped}($|[^:\\w-])`)
  return re.test(text)
}

function findWorkflowFiles() {
  const dir = resolve(ROOT, '.github/workflows')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map((f) => join(dir, f))
}

// ─── Main ───────────────────────────────────────────────────────────────────

function run() {
  console.log('\n🧭  Sugartown Enforcement-Visibility Meta-Check')
  console.log('══════════════════════════════════════════════\n')

  const pkgPaths = findWorkspacePackageJsons()
  const scripts = collectValidateScripts(pkgPaths)

  const hookPath = resolve(ROOT, '.husky/pre-commit')
  const hookContent = existsSync(hookPath) ? readFileSync(hookPath, 'utf8') : ''

  const workflowFiles = findWorkflowFiles()
  const workflowContent = workflowFiles.map((f) => readFileSync(f, 'utf8')).join('\n')

  const wired = []
  const manual = []
  const orphaned = []

  for (const [name, sources] of [...scripts.entries()].sort()) {
    if (name in MANUAL_BY_DESIGN) {
      manual.push({ name, sources, reason: MANUAL_BY_DESIGN[name] })
      continue
    }
    const inHook = isReferenced(name, hookContent)
    const inWorkflow = isReferenced(name, workflowContent)
    if (inHook || inWorkflow) {
      wired.push({ name, sources, via: inHook ? '.husky/pre-commit' : 'CI workflow' })
    } else {
      orphaned.push({ name, sources })
    }
  }

  console.log(`   Found ${scripts.size} validate:* script(s) across ${pkgPaths.length} package.json file(s)\n`)

  console.log(`   ✅  ${wired.length} wired (pre-commit or CI)`)
  console.log(`   📋  ${manual.length} manual-by-design (allowlisted)`)
  console.log(`   ${orphaned.length > 0 ? '❌' : '✅'}  ${orphaned.length} orphaned\n`)

  if (orphaned.length > 0) {
    console.log('──────────────────────────────────────────────')
    console.log('\n   Orphaned — referenced by no hook, no CI job, and no allowlist entry:\n')
    for (const { name, sources } of orphaned) {
      console.log(`   ✗  ${name}`)
      console.log(`        defined in: ${sources.join(', ')}`)
    }
    console.log('\n──────────────────────────────────────────────')
    console.log('\n   Fix: add it to .husky/pre-commit (fast, local, no API), to a')
    console.log('   .github/workflows/*.yml job (needs Sanity API or is slow), or to')
    console.log('   MANUAL_BY_DESIGN in this script with a real one-line reason.\n')
    process.exit(1)
  }

  process.exit(0)
}

run()
