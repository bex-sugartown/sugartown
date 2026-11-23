#!/usr/bin/env node
/**
 * build-route-manifest.mjs — #256 Phase 2
 *
 * Writes dist/route-manifest.json, the list of real routes that netlify/edge-functions/route-status.js
 * checks before letting the SPA fallback answer 200. Routes come from src/App.jsx, so a new <Route>
 * cannot be forgotten; the build fails if App.jsx has a `/:slug` route this script cannot classify.
 *
 *   - static routes:   every <Route path> with no `:param` (the /platform children are nested and
 *                      relative in App.jsx, so they are joined to /platform)
 *   - /<prefix>/:slug: published slugs per Sanity type (PREFIX_TYPES), or "any" for routes that only
 *                      redirect (REDIRECT_PREFIXES)
 *   - /:slug:          published `page` slugs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@sanity/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB = resolve(__dirname, '..')
const DIST = resolve(WEB, 'dist')

// App.jsx prefix -> Sanity _type. Add a row when App.jsx gains a /<prefix>/:slug route.
export const PREFIX_TYPES = {
  '/articles': 'article',
  '/series': 'series',
  '/releases': 'releaseNote',
  '/case-studies': 'caseStudy',
  '/nodes': 'node',
  '/glossary': 'glossaryTerm',
  '/tags': 'tag',
  '/categories': 'category',
  '/projects': 'project',
  '/people': 'person',
  '/tools': 'tool',
}
// Routes that only <Navigate>, so any slug is a real route.
export const REDIRECT_PREFIXES = ['/blog', '/post', '/knowledge-graph']

function loadEnv() {
  try {
    for (const line of readFileSync(resolve(WEB, '.env'), 'utf8').split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i === -1) continue
      const key = t.slice(0, i).trim()
      const val = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')
      if (key && !(key in process.env)) process.env[key] = val
    }
  } catch { /* rely on process.env */ }
}

/** Static paths, `/<prefix>/:slug` prefixes and whether `/:slug` exists, read from App.jsx source. */
export function routesFromAppSource(source) {
  const paths = [...source.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1])
  const absolute = paths.filter((p) => p.startsWith('/'))
  const relative = paths.filter((p) => !p.startsWith('/') && p !== '*')
  const staticPaths = new Set(absolute.filter((p) => !p.includes(':') && p !== '*'))
  // The only nested group is /platform (index + relative children).
  if (relative.length && !staticPaths.has('/platform')) throw new Error('relative <Route path> found outside /platform')
  for (const r of relative) staticPaths.add(`/platform/${r}`)
  const prefixes = absolute
    .filter((p) => /^\/[^/:]+\/:slug$/.test(p))
    .map((p) => p.replace('/:slug', ''))
  return { staticPaths: [...staticPaths].sort(), prefixes: [...new Set(prefixes)], hasRootSlug: absolute.includes('/:slug') }
}

async function run() {
  console.log('\n🧭  Route manifest (#256)')
  loadEnv()
  const projectId = process.env.VITE_SANITY_PROJECT_ID
  const dataset = process.env.VITE_SANITY_DATASET
  if (!projectId || !dataset) throw new Error('Missing VITE_SANITY_PROJECT_ID or VITE_SANITY_DATASET')
  if (!existsSync(DIST)) throw new Error('dist/ not found, run vite build first')

  const { staticPaths, prefixes, hasRootSlug } = routesFromAppSource(readFileSync(resolve(WEB, 'src/App.jsx'), 'utf8'))
  const unclassified = prefixes.filter((p) => !(p in PREFIX_TYPES) && !REDIRECT_PREFIXES.includes(p))
  if (unclassified.length) {
    throw new Error(`App.jsx has /<prefix>/:slug routes this script cannot classify: ${unclassified.join(', ')}. Add them to PREFIX_TYPES or REDIRECT_PREFIXES in build-route-manifest.mjs.`)
  }

  const client = createClient({
    projectId, dataset, useCdn: false, apiVersion: process.env.VITE_SANITY_API_VERSION ?? '2024-01-01',
    perspective: 'published', ...(process.env.SANITY_AUTH_TOKEN ? { token: process.env.SANITY_AUTH_TOKEN } : {}),
  })
  const slugsOf = (type) => client.fetch(`*[_type == $type && defined(slug.current) && !(_id in path("drafts.**"))].slug.current`, { type })

  const used = prefixes.filter((p) => p in PREFIX_TYPES)
  const slugLists = await Promise.all(used.map((p) => slugsOf(PREFIX_TYPES[p])))
  const rootSlugs = hasRootSlug ? await slugsOf('page') : []

  const manifest = {
    generatedAt: new Date().toISOString(),
    static: staticPaths.map((p) => decodeURIComponent(p)),
    prefixes: Object.fromEntries(used.map((p, i) => [p, slugLists[i].sort()])),
    anyPrefixes: prefixes.filter((p) => REDIRECT_PREFIXES.includes(p)),
    rootSlugs: rootSlugs.sort(),
    types: Object.fromEntries(used.map((p) => [p, PREFIX_TYPES[p]])),
    rootType: 'page',
    sanity: { projectId, dataset },
  }
  writeFileSync(resolve(DIST, 'route-manifest.json'), JSON.stringify(manifest), 'utf8')
  const counts = used.map((p, i) => `${p} ${slugLists[i].length}`).join(', ')
  console.log(`    ${staticPaths.length} static routes, ${rootSlugs.length} root pages; ${counts}`)
}

import { pathToFileURL } from 'url'
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((err) => {
    console.error('[route-manifest] failed:', err.message)
    process.exit(1)
  })
}
