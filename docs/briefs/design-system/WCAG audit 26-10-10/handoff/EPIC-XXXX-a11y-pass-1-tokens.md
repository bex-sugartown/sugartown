# EPIC-XXXX — Pink Moon accessibility, Pass 1: token contrast and neutral chips

Rebuilt 10 Oct 2026 against the design-system canonical snapshot (sync of 7 Oct: `canonical-snapshot/tokens.css`, `theme.pink-moon.css`, `globals.css`, and `packages/design-system/src/components/*`). Matches **Pink Moon Accessibility Audit v4** (approved 10 Oct). Supersedes all earlier Pass 1 drafts.
Revised 11 Oct 2026: the featured rubric chip is now the standard neutral chip, border included.
Every change is written as **current value → new value**, with the file it lives in. Contrast figures are computed from canonical values against the surface each element actually sits on.
No PRD. Assumptions are listed below.

## Principle

Pink is the one hot colour, and everything else is neutral.
- **Small pink text on light** → `--st-color-text-brand` (maroon-600, already commented "Deep Pink Rule — WCAG AA" in theme.pink-moon.css).
- **White on a pink fill** → `--st-color-pink-600` (4.80:1).
- **Dark eyebrow and folio label** → `--st-color-text-default` (white).
- **Chips** → the existing neutral tag chassis, featured rubric chip included. Colour presets no longer tint chips.
- **Status dots** → pink for every status, with draft drawn as a ring.
Lime stays on the secondary button only. Rich-text colours (code, glossary) are Pass 2.

## Pre-Execution Completeness Gate

- [ ] **Epic ID** — OPEN (Bex): assign next EPIC number from CHANGELOG.md, rename file.
- [ ] **Drift check** — OPEN (Claude Code, step 0): diff `apps/web/src/design-system/styles/*` and `packages/design-system/src/styles/*` against the values quoted in the "current" column below. If any current value differs, STOP and report.
- [x] **Layout contract** — no layout changes. Colour values, one size/padding/radius wiring (step 7), one dot shape (step 5), and a motion media query.
- [x] **Enum values** — none touched. Chip `color` presets stay in the API; they stop tinting.
- [x] **Dark / theme treatment** — explicit per row.
- [x] **Schema changes** — none. No Sanity schema, no GROQ.
- [x] **Web adapter** — token files exist in both `apps/web` and `packages/design-system` and must stay byte-identical. Component CSS lives in `packages/design-system/src/components/`; mirror to `apps/web` only if a copy exists there.

## Scope (execution order)

### 1. White on pink fills → pink-600 (both themes)

| Where | Current | New | Result |
|---|---|---|---|
| `Button.module.css` `.primary` background-color (l.58) | `var(--st-color-brand-primary)` (pink-500) | `var(--st-color-pink-600)` | 3.62 → 4.80 |
| `Button.module.css` `.primary:hover` background-color (l.63) | `var(--st-color-pink-600)` | `var(--st-color-pink-700)` | 4.80 → 6.90 |
| `theme.pink-moon.css` light `--st-table-header-bg-accent` | `var(--st-color-pink)` | `var(--st-color-pink-600)` | 3.62 → 4.80 |
| `theme.pink-moon.css` dark `--st-table-header-bg-accent` | `var(--st-color-pink)` | `var(--st-color-pink-600)` | 3.62 → 4.80 |

Accent table header labels are 9.5px, so large-text relief does not apply.

### 2. Small pink text on light → `--st-color-text-brand` (light block only)

