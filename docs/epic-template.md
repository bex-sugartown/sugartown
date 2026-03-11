# EPIC TEMPLATE
# Sugartown — Claude Code Epic Prompt

> Copy this file, fill in each section, and paste the completed prompt to Claude Code.
> Sections marked **[REQUIRED]** must be complete before execution.
> Sections marked **[GUIDED]** contain inline checklists — work through them during authoring.
> Delete all instructional comments (lines starting with `>`) before pasting.

---

## Epic Lifecycle

Epics follow a two-stage lifecycle:

**1. Backlog** (`docs/backlog/EPIC-{name}.md`)
- Authored without a number; filename is `EPIC-{descriptive-name}.md`
- Status: BACKLOG (not yet scheduled for execution)

**2. Activation** (when execution begins)
- Move the file from `docs/backlog/` to `docs/prompts/`
- Assign the next sequential EPIC number (e.g. EPIC-0163)
- Rename the file: `EPIC-0163-{name}.md`
- Update the **Epic ID** field inside the file to match
- Commit the activation as part of the epic's first commit

> The `docs/prompts/` folder holds only **completed** and **in-flight** numbered epics.
> The `docs/backlog/` folder holds **unscheduled** epics awaiting prioritization.

---

**Epic ID:** EPIC-0000
## EPIC NAME: [REQUIRED]

---

## Pre-Execution Completeness Gate [REQUIRED — complete before writing Scope or Phases]

> This checklist must be fully ticked before execution begins. An incomplete brief is a
> process failure, not a starting condition. If any item cannot be answered, resolve it
> first — do not proceed.

- [ ] **Interaction surface audit** — before creating any new interactive element (button, link, card, form control, chip), search for existing components, utilities, CSS surfaces, and schemas that serve the same interaction across all four layers: `src/components/`, `src/design-system/`, `src/lib/`, `apps/studio/schemas/`. List what exists and state whether you are extending it, replacing it (with justification), or confirming no equivalent exists. If an existing component covers 80%+ of the use case, extend it via props — do not fork.
- [ ] **Use case coverage** — if this epic creates a new component or web adapter, list the known consumers and interaction patterns it must support (e.g. "internal SPA links, external links, mailto/tel, button-only with no href"). Confirm the API covers all of them, or explicitly note which are deferred and why. A 1:1 port from another layer that only covers the source layer's use case is not sufficient — the target layer's use cases must be enumerated.
- [ ] **Layout contract** — positive statement of the component/section layout contract is written (not just a non-goals list). For grid/card layouts, include a **dimensional contract**: target card width, max-width for list view, sidebar width, gap, and the resulting page max-width (formula: `card_w × cols + gap × (cols-1) + sidebar + sidebar_gap + padding = max-width`)
- [ ] **All prop value enumerations** — every `select` / enum prop has its full `options.list` copied from the schema (see Schema Enum Audit below); none reconstructed from memory
- [ ] **Correct audit file paths** — every file listed in the audit phase has been verified to exist at the stated path (`ls` or Read the file before referencing it in the brief)
- [ ] **Dark / theme modifier treatment** — explicit statement of how dark mode, light mode, or themed variants are handled by this component (token inheritance, `[data-theme]`, `accentColor`, or "not applicable — why")
- [ ] **Studio schema changes scoped** — if this epic requires schema changes, they are either (a) explicitly in scope with their own commit prefix `feat(studio):`, or (b) explicitly out of scope with a reference to the epic that owns them. No implicit schema changes.
- [ ] **Web adapter sync scoped** — if a DS component is created or modified, the web adapter update is either (a) in scope (listed in Files to Modify), or (b) explicitly deferred to a named follow-on epic

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
- [ ] Web adapter sync (if DS component created or modified — see Technical Constraints)
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

## Schema Enum Audit [REQUIRED if any enum field is rendered or displayed]

> Before writing any display-label map or rendering any `select` / `radio`
> enum field from Sanity, open the schema file and read the field's
> `options.list` array. The stored `value` is **not** the same as the UI
> `title` — never assume they match, and never build a label map from memory.
>
> **Cross-doc-type coverage**: if the same logical field (e.g. `status`)
> appears on multiple doc types, check **all** of them — option lists differ
> between types. A map that covers `article` status values is not complete
> for `node` status values.
>
> Complete this table before writing any render code:

| Field name | Schema file | `value` → Display title (copy from `options.list`) |
|-----------|-------------|-----------------------------------------------------|
| `status` | `article.ts` / `node.ts` / `caseStudy.ts` | e.g. `active → Active`, `implemented → 🚀 Implemented` |
| `aiTool` | `node.ts` | e.g. `claude → 🤖 Claude`, `mixed → 🔀 Agentic Caucus` |
| `conversationType` | `node.ts` | e.g. `architecture → 🏗️ Architecture Planning` |

