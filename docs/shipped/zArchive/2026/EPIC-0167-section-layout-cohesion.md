# EPIC-0167: Section Layout Cohesion

> **Epic ID:** EPIC-0167
> **Status:** Complete
> **Priority:** High — affects visual consistency of every detail page
> **Triggered by:** Visual audit of the "Seafoam vs Lime" node page (2026-03-11)

---

## Problem Statement

Content and sections on detail pages (Node, Article) do not render as a cohesive whole. Sections were built incrementally — each plumbed individually without a layout contract that ensures visual interplay. Four issues compound:

1. **Dual content entry paths** — `content` (standalone portable text) and `sections[]` (structured section array) coexist on node and article schemas. Editors default to the standalone `content` field, but sections render with different typography and spacing. The two paths produce visually different output on the same page.

2. **CSS drift between content and textSection** — the standalone `.detailContent` and the section `.textContent` have different font sizes, heading sizes, heading colours, and margin stacks.

3. **Padding stacking** — sections render inside `.detailPage` (which has its own padding), but each section also applies its own `padding: 60px 32px`. This creates inconsistent vertical rhythm, especially visible on the CTA section.

4. **Image gallery not rendering** — a GROQ projection bug prevents `richImage` assets from resolving, so the image gallery section renders nothing on the web.

---

## Audit Findings

### Finding 1: CSS Drift — `.detailContent` vs `.textSection`

