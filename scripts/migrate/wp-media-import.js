#!/usr/bin/env node
/**
 * SUG-32 — WordPress Media Library Import
 *
 * Usage:
 *   node scripts/migrate/wp-media-import.js --dry-run    # preview only
 *   node scripts/migrate/wp-media-import.js --execute     # download + upload to Sanity
 *   node scripts/migrate/wp-media-import.js --archive     # download archive-only items
 */

import { buildSanityClient, writeJson, ARTIFACTS_DIR } from './lib.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

const mode = process.argv[2] || '--dry-run'
const client = buildSanityClient()

// ─── Convention Name Map ──────────────────────────────────────────
// WP filename → Sanity convention name
// Format: {docType}-{subject}-{descriptor}[-{index}].{ext}
const IMPORT_MAP = {
  '20250823_0609_Pink-Green-Pattern_remix_01k3bgpnr1e18s1vt7b1bf8b41.png':
    'article-pattern-pink-green-remix.png',
  'beebaby_of_berkeley.jpeg':
    'site-beckyalice-beebaby-berkeley.webp',
  'beebaby.jpeg':
    'site-beckyalice-beebaby-sm.webp',
  'beehead_1990.jpeg':
    'site-beckyalice-1990.webp',
  'beehead_2021.jpeg':
    'site-beckyalice-2021.webp',
  'beehead_feature.jpg':
    'site-beckyalice-feature.webp',
  'Beringer_Redesign_Recipes.webp':
    'cs-beringer-recipes-redesign.webp',
  'category_dist_latest.png':
    'diagram-category-distribution.png',
  'cms-rfp-01.jpg':
    'article-cms-rfp-screenshot-1.webp',
  'cms-rfp-02.jpg':
    'article-cms-rfp-screenshot-2.webp',
  'cms-rfp-03.jpg':
    'article-cms-rfp-screenshot-3.webp',
  'content-model.jpg':
    'cs-beauty-content-model-full.webp',
  'cropped-favicon.png':
    'site-favicon-cropped.png',
  'fx-networks-01-scaled.jpg':
    'cs-fx-networks-screenshot-1.webp',
  'fx-networks-02.jpg':
    'cs-fx-networks-screenshot-2.webp',
  'fx-networks-featured.jpg':
    'cs-fx-networks-featured.webp',
  'fx-wwdits-sq.webp':
    'cs-fx-networks-wwdits-square.webp',
  'Gemini_Generated_Image_lup7x4lup7x4lup7-scaled.png':
    'hero-retro-desk-gemini-1.png',
  'Gemini_Generated_Image_o15et5o15et5o15e-scaled.png':
    'hero-retro-desk-gemini-2.png',
  'Gemini_Generated_Image_tcuyfktcuyfktcuy-scaled.png':
    'hero-retro-desk-gemini-3.png',
  'global-content-model.jpg':
    'cs-beauty-global-content-model.webp',
  'image-1.png':
    'cs-beauty-detail-1.png',
  'image.png':
    'cs-backroads-feature.png',
  'image.webp':
    'cs-beauty-references-full.webp',
  'knowledge_graph_light.svg':
    'diagram-knowledge-graph-light.svg',
  'luxury_dot_com-feature_trans-1.png':
    'article-luxury-dot-com-feature-alt.png',
  'luxury_dot_com-feature.jpg':
    'article-luxury-dot-com-feature.webp',
  'lyris-landingpage-app-create.webp':
    'cs-lyris-app-create.webp',
  'lyris-landingpage-app.webp':
    'cs-lyris-app.webp',
  'wcag-scorecard-fx.jpg':
    'cs-fx-networks-wcag-scorecard.webp',
}

// Archives — download only, no Sanity upload
const ARCHIVE_LIST = [
  '2026-01-04_05-44-49.png',
  'beckyalice-red.jpg',
  'beehead.png',
  'beehead01_avatar.jpg',
  'beehead01_banner.jpg',
  'beelady01_avatar.jpg',
  'beelady01_banner.jpg',
  'beelady01_feature_transparent.png',
  'beelady01.jpeg',
  'beelady02_feature_transparent.png',
  'beelady04_transparent.png',
  'beelady04-1.jpeg',
  'bex-violent.jpg',
  'bg.jpg',
  'dont-freak-out.jpg',
  'favicon.png',
  'knowledge_graph_latest.png',
  'luxury_dot_com-feature_trans.png',
  'mushroom01.png',
  'ort-project-scrolling.webp',
  'std-logo-light-30k-Becky-Prince-Head.png',
  'www.ortproject.com_artwork_-edited.webp',
  'www.ortproject.com_artwork_ig-1.webp',
  'www.ortproject.com_artwork_ig.webp',
]

