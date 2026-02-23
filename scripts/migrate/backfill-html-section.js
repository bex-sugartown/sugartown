#!/usr/bin/env node
/**
 * migrate:backfill-html-section
 *
 * For every document of type page, article, caseStudy, or node that has a
 * non-empty legacySource.legacyHtml field AND does NOT already contain an
 * htmlSection in sections[], this script appends a new htmlSection.
 *
 * If sections[] does not exist yet it is created automatically via setIfMissing.
 *
 * Idempotent: running twice produces no additional changes (the existing-htmlSection
 * check prevents double-appending).
 *
 * Usage:
 *   node scripts/migrate/backfill-html-section.js             # dry-run (no writes)
 *   node scripts/migrate/backfill-html-section.js --execute   # live writes
 *   pnpm migrate:backfill-html-section                        # dry-run
 *   pnpm migrate:backfill-html-section -- --execute           # live writes
 *
 * Summary output:
 *   X documents patched
 *   Y skipped (no legacySource.legacyHtml)
 *   Z skipped (htmlSection already exists in sections[])
 */

// nanoid may not be installed at root — fall back to a random ID generator
const { nanoid } = await import('nanoid').catch(() => ({
  nanoid: () => Math.random().toString(36).slice(2, 11)
}))
import {
  banner, section, ok, warn, info, fail,
  buildSanityClient,
} from './lib.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const DOC_TYPES = ['page', 'article', 'caseStudy', 'node']
const EXECUTE = process.argv.includes('--execute')

// ─── Query ────────────────────────────────────────────────────────────────────

/**
 * Fetch all documents (published + draft) of a given type.
 * We project only what we need for classification.
 */
const buildQuery = (docType) => `
  *[_type == "${docType}"] {
    _id,
    _type,
    "legacyHtml": legacySource.legacyHtml,
    "hasSections": defined(sections) && sections != null,
    "sectionsCount": count(sections),
    "hasHtmlSection": count(sections[_type == "htmlSection"]) > 0
  }
`

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  banner(`Sugartown — Backfill HTML Section${EXECUTE ? ' [EXECUTE MODE]' : ' [DRY RUN]'}`)

  const client = buildSanityClient()

  // ── Fetch ──────────────────────────────────────────────────────────────────

  section('Fetching documents')

  const allDocs = []
  for (const docType of DOC_TYPES) {
    const docs = await client.fetch(buildQuery(docType))
    info(`${docType}: ${docs.length} total document(s)`)
    allDocs.push(...docs)
  }

  info(`Total fetched: ${allDocs.length}`)

  // ── Classify ───────────────────────────────────────────────────────────────

  const toBackfill = []
  const skippedNoHtml = []
  const skippedAlreadyHasHtmlSection = []

  for (const doc of allDocs) {
    const hasLegacyHtml = typeof doc.legacyHtml === 'string' && doc.legacyHtml.trim().length > 0

    if (!hasLegacyHtml) {
      skippedNoHtml.push(doc)
      continue
    }

    if (doc.hasHtmlSection) {
      skippedAlreadyHasHtmlSection.push(doc)
      continue
    }

    toBackfill.push(doc)
  }

  // ── Pre-execution summary ──────────────────────────────────────────────────

  section('Pre-execution Summary')
  info(`To patch (append htmlSection):          ${toBackfill.length}`)
  info(`Skip — no legacySource.legacyHtml:      ${skippedNoHtml.length}`)
  info(`Skip — htmlSection already in sections: ${skippedAlreadyHasHtmlSection.length}`)
  console.log()

  if (toBackfill.length === 0) {
    ok('Nothing to backfill.')
    printSummary({ patched: 0, skippedNoHtml: skippedNoHtml.length, skippedExists: skippedAlreadyHasHtmlSection.length, errors: 0 })
    process.exit(0)
  }

  if (!EXECUTE) {
    info('DRY RUN — no writes made. Pass --execute to apply changes.')
    for (const doc of toBackfill) {
      info(`[${doc._type}] ${doc._id} → [DRY] append htmlSection ("Migrated HTML (auto-backfilled)")`)
    }
    printSummary({ patched: toBackfill.length, skippedNoHtml: skippedNoHtml.length, skippedExists: skippedAlreadyHasHtmlSection.length, errors: 0 })
    process.exit(0)
  }

  // ── Execute ────────────────────────────────────────────────────────────────

  section('Patching documents')

  let patched = 0
  let errors = 0

  for (const doc of toBackfill) {
    const newSection = {
      _type: 'htmlSection',
      _key: nanoid(),
      html: doc.legacyHtml,
      label: 'Migrated HTML (auto-backfilled)',
    }

    try {
      await client
        .patch(doc._id)
        .setIfMissing({ sections: [] })
        .append('sections', [newSection])
        .commit({ autoGenerateArrayKeys: false })
      ok(`[${doc._type}] ${doc._id} → appended htmlSection`)
      patched++
    } catch (err) {
      fail(`[${doc._type}] ${doc._id} → ERROR: ${err.message}`)
      errors++
    }
  }

  printSummary({ patched, skippedNoHtml: skippedNoHtml.length, skippedExists: skippedAlreadyHasHtmlSection.length, errors })

  process.exit(errors > 0 ? 1 : 0)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function printSummary({ patched, skippedNoHtml, skippedExists, errors }) {
  section('Summary')
  ok(`${patched} document(s) patched`)
  info(`${skippedNoHtml} skipped (no legacySource.legacyHtml)`)
  info(`${skippedExists} skipped (htmlSection already exists in sections[])`)
  if (errors > 0) fail(`${errors} error(s) — review output above`)
  console.log()
  ok(EXECUTE ? 'Backfill complete.' : 'Dry run complete — no changes written.')
  console.log('══════════════════════════════════════════════\n')
}

main().catch((err) => {
  fail(`Unexpected error: ${err.message}`)
  console.error(err)
  process.exit(1)
})
