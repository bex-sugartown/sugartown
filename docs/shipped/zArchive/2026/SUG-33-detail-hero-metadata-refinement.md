# SUG-33 — Detail Page Hero & Metadata Refinement

**Linear Issue:** SUG-33 _(pending creation)_

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — MetadataCard (existing, extend via props), DraftBadge (existing, reposition), HeroSection (existing, extend for imageless variant), back-link (existing, remove and replace with Type link in MetadataCard). No new components created — all work extends existing surfaces.
- [x] **Use case coverage** — Hero: with image (current), without image (new: dark text, no overlay). MetadataCard Type field: now a link to archive. DraftBadge: repositioned to upper-right column. Hero text glow: all 6 overlay variants + no-overlay.
- [x] **Layout contract** — MetadataCard grid: 4-column (`auto 1fr auto 1fr`). DraftBadge moves from inline-in-h1 to grid column 3–4 row 1, right-aligned. Published date stays lower-right. No change to page max-width (`--st-width-detail: 760px`).
- [x] **All prop value enumerations** — `imageTreatment.type`: `none`, `duotone-standard`, `duotone-featured`, `duotone-subtle`, `duotone-extreme`, `dark-scrim`, `color`. `imageWidth`: `content-width`, `full-width`.
- [x] **Correct audit file paths** — all verified via agent exploration
- [x] **Dark / theme modifier treatment** — Hero text glow uses CSS `text-shadow` / `filter: drop-shadow()` keyed to overlay type. Dark text variant (no image) uses `var(--st-color-text-default)`. No new tokens required — uses existing brand tokens.
- [x] **Studio schema changes scoped** — Hero schema (`apps/studio/schemas/sections/hero.ts`): `backgroundImage` becomes optional (remove `validation: Rule => Rule.required()` if present). Studio tab structure: add `hero` group/fieldset to detail doc schemas. Own commit: `feat(studio): SUG-33 hero schema + tab structure`.
- [x] **Web adapter sync scoped** — No DS component changes. All work is in `apps/web` components.
- [x] **Composition overlap audit** — No new sub-objects. Hero `heading`/`subheading` do not overlap with document `title`/`subtitle` — they are the hero-specific presentation layer.
- [x] **Atomic Reuse Gate** — Extending existing MetadataCard, HeroSection, DraftBadge. No new components. Hero text glow is a CSS-only enhancement (new utility classes in PageSections.module.css).

---

## Context

Detail pages (CaseStudyPage, ArticlePage, NodePage) currently extract a lead hero from `sections[0]` and render it full-bleed above the `.detailPage` container. Below the hero, a hardcoded back-link ("← All Case Studies") precedes the title, DraftBadge (inline in `<h1>`), and MetadataCard.

**Problems identified:**
1. Hero is disconnected from Studio editing — buried as item #1 in sections array, not its own tab
2. Back-link to archive page is redundant with the Type field in MetadataCard
3. DraftBadge is inline in `<h1>`, misaligned — should be upper-right of metadata grid
4. Hero text over images lacks glow/shadow — hard to read over varied backgrounds/textures
5. Hero requires a background image — should support text-only hero (dark text, no overlay)

**Recent epics touching this surface:**
- SUG-30: Image treatments in gallery Media component
- SUG-31: Image asset pipeline (renamed hero images)
- Previous hero overlay fix (added `imageTreatment` to GROQ projection)

---

## Objective

After this epic: detail pages have a cleaner information hierarchy where (1) the hero is editable via a dedicated Studio tab, (2) the back-link is removed and replaced by making the MetadataCard "Type" value a link to the archive, (3) DraftBadge is repositioned to the upper-right of the metadata grid aligned with the published date column, (4) hero text has a configurable glow/shadow for readability over all overlay types, and (5) heroes can render without a background image using dark text.

**Layers affected:** Schema (Studio tab structure, hero field optionality), GROQ (no projection changes — fields already fetched), Render (HeroSection, MetadataCard, DraftBadge positioning, CSS glow).

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | No | Pages use `RootPage.jsx` which renders sections via `PageSections` but has no MetadataCard or back-link. Hero rendering changes (glow, imageless) apply automatically via shared `HeroSection` component. |
| `article`   | Yes | Has lead-hero extraction, MetadataCard, back-link, DraftBadge |
| `caseStudy` | Yes | Has lead-hero extraction, MetadataCard, back-link, DraftBadge |
| `node`      | Yes | Has lead-hero extraction, MetadataCard, back-link, DraftBadge |
| `archivePage` | No | Archive pages don't have hero sections or MetadataCard |

---

## Scope

### Phase 1: Studio Schema & Tab Structure
- [ ] Make `backgroundImage` optional in `heroSection` schema (remove required validation if present)
- [ ] Add `hero` group to `caseStudy`, `article`, `node` schemas — contains a dedicated hero fieldset at top of content tab (or as its own tab before content)
- [ ] Commit: `feat(studio): SUG-33 hero tab + optional background image`

