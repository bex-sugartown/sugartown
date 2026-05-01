---
**Epic:** SUG-91 — Case study outcomes narrative
**Linear Issue:** [SUG-91](https://linear.app/sugartown/issue/SUG-91)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-91 — Case study outcomes narrative

Shift existing case study body copy from process narrative to client outcomes framing: what changed, what was delivered, measurable impact. High consulting conversion value — the case studies are the primary proof of work for prospective clients.

## Background

Case studies currently read as process narratives: "I built X using Y." This positions Bex as an implementer rather than a value-deliverer. For consulting conversion, prospective clients need to see outcomes — what changed for the client, what was delivered, and measurable impact where possible. The consulting pivot (SUG-90) elevates case studies as the primary proof-of-work surface. The current caseStudy schema does not have a dedicated outcome summary field; outcome language is buried in body copy if present at all. This epic may require a new schema field or may be a copy-only pass — the schema decision is the first gate at activation.

## Objective

After this epic, all case study body copy leads with client outcomes rather than process narrative. Optionally, a new `outcomesSummary` text field on the `caseStudy` schema surfaces a structured outcome statement above the body — the schema decision at activation determines whether this is a one-layer epic (content only) or a three-layer epic (schema + GROQ + render + content). Both paths require the Content Write Gate for all Sanity patches.

## Scope

The scope has two paths — the schema gate at activation resolves which applies:

**Path A — Schema field approach (if `outcomesSummary` field is warranted):**
- [ ] Add `outcomesSummary` (`text`, required) to `apps/studio/schemas/documents/caseStudy.ts` — layer: schema
- [ ] Deploy schema: `npx sanity schema deploy` from `apps/studio/` — layer: schema
- [ ] Update `caseStudyBySlugQuery` projection to include `outcomesSummary` — layer: GROQ
- [ ] Add outcome callout renderer to `CaseStudyPage.jsx` (above body, below MetadataCard) — layer: frontend render
- [ ] Editorial pass on all case study body copy to lead with outcomes — layer: content (Content Write Gate applies)

**Path B — Copy-only approach (if body copy edits alone suffice):**
- [ ] Editorial pass on all case study body copy to shift from process to outcome framing — layer: content (Content Write Gate applies)

Both paths share:
- [ ] **Schema decision documented** at activation: field approach or copy-only, with rationale
- [ ] **All case study body copy** reviewed and reframed where needed

## Phases

If schema field approach (Path A) is chosen, this is a two-phase epic:
- **Phase 1:** Schema + GROQ + render (schema deploy required before content phase)
- **Phase 2:** Content editorial pass on all case studies

If copy-only approach (Path B) is chosen, this is single-phase.

Declare the path at activation and update this section before execution begins.

## Acceptance criteria

- [ ] Schema decision documented at activation: field approach or copy-only, with rationale
- [ ] If schema field added: `npx sanity schema deploy` runs without errors; `*[_type == "caseStudy"]{ outcomesSummary }` returns expected fields via GROQ
- [ ] If schema field added: `caseStudyBySlugQuery` projection includes `outcomesSummary` and the field renders in the browser on a live case study page
- [ ] All case study body copy leads with client outcome language — verified by reading published docs via GROQ
- [ ] Content Write Gate satisfied for every patch: before/after proposal table produced and approved before each patch executes
- [ ] Anti-slop compliance: no em dashes, no AI vocabulary, no hedge stacking in any rewritten copy

## Technical notes

- **Schema decision gate** — run this query at activation before writing any code: `*[_type == "caseStudy"]{ _id, title, "slug": slug.current, "bodyStart": pt::text(body)[0..200] }` — read current body copy shape across all case studies to determine if an `outcomesSummary` field adds value or if body copy edits alone are sufficient
- **Content Write Gate** fires for all Sanity copy patches — before/after proposal table required before any patch. Non-negotiable.
- **Tool rule**: if schema field approach is chosen, `patch_document_from_json` for all content writes — no AI rewriting layer
- **Schema deploy required** (Path A only): MCP writes fail against undeployed schema. Always deploy before writing content.
- **Upstream dependency**: SUG-90 (consulting pivot) should be co-shipped or complete — the outcome framing language in SUG-90 Services and About pages informs the vocabulary for case study outcomes
- **Doc Type Coverage**: `caseStudy` only. `article`, `node`, `page`, `archivePage` are not in scope.
- **Activation audit** (Path A): read `apps/studio/schemas/documents/caseStudy.ts` and `apps/web/src/lib/queries.js` (`caseStudyBySlugQuery`) before writing any schema or query changes
- **Model recommendation**: `/model opusplan` if Path A (schema + render decisions needed); `/model sonnet` if Path B (copy only)

## Non-Goals

- New case study pages or archive redesign
- Case study card metadata changes (MetadataCard territory — see SUG-89)
- Photography or media updates
- Changes to the `caseStudy` schema beyond the `outcomesSummary` field (if added)
- `article` or `node` schema changes

## Related

- **Linear:** [SUG-91](https://linear.app/sugartown/issue/SUG-91)
- **SUG-90:** Consulting pivot — the strategic driver that elevates this epic
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage Audit, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation once the path (A or B) is decided
