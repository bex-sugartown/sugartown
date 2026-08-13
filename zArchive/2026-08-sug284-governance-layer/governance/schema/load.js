/**
 * load.js — reading governance source, and establishing a reference date.
 *
 * Extracted from `scripts/governance-build.js` when `validate:governance`
 * (SUG-268 Phase 2, CTL-031) became a second caller. Two copies of a loader is
 * the drift class this pipeline exists to kill, so it lives in one place rather
 * than being pasted into the second script.
 *
 * Nothing here reads a clock or writes a file. The reference date is resolved
 * from an explicit flag or from HEAD's committer date, and returned to the
 * caller to do with as it decides.
 */

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { ENTITIES } from './entities.js'

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Read every entity's source file. Returns records keyed by entity name, plus
 * the problems encountered — a missing or malformed file is reported, never
 * silently treated as an empty record set.
 */
export function readSource(sourceDir) {
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
 * outside the records. When git is unavailable this returns null and the caller
 * refuses to validate, rather than fabricating a reference.
 *
 * This is NOT the date an overdue check reads. Overdue detection is a decay
 * catcher and needs wall-clock today; one value driving both would let an
 * explicit `--reference-date` suppress overdue detection entirely.
 */
export function gitCommitDate(root) {
  try {
    const out = execFileSync('git', ['show', '-s', '--format=%cs', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return ISO_DATE.test(out) ? out : null
  } catch {
    return null
  }
}

/**
 * Resolve the reference date, or explain why it cannot be resolved. The caller
 * treats an unusable reference as a failure, never as a skipped check reported
 * as a pass: a gate reads the exit code, not the warning text above it.
 *
 * @returns {{ date: string, origin: string } | { date: null, reason: string }}
 */
export function resolveReferenceDate(cliDate, root) {
  if (cliDate) {
    return ISO_DATE.test(cliDate)
      ? { date: cliDate, origin: '--reference-date' }
      : { date: null, reason: `--reference-date was given as "${cliDate}", which is not an ISO date (YYYY-MM-DD).` }
  }

  const head = gitCommitDate(root)
  return head
    ? { date: head, origin: 'HEAD committer date' }
    : {
        date: null,
        reason:
          "No --reference-date given, and HEAD's committer date could not be read " +
          '(git missing, or a repository with no commits).',
      }
}
