# Sugartown — Claude Code Epic Prompt

**Epic ID:** EPIC-0162 _(assign on activation)_
## EPIC NAME: Tool Document Type — Phase 1: Schema, Seed & Desk Structure

**Status:** ✅ SHIPPED as EPIC-0162 (v0.16.1, 2026-03-08)
**Activation trigger:** ~~When a Tools archive page (`/tools`) or tool detail page (`/tools/:slug`) enters the IA roadmap.~~ Shipped — combined Phase 1 + Phase 2 in single execution.
**Last reviewed:** 2026-03-09 — gap audit completed; validator fixed, schema fields backfilled, tool-tag redirects wired.

---

## Why This Is Deferred

The `tools[]` field on `article`, `caseStudy`, and `node` is already a working string enum (30 values). It already satisfies all current use cases:
- Display in MetadataCard
- Filtering via FilterBar facets
- Validation via `pnpm validate:taxonomy` (check C)

A `tool` document type would add richer metadata (description, URL, `toolType` category, logo image) — but that metadata has nowhere to surface until a Tools archive or tool detail page exists in the IA. Creating the schema before the product surface adds complexity with no user benefit: the desk structure gains an untested section, the seed script must be maintained, and the reference migration (Phase 2) becomes a future liability.

**Do not execute this epic until the IA brief (`docs/ia-brief.md`) is updated to include `/tools`.**

---

## Context

### What already exists — DO NOT recreate

**v0.11.0:**
- `tools[]` string enum (30-item) on `article`, `caseStudy`, `node`
- `scripts/validate-taxonomy.js` — Check C validates `tools[]` values against `CANONICAL_TOOLS`
- `CANONICAL_TOOLS` in `validate-taxonomy.js` is the authoritative live list; this document's copy is a snapshot only

**Post-EPIC-0145 state (assumed at execution time):**
- `person.ts` will have been extended (headline, pronouns, expertise, socialLinks, seo)
- `PersonProfilePage` and `ProjectDetailPage` will exist
- `TaxonomyDetailPage` will still handle `/tags/:slug` and `/categories/:slug`

### Files this epic will create or modify

- `apps/studio/schemas/documents/tool.ts` — CREATE
- `apps/studio/schemas/index.ts` — add `tool` import + register
- `apps/studio/sanity.config.ts` — add Tools section to Taxonomy desk structure
- `scripts/seed-tools.js` — CREATE
- Root `package.json` — add `seed:tools` script entry

### Files this epic does NOT touch (Phase 1)

- `apps/web/src/lib/queries.js` — no frontend query until a Tools page exists
- `apps/web/src/pages/` — no new page until `/tools` enters the IA
- `article.ts`, `caseStudy.ts`, `node.ts` — `tools[]` stays as string enum
- `scripts/validate-taxonomy.js` — Check C already works against the string enum; no changes needed

---

## Objective

After this epic: (1) `tool` is a first-class Sanity document type with defined fields (`name`, `slug`, `toolType`, `description`, `url`, `logo`); (2) 30 canonical tool records exist in Sanity production, seeded from `CANONICAL_TOOLS`; (3) the Studio desk structure shows a Tools section under Taxonomy; (4) `validate-taxonomy.js` is unchanged — Check C continues to validate the string enum on content docs.

**Data layer:** `tool.ts` schema + 30 seed records.
**Query layer:** NOT IN SCOPE — no frontend page; no GROQ queries needed.
**Render layer:** NOT IN SCOPE — no frontend page; no renderer needed.

This epic is pure Studio-side infrastructure. The frontend layer and the string → reference migration are Phase 2 and require a confirmed IA decision first.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ No | Pages have no `tools[]` field and no relationship to `tool` documents |
| `article`   | ☐ No | `tools[]` stays as string enum; reference migration is Phase 2 |
| `caseStudy` | ☐ No | Same as article |
| `node`      | ☐ No | Same as article |
| `archivePage` | ☐ No | Structural config doc; no tool relationship |

No content doc types are in scope for Phase 1. The only schema change is the new `tool` document type itself.

---

## Scope

