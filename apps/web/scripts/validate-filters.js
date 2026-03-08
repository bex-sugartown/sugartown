#!/usr/bin/env node
/**
 * validate-filters.js — Dev-time Filter Model Validator (Stage 4, v2)
 *
 * For each known archive page slug, fetches the archivePage doc + content items
 * from Sanity, runs buildFilterModel(), and prints the resulting FilterModel JSON.
 *
 * EXIT CRITERIA (v2 — post v0.11.0 taxonomy):
 *   ✅  Each archive must produce a stable FilterModel (even if some facets are empty).
 *   ✅  GROQ projections must not contain any WP-era keys (hard fail if detected).
 *   ⚠️   tools facet enabled but returns 0 options → WARN (content may not be tagged yet).
 *   ✅  All filter models produced → exit 0.
 *   ❌  Any archive fails to fetch or produces an error → exit 1.
 *   ❌  WP-era keys detected in projections or model output → exit 1.
 *
 * Usage:
 *   pnpm validate:filters
 *
 * Environment variables required (reads from .env or process.env):
 *   VITE_SANITY_PROJECT_ID
 *   VITE_SANITY_DATASET
 *   VITE_SANITY_API_VERSION
 *   VITE_SANITY_TOKEN    (read-only — required for wp.* dot-namespace docs)
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Load env from .env file ──────────────────────────────────────────────────

function loadEnv() {
  const envPath = resolve(__dirname, '../.env')
  try {
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env not found — rely on process.env (CI etc.)
  }
}

loadEnv()

// ─── Sanity client ────────────────────────────────────────────────────────────

const projectId = process.env.VITE_SANITY_PROJECT_ID
const dataset   = process.env.VITE_SANITY_DATASET ?? 'production'
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'
// Token required to read wp.* dot-namespace docs (system namespace; invisible without auth)
const token = process.env.VITE_SANITY_TOKEN

if (!projectId) {
  console.error('[validate-filters] ERROR: VITE_SANITY_PROJECT_ID is not set.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// ─── WP-era key guard ─────────────────────────────────────────────────────────
// Hard fail if any of these keys appear in GROQ projections or model output.
// They were purged in v0.11.0 and must not reappear.

const WP_KEYS = ['wp_category', 'wp_tag', 'gem_status', 'gem_related_project']

/**
 * detectWpKeys(obj, path) → string[]
 * Recursively walks an object and returns paths where WP-era keys are found.
 */
function detectWpKeys(obj, path = '') {
  if (!obj || typeof obj !== 'object') return []
  const found = []
  for (const key of Object.keys(obj)) {
    const fullPath = path ? `${path}.${key}` : key
    if (WP_KEYS.includes(key)) {
      found.push(fullPath)
    }
    found.push(...detectWpKeys(obj[key], fullPath))
  }
  return found
}

/**
 * detectWpKeysInString(str) → string[]
 * Checks a GROQ query string for WP-era key substrings.
 */
function detectWpKeysInString(str) {
  return WP_KEYS.filter((k) => str.includes(k))
}

// ─── GROQ queries (inline — no bundler dependency) ────────────────────────────
// Must be kept in sync with src/lib/queries.js.
// CATEGORY_FRAGMENT includes parent-> for hierarchy support (v0.11.0+).

const PERSON_FRAGMENT   = `_id, name, "slug": slug.current`
const CATEGORY_FRAGMENT = `_id, name, "slug": slug.current, colorHex, "parent": parent->{ _id, name, "slug": slug.current }`
const TAG_FRAGMENT      = `_id, name, "slug": slug.current`
const TOOL_FRAGMENT     = `_id, name, "slug": slug.current`
const PROJECT_FRAGMENT  = `_id, projectId, name, "slug": slug.current, status, colorHex`

const archivePageWithFilterConfigQuery = `
  *[_type == "archivePage" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    contentTypes,
    filterConfig {
      facets[] {
        facet,
        label,
        enabled,
        order,
        selection,
        defaultSelectedSlugs
      }
    }
  }
`

