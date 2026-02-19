#!/usr/bin/env node
/**
 * validate-filters.js — Dev-time Filter Model Validator (Stage 4)
 *
 * For each known archive page slug, fetches the archivePage doc + content items
 * from Sanity, runs buildFilterModel(), and prints the resulting FilterModel JSON.
 *
 * EXIT CRITERIA (Stage 4):
 *   Each archive must produce a stable FilterModel (even if facets are empty).
 *   The script exits 0 if all archives produce a model without errors.
 *   The script exits 1 if any archive fails to fetch or produces an error.
 *
 * Usage:
 *   pnpm validate:filters
 *
 * Environment variables required (reads from .env or process.env):
 *   VITE_SANITY_PROJECT_ID
 *   VITE_SANITY_DATASET
 *   VITE_SANITY_API_VERSION
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
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'

if (!projectId) {
  console.error('[validate-filters] ERROR: VITE_SANITY_PROJECT_ID is not set.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false })

// ─── GROQ queries (inline — no bundler dependency) ────────────────────────────

const PERSON_FRAGMENT = `_id, name, "slug": slug.current, role`
const CATEGORY_FRAGMENT = `_id, name, "slug": slug.current, colorHex`
const TAG_FRAGMENT = `_id, name, "slug": slug.current`
const PROJECT_FRAGMENT = `_id, projectId, name, status, colorHex`

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

const facetsRawQuery = `
  *[_type in $contentTypes && defined(slug.current)] {
    _id,
    _type,
    "slug": slug.current,
    authors[]->{${PERSON_FRAGMENT}},
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}}
  }
`

// ─── FilterModel builder (inline — avoids ESM import from src/) ──────────────
// This is a copy of the logic in src/lib/filterModel.js so the script can run
// as a standalone Node script without a bundler. Keep in sync with filterModel.js.

const DEFAULT_FACET_LABELS = {
  author: 'Author',
  project: 'Project',
  category: 'Category',
  tag: 'Tag',
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
    default: return []
  }
}

function normalizeTaxonomyItem(raw, facetId) {
  if (!raw || !raw._id || !raw.slug) return null
  const base = { id: raw._id, title: raw.name ?? raw.title ?? '(unnamed)', slug: raw.slug }
  if ((facetId === 'category' || facetId === 'project') && raw.colorHex) {
    base.colorHex = raw.colorHex
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
      ]

  const sortedConfigs = [...configs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const facets = []

  for (const config of sortedConfigs) {
    if (config.enabled === false) continue
    const facetId = config.facet
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

    const options = [...tally.values()].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.title.localeCompare(b.title)
    })

    facets.push({
      id: facetId,
      label,
      selection: config.selection ?? 'multi',
      order: config.order ?? 0,
      defaultSelectedSlugs: config.defaultSelectedSlugs ?? [],
      options,
    })
  }

  return {
    archive: {
      id: archivePage._id,
      slug: archivePage.slug,
      title: archivePage.title,
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
  const status = optCount === 0 ? '(no options — no content with this taxonomy)' : `${optCount} option(s)`
  console.log(`${indent}  Facet: ${facet.label} [${facet.id}] — ${facet.selection}-select — ${status}`)
  const maxShow = 5
  for (let i = 0; i < Math.min(facet.options.length, maxShow); i++) {
    const opt = facet.options[i]
    const color = opt.colorHex ? ` ${opt.colorHex}` : ''
    console.log(`${indent}    • "${opt.title}" (${opt.slug})${color} — ${opt.count} item(s)`)
  }
  if (facet.options.length > maxShow) {
    console.log(`${indent}    … and ${facet.options.length - maxShow} more`)
  }
}

// ─── Run validation ───────────────────────────────────────────────────────────

async function run() {
  console.log('\n🔬  Sugartown Filter Model Validator (Stage 4)')
  console.log('══════════════════════════════════════════════\n')
  console.log(`   Project: ${projectId}  |  Dataset: ${dataset}\n`)

  let hasError = false

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
      // This is a warning (content gap), not a code error — don't set hasError
      continue
    }

    const contentTypes = archivePage.contentTypes ?? []
    console.log(`   Title:        "${archivePage.title}"`)
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

    console.log(`\n   FilterModel — ${model.facets.length} facet(s):`)
    for (const facet of model.facets) {
      printFacet(facet)
    }

    console.log(`\n   ✅  FilterModel produced for /${slug}`)
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log('\n══════════════════════════════════════════════')
  if (!hasError) {
    console.log('✅  All filter models produced successfully.\n')
    process.exit(0)
  } else {
    console.log('❌  Some filter models failed — see errors above.\n')
    process.exit(1)
  }
}

run()
