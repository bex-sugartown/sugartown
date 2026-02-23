#!/usr/bin/env node
/**
 * migrate:featured-to-hero — Migrate featuredImage → hero section
 *
 * For each document of type `article` and `caseStudy` that has a `featuredImage`
 * field, this script resolves one of four cases and acts accordingly:
 *
 *   CASE 1 — featuredImage present, sections[] already has a hero at index 0
 *            → SKIP (hero already exists; do not duplicate or overwrite)
 *
 *   CASE 2 — featuredImage present, sections[] exists but NO hero at index 0
 *            → PREPEND a new heroSection to sections[], using featuredImage as
 *              backgroundImage. Remove featuredImage from the document.
 *
 *   CASE 3 — featuredImage present, sections[] is absent or empty
 *            → CREATE sections[] with a single heroSection containing the image.
 *              Remove featuredImage from the document.
 *
 *   CASE 4 — featuredImage absent or null
 *            → SKIP (nothing to migrate)
 *
 * Idempotency: running the script twice produces no additional changes.
 *   - CASE 1 is the idempotent guard: a doc with an existing hero is never touched.
 *   - CASE 4 covers docs already processed (featuredImage unset by a prior run).
 *
 * Usage:
 *   node scripts/migrate/featured-to-hero.js            # dry-run (no writes)
 *   node scripts/migrate/featured-to-hero.js --execute  # live writes to Sanity
 *   pnpm migrate:featured-to-hero                       # dry-run
 *   pnpm migrate:featured-to-hero -- --execute          # live writes
 *
 * Exit codes:
 *   0 — completed (including dry-runs with zero errors)
 *   1 — one or more documents hit CASE 1 SKIP in execute mode
 *       (these need manual review — they have both featuredImage AND a hero section)
 */

// nanoid may not be installed at root — fall back to a random ID generator
const { nanoid } = await import('nanoid').catch(() => ({
  nanoid: () => Math.random().toString(36).slice(2, 11)
}))
import {
  banner, section, ok, warn, fail, info,
  buildSanityClient,
} from './lib.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const DOC_TYPES = ['article', 'caseStudy']
const HERO_TYPES = ['heroSection', 'hero']
const EXECUTE = process.argv.includes('--execute')

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all published + draft documents of a given type that have featuredImage defined.
 * We target drafts too so that unpublished docs are also migrated.
 */
const buildQuery = (docType) => `
  *[_type == "${docType}"] {
    _id,
    _type,
    _rev,
    "hasFeaturedImage": defined(featuredImage) && featuredImage != null,
    featuredImage {
      asset,
      alt,
      caption,
      credit,
      crop,
      hotspot
    },
    "sectionsCount": count(sections),
    "firstSectionType": sections[0]._type,
    "hasHeroAtIndex0": sections[0]._type in ${JSON.stringify(HERO_TYPES)}
  }
`

// ─── Case classification ──────────────────────────────────────────────────────

/**
 * Classify a document into one of 4 migration cases.
 *
 * @param {object} doc — projected Sanity document
 * @returns {'CASE1_SKIP_HAS_HERO' | 'CASE2_PREPEND_HERO' | 'CASE3_CREATE_SECTIONS' | 'CASE4_SKIP_NO_IMAGE'}
 */
function classifyDoc(doc) {
  const hasFeaturedImage = Boolean(doc.hasFeaturedImage && doc.featuredImage?.asset)

  if (!hasFeaturedImage) return 'CASE4_SKIP_NO_IMAGE'

  if (doc.hasHeroAtIndex0) return 'CASE1_SKIP_HAS_HERO'

  if (doc.sectionsCount > 0) return 'CASE2_PREPEND_HERO'

  return 'CASE3_CREATE_SECTIONS'
}

// ─── Patch builders ───────────────────────────────────────────────────────────

/**
 * Build a heroSection object from a featuredImage field value.
 * The featuredImage becomes the hero's backgroundImage.
 */
