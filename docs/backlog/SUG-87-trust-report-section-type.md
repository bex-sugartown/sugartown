---
**Epic:** SUG-87 — Dynamic Trust Report section type + data display primitives
**Linear Issue:** [SUG-87](https://linear.app/sugartown/issue/SUG-87)
**Status:** Backlog
**Priority:** 🟢 High
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-87 — Dynamic Trust Report section type + data display primitives

Extend SUG-76's trust data work with a section-builder-insertable `trustReportSection` type — and ship the `StatTile` and `DataTable` DS primitives that power it. SUG-19 (KPI Dashboard Cards) uses these same primitives when it activates; this epic is their first production caller.

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

## Primitives scope

This epic ships two DS-layer primitives that are consumed by `trustReportSection` and reused by SUG-19:

### `StatTile`
Location: `apps/web/src/design-system/components/StatTile/`

A standalone labeled metric tile — no Card containment. Used as the interior of KPI cards in SUG-19 and directly in grids in SUG-87.

```
Props:
├── label (string)           — metric name ("Design tokens", "Epics shipped")
├── value (string | number)  — headline figure ("606", "75")
├── unit? (string)           — suffix ("tokens", "%")
├── bar? ({                  — optional horizontal breakdown bar
│     segments: Array<{ value: number, label: string, color?: string }>
│     total: number
│   })
├── legend? (boolean)        — show segment legend below bar (default false)
├── size? ('sm' | 'md')      — tile size (md = full grid cell, sm = compact)
└── className? (string)
```

Visual anatomy:
- Label: IBM Plex Mono, `--st-label-size`, `--st-label-tracking`, muted
- Value: Cormorant Garamond, large, brand-forward
- Bar: full-width track, colored segments, 6px height
- Legend: small mono labels with color swatches below bar

### `DataTable`
Location: `apps/web/src/design-system/components/DataTable/`

A props-driven wrapper over the existing DS `Table` + `TableWrap` primitives (both already exist at `packages/design-system/src/components/Table/` and `apps/web/src/design-system/components/table/`). Adds a column config API and a `trust` variant that overrides the header color token. Does not re-implement the table skeleton.

```
Props:
├── columns: Array<{
│     key: string
│     label: string
│     width?: string          — CSS width hint
│     render?: (value, row) => ReactNode   — custom cell renderer
│   }>
├── rows: Array<Record<string, unknown>>
├── caption? (string)         — accessible table caption
├── variant? ('default' | 'trust')  — 'trust' sets --st-table-header-bg to surface-strong
│                                      (subdued header, not pink accent)
└── className? (string)
```

**Trust variant token override** — same skeleton, different color tokens:
- Default Table: `--st-table-header-bg = --st-color-accent` (pink), header text = white
- Trust variant: `--st-table-header-bg = var(--st-color-bg-surface-strong)` (subdued), header text = `--st-color-text-default` (WCAG AA on both light and dark)

Supports a `KindBadge` sub-component for version type labels (`minor` = pink, `patch` = grey, `major` = lime). SUG-19 can extend `DataTable` with sortable columns without forking the skeleton.

---

## Section scope

- [x] **Phase 0** — HTML mock: both report variants, light and dark, desktop and mobile. Gate before any schema or JSX. Mock must label `StatTile` and `DataTable` as named DS components with visible prop surfaces.
- [ ] **DS primitives** — `StatTile` + `DataTable` + `KindBadge` components, CSS modules, Storybook stories, token additions
- [ ] **Sanity schema** — `trustReportSection` object in `schemas/sections/`; single `reportType` select field (`recent-releases` | `design-system-stats`); register in doc types
- [ ] **GROQ projection** — add `_type == "trustReportSection" => { reportType }` to all slug queries
- [ ] **Renderer** — `TrustReportSection.jsx` in `apps/web/src/components/`; switch on `reportType`; pull from `stats.json`; two sub-renderers consuming `StatTile` and `DataTable`
- [ ] **CSS** — component CSS, token-first, both dark and light theme
- [ ] **Section builder wiring** — add to `PageSections.jsx` switch + all in-scope doc type schemas

## Phases

### Phase 0 — Mock (gate before Phase 1)
- Create `docs/drafts/SUG-87-trust-report-mock.html` ✓ (exists — awaiting approval)
- Mock both variants: `recent-releases` and `design-system-stats`
- Show desktop and mobile layouts
- Label `StatTile` and `DataTable` as named DS components in the mock
- Confirm: field selection per variant, typography treatment (Garamond vs Mono), row/table vs tile layout, dark defaults, StatTile prop API
- Human approval required before any schema or JSX

### Phase 1 — DS Primitives
- `StatTile` component + CSS module (both DS and web token files)
- `DataTable` wrapper + `KindBadge` sub-component — wraps existing `Table`/`TableWrap`; adds column config API + `trust` variant token override; no new skeleton CSS needed
- Token additions: `--st-stat-tile-*` (both token files, same commit); `--st-data-table-*` only if trust variant header token needs a named alias beyond `--st-color-bg-surface-strong`
- Storybook stories: `StatTile` (with/without bar, with/without legend), `DataTable` (basic, with badges, mobile scroll)
- Commit: `feat(ds): StatTile and DataTable primitives (SUG-87)`

### Phase 2 — Schema + GROQ
- `trustReportSection.ts` schema with `reportType` select
- Register in all doc types that support section builder
- GROQ projection added to all slug queries
- Commit: `feat(studio): trustReportSection schema (SUG-87)`

### Phase 3 — Renderer
- `TrustReportSection.jsx` + CSS module
- `RecentReleasesReport` sub-renderer: uses `DataTable` with `KindBadge`, data from `stats.release.latestN`
- `DesignSystemStatsReport` sub-renderer: uses `StatTile` grid, data from `stats.ds.*`, `stats.storybook.*`, `stats.repo.*`
- Add to `PageSections.jsx` switch
- Commit: `feat(web): TrustReportSection renderer (SUG-87)`

### Phase 4 — Wire to /platform page + QA
- Add the section to the `/platform` Sanity document
- Visual QA against mock
- Commit: `feat(web): wire trust reports to /platform (SUG-87)`

## Acceptance criteria

- [ ] `StatTile` component exists in `apps/web/src/design-system/components/StatTile/` with Storybook story
- [ ] `DataTable` component exists in `apps/web/src/design-system/components/DataTable/` with Storybook story
- [ ] `trustReportSection` schema exists, registered in `index.ts`, available in section builder for page/article/caseStudy/node
- [ ] Selecting `recent-releases` renders N most recent releases via `DataTable` from `stats.release.latestN`
- [ ] Selecting `design-system-stats` renders DS health data via `StatTile` grid from `stats.json`
- [ ] No editorial content fields — only the `reportType` selector in Studio
- [ ] Both variants render correctly on `/platform` page with real data
- [ ] `pnpm validate:tokens` — 0 errors
- [ ] `pnpm validate:tokens --strict-colors` — 0 errors
- [ ] Storybook stories for both variants and both primitives exist and render without errors
- [ ] Phase 0 mock approved before any implementation code is written

## Technical notes

- Data source: `import stats from '../generated/stats.json'` (Vite JSON import, build-time)
- Stale field guard: `stats.perf?.stale ? null : stats.perf?.performance` — render `—` for null fields
- Section type follows existing section pattern: object schema → `PageSections` case → sub-component
- No GROQ content data needed — `reportType` is the only projected field
- Trust canonical links (from SUG-76): `TRUST_LINKS` constants in `routes.js` — reuse, do not redefine
- `StatTile` and `DataTable` live in `apps/web/src/design-system/components/` (web adapter layer) — not in `packages/design-system/src/` yet; extract to DS package when SUG-19 activates if the API has stabilised

## Related

- **[SUG-87](https://linear.app/sugartown/issue/SUG-87)** — Linear
- **SUG-67** — Dynamic trust reporting pipeline (stats.json source)
- **SUG-76** — Trust render surfaces (predecessor)
- **docs/shipped/SUG-76-trust-render-surfaces.md** — surface specs and data shape reference
- **SUG-19** — KPI Dashboard Cards (downstream consumer of `StatTile` and `DataTable`)
