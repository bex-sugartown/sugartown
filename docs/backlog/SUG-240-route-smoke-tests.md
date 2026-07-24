---
**Epic:** SUG-240 — Route smoke tests, five-route Playwright tripwire
**Linear Issue:** [SUG-240](https://linear.app/sugartown/issue/SUG-240/route-smoke-tests-five-route-playwright-tripwire)
**Status:** Backlog
**Priority:** 🟡 Medium — real gap, not urgent; no route has actually gone blank recently
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-240 — Route smoke tests

A tripwire, not a test suite. Five Playwright specs, one assertion each, proving the app
actually renders — a category no current check covers.

## Template adaptation — declared once

Testing infrastructure epic. No Sanity schema or GROQ change; render layer is the
subject under test, not modified.

| Template section | Status | Reason |
|---|---|---|
| Component-Reuse Manifest | N/A | No new visual surface |
| Doc Type Coverage Audit | N/A | No field/section/renderer added |
| Schema Field Proposal | N/A | No schema field added |
| Query Layer Checklist | N/A | No GROQ touched |
| Schema Enum Audit | N/A | No enum field rendered |
| Metadata Field Inventory | N/A | No metadata surface touched |
| Themed Colour Variant Audit | N/A | Assertions check render + content, not appearance — Chromatic's job |
| Migration Script Constraints | N/A | No data transform |
| Human QA Walkthrough | N/A | Tests are the walkthrough, automated |
| Visual QA Gate | N/A | No visual assertions — existence and content only |

Phase 0 does not fire — no new rendered surface, this epic tests existing ones.

## Pre-Execution Completeness Gate [REQUIRED]

- [x] **Correct audit file paths** — confirmed no `playwright.config.*` or test runner
  exists anywhere in the repo (verified via `find` during the originating audit); this is
  a genuine "add a runner" epic, not "add specs to an existing one"
- [x] **Scope ↔ Non-Goals consistency** — checked

## Context [REQUIRED]

`docs/drafts/workflow-audit-v0.3-grounded.md` Gap 3, verified against the live repo:
zero test-runner dependencies in any `package.json`, no config file anywhere. Existing
validators (`validate:urls`, `validate:filters`, `validate:taxonomy`, `validate:tokens`,
`validate:style-mirror`) check that content and styles are internally consistent.
Chromatic checks that pixels haven't moved, non-blocking (`--exit-zero-on-changes`).
Nothing checks the application actually renders.

CLAUDE.md's own React hooks pre-flight rule exists as a *human procedure* standing in for
a missing automated check: "A hooks-order violation crashes silently in dev and produces
a blank page." Five route-level assertions would catch that failure class mechanically.

**Dependency note:** SUG-161 Phase 1 (Storybook testing infrastructure, `⚪ Later`)
installs `@storybook/test-runner`, which pulls in Playwright as a transitive dependency
for its own headless-browser story testing. If SUG-161 Phase 1 lands first, this epic
should reuse that Playwright install rather than adding a second one — check
`package.json` for an existing Playwright dependency before running the install step.

## Objective [REQUIRED]

After this epic: five Playwright specs run against a local or preview build on every
pull request and block merge on failure. No schema, query, or render code is modified —
this epic adds a test harness around existing behavior.

## Scope [REQUIRED]

- [ ] Check `package.json` for an existing Playwright dependency (SUG-161 Phase 1
  dependency note above) before installing — reuse if present
- [ ] Add Playwright + `playwright.config.*` at repo root
- [ ] Write five specs, one assertion each (see table below)
- [ ] Add a CI job to `.github/workflows/ci.yml` running the specs against a built
  preview, blocking on red
- [ ] Add the smoke suite to CLAUDE.md's close-out sequence, alongside the existing
  validators

## The five specs [REQUIRED — do not add a sixth without a stated reason]

| # | Route | Assertion |
|---|---|---|
| 1 | Homepage | renders, zero console errors |
| 2 | One archive route | renders and returns more than zero cards |
| 3 | One detail route | renders its title from Sanity, not a placeholder |
| 4 | One taxonomy route | filters to a non-empty set |
| 5 | A known bad path | returns the 404 view, not a white screen |

Real published documents only — if a candidate route depends on seeded or placeholder
content, pick a different route and record which, and why, in this doc before writing
the spec.

## Non-Goals [REQUIRED]

- **Coverage as a target.** Five routes, not a percentage, not a suite that grows by
  default. Adding a sixth requires a stated reason in a future epic, not a drive-by
  addition here.
- **Component-level tests.** Storybook and Chromatic own the component layer; this epic
  owns route-level existence and content only.
- **Visual assertions.** Chromatic owns pixels. These specs assert existence and content,
  not appearance.

## Technical Constraints [REQUIRED]

- Specs run against a built preview (Netlify deploy preview or local `vite preview`), not
  the dev server — matches how a real regression would surface.
- Test data: real published Sanity documents via the live `production` dataset,
  `perspective: 'published'` (never drafts), consistent with the rest of the codebase's
  client convention.

## Files to Modify [REQUIRED]

- `playwright.config.*` — CREATE
- `tests/smoke/*.spec.ts` (or equivalent) — CREATE, 5 files or 1 file/5 tests
- `.github/workflows/ci.yml` — new job
- `package.json` — Playwright dependency (if not already present) + test script
- `CLAUDE.md` — close-out sequence, name the smoke suite

## Deliverables [REQUIRED]

1. Five specs exist and pass locally against a local build
2. CI job runs them against a preview build on every PR
3. CLAUDE.md close-out names the suite

## Acceptance Criteria [REQUIRED]

- [ ] Five specs pass locally against a local build
- [ ] Five specs pass in CI against a preview build
- [ ] CI job blocks merge when any spec is red
- [ ] **The epic's real acceptance test:** a deliberately introduced hooks-order
  violation in a page component causes spec 1 or 3 to fail. If the suite passes while
  the page is blank, it isn't testing anything — this is the check that matters more
  than the other four combined.
- [ ] Total suite runtime under two minutes
- [ ] CLAUDE.md close-out sequence names the smoke suite alongside the existing
  validators

## Risks / Edge Cases [REQUIRED]

- **False positive rate.** If routes depend on content that changes frequently (e.g. a
  "latest N" list), assertions must check shape ("more than zero cards") not exact
  content, to avoid failing on legitimate content updates.
- **Preview-build flakiness.** If the Netlify preview isn't ready when CI runs the specs,
  add a retry/wait step rather than a flat pass — a flaky-but-green suite is worse than a
  slow one.
- **Two Playwright installs.** If this epic and SUG-161 Phase 1 land out of order without
  checking for the existing dependency, `package.json` could end up with duplicate or
  conflicting Playwright versions. The Scope's first bullet exists specifically to catch
  this.

## Post-Epic Close-Out [REQUIRED]

1. Visual QA gate — N/A
2. Chromatic — N/A
3. Data pipeline gap check — N/A
4. Move `docs/backlog/SUG-240-route-smoke-tests.md` →
   `docs/shipped/SUG-240-route-smoke-tests.md`
5. Confirm clean tree
6. `/mini-release SUG-240 Route smoke tests`
7. Transition SUG-240 to **Done** in Linear
8. Start next epic only after mini-release commit is confirmed
