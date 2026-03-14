# EPIC TEMPLATE
# Sugartown — Claude Code Epic Prompt

---

## Epic Lifecycle

**Status:** IN PROGRESS

**Epic ID:** EPIC-0174
## EPIC NAME: FilterBar & MetadataCard Cleanup + Tag Taxonomy Audit

**Backlog ref:** Item — FilterBar & MetadataCard cleanup (Soon tier)

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — `MetadataCard.jsx`, `ContentCard.jsx`, `FilterBar.jsx`, `filterModel.js`, `applyFilters.js`, `person.js` all contain legacy code paths from pre-EPIC-0162 tool migration and pre-Stage-6 author migration. No new components created — this is cleanup of existing surfaces.
- [x] **Use case coverage** — N/A (no new component). This epic removes dead code paths, not adds new ones.
- [x] **Layout contract** — No layout changes. Component APIs unchanged. Only internal implementation cleanup.
- [x] **All prop value enumerations** — `CONTENT_TYPE_LABELS` in `ContentCard.jsx` must be audited against all doc types. `STATUS_DISPLAY` must be verified against all schema `status` option lists.
- [x] **Correct audit file paths** — All paths verified via Read tool and GROQ audit.
- [x] **Dark / theme modifier treatment** — N/A (no visual changes).
- [x] **Studio schema changes scoped** — No schema changes in this epic. Legacy fields (`author`, `relatedProjects`) are kept for now — removal is a separate editorial/migration epic.
- [x] **Web adapter sync scoped** — N/A (no DS component modified).

---

## Context

### The problem

After EPIC-0162 (tools taxonomy migration) and Stage 6 (post→article rename + author migration), several components carry defensive code paths that are no longer needed:

1. **Tool string-type guards** — `typeof t === 'object'` checks in ContentCard and MetadataCard that guarded against pre-migration mixed string/reference data. Migration is complete; all tools are references.
2. **Legacy author fallback** — `getAuthorByline()` in `person.js` falls back to a legacy `author` string field when `authors[]` is empty. All content should now use `authors[]`.
3. **`relatedProjects` merge logic** — `filterModel.js` merges legacy `relatedProjects` with canonical `projects[]`. Both fields exist on all three content types.
4. **Stale comments** — `applyFilters.js` still references string enum semantics for tools.

### The tag crisis

The tag taxonomy has grown unchecked:

| Metric | Count |
|--------|-------|
| Total tags | **256** |
| Orphan tags (0 references) | **80** (31%) |
| Tag-tool duplicates (same slug) | **25** |
| Tag-tool duplicates with 0 refs | 21 (safe to delete) |
| Tag-tool duplicates with refs | 4 (need ref migration first) |

**Tag-tool duplicates with references (need migration):**

| Tag name | Tag refs | Tool name | Tool refs | Action |
|----------|---------|-----------|-----------|--------|
| Storybook | 2 | Storybook | 1 | Migrate tag refs → tool refs, delete tag |
| claude-code | 2 | Claude Code | 5 | Migrate tag refs → tool refs, delete tag |
| css | 1 | CSS | 5 | Migrate tag refs → tool refs, delete tag |
| react | 1 | React | 3 | Migrate tag refs → tool refs, delete tag |

**Zero-ref orphan tags (sample — full list is 80):**
`ai generated`, `ats`, `js`, `two`, `one`, `comps`, `atomic`, `mach`, `wireframes`, `branding`, `facebook`, `twitter`, `youtube`, `napa`, `web design`, `drupal 8`, `fx networks`, `beauty retail`, `prestige brands`, `pxm`, `pim`, `grid`, `cms rfp`, `vendor selection`, `oracle atg`, `oracle bcc`, `p13n`, `adwords`, `salesforce`, `netsuite`, `landing page`, `mockup`, `rant`, `opinion`, `campaign`, `portfolio`, `case studies`, `forms`, `input fields`, and ~40 more.

This tag bloat causes the node archive page (`/knowledge-graph`) filter to show an unusably long tag facet list.

### Files with legacy code paths (from audit)

