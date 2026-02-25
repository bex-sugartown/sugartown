# Changelog

All notable changes to the Sugartown monorepo are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

> **Version note:** Entries from `[0.0.0]` onwards use SemVer and track the monorepo.
> Entries marked `[Pre-monorepo]` are historical records reconstructed from preserved
> git history in `sugartown-frontend`, `sugartown-sanity`, `repos/sugartown-pink`, and
> `repos/sugartown-cms`. Live site remains WordPress throughout all pre-monorepo eras.

---

## [0.13.0] — 2026-02-25
Design system component library, adapter layer, htmlSection rendering, and filter model hardening. Branch: `feat/v7c-legacy-components`

### packages/design-system

#### Added
- Card component (`src/components/Card/`): 4 variants (default, compact, listing, dark), polymorphic `as` prop for SPA routing, slots for eyebrow (`ReactNode`), title, subtitle, children, footer; hover lifts -4px with brand pink glow shadow
- Chip component (`src/components/Chip/`): renders as `<span>`, `<a>`, or `<button>` based on props; `color-mix()` color system via single `--chip-color` custom property; `colorHex` override; `isActive` state with solid fill; sm/md sizes; 4px squircle border-radius
- FilterBar component (`src/components/FilterBar/`): sidebar facet UI rendered as `<aside>`; accepts `FilterModel` array of facets with options; native checkboxes with `accent-color` brand tinting; color swatches for taxonomy options; `onFilterChange`/`onClearAll` callbacks; renders `null` when filter model is empty
- Table component (`src/components/Table/`): 3 variants (default, responsive, wide); zebra striping; pink accent header; responsive card collapse at ≤860px; exports `Table` and `TableWrap`
- Blockquote component (`src/components/Blockquote/`): 3px pink left border (`--st-color-brand-primary`), italic text, muted grey; optional `citation` prop renders as `<footer><cite>`
- Callout component (`src/components/Callout/`): 5 variants (default/info/tip/warn/danger) with Lucide React icons; optional `title` prop; variant-specific background colors from tokens
- CodeBlock component (`src/components/CodeBlock/`): Prism.js syntax highlighting with 12 language grammars (JS, TS, CSS, HTML, JSON, Bash, Python, JSX, TSX, Markdown, YAML, SQL); custom Sugartown Prism theme (pink keywords, seafoam strings, lime comments); `filename` prop; meta bar with language label; also exports `InlineCode` sibling component for inline `<code>` in prose
- Media component (`src/components/Media/`): responsive `<figure>` with duotone overlay (3 presets: standard, featured, subtle; plus custom mode) and color overlay mode (arbitrary CSS color + opacity); hover zoom; optional `<figcaption>` caption
- `COMPONENT_CONTRACTS.md`: authoritative visual spec for Chip, FilterBar, Card — anatomy diagrams, sizing tables, color system details, state tables, Figma guidance, do/don't rules, production migration status, web adapter sync workflow
- `VISUAL_AUDIT.md`: component visual audit tracking document
- Foundation documentation stories: `Colors.stories.tsx` (brand palette, neutral palette, status colors, all swatches grid) and `Typefaces.stories.tsx` (font families, type scale, weights, line heights) under `Foundations/` Storybook path

#### Changed
- Button visual contract overhauled (`Button.tsx`, `Button.module.css`): primary uses correct brand pink (`#ff247d`) with hover lift (-2px) and `--st-shadow-pink-glow`; secondary changed from grey ghost to lime accent (`#D1FF1D`) with hover lift and `--st-shadow-lime-glow`; new tertiary variant (transparent background, brand-pink border and text, hover fills with 8% pink); Pink Moon theme adaptation added (frosted-glass substrate, `backdrop-filter: blur(14px)`, pill `border-radius`, inner glow rings per variant)
- Brand pink corrected from `#FF69B4` (hot pink) to `#ff247d` (canonical Sugartown brand pink) across all token references
- Token system (`tokens.css`) restructured from flat variables to explicit 3-tier architecture: Tier 1 raw primitives (full color scales including void-900 through white neutral ramp, 8-point rem spacing, 3 font family stacks, 7-step type scale, shadow primitives with brand-colored glows), Tier 2 semantic aliases (role-named: `--st-color-brand-primary`, `--st-color-text-primary`, `--st-color-bg-surface`, etc.), Tier 3 component tokens (Card, Button, Table, Blockquote, Callout, Code, Media groups); legacy flat aliases retained for back-compat

### apps/web

#### Added
- DS adapter layer: JSX mirrors of all 8 DS components in `src/design-system/components/` (card, blockquote, callout, codeblock, table, media adapters created; button adapter updated) — bridges DS primitives to the web app via `src/design-system/index.js` barrel export
- ContentCard data adapter (`src/components/ContentCard.jsx`): replaces inline card functions previously duplicated in ArchivePage and TaxonomyDetailPage; standardizes docType derivation via `DOC_TYPE_MAP`, SPA routing via `as={Link}` with `getCanonicalPath()`, eyebrow composition with status badges (`STATUS_DISPLAY` map), dot-separated meta line (aiTool for nodes, client + role for case studies, publishedAt for all), taxonomy chips in footer, HTML entity decoding for excerpts; always uses `variant="listing"` for archive density
- HtmlSection component in PageSections: renders raw HTML via `dangerouslySetInnerHTML` with class `st-html-section` for scoped CSS targeting
- Legacy HTML styles (`PageSections.module.css`): 200+ lines scoped to `:global(.st-html-section)` for WordPress-migrated content — container (max-width 800px centered), typography resets (p, h2-h4, ul/ol, hr, a with brand pink), table styles matching DS Table (pink accent thead, zebra striping, thumbnail cells, column width utilities, responsive card layout at 860px breakpoint), blockquote matching DS Blockquote, code block matching DS CodeBlock, inline code matching DS InlineCode
- 3 new filter model enum facets: `client` (order 5), `tools` (order 6), `status` (order 7) — with enum-specific handling in `buildFilterModel()` and `applyFilters()`
- `htmlUtils.js`: HTML entity decoder utility for excerpt rendering
- Pink Moon theme CSS file (`src/design-system/styles/theme.pink-moon.css`)
- SEO field migration script (`scripts/migrate-seo-fields.js`): migrates legacy `seo.metaTitle`/`seo.metaDescription` → canonical `seo.title`/`seo.description`; sets `autoGenerate` based on whether content had real Yoast overrides
- Array key migration script (`scripts/migrate-add-array-keys.js`): adds missing `_key` to `tags[]` on WP-imported documents
- Content validator script (`scripts/validate-content.js`)

