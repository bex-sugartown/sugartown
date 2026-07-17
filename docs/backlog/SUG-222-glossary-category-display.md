---
**Epic:** SUG-222 — Glossary category display — surface categories across glossary and category pages
**Linear Issue:** [SUG-222](https://linear.app/sugartown/issue/SUG-222/glossary-category-display-surface-categories-across-glossary-and)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-222 — Glossary category display — surface categories across glossary and category pages

Glossary categories exist in the schema and the data but barely exist as a display surface: the only visible rendering is a small chip on the term detail page. Define the IA for how categories display as part of the glossary experience, then implement it across the glossary archive, the category detail page, and the term-page chip.

## Background

The `glossaryTerm.categories[]` field works and is populated (e.g. 9 published terms reference the Bextionary category), but display-side the picture is thin and partly broken, verified against the live code 2026-07-17:

- **Term detail page:** the category renders as a chip (the one place it shows at all). Whether the chip links anywhere useful is an activation-audit question; the reported experience is a dead end.
- **Glossary archive (`/glossary`):** `GlossaryArchivePage.jsx` has category *filter* chips with an `activeCategory` state (shipped in SUG-166), but no visible category structure: no grouping, no category descriptions, no masthead presence beyond the filter row, no use of the category `brandColor` field.
- **Category detail page (`/categories/:slug`):** `App.jsx:141` routes it to `TaxonomyPlaceholderPage`. The page renders the category name and description but reports "No content associated with this category yet" for Bextionary, because the taxonomy content-count queries in `queries.js` (lines ~1348 onward) are scoped to `_type in ["article","node","caseStudy"]` — `glossaryTerm` is excluded everywhere.
- **Category schema:** `brandColor` exists ("Color for knowledge graph visualization and archive filter chips") and is empty on Bextionary; the "Assigned content" incoming-reference panel in Studio shows Article and Node but not glossary terms.

Trigger: publishing the "Clicky Burden" Bextionary term (2026-07-17) made the gap concrete — a freshly minted category chip leading nowhere, and a category page claiming emptiness while holding 9 terms.

Reference surfaces: `apps/web/src/pages/GlossaryArchivePage.jsx`, `GlossaryTermPage.jsx`, `TaxonomyPlaceholderPage.jsx`, `TaxonomyDetailPage.jsx`, `apps/web/src/lib/queries.js` (taxonomy count + content queries), `apps/web/src/App.jsx` (routing), `apps/studio/schemas/documents/category.ts`.

## Objective

After this epic: glossary categories are a designed, navigable part of the glossary rather than an internal filing field. The category detail page counts and lists glossary terms alongside other content types; the term-page category chip links somewhere meaningful (the category page, or a category-filtered glossary view — an IA decision made in Phase 0); the glossary archive presents categories per the approved mock (grouping, descriptions, and/or brand-color chips — exact form decided at Phase 0, not assumed here). Layers touched: GROQ queries, React pages/components, possibly CSS modules, and content (setting `brandColor` on existing category docs if the mock uses it). Sanity schema is expected to be untouched (all needed fields exist); if Phase 0 reveals a schema gap, it ships as its own `feat(studio)` commit per convention.

## Scope

- [ ] **Current-state audit** — layer: audit. Read `App.jsx` for the full category/glossary route map (blocking per the incomplete-epic rule: the placeholder-vs-detail-page split must be mapped, not assumed); trace what the term-page chip currently links to; inventory which queries exclude `glossaryTerm`; confirm what SUG-166's filter actually shipped vs. planned.
- [ ] **Phase 0 mock** — layer: design. HTML mock at `docs/drafts/SUG-222-*.html` covering: the glossary archive's category presentation, the category detail page with glossary terms present, and the term-page chip behavior. Interaction annotations required for any nav/filter surface per CLAUDE.md (active state, URL behavior, existing-pattern reuse). Hard stop: no JSX/CSS before mock approval.
- [ ] **Category queries include glossaryTerm** — layer: query. Extend the taxonomy content and count queries so category pages see glossary terms; decide (at Phase 0) whether terms list inline with other content or as their own section.
- [ ] **Category page implementation** — layer: frontend. Whatever Phase 0 approves for `/categories/:slug` — likely graduating Bextionary-style categories off `TaxonomyPlaceholderPage`.
- [ ] **Glossary archive category presentation** — layer: frontend. Implement the approved mock (grouping/descriptions/brand-color chips as decided).
- [ ] **Term-page chip link** — layer: frontend. Wire the chip to the approved destination via `getCanonicalPath` (URL Authority Rule).
- [ ] **brandColor backfill (conditional)** — layer: content. If the mock uses brand color, propose values for existing categories through the Content Write Gate before patching.

## Phases

**Phase 0 — Audit + mock.** Current-state audit, then the HTML mock. Ends at the hard stop: mock approved before any implementation path is touched.

**Phase 1 — Queries + category page.** GROQ extensions and the category detail page. Ships the "Bextionary page shows its 9 terms" fix.

**Phase 2 — Glossary archive + chip.** Archive presentation per mock, term-page chip link, conditional brandColor backfill. Visual QA gate against the mock before close-out.

## Acceptance criteria

- [ ] `/categories/bextionary` lists its glossary terms; the "no content" false-empty state is gone (verified on the rendered page, not just query output)
- [ ] Taxonomy count queries include `glossaryTerm` wherever content types are enumerated for categories (each site audited and either extended or exempted with a reason)
- [ ] The term-page category chip navigates somewhere approved at Phase 0, built via `getCanonicalPath`
- [ ] The glossary archive matches the approved mock (mock-to-implementation comparison table presented; "Visual QA approved" received before the shipped/ move)
- [ ] All new class names pass the CSS pre-implementation reuse audit and proposal-table gate; no content-type-named classes
- [ ] If brandColor ships: values proposed and approved via the Content Write Gate before any category doc is patched

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach (glossary archive, glossary term detail, category/taxonomy archive + detail at
> minimum, plus any page rendering category chips), and build the Human QA Walkthrough table
> (one example local URL per page-type, incl. unchanged pages as regression guards) per
> `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail
> page-type and datestamp it. Known candidates: `/glossary`, `/glossary/clicky-burden`,
> `/categories/bextionary`, `/categories` archive, and one non-glossary category (e.g. a
> Content Architecture page) as the regression guard for article/node counts.

## Technical notes

- **Phase 0 is a hard stop** — this epic adds new visual blocks to existing pages (archive category presentation, category-page term listing), which CLAUDE.md explicitly names as mock-gated regardless of page-template age. Nav/filter surfaces in the mock need the interaction annotation layer (reuse "same as GlossaryArchivePage filter chips" where behavior is inherited).
- **Content Write Gate:** fires only for the conditional brandColor backfill; all other work is code.
- **Component reuse:** `Chip`, `IndexGroup`/`IndexCell`, `SectionLabel`, `LetterSectionHeader`, and the existing `dl/dt/dd` term-list pattern are the candidate primitives; the CSS reuse audit and proposal table are blocking before any new class. `TaxonomyDetailPage` already exists — Phase 0 decides whether category pages graduate to it or extend it rather than forking a new page component.
- **Activation audits:**
  1. `App.jsx` route map for all category/taxonomy/glossary routes (why does `/categories/:slug` use the placeholder while other taxonomies may not?).
  2. `queries.js`: enumerate every `_type in [...]` list that should arguably include `glossaryTerm`; produce the extend-vs-exempt table before editing.
  3. `GlossaryTermPage.jsx`: what the category chip currently renders/links.
  4. SUG-166's shipped doc for what the archive filter was specified to do vs. what exists.
- **Model & Mode [REQUIRED]:** `/model sonnet` — section wiring, GROQ extensions, and mock-gated frontend work; no architecture ambiguity.

## Model & Mode [REQUIRED]

`/model sonnet` — see Technical notes above.

## Non-Goals

- No new taxonomy documents and no category renames (taxonomy pre-flight stands; this is display work).
- No schema changes expected; if one emerges from Phase 0 it ships as its own `feat(studio)` commit, not bundled.
- No knowledge-graph changes (brandColor's KG use is existing behavior; only its glossary-surface use is in scope).
- No changes to how articles/nodes/case studies display on category pages beyond adding glossary terms alongside them.

## Related

- **Linear:** [SUG-222](https://linear.app/sugartown/issue/SUG-222/glossary-category-display-surface-categories-across-glossary-and)
- **Prior art:** SUG-166 (`docs/shipped/SUG-166-glossary-completion-gap-fill-eds-import.md`) — shipped the Bextionary category + archive filter chips + masthead parenthetical; this epic builds the display layer it stopped short of
- **Adjacent:** SUG-125 (IndexGroup/IndexCell primitives), SUG-162 (glossary term detail design)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, and Files to Modify at activation
