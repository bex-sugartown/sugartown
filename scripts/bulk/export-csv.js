#!/usr/bin/env node
/**
 * export-csv.js — Bulk CSV Export from Sanity
 *
 * Exports selected fields from Sanity documents to CSV for offline editing
 * in Excel, Google Sheets, or any spreadsheet tool.
 *
 * Usage:
 *   node scripts/bulk/export-csv.js --type article
 *   node scripts/bulk/export-csv.js --type article --fields title,excerpt,seo.title,seo.description
 *   node scripts/bulk/export-csv.js --type article,caseStudy,node   # cross-type (shared fields only)
 *   node scripts/bulk/export-csv.js --type all                     # all content types
 *   node scripts/bulk/export-csv.js --type article --output my-export.csv
 *   node scripts/bulk/export-csv.js --list-fields --type article   # show available fields
 *
 *   pnpm bulk:export -- --type article
 *
 * Options:
 *   --type <type>       Content type(s): article, caseStudy, node, page, all
 *                        Comma-separated for multiple types (uses shared fields only)
 *   --fields <fields>   Comma-separated list of CSV column names to include
 *                        Default: all fields for the type
 *   --output <file>     Output filename (default: auto-generated in scripts/bulk/artifacts/)
 *   --list-fields       Print available fields for the type and exit
 *   --published-only    Only export documents where status != 'draft' (or no status field)
 *
 * Output: CSV file in scripts/bulk/artifacts/
 *
 * This script is READ-ONLY — it never writes to Sanity.
 *
 * Environment variables (reads from apps/web/.env):
 *   VITE_SANITY_PROJECT_ID, VITE_SANITY_DATASET, VITE_SANITY_TOKEN
 */

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  getFieldsForType,
  buildGroqProjection,
  CONTENT_TYPES,
  FIELD_TYPES,
} from './field-contract.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../../')
const ARTIFACTS_DIR = resolve(__dirname, 'artifacts')

// ─── CLI args ────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = {
    types: [],
    fields: null,
    output: null,
    listFields: false,
    publishedOnly: false,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--type':
        opts.types = (args[++i] || '').split(',').map((t) => t.trim()).filter(Boolean)
        break
      case '--fields':
        opts.fields = (args[++i] || '').split(',').map((f) => f.trim()).filter(Boolean)
        break
      case '--output':
        opts.output = args[++i]
        break
      case '--list-fields':
        opts.listFields = true
        break
      case '--published-only':
        opts.publishedOnly = true
        break
    }
  }

  // Expand "all"
  if (opts.types.length === 1 && opts.types[0] === 'all') {
    opts.types = [...CONTENT_TYPES]
  }

  return opts
}

// ─── Env loading ─────────────────────────────────────────────────────────────

function loadEnv() {
  const candidates = [
    resolve(REPO_ROOT, 'apps/web/.env'),
    resolve(REPO_ROOT, '.env'),
  ]
  for (const envPath of candidates) {
    if (!existsSync(envPath)) continue
    try {
      const raw = readFileSync(envPath, 'utf8')
      for (const line of raw.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx === -1) continue
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '')
        if (key && !(key in process.env)) process.env[key] = val
      }
    } catch { /* skip */ }
  }
}

// ─── Sanity client ───────────────────────────────────────────────────────────

function buildClient() {
  loadEnv()
  const projectId = process.env.VITE_SANITY_PROJECT_ID
  const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
  const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2024-01-01'
  const token = process.env.VITE_SANITY_TOKEN || process.env.SANITY_AUTH_TOKEN

  if (!projectId) {
    console.error('❌  Missing VITE_SANITY_PROJECT_ID')
    process.exit(1)
  }
  if (!token) {
    console.error('❌  Missing VITE_SANITY_TOKEN or SANITY_AUTH_TOKEN')
    process.exit(1)
  }

  return createClient({ projectId, dataset, apiVersion, useCdn: false, token })
}

// ─── CSV encoding ────────────────────────────────────────────────────────────

