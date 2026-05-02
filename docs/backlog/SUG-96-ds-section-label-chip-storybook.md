---
**Epic:** SUG-96 — DS component polish — SectionLabel, Grid primitive, ContentPreviewCard rename + Chip Storybook colorways
**Linear Issue:** [SUG-96](https://linear.app/sugartown/issue/SUG-96)
**Status:** Backlog
**Priority:** 🔵 Low
**Merge strategy:** (a) Merge-as-you-go — each item ships independently
---

# SUG-96 — DS component polish: SectionLabel, Grid primitive, ContentPreviewCard rename + Chip Storybook colorways

Six DS cleanup items surfaced during SUG-91 and post-mortem review. No schema or Sanity content changes.

## Background

**SectionLabel**: The mono-caps heading with extending horizontal rule is implemented twice — in `RecentContentSection.module.css` (`.heading`) and `pages.module.css` (`.outcomeStripLabel`). Both sets of CSS are identical. The pattern needs a shared component before a third call site appears.

**Chip colorways**: Storybook Chip stories (`/primitives/chip`) were authored before the Ledger Tradition font and palette switch (SUG-63). The stories render correctly in production but the story fixtures may reference stale color names or show mismatched palette comparisons. The `variant="tag"` neutral chip (the canonical evidence chip used in StatTile) is the reference the stories should anchor to.

**StatTile chip prop**: SUG-91 added a `chip` prop to StatTile that renders a neutral `<Chip variant="tag">` for evidenceType labels. No Storybook story covers it.

**Grid primitive**: Two grid patterns exist inline in multiple places — the 24px card grid (`.st-layout-grid` in globals.css, used by archive pages) and the 1px-gap hairline tile grid (inlined in `TrustReportSection` and `CaseStudyPage`). These should be unified into a single generic `Grid` primitive with a `spacing` prop (`"card"` = 24px open gap, `"tile"` = 1px bg-through-gap hairline). The tile spacing variant also requires `background: var(--st-color-rule-accent)` on the parent — so it's not just a gap value, but a visual technique. A mock is required before implementing.

**RecentContentSection rename**: `RecentContentSection` names both content type ("recent") and page placement ("section") — neither belongs in a component name. The inner `TickerCard` is a lightweight content preview pattern: type label (brand-primary) + title + optional descriptor + meta footer with separator. It is not a Card variant — it has no chips, no badge system, no structured category link, and is designed borderless inside a hairline grid. Needs a semantic name (`ContentPreviewCard`? `FeatureCard`?), extraction into the design system, and Storybook coverage. Audit whether `TickerCard` and `Card (showFolio=false)` share enough structure to warrant a shared abstraction, or whether they remain parallel primitives serving different densities.

## Scope

**Item 1 — SectionLabel component:**
- [ ] Create `apps/web/src/design-system/components/section-label/SectionLabel.jsx` + `SectionLabel.module.css`
- [ ] Props: `as` (element — default `p`), `rule` (boolean — default `true`), `children`, `className`
- [ ] CSS: `rule=true` → flex + `::after { flex:1; height:2px; background: var(--st-color-ink) }` — exact match to current RecentContentSection pattern
- [ ] Replace `.heading` in `RecentContentSection.module.css` with `<SectionLabel>`
- [ ] Replace `.outcomeStripLabel` in `pages.module.css` with `<SectionLabel>`
- [ ] Remove now-redundant CSS from both files
- [ ] Add Storybook story: `SectionLabel` with rule / without rule / as h2 / as p

**Item 2 — Chip Storybook colorways:**
- [ ] Open Storybook at `/primitives/chip` and audit stories against light-pink-moon + dark-pink-moon
- [ ] Verify all named color variants (pink, seafoam, lime, violet, amber, grey) render correctly in both themes
- [ ] Confirm `variant="tag"` neutral chip is the canonical reference chip (no dot, neutral border/bg)
- [ ] Confirm `variant="status"` stories cover all six dot states: evergreen, validated, exploring, active, draft, deprecated
- [ ] Add `featured` state story for `variant="tag"`
- [ ] Update any story fixtures using stale Pink Moon palette references

**Item 3 — StatTile chip prop story:**
- [ ] Find or create `StatTile.stories.jsx` in Storybook
- [ ] Add story: `WithChip` — shows `chip="measured"` alongside standard metric tile
- [ ] Add story: `WithBeforeAfter` — shows `sub` (valueBefore) + `value` (valueAfter) pattern

**Item 4 — Grid primitive:**
- [ ] Phase 0 required: produce `docs/drafts/SUG-96-grid-primitive.html` mock showing both spacing variants (`"card"` and `"tile"`) with sample content before any JSX is written
- [ ] Decide API: `<Grid spacing="card" columns={3}>` / `<Grid spacing="tile" columns={4}>` — or CSS utility classes with custom properties
- [ ] `spacing="tile"` must apply `background: var(--st-color-rule-accent)` + `gap: 1px` + outer border on the container (the bg-through-gap technique)
- [ ] Audit call sites: `TrustReportSection.module.css` (`.tileGrid`), `pages.module.css` (`.outcomeGrid`), `globals.css` (`.st-layout-grid`)
- [ ] Migrate all three call sites to the shared primitive
- [ ] Add Storybook stories: `CardSpacing` (24px gap, Card children), `TileSpacing` (1px hairline, StatTile children)
- [ ] Document the bg-through-gap pattern per CLAUDE.md convention (annotation on each child's `background` declaration)

**Item 5 — ContentPreviewCard rename + DS extraction:**
- [ ] Phase 0 required: produce `docs/drafts/SUG-96-content-preview-card.html` mock — show the card standalone (not embedded in a grid) to confirm the borderless assumption is still correct without grid context
- [ ] Agree on semantic name (candidates: `ContentPreviewCard`, `FeatureCard`, `PreviewCard`) — not placement-specific
- [ ] Audit: can `TickerCard` and `Card (showFolio=false)` share a base? Document the structural delta before deciding (different: type label colour, no chips, no badge, single meta string vs structured footer)
- [ ] Extract from `RecentContentSection.jsx` into `apps/web/src/design-system/components/<name>/`
- [ ] Update `RecentContentSection.jsx` to import from the new location
- [ ] Add Storybook story: default, loading skeleton, without descriptor, long title
- [ ] Rename `RecentContentSection` in Storybook from `patterns/recentcontentsection` to `patterns/<semantic-name>`

## Use case definitions (SectionLabel)

| Variant | `rule` | `as` | Example use | Context |
|---|---|---|---|---|
| Structured heading | `true` | `h2` or `p` | RECENTLY SHIPPED ──, OUTCOMES ── | Demarcates data-dense or structured blocks |
| Plain field label | `false` | `p` | CHALLENGE, PUBLISHED | Inline context label above a content block |

Rule of thumb: if the heading introduces a data grid, stat strip, or card collection, use `rule=true`. If it labels a prose block or a single field, use `rule=false`.

## Phase 0 gate

Items 4 and 5 require HTML mocks before any JSX is written (per CLAUDE.md §Phase 0 — new visual surfaces on existing pages). Mock files:
- `docs/drafts/SUG-96-grid-primitive.html` — both Grid spacing variants
- `docs/drafts/SUG-96-content-preview-card.html` — ContentPreviewCard standalone + in hairline grid

Items 1–3 (SectionLabel, Chip stories, StatTile story) are CSS/Storybook-only — no Phase 0 gate required.

## Non-Goals

- Status chip color tokens per-state (`--st-status-success-*` etc.) — deferred; these tokens don't exist and adding them is a separate pass
- Evidence chip per-state coloring (measured=green, estimated=amber, qualitative=grey) — deferred to same token pass
- Chip component migration from web adapter to `packages/design-system` — deferred to a platform epic

## Related

- **SUG-88:** Ledger Tradition chip system — established the rule-dot system this epic builds on
- **SUG-91:** Case study outcomes narrative — surfaced the SectionLabel and StatTile chip gaps
- **SUG-87:** Dynamic Trust Report — original StatTile and tileGrid pattern
- **SUG-91:** Case study outcomes — surfaced tileGrid duplication, triggered post-mortem that added items 4–5
