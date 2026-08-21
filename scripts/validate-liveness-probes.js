#!/usr/bin/env node
/**
 * validate-liveness-probes.js — does each gate actually FIRE?
 *
 * ST-95's rebuild of the "liveness" idea SUG-284 removed on 2026-08-15
 * (`docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md`
 * §7, item 1). Deliberately NOT a revival of the old
 * `zArchive/2026-08-sug284-governance-layer/scripts/validate-enforcement-liveness.js`
 * — that file grew to 25 probes plus a control register, a coverage tally, and
 * a generated index with zero consumers. This is the minimal version: probes
 * only, nothing else. No `nextRead` dates, no register row, no published count.
 *
 * The mechanism is unchanged, because the mechanism was never the problem —
 * the machinery built around it was. For each gate: run it clean (must exit
 * 0), introduce a deliberate violation, run it again (must exit non-zero). A
 * gate that stays green against known-bad input is inert, whatever its
 * configuration says. Wiring is a property of configuration; liveness is a
 * property of behaviour, and the only way to check behaviour is to exercise
 * it.
 *
 * Six probes, chosen 2026-08-21 (`docs/backlog/ST-95-liveness-probes-only.md`
 * §Scope) — all local/file-based, no production-data risk. Three gates
 * considered and excluded, with reasons, live in that doc: Chromatic
 * (deliberately non-blocking today, SUG-263), the Storybook frozen-globals
 * convention (no exit code, not a scripted validator), and the deleted root
 * `validate-tokens.js` (INC-004, nothing left to probe).
 *
 * Usage:
 *   pnpm validate:liveness-probes
 *
 * Exit codes:
 *   0 — every probed gate failed its deliberate violation (i.e. every gate is live)
 *   1 — at least one gate stayed green against a known-bad input, or a probe errored
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ─── Cleanup stack ───────────────────────────────────────────────────────────
// Every mutation pushes its undo here. Runs in `finally` and on signals, so an
// interrupted run does not leave a violation behind in the working tree.

const cleanups = []

function cleanupAll() {
  while (cleanups.length) {
    const undo = cleanups.pop()
    try {
      undo()
    } catch (err) {
      console.error(`   ⚠️   cleanup failed: ${err.message}`)
    }
  }
}

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    cleanupAll()
    process.exit(130)
  })
}

/** Create a temp file, registering its removal. Creates parent dirs as needed. */
function tempFile(relPath, contents) {
  const full = resolve(ROOT, relPath)
  const dir = dirname(full)
  const dirExisted = existsSync(dir)
  mkdirSync(dir, { recursive: true })
  writeFileSync(full, contents, 'utf8')
  cleanups.push(() => {
    rmSync(full, { force: true })
    // Only remove the directory if this probe created it.
    if (!dirExisted) rmSync(dir, { recursive: true, force: true })
  })
  return full
}

/**
 * Mutate an existing tracked file, registering byte-exact restoration.
 *
 * Throws when the transform is a no-op. Without this, a stale needle writes
 * the file back byte-identical, the gate runs on a clean tree and exits 0,
 * and the harness reports the GATE as inert — when the truth is the PROBE's
 * needle went stale. That misattribution invites a future session to weaken
 * a gate that was working fine. Fail loudly as an invalid probe instead.
 */
function mutateFile(relPath, transform) {
  const full = resolve(ROOT, relPath)
  const original = readFileSync(full, 'utf8')
  const mutated = transform(original)
  if (mutated === original) {
    throw new Error(
      `probe transform was a no-op on ${relPath} — the injection needle is stale, ` +
        `so this probe would prove nothing. Fix the probe, not the gate.`
    )
  }
  cleanups.push(() => writeFileSync(full, original, 'utf8'))
  writeFileSync(full, mutated, 'utf8')
  return full
}

/** Run a command, returning its exit code and combined output. */
function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd || ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...(opts.env || {}) },
    maxBuffer: 32 * 1024 * 1024,
  })
  return { code: res.status ?? 1, out: `${res.stdout || ''}${res.stderr || ''}` }
}

/**
 * Standard probe: run the gate clean, then run it against a deliberate violation.
 *
 * The control run is not ceremony. Without it, "the gate exited non-zero" is
 * indistinguishable from "the gate never ran" — a probe invoking a script that
 * does not exist at that path would also exit non-zero, and read as detection
 * rather than as a broken invocation. So: clean run MUST exit 0 (the gate
 * works and the invocation is real), and the violating run MUST exit non-zero
 * (the gate detects the violation). Anything else is an invalid probe,
 * reported as an error rather than a pass.
 */
function gateProbe({ cmd, args, breakIt, success }) {
  const control = run(cmd, args)
  if (control.code !== 0) {
    return {
      live: false,
      invalid: true,
      detail:
        `control run failed — \`${cmd} ${args.join(' ')}\` exits ${control.code} on a CLEAN tree, ` +
        `so this probe cannot distinguish a live gate from a broken invocation. ` +
        `Output: ${control.out.trim().slice(-300)}`,
    }
  }
  breakIt()
  const violated = run(cmd, args)
  return {
    live: violated.code !== 0,
    detail: violated.code !== 0 ? success : violated.out.trim().slice(-400),
    out: violated.out,
  }
}

