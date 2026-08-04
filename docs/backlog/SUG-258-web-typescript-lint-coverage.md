---
**Epic:** SUG-258 — apps/web lints only .js/.jsx — 32 TypeScript files under src/ are ungated
**Linear Issue:** [SUG-258](https://linear.app/sugartown/issue/SUG-258/appsweb-lints-only-jsjsx-32-typescript-files-under-src-are-ungated)
**Status:** Todo
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-258 — apps/web TypeScript lint coverage

## Background

`apps/web/eslint.config.js` matches `src/**/*.{js,jsx}` only. `apps/web/src` contains
**32** `.ts`/`.tsx` files (30 stories plus 2 fixtures) linted by nothing — not
`pnpm lint`, not pre-commit, not CI. Measured 2026-07-27 during SUG-254's activation
audit.

Two gates believe they cover these files and don't: (1) lint — `pnpm --filter web lint`
is the one lint command `.husky/pre-commit` runs; (2) boundary enforcement (SUG-254) —
Rule 3 ("apps/web cannot import apps/studio") is wired into this same flat config, and
any violation in a `.ts`/`.tsx` file under `src/` would go uncaught. Rule 3 is clean
across all 32 today, verified by exhaustive grep, **not** by lint.

**Bundling window (closed):** this was meant to land alongside SUG-254 Phase 4, which
rewrites this same `eslint.config.js`. **SUG-254 Ph4 shipped 2026-07-28** (`fd6c5f7f`)
without it — `apps/web/eslint.config.js:27` still reads
`files: ['src/**/*.{js,jsx}']`. This epic now stands alone and touches that file a
second time. **SUG-255 Phase 1 is Done** (the other sequencing condition), so nothing
blocks starting.

## Objective

`apps/web`'s flat config extends coverage to `src/**/*.{ts,tsx}` via
`typescript-eslint`, and SUG-254's Rule 3 applies to the newly-covered files.

## Scope

- [ ] Add `typescript-eslint` to `apps/web`'s flat config, extend coverage to
      `src/**/*.{ts,tsx}` — layer: tooling
- [ ] Fix whatever fresh debt surfaces — these files have never been linted; the DS
      package's own story files needed 7 fixes for the same rule set (`52eb7702`),
      expect a similar order of magnitude — layer: code
- [ ] Confirm SUG-254's Rule 3 (boundary enforcement) applies to the newly-covered
      files — layer: config verification

## Non-Goals

- Rewriting the boundary rules themselves — SUG-254's scope, already shipped

## Acceptance Criteria

- [ ] `pnpm --filter web lint` covers all `.ts`/`.tsx` files under `src/`, exits 0
- [ ] A deliberately-introduced `apps/studio` import from a `.tsx` file under `src/`
      fails lint (Rule 3 proven live on the newly-covered file type)

## Related

- **Linear:** [SUG-258](https://linear.app/sugartown/issue/SUG-258)
- **Origin:** 2026-07-25→27 post-mortem; SUG-254 Phase 6 (parked, epic paused)
