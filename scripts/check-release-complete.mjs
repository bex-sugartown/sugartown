#!/usr/bin/env node
/**
 * check-release-complete.mjs — issue #191
 *
 * Flags a release with steps left undone. Checks the newest local release tag vX.Y.0, or the
 * version given with --version X.Y.0.
 *
 * Reader: /morning (advisory), the Phase 4 closing status of docs/ship-prompt.md (blocking),
 * and the completion checklist of docs/workflows/release-assistant-prompt.md.
 *
 * Exit codes: 0 every step met, 1 at least one unmet (each listed), 2 could not check
 * (GitHub, git or Sanity unreachable). Exit 2 is never a pass.
 *
 * Usage:
 *   node scripts/check-release-complete.mjs [--version X.Y.0]
 *   node scripts/check-release-complete.mjs --self-test      (no network)
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = 'bex-sugartown/sugartown'
const SANITY = 'https://poalmzla.api.sanity.io/v2024-01-01/data/query/production'

// ── Evaluation (pure: takes a gathered state, returns one row per step) ──────────────────

/** A step value of `null` means "could not check". */
export function evaluate(version, s) {
  const tag = `v${version}`
  const rows = [
    ['changelog', `CHANGELOG.md has an [${version}] entry`, s.changelog],
    ['notes', `docs/release-notes/RELEASE_NOTES_${tag}.md exists with an "Issues in this release" section`, s.notes],
    ['tag', `tag ${tag} is on origin and its commit is an ancestor of origin/main`, s.tagOnOrigin],
    ['release', `a GitHub Release is published for ${tag}`, s.githubRelease],
    ['milestone', `milestone ${tag} exists and is closed with at least one issue`, s.milestone],
    [
      'sanity',
      `a releaseNote with version ${version} is published in Sanity (the public API cannot see drafts, so "missing" and "draft only" read the same)`,
      s.sanityNote,
    ],
  ]
  return rows.map(([id, text, ok]) => ({ id, text, status: ok === null ? 'unknown' : ok ? 'met' : 'unmet' }))
}

export function exitCodeFor(rows) {
  if (rows.some((r) => r.status === 'unmet')) return 1
  if (rows.some((r) => r.status === 'unknown')) return 2
  return 0
}

export function report(version, rows) {
  const unmet = rows.filter((r) => r.status === 'unmet')
  const unknown = rows.filter((r) => r.status === 'unknown')
  const lines = [`Release completeness, v${version}`]
  for (const r of rows) {
    const mark = r.status === 'met' ? 'met    ' : r.status === 'unmet' ? 'UNMET  ' : 'UNKNOWN'
    lines.push(`  ${mark} ${r.text}`)
  }
  if (unmet.length) lines.push(`Incomplete: ${unmet.length} step${unmet.length === 1 ? '' : 's'} outstanding.`)
  else if (unknown.length) lines.push(`Could not check ${unknown.length} step${unknown.length === 1 ? '' : 's'}. This is not a pass.`)
  else lines.push('Complete: every step is met.')
  return lines.join('\n')
}

// ── Self-test (injected fixtures, no network) ───────────────────────────────────────────

function selfTest() {
  const bad = { changelog: false, notes: false, tagOnOrigin: false, githubRelease: false, milestone: false, sanityNote: false }
  const good = { changelog: true, notes: true, tagOnOrigin: true, githubRelease: true, milestone: true, sanityNote: true }
  const unreachable = { ...good, githubRelease: null, milestone: null }
  const failures = []

  const badRows = evaluate('0.0.0', bad)
  if (exitCodeFor(badRows) !== 1) failures.push('known-bad state did not exit 1')
  if (badRows.filter((r) => r.status === 'unmet').length !== 6) failures.push('known-bad state did not list all six unmet steps')
  if (exitCodeFor(evaluate('0.0.0', good)) !== 0) failures.push('known-good state did not exit 0')
  if (exitCodeFor(evaluate('0.0.0', unreachable)) !== 2) failures.push('unreachable state did not exit 2')
  if (exitCodeFor(evaluate('0.0.0', { ...unreachable, changelog: false })) !== 1) failures.push('unmet plus unknown did not exit 1')

  if (failures.length) {
    console.error('check-release-complete self-test FAILED:\n  ' + failures.join('\n  '))
    return 1
  }
  console.log('check-release-complete self-test passed: bad state exits 1 with six unmet, good state exits 0, unreachable exits 2.')
  return 0
}

// ── Gathering (real git, GitHub and Sanity) ─────────────────────────────────────────────

function run(cmd, args) {
  return execFileSync(cmd, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

/** Run a check; any thrown error (network, missing CLI) becomes `null` ("could not check"). */
function attempt(fn) {
  try {
    return fn()
  } catch {
    return null
  }
}

function latestTag() {
  return run('git', ['tag', '--list', 'v*.0', '--sort=-v:refname']).split('\n')[0] || null
}

async function gather(version) {
  const tag = `v${version}`
  const s = {}

  const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8')
  s.changelog = changelog.includes(`## [${version}]`)

  const notesPath = join(root, 'docs/release-notes', `RELEASE_NOTES_${tag}.md`)
  s.notes = existsSync(notesPath) && /^##\s+Issues in this release/m.test(readFileSync(notesPath, 'utf8'))

  s.tagOnOrigin = attempt(() => {
    const out = run('git', ['ls-remote', '--tags', '--refs', 'origin', tag])
    if (!out) return false
    run('git', ['fetch', '-q', 'origin', 'main'])
    const commit = run('git', ['rev-list', '-n1', tag])
    try {
      run('git', ['merge-base', '--is-ancestor', commit, 'origin/main'])
      return true
    } catch (e) {
      if (e.status === 1) return false
      throw e
    }
  })

  s.githubRelease = attempt(() => {
    try {
      run('gh', ['release', 'view', tag, '--repo', REPO])
      return true
    } catch (e) {
      const text = `${e.stderr ?? ''}${e.stdout ?? ''}`
      if (/release not found|not found/i.test(text)) return false
      throw e
    }
  })

  s.milestone = attempt(() => {
    const all = JSON.parse(run('gh', ['api', `repos/${REPO}/milestones?state=all&per_page=100`]))
    const m = all.find((x) => x.title === tag)
    return Boolean(m && m.state === 'closed' && m.open_issues + m.closed_issues >= 1)
  })

  s.sanityNote = await (async () => {
    try {
      const q = '*[_type == "releaseNote" && version == $v && !(_id in path("drafts.**"))][0]{_id}'
      const url = `${SANITY}?perspective=published&query=${encodeURIComponent(q)}&$v=${encodeURIComponent(JSON.stringify(version))}`
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!res.ok) return null
      const body = await res.json()
      return Boolean(body.result)
    } catch {
      return null
    }
  })()

  return s
}

// ── Main ─────────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  if (args.includes('--self-test')) return selfTest()

  const vi = args.indexOf('--version')
  let version = vi >= 0 ? args[vi + 1] : null
  if (!version) {
    const tag = attempt(latestTag)
    if (!tag) {
      console.error('Could not find a v*.0 tag. Pass --version X.Y.0.')
      return 2
    }
    version = tag.slice(1)
  }
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error(`Not a version: ${version}`)
    return 2
  }

  const rows = evaluate(version, await gather(version))
  console.log(report(version, rows))
  return exitCodeFor(rows)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(await main())
}
