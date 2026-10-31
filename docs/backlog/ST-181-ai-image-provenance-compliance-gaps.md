---
**Epic:** ST-181 — AI image provenance: close the compliance gaps
**Issue:** [#181](https://github.com/bex-sugartown/sugartown/issues/181)
**Status:** In Progress
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
- [x] **Signing feasibility audit (done 2026-10-31, see Phase 1 audit result) — layer: tooling.** Read primary sources (C2PA specification, Official Journal text of the AI Omnibus, TrustMark documentation, a C2PA trust-list or certificate route) and record per item: what a publisher must hold or run, cost, whether Sugartown is a provider or deployer for each duty. Output is a go or no-go in this doc, not an implementation.
- [x] **Share-image stamping (done 2026-10-31) — layer: tooling.** `stamp.py` renders a 1200 x 630 cover-crop rendition with the baked mark and IPTC tags, recorded in `provenanceFiles` with a width of 1200 and a marker distinguishing it from the page renditions.
- [x] **Share-image schema (done 2026-10-31, deployed) — layer: schema.** Spread `aiImageFields` into the SEO `openGraph.image` field (and `defaultOgImage` if the audit shows it is used), deploy the schema.
- [x] **Share-image query and render (done 2026-10-31) — layer: query / frontend.** Project `aiGenerated`, `aiTool` and `provenance` for `seo.openGraph.image`; `SeoHead` uses the stamped 1200 x 630 copy when flagged and the current URL otherwise.
- [x] **IPTC 2025.1 AI fields (done 2026-10-31) — layer: tooling / schema.** Write `AISystemVersionUsed` when a version is recorded (new optional field `aiToolVersion` on the shared set). Prompt fields (`AIPromptInformation`, `AIPromptWriterName`) only with an explicit per-image opt-in, since prompts can hold private text; **Decision: prompt fields are not written** (no per-image opt-in built; prompts can hold private text). Property names `AISystemUsed` and `AISystemVersionUsed` in the `Iptc4xmpExt` namespace confirmed against the IPTC 2025.1 specification on 2026-10-31.
- [ ] **Lightbox label placement — layer: design / content / docs (added 2026-10-31 after Bex's screenshot).** On diagrams with a bottom-left legend the label covers the legend. Second vspec: `docs/drafts/ST-181-lightbox-ai-label.vspec.html` (lightbox only; Bex's proposal A, a reserved label zone of 26% x 13% bottom-left with legends right-aligned, drawn beside options B per-image corner, C lower-right everywhere, D outside the image, E keep as is). Zone size measured from the real label (25.0% x 12.3% at 620 px wide). Awaiting sign-off on which option; A needs an authoring rule in the diagram conventions (rule-defining file: exact diff approved first) and a content edit per existing diagram with a bottom-left legend (Content Write Gate); B adds a schema field.
- [x] **AI tool list and autodetect (added 2026-10-31 at Bex's request, done) — layer: schema / tooling.** The Studio dropdown lists the tools Bex uses: ChatGPT, Claude, Claude Code, Gemini, Adobe Firefly, Photoshop Generative Fill, Canva AI, Microsoft Copilot, Stable Diffusion, Other (Midjourney and DALL-E dropped from Studio, still displayed if found in old data; zero images are flagged today). The list lives once in `label-spec.json`; a test fails if `AiLabel.tsx` or the Studio list disagree. `stamp.py --detect FILE` reads the source file's own IPTC tag and known generator markers and suggests the tool; it is prefill only, flags Content Credentials that stamping would drop, and cannot detect Claude or Claude Code. The marker strings are best-effort guesses, not checked against real exports.
- [x] **`AiLabel` on `Chip` (done 2026-10-31) — layer: frontend / Design System.** Approved 2026-10-31: add `tone="inverse"` and `size="fluid"` to `Chip`, rebuild `AiLabel` as a positioned wrapper that renders `Chip` (keeping the width tiers and tool-name expand), repoint `label-spec.json` and `test_stamp.py` at the Chip tokens, zero change to every existing Chip story.
- [x] **Storybook (done 2026-10-31) — layer: Storybook.** Every Chromatic snapshot counts against the test allotment, so a variant gets one story that shows all its use cases, not one story per variant (Bex, 2026-10-31). Chip: one new story showing `tone="inverse"` and `size="fluid"` across the widths in one frame. `AiLabel`: its 17 stories (`grep -c "export const"`, 2026-10-31) are consolidated into a small set of multi-case stories (widths, tool and no-tool, on a card, in a gallery), and the Phase 3 PR records the before and after story counts. **Result:** `AiLabel` 17 to 4 stories; `Chip` 7 to 8 (one new, `FluidInverse`), counted with `grep -c "export const"`.
- [x] **Ethics page and brief (done 2026-10-31: draft written, brief committed, awaiting Bex to publish) — layer: content / docs.** Correct Principle 13's Article 50 sentence, add a changelog entry that carries the rewritten "not done" line, update "Last updated", and sync `docs/briefs/ai-ethics-and-operations.md`. Each statement carries a source and a measurement date. Sanity write under the Content Write Gate; the draft is left for Bex to publish.
- [ ] **Live verification — layer: content.** Flag one real image, stamp it, publish, then download both the page image and the `og:image` file and run `stamp.py --verify` on each; record the result.

## Phases

- [x] **Phase 0 (design, approved 2026-10-31 by Bex):** Chip-variant rebuild approved as shown in the vspec section 6: new `Chip` props `tone="inverse"` and `size="fluid"`, classes `.toneInverse` and `.sizeFluid`, tokens `--st-chip-inverse-bg` and `--st-chip-inverse-fg`, letter-spacing moves to Chip's 0.06em for both the label and the baked mark. The ethics page wording is not part of this sign-off: it is proposed in Phase 4 under the Content Write Gate once Phase 1 has run.
- [x] **Phase 1 (done 2026-10-31):** signing feasibility audit (go or no-go). Its outcome fixes the ethics page wording in Phase 5.
- [ ] **Phase 2:** share images (stamping, schema, query, render) and the IPTC 2025.1 fields.
- [x] **Phase 3 (done 2026-10-31):** `AiLabel` on `Chip` and Storybook (approved in Phase 0).
- [x] **Phase 4 (done 2026-10-31):** ethics page and brief.
- [ ] **Phase 5a (added 2026-10-31):** lightbox label placement: sign-off on the second vspec, then the chosen option.
- [ ] **Phase 5:** live verification.

## Phase 1 audit result: signing and soft binding (2026-10-31)

**Decision: no-go on C2PA signing and on a soft binding. Revisit through a new issue only if Sugartown becomes an image generator or wants to sign editorial edits.** Sources are search results and fetched pages read 2026-10-31; limits are stated per row.

| Question | Finding | Source and limit |
|---|---|---|
| Who owes Article 50(2) machine-readable marking? | Providers of generative AI systems, not the site that publishes the output. Deployers owe 50(4) disclosure for deepfakes and public-interest text, reduced for evidently artistic or creative work. A site that publishes illustrations is at most a deployer. | [Article 50 guide](https://artificialintelligenceact.eu/transparency-rules-article-50/), third-party, dated 2026-05-14. It does not address a website publisher using a third-party generator directly. |
| When does it apply? | 50(2), (4) and (5) from 2026-08-02. Outputs made available before that need no retroactive marking. | [Commission FAQ](https://digital-strategy.ec.europa.eu/en/faqs/signing-code-practice-transparency-ai-generated-content), updated 2026-07-29. |
| Is there a 2026-12-02 grace date for marking? | Secondary sources say Regulation (EU) 2026/1744 was published 2026-07-24 and gives systems placed on the market before 2026-08-02 until 2026-12-02 for the 50(2) marking duty. The Commission FAQ called it conditional ("if adopted"). **Not verified against the regulation text: EUR-Lex returned an empty HTTP 202 page for both URLs.** | Law-firm summaries via search. Read the text on EUR-Lex before citing the date on the ethics page; say "reported" until then. |
| What does C2PA signing take? | A product that passes the C2PA conformance program, then a claim signing certificate from a CA on the C2PA trust list. Ordinary enterprise certificates do not work. Fees are set by the CAs and I found no published figure. Managed signing services exist. | [C2PA conformance](https://opensource.contentauthenticity.org/docs/conformance/), [signing certificate](https://opensource.contentauthenticity.org/docs/signing/get-cert). No fee found. |
| What does a soft binding take? | An approved watermark algorithm (TrustMark variant P is on the C2PA list, MIT licence, reliable from about 150 px shortest side) plus a manifest store and lookup service, because the watermark only carries an identifier. With no signed manifest there is nothing to look up. | [TrustMark FAQ](https://opensource.contentauthenticity.org/docs/tm-faq), [C2PA FAQ](https://c2pa.org/faq/). Resize robustness is not documented on the pages read. The TrustMark C2PA page itself returned an empty body. |
| Does anything in the site keep generators' own credentials? | No. `stamp.py` re-encodes with Pillow, which drops any manifest in the source. Declined in Non-Goals; named on the ethics page. | `scripts/ai-provenance/stamp.py`. |

Consequence for the ethics page (Phase 4): say the visible label and IPTC metadata are the publisher's layers, say provider-side marking is the generator's duty, and say signing and a soft binding are not done because they need a conforming signing product, a trusted certificate and a lookup service.

## Acceptance Criteria

- [x] The vspec section compares `AiLabel` and the Chip variant at 96, 160, 240, 320 and 480 px with measured pixel values, and Bex signed it off 2026-10-31. Evidence: browser measurement in the vspec; the same sizes then measured on the real component in Storybook (129.7 x 25.8 at 480 px, 95.4 x 19.4 at 320, 84.1 x 17.3 at 240, 24.7 x 17.3 at 160 and 96, hidden at 80), fill rgb(10, 15, 26), identical in `dark-pink-moon` except the themed border.
- [x] The feasibility audit records a go or no-go per item (C2PA signing, soft binding, preserving generator credentials), each with a cited source and a date. Evidence: Phase 1 audit result. Limit: the Omnibus text itself was not readable, so its date is reported, not confirmed.
- [ ] A flagged image in a draft page produces an `og:image` URL that is a file asset, not an image-CDN URL. Evidence: the rendered `<meta property="og:image">` content. Partly met 2026-10-31: `shareImageUrl` returns the stamped URL for a flagged image with a copy and null for unflagged or copy-less ones (browser check on the dev server); the rendered tag on a real flagged page waits for Phase 5.
- [ ] That file shows `digitalSourceType: true` and the baked mark. Evidence: `stamp.py --verify` output and the file opened.
- [x] An unflagged image's `og:image` URL is byte-identical to today's. Evidence 2026-10-31: the home page tag is unchanged and the code path for unflagged images is the same expression as before. Evidence: before and after capture on one page.
- [ ] If `AiLabel` moves to `Chip` (code done; Chromatic run pending at close-out): every existing Chip story is unchanged in Chromatic (zero changes), the new Chip props add exactly one story, and `AiLabel` has fewer stories than the 17 it has now with the same cases still visible. Story counts before and after are recorded. `pnpm validate:ai-provenance` passes against the new tokens.
- [x] Draft Principle 13 and the changelog match the cited sources, and no statement says marking is a publisher duty. Evidence: the Phase 1 audit table (sources and dates) and the six-row proposal Bex approved 2026-10-31; read back from the draft after the patch. Published by Bex: not done, see Post-ship checks.
- [x] Schema deployed (twice, 2026-10-31). `validate:schema-parity` ran without reporting drift.
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

---

## Close-out review

### Acceptance criteria

Ticked above except: the rendered `og:image` on a real flagged page (needs a flagged, stamped image: Post-ship checks), the Chromatic zero-change check and the Visual QA gate (Bex), and publishing the ethics draft (Bex).

### What didn't work

- The three shipped epics never ran the Component choice gate, so `AiLabel` copied about 60% of `Chip` and needed a rebuild here. Found by Bex asking "could this be a chip variant?", not by any check.
- The first GROQ query for "any flagged image anywhere" returned 94 documents because `defined()` is true for an array of nulls; the same trap ST-178 recorded as a one-off. Listing the documents, then reading the values, showed zero.
- The click-through lightbox showed no AI label. ST-179's gallery decision covered the label on the gallery image and said clicks on the label do not open the lightbox, but never checked the lightbox's own image. Bex found it on 2026-10-31; fixed in `ImageLightbox` (the label's frame wraps the shrink-wrapped image) and checked in the dev server: the label sits inside the image, bottom-left, with the tool name. The lightbox has no Storybook story, so Chromatic does not cover it. Bex then reported diagram images vanishing in the lightbox locally and showing small on production: the diagrams are SVGs with only a viewBox (`880x512`), which have no intrinsic size, so my shrink-wrap collapsed them to 0 wide, and before it they rendered at the browser default (258 x 150). The lightbox now sizes the image from the dimensions in its URL or asset id and fits it to 90% of the width and 80% of the height (SVGs scale up, photos stop at 1600 px). Checked in the dev server: all four images on the case study page, label inside each; at 1440 x 900 the diagram renders 1238 x 720. Stamped file-asset URLs carry no size and keep the old sizing.
- A `sed -i` chain with `&&` stopped on macOS before the python step, so the tests and workflow edit silently did not run; caught because the test count had not changed.
- EUR-Lex returned an empty HTTP 202 page, so the Omnibus date was never read from the regulation; the ethics page leaves it out.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| AI-edited state next to AI-generated | implementation | declined: not selected when filed (Non-Goals) |
| Preserve the generator's C2PA credentials instead of re-encoding | implementation | declined: not selected when filed; named as a known gap on the ethics page |
| Block publishing a flagged image with no stamped copies | implementation | declined: not selected when filed |
| Share-image crop ignores the Sanity hotspot (centre crop) | implementation | declined: revisit if a real share image crops badly |
| `stamp.py --detect` marker strings are guesses, not checked against real exports | implementation | declined: tune on the first real file; prefill only, a person confirms |
| Crawlers that do not run JavaScript never see `og:image` | implementation | #82 (SEO meta prerendering), already filed |
| `homepage.ogImage` in the Studio schema has no reader in the web app | implementation | declined: found by `grep ogImage apps/web/src`; remove when the homepage schema is next touched |
| Run the Component choice gate before any new JSX surface, and record it in the epic doc | workflow-docs | declined: the rule already exists (`.claude/rules/react.md`); the miss was not applying it. See the friction line |
| Nested-array GROQ counts mislead (second case after ST-178) | workflow-docs | declined: two cases; file at a third |

### Friction line

Three epics shipped a new visual component without recording the Component choice audit, and the reuse gap (AiLabel vs Chip) surfaced only when Bex asked.

---

## Post-ship checks

- [ ] The ethics draft is published: person: open "AI Ethics & Operations" in Studio, check Principle 13 and the new 10/31 changelog entry, click Publish.
- [ ] A flagged share image yields a stamped `og:image`: person: ask a Claude session to stamp one image with `--share` and attach it to the home page share image; the session then reads the rendered `<meta property="og:image">`, downloads it and runs `stamp.py --verify`.
- [ ] The lightbox shows the AI label on a flagged image (fixed 2026-10-31, checked in the dev server on the case study page): person: open a flagged image's lightbox on the live site after the next ship.
- [ ] A flagged page image downloads from the live site with the IPTC tag intact (carried over from ST-178): person: same session, on one flagged page image.
- [ ] `stamp.py --detect` is tried on one real Firefly, ChatGPT and Gemini export: person: supply the three files; the session reports what it found and fixes the marker list.
