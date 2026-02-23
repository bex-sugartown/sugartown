# EPIC TEMPLATE
# Sugartown — Claude Code Epic Prompt

> Copy this file, fill in each section, and paste the completed prompt to Claude Code.
> Sections marked **[REQUIRED]** must be complete before execution.
> Sections marked **[GUIDED]** contain inline checklists — work through them during authoring.
> Delete all instructional comments (lines starting with `>`) before pasting.

---

## EPIC NAME: [REQUIRED]

---

## Context [REQUIRED]

> State the current repo state relevant to this epic. Include:
> - Which files already exist that this epic will touch
> - Which doc types / routes / queries are in scope
> - Any recent epics that changed the same surface area

---

## Objective [REQUIRED]

> One paragraph. What exists after this epic that didn't before?
> Be specific about the data layer (Sanity schema), the query layer (GROQ),
> and the render layer (React) — all three must be explicitly addressed or
> explicitly excluded.

---

## Doc Type Coverage Audit [REQUIRED — complete before writing Scope]

> For EVERY epic that adds a new field, section type, schema object, or
> renderer: explicitly evaluate all five primary content doc types.
> "Not currently present" is NOT a valid skip reason.
> "Not architecturally appropriate because X" is.

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ Yes / ☐ No | |
| `article`   | ☐ Yes / ☐ No | |
| `caseStudy` | ☐ Yes / ☐ No | |
| `node`      | ☐ Yes / ☐ No | |
| `archivePage` | ☐ Yes / ☐ No | |

---

## Scope [REQUIRED]

> Bullet list of included tasks. Every task must map to at least one
> Deliverable and at least one Acceptance Criterion below.

- [ ] Studio schema changes
- [ ] Schema registration (`index.ts`)
- [ ] Document wiring (sections[] additions per doc type audit above)
- [ ] GROQ query projections (see Query Layer Checklist below)
- [ ] Frontend renderer
- [ ] CSS / styles
- [ ] Migration script (if backfilling existing data)
- [ ] Dry-run verification of migration script

---

## Query Layer Checklist [REQUIRED if any field or section type is added]

> GROQ projections are opt-in and are NOT automatically updated when
> schemas change. Every slug query that projects the modified field
> must be explicitly listed and updated.
>
> For section builder changes: list every query that projects `sections[]`.
> Add `_type == "newType" => { field1, field2 }` to each.

- [ ] `pageBySlugQuery` — add projection for new type/field
- [ ] `articleBySlugQuery` — add projection for new type/field
- [ ] `caseStudyBySlugQuery` — add projection for new type/field
- [ ] `nodeBySlugQuery` — add projection for new type/field
- [ ] Archive queries (`allArticlesQuery`, `allCaseStudiesQuery`, etc.) — add if card display needs field

> If a query is genuinely not affected, write the reason: e.g.
> "nodeBySlugQuery — excluded: node does not render sections[]"
> Do NOT leave entries blank.

---

## Non-Goals [REQUIRED]

> Explicit exclusions. Every exclusion must be deliberate, not a default.
> If you're excluding a doc type, write why (architectural reason, not
> "not currently present").

---

## Technical Constraints [REQUIRED]

> Cover all four layers. Do not leave any layer blank.

**Monorepo / tooling**
- pnpm workspaces; scripts at repo root; `apps/studio`, `apps/web`
- Migration scripts run as `node scripts/migrate/X.js` from repo root
- `nanoid` is installed in `apps/studio/node_modules`, NOT at root — use dynamic import with fallback:
  ```js
  const { nanoid } = await import('nanoid').catch(() => ({
    nanoid: () => Math.random().toString(36).slice(2, 11)
  }))
  ```
- All other migration script patterns: follow `scripts/migrate/lib.js` (dry-run default, `--execute` flag, 5s abort window, idempotency)

**Schema (Studio)**
- Section types are `object` schemas registered in `apps/studio/schemas/sections/`
- Must be imported and added to `schemaTypes` in `apps/studio/schemas/index.ts`
- Must be added as `defineArrayMember({type: '...'})` in EVERY doc type's `sections[]` field that is in scope per the doc type audit above

**Query (GROQ)**
- All queries in `apps/web/src/lib/queries.js`
- Slug queries use conditional projections: `_type == "X" => { fields }`
- Adding a new section type requires adding its projection to EVERY slug query that projects `sections[]` — the complete list as of this writing: `pageBySlugQuery`, `articleBySlugQuery`, `caseStudyBySlugQuery`, `nodeBySlugQuery`
- Archive queries (allArticlesQuery, etc.) project card-level fields only — add fields here only if the card display needs them

