#!/usr/bin/env node
/**
 * governance-build.js — first-cut generator for the governance data layer.
 * SUG-268 Phase 1. Implements `docs/briefs/governance-data-layer-prd.md` §5.1.
 *
 * Phase 1 scope, deliberately narrow: read `governance/source/`, validate it
 * against the schema, and write to a SCRATCH directory. It does not touch
 * `control-register.md`, `governance-coverage.md`, or any page JSX — those
 * consumers keep running on the hand-maintained files until Phase 4. The epic's
 * acceptance criterion is that all four are byte-identical before and after a
 * run of this script.
 *
 * Determinism (PRD §3): this script reads no clock. `--reference-date` supplies
 * the date used for not-in-the-future checks, defaulting to the newest date
 * present in source. A wall-clock read here would make diff-clean fail on a
 * clean tree the day after the last build.
 *
 * Usage:
 *   node scripts/governance-build.js [--out <dir>] [--reference-date YYYY-MM-DD]
 *
 * Exit codes:
 *   0 — source is schema-valid and referentially whole; scratch output written
 *   1 — at least one validation error (every one names its record and field)
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
const DEFAULT_OUT = resolve(ROOT, '.governance-build')

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

  const referenceDate = cliDate ?? gitCommitDate()
  const { errors, counts } = validateSource(source, { root: ROOT, referenceDate })

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  console.log(`   Read ${total} record(s) from governance/source/:`)
  for (const [entity, n] of Object.entries(counts)) {
    console.log(`     ${String(n).padStart(3)}  ${entity}`)
  }

  if (referenceDate) {
    const origin = cliDate ? '--reference-date' : 'HEAD committer date'
    console.log(`\n   Not-in-the-future reference: ${referenceDate} (${origin})`)
    console.log('   Deterministic per commit, and external to the records under test.\n')
  } else {
    console.log('\n   ⚠️   Not-in-the-future checks SKIPPED — git unavailable and no')
    console.log('       --reference-date given. This is not a pass: no date was')
    console.log('       range-checked. Pass --reference-date YYYY-MM-DD to enable.\n')
  }

  if (errors.length > 0) {
    console.log(`❌  ${errors.length} validation error(s):\n`)
    console.log(formatErrors(errors))
    console.log('\n   Fix the source records above. Nothing was written.\n')
    process.exit(1)
  }

  console.log('✅  Source is schema-valid and referentially whole.\n')

  // Phase 1 writes a normalised snapshot to scratch. Phase 2 replaces this with
  // the real generated register, coverage doc, and apps/web governance.json.
  mkdirSync(out, { recursive: true })
  const snapshot = {
    _note:
      'SUG-268 Phase 1 scratch output. Not a consumer contract — Phase 2 replaces this with generated control-register.md, governance-coverage.md, and apps/web/src/generated/governance.json.',
    referenceDate,
    counts,
    entities: source,
  }
  const outFile = join(out, 'governance.snapshot.json')
  writeFileSync(outFile, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')

  console.log(`   Wrote scratch snapshot: ${outFile.replace(`${ROOT}/`, '')}`)
  console.log('   No tracked generated file was touched (Phase 1 is additive).\n')

  // Make the "touched nothing tracked" claim checkable rather than asserted.
  const untouched = [
    'docs/ai/agentic-caucus/control-register.md',
    'docs/ai/agentic-caucus/governance-coverage.md',
    'apps/web/src/pages/platform/GovernancePage.jsx',
    'apps/web/src/pages/platform/GovernanceDraftPage.jsx',
  ]
  console.log('   Consumers left untouched by design (verify with git status):')
  untouched.forEach((f) => console.log(`     · ${f}`))
  console.log('')

  process.exit(0)
}

// Guard against the scratch dir ever being mistaken for tracked output.
if (!readdirSync(ROOT).includes('.gitignore')) {
  console.warn('   ⚠️   no .gitignore at repo root — check that the scratch dir is ignored')
}

main()
