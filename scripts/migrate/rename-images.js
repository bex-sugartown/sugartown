#!/usr/bin/env node
/**
 * SUG-31 — Image Asset Pipeline: Rename, Re-upload & Patch References
 *
 * Renames all Sanity image assets to follow the naming convention in
 * docs/conventions/image-naming-convention.md:
 *
 *   {docType}-{subject}-{descriptor}[-{index}].{ext}
 *
 * Modes:
 *   --inventory   Generate inventory manifest only (no changes)
 *   --dry-run     Show rename plan without executing (default)
 *   --execute     Download, re-upload with new names, patch references
 *   --cleanup     Delete orphaned (unreferenced) assets after verification
 *
 * Outputs:
 *   artifacts/image-inventory.json     Full inventory with references
 *   artifacts/image-rename-plan.json   Before → after rename mapping
 *   artifacts/image-rename-result.json Post-execution result (execute mode)
 *
 * Usage:
 *   node scripts/migrate/rename-images.js --inventory
 *   node scripts/migrate/rename-images.js --dry-run
 *   node scripts/migrate/rename-images.js --execute
 *   node scripts/migrate/rename-images.js --cleanup
 *
 * Requirements:
 *   VITE_SANITY_PROJECT_ID, VITE_SANITY_DATASET, SANITY_AUTH_TOKEN env vars
 */

import { Readable } from 'stream'
import { resolve } from 'path'
import {
  banner, section, ok, warn, info, fail,
  buildSanityClient, writeJson, readJson, ensureDir,
  ARTIFACTS_DIR,
} from './lib.js'

// ─── Rename mapping ──────────────────────────────────────────────────────────
//
// Hand-curated mapping from current originalFilename → new convention name.
// Built from the full inventory query. Each entry:
//   oldFilename → { newFilename, category, notes }
//
// Categories: article, cs, node, project, tool, diagram, site, person
//
// Assets not in this map are flagged as "unmapped" in dry-run output.

