# SUG-103 — Publish component registry to platform/DS documentation

**Linear Issue:** [SUG-103](https://linear.app/sugartown/issue/SUG-103/publish-component-registry-to-platformds-documentation)
**Status:** Backlog
**Priority:** Medium
**Merge strategy:** TBD at epic open

---

## Background

The component registry (`docs/conventions/component-registry.md`) was completed as part of SUG-98. It maps every DS primitive, web adapter, app-level composite, inline renderer, and layout component — including Storybook story locations, Studio schema objects, and architectural notes. It is the single source of truth for component coverage across the three app surfaces.

**Registry governance upgrade (2026-05-16, SUG-119 post-mortem):** The registry was extended in this post-mortem to become a key governance artifact:
- Added **dark mode** health column to all component tables — ⚠️/❌/✅ per component
- Added RoadmapTable, LaneHeader, DataTable with explicit gap flags
- Registry update is now a **required step** in every epic that creates, retires, or changes a component (added to `docs/epic-template.md` Pre-Execution Gate + Visual QA gate)
- The registry is now a creation-gate artifact, not a post-hoc record

The goal of SUG-103 is to make this governance visible publicly — so the health matrix, gap flags, and coverage map are discoverable by collaborators and clients, not just by people with repo access.

---

## Scope

### Phase 0 — Decide the rendering strategy (required before any code)

Evaluate and select one approach:

| Option | Durability | Effort | Notes |
|--------|-----------|--------|-------|
| **Auto-generated route** — build script reads `component-registry.md`, emits a static page | Highest — no manual sync | Medium | Best long-term option; registry stays in repo as source of truth |
| **Sanity-backed page** — registry content authored in Sanity under `/platform` or `/docs` | Medium — requires manual sync on registry changes | Low-Medium | Fits existing platform page architecture |
| **Static MDX/markdown route** — new route in web app that imports the md file directly | High — imports live file | Low | Simplest; no Sanity dependency |
| **Embedded section** — registry tables as a section on an existing `/platform` page | Medium | Low | Less discoverable; tables may be too dense for inline section |

Phase 0 deliverable: HTML mock of the rendered registry page. Must show: table layout, section headers, coverage symbols, notes column, and mobile treatment for wide tables.

### Phase 1 — Implementation

- Wire chosen rendering strategy
- Route: `/platform/design-system` (preferred) or `/docs/design-system` (if `/docs` namespace ships before this epic)
- Page must be reachable from platform nav or a docs index
- Tables must be readable on mobile (horizontal scroll or responsive collapse)
- Registry file remains in `docs/conventions/` as the authoritative source — never duplicate content

### Phase 2 — Keepalive (if auto-generated route chosen)

- CI step or build hook to regenerate the page when `component-registry.md` changes
- Validate that generated output matches source on every build

---

## Acceptance criteria

- [ ] Phase 0 mock reviewed and approved
- [ ] Registry content is publicly accessible at a canonical URL — including dark mode health column and gap flags
- [ ] All tables render correctly on desktop and mobile
- [ ] Page is linked from platform nav or docs index
- [ ] If auto-generated: CI keepalive in place — so that epic-time registry updates in `docs/conventions/component-registry.md` are immediately reflected on the public page without a manual Sanity publish step
- [ ] Chromatic VRT for the new page/section
- [ ] ⚠️ gap indicators are visually distinct on the rendered page (not just plain text symbols) — gaps surface as actionable debt, not decoration

---

## Dependencies

- `/platform` or `/docs` namespace must be routed (IA brief Phase 2 — currently deferred)
- SUG-98 component registry must stay current (ongoing maintenance, not a blocker)

---

## Notes

- The registry is the right artifact to surface first for design system documentation. It demonstrates the full three-layer architecture (DS primitives → web adapters → app composites) in a single reference.
- The auto-generated route option is the most durable: the registry will continue to evolve as new components are added, and a manual-sync Sanity page will drift.
- Phase 0 should include a decision on whether this page lives inside the existing `platform` Sanity page type or needs a new document type (e.g. `docsPage`).
