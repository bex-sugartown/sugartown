---
**Epic:** SUG-137 — Article sidebar: series block position + series link 404 fix
**Linear Issue:** [SUG-137](https://linear.app/sugartown/issue/SUG-137)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-137 — Article sidebar: series block position + series link 404 fix

Two sidebar bugs on article detail pages: the series block renders below "On This Page" (TOC) instead of above it, and the series link 404s because `series` is not registered in `TYPE_NAMESPACES` in `routes.js`.

## Background

The article sidebar (`PageSidebar.jsx`) renders blocks in this order: TOC → Related → Series → AI Disclosure. When an article belongs to a series, the series block is visually buried below the table of contents — the opposite of what's useful (series context should orient the reader before they read, not after). The series block also lacks visual separation; it blends with surrounding blocks.

The series link 404s because `getCanonicalPath({ docType: 'series', slug })` in `routes.js` has no match in `TYPE_NAMESPACES` or `TAXONOMY_NAMESPACES`, so it falls through to `/${slug}` — a root page path that doesn't exist. There is no `/series/:slug` route in `App.jsx`. The series document type exists in the Sanity schema (`schemas/documents/series.ts`) but has never had a frontend route.

Affected page: any article with a `series` reference, e.g. `/articles/platform-selection-risk-composable-architecture`.

## Objective

After this epic: the series block renders at the top of the sidebar (above the TOC), wrapped in a light gray token bounding box so it reads as a distinct navigational element. The series link resolves to a valid URL. No new page or route is required — the link target is `/articles` filtered by series slug (or simply the series archive, if one exists), or the link is replaced with non-linking text if no canonical series URL exists yet.

Layers touched: React frontend (`PageSidebar.jsx`, `PageSidebar.module.css`), routes (`routes.js`). No schema changes. No Sanity content changes.

## Scope

- [ ] Move `{hasSeries && ...}` block above the TOC block in `PageSidebar.jsx` render order — layer: frontend
- [ ] Wrap series block in a styled container with `--st-color-bg-*` light gray token background and `border` using an existing border token — layer: frontend / CSS
- [ ] Fix series link: either (a) register `series` in `TYPE_NAMESPACES` + add a `/series/:slug` route + `SeriesPage` stub, or (b) change the `to=` prop to link to `/articles?series=<slug>` (filtered archive), or (c) make it non-linking text until a series index page exists. Decision: **option (c) — remove the `<Link>` wrapper and render the series title as plain text with the part number; no new route needed until a series index page is scoped.** A series title that links nowhere is worse than a title that doesn't link. Activation audit: re-read this decision before touching routes.js — if a `/series/:slug` route has been added by the time this activates, use option (a) instead. — layer: frontend
- [ ] Update `PageSidebar.stories.tsx` to cover the series-first render order — layer: Storybook

## Acceptance criteria

- [ ] On `/articles/platform-selection-risk-composable-architecture`, the series block ("POC: Contentful + Vercel / Part 1") renders above the "On This Page" TOC in the sidebar
- [ ] Series block has a visible but subtle gray bounding box (token-backed, not hardcoded)
- [ ] No 404 on the series block — either no link is present, or the link resolves to a valid page
- [ ] `pnpm validate:tokens` passes with zero errors after any CSS changes
- [ ] Storybook story covers series-first layout

## Technical notes

- **Root cause of 404:** `PageSidebar.jsx:189` calls `getCanonicalPath({ docType: 'series', slug: series.slug })`. `routes.js` has no `series` entry in `TYPE_NAMESPACES` or `TAXONOMY_NAMESPACES`, so the fallthrough produces `/${slug}` (e.g. `/poc-contentful-vercel-poc`). No route in `App.jsx` matches this pattern for series slugs.
- **Render order fix:** `PageSidebar.jsx` lines 151–196 — move the `{hasSeries && (...)}` block before `{hasToc && (...)}`.
- **CSS token pre-flight:** before adding any new class, run the CSS class proposal table gate per CLAUDE.md. Candidate: extend existing `styles.block` with a modifier, or add a `styles.seriesBlock` class. Check `--st-color-bg-subtle` or `--st-color-bg-surface-strong` for the box background — verify in `tokens.css` before using.
- **No schema changes required.** Series data is already fetched in the article query.
- **Activation audit:** read `apps/web/src/components/PageSidebar.jsx` lines 140–210 and `apps/web/src/lib/routes.js` `TYPE_NAMESPACES` block before writing any code.
- **Model & Mode:** `/model opusplan` — Opus plans (Pre-Execution Gate → Files to Modify), Sonnet executes.

## Files to modify (at activation)

| File | Change |
|------|--------|
| `apps/web/src/components/PageSidebar.jsx` | Move series block above TOC; remove `<Link>` wrapper on series title (or fix href) |
| `apps/web/src/components/PageSidebar.module.css` | Add `seriesBlock` modifier with gray bg token |
| `apps/web/src/components/PageSidebar.stories.tsx` | Update stories to reflect series-first render order |

## Non-Goals

- No `/series/:slug` route or `SeriesPage` component — series index pages are out of scope until a series archive epic is scoped.
- No changes to the Sanity `series` schema.
- No changes to GROQ queries — series data already projected.

## Related

- **Linear:** [SUG-137](https://linear.app/sugartown/issue/SUG-137)
- **Epic template:** `docs/epic-template.md`