#### Changed
- PageSections (`src/components/PageSections.jsx`) wired to DS components: Sanity blockquote blocks route through `<Blockquote>`; inline code marks route through `<InlineCode>`; `@sanity/code-input` blocks route through `<CodeBlock>` with Prism highlighting; hero/CTA buttons use DS `<Button>` with `variant="primary"`/`"secondary"` instead of raw `<button>` elements
- Button adapter (`src/design-system/components/button/`) updated to match new DS visual contract (lime secondary, tertiary variant, Pink Moon theme)
- Media adapter (`src/design-system/components/media/`) updated with duotone and color overlay support
- seoMetadata field descriptions updated for editorial clarity in Studio UX

#### Fixed
- FilterBar rendered `option.title` (undefined) instead of `option.label` — filter option labels were blank
- FilterBar enum facets used `option.slug` (undefined for enums) as URL param value — filter checkboxes produced empty URL params; now falls back to `option.id`
- `ARCHIVE_QUERIES` were not projecting `client`, `status`, `tools` fields — `buildFilterModel()` received no data for these facets, producing empty enum options

### apps/studio

#### Added
- `htmlSection` schema (`schemas/sections/htmlSection.ts`): section type for raw HTML content with `label` and `htmlContent` fields; HTML-stripping preview via `prepare()`
- `mediaOverlay` schema (`schemas/objects/mediaOverlay.ts`): per-image overlay configuration with `overlayType` (none/duotone/color), duotone presets (standard/featured/subtle), custom duotone colors, color overlay (CSS color + opacity 0–100)
- `sections[]` field added to `node` schema (`schemas/documents/node.ts`): array of heroSection, textSection, imageGallery, ctaSection, htmlSection — bringing node into section builder parity with page and caseStudy
- `sections[]` field added to `article` schema (`schemas/documents/article.ts`): same 5 section types — completing section builder parity across all 4 content types (page, caseStudy, node, article)
- `htmlSection` and `mediaOverlay` registered in schema index (`schemas/index.ts`)

#### Changed
- `richImage` schema (`schemas/objects/richImage.ts`) updated to embed `mediaOverlay` object for per-image overlay configuration
- Node `aiTool` option "Mixed" renamed to "Agentic Caucus"
- `@sanity/code-input` updated 7.0.7 → 7.0.8

### apps/storybook

#### Added
- Google Fonts loading via `<link>` tags in `preview-head.html` (Playfair Display: 400/700 normal + 400 italic; Fira Sans: 400/500/600/700) — resolves unreliable CSS `@import url()` in Storybook's Vite config
- Stories for all 8 new DS components (Card, Chip, FilterBar, Table, Blockquote, Callout, CodeBlock, Media) and updated Button stories

### Sanity production data

- 62 documents: SEO fields migrated from legacy `seo.metaTitle`/`seo.metaDescription` to canonical `seo.title`/`seo.description` with `autoGenerate` set based on Yoast override detection
- 50 WP-imported documents: missing `_key` property added to `tags[]` arrays, restoring Studio editability (tags were read-only without `_key`)

### Other

- Stylelint config (`.stylelintrc.json`): enforces `--st-*` custom property namespace, forbids `!important`, limits nesting depth to 3, whitelists CSS Modules pseudo-classes and `color-mix()`
- Token validator script (`scripts/validate-tokens.js`): detects drift between `apps/web/src/design-system/styles/tokens.css` and `packages/design-system/src/styles/tokens.css`; reports missing or mismatched tokens; exits non-zero on errors
- Epic template (`docs/epic-template.md`): structural template with lessons from htmlSection post-mortem
- Post-mortem prompt template (`docs/post-mortem-prompt.md`)
- Migration scripts added: `scripts/migrate/backfill-html-section.js` (appends legacy HTML as sections), `scripts/migrate/featured-to-hero.js` (migrates featuredImage to heroSection)
- `.claude/launch.json` added for dev server configurations (web on 5173, studio on 3333)

---

## [0.12.0] — 2026-02-22
SEO auto-extraction and resolver system. Branch: `main` (direct)

### apps/web

#### Added
- `src/lib/seo.js` — `extractPlainText(body, maxLength)` added as a named export: pure-JS Portable Text walker; extracts text from `children[].text` of `_type: 'block'` blocks only; skips `style: 'code'` blocks and embedded non-block objects; strips HTML tags; collapses whitespace; sentence-safe truncation (backs up to last space before maxLength cut; hard-truncates only when no space exists in the segment); returns `''` for null/undefined/empty body without throwing

#### Changed
- `src/lib/seo.js` — `resolveSeo()` fully rewritten:
  - **Signature change:** `resolveSeo({ docSeo, docTitle, docType, docSlug, siteDefaults })` → `resolveSeo(doc, siteSettings)` — full document object passed; resolver reads `doc.seo`, `doc.title`, `doc.excerpt`, `doc.body`, `doc._type`, `doc.slug` directly
  - **Auto mode** (`doc.seo.autoGenerate !== false`, or field absent — treated as `true`): title = `"${doc.title} | Sugartown Digital"`
  - **Manual mode** (`doc.seo.autoGenerate === false`): title = `doc.seo.title` (exact, as entered)
  - **Fallback** (both modes): empty title → `siteSettings.defaultMetaTitle ?? 'Sugartown Digital'`
  - **Description chain** (auto mode): `doc.seo.description` (explicit override, respected in both modes) → `doc.excerpt` → `extractPlainText(doc.body, 160)` → `siteSettings.defaultMetaDescription` → `''`
  - **Description chain** (manual mode): `doc.seo.description` → `siteSettings.defaultMetaDescription` → `''`
  - All descriptions passed through `normaliseDescription()`: HTML stripped, sentence-safe 160-char trim
  - Canonical URL derivation updated to read `doc._type` and `doc.slug` (string or object) from doc directly
  - `SEO_FRAGMENT` updated to include `autoGenerate` field in the `seo {}` GROQ projection
  - Backward-compatible: documents without `autoGenerate` set behave identically to `autoGenerate: true`
