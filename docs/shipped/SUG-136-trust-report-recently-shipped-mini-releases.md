---
**Epic:** SUG-136 — Trust Report — Recently Shipped + Mini-releases
**Linear Issue:** [SUG-136](https://linear.app/sugartown/issue/SUG-136)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-136 — Trust Report — Recently Shipped + Mini-releases

Extend `trustReportSection` with two new report variants: `recently-shipped` (the 3-column Release/Article/Node Tile block, currently page-only via `recentContentSection`) and `mini-releases` (a PATCH-scoped release table mirroring `recent-releases`). Replace the homepage `recentContentSection` instance with a `trustReportSection` containing the new `recently-shipped` variant.

## Background

The "Recently shipped" Tile block (3-col grid: latest release version, latest article, latest node) is currently only available on `page`-type documents via the standalone `recentContentSection` schema. `trustReportSection` is registered on all doc types (article, node, caseStudy, page), making it the right home for cross-site trust signals.

The `recent-releases` table already exists as a `trustReportSection` variant but explicitly filters out PATCH versions (`filter(r => r.kind !== 'PATCH')`). Mini-releases (PATCH bumps, one per epic) are the primary shipping cadence and currently invisible in the trust surface — the table only shows MINOR releases. A `mini-releases` variant inverts this filter to surface the granular build cadence.

The stats pipeline (`changelog.js`) already classifies every entry as `PATCH`, `MINOR`, or `MAJOR`. The data is in the CHANGELOG; it just needs a separate slice exposed in `stats.release`.

## Objective

After this epic: editors can insert a `trustReportSection` on any page, article, node, or case study and select either `recently-shipped` (Tile grid) or `mini-releases` (table) alongside the existing three variants. The homepage `recentContentSection` is replaced with a `trustReportSection` instance. `stats.release` exposes a `latestPatches` slice for the mini-releases renderer. `recent-releases` and `mini-releases` are independent variants, each with their own filtered view.

Layers touched: stats pipeline (`changelog.js`), Sanity schema (`trustReportSection.ts`), frontend (`TrustReportSection.jsx`), Sanity content (homepage doc replacement).

## Scope

### Phase 1 — Stats pipeline: expose `latestPatches`

- [ ] In `apps/web/scripts/stats/changelog.js`: add `latestPatches: entries.filter(e => e.kind === 'PATCH').slice(0, 10)` to the return value alongside `latestN`. 10 entries covers ~2 releases worth of mini-releases. Layer: stats pipeline
- [ ] Verify `stats.release.latestPatches` is populated after `pnpm collect-stats` or a build run. Layer: tooling

### Phase 2 — Schema: add two new report variants

- [ ] In `apps/studio/schemas/sections/trustReportSection.ts`: add `{ title: 'Recently shipped — release / article / node tiles', value: 'recently-shipped' }` and `{ title: 'Mini-releases — PATCH release history', value: 'mini-releases' }` to the `reports` list options. Layer: schema
- [ ] Update the `labels` map in the `preview.prepare` function to include both new keys. Layer: schema
- [ ] Bump `validation` max from `3` to `5` if editors should be able to combine all five variants. Otherwise leave at `3` and document the limit. Layer: schema
- [ ] Deploy schema: `npx sanity schema deploy` from `apps/studio/`. Layer: schema

### Phase 3 — Frontend: implement new renderers

**Activation audit:** read `TrustReportSection.jsx` `RecentReleasesReport` component and `PageSections.jsx` `RecentContentSectionRenderer` before writing any JSX — both are directly reusable.

- [ ] In `TrustReportSection.jsx`: add `RecentlyShippedReport` component — reuses `useSanityDoc(latestArticleQuery)` + `useSanityDoc(latestNodeQuery)` + `stats.release.current` in a 3-col `<Grid>` of `<Tile>` primitives. Mirror the `RecentContentSectionRenderer` logic in `PageSections.jsx`. Layer: frontend
- [ ] In `TrustReportSection.jsx`: add `MiniReleasesReport` component — same table as `RecentReleasesReport` but sourced from `stats.release.latestPatches` (all PATCH, no `filter(r => r.kind !== 'PATCH')`). Reuse the same `<DataTable>` + `<KindBadge>` pattern. Layer: frontend
- [ ] Wire both new components in the `reportKey` switch in `TrustReportSection.jsx`. Layer: frontend
- [ ] Update `REPORT_LABELS` map in `TrustReportSection.jsx` for the section label headers. Layer: frontend

### Phase 4 — Content: replace homepage `recentContentSection`

- [ ] In Sanity Studio: find the homepage `page` document → sections array → locate the `recentContentSection` block. Layer: content (activation audit — query the doc first to confirm slug and section key)
- [ ] Replace it with a `trustReportSection` instance with `reports: ['recently-shipped']` and no heading. Layer: content (`patch_document_from_json`)
- [ ] Verify the homepage renders identically to the current `recentContentSection` output. Layer: QA
- [ ] Publish the homepage document. Layer: content

## Acceptance criteria

- [ ] `stats.release.latestPatches` is populated with PATCH-kind entries after a build
- [ ] Studio shows `recently-shipped` and `mini-releases` as selectable options in `trustReportSection` reports
- [ ] `recently-shipped` renders correctly as a 3-col Tile grid on a non-page doc type (e.g. an article)
- [ ] `mini-releases` renders a table of PATCH releases, no MINOR entries visible
- [ ] Homepage renders the `recently-shipped` tiles via `trustReportSection` — visual output matches pre-migration
- [ ] `validate:tokens` passes after all CSS changes (if any)
- [ ] Schema deployed and MCP writes succeed

## Technical notes

**Activation audits before Phase 3:**
1. `apps/web/src/components/TrustReportSection.jsx` — read `RecentReleasesReport` for the DataTable column config and `stats.release.latestN` access pattern
2. `apps/web/src/components/PageSections.jsx` `RecentContentSectionRenderer` (~line 847) — read the Tile props and `useSanityDoc` calls to replicate in `TrustReportSection.jsx`

**`latestPatches` slice size:** 10 is a reasonable default. At the current cadence (1 PATCH per epic, ~5 epics per month), 10 entries covers about 2 months of mini-releases. Can be adjusted in `changelog.js`.

**`recent-releases` backward compatibility:** The existing `recent-releases` variant's MINOR-only filter stays unchanged — it's a curated view of major shipping milestones. `mini-releases` is the complementary PATCH view.

**`recentContentSection` retention:** Do not delete or deprecate the `recentContentSection` schema type — other page documents may use it. The homepage migration is a content edit, not a schema removal.

**Homepage content query:** Before Phase 4, run:
```groq
*[_type == "page" && slug.current == "/"][0]{
  _id,
  "recentContent": sections[_type == "recentContentSection"]{ _key, _type }
}
```
to confirm the section key before patching.

**Model & Mode:** `/model opusplan` — Phase 3 requires reading two components before writing renderers; plan mode is warranted. Phases 1, 2, 4 can run on Sonnet.

## Model & Mode [REQUIRED]

`/model opusplan` — Phase 3 (new renderers) benefits from architectural reading before implementation. Phases 1, 2, 4 are mechanical and can run on Sonnet after plan-mode exit.

## Non-Goals

- No changes to the existing `recent-releases` or `design-system-stats` or `cwv-snapshot` variants
- No new DS primitives — reuses `Tile`, `Grid`, `DataTable`, `KindBadge`, `SectionLabel`
- No deletion of `recentContentSection` schema or renderer
- No change to the `recentContentSection` schema registration on `page` docs

## Related

- **Linear:** [SUG-136](https://linear.app/sugartown/issue/SUG-136)
- **Prior epics:** SUG-87 (trustReportSection initial), SUG-100 (cwv-snapshot variant), SUG-67 (stats pipeline)
- **Key files:** `apps/web/scripts/stats/changelog.js`, `apps/studio/schemas/sections/trustReportSection.ts`, `apps/web/src/components/TrustReportSection.jsx`, `apps/web/src/components/PageSections.jsx` (RecentContentSectionRenderer ~line 847)
- **Epic template:** `docs/epic-template.md`
