/**
 * design-system.js — ds namespace collector (SUG-67)
 *
 * Counts tokens and component CSS files from the canonical token file
 * and both DS component directories.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

const TOKENS_PATH = resolve(process.cwd(), 'src/design-system/styles/tokens.css')
const COMPONENT_DIRS = [
  resolve(process.cwd(), 'src/design-system/components'),
  resolve(process.cwd(), '../../packages/design-system/src/components'),
]

const SKIP_DIRS = new Set(['node_modules', 'dist', '.turbo'])

function walkCss(dir) {
  const results = []
  try {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) results.push(...walkCss(full))
      else if (entry.endsWith('.module.css')) results.push(full)
    }
  } catch {}
  return results
}

export function collectDesignSystem() {
  const css = readFileSync(TOKENS_PATH, 'utf-8')
  const allTokenLines = css.match(/^\s*--st-[\w-]+\s*:/gm) || []
  const total = allTokenLines.length

  // Primitives: scale tokens like --st-color-pink-500, --st-color-softgrey-100
  const primitives = allTokenLines.filter(l => /--st-(?:color|shadow)-[\w]+-\d{2,3}:/.test(l)).length

  const color  = allTokenLines.filter(l => /--st-color/.test(l)).length
  const space  = allTokenLines.filter(l => /--st-space|--st-size/.test(l)).length
  const font   = allTokenLines.filter(l => /--st-font/.test(l)).length
  const shadow = allTokenLines.filter(l => /--st-shadow|--st-effect/.test(l)).length
  const other  = total - color - space - font - shadow

  const componentFiles = COMPONENT_DIRS.reduce((n, dir) => n + walkCss(dir).length, 0)

  return {
    tokens: {
      total,
      primitives,
      component: total - primitives,
      byCategory: { color, space, font, shadow, other },
    },
    componentFiles,
  }
}
