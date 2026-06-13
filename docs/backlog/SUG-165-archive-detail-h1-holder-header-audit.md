---
**Epic:** SUG-165 — Archive and detail page H1 audit — holder header standardisation
**Linear Issue:** [SUG-165](https://linear.app/sugartown/issue/SUG-165/archive-and-detail-page-h1-audit-holder-header-standardisation)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-165 — Archive and detail page H1 audit — holder header standardisation

Audit all non-hero archive and detail pages for H1 sizing and weight inconsistencies; standardise on a consistent `PageHeader` holder-header pattern at the DS-specified size.

## Background

Three separate CSS surfaces currently render the page H1 at three different sizes and weights, with no single canonical pattern:

1. **`PageHeader` component** (`PageHeader.module.css` `.title`) — uses `--st-font-heading-2` (2.25rem = 36px), `font-weight: normal`. Used by `KnowledgeGraphArchivePage` (`/library`) and `ArticlesArchivePage` (`/articles`).
2. **`TaxonomyArchivePage`** (`.archiveTitle`) — uses `clamp(2rem, 4vw, 3rem)` (max 48px), italic, `font-weight: 600`. Used by `/tools`, `/people`, `/tags`, `/categories`, `/projects`.
3. **`pages.module.css` `.narrativeHeading`** — uses `clamp(1.75rem, 3.5vw, 2.5rem)` (max 40px), `font-weight: 600`. Used by `ToolDetailPage` and others without a dedicated header component.

The DS typography convention (Storybook: `/story/foundations-typography-conventions--default`) specifies H1 at 48px. `--st-font-heading-1` is 3.25rem (52px); the practical page H1 target is 3rem (48px), consistent with the TaxonomyArchivePage `.archiveTitle` max. The Storybook observation confirms the mismatch is live and visible.

## Objective

After this epic: every non-hero archive and detail page renders its H1 via the `PageHeader` component at a consistent size (3rem / 48px), with italic treatment for archive mastheads and roman for entity detail pages. `PageHeader.title` is updated from `--st-font-heading-2` to a dedicated `--st-font-page-h1` token (3rem). Pages currently using ad-hoc `.archiveTitle` or `.narrativeHeading` CSS for their H1 are migrated to `PageHeader`. The `PageHeader` Storybook story reflects the corrected spec. This epic does not touch hero-bearing content pages (ArticlePage, NodePage, CaseStudyPage) — their H1 lives inside the hero component.

## Scope

- [ ] **Token:** Add `--st-font-page-h1: 3rem` to `tokens/source/tokens.json`, regenerate both `tokens.css` files — layer: tokens/tooling
- [ ] **`PageHeader`:** Change `.title` from `--st-font-heading-2` to `--st-font-page-h1`; update Storybook story to show light + dark, roman + italic variants — layer: design system / Storybook
- [ ] **`TaxonomyArchivePage`:** Migrate `.archiveTitle` inline header to `PageHeader`; remove `.archiveTitle` local class — layer: frontend
- [ ] **`ToolDetailPage`:** Migrate `.narrativeHeading` H1 to `PageHeader` (roman, no italic) — layer: frontend
- [ ] **Audit remaining non-hero pages:** Check `PersonProfilePage`, `TaxonomyDetailPage`, `ProjectDetailPage`, `GlossaryArchivePage`, `GlossaryTermPage`, `SeriesPage` — confirm each uses `PageHeader` or migrate it — layer: frontend
- [ ] **Remove orphaned classes:** After migration, delete `.archiveTitle` from `TaxonomyArchivePage.module.css` and `.narrativeHeading` from `pages.module.css` if no remaining callsites — layer: frontend/CSS

## Phases

**Phase 1 — Token + PageHeader fix**
Add `--st-font-page-h1` token. Update `PageHeader.title` to use it. Update PageHeader Storybook story. Validate with `pnpm validate:tokens`. Pages using `PageHeader` (`/library`, `/articles`) get the size fix for free.

**Phase 2 — Migration sweep**
Migrate all remaining non-hero pages from ad-hoc `.archiveTitle` / `.narrativeHeading` to `PageHeader`. Remove orphaned CSS classes. Confirm zero remaining raw font-size declarations for page H1 outside `PageHeader.module.css`.

## Acceptance criteria

- [ ] `--st-font-page-h1: 3rem` token exists in `tokens/source/tokens.json` and both generated `tokens.css` files
- [ ] `pnpm validate:tokens` reports zero errors after token addition
- [ ] `PageHeader.title` renders at 48px (3rem) on desktop on every page it is used
- [ ] `/library` H1 renders italic, 48px (was 36px)
- [ ] `/articles` H1 renders italic, 48px (was 36px)
- [ ] `/tools` archive H1 renders italic, 48px (was `clamp` with inconsistent weight) via `PageHeader`
- [ ] `/tools/:slug` detail H1 renders roman, 48px (was 40px)
- [ ] `/people`, `/tags`, `/categories`, `/projects` archive pages render H1 via `PageHeader` at 48px
- [ ] All entity detail pages in scope render H1 via `PageHeader` at 48px
- [ ] `.archiveTitle` and `.narrativeHeading` removed from CSS if no remaining callsites
- [ ] PageHeader Storybook story covers: default (roman), italic, with count, with description — light + dark via topbar dropdown

## Technical notes

- **Activation audit:** Before Phase 2 migration, grep all page files for `.archiveTitle` and `.narrativeHeading` callsites to get a complete migration list: `grep -rn "archiveTitle\|narrativeHeading" apps/web/src/pages/`
- **`PageHeader` import path:** `apps/web/src/design-system/components/PageHeader/PageHeader.jsx` — already imported in KnowledgeGraphArchivePage and ArticlesArchivePage; reuse the same import pattern.
- **Italic convention:** Archive mastheads (listing pages) use `italic` prop on `PageHeader`. Entity detail pages (tool, person, project, glossary term) use roman (no `italic` prop). Series pages: check against convention at activation.
- **No schema changes.** No Sanity writes. No Content Write Gate.
- **`--st-font-heading-1` vs `--st-font-page-h1`:** Do not repurpose `--st-font-heading-1` (3.25rem / 52px) — it is the heading scale top, not the page H1. Create a new `--st-font-page-h1: 3rem` at the page-layout semantic layer. This matches the existing TaxonomyArchivePage clamp max and the DS convention the user observed.
- **`clamp` for responsiveness:** PageHeader's mobile override already sets `.title { font-size: var(--st-font-size-2xl) }` at ≤520px. At activation, confirm `--st-font-size-2xl` is an appropriate mobile floor (should be ~1.75rem / 28px) or adjust the mobile clamp. Do not add a new clamp to the token value itself.
- **Model & Mode:** `/model opusplan` — Opus plans the token addition + PageHeader change + migration order, Sonnet executes after plan-mode exit.

## Model & Mode [REQUIRED]

`/model opusplan` — Token change + CSS component edit + multi-page migration sweep. Opus to plan the token addition, PageHeader CSS change, and identify all migration targets in one pre-execution pass. Sonnet executes phase by phase.

## Non-Goals

- Hero-bearing content pages (ArticlePage, NodePage, CaseStudyPage) — H1 lives inside hero components, not in scope.
- Responsive breakpoint redesign — mobile sizes are not being changed, only the desktop max.
- Font family changes — this audit is size and weight only; typeface choices are locked.
- Dark mode token additions — the page H1 inherits theme via `--st-color-text-default` already set on `PageHeader`.

## Related

- **Linear:** [SUG-165](https://linear.app/sugartown/issue/SUG-165/archive-and-detail-page-h1-audit-holder-header-standardisation)
- **PageHeader component:** `apps/web/src/design-system/components/PageHeader/PageHeader.jsx`
- **PageHeader CSS:** `apps/web/src/design-system/components/PageHeader/PageHeader.module.css`
- **DS typography conventions:** `http://localhost:6006/?path=/story/foundations-typography-conventions--default`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
