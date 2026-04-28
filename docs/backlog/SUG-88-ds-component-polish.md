---
**Epic:** SUG-88 — DS Component Polish — chip color system, MetadataCard Ledger dark mode, callout color schemes
**Linear Issue:** [SUG-88](https://linear.app/sugartown/issue/SUG-88/ds-component-polish-chip-color-system-metadatacard-ledger-dark-mode)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-88 — DS Component Polish — chip color system, MetadataCard Ledger dark mode, callout color schemes

Three DS components have surface-specific visibility or Ledger Tradition treatment gaps in both light and dark modes: chips (bright transparent-bg color variants break on some surfaces — e.g. lime status badge), MetadataCard (missing Ledger density in dark mode and missing Storybook full-width story), and callout (color schemes need an industry-standard approach in both modes). Phase 0 mock required before implementation.

## Background

TODO — why this exists, what problem it solves, what the current state is.

Reference mocks:
- `docs/drafts/SUG-78-archive-mock.html` — archive card + chip patterns
- `docs/drafts/SUG-80-callout-ledger.html` — callout Ledger treatment (prior Phase 0)
- Storybook screenshots: ContentCard and MetadataCard light/dark, Chip color rows

## Scope

TODO — bullet list of what's in scope.

- [ ] **Chips** — replace bright transparent-bg color variants with a system that works on both light and dark surfaces. Same shape and type scale, different color approach. Scope covers all chip color variants (status, tag, tool, evolution, etc.).
- [ ] **MetadataCard** — apply Ledger Tradition treatment in dark mode. Add Storybook full-width story to match local web rendering.
- [ ] **Callout** — revise color scheme in both light and dark modes to an industry-standard approach. New Phase 0 mock required.

## Phases

**Phase 0 — Mock gate (blocking)**
- HTML mock covering: chip color system across light + dark surfaces, MetadataCard dark Ledger treatment, callout revised color variants
- No implementation code until mock is reviewed and Phase 0 checkboxes are signed off

**Phase 1 — Chip color system**
- TODO

**Phase 2 — MetadataCard dark mode + Storybook story**
- TODO

**Phase 3 — Callout color scheme**
- TODO

## Acceptance criteria

- [ ] Phase 0 mock signed off before any implementation begins
- [ ] All chip color variants readable on both `--st-color-canvas` (light) and `--st-color-surface-dark` (dark) surfaces
- [ ] Lime status badge readable in both modes (current failure case)
- [ ] MetadataCard dark mode matches Ledger Tradition structural treatment
- [ ] Storybook MetadataCard has full-width story matching local web variant
- [ ] Callout color scheme passes WCAG AA contrast in both modes
- [ ] `pnpm validate:tokens` — 0 errors
- [ ] `pnpm validate:tokens --strict-colors` — 0 errors
- [ ] Chromatic VRT approved
- [ ] Storybook stories updated for all three components

## Technical notes

TODO — constraints, dependencies, known gotchas.

- All color changes must go through `--st-*` tokens. No raw hex in component CSS.
- Both token files (`apps/web/src/design-system/styles/tokens.css` and `packages/design-system/src/styles/tokens.css`) must stay in sync.
- Chip color system: consider adopting a semantic token layer (`--st-chip-{intent}-{surface}-{role}`) rather than per-color classes to make cross-surface behaviour predictable.
- Callout: review Material Design, GitHub Primer, and Radix color system approaches for industry-standard semantic color pairing before speccing tokens.

## Related

- **Linear:** [SUG-88](https://linear.app/sugartown/issue/SUG-88/ds-component-polish-chip-color-system-metadatacard-ledger-dark-mode)
- SUG-80 — prior callout Ledger structural work
- SUG-78 — Ledger Tradition DS refresh (archive + card)
- SUG-68 — token enforcement (established strict-colors rule)