// facetsRawQuery — includes client, status and tools (v0.11.0+; tools promoted to reference in v0.12.0+)
const facetsRawQuery = `
  *[_type in $contentTypes && defined(slug.current)] {
    _id,
    _type,
    "slug": slug.current,
    client,
    status,
    "tools": tools[]->{${TOOL_FRAGMENT}},
    authors[]->{${PERSON_FRAGMENT}},
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}}
  }
`

// Check query strings for WP keys at startup
const QUERY_STRINGS = [archivePageWithFilterConfigQuery, facetsRawQuery]
const wpKeysInQueries = QUERY_STRINGS.flatMap(detectWpKeysInString)

// ─── FilterModel builder (inline — avoids ESM import from src/) ──────────────
// This is a copy of the logic in src/lib/filterModel.js so the script can run
// as a standalone Node script without a bundler. Keep in sync with filterModel.js.

const FACET_TYPE = {
  author:   'reference',
  project:  'reference',
  category: 'reference',
  tag:      'reference',
  tools:    'reference',
  status:   'enum',
  client:   'enum',
}

const DEFAULT_FACET_LABELS = {
  author:   'Author',
  project:  'Project',
  category: 'Category',
  tag:      'Tag',
  tools:    'Tool / Platform',
  status:   'Status',
  client:   'Client',
}

function extractFacetItems(item, facetId) {
  switch (facetId) {
    case 'author':   return item.authors ?? []
    case 'category': return item.categories ?? []
    case 'tag':      return item.tags ?? []
    case 'project': {
      const canonical = item.projects ?? []
      const legacy = item.relatedProjects ?? []
      const seen = new Set(canonical.map((p) => p._id))
      const merged = [...canonical]
      for (const p of legacy) {
        if (!seen.has(p._id)) { seen.add(p._id); merged.push(p) }
      }
      return merged
    }
    case 'tools':
      return item.tools ?? []
    case 'status': {
      if (!item.status) return []
      return [{ _id: item.status, name: item.status }]
    }
    case 'client': {
      if (!item.client) return []
      return [{ _id: item.client, name: item.client }]
    }
    default: return []
  }
}

function normalizeTaxonomyItem(raw, facetId) {
  if (!raw || !raw._id) return null
  const type = FACET_TYPE[facetId] ?? 'reference'

  if (type === 'enum') {
    return { id: raw._id, label: raw.name ?? raw._id }
  }

  if (!raw.slug) return null
  const base = {
    id:    raw._id,
    label: raw.name ?? raw.title ?? '(unnamed)',
    slug:  raw.slug,
  }
  if ((facetId === 'category' || facetId === 'project') && raw.colorHex) {
    base.colorHex = raw.colorHex
  }
  if (facetId === 'category' && raw.parent?._id) {
    base.parent = { id: raw.parent._id, label: raw.parent.name ?? '(unnamed)', slug: raw.parent.slug ?? '' }
  }
  return base
}

