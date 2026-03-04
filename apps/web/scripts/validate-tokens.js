#!/usr/bin/env node
/**
 * validate-tokens.js — Dev-time CSS Token Reference Validator
 *
 * Scans all CSS files in the project and checks that every var(--st-*)
 * reference resolves to a token that is actually defined in the canonical
 * token source files. Catches silent fallback bugs where a token name is
 * wrong or was renamed — CSS var() silently uses the fallback value with
 * no browser error or warning.
 *
 * Token source files (ground truth):
 *   apps/web/src/design-system/styles/tokens.css  (canonical)
 *   packages/design-system/src/styles/tokens.css  (must stay in sync)
 *
 * CSS files scanned:
 *   apps/web/src/**\/*.css
 *   packages/design-system/src/**\/*.css
 *   apps/storybook/.storybook/**\/*.css
 *
 * Usage:
 *   pnpm validate:tokens
 *
 * Exits with code 1 if any unknown token references are found.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, join, relative } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../..')

// ─── Token source files (define the valid --st-* universe) ───────────────────

const TOKEN_SOURCES = [
  'apps/web/src/design-system/styles/tokens.css',
  'packages/design-system/src/styles/tokens.css',
]

// ─── Directories to scan for var(--st-*) references ──────────────────────────

const SCAN_DIRS = [
  'apps/web/src',
  'packages/design-system/src',
  'apps/storybook/.storybook',
]

// Directories to always skip during walk
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.turbo', 'coverage'])

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract all --st-* token names defined in a CSS file.
 * Matches both top-level and scoped definitions (in :root, [data-theme], etc.).
 */
function extractDefinedTokens(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const defined = new Set()
  for (const m of content.matchAll(/^\s*(--st-[\w-]+)\s*:/gm)) {
    defined.add(m[1])
  }
  return defined
}

/**
 * Walk a directory recursively, yielding .css file paths.
 * Skips SKIP_DIRS. Includes .storybook subdirectory explicitly.
 */
function* walkCSS(dir) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    let stat
    try {
      stat = statSync(full)
    } catch {
      continue
    }
    if (stat.isDirectory()) {
      yield* walkCSS(full)
    } else if (entry.endsWith('.css') && !entry.endsWith('.min.css')) {
      yield full
    }
  }
}

/**
 * Extract all var(--st-*) references from a CSS file, with line numbers.
 * Returns array of { token, line, src } objects.
 */
function extractReferences(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const refs = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(/var\(\s*(--st-[\w-]+)/g)) {
      refs.push({ token: m[1], line: i + 1, src: lines[i].trim() })
    }
  }
  return refs
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function run() {
  console.log('\n🎨  Sugartown CSS Token Reference Validator')
  console.log('══════════════════════════════════════════════\n')

  // 1. Build the union of all defined --st-* tokens
  const definedTokens = new Set()
  for (const relPath of TOKEN_SOURCES) {
    const absPath = resolve(ROOT, relPath)
    try {
      const tokens = extractDefinedTokens(absPath)
      tokens.forEach((t) => definedTokens.add(t))
      console.log(`   📄  Loaded ${tokens.size} tokens from ${relPath}`)
    } catch (err) {
      console.error(`   ❌  Could not read token source: ${relPath} — ${err.message}`)
      process.exit(1)
    }
  }
  console.log(`\n   ✅  ${definedTokens.size} unique tokens defined across sources\n`)

  // 2. Collect CSS files to scan (exclude the token sources themselves,
  //    since var() composition within tokens.css is always valid)
  const tokenSourceAbs = new Set(TOKEN_SOURCES.map((p) => resolve(ROOT, p)))
  const cssFiles = []
  for (const dir of SCAN_DIRS) {
    for (const file of walkCSS(resolve(ROOT, dir))) {
      if (!tokenSourceAbs.has(file)) {
        cssFiles.push(file)
      }
    }
  }
  console.log(`   🔍  Scanning ${cssFiles.length} CSS files for var(--st-*) references\n`)

  // 3. Check every reference
  let errorCount = 0
  const fileErrors = new Map()

  for (const file of cssFiles) {
    const refs = extractReferences(file)
    const unknown = refs.filter((r) => !definedTokens.has(r.token))
    if (unknown.length > 0) {
      fileErrors.set(file, unknown)
      errorCount += unknown.length
    }
  }

  // 4. Report
  if (fileErrors.size === 0) {
    console.log('✅  All var(--st-*) references resolve to defined tokens.\n')
    process.exit(0)
  }

  console.log(`❌  Found ${errorCount} unknown token reference(s) in ${fileErrors.size} file(s):\n`)
  console.log('──────────────────────────────────────────────')

  for (const [file, refs] of fileErrors) {
    const rel = relative(ROOT, file)
    console.log(`\n   📄  ${rel}`)
    for (const { token, line, src } of refs) {
      console.log(`        Line ${line}: ${token}`)
      console.log(`        ↳  ${src}`)
    }
  }

  console.log('\n──────────────────────────────────────────────')
  console.log(`\n   Fix: check token name spelling against apps/web/src/design-system/styles/tokens.css`)
  console.log(`   Common cause: token renamed but reference not updated (silent fallback to hardcoded value)\n`)

  process.exit(1)
}

run()
