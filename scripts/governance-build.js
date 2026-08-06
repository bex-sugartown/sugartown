#!/usr/bin/env node
/**
 * governance-build.js — generator for the governance data layer.
 * SUG-268 Phase 2. Implements `docs/briefs/governance-data-layer-prd.md` §5.1.
 *
 * Phase 2 scope: read `governance/source/`, validate it, and write ONE real
 * artifact — `apps/web/src/generated/governance.json`. Nothing reads that file
 * until Phase 4, so regenerating it destroys nothing.
 *
 * It deliberately does NOT write `control-register.md` or
 * `governance-coverage.md`. Generating those from source IS the migration:
 * the register holds 29 rows and the seed holds 4 records, so a run today would
 * delete 25 controls, after which `validate:controls` errors once per
 * `validate:*` script with no row — on a branch Netlify deploys regardless of CI
 * (CTL-020). That write moves to Phase 3, alongside the records that justify it.
 * (Phase 2 verification review, blocker B4.)
 *
 * Keeping Phase 2 out of `docs/ai/agentic-caucus/` has a second benefit: that
 * path is covered by CLAUDE.md's Instruction & Rule File Write Gate today, and
 * Decision 3 moves the gated scope at Phase 3. Nothing generates into a gated
 * path before the CLAUDE.md edit lands.
 *
 * `--out` redirects the write, which is how `validate:governance-diff`
 * regenerates into scratch without touching the tracked file.
 *
 * Determinism (PRD §3) binds GENERATED OUTPUT BYTES, not the validator's
 * comparison reference. Those are different things, and conflating them is what
 * produced this script's first two defects: a reference date derived from the
 * data under test (which always passes its own newest record), and then that
 * reference written into the artifact (which makes identical source hash
 * differently on different days — PRD §9's named diff-clean flake risk).
 *
 * The rule now: the not-in-the-future reference comes from HEAD's committer
 * date or an explicit `--reference-date`, is validated as ISO before use, and is
 * NEVER written into output. When it cannot be established the build FAILS
 * rather than reporting a pass it did not earn.
 *
 * Usage:
 *   node scripts/governance-build.js [--out <dir>] [--reference-date YYYY-MM-DD]
 *
 * Exit codes:
 *   0 — source is schema-valid and referentially whole; scratch output written
 *   1 — at least one validation error (every one names its record and field),
 *       or the not-in-the-future reference could not be established
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ENTITIES } from '../governance/schema/entities.js'
import { validateSource, formatErrors } from '../governance/schema/validate.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SOURCE_DIR = resolve(ROOT, 'governance/source')
const DEFAULT_OUT = resolve(ROOT, 'apps/web/src/generated')
const OUT_FILE = 'governance.json'

/**
 * The consumer contract's version. Phase 4's page import pins it; a shape change
 * that would break a consumer bumps this rather than silently altering the file.
 */
const SCHEMA_VERSION = 1

/**
 * Derived tally, computed from `component.layerStatus` rather than restated.
 * Every key in the enum is present even at zero — an absent key and a zero
 * count read identically to a consumer, and "no components are in this state"
 * is a different claim from "this state was never considered".
 */
const LAYER_STATUSES = ['strong', 'partial', 'inherited', 'not-applicable']

function deriveTally(components) {
  const tally = Object.fromEntries(LAYER_STATUSES.map((s) => [s, 0]))
  for (const c of components) {
    if (c.layerStatus in tally) tally[c.layerStatus] += 1
  }
  return tally
}

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT, referenceDate: null, source: SOURCE_DIR }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out') {
      args.out = resolve(ROOT, argv[i + 1])
      i += 1
    } else if (argv[i] === '--reference-date') {
      args.referenceDate = argv[i + 1]
      i += 1
    } else if (argv[i] === '--source') {
      // Exists so the schema can be run against a deliberately broken fixture.
      // A validator nobody has watched fail is a validator nobody has tested.
      args.source = resolve(ROOT, argv[i + 1])
      i += 1
    }
  }
  return args
}

function readSource(sourceDir) {
  const source = {}
  const problems = []

  for (const [entityName, spec] of Object.entries(ENTITIES)) {
    const path = join(sourceDir, spec.file)
    let raw
    try {
      raw = readFileSync(path, 'utf8')
    } catch {
      problems.push(`missing source file: governance/source/${spec.file} (for ${entityName})`)
      source[entityName] = []
      continue
    }
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        problems.push(`governance/source/${spec.file} must contain a JSON array`)
        source[entityName] = []
      } else {
        source[entityName] = parsed
      }
    } catch (e) {
      problems.push(`governance/source/${spec.file} is not valid JSON — ${e.message}`)
      source[entityName] = []
    }
  }

  return { source, problems }
}

/**
 * The reference date for not-in-the-future checks must be BOTH deterministic
 * and external to the data under test.
 *
 * Deriving it from source is tempting and wrong twice over: `nextRead` dates are
 * legitimately in the future, so the maximum source date sits ahead of every
 * real measurement, and a reference taken from the values being checked always
 * passes the newest one. Either way the check renders as configured while
 * catching nothing — the exact failure class this pipeline exists to kill.
 *
 * HEAD's committer date is deterministic for a given commit and comes from
 * outside the records. When git is unavailable the check is SKIPPED loudly
 * rather than run against a fabricated reference.
 */
