/**
 * stats.js — SUG-67 trust reporting data layer
 *
 * Imports the build-time generated stats.json and exports typed helpers
 * plus the interpolateStatsVars() string transformer used by the
 * PortableText pre-processor.
 *
 * stats.json is written by scripts/collect-stats.js at buildStart (Vite plugin).
 *
 * Token syntax: {{namespace.path}} — dot-path into the stats object.
 * Unknown tokens: render as literal in dev, strip in prod.
 */

// Vite replaces this import at build time; stats.json is always present by
// the time module resolution runs (statsPlugin runs before module bundling).
import statsData from '../generated/stats.json'

export const stats = statsData

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getRelease() {
  return stats.release?.current ?? null
}

export function getLatestReleases(n = 5) {
  return stats.release?.latestN?.slice(0, n) ?? []
}

export function getDsTokenCounts() {
  return stats.ds?.tokens ?? { total: 0, primitives: 0, component: 0, byCategory: {} }
}

export function getStorybookCounts() {
  return stats.storybook ?? { stories: 0, components: 0 }
}

export function getRepoStats() {
  return stats.repo ?? { commits: 0, epicsShipped: 0 }
}

// ── Interpolator ─────────────────────────────────────────────────────────────

/**
 * Resolve a dot-path like "release.current.version" into the stats object.
 * Supports array index notation: "perf.runs.0.lcp" (numeric segments).
 */
function resolvePath(obj, path) {
  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined
    const idx = Number(key)
    return Number.isFinite(idx) && Array.isArray(acc) ? acc[idx] : acc[key]
  }, obj)
}

/**
 * Replace {{namespace.path}} tokens in a string with live values from stats.
 *
 * @param {string} text       Raw string potentially containing {{tokens}}
 * @param {object} [data]     Stats data to resolve against (defaults to stats)
 * @param {object} [options]
 * @param {boolean} [options.dev]  If true, unknown tokens render as literal.
 *                                 If false (prod), unknown tokens are stripped.
 */
const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV

export function interpolateStatsVars(text, data = stats, { dev = IS_DEV } = {}) {
  if (!text || !text.includes('{{')) return text
  return text.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    const value = resolvePath(data, path)
    if (value === undefined || value === null) {
      if (dev) {
        console.warn(`[stats] Unknown token: ${match} — check docs/conventions/stats-pipeline.md`)
      }
      return dev ? match : ''
    }
    return String(value)
  })
}

/**
 * React hook — returns the full stats object.
 * Synchronous (stats are baked in at build time, no async required).
 */
export function useStats() {
  return stats
}
