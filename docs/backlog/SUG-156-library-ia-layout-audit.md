**Linear Issue:** [SUG-156](https://linear.app/sugartown/issue/SUG-156/library-ia-layout-audit-codify-page-templates-reform-archivelayout)

## EPIC NAME: Library IA Layout Audit — Introduce Pages/ Storybook Category, Retire ArchiveLayout, Fill Page Template Gaps

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

- `ArchivePage.jsx` (the unified archive) has only `ArchiveLayout.stories.jsx` — a skeletal mock that uses bare `<Card>` with inline styles instead of the real `ContentCard`, `FilterBar`, `AlphaFilter`, `Pagination`, and `Breadcrumb` component tree. It misrepresents the actual pattern. It also lives under `Patterns/` which is the wrong category level for a full page template.
- `TaxonomyArchivePage.jsx`, `TaxonomyDetailPage.jsx`, and the entity detail pages (`ToolDetailPage.jsx`, `PersonProfilePage.jsx`, `ProjectDetailPage.jsx`) have **no Storybook stories at all**.
- The detail content pages (`ArticlePage`, `NodePage`, `CaseStudyPage`) have no page-level layout story documenting the detail shell structure (hero → sidebar + body → ContentNav → CitationZone pattern).
- The Storybook sidebar has no `Pages/` top-level category. Page-template stories have no correct home — they are too large for `Patterns/` (which is for composites like ContentCard and MetadataCard) and do not belong in `Regions/` (chrome: Header, Footer) or `Components/` (DS primitives).

Recent epics that touched this surface area:
- SUG-155 (DS Codification Sprint) — shipped Callout/Divider/Link/FilterBar stories; did not touch page-level templates.
- SUG-152 (DS Usage Docs) — Storybook documentation audit, still in backlog; this epic covers the Layout/Patterns gap that SUG-152 does not.
- SUG-139 (Breadcrumb) — wired Breadcrumb into 8 Library pages; Breadcrumb has its own story.

---

## Objective

After this epic, the Storybook sidebar has a new `Pages/` top-level category that holds all full page-template stories. `ArchiveLayout.stories.jsx` is deleted and replaced by `Pages/ArchivePage` with five accurate export variants (using `ContentCard`, `FilterBar`, `AlphaFilter`, `Pagination`, `Breadcrumb`). Four new story files cover all remaining Library template families: taxonomy archives, taxonomy/entity detail pages, content detail shells, and entity folios. The existing Storybook hierarchy (`Foundations/`, `Components/`, `Patterns/`, `Regions/`) is unchanged — `Pages/` sits above `Regions/` as the top tier. No schema changes, no query changes, no production code changes — this epic is documentation only.

**Storybook category hierarchy after this epic:**
```
Foundations/     ← tokens, colours, typefaces, typography
Components/      ← DS primitives + web adapters
  Components/Layout/  ← structural layout primitives (Box, Stack, Grid, Container)
Patterns/        ← data-bound app composites (ContentCard, MetadataCard, etc.)
Regions/         ← chrome wrapping every page (Header, Footer, Hero, Preheader)
Pages/           ← full page template compositions  ← NEW
  Pages/ArchivePage
  Pages/TaxonomyArchivePage
  Pages/TaxonomyDetailPage
  Pages/ContentDetailPage
  Pages/EntityDetailPage
Legacy/
Docs/
```

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
| **Unified archive** | `/articles`, `/case-studies`, `/knowledge-graph` | `ArchivePage.jsx` | `Breadcrumb` → `FilterBar` → `AlphaFilter` (nodes only) → `ContentCard` grid (3-col) → `Pagination` | ⚠️ `Patterns/ArchiveLayout` — wrong category, inaccurate components | Replaced by `Pages/ArchivePage` |
| **Knowledge Graph archive** | `/knowledge-graph` | `ArchivePage.jsx` (archivePage doc) | Same as above + `KnowledgeGraph` toggle (graph / list views) | ⚠️ `Patterns/ArchiveLayout` | Graph toggle not shown; covered by `Pages/ArchivePage KnowledgeGraphArchive` |
| **Tag/Category archive** | `/tags`, `/categories` | `TaxonomyArchivePage.jsx` | `Breadcrumb` → row list (color dot + mono name + count) | ❌ | `Pages/TaxonomyArchivePage` |
| **Tag archive (alpha-bucket)** | `/tags` | `TaxonomyArchivePage.jsx` | `Breadcrumb` → `AlphaFilter` → letter-bucket rows | ❌ | `Pages/TaxonomyArchivePage` |
| **People archive** | `/people` | `TaxonomyArchivePage.jsx` | `Breadcrumb` → avatar rows (image + name + primaryTitle) | ❌ | `Pages/TaxonomyArchivePage` |
| **Projects/Tools archive** | `/projects`, `/tools` | `TaxonomyArchivePage.jsx` | `Breadcrumb` → name + count rows | ❌ | `Pages/TaxonomyArchivePage` |

---

### Content detail templates

| Template | Route | Page file | Key component tree | Storybook | Gap |
|----------|-------|-----------|-------------------|-----------|-----|
| **Article detail** | `/articles/:slug` | `ArticlePage.jsx` | `Hero` → `.detailPage` (sidebar + body): `MetadataCard` + `PageSidebar` + `PageSections` + `ContentNav` + `CitationZone` | ❌ | `Pages/ContentDetailPage` |
| **Node detail** | `/nodes/:slug` | `NodePage.jsx` | Same shell as ArticlePage | ❌ | `Pages/ContentDetailPage` |
| **Case study detail** | `/case-studies/:slug` | `CaseStudyPage.jsx` | Hero → full-span lead stat cards → `.detailPage`: `MetadataCard` + challenge `Callout` + `PageSidebar` + sections + `ContentNav` + `CitationZone` | ❌ | `Pages/ContentDetailPage` |

---

### Taxonomy + entity detail templates

| Template | Route(s) | Page file | Key component tree | Storybook | Gap |
|----------|----------|-----------|-------------------|-----------|-----|
| **Taxonomy detail (tag/category)** | `/tags/:slug`, `/categories/:slug` | `TaxonomyDetailPage.jsx` | `Breadcrumb` → taxonomy header (name + description + color chip) → `ContentCard` list → `Pagination` | ❌ | `Pages/TaxonomyDetailPage` |
| **Person profile** | `/people/:slug` | `PersonProfilePage.jsx` | `Breadcrumb` → folio (Avatar + identity stack) → bio `PortableText` → roles + expertise chips → 2-col content `Grid` | ❌ | `Pages/EntityDetailPage` |
| **Tool detail** | `/tools/:slug` | `ToolDetailPage.jsx` | `Breadcrumb` → folio (logo + identity + URL) → `SectionLabel` + `Grid` content sections | ❌ | `Pages/EntityDetailPage` |
| **Project detail** | `/projects/:slug` | `ProjectDetailPage.jsx` | `Breadcrumb` → folio (thumbnail + identity) → `SectionLabel` + `Grid` content sections | ❌ | `Pages/EntityDetailPage` |

---

### Gap summary (count)

```
Total Library IA templates:      14
Currently have accurate story:    1  (ContentCard — adjacent, used in archives)
Have inaccurate/skeletal story:   2  (ArchiveLayout — wrong category + inaccurate component tree)
Have NO story:                   10  (see ❌ rows above)
Missing Storybook category:       1  (no Pages/ top-level category exists)

Actions:
  DELETE:  ArchiveLayout.stories.jsx  (Patterns/ArchiveLayout — wrong level, inaccurate)
  CREATE:  Pages/ top-level category  (introduced by first story file using title: 'Pages/...')
  CREATE:  5 new story files:
    1. Pages/ArchivePage              — ArticlesArchive, KnowledgeGraphArchive,
                                        CaseStudiesArchive, TaxonomyArchive, EmptyState
    2. Pages/TaxonomyArchivePage      — RowLayout, AlphaBucketLayout, PeopleLayout, ProjectsLayout
    3. Pages/TaxonomyDetailPage       — TagDetail, CategoryDetail
    4. Pages/ContentDetailPage        — ArticleShell, NodeShell, CaseStudyShell
    5. Pages/EntityDetailPage         — PersonFolio, ToolFolio, ProjectFolio
```

---

## Scope

- [x] **Introduce `Pages/` Storybook category** — created implicitly by the first story file using `title: 'Pages/...'`. No configuration change needed; Storybook auto-creates category groups from title strings.
- [x] **Delete `ArchiveLayout.stories.jsx`** — remove the existing file entirely. It will be superseded by `Pages/ArchivePage`.
- [x] **Create `ArchivePage.stories.jsx`** — `title: 'Pages/ArchivePage'`, five named exports using the real production component tree:
  - `ArticlesArchive` — `Container size="archive"` → `Breadcrumb` → `FilterBar` → `Grid` 3-col → `ContentCard` × N → `Pagination`
  - `KnowledgeGraphArchive` — same + `AlphaFilter` letter-bucket variant for node listing
  - `CaseStudiesArchive` — same as ArticlesArchive (different mock data)
  - `TaxonomyArchive` — two-column taxonomy row listing (dot + name + count), no FilterBar
  - `EmptyState` — `archiveEmpty` state matching `pages.module.css` treatment
- [x] **Create `TaxonomyArchivePage.stories.jsx`** — `title: 'Pages/TaxonomyArchivePage'`, four variants:
  - `RowLayout` — tags/categories with color dot, name, description, count
  - `AlphaBucketLayout` — tags with `AlphaFilter` jump nav + letter-bucket rows
  - `PeopleLayout` — avatar + name + primaryTitle rows
  - `ProjectsLayout` — name + description + count rows (no color dot)
- [x] **Create `TaxonomyDetailPage.stories.jsx`** — `title: 'Pages/TaxonomyDetailPage'`, two variants:
  - `TagDetail` — Breadcrumb → tag header (name + color chip + description) → ContentCard list → Pagination
  - `CategoryDetail` — same with category mock data
- [x] **Create `ContentDetailPage.stories.jsx`** — `title: 'Pages/ContentDetailPage'`, documents the `detailPage` layout contract:
  - `ArticleShell` — Hero + MetadataCard aside + body sections + ContentNav + CitationZone
  - `NodeShell` — same with node-specific status badge mock data
  - `CaseStudyShell` — Hero + full-span stat cards + detailPage (challenge Callout + body sections)
- [x] **Create `EntityDetailPage.stories.jsx`** — `title: 'Pages/EntityDetailPage'`, folio pattern used by Person, Tool, Project:
  - `PersonFolio` — Avatar + identity stack + social links + bio + 2-col content Grid
  - `ToolFolio` — icon/logo + identity + URL chip + SectionLabel + Grid content sections
  - `ProjectFolio` — thumbnail + identity + description + SectionLabel + Grid content sections
- [x] **Update `docs/conventions/component-registry.md`** — remove ArchiveLayout row; add `Pages/` section with rows for ArchivePage, TaxonomyArchivePage, TaxonomyDetailPage, ContentDetailPage, EntityDetailPage

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

**Storybook category hierarchy**
- `Pages/` is the new top-level category for full page template stories. It sits above `Regions/` in the sidebar.
- The category is created implicitly — the first story file with `title: 'Pages/...'` creates the group. No Storybook config change needed.
- Existing categories (`Foundations/`, `Components/`, `Patterns/`, `Regions/`, `Legacy/`, `Docs/`) are unchanged.

**Story naming conventions**
- File: `TemplateName.stories.jsx` in `apps/web/src/components/` alongside related component files
- `export default { title: 'Pages/TemplateName' }` — all new page template stories go under `Pages/`
- Named exports = individual story variants (PascalCase), matching the names in the Gap summary above
- Every story: wrap in a realistic viewport context via `Container` with the correct `size` prop matching the production page (`"archive"` for archive pages, `"detail"` for content/entity detail pages)

**`Pages/ArchivePage` story rules**
- All card variants must use `<ContentCard>` not `<Card>` — `ContentCard` is the production archive card
- `ContentCard` requires at minimum: `_id`, `title`, `excerpt`, `publishedAt`, `slug` (object with `current`), `categories`, `tags`, `_type`
- `FilterBar` mock: pass a static `filterModel` fixture shaped as `{ filters: [], counts: {} }` (from `mockFilterModel.js`)
- `Pagination` mock: `currentPage={1}` `totalPages={3}` `onPageChange={() => {}}`

**No inline styles**
- Stories must not use `style={{ ... }}` except for structural layout overrides not covered by tokens (e.g. story wrapper max-width). Component-level styles must come from CSS modules.

---

## Files to Modify

**Delete (existing file)**
- `apps/web/src/components/ArchiveLayout.stories.jsx` — DELETE (superseded by Pages/ArchivePage)

**Create (new story files)**
- `apps/web/src/components/ArchivePage.stories.jsx` — CREATE (`Pages/ArchivePage`)
- `apps/web/src/components/TaxonomyArchivePage.stories.jsx` — CREATE (`Pages/TaxonomyArchivePage`)
- `apps/web/src/components/TaxonomyDetailPage.stories.jsx` — CREATE (`Pages/TaxonomyDetailPage`)
- `apps/web/src/components/ContentDetailPage.stories.jsx` — CREATE (`Pages/ContentDetailPage`)
- `apps/web/src/components/EntityDetailPage.stories.jsx` — CREATE (`Pages/EntityDetailPage`)

**Fixtures (create if needed)**
- `apps/web/src/components/__fixtures__/mockContentCards.js` — CREATE (reusable mock ContentCard data)
- `apps/web/src/components/__fixtures__/mockFilterModel.js` — CREATE (reusable mock FilterBar data)

**Docs**
- `docs/conventions/component-registry.md` — UPDATE (ArchiveLayout reformed; new story rows)

---

## Deliverables

1. **`Pages/` category exists** — visible in the Storybook sidebar above `Regions/`, created by the first `Pages/...` title string
2. **`ArchiveLayout.stories.jsx` deleted** — file removed; `Patterns/ArchiveLayout` no longer appears in the sidebar
3. **`Pages/ArchivePage`** — `ArchivePage.stories.jsx` with five exports: `ArticlesArchive`, `KnowledgeGraphArchive`, `CaseStudiesArchive`, `TaxonomyArchive`, `EmptyState` — all using `ContentCard`, `FilterBar`, `Breadcrumb`, `Pagination`
4. **`Pages/TaxonomyArchivePage`** — four variants: `RowLayout`, `AlphaBucketLayout`, `PeopleLayout`, `ProjectsLayout`
5. **`Pages/TaxonomyDetailPage`** — two variants: `TagDetail`, `CategoryDetail`
6. **`Pages/ContentDetailPage`** — three variants: `ArticleShell`, `NodeShell`, `CaseStudyShell`
7. **`Pages/EntityDetailPage`** — three variants: `PersonFolio`, `ToolFolio`, `ProjectFolio`
8. **Registry updated** — `component-registry.md` has a new `Pages/` section; `ArchiveLayout` row removed

---

## Acceptance Criteria

- [ ] `Patterns/ArchiveLayout` no longer appears in the Storybook sidebar — `ArchiveLayout.stories.jsx` is deleted
- [ ] `Pages/` top-level category is visible in the sidebar above `Regions/`
- [ ] `Pages/ArchivePage` has exactly five exports: `ArticlesArchive`, `KnowledgeGraphArchive`, `CaseStudiesArchive`, `TaxonomyArchive`, `EmptyState`
- [ ] `Pages/ArchivePage ArticlesArchive` uses `<ContentCard>` (not `<Card>`) and includes `<FilterBar>` and `<Pagination>`
- [ ] All five `Pages/` story files render without console errors on both `default` and `dark-pink-moon` themes
- [ ] No story uses `style={{ ... }}` for component-level styling (structural wrapper `Container size` prop is the correct approach)
- [ ] Each story file has all variants listed in the Gap summary above
- [ ] `docs/conventions/component-registry.md` updated in the same commit: `ArchiveLayout` row removed, new `Pages/` section added
- [ ] All mock fixtures use the shape the real component expects (verified by reading component props, not from memory)
- [ ] `pnpm validate:tokens --strict-colors` passes zero violations

---

## Visual QA Gate

### Evidence to prepare:

1. **Screenshot of each story variant** in Storybook on both `default` and `dark-pink-moon` themes — shared in the chat before close-out
2. **ArchivePage accuracy check** — side-by-side: new `Pages/ArchivePage ArticlesArchive` story vs `/articles` in the running web app. Three-column layout, FilterBar, ContentCard chips, and Pagination must visually match.
3. **Sidebar structure screenshot** — Storybook sidebar showing `Pages/` category above `Regions/`, confirming `Patterns/ArchiveLayout` is gone
4. **No inline styles check**: `grep -r 'style={{' apps/web/src/components/ArchivePage.stories.jsx apps/web/src/components/TaxonomyArchivePage.stories.jsx apps/web/src/components/TaxonomyDetailPage.stories.jsx apps/web/src/components/ContentDetailPage.stories.jsx apps/web/src/components/EntityDetailPage.stories.jsx` — output must be empty or show only structural wrapper overrides
5. **Component registry diff** — show the before/after diff of `component-registry.md`

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
- The existing ArchiveLayout registry entry lists `ArchiveLayout | web/components/ArchiveLayout.stories.jsx` — the File column non-standardly points to the stories file. The whole row is removed in this epic; the new `Pages/` section in the registry documents the replacement stories.

---

## Post-Epic Close-Out

1. **Visual QA gate** — screenshots of all new/reformed stories on both themes; present comparison table; wait for "Visual QA approved"
2. **Chromatic** — run Chromatic VRT; if deferred annotate the shipped doc
3. **No data pipeline gap** — this epic has no build-time pipeline component
4. **Move epic doc** — `docs/backlog/SUG-156-library-ia-layout-audit.md` → `docs/shipped/`
5. **Confirm clean tree** — `git status` clean
6. **Run `/mini-release`** — patch bump + CHANGELOG stub
7. **Update Linear** — transition SUG-156 to Done
