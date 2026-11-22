---
**Epic:** SUG-161 — Storybook testing infrastructure — interaction tests, a11y CI gate, Vitest
**Issue:** [#50](https://github.com/bex-sugartown/sugartown/issues/50)
**Aligned:** 2026-11-20
**Visual:** no
**Status:** In Progress — Phase 2 done 2026-11-20; off hold 2026-11-22 (Bex) for Phases 1 and 3
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
- [ ] Pipe Vitest coverage report to CI summary (GitHub Actions `$GITHUB_STEP_SUMMARY`) — layer: CI

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

### Phase 3 — Vitest coverage (merge-as-you-go)
The addon is installed (Phase 2). Add coverage to the existing Vitest run and write it to the CI job summary. Ships with `/ship`.

## Acceptance criteria

- [ ] `pnpm --filter storybook storybook:test` runs all `.play()` stories and exits 0 locally
- [ ] The CI "Lint · Typecheck · Validate · Build" job (or a new sibling job) runs the test-runner and fails if any `.play()` assertion throws
- [ ] A PR that introduces an a11y `error`-level violation fails the CI run with a clear log message identifying the story and rule
- [ ] `@storybook/addon-vitest` reports per-component coverage in the CI job summary (even if coverage is partial in Phase 3)
- [ ] No regressions to existing Chromatic VRT runs (Chromatic job passes after each phase merge)

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
