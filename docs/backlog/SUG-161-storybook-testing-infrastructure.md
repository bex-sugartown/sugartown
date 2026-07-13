---
**Epic:** SUG-161 — Storybook testing infrastructure — interaction tests, a11y CI gate, Vitest
**Linear Issue:** [SUG-161](https://linear.app/sugartown/issue/SUG-161/storybook-testing-infrastructure-interaction-tests-a11y-ci-gate-vitest)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-161 — Storybook testing infrastructure — interaction tests, a11y CI gate, Vitest

Add interaction tests (.play() functions), automate a11y violation gating in CI, and wire Vitest to Storybook stories. Completes the three remaining gaps in the Storybook Guide testing checklist — the visual testing layer (Chromatic) and documentation layer (SUG-158) are already shipped.

## Background

The Storybook setup is mature: 87 stories across all 37 DS components, Chromatic VRT running in CI on every push to main, `addon-a11y` installed, custom viewports configured, and a full docs template system (SUG-158). What the Guide's testing checklist identifies as missing is entirely in the interactive/automated testing layer: no `.play()` interaction tests exist anywhere in the codebase, the a11y addon runs only in the browser panel (not as a CI gate), and there is no Vitest integration for unit-level coverage reporting. The visual and documentation layers are done; the behavioural testing layer is not.

## Objective

After this epic, Storybook stories can assert interactive behaviour (click → state change, keyboard nav, form submit) via `.play()` functions; a11y violations at the `@storybook/addon-a11y` rule level fail the CI build rather than requiring a human to open the panel; and Vitest is wired to story renders for per-component coverage reporting. No schema, GROQ, or Sanity work is in scope. The layers touched are: Storybook config (`apps/storybook/.storybook/`), story files (`packages/design-system/src/components/` and `apps/web/src/design-system/components/`), CI workflow (`.github/workflows/ci.yml`).

## Scope

- [ ] Install `@storybook/test` and `@storybook/test-runner`; configure test-runner in `apps/storybook/` — layer: Storybook tooling
- [ ] Write `.play()` interaction tests for the ~10 most interactive components: Button, FilterBar, SegmentedControl, Drawer, Accordion, Chip, Input, Field, HelperText, Form — layer: Storybook stories
- [ ] Smoke-test all `.play()` stories via `pnpm storybook:test` locally before CI wiring — layer: Storybook tooling
- [ ] Add test-runner step to `.github/workflows/ci.yml` so `.play()` failures block merge — layer: CI
- [ ] Wire `addon-a11y` into the test-runner via `--stories-match` or `--config` so axe violations become CI failures; define which rules are `error` vs `warn` — layer: Storybook tooling + CI
- [ ] Install `@storybook/addon-vitest`; configure Vitest workspace to include story files — layer: Storybook tooling
- [ ] Pipe Vitest coverage report to CI summary (GitHub Actions `$GITHUB_STEP_SUMMARY`) — layer: CI

## Phases

### Phase 1 — Interaction tests (merge-as-you-go)
Install `@storybook/test` + `@storybook/test-runner`. Write `.play()` functions for the target components. Add `storybook:test` CI step. Ships as its own mini-release.

### Phase 2 — a11y CI gate (merge-as-you-go)
Wire `addon-a11y` into the test-runner. Define rule severity config. Add to CI. Ships as its own mini-release.

### Phase 3 — Vitest coverage (merge-as-you-go)
Install `@storybook/addon-vitest`. Configure workspace. Pipe coverage to CI summary. Ships as its own mini-release.

## Acceptance criteria

- [ ] `pnpm --filter storybook storybook:test` runs all `.play()` stories and exits 0 locally
- [ ] The CI "Lint · Typecheck · Validate · Build" job (or a new sibling job) runs the test-runner and fails if any `.play()` assertion throws
- [ ] A PR that introduces an a11y `error`-level violation fails the CI run with a clear log message identifying the story and rule
- [ ] `@storybook/addon-vitest` reports per-component coverage in the CI job summary (even if coverage is partial in Phase 3)
- [ ] No regressions to existing Chromatic VRT runs (Chromatic job passes after each phase merge)

## Technical notes

- **Current Storybook version:** 10.3.4 — verify `@storybook/test` and `@storybook/test-runner` compatibility with v10 before Phase 1 install. Storybook 9+ ships `@storybook/test` as a first-party package; v10 should be compatible.
- **test-runner vs addon-vitest:** `@storybook/test-runner` uses Playwright to run stories in a headless browser — necessary for DOM interaction tests. `@storybook/addon-vitest` runs stories in jsdom via Vitest — faster but no real DOM. Phase 1–2 use test-runner (real DOM for .play() and a11y); Phase 3 adds addon-vitest for coverage.
- **a11y severity config:** The test-runner can read `addon-a11y` config from story parameters. Define a shared `a11yConfig` in `apps/storybook/.storybook/preview.ts` with `rules` set to downgrade noisy rules (e.g. `color-contrast` for stories that deliberately use brand accent on brand bg) to `warn`. Only genuine structural violations (`role` misuse, missing `aria-*`, keyboard traps) should be `error`.
- **CI job placement:** Add a new `storybook-tests` job to `ci.yml` that runs after the main lint/build job (to avoid redundant installs). The Chromatic job already handles visual regression; the new job handles behavioural + a11y.
- **Activation audit:** Before Phase 1, read `.github/workflows/ci.yml` in full to understand the current job structure and pnpm cache setup, then model the new job to match.
- **Model & Mode:** `/model opus` — Opus plans (Pre-Execution Gate → Files to Modify), Sonnet executes after plan-mode exit.

## Model & Mode [REQUIRED]

`/model opus` — tooling + config changes across multiple files (package.json, main.ts, ci.yml, story files); planning pass needed to avoid mis-sequencing the three phases and breaking the existing Chromatic job.

## Non-Goals

- No changes to DS component logic or visual output — `.play()` tests assert behaviour, not appearance
- No new story files for currently-uncovered components — coverage is complete; this epic adds test depth, not breadth
- No Storybook upgrade (remains on v10.3.4 for this epic)
- No removal of Chromatic — it remains the visual regression gate; this epic adds the behavioural layer alongside it
- SUG-152 (usage docs) is unrelated and stays on hold

## Related

- **Linear:** [SUG-161](https://linear.app/sugartown/issue/SUG-161/storybook-testing-infrastructure-interaction-tests-a11y-ci-gate-vitest)
- **Related:** [SUG-158](https://linear.app/sugartown/issue/SUG-158) (Storybook docs template system — shipped), [SUG-152](https://linear.app/sugartown/issue/SUG-152) (usage docs — on hold, orthogonal)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
