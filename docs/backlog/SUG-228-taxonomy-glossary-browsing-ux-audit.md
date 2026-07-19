---
**Epic:** SUG-228 — Taxonomy & Glossary Browsing UX Audit — chip colors, duplicate views, naming collisions
**Linear Issue:** [SUG-228](https://linear.app/sugartown/issue/SUG-228/taxonomy-and-glossary-browsing-ux-audit-chip-colors-duplicate-views)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-228 — Taxonomy & Glossary Browsing UX Audit — chip colors, duplicate views, naming collisions

Immediately after SUG-222 shipped, Bex walked the live glossary/category/tag surfaces and flagged six distinct UX issues via annotated screenshots (2026-07-19) — some directly adjacent to what SUG-222 just built, one re-touching ground SUG-190 already audited.

## Background

Six issues, each traced to a specific live surface:

1. **Abbreviation chip color** — the glossary archive's `.termAbbr` badge (e.g. "A11Y" on `/glossary`) renders in the pink/maroon accent treatment. Bex's annotation ("Acronym chip=LIME") suggests it should use the lime treatment instead — the same lime already used for inline glossary annotations (SUG-211 Option E, `--st-glossary-annotation-*` tokens). Open question: is pink intentional for the archive-list context (a different surface than inline body text), or should it match the inline convention?
2. **Duplicate breadcrumb/heading and duplicate reset controls on `/glossary`** — the breadcrumb reads "GLOSSARY" directly above the H1 "Glossary" (flagged as redundant, adjacent duplicate labeling). Separately, the category-filter "All" chip and the A-Z "ALL" button sit stacked in adjacent rows — two different filter dimensions reset by two controls that read as one repeated control at a glance.
3. **Two structurally divergent views of the same category** — `/categories/bextionary` (SUG-222's new "Glossary Terms" chip-row section: unordered, name-only, no definitions) and `/glossary` filtered to the Bextionary category (the existing SUG-166 alphabetized `dl`/`dt`/`dd` list: full definitions, A-Z grouped) render the *same* 10+ Bextionary terms in structurally different presentations. Bex labeled both screenshots explicitly to compare them side by side. Open question: intentional (different use cases — quick reference vs. full browse) or should they reconcile/cross-link?
4. **Tag/glossaryTerm naming collision** — a `tag` document named "agentic caucus" (`/tags/agentic-caucus`, 15 items) coexists with the `glossaryTerm` "Agentic Caucus" (`/glossary/agentic-caucus`) as two separate taxonomy primitives sharing a display name. This produces a self-referential "Related Tags: agentic caucus" row on the term's own detail page — the term points at a tag that reads as itself. **SUG-190** ("Taxonomy vocabulary audit — tag deduplication, category/tag overlap, glossary vs tag distinction," shipped) already audited exactly this overlap category; this is either a survivor of that audit or a new collision introduced by content added since.
5. **`ContentList`'s left-hand column is semantically inconsistent** — per `ContentList.jsx`'s `toRow()` (`apps/web/src/components/ContentList.jsx`), node rows show `status` (VALIDATED/OPERATIONALIZED/DEPRECATED) while every other content type shows its first `category` (AI/DESIGN SYSTEMS/ENGINEERING & DX/BEXTIONARY/SUGARTOWN NOTES) — same visual column, no distinguishing treatment. On a mixed-type list (e.g. the `agentic-caucus` tag detail page, which lists articles, nodes, and a case study together), the column means a different thing per row with nothing signaling the switch. Bex's annotation asks whether it should consistently show page-type, consistently show category, or group rows by type instead.
6. **Term detail page "Used In" list is off-pattern** — `GlossaryTermPage.jsx` renders "Used In" as a bespoke two-column type-chip + title layout, distinct from the shared `ContentList`/`List` pattern already used on `TaxonomyDetailPage`, `ProjectDetailPage`, and `ToolDetailPage`. Bex's annotation asks whether it should be restyled to match.

Reference surfaces: `apps/web/src/pages/GlossaryArchivePage.jsx`, `GlossaryTermPage.jsx`, `TaxonomyDetailPage.jsx`, `apps/web/src/components/ContentList.jsx`, `apps/web/src/pages/GlossaryPage.module.css`, `apps/web/src/design-system/styles/theme.pink-moon.css` (`--st-glossary-annotation-*` tokens), the `tag`/`glossaryTerm` schemas.

## Objective

After this epic: every item above has an explicit, documented resolution (not left ambiguous) — consistent chip color semantics between inline and archive-list glossary treatments, no duplicate/confusing reset controls on `/glossary`, a deliberate (not accidental) relationship between the two Bextionary browsing views, zero tag/glossaryTerm naming collisions, one documented `ContentList` column convention applied consistently, and a term-page "Used In" section that either matches the site's established content-list pattern or has a stated reason not to. Layers touched: frontend (chip CSS, breadcrumb/heading markup, `ContentList.jsx`, `GlossaryTermPage.jsx`), content/taxonomy (tag rename or retirement per the naming-collision audit), and design (Phase 0 decisions for every visual change, per the CLAUDE.md mock gate). No Sanity schema changes are anticipated, but Phase 0 may surface one (e.g. distinguishing Bextionary-coined tags at the schema level) — not assumed here.

## Scope

- [ ] **Chip color decision — abbreviation badges vs. inline glossary annotations** — layer: design/frontend. Decide whether `.termAbbr` should adopt the lime treatment used by inline glossary annotations (SUG-211 Option E), or whether the current pink/maroon accent is intentional for the archive-list context. Document the decision; update the class/token reference if changed.
- [ ] **De-duplicate `/glossary` breadcrumb/heading and reset-control adjacency** — layer: frontend. Resolve the "GLOSSARY" breadcrumb / "Glossary" H1 redundancy and the stacked "All" (category filter) / "ALL" (A-Z filter) control adjacency. Options include removing/hiding one, visually differentiating them, or combining into a single row — decide at Phase 0.
- [ ] **Reconcile or justify the two Bextionary browsing views** — layer: UX/frontend. Decide whether `/categories/:slug`'s Glossary Terms chip section and `/glossary`'s category-filtered alphabetized list should converge on one presentation, cross-link to each other (e.g. a "view full definitions" link from the category page), or remain deliberately distinct for different use cases. Document the reasoning either way.
- [ ] **Tag/glossaryTerm naming collision audit** — layer: content/taxonomy. Activation audit: query every `tag` document whose `name` case-insensitively matches an existing `glossaryTerm.term` or `.abbreviation`. For each collision found, decide per SUG-190's existing glossary-vs-tag distinction convention whether the tag should be retired, renamed, or the term's "Related Tags" self-reference suppressed at render time.
- [ ] **`ContentList` column-semantics decision** — layer: frontend/design. Decide the `toRow()` left-column convention going forward: always page-type, always category (where present, fallback otherwise), or grouped-by-type sections instead of a flat mixed list. Document the decision and update `ContentList.jsx` accordingly.
- [ ] **Term-page "Used In" section — align to `ContentList` pattern or justify divergence** — layer: frontend. Decide whether `GlossaryTermPage.jsx`'s "Used In" block should be re-implemented using the shared `ContentList` component (matching `TaxonomyDetailPage`/`ProjectDetailPage`/`ToolDetailPage`) or remain its own bespoke layout. Document the reasoning.

## Phases

Provisional — confirm at Phase 0 once the naming-collision audit's scale is known:

**Phase 1 — Content/taxonomy: naming collision audit.** Query and resolve all tag/glossaryTerm collisions (item 4). Can run independently of the frontend items; no frontend dependency.

**Phase 2 — Frontend UX/consistency pass.** Chip color decision, duplicate-control resolution, Bextionary-view reconciliation, `ContentList` column convention, "Used In" pattern alignment (items 1, 2, 3, 5, 6). Bundled together since all are visual/layout decisions requiring one shared Phase 0 mock per CLAUDE.md's mock gate, and several touch the same files (`ContentList.jsx` is shared by items 5 and 6).

## Acceptance criteria

- [ ] Each of the 6 scope items has an explicit, documented decision recorded in this epic doc before any code ships — no item left ambiguous or silently decided in a commit message
- [ ] Any visual/layout change (chip color, duplicate-control resolution, `ContentList` column convention, "Used In" pattern) has an approved Phase 0 mock before implementation, per CLAUDE.md's mock gate
- [ ] Tag/glossaryTerm naming collision audit completed: full list of collisions found, with a per-collision resolution (retire/rename/suppress), cross-referenced against SUG-190's original glossary-vs-tag distinction convention
- [ ] No content-type-named or ad hoc CSS classes introduced without the CSS pre-implementation reuse audit and proposal-table gate
- [ ] If any tag document is renamed or retired: Content Write Gate proposal presented and approved before patching
- [ ] `ContentList.jsx` changes (if any) verified regression-safe on every page type that currently consumes it (tag/category/project/person/tool detail pages) — not just the surface that motivated the change

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach (glossary archive, glossary term detail, tag/category/project/tool/person detail
> pages — anywhere `ContentList` or the glossary chip styles render), and build the Human QA
> Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression
> guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug
> per page-type and datestamp it. Known candidates from the triggering screenshots: `/glossary`,
> `/glossary/agentic-caucus`, `/categories/bextionary`, `/tags/agentic-caucus`, plus one
> unrelated tag/category/project/tool detail page each as a `ContentList` regression guard.

## Technical notes

- **Content Write Gate:** fires for any tag rename/retirement resulting from the naming-collision audit (item 4) — propose before patching, per CLAUDE.md.
- **Schema changes:** none anticipated at stub stage. If Phase 0 concludes a schema-level distinction is needed (e.g. flagging Bextionary-coined tags), it ships as its own `feat(studio):` commit per convention, not bundled here.
- **Upstream dependencies:** SUG-222 (shipped 2026-07-19 — this epic's trigger; items 1, 3, 5, 6 all reference surfaces SUG-222 built or touched). SUG-190 (shipped — "Taxonomy vocabulary audit, tag deduplication, glossary vs tag distinction") is prior art for item 4; re-read its shipped doc and convention before deciding tag collision resolution, don't re-derive from scratch.
- **Activation audits:**
  1. Read `ContentList.jsx`'s `toRow()` in full (`apps/web/src/components/ContentList.jsx`) before deciding the column-semantics question (item 5) — the status-vs-category branch is the exact mechanism in question.
  2. Read `GlossaryPage.module.css`'s `.termAbbr` rule and `theme.pink-moon.css`'s `--st-glossary-annotation-*` token block before deciding the chip-color question (item 1) — confirm which lime tier ("lime" could mean `--st-color-lime-400` or a different step) Bex's annotation refers to.
  3. Read `GlossaryArchivePage.jsx`'s breadcrumb + `PageHeader` render and the `AlphaFilter` component before deciding the duplicate-control question (item 2).
  4. Naming-collision GROQ: `*[_type == "tag"]{_id, name}` cross-referenced case-insensitively against `*[_type == "glossaryTerm"]{_id, term, abbreviation}` (item 4) — run before any tag decisions, not assumed from the one example screenshot surfaced.
  5. Read `docs/shipped/SUG-190-taxonomy-vocabulary-audit.md` for the existing glossary-vs-tag distinction convention before deciding item 4's resolution.

## Model & Mode [REQUIRED]

`/model sonnet` — UX consistency audit + frontend decisions + content dedup; no architecture ambiguity. Phase 0's design decisions benefit from a collaborative walkthrough with Bex but don't require Opus-level architecture reasoning.

## Non-Goals

- No redesign of the glossary/category information architecture beyond reconciling the six flagged items — this is a UX consistency pass, not a re-scope of SUG-222's IA.
- No new taxonomy documents created — taxonomy pre-flight convention still applies; this epic resolves existing collisions/duplication, it doesn't add vocabulary.
- No changes to SUG-222's core fix (glossary terms surfacing on category pages via the dedicated query/section) — that shipped and is out of scope for revision here.

## Related

- **Linear:** [SUG-228](https://linear.app/sugartown/issue/SUG-228/taxonomy-and-glossary-browsing-ux-audit-chip-colors-duplicate-views)
- **Upstream:** SUG-222 (`docs/shipped/SUG-222-glossary-category-display.md`) — shipped 2026-07-19, this epic's trigger
- **Prior art:** SUG-190 (`docs/shipped/SUG-190-taxonomy-vocabulary-audit.md`) — re-check its glossary-vs-tag distinction convention before deciding item 4
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
