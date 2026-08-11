#!/usr/bin/env node
/**
 * validate-control-register.js — does the control SET have holes?
 *
 * Three checks already exist and each answers a different question:
 *
 *   validate:validators           — is a gate *wired*?            (SUG-239)
 *   validate:enforcement-liveness — does a gate *fire*?           (SUG-255)
 *   ci-failure-alert.yml          — is CI's result *read*?        (SUG-255)
 *
 * None of them can see a gate that nobody wrote a probe for, a control that is
 * not an npm script at all (a deploy path, a published claim), or a result with
 * no reader. `validate:enforcement-liveness` proves the gates in its PROBES
 * array are live; it is structurally incapable of noticing one that is absent
 * from it. That blind spot is the same shape as the failure it was built to fix,
 * one level up
 * — which is the 2026-07-28 post-mortem's finding in one sentence: every
 * unfilled role was the one that reads the result rather than performs the work.
 *
 * So this script checks the register in docs/ai/agentic-caucus/control-register.md:
 *
 *   1. Every row is complete and well-formed; Class is in the allowed set; IDs
 *      are unique and correctly formatted.
 *   2. Every `enforced-by-code` row's Probe names a gate that genuinely exists
 *      in the PROBES array of validate-enforcement-liveness.js — read out of the
 *      file, never from a copy of the list kept here. A second copy would drift,
 *      and drift between two declarations of the same fact is most of this
 *      repo's incident log.
 *   3. Every `validate:*` script defined in any workspace package.json has a
 *      row. This is the completeness check: a new gate cannot be added without
 *      being registered. Matched as a delimited token, never as a substring —
 *      see isRegistered() below.
 *   4. No row's `Next read` date is in the past.
 *
 * Check 4 is the forcing function, and the only part of the framework that
 * defends against decay rather than against bad design. It goes red on a date
 * nobody chose deliberately, converting silent staleness into a build failure
 * with a name on it. CI failure on `main` opens a rolling `ci-red` issue, so
 * that failure reaches a human.
 *
 * Usage:
 *   pnpm validate:controls
 *
 * Exit codes:
 *   0 — register is complete, probe references resolve, nothing is overdue
 *   1 — at least one row is incomplete, unregistered, unresolvable, or overdue
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const REGISTER = resolve(ROOT, 'docs/ai/agentic-caucus/control-register.md')
const LIVENESS = resolve(ROOT, 'scripts/validate-enforcement-liveness.js')

const CLASSES = ['enforced-by-code', 'measured', 'convention', 'roadmap']
const COLUMNS = ['ID', 'Control', 'Class', 'Probe', 'Reader', 'Next read', 'Bypass']

const CI_WORKFLOW = resolve(ROOT, '.github/workflows/ci.yml')

// ─── Check 5: warn re-arm rows (SUG-281 Phase 1) ─────────────────────────────
//
// A gate softened to `continue-on-error` in ci.yml is supposed to be temporary,
// and its `Next read` date is the deadline. Check 4 alone cannot enforce that:
// when the date passes it says "Read it, record what you found, and set the next
// date", so the cheapest legal response — read the row, note "still warn-only",
// set a date three months out — passes every check in this repo. Warn becomes
// permanent on a schedule, which is the failure the deadline exists to prevent.
//
// So a re-arm row declares when the softening STARTED and how long it may last,
// and `Next read` may not exceed that ceiling. Moving the date is then not a
// legal move: the only ways to clear an overdue re-arm row are to remove
// `continue-on-error` from the named step, or to edit `since` — which is a
// visible, deliberate backdating edit rather than the path of least resistance.
// That is the honest claim: this does not make deferral impossible, it makes it
// require an obvious lie instead of a plausible-looking date change.
//
// Syntax, in the row's Control cell:
//   Re-arm: remove `continue-on-error` from ci.yml step "Validate epic docs" (warn since 2026-08-10, max 60d)

const REARM_RE =
  /Re-arm:.*?ci\.yml step "([^"]+)".*?warn since (\d{4}-\d{2}-\d{2}), max (\d+)d/

function ciStepHasContinueOnError(stepName) {
  if (!existsSync(CI_WORKFLOW)) return null
  const lines = readFileSync(CI_WORKFLOW, 'utf8').split('\n')
  const escaped = stepName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const startRe = new RegExp(`^(\\s*)- name:\\s*${escaped}\\s*$`)

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(startRe)
    if (!m) continue
    const indent = m[1].length
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j]
      if (/^\s*$/.test(line)) continue
      const ind = line.match(/^(\s*)/)[1].length
      if (ind <= indent) break // next step at the same level ends this one
      if (/^\s*continue-on-error:\s*true\s*(?:#.*)?$/.test(line)) return true
    }
    return false
  }
  return null // step not found
}

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

// `validate:*` scripts that legitimately have no register row. Audited, not a
// dumping ground — same discipline as validate-validators.js MANUAL_BY_DESIGN.
const NOT_A_CONTROL = {}

const errors = []
const warnings = []

// ─── Parse the register's markdown table ─────────────────────────────────────
// Rows live under the `## Register` heading. Anything above it (the how-to-read
// tables) is prose and must not be parsed as data.

function parseRegister() {
  if (!existsSync(REGISTER)) {
    errors.push(`Register not found at ${REGISTER}`)
    return []
  }

  const lines = readFileSync(REGISTER, 'utf8').split('\n')
  const start = lines.findIndex((l) => /^##\s+Register\s*$/.test(l))
  if (start === -1) {
    errors.push('control-register.md has no `## Register` heading — nothing to parse')
    return []
  }

  const rows = []
  let sawHeader = false

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (/^##\s/.test(line)) break // next section ends the table
    if (!line.startsWith('|')) continue

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim())

    if (!sawHeader) {
      // First table line is the header; validate its shape, then expect a separator.
      const mismatch = COLUMNS.filter((c, idx) => cells[idx] !== c)
      if (mismatch.length) {
        errors.push(
          `Register header columns changed. Expected: ${COLUMNS.join(' | ')}. Found: ${cells.join(' | ')}`
        )
      }
      sawHeader = true
      continue
    }

    if (/^-+$/.test(cells[0]?.replace(/[:\s]/g, ''))) continue // separator row

    rows.push({ cells, line: i + 1 })
  }

  return rows
}

// ─── Read the REAL probe list out of the liveness harness ────────────────────

function readProbeGates() {
  if (!existsSync(LIVENESS)) {
    errors.push(`Cannot verify probes: ${LIVENESS} not found`)
    // Same shape as the success path. Returning a bare Set here made every
    // caller's `probeGates.gates` undefined, so a missing harness crashed the
    // run instead of reporting the error already pushed above.
    return { gates: new Set(), prefixes: [] }
  }
  const src = readFileSync(LIVENESS, 'utf8')
  // Gate strings appear as 'single', "double" or `template` literals. Matching
  // single quotes only left the four `boundary: ${scope}` probes invisible, so a
  // legitimate row citing one would have been rejected as dangling — a false
  // positive in the gate that polices this register (found by the SUG-256
  // verification review).
  //
  // A template literal captures its source text, not its resolved value, so
  // `boundary: ${scope}` cannot be compared directly. Interpolated gates are
  // recorded as the literal prefix before the first `${`, and matched by prefix
  // below. Less precise than exact matching, and the honest limit of reading a
  // value that only exists at runtime.
  const gates = new Set()
  const prefixes = []
  for (const m of src.matchAll(/gate:\s*(?:'([^']+)'|"([^"]+)"|`([^`]+)`)/g)) {
    const literal = m[1] ?? m[2]
    const template = m[3]
    if (literal !== undefined) gates.add(literal)
    else if (template.includes('${')) prefixes.push(template.slice(0, template.indexOf('${')))
    else gates.add(template)
  }
  if (!gates.size && !prefixes.length) {
    errors.push('No `gate:` entries found in validate-enforcement-liveness.js — probe cross-reference cannot run')
  }
  return { gates, prefixes }
}

// ─── Enumerate every validate:* script in the workspace ──────────────────────

function findValidateScripts() {
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

  const names = new Set()
  for (const file of files) {
    let pkg
    try {
      pkg = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      errors.push(`Could not parse ${file}`)
      continue
    }
    for (const name of Object.keys(pkg.scripts || {})) {
      if (name.startsWith('validate:')) names.add(name)
    }
  }
  return names
}

// ─── Is a script name named by a register row, as itself? ────────────────────
//
// Delimited-token matching, not `blob.includes(name)`. The substring version
// exempted any gate whose name is a prefix of another gate's: SUG-268 Phase 2
// found `validate:governance` satisfied by CTL-027's `validate:governance-tally`
// cell, so a new gate could have shipped with no row at all and this check would
// have stayed green — a completeness check that cannot see the thing it exists
// to see. The weakness is general, not specific to that pair, and it grows with
// every namespaced script added under an existing prefix.
//
// `:` is excluded from the delimiter class as well as `\w` and `-`, so
// `validate:tokens` does not match inside `validate:tokens:strict`.
// Same rule as validate-validators.js isReferenced(); the two answer the same
// question about different corpora and must not disagree.

function isRegistered(name, text) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\:]/g, '\\$&')
  const re = new RegExp(`(^|[^:\\w-])${escaped}($|[^:\\w-])`)
  return re.test(text)
}

// ─── Checks ──────────────────────────────────────────────────────────────────

function today() {
  // Date-only comparison in UTC. A row is overdue the day *after* its date.
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function run() {
  const rows = parseRegister()
  const probeGates = readProbeGates()
  const scripts = findValidateScripts()

  const seenIds = new Set()
  const registeredText = []

  for (const { cells, line } of rows) {
    const [id, control, klass, probe, reader, nextRead, bypass] = cells
    const where = `control-register.md:${line}`

    if (cells.length !== COLUMNS.length) {
      errors.push(`${where} — expected ${COLUMNS.length} columns, found ${cells.length}`)
      continue
    }

    registeredText.push(control)

    // 1. Completeness and well-formedness.
    COLUMNS.forEach((col, idx) => {
      if (!cells[idx]) errors.push(`${where} [${id || '?'}] — "${col}" is empty. Use \`none — <reason>\` if it genuinely does not exist.`)
    })

    if (!/^CTL-\d{3}$/.test(id)) {
      errors.push(`${where} — malformed ID "${id}" (expected CTL-NNN)`)
    } else if (seenIds.has(id)) {
      errors.push(`${where} — duplicate ID "${id}". IDs are monotonic and never reused.`)
    } else {
      seenIds.add(id)
    }

    if (klass && !CLASSES.includes(klass)) {
      errors.push(`${where} [${id}] — unknown Class "${klass}" (allowed: ${CLASSES.join(', ')})`)
    }

    // 2. Probe cross-reference against the real PROBES array.
    if (klass === 'enforced-by-code' && probe) {
      const isWaived = /^none\b/.test(probe)
      if (isWaived) {
        if (!/^none\s+—\s+\S/.test(probe)) {
          errors.push(`${where} [${id}] — Probe "none" needs a reason: \`none — <reason>\``)
        } else {
          warnings.push(`${id} (${control}) is enforced-by-code with no probe: ${probe.replace(/^none\s+—\s+/, '')}`)
        }
      } else {
        const gate = probe.replace(/`/g, '').trim()
        const known =
          probeGates.gates.has(gate) || probeGates.prefixes.some((pre) => pre && gate.startsWith(pre))
        if (!known) {
          errors.push(
            `${where} [${id}] — Probe "${gate}" is not in the PROBES array of validate-enforcement-liveness.js. ` +
              `Add the probe, or set \`none — <reason>\`.`
          )
        }
      }
    }

    // 5. Warn re-arm ceiling. Runs before staleness so an over-long date is
    //    reported as what it is, rather than only once it eventually goes overdue.
    const rearm = control?.match(REARM_RE)
    if (rearm) {
      const [, stepName, since, maxDaysRaw] = rearm
      const maxDays = Number(maxDaysRaw)
      const stillWarn = ciStepHasContinueOnError(stepName)

      if (stillWarn === null) {
        errors.push(
          `${where} [${id}] — Re-arm names ci.yml step "${stepName}", which does not exist in ` +
            `.github/workflows/ci.yml. Renaming a step silently orphans its re-arm deadline.`
        )
      } else if (!stillWarn) {
        errors.push(
          `${where} [${id}] — RE-ARMED. ci.yml step "${stepName}" no longer carries ` +
            `\`continue-on-error\`, so this gate blocks again. Remove the Re-arm clause from the ` +
            `Control cell and restore the row's real Class, Reader and \`Next read\`.`
        )
      } else {
        const ceiling = addDays(since, maxDays)
        const iso = (d) => d.toISOString().slice(0, 10)

        if (!/^\d{4}-\d{2}-\d{2}$/.test(nextRead)) {
          errors.push(
            `${where} [${id}] — a Re-arm row needs a dated "Next read" (the deadline), found "${nextRead}".`
          )
        } else if (new Date(`${nextRead}T00:00:00Z`) > ceiling) {
          errors.push(
            `${where} [${id}] — "Next read" ${nextRead} is beyond the declared warn ceiling of ` +
              `${iso(ceiling)} (warn since ${since}, max ${maxDays}d). The deadline cannot be moved past ` +
              `the ceiling: re-arm the gate by removing \`continue-on-error\` from ci.yml step ` +
              `"${stepName}", or change \`warn since\` deliberately and say why.`
          )
        } else if (ceiling < today()) {
          errors.push(
            `${where} [${id}] — WARN LIFETIME EXCEEDED. "${control?.slice(0, 40)}…" has been warn-only ` +
              `since ${since}, past its ${maxDays}-day ceiling (${iso(ceiling)}), and ci.yml step ` +
              `"${stepName}" still carries \`continue-on-error\`. Re-arm it or extend \`warn since\` explicitly.`
          )
        }
      }
    }

    // 4. Staleness.
    if (nextRead && nextRead !== 'continuous') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(nextRead)) {
        errors.push(`${where} [${id}] — "Next read" must be YYYY-MM-DD or "continuous", found "${nextRead}"`)
      } else {
        const due = new Date(`${nextRead}T00:00:00Z`)
        if (Number.isNaN(due.getTime())) {
          errors.push(`${where} [${id}] — "Next read" is not a real date: "${nextRead}"`)
        } else if (due < today()) {
          errors.push(
            `${where} [${id}] — OVERDUE. "${control}" was due to be read by ${nextRead}. ` +
              `Read it, record what you found, and set the next date. Do not simply move the date.`
          )
        }
      }
    }
  }

  // 3. Completeness: every validate:* script has a row.
  const blob = registeredText.join(' \n ')
  for (const name of [...scripts].sort()) {
    if (name in NOT_A_CONTROL) continue
    if (!isRegistered(name, blob)) {
      errors.push(
        `\`${name}\` is defined in a workspace package.json but has no row in the control register. ` +
          `Every gate needs a row naming its probe and its reader.`
      )
    }
  }

  // ─── Report ────────────────────────────────────────────────────────────────

  // `probeGates` is `{gates, prefixes}`; this line read `probeGates.size` and
  // published `undefined probes in the liveness harness` — a control misreporting
  // its own coverage, in the register that exists to stop exactly that.
  //
  // Counted as what it actually is: gate literals read out of the harness source,
  // plus interpolated forms (`boundary: ${scope}`) that stand for an unknown
  // number of runtime gates. This script reads source text, so it cannot know the
  // runtime total; `validate-enforcement-liveness.js` is the authority on that.
  const literals = probeGates.gates.size
  const interpolated = probeGates.prefixes.length
  console.log(
    `\nControl register: ${rows.length} rows · ${literals} gate literal(s)` +
      `${interpolated ? ` + ${interpolated} interpolated form(s)` : ''} read from the liveness harness · ` +
      `${scripts.size} validate:* scripts\n`
  )

  if (warnings.length) {
    console.log('Coverage gaps (recorded, not blocking):')
    for (const w of warnings) console.log(`  ⚠️  ${w}`)
    console.log('')
  }

  if (errors.length) {
    console.error('Control register errors:')
    for (const e of errors) console.error(`  ❌  ${e}`)
    console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'}. See docs/conventions/verification-review.md.\n`)
    process.exit(1)
  }

  console.log('✅  Every row is complete, every probe reference resolves, nothing is overdue.\n')
}

run()
