#!/usr/bin/env node
/**
 * import-csv.js — Bulk CSV Import to Sanity (Patch-Only)
 *
 * Reads a CSV file (exported by export-csv.js or hand-edited), validates
 * every cell against the field contract, and applies patch-only updates
 * to existing Sanity documents. Never creates new documents, never
 * overwrites entire documents — only the changed fields are patched.
 *
 * Usage:
 *   node scripts/bulk/import-csv.js <csv-file> --dry-run
 *   node scripts/bulk/import-csv.js <csv-file> --apply
 *   node scripts/bulk/import-csv.js <csv-file> --apply --backup
 *
 *   pnpm bulk:import -- path/to/file.csv --dry-run
 *
 * Modes:
 *   --dry-run   Validate and show diff — no writes (default if neither flag given)
 *   --apply     Write patches to Sanity after validation
 *   --backup    Create a pre-write snapshot (NDJSON) in scripts/bulk/artifacts/
 *   --verbose   Show per-field diffs for every document
 *
 * Safety:
 *   - _id column is REQUIRED — used to look up existing documents
 *   - _type column is REQUIRED — used to select the correct field contract
 *   - Only fields listed in field-contract.js as editable: true can be written
 *   - Read-only fields (_id, _type) are silently skipped during patching
 *   - Empty cells are treated as "no change" (NOT as "clear field")
 *   - To clear a field, use the literal value: __CLEAR__
 *   - Type validation: strings, enums, dates, booleans are all checked
 *   - Reference fields (categories, tags, etc.) resolve slugs → _id before patching
 *
 * Environment variables (reads from apps/web/.env):
 *   VITE_SANITY_PROJECT_ID, VITE_SANITY_DATASET, VITE_SANITY_TOKEN/SANITY_AUTH_TOKEN
 */

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  getFieldsForType,
  getFieldByColumn,
  FIELD_TYPES,
  CONTENT_TYPES,
} from './field-contract.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../../')
const ARTIFACTS_DIR = resolve(__dirname, 'artifacts')

const CLEAR_SENTINEL = '__CLEAR__'

// ─── CLI args ────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = {
    csvFile: null,
    dryRun: true,   // default to dry-run for safety
    apply: false,
    backup: false,
    verbose: false,
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') { opts.dryRun = true; opts.apply = false }
    else if (args[i] === '--apply') { opts.apply = true; opts.dryRun = false }
    else if (args[i] === '--backup') opts.backup = true
    else if (args[i] === '--verbose') opts.verbose = true
    else if (!args[i].startsWith('--')) opts.csvFile = args[i]
  }

  // If neither flag, default to dry-run
  if (!opts.apply) opts.dryRun = true

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

  if (!projectId) { console.error('❌  Missing VITE_SANITY_PROJECT_ID'); process.exit(1) }
  if (!token) { console.error('❌  Missing VITE_SANITY_TOKEN or SANITY_AUTH_TOKEN'); process.exit(1) }

  return createClient({ projectId, dataset, apiVersion, useCdn: false, token })
}

// ─── CSV parsing ─────────────────────────────────────────────────────────────

/**
 * Parse a CSV string into an array of row objects keyed by header names.
 * Handles quoted fields with commas and newlines inside.
 */
function parseCsv(raw) {
  const rows = []
  const lines = splitCsvLines(raw)
  if (lines.length < 2) return { headers: [], rows: [] }

  const headers = parseCsvRow(lines[0])

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvRow(lines[i])
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue

    const row = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? ''
    }
    rows.push(row)
  }

  return { headers, rows }
}

/**
 * Split CSV text into logical lines (respecting quoted fields with newlines).
 */
function splitCsvLines(text) {
  const lines = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"'
        i++ // skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
      current += ch
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++ // skip \r\n
      if (current.trim()) lines.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) lines.push(current)
  return lines
}

/**
 * Parse a single CSV row into an array of cell values.
 */
