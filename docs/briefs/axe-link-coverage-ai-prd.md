# Axe and link-check coverage: AI PRD

| Field | Value |
|---|---|
| Status | Draft (trial of `sugartown-prd-ai-writer`) |
| Date | 2026-11-02 |
| Owner | Bex |
| Issue | [#166](https://github.com/bex-sugartown/sugartown/issues/166) |
| Human PRD | None. See Assumptions. |

## Assumptions standing in for the human PRD

| Assumption | Why it holds | Flag if wrong |
|---|---|---|
| The goal is a wider automated safety net, not a conformance claim | `tests/smoke/helpers/axe.ts` states a pass is not a conformance claim (#153) | Yes |
| No rendered change ships, so Visual is no | The work is test code and seed data only | Yes |
| New failures found by wider coverage are allowlisted with an issue, not fixed here | The allowlist rule in `tests/smoke/helpers/axe-allowlist.ts` | Yes |
| Smoke stays one Playwright run in `ci.yml` | `pnpm test:smoke` at `.github/workflows/ci.yml:132` | Yes |

## 2. Agent context

Read these before starting.

| Path | Why | Verified |
|---|---|---|
| `tests/smoke/a11y.spec.ts` | The five axe routes, light theme only | `ls`, 2026-11-02 |
| `tests/smoke/helpers/axe.ts` | Axe wrapper, tag list, baseline mode `AXE_BASELINE` | `ls`, 2026-11-02 |
| `tests/smoke/helpers/axe-allowlist.ts` | Issue-tagged allowlist with `maxNodes` | `ls`, 2026-11-02 |
| `tests/smoke/axe-liveness.spec.ts` | Known-bad probe for the axe helper | `ls`, 2026-11-02 |
| `tests/smoke/links.spec.ts`, `tests/smoke/helpers/links.ts` | Internal link crawl, depth 1, 240 s timeout | `ls`, 2026-11-02 |
| `tests/smoke/helpers/seed-pages.json` | 14 seed pages, shared by the internal and weekly external check | `python3` count, 2026-11-02 |
| `scripts/check-external-links.mjs` | Reads the same seed list (line 24) | `grep`, 2026-11-02 |
| `apps/web/src/components/ThemeToggle.jsx` | Theme is `data-theme` on `<html>`, stored in `localStorage['st-theme']`, dark value `dark-pink-moon` | read, 2026-11-02 |
| `playwright.config.ts` | One `chromium` project, 30 s default test timeout | read, 2026-11-02 |
| `.github/workflows/ci.yml` | Smoke step runs `pnpm test:smoke` | `grep`, 2026-11-02 |
| `apps/web/src/lib/routes.js` | Route registry for page-type detail paths | `ls`, 2026-11-02 |

Rules apply from `CLAUDE.md` §Building a mechanism and §Verify before citing. The allowlist
rule is in the header of `tests/smoke/helpers/axe-allowlist.ts`.

## 3. Requirements

Page types in scope are the three chosen in D-1: case study, node, glossary term.

| ID | Requirement | Source | Check | Class |
|---|---|---|---|---|
| R-1 | Axe scans one real detail or landing route for each page type in scope, in the light theme | #166 body | Routes appear in `ROUTES` in `a11y.spec.ts`; `pnpm test:smoke` passes | enforced-by-code |
| R-2 | Axe scans every R-1 route and the five existing routes in `dark-pink-moon` | #166 body | A dark loop in `a11y.spec.ts`; the scan asserts `data-theme` equals `dark-pink-moon` before scanning | enforced-by-code |
| R-3 | A violation found by R-1 or R-2 is fixed or allowlisted with an issue number and a `maxNodes` | `axe-allowlist.ts` header | `expectNoAxeViolations` rejects an entry whose issue does not match `#N` | enforced-by-code |
| R-4 | Every allowlisted entry names an issue that is open | `axe-allowlist.ts` header | No script checks this today. A reviewer reads the list at close-out | convention |
| R-5 | The internal link crawl seeds include a page for each page type in scope | #166 body | `seed-pages.json` entries; `links.spec.ts` passes with more than 20 targets | enforced-by-code |
| R-6 | Internal and weekly external checks keep one shared seed list | `links.spec.ts` comment | `grep -n seed-pages scripts/check-external-links.mjs` finds the read | enforced-by-code |
| R-7 | New routes resolve a published document without a hardcoded slug that can be unpublished | assumption | No automated check. The FSD states the D-3 method (discover the first item from the archive page) and a reviewer confirms it | convention |
| R-8 | The smoke step adds no more than 3 minutes to its current duration (D-2) | assumption | Smoke step duration read from the CI run | measured |
| R-9 | The dark scan has a known-bad probe: it fails if the theme did not apply | R-2 | A test that clears `st-theme` and requires the dark helper to throw | enforced-by-code |

## 4. Research and verification plan

| Claim | Command or source that settles it | Run by | Done before |
|---|---|---|---|
| 294 unique internal link targets on the 14 seeds | Run `pnpm test:smoke` and read the `internal links checked:` line from `links.spec.ts` (the figure in #166 dates from 2026-10-12) | Agent | First epic |
| Setting `localStorage['st-theme']` before load makes `data-theme` read `dark-pink-moon` on first paint | Prototype (`sugartown-prototype-writer`): a Playwright `addInitScript` on one route | Agent | FSD |
| A dark axe scan of the five existing routes fails on known issues #169, #170, #171 | Prototype run with `AXE_BASELINE` set, which records violations without failing | Agent | FSD |
| Smoke step time today | Read the step duration from the latest `ci.yml` run. Whole-workflow runs on 2026-10-30 to 2026-10-31 took 6 min 46 s to 9 min 14 s (`gh run list`, created to updated) | Agent | D-2 |
| Which detail slugs exist and are stable for case study, node, glossary and platform pages | Read the archive pages in the running preview and note the first item for each page type | Agent | FSD |

## 5. Test and eval plan

| ID | Where it runs | Known-bad input it must fail |
|---|---|---|
| R-1, R-2 | CI, `pnpm test:smoke` | A page with a 1.6:1 button and an image with no alt (existing `axe-liveness.spec.ts`) |
| R-3 | CI | An allowlist entry with `issue: ''` |
| R-4 | Human, at close-out | An entry naming a closed issue |
| R-5, R-6 | CI | A seed page linking to a missing route (existing probe in `links.spec.ts`) |
| R-7 | Human, at FSD review | A slug that has been unpublished |
| R-8 | CI run time | Not applicable, a measurement |
| R-9 | CI | A run with `st-theme` cleared, which must throw |

`pnpm validate:liveness-probes` covers script gates only. It does not cover the Playwright
liveness specs, which run on every smoke run.

## 6. Human gates this work will hit

None expected. No rendered change, so no vspec or Visual QA. No Sanity write, so no Content
Write or publish gate. Tests and a seed file are not CSS or Storybook, so Chromatic does not
apply. Fixes to the violations found are separate issues (#169 to #172) and carry their own gates.

## 7. Decomposition

| Epic slug | Requirement IDs | Order | Depends on |
|---|---|---|---|
| light-page-types | R-1, R-3, R-4, R-5, R-6, R-7 | 1 | Prototype findings on slug method |
| dark-theme-pass | R-2, R-8, R-9 | 2 | light-page-types |

## 8. Improvement loop

- After each epic, record its friction line in the close-out review.
- At close, mark each requirement Match, Drift or Gap against the shipped tests.
- Review date: 2026-12-01.

## 9. Open decisions

| ID | Decision | Options | Owner | Target |
|---|---|---|---|---|
| D-1 | Page types in scope | Decided 2026-11-02: case study, node, glossary term. Platform pages and `/about` deferred | Bex | Closed |
| D-2 | Smoke time budget | Decided 2026-11-02: the smoke step adds no more than 3 minutes | Bex | Closed |
| D-3 | Detail route method | Decided 2026-11-02: discover the first item from the archive page | Bex | Closed |

## 10. Non-goals

| Not doing | Reason | Owner |
|---|---|---|
| Platform pages and `/about` coverage | Deferred by D-1 on 2026-11-02 | None filed |
| Fixing contrast or ARIA failures that the wider scan finds | Each is its own rendered change with its own gates | #164, #169, #170, #171, #172 |
| A conformance claim from a passing scan | Automated rules catch a minority of WCAG criteria | #153 |
| Other themes (`light-shop`, `dark-shop`) | Not requested in #166 | None filed |
| A new validator or register | No named reader for its output | None |
