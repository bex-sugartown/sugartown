**Linear Issue:** [SUG-67](https://linear.app/sugartown/issue/SUG-67/dynamic-changelog-data-pipeline-build-time-parse-to-json)

## EPIC NAME: Dynamic trust reporting pipeline — build-time stats aggregator + PortableText variable interpolation

> **Rescope note (2026-04-19):** Originally scoped as CHANGELOG-only, then expanded to DS + Storybook + repo stats. Broadened again to include **public trust signals** — Lighthouse CI lab scores, Chrome UX Report field data, `pnpm audit`, GitHub public stats, Sanity content counts. GA4 / Search Console deferred to Phase 2 (auth infra is a separate epic).
>
> The pipeline shape does not change: one merged JSON artifact, one interpolator, one PortableText pre-processor. Only the namespace catalogue grows.

**Merge strategy:** merge-as-you-go. Each collector module ships independently once it lands. Do not accumulate multiple collectors on one branch. (See CLAUDE.md §Multi-phase epic merge cadence.)

---

## Namespaces

| Namespace | Source | Auth? | Phase |
|-----------|--------|-------|-------|
| `release` | root `CHANGELOG.md` | none | 1 |
| `ds` | `tokens.css` + component CSS dirs | none | 1 |
| `storybook` | `apps/storybook/**/*.stories.*` glob | none | 1 |
| `repo` | `git rev-list` + `docs/shipped/SUG-*.md` | none | 1 |
| `perf` | Lighthouse CI JSON artifacts | none (runs in CI) | 1 |
| `crux` | Chrome UX Report API (origin-level) | none (public API key, free tier) | 1 |
| `security` | `pnpm audit --json` summary | none | 1 |
| `github` | GitHub REST API (public repo) | none (unauth, rate-limited) or GITHUB_TOKEN if available | 1 |
| `sanity` | `@sanity/client` — count-by-type GROQ | dataset read (already configured) | 1 |
| `ga4` | Google Analytics Data API | service account | **Phase 2** |
| `gsc` | Google Search Console API | service account | **Phase 2** |

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — search all 5 layers for existing stats/version/release utilities:
  - `apps/web/src/lib/version.js` (SUG-65 build-time version + date injection — confirm shape; decide whether to extend or sit alongside)
  - `apps/web/src/components/portableTextComponents.jsx` × 2 instances + `apps/web/src/components/PageSections.jsx` (MEMORY.md §PortableText Serializer Registry — the interpolation pre-processor must be applied to all three OR centralised into a shared helper consumed by all three)
  - `scripts/` — existing Node build scripts (validators, version injectors) for the conventions this parser should match
  - `apps/web/vite.config.js` — confirm the plugin hook style used by existing generators
  - Existing Lighthouse config — `lighthouserc*` (earlier find returned empty, suggesting no config yet; this epic owns adding it)
- [ ] **Use case coverage** — consumers:
  - (a) homepage updates ticker (SUG-66)
  - (b) `/platform` trust strip — live CWV + security + GitHub stats
  - (c) `/about` — library depth numbers (Sanity content counts)
  - (d) footer version strip (possibly migrates off current source)
  - (e) any PortableText body with `{{<ns>.<path>}}` tokens
  Reader works in SSG-friendly contexts (build-time import) AND runtime contexts (client-side read of imported JSON).
- [ ] **Layout contract** — N/A (no visual output from this epic; purely data + interpolation utility). Visual consumers own their own layout.
- [ ] **All prop value enumerations** — `release.kind` enum: `MAJOR | MINOR | PATCH`. `perf.rating` enum: `good | needs-improvement | poor` (CWV thresholds).
- [ ] **Correct audit file paths**:
  - `CHANGELOG.md` (root) ✓
  - `apps/web/src/lib/version.js` — confirm exact path (SUG-65 work)
  - `apps/web/vite.config.js` — confirm path
  - `scripts/` directory conventions
- [ ] **Dark / theme modifier treatment** — N/A (data layer).
- [ ] **Studio schema changes scoped** — **Out of scope.** No Sanity schema changes.
- [ ] **Web adapter sync scoped** — N/A (no DS component).
- [ ] **Composition overlap audit** — N/A (no schema).
- [ ] **Atomic Reuse Gate**:
  1. No existing stats aggregator across the 5 layers
  2. Consumed by ≥2 callers (SUG-66 ticker + `/platform` trust strip + `/about` depth + optional footer) — passes
  3. API composable: each collector is a pure function; interpolator takes `(text, data)`; no hidden state

---

## Context

**Existing surfaces this epic touches:**
- `CHANGELOG.md` (root) — canonical ledger produced by the `/mini-release` workflow after every epic
- `apps/web/src/lib/version.js` — SUG-65 build-time version + date module
- `apps/web/vite.config.js` — where the build-time generator plugin is registered
- `apps/web/src/lib/portableTextComponents.jsx`, `apps/web/src/components/portableTextComponents.jsx`, `apps/web/src/components/PageSections.jsx` — PortableText serializer registry (MEMORY.md)
- `apps/web/src/generated/` — new directory (gitignored); build-time output lives here
- CI (GitHub Actions, if present) — Lighthouse CI runner; publishes JSON per route

**Recent epics on the same surface:**
- SUG-65 (Footer Reset) — build-time version + date injection
- SUG-66 (Homepage Updates Ticker) — Phase 0 Option A depends on this pipeline
- SUG-63 (CWV audit) — Lighthouse is already being run manually; this epic productionises the cadence and exposes the data

**Doc types in scope:** none (data layer only).

---

## Objective

Expose six+ data sources as structured, typed data the application can read at build time — producing `apps/web/src/generated/stats.json` consumed via `apps/web/src/lib/stats.js`. Add a variable-interpolation helper (`interpolateStatsVars(text, data)`) and a PortableText pre-processor so editors can write `{{perf.homepage.lcp}}` or `{{security.vulnerabilities}}` in Sanity body copy and have it render live data. After this epic, the site has a **trust reporting substrate** — CWV, security posture, release cadence, library depth all render from verifiable ledgers, not hand-typed numbers.

Data layer: **none** (no Sanity schema).
Build layer: **Vite plugin** + **scheduled CI job** (for `crux`, `github`, `perf` which need network).
Render layer: **`interpolateStatsVars` helper** + PortableText pre-processor + optional React hook `useStats()`.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ No      | No schema changes. Pages consume variables via PortableText at render time. |
| `article`   | ☐ No      | Same — render-time consumer. |
| `caseStudy` | ☐ No      | Same. |
| `node`      | ☐ No      | Same. |
| `archivePage` | ☐ No    | Same. |

This epic is a **build tooling + render utility** epic. No doc type gains or loses a field.

---

## Phase 0 — Shape + interpolation syntax decision

> No implementation until this phase is signed off.

**Phase 0 deliverables:**

1. **Parser regex locked** for CHANGELOG (existing `release` namespace work).

2. **Output shape locked.** One merged `stats.json`:
   ```json
   {
     "generatedAt": "2026-04-19T16:30:00Z",
     "release": {
       "current": { "version": "0.21.6", "date": "2026-04-19", "descriptor": "Page Sidebar", "kind": "PATCH", "linearIssue": "SUG-69" },
       "latestN": [ /* top 5 */ ],
       "count": { "total": 42, "major": 0, "minor": 12, "patch": 30 }
     },
     "ds": {
       "tokens": { "total": 377, "primitives": 7, "component": 79, "byCategory": { "color": 136, "space": 42 /* ... */ } }
     },
     "storybook": { "stories": 211, "components": 34 },
     "repo": { "commits": 487, "epicsShipped": 18 },
     "perf": {
       "generatedAt": "2026-04-19T08:00:00Z",
       "runs": {
         "homepage": { "url": "https://sugartown.io/", "lcp": 1820, "cls": 0.02, "inp": 120, "performance": 94, "accessibility": 100, "seo": 100, "rating": "good" },
         "articlesArchive": { /* ... */ },
         "platform": { /* ... */ }
       }
     },
     "crux": {
       "origin": "https://sugartown.io",
       "fetchedAt": "2026-04-19T08:00:00Z",
       "lcp": { "p75": 2100, "rating": "good" },
       "cls": { "p75": 0.04, "rating": "good" },
       "inp": { "p75": 180, "rating": "good" }
     },
     "security": {
       "fetchedAt": "2026-04-19T08:00:00Z",
       "vulnerabilities": { "total": 0, "critical": 0, "high": 0, "moderate": 0, "low": 0 }
     },
     "github": {
       "fetchedAt": "2026-04-19T08:00:00Z",
       "repo": "sugartown-dev/sugartown",
       "stars": 0, "contributors": 1, "openIssues": 0, "lastCommit": "2026-04-19T14:00:00Z"
     },
     "sanity": {
       "fetchedAt": "2026-04-19T08:00:00Z",
       "counts": { "article": 42, "node": 18, "caseStudy": 6, "page": 12, "tag": 88, "project": 14, "person": 5, "tool": 11 }
     }
   }
   ```

3. **Interpolation syntax locked.** `{{<namespace>.<path>}}` with dot-path + array index access. Unknown paths render as literal token in dev (fail-visible), stripped in prod (fail-quiet).

4. **PortableText integration pattern** — Option A (pre-process, no Sanity schema changes). Walk spans, replace tokens before `<PortableText>` renders.

5. **Fail mode** — build fails if:
   - `release` / `ds` / `storybook` / `repo` collectors fail (they have no external deps — a failure means code is broken)
   - build falls back to last-known-good JSON if `perf` / `crux` / `security` / `github` / `sanity` collectors fail (network flake should not block ship). Stale flag added to each namespace if fallback used.

6. **Data freshness model:**
   - `release` / `ds` / `storybook` / `repo` — regenerated every build (no network)
   - `perf` — regenerated by scheduled CI job (daily), committed to `apps/web/src/generated/perf.json`
   - `crux` / `github` / `security` / `sanity` — same scheduled CI job, fetched fresh, committed
   - Alt: runtime fetch for `crux` / `github` — defer decision to implementation phase; default to scheduled CI + committed JSON for SSG-compatibility

7. **Key pages for Lighthouse** — list the N pages the CI run audits. Proposed: homepage, `/articles`, `/case-studies`, `/platform`, `/about`, plus one representative detail page per type. Document in `lighthouserc.js`.

---

## Scope

### Phase 1a — foundation (merge-as-you-go; ship each collector independently)

- [ ] `scripts/collect-stats.js` — orchestrator; pure Node. Reads optional existing `stats.json`, runs each collector, merges output, writes back. Collector failures degrade to "stale" flag, don't abort.
- [ ] Collector modules (one file each, pure functions where possible):
  - [ ] `scripts/stats/changelog.js` → `release` namespace
  - [ ] `scripts/stats/design-system.js` → `ds` namespace
  - [ ] `scripts/stats/storybook.js` → `storybook` namespace
  - [ ] `scripts/stats/repo.js` → `repo` namespace
- [ ] Vite plugin registration in `apps/web/vite.config.js` (runs local collectors on `buildStart`, re-runs on file change during dev)
- [ ] `apps/web/src/generated/stats.json` — merged output. Add `apps/web/src/generated/` to `.gitignore` for locally-generated portions; commit the CI-generated portions if scheduled job writes to a separate file merged in.
- [ ] `apps/web/src/lib/stats.js` — exports `stats` (imported JSON) + helpers:
  - `getRelease()` / `getLatestReleases(n)`
  - `getDsTokenCounts()`
  - `getStorybookCounts()`
  - `interpolateStatsVars(text, data?)` — pure string transform; supports all namespaces
- [ ] PortableText pre-processor: `apps/web/src/lib/portableTextStatsVars.js` — walks `block.children[].text` and runs `interpolateStatsVars`
- [ ] Wire pre-processor into the three serializer entry points OR centralise into a shared `renderPortableText()`
- [ ] Unit tests for each collector (fixture-based) + interpolator (edge cases)
- [ ] Storybook story demonstrating variable rendering inside a PortableText block

### Phase 1b — network collectors (one commit per collector)

- [ ] `scripts/stats/perf.js` — reads Lighthouse CI output (`.lighthouseci/*.json`), normalises to `perf` namespace
- [ ] `lighthouserc.js` — Lighthouse CI config listing key pages
- [ ] CI workflow (`.github/workflows/stats.yml` or similar) — scheduled daily run; runs `lhci autorun`, `pnpm audit --json`, CrUX API fetch, GitHub API fetch, Sanity count fetch; commits updated `stats.json` back to `main` via a PR or direct commit
- [ ] `scripts/stats/crux.js` — fetches `https://chromeuxreport.googleapis.com/v1/records:queryRecord` for `https://sugartown.io` origin. No auth for public origins. Parses LCP / CLS / INP p75 + rating.
- [ ] `scripts/stats/security.js` — runs `pnpm audit --json`, extracts vulnerability counts by severity
- [ ] `scripts/stats/github.js` — fetches public repo stats via GitHub REST API. Unauthenticated (60 req/hr, enough for daily) or with `GITHUB_TOKEN` if CI provides one.
- [ ] `scripts/stats/sanity.js` — runs `count(*[_type == $type])` per doc type via `@sanity/client`. Requires existing client config.

### Phase 1c — polish

- [ ] Documentation: `docs/conventions/stats-pipeline.md` — supported namespaces + token syntax + how to add a new collector
- [ ] Dev UX: console warning on unknown tokens during dev builds
- [ ] Fallback rendering: namespace-level `stale: true` flag surfaced to PortableText serializer (editors can see when a number is from yesterday's CI run vs. fresh)

### Phase 2 — auth-required collectors (separate epic spawn if prioritised)

- [ ] `ga4` namespace — Google Analytics Data API, service account
- [ ] `gsc` namespace — Search Console API, service account
- [ ] Secrets management for service account keys (Netlify env / GH Actions secrets)
- [ ] Rate-limit / quota handling

Phase 2 is explicitly split because auth infrastructure is a separate concern and would double the scope of Phase 1.

---

## Query Layer Checklist

N/A for most namespaces. `sanity` namespace uses a single `count(*[_type == $type])` GROQ query per doc type. No new query file needed — inline in `scripts/stats/sanity.js`.

---

## Technical Constraints

- **Build-time + scheduled CI, not request-time.** No runtime network calls from the client. All data is baked into the JSON artifact.
- **Pure functions where possible.** Collectors that don't need network are pure; collectors with network (perf / crux / github / sanity / security) are thin wrappers over external APIs with normalised output.
- **Fail modes are explicit.** Local collectors fail the build. Network collectors degrade to stale data with a flag.
- **Serializer parity.** Pre-processor must apply to all three serializer entry points or be centralised.
- **Fail-visible in dev, explicit in prod.** Unknown tokens render literally during authoring.
- **CHANGELOG.md format is the contract.** If the parser requires stricter CHANGELOG format, update `docs/release-assistant-prompt.md` in the same commit.
- **No secrets in committed JSON.** `stats.json` is public (shipped to client). Only aggregate counts and non-PII.
- **CrUX origin must exist in the dataset.** CrUX only returns data for origins with sufficient traffic. If `sugartown.io` doesn't yet qualify, the collector logs a "no data" flag and the `crux` namespace renders as stale/unavailable. Document this explicitly.

---

## Acceptance Criteria

1. `pnpm build` from `apps/web/` produces `apps/web/src/generated/stats.json` with `release`, `ds`, `storybook`, `repo` namespaces populated.
2. Scheduled CI run (daily) populates `perf`, `crux`, `security`, `github`, `sanity` namespaces and commits the updated JSON.
3. Editing `CHANGELOG.md` during `pnpm dev` triggers re-parse and HMR update within one reload.
4. A PortableText block containing `{{perf.homepage.lcp}}ms LCP · {{crux.cls.p75}} CLS · {{security.vulnerabilities.total}} CVEs · {{release.current.version}}` renders live values on every page type.
5. Unknown token (`{{nonsense.path}}`) renders as literal in dev, strips in prod.
6. Missing or unparseable `CHANGELOG.md` fails the build with a pointer to the offending line.
7. Network collector failure degrades gracefully to stale data with a flag; does not fail the build.
8. Unit tests cover each collector + interpolator edge cases.
9. `/platform` has a live trust strip rendering CWV + security + GitHub stats (render epic may be separate — SUG-67 only requires the data exists and one proof-of-life PortableText consumer).
10. At least one commit referencing SUG-67 on `origin/main` before Linear → Done (CLAUDE.md §Linear Done = code on main).

---

## Non-Goals

- Sanity `release` doc type (deferred)
- Runtime / live GitHub API fetch from the client
- GA4 / Search Console (Phase 2, separate epic)
- `/changelog` aggregator page (SUG-66 or follow-up owns render)
- Rewriting `/mini-release` workflow
- Publishing release notes to external channels (RSS, email, webhooks)
- Bundle size / test coverage reporting (internal dev metrics, not public trust signals)
- Uptime monitoring (Netlify already provides)

---

## Rollback Plan

1. Revert the Vite plugin registration in `apps/web/vite.config.js`
2. Remove PortableText pre-processor wiring from serializer entry points
3. Delete `apps/web/src/generated/` (gitignored portions)
4. Disable the scheduled CI workflow
5. Revert committed portions of `stats.json` if applicable

No schema migration. No data migration. Consumer surfaces (`/platform` trust strip, homepage ticker) are in separate epics and can be reverted independently.

---

## Definition of Done

- All acceptance criteria pass
- Unit tests green, Storybook story published
- `pnpm validate:tokens` and `pnpm validate:urls` unaffected
- At least one PortableText block on a real Sanity document demonstrates a live variable rendering correctly in preview — ideally the `/platform` trust strip with at least one value per namespace
- Scheduled CI workflow has run at least once successfully end-to-end
- Epic doc moved from `docs/backlog/` to `docs/shipped/` and Linear SUG-67 transitioned to Done
