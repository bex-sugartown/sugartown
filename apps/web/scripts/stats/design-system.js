/**
 * design-system.js — ds namespace collector (SUG-67)
 *
 * Counts tokens and component CSS files from the canonical token file
 * and both DS component directories.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

const TOKENS_PATH = resolve(process.cwd(), 'src/design-system/styles/tokens.css')

// DS package primitives vs web adapter layer — tracked separately for the dashboard
const DS_PKG_DIR    = resolve(process.cwd(), '../../packages/design-system/src/components')
const WEB_ADAPT_DIR = resolve(process.cwd(), 'src/design-system/components')

// All CSS dirs scanned for token compliance audit
const TOKEN_SCAN_DIRS = [
  resolve(process.cwd(), 'src'),
  resolve(process.cwd(), '../../packages/design-system/src'),
]

const SKIP_DIRS = new Set(['node_modules', 'dist', '.turbo'])

function walkCss(dir, all = false) {
  const results = []
  try {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) results.push(...walkCss(full, all))
      else if (all ? entry.endsWith('.css') : entry.endsWith('.module.css')) results.push(full)
    }
  } catch {}
  return results
}

// Count top-level component subdirectories (each dir = one component)
function countComponentDirs(dir) {
  try {
    return readdirSync(dir).filter(e => {
      if (e.startsWith('.')) return false
      try { return statSync(join(dir, e)).isDirectory() } catch { return false }
    }).length
  } catch { return 0 }
}

// Count DS package component dirs that have at least one story file
function countDsComponentsWithStories(dir) {
  try {
    return readdirSync(dir).filter(e => {
      if (e.startsWith('.')) return false
      const full = join(dir, e)
      try {
        if (!statSync(full).isDirectory()) return false
        return readdirSync(full).some(f => f.includes('.stories.'))
      } catch { return false }
    }).length
  } catch { return 0 }
}

function computeTokenCompliance() {
  const cssFiles = TOKEN_SCAN_DIRS.flatMap(d => walkCss(d, true))
  let stRefs = 0
  let totalRefs = 0
  for (const file of cssFiles) {
    try {
      const src = readFileSync(file, 'utf-8')
      const refs = [...src.matchAll(/var\((--[\w-]+)/g)].map(m => m[1])
      totalRefs += refs.length
      stRefs    += refs.filter(r => r.startsWith('--st-')).length
    } catch {}
  }
  return totalRefs > 0 ? Math.round((stRefs / totalRefs) * 100) : 100
}

export function collectDesignSystem() {
  const css = readFileSync(TOKENS_PATH, 'utf-8')
  const allTokenLines = css.match(/^\s*--st-[\w-]+\s*:/gm) || []
  const total = allTokenLines.length

  // Primitives: scale tokens (--st-color-pink-500) + bare palette names (--st-color-pink)
  const primitives = allTokenLines.filter(l =>
    /--st-(?:color|shadow)-[\w]+-\d{2,3}:/.test(l) ||
    /--st-color-(?:pink|maroon|lime|seafoam|midnight|charcoal|softgrey|ink|black|white|violet|amber|orange|sky):/.test(l)
  ).length

  // Semantic: intent/role tokens — brand, bg, text, border, accent, focus
  const semantic = allTokenLines.filter(l =>
    /--st-color-(?:brand|bg|text|border|accent|focus|canvas|rule|overlay|interactive|status|signal)-/.test(l)
  ).length

  const color  = allTokenLines.filter(l => /--st-color/.test(l)).length
  const space  = allTokenLines.filter(l => /--st-space|--st-size/.test(l)).length
  const font   = allTokenLines.filter(l => /--st-font/.test(l)).length
  const shadow = allTokenLines.filter(l => /--st-shadow|--st-effect/.test(l)).length
  const other  = total - color - space - font - shadow

  const dsComponents          = countComponentDirs(DS_PKG_DIR)
  const webAdapters           = countComponentDirs(WEB_ADAPT_DIR)
  const dsComponentsWithStories = countDsComponentsWithStories(DS_PKG_DIR)
  const componentFiles        = walkCss(DS_PKG_DIR).length + walkCss(WEB_ADAPT_DIR).length

  const tokenCompliance = computeTokenCompliance()

  return {
    tokens: {
      total,
      primitives,
      semantic,
      component: total - primitives - semantic,
      byCategory: { color, space, font, shadow, other },
    },
    dsComponents,
    dsComponentsWithStories,
    webAdapters,
    componentFiles,
    tokenCompliance,
  }
}
