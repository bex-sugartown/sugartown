#!/usr/bin/env node
/**
 * registry-build.js — Component Registry Generator
 *
 * Scans both DS layers and produces component-registry.json at the repo root.
 * The registry is machine-readable: queryable by Claude Code, CI gates,
 * and future Storybook plugins.
 *
 * Usage:
 *   pnpm registry:build
 *
 * Output:
 *   component-registry.json (repo root)
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'fs'
import { resolve, join, relative } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const DS_PRIMITIVES_DIR  = join(ROOT, 'packages/design-system/src/components')
const WEB_ADAPTERS_DIR   = join(ROOT, 'apps/web/src/design-system/components')
const OUTPUT_FILE        = join(ROOT, 'component-registry.json')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readFile(path) {
  try { return readFileSync(path, 'utf8') } catch { return null }
}

function fileExists(path) {
  return existsSync(path) && statSync(path).isFile()
}

function relPath(absPath) {
  return relative(ROOT, absPath)
}

/** Extract all var(--st-*) references from a CSS string. */
function extractTokenRefs(css) {
  const matches = [...css.matchAll(/var\((--st-[a-z0-9-]+)/g)]
  return [...new Set(matches.map(m => m[1]))].sort()
}

/** Extract exported story names from a .stories.tsx file. */
function extractStoryNames(source) {
  const matches = [...source.matchAll(/^export const ([A-Z][a-zA-Z0-9]+):/gm)]
  return matches
    .map(m => m[1])
    .filter(n => n !== 'default' && n !== 'meta')
}

/** Extract variant/size union literals from a TypeScript interface. */
function extractVariants(source) {
  const variantMatch = source.match(/variant\??\s*:\s*([^;]+);/)
  if (!variantMatch) return []
  return [...variantMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1])
}

// ─── Build ────────────────────────────────────────────────────────────────────

const componentDirs = readdirSync(DS_PRIMITIVES_DIR).filter(name => {
  const p = join(DS_PRIMITIVES_DIR, name)
  return statSync(p).isDirectory() && !name.startsWith('.')
})

const components = componentDirs.map(name => {
  const dsDir = join(DS_PRIMITIVES_DIR, name)
  const webDir = join(WEB_ADAPTERS_DIR, name.toLowerCase())

  // ── DS Primitives layer ────────────────────────────────────────────────────
  const dsComponent = join(dsDir, `${name}.tsx`)
  const dsStyles    = join(dsDir, `${name}.module.css`)
  const dsIndex     = join(dsDir, 'index.ts')
  const dsReadme    = join(dsDir, 'README.md')
  const dsSpec      = join(dsDir, `${name.toUpperCase()}_SPEC.md`)
    || join(dsDir, `${name}_SPEC.md`)

  // Collect all story files (e.g. Card.stories.tsx, CardGrid.stories.tsx)
  const allDsFiles  = readdirSync(dsDir)
  const dsStories   = allDsFiles
    .filter(f => f.endsWith('.stories.tsx'))
    .map(f => relPath(join(dsDir, f)))

  const dsSource = readFile(dsComponent) || ''
  const dsCss    = readFile(dsStyles) || ''

  // ── Web Adapters layer ─────────────────────────────────────────────────────
  const webAdapterExists = existsSync(webDir) && statSync(webDir).isDirectory()
  const webComponent = webAdapterExists ? join(webDir, `${name}.jsx`) : null
  const webStyles    = webAdapterExists ? join(webDir, `${name}.module.css`) : null
  const webCss       = webStyles ? (readFile(webStyles) || '') : ''

  // ── Tokens ─────────────────────────────────────────────────────────────────
  const tokensConsumed = extractTokenRefs(dsCss + '\n' + webCss)

  // ── Variants (from primary story file) ─────────────────────────────────────
  const primaryStoryPath = join(dsDir, `${name}.stories.tsx`)
  const storySource = readFile(primaryStoryPath) || ''
  const storyExports = extractStoryNames(storySource)

  // ── Variant prop options (from component source) ────────────────────────────
  const variantOptions = extractVariants(dsSource)

  // ── Spec file search ───────────────────────────────────────────────────────
  const specCandidates = allDsFiles.filter(f =>
    f.endsWith('_SPEC.md') || f.endsWith('_spec.md') || f === 'README.md'
  )
  const specFile = specCandidates.length > 0
    ? relPath(join(dsDir, specCandidates[0]))
    : null

  return {
    name,
    pinkMoonStatus: 'active',
    dsPackage: {
      component: fileExists(dsComponent)  ? relPath(dsComponent)  : null,
      styles:    fileExists(dsStyles)     ? relPath(dsStyles)      : null,
      index:     fileExists(dsIndex)      ? relPath(dsIndex)       : null,
      stories:   dsStories,
      spec:      specFile,
    },
    webAdapter: webAdapterExists ? {
      component: webComponent && fileExists(webComponent) ? relPath(webComponent) : null,
      styles:    webStyles    && fileExists(webStyles)    ? relPath(webStyles)    : null,
    } : null,
    tokensConsumed,
    variants: variantOptions,
    storyExports,
  }
})

const registry = {
  version:   '1.0.0',
  generated: new Date().toISOString(),
  source:    'scripts/registry-build.js',
  components,
}

writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2) + '\n')

const total = components.length
const withAdapters = components.filter(c => c.webAdapter?.component).length
const totalTokens = [...new Set(components.flatMap(c => c.tokensConsumed))].length

console.log(`✓ component-registry.json written`)
console.log(`  ${total} DS primitives, ${withAdapters} with web adapters, ${totalTokens} unique tokens referenced`)