- `src/lib/queries.js`:
  - `nodeBySlugQuery` — added `_type`, `"body": content[]` (alias for Portable Text body; enables `extractPlainText` fallback in auto description mode)
  - `articleBySlugQuery` — added `_type`, `"body": content[]`
  - `caseStudyBySlugQuery` — added `_type` (no body alias; caseStudy body is `sections[]`, not a Portable Text field; `excerpt` covers auto-description fallback)
  - `pageBySlugQuery` — added `_type`
  - `archivePageBySlugQuery` — added `_type`
- `src/pages/ArticlePage.jsx`, `NodePage.jsx`, `CaseStudyPage.jsx`, `RootPage.jsx`, `HomePage.jsx`, `ArchivePage.jsx` — all six `resolveSeo()` call sites migrated to new `resolveSeo(doc ?? null, siteSettings)` signature
- `src/components/SeoHead.jsx` — JSDoc usage example updated to new signature (no runtime logic change)

### apps/studio

#### Added
- `schemas/objects/seoMetadata.ts` — `autoGenerate` boolean field added as the first field in the `seoMetadata` object: `type: 'boolean'`, `initialValue: true`; description instructs editors that disabling switches title/description to exact manual override mode; all existing fields (`title`, `description`, `canonicalUrl`, `noIndex`, `noFollow`, `openGraph`) left unchanged and in original order

### Validator state at release

```
pnpm validate:urls    ✅  All checks passed — URL authority is clean.
pnpm validate:filters ✅  All filter models produced successfully. No WP-era keys.
pnpm --filter web build  ✅  341 modules transformed. Built in ~1s. Zero errors.
```

---

## [0.11.0] — 2026-02-22
Taxonomy architecture refactor, controlled vocabulary, routing hardening, and URL namespace protection. Branch: `main` (direct — multiple micro-epics)

### apps/web

#### Added
- `scripts/validate-taxonomy.js` — taxonomy integrity validator; 4 checks: (A) WARN on >2 categories per doc, (B) WARN on 0 categories, (C) FAIL on non-canonical `tools[]` values, (D) FAIL on dangling `tags[]` refs pointing to non-existent tag documents; exits 1 on FAIL, 0 on clean
- `"validate:taxonomy"` pnpm script registered in `apps/web/package.json`

#### Changed
- `src/lib/queries.js` — fixed `allTagsQuery` bug: `slug` was returning raw Sanity slug object `{current: "..."}` instead of aliased string; changed to `"slug": slug.current`; added `description` to `allTagsQuery` projection
- `src/lib/queries.js` — added `status` and `tools` to `facetsRawQuery`, `allArticlesQuery`, `allCaseStudiesQuery`; added `tools` to `allNodesQuery`

#### Fixed
- `scripts/validate-urls.js` — added `RESERVED_PAGE_SLUGS` constant and check block (C) "Reserved Namespace Collision Check"; detects when a `page` document slug would collide with an archive route namespace (`articles`, `case-studies`, `knowledge-graph`, `nodes`, `tags`, `categories`, `projects`, `people`); collision count wired into error tally (hard fail, exits non-zero); summary sections re-labelled C→D, D→E

### apps/studio

#### Added
- `schemas/documents/tag.ts` — added `description` field (text, max 300 chars) to tag documents; enables editors to document vocabulary intent and usage guidelines
- `schemas/documents/article.ts` — added `status` field (string enum: draft/published/archived, initialValue: published, radio layout) and `tools[]` field (array of strings, 30-item controlled enum matching schema across all content types)
- `schemas/documents/caseStudy.ts` — same `status` and `tools[]` additions as article
- `schemas/documents/node.ts` — added `tools[]` field (same 30-item enum; note on relationship to existing `aiTool` field)

#### Changed
- `schemas/documents/tag.ts` — expanded doc comment to document controlled vocabulary rules; `name` max length raised from 30 → 50 characters
- `schemas/documents/article.ts` — `categories[]` validation changed from `max(3)` → `max(2)` with updated warning text; `tags[]` gained `Rule.unique()` and controlled vocabulary comment
- `schemas/documents/caseStudy.ts` — same `categories[]` and `tags[]` changes as article
- `schemas/documents/node.ts` — `categories[]` validation changed from `max(3)` → `max(2)`; `tags[]` gained `Rule.unique()`

### scripts

#### Added
- `scripts/migrate-taxonomy.js` — full taxonomy migration script; `TAG_MAP` object (~200 entries mapping 256 WP-era tag IDs to `tool | keep | remap | archive` actions); `CANONICAL_TOOLS` Set (30 values, matches schema enums); dry-run by default (`--execute` for live writes); 5-second abort window in execute mode; per-document change log with action types (TOOL/KEEP/REMAP/ARCHIVE/UNMAPPED); summary counters; exits non-zero on unmapped tags in execute mode
- Root `"migrate:taxonomy"` and `"validate:taxonomy"` scripts registered in root `package.json`

### App.jsx (routing hardening)

#### Added
- `NodeSlugRedirect` component — thin wrapper using `useParams()` to interpolate `:slug` into redirect target; required because `<Navigate>` cannot reference URL params directly
- `/knowledge-graph/:slug` route — canonical node detail route was entirely missing; added with `<NodePage />`

#### Fixed
- `/nodes/:slug` was routing directly to `<NodePage />` instead of redirecting to `/knowledge-graph/:slug`; fixed by replacing with `<NodeSlugRedirect />`

### Sanity production data

- 53 content documents patched via `migrate-taxonomy.js --execute`:
  - 77 tool-type tags extracted into `tools[]` arrays (e.g. `"contentful" → tools["contentful"]`)
  - 26 near-duplicate tags remapped to canonical IDs (e.g. `"design systems" → wp.tag.234 "design system"`)
  - 62 garbage/status/client-name tags archived (removed from content)
  - 191 conceptual/thematic tags retained in controlled vocabulary
  - 9 previously unmapped tags (omnichannel, PRD, alt text, content-as-code, content audit) resolved as controlled-vocabulary keeps

### Filter Model Architecture (Archive Filter System epic)

#### apps/web

