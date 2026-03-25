#!/usr/bin/env node
/**
 * backfill-hero-sections.js
 *
 * Ensures every section-based document (article, caseStudy, node, page) has a
 * heroSection as sections[0]. Documents that already have one are skipped.
 *
 * For documents missing a hero, a minimal heroSection is prepended with:
 *   - heading: copied from the document's `title` field
 *   - no backgroundImage (imageless hero)
 *
 * Usage:
 *   node scripts/migrate/backfill-hero-sections.js --dry-run   # preview changes
 *   node scripts/migrate/backfill-hero-sections.js --execute    # apply changes
 *
 * SUG-33 — Detail Page Hero & Metadata Refinement
 */

import { buildSanityClient } from './lib.js'
import { randomUUID } from 'crypto'

const DETAIL_TYPES = ['article', 'caseStudy', 'node', 'page']
const HERO_TYPES = new Set(['heroSection', 'hero'])

const mode = process.argv[2]
if (!['--dry-run', '--execute'].includes(mode)) {
  console.log('Usage: node scripts/migrate/backfill-hero-sections.js [--dry-run | --execute]')
  process.exit(1)
}

const dryRun = mode === '--dry-run'
const client = buildSanityClient()

async function run() {
  console.log(`\n🔍  Scanning ${DETAIL_TYPES.join(', ')} documents for missing hero sections...\n`)

  // Fetch all detail docs with their title, sections[0]._type, and _id
  const docs = await client.fetch(`
    *[_type in $types] {
      _id,
      _type,
      title,
      "firstSectionType": sections[0]._type,
      "sectionCount": count(sections)
    } | order(_type asc, title asc)
  `, { types: DETAIL_TYPES })

  const needsHero = []
  const alreadyHasHero = []
  const noSections = []

  for (const doc of docs) {
    if (doc.firstSectionType && HERO_TYPES.has(doc.firstSectionType)) {
      alreadyHasHero.push(doc)
    } else {
      needsHero.push(doc)
      if (!doc.sectionCount) noSections.push(doc)
    }
  }

  console.log(`📊  Total documents: ${docs.length}`)
  console.log(`   ✅  Already have hero: ${alreadyHasHero.length}`)
  console.log(`   ⚠️   Need hero added:  ${needsHero.length}`)
  if (noSections.length) {
    console.log(`   📭  No sections array: ${noSections.length} (will create array with hero)`)
  }

  if (needsHero.length === 0) {
    console.log('\n✅  All documents already have hero sections. Nothing to do.\n')
    return
  }

  console.log('\nDocuments that need a hero section:')
  console.log('─'.repeat(80))
  for (const doc of needsHero) {
    const title = doc.title || '(untitled)'
    const sections = doc.sectionCount ?? 0
    console.log(`  [${doc._type}] ${title}  (${sections} sections)`)
  }
  console.log('─'.repeat(80))

  if (dryRun) {
    console.log(`\n🏜️   DRY RUN — no changes made. Run with --execute to apply.\n`)
    return
  }

  // Execute: prepend heroSection to each document's sections array
  console.log(`\n🚀  Prepending hero sections to ${needsHero.length} documents...\n`)

  let success = 0
  let errors = 0

  for (const doc of needsHero) {
    const heroSection = {
      _type: 'heroSection',
      _key: randomUUID().slice(0, 12),
      heading: doc.title || 'Untitled',
    }

    try {
      if (doc.sectionCount) {
        // Has sections array — prepend hero
        await client
          .patch(doc._id)
          .insert('before', 'sections[0]', [heroSection])
          .commit()
      } else {
        // No sections array — create it with hero as sole item
        await client
          .patch(doc._id)
          .set({ sections: [heroSection] })
          .commit()
      }

      success++
      console.log(`  ✅  [${doc._type}] ${doc.title}`)
    } catch (err) {
      errors++
      console.error(`  ❌  [${doc._type}] ${doc.title}: ${err.message}`)
    }
  }

  console.log(`\n📋  Results: ${success} updated, ${errors} errors\n`)
}

run().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
