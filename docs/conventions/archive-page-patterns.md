# Archive Page Patterns — Component Inventory

**Epic:** [SUG-159](https://linear.app/sugartown/issue/SUG-159/archive-page-component-inventory)
**Status:** Phase 1 complete — verified against source
**Last verified:** 2026-06-09

This document is the canonical reference for what DS components, CSS classes, tokens, and patterns are used on archive and listing pages. Use it when mocking new archive-style surfaces so you can reuse confirmed patterns rather than re-auditing source.

---

## Table of contents

1. [ArchivePage (articles, case-studies, knowledge-graph, library)](#1-archivepage)
2. [TaxonomyArchivePage (tags, categories, projects, people, tools)](#2-taxonomyarchivepage)
3. [GlossaryArchivePage (/glossary)](#3-glossaryarchivepage)
4. [Legacy stubs (deprecated)](#4-legacy-stubs)
5. [Shared masthead pattern — PageHeader](#5-shared-masthead-pattern)
6. [H1 italic / roman rule](#6-h1-italicroman-rule)

---

## 1. ArchivePage

**File:** `apps/web/src/pages/ArchivePage.jsx`
**CSS:** `apps/web/src/pages/pages.module.css`
**Routes (driven by Sanity `archivePage` doc):**

| Route | archiveSlug | contentTypes |
|-------|-------------|--------------|
| `/articles` | `articles` | `[article]` |
| `/case-studies` | `case-studies` | `[caseStudy]` |
| `/knowledge-graph` | `knowledge-graph` | `[node]` |
| `/library` | `library` | `[article, node, caseStudy]` |

### DS components

| Component | Import | Props used |
|-----------|--------|------------|
| `Breadcrumb` | `../design-system` | `items={[{ label: 'Library', href: '/library' }]}` (suppressed on /library itself) |
| `FilterBar` | `../design-system` | `filterModel`, `activeFilters`, `onFilterChange`, `onClearAll` |
| `ContentCard` | `../components/ContentCard` | `item`, `docType`, `variant` (`'listing'` or `'default'`), `showExcerpt`, `showHeroImage`, `imageOverride`, `categoryPosition`, `draftIds` |
| `Pagination` | `../components/Pagination` | `currentPage`, `totalPages`, `onPageChange` |
| `KnowledgeGraph` | `../components/KnowledgeGraph/KnowledgeGraph` | `graphData`, `onNodeClick` |
| `DraftBadge` | `../components/DraftBadge` | `docId={archiveDoc._id}` |
| `SeoHead` | `../components/SeoHead` | `seo`, `jsonLd` |
| `PortableText` | `@portabletext/react` | `value={subheading}`, `components={portableTextComponents}` |

> Note: `PageHeader` is **not** used here — the masthead is a raw `<header>` with `.archiveHeading` + `.archiveHeadingItalic` from `pages.module.css`. (See §5 for when PageHeader is used instead.)

### CSS classes (`pages.module.css`)

| Class | Role |
|-------|------|
| `.archivePage` | Root wrapper — `max-width: 1164px`, `margin: 0 auto`, `padding: 3rem 1.5rem 5rem` |
| `.masthead` | Breadcrumb + H1 + description header block |
| `.archiveHeading` | H1 — `clamp(2rem, 5vw, 3rem)`, narrative font inherited |
| `.archiveHeadingItalic` | Modifier applied with `.archiveHeading` — italic style |
| `.archiveDescription` | Subheading / description below H1 |
| `.archiveSection` | Bordered section container — `border: 1px solid var(--st-color-rule-accent)` |
| `.archiveToolbar` | Toolbar row at top of section — layout toggles + kicker stat |
| `.archiveToolbarLeft` | Flex group: toggle buttons + divider + FilterStrip |
| `.archiveToolbarDivider` | 1px vertical rule between toolbar zones |
| `.archiveToolbarKicker` | Right-side count label — mono, 10px, uppercase |
| `.layoutToggleGroup` | Flex group for grid/list/graph toggle buttons |
| `.layoutToggleBtn` | 32×32px icon button — `border`, transparent bg |
| `.layoutToggleBtnActive` | Active state modifier — brand-primary border + color |
| `.archiveSectionContent` | Content area inside bordered section — `padding: 24px` |
| `.archiveLayout` | Flex-wrap layout: `aside` (FilterBar, 220px) + `.archiveContent` |
| `.archiveContent` | `flex: 1 1 400px` — grows to fill remaining space |
| `.archiveGrid` | `display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--st-space-card-gap)` |
| `.archiveGrid[data-layout="list"]` | Single-column override when user selects list view |
| `.archiveResultCount` | Filter result count line (0.875rem, text-muted) |
| `.archiveEmpty` | Empty / loading state — centered, text-muted |
| `.clearFiltersLink` | Inline button in filtered-empty state |
| `.graphViewLayout` | Graph view: flex row — `.graphPane` (flex: 1) + `.graphCardRail` (230px) |
| `.graphPane` | Graph canvas |
| `.graphCardRail` | 230px sticky card rail — shows selected node card |
| `.graphCardRailHint` | Placeholder when no node selected |
| `.graphHubCard` | Project/category hub card in graph rail |

### Tokens (direct references in pages.module.css)

| Token | Context |
|-------|---------|
| `--st-color-rule-accent` | Archive section border, toolbar dividers |
| `--st-color-bg-surface` | Toolbar background |
| `--st-color-border-subtle` | Layout toggle button borders |
| `--st-color-border-medium` | Toggle button hover border |
| `--st-color-brand-primary` | Active toggle border + color; clear-filters link; kicker |
| `--st-color-text-muted` | Kicker text, empty state, result count |
| `--st-color-text-default` | Hub card title |
| `--st-space-card-gap` | Grid column/row gap |
| `--st-width-detail-wide` | (referenced in entityDetailPage, same file) |
| `--st-font-family-mono` | Kicker label, toolbar |
| `--st-label-font`, `--st-label-size`, `--st-label-weight`, `--st-label-tracking`, `--st-label-color` | Hub card type labels, graph hint |
| `--st-space-6` | Graph pane gap and rail sticky offset |
| `--st-space-5` | Graph card rail hint padding |
| `--st-space-3` | Hub card gap |
| `--st-transition-fast` | (inherited via shared utilities) |

### Filter / sort pattern

| Concern | Implementation |
|---------|----------------|
| Filter state | `useFilterState()` — URL query params (`?category=X&tag=Y&page=2`) |
| Filter model | `buildFilterModel(archiveDoc, rawItems)` from `lib/filterModel.js` |
| Filter application | `applyFilters(allItems, activeFilters)` from `lib/applyFilters.js` — client-side AND/OR |
| Pagination | `paginateItems(filteredItems, currentPage, PAGE_SIZE=12)` |
| Layout toggle | `sessionStorage` keyed to `archive-layout-{slug}` — persists grid/list choice |
| Graph toggle | `?view=graph` URL param; available on node archives and Library |
| Sort | Server-side (`order(publishedAt desc)`) — no client-side sort UI |

### Filter data source

```javascript
// facetsRawQuery fetches taxonomy projections for filterModel construction
// TAXONOMY_PROJECTION included in every ARCHIVE_QUERIES entry:
"authors": authors[]->{_id, name, "slug": slug.current},
"categories": categories[]->{_id, name, "slug": slug.current, colorHex},
"tags": tags[]->{_id, name, "slug": slug.current},
"projects": projects[]->{_id, name, "slug": slug.current, colorHex},
"tools": tools[]->{_id, name, "slug": slug.current}
```

### Empty states

| Condition | Output |
|-----------|--------|
| Loading | `<p className={styles.archiveEmpty}>Loading…</p>` |
| No archivePage doc | Renders `<NotFoundPage />` |
| No content, no filters | "Nothing published yet. Check back soon." |
| No results (filters active) | "No results for the selected filters." + inline "Clear filters" button |

### ContentCard options (driven by Sanity archivePage doc)

`archiveDoc.cardOptions` controls ContentCard rendering per archive:

| Field | Controls |
|-------|---------|
| `showExcerpt` | Whether excerpt renders in card (default: `true`) |
| `showHeroImage` | Whether hero image renders (default: `true`) |
| `imageOverride` | Override image for all cards |
| `categoryPosition` | Category chip position within card |

---

## 2. TaxonomyArchivePage

**File:** `apps/web/src/pages/TaxonomyArchivePage.jsx`
**CSS:** `apps/web/src/pages/TaxonomyArchivePage.module.css` + `apps/web/src/pages/pages.module.css`

### Routes

| Route | pathSegment | layout | Storybook story |
|-------|-------------|--------|----------------|
| `/people` | `people` | `rows` | `Pages/TaxonomyArchivePage` ✓ |
| `/categories` | `categories` | `rows` | `Pages/TaxonomyArchivePage` ✓ |
| `/tags` | `tags` | `flat-grid` | `Pages/TaxonomyArchivePage` ✓ |
| `/projects` | `projects` | `rows` | `Pages/TaxonomyArchivePage` ✓ |
| `/tools` | `tools` | `rows` | `Pages/TaxonomyArchivePage` ✓ |

### DS components

| Component | Import | Props used |
|-----------|--------|------------|
| `PageHeader` | `../design-system` | `breadcrumb`, `title`, `count`, `description`, `italic` |
| `Breadcrumb` | `../design-system` | `items={[{ label: 'Library', href: '/library' }]}` (not rendered on /people) |
| `AlphaFilter` | `../components/AlphaFilter` | `activeLetters`, `filterLetter`, `onSelect` — tags only |

### Page config (ARCHIVE_CONFIG)

Centralised per-type config object keyed by URL path segment:

```javascript
ARCHIVE_CONFIG = {
  people:     { layout: 'rows',      hasImage: true,  getColor: null  }
  categories: { layout: 'rows',      hasImage: false, getColor: doc.colorHex }
  tags:       { layout: 'flat-grid', hasImage: false, getColor: null  }
  projects:   { layout: 'rows',      hasImage: false, getColor: doc.colorHex }
  tools:      { layout: 'rows',      hasImage: false, getColor: null  }
}
```

### CSS classes (TaxonomyArchivePage.module.css)

**Page wrapper:**

| Class | Role |
|-------|------|
| `.archivePage` | Root — `max-width: var(--st-width-detail)` |
| `.archivePageWide` | Wide modifier (tags, future glossary) — `max-width: var(--st-width-detail-wide)` |

**Row list layout (rows — people, categories, projects, tools):**

| Class | Role |
|-------|------|
| `.itemList` | `<ul>` — flex column, `border-top: 1px solid var(--st-color-border-subtle)` |
| `.item` | `<li>` — `border-bottom: 1px solid var(--st-color-border-subtle)` |
| `.itemLink` | Flex row with gap, `padding: 0.875rem 0.25rem`, hover bg |
| `.itemColorDot` | 10px dot for categories/projects — `background: colorHex` inline |
| `.itemAvatar` | 36×36px circular image (people only) |
| `.itemAvatarFallback` | 36×36px circle with initial letter (people fallback) |
| `.itemText` | Flex column — label + sublabel |
| `.itemLabel` | `var(--st-font-family-ui)`, `var(--st-font-size-md)`, 500 weight |
| `.itemSublabel` | 0.8125rem, muted, 1-line clamp |
| `.itemCount` | Mono, 0.6875rem, right-aligned via `margin-left: auto` |

**Flat-grid layout (tags):**

| Class | Role |
|-------|------|
| `.indexGroup` | AlphaFilter container — `margin-bottom: 2.25rem` |
| `.indexGrid` | 3-col grid (`grid-template-columns: repeat(3, 1fr); column-gap: 40px`) |
| `.indexGridSingle` | Single-column variant when letter filter active |
| `.indexList` | `<ul>` per column — `list-style: none` |
| `.listItem` | Row — flex, `border-bottom`, indent-on-hover |
| `.listItemInner` | Label + sublabel stacked |
| `.listItemLabel` | Mono, 0.8125rem, 500 weight |
| `.listItemSub` | UI font, 0.75rem, muted |
| `.listItemCount` | Mono, 0.6875rem, tabular nums |
| `.indexCellActive` | AlphaFilter button — active state |
| `.indexCellSelected` | AlphaFilter button — selected/filtered state (brand-primary fill) |
| `.indexCellInactive` | AlphaFilter button — no items under letter |

### Tokens (TaxonomyArchivePage.module.css)

| Token | Context |
|-------|---------|
| `--st-width-detail` | Page max-width (rows layout) |
| `--st-width-detail-wide` | Page max-width (flat-grid / wide) |
| `--st-color-border-subtle` | Row dividers |
| `--st-color-bg-subtle` | Row hover background; avatar fallback bg |
| `--st-color-brand-primary` | (via `--st-color-pink`) selected filter cell bg |
| `--st-color-pink` | AlphaFilter active/selected cell |
| `--st-color-maroon` | AlphaFilter selected hover; listItem hover color |
| `--st-color-white` | AlphaFilter selected cell text |
| `--st-color-border-default` | Avatar borders |
| `--st-color-border-medium` | AlphaFilter inactive border fallback |
| `--st-color-text-primary` | Item label text; archive title |
| `--st-color-text-secondary` | Lede text |
| `--st-color-text-muted` | Sublabel, count, archive count |
| `--st-font-family-narrative` | Archive title |
| `--st-font-family-ui` | Item label, sublabel |
| `--st-font-family-mono` | Item count, listItemLabel |
| `--st-font-size-md` | Item label size |
| `--st-radius-full` | Avatar border-radius (circular) |

### Filter / sort pattern

| Concern | Implementation |
|---------|----------------|
| Letter filter | Local `useState(null)` — `filterLetter` state |
| Column balance | `useMemo` splits flat list into 3 equal columns (flat-grid only) |
| Sort | Alphabetical — `localeCompare` in `useMemo` |
| Grid collapse | Single-column when `filterLetter` is active |

### Empty states

| Condition | Output |
|-----------|--------|
| Loading | `<div className={pageStyles.loadingPage}>Loading…</div>` |
| Unknown pathSegment | Renders `<NotFoundPage />` |
| No items | `<p className={pageStyles.archiveEmpty}>No {config.title.toLowerCase()} found.</p>` |

---

## 3. GlossaryArchivePage

**File:** `apps/web/src/pages/GlossaryArchivePage.jsx`
**CSS:** `apps/web/src/pages/GlossaryPage.module.css`
**Route:** `/glossary`

Added in SUG-35. Follows the Taxonomy pattern (A-Z browse + category filter) but uses `<dl>/<dt>/<dd>` definition list semantics instead of card grid or row list.

### DS components

| Component | Import | Props used |
|-----------|--------|------------|
| `PageHeader` | `../design-system` | `breadcrumb`, `title`, `count`, `description`, `italic` |
| `Breadcrumb` | `../design-system` | `items={[{ label: 'Library', href: '/library' }]}` |
| *(no FilterBar)* | — | Category filter via local chip UI (`.filterChip`) |

### CSS classes (GlossaryPage.module.css — archive section)

| Class | Role |
|-------|------|
| `.archivePage` | Root wrapper — `width: 100%` |
| `.filterRow` | Category filter chip row — flex-wrap |
| `.filterChip` | Button chip — mono, 0.7rem, uppercase, border |
| `.filterChipActive` | Active chip modifier — brand-primary color/border |
| `.azNav` | A-Z jump nav — flex-wrap, `border-bottom` rule |
| `.azNavActive` | Active letter — hover border |
| `.azNavEmpty` | Letters with no terms — muted, `pointer-events: none` |
| `.letterGroup` | Per-letter section — `margin-bottom: 2.5rem` |
| `.letterAnchor` | Letter heading — narrative font, 2.25rem, brand-primary |
| `.termList` | `<dl>` — flex column |
| `.termDt` | `<dt>` — flex row with gap, term link + abbr badge |
| `.termLink` | Term name link — narrative, 1.2rem, 500 |
| `.termDd` | Definition preview — 0.9rem, muted, `border-bottom` |
| `.termAbbr` | Abbreviation badge — mono, 0.6rem, brand-primary |
| `.empty` | Empty state — muted, 0.9rem |

### Filter / sort pattern

| Concern | Implementation |
|---------|----------------|
| Category filter | Local `useState(null)` — `activeCategory` |
| A-Z jump nav | `useMemo` — derive active letters from filtered set |
| Letter grouping | `useMemo` — `byLetter` map from filtered terms |
| Sort | Alphabetical — `localeCompare` by `term.term` |

### Empty states

| Condition | Output |
|-----------|--------|
| Loading | `<p className={styles.empty}>Loading…</p>` |
| No terms (no filter active) | "No glossary terms published yet." |
| No terms (filter active) | "No terms in this category." |

---

## 4. Legacy stubs (deprecated)

These three files are retained as 404 fallbacks if the Sanity `archivePage` doc is unpublished. The primary routes are served by `ArchivePage.jsx`.

| File | Route | Status |
|------|-------|--------|
| `ArticlesArchivePage.jsx` | `/articles` | Deprecated — `ArchivePage` is the live handler |
| `CaseStudiesArchivePage.jsx` | `/case-studies` | Deprecated — `ArchivePage` is the live handler |
| `KnowledgeGraphArchivePage.jsx` | `/knowledge-graph` | Deprecated — `ArchivePage` is the live handler |

All three share the same structure:
- DS: `PageHeader` + `Breadcrumb`
- CSS: `pages.module.css` (`.archivePage`, `.archiveGrid`, `.archiveEmpty`)
- No filtering; no ContentCard; raw `<Link>` cards with inline text
- `.archiveCard`, `.archiveCardTitle`, `.archiveCardExcerpt`, `.archiveCardMeta` referenced in JSX but **these classes no longer exist** in `pages.module.css` (removed — "Archive card styles removed — now handled by ContentCard + DS Card component")

**Do not use these as a pattern reference for new archive pages.** Use ArchivePage as the canonical template.

---

## 5. Shared masthead pattern

**All** archive and taxonomy pages share one of two masthead implementations:

### PageHeader (Patterns/PageHeader) — used on TaxonomyArchivePage + GlossaryArchivePage

```jsx
<PageHeader
  breadcrumb={<Breadcrumb items={[{ label: 'Library', href: '/library' }]} />}
  title="Tags"
  count={list.length}
  description="Optional lede text."
  italic  // see H1 rule below
/>
```

Storybook reference: `Patterns/PageHeader` (isolated component, all prop variants). Full-page integration: `Pages/TaxonomyArchivePage`.

### Raw masthead (pages.module.css) — used on ArchivePage

```jsx
<header className={styles.masthead}>
  <Breadcrumb items={[...]} />
  <h1 className={`${styles.archiveHeading} ${styles.archiveHeadingItalic}`}>{heading}</h1>
  <p className={styles.archiveDescription}>{subheading}</p>
</header>
```

ArchivePage does not use `PageHeader` — the masthead is assembled directly from `pages.module.css` classes.

---

## 6. H1 italic / roman rule

Full rule documented in `Foundations/Typography Conventions` (`--default`) Storybook story.

| Surface | H1 style | PageHeader prop | CSS class |
|---------|----------|-----------------|-----------|
| Archive mastheads (Library, Articles, Nodes, Case Studies) | Italic | `italic={true}` | `.archiveHeadingItalic` on raw `<h1>` |
| Glossary archive | Italic | `italic={true}` | — |
| Person folio | Italic | `italic={true}` | `.narrativeHeadingItalic` |
| Tag / category folio | Roman | `italic={false}` (default) | — |
| Project / tool folio | Roman | `italic={false}` (default) | — |
| Hero (articles, nodes, editorial, homepage) | Roman | n/a — Hero component | `Hero .heading` |

**Decision rule:** italic = the page is a named, curated space with a voice (archives, person). Roman = catalogue entry or editorial proclamation.
