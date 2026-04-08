# EPIC — Image Optimization & Responsive Breakpoint Standardization

**Epic ID:** EPIC-0182
**Surface:** `apps/web` + `packages/design-system`
**Priority:** 🟢 Next
**Created:** 2026-03-15

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — No new interactive elements. This epic modifies image rendering patterns and CSS breakpoints across existing components. Key files: `sanity.js` (urlFor), `SanityMedia.jsx`, `Media.jsx` (DS + web adapter), `Card.jsx` (DS + web), all `*.module.css` files with `@media` queries.
- [x] **Use case coverage** — Image optimization must cover: Sanity CDN images (content), static `/public` assets, hero backgrounds (CSS), card thumbnails, gallery items, avatars, logos, OG images. Breakpoint standardization must cover: all 14 `@media` queries across 12 CSS files.
- [x] **Layout contract** — No layout changes. Breakpoint consolidation preserves existing visual behavior — only the values and token references change. Image `width`/`height` attributes prevent layout shift but don't alter layout.
- [x] **All prop value enumerations** — N/A — no enum fields.
- [x] **Correct audit file paths** — verified (see Context section for full file inventory)
- [x] **Dark / theme modifier treatment** — No theme changes. Images and breakpoints are theme-agnostic. The static background PNGs (`std-bg-dark.png`, `std-bg-light.png`) are already theme-scoped by filename — optimization doesn't change their theme assignment.
- [x] **Studio schema changes scoped** — No schema changes.
- [x] **Web adapter sync scoped** — `Media.jsx` web adapter and DS component both modified (add `width`/`height`/`loading` attributes). CSS module sync required for any breakpoint changes in DS Card.

---

## Context

### Current image handling

All content images are served via Sanity's image CDN through `urlFor()` chains. Each component specifies its own `width` and `quality` params:

| Component | Width | Quality | Format | Lazy? | width/height attrs? |
|-----------|-------|---------|--------|-------|-------------------|
| Hero (bg image) | 1920 | 90 | original | No | N/A (CSS bg) |
| SanityMedia | 800 | 90 | original | No | No |
| Card thumbnail | 600 | 85 | original | Yes | No |
| CardBuilder thumbnail | 600 | 85 | original | No | No |
| PageSections inline | 900 | 85 | original | No | No |
| Gallery items | 800 | 85 | original | No | No |
| Person avatar | 240×240 | default | original | No | No |
| Logo | 360 (2x) | default | original | No | Yes (width only) |
| OG image | 1200×630 | default | original | N/A | N/A |

**Key gaps:**
- No `.auto('format')` or `.format('webp')` — all images served in original upload format
- No `srcset`/`sizes` — same image served to all viewport sizes
- No `loading="lazy"` except Card thumbnails
- No `width`/`height` attributes — causes Cumulative Layout Shift (CLS)
- No `<link rel="preload">` for above-fold hero images
- Static PNGs in `/public` uncompressed (1.5 MB + 1.0 MB, currently commented out in CSS)

### Current breakpoint landscape

**7 unique breakpoint values, no shared tokens, no naming convention:**

| Value | Pattern | Count | Use |
|-------|---------|-------|-----|
| 768px | max-width | 7 | Header, hero, footer, nav, content — informal "large/small" threshold |
| 768px | min-width | 1 | CardGrid 2-column activation |
| 860px | max-width | 3 | Table card layout (legacy, documented deviation) |
| 1024px | min-width | 1 | CardGrid 3-column activation |
| 640px | max-width | 1 | CardBuilder grid (phone) |
| 900px | max-width | 1 | SchemaERD (component-specific) |
| 520px | max-width | 1 | PersonProfile (very small) |

**No breakpoint tokens exist** in either `tokens.css` file. Values are hardcoded in each CSS module. Content width tokens exist (`--st-width-detail: 760px`, `--st-width-archive: 960px`) but serve a different purpose (max-width constraints, not viewport breakpoints).