##### Changed
- `src/lib/filterModel.js` — major update:
  - Added JSDoc output contract (`FilterModel`, `FilterModelFacet`, `FilterModelOption` typedefs) at top of file
  - Added `FACET_TYPE` map distinguishing `'reference'` (author, project, category, tag) from `'enum'` (tools, status)
  - Added `tools` and `status` as enum-type facet dimensions to `DEFAULT_FACET_LABELS`, `extractFacetItems()`, `normalizeTaxonomyItem()`
  - Enum facets synthesize `{_id, name}` objects from raw string values; normalized to `{id, label}` shape (no `slug`)
  - `normalizeTaxonomyItem()` now attaches `parent` to category options (for hierarchy support)
  - `buildFilterModel()` now accepts optional `options` param: `{ groupByParent?: boolean }` (default `false`)
    - When `groupByParent: true`: category facet gains `grouped: true`; each category option carries a `parent` property if the category has one; flat behavior is fully preserved when `false`
  - Facets with 0 options are **omitted** from output (previously emitted as empty arrays)
  - Each facet in output now carries a `type` field (`'reference' | 'enum'`)
  - `fetchFilterModel()` updated to pass `options` through to `buildFilterModel()`
  - Added field naming disambiguation comment: `filterConfig` (Stage 4, read by this file) vs `frontendFilters` (legacy Studio UI booleans, NOT read here)
- `src/lib/queries.js` — `CATEGORY_FRAGMENT` extended with `"parent": parent->{ _id, name, "slug": slug.current }` to support optional groupByParent hierarchy in FilterModel
- `scripts/validate-filters.js` — hardened for v0.11.0 taxonomy:
  - Added `VITE_SANITY_TOKEN` for reading `wp.*` dot-namespace docs
  - WP-era key guard: `detectWpKeysInString()` checks GROQ query strings at startup; `detectWpKeys()` recursively checks FilterModel output per archive; **hard fail (exit 1)** if any `wp_category`, `wp_tag`, `gem_status`, or `gem_related_project` key detected
  - Updated inline `CATEGORY_FRAGMENT` to include `parent->` (parity with queries.js)
  - Updated inline `facetsRawQuery` to project `status` and `tools` (parity with queries.js)
  - Updated inline `extractFacetItems()`, `normalizeTaxonomyItem()`, `buildFilterModel()` to match new filterModel.js (tools/status enum facets, parent on categories, empty facet omission, `type` field)
  - Added tools/status coverage warnings (⚠️) when a facet is configured but returns 0 options
  - Added ℹ️ report of facets configured but empty (omitted from model) per archive
  - Updated facet display to show `[ref]` / `[enum]` type labels and parent annotation

#### apps/studio

##### Changed
- `schemas/documents/archivePage.ts`:
  - Added canonical field naming disambiguation comment (filterConfig vs frontendFilters vs enableFrontendFilters)
  - Added `tools` (`Tool / Platform`) and `status` (`Status`) to `filterConfig.facets[].facet` options enum — editors can now configure these as facets for any archive
  - Updated `preview.prepare` facetLabels map to include `tools` and `status`

### Validator state at release

```
pnpm validate:urls
──────────────────
✅  /knowledge-graph  →  [node]  "Knowledge Graph"
✅  /case-studies  →  [caseStudy]  "Case Studies"
✅  /articles  →  [article]  "Articles"
✅  No docs with missing slugs
✅  No duplicate canonical URLs detected
✅  No page slugs collide with reserved namespaces
✅  All checks passed — URL authority is clean.

pnpm validate:taxonomy
───────────────────────
✅  All tools[] values are in the canonical enum
✅  All tags[] refs point to existing tag documents
⚠️  1 WARNING: Beauty Retail case study has 3 categories (editorial fix)
    (exits 0 — warning only, not a schema error)

pnpm validate:filters
──────────────────────
✅  No WP-era keys in GROQ query strings
✅  FilterModel produced for /knowledge-graph  (4 facets: author, project, category, tag)
✅  FilterModel produced for /articles         (4 facets: author, project, category, tag)
✅  FilterModel produced for /case-studies     (4 facets: author, project, category, tag)
    (No filterConfig on archivePage docs yet — default 4-facet fallback active.
     tools/status facets will appear once configured in Studio filterConfig.facets[].)
✅  All filter models produced successfully.
```

---

## [0.10.0] — 2026-02-21
Taxonomy detail pages, redirect infrastructure, WP→Sanity migration pipeline, and frontend content fixes. Branches: `epic/taxonomy-detail`, `epic/redirect-infrastructure`, `epic/wp-migration` → `main`

### apps/web

#### Added
- `TaxonomyDetailPage` (`src/pages/TaxonomyDetailPage.jsx`, `TaxonomyDetailPage.module.css`) — single component handles all four taxonomy types (`tag`, `category`, `project`, `person`); taxonomy type derived from URL path segment; renders taxonomy header (name, description, optional `colorHex` accent bar) + paginated content listing of associated articles, case studies, and nodes; 404 for unknown slugs; empty state for valid taxonomy with no content
- `scripts/build-redirects.js` — build-time script that queries Sanity for all published `redirect` documents and writes `apps/web/public/_redirects` (Netlify/Cloudflare format); run as part of the pre-build step
- `apps/web/public/_redirects` — generated redirect file committed for CI reproducibility; contains WP legacy URL rules derived from migration parity report
- `VITE_SANITY_TOKEN` wired into `src/lib/sanity.js` — read-only viewer token required to query documents with `wp.*` dot-namespace IDs (system namespace, invisible to unauthenticated queries even on a public dataset)

#### Changed
- `TaxonomyPlaceholderPage.jsx` — replaced entire content with re-export shell: `export { default } from './TaxonomyDetailPage'`; no `App.jsx` route changes needed
- `TaxonomyChips.jsx` + `TaxonomyChips.module.css` — chips now link to canonical taxonomy URLs via `getCanonicalPath()`; previously chips were non-interactive display-only elements
- `App.jsx` — added legacy WP redirect: `/articles/%f0%9f%92%8e-luxury-dot-com-%f0%9f%92%8e` → `/articles/luxury-dot-com` (WP post 814 had a percent-encoded emoji slug)
- `CaseStudyPage.jsx` — added `featuredImage` rendering and `sections` rendering via `<PageSections>`; previously case study detail pages showed title/metadata only with no body content
- `ArticlePage.jsx` — minor cleanup pass

#### Fixed
- Case study detail pages (`/case-studies/:slug`) were blank below the metadata block — `featuredImage` and `sections` were never rendered; fixed by wiring both into `CaseStudyPage`

### apps/studio

