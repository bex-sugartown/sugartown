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

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
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

// ─── claim.command resolution ────────────────────────────────────────────────
//
// A published claim names the command that reproduces it. This checks the
// command names something that EXISTS — never that running it returns the
// published value (full run-and-compare is a Non-Goal, PRD §3).
//
// Closed world: an unrecognised runner is an error, never a skip. "Skip what I
// don't recognise" is how a check comes to pass everything, which is the failure
// class this pipeline exists to kill.
//
// Three runners can be recognised but not verified offline — `git` and `curl`
// have no repo-local target, and `npx` may name a package that is not installed.
// Those report as UNVERIFIABLE: counted and printed on every run rather than
// quietly folded into the pass. CTL-031's row names them, so the register does
// not overstate what this proves.

const PNPM_VALUE_FLAGS = ['--filter', '-F', '--dir', '-C', '--config', '--workspace-dir', '--reporter']
const PNPM_BOOL_FLAGS = [
  '-r', '--recursive', '-w', '--workspace-root', '--silent', '--if-present',
  '--parallel', '--no-bail', '--force', '--stream', '--aggregate-output',
]
// pnpm's own subcommands. Recognised, but they run pnpm itself rather than a
// script, so there is no script name to resolve.
const PNPM_BUILTINS = [
  'audit', 'exec', 'dlx', 'install', 'i', 'add', 'remove', 'update', 'why', 'list',
  'outdated', 'store', 'licenses', 'link', 'publish', 'pack', 'deploy', 'env', 'patch', 'rebuild',
]

/** name -> Set(script names), for the root manifest and every workspace package. */
function readWorkspaceScripts() {
  const manifests = new Map()
  const files = [['<root>', resolve(ROOT, 'package.json')]]
  for (const group of ['apps', 'packages']) {
    const groupDir = resolve(ROOT, group)
    if (!existsSync(groupDir)) continue
    for (const entry of readdirSync(groupDir)) {
      const pkgPath = join(groupDir, entry, 'package.json')
      if (existsSync(pkgPath)) files.push([null, pkgPath])
    }
  }
  for (const [label, file] of files) {
    try {
      const pkg = JSON.parse(readFileSync(file, 'utf8'))
      manifests.set(label ?? pkg.name, new Set(Object.keys(pkg.scripts || {})))
    } catch {
      /* a malformed manifest is already reported by other gates */
    }
  }
  return manifests
}

function resolvePnpmLike(tokens, manifests) {
  let filter = null
  let i = 0

  while (i < tokens.length && tokens[i].startsWith('-')) {
    const flag = tokens[i]
    if (PNPM_VALUE_FLAGS.includes(flag)) {
      if (flag === '--filter' || flag === '-F') filter = tokens[i + 1]
      i += 2
      continue
    }
    if (PNPM_BOOL_FLAGS.includes(flag)) {
      i += 1
      continue
    }
    // Closed world for flags too. An unlisted value-taking flag would otherwise
    // shift the token window by one and resolve the WRONG token — and a wrong
    // token that happens to name a real script reports PASS, which is worse
    // than a miss.
    return { status: 'error', detail: `unrecognised flag "${flag}" — add it to the value or boolean flag list` }
  }

  let script = tokens[i]
  if (script === 'run') script = tokens[i + 1]
  else if (PNPM_BUILTINS.includes(script)) {
    return { status: 'unverifiable', detail: `"${script}" is a package-manager subcommand, not a script` }
  }

  if (!script) return { status: 'error', detail: 'names no script' }

  // Scope matters. `pnpm validate:css-names` from the repo root is
  // "command not found" — that exact false positive is why the liveness
  // harness has a control run at all. So a bare invocation resolves against the
  // ROOT manifest only, and --filter resolves against that package's.
  const target = filter ?? '<root>'
  const scripts = manifests.get(target)
  if (!scripts) {
    return { status: 'error', detail: `--filter names package "${filter}", which has no package.json in this workspace` }
  }
  if (!scripts.has(script)) {
    return {
      status: 'error',
      detail: `script "${script}" is not defined in ${filter ? `package "${filter}"` : 'the root package.json'}`,
    }
  }
  return { status: 'resolved', detail: script }
}