function gitCommitDate() {
  try {
    const out = execFileSync('git', ['show', '-s', '--format=%cs', 'HEAD'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null
  } catch {
    return null
  }
}

function main() {
  const { out, referenceDate: cliDate, source: sourceDir } = parseArgs(process.argv.slice(2))

  console.log('\n🏛   Sugartown Governance Build (Phase 1 — scratch output only)')
  console.log('══════════════════════════════════════════════\n')

  if (sourceDir !== SOURCE_DIR) {
    console.log(`   Source override: ${sourceDir.replace(`${ROOT}/`, '')}\n`)
  }

  const { source, problems } = readSource(sourceDir)

  if (problems.length > 0) {
    console.log('❌  Could not read source:\n')
    problems.forEach((p) => console.log(`   ✗  ${p}`))
    console.log('')
    process.exit(1)
  }

  // Establish the reference BEFORE validating. An unusable reference is a build
  // failure, not a skipped check reported as a pass — a gate reads the exit
  // code, not the warning text above it.
  const referenceDate = cliDate ?? gitCommitDate()

  if (!referenceDate || !/^\d{4}-\d{2}-\d{2}$/.test(referenceDate)) {
    console.log('❌  Cannot establish a not-in-the-future reference date.\n')
    if (cliDate) {
      console.log(`   --reference-date was given as "${cliDate}", which is not an ISO date (YYYY-MM-DD).`)
    } else {
      console.log('   No --reference-date given, and HEAD\'s committer date could not be read')
      console.log('   (git missing, or a repository with no commits).')
    }
    console.log('\n   Refusing to validate: comparing dates against an unusable reference')
    console.log('   passes every record while reporting the check as configured.')
    console.log('   Pass --reference-date YYYY-MM-DD explicitly.\n')
    process.exit(1)
  }

  const { errors, counts } = validateSource(source, { root: ROOT, referenceDate })

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  console.log(`   Read ${total} record(s) from governance/source/:`)
  for (const [entity, n] of Object.entries(counts)) {
    console.log(`     ${String(n).padStart(3)}  ${entity}`)
  }

  const origin = cliDate ? '--reference-date' : 'HEAD committer date'
  console.log(`\n   Not-in-the-future reference: ${referenceDate} (${origin})`)
  console.log('   External to the records under test; never written to output.\n')

  if (errors.length > 0) {
    console.log(`❌  ${errors.length} validation error(s):\n`)
    console.log(formatErrors(errors))
    console.log('\n   Fix the source records above. Nothing was written.\n')
    process.exit(1)
  }

  console.log('✅  Source is schema-valid and referentially whole.\n')

  mkdirSync(out, { recursive: true })

  // Output bytes must depend on SOURCE ALONE.
  //
  // referenceDate is deliberately absent: it varies by commit while source does
  // not, so writing it would make identical source produce different bytes on
  // different days and turn `validate:governance-diff` into a flake that gets
  // normalised into being ignored (PRD §9's named High risk). Records are sorted
  // by id so array order in the source file cannot affect output either. Object
  // key order below is fixed by insertion order in this literal.
  const sortedEntities = {}
  for (const [entityName, spec] of Object.entries(ENTITIES)) {
    sortedEntities[entityName] = [...(source[entityName] ?? [])].sort((a, b) =>
      String(a[spec.idField]) < String(b[spec.idField]) ? -1 : String(a[spec.idField]) > String(b[spec.idField]) ? 1 : 0
    )
  }

  const artifact = {
    _generated:
      'GENERATED FILE — do not edit. Source: governance/source/*.json. Rebuild: pnpm governance:build. Hand edits are caught by pnpm validate:governance-diff.',
    schemaVersion: SCHEMA_VERSION,
    counts,
    tally: deriveTally(sortedEntities.component ?? []),
    controls: sortedEntities.control ?? [],
    components: sortedEntities.component ?? [],
    claims: sortedEntities.claim ?? [],
    probes: sortedEntities.probe ?? [],
    crosswalk: sortedEntities.crosswalk ?? [],
  }

  const outFile = join(out, OUT_FILE)
  writeFileSync(outFile, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8')

  const rel = outFile.replace(`${ROOT}/`, '')
  console.log(`   Wrote ${rel}`)
  if (out !== DEFAULT_OUT) {
    console.log('   (--out override — the tracked artifact was not touched)')
  }
  console.log('')

  // The registers are NOT generated in Phase 2. Say so on every run, because a
  // generator that silently declines to write half its outputs is indisputably
  // worse than one that says which half and why.
  console.log('   Not generated until Phase 3 (writing them IS the migration):')
  console.log('     · docs/ai/agentic-caucus/control-register.md')
  console.log('     · docs/ai/agentic-caucus/governance-coverage.md')
  console.log('')

  process.exit(0)
}

// Guard against the scratch dir ever being mistaken for tracked output.
if (!readdirSync(ROOT).includes('.gitignore')) {
  console.warn('   ⚠️   no .gitignore at repo root — check that the scratch dir is ignored')
}

main()
