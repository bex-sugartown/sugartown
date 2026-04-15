# SUG-62 — Schema Hygiene: Deprecations, Field Removals, Page Cleanup

**Linear Issue:** SUG-62
**Created:** 2026-04-12 (split from SUG-52 field audit)

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — changes are schema-only. No new interactive elements. MetadataCard, GROQ queries, and page renderers must be audited for references to removed/renamed fields.
- [x] **Use case coverage** — N/A (no new components)
- [x] **Layout contract** — N/A (no layout changes)
- [x] **All prop value enumerations** — N/A (no new enums)
- [x] **Correct audit file paths** — verified below
- [x] **Dark / theme modifier treatment** — N/A (schema-only)
- [x] **Studio schema changes scoped** — this epic IS the schema change epic. All changes listed explicitly.
- [x] **Web adapter sync scoped** — N/A (no DS component changes)
- [x] **Composition overlap audit** — removing overlapping fields is the point of this epic
- [x] **Atomic Reuse Gate** — N/A (no new components or objects)

---

## Context

During the SUG-52 metadata field audit (2026-04-12), several schema issues were identified:

- The `page` schema carries taxonomy fields (`categories`, `tags`, `projects`) that are never used on static pages and clutter the Studio editing experience
- The `page` schema is missing `aiDisclosure` (added to article, node, caseStudy in SUG-55 but missed on page)
- Several fields are deprecated in code comments but not hidden in Studio (`template`, `priority`, `outcomes`, `kpis`)
- Previously deprecated fields (`author` legacy, `aiTool`, `conversationType`, `relatedProjects`, `cardImage`) need confirmation that they are properly hidden

---

## Objective

Clean up the Sanity schema so that Studio editors see only active, relevant fields per document type. Remove taxonomy clutter from `page`, add missing `aiDisclosure` to `page`, and hide deprecated fields that are still visible. No frontend rendering changes. No data deletion (fields are hidden, not removed from the schema definition, so existing data is preserved).

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | Yes | Remove categories/tags/projects, add aiDisclosure, deprecate template |
| `article` | No | Already clean; confirm deprecated fields are hidden |
| `caseStudy` | Yes | Hide outcomes field |
| `node` | No | Already clean; confirm deprecated fields are hidden |
| `project` | Yes | Hide priority, hide kpis |
| `archivePage` | No | No metadata fields to clean |

---

## Scope

- [ ] Remove `categories`, `tags`, `projects` fields from `page` schema (or hide with `hidden: true`)
- [ ] Add `aiDisclosure` field to `page` schema (same definition as article/node/caseStudy)
- [ ] Hide `template` field on `page` (add `hidden: true`, keep field definition for backward compat)
- [ ] Hide `priority` field on `project`
- [ ] Hide `outcomes` field on `caseStudy`
- [ ] Hide `kpis` field on `project`
- [ ] Confirm already-deprecated fields are hidden: `author` (article), `aiTool` (node), `conversationType` (node), `relatedProjects` (article, node, caseStudy), `cardImage` (article, node, caseStudy)
- [ ] Deploy schema: `npx sanity schema deploy` from `apps/studio/`
- [ ] Update GROQ queries if any reference removed fields

---

## Query Layer Checklist

- [ ] `pageBySlugQuery` — remove projections for `categories`, `tags`, `projects` if present; add `aiDisclosure` projection
- [ ] `articleBySlugQuery` — no changes expected (confirm)
- [ ] `caseStudyBySlugQuery` — no changes expected (confirm)
- [ ] `nodeBySlugQuery` — no changes expected (confirm)
- [ ] Archive queries — remove `page` taxonomy projections if present

---

## Schema Enum Audit

N/A. No new enum fields. `template` field is being hidden, not changed.

---

## Metadata Field Inventory

