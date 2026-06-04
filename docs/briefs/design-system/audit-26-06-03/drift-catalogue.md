# Layout Drift Catalogue — SUG-147

**Date:** 2026-06-04  
**Scope:** `apps/web/src/` + `packages/design-system/src/` CSS files  
**Purpose:** Gate artefact for SUG-148 — determines which Container and Stack tokens are needed before any primitive is written.

---

## FLEX PATTERNS

**195 `display: flex` usages across the codebase.**

Hardcoded gap values found (excluding `var(--st-*)` refs):

| Value | Count | Notes |
|-------|-------|-------|
| `0` | 17 | Intentional zero-gap — not drift |
| `0.5rem` (8px) | 13 | Most common non-zero gap |
| `0.375rem` (6px) | 5 | Chip/tag row gap |
| `0.25rem` (4px) | 5 | Tight inline gaps |
| `6px` | 5 | Duplicate of 0.375rem in px |
| `8px` | 4 | Duplicate of 0.5rem in px |
| `0.75rem` (12px) | 3 | Medium gap |
| `1rem` (16px) | 2 | Section-level inline gap |
| `1.5rem` (24px) | 2 | Wider row gap |
| `2rem` (32px) | 3 | Large row gap |
| `0.3rem`, `0.2rem`, `0.125rem` | ~5 | One-offs — no pattern |

**Gap scale candidates for Stack token:**

| Token key | Value | Frequency / use case |
|-----------|-------|---------------------|
| `--st-gap-xs` | 4px / 0.25rem | Tight inline (icon + label) |
| `--st-gap-sm` | 6px / 0.375rem | Chip row, tag strip |
| `--st-gap-md` | 8px / 0.5rem | Most common flex row gap |
| `--st-gap-lg` | 12px / 0.75rem | Medium section rows |
| `--st-gap-xl` | 16px / 1rem | Section-level inline |
| `--st-gap-2xl` | 24px / 1.5rem | Wide row / card grid |
| `--st-gap-3xl` | 32px / 2rem | Large layout row |

→ **Candidate: `Stack` primitive with `gap` prop accepting these token keys.**

---

## GRID PATTERNS

**33 `display: grid` usages across 17 files.**

Key surfaces:
- `Grid.module.css` — DS Grid primitive, already tokenised
- `Card.module.css` — card folio strip (2 instances each in web + DS)
- `Footer.module.css` — footer column grid
- `PageSections.module.css` — 2 instances (hero layout, section layout)
- `MetadataCard.module.css` — 3 instances (label grid)
- `Accordion.module.css` — expand/collapse grid row
- `SectionLabel.module.css` — label + rule grid
- `TaxonomyArchivePage.module.css` — alpha index grid
- `CwvSnapshot.module.css` — metrics grid

Most grid usages are in named layout components or DS primitives — not raw drift. The DS `Grid` component already handles the main multi-column case.

→ **No new Grid primitive needed.** Grid drift is localised and intentional.

---

## MAX-WIDTH / CONTAINER

### Tokenised widths (already in system)

| Token | Value | Files using it |
|-------|-------|----------------|
| `--st-width-detail` | 760px | 12+ files — article/node/page detail |
| `--st-width-detail-wide` | 1080px | 8+ files — entity pages, platform |

### Hardcoded values (drift)

| Value | Count | Files |
|-------|-------|-------|
| `1200px` | 3 | `Header.module.css`, `Footer.module.css`, `Preheader.module.css` |
| `1164px` | 3 | `CardBuilderSection.module.css`, `PageSections.module.css` (callout), `pages.module.css` (platform archive) |
| `800px` | 1 | `HomepageHero.module.css` |
| `700px` | 2 | `Hero.module.css` (content col), `PageSections.module.css` (hero content) — also in `--st-hero-content-max-width: 700px` token |
| `640px` | 2 | `TaxonomyArchivePage.module.css` (masthead), `SitemapPage.module.css` (breakpoint) |
| `540px` | 1 | `pages.module.css` (loading state) |

### Analysis

- `1200px` is the chrome/shell width (header, footer, preheader). Not a content container — a shell constraint. Candidate: `--st-width-shell: 1200px`.
- `1164px` is used in 3 places as "wide callout / platform archive" — sits between `detail-wide` (1080) and shell (1200). This is an inconsistency: CardBuilderSection uses 1164px, PageSections callout also uses 1164px, and `pages.module.css` platform archive uses 1164px. No token exists for this value.
- `700px` is already a token (`--st-hero-content-max-width`) but referenced as a raw value in 2 places — those references need updating to use the token.
- `640px` / `540px` / `800px` — one-offs, likely content-specific constraints, not container widths.

### Container token candidates needed

| Token | Value | Rationale |
|-------|-------|-----------|
| `--st-width-shell` | 1200px | Chrome constraint (header, footer) |
| `--st-width-page` | 1164px | Homepage + platform page shell — callout 1164px was drift, now fixed |
| `--st-hero-content-max-width` | 700px | Already exists — 2 raw usages need updating |

→ **Decision recorded (2026-06-04):** `1164px` is legitimate for homepage and platform page shell containers — needs `--st-width-page: 1164px` token. Callout section using `1164px` was drift — fixed to `width: 100%` (fills parent container).

---

## CENTERING PATTERNS (margin: 0 auto)

**~34 usages** of `margin: 0 auto` or `margin-inline: auto`.

This is the expected pattern for page-width containers — not drift per se. All legitimate usages pair with a `max-width` declaration. The pattern is consistent across the codebase.

→ **No action needed.** A `Container` primitive would encapsulate `max-width + margin: 0 auto + padding` but this is not blocking.

---

## ELEVATION / BOX-SHADOW

**No raw `box-shadow` values found outside of `color-mix()` expressions.**

All box-shadow usage falls into three categories:
1. `transition: box-shadow ...` — animation property, not a value
2. `box-shadow: none` — explicit removal
3. `color-mix()` expressions in Chip and Button — derived from the component's accent colour, not a fixed elevation value

→ **No elevation token drift.** No `--st-elevation-*` tokens needed at this stage. The system currently has no elevation scale — this is deliberate (flat design language).

---

## INPUT STATUS

### Verification commands run

```bash
find packages/design-system/src/components -iname "*input*" -o -iname "*textfield*"
# → no output

find apps/storybook -iname "*input*" -o -iname "*textfield*"
# → no output
```

### Result: **Input is NOT codified**

No `Input` component exists in `packages/design-system/src/components/`.  
No Input story exists in `apps/storybook/`.

→ **Input IS a deliverable of SUG-148.** It is the first component to codify in the leaf primitives phase.

---

## Summary — tokens and primitives needed before SUG-148

| Need | Token / primitive | Priority |
|------|------------------|----------|
| Gap scale for Stack | `--st-gap-xs` through `--st-gap-3xl` | High — needed before Stack primitive |
| Shell container width | `--st-width-shell: 1200px` | Medium — unify header/footer |
| Wide callout width | `--st-width-callout: 1164px` OR collapse to detail-wide | **Decision needed** — see above |
| Hero content width | Use existing `--st-hero-content-max-width` token in 2 raw usages | Low — cleanup only |
| Input component | New DS primitive | High — first SUG-148 deliverable |
| Stack primitive | New DS primitive with tokenised gap | High — second SUG-148 deliverable |
| Container primitive | New DS primitive (`max-width + margin: 0 auto`) | Medium — defer to post-gap-scale |
