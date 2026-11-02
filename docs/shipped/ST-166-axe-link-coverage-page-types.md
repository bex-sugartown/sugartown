---
**Epic:** ST-166 — Axe and link-check coverage for case study, node and glossary pages (light theme)
**Issue:** [#166](https://github.com/bex-sugartown/sugartown/issues/166)
**Status:** Backlog
**Priority:** Low (board value unchanged; set by the human)
**Merge strategy:** (b) Single close-out, one branch, one CHANGELOG line at the end
**Visual:** no
---

# ST-166 — Axe and link-check coverage for case study, node and glossary pages (light theme)

Epic 1 of 2 from the AI PRD `docs/briefs/axe-link-coverage-ai-prd.md` and the FSD `docs/briefs/axe-link-coverage-fsd.md`. Epic 2 (dark theme pass) is filed as its own issue after this one ships and depends on it.

## Model & Mode [REQUIRED]

`/model sonnet`. Test code and one seed-list extension, no architecture decision. Run `pnpm test:smoke` locally before each commit.

## Pre-Execution Completeness Gate [GATE: run at activation, before writing Scope or Phases]

- [x] **Interaction surface audit**: N/A. No interactive element is created. The work is Playwright test code.
- [x] **Use case coverage**: N/A. No new component or web adapter.
- [x] **Layout contract**: N/A. No layout.
- [x] **All prop value enumerations**: N/A. No `select` or enum prop. The one enum-like value is `Theme = 'light' | 'dark'`, taken from `apps/web/src/components/ThemeToggle.jsx` (`LIGHT`, `DARK`); only `'light'` is used in this epic.
- [x] **Correct audit file paths**: every path in Files to Modify was checked with `ls` on 2026-11-02, except the two files marked CREATE.
- [x] **Existing-system claims verified** (command per claim, all run 2026-11-02):
  - `a11y.spec.ts` holds 5 routes in a static `ROUTES` array: read the file.
  - `axe-allowlist.ts` has 3 entries and no `theme` field: read the file; `grep -rn "isAllowlisted" tests` returns 0.
  - `seed-pages.json` has 14 entries, including `/case-studies`, `/nodes`, `/glossary`: `python3 -c "import json;print(len(json.load(open('tests/smoke/helpers/seed-pages.json'))))"`.
  - `scripts/check-external-links.mjs` reads the same file (line 24): `grep -n seed-pages scripts/check-external-links.mjs`.
  - Archive pages expose detail links: `/case-studies` 8, `/nodes` 12, `/glossary` 83, each starting `/case-studies/`, `/nodes/`, `/glossary/`: Playwright probe against production, GET only.
  - Detail routes exist: `apps/web/src/App.jsx` lines 125, 129 and 136 (see the routing pre-flight below).
- [x] **Dark / theme modifier treatment**: light theme only in this epic. The dark theme is epic 2. Default theme is `light-pink-moon`, set by the inline script in `apps/web/index.html` lines 29 to 32, so no theme setup is needed here.
- [x] **Studio schema changes scoped**: none. Out of scope, no epic owns any.
- [x] **Web adapter sync scoped**: N/A. No design-system component is touched.
- [x] **Composition overlap audit**: N/A. No schema sub-object.
- [x] **Atomic Reuse Gate**: `helpers/discover.ts` is new. No equivalent exists in `tests/smoke/helpers/` (`ls`). It has two callers (`a11y.spec.ts`, `links.spec.ts`), and its API takes the archive path and a pattern, so it composes.
- [x] **Token value cross-check**: N/A. No token or CSS.
- [x] **Enforcement liveness**: this epic extends two gates. Each addition has a known-bad probe in Scope item 1 and item 2. Existing probes (`axe-liveness.spec.ts`, the broken-link probe in `links.spec.ts`) stay.
- [x] **App.jsx routing pre-flight**: read `apps/web/src/App.jsx`. `/case-studies/:slug` renders `CaseStudyPage`, `/nodes/:slug` renders `NodePage`, `/glossary/:slug` renders `GlossaryTermPage`. Archives: `/case-studies` and `/nodes` render `ArchivePage`, `/glossary` renders `GlossaryArchivePage`.
- [x] **Component-Reuse Manifest**: N/A. No page, section or visual surface.
- [x] **Scope ↔ Non-Goals consistency**: check run. No Non-Goal forbids a Scope item. Non-Goals exclude theme work, which no Scope item requires.
- [x] **Spike component selection**: N/A. No spike. The dark prototype is finished (`docs/briefs/axe-link-coverage-ai-prd.md` §4).
- [x] **Component registry update**: N/A. No component.
- [x] **Technical diagram red-pen gate**: N/A. No diagram.
- [x] **Kill criterion**: if scans of the discovered pages go red from a content publish, with no code change, more than twice in one month, replace discovery with one hardcoded slug per page type or drop that page type from the gate. Check date: 2026-12-01.
- [x] **Removal scope**: N/A. Nothing is removed.
- [x] **One index, or one ID scheme**: N/A. No IDs introduced beyond the AI PRD's R-n, which the AC cite.

## Background [REQUIRED]

#164, #163 and the Lighthouse results were the baseline for ST-159, which gates five routes (`/`, `/articles`, `/tools/vercel`, `/categories/governance`, and a 404) with axe in the light theme, and runs an internal link crawl over 14 seed pages.

Files this epic touches, all under `tests/smoke/`:

- `a11y.spec.ts`: the five axe routes in a static array.
- `helpers/axe.ts`: `expectNoAxeViolations(page, route)`, tag list, `AXE_BASELINE` mode.
- `helpers/axe-allowlist.ts`: entries of `{ rule, route, date, issue, maxNodes }`, three of them, all recorded in light. A rule and route alone match; there is no theme field.
- `axe-liveness.spec.ts`: a known-bad page the helper must reject.
- `links.spec.ts` and `helpers/links.ts`: internal crawl, depth 1, 240 s timeout.
- `helpers/seed-pages.json`: 14 pages, shared with the weekly external check.

Recent epics on the same surface: ST-159 (axe gate and link crawl, phases 1 to 4, shipped). In flight: none touching `tests/smoke/` (checked `ls docs/backlog`).

**FSD drift found while writing this epic (fixed in the FSD, same commit series):** FSD flow A steps 2 and 5 call `applyTheme` and `assertTheme` (contract C-3), which belong to epic 2. Epic 1 omits those two steps. Light is the default theme, so none is needed.

## Objective [REQUIRED]

After this epic the axe gate scans one real case study, one node and one glossary term in the light theme, and the internal link crawl includes those three pages. The first item of each archive is found at run time, so no slug is hardcoded. Allowlist entries and the axe helper carry a `theme` value, so epic 2 can add dark without a type change.

- Data layer (Sanity schema): not affected. No schema or content change.
- Query layer (GROQ): not affected. Tests read rendered pages and make no new queries.
- Render layer (React): not affected. No rendered change.

## Scope [REQUIRED]

All items are in Phase 1.

- [ ] **1. Discovery helper and its probe (Phase 1).** Create `tests/smoke/helpers/discover.ts` with `discoverFirstDetail(page, archivePath, pattern)` and `PAGE_TYPES` (FSD C-1, C-2). Create `tests/smoke/discover-liveness.spec.ts`: a call against `/__no-such-archive__` must reject with an error naming that path. Layer: tests.
- [ ] **2. Theme-aware axe helper and allowlist (Phase 1).** In `helpers/axe.ts` add `type Theme = 'light' | 'dark'`, a third argument `theme`, a pure exported `isAllowlisted(violation, route, theme, list)`, and baseline file names that include the theme. In `helpers/axe-allowlist.ts` add a required `theme` field and set `'light'` on the three existing entries. In `axe-liveness.spec.ts` pass `'light'` and add a probe: `isAllowlisted` with a `theme: 'light'` entry and `theme = 'dark'` must return false (FSD C-4, edge case row 6). Layer: tests.
- [ ] **3. Axe tests for discovered page types (Phase 1).** In `a11y.spec.ts` add one light-theme test per `PAGE_TYPES` entry (flow A, without the C-3 steps): discover the first detail, go to it, wait for the level-1 heading and network idle, run `expectNoAxeViolations(page, entry.key, 'light')`. The existing five tests pass `'light'`. Any new violation is allowlisted with an open issue number, a `maxNodes` and `theme: 'light'`, never fixed here. Layer: tests.
- [ ] **4. Link crawl seeds (Phase 1).** In `links.spec.ts` run `discoverFirstDetail` for each `PAGE_TYPES` entry, add the three paths to the seed list, de-duplicate, and log the seed count (flow C, FSD D-4). `seed-pages.json` and `scripts/check-external-links.mjs` stay unchanged. **Amended 2026-11-02:** `helpers/links.ts` also changes. It resolved every href against the site origin, so a same-page link such as `#section-challenge-1` on a detail page became `/#section-challenge-1` and failed on the homepage (14 false failures on first run). It now resolves against the page the link was found on, with a probe. Layer: tests.

## Phases [REQUIRED]

Single phase. Ships when all four Scope items are done and `pnpm test:smoke` passes locally. Sizing gate: stays flat (4 Scope items, under the limit of 5, so no decomposition table). No sub-issues are filed.

## Non-Goals [REQUIRED]

- The dark theme, `applyTheme`, `assertTheme` and the dark liveness probe. Reason: they are FSD contract C-3 and requirements R-2, R-8 and R-9, owned by epic 2 (issue filed after this ships).
- Platform pages and `/about` coverage. Reason: deferred by D-1 on 2026-11-02; no issue filed.
- Fixing any contrast or ARIA failure the wider scan finds. Reason: each is a rendered change with its own gates. Existing owners: #164, #169, #170, #171, #172; new findings get new issues.
- Any change to `seed-pages.json` or `scripts/check-external-links.mjs`. Reason: decided in FSD D-4.
- Any Studio schema, GROQ or React change. Reason: no requirement needs one.
- The `light-shop` and `dark-shop` themes. Reason: not requested in #166.

## Technical Constraints [OPTIONAL]

- Playwright tests under `tests/smoke/`, run by `pnpm test:smoke`; the config is `playwright.config.ts` (`fullyParallel: true`, one chromium project, 30 s default timeout).
- A discovery failure must throw, never skip (FSD §7, row 1).
- The allowlist rule stays: no entry without an `#N` issue, and never widen an entry to make a run pass (header of `helpers/axe-allowlist.ts`).
- A new allowlist entry needs an open issue first. File it with `gh issue create` before adding the entry.
- Rules: `CLAUDE.md` §Building a mechanism (rule 2: a guard is never widened to fit a breach).

## Files to Modify [OPTIONAL]

**Tests**
- `tests/smoke/helpers/discover.ts`: CREATE
- `tests/smoke/discover-liveness.spec.ts`: CREATE
- `tests/smoke/helpers/axe.ts`: theme argument, `isAllowlisted`, baseline file name
- `tests/smoke/helpers/axe-allowlist.ts`: `theme` field on the type and the three entries, plus any new entries
- `tests/smoke/axe-liveness.spec.ts`: pass `'light'`, add the theme probe
- `tests/smoke/a11y.spec.ts`: three discovered-page tests, `'light'` argument on the existing five
- `tests/smoke/links.spec.ts`: discovered seeds, the count log, and a same-page anchor probe
- `tests/smoke/helpers/links.ts`: resolve hrefs against the page URL (added 2026-11-02, scope gap found on first run)

**Close-out**
- `CHANGELOG.md`: one line in `[Unreleased]`

## Acceptance Criteria [REQUIRED]

- [ ] **R-1.** `pnpm test:smoke --list | grep -c "axe: "` prints 8 (the 5 existing and 3 new). `pnpm test:smoke` passes.
- [ ] **R-3.** The probe in `axe-liveness.spec.ts` passes: `isAllowlisted` returns false for a `theme: 'light'` entry when the theme argument is `'dark'`. Every allowlist entry has a `theme` value: `grep -c "theme:" tests/smoke/helpers/axe-allowlist.ts` equals the entry count plus the type line.
- [ ] **R-4.** At close-out, each allowlist entry is listed with `gh issue view {n} --json state` and every one reads `OPEN`. Paste the list into the close-out review.
- [ ] **R-5.** `pnpm test:smoke` logs `internal links checked: N` where the seed count line reads 17 (14 plus 3), and the test passes with N greater than 20.
- [ ] **R-6.** `git diff main --name-only -- tests/smoke/helpers/seed-pages.json scripts/check-external-links.mjs` prints nothing, and `grep -n seed-pages scripts/check-external-links.mjs` still finds the read.
- [ ] **R-7.** `grep -nE "case-studies/[a-z]|nodes/[a-z]|glossary/[a-z]" tests/smoke/a11y.spec.ts tests/smoke/links.spec.ts` prints nothing (no hardcoded slug; the patterns live in `discover.ts`).
- [ ] **Same-page anchors.** `pnpm test:smoke` reports no `anchor not found` failures from the three discovered pages. The new probe (a page with `<a href="#x">` and an element `id="x"`) passes, and fails when `helpers/links.ts` is reverted to resolve against the origin (run once, revert, record).
- [ ] **New findings recorded.** Each new axe finding on the three page types has an open issue and an allowlist entry with `theme: 'light'`: #184 (color-contrast, 1 node per page type) and #185 (link-in-text-block, 10 case study, 5 node).
- [ ] **Discovery probe.** The `discover-liveness.spec.ts` test passes, and fails when `discoverFirstDetail` is made to return `''` instead of throwing (run once with that change, revert, record the result).
- [ ] **Studio typecheck.** N/A: no change under `apps/studio`.
- [ ] **Route smoke-test.** N/A: no route or renderer changes. The new tests visit one detail page per type and the archives, which exercises both.
- [ ] **Visual QA.** N/A: no visible output changes.
- [ ] **Close-out review present.** `node scripts/check-epic-doc.js <doc> --stage close-out` exits 0.

## Risks / Edge Cases [OPTIONAL]

- A content publish changes the first item of an archive, and the new page has a violation. The gate goes red with no code change. The failure message carries the discovered path. See the kill criterion above. (FSD §7, row 4: untested, needs a real publish.)
- The first scan found violations: color-contrast on ContentNav titles (#184) and glossary links by colour alone (#185). They are allowlisted, not fixed here. #185's cap follows how many glossary terms the first case study (10) and node (5) carry; a publish with more terms turns the gate red until #185 is fixed.
- Glossary has 83 terms, so the first item is arbitrary. Its representativeness is untested; a different term could carry different markup.
- Added run time: three archive loads and three scans, about 15 to 20 s serial (an estimate from the prototype's 1.8 to 3.5 s per scan; measure in CI). Epic 2 owns the 3-minute budget (R-8).

## Post-Epic Close-Out [at close-out]

The steps are `CLAUDE.md` §Epic close-out sequence. Run them in order.

## Close-out review [REQUIRED at close-out]

### Acceptance criteria

- [x] **R-1.** `pnpm test:smoke --list | grep -c "axe: "` printed 8. Local `pnpm test:smoke` on a fresh preview build: 19 passed (1.3 min). Also 19 passed against production.
- [x] **R-3.** The theme probe passes (`allowlist entry recorded in light does not hide a dark violation`). `grep -c "theme:" tests/smoke/helpers/axe-allowlist.ts` printed 9: 8 entries plus the type line.
- [x] **R-4.** All 8 entries name #164, #172, #184 or #185. Checked at close-out: `gh issue view {n} --json state` read OPEN for #164, #172, #184 and #185.
- [x] **R-5.** Log reads `seed pages: 17 (14 static, 3 discovered)` and `internal links checked: 305 unique targets from 17 seed pages`. The test passes.
- [x] **R-6.** `git diff main --name-only -- tests/smoke/helpers/seed-pages.json scripts/check-external-links.mjs` printed nothing. `scripts/check-external-links.mjs` line 24 still reads the seed file.
- [x] **R-7.** `grep -nE "case-studies/[a-z]|nodes/[a-z]|glossary/[a-z]" tests/smoke/a11y.spec.ts tests/smoke/links.spec.ts` printed nothing.
- [x] **Same-page anchors.** No `anchor not found` failures remain. The probe passes, and failed when `helpers/links.ts` was reverted to resolve against the origin (run once, reverted).
- [x] **New findings recorded.** #184 (color-contrast, 1 node per page type) and #185 (link-in-text-block, 10 case study, 5 node) filed and allowlisted with `theme: 'light'`.
- [x] **Discovery probe.** Passes, and failed when `discoverFirstDetail` returned `''` instead of throwing (run once, reverted).
- [x] **Studio typecheck, route smoke-test, Visual QA.** N/A as stated in the criteria.
- [x] **Close-out review present.** `node scripts/check-epic-doc.js <doc> --stage close-out` exits 0.

### What didn't work

The first run against real pages found a crawler bug outside the epic's file list: `helpers/links.ts` resolved relative hrefs against the origin, so 14 same-page anchors on the new detail pages failed. The epic was amended mid-build (Files to Modify, Scope item 4, two acceptance criteria). The FSD had also put `applyTheme` and `assertTheme` (epic 2) into flow A; this was caught while writing the epic and fixed before the build.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Dark-theme pass (R-2, R-8, R-9, contract C-3, flow B, flow A theme retrofit) | implementation | #186 |
| ContentNav titles fail contrast (3.23:1) | implementation | #184 |
| Glossary links told apart by colour alone | implementation | #185 |
| Platform pages and `/about` coverage | implementation | declined: deferred by D-1, no requirement owns it |
| Crawler never ran against pages with same-page anchors before this epic; no check asserts the seed pages contain such a link | workflow-docs | declined: the new probe covers the bug class directly |
| `sugartown-epic-writer` has no step that checks an epic's file list against what the first run touches | workflow-docs | declined: the epic rule already says to stop and amend, and it did |

### Friction line

The first run against real pages exposed a crawler bug outside the epic's file list, which forced a mid-build amendment.

---

## Post-ship checks [REQUIRED at close-out]

- [ ] The new axe and link tests are green on the pushed commit: `gh run list --workflow ci.yml --limit 1` reads `success`.
- [ ] The two discovered pages that carry the most glossary links still sit under the #185 caps (case study 10, node 5): person: re-run `pnpm test:smoke` after the next publish to the case studies or nodes archive.
