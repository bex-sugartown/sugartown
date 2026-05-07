# SUG-103 — Publish component registry to platform/DS documentation

**Linear Issue:** [SUG-103](https://linear.app/sugartown/issue/SUG-103/publish-component-registry-to-platformds-documentation)
**Status:** Backlog
**Priority:** Medium
**Merge strategy:** TBD at epic open

---

## Background

The component registry (`docs/conventions/component-registry.md`) was completed as part of SUG-98. It maps every DS primitive, web adapter, app-level composite, inline renderer, and layout component — including Storybook story locations, Studio schema objects, and architectural notes. It is the single source of truth for component coverage across the three app surfaces.

Currently it lives only in the repo. It is only discoverable by people with repo access, and has no rendered form. To be useful as platform documentation — for collaborators, clients, or the public design system record — it needs a home on the Sugartown platform.

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
- [ ] Registry content is publicly accessible at a canonical URL
- [ ] All tables render correctly on desktop and mobile
- [ ] Page is linked from platform nav or docs index
- [ ] If auto-generated: CI keepalive in place
- [ ] Chromatic VRT for the new page/section

---

## Dependencies

- `/platform` or `/docs` namespace must be routed (IA brief Phase 2 — currently deferred)
- SUG-98 component registry must stay current (ongoing maintenance, not a blocker)

---

## Notes

- The registry is the right artifact to surface first for design system documentation. It demonstrates the full three-layer architecture (DS primitives → web adapters → app composites) in a single reference.
- The auto-generated route option is the most durable: the registry will continue to evolve as new components are added, and a manual-sync Sanity page will drift.
- Phase 0 should include a decision on whether this page lives inside the existing `platform` Sanity page type or needs a new document type (e.g. `docsPage`).