**Render (Frontend)**
- `PageSections.jsx` uses a switch statement; new section types require a new case AND a new sub-component
- CSS in `PageSections.module.css`; global class names require `:global(.classname)` wrapper in the module file
- All page templates that render `sections[]`: `ArticlePage.jsx`, `CaseStudyPage.jsx`, `NodePage.jsx`, `RootPage.jsx` — verify each is in scope per doc type audit

---

## Migration Script Constraints [REQUIRED if script is included in Scope]

> Complete this section if any backfill or data-transform script is part
> of the epic. Leave blank and mark N/A if no script.

**Target doc count**
Before writing the script, run a GROQ count query and record the expected number of documents to be modified:
```
count(*[_type == "X" && <target condition>])
```
Expected count: `___`

> This number is the acceptance criterion for the dry-run. If dry-run
> reports 0 (or an unexpected number), treat it as a bug, not a success.

**Skip condition review**
For each condition that causes a document to be skipped, state:
- What the condition is
- Why skipping is correct (not just "it seemed safe")
- Whether `setIfMissing` or another Sanity patch operation already handles the "absent field" case — if yes, a guard for that case is likely wrong

**Idempotency**
State how re-running the script produces no change:

---

## Files to Modify [REQUIRED]

> List every file expected to change. If a file is not listed here and
> needs to change during execution, that is a scope gap — stop and
> update the epic before proceeding.

**Studio**
- `apps/studio/schemas/sections/[newType].ts` — CREATE
- `apps/studio/schemas/index.ts` — add import + register
- `apps/studio/schemas/documents/[docType].ts` — one entry per in-scope doc type from audit

**Frontend**
- `apps/web/src/lib/queries.js` — one entry per in-scope query from Query Layer Checklist
- `apps/web/src/components/PageSections.jsx` — new case + sub-component
- `apps/web/src/components/PageSections.module.css` — new styles
- `apps/web/src/pages/[Page].jsx` — one entry per in-scope page from doc type audit

**Scripts**
- `scripts/migrate/[name].js` — CREATE (if migration in scope)
- `package.json` — add `migrate:[name]` script entry

---

## Deliverables [REQUIRED]

> Concrete, verifiable artifacts. Each must be independently checkable.
> Map each deliverable back to a task in Scope.

1. **Schema** — `[newType].ts` exists in `schemas/sections/`, is registered in `index.ts`
2. **Document wiring** — `sections[]` in each in-scope doc type includes `defineArrayMember({type: '[newType]'})`
3. **GROQ projections** — every slug query in the Query Layer Checklist includes `_type == "[newType]" => { ... }`
4. **Renderer** — `PageSections.jsx` has a `case '[newType]'` and renders the component without errors
5. **Styles** — at minimum a wrapper rule exists in `PageSections.module.css`
6. **Migration** (if in scope) — script runs dry-run with count matching the pre-flight expectation; runs `--execute` with 0 errors

---

## Acceptance Criteria [REQUIRED]

> Testable outcomes. Each must be falsifiable — "it works" is not an
> acceptable criterion.

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors (pre-existing errors are exempt — document them)
- [ ] Studio hot-reloads without errors; new section type appears in the section builder for every in-scope doc type
- [ ] Dry-run of migration script reports expected count (from pre-flight) — NOT zero unless pre-flight confirmed zero targets
- [ ] After `--execute`, re-running dry-run reports 0 documents to patch (idempotency)
- [ ] Frontend: navigating to a detail page for a doc that has the new section type renders the section (not blank, not error)
- [ ] GROQ query projection test: `nodeBySlugQuery` (and all other in-scope slug queries) return the new section's fields when queried against a document that has that section

---

## Risks / Edge Cases [REQUIRED]

> Think through failure modes before execution, not after.

**Schema risks**
- [ ] Does this new type introduce a field name that collides with any existing field on the parent document?
- [ ] Does this type reference other types (references, cross-doc) that may not be registered?

**Query risks**
- [ ] If this type is added to sections[], have ALL four slug queries been updated? (Use the Query Layer Checklist — do not rely on memory)
- [ ] Do archive queries need updating for card display, or are they intentionally excluded?

**Migration risks**
- [ ] What is the expected target count? (Run GROQ count before writing the script)
- [ ] Does the skip logic correctly handle documents where the target array does not yet exist? (`setIfMissing` handles absent arrays — a guard for "array not present" is likely wrong)
- [ ] Is the script idempotent? What happens if it runs twice?
- [ ] Are all dependencies available at the monorepo root? (`nanoid` is NOT — use the fallback pattern)

**Render risks**
- [ ] What renders if `section.html` (or the primary field) is null/undefined? (Explicit null guard in the component)
- [ ] Does `dangerouslySetInnerHTML` or similar require a security note in the deliverables?
- [ ] Is the new component wrapped in the correct CSS containment?
