---
**Document:** Taxonomy Vocabulary Audit 2026
**Epic:** SUG-190
**Status:** Phase 1 — awaiting Bex review and sign-off before any Sanity writes
**Data snapshot:** 2026-06-22 (98 tags, 14 categories, 62 glossary terms)
---

# Taxonomy Vocabulary Audit 2026

This document is the Phase 1 deliverable for SUG-190. It contains decision tables for all recommended taxonomy changes, plus the editorial framework for future editors. No Sanity changes are made until Bex reviews and approves/amends the decision column on each row.

**How to use this doc:** Add your decision in the Decision column for each row. Options: Approve / Reject / Amend (with note). Once all decisions are recorded, Phase 2 execution begins.

---

## Glossary-vs-tag decision rule (for future editors)

**A concept belongs in the glossary when:**
- It needs a definition to be understood (the reader might not know what it means)
- It is coined or domain-specific vocabulary (Bextionary entries, EDS terms, AI neologisms)
- It has related terms, examples, or nuance worth linking
- You would use a `glossaryTermRef` inline mark to point a reader to it from body text

**A concept belongs in tags when:**
- It is a thematic bucket for browsing and filtering — no definition needed
- It groups content by activity, domain, or process type
- It is a proper noun, tool name, or industry acronym the audience already knows
- It is too broad or too mundane to define (e.g. "migration", "performance", "SEO")

**When both exist for the same concept:** the glossary term wins. Retire the tag. The glossary term page is the canonical surface — a redundant tag just creates two paths to the same idea with no cross-link. Exception: if the tag is significantly broader than the glossary term (e.g. tag = "AI", glossary = "AI Entropy"), keep the broader tag and wire the glossary term's `relatedTags` field to it.

**Categories vs tags:** categories are broad editorial buckets for primary classification (each piece gets 1–2). Tags are secondary, granular, multi-value. If a tag name exactly matches a category name, the tag is redundant — content already has the concept via its category. The tag should be retired and its content re-checked to confirm the category is present.

---

## Table A — Tags that duplicate category names

These tags duplicate an existing category name exactly. The content already has the concept via its category; the tag adds nothing. Proposed action: retire tag, then audit the tagged documents to confirm the category is set on each one.

| Tag | Tag ID | Tag uses (live) | Category | Category uses | Rationale | Proposed action | Decision |
|-----|--------|-----------------|----------|---------------|-----------|-----------------|----------|
| `Content Architecture` | wp.tag.257 | 8 | `Content Architecture` | 29 | Exact name duplicate. 8 docs are tagged; all likely have or should have the category. | Retire tag; confirm `Content Architecture` category is set on the 8 affected docs | |
| `Documentation` | wp.tag.379 | 12 | `Documentation` | 2 | Exact name duplicate. The tag has more uses than the category, suggesting most of the 12 tagged docs lack the category. | Retire tag; audit the 12 tagged docs — add `Documentation` category where absent | |

---

## Table B — Near-duplicate or overlapping tag pairs

These pairs represent the same or overlapping concepts. The proposed action in each case is either merge (retire the weaker tag, re-tag its content with the stronger one) or keep-with-clarification.

| Tag A | Uses | Tag B | Uses | Relationship | Rationale | Proposed action | Decision |
|-------|------|-------|------|--------------|-----------|-----------------|----------|
| `AI Workflows` (wp.tag.382) | 8 | `LLM workflows` (wp.tag.317) | 3 | Near-synonym — LLM workflows is a subset of AI Workflows | LLM workflow is a specific implementation mode; the broader term covers it without loss | Merge: retire `LLM workflows`, re-tag its 3 docs with `AI Workflows` | |
| `automation` (wp.tag.341) | 2 | `AI Automation` (tag-ai-automation) | 5 | `automation` is broader; `AI Automation` is a specific subcategory | If the 2 `automation` docs are genuinely non-AI automation (e.g. build pipelines, CI), keep both. If both are AI-adjacent, merge. | Audit the 2 `automation` docs: if AI-adjacent → merge into `AI Automation`; if not → keep separate | |
| `source control` (wp.tag.346) | 2 | `version control` (wp.tag.393) | 3 | Near-synonyms for the same concept | "Version control" is the more widely used and precise term | Merge: retire `source control`, re-tag its 2 docs with `version control` | |
| `Workflow` (wp.tag.242) | 4 | `AI Workflows` (wp.tag.382) | 8 | `Workflow` is broader — the 4 docs may be non-AI process content | If the 4 `Workflow` docs are AI-adjacent, the more specific tag applies. If they are genuinely about process (not AI), the generic tag has editorial value. | Audit the 4 `Workflow` docs: AI-adjacent → re-tag with `AI Workflows` and retire `Workflow`; if mixed → keep both | |
| `Agentic Systems` (wp.tag.313) | 3 | `agentic caucus` (wp.tag.436) | 13 | Different concepts: "Agentic Systems" = a conceptual/technical term; "agentic caucus" = a content series name | The series tag is justified. "Agentic Systems" as a concept is now better served by the `Agentic Caucus` glossary term (which exists). | Retire `Agentic Systems` tag; confirm the 3 docs are tagged with `agentic caucus` or another appropriate tag; add `relatedTags` wire on the Agentic Caucus glossary term pointing to the `agentic caucus` tag | |
| `Generative AI` (1814fc30) | 2 | `AI` category | 13 | The AI category covers this concept | "Generative AI" as a tag offers no precision the AI category doesn't already provide | Retire `Generative AI` tag; confirm AI category is set on the 2 affected docs | |
| `product management` (wp.tag.413) | 3 | `Product & Platform Strategy` category | 18 | Near-overlap between tag and category | If the 3 docs cover product management activities meaningfully distinct from the category (e.g. tooling, methodology), the tag has some value. If they are simply strategic content, the category covers it. | Audit the 3 docs: if no meaningful distinction → retire tag; if distinct → keep with note | |

