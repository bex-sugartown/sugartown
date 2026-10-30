---
**Epic:** ST-179 — AI image label on card, editorial card, card-builder and gallery images
**Issue:** [#179](https://github.com/bex-sugartown/sugartown/issues/179)
**Status:** Done
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** `docs/drafts/ST-178-ai-image-provenance-metadata-and-watermark.vspec.html` (already approved; adds a card-thumbnail section at activation)
**Paired with:** SUG-178 ([#57](https://github.com/bex-sugartown/sugartown/issues/57)) and ST-178 ([#178](https://github.com/bex-sugartown/sugartown/issues/178))
---

# ST-179 — AI image label on card, editorial card, card-builder and gallery images

Extend the on-site `AiLabel` from SUG-178 to card-builder and editorial card images and gallery images.

## Background

SUG-178 (#57) shipped the `AiLabel` on inline `richImage` images and the detail-page hero; ST-178 (#178) added stamped-copy serving. Image types that still carry no `aiGenerated`, `aiTool` or `provenanceFiles`: `cardBuilderItem.image`, `editorialCard.image` and `galleryImage`. **Activation audit, 2026-10-30:** published content uses `cardBuilderItem.image` 6 times (the home page and the ds-section-showcase page), `editorialCard.image` in `cardSection` 10 times, and gallery images 40 times across 8 documents. `cardImage` (deprecated) is set on 0 published documents and archive `cardOptions.imageOverride` on 0, so archive-grid thumbnails show nothing from those sources today. **Correction to earlier docs:** card thumbnails do not fall back to the hero image: no query projects `heroImageUrl`, so that branch in `ContentCard.jsx` never runs (SUG-50, "card image from hero", is the open backlog epic for it). The schema field set (`apps/studio/schemas/objects/aiImageFields.ts`) and the component already exist.

## Objective

After this epic, an image flagged `aiGenerated` shows `AiLabel` on card thumbnails (inherited from the hero when the card uses it), editorial cards, card-builder cards and gallery images. Layers touched: Sanity schema (spread `aiImageFields` into each image type, deploy), GROQ projections, React render (ContentCard, card-builder and editorial card renderers, ImageGallery), Storybook. Content flagging stays a Studio task. Not touched: metadata and the baked mark (ST-178).

## Metadata plan

Not applicable, no content piece.

## Scope

- [x] **Schema (done 2026-10-30):** spread `aiImageFields` into the `image` field of `cardBuilderItem` and into `galleryImage`; deploy the schema. **Not done, with reasons (found 2026-10-30):** `editorialCard.image` (the 10 stored images sit in `cardSection`, which renders metric tiles only, so they never display; `editorialCard` is also deprecated) and `cardImage` (deprecated, 0 uses). — layer: schema
- [x] **Card source rule (done: SUG-50 doc carries the hand-off):** card-builder and editorial cards use their own image's fields. Archive-grid thumbnails (`cardImage`, `imageOverride`, 0 uses; hero fallback unwired) are out of scope; record in SUG-50's doc that its hero-derived thumbnail must carry the hero's flag and stamped copies when it ships. — layer: query
- [x] **Query projections (done):** add `aiGenerated` and `aiTool` to every projection of those images in `queries.js`. — layer: query
- [x] **Stamped copies (handed off from ST-178, done):** the new image types inherit `provenanceFiles` through `aiImageFields`; project `provenance` (`AI_PROVENANCE_PROJECTION` in `queries.js`) for each and serve the stamped copies instead of the Sanity image URL, using `stampedCopies` and `imageUrlFor` in `apps/web/src/lib/provenance.js`. Workflow: `docs/workflows/ai-image-provenance.md`. — layer: query / frontend
- [x] **Render (done):** pass the fields through ContentCard, the card-builder and editorial card renderers and ImageGallery to `AiLabel` (compact: width rules already hide the tool name under 320 px). — layer: frontend
- [x] **Gallery decision (done: the label sits on the image inside Media, below the caption overlay's z-order; the lightbox is not triggered by label clicks):** a gallery image sits inside a gallery-level overlay treatment; confirm the label's z-index and position against it. — layer: frontend
- [x] **Storybook (done):** a card story and a gallery story with a flagged image, light and dark. — layer: Storybook
- [x] **Vspec addendum (approved 2026-10-30):** add a card-thumbnail and gallery section to the shared vspec for sign-off. — layer: design

## Phases

- **Phase 0:** vspec addendum (card and gallery fixtures); sign-off before code.
- **Phase 1:** schema, deploy, projections (including the stamped-copy projection).
- **Phase 2:** render (including serving stamped copies) and Storybook.

## Acceptance Criteria

- [x] A card-builder card whose image is flagged shows the label on its thumbnail ("AI-generated" at 360 px, "AI" on the 140 px listing rail, never a tool name); an unflagged one shows none. Evidence: Storybook `Components/AiLabel` stories `On card thumbnail`, `On listing rail`, `On card thumbnail not flagged`, light and dark. Editorial card images are out of scope (see Scope).
- [x] A gallery image shows the label when flagged and nothing when not. Evidence: story `In gallery frame` (4:3 frame, hotspot crop kept, label inside the image), light and dark. The label click does not open the lightbox (`stopPropagation`, read in code; not clicked on a live gallery).
- [x] SUG-50's doc records the hero-flag hand-off. Evidence: `docs/backlog/SUG-50-card-image-from-hero.md` §AI label hand-off. Stories exist for a flagged card-builder-style card and a flagged gallery frame.
- [x] `pnpm validate:tokens`, `validate:tokens:strict` and `validate:schema-parity` pass; schema deployed. Evidence: pre-commit hook on every commit; `sanity schema deploy` then `validate:schema-parity`: no drift.
- [x] Storybook covers a flagged card, rail and gallery on `default` and `dark-pink-moon`. Evidence: checked in the browser on both themes 2026-10-30; Chromatic build 104, 4 visual changes accepted by Bex.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose images this epic can reach (archives, taxonomy pages, homepage card grids, detail pages with galleries), and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per page-type and datestamp it.

## Technical notes

- **Content Write Gate:** flagging existing images is a content change; it needs an approved proposal before any patch.
- **Schema changes:** reuse `aiImageFields`; no new field definitions. Deploy required.
- **Upstream dependencies:** SUG-178 (#57) must be shipped first (it provides `AiLabel` and `Media` support). No other in-flight epic touches these image types; activation audit: grep `docs/backlog/` for `cardImage`, `editorialCard` and `cardBuilderItem` before starting.
- **Activation audits (done 2026-10-30):** card-builder and editorial cards render through `CardBuilderSection.jsx` into the DS `Card` (`thumbnailUrl`); galleries render through `GalleryImage` in `PageSections.jsx`; `ContentCard.jsx` is archive grids only. Remaining reads: the four `imageGallery` `images[]` projections and the `card.image` projections in `queries.js`.
- **Cards are links:** the label must not fight card hover; the width rules already keep the tool name off thumbnails.
- **Model & Mode:** `/model sonnet`.

## Model & Mode [REQUIRED]

`/model sonnet` — schema-driven field additions, query projections and prop pass-through on an existing component.

## Non-Goals

- No metadata or baked mark. That is ST-178.
- No change to `AiLabel` look or width rules.
- No retroactive flagging of existing images; that is a content task under the Content Write Gate.
- No person, logo, site-settings or SEO images: not AI-generated content.

## Related

- **GitHub:** [#179](https://github.com/bex-sugartown/sugartown/issues/179)
- **On-site label:** SUG-178 / [#57](https://github.com/bex-sugartown/sugartown/issues/57)
- **File provenance:** ST-178 / [#178](https://github.com/bex-sugartown/sugartown/issues/178)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time

---

## Close-out review

### Acceptance criteria

See the ticked list above. Nothing on the live site was checked: no card-builder or gallery image is flagged and nothing is pushed (Post-ship checks).

### What didn't work

- The epic, and my own earlier notes in the SUG-178 doc, assumed archive cards fall back to the hero image. They do not: no query projects `heroImageUrl`. Found by reading the queries during the activation audit; the SUG-178 doc now carries an erratum.
- The first count of editorial-card images (10) implied a surface to cover. The renderer for `cardSection` shows metric tiles only, so those images never display. Found by reading the renderer, after the schema edit had been made, and reverted.
- Wrapping a flagged image in a frame would have broken the cover crop of gallery images (fixed aspect ratio). Caught by reading Media's aspect-ratio rule before testing, and fixed in the same commit.
- The independent review flagged "unflagged images keep the same DOM" as a blocker by reading the requirement backwards; the wrapper exists only for flagged images.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Hero-derived card thumbnails must carry the hero's flag and stamped copies | implementation | declined: written into SUG-50's doc §AI label hand-off, the open backlog epic that adds the hero fallback |
| `editorialCard` images are stored but never rendered, and the type is deprecated | implementation | declined: out of this epic; revisit if `cardSection` ever renders images |
| Archive-grid card thumbnails read the deprecated `cardImage` (0 published uses) | implementation | declined: 0 uses, SUG-50 replaces the source |
| Check a live gallery and the home page card-builder with a real flagged image | implementation | declined: tracked as the Post-ship checks below, which `/ship` reads |

### Friction line

Scope and an earlier doc assumed card thumbnails come from the hero image and that editorial card images render; both were wrong and were only caught by reading the queries and renderers.

---

## Post-ship checks

- [ ] A flagged card-builder image shows the label on the live home page: person: in Studio set AI-Generated on one card image on a draft of the home page, publish, and look at the card at desktop and phone width.
- [ ] A flagged gallery image shows the label on a live page and clicking the label does not open the lightbox: person: same steps on one gallery image, then click the label and then the image.
