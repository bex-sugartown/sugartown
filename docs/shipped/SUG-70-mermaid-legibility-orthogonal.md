**Linear Issue:** [SUG-70](https://linear.app/sugartown/issue/SUG-70/mermaid-diagram-legibility-column-breakout-orthogonal-arrows)

## EPIC NAME: Mermaid diagram legibility — column breakout + orthogonal arrows

---

## Context

**Why this epic exists:**
Diagrams on `/platform` (Architecture Flow, Release Process, Token Architecture) are unreadable inside the 760px detail-context column. Two related defects:

1. **Width.** The 760px max-width is right for prose and wrong for flowcharts. Diagram A crushes 15+ nodes into a column that cannot hold them; node labels wrap; arrows overlap.
2. **Edge routing.** Even at full width, edges curve unpredictably because the default Mermaid renderer (dagre) does not produce true orthogonal routing. The Pink Moon aesthetic ("sharp neutrals, honest structure") wants 90° gridded arrows, not soft Bézier curves.

**Recent related commits:**
- `14ee2b0` — Token-driven Mermaid theme palette (light/dark switch).
- `de462d9` — Strip inline `style X fill:...` and `classDef` directives from Sanity Mermaid source so the themed palette is not overridden.

These two commits unlocked theming consistency. This epic finishes the job by tackling layout + routing.

**Doc types in scope:** none (CSS + schema field on `mermaidSection`, plus content updates in Sanity).

---

## Phase 0 — Renderer + routing investigation

> No CSS or schema work before Phase 0 sign-off.

**Phase 0 deliverables:**

1. **Spike**: render Diagram A in a Storybook sandbox with each combination of:
   - `defaultRenderer: 'dagre' | 'elk'`
   - `flowchart.curve: 'basis' | 'linear' | 'step' | 'stepBefore' | 'stepAfter' | 'monotoneX'`
   - `flowchart.htmlLabels: true | false`
   - ELK-only: `'elk.edgeRouting': 'ORTHOGONAL' | 'SPLINES' | 'POLYLINE'`
   Capture screenshots of the resulting arrow geometry. Lock in the winning combination and document the choice in the MermaidDiagram component header comment.
2. **Width pattern decision.** Confirm the breakout CSS (`margin-inline: calc(50% - 50vw + var(--st-page-gutter))`) plays nicely with `.detailContext`'s flex-column layout. If not, fall back to a wrapping `<div>` that escapes the parent via `position: relative; left: 50%; transform: translateX(-50%)`.
3. **Mobile contract.** Decide: do `wide` and `full` collapse to `column` below 768px, or do they overflow-scroll horizontally? Default recommendation: collapse — horizontal scroll on mobile is hostile.

---

## Scope

### Phase 1 — `width` schema field

- [ ] Extend `apps/studio/schemas/sections/mermaidSection.ts` with `width` field
  - Type: `string`, options: `['column', 'wide', 'full']`, default: `'column'`
  - Description: "Column width: 760px column (default), wide breakout (1080px), or full viewport"
- [ ] Update GROQ projection in `queries.js` to include `width`
- [ ] Update `MermaidDiagram` adapter in `PageSections.jsx` to pass `width` through
- [ ] Deploy schema (`npx sanity schema deploy`)

### Phase 2 — CSS breakout

- [ ] `PageSections.module.css` — add `wide` and `full` modifiers on `.mermaidSection`
- [ ] Wide: `max-width: min(1080px, calc(100vw - 2 * var(--st-page-gutter)))`
- [ ] Full: `max-width: calc(100vw - 2 * var(--st-page-gutter))`
- [ ] Both use the breakout `margin-inline` pattern locked in Phase 0
- [ ] Caption stays centered under the SVG
- [ ] Mobile collapse rule per Phase 0 decision

### Phase 3 — Renderer config

- [ ] Apply Phase 0 winning combination to `MermaidDiagram` initialization
- [ ] Add `'elk.edgeRouting': 'ORTHOGONAL'` to layout options if ELK won
- [ ] Document the chosen combination + reasoning in the component header comment (so future config changes know what to preserve)

### Phase 4 — Content update

- [ ] Set Diagram A and Diagram B on the platform page to `width: 'wide'` (Sanity content patch, separate commit from code changes per CLAUDE.md schema-change-isolation rule)

### Phase 5 — Optional pan/zoom lightbox (deferred)

- [ ] If Phase 1–3 don't produce legible diagrams at 4K, add svg-pan-zoom (~5kb) wrapper. Skip unless evidence demands it.

---

## Atomic Reuse Gate

1. **Existing patterns —** the breakout CSS pattern is standard "escape the prose column"; no new utility needed. The `width` schema enum follows the existing pattern of section variant fields (`textSection.layout`, `mediaSection.size`).
2. **Consumed everywhere —** `width` field is per-section in Sanity; every existing diagram defaults to `column` (no migration needed). New diagrams choose at author time.
3. **API composable —** `width: 'column' | 'wide' | 'full'` is a closed enum; renderer config is internal to `MermaidDiagram` and not exposed.

---

## Technical Constraints

- **Section Layout Contract (CLAUDE.md).** `wide` and `full` modifiers must zero their own external margin and fit inside `.detailContext`'s flex-column gap regime. Test against `/articles/test-preview-post`.
- **Schema commit isolation.** Per CLAUDE.md: schema changes get their own commit (`feat(studio):`), separate from web adapter and CSS commits.
- **Schema deploy.** After schema change, run `npx sanity schema deploy` from `apps/studio/` — MCP and Content Lake validate against deployed schema.
- **No re-authoring of Mermaid source** beyond the inline-style stripping already done in `de462d9`. The pipeline stays Mermaid; we tune its config and layout, not its input.
- **Token discipline.** Any new CSS values must reference `--st-*` tokens, not hex literals. Per SUG-68, the validator will catch this in CI once that epic ships.

---

## Acceptance Criteria

1. `mermaidSection` supports `width: column | wide | full` end-to-end (schema → GROQ → adapter → CSS).
2. All three `/platform` diagrams render legibly at 1024px and 1440px viewports without horizontal scroll.
3. Arrows are perpendicular/orthogonal across all three diagrams.
4. Mobile fallback: wide diagrams collapse to column (or scroll-wrap, per Phase 0 decision) — never overflow viewport.
5. Renderer config is documented in the MermaidDiagram component header comment.
6. At least one commit referencing SUG-70 on origin/main before Done.

---

## Non-Goals

- Re-authoring existing Mermaid source diagrams
- Theming changes (the 14ee2b0 token palette stays as-is)
- Hand-authored SVG replacements
- Pan/zoom lightbox (Phase 5, deferred unless evidence demands it)

---

## Rollback Plan

- Phase 1 (schema) — revert schema commit; existing content still validates because `width` defaults to `column`.
- Phase 2 (CSS) — revert per-component commit; diagrams render at column width as before.
- Phase 3 (renderer) — revert MermaidDiagram commit; renderer falls back to current ELK + step config.
- Phase 4 (content) — null out the `width` field on the two patched documents in Sanity.

Each phase independently revertable. No data migration.

---

## Definition of Done

- All acceptance criteria pass
- Storybook stories cover `column | wide | full` rendering
- Diagrams visually verified on `/platform` at 1024px, 1440px, and 390px
- Epic doc moved from `docs/backlog/` to `docs/shipped/`
- Linear SUG-70 transitioned to Done