**All responsive behavior is CSS-only** — no `useMediaQuery` hooks or JS-based breakpoints.

### Files with `@media` queries (complete inventory)

| File | Breakpoints used |
|------|-----------------|
| `apps/web/src/components/Header.module.css` | 768px (max-width) |
| `apps/web/src/components/Hero.module.css` | 768px (max-width) |
| `apps/web/src/components/Footer.module.css` | 768px (max-width) |
| `apps/web/src/components/ContentBlock.module.css` | 768px (max-width) |
| `apps/web/src/components/PageSections.module.css` | 768px (max-width), 860px (max-width, table) |
| `apps/web/src/components/atoms/NavigationItem.module.css` | 768px (max-width) |
| `apps/web/src/components/Preheader.module.css` | 768px (max-width) |
| `apps/web/src/components/CardGrid.module.css` | 768px (min-width), 1024px (min-width) |
| `apps/web/src/components/CardBuilderSection.module.css` | 640px (max-width) |
| `apps/web/src/components/SchemaERD/SchemaERD.module.css` | 900px (max-width) |
| `apps/web/src/pages/PersonProfilePage.module.css` | 520px (max-width) |
| `apps/web/src/design-system/components/table/Table.module.css` | 860px (max-width) |
| `packages/design-system/src/components/Table/Table.module.css` | 860px (max-width) |

---

## Objective

Optimize image delivery for performance and establish a standardized breakpoint token system. After this epic: (1) all Sanity images serve modern formats (WebP/AVIF) via `auto('format')`; (2) content images include `width`/`height` attributes to prevent layout shift; (3) below-fold images lazy-load; (4) above-fold hero images preload; (5) all `@media` queries reference shared breakpoint tokens instead of hardcoded pixel values; (6) breakpoints use "large" and "small" naming convention (not "mobile"/"desktop").

**Data layer:** No changes.
**Query layer:** Add image asset dimension metadata (`width`, `height`) to GROQ projections where images are rendered.
**Render layer:** Update `urlFor()` chains, add `loading`/`width`/`height` to `<img>` elements, add `<link rel="preload">` for hero images, migrate all `@media` queries to use breakpoint custom properties via `@custom-media` or CSS variable conventions.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | ✅ Yes | Hero images, inline content images, gallery images |
| `article` | ✅ Yes | Same — sections with images |
| `caseStudy` | ✅ Yes | Same |
| `node` | ✅ Yes | Same |
| `archivePage` | ✅ Yes | Card grid thumbnails |

---

## Scope

### Phase 1: Breakpoint token system

- [ ] Define breakpoint tokens in both `tokens.css` files (web + DS package, kept in sync):
  ```css
  /* Breakpoint tokens — "large" = above threshold, "small" = below */
  --st-breakpoint-sm: 520px;   /* very small screens */
  --st-breakpoint-md: 768px;   /* primary large/small threshold */
  --st-breakpoint-lg: 1024px;  /* wide layout activation */
  ```
- [ ] **Note on CSS custom properties in `@media`:** CSS custom properties (`var()`) cannot be used inside `@media` queries per the CSS spec. Two options:
  - **Option A (recommended): CSS comment convention** — define tokens as documentation, use a PostCSS plugin (`postcss-custom-media`) to enable `@custom-media --small-screen (max-width: 768px)` syntax
  - **Option B: Hardcoded with comment reference** — keep hardcoded values but add a comment on each `@media` referencing the token name for grep/audit: `/* --st-breakpoint-md */`
  - Decide at activation. Option B is zero-config; Option A is cleaner but requires a Vite plugin.
