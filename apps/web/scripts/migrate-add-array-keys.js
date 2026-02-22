#!/usr/bin/env node
/**
 * migrate-add-array-keys.js — Add missing _key properties to reference array items
 *
 * Background:
 *   The WP migration import script wrote reference arrays (tags[], categories[],
 *   authors[], projects[]) without _key properties on each item. Sanity Studio
 *   requires every item in an array to have a unique _key string — without it,
 *   the array is read-only in Studio and shows the "Missing keys" warning.
 *
 * What this script does:
 *   For each document that has at least one array item missing a _key:
 *   - Fetches the full current array
 *   - Adds a random _key to any item that is missing one (preserves existing _keys)
 *   - Patches only the arrays that had missing keys (uses set patch on full array)
 *
 *   Arrays checked: tags[], categories[], authors[], projects[]
 *
 * Usage:
 *   node apps/web/scripts/migrate-add-array-keys.js           # dry-run (default)
 *   node apps/web/scripts/migrate-add-array-keys.js --execute # live writes
 *
 * Requires SANITY_AUTH_TOKEN (write-capable) in apps/web/.env
 */

import {readFileSync} from 'fs'
import {createClient} from '@sanity/client'
import {randomBytes} from 'crypto'

// ─── Config ─────────────────────────────────────────────────────────────────

const DRY_RUN = !process.argv.includes('--execute')

const envPath = new URL('../.env', import.meta.url).pathname
const env = readFileSync(envPath, 'utf8')
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a short random key compatible with Sanity's _key format */
function makeKey() {
  return randomBytes(6).toString('hex') // 12-char hex string
}

/** Add _key to any array items that are missing one. Returns null if no changes needed. */
function addMissingKeys(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null
  let changed = false
  const patched = arr.map((item) => {
    if (item._key) return item
    changed = true
    return {...item, _key: makeKey()}
  })
  return changed ? patched : null
}

// ─── Main ────────────────────────────────────────────────────────────────────

const ARRAY_FIELDS = ['tags', 'categories', 'authors', 'projects']

async function main() {
  console.log(`\n─── Add Missing Array Keys ──────────────────────────────────`)
  console.log(`    Mode: ${DRY_RUN ? 'DRY RUN (pass --execute to apply)' : '⚠️  EXECUTE — writing to Sanity production'}`)
  console.log()

  // Find all docs with any array item missing _key (raw = published + drafts)
  const conditions = ARRAY_FIELDS.map(f => `count(${f}[!defined(_key)]) > 0`).join(' || ')
  const projection = ARRAY_FIELDS.map(f => `${f}[] { _key, _ref, _type }`).join(', ')

  const docs = await client.fetch(
    `*[${conditions}] { _id, _type, title, ${projection} }`,
    {},
    {perspective: 'raw'}
  )

  console.log(`Found ${docs.length} documents with missing _key values.\n`)

  let totalPatched = 0
  let totalKeysAdded = 0

  for (const doc of docs) {
    const isDraft = doc._id.startsWith('drafts.')
    console.log(`  [${doc._type}] ${doc._id}${isDraft ? ' (draft)' : ''}`)

    const setPatch = {}
    let docKeysAdded = 0

    for (const field of ARRAY_FIELDS) {
      const arr = doc[field]
      if (!arr || arr.length === 0) continue

      const missingCount = arr.filter(item => !item._key).length
      if (missingCount === 0) continue

      const patched = addMissingKeys(arr)
      if (patched) {
        setPatch[field] = patched
        docKeysAdded += missingCount
        console.log(`    ${field}[]: ${missingCount} item${missingCount > 1 ? 's' : ''} missing _key → adding`)
      }
    }

    if (Object.keys(setPatch).length === 0) {
      console.log(`    (nothing to patch — skipping)`)
      console.log()
      continue
    }

    totalPatched++
    totalKeysAdded += docKeysAdded

    if (!DRY_RUN) {
      await client.patch(doc._id).set(setPatch).commit()
      console.log(`    ✅ patched (${docKeysAdded} key${docKeysAdded > 1 ? 's' : ''} added)`)
    } else {
      console.log(`    [dry-run] would add ${docKeysAdded} _key value${docKeysAdded > 1 ? 's' : ''}`)
    }
    console.log()
  }

  console.log(`─── Summary ─────────────────────────────────────────────────`)
  console.log(`  Total docs found:  ${docs.length}`)
  console.log(`  Docs to patch:     ${totalPatched}`)
  console.log(`  _key values added: ${totalKeysAdded}`)
  if (DRY_RUN) {
    console.log(`\n  DRY RUN — no changes made. Re-run with --execute to apply.`)
  } else {
    console.log(`\n  Done. ${totalPatched} documents patched.`)
  }
  console.log()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
