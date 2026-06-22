---
**Epic:** SUG-189 — Content taxonomy audit — glossary term-linking, full taxonomy coverage, people=Bex across all content
**Linear Issue:** [SUG-189](https://linear.app/sugartown/issue/SUG-189/content-taxonomy-audit-glossary-term-linking-full-taxonomy-coverage)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
---

# SUG-189 — Content taxonomy audit — glossary term-linking, full taxonomy coverage, people=Bex across all content

Audit every article, node, and case study to ensure each piece has at least one entry from each relevant taxonomy type; term-tag first-instance glossary matches inline; and confirm people=Bex is set on all three content types.

## Background

Every article, node, and case study has structured taxonomy fields (`authors`, `projects`, `tools`, `categories`, `tags`) and supports inline `glossaryTermRef` marks in PortableText body content. In practice, many pieces are sparsely tagged — missing people attribution, no category, no tool references, or no inline glossary term links. The glossary term library has grown substantially (SUG-166, SUG-186) and none of that vocabulary has been back-applied to existing content body text. This epic closes that gap systematically, starting with glossary term-tagging (highest editorial value, most mechanical), then sweeping the structured taxonomy fields, and finally confirming Bex is set as `authors` on every piece.

## Objective

After this epic every published article, node, and case study will: (1) have at least one inline `glossaryTermRef` mark on the first occurrence of each matching term in its body text where a match exists; (2) have at least one reference in each relevant structured taxonomy field (`projects`, `tools`, `categories`, `tags`) unless the field is genuinely not applicable to the piece's subject matter; (3) have `authors` populated with the Bex person document. No schema changes. No new taxonomy documents created without the taxonomy pre-flight check. Purely Sanity content writes.

## Scope

- [x] **Phase 1 — Glossary term-tagging:** For each published glossaryTerm, scan article/node/case study body text for the first verbatim or near-verbatim occurrence and add a `glossaryTermRef` mark at that span. Terms without exact matches (e.g. "AI ennui") require editorial judgement — flag for review rather than auto-applying. Publish after each content piece is complete. Layer: content (Sanity MCP `patch_documents`). **Completed 2026-06-22. Coverage: 14/15 articles (93%), 52/53 nodes (98%). Case studies skipped — no external client projects in corpus. wp.node.977 and article b764ea17 have no body text matching any glossary term. 39 of 65 glossary terms (60%) now linked; 26 terms have no verbatim occurrence across any content.**
- [ ] **Phase 2 — Structured taxonomy sweep:** For each article/node/case study, audit `projects`, `tools`, `categories`, `tags` fields. Add at least one reference per field where contextually appropriate; leave empty only when genuinely not relevant (e.g. a purely conceptual node with no specific tool). Flag any pieces where a taxonomy document doesn't exist yet (pre-flight query required before creating). Publish after each content piece. Layer: content
- [ ] **Phase 3 — people=Bex backfill:** Confirm `authors` field on every article, node, and case study contains the Bex person document (`_type == "person"`, slug `bex`). Patch any piece missing the reference. Publish. Layer: content
- [x] **Phase 4 — Audit log (Phase 1 pass):** GROQ coverage verified 2026-06-22. Results in Phase 1 scope annotation above. Full Phase 4 (including Phases 2–3 audit) deferred until Phases 2–3 complete. Layer: tooling/reporting

## Phases

**Phase 1 — Glossary term-tagging** (start here)
Fetch all published glossaryTerms. For each content document, scan `sections[].content` PortableText for first-instance term matches. Apply `glossaryTermRef` marks via `patch_documents`. Inexact matches (conceptual alignment, not verbatim text) are flagged to Bex for review before patching. Publish after each document is updated.

**Phase 2 — Structured taxonomy sweep**
Query each content document for field emptiness: `!defined(tools)`, `!defined(projects)`, `!defined(categories)`, `!defined(tags)`. For each gap, propose a reference (pre-flight: confirm the taxonomy document exists). Apply after Content Write Gate approval per document. Publish.

**Phase 3 — people=Bex backfill**
Query `*[_type in ["article","node","caseStudy"] && !defined(authors)]` and `*[...&& count(authors)==0]`. Patch the Bex person reference onto each. Publish.

**Phase 4 — Coverage audit**
GROQ verification query confirming zero empty `authors` fields across all three content types. Document counts in shipped doc.

## Acceptance criteria

- [ ] Every article/node/case study that contains a glossaryTerm's text verbatim has a `glossaryTermRef` mark on the first occurrence in body content
- [ ] Inexact/conceptual glossary matches are listed in the shipped doc with a decision (applied / deferred / not applicable)
- [ ] Every article/node/case study has at least one entry in `categories` and `tags` (unless the piece is a pure stub or the field is architecturally inapplicable — document any exceptions)
- [ ] Every article/node/case study has `authors` containing the Bex person document
- [ ] `tools` and `projects` fields are populated where the content directly references a specific tool or project; empty fields with justification noted in shipped doc
- [ ] All patches go through the Content Write Gate (proposal table shown and approved before each `patch_documents` call)
- [ ] All patched documents are published (not left as drafts)
- [ ] Phase 4 GROQ audit query returns zero empty `authors` across all three content types
- [ ] No new taxonomy documents created without the taxonomy pre-flight check (`*[_type == "tag"]{ _id, name, slug }` etc.)

## Human QA Walkthrough

Not applicable — no CSS, layout token, or multi-page component changes. All changes are Sanity content patches.

## Technical notes

**Content Write Gate (hard stop):** This is a content-only epic. The Content Write Gate fires on every patch. Before any `patch_documents` call, produce a before/after proposal table (Document | Field path | Current value | Proposed value) and wait for explicit approval. This applies to both inline PT mark additions (Phase 1) and structured field patches (Phases 2–3).

**Glossary term-tagging mechanics:** `glossaryTermRef` marks are applied as `markDefs` entries in PortableText blocks. Each mark requires:
- A `markDefs` entry: `{ _key: "...", _type: "glossaryTermRef", term: { _type: "reference", _ref: "<glossaryTerm._id>" } }`
- A `marks: ["<key>"]` reference on the span that covers the term text
- `markDefs: []` on all other blocks (to keep the Studio toolbar active — see CLAUDE.md §Portable Text blocks written via MCP)

**Verbatim-only rule for Phase 1:** Only apply a `glossaryTermRef` where the exact term text (or a very close inflection) appears in the body. Do not paraphrase or restructure sentences to create a match. Near-matches (synonym, shortened form, conceptual reference) go into a "flagged for review" list in the shipped doc.

**Taxonomy pre-flight (blocking):** Before referencing any taxonomy document in Phase 2, run the pre-flight query for that type to confirm the document exists and get its `_id`. Never create a new taxonomy document mid-audit without explicit approval.

**Activation audits:**
- Run `*[_type in ["article","node","caseStudy"]]{ _id, _type, title, "slug": slug.current, authors, tools, projects, categories, tags }` to get the current taxonomy state across all content before Phase 2 begins — use this as the audit baseline.
- Run `*[_type == "glossaryTerm" && defined(slug.current)]{ _id, term, "slug": slug.current } | order(lower(term) asc)` to get the full glossary term list before Phase 1 begins.
- Bex person document: run `*[_type == "person" && slug.current == "bex"][0]{ _id, name }` to get the `_id` for the authors backfill.

**No AI rewriting:** All content patches must use `patch_documents` (verbatim). Do not use `patch_document_from_markdown` or any tool that routes copy through Sanity AI.

**Model & Mode:** `/model sonnet` — pure content/Sanity MCP epic, no code changes.

## Model & Mode [REQUIRED]

`/model sonnet` — all work is Sanity content patches via MCP tools. No JSX, CSS, schema TypeScript, or migration scripts.

## Non-Goals

- No new glossary terms created as part of this audit (SUG-166/SUG-186 cover vocabulary growth)
- No new taxonomy documents (tags, categories, tools, projects) created without a separate editorial decision and pre-flight check
- No schema changes — all required fields already exist on all three content types
- No changes to the PT serialiser or GROQ queries — this is data, not code
- No changes to the legacy `author` (plain-text) field — use `authors` (person reference array) only
- Glossary term-tagging does not apply to `excerpt`, `seo.description`, or metadata fields — body text only

## Related

- **Linear:** [SUG-189](https://linear.app/sugartown/issue/SUG-189/content-taxonomy-audit-glossary-term-linking-full-taxonomy-coverage)
- **Glossary vocabulary:** SUG-166 (glossary completion), SUG-186 (schema split + bidirectional sync)
- **PT mark mechanics:** CLAUDE.md §Portable Text blocks written via MCP
- **Content Write Gate:** CLAUDE.md §Content Write Gate
- **Taxonomy pre-flight:** CLAUDE.md §Taxonomy pre-flight
- **Epic template:** `docs/epic-template.md`
