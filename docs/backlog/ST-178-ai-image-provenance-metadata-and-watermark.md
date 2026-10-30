---
**Epic:** ST-178 — AI image provenance — embedded metadata and visible watermark
**Issue:** [#178](https://github.com/bex-sugartown/sugartown/issues/178)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** `docs/drafts/ST-178-ai-image-provenance-metadata-and-watermark.vspec.html`
---

# ST-178 — AI image provenance — embedded metadata and visible watermark

Write provenance into AI-generated images at upload (embedded metadata) and bake a visible mark into the image pixels, so the AI label survives download, hotlinking and reposting.

> **Not SUG-178.** `SUG-178` (issue #57, the on-site AI badge) and `ST-178` (this epic) share a number by coincidence. #57 is the HTML badge; this epic is the file itself.

## Background

The `richImage` schema carries `aiGenerated` and `aiTool` (SUG-55). SUG-178 (#57) will render them as an HTML corner badge. That badge lives in the page, so a saved, hotlinked or reposted image loses it. Nothing today writes provenance into the image file (no C2PA or IPTC metadata) or marks the pixels. `docs/briefs/ai-ethics-and-operations.md` Principles 3 and 13 require labelling through alt text or a caption only, and do not mention metadata or watermarking.

## Objective

After this epic, every image flagged `aiGenerated: true` carries three layers of label. Layer 1: embedded metadata in the file (IPTC digital source type, plus C2PA if the feasibility audit confirms it survives the Sanity CDN). Layer 2: a visible mark baked into the pixels. Layer 3: the on-site badge from SUG-178, which this epic does not build. Layers touched: Sanity asset pipeline (upload or migration script), possibly schema (a provenance field), and the AI ethics brief. No React render changes.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] **Feasibility audit (Phase 1):** test whether IPTC and C2PA metadata written to an uploaded image survives the Sanity image CDN (original vs `?w=` transformed URLs, `.webp` conversion). Record the result per format in this doc. — layer: tooling
- [ ] **Metadata writer:** a script or upload step that writes IPTC `DigitalSourceType` (`trainedAlgorithmicMedia`) and the `aiTool` value into the file before upload, and into the Sanity asset record where Sanity exposes a field. — layer: tooling / asset pipeline
- [ ] **Visible watermark:** a script that stamps the approved mark onto the image pixels per the vspec (position, size, opacity, contrast on light and dark images). Original unmarked file is kept outside the repo. — layer: tooling
- [ ] **Studio guard:** a validation or warning in Studio when `aiGenerated` is true but the asset has no provenance record. Schema change only if the audit shows a field is needed. — layer: schema
- [ ] **Back-fill list:** query every existing `richImage` and hero image with `aiGenerated: true` and list which need processing. Re-uploading is a content task done under the Content Write Gate. — layer: content
- [ ] **AI ethics brief:** update `docs/briefs/ai-ethics-and-operations.md` Principle 13 to state the three labelling layers, marking any layer not yet shipped as planned. — layer: docs (rule-defining file: exact diff shown and approved first)
- [ ] **Vspec:** `docs/drafts/ST-178-ai-image-provenance-metadata-and-watermark.vspec.html` showing the mark on a light image, a dark image, a portrait crop and a card thumbnail. — layer: design

## Phases

- **Phase 0:** vspec for the visible mark; sign-off before any pipeline code.
- **Phase 1:** feasibility audit (metadata survival through the CDN). Output decides whether C2PA is in scope or IPTC only.
- **Phase 2:** metadata writer, watermark script, Studio guard.
- **Phase 3:** back-fill list, content re-uploads, ethics brief update.

## Acceptance Criteria

- [ ] Phase 0 vspec reviewed and the Phase 0 checkboxes marked complete before any implementation.
- [ ] The feasibility audit result is recorded in this doc, with the command or file that produced each finding.
- [ ] An image flagged `aiGenerated: true`, downloaded from the live site, shows the digital source type when read with `exiftool` (or the audit documents why the CDN strips it).
- [ ] The same downloaded image shows the visible mark, legible on a light and a dark test image.
- [ ] An `aiGenerated: true` asset with no provenance record triggers the Studio warning.
- [ ] The ethics brief names every layer, and no layer is described as live that is not.
- [ ] If schema changed: schema deployed and MCP writes succeed.
- [ ] Any content re-upload has an approved Content Write Gate proposal before the patch.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose images this epic can reach, and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Content Write Gate:** fires for any back-fill that re-uploads or patches image assets.
- **Schema changes:** none assumed. Activation audit: read `apps/studio/schemas/objects/richImage.ts` and `galleryImage.ts`; decide after Phase 1 whether a `provenance` field is needed. If yes, add a Schema field proposal table and deploy the schema.
- **Upstream dependencies:** none blocking. Related to SUG-178 (#57), the on-site badge. Both read `aiGenerated`, but neither blocks the other. Activation audit: confirm no in-flight epic in `docs/backlog/` edits `richImage.ts`.
- **Gallery images:** `galleryImage` has no `aiGenerated` field today. Activation audit: confirm whether gallery images are in scope or deferred.
- **Tooling:** the audit chooses the watermark and metadata tooling. Do not add a dependency before the Atomic Reuse Gate is answered in writing.
- **Claim table:** the ethics brief and any published statement about provenance are claims about the platform. Each carries evidence and a measurement date.

## Model & Mode [REQUIRED]

`/model opus` — the feasibility audit and the choice between IPTC-only and C2PA are high-ambiguity, and the asset-pipeline design affects the schema. Use plan mode for the Pre-Execution Gate, then exit to execute.

## Non-Goals

- No on-site badge. That is SUG-178 (#57).
- No change to alt-text or caption rules.
- No claim that the mark is tamper-proof. A visible mark can be cropped, and metadata can be stripped by other sites.
- No retroactive re-labelling without the Content Write Gate.

## Related

- **GitHub:** [#178](https://github.com/bex-sugartown/sugartown/issues/178)
- **On-site badge:** SUG-178 / [#57](https://github.com/bex-sugartown/sugartown/issues/57)
- **Schema origin:** SUG-55 (`aiGenerated`, `aiTool` on `richImage`)
- **Ethics brief:** `docs/briefs/ai-ethics-and-operations.md` Principles 3 and 13
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