const RENAME_MAP = {
  // ── Site branding & logos ──────────────────────────────────────────────────
  'std-logo.png':                          { newFilename: 'site-sugartown-logo.png',                    category: 'site' },
  'std-logo-light.png':                    { newFilename: 'site-sugartown-logo-light.png',              category: 'site' },
  'std-logo-2026.png':                     { newFilename: 'site-sugartown-logo-2026.png',               category: 'site' },  // 3 assets share this name
  'std-logo-sm-dark-2026.png':             { newFilename: 'site-sugartown-logo-sm-dark-2026.png',       category: 'site' },
  'beelady-favicon.png':                   { newFilename: 'site-beelady-favicon.png',                   category: 'site' },  // 2 assets share this name
  'favicon.png':                           { newFilename: 'site-favicon.png',                           category: 'site' },
  'submit-spin.svg':                       { newFilename: 'site-submit-spinner.svg',                    category: 'site' },

  // ── Person / author assets ─────────────────────────────────────────────────
  'beckyalice.jpg':                        { newFilename: 'site-beckyalice-headshot.webp',              category: 'site',    convert: true },
  'beebaby_of_berkeley.jpeg':              { newFilename: 'site-beckyalice-beebaby.webp',               category: 'site',    convert: true },
  'beehead_1990.jpeg':                     { newFilename: 'site-beckyalice-1990.webp',                  category: 'site',    convert: true },
  'beehead_feature.jpg':                   { newFilename: 'site-beckyalice-feature.webp',               category: 'site',    convert: true },
  'beehead01_banner.jpg':                  { newFilename: 'site-beckyalice-banner.webp',                category: 'site',    convert: true },
  'beelady-trans.png':                     { newFilename: 'site-beelady-transparent.png',               category: 'site' },
  'beelady01_feature_transparent.png':     { newFilename: 'site-beelady-feature-transparent.png',       category: 'site' },
  'beelady01_transparent.png':             { newFilename: 'site-beelady-full-transparent.png',          category: 'site' },
  'beelady01_transparent-683x1024.png':    { newFilename: 'site-beelady-transparent-sm.png',            category: 'site' },
  'beelady04_transparent-743x1024.png':    { newFilename: 'site-beelady-alt-transparent.png',           category: 'site' },
  'beegirl02b.png':                        { newFilename: 'site-beelady-avatar.png',                    category: 'site' },
  'bgirl-sm.png':                          { newFilename: 'site-beelady-avatar-sm.png',                 category: 'site' },
  'beehead_2004_banner.png':               { newFilename: 'site-beckyalice-hero-2004.png',              category: 'site' },
  'mushroom01.png':                        { newFilename: 'site-mushroom-illustration.png',             category: 'site' },

  // ── Article illustrations ──────────────────────────────────────────────────
  '1978-dolly-mainframe.png':              { newFilename: 'article-dolly-mainframe-1978.png',           category: 'article' },
  '1978-dolly-mainframe-150x150.png':      { newFilename: null,                                         category: 'orphan-thumb', notes: 'WP thumbnail duplicate — delete' },
  '1986-doll-travel-agency.png':           { newFilename: 'article-doll-travel-agency-1986.png',        category: 'article' },
  '1986-doll-travel-agency-150x150.png':   { newFilename: null,                                         category: 'orphan-thumb', notes: 'WP thumbnail duplicate — delete' },
  '1999-doll-imac.png':                    { newFilename: 'article-doll-imac-1999.png',                 category: 'article' },
  '1999-doll-imac-1024x683.png':           { newFilename: null,                                         category: 'orphan-thumb', notes: 'WP size variant — delete' },
  '1999-doll-imac-150x150.png':            { newFilename: null,                                         category: 'orphan-thumb', notes: 'WP thumbnail duplicate — delete' },
  'luxury_dot_com Background Removed.png': { newFilename: 'article-luxury-dot-com-illustration.png',    category: 'article' },
  'luxury_dot_com-Background-Removed-1024x683.png': { newFilename: 'article-luxury-dot-com-illustration-sm.png', category: 'article' },
  'luxury_dot_com-feature.jpg':            { newFilename: 'article-luxury-dot-com-feature.webp',        category: 'article', convert: true },

  // ── Article / node — AI-generated illustrations ────────────────────────────
  'ChatGPT Image Dec 15, 2025, 08_29_58 AM.png':  { newFilename: 'site-about-illustration.png',        category: 'site' },
  'ChatGPT Image Dec 16, 2025, 07_42_51 AM.png':  { newFilename: 'site-illustration-portrait-1.png',   category: 'site' },
  'ChatGPT Image Dec 16, 2025, 07_43_07 AM.png':  { newFilename: 'site-illustration-portrait-2.png',   category: 'site' },
  'ChatGPT Image Dec 28, 2025, 07_10_59 AM.png':  { newFilename: 'article-test-illustration.png',      category: 'article' },
  'ChatGPT Image Mar 2, 2026, 06_40_13 AM.png':   { newFilename: 'site-illustration-landscape.png',    category: 'site' },

  // ── Case study assets ──────────────────────────────────────────────────────
  // Beringer
  'Beringer_Redesign_Home.webp':           { newFilename: 'cs-beringer-homepage-redesign.webp',         category: 'cs' },
  'Beringer_Redesign_Home-150x150.webp':   { newFilename: 'cs-beringer-homepage-thumb.webp',            category: 'cs' },
  'Beringer_Redesign_Recipes-150x150.webp': { newFilename: 'cs-beringer-recipes-thumb.webp',            category: 'cs' },

  // FX Networks
  'fx-networks-featured.jpg':             { newFilename: 'cs-fx-networks-featured.webp',                category: 'cs',      convert: true },
  'fx-networks-01-150x150.jpg':           { newFilename: null,                                          category: 'orphan-thumb', notes: 'WP thumbnail — delete' },
  'fx-wwdits-sq-150x150.webp':            { newFilename: null,                                          category: 'orphan-thumb', notes: 'WP thumbnail — delete' },
  'wcag-scorecard-fx-150x150.jpg':        { newFilename: null,                                          category: 'orphan-thumb', notes: 'WP thumbnail — delete' },

  // Lyris / Lunar Landing
  'lyris-landingpages-1024x817-1.webp':    { newFilename: 'cs-lyris-landing-pages.webp',               category: 'cs' },
  'lyris-landingpages-1024x817-1-150x150.webp': { newFilename: 'cs-lyris-landing-pages-thumb.webp',    category: 'cs' },
  'lyris-landingpage-app-150x150.webp':    { newFilename: 'cs-lyris-app-thumb.webp',                    category: 'cs' },
  'lyris-landingpage-app-create-150x150.webp': { newFilename: 'cs-lyris-app-create-thumb.webp',         category: 'cs' },

  // Backroads
  '20449027_484171345259379_3419829500326298906_o.webp': { newFilename: 'cs-backroads-photo.webp',      category: 'cs' },

  // bareMinerals / beauty retail
  'qa4.homepage1.png':                     { newFilename: 'cs-bareminerals-homepage.png',                category: 'cs' },
  'qa4.homepage1-150x150.png':             { newFilename: 'cs-bareminerals-homepage-thumb.png',          category: 'cs' },
  'qa4.homepage_banner.png':               { newFilename: 'cs-bareminerals-homepage-banner.png',         category: 'cs' },
  'content-model.jpg':                     { newFilename: 'cs-bareminerals-content-model.webp',          category: 'cs',      convert: true },
  'content-model-150x150.jpg':             { newFilename: 'cs-bareminerals-content-model-thumb.webp',    category: 'cs',      convert: true },
  'Content_Model_Template-150x150.png':    { newFilename: 'cs-bareminerals-content-model-template-thumb.png', category: 'cs' },
  'global-content-model-150x150.jpg':      { newFilename: 'cs-bareminerals-global-content-model-thumb.webp', category: 'cs', convert: true },
  '496-references-138x1024.png':           { newFilename: 'cs-bareminerals-references-chart.png',        category: 'cs' },
  '496-references-150x150.png':            { newFilename: 'cs-bareminerals-references-thumb.png',        category: 'cs' },
  'contentful-quote.png':                  { newFilename: 'cs-bareminerals-contentful-quote.png',        category: 'cs' },
  'image-1-150x150.png':                   { newFilename: 'cs-bareminerals-detail-1-thumb.png',          category: 'cs' },
  'image-1-2.png':                         { newFilename: 'cs-prestige-beauty-design-system.png',        category: 'cs' },
  'image-2-150x150.png':                   { newFilename: 'cs-bareminerals-detail-2-thumb.png',          category: 'cs' },
  'image-2.png':                           { newFilename: 'cs-bareminerals-detail-2.png',                category: 'cs' },
  'image-150x150.webp':                    { newFilename: null,                                          category: 'orphan-thumb', notes: 'Generic WP thumbnail — delete' },
  'image-300x300.png':                     { newFilename: null,                                          category: 'orphan-thumb', notes: 'Generic WP size variant — delete' },

  // Prestige Beauty / TFB
  'tfb-light-bg.png':                      { newFilename: 'cs-prestige-beauty-tfb-light.png',            category: 'cs' },

  // Screenshot
  '2025-08-24_04-52-25-1024x406.png':     { newFilename: 'cs-bareminerals-screenshot.png',              category: 'cs' },
  '2025-08-24_04-52-25-150x150.png':       { newFilename: 'cs-bareminerals-screenshot-thumb.png',        category: 'cs' },

  // ── Diagram / knowledge graph ──────────────────────────────────────────────
  'knowledge_graph_dark.svg':              { newFilename: 'diagram-knowledge-graph-dark.svg',            category: 'diagram' },
  'knowledge_graph_latest.png':            { newFilename: 'diagram-knowledge-graph-latest.png',          category: 'diagram' },
  'Screenshot-2026-01-04-at-6.03.55-AM-scaled.png': { newFilename: 'diagram-screenshot-2026-01.png',    category: 'diagram' },
  '2026-01-04_05-44-49.png':              { newFilename: 'diagram-screenshot-2026-01-alt.png',           category: 'diagram' },

  // ── Stock / retro desk photos ──────────────────────────────────────────────
  'retro-computer-desk-arrangement.jpg':    { newFilename: 'site-retro-desk-1.webp',                    category: 'site',    convert: true },
  'retro-computer-desk-arrangement (3).jpg': { newFilename: 'site-retro-desk-2.webp',                   category: 'site',    convert: true },
  'retro-computer-desk-arrangement-2.jpg':  { newFilename: 'site-retro-desk-3.webp',                    category: 'site',    convert: true },
  'retro-computer-desk-arrangement-2-scaled.jpg': { newFilename: 'site-retro-desk-3-scaled.webp',       category: 'site',    convert: true },
  'retro-computer-desk-arrangement-3.jpg':  { newFilename: 'site-retro-desk-4.webp',                    category: 'site',    convert: true },
  'retro-computer-desk-arrangement-4.jpg':  { newFilename: 'site-retro-desk-5.webp',                    category: 'site',    convert: true },
  'retro-computer-desk-arrangement-5.jpg':  { newFilename: 'site-retro-desk-6.webp',                    category: 'site',    convert: true },
  'retro-computer-desk-arrangement-6.jpg':  { newFilename: 'site-retro-desk-7.webp',                    category: 'site',    convert: true },
  'retro-computer-desk-arrangement-7.jpg':  { newFilename: 'site-retro-desk-8.webp',                    category: 'site',    convert: true },
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INVENTORY_FILE    = resolve(ARTIFACTS_DIR, 'image-inventory.json')
const RENAME_PLAN_FILE  = resolve(ARTIFACTS_DIR, 'image-rename-plan.json')
const RENAME_RESULT_FILE = resolve(ARTIFACTS_DIR, 'image-rename-result.json')

const DOWNLOAD_TIMEOUT_MS = 60_000
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1_000

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseMode() {
  const args = process.argv.slice(2)
  if (args.includes('--execute')) return 'execute'
  if (args.includes('--cleanup')) return 'cleanup'
  if (args.includes('--inventory')) return 'inventory'
  return 'dry-run'
}

async function downloadBuffer(url, attempt = 0) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'sugartown-sug31/1.0 (image-rename)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
    const buf = await res.arrayBuffer()
    return Buffer.from(buf)
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)))
      return downloadBuffer(url, attempt + 1)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function uploadToSanity(client, buf, contentType, filename) {
  const stream = Readable.from(buf)
  const asset = await client.assets.upload('image', stream, { filename, contentType })
  return asset._id
}

