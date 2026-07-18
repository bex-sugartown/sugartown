---
**Epic:** SUG-226 — Retrofit orphaned Portable Text annotation types in legacy content
**Linear Issue:** [SUG-226](https://linear.app/sugartown/issue/SUG-226)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-226 — Retrofit orphaned Portable Text annotation types in legacy content

Several live documents carry Portable Text markDef `_type` values that don't match any annotation currently registered in the schema or the frontend renderer. Investigate root cause, decide a fix path, and retrofit the affected content so the intended glossary popovers and citation markers actually render.

## Background

Surfaced as a side effect of SUG-215's Phase 3 retrofit audit (2026-07-18), which swept `sections[].content[].markDefs[]` across all `article`/`node`/`caseStudy` documents looking for `citationRef` usage. The same query incidentally surfaced markDef `_type` values that aren't `link`, `citationRef`, or `glossaryTermRef` — the only three annotations `apps/studio/schemas/objects/portableTextConfig.ts` registers today: `termRef`, `glossaryTerm` (missing the `Ref` suffix), and `annotationRef`.

Confirmed against `apps/web/src/lib/portableTextComponents.jsx` (lines ~97-115): the frontend's Portable Text mark-component map only handles `citationRef`, `glossaryTermRef`, and `link`. There is no component registered for `termRef`, `glossaryTerm`, or `annotationRef`, so `@portabletext/react` falls through to unstyled plain text for those spans — the mark is stored correctly but never resolves visually. Not a crash; a silent content-fidelity gap. Same class of bug as SUG-216 (`calloutSection.body`'s missing `glossaryTermRef` projection), but a different mechanism: SUG-216 is a query-projection gap, this is a genuinely orphaned/unregistered annotation type name, most likely legacy data predating a schema rename that was never retrofitted into existing content.

