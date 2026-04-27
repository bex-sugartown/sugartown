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
 *   pnpm validate:tokens -- --strict-colors   (also checks for hardcoded hex/rgba)
 *
 * --strict-colors flag:
 *   Checks component and page CSS files for hardcoded color values (hex, rgba, rgb)
 *   used directly as property values. Token definition files (tokens.css, theme*.css)
 *   are excluded — they are the definition layer and are permitted to contain raw values.
 *   Exits with code 1 if any hardcoded colors are found in non-token files.
 *
 * Exits with code 1 if any unknown token references are found.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, join, relative } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../..')

// ─── CLI flags ────────────────────────────────────────────────────────────────

const STRICT_COLORS = process.argv.includes('--strict-colors')
const CHECK_SYNC    = process.argv.includes('--check-sync')

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

// ─── Strict-colors configuration ─────────────────────────────────────────────

/**
 * Files that are EXEMPT from --strict-colors checks.
 * These are the token definition layer — they are permitted to contain raw color values.
 * Also includes Storybook override files that intentionally force raw CSS on Storybook UI.
 * Pattern match is against the relative path from ROOT.
 */
const STRICT_COLORS_EXEMPT_PATTERNS = [
  /\/tokens\.css$/,
  /\/theme\..*\.css$/,
  /\/theme\.css$/,
  /\.storybook\/docs-overrides\.css$/,  // Storybook UI overrides — intentional raw values
]

/** Regex to find a hardcoded color value used as a CSS property value. */
const HARDCODED_COLOR_RE = /(?::\s*|,\s*|\(\s*)(#[0-9a-fA-F]{3,8}|rgba?\s*\([^)]+\))/

/**
 * Find hardcoded color values in a CSS file.
 * Returns array of { lineNum, line, match } objects.
 *
 * Algorithm:
 * 1. Strip all CSS block comments (multi-line safe) from the full file content.
 * 2. Split into lines, then check each line for hardcoded values.
 * 3. Skip token definition lines (--st-*: ...) which belong to the definition layer.
 */
function findHardcodedColors(filePath) {
  const content = readFileSync(filePath, 'utf8')
  // Strip all block comments (including multi-line) before line-by-line analysis
  const noComments = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    // Replace with same number of newlines to preserve line numbers
    return match.replace(/[^\n]/g, '')
  })
  const violations = []
  const rawLines = content.split('\n')
  const strippedLines = noComments.split('\n')
  for (let i = 0; i < strippedLines.length; i++) {
    const stripped = strippedLines[i].replace(/\/\/.*$/, '').trim()

    // Skip blank or effectively empty lines
    if (!stripped) continue

    // Skip token definition lines (--st-*: ...) — those belong to the token layer
    if (/^\s*--st-[\w-]+\s*:/.test(rawLines[i])) continue

    const m = HARDCODED_COLOR_RE.exec(stripped)
    if (m) {
      violations.push({ lineNum: i + 1, line: rawLines[i].trim(), match: m[0].trim() })
    }
  }
  return violations
}

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

// ─── Check-sync helpers ───────────────────────────────────────────────────────

/**
 * Extract the content of the first :root {} block from a CSS file.
 * Handles multi-line blocks by brace-balancing from the opening {.
 */