function buildFilterModel(archivePage, contentItems) {
  if (!archivePage) return { archive: null, facets: [], _error: 'archivePage is null' }

  const items = contentItems ?? []
  const facetConfigs = archivePage.filterConfig?.facets ?? []

  const configs = facetConfigs.length > 0
    ? facetConfigs
    : [
        { facet: 'author',   label: null, enabled: true, order: 1, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'project',  label: null, enabled: true, order: 2, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'category', label: null, enabled: true, order: 3, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'tag',      label: null, enabled: true, order: 4, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'client',   label: null, enabled: true, order: 5, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'tools',    label: null, enabled: true, order: 6, selection: 'multi', defaultSelectedSlugs: [] },
        { facet: 'status',   label: null, enabled: true, order: 7, selection: 'multi', defaultSelectedSlugs: [] },
      ]

  const sortedConfigs = [...configs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const facets = []

  for (const config of sortedConfigs) {
    if (config.enabled === false) continue
    const facetId = config.facet
    const type = FACET_TYPE[facetId] ?? 'reference'
    const label = config.label || DEFAULT_FACET_LABELS[facetId] || facetId
    const tally = new Map()

    for (const item of items) {
      const refs = extractFacetItems(item, facetId)
      for (const ref of refs) {
        const normalized = normalizeTaxonomyItem(ref, facetId)
        if (!normalized) continue
        if (tally.has(normalized.id)) {
          tally.get(normalized.id).count += 1
        } else {
          tally.set(normalized.id, { ...normalized, count: 1 })
        }
      }
    }

    // Skip empty facets
    if (tally.size === 0) continue

    const options = [...tally.values()].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.label.localeCompare(b.label)
    })

    facets.push({
      id:                   facetId,
      label,
      type,
      selection:            config.selection ?? 'multi',
      order:                config.order ?? 0,
      defaultSelectedSlugs: config.defaultSelectedSlugs ?? [],
      options,
    })
  }

  return {
    archive: {
      id:           archivePage._id,
      slug:         archivePage.slug,
      title:        archivePage.title,
      contentTypes: archivePage.contentTypes ?? [],
    },
    facets,
  }
}

// ─── Archives to validate ─────────────────────────────────────────────────────
// Canonical archive slugs (matches archivePage docs + routes in routes.js)

const ARCHIVE_SLUGS = ['knowledge-graph', 'articles', 'case-studies']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function printFacet(facet, indent = '   ') {
  const optCount = facet.options.length
  const typeLabel = facet.type === 'enum' ? ' [enum]' : ' [ref]'
  console.log(`${indent}  Facet: ${facet.label} [${facet.id}]${typeLabel} — ${facet.selection}-select — ${optCount} option(s)`)
  const maxShow = 5
  for (let i = 0; i < Math.min(facet.options.length, maxShow); i++) {
    const opt = facet.options[i]
    const color = opt.colorHex ? ` ${opt.colorHex}` : ''
    const slug = opt.slug ? ` (${opt.slug})` : ` (${opt.id})`
    const parent = opt.parent ? ` ↳ ${opt.parent.label}` : ''
    console.log(`${indent}    • "${opt.label}"${slug}${color}${parent} — ${opt.count} item(s)`)
  }
  if (facet.options.length > maxShow) {
    console.log(`${indent}    … and ${facet.options.length - maxShow} more`)
  }
}

// ─── Run validation ───────────────────────────────────────────────────────────