- [ ] Create `apps/studio/schemas/documents/tool.ts` document schema
- [ ] Register `tool` in `apps/studio/schemas/index.ts`
- [ ] Add Tools section to Taxonomy in `apps/studio/sanity.config.ts` desk structure
- [ ] Create `scripts/seed-tools.js` — dry-run default, `--execute` for live writes, idempotent

---

## Query Layer Checklist

All queries excluded from Phase 1. No frontend page exists; no GROQ projection is needed for `tool` documents until Phase 2.

- `pageBySlugQuery` — EXCLUDED: `tool` is not a page type; no sections[] relationship
- `articleBySlugQuery` — EXCLUDED: `tools[]` string field unchanged; no reference projection needed
- `caseStudyBySlugQuery` — EXCLUDED: same as article
- `nodeBySlugQuery` — EXCLUDED: same as article
- Archive queries — EXCLUDED: no tools archive query until `/tools` page enters the IA

---

## Schema Enum Audit

| Field name | Schema file | `value` → Display title |
|-----------|-------------|--------------------------|
| `toolType` | `tool.ts` (CREATE) | `ai → AI`, `design → Design`, `development → Development`, `cms → CMS`, `analytics → Analytics`, `productivity → Productivity`, `other → Other` — **read the schema after creation to confirm exact values; do not build label maps from this document** |

No render code is in scope for Phase 1. This audit is recorded so Phase 2 can build label maps from the schema rather than from memory.

---

## Metadata Field Inventory

N/A — no MetadataCard or metadata surface changes in scope for Phase 1.

---

## Non-Goals

- **Frontend page (`/tools`, `/tools/:slug`):** No React component, no route, no GROQ query. This is the Phase 2 trigger — requires IA brief update first.
- **`tools[]` string → document reference migration:** `tools[]` on `article`, `caseStudy`, `node` stays as a string enum. The migration to `reference` type is Phase 2 — only justified once tool documents are confirmed stable and a UI exists that benefits from richer metadata. See Phase 2 scope below.
- **New DS component:** No new component in `packages/design-system`. No web adapter sync required.
- **`apps/storybook`:** No changes.
- **`validate-taxonomy.js` changes:** Check C already validates `tools[]` string values against `CANONICAL_TOOLS`. No changes needed until Phase 2 converts the field to references.

---

## Phase 2 Scope (deferred — separate epic, requires IA confirmation)

Phase 2 must be a new epic. Prerequisites before writing it:
- `/tools` archive page is confirmed in the IA brief
- Tool document records from Phase 1 have been in production for at least one release cycle (slugs must be stable before migrating references to them)

Phase 2 includes:
1. Migrate `tools[]` string enum → `tools[]` array of `reference` type on `article.ts`, `caseStudy.ts`, `node.ts`
2. Write migration script: for each content document, for each string value in `tools[]`, look up the `tool` document with matching `slug.current` and replace the string with a reference `{ _type: 'reference', _ref: toolDoc._id }`
3. Update GROQ projections in `queries.js`: add `tools[]->{ name, slug, toolType }` dereference to `articleBySlugQuery`, `caseStudyBySlugQuery`, `nodeBySlugQuery`, and archive queries as needed
4. Update MetadataCard and FilterBar to handle reference objects (`tool.name`, `tool.slug`) rather than raw strings
5. Update `validate-taxonomy.js` Check C: replace string enum validation with reference-existence check
6. Create `ToolsArchivePage.jsx` (or equivalent) and register route in `App.jsx` and `routes.js`
7. **Wire legacy WP tool-tag redirects:** For each tool document, create a `301` redirect from `/tag/[tool-slug]` → `/tools/[tool-slug]` in Sanity redirect schema and `apps/web/public/_redirects`. These were deferred from EPIC-0155 (URL Audit) because the `/tools/:slug` route must exist before the redirect target is valid. At implementation time, cross-reference the EPIC-0155 decision registry for the confirmed list of tool-tag slugs to wire.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; scripts at repo root; `apps/studio`, `apps/web`
- `seed-tools.js` runs as `node scripts/seed-tools.js` from repo root (not inside `apps/studio`)
- `nanoid` is installed in `apps/studio/node_modules`, NOT at the repo root — use dynamic import with fallback:
  ```js
  const { nanoid } = await import('nanoid').catch(() => ({
    nanoid: () => Math.random().toString(36).slice(2, 11)
  }))
  ```