function extractRootBlock(content) {
  const noComments = content.replace(/\/\*[\s\S]*?\*\//g, '')
  const rootIdx = noComments.search(/:root\s*\{/)
  if (rootIdx === -1) return ''
  const braceStart = noComments.indexOf('{', rootIdx)
  let depth = 1
  let i = braceStart + 1
  while (i < noComments.length && depth > 0) {
    if (noComments[i] === '{') depth++
    else if (noComments[i] === '}') depth--
    i++
  }
  return noComments.slice(braceStart + 1, i - 1)
}

/**
 * Parse --st-name: value; pairs from a CSS block.
 * Normalises whitespace in values for comparison.
 */
function parseTokenBlock(block) {
  const defs = new Map()
  for (const m of block.matchAll(/(--st-[\w-]+)\s*:\s*((?:[^;])+?)\s*;/g)) {
    const name = m[1]
    const value = m[2].replace(/\s+/g, ' ').trim()
    defs.set(name, value)
  }
  return defs
}

/**
 * Compare :root token values between two token source files.
 * Returns array of { name, webValue, pkgValue } for every mismatch.
 */
function diffRootTokens(webPath, pkgPath) {
  const webContent = readFileSync(webPath, 'utf8')
  const pkgContent = readFileSync(pkgPath, 'utf8')
  const webTokens = parseTokenBlock(extractRootBlock(webContent))
  const pkgTokens = parseTokenBlock(extractRootBlock(pkgContent))

  const conflicts = []
  for (const [name, webVal] of webTokens) {
    if (!pkgTokens.has(name)) continue  // web-only — informational, not an error
    const pkgVal = pkgTokens.get(name)
    if (webVal !== pkgVal) {
      conflicts.push({ name, webValue: webVal, pkgValue: pkgVal })
    }
  }
  return conflicts
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function run() {
  console.log('\n🎨  Sugartown CSS Token Reference Validator')
  if (STRICT_COLORS) console.log('   (--strict-colors mode: also checking for hardcoded hex/rgba)')
  if (CHECK_SYNC)    console.log('   (--check-sync mode: also diffing :root values across both token files)')
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

  // 4. Report token reference errors
  if (fileErrors.size === 0) {
    console.log('✅  All var(--st-*) references resolve to defined tokens.')
  } else {
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
  }

  // 5. --strict-colors: scan for hardcoded hex/rgba in non-exempt files
  let colorErrorCount = 0
  const colorFileErrors = new Map()

  if (STRICT_COLORS) {
    console.log('\n   🎨  Checking for hardcoded color values (--strict-colors)...\n')

    for (const file of cssFiles) {
      const rel = relative(ROOT, file)

      // Skip exempt files (token + theme files)
      if (STRICT_COLORS_EXEMPT_PATTERNS.some((p) => p.test(rel))) continue

      const violations = findHardcodedColors(file)
      if (violations.length > 0) {
        colorFileErrors.set(file, violations)
        colorErrorCount += violations.length
      }
    }

    if (colorFileErrors.size === 0) {
      console.log('✅  No hardcoded color values found in component/page CSS.\n')
    } else {
      console.log(`❌  Found ${colorErrorCount} hardcoded color value(s) in ${colorFileErrors.size} file(s):\n`)
      console.log('──────────────────────────────────────────────')

      for (const [file, violations] of colorFileErrors) {
        const rel = relative(ROOT, file)
        console.log(`\n   📄  ${rel}`)
        for (const { lineNum, line, match } of violations) {
          console.log(`        Line ${lineNum}: ${match}`)
          console.log(`        ↳  ${line}`)
        }
      }

      console.log('\n──────────────────────────────────────────────')
      console.log(`\n   Fix: replace hardcoded values with --st-* token references.`)
      console.log(`   Add new tokens to both token files if no suitable token exists.\n`)
    }
  }

  // 6. --check-sync: diff :root token values between the two canonical source files
  let syncErrorCount = 0

  if (CHECK_SYNC) {
    console.log('\n   🔁  Checking :root token value sync between canonical sources...\n')

    const [webSrc, pkgSrc] = TOKEN_SOURCES.map((p) => resolve(ROOT, p))
    const conflicts = diffRootTokens(webSrc, pkgSrc)
    syncErrorCount = conflicts.length

    if (conflicts.length === 0) {
      console.log('✅  All :root token values are in sync between both token files.\n')
    } else {
      console.log(`❌  Found ${conflicts.length} value conflict(s) between token source files:\n`)
      console.log('──────────────────────────────────────────────')
      for (const { name, webValue, pkgValue } of conflicts) {
        console.log(`\n   ${name}`)
        console.log(`        web: ${webValue}`)
        console.log(`        pkg: ${pkgValue}`)
      }
      console.log('\n──────────────────────────────────────────────')
      console.log(`\n   Fix: update packages/design-system/src/styles/tokens.css to match the`)
      console.log(`   canonical web values. The web file is the source of truth.\n`)
    }
  }

  // Exit with error if any checks failed
  if (fileErrors.size > 0 || colorErrorCount > 0 || syncErrorCount > 0) {
    process.exit(1)
  }
  process.exit(0)
}

run()
