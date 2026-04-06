# Sugartown — Backlog & Priority Stack

> Updated 2026-04-06 · v0.21.0 · Storybook v10, Accordion, argTypes audit
>
> **Linear is the single source of truth for prioritization.** This file is a convenience view.
> Epic docs use Linear issue IDs (SUG-{N}) as filenames. Backlog: `docs/backlog/SUG-{N}-*.md`. Shipped: `docs/prompts/SUG-{N}-*.md`.

---

**Priority legend:** 🔴 Now — blocks epics · 🟢 Next — high value, ready · 🟣 Soon — post-current sprint · ⚪ Later — pre-launch · ⬛ Deferred — post-launch · ✅ Shipped

---

> **⚑ Current focus:** v0.21.0 shipped (SUG-46 Storybook v10, SUG-45 argTypes, SUG-44 Accordion). **Next:** SUG-21 Pink Moon design system identity.

---

## 01 · Next — high value, ready to pick up

| # | Item | Tags | Priority |
|---|------|------|----------|
| 1 | **[SUG-21](https://linear.app/sugartown/issue/SUG-21) · Pink Moon design system identity** — Pink Moon becomes the primary DS identity (not a theme variant). Light default, stained glass principle, academic interface, WCAG AA built-in, component overrides across all 12 primitives. Specs TBD via updated PRD. Working docs: `pink-moon-manifesto.md`, `ai-slop-manifesto.md`, `pink-moon-mock.html` (local drafts). Epic: `docs/backlog/SUG-21-pink-moon-design-system.md`. | `Design System` `UX` | 🟢 Next |

---

## 02 · Soon — post-sprint, pre-launch

| # | Item | Tags | Priority |
|---|------|------|----------|
| 1 | **Themed background images — finalize or remove** — Dark/light flourish PNGs (`std-bg-dark.png`, `std-bg-light.png`) added to `apps/web/public/` in v0.16.x cycle but currently commented out in CSS pending design iteration. Needs a design decision: integrate into theme system with proper placement/opacity, or remove to reduce asset weight. | `Design` `UX` | 🟣 Soon |
| 2 | **[SUG-47](https://linear.app/sugartown/issue/SUG-47) · Storybook/Studio props alignment audit** — Cross-check every Storybook argTypes enum against its Sanity schema source. Studio is source of truth. Epic: `docs/backlog/SUG-47-storybook-studio-props-alignment.md`. | `Design System` `Infrastructure` | ⚪ Later |

---

## 03 · Deferred — post-launch

| Item | Tags |
|------|------|
| ~~**SUG-15 · XML Sitemap + Visual HTML Sitemap** — ✅ Shipped v0.19.6. Build-time sitemap.xml + robots.txt. Visual /sitemap page with governance stats.~~ | `SEO` | ✅ Shipped |
| **Image redirect epic: `/wp-content/uploads/…` → Sanity CDN** — WP media URLs embedded in content need redirecting to Sanity CDN or static asset paths. Low urgency unless referenced in inbound links with SEO value. | `Deferred` `Infrastructure` |
| **Future layout components: 2-col, 3-col banner, carousel** — Enhanced section builder layout options for editorial page building. Carousel needs accessibility and mobile performance consideration. Phase 2 scope. | `Deferred` `Component` |
| **Archive page deferred fields — wire Display + Advanced tab configs** — 8 `archivePage` fields moved to "Advanced (coming soon)" tab in Studio: hero section, custom description, featured items, display density, card variant, sort options, pagination, empty state. None are currently wired in the web app. Wire them when archive page UX is revisited post-launch. | `Deferred` `Schema` `Editor UX` |
| **[SUG-19](https://linear.app/sugartown/issue/SUG-19) · KPI dashboard card family (BL-03)** — stat-card, bar-card, insight-card variants on DS Card. Build-time content metrics at `/platform/metrics`. Phase 1: DS variants + Storybook. Phase 2: metrics page. Epic: `docs/backlog/SUG-19-kpi-dashboard-cards.md`. | `Deferred` `Design System` `BL-03` |
| **Schema ERD Sanity Hybrid (Option C)** — Upgrade ERD from code-driven page (EPIC-0172) to a `schemaErdSection` type embeddable via section builder. Component unchanged — adds schema, GROQ projection, and PageSections case. Depends on EPIC-0172. | `Deferred` `Schema` `Content` |
| ~~**SUG-21 · Pink Moon** — Elevated to 🟢 Next. See §01.~~ | `Design System` `UX` |
| **[SUG-36](https://linear.app/sugartown/issue/SUG-36) · Site-wide content search** — No search exists today. Recommended: Fuse.js client-side index (build-time JSON manifest, same pattern as sitemap). Nav search icon + `/search` page. Phase 1: articles + nodes + case studies. Design spike needed first. Epic: `docs/backlog/SUG-36-site-search.md`. | `Deferred` `UX` `GROQ` `Infrastructure` |

---

## 04 · Shipped ✓ — confirmed in CHANGELOG v0.14.x–0.21.x

| Item | Version | Date |
|------|---------|------|
| ~~**SUG-46 · Storybook v10 upgrade + parity restoration** — Storybook v7→v10.3.4, React 19 compat, sidebar reorg (Foundations/Primitives/Patterns/Layout), 18 new web stories, 5 documentation stories, custom manager theme, Netlify deploy to pinkmoon.sugartown.io.~~ | v0.21.0 | 2026-04-06 |
| ~~**SUG-45 · Storybook argTypes audit** — Explicit argTypes on all 17 story files (7 DS primitives, 10 web adapters). Booleans→toggles, enums→dropdowns, colours→pickers, internals hidden.~~ | v0.21.0 | 2026-04-06 |
| ~~**SUG-38 · Storybook parity & deployment** — Superseded by SUG-46. Original scope (React 18→19, Vite 5→7, SB 7→9) delivered via SUG-46 upgrade path.~~ | v0.21.0 | 2026-04-06 |
| ~~**SUG-44 · Accordion Component** — DS primitive (single/multi-expand, CSS grid-row animation, full a11y), `accordionSection` Sanity schema registered in all document types, GROQ projections, PageSections renderer, Storybook stories (5 variants). Visual QA passed.~~ | v0.20.1 | 2026-04-03 |
| ~~**DNS cutover to Netlify** — Connected GitHub repo for deploy previews, Sanity webhook → Netlify build hook, `sugartown.io` custom domain configured, DNS cutover executed. Site live.~~ | v0.20.0 | 2026-04-01 |
| ~~**SUG-37 · Responsive Mobile Nav** — Hamburger trigger + slide-out drawer with accordion submenus, focus trap, body scroll lock, footer zone (CTA, legal links, social icons, theme toggle). Hero bg cover fix, border token visibility bump, tool taxonomy expansion.~~ | v0.19.8 | 2026-03-31 |
| ~~**SUG-34 · Table Authoring UX + HTML Table Migration** — Custom `TableBlockInput` spreadsheet-style grid with clipboard paste (TSV + HTML). Migration script converted 26 legacy `htmlSection` `<table>` blocks into native `tableBlock` objects. Idempotent.~~ | v0.19.7 | 2026-03-30 |
| ~~**SUG-15 · XML Sitemap + Visual HTML Sitemap** — Build-time `sitemap.xml` (218 URLs) + `robots.txt`. Visual `/sitemap` page with live Sanity data, grouped by content type, noIndex governance badges, stats bar.~~ | v0.19.6 | 2026-03-26 |
| ~~**SUG-33 · Detail Page Hero & Metadata Refinement** — Hero tab on all detail doc schemas, MetadataCard compact grid layout, Internal Title rename, hero section backfill migration for all detail documents.~~ | v0.19.5 | 2026-03-25 |
| ~~**SUG-32 · WordPress Media Library Import & Asset Mapping** — Legacy WordPress media assets imported into Sanity with naming convention applied. Image-to-document mapping for case studies, articles, about page. Migration scripts and artifacts.~~ | v0.19.4 | 2026-03-25 |
| ~~**SUG-31 · Image Asset Pipeline** — Naming convention established (`{docType}-{subject}-{descriptor}.{ext}`). 55 metadata renames, 19 format conversions (jpg→webp), 9 orphan deletions. All document references patched. Hero overlay GROQ projection fix + extreme duotone CSS parity fix.~~ | v0.19.3 | 2026-03-25 |
| ~~**EPIC-0183 · Content Metadata Audit & Taxonomy Backfill** — 57 content docs audited, 18 backfilled to taxonomy minimums (≥1 category, ≥3 tags, ≥1 tool, ≥1 author). 9 unused taxonomy entries deleted. Validator checks H (taxonomy coverage), I (author attribution), J (SEO metadata) added to `validate-content.js` with `--strict` and `--report` flags.~~ | v0.18.7 | 2026-03-19 |
| ~~**EPIC-0182 · Image Optimization & Responsive Breakpoints** — Breakpoint tokens (`--st-breakpoint-sm/md/lg`) with annotated `@media` queries across 13 CSS files. Sanity CDN `.auto('format')` for WebP/AVIF. `loading="lazy"` + `decoding="async"` on all `<img>` elements. Hero image `<link rel="preload">` on detail pages. `SanityImage` component with responsive `srcset` (400w/800w/1200w). Background PNGs converted to WebP (2.4 MB → 383 KB).~~ | v0.18.6 | 2026-03-17 |
| ~~**EPIC-0181 · cardImage Field** — `cardImage` (image + hotspot + alt) added to article, caseStudy, node schemas. GROQ archive queries project `cardImageUrl` and `cardImageAlt`. ContentCard thumbnail chain: `cardImageUrl → imageOverride → heroImageUrl → null`. No visual change until editors populate.~~ | v0.18.5 | 2026-03-17 |
| ~~**EPIC-0180 · Card Adapter Convergence** — CSS parity sync (title token), configurable `toolsLabel`/`tagsLabel` props, SPA contract documented. Web Card adapter verified as thin mirror of DS Card with explicit SPA extensions (`children`, `footerChildren`, `colorHex`, `<Link to>`). MEMORY.md updated.~~ | v0.18.4 | 2026-03-17 |
| ~~**EPIC-0179 · Contact Form** — `ContactForm.jsx` with name/email/message fields, client-side validation, honeypot spam protection, Netlify Forms `fetch()` POST. Hidden static form in `index.html` for SPA detection. Renders on `/contact` via RootPage. Button `type` prop fix. In Review pending Netlify production test.~~ | v0.18.3 | 2026-03-17 |
| ~~**EPIC-0178 · PortableText Updates** — Inline code decorator in Studio portableTextConfig. citationRef mark handler in PageSections (was missing). Global inline code styling: lime pill (dark), magenta pill (light). Code block overflow fixes. Shared portableTextComponents for page sections.~~ | v0.18.2 | 2026-03-16 |
| ~~**EPIC-0177 · Preview UI** — PreviewBanner (lime green), DraftBadge (amber chip), rawClient for draft detection, useDraftIds/useDocHasDraft hooks. Draft badges on archive cards and all detail pages. Citation footnote link styling. Card statusDraft amber.~~ | v0.18.1 | 2026-03-16 |
| ~~**Hosting platform decision** — Evaluated Netlify, Cloudflare Pages, Vercel, self-hosted. Selected Netlify: zero migration cost, native redirect compatibility (296 exact-match + 3 query-param rules), automatic deploy previews, Sanity build hook support, free tier sufficient. Report: `docs/reports/hosting-evaluation.md`.~~ | — | 2026-03-15 |
| ~~**EPIC-0176 · Content State Governance** — Published-only content posture made explicit. `contentState.js` centralizes perspective decision. Build-time safety plugin blocks `VITE_SANITY_PREVIEW=true` in production. Draft-only document detection added to `validate-content.js` (check G). Content state policy documented.~~ | v0.17.7 | 2026-03-15 |
| ~~**EPIC-0175 · Token Reference Cleanup** — Resolved all broken `var(--st-*)` references across 19 CSS files. Registered `--st-transition-fast`, `--st-color-surface-subtle`, `--st-page-gutter`. Migrated 24 legacy alias refs (`--st-font-mono`, `--st-pink`, `--st-gray-light`, `--st-font-sans`). Deleted orphaned `design-tokens.css`. Validator enhanced with reference scanning + component-scoped API token allowlist.~~ | v0.17.6 | 2026-03-14 |
| ~~**EPIC-0174 · FilterBar & MetadataCard Cleanup + Tag Taxonomy Audit** — Removed legacy tool string-type guards, audited status label maps (node evolution + project lifecycle), removed legacy author fallback. Tag taxonomy: 256→92 tags (25 duplicates deleted, 132 orphans deleted, 7 tag→tool ref migrations). Author backfill: 35 node docs patched. Migration scripts: `cleanup-tag-tool-duplicates.js`, `cleanup-orphan-tags.js`, `backfill-default-author.js`.~~ | v0.17.5 | 2026-03-14 |
| ~~**EPIC-0173 · Link Atom Consolidation & CTA Cleanup** — Active schemas migrated to `linkItem`, CTA pair synced, GROQ projections flatten to existing component shape, migration script ready.~~ | v0.17.4 | 2026-03-14 |
| ~~**EPIC-0172 · Schema ERD Page** — Interactive schema explorer at `/platform/schema`. 30 entities, 44 relationships. Group filter tabs, click-to-select cards, pink reference links. CTA style ghost → tertiary.~~ | v0.17.3 | 2026-03-14 |
| ~~**EPIC-0171 · Icon & Emoji Strategy** — SVG icons, DRY schema options. Replaced emoji icons with tree-shakeable SVG components (Simple Icons + Lucide) across SocialLink, ThemeToggle, NodesExample, PersonProfilePage. All Studio icon/platform option lists consolidated into shared `iconOptions.ts`. Social icons default brand pink with muted hover. Solid LinkedIn icon.~~ | v0.17.2 | 2026-03-13 |
| ~~**EPIC-0170 · Footer IA Brief Links** — link resolution, column headings, brand polish. Footer nav items resolve via `resolveNavLink()`, fixing broken external links. Navigation schema gains optional `header` field. Brand column centered, bottom bar separator uses brand pink.~~ | v0.17.1 | 2026-03-13 |
| ~~**Nav update** — Library dropdown, archive picker, focus states. Nav dropdown menus: hover-triggered when parent has URL, click-triggered when label-only. Keyboard/Escape/click-outside support. Archive pages selectable in nav internal page picker. Focus-visible underline replaces outline box.~~ | v0.17.2 | 2026-03-13 |
| ~~**Homepage teasers** — content authored in Sanity. Homepage content sections authored using section builder. Leader content per major section: Work, Library, Platform, Services teasers.~~ | — | 2026-03-13 |
| ~~**Platform page** — `/platform`. New page per IA brief §5.3. Built using section builder — architecture overview, current version, design system philosophy, links to platform artifacts.~~ | — | 2026-03-13 |
| ~~**About page rewrite** — `/about`. Content rewrite per IA brief §5.4. Section builder with updated bio, approach narrative, and links to Work/Library/Platform.~~ | — | 2026-03-13 |
| ~~**EPIC-0167 · Section Layout Cohesion** — fix gallery bug + unify spacing & typography. Fixed imageGallery GROQ projection, unified section spacing via `context="detail"` on PageSections, tokenised `.detailContent` typography, deprecated standalone `content` field on node and article schemas.~~ | v0.17.0 | 2026-03-12 |
| ~~**EPIC-0168 · Link & Button Unification** — single CTA rendering path. Button component renders React Router `<Link>` for internal hrefs, `<a target="_blank">` for external. Shared `linkUtils.js` utility. Header CTA unified through Button.~~ | v0.17.0 | 2026-03-12 |
| ~~**EPIC-0169 · Citations in Content Body** — schema, shared PT renderer & endnotes. `citationRef` annotation wired into `standardPortableText`. `citations[]` endnote arrays on article, node, caseStudy. Shared PT renderer handles `citationRef` mark → `CitationMarker` superscript.~~ | v0.17.0 | 2026-03-12 |
| ~~**EPIC-0163/0164/0165 · Configure Sections** — table, callout, card builder for all pages. `tableBlock` schema + PT renderer. `calloutSection` schema + renderer wired to all doc types. `cardBuilderSection` added to article, caseStudy, node section builders.~~ | v0.17.0 | 2026-03-12 |
| ~~**Services page** — `/services`. New page per IA brief §5. Built using section builder with textSection, cardBuilderSection, and CTA sections.~~ | — | 2026-03-11 |
| ~~**Contact page** — `/contact`. Minimal contact page per IA brief §5. Route wired, content authored in Sanity.~~ | — | 2026-03-11 |
| ~~**BL-06 · `categoryPosition` Studio field** — scoped to archive & cardBuilder. Moved from individual content doc schemas to `archivePage.cardOptions` and `cardBuilderItem`.~~ | — | 2026-03-11 |
| ~~**HTML entity cleanup + shared PortableText serializer** — Migration script extended to decode entities in PortableText `content` span.text fields. Shared `portableTextComponents.jsx` applied to ArticlePage, NodePage, PersonProfilePage.~~ | — | 2026-03-09 |
| ~~**EPIC-0162 · Tools Taxonomy** — Promoted tools from 27-value string enum to first-class `tool` documents with routes, filter facets, GROQ dereferencing. Migration script seeds 30 tool docs, migrates 49 content docs.~~ | v0.16.1 | — |
| ~~**EPIC-0161 · Card Grid & Typography Polish** — Card title font switch, chip row group labels, grid/list layout toggle with sessionStorage persistence.~~ | v0.15.4 | — |
| ~~**EPIC-0160 · Card Builder Section** — `cardBuilderSection` schema + `CardBuilderSection` renderer for editor-assembled card grids. Citation web adapter.~~ | v0.15.3 | — |
| ~~**EPIC-0159 · Citation Primitive** — `CitationMarker`, `CitationNote`, `CitationZone` components with 8 semantic `--st-citation-*` tokens.~~ | v0.15.2 | — |
| ~~**EPIC-0158 · Web Card Adapter Migration** — Converged old slot-based web Card API onto DS Card named-prop API. Fixed invalid nested anchors. Resolved `thumbnailUrl` per-type GROQ projections.~~ | v0.15.0 | — |
| ~~**EPIC-0153 · Hero Full-Width & Content Width Normalisation** — `imageWidth` field on `heroSection` schema. Detail pages use `--st-width-detail` (760px), archives use `--st-width-archive` (1140px).~~ | v0.15.1 | — |
| ~~**PersonProfilePage + ProjectDetailPage** — Purpose-built page components for person and project entities.~~ | — | — |
| ~~**EPIC-0152 · Light/Dark Theme System** — `[data-theme]` token architecture, ThemeToggle component, light theme stylesheet, Storybook docs canvas theming fix.~~ | v0.14.2 | — |
| ~~**EPIC-0155 · URL Audit & Redirect Decision Registry** — 326 legacy WordPress URLs classified and redirected via `netlify.toml`. Full URL inventory and gap analysis artifacts.~~ | v0.14.1 | — |
| ~~**BL-07 · `featuredImage` deprecation** — Field hidden in Studio. Canonical thumbnail sources are `hero.media[0]` or `sections[]`.~~ | v0.15.0 | — |
| ~~**BL-05 · Storybook viewport / docs canvas fix** — Docs canvas background matches active theme via `docs-overrides.css`.~~ | v0.14.2 | — |

---

*sugartown.io · docs/backlog/priority-stack · updated 2026-04-06 · v0.21.0*
