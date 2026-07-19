# Sugartown — Claude Code Epic Prompt

**Linear Issue:** [SUG-100](https://linear.app/sugartown/issue/SUG-100/cwv-snapshot-product-widget)

## EPIC NAME: CWV Snapshot Widget on /product

A live Core Web Vitals + Lighthouse snapshot block on `/product` (and any other `page` doc that opts in via section builder), with a mobile/desktop toggle and animated score-ring visuals. Data sources are the existing build-time stats pipeline (`crux.js` for field data, `perf.js` for lab data) — no new fetch surface.

**Architecture update (Phase 0 review, 2026-05-05):** The section is now a **trust dashboard** — `reportType` (radio, single-select) is replaced by `reports` (array, multi-select checkbox). Editors choose 1–3 report blocks. Each selected block renders with its own `SectionLabel` (name = report type label, kicker = data-freshness timestamp). One optional `heading` field remains for the whole section. The existing `TrustReportSection` renderer loops over `reports[]` and delegates each to its sub-component.

---

## Model & Mode [REQUIRED]

`opusplan` — Opus plans through Pre-Execution Gate + Files to Modify, Sonnet executes.

---

## Pre-Execution Completeness Gate [REQUIRED]

- [ ] **Interaction surface audit** — segmented mobile/desktop toggle: search `apps/web/src/design-system/` and `apps/web/src/components/` for existing tab, segmented-control, or radio-group components. List what exists. Extend if 80%+ fit; only fork with justification.
- [ ] **Use case coverage** — the toggle is consumed by this widget initially but the segmented control should be reusable (Storybook story + DS package mirror). Enumerate consumers: this widget, future filter UIs (project status, archive form-factor filters).
- [ ] **Layout contract** — the widget is a section inside `RootPage`'s `detailContext` flex container. Direct child of `.detailContext` → `width: 100%`, zero `margin-block`, zero `padding-block` (parent owns gap per CLAUDE.md §Section Layout Contract). Internal grid: 4 score-rings on a single row at desktop ≥768px, 2×2 grid below; under the rings, 3 CWV tiles (LCP / CLS / INP) in a single row at desktop, stacked at mobile. Toggle (segmented control) sits above the rings, right-aligned. Dimensional contract: ring 96px diameter, gap 24px, tile min-width 200px.
- [ ] **All prop value enumerations** — `reports` array on `trustReportSection` (replaces `reportType`): `recent-releases`, `design-system-stats`, `cwv-snapshot` (NEW). `defaultFormFactor`: `mobile`, `desktop`. Each block renders in array order with a `SectionLabel` above it. Copy verbatim from schema in implementation.
- [ ] **Correct audit file paths** — verified during planning (see Files to Modify).
- [ ] **Dark / theme modifier treatment** — score rings use `--st-status-good-fg|bg`, `--st-status-warn-*`, `--st-status-poor-*` token sets. Light + pink-moon inherit via existing override blocks. CWV ratings (good / needs-improvement / poor) reuse existing status token cascade — no new primitives unless the audit shows a gap.
- [ ] **Studio schema changes scoped** — yes, in scope. `feat(studio): extend trustReportSection with cwv-snapshot variant` is its own commit before component work begins.
- [ ] **Web adapter sync scoped** — `ScoreRing` and `SegmentedControl` are new DS components. Both get DS package source + web adapter in the same epic, in scope under Files to Modify.
- [ ] **Composition overlap audit** — N/A. No sub-object additions to existing schemas; only a new enum value and two new top-level fields on `trustReportSection`.
- [ ] **Atomic Reuse Gate** —
  1. ScoreRing: no equivalent across the 5 layers (no circular-progress, no SVG-arc-based stat). Build new in DS.
  2. SegmentedControl: confirm during audit. If a `Tabs` component exists with comparable semantics, extend it.
  3. CwvSnapshot container: single-use to start (lives in `components/`), but built so the toggle + ring grid is exposed for future reuse on a dedicated `/trust` or `/perf` page.

---

## Context [REQUIRED]

The `/product` route resolves through `App.jsx`'s catch-all `/:slug` → `RootPage.jsx` → Sanity `page` doc fetched via `pageBySlugQuery`. The `page` schema (`apps/studio/schemas/documents/page.ts`) already registers `trustReportSection` in `sections[]` and `pageBySlugQuery` already projects it.

The existing trust pipeline:
- `apps/web/scripts/stats/crux.js` fetches origin-level Chrome UX Report p75 metrics (LCP / CLS / INP) once per build and writes to `stats.cwv.*`. Currently single-form-factor (origin-level, no `formFactor` filter — returns blended data).
- `apps/web/scripts/stats/perf.js` reads `.lighthouseci/` JSON output and writes per-URL Lighthouse scores (performance / accessibility / best-practices / seo + CWV) to `stats.perf.runs.*`. Currently keyed only by URL — no mobile/desktop split.
- `TrustReportSection.jsx` already renders two variants (`recent-releases`, `design-system-stats`) from `stats.json`. The new variant slots in alongside.

Recent epics on the same surface: SUG-67 (stats pipeline), SUG-87 (TrustReportSection initial two variants). Neither delivered form-factor split.

---

## Objective [REQUIRED]

After this epic, the `/product` page (and any other page doc) can include a **CWV Snapshot** block via the section builder. The block displays four animated Lighthouse score rings (Performance / Accessibility / Best Practices / SEO) and three CWV tiles (LCP / CLS / INP) for the current production build. A segmented toggle above the rings flips between **Mobile** and **Desktop** form-factor data. Data is baked at build time from extended `crux.js` and `perf.js` collectors plus a Lighthouse CI config that runs both mobile and desktop presets. No runtime API calls.

---

## Doc Type Coverage Audit [REQUIRED]

| Doc Type    | In scope?   | Reason if excluded |
|-------------|-------------|--------------------|
| `page`      | ☑ Yes       | Primary target — `/product` is a page doc |
| `article`   | ☑ Yes       | `trustReportSection` is already wired into `article.sections[]`; new variant inherits automatically |
| `caseStudy` | ☑ Yes       | Same — already wired |
| `node`      | ☑ Yes       | Same — already wired |
| `archivePage` | ☐ No      | Archive pages don't render `sections[]` (architectural exclusion) |

---

## Schema Field Proposal [REQUIRED]

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `reports` (array of strings, replaces `reportType`) | Multi-select checkbox — editor picks 1–3 report blocks to display in this section | `["cwv-snapshot", "recent-releases"]` | Editors compose a bespoke trust dashboard rather than being locked to one report per section. Display order follows array order. Replaces the single-select `reportType` radio — all existing docs with `reportType` set need a migration that maps the old value into `reports: [oldValue]`. |
| `defaultFormFactor` (string, new) | Initial state of the mobile/desktop toggle when the page loads | `mobile` (options: `mobile`, `desktop`) | Different audiences land on different pages. Marketing might prefer mobile (real-user dominant), product page for technical buyers might prefer desktop. Hidden when `cwv-snapshot` is not in `reports`. |
| `cwvUrl` (string, new, optional) | Specific URL to query CrUX for instead of origin-level data; falls back to origin if URL has insufficient traffic | `https://sugartown.io/product` | URL-level CrUX is more honest for a product page widget than origin-blend. Optional because most pages won't have URL-level data. Hidden when `cwv-snapshot` is not in `reports`. |

---

## Scope [REQUIRED]

- [x] **Phase 0** — HTML mock at `docs/drafts/SUG-100-cwv-snapshot-mock.html` showing both toggle states, ring states (good / needs-improvement / poor), mobile breakpoint, light/dark themes, and dashboard multi-report layout. **Approved 2026-05-05.**
- [ ] Studio schema change — replace `reportType` (radio) with `reports` (array checkbox); add `defaultFormFactor` + `cwvUrl` fields; keep `reportType` hidden for migration; own commit `feat(studio):`
- [ ] Schema deploy via `npx sanity schema deploy` from `apps/studio/`
- [ ] Lighthouse CI config — add desktop preset alongside existing mobile preset; both run inside the existing daily cron (`.github/workflows/stats.yml` at 06:00 UTC). No new workflow trigger and no change to Netlify build cadence — the daily stats commit gate (`git diff --cached --quiet`) already caps deploys at one per day.
- [ ] `apps/web/scripts/stats/crux.js` — extend to fetch `formFactor: PHONE` and `formFactor: DESKTOP` separately; preserve origin-blend as fallback
- [ ] `apps/web/scripts/stats/perf.js` — accommodate per-form-factor LHCI runs; output shape `runs[key].mobile` / `runs[key].desktop`
- [ ] DS component: `ScoreRing` (SVG-arc circular progress, animated count-up + arc fill on enter-viewport)
- [ ] DS component: `SegmentedControl` (or extend an existing tab/segmented primitive if found in audit)
- [ ] Web adapter sync for both DS components
- [ ] Frontend renderer — new `CwvSnapshot.jsx` sub-component invoked from `TrustReportSection.jsx` switch
- [ ] CSS / styles — module file with grid + responsive breakpoints + animation keyframes (respect `prefers-reduced-motion`)
- [ ] Token additions if needed (CWV rating tokens — audit first; reuse `--st-status-*` if available)
- [ ] Storybook stories for `ScoreRing`, `SegmentedControl`, `CwvSnapshot` (default + each rating state + reduced-motion + missing-data)
- [ ] `pageBySlugQuery` + 3 sibling slug queries — verify the existing `trustReportSection` projection captures `defaultFormFactor` and `cwvUrl` (likely needs explicit add)

---

## Query Layer Checklist [REQUIRED]

- [ ] `pageBySlugQuery` — extend existing `_type == "trustReportSection"` projection to include `defaultFormFactor`, `cwvUrl`
- [ ] `articleBySlugQuery` — same
- [ ] `caseStudyBySlugQuery` — same
- [ ] `nodeBySlugQuery` — same
- [ ] Archive queries — N/A: trust report only renders inside detail section builders, not on cards

---

## Schema Enum Audit [REQUIRED]

| Field name | Schema file | `value` → Display title (copy from `options.list`) |
|-----------|-------------|-----------------------------------------------------|
| `reports` (array) | `trustReportSection.ts` | `recent-releases → Recent releases — release history table`, `design-system-stats → Design system stats — token + component health`, `cwv-snapshot → CWV snapshot — Lighthouse + Chrome UX Report` |
| `defaultFormFactor` | `trustReportSection.ts` | `mobile → Mobile (default)`, `desktop → Desktop` |

**Migration note:** existing docs with `reportType` set must be migrated to `reports: [reportType]`. This is a one-time GROQ-based migration script. The old `reportType` field stays in schema (marked `hidden: () => true`) until migration is confirmed complete, then removed in a follow-up commit.

No badge-rendering component is introduced.

---

## Metadata Field Inventory [REQUIRED]

N/A — this epic does not touch MetadataCard or any structured metadata surface.

---

## Themed Colour Variant Audit [REQUIRED]

**Audit result (Phase 0):** Existing `--st-status-*` tokens do not cover arc/track surfaces — they cover bg/fg/border for status chips only. New CWV-specific arc tokens are required. Color palette: seafoam (good), amber (needs-improvement), maroon (poor). These map cleanly to the existing brand palette and carry semantic weight in both light and dark contexts.

| Surface | Token | Dark default (tokens.css) | Light override (theme.light.css) | Notes |
|---------|-------|--------------------------|----------------------------------|-------|
| Good arc | `--st-cwv-good-arc` | `var(--st-color-seafoam-500)` | same | #2BD4AA, high contrast on both |
| Good track | `--st-cwv-good-track` | `rgba(43,212,170,0.18)` | `rgba(43,212,170,0.15)` | muted background ring |
| Good fg (score text) | `--st-cwv-good-fg` | `var(--st-color-seafoam-400)` | `var(--st-color-seafoam-700)` | lighter on dark, darker on light |
| Warn arc | `--st-cwv-warn-arc` | `var(--st-color-amber-500)` | `var(--st-color-amber-600)` | #FBBA24 dark / #d97706 light |
| Warn track | `--st-cwv-warn-track` | `rgba(251,186,36,0.18)` | `rgba(251,186,36,0.15)` | |
| Warn fg | `--st-cwv-warn-fg` | `var(--st-color-amber-400)` | `var(--st-color-amber-700)` | |
| Poor arc | `--st-cwv-poor-arc` | `var(--st-color-maroon-400)` | `var(--st-color-maroon-600)` | #e75596 dark / #b91c68 light |
| Poor track | `--st-cwv-poor-track` | `rgba(231,85,150,0.18)` | `rgba(185,28,104,0.15)` | |
| Poor fg | `--st-cwv-poor-fg` | `var(--st-color-maroon-300)` | `var(--st-color-maroon-700)` | |
| Segmented bg | `--st-segmented-bg` | `var(--st-color-midnight-700)` | `var(--st-color-softgrey-100)` | |
| Segmented active bg | `--st-segmented-active-bg` | `var(--st-color-midnight-800)` | `var(--st-color-white)` | |
| Segmented fg | `--st-segmented-fg` | `var(--st-color-text-muted)` | `var(--st-color-text-secondary)` | |
| Segmented active fg | `--st-segmented-active-fg` | `var(--st-color-text-default)` | `var(--st-color-text-primary)` | |
| Segmented border | `--st-segmented-border` | `var(--st-color-border-subtle)` | `var(--st-color-border-default)` | |

All tokens added to `tokens.css` (dark defaults) + `theme.light.css` (light overrides) in their own commit before component CSS is written. `pnpm validate:tokens --strict-colors` must pass clean before component commit.

---

## Non-Goals [REQUIRED]

- Runtime PageSpeed Insights API calls. Build-time only.
- Per-route detail-page Lighthouse scores. The widget shows aggregate site or single-URL data, not "this very page".
- Historical trend chart (sparkline of last N builds). Future epic.
- The Netlify Lighthouse plugin as a data source. Investigated; redundant with existing Lighthouse CI pipeline. May still be added later as a deploy gate, but not a data source for this widget.
- Tablet form factor. Mobile and desktop only — CrUX `TABLET` data is rare and adds UI noise.
- Auto-refresh / polling. Refresh cadence is the build cadence.

---

## Technical Constraints [REQUIRED]

**Monorepo / tooling**
- `apps/web/scripts/stats/` runs as part of the Vite buildStart plugin; output baked into `src/generated/stats.json`
- LHCI config lives under `apps/web/` (verify path during planning); adding desktop preset means a second config object or a multi-config run, both invoked from the single `lhci autorun` step in `.github/workflows/stats.yml`

**Schema (Studio)**
- All three fields (`reportType` option, `defaultFormFactor`, `cwvUrl`) are explicit `string` type
- `defaultFormFactor` uses `options.list` with `layout: 'radio'` (matches existing `reportType` pattern)
- `cwvUrl` uses `validation: (Rule) => Rule.uri({ allowRelative: false, scheme: ['https'] }).optional()`
- `cwvUrl` and `defaultFormFactor` are conditionally hidden when `reportType !== 'cwv-snapshot'` via `hidden: ({ parent }) => parent?.reportType !== 'cwv-snapshot'`

**Query (GROQ)**
- Extend existing trustReportSection projection in all four slug queries — do not add a new projection block

**Render (Frontend)**
- `TrustReportSection.jsx` adds a `case 'cwv-snapshot'` branch that delegates to a new `CwvSnapshot` sub-component
- `CwvSnapshot` reads `stats.perf.runs[key].{mobile,desktop}` and `stats.cwv.{mobile,desktop}` based on the toggle's active state
- Toggle state is local React state, initialised from `defaultFormFactor`
- `prefers-reduced-motion: reduce` disables the count-up + arc-fill animation; falls back to instant render
- Missing data states: if `stats.cwv.mobile` is unavailable, the mobile toggle is rendered as disabled with a tooltip ("Insufficient field data — try again after more traffic"); if `stats.perf.runs[key].mobile` is unavailable, the rings render as a `—` placeholder

**DS Component Color Authoring**
- All ring colours through tokens. If new tokens needed, add to `tokens.css` in a prior commit.
- `pnpm validate:tokens --strict-colors` clean before every commit on component CSS

**Design System → Web Adapter Sync**
- `ScoreRing` and `SegmentedControl` (if new) ship as DS package source + web adapter (JSX + CSS module copy + index export) in the same epic

---

## Migration Script Constraints [REQUIRED]

One migration required: map `reportType` → `reports` for all existing `trustReportSection` documents.

```groq
// Find all affected documents
*[references(*[_type in ["page","article","caseStudy","node"] && defined(sections)]._id)]
```

More precisely, the migration patches every doc whose `sections[]` contains an object with `_type == "trustReportSection" && defined(reportType)`. The patch:
```json
{ "reports": ["<existing reportType value>"], "reportType": null }
```

This is a non-destructive migration — `reportType` is nulled rather than deleted, and the field stays hidden in Studio until we confirm clean. Run via Sanity client migration script before schema deploy.

---

## Files to Modify [REQUIRED]

**Studio**
- `apps/studio/schemas/sections/trustReportSection.ts` — UPDATE: replace `reportType` (string radio) with `reports` (array of strings, checkbox multi-select); keep old `reportType` as `hidden: () => true` for migration safety; add `defaultFormFactor` and `cwvUrl` fields with `hidden: ({ parent }) => !parent?.reports?.includes('cwv-snapshot')`; update `preview.prepare` label map to join `reports[]` labels
- `apps/studio/schemas/sections/trustReportSection.ts` — MIGRATION: one-time script mapping `reportType → reports: [reportType]` for all existing docs

**Build-time pipeline**
- `apps/web/scripts/stats/crux.js` — UPDATE: fetch per-form-factor (PHONE + DESKTOP) and emit `mobile`/`desktop` keys; preserve current origin-blend output for backward compat or migrate consumers
- `apps/web/scripts/stats/perf.js` — UPDATE: handle per-form-factor LHCI output (likely via separate output dirs `.lighthouseci-mobile/` and `.lighthouseci-desktop/`, or by reading the form-factor from each result's config)
- LHCI config (verify path: `apps/web/lighthouserc.cjs` or similar) — UPDATE: add desktop preset run

**Design System**
- `packages/design-system/src/components/score-ring/ScoreRing.tsx` — CREATE
- `packages/design-system/src/components/score-ring/ScoreRing.module.css` — CREATE
- `packages/design-system/src/components/score-ring/ScoreRing.stories.tsx` — CREATE
- `packages/design-system/src/components/segmented-control/SegmentedControl.tsx` — CREATE (or extend existing — confirm in audit)
- `packages/design-system/src/components/segmented-control/SegmentedControl.module.css` — CREATE
- `packages/design-system/src/components/segmented-control/SegmentedControl.stories.tsx` — CREATE
- `packages/design-system/src/index.ts` — add exports
- `packages/design-system/src/styles/tokens.css` — UPDATE if new CWV/segmented tokens needed
- `apps/web/src/design-system/components/score-ring/ScoreRing.jsx` — CREATE (web adapter)
- `apps/web/src/design-system/components/score-ring/ScoreRing.module.css` — COPY from DS
- `apps/web/src/design-system/components/segmented-control/SegmentedControl.jsx` — CREATE (web adapter)
- `apps/web/src/design-system/components/segmented-control/SegmentedControl.module.css` — COPY from DS
- `apps/web/src/design-system/index.js` — add exports
- `apps/web/src/design-system/styles/tokens.css` — keep in sync with DS package

**Frontend**
- `apps/web/src/lib/queries.js` — UPDATE: extend trustReportSection projection in `pageBySlugQuery`, `articleBySlugQuery`, `caseStudyBySlugQuery`, `nodeBySlugQuery`
- `apps/web/src/components/TrustReportSection.jsx` — REFACTOR: replace single `reportType` switch with `reports[]` loop; each item renders: `SectionLabel` (name = report label, kicker = data-freshness timestamp) + report sub-component; add `cwv-snapshot` branch
- `apps/web/src/components/CwvSnapshot.jsx` — CREATE
- `apps/web/src/components/CwvSnapshot.module.css` — CREATE

**Mock**
- `docs/drafts/SUG-100-cwv-snapshot-mock.html` — CREATE (Phase 0)

---

## Deliverables [REQUIRED]

1. `trustReportSection` accepts `cwv-snapshot` as a `reportType` and exposes `defaultFormFactor` + `cwvUrl` fields conditionally
2. Schema deployed (`npx sanity schema deploy`) so MCP/Content Lake validation passes
3. `stats.json` contains `cwv.mobile.*`, `cwv.desktop.*`, `perf.runs.product.mobile`, `perf.runs.product.desktop` after a build
4. `ScoreRing` and `SegmentedControl` exist in DS + web adapter, with Storybook stories covering all states
5. `CwvSnapshot.jsx` renders four rings + three tiles + working toggle on `/product` after a real build
6. All four slug queries project the new `defaultFormFactor` and `cwvUrl` fields
7. HTML mock approved by human at Phase 0

---

## Acceptance Criteria [REQUIRED]

- [ ] `tsc --noEmit` in `apps/studio` reports zero new errors
- [ ] Studio hot-reloads; "CWV snapshot — Lighthouse + Chrome UX Report" appears as a `reportType` option on every doc type that has `trustReportSection`
- [ ] `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` both clean (zero violations)
- [ ] Storybook stories render without console errors for ScoreRing (good / needs-improvement / poor / missing), SegmentedControl (default / hover / disabled), CwvSnapshot (mobile / desktop / partial-data)
- [ ] Chromatic VRT clean or human-approved diffs
- [ ] After a production build with both LHCI presets, `stats.json` contains valid mobile + desktop entries; `CwvSnapshot` on `/product` displays them
- [ ] Toggling between Mobile and Desktop swaps all four ring values and all three CWV tiles in under 200ms with no layout shift
- [ ] `prefers-reduced-motion: reduce` disables the count-up + arc-fill animation (verified via DevTools emulation)
- [ ] Disabled-toggle state shows when a form factor has no data; hover tooltip explains why
- [ ] Visual QA approved (mock-to-implementation comparison table, see Visual QA Gate)
- [ ] Mobile breakpoint (<768px) renders rings as 2×2 and tiles stacked, no overflow, no horizontal scroll

---

## Visual QA Gate [REQUIRED]

Evidence the agent prepares:

1. Storybook stories for ScoreRing, SegmentedControl, CwvSnapshot — covering default, all rating states, reduced-motion, missing-data, mobile breakpoint
2. Mock-to-implementation comparison table covering: ring diameter, arc thickness, color per rating, count-up animation duration, tile spacing, toggle visual state, reduced-motion fallback
3. Token compliance: grep both new CSS modules for hex / rgba / hsla — report 0 or list violations
4. Cross-surface spot check: `/product` (page doc), and at least one other doc type that has the section enabled (article or case study) — confirm the widget renders identically

Human approves with "Visual QA approved" before close-out.

---

## Risks / Edge Cases [REQUIRED]

**Schema**
- [ ] No field-name collision (new fields are namespaced inside `trustReportSection`)
- [ ] No new cross-doc references introduced

**Query**
- [ ] All four slug queries updated — verified by Query Layer Checklist
- [ ] Archive queries intentionally excluded (no card surface for trust reports)

**Build pipeline**
- [ ] CrUX URL-level lookup may 404 for low-traffic pages — graceful fallback to origin-level
- [ ] CrUX form-factor data may be `available: false` for one factor and not the other — UI must tolerate partial availability
- [ ] Lighthouse CI desktop preset extends the existing daily cron in `.github/workflows/stats.yml` (06:00 UTC). LHCI does NOT run on PR or every main-branch build — it runs only in this scheduled workflow, which then commits `stats.json` to main and triggers at most one Netlify build per day (already gated by `git diff --cached --quiet`). Adding the desktop preset increases GitHub Actions runtime inside the daily job but does not increase Netlify build count.

**Render**
- [ ] If `stats.json` lacks `cwv` or `perf` namespace entirely (collector failure), the section renders a graceful empty state — not a blank space and not a crash
- [ ] `prefers-reduced-motion` honoured
- [ ] Animation does not cause CLS (rings sized at final dimensions before arc fills)
- [ ] Toggle keyboard accessibility: arrow keys move between options, Space/Enter activates, focus ring visible

**Atomic Reuse**
- [ ] SegmentedControl audit: a forked tab component would be a process failure — must be confirmed atomic before build

---

## Real CWV Data Pipeline [CURRENT STATE: MOCK DATA]

`apps/web/src/generated/stats.json` is gitignored locally and seeded with mock data. The widget renders correctly against this mock; no real field data flows until the CI pipeline is wired.

### What's needed

**1. CrUX API key**
- Secret name: `CRUX_API_KEY`
- Add to GitHub repo secrets (Settings → Secrets → Actions)
- The key is a Google Cloud API key with Chrome UX Report API enabled
- `apps/web/scripts/crux.js` reads `process.env.CRUX_API_KEY`; without it, all CrUX fetches return null and the CWV tiles show no field data

**2. LHCI token — not required**
- `lighthouserc.js` uses `upload.target: 'filesystem'` — results write to `.lighthouseci/` and `perf.js` reads them directly. No LHCI server, no token.
- `lighthouserc.js` runs two collect presets: `emulatedFormFactor: 'mobile'` and `emulatedFormFactor: 'desktop'`, 3 runs each.

**3. GitHub Actions workflow: `.github/workflows/stats.yml`** (to be created)

```yaml
name: CWV Stats
on:
  schedule:
    - cron: '0 6 * * *'   # 06:00 UTC daily
  workflow_dispatch:

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - name: Run CrUX collector
        env:
          CRUX_API_KEY: ${{ secrets.CRUX_API_KEY }}
        run: node apps/web/scripts/crux.js
      - name: Run LHCI (mobile + desktop)
        run: |
          npx lhci autorun --config=apps/web/lighthouserc.js
      - name: Merge and write stats.json
        run: node apps/web/scripts/perf.js
      - name: Commit stats.json if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -f apps/web/src/generated/stats.json
          git diff --cached --quiet || git commit -m "chore(stats): daily CWV snapshot [skip ci]"
          git push
```

**4. Site reachable at production URL**
- LHCI audits `https://sugartown.io` (or the Netlify preview URL)
- CrUX fetches origin-level data for `https://sugartown.io` — requires real traffic (CrUX data lags ~28 days)
- Until sufficient traffic exists, CrUX tiles will render the "field data unavailable" state

### Expected `stats.json` shape after pipeline runs

```json
{
  "perf": {
    "generatedAt": "2026-05-07T06:12:00.000Z",
    "runs": {
      "https://sugartown.io/": {
        "mobile": { "performance": 91, "accessibility": 97, "bestPractices": 95, "seo": 100, "lcp": 1900, "cls": 0.02, "inp": 120 },
        "desktop": { "performance": 97, "accessibility": 97, "bestPractices": 95, "seo": 100, "lcp": 900, "cls": 0.01, "inp": 60 }
      }
    }
  },
  "crux": {
    "fetchedAt": "2026-05-07T06:08:00.000Z",
    "origin": "https://sugartown.io",
    "mobile": { "lcp": { "p75": 2100, "rating": "good" }, "cls": { "p75": 0.05, "rating": "good" }, "inp": { "p75": 180, "rating": "good" } },
    "desktop": { "lcp": { "p75": 1100, "rating": "good" }, "cls": { "p75": 0.02, "rating": "good" }, "inp": { "p75": 80, "rating": "good" } }
  }
}
```

### Current state summary

| Item | Status |
|------|--------|
| `stats.json` | Mock data (Variant C — mixed ratings) |
| CrUX API key | Configured (`CRUX_API_KEY` in GitHub secrets) |
| GitHub Actions workflow | Not created |
| LHCI mobile preset | Configured in `lighthouserc.js` |
| LHCI desktop preset | Configured in `lighthouserc.js` |
| CwvSnapshot component | Reads from `stats.json` correctly; form-factor toggle works |

<!-- Chromatic: pending -->

---

## Post-Epic Close-Out [REQUIRED]

1. Move `docs/backlog/SUG-100-cwv-snapshot-product-widget.md` → `docs/shipped/SUG-100-cwv-snapshot-product-widget.md`
2. Confirm clean tree (`git status`)
3. `/mini-release SUG-100 CWV Snapshot Widget` — patch bump unless ScoreRing + SegmentedControl warrant a MINOR (likely MINOR — new public DS surface). Use `/release` if so.
4. Transition Linear SUG-100 to **Done** after merge to `origin/main`
5. Start next epic

---

## Close-Out Record

**Closed:** 2026-05-08  
**Version:** v0.23.17

### What shipped

- `CwvSnapshot.jsx` + `CwvSnapshot.module.css` — CWV tile widget with mobile/desktop `SegmentedControl` toggle, `ScoreRing` SVG arcs, LCP/CLS/INP tiles, status-token color system
- `ScoreRing` DS primitive (`packages/design-system` + `apps/web` adapter)
- `SegmentedControl` DS primitive (same)
- `trustReportSection` schema extended with `cwv-snapshot` report type
- `stats.json` pipeline extended: `crux.js` per-form-factor split, `perf.js` mobile+desktop preset support, `lighthouserc.cjs` dual-preset config
- `PERF_BACKUP` + `CRUX_BACKUP` static fallback constants in `CwvSnapshot.jsx`
- `apps/web/scripts/update-perf-backup.js` + `pnpm update:backup` script — patches backup constants from local LHCI run
- `/update-cwv` Claude Code skill — runs LHCI, updates backup, shows diff, offers commit

### Pipeline gap at close-out

All gaps resolved by SUG-106 (2026-05-10):

- **CrUX:** Waiting on ~1,000 Chrome user visits over 28 days. Collector is working. No action needed.
- **LHCI in CI:** Fixed. Root cause: `lhci autorun` with array `collect` config triggered `staticDistDir` auto-detection in @lhci/cli v0.15.1. Fix: flat `collect` object + explicit `lhci collect` calls per form factor.
- **Sanity secrets in CI:** Fixed. `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`, `VITE_SANITY_API_VERSION`, `VITE_SANITY_TOKEN` added to GitHub Actions repo secrets (2026-05-10).
- **Mobile scores:** bestPractices 42 in backup was from a run with Sanity preview console warnings. Live CI (2026-05-10) shows bestPractices 96. LCP 6548ms is real and structural: SPA render is gated behind JS bundle parse + Sanity API call. Requires SSR/SSG to fix (separate epic).

### Known remaining limitations

- **Desktop LHCI:** `--settings.emulatedFormFactor=desktop` CLI override does not propagate to LHCI result `configSettings`. Desktop results mirror mobile in the widget until fixed.
- **INP in CI:** headless Lighthouse cannot measure INP — `inp: null` in CI results.
- **CLS in CI:** headless Chrome skips Google Fonts, so CI CLS (0.001) understates real-browser CLS (~0.24 from font swap). CrUX field data will be authoritative once traffic threshold is met.

### Chromatic

<!-- Chromatic: pending — no visual changes in SUG-106 -->

### Follow-on

- **LCP improvement:** SPA-gated ~6.5s mobile LCP requires SSR or build-time data prefetch. Separate epic.
- **Desktop LHCI:** per-form-factor CI results need direct Lighthouse CLI replacing LHCI collect. Separate backlog item.