function parseCsvRow(line) {
  const cells = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Validate a single cell value against its field definition.
 * Returns { valid: true, parsedValue } or { valid: false, error }.
 */
function validateCell(rawValue, fieldDef) {
  // Empty = no change
  if (rawValue === '' || rawValue === undefined || rawValue === null) {
    return { valid: true, parsedValue: undefined, noChange: true }
  }

  // Clear sentinel
  if (rawValue === CLEAR_SENTINEL) {
    return { valid: true, parsedValue: '', isClear: true }
  }

  const value = rawValue.trim()

  switch (fieldDef.type) {
    case FIELD_TYPES.STRING:
    case FIELD_TYPES.TEXT:
    case FIELD_TYPES.SLUG:
      return { valid: true, parsedValue: value }

    case FIELD_TYPES.NUMBER: {
      const num = Number(value)
      if (isNaN(num)) return { valid: false, error: `"${value}" is not a valid number` }
      return { valid: true, parsedValue: num }
    }

    case FIELD_TYPES.BOOLEAN: {
      const lower = value.toLowerCase()
      if (['true', '1', 'yes'].includes(lower)) return { valid: true, parsedValue: true }
      if (['false', '0', 'no', ''].includes(lower)) return { valid: true, parsedValue: false }
      return { valid: false, error: `"${value}" is not a valid boolean (use true/false)` }
    }

    case FIELD_TYPES.DATE: {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return { valid: false, error: `"${value}" is not a valid date (use YYYY-MM-DD)` }
      }
      return { valid: true, parsedValue: value }
    }

    case FIELD_TYPES.DATETIME: {
      // Accept ISO 8601 or just date
      if (/^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/.test(value)) {
        return { valid: true, parsedValue: value }
      }
      return { valid: false, error: `"${value}" is not a valid datetime (use ISO 8601)` }
    }

    case FIELD_TYPES.ENUM: {
      if (fieldDef.enumValues && !fieldDef.enumValues.includes(value)) {
        return {
          valid: false,
          error: `"${value}" is not a valid option. Allowed: ${fieldDef.enumValues.join(', ')}`,
        }
      }
      return { valid: true, parsedValue: value }
    }

    case FIELD_TYPES.REF_SLUGS: {
      // Comma-separated slug strings — validated later against Sanity
      const slugs = value.split(',').map((s) => s.trim()).filter(Boolean)
      return { valid: true, parsedValue: slugs }
    }

    case FIELD_TYPES.STRING_ARRAY: {
      const items = value.split(',').map((s) => s.trim()).filter(Boolean)
      return { valid: true, parsedValue: items }
    }

    default:
      return { valid: false, error: `Unknown field type: ${fieldDef.type}` }
  }
}

// ─── Reference resolution ────────────────────────────────────────────────────

/**
 * Resolve an array of slugs to Sanity reference objects.
 * Returns { refs: [...], missing: [...] }
 */
async function resolveSlugsToRefs(client, slugs, refType) {
  if (!slugs || slugs.length === 0) return { refs: [], missing: [] }

  const query = `*[_type == "${refType}" && slug.current in $slugs]{ _id, "slug": slug.current }`
  const docs = await client.fetch(query, { slugs })

  const slugToId = new Map()
  for (const doc of docs) {
    slugToId.set(doc.slug, doc._id)
  }

  const refs = []
  const missing = []

  for (const slug of slugs) {
    const id = slugToId.get(slug)
    if (id) {
      refs.push({ _type: 'reference', _ref: id, _key: slug.replace(/[^a-zA-Z0-9]/g, '') })
    } else {
      missing.push(slug)
    }
  }

  return { refs, missing }
}

// ─── Diff computation ────────────────────────────────────────────────────────

function formatValue(val) {
  if (val === null || val === undefined) return '(empty)'
  if (Array.isArray(val)) return val.join(', ') || '(empty)'
  return String(val)
}

// ─── Backup ──────────────────────────────────────────────────────────────────