| Where | Current | New | Result (light) |
|---|---|---|---|
| `theme.pink-moon.css` light `--st-color-text-eyebrow` | `var(--st-color-pink)` | `var(--st-color-text-brand)` | card 3.62 → 6.12; label strip 2.85 → 4.82 |
| `theme.pink-moon.css` light `--st-color-link-default` (new override; base is `brand-primary`) | inherits pink | `var(--st-color-text-brand)` | canvas 3.24 → 5.47 |
| `theme.pink-moon.css` light `--st-citation-marker-color` (new override) | inherits pink | `var(--st-color-text-brand)` | 3.24 → 5.47 |
| `theme.pink-moon.css` light `--st-citation-index-color` (new override) | inherits pink | `var(--st-color-text-brand)` | 3.24 → 5.47 |
| `theme.pink-moon.css` light `--st-button-tertiary-text` | `var(--st-color-brand-primary)` | `var(--st-color-text-brand)` | 3.24 → 5.47 |
| `theme.pink-moon.css` light `--st-button-tertiary-border` | `var(--st-color-brand-primary)` | `var(--st-color-text-brand)` | border matches text |
| `theme.pink-moon.css` light `--st-segmented-active-fg` | `var(--st-color-brand-primary)` | `var(--st-color-text-brand)` | 3.24 → 5.47 |

`--st-color-text-eyebrow` also drives Card `.metadataLabel`, `.aiToolLabel` and `.kpiLink`. All of them take the same change. Hero eyebrows are not known to read this token; step 0 confirms. If they do, STOP and flag.

Component CSS that bypasses the tokens above:

| Where | Current | New |
|---|---|---|
| `SegmentedControl.module.css` `.pillSegment:hover` color (l.49) | `var(--st-color-brand-primary)` | `var(--st-segmented-active-fg)` |
| `SegmentedControl.module.css` `.pillActive` color + inset box-shadow (l.54–55) | `var(--st-color-brand-primary)` | `var(--st-segmented-active-fg)` |
| `SegmentedControl.module.css` `.iconBtnActive` color + border-color (l.92–93) | `var(--st-color-brand-primary)` | `var(--st-segmented-active-fg)` |
| `Citation.module.css` `.note a` color (l.70) | `var(--st-color-brand-primary)` | `var(--st-color-link-default)` |
| `Label.module.css` `.required` color (l.13) | `var(--st-color-brand-primary)` | `var(--st-color-text-brand)` |

Because SegmentedControl now reads its token, dark needs an override to keep its current pink: `theme.pink-moon.css` dark `--st-segmented-active-fg` (new override; base is `--st-color-text-default`) → `var(--st-color-brand-primary)`. Visually unchanged (5.13 on canvas).

Focus outlines that read `brand-primary` are unchanged (non-text, pink on canvas is 3.24 ≥ 3.0).

### 3. Dark eyebrow and folio label → white (dark block only)

| Where | Current | New | Result (dark) |
|---|---|---|---|
| `theme.pink-moon.css` dark `--st-color-text-eyebrow` (new override) | inherits pink | `var(--st-color-text-default)` | card 4.45 → 15.19 |
| `theme.pink-moon.css` dark `--st-label-color-badge` | `var(--st-color-softgrey-500)` | `var(--st-color-text-default)` | label strip 4.27 → 16.46 |

Dark links and citation markers sit on canvas at 5.13 and stay pink.

### 4. Chips → neutral (both themes)

**Legacy colour chips (`Chip.module.css`).** The base `.chip` derives bg, border and text from `--_chip-color`. Replace the two theme blocks with one neutral rule:

| Where | Current | New |
|---|---|---|
| l.123–125 `[data-theme="light-pink-moon"] .chip:not(.active):not(.ruleDot)` | `border-color: color-mix(--_chip-color 60%, canvas)` | delete |
| l.127–141 light preset overrides (`.seafoam`, `.lime`, `.amber`, `.grey`) | darker `--chip-color` per preset | delete |
| l.143–153 dark `.grey` override and dark `.chip:not(.ruleDot):not(.dotColor)` tint | tinted bg, coloured border and text | delete |
| new rule, both themes: `.chip:not(.ruleDot):not(.dotColor):not(.featured)` | — | `background: var(--st-chip-tag-bg); border-color: var(--st-chip-border); color: var(--st-chip-fg);` |
| new rule, both themes: `.chip.active` | `background/border: var(--_chip-color); color: white` | `background: var(--st-color-text-default); border-color: var(--st-color-text-default); color: var(--st-color-bg-canvas);` |
| `.interactive:hover` (l.57–62) | tinted bg via `--_chip-color` | `background: var(--st-chip-tag-bg); border-color: var(--st-color-pink);` (keeps the decided pink hover border) |
| `.interactive:focus-visible` (l.64–67) | `outline: 2px solid var(--_chip-color)` | `outline: 2px solid var(--st-color-focus)` |
| `.active.interactive:hover` (l.79–83) | darkened `--_chip-color` | `background: var(--st-color-text-default); border-color: var(--st-color-pink);` |

