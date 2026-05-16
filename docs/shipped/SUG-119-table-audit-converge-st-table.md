---
**Epic:** SUG-119 — Table Audit — converge to a single st-table component
**Linear Issue:** [SUG-119](https://linear.app/sugartown/issue/SUG-119)
**Status:** Shipped — all 4 phases complete (2026-05-16). Pending Chromatic VRT baseline.
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-119 — Table Audit — converge to a single st-table component

Converge every table surface in the design system onto one `<Table>` chassis with functional props, absorb `<LaneHeader>` into the table caption surface, and fold `<DataTable>` in as a deprecated re-export.

## Background

Three parallel table surfaces exist with divergent CSS and no shared token contract. The DS `Table` primitive uses a pink accent header and nth-child zebra striping. `DataTable` wraps it with a props-driven column API and overrides header color via inline CSS custom property injection — a leaky pattern that bypasses the token graph. `RoadmapTable` (added in SUG-118) bypasses `Table` entirely with its own raw `<table>` markup, sticky thead rules, and white-row backgrounds. Additionally, `<LaneHeader>` — the floating lane sub-header above `<RoadmapTable>` — competes visually with the table chrome and creates a triple-stacked label problem on the governance page (SectionLabel → LaneHeader → thead). None of the three surfaces have formal dark mode coverage.

All five activation blockers were resolved 2026-05-15. The design handoff is at `/Users/beckyalice/Downloads/design_handoff_governance_tweaks/README.md` (`§01 Table audit` section).

## Decisions locked (2026-05-15)

| # | Decision | What it means |
|---|---|---|
| 1 | **Prop name: `tone`** | Not `headerColorway`. Broader scope — row hover, zebra, border treatments can all vary later without a rename. |
| 2 | **Values: `tone="accent" \| "subdued"`** | Not `pink \| neutral` — those mix paint with role. `accent/subdued` survives a re-theme. `quiet` (transparent header) deferred until a consumer needs it. |
| 3 | **DataTable folds into `<Table>`** | `columns / rows / caption / captionMeta` move onto `<Table>`. `<DataTable>` stays as a deprecated re-export for one minor, then removed. |
| 4 | **Sticky offset: CSS custom property** | `--st-table-sticky-offset` on the table wrapper, not a React prop. Layout concern owned by the parent (SectionLabel, future filter bar). Same pattern as `--scroll-padding`. |
| 5 | **Phase 1 enumerates retained selectors** | Phase 1 deliverable lists every CSS rule that survives in `RoadmapTable.module.css` after refactor. Phase 3 finish line = nothing outside that list. |
| 6 | **Theme cascade audit = Phase 2 AC** | Promoted from tech note to acceptance criterion. Phase 2 must trace the full override chain for every new `--st-table-header-*` token in both light and dark blocks of `theme.pink-moon.css` before any token ships. |

## Objective

After this epic: one DS `<Table>` primitive accepts `tone`, `caption`, `captionMeta`, `columns`, `rows`, `layout`, `mobile`, `zebra`, and `density` props. `<LaneHeader>` is retired — its job moves to `<Table caption captionMeta>`. `<RoadmapTable>` composes `<Table>` instead of rendering raw `<table>` markup. `<DataTable>` is a deprecated re-export pointing at `<Table>`. All table surface zone tokens are defined with light and dark overrides. Both DS mirrors stay in sync throughout.

Layers touched: Design System JSX + CSS, tokens, Storybook, web pages (`GovernancePage`, `DesignSystemPage`).
Not in scope: `TableBlockInput` Studio authoring UX, 860px breakpoint change, column width token additions.

## Scope

### Phase 1 — Audit + token gap analysis (no code changes)
- [x] Document every `--st-*` token referenced or missing in `Table.module.css`, `DataTable.module.css`, `RoadmapTable.module.css` — layer: tokens
- [x] Produce the zone map: header bg, header text, header border, row bg (even), row bg (odd/zebra), row hover, cell border, last-row border — with current light values and computed dark-mode values — layer: tokens
- [x] **Enumerate retained selectors:** list every CSS rule that survives in `RoadmapTable.module.css` after the Phase 3 refactor (column widths, `--st-table-sticky-offset` binding, project-chip cell layout only) — layer: CSS
- [x] Audit `TableBlockInput.tsx`: confirm no DS token leakage; document the PortableText serializer path from `tableBlock` → `Table` + `TableWrap` in web — layer: Studio (read-only)

### Phase 2 — `tone` prop + caption surface + token definitions
- [x] Add `tone: 'accent' | 'subdued'` to DS `<Table>` (default `'accent'`) — layer: Design System JSX + CSS
- [x] Add `caption` + `captionMeta` props rendered as `<caption>` element — layer: Design System JSX + CSS
- [x] Add sticky caption + thead together via `--st-table-sticky-offset` CSS custom property on the wrapper — layer: CSS
- [x] Define tokens in `tokens.json`: `--st-table-header-bg-subdued`, `--st-table-header-color-subdued`, plus zone-map tokens. Add light + dark overrides in `theme.pink-moon.css` — layer: tokens
- [x] **Theme cascade audit (AC-gated):** dark-mode subdued header uses `--st-color-midnight-700` (opaque) not `--st-color-bg-surface-strong` (glassmorphism rgba) — traced and documented — layer: tokens
- [x] Fold `columns` + `rows` API from `<DataTable>` onto `<Table>` — layer: Design System JSX
- [x] Remove inline CSS variable injection from `<DataTable>` trust variant; replace with `tone="subdued"` pass-through — layer: web adapter
- [x] Mark `<DataTable>` deprecated — re-export of `<Table>` only — layer: web adapter
- [x] Add dark-mode stories for accent + subdued tones — layer: Storybook
- [x] Mirror all changes to both DS copies (`packages/design-system` + `apps/web/src/design-system`) in same commit — layer: both mirrors

### Phase 3 — `<RoadmapTable>` refactor + `<LaneHeader>` retirement
- [x] Refactor `<RoadmapTable>` to compose `<Table tone="subdued" layout="fixed">` — no raw `<table>` element — layer: web DS adapter
- [x] Remove `<LaneHeader>` call from `GovernancePage` — caption handles it — layer: web page
- [x] Retire `components/lane-header/` from both DS mirrors — layer: Design System
- [x] Reduce `RoadmapTable.module.css` to Phase 1 retained-selectors list only — layer: CSS
- [x] Add `<RoadmapTable>` Storybook stories with caption, both lanes, dark mode — layer: Storybook

### Phase 4 — Dark mode QA + Chromatic
- [x] Verify `accent` and `subdued` tones render correctly on `dark-pink-moon` in Storybook — layer: visual QA (stories added with dark-pink-moon theme param)
- [x] Confirm no glassmorphism wash on table row backgrounds in dark mode — verified via token cascade audit (Phase 2 AC)
- [ ] Run Chromatic VRT — baseline all table stories — layer: Chromatic <!-- Chromatic: pending -->
- [ ] Remove deprecated `<DataTable>` component after all callers migrate — next minor, separate commit

## Phases

**Phase 1:** Token gap analysis + retained-selector enumeration — output is zone map and CSS audit list, no code changes
**Phase 2:** `tone` prop + caption surface + tokens — `DataTable` folded in and deprecated
**Phase 3:** `RoadmapTable` refactor + `LaneHeader` retirement
**Phase 4:** Dark mode QA + Chromatic baseline

## Full prop interface (after Phase 2+3)

```tsx
interface TableProps {
  tone?: 'accent' | 'subdued';       // default: 'accent'
  zebra?: boolean;                    // default: true on accent, false on subdued
  layout?: 'auto' | 'fixed';         // default: 'auto'
  mobile?: 'scroll' | 'cards';       // default: 'scroll'
  caption?: ReactNode;               // mono-uppercase label, leading hairline
  captionMeta?: ReactNode;           // right-aligned secondary
  columns?: Column[];                // folded from DataTable
  rows?: Row[];                      // folded from DataTable
  density?: 'comfortable' | 'compact'; // default: 'comfortable'
  children?: ReactNode;              // raw <thead>/<tbody> when columns/rows not used
}
```

## Acceptance criteria

- [ ] `<Table>` accepts `tone="accent"` (default) and `tone="subdued"`; both render correctly in light and dark themes
- [ ] `<Table caption captionMeta>` renders a styled `<caption>` element matching the visual spec above
- [ ] Caption + thead pin together when `--st-table-sticky-offset` is set on the wrapper
- [ ] `<DataTable>` is a deprecated re-export of `<Table>` — no inline CSS variable injection remains
- [ ] `<RoadmapTable>` composes `<Table>` — no raw `<table>` element; CSS module contains only the Phase 1 retained selectors
- [ ] `<LaneHeader>` component deleted from both DS mirrors; all callers migrated to `<Table caption captionMeta>`
- [ ] `--st-table-sticky-offset` works on the governance page (caption + thead pin together at the correct offset)
- [ ] All table surface zone tokens defined in `tokens.json` with explicit light + dark overrides in `theme.pink-moon.css`
- [ ] Phase 2 theme-cascade audit completed and documented for every new `--st-table-header-*` token
- [ ] `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` pass with zero errors
- [ ] Storybook stories exist for `<Table>` (accent, subdued, responsive, wide, mobile, dark mode) and `<RoadmapTable>` (default with caption, sticky-scroll demo)
- [ ] Chromatic baseline captured
- [ ] No regression on `/platform/governance` roadmap section or `/platform/design-system` registry section

## Technical notes

- **Activation audit — token gap (Phase 1):** Run before writing any token: `grep -n 'var(--st-' apps/web/src/design-system/components/data-table/DataTable.module.css apps/web/src/design-system/components/roadmap-table/RoadmapTable.module.css packages/design-system/src/components/Table/Table.module.css`
- **Theme cascade audit (Phase 2 — AC gated):** Before any `--st-table-header-*` token ships, trace: (1) `tokens.css` default, (2) `theme.pink-moon.css` light block, (3) `theme.pink-moon.css` dark block. Tokens with glassmorphism in dark-pink-moon dark block: `--st-color-bg-surface`, `--st-color-bg-surface-strong`, `--st-card-bg` — do not use these for table row backgrounds without verifying the computed value is not a wash.
- **`<DataTable>` inline style removal:** The trust variant currently sets `--st-table-header-bg` and `--st-table-header-color` via `style={}` on `<Table>`. These CSS custom properties can be removed from `Table.module.css` after Phase 2 — they exist only to support the injection pattern.
- **Caption DOM:** `<caption>` with `caption-side: top` is a11y-positive — screen readers announce it as the table label. Avoid using a `<div>` pseudo-caption. The restyling target is the `<caption>` element directly in `Table.module.css`.
- **`--st-table-sticky-offset` usage:** Set on the wrapper element, not on `<Table>` itself. Example — when `<SectionLabel>` above is 56px tall: `<div className={styles.roadmapLane} style={{ '--st-table-sticky-offset': '56px' }}>`. For static layouts, set in the module CSS: `.roadmapLane { --st-table-sticky-offset: 56px; }`.
- **DS mirror discipline:** Every Phase 2 and Phase 3 change applies to both `apps/web/src/design-system/components/` and `packages/design-system/src/components/` in the same commit.
- **`TableBlockInput` is out of scope for display refactor.** Its rendered output goes through `Table` + `TableWrap` via PortableText serializers — verify the serializer path still works after Phase 3 but do not modify `TableBlockInput.tsx`.
- **Model recommendation:** Phase 1 (audit only) → Sonnet. Phase 2–3 (DS refactor) → Sonnet with plan mode.

## Existing component map

| Component | Location | Uses Table primitive? | Header treatment | Dark mode? | Storybook? |
|-----------|----------|-----------------------|-----------------|------------|------------|
| `Table` + `TableWrap` | `packages/design-system/src/components/Table/` | is the primitive | Pink accent only | Untested | ✅ 7 stories |
| `Table` (web adapter) | `apps/web/src/design-system/components/table/` | ✅ re-export | Pink accent only | Untested | — |
| `DataTable` | `apps/web/src/design-system/components/data-table/` | ✅ wraps Table | accent + trust (inline CSS var injection) | Untested | ✅ 5 stories |
| `RoadmapTable` | `apps/web/src/design-system/components/roadmap-table/` | ❌ raw `<table>` | neutral-100 hardcoded | Untested | ❌ |
| `LaneHeader` | `apps/web/src/design-system/components/lane-header/` | n/a — floating sub-header | n/a | n/a | ❌ |
| `TableBlockInput` | `apps/studio/components/` | ❌ authoring grid (inline styles) | n/a | n/a | ❌ |

## Caller map

| Caller | Where | Why |
|--------|-------|-----|
| `DataTable` (trust) | `GovernancePage` §01 Recent Releases | Subdued header for release stats |
| `DataTable` (trust) | `DesignSystemPage` §02 Component Registry | Same — stats context |
| `DataTable` (trust) | `TrustReportSection` | Reusable platform section |
| `RoadmapTable` | `GovernancePage` §02 Roadmap | Sticky thead, Linear epic data with priority chips |
| `Table` via PT serializer | Article / Node / Case Study detail pages | PortableText `tableBlock` rendered by `portableTextComponents.jsx` |

## Migration map

| Live element | After SUG-119 |
|---|---|
| `<DataTable variant="trust" …/>` | `<Table tone="subdued" …/>` (or keep `<DataTable>` deprecated alias for one release) |
| `<DataTable …/>` (default) | `<Table …/>` (accent is default) |
| `<LaneHeader label="In progress" count={n} />` + `<RoadmapTable …>` | `<RoadmapTable lane={…} epics={…} />` — caption + meta from props |
| `thead th` with `top: 38px` hardcoded | Remove offset from CSS; set `--st-table-sticky-offset` on wrapper |
| `<KindBadge kind={row.kind} />` | `<Chip kind={row.kind}>` (per SUG-118 chip system) |

## Tone token spec

| Zone | `accent` light | `accent` dark | `subdued` light | `subdued` dark |
|------|---------------|--------------|-----------------|----------------|
| Header bg | `--st-color-pink` | (pink dims via theme) | `--st-color-neutral-100` | `--st-color-bg-surface-strong` (verify — may be glassmorphism) |
| Header text | `#ffffff` | `#ffffff` | `--st-color-text-muted` | `--st-color-text-muted` |
| Row bg | `--st-color-white` | (theme) | `--st-color-white` | (theme) |
| Zebra row | `--st-table-zebra-bg` | (theme) | none (false default) | none |
| Row hover | `color-mix(in srgb, var(--st-color-pink) 2.5%, transparent)` | (theme) | same | same |
| Cell border | `--st-color-border-default` | (theme) | `--st-color-border-default` | (theme) |
| Last-row border | `--st-color-rule-accent` | (theme) | `--st-color-rule-accent` | (theme) |

*Dark values marked (theme) require Phase 1 zone map audit to confirm computed values.*

## Non-goals

- `TableBlockInput` authoring UX changes — Studio editing out of scope; audit-only
- 860px mobile-card breakpoint change — intentional; requires separate UX review
- Column width token additions — `st-col--*` set is sufficient unless audit reveals a gap
- Shopify or external embed table variants — post-launch
- `quiet` tone (transparent header) — deferred until a consumer needs it

## Related

- **Linear:** [SUG-119](https://linear.app/sugartown/issue/SUG-119) — ⚠️ Linear MCP was down at creation time; create issue manually if not yet created
- **Design handoff:** `/Users/beckyalice/Downloads/design_handoff_governance_tweaks/README.md` (§01 Table audit) — all five activation blockers resolved
- **Upstream:** SUG-118 (RoadmapTable DS component — shipped, exposed the colorway gap)
- **Epic template:** `docs/epic-template.md` — complete Files to Modify at activation time
