#!/usr/bin/env node
/**
 * migrate:redirects — Step 4: Generate Netlify _redirects artifact
 *
 * Reads:  artifacts/wp_export.ndjson  (for per-document slug mapping)
 *         Sanity redirect documents   (from Studio — for operator-entered redirects)
 * Writes: apps/web/public/_redirects
 *
 * Redirect strategy (in order, top = highest priority in Netlify):
 *
 *   1. Pattern-level redirects (WP URL pattern → new canonical pattern)
 *      These handle the bulk of WP → Sanity URL changes using splat rules.
 *
 *   2. Per-document redirects from Sanity `redirect` documents
 *      (operator-managed, from Studio → Redirects section)
 *
 *   3. Slug collision redirects
 *      If a WP slug was renamed during migration (collision resolution),
 *      a per-URL redirect is generated.
 *
 *   4. SPA fallback (always last):
 *      /* /index.html 200
 *
 * WP URL pattern mapping (from Epic 6 spec):
 *   /blog/:slug      → /articles/:slug     301
 *   /post/:slug      → /articles/:slug     301
 *   /posts/:slug     → /articles/:slug     301
 *   /gem/:slug       → /nodes/:slug        301
 *   /nodes           → /knowledge-graph    301
 *   /category/:slug  → /categories/:slug   301
 *   /tag/:slug       → /tags/:slug         301
 *   /:slug (pages)   → /:slug              (no redirect — same path)
 *   /case-study/:slug → /case-studies/:slug  301  (if WP used /case-study/)
 *
 * Usage:
 *   node scripts/migrate/redirects.js
 *   pnpm migrate:redirects   (from repo root)
 *
 * Note: Also fetches active Sanity redirect documents and merges them.
 * The existing apps/web/scripts/build-redirects.js (Epic 5) handles
 * Sanity-sourced redirects in the regular build pipeline. This script
 * generates the FULL migration _redirects file including pattern rules.
 */

import { resolve } from 'path'
import { writeFileSync, mkdirSync } from 'fs'
import {
  banner, section, ok, warn, info, fail,
  readNdjson, readJson, buildSanityClient,
  ARTIFACTS_DIR, REPO_ROOT, loadEnv,
} from './lib.js'
import { createClient } from '@sanity/client'

loadEnv()

const EXPORT_FILE   = resolve(ARTIFACTS_DIR, 'wp_export.ndjson')
const OUTPUT_FILE   = resolve(REPO_ROOT, 'apps/web/public/_redirects')

// ─── Static pattern rules (WP URL patterns → new canonical) ──────────────────

const PATTERN_RULES = [
  // WP blog/post prefixes → /articles
  { from: '/blog/:slug',     to: '/articles/:slug',    code: 301 },
  { from: '/post/:slug',     to: '/articles/:slug',    code: 301 },
  { from: '/posts/:slug',    to: '/articles/:slug',    code: 301 },

  // WP Gems CPT → /nodes
  { from: '/gem/:slug',      to: '/nodes/:slug',       code: 301 },
  // WP /nodes was a CPT archive, now redirected to /knowledge-graph
  { from: '/nodes',          to: '/knowledge-graph',   code: 301 },

  // WP Case Study CPT base (if WP used /case-study/ singular)
  { from: '/case-study/:slug', to: '/case-studies/:slug', code: 301 },

  // WP taxonomy archives
  { from: '/category/:slug', to: '/categories/:slug',  code: 301 },
  { from: '/tag/:slug',      to: '/tags/:slug',        code: 301 },

  // WP ?p=ID URLs — these can't be handled statically without a lookup;
  // document as a known gap (see Known Gaps below).
  // { from: '/?p=:id', to: '/articles/:id', code: 301 }, // ← not supported by Netlify _redirects
]

// ─── Fetch Sanity redirect documents ─────────────────────────────────────────

const SANITY_REDIRECTS_QUERY = `
  *[_type == "redirect" && isActive == true] {
    fromPath, toPath, statusCode
  }
`

async function fetchSanityRedirects() {
  try {
    const client = buildSanityClient()
    return await client.fetch(SANITY_REDIRECTS_QUERY)
  } catch (err) {
    warn(`Could not fetch Sanity redirect documents: ${err.message}`)
    warn('Continuing without Studio-managed redirects')
    return []
  }
}

// ─── Per-document slug change redirects ──────────────────────────────────────

