---
**Epic:** SUG-258 — apps/web lints only .js/.jsx — 32 TypeScript files under src/ are ungated
**GitHub Issue:** [#86](https://github.com/bex-sugartown/sugartown/issues/86) (legacy ID SUG-258; Linear retired 2026-09-05)
**Status and priority:** on the board ([project 1](https://github.com/users/bex-sugartown/projects/1)), not copied here
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-258 — apps/web TypeScript lint coverage

## Verified 2026-09-19

Re-measured against the repo and Sanity. Where this section disagrees with the text below, this section is current.

- **Still exactly as filed.** `apps/web/eslint.config.js:27` matches `src/**/*.{js,jsx}`. 32 `.ts`/`.tsx` files under `apps/web/src` (30 stories, 2 fixtures); ESLint reports "no matching configuration" for them.
- **Pre-commit now runs `pnpm lint`** (SUG-255), not `pnpm --filter web lint`. The files are still skipped.
- **Needs a new dependency.** apps/web has no `typescript-eslint`. The repo's only copy is v6 in `packages/eslint-config`, built for ESLint 8. apps/web runs ESLint 9, so it needs v8.
- **Add a `.tsx` liveness probe.** The Rule 3 probe (`scripts/validate-liveness-probes.js:190`) uses a `.js` file, so it does not prove the rule fires on `.tsx`.

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

- [x] Add `typescript-eslint` to `apps/web`'s flat config, extend coverage to
      `src/**/*.{ts,tsx}` — layer: tooling
- [x] Fix whatever fresh debt surfaces — these files have never been linted; the DS
      package's own story files needed 7 fixes for the same rule set (`52eb7702`),
      expect a similar order of magnitude — layer: code
- [x] Confirm SUG-254's Rule 3 (boundary enforcement) applies to the newly-covered
      files — layer: config verification

## Non-Goals

- Rewriting the boundary rules themselves — SUG-254's scope, already shipped

## Acceptance Criteria

- [x] `pnpm --filter web lint` covers all `.ts`/`.tsx` files under `src/`, exits 0
- [x] A deliberately-introduced `apps/studio` import from a `.tsx` file under `src/`
      fails lint (Rule 3 proven live on the newly-covered file type)

## Related

- **GitHub:** [#86](https://github.com/bex-sugartown/sugartown/issues/86)
- **Origin:** 2026-07-25→27 post-mortem; SUG-254 Phase 6 (parked, epic paused)

## Close-out review

### Acceptance criteria

Executed in a cloud session started from `main` (branch `claude/execute-86-46h75j`, commit `4ba0a2c`), the first cloud run on its own `claude/*` branch. Evidence comment on #86, 2026-09-25. Merged into `main` locally (`770036cc`) and re-checked:

- `pnpm --filter web lint`: exit 0, covering 33 `.ts`/`.tsx` files (31 stories, 2 fixtures; `find apps/web/src \( -name '*.ts' -o -name '*.tsx' \) | wc -l`), not the 32 filed.
- Rule 3 on `.tsx`: the cloud run's deliberate `apps/studio` import in a `.tsx` file failed with `no-restricted-imports`. Locally, `pnpm validate:liveness-probes`: 14 gates proven live, 0 inert, including the new `boundary: apps/web (tsx)` probe.
- Root `pnpm lint` and `pnpm typecheck`: exit 0. `pnpm test:smoke`: 5 passed.

Fresh debt was 1 finding, not the 7 expected: an unused `useState` import in `Checkbox.stories.tsx`, removed. No story's rendering changed. `typescript-eslint` 8.54.0 was already in the lockfile through another package.

### What didn't work

- The evidence comment left out the "Cloud procedure notes" section the launch prompt asked for, so this run gave no procedure feedback.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| `scripts/validate-liveness-probes.js` docblock says "Six probes" while 14 run | implementation | declined: the line records the 2026-08-21 choice in ST-95, and the harness prints the live count on every run |
| Cloud evidence comment skipped the procedure-notes section | workflow-docs | declined: the section comes from the launch prompt, not `cloud-execution.md`; one miss is not yet a pattern |

### Friction line

none

## Post-ship checks

- [ ] CI on the pushed merge concludes `success` with the web lint step covering `.tsx` and Chromatic unchanged for `Checkbox.stories.tsx`: `gh run list --branch main --workflow CI --limit 1`

