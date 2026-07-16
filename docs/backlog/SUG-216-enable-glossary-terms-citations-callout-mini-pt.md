---
**Epic:** SUG-216 — Enable glossary terms and citations in calloutSection's mini-PT
**Linear Issue:** [SUG-216](https://linear.app/sugartown/issue/SUG-216/enable-glossary-terms-and-citations-in-calloutsections-mini-pt)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
---

# SUG-216 — Enable glossary terms and citations in calloutSection's mini-PT

`calloutSection.body` already lets Studio editors add `glossaryTermRef` marks, but the query layer never resolves them, so the tags silently render as plain text. `summaryPortableText` (the config `calloutSection.body` uses) doesn't support `citationRef` at all yet. Close both gaps — the glossary-term one now, the citation one once SUG-215 settles whether `citationRef` is safe in nested section fields at all.

## Background

`calloutSection.body` is typed `array, of: summaryPortableText` in `apps/studio/schemas/sections/calloutSection.ts`. `summaryPortableText` (`apps/studio/schemas/objects/portableTextConfig.ts`) includes `link` and `glossaryTermRef` as available annotations — so Studio happily lets an editor add a glossary-term tag to callout body text. But `apps/web/src/lib/queries.js` projects every `calloutSection` occurrence (4 places: the article, node, page, and caseStudy queries) as a bare `{variant, number, title, body}` — no Portable Text projection at all, unlike `textSection.content` and `accordionSection.items[].content`, which both use `${PT_CONTENT_PROJECTION}` and correctly resolve `glossaryTermRef.term` to a full object with `slug`/`definitionPreview`. Without that resolution, `GlossaryTermAnnotation.jsx`'s `if (!termRef?.slug) return <>{children}</>` guard fires and the tag silently degrades to plain text — no crash, no console warning, just a dead tag.

`summaryPortableText` also has no `citationRef` annotation in its `marks.annotations` list at all, so calloutSection body copy can't carry a footnote even in principle right now.

This surfaced directly during a glossary-tagging pass on the case study "Sugartown: The Platform Is the Portfolio" (2026-07-16): 4 approved tags in the Challenge callout (Headless CMS, Structured content, Design tokens, Agentic Caucus) are correctly stored in Sanity but don't render as links on the live page. Reference surfaces: `apps/web/src/lib/queries.js` (4 `calloutSection` projections), `apps/studio/schemas/objects/portableTextConfig.ts` (`summaryPortableText`), `apps/web/src/components/GlossaryTermAnnotation.jsx`, `apps/web/src/components/PageSections.jsx` (`portableTextComponents.marks` — confirms the render-side handler is already correct and shared; this is purely a query-projection and schema gap, not a component bug).

## Objective

After this epic, `glossaryTermRef` marks placed in any `calloutSection.body` (on any document type: article, node, page, caseStudy) resolve and render as working glossary links, matching the behavior already proven for `textSection.content` and `accordionSection.items[].content`. If SUG-215 concludes `citationRef` is fixable for nested section fields, `calloutSection.body` also gains footnote support via `citationRef`, verified not to lock Studio editing for this field specifically. If SUG-215 concludes `citationRef` should be formally deprecated for nested fields instead, this epic's citation half is dropped and only the glossary-term fix ships.

Layers touched: GROQ query (`queries.js`, 4 edits), and conditionally schema (`portableTextConfig.ts`, `summaryPortableText`'s annotation list) — no frontend component changes anticipated, since the render-side `glossaryTermRef`/`citationRef` handlers already exist and are shared across section types.

## Scope

- [ ] **Fix the glossaryTermRef query gap** — layer: query. Add the Portable Text projection (`${PT_CONTENT_PROJECTION}` or a scoped equivalent covering just `markDefs[_type == "glossaryTermRef"].term->`) to all 4 `calloutSection` projections in `queries.js` (article, node, page, caseStudy queries), matching the pattern already used for `citedBlock.body` in the same file.
- [ ] **Verify against the live gap** — layer: content/verification. Re-render "Sugartown: The Platform Is the Portfolio" (or any document with a tagged callout) after the query fix and confirm the 4 previously-inert tags (Headless CMS, Structured content, Design tokens, Agentic Caucus) now render as working `/glossary/:slug` links.
- [ ] **Decide on citationRef for calloutSection** — layer: schema decision, gated on SUG-215. Once SUG-215's Phase 1 diagnosis lands, decide whether adding `citationRef` to `summaryPortableText` is safe. Document the decision here or in SUG-215's doc, whichever epic is still open at the time.
- [ ] **Add citationRef to summaryPortableText, if approved by the prior bullet** — layer: schema. Mirror the `citationRef` annotation shape already used in `standardPortableText`/`compactPortableText`. Deploy schema (`npx sanity schema deploy`) and verify a citation added to a real `calloutSection.body` in Studio doesn't lock the field's toolbar.
- [ ] **Retrofit check** — layer: content (read-only). Query all published `caseStudy`/`article`/`node`/`page` documents for any existing `calloutSection.body` with a `glossaryTermRef` markDef, to see whether other documents besides this case study already have inert tags waiting to light up once the query fix ships.

## Phases

**Phase 1 — Glossary-term query fix.** Independent of SUG-215; ready to execute now. Ships the 4-line query change and verifies against the live inert tags found this session.

**Phase 2 — Citation support (conditional).** Only proceeds once SUG-215's Phase 1 diagnosis is complete. If SUG-215 finds `citationRef` fixable, implement here for `calloutSection.body` specifically. If SUG-215 finds it should be deprecated for nested fields, close this phase as "won't do" with a note pointing to SUG-215's resolution doc.

## Acceptance criteria

- [ ] All 4 `calloutSection` GROQ projections in `queries.js` resolve `glossaryTermRef` marks to a full term object (verified by inspecting query output directly, not just by trusting the diff)
- [ ] The 4 previously-inert tags on "Sugartown: The Platform Is the Portfolio" render as working links after the fix, confirmed via rendered-page check (an `<a href="/glossary/...">` present for each), not just by re-reading the Sanity document
- [ ] The retrofit check has run and any other affected documents are listed (even if "none found")
- [ ] Phase 2's outcome (shipped or explicitly deferred/won't-do) is recorded, referencing SUG-215's decision

## Human QA Walkthrough — example local pages

Not applicable — no CSS, layout token, or component changes. This is a query-projection fix (and conditionally a schema addition); verification is via rendered glossary-link presence on affected pages, not visual/layout QA.

## Technical notes

- **Content Write Gate**: does not fire — this is a query/schema fix, not a content write. The retrofit-check bullet is read-only.
- **Schema changes**: only if Phase 2 proceeds. If it does, `npx sanity schema deploy` is required before MCP writes using the new `citationRef` option in `summaryPortableText` will validate.
- **Upstream dependency**: Phase 2 is blocked on [SUG-215](https://linear.app/sugartown/issue/SUG-215/fix-citationref-footnote-lock-in-section-content)'s Phase 1 diagnosis. Do not start Phase 2 before SUG-215 has a documented decision — adding `citationRef` to a nested `sections[].body` field before that question is answered risks reproducing the exact Studio-lock bug SUG-215 exists to fix, in a second field.
- **Activation audits**:
  1. Read all 4 `calloutSection` projection blocks in `queries.js` (currently at approximately lines 409, 611, 794, 1024 — confirm current line numbers at activation, the file changes) and confirm they're still identically bare before patching all 4 the same way.
  2. Re-read `citedBlock`'s projection in the same file as the reference pattern for how a `body` field gets `${PT_CONTENT_PROJECTION}` applied.
  3. If Phase 2 proceeds: re-read SUG-215's final decision doc/PR before touching `portableTextConfig.ts`.
- **Model & Mode [REQUIRED]:** `/model sonnet` — Phase 1 is a small, well-precedented query edit. Phase 2 (if it proceeds) is a schema addition following an established pattern elsewhere in the same file. Neither requires architecture-level planning.

## Model & Mode [REQUIRED]

`/model sonnet` — see Technical notes above.

## Non-Goals

- Not touching `citedBlock`, `textSection`, or `accordionSection` — their query projections and annotation support are already confirmed correct.
- Not building a general-purpose "audit every section type for missing PT projections" sweep — scoped specifically to `calloutSection`, since that's the one confirmed gap. A broader audit is a separate, larger epic if warranted later.
- Not proceeding with Phase 2 (citationRef) ahead of or independent of SUG-215's decision, even if Phase 1 ships quickly and the team is eager to keep going.

## Related

- **Linear:** [SUG-216](https://linear.app/sugartown/issue/SUG-216/enable-glossary-terms-and-citations-in-calloutsections-mini-pt)
- **Blocking dependency:** [SUG-215](https://linear.app/sugartown/issue/SUG-215/fix-citationref-footnote-lock-in-section-content) — `docs/backlog/SUG-215-fix-citationref-footnote-lock-in-section-content.md`
- **Prior incident:** `/red-pen` glossary-tagging pass on "Sugartown: The Platform Is the Portfolio" (2026-07-16) — `docs/reviews/red-pen/2026-07-16-sugartown-platform-is-the-portfolio.md`, Gate 2 log item #10, where the 4 inert Challenge-callout tags were found
- **Epic template:** `docs/epic-template.md`
