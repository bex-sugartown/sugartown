---
**Epic:** SUG-96 — DS component polish — SectionLabel + Chip Storybook colorways
**Linear Issue:** [SUG-96](https://linear.app/sugartown/issue/SUG-96)
**Status:** Backlog
**Priority:** 🔵 Low
**Merge strategy:** (a) Merge-as-you-go — each item ships independently
---

# SUG-96 — DS component polish: SectionLabel + Chip Storybook colorways

Four DS cleanup items surfaced during SUG-91 close-out. No schema or Sanity content changes.

## Background

**SectionLabel**: The mono-caps heading with extending horizontal rule is implemented twice — in `RecentContentSection.module.css` (`.heading`) and `pages.module.css` (`.outcomeStripLabel`). Both sets of CSS are identical. The pattern needs a shared component before a third call site appears.

**Chip colorways**: Storybook Chip stories (`/primitives/chip`) were authored before the Ledger Tradition font and palette switch (SUG-63). The stories render correctly in production but the story fixtures may reference stale color names or show mismatched palette comparisons. The `variant="tag"` neutral chip (the canonical evidence chip used in StatTile) is the reference the stories should anchor to.

**StatTile chip prop**: SUG-91 added a `chip` prop to StatTile that renders a neutral `<Chip variant="tag">` for evidenceType labels. No Storybook story covers it.

**tileGrid pattern**: The 1px-gap grid (background: `--st-color-rule-accent`, tiles covering gap with `--st-stat-tile-bg`) is implemented inline in both `TrustReportSection` and `CaseStudyPage`. A third call site will appear. Needs a shared CSS utility class or a wrapper component before that happens.

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

**Item 4 — tileGrid shared pattern:**
- [ ] Audit call sites: `TrustReportSection` (TickerCard), `CaseStudyPage` (outcomeGrid), check for any others
- [ ] Decide: CSS utility class (`.tileGrid` in `design-system/styles/`) vs wrapper component (`TileGrid.jsx`)
- [ ] Extract to shared location, update both existing call sites to reference it
- [ ] Document the bg-through-gap pattern per CLAUDE.md convention (annotation on each child's `background` declaration)

## Use case definitions (SectionLabel)

| Variant | `rule` | `as` | Example use | Context |
|---|---|---|---|---|
| Structured heading | `true` | `h2` or `p` | RECENTLY SHIPPED ──, OUTCOMES ── | Demarcates data-dense or structured blocks |
| Plain field label | `false` | `p` | CHALLENGE, PUBLISHED | Inline context label above a content block |

Rule of thumb: if the heading introduces a data grid, stat strip, or card collection, use `rule=true`. If it labels a prose block or a single field, use `rule=false`.

## Non-Goals

- Status chip color tokens per-state (`--st-status-success-*` etc.) — deferred; these tokens don't exist and adding them is a separate pass
- Evidence chip per-state coloring (measured=green, estimated=amber, qualitative=grey) — deferred to same token pass
- Chip component migration from web adapter to `packages/design-system` — deferred to a platform epic

## Related

- **SUG-88:** Ledger Tradition chip system — established the rule-dot system this epic builds on
- **SUG-91:** Case study outcomes narrative — surfaced the SectionLabel and StatTile chip gaps
- **SUG-87:** Dynamic Trust Report — original StatTile and tileGrid pattern
