# SUG-59 — Hero Panel Treatment: Greyscale + Frosted Panel + Metadata Line

**Linear Issue:** SUG-59
**Status:** Backlog
**Priority:** Medium
**Source:** `docs/drafts/pink-moon-mock-B-sharp-paper.html` + `docs/briefs/design-system/pink-moon-manifesto.md` §Hero Panel
**Depends on:** SUG-21 (done), SUG-53 (done)

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — modifies `PageSections.module.css` (hero classes), `PageSections.jsx` (HeroSection renderer), `mediaOverlay.ts` (new preset). No new components; extends existing hero architecture.
- [x] **Use case coverage** — applies to all doc types that render heroSection (article, node, caseStudy, page). The panel treatment is a new overlay preset, not a replacement for existing treatments. Editors choose it via the existing `imageTreatment` field.
- [x] **Layout contract** — hero panel is centred (same as current), max-width 640px, zero radius. Inherits the Section Layout Contract (parent owns gap in detail context).
- [x] **All prop value enumerations** — `imageTreatment.type` options list will gain one new value: `'greyscale-panel'`
- [x] **Correct audit file paths** — verified via explorer
- [x] **Dark / theme modifier treatment** — explicit light/dark variants documented below
- [x] **Studio schema changes scoped** — YES. New value in `mediaOverlay.type` options list. Commit prefix: `feat(studio):`
- [x] **Web adapter sync scoped** — N/A (hero is app-level, not DS component)
- [x] **Composition overlap audit** — metadata line fields (`publishedAt`, `status`, word count) already exist on document schemas. No new fields added; GROQ projections may need to include them in the hero context.
- [x] **Atomic Reuse Gate** — extends existing heroSection architecture. No new component. Panel CSS is a class variant on the existing `.heroSection`.

---

## Context

The Pink Moon manifesto and PRD v3.0 describe a "frosted panel" hero treatment as the signature detail-page hero surface. It was mocked in `pink-moon-mock-B-sharp-paper.html` but never implemented in code. SUG-21 (Phases 1-4) shipped tokens, typography, radius, and Storybook but did not include the hero panel.

**Current hero architecture:**
- Full-bleed or content-width image with duotone/scrim/colour overlays
- Text centred over the image, contrast via text-shadow glow classes
- Eyebrow (teal, uppercase), heading (EB Garamond), subheading, CTA buttons
- Pseudo-element overlay system (::before for gradient, ::after for extreme duotone SVG filter)

**What the mock adds:**
- Greyscale image (desaturated, atmosphere only)
- Frosted glass panel (centred, bounded, `backdrop-filter: blur(32px)`)
- Structured metadata line (date, status, word count) in Courier Prime
- Lime eyebrow (not teal)
- Theme-aware panel opacity (light vs dark)

## Objective

After this epic, editors can select a "Greyscale + Panel" image treatment in the heroSection `imageTreatment` field. The hero renders with a desaturated background image, a frosted glass panel containing the eyebrow/title/subtitle/metadata/CTAs, and theme-aware light/dark variants.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | ☑ Yes | Pages render heroSection |
| `article` | ☑ Yes | Articles render heroSection |
| `caseStudy` | ☑ Yes | Case studies render heroSection |
| `node` | ☑ Yes | Nodes render heroSection |
| `archivePage` | ☐ No | Archive pages do not render heroSection |

---

## Scope

### Phase 0: HTML mock

Create an HTML mock in `docs/drafts/` showing the hero panel treatment with:
- Greyscale background image with gradient scrim
- Frosted glass panel (centred, backdrop-filter blur)
- Lime eyebrow (Courier Prime), EB Garamond heading, subtitle
- Metadata line (date, status, Courier Prime)
- CTA buttons inside panel
- Light and dark theme variants
- Imageless hero variant with lime/pink eyebrow

The existing `pink-moon-mock-B-sharp-paper.html` already contains this treatment. This phase validates that the mock values still align with the current token system before implementation.

Mock must be reviewed and approved before Phase 1 implementation begins.

### Phase 1: Schema + New Overlay Preset (1 commit, `feat(studio):`)

Add `'greyscale-panel'` to the `mediaOverlay.type` options list:

```ts
{title: 'Greyscale + Panel', value: 'greyscale-panel'}
```

No other schema changes. The hero already has `eyebrow`, `heading`, `subheading`, `backgroundImage`, `imageTreatment`, `ctas`. The metadata line (date, status) comes from the parent document, not the hero schema.

Deploy schema after this commit.

### Phase 2: Hero Panel CSS (1 commit)

New CSS classes in `PageSections.module.css`:

**Image treatment:**

