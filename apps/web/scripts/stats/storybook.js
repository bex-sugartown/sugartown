/**
 * storybook.js — storybook namespace collector (SUG-67)
 *
 * Counts story files and individual exported story variants across the
 * storybook app.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

const STORYBOOK_DIR = resolve(process.cwd(), '../../apps/storybook')

const SKIP_DIRS = new Set(['node_modules', 'dist', '.turbo', 'storybook-static'])

function walkStories(dir) {
  const results = []
  try {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) results.push(...walkStories(full))
      else if (/\.stories\.[jt]sx?$/.test(entry)) results.push(full)
    }
  } catch {}
  return results
}

export function collectStorybook() {
  const files = walkStories(STORYBOOK_DIR)
  const components = files.length

  let stories = 0
  for (const f of files) {
    try {
      const src = readFileSync(f, 'utf-8')
      // Count named exports (each is a story variant); exclude `export default`
      const named = (src.match(/^export const \w+/gm) || []).length
      stories += named
    } catch {}
  }

  return { stories, components }
}
