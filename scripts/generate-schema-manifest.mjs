#!/usr/bin/env node
/**
 * generate-schema-manifest.mjs
 *
 * Walks apps/studio/schemas/documents/ and apps/studio/schemas/objects/,
 * parses field names and types from the TypeScript source via regex, and
 * emits apps/web/src/data/schemaManifest.js.
 *
 * Runs automatically at build time (wired into apps/web/package.json build script).
 * Also available manually: node scripts/generate-schema-manifest.mjs
 * Or: pnpm generate:schema-manifest
 *
 * Output is gitignored — do not commit schemaManifest.js directly.
 *
 * Relationship inference: any defineField with type: 'reference' and a
 * to: [{type: 'X'}] block emits a relationships[] entry.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs'
import { join, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DOCUMENTS_DIR = join(ROOT, 'apps/studio/schemas/documents')
const OBJECTS_DIR = join(ROOT, 'apps/studio/schemas/objects')
const SECTIONS_DIR = join(ROOT, 'apps/studio/schemas/sections')
const OUTPUT = join(ROOT, 'apps/web/src/data/schemaManifest.js')

// ── Group assignment ───────────────────────────────────────────────────────
// Override the default (documents→content, objects→atoms) for specific types.
const GROUP_OVERRIDES = {
  // taxonomy documents
  category: 'taxonomy',
  tag: 'taxonomy',
  project: 'taxonomy',
  person: 'taxonomy',
  tool: 'taxonomy',
  // infra documents
  siteSettings: 'infra',
  navigation: 'infra',
  redirect: 'infra',
  preheader: 'infra',
  homepage: 'infra',
  // deprecated documents — kept for backward compat, not used in new content
  footer: 'deprecated',
  header: 'deprecated',
  hero: 'deprecated',
  contentBlock: 'deprecated',
}

// ── Parsing helpers ────────────────────────────────────────────────────────

/** Extract the top-level type name from a schema file. */
function parseTypeName(src) {
  const m = src.match(/defineType\s*\(\s*\{[^}]*?name\s*:\s*['"]([^'"]+)['"]/)
  return m?.[1] ?? null
}

/**
 * Extract field entries. Returns { name, type, isRequired, isArray, refsTo[] }.
 * We parse by finding defineField blocks and extracting name/type/to.
 * The regex is intentionally simple — Sanity schemas follow consistent patterns.
 */
function parseFields(src) {
  const fields = []
  // Find all defineField({ ... }) blocks. We capture via balanced-brace walk.
  const starts = [...src.matchAll(/defineField\s*\(\s*\{/g)]
  for (const m of starts) {
    let depth = 1
    let i = m.index + m[0].length
    const blockStart = i
    while (i < src.length && depth > 0) {
      if (src[i] === '{') depth++
      else if (src[i] === '}') depth--
      i++
    }
    const block = src.slice(blockStart, i - 1)
    fields.push(parseFieldBlock(block))
  }
  return fields.filter(Boolean)
}

function parseFieldBlock(block) {
  const nameM = block.match(/name\s*:\s*['"]([^'"]+)['"]/)
  if (!nameM) return null
  const name = nameM[1]

  const typeM = block.match(/type\s*:\s*['"]([^'"]+)['"]/)
  const fieldType = typeM?.[1] ?? 'unknown'

  const isRequired = /\.required\(\)/.test(block)
  // Detect array wrapper: defineArrayMember or the field is inside an array block
  const isArray = /defineArrayMember/.test(block) || /of\s*:\s*\[/.test(block)

  // Extract reference targets: to: [{type: 'X'}, {type: 'Y'}]
  const refsTo = []
  if (fieldType === 'reference' || block.includes("type: 'reference'")) {
    const toM = block.match(/to\s*:\s*\[([^\]]+)\]/)
    if (toM) {
      const targets = [...toM[1].matchAll(/type\s*:\s*['"]([^'"]+)['"]/g)]
      refsTo.push(...targets.map((t) => t[1]))
    }
  }

  return { name, type: fieldType, isRequired, isArray, refsTo }
}

/** Format a field entry as a human-readable string (matching existing manifest style). */
function formatField(f) {
  if (f.refsTo.length > 0) {
    const isMany = f.isArray
    const arrow = isMany ? '[] →' : ' →'
    const targets = f.refsTo.join(' | ')
    const req = f.isRequired ? ' *' : ''
    return `${f.name}${arrow} ${targets}${req}`
  }
  const arrayMark = f.isArray ? '[]' : ''
  const req = f.isRequired ? ' *' : ''
  return `${f.name}${arrayMark} (${f.type})${req}`
}

// ── Process schema files ───────────────────────────────────────────────────

function processDir(dir, defaultKind, defaultGroup) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
  const results = []

  for (const file of files) {
    const src = readFileSync(join(dir, file), 'utf8')
    const typeName = parseTypeName(src)
    if (!typeName) continue

    const kind = defaultKind
    const group = GROUP_OVERRIDES[typeName] ?? defaultGroup
    const rawFields = parseFields(src)

    // De-duplicate fields (nested defineField inside blocks may produce duplicates
    // at top level — we keep only the first occurrence of each name).
    const seen = new Set()
    const fields = []
    for (const f of rawFields) {
      if (!seen.has(f.name)) {
        seen.add(f.name)
        fields.push(f)
      }
    }

    results.push({ typeName, kind, group, fields })
  }

  return results
}

// ── Derive relationships ───────────────────────────────────────────────────

function deriveRelationships(allTypes) {
  const rels = []
  const typeNames = new Set(allTypes.map((t) => t.typeName))

  for (const { typeName: from, fields } of allTypes) {
    for (const f of fields) {
      if (!f.refsTo.length) continue
      for (const to of f.refsTo) {
        if (!typeNames.has(to)) continue
        const isSelf = from === to
        const isMany = f.isArray
        rels.push({
          from,
          to,
          label: f.name,
          type: isSelf ? 'self' : isMany ? 'many' : 'one',
        })
      }
    }
  }

  return rels
}

// ── Emit JS ────────────────────────────────────────────────────────────────

function emit(entities, relationships) {
  const now = new Date().toISOString().slice(0, 10)

  const entitiesJs = entities
    .map(({ typeName, kind, group, fields }) => {
      const fieldsJs = fields
        .map((f) => `      ${JSON.stringify(formatField(f))},`)
        .join('\n')
      return `  {
    id: ${JSON.stringify(typeName)},
    label: ${JSON.stringify(typeName)},
    kind: ${JSON.stringify(kind)},
    group: ${JSON.stringify(group)},
    fields: [
${fieldsJs}
    ],
  },`
    })
    .join('\n')

  const relsJs = relationships
    .map((r) => `  { from: ${JSON.stringify(r.from)}, to: ${JSON.stringify(r.to)}, label: ${JSON.stringify(r.label)}, type: ${JSON.stringify(r.type)} },`)
    .join('\n')

  return `// DO NOT EDIT — generated by scripts/generate-schema-manifest.mjs
// Run: pnpm generate:schema-manifest
// Last generated: ${now}
//
// Data shape:
//   entities[] — one entry per Sanity schema type
//     { id, label, kind ('document'|'object'), group ('atoms'|'taxonomy'|'content'|'infra'), fields[] }
//   relationships[] — one entry per reference/embed relationship
//     { from, to, label, type ('one'|'many'|'self') }
//
// Groups:
//   atoms      — reusable building-block objects (link, ctaButton, richImage, etc.)
//   sections   — page section builder types (heroSection, accordionSection, etc.)
//   taxonomy   — controlled vocabulary documents (category, tag, project, person, tool)
//   content    — primary editorial document types (article, caseStudy, node, page, archivePage)
//   infra      — site configuration and infrastructure (siteSettings, navigation, redirect, etc.)
//   deprecated — legacy types kept for backward compat; not used in new content

export const entities = [
${entitiesJs}
]

export const relationships = [
${relsJs}
]
`
}

// ── Main ───────────────────────────────────────────────────────────────────

const documents = processDir(DOCUMENTS_DIR, 'document', 'content')
const objects = processDir(OBJECTS_DIR, 'object', 'atoms')
const sections = processDir(SECTIONS_DIR, 'object', 'sections')

const allTypes = [...objects, ...sections, ...documents]
const relationships = deriveRelationships(allTypes)

// Sort for stable output: objects first (atoms/sections), then documents by group
const ORDER = ['atoms', 'sections', 'taxonomy', 'content', 'infra', 'deprecated']
const sorted = allTypes.sort((a, b) => {
  const ai = ORDER.indexOf(a.group)
  const bi = ORDER.indexOf(b.group)
  if (ai !== bi) return ai - bi
  return a.typeName.localeCompare(b.typeName)
})

const output = emit(sorted, relationships)
mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, output, 'utf8')

const entityCount = sorted.length
const relCount = relationships.length

// Count assertion — fail the build if the manifest regresses below the known baseline.
// Update this floor when types are intentionally removed.
// portableTextConfig is excluded by design (config, not a schema type).
// answerBlock.ts filename is stale — the file defines citedBlock, which IS counted.
const ENTITY_FLOOR = 53 // SUG-126: DataTable shim removed, floor lowered from 54
if (entityCount < ENTITY_FLOOR) {
  console.error(`❌  schema manifest entity count regressed: expected ≥${ENTITY_FLOOR}, got ${entityCount}`)
  console.error('    If types were intentionally removed, update ENTITY_FLOOR in generate-schema-manifest.mjs.')
  process.exit(1)
}

console.log(`✅  schema manifest generated — ${entityCount} types, ${relCount} relationships → ${OUTPUT.replace(ROOT + '/', '')}`)
