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

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'fs'
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

/**
 * Mutate an existing tracked file, registering byte-exact restoration.
 *
 * Throws when the transform is a no-op. Without this, a stale `String.replace`
 * needle writes the file back byte-identical, the gate runs on a clean tree and
 * exits 0, and the harness reports the GATE as inert — when the truth is the
 * PROBE's needle went stale. That misattribution invites a future session to
 * weaken a gate that was working fine. Fail loudly as an invalid probe instead.
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
    gate: 'validate:controls (completeness)',
    why: 'a validate:* script with no row must be caught even when a longer registered name contains it',
    // A second probe on the same script, deliberately. The probe above exercises
    // check 2 (a Probe cell naming a gate that does not exist); this one
    // exercises check 3 (every validate:* script has a row), which failed
    // silently for a whole class of names until SUG-268 Phase 2: the check did
    // `blob.includes(name)`, so `validate:governance` was satisfied by CTL-027's
    // `validate:governance-tally` cell. Any gate whose name prefixed another
    // could have shipped unregistered with the register green.
    //
    // The injected name is DERIVED from the live script set, never hardcoded.
    // A hardcoded prefix stops being masked the day its longer sibling is
    // renamed, and the probe would then quietly test the ordinary unmasked case
    // — which the OLD code also caught — while reporting the fix proven. Same
    // stale-needle shape as CTL-025's fixed-size doc-budget injection.
    run() {
      const pkgPath = resolve(ROOT, 'package.json')
      const scripts = Object.keys(JSON.parse(readFileSync(pkgPath, 'utf8')).scripts || {})
      const defined = new Set(scripts)

      // Take a registered script name and truncate it at its last delimiter.
      // The control run below proves every defined script is named by some row,
      // so the truncation is necessarily a SUBSTRING of the register — while
      // being no script's own name, it has no row of its own. That is precisely
      // the masked state, and it is derived rather than assumed.
      const masked = scripts
        .filter((n) => n.startsWith('validate:'))
        .map((n) => {
          const tail = n.slice('validate:'.length)
          const cut = Math.max(tail.lastIndexOf('-'), tail.lastIndexOf(':'))
          return cut > 0 ? `validate:${tail.slice(0, cut)}` : null
        })
        .filter((n) => n && !defined.has(n))
        .sort()[0]

      if (!masked) {
        return {
          live: false,
          invalid: true,
          detail:
            'no validate:* script name yields a truncation that is not itself a defined script, ' +
            'so this probe cannot construct the masked case. Verify the completeness check by ' +
            'hand rather than trusting this result.',
        }
      }

      const result = gateProbe({
        cmd: 'pnpm',
        args: ['validate:controls'],
        success: `caught \`${masked}\`, masked in the register by a longer name`,
        breakIt: () =>
          mutateFile('package.json', (src) => {
            const pkg = JSON.parse(src)
            pkg.scripts[masked] = 'node -e "process.exit(0)"'
            return `${JSON.stringify(pkg, null, 2)}\n`
          }),
      })
      if (result.invalid || !result.live) return result

      // Exit code alone is not enough: this script reports every register defect
      // under one exit code, so a non-zero exit proves *a* check fired, not the
      // completeness one. Assert it named the injected script.
      const out = result.out || ''
      if (!(out.includes(masked) && out.includes('no row in the control register'))) {
        return {
          live: false,
          detail:
            `validate:controls failed, but never reported \`${masked}\` as unregistered. Some ` +
            `other defect failed the run, so this probe proves nothing about the completeness ` +
            `check it exists to test: ${out.trim().slice(-300)}`,
        }
      }
      return result
    },
  },

  {
    gate: 'validate:doc-budget',
    why: 'instruction text pushed past the cap must be rejected, wherever it sits',
    // The violation is added to a *referenced conventions file*, not to
    // CLAUDE.md. That is deliberate: a single-file cap would pass this probe
    // while the surface a session actually reads grew without limit, and
    // relocation is precisely the escape SUG-243's verification review found.
    // Breaking the cheaper-looking side proves both sides are counted.
    // The padding size is derived from the gate's own reported headroom, never
    // hardcoded. A fixed size silently stops violating the moment the cap is
    // tightened: SUG-243 Phase 3 cut the cap from 22,000 to 20,150, headroom
    // went from 243 words to 963, and a hardcoded 400-word injection reported
    // STAYED GREEN — the probe broke, not the gate.
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['validate:doc-budget'],
        success: 'rejected the over-budget surface',
        breakIt: () => {
          const probe = run('pnpm', ['validate:doc-budget', '--json'])
          const json = probe.out.slice(probe.out.indexOf('{'))
          const { cap, total } = JSON.parse(json)
          const words = Math.max(cap - total, 0) + 50
          mutateFile('docs/conventions/vqa-workflow.md', (src) => `${src}\n${'padding '.repeat(words)}\n`)
        },
      }),
  },

  {
    gate: 'validate:governance-diff',
    why: 'generated output that no longer matches its source must not be committable',
    // The gate compares the INDEX against the INDEX, deliberately (SUG-268 Ph2,
    // blocker B3). A worktree-only edit is therefore correctly a non-event, and
    // the obvious probe — mutate the generated file, run the check — would prove
    // NOTHING while looking like a passing liveness test.
    //
    // So this probe STAGES its mutation. Committing generated output that does
    // not correspond to committed source is the actual failure being guarded. It
    // asserts on OUTPUT TEXT as well as exit code: a non-zero exit proves *a*
    // check fired, not *this* one.
    run() {
      const ARTIFACT = 'apps/web/src/generated/governance.json'
      const full = resolve(ROOT, ARTIFACT)

      // Refuse to run against a dirty artifact: cleanup restores from HEAD, which
      // would discard a pre-existing staged edit.
      const dirty = run('git', ['status', '--porcelain', '--', ARTIFACT])
      if (dirty.out.trim() !== '') {
        return {
          live: false,
          invalid: true,
          detail:
            `${ARTIFACT} has uncommitted changes. This probe stages a mutation and restores from ` +
            `HEAD, which would discard them. Commit or stash first.`,
        }
      }

      const control = run('pnpm', ['validate:governance-diff'])
      if (control.code !== 0) {
        return {
          live: false,
          invalid: true,
          detail:
            `control run failed — pnpm validate:governance-diff exits ${control.code} on a CLEAN ` +
            `tree, so this probe cannot distinguish a live gate from a broken invocation. ` +
            `Output: ${control.out.trim().slice(-300)}`,
        }
      }

      const original = readFileSync(full, 'utf8')
      cleanups.push(() => {
        writeFileSync(full, original, 'utf8')
        run('git', ['checkout', 'HEAD', '--', ARTIFACT])
      })

      // Two spaces before the final newline: different bytes, still valid JSON, so
      // the failure under test is drift rather than a parse error.
      const mutated = original.replace(/\n$/, '  \n')
      if (mutated === original) {
        return {
          live: false,
          invalid: true,
          detail: `probe transform was a no-op on ${ARTIFACT} — the needle is stale. Fix the probe, not the gate.`,
        }
      }
      writeFileSync(full, mutated, 'utf8')

      const staged = run('git', ['add', '--', ARTIFACT])
      if (staged.code !== 0) {
        return {
          live: false,
          invalid: true,
          detail:
            `probe could not stage ${ARTIFACT} (git add exited ${staged.code}), so the index never ` +
            `carried the drift this gate reads. Output: ${staged.out.trim().slice(-200)}`,
        }
      }

      const violated = run('pnpm', ['validate:governance-diff'])
      const namesTheFix =
        /governance\/source/.test(violated.out) && /governance:build/.test(violated.out)

      return {
        live: violated.code !== 0 && namesTheFix,
        detail:
          violated.code === 0
            ? `gate exited 0 with drift staged in ${ARTIFACT}`
            : namesTheFix
              ? 'rejected the staged drift and named the source to edit'
              : `exited ${violated.code} but did not name governance/source or governance:build, so ` +
                `it may have failed for an unrelated reason: ${violated.out.trim().slice(-300)}`,
        output: violated.out,
      }
    },
  },

  {
    gate: 'validate:governance',
    why: 'a governance table authored outside governance/source/ must not be committable',
    // The gate reads the INDEX, so this probe STAGES its injection. The obvious
    // version — write a temp file, run the check — proves nothing: `git ls-files`
    // cannot see an untracked file, so the gate would correctly find nothing and
    // the probe would report STAYED GREEN against a violation that was never in
    // the corpus. A false-negative probe on a new gate is worse than no probe,
    // because it launders absence of enforcement into evidence of it.
    //
    // Cleanup must UNSTAGE as well as delete: a staged-then-deleted file leaves
    // `AD <path>` in `git status --porcelain`, which fails CI's no-residue step.
    // Pushed after tempFile() so it runs BEFORE the removal (cleanups are LIFO).
    run() {
      const PROBE_DOC = 'docs/ai/agentic-caucus/__liveness_probe__.md'

      const control = run('pnpm', ['validate:governance'])
      if (control.code !== 0) {
        return {
          live: false,
          invalid: true,
          detail:
            `control run failed — pnpm validate:governance exits ${control.code} on a CLEAN tree, ` +
            `so this probe cannot distinguish a live gate from a broken invocation. ` +
            `Output: ${control.out.trim().slice(-300)}`,
        }
      }

      // A control-register table header, which is what a hand-written second
      // copy of the register would open with. Written literally rather than
      // imported: importing the gate would execute it (main() runs at module
      // scope). If the register's columns are ever changed, this stops matching
      // and the probe reports STAYED GREEN — loudly wrong, never silently green.
      tempFile(
        PROBE_DOC,
        '# Liveness probe\n\n| ID | Control | Class | Probe | Reader | Next read | Bypass |\n' +
          '|---|---|---|---|---|---|---|\n| CTL-999 | probe | convention | none | nobody | continuous | none |\n'
      )

      const staged = run('git', ['add', '--', PROBE_DOC])
      if (staged.code !== 0) {
        return {
          live: false,
          invalid: true,
          detail:
            `probe could not stage ${PROBE_DOC} (git add exited ${staged.code}), so the index — ` +
            `which is what this gate reads — never carried the violation. ` +
            `Output: ${staged.out.trim().slice(-200)}`,
        }
      }
      cleanups.push(() => run('git', ['restore', '--staged', '--', PROBE_DOC]))

      const violated = run('pnpm', ['validate:governance'])
      const namesIt =
        violated.out.includes(PROBE_DOC) && violated.out.includes('register-table')

      return {
        live: violated.code !== 0 && namesIt,
        detail:
          violated.code === 0
            ? `gate exited 0 with a register table staged at ${PROBE_DOC}`
            : namesIt
              ? 'caught the staged register table and named the file and pattern'
              : `exited ${violated.code} but never named ${PROBE_DOC} and the register-table ` +
                `pattern, so it may have failed for an unrelated reason: ${violated.out.trim().slice(-300)}`,
        out: violated.out,
      }
    },
  },

  {
    gate: '--list-gates contract',
    why: 'the gate list must be emittable without executing a single probe',
    // Not a violate-and-assert probe. The thing that can break here is placement:
    // if the --list-gates short-circuit ever moves below main(), the flag runs
    // all of these probes before emitting anything — mutating tracked files,
    // staging others, and deleting a backlog doc inside someone's `git commit`.
    // The consuming check would notice only via a parse error, long after.
    //
    // So the load-bearing assertion is the THIRD one: the working tree is
    // unchanged afterwards. Exit code and JSON shape would both still pass under
    // the destructive placement.
    run() {
      const before = run('git', ['status', '--porcelain'])
      const res = run(process.execPath, [resolve(ROOT, 'scripts/validate-enforcement-liveness.js'), '--list-gates'])

      if (res.code !== 0) {
        return { live: false, detail: `--list-gates exited ${res.code}: ${res.out.trim().slice(-200)}` }
      }

      let gates
      try {
        gates = JSON.parse(res.out)
      } catch (e) {
        return { live: false, detail: `--list-gates output is not parseable JSON — ${e.message}` }
      }
      if (!Array.isArray(gates) || gates.length === 0 || gates.some((g) => typeof g !== 'string')) {
        return { live: false, detail: `--list-gates did not return a non-empty array of strings: ${JSON.stringify(gates).slice(0, 200)}` }
      }

      const after = run('git', ['status', '--porcelain'])
      if (after.out !== before.out) {
        return {
          live: false,
          detail:
            '--list-gates CHANGED THE WORKING TREE. The short-circuit has moved below main(), so ' +
            'the flag is executing probes. Diff: ' +
            JSON.stringify(after.out.replace(before.out, '').trim().slice(0, 300)),
        }
      }

      return { live: true, detail: `emitted ${gates.length} gate(s), ran no probe, left the tree clean` }
    },
  },

  {
    gate: 'validate:governance (probe correspondence)',
    why: 'a probe record with no harness gate, and a harness gate with no record, must both fail',
    // The two-way check is invisible to the outside-source-scan probe above: it
    // could go inert — wrong source path, empty record set, comparison never
    // reached — and that probe would still report validate:governance live.
    //
    // The fixture is DERIVED from the real source at probe time, never committed.
    // A committed fixture goes stale, and one placed under a scanned root would
    // trip the record-id pattern and fail the gate closed on a clean tree.
    // governance/ sits outside every SCAN_ROOT, so the temp dir is invisible to
    // the scan.
    run() {
      const FIXTURE = 'governance/__liveness_fixture__'

      const control = run('pnpm', ['validate:governance'])
      if (control.code !== 0) {
        return {
          live: false,
          invalid: true,
          detail:
            `control run failed — pnpm validate:governance exits ${control.code} on a CLEAN tree, ` +
            `so this probe cannot distinguish a live check from a broken invocation. ` +
            `Output: ${control.out.trim().slice(-300)}`,
        }
      }

      const src = resolve(ROOT, 'governance/source')
      const probes = JSON.parse(readFileSync(join(src, 'probes.json'), 'utf8'))
      if (probes.length < 2) {
        return {
          live: false,
          invalid: true,
          detail: `probes.json holds ${probes.length} record(s); this probe needs at least 2 to orphan one.`,
        }
      }

      // Built at runtime. A literal record id written into scripts/ would be
      // matched by the outside-source scan's record-id pattern and fail the gate
      // closed — the scan covers this file.
      const ORPHAN_ID = ['PRB', '909'].join('-')
      const ORPHAN_GATE = '__no_such_gate_liveness_probe__'

      const dropped = probes[probes.length - 1]
      const mutated = probes.slice(0, -1).concat([
        { id: ORPHAN_ID, gate: ORPHAN_GATE, derivation: 'derived-from-target' },
      ])

      for (const file of readdirSync(src)) {
        if (!file.endsWith('.json')) continue
        tempFile(
          `${FIXTURE}/${file}`,
          file === 'probes.json'
            ? `${JSON.stringify(mutated, null, 2)}\n`
            : readFileSync(join(src, file), 'utf8')
        )
      }

      const violated = run('pnpm', ['validate:governance', '--source', FIXTURE])

      // Both directions, asserted by message. Exit code alone proves only that
      // something failed, and this gate reports schema, referential, overdue,
      // scan and correspondence findings under one exit code.
      const namesRecordOrphan = violated.out.includes(ORPHAN_GATE)
      const namesGateOrphan = violated.out.includes(dropped.gate)

      return {
        live: violated.code !== 0 && namesRecordOrphan && namesGateOrphan,
        detail:
          violated.code === 0
            ? 'gate exited 0 against a fixture with an orphan in each direction'
            : namesRecordOrphan && namesGateOrphan
              ? 'named both orphans: the record with no gate, and the gate with no record'
              : `exited ${violated.code} but named ${namesRecordOrphan ? '' : 'neither the record orphan'}` +
                `${!namesRecordOrphan && !namesGateOrphan ? ' nor ' : ''}${namesGateOrphan ? '' : 'the gate orphan'}` +
                ` — it may have failed for an unrelated reason: ${violated.out.trim().slice(-300)}`,
        out: violated.out,
      }
    },
  },

  {
    gate: 'validate:governance (claim evidence)',
    why: 'a claim naming a command that resolves to nothing must fail, in both failure shapes',
    // Two injections, not one. A check that resolves script names but silently
    // accepts an unknown runner is half dead, and a single-shape probe cannot
    // tell the halves apart. Asserts on OUTPUT TEXT: this gate reports schema,
    // referential, overdue, scan, correspondence and claim findings under one
    // exit code, so a non-zero exit proves only that something failed.
    //
    // Claim ids are read out of the real source rather than written here — a
    // literal id in this file would be matched by the outside-source scan's
    // record-id pattern and fail the gate closed on a clean tree.
    run() {
      const FIXTURE = 'governance/__liveness_fixture_claims__'

      const control = run('pnpm', ['validate:governance'])
      if (control.code !== 0) {
        return {
          live: false,
          invalid: true,
          detail:
            `control run failed — pnpm validate:governance exits ${control.code} on a CLEAN tree, ` +
            `so this probe cannot distinguish a live check from a broken invocation. ` +
            `Output: ${control.out.trim().slice(-300)}`,
        }
      }

      const src = resolve(ROOT, 'governance/source')
      const claims = JSON.parse(readFileSync(join(src, 'claims.json'), 'utf8'))
      if (claims.length < 2) {
        return {
          live: false,
          invalid: true,
          detail: `claims.json holds ${claims.length} record(s); this probe needs 2 to inject both shapes.`,
        }
      }

      const NO_SUCH_SCRIPT = '__no_such_script_liveness_probe__'
      const NO_SUCH_RUNNER = '__no_such_runner_liveness_probe__'
      const mutated = claims.map((c, i) =>
        i === 0
          ? { ...c, command: `pnpm ${NO_SUCH_SCRIPT}` }
          : i === 1
            ? { ...c, command: `${NO_SUCH_RUNNER} --all` }
            : c
      )

      for (const file of readdirSync(src)) {
        if (!file.endsWith('.json')) continue
        tempFile(
          `${FIXTURE}/${file}`,
          file === 'claims.json'
            ? `${JSON.stringify(mutated, null, 2)}\n`
            : readFileSync(join(src, file), 'utf8')
        )
      }

      const violated = run('pnpm', ['validate:governance', '--source', FIXTURE])

      const namesScript = violated.out.includes(NO_SUCH_SCRIPT) && violated.out.includes(claims[0].id)
      const namesRunner = violated.out.includes(NO_SUCH_RUNNER) && violated.out.includes(claims[1].id)

      return {
        live: violated.code !== 0 && namesScript && namesRunner,
        detail:
          violated.code === 0
            ? 'gate exited 0 against claims whose commands resolve to nothing'
            : namesScript && namesRunner
              ? 'caught both shapes: an unresolvable script name and an unrecognised runner, each with its claim id'
              : `exited ${violated.code} but reported ${namesScript ? 'only the unresolvable script' : namesRunner ? 'only the unrecognised runner' : 'neither shape'} ` +
                `— half the check may be dead: ${violated.out.trim().slice(-300)}`,
        out: violated.out,
      }
    },
  },

  {
    gate: 'validate:governance-tally',
    why: 'the published tally must not be allowed to drift from the rows it claims to count',
    // Asserts on the OUTPUT TEXT, not the exit code. The script reports several
    // disagreements under one exit code, so a non-zero exit proves *a* check
    // fired, not *this* one — the false-assurance path the verification review
    // flagged, and the same shape as a probe whose fixed-size injection stops
    // violating a tightened threshold.
    run() {
      // The injection is DERIVED from the page, not hardcoded. The previous
      // version pinned the literal `18`, the literal `19`, and the array's
      // four-space alignment — all three stale the moment the tally is
      // re-measured, which is the whole objective of the epic that added this
      // gate. Same defect class as CTL-025's fixed-size doc-budget injection.
      const PAGE = 'apps/web/src/pages/platform/GovernanceDraftPage.jsx'
      const NEEDLE = /(label:\s*'Automated checks',\s*value:\s*)(\d+)/
      const found = readFileSync(resolve(ROOT, PAGE), 'utf8').match(NEEDLE)
      if (!found) {
        return {
          live: false,
          invalid: true,
          detail:
            `could not read the 'Automated checks' tally value out of ${PAGE}. The probe's ` +
            `needle is stale or the tally moved again — fix the probe, not the gate.`,
        }
      }
      const current = Number(found[2])
      const injected = current + 1

      const result = gateProbe({
        cmd: 'pnpm',
        args: ['validate:governance-tally'],
        success: 'caught the page/doc tally drift',
        breakIt: () =>
          mutateFile(PAGE, (src) => src.replace(NEEDLE, `$1${injected}`)),
      })
      if (result.invalid || !result.live) return result

      // Exit code alone is not enough. The script reports every disagreement it
      // finds under a single exit code, so a non-zero exit proves *a* check
      // fired — not the page-vs-doc one this probe injects. Without asserting on
      // the text, an unrelated failure (say the doc's own Tally block drifting)
      // would satisfy this probe while the page comparison sat broken. Same
      // false-assurance shape as `gateProbe`'s own control run guards against.
      const want = `page publishes ${injected}, layer tables give ${current}`
      if (!(result.out || '').includes(want)) {
        return {
          live: false,
          detail:
            `validate:governance-tally failed, but never reported the injected drift ` +
            `(${JSON.stringify(want)}). Some other disagreement failed the run, so this ` +
            `probe proves nothing about the page-vs-doc comparison it exists to test.`,
        }
      }
      return result
    },
  },

  {
    gate: 'validate:epic-docs',
    why: 'a non-Done Linear issue missing a backlog doc must fail the gate, not pass silently',
    // This gate depends on live Linear data (SUG-262's own resolved Open Question:
    // reuse collectLinear(), not a committed manifest, because a manifest is stale
    // by construction the moment a new orphan issue is created). That makes the
    // usual "mutate a file and observe" probe insufficient on its own: if Linear
    // is unreachable, the gate reports SKIPPED (exit 0) rather than failing, and a
    // probe that only checked "still exits 0 after I broke something" would read a
    // permanently-SKIPPED gate as live — the exact false-assurance shape this
    // harness exists to catch. So the CONTROL run must additionally prove it saw
    // real Linear data (absence of the SKIPPED marker), not merely that it exited 0.
    //
    // Deletes SUG-249's real backlog stub (additive/reversible, restored in
    // `finally` via the cleanup stack) rather than mutating page JSX — this is the
    // probe SUG-262's own Acceptance Criteria specifies ("delete a stub, confirm
    // the gate goes red"), and it exercises collectLinear() for real rather than
    // injecting a synthetic issue list that would test the comparison logic only.
    run() {
      const control = run('pnpm', ['validate:epic-docs'])
      if (control.out.includes('SKIPPED')) {
        // Environment gap, not a broken probe — same shape as the chromatic
        // probe's local-.env-present skip. Reported `live: null` (skipped), not
        // `invalid`, so a missing local LINEAR_API_KEY does not fail the whole
        // harness. CI carries the real secret (ci.yml), so this branch is the
        // expected local-dev path, not the CI path this gate actually depends on.
        return {
          live: null,
          detail:
            'no LINEAR_API_KEY available — validate:epic-docs ran SKIPPED, so this probe ' +
            'cannot exercise the real gate here. Expected outside CI; CI carries the secret.',
        }
      }
      if (control.code !== 0) {
        return {
          live: false,
          invalid: true,
          detail:
            `control run failed — pnpm validate:epic-docs exits ${control.code} on a CLEAN ` +
            `tree (real orphans exist today, or the script itself errored), so this probe ` +
            `cannot distinguish a live gate from a broken invocation. ` +
            `Output: ${control.out.trim().slice(-300)}`,
        }
      }

      const STUB = 'docs/backlog/SUG-249-rescope-platform-dashboards.md'
      const full = resolve(ROOT, STUB)
      const original = readFileSync(full, 'utf8')
      rmSync(full)
      cleanups.push(() => writeFileSync(full, original, 'utf8'))

      const violated = run('pnpm', ['validate:epic-docs'])
      const caught = violated.code !== 0 && violated.out.includes('SUG-249')
      return {
        live: caught,
        detail: caught
          ? 'caught the deleted SUG-249 backlog stub, named it in the failure output'
          : violated.out.trim().slice(-400),
        out: violated.out,
      }
    },
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

  {
    gate: 'pnpm typecheck',
    why: 'a type error in a typechecked package must not compile',
    // CTL-016. Invocation matches ci.yml step *Type check* (`pnpm typecheck` at
    // repo root), not a per-package filter — `turbo run typecheck --continue`
    // fans out itself, and probing one package would prove one of four.
    //
    // The target directory is DERIVED from the package's own tsconfig `include`,
    // never hardcoded. A hardcoded path stops being typechecked the day that
    // include changes, and the probe would then drop its file somewhere tsc
    // never looks: the gate exits 0, and the harness reports the GATE inert when
    // the truth is the probe missed. Same stale-needle misattribution
    // `mutateFile` throws on.
    run() {
      const pkg = 'packages/design-system'
      const tsconfigPath = resolve(ROOT, pkg, 'tsconfig.json')
      if (!existsSync(tsconfigPath)) {
        return { live: null, invalid: true, detail: `${pkg}/tsconfig.json not found — probe target gone` }
      }
      const include = JSON.parse(readFileSync(tsconfigPath, 'utf8')).include
      if (!Array.isArray(include) || include.length === 0) {
        return {
          live: null,
          invalid: true,
          detail: `${pkg}/tsconfig.json has no "include" array, so this probe cannot derive a typechecked directory`,
        }
      }
      // Strip any glob suffix ("src/**/*" -> "src") to get a real directory.
      const dir = include[0].replace(/\/\*.*$/, '')

      return gateProbe({
        cmd: 'pnpm',
        args: ['typecheck'],
        success: 'rejected the type error',
        breakIt: () =>
          tempFile(
            `${pkg}/${dir}/__liveness_probe__.ts`,
            'export const probe: number = "not a number"\n'
          ),
      })
    },
  },

  {
    gate: 'validate:schema-parity',
    why: 'a local schema field absent from the deployed schema must be reported as drift',
    // CTL-011. Reaches the network: the deployed side comes from `sanity schema
    // list --json`. Where credentials are absent the control run exits non-zero
    // and gateProbe reports the probe INVALID rather than the gate inert, which
    // is the honest outcome — see the `live: null` contract at the top of PROBES.
    //
    // Asserts on WHAT was reported, not merely that something was. Exit 1 alone
    // would also be produced by a schema that fails to parse, which would prove
    // the extractor is strict rather than that drift detection works. The field
    // name must appear in the drift output.
    run() {
      const dir = 'apps/studio/schemas/documents'
      const full = resolve(ROOT, dir)
      if (!existsSync(full)) {
        return { live: null, invalid: true, detail: `${dir} not found — probe target gone` }
      }
      // Derived, not hardcoded: the first document schema by name. A hardcoded
      // filename silently stops being a registered schema the day it is renamed.
      const target = readdirSync(full).filter((f) => f.endsWith('.ts')).sort()[0]
      if (!target) {
        return { live: null, invalid: true, detail: `no .ts schema found in ${dir}` }
      }

      const FIELD = 'livenessProbeField'
      const res = gateProbe({
        cmd: 'pnpm',
        args: ['validate:schema-parity'],
        success: `reported the drift, naming ${FIELD}`,
        // mutateFile throws when the needle is stale, so a drifted `fields: [`
        // shape fails the PROBE loudly instead of reporting the GATE inert.
        breakIt: () =>
          mutateFile(`${dir}/${target}`, (s) =>
            s.replace(
              /fields: \[/,
              `fields: [\n    { name: '${FIELD}', title: 'Liveness Probe', type: 'string' },`
            )
          ),
      })

      if (res.live && !(res.out || '').includes(FIELD)) {
        return {
          live: false,
          invalid: true,
          detail:
            `the gate exited non-zero but its output never names ${FIELD}, so this proves ` +
            `something failed rather than that drift was detected. Output: ${(res.out || '').trim().slice(-300)}`,
        }
      }
      return res
    },
  },

  // Architectural boundary rules — one probe per enforced scope, generated from
  // SCOPES above. SUG-254.
  ...BOUNDARY_PROBES,
]

