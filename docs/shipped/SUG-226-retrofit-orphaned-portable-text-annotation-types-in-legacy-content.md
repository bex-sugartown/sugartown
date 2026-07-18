---
**Epic:** SUG-226 — Retrofit orphaned Portable Text annotation types in legacy content
**Linear Issue:** [SUG-226](https://linear.app/sugartown/issue/SUG-226)
**Status:** Done — shipped 2026-07-18 (content-only, no code changes, no version bump)
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

- [x] **Broaden the retrofit audit** — layer: content (read-only query). Swept `sections[].content[]`, `calloutSection.body`, `accordionSection` items, `cardBuilderSection.cards[].body`, and the legacy top-level `content` field across all `article`/`caseStudy`/`node`/`page` documents (94 total). Result: orphaned types found only in `sections[].content[]`, on the exact same 6 documents SUG-215's narrower audit already found — zero additional occurrences.
- [x] **Investigate root cause** — layer: documentation/git-history. `git log -S`/`--follow` on `portableTextConfig.ts` found `glossaryTermRef` and `citationRef` were cleanly introduced (SUG-35, EPIC-0169) and never renamed from anything — `termRef`/`glossaryTerm`/`annotationRef` never existed in this repo's schema history. Fetched the actual referenced documents: all three orphaned types resolve to real `glossaryTerm` docs, but with three *different* internal shapes (not one migration script's single, if wrong, transform). Revised conclusion: not pre-rename legacy data as originally hypothesized — more likely repeated ad hoc authoring across separate sessions, each guessing a plausible annotation name without checking the registered schema, since Sanity's write API doesn't validate markDef `_type` against schema (only Studio's editor does).
- [x] **Decide the fix path** — layer: schema/frontend/content, decision only. Migration (not compatibility rendering) — approved by Bex. All 7 occurrences (6 documents) mapped cleanly to `glossaryTermRef`: 3 `termRef` instances already had the correct `term` field shape (pure `_type` rename); 3 `glossaryTerm` instances needed both a `_type` rename and a field-key rename (`reference` → `term`); 1 `annotationRef` instance needed restructuring from a flat `_ref` into the nested `term: {_ref}` shape.
- [x] **Execute the chosen fix** — layer: content. Patched all 6 documents via `patch_documents`, targeting each markDef by its own `_key` path (kept `_key` unchanged throughout, so no span `marks[]` references broke). Verified via direct re-fetch, not just trusting the patch response. Reviewed and published by Bex in Studio.
- [x] **Retrofit-audit close-out** — layer: content verification. Re-ran the broadened audit post-fix (both drafts and published perspective): zero orphaned-type matches remain. `wp.node.1654` shows as draft-only on published perspective (it was never published, before or after this fix) — the corrected markDef is present in its draft, ready whenever that document ships on its own schedule; not a gap in this epic's work.

## Phases

**Phase 1 — Diagnose and decide.** Broadened audit found no new affected fields beyond SUG-215's original 6 documents. Root-cause investigation revised the original hypothesis (not pre-rename legacy data — ad hoc authoring instead). Migration decision reviewed with and approved by Bex.

**Phase 2 — Implement.** Executed the migration across all 6 documents, verified via re-fetch, reviewed and published by Bex. Retrofit-audit close-out confirmed clean.

## Acceptance criteria

- [x] A complete, current list of documents/fields carrying an orphaned annotation type exists, covering both `sections[].content[]` and every `compactPortableText`-consuming field — see Scope item 1
- [x] A written root-cause explanation exists for why `termRef`/`glossaryTerm`/`annotationRef` exist in live content but aren't registered in the current schema (confirmed via git history, not assumed) — see Scope item 2; conclusion revised from the epic's original hypothesis based on actual evidence
- [x] A fix-path decision (backward-compatible rendering vs. content migration) is explicitly reviewed with and approved by Bex before execution — approved
- [x] If content migration is chosen: every patch goes through the Content Write Gate (before/after proposal, explicit approval) before being applied — before/after table presented and approved before any patch
- [x] Post-fix, the broadened retrofit audit query returns zero orphaned-type matches, or any remaining matches are explicitly documented with reasoning for being left as-is — zero matches, confirmed on both drafts and published perspective
- [x] Each previously-affected document is spot-checked on the rendered page (or in Presentation/preview mode) to confirm the glossary popover or citation marker now displays correctly — reviewed and published by Bex in Studio

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. If the chosen fix path touches `portableTextComponents.jsx`, verification happens by viewing the specific affected documents' rendered pages (listed in Background), not a general component/CSS walkthrough.

## Close-out summary (2026-07-18)

- **No commits** — this epic touched zero repo files. All work was a Sanity content migration (6 `patch_documents` calls) plus read-only investigation (GROQ audits, `git log`). No mini-release — nothing new to deploy, consistent with prior content-only epics (e.g. SUG-199).
- **Root-cause finding revised mid-epic**: the epic's original "pre-rename legacy data" hypothesis didn't hold up once checked against actual git history — no evidence any of these type names were ever registered schema. Landed on a different, evidence-backed explanation instead of forcing the original guess to fit.
- **Published state**: 5 of 6 documents confirmed live on published perspective. The 6th (`wp.node.1654`) was draft-only before this epic and remains draft-only — its fix is present in the draft, not a gap.
- **Reviewed and published by Bex** directly in Studio.

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
