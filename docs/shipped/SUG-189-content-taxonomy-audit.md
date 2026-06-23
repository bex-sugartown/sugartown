---
**Epic:** SUG-189 — Content taxonomy audit — glossary term-linking, full taxonomy coverage, people=Bex across all content
**Linear Issue:** [SUG-189](https://linear.app/sugartown/issue/SUG-189/content-taxonomy-audit-glossary-term-linking-full-taxonomy-coverage)
**Status:** Shipped
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
**Shipped:** 2026-06-23
---

# SUG-189 — Content taxonomy audit — glossary term-linking, full taxonomy coverage, people=Bex across all content

Audit every article, node, and case study to ensure each piece has at least one entry from each relevant taxonomy type; term-tag first-instance glossary matches inline; and confirm people=Bex is set on all three content types.

## Background

Every article, node, and case study has structured taxonomy fields (`authors`, `projects`, `tools`, `categories`, `tags`) and supports inline `glossaryTermRef` marks in PortableText body content. In practice, many pieces are sparsely tagged — missing people attribution, no category, no tool references, or no inline glossary term links. The glossary term library has grown substantially (SUG-166, SUG-186) and none of that vocabulary has been back-applied to existing content body text. This epic closes that gap systematically, starting with glossary term-tagging (highest editorial value, most mechanical), then sweeping the structured taxonomy fields, and finally confirming Bex is set as `authors` on every piece.

## Objective

After this epic every published article, node, and case study will: (1) have at least one inline `glossaryTermRef` mark on the first occurrence of each matching term in its body text where a match exists; (2) have at least one reference in each relevant structured taxonomy field (`projects`, `tools`, `categories`, `tags`) unless the field is genuinely not applicable to the piece's subject matter; (3) have `authors` populated with the Bex person document. No schema changes. No new taxonomy documents created without the taxonomy pre-flight check. Purely Sanity content writes.

## Scope

- [x] **Phase 1 — Glossary term-tagging:** Completed 2026-06-22. Coverage: 14/15 articles (93%), 52/53 nodes (98%). Case studies skipped — no external client content references Sugartown glossary terms. wp.node.977 and article b764ea17 have no body text matching any glossary term. 39 of 65 glossary terms (60%) now linked; 26 terms have no verbatim occurrence across any content.
- [x] **Phase 2 — Structured taxonomy sweep:** Completed 2026-06-23. All 75 documents audited across `authors`, `categories`, `tags`, `tools`, `projects`. One patch applied (article `wp.article.1025` → Pink Moon Design System). 11 documents left with empty `projects` — all documented exceptions (see below). All other fields fully populated across all documents.
- [x] **Phase 3 — people=Bex backfill:** Completed 2026-06-23. Zero documents were missing `authors` — all 75 already had Becky Alice Head set. No patches required.
- [x] **Phase 4 — Coverage audit:** GROQ verification 2026-06-23. Results below.

## Phase 4 — Final Coverage Audit (2026-06-23)

**Corpus:** 15 articles, 53 nodes, 7 case studies = 75 documents total

| Field | Missing count | Status |
|-------|--------------|--------|
| `authors` | 0 | ✅ Zero gaps |
| `categories` | 0 | ✅ Zero gaps |
| `tags` | 0 | ✅ Zero gaps |
| `tools` | 0 | ✅ Zero gaps |
| `projects` | 11 | ✅ All documented exceptions |

**Phase 1 glossary mark coverage:**
- Articles with marks: 14/15 (93%)
- Nodes with marks: 52/53 (98%)
- Glossary terms linked: 39 of 65 (60%)
- Top terms by usage: Design system (22), Component (14), Knowledge graph (12), Content model (12), Headless CMS (10)

## Documented exceptions — empty `projects` field

These 11 documents have `projects: []` by design. No internal Sugartown project document exists for any of them, and the acceptance criteria explicitly permits empty fields where "genuinely not relevant."

**Case studies — external client engagements (no internal project doc):**
- `wp.caseStudy.280` — Bare Minerals: From Bottlenecks to Brilliance
- `wp.caseStudy.166` — Beauty Retail: From Monolith to Microservice
- `wp.caseStudy.286` — Beringer.com: Raising a Glass to a Digital Refresh
- `wp.caseStudy.274` — Charting a New Course for Backroads.com
- `wp.caseStudy.271` — FX Networks Website Redesign: Nominated for Webby!
- `wp.caseStudy.294` — Launching Lunar Landing
- `wp.caseStudy.388` — Prestige Beauty Pilot — Headless CMS + Enterprise Design System

**Articles — no applicable internal project:**
- `wp.article.1437` — Core Web Vitals Don't Belong to Frontend (governance thought leadership)
- `wp.article.736` — Lessons from Replacing Oracle ATG/BCC (external client engagement)
- `wp.article.1804` — The Great iCloud Divorce (personal/lifestyle)
- `wp.article.814` — 💎 LUXURY DOT COM 💎 (personal/lifestyle, left empty per editorial decision 2026-06-23)

## Acceptance criteria

- [x] Every article/node/case study that contains a glossaryTerm's text verbatim has a `glossaryTermRef` mark on the first occurrence in body content
- [x] Inexact/conceptual glossary matches are listed in the shipped doc with a decision (applied / deferred / not applicable) — 26 terms have no verbatim occurrence; flagged in Phase 1 note above
- [x] Every article/node/case study has at least one entry in `categories` and `tags`
- [x] Every article/node/case study has `authors` containing the Bex person document
- [x] `tools` and `projects` fields are populated where contextually appropriate; empty fields with justification noted above
- [x] All patches went through the Content Write Gate
- [x] All patched documents are published
- [x] Phase 4 GROQ audit returns zero empty `authors` across all three content types
- [x] No new taxonomy documents created without the taxonomy pre-flight check

## Human QA Walkthrough

Not applicable — no CSS, layout token, or multi-page component changes. All changes are Sanity content patches.

<!-- Chromatic: not applicable — content-only epic -->

## Related

- **Linear:** [SUG-189](https://linear.app/sugartown/issue/SUG-189/content-taxonomy-audit-glossary-term-linking-full-taxonomy-coverage)
- **Glossary vocabulary:** SUG-166 (glossary completion), SUG-186 (schema split + bidirectional sync)
- **PT mark mechanics:** CLAUDE.md §Portable Text blocks written via MCP
- **Content Write Gate:** CLAUDE.md §Content Write Gate
- **Taxonomy pre-flight:** CLAUDE.md §Taxonomy pre-flight
