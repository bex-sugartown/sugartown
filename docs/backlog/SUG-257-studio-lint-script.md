---
**Epic:** SUG-257 — apps/studio has no lint script — 86 pre-existing problems, invisible to every gate
**GitHub Issue:** [#85](https://github.com/bex-sugartown/sugartown/issues/85) (legacy ID SUG-257; Linear retired 2026-09-05)
**Status and priority:** on the board ([project 1](https://github.com/users/bex-sugartown/projects/1)), not copied here
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-257 — apps/studio lint script

## Verified 2026-09-19

Re-measured against the repo and Sanity. Where this section disagrees with the text below, this section is current.

- **82 problems, not 86: 66 errors, 16 warnings** (`apps/studio/node_modules/.bin/eslint .`, ESLint 9.39.2, 67 files).
- **All 66 errors are `no-undef` on `console`/`process` in 3 Node scripts:** `scripts/validate-schema-parity.js` (36), `scripts/migrate-colorHex-to-color-object.mjs` (17), `migrations/link-to-linkItem.js` (13). One `globals.node` block for `scripts/**` and `migrations/**` clears them. **Schema and component code has 0 errors.**
- All 16 warnings are in `components/TableBlockInput.tsx` (9 unused vars, 7 exhaustive-deps).
- **Six packages lint now, not four:** web, storybook, contentful-poc, design-system, mcp-server, storybook-docs.
- **Two claims overstate coverage and should be corrected when this lands:** the `.husky/pre-commit` comment says ESLint runs "across EVERY package", and `packages/eslint-config/boundary-rules.js:87` hardcodes "86 pre-existing problems".
- **Do this with #22 (ST-22).** Same package, same `package.json`.

## Background

`apps/studio` has **no** `lint` script at all. Its `eslint.config.mjs`
(`[...studio]` from `@sanity/eslint-config-studio`) exists but is never executed by
`pnpm lint`, `turbo run lint`, or CI — it only serves editor integration. Measured
2026-07-27 by running its own binary directly: `./node_modules/.bin/eslint .` →
**86 problems (70 errors, 16 warnings)**, mostly `no-undef` on `console`/`process` in
scripts (env config gap, not necessarily genuine defects — audit before mass-fixing).

Surfaced while scoping SUG-254 (ESLint architectural boundary enforcement), which found
two of its own Scope items vacuous because `apps/studio` has no boundary rule *and* no
lint script. That decision was parked in SUG-254 Phase 6, which paused indefinitely.
Filed separately per CLAUDE.md: items handed between epics are the ones most likely to
be silently dropped.

**Sequencing note (now cleared):** the original filing said "do not land before SUG-255
Phase 1," to keep this package's newly-red lint step distinguishable from the
CI-restoration work. **SUG-255 is Done** (shipped, CI green) — this epic is unblocked.

## Objective

`pnpm --filter studio lint` exists, `turbo run lint` picks it up, and `apps/studio`
passes in CI alongside the other four packages that already lint clean.

## Scope

- [ ] Add `"lint": "eslint ."` to `apps/studio/package.json` — layer: tooling
- [ ] Resolve the 86 problems, or configure the environment properly — audit first,
      most look like a missing `env: node` rather than genuine defects — layer: config/code
- [ ] Confirm `apps/studio` passes in CI alongside the other four packages — layer: CI

## Non-Goals

- Rewriting `apps/studio`'s eslint config beyond what's needed to pass — this is a
  coverage fix, not a rules redesign

## Acceptance Criteria

- [ ] `pnpm --filter studio lint` exits 0
- [ ] `turbo run lint` includes `studio` in its package list and it passes
- [ ] CI green with the new step included

## Related

- **GitHub:** [#85](https://github.com/bex-sugartown/sugartown/issues/85)
- **Origin:** SUG-254 Phase 6 (parked, epic paused), filed separately 2026-07-27