/**
 * Determine the content type for a new filename.
 * If the asset needs format conversion (jpg→webp), returns the new MIME type.
 */
function getContentType(newFilename, originalMimeType) {
  if (newFilename.endsWith('.webp')) return 'image/webp'
  if (newFilename.endsWith('.png')) return 'image/png'
  if (newFilename.endsWith('.svg')) return 'image/svg+xml'
  return originalMimeType
}

// ─── Inventory ────────────────────────────────────────────────────────────────

async function fetchInventory(client) {
  const query = `*[_type == "sanity.imageAsset"] {
    _id,
    originalFilename,
    url,
    size,
    mimeType,
    "references": *[references(^._id)] {
      _id,
      _type,
      title,
      "slug": slug.current
    }
  } | order(originalFilename asc)`

  return client.fetch(query)
}

// ─── Deep reference patching ──────────────────────────────────────────────────
//
// Sanity documents can reference image assets in many locations:
//   - Top-level image fields: doc.hero.asset._ref, doc.featuredImage.asset._ref
//   - PortableText inline images: doc.content[].asset._ref
//   - Array items: doc.images[].asset._ref
//   - Nested objects: doc.sections[].image.asset._ref
//
// We walk the entire document tree looking for { _ref: oldAssetId } and replace
// with { _ref: newAssetId }. This is safe because asset IDs are globally unique.

