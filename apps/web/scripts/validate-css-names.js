#!/usr/bin/env node
/**
 * validate-css-names.js — CSS Class Naming Convention Validator
 *
 * Flags CSS module class names in apps/web/src/pages/ that are named after a
 * content type or call-site rather than a structural pattern.
 *
 * The anti-pattern: naming a class after the first page that uses it
 * (e.g. .taxRow, .toolUrl, .alphaBtn) instead of the structural pattern
 * it expresses (e.g. .listRow, .entityUrl, .buttonStripItem). These names
 * get copy-pasted into new pages and diverge silently.
 *
 * Blocked prefixes (content-type or call-site scoped):
 *   tax*     — taxonomy context (use listRow, flatGridRow, etc.)
 *   alpha*   — AlphaStrip context (use buttonStrip*, controlRow*, etc.)
 *   tool*    — ToolDetailPage context (use entity*, folio*, etc.)
 *   person*  — PersonProfilePage context (use entity*, folio*, profile* if truly bespoke)
 *   project* — ProjectDetailPage context (use entity*, folio*, etc.)
 *   archive* — used as page-scoped prefix (use list*, grid*, etc.)
 *
 * Exceptions:
 *   pages.module.css is the shared registry — it may define any class
 *   Classes where the prefix IS the semantic meaning (e.g. .archivePage
 *     meaning "the archive page layout shell") can be added to KNOWN_EXCEPTIONS
 *
 * Usage:
 *   pnpm validate:css-names
 *
 * Exits with code 1 if violations are found.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, join, relative } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../..')
const PAGES_DIR = resolve(ROOT, 'apps/web/src/pages')

// These are the blocked name prefixes — content-type or call-site scoped
const BLOCKED_PREFIXES = [
  { prefix: 'tax', reason: 'taxonomy-scoped — use listRow, flatGridRow, or similar semantic name' },
  { prefix: 'alpha', reason: 'AlphaStrip-scoped — use buttonStrip*, controlRow*, or extend Pagination' },
  { prefix: 'toolLogo', reason: 'tool-page-scoped — use entityThumbnail or entityLogo' },
  { prefix: 'toolUrl', reason: 'tool-page-scoped — use entityUrl or externalLink' },
  { prefix: 'profileHeadline', reason: 'person-page-scoped — use narrativeHeading (already in pages.module.css)' },
  { prefix: 'profileShortName', reason: 'person-page-scoped — if truly bespoke, document why in the commit message' },
  // SUG-35 post-mortem: GlossaryTermPage shipped ~9 term* classes duplicating
  // pages.module.css + DS components. Any content-type prefix in a page module
  // is a signal the component-reuse audit was skipped.
  { prefix: 'term', reason: 'glossary-term-scoped — use entity*/detail* classes from pages.module.css or a DS component (see docs/conventions/detail-page-recipe.md)' },
  { prefix: 'glossary', reason: 'glossary-scoped — use semantic pattern names or DS components' },
  { prefix: 'node', reason: 'node-page-scoped — use entity*/detail* classes from pages.module.css' },
  { prefix: 'article', reason: 'article-page-scoped — use entity*/detail* classes from pages.module.css' },
  { prefix: 'caseStudy', reason: 'case-study-scoped — use entity*/detail* classes from pages.module.css' },
  { prefix: 'series', reason: 'series-page-scoped — use entity*/detail* classes from pages.module.css' },
]

// Classes in PAGES_DIR files that are permitted despite matching a blocked prefix.
// Add entries here with justification when a class is intentionally bespoke.
const KNOWN_EXCEPTIONS = new Set([
  // Example: 'alphaBtn' — kept bespoke because <reason>
  // GlossaryPage.module.css — survivors of the SUG-35 reuse refactor. In a glossary,
  // "term" IS the domain entity (dt/dd definition-list markup), not a call-site prefix.
  'termList', // archive definition list wrapper
  'termDt', // <dt> row in archive definition list
  'termDd', // <dd> definition in archive definition list
  'termLink', // term name link inside <dt>
  'termAbbr', // abbreviation badge — archive rows + popover only (detail uses Chip, SUG-162)
  'alphaFilterRow', // AlphaFilter DS component wrapper — spacing only, predates rule
  'glossaryLink', // inline PT annotation mark — glossary IS the semantic concept
  'glossaryPopover', // hover popover for glossary annotations
])

// pages.module.css is exempt — it is the shared registry
const EXEMPT_FILES = new Set(['pages.module.css'])

function getCssClasses(content) {
  const classRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)\s*[{,:]/g
  const classes = []
  let match
  while ((match = classRegex.exec(content)) !== null) {
    classes.push(match[1])
  }
  return [...new Set(classes)]
}

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const classes = getCssClasses(content)
  const violations = []

  for (const cls of classes) {
    if (KNOWN_EXCEPTIONS.has(cls)) continue
    for (const { prefix, reason } of BLOCKED_PREFIXES) {
      const lowerCls = cls.charAt(0).toLowerCase() + cls.slice(1)
      if (lowerCls.startsWith(prefix.toLowerCase())) {
        violations.push({ cls, reason })
        break
      }
    }
  }

  return violations
}

function walkDir(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      files.push(...walkDir(full))
    } else if (entry.endsWith('.module.css') && !EXEMPT_FILES.has(entry)) {
      files.push(full)
    }
  }
  return files
}

const files = walkDir(PAGES_DIR)
let totalViolations = 0

for (const file of files) {
  const violations = checkFile(file)
  if (violations.length > 0) {
    const relPath = relative(ROOT, file)
    console.error(`\n${relPath}`)
    for (const { cls, reason } of violations) {
      console.error(`  ✗  .${cls}  —  ${reason}`)
    }
    totalViolations += violations.length
  }
}

if (totalViolations > 0) {
  console.error(`\n${totalViolations} content-type-scoped CSS class name(s) found.`)
  console.error('Rename to semantic pattern names, or add to KNOWN_EXCEPTIONS with justification.')
  console.error('See docs/conventions/css-class-naming.md for naming rules.')
  process.exit(1)
} else {
  console.log('✓  No content-type-scoped CSS class names found in pages/.')
}
