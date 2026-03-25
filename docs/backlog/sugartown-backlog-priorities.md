# Sugartown — Backlog & Priority Stack

> Updated 2026-03-25 · v0.19.3 · Shipped SUG-31 Image Asset Pipeline
>
> **Linear is the single source of truth for prioritization.** This file is a convenience view.
> Epic docs use Linear issue IDs (SUG-{N}) as filenames. Backlog: `docs/backlog/SUG-{N}-*.md`. Shipped: `docs/prompts/SUG-{N}-*.md`.

---

**Priority legend:** 🔴 Now — blocks epics · 🟢 Next — high value, ready · 🟣 Soon — post-current sprint · ⚪ Later — pre-launch · ⬛ Deferred — post-launch · ✅ Shipped

---

> **⚑ Current focus:** v0.19.3 shipped (SUG-31 Image Asset Pipeline). **Next:** DNS cutover to Netlify, IA brief page epics.

---

## 01 · Next — high value, ready to pick up

| # | Item | Tags | Priority |
|---|------|------|----------|
| 1 | **DNS cutover to Netlify** — Hosting decided (Netlify). Remaining: connect GitHub repo for deploy previews, set up Sanity webhook → Netlify build hook, configure `sugartown.io` custom domain, execute DNS cutover. See `docs/reports/hosting-evaluation.md` for full plan. | `Infrastructure` | 🟢 Next |

---

## 02 · Soon — post-sprint, pre-launch

| # | Item | Tags | Priority |
|---|------|------|----------|
| 2 | **Themed background images — finalize or remove** — Dark/light flourish PNGs (`std-bg-dark.png`, `std-bg-light.png`) added to `apps/web/public/` in v0.16.x cycle but currently commented out in CSS pending design iteration. Needs a design decision: integrate into theme system with proper placement/opacity, or remove to reduce asset weight. | `Design` `UX` | 🟣 Soon |
| 3 | **Brand color picker for Sanity Studio (BL-01)** — ✅ Shipped. [SUG-8](https://linear.app/sugartown/issue/SUG-8). Epic: `docs/prompts/SUG-8-brand-color-picker.md`. | `Studio UX` `BL-01` | ✅ Shipped |
| 4 | **Studio UX polish — section type labels + archive rich text** — ✅ Shipped. [SUG-11](https://linear.app/sugartown/issue/SUG-11). Epic: `docs/prompts/SUG-11-studio-ux-polish.md`. | `Studio UX` `Schema` | ✅ Shipped |
| 5 | **Mermaid diagram section type** — ✅ Shipped v0.19.1. [SUG-13](https://linear.app/sugartown/issue/SUG-13). Epic: `docs/prompts/SUG-13-mermaid-diagrams.md`. | `Schema` `Component` `UX` | ✅ Shipped |
| 6 | **Image treatments & gallery layouts** — ✅ Shipped v0.19.2. [SUG-30](https://linear.app/sugartown/issue/SUG-30). Epic: `docs/prompts/SUG-30-image-treatments-gallery.md`. | `Schema` `Design System` | ✅ Shipped |

---

## 03 · Deferred — post-launch

| Item | Tags |
|------|------|
| **Sitemap epic (EPIC TBD)** — Auto-generated XML sitemap for Sanity content. Not required at launch but needed shortly after for SEO indexing. | `Deferred` `SEO` |
| **Image redirect epic: `/wp-content/uploads/…` → Sanity CDN** — WP media URLs embedded in content need redirecting to Sanity CDN or static asset paths. Low urgency unless referenced in inbound links with SEO value. | `Deferred` `Infrastructure` |
| **Future layout components: 2-col, 3-col banner, carousel** — Enhanced section builder layout options for editorial page building. Carousel needs accessibility and mobile performance consideration. Phase 2 scope. | `Deferred` `Component` |
| **Archive page deferred fields — wire Display + Advanced tab configs** — 8 `archivePage` fields moved to "Advanced (coming soon)" tab in Studio: hero section, custom description, featured items, display density, card variant, sort options, pagination, empty state. None are currently wired in the web app. Wire them when archive page UX is revisited post-launch. | `Deferred` `Schema` `Editor UX` |
| **KPI dashboard card family: stat-card, bar-card, insight-card (BL-03)** — New card use cases for a KPI dashboard surface. High design ambition, lower immediate priority. Scope as a standalone epic when the dashboard page is prioritised. | `Deferred` `Design System` `BL-03` |
| **Schema ERD Sanity Hybrid (Option C)** — Upgrade ERD from code-driven page (EPIC-0172) to a `schemaErdSection` type embeddable via section builder. Component unchanged — adds schema, GROQ projection, and PageSections case. Depends on EPIC-0172. | `Deferred` `Schema` `Content` |
| **EPIC Pink Moon — runtime theme toggle & polish** — CSS exists (`theme.pink-moon.css`) with dark-pink-moon and light-pink-moon variants — milky translucency, hairline borders, ambient glow. But there is no runtime toggle to activate it; the ThemeToggle component only switches between dark and light. This epic wires the Pink Moon variants into the theme switcher UI, adds Storybook stories for all 4 theme combinations, and polishes any component-level visual regressions under the glass aesthetic. | `Deferred` `Design System` `UX` |
| **Site-wide content search (EPIC TBD)** — No search exists today. Options: Sanity's built-in text search API, a lightweight client-side index (e.g. Fuse.js over a pre-built JSON manifest), or a hosted search service (Algolia, Typesense). Needs design decision on scope (full-text vs title/tag), UI placement (nav bar, dedicated page, command palette), and whether to index all 5 content types or start with articles + nodes. High user value but no existing infrastructure — design spike needed first. | `Deferred` `UX` `GROQ` `Infrastructure` |

---

## 04 · Shipped ✓ — confirmed in CHANGELOG v0.14.x–0.19.x

| Item | Version | Date |
|------|---------|------|
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

*sugartown.io · docs/backlog/priority-stack · updated 2026-03-25 · v0.19.3*
