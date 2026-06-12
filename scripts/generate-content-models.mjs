#!/usr/bin/env node
/**
 * generate-content-models.mjs
 *
 * Reads apps/studio/schemas/documents/*.ts for content-facing doc types,
 * extracts field names, types, required flags, descriptions, enum values,
 * and initialValues, then emits apps/web/src/generated/content-models.json.
 *
 * Run manually:   node scripts/generate-content-models.mjs
 * Or via pnpm:    pnpm generate:content-models
 * Build hook:     called from apps/web/package.json build script
 *
 * Output lives in apps/web/src/data/ (same location as schemaManifest.js) so it
 * is checked in and the platform page renders at cold-start without a build step.
 *
 * Design: purpose-built counterpart to generate-schema-manifest.mjs.
 * That script emits a compact ERD format; this one emits the rich per-field
 * detail (descriptions, enum values) needed for handoff one-pagers.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DOCUMENTS_DIR = join(ROOT, 'apps/studio/schemas/documents')
const OUTPUT = join(ROOT, 'apps/web/src/data/content-models.json')

// ── Doc types to include ───────────────────────────────────────────────────
// Content-facing types with public routes. Infra, deprecated, and internal
// types are excluded — handoff authors don't need to know about navigation docs.

const INCLUDE_TYPES = new Set([
  'article', 'caseStudy', 'node', 'page', 'archivePage',
  'glossaryTerm',
  'category', 'person', 'project', 'tag', 'tool',
])

// Render order — mirrors the site's content hierarchy
const TYPE_ORDER = [
  'article', 'caseStudy', 'node', 'page', 'archivePage', 'glossaryTerm',
  'person', 'project', 'tool', 'category', 'tag',
]

// ── Route mapping ──────────────────────────────────────────────────────────
// Mirrors TYPE_NAMESPACES + TAXONOMY_NAMESPACES in apps/web/src/lib/routes.js.
// Update here when routes.js changes.

const ROUTE_PATTERNS = {
  article:      '/articles/:slug',
  caseStudy:    '/case-studies/:slug',
  node:         '/knowledge-graph/:slug',
  page:         '/:slug',
  archivePage:  '/:slug',
  glossaryTerm: '/glossary/:slug',
  person:       '/people/:slug',
  project:      '/projects/:slug',
  tool:         '/tools/:slug',
  tag:          '/tags/:slug',
  category:     '/categories/:slug',
}

// ── Display field rule ─────────────────────────────────────────────────────
// All five taxonomy types use `name` as the display field, never `title`.
// Content types use `title` (or `term` for glossaryTerm).

const DISPLAY_FIELD = {
  article:      'title',
  caseStudy:    'title',
  node:         'title',
  page:         'title',
  archivePage:  'title',
  glossaryTerm: 'term',
  person:       'name',
  project:      'name',
  tool:         'name',
  tag:          'name',
  category:     'name',
}

const TAXONOMY_NOTE =
  'Taxonomy type — GROQ display field is `name` (not `title`). Fragments alias as `"title": name`.'

const TAXONOMY_TYPES = new Set(['person', 'project', 'tool', 'tag', 'category'])

// ── Parsing helpers ────────────────────────────────────────────────────────

/** Walk `str` from `start` to find matching closing char; returns end index. */
function walkBalanced(str, start, openCh, closeCh) {
  let depth = 1
  let i = start
  while (i < str.length && depth > 0) {
    if (str[i] === openCh) depth++
    else if (str[i] === closeCh) depth--
    i++
  }
  return i // position after the closing char
}

