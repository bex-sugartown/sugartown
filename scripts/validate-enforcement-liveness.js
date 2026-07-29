#!/usr/bin/env node
/**
 * validate-enforcement-liveness.js — does each gate actually FIRE?
 *
 * `validate:validators` (SUG-239) asks whether a gate is *wired*: is the script
 * named in a hook or a workflow? That is a necessary check and an insufficient
 * one. It passed green throughout the 2026-05-10 → 2026-07-28 window in which
 * CI was red on `main` 212 consecutive times, because a gate can be perfectly
 * wired and still not fire:
 *
 *   - `boundaries.js`'s four `no-restricted-imports` rules were declared, and
 *     extended, and matched nothing — the `overrides[].files` globs anchor to
 *     the consuming package's config directory, not repo root (SUG-254).
 *   - `chromatic.sh` was invoked on every CI run and died on line 1 for 36 days:
 *     an unguarded POSIX `.` of a missing gitignored `.env` terminates a
 *     non-interactive shell outright (INC-009).
 *   - The CI suite ran on every push and nobody read the result.
 *
 * Wiring is a property of configuration. Liveness is a property of behaviour,
 * and the only way to check behaviour is to exercise it. So this script does not
 * read config: for each gate it **introduces a deliberate violation, runs the
 * gate for real, and asserts the gate fails.** A gate that stays green against a
 * known-bad input is inert, whatever its configuration says.
 *
 * This is the mechanism `docs/epic-template.md` §Enforcement liveness requires
 * ("proof is a deliberate violation that fails then reverts"), and it is
 * deliberately ONE harness with many probes rather than one checker per gate —
 * a pile of single-purpose checkers is the failure shape this whole exercise
 * documents. New gates add a probe here (SUG-255 Ph5; absorbs SUG-254's
 * proposed `validate:boundary-wiring`).
 *
 * Every probe restores what it touched, via a cleanup stack that runs in
 * `finally` and on signals. Probes are additive where possible (new temp files,
 * removed afterwards) and only mutate a tracked file where there is no
 * alternative — those are restored from an in-memory snapshot of the original
 * bytes.
 *
 * Usage:
 *   pnpm validate:enforcement-liveness
 *
 * Exit codes:
 *   0 — every probed gate failed its deliberate violation (i.e. every gate is live)
 *   1 — at least one gate stayed green against a known-bad input, or a probe errored
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
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

/** Mutate an existing tracked file, registering byte-exact restoration. */
function mutateFile(relPath, transform) {
  const full = resolve(ROOT, relPath)
  const original = readFileSync(full, 'utf8')
  cleanups.push(() => writeFileSync(full, original, 'utf8'))
  writeFileSync(full, transform(original), 'utf8')
  return full
}

/** Run a command, returning its exit code and combined output. */
function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd || ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...(opts.env || {}) },
    // Turbo caches by input hash. A probe changes inputs, so a cache hit cannot
    // mask a violation — but --force on the lint probe removes all doubt.
    maxBuffer: 32 * 1024 * 1024,
  })
  return { code: res.status ?? 1, out: `${res.stdout || ''}${res.stderr || ''}` }
}

