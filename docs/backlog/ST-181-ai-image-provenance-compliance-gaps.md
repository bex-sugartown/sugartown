---
**Epic:** ST-181 — AI image provenance: close the compliance gaps
**Issue:** [#181](https://github.com/bex-sugartown/sugartown/issues/181)
**Status:** Todo
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** `docs/drafts/ST-181-ai-image-provenance-compliance-gaps.vspec.html`
---

# ST-181 — AI image provenance: close the compliance gaps

Follow-up audit of SUG-178 (#57), ST-178 (#178) and ST-179 (#179) against C2PA, IPTC 2025.1 and EU AI Act Article 50: carry the label and metadata onto share images, record what signing would take, check whether `AiLabel` should be a `Chip` variant, and correct the `/ai-ethics` page.

## Background

The three shipped epics put a visible label on page images and write IPTC `DigitalSourceType` and `AISystemUsed` into stamped file copies (`scripts/ai-provenance/stamp.py`). The audit of 2026-10-31 found gaps. **Share images:** `og:image` is built through the Sanity image CDN (`SeoHead.jsx:108`, `urlFor(...).width(1200).height(630)`), which strips all embedded metadata (ST-178 audit), so a flagged image shared to a platform carries neither the metadata nor the baked mark. **Never verified live:** no image is flagged or stamped, and both ST-178 post-ship checks are open. **Component reuse:** none of the three epic docs records a Component choice gate audit (`grep` for "component choice", "candidates checked", "variant-first" in the three docs returned nothing), and `AiLabel` re-implements about 60% of `Chip` variant `badge` (mono font, 700 weight, uppercase, `--st-chip-border`, square corners, em-based padding). **Ethics page:** live Principle 13 says Article 50 "requires AI-generated content to be identifiable via visible labels, metadata, or watermarking". Per the sources read 2026-10-31, the machine-readable marking duty (50(2)) sits on providers of generative systems, and deployers owe disclosure only for deepfakes and public-interest text, reduced for evidently artistic work. The changelog line "Not done: invisible watermarking and C2PA signing, which need original files and a signing service" is also incomplete: C2PA signing needs a certificate from a trusted authority, and a soft binding needs an approved algorithm and a lookup service. Reference surfaces: `apps/web/src/components/SeoHead.jsx`, `apps/web/src/lib/seo.js`, `packages/design-system/src/components/AiLabel/`, `packages/design-system/src/components/Chip/`, `scripts/ai-provenance/`, the Sanity page `page-ai-ethics`, `docs/briefs/ai-ethics-and-operations.md`.

## Objective

After this epic, a flagged image shared to a platform carries the AI label and metadata (stamped 1200 x 630 copy as `og:image`); the stamped files carry the IPTC 2025.1 AI system version field where known; a recorded go or no-go says what C2PA signing and a soft binding would take; `AiLabel` is built on `Chip` if the vspec approves that (or a recorded reason if not); and `/ai-ethics` states Article 50 as the sources read, with an accurate changelog and "not done" line. Layers touched: Sanity schema (SEO image field, one optional field), GROQ (`seo.openGraph.image` projection), React (`SeoHead`, `AiLabel`, `Chip`), tooling (`stamp.py`), content (Studio copy edit on `page-ai-ethics`), docs (ethics brief). Excluded: the AI-edited state, preserving generator C2PA credentials, and blocking publish of a flagged image with no copies (see Non-Goals).

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] **Vspec incl. Chip-variant check — layer: design.** The shared vspec gains a section comparing `AiLabel` today against `Chip variant="badge"` plus `tone="inverse"` and `size="fluid"`, with measured values at 96 to 480 px, and a class and prop naming table. Done at filing as a first draft; needs sign-off.
- [ ] **Signing feasibility audit — layer: tooling.** Read primary sources (C2PA specification, Official Journal text of the AI Omnibus, TrustMark documentation, a C2PA trust-list or certificate route) and record per item: what a publisher must hold or run, cost, whether Sugartown is a provider or deployer for each duty. Output is a go or no-go in this doc, not an implementation.
- [ ] **Share-image stamping — layer: tooling.** `stamp.py` renders a 1200 x 630 cover-crop rendition with the baked mark and IPTC tags, recorded in `provenanceFiles` with a width of 1200 and a marker distinguishing it from the page renditions.
- [ ] **Share-image schema — layer: schema.** Spread `aiImageFields` into the SEO `openGraph.image` field (and `defaultOgImage` if the audit shows it is used), deploy the schema.
- [ ] **Share-image query and render — layer: query / frontend.** Project `aiGenerated`, `aiTool` and `provenance` for `seo.openGraph.image`; `SeoHead` uses the stamped 1200 x 630 copy when flagged and the current URL otherwise.
- [ ] **IPTC 2025.1 AI fields — layer: tooling / schema.** Write `AISystemVersionUsed` when a version is recorded (new optional field `aiToolVersion` on the shared set). Prompt fields (`AIPromptInformation`, `AIPromptWriterName`) only with an explicit per-image opt-in, since prompts can hold private text; activation decision recorded in this doc.
- [ ] **`AiLabel` on `Chip` — layer: frontend / Design System.** If the vspec approves: add `tone="inverse"` and `size="fluid"` to `Chip`, rebuild `AiLabel` as a positioned wrapper that renders `Chip` (keeping the width tiers and tool-name expand), repoint `label-spec.json` and `test_stamp.py` at the Chip tokens, zero change to every existing Chip story.
- [ ] **Storybook — layer: Storybook.** Chip stories for the new props (light and dark), `AiLabel` stories unchanged in output.
- [ ] **Ethics page and brief — layer: content / docs.** Correct Principle 13's Article 50 sentence, add a changelog entry that carries the rewritten "not done" line, update "Last updated", and sync `docs/briefs/ai-ethics-and-operations.md`. Each statement carries a source and a measurement date. Sanity write under the Content Write Gate; the draft is left for Bex to publish.
- [ ] **Live verification — layer: content.** Flag one real image, stamp it, publish, then download both the page image and the `og:image` file and run `stamp.py --verify` on each; record the result.

## Phases

- [ ] **Phase 0:** vspec sign-off, covering the Chip-variant decision, the class and prop naming table, new tokens, and the ethics page wording. Nothing else starts before it.
- [ ] **Phase 1:** signing feasibility audit (go or no-go). Its outcome fixes the ethics page wording in Phase 5.
- [ ] **Phase 2:** share images (stamping, schema, query, render) and the IPTC 2025.1 fields.
- [ ] **Phase 3:** `AiLabel` on `Chip` and Storybook, if Phase 0 approved it.
- [ ] **Phase 4:** ethics page and brief.
- [ ] **Phase 5:** live verification.

## Acceptance Criteria

- [ ] The vspec section compares `AiLabel` and the Chip variant at 96, 160, 240, 320 and 480 px with measured pixel values, and Bex has signed it off. Evidence: a browser measurement of both in the vspec.
- [ ] The feasibility audit records a go or no-go per item (C2PA signing, soft binding, preserving generator credentials), each with a cited primary source and a date.
- [ ] A flagged image in a draft page produces an `og:image` URL that is a file asset, not an image-CDN URL. Evidence: the rendered `<meta property="og:image">` content.
- [ ] That file shows `digitalSourceType: true` and the baked mark. Evidence: `stamp.py --verify` output and the file opened.
- [ ] An unflagged image's `og:image` URL is byte-identical to today's. Evidence: before and after capture on one page.
- [ ] If `AiLabel` moves to `Chip`: every existing Chip story is unchanged in Chromatic (zero changes) and the `AiLabel` stories change only where the vspec said they would. `pnpm validate:ai-provenance` passes against the new tokens.
- [ ] Live Principle 13 and the changelog match the cited sources, and no statement says marking is a publisher duty. Evidence: claim table in this doc, each row with a source and date. Proposal approved before patch (Content Write Gate); published by Bex.
- [ ] Schema deployed and `pnpm validate:schema-parity` shows no drift.
- [ ] `pnpm validate:tokens`, `pnpm validate:style-mirror` and `pnpm test:smoke` pass locally.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

`Chip` is used on archive, detail and taxonomy pages, so the table must cover them as regression guards.

## Technical notes

- **Content Write Gate:** fires for the `page-ai-ethics` edit (Principle 13 text, changelog, last-updated line). Write goes to the draft; Bex publishes.
- **Schema changes:** the SEO image field gains the shared AI field set, and `aiToolVersion` is added; deploy required. See the field proposal below.
- **Upstream dependencies:** SUG-251 ([#82](https://github.com/bex-sugartown/sugartown/issues/82), SEO meta prerendering) is related and does not block. `SeoHead` sets `og:image` in a client-side effect, so crawlers that do not run JavaScript never see any `og:image` today. This epic fixes what the tag points at; #82 fixes whether non-JS crawlers see the tag. Activation audit: confirm in `docs/backlog/` that no other in-flight epic edits `Chip.tsx`, `Chip.module.css`, `SeoHead.jsx` or `seo.js`.
- **Activation audits:** read `apps/web/src/lib/seo.js` lines 70 to 100 and 280 to 300 (the `openGraph.image` projection and `defaultOgImage` fallback); `apps/studio/schemas/` for the SEO object that holds `openGraph.image`; `Chip.module.css` for any selector that would change for existing chips when `tone` and `size` gain values. Verify every external claim against its primary source before writing it down (the 2026-10-31 audit used secondary summaries for the Omnibus date).
- **Dates not yet verified against primary text:** Article 50(2), (4) and (5) apply from 2026-08-02 (Commission FAQ, updated 2026-07-29); the Commission FAQ calls the 2026-12-02 grandfathering for marking by systems already on the market conditional ("if adopted"), and secondary sources say the AI Omnibus (Regulation (EU) 2026/1744, per one source) was published 2026-07-24. Confirm in the Official Journal in Phase 1.
- **Model & Mode:** see below.

### Schema field proposal

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `aiToolVersion` (string) | Version or model name of the generator that made the image | `v6.1` | Written into IPTC `AISystemVersionUsed` so a platform or auditor can tell which model produced it |
| `openGraph.image` AI fields (the shared `aiImageFields` set) | The same `aiGenerated`, `aiTool`, `provenanceFiles` already on other image types | `aiGenerated: true` | A flagged share image gets stamped copies and the label baked in |

## Model & Mode [REQUIRED]

`/model opus`, with plan mode for the Pre-Execution Gate. The feasibility audit weighs legal and standards sources, and the `Chip` change touches a primitive used across the site, so a wrong move is costly.

## Non-Goals

- **AI-edited state** (a second label wording for AI-modified images, IPTC composite value). Declined: not selected when filed 2026-10-31. Reopen through a new issue.
- **Preserving generator C2PA credentials** (detect an existing manifest and serve the original instead of re-encoding). Declined: not selected when filed 2026-10-31; `stamp.py` still re-encodes and drops any credential the source carried. Stays an open gap, named on the ethics page.
- **Blocking publish of a flagged image with no stamped copies.** Declined: not selected when filed; the Studio warning stays a warning.
- No implementation of C2PA signing or an invisible watermark; Phase 1 records a decision only. If it returns go, this doc is amended and Non-Goals re-read before any code.
- No claim that Sugartown is Article 50 compliant. The ethics page cites the duties and says which apply to a publisher.
- No retroactive re-labelling of existing content without the Content Write Gate.
- No change to alt-text or caption rules.

## Related

- **GitHub:** [#181](https://github.com/bex-sugartown/sugartown/issues/181)
- **Audited epics:** SUG-178 ([#57](https://github.com/bex-sugartown/sugartown/issues/57)), ST-178 ([#178](https://github.com/bex-sugartown/sugartown/issues/178)), ST-179 ([#179](https://github.com/bex-sugartown/sugartown/issues/179)); docs in `docs/shipped/`
- **Related:** SUG-251 ([#82](https://github.com/bex-sugartown/sugartown/issues/82)), SEO meta prerendering
- **Sources read 2026-10-31:** [Commission FAQ on signing the transparency code](https://digital-strategy.ec.europa.eu/en/faqs/signing-code-practice-transparency-ai-generated-content), [Article 50 practical guide (third party)](https://artificialintelligenceact.eu/transparency-rules-article-50/), [C2PA FAQ](https://c2pa.org/faq/), [IPTC Photo Metadata Standard](https://iptc.org/standards/photo-metadata/iptc-standard/)
- **Ethics brief:** `docs/briefs/ai-ethics-and-operations.md` Principles 3 and 13
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
