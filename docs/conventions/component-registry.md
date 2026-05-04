# Sugartown Component Registry

> Last updated: 2026-05-04 · v0.23.10
>
> Single source of truth for component coverage across the three app surfaces:
> DS package primitives, web adapter layer, and app-level composites.
> Studio schema objects are mapped to their rendering components.
>
> Gap analysis tracked in SUG-98. See `docs/backlog/SUG-98-component-gap-analysis.md`.

---

## Coverage key

| Symbol | Meaning |
|--------|---------|
| ✅ | Exists and covered |
| ⚠️ | Exists but gap identified (see Notes) |
| — | Not applicable at this layer |
| ❌ | Missing — tracked in SUG-97 |

---

## Storybook story rule

Web adapter stories are only created when the adapter adds **visually distinct behaviour** vs the DS primitive (e.g. ContentCard adds data-driven field layout; MetadataCard adds the field grid). A web adapter that only swaps `<a href>` for `<Link to>` does **not** get its own story — the DS primitive story provides all needed VRT coverage.

---

## DS Primitives → Web Adapters

| Component | DS Primitive | Web Adapter | Storybook | Studio schema object | Notes |
|-----------|-------------|-------------|-----------|----------------------|-------|
| Accordion | ✅ `packages/ds/Accordion/` | ✅ `web/design-system/accordion/` | ✅ Primitives/Accordion | `accordionSection` | |
| Blockquote | ✅ `packages/ds/Blockquote/` | ✅ `web/design-system/blockquote/` | ✅ Primitives/Blockquote | — | |
| Button | ✅ `packages/ds/Button/` | ✅ `web/design-system/button/` | ✅ Primitives/Button | `ctaButton` (object) + `ctaButtonDoc` (document) | Paired schema — changes to one must mirror the other |
| Callout | ✅ `packages/ds/Callout/` | ✅ `web/design-system/callout/` | ✅ Primitives/Callout | `calloutSection` | |
| Card | ✅ `packages/ds/Card/` | ✅ `web/design-system/card/` | ✅ Primitives/Card | — | Web adapter adds `<Link to>` only — no separate story needed |
| CardGrid | ✅ `packages/ds/CardGrid/` | ✅ `web/design-system/card-grid/` | ✅ Primitives/CardGrid | `cardBuilderSection` | |
| Chip | ✅ `packages/ds/Chip/` | ✅ `web/design-system/chip/` | ✅ Primitives/Chip | — | Web adapter adds `<Link to>` only — no separate story needed |
| Citation | ✅ `packages/ds/Citation/` | ✅ `web/design-system/citation/` | ✅ Primitives/Citation | `citationRef` PT mark | |
| CodeBlock | ✅ `packages/ds/CodeBlock/` | ✅ `web/design-system/codeblock/` | ✅ Primitives/CodeBlock | `code` inline PT decorator | |
| ContentNav | ✅ `packages/ds/ContentNav/` | ✅ `web/design-system/content-nav/` | ✅ Primitives/ContentNav | — | |
| FilterBar | ✅ `packages/ds/FilterBar/` | ✅ `web/design-system/filter-bar/` | ✅ Primitives/FilterBar | — | |
| Grid | ✅ `packages/ds/Grid/` | — | ✅ Primitives/Grid | — | No web-specific adapter needed |
| Media | ✅ `packages/ds/Media/` | ✅ `web/design-system/media/` | ✅ Primitives/Media | `heroSection.media[]` | |
| SectionLabel | ✅ `packages/ds/SectionLabel/` | ✅ `web/design-system/section-label/` | ✅ Primitives/SectionLabel | — | |
| Table | ✅ `packages/ds/Table/` | ✅ `web/design-system/table/` | ✅ Primitives/Table | `tableBlock` | |
| Tile | ✅ `packages/ds/Tile/` | — | ✅ Primitives/Tile | `statTileSection` | No web adapter yet — PageSections consumes DS Tile directly |

---

## App-level composites (no DS primitive)

These components own layout and data-binding logic. They consume DS primitives and web adapters internally.

| Component | File | Storybook | Sanity data source | Notes |
|-----------|------|-----------|-------------------|-------|
| ContentCard | `web/components/ContentCard.jsx` | ✅ Patterns/ContentCard | article, caseStudy, node archive queries | Thin data adapter over web Card |
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

## Studio schema objects without a dedicated renderer story

These schema types are rendered by `PageSections.jsx` (via a `switch` on `_type`) but have no standalone Storybook story. VRT coverage comes only from `Layout/PageSections` composite stories.

| Schema type | Renderer location | Standalone story | Tracked in SUG-98 |
|-------------|------------------|------------------|-------------------|
| `heroSection` | `Hero.jsx` | ✅ Layout/Hero | — |
| `textSection` | `PageSections.jsx` inline | ❌ | ✅ |
| `mermaidSection` | `PageSections.jsx` inline | ❌ | ✅ |
| `imageGallery` | `PageSections.jsx` inline | ❌ | ✅ |
| `citedBlock` | `PageSections.jsx` inline | ❌ | ✅ |
| `statTileSection` | `PageSections.jsx` inline | ❌ | ✅ |
| `accordionSection` | `PageSections.jsx` → `Accordion` | ✅ via Primitives/Accordion | — |
| `calloutSection` | `PageSections.jsx` → `Callout` | ✅ via Primitives/Callout | — |
| `cardBuilderSection` | `CardBuilderSection.jsx` | ✅ Patterns/CardBuilderSection | — |
| `tableBlock` | `PageSections.jsx` → `Table` | ✅ via Primitives/Table | — |

---

## Token files

Both token files must stay in sync. Changes to one require the same change to the other in the same commit.

| File | Role |
|------|------|
| `apps/web/src/design-system/styles/tokens.css` | Canonical — web runtime |
| `packages/design-system/src/styles/tokens.css` | Mirror — DS package |

Validate with: `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` from `apps/web/`.