// ─── Architectural boundary probes (INC-011 / SUG-254) ───────────────────────
//
// One probe per enforced scope, generated from the same SCOPES map the ESLint
// configs consume — so a scope added there without a probe is impossible, and
// a probe cannot drift from the rule it claims to test. This is the gate with
// direct incident history: four rules declared, none firing, for 176 days
// while reporting green.

const { SCOPES, patternsFor } = createRequire(import.meta.url)(
  resolve(ROOT, 'packages/eslint-config/boundary-rules.js')
)

/** A concrete import specifier that the given no-restricted-imports group forbids. */
function specimenFor(group) {
  const SPECIMENS = {
    '**/apps/**': '../../apps/web/src/main',
    '**/apps/studio/**': '../../apps/studio/schemas/index',
    '**/packages/design-system/**': '../../packages/design-system/src/index',
    '@sugartown/design-system': '@sugartown/design-system',
    '@sanity/**': '@sanity/client',
    sanity: 'sanity',
    groq: 'groq',
  }
  const hit = group.find((g) => g in SPECIMENS)
  if (!hit) {
    throw new Error(
      `no specimen import known for group [${group.join(', ')}] — add one to SPECIMENS ` +
        `so this rule is actually exercised rather than silently skipped`
    )
  }
  return SPECIMENS[hit]
}

// Each scope's real lint invocation, run through pnpm --filter (not turbo), so
// no cache can replay a pass computed before the probe existed.
const BOUNDARY_SCOPE_META = {
  'packages/design-system': { pkg: '@sugartown/design-system', probe: 'src/__liveness_boundary_probe__.ts' },
  'packages/mcp-server': { pkg: '@sugartown/mcp-server', probe: 'src/__liveness_boundary_probe__.ts' },
  'packages/storybook-docs': { pkg: '@sugartown/storybook-docs', probe: 'src/__liveness_boundary_probe__.ts' },
  'apps/web': { pkg: 'web', probe: 'src/__liveness_boundary_probe__.js' },
}

const BOUNDARY_PROBES = Object.keys(SCOPES).map((scope) => {
  const meta = BOUNDARY_SCOPE_META[scope]
  const patterns = patternsFor(scope)
  return {
    gate: `boundary: ${scope}`,
    why: `every boundary rule for ${scope} must reject a forbidden import (INC-011)`,
    run() {
      if (!meta) {
        return {
          live: false,
          invalid: true,
          detail:
            `scope "${scope}" is in SCOPES but has no entry in BOUNDARY_SCOPE_META, ` +
            `so its rules are unprobed. Add one — an enforced scope with no liveness ` +
            `probe is the state this harness exists to prevent.`,
        }
      }
      const result = gateProbe({
        cmd: 'pnpm',
        args: ['--filter', meta.pkg, 'lint'],
        success: `all ${patterns.length} rule(s) fired`,
        breakIt: () =>
          tempFile(
            `${scope}/${meta.probe}`,
            patterns.map((p) => `import '${specimenFor(p.group)}'\n`).join('') +
              'export const probe = 1\n'
          ),
      })
      if (result.invalid || !result.live) return result

      // Exit code alone proves *a* rule fired, not that each one did — the
      // check that would have caught ESLint's last-wins override merge
      // silently dropping one rule while another on the same file kept
      // working. Normalise punctuation: ESLint's stylish formatter strips the
      // trailing period from a rule message, so a naive substring match never
      // hits and every rule reads as silent.
      const norm = (s) => s.replace(/\s+/g, ' ').replace(/\.\s*$/, '').trim()
      const reported = norm(result.out || '')
      const missing = patterns.filter((p) => !reported.includes(norm(p.message)))
      if (missing.length) {
        return {
          live: false,
          detail:
            `lint failed, but ${missing.length} of ${patterns.length} rule(s) never reported. ` +
            `Silent: ${missing.map((p) => JSON.stringify(p.message.slice(0, 60))).join(', ')}. ` +
            `A scope where some rules fire and others vanish is partial enforcement, not ` +
            `enforcement.`,
        }
      }
      return { live: true, detail: `all ${patterns.length} rule(s) fired` }
    },
  }
})

// ─── Probes ──────────────────────────────────────────────────────────────────
//
// Each probe: { gate, why, run() -> { live, detail, invalid? } }
//
// `live: true`  — the gate failed its deliberate violation, as it should
// `live: false` — the gate stayed green: it is inert. This is the signal.
// `invalid`     — the probe itself is broken; never counted as a pass
//
// Invocations match how the gate is actually run by `.husky/pre-commit`
// (tokens, tokens:strict, style-mirror, dead-refs, css-names — all five are
// pre-commit-only today, not a CI step; see ST-95's Scope note on that gap)
// or `.github/workflows/ci.yml` (`pnpm lint`, which also covers the boundary
// probes above).

