# SUG-98 — Component Gap Analysis: Renderer Stories + Thruline Audit

**Linear Issue:** [SUG-98](https://linear.app/sugartown/issue/SUG-98/component-gap-analysis-renderer-stories-thruline-audit)
**Status:** Backlog
**Priority:** Normal
**Tags:** Design System · Tooling

---

## Background

During SUG-89 (Chromatic parity stories), a component governance audit produced the registry at `docs/conventions/component-registry.md`. The registry maps every DS primitive, web adapter, and app-level composite across web / studio / Storybook surfaces.

The audit surfaced a repeating gap: inline renderers inside `PageSections.jsx` have no standalone Storybook stories. These are content section types that are rendered via a `switch (_type)` block rather than extracted into named components. VRT coverage for them comes only from the `Layout/PageSections` composite story, which exercises a fixed slice of content and will not catch a renderer-specific regression.

The registry also established the rule that web adapter stories are only justified when the adapter adds **visually distinct behaviour** vs the DS primitive. This rule needs a one-time verification pass across the 10+ adapters to confirm they are all thin shims, and to document any that aren't.

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

---

## Out of scope

- New components or visual redesigns
- Studio schema changes
- Extracting inline renderers from `PageSections.jsx` into named files (a separate refactor concern)

---

## Acceptance criteria

- [ ] All 5 renderer story gaps have standalone Storybook stories
- [ ] All stories render in Storybook without errors
- [ ] `Layout/PageSections` snapshot story still passes (no regressions)
- [ ] Thruline audit complete — all 16 adapters reviewed, findings in registry notes
- [ ] Registry updated: zero `❌` entries
- [ ] `pnpm validate:tokens` passes
- [ ] Chromatic VRT run, baselines approved

---

## Phases

- [ ] **Phase 0** — No mockup required (stories follow existing patterns; no new visual format)
- [ ] **Phase 1** — Renderer stories (5 files)
- [ ] **Phase 2** — Thruline verification (16 adapter pairs)
- [ ] **Phase 3** — Registry close-out
