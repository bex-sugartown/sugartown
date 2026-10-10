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

"Before" values were read from the repo on 2026-10-10, not copied from the audit. "After" values are the 2026-10-10 decisions in the v2 audit. Base values live in `tokens/source/tokens.json` (built to both `tokens.css` copies); theme overrides live in `theme.pink-moon.css` (light block and dark block). Edit both copies of each file; `pnpm validate:style-mirror` checks they match.

### 1. New semantic token (layer: tokens)

| Token | Before | After |
|---|---|---|
| `--st-color-text-signal` | does not exist | light: `var(--st-color-maroon)` (maroon-600 `#b91c68`); dark: `var(--st-color-pink)` (`#ff247d`); base (`tokens.json`): pink |

### 2. A1: pink text repointed to `--st-color-text-signal` (layer: tokens)

| Token | Before (light) | After (light) | Dark | Ratio, light |
|---|---|---|---|---|
| `--st-color-link-default` | `var(--st-color-brand-primary)`, pink `#ff247d` | `var(--st-color-text-signal)` | unchanged (pink) | 3.24 to 5.47 |
| `--st-color-text-eyebrow` | `var(--st-color-pink)` | `var(--st-color-text-signal)` | unchanged (pink) | 3.24 to 5.47 |
| `--st-citation-marker-color` | `var(--st-color-pink)` | `var(--st-color-text-signal)` | unchanged (pink) | 3.24 to 5.47 |
| `--st-citation-index-color` | `var(--st-color-pink)` | `var(--st-color-text-signal)` | unchanged (pink) | 3.24 to 5.47 |
| `--st-segmented-active-fg` | `var(--st-color-brand-primary)` | `var(--st-color-text-signal)` | base `text-default`, unchanged | 3.24 to 5.47 |
| `--st-kg-chip-case-fg` | `var(--st-color-pink)` | `var(--st-color-text-signal)` | base `neutral-100`, unchanged | 2.91 to 4.92 (on its tint) |

Hover on light stays maroon-700 (`#961553`). `--st-glossary-annotation-color` is not in this list: ST-151 replaces it (A3).

### 3. A1 decision: tertiary (ghost) button (layer: component CSS and tokens)

| Token | Before (light) | After (light) | Dark |
|---|---|---|---|
| `--st-button-tertiary-text` | `var(--st-color-brand-primary)`, pink | `var(--st-color-text-signal)`, maroon `#b91c68` | base `lime`, unchanged (15.94:1) |
| `--st-button-tertiary-border` | `var(--st-color-brand-primary)`, pink | `var(--st-color-text-signal)`, maroon | unchanged |

Rule for anything else found: small pink text on light uses `--st-color-text-signal`.

### 4. A2: primary button (layer: component CSS and tokens)

| Property | Before | After |
|---|---|---|
| Fill (`.primary` in `Button.module.css`) | `var(--st-color-brand-primary)`, pink-500 `#ff247d` | new `--st-button-bg-primary`, pink-600 `#e00069`, both themes |
| Label | `var(--st-color-white)` | `var(--st-color-white)`, unchanged |
| Hover fill | `var(--st-color-pink-600)` `#e00069` | new `--st-button-bg-primary-hover`, pink-700 `#b30054` (6.90:1) |
| Contrast, label on fill | 3.62:1 (fail) | 4.80:1 (pass, any size, including the 0.72rem compact size) |

`--st-button-text` (white) and `--st-button-bg` (`accent-primary`) exist in `tokens.css` but `Button.module.css` does not read them; the activation audit decides whether to reuse `--st-button-bg` or add the two new tokens.

### 5. A2: accent table header, option C (layer: component CSS and tokens)

| Token | Before | After (light) | Dark |
|---|---|---|---|
| `--st-table-header-bg-accent` | `var(--st-color-pink)` | `var(--st-color-neutral-200)` `#e4e4e5` | proposed: `var(--st-color-midnight-700)`, the existing opaque dark header; confirm at Phase 0 |
| `--st-table-header-color-accent` | `var(--st-color-white)` (3.62:1, fail) | `var(--st-color-ink)` (15.08:1) | proposed: `var(--st-color-text-default)`; confirm at Phase 0 |
| Bottom rule | none | 3px solid `var(--st-color-pink)` | same |

The audit specifies the light treatment only. The dark values above are my proposal, since a white label on pink fails in dark too.

### 6. A5: default-chassis chip presets, light theme (layer: component CSS)

`Chip.module.css` sets `--chip-color` per preset; text, border and tint derive from it. The selected state is a white label on a `--chip-color` fill, so one change fixes both.

| Preset | Before (light) | After (light) | Ratio on white, before to after |
|---|---|---|---|
| pink | `var(--st-color-pink)` `#ff247d`, no light override | `var(--st-color-maroon)` `#b91c68` | 3.62 to 6.12 |
| violet | `var(--st-color-violet)` `#a78bfa`, no light override | `var(--st-color-violet-600)` `#7c3aed` | 2.72 to 5.70 |
| seafoam | `var(--st-color-seafoam-700)` `#1d9679` | `var(--st-color-seafoam-800)` `#15735c` | 3.69 to 5.77 |
| lime | `var(--st-color-lime-700)` `#748f00` | `var(--st-color-lime-800)` `#526600` | 3.70 to 6.44 |
| amber | `var(--st-color-amber-600)` `#d97706` | `var(--st-color-amber-800)` `#946200` | 3.19 to 5.24 |
| grey | `var(--st-color-neutral-600)` | unchanged | passes |

