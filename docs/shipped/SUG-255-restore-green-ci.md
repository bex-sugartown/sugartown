---
**Epic:** SUG-255 — Restore green CI
**Linear Issue:** [SUG-255](https://linear.app/sugartown/issue/SUG-255/restore-green-ci-zero-passing-runs-on-main-since-2026-05-10)
**Status:** Shipped 2026-07-28
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
- [x] Resolve `apps/contentful-poc`'s 5 lint errors — layer: source. Four `@typescript-eslint/no-explicit-any` on Contentful SDK entries in `src/lib/normalizeSiteSettings.ts` (needs `unknown` plus narrowing in both `.filter` and `.map`), and one `react-hooks/set-state-in-effect` in `src/components/ThemeToggle.tsx`. Note `apps/web/eslint.config.js` already disables that hooks rule with a written justification; decide whether the same applies here or whether the effect should be restructured.
- [x] Fix the 10 `@storybook/react` typecheck failures — layer: tooling. Activation audit: confirm what `@storybook/react-vite` actually re-exports for `Meta`/`StoryObj` in SB 10.3.4 before choosing the replacement specifier. Decide whether to repoint only the 10 typechecked sites or all 97 for consistency; state the reason either way.
- [x] Fix the 3 TS6133 unused-`React` errors and the `./ComponentName` placeholder in `stories.boilerplate.tsx` — layer: source. The placeholder is intentional template scaffolding; decide between excluding the boilerplate from typecheck and making the placeholder resolvable.
- [x] Fix `chromatic.sh`'s `.env` sourcing so a missing file is non-fatal — layer: tooling. `[ -f ./.env ] && { set -a; . ./.env; set +a; }` or equivalent. Must be verified under **dash**, not just macOS `/bin/sh`, since the two differ.
- [x] Widen `.husky/pre-commit` from `pnpm --filter web lint` to full `pnpm lint` — layer: tooling. This is the visibility gap that allowed the original regression.
- [x] Make CI report *all* failing packages rather than stopping at the first — layer: tooling. Investigate `turbo run lint --continue` (or equivalent) so one run gives the full picture; the current fail-fast behaviour is what made the breakage look 10× smaller than it was.
- [x] Confirm the four `validate:*` CI steps actually pass in CI once reachable — layer: verification. They pass locally but have never run there; several need Sanity credentials, so a CI-specific failure is plausible.
- [x] Achieve one genuinely green CI run on `main` and record its run ID — layer: verification.

### Added 2026-07-27 by post-mortem (see §Post-mortem additions)

- [x] **`validate:enforcement-liveness`** — assert each gate actually *fires*, not merely that it is wired — layer: tooling. Extends `scripts/validate-validators.js` (SUG-239) rather than sitting beside it. That script passes green today while CI is red, because it verifies a validator is attached to a hook and cannot verify anyone reads the result. Proven by disabling a gate and confirming the check fails. **Must-have. Depends on:** Phases 1–3 landing first (a liveness check written against a red pipeline cannot distinguish "gate broken" from "gate correctly reporting breakage"). **Absorbs** SUG-254's proposed `validate:boundary-wiring` — see that epic's note; two checkers with the same purpose is the failure mode this whole epic documents.
- [x] **CI failure notification** — layer: tooling/process. CI ran red 100+ times with no signal reaching a human. Evaluate branch protection on `main` (activation audit already asks whether it is enabled) plus a notification path for a red run on `main`. **Must-have. No dependencies** — can land in parallel with Phases 1–3, and arguably should, since it is what prevents a *future* three-month silence regardless of whether today's failures are fixed.
- [x] **`/eod` reports the triggered CI run's outcome** — layer: process. `docs/workflows/eod-prompt.md` Phase 4 currently confirms the Netlify deploy responds but never looks at the CI run the push triggered. Today's session did this manually and it immediately produced the most useful datapoint of the day. **Nice-to-have. Depends on:** nothing technically, but low value until CI is green — until then it reports a known failure every time.
- [x] **Gate-liveness line in the monthly evidence digest** — layer: tooling. `scripts/monthly-evidence-digest.js` (SUG-241) already writes a dated evidence block into the backlog priorities file. Add the date and conclusion of the most recent CI run on `main`, so a red pipeline appears in the same artifact used to set priority. **Nice-to-have. Depends on:** nothing; complements rather than replaces the notification above (one is real-time, one is the periodic backstop).

## Post-mortem additions (2026-07-27)

A post-mortem covering 2026-07-25→27 traced five separate mechanisms that were *declared and not firing*: `boundaries.js`'s four rules (SUG-254), the Chromatic job, the CI suite itself, `sugartown_check_boundary`, and `validate:validators` — which was built by SUG-239 expressly to stop enforcement decaying silently, and which passes green throughout because it checks wiring rather than liveness. The four Scope items above exist because fixing today's three failures does not address the class of fault.

Impact already materialised in the window, all traceable to the same absence: a design-system regression reached production and was found by accident during unrelated work (SUG-247, live ~2 days), both Netlify sites broke independently on a build-orchestration bypass, and six releases (v0.30.6 → v0.31.0) shipped against a pipeline nobody could have known was passing. The live `/platform/governance` page meanwhile publishes "30 checkpoints · 0 gaps" — rendered, as it happens, inside the exact `<Grid spacing="0" accentTop>` that SUG-247 proved was silently broken. That claim is handled separately (see §Related).

## Phases

Strategy (a): each phase merges to `main` on completion with its own mini-release.

1. **Lint green** — `apps/contentful-poc`'s 5 errors. Ends with `pnpm lint` exiting 0 repo-wide. (`52eb7702` already landed the other 79.)
2. **Typecheck green** — `@storybook/react` repointing, TS6133s, boilerplate placeholder. Ends with `pnpm typecheck` exiting 0.
3. **Chromatic** — `chromatic.sh` `.env` guard, verified under dash. Ends with the Chromatic job running to a real result rather than exiting 2.
4. **Visibility hardening** — pre-commit widening, `--continue` for full-picture reporting, CI failure notification / branch-protection decision. Ends with a local regression in any package being caught pre-commit, and a red `main` reaching a human.
5. **Liveness enforcement** — `validate:enforcement-liveness` extending `validate-validators.js`, absorbing SUG-254's `validate:boundary-wiring`. Sequenced after 1–3 so it runs against a green pipeline; a liveness check authored against a red one cannot tell "gate broken" from "gate correctly reporting breakage". Ends with a deliberately-disabled gate failing the check.
6. **Verify** — a green CI run on `main`, run ID recorded; confirm the `validate:*` steps pass in CI. Then the two nice-to-haves (`/eod` CI reporting, monthly-digest gate line), which are only meaningful once green is the expected state.

## Acceptance criteria

- [x] `pnpm lint` exits 0 across every workspace package.
- [x] `pnpm typecheck` exits 0 across every workspace package.
- [x] `pnpm build` and `pnpm test:smoke` still pass (both already do — these are regression guards).
- [x] `apps/storybook/scripts/chromatic.sh` runs its first `echo` when no `.env` is present, verified by executing it under `dash` with `.env` absent, not only under macOS `/bin/sh`.
- [x] The Chromatic CI job reaches a real Chromatic result (pass, or diffs awaiting review) instead of exiting 2 before any output.
- [x] A commit is pushed to `main` and the resulting CI run concludes `success`. Its run ID is recorded in the close-out. This is the epic's real acceptance test — nothing else substitutes for it.
- [x] `.husky/pre-commit` runs full `pnpm lint`, verified by staging a deliberate lint error in a non-`web` package, confirming the hook blocks it, then reverting.
- [x] A single `pnpm lint` run reports failures from *all* failing packages, verified by deliberately breaking two packages at once.
- [x] `validate:enforcement-liveness` **fails** when a wired gate is deliberately disabled, and passes when it is restored. Asserting that it passes on a healthy repo is not sufficient — that is exactly the property `validate:validators` already has while CI is red.
- [x] A red run on `main` produces a signal that reaches a human, verified once by observation (branch protection blocking a merge, or a notification received).

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

## Post-Epic Close-Out (2026-07-28)

**Green CI run: [30365991635](https://github.com/bex-sugartown/sugartown/actions/runs/30365991635)** — `success`, all three jobs, on `a9ef3498`. The first passing run in the workflow's existence: 212 recorded runs, zero successes, 2026-02-20 → 2026-07-28.

### What the epic actually found

The three failures named at scoping (lint, typecheck, Chromatic) were real and are fixed. They were also not the whole story, because **CI had never run far enough to report the rest**. Every step after the first was unexercised, so each fix exposed the next latent defect:

| Surfaced when | Defect | Why it was invisible |
|---|---|---|
| `validate:taxonomy` first ever ran | Secret-store values had drifted to a different Sanity project — 19 tags reported against a project with 64 | A secret cannot be read back, so the drift had no observer |
| Validators first authenticated | CI validated an anonymous view; the site ships a viewer token, so 63 "dangling" refs resolve fine for real readers | CI was checking a view no visitor gets |
| `validate:schema-parity` first ever ran | `@sanity/ui` imported by `TableBlockInput.tsx` but never declared; resolved locally only via a stale `node_modules` directory | Works on every developer machine, fails on every clean install |
| Schema parity first authenticated | `SANITY_SCHEMA_PARITY` held a token without `deploySchema`/`deployStudio` grants | Same unreadable-secret problem as above |
| Build step first ever reached | `apps/contentful-poc` throws at module load without Contentful CDA credentials | Six months of CI dying before Build |

None of these were regressions. They accumulated in the dark and were all revealed by the same act — making the pipeline run to completion.

### Verified by observation, not assertion

- **Failure notification** — the alert workflow opened [issue #29](https://github.com/bex-sugartown/sugartown/issues/29) unprompted at 13:23:53 on a red run, and closed it at 14:01:58 on the green one. Both directions of the loop confirmed live.
- **`--continue`** — two packages broken simultaneously; with the flag both are reported, without it one. Exit stays 1 either way.
- **Widened pre-commit** — the hook ran full `pnpm lint` on all five packages for every commit in this session.
- **`validate:enforcement-liveness`** — passes 7 live / 1 skipped on a healthy repo with no residue; reports `validate:css-names` inert and exits 1 when that validator is stubbed to `exit 0`; reports `chromatic.sh` inert when the unguarded `. ./.env` is reinstated. Asserting only that it passes would have been worthless — that is precisely the property `validate:validators` already had while CI was red.
- **Chromatic** — ran to a real result in CI for the first time since 2026-06-21.

### The liveness harness caught its own author

The first draft invoked `pnpm validate:css-names` from the repo root, where that script does not exist — it lives only in `apps/web`. pnpm exited non-zero with "command not found" and the probe read that as proof the gate had rejected the violation. Two probes reported themselves green while testing nothing.

A liveness checker with a false-positive path launders the *absence* of enforcement into *evidence* of enforcement, which is the exact fault it exists to detect. Every probe now runs the gate clean first and requires exit 0 before trusting a failure as detection; `invalid` is a distinct state from both pass and fail and never counts as a pass. The control run then immediately caught a second real thing — that `validate:enforcement-liveness` had been added to `package.json` without being wired into CI.

### Branch protection — audit answered

`main` has **no protection rule and zero rulesets**. The three-month red streak was never protection being bypassed; it never existed. Required status checks were rejected deliberately: they would block the merge-as-you-go-on-`main` strategy this repo uses, and the fault was never "a red commit landed" but "a red commit landed and nobody found out for three months". Notification, not blocking. Recorded here so a later session does not re-litigate it from scratch.

### Close-out checklist

| Step | State |
|---|---|
| 1b · Route smoke tests + named run ID | ✅ run 30365991635 |
| 2 · Schema deploy | n/a — no `apps/studio/schemas/` change (`package.json` only) |
| 3 · Visual QA gate | **Does not fire.** No vspec; no rendered surface touched. Changes are CI config, a shell script, lint/type fixes, two Node scripts and a workflow doc. Nothing a user can see changed, so there is no build to compare against a spec. |
| 4 · Chromatic | ✅ green in CI |
| 5 · Data pipeline gap | ⚠️ the digest's new gate-liveness line has been run locally but not yet through a real monthly collection — see below |
| 5b · Handoffs landed | ✅ SUG-254 Scope amended in this commit — see below |
| 6b · Vspec preserved | n/a — no vspec |
| 8b · Incident log | Existing INC-009/010/011 cover this window; INC-010's Resolution updated to the completed state |

**Data pipeline gap (step 5).** `scripts/monthly-evidence-digest.js` now emits a fifth line — the most recent CI run on `main`, its conclusion and date — and states outright that the other four figures are unverified when that run is not green. It reads GitHub via `gh` rather than `stats.json`, so it degrades to an explicit "unavailable" when `gh` is missing or unauthenticated rather than dropping the row (an absent row reads as "fine"). Verified by hand against both a red and a green run. It has not yet run through a scheduled monthly collection; the next one is the first real exercise.

**Handoff to SUG-254 (step 5b).** Phase 5 absorbed SUG-254's proposed `validate:boundary-wiring`, per that epic's own "one liveness mechanism, many inputs". That absorption existed only as prose in *this* doc — SUG-254's Scope contained no corresponding item, which is the precise shape of the SUG-230 → SUG-231 failure that put step 5b in CLAUDE.md. A Scope item has been added to SUG-254 in the same commit as this close-out. An assertion is not a handoff.

## Related

- **Linear:** [SUG-255](https://linear.app/sugartown/issue/SUG-255/restore-green-ci-zero-passing-runs-on-main-since-2026-05-10)
- **Blocks:** [SUG-254](https://linear.app/sugartown/issue/SUG-254/fix-eslint-architectural-boundary-enforcement-no-restricted-imports) — ESLint architectural boundary enforcement
- **Origin:** SUG-254 Phase 0, 2026-07-27
- **Chromatic regression introduced by:** `93c8f80a` (SUG-191), 2026-06-21
- **Lint regression introduced by:** `5710db69` (SUG-224 Phase 5), 2026-07-24
- **Epic template:** `docs/epic-template.md` — Doc Type Coverage, Query Layer Checklist and Schema Enum Audit are all not applicable to this epic (no schema or GROQ surface); state that explicitly at activation rather than leaving them blank.
- **Now tracked as [SUG-256](https://linear.app/sugartown/issue/SUG-256) — "Re-derive GovernancePage coverage tally from measured enforcement liveness"** (created after this section was first written; SUG-255 blocks it, and that relation is set in Linear). Unblocked as of this close-out, and it now has real liveness data to derive from rather than a hand-maintained tally. Original note follows: `/platform/governance` §05 publishes "30 checkpoints · 0 gaps" (`GovernancePage.jsx:318`) with no measurement date and no source, while the pipeline behind the claim has been red since 2026-05-10. The same section renders through `<Grid spacing="0" accentTop accentColor="ink">` — the exact component and props SUG-247 proved were silently broken in the built package. This is a **reputational** exposure rather than a technical one, and on a platform whose positioning *is* the portfolio it plausibly outranks most of the current backlog. Out of scope here (SUG-255 restores the gates; it does not adjudicate public claims), but it should not sit only in a post-mortem. Related rule change: CLAUDE.md's red-pen gate extended to governance statistics.
