# Sugartown Component Registry

> Last updated: 2026-05-17 · v0.23.32
>
> Single source of truth for component coverage across the three app surfaces:
> DS package primitives, web adapter layer, and app-level composites.
> Studio schema objects are mapped to their rendering components.
>
> Gap analysis completed in SUG-98. See `docs/shipped/` for the closed epic.

---

## Coverage key

| Symbol | Meaning |
|--------|---------|
| ✅ | Exists and covered |
| ⚠️ | Exists but gap identified (see Notes) |
| — | Not applicable at this layer |

---

## Storybook story rule

Web adapter stories are only created when the adapter adds **visually distinct behaviour** vs the DS primitive (e.g. ContentCard adds data-driven field layout; MetadataCard adds the field grid). A web adapter that only swaps `<a href>` for `<Link to>` does **not** get its own story — the DS primitive story provides all needed VRT coverage.

---

## DS Primitives → Web Adapters

All 14 DS primitive components have a corresponding web adapter. Four components
(Grid, SectionLabel, Tile, DataTable) exist only in the web adapter layer and are
documented in the section below.

**Thruline audit (SUG-98, 2026-05-07):** All adapter pairs verified. No adapter
contains undocumented visual behaviour. Documented deltas: Card adds `<Link to>`,
`children` escape hatch, and `colorHex` chip override; Media mirrors DS primitive
exactly (duotone logic is identical); all others are thin `<Link to>` shims.

| Component | DS Primitive | Web Adapter | Storybook | Dark mode | Studio schema object | Notes |
|-----------|-------------|-------------|-----------|-----------|----------------------|-------|
| Accordion | ✅ `packages/ds/Accordion/` | ✅ `web/design-system/accordion/` | ✅ Components/Accordion | ✅ | ✅ `accordionSection` | |
| Blockquote | ✅ `packages/ds/Blockquote/` | ✅ `web/design-system/blockquote/` | ✅ Components/Blockquote | ✅ | — | |
| Button | ✅ `packages/ds/Button/` | ✅ `web/design-system/button/` | ✅ Components/Button | ✅ | ✅ `ctaButton` (object) + `ctaButtonDoc` (document) | Paired schema — changes to one must mirror the other |
| Callout | ✅ `packages/ds/Callout/` | ✅ `web/design-system/callout/` | ✅ Components/Callout | ✅ | ✅ `calloutSection` | |
| Card | ✅ `packages/ds/Card/` | ✅ `web/design-system/card/` | ✅ Components/Card | ✅ | — | Adapter adds `<Link to>`, `children` escape hatch, `colorHex` chip override — documented in Card.jsx header. No separate story needed (ContentCard/MetadataCard cover the visual deltas). |
| Chip | ✅ `packages/ds/Chip/` | ✅ `web/design-system/chip/` | ✅ Components/Chip | ✅ | — | Web adapter adds `<Link to>` only — no separate story needed |
| Citation | ✅ `packages/ds/Citation/` | ✅ `web/design-system/citation/` | ✅ Components/Citation | ✅ | ✅ `citationRef` PT mark | |
| CodeBlock | ✅ `packages/ds/CodeBlock/` | ✅ `web/design-system/codeblock/` | ✅ Components/CodeBlock | ✅ | ✅ `code` inline PT decorator | |
| FilterBar | ✅ `packages/ds/FilterBar/` | — | ✅ Components/FilterBar | ✅ | — | Web-only FilterBar.jsx is a pending-migration copy; DS version is canonical. No web adapter layer needed — app composite imports DS package directly once migrated. |
| Media | ✅ `packages/ds/Media/` | ✅ `web/design-system/media/` | ✅ Components/Media | ✅ | ✅ `heroSection.media[]` | |
| ScoreRing | ✅ `packages/ds/ScoreRing/` | ✅ `web/design-system/score-ring/` | ✅ Components/ScoreRing | ✅ | — | SUG-100 |
| SegmentedControl | ✅ `packages/ds/SegmentedControl/` | ✅ `web/design-system/segmented-control/` | ✅ Components/SegmentedControl | ✅ | — | SUG-100 |
| Table | ✅ `packages/ds/Table/` | ✅ `web/design-system/table/` | ✅ Components/Table | ✅ accent + subdued, light + dark | ✅ `tableBlock` | SUG-119 shipped — tone prop (accent/subdued), caption surface, props-driven API. DataTable is deprecated shim; RoadmapTable composes Table. |
| Swatch | ✅ `packages/ds/Swatch/` | ✅ `web/design-system/swatch/` | ✅ Components/Swatch | ⚠️ untested | — | Square color dot + mono label. Generic `color`/`label`/`size` API. `null` color = outlined square. Callers own priority→color mapping. Renamed from PriorityChip (SUG-119). Dark mode story pending. |
| ~~StatGrid~~ | Deleted (SUG-120) | Deleted (SUG-120) | — | — | ✅ `statTileSection` | DS primitive + web adapter both deleted. Superseded by Grid. `statTileSection` schema and PageSections renderer remain; renderer now uses Grid directly. |

---

## Web-adapter-only components

These components exist only in `apps/web/src/design-system/components/`. No DS package
primitive exists or is planned — each is either a layout utility or a component tightly
coupled to React Router / web data patterns that has no portable use case outside the web app.

