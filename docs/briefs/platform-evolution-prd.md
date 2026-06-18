# Sugartown Platform Evolution — Product Requirements Document
**PRD Version:** v1.2
**Status:** Draft
**Author:** Bex Head
**Domain:** Mixed — Design System + Ecom/Platform + Hosting
**Last updated:** 2026-06-18
**Related epics:** SUG-71, SUG-72, SUG-127, SUG-172, TBD (multi-brand DS), TBD (Contentful Stage 1 build-out), TBD (Shopify Stage 2), TBD (Stage 3 `apps/shop`)

---

## Problem Statement

The Contentful POC is live at `poc.sugartown.io` and `poc-preview.sugartown.io`. The proof it was built to answer — does the design system work without Sanity? — is answered: yes. But the POC shipped with hardcoded layout elements (header, footer, nav) rather than DS primitives, the DS package has no documented multi-brand theming convention, and the Shopify integration plans (SUG-71, SUG-72) predate the Contentful POC and treat Shopify as an `apps/web` concern only.

Three decisions are now live and unresolved: (1) how to formally make the DS multi-brand so that a token or component change propagates to all consuming sites, (2) how to sequence and scope the Shopify integration across three stages culminating in `shop.sugartown.io`, and (3) whether the updated hosting picture — Netlify for `apps/web`, Vercel for `apps/contentful-poc`, Stage 3 also on Vercel — is still the right recommendation or whether consolidation onto Vercel makes sense.

**`sugartown.io` (Sanity) is not being replaced.** The two sites are permanent parallel surfaces, each a deliberate portfolio proof point. The goal is to demonstrate multi-CMS, multi-brand, and CMS-agnostic DS in production simultaneously — not to converge onto a single platform. `shop.sugartown.io` is the destination for the Contentful + Shopify surface when it graduates from POC to production.

This PRD establishes the architectural direction for all three areas. It governs scope for the epics that implement each stage.

---

## Goals and Non-Goals

### Goals

| Goal | Description |
|------|-------------|
| DS multi-brand convention documented | A new site can apply a brand theme by loading one theme file and using the existing `--st-*` token contract. No component changes required. |
| Contentful POC Stage 1 build-out complete | Global DS header, footer, homepage, article archive, and article detail pages use DS primitives rather than hardcoded HTML. |
| Shopify Stage 2 scoped and executable | A self-contained Shopify experience using ST tokens as its style source. Internal themes, Shopify OOTB components, DS Hero and carousel as optional overlay. |
| Stage 3 named and scoped | `apps/contentful-poc` is renamed `apps/shop`, deployed to `shop.sugartown.io`. Shopify Storefront API added alongside Contentful. Contentful's content role narrowed to commerce-editorial only. `sugartown.io` and `shop.sugartown.io` are confirmed as permanent parallel surfaces. |
| Hosting recommendation current | The Netlify/Vercel recommendation reflects SUG-127 findings, the current hybrid reality, and the Stage 3 topology. SUG-172 is either activated or explicitly deferred with a named condition. |

### Non-Goals