#### Added
- `redirect` document schema (`schemas/documents/redirect.ts`) — fields: `from` (source path), `to` (destination URL or path), `statusCode` (301/302), `note` (editorial context); registered in `schemas/index.ts`
- `legacySource` object schema (`schemas/objects/legacySource.ts`) — migration metadata object embedded in `article`, `caseStudy`, `node`, `page`; fields: `platform` (`wordpress`), `wpId`, `wpType`, `wpSlug`, `importedAt`; populated by import script, read-only in Studio
- `slug` field added to `project` schema — projects now have a `slug.current` field alongside `projectId`; allows `getCanonicalPath({ docType: 'project', slug })` to work without special-casing

#### Changed
- `article`, `caseStudy`, `node`, `page` schemas — each gained a `legacySource` field (Migration group, read-only in Studio) to carry WP provenance data
- `project` schema — `slug` field added; `projectId` retained as legacy identifier
- `schemas/index.ts` — registered `redirect` and `legacySource`
- `sanity.config.ts` — desk structure updated: Knowledge Graph moved into Content section

### scripts/migrate (new workspace)

#### Added
New pipeline at `scripts/migrate/` — complete WordPress → Sanity migration system. Seven scripts, run in order:

| Script | Role |
|---|---|
| `export.js` | WP REST API → raw JSON export for all CPTs, pages, media, users, categories, tags |
| `transform.js` | Raw WP JSON → Sanity document shape; 7 type transformers (`transformArticle`, `transformPage`, `transformNode`, `transformCaseStudy`, `transformCategory`, `transformTag`, `transformPerson`); includes `sanitiseSlug()` (decode percent-encoding, strip non-ASCII, collapse dashes) |
| `import.js` | Batch-upsert transformed documents into Sanity via `createOrReplace()` transactions |
| `images.js` | Download WP media, upload to Sanity CDN, patch image refs in published docs |
| `redirects.js` | Generate `redirect` Sanity documents from WP permalink → Sanity slug mapping |
| `parity.js` | Post-import parity check: queries Sanity for each expected doc, reports missing/slug-mismatched items; writes `artifacts/parity_report.md` |
| `lib.js` | Shared utilities: WP REST client, Sanity mutation helpers, slug normalization, CPT field mappers |

`transform.js` includes `sanitiseSlug()` wired into all 7 transformers — decodes percent-encoded WP slugs (e.g. `%f0%9f%92%8e`) and strips non-ASCII characters to produce clean URL slugs.

#### Added (artifacts)
- `artifacts/migration_report.json` — machine-readable import summary (counts per type, error list)
- `artifacts/parity_report.md` — human-readable parity check output from post-import `parity.js` run
- `artifacts/image_manifest.json` — map of WP media ID → Sanity asset ID for all uploaded images
- `artifacts/image_failures.csv` — list of images that failed to upload with error reasons
- `artifacts/.gitkeep` — ensures `artifacts/` directory is committed

### docs

#### Added
- `docs/migration/wp-freeze-cutover.md` — WP freeze and DNS cutover runbook: pre-cutover checklist, content freeze procedure, DNS swap steps, rollback plan, post-cutover verification
- `docs/release-notes/RELEASE_NOTES_v0.9.0.md` — archived release notes for v0.9.0
- `docs/release-notes/README.md` — index of all archived release note files

### Sanity production data

- 327 documents imported from WordPress: articles (posts + custom nodes), case studies, pages, taxonomy (categories, tags, people, projects)
- All imported documents use `wp.*` dot-namespace IDs (e.g. `wp.article.1804`) — requires authenticated client to query; resolved by `VITE_SANITY_TOKEN` read-only viewer token in `apps/web`
- Article `wp.article.814` slug patched: `%f0%9f%92%8e-luxury-dot-com-%f0%9f%92%8e` → `luxury-dot-com`
- `archivePage` documents remain: `articles`, `case-studies`, `knowledge-graph`

### Validator state at release

```
pnpm validate:urls
──────────────────
✅  /knowledge-graph  →  [node]  "Knowledge Graph"
✅  /case-studies  →  [caseStudy]  "Case Studies"
✅  /articles  →  [article]  "Articles"
✅  No docs with missing slugs
✅  No duplicate canonical URLs detected
✅  All checks passed — URL authority is clean.

pnpm validate:filters
──────────────────────
✅  FilterModel produced for /knowledge-graph  (4 facets)
✅  FilterModel produced for /articles         (1 facet)
✅  FilterModel produced for /case-studies     (4 facets)
✅  All filter models produced successfully
```

---

## [0.9.0] — 2026-02-21
Repository stabilization and URL-driven archive filtering. Branch: `epic/repository-stabilization` → `main`

### apps/web

#### Added
- `FilterBar` component (`src/components/FilterBar.jsx`, `FilterBar.module.css`) — renders taxonomy facet groups as checkbox lists with option counts, color swatches for project/category facets, and a "Clear all" button; fully controlled via props, no internal data fetching
- `Pagination` component (`src/components/Pagination.jsx`, `Pagination.module.css`) — page navigation with prev/next buttons, page number buttons, ellipsis for large page counts; semantic `<button>` elements throughout; `aria-current="page"` on current page
- `useFilterState` hook (`src/lib/useFilterState.js`) — reads and writes filter selection and current page exclusively via URL query params (`useSearchParams`); exposes `activeFilters`, `currentPage`, `hasActiveFilters`, `setFilter`, `clearFacet`, `clearAll`, `setPage`; filter changes reset page to 1 automatically
- `applyFilters` function (`src/lib/applyFilters.js`) — pure client-side filter function; AND logic across facets, OR logic within a facet; returns all items when no filters are active; unknown/invalid slugs silently ignored
- `paginateItems` function (`src/lib/applyFilters.js`) — pure slice function; returns `pageItems`, `totalPages`, `totalItems` for a given page and page size (12)

#### Changed
- `ArchivePage`: wired FilterModel → `FilterBar` → `applyFilters` → `paginateItems` → `Pagination`; passes `archiveDoc` to `ArchiveListing` for filter config; fetches `facetsRawQuery` in addition to content listing query to build FilterModel
- `ArchivePage`: removed `[0...50]` GROQ slice cap from all three content type queries (`article`, `node`, `caseStudy`) — full item set now fetched for client-side filtering accuracy
- `pages.module.css`: added two-column archive layout (`.archiveLayout`: 220px sidebar + `1fr` content column, collapses to single column at ≤640px), `.archiveContent`, `.archiveResultCount`, `.clearFiltersLink`
- `eslint.config.js`: scoped browser globals to `src/**` only; added separate config block for `scripts/**` with Node.js globals; disabled `react-hooks/set-state-in-effect` rule (pre-existing intentional pattern in `useSanityDoc`)

