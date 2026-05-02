---
**Epic:** SUG-93 — Case study AEO/GEO content layer
**Linear Issue:** [SUG-93](https://linear.app/sugartown/issue/SUG-93)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-93 — Case study AEO/GEO content layer

Add structured retrieval fields to the `caseStudy` schema — `aeoSummary`, `geoSummary`, `keyQuestions[]` — and run a full editorial pass to populate them. These fields make case studies directly retrievable by AI answer engines and LLMs, not just human readers.

## Background

Answer Engine Optimisation (AEO) and Generative Engine Optimisation (GEO) treat content as retrieval objects: a piece should answer a specific question directly, in the first paragraph, with enough structured context for an AI to extract and cite it confidently. The current case study pages are written for human readers — they have narrative arcs, section headers, and prose. They are not written to surface in AI-generated answers. As LLMs increasingly mediate the first discovery of consultants and service providers, case studies that cannot be retrieved as direct answers are invisible. This epic adds three fields that bridge the gap without replacing the human-readable narrative: `aeoSummary` (a direct-answer paragraph written for featured snippets and AI answers), `geoSummary` (an LLM-optimised fact-dense summary), and `keyQuestions[]` (the specific questions this case study answers, with structured answers). Upstream dependency: SUG-91 (outcomes narrative complete, outcomes[] populated) and SUG-92 (industry[], companySize, region populated — referenced in geoSummary context).

## Objective

After this epic, every published case study has three machine-readable retrieval fields alongside its human-readable body copy. `aeoSummary` is written to appear verbatim in AI-generated answers. `geoSummary` gives LLMs a structured fact inventory. `keyQuestions[]` drives FAQ schema markup (SUG-94) and makes the case study retrievable against specific prospect questions. Layers touched: schema, GROQ, frontend render (optional display), content (full editorial pass, Content Write Gate fires for every document).

## Schema field proposal

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `aeoSummary` (text) | One paragraph written as a direct answer to "what did Bex do for [client]?" — optimised for featured snippets and AI citation | `"Bex redesigned Vanguard's data intake pipeline from a 14-step manual process to an automated flow, cutting analyst onboarding time from 3 hours to 18 minutes. The solution used dbt for transformation and a Sanity-backed intake form, eliminating engineering involvement on routine intakes."` | Written to appear verbatim in AI-generated answers and Google featured snippets; the single most important retrieval asset on the page |
| `geoSummary` (text) | LLM-optimised summary — third-person, fact-dense, no narrative | `"Client: Vanguard Health (enterprise healthcare). Engagement: data pipeline redesign, 2024. Outcome: 14-step manual intake replaced with automated pipeline. Time reduction: 3h to 18min per intake. Stack: dbt, Sanity, Figma. Role: Lead Product Designer (freelance)."` | Structured for AI systems that extract facts rather than read prose; different register and purpose from aeoSummary |
| `keyQuestions[]` (array of object) | 2–4 questions this case study directly answers, each with a structured answer | Q: `"How did you reduce data onboarding time?"` / A: `"By replacing a 14-step manual process with an automated dbt pipeline, removing the engineering bottleneck on routine intakes."` | Drives FAQ schema markup (SUG-94); surfaces directly in AI-generated answers when a prospect asks the exact question |
| `keyQuestions[].question` (string) | The question, written as a prospect would ask it | `"What's your experience with healthcare data systems?"` | Must be phrased as a real search query, not a heading |
| `keyQuestions[].answer` (text) | Direct answer — 1–3 sentences | `"Bex led a data pipeline redesign at Vanguard Health, a mid-size healthcare provider, replacing a manual 14-step intake process with an automated system. The engagement ran over 6 months in 2024."` | Should stand alone as a complete answer with no prior context required |

## Scope

**Phase 1 — Schema + GROQ + render:**
- [ ] Add `aeoSummary` (`text`, optional) to `caseStudy` schema, group: `seo` — layer: schema
- [ ] Add `geoSummary` (`text`, optional) to `caseStudy` schema, group: `seo` — layer: schema
- [ ] Add `keyQuestions[]` (array of inline object: `question` string, `answer` text) to `caseStudy` schema, group: `seo` — layer: schema
- [ ] Deploy schema: `npx sanity schema deploy` from `apps/studio/` — layer: schema
- [ ] Update `caseStudyBySlugQuery` projection to include all three fields — layer: GROQ
- [ ] Decide render approach at activation: hidden from UI (machine-readable only) or surface `keyQuestions[]` as a visible FAQ accordion — layer: frontend render (document decision at activation)

**Phase 2 — Editorial pass:**
- [ ] Write `aeoSummary` for all published case studies — layer: content (Content Write Gate fires for every document)
- [ ] Write `geoSummary` for all published case studies — layer: content (Content Write Gate fires for every document)
- [ ] Write `keyQuestions[]` (2–4 per case study) for all published case studies — layer: content (Content Write Gate fires for every document)

## Phases

Two phases — schema deploy must complete before content phase:

- **Phase 1:** Schema + GROQ + render decision (no Sanity content touched)
- **Phase 2:** Editorial pass — all three fields populated for every published case study (Content Write Gate for every document)

## Acceptance criteria

- [ ] Three new fields appear in Studio under the SEO group for `caseStudy` documents
- [ ] `npx sanity schema deploy` runs without errors
- [ ] GROQ probe: `*[_type == "caseStudy"]{ aeoSummary, geoSummary, keyQuestions }` returns populated values for all documents after editorial pass
- [ ] `caseStudyBySlugQuery` projection includes all three fields
- [ ] Content Write Gate satisfied for every document: before/after proposal table produced and approved before each patch
- [ ] `aeoSummary` reads as a direct answer to "what did Bex do for [client]?" — no em dashes, no AI vocabulary, no hedge stacking
- [ ] `geoSummary` is fact-dense, third-person, structured — not prose narrative
- [ ] Each `keyQuestions[]` entry has a question phrased as a real prospect search query and an answer that stands alone without prior context

## Technical notes

- **Upstream dependencies**: SUG-91 must be complete (outcomes[] populated, body copy reframed) before writing aeoSummary — the aeoSummary draws on the same outcome evidence. SUG-92 should be complete (industry[], companySize populated) so geoSummary can reference sector context.
- **Activation audit** — run before writing any code:
  ```groq
  *[_type == "caseStudy"]{ _id, title, "slug": slug.current, outcomes, challengeSummary, industry, companySize, "bodyStart": pt::text(body)[0..300] }
  ```
  Read current state of all case studies to scope the editorial pass.
- **Render decision gate**: at activation, decide whether `keyQuestions[]` renders as a visible FAQ accordion or is machine-readable only (rendered in `<script type="application/ld+json">` via SUG-94). Do not defer this decision past Phase 1 — it determines the frontend render scope.
- **Content Write Gate** fires for every document in Phase 2. Non-negotiable. Three separate before/after tables per document (one per field) or one combined table covering all three fields — either is acceptable.
- **Tool rule**: `patch_document_from_json` for all content writes — no AI rewriting layer.
- **Anti-slop**: `aeoSummary` and `geoSummary` are high-stakes copy. Apply all anti-slop rules from `docs/brand/brand-voice-guide.md`. These fields will be cited verbatim by AI systems.
- **JSON-LD output**: `keyQuestions[]` will drive `FAQPage` structured data in SUG-94. Write question/answer pairs with that output in mind — they must stand alone with no prose context.
- **Doc Type Coverage**: `caseStudy` only. `article` and `node` may benefit from similar fields in a future pass — out of scope here.
- **Model recommendation**: `/model opusplan` for Phase 1 (schema + render decision); `/model sonnet` for Phase 2 (content only, but high-stakes — review each field carefully).

## Non-Goals

- `answerBlock` / `proofPoint` reusable schema objects — deferred to [SUG-94](https://linear.app/sugartown/issue/SUG-94)
- JSON-LD / structured data renderer — deferred to [SUG-94](https://linear.app/sugartown/issue/SUG-94)
- `platforms[]` split from `tools[]` — deferred to [SUG-94](https://linear.app/sugartown/issue/SUG-94)
- `article` or `node` AEO/GEO fields — out of scope; consider a cross-doc retrieval epic post-SUG-93
- FAQ accordion component design — if keyQuestions[] renders visibly, use an existing accordion section type or a minimal inline pattern; do not design a new component
- Semantic search or embeddings index — separate infrastructure concern

## Related

- **Linear:** [SUG-93](https://linear.app/sugartown/issue/SUG-93)
- **SUG-91:** [Case study outcomes narrative](https://linear.app/sugartown/issue/SUG-91) — upstream dependency; outcomes[] must be populated before aeoSummary can be written
- **SUG-92:** [Case study discovery metadata](https://linear.app/sugartown/issue/SUG-92) — upstream dependency; industry context informs geoSummary
- **SUG-94:** [Structured retrieval objects + JSON-LD](https://linear.app/sugartown/issue/SUG-94) — downstream; keyQuestions[] drives FAQPage JSON-LD output
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage Audit, Query Layer Checklist, and Files to Modify at activation
