# Sugartown Component Registry

> Last updated: 2026-06-05 · v0.26.6
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
(Grid, SectionLabel, DataTable) exist only in the web adapter layer and are
documented in the section below.

**Thruline audit (SUG-98, 2026-05-07):** All adapter pairs verified. No adapter
contains undocumented visual behaviour. Documented deltas: Card adds `<Link to>`,
`children` escape hatch, and `colorHex` chip override; Media mirrors DS primitive
exactly (duotone logic is identical); all others are thin `<Link to>` shims.

| Component | DS Primitive | Web Adapter | Storybook | Dark mode | Studio schema object | Notes |
|-----------|-------------|-------------|-----------|-----------|----------------------|-------|
| Avatar | ✅ `packages/ds/Avatar/` | ✅ `web/design-system/avatar/` | ✅ Components/Avatar | ✅ (token-inherited) | — | Image or initials fallback. sm/md/lg/xl sizes (16–88px). Circular via `--st-radius-full`. SUG-148. |
| Box | ✅ `packages/ds/Box/` | ✅ `web/design-system/box/` | ✅ Components/Layout/Box | ✅ (token-inherited) | — | Token-driven layout base. Polymorphic `as` prop. No layout logic — padding/margin/background/radius/border via `--st-*` inline vars. SUG-148. |
| Container | ✅ `packages/ds/Container/` | ✅ `web/design-system/container/` | ✅ Components/Layout/Container | ✅ (token-inherited) | — | Max-width scaffold. `size` prop: reading (760px) / detail (1080px) / archive (960px) / bleed. Maps to `--st-width-*` tokens only. SUG-149. |
| Stack | ✅ `packages/ds/Stack/` | ✅ `web/design-system/stack/` | ✅ Components/Layout/Stack | ✅ (token-inherited) | — | One-axis flex spacing. `gap` = space-token key; `direction` accepts responsive object. Absorbs Flex — no standalone Flex primitive. SUG-149. |
| Columns | ✅ `packages/ds/Columns/` | ✅ `web/design-system/columns/` | ✅ Components/Layout/Columns | ✅ (token-inherited) | — | N-column grid (2/3/4). `collapse` breakpoint (sm/md/lg). Replaces TwoColumnLayout. SUG-149. |
| Surface | ✅ `packages/ds/Surface/` | ✅ `web/design-system/surface/` | ✅ Components/Layout/Surface | ✅ | — | Elevation container (0–3) mapping to shadow tokens. Composes Box. SUG-149. |
| Page | ✅ `packages/ds/Page/` | ✅ `web/design-system/page/` | ✅ Components/Layout/Page | ✅ (token-inherited) | — | Top-level scaffold: header/main/footer slots. Composes Container for content region — does NOT carry maxWidth prop. SUG-149. |
| AppShell | ✅ `packages/ds/AppShell/` | ✅ `web/design-system/app-shell/` | ✅ Components/Layout/AppShell | ✅ (token-inherited) | — | Full UI shell: header/sidebar/main/footer slots. Sidebar collapses to full-width below 768px. SUG-149. |
| DescriptionList | ✅ `packages/ds/DescriptionList/` | ✅ `web/design-system/description-list/` | ✅ Components/DescriptionList | ✅ (token-inherited) | — | `<dl>` key/value grid. 1-col (stacked, border dividers) and 2-col (CSS grid) layouts. SUG-148. |
| ErrorMessage | ✅ `packages/ds/ErrorMessage/` | ✅ `web/design-system/error-message/` | ✅ Components/Form/ErrorMessage | ✅ (token-inherited) | — | Inline validation feedback. `role="alert"` + `aria-live="polite"`. Wired via `aria-describedby` in Field. SUG-148. |
| Field | ✅ `packages/ds/Field/` | ✅ `web/design-system/field/` | ✅ Components/Form/Field | ✅ (token-inherited) | — | Composes Label + control slot + HelperText + ErrorMessage. Owns all a11y wiring: `htmlFor`, `aria-describedby`, `aria-invalid`. SUG-148. |
| HelperText | ✅ `packages/ds/HelperText/` | ✅ `web/design-system/helper-text/` | ✅ Components/Form/HelperText | ✅ (token-inherited) | — | Guidance caption below a form control. Linked via `aria-describedby`. SUG-148. |
| Input | ✅ `packages/ds/Input/` | ✅ `web/design-system/input/` | ✅ Components/Form/Input | ✅ | — | Single-line text control. 7 types. `hasError` state. No multiline — Textarea is the sibling. SUG-148. |
| Label | ✅ `packages/ds/Label/` | ✅ `web/design-system/label/` | ✅ Components/Form/Label | ✅ (token-inherited) | — | `<label htmlFor>` form caption. Mono uppercase style. `required` prop adds pink ` *` indicator. NOT SectionLabel. SUG-148. |
| Meter | ✅ `packages/ds/Meter/` | ✅ `web/design-system/meter/` | ✅ Components/Meter | ✅ | — | `role="meter"` value-in-range bar. Distinct from Progress (`role="progressbar"`). SUG-148. |
| Metric | ✅ `packages/ds/Metric/` | ✅ `web/design-system/metric/` | ✅ Components/Metric | ✅ | — | Value + label + optional trend indicator (up/down/neutral). SUG-148. |
| Skeleton | ✅ `packages/ds/Skeleton/` | ✅ `web/design-system/skeleton/` | ✅ Components/Skeleton | ✅ (token-inherited) | — | Shimmer loading placeholder. text/block/circle variants. Width/height accept raw CSS values. SUG-148. |
| Textarea | ✅ `packages/ds/Textarea/` | ✅ `web/design-system/textarea/` | ✅ Components/Form/Textarea | ✅ | — | Multiline control. Sibling to Input — never folded in. `hasError` state. SUG-148. |
| Accordion | ✅ `packages/ds/Accordion/` | ✅ `web/design-system/accordion/` | ✅ Components/Accordion | ✅ | ✅ `accordionSection` | |
| Breadcrumb | ✅ `packages/ds/Breadcrumb/` | ✅ `web/design-system/Breadcrumb/` | ✅ Components/Breadcrumb | ✅ (token-inherited) | — | Web adapter uses `<Link to>`. 1–3 level `items[]` API. Replaces ad-hoc backLink/eyebrowCurrent pattern across 8 Library pages (SUG-139). |
| ButtonGroup | ✅ `packages/ds/ButtonGroup/` | ✅ `web/design-system/button-group/` | ✅ Components/ButtonGroup | ✅ (token-inherited) | — | Layout-only primitive. `align` + `wrap` props. Replaces ad-hoc `.ctaButtons`/`.heroActions` flex wrappers (SUG-126). |
| Blockquote | ✅ `packages/ds/Blockquote/` | ✅ `web/design-system/blockquote/` | ✅ Components/Blockquote | ✅ | — | |
| Button | ✅ `packages/ds/Button/` | ✅ `web/design-system/button/` | ✅ Components/Button | ✅ | ✅ `ctaButton` (object) + `ctaButtonDoc` (document) | Paired schema — changes to one must mirror the other |
| Callout | ✅ `packages/ds/Callout/` | ✅ `web/design-system/callout/` | ✅ Components/Callout | ✅ | ✅ `calloutSection` | |
| Card | ✅ `packages/ds/Card/` | ✅ `web/design-system/card/` | ✅ Components/Card | ✅ | — | Adapter adds `<Link to>`, `children` escape hatch, `colorHex` chip override. Variants: default/elevated/listing/metadata/accent. `accent` = 3px brand-primary left rule + tinted header bg. SUG-149. |
| Chip | ✅ `packages/ds/Chip/` | ✅ `web/design-system/chip/` | ✅ Components/Chip | ✅ | — | Web adapter adds `<Link to>` only — no separate story needed |
| Citation | ✅ `packages/ds/Citation/` | ✅ `web/design-system/citation/` | ✅ Components/Citation | ✅ | ✅ `citationRef` PT mark | |
| CodeBlock | ✅ `packages/ds/CodeBlock/` | ✅ `web/design-system/codeblock/` | ✅ Components/CodeBlock | ✅ | ✅ `code` inline PT decorator | |
| FilterBar | ✅ `packages/ds/FilterBar/` | — | ✅ Components/FilterBar | ✅ | — | Web-only FilterBar.jsx is a pending-migration copy; DS version is canonical. No web adapter layer needed — app composite imports DS package directly once migrated. |
| Media | ✅ `packages/ds/Media/` | ✅ `web/design-system/media/` | ✅ Components/Media | ✅ | ✅ `heroSection.media[]` | |
| ScoreRing | ✅ `packages/ds/ScoreRing/` | ✅ `web/design-system/score-ring/` | ✅ Components/ScoreRing | ✅ | — | SUG-100 |
| SegmentedControl | ✅ `packages/ds/SegmentedControl/` | ✅ `web/design-system/segmented-control/` | ✅ Components/SegmentedControl | ✅ | — | SUG-100 |
| Table | ✅ `packages/ds/Table/` | ✅ `web/design-system/table/` | ✅ Components/Table | ✅ accent + subdued, light + dark | ✅ `tableBlock` | SUG-119 shipped — tone prop (accent/subdued), caption surface, props-driven API. DataTable is deprecated shim; RoadmapTable composes Table. |
| Swatch | ✅ `packages/ds/Swatch/` | ✅ `web/design-system/swatch/` | ✅ Components/Swatch | ⚠️ untested | — | Square color dot + mono label. Generic `color`/`label`/`size` API. `null` color = outlined square. Callers own priority→color mapping. Renamed from PriorityChip (SUG-119). Dark mode story pending. |
| ~~StatGrid~~ | Deleted (SUG-120) | Deleted (SUG-120) | — | — | ~~`statTileSection`~~ → `cardSection` | DS primitive + web adapter both deleted. Superseded by Grid. Schema renamed to `cardSection` in SUG-151; PageSections renderer uses Grid directly. |

