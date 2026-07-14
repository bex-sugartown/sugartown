# Detail Page Recipe — Component-First

**Origin:** SUG-35 post-mortem (2026-06-10). GlossaryTermPage shipped with ~9 one-off
`term*` CSS patterns despite every one having an existing component or shared class.
The refactor deleted ~150 lines and took one session. This doc exists so the next
detail page starts from the shared vocabulary instead of rediscovering it.

**The rule:** a new detail/entity page is *assembled from existing components and
shared classes*. New CSS is the exception and requires written justification (see
CLAUDE.md §CSS class pre-implementation reuse audit). Reference implementation:
[ToolDetailPage.jsx](../../apps/web/src/pages/ToolDetailPage.jsx).

---

## The recipe

A detail page, top to bottom, maps to this vocabulary. If you are about to write
a new class for any row in this table, stop — the row already names the answer.

| Visual element | Use this | Source |
|---|---|---|
| Page shell / max-width | `pageStyles.entityDetailPage` (entity pages) or `pageStyles.detailPage` (prose content) | `pages.module.css` |
| Back/up navigation | `<Breadcrumb items={[...]} />` | DS (`design-system`) |
| Identity block (eyebrow + name + description) | `pageStyles.folioIdentity` | `pages.module.css` |
| Eyebrow / status line | `pageStyles.detailEyebrow` | `pages.module.css` |
| H1 | `pageStyles.narrativeHeading` (+ `narrativeHeadingItalic` per H1 italic convention) | `pages.module.css` |
| Logo / avatar / thumbnail | `pageStyles.entityFolio` + `entityThumbnail` (+ `entityThumbnailFallback`) | `pages.module.css` |
| Description under H1 | `pageStyles.entityDescription` | `pages.module.css` |
| Body / PortableText content | `pageStyles.detailContent` + shared PT components (`lib/portableTextComponents.jsx`) | `pages.module.css` |
| Section heading with kicker/count | `<SectionLabel title="..." kicker="..." />` | DS |
| Grid of related content | `<Grid columns={2} spacing="lg">` | DS |
| Content document card | `<ContentCard item={doc} docType={doc._type} />` | app components |
| Taxonomy / related-term chips | `<Chip variant="tag" href={getCanonicalPath(...)} />` | DS |
| Status chip | `<Chip variant="status" status={...} />` (NOT `tone=` — not a prop) | DS |
| Metadata table | `<MetadataCard />` — canonical, never re-implement | app components |
| Empty state | `pageStyles.archiveEmpty` | `pages.module.css` |
| Page-band header (archive/taxonomy) | `<PageHeader />` | DS pattern |

All hrefs via `getCanonicalPath({ docType, slug })` — never literal paths.

## What earns new CSS

Genuinely page-specific presentation with no structural equivalent — e.g. glossary
`termPronunciation` (IPA line), `sourcesList`. Each new class requires:

1. The CLAUDE.md proposal table (proposed name → closest existing pattern → decision),
   approved before the first `Edit` to the CSS module.
2. A semantic name. Content-type prefixes (`term*`, `node*`, `article*`...) are
   blocked by `pnpm validate:css-names`; deliberate exceptions go in
   `KNOWN_EXCEPTIONS` with a one-line justification.

## Close-out check

Before Visual QA, open one existing sibling page of the same kind (e.g. a new entity
page vs `/tools/vercel`) and compare structure: shell, folio, headings, section labels,
grids, chips. Structural divergence without justification is drift.

## Two detail-page families (SUG-207)

`ToolDetailPage` (above) is the reference for the **`entityDetailPage`** family —
logo/avatar folio pages: `ToolDetailPage`, `GlossaryTermPage`, `SeriesPage`,
`TaxonomyDetailPage`. There is a second, distinct family this recipe was never
scoped to: the **`.detailPage` prose-content** family — `CaseStudyPage`,
`ArticlePage`, `NodePage`, `RootPage` — which share `PageSidebar`, `MetadataCard`,
`extractLeadHero` (`lib/heroUtils.js`), and the `--sidebar-row` grid.

**Close-out rule:** compare a new page against a sibling *from its own family*.
A content-page-family epic (case study, article, node) compares against
`ArticlePage` or `NodePage` — **not** `ToolDetailPage`. Comparing across families
tests the wrong structure.

### Justified content-family divergences

- **Lead-stat-card peeling** (`CaseStudyPage`): the leading run of `cardSection`
  blocks is promoted full-span above the two-column split. Case-study-only — kept
  page-local, not folded into `PageSections` (SUG-207 Option B). It is page
  *composition* (which blocks go full-span), not section *rendering*.
- **Challenge-block hoist** (`CaseStudyPage`): the `calloutSection` is hoisted out
  of the linear section flow to render as the full-span Challenge block.
  Case-study-only; kept page-local for the same reason.
- **`--sidebar-row`** is *not* page-specific — `CaseStudyPage` and `RootPage` both
  need it. Shared via `getSidebarRowStart(precedingFullSpanRows)` in `lib/`. Do not
  re-inline a per-page formula; extend the shared util if a third page needs it.
