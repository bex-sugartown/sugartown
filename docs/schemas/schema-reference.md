# Schema Reference

## Purpose

Canonical inventory of all Sanity schema types in `apps/studio`. Single source of truth for what document types, objects, and sections exist, what fields they carry, and their current status.

## Context

Schemas live in `apps/studio/schemas/`. The registry is `apps/studio/schemas/index.ts`. As of v0.8.0, the schema set includes documents, objects, sections, and a taxonomy layer across all content types.

## Details

### Document Types (with slugs)

These types produce routable URLs via `getCanonicalPath()` in `apps/web/src/lib/routes.js`.

| Type | Route | Status |
|---|---|---|
| `page` | `/:slug` | Active |
| `article` | `/articles/:slug` | Active (renamed from `post` in v0.8.0) |
| `caseStudy` | `/case-studies/:slug` | Active |
| `node` | `/nodes/:slug` | Active |
| `person` | `/people/:slug` | Active (detail page deferred) |
| `category` | `/categories/:slug` | Active (detail page deferred) |
| `tag` | `/tags/:slug` | Active (detail page deferred) |
| `project` | `/projects/:slug` | Active (detail page deferred) |
| `archivePage` | Drives archive routes | Active |

### Document Types (infrastructure / no slug)

| Type | Role |
|---|---|
| `siteSettings` | Singleton — global site config, nav, SEO defaults |
| `navigation` | Reusable navigation menus |
| `preheader` | Announcement bar content |
| `ctaButtonDoc` | Reusable CTA button documents |
| `homepage` | Homepage content (deprecated — use `page`) |

### Taxonomy Fields (all top-level content types)

As of v0.8.0, these four fields are present on `article`, `caseStudy`, `node`, and `page`:

| Field | Type | Notes |
|---|---|---|
| `authors[]` | `person` references | Replaces legacy `author` string |
| `projects[]` | `project` references | `colorHex` chip accent |
| `categories[]` | `category` references | `colorHex` chip accent |
| `tags[]` | `tag` references | Neutral chip |

### SEO Metadata Object (`seoMetadata`)

Embedded on `page`, `article`, `caseStudy`, `node`. Fields: `metaTitle`, `metaDescription`, `ogImage`. Merged at render time with site-level SEO defaults via `resolveSeo()` in `apps/web/src/lib/seo.js`.

### Archive Page (`archivePage`)

Controls archive landing pages. Key fields: `slug`, `contentTypes[]`, `title`, `description`, `hero`, `filterConfig`, `listStyle`, `sortBy`, `showPagination`, `enableFrontendFilters`, `featuredItems[]`, `seo`.

### Objects

| Object | Role |
|---|---|
| `link` | URL + label + openInNewTab + icon |
| `richImage` | Image asset + alt + caption + credit + URL |
| `ctaButton` | Button text + link + style variant |
| `editorialCard` | Card with image, title, text, CTA |
| `seoMetadata` | metaTitle + metaDescription + ogImage |
| `portableTextConfig` | Three presets: summary, standard, minimal |

### Sections (Page Builder)

| Section | Usage |
|---|---|
| `heroSection` | Hero with heading, subheading, image, CTAs |
| `textSection` | Generic content with Portable Text |
| `imageGallery` | Image grid / carousel |
| `ctaSection` | Call-to-action block |

### Legacy / Deprecated Schemas

These exist for backward compatibility. Do not add new content.

| Schema | Replaced by | Notes |
|---|---|---|
| `post` | `article` | File kept as dead reference — not registered |
| `header` | `siteSettings.primaryNav` | Shows deprecation warning in Studio |
| `footer` | `siteSettings.footerColumns` | Shows deprecation warning in Studio |
| `hero` | `page.sections[heroSection]` | Legacy data in Sanity, not rendered |
| `contentBlock` | `page.sections[textSection]` | Legacy data in Sanity, not rendered |

### Schema Registry

`apps/studio/schemas/index.ts` is the single registration point. All active types must be exported here. Adding a schema file without registering it here has no effect.

## Related Files

- `apps/studio/schemas/index.ts` — schema registry
- `apps/studio/schemas/documents/` — all document type definitions
- `apps/studio/schemas/objects/` — all object definitions
- `apps/studio/schemas/sections/` — page builder sections
- `apps/web/src/lib/queries.js` — GROQ queries consuming these schemas
- `apps/web/src/lib/routes.js` — URL namespace for slug-bearing types
- `docs/queries/groq-reference.md` — query patterns per schema

## Change History

| Date | Change |
|---|---|
| 2026-01-24 | Phase 1 schemas established: node, post, page, caseStudy, taxonomy |
| 2026-02-19 | v0.8.0 — person, archivePage, seoMetadata added; post→article rename; taxonomy fields on all types |
| 2026-02-20 | Consolidated from `apps/studio/schemas/README.md` and `apps/web/schemas/README.md` |
