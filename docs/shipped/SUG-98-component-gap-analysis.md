# SUG-98 — Component Gap Analysis: Renderer Stories, Thruline Audit + Phase B Component Parity

**Linear Issue:** [SUG-98](https://linear.app/sugartown/issue/SUG-98/component-gap-analysis-renderer-stories-thruline-audit)
**Status:** Done — shipped 2026-05-07
**Priority:** Normal
**Tags:** Design System · Tooling

**Chromatic:** Build 29 passed — 242 stories / 47 components / 169 visual changes accepted

---

## Background

During SUG-89 (Chromatic parity stories), a component governance audit produced the registry at `docs/conventions/component-registry.md`. The registry maps every DS primitive, web adapter, and app-level composite across web / studio / Storybook surfaces.

The audit surfaced a repeating gap: inline renderers inside `PageSections.jsx` have no standalone Storybook stories. These are content section types that are rendered via a `switch (_type)` block rather than extracted into named components. VRT coverage for them comes only from the `Layout/PageSections` composite story, which exercises a fixed slice of content and will not catch a renderer-specific regression.

The registry also established the rule that web adapter stories are only justified when the adapter adds **visually distinct behaviour** vs the DS primitive. This rule needs a one-time verification pass across the 10+ adapters to confirm they are all thin shims, and to document any that aren't.

**Phase B addition (scoped 2026-05-06, following SUG-101):** The DS package mirror sync surfaced three unresolved component parity decisions. These are architectural decisions, not style decisions, which is why they belong in a Claude Code audit rather than a Claude Design sync. They are included here because the thruline audit (Phase 2) naturally surfaces the same component boundaries — resolving them together avoids a second pass over the same ground.

---

## Scope

### Phase 1 — Renderer story coverage

Add standalone Storybook stories for the 5 inline renderer gaps identified in the registry:

| Schema type | Current location | Story target |
|-------------|-----------------|--------------|
| `textSection` | `PageSections.jsx` switch block | `Patterns/TextSection` |
| `mermaidSection` | `PageSections.jsx` switch block | `Patterns/MermaidSection` |
| `imageGallery` | `PageSections.jsx` switch block | `Patterns/ImageGallery` |
| `citedBlock` | `PageSections.jsx` switch block | `Patterns/CitedBlock` |
| `statTileSection` | `PageSections.jsx` switch block | `Patterns/StatTileSection` |

Each story must:
- Cover the default state and at least one edge case (empty array, single item, long text)
- Have `chromatic: { disableSnapshot: false }` at meta level
- Use fixture data (no live Sanity fetch)

### Phase 2 — Thruline verification

For each DS primitive with a web adapter (16 pairs as of v0.23.10), confirm:

1. The adapter contains no CSS additions beyond the DS primitive's module
2. The adapter contains no JSX structure not present in the DS primitive
3. Any behavioural delta (e.g. `<Link to>`) is documented in the registry notes column

Flag any adapter that adds undocumented visual behaviour. If visual additions are found, either:
- Extract them into the DS primitive as a new prop (preferred), or
- Add a standalone web adapter story documenting the delta

### Phase 3 — Registry close-out

Update `docs/conventions/component-registry.md`:
- Replace all `❌` entries with ✅ (story added) or a documented rationale
- Update the "Last updated" line with current version

### Phase 4 — Component parity decisions (Phase B)

Three unresolved architectural questions from the DS package mirror sync. For each, the deliverable is a **decision + execution**, not just a recommendation.

**Decision 6 — DS-only components: port or remove?**

Four components exist in `packages/design-system/src/components/` but have no web adapter in `apps/web/src/design-system/components/`:

| Component | DS location | Web adapter? | Question |
|-----------|------------|--------------|---------|
| `Grid` | `packages/design-system/src/components/Grid/` | No | Port to web adapter, or remove from DS? |
| `SectionContainer` | `packages/design-system/src/components/SectionContainer/` | No | Port, or remove? |
| `SectionLabel` | `packages/design-system/src/components/SectionLabel/` | No | Port (web has its own `apps/web/src/design-system/components/section-label/`), or consolidate? |
| `Tile` | `packages/design-system/src/components/Tile/` | No | Port, or remove? |

Audit approach: read the DS component, check if the web app already has an equivalent (web has `SectionLabel` and `Tile` adapters from prior epics — verify), then decide: (a) port + create web adapter, (b) remove from DS package if the web version is canonical, or (c) document as DS-only with rationale.

**Decision 7 — ContentNav: implement or delete stories?**

Storybook has stories for `ContentNav` but the component may not exist as a standalone in either the DS package or the web adapter layer. Audit: does the component exist? If yes, confirm its location and ensure the story imports from the right place. If no, delete the orphaned stories.

**Decision 8 — FilterBar: promote to DS or accept web-only?**

`FilterBar` exists in `apps/web/src/design-system/components/` (web adapter layer) but has no DS primitive in `packages/design-system/src/components/`. It has Storybook stories. Decision: (a) port a DS primitive version to `packages/design-system/src/components/FilterBar/` so it follows the standard two-layer architecture, or (b) formally document it as a web-only component in the registry with a rationale (e.g. "tightly coupled to React Router and Sanity query patterns — not portable to DS package").

---

## Out of scope

- New components or visual redesigns
- Studio schema changes
- Extracting inline renderers from `PageSections.jsx` into named files (a separate refactor concern)
- Token hygiene (off-scale colors, legacy alias removal) — that is SUG-102, gated on SUG-86

---

## Acceptance criteria

- [x] All 5 renderer story gaps have standalone Storybook stories
- [x] All stories render in Storybook without errors
- [x] `Layout/PageSections` snapshot story still passes (no regressions)
- [x] Thruline audit complete — all 13 adapters reviewed, findings in registry notes
- [x] Registry updated: zero `❌` entries
- [x] `pnpm validate:tokens` passes
- [x] Chromatic VRT run, baselines approved (Build 29)
- [x] **Phase B decisions documented and executed:** Grid/SectionContainer/SectionLabel/Tile confirmed web-adapter-only (no DS primitive needed); registry updated with rationale
- [x] **ContentNav** orphaned DS stories deleted; story moved to `Patterns/ContentNav` (plain-`<a>` demo, no router dependency)
- [x] **FilterBar** documented as web-only with rationale (React Router + Sanity query coupling)

---

## Phases

- [x] **Phase 0** — No mockup required (stories follow existing patterns; no new visual format)
- [x] **Phase 1** — Renderer stories (5 files)
- [x] **Phase 2** — Thruline verification (13 adapter pairs)
- [x] **Phase 3** — Registry close-out
- [x] **Phase 4** — Component parity decisions (Phase B: items 6, 7, 8)
