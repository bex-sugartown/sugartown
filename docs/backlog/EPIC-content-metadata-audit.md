# EPIC — Content Metadata Audit & Taxonomy Backfill

**Epic ID:** (unassigned — backlog)
**Surface:** `apps/studio` (Sanity data) + `apps/web/scripts/` (validator)
**Priority:** 🟣 Soon
**Created:** 2026-03-15

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — No new interactive elements. This epic backfills data and extends an existing validator script.
- [x] **Use case coverage** — N/A — no new component or adapter.
- [x] **Layout contract** — N/A — no UI changes.
- [x] **All prop value enumerations** — N/A — no enum rendering.
- [x] **Correct audit file paths** — verified:
  - `apps/web/scripts/validate-content.js` — existing validator
  - `apps/studio/schemas/documents/article.ts` — taxonomy fields: `categories[]`, `tags[]`, `tools[]`, `projects[]`, `authors[]`
  - `apps/studio/schemas/documents/caseStudy.ts` — same taxonomy fields + `client`, `role`, `dateRange`
  - `apps/studio/schemas/documents/node.ts` — same taxonomy fields + `aiTool`, `status`
- [x] **Dark / theme modifier treatment** — N/A — no visual output.
- [x] **Studio schema changes scoped** — No schema changes. All fields already exist. Data-only backfill.
- [x] **Web adapter sync scoped** — N/A — no DS component changes.

---

## Context

### Current field coverage by content type

| Field | Article | Case Study | Node | Required today? |
|-------|---------|------------|------|-----------------|
| `title` | ✅ required | ✅ required | ✅ required | Yes |
| `slug` | ✅ required | ✅ required | ✅ required | Yes |
| `publishedAt` | ✅ required | ✅ required | ✅ required | Yes |
| `excerpt` | ⚠️ warns if missing | ⚠️ warns if missing | ⚠️ warns if missing | Soft warning |
| `authors[]` | optional | optional | optional | No |
| `categories[]` | optional (max 2) | optional (max 2) | optional (max 2) | No |
| `tags[]` | optional | optional | optional | No |
| `tools[]` | optional | optional | optional | No |
| `projects[]` | optional | optional | optional | No |
| `aiTool` | n/a | n/a | ✅ required | Yes (node only) |
| `status` | n/a | n/a | ✅ required | Yes (node only) |
| `seo` | optional | optional | optional | No |

### What `validate-content.js` already checks (A–G)

- (A) Nav item quality — trailing slashes, missing URLs
- (B) Required fields — title, slug exist; excerpt soft warning
- (C) Orphaned taxonomy refs — refs to deleted/unpublished docs
- (D) Archive page integrity — contentTypes validation
- (E) Duplicate slugs within same type
- (F) HTML entities in PortableText spans
- (G) Draft-only documents

**Not currently checked:** Minimum taxonomy counts, missing authors, empty SEO metadata, taxonomy utilization metrics.

### Tag vocabulary context (EPIC-0174)

EPIC-0174 cleaned up the tag vocabulary: 256 → 92 tags (25 duplicates deleted, 132 orphans deleted, 7 tag→tool migrations). The controlled vocabulary is now curated at ~92 entries. New tags should only be created when no existing tag covers the concept — and must be reviewed against the existing list before creation.

### Existing taxonomy counts (as of EPIC-0174)

- Categories: ~10–15 (hierarchical, broad domains)
- Tags: ~92 (conceptual/thematic, controlled vocabulary)
- Tools: ~30+ (first-class documents since EPIC-0162)
- Projects: ~10+ (PROJ-XXX format, linked to content)
- People: ~2–3 (author profiles)

---

## Objective

Audit all published content documents (articles, case studies, nodes) for missing metadata and taxonomy assignments, then backfill them to meet minimum quality thresholds. Content currently ships with inconsistent taxonomy coverage — some articles have zero categories or tags, some nodes lack tools, some case studies are missing project links. This creates gaps in the knowledge graph, weakens filter facets, and produces sparse card layouts.

After this epic: (1) every content document meets defined minimums for taxonomy coverage; (2) a repeatable validator check (`validate:content`) enforces those minimums going forward; (3) taxonomy vocabulary is consolidated — no new one-off tags created without gatekeeping.

