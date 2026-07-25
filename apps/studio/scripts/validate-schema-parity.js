#!/usr/bin/env node
/**
 * validate-schema-parity.js — Schema Drift Detector
 *
 * Compares the locally defined schema against the deployed schema and fails
 * if they differ. Catches the "I changed the schema locally but forgot to
 * deploy" failure mode — MCP tools and the Content Lake API validate against
 * the deployed schema, not local code, so drift here causes silent write
 * failures elsewhere.
 *
 * Both sides are compared in the same "manifest" shape (name/type/fields):
 * locally via `sanity manifest extract` (the same extraction `sanity schema
 * deploy` uses internally), and on the deployed side via `sanity schema list
 * --json`. This is deliberately NOT the typegen `schema.json` format written
 * by `sanity schema extract` — that format synthesizes extra nested type
 * nodes that don't correspond 1:1 with real schema types, which makes a
 * name-set diff against it noisy to the point of useless.
 *
 * Usage:
 *   pnpm --filter studio validate:schema-parity
 *
 * Exit codes:
 *   0 — local and deployed schemas match, no drift
 *   1 — schemas differ (deploy needed), or the check could not run (local
 *       extraction failed, or the deployed schema could not be fetched —
 *       failing closed here so a broken SANITY_AUTH_TOKEN can't silently
 *       turn this into a no-op gate in CI)
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const studioDir = resolve(__dirname, '..')

console.log('\n🔍  Schema Parity Check')
console.log('══════════════════════════════════════════════\n')

// ─── Canonicalize for structural comparison: sort object keys recursively,
// leave array order intact (field order is semantically meaningful) ─────────

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize)
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonicalize(value[key])
        return acc
      }, {})
  }
  return value
}

function fieldNames(type) {
  return Array.isArray(type.fields) ? type.fields.map((f) => f.name) : null
}

function diffFieldNames(localType, deployedType) {
  const localFields = fieldNames(localType)
  const deployedFields = fieldNames(deployedType)
  if (!localFields || !deployedFields) return null
  const deployedSet = new Set(deployedFields)
  const localSet = new Set(localFields)
  return {
    addedFields: localFields.filter((f) => !deployedSet.has(f)),
    removedFields: deployedFields.filter((f) => !localSet.has(f)),
  }
}

// ─── Step 1: extract the local schema in manifest format ───────────────────
// (the same shape `sanity schema deploy` sends and `sanity schema list`
// returns — see extractManifestSchemaTypes in @sanity/cli)

const tmpDir = mkdtempSync(join(tmpdir(), 'sugartown-schema-parity-'))

let localWorkspaces
try {
  execSync(`npx sanity manifest extract --path ${tmpDir}`, {
    cwd: studioDir,
    stdio: 'pipe',
  })
  const manifestPath = join(tmpDir, 'create-manifest.json')
  if (!existsSync(manifestPath)) {
    console.error('   ❌ create-manifest.json not found after extraction')
    rmSync(tmpDir, { recursive: true, force: true })
    process.exit(1)
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  localWorkspaces = manifest.workspaces.map((ws) => ({
    name: ws.name,
    types: JSON.parse(readFileSync(join(tmpDir, ws.schema), 'utf8')),
  }))
  console.log(`   ✅ Local schema extracted (${localWorkspaces.length} workspace(s))`)
} catch (err) {
  console.error('   ❌ Failed to extract local schema:', err.message)
  rmSync(tmpDir, { recursive: true, force: true })
  process.exit(1)
} finally {
  rmSync(tmpDir, { recursive: true, force: true })
}

// ─── Step 2: fetch the deployed schema for every workspace ─────────────────

let deployedRecords
try {
  const raw = execSync('npx sanity schema list --json', {
    cwd: studioDir,
    stdio: 'pipe',
  }).toString()
  deployedRecords = JSON.parse(raw)
} catch (err) {
  console.log('   ❌ Could not fetch deployed schema info')
  console.log(`   ${(err.stderr || err.message || '').toString().trim()}`)
  console.log('')
  console.log('   If nothing has ever been deployed, run: npx sanity schema deploy')
  console.log('   Otherwise check SANITY_AUTH_TOKEN / CLI auth.')
  console.log('\n══════════════════════════════════════════════\n')
  process.exit(1)
}

// ─── Step 3 & 4: diff each local workspace against its deployed record ─────

let hasDrift = false
let hasUnmatchedWorkspace = false

for (const { name: workspaceName, types: localTypes } of localWorkspaces) {
  const untaggedId = `_.schemas.${workspaceName}`
  let deployedRecord = deployedRecords.find(
    (r) => r.workspace?.name === workspaceName && r._id === untaggedId,
  )

  if (!deployedRecord && deployedRecords.length === 1) {
    deployedRecord = deployedRecords[0]
    console.log(
      `   ⚠️  No exact match for workspace "${workspaceName}" — using the only deployed schema record found (workspace "${deployedRecord.workspace?.name}")`,
    )
  }

  if (!deployedRecord) {
    console.log(`   ⚠️  No deployed schema found for workspace "${workspaceName}"`)
    console.log('   Run: npx sanity schema deploy')
    hasUnmatchedWorkspace = true
    continue
  }

  let deployedTypes
  try {
    deployedTypes = JSON.parse(deployedRecord.schema)
  } catch (err) {
    console.error(`   ❌ Failed to parse deployed schema payload for "${workspaceName}":`, err.message)
    hasUnmatchedWorkspace = true
    continue
  }

  console.log(
    `   📋 Workspace "${workspaceName}": ${localTypes.length} local type(s), ${deployedTypes.length} deployed type(s) (last deployed ${deployedRecord._updatedAt || deployedRecord._createdAt})`,
  )

  const localByName = new Map(localTypes.map((t) => [t.name, t]))
  const deployedByName = new Map(deployedTypes.map((t) => [t.name, t]))

  const addedLocally = [...localByName.keys()].filter((n) => !deployedByName.has(n)).sort()
  const removedLocally = [...deployedByName.keys()].filter((n) => !localByName.has(n)).sort()
  const commonNames = [...localByName.keys()].filter((n) => deployedByName.has(n)).sort()

  const changed = []
  for (const name of commonNames) {
    const localCanon = JSON.stringify(canonicalize(localByName.get(name)))
    const deployedCanon = JSON.stringify(canonicalize(deployedByName.get(name)))
    if (localCanon !== deployedCanon) {
      changed.push({ name, fieldDiff: diffFieldNames(localByName.get(name), deployedByName.get(name)) })
    }
  }

  if (addedLocally.length === 0 && removedLocally.length === 0 && changed.length === 0) {
    console.log(`   ✅ "${workspaceName}": local and deployed schemas match`)
    continue
  }

  hasDrift = true
  console.log(`   ❌ "${workspaceName}": schema drift detected`)

  if (addedLocally.length) {
    console.log(`      ➕ ${addedLocally.length} type(s) added locally (not yet deployed):`)
    addedLocally.forEach((n) => console.log(`         - ${n}`))
  }

  if (removedLocally.length) {
    console.log(`      ➖ ${removedLocally.length} type(s) still deployed but removed locally (will be deleted on deploy):`)
    removedLocally.forEach((n) => console.log(`         - ${n}`))
  }

  if (changed.length) {
    console.log(`      🔄 ${changed.length} type(s) changed:`)
    changed.forEach(({ name, fieldDiff }) => {
      if (fieldDiff && (fieldDiff.addedFields.length || fieldDiff.removedFields.length)) {
        const parts = []
        if (fieldDiff.addedFields.length) parts.push(`+field(s) ${fieldDiff.addedFields.join(', ')}`)
        if (fieldDiff.removedFields.length) parts.push(`-field(s) ${fieldDiff.removedFields.join(', ')}`)
        console.log(`         - ${name}: ${parts.join('; ')}`)
      } else {
        console.log(`         - ${name}: definition differs (e.g. validation, options, title, or other non-field-list shape)`)
      }
    })
  }
}

console.log('')
if (hasDrift || hasUnmatchedWorkspace) {
  console.log('   To resolve, run:')
  console.log('   npx sanity schema deploy')
  console.log('\n══════════════════════════════════════════════\n')
  process.exit(1)
}

console.log('   ✅ No drift detected — local and deployed schemas match')
console.log('\n══════════════════════════════════════════════\n')
process.exit(0)
