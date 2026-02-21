# Release Notes — v0.8.0

**Date:** 2026-02-19
**Branch:** `integration/parity-check` → `main`
**Scope:** Sugartown monorepo (`apps/web` + `apps/studio`)

---

## What this release is

Eight sequential stages completing the foundation of the Sugartown content system — routing, SEO, archiving, taxonomy, authorship, and a unified classification surface. This is the first merge to `main` since the monorepo was assembled.

---

## What changed

### The URL system is real now

Every content type has a canonical URL, built from a single source of truth (`routes.js`). No more hardcoded strings scattered through components. A dev-time validator (`pnpm validate:urls`) catches duplicate paths, missing slugs, and broken nav links before they ship.

Route namespace:

```
/articles/:slug        articles
/case-studies/:slug    case studies
/nodes/:slug           knowledge graph nodes
/:slug                 pages
```

Legacy `/blog` and `/post` URLs redirect to `/articles`.

---

### Archives are Sanity documents

Archive landing pages (`/articles`, `/case-studies`, `/knowledge-graph`) are now driven by `archivePage` documents in Studio — not hardcoded components. Publishing or unpublishing an archive doc controls whether that route returns content or 404. Title, description, hero, sort order, and filter configuration are all editable in Studio.

---

### SEO is wired end-to-end

Every content type and archive page resolves SEO metadata through a consistent merge chain: document-level overrides → site defaults. `<title>`, `<meta description>`, and Open Graph tags render on every page.

---

### Authors are people, not strings

Author attribution is now a reference to a `person` document, not a freeform string field. Person documents carry name, short name, bio, image, titles, and links (website, LinkedIn, GitHub, etc.). The legacy `author` string field on articles is hidden but kept for backward compatibility.

---

### Taxonomy is everywhere

All top-level content types (`article`, `caseStudy`, `node`, `page`) share a consistent classification surface:

| Field | Type |
|---|---|
| `authors[]` | Person references |
| `projects[]` | Project references |
| `categories[]` | Category references (with color) |
| `tags[]` | Tag references |

Taxonomy chips render uniformly on detail pages and archive listings via a shared `TaxonomyChips` component. Project and category chips respect `colorHex` values from Studio.

A filter model builder (`filterModel.js`) derives facet options and counts from live content — ready for filter UI in a future stage. `pnpm validate:filters` reports the derived model for each archive.

---

### "Blog Posts" is now "Articles"

The `post` schema type is renamed to `article` throughout — Studio UI, GROQ queries, routes, and production data. No URLs changed (they were already `/articles`).

---

### Studio reference pills no longer ghost

Multiple Studio bugs were fixed during this release:

- Async slug-uniqueness validators on all schemas were firing during reference pill preview resolution, blocking pill rendering across all content types. All async validators removed.
- The `person` schema's preview `prepare()` function was blocking author pill rendering. Simplified to a plain `select` projection.
- `options: { filter }` on `authors[]` reference fields was causing all saved references to display as blank. Filter removed.

---

## Not in this release

- **Filter bar UI** — the data model and filter derivation logic are complete; the UI is deferred
- **Taxonomy detail pages** — `/tags/:slug`, `/categories/:slug`, `/people/:slug` exist as placeholder routes; content is deferred
- **TaxonomyChips linking** — chips are non-linked pending taxonomy detail pages
- **apps/storybook** — no changes this release
- **packages/design-system** — no changes this release

---

## Validator state at release

```
pnpm validate:urls
✅  All checks passed — URL authority is clean.

pnpm validate:filters
✅  All filter models produced successfully.
```