- [ ] Audit all 14 `@media` queries and map each to a named breakpoint:
  - 768px → `--st-breakpoint-md` (large/small threshold)
  - 1024px → `--st-breakpoint-lg` (wide layout)
  - 520px → `--st-breakpoint-sm` (very small)
  - 640px → evaluate: merge into `--st-breakpoint-md` or keep as component-specific
  - 860px → evaluate: legacy table exception — merge into `--st-breakpoint-md` or keep
  - 900px → evaluate: SchemaERD-specific — merge into `--st-breakpoint-lg` or keep
- [ ] Update all CSS modules to reference the chosen convention (Option A or B)
- [ ] Verify no visual regressions at each breakpoint

### Phase 2: Image format optimization

- [ ] Add `.auto('format')` to `urlFor()` default chain in `sanity.js`:
  ```js
  export function urlFor(source) {
    return builder.image(source).auto('format')
  }
  ```
  This tells Sanity's CDN to serve WebP to browsers that send `Accept: image/webp`, AVIF where supported — zero client-side logic needed.
- [ ] Audit every `urlFor()` call site — verify `.auto('format')` is not overridden by a subsequent `.format()` call that would force a specific format
- [ ] Verify hero background images (CSS `background-image: url(...)`) also get `auto('format')` — this works because the format negotiation happens at the CDN level via HTTP Accept headers, not in HTML

### Phase 3: Image dimensions and layout shift prevention

- [ ] Update GROQ projections to include image asset dimensions:
  ```groq
  image {
    asset-> { url, "width": metadata.dimensions.width, "height": metadata.dimensions.height },
    alt, crop, hotspot
  }
  ```
- [ ] Add `width` and `height` attributes to all `<img>` elements:
  - Card thumbnails (Card.jsx — DS + web adapter)
  - SanityMedia.jsx
  - PageSections inline images
  - Gallery items
  - Person avatar
  - Logos (already have `width`, add `height`)
- [ ] Set `aspect-ratio` via CSS where `width`/`height` are known — this preserves responsive scaling while preventing CLS
- [ ] **Calculate rendered dimensions:** The `width`/`height` attrs should reflect the *requested* dimensions (from `urlFor().width(800)`), not the original asset dimensions. This gives the browser the correct aspect ratio for the rendered size.

### Phase 4: Lazy loading and preloading

- [ ] Add `loading="lazy"` to all below-fold `<img>` elements:
  - PageSections inline images
  - Gallery items
  - Card thumbnails (already has `loading="lazy"` — verify)
  - Person avatar (below fold on profile pages)
- [ ] Do NOT add `loading="lazy"` to above-fold elements:
  - Hero background image (CSS — not applicable)
  - First visible card in archive grids (potential LCP element)
  - Logos in header
- [ ] Add `decoding="async"` to all `<img>` elements (allows browser to decode off-main-thread)
- [ ] Add `<link rel="preload">` for above-fold hero images:
  ```jsx
  // In SeoHead or a new HeroPreload component
  <Helmet>
    <link rel="preload" as="image" href={heroImageUrl} />
  </Helmet>
  ```
  - Only for pages with hero sections that have background images
  - Requires the hero image URL to be available at render time (it already is from GROQ)
- [ ] Add `fetchpriority="high"` to hero `<img>` elements (if any render as `<img>` instead of CSS background)

### Phase 5: Responsive image sizing (srcset)

- [ ] For content images rendered via `<img>`, add `srcset` with 2–3 size variants:
  ```jsx
  <img
    src={urlFor(asset).width(800).auto('format').url()}
    srcSet={`
      ${urlFor(asset).width(400).auto('format').url()} 400w,
      ${urlFor(asset).width(800).auto('format').url()} 800w,
      ${urlFor(asset).width(1200).auto('format').url()} 1200w
    `}
    sizes="(max-width: 768px) 100vw, 800px"
    width={800}
    height={calculatedHeight}
    loading="lazy"
    decoding="async"
    alt={alt}
  />
  ```
