---
**Epic:** SUG-222 — Glossary category display — surface categories across glossary and category pages
**Linear Issue:** [SUG-222](https://linear.app/sugartown/issue/SUG-222/glossary-category-display-surface-categories-across-glossary-and)
**Status:** Done — shipped v0.28.13, 2026-07-19
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

**The larger frame (added at Bex's direction, 2026-07-17):** this gap is one instance of a class. Sugartown's ontology — which document types connect to which, through which fields, surfaced on which pages — was never written down as a spec; it accreted epic by epic. The ask: reverse-engineer that spec. Not a taxonomy inventory (the content-models page from SUG-163 already inventories types and fields) but a **map** — the document written as if it had preceded the build: approved connections between nodes, and for each connection, whether it is schema-only, query-supported, or actually displayed somewhere. The Bextionary situation (edge exists in schema and data; no display surface; queries actively exclude it) is exactly the pattern the map exists to expose — so the map doubles as a standing gap register for finding the next one before a screenshot does.

Reference surfaces: `apps/web/src/pages/GlossaryArchivePage.jsx`, `GlossaryTermPage.jsx`, `TaxonomyPlaceholderPage.jsx`, `TaxonomyDetailPage.jsx`, `apps/web/src/lib/queries.js` (taxonomy count + content queries), `apps/web/src/App.jsx` (routing), `apps/studio/schemas/documents/category.ts`.

## Objective

After this epic: glossary categories are a designed, navigable part of the glossary rather than an internal filing field. The category detail page counts and lists glossary terms alongside other content types; the term-page category chip links somewhere meaningful (the category page, or a category-filtered glossary view — an IA decision made in Phase 0); the glossary archive presents categories per the approved mock (grouping, descriptions, and/or brand-color chips — exact form decided at Phase 0, not assumed here). Layers touched: GROQ queries, React pages/components, possibly CSS modules, and content (setting `brandColor` on existing category docs if the mock uses it). Sanity schema is expected to be untouched (all needed fields exist); if Phase 0 reveals a schema gap, it ships as its own `feat(studio)` commit per convention.

## Scope

- [x] **Current-state audit** — layer: audit. Read `App.jsx` for the full category/glossary route map (blocking per the incomplete-epic rule: the placeholder-vs-detail-page split must be mapped, not assumed); trace what the term-page chip currently links to; inventory which queries exclude `glossaryTerm`; confirm what SUG-166's filter actually shipped vs. planned. Done 2026-07-19 — `App.jsx` confirms `/categories/:slug` and `/tags/:slug` both route to `TaxonomyPlaceholderPage` (a re-export of `TaxonomyDetailPage`), while `/projects/:slug`/`/people/:slug`/`/tools/:slug` route to dedicated components; chip already builds its link correctly via `getCanonicalPath`; 4 taxonomy count queries confirmed excluding `glossaryTerm`.
- [x] **Reverse-engineered ontology map** — layer: documentation. Produce `docs/briefs/sugartown-ontology-map.md`: the spec that would have preceded the build. Nodes = every document type and taxonomy primitive; edges = every approved reference connection (which field, which direction, bidirectional-sync or not). Format: nested outline plus Mermaid diagram(s). Each edge annotated with its actual coverage tier: **schema-only** (field exists, nothing reads it), **query-supported** (projected somewhere), or **displayed** (a real page surface renders it, named). Source from the schema files, `queries.js`, and the page components — not from memory or prior audit docs (verify-before-citing applies). Done 2026-07-19 — doc shipped with full edge inventory, Mermaid diagram, and an original-intention addendum (MVP-era type archaeology, tracked separately below).
- [x] **Ontology gap register** — layer: documentation. The improvement-areas view: a table in the same doc listing every edge whose coverage tier falls short of intent (schema-only or query-supported edges that plausibly deserve display, orphaned fields, queries that enumerate content types inconsistently). The glossaryTerm→category edge is entry one. Each row gets a severity/effort note so future epics (and SUG-221 audit cycles) can pick from it. Done 2026-07-19 — 8-row register in `sugartown-ontology-map.md`.
- [x] **Phase 0 mock** — layer: design. HTML mock at `docs/drafts/SUG-222-*.html` covering: the glossary archive's category presentation, the category detail page with glossary terms present, and the term-page chip behavior. Interaction annotations required for any nav/filter surface per CLAUDE.md (active state, URL behavior, existing-pattern reuse). Hard stop: no JSX/CSS before mock approval. **Mock approved by Bex 2026-07-19** (`docs/drafts/SUG-222-glossary-category-display-mock.html`, local-only). Revised twice during review: (1) fixed an error where the term-list abbreviation badge showed a category name instead of the term's own `abbreviation`; (2) Glossary Terms section reordered to render first (above Content, not below); (3) added per-section empty-hiding — each section hides independently when empty, combined "no content" message only when both are empty.
- [x] **Category queries include glossaryTerm** — layer: query. Extend the taxonomy content and count queries so category pages see glossary terms; decide (at Phase 0) whether terms list inline with other content or as their own section. Done 2026-07-19 — new `glossaryTermsByCategoryQuery` (separate from `contentByTaxonomyQuery`, per Phase 0 decision); `allCategoriesQuery`'s count extended to include `glossaryTerm` via `references()`. `contentByTaxonomyQuery` deliberately left untouched (would've broken the separate-section decision for other taxonomy types too — see Technical notes).
- [x] **Category page implementation** — layer: frontend. Whatever Phase 0 approves for `/categories/:slug` — likely graduating Bextionary-style categories off `TaxonomyPlaceholderPage`. Done 2026-07-19 — `TaxonomyDetailPage.jsx` extended (not forked): Glossary Terms section first, Content section second, two-tier empty-hiding, combined SEO thin-content threshold now counts `items.length + terms.length`. Zero behavior change confirmed for tags/projects/people in browser (agentic-caucus tag walked live, byte-identical to pre-change).
- [x] **Glossary archive category presentation** — layer: frontend. Implement the approved mock (grouping/descriptions/brand-color chips as decided). Done 2026-07-19 — `allGlossaryTermsQuery`'s category fragment extended to project `colorHex`/`description`; `Chip dotColor` wired; `.categoryDescriptor` reveal strip added. Verified live in both themes.
- [x] **Term-page chip link** — layer: frontend. Wire the chip to the approved destination via `getCanonicalPath` (URL Authority Rule). No code change required — confirmed already correct in Phase 0 audit, and now confirmed end-to-end in the browser 2026-07-19 (clicked from `/glossary/clicky-burden` → landed on `/categories/bextionary` with all 10 terms + 1 content item listed).
- [x] **brandColor backfill (conditional)** — layer: content. If the mock uses brand color, propose values for existing categories through the Content Write Gate before patching. Proposed and approved by Bex 2026-07-19; 6 categories (AI, Bextionary, Content Architecture, Documentation, Governance, Project Management) patched via `patch_documents` — **saved to Sanity drafts, not yet published** (Human-Publishes Rule — publish is Bex's action in Studio).

## Phases

**Phase 0 — Audit + ontology map + mock.** Current-state audit, then the ontology map and gap register (the map's category/glossary corner directly informs the mock's IA decisions), then the HTML mock. Ends at the hard stop: mock approved before any implementation path is touched. The map is reviewable on its own before the mock work starts — present it as a checkpoint, since Bex may reprioritize this epic's Phases 1–2 based on what the gap register surfaces. **Done, approved 2026-07-19.**

**Phase 1 — Queries + category page.** GROQ extensions and the category detail page. Ships the "Bextionary page shows its 9 terms" fix. **Done 2026-07-19** — verified live against production data (Bextionary went from 0→11 items on both the archive list and detail page; mixed category Design Systems confirmed both sections render together correctly; no console errors; all validators — tokens, style-mirror, lint, urls — pass clean, `validate:urls` warnings are pre-existing nav-data gaps unrelated to this change).

**Phase 2 — Glossary archive + chip.** Archive presentation per mock, term-page chip link, conditional brandColor backfill. Visual QA gate against the mock before close-out. **Code done 2026-07-19** — dotColor chips + description reveal implemented and verified live in light and dark theme; mock-to-implementation comparison table presented, no drift found. **brandColor content is drafted, pending Bex's publish** — this is the one open item before the epic can move to `docs/shipped/`.

## Acceptance criteria

- [x] `docs/briefs/sugartown-ontology-map.md` exists with every document type and taxonomy primitive as a node, every reference edge tiered (schema-only / query-supported / displayed), a Mermaid diagram, and a gap register with the glossaryTerm→category edge as entry one — every edge claim verified against live code, not prior docs
- [x] `/categories/bextionary` lists its glossary terms; the "no content" false-empty state is gone (verified on the rendered page, not just query output) — verified live 2026-07-19
- [x] Taxonomy count queries include `glossaryTerm` wherever content types are enumerated for categories (each site audited and either extended or exempted with a reason) — `allCategoriesQuery` extended; `allTagsQuery`/`allToolsQuery`/`allProjectsQuery` exempted (category-only per epic scope, glossaryTerm's `relatedTags`/`relatedTools` counts are a separate follow-on, not this epic)
- [x] The term-page category chip navigates somewhere approved at Phase 0, built via `getCanonicalPath` — verified end-to-end live 2026-07-19
- [x] The glossary archive matches the approved mock (mock-to-implementation comparison table presented above; no drift — awaiting Bex's explicit "Visual QA approved" before the shipped/ move)
- [x] All new class names pass the CSS pre-implementation reuse audit and proposal-table gate; no content-type-named classes — both new classes (`.glossaryTermsSection`, `.categoryDescriptor`) audited and approved in the Phase 0 mock
- [x] If brandColor ships: values proposed and approved via the Content Write Gate before any category doc is patched — done 2026-07-19; patched to drafts, publish still pending

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach (glossary archive, glossary term detail, category/taxonomy archive + detail at
> minimum, plus any page rendering category chips), and build the Human QA Walkthrough table
> (one example local URL per page-type, incl. unchanged pages as regression guards) per
> `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail
> page-type and datestamp it. Known candidates: `/glossary`, `/glossary/clicky-burden`,
> `/categories/bextionary`, `/categories` archive, and one non-glossary category (e.g. a
> Content Architecture page) as the regression guard for article/node counts.

## Mock-to-implementation comparison (Phase 2, 2026-07-19)

Every visual element from the approved Phase 0 mock (`docs/drafts/SUG-222-glossary-category-display-mock.html`), checked against the live implementation on `localhost:5173`. Verified in both light and dark theme.

| Mock element | Implementation | Status |
|---|---|---|
| Category filter chips gain a `dotColor` swatch | `Chip dotColor={c.colorHex}` wired in `GlossaryArchivePage.jsx`; verified live — Design Systems (pink) and Engineering & DX (teal) render dots correctly | ✅ Match |
| Category description reveal strip, single line, shown only when a category is selected | `.categoryDescriptor` renders `activeCategoryDoc.description`, hidden when absent; verified live on Bextionary | ✅ Match |
| Filter chip active/click/URL/mobile behavior unchanged | No changes made to those mechanics — confirmed by reading the diff | ✅ Match |
| No per-row category badge on the glossary archive term list | No change made there | ✅ Match |
| Category detail page: Glossary Terms section first, Content second, fixed order | Implemented exactly; verified live on Bextionary (terms-only) and Design Systems (mixed) | ✅ Match |
| Per-section empty hiding; combined message only when both are 0 | Implemented as `bothEmpty = items.length === 0 && terms.length === 0`; the both-empty combined-message path is logic-verified (mirrors the pre-existing single-condition check) but not exercised against a live example — no currently-live category has zero content and zero terms | ✅ Match (combined-empty path unverified live, low risk) |
| Glossary term chips on the category page prefer `abbreviation` over full `term` | `term.abbreviation ?? term.term` | ✅ Match |
| Term-page category chip destination unchanged | Confirmed via Phase 0 audit and live end-to-end click-through | ✅ Match |
| Mock's chip "featured" state shown as solid dark fill | Live DS `Chip` component's actual featured state is a pink border/outline, not a solid fill — this is how it already rendered before this epic (SUG-166), unmodified here | ℹ️ Mock inaccuracy, not implementation drift — mock under-specified the DS Chip's real active-state styling; implementation correctly used the real, pre-existing component rather than the mock's simplified approximation |
| brandColor backfill on the 6 categories missing `colorHex` | Proposed, approved, patched — **saved to Sanity drafts, not yet published** | ⏳ Pending — code path proven correct via the 2 categories that already had live colors; visual confirmation of the new 6 colors is blocked on Bex publishing the drafts in Studio |

**Net:** no drift found. One item (combined empty-state message) has no live example to visually exercise — flagged, not blocking. One item (brandColor) is code-complete but content-pending on publish, per the Human-Publishes Rule.

## Phase 0 decisions (approved 2026-07-19)

Copied here from `docs/drafts/SUG-222-glossary-category-display-mock.html` because that file is gitignored/local-only — this is the committed record for Phase 1–2 to build against.

- **Category chip color:** DS `Chip`'s existing `dotColor` prop, fed `category.colorHex`. Same mechanism the `/categories` archive row list already uses (`itemColorDot`) — no new chip variant.
- **Category description on `/glossary`:** single-line strip below the filter row, shown only when a category is active (not "All"). Instant show/hide, no animation. Requires extending `allGlossaryTermsQuery`'s category fragment to project `colorHex` + `description` (currently only projects `_id, name, slug`).
- **No per-row category badge on the glossary archive term list.** The category filter row already answers "which category"; a second badge would compete with the existing conditional `term.abbreviation` badge (e.g. "SEO") on longer term names. (Caught in review: an early mock draft had mistakenly put a category name in that abbreviation-badge slot — not an intentional design, fixed.)
- **Category detail page — Glossary Terms is its own section, not merged into `ContentList`.** `ContentList`'s row adapter (`toRow()`) assumes `title`/`publishedAt`/node-only `status`, none of which fit `glossaryTerm`'s shape (`term`, no publish date, `evergreen`/`validated`/`exploring`). A dedicated chip section (reusing the `.chipRow` pattern already used for Related Terms) avoids forking the adapter for one taxonomy corner.
- **Section order: Glossary Terms first, Content second — fixed, not content-dependent.** Keeps the page predictable across categories rather than reflowing based on which section happens to be populated.
- **Per-section empty hiding:** each section (Glossary Terms, Content) hides entirely when its own count is 0 — no heading, no "none yet" text. The combined "No content associated with this category yet." message renders only when **both** counts are 0, replacing both sections. Empty-state condition becomes `items.length === 0 && termsCount === 0` (was `items.length === 0` alone).
- **Glossary term chip labels prefer `abbreviation` over full `term`** — matches the existing SUG-211 convention (MetadataCard, GlossaryTermPage Related Terms).
- **Term-page category chip destination is unchanged** — already correct (`getCanonicalPath({docType:'category', slug})`); the fix is entirely at the destination query, not the chip.
- **Shared taxonomy, confirmed not new:** `glossaryTerm.categories[]` and `article`/`node`/`caseStudy.categories[]` reference the same `category` document type. No glossary-only category list, no schema field restricting which content types carry a given category — a node can already be tagged "Bextionary" in Studio today, unrelated to this epic.
- **Out of scope, explicitly:** URL/hash-syncing the category filter (component-local `useState`, not wired to `useFilterState()` like FilterBar elsewhere); Studio "Assigned content" decoration parity for `glossaryTerm` on `category` (gap register entry #4 — Studio-side, not required to ship the frontend fix).
- **New CSS classes, post-reuse-audit: 2** — `.categoryDescriptor`, `.glossaryTermsSection`. The terms chip row reuses the existing `.chipRow` as-is.

## Technical notes

- **Phase 0 is a hard stop** — this epic adds new visual blocks to existing pages (archive category presentation, category-page term listing), which CLAUDE.md explicitly names as mock-gated regardless of page-template age. Nav/filter surfaces in the mock need the interaction annotation layer (reuse "same as GlossaryArchivePage filter chips" where behavior is inherited).
- **Content Write Gate:** fires only for the conditional brandColor backfill; all other work is code.
- **Component reuse:** `Chip`, `IndexGroup`/`IndexCell`, `SectionLabel`, `LetterSectionHeader`, and the existing `dl/dt/dd` term-list pattern are the candidate primitives; the CSS reuse audit and proposal table are blocking before any new class. `TaxonomyDetailPage` already exists — Phase 0 decides whether category pages graduate to it or extend it rather than forking a new page component.
- **Activation audits:**
  1. `App.jsx` route map for all category/taxonomy/glossary routes (why does `/categories/:slug` use the placeholder while other taxonomies may not?).
  2. `queries.js`: enumerate every `_type in [...]` list that should arguably include `glossaryTerm`; produce the extend-vs-exempt table before editing.
  3. `GlossaryTermPage.jsx`: what the category chip currently renders/links.
  4. SUG-166's shipped doc for what the archive filter was specified to do vs. what exists.

  **Extend-vs-exempt table (produced 2026-07-19, before editing `queries.js`):**

  | Query | `_type in [...]` today | Decision | Reason |
  |---|---|---|---|
  | `allCategoriesQuery` (count) | `["article","node","caseStudy"]` | **Extend** → add `glossaryTerm` | Uses `references(^._id)`, a generic any-field backref check — safe to extend, and `glossaryTerm.categories[]` is the exact edge this epic fixes. |
  | `contentByTaxonomyQuery` | `["article","caseStudy","node"]` | **Exempt** | Shared across all 5 taxonomy types via explicit field-name matching (`categories[]`/`tags[]`/`tools[]`/`projects[]`/`authors[]`). `glossaryTerm` lacks matching field names for tag/tool/project/person, and its results feed `ContentList`, whose row adapter assumes `title`/`publishedAt`/node-only `status` — none of which fit. Extending here would silently break the Phase 0 decision to keep Glossary Terms in its own section. New `glossaryTermsByCategoryQuery` added instead, category-only. |
  | `allTagsQuery` (count) | `["article","node","caseStudy"]` | **Exempt** | Out of epic scope — this epic is glossary *category* display. `glossaryTerm.relatedTags[]` is a real edge that could deserve the same treatment, but extending tag counts is a separate epic, not scope creep here. |
  | `allToolsQuery` (count) | `["article","node","caseStudy"]` | **Exempt** | Same reasoning as tags — `glossaryTerm.relatedTools[]` exists but is out of this epic's scope. |
  | `allProjectsQuery` (count) | `["article","node","caseStudy"]` | **Exempt** | `glossaryTerm` doesn't reference `project` at all — no edge exists to count. |
  | `sitemapQuery`, `facetsRawQuery`, `allSiteItemsQuery` | various | **Exempt** | Different purpose (sitemap generation, filter-facet aggregation, site graph) — not category-content-counting, out of scope. |
- **Ontology map — existing assets to build on, not duplicate:** the `SchemaERD` component (`apps/web/src/components/SchemaERD/`) and SUG-163's content-model codegen page (`/platform/design-system/content-models`, 11 types / 176 fields) already inventory *structure*. The map's job is *intent and coverage* — which connections are approved, and how far each one actually made it toward a reader. Cross-reference them; do not re-derive field inventories.
- **Planned follow-on (Bex, 2026-07-17): article + `/platform` diagram.** The map is a repo doc first, but it is confirmed source material for (a) a Bex-voice article on reverse-engineering your own ontology (the "spec you'd write after the build" angle, with the Bextionary gap as the cold open) and (b) the map's Mermaid diagram graduating to a `/platform` page via `mermaidSection`. Both spin out as their own epic(s) at this epic's close-out, per the SUG-166 → SUG-168/169 precedent — not in this epic's scope. Practical consequence *now*: author the map's Mermaid source cleanly enough to drop into a `mermaidSection` unmodified, and keep the gap register's prose citable (the article will quote it).
- **Gap register feeds SUG-221:** the register is a natural standing input to Rules & Tools Audit cycles (an audit pass can re-tier edges and catch regressions). Note the linkage in both docs at close-out; no process wiring in this epic.
- **Model & Mode [REQUIRED]:** `/model sonnet` — section wiring, GROQ extensions, and mock-gated frontend work; no architecture ambiguity. The ontology map is careful reading, not architecture invention.

## Model & Mode [REQUIRED]

`/model sonnet` — see Technical notes above.

## Non-Goals

- No new taxonomy documents and no category renames (taxonomy pre-flight stands; this is display work).
- No schema changes expected; if one emerges from Phase 0 it ships as its own `feat(studio)` commit, not bundled.
- No knowledge-graph changes (brandColor's KG use is existing behavior; only its glossary-surface use is in scope).
- No changes to how articles/nodes/case studies display on category pages beyond adding glossary terms alongside them.

## Related

- **Linear:** [SUG-222](https://linear.app/sugartown/issue/SUG-222/glossary-category-display-surface-categories-across-glossary-and)
- **Prior art:** SUG-166 (`docs/shipped/zArchive/2026/SUG-166-glossary-completion-gap-fill-eds-import.md`) — shipped the Bextionary category + archive filter chips + masthead parenthetical; this epic builds the display layer it stopped short of
- **Structure inventories (build on, don't duplicate):** SUG-163 content-model codegen + `/platform/design-system/content-models`; `SchemaERD` component; `docs/conventions/schema-conventions.md`; MEMORY.md taxonomy-architecture entry (verify against live code before citing)
- **Adjacent:** SUG-125 (IndexGroup/IndexCell primitives), SUG-162 (glossary term detail design)
- **Ontology map addendum (added 2026-07-19):** `docs/briefs/sugartown-ontology-map.md` §"Addendum — original intention vs. current state" traces the MVP-era deprecated types (`post`/`homepage`/`header`/`footer`/`hero`/`contentBlock`) to their schema-documented successors, and shows the V1 strategy PRD's "future content growth without rework" goal holding up against `tool`/`series`/`glossaryTerm`'s later, rework-free additions — including the IA brief predicting Glossary by name three months before it shipped. Concludes gap register #1 is a display-layer execution lag, not an architecture failure.
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, and Files to Modify at activation