```css
/* Greyscale + Panel: desaturated image, subtle scrim, frosted panel */
.heroTreatmentGreyscalePanel.heroWithImage {
  filter: none; /* filter on pseudo-element, not section */
}

.heroTreatmentGreyscalePanel.heroWithImage::before {
  background: linear-gradient(180deg, rgba(13,18,38,0.05) 0%, rgba(13,18,38,0.25) 100%);
  mix-blend-mode: normal;
}

/* Greyscale via CSS filter on the background image layer */
.heroTreatmentGreyscalePanel {
  --st-media-duotone-grayscale: 100%;
}
```

**Frosted panel:**

```css
.heroPanel {
  position: relative;
  z-index: 2;
  max-width: 640px;
  margin: 0 auto;
  padding: var(--st-space-7, 2.5rem) var(--st-space-6, 2rem);
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(32px) saturate(1.4);
  -webkit-backdrop-filter: blur(32px) saturate(1.4);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 0;
  text-align: center;
}
```

**Dark theme variant:**

```css
:global([data-theme="dark"]) .heroPanel,
:global([data-theme="dark-pink-moon"]) .heroPanel {
  background: rgba(13,18,38,0.45);
  border-color: rgba(255,255,255,0.08);
}
```

**Dark image filter (stronger desaturation):**

```css
:global([data-theme="dark"]) .heroTreatmentGreyscalePanel.heroWithImage::before,
:global([data-theme="dark-pink-moon"]) .heroTreatmentGreyscalePanel.heroWithImage::before {
  background: linear-gradient(180deg, transparent 15%, rgba(13,18,38,0.65) 100%);
}

:global([data-theme="dark"]) .heroTreatmentGreyscalePanel.heroWithImage {
  --st-media-duotone-grayscale: 100%;
  /* Darker via brightness reduction */
}
```

**Eyebrow override (lime, Courier Prime):**

```css
.heroTreatmentGreyscalePanel .heroEyebrow {
  color: var(--st-color-lime, #D1FF1D);
  font-family: var(--st-font-family-metadata, 'Courier Prime', monospace);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
}
```

**Metadata line (new element):**

```css
.heroMeta {
  font-family: var(--st-font-family-metadata, 'Courier Prime', monospace);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: var(--st-color-softgrey-200, #e1e3e6);
  margin-bottom: var(--st-spacing-stack-md);
}
```

### Phase 3: Renderer Updates (1 commit)

Update `PageSections.jsx` HeroSection component:

1. **Detect greyscale-panel treatment** — add to `parseOverlay()` switch:
   - `treatmentType = 'greyscale-panel'`
   - Maps to class `.heroTreatmentGreyscalePanel`

2. **Conditionally render panel wrapper** — when treatment is `greyscale-panel`, wrap `.heroContent` children in a `.heroPanel` div

3. **Render metadata line** — new `<p className={styles.heroMeta}>` containing date, status, word count (passed from parent page component via props or derived from document data)

4. **Strip text shadows** — greyscale-panel treatment sets `text-shadow: none` on all hero text elements (heading, subheading, eyebrow). The frosted panel provides contrast; shadows on top of blur look muddy. This overrides the glow classes (`.heroGlowDefault`, `.heroGlowDuotone`, etc.) that normally apply. Implementation: either skip the glow class assignment in the renderer, or apply a `.heroGlowNone` class that sets `text-shadow: none`.

### Phase 4: GROQ Projection Updates (1 commit, if needed)

The metadata line needs `publishedAt` and `status` from the parent document, not from the hero section. These are already available in page components (ArticlePage, NodePage, etc.) because they're projected at the document level.

**Word count:** deferred to SUG-56 (computed enrichments). Until then, the metadata line renders date and status only.

No GROQ changes expected unless we want to pass metadata into the hero section component as props.

---

## Query Layer Checklist

- [ ] `articleBySlugQuery` — verify `imageTreatment` is projected (already is: `imageTreatment` projected in hero conditional)
- [ ] `nodeBySlugQuery` — same
- [ ] `caseStudyBySlugQuery` — same
- [ ] `pageBySlugQuery` — same

No new projections needed. The `'greyscale-panel'` value is just a new enum entry in the existing `imageTreatment.type` field.

---

## Themed Colour Variant Audit

