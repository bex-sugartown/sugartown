import { createRequire } from 'node:module'
import { z } from 'zod'
import { repoPath } from '../lib/repo-root.js'

const BOUNDARIES_SOURCE = 'packages/eslint-config/boundaries.js'

export const checkBoundaryInputSchema = {
  from: z.string().describe('Repo-relative path of the importing module, e.g. "apps/web" or "packages/mcp-server"'),
  to: z.string().describe('Repo-relative path or package specifier being imported, e.g. "packages/design-system"'),
}

export interface BoundaryResult {
  permitted: boolean
  rule?: string
  source: string
}

interface RestrictedImportPattern {
  group: string[]
  message: string
}

interface EslintOverride {
  files: string[]
  rules: {
    'no-restricted-imports'?: ['error', { patterns: RestrictedImportPattern[] }]
  }
}

function loadOverrides(): EslintOverride[] {
  const require = createRequire(import.meta.url)
  // Live require of the real ESLint config — this is the enforced source of truth,
  // not a copy, so the tool can never drift from what `pnpm lint` actually checks.
  delete require.cache[require.resolve(repoPath(BOUNDARIES_SOURCE))]
  const mod = require(repoPath(BOUNDARIES_SOURCE)) as { overrides: EslintOverride[] }
  return mod.overrides
}

/** Converts an eslint `files` glob (e.g. 'packages/**\/*.{ts,tsx}') to a directory-prefix check. */
function filesGlobMatches(glob: string, from: string): boolean {
  const starIndex = glob.indexOf('*')
  const prefix = (starIndex === -1 ? glob : glob.slice(0, starIndex)).replace(/\/+$/, '')
  const normalizedFrom = from.replace(/\/+$/, '')
  return normalizedFrom === prefix || normalizedFrom.startsWith(`${prefix}/`)
}

/** Converts a no-restricted-imports group pattern (e.g. '**\/apps/**', '@sanity/**', 'sanity') to a match check. */
function importPatternMatches(pattern: string, to: string): boolean {
  const stripped = pattern.replace(/^\*\*\//, '').replace(/\/\*\*$/, '').replace(/\*\*$/, '')
  if (pattern.endsWith('/**') || pattern.startsWith('**/')) {
    return to === stripped || to.startsWith(`${stripped}/`) || to.includes(`/${stripped}/`) || to.endsWith(`/${stripped}`)
  }
  if (pattern.endsWith('/**') === false && pattern.includes('**')) {
    // e.g. '@sanity/**'
    return to.startsWith(stripped)
  }
  return to === pattern
}

export function checkBoundary(from: string, to: string): BoundaryResult {
  const overrides = loadOverrides()

  for (const override of overrides) {
    if (!override.files.some((glob) => filesGlobMatches(glob, from))) continue

    const restricted = override.rules['no-restricted-imports']
    if (!restricted) continue

    for (const pattern of restricted[1].patterns) {
      if (pattern.group.some((g) => importPatternMatches(g, to))) {
        return { permitted: false, rule: pattern.message, source: BOUNDARIES_SOURCE }
      }
    }
  }

  return { permitted: true, source: BOUNDARIES_SOURCE }
}