### Phase 2: Remove Back-Link, Make Type a Link
- [ ] Remove hardcoded back-link (`← All Case Studies` etc.) from CaseStudyPage, ArticlePage, NodePage
- [ ] Add `href` prop support to MetadataCard's `contentType` row — renders as `<Link>` to the archive path
- [ ] Pass archive path from each detail page (using `routes.js` `TYPE_NAMESPACES`)

### Phase 3: Reposition DraftBadge
- [ ] Move DraftBadge out of `<h1>` in all three detail pages
- [ ] Position in MetadataCard grid: upper-right area (column 3–4, row 1), right-aligned
- [ ] Vertically align with Published date in lower-right

### Phase 4: Imageless Hero Variant
- [ ] When `backgroundImage` is absent, render hero with dark text (`var(--st-color-text-default)`) instead of white
- [ ] No overlay pseudo-elements when no image
- [ ] Maintain eyebrow in teal, heading in brand-primary or text-default
- [ ] Reduced `min-height` for imageless heroes

### Phase 5: Hero Text Glow / Shadow
- [ ] Add `text-shadow` or `filter: drop-shadow()` to `.heroContainer` text when over images
- [ ] Glow intensity/color keyed to overlay type:
  - **No treatment** (plain dark scrim default): subtle dark shadow for contrast
  - **Duotone standard/featured/subtle**: warm pink-tinted glow matching brand
  - **Duotone extreme**: stronger glow to pop off the intense colour remap
  - **Dark scrim**: minimal — scrim already provides contrast
  - **Color overlay**: adaptive shadow matching overlay color