Results: tag chip text 19.16 light / 12.08 dark; selected 17.12 light / 17.50 dark. The `.pink`, `.seafoam`, `.lime`, `.violet`, `.amber`, `.grey` classes stay so callers don't break; they no longer change the chip's appearance. Retiring them is in the leftovers issue.

**Featured rubric chip (tokens).** Becomes the standard neutral chip. Pink appears on it only on interactive hover, as on every chip.

| Token | Current | New |
|---|---|---|
| `tokens.css` `--st-chip-rubric-bg` | `color-mix(in srgb, var(--st-color-pink) 10%, white)` | `var(--st-chip-tag-bg)` |
| `tokens.css` `--st-chip-rubric-fg` | `var(--st-color-maroon)` | `var(--st-chip-fg)` |
| `tokens.css` `--st-chip-rubric-border` | `var(--st-color-pink)` | `var(--st-chip-border)` |
| `theme.pink-moon.css` dark `--st-chip-rubric-bg` | `color-mix(in srgb, var(--st-color-pink) 18%, var(--st-color-midnight-800))` | delete override |
| `theme.pink-moon.css` dark `--st-chip-rubric-fg` | `var(--st-color-pink)` (4.07, fails) | delete override |
| `theme.pink-moon.css` dark `--st-chip-rubric-border` (if present) | pink | delete override |

**Knowledge-graph filter chips (`theme.pink-moon.css` light block).**

| Token | Current | New |
|---|---|---|
| `--st-kg-chip-article-bg` / `-fg` / `-border` | seafoam-50 / seafoam-800 / seafoam 35% | `var(--st-chip-tag-bg)` / `var(--st-chip-fg)` / `var(--st-chip-border)` |
| `--st-kg-chip-case-bg` / `-fg` / `-border` | pink 8% / pink (2.72, fails) / pink 35% | `var(--st-chip-tag-bg)` / `var(--st-chip-fg)` / `var(--st-chip-border)` |
| `--st-kg-chip-all-*`, `--st-kg-chip-node-*` | ink fill, neutral-100 text | unchanged (already neutral) |

Graph node colours (`--st-kg-node-*`) are unchanged.

### 5. Status dots → pink, draft as a ring

| Where | Current | New |
|---|---|---|
| `tokens.css` `--st-chip-dot-evergreen` | `var(--st-color-lime-600)` | `var(--st-color-pink)` |
| `tokens.css` `--st-chip-dot-validated` | `var(--st-color-seafoam-700)` | `var(--st-color-pink)` |
| `tokens.css` `--st-chip-dot-exploring` | `var(--st-color-amber-700)` | `var(--st-color-pink)` |
| `tokens.css` `--st-chip-dot-deprecated` | `var(--st-color-neutral-500)` | `var(--st-color-pink)` |
| `tokens.css` `--st-chip-dot-active` | `var(--st-color-pink)` | unchanged |
| `tokens.css` `--st-chip-dot-draft` | `var(--st-color-violet)` | `var(--st-color-pink)` |
| `tokens.css` `--st-chip-dot-operationalized` | `var(--st-color-seafoam)` | `var(--st-color-pink)` |
| `theme.pink-moon.css` dark `--st-chip-dot-evergreen` / `-validated` / `-exploring` / `-deprecated` | lime / seafoam / amber / softgrey-500 | delete overrides |
| `Chip.module.css` `.dot-draft` (l.217) | `background: var(--st-chip-dot-draft)` | `background: transparent; border: 1.5px solid var(--st-chip-dot-draft); box-sizing: border-box;` |

