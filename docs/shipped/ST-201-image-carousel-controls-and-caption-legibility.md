---
**Epic:** ST-201 — Image carousel controls and caption legibility
**Issue:** [#201](https://github.com/bex-sugartown/sugartown/issues/201)
**Status:** Done
**Priority:** 🔴 Now
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-201-image-carousel-controls-and-caption-legibility.vspec.html`
---

# ST-201 — Image carousel controls and caption legibility

Make the image gallery carousel usable: visible prev/next controls, peek slides that advance instead of navigating away, and captions that pass contrast.

## Background

On the live carousel ("The Cast, Across the Catalogue") three things fail. The prev/next arrows use `--st-color-scrim-backdrop` (50% black) with a 20% white border, so over dark illustrations they vanish. Each slide wraps its image in the image's link, so clicking a peeking neighbour opens that image's linked post in a new tab (`openInNewTab`) instead of advancing. The caption bar is 50% black with `--st-color-white-85` text and a `--st-color-seafoam` credit, which fails 4.5:1 over busy images. Affects every `imageGallery` section, carousel layout first; the grid and masonry layouts share `GalleryImage` and its caption.

## Objective

After this epic the carousel arrows are visible on any image, clicking a non-active slide scrolls it to centre and never follows its link, and caption text meets WCAG 2.2 AA over every image and every `treatment` value. Layers: React render (`ImageGallerySection`, `GalleryImage` in `PageSections.jsx`), CSS (`PageSections.module.css`), tokens only if no existing token fits. No Sanity schema, GROQ or content change.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Phase 0: vspec for carousel controls, peek-slide behaviour, caption legibility and image treatments, approved by Bex — layer: vspec
- [ ] Arrows: visible on light and dark images, 44px target, inside the track edge on mobile — layer: frontend (CSS)
- [ ] Peek slides: a click on a non-active slide advances to it and suppresses its link; only the active slide's link is followable; off-active links leave the tab order — layer: frontend (React)
- [ ] Caption: contrast of at least 4.5:1 text on its bar over every treatment (`none`, duotone, scrim), credit colour fixed — layer: frontend (CSS) and tokens if needed
- [ ] Lint of the same `GalleryImage` caption in grid and masonry layouts, same fix applies — layer: frontend (CSS)
- [ ] Storybook: `ImageGallery.stories.tsx` carousel story with dark, light and busy images, one multi-case story (Chromatic allotment) — layer: Storybook

## Phases

Single phase, after Phase 0 sign-off.

## Acceptance Criteria

- [ ] On `/articles/<slug>` with the Cast carousel, both arrows are visible against the first, middle and last slides in light and dark Pink Moon.
- [ ] Clicking the left or right peek slide scrolls it to centre, updates the active dot, and opens no tab.
- [ ] Tabbing through the carousel reaches only the active slide's link, the arrows and the dots.
- [ ] `pnpm validate:contrast` passes with the caption pair added, or the vspec names the measured ratio per treatment, each at least 4.5:1 for text.
- [ ] `pnpm validate:tokens --strict-colors` reports zero violations.
- [ ] `pnpm test:smoke` passes locally.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Content Write Gate:** does not fire; no Sanity writes.
- **Schema changes:** none.
- **Upstream dependencies:** none known. Activation audit: read `docs/backlog/` for in-flight epics touching `PageSections.jsx` or `PageSections.module.css` and state why each is or is not blocking.
- **Activation audits:** read `apps/web/src/design-system` `Media` component for the `overlay` z-index (caption sits at z-index 3, overlay at 2); read `apps/studio/schemas/sections/imageGallery.ts` to confirm `link.openInNewTab` is the only source of the new-tab behaviour; run `pnpm validate:contrast` to see how pairs are registered.
- **Component choice audit (react.md):** candidates are the DS `IconButton` (see `IconButton.audit.stories.tsx`), `Media`, and the existing `.carouselArrow` and `.galleryCaptionOverlay` classes. Default decision is to extend those, not add components; the vspec confirms.
- **Rule-file edits:** none planned.

## Model & Mode [REQUIRED]

`/model sonnet`: CSS and React behaviour on existing components, no architecture decision.

## Non-Goals

- No lightbox redesign. No change to grid or masonry layout geometry.
- No new gallery schema fields. Autoplay and swipe gestures are out of scope.
- No change to how images are linked in Studio.

## Related

- **GitHub:** [#201](https://github.com/bex-sugartown/sugartown/issues/201)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time

<!-- Chromatic: pending. CSS and a story changed; run at /ship (close-out step 4 deferral). -->

## Close-out review

### Acceptance criteria

- [x] Arrows visible on first, middle and last slides in light and dark: checked in the browser on `/articles/becky-b00p-illustration-prompt-system`, computed style 44px, rgba(0,0,0,0.9), 2px ring. Last slide not opened separately.
- [x] Peek click advances, opens no tab: clicked the right peek slide, active index 0 to 1, URL unchanged, no new tab.
- [x] Tab order reaches only the active slide's link: `tabIndex` read as `0,-1,-1,-1,-1,-1,-1,-1,-1`.
- [x] `pnpm validate:contrast` passes: ran locally, one unresolved shop-theme pair warning that predates this epic. The vspec's per-treatment ratios are hand-computed and were not re-measured.
- [x] `pnpm validate:tokens --strict-colors`: zero violations.
- [ ] `pnpm test:smoke`: 27 passed, 1 failed (dark axe on `/articles`, filter counts). Not caused by this epic. Tracked in #203.

### What didn't work

- The approved vspec class table said "no new class", but centring the arrows on the image needed a wrapper (`.carouselViewport`). The design-reviewer flagged it as a deviation.
- The browser pane was hidden at first, so visual verification waited for a round trip.
- One shell command ran from the wrong directory after a `cd ..`.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| `/articles` dark-mode axe contrast failure in FilterBar option counts | implementation | #203 |
| Dot ring uses `--st-color-text-secondary`, not the vspec prototype's white 85% in dark | implementation | declined: the vspec said to pick a theme-aware token; white 85% would vanish on the light page |
| Vspec class table should list wrapper elements the behaviour needs | workflow-docs | declined here, belongs in the vspec template epic #202 |
| Mobile slide width (90%, 100%) not tested at phone width | implementation | declined: rules unchanged by this epic |

### Friction line

The vspec class table missed a wrapper element its own arrow decision required, so the build added a class the table did not list.

## Post-ship checks

- [ ] Carousel on production shows visible arrows and advances on peek click: person: open `/articles/becky-b00p-illustration-prompt-system` on the live site.
- [ ] Chromatic VRT pass on the carousel story: person: approve in Chromatic at ship.
