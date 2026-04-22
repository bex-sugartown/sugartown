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