Results (non-text, 3:1): 3.62 on a light card, 4.45 on a dark card. The status word carries the state; the ring marks draft. Every chip or dot used without a visible label must get one (or `aria-label`).

### 6. Inline code reads its own tokens (`globals.css`, `:not(pre) > code`)

Only the hard-coded box values change here. Colours change in Pass 2.

| Property | Current | New |
|---|---|---|
| font-size | `0.85em` | `var(--st-code-inline-font-size)` (0.9em) |
| padding | `0.2em 0.5em` | `var(--st-code-inline-padding)` (0.1em 0.35em) |
| border-radius | `4px` | `var(--st-radius-code)` (0) |
| white-space | not set | `nowrap` |

### 7. Reduced motion (`globals.css`, append)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```
Then disable the hover `translateY` lifts (cards, chips) and the `.st-duotone` 1.05 scale under `reduce` where they are declared.

## Out of scope (see ISSUE-XXXX-a11y-leftovers)

- Card titles stay `--st-color-text-primary` (18px / 600 is not large text).
- Legacy `--st-status-*` badge colours.
- Retiring the chip colour preset classes.
- Rich-text colours and treatments (Pass 2).

## Technical Constraints

- Token-only rule: no raw hex in component CSS.
- Both token-file copies stay byte-identical for every token touched.
- Do not change fills, borders or focus rings except where listed. The focus ring stays pink, 2px, 2px offset.
- Do not touch Sanity schema, GROQ or React components.

## Acceptance Criteria

- [ ] `pnpm validate:tokens --strict-colors` passes with zero new warnings.
- [ ] The token files diff clean between `apps/web` and `packages/design-system`.
- [ ] Computed contrast meets or beats:

| Pair | Theme | Target |
|---|---|---|
| White on primary button / hover | both | 4.80 / 6.90 |
| White on accent table header | both | 4.80 |
| Card eyebrow on card / on label strip | light | 6.12 / 4.82 |
| Link, citation marker, tertiary text, segmented active on canvas | light | 5.47 |
| Card eyebrow on card | dark | 15.19 |
| Folio badge label on label strip | dark | 16.46 |
| Tag chip text (any preset) | light / dark | 19.16 / 12.08 |
| Selected chip text | light / dark | 17.12 / 17.50 |
| Featured rubric chip text | light / dark | 19.16 / 12.08 |
| Status dot vs card (non-text) | light / dark | 3.62 / 4.45 |

- [ ] Storybook, both themes: Button (all variants, hover), Chip (every preset, active, featured, interactive hover, rule-dot status for every status), Card (eyebrow, folio strip, footer), Citation, Table (accent and subdued), SegmentedControl, knowledge-graph filter strip. No pink-500 text under 24px on light anywhere; no tinted chips anywhere; featured and plain tag chips are indistinguishable at rest.
- [ ] With OS reduced motion on, card, chip and button hovers do not translate and the duotone does not scale.
- [ ] Inline `code` renders square and does not wrap.
- [ ] Route smoke test: one article and one knowledge-graph node in both themes, with no change beyond the listed rows.

## Assumptions standing in for PRD

- Maroon (`--st-color-text-brand`) reads as pink-family on light and is accepted as the small-text form of pink.
- Losing per-status dot hues is accepted: the word plus ring/solid carries state (decided 10 Oct, v4).
- Pass 2 ships in the same release, so maroon links gain an underline.

## Post-Epic Close-Out

1. `git status` must show nothing staged or unstaged
2. Run `/mini-release EPIC-XXXX [Epic name]` or `/release` for MINOR version bumps
3. Start next epic only after mini-release commit is confirmed
