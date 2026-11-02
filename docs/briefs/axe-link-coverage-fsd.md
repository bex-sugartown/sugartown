# Axe and link-check coverage: FSD

| Field | Value |
|---|---|
| Status | Draft (trial of `sugartown-fsd-writer`) |
| Date | 2026-11-02 |
| Owner | Bex |
| Issue | [#166](https://github.com/bex-sugartown/sugartown/issues/166) |
| AI PRD | `docs/briefs/axe-link-coverage-ai-prd.md` |

## 2. Requirement coverage

| Requirement ID | Design section that satisfies it |
|---|---|
| R-1 | 5 (C-1, C-2), 6 (flow A) |
| R-2 | 5 (C-3), 6 (flow B) |
| R-3 | 5 (C-4), 7 |
| R-4 | 8 (convention, human review) |
| R-5 | 5 (C-1), 6 (flow C) |
| R-6 | 6 (flow C), 10 (D-4) |
| R-7 | 5 (C-1), 7 |
| R-8 | 9 |
| R-9 | 5 (C-3), 8 |

## 3. Current state

| Thing | Path | Verified by |
|---|---|---|
| Five axe routes in a static `ROUTES` array, light theme only | `tests/smoke/a11y.spec.ts` | read, 2026-11-02 |
| `expectNoAxeViolations(page, route)` with `AXE_BASELINE` mode | `tests/smoke/helpers/axe.ts` | read, 2026-11-02 |
| Allowlist entry type has `rule`, `route`, `date`, `issue`, `maxNodes`; no theme field | `tests/smoke/helpers/axe-allowlist.ts` | read, 2026-11-02 |
| Three allowlist entries, all recorded in light (dates 2026-10-12 and 2026-10-13) | same file | read, 2026-11-02 |
| Axe liveness probe calls the helper with two arguments | `tests/smoke/axe-liveness.spec.ts` | read, 2026-11-02 |
| 14 seed pages, which already include `/case-studies`, `/nodes` and `/glossary` | `tests/smoke/helpers/seed-pages.json` | `python3` count and read |
| Internal crawl reads the seed list at test time, timeout 240 s | `tests/smoke/links.spec.ts` | read, 2026-11-02 |
| Weekly external check reads the same list (line 24) | `scripts/check-external-links.mjs` | `grep`, 2026-11-02 |
| Theme set by inline script reading `localStorage['st-theme']` | `apps/web/index.html` lines 29 to 32 | `grep`, 2026-11-02 |
| No `prefers-color-scheme` handling for the theme | `apps/web/src`, `apps/web/index.html` | `grep` found none, 2026-11-02 |
| Detail pages are prerendered by `prerender-content.mjs` | `apps/web/package.json` build script | `grep`, 2026-11-02 |
| Archive pages expose detail links: `/case-studies` 8, `/nodes` 12, `/glossary` 83 | production, GET only | Playwright probe, 2026-11-02 |
| Playwright config sets `fullyParallel: true`, no `workers` value, one chromium project | `playwright.config.ts` | read, 2026-11-02 |

## 4. Architecture and data flow

| Layer | In scope | What crosses its boundary |
|---|---|---|
| Data (Sanity schema) | No. No schema change | Not applicable |
| Query (GROQ) | No. Tests read rendered pages, not queries | Not applicable |
| Render (React) | No. No rendered change | Not applicable |
| Design system | No | Not applicable |
| Build or CI | Yes, tests only | `pnpm test:smoke` runs the same Playwright config; no workflow edit |

Flow, all inside `tests/smoke/`:

| Step | From | To | Carries |
|---|---|---|---|
| 1 | `a11y.spec.ts` | `helpers/discover.ts` | archive path, link pattern |
| 2 | `helpers/discover.ts` | browser page | `goto` archive, reads `a[href]` |
| 3 | `a11y.spec.ts` | `helpers/theme.ts` | page, theme name |
| 4 | `a11y.spec.ts` | `helpers/axe.ts` | page, route key, theme |
| 5 | `helpers/axe.ts` | `helpers/axe-allowlist.ts` | rule, route key, theme, node count |
| 6 | `links.spec.ts` | `helpers/discover.ts` | same discovery, adds detail pages to the seed list at run time |

## 5. Contracts

| Contract | Shape | Producer | Consumer |
|---|---|---|---|
| C-1 `discoverFirstDetail` | `(page: Page, archivePath: string, pattern: RegExp) => Promise<string>`. Returns the first `href` that matches `pattern`, in DOM order. Throws `Error` naming `archivePath` when nothing matches | `helpers/discover.ts` (new) | `a11y.spec.ts`, `links.spec.ts` |
| C-2 `PAGE_TYPES` | `{ key: string; archive: string; pattern: RegExp }[]` with three entries: `/case-studies/:first` from `/case-studies` and `/^\/case-studies\/[^/]+$/`, `/nodes/:first` from `/nodes` and `/^\/nodes\/[^/]+$/`, `/glossary/:first` from `/glossary` and `/^\/glossary\/[^/]+$/` | `helpers/discover.ts` | `a11y.spec.ts`, `links.spec.ts` |
| C-3 `applyTheme`, `assertTheme` | `type Theme = 'light' \| 'dark'`; `applyTheme(page, theme)` calls `addInitScript` to set `localStorage['st-theme']` to `light-pink-moon` or `dark-pink-moon`, before `goto`. `assertTheme(page, theme)` reads `document.documentElement.getAttribute('data-theme')` and throws on mismatch | `helpers/theme.ts` (new) | `a11y.spec.ts`, liveness spec |
| C-4 `expectNoAxeViolations` and `AxeAllowEntry` | Signature gains a third argument: `(page, route: string, theme: Theme)`. `AxeAllowEntry` gains `theme: Theme` (required). An entry matches only when `rule`, `route` and `theme` all equal. The route argument is a literal path for static routes and the page-type key (for example `/nodes/:first`) for discovered ones. Baseline files are named by route and theme | `helpers/axe.ts`, `helpers/axe-allowlist.ts` | `a11y.spec.ts`, `axe-liveness.spec.ts` |

Added during the build (2026-11-02): `isAllowlisted(violation, route, theme, list)` is exported from `helpers/axe.ts` as a pure function so a probe can test the theme match; `helpers/links.ts` resolves each href against the page it was found on, not the site origin (same-page anchors on detail pages failed before this).

Enum values: `Theme` is the two strings above, taken from `ThemeToggle.jsx` (`LIGHT`, `DARK`).

## 6. Behaviour

**Flow A: axe on discovered page types, light theme**

1. For each `PAGE_TYPES` entry, one Playwright test.
2. `applyTheme(page, 'light')` (epic 2; epic 1 omits it because light is the default theme).
3. `discoverFirstDetail(page, entry.archive, entry.pattern)` returns a path.
4. `page.goto(path)`; wait for the level-1 heading; wait for network idle.
5. `assertTheme(page, 'light')` (epic 2; omitted in epic 1).
6. `expectNoAxeViolations(page, entry.key, 'light')`.

The existing five-route light loop also calls `applyTheme`, `assertTheme` and passes `'light'` as the third argument.

**Flow B: axe in the dark theme**

1. For each of the five existing routes and each `PAGE_TYPES` entry, one Playwright test.
2. Same steps as flow A with `'dark'` in place of `'light'`; existing routes use their own `ready` function from `a11y.spec.ts` instead of discovery.

**Flow C: internal link crawl**

1. In `links.spec.ts`, open one context and run `discoverFirstDetail` for each `PAGE_TYPES` entry.
2. Seed list = `seed-pages.json` entries plus the three discovered paths, de-duplicated.
3. Run `checkInternalLinks` unchanged on that list.
4. Keep the existing assertions: more than 20 targets, no failures.

Validation rules: a missing or empty discovery result throws (no silent skip); an allowlist entry whose `issue` is not `#N` still fails the existing check in `helpers/axe.ts`.

## 7. Failure handling and edge cases

| Case | Detection | Behaviour | Test |
|---|---|---|---|
| Archive renders no detail links (empty or pattern changed) | `discoverFirstDetail` finds no match | Throws an error naming the archive; the test fails, not skips | Known-bad: point `PAGE_TYPES` at `/__no-such-archive__` in a liveness test and require a throw |
| Theme did not apply (storage blocked, init script missing) | `assertTheme` mismatch | Throws before the scan | Liveness test R-9: omit `applyTheme`, call `assertTheme(page, 'dark')`, require a throw |
| Archive loads but links render late | Wait for the level-1 heading plus network idle before reading hrefs | Same as the existing archive spec | Covered by the discovery tests |
| First item changes when new content is published | Scanned page differs from the previous run | The gate can go red from a publish, with no code change. The failure message carries the discovered path so the cause is visible | `untested`: needs a real publish, and Content Write and publish gates apply |
| One page type fails, the others pass | Tests are separate per page type and theme | Only the failing test is red | Covered by structure |
| Allowlist entry recorded in light hides a dark violation | Entry matching includes `theme` | No longer hides it | Unit-level: an entry with `theme: 'light'` must not filter a dark violation (new probe in `axe-liveness.spec.ts`) |
| Detail pages are prerendered, so the inline theme script may behave differently | `assertTheme` on discovered pages | Test fails loudly if the theme is wrong | `untested` for prerendered detail pages: the prototype covered the five existing routes only; first run in epic 2 settles it |
| Archive itself broken or removed | Discovery throws | Failure points at the archive | Covered by the first row |

## 8. Verification plan

| ID | Proof | Runs | Known-bad input it must fail |
|---|---|---|---|
| R-1 | `pnpm test:smoke`; light tests for the three page types appear and pass | CI | Empty archive path (first row above) |
| R-2 | Dark tests for eight routes pass or are allowlisted | CI | `assertTheme` with no `applyTheme` |
| R-3 | `expectNoAxeViolations` with an entry whose issue is not `#N` throws (existing check) | CI | `issue: ''` |
| R-4 | A reviewer lists entries and confirms each issue is open (`gh issue view`) at close-out | Human | An entry naming a closed issue |
| R-5 | `links.spec.ts` logs `internal links checked: N` with the three detail pages in the seed list | CI | A seed page with a broken link (existing probe) |
| R-6 | `grep -n seed-pages scripts/check-external-links.mjs` still finds the shared read (see D-4) | Local | Not applicable |
| R-7 | The FSD method (discovery) is implemented as C-1; reviewer confirms no hardcoded detail slug in the new specs: `grep -n "case-studies/\|nodes/\|glossary/" tests/smoke/a11y.spec.ts` returns only the pattern definitions | Local | A hardcoded slug added to `a11y.spec.ts` |
| R-8 | Smoke step duration from the CI run, compared with today's | CI | Not applicable, a measurement |
| R-9 | The theme-not-applied liveness test | CI | Itself |

## 9. Non-functional requirements

| Area | Requirement | Measured by |
|---|---|---|
| Performance | Smoke step adds no more than 3 minutes (D-2) | Step time in the CI run, before and after |
| Performance estimate | Eleven new axe scans at 1.8 to 3.5 s each plus three discovery loads, about 45 s serial. An estimate from the prototype's per-scan times, to be replaced by the CI measurement | Prototype `FINDINGS.md`, local only |
| Accessibility | Gate uses the existing tag list `AXE_TAGS` in `helpers/axe.ts`; a pass is not a conformance claim | Code read |
| Security | Tests read public pages with GET only; no Sanity token, no writes | Code read |
| Theming | Both `light-pink-moon` and `dark-pink-moon`; `light-shop` and `dark-shop` out of scope | `Theme` type in C-3 |

## 10. Decisions and alternatives

| Decision | Chosen | Rejected | Reason |
|---|---|---|---|
| How to get dark | Set `localStorage['st-theme']` before load (`addInitScript`) | Click the theme toggle; emulate `prefers-color-scheme` | The toggle adds a click per test and tests the toggle; the site ignores `prefers-color-scheme` (`grep` found none). The prototype showed the init script works |
| Allowlist theme handling | `theme` field on each entry, required | A separate dark allowlist file | One file keeps one place to review; the field is checked by the type |
| Route key for discovered pages | Page-type key such as `/nodes/:first` | The real discovered path | Real paths change when content is published, which would orphan entries |
| Test layout | One test per page type per theme | One loop over all routes | A failure names its route and theme; others still run |
| Where discovery lives | New `helpers/discover.ts` shared by axe and links | Inline in each spec | Two callers, so shared (CLAUDE.md §Atomic Reuse Gate) |
| Run against what | Existing local preview server in `playwright.config.ts` | Production | Matches CI; the prototype used production only to avoid a build |
| D-4 External-check seeds | Internal crawl only adds discovered pages | Port discovery into the script; hardcode slugs | See the D-4 note below |

**D-4 (decided 2026-11-02):** the weekly external check is a Node script reading `seed-pages.json`, and discovery runs in Playwright only. The internal crawl adds the discovered detail pages. The external check keeps the static list. Rejected: porting discovery into the script (same logic written twice), and hardcoding three slugs (contradicts D-3).

## 11. Epic handoff

| Epic slug | FSD sections | Requirement IDs | Order |
|---|---|---|---|
| light-page-types | 5 (C-1, C-2, C-4), 6 (flow A, flow C), 7 (rows 1, 3, 5, 6, 8) | R-1, R-3, R-4, R-5, R-6, R-7 | 1 |
| dark-theme-pass | 5 (C-3), 6 (flow B), 7 (rows 2, 4, 7), 9 | R-2, R-8, R-9 | 2 |

C-4's `theme` argument and field ship in epic 1 with only `light` used, so epic 2 adds dark without a type change.

## 12. Improvement loop

- After each epic, add its friction line to its close-out review.
- At close, mark each section Match, Drift or Gap against the shipped tests.
- Fix the doc or the code, and name which.
- Review date: 2026-12-01.

## Open decisions

None. D-4 is closed above.
