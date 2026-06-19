---
**Epic:** SUG-186 — Related field refactor: glossaryTerm split + taxonomy-wide bidirectional sync
**Linear Issue:** [SUG-186](https://linear.app/sugartown/issue/SUG-186)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-186 — Related field refactor: glossaryTerm split + taxonomy-wide bidirectional sync

Two-part refactor: (1) split `glossaryTerm.relatedTerms` into dedicated fields per relation type; (2) add bidirectional sync so that adding A to B's related field automatically adds B to A's related field, across all content types that share a compatible related field.

## Background

**Part 1 — glossaryTerm split:** `glossaryTerm.relatedTerms` is a single mixed array accepting four member types (`glossaryTermRef`, `tagRef`, `categoryRef`, `toolRef`). Categories already have a separate top-level `categories[]` field, making `categoryRef` redundant. With 61 glossary terms now live, the relation model needs tightening before the corpus grows further.

**Part 2 — bidirectional sync (not previously built):** No automatic reverse-patching exists anywhere in the codebase. Adding a `related` link from article A to node B does not add A to B's `related` field — editors must manage both directions manually. This is error-prone and produces incomplete "see also" graphs. The feature should apply to all content-type pairs that share a compatible relation field. Three field surfaces support it based on the current schema topology:

1. `glossaryTerm.relatedTerms` ↔ `glossaryTerm.relatedTerms` — same field on both sides
2. `article.related` ↔ `node.related`, `article.related`, `caseStudy.related` — all three cross-type fields accept all three types
3. `node.related` ↔ same as above
4. `caseStudy.related` ↔ same as above

`glossaryTerm.relatedTags` and `glossaryTerm.relatedTools` (new fields from Part 1) are **not** candidates for bidirectional sync — `tag` and `tool` schemas have no back-ref field to mirror into without a separate schema change to those types.

## Objective

After this epic: (1) `glossaryTerm` has three distinct relation fields — `relatedTerms` (glossary terms only), `relatedTags` (tag refs), `relatedTools` (tool refs) — with existing data migrated; (2) a Studio mechanism ensures that when an editor adds doc A to doc B's `related` (or `relatedTerms`) array and publishes, doc A is automatically patched to include doc B in its own matching field. Layers touched: **Sanity schema**, **Studio plugin/document action**, **migration script**, **GROQ query**, **React render**.

## Scope

### Part 1 — glossaryTerm schema split

- [ ] Narrow `relatedTerms` to accept only `reference → glossaryTerm` — schema (`apps/studio/schemas/documents/glossaryTerm.ts`)
- [ ] Add `relatedTags` field (`array of reference → tag`) — schema
- [ ] Add `relatedTools` field (`array of reference → tool`) — schema
- [ ] Confirm `categoryRef` is removed from the relation menus (categories live in `categories[]`) — schema
- [ ] Deploy schema (`npx sanity schema deploy` from `apps/studio/`) so MCP/Content Lake accept the new shape — schema/tooling
- [ ] Migrate existing `relatedTerms` members: `tagRef` → `relatedTags`, `toolRef` → `relatedTools`, `categoryRef` → fold into `categories[]` (or drop if already present) — migration script
- [ ] Update `glossaryTermBySlugQuery` and compact glossary projection to project `relatedTerms`, `relatedTags`, `relatedTools` — query (`apps/web/src/lib/queries.js`)
- [ ] Render the three relations as separate labelled sections on the glossary detail page — frontend

### Part 2 — bidirectional sync

- [ ] **Activation audit:** for each of the four related-field surfaces below, query current data to understand the before-state and identify any gaps that would be closed by backfill — activation, not schema
- [ ] Implement bidirectional sync mechanism in Studio — Sanity document action (or plugin hook) that fires on publish, detects newly-added refs in the relevant field, patches each referenced document to add a reverse ref, then re-publishes the patched doc (`apps/studio/`) — studio/tooling
  - Covered fields: `glossaryTerm.relatedTerms`, `article.related`, `node.related`, `caseStudy.related`
  - Excluded fields: `glossaryTerm.relatedTags`, `glossaryTerm.relatedTools`, `glossaryTerm.relatedContent` — target types have no matching back-ref field
- [ ] Backfill existing data: run a one-time migration to add missing reverse refs on all current docs, so the graph is complete before the live sync mechanism activates — migration script
- [ ] **Content Write Gate** fires for the backfill migration — produce a before/after proposal of which docs gain which reverse refs, approved before any patch runs
- [ ] Verify duplicate-guard: the sync must not add a ref if it already exists in the target array (unique constraint already present in schemas — confirm the patch logic respects it)

## Phases

Single-phase by intent (merge strategy b). Internal ordering: **schema split + deploy → Part 1 migration → Part 2 sync mechanism → Part 2 backfill → query/render updates**. Nothing merges until the full chain is verified end to end.

## Acceptance criteria

**Part 1:**
- [ ] `glossaryTerm.relatedTerms` accepts only glossary-term references; Studio "Add item…" shows one option
- [ ] `relatedTags` and `relatedTools` exist as separate fields, each restricted to their type
- [ ] Schema deployed; MCP write to new fields succeeds
- [ ] Migration moves all non-glossary refs out of `relatedTerms` with zero data loss; post-migration GROQ check returns no mixed members
- [ ] `glossaryTermBySlugQuery` returns `relatedTerms`, `relatedTags`, `relatedTools` as distinct arrays
- [ ] Glossary detail page renders three labelled sections; a migrated term displays correctly

**Part 2:**
- [ ] Studio mechanism: add term A to term B's `relatedTerms`, publish B → A's `relatedTerms` automatically contains B (and vice versa)
- [ ] Same behaviour confirmed for `article ↔ node`, `article ↔ caseStudy`, `node ↔ caseStudy` pairings
- [ ] Duplicate guard: adding an already-present ref does not create a duplicate
- [ ] Backfill migration complete: all existing one-directional `related`/`relatedTerms` links have been complemented with reverse refs; post-backfill GROQ audit returns zero asymmetric pairs
- [ ] **Content Write Gate:** backfill before/after proposal approved before any patch executes

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, confirm the glossary detail route → component mapping (GlossaryTermPage), the article/node/caseStudy detail routes (ArticlePage, NodePage, CaseStudyPage), and build the Human QA Walkthrough table per `docs/epic-template.md` §Human QA Walkthrough. For each content type, capture one real published slug pair that currently has a one-directional `related` link (A has B in `related`, but B does not have A) — these are the regression examples. Datestamp captures. Confirm that `PageSidebar` is the shared render path for `related` on all three main content types before touching any sidebar CSS.

## Technical notes

### Part 1 — schema split

- **Schema changes:** three fields on `glossaryTerm`. `relatedTerms` narrowed (remove `tagRef`, `categoryRef`, `toolRef`, keep glossary-term reference). New `relatedTags` and `relatedTools`. Update field descriptions. **Deploy required.**
- **Content Write Gate:** fires for the Part 1 migration. Before/after table (doc → ref moved → from field → to field).
- **Activation audit — existing mixed data:**
  ```groq
  *[_type == "glossaryTerm" && count(relatedTerms[_type != "glossaryTermRef"]) > 0]{
    _id, term, relatedTerms[]{_type, _key, _ref}
  }
  ```
- Read `apps/web/src/lib/queries.js` `glossaryTermBySlugQuery` (~line 1661) and compact projection (~line 1646) before editing.
- Confirm `tag` and `tool` target `_id`s still exist (orphan check) before migration.
- **Paired-field note:** none — `glossaryTerm` has no paired object/document schema.

### Part 2 — bidirectional sync

- **No prior implementation found.** Audit confirmed zero bidirectional code in `apps/studio/`, `apps/studio/plugins/`, `scripts/`, or `apps/web/src/lib/`.
- **Existing precedent:** `apps/studio/components/RemoveReferenceAction.tsx` does a unidirectional unlink (patches the *referencing* doc when a category/tag/tool is removed). The bidirectional sync is the inverse and more complex: it patches the *referenced* doc. Same `@sanity/client` pattern, different trigger.
- **Implementation approach — document action on publish:**
  - A custom document action (`apps/studio/components/SyncRelatedAction.tsx` or similar) fires when the editor publishes a document of type `glossaryTerm`, `article`, `node`, or `caseStudy`
  - It diffs the current `related`/`relatedTerms` array against the previously-published version to identify newly-added refs
  - For each new ref, it fetches the target doc, checks whether a reverse ref already exists, and if not, patches the target doc's matching field and publishes it
  - Use the existing Sanity client from `apps/studio/` — do not add a new dependency
  - Guard against self-referential loops (doc referencing itself) and circular chains (A→B→A already handled by the unique constraint on each array)
- **Field surface map (bidirectional candidates):**

  | Source doc type | Source field | Target doc type | Target field |
  |-----------------|-------------|-----------------|-------------|
  | `glossaryTerm` | `relatedTerms` | `glossaryTerm` | `relatedTerms` |
  | `article` | `related` | `article` | `related` |
  | `article` | `related` | `node` | `related` |
  | `article` | `related` | `caseStudy` | `related` |
  | `node` | `related` | `node` | `related` |
  | `node` | `related` | `article` | `related` |
  | `node` | `related` | `caseStudy` | `related` |
  | `caseStudy` | `related` | `caseStudy` | `related` |
  | `caseStudy` | `related` | `article` | `related` |
  | `caseStudy` | `related` | `node` | `related` |

- **Excluded from sync** (no matching back-ref field on target type):
  - `glossaryTerm.relatedTags` → `tag` (tag has no `relatedTerms` field)
  - `glossaryTerm.relatedTools` → `tool` (tool has no `relatedTerms` field)
  - `glossaryTerm.relatedContent` → any (targets have no `relatedGlossaryTerms` field)
- **`wp.*` legacy docs excluded from backfill** — legacy WordPress-import documents (IDs prefixed `wp.`) are excluded from the bidirectional backfill. Their `related` sections were never curated; missing back-refs are the pre-existing state, not a regression. Patch individually as needed post-epic.
- **Backfill audit query (run at activation to size the work):**
  ```groq
  // Find article/node/caseStudy docs where A has B in related but B does not have A
  *[_type in ["article", "node", "caseStudy"] && count(related) > 0]{
    _id, _type, title, "slug": slug.current,
    related[]->{ _id, _type, "slug": slug.current, "hasBack": count(*[_id == ^.^._id]) > 0 }
  }
  ```
  (Adapt for `glossaryTerm.relatedTerms` separately.)
- **Content Write Gate:** fires for the backfill. The proposal table must list every doc that gains a new reverse ref.
- **GROQ query impact:** no query changes needed for Part 2 — the sync writes into the same fields already projected. Verify `related` and `relatedTerms` projections in detail queries include the reverse refs after backfill.

### Shared notes

- Strong refs require targets to be published before referencing. All existing `related` and `relatedTerms` targets are published. The sync action must publish the patched target doc (not just create a draft) to avoid leaving dangling draft reverse-refs.
- Schema changes are not live until deployed — deploy before migration and before the sync action is active.

## Model & Mode [REQUIRED]

`/model opusplan` — Opus plans (Pre-Execution Gate, sync mechanism design, migration proposals, Files to Modify), Sonnet executes after plan-mode exit. Two distinct implementation concerns (schema migration + Studio action) need sequencing before any code is written.

## Non-Goals

- Schema changes to `tag`, `tool`, or `category` types — bidirectional sync for `relatedTags`/`relatedTools` requires adding back-ref fields to those types, which is a separate epic
- Bidirectional sync for `glossaryTerm.relatedContent` — targets (`article`, `node`, `caseStudy`, etc.) would need a `relatedGlossaryTerms` field added, which is out of scope here
- The `relatedProjects` (deprecated) and `answerBlock.references` fields — these are not in scope for either the split or the sync
- Removing the deprecated `relatedProjects` field — separate cleanup epic if needed
- Reverse-lookup surfacing on tag/tool detail pages — not addressed here (no back-ref field added to those types)

## Related

- **Linear:** [SUG-186](https://linear.app/sugartown/issue/SUG-186)
- **Upstream:** SUG-185 (glossary term batch) — populated the corpus this refactor tidies
- **Existing precedent:** `apps/studio/components/RemoveReferenceAction.tsx` — unidirectional unlink pattern to build from
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
