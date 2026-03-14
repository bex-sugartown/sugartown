# Sugartown — Backlog & Priority Stack

> Updated 2026-03-13 · v0.17.2 released (EPIC-0170–0171 shipped) · All IA brief Phase 1 content pages live · Remaining: ERD, cleanup, governance, infra

---

**Priority legend:** 🔴 Now — blocks epics · 🟢 Next — high value, ready · 🟣 Soon — post-current sprint · ⚪ Later — pre-launch · ⬛ Deferred — post-launch · ✅ Shipped

---

> **⚑ Current focus:** v0.17.2 shipped: EPIC-0170 footer IA brief links, EPIC-0171 icon & emoji strategy. All IA brief Phase 1 content pages are live (Services, Contact, About, Platform, Homepage). Nav wired with Library dropdown. **Next priorities:** ERD page, FilterBar/MetadataCard cleanup, token reference cleanup, content governance.

---

## 01 · Now — active / blocks launch

| # | Item | Tags | Priority |
|---|------|------|----------|
| 1 | **Static Schema ERD page (EPIC-0147, Option B)** — Hardcoded schema manifest rendered as a visual ERD page. Option B is immediately implementable without a build step. Useful as a portfolio and internal reference artefact for the MACH architecture showcase. Good candidate for the Platform page. | `EPIC-0147` `Content` | 🔴 Now |

---

## 02 · Next — high value, ready to pick up

| # | Item | Tags | Priority |
|---|------|------|----------|
| 2 | **FilterBar & MetadataCard cleanup** — Post-EPIC-0162 housekeeping. MetadataCard and FilterBar both carry legacy code paths from when tools were string enums — null guards, coercion helpers, and fallback renders that are no longer needed now that all content docs use reference arrays. Clean up dead branches, remove string-type guards, and align both components to the reference-only contract. Also audit facet label maps and `CONTENT_TYPE_LABELS` for stale entries. | `Component` `GROQ` | 🟢 Next |
| 3 | **Content State Governance — draft vs published enforcement** — IA brief §5.3 dependency. Ensure published content has no orphaned references, missing required fields, or stale draft shadows. Extend `validate-content.js` with a "publication readiness" check that flags docs with drafts-only references or unpublished taxonomy refs. Feeds into Platform page content integrity story. May include a Studio document badge or custom action to surface publication state. | `Schema` `Data Quality` `Editor UX` | 🟢 Next |
| 4 | **Token reference cleanup — 52 unknown `var(--st-*)` refs** — Token validator reports 52 broken token references across 19 CSS files. Pre-existing legacy debt: `App.css` uses retired names (`--st-red`, `--st-space-md`), `--st-page-gutter` defined in `globals.css` not `tokens.css`, Media/Table/Callout/CodeBlock component tokens not registered. Browser silently falls back to UA defaults (e.g. Times New Roman for font-family). No regressions from v0.17.0 — all pre-existing. | `CSS` `Data Quality` | 🟢 Next |

---

## 03 · Soon — post-sprint, pre-launch

| # | Item | Tags | Priority |
|---|------|------|----------|
| 5 | **Hosting platform decision for DNS cutover** — Evaluate Netlify, Cloudflare Pages, Vercel, or self-hosted against cost, preview URL support, redirect file compatibility, and Sanity webhook integration. Decision gates the cutover timeline. | `Infrastructure` | 🟣 Soon |
| 6 | **Add Search — site-wide content search** — No search exists today. Options: Sanity's built-in text search API, a lightweight client-side index (e.g. Fuse.js over a pre-built JSON manifest), or a hosted search service (Algolia, Typesense). Needs design decision on scope (full-text vs title/tag), UI placement (nav bar, dedicated page, command palette), and whether to index all 5 content types or start with articles + nodes. High user value but no existing infrastructure — design spike needed first. | `UX` `GROQ` `Infrastructure` | 🟣 Soon |
| 7 | **Themed background images — finalize or remove** — Dark/light flourish PNGs (`std-bg-dark.png`, `std-bg-light.png`) added to `apps/web/public/` in v0.16.x cycle but currently commented out in CSS pending design iteration. Needs a design decision: integrate into theme system with proper placement/opacity, or remove to reduce asset weight. | `Design` `UX` | 🟣 Soon |
| 8 | **Brand color picker for Sanity Studio (BL-01)** — Lets editors set `colorHex` on project documents via a visual colour picker rather than raw hex input. Nice-to-have UX improvement for Studio editors. Tracked as BL-01 from EPIC-0156. | `Studio UX` `BL-01` | 🟣 Soon |
| 9 | **Dedicated `cardImage` schema field (BL-02)** — Separate from heroImage/sections media. Allows editors to set a specific thumbnail for a content item when it appears in card grids, without affecting the hero display. Tracked as BL-02. | `Schema` `BL-02` | 🟣 Soon |

---

## 04 · Deferred — post-launch

| Item | Tags |
|------|------|
| **Web Card adapter migration — old slot-based → DS named-props API** — DS Card got a new named-props API in EPIC-0156 but the web adapter layer (`apps/web/src/design-system/components/card/Card.jsx`) still wraps the old slot-based API. All callers (ContentCard, EditorialCard, MetadataCard, and 8+ page files) need coordinated migration. No epic scoped. Recognized tech debt documented in MEMORY.md conventions. | `Deferred` `Component` |
| **Sitemap epic (EPIC TBD)** — Auto-generated XML sitemap for Sanity content. Not required at launch but needed shortly after for SEO indexing. | `Deferred` `SEO` |
| **Image redirect epic: `/wp-content/uploads/…` → Sanity CDN** — WP media URLs embedded in content need redirecting to Sanity CDN or static asset paths. Low urgency unless referenced in inbound links with SEO value. | `Deferred` `Infrastructure` |
| **Future layout components: 2-col, 3-col banner, carousel** — Enhanced section builder layout options for editorial page building. Carousel needs accessibility and mobile performance consideration. Phase 2 scope. | `Deferred` `Component` |
| **Archive page deferred fields — wire Display + Advanced tab configs** — 8 `archivePage` fields moved to "Advanced (coming soon)" tab in Studio: hero section, custom description, featured items, display density, card variant, sort options, pagination, empty state. None are currently wired in the web app. Wire them when archive page UX is revisited post-launch. | `Deferred` `Schema` `Editor UX` |
| **KPI dashboard card family: stat-card, bar-card, insight-card (BL-03)** — New card use cases for a KPI dashboard surface. High design ambition, lower immediate priority. Scope as a standalone epic when the dashboard page is prioritised. | `Deferred` `Design System` `BL-03` |
| **EPIC Pink Moon — runtime theme toggle & polish** — CSS exists (`theme.pink-moon.css`) with dark-pink-moon and light-pink-moon variants — milky translucency, hairline borders, ambient glow. But there is no runtime toggle to activate it; the ThemeToggle component only switches between dark and light. This epic wires the Pink Moon variants into the theme switcher UI, adds Storybook stories for all 4 theme combinations, and polishes any component-level visual regressions under the glass aesthetic. | `Deferred` `Design System` `UX` |

---

## 05 · Shipped ✓ — confirmed in CHANGELOG v0.14.x–0.17.x

| Item | Version | Date |
|------|---------|------|
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

*sugartown.io · docs/backlog/priority-stack · updated 2026-03-13*
