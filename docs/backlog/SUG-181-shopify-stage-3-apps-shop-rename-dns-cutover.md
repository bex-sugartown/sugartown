---
**Epic:** SUG-181 — Shopify Stage 3 — rename apps/contentful-poc → apps/shop, add Shopify Storefront API, DNS cutover to shop.sugartown.io
**Linear Issue:** [SUG-181](https://linear.app/sugartown/issue/SUG-181/shopify-stage-3-rename-appscontentful-poc-appsshop-add-shopify)
**Status:** Backlog
**Priority:** ⬛ Deferred (blocked by SUG-179 + SUG-71 + SUG-72)
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-181 — Shopify Stage 3 — rename apps/contentful-poc → apps/shop, add Shopify Storefront API, DNS cutover to shop.sugartown.io

Rename `apps/contentful-poc` to `apps/shop`, add Shopify Storefront API integration for product catalogue and cart state, and cut over the subdomain from `poc.sugartown.io` to `shop.sugartown.io`. This is the MACH composition milestone.

## Background

Stage 3 is where Contentful (commerce-editorial CMS) and Shopify (product catalogue + cart) compose behind a single Next.js frontend styled by `packages/design-system`. The two data sources are separate by design and enforced by code: `apps/shop` does not query Sanity. `sugartown.io` does not query Contentful or Shopify.

`apps/contentful-poc` is the foundation for `apps/shop`. The rename is a monorepo directory rename + pnpm workspace name update + Vercel project rename + DNS update. After the rename, the existing Contentful content layer (articles, tags, pages, siteSettings) continues to serve editorial content. Shopify Storefront API is added alongside it for product data.

This epic is blocked until:
- SUG-179 (Contentful Stage 1 build-out) confirms DS components work in the Next.js App Router context with Contentful data
- SUG-71 (Shopify Stage 2) proves the Shopify Storefront API integration pattern and ST token distribution to Shopify
- SUG-72 (Shopify follow-on) is resolved or explicitly deferred

## Objective

After this epic:
- `apps/contentful-poc` is renamed `apps/shop` with all monorepo references updated
- `shop.sugartown.io` resolves and serves the Next.js app
- Product listing (`/products`) and product detail (`/products/[handle]`) routes render Shopify product data using DS `Card` / `Grid`
- Cart state persists via Shopify Cart API — client component boundary (`"use client"`)
- Contentful editorial content (articles, pages) continues to render unchanged
- `poc.sugartown.io` decommissioned or redirected to `shop.sugartown.io`
- Zero Sanity queries in `apps/shop`

## Scope

- [ ] Rename `apps/contentful-poc` directory to `apps/shop` — update `package.json#name`, Turbo config, all `--filter` references — layer: monorepo config
- [ ] Update Vercel project name from `contentful-poc` → `shop` — update domain config in Vercel dashboard — layer: infrastructure
- [ ] DNS cutover: add `shop.sugartown.io` CNAME in Pair DNS (pattern from SUG-128: CNAME → `cname.vercel-dns.com`, DNS-only, Vercel provisions SSL) — layer: infrastructure
- [ ] Add `@shopify/storefront-api-client` — create `apps/shop/src/lib/shopify.ts` with Storefront API client and public access token — layer: data client
- [ ] Add GROQ-equivalent Shopify queries: `getProducts()`, `getProductByHandle()` — layer: queries
- [ ] Add `/products` product listing route using DS `Grid` + `Card` — Shopify product data — layer: Next.js route
- [ ] Add `/products/[handle]` product detail route — product images, title, price, variants, Add to Cart — layer: Next.js route
- [ ] Add cart state: Shopify Cart API mutations (`cartCreate`, `cartLinesAdd`) in a `CartProvider` client component — layer: client state
- [ ] Decommission `poc.sugartown.io` — either remove the domain from Vercel or add a redirect to `shop.sugartown.io` — layer: infrastructure
- [ ] Verify zero Sanity references: `grep -r 'sanity' apps/shop/src/` must return zero matches — layer: integrity check

## Phases

**Phase 1 — Rename + infrastructure:** Directory rename, Vercel rename, DNS cutover. `shop.sugartown.io` resolves.
**Phase 2 — Shopify data layer:** Storefront API client, product queries, product listing + detail routes.
**Phase 3 — Cart state:** CartProvider, cartCreate / cartLinesAdd mutations, Checkout button.
**Phase 4 — Cleanup:** Decommission `poc.sugartown.io`, verify zero Sanity refs, final QA.

## Acceptance criteria

- [ ] `apps/contentful-poc` directory does not exist — renamed to `apps/shop` — all `pnpm --filter` commands use `shop`
- [ ] `shop.sugartown.io` returns HTTP 200 with the Next.js app
- [ ] `/products` renders at least 3 Shopify product SKUs using DS `Card` / `Grid`
- [ ] `/products/[handle]` renders product images, title, price, and an Add to Cart button
- [ ] Add to Cart updates cart state and the cart item count reflects the change
- [ ] Contentful article at `/articles/[slug]` renders correctly after rename — regression check
- [ ] `grep -r 'sanity' apps/shop/src/` returns zero matches
- [ ] `pnpm --filter shop build` passes with zero TypeScript errors
- [ ] `poc.sugartown.io` decommissioned or redirects to `shop.sugartown.io`

## Human QA Walkthrough — example local pages

Activation audit: read the renamed `apps/shop/src/app/` to list all routes. Build the Human QA Walkthrough table (one example local URL per route, including Contentful-powered routes as regression guards) per `docs/epic-template.md` §Human QA Walkthrough at activation time. Capture at least one real Shopify product handle and one Contentful article slug.

## Technical notes

**Shopify Storefront API access token:** The public access token is required for client-side cart operations and server-side product fetches. It is safe to expose in the frontend (Shopify scopes it to storefront-read + cart mutations only). Store as `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` and `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` in Vercel environment config.

**Cart state management:** Shopify Cart API is stateless — cart ID is stored in a cookie or `localStorage`. Cart mutations (`cartCreate`, `cartLinesAdd`) require the cart ID. A `CartProvider` context component handles persistence. This is client-side — mark `"use client"` at the CartProvider boundary.

**Checkout redirect:** Shopify-hosted checkout. The cart has a `checkoutUrl` from the Storefront API. "Checkout" button redirects to that URL. No checkout UI is built in the Next.js app.

**Data authority hard rule:** Contentful owns editorial content (articles, pages, nav, T&Cs). Shopify owns products, pricing, inventory, and cart. A file in `apps/shop/src/lib/` should be either a Contentful client/query or a Shopify client/query — never both in the same function. Enforce via code review.

**`NEXT_PUBLIC_BASE_URL` needed at Stage 3:** OG meta tags and canonical URLs need an absolute base URL. Add `NEXT_PUBLIC_BASE_URL=https://shop.sugartown.io` to Vercel environment config at Phase 1.

**DNS pattern (from SUG-128):** Pair DNS → CNAME → `cname.vercel-dns.com`. DNS-only (grey cloud, not orange). Vercel provisions SSL via Let's Encrypt. Same pattern used for `poc.sugartown.io` — proven and repeatable.

**Open decisions (from PRD):** Cart state management library (React context vs zustand vs `@shopify/hydrogen-react` hooks without Hydrogen framework) — resolve at Phase 3 activation.

**Model & Mode [REQUIRED]:** `/model opus` — this epic involves significant architectural decisions (cart state management, data authority enforcement, monorepo rename). Opus plans, Sonnet executes.

## Non-Goals

- No Hydrogen (Shopify's Remix framework) — evaluated and excluded per PRD Area 3
- No Netlify involvement — `apps/shop` is Vercel-hosted permanently
- No Sanity queries in `apps/shop` — the data boundary is hard
- No Stage 3 native Shopify theme (Liquid) — that is Shopify Stage 2 (SUG-71) scope
- No DS component modifications — all Shopify coupling in `apps/shop/src/lib/`
- No migration of `sugartown.io` to Next.js — that is explicitly out of scope per PRD Non-Goals

## Related

- **Linear:** [SUG-181](https://linear.app/sugartown/issue/SUG-181/shopify-stage-3-rename-appscontentful-poc-appsshop-add-shopify)
- **Blocked by:** SUG-179, SUG-71, SUG-72
- **PRD:** `docs/briefs/platform-evolution-prd.md` Area 2 (Stage 3) + Area 3 (Shopify)
- **DNS pattern:** `docs/shipped/zArchive/2026/SUG-128-contentful-poc-custom-domain-vercel.md`
- **Architecture decisions:** `docs/briefs/SUG-127-architecture-decisions.md`
- **Epic template:** `docs/epic-template.md`