---

## Table C — Tags that should be glossary terms

These tags represent concepts that need a definition, not just a label. All have been cross-checked against the live glossary (2026-06-22). The "Glossary term exists?" column reflects the current state.

| Tag | Uses | Glossary term exists? | Glossary slug | Relationship | Proposed action | Decision |
|-----|------|-----------------------|---------------|--------------|-----------------|----------|
| `Atomic Design` (wp.tag.259) | 9 | Yes — "Atomic design" | `atomic-design` | Exact concept match | Retire tag; add `relatedTags` wire on the Atomic design glossary term pointing to a surviving thematic tag (e.g. `Design Ops`) | |
| `composable` (wp.tag.103) | 7 | Yes — "Composable architecture" | `composable-architecture` | Partial: "composable" is broader than "composable architecture". The tag may cover content beyond architecture. | Decision: is "composable" as a tag meaningfully broader? If yes, keep and add `relatedTags` wire. If the 7 docs all concern architecture, retire and wire. | |
| `knowledge graph` (wp.tag.344) | 7 | Yes — "Knowledge graph" | `knowledge-graph` | Exact concept match | Retire tag; add `relatedTags` wire on the Knowledge graph glossary term | |
| `human-in-the-loop` (wp.tag.385) | 6 | No | — | Coined term, definition-worthy | Create a glossary term for "Human-in-the-loop"; then retire this tag and add `relatedTags` wire (or keep tag as a thematic bucket and add `relatedTags` to the new term pointing to it) | |
| `content-as-code` (wp.tag.428) | 5 | Yes — "Content-as-code" | `content-as-code` | Exact concept match | Retire tag; add `relatedTags` wire on the Content-as-code glossary term | |
| `Context Engineering` (ace3d14c) | 3 | No | — | Recent coinage, definition-worthy | Create a glossary term for "Context Engineering"; then retire this tag and add `relatedTags` wire, or keep tag as thematic bucket and wire | |
| `ontology` (wp.tag.411) | 2 | Yes — "Ontology" | `ontology` | Exact concept match | Retire tag; add `relatedTags` wire on the Ontology glossary term | |
| `MACH` (f283da5e) | 3 | No | — | Architecture acronym needing explanation for non-enterprise audience | Create a glossary term for "MACH" (Microservices, API-first, Cloud-native, Headless); then retire this tag | |
| `BEM` (1abb1141) | 2 | Yes — "Block Element Modifier" | `bem` | Exact concept match | Retire tag; add `relatedTags` wire on the Block Element Modifier glossary term | |
| `structured content` (wp.tag.307) | 7 | Yes — "Structured content" | `structured-content` | Exact concept match | Retire tag; add `relatedTags` wire on the Structured content glossary term | |

### Additional tag/glossary overlaps (not in original scope — flagged for decision)

Live data surfaced additional tags that have a corresponding glossary term. These were not in the pre-populated scope. Decision needed on each.

| Tag | Uses | Glossary term | Relationship | Proposed action | Decision |
|-----|------|---------------|--------------|-----------------|----------|
| `Accessibility` (wp.tag.248) | 4 | "Accessibility" (slug: `accessibility`) | Exact concept match | Retire tag (the category and glossary term together cover it); confirm affected docs have the Accessibility category or another meaningful tag | |
| `WCAG` (wp.tag.247) | 3 | "Web Content Accessibility Guidelines" (slug: `wcag`) | Exact concept match | Retire tag; add `relatedTags` wire on the WCAG glossary term | |
| `VoPM` (a6e892a9) | 1 | "VoPM" (slug: `vopm`) | Exact concept match — tag is superseded by glossary term | Retire tag; the glossary term is the canonical surface | |
| `monorepo` (wp.tag.374) | 3 | "Monorepo" (slug: `monorepo`) | Exact concept match | Decision: is "monorepo" a useful thematic browse bucket (keep as tag, add `relatedTags` wire) or is the glossary term sufficient? | |
| `portable text` (d40bfa72) | 2 | "Portable Text" (slug: `portable-text`) | Exact concept match, capitalisation differs | Retire tag; content about Portable Text is a narrow technical topic best served by the glossary term | |
| `agentic caucus` (wp.tag.436) | 13 | "Agentic Caucus" (slug: `agentic-caucus`) | Series tag with a corresponding definition — both serve different purposes | Keep tag (series/browse use); add `relatedTags` wire on the Agentic Caucus glossary term pointing to this tag | |

