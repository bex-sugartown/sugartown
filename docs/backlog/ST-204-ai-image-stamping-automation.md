---
**Epic:** ST-204 — AI image stamping: automatic on AI-Generated, with confirm, test first, then backfill
**Issue:** [#204](https://github.com/bex-sugartown/sugartown/issues/204)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-204-ai-image-stamping-automation.vspec.html`
---

# ST-204 — AI image stamping: automatic on AI-Generated, with confirm, test first, then backfill

Stamping starts by itself when AI-Generated is switched on, after Bex confirms, and leaves the original image and every existing setting untouched.

## Background

Today stamping is manual. A Claude session runs `scripts/ai-provenance/stamp.py` and attaches sized JPEG copies as `provenanceFiles` on the image object (`docs/workflows/ai-image-provenance.md`, ST-178 and ST-181, both closed). Until then Studio shows "Flagged AI-generated but no stamped copies yet" on the field (`apps/studio/schemas/objects/aiImageFields.ts`). The process does not replace the original asset, so alt text, caption, crop, hotspot and link already survive; the copies sit beside the original and the site serves them for flagged images. At least 3 published hero images are flagged (count with `*[_type in ["page","article","node","caseStudy"] && count(sections[backgroundImage.aiGenerated==true])>0]`, 2026-11-06); inline `richImage`, card-builder, gallery and SEO share images are not yet counted. Stamping is pixel-level, so it does not regenerate anything.

## Objective

After this epic, switching AI-Generated on in Studio asks Bex to confirm, then a Sanity Function (Bex's choice, 2026-11-06) makes the stamped copies and writes them to `provenanceFiles` on the draft. The Function never publishes and never changes the original image reference or any other field. It is proven on one existing flagged image before it touches the rest, and a backfill then stamps every already-flagged image after one more approval. Layers: Sanity Function (new), Studio (confirm step), `stamp.py` behaviour ported or wrapped, docs. No change to the site render, GROQ or the AiLabel component. The "replace the original asset" route is rejected in this epic and recorded in Technical notes.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Phase 0: vspec for the Studio confirm step (what appears when AI-Generated is switched on, the confirm and cancel states, the in-progress state, the done and failed states), approved by Bex — layer: vspec
- [ ] Function runtime audit: can a Sanity Function run the stamping (image processing, IPTC write, file-asset upload) within its limits, in Node, or must it call out — layer: Sanity Function (spike, result recorded in this doc)
- [ ] Stamping port or wrapper so the Function produces copies equal to `stamp.py` output (same sizes, mark from `label-spec.json`, IPTC `digitalSourceType`), with `pnpm validate:ai-provenance` still passing — layer: Sanity Function and tooling
- [ ] Studio confirm step wired to the Function, off by default for non-flagged images, never auto-fires on save without the confirm — layer: Studio
- [ ] Function writes only `provenanceFiles` on the draft, never touches `asset`, `alt`, `caption`, `credit`, `hotspot`, `crop`, `link`, and never publishes — layer: Sanity Function
- [ ] Test run on one existing AI-generated image: stamp, then diff every other field before and after, then `--verify` the downloaded copy — layer: content (draft only) and tooling
- [ ] Backfill of every already-flagged image after the test is approved, with a per-image before/after table — layer: content (draft only)
- [ ] Docs: update `docs/workflows/ai-image-provenance.md` and `docs/ai/ai-generated-images.md` for the automatic path — layer: docs (Instruction & Rule File Write Gate applies)

## Phases

| Phase | Ships | Scope items |
|---|---|---|
| 0 | Approved vspec for the confirm step | 1 |
| 1 | Runtime spike result, in this doc | 2 |
| 2 | Stamping in the Function, equal to `stamp.py`, validator green | 3, 5 |
| 3 | Studio confirm step | 4 |
| 4 | Test run on one existing image, diff recorded; Bex approves before Phase 5 | 6 |
| 5 | Backfill of all flagged images | 7 |
| 6 | Docs | 8 |

## Acceptance Criteria

- [ ] Switching AI-Generated on shows a confirm step; cancelling leaves the document unchanged; confirming starts exactly one stamping run.
- [ ] After a run, the draft has `provenanceFiles` entries for 480, 960 and 1920 widths (never upscaled), and `stamp.py --verify` on a downloaded copy reports `digitalSourceType: true`.
- [ ] Field diff on the test image shows only `provenanceFiles` changed; `asset._ref`, alt, caption, credit, hotspot, crop and link are identical before and after. The query and result are quoted in the epic doc.
- [ ] The Function never publishes: the published document is unchanged after a run (compare `_updatedAt` of the published version).
- [ ] A run on an image not flagged `aiGenerated` does nothing.
- [ ] The backfill table lists every flagged image found, with its result, and zero flagged images still show the "no stamped copies yet" warning.
- [ ] `pnpm validate:ai-provenance` passes.
- [ ] Schema deployed if any schema field changes, and an MCP write succeeds (`npx sanity schema deploy`).

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.
> Expected result: no site CSS changes, so the table is regression guards for pages that show an AI label.

## Technical notes

- **Content Write Gate:** a Function writes without a per-run proposal. It writes only a technical field (`provenanceFiles`, no human-readable copy) to the draft, and the Studio confirm step is the human checkpoint for each image. Activation decision for Bex: confirm that this counts as the gate's "pure structural or technical patch" exemption. The test run and the backfill each get a before/after table first.
- **Human-Publishes Rule:** the Function never calls publish. A draft with new copies waits for Bex to publish in Studio.
- **Replace versus attach:** replacing the image asset would keep other fields if only `asset._ref` is patched, but it would break stored crop and hotspot if the pixel size changes, lose the clean original, and remove the old Sanity asset reference that other documents may share. Attaching copies (current design) keeps the original and rollback is deleting the array. Chosen: attach.
- **Schema changes:** none expected. Activation audit: read `apps/studio/schemas/objects/aiImageFields.ts` and confirm `provenanceFiles` is enough to record a run status; if a status or `stampedAt` field is needed, propose it as a field table before deploying.
- **Upstream dependencies:** #178 and #181 (closed) provide `stamp.py`, `label-spec.json` and the field. No in-flight epic touches these files; activation audit: read `docs/backlog/` for any epic touching `apps/studio/schemas/objects/aiImageFields.ts` and state why each is or is not blocking. Not blocked by #202 or #203.
- **Activation audits:** run the count query above plus one for inline `richImage` in `content[]`, card-builder, gallery and `seo.openGraph.image`, so the backfill list is measured, not assumed. Read Sanity's Functions docs (`search_docs`, `read_docs`) for runtime limits, timeouts and allowed packages before choosing a port.
- **Cost:** stamping uses no image generation. The costs are Function runs, file-asset storage for 3 copies per image, and a session to run the backfill.
- **Rule-file edits:** the two docs in Scope item 8 go through the Instruction & Rule File Write Gate, diff first.
- **Mechanism rule:** the readers of the output are the site (serves `provenanceFiles`) and `pnpm validate:ai-provenance`; both exist.

## Model & Mode [REQUIRED]

`/model opus` with plan mode for Phase 1 and 2: the Function runtime choice and the port are architecture and carry real ambiguity. Switch to `/model sonnet` for Phases 3 to 6.

## Non-Goals

- No regeneration of any image, and no change to the original asset.
- No C2PA signing or invisible watermarking (recorded no-go in ST-178).
- No "AI-edited" state for retouched human images (declined in ST-181).
- No auto-publish, ever.
- No change to how the site renders the AI label.

## Related

- **GitHub:** [#204](https://github.com/bex-sugartown/sugartown/issues/204)
- Builds on [#178](https://github.com/bex-sugartown/sugartown/issues/178) and [#181](https://github.com/bex-sugartown/sugartown/issues/181), and `docs/workflows/ai-image-provenance.md`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
