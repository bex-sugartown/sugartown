---
**Epic:** ST-178 — AI image provenance — embedded metadata and visible watermark
**Issue:** [#178](https://github.com/bex-sugartown/sugartown/issues/178)
**Status:** Backlog
**Priority:** 🟢 Next
**Paired with:** SUG-178 ([#57](https://github.com/bex-sugartown/sugartown/issues/57), on-site badge)
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** `docs/drafts/ST-178-ai-image-provenance-metadata-and-watermark.vspec.html`
---

# ST-178 — AI image provenance — embedded metadata and visible watermark

Write provenance into AI-generated images at upload (embedded metadata), bake a visible mark into the image pixels, and evaluate an invisible watermark as a soft binding, so the AI label survives download, hotlinking and reposting.

> **Not SUG-178.** `SUG-178` (issue #57, the on-site AI badge) and `ST-178` (this epic) share a number by coincidence. #57 is the HTML badge; this epic is the file itself.

**Paired with SUG-178.** Shared goal: a reader or a platform can tell an image is AI-generated, wherever it travels. Sequence: one shared vspec first (this doc's Phase 0 covers the badge and the visible mark together, so they do not collide or double up); then SUG-178; then Phases 1 to 3 here. Neither blocks the other after the vspec.

## Background

The `richImage` schema carries `aiGenerated` and `aiTool` (SUG-55). SUG-178 (#57) will render them as an HTML corner badge. That badge lives in the page, so a saved, hotlinked or reposted image loses it. Nothing today writes provenance into the image file (no C2PA or IPTC metadata) or marks the pixels. The industry direction is layered marking: IPTC `DigitalSourceType` metadata (read by Google, Meta and Pinterest to show AI labels), C2PA Content Credentials with an invisible watermark as a soft binding, and a visible label. EU AI Act Article 50 applies from 2026-08-02 and its transparency code of practice accepts a multi-layered approach. A site publishing AI illustrations is probably outside the strict provider and deployer duties, so this epic follows the direction rather than claiming compliance. Activation audit: read the Commission's code of practice and Article 50 guidelines directly before citing either; this paragraph rests on secondary summaries dated 2026-10-30. `docs/briefs/ai-ethics-and-operations.md` Principles 3 and 13 require labelling through alt text or a caption only, and do not mention metadata or watermarking.

## Objective

After this epic, every image flagged `aiGenerated: true` carries up to four layers of label. Layer 1: embedded metadata in the file (IPTC digital source type as the must-have, plus C2PA as a stretch if the feasibility audit confirms it survives the Sanity CDN). Layer 2: an invisible watermark used as a C2PA soft binding, only if the audit finds tooling that is practical for this stack. Layer 3: a visible mark baked into the pixels. Layer 4: the on-site badge from SUG-178, which this epic does not build. Layers touched: Sanity asset pipeline (upload or migration script), possibly schema (a provenance field), and the AI ethics brief. No React render changes.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] **Feasibility audit (Phase 1):** test whether IPTC and C2PA metadata written to an uploaded image survives the Sanity image CDN (original vs `?w=` transformed URLs, `.webp` conversion). Record the result per format in this doc. — layer: tooling
- [ ] **Invisible watermark evaluation:** assess whether an invisible watermark (C2PA soft binding) is practical, covering tooling, licence, survival through resizing and `.webp` conversion, and cost. Output is a go or no-go recorded in this doc, not an implementation. — layer: tooling
- [ ] **Metadata writer:** a script or upload step that writes IPTC `DigitalSourceType` (`trainedAlgorithmicMedia`) and the `aiTool` value into the file before upload, and into the Sanity asset record where Sanity exposes a field. — layer: tooling / asset pipeline
- [ ] **Visible watermark:** a script that stamps the approved mark onto the image pixels per the vspec: the same label as `AiLabel` (lower-left, 3% inset, type 3.2% of image width capped at 14 px with no floor, dark pill), skipped under 96 px. Original unmarked file is kept outside the repo. — layer: tooling
- [ ] **Studio guard:** a validation or warning in Studio when `aiGenerated` is true but the asset has no provenance record. Schema change only if the audit shows a field is needed. — layer: schema
- [ ] **Back-fill list:** query every existing `richImage` and hero image with `aiGenerated: true` and list which need processing. Re-uploading is a content task done under the Content Write Gate. — layer: content
- [ ] **AI ethics brief:** update `docs/briefs/ai-ethics-and-operations.md` Principle 13 to state the three labelling layers, marking any layer not yet shipped as planned. — layer: docs (rule-defining file: exact diff shown and approved first)
- [ ] **Vspec:** `docs/drafts/ST-178-ai-image-provenance-metadata-and-watermark.vspec.html` showing the mark on a light image, a dark image, a portrait crop and a card thumbnail. — layer: design

## Phases

- [x] **Phase 0:** one vspec for the visible mark and the SUG-178 badge together; approved 2026-10-30. Outcome: one shared `AiLabel` component (`.aiLabel`), lower-left, one dark pill, text "AI-generated" ("AI" under 200 px, nothing under 96 px). The on-site label covers the baked mark, so only one label is ever visible. The stamping script reads its anchor, padding ratio, border and fill from the same shared config as the component.
- **Phase 1:** feasibility audit (metadata survival through the CDN) and the invisible watermark evaluation. Output decides whether C2PA and a soft binding are in scope, or IPTC only.
- **Phase 2:** metadata writer, watermark script, Studio guard.
- **Phase 3:** back-fill list, content re-uploads, ethics brief update.

## Acceptance Criteria

- [ ] Phase 0 vspec reviewed and the Phase 0 checkboxes marked complete before any implementation.
- [ ] The invisible watermark evaluation records a go or no-go with the reason.
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

- No on-site badge build. That is SUG-178 (#57); this epic only specifies how the mark and the badge coexist.
- No change to alt-text or caption rules.
- No implementation of an invisible watermark in this epic unless the Phase 1 evaluation returns go and the doc is amended; Scope then gains the item and Non-Goals is re-read.
- No claim of EU AI Act compliance. Article 50 is cited as direction only.
- No claim that the mark is tamper-proof. A visible mark can be cropped, and metadata can be stripped by other sites.
- No retroactive re-labelling without the Content Write Gate.

## Related

- **GitHub:** [#178](https://github.com/bex-sugartown/sugartown/issues/178)
- **On-site badge:** SUG-178 / [#57](https://github.com/bex-sugartown/sugartown/issues/57)
- **Schema origin:** SUG-55 (`aiGenerated`, `aiTool` on `richImage`)
- **Industry references (verify before citing):** EU AI Act Article 50 and the transparency code of practice; C2PA specification 2.x soft binding; IPTC Photo Metadata Standard 2025.1.
- **Ethics brief:** `docs/briefs/ai-ethics-and-operations.md` Principles 3 and 13
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
