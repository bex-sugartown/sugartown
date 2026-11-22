---
**Epic:** ST-251 — DS interaction state contract for chips, toggles and buttons
**Issue:** [#251](https://github.com/bex-sugartown/sugartown/issues/251)
**Status:** Todo
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-251-ds-interaction-state-contract/ST-251-ds-interaction-state-contract.vspec.html`
---

# ST-251 — DS interaction state contract for chips, toggles and buttons

Give the design system one owned state contract (rest, hover, selected, pressed, focus-visible) for chips, toggles and buttons, so the knowledge-graph filter strip stops carrying its own.

## Background

The audit in [#250](https://github.com/bex-sugartown/sugartown/issues/250) (2026-11-22) checked seven surfaces in light and dark Pink Moon. No component has a pressed (`:active`) state, and hover, selected and focus differ on every surface: Chip lifts with a pink border, Button darkens, SegmentedControl turns pink, FilterStrip only darkens text and border. The knowledge-graph `FilterStrip` (`apps/web/src/components/FilterStrip.jsx`) does not use the DS Chip; it owns its own hover, selected fill and a browser-default focus outline. #170 (Case chip contrast in dark) was one symptom. Related: #150.

Reference surfaces: `/knowledge-graph` (FilterStrip), `/articles` and archive filter chips (DS Chip), `/platform/governance` (SegmentedControl), site-wide Button and IconButton.

Not confirmed by the audit, so the vspec phase checks them first: dark-theme keyboard focus on the DS Chip, a rendered selected DS Chip, and rendered focus for IconButton, FilterBar and SegmentedControl (those were read from CSS only).

## Objective

After this epic, Chip, Button, IconButton and SegmentedControl each define rest, hover, selected (where the component toggles), pressed and focus-visible from one set of state tokens, in light and dark Pink Moon. DS Chip takes a per-type colour through the `--chip-bg/fg/border/dot` pattern FilterStrip uses today, and FilterStrip becomes a Chip consumer with the DS focus ring. Layers touched: token source (`tokens/source/tokens.json` and the hand-authored theme files), DS component CSS and TSX, web adapter and FilterStrip JSX/CSS, Storybook stories. No Sanity schema, GROQ or content changes.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Vspec: all five states in light and dark, per chip colour, for Chip, Button, IconButton, SegmentedControl and FilterStrip — layer: vspec (Phase 0)
- [ ] State tokens: one named set for hover, selected, pressed and focus-visible, light and dark, mirrored across both `theme.pink-moon.css` copies — layer: tokens
- [ ] DS Chip: pressed state, and a colour variant driven by `--chip-bg/fg/border/dot` — layer: DS component
- [ ] Pressed (`:active`) on Button, IconButton and SegmentedControl, and a selected state on IconButton — layer: DS component
- [ ] FilterStrip renders DS Chip with the colour variant and uses `--st-focus-ring`; its own hover, selected and focus CSS is removed — layer: frontend
- [ ] Storybook: one story per component showing all five states in both themes; axe gate stays green — layer: Storybook

## Phases

| Phase | Ships | Scope items | Gate |
|---|---|---|---|
| 0 | Vspec signed off, unconfirmed audit items checked | vspec | Bex signs off the vspec |
| 1 | State tokens and DS components (Chip, Button, IconButton, SegmentedControl) | tokens, DS Chip, pressed and IconButton selected | none |
| 2 | FilterStrip as a Chip consumer, stories, QA | FilterStrip, Storybook | none |

## Acceptance Criteria

- [ ] Vspec exists at the path above, shows five states in both themes per chip colour, and Bex has marked Phase 0 complete before any code is written
- [ ] Rendered probe (headless Chromium) shows a computed-style change for pressed on Chip, Button, IconButton and SegmentedControl in both themes; today every surface shows none
- [ ] DS Chip, FilterStrip chips and SegmentedControl use the same token names for hover and focus-visible; `git grep` finds no state colour literals in FilterStrip.module.css
- [ ] FilterStrip focus outline computes to the `--st-focus-ring` style, not `auto`
- [ ] `pnpm exec playwright test tests/smoke/a11y.spec.ts` passes in light and dark, `pnpm validate:contrast`, `pnpm validate:style-mirror` and `pnpm validate:tokens` pass, and no new allowlist entry is added
- [ ] Storybook a11y CI gate passes for every new state story in both themes
- [ ] Chromatic pass approved by Bex for all three phases' diffs

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Style mirror:** `theme.pink-moon.css` and the other hand-authored style files exist in `apps/web/src/design-system/styles` and `packages/design-system/src/styles`; edit both, `pnpm validate:style-mirror` enforces it. Token values come from `tokens/source/tokens.json` via `pnpm tokens:build`.
- **Phase 0 gate:** a new visual format for existing components is covered by the Phase 0 visual spec gate. Start the vspec from `docs/conventions/vspec-template.html`; `docs/conventions/vspec-rules.md` says what it must contain. Component choice audit (`.claude/rules/react.md`) and CSS class reuse audit (`.claude/rules/css-layout.md`) go in the same sign-off batch.
- **Upstream dependencies:** none blocking. #250 (audit) is closed and is the evidence base. #170 and #150 shipped the dark Case chip and the neutral chip chassis this builds on; read the backlog for in-flight epics touching `Chip`, `FilterStrip` or `theme.pink-moon.css` at activation.
- **Activation audits:** read `packages/design-system/src/components/Chip/Chip.module.css` and `Chip.tsx`, `apps/web/src/components/FilterStrip.jsx` and `.module.css`, and `SiteGraphPage.jsx`'s use of the `--st-kg-chip-*` tokens before writing the vspec.
- **Visual verification:** vspec-to-build comparison table via the design-reviewer subagent at close-out; the audit probe (headless Chromium, computed styles for rest, hover, mouse-down, focus, selected) is rerun as the before/after evidence.

## Model & Mode [REQUIRED]

`/model sonnet` — DS component CSS, token wiring and a consumer migration with a signed-off vspec; no architecture decision or high-ambiguity design work left after Phase 0.

## Non-Goals

- Redesigning the visual look of any component beyond adding the missing states; resting appearance stays as shipped.
- Changing FilterBar checkbox options, ButtonGroup, or non-interactive Chips.
- New chip colours or new component variants other than the colour variant on DS Chip.
- Sanity schema, GROQ, content or routing changes.

## Related

- **GitHub:** [#251](https://github.com/bex-sugartown/sugartown/issues/251)
- **Audit:** [#250](https://github.com/bex-sugartown/sugartown/issues/250); also #170, #150
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