async function run() {
  console.log('\n🔬  Sugartown Filter Model Validator (Stage 4 v2)')
  console.log('══════════════════════════════════════════════\n')
  console.log(`   Project: ${projectId}  |  Dataset: ${dataset}\n`)

  let hasError = false
  let hasWarning = false

  // ── WP key check: query strings ──────────────────────────────────────────
  console.log('🔒  WP-Era Key Guard')
  console.log('──────────────────────────────────────────────')
  if (wpKeysInQueries.length > 0) {
    console.log(`   ❌  WP-era key(s) detected in GROQ query strings: ${wpKeysInQueries.join(', ')}`)
    console.log(`       These keys were purged in v0.11.0 and must not reappear.`)
    hasError = true
  } else {
    console.log('   ✅  No WP-era keys in GROQ query strings')
  }
  console.log()

  for (const slug of ARCHIVE_SLUGS) {
    console.log(`\n📁  Archive: /${slug}`)
    console.log('──────────────────────────────────────────────')

    let archivePage, contentItems, model

    try {
      archivePage = await client.fetch(archivePageWithFilterConfigQuery, { slug })
    } catch (err) {
      console.log(`   ❌  Sanity fetch failed for archivePage "${slug}": ${err.message}`)
      hasError = true
      continue
    }

    if (!archivePage) {
      console.log(`   ⚠️   No published archivePage doc found with slug "${slug}"`)
      console.log(`        Publish an archivePage in Sanity Studio with slug "${slug}" to enable filters.`)
      // Content gap (not a code error) — don't set hasError
      hasWarning = true
      continue
    }

    const contentTypes = archivePage.contentTypes ?? []
    console.log(`   Title:         "${archivePage.title}"`)
    console.log(`   Content types: [${contentTypes.join(', ')}]`)
    console.log(`   Filter config: ${archivePage.filterConfig?.facets?.length ?? 0} facet(s) configured`)

    try {
      contentItems = contentTypes.length > 0
        ? await client.fetch(facetsRawQuery, { contentTypes })
        : []
    } catch (err) {
      console.log(`   ❌  Content fetch failed: ${err.message}`)
      hasError = true
      continue
    }

    console.log(`   Content items: ${contentItems.length} doc(s) found`)

    try {
      model = buildFilterModel(archivePage, contentItems)
    } catch (err) {
      console.log(`   ❌  buildFilterModel() threw: ${err.message}`)
      hasError = true
      continue
    }

    if (model._error) {
      console.log(`   ❌  FilterModel error: ${model._error}`)
      hasError = true
      continue
    }

    // ── WP key check: model output ──────────────────────────────────────────
    const wpKeysInModel = detectWpKeys(model)
    if (wpKeysInModel.length > 0) {
      console.log(`   ❌  WP-era key(s) found in FilterModel output: ${wpKeysInModel.join(', ')}`)
      hasError = true
    }

    // ── Facet coverage report ───────────────────────────────────────────────
    const configuredFacetIds = (archivePage.filterConfig?.facets ?? [])
      .filter((f) => f.enabled !== false)
      .map((f) => f.facet)

    const modelFacetIds = new Set(model.facets.map((f) => f.id))

    console.log(`\n   FilterModel — ${model.facets.length} facet(s) with options:`)
    for (const facet of model.facets) {
      printFacet(facet)
    }

    // ── tools facet coverage warn ───────────────────────────────────────────
    if (configuredFacetIds.includes('tools') && !modelFacetIds.has('tools')) {
      console.log(`\n   ⚠️   'tools' facet is configured but returned 0 options.`)
      console.log(`        Content may not be tagged with tools[] yet, or tool documents may not be published.`)
      hasWarning = true
    }

    // ── status facet coverage warn ──────────────────────────────────────────
    if (configuredFacetIds.includes('status') && !modelFacetIds.has('status')) {
      console.log(`\n   ⚠️   'status' facet is configured but returned 0 options.`)
      console.log(`        Content may not have status values set.`)
      hasWarning = true
    }

    // ── client facet coverage warn ──────────────────────────────────────────
    if (configuredFacetIds.includes('client') && !modelFacetIds.has('client')) {
      console.log(`\n   ⚠️   'client' facet is configured but returned 0 options.`)
      console.log(`        Content may not have client values set.`)
      hasWarning = true
    }

    // ── Report facets configured but not in model (all 0 options) ──────────
    const emptyFacets = configuredFacetIds.filter((id) => !modelFacetIds.has(id))
    if (emptyFacets.length > 0) {
      console.log(`\n   ℹ️   Configured facets with 0 options (omitted from model): ${emptyFacets.join(', ')}`)
    }

    console.log(`\n   ✅  FilterModel produced for /${slug}`)
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log('\n══════════════════════════════════════════════')
  if (!hasError && !hasWarning) {
    console.log('✅  All filter models produced successfully.\n')
    process.exit(0)
  } else if (!hasError) {
    console.log('✅  All filter models produced successfully.')
    console.log('⚠️   Warnings noted above — review content tagging.\n')
    process.exit(0)
  } else {
    console.log('❌  Some filter models failed — see errors above.\n')
    process.exit(1)
  }
}

run()