| Surface | Light (Pink Moon) | Dark (Pink Moon) | Token(s) |
|---------|-------------------|------------------|----------|
| Panel bg | `rgba(255,255,255,0.18)` | `rgba(13,18,38,0.45)` | New: `--st-hero-panel-bg` |
| Panel border | `rgba(255,255,255,0.15)` | `rgba(255,255,255,0.08)` | New: `--st-hero-panel-border` |
| Image gradient | `rgba(13,18,38,0.05)` → `rgba(13,18,38,0.25)` | `transparent` → `rgba(13,18,38,0.65)` | Inline on treatment class |
| Image filter | `grayscale(100%) contrast(0.9)` | `grayscale(100%) contrast(0.8) brightness(0.7)` | Inline on treatment class |
| Eyebrow colour | `var(--st-color-lime)` | `var(--st-color-lime)` | Same both themes |
| Meta text colour | `var(--st-color-softgrey-200)` | `var(--st-color-softgrey-200)` | Same both themes |
| Title colour | `var(--st-color-softgrey-50)` | `var(--st-color-softgrey-50)` | White text on panel |
| Subtitle colour | `var(--st-color-softgrey-100)` | `var(--st-color-softgrey-100)` | Slightly muted |

---

## Non-Goals

- **Not replacing existing treatments.** Greyscale-panel is additive. Duotone, scrim, and colour overlay remain available. Editors choose.
- **No left-aligned panel.** Mock showed left-aligned, but current architecture is centred and Bex's direction is to keep centred. If left-aligned is wanted later, it's a layout variant, not a treatment.
- **No word count in metadata line yet.** Depends on SUG-56 (computed enrichments). The metadata line renders date + status initially.
- **No CTA button style changes.** The existing primary/secondary/tertiary Button variants render inside the panel unchanged.

### Also in scope: Imageless hero eyebrow colour

The text-only hero (no background image) currently uses teal for the eyebrow. Update to match the Pink Moon palette:
- **Dark mode:** lime (`var(--st-color-lime)`)
- **Light mode:** pink (`var(--st-color-brand-primary)`)

This applies to `.heroImageless .heroEyebrow` and is independent of the panel treatment (it fixes the imageless hero regardless).

---

## Files to Modify

**Studio**
- `apps/studio/schemas/objects/mediaOverlay.ts` — add `'greyscale-panel'` to type options

**Frontend**
- `apps/web/src/components/PageSections.module.css` — new hero treatment classes + panel CSS + theme variants
- `apps/web/src/components/PageSections.jsx` — treatment detection, panel wrapper rendering, metadata line

**Pages (prop threading, if needed)**
- `apps/web/src/pages/ArticlePage.jsx` — pass `publishedAt`, `status` to PageSections for metadata line
- `apps/web/src/pages/NodePage.jsx` — same
- `apps/web/src/pages/CaseStudyPage.jsx` — same

---

## Acceptance Criteria

- [ ] `imageTreatment.type = 'greyscale-panel'` appears in Studio as an option on heroSection
- [ ] Hero with greyscale-panel renders: desaturated background image, frosted glass panel, centred
- [ ] Panel contains: lime eyebrow (Courier Prime), EB Garamond heading, subtitle, metadata line (Courier Prime), CTA buttons
- [ ] Light theme: panel bg is translucent white, image has subtle gradient scrim
- [ ] Dark theme: panel bg is translucent midnight, image has stronger gradient scrim + reduced brightness
- [ ] Metadata line shows date and status (word count placeholder for SUG-56)
- [ ] No text-shadow glow on greyscale-panel treatment (panel provides contrast)
- [ ] Renders correctly in detail context (respects Section Layout Contract)
- [ ] Test preview post hero updated to greyscale-panel for visual QA
- [ ] `pnpm validate:tokens` passes (if new tokens added)

---

## Risks / Edge Cases

- [ ] **`backdrop-filter` browser support** — well-supported in modern browsers but needs `-webkit-` prefix for Safari. The mock includes both. Fallback: solid background colour.
- [ ] **Image without treatment** — if an editor selects greyscale-panel but doesn't upload an image, the panel renders on a blank background. Guard: only render panel treatment when `backgroundImage` exists.
- [ ] **Panel width on mobile** — 640px max-width collapses naturally on narrow viewports. Padding may need reduction at mobile breakpoint.
- [ ] **Metadata line prop threading** — `publishedAt` and `status` live on the parent document, not on the heroSection schema. The page component needs to pass them to PageSections or the HeroSection needs to accept them as props. This is an architectural decision to make during implementation.

---

## Post-Epic Close-Out

1. Commit schema change first: `feat(studio): SUG-59 — greyscale-panel overlay preset`
2. Deploy schema: `npx sanity schema deploy`
3. Commit CSS + renderer: `feat(web): SUG-59 — hero panel treatment`
4. Move `docs/backlog/SUG-59-hero-panel-treatment.md` → `docs/shipped/`
5. Run `/mini-release SUG-59 Hero Panel Treatment`
6. Transition SUG-59 to **Done** in Linear
