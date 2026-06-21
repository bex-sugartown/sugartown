---
**Epic:** SUG-190 — Taxonomy vocabulary audit — tag deduplication, category/tag overlap, glossary vs tag distinction
**Linear Issue:** [SUG-190](https://linear.app/sugartown/issue/SUG-190/taxonomy-vocabulary-audit-tag-deduplication-categorytag-overlap)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-190 — Taxonomy vocabulary audit — tag deduplication, category/tag overlap, glossary vs tag distinction

The site has 97 tags, 14 categories, and 62 glossary terms with documented overlap, near-duplicates, and misclassified concepts. This epic audits the full vocabulary, produces a human-approved decision table, then executes the approved changes.

## Background

The tag vocabulary grew organically from a WordPress import (IDs prefixed `wp.tag.*`) plus ongoing manual additions, with no deduplication pass since launch. As of 2026-06-21 the live counts are: **97 tags**, **14 categories**, **62 glossary terms**. A live audit of the tag list reveals: ~20 single-use tags with no obvious future use, at least 2 tags whose names duplicate category names exactly, several near-synonym tag pairs, and a set of conceptual terms that belong in the glossary rather than the tag vocabulary. Meanwhile the glossary has grown to 62 terms (SUG-166, SUG-186) without a corresponding pass to retire the tags those terms now supersede. The result is a vocabulary where the same concept can be reached via three different surfaces — and none of them link to each other.

## The glossary-vs-tag decision rule

This is the editorial framework for Phase 1 decisions. Include it in the shipped doc for future editors.

**A concept belongs in the glossary when:**
- It needs a definition to be understood (the reader might not know what it means)
- It's coined or domain-specific vocabulary (Bextionary entries, EDS terms, AI neologisms)
- It has related terms, examples, or nuance worth linking
- You'd use a `glossaryTermRef` inline mark to point a reader to it from body text

**A concept belongs in tags when:**
- It's a thematic bucket for browsing and filtering — no definition needed
- It groups content by activity, domain, or process type
- It's a proper noun, tool name, or industry acronym the audience already knows
- It's too broad or too mundane to define (e.g. "migration", "performance", "SEO")

**When both exist for the same concept:** the glossary term wins. Retire the tag. The glossary term page is the canonical surface — a redundant tag just creates two paths to the same idea with no cross-link. Exception: if the tag is significantly broader than the glossary term (e.g. tag = "AI", glossary = "AI Entropy"), keep the broader tag and wire the glossary term's `relatedTags` field to it.

**Categories vs tags:** categories are broad editorial buckets for primary classification (each piece gets 1–2). Tags are secondary, granular, multi-value. If a tag name exactly matches a category name, the tag is redundant — content already has the concept via its category. The tag should be retired and its content re-checked to confirm the category is present.

## Scope

- [ ] **Phase 1 — Audit and recommendation doc:** Produce `docs/briefs/taxonomy-vocabulary-audit-2026.md` containing: the four decision tables below, a rationale for each proposed action, and a section explaining the glossary-vs-tag rule for future editors. No Sanity writes yet. Layer: documentation
- [ ] **Phase 2 — Execute approved changes:** Apply the Bex-approved decisions from Phase 1: retire/delete tags, merge near-duplicates (re-tag content), promote tags to glossary terms where applicable, add `relatedTags` wiring on glossary terms that absorb a retired tag, update categories where needed. Layer: content (Sanity MCP `patch_documents`, Sanity Studio deletes)
- [ ] **Phase 3 — Publish and verify:** Confirm all affected content is published (not left as draft), all deleted tags have zero `usedBy` references before deletion, and the `validate:content` script passes. Layer: tooling/verification

## Phase 1 — Pre-populated audit findings

The following tables are populated from a live Sanity query run 2026-06-21. They are the starting point for Phase 1, not the final decisions — Bex reviews and amends before Phase 2 begins.

### Table A — Tags that duplicate category names (retire tag, confirm category is set)

| Tag | Tag uses | Category | Category uses | Proposed action |
|-----|----------|----------|---------------|-----------------|
| `Content Architecture` | 8 | `Content Architecture` | 29 | Retire tag; confirm `Content Architecture` category is set on the 8 affected docs |
| `Documentation` | 11 | `Documentation` | 2 | Retire tag; audit the 11 tagged docs — most likely need `Documentation` category added |

### Table B — Near-duplicate or overlapping tag pairs (merge or clarify)

| Tag A | Uses | Tag B | Uses | Relationship | Proposed action |
|-------|------|-------|------|--------------|-----------------|
| `AI Workflows` | 7 | `LLM workflows` | 3 | Near-synonym — LLM workflows is a subset | Merge `LLM workflows` → `AI Workflows`; re-tag the 3 docs |
| `automation` | 2 | `AI Automation` | 5 | `automation` is broader; `AI Automation` is specific | Keep both if the 2 `automation` docs are genuinely non-AI; otherwise merge into `AI Automation` |
| `source control` | 2 | `version control` | 3 | Near-synonyms | Merge `source control` → `version control` |
| `Workflow` | 4 | `AI Workflows` | 7 | `Workflow` is broader — 4 docs may be non-AI | Audit the 4 `Workflow` docs: if AI-adjacent, merge; if genuinely process-only, keep separate |
| `Agentic Systems` | 3 | `agentic caucus` | 13 | Different: Agentic Systems = concept; agentic caucus = series name | Keep both but clarify: rename `Agentic Systems` → `Agentic AI` or retire if a glossary term covers it |
| `Generative AI` | 2 | `AI` (category) | 13 | Category covers the concept | Retire `Generative AI` tag; confirm AI category is set on the 2 docs |
| `product management` | 3 | `Product & Platform Strategy` (category) | 18 | Near-overlap | Audit the 3 docs: is `product management` meaningfully distinct from the category? If not, retire |

### Table C — Tags that should be glossary terms (promote or cross-link)

These are concepts that need definition, not just a label. Assess whether a glossary term already exists before promoting.

| Tag | Uses | Glossary term exists? | Proposed action |
|-----|------|-----------------------|-----------------|
| `Atomic Design` | 9 | Check | If glossary term exists: retire tag, add `relatedTags` on the term. If not: create glossary entry, then retire tag |
| `composable` | 7 | Check (`composable architecture`?) | Same as above |
| `knowledge graph` | 7 | Check | Likely exists given the KG section — retire tag, wire `relatedTags` |
| `human-in-the-loop` | 6 | Check | Coined term with a definition — glossary candidate |
| `content-as-code` | 5 | Check | Coined concept — glossary candidate |
| `Context Engineering` | 3 | Check | Recent coinage — glossary candidate |
| `ontology` | 2 | Check | Definition-worthy concept |
| `MACH` | 2 | Check | Acronym needing explanation for non-enterprise audience |
| `BEM` | 2 | Check | Methodology acronym |
| `structured content` | 7 | Check | Core EDS term — likely already in glossary |

### Table D — Single-use tags (retirement candidates unless editorially justified)

All of these have exactly 1 content reference. Each needs a brief editorial call: retire and let the content rely on its other tags/categories, or justify keeping it.

| Tag | ID origin | Notes |
|-----|-----------|-------|
| `#resist` | wp.tag.455 | WordPress-era political tag; almost certainly stale |
| `AEO/GEO` | new | Niche acronym; the AI category covers it |
| `Alt Text` | new | Accessibility-specific; retire or merge into `Accessibility` |
| `ATS` | new | Acronym (Applicant Tracking System); very niche |
| `blob` | new | Unclear editorial meaning |
| `britbox` | new | Proper noun / project-specific; consider as `tool` reference instead |
| `content audit` | wp.tag.243 | Activity label with one use; `Audit` tag (2 uses) overlaps |
| `data integrity` | wp.tag.339 | One use; broad enough to not need its own tag |
| `devtools` | wp.tag.387 | One use; `tooling` tag (3 uses) is broader |
| `em dash` | new | Hyper-specific writing style note |
| `Glassmorphism` | new | One-time DS technique tag |
| `performance` | wp.tag.388 | One use; too broad as a tag — the category covers it |
| `product discovery` | wp.tag.381 | One use; covered by `product management` tag |
| `product ops` | wp.tag.409 | One use; covered by `product management` or category |
| `QA` | wp.tag.335 | One use |
| `Requirements` | new | One use |
| `separation of concerns` | wp.tag.410 | One use; a principle, not a tag |
| `Spacing` | new | One DS-specific use |
| `VoPM` | new | Acronym, 1 use |
| `VQA` | new | Acronym, 1 use |

**Single-use tag default decision:** retire unless Bex explicitly flags one for retention. Content that loses a single-use tag is not degraded — its other taxonomy provides sufficient signal.

## Acceptance criteria

- [ ] Phase 1 audit doc (`docs/briefs/taxonomy-vocabulary-audit-2026.md`) is complete with all four tables filled and a decision column on each row
- [ ] Bex has reviewed and approved/amended the Phase 1 doc before any Sanity writes begin (Content Write Gate)
- [ ] All tags in Table A with approved "retire" decision have zero `usedBy` count before deletion (verified by GROQ query)
- [ ] All near-duplicate merges in Table B are complete: content is re-tagged, the retired tag has zero uses, and is deleted from Sanity
- [ ] All Table C tags approved for promotion either have a corresponding glossary term created/confirmed and a `relatedTags` wire added, or a documented "keep as tag" rationale
- [ ] All Table D single-use tags approved for retirement are deleted
- [ ] `validate:content` passes (no orphaned taxonomy refs) after all deletes
- [ ] Tag count is materially reduced — target under 70 (from 97), documented in shipped doc
- [ ] The glossary-vs-tag decision rule is written into the shipped doc for future editorial reference

## Human QA Walkthrough

Not applicable — no CSS, layout token, or multi-page component changes. All changes are Sanity content patches and document deletions.

Note: verify the tag archive page (`/tags`) and affected tag detail pages (`/tags/:slug`) render correctly after deletions — deleted tag documents should produce 404s, not blank pages. Check one example tag detail page before and after.

## Technical notes

**Content Write Gate (hard stop):** Every `patch_documents` call that modifies `tags[]` or `categories[]` on content documents requires a proposal table before execution. Re-tagging 8 documents is 8 separate approvals unless Bex grants a batch approval for a specific merge action.

**Deletion sequence (critical):** Sanity will reject deletion of a document that is still referenced by other documents. Before deleting any tag document: (1) run `*[references("<tag._id>")]{ _id, _type, title }` to confirm zero references, (2) only then delete via Studio or MCP. Do NOT delete a tag and expect references to auto-clean — they become dangling refs and break `validate:content`.

**Re-tagging mechanics for merges:** To merge Tag A into Tag B on content docs, for each document referencing Tag A: `patch_documents` to remove Tag A from `tags[]` and add Tag B (if not already present). Then verify zero refs on Tag A before deleting it.

**Glossary `relatedTags` wiring:** When a tag is retired because a glossary term supersedes it, add the nearest surviving broader tag to the glossary term's `relatedTags[]` field — this ensures the knowledge graph still surfaces the connection. Example: retire `knowledge graph` tag → add `knowledge graph` to the KG glossary term's `relatedTags`.

**`validate:content` must pass before close-out:** Run `pnpm validate:content` from `apps/web/` after all deletions. Dangling taxonomy refs are a silent failure mode — the archive page just shows fewer results with no error.

**Activation audits:**
- Run `*[_type == "glossaryTerm"]{ _id, term, "slug": slug.current }` at activation to get the full current term list for Table C cross-checks.
- Run `*[_type == "tag"]{ _id, name, "usedBy": count(*[references(^._id)]) } | order(usedBy desc)` to get a fresh usage count (may have changed between epic creation and execution).

**Model & Mode:** `/model sonnet` — pure content/Sanity MCP epic, Phase 1 is documentation writing.

## Model & Mode [REQUIRED]

`/model sonnet` — Phase 1 is a documentation/analysis task; Phase 2 is Sanity content patches. No code changes.

## Non-Goals

- No changes to the tag or category schema — this is vocabulary cleanup, not schema work
- No new glossary terms created unless a Table C promotion decision explicitly requires one (and passes the taxonomy pre-flight check)
- No changes to the frontend tag rendering, archive pages, or detail page layout
- No audit of the `tool`, `project`, or `person` taxonomy types — this epic covers only tag, category, and glossaryTerm
- `people` taxonomy is handled separately in SUG-189

## Related

- **Linear:** [SUG-190](https://linear.app/sugartown/issue/SUG-190/taxonomy-vocabulary-audit-tag-deduplication-categorytag-overlap)
- **SUG-189:** Content taxonomy audit — glossary term-linking and taxonomy coverage (complements this epic; runs independently but coordinate on glossary term list)
- **SUG-166:** Glossary completion — gap-fill + EDS vocabulary import (established the 62-term glossary)
- **SUG-186:** glossaryTerm schema split — `relatedTags` and `relatedTools` fields (the wiring this epic will use for cross-links)
- **Taxonomy pre-flight rule:** CLAUDE.md §Taxonomy pre-flight (blocking)
- **Content Write Gate:** CLAUDE.md §Content Write Gate
- **Epic template:** `docs/epic-template.md`