### 7. A4: featured tag rubric, dark (layer: tokens)

| Token | Before (dark) | After (dark) | Ratio |
|---|---|---|---|
| `--st-chip-rubric-fg` | `var(--st-color-pink)` | `var(--st-color-pink-300)` `#ff80b5` | 4.08 to 6.33 |

### 8. A7: label greys (layer: tokens)

| Token | Theme | Before | After | Ratio |
|---|---|---|---|---|
| `--st-label-color` | light | `var(--st-color-neutral-500)` `#6c6c6f` | `var(--st-color-neutral-600)` `#525252` | 4.12 to 6.15 on the card label strip |
| `--st-label-color-badge` | dark | `var(--st-color-softgrey-500)` `#6e7f96` | `var(--st-color-softgrey-400)` `#94a3b8` | 4.27 to 6.81 on midnight-800 |

### 9. A14 and B1: inline code (layer: component CSS and tokens)

`:not(pre) > code` in `globals.css` hard-codes its size, padding and radius; the tokens exist and are unread.

| Property | Before | After |
|---|---|---|
| `font-size` | `0.85em` | `var(--st-code-inline-font-size)` (0.9em; if too large in DM Sans, change the token, not the rule) |
| `padding` | `0.2em 0.5em` | `var(--st-code-inline-padding)` (`0.1em 0.35em`) |
| `border-radius` | `4px` | `var(--st-radius-code)` (0) |
| Background, light | `var(--st-color-softgrey-100)` `#f1f2f4` | `var(--st-color-lime-50)` `#f9ffe5` |
| Border, light | `1px solid var(--st-color-seafoam-300)` | `1px solid var(--st-color-neutral-300)` `#c6c6c8` |
| Text, light | `var(--st-color-seafoam-800)` `#15735c` | `var(--st-color-neutral-600)` `#525252` (7.61:1; was 5.15) |
| Background, dark | `var(--st-color-midnight-700)` `#1c2240` | lime at 8% over the surface |
| Border, dark | `1px solid var(--st-color-seafoam-700)` | the dark rule colour (white at 15%) |
| Text, dark | `var(--st-color-seafoam-500)` `#2bd4aa` | `var(--st-color-softgrey-200)` `#e1e3e6` (11.32:1; was 8.21) |

### 10. A10: reduced motion (layer: component CSS)

Before: no global `prefers-reduced-motion` rule. Only `ScoreRing.module.css` has one. After: one `@media (prefers-reduced-motion: reduce)` block in `globals.css` that removes these, found by `grep` on 2026-10-10:

| Motion | File | Before | After under `reduce` |
|---|---|---|---|
| Card hover lift | `Card.module.css:36` | `translateY(var(--st-card-hover-translate-y))` | none |
| Chip hover lift | `Chip.module.css:58` | `translateY(-1px)` | none |
| Duotone image zoom | `utilities.css:27`, `Card.module.css:86`, `Media.module.css:126`, `PageSections.module.css:38` (web) | `scale(1.05)` | none |
| Button baseline rule | `Button.module.css` (translate, SUG-116) | translate on hover | none |

## Phases

Single phase.

## Acceptance Criteria

- [ ] `pnpm tokens:build` runs and both `tokens.css` copies are identical for every touched token.
- [ ] `pnpm validate:tokens --strict-colors` passes with no new warnings.
- [ ] Computed contrast (text against its own resolved background) meets or beats the v2 audit figures: link, eyebrow, citation on light canvas 5.47; primary button label on pink-600 4.80 (both themes); accent header ink on neutral-200 15.08; five light chip presets 5.24 or more; label on card strip 6.15; dark badge label 6.81; featured tag rubric dark 6.33; inline code 7.61 light, 11.32 dark.
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
- **Token source.** Edit `tokens/source/tokens.json` and run `pnpm tokens:build`; never hand-edit the generated `tokens.css`. `theme.pink-moon.css` and `globals.css` exist in `apps/web/src/design-system/styles/` and `packages/design-system/src/styles/` and are checked by `pnpm validate:style-mirror`. `Chip.module.css`, `Button.module.css`, `Card.module.css` and `Media.module.css` live in `packages/design-system/src/components/` only.
- **Activation audits.** (1) pink-600 `#e00069`, pink-700 `#b30054`, maroon-600/700, lime-50, neutral-200/300/600, softgrey-200/400, violet-600, amber-800, seafoam-800, lime-800 and pink-300 were all confirmed present in `tokens.css` on 2026-10-10; no new primitives are needed. (2) Decide whether `Button.module.css` reuses `--st-button-bg` or adds `--st-button-bg-primary`; confirm nothing else reads `--st-button-bg`. (3) Find the dark rule token (white at 15%) for the dark inline-code border. (4) Check what else reads `--st-table-header-bg-accent` before changing it. (5) Open items for Phase 0: the dark accent-header treatment (section 5) and the dark selected pink chip, which is white on pink-500 at 3.62:1 and which the audit does not decide (proposal: pink-600 fill, 4.80:1).
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