function resolveCommand(command, manifests) {
  // Only the first clause of a compound command is checked; CTL-031 says so.
  const firstClause = command.split(/&&|\|\||;/)[0].trim()
  // Leading FOO=bar environment assignments are not the runner.
  const tokens = firstClause.split(/\s+/).filter((t) => t && !/^[A-Za-z_][A-Za-z0-9_]*=/.test(t))
  const runner = tokens[0]

  if (!runner) return { status: 'error', detail: 'is empty' }

  switch (runner) {
    case 'pnpm':
    case 'npm':
      return resolvePnpmLike(tokens.slice(1), manifests)

    case 'npx': {
      const pkg = tokens.slice(1).find((t) => !t.startsWith('-'))
      if (!pkg) return { status: 'error', detail: 'npx names no package' }
      return existsSync(resolve(ROOT, 'node_modules/.bin', pkg))
        ? { status: 'resolved', detail: `node_modules/.bin/${pkg}` }
        : { status: 'unverifiable', detail: `"${pkg}" is not in node_modules/.bin; npx would fetch it` }
    }

    case 'node':
    case 'bash':
    case 'sh': {
      const arg = tokens.slice(1).find((t) => !t.startsWith('-'))
      if (!arg) return { status: 'unverifiable', detail: `${runner} was given no script path (inline -e or stdin)` }
      return existsSync(resolve(ROOT, arg))
        ? { status: 'resolved', detail: arg }
        : { status: 'error', detail: `names path "${arg}", which does not exist` }
    }

    case 'git':
    case 'curl':
    case 'gh':
      return { status: 'unverifiable', detail: `"${runner}" has no repo-local target to check` }

    default:
      return {
        status: 'error',
        detail:
          `"${runner}" is not a recognised runner. Add it to RUNNERS in scripts/validate-governance.js ` +
          'with how its target is verified — an unrecognised runner is an error, never a skip.',
      }
  }
}

/**
 * `claim.statsKey` must resolve in stats.json (PRD §5.2), and must resolve to a
 * PRIMITIVE.
 *
 * Both halves are load-bearing. `security.vulnerabilities` resolves to an object
 * while the published `0` comes from `.total` — so a bare "does the path
 * resolve" check passes the one seed record it exists to police, and would let
 * the register claim this rule is enforced when it is not.
 *
 * Unconditional, deliberately. stats.json is matched by .gitignore AND tracked
 * at HEAD, so it is present in every clone and every CI checkout. A "check only
 * when present" branch would have a permanently-true condition and an
 * unreachable skip path — which becomes a silent no-op the day someone untracks
 * the file, with no signal at all.
 */
function checkStatsKeys(claims) {
  const errors = []
  const STATS = 'apps/web/src/generated/stats.json'
  const withKeys = claims.filter((c) => typeof c.statsKey === 'string' && c.statsKey !== '')
  if (withKeys.length === 0) return errors

  let stats
  try {
    stats = JSON.parse(readFileSync(resolve(ROOT, STATS), 'utf8'))
  } catch (e) {
    errors.push(
      `${withKeys.length} claim(s) carry a statsKey but ${STATS} could not be read — ${e.message}. ` +
        'This is a failure, not a skip: the file is tracked and present in every checkout.'
    )
    return errors
  }

  for (const claim of withKeys) {
    let node = stats
    for (const part of claim.statsKey.split('.')) {
      node = node && typeof node === 'object' ? node[part] : undefined
    }
    if (node === undefined) {
      errors.push(`claim ${claim.id} — statsKey "${claim.statsKey}" does not resolve in ${STATS}`)
    } else if (node !== null && typeof node === 'object') {
      errors.push(
        `claim ${claim.id} — statsKey "${claim.statsKey}" resolves to ${Array.isArray(node) ? 'an array' : 'an object'}, ` +
          'not a published value. Name the leaf key that carries the figure.'
      )
    }
  }
  return errors
}

function checkClaimCommands(claims) {
  const errors = []
  const unverifiable = []
  const manifests = readWorkspaceScripts()

  for (const claim of claims) {
    if (typeof claim.command !== 'string' || claim.command.trim() === '') continue
    const result = resolveCommand(claim.command, manifests)
    if (result.status === 'error') {
      errors.push(`claim ${claim.id} — command ${JSON.stringify(claim.command)} ${result.detail}`)
    } else if (result.status === 'unverifiable') {
      unverifiable.push(`${claim.id}: ${JSON.stringify(claim.command)} — ${result.detail}`)
    }
  }

  return { errors, unverifiable }
}

// ─── Two-way probe ↔ harness correspondence ──────────────────────────────────

/**
 * Every probe record names a gate the harness really has, and every harness gate
 * has a probe record.
 *
 * The gate list comes from SPAWNING `validate-enforcement-liveness.js
 * --list-gates`, never from importing it: that file runs `main()` at module
 * scope, so an import inside a pre-commit hook would execute all its probes —
 * mutating four tracked files, staging others, and deleting a backlog doc.
 * Regex over the harness source is forbidden (PRD §5.2) and would be wrong
 * anyway: the boundary gates are computed at runtime from Object.keys(SCOPES),
 * so only the harness's own composition reports the true list.
 *
 * `process.execPath` rather than 'node': a bare 'node' is ENOENT under a minimal
 * PATH. Not through pnpm either — a package manager is free to write banner
 * lines to stdout ahead of the payload, and this parses stdout.
 *
 * What this proves is CORRESPONDENCE, not coverage. A gate with neither a probe
 * nor a record satisfies both directions vacuously, and a record asserts a probe
 * exists rather than that it ran. Coverage of npm-script gates belongs to
 * validate:controls check 3. CTL-031's Bypass cell says so.
 */
