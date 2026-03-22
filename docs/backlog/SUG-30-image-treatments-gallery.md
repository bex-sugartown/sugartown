# EPIC TEMPLATE
# Sugartown — Claude Code Epic Prompt

**Epic ID:** EPIC-0000
**Linear Issue:** SUG-11

## EPIC NAME: Image Treatment Pipeline & Gallery Layouts

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — Existing components: `Media.jsx` (web adapter, duotone + color overlay), `Media.module.css`, `PageSections.jsx` (`ImageGallerySection` case), `Hero.jsx`. Schema objects: `richImage.ts`, `mediaOverlay.ts`, `imageGallery.ts`, `hero.ts`. Tokens: `--st-media-duotone-*` in `tokens.css`. This epic extends all of these — no forks needed.
- [x] **Use case coverage** — Media component consumers: `ImageGallerySection` (grid/carousel/masonry), `Hero` (background image with treatment), article/case-study inline images (via PortableText). The overlay system must support: no treatment, duotone presets (standard/featured/subtle), extreme duotone (SVG filter), dark scrim, and color overlay. Gallery layouts must support: grid, carousel (infinite loop), masonry.
- [x] **Layout contract** — Gallery grid: 3 columns, `gap: 1rem`, images fill columns equally. Carousel: single image visible, 100% width, aspect-ratio 16/9, infinite loop with clone-based seamless navigation, dot indicators + arrow buttons. Masonry: `columns: 3`, `break-inside: avoid`, natural image heights. Hero has two width variants controlled by `imageWidth` field: **full-width** (edge-to-edge, `width: 100vw`, negative margin to escape container, min-height 60vh) and **content-width** (constrained to page max-width, `border-radius: var(--st-media-duotone-radius)`, aspect-ratio 3/1). Both variants support image treatment overlay + dark scrim for text legibility.
- [x] **All prop value enumerations** — `mediaOverlay.type`: `none`, `duotone-standard`, `duotone-featured`, `duotone-subtle`, `color`. This epic adds: `duotone-extreme`, `dark-scrim`. `imageGallery.layout`: `grid`, `carousel`, `masonry` (unchanged). `hero.imageWidth`: `content-width`, `full-width` (existing, unchanged — but renderer must now respect these values for both background image sizing and scrim/treatment containment).
- [x] **Correct audit file paths** — All paths verified via `ls` and `Read`.
- [x] **Dark / theme modifier treatment** — Duotone and overlay treatments are image-level effects, not theme-dependent. The dark scrim uses `rgba(0,0,0,0.45)` gradient regardless of theme. Button glow effects in hero use `--st-shadow-pink-glow` / `--st-shadow-lime-glow` tokens which are already theme-aware.
- [x] **Studio schema changes scoped** — Schema changes to `mediaOverlay.ts` (add `duotone-extreme`, `dark-scrim` options) and `hero.ts` (add `eyebrow` field, `imageTreatment` field) are in scope with `feat(studio):` commit prefix.
- [x] **Web adapter sync scoped** — `Media.jsx` and `Media.module.css` changes are in scope. DS package mirror update is in scope.
- [x] **Composition overlap audit** — No new sub-objects added. `mediaOverlay` already embedded in `richImage`. Hero `imageTreatment` is a new field referencing `mediaOverlay` type — no overlap with existing `backgroundImage` (which is a plain `image` type, not `richImage`). `richImage.linkUrl` (bare `url` type) is **replaced** by `richImage.link` (type `linkItem`) — the old `linkUrl` field is deprecated/hidden in the same commit. This is a Single Field Authority fix: `linkItem` already supports external URLs (covering `linkUrl`'s use case) plus internal refs, open-in-new-tab, and label. Two link fields would be a bug per CLAUDE.md §Single Field Authority.
- [x] **Atomic Reuse Gate** — (1) SVG duotone filter is new — no existing equivalent. (2) Will be consumed by `Media.jsx`, `Hero.jsx`, and future components. (3) API is token-driven via CSS custom properties.

---

## Context

The site is live on Netlify. Images render but all overlay treatments (duotone, color overlay) are broken — the `mediaOverlay` data from Sanity is never projected in GROQ queries, so the frontend `Media` component receives no overlay prop and renders plain images.

The legacy WordPress site used a double-layer duotone technique: CSS `grayscale(100%) contrast(1.1)` + `::after` gradient overlay with `mix-blend-mode: hard-light`. The current `Media.module.css` implements this CSS technique correctly, but the data pipeline is severed at the GROQ layer.

Additionally, the carousel and masonry gallery layouts have no frontend implementation — `ImageGallerySection` renders all layouts as a basic grid. The hero section lacks an eyebrow field, image treatment control, and proper text legibility (dark scrim).

**Root causes identified (6):**

1. **GROQ projection gap** — `imageGallery` projections in all 4 slug queries project `images[] { asset, hotspot, crop, alt, caption }` but omit the `overlay` sub-object from `richImage`. The overlay data exists in Sanity but never reaches the frontend.
2. **Media adapter ↔ schema mismatch** — `Media.jsx` expects `overlay.type === 'duotone'` but the schema stores `duotone-standard`, `duotone-featured`, `duotone-subtle`. The adapter never matches, so the duotone CSS class is never applied.
3. **Missing carousel implementation** — `ImageGallerySection` renders a flat grid regardless of `layout` value. No carousel JS (slides, dots, arrows, infinite loop) exists.
4. **Missing masonry implementation** — Same as above; masonry layout value is ignored.
5. **Hero lacks treatment controls** — `hero.ts` schema has no `imageTreatment` or `eyebrow` field. Background image renders with no overlay and no scrim for text legibility.
6. **`richImage.linkUrl` is a bare URL field** — doesn't support internal page references or SPA navigation. Should use `linkItem` object instead. When no link is set (`link === null`), clicking an image should open a lightbox (embiggen) — but no lightbox component exists in the codebase.

**Files that exist and will be touched:**
- `apps/studio/schemas/objects/mediaOverlay.ts` — add `duotone-extreme`, `dark-scrim` options
- `apps/studio/schemas/sections/hero.ts` — add `eyebrow`, `imageTreatment` fields
- `apps/web/src/lib/queries.js` — add `overlay` to all `imageGallery` projections; add `imageTreatment` to hero projections
- `apps/web/src/design-system/components/media/Media.jsx` — fix overlay type matching, add SVG filter support
- `apps/web/src/design-system/components/media/Media.module.css` — add extreme duotone, dark scrim styles
- `apps/web/src/components/PageSections.jsx` — implement carousel and masonry renderers
- `apps/web/src/components/PageSections.module.css` — carousel/masonry styles
- `apps/web/src/components/Hero.jsx` — add eyebrow, treatment, scrim, tertiary button
- `apps/web/src/components/Hero.module.css` — scrim gradient, eyebrow styles, button glow

---

## Objective

After this epic, all five approved image treatments render correctly on the live site, driven by Sanity `mediaOverlay` data that flows through GROQ projections to the `Media` component. Gallery sections support grid, carousel (infinite-loop with dots/arrows), and masonry layouts. Hero sections support an eyebrow field, image treatment selection, dark scrim for WCAG text legibility, full-width and content-width layout variants, and primary/secondary/tertiary CTA buttons with brand glow effects. Images with links navigate (SPA-aware via `linkItem`); images without links open in a fullscreen lightbox.

**Data layer:** Schema changes to `mediaOverlay.ts` (2 new options), `hero.ts` (2 new fields), and `richImage.ts` (`linkUrl` → `linkItem` upgrade). Migration script backfills existing `linkUrl` data.
**Query layer:** All 4 slug query `imageGallery` projections updated to include `overlay` and `link`. Hero projections updated for `eyebrow` + `imageTreatment`.
**Render layer:** `Media.jsx` type-matching fixed, SVG extreme duotone filter added, link/lightbox click behaviour added, carousel/masonry layouts implemented, `ImageLightbox` component created, Hero component enhanced with width variants.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☑ Yes | Pages use `sections[]` which includes `imageGallery` and `heroSection` |
| `article`   | ☑ Yes | Articles use `sections[]`; inline `richImage` in PortableText also affected |
| `caseStudy` | ☑ Yes | Case studies use `sections[]` and `heroSection` |
| `node`      | ☑ Yes | Nodes use `sections[]` |
| `archivePage` | ☐ No | Archive pages do not render `sections[]` or image galleries |

---

## Scope

- [x] Studio schema: Add `duotone-extreme` and `dark-scrim` to `mediaOverlay.type` options
- [ ] Studio schema: Add `eyebrow` (string) and `imageTreatment` (mediaOverlay) fields to `hero.ts`
- [ ] GROQ: Add `overlay { type, overlayColor, overlayOpacity }` to all 4 `imageGallery` image projections
- [ ] GROQ: Add `eyebrow`, `imageTreatment` to all hero projections
- [ ] Frontend: Fix `Media.jsx` overlay type matching (`duotone-standard` → applies duotone class)
- [ ] Frontend: Add SVG `<filter>` element for `duotone-extreme` treatment (true colour-channel remapping)
- [ ] Frontend: Implement carousel layout in `ImageGallerySection` (infinite loop, dots, arrows)
- [ ] Frontend: Implement masonry layout in `ImageGallerySection` (CSS `columns: 3`)
- [ ] Frontend: Add dark scrim variant to `Media.module.css`
- [ ] Frontend: Enhance `Hero.jsx` — eyebrow (teal), treatment, scrim, tertiary button support, full-width vs content-width layout variants
- [ ] CSS: Add `--st-media-duotone-extreme-*` tokens, `--st-shadow-pink-glow`, `--st-shadow-lime-glow` tokens (if not already present)
- [ ] Studio schema: Replace `richImage.linkUrl` (bare `url`) with `richImage.link` (type `linkItem`); deprecate/hide old `linkUrl` field
- [ ] Frontend: Implement `ImageLightbox` component — fullscreen modal overlay, opens on click when image has no link, close on click/Escape/overlay-click, respects `alt` text
- [ ] Frontend: Wire `Media.jsx` to wrap image in `<Link>` (SPA) or `<a>` (external) when `link` is set, or attach lightbox click handler when `link` is null
- [ ] GROQ: Update `richImage` projections to include `link { type, "url": ... }` using `LINKITEM_URL_EXPR` pattern (same as CTA projections)
- [ ] Migration script: Backfill existing `linkUrl` values into `link` object shape (`{ type: 'external', externalUrl: linkUrl }`)
- [ ] DS package sync: Mirror `Media.jsx` and `Media.module.css` changes to `packages/design-system/`

---

## Query Layer Checklist

- [ ] `pageBySlugQuery` — add `overlay` to `imageGallery` images projection; add `eyebrow`, `imageTreatment` to hero projection
- [ ] `articleBySlugQuery` — add `overlay` to `imageGallery` images projection; add `eyebrow`, `imageTreatment` to hero projection
- [ ] `caseStudyBySlugQuery` — add `overlay` to `imageGallery` images projection; add `eyebrow`, `imageTreatment` to hero projection
- [ ] `nodeBySlugQuery` — add `overlay` to `imageGallery` images projection; add `eyebrow`, `imageTreatment` to hero projection
- [ ] Archive queries — excluded: archive cards do not render gallery sections or hero treatments

---

## Schema Enum Audit

| Field name | Schema file | `value` → Display title (copy from `options.list`) |
|-----------|-------------|-----------------------------------------------------|
| `mediaOverlay.type` | `mediaOverlay.ts` | `none → None`, `duotone-standard → Duotone (Standard)`, `duotone-featured → Duotone (Featured)`, `duotone-subtle → Duotone (Subtle)`, `color → Color Overlay` |
| `mediaOverlay.type` (NEW values) | `mediaOverlay.ts` | `duotone-extreme → Duotone (Extreme)`, `dark-scrim → Dark Scrim` |
| `imageGallery.layout` | `imageGallery.ts` | `grid → Grid (Equal Height)`, `carousel → Carousel (Slideshow)`, `masonry → Masonry (Pinterest Style)` |
| `hero.imageWidth` | `hero.ts` | `content-width → Content width`, `full-width → Full width` |

---

## Metadata Field Inventory

N/A — this epic does not modify MetadataCard or any metadata surface.

---

## Themed Colour Variant Audit

| Surface / component | Dark | Light | Pink Moon | Token(s) to set |
|---------------------|------|-------|-----------|-----------------|
| Duotone gradient start | `rgba(255, 36, 125, 0.55)` | same | same | `--st-media-duotone-standard-start` (existing) |
| Duotone gradient end | `rgba(43, 212, 170, 0.45)` | same | same | `--st-media-duotone-standard-end` (existing) |
| Dark scrim gradient | `linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)` | same | same | `--st-media-scrim-dark` (NEW) |
| Hero eyebrow colour | `var(--st-color-teal)` | same | same | inherits from `--st-color-teal` — no per-theme override needed |
| Hero title/subtitle | `#ffffff` | same | same | `--st-hero-text-color` (NEW, always white over image) |
| Primary button glow | `0 4px 20px rgba(255,36,125,0.4)` | same | same | `--st-shadow-pink-glow` |
| Secondary button glow | `0 4px 20px rgba(209,255,29,0.4)` | same | same | `--st-shadow-lime-glow` |
| Tertiary button | lime outline, lime glow on hover | same | same | `--st-button-tertiary-border`, `--st-button-tertiary-color` |

Note: Image treatments are content-level effects, not theme-dependent. The same duotone/scrim renders identically across all themes. Only the hero text/button chrome needs theme consideration, and those are always-light-on-dark-image by design.

---

## Non-Goals

- **No new section types** — this epic fixes existing `imageGallery` and `heroSection` types, not new ones.
- **No PortableText inline image overlay** — images embedded in rich text blocks via `richImage` within PortableText do not get gallery layouts or treatment controls in this epic. The overlay data will flow through (GROQ fix covers it), but carousel/masonry are section-level concerns only.
- **No light scrim variant** — only dark scrim is in scope. Light scrim (for dark-background hero with dark text) is deferred pending design decision.
- **No hero video background** — video support deferred to a future epic.
- **No Storybook stories** — Stories for Media/Gallery/Hero deferred to a design-system documentation epic.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`, `packages/design-system`
- No migration script needed — schema changes are additive (new option values, new fields with no data backfill)

**Schema (Studio)**
- `mediaOverlay.ts` — add 2 values to `options.list`: `duotone-extreme`, `dark-scrim`
- `hero.ts` — add `eyebrow` field (type: `string`, max 80 chars) and `imageTreatment` field (type: `mediaOverlay`)
- `richImage.ts` — replace `linkUrl` (type: `url`) with `link` (type: `linkItem`); hide deprecated `linkUrl` with `hidden: true` + deprecation description (do NOT remove — existing data may reference it)
- No new section types to register in `index.ts`
- `mediaOverlay` and `linkItem` are already registered — no changes to `index.ts`

**Query (GROQ)**
- All 4 slug queries must add `overlay { type, overlayColor, overlayOpacity }` inside `imageGallery` → `images[]` projection
- All 4 slug queries must add `eyebrow` and `imageTreatment { type, overlayColor, overlayOpacity }` inside hero projection
- The `overlay` sub-object sits on `richImage`, which nests `asset` (type `image`) inside it — the projection must be: `images[] { "asset": asset.asset->, "hotspot": asset.hotspot, "crop": asset.crop, alt, caption, overlay { type, overlayColor, overlayOpacity }, link { type, "url": <LINKITEM_URL_EXPR>, openInNewTab } }`
- The `link` projection must use the same `LINKITEM_URL_EXPR` pattern as CTA projections (coalesce internal ref slug → external URL) for consistent URL resolution
- Legacy `linkUrl` field: GROQ should project `"legacyLinkUrl": linkUrl` as a fallback until migration is confirmed complete; frontend resolves `link.url ?? legacyLinkUrl`

**Render (Frontend)**

*Media adapter fix:*
- Current: `overlay?.type === 'duotone'` — never matches schema values like `duotone-standard`
- Fix: `overlay?.type?.startsWith('duotone')` for the duotone class, then branch on specific preset
- For `duotone-extreme`: embed an SVG `<filter>` using `<feColorMatrix>` + `<feComponentTransfer>` for true colour-channel remapping. The SVG filter replaces the CSS `grayscale + hard-light` technique with direct shadow→pink / highlight→seafoam channel mapping.
- For `dark-scrim`: a `::after` gradient overlay with `rgba(0,0,0,0.65)` → `transparent`, no blend mode (normal), no grayscale.

*Image click behaviour (linkItem + lightbox):*
- If `link` is set and `link.type === 'internal'`: wrap image in `<Link to={url}>` for SPA navigation
- If `link` is set and `link.type === 'external'`: wrap image in `<a href={url}>` with optional `target="_blank"`
- If `link` is null/undefined: attach `onClick` handler that opens `ImageLightbox` component
- `ImageLightbox`: fullscreen overlay (`position: fixed`, `inset: 0`, `z-index: var(--st-z-modal)`), dark backdrop (`rgba(0,0,0,0.85)`), centred image scaled to fit viewport with padding, close on `Escape` key / click outside / close button. Renders `alt` text as visible caption below image. Traps focus (a11y).
- Cursor: `pointer` when linked, `zoom-in` when lightbox-eligible

*Carousel implementation:*
- Clone-based infinite loop: clone last N slides → prepend, first N slides → append
- Smooth scroll to clone, then silent snap (no transition) back to real slide
- Dot indicators track current slide via `scroll` event + debounce
- Arrow buttons for prev/next
- Touch/swipe support via native CSS `scroll-snap-type: x mandatory`

*Masonry implementation:*
- CSS `columns: 3` + `break-inside: avoid` on each item
- NOT `display: grid` — CSS Grid masonry is not widely supported
- Responsive: 1 column on mobile, 2 on tablet, 3 on desktop

*Hero enhancement:*
- Eyebrow renders above heading in teal (`var(--st-color-teal)`), uppercase, small font
- Dark scrim: `::before` gradient overlay on background image for text legibility
- Buttons: primary = pink bg + pink glow, secondary = lime bg + lime glow, tertiary = lime outline + lime glow on hover
- Support 0–3 CTAs (currently 0–2, extend to 3 for tertiary)
- **Full-width vs content-width** — the existing `imageWidth` schema field (`content-width` | `full-width`) must be respected:
  - `full-width`: hero spans edge-to-edge (`width: 100vw`, negative margin to break out of container), background image covers entire viewport width, min-height 60vh, no border-radius. Content overlay centred within `max-width` reading column.
  - `content-width`: hero stays within page `max-width`, background image contained, `border-radius: var(--st-media-duotone-radius)`, aspect-ratio `var(--st-media-hero-aspect-ratio, 3/1)`. Content overlay aligned to bottom-left with padding.
  - Both variants apply the same dark scrim and `imageTreatment` overlay — the scrim/treatment container matches the image bounds (edge-to-edge for full-width, rounded for content-width).
  - GROQ already projects `imageWidth` — no query change needed for this field.

**Design System → Web Adapter Sync**
- `Media.jsx` and `Media.module.css` in `apps/web/src/design-system/components/media/` must mirror changes to DS package
- SVG filter definition can live in `Media.jsx` as an inline `<svg>` with `<defs>` — no separate file needed

---

## Migration Script Constraints

**Target doc count**
Before writing the script, run a GROQ count query:
```groq
count(*[_type in ["page", "article", "caseStudy", "node"] && defined(sections[_type == "imageGallery"].images[defined(linkUrl)])])
```
Expected count: `___` (TBD at execution time — likely low, most images don't have `linkUrl` set)

Also count richImage usage in PortableText body content:
```groq
count(*[defined(content[_type == "richImage" && defined(linkUrl)])])
```

**Skip condition review**
- Skip if `linkUrl` is not defined — no data to migrate. Correct because `link` is a new optional field; images without `linkUrl` simply get no `link` object (which triggers lightbox behaviour).
- Skip if `link` is already defined — idempotency guard. Correct because re-running should not overwrite a manually-set `linkItem`.

**Idempotency**
Re-running produces no change: the script checks `defined(link)` and skips documents where `link` is already set. `setIfMissing` is NOT appropriate here because we need to transform `linkUrl` → `link` (different field name and shape), not just set a default.

**Migration shape:**
```js
// For each richImage with linkUrl defined and link undefined:
patch.set({
  'sections[_type == "imageGallery"].images[defined(linkUrl) && !defined(link)].link': {
    _type: 'linkItem',
    type: 'external',
    externalUrl: '<value from linkUrl>',
    openInNewTab: false
  }
})
```
Note: Sanity array patches with deep paths may need per-document iteration. Follow existing migration patterns in `apps/studio/scripts/`.

---

## Files to Modify

**Studio**
- `apps/studio/schemas/objects/mediaOverlay.ts` — add `duotone-extreme`, `dark-scrim` to `options.list`
- `apps/studio/schemas/sections/hero.ts` — add `eyebrow` (string) and `imageTreatment` (mediaOverlay) fields; extend `ctas` max from 2 to 3
- `apps/studio/schemas/objects/richImage.ts` — replace `linkUrl` with `link` (type: `linkItem`); hide deprecated `linkUrl`

**Frontend — Queries**
- `apps/web/src/lib/queries.js` — add `overlay` to `imageGallery` images projection in all 4 slug queries; add `eyebrow` + `imageTreatment` to hero projection in all 4 slug queries

**Frontend — Components**
- `apps/web/src/design-system/components/media/Media.jsx` — fix overlay type matching; add SVG extreme filter; add dark scrim support; add link/lightbox click behaviour
- `apps/web/src/design-system/components/media/Media.module.css` — add `.darkScrim`, `.duotoneExtreme` modifiers; add `.clickable` cursor styles
- `apps/web/src/components/ImageLightbox.jsx` — CREATE: fullscreen modal overlay for image embiggen
- `apps/web/src/components/ImageLightbox.module.css` — CREATE: lightbox styles (backdrop, centred image, close button, caption)
- `apps/web/src/components/PageSections.jsx` — implement `CarouselGallery` and `MasonryGallery` sub-components in `ImageGallerySection`
- `apps/web/src/components/PageSections.module.css` — carousel styles (dots, arrows, scroll-snap), masonry styles (columns, break-inside)
- `apps/web/src/components/Hero.jsx` — add eyebrow rendering, imageTreatment prop, dark scrim, tertiary button slot
- `apps/web/src/components/Hero.module.css` — scrim gradient, eyebrow styles, button glow effects

**Frontend — Tokens**
- `apps/web/src/design-system/styles/tokens.css` — add `--st-media-scrim-dark`, `--st-media-duotone-extreme-*` tokens, verify `--st-shadow-pink-glow` / `--st-shadow-lime-glow` exist
- `packages/design-system/src/styles/tokens.css` — mirror token additions (same commit)

**Scripts**
- `apps/studio/scripts/migrate-richImage-linkUrl-to-linkItem.mjs` — CREATE: backfill `linkUrl` → `link { type: 'external', externalUrl: linkUrl }`

**DS Package Sync**
- `packages/design-system/src/components/Media/Media.tsx` — mirror JSX changes from web adapter
- `packages/design-system/src/components/Media/Media.module.css` — mirror CSS changes

---

## Deliverables

1. **Schema update** — `mediaOverlay.ts` has 7 options (5 existing + `duotone-extreme` + `dark-scrim`); `hero.ts` has `eyebrow` and `imageTreatment` fields; `ctas` max extended to 3
2. **GROQ projections** — all 4 slug queries project `overlay { type, overlayColor, overlayOpacity }` inside `imageGallery` images; all 4 project `eyebrow` + `imageTreatment` inside hero
3. **Media overlay rendering** — `Media.jsx` correctly applies duotone CSS class for `duotone-standard`, `duotone-featured`, `duotone-subtle`; applies SVG filter for `duotone-extreme`; applies scrim gradient for `dark-scrim`; applies color overlay for `color`
4. **Carousel layout** — `ImageGallerySection` renders infinite-loop carousel with dot indicators, arrow buttons, scroll-snap, and touch/swipe when `layout === 'carousel'`
5. **Masonry layout** — `ImageGallerySection` renders CSS multi-column masonry when `layout === 'masonry'`
6. **Hero enhancement** — `Hero.jsx` renders eyebrow (teal), applies image treatment from Sanity data, renders dark scrim for text legibility, supports 3 CTAs with brand glow effects. Full-width hero breaks out of container (edge-to-edge, no radius); content-width hero stays within page max-width (rounded corners, 3:1 aspect ratio). Both variants apply scrim + treatment correctly.
7. **Token sync** — both `tokens.css` files updated in same commit with new media tokens
8. **DS package sync** — `packages/design-system/src/components/Media/` mirrors web adapter changes
9. **linkItem upgrade** — `richImage.linkUrl` replaced by `richImage.link` (type `linkItem`); old field hidden; GROQ projects `link` with `LINKITEM_URL_EXPR` and `legacyLinkUrl` fallback
10. **ImageLightbox** — `ImageLightbox.jsx` component exists, renders fullscreen overlay when image with no link is clicked, closes on Escape/click-outside/close-button, shows alt caption, traps focus
11. **Migration script** — `migrate-richImage-linkUrl-to-linkItem.mjs` backfills existing `linkUrl` values into `link` shape; dry-run reports expected count; `--execute` migrates with 0 errors; re-run reports 0 to patch

---

## Acceptance Criteria

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors
- [ ] Studio hot-reloads without errors; `mediaOverlay` type field shows 7 radio options; hero section shows `eyebrow` and `imageTreatment` fields
- [ ] **GROQ smoke-test**: query a page with an `imageGallery` section — response includes `overlay` object on each image (not null/missing)
- [ ] **GROQ smoke-test**: query a page with a `heroSection` — response includes `eyebrow` and `imageTreatment` fields
- [ ] **Duotone standard**: image with `overlay.type === 'duotone-standard'` renders with grayscale + pink-to-seafoam gradient overlay
- [ ] **Duotone extreme**: image with `overlay.type === 'duotone-extreme'` renders with SVG colour-channel remapping (shadows→pink, highlights→seafoam)
- [ ] **Dark scrim**: image with `overlay.type === 'dark-scrim'` renders with bottom-to-top dark gradient, no grayscale, no blend mode
- [ ] **Color overlay**: image with `overlay.type === 'color'` renders with author-specified colour at author-specified opacity
- [ ] **Carousel**: gallery with `layout === 'carousel'` shows single slide, navigates via dots/arrows/swipe, loops infinitely (slide 5 → slide 1 seamlessly, slide 1 ← slide 5 seamlessly)
- [ ] **Masonry**: gallery with `layout === 'masonry'` renders 3-column layout on desktop, 2 on tablet, 1 on mobile; images retain natural aspect ratio
- [ ] **Hero eyebrow**: hero with `eyebrow` set renders teal uppercase text above heading
- [ ] **Hero full-width**: hero with `imageWidth === 'full-width'` renders edge-to-edge (viewport width), no border-radius, min-height 60vh, content centred within max-width
- [ ] **Hero content-width**: hero with `imageWidth === 'content-width'` renders within page max-width, rounded corners (`--st-media-duotone-radius`), aspect-ratio 3:1
- [ ] **Hero width + treatment**: both full-width and content-width heroes correctly apply dark scrim and image treatment overlays — scrim/treatment container matches image bounds in each variant
- [ ] **Hero buttons**: primary = pink bg + pink glow, secondary = lime bg + lime glow, tertiary = lime outline + lime glow on hover
- [ ] **WCAG legibility**: hero text over image with dark scrim passes WCAG AA contrast (white text on dark scrim ≥ 4.5:1)
- [ ] **Token sync**: `pnpm validate:tokens` reports zero errors after token changes
- [ ] **Visual QA**: all 5 treatments verified on a real page with realistic images at desktop and mobile breakpoints
- [ ] **Image with link**: clicking an image with `link` set navigates to the correct URL (internal = SPA `<Link>`, external = `<a>` with optional new tab)
- [ ] **Image lightbox (no link)**: clicking an image with no `link` opens fullscreen lightbox; image centred and scaled to viewport; alt text visible as caption; closes on Escape key, click outside, and close button
- [ ] **Lightbox a11y**: focus is trapped inside lightbox when open; focus returns to triggering image on close; lightbox has `role="dialog"` and `aria-label`
- [ ] **Cursor hint**: images with link show `cursor: pointer`; images without link show `cursor: zoom-in`
- [ ] **linkUrl migration**: dry-run reports expected count; after `--execute`, re-run reports 0; existing `linkUrl` values accessible via new `link` object in frontend
- [ ] **Legacy fallback**: images with old `linkUrl` data (pre-migration) still work via `legacyLinkUrl` GROQ fallback until migration is confirmed

---

## Risks / Edge Cases

**Schema risks**
- [x] `eyebrow` field name does not collide with any existing hero field
- [x] `imageTreatment` is a new field using existing `mediaOverlay` type — no registration needed
- [ ] Extending `ctas` max from 2 to 3 — verify hero layout doesn't break with 3 buttons on mobile (may need flex-wrap)
- [ ] `richImage.linkUrl` → `richImage.link` rename: hiding `linkUrl` does NOT delete existing data. Old `linkUrl` values remain in Sanity documents until migration runs. GROQ must project both `link` and `legacyLinkUrl` as a safety net.
- [ ] `linkItem` type on `richImage` — `linkItem` supports `label` field which is meaningless for an image click target (the image IS the clickable thing, not a text label). Consider hiding `label` via `hidden: true` when `linkItem` is used inside `richImage` — or accept it as harmless.

**Query risks**
- [ ] All 4 slug queries must be updated — use Query Layer Checklist, do not rely on memory
- [ ] The `overlay` sub-object projection must NOT use `overlay->` (it's an embedded object, not a reference)
- [ ] Archive queries intentionally excluded — gallery sections don't appear in card views

**Render risks**
- [ ] SVG `<filter>` element must be present in the DOM before any `<img>` references it via `filter: url(#duotone-extreme)`. Embed the `<svg><defs>` at the top of `Media.jsx` output, hidden with `width=0 height=0`.
- [ ] Carousel `IntersectionObserver` or scroll-position tracking must handle rapid arrow clicks without race conditions — debounce with `setTimeout`
- [ ] Masonry `columns` CSS doesn't support equal-height items — this is by design (Pinterest-style), but may surprise editors expecting a grid. Add description text in schema.
- [ ] `dark-scrim` with no image is meaningless — add null guard (if no image, skip scrim rendering)
- [ ] Hero with 3 CTAs on mobile: buttons may overflow. Use `flex-wrap: wrap` + `gap` for graceful stacking.
- [ ] **Full-width hero breakout** — `width: 100vw` + negative margin technique can cause horizontal scrollbar if `overflow-x: hidden` is not set on a parent. Verify the page wrapper or `<body>` has `overflow-x: hidden`. Content-width hero does not have this risk.
- [ ] **Content-width hero aspect ratio** — 3:1 aspect ratio may crop too aggressively on mobile. Consider overriding to 16:9 or auto below a breakpoint. Verify with a real image at 375px viewport width.
- [ ] **Scrim containment per variant** — full-width scrim must be `position: absolute; inset: 0` within the full-bleed container. Content-width scrim must respect `border-radius` (use `overflow: hidden` on the rounded parent). If scrim bleeds past rounded corners, it's a visual bug.

**Migration risks**
- [ ] `richImage` appears in multiple contexts: `imageGallery.images[]` (section), PortableText body content blocks, and potentially other arrays. The migration script must handle ALL locations where `richImage` with `linkUrl` exists, not just `sections[].images[]`.
- [ ] Deep array patching in Sanity is fragile — may need to read each document, transform in JS, and write back (not use path-based `patch.set`). Follow the pattern in `migrate-colorHex-to-color-object.mjs`.
- [ ] If any `linkUrl` contains a relative path (e.g. `/about`), it should be migrated as `type: 'external'` with the relative URL preserved — `linkItem` external URL validation allows `allowRelative: true`.

**Lightbox risks**
- [ ] Lightbox `z-index` must be above all other layers (nav, hero scrim, etc.). Use `var(--st-z-modal)` or a high fixed value (9999).
- [ ] Large images may exceed viewport — use `max-width: 90vw; max-height: 85vh; object-fit: contain` to prevent overflow.
- [ ] Lightbox should disable body scroll while open (`overflow: hidden` on `<body>`) and restore on close.
- [ ] Gallery carousel images in lightbox: consider whether lightbox should also support prev/next navigation within the gallery context (deferred if complex — v1 can be single-image only).

---

## Commit Plan (7 commits)

1. `feat(studio): add extreme duotone and dark scrim options to mediaOverlay; add eyebrow and imageTreatment to hero`
2. `feat(studio): replace richImage.linkUrl with linkItem; deprecate old field`
3. `fix(queries): project overlay and link data in imageGallery and hero across all slug queries`
4. `fix(media): correct overlay type matching in Media adapter; add SVG extreme filter and dark scrim`
5. `feat(media): add linkItem navigation and lightbox embiggen to Media component`
6. `feat(gallery): implement carousel (infinite loop) and masonry layouts in ImageGallerySection`
7. `feat(hero): add eyebrow, image treatment, dark scrim, full-width/content-width variants, and tertiary button support`

Each commit should be independently deployable. Commit 2 is a schema-only change (per CLAUDE.md §Studio schema changes get their own commit). Commit 3 (GROQ fix) unblocks all existing duotone + link data. Commits 4–5 make that data render. Commits 6–7 add new layout and hero capabilities.

Migration script (`migrate-richImage-linkUrl-to-linkItem.mjs`) runs between commits 2 and 3 — schema must be deployed before migration, and GROQ must project `link` before the frontend consumes it.

---

## Approved Design Decisions (from mockup review 2026-03-21)

### Universal Image Treatments

| # | Treatment | Description |
|---|-----------|-------------|
| 1 | **No Treatment** | Raw image, no filter, no overlay |
| 2 | **No Treatment + Dark Scrim** | Raw image + bottom-to-top dark gradient for text legibility |
| 3 | **Extreme Duotone + Gradient** | SVG `feComponentTransfer` colour-channel remap (shadows→pink, highlights→seafoam) + subtle gradient. WP legacy match. |
| 4 | **Standard Duotone + Dark Scrim** | CSS grayscale + hard-light gradient overlay + dark scrim for text |
| 5 | **Color Overlay** | Author-selected hex colour at author-selected opacity |

### Hero Spec

- **Eyebrow**: Teal (`var(--st-color-teal)`), uppercase, smaller font size
- **Title**: White, large heading
- **Subtitle**: White, body text
- **Primary button**: Pink background, pink glow (`--st-shadow-pink-glow`)
- **Secondary button**: Lime background, lime glow (`--st-shadow-lime-glow`)
- **Tertiary button**: Lime outline, lime glow on hover
- **Dark scrim**: `linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)`

**Width variants** (existing `imageWidth` field, values: `content-width` | `full-width`):

| Variant | Width | Border radius | Aspect ratio | Min height | Content position |
|---------|-------|---------------|-------------|------------|-----------------|
| **Full-width** | `100vw` (edge-to-edge breakout) | none | none (natural) | 60vh | Centred within `max-width` reading column |
| **Content-width** | Page `max-width` | `var(--st-media-duotone-radius)` (35px) | `var(--st-media-hero-aspect-ratio, 3/1)` | none (aspect ratio governs) | Bottom-left aligned with padding |

Both variants share the same scrim, treatment overlay, eyebrow, and button rendering — only the containment and shape differ. The scrim `::before` pseudo-element uses `inset: 0` + `border-radius: inherit` so it automatically conforms to whichever variant is active.

### Gallery Layouts

- **Grid**: CSS Grid, equal-height cells, existing implementation (working)
- **Carousel**: Infinite-loop, clone-based seamless navigation, dot indicators + arrows, scroll-snap for touch/swipe
- **Masonry**: CSS `columns: 3` + `break-inside: avoid`, responsive (3 → 2 → 1 columns)

### SVG Extreme Duotone Filter

```xml
<filter id="duotone-extreme" color-interpolation-filters="sRGB">
  <feColorMatrix type="saturate" values="0" />
  <feComponentTransfer>
    <feFuncR type="table" tableValues="1.0  0.17" />
    <feFuncG type="table" tableValues="0.14 0.83" />
    <feFuncB type="table" tableValues="0.49 0.67" />
  </feComponentTransfer>
</filter>
```

Shadow colour: `rgb(255, 36, 125)` → `tableValues` R=1.0, G=0.14, B=0.49
Highlight colour: `rgb(43, 212, 170)` → `tableValues` R=0.17, G=0.83, B=0.67

---

## Post-Epic Close-Out

1. **Activate the epic file** — assign next EPIC number, move to `docs/prompts/`, rename, update ID
2. **Confirm clean tree** — `git status` clean
3. **Run mini-release** — `/mini-release` (MINOR bump — new feature surface)
4. **Update Linear** — transition SUG-11 to Done
5. **Clean up** — remove `apps/web/public/mockup-duotone.html` (temporary mockup file)

---

*sugartown.io · docs/backlog/EPIC-image-treatments-gallery · 2026-03-21*
