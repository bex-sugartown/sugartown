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

// Fetch all person docs for slug/name presence checks and dangling ref validation
const personDocsQuery = `
  *[_type == "person"] { _id, name, "slug": slug.current }
`

// Fetch all project docs for slug presence checks and dangling ref validation
const projectDocsQuery = `
  *[_type == "project"] { _id, name, "slug": slug.current }
`

// Fetch all content docs with person/project reference arrays for dangling checks
const contentRefQuery = `
  *[_type in ["article", "caseStudy", "node"] && defined(slug.current)] {
    _id,
    _type,
    title,
    "slug": slug.current,
    "authorIds": authors[]._ref,
    "projectIds": projects[]._ref
  }
`

// ─── Run ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🔬  Sugartown Taxonomy Validator')
  console.log('══════════════════════════════════════════════\n')
  console.log(`   Project: ${projectId}  |  Dataset: ${dataset}\n`)

  let docs, tagDocs, personDocs, projectDocs, contentRefs
  try {
    ;[docs, tagDocs, personDocs, projectDocs, contentRefs] = await Promise.all([
      client.fetch(contentQuery),
      client.fetch(tagDocsQuery),
      client.fetch(personDocsQuery),
      client.fetch(projectDocsQuery),
      client.fetch(contentRefQuery),
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

  // ── Check E: person docs with no slug ─────────────────────────────────────

  console.log('👤  Person Checks')
  console.log('──────────────────────────────────────────────')

  const personsWithoutSlug = personDocs.filter((p) => !p.slug)
  const personsWithoutName = personDocs.filter((p) => !p.name)

  if (personsWithoutSlug.length === 0) {
    console.log('   ✅  All person docs have a slug')
  } else {
    console.log(`   ⚠️   ${personsWithoutSlug.length} person doc(s) with no slug:`)
    for (const p of personsWithoutSlug) {
      console.log(`        [person] "${p.name || 'Unnamed'}" (${p._id})`)
    }
  }

  // ── Check F: person docs with no name ─────────────────────────────────────

  if (personsWithoutName.length === 0) {
    console.log('   ✅  All person docs have a name')
  } else {
    console.log(`   ⚠️   ${personsWithoutName.length} person doc(s) with no name:`)
    for (const p of personsWithoutName) {
      console.log(`        [person] (${p._id})`)
    }
  }

  console.log()

  // ── Check G: project docs with no slug ────────────────────────────────────

  console.log('🚀  Project Checks')
  console.log('──────────────────────────────────────────────')

  const projectsWithoutSlug = projectDocs.filter((p) => !p.slug)

  if (projectsWithoutSlug.length === 0) {
    console.log('   ✅  All project docs have a slug')
  } else {
    console.log(`   ⚠️   ${projectsWithoutSlug.length} project doc(s) with no slug:`)
    for (const p of projectsWithoutSlug) {
      console.log(`        [project] "${p.name || 'Unnamed'}" (${p._id})`)
    }
  }

  console.log()

  // ── Check H: dangling authors[] person refs ────────────────────────────────

  console.log('🔗  Entity Reference Checks')
  console.log('──────────────────────────────────────────────')

  const allPersonIds = new Set(personDocs.map((p) => p._id))
  const allProjectIds = new Set(projectDocs.map((p) => p._id))

  const danglingPersonRefs = []
  for (const doc of contentRefs) {
    const authorIds = doc.authorIds ?? []
    for (const authorId of authorIds) {
      if (!allPersonIds.has(authorId)) {
        danglingPersonRefs.push({ doc, authorId })
      }
    }
  }

  if (danglingPersonRefs.length === 0) {
    console.log('   ✅  All authors[] refs point to existing person documents')
  } else {
    console.log(`   ❌  ${danglingPersonRefs.length} dangling authors[] reference(s) (person doc deleted but ref still on content):`)
    for (const { doc, authorId } of danglingPersonRefs) {
      console.log(`        [${doc._type}] "${doc.title || doc.slug}" → missing person ${authorId}`)
    }
  }

  // ── Check I: dangling projects[] project refs ──────────────────────────────

  const danglingProjectRefs = []
  for (const doc of contentRefs) {
    const projectIds = doc.projectIds ?? []
    for (const projectId of projectIds) {
      if (!allProjectIds.has(projectId)) {
        danglingProjectRefs.push({ doc, projectId })
      }
    }
  }

  if (danglingProjectRefs.length === 0) {
    console.log('   ✅  All projects[] refs point to existing project documents')
  } else {
    console.log(`   ⚠️   ${danglingProjectRefs.length} dangling projects[] reference(s) (project doc deleted but ref still on content):`)
    for (const { doc, projectId } of danglingProjectRefs) {
      console.log(`        [${doc._type}] "${doc.title || doc.slug}" → missing project ${projectId}`)
    }
  }

  console.log()

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log('══════════════════════════════════════════════')

  const errors = toolErrors.length + dangling.length + danglingPersonRefs.length
  // Category issues and entity slug/name issues are warnings only — not schema errors
  // danglingProjectRefs are also WARN level
  const warnings =
    overCategorized.length +
    uncategorized.length +
    personsWithoutSlug.length +
    personsWithoutName.length +
    projectsWithoutSlug.length +
    danglingProjectRefs.length

  if (errors === 0 && warnings === 0) {
    console.log('✅  All taxonomy checks passed.\n')
    process.exit(0)
  }

  if (errors > 0) {
    console.log(`❌  ${errors} ERROR(S) found — taxonomy integrity issues must be resolved.`)
  }
  if (warnings > 0) {
    console.log(`⚠️   ${warnings} WARNING(S) — review taxonomy assignments.`)
  }
  console.log()

  process.exit(errors > 0 ? 1 : 0)
}

run()
