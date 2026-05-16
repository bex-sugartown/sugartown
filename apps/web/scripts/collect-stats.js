#!/usr/bin/env node
/**
 * collect-stats.js — SUG-67 stats pipeline orchestrator
 *
 * Runs all collector modules and merges output into
 * apps/web/src/generated/stats.json.
 *
 * Local collectors (no network): changelog, ds, storybook, repo
 * Network collectors (Phase 1b): perf, crux, security, github, sanity
 *
 * Failure modes:
 *   - Local collector failure → throws (fails the build)
 *   - Network collector failure → degrades to stale data with { stale: true }
 *
 * Last-good cache (stats.last-good.json):
 *   Each network collector that returns fresh data writes its output to
 *   stats.last-good.json independently. A failed or skipped collector reads
 *   from last-good rather than stats.json, so a CI run with missing env vars
 *   cannot overwrite good data with empty results. last-good is only ever
 *   written on success — it cannot be poisoned by a failed run.
 *
 * Usage:
 *   node apps/web/scripts/collect-stats.js
 *   (also called by the sugartown:stats Vite plugin on buildStart)
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH    = resolve(__dirname, '../src/generated/stats.json')
const LAST_GOOD_PATH = resolve(__dirname, '../src/generated/stats.last-good.json')

import { collectChangelog }    from './stats/changelog.js'
import { collectDesignSystem } from './stats/design-system.js'
import { collectStorybook }    from './stats/storybook.js'
import { collectRepo }         from './stats/repo.js'

// Phase 1b network collectors — imported lazily so their absence doesn't break Phase 1a
async function tryNetworkCollector(name, importFn) {
  try {
    const mod = await importFn()
    return await mod()
  } catch (err) {
    console.warn(`  [stats] ${name} collector failed — marking stale: ${err.message}`)
    return { stale: true, error: err.message }
  }
}

export async function run(outputPath = OUTPUT_PATH, lastGoodPath = LAST_GOOD_PATH) {
  console.log('[stats] Collecting build stats…')
  mkdirSync(dirname(outputPath), { recursive: true })

  // Read existing stats and last-good cache for network collector fallbacks.
  // Priority: last-good > existing stats.json. last-good is only ever written
  // on success so it cannot be poisoned by a failed or env-var-missing run.
  let existing = {}
  let lastGood = {}
  try { existing = JSON.parse(readFileSync(outputPath, 'utf-8')) } catch { /* empty */ }
  try { lastGood = JSON.parse(readFileSync(lastGoodPath, 'utf-8')) } catch { /* empty */ }

  // Local collectors — failure is fatal
  const release  = collectChangelog()
  const ds       = collectDesignSystem()
  const storybook = collectStorybook()
  const repo     = collectRepo()

  console.log(`  release   v${release.current?.version} (${release.count.total} releases)`)
  console.log(`  ds        ${ds.tokens.total} tokens, ${ds.componentFiles} component CSS files`)
  console.log(`  storybook ${storybook.stories} stories across ${storybook.components} files`)
  console.log(`  repo      ${repo.commits} commits, ${repo.epicsShipped} epics shipped`)

  // Network collectors (Phase 1b) — graceful degradation
  // Each is a dynamic import so missing modules don't fail Phase 1a builds
  // Env-var guards: if the required key is absent AND last-good data exists,
  // skip the collector entirely — no failed network call, no stale write.
  const envGuards = {
    linearRoadmap: 'LINEAR_API_KEY',
    github:        'GITHUB_TOKEN',
  }

  const networkCollectors = {
    perf:          () => tryNetworkCollector('perf',          () => import('./stats/perf.js').then(m => m.collectPerf)),
    crux:          () => tryNetworkCollector('crux',          () => import('./stats/crux.js').then(m => m.collectCrux)),
    security:      () => tryNetworkCollector('security',      () => import('./stats/security.js').then(m => m.collectSecurity)),
    github:        () => tryNetworkCollector('github',        () => import('./stats/github.js').then(m => m.collectGithub)),
    sanity:        () => tryNetworkCollector('sanity',        () => import('./stats/sanity.js').then(m => m.collectSanity)),
    siteGraph:     () => tryNetworkCollector('siteGraph',     () => import('./stats/graph.js').then(m => m.collectSiteGraph)),
    linearRoadmap: () => tryNetworkCollector('linearRoadmap', () => import('./stats/linear.js').then(m => m.collectLinear)),
  }

  const networkResults = {}
  const lastGoodUpdates = {}

  for (const [name, collect] of Object.entries(networkCollectors)) {
    const requiredKey = envGuards[name]
    const fallback = lastGood[name] ?? existing[name]

    // Skip entirely if required env var is absent and we have last-good data
    if (requiredKey && !process.env[requiredKey] && fallback) {
      console.log(`  [stats] ${name}: ${requiredKey} not set — using last-good data`)
      networkResults[name] = fallback
      continue
    }

    const fresh = await collect()
    if (fresh?.stale) {
      // Collector failed — use last-good if available, otherwise existing stats
      if (fallback) {
        console.log(`  [stats] ${name}: stale — falling back to last-good`)
        networkResults[name] = fallback
      } else {
        networkResults[name] = fresh
      }
    } else {
      // Fresh success — use it and record it for last-good update
      networkResults[name] = fresh
      lastGoodUpdates[name] = fresh
    }
  }

  // Write last-good updates — only successful collectors, never overwrite with stale
  if (Object.keys(lastGoodUpdates).length > 0) {
    const nextLastGood = { ...lastGood, ...lastGoodUpdates, updatedAt: new Date().toISOString() }
    writeFileSync(lastGoodPath, JSON.stringify(nextLastGood, null, 2))
    console.log(`[stats] last-good updated: ${Object.keys(lastGoodUpdates).join(', ')}`)
  }

  const stats = {
    generatedAt: new Date().toISOString(),
    release,
    ds,
    storybook,
    repo,
    ...networkResults,
  }

  writeFileSync(outputPath, JSON.stringify(stats, null, 2))
  console.log(`[stats] Written to ${outputPath}`)
  return stats
}

// Run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(err => { console.error(err); process.exit(1) })
}
