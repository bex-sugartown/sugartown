---
**Epic:** ST-205 — Carousel lightbox: browse every slide with next/prev, keep carousel in sync
**Issue:** [#205](https://github.com/bex-sugartown/sugartown/issues/205)
**Status:** Todo
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-205-carousel-lightbox-navigation.vspec.html`
---

# ST-205 — Carousel lightbox: browse every slide with next/prev, keep carousel in sync

Opening a carousel image full size lets the reader step through every slide with next and previous, and the carousel lands on the slide they left on.

## Background

`ImageLightbox` already has previous and next buttons, arrow keys, and a counter, but shows them only when it holds more than one image (`hasMultiple`, `apps/web/src/components/ImageLightbox.jsx`). `ImageGallerySection` builds the lightbox list as `images.filter((img) => !resolveImageLink(img))` (`PageSections.jsx:529`), so linked slides are left out. On a carousel where most slides link to a post (for example "The Cast, Across the Catalogue" on `/articles/becky-b00p-illustration-prompt-system`), the lightbox opens with one image and no buttons. A reader must close it and click the page's arrow. Closing also does not move the carousel to the slide they were on. After #201, clicking the active linked slide follows its link, so a linked slide has no way to open the lightbox at all. Inline article images (`ArticleInlineImage`, `SharedInlineImage`) pass a one-item list and are not affected.

## Objective

After this epic, from a carousel the lightbox holds every slide in carousel order. Previous and next buttons are always present when there are 2 or more slides, and keyboard arrows still work. A slide that links to a post shows a "Read the post" link inside the lightbox (decided by Bex, 2026-11-06). Closing the lightbox scrolls the carousel to the slide that was showing. Linked slides get a way to open the lightbox that does not follow the link. Layers: React render (`ImageGallerySection`, `GalleryImage`, `ImageLightbox`) and CSS. No Sanity schema, GROQ or content change. Grid and masonry galleries use the same lightbox and are checked, not redesigned.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Phase 0: vspec for the lightbox on a carousel: nav buttons, counter, the "Read the post" link, the open-lightbox control on a linked slide, light and dark, mobile; approved by Bex — layer: vspec
- [ ] Lightbox list is every slide, in order, for carousel layout; grid and masonry unchanged unless the vspec says otherwise — layer: frontend (React)
- [ ] Open the lightbox at the active slide, including linked slides, through an explicit control that does not follow the link — layer: frontend (React and CSS)
- [ ] "Read the post" link in the lightbox for linked slides, respecting `openInNewTab` — layer: frontend (React and CSS)
- [ ] On close, the carousel scrolls to the slide the lightbox was showing — layer: frontend (React)
- [ ] Lightbox nav buttons meet the same visibility rule as the #201 carousel arrows on any image — layer: frontend (CSS)
- [ ] Storybook: extend the existing `ImageLightbox` and `ImageGallery` stories (one multi-case story each, no new snapshots) — layer: Storybook

## Phases

| Phase | Ships | Scope items |
|---|---|---|
| 0 | Approved vspec | 1 |
| 1 | Lightbox list, open control, close sync | 2, 3, 5 |
| 2 | "Read the post" link and nav button styling | 4, 6 |
| 3 | Stories | 7 |

## Acceptance Criteria

- [ ] On the Cast carousel, opening the lightbox on any slide shows previous and next buttons and a counter reading "n / 10".
- [ ] Pressing next 9 times from slide 1 reaches slide 10; the 10th press wraps to slide 1.
- [ ] A slide with a link has a "Read the post" link in the lightbox; clicking it follows the link and honours `openInNewTab`.
- [ ] Closing the lightbox on slide 6 leaves the carousel centred on slide 6 with dot 6 active.
- [ ] Clicking the open control on a linked slide opens the lightbox and does not navigate.
- [ ] Lightbox nav buttons are visible on a light image and a dark image in light and dark themes.
- [ ] A grid or masonry gallery and an inline article image open the lightbox as before.
- [ ] `pnpm validate:tokens --strict-colors` zero violations; `pnpm test:smoke` run, with any failure named and tracked.

## Human QA Walkthrough — example local pages

Built at activation from `apps/web/src/App.jsx` and a published-content query, 2026-11-06. Slugs are real published documents.

| Page-type | Route in `App.jsx` | Example local URL | Why |
|---|---|---|---|
| Article, carousel with linked slides | `/articles/:slug` | `/articles/becky-b00p-illustration-prompt-system` | The bug: 10 slides, 9 linked |
| Case study, carousel, no links | `/case-studies/:slug` | `/case-studies/launching-lunar-landing` | Carousel lightbox with unlinked slides, as before |
| Case study, grid gallery | `/case-studies/:slug` | `/case-studies/beauty-retail-from-monolith-to-microservice` | Regression guard: grid lightbox unchanged |
| Article, carousel and grid | `/articles/:slug` | `/articles/pink-moon-and-ledger` | Two carousels and a grid on one page |
| Section showcase | `/platform/design-system/sections` | `/platform/design-system/sections` | Carousel and grid in the showcase page |
| Article with an inline image | `/articles/:slug` | Activation check: find one published article whose `content[]` has a `richImage` | Regression guard: single-image lightbox, no nav |

## Technical notes

- **Content Write Gate:** does not fire; no Sanity writes.
- **Schema changes:** none.
- **Upstream dependencies:** builds on #201 (closed, carousel arrows, peek click and keyboard). #203 (the `/articles` dark contrast bug) does not block. Activation audit: read `docs/backlog/` for in-flight epics touching `PageSections.jsx`, `ImageLightbox.jsx` or `ImageLightbox.module.css` and state why each is or is not blocking; #204 (AI stamping) reads `provenanceFiles` in the lightbox via `stampedCopies` and must keep working.
- **Activation audits:** read `ImageLightbox.jsx` in full (focus trap, escape, `hasMultiple`); read `ImageLightbox.module.css` nav button rules; read `PageSections.jsx` `GalleryImage` and `ImageGallerySection` as they stand after #201; confirm the `index` passed to the lightbox for a slide, since `lightboxImages.indexOf(image)` returns -1 for linked images today.
- **Component choice audit (react.md):** candidates are the existing `ImageLightbox` nav buttons, the DS `IconButton` (see `IconButton.audit.stories.tsx`) and the #201 `.carouselArrow`. Default is to extend `ImageLightbox` with props (`images`, `initialIndex`, `onIndexChange`, `onClose`) and reuse the arrow styling, not a new component. The vspec confirms.
- **Rule-file edits:** none planned.
- **Open for the vspec:** the open-lightbox control on a linked slide (an expand icon on the slide, or another gesture); where the "Read the post" link sits so it does not collide with the AI label or caption.

## Model & Mode [REQUIRED]

`/model sonnet`: extends existing components, no architecture decision.

## Non-Goals

- No swipe gestures, zoom or autoplay.
- No change to how images are linked in Studio.
- No redesign of the grid or masonry layouts.
- No change to inline article image lightboxes (single image, no navigation needed).

## Related

- **GitHub:** [#205](https://github.com/bex-sugartown/sugartown/issues/205)
- Follows [#201](https://github.com/bex-sugartown/sugartown/issues/201); touches the same files as [#204](https://github.com/bex-sugartown/sugartown/issues/204) reads from.
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
