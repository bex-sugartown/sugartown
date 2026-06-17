# Release Notes — v0.27.0

**Date:** 2026-06-17
**Scope:** apps/web, apps/studio, packages/design-system, apps/storybook

---

## What this release is

v0.27.0 is the DS primitive expansion cycle — the largest single cycle since the monorepo was set up. Ships the full button redesign, a complete set of form controls, the IconButton primitive, a mobile-first drawer system, PageHeader identity bands, the ContentList renderer, glossary infrastructure, SEO auto-generation, and the design-code documentation pipeline. Aggregates v0.26.1–v0.26.26.

---

## What changed

### IconButton primitive

Square (4px radius) or circle button. Solid `--st-icon-button-bg` background — a deliberate bypass of `--st-color-bg-surface` and `--st-color-bg-surface-strong`, which resolve to glassmorphism `rgba()` values in dark-pink-moon. Muted border at rest, brand-pink on hover. `ThemeToggle`, all archive layout toggles, and the KG zoom controls are now on this primitive. Bespoke `.zoomBtnCanvas` overrides and `--st-kg-zoom-*` tokens deleted.

### Form controls

`Select`, `Checkbox`, `Radio`, `Switch` — full token support; DS primitives in `packages/design-system` and web adapters in `apps/web`.

### Button redesign

Baseline rule (3px `border-bottom`) removed across all three variants. Ghost tertiary variant added. `icon` / `iconAfter` props available on all variants for inline icon rendering.

### Mobile drawer system

FilterBar collapses behind a sticky chip with active-filter count badge below 768px; full filter set available in a Drawer. Page sidebar collapses into a Drawer with a `ContentsStrip` trigger chip. `--st-header-height` tracked dynamically via ResizeObserver. `PageSidebar` and `PlatformSidebar` wired.

### PageHeader

Full-width identity band for archive, entity, and taxonomy pages. Props: `italic`, `eyebrow`, `children`, `tint`. Migrated to 6 production pages.

### Glossary system

`glossaryTerm` schema live; `/glossary` archive and `/glossary/:slug` detail pages; `glossaryTermRef` PT annotation with hover popover; `AlphaFilter` + `LetterSectionHeader` in place. 41 terms published (up from 17), including 8 Bextionary entries. `Epistemic Status` field removed from schema — all terms are evergreen.

### ContentList / ListItem

Content-agnostic list primitive replacing card-as-list-row across archive list mode, entity pages, and taxonomy detail. Dark hover with lime-100 accent; vertical column rule repaints on hover.

### SEO auto-generation

`SeoHead` shorthand props; `resolveSeo` resolves title from `term` / `name` / `shortName` with `definition` body fallback; 55-document `autoGenerate` rollout.

### Design-code pipeline

`docs/conventions/design-handoff-template.md`; evaluation gate in CLAUDE.md; content-model codegen script covering 11 types and 176 fields; `/platform/design-system/content-models` page live.

### Storybook

`Pages/` category introduced; production-accurate stories for all five page templates; `IconButton`, `Pill`, `SegmentedControl` stories; Documentation Template System with `DocSection`, `DoDontGrid`, `TokenGroup` helpers and a 14-section reference story.

---

## Fixes

- KG toolbar active button: `disabled` attribute removed — was applying `opacity: 0.45` via IconButton CSS, washing out the pink active state.
- KG zoom controls: zoom container scoped to `data-theme="dark-pink-moon"` so buttons render dark regardless of page theme.
- `--st-icon-button-bg` hover state: was `--st-color-bg-surface-strong` (`rgba(255,255,255,0.10)` in dark-pink-moon glassmorphism); now solid `midnight-700`.
- `filterStrip` border-bottom weight and `position: sticky` corrected (was incorrectly `fixed`).

---

## Removed

- `ContactForm` and `TwoColumnLayout` components deleted.
- `.narrativeHeading` CSS class deleted.
- Dead archive components and entity-folio CSS removed.

---

## Not in this release

- SUG-178 AI-generated image badge — `aiGenerated`/`aiTool` fields exist on `richImage` schema but are not yet projected or rendered
- Chromatic VRT baseline update deferred

---

## Validator state at release

```
pnpm validate:tokens        ✅ all var(--st-*) references resolve
pnpm validate:tokens:strict ✅ no hardcoded color values
pnpm validate:style-mirror  ✅ DS style mirrors in sync
pnpm lint                   ✅ no ESLint errors
```
