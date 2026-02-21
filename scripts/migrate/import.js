#!/usr/bin/env node
/**
 * migrate:import — Step 3: Import transformed documents into Sanity
 *
 * Reads:  artifacts/sanity_import.ndjson  (from migrate:transform)
 * Writes: Sanity dataset (production by default)
 *
 * Method: batch mutations via @sanity/client
 *   - Uses createOrReplace() — idempotent; safe to re-run
 *   - All documents imported as PUBLISHED (WP published content → Sanity published)
 *   - WP drafts are excluded by the export step (status: publish filter)
 *   - Batch size: 50 documents per transaction (Sanity limit: 250 mutations per call)
 *
 * Why batch mutations instead of `sanity dataset import` CLI?
 *   - `sanity dataset import` requires a .tar.gz archive with specific structure
 *   - Batch mutations let us control published vs draft state explicitly
 *   - We can log per-document failures without aborting the whole run
 *   - Idempotent via createOrReplace — safe to re-run after fixing issues
 *
 * Usage:
 *   node scripts/migrate/import.js
 *   pnpm migrate:import   (from repo root)
 *
 * Requirements:
 *   VITE_SANITY_PROJECT_ID, VITE_SANITY_DATASET, SANITY_AUTH_TOKEN (write token)
 *   artifacts/sanity_import.ndjson must exist (run migrate:transform first)
 */

import { resolve } from 'path'
import {
  banner, section, ok, warn, info, fail,
  buildSanityClient, readNdjson,
  ARTIFACTS_DIR,
} from './lib.js'

const INPUT_FILE = resolve(ARTIFACTS_DIR, 'sanity_import.ndjson')

const BATCH_SIZE = 50  // documents per transaction

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  banner('Sugartown — Import (Step 3 of 5)')

  const docs = readNdjson(INPUT_FILE)
  if (!docs.length) {
    fail(`No documents found at ${INPUT_FILE}`)
    fail('Run migrate:transform first')
    process.exit(1)
  }

  info(`Loaded ${docs.length} documents from sanity_import.ndjson`)

  // Sanity-type guard: ensure no _type === "post" slips through
  const postTypeDocs = docs.filter((d) => d._type === 'post')
  if (postTypeDocs.length) {
    fail(`FATAL: ${postTypeDocs.length} document(s) have _type === "post"`)
    fail('This is a migration bug. Fix transform.js before importing.')
    fail('Affected _ids: ' + postTypeDocs.map((d) => d._id).join(', '))
    process.exit(1)
  }

  const client = buildSanityClient()

  section('Import configuration')
  info(`Project:   ${process.env.VITE_SANITY_PROJECT_ID}`)
  info(`Dataset:   ${process.env.VITE_SANITY_DATASET ?? 'production'}`)
  info(`Documents: ${docs.length}`)
  info(`Batch size: ${BATCH_SIZE}`)
  info(`Strategy:  createOrReplace (idempotent — safe to re-run)`)
  info(`State:     published (WP published → Sanity published)`)

  // Confirm before writing
  info('\n⚠️  This will write to the Sanity PRODUCTION dataset.')
  info('    Ctrl+C within 3 seconds to abort...')
  await new Promise((r) => setTimeout(r, 3000))

  section('Importing documents')

  // Split into batches
  const batches = []
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    batches.push(docs.slice(i, i + BATCH_SIZE))
  }

  let totalImported = 0
  let totalFailed = 0
  const failedDocs = []

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx]
    const batchNum = batchIdx + 1
    process.stdout.write(`   Batch ${batchNum}/${batches.length} (${batch.length} docs)... `)

    try {
      const transaction = client.transaction()
      for (const doc of batch) {
        transaction.createOrReplace(doc)
      }
      await transaction.commit()
      totalImported += batch.length
      console.log('✅')
    } catch (err) {
      console.log('❌')
      warn(`Batch ${batchNum} failed: ${err.message}`)
      warn('Falling back to individual document imports for this batch...')

      // Try each document individually to isolate failures
      for (const doc of batch) {
        try {
          await client.createOrReplace(doc)
          totalImported++
        } catch (docErr) {
          warn(`  Failed _id=${doc._id} _type=${doc._type}: ${docErr.message}`)
          failedDocs.push({ _id: doc._id, _type: doc._type, error: docErr.message })
          totalFailed++
        }
      }
    }
  }

  section('Summary')
  ok(`${totalImported} document(s) imported successfully`)
  if (totalFailed) {
    warn(`${totalFailed} document(s) failed:`)
    for (const d of failedDocs) warn(`  ${d._id} (${d._type}): ${d.error}`)
  } else {
    ok('Zero import failures')
  }

  info('\nNext step: pnpm migrate:parity (validate) then pnpm migrate:redirects')
  console.log('══════════════════════════════════════════════\n')
}

main().catch((err) => {
  fail(`Unexpected error: ${err.message}`)
  console.error(err)
  process.exit(1)
})
