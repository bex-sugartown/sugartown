# SUG-74 — Taxonomy Cleanup (tags / categories / tools)

**Linear Issue:** SUG-74
**Status:** Backlog
**Blocks:** SUG-73 Phase 1 (Dynamic Knowledge Graph render)
**Depends on:** Phase 0 CSV audit (`apps/web/scripts/audit/export-taxonomy-csv.js`) — **already shipped**
**Merge strategy:** (a) merge-as-you-go — one commit per consolidation pass.

---

## 1 — Why this exists

Sanity currently holds:
- 14 categories
- 96 tags
- 41 tools
- 5 projects
- 45 nodes

Before the dynamic knowledge graph (SUG-73) renders, the taxonomy needs a human pass. A graph that visualizes duplicates, orphans, and misfiled items will bake those errors into the UI. The CSV audit (Phase 0) surfaces them; this epic resolves them.

---

## 2 — Inputs

The four CSVs in `output/audit/`:
- `categories.csv` — id, title, slug, description, per-type usage counts, total
- `tags.csv` — same shape
- `tools.csv` — same shape
- `projects.csv` — same shape + `accentColor`
- `nodes.csv` — content docs with all four ref columns (joined by `; `) for cross-reference review

Bex reviews these in a spreadsheet and produces a consolidation plan (§3).

---

## 3 — Consolidation categories

For each taxonomy (categories, tags, tools, projects), classify every row into one bucket:

| Bucket | Action |
|--------|--------|
| **Keep** | No change |
| **Merge into {canonical}** | All references rewritten to canonical; losing doc deleted |
| **Rename slug/title** | Slug redirect registered; title updated |
| **Reclassify** | e.g. tag → category, tool → tag. Type changes, references rewritten |
| **Retire (orphan)** | Zero references; delete |
| **Needs description** | Published but missing `description`; queued for copy |

Plan lives in §5 of this doc and is filled in during review.

---

## 4 — Deliverables

1. **Review plan** — §5 of this doc, filled in after CSV review
2. **Migration script** — `apps/web/scripts/migrate-taxonomy-consolidation.js`
   - Idempotent; reads plan from a JSON sidecar (`migrate-taxonomy-consolidation.json`)
   - Operations: `merge`, `rename`, `reclassify`, `retire`, `setDescription`
   - Runs against Sanity via `@sanity/client` with write token
3. **Redirect registration** — any renamed slug gets a redirect entry (per existing `build-redirects.js` pattern)
4. **Post-run CSV** — re-run `export-taxonomy-csv.js`, commit the clean output alongside the migration for diff review
5. **Validator update** — extend `validate-content.js` / `validate-taxonomy.js` to flag orphans going forward

---

## 5 — Consolidation plan

> To be filled after Bex reviews the CSVs. Template below.

### Categories (14)
- _(rows pending review)_

### Tags (96)
- _(rows pending review)_

### Tools (41)
- _(rows pending review)_

### Projects (5)
- _(rows pending review)_

---

## 6 — Execution order

1. Fill §5 from the CSVs
2. Commit §5 (`docs(backlog): fill SUG-74 consolidation plan`)
3. Write migration script + JSON sidecar, review dry-run output, commit
4. Run migration (live), re-export CSVs, commit the clean snapshot
5. Register redirects in one commit
6. Extend validators in one commit
7. Close out epic per CLAUDE.md epic close-out sequence
8. Unblock SUG-73 Phase 1

---

## 7 — Out of scope

- Adding new taxonomy types (e.g. "medium", "theme")
- Description copywriting for every missing description (only the high-traffic ones where graph tooltips will show them — the rest queued as a content task)
- Any graph render work (that's SUG-73)
- Reclassifying the document type system itself (article / node / caseStudy) — only taxonomy docs