| Property | `.detailContent` (pages.module.css) | `.textSection .textContent` (PageSections.module.css) |
|----------|--------------------------------------|-------------------------------------------------------|
| Body font-size | `1.0625rem` (17px) | `var(--st-font-heading-4)` (18px) |
| Line-height | `1.75` | `var(--st-line-height-relaxed)` (1.75) |
| h2 font-size | `1.5rem` (24px) | `var(--st-font-heading-2)` (28px) |
| h2 colour | inherited (dark text) | `var(--st-color-brand-primary)` (pink #FF247D) |
| h2 margin-top | `2.5rem` (40px) | `var(--st-spacing-stack-xl)` (60px) |
| h2 margin-bottom | `0.75rem` (12px) | `var(--st-spacing-stack-md)` (16px) |
| h3 font-size | `1.25rem` (20px) | `var(--st-font-heading-3)` (~22px) |
| h3 margin-top | `2rem` (32px) | `var(--st-spacing-stack-lg)` (32px) |
| p margin | `margin-bottom: 1.25rem` (20px) | `margin: var(--st-spacing-stack-md) 0` (16px) |
| Blockquote | hardcoded `3px solid`, `padding-left: 1.25rem` | token-based `var(--st-blockquote-*)` |
| Link colour | `var(--st-color-brand-primary)` | `var(--st-color-link-default)` |

**Root cause:** `.detailContent` was written with hardcoded values before the token system existed. `.textContent` was written later and uses tokens. Nobody reconciled them.

### Finding 2: Padding / Margin Stacking

```
.detailPage           padding: 3rem 1.5rem 5rem   (48px top, 24px sides, 80px bottom)
  └─ <PageSections>
       └─ .textSection  padding: 60px 32px          (own vertical + horizontal padding)
       └─ .ctaSection   padding: 60px 32px          (own vertical + horizontal padding)
       └─ .imageGallery padding: 60px 32px          (own vertical + horizontal padding)
```

Sections rendered inside `.detailPage` stack horizontal padding: 24px (parent) + 32px (section) = 56px effective padding. And vertical spacing between adjacent sections doubles: 60px bottom of section A + 60px top of section B = 120px gap.

**The CTA section** is the most visible case because it's centered and bordered — the 120px gap above/below stands out clearly vs the ~20px paragraph gaps in content.

### Finding 3: Image Gallery Bug

**Schema:** `imageGallery.images[]` contains `richImage` objects (not plain `image`).

**`richImage` structure:**
```
richImage {
  asset: {               ← field named "asset", type: 'image'
    asset: { _ref: "image-xxx" }   ← the actual image reference
    hotspot: { ... }
    crop: { ... }
  },
  alt: "...",
  caption: "...",
  credit: "...",
}
```

**Current GROQ projection (broken):**
```groq
images[] { asset->, alt, caption }
```

This tries to dereference `richImage.asset` (an image *object*) as if it were a reference. It's not — the actual reference is at `richImage.asset.asset._ref`. Result: `asset` resolves to null → `{image.asset &&` guard skips rendering → gallery appears empty.

**Fix:**
```groq
images[] { asset { asset->, hotspot, crop }, alt, caption }
```

This dereferences the inner reference while preserving the image structure that `urlFor()` expects.

### Finding 4: Schema Redundancy — `content` + `sections`

| Schema | Has `content` field | Has `sections` field | Note |
|--------|--------------------|--------------------|------|
| node | ✅ | ✅ | Both present — content renders AFTER sections |
| article | ✅ | ✅ | Both present — sections render BEFORE content |
| caseStudy | ❌ | ✅ | Sections only — the clean model |
| page | ❌ | ✅ | Sections only |

**Problem:** When both fields exist, editors default to the `content` field (it's a familiar rich text box). They don't realise `textSection` exists and produces different output. The standalone `content` field should be deprecated on schemas that support sections, with existing content migrated into textSection blocks.

---

## Phases

### Phase 1: Fix image gallery (bug — ship immediately)

**GROQ fix** — update all 4 `imageGallery` projections in `queries.js`:

```groq
// Before (broken):
_type == "imageGallery" => {
  layout,
  images[] { asset->, alt, caption }
}

// After (fixed):
_type == "imageGallery" => {
  layout,
  images[] { asset { asset->, hotspot, crop }, alt, caption }
}
```

**Component fix** — `ImageGallerySection` in `PageSections.jsx`:

The component does `urlFor(image.asset)`. With the updated projection, `image.asset` will be `{ asset: { _id, url, ... }, hotspot, crop }` — a standard image source that `urlFor` handles correctly. The guard `{image.asset &&` remains valid. No component change needed if `urlFor` handles the nested asset structure. If it doesn't, flatten in the projection:

```groq
images[] {
  "asset": asset.asset->,
  "hotspot": asset.hotspot,
  "crop": asset.crop,
  alt,
  caption
}
```

**Files:** `apps/web/src/lib/queries.js`
**Commit:** `fix(web): resolve richImage asset projection in imageGallery GROQ`

### Phase 2: Unify section spacing — remove padding stacking

Sections should not define their own padding when rendered inside `.detailPage`. The parent container already provides horizontal padding and max-width.

**Approach:** Add a `.detailPage .textSection` (etc.) override, or restructure sections to use margin-block only (no horizontal padding) when inside a detail context.

Preferred: sections use `padding-block` only. Horizontal padding comes from the parent. This is a CSS-only change.

```css
/* PageSections.module.css — sections inside detail pages inherit horizontal padding */
.textSection,
.ctaSection,
.imageGallery {
  max-width: var(--st-width-detail);
  margin: 0 auto;
  padding-block: var(--st-spacing-stack-lg);   /* 32px, not 60px */
  padding-inline: 0;                           /* parent provides gutter */
}
```

But sections also render on non-detail pages (e.g. generic `page` type) where there IS no parent gutter. So the fix needs to be contextual. Options:
- A) CSS `:where(.detailPage) .textSection` override
- B) A `context` prop on `<PageSections context="detail" />`
- C) Remove `max-width` and `padding-inline` from sections entirely — let parent always provide containment

**Recommended: Option A** — least invasive. Override in `pages.module.css`:

```css
.detailPage .textSection,
.detailPage .ctaSection,
.detailPage .imageGallery {
  padding-inline: 0;
  max-width: none;            /* parent is already 760px */
  padding-block: var(--st-spacing-stack-lg);
}
```

This requires the CSS module class names to be available as global selectors or the override needs to live in PageSections.module.css with a `:global(.detailPage)` prefix.

**Files:** `apps/web/src/pages/pages.module.css`, `apps/web/src/components/PageSections.module.css`
**Commit:** `fix(web): normalise section spacing inside detail page containers`

### Phase 3: Unify typography — make `.detailContent` match section text

**Target:** `.detailContent` should use the same tokens as `.textContent` so that content and textSection text are visually identical.

| Property | Current (hardcoded) | Target (tokenised) |
|----------|--------------------|--------------------|
| Body font-size | `1.0625rem` | `var(--st-font-heading-4)` |
| h2 font-size | `1.5rem` | `var(--st-font-heading-2)` |
| h2 colour | inherited | `var(--st-color-brand-primary)` |
| h2 margin-top | `2.5rem` | `var(--st-spacing-stack-xl)` |
| h3 font-size | `1.25rem` | `var(--st-font-heading-3)` |
| p margin | `margin-bottom: 1.25rem` | `margin: var(--st-spacing-stack-md) 0` |
| Blockquote | hardcoded | `var(--st-blockquote-*)` tokens |
| Links | brand-primary | `var(--st-color-link-default)` |

