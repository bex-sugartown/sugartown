---
**Epic:** SUG-235 — Schema consistency: normalize related-content field names + decide glossaryTerm sources[] shape
**Linear Issue:** [SUG-235](https://linear.app/sugartown/issue/sug-235)
**Status:** Backlog
**Priority:** 🟡 Medium
**Labels:** Schema, CMS
**Merge strategy:** (a) Merge-as-you-go
---

# SUG-235 — Schema consistency: normalize related-content field names + decide glossaryTerm sources[] shape

> **Backlog doc created 2026-08-15**, backfilled during migration Phase 2. This issue was open
> in Linear with no `docs/backlog/` doc — one of nine found by the first parity audit since
> `validate:epic-docs` was archived by SUG-284. The Background below is the Linear description
> verbatim; it was already substantive, so it is preserved rather than paraphrased.

## Background

Two cross-schema consistency decisions deferred at [SUG-210](https://linear.app/sugartown/issue/SUG-210/content-pipeline-rules-consolidation) close-out (Tier 3 + Tier 2). Grouped because both are field-shape/naming decisions that touch multiple document schemas and their consuming GROQ + components. Neither is a bug; both are "decide deliberately instead of leaving an accident of two features built at different times."

## 1. Normalize the "related content" field name (Tier 3)

Three field names do the same job with three different allowed-type sets:

* `related` — article `:168`, node `:351`, page `:239`, caseStudy `:398` (→ node|article|caseStudy)
* `relatedContent` — glossaryTerm `:116` (→ 7 types incl. page/person/project/tool)
* `parts` — series `:44` (→ article|node|caseStudy|page)

Decision needed: converge on one name + allowed-type policy, or document that the three are deliberately distinct (series `parts` is arguably a genuinely different "ordered members" concept, not "see also"). If converging, this is a breaking rename on live populated fields → migration script + every consuming GROQ projection + component. Verify current state before scoping — field line numbers above are from a 2026-07-23 read.

## 2. glossaryTerm.sources[] vs shared citationItem (Tier 2)

`glossaryTerm.sources[]` (`:132`) uses its own `{text, url}` shape; article/node/caseStudy/page all use the shared `citationItem` type (`text`, `url`, `label`). Decision: migrate to `citationItem` for consistency (breaking — existing `sources[]` data needs migration), or keep it deliberately lighter-weight because a glossary definition's sourcing is a different job than a narrative citation. Confirmed still `{text, url}` as of 2026-07-23.

## Notes

* Not to be confused with [SUG-186](https://linear.app/sugartown/issue/SUG-186/related-field-refactor-glossaryterm-split-taxonomy-wide-bidirectional) (Done), which deliberately split `relatedTerms`/`relatedTags`/`relatedTools` on glossaryTerm by relation type — that naming is by-design, out of scope here.
* Source: [SUG-210](https://linear.app/sugartown/issue/SUG-210/content-pipeline-rules-consolidation) close-out "Open follow-ons" + Non-Goals. See `docs/shipped/SUG-210-content-pipeline-rules-consolidation.md`.

## Scope

Scope is carried in the Background above, which came over from Linear complete. Before
executing, confirm it still holds — several of these were written between 2026-07-23 and
2026-08-09 and the platform has moved since (SUG-284 removed the governance layer; v0.33.0
shipped 2026-08-15).

## Related

- **Linear:** [SUG-235](https://linear.app/sugartown/issue/sug-235)
- Backfilled by the Phase 2 parity audit — `docs/briefs/linear-to-github-migration-plan.md` §5.1
