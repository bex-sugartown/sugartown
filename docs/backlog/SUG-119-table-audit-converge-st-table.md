---
**Epic:** SUG-119 — Table Audit — converge to a single st-table component
**Linear Issue:** [SUG-119](https://linear.app/sugartown/issue/SUG-119)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-119 — Table Audit — converge to a single st-table component

Audit all table implementations across web, Storybook, and Studio, then converge to one `st-table` component family with a header colorway prop, full-width and responsive variants, and proper light/dark mode token coverage.

## Background

Three parallel table surfaces currently exist with divergent CSS and no shared token contract. The DS `Table` primitive (pink accent header, zebra via `nth-child`, three layout variants) is the base. `DataTable` wraps it with a props-driven column API and a `trust` variant that overrides header color via inline CSS custom property injection — a leaky pattern. `RoadmapTable` is a specialist that bypasses `Table` entirely, writes its own `<table>` markup, and handles sticky thead, white-row backgrounds, and priority chips independently. None of the three have formal dark mode coverage — light-pink-moon dark block values are untested for table surfaces. The trigger for this epic is the SUG-118 RoadmapTable build, which exposed the inconsistency and the missing `headerColorway` abstraction.

## Objective

After this epic: one DS `Table` primitive accepts a `headerColorway` prop (`neutral` | `pink`) covering both the current default (pink accent) and trust (neutral subdued) use cases, replacing the inline CSS variable injection in `DataTable`. `RoadmapTable` is refactored to use `Table` as its markup base rather than raw `<table>`. Both DS mirrors (web adapter + `packages/design-system`) are kept in sync. Dark mode tokens for all table surface zones (header bg, header text, row bg, zebra row, border, hover) are defined and verified in Storybook on the `dark-pink-moon` theme. The `TableBlockInput` Studio component is audited but left structurally unchanged — it uses inline styles for its spreadsheet grid and is not a display component.

## Scope

### Phase 1 — Audit and token gap analysis
- [ ] Document every `--st-*` token referenced or missing in `Table.module.css`, `DataTable.module.css`, `RoadmapTable.module.css` — layer: Design System / tokens
- [ ] Identify which table surface zones have no dark-mode override in `theme.pink-moon.css` — layer: tokens
- [ ] Audit `TableBlockInput.tsx`: confirm it uses inline styles only (no DS token leakage), note clipboard/keyboard API surface for future Studio work — layer: Studio (read-only this phase)
- [ ] Produce a zone map: header bg, header text, header border, row bg (even), row bg (odd/zebra), row hover, cell border, last-row border — with current token names and dark-mode computed values

### Phase 2 — `headerColorway` prop + token definitions
- [ ] Add `headerColorway: 'neutral' | 'pink'` prop to DS `Table` component (default: `'pink'` to preserve existing behaviour) — layer: Design System JSX + CSS
- [ ] Define tokens: `--st-table-header-bg-neutral`, `--st-table-header-color-neutral` in `tokens.json`; add light + dark overrides in `theme.pink-moon.css` — layer: tokens
- [ ] Remove inline CSS variable injection from `DataTable` trust variant; replace with `headerColorway="neutral"` prop pass-through — layer: web adapter
- [ ] Update `DataTable.stories.tsx`: rename `Trust` story to `Neutral header`; add dark-mode story — layer: Storybook
- [ ] Mirror all changes to both DS copies (`packages/design-system` + `apps/web/src/design-system`) in same commit — layer: both mirrors

### Phase 3 — RoadmapTable refactor
- [ ] Refactor `RoadmapTable` to use DS `Table` + `TableWrap` as markup base — layer: web DS adapter
- [ ] Preserve sticky thead behaviour via CSS on the `Table` component rather than raw `th` rules in the roadmap module — layer: CSS
- [ ] Verify `data-thead-stuck` shadow transition still works after refactor — layer: visual QA
- [ ] Update `RoadmapTable.module.css` to use only layout/column-width overrides (no row bg or border rules that duplicate `Table.module.css`) — layer: CSS
- [ ] Add `RoadmapTable` Storybook story with sticky-scroll demo — layer: Storybook

### Phase 4 — Dark mode QA + Chromatic
- [ ] Verify all three components (Table, DataTable, RoadmapTable) render correctly on `dark-pink-moon` theme in Storybook — layer: visual QA
- [ ] Confirm no glassmorphism wash on table row backgrounds in dark mode (see CLAUDE.md theme cascade audit rule) — layer: visual QA
- [ ] Run Chromatic VRT — baseline all table stories — layer: Chromatic

## Phases

**Phase 1:** Token gap analysis — no code changes, output is the zone map  
**Phase 2:** `headerColorway` prop + token definitions — `DataTable` trust variant migrated  
**Phase 3:** `RoadmapTable` refactor to consume `Table` primitive  
**Phase 4:** Dark mode QA + Chromatic baseline

## Acceptance criteria

- [ ] `Table` accepts `headerColorway="neutral"` and `headerColorway="pink"` (default); both render correctly in light and dark themes
- [ ] `DataTable` trust variant uses `headerColorway="neutral"` — no inline CSS variable injection remains
- [ ] `RoadmapTable` uses `Table`/`TableWrap` markup, not raw `<table>` element
- [ ] All table surface zone tokens are defined in `tokens.json` and have explicit light + dark overrides in `theme.pink-moon.css`
- [ ] `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` pass with zero errors
- [ ] Storybook stories exist for Table (default, neutral header, responsive, wide, dark mode), DataTable (default, neutral, dark mode), RoadmapTable (default, sticky-scroll demo)
- [ ] Chromatic baseline captured
- [ ] No regression on `/platform/governance` roadmap section or `/platform/design-system` registry section

## Technical notes

- **Activation audit — token gap:** Before Phase 2, run: `grep -n 'var(--st-' apps/web/src/design-system/components/data-table/DataTable.module.css apps/web/src/design-system/components/roadmap-table/RoadmapTable.module.css packages/design-system/src/components/Table/Table.module.css` to enumerate every token reference. Cross-check against `tokens.css` for missing dark-mode entries.
- **Activation audit — theme cascade:** Before writing any header bg token, trace the full override chain for `--st-table-header-bg-*` in both light and dark blocks of `theme.pink-moon.css` per the CLAUDE.md theme cascade audit rule.
- **RoadmapTable sticky thead:** The current implementation sticks `<thead th>` at `top: 38px` beneath `LaneHeader`. This offset must survive the refactor. Consider a `stickyOffset` prop on `Table` or a CSS custom property `--st-table-sticky-offset` that `RoadmapTable` sets on the wrapper.
- **`DataTable` inline style removal:** The current trust variant sets `--st-table-header-bg` and `--st-table-header-color` via `style={}` on `<Table>`. After Phase 2, these CSS custom properties on `Table.module.css` can be removed entirely — they exist only to support the injection pattern.
- **DS mirror discipline:** Every Phase 2 and Phase 3 change must be applied to both `apps/web/src/design-system/components/` and `packages/design-system/src/components/` in the same commit.
- **Studio `TableBlockInput` is out of scope for display refactor.** It uses a bespoke spreadsheet-style inline-styled grid for authoring. Its rendered output in the web app goes through `Table` + `TableWrap` via PortableText serializers — verify the serializer path still works after Phase 3 but do not modify `TableBlockInput.tsx`.
- **Model recommendation:** Phase 1 (audit) → Sonnet. Phase 2–3 (DS refactor) → Sonnet with plan mode.

## Existing component map (from audit)

| Component | Location | Uses Table primitive? | Header colorway | Dark mode? | Storybook? |
|-----------|----------|-----------------------|-----------------|------------|------------|
| `Table` + `TableWrap` | `packages/design-system/src/components/Table/` | — (is the primitive) | Pink only | Not tested | ✅ 7 stories |
| `Table` (web adapter) | `apps/web/src/design-system/components/table/` | ✅ re-export | Pink only | Not tested | — |
| `DataTable` | `apps/web/src/design-system/components/data-table/` | ✅ wraps Table | Pink + Trust (inline CSS var injection) | Not tested | ✅ 5 stories |
| `RoadmapTable` | `apps/web/src/design-system/components/roadmap-table/` | ❌ raw `<table>` | Neutral-100 hardcoded | Not tested | ❌ |
| `TableBlockInput` | `apps/studio/components/` | ❌ authoring grid (inline styles) | n/a | n/a | ❌ |

## Callers

| Component | Page / context | Why |
|-----------|---------------|-----|
| `DataTable` (trust) | `GovernancePage` §01 Recent Releases | Subdued header for stats table in platform hub |
| `DataTable` (trust) | `DesignSystemPage` §02 Component Registry | Same — stats context |
| `DataTable` (trust) | `TrustReportSection` | Reusable trust section used across platform pages |
| `RoadmapTable` | `GovernancePage` §02 Roadmap | Sticky thead, Linear epic data with priority chips |
| `Table` (via PT serializer) | Article / Node / Case Study detail pages | PortableText `tableBlock` rendered by `portableTextComponents.jsx` |

## Non-Goals

- `TableBlockInput` authoring UX changes — Studio editing behaviour is out of scope.
- Responsive breakpoint change — the 860px mobile-card breakpoint in `Table.module.css` is intentional; do not modify without a separate UX review.
- Column width token additions — the existing `st-col--*` set is sufficient; no new tokens unless the audit reveals a gap.
- Shopify or external embed table variants — post-launch concern.

## Related

- **Linear:** [SUG-119](https://linear.app/sugartown/issue/SUG-119)
- **Upstream:** SUG-118 (RoadmapTable DS component — exposed the colorway gap)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, and Files to Modify at activation time
