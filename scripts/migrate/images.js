#!/usr/bin/env node
/**
 * migrate:images — Step 2b: Download WP images + upload to Sanity asset store
 *
 * Reads:  artifacts/wp_export.ndjson
 * Writes: artifacts/image_manifest.json  — { [wpImageUrl]: sanityAssetRef }
 *         artifacts/image_failures.csv   — failed downloads/uploads
 *
 * Process:
 *   1. Scan all records in wp_export.ndjson for image URLs
 *      (featuredMediaUrl + imageUrls[] per record)
 *   2. Deduplicate — each unique WP URL is uploaded exactly once
 *   3. Download each image with retry
 *   4. Upload to Sanity via client.assets.upload()
 *   5. Write manifest: { wpUrl → sanityAssetRef }
 *   6. Log failures to image_failures.csv (never halt on failure)
 *
 * Special case: knowledge graph SVG image(s) are flagged explicitly.
 *   Any URL containing /wp-content/uploads/ AND ending in .svg is
 *   logged to image_manifest.json with a "PRIORITY_SVG" flag.
 *
 * Usage:
 *   node scripts/migrate/images.js
 *   pnpm migrate:images   (from repo root)
 *
 * Requirements:
 *   VITE_SANITY_PROJECT_ID, VITE_SANITY_DATASET, SANITY_AUTH_TOKEN env vars
 *   artifacts/wp_export.ndjson must exist (run migrate:export first)
 */

import { resolve } from 'path'
import { Readable } from 'stream'
import {
  banner, section, ok, warn, info, fail,
  buildSanityClient, readNdjson,
  writeJson, writeCsv, ensureDir, readJson,
  ARTIFACTS_DIR,
} from './lib.js'

const EXPORT_FILE   = resolve(ARTIFACTS_DIR, 'wp_export.ndjson')
const MANIFEST_FILE = resolve(ARTIFACTS_DIR, 'image_manifest.json')
const FAILURES_FILE = resolve(ARTIFACTS_DIR, 'image_failures.csv')

const FAILURE_COLUMNS = ['wpId', 'docType', 'imageUrl', 'fieldContext', 'failureReason']

const DOWNLOAD_TIMEOUT_MS = 30_000
const MAX_RETRIES         = 2
const RETRY_DELAY_MS      = 1_000

// ─── Image collection ─────────────────────────────────────────────────────────

function collectImages(records) {
  // Map: wpImageUrl → { wpId, docType, fieldContext, isPrioritySvg }
  const images = new Map()

  for (const record of records) {
    if (!record.sanityType) continue

    const addImage = (url, fieldContext) => {
      if (!url || url.startsWith('data:')) return
      if (!images.has(url)) {
        const isPrioritySvg =
          url.includes('/wp-content/uploads/') && url.toLowerCase().endsWith('.svg')
        images.set(url, {
          wpId: record.wpId,
          docType: record.sanityType,
          fieldContext,
          isPrioritySvg,
        })
      }
    }

    if (record.featuredMediaUrl) addImage(record.featuredMediaUrl, 'featuredImage')
    for (const url of record.imageUrls ?? []) addImage(url, 'bodyContent')
  }

  return images
}

// ─── Download + upload ────────────────────────────────────────────────────────

async function downloadBuffer(url, attempt = 0) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'sugartown-migration/1.0 (image-transfer)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
    const buf = await res.arrayBuffer()
    return { buf: Buffer.from(buf), contentType: res.headers.get('content-type') ?? 'image/jpeg' }
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

function guessFilename(url) {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/')
    return parts[parts.length - 1] || 'image.jpg'
  } catch {
    return 'image.jpg'
  }
}

async function uploadToSanity(client, buf, contentType, filename) {
  const stream = Readable.from(buf)
  const asset = await client.assets.upload('image', stream, {
    filename,
    contentType,
  })
  return asset._id  // e.g. "image-abc123-800x600-jpg"
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  banner('Sugartown — Image Migration (Step 2b of 5)')

  const records = readNdjson(EXPORT_FILE)
  if (!records.length) {
    fail(`No records found in ${EXPORT_FILE}`)
    fail('Run migrate:export first')
    process.exit(1)
  }

  info(`Loaded ${records.length} records from wp_export.ndjson`)
  ensureDir(ARTIFACTS_DIR)

  // Load existing manifest for resumability — already-uploaded images are skipped
  const manifest = readJson(MANIFEST_FILE) ?? {}
  const failures = []

  // Collect all unique image URLs
  const images = collectImages(records)
  info(`Found ${images.size} unique image URL(s) across all records`)

  const prioritySvgs = [...images.entries()].filter(([, m]) => m.isPrioritySvg)
  if (prioritySvgs.length) {
    section(`Priority SVGs (${prioritySvgs.length}) — knowledge graph / special assets`)
    for (const [url] of prioritySvgs) info(`  ⭐  ${url}`)
  }

  const client = buildSanityClient()

  section('Downloading & uploading images')

  let done = 0
  let skipped = 0
  let failed = 0

  for (const [url, meta] of images.entries()) {
    // Already in manifest (resumable)
    if (manifest[url]) {
      skipped++
      continue
    }

    const filename = guessFilename(url)
    process.stdout.write(`   [${done + skipped + failed + 1}/${images.size}] ${filename}... `)

    try {
      const { buf, contentType } = await downloadBuffer(url)
      const assetId = await uploadToSanity(client, buf, contentType, filename)
      manifest[url] = {
        sanityAssetRef: assetId,
        isPrioritySvg: meta.isPrioritySvg ?? false,
        originalUrl: url,
      }
      console.log('✅')
      done++
    } catch (err) {
      console.log('❌')
      warn(`  Failed: ${err.message}`)
      failures.push({
        wpId:          meta.wpId,
        docType:       meta.docType,
        imageUrl:      url,
        fieldContext:  meta.fieldContext,
        failureReason: err.message,
      })
      failed++
    }

    // Write manifest incrementally — safe to interrupt and resume
    if ((done + failed) % 10 === 0) {
      writeJson(MANIFEST_FILE, manifest)
    }
  }

  // Final manifest write
  writeJson(MANIFEST_FILE, manifest)

  // Write failures CSV (always, even if empty — acceptance criteria requires it)
  writeCsv(FAILURES_FILE, failures, FAILURE_COLUMNS)

  section('Summary')
  ok(`${done} image(s) uploaded to Sanity asset store`)
  if (skipped) info(`   ↩️   ${skipped} already in manifest (skipped)`)
  if (failed) {
    warn(`${failed} image(s) failed — see ${FAILURES_FILE}`)
    warn('Review failures before cutover. All failures must be reviewed and accepted.')
  } else {
    ok('image_failures.csv is empty — all images migrated successfully')
  }

  const priorityInManifest = Object.values(manifest).filter((v) => v.isPrioritySvg)
  if (priorityInManifest.length) {
    ok(`${priorityInManifest.length} priority SVG(s) confirmed in manifest`)
  }

  ok(`Manifest written: ${MANIFEST_FILE}`)
  info('\nNext step: pnpm migrate:transform')
  console.log('══════════════════════════════════════════════\n')
}

main().catch((err) => {
  fail(`Unexpected error: ${err.message}`)
  console.error(err)
  process.exit(1)
})