| Component | Guard type | File | Lines |
|-----------|-----------|------|-------|
| ContentCard.jsx | `typeof t === 'object'` tool guard | `apps/web/src/components/ContentCard.jsx` | 111–120 |
| MetadataCard.jsx | `typeof t === 'object'` tool guard | `apps/web/src/components/MetadataCard.jsx` | 165–166 |
| person.js | Legacy `author` string fallback | `apps/web/src/lib/person.js` | 59–74 |
| filterModel.js | `relatedProjects` merge | `apps/web/src/lib/filterModel.js` | 112–125 |
| ArticlePage.jsx | Passes `legacyAuthor` prop | `apps/web/src/pages/ArticlePage.jsx` | 72–74 |
| applyFilters.js | Stale comment about string enum | `apps/web/src/lib/applyFilters.js` | 84–87 |

---

## Objective

After this epic:
1. Legacy tool string-type guards are removed from ContentCard and MetadataCard — both assume reference-only contract.
2. `CONTENT_TYPE_LABELS` and `STATUS_DISPLAY` maps are verified against current schema enums (no stale entries, no missing entries).
3. **80 orphan tags** (zero references) are deleted from Sanity.
4. **25 tag-tool duplicates** are resolved: 21 deleted directly (0 refs), 4 have their content refs migrated from tag→tool then deleted.
5. The node archive tag filter facet shows a manageable, curated list instead of 256 entries.
6. Stale comments in `applyFilters.js` are updated.

**Data layer:** Sanity content cleanup (tag deletion, ref migration). No schema changes.
**Query layer:** No query changes.
**Render layer:** Remove defensive guards in ContentCard, MetadataCard. Audit label maps.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | No | Pages don't carry tags/tools/author fields |
| `article` | Yes | Has `tools[]`, `authors[]`/`author` (legacy), `tags[]` — all three cleanup vectors |
| `caseStudy` | Yes | Has `tools[]`, `authors[]`, `tags[]` — tool and tag cleanup |
| `node` | Yes | Has `tools[]`, `authors[]`, `tags[]` — tool and tag cleanup; archive page has the runaway filter |
| `archivePage` | Indirect | Archive filter facets draw from tag/tool data — cleaned up by reducing tag count |
| `tag` | Yes | 80 orphan deletions + 25 duplicate resolutions |
| `tool` | Indirect | 4 tag→tool ref migrations target tool documents |

---

## Scope

### Phase A — Code cleanup (safe, no data changes)

- [ ] **Remove tool string-type guards** — Simplify `ContentCard.jsx` lines 111–120 and `MetadataCard.jsx` line 165 to remove `typeof t === 'object'` checks. Tools are references; null guard (`t && t.name`) is sufficient.
- [ ] **Audit `CONTENT_TYPE_LABELS`** — Verify every entry in ContentCard's label map matches a current Sanity doc type. Remove stale entries. Add missing entries.
- [ ] **Audit `STATUS_DISPLAY`** — Cross-reference against `article.ts`, `caseStudy.ts`, `node.ts` `status` field `options.list`. Ensure every schema value has a display entry. Flag any missing.
- [ ] **Update stale comments** — `applyFilters.js` lines 84–87 still describe string enum semantics. Update to reflect reference-based tool facets.
- [ ] **Audit `FACET_LABELS`** or similar label maps in FilterBar for stale entries.

### Phase B — Tag-tool duplicate resolution (migration script)

- [ ] **Write migration script** — `scripts/migrate/cleanup-tag-tool-duplicates.js`
  - Identify content docs that reference any of the 4 duplicate tags with refs (Storybook, claude-code, css, react)
  - For each doc: add the corresponding tool ref to `tools[]` (if not already present), remove the tag ref from `tags[]`
  - Dry-run default, `--execute` flag
  - Idempotent: skip docs that already have the tool ref and lack the tag ref
- [ ] **Delete the 25 duplicate tag documents** — After ref migration, all 25 tag-tool duplicates have 0 tag refs. Delete them.

### Phase C — Orphan tag cleanup (content deletion)

