---
**Epic:** SUG-161 — Storybook testing infrastructure — interaction tests, a11y CI gate, Vitest
**Issue:** [#50](https://github.com/bex-sugartown/sugartown/issues/50)
**Aligned:** 2026-11-20
**Visual:** no
**Status:** Done — Phase 2 2026-11-20; Phases 1 and 3 2026-11-22 (off hold, Bex)
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase; ships with `/ship`
---

# SUG-161 — Storybook testing infrastructure — interaction tests, a11y CI gate, Vitest

Add interaction tests (.play() functions), automate a11y violation gating in CI, and wire Vitest to Storybook stories. Completes the three remaining gaps in the Storybook Guide testing checklist — the visual testing layer (Chromatic) and documentation layer (SUG-158) are already shipped.

## Background

The Storybook setup is mature: 390 stories (measured 2026-11-20 from `index.json`; 87 when this was written), Chromatic VRT running in CI on every push to main, `addon-a11y` installed, custom viewports configured, and a full docs template system (SUG-158). What the Guide's testing checklist identifies as missing is entirely in the interactive/automated testing layer: no `.play()` interaction tests exist anywhere in the codebase, the a11y addon runs only in the browser panel (not as a CI gate), and there is no Vitest integration for unit-level coverage reporting. The visual and documentation layers are done; the behavioural testing layer is not.

## Objective

After this epic, Storybook stories can assert interactive behaviour (click → state change, keyboard nav, form submit) via `.play()` functions; a11y violations at the `@storybook/addon-a11y` rule level fail the CI build rather than requiring a human to open the panel; and Vitest is wired to story renders for per-component coverage reporting. No schema, GROQ, or Sanity work is in scope. The layers touched are: Storybook config (`apps/storybook/.storybook/`), story files (`packages/design-system/src/components/` and `apps/web/src/design-system/components/`), CI workflow (`.github/workflows/ci.yml`).

## Scope

- [x] ~~Install `@storybook/test` and `@storybook/test-runner`~~ Superseded 2026-11-22 (Bex): `.play()` tests run in the Phase 2 Vitest addon. `storybook/test` is a devDependency of `packages/design-system` and `apps/web`, and `main.ts` dedupes `storybook` so every story shares the app's one copy — layer: Storybook tooling
- [x] Write `.play()` interaction tests for the ~10 most interactive components: Button, FilterBar, SegmentedControl, Drawer, Accordion, Chip, Input, Field, HelperText, Form — layer: Storybook stories. **Done 2026-11-22 (Phase 1):** 17 play functions across 10 components, on existing stories (no new snapshots)
- [x] Run all `.play()` stories locally with `pnpm --filter storybook test:a11y` before CI wiring — layer: Storybook tooling. 780 of 780 pass
- [x] `.play()` failures block merge — layer: CI. The Phase 2 job `Storybook a11y` already runs every story's play function, so no new job; its comment now says so
- [x] Wire `addon-a11y` into a runner so axe violations become CI failures; define which rules are `error` vs `warn` — layer: Storybook tooling + CI. **Done 2026-11-20 (Phase 2):** Vitest addon, `a11y.test: 'error'` project-wide, known failures `'todo'` naming #246 / #247, both themes, CI job `storybook-a11y`.
- [x] ~~Install `@storybook/addon-vitest`; configure Vitest workspace~~ Done in Phase 2 — layer: Storybook tooling
- [x] Pipe Vitest coverage report to CI summary (GitHub Actions `$GITHUB_STEP_SUMMARY`) — layer: CI. **Done 2026-11-22 (Phase 3):** `test:coverage`, `apps/storybook/scripts/coverage-summary.mjs`; 82 components, 84% lines

## Phases

> **Rescoped 2026-10-12.** Priority raised to High for the a11y gate only. Phase 2 below runs first; Phases 1 and 3 stay Later and are not started with it. Page-level axe lives in ST-159 (#159); use the same axe rule tags there and here (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`).

### Phase 1 — Interaction tests (merge-as-you-go) — done 2026-11-22
Write `.play()` functions for the target components in the Phase 2 Vitest addon; no test-runner. Ships with `/ship`.

### Phase 2 — a11y CI gate (merge-as-you-go) — done 2026-11-20
Install `@storybook/addon-vitest` (not the test-runner, see Start audit). Set `parameters.a11y.test: 'error'` and `options.runOnly` to the page gate's tags in `preview.ts`. Run every story in `light-pink-moon` and `dark-pink-moon`. Add a CI job. Ships with `/ship`.

**Baseline, measured 2026-11-20** (axe-core via Playwright on `localhost:6006`, all 390 stories, tags `wcag2a wcag2aa wcag21aa wcag22aa`):

| Rule | Light | Dark | Handling (Bex, 2026-11-20) |
|---|---|---|---|
| color-contrast | 106 stories | 60 stories | 51 story groups get `a11y.test: 'todo'` at component level, each naming the contrast-backlog issue; burn down there |
| label | 6 | 6 | story-only (bare Input and Textarea with no label); fixed here with `aria-label` in the stories |
| target-size | 1 | 1 | carousel dots, a real component issue; own issue, `todo` until fixed |

### Phase 3 — Vitest coverage (merge-as-you-go) — done 2026-11-22
The addon is installed (Phase 2). Add coverage to the existing Vitest run and write it to the CI job summary. Ships with `/ship`.

## Acceptance criteria

- [x] `pnpm --filter storybook test:a11y` runs all `.play()` stories and exits 0 locally: 194 files, 780 of 780 (the script is `test:a11y`, not `storybook:test`; the test-runner was not used)
- [x] The CI job `Storybook a11y` (sibling job, Phase 2) fails if any `.play()` assertion throws. Local proof: a planted Accordion single-expand bug failed `Accordion Default` in both themes, then reverted
- [x] A new a11y `error`-level violation fails the run naming the story and rule: Phase 2 planted-image test (issue #50 comment, 2026-11-20)
- [x] Per-component coverage reaches the CI job summary: `pnpm turbo run test:coverage --filter=storybook` from a deleted design-system `dist/` wrote a 90-line table to `GITHUB_STEP_SUMMARY`; the first real CI run is a post-ship check
- [ ] Chromatic: deferred to /ship (Post-ship checks). Play functions add no snapshots

## Technical notes

- **Current Storybook version:** 10.5.7 (`apps/storybook/package.json`, 2026-11-20).
- **test-runner vs addon-vitest:** superseded, see Start audit. `@storybook/addon-vitest` runs stories in real Chromium (Vitest browser mode, Playwright), and Storybook's docs say the test runner "has been superseded by the Vitest addon". All three phases use the Vitest addon.
- **a11y severity config:** The test-runner can read `addon-a11y` config from story parameters. Define a shared `a11yConfig` in `apps/storybook/.storybook/preview.ts` with `rules` set to downgrade noisy rules (e.g. `color-contrast` for stories that deliberately use brand accent on brand bg) to `warn`. Only genuine structural violations (`role` misuse, missing `aria-*`, keyboard traps) should be `error`.
- **CI job placement:** Add a new `storybook-tests` job to `ci.yml` that runs after the main lint/build job (to avoid redundant installs). The Chromatic job already handles visual regression; the new job handles behavioural + a11y.
- **Activation audit:** Before Phase 1, read `.github/workflows/ci.yml` in full to understand the current job structure and pnpm cache setup, then model the new job to match.
- **Model & Mode:** `/model opus` — Opus plans (Pre-Execution Gate → Files to Modify), Sonnet executes after plan-mode exit.

## Start audit

2026-11-20, start review for Phase 2. `check-epic-doc.js --drift` listed 48 changed rule files; read: `.claude/rules/storybook.md`, `docs/epic-template.md`, `docs/conventions/chromatic-conventions.md`. Skipped as not touching a test gate: the other 45 (content, CSS, process and skill files).

- Missing `**Visual:**` line (the checker's one hard gap). Fix: `**Visual:** no`, a test gate renders nothing.
- Tooling premise changed. The epic chose `@storybook/test-runner` and described addon-vitest as jsdom-only. Storybook 10.6 docs: the test runner "has been superseded by the Vitest addon", which runs in real Chromium. Fix: Phase 2 uses addon-vitest (Bex).
- Stale facts: Storybook 10.5.7 not 10.3.4; 390 stories not 87; `/mini-release` retired 2026-08-19 for `/ship`; Linear link replaced by #50. Fixed in place.
- Baseline not in the doc. Fix: measured and recorded under Phase 2 with Bex's handling.
- `storybook.md` §Storybook coverage requirement asks that stories are checked on both themes. Fix: the gate runs both (Bex).

## Model & Mode [REQUIRED]

`/model opus` — tooling + config changes across multiple files (package.json, main.ts, ci.yml, story files); planning pass needed to avoid mis-sequencing the three phases and breaking the existing Chromatic job.

## Non-Goals

- No changes to DS component logic or visual output — `.play()` tests assert behaviour, not appearance
- No new story files for currently-uncovered components — coverage is complete; this epic adds test depth, not breadth
- No Storybook upgrade (remains on v10.5.x for this epic)
- No removal of Chromatic — it remains the visual regression gate; this epic adds the behavioural layer alongside it
- SUG-152 (usage docs) is unrelated and stays on hold

## Related

- **Linear:** [SUG-161](https://linear.app/sugartown/issue/SUG-161/storybook-testing-infrastructure-interaction-tests-a11y-ci-gate-vitest)
- **Related:** [SUG-158](https://linear.app/sugartown/issue/SUG-158) (Storybook docs template system — shipped), [SUG-152](https://linear.app/sugartown/issue/SUG-152) (usage docs — on hold, orthogonal)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time

## Close-out review

<!-- Chromatic: pending. Stories changed (play functions only, no visual change); deferred to /ship by Bex, 2026-11-22. Expect no new diffs from this epic. -->

### Acceptance criteria

- [x] `.play()` stories run and exit 0 locally: 780 of 780, `pnpm --filter storybook test:a11y`.
- [x] A broken interaction fails CI: planted Accordion bug failed in both themes, then reverted (CI job `Storybook a11y`, same run).
- [x] An a11y `error` violation fails with story and rule: Phase 2 planted-image test.
- [x] Per-component coverage in the job summary: written locally through Turbo from a deleted `dist/`; first CI run is a post-ship check.
- [ ] Chromatic: deferred to /ship (Post-ship checks).

### What didn't work

- Stories in `packages/design-system` and `apps/web` resolved their own copy of `storybook` (React 19 peer set), separate from the Storybook app's (React 18). `userEvent.click` then threw "Illegal invocation". Fixed by adding `storybook` to the Vite `dedupe` list in `apps/storybook/.storybook/main.ts`.
- The first FilterBar play matched two checkboxes named "Strategy" (the category and the project "Brand Strategy"). Fixed by anchoring the names.
- Coverage returned zero files until the config used absolute globs and `allowExternal`: the component sources sit outside `apps/storybook`.
- The epic named `@storybook/test-runner` for Phases 1 and 3. Phase 2 had already replaced it with the Vitest addon, so those Scope lines were rewritten, not executed.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| CI job and script are still named `Storybook a11y` and `test:a11y` although they now run play functions and coverage | workflow-docs | declined: renaming a required check can break branch protection; the comment in `ci.yml` says what it runs |
| No coverage threshold; coverage is reported, not gated | implementation | declined: Phase 3 asked for a report ("even if partial"); a floor needs a baseline over several runs first |
| Play functions for the other interactive components (Tabs-style and form controls not in the ten) | implementation | declined: the epic scoped ten; #252 touches those components' states and can add plays there |

### Friction line

Stories in two packages each installed their own Storybook, so play functions threw until the copies were deduped.

---

## Post-ship checks

- [ ] CI run after the push: the `Storybook a11y gate and coverage` step passes and the job summary shows the coverage table: `gh run watch`, then open the run's Summary tab.
- [ ] Chromatic: no new diffs from this epic's stories; approve the #251, #172 and #170 diffs at /ship: person: review before the push.
