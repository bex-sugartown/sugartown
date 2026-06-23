---
**Epic:** SUG-193 — MetadataCard glossary terms row — Phase 2b of SUG-190
**Linear Issue:** [SUG-193](https://linear.app/sugartown/issue/SUG-193/metadatacard-glossary-terms-row-phase-2b-of-sug-190)
**Status:** Shipped — v0.27.11
**Shipped:** 2026-06-23
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — each phase merges independently
**Parent epic:** SUG-190 (taxonomy vocabulary audit — migrated from Phase 2b)
---

# SUG-193 — MetadataCard glossary terms row

Surface glossary terms on content pages (articles, nodes, case studies) via MetadataCard. The tag retirement work in SUG-190 removed taxonomy signal from many docs; surfacing the glossary terms that absorbed those tags closes the gap.

## Background

SUG-190 retired 34 tags and wired them into glossary terms via `relatedTags`. The glossary terms now carry the conceptual meaning that the tags held, but that meaning is invisible on content pages — MetadataCard only shows tags, categories, and tools. This epic makes glossary terms a first-class metadata surface.

**Two-source model:**
- **Inline terms** — `glossaryTermRef` markDefs already embedded in body portable text. Extracted at query time. Zero editorial overhead — if an editor has marked a term inline, it surfaces automatically.
- **Explicit terms** — a new `relatedTerms[]` reference array on `article`, `node`, `caseStudy` schemas, for terms implied by content but not marked inline. Editors populate this in Studio.

MetadataCard merges both sources and deduplicates by `_id` before rendering.

## Scope

- [x] **Phase 0 — Mock:** `docs/drafts/SUG-193-metadatacard-glossary-terms-row.html` (rev 2). Approved 2026-06-23. Decisions: label="Terms", neutral chip, chips link to `/glossary/:slug`, label links to `/glossary` archive. Terms+Tags rendered as a `chipRowPair` (Terms left, Tags right), mirroring the Tools|Category pair. Pair suppressed when both types are empty.
- [x] **Phase 1 — Schema:** `relatedTerms[]` (array of `glossaryTerm` refs) added to `article`, `node`, `caseStudy` schemas. Schema deployed 2026-06-23.
- [x] **Phase 2 — GROQ:** `nodeBySlugQuery`, `articleBySlugQuery`, `caseStudyBySlugQuery` updated with `inlineTerms` (from PT markDefs) and `relatedTerms[]` projections. `GLOSSARY_TERM_FRAGMENT` moved to top of fragments block. Nodes and case studies use `sections[textSection][].content[]` path (not top-level `content`).
- [x] **Phase 3 — Component:** `MetadataCard` gets `inlineTerms` + `relatedTerms` props, merges and dedupes by `_id`. Terms+Tags render as `chipRowPair`. All four chip label names (Tools, Category, Terms, Tags) link to their archive index. New `.chipLabelLink` CSS class.
- [ ] **Phase 4 — Backfill:** Add `relatedTerms[]` to docs that lost tags during SUG-190 retirements and have no inline terms. Deferred — no blocking issue, editors can populate in Studio.

## Implementation notes

- `GLOSSARY_TERM_FRAGMENT` must be declared before first use in queries.js (temporal dead zone gotcha — const exports are hoisted but not initialized)
- Node and caseStudy body content lives in `sections[_type == "textSection"][].content[]`, not a top-level `content` field. GROQ path: `sections[_type == "textSection"][].content[].markDefs[_type == "glossaryTermRef"][].term->`
- Article body lives in top-level `content[]` — `content[].markDefs[_type == "glossaryTermRef"].term->`
- `chipRowPair` auto-fit collapses to 1 column when only one child is present — pair suppression is conditional render of the wrapper, individual column suppression is conditional render within the pair

## Visual QA

Mock-to-implementation verified 2026-06-23 on `/nodes/the-em-dash-that-came-back-from-the-dead`. Terms row shows "Large Language Model" and "Portable Text" extracted from inline `glossaryTermRef` marks. All label links working. Pair layout correct.

<!-- Chromatic: pending -->