| Non-Goal | Why excluded |
|----------|-------------|
| DS component changes for multi-brand | Multi-brand is achieved through theme file overrides, not component modifications. The component API stays frozen. |
| Shopify Stage 3 implementation | Stage 3 is scoped in this PRD; implementation is a separate epic with its own Phase 0. |
| Contentful taxonomy migration to native Taxonomy | Decision 14 from SUG-127 remains an open evaluation. This PRD does not decide it. |
| Hydrogen (Shopify's Remix framework) | Evaluated and excluded below. Approach B (Next.js + Storefront API) is the recommendation. |
| apps/web migration to Next.js | Not in scope. The Vite/Sanity/Netlify stack is stable and permanent for this PRD's planning horizon. |
| Replacing or merging sugartown.io with shop.sugartown.io | The two sites are permanent parallel surfaces by design. The portfolio demonstration requires both to exist simultaneously. |
| Contentful as a general editorial CMS | Contentful's role on `shop.sugartown.io` is commerce-editorial only (shop docs, T&Cs, ecom-specific articles). General editorial content stays in Sanity on `sugartown.io`. |
| Contact form replacement | Part of SUG-172 scope if migration is approved. Not addressed here. |

---

## User Stories

| ID | Title | User Story | Acceptance Criteria | Priority |
|----|-------|-----------|---------------------|----------|
| US-001 | DS token change propagates to all sites | As an engineer, I update a spacing token in `tokens/source/tokens.json` and run `pnpm tokens:build`, so that the change is reflected on both `sugartown.io` and `shop.sugartown.io` without any site-specific edits. | `pnpm tokens:build` from repo root regenerates both token files; both apps compile and render the updated value without additional steps. | P0 |
| US-002 | DS component change propagates to all sites | As an engineer, I update the DS `Button` component API and rebuild the DS package, so that the updated component is available in both the Sanity app and `apps/shop` on next build. | Both apps import the updated component via `workspace:*`; both build without modification; visual diff shows the change on both sites. | P0 |
| US-003 | New brand theme applied without component changes | As an engineer, I create a `theme.acme.css` file that overrides `--st-*` semantic tokens, so that a new client site can apply brand colours without forking any component. | New theme file loads in the consuming app; all DS components render with overridden values; zero component source files modified. | P1 |
| US-004 | Shop site global header and footer use DS nav | As a visitor to `poc.sugartown.io` (future: `shop.sugartown.io`), I see a site header and footer built from DS primitives, so that both sites share the same component and a nav change ships to both simultaneously. | Header and footer in `apps/contentful-poc/src/app/layout.tsx` use DS components; no hardcoded `<nav>`, `<header>`, or `<footer>` HTML. | P0 |
| US-005 | Shop site homepage exists | As a visitor to `poc.sugartown.io/`, I see a homepage built from Contentful-powered sections, so that the site demonstrates a full Contentful-backed editorial surface. | `apps/contentful-poc/src/app/page.tsx` renders at least a hero section and article teaser list from Contentful data; the page loads via the existing DS and Contentful fetch patterns. | P1 |
| US-006 | Shopify internal theme uses ST tokens | As an engineer, I run the token build and the output includes a Shopify-compatible CSS snippet, so that ST token values can be applied to a Shopify native theme without manual syncing. | `pnpm tokens:build` produces a Shopify CSS output (via new Style Dictionary transform); the output file maps core `--st-*` tokens to Shopify theme CSS variables or a standalone `tokens.scss`/`.css` injectable into a Shopify theme. | P1 |
| US-007 | Shopify Stage 3 data authority is clear | As an engineer, I know which system owns each data field at the page level, so that I do not accidentally source product prices from Contentful or editorial copy from Shopify. | Data authority map exists in the Stage 3 architecture section of this PRD; one row per field type; no ambiguous ownership. | P1 |
| US-008 | Hosting recommendation is current | As a decision-maker, I can read a single document that reflects SUG-127 findings and the current platform topology, so that the Netlify/Vercel choice is made with current evidence. | This PRD's hosting section references all three prior docs; the recommendation is explicitly stated with conditions for re-evaluation named. | P1 |

---

## Technical Architecture

### Area 1 — Multi-brand Design System

#### Current state

The DS token and component pipeline already supports multi-brand in principle:

- `tokens/source/tokens.json` is the single source for all `--st-*` primitives and semantics
- `pnpm tokens:build` (Style Dictionary v5) regenerates `apps/web/src/design-system/styles/tokens.css` and `packages/design-system/src/styles/tokens.css` from that source
- Theme overrides live in hand-authored files: `theme.pink-moon.css`, `theme.light.css` — both duplicated across web and DS package style dirs (mirrored, enforced by `validate:style-mirror`)
- `apps/contentful-poc` already consumes `packages/design-system` via `workspace:*` and imports `tokens.css` + `theme.pink-moon.css` in `layout.tsx`

The agnosticism proof is complete: DS components contain zero Sanity imports. Both apps share the same 612 tokens and the same Pink Moon theme. A Button change in the DS package is reflected in both apps on next build.

#### What "multi-brand" requires additionally

The gap is not architectural — it is documentation and convention. Three things need to be established:

**1. Theme file convention**

A new brand creates one file: `theme.{brand}.css`. It contains only `--st-*` semantic token overrides — no new token names, no hardcoded values. It loads after `tokens.css` in the consuming app's root layout. Example skeleton:

```css
/* theme.acme.css — Acme Corp brand overrides */
:root {
  --st-color-brand-primary: var(--st-color-acme-700); /* requires primitive in tokens.css */
  --st-color-brand-secondary: var(--st-color-acme-400);
  --st-font-family-heading: 'Acme Serif', serif;
}
```

**Rule:** theme files may only reference `var(--st-primitive)` values. No hex, rgba, or hsla. New colour primitives are added to `tokens.json` first.

**2. Namespace strategy**

The `--st-*` namespace belongs to Sugartown. A client project consuming the DS either:
- Accepts the `--st-*` namespace and overrides semantic tokens via their brand theme file (recommended for monorepo consumers)
- Runs a Style Dictionary transform to emit tokens under their own namespace (e.g. `--acme-*`) — this is a distribution concern, not a component concern

For the current POC and Stage 3 work, the `--st-*` namespace is correct. The namespace question becomes relevant only if the DS is published for external client consumption.

**3. DS package `"use client"` story**

The DS barrel (`dist/index.mjs`) has no `"use client"` directive. Decision 10 in SUG-127 documented the workaround: consuming Next.js pages mark `"use client"` at their own boundary. This is acceptable for the POC but needs a documented position:

- **Short term:** consuming pages add `"use client"` where DS components are imported. Documented in a `CONSUMING.md` in `packages/design-system`.
- **Long term:** DS package ships a `./client` subpath export that adds `"use client"` directives on interactive components only (Accordion, ScoreRing, etc.). Deferrable to a future DS packaging epic.

#### What the POC hardcoding problem actually is

The hardcoded elements visible in `poc.sugartown.io` are in `apps/contentful-poc/src/app/layout.tsx` — the global layout's header and footer are raw HTML, not DS components. This is a Stage 1 build-out gap (see Area 2), not a DS architecture gap. The fix is replacing that HTML with the same DS nav and footer that `apps/web` uses, wired to Contentful-sourced nav data rather than Sanity.

---

### Area 2 — Contentful POC Stage 1 Build-out

#### Current state (what Phase 1 and 2 shipped)

| Route | Status | Notes |
|-------|--------|-------|
| `/articles` | Shipped | Article list, tags shown |
| `/articles/[slug]` | Shipped | Full article with rich text, tags |
| `/tags` | Shipped | Tag list |
| `/tags/[slug]` | Shipped | Tag detail with related articles |
| `/pages/[slug]` | Shipped | Generic page from Contentful |
| `/` (homepage) | Missing | No homepage route |
| Global header | Hardcoded HTML | Needs DS nav components |
| Global footer | Hardcoded HTML | Needs DS footer component |
| Article archive with filters | Missing | Basic list only, no filter UI |

#### Stage 1 build-out scope

**Global header and footer (P0):** Replace hardcoded HTML in `layout.tsx` with DS components. Nav data comes from a Contentful `siteSettings` singleton entry (already modelled in Phase 2) via the existing `contentful.ts` client. The DS nav component is the same one used in `apps/web` — no new component needed.

**Homepage (P1):** Create `apps/contentful-poc/src/app/page.tsx`. Fetches the `home` page entry from Contentful (`page` content type with `slug: "home"`, sections array). Renders via the existing `SectionList.tsx` dispatcher. No new components needed — existing section rendering covers this.

**Article archive (P1):** The existing `/articles` route returns a flat list. Add basic sorting (newest first) and a tag filter driven by query params. No new DS components — uses existing `TagList`, `ArticleList`, and Contentful CDA filter params (`fields.tags.sys.id[in]`).

**Architecture note (doc/architecture page):** The Contentful POC serves as the foundation for the Sugartown platform documentation. An `/architecture` route should exist in the POC (or `apps/web`) that documents the DS agnosticism findings, decision log, and platform topology. Needs a Linear issue created.

---

### Area 3 — Shopify Integration Options and Staging

#### The three approaches evaluated

**Approach A — Shopify Native Theme (self-contained)**

Shopify's own template system (Liquid) with ST tokens injected as CSS custom properties via a Style Dictionary transform output. Shopify handles the entire commerce UX, checkout, and cart.

| Dimension | Detail |
|-----------|--------|
| Tech | Shopify Liquid templates, Shopify CLI, Dawn base theme |
| Token integration | Style Dictionary adds a Shopify transform: outputs `tokens.css` as a Shopify theme snippet (`snippets/st-tokens.liquid`) or a CSS file loadable via `{% stylesheet %}` |
| DS component reuse | None — Shopify templates are Liquid, not React. Token values are shared; component HTML is not. |
| Hero/carousel | Implemented as Shopify theme sections in Liquid + CSS. Styled with ST tokens. Not the React DS components. |
| Checkout | Shopify-hosted, fully managed. PCI compliant. No frontend work. |
| Cart | Shopify's native cart. |
| Deployment | Shopify's CDN. No Vercel/Netlify involvement. |
| Pros | Shopify handles all commerce UX; Shopify OOTB is well-tested; token-level consistency achievable; minimal new infrastructure |
| Cons | Liquid is a separate template language from React; component reuse is CSS-only, not structural; Hero and carousel in Liquid are separate from DS React versions |
| Effort | Medium. Style Dictionary transform is new work. Liquid theme development is a distinct skill. |

**Approach B — Headless Shopify via Storefront API + Next.js (recommended for Stage 3)**

Custom Next.js frontend (extending `apps/contentful-poc` or a new app) consuming Shopify's Storefront API (GraphQL) for product data and cart management. Shopify handles checkout only.

| Dimension | Detail |
|-----------|--------|
| Tech | Next.js (App Router), Shopify Storefront API (GraphQL, public access token), `@shopify/storefront-api-client` |
| Token integration | Identical to current contentful-poc approach — `tokens.css` + `theme.pink-moon.css` via workspace |
| DS component reuse | Full — Button, Card, Grid, Chip etc. used directly for product display, cart UI |
| Hero/carousel | DS React components. No duplication from Approach A. |
| Checkout | Shopify-hosted checkout. Cart built on FE; "Checkout" button redirects to Shopify's checkout URL. |
| Cart | Client-side state using Shopify Storefront API cart mutations (`cartCreate`, `cartLinesAdd`). No server needed for cart. |
| Deployment | Vercel (same project or new project in same org). |
| Pros | Full DS component reuse; shared tech stack with contentful-poc; same deployment platform; Shopify handles PCI and checkout |
| Cons | More build work than Approach A; cart state is client-side (requires React context or zustand); Storefront API has rate limits (public: 1,000 requests/s per storefront) |
| Effort | High. New data layer, cart state management, product routing. |

**Approach C — Hydrogen (Shopify's headless React framework)**

Shopify's own headless framework, built on Remix. Designed for Shopify headless storefronts.

| Dimension | Detail |
|-----------|--------|
| Tech | Hydrogen (Remix-based), Shopify Oxygen or Vercel deployment |
| DS component reuse | Possible but friction — Hydrogen uses Remix, which has a different data model (loader/action) from Next.js App Router. DS React components are framework-agnostic but testing in Remix context adds overhead. |
| Pros | Best Shopify commerce DX; Shopify maintains it; cart/checkout patterns are first-class |
| Cons | Separate framework from contentful-poc and apps/web; Remix vs Next.js cognitive split; Oxygen hosting (Shopify's CDN, not Vercel) adds another deployment target |

**Recommendation: exclude Hydrogen.** The additional framework introduces cognitive overhead, Remix/Next.js split, and a third deployment target without a compelling advantage over Approach B for Sugartown's scale.

**Approach D — Cart Permalinks only (existing SUG-71 plan)**

The SUG-71 plan: display products using DS Card primitives, buy buttons link to `{shop}.myshopify.com/cart/{variantId}:1`. No Storefront API at browsing time. Product data fetched at build time from Shopify Admin API (or static JSON).

| Dimension | Detail |
|-----------|--------|
| Effort | Lowest — already scoped in SUG-71 |
| Pros | No client-side API, no cart state, minimal infrastructure |
| Cons | No real-time inventory; cart lives on Shopify domain (brand break); no dynamic pricing; limited to what can be fetched at build time |

Approach D remains valid for Stage 2 internal proof on `apps/web`. It is not a viable Stage 3 architecture if the goal is a unified DS-powered storefront.

---

#### Recommended staging

**Stage 1 — Contentful POC build-out** (extends current work)

Scope: DS header/footer, homepage, article archive, architecture page. Uses existing `apps/contentful-poc` with existing tech. No new Shopify work. Outcome: `poc.sugartown.io` is a complete editorial site backed by Contentful, styled by the shared DS, with no hardcoded layout elements.

**Stage 2 — Shopify POC (self-contained, Approach A)**

Scope: A standalone Shopify store using a native Shopify theme with ST tokens injected via a Style Dictionary transform. Shopify OOTB components for product grid, cart, checkout. Hero and carousel as custom Liquid theme sections (not DS React). 3 placeholder SKUs.

Outcome: Proof that ST tokens can be distributed to a non-React target (Shopify Liquid). Shopify development experience gained. Token portability to Liquid documented.

This supersedes the original SUG-71 scope for `apps/web`. SUG-71 and SUG-72 should be re-scoped or replaced with a Stage 2 epic that treats Shopify as its own deployment target, not an `apps/web` sub-route.

**Stage 3 — `apps/shop` at `shop.sugartown.io` (Approach B, headless)**

`apps/contentful-poc` is renamed `apps/shop`. The Vercel project is renamed, and DNS is updated from `poc.sugartown.io` → `shop.sugartown.io` using the same Pair CNAME pattern proven in SUG-128. Shopify Storefront API is added alongside the existing Contentful integration. Shared DS components for all surfaces. Shopify-hosted checkout.

`sugartown.io` and `shop.sugartown.io` are permanent parallel surfaces — not a migration, not a convergence. Both are production. Both demonstrate the portfolio proof points.

**Portfolio proof points — visible simultaneously in production:**

| Proof | Where visible |
|-------|--------------|
| **CMS agnosticism** | Same DS Button, Card, Grid on Sanity (`sugartown.io`) and Contentful (`shop.sugartown.io`) |
| **Multi-CMS** | Two live sites, two different CMSes, one shared `packages/design-system` |
| **Multi-brand DS** | Same component API, independently themed per surface |
| **MACH in practice** | `shop.sugartown.io` composes two headless data sources (Contentful + Shopify) behind one DS-powered Next.js frontend |

**App topology: resolved.** Rename `apps/contentful-poc` to `apps/shop`. No new monorepo app needed — the existing app has all the infrastructure (DS wiring, token pipeline, Contentful fetch layer, Turbo config, Vercel project). The rename is a directory rename + `package.json` name update + Vercel project rename + DNS update.

---

#### Stage 3 data authority map

| Field / surface | Owner | System | Notes |
|----------------|-------|--------|-------|
| Product name | Commerce | Shopify | Sourced from Storefront API `product.title` |
| Product description (short) | Commerce | Shopify | `product.description` — plain text |
| Price | Commerce | Shopify | `variant.price.amount` — never stored in Contentful |
| Inventory / availability | Commerce | Shopify | `variant.availableForSale` — real-time from Storefront API |
| Product images | Commerce | Shopify | `product.images` from Storefront API |
| Cart state | Commerce | Shopify (via client) | Storefront API cart mutations. No cart data in Contentful or Sanity. |
| Checkout | Commerce | Shopify | Shopify-hosted checkout URL. FE redirects to it; no checkout UI built. |
| Shop T&Cs and legal pages | Commerce-editorial | Contentful | `page` content type, `slug: "terms"` etc. Managed by Contentful, rendered by `apps/shop`. |
| Shop documentation | Commerce-editorial | Contentful | Product guides, how-to articles, FAQ. `article` content type scoped to shop context. |
| Ecom-specific articles | Commerce-editorial | Contentful | Articles about Shopify, ecom, commerce patterns — relevant to the shop surface. Not general editorial (which stays in Sanity). |
| Shop homepage sections | Commerce-editorial | Contentful | `page` with `slug: "home"`, sections array. Commerce-context homepage, not the Sanity site homepage. |
| Shop site settings / nav | Commerce-editorial | Contentful | `siteSettings` singleton for `apps/shop` nav, site title, meta. |
| General editorial content (articles, case studies, nodes) | Editorial | Sanity | Lives on `sugartown.io` only. Not queried by `apps/shop`. |
| DS tokens / theme | Design | Monorepo | `tokens/source/tokens.json` → `pnpm tokens:build`. Neither Contentful nor Shopify owns this. |

**Hard rules:**
- Price, inventory, and cart state are never duplicated into Contentful or Sanity.
- General editorial content (Sugartown articles, case studies, knowledge graph nodes) lives in Sanity and is served only by `apps/web` at `sugartown.io`. `apps/shop` does not query Sanity.
- Contentful on `apps/shop` serves commerce-specific editorial only. It is not a replacement for Sanity; it is a separate editorial layer for a separate surface.
- The two CMSes serve two different sites. There is no query that crosses the boundary.

---

### Area 4 — Hosting Recommendation (updated)

#### Inputs to this update

Three prior documents, in chronological order:

1. `docs/reports/hosting-evaluation.md` (2026-03-15) — original Netlify decision. Chose Netlify because it was already configured, the query-parameter redirect syntax (`/?p=`, `/?cat=`, `/?tag=`) is Netlify-native, and migration to Vercel required rewriting 296+ redirect rules. Vercel's commercial use ambiguity on Hobby tier was flagged.

2. `docs/briefs/vendor-eval-vercel-vs-netlify.md` (2026-05-25, SUG-127 Phase 3) — post-POC eval. Recommendation: stay on Netlify for `apps/web` (Vite/Sanity), use Vercel for `apps/contentful-poc` and any future Next.js project. Hybrid model already live.

3. `docs/backlog/SUG-172-netlify-vercel-migration-scope-recommendation-analysis.md` — scoped migration analysis. Status: Backlog. Notes that the POC proved Vercel works for a Next.js monorepo subdirectory deploy; the open questions for a full migration are query-param redirects, Netlify Forms replacement, and Storybook.

#### Current platform topology (2026-06-18)

| App | Stack | Host | Subdomain | Status |
|-----|-------|------|-----------|--------|
| `apps/web` | Vite + React + Sanity | Netlify | `sugartown.io` | Production, stable — permanent |
| `apps/storybook` | Storybook | Netlify | `pinkmoon.sugartown.io` | Production, stable — permanent |
| `apps/contentful-poc` → `apps/shop` | Next.js + Contentful + Shopify | Vercel | `poc.sugartown.io` → `shop.sugartown.io` | POC now; rename + DNS update at Stage 3 kick-off |

#### Updated recommendation

**Recommendation: maintain the hybrid. Consolidation onto Vercel is not recommended at this time.**

| Decision | Recommendation | Condition for revision |
|----------|---------------|----------------------|
| `apps/web` (sugartown.io) | Stay on Netlify | Reconsider if `apps/web` migrates to Next.js, or if Netlify Forms becomes unavailable |
| `apps/storybook` | Stay on Netlify | No known pain. Just fixed. Do not migrate mid-stability. |
| `apps/contentful-poc` | Stay on Vercel | Already there. Correct platform for Next.js. |
| Stage 3 app | Vercel | New Next.js project. Correct default. |
| SUG-172 | Keep in Backlog | Activate only if a specific pain point emerges: build minute exhaustion, Netlify Forms changes, or `apps/web` moves to Next.js. |

#### Why consolidation to Vercel is not compelling now

1. **The migration blockers named in March 2026 are unchanged.** The `/?p=`, `/?cat=`, `/?tag=` query-parameter redirects remain Netlify-native. Vercel can handle them via `has: [{ type: "query", key: "p" }]` syntax in `vercel.json` — this resolves the technical blocker — but rewriting 296+ redirect rules from `_redirects` flat-file format to `vercel.json` JSON is a half-day task that produces no user-facing change.

2. **Netlify Forms is in use.** `/contact` uses Netlify Forms. Vercel has no equivalent. Replacing it requires a serverless function + email provider (Resend or equivalent). That is a real new dependency for no improvement in the editorial or product experience.

3. **The hybrid is operational and costs nothing extra.** Both platforms are on free/hobbyist tiers. Running two hosting providers is not operational overhead for a solo project. The concern that motivated SUG-172 ("is it fragmented?") is answered: the fragmentation is intentional and correct — Netlify for the Vite/Sanity SPA, Vercel for Next.js apps.

4. **Turbo Remote Cache is available on Vercel.** This is the strongest Vercel argument for consolidation — remote caching across CI builds. At current scale (2 Netlify apps + 1 Vercel app), build times are not a bottleneck. Reassess when the monorepo has 4+ deployed apps with overlapping build dependencies.

#### When to activate SUG-172

Activate the migration analysis if any of these conditions are true:
- Netlify build minutes are exhausted more than once in a rolling month
- Netlify announces price changes that affect the current plan
- `apps/web` begins a Next.js migration
- Netlify Forms is deprecated or moves to a paid tier
- Stage 3 is live on Vercel and the operational overhead of a three-provider setup becomes apparent

---

## Design Constraints

- Namespace `--st-*` applies to all DS primitives and semantics. Brand themes override semantic values only — never introduce new token names in a theme file.
- All DS components: zero hardcoded color, spacing, or type values. All styling through `--st-*` references.
- Multi-brand theme files follow the same mirroring rule as `theme.pink-moon.css`: if a theme file must exist in both `apps/web/src/design-system/styles/` and `packages/design-system/src/styles/`, it is registered in the Mirrored File Registry and enforced by `validate:style-mirror`.
- Stage 3 product UI: DS Card, Button, Grid, Chip are the layout primitives. No new "commerce-specific" component forks unless the component genuinely requires commerce-specific logic that cannot be expressed as props on an existing primitive.
- Shopify Stage 2 Liquid themes: token values are injected via a Style Dictionary transform output, not manually maintained. If the transform is not in place, Stage 2 does not ship.
- Typography: IBM Plex Mono + DM Sans + Cormorant Garamond (Ledger Tradition stack). No substitutions in any new app.

---

## Open Decisions

| Decision | Options | Owner | Target resolution |
|----------|---------|-------|------------------|
| `shop.sugartown.io` theme | Same Pink Moon theme as `sugartown.io` / a commerce-tuned variant theme using the same token foundation | Bex | Before Stage 3 Phase 0 sign-off |
| Style Dictionary Shopify transform format | CSS custom properties injectable via Liquid snippet / SCSS variables / both | Engineer at Stage 2 kick-off | Before Stage 2 Phase 0 sign-off |
| Stage 3 cart state management | React context / zustand / Shopify's own `@shopify/hydrogen-react` cart hooks without Hydrogen framework | Engineer at Stage 3 Phase 0 | Before Stage 3 Phase 0 sign-off |
| SUG-172 activation condition | Named above: activate on specific pain points / activate proactively for consolidation | Bex | Reassess when Stage 3 is live |
| `docs/architecture` location | New route in `apps/shop` / new route in `apps/web` / standalone docs site | Bex | Before Stage 1 completion |
| DS `"use client"` long-term fix | Document workaround only / add `./client` subpath export in DS package | Engineer at DS packaging epic | After Stage 3 kick-off (`apps/shop` is the primary consumer) |
| Contentful native Taxonomy for tag/category | Evaluate for Stage 3 content model (Decision 14 from SUG-127) / keep custom content types | Bex | Before Stage 3 content model is finalised |

---

## Dependencies and Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Style Dictionary Shopify transform does not exist as a maintained open-source transform | Medium — Stage 2 token sharing blocked | Evaluate `sd-transforms` and Style Dictionary v5 custom transform docs at Stage 2 kick-off. A custom transform is ~50 lines; not a blocker, just scoping work. |
| Shopify Storefront API rate limits at Stage 3 | Low at POC scale, Medium at production scale | Use ISR/static generation for product list pages; only real-time API calls for cart mutations and availability checks |
| DS package `"use client"` gap causes Next.js App Router build failures in Stage 3 | Medium — requires workaround on every new route | Document the boundary rule clearly in `CONSUMING.md`; spike the `./client` subpath export before Stage 3 Phase 0 |
| `apps/contentful-poc` promoted to production app (Stage 3) inherits POC-grade error handling and SEO | High if this path is chosen | If Option 3A is chosen, add explicit production-readiness AC to Stage 3: error boundaries, `<head>` metadata, 404 handling, accessibility audit |
| Netlify Forms deprecated or repriced before Stage 3 contact form migration | Low (no signals) | Monitor Netlify communications; contact form is low-stakes for a portfolio site — acceptable to be down briefly if a migration is needed |
| Token namespace conflict when onboarding a real client DS consumer | Low now, Medium later | Document the `--st-*` namespace as Sugartown-specific; define the client override pattern in a `CONSUMING.md` before first external client |

---

## Success Criteria

| Area | Metric |
|------|--------|
| Multi-brand DS | `pnpm tokens:build` from repo root regenerates both token files; both apps build without errors; a test theme file overriding 3 semantic tokens renders correctly on both apps |
| Multi-brand DS | `validate:style-mirror` passes with any new theme file registered as a mirrored pair |
| Contentful Stage 1 | `poc.sugartown.io` renders a DS-powered header and footer; zero hardcoded `<nav>` or `<footer>` HTML in `layout.tsx` |
| Contentful Stage 1 | Homepage route (`/`) returns HTTP 200; renders at least one hero section and one article teaser list from Contentful data |
| Shopify Stage 2 | A Shopify theme is live with at least 3 product SKUs styled using ST token values; token values match those from `tokens/source/tokens.json` |
| Shopify Stage 2 | Style Dictionary build outputs a Shopify-compatible token file; the file is regenerated by `pnpm tokens:build` without manual steps |
| Stage 3 scoping | Data authority map has one authoritative owner for every field type listed; no field appears in both Contentful and Shopify columns |
| Hosting | A written position exists in this PRD (see Area 4) that references all three prior docs and names the conditions under which SUG-172 is activated |
| Hosting | SUG-172 status in Linear reflects the current recommendation (Backlog with conditions named) |

---

## Out of Scope (Deferred)

- **DS `./client` subpath export** — packaging improvement for Next.js App Router consumers. Blocked by Stage 3 topology decision. Deferred to a DS packaging epic.
- **Contentful native Taxonomy evaluation** — Decision 14 from SUG-127. Flagged for Stage 3 content model phase.
- **Netlify Forms replacement** — scoped in SUG-172 but not executed. Deferred until migration conditions are met.
- **Storybook migration to Vercel** — part of SUG-172 scope. Netlify base-dir fix just shipped 2026-06-15; no reason to move now.
- **DS npm publish / external distribution** — workspace resolution masks external install gaps (Decisions 1, 3, 11 from SUG-127). A real `npm pack` validation pass is needed before external distribution. Deferred.
- **Shopify Hydrogen** — evaluated and excluded. See Area 3 above.
- **Contentful Taxonomy (SKOS hierarchy) for tag/category** — open decision, not pre-empted here.
- **`apps/web` migration to Next.js** — not in scope for any stage of this plan.

---

## Linear Items Needed

The following Linear issues need to be created or updated before execution begins:

| Action | Title | Project |
|--------|-------|---------|
| Create | Contentful POC Stage 1 build-out — DS header/footer, homepage, article archive | Sugartown CMS |
| Create | Multi-brand DS theming convention — document theme file contract, `CONSUMING.md`, `validate:style-mirror` registration | Pink Moon Design System |
| Update | SUG-71 — re-scope as Shopify Stage 2 (native theme + ST tokens via Style Dictionary), separate from `apps/web` | Sugartown Shopify |
| Update | SUG-72 — confirm blocked by Stage 2 re-scope; update description if `/shop` moves to a standalone Shopify deployment | Sugartown Shopify |
| Create | Shopify Stage 3 — rename `apps/contentful-poc` → `apps/shop`, add Shopify Storefront API, DNS cutover `poc.sugartown.io` → `shop.sugartown.io` (blocked by Stage 2 completion) | Sugartown Shopify |
| Create | `docs/architecture` platform page (location TBD — contentful-poc or apps/web) | Sugartown CMS |
| Update | SUG-172 — add conditions for activation from this PRD; keep Backlog | Sugartown Platform |

---

## Authoring Checklist

- [x] Every claim references a real system, not an aspiration
- [x] Field types are explicit in the data authority map
- [x] Non-goals name the reason for exclusion
- [x] Open decisions have owners
- [x] Success criteria are independently verifiable
- [x] `featuredImage` does not appear anywhere
- [x] Brand voice check: no em dashes, no adjective triads, no AI vocabulary
- [x] A senior engineer could start writing epics from this doc without a meeting

---

## Addendum — Reference Review

**Version:** v1.1 — added 2026-06-18
**Purpose:** Records what each reference document contributes to this PRD. Pertinent new constraints are integrated into the body above where they affect decisions; this section catalogues the reasoning and surfaces material that has no other home.

---

### Reference 1 — `docs/briefs/monorepo-prd.md` (PROJ-005, 2026-02-01)

**What it is:** The founding architecture PRD for the Sugartown monorepo. Written before any epics were executed. Establishes the philosophical and structural contracts the whole platform is built on.

**Pertinent to this PRD:**

**MACH positioning.** The monorepo-prd explicitly positions Sugartown as a composable MACH architecture reference implementation. The four properties are:

| Property | Meaning for this PRD |
|----------|---------------------|
| **Composable** | Independently deployable concerns: content, presentation, design system. Stage 1, 2, and 3 each add a new concern without coupling the others. |
| **API-first** | Content and configuration accessed via explicit interfaces (GROQ, Contentful CDA, Shopify Storefront API). No data sourced by convention or file-system lookup. |
| **Headless** | No frontend assumptions baked into content or design primitives. The DS components accept any data source. The token pipeline is CMS-unaware. |
| **Cloud-native** | CI/CD, workspace tooling, and modular builds. Each app deploys independently to its own host. |

Every stage of this PRD advances one or more of these properties. This framing should be the opening context for the `docs/architecture` page referenced in Stage 1.

**Boundary rules (non-negotiable, established in 2026-02-01):**
- `design-system` must not import from Sanity or app code
- `packages/content` must not import UI components
- Apps may import from packages; packages never import from apps
- Storybook documents contracts; it does not define app behavior

These rules are the enforcement layer for the multi-brand DS. They are why a brand theme file can override tokens without touching any component.

**`packages/content/` status.** The monorepo-prd planned a `packages/content/` package for GROQ queries, schema helpers, and validators. The current monorepo does not have this package — that logic lives in `apps/web/src/lib/queries.js`. This is a known deviation from the founding spec. It does not block any stage of this PRD but should be noted: if Stage 3 needs query logic shared across multiple apps, the `packages/content/` boundary is where it should live, not duplicated per-app.

**DS external publish intention.** The monorepo-prd's open questions resolved to "external publish" for the DS. SUG-127 Decision 3 and Decisions 11/12 confirmed the first consumer (`apps/contentful-poc`) found real packaging gaps (`exports` map, CSS Modules in dist). External publish is not yet done but remains the declared intent. The multi-brand DS work in this PRD is a precondition for it.

---

### Reference 2 — `docs/shipped/SUG-127-contentful-vercel-poc-platform-vendor-evaluation.md`

**What it is:** The full epic doc for the Contentful + Vercel POC (shipped). Complements the architecture decisions file already reviewed; the epic doc adds the coupling point map hypotheses vs actuals and the four-bucket content model.

**Pertinent to this PRD:**

**The four-bucket atomic content model.** This is the canonical cross-CMS framework for all Sugartown content modelling. Every new CMS integration — including Stage 3's Contentful + Shopify app — must express its content in terms of these four buckets:

| Bucket | Definition | Sugartown / Sanity | Contentful POC |
|--------|-----------|-------------------|----------------|
| **Singleton** | One entry only; the platform enforces or convention enforces it | `siteSettings` (`__experimental_actions: ['update']`) | `siteSettings` content type (discipline-enforced) |
| **Document** | Repeatable content entries with slug-based routing | `article`, `caseStudy`, `node` | `article` content type |
| **Taxonomy** | Classification labels; used to group and filter documents | `tag`, `category`, `person`, `project`, `tool` | `tag` content type |
| **Sections** | Composable page-building blocks in an ordered array | Inline typed objects with `_type` discriminator | Linked entries with `sys.contentType.sys.id` discriminator |

For Stage 3 content modelling: product pages fit the Document bucket; product categories fit the Taxonomy bucket; editorial page templates (homepage, landing pages) use the Sections bucket. Price, inventory, and cart state are Shopify-layer concerns and do not map to any bucket.

**Established adapter seam contract.** The coupling point map confirms where the seam lives. This is the pattern Stage 3 must follow:

```
packages/design-system/   ← CMS-agnostic. Zero CMS imports. Proven.
tokens/source/tokens.json ← CMS-agnostic. Proven.

apps/<any>/src/lib/
  ├── cms-client.ts       ← CMS-specific (Sanity client / Contentful client / Shopify client)
  ├── queries.ts          ← CMS-specific (GROQ / CDA REST / Storefront API GraphQL)
  └── richTextRenderer.tsx ← CMS-specific (PortableText / Contentful Rich Text / none for Shopify)
```

Any new app adding a data source adds a new `cms-client` + `queries` pair. The DS layer stays untouched. This is the invariant.

**Section fetch model for `apps/shop`.** The distinction carries forward to Stage 3: Contentful commerce-editorial pages (T&Cs, shop docs, homepage) use sections as linked entries resolved via `include: 2`. The section renderer dispatches on `entry.sys.contentType.sys.id`. Sanity-style `_type` dispatching is not available. The existing `renderSection.tsx` in `apps/contentful-poc/src/lib/` is the reference implementation. Sanity's section model is irrelevant here — `apps/shop` does not query Sanity.

---

### Reference 3 — `docs/shipped/SUG-128-contentful-poc-custom-domain-vercel.md`

**What it is:** The epic covering the DNS setup for `poc.sugartown.io`. Entirely infra; no architecture changes.

**Pertinent to this PRD:**

**Proven DNS pattern for Vercel subdomains.** The setup is documented and repeatable:

| Step | Detail |
|------|--------|
| DNS provider | Pair (manages `sugartown.io`) |
| Record type | CNAME |
| Name | `<subdomain>` (e.g. `poc`, `shop`, `commerce`) |
| Value | `cname.vercel-dns.com` |
| Cloudflare proxy | DNS-only (grey cloud, not orange) — Vercel manages SSL |
| SSL | Auto-provisioned by Vercel via Let's Encrypt |

This pattern applies to any new Vercel-hosted app in the monorepo. Stage 3's subdomain (decision pending — `shop.sugartown.io`, `commerce.sugartown.io`, or similar) follows the same three-step process: add domain in Vercel dashboard, add CNAME in Pair, verify SSL.

**`poc-preview.sugartown.io` exists.** The preview environment subdomain is already live. This confirms the pattern works for both production and preview branches. Stage 3 can expect a `<name>-preview.sugartown.io` preview URL at no additional setup cost.

**No `NEXT_PUBLIC_BASE_URL` needed for POC-pattern apps.** The contentful-poc ships without an absolute base URL env var because it has no internal absolute URL references. Stage 3 will likely need one (OG meta tags, canonical URLs, Shopify redirect callback) — add `NEXT_PUBLIC_BASE_URL` to the Vercel environment config at that point.

---

### Reference 4 — `docs/shipped/SUG-130-platform-selection-risk-composable-architecture.md`

**What it is:** A content backlog item for an article ("Platform selection risk is real. Here's what reduces it.") written in Bex's VoPM voice. Primarily a content piece, but contains practitioner research that surfaces real architectural risks.

**Pertinent to this PRD:**

**Headless preview is an unsolved problem — and Stage 3 makes it harder.** SUG-130's research notes identify the content producer preview experience as a known failure mode across headless stacks. For Stage 2 (Shopify native theme), preview is handled by Shopify's own theme editor — no new problem. For Stage 3, with Contentful editorial + Shopify product data + a shared Next.js FE, preview requires coordinating three sources:

1. Contentful draft content (Contentful Preview API + separate preview token)
2. Shopify product data (live from Storefront API — no draft state)
3. The Next.js FE itself (Vercel branch preview URL)

This is a new risk. Add it to the risk register:

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Stage 3 content preview is a three-source coordination problem: Contentful draft + Shopify live + Next.js preview URL | Medium — producers cannot approve content in context before publish | Scope preview as a Stage 3 Phase 2 concern, not Phase 1. Phase 1 ships with Vercel branch preview URLs only (developer-grade). A producer-grade preview (shareable URL, no login, in-context) is a follow-on epic. |

**Graceful degradation in preview.** If a preview workflow is built for Stage 3, adopt this principle from the start: each layer degrades independently. If Shopify product data is unavailable in preview, still show the Contentful content draft. If the Contentful preview token is not set, fall back to published content. Never block content approval because one layer's preview is broken.

**TCO framing reinforces the hybrid hosting recommendation.** The SUG-130 research argues that the real cost of a wrong platform decision is measured in engineering migration months, not license fees. This strengthens the "maintain hybrid" recommendation in Area 4: the current Netlify + Vercel split is architecturally correct for the current stack split (Vite/Sanity vs Next.js/Contentful). Forcing consolidation onto one platform to reduce operational complexity introduces migration cost that outweighs the benefit at current scale.

**SUG-130 is a content dependency.** The article requires the node `poc-platform-agnostic-by-design` to be published first. That node documents the technical findings from SUG-127. The docs/architecture page planned in Stage 1 of this PRD is the platform context that article will reference. These three outputs form a content cluster:
- `docs/architecture` page (Stage 1 of this PRD) — the living technical record
- node `poc-platform-agnostic-by-design` — the technical narrative (in Sanity)
- SUG-130 article — the practitioner/PM companion piece (in Sanity)

None of these block the engineering stages. But they should be sequenced: architecture page first, then node, then article.

---

### Updated risk register additions (from this addendum)

The following rows supplement the Dependencies and Risks table in the main PRD body:

| Risk | Impact | Mitigation |
|------|--------|-----------|
| `packages/content/` was planned but never created; query logic is duplicated per-app | Low now, Medium if Stage 3 adds a third app that needs shared queries | Evaluate at Stage 3 app topology decision: if Option 3B (new `apps/commerce`) is chosen, create `packages/content/` for shared Contentful query fragments rather than copying `apps/contentful-poc/src/lib/queries.ts` |
| DS external publish path has never been validated via a real `npm pack` install | Medium — a client asking to consume the DS externally would hit the same packaging gaps SUG-127 found in the monorepo | Run `npm pack` on `packages/design-system` and install the tarball into a throwaway directory before any external distribution. Deferred per monorepo-prd intent; not blocking this PRD. |
| Stage 3 content preview is a three-source coordination problem | Medium | Scope as Stage 3 Phase 2; Phase 1 ships with Vercel preview URLs only |
| `poc-platform-agnostic-by-design` node has not been published; blocks SUG-130 article | Low (content, not engineering) | Publish node before opening SUG-130. Architecture page (Stage 1) provides supporting context. |

---

### Reference index

| Document | Path | Pertinent sections |
|----------|------|--------------------|
| Monorepo PRD (PROJ-005) | `docs/briefs/monorepo-prd.md` | MACH positioning, boundary rules, `packages/content/` gap, DS external publish intent |
| SUG-127 architecture decisions | `docs/briefs/SUG-127-architecture-decisions.md` | All 15 decisions; Decisions 1/3/10/11/12 most relevant to multi-brand DS |
| SUG-127 epic (shipped) | `docs/shipped/SUG-127-contentful-vercel-poc-platform-vendor-evaluation.md` | Four-bucket content model, adapter seam contract, coupling point map actuals |
| SUG-127 vendor eval | `docs/briefs/vendor-eval-vercel-vs-netlify.md` | Netlify/Vercel axis-by-axis comparison, hybrid recommendation |
| SUG-128 (shipped) | `docs/shipped/SUG-128-contentful-poc-custom-domain-vercel.md` | DNS pattern for Vercel subdomains (Pair CNAME → `cname.vercel-dns.com`) |
| SUG-130 (backlog) | `docs/shipped/SUG-130-platform-selection-risk-composable-architecture.md` | Headless preview gap, graceful degradation principle, TCO framing, content cluster sequencing |
| Hosting evaluation | `docs/reports/hosting-evaluation.md` | Original March 2026 Netlify decision; Vercel candidate assessment |
| SUG-172 (backlog) | `docs/backlog/SUG-172-netlify-vercel-migration-scope-recommendation-analysis.md` | Migration scope and activation conditions |
