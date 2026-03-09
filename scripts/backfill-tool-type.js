#!/usr/bin/env node
/**
 * backfill-tool-type.js — Patch toolType on existing tool documents
 *
 * Sets the `toolType` field on all tool documents that don't already have one,
 * using the categorisation from the EPIC-tool-doctype prompt.
 *
 * Modes:
 *   --dry-run (default)  Log all patches, write nothing to Sanity
 *   --execute            Apply patches to Sanity
 *
 * Usage:
 *   node scripts/backfill-tool-type.js              # dry-run
 *   node scripts/backfill-tool-type.js --execute     # live
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

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
    // .env not found — rely on process.env
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

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// ─── Tool type mapping ────────────────────────────────────────────────────────
// Source: EPIC-tool-doctype.md §Technical Constraints, reviewed for accuracy.

const TOOL_TYPE_MAP = {
  // AI
  chatgpt: 'ai',
  claude: 'ai',
  'claude-code': 'ai',
  codex: 'ai',
  gemini: 'ai',
  // Design
  figma: 'design',
  // Development
  css: 'development',
  git: 'development',
  github: 'development',
  javascript: 'development',
  matplotlib: 'development',
  mermaid: 'development',
  networkx: 'development',
  python: 'development',
  react: 'development',
  storybook: 'development',
  turborepo: 'development',
  typescript: 'development',
  vite: 'development',
  // CMS
  acquia: 'cms',
  aem: 'cms',
  celum: 'cms',
  contentful: 'cms',
  drupal: 'cms',
  'oracle-atg': 'cms',
  sanity: 'cms',
  shopify: 'cms',
  storyblok: 'cms',
  wordpress: 'cms',
  // Productivity
  linear: 'productivity',
  netlify: 'productivity',
  // Development (additional)
  ios: 'development',
  // Other
  apple: 'other',
}

// ─── Run ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n🔧  Backfill toolType on tool documents`)
  console.log(`    Mode: ${IS_DRY_RUN ? 'DRY-RUN (no writes)' : '🔴 EXECUTE (live writes)'}`)
  console.log(`    Project: ${projectId} / ${dataset}\n`)

  if (IS_EXECUTE) {
    console.log('    ⏳ Starting in 5 seconds — Ctrl-C to abort...\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  // Fetch all tool docs
  const tools = await client.fetch(`*[_type == "tool"] { _id, name, "slug": slug.current, toolType }`)
  console.log(`    Found ${tools.length} tool document(s)\n`)

  let patched = 0
  let skipped = 0
  let unmapped = 0

  for (const tool of tools) {
    if (tool.toolType) {
      console.log(`    SKIP  ${tool.slug} — already has toolType "${tool.toolType}"`)
      skipped++
      continue
    }

    const toolType = TOOL_TYPE_MAP[tool.slug]
    if (!toolType) {
      console.log(`    ⚠️   ${tool.slug} — no mapping found, will set "other"`)
      unmapped++
    }

    const value = toolType ?? 'other'
    console.log(`    ${IS_DRY_RUN ? 'WOULD PATCH' : 'PATCH'}  ${tool.slug} → toolType: "${value}"`)

    if (IS_EXECUTE) {
      await client.patch(tool._id).set({ toolType: value }).commit()
    }
    patched++
  }

  console.log(`\n    ────────────────────────────────`)
  console.log(`    Total:    ${tools.length}`)
  console.log(`    Patched:  ${patched}${IS_DRY_RUN ? ' (would patch)' : ''}`)
  console.log(`    Skipped:  ${skipped} (already had toolType)`)
  if (unmapped > 0) {
    console.log(`    Unmapped: ${unmapped} (set to "other" — review in Studio)`)
  }
  console.log()
}

run().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