/**
 * If any WP slug was renamed during migration (collision resolution),
 * generate a per-URL redirect from the original WP permalink to the new canonical URL.
 *
 * Detection: if legacySource.legacySlug !== slug.current on the Sanity document,
 * a redirect is needed. Since we don't query Sanity here, we use the export file:
 * if the export record's slug differs from the resolved slug in sanity_import.ndjson.
 *
 * For now this is left as a generator stub — populate after running migrate:import
 * and reviewing the slug_collision_report.csv.
 */
function generateSlugChangeRedirects(exportRecords) {
  // Stub: in a real run, cross-reference export slugs against import slugs
  // for any collision-resolved renames. Return empty for now.
  // TODO: cross-reference artifacts/slug_collision_report.csv after first run.
  return []
}

// ─── Format rules ─────────────────────────────────────────────────────────────

function formatRule({ from, to, code }) {
  // Convert :slug → :slug, :splat → :splat (Netlify syntax)
  // Already in Netlify format — just pad for readability
  const fromPad = from.padEnd(32)
  return to ? `${fromPad}  ${to}  ${code}` : `${fromPad}  404`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  banner('Sugartown — Redirect Artifact (Step 4 of 5)')

  const exportRecords = readNdjson(EXPORT_FILE)
  if (!exportRecords.length) {
    warn(`No export records found at ${EXPORT_FILE}`)
    warn('Pattern redirects will still be generated, but per-document rules will be empty')
  }

  info(`Loaded ${exportRecords.length} export records`)

  // 1. Pattern-level WP URL redirects
  section('Pattern Rules (WP URL patterns → canonical)')
  const patternLines = PATTERN_RULES.map(formatRule)
  patternLines.forEach((l) => info(l))

  // 2. Studio-managed Sanity redirect documents
  section('Sanity Studio Redirects')
  const sanityRedirects = await fetchSanityRedirects()
  info(`  ${sanityRedirects.length} active redirect document(s) from Studio`)
  const sanityLines = sanityRedirects
    .sort((a, b) => (a.fromPath ?? '').localeCompare(b.fromPath ?? ''))
    .map(({ fromPath, toPath, statusCode }) => formatRule({ from: fromPath, to: toPath, code: statusCode }))

  // 3. Per-document slug change redirects
  section('Per-document Slug Change Redirects')
  const slugChangeRedirects = generateSlugChangeRedirects(exportRecords)
  if (slugChangeRedirects.length) {
    slugChangeRedirects.forEach((r) => info(formatRule(r)))
  } else {
    info('  None detected (review slug_collision_report.csv after first import run)')
  }

  // ─── Assemble final _redirects file ──────────────────────────────────────
  const lines = [
    '# ============================================================',
    '# Sugartown _redirects — WordPress → Sanity migration (Epic 6)',
    '# Generated by: pnpm migrate:redirects',
    `# Generated at: ${new Date().toISOString()}`,
    '#',
    '# IMPORTANT: Rules are evaluated top-to-bottom by Netlify.',
    '# More specific rules must appear before broader ones.',
    '# ============================================================',
    '',
    '# ── Pattern rules: WP URL patterns → new canonical routes ──',
    ...patternLines,
  ]

  if (sanityLines.length) {
    lines.push('')
    lines.push('# ── Studio-managed redirects (from Sanity redirect documents) ──')
    lines.push(...sanityLines)
  }

  if (slugChangeRedirects.length) {
    lines.push('')
    lines.push('# ── Per-document slug changes (collision resolutions) ──')
    lines.push(...slugChangeRedirects.map(formatRule))
  }

  lines.push('')
  lines.push('# ── SPA fallback — MUST be last ──────────────────────────────')
  lines.push('/*  /index.html  200')
  lines.push('')

  // Write
  mkdirSync(resolve(REPO_ROOT, 'apps/web/public'), { recursive: true })
  writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8')

  section('Known Gaps')
  warn('WordPress /?p=<id> URLs cannot be handled by static Netlify rules')
  warn('  → These require a server-side lookup or an explicit per-document entry')
  warn('  → Generate them after import by querying Sanity for legacySource.wpId')
  warn('  → Example: for each migrated article, add: /?p=<wpId>  /articles/<slug>  301')
  warn('  → Add to Studio Redirects or append manually to _redirects')

  section('Summary')
  ok(`${patternLines.length} pattern rule(s)`)
  ok(`${sanityLines.length} Studio-managed redirect(s)`)
  ok(`${slugChangeRedirects.length} slug change redirect(s)`)
  ok(`SPA fallback appended`)
  ok(`Written: ${OUTPUT_FILE}`)
  info('\nNext step: pnpm migrate:parity')
  console.log('══════════════════════════════════════════════\n')
}

main().catch((err) => {
  fail(`Unexpected error: ${err.message}`)
  console.error(err)
  process.exit(1)
})