function patchRefsInDoc(doc, oldId, newId) {
  if (doc === null || doc === undefined) return doc
  if (typeof doc !== 'object') return doc
  if (Array.isArray(doc)) return doc.map((item) => patchRefsInDoc(item, oldId, newId))

  const patched = {}
  for (const [key, val] of Object.entries(doc)) {
    if (key === '_ref' && val === oldId) {
      patched[key] = newId
    } else {
      patched[key] = patchRefsInDoc(val, oldId, newId)
    }
  }
  return patched
}

// ─── Main modes ───────────────────────────────────────────────────────────────

async function runInventory(client) {
  section('Fetching image asset inventory from Sanity')
  const assets = await fetchInventory(client)
  ensureDir(ARTIFACTS_DIR)
  writeJson(INVENTORY_FILE, assets)

  const referenced = assets.filter((a) => a.references.length > 0)
  const orphaned = assets.filter((a) => a.references.length === 0)

  ok(`${assets.length} total image assets`)
  ok(`${referenced.length} referenced by documents`)
  warn(`${orphaned.length} orphaned (zero references)`)
  ok(`Inventory written: ${INVENTORY_FILE}`)
}

async function runDryRun(client) {
  section('Fetching image asset inventory')
  const assets = await fetchInventory(client)
  ensureDir(ARTIFACTS_DIR)
  writeJson(INVENTORY_FILE, assets)

  section('Building rename plan')

  const plan = {
    generated: new Date().toISOString(),
    summary: { total: 0, rename: 0, convert: 0, delete: 0, unmapped: 0, keepAsIs: 0 },
    actions: [],
  }

  for (const asset of assets) {
    const entry = RENAME_MAP[asset.originalFilename]
    plan.summary.total++

    if (!entry) {
      plan.summary.unmapped++
      plan.actions.push({
        action: 'unmapped',
        assetId: asset._id,
        currentFilename: asset.originalFilename,
        references: asset.references.length,
        notes: 'No mapping defined — review manually',
      })
      continue
    }

    if (entry.newFilename === null) {
      // Marked for deletion
      plan.summary.delete++
      plan.actions.push({
        action: 'delete',
        assetId: asset._id,
        currentFilename: asset.originalFilename,
        references: asset.references.length,
        notes: entry.notes || 'Orphan thumbnail — delete',
      })
      continue
    }

    if (entry.newFilename === asset.originalFilename) {
      plan.summary.keepAsIs++
      plan.actions.push({
        action: 'keep',
        assetId: asset._id,
        currentFilename: asset.originalFilename,
      })
      continue
    }

    const needsConvert = !!entry.convert
    if (needsConvert) plan.summary.convert++
    plan.summary.rename++

    plan.actions.push({
      action: needsConvert ? 'convert-and-rename' : 'rename',
      assetId: asset._id,
      currentFilename: asset.originalFilename,
      newFilename: entry.newFilename,
      category: entry.category,
      references: asset.references.length,
      referenceDetails: asset.references.map((r) => `${r._type}:${r.slug || r._id}`),
    })
  }

  writeJson(RENAME_PLAN_FILE, plan)

  ok(`Total assets:   ${plan.summary.total}`)
  ok(`Will rename:    ${plan.summary.rename}`)
  ok(`Need convert:   ${plan.summary.convert} (jpg/jpeg → webp re-upload)`)
  warn(`Will delete:    ${plan.summary.delete} (orphan thumbnails)`)
  warn(`Unmapped:       ${plan.summary.unmapped} (need manual review)`)
  ok(`Rename plan written: ${RENAME_PLAN_FILE}`)

  info('\nUnmapped assets:')
  for (const a of plan.actions.filter((x) => x.action === 'unmapped')) {
    info(`  ? ${a.currentFilename} (${a.references} refs)`)
  }

  info('\nRename preview (first 20):')
  for (const a of plan.actions.filter((x) => x.action === 'rename' || x.action === 'convert-and-rename').slice(0, 20)) {
    const tag = a.action === 'convert-and-rename' ? ' [CONVERT]' : ''
    info(`  ${a.currentFilename} → ${a.newFilename}${tag}`)
  }

  info('\nDeletion candidates:')
  for (const a of plan.actions.filter((x) => x.action === 'delete')) {
    const refWarn = a.references > 0 ? ` ⚠️  HAS ${a.references} REFS` : ''
    info(`  ✕ ${a.currentFilename}${refWarn}`)
  }
}