---

## Table D — Single-use tags (retirement candidates)

All tags below had exactly 1 content reference in the pre-populated data. Live data has been cross-checked: `blob`, `Requirements`, and `ATS` moved to 2 uses and are NOT included here. The default decision is retire unless the tag serves a voice or humour purpose. Exceptions: `#resist`, `britbox`, `em dash` are kept as personality tags regardless of use count.

| Tag | ID | Live uses | Notes | Proposed action | Decision |
|-----|----|-----------|-------|-----------------|----------|
| `#resist` | wp.tag.455 | 1 | WordPress-era political tag; kept for voice/humour | **Keep** | Approved |
| `AEO/GEO` | 167a173a | 1 | Niche acronym (Answer Engine Optimisation / Generative Engine Optimisation); the AI category covers the concept; no audience need for this specificity | Retire | Approved |
| `Alt Text` | wp.tag.441 | 1 | Specific accessibility technique; `Accessibility` tag (4 uses) covers the topic | Retire; confirm doc has `Accessibility` tag or category | Approved |
| `britbox` | eee7c7da | 1 | Proper noun; kept for voice/humour | **Keep** | Approved |
| `content audit` | wp.tag.243 | 1 | Activity label; `Audit` tag (2 uses) covers the concept and is broader | Retire; confirm doc has `Audit` tag | Approved |
| `data integrity` | wp.tag.339 | 1 | One use; broad enough to not need its own tag | Retire | Approved |
| `devtools` | wp.tag.387 | 1 | One use; `tooling` tag (3 uses) covers the category | Retire; confirm doc has `tooling` tag | Approved |
| `em dash` | 15690652 | 1 | Writing style humour tag; kept for voice | **Keep** | Approved |
| `Glassmorphism` | 889f7fa5 | 1 | One-time design system technique; not a content category | Retire | Approved |
| `performance` | wp.tag.388 | 1 | One use; too broad as a tag; `core web vitals` tag (2 uses) or the category covers it | Retire | Approved |
| `product discovery` | wp.tag.381 | 1 | One use; covered by `product management` tag (3 uses) | Retire; confirm doc has `product management` tag | Approved |
| `product ops` | wp.tag.409 | 2 | Updated: 2 uses in live data (was 1). Not a single-use tag — moved out of default retire. | Audit: is `product ops` meaningfully distinct from `product management` (3 uses)? | |
| `QA` | wp.tag.335 | 1 | One use; specific enough to be reasonable but too niche for a browse bucket | Retire | Approved |
| `separation of concerns` | wp.tag.410 | 1 | A software principle, not a thematic browse bucket | Retire | Approved |
| `Spacing` | 8903596b | 1 | One DS-specific use; design token / design system category covers it | Retire | Approved |
| `VQA` | ec8af7c3 | 1 | Acronym (Visual Quality Assurance), 1 use; too niche for browse | Retire | Approved |

**Note:** `product ops` (wp.tag.409) has 2 uses in live data — the epic pre-populated it as 1 use. It has been moved to its own row with an "audit" decision pending rather than a default retire.

---

## Current counts summary (live 2026-06-22)

| Type | Count | Target post-audit |
|------|-------|-------------------|
| Tags | 98 | Under 70 |
| Categories | 14 | 14 (no changes proposed) |
| Glossary terms | 62 | 62+ (new terms for `human-in-the-loop`, `Context Engineering`, `MACH` if approved) |

---

## Execution notes for Phase 2

Once Bex approves the tables above, Phase 2 will execute in this order:

1. **Table A actions first** — retire duplicate-category tags (no re-tagging needed if the category is already present; just confirm and delete)
2. **Table B merges** — for each merge: re-tag the losing tag's content with the winning tag (patch_documents), verify zero refs on the retired tag, then delete
3. **Table C promotions** — for tags where a glossary term already exists: add `relatedTags` wire first, then retire tag; for tags needing a new glossary term: create the term, wire, then retire tag
4. **Table D retirements** — confirm zero refs (or re-tag to adjacent tag as noted), then delete
5. **Run `pnpm validate:content`** — confirm no dangling taxonomy refs
6. **Verify tag archive page** (`/tags`) and one affected tag detail page renders correctly post-deletion

**Deletion safety rule:** Before deleting any tag document, run `*[references("<tag._id>")]{ _id, _type, title }`. If it returns any results, the content must be re-tagged first. Do not skip this step.

---

## Phase 2 batch approval option

To reduce round-trips, Bex may grant batch approval for an entire table. Example: "Approve all Table D retirements" — this covers all rows in Table D without individual row sign-off. Each row still requires the deletion safety check (zero refs verification) before execution.
