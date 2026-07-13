---
**Epic:** SUG-207 — North Star Case Study Template
**Linear Issue:** [SUG-207](https://linear.app/sugartown/issue/SUG-207/north-star-case-study-template)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-207 — North Star Case Study Template

Redesign the case study detail page (`CaseStudyPage.jsx` + `caseStudy` schema) into a purpose-built, canonical template, and close out the schema/code drift that's accumulated around it since SUG-91/92/93/95/151.

## Background

The case study template is more mature than a blank slate — it already assembles Hero → MetadataCard → Challenge → Outcome stat cards → body sections → Citations → PageSidebar → ContentNav, and has AEO/GEO retrieval fields, FAQ accordion, and glossary linking. But four migrations across its history were never fully closed out, leaving live drift: `challengeSummary` is marked deprecated in favor of `calloutSection` yet `CaseStudyPage.jsx` still renders it as a live fallback branch; `outcomes[]` duplicates the shape of the standalone `outcomeItem.ts` object instead of referencing it, despite `outcomeItem.ts`'s own header comment claiming shared use; `statTileSection` was renamed to `cardSection` in SUG-151 but the GROQ query (`caseStudyBySlugQuery`) and `CaseStudyPage.jsx` both still carry dead branches for the old type name; and `keyQuestions[]` is hidden/deprecated in favor of `accordionSection semantic="faq"` but the SUG-93 doc never recorded that the decision resolved that way. Additionally, `detail-page-recipe.md` names `ToolDetailPage.jsx` as the canonical detail-page reference implementation, not `CaseStudyPage.jsx` — the case study page carries bespoke logic (hero extraction, lead-stat-card peeling, grid-row CSS math) that predates or diverges from that recipe. This epic is triggered by a request to design a "north star" case study template rather than continue patching the existing one piecemeal. It is distinct from [SUG-187](https://linear.app/sugartown/issue/SUG-187/case-study-content-refresh-monolith-to-microservice-and-prestige) (content-only editorial voice pass on two specific case studies — no schema or frontend changes).

## Objective

After this epic: the case study detail page has one canonical section order and one canonical mechanism per concept (one challenge block, one outcomes mechanism referencing the shared `outcomeItem` object, one section-type name for stat cards, one FAQ mechanism) — with no deprecated-but-still-rendered fallback branches left in the render path or the GROQ query. Layers touched: **Sanity schema** (`caseStudy.ts`, `outcomeItem.ts` reference), **GROQ query** (`caseStudyBySlugQuery` in `queries.js`), **React render** (`CaseStudyPage.jsx`), and **documentation** (`detail-page-recipe.md`, decision resolution written back into the SUG-93 record). Explicitly excludes: content/copy edits to any live case study document (that's SUG-187's job), and the archive/list page (`ArchivePage.jsx` + `ContentCard.jsx`), which already work generically and are out of scope.

## Scope

- [ ] Phase 0 HTML mock at `docs/drafts/SUG-207-*.html` showing the full canonical section order, using the Backroads case study (`charting-a-new-course-for-backroads-com`) as worked reference content — layer: design/mock
- [ ] Resolve `challengeSummary` vs `calloutSection`: pick one canonical mechanism for the Challenge block (the SUG-96 mock recommends the existing `Callout` component, `title="Challenge"`) and remove the losing path from `CaseStudyPage.jsx` — layer: frontend
- [ ] Point `caseStudy.outcomes[]` at the shared `outcomeItem` object schema instead of the duplicated inline shape — layer: schema
- [ ] Remove dead `statTileSection` branches from `caseStudyBySlugQuery` (queries.js) and `CaseStudyPage.jsx`'s lead-stat-card peeling logic; confirm `cardSection` is the only live type checked — layer: query, frontend
- [ ] Confirm and document the `keyQuestions[]` → `accordionSection semantic="faq"` migration as final; fully deprecate/hide `keyQuestions[]` if not already; add a closing note to `docs/shipped/SUG-93-case-study-aeo-geo-content-layer.md` recording the resolution — layer: schema, content docs
- [ ] Decide whether `CaseStudyPage.jsx`'s bespoke logic (hero extraction, lead-stat-card peeling, sidebar grid-row CSS variable calc) gets folded into the shared `PageSections`/detail-page recipe system, or stays case-study-specific with a written justification added to `docs/conventions/detail-page-recipe.md` — layer: frontend, docs
- [ ] Re-run the component-reuse manifest against `detail-page-recipe.md` for the rebuilt page and record any justified divergences — layer: docs

## Acceptance criteria

- [ ] Phase 0 mock reviewed and explicit "Visual QA approved" received before any JSX/schema edit lands (per CLAUDE.md Phase 0 hard-stop)
- [ ] `grep -r "statTileSection"` across `apps/web/src` and `apps/studio/schemas` returns zero matches (or only a documented, justified legacy-doc compatibility shim)
- [ ] `caseStudy.outcomes[]` schema field references `outcomeItem` type, not an inline anonymous object — schema deployed (`npx sanity schema deploy`) and MCP writes against it succeed
- [ ] `CaseStudyPage.jsx` contains exactly one render path for the Challenge block (no dual `calloutSection`/`challengeSummary` branch)
- [ ] `keyQuestions[]` resolution is written into `docs/shipped/SUG-93-case-study-aeo-geo-content-layer.md` as a dated addendum, not left implicit in schema comments
- [ ] Mock-to-implementation comparison table produced at close-out per CLAUDE.md Visual QA gate, comparing the shipped page against the approved Phase 0 mock
- [ ] Structural comparison against `ToolDetailPage.jsx` (per `detail-page-recipe.md` close-out check) completed, with any divergence justified in writing

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

- **Content Write Gate**: not expected to fire for this epic — no case study document copy is being authored or rewritten, only structural/schema fields (`outcomes[]` type pointer) that hold no human-readable copy. If any live case study's `outcomes[]` data needs reshaping to match the new `outcomeItem` reference during migration, that reshape is a structural/mechanical patch (Content Write Gate does not fire for pure structural patches per CLAUDE.md), but if any wording changes are needed to fit the new shape, the gate fires and a proposal table is required first.
- **Schema changes**: yes — `caseStudy.outcomes[]` type change (inline object → `outcomeItem` reference), `keyQuestions[]` deprecation finalization. Requires `npx sanity schema deploy` after the schema commit, per CLAUDE.md.
- **Upstream dependencies**: none blocking. Independent of SUG-187 (content-only, different case studies, different layer).
- **Activation audits**:
  - Read `apps/web/src/pages/CaseStudyPage.jsx` in full at activation to confirm current line numbers for the `challengeSummary` fallback branch, `extractLeadHero`, and the `leadStatCount`/`statTileSection` peeling loop before editing.
  - Read `apps/web/src/lib/queries.js` `caseStudyBySlugQuery` (~line 927) at activation to confirm the exact `statTileSection` branch to remove.
  - Read `apps/studio/schemas/objects/outcomeItem.ts` and `apps/studio/schemas/documents/caseStudy.ts` `outcomes` field at activation to write the exact schema diff.
  - Check whether any live Sanity case study document currently has populated `outcomes[]` data that would need reshaping when the field type changes — query `*[_type == "caseStudy" && count(outcomes) > 0]{ _id, title, outcomes }` before making the schema change.
- **Model & Mode [REQUIRED]:** `/model opusplan` — this epic spans schema design, GROQ query changes, and React render logic with a structural decision (fold bespoke logic into shared recipe vs. justify divergence) that benefits from a Pre-Execution Gate plan before Sonnet executes.

### Schema field proposal

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `outcomes[]` (array, ref → `outcomeItem`) | Case study outcome/proof-point list, changed from inline anonymous object to a reference on the shared `outcomeItem` object type already used by `proofPointSection` | `{ metric: "Migration time", valueBefore: "Hundreds of hours", valueAfter: "Under two hours", impactStatement: "...", evidenceType: "measured" }` | Closes the schema-drift gap where `outcomeItem.ts` claims shared use across `caseStudy` and `proofPointSection` but `caseStudy` never actually referenced it |

## Model & Mode [REQUIRED]

`/model opusplan` — Opus plans the Pre-Execution Gate (Files to Modify, schema diff, GROQ diff) before Sonnet executes. This is not a pure content epic (schema + query + frontend all change) and not a pure architecture epic (it's bounded to one doc type and one page), so the default applies.

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