async function runExecute(client) {
  // Load the plan
  const plan = readJson(RENAME_PLAN_FILE)
  if (!plan) {
    fail('No rename plan found. Run --dry-run first to generate the plan.')
    process.exit(1)
  }

  section(`Executing rename plan (${plan.summary.rename} renames, ${plan.summary.convert} converts)`)

  const results = []
  let done = 0
  let failed = 0

  const renameActions = plan.actions.filter(
    (a) => a.action === 'rename' || a.action === 'convert-and-rename'
  )

  for (const action of renameActions) {
    const idx = `[${done + failed + 1}/${renameActions.length}]`
    process.stdout.write(`   ${idx} ${action.currentFilename} → ${action.newFilename}... `)

    try {
      if (action.action === 'convert-and-rename') {
        // Download original from CDN → re-upload with new filename.
        // Sanity CDN auto-converts to webp for supported browsers, so we
        // re-upload the original bytes with the convention filename.
        const inventoryAsset = (readJson(INVENTORY_FILE) || []).find((a) => a._id === action.assetId)
        if (!inventoryAsset) throw new Error('Asset not found in inventory')

        const buf = await downloadBuffer(inventoryAsset.url)
        const contentType = getContentType(action.newFilename, inventoryAsset.mimeType)
        const newAssetId = await uploadToSanity(client, buf, contentType, action.newFilename)

        // Patch all referencing documents
        let patchCount = 0
        if (inventoryAsset.references.length > 0) {
          for (const ref of inventoryAsset.references) {
            try {
              const doc = await client.getDocument(ref._id)
              if (!doc) continue
              const patched = patchRefsInDoc(doc, action.assetId, newAssetId)
              await client.createOrReplace(patched)
              patchCount++
            } catch (patchErr) {
              warn(`  Patch failed for ${ref._id}: ${patchErr.message}`)
            }
          }
        }

        results.push({
          status: 'ok',
          action: action.action,
          oldAssetId: action.assetId,
          newAssetId,
          oldFilename: action.currentFilename,
          newFilename: action.newFilename,
          patchedDocs: patchCount,
        })
        console.log(`✅ (new: ${newAssetId}, ${patchCount} docs patched)`)
        done++
      } else {
        // Rename only — update originalFilename on the existing asset doc
        await client
          .patch(action.assetId)
          .set({ originalFilename: action.newFilename })
          .commit()

        results.push({
          status: 'ok',
          action: 'rename',
          assetId: action.assetId,
          oldFilename: action.currentFilename,
          newFilename: action.newFilename,
        })
        console.log('✅')
        done++
      }
    } catch (err) {
      console.log('❌')
      warn(`  Error: ${err.message}`)
      results.push({
        status: 'failed',
        assetId: action.assetId,
        oldFilename: action.currentFilename,
        newFilename: action.newFilename,
        error: err.message,
      })
      failed++
    }
  }

  writeJson(RENAME_RESULT_FILE, {
    executed: new Date().toISOString(),
    summary: { done, failed, total: renameActions.length },
    results,
  })

  section('Summary')
  ok(`${done} asset(s) renamed successfully`)
  if (failed) warn(`${failed} asset(s) failed — review ${RENAME_RESULT_FILE}`)
  ok(`Results written: ${RENAME_RESULT_FILE}`)
}

