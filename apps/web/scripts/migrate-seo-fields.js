#!/usr/bin/env node
/**
 * migrate-seo-fields.js — One-time migration: seo.metaTitle/metaDescription → seo.title/seo.description
 *
 * Background:
 *   The WP migration import script wrote SEO data into `seo.metaTitle` and `seo.metaDescription`
 *   on all imported documents. The canonical seoMetadata schema uses `seo.title` and
 *   `seo.description` instead. This created "Unknown fields found" warnings in Sanity Studio
 *   for all 62 affected documents.
 *
 * What this script does:
 *   For each affected document (where seo.metaTitle or seo.metaDescription exists):
 *
 *   CASE A — has a meaningful seo.metaDescription (non-empty after trimming):
 *     - Set seo.title  = seo.metaTitle  (keep as manual override)
 *     - Set seo.description = seo.metaDescription (keep as manual override; HTML will be
 *       stripped by resolveSeo's normaliseDescription at render time)
 *     - Set seo.autoGenerate = false  (these were intentional overrides from WP Yoast/AIOSEO)
 *     - Unset seo.metaTitle, seo.metaDescription
 *
 *   CASE B — seo.metaDescription is empty (pages with only a title suffix, no real description):
 *     - Leave seo.title and seo.description unset (auto-resolver handles title generation)
 *     - Set seo.autoGenerate = true  (explicit, not implicit)
 *     - Unset seo.metaTitle, seo.metaDescription
 *
 * For drafts (drafts.*) only the draft is patched, not the published version separately.
 * For published docs, patching the published ID creates a draft with the changes.
 *
 * Usage:
 *   node apps/web/scripts/migrate-seo-fields.js          # dry-run (default)
 *   node apps/web/scripts/migrate-seo-fields.js --execute  # live writes
 *
 * Requires SANITY_AUTH_TOKEN (write-capable) in apps/web/.env
 */

import {readFileSync} from 'fs'
import {createClient} from '@sanity/client'

// ─── Config ─────────────────────────────────────────────────────────────────

const DRY_RUN = !process.argv.includes('--execute')

// Resolve .env relative to this script's location: scripts/ → web/ → .env
const envPath = new URL('../.env', import.meta.url).pathname
const env = readFileSync(envPath, 'utf8')
// Use the write-capable auth token; VITE_SANITY_TOKEN is read-only (viewer)
const token = env.match(/SANITY_AUTH_TOKEN=(.+)/)?.[1]?.trim()
if (!token) {
  console.error('ERROR: SANITY_AUTH_TOKEN not found in apps/web/.env')
  process.exit(1)
}

const client = createClient({
  projectId: 'poalmzla',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

// ─── HTML entity decoder (minimal — for stripping WP HTML entities from descriptions) ──

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8230;/g, '\u2026')
    .replace(/&#038;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function cleanText(str) {
  return decodeHtmlEntities(stripHtml(str ?? '')).trim()
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n─── SEO Field Migration ─────────────────────────────────────`)
  console.log(`    Mode: ${DRY_RUN ? 'DRY RUN (pass --execute to apply)' : '⚠️  EXECUTE — writing to Sanity production'}`)
  console.log()

  // Fetch all docs (raw perspective = published + drafts) with legacy seo sub-fields
  const docs = await client.fetch(
    `*[defined(seo.metaTitle) || defined(seo.metaDescription)] {
      _id, _type, title,
      "seoMetaTitle": seo.metaTitle,
      "seoMetaDescription": seo.metaDescription,
      "seoTitle": seo.title,
      "seoDesc": seo.description,
      "seoAutoGenerate": seo.autoGenerate
    }`,
    {},
    {perspective: 'raw'}
  )

  console.log(`Found ${docs.length} documents to migrate.\n`)

  let caseA = 0
  let caseB = 0
  let skipped = 0

  for (const doc of docs) {
    const isDraft = doc._id.startsWith('drafts.')
    const rawDesc = doc.seoMetaDescription ?? ''
    const cleanedDesc = cleanText(rawDesc)
    const cleanedTitle = cleanText(doc.seoMetaTitle ?? '')
    const hasRealDesc = cleanedDesc.length > 0

    console.log(`  [${doc._type}] ${doc._id}${isDraft ? ' (draft)' : ''}`)
    console.log(`    title:       ${doc.title?.slice(0, 60)}`)
    console.log(`    metaTitle:   ${cleanedTitle.slice(0, 70)}`)
    console.log(`    metaDesc:    ${cleanedDesc.slice(0, 70) || '(empty)'}`)

    // Skip if canonical seo.title or seo.description already set — don't overwrite manual edits
    if (doc.seoTitle || doc.seoDesc) {
      console.log(`    → SKIP: canonical seo.title/seo.description already set`)
      skipped++
      console.log()
      continue
    }

    if (hasRealDesc) {
      // CASE A: has real description — migrate as manual override
      console.log(`    → CASE A: migrate to seo.title + seo.description, autoGenerate: false`)
      caseA++

      if (!DRY_RUN) {
        await client
          .patch(doc._id)
          .set({
            'seo.title': cleanedTitle,
            'seo.description': cleanedDesc.slice(0, 300), // safety cap; normaliseDescription truncates at render
            'seo.autoGenerate': false,
          })
          .unset(['seo.metaTitle', 'seo.metaDescription'])
          .commit()
        console.log(`    ✅ patched`)
      } else {
        console.log(`    [dry-run] would set seo.title, seo.description, seo.autoGenerate=false; unset metaTitle/metaDesc`)
      }
    } else {
      // CASE B: description is empty — clean up stale fields, keep autoGenerate: true
      console.log(`    → CASE B: description empty — unset stale fields, set autoGenerate: true`)
      caseB++

      if (!DRY_RUN) {
        await client
          .patch(doc._id)
          .set({'seo.autoGenerate': true})
          .unset(['seo.metaTitle', 'seo.metaDescription'])
          .commit()
        console.log(`    ✅ patched`)
      } else {
        console.log(`    [dry-run] would unset metaTitle/metaDesc, set seo.autoGenerate=true`)
      }
    }

    console.log()
  }

  console.log(`─── Summary ─────────────────────────────────────────────────`)
  console.log(`  Total docs:  ${docs.length}`)
  console.log(`  Case A (migrate to manual override): ${caseA}`)
  console.log(`  Case B (empty desc, set auto=true):  ${caseB}`)
  console.log(`  Skipped (canonical fields already set): ${skipped}`)
  if (DRY_RUN) {
    console.log(`\n  DRY RUN — no changes made. Re-run with --execute to apply.`)
  } else {
    console.log(`\n  Done. ${caseA + caseB} documents patched.`)
  }
  console.log()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
