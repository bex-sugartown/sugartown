---
**Epic:** SUG-178 — AI-generated image badge — transparency overlay
**Linear Issue:** [SUG-178](https://linear.app/sugartown/issue/SUG-178/ai-generated-image-badge-transparency-overlay)
**Status:** Backlog
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

- [ ] **GROQ — query layer:** Add `aiGenerated` and `aiTool` to the `richImage` projection in `PT_CONTENT_PROJECTION` in `queries.js`. Verify any other GROQ fragments that dereference `richImage` (hero images, card thumbnails) also project these fields. — layer: query
- [ ] **DS component — `AiLabel`:** Absolute-positioned label, lower-left, 3% of image width in from the left and bottom edges. Type is `max(9px, 3.2cqw)` inside a container-query wrapper. One dark pill (midnight token, white text, chip border). Text by displayed width: under 96 px nothing, 96 to 199 px "AI", 200 px and up "AI-generated"; tool name (max 16 chars, ellipsis) expands on hover, focus or tap at 320 px and up only. Max width 70% of the image. Renders `null` when `aiGenerated` is false or absent. `role="img"`, `aria-label` "AI-generated image" plus the tool when known, focusable, accent focus ring, no transition under reduced motion. — layer: frontend / Design System
- [ ] **InlineImage integration:** Pass `aiGenerated` + `aiTool` through to `<InlineImage>` and render `<AiBadge>` inside its image wrapper. — layer: frontend
- [ ] **Hero image integration:** Wherever hero `richImage` is rendered (article, node, case study hero sections), pass fields through and render badge. — layer: frontend
- [ ] **ContentCard thumbnail integration:** Pass fields from card data projection and render badge on card hero image when present. — layer: frontend
- [ ] **Storybook:** `AiLabel` story with: default (no badge), AI-generated no tool, AI-generated with each tool value. Dark + light themes. — layer: Storybook

## Phases

- [x] **Phase 0:** vspec approved 2026-10-30 (shared with ST-178).
- [ ] **Phase 1:** GROQ, `AiLabel` component, integrations, Storybook. All work touches the same GROQ + frontend + Storybook layer.

## Acceptance criteria

- [ ] An article with a `richImage` block where `aiGenerated: true` and `aiTool: 'midjourney'` renders a badge in the lower-right corner of the image; hovering shows "Midjourney"
- [ ] An article with `aiGenerated: false` (or field absent) renders no badge
- [ ] Badge renders correctly in both light and dark themes with no hardcoded colours
- [ ] Hero images on article, node, and case study detail pages show badge when flagged
- [ ] ContentCard thumbnails show badge when the source item has a flagged hero image
- [ ] `pnpm validate:tokens` and `pnpm validate:tokens:strict` pass — no raw colour values in `AiLabel` CSS
- [ ] Storybook story covers all states; renders correctly on dark-pink-moon theme

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
