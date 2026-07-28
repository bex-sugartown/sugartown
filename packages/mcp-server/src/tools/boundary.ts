import { createRequire } from 'node:module'
import { z } from 'zod'
import { repoPath } from '../lib/repo-root.js'

const BOUNDARIES_SOURCE = 'packages/eslint-config/boundary-rules.js'

export const checkBoundaryInputSchema = {
  from: z.string().describe('Repo-relative path of the importing module, e.g. "apps/web" or "packages/mcp-server"'),
  to: z.string().describe('Repo-relative path or package specifier being imported, e.g. "packages/design-system"'),
}

export interface BoundaryResult {
  permitted: boolean
  rule?: string
  source: string
  /** Set when `from` is a workspace deliberately outside boundary enforcement. */
  unenforced?: string
}

interface RestrictedImportPattern {
  group: string[]
  message: string
}

interface BoundaryRulesModule {
  SCOPES: Record<string, string[]>
  NO_BOUNDARY_SCOPE: Record<string, string>
  patternsFor: (scope: string) => RestrictedImportPattern[]
}

function loadBoundaryRules(): BoundaryRulesModule {
  const require = createRequire(import.meta.url)
  // Live require of the same module the ESLint configs consume — one source, so
  // this tool and `pnpm lint` cannot disagree.
  //
  // The previous version made that claim too, and it was false. It read
  // boundaries.js's `overrides[].files` globs and interpreted them as
  // repo-root-relative — i.e. as their author intended, not as ESLint actually
  // resolves them. ESLint matched nothing while this tool confidently answered
  // "not permitted", so `sugartown_check_boundary` spent 176 days as a
  // false-confidence oracle: right about the rules, wrong about reality.
  //
  // Reading SCOPES instead of globs removes the interpretation step entirely.
  // There is no glob left to disagree about. SUG-254.
  delete require.cache[require.resolve(repoPath(BOUNDARIES_SOURCE))]
  return require(repoPath(BOUNDARIES_SOURCE)) as BoundaryRulesModule
}

/**
 * Resolve an importing path to the workspace scope that owns it.
 * `apps/web/src/lib/foo.js` → `apps/web`. Longest match wins, so a nested
 * workspace resolves to itself rather than to its parent.
 */
function scopeFor(from: string, known: string[]): string | undefined {
  const normalized = from.replace(/\/+$/, '')
  return known
    .filter((scope) => normalized === scope || normalized.startsWith(`${scope}/`))
    .sort((a, b) => b.length - a.length)[0]
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
  const { SCOPES, NO_BOUNDARY_SCOPE, patternsFor } = loadBoundaryRules()

  const unenforcedScope = scopeFor(from, Object.keys(NO_BOUNDARY_SCOPE))
  const enforcedScope = scopeFor(from, Object.keys(SCOPES))

  // A deliberately-unenforced workspace answers "permitted", but says why rather
  // than implying the import was checked and cleared. The old tool could not
  // draw this distinction: an unmatched glob and a genuinely absent rule both
  // fell through to the same bare `permitted: true`.
  if (!enforcedScope) {
    return unenforcedScope
      ? { permitted: true, source: BOUNDARIES_SOURCE, unenforced: NO_BOUNDARY_SCOPE[unenforcedScope] }
      : {
          permitted: true,
          source: BOUNDARIES_SOURCE,
          unenforced: `"${from}" matches no workspace in SCOPES or NO_BOUNDARY_SCOPE — it is outside boundary enforcement entirely.`,
        }
  }

  for (const pattern of patternsFor(enforcedScope)) {
    if (pattern.group.some((g) => importPatternMatches(g, to))) {
      return { permitted: false, rule: pattern.message, source: BOUNDARIES_SOURCE }
    }
  }

  return { permitted: true, source: BOUNDARIES_SOURCE }
}
