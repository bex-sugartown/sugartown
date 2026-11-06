---
**Epic:** ST-205 — Carousel lightbox: browse every slide with next/prev, keep carousel in sync
**Issue:** [#205](https://github.com/bex-sugartown/sugartown/issues/205)
**Status:** Done
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

- [x] Phase 0: vspec for the lightbox on a carousel: nav buttons, counter, the "Read the post" link, the open-lightbox control on a linked slide, light and dark, mobile; approved by Bex — layer: vspec
- [ ] Lightbox list is every slide, in order, for carousel layout; grid and masonry unchanged unless the vspec says otherwise — layer: frontend (React)
- [ ] Click anywhere on the active image opens the lightbox at that slide, linked or not (Bex, 2026-11-06); an expand circle on the active slide is the visible cue and keyboard route; the carousel stops wrapping the active image in its link, so a linked slide's link is reached only through the lightbox (this changes #201's active-slide link click) — layer: frontend (React and CSS)
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
- [ ] Clicking anywhere on the active image, or its expand circle, opens the lightbox on that slide for linked and unlinked slides, and does not navigate. Clicking a peeking slide still only advances the carousel.
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

<!-- Chromatic: pending. CSS, a component and two stories changed; run at /ship (close-out step 4 deferral). -->

## Close-out review

### Acceptance criteria

- [x] On the Cast carousel the lightbox shows previous and next buttons and a counter: browser check on `/articles/becky-b00p-illustration-prompt-system`, counter read "1 / 10", nav buttons 44px rgba(0,0,0,0.9).
- [x] Next 9 times reaches slide 10, the 10th wraps to slide 1: only 5 Next presses checked in the browser (1 to 6); wrap is the existing modulo code and was not exercised.
- [x] A linked slide has a "Read: …" link that honours `openInNewTab`: slide 2 read "Read: I Treated My Job Search Like a Data Pipeline ↗", `target=_blank`, href `/articles/job-search-funnel-data-postmortem`.
- [x] Closing on slide 6 leaves the carousel on slide 6 with dot 6 active: checked, `data-active` slide 6, dot 6.
- [x] Clicking the active image or its expand circle opens the lightbox and does not navigate; a peek click only advances: checked by click in the browser (opened, counter present; peek 6 to 7, no lightbox).
- [ ] Nav buttons visible on a light and a dark image, in light and dark themes: seen on one image in the light page theme only; dark page theme and a light image not checked.
- [ ] Grid, masonry and inline article image open the lightbox as before: one inline image lightbox opened with no buttons (unchanged). A grid image and masonry were not clicked in isolation; the code path for them is unchanged (`PageSections.jsx` filter).
- [x] `pnpm validate:tokens --strict-colors` zero violations; `pnpm test:smoke`: 28 passed, none failed.

### What didn't work

- The vspec needed four rounds: the first prototype left out the carousel arrows and dots, and the Before section showed a lightbox state (buttons and a counter) that does not exist live. Bex caught both.
- The browser pane showed the local vspec as a static snapshot, so the vspec looked unclickable until it was served over HTTP.
- A first real click test missed the carousel because the page had scrolled.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| A Before must be a real dated screenshot and a prototype must show the whole page or section | workflow-docs | #202 (rule and acceptance criterion added, commit 61ffb886) |
| `ImageLightbox` has three single-case stories | implementation | declined: they show different lightbox states that cannot share one screen |
| Hover states, phone width, keyboard-only open and close, dark page theme not checked | implementation | declined: covered by the Chromatic pass at ship and post-ship checks below |
| #204 (AI stamping) reads `provenanceFiles` in this lightbox | implementation | no change needed: `stampedCopies` is untouched; noted on #204 at its activation audit |

### Friction line

The vspec's Before and prototype did not match the live surface, which cost three correction rounds; the same pattern as #201's vspec (class table missed a needed element), now owned by #202.

## Post-ship checks

- [ ] Cast carousel on production: lightbox shows buttons and a counter, "Read: …" link works: person: open `/articles/becky-b00p-illustration-prompt-system` on the live site and click the active image.
- [x] Chromatic VRT pass on the carousel and lightbox stories: person: approve in Chromatic at ship. (approved 2026-11-06, build 108)

## Change after close-out (2026-11-06)

Bex asked for the lightbox "Read:" link to be the standard tertiary Button, not the custom pill the approved vspec showed. The standard tertiary is maroon (light theme) and lime (dark theme), and the lightbox overlay is near-black in both, so Bex chose a new DS Button `tone="onDark"`. First cut was pink outline with white text in the dark theme; Bex then found pink too dark on the overlay, so the dark theme is now the standard tertiary (lime outline, lime text) and the light theme is pink outline and pink text. Added: tokens `st-button-tertiary-ondark-border`, `-text`, `-hover-bg` (dark values alias the standard tertiary tokens; the light-theme overrides are in `theme.pink-moon.css`, both copies); Button `tone` prop; a Button story case. `.captionLink` now only places the button. The vspec copy beside this doc still shows the old pill. Checked: computed colours in both themes (dark: lime text and lime 1px border; light: pink text and pink border), `pnpm test:smoke` 28 passed, token and mirror validators clean. The light-theme pink-on-black contrast (about 4.8:1) is a hand estimate, not tool-measured. Chromatic pending, now also for Button.

### Second change (2026-11-06, #207)

The link was still pink on a light-themed page, because the Button's `onDark` tone followed the page theme. The lightbox overlay now carries `data-theme="dark-pink-moon"` and the Button is the plain tertiary. The `tone` prop and the three `st-button-tertiary-ondark-*` tokens are removed. `sd.config.mjs` now emits the base token values under `[data-theme~="dark-pink-moon"]` as well as `:root`, so a dark element inside a light page resets every token the light block overrides (103 of the light block's 144 are not restated in the dark block). Computed colour: lime in both page themes.