#### Fixed
- ESLint reported `'process' is not defined` errors on `scripts/validate-urls.js` and `scripts/validate-filters.js` — root cause: ESLint config applied `globals.browser` to all `.js` files including Node scripts; fixed by scoping browser globals to `src/**` and adding a `scripts/**` config block with `globals.node`
- ESLint reported `react-hooks/set-state-in-effect` errors on `useSanityDoc.js` — `setLoading(true)` at the top of `useEffect` before async fetch is intentional; suppressed with rule disable and explanatory comment

### apps/studio

#### Changed
- `README.md`: replaced Sanity scaffold default content with current-state documentation covering dev URL, schema file locations, and Sanity project coordinates

#### Removed
- `schemas/INTEGRATION_GUIDE.md` — superseded by `docs/schemas/schema-reference.md` and `docs/queries/groq-reference.md`
- `schemas/QUICK_REFERENCE.md` — superseded by canonical docs
- `schemas/README.md` — superseded by canonical docs
- `schemas/SCHEMAS_COMPLETE.md` — superseded by canonical docs
- `schemas/legacy/SCHEMAS_COMPLETE.md` — superseded by canonical docs
- `schemas/sugartown_architecture_blueprint.md` — superseded by `docs/architecture/sanity-data-flow.md`
- `schemas/sugartown_sanity_mvp_prd.md` — superseded by canonical docs

### Other

#### Added
- `.github/workflows/ci.yml` — GitHub Actions pipeline runs on push and PR to `main`; sequential steps: install (`pnpm install --frozen-lockfile`) → lint → typecheck → validate:urls → validate:filters → build; any step failure halts pipeline; Sanity env vars injected from repository secrets
- `RELEASE_CHECKLIST.md` — 9-section pre-merge checklist covering branch hygiene, version bump, CHANGELOG, validation scripts, lint, build, smoke test, CI status, and post-merge deployment verification
- `docs/architecture/monorepo-overview.md` — workspace structure, tooling versions, enforced boundaries, Turbo pipeline, key commands
- `docs/architecture/sanity-data-flow.md` — system diagram, data flow steps, Sanity project coordinates, key source files, architectural constraints
- `docs/schemas/schema-reference.md` — canonical inventory of all schema types, taxonomy fields, registry location
- `docs/routing/url-namespace.md` — full canonical route map, legacy redirects, `TYPE_NAMESPACES`, deferred routes, archive-as-Sanity-doc pattern
- `docs/queries/groq-reference.md` — taxonomy fragments, all major query patterns, query conventions
- `docs/operations/ci.md` — pipeline order, fail conditions, script definitions, environment variables, Turbo pipeline explanation
- `validate:urls` and `validate:filters` scripts added to root `package.json` as `pnpm --filter web` wrappers

#### Changed
- Root `README.md`: replaced scaffold default with current-state index (workspaces table, key commands, architectural boundaries, docs directory index, Sanity project coordinates)
- `apps/web/README.md`: replaced Vite scaffold default with current-state documentation covering dev URL, key commands, key file locations, and links to `/docs`
- Root `package.json`: version `1.0.0` → `0.9.0`; added `validate:urls` and `validate:filters` scripts
- `apps/web/package.json`: version `0.0.0` → `0.9.0`

#### Removed
- `QUICK_START.md` — superseded by workspace READMEs and `docs/`
- `IMPLEMENTATION_SUMMARY.md` — superseded by `docs/`
- `apps/web/SCHEMAS_COMPLETE.md` — superseded by `docs/schemas/schema-reference.md`
- `apps/web/schemas/INTEGRATION_GUIDE.md` — superseded by canonical docs
- `apps/web/schemas/QUICK_REFERENCE.md` — superseded by canonical docs
- `apps/web/schemas/README.md` — superseded by canonical docs

---

## [0.8.0] — 2026-02-19

Stages 0–7: CMS parity, routing, taxonomy, and unified classification surface.
Branch: `integration/parity-check` → `main`

### apps/studio

#### Added
- `seoMetadata` object schema; embedded in `page`, `article`, `caseStudy`, `node`
- `colorHex` string field on `category` and `project` schemas
- `archivePage` document schema: `slug`, `contentTypes[]`, `title`, `description`, `hero`, `filterConfig`, `listStyle`, `sortBy`, `showPagination`, `enableFrontendFilters`, `featuredItems[]`, `seo`
- `person` document schema: `name`, `shortName`, `slug`, `titles[]`, `bio`, `image`, `links[]`; hidden legacy fields `role`, `email`, `website`
- `article` document schema (replaces `post`); registered in `schemas/index.ts`
- `authors[]`, `categories[]`, `tags[]`, `projects[]` reference fields on `article`, `caseStudy`, `node`, `page`

#### Changed
- `sanity.config.ts` desk structure: `'post'`/`'Blog Posts'` → `'article'`/`'Articles'`
- `archivePage` schema: `contentTypes` option and preview label updated `post`→`article`
- `person` preview: replaced computed `prepare()` with plain `select`; changed `image` → `image.asset` in select projection
- All doc type slug fields: removed async GROQ uniqueness validators
- All `authors[]` reference fields: removed `options: { filter: '!(_id in path("drafts.**"))' }`
- Upgraded `sanity` and `@sanity/vision` 5.9.0 → 5.10.0

#### Removed
- `@sanity/color-input` dependency; replaced with plain `colorHex` string field
- `post` removed from desk structure and schema registry (file kept as dead reference)

### apps/web

