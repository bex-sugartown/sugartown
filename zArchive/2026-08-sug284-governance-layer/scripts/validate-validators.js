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
 * CHECK 2 — warn-gate pairing (SUG-281 Phase 1) ────────────────────────────────
 *
 * Check 1 answers "is this gate wired?" and cannot tell a blocking step from a
 * `continue-on-error: true` one. A warn-only step passes it while failing the
 * build nowhere and reporting to nobody: the run concludes `success`, so
 * `ci-failure-alert.yml:32` (`if: ... conclusion == 'failure'`) never fires.
 *
 * So a warn-only step's ONLY artifact is a follow-on annotation step, and that
 * step is silently defeatable in two ways GitHub does not error on:
 *
 *   - a renamed or mistyped `id` makes `if: steps.<id>.outcome == 'failure'`
 *     evaluate false forever;
 *   - renaming the annotation title in ci.yml leaves `/eod` grepping a literal
 *     that no longer appears.
 *
 * Both produce "no warn gate fired" indistinguishable from "nothing fired" —
 * the same drift-between-two-declarations class that is most of this repo's
 * incident log. This check makes the pairing structural: every
 * `continue-on-error: true` step must carry an `id`, and a later step in the
 * same job must gate on that exact id's `outcome` and emit WARN_GATE_TITLE.
 * The `/eod` prompt is checked for the same literal, so the title cannot be
 * renamed on one side only.
 *
 * Usage:
 *   pnpm validate:validators
 *
 * Exit codes:
 *   0 — every validate:* script is wired or allowlisted, and every warn-only
 *       step is correctly paired with its annotation step
 *   1 — at least one validate:* script is neither wired nor allowlisted, or at
 *       least one warn-only step has no readable artifact
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

// ─── Warn-gate pairing ───────────────────────────────────────────────────────
//
// The annotation title is declared HERE and nowhere else in code. ci.yml and
// eod-prompt.md are both checked against this constant, so the three copies
// cannot drift apart silently — change it here and both sides fail until they
// match.

const WARN_GATE_TITLE = 'WARN-GATE'

// Match the FULL annotation token, delimiters included — never a bare
// `includes('WARN-GATE')`. A substring test passes any title that merely starts
// with the literal, so renaming the annotation to `WARN-GATE-DRIFTED` satisfied
// it and this check reported a drifted channel as correctly paired. Caught by
// its own liveness probe on 2026-08-11, and the same substring-collision class
// that `validate-control-register.js:188-200` documents for gate names.
const WARN_GATE_ANNOTATION = `::warning title=${WARN_GATE_TITLE}::`

const EOD_PROMPT = resolve(ROOT, 'docs/workflows/eod-prompt.md')

// `continue-on-error` steps that are NOT gates and legitimately need no
// WARN-GATE annotation. Keyed by `<workflow file>:<step name>`. Each entry must
// name the reader that already sees the failure — "it doesn't matter" is not a
// reader. Audited, not a dumping ground; same discipline as MANUAL_BY_DESIGN.

const WARN_STEP_READER_BY_DESIGN = {
  'stats.yml:Run Lighthouse CI':
    'not a gate — a flaky data collector. Its failure IS read: collect-stats.js:46 marks the ' +
    'perf section stale and falls back to stats.last-good.json. Whether staleness is *rendered* ' +
    'is CTL-029, not this check.',
}

// Line-based step parser. No YAML dependency exists in this workspace and
// adding one to read four fields is not worth the supply-chain surface; the
// tradeoff is that this understands the formatting this repo actually uses
// (2-space job keys, 6-space step bodies) and would need revisiting if a
// workflow adopted flow-style mappings or tabs. parseWorkflowSteps() returning
// zero steps across every workflow file is treated as a parser failure rather
// than a pass — a check that reports green over a corpus it failed to read is
// the exact shape this script exists to prevent.

