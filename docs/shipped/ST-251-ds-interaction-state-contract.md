---
**Epic:** ST-251 — DS interaction state contract for chips, toggles and buttons
**Issue:** [#251](https://github.com/bex-sugartown/sugartown/issues/251)
**Status:** Done
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/shipped/ST-251-ds-interaction-state-contract.vspec.html`
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

- [x] Vspec: all five states in light and dark, per chip colour, for Tag, Badge, Badge — Color Dot (the Chip variants named in Storybook), Button, IconButton, SegmentedControl and FilterStrip, with a State dropdown (Rest, Hover, Selected, Pressed, Focus) to show one state at a time or all — layer: vspec (Phase 0)
- [x] State tokens: one named set for hover, selected, pressed and focus-visible, light and dark, mirrored across both `theme.pink-moon.css` copies — layer: tokens
- [x] DS Chip: pressed state, and a colour variant driven by `--chip-bg/fg/border/dot` — layer: DS component
- [x] All five states on each of Tag, Badge, Badge — Color Dot, Button (selected not applicable, it is not a toggle), IconButton and SegmentedControl: pressed (`:active`) on all six, selected on IconButton — layer: DS component
- [x] SegmentedControl icon variant (grid, list, graph toggle) and IconButton: all five states, and the rest border moves to `--st-chip-border` (measured 1.07:1 to 1.19:1 today, 3:1 needed), and `ArchivePage.jsx` and `SiteGraphPage.jsx` use it in place of three hand-built `IconButton`s plus `layoutToggleBtnActive` — layer: DS component and frontend
- [x] FilterStrip renders DS Chip with the colour variant and uses `--st-focus-ring`; its own hover, selected and focus CSS is removed — layer: frontend
- [x] Storybook (declined: hover, pressed and focus cannot show in a static story without a new addon; Bex chose the smoke spec, see Close-out review): one story per component showing all five states in both themes; axe gate stays green — layer: Storybook

## Phases

| Phase | Ships | Scope items | Gate |
|---|---|---|---|
| 0 | Vspec signed off, unconfirmed audit items checked | vspec | Bex signs off the vspec |
| 1 | State tokens and DS components (Chip, Button, IconButton, SegmentedControl) | tokens, DS Chip, pressed and IconButton selected | none |
| 2 | FilterStrip as a Chip consumer, view toggle on SegmentedControl icon variant, stories, QA | FilterStrip, SegmentedControl icon variant, Storybook | none |

## Acceptance Criteria

- [ ] Vspec exists at the path above, shows five states in both themes per chip colour, and Bex has marked Phase 0 complete before any code is written
- [ ] Rendered probe (headless Chromium) shows a computed-style change for hover, pressed and focus-visible on each of Tag, Badge, Badge — Color Dot, Button, IconButton and SegmentedControl, and for selected on every one but Button, in both themes; today every surface shows none for pressed
- [ ] DS Chip, FilterStrip chips and SegmentedControl use the same token names for hover and focus-visible; `git grep` finds no state colour literals in FilterStrip.module.css
- [ ] `git grep layoutToggleBtnActive layoutToggleGroup apps/web/src` finds nothing outside stories removed with them; the toggle on `/knowledge-graph` and the archive pages renders the DS SegmentedControl icon variant
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
- Other interactive components (Accordion, Breadcrumb, List, Card links, Citation, FilterBar options, IndexCell, Sidebar, Input, Textarea, MediaLabel): tracked in [#252](https://github.com/bex-sugartown/sugartown/issues/252), blocked on this epic.
- Changing ButtonGroup or non-interactive Chips.
- New chip colours or new component variants other than the colour variant on DS Chip.
- Sanity schema, GROQ, content or routing changes.

## Related

- **GitHub:** [#251](https://github.com/bex-sugartown/sugartown/issues/251)
- **Follow-on:** [#252](https://github.com/bex-sugartown/sugartown/issues/252) extends the contract to the other interactive components
- **Audit:** [#250](https://github.com/bex-sugartown/sugartown/issues/250); also #170, #150
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time

## Close-out review

<!-- Chromatic: done. Build 119 accepted by Bex, 2026-11-24 (deferred from 2026-11-22). -->

### Acceptance criteria

- [x] Vspec exists, five states in both themes, Bex marked Phase 0 complete before any code: `docs/shipped/ST-251-ds-interaction-state-contract.vspec.html`, approved 2026-11-22.
- [x] Rendered probe shows a change for hover, pressed and focus-visible on Tag, Badge, Badge — Color Dot, Button, IconButton and SegmentedControl, and for selected on all but Button, both themes: `tests/smoke/interaction-states.spec.ts` (Chip link, Button, IconButton, selected pill; 6 of 6 repeat runs) plus a one-off probe of the icon variant and IconButton `selected` (selected+hover keeps its glow, no lift).
- [x] Same token names for hover and focus-visible across Chip, FilterStrip chips and SegmentedControl: FilterStrip now renders DS Chip, `git grep "st-kg-chip" -- . ':!docs'` finds nothing.
- [x] FilterStrip focus outline computes to the DS ring (`outlineStyle: solid` in the smoke spec path, Chip focus).
- [x] `git grep layoutToggle -- apps/web/src` finds nothing; `/knowledge-graph` and `/articles` render the DS icon variant through `ViewToggle` (probe: Grid and List are links, Graph a pressed button on the graph page; clicking List on /articles moves the selection and sets `data-layout="list"`).
- [x] `a11y.spec.ts` passes in light and dark, `validate:contrast`, `validate:style-mirror`, `validate:tokens` pass, no new allowlist entry. Full smoke `pnpm test:smoke`: 49 passed.
- [ ] Storybook a11y gate for new state stories: not applicable, no new state stories (declined, below).
- [ ] Chromatic: deferred to /ship (Post-ship checks).

### What didn't work

- The design reviewer reported three blocker drifts (selected+hover glow missing on IconButton and both SegmentedControl variants) from a static CSS read. A real hover showed the glow present on all three: the base hover rule's shadow cascades into the selected-hover rule. No change made.
- Two early probes ran against stale code because the web dev server reads the built `packages/design-system/dist`, so the first run looked like a failing implementation. Filed as #254.
- Contrast: a pressed shade measured 3.11:1 on dark pink text, so IconButton and SegmentedControl first got a ring instead, then adopted the solid-fill selected look so pink text left them entirely (this also removed the dark pill text failure tracked in #171 from these surfaces).
- The first smoke spec failed intermittently: the pressed state was read mid-transition and a mouse release on the element fired its click. Fixed by polling and releasing off the element.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Extend the contract to Accordion, Breadcrumb, List, Card links, Citation, FilterBar, IndexCell, Sidebar, Input, Textarea, MediaLabel | implementation | #252 |
| Glossary category chips show no selected state | implementation | #253 |
| Document that the web dev server serves the built DS package | workflow-docs | #254 |
| Storybook state stories for hover, pressed and focus (needs storybook-addon-pseudo-states) | implementation | declined by Bex 2026-11-22: the smoke spec covers it and no new dependency |
| Design reviewer should confirm a Drift with a computed style, not a static read | workflow-docs | declined: one false positive, and the reviewer brief already asks for evidence; revisit if it repeats |

### Friction line

The web dev server serves the built design-system package, so a probe run before rebuilding it read old CSS as a failed implementation.

---

## Post-ship checks

- [ ] Chromatic: approve the diffs on Chip, Button, IconButton, SegmentedControl, FilterStrip and the archive toolbar: person: review at /ship before the push.
- [ ] Hover, pressed and focus on `/knowledge-graph` and `/articles` in light and dark: person: open both pages and try the filter strip and the view toggle.
- [ ] `pnpm exec playwright test tests/smoke/interaction-states.spec.ts` passes in CI after the push: `gh run watch`.
