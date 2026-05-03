---
**Epic:** SUG-94 — Structured retrieval objects + JSON-LD renderer
**Linear Issue:** [SUG-94](https://linear.app/sugartown/issue/SUG-94)
**Status:** Backlog
**Priority:** ⬛ Deferred
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
---

# SUG-94 — Structured retrieval objects + JSON-LD renderer

Phase 3 of the case study structured content arc. Create reusable `answerBlock` and `proofPoint` schema objects usable across `caseStudy`, `article`, and `node`. Split `tools[]` into `tools[]` + `platforms[]`. Add JSON-LD structured data output to `CaseStudyPage` (`FAQPage` + `CreativeWork`). Requires Phase 0 mockup gate — the `answerBlock`/`proofPoint` object API design affects all three doc types before any code can be written.

## Background

SUG-91 through SUG-93 treat `caseStudy` as the primary structured content surface. Once case studies have `outcomes[]`, `challengeSummary`, and `keyQuestions[]`, two further gaps remain. First, the reusable structured content objects — `answerBlock` (a question + answer + evidence unit) and `proofPoint` (a claim + metric + context unit) — are patterns that appear across case studies, articles, and nodes but have no shared schema representation. Without a shared object, each doc type implements its own inline version, making the content unqueryable across types. Second, `tools[]` conflates tools (Figma, Claude, dbt) with platforms (Salesforce, Shopify, AWS) — a filtering and signal gap that becomes more important as the structured retrieval layer matures. Third, `keyQuestions[]` from SUG-93 has no JSON-LD output — the FAQ data exists in Sanity but does not surface as machine-readable structured data on the page.

## Objective

After this epic: `answerBlock` and `proofPoint` are shared schema objects registered and available in `caseStudy`, `article`, and `node`; `caseStudy` has a `platforms[]` field separated from `tools[]` with a data migration moving existing platform-type tool references; `CaseStudyPage` outputs `FAQPage` and `CreativeWork` JSON-LD using `keyQuestions[]` and document metadata. Layers touched: schema (objects + documents), GROQ, frontend render, content (platforms[] migration), JSON-LD renderer. Phase 0 mockup gate is required before any implementation.

## Schema field proposal

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `answerBlock` object | Reusable schema object: a question, a direct answer, and optional evidence links — usable in caseStudy, article, node sections[] | Q: `"What makes this approach repeatable?"` / A: 2-paragraph text / Evidence: ref to related node | One schema object for every structured Q&A block across the site; makes the pattern queryable cross-doc |
| `proofPoint` object | Reusable schema object: a claim, a metric, and optional context — the atomic unit of evidence | Claim: `"Cut intake time"` / Metric: `"-78%"` / Context: `"Across 6 client onboardings in Q3 2024"` | Pulls outcome evidence out of body prose into a queryable structure; enables aggregated proof-point views |
| `platforms[]` (array of reference to `tool`) | Platforms and infrastructure the client used — separated from tools Bex worked with | refs to `Salesforce`, `AWS`, `Shopify` | Current `tools[]` conflates Bex's tools with client platforms — filtering by "has Salesforce experience" is currently impossible |
| JSON-LD `FAQPage` | Structured data block output in `<script type="application/ld+json">` using `keyQuestions[]` | `{"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "...", "acceptedAnswer": {...}}]}` | Makes keyQuestions[] machine-readable to Google and LLMs without any visible UI change |
| JSON-LD `CreativeWork` | Structured data block for the case study document itself | `{"@type": "CreativeWork", "name": "...", "author": {...}, "datePublished": "..."}` | Establishes document identity for AI citation and Google rich results |

## Scope

**Phase 0 — Object API design (mockup gate):**
- [ ] Design `answerBlock` and `proofPoint` schema object APIs — field names, types, validation, and Studio UI layout — layer: schema planning
- [ ] Mockup at `docs/drafts/SUG-94-object-api-mock.html` (or structured spec doc) covering the object shape and how it composes into each of the three doc types — layer: Phase 0 artefact
- [ ] Human sign-off on object API before any schema code is written

**Phase 1 — Schema objects + document wiring:**
- [ ] Create `apps/studio/schemas/objects/answerBlock.ts` — layer: schema
- [ ] Create `apps/studio/schemas/objects/proofPoint.ts` — layer: schema
- [ ] Register both objects in `apps/studio/schemas/index.ts` — layer: schema
- [ ] Add `platforms[]` (array of reference to `tool`) to `caseStudy` schema — layer: schema
- [ ] Wire `answerBlock` and `proofPoint` into `sections[]` of `caseStudy`, `article`, `node` — layer: schema (doc type audit at activation)
- [ ] Deploy schema — layer: schema

**Phase 2 — GROQ + render + migration:**
- [ ] Update `caseStudyBySlugQuery`, `articleBySlugQuery`, `nodeBySlugQuery` projections for new section types — layer: GROQ
- [ ] Add `answerBlock` and `proofPoint` renderers to `PageSections.jsx` — layer: frontend render
- [ ] Add JSON-LD renderer to `CaseStudyPage.jsx` (FAQPage + CreativeWork) — layer: frontend render
- [ ] Migration script: copy platform-type `tool` references from `tools[]` → `platforms[]` on all `caseStudy` documents — layer: content migration (dry-run required)

## Phases

Three phases — Phase 0 is a hard gate:

- **Phase 0:** Object API design + human sign-off (no code)
- **Phase 1:** Schema objects + document wiring + deploy
- **Phase 2:** GROQ + renderers + migration script

## Acceptance criteria

- [ ] Phase 0 sign-off: object API spec reviewed and approved by human before any schema code written
- [ ] `answerBlock` and `proofPoint` appear as section types in the Studio section builder for `caseStudy`, `article`, and `node`
- [ ] `platforms[]` field appears in Studio Metadata group for `caseStudy`
- [ ] Schema deploy runs without errors
- [ ] Migration script dry-run reports expected count of `caseStudy` documents with tool references to migrate
- [ ] After migration `--execute`, GROQ probe confirms `platforms[]` populated on all migrated documents
- [ ] `CaseStudyPage` outputs valid `FAQPage` JSON-LD — verified via Google Rich Results Test on a published case study with `keyQuestions[]` populated
- [ ] `CaseStudyPage` outputs valid `CreativeWork` JSON-LD
- [ ] No `answerBlock` or `proofPoint` instances in `tools[]` after migration — `tools[]` contains only practitioner tools, not platforms

## Technical notes

- **Phase 0 is a hard gate**: `answerBlock` and `proofPoint` objects cross-cut three doc types. A design decision made in the schema will be difficult to reverse once content is authored against it. The object API must be reviewed before any code. See CLAUDE.md §Phase 0 hard-stop.
- **Activation audit** — run before Phase 1:
  ```groq
  *[_type == "caseStudy"]{ _id, title, "tools": tools[]->name }
  ```
  Identify which tool references are platforms vs. practitioner tools to scope the migration.
- **`platforms[]` migration**: uses the same `tool` document type as `tools[]` — no new document type needed. The distinction is semantic (client infrastructure vs. Bex's tooling). Migration script copies references that are platform-type into `platforms[]` — requires a curated list of platform-type tool names to drive the copy logic.
- **JSON-LD renderer**: add as a `<Helmet>` or inline `<script>` in `CaseStudyPage.jsx`. Build from `keyQuestions[]` (populated in SUG-93) and existing document metadata (`title`, `publishedAt`, `authors[]`). Do not render if `keyQuestions[]` is empty.
- **Upstream dependencies**: SUG-93 must be complete (`keyQuestions[]` populated) before JSON-LD render is testable on real data. Schema work in Phase 1 can proceed in parallel.
- **Doc Type Coverage**: `caseStudy`, `article`, `node` for `answerBlock`/`proofPoint`; `caseStudy` only for `platforms[]` and JSON-LD.
- **Model recommendation**: `/model opusplan` for Phase 0 and Phase 1 (architectural decisions); `/model sonnet` for Phase 2 execution.

## Non-Goals

- `article` or `node` JSON-LD output — `caseStudy` only in this epic; extend in a follow-on
- Semantic search or embeddings index — separate infrastructure epic
- Industry taxonomy document type (reference collection) — `industry[]` uses a controlled string list (SUG-92)
- New page types or routing changes
- Any content editorial work beyond the `platforms[]` migration

## Related

- **Linear:** [SUG-94](https://linear.app/sugartown/issue/SUG-94)
- **SUG-91:** [Case study outcomes narrative](https://linear.app/sugartown/issue/SUG-91) — establishes outcomes[] structure that proofPoint builds on
- **SUG-92:** [Case study discovery metadata](https://linear.app/sugartown/issue/SUG-92) — platforms[] split is informed by tools[] data shape established here
- **SUG-93:** [Case study AEO/GEO content layer](https://linear.app/sugartown/issue/SUG-93) — keyQuestions[] from SUG-93 drives the FAQPage JSON-LD in this epic
- **Epic template:** `docs/epic-template.md` — Phase 0 mockup gate applies; complete all checklists at activation
