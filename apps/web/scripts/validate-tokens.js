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
 * SCOPE — what this validator does NOT check (important):
 *   This checks that every var(--st-*) reference RESOLVES. It does NOT check
 *   that the duplicated theme/style files carry the same override SET across
 *   web and the DS package. "refs resolve" ≠ "themes match": a token missing
 *   from one theme file still resolves via the shared tokens.css, so theme
 *   drift is invisible here. Theme-file parity is enforced separately by
 *   `pnpm validate:style-mirror` (scripts/validate-style-mirror.js). See the
 *   theme.pink-moon.css drift post-mortem (2026-06-13).
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
 * Raw fallback check (always on, blocking):
 *   var(--st-token, <anything that is not var(--st-*)>) is rejected in every scanned
 *   file, for any value type (space, size, radius, colour, keyword). The only permitted
 *   fallback form is var(--st-token, var(--st-primitive)) (.claude/rules/tokens.md).
 *   Token source files are not scanned, so tokens.css composition is unaffected.
 *
 * Type bundle check (always on, blocking; ST-227):
 *   1. `font-size` set to a heading or label size token (--st-font-page-h1,
 *      --st-font-heading-1 to -3, --st-label-size) anywhere but
 *      packages/design-system/src/styles/type.module.css. Such a site composes the
 *      bundle class instead. --st-font-heading-4 is not checked: it doubles as the
 *      body text size. Classified exceptions are listed in TYPE_BUNDLE_EXCEPTIONS.
 *   2. An `outline` inside a selector containing "focus" that reads neither
 *      var(--st-focus-ring) nor --st-color-focus, and is not `none`.
 *
 * Exits with code 1 if any unknown token references, raw fallbacks or type bundle
 * violations are found.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, join, relative } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../..')

// ─── CLI flags ────────────────────────────────────────────────────────────────

const STRICT_COLORS = process.argv.includes('--strict-colors')

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

// ─── Type bundle configuration (ST-227) ──────────────────────────────────────

const TYPE_BUNDLE_FILE = 'packages/design-system/src/styles/type.module.css'
const BUNDLE_SIZE_RE = /^var\(\s*--st-(font-page-h1|font-heading-[123]|label-size)\s*\)$/
const FOCUS_OUTLINE_OK_RE = /var\(\s*--st-focus-ring\s*\)|--st-color-focus\b|^none$/

/**
 * Sites classified in docs/backlog/ST-227-heading-label-focus-bundles.md §Site
 * classification as not a bundle. Key: "<path relative to repo root> :: <selector>".
 */
const TYPE_BUNDLE_EXCEPTIONS = new Map([
  ['apps/web/src/components/Hero.module.css :: .subheading', 'hero lead paragraph, not a heading'],
  ['apps/web/src/components/PageSections.module.css :: .heroSubheading', 'hero lead paragraph, not a heading'],
  ['apps/web/src/components/PageSections.module.css :: .heroStatValue', 'stat numeral, not a heading'],
  ['apps/web/src/components/StatCard.module.css :: .foot', 'mono meta line: no weight, no uppercase'],
  ['apps/web/src/design-system/components/tile/Tile.module.css :: .meta', 'mono meta line: no weight, no uppercase'],
  ['packages/design-system/src/components/SectionLabel/SectionLabel.module.css :: .number', 'section numeral: tighter tracking, no uppercase'],
  ['packages/design-system/src/components/Card/Card.module.css :: .compact .eyebrow', 'compact-mode size step in a descendant selector'],
  ['packages/design-system/src/components/Card/Card.module.css :: .compact .folioLabel', 'compact-mode size step in a descendant selector'],
  ['packages/design-system/src/components/Card/Card.module.css :: .compact .footerCategoryLink', 'compact-mode size step in a descendant selector'],
  ['packages/design-system/src/components/Card/Card.module.css :: .compact .date', 'compact-mode size step in a descendant selector'],
  ['apps/web/src/components/ImageLightbox.module.css :: *', 'heavier 3px ring over images'],
  ['apps/web/src/components/PageSections.module.css :: .carouselArrow:focus-visible, .imageExpand:focus-visible', 'heavier 3px ring over images'],
])

/**
 * Split a CSS file into rule blocks: { selector, line, decls: [{ prop, value, line }] }.
 * Comments are blanked first so line numbers hold. Nested @media blocks are walked.
 */
