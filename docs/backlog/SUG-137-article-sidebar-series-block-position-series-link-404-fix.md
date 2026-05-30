---
**Epic:** SUG-137 — Article sidebar: series block position + series landing page
**Linear Issue:** [SUG-137](https://linear.app/sugartown/issue/SUG-137)
**Status:** In Progress
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-137 — Article sidebar: series block position + series landing page

Two sidebar issues on article detail pages (series block position, series link 404) plus a series landing page so the series title link resolves to a real destination.

## Background

The article sidebar (`PageSidebar.jsx`) rendered blocks in order: TOC → Related → Series → AI Disclosure. Series context should orient the reader before they read, not after. The series block also lacked visual separation. The series link 404'd because `series` is not registered in `TYPE_NAMESPACES` in `routes.js` — `getCanonicalPath({ docType: 'series', slug })` fell through to `/${slug}`, a root page path that doesn't exist.

Phase 1 (shipped): sidebar reorder + gray bounding box + series title rendered as plain text (no broken link). Phase 2 (this scope): build the `/series/:slug` landing page so the series title in the sidebar becomes a real navigable link.

## Objective

After Phase 2: each series has a dedicated page at `/series/:slug` listing all articles in the series in part order, with series title, description, and part links. The series title in the sidebar becomes a `<Link>` pointing to this page. `series` is registered in `TYPE_NAMESPACES`.

Layers touched: routes (`routes.js`), React frontend (new `SeriesPage.jsx`), GROQ queries (`queries.js`), App router (`App.jsx`). No schema changes — `series` schema already has `title`, `slug`, `description`. Series membership already queried via article's `series` reference field.

## Scope

### Phase 1 — Sidebar reorder + box (✅ shipped v0.25.6)

- [x] Move series block above TOC in `PageSidebar.jsx` render order
- [x] Wrap series block in `seriesBlock` modifier — `--st-color-bg-subtle` bg, `--st-color-border-medium` border
- [x] Series title rendered as plain text (no broken link) — temporary until Phase 2

### Phase 2 — Series landing page

- [ ] Register `series` in `TYPE_NAMESPACES` as `'series'` in `routes.js` — layer: routes
- [ ] Add `seriesBySlugQuery` to `queries.js`: fetch series doc (`title`, `slug`, `description`) + all articles in the series (`*[_type=="article" && references(^._id)]`) ordered by `partNumber asc` — layer: GROQ
- [ ] Add `/series/:slug` route in `App.jsx` pointing to `SeriesPage` — layer: router
- [ ] Build `SeriesPage.jsx` — series title + description, ordered part list with article links, back link to `/articles` — layer: frontend
- [ ] Restore `<Link>` on series title in `PageSidebar.jsx` now that the route exists — layer: frontend
- [ ] Add `SeriesPage` to Storybook with a fixture — layer: Storybook

## Acceptance criteria

- [ ] `/series/poc-contentful-vercel` (or equivalent slug) renders a page with the series title, description, and ordered article list
- [ ] Series title in article sidebar links to `/series/:slug` with no 404
- [ ] `getCanonicalPath({ docType: 'series', slug: 'x' })` returns `/series/x`
- [ ] `pnpm validate:urls` passes
- [ ] `pnpm validate:tokens` passes

## Technical notes

- **Activation audit:** read `apps/studio/schemas/documents/series.ts` to confirm available fields before writing the GROQ query. Current fields: `title`, `slug`, `description`. Articles reference series via `series` field (reference to `series` doc) + `partNumber` (number).
- **GROQ query shape:** articles-in-series must use `references(seriesDoc._id)` not a join — series is a reference field on `article`, not an array on `series`. Pattern: `*[_type=="article" && series._ref == $seriesId] | order(partNumber asc)`.
- **Route registration:** `TYPE_NAMESPACES` in `routes.js` — add `series: 'series'`. Check `getArchivePath` and `validateRoutes` for any downstream effects.
- **PageSidebar restore:** after the route exists, revert the `seriesTitle` plain-text element back to a `<Link to={getCanonicalPath({ docType: 'series', slug: series.slug })}>`.
- **Model & Mode:** `/model opusplan` — Opus plans (Pre-Execution Gate → Files to Modify), Sonnet executes.

### Schema field reference (no changes needed — for query authoring)

| Field on `series` | Type | Notes |
|-------------------|------|-------|
| `title` | string | Series display name |
| `slug` | slug | URL segment |
| `description` | text | Optional 2–3 sentence summary |

| Field on `article` | Type | Notes |
|--------------------|------|-------|
| `series` | reference → `series` | Which series this belongs to |
| `partNumber` | number | Order within series (1-indexed) |

## Non-Goals

- No series archive index page (`/series`) listing all series — out of scope.
- No schema changes to `series` or `article`.
- No Sanity content edits.

## Related

- **Linear:** [SUG-137](https://linear.app/sugartown/issue/SUG-137)
- **Epic template:** `docs/epic-template.md`
