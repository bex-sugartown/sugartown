---
**Epic:** ST-150 — Pink Moon accessibility Pass 1: token contrast and neutral chips
**Issue:** [#150](https://github.com/bex-sugartown/sugartown/issues/150)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-150-a11y-pass-1-tokens.vspec.html`
---

# ST-150 — Pink Moon accessibility Pass 1: token contrast and neutral chips

Fix the WCAG 2.2 AA contrast failures in the Pink Moon token layer and make chips neutral, per the v4 audit and the 11 Oct handoff.

## Background

An earlier implementation of this epic (commit `c3af9a8c`, built from the v2 audit) was reverted on 2026-10-10 (`0712c8cf`) because it did not match the intended direction. The v4 audit (`docs/briefs/design-system/WCAG audit 26-10-10/Pink Moon Accessibility Audit v4 (standalone).html`) and its handoff (`.../handoff/EPIC-XXXX-a11y-pass-1-tokens.md`, revised 11 Oct) replace it. Principle: pink is the one hot colour and everything else is neutral. Failures it fixes: pink text on light at 3.24:1, white on pink fills at 3.62:1, tinted chips. Surfaces affected: every button, link, eyebrow, chip, table header, segmented control, citation and card. Related: #51 (chip neutral border), #50 (Storybook a11y gate), #151 (Pass 2, blocked by this).

## Objective

After this epic, every text pair in the token layer meets 4.5:1 (3:1 for non-text), small pink text on light is maroon, white labels sit on pink-600, all chips and the featured tag use the neutral tag chassis, status dots are pink with draft as a ring, and hover motion respects reduced-motion. Layers touched: tokens, theme CSS, component CSS (Button, Chip, SegmentedControl, Citation, Label, Card via tokens). Not touched: Sanity schema, GROQ, React markup, content.

## Scope

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

`--st-color-text-eyebrow` also drives Card `.eyebrow` (l.229), `.metadataLabel` (l.395), `.aiToolLabel` (l.508) and `.kpiLink` (l.515). All of them take the same change. Hero eyebrows are not known to read this token; step 0 confirms. If they do, STOP and flag.

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

### 3b. Light label colour on the card label strip (added 2026-10-11; not in the handoff)

| Where | Current | New | Result (light) |
|---|---|---|---|
| `theme.pink-moon.css` light `--st-label-color` (l.121) | `var(--st-color-neutral-500)` (`#6c6c6f`) | `var(--st-color-neutral-600)` (`#525252`) | label strip 4.12 → 6.15 |

### 4. Chips → neutral (both themes)

**Legacy colour chips (`Chip.module.css`).** The base `.chip` derives bg, border and text from `--_chip-color`. Replace the two theme blocks with one neutral rule:

| Where | Current | New |
|---|---|---|
| l.122–124 `[data-theme="light-pink-moon"] .chip:not(.active):not(.ruleDot)` | `border-color: color-mix(--_chip-color 60%, canvas)` | delete |
| l.126–137 light preset overrides (`.seafoam`, `.lime`, `.amber`, `.grey`) | darker `--chip-color` per preset | delete |
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
| `theme.pink-moon.css` dark `--st-chip-rubric-border` (present, l.274) | `var(--st-color-pink)` | delete override |

**Featured chip component CSS (`Chip.module.css`), not in the handoff.** The token change above does not finish the job:

| Where | Current | New |
|---|---|---|
| `.featured` (l.182 to 186) comment and `font-weight` | "Pink rubric", `font-weight: 600` | comment updated; `font-weight: 600` removed (decided 2026-10-11) so it matches plain tags at rest |
| `.featured.interactive:hover` (l.207 to 211) | keeps `--st-chip-rubric-border` and `-bg` | `border-color: var(--st-color-pink)`, so the featured chip gets the same pink hover as every chip |

**Chip colour presets stay (decided 2026-10-11, overrides the handoff).** The handoff made presets stop tinting and left removal to the leftovers issue. Bex wants the colour variants kept, so: a chip with no `color` is neutral; a chip with `color` or `colorHex` is tinted (`.tinted` in `Chip.module.css`), using the AA-safe light shades from section 4 of the earlier build (pink to maroon, violet-600, seafoam-800, lime-800, amber-800, grey neutral-600). Selected tinted chips: white label on those fills in light; in dark an ink label on the bright fill, and pink-600 with white for pink. `isActive` now works on tag and badge chips too (solid reversed fill). `featured` is a deprecated no-op: hidden from the docs API and marked `@deprecated`; the `--st-chip-rubric-*` tokens remain as aliases of the tag tokens, so the prop is not removed.

**Storybook controls (added in Visual QA, 2026-10-11, Bex's request).** Several stories ignored their controls. Fixed: Table (tone, zebra, density, layout, variant), SegmentedControl (label, starting option), Citation (index, note), CodeBlock inline code (sample text); the Chip Tag, Badge and Selectable stories also gained working controls. Button and Card already worked; their only fixed stories are the Chromatic snapshots, which stay fixed by design.

The rule-dot hover (`.ruleDot.interactive:hover`, `Chip.module.css`) also pinned the neutral border, so tag and badge chips never got the pink hover; only the featured chip did. It now sets the pink border too (found in Visual QA, 2026-10-11). The Storybook Tag and Badge stories gained `href: '#'` so the hover can be seen.

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
| white-space | not set | not `nowrap` (as built): `overflow-wrap: anywhere` and `box-decoration-break: clone`, because `nowrap` pushed long commands past the right edge at 320px (verified 2026-10-11) |

The DS `CodeBlock` component repeats the same hard-coded box values in its `.inline` class (`CodeBlock.module.css`: `0.2em 0.5em`, `4px`, `0.85em`). The handoff did not list it; it takes the same change (found 2026-10-11 in Storybook).

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

As built: the hover transforms are removed in a `reduce` block beside each rule (Chip hover, Card thumbnail zoom and hover lift, Media `hoverScale`, `.st-duotone` in `utilities.css`, and the web hero image zoom in `PageSections.module.css`), because CSS modules hash their class names and a global rule cannot reach them. The selected chip's ring shadow was dropped with the colour change.

## Phases

Single phase.

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

- [ ] `pnpm --filter @sugartown/design-system build` run before checking the local site (the web app loads component CSS from the built package, not source).
- [ ] Storybook, both themes: Button (all variants, hover), Chip (every preset, active, featured, interactive hover, rule-dot status for every status), Card (eyebrow, folio strip, footer), Citation, Table (accent and subdued), SegmentedControl, knowledge-graph filter strip. No pink-500 text under 24px on light anywhere; no tinted chips anywhere; featured and plain tag chips are indistinguishable at rest.
- [ ] With OS reduced motion on, card, chip and button hovers do not translate and the duotone does not scale.
- [ ] Inline `code` renders square and never overflows the viewport at 320px (as built; the handoff's "does not wrap" check was dropped).
- [ ] Route smoke test: one article and one knowledge-graph node in both themes, with no change beyond the listed rows.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

**Review of the 11 Oct handoff (2026-10-11).** Every file path, line number and "current" value was checked against the repo on this date. Line references to `Button.module.css`, `SegmentedControl.module.css`, `Citation.module.css` and `Label.module.css` are correct. Chip line numbers were off by one and are corrected above. The contrast figures were recomputed and match (pink-600 4.80, pink-700 6.90, maroon on white 6.12, on neutral-200 4.82, on canvas 5.47, tag chip 19.16 and 12.08, selected 17.12, light pink dot 3.62).

**Decided 2026-10-11:** (1) the featured chip loses its 600 weight and is indistinguishable from plain tags at rest; (2) the accent table header is the v4 pink-600 fill with a white label, replacing the 10 Oct option C.

**Approved 2026-10-11:** (3) knowledge-graph filter chips go neutral, losing the node-colour echo; (4) ST-150 and ST-151 ship in the same release, because Pass 1 turns links maroon without an underline until ST-151 adds it (WCAG 1.4.1); (5) the light `--st-label-color` fix in section 3b is added.

**Gaps found in the handoff:**
- **Light label colour not covered** by the handoff (4.12:1 on the label strip); now section 3b.
- **Legacy status badges still fail** after both passes: draft light 2.72, designing light 3.76, testing light 4.14, validated dark 4.12. They are in the leftovers issue; the epic's "AA pass" claim should say they are excluded.
- **`white-space: nowrap` on inline code** can overflow at 320px for long paths. Check, and add `overflow-wrap` or a scroll rule if it does.
- **Chromatic.** Every Chip and Card story changes. The Chromatic pass at close-out will show many diffs; budget the review.
- **`colorHex` and `color` callers.** Chips with a Sanity `colorHex` or a `color` prop stop tinting at once, before the leftovers issue retires the API. Find the callers in `apps/web` first.
- **Epic ID and close-out.** The handoff says `/mini-release` (retired); close-out is `/ship`. The `EPIC-XXXX` IDs are #150 and #151.

**Activation audits.** (1) Re-run the drift check: compare the "current" column to `packages/design-system/src/styles/` and `apps/web/src/design-system/styles/`. (2) Confirm hero eyebrows do not read `--st-color-text-eyebrow` (if they do, stop and flag). (3) Find callers of the Chip `color` and `colorHex` props. (4) Confirm `--st-color-text-brand` is maroon-600 in the light block (verified 2026-10-11, `theme.pink-moon.css` l.51).

**Token source.** Edit `tokens/source/tokens.json` and run `pnpm tokens:build` for base tokens; never hand-edit `tokens.css`. `theme.pink-moon.css` is hand-authored in both locations and checked by `pnpm validate:style-mirror`.

**Phase 0 gate fires** (Visual: yes). The v4 audit is the vspec; sign-off covers the Button, Chip, Table, Card and SegmentedControl specimens.

**Content Write Gate:** not applicable. **Schema:** none.

## Model & Mode [REQUIRED]

`/model sonnet`. Token values and component CSS with the decisions made.

## Non-Goals

- Rich-text colours and treatments (code, glossary, link underline, ARIA): ST-151.
- Card titles stay `--st-color-text-primary`.
- Retiring the chip colour preset classes and props (leftovers issue).
- Legacy `--st-status-*` badge colours (leftovers issue).
- Focus ring colour or size.
- Chip neutral border non-text contrast: #51.

## Related

- **GitHub:** [#150](https://github.com/bex-sugartown/sugartown/issues/150)
- **Next:** [#151](https://github.com/bex-sugartown/sugartown/issues/151) (Pass 2, blocked by this)
- **Handoff:** `docs/briefs/design-system/WCAG audit 26-10-10/handoff/EPIC-XXXX-a11y-pass-1-tokens.md`
- **Also:** #51, #50
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
