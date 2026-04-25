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
 * Usage:
 *   node apps/web/scripts/collect-stats.js
 *   (also called by the sugartown:stats Vite plugin on buildStart)
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '../src/generated/stats.json')

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

export async function run(outputPath = OUTPUT_PATH) {
  console.log('[stats] Collecting build stats…')
  mkdirSync(dirname(outputPath), { recursive: true })

  // Read existing stats for stale-data fallback on network collectors
  let existing = {}
  try {
    existing = JSON.parse(readFileSync(outputPath, 'utf-8'))
  } catch {}

  // Local collectors — failure is fatal
  const release = collectChangelog()
  const ds      = collectDesignSystem()
  const storybook = collectStorybook()
  const repo    = collectRepo()

  console.log(`  release   v${release.current?.version} (${release.count.total} releases)`)
  console.log(`  ds        ${ds.tokens.total} tokens, ${ds.componentFiles} component CSS files`)
  console.log(`  storybook ${storybook.stories} stories across ${storybook.components} files`)
  console.log(`  repo      ${repo.commits} commits, ${repo.epicsShipped} epics shipped`)

  // Network collectors (Phase 1b) — graceful degradation
  // Each is a dynamic import so missing modules don't fail Phase 1a builds
  const networkCollectors = {
    perf:     () => tryNetworkCollector('perf',     () => import('./stats/perf.js').then(m => m.collectPerf)),
    crux:     () => tryNetworkCollector('crux',     () => import('./stats/crux.js').then(m => m.collectCrux)),
    security: () => tryNetworkCollector('security', () => import('./stats/security.js').then(m => m.collectSecurity)),
    github:   () => tryNetworkCollector('github',   () => import('./stats/github.js').then(m => m.collectGithub)),
    sanity:   () => tryNetworkCollector('sanity',   () => import('./stats/sanity.js').then(m => m.collectSanity)),
    graph:    () => tryNetworkCollector('graph',    () => import('./stats/graph.js').then(m => m.collectGraph)),
  }

  const networkResults = {}
  for (const [name, collect] of Object.entries(networkCollectors)) {
    const fresh = await collect()
    // If fresh result is stale (module missing or network failed), use existing
    networkResults[name] = (fresh?.stale && existing[name] && !existing[name].stale)
      ? { ...existing[name], stale: true }
      : fresh
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
