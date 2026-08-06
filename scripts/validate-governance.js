#!/usr/bin/env node
/**
 * validate-governance.js — is the governance SOURCE sound, and is it the only copy?
 *
 * CTL-031. Three checks, each answering a different question:
 *
 *   1. Schema + closed-world referential integrity — delegated to
 *      governance/schema/validate.js. No second implementation lives here.
 *   2. Overdue `nextRead` — the decay catcher.
 *   3. Outside-source scan — is governance data being authored anywhere other
 *      than governance/source/?
 *
 * Check 3 is the one this script exists for. Everything else in this pipeline
 * assumes governance/source/ is the single copy; nothing enforced it, and a
 * hand-written second register is exactly how the two-sources-of-truth problem
 * this epic exists to kill would come back.
 *
 * Two verification reviews shaped check 3, and both findings are worth stating
 * because they are the same mistake at different scales:
 *
 *   - Revision 1 scanned a wide corpus with narrow patterns and wrote the gap
 *     down as coverage. It caught one of the four failure shapes its own design
 *     claimed. That is this repo's founding failure class, reproduced inside the
 *     check built to prevent it.
 *   - Revision 2's pipe-row patterns matched a register row that
 *     validate-enforcement-liveness.js injects as a JS string literal, so the
 *     gate would have failed closed on a clean tree from day one.
 *
 * What this proves and what it does not: correspondence and shape, never truth.
 * A schema-valid record carrying a factually wrong value passes every check
 * here. The scan's coverage boundary is stated in CTL-031's Bypass cell rather
 * than implied by this script's existence.
 *
 * Usage:
 *   pnpm validate:governance
 *   pnpm validate:governance --reference-date 2026-08-06
 *
 * Exit codes:
 *   0 — source is valid, nothing overdue, no governance data found outside source
 *   1 — at least one failure; every one names its record and field, or its file
 */

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readSource, resolveReferenceDate } from '../governance/schema/load.js'
import { validateSource, formatErrors } from '../governance/schema/validate.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SOURCE_DIR = resolve(ROOT, 'governance/source')

// ─── Outside-source scan configuration ───────────────────────────────────────

/**
 * The scanned corpus. Every root here must be one the patterns below can
 * actually express something about — a root listed for a failure shape no
 * pattern matches is coverage on paper only, which is how revision 1 of this
 * design came to scan 396 files and see one of the four things it claimed.
 */
const SCAN_ROOTS = [
  'apps/web/src/*', // holds the generated artifact; where a pasted table would land
  'docs/ai/agentic-caucus/*', // where a hand-written register would be reintroduced
  'scripts/*', // where a second parser or hardcoded id list would live
  'packages/*', // a governance table in a DS doc is the same failure
]

const SCAN_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.md', '.json']

/**
 * Floor on the scanned file count. NOT a zero-check: the failure this guards
 * against returned 29 files, not 0.
 *
 * Running `git ls-files` from apps/web — which is Netlify's base directory —
 * makes the same pathspecs match a DIFFERENT set 94% smaller, because
 * `scripts/*` then resolves to `apps/web/scripts/*`. A zero-floor sails over
 * that; the corpus looks populated and the scan is looking somewhere else.
 * Measured 2026-08-06: 396 files. The floor sits well below that so ordinary
 * churn does not trip it, and well above the 29-file mis-anchored case.
 */
const MIN_CORPUS_FILES = 300

/**
 * Column sets are built into patterns at RUNTIME, never written here as literal
 * matching text. `scripts/` is a scanned root, so a scanner containing its own
 * patterns as literals would match itself and fail closed. The pipe-row
 * patterns are additionally restricted to Markdown, which is what actually
 * prevents the self-match class: a register TABLE that anyone reads is Markdown,
 * while a register ROW inside a `.js` file is a test fixture — and one such
 * fixture exists, at validate-enforcement-liveness.js's validate:controls probe.
 */
const REGISTER_COLUMNS = ['ID', 'Control', 'Class', 'Probe', 'Reader', 'Next read', 'Bypass']
const COVERAGE_COLUMNS = ['Component', 'Status', 'What covers it']
const RECORD_ID_PREFIXES = ['COMP', 'CLM', 'PRB']

/** A pipe-table header row whose cells are exactly these columns, in order. */
function headerPattern(columns) {
  return new RegExp(`\\|\\s*${columns.map((c) => c.replace(/ /g, '\\s+')).join('\\s*\\|\\s*')}\\s*\\|`)
}

/**
 * The patterns. `markdownOnly` is load-bearing, not an optimisation — see the
 * REGISTER_COLUMNS note above.
 */