| Field | Action | Doc types affected |
|-------|--------|-------------------|
| `categories` | Remove from `page` | page |
| `tags` | Remove from `page` | page |
| `projects` | Remove from `page` | page |
| `aiDisclosure` | Add to `page` | page |
| `template` | Hide (deprecated) | page |
| `priority` | Hide (deprecated) | project |
| `outcomes` | Hide (deprecated) | caseStudy |
| `kpis` | Hide (deprecated) | project |

---

## Non-Goals

- No data migration or deletion (hidden fields preserve existing data)
- No frontend rendering changes (this is schema cleanup only)
- No new components or UI surfaces
- Schema changes that feed the margin column (`relatedNodes` rename, `related` field additions, `series`/`partNumber` on node) belong to SUG-52 Phase 0.5

---

## Technical Constraints

**Schema (Studio)**
- Use `hidden: true` for deprecation rather than removing field definitions. This preserves existing data and avoids migration scripts.
- `aiDisclosure` on `page`: type `string`, placed in metadata group, same title/description as on article/node/caseStudy schemas.

**Query (GROQ)**
- Remove any `page` query projections that reference `categories[]`, `tags[]`, `projects[]`. These may not exist in queries today (page doesn't render taxonomy chips), but verify.

**Render (Frontend)**
- If `RootPage.jsx` or any page renderer references `categories`, `tags`, or `projects` from page data, remove those references. Likely none exist since pages don't render MetadataCard with taxonomy.

**Monorepo / tooling**
- Schema deploy required after changes: `npx sanity schema deploy` from `apps/studio/`

---

## Migration Script Constraints

N/A. No data migration. Fields are hidden, not removed.

---

## Files to Modify

**Studio**
- `apps/studio/schemas/documents/page.ts` — remove categories/tags/projects, add aiDisclosure, hide template
- `apps/studio/schemas/documents/project.ts` — hide priority, hide kpis
- `apps/studio/schemas/documents/caseStudy.ts` — hide outcomes
- `apps/studio/schemas/documents/article.ts` — confirm deprecated fields hidden (audit only)
- `apps/studio/schemas/documents/node.ts` — confirm deprecated fields hidden (audit only)

**Frontend**
- `apps/web/src/lib/queries.js` — remove page taxonomy projections if present
- `apps/web/src/pages/RootPage.jsx` — remove taxonomy references if present

---

## Deliverables

1. **Schema cleanup** — `page` no longer shows categories/tags/projects in Studio
2. **aiDisclosure on page** — field visible in page metadata tab
3. **Deprecated fields hidden** — template (page), priority (project), outcomes (caseStudy), kpis (project) no longer appear in Studio
4. **Schema deployed** — `npx sanity schema deploy` run successfully
5. **Deprecation audit** — confirmed all previously deprecated fields are hidden

---

## Acceptance Criteria

- [ ] `page` documents in Studio show no categories, tags, or projects fields
- [ ] `page` documents in Studio show aiDisclosure field in metadata group
- [ ] `template` field is hidden on page documents (not visible in Studio)
- [ ] `priority` field is hidden on project documents
- [ ] `outcomes` field is hidden on caseStudy documents
- [ ] `kpis` field is hidden on project documents
- [ ] Schema deployed without errors
- [ ] Existing page documents with previously saved categories/tags/projects data are not affected (data preserved, just hidden)
- [ ] No frontend rendering regressions on any page type

---

## Risks / Edge Cases

- [ ] **Data preservation** — hiding fields must not delete existing data. Use `hidden: true`, not field removal.
- [ ] **Query references** — verify no GROQ queries depend on page taxonomy fields before removing projections
- [ ] **RootPage rendering** — verify RootPage doesn't pass taxonomy data to any component before removing from queries
- [ ] **aiDisclosure on page** — verify the field definition matches the existing one on article/node/caseStudy exactly (same type, same description, same group)

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-62-schema-hygiene.md` to `docs/shipped/SUG-62-schema-hygiene.md`
2. Confirm clean tree
3. Run `/mini-release`
4. Transition SUG-62 to Done in Linear