#### Added
- `src/lib/routes.js` — canonical URL registry: `TYPE_NAMESPACES`, `getCanonicalPath()`, `validateNavItem()`, archive/taxonomy path constants
- `src/lib/sanity.js` — Sanity client configured from Vite env vars
- `src/lib/useSanityDoc.js` — `useSanityDoc()` and `useSanityList()` React hooks
- `src/lib/seo.js` — `SEO_FRAGMENT`, `SITE_SEO_FRAGMENT`, `resolveSeo()` merge helper
- `src/lib/SiteSettingsContext.jsx` — React context for site-wide settings
- `src/lib/person.js` — `getPrimaryAuthor()`, `getAuthorDisplayName()`, `getAuthorByline()`, `getAuthorImageUrl()`, `getLinkByKind()`
- `src/lib/filterModel.js` — `buildFilterModel()`, `fetchFilterModel()`, `extractFacetItems()`, `normalizeTaxonomyItem()`
- `src/lib/queries.js` — centralized GROQ library: `PERSON_FRAGMENT`, `CATEGORY_FRAGMENT`, `TAG_FRAGMENT`, `PROJECT_FRAGMENT`, `TAXONOMY_FRAGMENT`; all content-type queries; taxonomy browse queries; `facetsRawQuery`; `archivePageWithFilterConfigQuery`
- `src/components/SeoHead.jsx` — renders `<title>`, `<meta description>`, OG tags
- `src/components/TaxonomyChips.jsx` + `TaxonomyChips.module.css` — generic chip renderer for projects → categories → tags; `--chip-color` CSS custom property for `colorHex` fields
- Page components: `HomePage`, `RootPage`, `ArticlePage`, `CaseStudyPage`, `NodePage`, `ArchivePage`, `ArticlesArchivePage`, `CaseStudiesArchivePage`, `KnowledgeGraphArchivePage`, `TaxonomyPlaceholderPage`, `NotFoundPage`
- `scripts/validate-urls.js` (`pnpm validate:urls`) — duplicate URL detection, missing slug report, nav item validation
- `scripts/validate-filters.js` (`pnpm validate:filters`) — derives and reports FilterModel for each archive

#### Changed
- `App.jsx`: full `<Routes>` tree with all page components; legacy redirects `/blog`, `/blog/:slug`, `/posts`, `/post/:slug` → `/articles`
- `Header.jsx`, `Footer.jsx`: migrated from hardcoded markup to `siteSettings`-driven rendering
- `queries.js`: `allPostsQuery` → `allArticlesQuery`; `postBySlugQuery` → `articleBySlugQuery`; `_type == "post"` → `_type == "article"` throughout; added `TAXONOMY_FRAGMENT`
- `routes.js`: `TYPE_NAMESPACES` `post: 'articles'` → `article: 'articles'`; `getArchivePath` updated
- `ArchivePage.jsx`: fixed `post`→`article` in `ARCHIVE_QUERIES` and `CONTENT_TYPE_TO_DOC_TYPE`; upgraded all three content-type queries with taxonomy projection; `TaxonomyChips` wired into `ItemCard`
- `ArticlePage.jsx`: replaced inline category text span + separate tag list with `<TaxonomyChips>`
- `CaseStudyPage.jsx`: replaced inline category list with `<TaxonomyChips>`; tags now rendered
- `NodePage.jsx`: replaced inline category list with `<TaxonomyChips>`; tags now rendered
- `validate-urls.js`: `TYPE_NAMESPACES` updated; GROQ query keys and coverage label updated `post`→`article`
- `vite.config.js`: `historyApiFallback: true` for SPA deep linking

### Sanity production data

- `archivePage` "articles" document: `contentTypes` updated `["post"]` → `["article"]`
- Old `post` document (ID: `6de2bd5f`) deleted; replaced with `article` document (ID: `article-placeholder`)

### Canonical route namespace (final)

```
/                              → HomePage
/:slug                         → RootPage (page type)
/articles                      → ArchivePage (contentType: article)
/articles/:slug                → ArticlePage
/blog, /blog/:slug             → redirect → /articles
/posts, /post/:slug            → redirect → /articles
/case-studies                  → ArchivePage (contentType: caseStudy)
/case-studies/:slug            → CaseStudyPage
/knowledge-graph               → ArchivePage (contentType: node)
/nodes                         → redirect → /knowledge-graph
/nodes/:slug                   → NodePage
/tags|categories|projects|people(/:slug) → TaxonomyPlaceholderPage
*                              → NotFoundPage (404)
```

### Taxonomy surface (all top-level content types)

```
authors[]    → person refs
projects[]   → project refs (colorHex chip accent)
categories[] → category refs (colorHex chip accent)
tags[]       → tag refs (neutral chip)
```

---

## [0.0.0] — 2026-01-31 — Monorepo baseline

Initial monorepo scaffold: `sugartown-frontend` and `sugartown-sanity` imported as git
subtrees into a pnpm workspaces + Turborepo root. History from both repos preserved intact.
Tag: `v1.0.0-baseline`

Repos merged:
- `sugartown-frontend` (Jan 19–31) → `apps/web`
- `sugartown-sanity` (Jan 18–31) → `apps/studio`

> See `[Pre-monorepo / v1]` below for the full history of what was imported.

---

<!-- ============================================================ -->
<!-- PRE-MONOREPO HISTORY                                         -->
<!-- Reconstructed from preserved git repos. Not SemVer releases. -->
<!-- Live site = WordPress throughout both eras below.            -->
<!-- ============================================================ -->

## [Pre-monorepo / v1] — 2026-01-18 to 2026-01-31 — Dual-Repo React + Sanity MVP

**Repos:** `sugartown-frontend` · `sugartown-sanity`
**Stack:** React 19 + Vite 7 · Sanity Studio v3 · separate git repos
**Status:** Dev only — never deployed to production. WP live site unchanged.

This era established the React + Sanity stack and the foundational content model.
Both repos were created Jan 18–19, developed in parallel through Jan 31, then
merged into the monorepo via git subtree on the same day.

### sugartown-frontend

#### Added
- Initial React + Vite app with Sanity client integration (`ae05d2c` 2026-01-19)
- Design System setup: media split, `SanityMedia` component (`f20eb6b` 2026-01-19)
- Design tokens extracted from legacy CSS; components migrated to token architecture (`8e62c3c`, `a5213dc` 2026-01-24)
- Duotone image effect utility (`6649f74` 2026-01-24)
- Complete Sanity CMS schema architecture — Phase 1: `node`, `post`, `page`, `caseStudy`, taxonomy (`db6d192` 2026-01-24)
- `NodesExample` component to display Knowledge Graph Nodes (`1f46649` 2026-01-25)
- `siteSettings` integration: preheader and CTA button wired to frontend (`9f7af5c` 2026-01-25)
- Homepage migrated to new Sanity schema (`2c48b58` 2026-01-25)
- New Sanity content model for pages and site settings (`3447b7f` 2026-01-31)