/** Extract the top-level type name. */
function parseTypeName(src) {
  const m = src.match(/defineType\s*\(\s*\{[^}]*?name\s*:\s*['"`]([^'"`]+)['"`]/)
  return m?.[1] ?? null
}

/**
 * Extract the human-readable title for a schema type.
 * Looks for `title: '...'` in the defineType block (before the first field).
 */
function parseTypeTitle(src) {
  const m = src.match(/defineType\s*\(\s*\{[\s\S]{0,300}?title\s*:\s*['"`]([^'"`]+)['"`]/)
  return m?.[1] ?? null
}

/**
 * Parse a string value that may use single, double, or backtick quotes.
 * Returns null if not found.
 */
function parseStringProp(block, prop) {
  const re = new RegExp(`${prop}\\s*:\\s*(?:'([^']*)'|"([^"]*)"|\\x60([^\\x60]*)\\x60)`)
  const m = block.match(re)
  if (!m) return null
  return m[1] ?? m[2] ?? m[3] ?? null
}

/**
 * Parse options.list enum values from a field block.
 * Returns [{title, value}] or null.
 */
function parseEnumValues(block) {
  const listSearch = /\blist\s*:\s*\[/.exec(block)
  if (!listSearch) return null

  const arrStart = listSearch.index + listSearch[0].length
  const arrEnd = walkBalanced(block, arrStart, '[', ']')
  const listContent = block.slice(arrStart, arrEnd - 1)

  const items = []
  let cursor = 0
  while (cursor < listContent.length) {
    const objStart = listContent.indexOf('{', cursor)
    if (objStart < 0) break
    const objEnd = walkBalanced(listContent, objStart + 1, '{', '}')
    const obj = listContent.slice(objStart + 1, objEnd - 1)
    const title = parseStringProp(obj, 'title')
    const value = parseStringProp(obj, 'value')
    if (title && value) items.push({ title, value })
    cursor = objEnd
  }

  return items.length ? items : null
}

/**
 * Extract top-level fields from a schema file.
 * "Top-level" = direct children of the root defineType's fields: [...] array.
 * Sub-fields inside of: [...] blocks are excluded — those are object member
 * schemas, not the document's own fields.
 */
function parseTopLevelFields(src) {
  // Find defineType's opening brace
  const typeMatch = /defineType\s*\(\s*\{/.exec(src)
  if (!typeMatch) return []
  const typeBodyStart = typeMatch.index + typeMatch[0].length

  // Walk the type body to find fields: [ at depth 1
  let braceDepth = 1
  let i = typeBodyStart
  let fieldsArrStart = -1

  while (i < src.length && braceDepth > 0) {
    const ch = src[i]
    if (ch === '{') braceDepth++
    else if (ch === '}') braceDepth--
    // Detect 'fields:' at braceDepth === 1
    if (braceDepth === 1) {
      const slice = src.slice(i, i + 8)
      if (/^fields\s*:/.test(slice)) {
        const bracketIdx = src.indexOf('[', i)
        if (bracketIdx >= 0) {
          fieldsArrStart = bracketIdx + 1
          break
        }
      }
    }
    i++
  }

  if (fieldsArrStart < 0) return []

  // Walk to find the matching ] of the fields array
  const fieldsArrEnd = walkBalanced(src, fieldsArrStart, '[', ']')
  const fieldsContent = src.slice(fieldsArrStart, fieldsArrEnd - 1)

  // Find defineField blocks at depth 0 within fieldsContent
  const fields = []
  const dfMatches = [...fieldsContent.matchAll(/defineField\s*\(\s*\{/g)]

  for (const m of dfMatches) {
    // Count nesting depth before this match to determine if it's top-level
    const prefix = fieldsContent.slice(0, m.index)
    let nestDepth = 0
    for (const ch of prefix) {
      if (ch === '{' || ch === '[' || ch === '(') nestDepth++
      else if (ch === '}' || ch === ']' || ch === ')') nestDepth--
    }
    if (nestDepth !== 0) continue // nested — skip

    // Extract block content
    const blockStart = m.index + m[0].length
    const blockEnd = walkBalanced(fieldsContent, blockStart, '{', '}')
    const block = fieldsContent.slice(blockStart, blockEnd - 1)

    const name = parseStringProp(block, 'name')
    if (!name) continue

    const type = parseStringProp(block, 'type') ?? 'unknown'
    const required = /\.required\(\)/.test(block)
    const isArray = /\bof\s*:\s*\[/.test(block)
    const description = parseStringProp(block, 'description')
    const initialValue = parseStringProp(block, 'initialValue')

    // Reference targets: to: [{type: '...'}, ...]
    const refsTo = []
    const toSearch = /\bto\s*:\s*\[/.exec(block)
    if (toSearch) {
      const toArrStart = toSearch.index + toSearch[0].length
      const toArrEnd = walkBalanced(block, toArrStart, '[', ']')
      const toContent = block.slice(toArrStart, toArrEnd - 1)
      for (const tm of toContent.matchAll(/type\s*:\s*['"`]([^'"`]+)['"`]/g)) {
        refsTo.push(tm[1])
      }
    }

    const enumValues = parseEnumValues(block)

    fields.push({ name, type, required, isArray, description, initialValue, refsTo, enumValues })
  }

  return fields
}

// ── Process schema files ───────────────────────────────────────────────────

import { readdirSync } from 'fs'

const files = readdirSync(DOCUMENTS_DIR).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))

const typeMap = new Map()

for (const file of files) {
  const src = readFileSync(join(DOCUMENTS_DIR, file), 'utf8')
  const typeName = parseTypeName(src)
  if (!typeName || !INCLUDE_TYPES.has(typeName)) continue

  const typeTitle = parseTypeTitle(src) ?? typeName
  const fields = parseTopLevelFields(src)
  const group = TAXONOMY_TYPES.has(typeName) ? 'taxonomy' : 'content'

  typeMap.set(typeName, {
    id: typeName,
    title: typeTitle,
    group,
    route: ROUTE_PATTERNS[typeName] ?? `/:slug`,
    displayField: DISPLAY_FIELD[typeName] ?? 'title',
    taxonomyNote: TAXONOMY_TYPES.has(typeName) ? TAXONOMY_NOTE : null,
    fieldCount: fields.length,
    fields,
  })
}

// Sort by TYPE_ORDER, then alphabetically for any not in the order list
const docTypes = TYPE_ORDER
  .filter((t) => typeMap.has(t))
  .map((t) => typeMap.get(t))

// Sanity check — fail if we couldn't parse any types
if (docTypes.length < 5) {
  console.error(`❌  content models generator: expected ≥5 types, got ${docTypes.length}. Check schema parsing.`)
  process.exit(1)
}

const output = {
  generatedAt: new Date().toISOString().slice(0, 10),
  note: 'DO NOT EDIT — generated by scripts/generate-content-models.mjs. Run: pnpm generate:content-models',
  typeCount: docTypes.length,
  docTypes,
}

mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf8')

console.log(`✅  content models generated — ${docTypes.length} types → ${OUTPUT.replace(ROOT + '/', '')}`)
for (const t of docTypes) {
  console.log(`    ${t.id.padEnd(14)} ${t.fieldCount} fields  ${t.route}`)
}