**Files:** `apps/web/src/pages/pages.module.css`
**Commit:** `refactor(web): tokenise detailContent typography to match textSection`

### Phase 4: Deprecate standalone `content` field on section-enabled schemas

**Node and Article** both have `content` + `sections`. The `content` field should be deprecated:

1. Add `deprecated: { reason: 'Use textSection in the sections array instead' }` to the schema field (Sanity v5 deprecated field option)
2. Add a Studio description update: "⚠️ Legacy — use Page Sections → Text Section instead"
3. Move `content` to a `'legacy'` group (hidden by default)
4. **Migration script:** Convert existing `content` portable text to `textSection` blocks and append to `sections[]`

**Important:** Do NOT remove the field — existing published content must still render. The deprecation is editorial guidance + Studio UX, not data deletion.

**Files:** `apps/studio/schemas/documents/node.ts`, `apps/studio/schemas/documents/article.ts`, `scripts/migrate-content-to-sections.js`
**Commits:**
- `feat(studio): deprecate standalone content field on node and article schemas`
- `chore(scripts): add content-to-textSection migration script`

---

## Post-Mortem: Why Sections Drift

### What happened
Sections were built incrementally — hero first (EPIC-0145), text/CTA/gallery next (EPIC-0147), cardBuilder (EPIC-0160), callout (EPIC-0164). Each was plumbed end-to-end (schema → GROQ → component → CSS) and verified in isolation. Nobody checked how they look *adjacent to each other* on a real page, or how they compare to the standalone content block that existed before sections.

### Root causes

1. **No layout contract** — sections have no shared spec for spacing, typography, and containment. Each defines its own `padding`, `max-width`, and type scale independently. There's no "section reset" or shared section wrapper.

2. **No VQA step for visual/web epics** — epics that produce visible output (sections, cards, page layouts) were verified structurally (does the component render? does the query return data?) but not visually compared against adjacent content. There was no screenshot review or visual regression check.

3. **Standalone content predates sections** — the `content` field was the original rich text approach. Sections were added later as a parallel system. The two were never reconciled because sections were considered "for migrated HTML" rather than the primary content path.

4. **richImage naming collision** — the `richImage` object names its image field `asset`, which collides with Sanity's built-in `image.asset` reference path. The GROQ projection `asset->` looks correct at a glance but fails silently because it targets the wrong depth.

### Process fixes (add to conventions)

**1. Section Layout Contract (add to CLAUDE.md)**

All page sections must share:
- Horizontal containment: inherited from parent (no per-section `max-width` or `padding-inline` when inside a detail container)
- Vertical rhythm: `padding-block` only, using `--st-spacing-stack-lg` (32px) for standard sections
- Typography: body text uses `var(--st-font-heading-4)`, headings use `var(--st-font-heading-*)` scale, colours from `var(--st-color-text-*)` / `var(--st-color-brand-primary)`

**2. VQA gate for visual epics (add to epic template)**

Any epic that changes visible output must include a verification step:
- [ ] **Visual QA** — render the new component/section on a real page with realistic adjacent content. Screenshot or preview-inspect to verify spacing, typography, and colour consistency with neighbouring elements. Check at desktop and mobile breakpoints.

**3. GROQ projection audit for nested types**

When writing a GROQ projection for an array of objects that contain image fields, verify the depth of the asset reference. Schema types that wrap `image` in another object (like `richImage`) require an extra level of dereference: `asset { asset->, hotspot, crop }`, not `asset->`.

---

## Acceptance Criteria

- [ ] Image gallery renders images on the web for the "Seafoam vs Lime" node (and any other node/article/caseStudy with gallery sections)
- [ ] Adjacent sections on a detail page have consistent vertical spacing (no 120px gaps)
- [ ] Text in standalone `content` and `textSection` renders identically (same font size, heading size, heading colour, link colour)
- [ ] Standalone `content` field is marked deprecated in Studio with guidance to use textSection
- [ ] VQA checklist item added to epic template
- [ ] Section layout contract added to CLAUDE.md
