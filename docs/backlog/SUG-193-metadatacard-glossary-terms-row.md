---
**Epic:** SUG-193 — MetadataCard glossary terms row — Phase 2b of SUG-190
**Linear Issue:** [SUG-193](https://linear.app/sugartown/issue/SUG-193/metadatacard-glossary-terms-row-phase-2b-of-sug-190)
**Status:** Backlog
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

MetadataCard gets a `terms` prop that merges both sources and deduplicates by `_id`.

## Scope

- [ ] **Phase 0 — Mock:** MetadataCard "Terms" chip row. Must show: label text, chip style (same as tags? different?), link destination (`/knowledge-graph/:slug`), empty-state behaviour (hide row entirely vs placeholder). **No code until mock is approved.**
- [ ] **Phase 1 — Schema:** Add `relatedTerms[]` (array of `glossaryTerm` refs) to `article`, `node`, `caseStudy` schemas. Deploy schema. Layer: `apps/studio/schemas/`
- [ ] **Phase 2 — GROQ:** Update query fragments for articles/nodes/caseStudies to include:
  - `"inlineTerms": array::unique(content[].markDefs[_type == "glossaryTermRef"].term->{_id, term, "slug": slug.current})`
  - `"relatedTerms": relatedTerms[]->{_id, term, "slug": slug.current}`
  - Merge and deduplicate by `_id` in the component or query
- [ ] **Phase 3 — Component:** Add `terms` prop to MetadataCard. Render chip row linking to `/knowledge-graph/:slug`. Layer: `apps/web/src/components/MetadataCard/`
- [ ] **Phase 4 — Backfill:** Add `relatedTerms[]` to the ~20 docs that lost tags during SUG-190 retirements and now sit below minimum taxonomy coverage (advisory list in SUG-190 validate:content output)

## Phase 0 gate

The MetadataCard currently has rows for: tags, categories, tools, people. A "Terms" row is a new chip surface. The mock must define:
- Label text (`Glossary terms`? `Terms`? `Concepts`?)
- Chip style — same neutral chip as tags, or a distinct visual treatment to signal "definition available"?
- Link destination — each chip links to `/knowledge-graph/:slug` (glossary term detail)
- Empty-state — row hidden when `terms` is empty/null (consistent with other MetadataCard rows)

**No JSX or CSS until this is approved.**