const PATTERNS = [
  {
    name: 'record-id',
    markdownOnly: false,
    // Namespaces this epic minted. They did not exist before governance/source/,
    // so an occurrence outside it is a second copy rather than a coincidence.
    re: new RegExp(`\\b(?:${RECORD_ID_PREFIXES.join('|')})-\\d{3}\\b`),
    describes: 'a component / claim / probe record id',
  },
  {
    name: 'register-row',
    markdownOnly: true,
    // Deliberately unanchored. `^\|` was defeated by a single leading space:
    // GFM permits up to 3 spaces of table indentation and renders identically,
    // and a blockquoted row evades an anchor too.
    re: /\|\s*CTL-\d{3}\s*\|/,
    describes: 'a hand-authored control-register row',
  },
  {
    name: 'register-table',
    markdownOnly: true,
    re: headerPattern(REGISTER_COLUMNS),
    describes: 'a hand-authored control-register table header',
  },
  {
    name: 'coverage-table',
    markdownOnly: true,
    re: headerPattern(COVERAGE_COLUMNS),
    describes: 'a hand-authored governance-coverage table header',
  },
]

/**
 * Files permitted to contain governance data, each with the pattern it is
 * expected to match.
 *
 * The allowlist is this scan's own liveness evidence, which is why the check
 * runs pattern-side: every pattern must be anchored by at least one entry that
 * really matches it. An entry-side check ("each entry matches something") looks
 * equivalent and is not — with two patterns hitting one file, either could die
 * silently while the entry kept passing on the other. That is the same
 * silent-inertness this scan exists to detect, one level up.
 */
const ALLOWLIST = [
  'docs/ai/agentic-caucus/control-register.md',
  'docs/ai/agentic-caucus/governance-coverage.md',
  'apps/web/src/generated/governance.json',
]

// ─── Reading the index ───────────────────────────────────────────────────────

/**
 * Enumerate and read the corpus from the INDEX, not the worktree.
 *
 * Pre-commit gates the staged state, so reading worktree bytes means an
 * unrelated dirty file blocks every commit while staged-but-reverted content
 * commits unseen. `validate-governance-diff.js` already reads the index for the
 * same reason; this is the same rule applied to a different question.
 *
 * `cwd: ROOT` is load-bearing, not tidiness. Netlify's base directory is
 * apps/web, and these pathspecs resolve against the process cwd.
 *
 * Content comes through one `git cat-file --batch` rather than a `git show` per
 * file: 396 subprocesses cost ~4s on every commit, which is how a gate earns a
 * habit of `--no-verify`.
 */
function readCorpusFromIndex() {
  const listing = execFileSync('git', ['ls-files', '-s', '--', ...SCAN_ROOTS], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })

  const entries = []
  for (const line of listing.split('\n')) {
    if (!line) continue
    // "<mode> <sha> <stage>\t<path>"
    const tab = line.indexOf('\t')
    if (tab === -1) continue
    const path = line.slice(tab + 1)
    const sha = line.slice(0, tab).split(/\s+/)[1]
    if (!sha) continue
    if (!SCAN_EXTENSIONS.some((ext) => path.endsWith(ext))) continue
    entries.push({ path, sha })
  }

  if (entries.length === 0) return { entries: [], contents: new Map() }

  const batch = execFileSync('git', ['cat-file', '--batch'], {
    cwd: ROOT,
    input: entries.map((e) => e.sha).join('\n'),
    maxBuffer: 512 * 1024 * 1024,
  })

  // Response per request line: "<sha> <type> <size>\n<size bytes>\n"
  const contents = new Map()
  let offset = 0
  for (const entry of entries) {
    const nl = batch.indexOf(0x0a, offset)
    if (nl === -1) break
    const header = batch.toString('utf8', offset, nl)
    const size = Number(header.split(' ')[2])
    if (!Number.isFinite(size)) break
    contents.set(entry.path, batch.toString('utf8', nl + 1, nl + 1 + size))
    offset = nl + 1 + size + 1
  }

  return { entries, contents }
}

// ─── Checks ──────────────────────────────────────────────────────────────────

/**
 * Overdue `nextRead`, read against WALL-CLOCK TODAY — deliberately not the
 * `--reference-date` used for not-in-the-future checks.
 *
 * That reference is external and deterministic by design, and it is the right
 * answer for "was this measured before it was recorded". It is the wrong answer
 * here: this check is the decay catcher, and one flag driving both would let a
 * pre-commit `--reference-date` switch decay detection off. Same reasoning as
 * validate-control-register.js, which reads `new Date()` on purpose.
 */
function checkOverdue(controls) {
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const findings = []

  for (const control of controls) {
    if (control.cadence !== 'dated' || !control.nextRead) continue
    const due = new Date(`${control.nextRead}T00:00:00Z`)
    if (Number.isNaN(due.getTime()) || due >= today) continue
    findings.push(
      `${control.id} (${control.name}) was due to be read by ${control.nextRead}. ` +
        'Read it, record what you found, and set the next date. Do not simply move the date.'
    )
  }

  return findings
}

