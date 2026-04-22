/**
 * security.js — security namespace collector (SUG-67)
 *
 * Runs `pnpm audit --json` from the monorepo root and extracts
 * vulnerability counts by severity. No auth required.
 *
 * Output shape:
 * {
 *   fetchedAt: "2026-04-22T...",
 *   vulnerabilities: { total: 0, critical: 0, high: 0, moderate: 0, low: 0, info: 0 }
 * }
 */

import { execSync } from 'child_process'
import { resolve } from 'path'

const MONOREPO_ROOT = resolve(process.cwd(), '../../')

export async function collectSecurity() {
  let raw = ''
  try {
    raw = execSync('pnpm audit --json', {
      cwd: MONOREPO_ROOT,
      // pnpm audit exits non-zero if vulnerabilities found — capture anyway
      stdio: ['pipe', 'pipe', 'pipe'],
    }).toString()
  } catch (err) {
    // err.stdout still has the JSON when exit code is non-zero
    raw = err.stdout?.toString() ?? ''
  }

  const counts = { total: 0, critical: 0, high: 0, moderate: 0, low: 0, info: 0 }

  try {
    // pnpm audit --json emits one JSON object per line (NDJSON)
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const obj = JSON.parse(trimmed)
      // pnpm v8 format: { type: 'auditAdvisory', data: { severity, ... } }
      if (obj.type === 'auditAdvisory' && obj.data?.advisory?.severity) {
        const sev = obj.data.advisory.severity.toLowerCase()
        if (sev in counts) {
          counts[sev]++
          counts.total++
        }
      }
      // pnpm v9+ format: { metadata: { vulnerabilities: { critical, high, ... } } }
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
  } catch {}

  return {
    fetchedAt: new Date().toISOString(),
    vulnerabilities: counts,
  }
}
