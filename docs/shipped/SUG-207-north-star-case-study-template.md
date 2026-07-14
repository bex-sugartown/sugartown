---
**Epic:** SUG-207 — North Star Case Study Template
**Linear Issue:** [SUG-207](https://linear.app/sugartown/issue/SUG-207/north-star-case-study-template)
**Status:** Shipped 2026-07-14 — Visual QA approved. <!-- Chromatic: pending -->

**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

> **Phase 0 sign-off (2026-07-13):** HTML mock at `docs/drafts/SUG-207-north-star-case-study-template.html` reviewed and approved by Bex. All decision-table items (challenge block, outcomes mechanism, stat/card type name, FAQ elevation, `keyQuestions[]` retirement, the three bespoke-logic resolutions, empty-state contract, outcome-tile framing) are Approved. **Implementation has NOT begun** — this doc is activation-ready. Activate under `/model opus` in plan mode (Opus plans the Pre-Execution Gate, then Sonnet executes).

# SUG-207 — North Star Case Study Template

## Close-out summary (2026-07-14)

Shipped via merge strategy (b), one branch. **Visual QA approved** against the Phase 0 mock on the Backroads case study.

**Headline:** a latent live bug was found and fixed — `cardSection` outcome tiles rendered **blank on all 7 case studies**. The SUG-151 `statTileSection`→`cardSection` rename updated the schema and the `PageSections` render case but never the GROQ projections, which still matched only `statTileSection` for `items[]` (a type 0 docs use). Fixed by renaming the projection in all 4 sections queries; verified in-browser (tiles now render).

**Decisions taken during the pre-execution gate (all live-data-verified):**
- `outcomes[]` — **retired**, not converted to `outcomeItem` (0/7 docs used it; `cardSection` is the canonical outcomes mechanism per the mock).
- `statTileSection` — **renamed → cardSection** in the 4 queries (not deleted — deletion would have made the outcomes bug permanent).
- `getSidebarRowStart()` — **extracted** to `lib/`, adopted by `CaseStudyPage` + `RootPage`.
- `challengeSummary` — schema field **retired** (approved as a scope addition; 0 data, fully unwired).
- FAQ-accordion soft validation nudge — **added** (`.warning()` on `caseStudy.sections`).

**Deferred / pending human action:**
- <!-- Chromatic: pending --> Chromatic VRT not yet run.
- **7 case-study drafts** (`wp.caseStudy.166/271/274/280/286/294/388`) carry the `keyQuestions` unset and **must be published** by a human — MCP writes to drafts only. `keyQuestions` content was verified byte-preserved in every FAQ accordion before the unset.

---

Redesign the case study detail page (`CaseStudyPage.jsx` + `caseStudy` schema) into a purpose-built, canonical template, and close out the schema/code drift that's accumulated around it since SUG-91/92/93/95/151.

## Background

The case study template is more mature than a blank slate — it already assembles Hero → MetadataCard → Challenge → Outcome stat cards → body sections → Citations → PageSidebar → ContentNav, and has AEO/GEO retrieval fields, FAQ accordion, and glossary linking. But four migrations across its history were never fully closed out, leaving live drift: `challengeSummary` is marked deprecated in favor of `calloutSection` yet `CaseStudyPage.jsx` still renders it as a live fallback branch; `outcomes[]` duplicates the shape of the standalone `outcomeItem.ts` object instead of referencing it, despite `outcomeItem.ts`'s own header comment claiming shared use; `statTileSection` was renamed to `cardSection` in SUG-151 but the GROQ query (`caseStudyBySlugQuery`) and `CaseStudyPage.jsx` both still carry dead branches for the old type name; and `keyQuestions[]` is hidden/deprecated in favor of `accordionSection semantic="faq"` but the SUG-93 doc never recorded that the decision resolved that way. Phase 0 research (2026-07-13) additionally found: (a) a stale code comment at `caseStudy.ts:504` claims `keyQuestions[]` drives the SUG-94 JSON-LD output — it does not; `generateJsonLd()` in `jsonLd.js` reads only `accordionSection` blocks with `semantic: 'faq'`, never `keyQuestions[]`; (b) `CaseStudyPage.jsx` has no render path for `keyQuestions[]` at all — it is fully orphaned, not even a legacy fallback; (c) a live GROQ query against all 7 published case studies confirmed every one already has `keyQuestions[]` content duplicated word-for-word into an `accordionSection semantic="faq"` block — the migration content-wise is already done, just never cleaned up. The FAQ accordion is not merely a visual nicety — it is the literal AEO/GEO delivery mechanism (schema.org `FAQPage` structured data) and should be elevated to a base template concern for every case study, not left as an easy-to-skip optional section. Additionally, `detail-page-recipe.md` names `ToolDetailPage.jsx` as the canonical detail-page reference implementation — but verification (2026-07-13) found `ToolDetailPage` belongs to a genuinely different page family (`entityDetailPage`, shared with `GlossaryTermPage`, `SeriesPage`, `TaxonomyDetailPage`) than `CaseStudyPage` (`.detailPage`, shared with `ArticlePage`, `NodePage`, `RootPage` — the prose-content page family with `PageSidebar`). The recipe was never scoped to this second family, so comparing `CaseStudyPage` against `ToolDetailPage` was testing across subtypes. Of `CaseStudyPage.jsx`'s apparent "bespoke" logic: hero extraction (`extractLeadHero`) is confirmed shared across all four `.detailPage` siblings via `lib/heroUtils.js`, not case-study-specific at all. Lead-stat-card peeling (`leadStatCount`, the leading run of `cardSection` blocks promoted to full-span placement above the two-column split) and the challenge-block hoist (`calloutSection`/`challengeSummary` extraction) are confirmed genuinely case-study-only — no `.detailPage` sibling has an equivalent need. The `--sidebar-row` CSS grid-row variable, however, is *not* case-study-only — `RootPage.jsx` independently computes the same variable with a different formula (`hasEyebrow ? 2 : 1` vs. `2 + challenge? + leadStatCount`), meaning the duplication/drift this epic is meant to close already exists across two pages, not one. This epic is triggered by a request to design a "north star" case study template rather than continue patching the existing one piecemeal. It is distinct from [SUG-187](https://linear.app/sugartown/issue/SUG-187/case-study-content-refresh-monolith-to-microservice-and-prestige) (content-only editorial voice pass on two specific case studies — no schema or frontend changes).

## Objective

After this epic: the case study detail page has one canonical section order and one canonical mechanism per concept (one challenge block, one outcomes mechanism referencing the shared `outcomeItem` object, one section-type name for stat cards, one FAQ mechanism) — with no deprecated-but-still-rendered fallback branches left in the render path or the GROQ query. Layers touched: **Sanity schema** (`caseStudy.ts`, `outcomeItem.ts` reference), **GROQ query** (`caseStudyBySlugQuery` in `queries.js`), **React render** (`CaseStudyPage.jsx`), and **documentation** (`detail-page-recipe.md`, decision resolution written back into the SUG-93 record). Explicitly excludes: content/copy edits to any live case study document (that's SUG-187's job), and the archive/list page (`ArchivePage.jsx` + `ContentCard.jsx`), which already work generically and are out of scope.

## Scope

- [x] Phase 0 HTML mock at `docs/drafts/SUG-207-north-star-case-study-template.html` showing the full canonical section order, using the Backroads case study (`charting-a-new-course-for-backroads-com`) as worked reference content — **approved 2026-07-13** — layer: design/mock
- [ ] Resolve `challengeSummary` vs `calloutSection`: pick one canonical mechanism for the Challenge block (the SUG-96 mock recommends the existing `Callout` component, `title="Challenge"`) and remove the losing path from `CaseStudyPage.jsx` — layer: frontend
- [ ] Point `caseStudy.outcomes[]` at the shared `outcomeItem` object schema instead of the duplicated inline shape — layer: schema
- [ ] Remove dead `statTileSection` branches from `caseStudyBySlugQuery` (queries.js) and `CaseStudyPage.jsx`'s lead-stat-card peeling logic; confirm `cardSection` is the only live type checked — layer: query, frontend
- [ ] Retire `keyQuestions[]` fully — no content migration required (verified: all 7 live case studies already have identical content duplicated into an `accordionSection semantic="faq"` block). Data cleanup only: dry-run + execute a small script to `unset keyQuestions` on all 7 published `caseStudy` documents, then remove the field from the schema, remove its GROQ projection line (`queries.js` ~line 1077), and delete the orphaned `.keyQuestionsZone`/`.keyQuestionsLabel` CSS classes in `pages.module.css` (confirmed unreferenced in any JSX) — layer: content (data cleanup), schema, query, frontend CSS
- [ ] Fix the stale code comment at `caseStudy.ts:504` claiming `keyQuestions[]` drives SUG-94 JSON-LD — it does not; `generateJsonLd()` reads only `accordionSection semantic="faq"` — layer: schema (doc comment)
- [ ] Add a closing note to `docs/shipped/SUG-93-case-study-aeo-geo-content-layer.md` recording that the render decision resolved toward the accordion (never previously documented), and that `keyQuestions[]` retirement required no data migration since content was already duplicated forward — layer: content docs
- [ ] Elevate the FAQ accordion (`accordionSection semantic="faq"`) to a base template concern: document in case-study authoring guidance that every case study should ship a "Key Questions" accordion answering what a prospective client evaluating Bex would ask, framed explicitly as the AEO/GEO delivery mechanism (schema.org `FAQPage` JSON-LD), not an optional section — layer: docs, content guidance
- [ ] Evaluate a soft Studio-side validation nudge (warning, not hard block) when a case study has no `semantic: "faq"` accordion, since the `semantic` field is an easy-to-miss radio toggle that silently drops JSON-LD emission if unset — layer: schema (validation)
- [ ] **RESOLVED (Option B):** document lead-stat-card peeling and the challenge-block hoist as justified case-study-specific behavior in `docs/conventions/detail-page-recipe.md` — no fold into shared `PageSections`/recipe system. Both simplify naturally as a side effect of this epic's other scope items (challenge hoist collapses once `challengeSummary` is retired; stat-card peeling simplifies once dead `statTileSection` branches are removed) — layer: frontend, docs
- [ ] Extract `--sidebar-row` CSS grid-row computation into a small shared utility (e.g. `getSidebarRowStart()` in `lib/`), adopted by both `RootPage.jsx` and `CaseStudyPage.jsx` — not deferred as tech debt, since `RootPage` already independently duplicates this with a different formula (real drift, not speculative), and this epic is already editing `CaseStudyPage`'s formula inputs (challenge retirement, outcomes/`cardSection` consolidation) for other reasons — layer: frontend
- [ ] Add a clarifying note to `docs/conventions/detail-page-recipe.md`: `ToolDetailPage.jsx` is the reference implementation for the `entityDetailPage` family (also `GlossaryTermPage`, `SeriesPage`, `TaxonomyDetailPage`); `CaseStudyPage`/`ArticlePage`/`NodePage`/`RootPage` are a distinct `.detailPage` prose-content family. Close-out structural comparisons for content-page-family epics should use a sibling from that family (Article or Node), not `ToolDetailPage` — layer: docs
- [ ] Re-run the component-reuse manifest against `detail-page-recipe.md` for the rebuilt page (comparing against `ArticlePage.jsx` or `NodePage.jsx`, not `ToolDetailPage.jsx`) and record any justified divergences — layer: docs

## Acceptance criteria

- [x] Phase 0 mock reviewed and approved (2026-07-13) before any JSX/schema edit lands (per CLAUDE.md Phase 0 hard-stop) — implementation gate cleared, activation not yet begun
- [ ] `grep -r "statTileSection"` across `apps/web/src` and `apps/studio/schemas` returns zero matches (or only a documented, justified legacy-doc compatibility shim)
- [ ] `caseStudy.outcomes[]` schema field references `outcomeItem` type, not an inline anonymous object — schema deployed (`npx sanity schema deploy`) and MCP writes against it succeed
- [ ] `CaseStudyPage.jsx` contains exactly one render path for the Challenge block (no dual `calloutSection`/`challengeSummary` branch)
- [ ] `keyQuestions[]` resolution is written into `docs/shipped/SUG-93-case-study-aeo-geo-content-layer.md` as a dated addendum, not left implicit in schema comments
- [ ] `grep -rn "keyQuestions" apps/web/src apps/studio/schemas` returns zero matches after cleanup (schema field, GROQ projection, generated manifests all clear)
- [ ] All 7 live `caseStudy` documents confirmed to have `keyQuestions` unset via a post-migration GROQ probe (`count(keyQuestions) == 0` or field absent)
- [ ] The stale `caseStudy.ts:504` comment no longer claims `keyQuestions[]` drives JSON-LD output
- [ ] Case-study authoring guidance documents the FAQ accordion as a base template concern, not an optional section
- [ ] Mock-to-implementation comparison table produced at close-out per CLAUDE.md Visual QA gate, comparing the shipped page against the approved Phase 0 mock
- [ ] Structural comparison against `ArticlePage.jsx` or `NodePage.jsx` (the correct `.detailPage`-family sibling, not `ToolDetailPage.jsx`) completed per `detail-page-recipe.md` close-out check, with any divergence justified in writing
- [ ] `getSidebarRowStart()` (or equivalent) utility exists and is imported by both `RootPage.jsx` and `CaseStudyPage.jsx` — no independent inline `--sidebar-row` formula remains in either file

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.
>
> Known starting points from Phase 0 research (2026-07-13): case study detail —
> `http://localhost:5173/case-studies/charting-a-new-course-for-backroads-com` (most complete
> live example, exercises hero/metadata/challenge/outcomes/body/citations/keyQuestions/visuals).
> Case study archive (regression guard, should be unaffected) — `http://localhost:5173/case-studies`.
> Tool detail (recipe reference implementation, regression guard) — confirm a live `/tools/:slug`
> example via App.jsx before executing.

## Technical notes

- **Content Write Gate**: not expected to fire for this epic — no case study document copy is being authored or rewritten, only structural/schema fields (`outcomes[]` type pointer, `keyQuestions[]` unset) that hold no new human-readable copy. The `keyQuestions[]` unset is a pure structural/mechanical patch (removing now-fully-redundant duplicate data, verified byte-identical to the accordion content already live) — Content Write Gate does not fire per CLAUDE.md's "pure structural/technical patches" exemption. If any live case study's `outcomes[]` data needs reshaping to match the new `outcomeItem` reference during migration, that reshape is also structural, but if any wording changes are needed to fit the new shape, the gate fires and a proposal table is required first.
- **Schema changes**: yes — `caseStudy.outcomes[]` type change (inline object → `outcomeItem` reference), `keyQuestions[]` field removal (data already confirmed redundant, no migration needed — see Scope). Requires `npx sanity schema deploy` after the schema commit, per CLAUDE.md.
- **`keyQuestions[]` cleanup is data + schema, no content migration**: Phase 0 research (2026-07-13) ran a live GROQ probe against all 7 published `caseStudy` documents (`wp.caseStudy.166/271/274/280/286/294/388`) — every one already has `keyQuestions[]` duplicated word-for-word into an `accordionSection semantic="faq"` block. `CaseStudyPage.jsx` has no render path for `keyQuestions[]` at all (confirmed via grep — zero matches), and `generateJsonLd()` reads only the accordion, never `keyQuestions[]`. The field is fully orphaned dead data on every live document. Cleanup is: dry-run + execute `unset keyQuestions` across the 7 docs, remove the schema field, remove the GROQ projection line, delete orphaned CSS.
- **Upstream dependencies**: none blocking. Independent of SUG-187 (content-only, different case studies, different layer).
- **Activation audits**:
  - Read `apps/web/src/pages/CaseStudyPage.jsx` in full at activation to confirm current line numbers for the `challengeSummary` fallback branch, `extractLeadHero`, and the `leadStatCount`/`statTileSection` peeling loop before editing.
  - Read `apps/web/src/lib/queries.js` `caseStudyBySlugQuery` (~line 927) at activation to confirm the exact `statTileSection` branch to remove.
  - Read `apps/studio/schemas/objects/outcomeItem.ts` and `apps/studio/schemas/documents/caseStudy.ts` `outcomes` field at activation to write the exact schema diff.
  - Check whether any live Sanity case study document currently has populated `outcomes[]` data that would need reshaping when the field type changes — query `*[_type == "caseStudy" && count(outcomes) > 0]{ _id, title, outcomes }` before making the schema change.
- **Model & Mode [REQUIRED]:** `/model opus` (plan mode) — this epic spans schema design, GROQ query changes, and React render logic with a structural decision (fold bespoke logic into shared recipe vs. justify divergence) that benefits from a Pre-Execution Gate plan before Sonnet executes.

### Schema field proposal

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `outcomes[]` (array, ref → `outcomeItem`) | Case study outcome/proof-point list, changed from inline anonymous object to a reference on the shared `outcomeItem` object type already used by `proofPointSection` | `{ metric: "Migration time", valueBefore: "Hundreds of hours", valueAfter: "Under two hours", impactStatement: "...", evidenceType: "measured" }` | Closes the schema-drift gap where `outcomeItem.ts` claims shared use across `caseStudy` and `proofPointSection` but `caseStudy` never actually referenced it |

## Model & Mode [REQUIRED]

`/model opus` (plan mode) — Opus plans the Pre-Execution Gate (Files to Modify, schema diff, GROQ diff) before Sonnet executes. This is not a pure content epic (schema + query + frontend all change) and not a pure architecture epic (it's bounded to one doc type and one page), but the structural decision warrants a plan-first pass rather than the `/model sonnet` default.

## Non-Goals

- No content/copy edits to any live case study document — that is SUG-187's scope, not this epic's.
- No changes to the case study archive/list page (`ArchivePage.jsx`, `ContentCard.jsx`) — these are generic, shared across doc types, and already work correctly for case studies.
- No new `caseStudyCard` paired object schema — research confirmed the generic `ContentCard` renders case studies adequately on the archive; introducing a bespoke card is out of scope unless the Phase 0 mock surfaces a specific visual need.
- No commercetools/MACH or Prestige Beauty Pilot content work — those belong to SUG-187 or a future separately-scoped case study if warranted.

## Related

- **Linear:** [SUG-207](https://linear.app/sugartown/issue/SUG-207/north-star-case-study-template)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **Related epics:** SUG-91 (outcomes narrative), SUG-92 (discovery metadata), SUG-93 (AEO/GEO layer), SUG-95 (AI Assist POC), SUG-151 (cardSection rename), SUG-187 (content-only refresh, distinct scope)
- **Existing mock (superseded/partial):** `docs/drafts/SUG-96-case-study-page.html` — several of its proposals (`citedBlock`, `cardSection`) have since shipped; this epic's Phase 0 mock should reference and update it, not ignore it