/**
 * Standard probe: run the gate clean, then run it against a deliberate violation.
 *
 * The control run is not ceremony. Without it, "the gate exited non-zero" is
 * indistinguishable from "the gate never ran" — and the first draft of this
 * script made exactly that mistake: it invoked `pnpm validate:css-names` from
 * the repo root, where no such script is defined (it lives only in apps/web).
 * pnpm exited non-zero with "command not found", the probe read that as "the
 * gate rejected the violation", and two dead probes reported themselves green.
 * A liveness checker with a false-positive path is worse than none, because it
 * launders the absence of enforcement into evidence of enforcement — the exact
 * fault SUG-254 and INC-009 are made of.
 *
 * So: clean run MUST exit 0 (the gate works and the invocation is real), and
 * the violating run MUST exit non-zero (the gate detects the violation).
 * Anything else is an invalid probe, reported as an error rather than a pass.
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
    // Full violating output, so a caller can assert on WHAT was reported and not
    // merely that something was. Exit code proves a gate fired; it cannot prove
    // which of a scope's rules fired.
    out: violated.out,
  }
}

// ─── Architectural boundary probes (SUG-254) ─────────────────────────────────
//
// One probe per enforced scope, generated from the same SCOPES map the ESLint
// configs consume — so a scope added there without a probe here is impossible,
// and a probe cannot drift from the rule it claims to test.
//
// These deserve more than a "does lint fail" check. `boundaries.js` declared
// four rules and enforced none for 176 days through four independent
// file-matching bugs, one of which (ESLint's last-wins override merge) silently
// discarded a rule that *did* match while the other rule on the same file kept
// working. A probe that only asserted "lint exited non-zero" would have passed
// throughout that: one live rule is enough to fail a lint run.
//
// So each probe imports a violating specifier for EVERY pattern in its scope and
// asserts every rule's own message appears in the output. Partial enforcement
// reads as failure, which is the only way the collision bug stays fixed.

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

// Each scope's real lint invocation, run through pnpm rather than turbo so no
// cache can replay a pass computed before the probe existed.
const BOUNDARY_SCOPE_META = {
  'packages/design-system': { pkg: '@sugartown/design-system', probe: 'src/__boundary_probe__.ts' },
  'packages/mcp-server': { pkg: '@sugartown/mcp-server', probe: 'src/__boundary_probe__.ts' },
  'packages/storybook-docs': { pkg: '@sugartown/storybook-docs', probe: 'src/__boundary_probe__.ts' },
  'apps/web': { pkg: 'web', probe: 'src/__boundary_probe__.js' },
}

const BOUNDARY_PROBES = Object.keys(SCOPES).map((scope) => {
  const meta = BOUNDARY_SCOPE_META[scope]
  const patterns = patternsFor(scope)
  return {
    gate: `boundary: ${scope}`,
    why: `every boundary rule for ${scope} must reject a forbidden import`,
    run() {
      if (!meta) {
        return {
          live: false,
          invalid: true,
          detail:
            `scope "${scope}" is in SCOPES but has no entry in BOUNDARY_SCOPE_META, ` +
            `so its rules are unprobed. Add one — an enforced scope with no liveness ` +
            `probe is the state this whole harness exists to prevent.`,
        }
      }
      const result = gateProbe({
        cmd: 'pnpm',
        args: ['--filter', meta.pkg, 'lint'],
        success: `all ${patterns.length} rule(s) fired`,
        breakIt: () =>
          tempFile(
            `${scope}/${meta.probe}`,
            patterns.map((p) => `import '${specimenFor(p.group)}'\n`).join('') + 'export const probe = 1\n'
          ),
      })
      if (result.invalid || !result.live) return result

      // Exit code alone is not enough: it proves *a* rule fired, not that each
      // one did. This is the check that would have caught the last-wins merge
      // silently dropping Rule 1 from design-system while Rule 2 kept passing.
      // ESLint's stylish formatter strips the trailing period from a rule
      // message, so a naive `out.includes(p.message)` never matches and every
      // rule reads as silent — which is how the first version of this probe
      // reported all four scopes inert against rules that demonstrably fire.
      // Normalise both sides rather than trusting the formatter's punctuation.
      const norm = (s) => s.replace(/\s+/g, ' ').replace(/\.\s*$/, '').trim()
      const reported = norm(result.out || '')
      const missing = patterns.filter((p) => !reported.includes(norm(p.message)))
      if (missing.length) {
        return {
          live: false,
          detail:
            `lint failed, but ${missing.length} of ${patterns.length} rule(s) never reported. ` +
            `Silent: ${missing.map((p) => JSON.stringify(p.message.slice(0, 60))).join(', ')}. ` +
            `A scope where some rules fire and others vanish is the ESLint last-wins ` +
            `override collision (cause B) — partial enforcement, not enforcement.`,
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
// `live: null`  — the probe could not run here (reported, not counted)
// `invalid`     — the probe itself is broken; never counted as a pass
//
// Invocations MUST match how the gate is actually run by .husky/pre-commit or
// the CI workflow. `pnpm --filter web validate:X` and `pnpm validate:X` are not
// interchangeable — several of these scripts exist only in apps/web.

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
    gate: 'validate:style-mirror',
    why: 'drift between the two copies of a mirrored style file must be caught',
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
    gate: 'validate:validators',
    why: 'a validate:* script wired to nothing must be reported as orphaned',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['validate:validators'],
        success: 'reported the orphaned script',
        breakIt: () =>
          mutateFile('package.json', (src) => {
            const pkg = JSON.parse(src)
            pkg.scripts['validate:__liveness_probe__'] = 'node -e "process.exit(0)"'
            return `${JSON.stringify(pkg, null, 2)}\n`
          }),
      }),
  },

  {
    gate: 'pnpm lint',
    why: 'an error-level ESLint violation in any package must fail the run',
    run: () =>
      gateProbe({
        // --force, because turbo caches by input hash and a stale hit would make
        // an inert lint gate look live.
        cmd: 'npx',
        args: ['turbo', 'run', 'lint', '--continue', '--force'],
        success: 'failed on the design-system violation',
        // packages/design-system, deliberately NOT apps/web: the pre-commit hook
        // only ever linted web until SUG-255 Ph4, and this probe is what proves
        // the widening took effect.
        breakIt: () => tempFile('packages/design-system/src/__liveness_probe__.ts', 'export const probe = (\n'),
      }),
  },

  {
    gate: 'validate:controls',
    why: 'a register row naming a probe that does not exist must be rejected',
    // A check about checks that exempted itself would be absurd. The violation
    // is a row claiming `enforced-by-code` against a gate absent from this very
    // array: a register that can assert coverage it does not have is worth less
    // than no register, because it launders belief into evidence.
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['validate:controls'],
        success: 'rejected the dangling probe reference',
        breakIt: () =>
          mutateFile('docs/ai/agentic-caucus/control-register.md', (src) =>
            src.replace(
              '\n## Known coverage gaps',
              '\n| CTL-999 | `__liveness_probe__` | enforced-by-code | `__no_such_probe__` | liveness probe | continuous | none known |\n\n## Known coverage gaps'
            )
          ),
      }),
  },

  {
    gate: 'chromatic.sh reachability',
    why: 'the VRT script must reach its own first statement when .env is absent',
    // Not a violate-and-assert-failure probe: the failure mode here was the
    // opposite shape. chromatic.sh exited 2 *before running anything* on every
    // CI run for 36 days, so the gate was silent rather than red. Liveness here
    // means "the script gets far enough to do its job", tested under dash —
    // Ubuntu CI's /bin/sh — because dash and macOS /bin/sh differ on exactly
    // this construct (dash exits 2, macOS exits 1).
    run() {
      const dash = run('sh', ['-c', 'command -v dash'])
      const shell = dash.code === 0 ? dash.out.trim() : null
      if (!shell) {
        return { live: null, detail: 'dash not installed — probe skipped (install dash to enable)' }
      }
      const scriptDir = resolve(ROOT, 'apps/storybook')
      if (existsSync(join(scriptDir, '.env'))) {
        return { live: null, detail: 'apps/storybook/.env present — probe skipped (it tests the ABSENT case)' }
      }
      // Shim `chromatic` onto PATH as a no-op. If the working tree happens to
      // contain visual changes the script will reach its real invocation, and a
      // liveness probe must never spend snapshot quota or upload a build. We
      // only care that execution reaches the script's own output at all.
      const binDir = resolve(ROOT, 'node_modules/.cache/liveness-probe-bin')
      mkdirSync(binDir, { recursive: true })
      const shim = join(binDir, 'chromatic')
      writeFileSync(shim, '#!/bin/sh\necho "[stub] chromatic invocation suppressed by liveness probe"\nexit 0\n', { mode: 0o755 })
      cleanups.push(() => rmSync(binDir, { recursive: true, force: true }))

      const { out } = run(shell, ['scripts/chromatic.sh'], {
        cwd: scriptDir,
        env: { PATH: `${binDir}:${process.env.PATH}` },
      })
      const reached = out.includes('[chromatic]')
      return {
        live: reached,
        detail: reached
          ? 'reached its first [chromatic] statement under dash with no .env'
          : `produced no [chromatic] output — script died before running (INC-009 shape). Output: ${out.slice(0, 300)}`,
      }
    },
  },

  // Architectural boundary rules — one probe per enforced scope, generated from
  // SCOPES above. SUG-254.
  ...BOUNDARY_PROBES,
]

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log('\n🔬  Sugartown Enforcement-Liveness Check')
  console.log('══════════════════════════════════════════════\n')
  console.log('   Each gate is run against a deliberate violation.')
  console.log('   A gate that stays green against known-bad input is inert.\n')

  const live = []
  const inert = []
  const skipped = []

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
    } else if (result.live === null) {
      skipped.push({ ...probe, ...result })
      console.log(`   ⏭️   ${probe.gate.padEnd(32)} skipped — ${result.detail}`)
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
  if (skipped.length) console.log(`   ⏭️   ${skipped.length} probe(s) skipped`)
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
    console.log('\n   This is the SUG-254 / INC-009 failure shape: a gate that is')
    console.log('   present in config and absent in behaviour. Fix the gate — do not')
    console.log('   remove the probe.\n')
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
