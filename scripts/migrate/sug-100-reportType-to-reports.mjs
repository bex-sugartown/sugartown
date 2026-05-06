#!/usr/bin/env node
/**
 * scripts/migrate/sug-100-reportType-to-reports.mjs
 *
 * SUG-100: migrate trustReportSection.reportType (single string) →
 *          trustReportSection.reports (array of strings)
 *
 * For every document whose sections[] contains a trustReportSection with
 * reportType set and reports absent/null, patch that section:
 *   - reports: [reportType]   (wrap old value in array)
 *   - reportType: null        (null the legacy field; field stays hidden in Studio)
 *
 * Idempotent: sections that already have reports[] set are skipped.
 * Run with --execute to write. Default is dry-run.
 *
 * Expected target count: 7 sections across 4 documents (2 published, 2 drafts).
 */

import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT  = resolve(__dirname, '../../')
const EXECUTE    = process.argv.includes('--execute')

// ── Env loading ───────────────────────────────────────────────────────────────

function loadEnv() {
  for (const p of [resolve(REPO_ROOT, 'apps/web/.env'), resolve(REPO_ROOT, '.env')]) {
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq === -1) continue
      const k = t.slice(0, eq).trim()
      const v = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
      if (k && !(k in process.env)) process.env[k] = v
    }
  }
}

loadEnv()

const client = createClient({
  projectId:  process.env.VITE_SANITY_PROJECT_ID ?? 'poalmzla',
  dataset:    process.env.VITE_SANITY_DATASET    ?? 'production',
  apiVersion: '2024-01-01',
  token:      process.env.SANITY_AUTH_TOKEN,
  useCdn:     false,
})

// ── Query ─────────────────────────────────────────────────────────────────────

const query = `
  *[_type in ["page","article","caseStudy","node"] && defined(sections)] {
    _id,
    _type,
    "slug": slug.current,
    "sections": sections[_type == "trustReportSection" && defined(reportType) && !defined(reports)] {
      _key,
      reportType,
      reports
    }
  }[count(sections) > 0]
`

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n── SUG-100 trustReportSection migration ──────────────────────────`)
  console.log(`   Mode: ${EXECUTE ? '⚡ EXECUTE' : '🔍 DRY RUN (pass --execute to write)'}`)
  console.log(`   Project: ${process.env.VITE_SANITY_PROJECT_ID ?? 'poalmzla'} / production\n`)

  const docs = await client.fetch(query)

  if (docs.length === 0) {
    console.log('✅ No documents to migrate — already clean.\n')
    return
  }

  let totalSections = 0
  for (const doc of docs) totalSections += doc.sections.length

  console.log(`Found ${docs.length} document(s) with ${totalSections} section(s) to migrate:\n`)
  for (const doc of docs) {
    for (const sec of doc.sections) {
      console.log(`  ${doc._id} (${doc._type}/${doc.slug ?? '—'}) key=${sec._key} reportType=${sec.reportType}`)
    }
  }

  if (!EXECUTE) {
    console.log(`\n──── DRY RUN COMPLETE — no changes written ────────────────────────`)
    console.log(`     Run with --execute to apply ${totalSections} patch(es).`)
    return
  }

  console.log(`\nApplying patches…`)

  // 5-second abort window
  console.log('  ⚠️  Writing in 5 seconds — Ctrl+C to abort')
  await new Promise(r => setTimeout(r, 5000))

  let patched = 0
  let errors  = 0

  for (const doc of docs) {
    for (const sec of doc.sections) {
      try {
        // Use setIfMissing to initialise sections array, then set per-key fields
        await client
          .patch(doc._id)
          .set({
            [`sections[_key == "${sec._key}"].reports`]:    [sec.reportType],
            [`sections[_key == "${sec._key}"].reportType`]: null,
          })
          .commit({ autoGenerateArrayKeys: false })
        console.log(`  ✅ ${doc._id} key=${sec._key} → reports: ["${sec.reportType}"]`)
        patched++
      } catch (err) {
        console.error(`  ❌ ${doc._id} key=${sec._key}: ${err.message}`)
        errors++
      }
    }
  }

  console.log(`\n── Migration complete ────────────────────────────────────────────`)
  console.log(`   Patched: ${patched}  Errors: ${errors}`)

  if (errors > 0) {
    console.log('\n⚠️  Some patches failed — review errors above before proceeding.')
    process.exit(1)
  }

  // Idempotency check
  console.log('\nRunning idempotency check…')
  const remaining = await client.fetch(query)
  if (remaining.length === 0) {
    console.log('✅ Idempotency confirmed — re-run would patch 0 documents.\n')
  } else {
    console.log(`⚠️  ${remaining.length} document(s) still match — migration may not have completed fully.`)
    process.exit(1)
  }
}

run().catch(err => { console.error(err); process.exit(1) })