function checkProbeCorrespondence(probeRecords) {
  const errors = []
  const HARNESS = 'scripts/validate-enforcement-liveness.js'

  const res = spawnSync(process.execPath, [resolve(ROOT, HARNESS), '--list-gates'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  })

  if (res.error || res.status !== 0) {
    errors.push(
      `could not read the gate list: ${HARNESS} --list-gates ` +
        `${res.error ? `failed to spawn (${res.error.code})` : `exited ${res.status}`}. ` +
        'This check cannot run, which is a failure and never a skip.'
    )
    return { errors, gateCount: 0 }
  }

  let gates
  try {
    gates = JSON.parse(res.stdout)
  } catch (e) {
    // One JSON array, so a 64KB pipe truncation lands here rather than yielding
    // a short-but-valid list that would read as the complete gate set.
    errors.push(`gate list from ${HARNESS} --list-gates is not parseable JSON — ${e.message}`)
    return { errors, gateCount: 0 }
  }

  if (!Array.isArray(gates) || gates.some((g) => typeof g !== 'string')) {
    errors.push(`gate list from ${HARNESS} --list-gates is not an array of strings`)
    return { errors, gateCount: 0 }
  }

  if (gates.length === 0) {
    // Floor. An empty list makes the harness→record direction pass over nothing.
    errors.push(
      `${HARNESS} --list-gates returned no gates. Either the harness has no probes, or the ` +
        'flag is not reading the PROBES array — both make this check vacuous.'
    )
    return { errors, gateCount: 0 }
  }

  if (new Set(gates).size !== gates.length) {
    // Two probes sharing a label map onto one record, leaving another probe
    // recordless while set-comparison in both directions still passes.
    const seen = new Set()
    const dupes = [...new Set(gates.filter((g) => (seen.has(g) ? true : (seen.add(g), false))))]
    errors.push(
      `${HARNESS} declares duplicate gate label(s): ${dupes.join(', ')}. ` +
        'Probe records are keyed by gate, so a duplicate hides an unprobed gate from this check.'
    )
  }

  const recorded = new Map(probeRecords.map((p) => [p.gate, p.id]))

  for (const gate of gates) {
    if (!recorded.has(gate)) {
      errors.push(
        `the liveness harness runs a probe for "${gate}", which has no record in ` +
          'governance/source/probes.json. Add one naming its derivation.'
      )
    }
  }

  for (const record of probeRecords) {
    if (!gates.includes(record.gate)) {
      errors.push(
        `probe record ${record.id} names gate "${record.gate}", which the liveness harness ` +
          'does not run. Remove the record, or add the probe.'
      )
    }
  }

  return { errors, gateCount: gates.length }
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
  const correspondence = checkProbeCorrespondence(source.probe ?? [])
  const commands = checkClaimCommands(source.claim ?? [])
  const statsKeys = checkStatsKeys(source.claim ?? [])

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  console.log(`   ${total} source record(s) · reference ${reference.date} (${reference.origin})`)
  console.log(`   Outside-source scan: ${scan.scanned} file(s) across ${SCAN_ROOTS.length} root(s), read from the index`)
  console.log(`   Probe correspondence: ${(source.probe ?? []).length} record(s) against ${correspondence.gateCount} harness gate(s)`)
  console.log(`   Claim commands: ${(source.claim ?? []).length} claim(s), ${commands.unverifiable.length} unverifiable\n`)
  if (commands.unverifiable.length > 0) {
    // Printed on every run, pass or fail. A runner this check cannot verify is
    // a known hole, and a known hole folded silently into a pass is the thing
    // the register row would then be overstating.
    console.log('   Commands recognised but not verifiable offline:')
    commands.unverifiable.forEach((u) => console.log(`     ·  ${u}`))
    console.log('')
  }

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

  const claimErrors = [...commands.errors, ...statsKeys]
  if (claimErrors.length > 0) {
    failed = true
    console.log(`❌  ${claimErrors.length} claim evidence finding(s):\n`)
    claimErrors.forEach((e) => console.log(`   ✗  ${e}`))
    console.log('')
  }

  if (correspondence.errors.length > 0) {
    failed = true
    console.log(`❌  ${correspondence.errors.length} probe correspondence finding(s):\n`)
    correspondence.errors.forEach((e) => console.log(`   ✗  ${e}`))
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
  console.log('    no governance data was found outside governance/source/, and every')
  console.log('    probe record matches a real harness gate in both directions.\n')
  process.exit(0)
}

main()