**Data layer:** Backfill taxonomy references on existing content documents. Optionally create a small number of new taxonomy entries (categories, tags, tools) where gaps exist — but only after auditing existing vocabulary.
**Query layer:** No changes.
**Render layer:** No changes — cards and filters already consume these fields when populated.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `article` | ✅ Yes | Primary content type — full metadata audit and backfill |
| `caseStudy` | ✅ Yes | Professional portfolio — categories, tags, tools, project links |
| `node` | ✅ Yes | Knowledge graph nodes — categories, tags, tools partially populated |
| `page` | ❌ No | Structural pages (About, Services) — taxonomy is optional and not rendered on cards |
| `archivePage` | ❌ No | Archive pages are config documents, not content items. No taxonomy fields. |

**Also audited (read-only, no backfill):**
- Taxonomy types (category, tag, tool, project) — check descriptions, usage counts, orphan risk
- Person — check bio, titles, expertise coverage

---

## Proposed Minimums

These are **quality gates**, not hard schema validation — enforced via `validate:content` warnings, not Studio `Rule.required()`.

| Field | Minimum | Rationale |
|-------|---------|-----------|
| `categories[]` | ≥ 1 | Every content item belongs to at least one domain. Filter facets break without category assignment. |
| `tags[]` | ≥ 3 | Tags drive cross-cutting discovery. Fewer than 3 suggests the content hasn't been properly classified. |
| `tools[]` | ≥ 1 (articles, nodes) | Most technical content references at least one technology. Case studies may be strategic/non-technical — exempt if `tools[]` is genuinely inapplicable. |
| `projects[]` | ≥ 0 (no minimum) | Not all content maps to a project. Leave optional. |
| `authors[]` | ≥ 1 | Every piece should have an attributed author. EPIC-0174 backfilled nodes; verify articles and case studies. |
| `excerpt` | non-empty | Already warned by validator (check B). Upgrade to error for published content. |
| `seo.title` | non-empty OR auto-generated | If `seo.autoGenerate` is true, fallback to `title`. Otherwise, should be explicitly set. |

---

## Scope

### Phase 1: Audit — understand the gaps

- [ ] Write audit query script `apps/web/scripts/audit-content-metadata.js`
- [ ] GROQ query reports, for each content document: count of categories, tags, tools, projects, authors; excerpt populated; seo.title / seo.description populated
- [ ] Run the audit and export results as a summary table (or CSV)
- [ ] Identify documents falling below proposed minimums
- [ ] Identify patterns: which content types are worst? Which fields have lowest coverage?

### Phase 2: Vocabulary review — before creating anything new

- [ ] Export full list of existing categories, tags, tools (with usage counts via GROQ)
- [ ] Identify unused/underused taxonomy entries (< 2 references)
- [ ] Identify content clusters that lack a covering category or tag
- [ ] Apply **Gatekeeping Protocol** (see below) before proposing any new entries
- [ ] Draft a "proposed new entries" list for review — do NOT create them unreviewed

### Phase 3: Backfill — assign metadata to existing content

- [ ] **Hybrid approach:** Script for obvious assignments (keyword matching), Studio for editorial judgment
- [ ] Migration script for bulk, low-ambiguity assignments (e.g. "all articles mentioning Sanity in title → assign `sanity` tool")
- [ ] Script pattern: dry-run → review → `--execute`
- [ ] Manual Studio assignments for categories and tags (require editorial judgment)
- [ ] **Backfill priority order:** categories → tags → tools → authors

### Phase 4: Validator upgrade — enforce minimums going forward

- [ ] Add check H to `validate-content.js`: Minimum taxonomy counts (categories ≥ 1, tags ≥ 3, tools ≥ 1)
- [ ] Add check I: Missing author attribution
- [ ] Add check J: SEO metadata completeness (title, description)
- [ ] Output as warnings (not errors) — quality gates, not blockers
- [ ] Add `--strict` flag option to treat quality warnings as errors (useful for pre-launch audit)
- [ ] Report summary: "X of Y articles meet all minimums" with breakdown by field

### Phase 5: Taxonomy utilization report (optional)

- [ ] Add a `--report` mode to the validator that outputs:
  - Most-used tags/categories (hot spots)
  - Least-used tags/categories (candidates for merge or removal)
  - Tags with 0–1 references (orphan risk)
  - Cross-type coverage: which tags appear in articles but not nodes, or vice versa
- [ ] Diagnostic tool, not a gating check

