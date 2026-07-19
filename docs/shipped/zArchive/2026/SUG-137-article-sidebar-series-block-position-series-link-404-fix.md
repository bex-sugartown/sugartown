---
**Epic:** SUG-137 — Article sidebar: series block position + series landing page
**Linear Issue:** [SUG-137](https://linear.app/sugartown/issue/SUG-137)
**Status:** Complete
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-137 — Article sidebar: series block position + series landing page

Two sidebar issues on article detail pages (series block position, series link 404) plus a full series landing page and Studio taxonomy integration.

## Background

The article sidebar rendered blocks in order: TOC → Related → Series → AI Disclosure. Series context should orient the reader before they read, not after. The series block also lacked visual separation. The series link 404'd because `series` was not registered in `TYPE_NAMESPACES` in `routes.js` — `getCanonicalPath({ docType: 'series', slug })` fell through to `/${slug}`, a root page path that doesn't exist. The `series` document type existed in the Sanity schema but had no frontend route, no Studio taxonomy entry, and no way to manage membership from the series document itself.

## Objective

After this epic: series has a dedicated landing page at `/series/:slug` listing all parts in order. The series block renders at the top of the article sidebar with a visible bounding box. The series title in the sidebar is a working link. All four content types (article, node, caseStudy, page) can be tagged as part of a series. Membership and order are managed from the series document in Studio. `partNumber` on individual docs is an optional display hint — ordering is controlled by the `parts[]` array position on the series doc.

## Data model decisions

### Ordering — `parts[]` on series is authoritative

The series document holds a `parts[]` array of references to content docs. Array position = display order on the landing page. Drag to reorder in Studio.

`partNumber` on individual content docs is a **display hint only** — used in the article sidebar ("Part 1") and as a fallback label on the series landing page when `partNumber` is not explicitly set. It no longer controls order and does not need to match the array position.

### Fallback query

`seriesBySlugQuery` uses `coalesce(parts[]->{ ... }, reverse-lookup)` — if `parts[]` is populated, it wins; if empty, falls back to `*[series._ref == ^._id]` ordered by `partNumber`. This preserves backwards compatibility for any series doc not yet migrated to `parts[]`.

### Part number derivation on series landing page

`SeriesPage.jsx` displays `part.partNumber ?? i + 1` — explicit part number if set, array index + 1 otherwise. Editors can leave `partNumber` unset and rely on array order.

### All content types can join a series

`series` and `partNumber` fields added to `caseStudy` and `page` schemas (already existed on `article` and `node`). `PageSidebar` wired in CaseStudyPage and RootPage. The sidebar shows the series block for any content type that has a `series` reference.

## Shipped scope

### Phase 1 — Sidebar reorder + box (✅ v0.25.6)

- [x] Move series block above TOC in `PageSidebar.jsx` render order
- [x] `seriesBlock` modifier — `--st-color-bg-subtle` bg, `--st-color-border-medium` border (neutral-300)
- [x] Series title as plain text temporarily (no broken link)

### Phase 2 — Series landing page + full wiring (✅ this epic)

- [x] `series: 'series'` registered in `TYPE_NAMESPACES` in `routes.js`
- [x] `seriesBySlugQuery` in `queries.js` — coalesce `parts[]->` with reverse-lookup fallback
- [x] `/series/:slug` route in `App.jsx` → `SeriesPage`
- [x] `SeriesPage.jsx` — series title, description, ordered part list with type badge (ARTICLE / NODE / CASE STUDY / PAGE), pink part number label, links to each part
- [x] Sidebar `<Link>` restored — series title links to `/series/:slug`
- [x] `series` + `partNumber` fields added to `caseStudy.ts` and `page.ts` schemas — schema deployed
- [x] `PageSidebar` wired with `series` + `partNumber` in `CaseStudyPage.jsx` and `RootPage.jsx`
- [x] `parts[]` array added to `series.ts` schema — references `[article, node, caseStudy, page]`, drag-to-reorder, Studio taxonomy index includes Series
- [x] POC series `parts[]` backfilled via MCP and published
- [x] Part number falls back to array index + 1 in `SeriesPage.jsx`

## Files modified

| File | Change |
|------|--------|
| `apps/web/src/components/PageSidebar.jsx` | Series block moved to top; `seriesBlock` class; `<Link>` restored |
| `apps/web/src/components/PageSidebar.module.css` | `seriesBlock`, `seriesLink`, `seriesTitle`, `seriesPart` styles |
| `apps/web/src/lib/routes.js` | `series: 'series'` in `TYPE_NAMESPACES` |
| `apps/web/src/lib/queries.js` | `seriesBySlugQuery`; `series`+`partNumber` projected in `pageBySlugQuery` and `allCaseStudiesQuery` |
| `apps/web/src/App.jsx` | `/series/:slug` route |
| `apps/web/src/pages/SeriesPage.jsx` | New — series landing page |
| `apps/web/src/pages/pages.module.css` | `seriesPartList`, `seriesPartItem`, `seriesPartNumber`, `seriesPartContent`, `seriesPartType`, `seriesPartLink` |
| `apps/web/src/pages/CaseStudyPage.jsx` | `series` + `partNumber` passed to `PageSidebar` |
| `apps/web/src/pages/RootPage.jsx` | `series` + `partNumber` passed to `PageSidebar` |
| `apps/studio/schemas/documents/series.ts` | `parts[]` array field added |
| `apps/studio/schemas/documents/caseStudy.ts` | `series` + `partNumber` fields added |
| `apps/studio/schemas/documents/page.ts` | `series` + `partNumber` fields added |
| `apps/studio/sanity.config.ts` | Series added to Taxonomy index in Studio structure |

## Non-Goals

- No `/series` archive index listing all series.
- No automatic sync between `article.series` reference and `series.parts[]` — editors manage both sides; `parts[]` is authoritative for order.

## Related

- **Linear:** [SUG-137](https://linear.app/sugartown/issue/SUG-137)
