# SUG-103 — Publish component registry to platform/DS documentation

**Linear Issue:** [SUG-103](https://linear.app/sugartown/issue/SUG-103/publish-component-registry-to-platformds-documentation)
**Status:** Done
**Priority:** Medium
**Shipped:** 2026-05-16 · v0.23.32
**Merge strategy:** Single close-out on main

---

## Background

The component registry (`docs/conventions/component-registry.md`) was completed as part of SUG-98. It maps every DS primitive, web adapter, app-level composite, inline renderer, and layout component — including Storybook story locations, Studio schema objects, and architectural notes. It is the single source of truth for component coverage across the three app surfaces.

**Registry governance upgrade (2026-05-16, SUG-119 post-mortem):** The registry was extended to become a key governance artifact:
- Added **dark mode** health column to all component tables
- Added RoadmapTable, LaneHeader, DataTable with explicit gap flags
- Registry update is now a **required step** in every epic that creates, retires, or changes a component
- The registry is now a creation-gate artifact, not a post-hoc record

The goal of SUG-103 was to make this governance publicly visible — discoverable by collaborators and clients, not just people with repo access.

---

## Decision: auto-generated route (Phase 0 resolved)

**Chosen strategy:** Static MDX/markdown route — `?raw` Vite import reads `component-registry.md` directly at build time. No Sanity dependency. No manual sync. Registry stays in repo as source of truth.

**Route:** `/platform/design-system/registry`

**Parser:** `apps/web/src/lib/registryParser.js` — parses MD into `{ heading, intro, table }` sections. Each row returns `{ cells, isRetired }`. Retired rows (`~~Name~~`) render at 0.45 opacity.

---

## Scope — shipped

- [x] Phase 0: auto-generated route chosen; HTML mock reviewed and approved
- [x] `DesignSystemRegistryPage.jsx` at `/platform/design-system/registry`
- [x] `registryParser.js` — MD → structured sections with retired-row detection
- [x] `SectionLabel` per registry section with component count kicker
- [x] Coverage key legend (✅ / ⚠️ / —) rendered below the source-of-truth callout
- [x] Source-of-truth `Callout` with `title="Source of truth"` in left column
- [x] All tables render with `<Table tone="subdued" density="compact">`
- [x] Retired/deprecated/deleted rows muted at `opacity: 0.45`
- [x] Coverage columns render emoji + path as plain text (no chip wrapper)
- [x] Studio schema object cells follow coverage key convention (✅ prefix where schema exists)
- [x] Page linked from platform sidebar (Design System section)
- [x] Mobile: `overflow-x: auto` on TableWrap handles wide tables
- [x] Auto-generated — build-time `?raw` import; no CI keepalive required (any update to MD is immediately reflected on next build/deploy)
- [ ] Chromatic VRT — deferred; annotated as pending

<!-- Chromatic: pending -->

---

## Notes

- `registryParser.js` detects retired rows from the raw MD line before `stripMarkdown` runs: `/^\|\s*~~/.test(l)`. This is the correct detection order — strip happens after.
- `~~Name~~` in the first column cell is the convention for deprecated/retired/deleted components.
- Registry update is mandatory at epic close-out; see `docs/conventions/component-registry.md` governance notes.