async function runCleanup(client) {
  const plan = readJson(RENAME_PLAN_FILE)
  if (!plan) {
    fail('No rename plan found. Run --dry-run first.')
    process.exit(1)
  }

  const deleteActions = plan.actions.filter((a) => a.action === 'delete')
  if (!deleteActions.length) {
    ok('No assets marked for deletion.')
    return
  }

  section(`Cleaning up ${deleteActions.length} orphaned asset(s)`)

  // Safety: re-check references before deleting
  let deleted = 0
  let skipped = 0

  for (const action of deleteActions) {
    process.stdout.write(`   ${action.currentFilename}... `)

    // Re-query references to ensure still orphaned
    const refs = await client.fetch(
      `count(*[references($id)])`,
      { id: action.assetId }
    )

    if (refs > 0) {
      console.log(`⏭️  SKIPPED (${refs} refs found — no longer orphaned)`)
      skipped++
      continue
    }

    try {
      await client.delete(action.assetId)
      console.log('🗑️  deleted')
      deleted++
    } catch (err) {
      console.log('❌')
      warn(`  Error: ${err.message}`)
    }
  }

  section('Cleanup summary')
  ok(`${deleted} orphaned asset(s) deleted`)
  if (skipped) warn(`${skipped} skipped (had references — re-run --dry-run to update plan)`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const mode = parseMode()
  banner(`SUG-31 — Image Asset Pipeline (${mode})`)

  const client = buildSanityClient()

  switch (mode) {
    case 'inventory':
      await runInventory(client)
      break
    case 'dry-run':
      await runDryRun(client)
      break
    case 'execute':
      await runExecute(client)
      break
    case 'cleanup':
      await runCleanup(client)
      break
  }

  console.log('\n══════════════════════════════════════════════\n')
}

main().catch((err) => {
  fail(`Unexpected error: ${err.message}`)
  console.error(err)
  process.exit(1)
})
