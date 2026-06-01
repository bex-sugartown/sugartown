---
**Epic:** SUG-126 — Migrate DataTable to Table + ButtonGroup primitive
**Linear Issue:** [SUG-126](https://linear.app/sugartown/issue/SUG-126/migrate-off-of-datatable-to-table)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-126 — Migrate DataTable to Table + ButtonGroup primitive

Remove the DataTable shim, codify multi-button grouping as a ButtonGroup DS primitive, and migrate all callsites to the canonical components.

## Background

Two parallel cleanup items exist after SUG-119 (Table audit) and SUG-120 (Grid consolidation):

1. **DataTable** is a deprecated column-config shim over `<Table>` (added for `variant="trust"` header styling). Three active callers remain: `TrustReportSection`, `DesignSystemPage`, `GovernancePage`. Deleting the shim requires migrating all three to use `<Table>` directly.

2. **ButtonGroup** does not exist as a primitive. Multi-button CTAs (Hero `ctas[]`, `CTASection`, `SchemaERD` clear/action pairs) each define their own flex wrapper with inline CSS or ad-hoc module classes (e.g. `.ctaButtons` in `PageSections.module.css`). The same `display: flex; gap: var(--st-spacing-inline-lg); flex-wrap: wrap` pattern is duplicated across at least 3 surfaces. A ButtonGroup DS primitive would codify this.

## Objective

After this epic: `DataTable` is deleted (no shim, no story, no import), all former callers render via `<Table>` directly. A `ButtonGroup` DS primitive exists in `packages/design-system` with a web adapter and Storybook story; all multi-button call sites use it.

Layers touched: DS package, web adapter layer, app-level components (PageSections, Hero, SchemaERD), Storybook.
Not in scope: new button variants, layout tokens, schema changes.

## Scope

- [ ] Migrate `TrustReportSection` from `DataTable` to `<Table>` directly — layer: frontend
- [ ] Migrate `DesignSystemPage` from `DataTable` to `<Table>` directly — layer: frontend
- [ ] Migrate `GovernancePage` from `DataTable` to `<Table>` directly — layer: frontend
- [ ] Delete `apps/web/src/design-system/components/data-table/DataTable.jsx` and `DataTable.stories.tsx` — layer: DS web adapter
- [ ] Remove `DataTable` export from `apps/web/src/design-system/index.js` — layer: DS web adapter
- [ ] Create `ButtonGroup` DS primitive in `packages/design-system/src/components/ButtonGroup/` — layer: DS package
- [ ] Create `ButtonGroup` web adapter in `apps/web/src/design-system/components/button-group/` — layer: DS web adapter
- [ ] Add `ButtonGroup` Storybook story — layer: Storybook
- [ ] Migrate `CTASection` `.ctaButtons` wrapper in `PageSections.jsx` → `<ButtonGroup>` — layer: frontend
- [ ] Migrate Hero multi-CTA wrapper in `PageSections.jsx` → `<ButtonGroup>` — layer: frontend
- [ ] Migrate `SchemaERD` sidebar footer button(s) to `<ButtonGroup>` if applicable — layer: frontend
- [ ] Update component registry — layer: docs

## Phases

Single close-out — all migrations on one branch.

**Suggested execution order:**
1. Build `ButtonGroup` primitive + web adapter + story first (no regressions possible)
2. Migrate DataTable callers to `<Table>` (with visual QA at each)
3. Delete DataTable + shim
4. Migrate multi-button CTAs to ButtonGroup
5. Update registry + mini-release

## Acceptance criteria

- [ ] `grep -r "DataTable" apps/web/src/` returns zero results (no imports, no JSX, no comments)
- [ ] `TrustReportSection`, `DesignSystemPage`, `GovernancePage` render tables visually identically to pre-migration (visual QA against screenshots)
- [ ] `ButtonGroup` story exists in Storybook at `Components/ButtonGroup` with default + stacked variants
- [ ] `CTASection` and Hero multi-CTA wrappers use `<ButtonGroup>` — no inline flex divs for button grouping
- [ ] `pnpm validate:tokens` zero errors
- [ ] No new raw color values or hardcoded spacing in ButtonGroup CSS

## Technical notes

**Activation audit:** Before migrating DataTable callers, read each file and note the exact columns/render functions passed to `DataTable` — the column-config API (`{ key, label, width, render }`) must be expressed as explicit `<th>`/`<td>` in the migrated `<Table>`.

**ButtonGroup API sketch:** `<ButtonGroup align="start|center|end" wrap={true}>` wrapping `<Button>` children. Spacing via `gap` token (`--st-spacing-inline-md`). No hardcoded margins on children.

**DataTable `variant="trust"`:** This overrides header bg to `--st-color-bg-surface-strong`. Confirm `<Table tone="subdued">` or an equivalent token expression covers this before deleting. Activation audit: inspect computed header bg on `GovernancePage` `DataTable` in browser dev tools.

**Model & Mode [REQUIRED]:** `/model opusplan` — multi-file migration across DS package + web adapter + 3+ page components; Opus plans the API and migration sequence, Sonnet executes.

## Non-Goals

- No new button variants (size, tone, icon) — ButtonGroup is layout only
- No changes to `<Table>` API — this epic consumes it, doesn't extend it
- No migration of `TablesDevPage` (dev page, not production)

## Related

- **Linear:** [SUG-126](https://linear.app/sugartown/issue/SUG-126/migrate-off-of-datatable-to-table)
- **Upstream:** SUG-119 (Table audit — shipped v0.23.31), SUG-120 (Grid consolidation — shipped v0.23.33)
- **Epic template:** `docs/epic-template.md`
