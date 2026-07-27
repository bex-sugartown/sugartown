import { z } from 'zod'
import { listRepoDir, readRepoFile, repoFileExists } from '../lib/file-reader.js'

const COMPONENTS_DIR = ['packages', 'design-system', 'src', 'components']

export const getComponentInputSchema = {
  name: z.string().describe('Component name, e.g. "Button" (case-sensitive, matches the component directory name)'),
}

export interface ComponentResult {
  status: 'found'
  name: string
  path: string
  storyCount: number
  hasStories: boolean
  hasCssModule: boolean
}

export interface ComponentNotFoundResult {
  status: 'not_found'
  name: string
  suggestions: string[]
}

function listComponentNames(): string[] {
  return listRepoDir(...COMPONENTS_DIR)
    .filter((e) => e.isDirectory)
    .map((e) => e.name)
    .sort()
}

function nearestNameSuggestions(name: string, candidates: string[], max = 5): string[] {
  const needle = name.toLowerCase()
  const scored = candidates
    .map((c) => ({ c, score: levenshtein(needle, c.toLowerCase()) }))
    .sort((a, b) => a.score - b.score)
  return scored.slice(0, max).map((s) => s.c)
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

export function getComponent(name: string): ComponentResult | ComponentNotFoundResult {
  const componentDir = [...COMPONENTS_DIR, name]
  if (!repoFileExists(...componentDir)) {
    return { status: 'not_found', name, suggestions: nearestNameSuggestions(name, listComponentNames()) }
  }

  const entries = listRepoDir(...componentDir)
  const storiesFile = entries.find((e) => !e.isDirectory && /\.stories\.tsx?$/.test(e.name))
  const hasCssModule = entries.some((e) => !e.isDirectory && /\.module\.css$/.test(e.name))

  let storyCount = 0
  if (storiesFile) {
    const source = readRepoFile(...componentDir, storiesFile.name)
    storyCount = (source.match(/^export const \w+/gm) ?? []).length
  }

  return {
    status: 'found',
    name,
    path: [...componentDir].join('/'),
    storyCount,
    hasStories: !!storiesFile,
    hasCssModule,
  }
}
