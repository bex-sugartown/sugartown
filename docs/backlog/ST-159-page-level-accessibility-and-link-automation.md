---
**Epic:** ST-159 — Page-level accessibility and link automation
**Issue:** [#159](https://github.com/bex-sugartown/sugartown/issues/159)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** no
---

# ST-159 — Page-level accessibility and link automation

Add axe to the Playwright smoke suite, a broken-link check, and a blocking accessibility assertion in Lighthouse CI, so the Pink Moon WCAG passes have a regression guard.

## Background

The WCAG work in #150 to #152 was a manual audit with fixes, and nothing in CI fails if contrast or semantics regress. Today no axe, pa11y or link checker exists in the repo (measured 2026-10-12: `grep -rliE 'axe-core|pa11y|linkinator|lychee'` over scripts, workflows, tests and package files returned nothing). `lighthouserc.cjs` asserts `categories:accessibility` at `warn` with `minScore: 0.9`, and it runs daily against production from `.github/workflows/stats.yml`, so it reports after a deploy and blocks nothing. The five Playwright smoke specs in `tests/smoke/` (homepage, archive, detail, taxonomy, 404) already boot the built app in CI via `ci.yml` step "Route smoke tests", which makes them the cheapest place to add a page-level check. #153 (WCAG 2.2 AA conformance claim) needs this layer to keep its claim true.

## Objective

After this epic, a pull request or push that introduces a WCAG A or AA axe violation on any of the five smoke routes fails CI. Broken internal links in the built site fail CI. External links are checked on a schedule and reported without blocking. The Lighthouse accessibility assertion fails loudly instead of warning. Layers touched: tooling (Playwright, CI, a link-check script, Lighthouse config). No schema, GROQ, React render or Sanity content changes. Fixing the violations the first run finds is a separate issue each (see Non-Goals).

## Scope

- [ ] **1. Baseline run:** add `@axe-core/playwright`, run axe against the five smoke routes, record every violation found with rule id and route in this doc's close-out; no failing gate yet — layer: tooling
- [ ] **2. axe gate in the smoke suite:** a shared helper in `tests/smoke/` runs axe (tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`) on each route and fails on any violation not on a named, dated allowlist that points at a filed issue — layer: tooling + CI
- [ ] **3. Internal link check:** a script that crawls the built `apps/web` output and fails on any internal link that returns 404 or points at a missing anchor, wired into `ci.yml` after Build — layer: tooling + CI
- [ ] **4. External link check, scheduled:** a weekly workflow that checks outbound links, opens or updates one issue with the broken list, and never blocks a deploy — layer: tooling + CI
- [ ] **5. Lighthouse assertion:** change `categories:accessibility` in `lighthouserc.cjs` from `warn` to `error` at the threshold the baseline supports, and state in the doc what a failure does (the run is post-deploy, so it fails the stats workflow and `ci-failure-alert.yml`) — layer: tooling

## Phases

| Phase | Ships | Scope items |
|---|---|---|
| 1 | axe installed, baseline recorded, violations filed as issues | 1 |
| 2 | axe gate live in CI with allowlist | 2 |
| 3 | internal link check live in CI | 3 |
| 4 | scheduled external link check, Lighthouse assertion hardened | 4, 5 |

## Acceptance Criteria

- [ ] `pnpm test:smoke` runs axe on all five routes and exits non-zero when a test page has an injected WCAG AA violation (proved by a deliberate failing fixture, then removed)
- [ ] Every allowlisted violation names a rule id, a route, a date and an open issue number; the helper fails if an allowlist entry has no issue reference
- [ ] The CI "Route smoke tests" step fails on a new violation and passes on `main` after Phase 2
- [ ] The internal link check exits non-zero on a deliberately broken link in a scratch build, and exits 0 on `main`
- [ ] The external link workflow runs on its schedule, produces one tracking issue, and a failed external link does not fail any deploy workflow
- [ ] `lighthouserc.cjs` asserts `categories:accessibility` at `error`, and the threshold is justified by the baseline in the close-out review
- [ ] `pnpm validate:liveness-probes` or an equivalent probe shows the axe gate goes red on known-bad input (a gate that stays green on bad input is the failure the probes exist to catch)
- [ ] The measured counts (routes covered, violations found, links checked) in the close-out each name the command that produced them

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate:** does not fire. No Sanity writes.
- **Schema changes:** none.
- **Upstream dependencies:** none blocking. Reviewed 2026-10-12: #50 (SUG-161) covers axe on Storybook stories, a different layer, and its Phase 2 should reuse the same rule tag list from this epic; #84 (SUG-253) diagnoses "accessibility tree not well-formed" once and may hand its findings to the baseline in Phase 1; #143 (nested `<a>`) is a likely baseline finding. #153 depends on this epic, not the reverse.
- **Activation audits:**
  - Read `playwright.config.ts` and the five specs in `tests/smoke/` to confirm the shared helper fits each route's wait conditions.
  - Read `.github/workflows/ci.yml` to confirm where a link-check step fits after Build, and whether the built output is available at that step.
  - Read `.github/workflows/stats.yml` and `ci-failure-alert.yml` to confirm what a failing `lhci assert` does today before moving it to `error`.
  - Confirm the smoke suite's route set against `apps/web/src/App.jsx`; five routes is a sample, not coverage of every page type, and the close-out says so.
- **Link check method (decided 2026-10-12):** crawl the running Playwright preview, not the built `dist/` files. Only content detail pages are prerendered (`apps/web/scripts/prerender-content.mjs`); archive and taxonomy pages are an empty shell until JavaScript runs, so a `dist/` parse would pass while their links are broken. Phase 3 reuses the smoke suite's server and config.
- **Kill criterion (set at activation, 2026-10-12):** on 2027-01-12, retire the weekly external link workflow if it has opened no actionable broken-link issue; on 2027-04-12, review the axe gate and the internal link check against what they caught. A gate that caught nothing and has no probe is removed or rescoped, never loosened.
- **Branch:** strategy (b), so all phases accumulate on `feat/st-159-page-level-a11y-automation` and merge once at close-out.
- **axe is not a conformance claim.** Automated rules catch a minority of WCAG criteria. This epic does not change the "partially conforms" status that #153 addresses.
- **Model & Mode:** see below.

## Model & Mode [REQUIRED]

`/model sonnet`. Test and CI wiring with a clear spec and no architecture decisions; Sonnet executes directly.

## Non-Goals

- Fixing the violations the baseline finds. Each becomes its own issue; a fix that touches CSS or markup is out of scope here.
- Storybook component-level axe gate. That is #50 (SUG-161) Phase 2.
- Diagnosing "accessibility tree is not well-formed". That is #84 (SUG-253).
- The WCAG 2.2 AA conformance claim and the W3C logo. That is #153.
- Covering every route. The first gate covers the five smoke routes; widening the set is a follow-up decided from the baseline.
- Manual assistive-technology testing (screen readers, keyboard-only passes). Automation does not replace it.

## Related

- **GitHub:** [#159](https://github.com/bex-sugartown/sugartown/issues/159)
- **Related issues:** [#50](https://github.com/bex-sugartown/sugartown/issues/50), [#84](https://github.com/bex-sugartown/sugartown/issues/84), [#143](https://github.com/bex-sugartown/sugartown/issues/143), [#153](https://github.com/bex-sugartown/sugartown/issues/153), closed [#150](https://github.com/bex-sugartown/sugartown/issues/150) to [#152](https://github.com/bex-sugartown/sugartown/issues/152)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
