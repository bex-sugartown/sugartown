---
**Epic:** SUG-120 — Consolidate StatGrid + StatTileSection into Grid primitive
**Linear Issue:** [SUG-120](https://linear.app/sugartown/issue/SUG-120/grid-audit-converge-to-a-single-grid-andor-container-component)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-120 — Consolidate StatGrid + StatTileSection into Grid primitive

Deprecate `StatGrid` (DS package) and `StatTileSection` (web PageSections adapter) in favour of `SectionContainer` with explicit props. Tile, Card, and artifact cells are composition examples — not baked-in variants of the grid itself.

## Background

Three parallel implementations render the same visual surface — a ruled grid of stat/metric cells — with no single canonical path. `StatGrid` + `StatGridCell` live in `packages/design-system/src/components/StatGrid/` and have their own CSS module. A second `StatGrid` web adapter lives at `apps/web/src/design-system/components/stat-grid/StatGrid.jsx`. `SectionContainer` (introduced in SUG-99) is the newer, more minimal primitive that owns the same border/gap/divider contract. `StatTileSection` in `PageSections.jsx` composes `SectionContainer` + `Tile` for the `statTileSection` Sanity section type — but it's an inline renderer function, not a reusable component. The result is three callsite paths for the same pattern and two separate Storybook namespaces for what is visually the same thing.

`SectionContainer` already owns the outer shell: 2px ink top rule, 1px box border, bg-through-gap hairline dividers. What it lacks are the cell-level props currently handled by `StatGridCell` (`signal`, `href`, `foot`/artifact mode). These belong on `Tile` (for metric display) or a new `ArtifactCell` composition — not on the grid primitive.

## Objective

After this epic, `SectionContainer` is the only DS grid primitive for ruled stat/content strips. `Tile` gains any missing props to cover `StatGridCell`'s stat display variants (`signal` sub-label). An `ArtifactCell` composition (or extended `Tile` mode) covers the `foot`/link artifact card variant. `StatGrid` (both DS package and web adapter) and the inline `StatTileSectionRenderer` in `PageSections.jsx` are removed. The `statTileSection` Sanity section type continues to work — its renderer is rewritten to use `SectionContainer` + `Tile` directly. Storybook coverage moves entirely to `SectionContainer.stories.tsx` with new stories for the composition patterns. This epic does not touch Sanity schema, GROQ queries, or the `statTileSection` document type — only the render layer.

## Scope

- [ ] Audit `Tile` props against `StatGridCell` stat mode (`label`, `value`, `signal`, `href`) — add `signal` to `Tile` if missing — layer: DS primitive + web adapter
- [ ] Decide artifact cell path: extend `Tile` with `foot` prop, or create a minimal `ArtifactCell` composition in `apps/web/src/design-system/components/` — layer: DS / web adapter
- [ ] Rewrite `StatTileSectionRenderer` in `PageSections.jsx` to use `SectionContainer` + `Tile` directly (remove import of `StatGrid`/`StatGridCell`) — layer: frontend
- [ ] Delete `packages/design-system/src/components/StatGrid/` (all files: `StatGrid.tsx`, `StatGrid.module.css`, `StatGrid.stories.tsx`, `index.ts`) — layer: DS package
- [ ] Delete `apps/web/src/design-system/components/stat-grid/` — layer: web adapter
- [ ] Remove `StatGrid`/`StatGridCell` exports from `packages/design-system/src/index.ts` — layer: DS package
- [ ] Update `SectionContainer.stories.tsx` to add stories covering: stat strip with `signal` prop, artifact/linked cell strip, single-tile edge case — layer: Storybook
- [ ] Delete `apps/web/src/components/StatTileSection.stories.tsx` entirely (the two remaining stories — `SingleTile` and `CwvFieldMetrics` — move into `SectionContainer.stories.tsx` or `PageSections.stories.tsx`) — layer: Storybook
- [ ] Run `pnpm validate:tokens` — confirm zero errors — layer: tooling
- [ ] Chromatic VRT — confirm zero visual diffs — layer: Storybook / QA

## Acceptance criteria

- [ ] `grep -r "StatGrid\|StatGridCell" apps/web/src/ packages/design-system/src/` returns zero results
- [ ] `grep -r "StatTileSectionRenderer\|StatTileSection" apps/web/src/components/PageSections.jsx` returns zero results (renderer rewritten inline-free or as a local function using only `SectionContainer` + `Tile`)
- [ ] `StatTileSection.stories.tsx` file does not exist
- [ ] All existing `statTileSection` sections render correctly on a real page (e.g. `/platform` or any page with a `statTileSection` block) — visual parity with pre-epic output
- [ ] `SectionContainer.stories.tsx` includes stories covering: 3-tile strip, 4-tile strip, with folio header, with `signal` sub-label, artifact/foot cell, single-tile edge case, CWV field metrics
- [ ] Chromatic Build passes with zero new visual diffs

## Technical notes

- **Activation audit:** Read `packages/design-system/src/components/Tile/Tile.tsx` (or `.jsx`) to confirm whether a `signal` prop already exists before adding it. Also read `SectionContainer.module.css` to confirm the `columns` override mechanism covers all current `StatGrid` column counts (3 and 4).
- **Artifact mode:** `StatGridCell` renders in "artifact mode" when `foot != null` — a dashed-top-rule slot below the value. Decide before implementation: extend `Tile` with `foot` + `href` props (simplest), or create a dedicated `ArtifactCell` component. The latter is justified only if artifact cells need meaningfully different layout from metric tiles. If both modes share 80%+ of their CSS, a single `Tile` with a `variant="artifact"` prop is the right path.
- **`statTileSection` Sanity section type is out of scope** — the schema, GROQ projection in `queries.js`, and Studio document structure are unchanged. Only the React render layer changes.
- **No schema deploy required** — this epic touches only frontend and DS package code.
- **Model recommendation:** `/model sonnet` — pure frontend/DS refactor, no schema or complex reasoning required.

## Non-Goals

- Changes to the `statTileSection` Sanity schema or GROQ projection
- Changes to any other `PageSections` section type renderer
- Adding new stat/metric Sanity content or editing existing content
- Responsive breakpoint changes to `SectionContainer` (out of scope — address if needed in a follow-up)

## Related

- **Linear:** [SUG-120](https://linear.app/sugartown/issue/SUG-120/grid-audit-converge-to-a-single-grid-andor-container-component)
- **Upstream:** SUG-99 (SectionContainer introduced), SUG-119 (Table Audit — same DS consolidation pattern)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
