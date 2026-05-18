---
**Epic:** SUG-109 — Figma DS backwards-engineer — Code Connect + variables pipeline
**Linear Issue:** [SUG-109](https://linear.app/sugartown/issue/SUG-109/figma-ds-backwards-engineer-code-connect-variables-pipeline)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-109 — Figma DS backwards-engineer — Code Connect + variables pipeline

Populate the Sugartown Figma design file with component frames, Figma variables (mapped to `--st-*` tokens), and Code Connect mappings — backwards-engineered from the existing web/Storybook implementation — so the design-to-code pipeline is complete in both directions.

**Figma file:** https://www.figma.com/design/UmDfTJ7UMROKR9FWLWx9Yl/Sugartown-Design-System

## Background

The Sugartown design system lives entirely in code: 590 `--st-*` tokens (generated via Style Dictionary v5), 30+ components across `packages/design-system` and `apps/web/src/design-system`, all documented in Storybook. The Figma file (`UmDfTJ7UMROKR9FWLWx9Yl`) exists but contains only a minimal Foundations page with 7 color swatches, 6 type specimens, 6 spacing values, and 3 radius values — no component frames, no variables, no Code Connect.

This means the pipeline is one-directional: code is the source of truth, but Figma cannot consume or reflect it. There is no way to hand a designer a Figma file that matches the live implementation, no way to use Figma variables to drive token decisions, and no Code Connect linking Figma components to their React counterparts.

Style Dictionary v5 shipped in SUG-86, establishing `tokens/source/tokens.json` as the upstream source. This epic uses that foundation to close the loop: tokens.json → Figma variables → component frames → Code Connect → Storybook.

## Objective

After this epic, the Figma file reflects the full Sugartown DS: Figma variables map 1:1 to `--st-*` semantic tokens, every DS component has a Figma component frame with props matching the React API, and Code Connect mappings link each Figma component to its implementation file. Designers can work in Figma with confidence the values are live; developers get Figma-to-code suggestions in Dev Mode. The pipeline runs in both directions.

Layers touched: Figma (variables, components, Code Connect config) and `packages/design-system` (Code Connect annotation files). No Sanity schema changes. No web app changes. No token changes.

## Scope

### Phase 1 — Figma variables from tokens.json

- [ ] Audit `tokens/source/tokens.json` and map Tier-1 primitives to a Figma variable collection: `Primitives` — tooling: Figma MCP `use_figma`
- [ ] Create Tier-2 semantic variable collection in Figma: `Semantic` — map each `--st-color-*`, `--st-font-*`, `--st-space-*` token to a variable aliasing a Primitive — tooling: Figma MCP
- [ ] Create Pink Moon light + dark mode variable sets in Figma, matching `theme.pink-moon.css` overrides — tooling: Figma MCP
- [ ] Update existing Foundations swatches to reference Figma variables instead of hardcoded hex — tooling: Figma MCP

### Phase 2 — Component frames

Activation audit: run `pnpm storybook` and enumerate all stories in Groups: Foundations, Components, Patterns, Layout. Each story group = one component to port.

- [ ] Create a `Components` page in the Figma file — tooling: Figma MCP
- [ ] For each DS primitive component (`Button`, `Card`, `Chip`, `Grid`, `SectionLabel`, `Callout`, `StatTile`, `Badge`): create a Figma component frame with auto-layout matching the React prop API (variant props → Figma variants) — tooling: Figma MCP `use_figma`
- [ ] For each web-adapter component (`ContentCard`, `MetadataCard`, `FilterBar`, `TaxonomyChips`): create a Figma component frame — tooling: Figma MCP
- [ ] All fills, strokes, typography, and spacing in component frames must reference Figma variables (not hardcoded values) — enforced at QA

### Phase 3 — Code Connect

- [ ] Install `@figma/code-connect` in `packages/design-system` — tooling: pnpm
- [ ] Write a `.figma.tsx` Code Connect file for each DS primitive component, linking the Figma component node ID to the React import path and mapping Figma variant props to React props — tooling: Code Connect CLI + Figma MCP `add_code_connect_map`
- [ ] Publish Code Connect mappings to Figma via `figma connect publish` — tooling: Code Connect CLI
- [ ] Verify Dev Mode shows correct import suggestions for each linked component

## Phases

**Phase 1 — Figma variables** (merge independently): tokens.json → Figma variables + Pink Moon modes. Deliverable: variables panel in Figma matches `tokens.css` semantic layer.

**Phase 2 — Component frames** (merge independently): all DS components represented in Figma with variant props and variable fills. Deliverable: `Components` page in Figma with all 30+ components.

**Phase 3 — Code Connect** (merge independently): `.figma.tsx` annotation files published; Dev Mode shows import paths. Deliverable: Code Connect live for all primitive DS components.

## Acceptance criteria

- [ ] Figma variables panel contains `Primitives` and `Semantic` collections; every semantic variable aliases a primitive (no hardcoded hex values in the Semantic collection)
- [ ] Pink Moon light and dark modes exist as variable modes; toggling modes in Figma matches the computed values in `theme.pink-moon.css`
- [ ] `Components` page exists in Figma with a frame for every component documented in Storybook
- [ ] Every fill, stroke, and typography value in every component frame resolves to a Figma variable (validated by spot-checking 5 components in Dev Mode)
- [ ] `figma connect publish` exits with zero errors
- [ ] Dev Mode on any linked Figma component shows the correct React import path and prop mapping
- [ ] No new `--st-*` tokens are introduced by this epic (it consumes the existing token set; it does not extend it)

## Technical notes

- **Figma MCP tooling**: `use_figma` (Plugin API) is the primary tool for creating variables and component frames programmatically. `add_code_connect_map` and `send_code_connect_mappings` handle the Code Connect layer.
- **Token source**: `tokens/source/tokens.json` — 590 tokens. Tier-1 primitives are the raw values; Tier-2 semantics are the aliases. Figma variable structure mirrors this two-tier hierarchy.
- **Pink Moon theme**: `apps/web/src/design-system/styles/theme.pink-moon.css` — the dark block overrides include glassmorphism `rgba()` values on `--st-color-bg-surface*`. These are intentional and must be preserved in the Figma dark mode variable set.
- **Code Connect file location**: `packages/design-system/src/components/<ComponentName>/<ComponentName>.figma.tsx` — co-located with the component source.
- **Component API reference**: Storybook `argTypes` in each `*.stories.tsx` file is the canonical prop list. Use it to define Figma variant props. Do not invent props not in Storybook.
- **Activation audit for Phase 2**: before creating component frames, run `get_code_connect_suggestions` on the Figma file to see if any auto-suggestions already exist from the existing swatches.
## Model & Mode [REQUIRED]

`/model opus` — pure architecture epic mapping 30+ DS components to Figma with sustained visual precision required throughout all phases. No plan-mode handoff — Opus for the full session.

## Non-Goals

- No new DS components are designed or built in this epic. It ports existing components to Figma — it does not introduce new ones.
- No Sanity schema changes.
- No web app CSS changes.
- No new `--st-*` tokens. If a gap is discovered (a token in CSS with no Figma variable equivalent), log it as a follow-on epic.
- No Figma Branching workflow setup. Working directly on the main file.
- Figma Autolayout-to-CSS parity is a best-effort match, not pixel-perfect. The code is the source of truth for spacing values.

## Related

- **Linear:** [SUG-109](https://linear.app/sugartown/issue/SUG-109/figma-ds-backwards-engineer-code-connect-variables-pipeline)
- **Figma file:** https://www.figma.com/design/UmDfTJ7UMROKR9FWLWx9Yl/Sugartown-Design-System
- **Token source:** `tokens/source/tokens.json`
- **Theme overrides:** `apps/web/src/design-system/styles/theme.pink-moon.css`
- **DS primitives:** `packages/design-system/src/components/`
- **Web adapters:** `apps/web/src/design-system/components/`
- **Storybook stories:** `apps/storybook/src/stories/` (prop API reference)
- **SUG-86** (Style Dictionary, shipped) — upstream dependency, provides `tokens.json`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