async function createBackup(client, docIds) {
  console.log(`\n   📦  Creating backup of ${docIds.length} document(s)...`)

  // Fetch full documents
  const query = `*[_id in $ids]`
  const docs = await client.fetch(query, { ids: docIds })

  mkdirSync(ARTIFACTS_DIR, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = resolve(ARTIFACTS_DIR, `backup-${timestamp}.ndjson`)

  const ndjson = docs.map((d) => JSON.stringify(d)).join('\n') + '\n'
  writeFileSync(backupPath, ndjson, 'utf8')

  console.log(`   ✅  Backup written: ${backupPath}`)
  return backupPath
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs()

  if (!opts.csvFile) {
    console.error('❌  CSV file path is required')
    console.error('   Usage: node scripts/bulk/import-csv.js <csv-file> [--dry-run|--apply] [--backup]')
    process.exit(1)
  }

  const csvPath = resolve(process.cwd(), opts.csvFile)
  if (!existsSync(csvPath)) {
    console.error(`❌  File not found: ${csvPath}`)
    process.exit(1)
  }

  console.log()
  console.log(`📥  Sugartown Bulk CSV Import`)
  console.log('══════════════════════════════════════════════')
  console.log()
  console.log(`   File:    ${csvPath}`)
  console.log(`   Mode:    ${opts.dryRun ? '🔍 DRY-RUN (no writes)' : '✏️  APPLY (will write to Sanity)'}`)
  if (opts.backup) console.log('   Backup:  enabled')
  console.log()

  // Parse CSV
  const raw = readFileSync(csvPath, 'utf8')
  const { headers, rows } = parseCsv(raw)

  console.log(`   Parsed:  ${rows.length} row(s), ${headers.length} column(s)`)

  // Validate required columns
  if (!headers.includes('_id')) {
    console.error('❌  CSV must contain an _id column')
    process.exit(1)
  }
  if (!headers.includes('_type')) {
    console.error('❌  CSV must contain a _type column')
    process.exit(1)
  }

  // Connect to Sanity
  const client = buildClient()

  // ── Phase 1: Validate all rows ─────────────────────────────────────────
  console.log('\n   Phase 1: Validating...')

  const errors = []
  const patches = []   // { docId, docType, sets: { path: value }, unsets: [path] }

  // Pre-fetch reference lookups for all ref_slugs fields
  const refCache = new Map() // `refType::slug` → _id

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx]
    const docId = row._id
    const docType = row._type
    const rowNum = rowIdx + 2 // 1-indexed + header

    if (!docId) {
      errors.push({ row: rowNum, field: '_id', error: '_id is empty' })
      continue
    }
    if (!docType) {
      errors.push({ row: rowNum, field: '_type', error: '_type is empty' })
      continue
    }
    if (!CONTENT_TYPES.includes(docType)) {
      errors.push({ row: rowNum, field: '_type', error: `Unknown type: "${docType}"` })
      continue
    }

    const sets = {}
    const unsets = []
    const refResolutions = [] // deferred ref lookups

    for (const col of headers) {
      if (col === '_id' || col === '_type') continue

      const fieldDef = getFieldByColumn(col, docType)

      // Unknown column — warn but don't fail
      if (!fieldDef) {
        if (row[col] !== '') {
          errors.push({ row: rowNum, field: col, error: `Unknown field "${col}" for type "${docType}" — skipping`, severity: 'warn' })
        }
        continue
      }

      // Non-editable field — skip silently
      if (!fieldDef.editable) continue

      const cellValue = row[col]

      // Empty = no change
      if (cellValue === '' || cellValue === undefined) continue

      // Validate
      const result = validateCell(cellValue, fieldDef)

      if (!result.valid) {
        errors.push({ row: rowNum, field: col, error: result.error })
        continue
      }

      if (result.noChange) continue

      if (result.isClear) {
        unsets.push(fieldDef.patchPath)
        continue
      }

      // Reference fields need deferred resolution
      if (fieldDef.type === FIELD_TYPES.REF_SLUGS) {
        refResolutions.push({
          fieldDef,
          slugs: result.parsedValue,
        })
        continue
      }

      sets[fieldDef.patchPath] = result.parsedValue
    }

    patches.push({ docId, docType, sets, unsets, refResolutions, rowNum })
  }

  // ── Phase 2: Resolve references ────────────────────────────────────────
  console.log('   Phase 2: Resolving references...')

  for (const patch of patches) {
    for (const { fieldDef, slugs } of patch.refResolutions) {
      const { refs, missing } = await resolveSlugsToRefs(client, slugs, fieldDef.refType)

      if (missing.length > 0) {
        errors.push({
          row: patch.rowNum,
          field: fieldDef.csvColumn,
          error: `${fieldDef.refType} slug(s) not found in Sanity: ${missing.join(', ')}`,
        })
      }

      if (refs.length > 0) {
        patch.sets[fieldDef.patchPath] = refs
      }
    }
  }

  // ── Phase 3: Fetch current state for diff ──────────────────────────────
  console.log('   Phase 3: Fetching current document state...')

  const docIds = patches.map((p) => p.docId).filter(Boolean)
  const currentDocs = await client.fetch(`*[_id in $ids]`, { ids: docIds })
  const currentMap = new Map()
  for (const doc of currentDocs) {
    currentMap.set(doc._id, doc)
  }

  // Check for missing documents
  for (const patch of patches) {
    if (!currentMap.has(patch.docId)) {
      errors.push({
        row: patch.rowNum,
        field: '_id',
        error: `Document "${patch.docId}" not found in Sanity`,
      })
    }
  }

  // ── Phase 4: Compute diffs ─────────────────────────────────────────────
  console.log('   Phase 4: Computing diffs...')

  const diffs = [] // { docId, docType, changes: [{ field, from, to }] }
  let totalChanges = 0

  for (const patch of patches) {
    const currentDoc = currentMap.get(patch.docId)
    if (!currentDoc) continue

    const changes = []

    // Set operations — compare against current values
    for (const [path, newValue] of Object.entries(patch.sets)) {
      const currentValue = getNestedValue(currentDoc, path)

      // For reference arrays, compare by _ref
      if (Array.isArray(newValue) && newValue[0]?._type === 'reference') {
        const currentRefs = (Array.isArray(currentValue) ? currentValue : [])
          .map((r) => r._ref)
          .sort()
          .join(',')
        const newRefs = newValue.map((r) => r._ref).sort().join(',')
        if (currentRefs !== newRefs) {
          changes.push({
            field: path,
            from: Array.isArray(currentValue) ? currentValue.map((r) => r._ref).join(', ') : formatValue(currentValue),
            to: newValue.map((r) => r._ref).join(', '),
          })
        } else {
          // No actual change — remove from patch
          delete patch.sets[path]
        }
        continue
      }

      // For arrays, compare stringified
      if (Array.isArray(newValue)) {
        const currentArr = (Array.isArray(currentValue) ? currentValue : []).join(',')
        const newArr = newValue.join(',')
        if (currentArr !== newArr) {
          changes.push({ field: path, from: formatValue(currentValue), to: formatValue(newValue) })
        } else {
          delete patch.sets[path]
        }
        continue
      }

      // Scalar comparison (trim both sides to avoid false positives from trailing whitespace)
      const currentStr = String(currentValue ?? '').trim()
      const newStr = String(newValue).trim()
      if (currentStr !== newStr) {
        changes.push({ field: path, from: formatValue(currentValue), to: formatValue(newValue) })
      } else {
        delete patch.sets[path] // No change (or whitespace-only difference)
      }
    }

    // Unset operations
    for (const path of patch.unsets) {
      const currentValue = getNestedValue(currentDoc, path)
      if (currentValue !== null && currentValue !== undefined && currentValue !== '') {
        changes.push({ field: path, from: formatValue(currentValue), to: '(cleared)' })
      }
    }

    if (changes.length > 0) {
      diffs.push({ docId: patch.docId, docType: patch.docType, title: currentDoc.title, changes })
      totalChanges += changes.length
    }
  }

  // ── Output ─────────────────────────────────────────────────────────────
  const hardErrors = errors.filter((e) => e.severity !== 'warn')
  const warnings = errors.filter((e) => e.severity === 'warn')

  console.log()
  console.log('══════════════════════════════════════════════')

  // Errors
  if (hardErrors.length > 0) {
    console.log()
    console.log(`   ❌  ${hardErrors.length} validation error(s):`)
    for (const err of hardErrors) {
      console.log(`      Row ${err.row}, "${err.field}": ${err.error}`)
    }
  }

  // Warnings
  if (warnings.length > 0) {
    console.log()
    console.log(`   ⚠️   ${warnings.length} warning(s):`)
    for (const w of warnings.slice(0, 10)) {
      console.log(`      Row ${w.row}, "${w.field}": ${w.error}`)
    }
    if (warnings.length > 10) console.log(`      ... and ${warnings.length - 10} more`)
  }

  // Diff summary
  console.log()
  if (diffs.length === 0) {
    console.log('   ℹ️   No changes detected — CSV matches current Sanity state')
  } else {
    console.log(`   📋  ${diffs.length} document(s) with ${totalChanges} field change(s):`)
    console.log()

    for (const diff of diffs) {
      console.log(`   ${diff.docType} "${diff.title}" (${diff.docId})`)
      for (const change of diff.changes) {
        if (opts.verbose || diffs.length <= 10) {
          console.log(`      ${change.field}: ${truncate(change.from, 40)} → ${truncate(change.to, 40)}`)
        }
      }
      if (!opts.verbose && diffs.length > 10) {
        console.log(`      ${diff.changes.length} field(s) changed`)
      }
    }
  }

  // Abort on hard errors
  if (hardErrors.length > 0) {
    console.log()
    console.log('   ❌  Cannot proceed — fix validation errors and retry')
    console.log('══════════════════════════════════════════════\n')
    process.exit(1)
  }

  // Dry-run stop
  if (opts.dryRun) {
    console.log()
    console.log('   🔍  DRY-RUN complete — no changes written')
    console.log('   Run with --apply to write changes to Sanity')
    console.log('══════════════════════════════════════════════\n')

    // Write diff report
    if (diffs.length > 0) {
      writeDiffReport(diffs, csvPath)
    }

    process.exit(0)
  }

  // ── Apply mode ─────────────────────────────────────────────────────────
  if (diffs.length === 0) {
    console.log()
    console.log('   ✅  Nothing to apply')
    console.log('══════════════════════════════════════════════\n')
    process.exit(0)
  }

  // Backup
  if (opts.backup) {
    const affectedIds = diffs.map((d) => d.docId)
    await createBackup(client, affectedIds)
  }

  // Apply patches
  console.log()
  console.log(`   ✏️   Applying ${diffs.length} patch(es)...`)

  let successCount = 0
  let failCount = 0
  const changeLog = []

  for (const patch of patches) {
    const hasSets = Object.keys(patch.sets).length > 0
    const hasUnsets = patch.unsets.length > 0

    if (!hasSets && !hasUnsets) continue

    try {
      let txn = client.patch(patch.docId)

      if (hasSets) {
        txn = txn.set(patch.sets)
      }
      if (hasUnsets) {
        txn = txn.unset(patch.unsets)
      }

      await txn.commit()
      successCount++

      changeLog.push({
        docId: patch.docId,
        docType: patch.docType,
        sets: patch.sets,
        unsets: patch.unsets,
        timestamp: new Date().toISOString(),
        status: 'success',
      })

      console.log(`      ✅  ${patch.docId}`)
    } catch (err) {
      failCount++
      changeLog.push({
        docId: patch.docId,
        docType: patch.docType,
        error: err.message,
        timestamp: new Date().toISOString(),
        status: 'failed',
      })
      console.error(`      ❌  ${patch.docId}: ${err.message}`)
    }
  }

  // Write change log
  writeChangeLog(changeLog, csvPath)

  console.log()
  console.log(`   ✅  ${successCount} patched, ${failCount} failed`)
  console.log('══════════════════════════════════════════════\n')

  if (failCount > 0) process.exit(1)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Get a nested value from an object using dot-notation path.
 */
