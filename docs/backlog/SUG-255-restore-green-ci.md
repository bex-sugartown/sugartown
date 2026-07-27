---
**Epic:** SUG-255 — Restore green CI
**Linear Issue:** [SUG-255](https://linear.app/sugartown/issue/SUG-255/restore-green-ci-zero-passing-runs-on-main-since-2026-05-10)
**Status:** Backlog
**Priority:** 🔴 Now
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
---

# SUG-255 — Restore green CI

CI has not passed once on `main` in the last 100 runs, spanning 2026-05-10 to 2026-07-27. Restore it to green, and close the visibility gap that let it stay red for nearly three months.

## Background

Discovered on 2026-07-27 while running SUG-254's Phase 0, which needed a green baseline to verify boundary enforcement against and found none. The finding is the same shape as SUG-254's own subject: **declared enforcement that never actually fires.** SUG-254 found that `boundaries.js` was configured but inert; this epic finds that the pipeline which would have caught that has itself been red since before either was written.

Every close-out gate that assumes "CI green" has therefore been advisory for the whole period, including the SUG-240 route smoke suite that CLAUDE.md documents as blocking merge to `main`.

**Why it went unnoticed.** `.husky/pre-commit` runs only `pnpm --filter web lint`, so a regression in any other package is invisible locally. CI itself fails at the first step, so its logs only ever show the *first* failing package: the 2026-07-27 run reported "9 problems (7 errors, 2 warnings)" from `packages/design-system` and never reached `apps/storybook`'s 72 or `apps/contentful-poc`'s 5. Reading CI logs therefore understates the breakage by an order of magnitude, which is why an audit that trusted them found 7 errors where 84 existed.

**Measured state of every gate** (2026-07-27, measured directly against local `main` — *not* inferred from CI logs, which never get past step 1):

| Gate | State | Detail |
|---|---|---|
| Lint | ⚠️ partly fixed | 84 errors across 3 packages. 79 already fixed in `52eb7702`. Remaining: `apps/contentful-poc` 5. |
| Typecheck | ❌ FAIL | `apps/storybook`, 14 errors: 10× `Cannot find module '@storybook/react'`, 3× unused `React` (TS6133), 1× a `./ComponentName` template placeholder. |
| `validate:urls` / `filters` / `taxonomy` / `schema-parity` | ❓ unknown in CI | Pass locally via pre-commit. CI has never reached them. |
| Build | ✅ PASS | `pnpm build`, 69s. |
| Route smoke tests | ✅ PASS | 5/5 Playwright specs. |
| Chromatic VRT | ❌ FAIL | Separate job, independent root cause (below). |

**Chromatic root cause — confirmed, not hypothesised.** `apps/storybook/scripts/chromatic.sh` line 1 is `set -a; . ./.env 2>/dev/null; set +a`. The POSIX dot command is a *special builtin*: when the file is missing, a non-interactive shell exits immediately. The `2>/dev/null` suppresses the error message but not the exit. `.env` is gitignored, so it never exists in CI. Reproduced directly — dash (Ubuntu CI's `/bin/sh`) exits **2**, matching CI's reported "Exit status 2"; macOS `/bin/sh` exits 1. The script's first `echo` never runs, which is why the CI logs contain no `[chromatic]` output at all. Introduced 2026-06-21 by `93c8f80a` (SUG-191). **Chromatic VRT has not run in CI since that date** — every VRT build in the window came from a manual local run.

**`@storybook/react` is structural, not incidental.** The repo runs Storybook 10, where that package is not installed at all (only `@storybook/react-vite`, `addon-a11y`, `addon-docs`). 97 import sites reference it. They survive only because every one is `import type` (erased before module resolution) and because `packages/design-system/tsconfig.json` excludes `**/*.stories.*` — so `tsc` only ever sees the 10 sites under `.storybook/`. Declaring the dependency is **not** the fix; the package does not exist in SB10.

**Scope caveat:** local `main` is 12 commits ahead of `origin/main` (tip `9efba5b0`), including the whole v0.31.0 release and SUG-225. Those 12 commits have never been through CI. The gate measurements above were taken against local `main`, so they cover them, but the first push may surface failures unique to code CI has not yet seen.

## Objective

After this epic, `pnpm lint`, `pnpm typecheck`, `pnpm build` and `pnpm test:smoke` all pass on `main`, the Chromatic job runs instead of dying on line 1, and CI reports a green run. Additionally, the pre-commit hook and CI are changed so that a future regression in any package surfaces immediately rather than three months later. Touches ESLint/TS config, one shell script, `.husky/pre-commit`, `.github/workflows/ci.yml`, and a small number of source files. No Sanity schema, no GROQ, no content, no rendered UI.

## Scope

- [x] Clear the mechanically-fixable lint errors in `packages/design-system` (7) and `apps/storybook` (70), and delete the two unparseable orphan helpers — layer: tooling/source. **Done in `52eb7702`.**
- [ ] Resolve `apps/contentful-poc`'s 5 lint errors — layer: source. Four `@typescript-eslint/no-explicit-any` on Contentful SDK entries in `src/lib/normalizeSiteSettings.ts` (needs `unknown` plus narrowing in both `.filter` and `.map`), and one `react-hooks/set-state-in-effect` in `src/components/ThemeToggle.tsx`. Note `apps/web/eslint.config.js` already disables that hooks rule with a written justification; decide whether the same applies here or whether the effect should be restructured.
- [ ] Fix the 10 `@storybook/react` typecheck failures — layer: tooling. Activation audit: confirm what `@storybook/react-vite` actually re-exports for `Meta`/`StoryObj` in SB 10.3.4 before choosing the replacement specifier. Decide whether to repoint only the 10 typechecked sites or all 97 for consistency; state the reason either way.
- [ ] Fix the 3 TS6133 unused-`React` errors and the `./ComponentName` placeholder in `stories.boilerplate.tsx` — layer: source. The placeholder is intentional template scaffolding; decide between excluding the boilerplate from typecheck and making the placeholder resolvable.
- [ ] Fix `chromatic.sh`'s `.env` sourcing so a missing file is non-fatal — layer: tooling. `[ -f ./.env ] && { set -a; . ./.env; set +a; }` or equivalent. Must be verified under **dash**, not just macOS `/bin/sh`, since the two differ.
- [ ] Widen `.husky/pre-commit` from `pnpm --filter web lint` to full `pnpm lint` — layer: tooling. This is the visibility gap that allowed the original regression.
- [ ] Make CI report *all* failing packages rather than stopping at the first — layer: tooling. Investigate `turbo run lint --continue` (or equivalent) so one run gives the full picture; the current fail-fast behaviour is what made the breakage look 10× smaller than it was.
- [ ] Confirm the four `validate:*` CI steps actually pass in CI once reachable — layer: verification. They pass locally but have never run there; several need Sanity credentials, so a CI-specific failure is plausible.
- [ ] Achieve one genuinely green CI run on `main` and record its run ID — layer: verification.

## Phases

Strategy (a): each phase merges to `main` on completion with its own mini-release.

1. **Lint green** — `apps/contentful-poc`'s 5 errors. Ends with `pnpm lint` exiting 0 repo-wide. (`52eb7702` already landed the other 79.)
2. **Typecheck green** — `@storybook/react` repointing, TS6133s, boilerplate placeholder. Ends with `pnpm typecheck` exiting 0.
3. **Chromatic** — `chromatic.sh` `.env` guard, verified under dash. Ends with the Chromatic job running to a real result rather than exiting 2.
4. **Visibility hardening** — pre-commit widening, `--continue` for full-picture reporting. Ends with a local regression in any package being caught pre-commit.
5. **Verify** — a green CI run on `main`, run ID recorded; confirm the `validate:*` steps pass in CI.

## Acceptance criteria

- [ ] `pnpm lint` exits 0 across every workspace package.
- [ ] `pnpm typecheck` exits 0 across every workspace package.
- [ ] `pnpm build` and `pnpm test:smoke` still pass (both already do — these are regression guards).
- [ ] `apps/storybook/scripts/chromatic.sh` runs its first `echo` when no `.env` is present, verified by executing it under `dash` with `.env` absent, not only under macOS `/bin/sh`.
- [ ] The Chromatic CI job reaches a real Chromatic result (pass, or diffs awaiting review) instead of exiting 2 before any output.
- [ ] A commit is pushed to `main` and the resulting CI run concludes `success`. Its run ID is recorded in the close-out. This is the epic's real acceptance test — nothing else substitutes for it.
- [ ] `.husky/pre-commit` runs full `pnpm lint`, verified by staging a deliberate lint error in a non-`web` package, confirming the hook blocks it, then reverting.
- [ ] A single `pnpm lint` run reports failures from *all* failing packages, verified by deliberately breaking two packages at once.

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, layout token, or multi-page component changes. This epic is CI configuration, lint/type fixes, and one shell script. The only rendered surfaces touched are Storybook doc pages already covered by Chromatic.

## Technical notes

- **Content Write Gate:** not applicable — no Sanity content writes.
- **Schema changes:** none.
- **Upstream dependencies:** none blocking. **This epic blocks SUG-254** (relation set in Linear at creation, not left as prose): SUG-254's acceptance criterion is "`pnpm lint` passes clean repo-wide", which is unmeetable until this lands.
- **Activation audits (run before implementation):**
  - Re-measure every gate — the 12 unpushed commits mean CI has never evaluated current `main`, and the numbers above may shift once it does.
  - Check what `@storybook/react-vite@10.3.4` exports for `Meta`/`StoryObj`; a first pass found no `.d.ts` re-export of those names, so the correct replacement specifier is genuinely open (candidates: `storybook/react`, `@storybook/react-vite`, or reinstating `@storybook/react` as a real dependency).
  - Re-read `apps/web/eslint.config.js`'s `react-hooks/set-state-in-effect` justification before deciding whether it transfers to `contentful-poc`'s `ThemeToggle`.
  - Verify whether branch protection is enabled on `main`. If CI has been red for three months while commits landed freely, either protection is off or it is being bypassed — the answer changes whether Phase 4 needs a protection rule.
- **Model & Mode [REQUIRED]:** `/model sonnet`. The hard analytical work (root-causing all three failures) is already done and recorded above; what remains is mechanical fixes with clear acceptance tests. Sonnet 5 executes directly, no plan-mode handoff.

## Non-Goals

- Not fixing the `@storybook/react` import specifier at all 97 sites if a smaller change makes typecheck green — breadth is a Phase 2 decision, to be stated explicitly rather than assumed either way.
- Not migrating any package off ESLint v8 to flat config. Separate, larger work (and an explicit Non-Goal of SUG-254 as well).
- Not resolving SUG-254's boundary enforcement. That epic resumes once this one lands.
- Not addressing the 12-commit unpushed backlog on `main` as a code change — it is called out here as context and belongs to `/eod` discipline, not to this epic.
- Not fixing the Netlify build-orchestration risk documented in `9efba5b0`. Related in spirit, tracked separately.
- Not adding new test coverage. This epic restores the gates that exist; it does not expand them.

## Related

- **Linear:** [SUG-255](https://linear.app/sugartown/issue/SUG-255/restore-green-ci-zero-passing-runs-on-main-since-2026-05-10)
- **Blocks:** [SUG-254](https://linear.app/sugartown/issue/SUG-254/fix-eslint-architectural-boundary-enforcement-no-restricted-imports) — ESLint architectural boundary enforcement
- **Origin:** SUG-254 Phase 0, 2026-07-27
- **Chromatic regression introduced by:** `93c8f80a` (SUG-191), 2026-06-21
- **Lint regression introduced by:** `5710db69` (SUG-224 Phase 5), 2026-07-24
- **Epic template:** `docs/epic-template.md` — Doc Type Coverage, Query Layer Checklist and Schema Enum Audit are all not applicable to this epic (no schema or GROQ surface); state that explicitly at activation rather than leaving them blank.
