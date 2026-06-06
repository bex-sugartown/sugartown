**Linear Issue:** [SUG-152](https://linear.app/sugartown/issue/SUG-152/ds-usage-docs-storybook-documentation-audit-and-creation-phase-n)
## EPIC NAME: DS Usage Docs — Storybook documentation audit and creation

---

## Model & Mode

`/model sonnet` — pure content/editorial epic. Prose authoring and Storybook TSX only. No architecture decisions.

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — no new interactive elements. Storybook `.stories.tsx` files only.
- [x] **Use case coverage** — N/A. No new component or web adapter.
- [x] **Layout contract** — N/A. Storybook docs use inline styles and existing DS tokens.
- [x] **All prop value enumerations** — N/A. No enum fields rendered from Sanity.
- [x] **Correct audit file paths** — Reference files verified: `apps/storybook/.storybook/stories/TypographyConventions.stories.tsx`, `docs/conventions/usage-doc-style-guide.md`, `apps/storybook/.storybook/stories/_UsageDocTemplate.tsx`
- [x] **Dark / theme modifier treatment** — Story files use `var(--st-*)` tokens throughout. Storybook theme toggle exercises the token cascade. No per-theme CSS overrides needed in story files.
- [x] **Studio schema changes scoped** — None. This epic does not touch any Sanity schema.
- [x] **Web adapter sync scoped** — N/A. No DS component created or modified.
- [x] **Composition overlap audit** — N/A. No schema sub-objects.
- [x] **Atomic Reuse Gate** — No new components. Each story is a standalone `.stories.tsx` page in `Foundations/`.
- [x] **Component registry update** — N/A. No components created or retired.

---

## Context

SUG-141 established the Storybook usage doc format and shipped the first doc (`TypographyConventions.stories.tsx` — H1 italic/roman rule). It also produced:

- `docs/conventions/usage-doc-style-guide.md` — section order, voice, format rules
- `apps/storybook/.storybook/stories/_UsageDocTemplate.tsx` — copy-paste starter

The Storybook `Foundations/` category currently has: Welcome, ThemeGuide, TokenReference, ComponentContracts, Contributing, TypographyConventions.

The design system has many implicit conventions that live only in `CLAUDE.md`, CSS comments, or institutional memory. Each new session or contributor reverse-engineers them. This epic systematically documents them as usage docs.

**Execution model:** Each topic is proposed, reviewed, and approved before the story file is written. Pause after proposing each topic — no story is written without explicit sign-off on angle and scope.

---

## Objective

After this epic: a set of Storybook usage docs in `Foundations/` covering the DS conventions most likely to be mis-implemented. Each doc covers one convention — rule first, live visual examples, do/don't pairs, implementation references. The Storybook `Foundations/` category becomes a navigable reference for anyone working on the design system.

Schema layer: not touched. Query layer: not touched. Render layer: Storybook story files only.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ No | Documentation only — no Sanity doc type touched |
| `article`   | ☐ No | Documentation only |
| `caseStudy` | ☐ No | Documentation only |
| `node`      | ☐ No | Documentation only |
| `archivePage` | ☐ No | Documentation only |

---

## Schema Field Proposal

N/A — no schema changes.

---

## Scope

Candidate topics — reviewed and approved one at a time before authoring. Order subject to change at review.

### Phase 1 — Section Spacing Contract
- [ ] Propose topic angle and live preview approach
- [ ] **Pause for review**
- [ ] Write `SectionSpacing.stories.tsx`
- [ ] Commit: `docs(storybook): SUG-152 Phase 1 — Section Spacing Contract usage doc`

**Topic brief:**  
Title: Section Spacing Contract  
One-liner: How `.detailContext` owns all inter-section gap — components must not add external margin.  
Rule: Parent container owns gap via `display: flex; gap`. Individual sections have zero `margin-block`. Internal box padding (callout inset, code block padding) is allowed.  
Live preview: Side-by-side — correct (gap only on parent) vs wrong (component adds margin-block, double-padding results).  
CSS surface: `apps/web/src/pages/pages.module.css` `.detailContext`, `apps/web/src/components/PageSections.module.css`  
**SUG-156 reference:** `Pages/ContentDetailPage` (ArticleShell, NodeShell, CaseStudyShell) shows `.detailPage[data-has-margin]` in production context — use as a live reference for the two-column shell anatomy.

### Phase 2 — Entity Folio Layout
- [ ] Propose topic angle and live preview approach
- [ ] **Pause for review**
- [ ] Write `EntityFolio.stories.tsx`
- [ ] Commit: `docs(storybook): SUG-152 Phase 2 — Entity Folio Layout usage doc`

**Topic brief:**  
Title: Entity Folio Layout  
One-liner: The flex-row pattern for all entity detail pages — thumbnail left, identity block right.  
Rule: Use `entityFolio` + `folioIdentity` from `pages.module.css`. Do not implement folio layout by hand.  
Live preview: Annotated folio — thumbnail slot, eyebrow, heading (roman/italic per type), description, metadata.  
CSS surface: `apps/web/src/pages/pages.module.css` `.entityFolio`, `.folioIdentity`, `.entityThumbnail`, `.entityThumbnailFallback`  
**SUG-156 reference:** `Pages/EntityDetailPage` (PersonFolio, ToolFolio, ProjectFolio) shows all three folio variants in production context — use as a live reference for each entity type's thumbnail size and eyebrow content.

### Phase 3 — Chip / Tag Taxonomy
- [ ] Propose topic angle and live preview approach
- [ ] **Pause for review**
- [ ] Write `ChipTaxonomy.stories.tsx`
- [ ] Commit: `docs(storybook): SUG-152 Phase 3 — Chip/Tag Taxonomy usage doc`

**Topic brief:**  
Title: Chip / Tag Taxonomy  
One-liner: Which component to use — DS Chip, Tag, or inline expertise chip — and when not to create a new one.  
Rule: Chip = interactive/filterable. Tag = read-only label. `expertiseChip` = routed link chip on profile pages. Pill = deprecated alias for Chip.  
Live preview: Three-row comparison — visual state, interactivity, use case.

### Phase 4 — Card Composition Rules
- [ ] Propose topic angle and live preview approach
- [ ] **Pause for review**
- [ ] Write `CardComposition.stories.tsx`
- [ ] Commit: `docs(storybook): SUG-152 Phase 4 — Card Composition Rules usage doc`

**Topic brief:**  
Title: Card Composition Rules  
One-liner: When to use DS Card vs ContentCard vs MetadataCard — and what each one owns.  
Rule: Card = DS primitive, no data binding. ContentCard = bound to Sanity content types (article/node/caseStudy), renders in archive grids and taxonomy detail listings. MetadataCard = canonical metadata surface on content detail pages; never re-implement inline.  
**SUG-156 addition — ContentCard usage context:** Phase 4 must cover ContentCard's two primary calling contexts, both introduced in Pages/ stories:  
  1. **Archive grid context** (`Pages/ArchivePage`) — 3-col Grid with `spacing="md"`, full `item` shape including `slug`, `excerpt`, `publishedAt`, taxonomy arrays. Receives `docType` to determine routing.  
  2. **Taxonomy detail listing context** (`Pages/TaxonomyDetailPage`) — same ContentCard, `.archiveGrid` wrapper, no FilterBar. Shows that ContentCard is context-agnostic; the surrounding layout changes, not the card.  
Do/don't: do not render bare DS `Card` in archive grids — ContentCard handles the Sanity data binding, slug routing, and TaxonomyChips. Do not re-implement the listing card layout inline.

### Phase 5 — Responsive Breakpoints
- [ ] Propose topic angle and live preview approach
- [ ] **Pause for review**
- [ ] Write `Breakpoints.stories.tsx`
- [ ] Commit: `docs(storybook): SUG-152 Phase 5 — Responsive Breakpoints usage doc`

**Topic brief:**  
Title: Breakpoint Rationale  
One-liner: The two primary breakpoints, which surfaces they govern, and how to derive new ones.  
Rule: `860px` = table/grid collapse (minimum for prose + 2-col grid). `768px` = nav toggle threshold. New surfaces derive from content width, not arbitrary values.

### Phase 6 — Semantic vs Primitive Tokens
- [ ] Propose topic angle and live preview approach
- [ ] **Pause for review**
- [ ] Write `TokenLayers.stories.tsx`
- [ ] Commit: `docs(storybook): SUG-152 Phase 6 — Token Layers usage doc`

**Topic brief:**  
Title: Token Layers — Semantic vs Primitive  
One-liner: When to use `--st-color-text-primary` vs `--st-color-pink` — and why the wrong choice breaks in dark mode.  
Rule: Use semantic tokens in components. Use primitives only in token definition files and theme overrides.  
Live preview: Two columns — "Semantic in component (correct)" vs "Primitive in component (breaks in dark mode)".

### Phase 7 — Grid Usage (spacing-0 pattern)
- [ ] Propose topic angle and live preview approach
- [ ] **Pause for review**
- [ ] Write `GridUsage.stories.tsx`
- [ ] Commit: `docs(storybook): SUG-152 Phase 7 — Grid Usage usage doc`

**Topic brief:**  
Title: Grid Usage — spacing-0 and tile primitives  
One-liner: The `spacing-0` bg-through-gap pattern and which primitives belong inside it.  
Rule: `spacing="0"` Grid uses parent background as hairline divider — children must be borderless tile primitives (StatCard). Never place Card (own border) inside a spacing-0 Grid; it stacks against the outer border producing a double-border. `accentTop accentColor="ink"` adds a 2px ink top border to the entire group and is required on both stats and artifact tile grids.  
Live preview: Correct (StatCard in spacing-0) vs wrong (Card in spacing-0 — shows double-border). Annotated accentTop colour swatch.  
CSS surface: `apps/web/src/design-system/components/grid/Grid.module.css`

### Phase 8 — Component Naming Decisions (deferred — after Phase 4 ships)
- [ ] Propose topic angle and live preview approach
- [ ] **Pause for review**
- [ ] Write `ComponentNaming.stories.tsx`
- [ ] Commit: `docs(storybook): SUG-152 Phase 8 — Component Naming Decisions usage doc`

**Topic brief:**  
Title: Component Naming Decisions  
One-liner: Why components are named the way they are — StatCard vs Card, ContentCard vs Card, and the rules that prevent naming drift.  
Rule: Names encode role, not appearance. StatCard = tile primitive for spacing-0 grids. Card = standalone bordered surface. ContentCard = Sanity-bound data adapter. A name like DataCard or InfoCard is a signal the audit was skipped.  
Deferred until Phase 4 (CardComposition) ships — assess what naming ground Phase 4 already covers before writing.

### Phase 9 — Archive Page Patterns (NEW — added from SUG-156 audit)
- [ ] Propose topic angle and live preview approach
- [ ] **Pause for review**
- [ ] Write `ArchivePatterns.stories.tsx`
- [ ] Commit: `docs(storybook): SUG-152 Phase 9 — Archive Page Patterns usage doc`

**Topic brief:**  
Title: Archive Page Patterns  
One-liner: The shared CSS classes and component slots used by all archive and taxonomy listing pages.  
Motivation: SUG-156 introduced Pages/ stories that document these patterns live, but the rules for *when* and *how* to use them are not written down. A new archive-type page will re-invent `.archiveHeader` or mis-use FilterBar without this doc.  
Covers four patterns:  
  1. **Archive header** — `.archiveHeader` + `.archiveTitle` + `.archiveCount` from `TaxonomyArchivePage.module.css`. The three-part title block used on every taxonomy listing page. Rule: always pair title + count in this wrapper; never float the count or append it to the h1 text.  
  2. **TaxonomyItem row** — `.item` / `.itemList` / `.itemLink` / `.itemLabel` / `.itemSublabel` / `.itemCount` / `.itemColorDot` / `.itemAvatarFallback`. The unified row primitive for tags, categories, tools, people, projects. Rule: all taxonomy listing rows use this class set; do not create a new row pattern.  
  3. **FilterBar + Pagination pairing** — `FilterBar` (from design-system) receives `filterModel` (from `buildFilterModel()`), `activeFilters` (from `useFilterState()`). Pagination receives `currentPage`/`totalPages`/`onPageChange`. Rule: these always appear together on content archives (ArchivePage); taxonomy archives (TaxonomyArchivePage) do not use FilterBar. `AlphaFilter` is taxonomy-archive-only (tools, people).  
  4. **Breadcrumb placement** — Breadcrumb always sits immediately inside the page `<main>`, before the archive header, with no extra wrapper. Rule: never nest Breadcrumb inside the archive header div; it must be a direct sibling above it.  
Live preview: Annotated anatomy of a taxonomy archive page — breadcrumb slot, archive header slot, item list slot, showing the class names and their responsibilities.  
CSS surface: `apps/web/src/pages/TaxonomyArchivePage.module.css`, `apps/web/src/pages/pages.module.css`  
**SUG-156 reference:** `Pages/TaxonomyArchivePage` (RowLayout, AlphaBucketLayout, PeopleLayout, ProjectsLayout) and `Pages/ArchivePage` (ArticlesArchive) are the live reference implementations for this doc.

### Contributing.stories.tsx — Storybook category taxonomy (sub-task, no new file)
- [ ] Add a "Storybook organisation" section to the existing `Contributing.stories.tsx`
- [ ] Section covers: **three** categories — Components (primitives), Patterns (composites), Pages (full page templates) — plus Foundations (usage docs) and Regions (header/footer/nav). Updated from original "two categories" scope following SUG-156 which introduced the Pages/ category.
- [ ] Naming convention for story titles, export naming by page (ArticlesArchive not just Archive)
- [ ] Commit: `docs(storybook): SUG-152 Contributing — add Storybook category taxonomy section`

---

## Query Layer Checklist

N/A — no query changes.

---

## Schema Enum Audit

N/A — no enum fields from Sanity rendered.

---

## Metadata Field Inventory

N/A — MetadataCard not in scope.

---

## Themed Colour Variant Audit

All story files use `var(--st-*)` tokens exclusively. No per-theme overrides needed. Token values are exercised by the Storybook theme toggle.

| Surface | Dark | Light | Pink Moon | Token(s) |
|---------|------|-------|-----------|----------|
| All story surfaces | inherits from token cascade | inherits | inherits | `var(--st-*)` only — no hardcoded values |

---

## Non-Goals

- No CSS, JSX, schema, or token changes
- No new page templates or routes
- No Sanity documents
- No changes to existing stories — this epic adds new story files only
- Does not replace inline code comments
- No third-party DS doc tools (Zeroheight, Supernova)
- External/stakeholder DS showcasing remains at `/platform/design-system` — these docs are developer-facing

---

## Technical Constraints

**Monorepo / tooling**
- Stories live in `apps/storybook/.storybook/stories/`
- File naming: `<ConventionName>.stories.tsx` (PascalCase, no spaces)
- Storybook title: `'Foundations/<Name>'`

**Story format (non-negotiable)**
- Inline styles only — no className imports from other modules
- All colours via `var(--st-*)` tokens. No hex values.
- Component function named `<ConventionName>Page` returning a `<div>`
- Meta: `layout: 'padded'`, controls and actions disabled
- One export: `export const Default: Story = {}`
- Match the shared `s` object pattern from `TypographyConventions.stories.tsx`

**Schema / Query / Render** — N/A for this epic.

**DS Component Color Authoring** — N/A. No component CSS files touched.

**Web Adapter Sync** — N/A.

---

## Migration Script Constraints

N/A.

---

## Files to Modify

**Storybook — one file per phase:**
- `apps/storybook/.storybook/stories/SectionSpacing.stories.tsx` — CREATE (Phase 1)
- `apps/storybook/.storybook/stories/EntityFolio.stories.tsx` — CREATE (Phase 2)
- `apps/storybook/.storybook/stories/ChipTaxonomy.stories.tsx` — CREATE (Phase 3)
- `apps/storybook/.storybook/stories/CardComposition.stories.tsx` — CREATE (Phase 4)
- `apps/storybook/.storybook/stories/Breakpoints.stories.tsx` — CREATE (Phase 5)
- `apps/storybook/.storybook/stories/TokenLayers.stories.tsx` — CREATE (Phase 6)
- `apps/storybook/.storybook/stories/GridUsage.stories.tsx` — CREATE (Phase 7)
- `apps/storybook/.storybook/stories/ComponentNaming.stories.tsx` — CREATE (Phase 8, deferred)
- `apps/storybook/.storybook/stories/ArchivePatterns.stories.tsx` — CREATE (Phase 9, from SUG-156 audit)
- `apps/storybook/.storybook/stories/Contributing.stories.tsx` — MODIFY (add category taxonomy section, update to three categories)

No other files touched.

---

## Deliverables

1. Each accepted topic has a `.stories.tsx` file in `apps/storybook/.storybook/stories/`
2. Each story renders in Storybook under `Foundations/<Name>` without console errors
3. All candidate topics reviewed (accepted, deferred, or dropped) with rationale

---

## Acceptance Criteria

- [ ] All candidate topics reviewed — accepted, deferred, or dropped with explicit reason (originally 6; expanded to 9 + Contributing sub-task after SUG-156 audit)
- [ ] Each accepted story renders in Storybook `Foundations/` without console errors
- [ ] No hardcoded hex/rgba values in any story file — verified by `pnpm validate:tokens --strict-colors` (zero violations)
- [ ] Each story follows the style guide: rule first, live preview using real DS tokens, do/don't, implementation references
- [ ] Content is prescriptive and usage-facing — no origin history, no phase candidates, no uncertainty markers

---

## Visual QA Gate

For each story file: render in Storybook on both `default` and `dark-pink-moon` themes and confirm tokens resolve correctly (no black boxes, no missing colours). This is lightweight — token inheritance handles it if `var(--st-*)` is used consistently.

Human gate: review each story in Storybook at `http://localhost:6006` before the phase commit.

---

## Risks / Edge Cases

**Schema risks** — N/A.

**Query risks** — N/A.

**Migration risks** — N/A.

**Render risks**
- [ ] A live preview that references a CSS class from `pages.module.css` cannot be imported in a Storybook story (would require a class import). Mitigation: replicate the visual using inline styles that match the token values — do not import page CSS modules.
- [ ] Stories must not import from `apps/web/src/` — Storybook is a separate app. Any convention that requires rendering a real component must be done by replicating the styles inline, not by importing the component.

---

## Post-Epic Close-Out

1. Visual QA gate — each story reviewed in Storybook (both themes) by Bex
2. Chromatic — run at close-out across all new stories
3. Data pipeline gap check — N/A
4. Move: `docs/backlog/SUG-152-ds-storybook-usage-docs-audit.md` → `docs/shipped/`
5. Confirm clean tree
6. Run `/mini-release`
7. Update Linear SUG-152 → Done