// ─── --list-gates ────────────────────────────────────────────────────────────
//
// Emits the gate list as JSON for `validate:governance`'s probe-record check
// (SUG-268 PRD §8 Decision 4). Reading this array is the ONLY honest way to know
// the gate set: BOUNDARY_PROBES is computed at runtime from Object.keys(SCOPES),
// so any static list is a second copy that can drift, and regex over this file
// is forbidden by PRD §5.2.
//
// PLACEMENT IS LOAD-BEARING. This block must sit after PROBES is composed and
// before main() is invoked below. Appending it to the end of the file — the most
// natural way to add a flag — runs every probe first, mutating package.json,
// control-register.md, globals.css and GovernanceDraftPage.jsx, staging files,
// and deleting a backlog doc, during someone's `git commit`. The consuming
// check's parse error would arrive long after the damage.
//
// Composing PROBES is safe: only patternsFor() runs at composition time, and
// every mutation lives inside a probe's run().
//
// One JSON array on one line, deliberately. A pipe truncates at 64KB, and a
// truncated array fails JSON.parse — loud. Line-delimited output would truncate
// into a short but valid list, which reads as "these are all the gates".
if (process.argv.includes('--list-gates')) {
  console.log(JSON.stringify(PROBES.map((p) => p.gate)))
  process.exit(0)
}

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Re-entrancy guard. `validate:governance` is probed by this harness AND spawns
 * this harness for its gate list, so the two call each other. That terminates
 * only because --list-gates exits above without reaching main().
 *
 * If that short-circuit ever regresses, the failure is not degraded — it is
 * exponential: each harness run executes the probe that runs the gate that
 * spawns the harness, with nested cleanup snapshots taken at different depths,
 * so restores race against each other on the real working tree.
 *
 * run() spreads process.env into every child, so this marker propagates for
 * free. Three lines against an unbounded cost.
 */
const REENTRY = 'SUGARTOWN_LIVENESS_RUNNING'

function main() {
  if (process.env[REENTRY] === '1') {
    console.error(
      '\n❌  validate-enforcement-liveness.js re-entered itself.\n\n' +
        '    Something invoked the full harness from inside a probe. The only\n' +
        '    intended nested call is `--list-gates`, which must exit before main().\n' +
        '    Check that the --list-gates short-circuit still sits above main().\n'
    )
    process.exit(1)
  }
  process.env[REENTRY] = '1'

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
