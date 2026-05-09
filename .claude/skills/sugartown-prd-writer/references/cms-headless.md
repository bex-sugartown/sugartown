# CMS / Headless Reference — PRD Writer

Use this file when writing a PRD for any work touching content model, GROQ queries,
Sanity Studio, or headless rendering.

---

## Stack Assumptions

- **CMS:** Sanity.io (`poalmzla` / `production`)
- **Frontend:** React, CSS Modules, Vite, Netlify
- **Monorepo:** pnpm + Turborepo (`apps/studio`, `apps/web`, `packages/design-system`)
- **Query language:** GROQ

---

## Content Model Conventions

### The Five Primary Doc Types

Every epic that adds a field or section type must explicitly evaluate all five:

| Doc type | Route pattern | Notes |
|----------|--------------|-------|
| `page` | `/:slug` | Generic pages; catches routes not owned by other types |
| `article` | `/articles/:slug` | Long-form editorial |
| `caseStudy` | `/work/:slug` | Portfolio case studies |
| `node` | `/notes/:slug` | Knowledge graph entries (AI-narrated) |
| `archivePage` | `/[type]` | Listing pages; controlled by Sanity |

"Not currently present" is not a valid reason to exclude a doc type from the audit.
"Not architecturally appropriate because X" is.

### Section Builder

All content doc types support a `sections[]` array. Section types are `object` schemas.

**When a new section type is added:**
- Schema file lives in `apps/studio/schemas/sections/[newType].ts`
- Must be registered in `apps/studio/schemas/index.ts`
- Must be added as `defineArrayMember({type: '...'})` to every in-scope doc type's `sections[]`
- GROQ projection must be added to every slug query that projects `sections[]`

### Deprecated Fields (Never Use)

- `featuredImage` — **DEPRECATED.** Must never appear in new implementations. Use
  `hero.media[0]` or `sections[]` as the image source. If you see it in scope materials,
  flag it and exclude it.

---

## GROQ Contract Conventions

### Slug Queries (the canonical list as of current build)

These four queries project `sections[]`. Any new section type must be added to all four:

- `pageBySlugQuery`
- `articleBySlugQuery`
- `caseStudyBySlugQuery`
- `nodeBySlugQuery`

Location: `apps/web/src/lib/queries.js`

### Projection Pattern for New Section Types

```groq
_type == "newSectionType" => {
  field1,
  field2,
  "derivedField": someExpression
}
```

Add this block to the `sections[]` projection in every affected slug query.

### Archive Queries

Archive queries project card-level fields only. Add fields here only if the card display
needs them. Archive queries are separate from slug queries — changes to one don't
automatically affect the other.

---

## Render Layer Conventions

### PageSections Switch

`apps/web/src/components/PageSections.jsx` uses a `switch` statement. New section types
require:
1. A new `case` in the switch
2. A new sub-component

### CSS

Component CSS lives in `PageSections.module.css`. Global class names inside a CSS Module
require `:global(.classname)` wrapper.

### Web Adapter Pattern

`apps/web` does NOT import directly from `packages/design-system`. It has its own JSX
adapter layer at `apps/web/src/design-system/components/`.

When a DS component is created or changed, the adapter must be updated in the same epic
(or the deferred epic must be explicitly named).

---

## Content State Rules

- Published-only posture: draft documents must never render in production
- `contentState.js` enforces this at build time
- New doc types and queries must respect published-only filtering

---

## Common PRD Failure Modes (CMS Domain)

- Field types left as "TBD" — unblocks nothing; engineers will guess wrong
- Enum `options.list` not exhaustive — causes silent badge failures at render time
- GROQ projection assumed to auto-update when schema changes — it does not; opt-in only
- `featuredImage` referenced anywhere in new scope — it's deprecated; remove it
- Redirect destination routes don't exist yet — tool-related redirects must defer to Tools epic