function parseBlocks(filePath) {
  const src = readFileSync(filePath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  const blocks = []
  const stack = []
  let buf = ''
  let bufLine = 1
  let line = 1
  for (const ch of src) {
    if (ch === '{') {
      stack.push({ selector: buf.trim().replace(/\s+/g, ' '), line: bufLine, decls: [] })
      buf = ''
    } else if (ch === ';' || ch === '}') {
      const top = stack[stack.length - 1]
      if (top && buf.includes(':')) {
        const i = buf.indexOf(':')
        top.decls.push({ prop: buf.slice(0, i).trim().toLowerCase(), value: buf.slice(i + 1).trim().replace(/\s+/g, ' '), line: bufLine })
      }
      buf = ''
      if (ch === '}' && stack.length) {
        const b = stack.pop()
        if (!b.selector.startsWith('@') && b.decls.length) blocks.push(b)
      }
    } else {
      if (!buf.trim() && !/\s/.test(ch)) bufLine = line
      buf += ch
    }
    if (ch === '\n') line++
  }
  return blocks
}

const usedTypeBundleExceptions = new Set()

/** True when the block is a classified exception and it would otherwise be flagged. */
function isTypeBundleException(rel, selector) {
  for (const key of [`${rel} :: ${selector}`, `${rel} :: *`]) {
    if (TYPE_BUNDLE_EXCEPTIONS.has(key)) {
      usedTypeBundleExceptions.add(key)
      return true
    }
  }
  return false
}

/** Returns array of { lineNum, line, match } for type bundle violations in one file. */
function findTypeBundleViolations(filePath) {
  const rel = relative(ROOT, filePath)
  if (rel === TYPE_BUNDLE_FILE) return []
  const violations = []
  for (const b of parseBlocks(filePath)) {
    for (const d of b.decls) {
      const sizeHit = d.prop === 'font-size' && BUNDLE_SIZE_RE.test(d.value)
      const focusHit = d.prop === 'outline' && b.selector.includes('focus') && !FOCUS_OUTLINE_OK_RE.test(d.value)
      if ((sizeHit || focusHit) && isTypeBundleException(rel, b.selector)) continue
      if (sizeHit) {
        violations.push({ lineNum: d.line, line: `${b.selector} { font-size: ${d.value} }`, match: 'compose the bundle from type.module.css' })
      }
      if (focusHit) {
        violations.push({ lineNum: d.line, line: `${b.selector} { outline: ${d.value} }`, match: 'use outline: var(--st-focus-ring)' })
      }
    }
  }
  return violations
}

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

/**
 * Find var(--st-*, <raw>) fallbacks: any fallback that is not itself a var(--st-*) reference.
 * Comments are stripped first (newlines kept) so prose mentioning the pattern is ignored.
 * Returns array of { lineNum, line, match } objects.
 */
const RAW_FALLBACK_RE = /var\(\s*(--st-[\w-]+)\s*,\s*(?!var\(\s*--st-)[^)\s][^)]*\)?/g

function findRawFallbacks(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const noComments = content.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ''))
  const rawLines = content.split('\n')
  const strippedLines = noComments.split('\n')
  const violations = []
  for (let i = 0; i < strippedLines.length; i++) {
    for (const m of strippedLines[i].matchAll(RAW_FALLBACK_RE)) {
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

// ─── Main ─────────────────────────────────────────────────────────────────────

function run() {
  console.log('\n🎨  Sugartown CSS Token Reference Validator')
  if (STRICT_COLORS) console.log('   (--strict-colors mode: also checking for hardcoded hex/rgba)')
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

  // 6. Raw fallbacks (any value type), every scanned file
  let fallbackErrorCount = 0
  const fallbackFileErrors = new Map()
  for (const file of cssFiles) {
    const violations = findRawFallbacks(file)
    if (violations.length > 0) {
      fallbackFileErrors.set(file, violations)
      fallbackErrorCount += violations.length
    }
  }
  if (fallbackFileErrors.size === 0) {
    console.log('✅  No raw var(--st-*, <value>) fallbacks found.\n')
  } else {
    console.log(`❌  Found ${fallbackErrorCount} raw token fallback(s) in ${fallbackFileErrors.size} file(s):\n`)
    console.log('──────────────────────────────────────────────')
    for (const [file, violations] of fallbackFileErrors) {
      console.log(`\n   📄  ${relative(ROOT, file)}`)
      for (const { lineNum, line, match } of violations) {
        console.log(`        Line ${lineNum}: ${match}`)
        console.log(`        ↳  ${line}`)
      }
    }
    console.log('\n──────────────────────────────────────────────')
    console.log(`\n   Fix: drop the fallback, or use var(--st-token, var(--st-primitive)). Add the primitive to tokens.json first if none exists.\n`)
  }

  // 7. Type bundles (ST-227): heading and label sizes, focus outlines
  let bundleErrorCount = 0
  const bundleFileErrors = new Map()
  for (const file of cssFiles) {
    const violations = findTypeBundleViolations(file)
    if (violations.length > 0) {
      bundleFileErrors.set(file, violations)
      bundleErrorCount += violations.length
    }
  }
  const staleExceptions = [...TYPE_BUNDLE_EXCEPTIONS.keys()].filter((k) => !usedTypeBundleExceptions.has(k))
  if (staleExceptions.length > 0) {
    console.log(`❌  ${staleExceptions.length} TYPE_BUNDLE_EXCEPTIONS entr${staleExceptions.length === 1 ? 'y' : 'ies'} no longer match a site; remove ${staleExceptions.length === 1 ? 'it' : 'them'}:`)
    for (const k of staleExceptions) console.log(`        ${k}`)
    console.log('')
    bundleErrorCount += staleExceptions.length
  }
  if (bundleFileErrors.size === 0 && staleExceptions.length === 0) {
    console.log('✅  Heading and label sizes come from type.module.css; focus outlines read --st-focus-ring.\n')
  } else {
    console.log(`❌  Found ${bundleErrorCount} type bundle violation(s) in ${bundleFileErrors.size} file(s):\n`)
    console.log('──────────────────────────────────────────────')
    for (const [file, violations] of bundleFileErrors) {
      console.log(`\n   📄  ${relative(ROOT, file)}`)
      for (const { lineNum, line, match } of violations) {
        console.log(`        Line ${lineNum}: ${match}`)
        console.log(`        ↳  ${line}`)
      }
    }
    console.log('\n──────────────────────────────────────────────')
    console.log(`\n   Fix: composes: heading2 from '@sugartown/design-system/styles/type.module.css' (or headingPage, heading1 to heading3, monoLabel);`)
    console.log(`   focus rings use outline: var(--st-focus-ring); outline-offset: var(--st-focus-ring-offset).\n`)
  }

  // Exit with error if any checks failed
  if (fileErrors.size > 0 || colorErrorCount > 0 || fallbackErrorCount > 0 || bundleErrorCount > 0) {
    process.exit(1)
  }
  process.exit(0)
}

run()
