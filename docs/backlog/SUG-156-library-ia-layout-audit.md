**Linear Issue:** [SUG-156](https://linear.app/sugartown/issue/SUG-156/library-ia-layout-audit-codify-page-templates-reform-archivelayout)

## EPIC NAME: Library IA Layout Audit — Codify Page Templates, Reform ArchiveLayout Story, Fill Storybook Gaps

---

## Model & Mode

`/model sonnet` — this is a documentation + Storybook authoring epic. No schema changes, no architectural decisions. Execution is mechanical: audit, write stories, reform existing story. No planning depth needed.

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — no new interactive elements. This epic only authors Storybook stories (mock/static). Existing components (ContentCard, FilterBar, AlphaFilter, Pagination, Breadcrumb, Card, Container, Stack, Grid) are reused as-is.
- [x] **Use case coverage** — Storybook stories must cover each archive/detail template variant with realistic mock data. All variants listed in the Library IA Template Audit table below.
- [x] **Layout contract** — each story must reflect the actual component tree used in production. No inline styles. No bare `<Card>` where `<ContentCard>` is the production component.
- [x] **All prop value enumerations** — no enum rendering in scope (stories use static mock data, not Sanity fields).
- [x] **Correct audit file paths** — all file paths verified via ls/Read before being listed.
- [x] **Dark / theme modifier treatment** — all stories must render correctly on both `default` and `dark-pink-moon` themes in Storybook (inherited from token layer; no new CSS authored in this epic).
- [x] **Studio schema changes scoped** — not in scope. No schema changes.
- [x] **Web adapter sync scoped** — not in scope. No DS or web adapter changes.
- [x] **Composition overlap audit** — not applicable. No new schema objects.
- [x] **Atomic Reuse Gate** — no new components created. All stories consume existing components.
- [x] **Component registry update** — `docs/conventions/component-registry.md` updated in the same commit as new stories to reflect corrected ArchiveLayout entry and any new story rows added.

---

## Context

The Library section of the Sugartown site comprises six distinct page-template families, each with its own layout contract. These templates are fully implemented in `apps/web/src/pages/` and `apps/web/src/components/` but their Storybook coverage is inconsistent:

- `ArchivePage.jsx` (the unified archive) has only `ArchiveLayout.stories.jsx` — a skeletal mock that uses bare `<Card>` with inline styles instead of the real `ContentCard`, `FilterBar`, `AlphaFilter`, `Pagination`, and `Breadcrumb` component tree. It misrepresents the actual pattern.
- `TaxonomyArchivePage.jsx`, `TaxonomyDetailPage.jsx`, and the entity detail pages (`ToolDetailPage.jsx`, `PersonProfilePage.jsx`, `ProjectDetailPage.jsx`) have **no Storybook stories at all**.
- The detail content pages (`ArticlePage`, `NodePage`, `CaseStudyPage`) have no page-level layout story documenting the detail shell structure (hero → sidebar + body → ContentNav → CitationZone pattern).

Recent epics that touched this surface area:
- SUG-155 (DS Codification Sprint) — shipped Callout/Divider/Link/FilterBar stories; did not touch page-level templates.
- SUG-152 (DS Usage Docs) — Storybook documentation audit, still in backlog; this epic covers the Layout/Patterns gap that SUG-152 does not.
- SUG-139 (Breadcrumb) — wired Breadcrumb into 8 Library pages; Breadcrumb has its own story.

---

## Objective

After this epic, every Library-section page template has at least one accurate Storybook story that uses the production component tree (not ad-hoc inline markup). The `ArchiveLayout` story is rebuilt from scratch using `ContentCard`, `FilterBar`, `AlphaFilter`, `Pagination`, and `Breadcrumb` to faithfully represent the real archive pattern. New pattern stories cover: full-filter archive layout, taxonomy archive (row layout + alpha-bucket layout), taxonomy detail shell, and the three content detail page shells. No schema changes, no query changes, no production code changes — this epic is documentation only.

---

## Library IA Template Audit

Every page template that makes up the Library section, its production component tree, and its current Storybook coverage.

### Audit legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Accurate story exists |
| ⚠️ | Story exists but inaccurate / misleading |
| ❌ | No story |

---

### Archive templates

| Template | Route(s) | Page file | Key component tree | Storybook | Gap |
|----------|----------|-----------|-------------------|-----------|-----|
| **Unified archive** | `/articles`, `/case-studies`, `/knowledge-graph` | `ArchivePage.jsx` | `Breadcrumb` → `FilterBar` → `AlphaFilter` (nodes only) → `ContentCard` grid (3-col) → `Pagination` | ⚠️ `Patterns/ArchiveLayout` GridView | Uses bare `<Card>` + inline styles; no FilterBar, no ContentCard, no Pagination |
| **Knowledge Graph archive** | `/knowledge-graph` | `ArchivePage.jsx` (archivePage doc) | Same as above + `KnowledgeGraph` toggle (graph / list views) | ⚠️ `Patterns/ArchiveLayout` | Graph toggle not shown |
| **Tag/Category archive** | `/tags`, `/categories` | `TaxonomyArchivePage.jsx` | `Breadcrumb` → row list (color dot + mono name + count) | ❌ | No story |
| **Tag archive (alpha-bucket)** | `/tags` | `TaxonomyArchivePage.jsx` | `Breadcrumb` → `AlphaFilter` → letter-bucket rows | ❌ | No story |
| **People archive** | `/people` | `TaxonomyArchivePage.jsx` | `Breadcrumb` → avatar rows (image + name + primaryTitle) | ❌ | No story |
| **Projects/Tools archive** | `/projects`, `/tools` | `TaxonomyArchivePage.jsx` | `Breadcrumb` → name + count rows | ❌ | No story |

---

### Content detail templates

| Template | Route | Page file | Key component tree | Storybook | Gap |
|----------|-------|-----------|-------------------|-----------|-----|
| **Article detail** | `/articles/:slug` | `ArticlePage.jsx` | `Hero` → `.detailPage` (sidebar + body): `MetadataCard` + `PageSidebar` + `PageSections` + `ContentNav` + `CitationZone` | ❌ | No page-shell story |
| **Node detail** | `/nodes/:slug` | `NodePage.jsx` | Same shell as ArticlePage | ❌ | No page-shell story |
| **Case study detail** | `/case-studies/:slug` | `CaseStudyPage.jsx` | Hero → full-span lead stat cards → `.detailPage`: `MetadataCard` + challenge `Callout` + `PageSidebar` + sections + `ContentNav` + `CitationZone` | ❌ | No page-shell story |

---

### Taxonomy + entity detail templates

| Template | Route(s) | Page file | Key component tree | Storybook | Gap |
|----------|----------|-----------|-------------------|-----------|-----|
| **Taxonomy detail (tag/category)** | `/tags/:slug`, `/categories/:slug` | `TaxonomyDetailPage.jsx` | `Breadcrumb` → taxonomy header (name + description + color chip) → `ContentCard` list → `Pagination` | ❌ | No story |
| **Person profile** | `/people/:slug` | `PersonProfilePage.jsx` | `Breadcrumb` → folio (Avatar + identity stack) → bio `PortableText` → roles + expertise chips → 2-col content `Grid` | ❌ | No story |
| **Tool detail** | `/tools/:slug` | `ToolDetailPage.jsx` | `Breadcrumb` → folio (logo + identity + URL) → `SectionLabel` + `Grid` content sections | ❌ | No story |
| **Project detail** | `/projects/:slug` | `ProjectDetailPage.jsx` | `Breadcrumb` → folio (thumbnail + identity) → `SectionLabel` + `Grid` content sections | ❌ | No story |

---

### Gap summary (count)

```
Total Library IA templates:      14
Currently have accurate story:    1  (ContentCard — adjacent, used in archives)
Have inaccurate/skeletal story:   2  (ArchiveLayout GridView + ListView — reform needed)
Have NO story:                   10  (see ❌ rows above)

Stories to reform:    2 (ArchiveLayout — rebuild GridView + ListView + TwoColTaxonomy + EmptyState)
Stories to create:    5 new story files covering 10 template gaps (some grouped per file):
  1. Patterns/ArchiveLayout (reformed)          — covers articles/case-studies/KG archive
  2. Patterns/TaxonomyArchivePage               — covers tag/cat/people/projects/tools archives (4 variants)
  3. Patterns/TaxonomyDetailPage                — covers tag + category detail shell
  4. Patterns/DetailPageShell                   — covers ArticlePage/NodePage/CaseStudyPage shell structure
  5. Patterns/EntityDetailPage                  — covers Person + Tool + Project detail folio pattern
```

---

## Scope

- [x] **Reform `ArchiveLayout.stories.jsx`** — rebuild all four exports (GridView, ListView, TwoColTaxonomy, EmptyState) using the real production component tree:
  - GridView: `Container size="archive"` → `Breadcrumb` → `FilterBar` → `Grid` → `ContentCard` × N → `Pagination`
  - ListView: same with `Card variant="listing"` + `ContentCard` in list mode (knowledge graph pattern)
  - TwoColTaxonomy: uses actual taxonomy row markup (dot + name + count) not `<Card>`
  - EmptyState: centered empty state block matching `pages.module.css .archiveEmpty`
  - Add a new `WithAlphaFilter` export showing the `AlphaFilter` → letter-bucket node listing pattern
- [x] **Create `TaxonomyArchivePage.stories.jsx`** — four variants:
  - `RowLayout` — tags/categories with color dot, name, description, count
  - `AlphaBucketLayout` — tags with letter buckets + AlphaFilter jump nav
  - `PeopleLayout` — avatar + name + primaryTitle rows
  - `ProjectsLayout` — name + description + count rows (no color dot)
- [x] **Create `TaxonomyDetailPage.stories.jsx`** — taxonomy header + ContentCard listing + Pagination
- [x] **Create `DetailPageShell.stories.jsx`** — documents the `detailPage` layout contract:
  - `ArticleShell` — Hero + MetadataCard aside + body sections + ContentNav + CitationZone
  - `NodeShell` — same (different status badge)
  - `CaseStudyShell` — Hero + full-span stat cards + detailPage (challenge Callout + body)
- [x] **Create `EntityDetailPage.stories.jsx`** — folio pattern used by Person, Tool, Project:
  - `PersonFolio` — Avatar + identity stack + social links + bio + content grid
  - `ToolFolio` — icon/logo + identity + URL chip + content grid
  - `ProjectFolio` — thumbnail + identity + description + content grid
- [x] **Update `docs/conventions/component-registry.md`** — mark ArchiveLayout as reformed; add new story rows for TaxonomyArchivePage, TaxonomyDetailPage, DetailPageShell, EntityDetailPage

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | No | Not a Library section template; RootPage shell is not in scope |
| `article` | Yes | DetailPageShell story covers ArticlePage layout |
| `caseStudy` | Yes | DetailPageShell story covers CaseStudyPage layout |
| `node` | Yes | DetailPageShell + ArchiveLayout stories |
| `archivePage` | Yes | ArchiveLayout story documents the unified archive pattern |

---

## Schema Field Proposal

Not applicable — no schema changes in this epic.

---

## Query Layer Checklist

Not applicable — no new GROQ projections. Stories use static mock fixtures.

---

## Schema Enum Audit

Not applicable — stories use static mock data, not live Sanity enum fields.

---

## Metadata Field Inventory

Not applicable — MetadataCard is used as-is in stories (static props); no field changes.

---

## Themed Colour Variant Audit

No new CSS authored in this epic. All components use existing token-driven styles. Stories will be verified on `default` and `dark-pink-moon` themes in Storybook before close-out.

| Surface | Dark | Light | Pink Moon | Notes |
|---------|------|-------|-----------|-------|
| All story canvases | Inherits from DS tokens | Inherits from DS tokens | Inherits from DS tokens | No new overrides needed |

---

## Non-Goals

- **No production code changes** — `ArchivePage.jsx`, `TaxonomyArchivePage.jsx`, and all page files are read-only. This epic writes Storybook stories only.
- **No schema changes** — explicitly out of scope. SUG-107 (client taxonomy) owns future schema work.
- **No new DS components** — if a story needs a component that doesn't exist, it is a gap to flag, not a prompt to build.
- **No KnowledgeGraph story** — the KnowledgeGraph visualisation component is a complex D3/WebGL surface. Its story coverage is tracked separately.
- **No `RootPage` / `HomePage` stories** — these are Platform/Marketing templates, not Library templates.
- **No SUG-152 overlap** — SUG-152 covers Storybook usage docs (MDX docs pages). This epic covers pattern stories (`.stories.jsx` render exports). Both can coexist.

---

## Technical Constraints

**Monorepo / tooling**
- Storybook runs from `apps/storybook/`; story files live in `apps/web/src/components/` and `apps/web/src/design-system/components/`
- Story imports: use `'../design-system'` barrel for DS adapter components; use named imports from `'../components/ComponentName'` for app composites
- Mock data: use `apps/web/src/components/__fixtures__/` for any reusable fixture objects. Create fixtures there if they don't exist.
- No Sanity client calls in stories — all data must be static mock props

**Story naming conventions**
- File: `ComponentName.stories.jsx` alongside the component file, or `PatternName.stories.jsx` in `apps/web/src/components/`
- `export default { title: 'Patterns/PatternName' }` — must go under `Patterns/` (not `Layout/` or `Pages/`)
- Named exports = individual story variants (PascalCase)
- Every story: wrap in a realistic viewport context via `Container` or `div` with `max-width` matching the page's actual container

**ArchiveLayout reform rules**
- GridView must use `<ContentCard>` not `<Card>` — `ContentCard` is the production archive card
- `ContentCard` requires: `_id`, `title`, `excerpt`, `publishedAt`, `slug` (object with `current`), `categories`, `tags`, `_type` props minimum
- `FilterBar` mock: pass static `filterModel` fixture (see `buildFilterModel()` shape — `{ filters: [], counts: {} }`)
- `Pagination` mock: pass `currentPage={1}` `totalPages={3}` `onPageChange={() => {}}` props

**No inline styles**
- Stories must not use `style={{ ... }}` except for structural layout overrides not covered by tokens (e.g. story wrapper max-width). Component-level styles must come from CSS modules.

---

## Files to Modify

**Reform (existing file)**
- `apps/web/src/components/ArchiveLayout.stories.jsx` — REFORM (rebuild all exports)

**Create (new story files)**
- `apps/web/src/components/TaxonomyArchivePage.stories.jsx` — CREATE
- `apps/web/src/components/TaxonomyDetailPage.stories.jsx` — CREATE
- `apps/web/src/components/DetailPageShell.stories.jsx` — CREATE
- `apps/web/src/components/EntityDetailPage.stories.jsx` — CREATE

**Fixtures (create if needed)**
- `apps/web/src/components/__fixtures__/mockContentCards.js` — CREATE (reusable mock ContentCard data)
- `apps/web/src/components/__fixtures__/mockFilterModel.js` — CREATE (reusable mock FilterBar data)

**Docs**
- `docs/conventions/component-registry.md` — UPDATE (ArchiveLayout reformed; new story rows)

---

## Deliverables

1. **ArchiveLayout reformed** — `ArchiveLayout.stories.jsx` has five accurate exports (GridView, ListView, TwoColTaxonomy, WithAlphaFilter, EmptyState) using production components
2. **TaxonomyArchivePage stories** — `TaxonomyArchivePage.stories.jsx` has four variants (RowLayout, AlphaBucketLayout, PeopleLayout, ProjectsLayout)
3. **TaxonomyDetailPage story** — `TaxonomyDetailPage.stories.jsx` shows taxonomy header + ContentCard list + Pagination
4. **DetailPageShell stories** — `DetailPageShell.stories.jsx` has ArticleShell, NodeShell, CaseStudyShell variants
5. **EntityDetailPage stories** — `EntityDetailPage.stories.jsx` has PersonFolio, ToolFolio, ProjectFolio variants
6. **Registry updated** — `component-registry.md` reflects accurate story coverage for all reformed/new entries

---

## Acceptance Criteria

- [ ] `ArchiveLayout` GridView uses `<ContentCard>` (not `<Card>`) and includes a `<FilterBar>` and `<Pagination>` in the story render
- [ ] `ArchiveLayout` TwoColTaxonomy uses the actual taxonomy row markup (color dot + name + count), not `<Card>`
- [ ] All new stories render in Storybook without console errors on both `default` and `dark-pink-moon` themes
- [ ] No story uses `style={{ ... }}` for component-level styling (structural wrapper max-width is exempt)
- [ ] Each story file has at least one variant per layout variant documented in the Library IA Template Audit table above
- [ ] `docs/conventions/component-registry.md` is updated in the same commit as the reformed/new stories
- [ ] All mock fixtures use the shape that the real component expects (verified by reading the component's prop requirements, not from memory)
- [ ] `pnpm validate:tokens --strict-colors` passes zero violations (no new CSS authored, but confirm existing story CSS is clean)

---

## Visual QA Gate

### Evidence to prepare:

1. **Screenshot of each story variant** in Storybook on both `default` and `dark-pink-moon` themes — shared in the chat before close-out
2. **ArchiveLayout accuracy check** — side-by-side: current story (pre-reform) vs reformed story vs `/articles` in the running web app. Three-column layout, FilterBar, ContentCard chips, and Pagination must visually match the real archive
3. **No inline styles check**: `grep -r 'style={{' apps/web/src/components/ArchiveLayout.stories.jsx apps/web/src/components/TaxonomyArchivePage.stories.jsx apps/web/src/components/TaxonomyDetailPage.stories.jsx apps/web/src/components/DetailPageShell.stories.jsx apps/web/src/components/EntityDetailPage.stories.jsx` — output must be empty or show only structural wrapper overrides
4. **Component registry diff** — show the before/after diff of `component-registry.md`

### Human gate:
Agent presents screenshots and diffs. Human approves or returns corrections. Agent does not proceed to close-out until "Visual QA approved."

---

## Risks / Edge Cases

**Story risks**
- `ContentCard` requires a `draftIds` Set prop for draft badge rendering — stories should pass `draftIds={new Set()}` to silence the prop warning
- `FilterBar` expects a `filterModel` object with specific shape (`{ filters: [], counts: {} }`) — use `buildFilterModel([])` or pass a pre-shaped static mock
- `PersonProfilePage` imports `@icons-pack/react-simple-icons` — confirm this package is available in the Storybook build context before writing the EntityDetailPage story. If not, use a plain `<svg>` placeholder for social icons in the story.
- `AlphaFilter` expects `letters` array + `onSelect` callback — mock these as static props in the TaxonomyArchivePage AlphaBucketLayout story

**Registry risk**
- The existing ArchiveLayout registry entry lists `ArchiveLayout | web/components/ArchiveLayout.stories.jsx` — this is non-standard (the File column points to the stories file, not a component file). After reform, update the Notes to clarify: "Reformed in SUG-156 — now uses production components."

---

## Post-Epic Close-Out

1. **Visual QA gate** — screenshots of all new/reformed stories on both themes; present comparison table; wait for "Visual QA approved"
2. **Chromatic** — run Chromatic VRT; if deferred annotate the shipped doc
3. **No data pipeline gap** — this epic has no build-time pipeline component
4. **Move epic doc** — `docs/backlog/SUG-156-library-ia-layout-audit.md` → `docs/shipped/`
5. **Confirm clean tree** — `git status` clean
6. **Run `/mini-release`** — patch bump + CHANGELOG stub
7. **Update Linear** — transition SUG-156 to Done