function csvEscape(value) {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function formatCsvValue(value, fieldDef) {
  if (value === null || value === undefined) return ''

  switch (fieldDef.type) {
    case FIELD_TYPES.BOOLEAN:
      return value === true ? 'true' : value === false ? 'false' : ''

    case FIELD_TYPES.REF_SLUGS:
    case FIELD_TYPES.STRING_ARRAY:
      // Arrays → comma-separated
      if (Array.isArray(value)) return value.filter(Boolean).join(', ')
      return String(value)

    default:
      return String(value)
  }
}

// ─── List fields mode ────────────────────────────────────────────────────────

function listFields(types) {
  const isCross = types.length > 1
  const type = isCross ? null : types[0]
  const fields = getFieldsForType(type)

  console.log()
  if (isCross) {
    console.log(`📋  Shared fields (cross-type export for: ${types.join(', ')})`)
  } else {
    console.log(`📋  Fields for type: ${type}`)
  }
  console.log('──────────────────────────────────────────────')
  console.log()
  console.log('  Column Name'.padEnd(28) + 'Type'.padEnd(16) + 'Editable'.padEnd(10) + 'Description')
  console.log('  ' + '─'.repeat(90))

  for (const f of fields) {
    const edit = f.editable ? '✏️' : '🔒'
    console.log(
      `  ${f.csvColumn.padEnd(26)} ${f.type.padEnd(14)} ${edit.padEnd(8)}  ${f.description}`
    )
  }
  console.log()
}

// ─── Main export logic ───────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs()

  if (opts.types.length === 0) {
    console.error('❌  --type is required. Use: article, caseStudy, node, page, all')
    console.error('   Example: node scripts/bulk/export-csv.js --type article')
    process.exit(1)
  }

  // Validate types
  for (const t of opts.types) {
    if (!CONTENT_TYPES.includes(t)) {
      console.error(`❌  Unknown type: "${t}". Valid types: ${CONTENT_TYPES.join(', ')}`)
      process.exit(1)
    }
  }

  // List fields mode
  if (opts.listFields) {
    listFields(opts.types)
    process.exit(0)
  }

  const isCrossType = opts.types.length > 1
  const effectiveType = isCrossType ? null : opts.types[0]

  // Resolve fields
  let allFields = getFieldsForType(effectiveType)

  // If --fields specified, filter to just those columns (always include _id and _type)
  if (opts.fields) {
    const requested = new Set(opts.fields)
    requested.add('_id')
    requested.add('_type')
    const filtered = allFields.filter((f) => requested.has(f.csvColumn))

    // Warn about unknown fields
    for (const name of opts.fields) {
      if (!allFields.find((f) => f.csvColumn === name)) {
        console.warn(`⚠️  Unknown field "${name}" — skipping`)
      }
    }

    allFields = filtered
  }

  console.log()
  console.log('📤  Sugartown Bulk CSV Export')
  console.log('══════════════════════════════════════════════')
  console.log()
  console.log(`   Type(s): ${opts.types.join(', ')}`)
  console.log(`   Fields:  ${allFields.length} column(s)`)
  if (opts.publishedOnly) console.log('   Filter:  published only')
  console.log()

  // Build GROQ query
  const typeFilter = opts.types.map((t) => `_type == "${t}"`).join(' || ')
  const statusFilter = opts.publishedOnly ? ' && (status != "draft" || !defined(status))' : ''
  const projection = buildGroqProjection(allFields)
  const query = `*[${typeFilter}${statusFilter}] | order(_type asc, title asc) ${projection}`

  console.log(`   GROQ: ${query.length > 120 ? query.slice(0, 117) + '...' : query}`)
  console.log()

  // Fetch
  const client = buildClient()
  let docs
  try {
    docs = await client.fetch(query)
  } catch (err) {
    console.error(`❌  Sanity query failed: ${err.message}`)
    process.exit(1)
  }

  console.log(`   ✅  Fetched ${docs.length} document(s)`)

  if (docs.length === 0) {
    console.log('   Nothing to export.')
    process.exit(0)
  }

  // Build CSV
  const columns = allFields.map((f) => f.csvColumn)
  const headerLine = columns.map(csvEscape).join(',')

  const dataLines = docs.map((doc) => {
    return columns.map((col) => {
      const fieldDef = allFields.find((f) => f.csvColumn === col)
      const value = doc[col]
      return csvEscape(formatCsvValue(value, fieldDef))
    }).join(',')
  })

  const csv = [headerLine, ...dataLines].join('\n') + '\n'

  // Write
  mkdirSync(ARTIFACTS_DIR, { recursive: true })
  const timestamp = new Date().toISOString().split('T')[0]
  const typeSuffix = isCrossType ? 'cross-type' : effectiveType
  const defaultFilename = `export-${typeSuffix}-${timestamp}.csv`
  const outputPath = opts.output
    ? resolve(process.cwd(), opts.output)
    : resolve(ARTIFACTS_DIR, defaultFilename)

  writeFileSync(outputPath, csv, 'utf8')

  console.log(`   ✅  Written: ${outputPath}`)
  console.log(`   📊  ${docs.length} rows × ${columns.length} columns`)
  console.log()
  console.log('══════════════════════════════════════════════')
  console.log()
}

main().catch((err) => {
  console.error(`❌  Unexpected error: ${err.message}`)
  console.error(err)
  process.exit(1)
})
