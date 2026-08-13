/**
 * boundary-rules.js — architectural boundary rules as DATA.
 *
 * Replaces `boundaries.js`, which declared four `no-restricted-imports` rules
 * and enforced none of them for 176 days. Four independent causes, all verified
 * empirically before this rewrite (SUG-254):
 *
 *   A. `overrides[].files` globs were written repo-root-relative
 *      (`'packages/design-system/**'`), but ESLint anchors them to the consuming
 *      config's own directory. `root: true` pins that basePath, so no cwd change
 *      could rescue them. Rules 1, 2 and 4 matched nothing, always.
 *   B. Rules 1 and 2 both set `no-restricted-imports` on overlapping globs.
 *      ESLint's override merge is last-wins per rule and does NOT concatenate
 *      `patterns` arrays, so Rule 1 was silently discarded for design-system
 *      even in the hypothetical where A was fixed.
 *   C. `apps/web`, `apps/studio` and `apps/contentful-poc` are ESLint v9 flat
 *      config, which cannot consume legacy `overrides[].files` at all.
 *   D. Rule 4's glob was `**\/*.{ts}`. minimatch does not expand a
 *      single-element brace, so it matched nothing regardless of A.
 *
 * The fix is structural, not a patch. Every one of those causes is a
 * *file-matching* failure, so this module does no file matching. A boundary
 * rule never needs to know its own path: each package's lint run is already
 * scoped to that package's directory, which is exactly the fact the globs were
 * redundantly (and wrongly) re-deriving.
 *
 * A workspace either appears in SCOPES and gets rules, or appears in
 * NO_BOUNDARY_SCOPE with a stated reason. There is no third state — an unknown
 * scope throws rather than silently resolving to "no rules", because a typo
 * that no-ops is the precise failure this file exists to make impossible.
 *
 * This module is data only: no ESLint shape, no globs, no `require('eslint')`.
 * `packages/mcp-server/src/tools/boundary.ts` reads it directly to answer
 * `sugartown_check_boundary`, so it must stay free of config-format concerns.
 */

// ─── The four rules, keyed by name ───────────────────────────────────────────
// Unchanged in substance from boundaries.js — this epic fixes enforcement of
// the existing rule set and deliberately adds nothing to it.

const RULES = {
  noAppImports: {
    group: ['**/apps/**'],
    message: 'Packages cannot import from apps. This violates architectural boundaries.',
  },
  cmsAgnostic: {
    group: ['**/apps/studio/**', 'sanity', '@sanity/**', 'groq'],
    message: 'design-system must remain CMS-agnostic. No Sanity or CMS imports allowed.',
  },
  noStudioImports: {
    group: ['**/apps/studio/**'],
    message: 'apps/web cannot import from apps/studio. Use packages/content adapter instead.',
  },
  noDesignSystemImports: {
    group: ['**/packages/design-system/**', '@sugartown/design-system'],
    message:
      'packages/mcp-server reads the design system as data, not as a dependency. No import from packages/design-system allowed.',
  },
}

// ─── Which rules apply where ─────────────────────────────────────────────────
// Keys are workspace directories relative to repo root. Every workspace with a
// `lint` script must appear here or in NO_BOUNDARY_SCOPE.

const SCOPES = {
  'packages/design-system': ['noAppImports', 'cmsAgnostic'],
  'packages/mcp-server': ['noAppImports', 'noDesignSystemImports'],
  'packages/storybook-docs': ['noAppImports'],
  'apps/web': ['noStudioImports'],
}

// ─── Workspaces deliberately outside boundary enforcement ────────────────────
// Each entry states why. This is an audited list, not a dumping ground.
//
// The two `apps/` entries below are why SUG-254's original Scope items "port
// enforcement into apps/studio" and "resolve apps/storybook's lint-script scope"
// were struck rather than implemented: no rule names either as the *importing*
// side, so there was no enforcement to port and no deliberate violation
// constructible. Adding one would have meant inventing a fifth rule, which this
// epic's Non-Goals forbid. Recording the absence explicitly beats leaving it as
// an omission somebody later reads as an oversight.

const NO_BOUNDARY_SCOPE = {
  'apps/storybook':
    'no rule names apps/storybook as the importing side, and its lint script is scoped to .storybook/ only. Storybook stays an app; SUG-254 moved the shared doc helpers to packages/storybook-docs so nothing needs to import across the boundary.',
  'apps/studio':
    'no rule names apps/studio as the importing side (Rule 3 restricts web FROM studio, not studio itself). Also has no lint script at all — 86 pre-existing problems if one were added. Tracked as SUG-257.',
  'apps/contentful-poc':
    'a self-contained POC on its own flat config, slated to leave this repo (PROJ-007). No rule names it, and adding one would expand the rule set. Reassess if it becomes permanent.',
}

/**
 * Return one flat, merged pattern array for a workspace.
 *
 * Flat and merged is the point: cause B was ESLint discarding one rule when two
 * declarations collided on the same rule name. One declaration cannot collide
 * with itself, so B cannot recur no matter how many rules a scope accumulates.
 *
 * @param {string} scope workspace dir relative to repo root, e.g. 'apps/web'
 * @returns {Array<{group: string[], message: string}>}
 */
function patternsFor(scope) {
  if (scope in NO_BOUNDARY_SCOPE) {
    throw new Error(
      `[boundary-rules] "${scope}" is in NO_BOUNDARY_SCOPE and has no patterns.\n` +
        `  Reason: ${NO_BOUNDARY_SCOPE[scope]}\n` +
        `  If it should now be enforced, move it to SCOPES.`
    )
  }
  const keys = SCOPES[scope]
  if (!keys) {
    throw new Error(
      `[boundary-rules] unknown scope "${scope}".\n` +
        `  Known scopes: ${Object.keys(SCOPES).join(', ')}\n` +
        `  Deliberately unenforced: ${Object.keys(NO_BOUNDARY_SCOPE).join(', ')}\n` +
        `  Throwing rather than returning [] on purpose — a scope typo that quietly\n` +
        `  resolves to "no rules" is how these rules stayed dead for 176 days.`
    )
  }
  return keys.map((k) => {
    const rule = RULES[k]
    if (!rule) throw new Error(`[boundary-rules] scope "${scope}" names unknown rule "${k}"`)
    return rule
  })
}

module.exports = { RULES, SCOPES, NO_BOUNDARY_SCOPE, patternsFor }