function parseWorkflowSteps(file) {
  const lines = readFileSync(file, 'utf8').split('\n')
  const steps = []
  let job = '(unknown)'
  let current = null

  const push = () => {
    if (current) steps.push(current)
    current = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(#.*)?$/.test(line)) {
      if (current) current.body.push(line)
      continue
    }

    // A 2-space-indented `key:` directly under `jobs:` names a job.
    const jobMatch = line.match(/^ {2}([A-Za-z_][\w-]*):\s*$/)
    if (jobMatch) {
      push()
      job = jobMatch[1]
      continue
    }

    const stepMatch = line.match(/^(\s*)- (\w[\w-]*):/)
    if (stepMatch) {
      push()
      current = {
        file,
        job,
        indent: stepMatch[1].length,
        line: i + 1,
        body: [line],
      }
      continue
    }

    if (current) {
      const indent = line.match(/^(\s*)/)[1].length
      if (indent > current.indent) current.body.push(line)
      else push()
    }
  }
  push()

  return steps.map((s) => {
    const text = s.body.join('\n')
    return {
      ...s,
      text,
      name: (text.match(/^\s*-?\s*name:\s*(.+)$/m) || [, ''])[1].trim(),
      id: (text.match(/^\s*id:\s*([\w-]+)\s*(?:#.*)?$/m) || [, null])[1],
      // Trailing comments are permitted on both keys. Anchoring to end-of-line
      // without allowing `# ...` silently missed stats.yml's Lighthouse step —
      // an undercount in the check that exists to find unread failures, and the
      // same defect class as validate-doc-budget.js's `hard-stop` stop regex.
      continueOnError: /^\s*continue-on-error:\s*true\s*(?:#.*)?$/m.test(text),
    }
  })
}

function checkWarnGatePairing(workflowFiles) {
  const problems = []
  const allSteps = []

  for (const file of workflowFiles) allSteps.push(...parseWorkflowSteps(file))

  if (allSteps.length === 0) {
    problems.push(
      'Parsed 0 steps from every workflow file. The warn-gate pairing check ' +
        'read nothing, so it proved nothing — treat this as a parser failure, not a pass.'
    )
    return { problems, warnSteps: [] }
  }

  const allWarnSteps = allSteps.filter((s) => s.continueOnError)
  const allowlisted = []
  const warnSteps = []

  for (const step of allWarnSteps) {
    const key = `${step.file.replace(ROOT + '/.github/workflows/', '')}:${step.name}`
    if (key in WARN_STEP_READER_BY_DESIGN) allowlisted.push({ ...step, key })
    else warnSteps.push(step)
  }

  for (const step of warnSteps) {
    const where = `${step.file.replace(ROOT + '/', '')}:${step.line}`
    const label = step.name || '(unnamed step)'

    if (!step.id) {
      problems.push(
        `${where} — step "${label}" is continue-on-error but has no \`id:\`, so no ` +
          `follow-on step can reference its outcome. It fails the build nowhere and reports to nobody.`
      )
      continue
    }

    // The annotation step must come LATER in the same job — an `if:` referencing
    // a step that has not run yet evaluates false with no error.
    const later = allSteps.filter(
      (s) => s.file === step.file && s.job === step.job && s.line > step.line
    )
    const paired = later.find(
      (s) =>
        new RegExp(`steps\\.${step.id}\\.outcome`).test(s.text) &&
        s.text.includes(WARN_GATE_ANNOTATION)
    )

    if (!paired) {
      const idOnly = later.find((s) => new RegExp(`steps\\.${step.id}\\.outcome`).test(s.text))
      problems.push(
        idOnly
          ? `${where} — step "${label}" has an annotation step at line ${idOnly.line}, but it does ` +
              `not emit the \`${WARN_GATE_TITLE}\` title. /eod filters on that literal; without it the ` +
              `gate firing is indistinguishable from nothing firing.`
          : `${where} — step "${label}" is continue-on-error (id: ${step.id}) with no follow-on step ` +
              `gated on \`steps.${step.id}.outcome == 'failure'\` emitting \`${WARN_GATE_TITLE}\`. ` +
              `The run concludes success, ci-failure-alert.yml cannot fire, and this gate has no CI-side reader.`
      )
    }
  }

  // The reader's half of the contract: /eod must grep the same literal.
  if (warnSteps.length > 0) {
    if (!existsSync(EOD_PROMPT)) {
      problems.push(
        `${EOD_PROMPT.replace(ROOT + '/', '')} not found — warn-gate annotations are emitted with no reader.`
      )
    } else if (!readFileSync(EOD_PROMPT, 'utf8').includes(WARN_GATE_TITLE)) {
      problems.push(
        `${EOD_PROMPT.replace(ROOT + '/', '')} does not mention \`${WARN_GATE_TITLE}\`. ` +
          `${warnSteps.length} warn-only step(s) emit that title and nothing reads it.`
      )
    }
  }

  return { problems, warnSteps, allowlisted }
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

  const { problems: pairingProblems, warnSteps, allowlisted } = checkWarnGatePairing(workflowFiles)

  console.log(`   Found ${scripts.size} validate:* script(s) across ${pkgPaths.length} package.json file(s)\n`)

  console.log(`   ✅  ${wired.length} wired (pre-commit or CI)`)
  console.log(`   📋  ${manual.length} manual-by-design (allowlisted)`)
  console.log(`   ${orphaned.length > 0 ? '❌' : '✅'}  ${orphaned.length} orphaned`)
  console.log(
    `   ${pairingProblems.length > 0 ? '❌' : '✅'}  ${warnSteps.length} warn-only gate step(s) ` +
      `(+${allowlisted.length} allowlisted non-gate), ${pairingProblems.length} pairing problem(s)\n`
  )

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
  }

  if (pairingProblems.length > 0) {
    console.log('──────────────────────────────────────────────')
    console.log('\n   Warn-only steps with no readable artifact:\n')
    for (const p of pairingProblems) console.log(`   ✗  ${p}`)
    console.log('\n──────────────────────────────────────────────')
    console.log('\n   A `continue-on-error: true` step leaves the run conclusion `success`, so')
    console.log('   ci-failure-alert.yml cannot fire. Give the step an `id:`, then add a')
    console.log(`   follow-on step \`if: steps.<id>.outcome == 'failure'\` emitting a`)
    console.log(`   \`::warning title=${WARN_GATE_TITLE}::\` annotation, and make sure /eod still`)
    console.log('   reads that literal. Otherwise the gate reports to nobody.\n')
  }

  if (orphaned.length > 0 || pairingProblems.length > 0) process.exit(1)

  process.exit(0)
}

run()