#### Changed
- DS color: seafoam → green (`627eae3` 2026-01-19)
- Hero: load button array (`04f5088` 2026-01-19)
- Various layout and background fixes (2026-01-20)
- `siteSettings` homepage schema with deprecations merged from branch `reverent-herschel` (`5d39793` 2026-01-25)

### sugartown-sanity

#### Added
- Sanity Studio bootstrapped (`1c62923` 2026-01-18)
- Initial Studio with atomic design schemas (`7f3f07a` 2026-01-19)
- `preheader` and `ctaButtonDoc` schemas; `siteSettings` updated (`6542514` 2026-01-25)
- `homepage` schema; legacy schemas deprecated (`b429e00` 2026-01-25)
- `heroSection` updated to use `ctaButtonDoc` references (`f897d9f` 2026-01-25)
- Legacy schemas deprecated; `editorialCard` object introduced (`3ff91b0` 2026-01-31)
- Legacy MVP docs added; V1 CMS strategy PRD published (`0cfae4e`, `13454c1` 2026-01-31)
- Architecture and schema reference docs consolidated via PRs #1–4 (`2026-01-31`)
- `siteSettings` schema updated (`f3bba7a` 2026-01-31)

#### Schema registry at merge (from `schemas/index.ts`):
- **Objects (new):** `link`, `richImage`, `ctaButton`, `editorialCard`
- **Objects (legacy):** `logo`, `media`, `navigationItem`, `socialLink`
- **Sections:** `heroSection`, `textSection`, `imageGallery`, `ctaSection`
- **Documents — taxonomy:** `category`, `tag`, `project`
- **Documents — content:** `node`, `post`, `page`, `caseStudy`
- **Documents — infrastructure:** `navigation`, `siteSettings`, `preheader`, `ctaButtonDoc`, `homepage`
- **Documents — deprecated:** `header`, `footer`, `hero`, `contentBlock`

#### GROQ queries at merge (from `sugartown-frontend/src/lib/queries.js`):
- `siteSettingsQuery`, `homepageQuery`, `allNodesQuery`, `nodeBySlugQuery`
- `allPostsQuery`, `postBySlugQuery`, `pageBySlugQuery`, `allCaseStudiesQuery`
- `allCategoriesQuery`, `allTagsQuery`, `allProjectsQuery`
- Legacy deprecated: `headerQuery`, `footerQuery`, `heroesQuery`, `contentBlocksQuery`

---

## [Pre-monorepo / v0] — 2025-11-27 to 2026-01-17 — WordPress + Python Pipeline

**Repos:** `repos/sugartown-pink` (WP Block Theme) · `repos/sugartown-cms` (Python pipeline)
**Stack:** WordPress Block Theme (PHP) · Python content pipeline (`publish_gem.py`) · no frontend framework
**Status:** Production — live site throughout this era and all subsequent eras.

The original platform. A custom WordPress Block Theme delivering the public site,
with a Python-based content pipeline (`publish_gem.py`) for publishing gems to WP via API.
Six named releases shipped to production during this era.

### repos/sugartown-pink (WordPress Block Theme)

#### Release history (all production)

**2026-01-11 — Design System Alignment + Token Updates**
- Upgraded Sugartown Pink to `#FF247D`; semantic tokens for single posts/pages
- Fixed chip sizing, code block background CSS variable, content width constraints
- Standardized footer pattern across archive and single templates
- Accessibility and layout fixes for footer heading hierarchy

**2026-01-03 — Responsive Tables Stabilization**
- Fixed mobile table card layout: overflow, box-sizing, width constraints
- Canonical design tokens confirmed loading correctly post-cache invalidation
- Added `st-table`, `st-table--wide`; deprecated `st-table--review`
- Added `st-filter`; deprecated `kg-filter`

**2026-01-01 — Design System Alignment & Accessibility Audit**
- Canonicalized `st-chip` as single interactive primitive across archive filters, hero nav, and metadata tags
- Removed competing chip variant classes; normalized card border colors and grid spacing
- Refactored CSS architecture: element styles moved to global base rules
- Accessibility audit: 16 documented issues with priority levels
- Created `CSS_FILE_ORGANIZATION_RULES.md`; standardized `ds-` → `st-` namespace

**2025-12-29 — AI Governance + Design System Foundations**
- Three-tier design token system: brand colors, spacing, typography
- `st-*` namespace standardized across tokens and docs
- AI Ethics & Operations policy published; design system ruleset and prompt templates published

**2025-12-27 — Taxonomy v4 + Interactive Filter System**
- `st-chip` interactive primitives for archive filters; floating multi-column dropdowns
- Taxonomy v4 complete: WordPress categories as single source of truth; `gem_category` meta eliminated
- Publisher v4.1: dynamic category ID lookup; auto-creates missing categories
- Archive result counter reflects actual filtered results; pagination accuracy fixed

**2025-12-24 — Knowledge Graph Landing + Template Integration**
- `/knowledge-graph/` established as intentional section landing with narrative context
- WP Block Theme template parts (`do_blocks()`) integrated in PHP templates
- Content model rule established: narrative content as Gems; archive templates render structure only

**2025-12-21 — Canonical st-card Adoption**
- `st-card` replaces archive-specific gem cards; dark variant (`st-card--dark`) for system/infra gems

**2025-12-19 — st-card Migration**
- `pink-card` → `st-card`; canonical gradient recipe, unified tag/term styling

**2025-12-17 — Design System v3.3**
- Grid layout decoupled; overlap fixes; automation hook

**2025-12-03–07 — Initial commits**
- `Initial commit: Sugartown Pink Theme` (`7671c1c` 2025-12-03)
- Stink Pink color iteration; post type updates (`5b4042c` 2025-12-07)

### repos/sugartown-cms (Python pipeline)

#### Added
- Initial commit: pipeline scripts, README (`e8c40b7` 2025-11-27)
- Resume ingestion workflow (`b883867` 2025-11-30)
- Publishing Architecture Gem; upsert logic; Resume workflow gems (`2544791`, `274aed1` 2025-11-27–12-03)
- `publish_gem.py` v3.7: draft-aware, fuzzy match, taxonomy-aware (`4012fd0` 2025-12-05)
- Finalized README with v3.7 architecture (`69c6edd` 2025-12-05)
- Synced with WP theme release history through Jan 2026