> Leave rows blank for fields not in scope. Add rows for any other enum field touched.

> **Badge-rendering components (status, evolution, lifecycle):**
> If this epic renders status/badge values from Sanity fields on a card or listing surface,
> complete the following per-doc-type vocabulary table **before writing any STATUS_BADGE_CLASS
> or display-label map**. Copy `value` strings verbatim from the schema `options.list` — do
> not reconstruct from memory. A single missing value causes a silent badge failure (no class,
> no visible badge) that is hard to detect in testing.
>
> | Doc type    | Field name | Schema file        | All valid `value` strings (copy from `options.list`) |
> |-------------|------------|--------------------|------------------------------------------------------|
> | `node`      | `status`   | `node.ts`          | _e.g. exploring, validated, operationalized, deprecated, evergreen_ |
> | `project`   | `status`   | `project.ts`       | _e.g. dreaming, designing, developing, testing, deploying, iterating_ |
> | `article`   | `status`   | `article.ts`       | _e.g. draft, active, archived_ |
> | `caseStudy` | `status`   | `caseStudy.ts`     | _e.g. draft, active, archived_ |
>
> Leave rows blank for doc types not in scope. The `value` column must be **exhaustive** —
> "etc." is not valid. If legacy values exist (kept for backward compat), list them too.

---

## Metadata Field Inventory [REQUIRED if MetadataCard or any metadata surface is in scope]

> For any epic that adds, moves, or changes fields rendered in MetadataCard
> or a similar structured metadata surface: complete this table before
> writing code. It prevents fields being missed, rendered outside the
> component, or merged incorrectly.
>
> **Taxonomy display rule (non-negotiable):**
> `projects[]`, `categories[]`, and `tags[]` always render as **three
> separately labelled rows** — never merged into a single "Classification",
> "Taxonomy", or combined row. This applies to MetadataCard and any future
> metadata surface. Enforce it in the AC and in code review.

| Field | Sanity field name | Doc types that have it | Current render location | Post-epic render location |
|-------|------------------|----------------------|------------------------|--------------------------|
| Author | `authors[]` / `author` (legacy) | article, caseStudy, node | | |
| Status | `status` | article, caseStudy, node | | |
| AI Tool | `aiTool` | node | | |
| Conversation type | `conversationType` | node | | |
| Client | `client` | caseStudy | | |
| Role | `role` | caseStudy | | |
| Tools | `tools[]` | article, caseStudy, node | | |
| Projects | `projects[]` | article, caseStudy, node | | |
| Categories | `categories[]` | article, caseStudy, node | | |
| Tags | `tags[]` | article, caseStudy, node | | |

> Add or remove rows to match what's actually in scope. "Not in scope" is a
> valid entry for Post-epic render location — but it must be deliberate.

---

## Themed Colour Variant Audit [REQUIRED if any component or surface is themed]

> Any epic that touches CSS tokens, component styles, or creates/modifies
> a themed surface must complete this table. "Will inherit from tokens" is
> not a sufficient answer — specify the actual value or token for each theme.
>
> Omitting this table is what causes post-delivery change requests like
> "change inline code from maroon to lime in dark mode."
>
> Themes in scope: **dark** (default) | **light** | **pink-moon**
> Token files: `apps/web/src/design-system/styles/tokens.css` (web canonical)
>             `packages/design-system/src/styles/tokens.css` (DS package, must stay in sync)

| Surface / component | Dark | Light | Pink Moon | Token(s) to set |
|---------------------|------|-------|-----------|-----------------|
| e.g. Inline code bg | `rgba(209,255,29,0.10)` | `--st-color-softgrey-100` | TBD | `--st-code-inline-bg` |
| e.g. Inline code text | `var(--st-color-lime)` | `var(--st-color-maroon)` | TBD | `--st-code-inline-color` |

> If a surface is genuinely not themed (e.g. it always inherits from a parent
> that is already covered), state that explicitly: "inherits from `--st-color-bg-canvas`
> — no per-theme override needed."

---

## Non-Goals [REQUIRED]

> Explicit exclusions. Every exclusion must be deliberate, not a default.
> If you're excluding a doc type, write why (architectural reason, not
> "not currently present").
>
> **Studio schema changes**: if this epic does NOT own schema changes, say so explicitly here
> and name the epic that does. Studio changes bundled silently into component epics make
> history harder to bisect and revert.

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
- **Explicit field types (non-negotiable)**: every new schema field added by this epic must have its Sanity `type` explicitly declared in this epic doc before code is written (e.g. `string`, `text`, `number`, `boolean`, `slug`, `reference`, `array of reference`, `object`, `image`). Do not leave field types implicit or rely on Sanity default inference — type must be specified in both the epic definition and the `defineField` call.

