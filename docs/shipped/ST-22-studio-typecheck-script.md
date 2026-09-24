---
**Epic:** ST-22 — apps/studio has no typecheck script
**GitHub Issue:** [#22](https://github.com/bex-sugartown/sugartown/issues/22)
**Status and priority:** on the board ([project 1](https://github.com/users/bex-sugartown/projects/1)), not copied here
**Merge strategy:** (a) Merge-as-you-go
---

# ST-22 — apps/studio has no typecheck script

## Verified 2026-09-19

Re-measured against the repo and Sanity. Where this section disagrees with the text below, this section is current.

- **Still open.** `apps/studio/package.json` has no `typecheck` script. Root `pnpm typecheck` (`turbo run typecheck --continue`, CI `ci.yml:73`) skips Studio.
- **7 errors in 5 files, not 5 files as filed.** `cd apps/studio && tsc --noEmit --incremental false`: `archivePage.ts` 2 (`new Date({})`, now line 350), `caseStudy.ts` 2 (`s` is unknown in the FAQ `Rule.custom`, added by SUG-207 on 2026-07-14), `homepage.ts` 1 and `siteSettings.ts` 1 (`__experimental_singleton`), `project.ts` 1 (`document` possibly undefined).
- **`navigation.ts` no longer errors.** Drop it from the fix list.
- There is no root `tsconfig`, so the errors only appear when tsc runs inside `apps/studio`.
- `apps/studio/tsconfig.json` sets `incremental: true`, so the script writes a gitignored `tsconfig.tsbuildinfo`. Harmless.
- **Do this with #85 (SUG-257).** Same package, same `package.json`.

## Background

Filed as GitHub issue #22 in February 2026 as "resolve pre-existing TypeScript errors in Studio
schemas" and never done. Rediscovered 2026-08-15 during migration Phase 2.

Measured 2026-08-15: `apps/studio/package.json` has **no `typecheck` script**. The repo-root
`pnpm typecheck` runs via Turbo across packages that define one, so Studio's schema TypeScript
is checked by nothing — not by `pnpm typecheck`, not by pre-commit, not by CI.

This is the same shape as SUG-257 and SUG-258 but a different gate:

| Issue | Package | Missing |
|---|---|---|
| SUG-257 | `apps/studio` | `lint` script — 86 pre-existing problems, measured 2026-07-27 |
| SUG-258 | `apps/web` | lint covers `.js/.jsx` only; 32 `.ts/.tsx` files ungated |
| **ST-22** | `apps/studio` | **`typecheck` script** |

All three are "a gate that was assumed to run and does not" — the dominant failure shape in
`docs/ai/agentic-caucus/incident-log.md` (6 of 14 incidents).

## Scope

- [x] Add a `typecheck` script to `apps/studio/package.json`
- [x] Run it and count the real error total. Do not estimate it — SUG-255 found CI undercounting
      lint errors 7 vs 84 because `turbo run` stops at the first failing package
- [x] Fix, or record the count and wire it warn-only with a stated deadline
- [x] Wire into CI once green
- [x] Consider closing SUG-257 and ST-22 together — same package, same class of gap

## Non-Goals

- SUG-258's `apps/web` TypeScript lint coverage. Related, separately tracked.

## Related

- **GitHub:** [#22](https://github.com/bex-sugartown/sugartown/issues/22)
- SUG-257, SUG-258 — same shape, different packages

## Close-out review

### Acceptance criteria

This doc has no Acceptance Criteria section; the five Scope items stand in and are ticked. Executed in a cloud session started from `wip/2026-09-24-main` (commit `d3184a1`). Evidence comment on #22, 2026-09-24. Fast-forwarded into `main` locally and re-checked:

- Real count before the fix: 7 errors in 5 files (`tsc --noEmit --incremental false`), matching the Verified section.
- `pnpm --filter studio typecheck`: exit 0. Root `pnpm typecheck` (what `ci.yml:73` runs): exit 0, `studio` included, so CI is wired with no workflow change.
- `pnpm --filter studio lint`: exit 0.
- Schema unchanged: `sanity schema extract` before and after, identical (in cloud); `pnpm validate:schema-parity` against Sanity, no drift (local).
- `pnpm test:smoke`: 5 passed.
- CI on `main`: a post-ship check.

Fixes are type-only: two typed `Rule.custom` generics, one `document` guard, and `// @ts-expect-error` on `__experimental_singleton` in `homepage.ts` and `siteSettings.ts`, kept so Studio behaves the same. SUG-257 (#85) closed earlier the same day, so the "close together" item is met in effect.

### What didn't work

- The cloud session pushed to `wip/2026-09-24-main`, the Mac's own mirror of `main`. Harmless here, because nothing was committed locally during the run, but it could have raced the mirror.
- The schema guard came from the launch prompt, not the procedure.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Procedure: wip start branch, shared mirror branch, double-prefixed mirror ref, schema guard, stale Verify note | workflow-docs | #142 |
| Remove `__experimental_singleton` from `homepage.ts` and `siteSettings.ts` | implementation | declined: the property works and the `@ts-expect-error` fails the typecheck if Sanity ever adds it to the type, which prompts the cleanup |
| 16 lint warnings in `components/TableBlockInput.tsx` | implementation | declined: warnings pass the gate, out of scope (same as SUG-257) |

### Friction line

A cloud session started from the Mac's own mirror branch pushed its work onto that branch.

## Post-ship checks

- [ ] CI on the pushed commit concludes `success` with `studio` in the typecheck step: `gh run list --branch main --workflow CI --limit 1`