function buildHeroSection(featuredImage) {
  return {
    _type: 'heroSection',
    _key: nanoid(),
    backgroundImage: {
      _type: 'image',
      asset: featuredImage.asset,
      ...(featuredImage.alt !== undefined && { alt: featuredImage.alt }),
      ...(featuredImage.caption !== undefined && { caption: featuredImage.caption }),
      ...(featuredImage.crop !== undefined && { crop: featuredImage.crop }),
      ...(featuredImage.hotspot !== undefined && { hotspot: featuredImage.hotspot }),
    },
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  banner(`Sugartown — Featured Image → Hero Section Refactor${EXECUTE ? ' [EXECUTE MODE]' : ' [DRY RUN]'}`)

  const client = buildSanityClient()

  // ── Fetch all candidate documents ─────────────────────────────────────────

  section('Fetching documents')

  const allDocs = []
  for (const docType of DOC_TYPES) {
    const docs = await client.fetch(buildQuery(docType))
    info(`${docType}: ${docs.length} total document(s) fetched`)
    allDocs.push(...docs)
  }

  info(`Total documents fetched: ${allDocs.length}`)

  // ── Classify ───────────────────────────────────────────────────────────────

  section('Classifying documents')

  const classified = {
    CASE1_SKIP_HAS_HERO: [],
    CASE2_PREPEND_HERO: [],
    CASE3_CREATE_SECTIONS: [],
    CASE4_SKIP_NO_IMAGE: [],
  }

  for (const doc of allDocs) {
    const caseKey = classifyDoc(doc)
    classified[caseKey].push(doc)
  }

  // ── Pre-execution summary ──────────────────────────────────────────────────

  section('Pre-execution Summary')
  info(`CASE 1 — SKIP (has hero already):      ${classified.CASE1_SKIP_HAS_HERO.length}`)
  info(`CASE 2 — PREPEND hero to sections[]:   ${classified.CASE2_PREPEND_HERO.length}`)
  info(`CASE 3 — CREATE sections[] with hero:  ${classified.CASE3_CREATE_SECTIONS.length}`)
  info(`CASE 4 — SKIP (no featuredImage):      ${classified.CASE4_SKIP_NO_IMAGE.length}`)
  console.log()

  const totalToModify = classified.CASE2_PREPEND_HERO.length + classified.CASE3_CREATE_SECTIONS.length

  if (totalToModify === 0) {
    ok('Nothing to migrate. All documents are already in the desired state.')
    printClosing({ processed: allDocs.length, modified: 0, skipped: allDocs.length, errors: 0 })
    process.exit(0)
  }

  // ── Abort window ───────────────────────────────────────────────────────────

  if (EXECUTE) {
    warn(`About to write ${totalToModify} document(s) to Sanity. Ctrl-C to abort.`)
    await countdown(5)
  } else {
    info('DRY RUN — no writes will be made. Pass --execute to apply changes.')
  }

  // ── Execute ────────────────────────────────────────────────────────────────

  section(EXECUTE ? 'Executing patches' : 'Dry-run log (no changes written)')

  const results = { processed: 0, modified: 0, skipped: 0, errors: 0 }
  const manualReviewIds = []

  // CASE 1 — skip (has hero already + has featuredImage → needs manual review in execute mode)
  for (const doc of classified.CASE1_SKIP_HAS_HERO) {
    results.processed++
    results.skipped++
    const label = EXECUTE ? '⚠️  SKIP — manual review required' : '⚠️  CASE 1 SKIP'
    warn(`[${doc._type}] ${doc._id} → ${label} (has featuredImage AND hero at sections[0])`)
    manualReviewIds.push(doc._id)
  }

  // CASE 2 — prepend hero to existing sections[]
  for (const doc of classified.CASE2_PREPEND_HERO) {
    results.processed++
    const hero = buildHeroSection(doc.featuredImage)
    const action = `PREPEND heroSection to sections[] + unset featuredImage`
    try {
      if (EXECUTE) {
        await client
          .patch(doc._id)
          .unset(['featuredImage'])
          .insert('before', 'sections[0]', [hero])
          .commit({ autoGenerateArrayKeys: false })
        ok(`[${doc._type}] ${doc._id} → ${action}`)
      } else {
        info(`[${doc._type}] ${doc._id} → [DRY] ${action}`)
      }
      results.modified++
    } catch (err) {
      fail(`[${doc._type}] ${doc._id} → ERROR: ${err.message}`)
      results.errors++
    }
  }

  // CASE 3 — create sections[] with a single hero
  for (const doc of classified.CASE3_CREATE_SECTIONS) {
    results.processed++
    const hero = buildHeroSection(doc.featuredImage)
    const action = `SET sections[] = [heroSection] + unset featuredImage`
    try {
      if (EXECUTE) {
        await client
          .patch(doc._id)
          .unset(['featuredImage'])
          .set({ sections: [hero] })
          .commit({ autoGenerateArrayKeys: false })
        ok(`[${doc._type}] ${doc._id} → ${action}`)
      } else {
        info(`[${doc._type}] ${doc._id} → [DRY] ${action}`)
      }
      results.modified++
    } catch (err) {
      fail(`[${doc._type}] ${doc._id} → ERROR: ${err.message}`)
      results.errors++
    }
  }

  // CASE 4 — already clean, log quietly
  for (const doc of classified.CASE4_SKIP_NO_IMAGE) {
    results.processed++
    results.skipped++
    // Quiet — no log spam for already-clean docs
  }

  // ── Final summary ──────────────────────────────────────────────────────────

  printClosing(results)

  if (EXECUTE && manualReviewIds.length > 0) {
    section('Manual Review Required')
    fail(`${manualReviewIds.length} document(s) have BOTH a featuredImage AND an existing hero section.`)
    fail('These were NOT modified. Resolve manually in Sanity Studio:')
    for (const id of manualReviewIds) {
      fail(`  → ${id}`)
    }
    process.exit(1)
  }

  if (results.errors > 0) {
    process.exit(1)
  }

  process.exit(0)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function printClosing({ processed, modified, skipped, errors }) {
  section('Final Summary')
  info(`Total processed: ${processed}`)
  info(`Total modified:  ${modified}`)
  info(`Total skipped:   ${skipped}`)
  info(`Total errors:    ${errors}`)
  console.log()
  if (errors === 0 && modified >= 0) {
    ok(EXECUTE ? 'Migration complete.' : 'Dry run complete — no changes written.')
  } else {
    fail('Migration completed with errors — review output above.')
  }
  console.log('══════════════════════════════════════════════\n')
}

async function countdown(seconds) {
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(`\r   Executing in ${i}s... `)
    await new Promise((r) => setTimeout(r, 1000))
  }
  process.stdout.write('\r   Executing now...     \n')
}

main().catch((err) => {
  fail(`Unexpected error: ${err.message}`)
  console.error(err)
  process.exit(1)
})
