---
**Epic:** SUG-236 — Pages as knowledge-graph nodes: consume page related/relatedTerms + harden person.bio annotations
**Linear Issue:** [SUG-236](https://linear.app/sugartown/issue/sug-236)
**Status:** Backlog
**Priority:** 🟡 Medium
**Labels:** Schema, CMS
**Merge strategy:** (a) Merge-as-you-go
---

# SUG-236 — Pages as knowledge-graph nodes: consume page related/relatedTerms + harden person.bio annotations

> **Backlog doc created 2026-08-15**, backfilled during migration Phase 2. This issue was open
> in Linear with no `docs/backlog/` doc — one of nine found by the first parity audit since
> `validate:epic-docs` was archived by SUG-284. The Background below is the Linear description
> verbatim; it was already substantive, so it is preserved rather than paraphrased.

## Background

Two loose ends from [SUG-210](https://linear.app/sugartown/issue/SUG-210/content-pipeline-rules-consolidation)'s Tier 1 / Tier 2 work. The goal for pages is **knowledge-graph participation and metadata alignment with the standard content types (article/node/caseStudy) — not visual display**.

## 1. Pages become first-class knowledge-graph nodes

[SUG-210](https://linear.app/sugartown/issue/SUG-210/content-pipeline-rules-consolidation) added `related` + `relatedTerms` to the `page` schema (`page.ts:239`/`:253`) to align pages with article/node/caseStudy, and the GROQ projection is already wired (`queries.js` `pageBySlugQuery` projects both — confirmed 2026-07-23). What's missing is that **nothing consumes them**: the page render path (`RootPage.jsx`) reads neither, and pages don't appear to feed the knowledge graph via these edges.

**Intent (per Bex):** standard site content pages should be aligned in metadata with casestudy/article/node so pages are part of the knowledge graph — but the metadata should **not** necessarily be surfaced the way MetadataCard surfaces it on content pages. Some of it is display metadata; some is "true metadata" that exists to power relationships/graph/SEO and is never rendered as a visible card.

**Required deliverable — display-vs-data-only review:** before wiring anything, produce a per-field classification of page metadata: which fields should be *displayed* on the page, and which are *data-only* (feed the knowledge graph, related-content edges, SEO/JSON-LD, internal linking) with no visible surface. Wire each field to the correct destination based on that review — do not default to rendering a MetadataCard on pages.

Scope after review: feed page `related`/`relatedTerms` into the knowledge-graph collector/edges (same treatment as article/node/caseStudy where it's data-only), plus any display the review explicitly approves. Verify against the KG build-time GROQ-to-JSON collector ([SUG-73](https://linear.app/sugartown/issue/SUG-73/dynamic-knowledge-graph-force-directed-viz-on-knowledge-graph-sanity) lineage).

**Cleanup:** the comment at `page.ts:237` ("no GROQ projection or rendering wired") is now half-stale — the projection exists; only render/consume is missing. Correct it.

## 2. [person.bio](<http://person.bio>) orphaned-annotation risk (Tier 2)

`person.bio` uses `standardPortableText`, which permits inline `citationRef`/`glossaryTermRef` marks, but the `person` schema has **no** `citations[]` or `relatedTerms[]` backing array to resolve them against (confirmed 2026-07-23). An editor could insert a citation/term marker in a bio today and it would point at nothing. Decide: either strip those marks from `bio`'s PT config, or add the backing array(s) to `person`. Not urgent (needs an editor to actually do it) but a latent landmine — same class as [SUG-211](https://linear.app/sugartown/issue/SUG-211/glossary-chip-abbreviation-preference)'s orphaned-token finding, at the schema level.

Source: [SUG-210](https://linear.app/sugartown/issue/SUG-210/content-pipeline-rules-consolidation) close-out "Open follow-ons" + Tier 2 gaps. See `docs/shipped/SUG-210-content-pipeline-rules-consolidation.md`.

## Scope

Scope is carried in the Background above, which came over from Linear complete. Before
executing, confirm it still holds — several of these were written between 2026-07-23 and
2026-08-09 and the platform has moved since (SUG-284 removed the governance layer; v0.33.0
shipped 2026-08-15).

## Related

- **Linear:** [SUG-236](https://linear.app/sugartown/issue/sug-236)
- Backfilled by the Phase 2 parity audit — `docs/briefs/linear-to-github-migration-plan.md` §5.1
