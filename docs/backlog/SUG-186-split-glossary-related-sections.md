---
**Epic:** SUG-186 — Split glossaryTerm relatedTerms into dedicated sections (terms / tags / tools)
**Linear Issue:** [SUG-186](https://linear.app/sugartown/issue/SUG-186)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-186 — Split glossaryTerm relatedTerms into dedicated sections (terms / tags / tools)

Refactor the `glossaryTerm` schema so each relation type lives in its own field instead of one mixed `relatedTerms` array: a primary **related glossary terms** field, plus dedicated **tags** and **tools** sections.

## Background

The `glossaryTerm.relatedTerms` field is currently a single mixed array that accepts four member types (`glossaryTermRef`, `tagRef`, `categoryRef`, `toolRef`). In Studio this surfaces as one "Add item…" menu with four reference choices, which blurs the distinction between "see also" glossary cross-references and taxonomy tagging. Categories already have a separate top-level `categories[]` field (the "done" part of this split), so `categoryRef` inside `relatedTerms` is redundant. With 59 glossary terms now live (post SUG-185 batch), the relation model should be tidied before the corpus grows further.

## Objective

After this epic, `glossaryTerm` has three distinct relation fields: `relatedTerms` (glossary terms only — the primary "see also"), `relatedTags` (tag refs), and `relatedTools` (tool refs). The existing mixed-array data is migrated into the correct new fields, GROQ projections expose all three, and the glossary detail page renders them as separate labelled sections. Layers touched: **Sanity schema**, **migration script**, **GROQ query**, **React render**. Out of scope: the `categories[]` field (already separate), `relatedContent[]` (already its own field and correct), and any change to tag/tool/category schemas themselves.

## Scope

- [ ] Narrow `relatedTerms` to accept only `reference → glossaryTerm` — schema (`apps/studio/schemas/documents/glossaryTerm.ts`)
- [ ] Add `relatedTags` field (`array of reference → tag`) — schema
- [ ] Add `relatedTools` field (`array of reference → tool`) — schema
- [ ] Confirm `categoryRef` is removed from the relation menus (categories live in `categories[]`) — schema
- [ ] Deploy schema (`npx sanity schema deploy` from `apps/studio/`) so MCP/Content Lake accept the new shape — schema/tooling
- [ ] Migrate existing `relatedTerms` members: `tagRef` → `relatedTags`, `toolRef` → `relatedTools`, `categoryRef` → fold into `categories[]` (or drop if already present) — migration script
- [ ] Update `glossaryTermBySlugQuery` (and any glossary list projection) to project `relatedTerms`, `relatedTags`, `relatedTools` — query (`apps/web/src/lib/queries.js`)
- [ ] Render the three relations as separate labelled sections on the glossary detail page — frontend

## Phases

Single-phase by intent (merge strategy b). Internal ordering is strict: **schema + deploy → migration → query → render**. Schema must deploy before the migration script runs (MCP validates against the deployed schema). Nothing merges until the full chain is verified end to end.

## Acceptance criteria

- [ ] `glossaryTerm.relatedTerms` accepts only glossary-term references; the Studio "Add item…" menu for that field shows a single option ("Reference to glossary term")
- [ ] `relatedTags` and `relatedTools` exist as separate fields, each restricted to their respective type
- [ ] Schema is deployed and an MCP write to the new fields succeeds (per CLAUDE.md: schema not live until deployed)
- [ ] Migration moves every existing non-glossary ref out of `relatedTerms` with zero data loss; a post-migration GROQ check returns no `relatedTerms` member whose `_type != "reference"`/target type is not `glossaryTerm`
- [ ] `glossaryTermBySlugQuery` returns `relatedTerms`, `relatedTags`, `relatedTools` as distinct arrays
- [ ] Glossary detail page renders the three as separate sections with correct labels; a term with all three populated (e.g. a migrated one) displays correctly
- [ ] **Content Write Gate** applies to the migration: present a before/after proposal of which refs move where, approved before any patch runs

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, confirm the glossary detail route → component mapping (expected `TaxonomyDetailPage`/glossary detail component), and build the Human QA Walkthrough table per `docs/epic-template.md` §Human QA Walkthrough. Include one real published glossary slug that has tags/tools to migrate (capture and datestamp it) plus one term with only glossary-term relations as a regression guard. Confirm whether the relation sections share CSS with other detail-page relation blocks before changing any styles.

## Technical notes

- **Schema changes:** three fields affected. `relatedTerms` is narrowed (remove `tagRef`, `categoryRef`, `toolRef` members, keep glossary-term reference). New `relatedTags` (`array` of `reference → tag`) and `relatedTools` (`array` of `reference → tool`). Update the field `description`s so the new "see also" wording no longer claims it links tags/categories/tools. **Deploy required** (`npx sanity schema deploy`).
- **Content Write Gate:** fires for the migration. Produce a before/after table (document → ref moved → from field → to field) and wait for explicit approval before patching.
- **Activation audits:**
  - Query existing mixed data before migration:
    ```groq
    *[_type == "glossaryTerm" && count(relatedTerms[_type != "glossaryTermRef"]) > 0]{
      _id, term, relatedTerms[]{_type, _key, _ref}
    }
    ```
    (As of the SUG-185 batch, the 18 new terms use only `glossaryTermRef`; older terms may carry mixed refs — verify, do not assume.)
  - Read `apps/web/src/lib/queries.js` `glossaryTermBySlugQuery` (~line 1662) and the compact glossary projection (~line 1646) before editing.
  - Confirm `tag` and `tool` taxonomy `_id`s referenced by migrated data still exist (orphan check).
- **Migration mechanics:** prefer a `@sanity/client` migration script or `patch_documents` (set new arrays + unset moved members). Strong refs require targets to be published; all tag/tool targets already exist. Patch the draft, then publish.
- **Paired-field note:** none — `glossaryTerm` has no paired object/document schema.

### Schema field proposal

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `relatedTerms` (array of reference → glossaryTerm) | "See also" links to other glossary terms only | `[ref → "Structured content", ref → "CCMS"]` | Keeps the primary cross-reference field semantically clean (term-to-term) |
| `relatedTags` (array of reference → tag) | Tags this term is associated with | `[ref → "accessibility"]` | Separates taxonomy tagging from glossary cross-refs; enables tag-based glossary filtering later |
| `relatedTools` (array of reference → tool) | Tools relevant to this term | `[ref → "n8n", ref → "Sanity"]` | Lets a term point at the tools that embody it without polluting "see also" |

## Model & Mode [REQUIRED]

`/model opusplan` — Opus plans (Pre-Execution Gate, migration proposal, Files to Modify), Sonnet executes after plan-mode exit. Chosen because the epic spans schema + a data migration with a Content Write Gate + query + render, which needs a plan before code.

## Non-Goals

- The `categories[]` field — already a separate top-level field; this epic does not touch it beyond folding stray `categoryRef`s out of `relatedTerms`.
- `relatedContent[]` — already its own correctly-scoped field; unchanged.
- Schema changes to `tag`, `tool`, or `category` types themselves — only `glossaryTerm` is edited.
- Bidirectional/reverse-lookup surfacing of tags/tools on tag/tool detail pages — out of scope; this is forward references only.

## Related

- **Linear:** [SUG-186](https://linear.app/sugartown/issue/SUG-186)
- **Upstream:** SUG-185 (glossary term batch) — populated the corpus this refactor tidies
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
