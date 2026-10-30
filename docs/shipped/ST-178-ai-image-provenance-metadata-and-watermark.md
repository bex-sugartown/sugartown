---
**Epic:** ST-178 — AI image provenance — embedded metadata and visible watermark
**Issue:** [#178](https://github.com/bex-sugartown/sugartown/issues/178)
**Status:** Done
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

- [x] **Feasibility audit (Phase 1, done 2026-10-30, see result below):** test whether IPTC and C2PA metadata written to an uploaded image survives the Sanity image CDN (original vs `?w=` transformed URLs, `.webp` conversion). Record the result per format in this doc. — layer: tooling
- [x] **Invisible watermark evaluation (done 2026-10-30: no-go, see Decisions):** assess whether an invisible watermark (C2PA soft binding) is practical, covering tooling, licence, survival through resizing and `.webp` conversion, and cost. Output is a go or no-go recorded in this doc, not an implementation. — layer: tooling
- [x] **Metadata writer (done 2026-10-30):** `scripts/ai-provenance/stamp.py` writes IPTC `DigitalSourceType` and `AISystemUsed` into the XMP of each stamped JPEG. Changed by the audit: the files are uploaded as file assets and served as-is, because the image CDN strips metadata. Workflow: `docs/workflows/ai-image-provenance.md`. — layer: tooling / asset pipeline
- [x] **Visible watermark (done 2026-10-30, same tool):** a script that stamps the approved mark onto the image pixels per the vspec: the same label as `AiLabel` (lower-left, 3% inset, type 3.2% of image width capped at 14 px with no floor, dark pill), skipped under 96 px. Original unmarked file is kept outside the repo. — layer: tooling
- [x] **Studio guard (done 2026-10-30):** the audit showed a field is needed. `provenanceFiles` (width plus file) lives in the shared `aiImageFields`, and `aiGenerated` warns when it is empty. Schema deployed. The site, the hero background and the lightbox serve the stamped copies. — layer: schema
- [x] **Back-fill list (done 2026-10-30: empty):** a precise GROQ query over every document with `content` or `sections` found 0 flagged inline images and 0 flagged heroes, so nothing needs stamping yet. Query:  query every existing `richImage` and hero image with `aiGenerated: true` and list which need processing. Re-uploading is a content task done under the Content Write Gate. — layer: content
- [x] **AI ethics brief (done 2026-10-30, diff approved by Bex):** update `docs/briefs/ai-ethics-and-operations.md` Principle 13 to state the three labelling layers, marking any layer not yet shipped as planned. — layer: docs (rule-defining file: exact diff shown and approved first)
- [x] **Vspec (approved 2026-10-30):** `docs/drafts/ST-178-ai-image-provenance-metadata-and-watermark.vspec.html` showing the mark on a light image, a dark image, a portrait crop and a card thumbnail. — layer: design

## Phases

- [x] **Phase 0:** one vspec for the visible mark and the SUG-178 badge together; approved 2026-10-30. Outcome: one shared `AiLabel` component (`.aiLabel`), lower-left, one dark pill, text "AI-generated" ("AI" under 200 px, nothing under 96 px). The on-site label covers the baked mark, so only one label is ever visible. The stamping script reads its anchor, padding ratio, border and fill from the same shared config as the component.
- [x] **Phase 1 (done 2026-10-30):** feasibility audit (metadata survival through the CDN) and the invisible watermark evaluation. Output decides whether C2PA and a soft binding are in scope, or IPTC only.
- [x] **Phase 2 (done 2026-10-30):** metadata writer and mark stamping in one tool, Studio guard, site serving stamped copies.
- [x] **Phase 3 (done 2026-10-30):** back-fill list (empty), ethics brief update. No content re-uploads: nothing is flagged.

## Decisions (2026-10-30, Bex)

- **Metadata path: pre-render sized copies as file assets for flagged images.** The stamping tool writes 480, 960 and 1920 px JPEGs with the mark and the IPTC tags; they are uploaded as file assets and linked from the image. Cost accepted: no Sanity crop or auto-format for flagged images.
- **Invisible watermark and C2PA: no-go for now.** Both need the original bytes plus a signing service or certificate and a way to look a credential up after metadata is stripped. None of that exists here, and the image CDN drops embedded data. Revisit through a new issue only if a signing path is wanted.

## Phase 1 audit result: metadata survival (2026-10-30)

**Finding: the Sanity image CDN strips all embedded metadata, including from the plain, unparameterised URL.** A file asset serves the original bytes untouched.

Method: a synthetic 800 x 600 JPEG (16,357 bytes) carrying an IPTC `DigitalSourceType` of `trainedAlgorithmicMedia` in XMP, an XMP description marker and an EXIF description marker was uploaded twice to dataset `production`, once as an image asset and once as a file asset. Each served response was fetched with `curl` and searched for the three markers. Both test assets were then deleted (`sanity documents delete`; a follow-up query counted 0 documents left).

| URL form | Response | Bytes | DigitalSourceType | XMP | EXIF |
|---|---|---|---|---|---|
| image CDN, plain URL | image/jpeg | 6,115 | gone | gone | gone |
| image CDN `?w=400` | image/jpeg | 1,643 | gone | gone | gone |
| image CDN `?q=80` | image/jpeg | 6,115 | gone | gone | gone |
| image CDN `?fm=webp` | image/webp | 3,076 | gone | gone | gone |
| image CDN `?auto=format` (with and without a webp Accept header) | jpeg or webp | 6,115 or 3,076 | gone | gone | gone |
| image CDN `?fm=png` | image/png | 14,685 | gone | gone | gone |
| image CDN `?dl=` | image/jpeg | 6,115 | gone | gone | gone |
| **file CDN** (`cdn.sanity.io/files/...`) | image/jpeg | **16,357, SHA-1 identical to the upload** | **kept** | **kept** | **kept** |

Consequences:
- Writing IPTC or C2PA metadata into a file before a normal Sanity image upload does nothing for any image the site serves. Only the visible mark, which is in the pixels, survives.
- A file asset keeps the metadata but bypasses Sanity's resizing, format conversion and hotspot crop.
- C2PA needs the original bytes plus a signature, so it has the same limit.
- Cached copies of the deleted test images were still served by the CDN minutes after deletion (HTTP 200). They are synthetic gradients and will expire.

Not yet tested: whether Google, Meta or Pinterest read AI labels from the CDN-served file (it has none), and whether a Netlify edge function could re-inject XMP on the fly.

## Acceptance Criteria

- [x] Phase 0 vspec reviewed and the Phase 0 checkboxes marked complete before any implementation. Evidence: approved by Bex 2026-10-30, commit `ba8a5a23`.
- [x] The invisible watermark evaluation records a go or no-go with the reason. Evidence: Decisions section above (no-go).
- [x] The feasibility audit result is recorded with the command that produced each finding. Evidence: Phase 1 audit result table, `curl` per URL form.
- [ ] An image flagged `aiGenerated: true`, downloaded from the live site, shows the digital source type. Verified on the tool's output (`stamp.py --verify`: `digitalSourceType: true` on every copy) and on a file asset served by the CDN (original bytes, SHA-1 identical, tags kept). No real image is flagged and nothing is pushed, so the live check is in Post-ship checks.
- [x] The same stamped image shows the visible mark. Evidence: the 480 px copy opened and inspected; same label as `AiLabel` (dark pill, lower-left, 14 px type). Tested on a synthetic image only.
- [x] An `aiGenerated: true` image with no stamped copies triggers the Studio warning. Evidence: validation rule in `aiImageFields.ts` (warning level); not exercised in Studio, see Post-ship checks.
- [x] The ethics brief names every layer, and no layer is described as live that is not. Evidence: Principle 13 table, approved by Bex.
- [x] Schema deployed. Evidence: `sanity schema deploy` and `pnpm validate:schema-parity`: no drift.
- [x] No content re-upload happened. Evidence: back-fill query returned zero flagged images; the only dataset writes were two audit test assets, deleted.

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

---

## Close-out review

### Acceptance criteria

See the ticked list above. One is open: the live-site download check, which needs a real flagged and stamped image on a deployed page (Post-ship checks).

### What didn't work

- The epic assumed metadata written into an uploaded image would reach readers. The audit showed the Sanity image CDN strips it from every URL, including the unparameterised one. That moved the design from "write metadata at upload" to "serve pre-rendered file assets", a bigger change found only by testing.
- An early GROQ count reported 171 flagged inline images and 7 flagged heroes. It was a query artefact (counting over documents with no such field). A precise query showed zero. Caught by listing the documents before building on the number.
- `python3 -I` hid Pillow from the first test-image script.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Card thumbnails, editorial cards, card-builder cards and gallery images need the same stamped-copy serving; they inherit `aiImageFields` including `provenanceFiles` | implementation | ST-179 (#179); add the stamped-copy rule to its Scope |
| Stamping a real image end to end and checking it on the live site | implementation | declined: tracked as the first Post-ship check below, which `/ship` reads |
| Invisible watermark and C2PA signing | implementation | declined: no-go for now (Decisions); reopen through a new issue |
| Studio has no one-click stamp; a Claude session runs the tool | workflow-docs | declined: documented in `docs/workflows/ai-image-provenance.md`; revisit if stamping becomes frequent |
| Count queries over nested arrays can mislead; list the documents first | workflow-docs | declined: one case |

### Friction line

Scope assumed embedded metadata survives the Sanity image CDN; it does not, which turned a metadata-writer task into a serve-from-file-assets redesign.

---

## Post-ship checks

- [ ] A stamped, flagged image downloads from the live site with the IPTC tag intact: person: ask a Claude session to stamp one flagged image and attach the copies, publish it, then have the session download the file from the live page and run `stamp.py --verify`.
- [ ] The Studio warning shows on a flagged image with no stamped copies: person: in Studio, set AI-Generated on one image in a draft and look for the yellow warning on the field.