function getNestedValue(obj, path) {
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = current[part]
  }
  return current
}

function truncate(str, max) {
  if (str.length <= max) return str
  return str.slice(0, max - 3) + '...'
}

function writeDiffReport(diffs, csvPath) {
  mkdirSync(ARTIFACTS_DIR, { recursive: true })
  const timestamp = new Date().toISOString().split('T')[0]
  const reportPath = resolve(ARTIFACTS_DIR, `diff-preview-${timestamp}.md`)

  const lines = [
    `# Bulk Import Diff Preview — ${timestamp}`,
    '',
    `Source: \`${csvPath}\``,
    '',
    `## Summary`,
    '',
    `- Documents with changes: ${diffs.length}`,
    `- Total field changes: ${diffs.reduce((sum, d) => sum + d.changes.length, 0)}`,
    '',
    '---',
    '',
  ]

  for (const diff of diffs) {
    lines.push(`### ${diff.docType}: ${diff.title}`)
    lines.push(`ID: \`${diff.docId}\``)
    lines.push('')
    lines.push('| Field | Current | New |')
    lines.push('|---|---|---|')
    for (const change of diff.changes) {
      lines.push(`| \`${change.field}\` | ${change.from} | ${change.to} |`)
    }
    lines.push('')
  }

  writeFileSync(reportPath, lines.join('\n'), 'utf8')
  console.log(`   📄  Diff report: ${reportPath}`)
}

function writeChangeLog(log, csvPath) {
  mkdirSync(ARTIFACTS_DIR, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const logPath = resolve(ARTIFACTS_DIR, `changelog-${timestamp}.ndjson`)

  const ndjson = log.map((entry) => JSON.stringify(entry)).join('\n') + '\n'
  writeFileSync(logPath, ndjson, 'utf8')
  console.log(`   📜  Change log: ${logPath}`)
}

main().catch((err) => {
  console.error(`❌  Unexpected error: ${err.message}`)
  console.error(err)
  process.exit(1)
})
