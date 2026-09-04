---
paths:
  - "apps/studio/schemas/**"
  - "apps/studio/**/*.ts"
---
# Sanity schema authoring

Loads when a session reads Studio schema code. Moved verbatim from `CLAUDE.md` on 2026-09-04 (ST-112); rule-file edits go through the Instruction & Rule File Write Gate exactly as `CLAUDE.md` does.

### Studio schema changes get their own commit

Any change to `apps/studio/schemas/` that is **not** a direct consequence of a DS component API decision goes in its own commit, prefixed `feat(studio):` or `fix(studio):`, never bundled into a component, tooling, or web epic commit. If a schema change unblocks a component epic, commit the schema first and the component work after.

**Schema changes are not live until deployed.** The local Studio uses your code directly, but MCP tools (`create_documents`, `patch_documents`, etc.) and the Content Lake API validate against the **deployed** schema. After any schema change, run:

```bash
npx sanity schema deploy
```

Skipping it makes MCP writes fail with validation errors listing the old allowed types while Studio works fine locally — the most common cause of "the schema has the field but MCP rejects it".

### Paired schema convention

When an **object schema** and a **document schema** represent the same logical concept, they are a linked pair. Any change to option labels, field names, validation rules, or field descriptions on one must be reviewed against the other in the same commit.

Known pairs:
- `ctaButton` (object, `schemas/objects/ctaButton.ts`) ↔ `ctaButtonDoc` (document, `schemas/documents/ctaButtonDoc.ts`)

When adding a new object/document pair, register it in this list. A fix to one half of a pair that misses the other is a bug, not a follow-up.

### Single Field Authority

Each user-facing concept (label, title, description, URL) must resolve from **exactly one field**. If a sub-object (e.g. `linkItem`) brings a field that overlaps with a parent schema field (e.g. `ctaButton.text` vs `linkItem.label`), one must be canonical and the other must be hidden or removed in the same commit.

When composing a sub-object into an existing schema, audit the parent for field-purpose overlap before merging. Two fields that could hold the same value is a bug.

## Schema Conventions

Full schema authoring rules are in `docs/conventions/schema-conventions.md`. Key rules enforced here:

- **Taxonomy primary field is `name`** — all five taxonomy types (`tag`, `category`, `person`, `project`, `tool`) use `name` as the field identifier, not `title`. GROQ queries use `->name`; never `->title`. The `queries.js` fragments alias it as `"title": name` for component consumption.
- **Preview block** must use `select: { title: 'name' }` so Studio lists display correctly.
- When creating a new taxonomy type, follow the required-fields table in `docs/conventions/schema-conventions.md`.
- **Field descriptions must state validation limits inline** — any field with a `Rule.max()`/`Rule.min()` char or count constraint states it in `description`, one parenthetical, e.g. `(max. 100 characters)` / `(soft max. 125 characters)` / `(min. 1)`. Merge into an existing trailing parenthetical rather than stacking a second one. Applies to any structured-content schema in the monorepo, not just Sanity. See `docs/conventions/schema-conventions.md` §Field descriptions.