- All seed/migration script patterns: dry-run default, `--execute` flag, 5s abort window in execute mode, idempotency. Follow `scripts/migrate/lib.js` for env loading and the dry-run/execute/abort pattern.

**Schema (Studio)**
- `tool` is a `document` schema (not a `section` object) — file goes in `apps/studio/schemas/documents/`
- Register in `schemas/index.ts` in the documents section alongside `person`, `tag`, `category`, `project`
- `toolType` is a required `select` field with a controlled enum — values categorise tool *types*, not tool slugs
- `slug` field is required with `slugify(name)` as source — slug stability is critical: it is the anchor for the Phase 2 reference migration

**Canonical tool list — source of truth**
At execution time, read the `CANONICAL_TOOLS` set from `apps/web/scripts/validate-taxonomy.js`. Do NOT use the snapshot below as the canonical source — the enum may have changed.

Snapshot as of 2026-02-28 (30 values):
```
acquia, aem, celum, chatgpt, claude, claude-code,
contentful, css, drupal, figma, gemini, git, github,
javascript, linear, matplotlib, mermaid, netlify, networkx,
codex, oracle-atg, python, react, sanity, shopify,
storybook, turborepo, typescript, vite, wordpress
```

**`toolType` categorisation for seed script**
Use this mapping as a starting point — review and update before seeding, as miscategorised tools are hard to correct en masse after publication:

| toolType | Tools |
|---------|-------|
| `ai` | chatgpt, claude, claude-code, codex, gemini |
| `design` | figma |
| `development` | css, git, github, javascript, matplotlib, mermaid, networkx, python, react, storybook, turborepo, typescript, vite |
| `cms` | acquia, aem, celum, contentful, drupal, oracle-atg, sanity, shopify, wordpress |
| `analytics` | _(none currently — reserve for future additions)_ |
| `productivity` | linear, netlify |
| `other` | _(reserve as fallback)_ |

**Query (GROQ)**
Not in scope for Phase 1.

**Render (Frontend)**
Not in scope for Phase 1.

**Design System → Web Adapter Sync**
Not required — no new DS component created.

---

## Migration Script Constraints

**`scripts/seed-tools.js`**

Before writing the script, run a GROQ count query and record the expected state:
```groq
count(*[_type == "tool"])
```
Expected count before first seed: `0`. If non-zero, idempotency logic must skip existing slugs.

**Skip condition:** Skip creating a `tool` document if a `tool` document with the same `slug.current` already exists. `setIfMissing` is NOT used here — we are creating documents, not patching fields. A slug-existence check before each create is correct:
```js
const existing = await client.fetch(
  `*[_type == "tool" && slug.current == $slug][0]._id`,
  { slug: toolSlug }
)
if (existing) { skipped++; continue }
```

**Idempotency:** Re-running `--execute` after initial seed produces 0 creates (all slugs already exist). Dry-run always reports the correct would-create count regardless of existing state.

**`_id` generation:** Use `nanoid` with the fallback pattern from Technical Constraints. Prefix with `tool-` for readability: `` `tool-${nanoid()}` ``.

**Env pattern:** Match env loading from `scripts/migrate/lib.js`. Required vars: `VITE_SANITY_PROJECT_ID` (or `SANITY_PROJECT_ID`), `SANITY_DATASET`, `SANITY_TOKEN`. Verify `SANITY_TOKEN` has write access before running `--execute`.

---

## Files to Modify

**Studio**
- `apps/studio/schemas/documents/tool.ts` — CREATE
- `apps/studio/schemas/index.ts` — add `tool` import + register in documents section
- `apps/studio/sanity.config.ts` — add Tools list to Taxonomy desk section