- [ ] **Delete 80 orphan tags** (0 references) from Sanity production dataset
- [ ] **Run `pnpm validate:content`** after deletion to confirm zero orphaned references

### Phase D — Default author backfill (migration script)

**Pre-audit result:** 35 of 58 content docs have no `authors[]` set. Zero articles use legacy `author` string only (field is fully dead). The single person document is `wp.person.bhead` (Becky Alice, slug: `beehead`).

- [ ] **Write migration script** — `scripts/migrate/backfill-default-author.js`
  - Target: all `article`, `caseStudy`, and `node` docs where `authors[]` is empty or undefined (35 docs)
  - Action: `setIfMissing({ authors: [] })` then `append` a reference to `wp.person.bhead`
  - Dry-run default, `--execute` flag
  - Idempotent: skip docs that already have any entry in `authors[]`
- [ ] **Remove legacy author fallback code** — After backfill, all docs have `authors[]`. Safe to:
  - Remove `legacyAuthor` prop from `ArticlePage.jsx` (line 74)
  - Remove `getAuthorByline()` legacy branch in `apps/web/src/lib/person.js` (lines 59–74) — keep the canonical `authors[]` path only
  - Remove dev-mode console.warn about legacy author
- [ ] **Audit `relatedProjects` usage** — Query Sanity for docs where `relatedProjects` has entries not also in `projects[]`. Report count. If zero, document that the merge logic in `filterModel.js` is dead code and safe to remove in a future epic. Do NOT remove in this epic.

---

## Query Layer Checklist

- [ ] No GROQ query changes in this epic. All changes are to render-layer code and Sanity content data.
- [ ] `siteSettingsQuery` — not affected
- [ ] `pageBySlugQuery` — not affected
- [ ] `articleBySlugQuery` — not affected
- [ ] `caseStudyBySlugQuery` — not affected
- [ ] `nodeBySlugQuery` — not affected
- [ ] Archive queries — not affected (tag count reduction happens at the data level)

---

## Schema Enum Audit

| Field name | Schema file | `value` → Display title (to verify against code maps) |
|-----------|-------------|-----------------------------------------------------|
| `status` | `article.ts` | Must verify against `STATUS_DISPLAY` in ContentCard |
| `status` | `caseStudy.ts` | Must verify — may have different values than article |
| `status` | `node.ts` | Must verify — node has different status vocabulary |

**Action:** Read each schema file's `status` field `options.list` during execution. Compare against `STATUS_DISPLAY` map. Report discrepancies.

---

## Metadata Field Inventory

Not applicable — MetadataCard API is unchanged. Only internal guard code is removed.

---

## Themed Colour Variant Audit

Not applicable — no visual changes.

---

## Non-Goals

- **Schema field removal** — Legacy fields (`author` string, `relatedProjects[]`) are NOT removed. Removal requires a content migration epic with editorial review.
- **Legacy author fallback removal** — `getAuthorByline()` in `person.js` is NOT changed. The fallback stays until all articles have canonical `authors[]`.
- **`relatedProjects` merge removal** — `filterModel.js` merge logic is NOT changed. Stays until editorial confirms all docs use canonical `projects[]`.
- **FilterBar DS migration** — FilterBar.jsx has a TODO about migrating to the DS package version. That is a separate concern (CSS token namespace alignment). Not in scope.
- **Tag editorial curation** — This epic deletes orphans and duplicates (mechanical cleanup). It does NOT curate the remaining ~151 tags for relevance or hierarchy. That's editorial work.
- **Archive page UI changes** — No changes to how FilterBar renders tag facets. The improvement comes from reducing the tag count from 256 to ~151.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/web`, `apps/studio`
- Migration script: `scripts/migrate/cleanup-tag-tool-duplicates.js`
- Follow migration script conventions from `scripts/migrate/lib.js`: dry-run default, `--execute` flag, 5s abort window, idempotency
- `nanoid` fallback pattern (see epic template)

**Schema (Studio)**
- No schema changes

**Query (GROQ)**
- No query changes

**Render (Frontend)**
- ContentCard and MetadataCard: remove `typeof t === 'object'` guard, keep `t && t.name` null check
- No prop API changes — callers are unaffected

**Sanity content operations**
- Tag deletions: batch delete via Sanity client mutation
- Ref migration: patch docs to add tool ref + remove tag ref in a single transaction
- All operations idempotent
- Run `pnpm validate:content` after every phase to verify zero orphaned references

---

## Migration Script Constraints

**Target doc count (Phase B — tag-tool ref migration)**

Before writing the script, verify counts:
```groq
// Docs referencing tag "Storybook" (slug: storybook)
count(*[_type in ["article", "caseStudy", "node"] && references(*[_type == "tag" && slug.current == "storybook"]._id)])