- [ ] Create a shared `SanityImage` component (or extend `SanityMedia`) that encapsulates:
  - `urlFor()` chain with `.auto('format')`
  - `srcset` generation for 2–3 breakpoints
  - `sizes` attribute based on layout context
  - `width`/`height` from GROQ dimensions
  - `loading="lazy"` / `decoding="async"` defaults
  - `fetchpriority` override for above-fold images
- [ ] Apply to: PageSections inline images, gallery items, card thumbnails
- [ ] Hero background images: use `image-set()` CSS function where supported, with `url()` fallback

### Phase 6: Static asset optimization

- [ ] Compress `apps/web/public/std-bg-dark.png` (1.5 MB) and `std-bg-light.png` (1.0 MB):
  - Convert to WebP (target: < 200 KB each)
  - Or compress PNG via pngquant/tinypng
  - Or remove entirely if the themed background design decision (backlog item #3) decides to drop them
- [ ] Verify `vite.svg` (4 KB) — already small, no action needed
- [ ] Check for any other unoptimized static assets in `/public`

---

## Query Layer Checklist

Image dimension metadata needs to be added to GROQ projections:

- [ ] `pageBySlugQuery` — add `metadata.dimensions.width`, `metadata.dimensions.height` to hero and section image projections
- [ ] `articleBySlugQuery` — same
- [ ] `caseStudyBySlugQuery` — same
- [ ] `nodeBySlugQuery` — same
- [ ] `allArticlesQuery` — add dimensions to card thumbnail projection (if card thumbnails use `<img>`)
- [ ] `allCaseStudiesQuery` — same
- [ ] `allNodesQuery` — same
- [ ] `siteSettingsQuery` — logo dimensions (if needed for header/footer `<img>`)

---

## Schema Enum Audit

N/A — no enum fields rendered.

---

## Metadata Field Inventory

N/A — no MetadataCard changes.

---

## Themed Colour Variant Audit

N/A — no colour or theme changes. Images and breakpoints are theme-agnostic.

---

## Non-Goals

- Does **not** add a build-time image processing pipeline (sharp, imagemin) — Sanity CDN handles format conversion server-side
- Does **not** implement blur-up / LQIP (Low Quality Image Placeholder) — evaluate post-launch if LCP needs further improvement
- Does **not** change image upload workflow in Studio — editors upload as usual; optimization is delivery-side
- Does **not** add `@container` queries — per CLAUDE.md guardrail, container queries are avoided near the top of the DOM
- Does **not** change layout behavior at any breakpoint — only standardizes the values and adds tokens
- Does **not** add JavaScript-based responsive logic (`useMediaQuery`, `window.matchMedia`) — all responsive behavior remains CSS-only
- **Studio schema changes:** None.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/web`, `packages/design-system`
- If Option A (PostCSS `@custom-media`) is chosen for breakpoints: add `postcss-custom-media` to `apps/web/package.json` and configure in `postcss.config.js` or `vite.config.js`
- Token drift rule applies: breakpoint tokens added to both `tokens.css` files in the same commit

**Schema (Studio)**
- No schema changes.

**Query (GROQ)**
- Sanity asset metadata is available via `asset->metadata.dimensions.{width, height}` — this is a built-in Sanity field, no schema change needed
- Adding dimension fields to projections increases response size slightly (~20 bytes per image) — negligible

**Render (Frontend)**
- `@sanity/image-url` supports `.auto('format')` — this is the recommended approach per Sanity docs
- `srcset` with Sanity URLs works because each URL variant is a different CDN request with different query params — the CDN caches each variant independently
- `loading="lazy"` is supported in all modern browsers (Chrome 77+, Firefox 75+, Safari 15.4+)
- `fetchpriority` is supported in Chrome 101+, Edge 101+ — gracefully ignored in other browsers
- `decoding="async"` is supported in all modern browsers
- CSS `@custom-media` (Option A) requires PostCSS plugin — not natively supported in browsers yet
- **DS ↔ web adapter sync:** `Media.jsx` and `Card.jsx` CSS modules must stay in sync across both layers

**Breakpoint naming convention:**
- Use "large" and "small" (not "mobile"/"desktop") — reflects that breakpoints are about available space, not device type
- `--st-breakpoint-md` = the primary large/small threshold
- "Small" = below `--st-breakpoint-md` (compact layout)
- "Large" = at or above `--st-breakpoint-md` (expanded layout)

---

## Files to Modify

**Tokens (both files, same commit)**
- `apps/web/src/design-system/styles/tokens.css` — add breakpoint tokens
- `packages/design-system/src/styles/tokens.css` — add breakpoint tokens (sync)

**Image utility**
- `apps/web/src/lib/sanity.js` — add `.auto('format')` to default `urlFor()` chain

**Components (image attrs)**
- `apps/web/src/components/atoms/SanityMedia.jsx` — add width/height/loading/decoding
- `apps/web/src/design-system/components/media/Media.jsx` — add width/height/loading/decoding
- `packages/design-system/src/components/Media/Media.tsx` — same (DS source)
- `apps/web/src/design-system/components/card/Card.jsx` — verify lazy loading, add decoding
- `packages/design-system/src/components/Card/Card.tsx` — same (DS source)
- `apps/web/src/components/PageSections.jsx` — add lazy loading to inline/gallery images
- `apps/web/src/components/CardBuilderSection.jsx` — add lazy loading
- `apps/web/src/pages/PersonProfilePage.jsx` — add lazy loading to avatar
- `apps/web/src/components/SeoHead.jsx` — add `<link rel="preload">` for hero images

**GROQ queries**
- `apps/web/src/lib/queries.js` — add dimension metadata to image projections

**CSS modules (breakpoint migration — all 13 files)**
- `apps/web/src/components/Header.module.css`
- `apps/web/src/components/Hero.module.css`
- `apps/web/src/components/Footer.module.css`
- `apps/web/src/components/ContentBlock.module.css`
- `apps/web/src/components/PageSections.module.css`
- `apps/web/src/components/atoms/NavigationItem.module.css`
- `apps/web/src/components/Preheader.module.css`
- `apps/web/src/components/CardGrid.module.css`
- `apps/web/src/components/CardBuilderSection.module.css`
- `apps/web/src/components/SchemaERD/SchemaERD.module.css`
- `apps/web/src/pages/PersonProfilePage.module.css`
- `apps/web/src/design-system/components/table/Table.module.css`
- `packages/design-system/src/components/Table/Table.module.css`

**Static assets**
- `apps/web/public/std-bg-dark.png` — compress or convert
- `apps/web/public/std-bg-light.png` — compress or convert

**Build config (Option A only)**
- `apps/web/vite.config.js` or `apps/web/postcss.config.js` — add postcss-custom-media
- `apps/web/package.json` — add postcss-custom-media dependency

---

## Deliverables

1. **Breakpoint tokens** — `--st-breakpoint-sm`, `--st-breakpoint-md`, `--st-breakpoint-lg` defined in both token files
2. **Breakpoint migration** — all 14 `@media` queries reference the standardized breakpoints (via chosen convention)
3. **Auto-format** — all Sanity images served in modern format (WebP/AVIF) via `.auto('format')`
4. **Layout shift prevention** — all `<img>` elements have `width` and `height` attributes
5. **Lazy loading** — all below-fold images have `loading="lazy"` and `decoding="async"`
6. **Hero preload** — above-fold hero images preloaded via `<link rel="preload">`
7. **Responsive images** — content images have `srcset` with 2–3 size variants
8. **Static asset optimization** — background PNGs compressed or converted (< 200 KB each)

---

## Acceptance Criteria

- [ ] Both `tokens.css` files define `--st-breakpoint-sm`, `--st-breakpoint-md`, `--st-breakpoint-lg`
- [ ] Zero hardcoded breakpoint values without a token reference comment (grep audit: no bare `768px` etc. in `@media` without `/* --st-breakpoint-md */` annotation)
- [ ] `urlFor()` default chain includes `.auto('format')` — verified by inspecting a Sanity image URL in browser (should contain `&auto=format`)
- [ ] Browser serves WebP when `Accept: image/webp` header is sent — verify in DevTools Network tab (Response Headers: `Content-Type: image/webp`)
- [ ] All `<img>` elements (except logos in header) have `loading="lazy"` and `decoding="async"` — verified via DOM inspection
- [ ] All `<img>` elements have `width` and `height` attributes — verified via DOM inspection
- [ ] Hero pages include `<link rel="preload" as="image">` in `<head>` — verified via View Source
- [ ] Content images have `srcset` attribute with multiple size variants — verified via DOM inspection
- [ ] Lighthouse performance score: CLS < 0.1, LCP < 2.5s on a hero page (measure before and after)
- [ ] Static background PNGs < 200 KB each (or removed if design decision defers them)
- [ ] No visual regressions at any breakpoint — spot-check: Header collapse, CardGrid columns, Footer stack, Table card layout, PersonProfile layout
- [ ] **Visual QA at breakpoints:** verify layout at 520px, 768px, 1024px, and 1440px viewports in both dark and light themes
- [ ] `pnpm validate:tokens` passes with zero errors after token additions
- [ ] DS ↔ web adapter CSS modules remain in sync (Card, Media, Table)

---

## Risks / Edge Cases

**Image optimization risks**
- [ ] `.auto('format')` may produce unexpected results for PNGs with transparency — WebP supports alpha, but verify Sanity CDN handles it correctly
- [ ] `srcset` URLs each create a separate CDN cache entry — first load of each variant is a cache miss. Sanity's CDN (Fastly) handles this gracefully but initial loads may be slightly slower
- [ ] Hero `<link rel="preload">` URL must exactly match the `background-image: url(...)` URL — any mismatch means the preload is wasted and the image loads twice
- [ ] Adding `width`/`height` to existing `<img>` elements may affect layouts that rely on `width: 100%` without explicit aspect ratio — verify each component

**Breakpoint risks**
- [ ] Merging 640px → 768px (CardBuilderSection) may change the point at which card grids collapse — visual QA required
- [ ] Merging 860px → 768px (Table) is a documented legacy exception — the table card layout was specifically tuned to 860px. Evaluate whether the 92px difference matters for the table's readability
- [ ] Merging 900px → 1024px (SchemaERD) changes the ERD's compact layout threshold — verify the diagram is still usable
- [ ] PostCSS `@custom-media` (Option A) adds a build dependency — if the plugin is unmaintained or incompatible with future Vite versions, fallback to Option B

**Query risks**
- [ ] `asset->metadata.dimensions` is only populated for images uploaded through Sanity Studio — if any images were uploaded via API without metadata processing, dimensions may be null. Add null guard: `width={dimensions?.width || undefined}`

---

## Post-Epic Close-Out

1. **Activate the epic file:**
   - Assign the next sequential EPIC number (check `docs/prompts/` for the latest)
   - Move: `docs/backlog/EPIC-image-responsive-optimization.md` → `docs/prompts/EPIC-{NNNN}-image-responsive-optimization.md`
   - Update the **Epic ID** field inside the file
   - Commit: `docs: activate EPIC-{NNNN} Image Optimization & Responsive Breakpoint Standardization`
2. **Confirm clean tree** — `git status` must show nothing staged or unstaged
3. **Run mini-release** — `/mini-release EPIC-{NNNN} Image Optimization & Responsive Breakpoints`
4. **Start next epic** — only after mini-release commit is confirmed

---

*Created 2026-03-15. Launch priority — improves Core Web Vitals (CLS, LCP) and establishes the breakpoint token system the rest of the CSS relies on.*
