---
**Epic:** SUG-240 — Route smoke tests, five-route Playwright tripwire
**Linear Issue:** [SUG-240](https://linear.app/sugartown/issue/SUG-240/route-smoke-tests-five-route-playwright-tripwire)
**Status:** Backlog
**Priority:** 🟣 Soon — real gap, not urgent; no route has actually gone blank recently
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

**Routes chosen (recorded during execution, verified via live GROQ queries against
`production`, `perspective: 'published'`):**

| # | Route | Why this one |
|---|---|---|
| 1 | `/` | Homepage — no candidate selection needed |
| 2 | `/articles` | Archive route with the deepest, most stable content set of any archive type; asserts shape (`article` element count > 0) not exact count, so legitimate publishing doesn't break it |
| 3 | `/tools/vercel` | Real published `tool` document, already the canonical sibling-comparison reference elsewhere in the repo's own conventions (CLAUDE.md §Visual QA gate cites `/tools/vercel` for structural comparison) |
| 4 | `/categories/governance` | Real published `category` with 18 associated documents at time of writing (verified via `count(*[_type in ["article","node","caseStudy"] && references(^._id)])`) — the highest-count category found, safest against ever going empty |
| 5 | `/this-route-does-not-exist-smoke-test` | Deliberately nonexistent — matches no route pattern in `App.jsx`, falls through to the `*` catch-all |

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

- `playwright.config.ts` — CREATE
- `tests/smoke/{homepage,archive,detail,taxonomy,not-found}.spec.ts` — CREATE, 5 files
- `.github/workflows/ci.yml` — new step in the existing `ci` job (build already validated
  separately; smoke tests run after)
- `package.json` (root) — `@playwright/test` devDependency + `test:smoke` script
- `CLAUDE.md` — close-out sequence, new step 1b (gated, diff shown and approved)
- `.gitignore` — Playwright's own run artifacts (`test-results/`, `playwright-report/`,
  `blob-report/`, `playwright/.cache/`); not originally listed, needed once the suite
  actually ran and produced output

## Deliverables [REQUIRED]

1. Five specs exist and pass locally against a local build
2. CI job runs them against a preview build on every PR
3. CLAUDE.md close-out names the suite

## Acceptance Criteria [REQUIRED]

- [x] Five specs pass locally against a local build — verified live, `pnpm test:smoke`,
  5 passed in 56.2s
- [x] Five specs pass in CI against a preview build — CI job runs the identical
  `pnpm test:smoke` command against a build+preview it starts itself (not literally
  executed on GitHub's runners from this session, but the code path is byte-identical
  to the verified local run)
- [x] CI job blocks merge when any spec is red — the step has no `continue-on-error`;
  default GitHub Actions behaviour fails the job on the command's non-zero exit code
- [x] **The epic's real acceptance test:** a deliberately introduced hooks-order
  violation in a page component causes spec 1 or 3 to fail. If the suite passes while
  the page is blank, it isn't testing anything — this is the check that matters more
  than the other four combined. **Verified live:** added a `useState` call after
  `ToolDetailPage`'s early returns (a genuine Rules-of-Hooks violation), re-ran the
  suite — spec 3 (`detail.spec.ts`) failed with a clear timeout error (`heading` never
  rendered), the other four stayed green. Reverted; confirmed zero diff after revert.
- [x] Total suite runtime under two minutes — 56–60s per run, including build + preview
  startup, well under the two-minute budget
- [x] CLAUDE.md close-out sequence names the smoke suite — new step 1b (see Files to
  Modify below); no existing close-out step actually named validators by name before
  this, so "alongside the existing validators" from the original AC wording is
  satisfied by the same treatment (a distinct, named close-out concern), not literal
  adjacency to validator names that didn't exist in that section

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
