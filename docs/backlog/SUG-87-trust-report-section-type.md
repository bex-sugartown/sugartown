---
**Epic:** SUG-87 — Dynamic Trust Report section type
**Linear Issue:** [SUG-87](https://linear.app/sugartown/issue/SUG-87)
**Status:** Backlog
**Priority:** 🟢 High
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-87 — Dynamic Trust Report section type

Extend SUG-76's trust data work with a section-builder-insertable `trustReportSection` type. Editors select a report variant; the renderer pulls live data from `stats.json` — no editorial content fields needed beyond the report type selector.

## Background

SUG-67 built the stats pipeline (`stats.json`). SUG-76 wired it into four fixed surfaces: footer version badge, platform hero stat rail, platform trust strip, homepage ticker. Those surfaces are hardcoded to specific pages and layouts — compact cards and stat tiles.

This epic adds a fifth surface type that is architecturally different: a section-builder-insertable report block that can appear in any content type. The report renders a longer-form view of trust data — more detailed than the 5-tile strip, more structured than the compact ticker. Primary use: the `/platform` page editorial body, but available everywhere the section builder is used.

Two initial report variants:
- **`recent-releases`** — a structured release history table/list: version, date, descriptor, N recent entries (vs. Surface 4's single-entry ticker)
- **`design-system-stats`** — a detailed DS health report: token count, component count, story count, Storybook link, coverage breakdown (vs. Surface 3's 5-tile count strip)

Data is build-time dynamic from `stats.json`. The Sanity schema only needs a `reportType` select field — no authored content.

## Upstream

- **SUG-67** — stats pipeline, `apps/web/src/generated/stats.json`
- **SUG-76** — trust render surfaces (Surface 3 and 4 are the predecessors to this)

## Scope

- [ ] **Phase 0** — HTML mock: both report variants, light and dark, desktop and mobile. Gate before any schema or JSX.
- [ ] **Sanity schema** — `trustReportSection` object in `schemas/sections/`; single `reportType` select field (`recent-releases` | `design-system-stats`); register in doc types
- [ ] **GROQ projection** — add `_type == "trustReportSection" => { reportType }` to all slug queries
- [ ] **Renderer** — `TrustReportSection.jsx` in `apps/web/src/components/`; switch on `reportType`; pull from `stats.json`; two sub-renderers
- [ ] **CSS** — component CSS, token-first, both dark and light theme
- [ ] **Section builder wiring** — add to `PageSections.jsx` switch + all in-scope doc type schemas

## Phases

### Phase 0 — Mock (gate before Phase 1)
- Create `docs/drafts/SUG-87-trust-report-mock.html`
- Mock both variants: `recent-releases` and `design-system-stats`
- Show desktop and mobile layouts
- Confirm: field selection per variant, typography treatment (Garamond vs Mono), row/table vs tile layout, dark defaults
- Human approval required before any schema or JSX

### Phase 1 — Schema + GROQ
- `trustReportSection.ts` schema with `reportType` select
- Register in all doc types that support section builder
- GROQ projection added to all slug queries
- Commit: `feat(studio): trustReportSection schema (SUG-87)`

### Phase 2 — Renderer
- `TrustReportSection.jsx` + CSS module
- `RecentReleasesReport` sub-renderer (from `stats.release.latestN`)
- `DesignSystemStatsReport` sub-renderer (from `stats.ds.*`, `stats.storybook.*`, `stats.repo.*`)
- Add to `PageSections.jsx` switch
- Commit: `feat(web): TrustReportSection renderer (SUG-87)`

### Phase 3 — Wire to /platform page + QA
- Add the section to the `/platform` Sanity document
- Visual QA against mock
- Storybook stories for both variants
- Commit: `feat(web): wire trust reports to /platform (SUG-87)`

## Acceptance criteria

- [ ] `trustReportSection` schema exists, registered in `index.ts`, available in section builder for page/article/caseStudy/node
- [ ] Selecting `recent-releases` renders N most recent releases (version + date + descriptor) from `stats.release.latestN`
- [ ] Selecting `design-system-stats` renders DS health data (token count, component count, story count, epics shipped) from `stats.json`
- [ ] No editorial content fields — only the `reportType` selector in Studio
- [ ] Both variants render correctly on `/platform` page with real data
- [ ] `pnpm validate:tokens` — 0 errors
- [ ] `pnpm validate:tokens --strict-colors` — 0 errors
- [ ] Storybook stories for both variants exist and render without errors
- [ ] Phase 0 mock approved before any implementation code is written

## Technical notes

- Data source: `import stats from '../generated/stats.json'` (Vite JSON import, build-time)
- Stale field guard: `stats.perf?.stale ? null : stats.perf?.performance` — render `—` for null fields
- Section type follows existing section pattern: object schema → `PageSections` case → sub-component
- No GROQ content data needed — `reportType` is the only projected field
- Trust canonical links (from SUG-76): `TRUST_LINKS` constants in `routes.js` — reuse, do not redefine

## Related

- **[SUG-87](https://linear.app/sugartown/issue/SUG-87)** — Linear
- **SUG-67** — Dynamic trust reporting pipeline (stats.json source)
- **SUG-76** — Trust render surfaces (predecessor)
- **docs/shipped/SUG-76-trust-render-surfaces.md** — surface specs and data shape reference
