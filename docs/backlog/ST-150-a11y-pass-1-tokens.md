---
**Epic:** ST-150 — Pink Moon accessibility Pass 1: token contrast
**Issue:** [#150](https://github.com/bex-sugartown/sugartown/issues/150)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-150-a11y-pass-1-tokens.vspec.html`
---

# ST-150 — Pink Moon accessibility Pass 1: token contrast

Fix the WCAG 2.2 AA contrast failures in the Pink Moon token layer, using the decisions Bex recorded on 2026-10-10 in the v2 accessibility audit.

## Background

The 2026-10-07 audit of Pink Moon found 21 failing text pairs. Two patterns cause most of them: hot pink (`--st-color-pink`, 3.24:1 on the light canvas) used as small text, and white labels on pink fills (3.62:1). The v2 audit (`docs/briefs/design-system/WCAG audit 26-10-10/Pink Moon Accessibility Audit v2 (standalone).html`) records the decisions that supersede the draft handoff files in the same folder's zip (`handoff/EPIC-XXXX-a11y-pass-*.md`): the primary button moves to pink-600 with a white label, and the accent table header becomes a grey header with a pink rule. Surfaces affected: every page that renders a button, link, eyebrow, chip, table header, card label strip or inline code. Related: #51 (chip neutral border, non-text contrast, not in the audit), #50 (Storybook a11y gate).

## Objective

After this epic, every text/background pair in the token layer meets 4.5:1 (3:1 for large text), pink no longer appears as small text on the light theme, and inline code uses its zero-radius tokens. Layers touched: design tokens (`tokens/source/tokens.json`, `theme.pink-moon.css`), component CSS (Button, Chip, table, globals). Not touched: Sanity schema, GROQ, React markup, content.

## Scope

- [ ] **A1, tokens.** Add `--st-color-text-signal` (light: maroon-600, dark: pink-500). Point `--st-color-link-default`, `--st-color-text-eyebrow`, `--st-citation-marker-color`, `--st-citation-index-color`, `--st-glossary-annotation-color`, `--st-button-tertiary-text`, `--st-segmented-active-fg` and `--st-kg-chip-case-fg` at it. Hover on light stays maroon-700.
- [ ] **A1 decision, tertiary button, component CSS.** On light, ghost button text and border use maroon (5.47:1). Dark keeps lime (15.94:1). Any other small pink text on light follows the same rule.
- [ ] **A2, primary button.** Fill becomes pink-600 (`#e00069`) in both themes, label stays white (4.80:1), hover pink-700 (6.90:1). Covers the default and the compact (0.72rem) size.
- [ ] **A2, accent table header.** Option C: neutral-200 header, ink label, 3px pink bottom rule (15.08:1).
- [ ] **A5, default-chassis chip presets, light only.** pink to maroon, violet to violet-600, seafoam to seafoam-800, lime to lime-800, amber to amber-800. The selected state keeps a white label on the same darker fill (5.24 to 6.44:1).
- [ ] **A4, featured tag rubric, dark.** pink-500 to pink-300 (6.33:1). Status chip foregrounds are not fixed here; see Technical notes.
- [ ] **A7, label greys.** Light card label strip: neutral-600 (6.15:1). Dark `--st-label-color-badge`: softgrey-400 (6.81:1).
- [ ] **A14 and B1, inline code, component CSS.** `globals.css` reads `--st-radius-code`, `--st-code-inline-font-size` and `--st-code-inline-padding` instead of hard-coded values. Light: lime-50 fill, neutral-300 outline, neutral-600 type (7.61:1). Dark: lime at 8%, rule outline, softgrey-200 type (11.32:1).
- [ ] **A10, reduced motion, component CSS.** Add `@media (prefers-reduced-motion: reduce)` to `globals.css`: drop hover `translateY` lifts and the 600ms duotone 1.05 scale.

## Phases

Single phase.

## Acceptance Criteria

- [ ] `pnpm tokens:build` runs and both `tokens.css` copies are identical for every touched token.
- [ ] `pnpm validate:tokens --strict-colors` passes with no new warnings.
- [ ] Computed contrast (text against its own resolved background) meets or beats the v2 audit figures: link, eyebrow, citation on light canvas 5.47; primary button label on pink-600 4.80 (both themes); accent header 15.08; five light chip presets 5.24 or more; label on card strip 6.15; dark badge label 6.81; featured tag rubric dark 6.33; inline code 7.61 light, 11.32 dark.
- [ ] No `--st-color-pink` is used as a text colour on the light theme for text under 24px, found by `grep` of the touched token files.
- [ ] With OS reduced motion on, card and button hovers do not translate and the duotone does not scale.
- [ ] Inline `code` renders with zero radius in both themes.
- [ ] Storybook: Button (primary, secondary, tertiary, compact), Chip (all presets, selected), table accent header, card label strip and inline code each checked in both themes.
- [ ] `pnpm test:smoke` passes. One article and one knowledge-graph node render in both themes with no change beyond the listed colours.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Phase 0 gate fires** (Visual: yes). The v2 audit HTML is the vspec. Before the first `Edit`, Bex reviews the specimen panels for the primary button, accent header, chips and inline code and the Phase 0 checkboxes are marked.
- **Scoping decision, A4 and A13.** The 2026-10-10 A9 decision turns every status chip grey with a pink dot, so the status foreground and violet-dot fixes (A4, A13) and the new `amber-900` and `orange-800` primitives are no longer needed. They move to ST-151 under A9. Until ST-151 ships, draft, designing, testing and dark validated status chips keep their current failing foregrounds. If that gap is not acceptable, add interim A4 fixes here.
- **Token source.** Edit `tokens/source/tokens.json` and run `pnpm tokens:build`; never hand-edit the generated `tokens.css`. `theme.pink-moon.css`, `globals.css` and `Chip.module.css`/`Button.module.css` exist in `apps/web/src/design-system/styles/` and `packages/design-system/src/` and must stay in step (`pnpm validate:style-mirror`).
- **Activation audits.** (1) Confirm pink-600 and pink-700 exist in the token ramp; add them to `tokens.json` only if missing. (2) Read `Chip.module.css` and list which selected-state rules use a white label. (3) Read `Button.module.css` for the compact size selector. (4) Confirm `maroon-600` and `maroon-700` primitives exist.
- **Content Write Gate:** not applicable, no content changes. **Schema:** none.
- **Model & Mode [REQUIRED]:** `/model sonnet`. Value changes in token and component CSS, no architecture decisions.

## Model & Mode [REQUIRED]

`/model sonnet`. Token-value and component-CSS work with the decisions already made.

## Non-Goals

- Status chip colours (A4 status, A9, A13): ST-151.
- Glossary term, prose link underlines, citation and glossary ARIA, label size floor, documentation drift: ST-151.
- Focus ring (A12): decided to keep the existing pink ring with a 2px offset; no change in either epic.
- Chip neutral border non-text contrast: #51.
- Any new radius, shadow or hue beyond what is listed.

## Related

- **GitHub:** [#150](https://github.com/bex-sugartown/sugartown/issues/150)
- **Next:** [#151](https://github.com/bex-sugartown/sugartown/issues/151) (Pass 2, blocked by this)
- **Also:** #51, #50
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