const PROBES = [
  {
    gate: 'validate:tokens',
    why: 'an undefined var(--st-*) reference must not resolve',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:tokens'],
        success: 'rejected the undefined token',
        breakIt: () =>
          tempFile(
            'apps/web/src/__liveness_probe__.css',
            '.probe { color: var(--st-this-token-does-not-exist-liveness-probe); }\n'
          ),
      }),
  },

  {
    gate: 'validate:tokens:strict',
    why: 'a raw hex colour in component CSS must be rejected',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:tokens:strict'],
        success: 'rejected the raw hex',
        breakIt: () => tempFile('apps/web/src/__liveness_probe__.css', '.probe { color: #ff00aa; }\n'),
      }),
  },

  {
    gate: 'validate:style-mirror',
    why: 'drift between the two copies of a mirrored style file must be caught (the drift risk INC-004\'s orphaned root validate-tokens.js used to leave uncovered)',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:style-mirror'],
        success: 'caught the mirror drift',
        breakIt: () =>
          mutateFile(
            'packages/design-system/src/styles/globals.css',
            (src) => `${src}\n/* liveness probe — deliberate mirror drift */\n`
          ),
      }),
  },

  {
    gate: 'validate:dead-refs',
    why: 'a styles.X with no matching CSS class must be caught',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:dead-refs'],
        success: 'caught the dead style reference',
        breakIt: () => {
          tempFile(
            'packages/design-system/src/components/LivenessProbe/LivenessProbe.module.css',
            '.real { display: block; }\n'
          )
          tempFile(
            'packages/design-system/src/components/LivenessProbe/LivenessProbe.tsx',
            [
              "import styles from './LivenessProbe.module.css'",
              '',
              'export function LivenessProbe() {',
              '  return <div className={styles.thisClassDoesNotExist} />',
              '}',
              '',
            ].join('\n')
          )
        },
      }),
  },

  {
    gate: 'validate:css-names',
    why: 'a content-type-scoped class name in pages/ must be blocked',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:css-names'],
        success: 'blocked the tax* prefix',
        breakIt: () =>
          tempFile(
            'apps/web/src/pages/__liveness_probe__.module.css',
            '.taxProbeLiveness { display: block; }\n'
          ),
      }),
  },

  // Architectural boundary rules — one probe per enforced scope, generated
  // from SCOPES above. INC-011 / SUG-254.
  ...BOUNDARY_PROBES,
]

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log('\n🔬  Sugartown Liveness Probes')
  console.log('══════════════════════════════════════════════\n')
  console.log('   Each gate is run against a deliberate violation.')
  console.log('   A gate that stays green against known-bad input is inert.\n')

  const live = []
  const inert = []
  const invalid = []

  for (const probe of PROBES) {
    let result
    try {
      result = probe.run()
    } catch (err) {
      result = { live: false, invalid: true, detail: `probe threw: ${err.message}` }
    } finally {
      // Restore immediately, so probes never contaminate each other.
      cleanupAll()
    }

    if (result.invalid) {
      invalid.push({ ...probe, ...result })
      console.log(`   ⚠️   ${probe.gate.padEnd(32)} PROBE INVALID — cannot vouch for this gate`)
    } else if (result.live) {
      live.push({ ...probe, ...result })
      console.log(`   ✅  ${probe.gate.padEnd(32)} ${result.detail}`)
    } else {
      inert.push({ ...probe, ...result })
      console.log(`   ❌  ${probe.gate.padEnd(32)} STAYED GREEN against a known violation`)
    }
  }

  console.log('\n──────────────────────────────────────────────\n')
  console.log(`   ✅  ${live.length} gate(s) proven live`)
  if (invalid.length) console.log(`   ⚠️   ${invalid.length} probe(s) invalid`)
  console.log(`   ${inert.length > 0 ? '❌' : '✅'}  ${inert.length} gate(s) inert\n`)

  if (invalid.length > 0) {
    console.log('   Invalid probes — the probe is broken, so the gate is UNVERIFIED:\n')
    for (const { gate, detail } of invalid) {
      console.log(`   ⚠️   ${gate}`)
      console.log(`        ${detail}\n`)
    }
    console.log('   Fix the probe. An unverified gate must never be reported as live.\n')
    return 1
  }

  if (inert.length > 0) {
    console.log('   Inert gates — declared, wired, and not firing:\n')
    for (const { gate, why, detail } of inert) {
      console.log(`   ✗  ${gate}`)
      console.log(`        expected: ${why}`)
      console.log(`        got:      ${detail}\n`)
    }
    console.log('──────────────────────────────────────────────')
    console.log('\n   This is the INC-011 / SUG-254 failure shape: a gate that is present')
    console.log('   in config and absent in behaviour. Fix the gate — do not remove the probe.\n')
    return 1
  }

  console.log('   Every probed gate failed its deliberate violation, as it should.\n')
  return 0
}

let exitCode = 1
try {
  exitCode = main()
} finally {
  cleanupAll()
}
process.exit(exitCode)
