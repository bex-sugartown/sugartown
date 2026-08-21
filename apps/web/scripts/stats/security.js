/**
 * security.js — security namespace collector (SUG-67)
 *
 * Runs `pnpm audit --json` from the monorepo root and extracts
 * vulnerability counts by severity. No auth required.
 *
 * Bounded to AUDIT_TIMEOUT_MS (ST-102): on this monorepo, `pnpm audit --json`
 * has been observed running 35s+ and climbing before being killed, which
 * blocks `apps/web`'s entire dev-server startup — this collector runs
 * synchronously inside `collect-stats.js`, itself spawned synchronously from
 * Vite's `buildStart` hook (`apps/web/vite.config.js`).
 *
 * Not a plain `execSync(..., { timeout })` — verified live (2026-08-21) that
 * doesn't work here: the installed `pnpm` binary re-execs itself as a nested
 * `node .../pnpm/<version>/bin/pnpm` process, and execSync's timeout only
 * signals its immediate child (the shell/pnpm-shim). Killing that leaves the
 * re-exec'd worker running, still holding the stdout pipe open, so the
 * "timed out" call never actually returns — confirmed by measurement: a 3s
 * timeout, checked again 8s later, both the outer call and the audit worker
 * were still alive. This uses `spawn` with `detached: true` so the child
 * becomes its own process-group leader, and kills the whole group
 * (`process.kill(-pid, ...)`) on timeout, reaching the re-exec'd worker too.
 *
 * Every other network collector already degrades to `{ stale: true }` on
 * failure; a timeout is treated identically, not as a special case.
 *
 * Two different bounds, not one (measured 2026-08-21): `pnpm audit --json`
 * takes ~97s to complete naturally on this monorepo (2MB of output). A
 * single short timeout would make `stats.yml`'s daily CI collection
 * permanently stale — it would never once complete within any bound short
 * enough to keep local dev-server boot fast. Locally, a human is waiting on
 * `vite`'s "ready" line, so AUDIT_TIMEOUT_MS_LOCAL stays short and this
 * collector is expected to degrade to last-good on every local run — that's
 * the fix working as intended, not a regression. In CI (`process.env.CI`,
 * GitHub Actions' own standard convention, set automatically — no workflow
 * change needed), nobody is waiting interactively, so
 * AUDIT_TIMEOUT_MS_CI gives real headroom over the measured 97s and CI keeps
 * collecting fresh data exactly as before this change. If CI ever hits its
 * own bound, it falls back to `stats.last-good.json` and refreshes the next
 * scheduled run — no worse than any other transient collector failure.
 *
 * Output shape:
 * {
 *   fetchedAt: "2026-04-22T...",
 *   vulnerabilities: { total: 0, critical: 0, high: 0, moderate: 0, low: 0, info: 0 }
 * }
 */

import { spawn } from 'child_process'
import { resolve } from 'path'

const MONOREPO_ROOT = resolve(process.cwd(), '../../')
const AUDIT_TIMEOUT_MS_LOCAL = 5_000
const AUDIT_TIMEOUT_MS_CI = 180_000
const AUDIT_TIMEOUT_MS = process.env.CI ? AUDIT_TIMEOUT_MS_CI : AUDIT_TIMEOUT_MS_LOCAL

/** Run `pnpm audit --json`, killing the whole process group if it outlives AUDIT_TIMEOUT_MS. */
function runAuditBounded() {
  return new Promise((resolvePromise) => {
    const child = spawn('pnpm', ['audit', '--json'], {
      cwd: MONOREPO_ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
      detached: true,
    })

    let stdout = ''
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      // SIGKILL, not SIGTERM — verified live (2026-08-21) that SIGTERM alone
      // leaves the process group running: pnpm's re-exec'd node worker
      // outlived a SIGTERM-only kill by 20+ seconds in testing. This is an
      // abandon-and-clean-up path, not a graceful shutdown, so an
      // unignorable signal is correct, not just expedient.
      try {
        process.kill(-child.pid, 'SIGKILL')
      } catch {
        /* process group already gone */
      }
      resolvePromise({ timedOut: true, stdout })
    }, AUDIT_TIMEOUT_MS)

    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.on('close', () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolvePromise({ timedOut: false, stdout })
    })
    child.on('error', () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolvePromise({ timedOut: false, stdout })
    })
  })
}

export async function collectSecurity() {
  const { timedOut, stdout: raw } = await runAuditBounded()
  if (timedOut) {
    return {
      stale: true,
      error: `pnpm audit --json did not complete within ${AUDIT_TIMEOUT_MS}ms`,
    }
  }

  const counts = { total: 0, critical: 0, high: 0, moderate: 0, low: 0, info: 0 }

  // pnpm v9+ (confirmed live 2026-08-21 against pnpm 9.1.0): the ENTIRE output
  // is one pretty-printed multi-line JSON object, not NDJSON — every prior
  // per-line JSON.parse below threw on the first non-trivial line and the
  // surrounding try/catch swallowed it, so this collector has been silently
  // reporting zero vulnerabilities regardless of the real count. Measured
  // real count on this repo: 211 (1 critical, 89 high, 103 moderate, 18 low).
  // Try the whole-output parse first; it's the actually-installed version's
  // real shape, not a documented-but-unverified one.
  try {
    const whole = JSON.parse(raw)
    if (whole.metadata?.vulnerabilities) {
      const v = whole.metadata.vulnerabilities
      Object.assign(counts, {
        critical: v.critical ?? 0,
        high:     v.high ?? 0,
        moderate: v.moderate ?? 0,
        low:      v.low ?? 0,
        info:     v.info ?? 0,
      })
      counts.total = counts.critical + counts.high + counts.moderate + counts.low + counts.info
      return { fetchedAt: new Date().toISOString(), vulnerabilities: counts }
    }
  } catch { /* not a single JSON object — fall through to the NDJSON path below */ }

  try {
    // pnpm v8 NDJSON format: one JSON object per line — kept as a fallback in
    // case an older pnpm ever produces this shape again, not verified live.
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const obj = JSON.parse(trimmed)
      if (obj.type === 'auditAdvisory' && obj.data?.advisory?.severity) {
        const sev = obj.data.advisory.severity.toLowerCase()
        if (sev in counts) {
          counts[sev]++
          counts.total++
        }
      }
      if (obj.metadata?.vulnerabilities) {
        const v = obj.metadata.vulnerabilities
        Object.assign(counts, {
          critical: v.critical ?? 0,
          high:     v.high ?? 0,
          moderate: v.moderate ?? 0,
          low:      v.low ?? 0,
          info:     v.info ?? 0,
        })
        counts.total = counts.critical + counts.high + counts.moderate + counts.low + counts.info
        break
      }
    }
  } catch { /* empty */ }

  return {
    fetchedAt: new Date().toISOString(),
    vulnerabilities: counts,
  }
}