Documents found carrying one of these orphaned types (from the SUG-215 audit query — this list is not guaranteed exhaustive, since that audit's primary target was `citationRef`, not these other types; Phase 1 here re-runs and broadens it):

| Document | `_id` | Orphaned type found |
|---|---|---|
| Architecture: The Sugartown Digital Ecosystem (v1.0) | `wp.node.1023` | `termRef` |
| Architecture Decision: The Two-Repo Solution | `wp.node.1028` | `termRef` |
| DevOps: Building the "Undo" Button for My Career | `wp.node.994` | `termRef` |
| Architecture Update: The Resume Factory v2.0 | `wp.node.1121` | `glossaryTerm` |
| Confession: I Don't Lack Memory, I Just Forgot to Mention Projects | `wp.node.1397` / `drafts.wp.node.1397` | `glossaryTerm` |
| AI Illustration Review: Ethics, Accessibility & IP Guardrails | `wp.node.1654` | `annotationRef` |

Reference surfaces: `apps/studio/schemas/objects/portableTextConfig.ts` (the three registered annotation types), `apps/web/src/lib/portableTextComponents.jsx` (frontend mark-component map, confirmed missing handlers), the affected documents above.

## Objective

After this epic, every inline span in published/draft `article`/`node`/`caseStudy` content that was meant to carry a glossary-term or citation annotation actually renders as one — either because the orphaned type names are given rendering support (if migrating the content is judged riskier than adding a compatibility path), or because the affected markDefs are migrated to the current canonical type name (`glossaryTermRef`/`citationRef`) via Content Write Gate-approved patches. The retrofit audit is broadened beyond `sections[].content[]` to also cover the `compactPortableText`-consuming fields (`calloutSection.body`, accordion panel content, card descriptions) and `cardBuilderItem.body`, which use a separate PT config and were not checked by SUG-215's audit.

Layers touched: content (read-only audit query, then Content-Write-Gate-approved patches if migration is the chosen path), Sanity schema (only if the decision requires a schema-level compatibility alias — not expected, but not ruled out until Phase 1 completes), frontend (`portableTextComponents.jsx`, only if backward-compatible rendering support is the chosen path instead of migration), documentation (record the decision and final state).

## Scope

- [ ] **Broaden the retrofit audit** — layer: content (read-only query). Re-run the orphaned-type sweep against `sections[].content[]` (already covered by SUG-215, re-verify since content may have changed) plus `calloutSection.body`, `accordionSection` panel content, card descriptions, and `cardBuilderItem.body` — anywhere `compactPortableText` or `standardPortableText` is consumed. Produce a complete, current list of affected documents and exact markDef `_key`/`_type` values.
- [ ] **Investigate root cause** — layer: documentation/git-history. Search schema git history (`git log -p` / `git log -S` on `portableTextConfig.ts` and any prior glossary/citation annotation schema files) to confirm whether `termRef`/`glossaryTerm`/`annotationRef` are pre-rename legacy names, and if so, what they were renamed to and when, so the migration path (if chosen) maps each orphaned type to the correct current equivalent rather than guessing.
- [ ] **Decide the fix path** — layer: schema/frontend/content, decision only. Either (a) add rendering support for the legacy type names in `portableTextComponents.jsx` as a permanent or transitional compatibility layer, or (b) migrate the affected markDefs' `_type` (and any field-shape differences, e.g. `glossaryTerm` may not carry the same `term` reference field shape as `glossaryTermRef` — verify before assuming a simple rename) to the current canonical annotation via Content Write Gate-approved patches. This decision must be reviewed with Bex before execution begins, per the same pattern SUG-215 used — a rendering fix and a content migration are very different asks with different risk profiles.
- [ ] **Execute the chosen fix** — layer: schema/frontend/content, depends on the Scope item above. If (a): add the component handler(s) to `portableTextComponents.jsx`. If (b): patch each affected document's markDefs through the Content Write Gate (before/after proposal, explicit approval, then patch).
- [ ] **Retrofit-audit close-out** — layer: content verification. Re-run the broadened audit query post-fix and confirm zero remaining orphaned-type matches (or an explicit, documented list of any intentionally left as-is, with reasoning).

## Phases

**Phase 1 — Diagnose and decide.** Broaden and re-run the retrofit audit (Scope items 1-2), investigate root cause via schema git history (Scope item 2), and produce a written decision: backward-compatible rendering support vs. content migration (Scope item 3). Review this decision with Bex before Phase 2 begins.

**Phase 2 — Implement.** Execute the decided fix (Scope item 4) and close out the retrofit audit (Scope item 5), verifying via re-fetch and rendered-page check that previously-orphaned spans now render as intended (glossary popover or citation marker, not plain text).

## Acceptance criteria

- [ ] A complete, current list of documents/fields carrying an orphaned annotation type exists, covering both `sections[].content[]` and every `compactPortableText`-consuming field
- [ ] A written root-cause explanation exists for why `termRef`/`glossaryTerm`/`annotationRef` exist in live content but aren't registered in the current schema (confirmed via git history, not assumed)
- [ ] A fix-path decision (backward-compatible rendering vs. content migration) is explicitly reviewed with and approved by Bex before execution
- [ ] If content migration is chosen: every patch goes through the Content Write Gate (before/after proposal, explicit approval) before being applied
- [ ] Post-fix, the broadened retrofit audit query returns zero orphaned-type matches, or any remaining matches are explicitly documented with reasoning for being left as-is
- [ ] Each previously-affected document is spot-checked on the rendered page (or in Presentation/preview mode) to confirm the glossary popover or citation marker now displays correctly

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. If the chosen fix path touches `portableTextComponents.jsx`, verification happens by viewing the specific affected documents' rendered pages (listed in Background), not a general component/CSS walkthrough.

## Technical notes

- **Content Write Gate**: fires if the Phase 1 decision is content migration — every markDef `_type` patch is copy/data-adjacent content, so the standard before/after proposal flow applies per document before any patch.
- **Schema changes**: not expected, but not ruled out — if Phase 1 finds a case where a schema-level compatibility alias is genuinely the safer fix (e.g. a shape mismatch between `glossaryTerm` and `glossaryTermRef` that can't be resolved by a simple `_type` rename), that would require a schema change and `npx sanity schema deploy`, scoped and reviewed at that point per CLAUDE.md's "Studio schema changes get their own commit" rule.
- **Upstream dependencies**: none blocking. Related to SUG-215 (source of the incidental finding) and SUG-216 (same bug class, different mechanism) — cross-referenced, not blocking either direction.
- **Activation audits** (do these before writing anything):
  1. Read `apps/studio/schemas/objects/portableTextConfig.ts` and `apps/web/src/lib/portableTextComponents.jsx` in full to reconfirm the exact registered annotation types haven't changed since this epic was scoped (2026-07-18).
  2. Run the broadened GROQ audit query across `sections[].content[]`, `calloutSection.body`, accordion panel content, card descriptions, and `cardBuilderItem.body` for any markDef `_type` not in `["link", "citationRef", "glossaryTermRef"]`.
  3. Run `git log -p --follow` (or `-S<term>`) on `apps/studio/schemas/objects/portableTextConfig.ts` and any historical glossary/citation-related schema files to establish the actual rename history, if any, before assuming `termRef` → `glossaryTermRef` and `glossaryTerm` → `glossaryTermRef` are the correct mappings.
  4. For each affected document, fetch the actual markDef object (not just its `_type`) to check whether its field shape matches the current `glossaryTermRef`/`citationRef` object shape (e.g. does `termRef`/`glossaryTerm` carry a `term` reference field the same way `glossaryTermRef` does?) — a shape mismatch changes whether migration is a simple `_type` rename or needs a data transform.
- **Model & Mode [REQUIRED]:** `/model sonnet` — bounded content/schema audit and fix, same shape as SUG-215 and SUG-216. Sonnet 5 executes directly; the Phase 1 decision has some open-endedness but is scoped to a known, small document set, not a system-wide redesign.

## Model & Mode [REQUIRED]

`/model sonnet` — see Technical notes above.

## Non-Goals

- Not a redesign of the annotation/glossary/citation system as a whole.
- Not related to SUG-215's citationRef-in-nested-fields investigation beyond sharing an audit query as the discovery mechanism — SUG-215 resolved as "not reproducible, no action needed"; this is a distinct, unrelated data-hygiene gap.
- Not expanding scope to re-audit every PT field in the schema for unrelated issues — scoped specifically to orphaned/unregistered annotation `_type` values.

## Related

- **Linear:** [SUG-226](https://linear.app/sugartown/issue/SUG-226)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **SUG-215** (`docs/backlog/SUG-215-fix-citationref-footnote-lock-in-section-content.md` or `docs/shipped/` once shipped) — source of the incidental finding via its Phase 3 retrofit audit; otherwise unrelated
- **SUG-216** (`docs/backlog/SUG-216-enable-glossary-terms-citations-callout-mini-pt.md`) — same bug class ("mark type stored correctly, doesn't resolve at render time"), different mechanism (query-projection gap there vs. genuinely orphaned type name here)
