# Schema Conventions

Conventions for authoring Sanity schema documents in `apps/studio/schemas/`.

---

## Taxonomy primitives — primary display field

All five taxonomy primitive types (`tag`, `category`, `person`, `project`, `tool`) use **`name`** as the primary display field identifier. Not `title`.

```ts
// Correct
{
  name: 'name',
  title: 'Tag Name',   // Studio label — can be anything descriptive
  type: 'string',
  validation: Rule => Rule.required()
}

// Wrong — do not use 'title' as the field identifier on taxonomy docs
{
  name: 'title',
  type: 'string',
}
```

The distinction matters because:
- GROQ queries fetch by field identifier (`name`), not Studio label (`title`)
- `*[_type == "tag"]{ name }` works; `*[_type == "tag"]{ title }` returns null
- The shared GROQ fragments in `apps/web/src/lib/queries.js` project `"title": name` to normalise the display field for components — querying `title` directly on taxonomy docs will silently return nothing

**When creating any new taxonomy document type**, use `name` as the field identifier for the human-readable display label.

---

## Taxonomy primitives — required fields

Every taxonomy document type must have at minimum:

| Field | Identifier | Type | Notes |
|-------|-----------|------|-------|
| Display label | `name` | `string` | Required, validated |
| URL slug | `slug` | `slug` | Source: `name`; required |
| Description | `description` | `text` | Optional but expected |

Additional fields per type:
- `category` — `parent` (reference to another `category`), `colorHex`
- `tool` — `toolType` (string enum — see `tool.ts` for values)
- `person` — `shortName`, `titles`, `bio`, `image`, social links
- `project` — `projectId`, `status`, `accentColor`

---

## Preview configuration

Use `select: { title: 'name' }` in the preview block so Studio lists show the `name` value in the title slot:

```ts
preview: {
  select: { title: 'name', subtitle: 'slug.current' },
  prepare({ title, subtitle }) {
    return { title: title || 'Untitled', subtitle }
  }
}
```

---

## GROQ — querying taxonomy name

When projecting taxonomy references in GROQ, always dereference to `name`:

```groq
// Correct
categories[]->name
tools[]->name
tags[]->name

// Wrong — returns null for all taxonomy types
categories[]->title
tools[]->title
```

The fragment pattern in `queries.js` normalises this: `"title": name` maps `name` → a `title` key for component consumption. This is a projection alias, not a schema field.

---

## Object vs document schema pairs

When an **object schema** and a **document schema** represent the same logical concept (e.g. `ctaButton` / `ctaButtonDoc`), they are a linked pair. Any change to option labels, field names, validation rules, or field descriptions on one must be reviewed against the other in the same commit. See CLAUDE.md §Paired schema convention.

---

## Field authority — one field per concept

Each user-facing concept must resolve from exactly one field. If a sub-object brings a field that overlaps with a parent schema field, one must be canonical and the other hidden or removed. See CLAUDE.md §Single Field Authority.


---

## Field descriptions — state validation limits inline

Any field with a length or count constraint (`Rule.max()`, `Rule.min()`, `Rule.length()`) must state that constraint in its `description`, so the limit is visible before an author starts typing, not after Studio rejects the value on save. This applies to every field type, not just taxonomy, and to any structured-content schema authored anywhere in the monorepo, not only `apps/studio/schemas/` — per the platform-agnostic-by-design doctrine (see the Contentful + Vercel POC, SUG-127), the same rule holds if a field is ever authored for a second CMS adapter.

**Phrasing convention — one parenthetical, not two:**

| Constraint | Note text |
|---|---|
| Hard `.max(N)` on `string`/`text` (blocks save) | `(max. N characters)` |
| Soft `.max(N).warning(...)` on `string`/`text` (nags, doesn't block) | `(soft max. N characters)` |
| `.min(N)` on an array or number | `(min. N)` |
| `.max(N)` on an array or number | `(max. N)` |
| Both bounds on the same field | `(N–M)` |

```ts
// Correct — single parenthetical, limit stated up front
{
  name: 'title',
  type: 'string',
  description: 'Internal reference title (max. 100 characters)',
  validation: (Rule) => Rule.max(100),
}

// Wrong — no limit stated; author only finds out on save
{
  name: 'title',
  type: 'string',
  description: 'Internal reference title',
  validation: (Rule) => Rule.max(100),
}
```

**If a description already ends in a parenthetical** (an `(e.g. ...)` example, a `(required)` note), merge the limit into that same bracket with a comma rather than appending a second bracket:

```ts
// Correct — merged into the existing (e.g. ...) bracket
description: 'What was measured (e.g. "Analyst prep time", "Conversion rate", max. 100 characters)',

// Wrong — two adjacent bracket groups
description: 'What was measured (e.g. "Analyst prep time", "Conversion rate") (max 100 characters)',
```

Applies to every `defineField` with a length/count `Rule`, including nested fields inside `defineArrayMember` objects (e.g. an `outcomeItem` inside a `cardSection`). SUG-207 brought all existing fields into compliance in one pass; new fields should ship compliant from the start rather than needing a retrofit.

---

## Schema manifest — auto-generated ERD data (SUG-114)

`apps/web/src/data/schemaManifest.js` is generated automatically at build time. Do not edit it directly or commit it to git (it is gitignored).

**Generator:** `scripts/generate-schema-manifest.mjs`
**Build trigger:** wired into `apps/web/package.json` build script — runs before every `vite build`
**Manual run:** `pnpm generate:schema-manifest` from the repo root

The generator walks `apps/studio/schemas/documents/` and `apps/studio/schemas/objects/`, parses field names and reference targets via regex, and emits `entities[]` and `relationships[]`.

**Known exclusions:**
- `portableTextConfig` — configuration object, not a schema type; excluded by design
- `answerBlock.ts` — filename is stale; the file defines `citedBlock`, which IS included in the manifest

**Count assertion:** The generator exits non-zero if `entities.length < 42` (the known baseline at SUG-114 ship). If a type is intentionally removed, update `ENTITY_FLOOR` in the generator.

**When you add a new schema type:** No action needed — the generator picks it up automatically on next build. If the new type is a reference target for existing types, the new relationship edges will also appear automatically.
