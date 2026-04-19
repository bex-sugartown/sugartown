**Linear Issue:** [SUG-71](https://linear.app/sugartown/issue/SUG-71/shopify-mvp-integration-shop-commerce-adapter-seam-pattern-a)
**Follow-on:** [SUG-72](https://linear.app/sugartown/issue/SUG-72/shopify-mvp-platform-services-content-sections-follow-on) (Platform + Services content sections)
**Status:** Draft — pending Gate 0 sign-off + Shopify account creation
**Route:** `/shop`
**Repo location:** `apps/web/src/lib/commerce/` (adapter) + `apps/web/src/routes/shop/` (route)
**Created:** 2026-04-18 · **Rescoped:** 2026-04-19

---

## What This Is

Minimal Shopify integration as an **architectural proof**, not a commerce launch. Deliverable: the seam between Sugartown's React + Sanity monorepo and a third-party commerce engine, demonstrated with 1–3 placeholder SKUs (prints / downloads / mock t-shirts).

The PRD locks four decisions: **Shopify plan**, **integration pattern**, **seam location**, and **MVP done-ness**.

## Why

The Platform page claims Sugartown is a composable MACH-style product with swappable backends. Sanity proves one swappable layer. Shopify proves a second. The goal is provenance, not revenue.

Framing per the Brand Voice Guide: this ships as governance infrastructure, not an experiment. No hedged copy.

---

## Non-Goals

- Not a revenue product. No marketing, no paid acquisition.
- Not a product catalog. 3 SKUs cap.
- Not a Shopify theme customization exercise.
- Not a payments or tax project. Shopify Payments defaults, no custom checkout, no subscriptions.
- Not a Sanity integration. Products live in Shopify admin. No new doc types.
- **Not content sections.** `/platform` + `/services` section copy split to SUG-72.

---

## Plan Selection

**Decision: Shopify Starter ($5/mo).** Rationale unchanged from draft:
- Goal is integration proof, not merch business. 5% transaction fee at zero-to-trivial volume is irrelevant.
- Starter → Basic upgrade is a billing change, not a migration. No lock-in.
- The adapter seam designed in this epic is what makes a future headless upgrade a one-provider swap, not a rebuild.

Basic ($29–39/mo) is rejected for MVP on cost, and because its features (Storefront API, custom themes) are out of scope.

**Starter constraint:** no Storefront API, no custom themes. Pattern A (below) is the only headless-ish integration compatible with Starter.

---

## Integration Pattern

**Pattern A: cart permalinks + link-out, adapter-backed.** Locked.

| Pattern | How | Starter? | Value | Effort |
|---------|-----|----------|-------|--------|
| **A. Cart permalinks** ✓ | `/shop` renders products using Sugartown Card primitives; "Buy" CTA is an anchor to `https://{shop}.myshopify.com/cart/{variantId}:1` | ✅ | Medium (proves composition without API) | Low |
| B. Subdomain link-out | Shopify hosts the whole store on a subdomain; Sugartown links to it | ✅ | Inert — this is a hyperlink, not composition | Lowest |
| C. Headless via Storefront API | `apps/web` fetches products at build time, renders with Sugartown components | ❌ Requires Basic+ | Highest | Medium-High |

**Pattern A, structured to enable C later** means: an adapter with a defined `CommerceProvider` interface, living at `apps/web/src/lib/commerce/`. The MVP ships one provider (`buyButtonProvider`) that reads from local JSON and generates cart permalinks. A future epic adds a `storefrontApiProvider` and swaps it in via config — no component in `apps/web` changes.

**Explicit: no Shopify Buy Button JS.** Cart permalinks are plain `<a href>`. No `<script>` tag, no Shadow DOM, no Shopify CSS bleed. The SDK-free approach is cleaner and Shopify-supported.

---

## Content Authoring — Products in Shopify Only

The 3-SKU MVP hardcodes product handle + variant ID in `apps/web/src/lib/commerce/products.json`. Minimal metadata (title, price, image URL, alt) lives in the same file. No Sanity schema work in this epic.

**Deferred:** product shells in Sanity (`productRef` doc type with `richImage` + Shopify handle), triggered when SKU count exceeds 5 or non-placeholder copy ships. Stubbed as a follow-on epic.

---

## Architecture

### Monorepo placement

```
apps/web/
├── src/
│   ├── lib/
│   │   └── commerce/
│   │       ├── index.js               # Exports provider + types
│   │       ├── provider.js            # CommerceProvider interface + buyButtonProvider
│   │       ├── products.json          # 3 SKUs: handle, variantId, title, price, imageUrl, alt
│   │       └── README.md              # Interface excerpt + migration note to Pattern C
│   └── routes/
│       └── shop/
│           └── ShopPage.jsx           # Grid using DS Card
```

**No new workspace package.** (Rescope note: the original draft proposed `packages/commerce-adapter`. That's premium overhead for 3 hardcoded SKUs. When the adapter graduates — e.g., during the Pattern C epic — it moves to `packages/commerce/` and acquires boundary lint rules then. Premature abstraction is the failure mode we're avoiding.)

**File conventions:** `.jsx` to match `apps/web` house style. Interface documented via JSDoc. TypeScript migration is a repo-wide decision, not a Shopify one.

### Boundary rules

- `apps/web/src/lib/commerce/` must not import from `apps/web/src/components/`, `apps/web/src/pages/`, or any route code. It is a pure data layer.
- `apps/web/src/lib/commerce/` must not import from `packages/design-system/`. Commerce is data; rendering is the app layer's job.
- No Shopify SDK, tokens, or keys appear anywhere in `packages/design-system/` or `apps/studio/`.

No new ESLint config. The conventions above are enforced by code review + the Atomic Reuse Gate (CLAUDE.md).

### `CommerceProvider` interface (JSDoc)

```js
/**
 * @typedef {Object} CommercePrice
 * @property {string} amount          "12.00"
 * @property {string} currencyCode    "USD"
 */

/**
 * @typedef {Object} CommerceProduct
 * @property {string} handle          Stable URL-safe identifier ("sticker-pack-tokens")
 * @property {string} title
 * @property {CommercePrice} price
 * @property {{ url: string, altText: string } | null} image
 * @property {string} checkoutUrl     Cart permalink for Pattern A; cartCreate URL for Pattern C
 */

/**
 * @typedef {Object} CommerceProvider
 * @property {() => Promise<CommerceProduct[]>} getProducts
 * @property {(handle: string) => Promise<CommerceProduct | null>} getProduct
 */
```

Notes:
- `checkoutUrl` is precomputed per product for Pattern A. Pattern C would generate per-variant via `cartCreate`. Interface tolerates both.
- No cart abstraction in MVP — each product links directly to hosted single-item checkout.
- No inventory state. Out-of-stock is deferred.

### Data flow

1. `buyButtonProvider.getProducts()` reads `products.json`, normalises each entry into a `CommerceProduct`, precomputes `checkoutUrl` as `https://{shop}.myshopify.com/cart/{variantId}:1`.
2. `ShopPage.jsx` calls the provider at render time (build-time for SSG-friendly usage), maps over the result, and renders a Sugartown-styled grid using the existing DS Card component.
3. "Buy" CTA is an anchor to `checkoutUrl`. Shopify hosts checkout. Post-purchase return is configured in Shopify admin to point back to `sugartown.io/shop`.

---

## Design System Impact

Zero new components. Per the Atomic Reuse Gate:

| Need | Existing component | Notes |
|------|-------------------|-------|
| Product grid | DS `Card` (archive grid pattern) | Reuse |
| Product image | `<img>` with DS wrapper tokens | Pin intrinsic dimensions per SUG-63 |
| CTA | Existing button primitive | Label: "Buy" — single word per voice guide |
| Price display | Courier Prime numerals, token-driven scale | Reuse eyebrow pattern |
| Hero | `heroSection` | Reuse |

Deferred: PDP layout, variant selector, add-to-cart UI. None needed for 3 single-variant SKUs.

---

## Routing

- `/shop` — index grid, 1–3 products. **This epic.**
- `/shop/{handle}` — product detail. **Deferred** unless MVP feedback shows the grid is insufficient.

`pnpm validate:urls` config gets `/shop` added as a reserved namespace in this epic (per IA Brief rules for new namespaces).

---

## Custom domain (`shop.sugartown.io`)

**MVP: use generic `{shop}.myshopify.com`.** Shopify Starter supports custom domains at no extra Shopify cost — the work is 10–15 min of DNS config (CNAME from `shop.sugartown.io` → `shops.myshopify.com`) plus Shopify admin verification. No monthly fee uplift.

Why defer:
- Pattern A renders the grid on `sugartown.io/shop` — the only surface that exposes the Shopify domain is the cart permalink hitting checkout. Users see `{shop}.myshopify.com` briefly at the payment step.
- A custom domain is a polish pass, not an integration requirement. Ship the integration first, swap the domain in a 30-minute follow-up commit.
- Deferred epic stub: `shop.sugartown.io` DNS + Shopify primary-domain swap. Trigger: after SUG-71 ships.

---

## Gate A — Shopify store standup (Bex owns)

Step-by-step. Run these in order. Capture output for the epic close-out record.

**1. Create Shopify account**
- Go to https://www.shopify.com/
- Click "Start free trial" (Shopify always offers a 3-day trial + $1/month for the first 3 months on paid plans; Starter plan eligible)
- Use `bex@sugartown.io` as the admin email
- Store name: `Sugartown` (this becomes the `{shop}.myshopify.com` prefix — treat it as permanent; renaming costs re-setup)
- Industry: "Art & crafts" or "Design" — neutral, doesn't affect anything downstream
- Country: United States (or whatever matches your tax residence)

**2. Select Starter plan**
- When Shopify asks what you want to sell: "Products" → Physical and/or Digital
- When it offers plan upgrades, decline and scroll to "Starter ($5/month)"
- Confirm billing — Starter is $5/mo flat. If the trial offer applies, take it.
- At this point you can skip Shopify's setup wizard ("add domain", "add theme", "launch store") — Pattern A doesn't need any of that.

**3. Add 3 products**
- Admin nav: Products → Add product
- For each product:
  - **Title** — follow Brand Voice Guide: no em dashes, no adjective triads, no "handcrafted artisanal". Let the product do the talking. Working examples:
    - `"Ships continuously" sticker pack`
    - `Schema ERD print (A3)`
    - `"Not in this release" mug`
  - **Description** — one or two sentences, dry register. Optional for MVP; it only shows on Shopify's checkout page.
  - **Media** — upload one image per product (or use placeholder art for now). Shopify accepts PNG/JPG/WebP up to 20MB.
  - **Pricing** — set a real price. For test purchases in Gate D, Bogus Gateway handles payment without charging real cards, so the price just needs to exist.
  - **Inventory** — uncheck "Track quantity" for MVP simplicity (or check it if you want to tangibly cap the sticker pack at 20).
  - **Shipping** — check "This is a physical product" for stickers/print/mug; uncheck for any digital item. Digital products need a separate fulfillment setup — defer for MVP unless all 3 are physical.
  - **Status: Active** (not Draft)
  - Save.

**4. Capture handle + variant ID for each product**
- After saving, the product page URL contains the product ID: `https://admin.shopify.com/store/{shop}/products/{productId}`
- To get the **variant ID** (which is what cart permalinks need, not the product ID):
  - On the product page, scroll to "Variants" section. If a product has only one variant, Shopify shows a single default variant.
  - Click the variant — the URL becomes `/products/{productId}/variants/{variantId}`. Copy the variantId.
  - Alternatively: open Shopify admin → Settings → Apps and sales channels → Develop apps → skip. Or use the "Copy as JSON" dev tool if available.
  - Simplest: the **handle** appears in the product URL slug field (set in the "Search engine listing" section near the bottom). The **variantId** is the numeric string in the variant URL.
- Record for each product in `apps/web/src/lib/commerce/products.json`:
  ```json
  {
    "handle": "ships-continuously-sticker-pack",
    "variantId": "44123456789012",
    "title": "\"Ships continuously\" sticker pack",
    "price": { "amount": "12.00", "currencyCode": "USD" },
    "image": { "url": "https://cdn.shopify.com/s/files/1/.../stickers.png", "altText": "Three stickers..." }
  }
  ```

**5. Configure Shopify Payments in test mode (Bogus Gateway)**
- Admin nav: Settings → Payments
- Under "Shopify Payments", click "Activate" if not active. (Shopify Payments may require identity verification — you can skip this for test mode and use the Bogus Gateway instead.)
- Scroll to "Supported payment methods" → "Choose a provider" → search for "(for testing) Bogus Gateway" → enable.
- Deactivate any real payment provider during MVP testing to avoid accidental real charges.

**6. Set checkout return URL**
- Admin nav: Settings → Checkout → "After payment" section
- Set "Order status page" additional scripts or configure return URL to `https://sugartown.io/shop` (or a thank-you page we control — defer thank-you page to follow-on).

**7. Verify a cart permalink works**
- In a browser, hit: `https://{shop}.myshopify.com/cart/{variantId}:1`
- Confirm: page loads Shopify's hosted cart with 1× of that variant.
- If you get a 404, the variantId is wrong — recapture from step 4.

**8. Capture Gate A completion**
- Commit `apps/web/src/lib/commerce/products.json` with all 3 SKUs filled in
- Commit `apps/web/src/lib/commerce/README.md` with:
  - Store domain ({shop}.myshopify.com)
  - Link to Shopify admin
  - Note that Payments is in Bogus Gateway mode
  - Note about the return URL

Gate A is done when: 3 products live, permalink works in browser, Bogus Gateway active, `products.json` committed.

---

## Release Process & Gates

### Gate 0 — Orientation (Claude Code)
Before writing code:
1. Confirm `apps/web/src/lib/commerce/` does not yet exist.
2. Read one existing `apps/web/src/lib/*` module (e.g., `routes.js`, `queries.js`) to mirror file style.
3. Read one existing `apps/web/src/routes/*` or `pages/*` for route pattern (note: `apps/web` uses `src/pages/`, not `src/routes/` — adjust placement to `apps/web/src/pages/ShopPage.jsx` and wire into `App.jsx` Routes).
4. Read `apps/web/src/lib/routes.js` to add `/shop` to `TYPE_NAMESPACES` or the equivalent reserved list.
5. Paste inventory into reasoning. Do not proceed until complete.

### Gate A — Shopify store standup (Bex)
Completed per the step-by-step above. Deliverable: `products.json` committed, permalink verified.

### Gate B — Adapter scaffolded (Claude Code)
- `apps/web/src/lib/commerce/provider.js` with `CommerceProvider` JSDoc interface + `buyButtonProvider` reading from `products.json`
- Unit tests: `provider.test.js` — verifies `getProducts()` returns 3 entries with expected shape; `getProduct(handle)` returns the matching entry or `null`; `checkoutUrl` is built correctly from `variantId`
- `apps/web/src/lib/commerce/README.md` with the JSDoc excerpt
- Confirmation: `pnpm --filter web test` passes (or manual test run if no test harness exists)

### Gate C — Shop page renders (Claude Code + Bex visual QA)
- `apps/web/src/pages/ShopPage.jsx` mounted at `/shop` via `App.jsx` Routes
- Renders a grid using the existing DS `Card` component
- Each card: product image (intrinsic dims pinned per SUG-63), title, price in Courier Prime, one "Buy" CTA → anchor to `checkoutUrl` (opens in new tab)
- Confirmation: Bex reviews at desktop + mobile breakpoints; copy passes voice guide (no AI-sounding cadences, no adjective triads, no em dashes in product descriptions)

### Gate D — End-to-end checkout (Bex)
- Start from `sugartown.io/shop` (or local dev)
- Click "Buy" on any SKU
- Complete checkout using Bogus Gateway test card (`1` repeated 16 digits, any future expiry, any CVV)
- Confirm: order appears in Shopify admin with correct variant, referrer shows sugartown.io
- Confirmation: screenshot of Shopify admin order list

### Gate Final — Ship
- `pnpm run build` from root passes
- `pnpm validate:urls` passes with `/shop` reserved
- CHANGELOG entry drafted via `/mini-release`
- Epic doc moved `docs/backlog/` → `docs/shipped/`
- Linear SUG-71 → Done
- **Content sections on `/platform` + `/services`: SKIPPED** — they ship under SUG-72 after SUG-71 is live on production

---

## Rollback Plan

Each workstream is an independent commit:

1. `feat(web): scaffold commerce adapter at src/lib/commerce/`
2. `feat(web): add /shop route using commerce adapter`
3. `feat(web): wire Shopify cart permalinks for 3 SKUs`

Reverting any one does not break the others. The adapter lib can exist without `/shop` consuming it; `/shop` cannot exist without the adapter; revert in reverse order if rolling back the core.

**Shopify store is not version-controlled.** If deleted or mismigrated, the MVP is rebuildable in under an hour from this PRD's Gate A instructions.

**No Sanity schema changes.** Zero migration risk.

---

## Risks & Edge Cases

**Plan risks**
- Starter plan does not support Storefront API. Don't let a future session assume API access.
- Starter's 5% transaction fee is fine at placeholder scale, uncompetitive if SKU count grows. Document upgrade trigger (see Deferred stubs).

**Integration risks**
- Shopify handles change when a product is renamed. `products.json` pins handle + variantId explicitly.
- Return URL is configured in Shopify admin, not in code. Gate A step 6 verifies.
- Test-mode (Bogus Gateway) vs. live-mode purchases diverge. Ship MVP in test mode; flip to live in a follow-on commit if real sales are ever a goal.

**Boundary risks**
- Commerce adapter imported from a component file by accident. Mitigation: the adapter has no React imports; it's pure data. Any accidental React usage would fail to run in a Node build-time context.
- `apps/studio` or `apps/storybook` importing the commerce adapter. Mitigation: the adapter lives under `apps/web/` so cross-app imports would already look suspicious in review.

**Content risks**
- Placeholder product copy violates voice guide. Mitigation: Gate C copy review.
- `/shop` looks under-scoped at 3 items. Mitigation: brief "This is an integration proof" framing in the page hero — confirm copy in Gate C.

**Post-launch risks**
- PCI / data: no customer data touches Sugartown infra in Pattern A. Shopify handles all PII and payments. Note this in SUG-72's Platform page copy.
- Analytics: visitor sessions fragment at the Shopify boundary. Out of scope; unified analytics is its own epic.

---

## Definition of Done

- [ ] Shopify Starter store live on `{shop}.myshopify.com` with 3 placeholder products
- [ ] `apps/web/src/lib/commerce/` exists with `provider.js`, `products.json`, `README.md`, passing tests
- [ ] `apps/web/src/pages/ShopPage.jsx` mounted at `/shop`, renders 3-product grid using DS Card
- [ ] End-to-end test purchase completes via Bogus Gateway
- [ ] `pnpm validate:urls` updated to reserve `/shop`
- [ ] CHANGELOG entry drafted via `/mini-release`
- [ ] At least one commit referencing SUG-71 on `origin/main` (CLAUDE.md §Linear Done = code on main)
- [ ] Linear SUG-71 transitioned to Done
- [ ] Deferred epic stubs captured in backlog:
  - Pattern C upgrade (Storefront API, Basic plan) when needed
  - `productRef` Sanity doc type when SKU count > 5 or non-placeholder copy ships
  - `/shop/{handle}` product detail routes
  - Custom domain `shop.sugartown.io` (15-min DNS + primary-domain swap)
- [ ] SUG-72 (content sections) remains in backlog, unblocked by SUG-71 shipping

---

## Scope Decisions (Locked)

| Decision | Resolution |
|----------|-----------|
| Linear epic ID | **SUG-71** (content sections split to SUG-72) |
| Route | `/shop` — reserved in `validate:urls` |
| SKUs | 3 placeholder items: prints / downloads / mock t-shirts |
| Plan | Starter ($5/mo) |
| Pattern | A — cart permalinks, adapter-backed |
| Adapter location | `apps/web/src/lib/commerce/` (not a separate workspace package) |
| File convention | `.jsx` + JSDoc interface (not TypeScript) |
| Shopify Buy Button JS | Not used — plain `<a href>` |
| Product authoring | Shopify admin only; `products.json` in adapter dir |
| Domain | `{shop}.myshopify.com` for MVP; custom `shop.sugartown.io` deferred |
| Test payments | Bogus Gateway |
| `/platform` + `/services` sections | Split to SUG-72 |

---

## References

- [docs/briefs/monorepo-prd.md](../briefs/monorepo-prd.md) — monorepo boundary rules
- [docs/brand/brand-voice-guide.md](../brand/brand-voice-guide.md) — product copy register
- [docs/epic-template.md](../epic-template.md) — gate + rollback conventions
- Shopify Starter plan — https://www.shopify.com/starter
- Shopify Storefront API — https://shopify.dev/docs/api/storefront (deferred Pattern C epic)
- Cart permalinks — https://help.shopify.com/en/manual/online-store/themes/theme-structure/links-and-navigation/product-urls
