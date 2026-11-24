---
**Epic:** ST-252 — Extend the interaction state contract to links, rows, disclosures and form fields
**Issue:** [#252](https://github.com/bex-sugartown/sugartown/issues/252)
**Status:** Done
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-252-ds-interaction-states-links-rows-disclosures-fields.vspec.html`
---

# ST-252 — Extend the interaction state contract to links, rows, disclosures and form fields

Give the remaining interactive design-system components the same five states (rest, hover, selected or open, pressed, focus-visible) that [#251](https://github.com/bex-sugartown/sugartown/issues/251) defined for chips, toggles and buttons.

## Background

[#250](https://github.com/bex-sugartown/sugartown/issues/250) audited interaction states on 2026-11-22. #251 (closed 2026-11-22) shipped the contract and the `--st-state-pressed-shade` token for Tag, Badge, Badge — Color Dot, Button, IconButton and SegmentedControl. The components below were left out and still have gaps.

Stylesheet read, 2026-11-23 (`grep -c` of `:hover`, `:focus`, `:active` in `packages/design-system/src/components/<name>/<name>.module.css`). No component has an `:active` rule.

| Component | :hover | :focus | Gap |
|---|---|---|---|
| Accordion | 1 | 1 | open state has no styled selector; `styles.itemOpen` and `styles.accordionNumbered` are listed in `apps/web/scripts/validate-dead-refs.js` |
| Breadcrumb | 1 | 0 | no focus-visible on its links |
| List | 10 | 0 | hover on rows, no focus-visible |
| Card (link card) | 13 | 2 | no pressed |
| Citation | 3 | 2 | no pressed |
| FilterBar options and clear-all | 2 | 2 | no pressed; checkbox rows only |
| IndexCell | 2 | 1 | no pressed |
| MediaLabel | 1 | 2 | no pressed |
| Input, Textarea | 0 | 2 | no hover; error and disabled states not audited |
| Field | 0 | 0 | wrapper; check whether it carries any state |
| Sidebar | 0 | 1 | no hover |
| SidebarNav, PageSidebar (web-only) | not counted | not counted | live in `apps/web/src/components`, not in the DS package; Phase 0 counts them |

Not confirmed by the audit, so Phase 0 checks them first: all rows above were read from CSS only, and the web-only rows have not been counted.

## Objective

After this epic, each component in the table shows a rendered style change for hover, pressed and focus-visible (and selected or open where it toggles), in light and dark Pink Moon, using the #251 tokens. Accordion's open state is styled and its two dead references leave `validate-dead-refs.js`. Layers touched: DS component CSS and TSX, web adapter and web-only components, Storybook stories. No Sanity schema, GROQ or content changes.

## Metadata plan

Not applicable, no content piece.

## Scope

- [x] Rendered audit of the components in the table, light and dark: computed styles for rest, hover, mouse-down, focus-visible and selected or open. Settles the Phase 0 unknowns above — layer: audit
- [x] Vspec: each component's five states in light and dark, built from the #251 matrix, with the State dropdown prototype from #251 — layer: vspec (Phase 0)
- [x] Pressed state on Card, Citation, FilterBar options and clear-all, IndexCell, MediaLabel, from `--st-state-pressed-shade` — layer: DS component
- [x] Focus-visible on Breadcrumb links and List rows; hover on Input and Textarea; Sidebar and SidebarNav hover — layer: DS component and web-only component
- [x] Accordion open state styled; `styles.itemOpen` and `styles.accordionNumbered` resolved and removed from the dead-reference list — layer: DS component
- [x] Storybook: state stories for the components above, both themes. #251 declined static state stories (no addon for hover and pressed); confirm the approach with Bex at Phase 0 — layer: Storybook (declined 2026-11-24, smoke spec instead; see Close-out review)

## Rendered audit (Phase 0, 2026-11-23)

Headless Chromium against the local dev server, DS package rebuilt first (#254). Each row compares computed colour, background, border, box-shadow, transform, outline and text-decoration against rest. Hover and focus-visible are real events where the element could be hovered, and forced pseudo-states (CDP) where an overlapping element blocked the pointer. "Pressed" is compared with hover: no component CSS has an `:active` rule, so pressed matches hover everywhere. Light and dark gave the same result except where noted. Probe scripts were run from the session scratchpad and are not committed.

| Component (page probed) | Hover | Pressed | Focus-visible | Selected or open | Notes |
|---|---|---|---|---|---|
| Accordion trigger (`/articles/pink-moon-and-ledger`) | light: none, dark: change | none | change | none: `aria-expanded` flips, no trigger or item style changes | open state confirmed unstyled in both themes |
| Breadcrumb link (`/tools/aem`) | change | none | change | n/a | focus ring is rendered although `Breadcrumb.module.css` has 0 `:focus` rules, so it comes from a global rule; the issue's "no focus-visible" is true of the component's own CSS only |
| List rowLink (`/tools/aem-assets`) | change | none | change | n/a | same: focus ring rendered with 0 `:focus` rules in `List.module.css` |
| Card titleLink (`/articles`) | change | none | change | n/a | |
| Citation marker and backLink (`/articles/pink-moon-and-ledger`) | change | none | change | n/a | |
| FilterBar clear-all | change | none | change | n/a | |
| FilterBar option label and checkbox | none on the label or checkbox | none | change on the checkbox | checked styled in CSS (`.optionCheckbox:checked`), not probed | CSS hover targets the child `.optionName`, which this probe did not read |
| IndexCell (`/glossary`) | change | none | change | not probed | |
| MediaLabel (`/about`) | none | none | change | n/a | CSS hover only reveals `.detail` inside a media query |
| Input, Textarea (`/contact`) | none | none | change | n/a | mouse-down moves focus, so a "pressed" change on these is the focus style, not a pressed state |
| Sidebar toggle (`/about`, 375px) | not probed | not probed | not probed | not probed | the `summary` toggle is `display: flex` inside an `aside` that computes `display: none` at 375px on `/about`; needs a page where the mobile toggle is visible |
| Field | n/a | n/a | n/a | n/a | wrapper with no interactive element of its own; nothing to add |

Findings that change the scope:

- Pressed is missing on all eleven interactive rows. That is the one gap that is the same everywhere.
- Hover is missing on Accordion (light), FilterBar option, MediaLabel, Input and Textarea.
- Focus-visible renders on every component probed, so the "no focus-visible" gaps on Breadcrumb and List are not user-visible. Scope item 4 narrows to hover on Input and Textarea, hover on Sidebar and the Accordion light-theme hover. The Phase 0 vspec decides whether Breadcrumb and List should own their ring instead of inheriting one.
- The Sidebar mobile toggle and `SidebarNav` still need a probe on the right page before the vspec.

## Phase 1 and 2 status (2026-11-24)

Phase 1 is committed locally (2ba1cc1e, f2e9e654). Evidence per row:

| Check | Result | Command or source |
|---|---|---|
| Pressed, hover, focus change a computed style, both themes | 11 DS components confirmed; Sidebar toggle, SidebarNav and PageSidebar links not rendered on any page tried | rendered probe with forced pseudo-states, session scratchpad `after252.cjs` |
| Smoke coverage | 18 tests pass (Accordion, Breadcrumb, List, Card, IndexCell, four #251 surfaces, light and dark) | `pnpm exec playwright test tests/smoke/interaction-states.spec.ts` |
| Not in the smoke spec | Citation marker and back-link, FilterBar option (no hoverable target on the pages tried); Sidebar and SidebarNav (not visible) | checked with forced pseudo-states only |
| axe, both themes | 18 pass | `pnpm exec playwright test tests/smoke/a11y.spec.ts` |
| Contrast, token, mirror, dead-refs | pass; dead list now 2 entries (Container bleed, Sidebar `.sidebar`) | `pnpm validate:contrast`, `validate:tokens:strict`, `validate:style-mirror`, `validate:dead-refs` |
| Vspec-to-build table | 0 Drift, 0 Blocker at code level; rendered checks (shade on dark, ring thickness) not done by the reviewer | design-reviewer subagent, read of 2ba1cc1e |

Sidebar toggle: the vspec drew it, but `Sidebar-module__toggle` has zero visible instances on /about, /platform/governance and the article page at 375, 768 and 1280px. Its CSS is committed and validated; its rendered state is unverified.

## Phases

| Phase | Ships | Scope items | Gate |
|---|---|---|---|
| 0 | Rendered audit, vspec signed off (approved as drawn 2026-11-24) | audit, vspec | Bex signs off the vspec |
| 1 | Pressed, focus-visible and hover gaps on the DS components | pressed, focus-visible, hover | none |
| 2 | Accordion open state, Sidebar, stories, QA | Accordion, Sidebar, Storybook | none |

## Acceptance Criteria

- [x] Vspec exists at the path above, shows five states in both themes per component, and Bex has marked Phase 0 complete before any code is written
- [x] Rendered probe shows a computed-style change for pressed, hover and focus-visible on every component in the table, both themes; today none shows one for pressed (met for 11 of 14; Sidebar toggle, SidebarNav and PageSidebar links not rendered anywhere, filed as #261)
- [x] Accordion open state is styled; `pnpm validate:dead-refs` no longer lists `Accordion.tsx styles.accordionNumbered` or `Accordion.tsx styles.itemOpen`
- [x] `pnpm validate:contrast` and `pnpm exec playwright test tests/smoke/a11y.spec.ts` pass in light and dark, with no new allowlist entry
- [x] `pnpm validate:style-mirror` and `pnpm validate:tokens` pass
- [x] Chromatic pass approved by Bex for all phases' diffs (build 119, accepted 2026-11-24)

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Contract source:** `docs/shipped/ST-251-ds-interaction-state-contract.md` and its vspec `docs/shipped/ST-251-ds-interaction-state-contract.vspec.html`. Tokens in `tokens/source/tokens.json` via `pnpm tokens:build`; hand-authored theme files exist in `apps/web/src/design-system/styles` and `packages/design-system/src/styles`, edit both (`pnpm validate:style-mirror`).
- **Probe against built code:** the web dev server serves the built `packages/design-system/dist`. Rebuild the DS package before any rendered probe (#254). #251 lost time to this.
- **Smoke spec:** `tests/smoke/interaction-states.spec.ts` from #251 is the pattern for the rendered probe; poll the pressed state and release the mouse off the element.
- **Phase 0 gate:** covered by the Phase 0 visual spec gate. Start the vspec from `docs/conventions/vspec-template.html`; `docs/conventions/vspec-rules.md` says what it contains. Component choice audit (`.claude/rules/react.md`) and CSS class reuse audit (`.claude/rules/css-layout.md`) go in the same sign-off batch.
- **Upstream dependencies:** #251 is closed, so nothing blocks. Read the backlog for in-flight epics touching these components at activation.
- **Related open work:** #171 (dark pill text contrast) was partly removed by #251; recheck whether any component here reintroduces pink text on a pressed fill.
- **Visual verification:** vspec-to-build comparison table via the design-reviewer subagent at close-out; confirm a Drift with a computed style from a real hover, not a static CSS read.

## Model & Mode [REQUIRED]

`/model sonnet` — DS component CSS and token wiring against a signed-off vspec; no architecture decision after Phase 0.

## Non-Goals

- Redesigning the resting appearance of any component; only the missing states are added.
- The components #251 already covered (Tag, Badge, Badge — Color Dot, Button, IconButton, SegmentedControl, FilterStrip).
- Error and disabled states for form fields beyond recording what exists in the audit; add them only if the vspec shows a gap Bex signs off.
- New tokens, unless the #251 set cannot express a state; raise it at Phase 0 first.
- Sanity schema, GROQ, content or routing changes.

## Related

- **GitHub:** [#252](https://github.com/bex-sugartown/sugartown/issues/252)
- **Depends on (closed):** [#251](https://github.com/bex-sugartown/sugartown/issues/251)
- **Audit:** [#250](https://github.com/bex-sugartown/sugartown/issues/250); also #171, #254
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time

## Close-out review

### Acceptance criteria

- Vspec exists and Bex marked Phase 0 complete before any code: met, approved as drawn 2026-11-24.
- Pressed, hover and focus-visible change a computed style on every component, both themes: met for the 11 DS components by the rendered probe and 6 surfaces in `tests/smoke/interaction-states.spec.ts` (18 tests pass). Not met by rendered evidence for Sidebar toggle, SidebarNav and PageSidebar links, which render nowhere on the pages tried; filed as #261.
- Accordion open state styled, both dead references gone: met; `pnpm validate:dead-refs` lists two entries (Container bleed, Sidebar `.sidebar`).
- `pnpm validate:contrast` and the axe smoke pass in both themes, no new allowlist entry: met; the allowlist is still empty.
- `validate:style-mirror` and `validate:tokens` pass: met.
- Chromatic pass approved by Bex: build 119, 30 changes accepted 2026-11-24.
- Visual QA: "Visual QA approved" from Bex, 2026-11-24; design-reviewer found 0 Drift at code level.
- Storybook state stories: declined, same reason as #251 (no hover, pressed or focus in a static story without forced-state selectors in 14 stylesheets or a new addon). Bex chose the smoke spec, 2026-11-24.

### What didn't work

- The vspec decision on Storybook assumed forced-state stories were possible; #251's declined reason was not re-read first, so the decision had to be reopened at Phase 2.
- The first Before-image capture missed FilterBar option and IndexCell (selectors found nothing), and the spec harness needed three fixes (focus sequence, scroll settling, press target) before the new smoke tests were stable.
- Three existing hover looks measured under 4.5:1 and changed from pink text to a pink underline; this was found by measuring the vspec's own pairs, not by `validate:contrast`.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Citation back-link resting colour 4.45:1 in dark | implementation | [#260](https://github.com/bex-sugartown/sugartown/issues/260), closed invalid 2026-11-24: 5.13:1 on the live page; 4.45 was the vspec prototype frame |
| Render and verify Sidebar toggle, SidebarNav and PageSidebar link states; decide whether the toggle is dead | implementation | [#261](https://github.com/bex-sugartown/sugartown/issues/261) |
| `validate:contrast` does not check pairs a component composes at hover or pressed | workflow-docs | declined: the vspec contrast script covers this at Phase 0 and a new validator needs its own issue |
| Storybook cannot show hover, pressed or focus | implementation | declined: smoke spec chosen, see above |

### Friction line

The vspec's Storybook decision was drawn without re-reading #251's declined reason, so Phase 2 reopened it.

## Post-ship checks

- Chromatic pass: done, build 119 accepted by Bex 2026-11-24.
- Live hover and pressed on Accordion (light), List row and IndexCell on sugartown.io: person: hover and press each once in light and dark.
