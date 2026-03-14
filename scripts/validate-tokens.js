#!/usr/bin/env node
/**
 * validate-tokens.js — Token Drift Detector + Reference Scanner
 *
 * Compares the two CSS token files that MUST stay in sync:
 *   - Web (canonical): apps/web/src/design-system/styles/tokens.css
 *   - DS package:      packages/design-system/src/styles/tokens.css
 *
 * Reports:
 *   A) Properties present in web but missing from DS (drift — DS consumers break)
 *   B) Properties present in DS but missing from web (drift — web consumers break)
 *   C) Properties with different values between the two files
 *   D) Unknown var(--st-*) references in CSS files (broken token refs)
 *   E) Summary with exit code (1 if errors, 0 if clean)
 *
 * Component-scoped API tokens:
 *   Some components define --st-* tokens locally as CSS API surfaces
 *   (e.g. --st-media-overlay-color) with fallback values. These are
 *   intentionally undefined at the global level. Add them to
 *   COMPONENT_SCOPED_TOKENS below when creating new component APIs.
 *
 * This script runs at the monorepo root (not inside apps/web) because it
 * reads from both packages/design-system and apps/web.
 *
 * Usage:
 *   pnpm validate:tokens
 *   node scripts/validate-tokens.js
 *
 * Exits with code 1 if any drift or broken references are detected, 0 if clean.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, dirname, relative, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ─── File paths ──────────────────────────────────────────────────────────────

const WEB_TOKENS = resolve(ROOT, 'apps/web/src/design-system/styles/tokens.css')
const DS_TOKENS = resolve(ROOT, 'packages/design-system/src/styles/tokens.css')

// Directories to scan for var(--st-*) references
const SCAN_DIRS = [
  resolve(ROOT, 'apps/web/src'),
  resolve(ROOT, 'packages/design-system/src'),
]

// Directories/files to skip during reference scanning
const SKIP_PATTERNS = [
  'node_modules', 'dist', 'build', '.storybook', 'storybook-static',
  'artifacts', 'design-tokens.css',
]

// ─── Component-scoped API tokens ─────────────────────────────────────────────
// These tokens are intentionally undefined at the global level. They are CSS
// custom property API surfaces that components define locally with fallback
// values, allowing consumers to override them.
//
// When adding a new component that defines --st-* API tokens, register them
// here so the validator does not flag them as broken references.

const COMPONENT_SCOPED_TOKENS = new Set([
  // Media component
  '--st-media-duotone-shadow',
  '--st-media-overlay-gradient',
  '--st-media-overlay-color',
  '--st-media-overlay-opacity',
  '--st-media-overlay-blend',
  // Callout component
  '--st-callout-icon-color',
  // CodeBlock component
  '--st-code-font-size',
  // Table component
  '--st-table-max-width',
  '--st-table-min-width',
  // NavigationItem component
  '--st-color-bg-elevated',
])

// ─── Parse CSS custom properties ─────────────────────────────────────────────

function parseTokens(filePath) {
  let raw
  try {
    raw = readFileSync(filePath, 'utf8')
  } catch (err) {
    console.error(`[validate-tokens] Cannot read ${filePath}: ${err.message}`)
    process.exit(1)
  }

  const tokens = new Map()
  const noComments = raw.replace(/\/\*[\s\S]*?\*\//g, '')
  const regex = /(--[\w-]+)\s*:\s*([^;]+);/g
  let match
  while ((match = regex.exec(noComments)) !== null) {
    const name = match[1].trim()
    const value = match[2].replace(/\s+/g, ' ').trim()
    tokens.set(name, value)
  }

  return tokens
}

// ─── Scan CSS files for var(--st-*) references ──────────────────────────────

function shouldSkip(name) {
  return SKIP_PATTERNS.some((p) => name.includes(p))
}

function collectCssFiles(dir) {
  const files = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return files
  }
  for (const entry of entries) {
    if (shouldSkip(entry)) continue
    const full = resolve(dir, entry)
    let stat
    try {
      stat = statSync(full)
    } catch {
      continue
    }
    if (stat.isDirectory()) {
      files.push(...collectCssFiles(full))
    } else if (extname(entry) === '.css') {
      files.push(full)
    }
  }
  return files
}

function scanReferences(definedTokens) {
  const unknowns = [] // { file, line, token }

  for (const dir of SCAN_DIRS) {
    const cssFiles = collectCssFiles(dir)
    for (const file of cssFiles) {
      // Skip the token files themselves (definitions, not references)
      if (file === WEB_TOKENS || file === DS_TOKENS) continue

      const raw = readFileSync(file, 'utf8')
      const noComments = raw.replace(/\/\*[\s\S]*?\*\//g, '')
      const lines = noComments.split('\n')

      for (let i = 0; i < lines.length; i++) {
        // Match all var(--st-*) references on this line
        const refs = lines[i].matchAll(/var\(\s*(--st-[\w-]+)/g)
        for (const ref of refs) {
          const token = ref[1]
          if (
            !definedTokens.has(token) &&
            !COMPONENT_SCOPED_TOKENS.has(token)
          ) {
            unknowns.push({
              file: relative(ROOT, file),
              line: i + 1,
              token,
            })
          }
        }
      }
    }
  }

  return unknowns
}

// ─── Categorize differences ──────────────────────────────────────────────────

const DS_ONLY_ALLOWLIST = new Set([
  '--st-font-sans',
])

// ─── Run validation ───────────────────────────────────────────────────────────

function run() {
  console.log('\n🎨  Sugartown Token Drift Validator')
  console.log('══════════════════════════════════════════════\n')

  const webTokens = parseTokens(WEB_TOKENS)
  const dsTokens = parseTokens(DS_TOKENS)

  // Merge all defined tokens (union of both files + theme files)
  const allDefined = new Set([...webTokens.keys(), ...dsTokens.keys()])

  // Also parse theme files for additional token definitions
  const themeFiles = [
    resolve(ROOT, 'apps/web/src/design-system/styles/theme.light.css'),
    resolve(ROOT, 'apps/web/src/design-system/styles/theme.pink-moon.css'),
    resolve(ROOT, 'apps/web/src/design-system/styles/globals.css'),
  ]
  for (const tf of themeFiles) {
    try {
      const themeTokens = parseTokens(tf)
      for (const [name] of themeTokens) allDefined.add(name)
    } catch { /* ignore missing files */ }
  }

  console.log(`   Web tokens (canonical): ${webTokens.size} properties`)
  console.log(`   DS package tokens:      ${dsTokens.size} properties`)
  console.log(`   Total defined (all sources): ${allDefined.size} properties\n`)

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
    if (!dsTokens.has(name)) continue
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

  // ── D) Unknown token references ────────────────────────────────────────────

  console.log('🔍  Unknown var(--st-*) References')
  console.log('──────────────────────────────────────────────')

  const unknowns = scanReferences(allDefined)

  if (unknowns.length === 0) {
    console.log('   ✅  All var(--st-*) references resolve to defined tokens')
  } else {
    // Group by token for cleaner output
    const byToken = new Map()
    for (const u of unknowns) {
      if (!byToken.has(u.token)) byToken.set(u.token, [])
      byToken.get(u.token).push(`${u.file}:${u.line}`)
    }

    console.log(`   ❌  ${unknowns.length} unknown reference(s) across ${byToken.size} token(s):`)
    for (const [token, locations] of [...byToken.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      console.log(`        ${token}`)
      for (const loc of locations) {
        console.log(`          ${loc}`)
      }
    }
    errors += unknowns.length
  }
  console.log()

  // ── E) Summary ─────────────────────────────────────────────────────────────

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
  if (unknowns.length > 0) {
    console.log(
      `❌  ${unknowns.length} unknown var(--st-*) reference(s) in CSS files.`,
    )
    console.log('   Fix: replace with canonical token names, register missing tokens,')
    console.log('   or add to COMPONENT_SCOPED_TOKENS if they are intentional API surfaces.')
  }
  if (warnings > 0) {
    console.log(
      `⚠️   ${warnings} value mismatch(es) — same property, different resolved value.`,
    )
    console.log('   Fix: decide which value is canonical and update the other file.')
  }
  console.log()

  process.exit(totalDrift > 0 || unknowns.length > 0 ? 1 : 0)
}

run()