// ─── CSV Parser ──────────────────────────────────────────────────
function parseCSVLine(line) {
  const fields = []; let current = ''; let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { if (inQ && line[i+1] === '"') { current += '"'; i++; continue }; inQ = !inQ; continue }
    if (ch === ',' && !inQ) { fields.push(current.trim()); current = ''; continue }
    current += ch
  }
  fields.push(current.trim())
  return fields
}

function loadCSV() {
  const csv = readFileSync('/tmp/wp-media-decision-becky-notes.csv', 'utf8')
  const lines = csv.split('\n').filter(Boolean)
  const headers = parseCSVLine(lines[0])
  const noteIdx = headers.indexOf('Becky Notes')
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const f = parseCSVLine(lines[i])
    rows.push({
      wpId: f[0], filename: f[1], url: f[2], mime: f[3],
      width: f[4], height: f[5], sizeKB: f[6], postId: f[7],
      action: f[8], reason: f[9], sanityMatch: f[10],
      beckyNote: (f[noteIdx] || '').toLowerCase().trim(),
    })
  }
  return rows
}

// ─── Download helper ──────────────────────────────────────────────
async function downloadBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  const rows = loadCSV()

  // Build URL lookup: filename → url
  const urlMap = new Map()
  for (const r of rows) urlMap.set(r.filename, r.url)

  // Resolve final actions
  const imports = []
  const archives = []
  for (const r of rows) {
    const becky = r.beckyNote
    let final = r.action
    if (becky === 'import') final = 'import'
    else if (becky === 'archive') final = 'archive'
    else if (r.action === 'import') final = 'import'

    if (final === 'import' && IMPORT_MAP[r.filename]) {
      imports.push({ ...r, conventionName: IMPORT_MAP[r.filename] })
    } else if (final === 'archive') {
      archives.push(r)
    }
  }

  console.log(`\n🔄  SUG-32 — WordPress Media Import`)
  console.log(`══════════════════════════════════════════════\n`)
  console.log(`   Mode: ${mode}`)
  console.log(`   Imports: ${imports.length}`)
  console.log(`   Archives: ${archives.length}\n`)

  // ── Phase 1: Import to Sanity ────────────────────────────────
  if (imports.length > 0) {
    console.log(`🔄  Phase 1: Import to Sanity`)
    console.log(`──────────────────────────────────────────────\n`)

    const results = []
    for (const item of imports) {
      const { filename, url, conventionName } = item
      process.stdout.write(`   ${filename} → ${conventionName} ... `)

      if (mode === '--dry-run') {
        console.log('(dry run)')
        results.push({ filename, conventionName, status: 'dry-run' })
        continue
      }

      try {
        const buf = await downloadBuffer(url)
        const ext = conventionName.split('.').pop()
        const contentType =
          ext === 'webp' ? 'image/webp' :
          ext === 'png' ? 'image/png' :
          ext === 'svg' ? 'image/svg+xml' :
          ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream'

        const asset = await client.assets.upload('image', buf, {
          filename: conventionName,
          contentType,
        })
        console.log(`✅  ${asset._id.slice(6, 30)}...`)
        results.push({ filename, conventionName, status: 'ok', assetId: asset._id })
      } catch (err) {
        console.log(`❌  ${err.message}`)
        results.push({ filename, conventionName, status: 'error', error: err.message })
      }
    }

    writeJson(resolve(ARTIFACTS_DIR, 'wp-import-results.json'), results)
    const ok = results.filter(r => r.status === 'ok').length
    const fail = results.filter(r => r.status === 'error').length
    console.log(`\n   Uploaded: ${ok}  Failed: ${fail}\n`)
  }

  // ── Phase 2: Archive (download only) ──────────────────────────
  if (archives.length > 0 && (mode === '--archive' || mode === '--execute')) {
    const archiveDir = resolve(ARTIFACTS_DIR, 'wp-archived-images')
    mkdirSync(archiveDir, { recursive: true })

    console.log(`🔄  Phase 2: Archive (download to ${archiveDir})`)
    console.log(`──────────────────────────────────────────────\n`)

    let downloaded = 0
    for (const item of archives) {
      const { filename, url } = item
      const dest = resolve(archiveDir, filename)
      if (existsSync(dest)) {
        console.log(`   ⏭️  ${filename} (already exists)`)
        downloaded++
        continue
      }

      try {
        const buf = await downloadBuffer(url)
        writeFileSync(dest, buf)
        console.log(`   ✅  ${filename}`)
        downloaded++
      } catch (err) {
        console.log(`   ❌  ${filename}: ${err.message}`)
      }
    }
    console.log(`\n   Downloaded: ${downloaded}/${archives.length}\n`)
  }

  // ── Summary ───────────────────────────────────────────────────
  console.log(`🔄  Summary`)
  console.log(`══════════════════════════════════════════════\n`)
  console.log(`   Mode:       ${mode}`)
  console.log(`   Imports:    ${imports.length}`)
  console.log(`   Archives:   ${archives.length}`)
}

main().catch(err => { console.error(err); process.exit(1) })
