---
**Epic:** SUG-91 — Case study outcomes narrative
**Linear Issue:** [SUG-91](https://linear.app/sugartown/issue/SUG-91)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-91 — Case study outcomes narrative

Shift existing case study body copy from process narrative to client outcomes framing, and activate the existing `outcomes[]` schema field with an enhanced structure that captures before/after evidence.

## Background

Case studies currently read as process narratives: "I built X using Y." This positions Bex as an implementer rather than a value-deliverer. The consulting pivot (SUG-90) elevates case studies as the primary proof-of-work surface — prospective clients need to see outcomes, not process.

A schema analysis (2026-05-02) confirmed that `outcomes[]` already exists on the `caseStudy` document but is `hidden: true` with a shallow structure (metric, value, description). The correct path is to enhance and unhide this existing field — not to add a new `outcomesSummary` text field, which would create a Single Field Authority conflict. A `challengeSummary` text field is also warranted to frame the problem before body copy, giving prospects the "why we were hired" context in one paragraph.

The formerly proposed `outcomesSummary` flat text field is not proceeding — it is inferior to an activated `outcomes[]` array and would duplicate it.

## Objective

After this epic: the `outcomes[]` field is unhidden and enhanced with before/after evidence structure; a `challengeSummary` field captures the problem framing; both render on the case study detail page above the body; and all case study body copy leads with client outcomes rather than process narrative. Layers touched: schema, GROQ, frontend render, content (all via Content Write Gate). `article`, `node`, `page`, and `archivePage` are not in scope.

## Schema field proposal

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `challengeSummary` (text) | One paragraph describing what the client needed to solve — the "why we were hired" statement | `"Vanguard's intake team was spending 60% of sprint capacity on data prep rather than analysis. The manual process had accumulated 14 steps across three systems with no single owner."` | Sets problem context before body copy; gives prospects the brief they need to self-qualify |
| `outcomes[].metric` (string, existing) | What was measured — unchanged from current schema | `"Analyst prep time"` | Scannable label |
| `outcomes[].valueBefore` (string, new) | State before the engagement | `"14 manual steps, ~3 hours per intake"` | Shows the gap; without this, outcomes read as absolute claims with no baseline |
| `outcomes[].valueAfter` (string, rename from `value`) | State after — the result | `"Automated pipeline, ~18 minutes per intake"` | The proof point |
| `outcomes[].impactStatement` (text, new) | Plain-language sentence explaining what changed for the client | `"Teams could onboard a new data source in under 20 minutes — previously a half-day task requiring a data engineer."` | The narrative hook; bridges the metric to business meaning |
| `outcomes[].evidenceType` (string enum, new) | How solid the number is | `measured` / `estimated` / `qualitative` | Honesty signal; builds trust with technically literate prospects |

## Scope

**Phase 1 — Schema + GROQ + render:**
- [x] Enhance `outcomes[]` inline object: rename `value` → `valueAfter`, add `valueBefore` (string, optional), add `impactStatement` (text, optional, 2 rows), add `evidenceType` (radio: `measured` / `estimated` / `qualitative`) — layer: schema
- [x] Remove `hidden: true` from `outcomes[]` field — layer: schema
- [x] Add `challengeSummary` (`text`, optional) to `caseStudy` schema, group: `metadata` — layer: schema
- [x] Deploy schema: `npx sanity schema deploy` from `apps/studio/` — layer: schema
- [x] Update `caseStudyBySlugQuery` projection to include `challengeSummary` and enhanced `outcomes[]` fields — layer: GROQ
- [x] Render `challengeSummary` in `CaseStudyPage.jsx` above body / below MetadataCard — layer: frontend render
- [x] Render `outcomes[]` as a structured table or card strip on the case study detail page — layer: frontend render

**Phase 2 — Content editorial pass:**
- [x] Run activation audit query (see Technical notes) to read current body copy across all case studies — layer: content
- [x] Editorial pass on all case study body copy to lead with outcome language — layer: content (Content Write Gate fires for every patch)
- [x] Populate `outcomes[]` and `challengeSummary` fields for all case studies where evidence exists — layer: content (Content Write Gate fires for every patch)

## Phases

Two phases — schema deploy must complete before content phase:

- **Phase 1:** Schema enhancement + GROQ update + frontend render (no Sanity content touched)
- **Phase 2:** Content editorial pass — all body copy + field population (Content Write Gate for every document)

Do not begin Phase 2 until Phase 1 is committed and schema is deployed.

## Acceptance criteria

- [x] `outcomes[]` is no longer `hidden: true`; it appears in Studio under the Metadata group with enhanced fields
- [x] `challengeSummary` field appears in Studio under the Metadata group
- [x] `npx sanity schema deploy` runs without errors after schema changes
- [x] GROQ probe: `*[_type == "caseStudy"][0]{ challengeSummary, outcomes }` returns expected shape via MCP
- [x] `caseStudyBySlugQuery` projection includes `challengeSummary` and all `outcomes[]` subfields
- [x] Both fields render on a live case study detail page without runtime errors
- [x] All case study body copy leads with client outcome language — verified by reading published docs via GROQ
- [x] All `outcomes[]` arrays populated where measurable evidence exists
- [x] Content Write Gate satisfied for every patch: before/after proposal table produced and approved before each patch executes
- [x] Anti-slop compliance: no em dashes, no AI vocabulary, no hedge stacking in any rewritten copy

## Technical notes

- **Activation audit** — run before writing any code:
  ```groq
  *[_type == "caseStudy"]{ _id, title, "slug": slug.current, outcomes, challengeSummary, "bodyStart": pt::text(body)[0..300] }
  ```
  Read current `outcomes[]` values and body copy shape across all case studies to scope the content pass and confirm field population gaps.
- **`value` → `valueAfter` rename** — existing `outcomes[]` items in Sanity have a `value` field. The schema rename to `valueAfter` is a new field declaration; existing stored data uses the old key. A migration script is needed to copy `value` → `valueAfter` on all existing outcome items before Phase 2. Dry-run first; count must match `count(*[_type == "caseStudy" && defined(outcomes)])`.
- **Content Write Gate** fires for all Sanity copy patches in Phase 2 — before/after proposal table required before any patch. Non-negotiable.
- **Tool rule**: `patch_document_from_json` for all content writes — no AI rewriting layer.
- **Schema deploy required before Phase 2**: MCP writes fail against undeployed schema.
- **Upstream dependency**: SUG-90 (consulting pivot) should be complete — outcome framing vocabulary in SUG-90 Services and About pages informs the register for case study outcomes copy.
- **Doc Type Coverage**: `caseStudy` only. `article`, `node`, `page`, `archivePage` are not in scope.
- **Model recommendation**: `/model opusplan` for Phase 1 (schema + render decisions); `/model sonnet` for Phase 2 (content only).
- **`outcomesSummary` is not being added**: it was considered and rejected — it would duplicate `outcomes[]` and violate Single Field Authority. Do not create it.

## Non-Goals

- `outcomesSummary` flat text field — rejected; duplicates `outcomes[]` (Single Field Authority violation)
- AEO/GEO retrieval fields (`aeoSummary`, `geoSummary`, `keyQuestions[]`, `faq[]`) — deferred to [SUG-93](https://linear.app/sugartown/issue/SUG-93)
- `answerBlock` / `proofPoint` reusable schema objects — deferred to [SUG-94](https://linear.app/sugartown/issue/SUG-94)
- `platforms[]` split from `tools[]` — deferred to [SUG-94](https://linear.app/sugartown/issue/SUG-94)
- Discovery metadata fields (`industry[]`, `companySize`, `region`) — deferred to [SUG-92](https://linear.app/sugartown/issue/SUG-92)
- `engagementModel` field — rejected; duplicates existing `contractType` (Single Field Authority violation)
- New case study pages or archive redesign
- Case study card or MetadataCard structural changes (see SUG-89)
- Photography or media updates
- `article` or `node` schema changes

## Layout mockup

What the case study detail page looks like after Phase 1 render + Phase 2 content population.
The mockup uses Bare Minerals as the reference case (clearest before/after evidence).

```
┌─────────────────────────────────────────────────────────────────────┐
│  HERO (full-bleed)                                                  │
│                                                                     │
│  Bare Minerals: From Bottlenecks to Brilliance                      │
│  Creative operations at scale                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┬───────┐
│  METADATA CARD (full-span)                                  │       │
│  Author | Type | Client | Contract | Role | Published       │       │
│  Tools | Categories | Tags                                  │       │
├─────────────────────────────────────────────────────────────┤  S    │
│                                                             │  I    │
│  CHALLENGE  ← mono caps label                               │  D    │
│  ┃                                                          │  E    │
│  ┃  Bare Minerals' in-house digital creative team was       │  B    │
│  ┃  managing a major DemandWare e-commerce redesign         │  A    │
│  ┃  and a constant stream of campaigns simultaneously,      │  R    │
│  ┃  with no workload visibility, unclear approval           │       │
│  ┃  processes, and a high volume of last-minute rush        │       │
│  ┃  requests. A department relocation from San Francisco    │       │
│  ┃  to New York was also in progress…                       │       │
│                                                             │       │
├─────────────────────────────────────────────────────────────┤       │
│                                                             │       │
│  OUTCOMES  ← mono caps label + rule                         │       │
│                                                             │       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────┐│       │
│  │ PRODUCTIVITY│ │  TURNAROUND │ │    ASSETS   │ │  BAU  ││       │
│  │             │ │    TIME     │ │  GOVERNANCE │ │CONTIN.││       │
│  │  baseline   │ │   8 weeks   │ │  No central │ │       ││       │
│  │      ↓      │ │      ↓      │ │    system   │ │       ││       │
│  │ +40%        │ │   5 weeks   │ │  Celum DAM  │ │  BAU  ││       │
│  │             │ │             │ │   launched  │ │  held ││       │
│  │ Achieved    │ │ Freed       │ │ Centralized │ │through││       │
│  │ through     │ │ capacity    │ │ assets with │ │ both  ││       │
│  │ process     │ │ for high-   │ │ lifecycle   │ │relo + ││       │
│  │ redesign    │ │ value work  │ │ controls    │ │redsign││       │
│  │             │ │             │ │             │ │       ││       │
│  │ [measured]  │ │ [measured]  │ │ [measured]  │ │[qual] ││       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────┘│       │
│                                                             │       │
├─────────────────────────────────────────────────────────────┤       │
│                                                             │       │
│  BODY SECTIONS (existing)                                   │       │
│                                                             │       │
│  ## Overview                                                │       │
│  [prose]                                                    │       │
│                                                             │       │
│  ## Challenge                                               │       │
│  [existing detail]                                          │       │
│                                                             │       │
│  ## My Role                                                 │       │
│  [existing detail]                                          │       │
│                                                             │       │
│  ## Process                                                 │       │
│  [existing detail]                                          │       │
│                                                             │       │
│  ## Key Outcomes                                            │       │
│  [existing detail]                                          │       │
│                                                             │       │
│  ## Reflection                                              │       │
│  [existing detail]                                          │       │
└─────────────────────────────────────────────────────────────┴───────┘
```

### Notes

- **Challenge block** renders only when `challengeSummary` is populated. Left border accent in `--st-color-brand-primary` (pink). Subtle `--st-color-bg-subtle` wash.
- **Outcomes strip** renders only when `outcomes[]` has items. Card grid auto-fills at `minmax(220px, 1fr)`. Cards show: metric label (mono caps) → before (struck-through muted) → after (pink, heading weight) → impact statement → evidence type chip.
- **Evidence chip** is a single neutral token style. Per-state colour differentiation deferred (needs `--st-status-*` tokens, flagged as follow-up).
- **Sidebar column** activates at 1024px when sidebar has content. Challenge and outcomes both use `.detailPageFullSpan` so they span both columns.
- Both blocks sit between MetadataCard and body sections. Prospects get the brief at the top; the full narrative is still there for those who scroll.

## Related

- **Linear:** [SUG-91](https://linear.app/sugartown/issue/SUG-91)
- **SUG-90:** Consulting pivot — the strategic driver that elevates this epic
- **SUG-92:** [Case study discovery metadata](https://linear.app/sugartown/issue/SUG-92) — additive metadata fields (industry, companySize, region), no content rewrites
- **SUG-93:** [Case study AEO/GEO content layer](https://linear.app/sugartown/issue/SUG-93) — structured retrieval fields (aeoSummary, geoSummary, keyQuestions[])
- **SUG-94:** [Structured retrieval objects + JSON-LD](https://linear.app/sugartown/issue/SUG-94) — answerBlock, proofPoint, platforms[] split, JSON-LD renderer
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage Audit, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation
