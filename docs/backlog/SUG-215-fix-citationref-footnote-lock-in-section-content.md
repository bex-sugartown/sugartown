---
**Epic:** SUG-215 — Fix citationRef footnote lock in section content
**Linear Issue:** [SUG-215](https://linear.app/sugartown/issue/SUG-215/fix-citationref-footnote-lock-in-section-content)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-215 — Fix citationRef footnote lock in section content

The `citations[]` / `citationRef` footnote system locks Portable Text editing in Studio (toolbar grayed out, style dropdown locked) whenever a `citationRef` markDef is used inside `sections[].content` (a `textSection`) — the primary body-content field for case studies, articles, and nodes. Fix the root cause, or formally deprecate the feature for that context and document the canonical workaround, so this stops being a trap for the next writer who wants a footnote.

## Background

`caseStudy`, `article`, and `node` all ship a document-level `citations[]` array intended to back numbered `[1]`/`[2]` footnote markers placed via a `citationRef` annotation inline in body content. That annotation is included in `standardPortableText` (`apps/studio/schemas/objects/portableTextConfig.ts`), which is exactly the config used by `textSection.content` — the section type editors actually use for body copy on all three document types (each of the three also has a `content` (Legacy) top-level field, but it's deprecated in favor of `sections[]`).

CLAUDE.md already documents the failure mode from a past incident: adding a `citationRef` markDef to a block inside a nested array field like `sections[].content` locks the entire Portable Text field in Studio, because the annotation is only resolvable at the document level, not inside a nested array. The fix on record is a manual recovery sequence (`unset` the `markDefs` field on each affected block, one call per block) — a repair procedure, not a prevention. No epic has investigated whether this is fixable at the schema/Studio-config level, or whether it needs to be formally retired for this context.

This surfaced live during a `/red-pen` editorial pass on the case study "Sugartown: The Platform Is the Portfolio" (2026-07-16) — a footnote was needed for a film citation in the Overview section's `textSection.content`, and the only safe option was a plain inline `link` annotation instead of the structured footnote the writer actually asked for. The `caseStudy` schema's own field description for `citations[]` says its entries are for markers "placed in section content via the Citation Reference annotation" — the schema promises a capability that's broken for the exact field type it names.

Reference surfaces: `apps/studio/schemas/objects/portableTextConfig.ts` (the annotation config), `apps/studio/schemas/objects/citationItem.ts`, `apps/studio/schemas/documents/{caseStudy,article,node}.ts` (`citations[]` field + `sections[]` field), `apps/web/src/lib/portableTextComponents.jsx` (frontend rendering of `citationRef`, unaffected by this bug but in scope to confirm), CLAUDE.md §"Portable Text blocks written via MCP — required fields" (existing gotcha note to be updated once this resolves).

## Objective

After this epic, one of two things is true and documented: (a) `citationRef` markDefs work correctly inside `sections[].content` — verified by adding a real footnote through Studio's UI and confirming the toolbar and style dropdown stay usable afterward — or (b) `citationRef` is formally removed from the annotation list for section-content PT configs, CLAUDE.md is updated to state this plainly instead of just documenting a repair procedure, and the plain `link` annotation is documented as the canonical inline-citation pattern for section content. Either way, no future writer or AI session should have to rediscover this failure mode by hitting it.

Layers touched: Sanity schema (`apps/studio/schemas/objects/portableTextConfig.ts`, possibly `citationItem.ts`), Sanity Studio config/behavior (verified manually in Studio, no custom input component work anticipated but not ruled out), documentation (CLAUDE.md), and a one-time content audit (no code layer, GROQ read only). Explicitly not touching the frontend PT renderer (`portableTextComponents.jsx`) unless Phase 1 diagnosis finds a rendering-layer cause, which is not expected — this reads as a Studio-editor-only bug, not a data or render bug.

## Scope

- [ ] **Reproduce and diagnose the exact failure mode** — layer: schema/Studio. Confirm whether the lock is a genuine Sanity Studio limitation (annotation types can only resolve references scoped to the document root, not into nested arrays) or a fixable misconfiguration in this repo's schema.
- [ ] **Decide and document the resolution path** — layer: schema/documentation. Either a concrete schema/config fix, or a formal deprecation of `citationRef` for `sections[].content` with the `link`-annotation workaround documented as canonical.
- [ ] **Implement the decided fix** — layer: schema. If fixable: the schema/Studio config change. If not fixable: remove `citationRef` from the annotation list in the PT configs used by section content (`standardPortableText`, `compactPortableText` as applicable), leaving it available only in genuinely top-level, non-nested fields where it already works safely.
- [ ] **Retrofit audit of published content** — layer: content (read-only query, not a patch). Query all published `caseStudy`, `article`, and `node` documents for any `citationRef` markDef currently sitting inside a `sections[].content` block, to confirm nothing live is silently locked right now. Any finding goes through the standard Content Write Gate proposal flow if a patch is needed — this epic does not silently touch content.
- [ ] **Update CLAUDE.md** — layer: documentation. Replace the current "recovery sequence" framing with the epic's actual resolution (fixed, or formally deprecated-with-workaround), so the guidance reflects the real, current state instead of a workaround for an unexamined bug.

## Phases

**Phase 1 — Diagnose and decide.** Reproduce the lock on a real `sections[].content` field (scratch/test document, not live content), confirm the exact symptom and root cause, and read Sanity's official docs on Portable Text annotations and nested array field resolution (`search_docs`/`read_docs` via the Sanity MCP) to establish whether this is a known product limitation. Produce a written decision: fix, or formally deprecate. This decision must be reviewed with Bex before Phase 2 begins — it determines whether Phase 2 is a schema change or a schema *removal* plus a documentation update, which are very different asks.

**Phase 2 — Implement.** Execute the Phase 1 decision: either the concrete fix, or the annotation-list removal + CLAUDE.md rewrite. Verify in Studio directly (add a footnote through the actual Studio UI on a test document, confirm the field stays editable).

**Phase 3 — Retrofit audit.** Query published content for any existing instance of the broken pattern. If found, propose fixes through the Content Write Gate before patching.

## Acceptance criteria

- [ ] A written root-cause explanation exists for why `citationRef` locks nested `sections[].content` fields in Studio (or why it doesn't, if Phase 1 finds the failure mode is something else entirely)
- [ ] Either: a real footnote can be added to a `textSection.content` field through Studio's UI without locking the toolbar (verified manually, not just by re-fetching JSON) — or: `citationRef` no longer appears as an available annotation option in section-content PT configs, confirmed by opening Studio and checking the annotation toolbar
- [ ] The retrofit audit query has run against all published `caseStudy`, `article`, and `node` documents, and any findings are either fixed (via Content Write Gate-approved patches) or explicitly listed as "found, not yet fixed, tracked separately"
- [ ] CLAUDE.md's citation-related gotcha section reflects the actual current state post-epic, not the pre-epic workaround
- [ ] If schema changed: `npx sanity schema deploy` has been run and confirmed (MCP write against a test document using the new/changed annotation succeeds)

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, layout token, or multi-page component changes. This epic is Sanity Studio schema/config work; verification happens by editing content directly in Studio (add/remove a footnote, confirm the PT toolbar stays interactive), not by viewing rendered pages on the public site.

## Technical notes

- **Content Write Gate**: does not fire for the schema/config work itself. It does fire if the Phase 3 retrofit audit finds live content with a broken `citationRef` markDef that needs patching — any such fix goes through the standard before/after proposal flow.
- **Schema changes**: likely, depending on the Phase 1 decision. If `citationRef` is removed from `standardPortableText`/`compactPortableText`'s annotation list, that's a schema change requiring `npx sanity schema deploy` before MCP writes will reflect it. If the fix is a Studio-level resolution config change instead, confirm during Phase 1 whether that also requires a schema deploy.
- **Upstream dependencies**: none. This is a self-contained schema/tooling epic.
- **Activation audits** (do these before writing anything):
  1. Read `apps/studio/schemas/objects/portableTextConfig.ts` in full — confirm every PT config that includes `citationRef` as an annotation, and cross-reference which document/section fields use each config (not just `textSection` — check `compactPortableText`'s consumers too, e.g. accordion panels, callout bodies, card descriptions).
  2. Read `apps/studio/schemas/objects/cardBuilderItem.ts`'s `citationRef` usage — confirm whether its citation field is document-adjacent (safe) or similarly nested (also broken), since CLAUDE.md's note only calls out `textSection.content` by name.
  3. Use the Sanity MCP's `search_docs`/`read_docs` tools to check for official Sanity documentation on annotation reference resolution scope and nested array fields, before assuming this is fixable or unfixable — verify against current docs, not memory.
  4. Reproduce the lock directly: patch a `citationRef` markDef into a `sections[].content` block on a scratch/non-production document (create one for this purpose — do not use live content), then open that document in Studio and confirm the exact failure (toolbar state, console errors if any, style dropdown state).
  5. Query all published `article`, `caseStudy`, and `node` documents for existing `citationRef` markDefs inside `sections[].content` to scope Phase 3 before committing to it as a single bullet — if the corpus is large, it may need its own sub-phase.
- **Model & Mode [REQUIRED]:** `/model sonnet` — this is bounded schema/Studio-config diagnosis and a fix or documented deprecation, not an architecture epic (no SSR, monorepo-boundary, or cross-cutting ERD decisions). Sonnet 5 executes directly; the Phase 1 diagnosis has some open-endedness but is scoped to one schema file and one Studio behavior, not a system-wide redesign.

## Model & Mode [REQUIRED]

`/model sonnet` — see Technical notes above. No plan-mode handoff needed; the Phase 1 diagnosis step is itself the investigation, not a separate planning exercise.

## Non-Goals

- Not a redesign of the citation/footnote system's UX or data model beyond fixing (or formally retiring) the nested-field failure mode.
- Not touching `cardBuilderItem`'s citation field unless the Phase 1 activation audit finds it shares the same bug — if it's a different (safe) pattern, leave it alone.
- Not building a pre-commit lint rule to catch future `citationRef`-in-nested-field mistakes automatically — if Phase 1 concludes the fix is "remove the annotation option entirely," the schema change itself prevents recurrence and a separate lint layer is redundant. If Phase 1 instead concludes a genuine fix is possible and `citationRef` remains available, revisit whether a lint/validator guard is warranted as a follow-up epic — not in scope here.
- Not migrating any content off the `citations[]`/`citationRef` system as a whole — only addressing the specific nested-field failure mode.

## Related

- **Linear:** [SUG-215](https://linear.app/sugartown/issue/SUG-215/fix-citationref-footnote-lock-in-section-content)
- **CLAUDE.md:** §"Portable Text blocks written via MCP — required fields" — the existing gotcha note this epic will supersede or update
- **Prior incident:** `/red-pen` review of "Sugartown: The Platform Is the Portfolio" (2026-07-16) — `docs/reviews/red-pen/2026-07-16-sugartown-platform-is-the-portfolio.md`, Gate 2 application log item #7, where the plain-link workaround was used in place of a real footnote
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
