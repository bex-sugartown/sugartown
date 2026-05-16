---
**Epic:** SUG-120 — Consolidate StatGrid + StatTileSection into Grid primitive
**Linear Issue:** [SUG-120](https://linear.app/sugartown/issue/SUG-120/grid-audit-converge-to-a-single-grid-andor-container-component)
**Status:** In Progress
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-120 — Consolidate StatGrid + StatTileSection into Grid primitive

`Grid` is the single DS layout primitive for all ruled and open grids. `StatGrid`, `SectionContainer`, and the inline `StatTileSectionRenderer` are deprecated and deleted. Tile, Card, and other content components are composition examples — not baked-in variants of the grid itself.

## Background

Four parallel grid-like surfaces existed with no single canonical path:

1. `StatGrid` + `StatGridCell` in `packages/design-system/src/components/StatGrid/` — DS package, own CSS module *(deleted in this epic)*
2. `StatGrid` web adapter in `apps/web/src/design-system/components/stat-grid/` *(deleted)*
3. `SectionContainer` in `apps/web/src/design-system/components/section-container/` — SUG-99, wraps bg-through-gap + 2px ink rule + box border. Equivalent to `Grid spacing="0" accentTop` *(to be deleted — migrate callsites to Grid)*
4. `Grid` in `apps/web/src/design-system/components/grid/` — SUG-96, the canonical responsive grid with `spacing="lg"` (open gap) and `spacing="0"` (bg-through-gap hairlines) + `accentTop` prop

`Grid spacing="0" accentTop` already covers everything `SectionContainer` does. `SectionContainer` is a naming fork, not a distinct component. Deleting it removes the ambiguity.

`StatTileSectionRenderer` in `PageSections.jsx` is an inline function that composes `SectionContainer` + `Tile` for the `statTileSection` Sanity section type. Once `SectionContainer` is replaced by `Grid`, this renderer migrates in place.

**Story architecture (resolved):** `Grid.stories.tsx` covers the primitive structurally using `PlaceholderTile` children — column counts, spacing modes, `accentTop`, responsive collapse. Content-combination stories ("3-col Grid + Card", "4-col Grid + Tile", "1-col Grid + ContentBlock") live in `Grid.stories.tsx` as composition examples, clearly separated from the structural stories. `PageSections.stories.tsx` stays under `Layout/` — it shows full section-builder patterns with Sanity data shapes. `SectionContainer.stories.tsx` is deleted.

## Objective

After this epic, `Grid` is the only DS layout primitive for both open-gap and ruled-hairline grids. `SectionContainer` no longer exists. All callsites — including `StatTileSectionRenderer` — use `Grid spacing="0" accentTop`. `Grid.stories.tsx` gains composition examples showing real DS components (Tile, Card, ContentBlock) inside Grid without encoding content as the story's subject. `PageSections.stories.tsx` remains the home for full section-builder layout patterns. The `/dev/grid` test bench covers all variants with real tokens. No Sanity schema, GROQ, or Studio changes.

## Scope

### Already done on `feat/sug-120-grid-consolidation`
- [x] Add `foot` prop to `Tile` (dashed-rule accent slot — covers StatGridCell artifact mode) — layer: web adapter
- [x] Delete `packages/design-system/src/components/StatGrid/` — layer: DS package
- [x] Delete `apps/web/src/design-system/components/stat-grid/` — layer: web adapter
- [x] Remove `StatGrid`/`StatGridCell` exports from `packages/design-system/src/index.ts` — layer: DS package
- [x] Delete `apps/web/src/components/StatTileSection.stories.tsx` — layer: Storybook
- [x] Create `/dev/grid` test bench (`GridDevPage.jsx`) with all layout variants — layer: frontend / dev tooling
- [x] Register `/dev/grid` route in `App.jsx` — layer: frontend

### Remaining
- [ ] Migrate all `SectionContainer` callsites → `Grid spacing="0" accentTop` — layer: frontend. Activation audit: `grep -r "SectionContainer" apps/web/src/` to find every import and usage before touching anything.
- [ ] Delete `apps/web/src/design-system/components/section-container/` (component + CSS + stories) — layer: web adapter / Storybook
- [ ] Remove `SectionContainer` from `apps/web/src/design-system/index.js` (or wherever it is exported) — layer: web adapter
- [ ] Update `StatTileSectionRenderer` in `PageSections.jsx` to use `Grid spacing="0" accentTop` instead of `SectionContainer` — layer: frontend
- [ ] Update `/dev/grid` test bench to use `Grid` instead of `SectionContainer` — layer: frontend / dev tooling
- [ ] Add composition stories to `Grid.stories.tsx`: "3-col Grid + Card", "4-col Grid + Tile", "1-col Grid + ContentBlock" (or equivalent real DS components) — layer: Storybook. Stories use real components but minimal/placeholder content — the point is the composition pattern, not the data.
- [ ] Strip content-heavy stories added to `SectionContainer.stories.tsx` in this epic (WithSignal, Artifacts, SingleTile, CwvFieldMetrics, updated Snapshot) — these move to `Grid.stories.tsx` composition section or are dropped if `/dev/grid` covers them adequately — layer: Storybook
- [ ] Run `pnpm validate:tokens` — confirm zero errors — layer: tooling
- [ ] Chromatic VRT — confirm zero new diffs — layer: Storybook / QA

## Acceptance criteria

- [ ] `grep -r "SectionContainer\|StatGrid\|StatGridCell" apps/web/src/ packages/design-system/src/` returns zero results (excluding `/dev/grid` comment and any migration notes)
- [ ] `StatTileSectionRenderer` in `PageSections.jsx` uses `Grid` directly with `spacing="0" accentTop`
- [ ] `apps/web/src/design-system/components/section-container/` directory does not exist
- [ ] `SectionContainer.stories.tsx` does not exist
- [ ] All existing `statTileSection` sections render correctly on a real page — visual parity confirmed
- [ ] `Grid.stories.tsx` has structural stories (PlaceholderTile children) AND at least 3 composition stories showing real DS components (e.g. `Grid + Card`, `Grid + Tile`, `Grid + ContentBlock`)
- [ ] `/dev/grid` uses `Grid` (not `SectionContainer`) and renders all variants without console errors
- [ ] Chromatic Build passes with zero new visual diffs (5 diffs from Build 46 accepted as new baselines before this work resumes)

## Technical notes

- **Activation audit (remaining work):** Before migrating callsites, run `grep -rn "SectionContainer" apps/web/src/` to get the full list. Known callsites: `PageSections.jsx` (StatTileSectionRenderer + LatestContentSection), `PageSections.module.css` (`.statTileSection` class), possibly `design-system/index.js`. Check all before deleting.
- **`Grid spacing="0" accentTop` parity check:** `SectionContainer` uses `border-top: 2px solid var(--st-color-ink)` and a box border (right/bottom/left: `1px solid var(--st-color-rule-accent)`). `Grid spacing="0"` uses `border: 1px solid var(--st-color-border-default)` and `accentTop` uses `border-top: 2px solid var(--st-color-brand-primary)`. Verify token values resolve to the same visual output before migrating. If they differ, align the tokens — do not leave a silent visual regression.
- **`/dev/grid` update:** The test bench currently imports `SectionContainer`. Switch to `Grid spacing="0" accentTop` in the same commit as the callsite migration.
- **Composition stories:** Use real DS components as children but with placeholder/minimal content — `label="A" value="1"` rather than full CWV datasets. The story documents the composition pattern (what components go inside Grid and in what configuration), not the data. Reserve rich data fixtures for `/dev/grid` and `PageSections.stories.tsx`.
- **`statTileSection` Sanity schema/GROQ is out of scope** — only the render layer changes.
- **No schema deploy required.**
- **Model recommendation:** `/model sonnet` — pure frontend/DS refactor.

## Non-Goals

- Changes to the `statTileSection` Sanity schema or GROQ projection
- Changes to any other `PageSections` section type renderer
- Adding new stat/metric Sanity content or editing existing content
- Responsive breakpoint changes to `Grid` (canonical behaviour already defined in Grid.module.css)
- Moving content-pattern stories into `PageSections.stories.tsx` — those stay where they are

## Related

- **Linear:** [SUG-120](https://linear.app/sugartown/issue/SUG-120/grid-audit-converge-to-a-single-grid-andor-container-component)
- **Upstream:** SUG-96 (Grid introduced), SUG-99 (SectionContainer introduced), SUG-119 (Table Audit — same DS consolidation pattern)
- **Branch:** `feat/sug-120-grid-consolidation`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