---

## Web-adapter-only components

These components exist only in `apps/web/src/design-system/components/`. No DS package
primitive exists or is planned — each is either a layout utility or a component tightly
coupled to React Router / web data patterns that has no portable use case outside the web app.

| Component | Web Adapter | Storybook | Dark mode | Notes |
|-----------|-------------|-----------|-----------|-------|
| Grid | ✅ `web/design-system/grid/` | ✅ Components/Layout/Grid | ✅ | CSS grid layout utility. Layout concern, not a DS primitive. SUG-120: `accentColor` (brand/ink) + `tabletColumns` responsive breakpoint added; composition stories added. |
| SectionLabel | ✅ `web/design-system/section-label/` | ✅ Components/SectionLabel | ✅ | Typography-only label row. Minimal; no value in porting. |
| ~~Tile~~ | ~~`web/design-system/tile/`~~ @deprecated | ~~Components/Tile~~ | ⚠️ deprecated | @deprecated — use Card + Metric/Meter. `console.warn` on import. SUG-151 retained: 8 active call-sites use `href`/`bar`/`loading`/`titleSize` not covered by StatCard. Full migration to Card+Metric is a follow-on epic. |
| ~~TwoColumnLayout~~ | Deleted (SUG-151) | — | — | Deleted. Zero active call-sites. Superseded by `Columns count={2}`. |
| ~~Flex~~ | — | — | — | Was synonym for Stack with `direction="horizontal"`. Use Stack `direction` prop directly. |
| ~~DataTable~~ | ✅ `web/design-system/data-table/` — @deprecated | ✅ Components/Table/DataTable | ⚠️ untested | Deprecated shim over `<Table>`. Maps `variant="trust"` → `tone="subdued"`. Inline CSS injection removed (SUG-119). Delete after all callers migrate to `<Table>` directly. |
| ~~LaneHeader~~ | Retired (SUG-119) | — | — | Deleted from both mirrors. Lane label and epic count now live in `<Table caption captionMeta>`. |
| ~~RoadmapTable~~ | Deleted | — | — | Deleted after GovernancePage and TablesDevPage migrated to `<Table tone="subdued">` directly. |
| ~~SectionContainer~~ | Deleted (SUG-120) | — | — | Deleted in SUG-120. All callers migrated to Grid. |

