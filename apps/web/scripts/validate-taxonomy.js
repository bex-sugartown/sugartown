#!/usr/bin/env node
/**
 * validate-taxonomy.js — Taxonomy Integrity Validator
 *
 * Checks all content documents (article, caseStudy, node) for taxonomy health:
 *
 *   A) [WARN]  Documents with > 2 categories
 *   B) [WARN]  Documents with 0 categories
 *   C) [FAIL]  tools[] values not in the canonical enum
 *   D) [FAIL]  tags[] referencing tag docs not in the controlled vocabulary
 *              (only active after running migrate-taxonomy.js --execute)
 *
 * Usage:
 *   pnpm validate:taxonomy
 *
 * Add to package.json scripts:
 *   "validate:taxonomy": "node scripts/validate-taxonomy.js"
 *
 * Exits with code 1 if any FAIL-level issues found, 0 if clean.
 *
 * Environment variables required (reads from .env or process.env):
 *   VITE_SANITY_PROJECT_ID
 *   VITE_SANITY_DATASET
 *   VITE_SANITY_API_VERSION
 *   VITE_SANITY_TOKEN   (read-only viewer token — needed for wp.* docs)
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Load env ─────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = resolve(__dirname, '../.env')
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

// ─── Canonical tools enum ─────────────────────────────────────────────────────
// Must match options.list in article.ts, caseStudy.ts, node.ts schemas.
// Also must match CANONICAL_TOOLS in scripts/migrate-taxonomy.js.

const CANONICAL_TOOLS = new Set([
  'acquia', 'aem', 'celum', 'chatgpt', 'claude', 'claude-code',
  'contentful', 'css', 'drupal', 'figma', 'gemini', 'git', 'github',
  'javascript', 'linear', 'matplotlib', 'mermaid', 'netlify', 'networkx',
  'codex', 'oracle-atg', 'python', 'react', 'sanity', 'shopify',
  'storybook', 'turborepo', 'typescript', 'vite', 'wordpress',
])

// ─── Sanity client ────────────────────────────────────────────────────────────

const projectId = process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'
const token = process.env.VITE_SANITY_TOKEN

if (!projectId) {
  console.error('[validate-taxonomy] ERROR: VITE_SANITY_PROJECT_ID is not set.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// ─── GROQ queries ─────────────────────────────────────────────────────────────

// Fetch all content docs with taxonomy fields expanded
const contentQuery = `
  *[_type in ["article", "caseStudy", "node"] && defined(slug.current)] {
    _id,
    _type,
    title,
    "slug": slug.current,
    "categoryCount": count(categories),
    "categoryIds": categories[]._ref,
    tools,
    "tagIds": tags[]._ref
  }
`

// Fetch all published tag doc IDs — used to validate tag[] refs after migration
// (Before migration, many tag refs exist that aren't in the controlled vocab —
//  this check is WARN-level until migrate-taxonomy --execute has been run.)
const tagDocsQuery = `
  *[_type == "tag"] { _id, name, "slug": slug.current }
`

// ─── Run ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🔬  Sugartown Taxonomy Validator')
  console.log('══════════════════════════════════════════════\n')
  console.log(`   Project: ${projectId}  |  Dataset: ${dataset}\n`)

  let docs, tagDocs
  try {
    ;[docs, tagDocs] = await Promise.all([
      client.fetch(contentQuery),
      client.fetch(tagDocsQuery),
    ])
  } catch (err) {
    console.error('[validate-taxonomy] Sanity fetch failed:', err.message)
    process.exit(1)
  }

  const allTagIds = new Set(tagDocs.map((t) => t._id))
  const tagById = Object.fromEntries(tagDocs.map((t) => [t._id, t]))

  // ── Check A: category count > 2 ───────────────────────────────────────────

  const overCategorized = docs.filter((d) => (d.categoryCount ?? 0) > 2)
  const uncategorized = docs.filter((d) => (d.categoryCount ?? 0) === 0)

  console.log('🏷️  Category Checks')
  console.log('──────────────────────────────────────────────')

  if (overCategorized.length === 0) {
    console.log('   ✅  All docs have ≤ 2 categories')
  } else {
    console.log(`   ⚠️   ${overCategorized.length} doc(s) with > 2 categories:`)
    for (const doc of overCategorized) {
      console.log(`        [${doc._type}] "${doc.title || doc.slug}" — ${doc.categoryCount} categories (${doc._id})`)
    }
  }

  if (uncategorized.length === 0) {
    console.log('   ✅  All docs have at least 1 category')
  } else {
    console.log(`   ⚠️   ${uncategorized.length} doc(s) with 0 categories:`)
    for (const doc of uncategorized) {
      console.log(`        [${doc._type}] "${doc.title || doc.slug}" (${doc._id})`)
    }
  }

  console.log()

  // ── Check B: tools[] values ────────────────────────────────────────────────

  console.log('🔧  Tools Enum Checks')
  console.log('──────────────────────────────────────────────')

  const toolErrors = []
  for (const doc of docs) {
    const tools = doc.tools ?? []
    for (const tool of tools) {
      if (!CANONICAL_TOOLS.has(tool)) {
        toolErrors.push({ doc, tool })
      }
    }
  }

  if (toolErrors.length === 0) {
    console.log('   ✅  All tools[] values are in the canonical enum')
  } else {
    console.log(`   ❌  ${toolErrors.length} non-canonical tools[] value(s):`)
    for (const { doc, tool } of toolErrors) {
      console.log(`        [${doc._type}] "${doc.title || doc.slug}" — tools value "${tool}" not in enum (${doc._id})`)
    }
    console.log(`\n   Canonical tools: ${[...CANONICAL_TOOLS].sort().join(', ')}`)
  }

  console.log()

  // ── Check C: tags[] references valid tag docs ─────────────────────────────
  // After migration, all tag refs should point to existing tag documents.
  // Before migration, this will produce many warnings — that's expected.

  console.log('🔖  Tag Reference Checks')
  console.log('──────────────────────────────────────────────')
  console.log(`   Total tag documents in dataset: ${tagDocs.length}`)

  const dangling = []
  for (const doc of docs) {
    const tagIds = doc.tagIds ?? []
    for (const tagId of tagIds) {
      if (!allTagIds.has(tagId)) {
        dangling.push({ doc, tagId })
      }
    }
  }

  if (dangling.length === 0) {
    console.log('   ✅  All tags[] refs point to existing tag documents')
  } else {
    console.log(`   ❌  ${dangling.length} dangling tag reference(s) (tag doc deleted but ref still on content):`)
    for (const { doc, tagId } of dangling) {
      console.log(`        [${doc._type}] "${doc.title || doc.slug}" → missing tag ${tagId}`)
    }
  }

  console.log()

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log('══════════════════════════════════════════════')

  const errors = toolErrors.length + dangling.length
  // Category issues are warnings only — not schema errors
  const warnings = overCategorized.length + uncategorized.length

  if (errors === 0 && warnings === 0) {
    console.log('✅  All taxonomy checks passed.\n')
    process.exit(0)
  }

  if (errors > 0) {
    console.log(`❌  ${errors} ERROR(S) found — taxonomy integrity issues must be resolved.`)
  }
  if (warnings > 0) {
    console.log(`⚠️   ${warnings} WARNING(S) — review category assignments.`)
  }
  console.log()

  process.exit(errors > 0 ? 1 : 0)
}

run()