// Repeat for claude-code, css, react
```

Expected count per duplicate tag (from audit):
| Tag | Expected doc count |
|-----|--------------------|
| Storybook | 2 |
| claude-code | 2 |
| css | 1 |
| react | 1 |
| **Total** | **6 docs to patch** |

**Skip condition review**
- Skip if doc already has the corresponding tool in `tools[]` AND does not have the tag in `tags[]` — already migrated
- `setIfMissing` for `tools[]` array creation (in case a doc has no tools array yet)

**Idempotency**
- Re-running the script after execution produces 0 patches (all tag refs already removed, tool refs already present)

**Phase C — orphan tag deletion**
- 80 tags with 0 references
- Deletion is idempotent (deleting a non-existent doc is a no-op)
- Verify count after: `count(*[_type == "tag"])` should drop from 256 to ~151

**Target doc count (Phase D — default author backfill)**

```groq
count(*[_type in ["article", "caseStudy", "node"] && (!defined(authors) || count(authors) == 0)])
```
Expected count: **35** (pre-audited 2026-03-12)

Target person document: `wp.person.bhead` (Becky Alice, slug: `beehead`)

**Skip condition review**
- Skip if doc already has any entry in `authors[]` — only backfill empty/undefined
- `setIfMissing({ authors: [] })` handles docs where `authors` field doesn't exist at all

**Idempotency**
- Re-running after execution produces 0 patches (all docs now have `authors[]` with at least one entry)

---

## Files to Modify

**Frontend (Phase A)**
- `apps/web/src/components/ContentCard.jsx` — MODIFY: remove `typeof t === 'object'` guard, audit `CONTENT_TYPE_LABELS` and `STATUS_DISPLAY`
- `apps/web/src/components/MetadataCard.jsx` — MODIFY: remove `typeof t === 'object'` guard
- `apps/web/src/lib/applyFilters.js` — MODIFY: update stale comments about string enum
- `apps/web/src/components/FilterBar.jsx` — AUDIT: check for stale facet label maps (modify if found)

**Frontend (Phase D — legacy author removal)**
- `apps/web/src/pages/ArticlePage.jsx` — MODIFY: remove `legacyAuthor` prop
- `apps/web/src/lib/person.js` — MODIFY: remove legacy author fallback branch + dev warning from `getAuthorByline()`

**Scripts (Phase B)**
- `scripts/migrate/cleanup-tag-tool-duplicates.js` — CREATE
- `package.json` — ADD `migrate:cleanup-tags` script entry

**Scripts (Phase D)**
- `scripts/migrate/backfill-default-author.js` — CREATE
- `package.json` — ADD `migrate:backfill-author` script entry

**Docs (Phase D)**
- MEMORY.md or CLAUDE.md — UPDATE: document that legacy `author` field is fully dead (0 usage), `relatedProjects` audit result

---

## Deliverables

1. **Code cleanup** — Tool string-type guards removed from ContentCard and MetadataCard. Both components assume reference-only contract.
2. **Label map audit** — `CONTENT_TYPE_LABELS` and `STATUS_DISPLAY` verified complete against current schemas. Stale entries removed, missing entries added.
3. **Comment cleanup** — `applyFilters.js` comments updated to reflect reference-based tools.
4. **Migration script (tags)** — `cleanup-tag-tool-duplicates.js` exists, dry-run reports expected counts, `--execute` migrates 6 docs and resolves 25 duplicates.
5. **Orphan deletion** — 80 zero-ref tags deleted. Tag count reduced from 256 to ~151.
6. **Migration script (author)** — `backfill-default-author.js` exists, dry-run reports 35 docs, `--execute` sets `authors[]` to `[ref: wp.person.bhead]` on all 35.
7. **Legacy author code removal** — `legacyAuthor` prop removed from ArticlePage. `getAuthorByline()` legacy branch removed from person.js.
8. **Validation** — `pnpm validate:content` passes after all phases.
9. **`relatedProjects` audit report** — Document how many docs have `relatedProjects` not in `projects[]`. Stored in MEMORY.md.

---

## Acceptance Criteria

- [ ] ContentCard: no `typeof.*object` guards on tool references
- [ ] MetadataCard: no `typeof.*object` guards on tool references
- [ ] `CONTENT_TYPE_LABELS`: every key maps to a current Sanity doc type. No stale entries.
- [ ] `STATUS_DISPLAY`: every status value from `article.ts`, `caseStudy.ts`, `node.ts` `options.list` has a display entry. No missing values across any doc type.
- [ ] `applyFilters.js`: no comments referencing string enum tool handling
- [ ] Migration script dry-run: reports 6 docs to patch (Storybook×2, claude-code×2, css×1, react×1)
- [ ] Migration script `--execute`: 6 docs patched, 0 errors
- [ ] Migration script re-run: 0 docs to patch (idempotency)
- [ ] Tag count after cleanup: `count(*[_type == "tag"])` ≈ 151 (256 − 80 orphans − 25 duplicates)
- [ ] `pnpm validate:content` passes with zero NEW errors after all phases
- [ ] Node archive page (`/knowledge-graph`): tag filter facet shows ~151 tags instead of 256
- [ ] No runtime errors in ContentCard or MetadataCard after guard removal (test with real published content)
- [ ] Author backfill dry-run: reports 35 docs to patch
- [ ] Author backfill `--execute`: 35 docs patched, all now have `authors[]` referencing `wp.person.bhead`
- [ ] Author backfill re-run: 0 docs to patch (idempotency)
- [ ] After backfill: `count(*[_type in ["article","caseStudy","node"] && (!defined(authors) || count(authors)==0)])` = 0
- [ ] `legacyAuthor` prop removed from ArticlePage — no runtime errors
- [ ] `getAuthorByline()` no longer has legacy string fallback branch
- [ ] `relatedProjects` audit report committed to MEMORY.md

---

## Risks / Edge Cases

**Code cleanup risks**
- [ ] Removing `typeof t === 'object'` guard: could break if any tool ref is still a raw string in production. **Mitigation:** Run GROQ audit before removing guards: `*[_type in ["article","caseStudy","node"] && defined(tools) && tools[0]._ref == null]{_id, tools}` — if zero results, safe to remove.
- [ ] `STATUS_DISPLAY` audit may reveal values rendered by ContentCard that are missing from the map. This would surface as a badge with no class (invisible, not a crash). Low risk but should be fixed.

**Tag deletion risks**
- [ ] Deleting orphan tags: zero-ref tags by definition have no content references. But they may have **draft** content that references them (drafts are invisible to `perspective: 'published'`). **Mitigation:** Run count query with `perspective: 'raw'` to include drafts before deleting.
- [ ] Tag-tool ref migration: patching a doc to add a tool ref could create a duplicate if the doc already references that tool. **Mitigation:** Script checks for existing tool ref before adding.
- [ ] Batch deletion of 80 tags: Sanity API rate limits. **Mitigation:** Batch in groups of 20 with 1s delay between batches.

**Migration risks**
- [ ] `setIfMissing` for `tools[]` array: if a doc has no `tools` field at all, `setIfMissing` creates it as empty array, then `append` adds the tool ref. Correct behavior.
- [ ] Cross-type consistency: the same tag slug (e.g., "storybook") may be referenced by articles, case studies, AND nodes. Script must handle all three content types.

**Downstream risks**
- [ ] Reducing tag count from 256→151 changes the filter facet on all archive pages. Facets are built dynamically from content data — no code change needed, but visual appearance of the filter will change (fewer options). This is the desired outcome.

---

## Appendix: Tag Taxonomy Audit Data

### Tag-tool duplicates (25 total)

| Tag slug | Tag refs | Tool slug | Tool refs | Disposition |
|----------|---------|-----------|-----------|-------------|
| aem | 0 | aem | 1 | Delete tag |
| acquia | 0 | acquia | 0 | Delete tag |
| apple | 0 | apple | 1 | Delete tag |
| celum | 0 | celum | 1 | Delete tag |
| chatgpt | 0 | chatgpt | 7 | Delete tag |
| claude | 0 | claude | 15 | Delete tag |
| claude-code | **2** | claude-code | 5 | **Migrate refs → tool, delete tag** |
| codex | 0 | codex | 1 | Delete tag |
| contentful | 0 | contentful | 2 | Delete tag |
| css | **1** | css | 5 | **Migrate refs → tool, delete tag** |
| drupal | 0 | drupal | 1 | Delete tag |
| figma | 0 | figma | 1 | Delete tag |
| gemini | 0 | gemini | 19 | Delete tag |
| git | 0 | git | 2 | Delete tag |
| github | 0 | github | 1 | Delete tag |
| linear | 0 | linear | 1 | Delete tag |
| matplotlib | 0 | matplotlib | 0 | Delete tag |
| mermaid | 0 | mermaid | 0 | Delete tag |
| networkx | 0 | networkx | 1 | Delete tag |
| oracle-atg | 0 | oracle-atg | 1 | Delete tag |
| python | 0 | python | 8 | Delete tag |
| react | **1** | react | 3 | **Migrate refs → tool, delete tag** |
| sanity | 0 | sanity | 5 | Delete tag |
| shopify | 0 | shopify | 1 | Delete tag |
| storybook | **2** | storybook | 1 | **Migrate refs → tool, delete tag** |

### Orphan tag categories (80 tags, 0 references)

| Category | Examples | Count |
|----------|---------|-------|
| Tool/platform names (overlap with tools taxonomy) | js, matplotlib, mermaid, drupal 8, salesforce, netsuite | ~15 |
| Social platforms (not tags) | facebook, twitter, youtube, social media | 4 |
| Vague/generic | one, two, comps, atomic, grid, mockup, rant, opinion | ~12 |
| Industry/client-specific | beauty retail, prestige brands, fx networks, napa, travel | ~8 |
| Process/methodology (could merge with categories) | agile workflows, scrum-but, discovery vs delivery, team topology | ~10 |
| Design system concepts (could merge with categories) | semantic tokens, multi-brand theming, Figma variables, token pipelines | ~6 |
| Already covered by categories | content strategy, branding, web design, marketing | ~8 |
| Misc unused | ai generated, ats, pdf, demand generation, dynamic content, landing page | ~17 |

### Post-cleanup projection

| Metric | Before | After |
|--------|--------|-------|
| Total tags | 256 | ~151 |
| Orphan tags | 80 | 0 |
| Tag-tool duplicates | 25 | 0 |
| Filter facet items (tags) | 256 | ~151 |

**Note:** The remaining ~151 tags may still benefit from editorial curation (merging near-synonyms like "release process" / "release engineering" / "release management", or promoting frequently-used tags to categories). That is editorial work, not this epic.

---

## Post-Epic Close-Out

1. **Activate the epic file:**
   - Assign the next sequential EPIC number
   - Move: `docs/backlog/EPIC-filterbar-metadata-tag-cleanup.md` → `docs/prompts/EPIC-{NNNN}-filterbar-metadata-tag-cleanup.md`
   - Update the **Epic ID** field to match
   - Commit: `docs: activate EPIC-{NNNN} FilterBar & MetadataCard Cleanup + Tag Audit`
2. **Confirm clean tree** — `git status` must show nothing staged or unstaged
3. **Run mini-release** — `/mini-release EPIC-{NNNN} FilterBar MetadataCard Cleanup Tag Audit`
4. **Start next epic** — only after mini-release commit is confirmed