| Component | Web Adapter | Storybook | Dark mode | Notes |
|-----------|-------------|-----------|-----------|-------|
| Grid | ✅ `web/design-system/grid/` | ✅ Components/Grid | ✅ | CSS grid layout utility. Layout concern, not a DS primitive. SUG-120: `accentColor` (brand/ink) + `tabletColumns` responsive breakpoint added; composition stories added. |
| SectionLabel | ✅ `web/design-system/section-label/` | ✅ Components/SectionLabel | ✅ | Typography-only label row. Minimal; no value in porting. |
| Tile | ✅ `web/design-system/tile/` | ✅ Components/Tile | ✅ | Metric/content surface. Complex data props tied to web patterns. |
| ~~DataTable~~ | ✅ `web/design-system/data-table/` — @deprecated | ✅ Components/Table/DataTable | ⚠️ untested | Deprecated shim over `<Table>`. Maps `variant="trust"` → `tone="subdued"`. Inline CSS injection removed (SUG-119). Delete after all callers migrate to `<Table>` directly. |
| ~~LaneHeader~~ | Retired (SUG-119) | — | — | Deleted from both mirrors. Lane label and epic count now live in `<Table caption captionMeta>`. |
| ~~RoadmapTable~~ | Deleted | — | — | Deleted after GovernancePage and TablesDevPage migrated to `<Table tone="subdued">` directly. |
| ~~SectionContainer~~ | Deleted (SUG-120) | — | — | Deleted in SUG-120. All callers migrated to Grid. |

---

## App-level composites (no DS primitive)

These components own layout and data-binding logic. They consume DS primitives and web adapters internally.

| Component | File | Storybook | Sanity data source | Notes |
|-----------|------|-----------|-------------------|-------|
| ContentCard | `web/components/ContentCard.jsx` | ✅ Patterns/ContentCard | article, caseStudy, node archive queries | Thin data adapter over web Card |
| ContentNav | `web/components/ContentNav.jsx` | ✅ Patterns/ContentNav | Adjacent-item Sanity query | App composite — fetches prev/next items. Story uses plain-`<a>` inline demo. |
| MetadataCard | `web/components/MetadataCard.jsx` | ✅ Patterns/MetadataCard | All detail page queries | Canonical metadata surface — never re-implement inline |
| CardBuilderSection | `web/components/CardBuilderSection.jsx` | ✅ Patterns/CardBuilderSection | `cardBuilderSection` in `sections[]` | |
| RecentContentSection | `web/components/RecentContentSection.jsx` | ✅ Patterns/RecentContentSection | Sanity fetch via `useSanityDoc` | Mock infrastructure in `.storybook/stories/` |
| ContentBlock | `web/components/ContentBlock.jsx` | ✅ Patterns/ContentBlock | PortableText `content` field | |
| ContactForm | `web/components/ContactForm.jsx` | ✅ Patterns/ContactForm | — | Netlify Forms POST |
| ImageLightbox | `web/components/ImageLightbox.jsx` | ✅ Patterns/ImageLightbox | image galleries | |
| PageSidebar | `web/components/PageSidebar.jsx` | ✅ Patterns/PageSidebar | TOC / related / series / AI disclosure | |
| Pagination | `web/components/Pagination.jsx` | ✅ Patterns/Pagination | archive page query results | |
| ThemeToggle | `web/components/ThemeToggle.jsx` | ✅ Patterns/ThemeToggle | — | |

---

## Inline renderers (PageSections.jsx)

These section types are rendered inside `PageSections.jsx` via a `switch (_type)` block.
Each now has a standalone Storybook story added in SUG-98.

| Schema type | Renderer location | Standalone story |
|-------------|------------------|------------------|
| `heroSection` | `Hero.jsx` | ✅ Layout/Hero |
| `textSection` | `PageSections.jsx` inline | ✅ Patterns/TextSection |
| `mermaidSection` | `PageSections.jsx` inline | ✅ Patterns/MermaidSection |
| `imageGallery` | `PageSections.jsx` inline | ✅ Patterns/ImageGallery |
| `citedBlock` | `PageSections.jsx` inline | ✅ Patterns/CitedBlock |
| `statTileSection` | `PageSections.jsx` inline | — story deleted (SUG-120) |
| `accordionSection` | `PageSections.jsx` → `Accordion` | ✅ via Components/Accordion |
| `calloutSection` | `PageSections.jsx` → `Callout` | ✅ via Components/Callout |
| `cardBuilderSection` | `CardBuilderSection.jsx` | ✅ Patterns/CardBuilderSection |
| `tableBlock` | `PageSections.jsx` → `Table` | ✅ via Components/Table |

---

## Layout components

| Component | File | Storybook | Sanity data source |
|-----------|------|-----------|-------------------|
| Header | `web/components/Header.jsx` | ✅ Layout/Header | `navigation` document |
| Footer | `web/components/Footer.jsx` | ✅ Layout/Footer | `siteSettings` document |
| Hero | `web/components/Hero.jsx` | ✅ Layout/Hero | `heroSection` in `sections[]` |
| MobileNav | `web/components/MobileNav.jsx` | ✅ Layout/MobileNav | `navigation` document |
| PageSections | `web/components/PageSections.jsx` | ✅ Layout/PageSections | All `sections[]` types |
| Preheader | `web/components/Preheader.jsx` | ✅ Layout/Preheader | category / tag / status metadata |

---

## Token files

Both token files must stay in sync. Changes to one require the same change to the other in the same commit.

| File | Role |
|------|------|
| `apps/web/src/design-system/styles/tokens.css` | Canonical — web runtime |
| `packages/design-system/src/styles/tokens.css` | Mirror — DS package |

Validate with: `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` from `apps/web/`
