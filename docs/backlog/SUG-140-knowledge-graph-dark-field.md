---
**Epic:** SUG-140 — Knowledge Graph — Dark Field
**Linear Issue:** [SUG-140](https://linear.app/sugartown/issue/SUG-140/knowledge-graph-dark-field)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-140 — Knowledge Graph — Dark Field

Darken the graph canvas to deep midnight so coloured node dots read with high contrast, while surrounding panel chrome (toolbar, sidebar) stays in light-pink-moon.

## Background

The KG graph canvas currently uses `--st-graph-bg: var(--st-color-bg-canvas)` — a light surface in pink-moon. On a light field, mid-grey category nodes, deep-maroon case-study nodes, and edge lines all have low contrast and are hard to read. The design direction (confirmed via HTML mock) calls for a permanently dark graph field embedded in the otherwise-light page: deep midnight background, lifted node colours for dim types, and dark-mode styling for the overlay chrome (zoom controls + legend card) so they read as part of the field rather than bright cut-outs. The toolbar, chip filters, item count, and Selected sidebar stay light-pink-moon.

## Objective

After this epic the KG graph canvas background is `--st-color-midnight-950` (`#0a0f1a`), all five node types are clearly distinguishable on the dark field, edge lines and hub labels are visible but quiet, and the two overlay elements (zoom controls, legend card) use dark surfaces and light text so they feel native to the field. No other page, component, or theme file is affected. Changes are token-only — no raw hex in component CSS.

## Scope

- [ ] Add `--st-kg-stage-bg` token pointing to `--st-color-midnight-950` — layer: tokens
- [ ] Add `--st-kg-edge-member-dark`, `--st-kg-edge-lateral-dark`, `--st-kg-label-color`, `--st-kg-label-project-color` tokens for legibility on dark — layer: tokens
- [ ] Add `--st-kg-zoom-bg`, `--st-kg-zoom-color`, `--st-kg-zoom-border`, `--st-kg-zoom-hover-color`, `--st-kg-zoom-hover-border` tokens for zoom control overlay — layer: tokens
- [ ] Add `--st-kg-legend-bg`, `--st-kg-legend-border`, `--st-kg-legend-color`, `--st-kg-legend-dot-outline-border` tokens for legend overlay — layer: tokens
- [ ] Override `--st-kg-node-category` in light theme to `--st-color-softgrey-300` (lifted from `neutral-400/500`) — layer: theme
- [ ] Override `--st-kg-node-case` in light theme to `--st-color-maroon-400` (lifted from maroon/pink) — layer: theme
- [ ] Apply `--st-kg-stage-bg` to `.stage` in `KnowledgeGraph.module.css` — layer: frontend
- [ ] Apply edge/label tokens to SVG edge and label rules in `KnowledgeGraph.module.css` — layer: frontend
- [ ] Apply zoom overlay tokens to `.zoom` / `.zoomBtn` rules — layer: frontend
- [ ] Apply legend overlay tokens to `.legend` / `.legendItem` rules — layer: frontend
- [ ] Run `pnpm tokens:build` + `pnpm validate:tokens --strict-colors` — layer: tooling
- [ ] Confirm no visual change to toolbar, chip filters, count, and Selected sidebar — layer: QA

## Phases

Single-phase — all changes are pure token and CSS, no schema or content.

## Acceptance criteria

- [ ] Graph canvas background is `--st-color-midnight-950`; panel border, toolbar, and sidebar keep `--st-color-bg-surface`
- [ ] All five node types (project pink, category softgrey-300, article seafoam, node lime, case maroon-400) are clearly distinguishable on the dark field
- [ ] Edge lines and hub labels are visible but quiet; project hub labels remain pink
- [ ] Zoom controls show dark surface (`--st-color-midnight-700`), light text (`--st-color-softgrey-300`), and pink hover — no bright cut-out appearance
- [ ] Legend card shows dark surface, `--st-color-softgrey-400` label text, outline dot uses `--st-color-softgrey-400` border
- [ ] `pnpm validate:tokens --strict-colors` passes with zero violations
- [ ] No visual change to any page or component outside `KnowledgeGraph.module.css` and `theme.pink-moon.css` KG section
- [ ] Storybook story renders correctly on both `default` and `light-pink-moon` themes

## Technical notes

- **No raw hex**: all colour values must resolve through `--st-*` tokens. The mock HTML uses raw hex (`#141830`, `rgba(255,255,255,0.24)`) — these must be mapped to existing primitives before use in CSS.
- **Existing primitives confirmed present**: `--st-color-midnight-950` (#0a0f1a), `--st-color-white-20`, `--st-color-white-15`, `--st-color-white-60`, `--st-color-softgrey-300`, `--st-color-softgrey-400`, `--st-color-maroon-400`, `--st-color-midnight-700` — all exist in `tokens.css`. No new primitives needed.
- **Tokens to add to `tokens/source/tokens.json`**: `st-kg-stage-bg`, `st-kg-edge-member-dark`, `st-kg-edge-lateral-dark`, `st-kg-label-color`, `st-kg-label-project-color`, `st-kg-zoom-bg`, `st-kg-zoom-color`, `st-kg-zoom-border`, `st-kg-zoom-hover-color`, `st-kg-zoom-hover-border`, `st-kg-legend-bg`, `st-kg-legend-border`, `st-kg-legend-color`, `st-kg-legend-dot-outline-border`.
- **Node colour overrides in light theme**: `--st-kg-node-category` and `--st-kg-node-case` already have light-theme overrides in `theme.pink-moon.css` (lines 183–188). Update those values — do not add new overrides.
- **Key files**: `apps/web/src/components/KnowledgeGraph/KnowledgeGraph.module.css`, `apps/web/src/design-system/styles/theme.pink-moon.css`, `tokens/source/tokens.json`.
- **Activation audit**: read `KnowledgeGraph.module.css` fully before writing CSS — map every class name that touches the stage, edge lines, labels, zoom, and legend so no selector is missed.
- **Model & Mode**: `/model opusplan` — token design decisions benefit from a plan pass before execution.

## Model & Mode [REQUIRED]

`/model opusplan` — Opus plans the token naming and cascade, Sonnet executes the CSS and theme edits after plan-mode exit.

## Non-Goals

- A user-facing light/dark toggle for the graph field
- Restyling the toolbar, filter chips, item count, or Selected sidebar
- Touching `theme.light.css` or any global theme token
- Any change to the SiteGraphPage or KnowledgeGraphArchivePage outside the KG component

## Related

- **Linear:** [SUG-140](https://linear.app/sugartown/issue/SUG-140/knowledge-graph-dark-field)
- **Design mock:** `/Users/beckyalice/Downloads/Knowledge Graph.html` (local only, not committed)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