- [ ] Test all variants against mockup page (`mockup-duotone.html`)
- [ ] No glow on imageless heroes (dark text on light bg doesn't need it)

### Phase 6: Detail Page Layout Cleanup
- [ ] Extract shared `isHero` / `leadHero` / `restSections` logic into a shared utility (DRY — currently copy-pasted across 3 files)
- [ ] Use `routes.js` for archive paths instead of hardcoded strings

---

## Query Layer Checklist

- [x] `pageBySlugQuery` — no changes needed (hero fields already projected, no MetadataCard on pages)
- [x] `articleBySlugQuery` — no changes needed (hero fields already projected including `imageTreatment`, `eyebrow`)
- [x] `caseStudyBySlugQuery` — no changes needed (hero fields already projected)
- [x] `nodeBySlugQuery` — no changes needed (hero fields already projected)
- [x] Archive queries — no changes needed (hero/metadata changes are render-only)

---

## Schema Enum Audit

| Field name | Schema file | `value` -> Display title |
|-----------|-------------|--------------------------|
| `imageTreatment.type` | `mediaOverlay.ts` | `none` -> None, `duotone-standard` -> Duotone, `duotone-featured` -> Duotone (Featured), `duotone-subtle` -> Duotone (Subtle), `duotone-extreme` -> Duotone (Extreme), `dark-scrim` -> Dark Scrim, `color` -> Color Overlay |
| `imageWidth` | `hero.ts` | `content-width` -> Content Width, `full-width` -> Full Width |

---

## Metadata Field Inventory

| Field | Sanity field name | Doc types | Current render location | Post-epic render location |
|-------|------------------|-----------|------------------------|--------------------------|
| Type | `contentType` (passed as prop) | article, caseStudy, node | MetadataCard plain text | MetadataCard `<Link>` to archive |
| Draft status | `hasDraft` | article, caseStudy, node | Inline in `<h1>` | MetadataCard upper-right grid cell |
| Published | `publishedAt` | article, caseStudy, node | MetadataCard lower-right | MetadataCard lower-right (unchanged) |

All other MetadataCard fields unchanged.

---

## Non-Goals

- **Hero CTA changes** — CTA buttons in hero are not in scope
- **Hero animation/parallax** — no motion effects added
- **New overlay types** — using existing 6 overlay types only
- **Archive page changes** — archive pages are not affected
- **Page (RootPage) changes** — pages don't have MetadataCard; hero rendering improvements (glow, imageless) apply automatically via shared component

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`
- No migration scripts — all changes are schema structure + frontend rendering

**Schema (Studio)**
- `heroSection` in `apps/studio/schemas/sections/hero.ts` — make `backgroundImage` optional
- Tab/group structure changes in `apps/studio/schemas/documents/caseStudy.ts`, `article.ts`, `node.ts`
- Commit schema changes separately: `feat(studio): SUG-33 ...`

**Query (GROQ)**
- No query changes — all hero fields already projected after the SUG-31 fix
- `imageTreatment`, `eyebrow`, `backgroundImage`, `imageWidth`, `ctas` all present

**Render (Frontend)**
- `PageSections.jsx` HeroSection component — add imageless variant + text glow CSS
- `MetadataCard.jsx` — add `contentTypeHref` prop, accept `draftBadge` as slot
- `CaseStudyPage.jsx`, `ArticlePage.jsx`, `NodePage.jsx` — remove back-link, reposition DraftBadge, pass archive href
- Extract shared hero extraction utility to `apps/web/src/lib/heroUtils.js`

---

## Files to Modify

**Studio**
- `apps/studio/schemas/sections/hero.ts` — MODIFY (make backgroundImage optional)
- `apps/studio/schemas/documents/caseStudy.ts` — MODIFY (add hero group/tab)
- `apps/studio/schemas/documents/article.ts` — MODIFY (add hero group/tab)
- `apps/studio/schemas/documents/node.ts` — MODIFY (add hero group/tab)

**Frontend**
- `apps/web/src/components/PageSections.jsx` — MODIFY (imageless hero, text glow)
- `apps/web/src/components/PageSections.module.css` — MODIFY (imageless styles, glow classes)
- `apps/web/src/components/MetadataCard.jsx` — MODIFY (Type as link, DraftBadge slot)
- `apps/web/src/components/MetadataCard.module.css` — MODIFY (DraftBadge positioning)
- `apps/web/src/pages/CaseStudyPage.jsx` — MODIFY (remove back-link, reposition DraftBadge)
- `apps/web/src/pages/ArticlePage.jsx` — MODIFY (remove back-link, reposition DraftBadge)
- `apps/web/src/pages/NodePage.jsx` — MODIFY (remove back-link, reposition DraftBadge)
- `apps/web/src/pages/pages.module.css` — MODIFY (remove `.backLink` if unused)
- `apps/web/src/lib/heroUtils.js` — CREATE (shared hero extraction)

---

## Deliverables

1. **Schema** — `heroSection.backgroundImage` is optional; hero group/tab exists in all 3 detail doc schemas
2. **Back-link removed** — no `← All X` link on any detail page
3. **Type as link** — MetadataCard "Type" value is a clickable link to the corresponding archive page
4. **DraftBadge repositioned** — renders in upper-right of MetadataCard grid, aligned with Published date column
5. **Imageless hero** — hero without `backgroundImage` renders dark text on transparent/page background
6. **Text glow** — hero text over images has treatment-aware glow/shadow for readability
7. **Shared utility** — `heroUtils.js` extracts the lead-hero / rest-sections split (DRY)

---

## Acceptance Criteria

- [ ] Studio: `backgroundImage` can be left empty on a `heroSection` — no validation error
- [ ] Studio: hero fields appear in a dedicated group/tab on case study, article, and node edit screens
- [ ] Frontend: detail pages no longer show `← All Case Studies` / `← All Articles` / `← Knowledge Graph` back-link
- [ ] Frontend: MetadataCard "Type" value (e.g. "Case Study") is a `<Link>` to `/case-studies`
- [ ] Frontend: DraftBadge appears in upper-right of MetadataCard grid (not inline in `<h1>`)
- [ ] Frontend: DraftBadge column aligns vertically with Published date
- [ ] Frontend: hero with no background image renders dark text, no overlay pseudo-elements, reduced min-height
- [ ] Frontend: hero with background image + any treatment shows text glow/shadow
- [ ] Frontend: hero text glow varies by treatment type (visible difference between duotone, extreme, scrim, color)
- [ ] Visual QA: test all 6 overlay types + imageless on mockup page — text readable in all cases
- [ ] Visual QA: desktop and mobile breakpoints
- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors
- [ ] No hardcoded archive paths in page files — all resolved via `routes.js`

---

## Risks / Edge Cases

**Schema risks**
- [ ] Making `backgroundImage` optional: existing content with heroes all have images — no data loss. New heroes without images must render correctly.
- [ ] Tab/group restructuring: Sanity groups are presentation-only — no data migration needed.

**Render risks**
- [ ] Imageless hero at position 0: currently rendered outside `.detailPage` container (full-bleed). An imageless hero should probably render inline within the detail container instead — needs CSS conditional.
- [ ] Text glow performance: `text-shadow` is composited per glyph. Keep shadow count to 1-2 layers max. Avoid `filter: drop-shadow()` on large text blocks (triggers layer promotion).
- [ ] DraftBadge in MetadataCard: badge only shows in preview mode — MetadataCard must handle the slot being `null` gracefully.
- [ ] Archive path resolution: must use `TYPE_NAMESPACES` from `routes.js` — content types map: `article -> /articles`, `caseStudy -> /case-studies`, `node -> /knowledge-graph`.

---

## Learnings from SUG-31

1. **GROQ projections are opt-in** — missing fields silently return `undefined`. The hero overlay bug (imageTreatment not rendering) was caused by a missing GROQ field, not a CSS issue. Always verify the projection before debugging the renderer.
2. **Hero CSS compositing uses a dual-layer approach** (`::before` for overlay, `::after` for filtered image in extreme mode). Any text readability enhancement must sit at `z-index: 2` or higher to be above both layers.
3. **Gallery Media and Hero use different DOM architectures** — gallery uses `<img>` + `::after`, hero uses CSS `background-image` + pseudo-elements. CSS parity between them requires understanding both stacking contexts.

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-33-detail-hero-metadata-refinement.md` -> `docs/prompts/SUG-33-detail-hero-metadata-refinement.md`
2. Commit: `docs: ship SUG-33 detail hero & metadata refinement`
3. Run `/mini-release SUG-33 Detail Hero & Metadata Refinement`
4. Update Linear SUG-33 -> Done