function scanOutsideSource() {
  const errors = []
  const { entries, contents } = readCorpusFromIndex()

  if (entries.length < MIN_CORPUS_FILES) {
    errors.push(
      `scanned only ${entries.length} file(s), below the floor of ${MIN_CORPUS_FILES}. ` +
        'The corpus is not what it should be — check that this ran from the repository root ' +
        '(pathspecs resolve against the process cwd) before lowering the floor.'
    )
    return { errors, scanned: entries.length, anchors: new Map() }
  }

  const allowed = new Set(ALLOWLIST)
  const anchors = new Map(PATTERNS.map((p) => [p.name, []]))
  const hits = []

  for (const { path } of entries) {
    const text = contents.get(path)
    if (text === undefined) {
      errors.push(`could not read ${path} from the index — the scan cannot vouch for this file`)
      continue
    }
    const isMarkdown = path.endsWith('.md')

    for (const pattern of PATTERNS) {
      if (pattern.markdownOnly && !isMarkdown) continue
      if (!pattern.re.test(text)) continue
      if (allowed.has(path)) anchors.get(pattern.name).push(path)
      else hits.push({ path, pattern })
    }
  }

  for (const { path, pattern } of hits) {
    errors.push(
      `${path} contains ${pattern.describes} (pattern "${pattern.name}"). ` +
        'Governance data belongs in governance/source/. Move it there, or add this path to ' +
        'ALLOWLIST in scripts/validate-governance.js with a reason.'
    )
  }

  // Allowlist entries must exist AND be inside the corpus. An entry outside
  // every scanned root passes an existence check while exempting nothing, which
  // reads as a widened allowlist and is really a dead one.
  const inCorpus = new Set(entries.map((e) => e.path))
  for (const path of ALLOWLIST) {
    if (!existsSync(resolve(ROOT, path))) {
      errors.push(`allowlist entry ${path} does not exist — a dead entry silently widens the scan`)
    } else if (!inCorpus.has(path)) {
      errors.push(
        `allowlist entry ${path} is not in the scanned corpus, so it exempts nothing. ` +
          'Either remove it or add its directory to SCAN_ROOTS.'
      )
    }
  }

  // Pattern-side liveness: every pattern must still match something real.
  for (const pattern of PATTERNS) {
    if (anchors.get(pattern.name).length === 0) {
      errors.push(
        `pattern "${pattern.name}" matched nothing anywhere in the corpus, including its ` +
          'allowlisted anchor. It has gone inert — a scan that matches nothing reports clean ' +
          'forever. Fix the pattern or retire it deliberately.'
      )
    }
  }

  return { errors, scanned: entries.length, anchors }
}

// ─── Main ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { referenceDate: null, source: SOURCE_DIR }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--reference-date') {
      args.referenceDate = argv[i + 1]
      i += 1
    } else if (argv[i] === '--source') {
      args.source = resolve(ROOT, argv[i + 1])
      i += 1
    }
  }
  return args
}

function main() {
  const { referenceDate: cliDate, source: sourceDir } = parseArgs(process.argv.slice(2))

  console.log('\n🏛   Sugartown Governance Source Validator')
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

  const reference = resolveReferenceDate(cliDate, ROOT)
  if (!reference.date) {
    console.log('❌  Cannot establish a not-in-the-future reference date.\n')
    console.log(`   ${reference.reason}`)
    console.log('\n   Refusing to validate: comparing dates against an unusable reference')
    console.log('   passes every record while reporting the check as configured.')
    console.log('   Pass --reference-date YYYY-MM-DD explicitly.\n')
    process.exit(1)
  }

  const { errors: schemaErrors, counts } = validateSource(source, { root: ROOT, referenceDate: reference.date })
  const overdue = checkOverdue(source.control ?? [])
  const scan = scanOutsideSource()

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  console.log(`   ${total} source record(s) · reference ${reference.date} (${reference.origin})`)
  console.log(`   Outside-source scan: ${scan.scanned} file(s) across ${SCAN_ROOTS.length} root(s), read from the index\n`)

  let failed = false

  if (schemaErrors.length > 0) {
    failed = true
    console.log(`❌  ${schemaErrors.length} schema / referential error(s):\n`)
    console.log(formatErrors(schemaErrors))
    console.log('')
  }

  if (overdue.length > 0) {
    failed = true
    console.log(`❌  ${overdue.length} control(s) overdue for reading:\n`)
    overdue.forEach((o) => console.log(`   ✗  ${o}`))
    console.log('')
  }

  if (scan.errors.length > 0) {
    failed = true
    console.log(`❌  ${scan.errors.length} outside-source finding(s):\n`)
    scan.errors.forEach((e) => console.log(`   ✗  ${e}`))
    console.log('')
  }

  if (failed) {
    console.log('   See docs/briefs/governance-data-layer-prd.md §5.2 for the field contracts.\n')
    process.exit(1)
  }

  console.log('✅  Source is schema-valid and referentially whole, nothing is overdue,')
  console.log('    and no governance data was found outside governance/source/.\n')
  process.exit(0)
}

main()
