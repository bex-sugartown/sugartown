# GROQ Reference

## Purpose

Cookbook of GROQ query patterns used in `apps/web`. Reference for understanding what data each content type produces and how to extend queries correctly.

## Context

All queries are defined in `apps/web/src/lib/queries.js`. No inline GROQ strings exist elsewhere in the codebase. Queries are consumed via `useSanityDoc()` and `useSanityList()` hooks.

## Details

### Taxonomy Fragments (reusable projections)

These are composed into content queries to avoid repetition:

```groq
// PERSON_FRAGMENT
"authors": authors[]->{
  _id, name, shortName, slug, image, titles, links
}

// CATEGORY_FRAGMENT
"categories": categories[]->{
  _id, name, slug, colorHex
}

// TAG_FRAGMENT
"tags": tags[]->{
  _id, name, slug
}

// PROJECT_FRAGMENT
"projects": projects[]->{
  _id, name, slug, colorHex
}
```

### Site Settings

```groq
// siteSettingsQuery
*[_type == "siteSettings"][0]{
  siteName, logo, favicon,
  primaryNav, headerCta, preheader,
  footerColumns, socialLinks, copyrightText,
  seo
}
```

### Articles

```groq
// allArticlesQuery
*[_type == "article"] | order(publishedAt desc) {
  _id, title, slug, excerpt, publishedAt,
  ...TAXONOMY_FRAGMENT
}

// articleBySlugQuery
*[_type == "article" && slug.current == $slug][0] {
  _id, title, slug, body, publishedAt,
  ...TAXONOMY_FRAGMENT,
  seo
}
```

### Case Studies

```groq
// allCaseStudiesQuery
*[_type == "caseStudy"] | order(publishedAt desc) {
  _id, title, slug, excerpt, featuredImage,
  ...TAXONOMY_FRAGMENT
}

// caseStudyBySlugQuery
*[_type == "caseStudy" && slug.current == $slug][0] {
  _id, title, slug, body, client, role,
  ...TAXONOMY_FRAGMENT,
  seo
}
```

### Knowledge Graph Nodes

```groq
// allNodesQuery
*[_type == "node"] | order(publishedAt desc) {
  _id, title, slug, excerpt, aiTool, status,
  ...TAXONOMY_FRAGMENT
}

// nodeBySlugQuery
*[_type == "node" && slug.current == $slug][0] {
  _id, title, slug, body, aiTool, conversationType,
  challenge, insight, actionItem,
  ...TAXONOMY_FRAGMENT,
  seo
}
```

### Archive Pages

```groq
// archivePageWithFilterConfigQuery
*[_type == "archivePage" && slug.current == $slug][0] {
  _id, title, description, hero,
  contentTypes, filterConfig, listStyle,
  sortBy, showPagination, enableFrontendFilters,
  featuredItems[]->, seo
}
```

### Taxonomy Browse

```groq
// allCategoriesQuery
*[_type == "category"] | order(name asc) { _id, name, slug, colorHex }

// allTagsQuery
*[_type == "tag"] | order(name asc) { _id, name, slug }

// allProjectsQuery
*[_type == "project"] | order(name asc) { _id, name, slug, colorHex }

// allPeopleQuery
*[_type == "person"] | order(name asc) { _id, name, shortName, slug, image }
```

### Filter Model

```groq
// facetsRawQuery — used by buildFilterModel() in filterModel.js
// Fetches all taxonomy items that appear on content within a given archive.
// See apps/web/src/lib/filterModel.js for full implementation.
```

### SEO Fragment

```groq
// SEO_FRAGMENT — merged with SITE_SEO_FRAGMENT in resolveSeo()
seo {
  metaTitle, metaDescription, ogImage
}
```

### Notes on Query Conventions

- `_type == "post"` is retired — use `_type == "article"` throughout
- Always project `slug.current` not `slug` (avoid sending the whole object)
- Taxonomy references always use `->` to dereference
- Use `$slug` as a parameter — never interpolate slug strings directly

## Related Files

- `apps/web/src/lib/queries.js` — all query definitions
- `apps/web/src/lib/sanity.js` — client instance
- `apps/web/src/lib/useSanityDoc.js` — hooks consuming these queries
- `apps/web/src/lib/filterModel.js` — filter model derivation
- `docs/schemas/schema-reference.md` — schema types these queries target

## Change History

| Date | Change |
|---|---|
| 2026-01-24 | Initial queries: siteSettings, nodes, posts, pages |
| 2026-02-19 | v0.8.0 — allArticlesQuery replaces allPostsQuery; taxonomy fragments added; archivePageWithFilterConfigQuery; facetsRawQuery |
| 2026-02-20 | Consolidated into `docs/queries/` during doc consolidation |
