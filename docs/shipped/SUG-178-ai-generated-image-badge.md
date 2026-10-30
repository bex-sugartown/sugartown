---
**Epic:** SUG-178 — AI-generated image badge — transparency overlay
**Linear Issue:** [SUG-178](https://linear.app/sugartown/issue/SUG-178/ai-generated-image-badge-transparency-overlay)
**Status:** Done
**Priority:** 🟢 Next
**Visual:** yes
**Vspec:** `docs/drafts/ST-178-ai-image-provenance-metadata-and-watermark.vspec.html` (shared with ST-178; badge and mark are specified together)
**Paired with:** ST-178 ([#178](https://github.com/bex-sugartown/sugartown/issues/178))
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-178 — AI-generated image badge — transparency overlay

> **Phase 0 (vspec) approved 2026-10-30.** The badge is now one shared component, `AiLabel` (`.aiLabel`), used by both this epic and ST-178's baked mark. Vspec: `docs/drafts/ST-178-ai-image-provenance-metadata-and-watermark.vspec.html`. Where this doc says "badge" below, read `AiLabel`. The vspec wins on any conflict: lower-left anchor (not lower-right), one dark pill on every image, text and tool name chosen by displayed image width.

Surface the existing `aiGenerated` toggle and `aiTool` field from the `richImage` schema as a label on rendered images, giving readers AI transparency without editorial friction.

## Paired with ST-178

**Shared goal:** a reader or a platform can tell an image is AI-generated, wherever the image travels. This epic is the on-site label, which lives in the page. ST-178 is the file itself: embedded metadata, a visible mark in the pixels, and an evaluation of an invisible watermark. The numbers match by coincidence (`SUG-178` here, `ST-178` there).

| | This epic (SUG-178, #57) | ST-178 (#178) |
|---|---|---|
| Layer | On-site badge | File metadata, visible mark, invisible watermark |
| Survives a download | No | Yes, until stripped or cropped |
| Needs | GROQ projection and DS component | Upload pipeline and a mark script |
| Shared input | `aiGenerated`, `aiTool` on `richImage` | Same fields |

**Sequence:** one shared vspec first (Phase 0, covers the badge and the visible mark so they do not collide or double up); then this epic; then ST-178 Phases 1 to 3. Neither blocks the other after the vspec. Activation audit: if ST-178's Phase 1 adds a provenance field, add it to the projection here before the badge ships, or record why not.

## Background

The `richImage` Sanity schema object already has two fields added in SUG-55: `aiGenerated` (boolean, default false) and `aiTool` (string enum: dall-e, midjourney, stable-diffusion, adobe-firefly, other). These fields are populated in Studio but their values are never queried or rendered — they exist only in the CMS. Every rendered image on the site currently gives no signal to the reader that it may be AI-generated, which conflicts with the site's stated AI ethics and transparency position.

## Objective

After this epic, any `richImage` with `aiGenerated: true` renders a small badge in the lower-right corner of the image showing "AI" (and on hover, the tool name). The badge is a new shared DS component (`AiLabel`) applied in every image-rendering context: inline images in article/node/case study content, hero images, and card thumbnails. The GROQ projections for `richImage` are updated to include both fields. No schema changes are required — schema is already deployed.

## Scope

- [x] **GROQ — query layer (done 2026-10-30):** `richImage` already projected both fields through its `...` spread; the four hero `backgroundImage` projections now add them.
- [x] **GROQ — query layer (original):** Add `aiGenerated` and `aiTool` to the `richImage` projection in `PT_CONTENT_PROJECTION` in `queries.js`. Verify any other GROQ fragments that dereference `richImage` (hero images, card thumbnails) also project these fields. — layer: query
- [x] **DS component — `AiLabel`:** Absolute-positioned label, lower-left, 3% of image width in from the left and bottom edges. Type is `clamp(9px, 3.2cqw, 14px)` inside a container-query wrapper (the 14 px cap was added 2026-10-30 after a 1920 px hero came out at about 61 px). One dark pill (midnight token, white text, chip border). Text by displayed width: under 96 px nothing, 96 to 199 px "AI", 200 px and up "AI-generated"; tool name (max 16 chars, ellipsis) expands on hover, focus or tap at 320 px and up only. Max width 70% of the image. Renders `null` when `aiGenerated` is false or absent. `role="img"`, `aria-label` "AI-generated image" plus the tool when known, focusable, accent focus ring, no transition under reduced motion. — layer: frontend / Design System
- [x] **InlineImage integration:** passes `aiGenerated` and `aiTool` to `Media` in all three richImage renderers (`ArticlePage.jsx`, `PageSections.jsx`, `portableTextComponents.jsx`); `Media` renders the label. — layer: frontend
- [x] **Hero image integration (done 2026-10-30):** schema scope widened with sign-off: the two AI fields now also live on the hero `backgroundImage` through one shared field set (`apps/studio/schemas/objects/aiImageFields.ts`, also used by `richImage`). The hero renders `AiLabel frame`. Original text follows.
- [x] **Hero image integration (original, superseded by the line above):** Wherever hero `richImage` is rendered (article, node, case study hero sections), pass fields through and render badge. — layer: frontend
- [ ] **ContentCard thumbnail integration (moved to ST-179, #179):** Pass fields from card data projection and render badge on card hero image when present. — layer: frontend
- [x] **Storybook:** `AiLabel` story with: default (no badge), AI-generated no tool, AI-generated with each tool value. Dark + light themes. — layer: Storybook

## Scope finding (2026-10-30)

Only `richImage` carried `aiGenerated` and `aiTool`, so inline body images were covered by the original "no schema change" plan. The detail-page hero (`hero` section `backgroundImage`) and card images use a plain `image` type with no AI fields. Bex chose to add the fields to the hero `backgroundImage` inside this epic. **Still uncovered, no AI fields:** `cardImage` (deprecated), `editorialCard.image`, `cardBuilderItem.image`, `galleryImage`. Card thumbnails fall back to the hero image, so a flagged hero does not yet flag its card. Follow-up needed (file at close-out).

> **Erratum, 2026-10-30 (found during ST-179's audit):** the hero-fallback sentence above is wrong. No query projects `heroImageUrl`, so archive cards never show the hero image today; they read `cardImage` (0 published uses) or `imageOverride` (0 uses). The real gaps are card-builder and editorial card images and gallery images. See `docs/backlog/ST-179-ai-image-label-card-and-gallery-images.md`.

## Phases

- [x] **Phase 0:** vspec approved 2026-10-30 (shared with ST-178).
- [x] **Phase 1:** GROQ, `AiLabel` component, integrations, Storybook. All work touches the same GROQ + frontend + Storybook layer.

## Acceptance criteria

- [x] A `richImage` with `aiGenerated: true` and a tool renders the label lower-left (the vspec moved it from lower-right); hovering shows the tool name at 320 px and up. Evidence: Storybook `Components/AiLabel` stories, hover checked in the browser 2026-10-30. Live check in Post-ship checks.
- [x] `aiGenerated: false` or absent renders no label. Evidence: `NotAiGenerated` story; `Media` keeps its original DOM when the flag is unset.
- [x] The label renders in light and dark with no hardcoded colours. Evidence: light and dark checked in Storybook for the inline and hero stories; `pnpm validate:tokens:strict` clean.
- [ ] Hero images on article, node and case study pages show the label when flagged. Verified on `Regions/Hero` stories in both widths, light and dark. No real page is flagged yet, so the live check is in Post-ship checks.
- [ ] ContentCard thumbnails show the label when the source has a flagged hero. Not done: moved to ST-179 (#179).
- [x] `pnpm validate:tokens` and `validate:tokens:strict` pass. Evidence: pre-commit hook on every commit; independent review confirmed zero hardcoded colours.
- [x] Storybook covers all states and renders on dark-pink-moon. Evidence: 12 `AiLabel` stories and 2 hero stories; Chromatic build 102, 14 visual changes reviewed and accepted by Bex.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose image rendering this epic can reach (article detail, node detail, case study detail, archive card grids), and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **No schema deploy required** — `aiGenerated` and `aiTool` are already deployed on `richImage`. Studio fields are live.
- **GROQ nested image rule (MEMORY.md):** `richImage.asset` is an image object wrapping its own asset ref. The existing `PT_CONTENT_PROJECTION` already handles `"dimensions": asset.asset->metadata.dimensions` — add `aiGenerated` and `aiTool` at the same level (direct fields on `richImage`, not nested under `asset`).
- **Activation audit — query coverage:** Before writing any projection changes, grep `queries.js` for every location that dereferences a `richImage` or hero image field. Hero image projections on `articleBySlugQuery`, `nodeBySlugQuery`, `caseStudyBySlugQuery`, and card projections in `allSiteItemsQuery` / `allArticlesQuery` etc. must all be audited.
- **Badge positioning:** `position: absolute; bottom: var(--st-space-2); right: var(--st-space-2)` inside a `position: relative` image wrapper. Confirm the image wrapper in `InlineImage` is already `position: relative` before writing new CSS.
- **Hover expand:** CSS transition on `max-width` or `width` from pill (monogram only) to extended (monogram + tool label). No JS required.
- **Model & Mode:** `/model opus` — Opus plans the GROQ projection audit and component API; Sonnet executes.

## Model & Mode [REQUIRED]

`/model opus` — schema is already done; the work is GROQ audit + new DS component + multi-surface integration. Opus plans the projection coverage and component API; Sonnet executes.

## Non-Goals

- No schema changes — fields already exist and are deployed
- No modal or lightbox — badge + hover tooltip only; no click-to-expand detail panel
- No gallery-level badge — the `mediaOverlay` / gallery treatment is a separate surface; this epic covers `richImage` instances only
- No retroactive content tagging — this epic wires the rendering; tagging existing images is a content task for the editor

## Related

- **Linear:** [SUG-178](https://linear.app/sugartown/issue/SUG-178/ai-generated-image-badge-transparency-overlay)
- **Schema origin:** SUG-55 (AI ethics compliance — `aiGenerated` + `aiTool` fields added to `richImage`)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, and Files to Modify at activation time

---

## Close-out review

### Acceptance criteria

See the ticked list above. Two criteria are not closed: card thumbnails (moved to ST-179) and a live-page check of a flagged hero (Post-ship checks).

### What didn't work

- The epic assumed hero and card images were `richImage`. Only body images are; hero and card images are a plain `image` type with no AI fields. Found while wiring the hero, after the component was built.
- The vspec's "no ceiling on type size" gave about 61 px type on a 1920 px hero. Caught by checking the hero, not by the vspec review. A 14 px cap was added and the vspec amended.
- The web app imports the design system from its built `dist`, so Storybook showed a missing-export error until the package was rebuilt.
- The first Phase 0 vspec showed an unreadable badge: it used a 50% transparent white token for text.
- A lint error (missing display name on a story decorator) blocked the first commit.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| AI fields and label on card thumbnails, editorial cards, card-builder cards and gallery images | implementation | #179 |
| Stamp the baked mark with the same 14 px cap | implementation | in ST-178 (#178) Scope |
| Epic docs must check which image type a surface uses before scoping an AI-field epic | workflow-docs | declined: one case; revisit if a second epic assumes the wrong image type |
| Fresh Storybook sessions fail on a stale design-system `dist` | workflow-docs | declined: already a known property of the build, noted here |

### Friction line

Scope assumed hero and card images shared `richImage`'s AI fields; they do not, which cost a schema change and a scope decision mid-epic.

---

## Post-ship checks

- [ ] A flagged inline image shows the label on the live site: person: in Studio, set AI-Generated on one image in a draft article, then view that article's preview page.
- [ ] A flagged hero shows the label on a live detail page: person: in Studio, set AI-Generated on one hero background image, publish, and open the page at desktop and phone width.
