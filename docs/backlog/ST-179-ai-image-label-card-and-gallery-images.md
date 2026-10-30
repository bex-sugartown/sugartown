---
**Epic:** ST-179 — AI image label on card, editorial card, card-builder and gallery images
**Issue:** [#179](https://github.com/bex-sugartown/sugartown/issues/179)
**Status:** Backlog
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

- [ ] **Schema:** spread `aiImageFields` into the `image` field of `cardBuilderItem` and `editorialCard`, and into `galleryImage`; deploy the schema. `cardImage` (deprecated, 0 uses) is not touched. — layer: schema
- [ ] **Card source rule:** card-builder and editorial cards use their own image's fields. Archive-grid thumbnails (`cardImage`, `imageOverride`, 0 uses; hero fallback unwired) are out of scope; record in SUG-50's doc that its hero-derived thumbnail must carry the hero's flag and stamped copies when it ships. — layer: query
- [ ] **Query projections:** add `aiGenerated` and `aiTool` to every projection of those images in `queries.js`. — layer: query
- [ ] **Stamped copies (handed off from ST-178):** the new image types inherit `provenanceFiles` through `aiImageFields`; project `provenance` (`AI_PROVENANCE_PROJECTION` in `queries.js`) for each and serve the stamped copies instead of the Sanity image URL, using `stampedCopies` and `imageUrlFor` in `apps/web/src/lib/provenance.js`. Workflow: `docs/workflows/ai-image-provenance.md`. — layer: query / frontend
- [ ] **Render:** pass the fields through ContentCard, the card-builder and editorial card renderers and ImageGallery to `AiLabel` (compact: width rules already hide the tool name under 320 px). — layer: frontend
- [ ] **Gallery decision:** a gallery image sits inside a gallery-level overlay treatment; confirm the label's z-index and position against it. — layer: frontend
- [ ] **Storybook:** a card story and a gallery story with a flagged image, light and dark. — layer: Storybook
- [ ] **Vspec addendum:** add a card-thumbnail and gallery section to the shared vspec for sign-off. — layer: design

## Phases

- **Phase 0:** vspec addendum (card and gallery fixtures); sign-off before code.
- **Phase 1:** schema, deploy, projections (including the stamped-copy projection).
- **Phase 2:** render (including serving stamped copies) and Storybook.

## Acceptance Criteria

- [ ] A card-builder or editorial card whose image is flagged shows the label on its thumbnail ("AI" or "AI-generated" by width, never a tool name); an unflagged one shows none.
- [ ] An editorial card, a card-builder card and a gallery image each show the label when flagged and nothing when not.
- [ ] SUG-50's doc records the hero-flag hand-off, and a Storybook story exists for a flagged card-builder card and a flagged editorial card.
- [ ] `pnpm validate:tokens`, `validate:tokens:strict` and `validate:schema-parity` pass; schema deployed.
- [ ] Storybook covers a flagged card and a flagged gallery on `default` and `dark-pink-moon`.

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
