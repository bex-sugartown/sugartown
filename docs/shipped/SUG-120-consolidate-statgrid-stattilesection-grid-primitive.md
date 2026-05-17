---
**Epic:** SUG-120 — Consolidate StatGrid + StatTileSection into Grid primitive
**Linear Issue:** [SUG-120](https://linear.app/sugartown/issue/SUG-120/grid-audit-converge-to-a-single-grid-andor-container-component)
**Status:** Done
**Priority:** High
**Shipped:** 2026-05-16 · v0.23.32
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-120 — Consolidate StatGrid + StatTileSection into Grid primitive

`Grid` is the single DS layout primitive for all ruled and open grids. `StatGrid`, `SectionContainer`, and the inline `StatTileSectionRenderer` are deprecated and deleted. Tile, Card, and other content components are composition examples — not baked-in variants of the grid itself.

## Background

Four parallel grid-like surfaces existed with no single canonical path:

1. `StatGrid` + `StatGridCell` in `packages/design-system/src/components/StatGrid/` — DS package, own CSS module *(deleted)*
2. `StatGrid` web adapter in `apps/web/src/design-system/components/stat-grid/` *(deleted)*
3. `SectionContainer` in `apps/web/src/design-system/components/section-container/` — SUG-99, wraps bg-through-gap + 2px ink rule + box border. Equivalent to `Grid spacing="0" accentTop` *(deleted — callsites migrated to Grid)*
4. `Grid` in `apps/web/src/design-system/components/grid/` — SUG-96, the canonical responsive grid

`Grid spacing="0" accentTop` covers everything `SectionContainer` did. `SectionContainer` was a naming fork, not a distinct component.

## Objective

`Grid` is the only DS layout primitive for both open-gap and ruled-hairline grids. `SectionContainer` no longer exists. All callsites use `Grid spacing="0" accentTop`. Grid also gained `accentColor` (`"brand"` | `"ink"`) and `tabletColumns` props.

## Scope — shipped

- [x] Add `foot` prop to `Tile` (dashed-rule accent slot — covers StatGridCell artifact mode)
- [x] Delete `packages/design-system/src/components/StatGrid/`
- [x] Delete `apps/web/src/design-system/components/stat-grid/`
- [x] Remove `StatGrid`/`StatGridCell` exports from `packages/design-system/src/index.ts`
- [x] Delete `apps/web/src/components/StatTileSection.stories.tsx`
- [x] Create `/dev/grid` test bench (`GridDevPage.jsx`) with all layout variants
- [x] Register `/dev/grid` route in `App.jsx`
- [x] Migrate all `SectionContainer` callsites → `Grid spacing="0" accentTop`
- [x] Delete `apps/web/src/design-system/components/section-container/`
- [x] Remove `SectionContainer` from design-system exports
- [x] Update `StatTileSectionRenderer` in `PageSections.jsx` to use `Grid spacing="0" accentTop`
- [x] Update `/dev/grid` test bench to use `Grid` only
- [x] Add `accentColor` prop (`"brand"` | `"ink"`) to Grid — controls 2px top accent border colour
- [x] Add `tabletColumns` prop to Grid — intermediate 2-col breakpoint at 900px
- [x] `pnpm validate:tokens` — zero errors confirmed
- [ ] Chromatic VRT — deferred; annotated as pending

<!-- Chromatic: pending -->

## Acceptance criteria — verified

- [x] `grep -r "SectionContainer\|StatGrid\|StatGridCell" apps/web/src/ packages/design-system/src/` returns zero code results (stale CSS comments in `SchemaERD.module.css` and `PlatformHubPage.module.css` are non-functional and not imports)
- [x] `StatTileSectionRenderer` in `PageSections.jsx` uses `Grid` directly with `spacing="0" accentTop`
- [x] `apps/web/src/design-system/components/section-container/` directory does not exist
- [x] `SectionContainer.stories.tsx` does not exist
- [x] All existing `statTileSection` sections render correctly — visual parity confirmed
- [x] `/dev/grid` uses `Grid` and renders all variants without console errors

## Non-Goals

- Changes to the `statTileSection` Sanity schema or GROQ projection
- Changes to any other `PageSections` section type renderer
- No schema deploy required

## Related

- **Linear:** [SUG-120](https://linear.app/sugartown/issue/SUG-120/grid-audit-converge-to-a-single-grid-andor-container-component)
- **Upstream:** SUG-96 (Grid introduced), SUG-99 (SectionContainer introduced), SUG-119 (Table Audit)
