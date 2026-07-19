---
**Epic:** SUG-165 — Archive and detail page H1 audit — holder header standardisation
**Linear Issue:** [SUG-165](https://linear.app/sugartown/issue/SUG-165/archive-and-detail-page-h1-audit-holder-header-standardisation)
**Status:** Shipped (2026-06-13)
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-165 — Archive and detail page H1 audit — holder header standardisation

Audit all non-hero archive and detail pages for H1 sizing and weight inconsistencies; standardise on a consistent `PageHeader` holder-header pattern at the DS-specified size.

## Outcome (as shipped)

**Phase 1** — Added `--st-font-page-h1: 3rem` (48px) semantic token; `PageHeader.title` switched from `--st-font-heading-2` (36px) to it. Every page already on `PageHeader` (all archives via `ArchivePage`/`SiteGraphPage`/`GlossaryArchivePage`/`TaxonomyArchivePage`, plus `TaxonomyDetailPage` and `ProjectDetailPage`) now renders the H1 at 48px automatically. Commit `b3437b0a`.

**Phase 2** — Extended `PageHeader` with two composable slots — `eyebrow` (mono uppercase kicker above the title) and `children` (trailing content below the description); `title` already accepted ReactNode. Migrated the four folio pages (`ToolDetailPage`, `PersonProfilePage`, `GlossaryTermPage`, `SeriesPage`) plus `GlossaryTermDetailPage.stories.jsx` off `.narrativeHeading`, which was deleted from `pages.module.css`. Closure grep `grep -rn narrativeHeading apps/web/src/` returns zero. Commit `a0d86a9c`.

**Design decision (Visual QA approved 2026-06-13):** eyebrows standardised **above** the title (kicker convention). `SeriesPage` already did this; Tool ("CMS · Platform") and Person (headline) eyebrows moved up from below the name.

**Spun-off cleanups (separate commits, not bundled):**
- `ec77bee7` — removed 3 unrouted dead archive components (`ArticlesArchivePage`, `CaseStudiesArchivePage`, `KnowledgeGraphArchivePage`) found during the App.jsx routing audit.
- `b21bf5c3` — removed the dead entity-folio CSS cluster (`.detailEyebrow`, `.entityFolio`, `.folioIdentity`, `.entityDescription`, `.entityThumbnail`, `.entityThumbnailFallback`) orphaned by the Phase 2 migration.

**Verification:** all page-types confirmed at 48px live (1280px), light + dark, correct italic/roman, folios intact, no console errors. `validate:tokens` + `--strict-colors` clean; web build exits 0.

<!-- Chromatic: pending — deferred 2026-06-13. PageHeader story updated (eyebrow + children, anatomy/token/changelog). Storybook running on :6006; Chromatic VRT not yet run (external publish held). Run before merge to origin/main. -->

## Background

`PageHeader` is already the canonical H1 surface for most archive and taxonomy pages, but it uses `--st-font-heading-2` (2.25rem = **36px**, 400 weight) — the scale's second tier, not the page-level H1 spec. The DS typography convention (Storybook `/story/foundations-typography-conventions--default`) specifies the page H1 at 48px. Four detail/entity pages bypass `PageHeader` entirely and use the `pages.module.css` `.narrativeHeading` class instead (`clamp(1.75rem, 3.5vw, 2.5rem)` = **max 40px**, 600 weight). The result: every non-hero page on the site has an undersized H1, and detail pages additionally have a different weight and no consistent holder-header structure.

## Full H1 audit — current state

### Pages already using `PageHeader` (token fix only — size wrong, structure correct)

> **Corrected after App.jsx routing read (activation audit).** The live archive
> renderers are NOT the per-type `*ArchivePage` files originally listed — `/articles`,
> `/case-studies`, and `/library` are all served by the generic `ArchivePage.jsx`
> (`archiveSlug` prop), and `/knowledge-graph` is served by `SiteGraphPage.jsx`. All of
> these use `PageHeader`, so the token fix flows to them automatically. See the dead-code
> note below the table.

| Page file (live renderer) | Route(s) | italic? | Current font-size | Current weight | Target |
|-----------|----------|---------|-------------------|----------------|--------|
| `ArchivePage` | `/articles`, `/case-studies`, `/library` | italic | `--st-font-heading-2` = 36px | 400 | 48px italic |
| `SiteGraphPage` | `/knowledge-graph` | italic | `--st-font-heading-2` = 36px | 400 | 48px italic |
| `GlossaryArchivePage` | `/glossary` | italic | `--st-font-heading-2` = 36px | 400 | 48px italic |
| `TaxonomyArchivePage` | `/tools`, `/people`, `/tags`, `/categories`, `/projects` | italic | `--st-font-heading-2` = 36px | 400 | 48px italic |
| `TaxonomyDetailPage` (via `TaxonomyPlaceholderPage`) | `/tags/:slug`, `/categories/:slug` | roman | `--st-font-heading-2` = 36px | 400 | 48px roman |
| `ProjectDetailPage` | `/projects/:slug` | roman | `--st-font-heading-2` = 36px | 400 | 48px roman |

**Dead-code note (out of scope — flag for separate cleanup):** `ArticlesArchivePage.jsx`,
`CaseStudiesArchivePage.jsx`, and `KnowledgeGraphArchivePage.jsx` exist on disk and import
`PageHeader`, but are referenced **0×** in `App.jsx` — they are unrouted. They will inherit
the token fix if ever re-routed, but they are not part of this epic's QA surface. A cleanup
task to delete them should be raised separately (do not bundle into SUG-165).

### Pages NOT using `PageHeader` — migration required (size and structure both wrong)

| Page file | Route(s) | italic? | CSS class | Current font-size | Current weight | Target |
|-----------|----------|---------|-----------|-------------------|----------------|--------|
| `GlossaryTermPage` | `/glossary/:slug` | roman | `.narrativeHeading` | `clamp(1.75–2.5rem)` max 40px | 600 | 48px roman via `PageHeader` |
| `PersonProfilePage` | `/people/:slug` | italic | `.narrativeHeading .narrativeHeadingItalic` | `clamp(1.75–2.5rem)` max 40px | 600 | 48px italic via `PageHeader` |
| `SeriesPage` | `/series/:slug` | roman | `.narrativeHeading` | `clamp(1.75–2.5rem)` max 40px | 600 | 48px roman via `PageHeader` |
| `ToolDetailPage` | `/tools/:slug` | roman | `.narrativeHeading` | `clamp(1.75–2.5rem)` max 40px | 600 | 48px roman via `PageHeader` |

**5th callsite (Storybook — required for closure grep to reach zero):**
`apps/web/src/components/GlossaryTermDetailPage.stories.jsx:84` also renders `.narrativeHeading`.
The closure AC (`grep -rn "narrativeHeading" apps/web/src/` returns zero) **cannot pass** unless
this story is also migrated to the `PageHeader`-based markup. This was missed in the first draft
(4 callsites listed); the activation grep found 5. Migrate the story in Phase 2 alongside the pages.

### Intentionally excluded — section-builder / hero replaces PageHeader

| Page file | Route(s) | Why excluded |
|-----------|----------|--------------|
| `ArticlePage` | `/articles/:slug` | `PageSections` with extracted `leadHero` — H1 lives inside hero section |
| `NodePage` | `/nodes/:slug` | Same — `PageSections` with `leadHero` |
| `CaseStudyPage` | `/case-studies/:slug` | Same — `PageSections` with `leadHero` |
| `RootPage` | `/:slug` | Same — `PageSections` with `leadHero` |
| `HomePage` | `/` | Same — `PageSections` with `leadHero` fallback |
| `GovernancePage`, `CmsPage`, `DesignSystemPage`, `MonorepoPage`, `DesignSystemRegistryPage`, `ContentModelsPage`, `SectionShowcasePage` | `/platform/*` | `PlatformLayout` hero slot — own pattern, own CSS |

### Utility pages — separate decision, not in scope

| Page file | Route | H1 CSS | font-size | weight | Note |
|-----------|-------|--------|-----------|--------|------|
| `SitemapPage` | `/sitemap` | `.title` (local) | `clamp(2–2.5rem)` max 40px | 700 | Utility page; not a content archive/detail |
| `NotFoundPage` | 404 | `.placeholderHeading` | `clamp(2–3rem)` | 700 | Error page; deliberate divergence is fine |

## Objective

After this epic: `PageHeader` uses a new `--st-font-page-h1: 3rem` (48px) token for `.title`. All 7 pages currently on `PageHeader` get the size fix automatically. The 4 pages using `.narrativeHeading` are migrated to `PageHeader` with the correct `italic` prop. `.narrativeHeading` and `.narrativeHeadingItalic` are removed from `pages.module.css` (no remaining callsites). The `PageHeader` Storybook story is updated. Utility and hero-section pages are not touched.

## Scope

- [ ] **Token:** Add `--st-font-page-h1: 3rem` to `tokens/source/tokens.json`, regenerate both `tokens.css` files — layer: tokens
- [ ] **`PageHeader`:** Change `.title` from `--st-font-heading-2` to `--st-font-page-h1`; update mobile breakpoint override accordingly — layer: design system
- [ ] **PageHeader Storybook story** (`PageHeader.stories.jsx`): update to cover roman + italic + count + description variants; confirm light + dark via topbar — layer: Storybook
- [ ] **`GlossaryTermPage`:** Replace `.narrativeHeading` H1 with `PageHeader` (roman) — layer: frontend
- [ ] **`PersonProfilePage`:** Replace `.narrativeHeading .narrativeHeadingItalic` H1 with `PageHeader` (`italic` prop) — layer: frontend
- [ ] **`SeriesPage`:** Replace `.narrativeHeading` H1 with `PageHeader` (roman) — layer: frontend
- [ ] **`ToolDetailPage`:** Replace `.narrativeHeading` H1 with `PageHeader` (roman) — layer: frontend
- [ ] **`GlossaryTermDetailPage.stories.jsx`:** Migrate the `.narrativeHeading` usage (line 84) to `PageHeader` so the closure grep reaches zero — layer: Storybook
- [ ] **Remove orphaned classes:** Delete `.narrativeHeading` and `.narrativeHeadingItalic` from `pages.module.css` after confirming zero remaining callsites — layer: CSS

## QA walkthrough — example local pages (one per updated page-type)

> Human step-through surface. After Phase 2, open each URL on the local dev server
> (`http://localhost:5173`) and confirm the H1 renders at **48px** with the correct
> italic/roman treatment. Slugs below are real published documents captured at activation
> (2026-06-13) — if a slug 404s, the document was unpublished; pick another from the
> matching archive. Verify on both `light` and `dark` themes where the page supports it.

**Archive pages (token fix only — expect 48px italic H1):**

| Page-type (live renderer) | Example local URL | Expected H1 |
|---|---|---|
| `ArchivePage` (articles) | http://localhost:5173/articles | 48px italic |
| `ArchivePage` (case-studies) | http://localhost:5173/case-studies | 48px italic |
| `ArchivePage` (library) | http://localhost:5173/library | 48px italic |
| `SiteGraphPage` | http://localhost:5173/knowledge-graph | 48px italic |
| `GlossaryArchivePage` | http://localhost:5173/glossary | 48px italic |
| `TaxonomyArchivePage` (tools) | http://localhost:5173/tools | 48px italic |
| `TaxonomyArchivePage` (people) | http://localhost:5173/people | 48px italic |
| `TaxonomyArchivePage` (tags) | http://localhost:5173/tags | 48px italic |
| `TaxonomyArchivePage` (categories) | http://localhost:5173/categories | 48px italic |
| `TaxonomyArchivePage` (projects) | http://localhost:5173/projects | 48px italic |

**Detail pages already on `PageHeader` (token fix only — expect 48px roman H1):**

| Page-type | Example local URL | Expected H1 |
|---|---|---|
| `TaxonomyPlaceholderPage` (tag) | http://localhost:5173/tags/resist | 48px roman |
| `TaxonomyPlaceholderPage` (category) | http://localhost:5173/categories/ai | 48px roman |
| `ProjectDetailPage` | http://localhost:5173/projects/mini-repo | 48px roman |

**Detail pages migrated to `PageHeader` (structure + size change — expect 48px):**

| Page-type | Example local URL | Expected H1 |
|---|---|---|
| `GlossaryTermPage` | http://localhost:5173/glossary/atomic-design | 48px roman |
| `PersonProfilePage` | http://localhost:5173/people/beehead | 48px italic |
| `SeriesPage` | http://localhost:5173/series/test-series | 48px roman |
| `ToolDetailPage` | http://localhost:5173/tools/aem | 48px roman |

## Phases

**Phase 1 — Token + PageHeader fix**
Add `--st-font-page-h1` token. Update `PageHeader.module.css`. Update Storybook story. Run `pnpm validate:tokens`. All 7 pages already on `PageHeader` get 48px automatically.

**Phase 2 — Migration sweep**
Migrate GlossaryTermPage, PersonProfilePage, SeriesPage, ToolDetailPage **and `GlossaryTermDetailPage.stories.jsx`** from `.narrativeHeading` to `PageHeader`. Remove `.narrativeHeading` / `.narrativeHeadingItalic` from `pages.module.css` only after `grep -rn "narrativeHeading" apps/web/src/` returns zero. Visual QA all 4 migrated pages plus the story in Storybook.

## Acceptance criteria

- [ ] `--st-font-page-h1: 3rem` token in `tokens/source/tokens.json` and both generated `tokens.css` files; `pnpm validate:tokens` clean
- [ ] `PageHeader.title` renders at 48px (3rem) at desktop widths on every page that uses it
- [ ] All 5 archive pages (`/articles`, `/knowledge-graph`, `/case-studies`, `/glossary`, taxonomy archives) render H1 italic at 48px
- [ ] All 4 taxonomy/project detail pages (`/tags/:slug`, `/categories/:slug`, `/projects/:slug`, and equivalents) render H1 roman at 48px
- [ ] `/glossary/:slug`, `/people/:slug`, `/series/:slug`, `/tools/:slug` render H1 via `PageHeader` at 48px (roman except `/people/:slug` which is italic)
- [ ] `.narrativeHeading` and `.narrativeHeadingItalic` deleted from `pages.module.css`
- [ ] `grep -rn "narrativeHeading" apps/web/src/` returns zero results
- [ ] PageHeader Storybook story passes in both light and dark themes
- [ ] `pnpm validate:tokens --strict-colors` clean

## Technical notes

- **`--st-font-heading-1` vs `--st-font-page-h1`:** Do not repurpose `--st-font-heading-1` (3.25rem / 52px) — it is the top of the type scale, not the page-layout H1. Add a distinct `--st-font-page-h1: 3rem` semantic token. This aligns with the DS convention observed in Storybook and avoids colliding with the type scale.
- **Mobile override:** `PageHeader.module.css` already sets `@media (max-width: 520px) .title { font-size: var(--st-font-size-2xl) }`. At activation, confirm `--st-font-size-2xl` value (check tokens.css) is an appropriate mobile floor. Do not embed a clamp in the token itself.
- **`PersonProfilePage` migration note:** PersonProfilePage renders its H1 inside a `.folioIdentity` block alongside an avatar and metadata. At migration, the `PageHeader` `media` slot can hold the avatar, and the `metadataCard` slot holds the metadata card, preserving the existing layout structure. Confirm this at activation by reading the full `PersonProfilePage.jsx` render tree before writing code.
- **`SeriesPage` italic decision:** Series archive mastheads could go either way. Current `.narrativeHeading` has no italic. Convention: series is a content-grouping entity, not a pure taxonomy, so roman is likely correct. Confirm at activation.
- **`PageHeader` import:** already exported from `apps/web/src/design-system/index.js` — import as `import { PageHeader } from '../design-system'` in all migrated pages.
- **No schema changes. No Sanity writes. No Content Write Gate.**
- **Activation audit:** run `grep -rn "narrativeHeading" apps/web/src/` at session start to confirm the 4 callsite list hasn't changed.
- **Token value cross-check gate (CLAUDE.md §DS Component Authoring Token-First Rule):** before writing any CSS for `PageHeader.module.css`, grep `--st-font-page-h1` in `tokens.css` to confirm it resolves to `3rem`, then verify `3rem = 48px` matches the DS typography convention story at `/story/foundations-typography-conventions--default`. This gate was added because SUG-157 locked `--st-font-heading-2` (36px) from the handoff without verifying its px value against the spec — the root cause of this epic.
- **App.jsx routing pre-flight (CLAUDE.md §Incomplete epic doc hard stop):** the page inventory in this epic was produced by reading `apps/web/src/App.jsx` directly. At activation, re-read App.jsx to confirm no routing changes have occurred since this doc was written. The confirmed mapping: `/people/:slug` → `PersonProfilePage`, `/tools/:slug` → `ToolDetailPage`, `/tags/:slug` + `/categories/:slug` → `TaxonomyPlaceholderPage`.

## Model & Mode [REQUIRED]

`/model opusplan` — Token addition + PageHeader CSS change + 4-page migration + class deletion. Opus to plan the full change set and identify any structural differences in the 4 migrated pages (especially PersonProfilePage folio layout). Sonnet executes phase by phase after plan approval.

## Non-Goals

- Hero-bearing content pages (ArticlePage, NodePage, CaseStudyPage, RootPage, HomePage) — H1 in hero section, not in scope
- Platform pages (`/platform/*`) — PlatformLayout hero slot is a separate pattern
- Utility pages (SitemapPage, NotFoundPage) — deliberate divergence acceptable
- Font family changes — size and weight only; typeface locked
- Weight change on `PageHeader` — `font-weight: normal (400)` is intentional for the narrative font at large size; do not change to 600
- Responsive redesign beyond fixing the mobile floor token reference

## Related

- **Linear:** [SUG-165](https://linear.app/sugartown/issue/SUG-165/archive-and-detail-page-h1-audit-holder-header-standardisation)
- **PageHeader component:** `apps/web/src/design-system/components/PageHeader/PageHeader.jsx`
- **PageHeader CSS:** `apps/web/src/design-system/components/PageHeader/PageHeader.module.css`
- **PageHeader Storybook:** `http://localhost:6006/?path=/docs/patterns-pageheader--docs`
- **DS typography conventions:** `http://localhost:6006/?path=/story/foundations-typography-conventions--default`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