---

## Gatekeeping Protocol for New Taxonomy Entries

**This is the critical governance piece.** EPIC-0174 cleaned up 164 tags. We must not re-create the sprawl.

### Before creating a new tag:
1. Search existing tags for synonyms, abbreviations, or broader concepts that cover the same ground
2. Check if the concept is better served by a tool (specific technology) or a category (broad domain)
3. Verify the new tag would apply to ≥ 3 existing documents
4. Name must be conceptual/thematic — not a project name, not a tool name, not a status

### Before creating a new category:
1. Categories are broad domains (e.g. "Design Systems", "Content Strategy"). Do not create narrow categories.
2. Check if the concept fits as a child of an existing category (categories support `parent` for hierarchy)
3. Verify the new category would apply to ≥ 5 existing documents

### Before creating a new tool:
1. Must be a specific, named software/platform/technology (not a concept — that's a tag)
2. Check if the tool already exists under a different name or abbreviation
3. Set `toolType` field (type: `string`, options: ai | design | development | cms | analytics | productivity | other)

---

## Query Layer Checklist

N/A — this epic does not add fields, section types, or change GROQ projections. Existing queries already project `categories[]`, `tags[]`, `tools[]`, `projects[]`, `authors[]`. Backfilling data makes those projections return populated arrays where they previously returned empty.

---

## Schema Enum Audit

N/A — no enum fields are rendered or displayed by this epic.

---

## Metadata Field Inventory

N/A — no changes to MetadataCard or metadata surfaces. This epic populates data that MetadataCard already renders.

---

## Themed Colour Variant Audit

N/A — no visual output, no CSS changes.

---

## Non-Goals

- Does **not** add new schema fields — all fields already exist on the schemas
- Does **not** change Card, MetadataCard, or component rendering — components already consume taxonomy data when present
- Does **not** restructure the taxonomy hierarchy — that's a separate IA decision
- Does **not** enforce hard validation in Studio (`Rule.required()`) — these are quality warnings, not blockers
- Does **not** audit `page` type documents — pages are structural, not content items
- **Studio schema changes:** None. This epic is data-only. No schema modifications.

---

## Technical Constraints

**Monorepo / tooling**
- Audit script runs as `node apps/web/scripts/audit-content-metadata.js` from repo root
- Migration scripts run as `node scripts/migrate/X.js` from repo root
- `nanoid` is installed in `apps/studio/node_modules`, NOT at root — use dynamic import with fallback if needed
- All migration script patterns: follow `scripts/migrate/lib.js` (dry-run default, `--execute` flag, 5s abort window, idempotency)

**Schema (Studio)**
- No schema changes. All taxonomy reference fields (`categories[]`, `tags[]`, `tools[]`, `projects[]`, `authors[]`) already exist on article, caseStudy, and node schemas.
- `categories[]`: array of references to `category`, max 2 (warning, not error)
- `tags[]`: array of references to `tag`, controlled vocabulary
- `tools[]`: array of references to `tool`
- `projects[]`: array of references to `project`
- `authors[]`: array of references to `person`

**Query (GROQ)**
- All queries in `apps/web/src/lib/queries.js`
- No query changes needed — taxonomy fields are already projected in archive and detail queries

**Render (Frontend)**
- No render changes — ContentCard, MetadataCard, FilterBar all consume taxonomy arrays when populated
- Backfilling data will cause: more filter chips in archive pages, more metadata rows on detail pages, denser knowledge graph connections

---

## Migration Script Constraints

**Target doc count**
Run at activation:
```groq
count(*[_type in ["article", "caseStudy", "node"] && !(_id in path("drafts.**"))])
```
Expected count: `___` (fill at activation — estimated 50–80 documents)

**Skip condition review**
- Documents where ALL minimums are already met → skip (no patch needed)
- Documents where a field is already populated above the minimum → skip that field only
- `setIfMissing` for arrays handles absent fields; explicit guards for "array not present" are unnecessary

**Idempotency**
- Script only patches documents below minimums. Re-running on already-backfilled content produces 0 patches.
- Keyword-matching assignments use `setIfMissing` or check for existing reference before appending → no duplicates.

---

## Files to Modify

**Scripts (create)**
- `apps/web/scripts/audit-content-metadata.js` — CREATE: one-time audit query (Phase 1)
- `scripts/migrate/backfill-taxonomy.js` — CREATE: bulk backfill for obvious assignments (Phase 3)

**Scripts (modify)**
- `apps/web/scripts/validate-content.js` — add checks H, I, J + `--strict` flag + `--report` mode (Phase 4–5)

**Sanity content (modify)**
- Published content documents — metadata backfill via Studio and/or migration script (Phase 3)
- Optionally: new taxonomy entries (categories, tags, tools) — via Studio, subject to gatekeeping protocol

**No Studio, frontend, or web adapter files modified.**

---

## Deliverables

1. **Audit report** — generated summary showing current metadata coverage by content type and field, with counts of documents below each minimum
2. **Vocabulary review** — list of existing taxonomy entries with usage counts, identified gaps, and proposed new entries (if any) with gatekeeping justification
3. **Backfill complete** — all published content documents meet proposed minimums
4. **Validator checks H, I, J** — `validate-content.js` reports taxonomy coverage, author attribution, and SEO metadata completeness
5. **Utilization report** — `--report` mode outputs most/least used taxonomy entries and orphan risk

---

## Acceptance Criteria

- [ ] Audit report generated showing current metadata coverage by content type and field
- [ ] All published articles have ≥ 1 category, ≥ 3 tags, and ≥ 1 author
- [ ] All published nodes have ≥ 1 category, ≥ 3 tags, ≥ 1 tool, and ≥ 1 author
- [ ] All published case studies have ≥ 1 category and ≥ 3 tags
- [ ] No new one-off tags created (any new tag applies to ≥ 3 documents)
- [ ] `pnpm validate:content` reports minimum taxonomy coverage (new checks H, I, J)
- [ ] `pnpm validate:content --strict` exits non-zero if any content document is below minimums
- [ ] `pnpm validate:content --report` outputs taxonomy utilization summary
- [ ] Taxonomy utilization summary shows no tags with 0 references (orphan-free after EPIC-0174 + this epic)
- [ ] Dry-run of backfill migration script reports expected count (from pre-flight GROQ) — NOT zero unless pre-flight confirmed zero targets
- [ ] After `--execute`, re-running dry-run reports 0 documents to patch (idempotency)

---

## Risks / Edge Cases

**Data quality risks**
- [ ] **Over-tagging** — Assigning too many tags dilutes their signal. The proposed minimum of 3 is a floor, not a target. 3–7 is the sweet spot; more than 10 suggests content scope is too broad or tags too specific.
- [ ] **Category sprawl** — Categories should remain broad (10–20 total). If audit reveals content that doesn't fit any existing category, consider broadening an existing one before creating a new one.
- [ ] **Tool granularity** — Tools like "React" are clear. But should "React Router" be a separate tool from "React"? Establish a granularity convention before creating tool entries.

**Migration risks**
- [ ] **Bulk script misassignment** — Keyword matching (e.g. "Sanity" in title → assign `sanity` tool) can produce false positives. Always dry-run and review before executing.
- [ ] **Historical content** — Some migrated WordPress content may not fit cleanly into the current taxonomy. Accept that ~10% of legacy content may need "best effort" tagging.
- [ ] Does the skip logic correctly handle documents where the target array does not yet exist? (`setIfMissing` handles absent arrays — a guard for "array not present" is likely wrong)
- [ ] Is the script idempotent? What happens if it runs twice?

**Schema risks**
- [ ] No schema changes — but verify that creating new taxonomy entries (categories, tags, tools) doesn't violate any naming conventions or controlled vocabulary rules

---

## Post-Epic Close-Out

1. **Activate the epic file:**
   - Assign the next sequential EPIC number (check `docs/prompts/` for the latest)
   - Move: `docs/backlog/EPIC-content-metadata-audit.md` → `docs/prompts/EPIC-{NNNN}-content-metadata-audit.md`
   - Update the **Epic ID** field inside the file to match
   - Commit: `docs: activate EPIC-{NNNN} Content Metadata Audit`
2. **Confirm clean tree** — `git status` must show nothing staged or unstaged
3. **Run mini-release** — `/mini-release EPIC-{NNNN} Content Metadata Audit & Taxonomy Backfill`
4. **Start next epic** — only after mini-release commit is confirmed

---

*Created 2026-03-15. Depends on stable taxonomy vocabulary (EPIC-0174 shipped). Complements existing `validate:content` checks A–G.*
