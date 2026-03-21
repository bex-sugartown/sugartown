#!/usr/bin/env node
/**
 * migrate-colorHex-to-color-object.mjs
 *
 * Converts colorHex fields from plain hex strings to @sanity/color-input
 * object shape on project and category documents.
 *
 * Input:  "colorHex": "#0099FF"
 * Output: "colorHex": { "_type": "color", "hex": "#0099FF", "hsl": {...}, "hsv": {...}, "rgb": {...}, "alpha": 1 }
 *
 * Usage:
 *   node apps/studio/scripts/migrate-colorHex-to-color-object.mjs           # dry-run
 *   node apps/studio/scripts/migrate-colorHex-to-color-object.mjs --execute # apply mutations
 */

import {createClient} from '@sanity/client'

const PROJECT_ID = 'poalmzla'
const DATASET = 'production'
const API_VERSION = '2026-02-07'
// Use the read token from env or the web .env file
const TOKEN = process.env.SANITY_TOKEN || process.env.VITE_SANITY_TOKEN

const EXECUTE = process.argv.includes('--execute')

if (!TOKEN) {
  console.error('❌ SANITY_TOKEN or VITE_SANITY_TOKEN environment variable required')
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
})

// ── Hex → color object conversion ──────────────────────────────────────────

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return {r, g, b, a: 1}
}

function rgbToHsl({r, g, b}) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: 1,
  }
}

function rgbToHsv({r, g, b}) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const v = max
  const d = max - min
  const s = max === 0 ? 0 : d / max
  let h = 0
  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a: 1,
  }
}

function hexToColorObject(hex) {
  const rgb = hexToRgb(hex)
  return {
    _type: 'color',
    hex: hex.toLowerCase(),
    hsl: rgbToHsl(rgb),
    hsv: rgbToHsv(rgb),
    rgb,
    alpha: 1,
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🎨 colorHex migration (${EXECUTE ? 'EXECUTE' : 'DRY RUN'})\n`)

  // Find all project and category docs with a string colorHex
  // Fetch all docs with colorHex defined — filter string vs object in JS
  const docs = await client.fetch(
    `*[_type in ["project", "category"] && defined(colorHex)]{
      _id, _type, name, colorHex
    }`
  )
  // Only migrate docs where colorHex is still a plain string (not yet an object)
  const toMigrate = docs.filter((d) => typeof d.colorHex === 'string')

  if (toMigrate.length === 0) {
    console.log('✅ No documents need migration — all colorHex values are already objects or empty.')
    return
  }

  console.log(`Found ${toMigrate.length} document(s) to migrate:\n`)

  const mutations = []

  for (const doc of toMigrate) {
    const hex = doc.colorHex
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
      console.log(`  ⚠️  ${doc._type} "${doc.name}" (${doc._id}): invalid hex "${hex}" — skipping`)
      continue
    }

    const colorObj = hexToColorObject(hex)
    console.log(`  ✓ ${doc._type} "${doc.name}": ${hex} → color object`)

    mutations.push({
      patch: {
        id: doc._id,
        set: {colorHex: colorObj},
      },
    })
  }

  if (mutations.length === 0) {
    console.log('\n⚠️  No valid mutations to apply.')
    return
  }

  if (!EXECUTE) {
    console.log(`\n📋 Dry run complete. ${mutations.length} mutation(s) ready.`)
    console.log('   Run with --execute to apply.\n')
    return
  }

  console.log(`\n🚀 Applying ${mutations.length} mutation(s)...`)
  const result = await client.transaction(mutations).commit()
  console.log(`✅ Migration complete. Transaction ID: ${result.transactionId}\n`)
}

main().catch((err) => {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
})
