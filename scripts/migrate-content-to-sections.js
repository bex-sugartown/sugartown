#!/usr/bin/env node
/**
 * migrate-content-to-sections.js — Convert standalone content[] to textSection blocks
 *
 * For node and article documents that have a populated `content` field, this script:
 *   1. Wraps the portable text blocks into a textSection object
 *   2. Appends the textSection to the document's `sections[]` array
 *   3. Clears the `content` field (sets to [])
 *
 * This preserves all portable text content while migrating it into the sections
 * architecture where it renders with consistent typography and spacing.
 *
 * Modes:
 *   --dry-run (default)  Log all changes, write nothing to Sanity
 *   --execute            Apply mutations to Sanity (irreversible — run dry-run first)
 *
 * Usage:
 *   node scripts/migrate-content-to-sections.js                  # dry-run
 *   node scripts/migrate-content-to-sections.js --dry-run        # explicit dry-run
 *   node scripts/migrate-content-to-sections.js --execute        # live — writes to Sanity
 *
 * Environment variables required (reads from apps/web/.env or process.env):
 *   VITE_SANITY_PROJECT_ID
 *   VITE_SANITY_DATASET
 *   VITE_SANITY_API_VERSION
 *   SANITY_AUTH_TOKEN or VITE_SANITY_TOKEN (write token required for --execute)
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const IS_EXECUTE = args.includes('--execute')
const IS_DRY_RUN = !IS_EXECUTE

// ─── Load env ─────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = resolve(__dirname, '../apps/web/.env')
  try {
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env not found — rely on process.env (CI etc.)
  }
}

loadEnv()

// ─── Sanity client ────────────────────────────────────────────────────────────

const projectId = process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.VITE_SANITY_DATASET || 'production'
const apiVersion = process.env.VITE_SANITY_API_VERSION || '2024-01-01'
const token = process.env.SANITY_AUTH_TOKEN || process.env.VITE_SANITY_TOKEN

if (!projectId) {
  console.error('Missing VITE_SANITY_PROJECT_ID')
  process.exit(1)
}

if (IS_EXECUTE && !token) {
  console.error('Missing SANITY_AUTH_TOKEN or VITE_SANITY_TOKEN (required for --execute)')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: IS_EXECUTE ? token : undefined,
  useCdn: false,
})

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`  migrate-content-to-sections`)
  console.log(`  Mode: ${IS_DRY_RUN ? '🔍 DRY RUN' : '🚀 EXECUTE'}`)
  console.log(`  Project: ${projectId} / ${dataset}`)
  console.log(`${'='.repeat(60)}\n`)

  // Find all node and article documents with non-empty content[]
  const query = `*[_type in ["node", "article"] && defined(content) && length(content) > 0]{
    _id,
    _type,
    title,
    "contentBlockCount": length(content),
    "hasSections": defined(sections) && length(sections) > 0,
    "sectionCount": length(sections),
    content
  }`

  const docs = await client.fetch(query)
  console.log(`Found ${docs.length} document(s) with standalone content to migrate\n`)

  if (docs.length === 0) {
    console.log('Nothing to migrate — all clean!')
    return
  }

  let migratedCount = 0
  let skippedCount = 0

  for (const doc of docs) {
    const label = `[${doc._type}] "${doc.title}" (${doc._id})`
    console.log(`\n── ${label}`)
    console.log(`   Content blocks: ${doc.contentBlockCount}`)
    console.log(`   Existing sections: ${doc.sectionCount ?? 0}`)

    // Build a textSection from the content blocks
    const textSection = {
      _type: 'textSection',
      _key: randomUUID().slice(0, 8),
      content: doc.content,
    }

    const existingSections = doc.hasSections ? undefined : []

    if (IS_DRY_RUN) {
      console.log(`   → Would create textSection with ${doc.contentBlockCount} blocks`)
      console.log(`   → Would append to sections[] (currently ${doc.sectionCount ?? 0} sections)`)
      console.log(`   → Would clear content field`)
      migratedCount++
    } else {
      try {
        const transaction = client.transaction()

        // If sections[] doesn't exist yet, initialize it
        if (!doc.hasSections) {
          transaction.patch(doc._id, (patch) =>
            patch.setIfMissing({ sections: [] })
          )
        }

        // Append textSection to sections[], clear content
        transaction.patch(doc._id, (patch) =>
          patch
            .append('sections', [textSection])
            .set({ content: [] })
        )

        await transaction.commit()
        console.log(`   ✅ Migrated — textSection appended, content cleared`)
        migratedCount++
      } catch (err) {
        console.error(`   ❌ Failed: ${err.message}`)
        skippedCount++
      }
    }
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`Summary: ${migratedCount} migrated, ${skippedCount} skipped`)
  if (IS_DRY_RUN) {
    console.log(`\nThis was a dry run. Run with --execute to apply changes.`)
  }
  console.log()
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