---

## App-level composites (no DS primitive)

These components own layout and data-binding logic. They consume DS primitives and web adapters internally.

| Component | File | Storybook | Sanity data source | Notes |
|-----------|------|-----------|-------------------|-------|
| ContentCard | `web/components/ContentCard.jsx` | ✅ Patterns/ContentCard | article, caseStudy, node archive queries | Thin data adapter over web Card. Binding-only — no container CSS. |
| ContentNav | `web/components/ContentNav.jsx` | ✅ Patterns/ContentNav | Adjacent-item Sanity query | App composite — fetches prev/next items. Story uses plain-`<a>` inline demo. |
| MetadataCard | `web/components/MetadataCard.jsx` | ✅ Patterns/MetadataCard | All detail page queries | Canonical metadata surface — never re-implement inline. Composes Card frame via `<aside className={styles.metadataCard}>`. |
| StatCard | `web/components/StatCard.jsx` | ✅ Patterns/StatCard | `statTileSection` in `sections[]` | Replaces Tile in stat grids. Card + metric/value/sub/body layout. SUG-150. |
| Form | `web/components/Form.jsx` | ✅ Patterns/Form | — | Generic form pattern. Renders `Field[]` from schema. Netlify `action` or `onSubmit` callback. SUG-150. |
| ~~ContactForm~~ | Deleted (SUG-151) | — | — | Deleted. Use `Form` component with `contactFormFields` schema. |
| CardBuilderSection | `web/components/CardBuilderSection.jsx` | ✅ Patterns/CardBuilderSection | `cardBuilderSection` in `sections[]` | |
| RecentContentSection | `web/components/RecentContentSection.jsx` | ✅ Patterns/RecentContentSection | Sanity fetch via `useSanityDoc` | Mock infrastructure in `.storybook/stories/` |
| ContentBlock | `web/components/ContentBlock.jsx` | ✅ Patterns/ContentBlock | PortableText `content` field | |
| ArchiveLayout | `web/components/ArchiveLayout.stories.jsx` | ✅ Patterns/ArchiveLayout | — | Spec/documentation stories for all archive layout variants. SUG-150. |
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
| `cardSection` (was `statTileSection`) | `PageSections.jsx` inline | ✅ via Patterns/PageSections |
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
