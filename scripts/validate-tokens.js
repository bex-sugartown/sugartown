#!/usr/bin/env node
/**
 * validate-tokens.js — Token Drift Detector
 *
 * Compares the two CSS token files that MUST stay in sync:
 *   - Web (canonical): apps/web/src/design-system/styles/tokens.css
 *   - DS package:      packages/design-system/src/styles/tokens.css
 *
 * Reports:
 *   A) Properties present in web but missing from DS (drift — DS consumers break)
 *   B) Properties present in DS but missing from web (drift — web consumers break)
 *   C) Properties with different values between the two files
 *   D) Summary with exit code (1 if errors, 0 if clean)
 *
 * This script runs at the monorepo root (not inside apps/web) because it
 * reads from both packages/design-system and apps/web.
 *
 * Usage:
 *   pnpm validate:tokens
 *   node scripts/validate-tokens.js
 *
 * Exits with code 1 if any drift is detected, 0 if files are in sync.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ─── File paths ──────────────────────────────────────────────────────────────

const WEB_TOKENS = resolve(ROOT, 'apps/web/src/design-system/styles/tokens.css')
const DS_TOKENS = resolve(ROOT, 'packages/design-system/src/styles/tokens.css')

// ─── Parse CSS custom properties ─────────────────────────────────────────────
// Extracts all --property: value pairs from a CSS file.
// Handles multi-line values (font stacks, etc.) by looking for the closing ;
// Skips comments and blank lines.

function parseTokens(filePath) {
  let raw
  try {
    raw = readFileSync(filePath, 'utf8')
  } catch (err) {
    console.error(`[validate-tokens] Cannot read ${filePath}: ${err.message}`)
    process.exit(1)
  }

  const tokens = new Map()

  // Strip block comments /* ... */
  const noComments = raw.replace(/\/\*[\s\S]*?\*\//g, '')

  // Match --property: value; (allowing multi-line values)
  const regex = /(--[\w-]+)\s*:\s*([^;]+);/g
  let match
  while ((match = regex.exec(noComments)) !== null) {
    const name = match[1].trim()
    // Normalize whitespace in the value (collapse multi-line, trim)
    const value = match[2].replace(/\s+/g, ' ').trim()
    tokens.set(name, value)
  }

  return tokens
}

// ─── Categorize differences ──────────────────────────────────────────────────

// Known legacy aliases that exist only in DS for back-compat (per MEMORY.md).
// These are expected to be DS-only and are NOT considered drift.
const DS_ONLY_ALLOWLIST = new Set([
  '--st-font-sans',
  // Add future back-compat aliases here
])

// ─── Run validation ───────────────────────────────────────────────────────────

function run() {
  console.log('\n🎨  Sugartown Token Drift Validator')
  console.log('══════════════════════════════════════════════\n')

  const webTokens = parseTokens(WEB_TOKENS)
  const dsTokens = parseTokens(DS_TOKENS)

  console.log(`   Web tokens (canonical): ${webTokens.size} properties`)
  console.log(`   DS package tokens:      ${dsTokens.size} properties\n`)

  let errors = 0
  let warnings = 0

  // ── A) Present in web but missing from DS ──────────────────────────────────

  console.log('📤  Missing from DS package (present in web only)')
  console.log('──────────────────────────────────────────────')

  const missingFromDS = []
  for (const [name] of webTokens) {
    if (!dsTokens.has(name)) {
      missingFromDS.push(name)
    }
  }

  if (missingFromDS.length === 0) {
    console.log('   ✅  All web tokens are present in DS')
  } else {
    console.log(`   ❌  ${missingFromDS.length} token(s) in web but missing from DS:`)
    for (const name of missingFromDS.sort()) {
      console.log(`        ${name}: ${webTokens.get(name)}`)
    }
    errors += missingFromDS.length
  }
  console.log()

  // ── B) Present in DS but missing from web ──────────────────────────────────

  console.log('📥  Missing from web (present in DS only)')
  console.log('──────────────────────────────────────────────')

  const missingFromWeb = []
  const allowlisted = []
  for (const [name] of dsTokens) {
    if (!webTokens.has(name)) {
      if (DS_ONLY_ALLOWLIST.has(name)) {
        allowlisted.push(name)
      } else {
        missingFromWeb.push(name)
      }
    }
  }

  if (missingFromWeb.length === 0 && allowlisted.length === 0) {
    console.log('   ✅  All DS tokens are present in web')
  } else {
    if (missingFromWeb.length > 0) {
      console.log(`   ❌  ${missingFromWeb.length} token(s) in DS but missing from web:`)
      for (const name of missingFromWeb.sort()) {
        console.log(`        ${name}: ${dsTokens.get(name)}`)
      }
      errors += missingFromWeb.length
    }
    if (allowlisted.length > 0) {
      console.log(`   ℹ️   ${allowlisted.length} DS-only legacy alias(es) (allowlisted):`)
      for (const name of allowlisted.sort()) {
        console.log(`        ${name}: ${dsTokens.get(name)}`)
      }
    }
  }
  console.log()

  // ── C) Value mismatches ────────────────────────────────────────────────────

  console.log('⚖️   Value Mismatches')
  console.log('──────────────────────────────────────────────')

  const mismatches = []
  for (const [name, webValue] of webTokens) {
    if (!dsTokens.has(name)) continue // already reported as missing
    const dsValue = dsTokens.get(name)
    if (webValue !== dsValue) {
      mismatches.push({ name, webValue, dsValue })
    }
  }

  if (mismatches.length === 0) {
    console.log('   ✅  All shared tokens have matching values')
  } else {
    console.log(`   ⚠️   ${mismatches.length} token(s) with different values:`)
    for (const { name, webValue, dsValue } of mismatches.sort((a, b) => a.name.localeCompare(b.name))) {
      console.log(`        ${name}`)
      console.log(`          web: ${webValue}`)
      console.log(`          ds:  ${dsValue}`)
    }
    warnings += mismatches.length
  }
  console.log()

  // ── D) Summary ─────────────────────────────────────────────────────────────

  const totalDrift = missingFromDS.length + missingFromWeb.length

  console.log('══════════════════════════════════════════════')

  if (errors === 0 && warnings === 0) {
    console.log('✅  Token files are in sync — zero drift detected.\n')
    process.exit(0)
  }

  if (totalDrift > 0) {
    console.log(
      `❌  ${totalDrift} MISSING token(s) — these cause guaranteed-invalid CSS values.`,
    )
    console.log('   Fix: copy missing tokens between files so both have the same set.')
  }
  if (warnings > 0) {
    console.log(
      `⚠️   ${warnings} value mismatch(es) — same property, different resolved value.`,
    )
    console.log('   Fix: decide which value is canonical and update the other file.')
  }
  console.log()

  // Missing tokens are errors (guaranteed-invalid), value mismatches are warnings
  process.exit(totalDrift > 0 ? 1 : 0)
}

run()