**Query (GROQ)**
- All queries in `apps/web/src/lib/queries.js`
- Slug queries use conditional projections: `_type == "X" => { fields }`
- Adding a new section type requires adding its projection to EVERY slug query that projects `sections[]` — the complete list as of this writing: `pageBySlugQuery`, `articleBySlugQuery`, `caseStudyBySlugQuery`, `nodeBySlugQuery`
- Archive queries (allArticlesQuery, etc.) project card-level fields only — add fields here only if the card display needs them

**Render (Frontend)**
- `PageSections.jsx` uses a switch statement; new section types require a new case AND a new sub-component
- CSS in `PageSections.module.css`; global class names require `:global(.classname)` wrapper in the module file
- All page templates that render `sections[]`: `ArticlePage.jsx`, `CaseStudyPage.jsx`, `NodePage.jsx`, `RootPage.jsx` — verify each is in scope per doc type audit
- **Taxonomy display (non-negotiable)**: `projects[]`, `categories[]`, and `tags[]` must each render as their own separately labelled row. Never merge into a combined row or group. Violating this is a bug, not a style choice.
- **Enum display-label maps**: every enum field rendered must have a label map built from the schema's `options.list` (see Schema Enum Audit above). Raw stored values (`"architecture"`, `"claude"`) must never appear in the UI.

**Design System → Web Adapter Sync**
- `apps/web` does NOT import from `@sugartown/design-system`. It has its own JSX adapter layer at `apps/web/src/design-system/components/`.
- When a DS component is created or modified in `packages/design-system/src/components/`, a matching web adapter **must** be created or updated in the same epic:
  1. **JSX adapter** — `apps/web/src/design-system/components/{name}/{Name}.jsx` — thin JSX wrapper mirroring the DS `.tsx` (strip TypeScript, same props/structure)
  2. **CSS module** — copy the `.module.css` from the DS component directory verbatim
  3. **Index** — add the export to `apps/web/src/design-system/index.js`
  4. **Dependencies** — if the DS component uses a library (e.g. `lucide-react`, `prismjs`), add it to `apps/web/package.json` too
- If a DS component's CSS module changes, the web adapter's CSS module must be updated to match (same drift rule as `tokens.css`)

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

**Web Adapter Sync** (if DS component created or modified)
- `apps/web/src/design-system/components/[name]/[Name].jsx` — CREATE or UPDATE
- `apps/web/src/design-system/components/[name]/[Name].module.css` — COPY from DS
- `apps/web/src/design-system/index.js` — add export
- `apps/web/package.json` — add runtime deps if needed (e.g. `lucide-react`, `prismjs`)

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
- [ ] **Enum coverage**: for every enum field rendered, every `options.list` entry in the schema is represented in the display-label map — verified by reading the schema, not from memory. Verified across all doc types in scope (a map that covers `article` `status` values is not necessarily complete for `node` `status` values)
- [ ] **Taxonomy rows**: if taxonomy fields are rendered, each type (`projects[]`, `categories[]`, `tags[]`) appears as its own separately labelled row in the UI — confirmed by visual inspection on a document that has all three populated
- [ ] **Route smoke-test**: navigate to the archive route (e.g. `/projects`) AND the detail route (e.g. `/projects/sugartown-cms`) for at least one real published document — both routes must render without 404, without runtime errors, and with correct Sanity data (not an empty/placeholder state). If this epic adds a new doc type, test both archive and detail.

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
- [ ] **Enum display**: has the Schema Enum Audit been completed for every enum field in scope? Raw stored values must never reach the UI.
- [ ] **Enum cross-doc-type coverage**: if a field (e.g. `status`) exists on multiple doc types, has the label map been verified against the schema for each type separately?
- [ ] **Taxonomy layout**: if taxonomy fields are rendered, is each type (`projects[]`, `categories[]`, `tags[]`) rendered as its own row — not merged?

---

## Post-Epic Close-Out [REQUIRED]

> Run these steps in order after all Acceptance Criteria are met and the working tree is committed.

1. **Confirm clean tree** — `git status` must show nothing staged or unstaged
2. **Run mini-release** — `/mini-release EPIC-XXXX [Epic name]`
   - Produces a patch version bump and lightweight CHANGELOG stub
   - Two gates: review stub → "Write it", then commit plan → "Commit it"
3. **Start next epic** — only after mini-release commit is confirmed

> If this epic warrants a MINOR version bump (new feature surface, new schema fields,
> new page component) rather than a patch, run `/release` instead of `/mini-release`.
