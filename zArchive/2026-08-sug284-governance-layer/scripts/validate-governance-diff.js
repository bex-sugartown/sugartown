#!/usr/bin/env node
/**
 * validate-governance-diff.js — proves the generated governance artifact still
 * corresponds to its source. SUG-268 Phase 2 (SUG-271), CTL-034.
 * Implements `docs/briefs/governance-data-layer-prd.md` §5.1's guard row.
 *
 * NAME. The PRD called this `governance:diff-clean`. It ships as
 * `validate:governance-diff` because `validate-validators.js` and
 * `validate-control-register.js` both auto-discover gates by the `validate:`
 * prefix. Under a `governance:` prefix, deleting this check's pre-commit line
 * and its CI step would leave every meta-check green while its probe still
 * reported it live — SUG-239's failure shape, which is the thing this epic
 * exists to stop. (Phase 2 verification review, blocker B6.)
 *
 * IT COMPARES AGAINST THE INDEX, NOT THE WORKING TREE.
 *
 * Regenerating from the worktree and comparing against staged bytes passes in a
 * case that must fail: edit the source, rebuild, then `git add` only the
 * generated file. Worktree-source and staged-output agree, the check is green,
 * and the commit carries generated output that does not correspond to committed
 * source. CI catches it later — after Netlify has already deployed `main`,
 * which it does regardless of CI (CTL-020). So the source is materialised out of
 * the index (or HEAD, in CI) into a scratch tree and the build runs against
 * THAT. (Blocker B3.)
 *
 * IT NEVER WRITES A TRACKED FILE. Regeneration goes to a scratch directory. In-
 * place regeneration would destroy the hand edit under test and compare the
 * generator against itself.
 *
 * Usage:
 *   node scripts/validate-governance-diff.js            # compare against the index (pre-commit)
 *   node scripts/validate-governance-diff.js --ref HEAD # compare against the last commit (CI)
 *
 * Exit codes:
 *   0 — the generated artifact matches what its source produces
 *   1 — drift, a missing artifact, or the comparison could not be made honestly
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ENTITIES } from '../governance/schema/entities.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SOURCE_REL = 'governance/source'
const ARTIFACT_REL = 'apps/web/src/generated/governance.json'

function parseArgs(argv) {
  const args = { ref: 'index' }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--ref') {
      args.ref = argv[i + 1]
      i += 1
    }
  }
  return args
}

/** `git show :path` reads stage 0 of the index; `git show HEAD:path` reads the commit. */
function gitSpec(ref, relPath) {
  return ref === 'index' ? `:${relPath}` : `${ref}:${relPath}`
}

function readFromGit(ref, relPath) {
  try {
    return execFileSync('git', ['show', gitSpec(ref, relPath)], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return null
  }
}

function fail(lines) {
  console.log('\n❌  validate:governance-diff — generated output does not match its source\n')
  lines.forEach((l) => console.log(`   ${l}`))
  console.log('')
  process.exit(1)
}

function main() {
  const { ref } = parseArgs(process.argv.slice(2))

  console.log('\n🔁  Sugartown Governance Diff-Clean')
  console.log('══════════════════════════════════════════════\n')
  console.log(`   Comparing against: ${ref === 'index' ? 'the index (staged bytes)' : `${ref} (committed bytes)`}\n`)

  // 1. Materialise SOURCE out of the index/commit, never the worktree.
  const scratch = mkdtempSync(join(tmpdir(), 'sugartown-govdiff-'))
  try {
    const scratchSource = join(scratch, 'source')
    mkdirSync(scratchSource, { recursive: true })

    const missingSource = []
    for (const spec of Object.values(ENTITIES)) {
      const rel = `${SOURCE_REL}/${spec.file}`
      const content = readFromGit(ref, rel)
      if (content === null) {
        missingSource.push(rel)
        continue
      }
      writeFileSync(join(scratchSource, spec.file), content, 'utf8')
    }

    if (missingSource.length > 0) {
      fail([
        'Source files are missing from the comparison reference:',
        ...missingSource.map((f) => `  · ${f}`),
        '',
        ref === 'index'
          ? 'Stage them (git add governance/source/) so the generated output can be checked against the source it claims to come from.'
          : 'They are absent from the commit under test.',
      ])
    }

    // 2. Read the artifact AS STAGED/COMMITTED. Absent is an error, never a pass:
    //    a check with nothing to compare against must not report success.
    const committedArtifact = readFromGit(ref, ARTIFACT_REL)
    if (committedArtifact === null) {
      fail([
        `${ARTIFACT_REL} is not present in ${ref === 'index' ? 'the index' : ref}.`,
        '',
        ref === 'index'
          ? 'If you changed governance/source/, run `pnpm governance:build` and stage the result.'
          : 'The artifact is missing from the commit under test.',
        '',
        'This is reported as a failure rather than skipped: a comparison with no',
        'reference on one side proves nothing, and a check that passes when it',
        'cannot see its subject is the failure class this pipeline exists to kill.',
      ])
    }

    // 3. Regenerate from the materialised source, into scratch.
    //
    //    --reference-date is wall-clock today on purpose. It cannot affect output
    //    BYTES (proven in Phase 1: two runs, reference dates six months apart,
    //    byte-identical output), so it cannot make this comparison flake. It
    //    exists only so the build succeeds far enough to produce bytes. Whether a
    //    date is legitimately in the future is validate:governance's job, not
    //    this check's. Using HEAD's committer date here would fail the day's
    //    first commit, because inside a pre-commit hook HEAD is the PARENT.
    const today = new Date().toISOString().slice(0, 10)
    const scratchOut = join(scratch, 'out')
    try {
      execFileSync(
        'node',
        [
          resolve(ROOT, 'scripts/governance-build.js'),
          '--source', scratchSource,
          '--out', scratchOut,
          '--reference-date', today,
        ],
        { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
      )
    } catch (e) {
      fail([
        'The generator refused to run against the staged source, so no comparison was made.',
        'Fix the source first — `pnpm governance:build` will name the record and field.',
        '',
        ...String(e.stdout ?? '').trim().split('\n').slice(-12).map((l) => `  ${l}`),
      ])
    }

    const regenerated = readFileSync(join(scratchOut, 'governance.json'), 'utf8')

    // 4. Byte comparison.
    if (regenerated !== committedArtifact) {
      const a = committedArtifact.split('\n')
      const b = regenerated.split('\n')
      const firstDiff = a.findIndex((line, i) => line !== b[i])
      fail([
        `${ARTIFACT_REL} does not match what governance/source/ produces.`,
        '',
        firstDiff >= 0 ? `First difference at line ${firstDiff + 1}:` : 'Length differs.',
        firstDiff >= 0 ? `  ${ref === 'index' ? 'staged' : 'committed'}:  ${JSON.stringify(a[firstDiff] ?? '<absent>')}` : '',
        firstDiff >= 0 ? `  regenerated: ${JSON.stringify(b[firstDiff] ?? '<absent>')}` : '',
        '',
        'The artifact is generated. Do not edit it directly — edit the source and rebuild:',
        '',
        '  governance/source/*.json   ← edit here',
        '  pnpm governance:build      ← then run this',
      ].filter(Boolean))
    }

    console.log(`✅  ${ARTIFACT_REL} matches governance/source/.\n`)
    process.exit(0)
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }
}

main()