**Scripts**
- `scripts/seed-tools.js` — CREATE
- Root `package.json` — add `"seed:tools": "node scripts/seed-tools.js"` script entry

---

## Deliverables

1. **`tool` schema** — `apps/studio/schemas/documents/tool.ts` exists with fields: `name` (string, required), `slug` (slug, required, slugify source), `toolType` (select, required, 7 options), `description` (text, optional), `url` (url, optional), `logo` (image, optional)
2. **Schema registration** — `tool` is imported and registered in `apps/studio/schemas/index.ts`; Studio loads without errors
3. **Desk structure** — `apps/studio/sanity.config.ts` has a Tools list item in the Taxonomy section; clicking it shows the list of `tool` documents
4. **Seed script** — `scripts/seed-tools.js --dry-run` logs exactly N tools it would create (where N = count of `CANONICAL_TOOLS` at execution time — read from `validate-taxonomy.js`, not from this document); `--execute` creates all N tools; re-running `--execute` creates 0 (idempotent)
5. **`package.json` entry** — `pnpm seed:tools` runs the script without error from repo root

---

## Acceptance Criteria

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors (document pre-existing errors before starting)
- [ ] Studio hot-reloads without errors after schema registration
- [ ] `tool` document type appears in Studio under the Taxonomy desk section
- [ ] `scripts/seed-tools.js --dry-run` logs the correct would-create count (NOT zero) and makes no writes to Sanity
- [ ] `scripts/seed-tools.js --execute` creates all tool documents; re-run reports 0 created (idempotency confirmed)
- [ ] Each tool document has: `name`, `slug`, `toolType` populated; `description`, `url`, `logo` may be empty
- [ ] `pnpm validate:urls` passes — no routes broken
- [ ] `pnpm validate:filters` passes — filter model unaffected
- [ ] `pnpm validate:taxonomy` passes — Check C still validates string enum on content docs (no regression)
- [ ] **Enum coverage:** `toolType` options in `tool.ts` exactly match the 7 values listed in Schema Enum Audit — verified by reading the schema, not from memory
- [ ] **Phase 2 gate (record now):** EPIC-0155 decision registry contains a DEFER entry for each tool-related `/tag/:slug` URL, with note referencing this epic. At Phase 2 activation, confirm that list before wiring redirects.

---

## Risks / Edge Cases

**Schema risks**
- [ ] Does any existing schema already use `tool` as a type name? Run `grep -r '"tool"' apps/studio/schemas/` before creating the file. (If EPIC-0145 executed before this epic, check whether `tool.ts` already exists.)
- [ ] `toolType` enum: confirm no value collides with existing enum fields on other document types.

**Seed script risks**
- [ ] Canonical tool count: read `CANONICAL_TOOLS` from `validate-taxonomy.js` at execution time — the set may have changed since the 2026-02-28 snapshot in this document. Count mismatch between snapshot and live file is expected after any v0.x tooling update.
- [ ] `toolType` mapping: the suggested mapping in Technical Constraints is a starting point. Review before seeding — miscategorised tools are difficult to correct en masse after publication.
- [ ] `nanoid` unavailable at repo root — always use the dynamic import fallback; do not add `nanoid` as a root-level dependency.
- [ ] `SANITY_TOKEN` must have write access to the production dataset before running `--execute`. Check using a dry-run first.
- [ ] The 5s abort window in execute mode must give the operator time to Ctrl-C if the dry-run count looks wrong. Do not remove the abort window.

**Phase 2 risks (record now; detail in that epic)**
- [ ] `tools[]` reference migration: each string value must map to exactly one `tool` document by slug. Any string value with no matching slug is an error — investigate before migrating; do not silently drop values.
- [ ] MetadataCard and FilterBar currently receive `tools[]` as `string[]`. After Phase 2 schema change, they receive `{name, slug, toolType}[]`. Both components must be updated in the same epic as the schema migration — a partial migration (schema changed, components not updated) breaks the tools display with no fallback.
- [ ] `validate-taxonomy.js` Check C must be updated in Phase 2 to validate reference existence rather than string membership. Updating the schema without updating the validator leaves Check C silently passing on invalid data.
