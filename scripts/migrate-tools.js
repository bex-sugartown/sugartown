#!/usr/bin/env node
/**
 * migrate-tools.js — Promote tools from string enum to tool document references
 *
 * Three phases:
 *   A. Seed — Create tool documents with deterministic IDs (tool-<slug>)
 *   B. Migrate — Convert string tools[] values on content docs to reference arrays
 *   C. Report — Print editorial checklist of tag-tool overlaps for manual review
 *
 * Modes:
 *   --dry-run (default)  Log all changes, write nothing to Sanity
 *   --execute            Apply mutations to Sanity (irreversible — run dry-run first)
 *
 * Usage:
 *   node scripts/migrate-tools.js                  # dry-run
 *   node scripts/migrate-tools.js --dry-run        # explicit dry-run
 *   node scripts/migrate-tools.js --execute        # live — writes to Sanity
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
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'
const token = process.env.SANITY_AUTH_TOKEN ?? process.env.VITE_SANITY_TOKEN

if (!projectId) {
  console.error('ERROR: VITE_SANITY_PROJECT_ID is not set.')
  process.exit(1)
}

if (IS_EXECUTE && !token) {
  console.error('ERROR: --execute requires SANITY_AUTH_TOKEN or VITE_SANITY_TOKEN (write token).')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// ─── Tool seed list ───────────────────────────────────────────────────────────
// Single source of truth: the 27 tools from the original hardcoded enum.
// Each gets a deterministic _id of `tool-<value>` for reliable reference mapping.

const TOOL_SEED = [
  { name: 'Acquia', slug: 'acquia' },
  { name: 'AEM', slug: 'aem' },
  { name: 'Celum', slug: 'celum' },
  { name: 'ChatGPT', slug: 'chatgpt' },
  { name: 'Claude', slug: 'claude' },
  { name: 'Claude Code', slug: 'claude-code' },
  { name: 'Contentful', slug: 'contentful' },
  { name: 'CSS', slug: 'css' },
  { name: 'Drupal', slug: 'drupal' },
  { name: 'Figma', slug: 'figma' },
  { name: 'Gemini', slug: 'gemini' },
  { name: 'Git', slug: 'git' },
  { name: 'GitHub', slug: 'github' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'Linear', slug: 'linear' },
  { name: 'Matplotlib', slug: 'matplotlib' },
  { name: 'Mermaid', slug: 'mermaid' },
  { name: 'Netlify', slug: 'netlify' },
  { name: 'NetworkX', slug: 'networkx' },
  { name: 'OpenAI Codex', slug: 'codex' },
  { name: 'Oracle ATG', slug: 'oracle-atg' },
  { name: 'Python', slug: 'python' },
  { name: 'React', slug: 'react' },
  { name: 'Sanity', slug: 'sanity' },
  { name: 'Shopify', slug: 'shopify' },
  { name: 'Storybook', slug: 'storybook' },
  { name: 'Turborepo', slug: 'turborepo' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'Vite', slug: 'vite' },
  { name: 'WordPress', slug: 'wordpress' },
]

// Map slug → deterministic document _id
function toolId(slug) {
  return `tool-${slug}`
}

// ─── Summary counters ─────────────────────────────────────────────────────────

const summary = {
  toolsSeeded: 0,
  toolsSkipped: 0,
  docsInspected: 0,
  docsMigrated: 0,
  stringValuesConverted: 0,
  stringValuesUnknown: 0,
  tagOverlaps: 0,
}

// ─── Phase A: Seed tool documents ─────────────────────────────────────────────

async function seedTools() {
  console.log('\n── Phase A: Seed Tool Documents ──────────────────────')
  console.log(`   ${TOOL_SEED.length} tools to seed\n`)

  // Check which already exist
  const existingIds = await client.fetch(
    `*[_type == "tool"]._id`
  )
  const existingSet = new Set(existingIds)

  const tx = IS_EXECUTE ? client.transaction() : null

  for (const tool of TOOL_SEED) {
    const id = toolId(tool.slug)

    if (existingSet.has(id)) {
      console.log(`   SKIP  ${id} — "${tool.name}" already exists`)
      summary.toolsSkipped++
      continue
    }

    const doc = {
      _id: id,
      _type: 'tool',
      name: tool.name,
      slug: { _type: 'slug', current: tool.slug },
    }

    console.log(`   SEED  ${id} — "${tool.name}"`)
    summary.toolsSeeded++

    if (tx) {
      tx.createIfNotExists(doc)
    }
  }

  if (IS_EXECUTE && summary.toolsSeeded > 0) {
    try {
      await tx.commit()
      console.log(`\n   ✅  ${summary.toolsSeeded} tool documents created`)
    } catch (err) {
      console.error(`\n   ❌  Seed failed: ${err.message}`)
      process.exit(1)
    }
  } else if (IS_DRY_RUN) {
    console.log(`\n   🟡  Would create ${summary.toolsSeeded} tool documents`)
  }
}

// ─── Phase B: Migrate string tools to references ──────────────────────────────

async function migrateTools() {
  console.log('\n── Phase B: Migrate String tools[] → Reference tools[] ─')

  // Build a set of valid tool slugs for validation
  const validSlugs = new Set(TOOL_SEED.map((t) => t.slug))

  // Fetch all content docs that have tools[] defined
  // Use raw perspective to see both drafts and published
  const docs = await client.fetch(`
    *[_type in ["article", "caseStudy", "node"] && defined(tools) && length(tools) > 0] {
      _id,
      _type,
      title,
      "slug": slug.current,
      tools
    }
  `)

  console.log(`   ${docs.length} documents with tools[] values\n`)
  summary.docsInspected = docs.length

  for (const doc of docs) {
    const tools = doc.tools ?? []

    // Check if already migrated (tools contain objects with _ref instead of strings)
    if (tools.length > 0 && typeof tools[0] === 'object' && tools[0]._ref) {
      console.log(`   SKIP  [${doc._type}] "${doc.title}" — already migrated (has _ref)`)
      continue
    }

    // Filter to valid tool slugs only
    const validTools = []
    const unknownTools = []
    for (const val of tools) {
      if (typeof val !== 'string') continue
      if (validSlugs.has(val)) {
        validTools.push(val)
      } else {
        unknownTools.push(val)
        summary.stringValuesUnknown++
      }
    }

    if (unknownTools.length > 0) {
      console.log(`   ⚠️  [${doc._type}] "${doc.title}" — unknown tool values: [${unknownTools.join(', ')}]`)
    }

    if (validTools.length === 0 && unknownTools.length === 0) continue

    // Build reference array (deduped)
    const seen = new Set()
    const newToolRefs = []
    for (const slug of validTools) {
      if (seen.has(slug)) continue
      seen.add(slug)
      newToolRefs.push({
        _type: 'reference',
        _ref: toolId(slug),
        _key: randomUUID().slice(0, 8),
      })
      summary.stringValuesConverted++
    }

    console.log(`   MIGRATE  [${doc._type}] "${doc.title}" (${doc._id})`)
    console.log(`            [${tools.join(', ')}] → ${newToolRefs.length} reference(s)`)

    summary.docsMigrated++

    if (IS_EXECUTE) {
      try {
        await client
          .patch(doc._id)
          .set({ tools: newToolRefs })
          .commit()
        console.log(`            ✅  Patched`)
      } catch (err) {
        console.error(`            ❌  Patch failed: ${err.message}`)
      }
    }
  }

  if (IS_DRY_RUN) {
    console.log(`\n   🟡  Would migrate ${summary.docsMigrated} documents`)
  }
}

// ─── Phase C: Tag-tool overlap report ─────────────────────────────────────────

async function tagOverlapReport() {
  console.log('\n── Phase C: Tag-Tool Overlap Report (Editorial Review) ─')
  console.log('   The following tags have names matching tool documents.')
  console.log('   Review each one and decide whether to:\n')
  console.log('     a) Keep the tag (if the conceptual meaning differs from the tool)')
  console.log('     b) Migrate content refs from tag → tool, then delete the tag')
  console.log('     c) Keep both if they serve different purposes\n')

  // Build lookup of tool names (lowercase) → tool doc ID
  const toolNameMap = new Map()
  for (const t of TOOL_SEED) {
    toolNameMap.set(t.name.toLowerCase(), toolId(t.slug))
    toolNameMap.set(t.slug.toLowerCase(), toolId(t.slug))
  }

  // Fetch all tags
  const tags = await client.fetch(`
    *[_type == "tag"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      "refCount": count(*[_type in ["article", "caseStudy", "node"] && references(^._id)])
    }
  `)

  const overlaps = []
  for (const tag of tags) {
    const nameLC = (tag.name ?? '').toLowerCase()
    const slugLC = (tag.slug ?? '').toLowerCase()
    const matchedToolId = toolNameMap.get(nameLC) ?? toolNameMap.get(slugLC)

    if (matchedToolId) {
      overlaps.push({ tag, matchedToolId })
    }
  }

  if (overlaps.length === 0) {
    console.log('   No tag-tool overlaps found.\n')
    return
  }

  summary.tagOverlaps = overlaps.length
  console.log(`   Found ${overlaps.length} overlap(s):\n`)
  console.log('   ┌─────────────────────────────────────────────────────────────────┐')
  console.log('   │  Tag Name              Tag ID                  Refs  Tool ID    │')
  console.log('   ├─────────────────────────────────────────────────────────────────┤')

  for (const { tag, matchedToolId } of overlaps) {
    const name = (tag.name ?? '').padEnd(20)
    const tagId = (tag._id ?? '').padEnd(20)
    const refs = String(tag.refCount ?? 0).padStart(4)
    const tId = matchedToolId
    console.log(`   │  ${name}  ${tagId}  ${refs}  ${tId}`)
  }

  console.log('   └─────────────────────────────────────────────────────────────────┘')
  console.log('\n   Action items:')
  console.log('   1. For each overlap, decide: keep tag, migrate to tool ref, or both')
  console.log('   2. To migrate: update content docs in Studio to use tool ref, remove tag ref')
  console.log('   3. After migration: run `pnpm validate:content` to confirm zero orphaned refs')
  console.log('   4. Delete retired tag docs only after confirming zero remaining references\n')
}

// ─── Main runner ──────────────────────────────────────────────────────────────

async function run() {
  const mode = IS_EXECUTE ? '🔴 EXECUTE (live writes)' : '🟡 DRY-RUN (no writes)'
  console.log('\n🔧  Sugartown Tool Migration')
  console.log('══════════════════════════════════════════════')
  console.log(`   Mode:    ${mode}`)
  console.log(`   Project: ${projectId}  |  Dataset: ${dataset}`)
  console.log()

  if (IS_EXECUTE) {
    console.log('⚠️  EXECUTE mode — mutations will be applied to Sanity production.')
    console.log('   Press Ctrl-C within 5 seconds to abort.\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  await seedTools()
  await migrateTools()
  await tagOverlapReport()

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════')
  console.log('📊  Migration Summary')
  console.log('──────────────────────────────────────────────')
  console.log(`   Tools seeded:             ${summary.toolsSeeded}`)
  console.log(`   Tools skipped (exist):    ${summary.toolsSkipped}`)
  console.log(`   Docs inspected:           ${summary.docsInspected}`)
  console.log(`   Docs migrated:            ${summary.docsMigrated}`)
  console.log(`   String values converted:  ${summary.stringValuesConverted}`)
  console.log(`   Unknown values (warning): ${summary.stringValuesUnknown}`)
  console.log(`   Tag-tool overlaps:        ${summary.tagOverlaps}`)
  console.log()

  if (IS_DRY_RUN) {
    console.log('🟡  DRY-RUN complete — no changes written to Sanity.')
    console.log('    Run with --execute to apply these changes.')
  } else {
    console.log('🔴  EXECUTE complete — changes written to Sanity production.')
  }

  console.log()
  process.exit(0)
}

run()
