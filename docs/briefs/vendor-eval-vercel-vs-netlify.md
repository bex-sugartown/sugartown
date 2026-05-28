# Vendor Evaluation — Vercel vs Netlify
**Epic:** SUG-127 — Contentful + Vercel POC
**Date:** 2026-05-25
**Author:** Sugartown Digital (Bex + Claude)
**Status:** Final — Phase 3 deliverable

---

## Executive summary

**Recommendation: stay on Netlify for `apps/web`. Use Vercel for any future Next.js app (including `apps/contentful-poc`).**

Netlify and Vercel are genuinely close for a Vite/React SPA on a single site. Vercel's clear advantage is its Next.js integration — it is Next.js's native platform, and the developer experience gap is real and measurable. For the existing Sugartown Sanity + Vite stack, switching to Vercel would trade a working setup for marginal gains. For a future Next.js project, Vercel is the correct default.

The hybrid model (Netlify for `apps/web`, Vercel for `apps/contentful-poc` and any future Next.js apps) is already live. It costs nothing extra on free tiers and requires no migration risk to the live site.

---

## Evaluation context

This evaluation is grounded in direct execution, not marketing copy:

- **Vercel**: hands-on during SUG-127 POC — monorepo subdirectory import, env var setup, deploy hooks, branch preview URLs, custom domain config. Two-week active use.
- **Netlify**: production deployment of `apps/web` (Vite/React + Sanity) for the duration of the Sugartown project. Familiar from daily use.

Where I'm drawing on documentation rather than direct experience (e.g. Netlify's edge functions, Vercel's spend controls), I say so.

---

## Axis 1: Monorepo support

### Vercel

Vercel auto-detects pnpm workspaces + Turborepo via `turbo.json` presence in the repo root. In the dashboard:

1. Import project from GitHub
2. Set **Root Directory** to `apps/contentful-poc`
3. Framework preset auto-detects as **Next.js**
4. Build command and output directory pre-filled correctly

No config file required. The monorepo structure was recognised without any `vercel.json`. First deploy worked on the first try after setting Root Directory.

**Finding:** Vercel's monorepo support is frictionless for Turborepo projects. The platform was clearly designed with this workflow in mind.

### Netlify

Netlify requires explicit configuration in `netlify.toml`:

```toml
[build]
  base = "apps/web"
  command = "pnpm run build"
  publish = "dist"
```

This works cleanly once configured, but it is a manual step that Vercel doesn't require. The `base` setting must be correct before the first deploy — Netlify does not attempt to auto-detect the workspace root.

**Finding:** Netlify works for monorepos with explicit config. It does not auto-detect them. For a Turborepo project, Vercel is noticeably less friction on the first deploy.

**Winner: Vercel**

---

## Axis 2: Developer experience — CLI, dev server, logs

### Vercel CLI

- `vercel` CLI: one command to deploy from the terminal, auto-links to the dashboard project
- `vercel dev`: runs a local dev server that proxies Vercel Edge Functions and serverless functions. Not tested in this POC (we ran `next dev` directly) — relevant for apps that use Vercel's serverless/edge features.
- `vercel env pull`: syncs production env vars to `.env.local` in one command. This is a genuine DX win — no manual copying from the dashboard.
- Build logs stream in the dashboard with clear phase separation (install → build → deploy). Error messages include file/line references when a build fails.

### Netlify CLI

- `netlify dev`: runs a local dev server that wraps Vite, proxies Netlify Functions, and injects Netlify environment. Solid for Netlify-specific features (forms, functions). For a pure Vite app with no Netlify functions, it's equivalent to `vite dev` with extra config.
- `netlify env:pull`: equivalent to `vercel env pull` — pulls env vars to local file.
- Build logs are readable but less visually structured than Vercel's. Error messages sometimes require clicking into a collapsed section.

**Finding:** The CLIs are close in capability. `vercel env pull` is genuinely convenient. The main DX difference shows up when using platform-specific features (functions, edge) rather than in the core build/deploy loop.

**Winner: Tie for basic deploys. Vercel for Next.js-specific workflows.**

---

## Axis 3: Preview deployments (branch and PR)

### Vercel

Every branch push generates a unique preview URL (`contentful-poc-abc123.vercel.app`). The URL is stable per-commit (same commit = same URL, regardless of when you access it). On GitHub PRs, Vercel posts a comment with the preview URL, build status, and a link to the deployment summary.

Password protection on preview URLs: available on Vercel Pro, not Hobby.

### Netlify

Every branch push generates a branch preview URL (`branch-name--site-name.netlify.app`). PR comments are supported via the Netlify GitHub app. The URL structure is less stable than Vercel's (branch-based rather than commit-based).

Deploy previews on Netlify are conceptually identical to Vercel. The primary difference is URL structure and the GitHub comment format — Vercel's comment is more detailed.

**Finding:** Both platforms handle branch previews well. Vercel's commit-stable URLs are a minor advantage for sharing specific deployment states. No material difference for Sugartown's current workflow.

**Winner: Tie**

---

## Axis 4: Build pipeline — caching, env vars, build commands

### Vercel

- Remote build cache via Turborepo Remote Cache: add `TURBO_TOKEN` and `TURBO_TEAM` env vars, and Turbo's cache becomes shared across Vercel builds and local machines. Build times drop significantly after the first run — only changed packages rebuild.
- Env var management: dashboard UI is clean. Variables can be scoped to Production, Preview, or Development. `vercel env pull` syncs them to `.env.local`.
- Build command for monorepo subdirectory: Vercel runs the build from the `apps/contentful-poc` root, so `next build` works directly. Turbo is invoked by Vercel's own monorepo detection if configured.

### Netlify

- Netlify's build cache is file-based (configured via `cache` paths in `netlify.toml`). It does not integrate with Turbo Remote Cache natively — you would need to configure remote caching separately.
- Env vars: dashboard UI similar to Vercel. No equivalent of `vercel env pull` without the CLI.
- Build command runs from the `base` directory. Clean and predictable.

**Finding:** Turbo Remote Cache integration is a meaningful Vercel advantage for monorepos. If Sugartown's build times grow as more apps are added, Vercel + Turbo Remote Cache is materially faster. At current scale (two apps, fast builds), the difference is not felt.

**Winner: Vercel (future-proofing for monorepo scale)**

---

## Axis 5: Pricing

### Vercel (May 2026)

| Tier | Cost | Bandwidth | Build minutes | Serverless invocations |
|------|------|-----------|---------------|------------------------|
| Hobby | Free | 100GB/month | 6,000 min/month | 100K/month |
| Pro | $20/user/month | 1TB/month | Unlimited | 1M/month |

Hobby restrictions: no password protection on previews, no team members, no spend controls, no SLA. Single user only.

### Netlify (May 2026)

| Tier | Cost | Bandwidth | Build minutes | Serverless invocations |
|------|------|-----------|---------------|------------------------|
| Free | Free | 100GB/month | 300 min/month | 125K/month |
| Pro | $19/seat/month | 400GB/month | 25,000 min/month | 125K/month |

**Credit model (confirmed from live usage, May 2026):** Netlify's billing runs on a credit system. Production deploys, bandwidth, web requests, functions compute, and database compute all draw from a credit pool. The **Personal plan is $9/month and includes 1,000 credits**. Additional credits can be purchased as a **$5 add-on block** when the monthly allocation runs out. This is meaningful for the POC: the contentful-poc consumed approximately 63 credits in the current billing period (May 21 to Jun 20), with the largest single-day spike at 120 credits on a heavy deploy day. At this rate, the $9/month personal plan covers all POC activity comfortably without needing the add-on.

Observed credit consumption breakdown on the POC (current period):
- Production deploys: 120 credits (8 deploys at roughly 15 credits each)
- Web requests: 1.6 credits (7,999 requests)
- Bandwidth: 2.2 credits
- Compute, AI inference, functions: 0 credits

**Why this matters for the eval:** The credit model makes Netlify's pricing more legible at small scale than Vercel's usage-based model, and the $9 add-on tier makes it genuinely affordable to run a hobby/POC project with active deploy cadence without hitting the free-tier build minute ceiling. The 300 build minutes/month hard limit on the free tier remains the more binding constraint for CI-heavy workflows.

**Key difference:** Netlify's free tier gives 300 build minutes/month. Vercel's gives 6,000. For a small project with frequent deploys, Vercel's free tier is significantly more headroom.

**At Sugartown's current scale:** Both free tiers are sufficient. Sugartown.io's Netlify build (Vite + Sanity) takes roughly 60–90 seconds. At 300 minutes, that's ~200 deploys per month — well above actual usage.

**If Sugartown scales to 3+ apps:** Vercel's 6,000 minutes and Turbo Remote Cache (which reduces per-build time by caching unchanged workspaces) makes the free tier more durable.

**Winner: Vercel (free tier headroom)**

---

## Axis 6: Next.js and edge features

This axis only matters if `apps/web` migrates to Next.js, or if a future Sugartown project is built on Next.js. It's included for completeness and for the job interview context.

### Vercel + Next.js

Vercel is maintained by the same team as Next.js. Zero-day support for new Next.js features. The following are Vercel-native or Vercel-first:

- **ISR (Incremental Static Regeneration):** `revalidate` on fetch works without config. On Contentful publish, a webhook hits a Vercel deploy hook which triggers revalidation of the affected pages. This is the production-grade alternative to `next build` on every publish.
- **`next/image`:** CDN-optimised image delivery (WebP/AVIF conversion, lazy loading, responsive sizes). Configured automatically on Vercel. On Netlify, `next/image` requires the `@netlify/plugin-nextjs` adapter — it works, but it's an extra dependency and has historically lagged Next.js releases.
- **Edge Middleware:** `middleware.ts` runs on Vercel's edge network globally. On Netlify, Edge Functions exist but the mapping from Next.js middleware to Netlify edge is handled by the plugin (not always transparent).
- **Server Actions, Server Components:** Supported natively on Vercel. On Netlify, the plugin handles them but support for new Next.js features can lag by weeks.

### Netlify + Next.js

Netlify supports Next.js via `@netlify/plugin-nextjs`. It works and covers most use cases. The gap shows up at:
- New Next.js feature adoption (Netlify's plugin lags releases)
- ISR revalidation (works but requires more config)
- `next/image` optimisation (plugin-dependent)

**Finding:** For a Vite/React app (current `apps/web`), this axis is irrelevant — both platforms are equivalent. For any future Next.js project, Vercel is the clear choice.

**Winner: Vercel (for Next.js specifically)**

---

## Axis 7: CMS integration

### Contentful + Vercel

The natural pairing for this POC. Integration points:
- **Contentful webhook → Vercel deploy hook:** In Contentful: Settings → Webhooks → add URL. In Vercel: Settings → Git → Deploy Hooks → create hook URL. Connect them. Entry publish in Contentful triggers a Vercel production deploy. Five minutes to configure, zero maintenance.
- **ISR revalidation:** Instead of a full rebuild, a Vercel revalidation webhook can invalidate specific pages on publish. Requires a Next.js API route (`/api/revalidate`), but avoids full rebuilds. Not implemented in this POC — documented as the production-grade pattern.
- **Preview mode:** Contentful's Preview API + Next.js Draft Mode. Requires a separate `CONTENTFUL_PREVIEW_TOKEN` and a `/api/preview` route. Not implemented in POC.

### Sanity + Netlify

The current live stack. Integration points:
- **Sanity webhook → Netlify build hook:** Configured in Sanity Studio (settings) and Netlify (build triggers). Identical pattern to Contentful + Vercel.
- **Sanity Studio embedded in repo:** Deployed to Netlify as part of `apps/studio`. This is a meaningful DX point — Studio is always in sync with the schema because it deploys with the code. Contentful's Studio is external (hosted by Contentful), which means it never needs deployment but also means you can't version the editing UI with the codebase.
- **Sanity preview:** `perspective: 'previewDrafts'` on the client, no separate API needed. Simpler than Contentful's Preview API.

**Finding:** The webhook → deploy hook pattern is structurally identical across both pairings. The integration complexity is the same. Sanity's embedded Studio and simpler preview setup are genuine Sanity + Netlify advantages, not platform-specific.

**Winner: Tie (similar integration patterns)**

---

## Axis 8: Fit for Sugartown Digital specifically

This is the axis that matters most.

**Current state:** `apps/web` (Vite + React + Sanity) on Netlify. Working in production. No known deployment pain points.

**Migration cost to Vercel:** Non-trivial. Would require:
1. Migrating `netlify.toml` config to `vercel.json`
2. Reconnecting deploy hooks in Sanity (new webhook URL)
3. DNS change (`sugartown.io` → Vercel nameservers or CNAME to Vercel)
4. Revalidating the full CI/CD chain in the new platform
5. Vercel Hobby is single-user — Bex only, no collaborators
6. Losing any Netlify-specific features in use (none identified currently)

**Migration benefit:** Marginal for the current Vite stack. Vercel's Turbo Remote Cache integration is the only concrete upside at current scale.

**The right question:** Is `apps/web` going to remain Vite/React, or does it migrate to Next.js? If it stays Vite, stay on Netlify. If it migrates to Next.js, move to Vercel at that point and get the full platform alignment benefit.

**For `apps/contentful-poc` and any new Next.js app:** Vercel is the correct platform. It's already deployed there. No migration needed.

**For future client projects built on Sugartown's stack:**
- If the client is on Contentful + Next.js: Vercel is the obvious recommendation.
- If the client is on Sanity + Vite (like Sugartown): Netlify is equally valid and has no migration cost.
- If the client has no strong platform preference: recommend Vercel for the free-tier build minute headroom and Turbo Remote Cache integration.

---

## Coupling point map — final findings

This table was pre-populated with hypotheses at the start of the epic. Findings below are from direct execution.

| Layer | Sanity (`apps/web`) | Contentful (`apps/contentful-poc`) | Finding |
|-------|--------------------|------------------------------------|---------|
| DS primitives | `@sugartown/design-system` | same | ✅ **Fully agnostic** — zero Sanity imports in the package. Confirmed: DS components rendered correctly in Next.js App Router without any modification to the package source. |
| Token system (`--st-*`) | shared via workspace | same | ✅ **Fully agnostic** — same 612 tokens, same Pink Moon theme, zero changes required. `@sugartown/design-system/styles/tokens.css` and `theme.pink-moon.css` imported in `layout.tsx` identically to how `apps/web` consumes them. |
| DS package packaging | Consumed via Vite source (workspace) | First to consume `dist` artifact | ⚠️ **Packaging was broken** — `exports` map missing `./styles.css` entry; built CSS Modules compiled to empty `{}`. The DS had never been consumed via its built artifact. Both defects fixed in this epic (Decisions 11 and 12). The components are agnostic; the *package* was not production-ready. |
| Client setup | `createClient()` from `@sanity/client` | `createClient()` from `contentful` | ⚡ **Adapter needed, same pattern** — both use a named export `createClient` with an auth token; both return a client object with query methods. The `contentful.ts` file mirrors `sanity.js` in structure and intent. Meaningful difference: Sanity client requires `projectId` + `dataset`; Contentful requires `space` + `accessToken`. |
| Query language | GROQ (`*[_type == "article"]`) | CDA REST (`getEntries({ content_type })`) | ⚡ **Adapter needed, Sanity more precise** — GROQ projects exactly the fields you name; CDA REST returns all fields for matching entries (no field-level selection). Over-fetching on list pages is real. Contentful GraphQL closes this gap but adds complexity. Document this in the eval as a capability difference, not a dealbreaker. |
| Rich text renderer | `@portabletext/react` | `@contentful/rich-text-react-renderer` | ⚡ **Adapter needed, same visual output achievable** — PortableText is a block array (marks as arrays on spans); Contentful Rich Text is a document tree (marks as inline nodes). Different input formats, same rendered HTML possible. Mirror pattern (Decision 5) produced directly comparable output. Table support built-in to Contentful; requires custom type in Sanity (Decision 15). |
| Image URLs | `urlFor()` from `@sanity/image-url` | Plain HTTPS CDN URL | ⚡ **Contentful is simpler** — no transformation library required; Contentful's CDN URL accepts query params directly (`?w=800&fm=webp`). Sanity's `urlFor()` builder is more ergonomic for complex transforms. For basic responsive images, Contentful requires less setup. |
| Slug routing | `slug.current` (nested object) | `fields.slug` (flat string) | ⚡ **Minor shape diff** — Sanity nests slug in `{ slug: { current: '...' } }`; Contentful uses `fields.slug` directly. One extra `.current` access in the Sanity query/component; otherwise identical. |
| Server/client boundary | Not applicable (Vite/React SPA) | `"use client"` required for DS imports | ⚠️ **Next.js-specific finding** — The DS barrel has no `"use client"` directive. In Next.js App Router, any page that imports DS components must be a client component. Server Components cannot import from the DS barrel. This is a DS packaging gap (not a Sanity coupling), surfaced by the Next.js context rather than the CMS context. |
| Draft/preview | `perspective: 'previewDrafts'` | Contentful Preview API + separate token | ⚡ **Similar pattern, Sanity simpler** — Sanity's preview is a single client option. Contentful's requires a second API token, a separate client instance, and a `/api/preview` Next.js route. Both work; Sanity's is less setup. Not implemented in POC. |
| Content webhooks | Sanity webhook → Netlify build hook | Contentful webhook → Vercel deploy hook | ⚡ **Identical pattern** — both: CMS Settings → create webhook → paste deploy hook URL. Five minutes to configure on either platform. |
| Singleton enforcement | `__experimental_actions: ['update']` | Convention only | ⚡ **Sanity stronger** — Sanity can prevent creating additional docs at the platform level. Contentful relies on discipline (create one `siteSettings` entry; don't create another). For production, Contentful's approach requires editorial process governance rather than technical enforcement. |
| Section array model | Inline typed objects (`_type` discriminator) | References array (`sys.contentType.sys.id`) | ⚡ **Different model, same dispatcher pattern** — Sanity sections live inside the document; Contentful sections are linked entries resolved via `include: 2`. The dispatcher function shape is identical (switch on discriminator → render component); the discriminator path differs. `section._type` vs `entry.sys.contentType.sys.id`. |
| Section fetch cost | One GROQ query, sections inline | `getEntries({ include: 2 })` | ⚡ **Sanity more precise** — GROQ's `->` dereferences exactly the fields you project. Contentful's `include: 2` returns all linked entries up to depth 2, whether referenced in the render or not. For a page with 3 section types, Contentful fetches all linked content from all sections in one payload — blunt but sufficient for a content-light POC. |
| Tag taxonomy model | `tag` document type, `->` reference | Custom `tag` content type | ⚡ **Near-identical model** — both use name + slug + reference link. Contentful also offers native Tags (metadata-level, no slug, no detail pages) and native Taxonomy (SKOS hierarchy, `descendants` query). Custom content type chosen for POC to mirror Sanity's model. See Decision 13. |
| Studio / editing UI | Sanity Studio (in-repo, versioned) | Contentful web UI (hosted, external) | ❌ **Not portable by design** — Sanity Studio lives in this repo, deploys with the schema, and is versioned with the codebase. Contentful's editing UI is external SaaS — it can't be version-controlled, customised at the same depth, or deployed from a CI pipeline. Both are valid; they serve different editorial governance philosophies. |

---

## Recommendation (restated with rationale)

### For `apps/web` (current Vite + React + Sanity on Netlify)

**Stay on Netlify.** No migration. The app works; there's no deployment pain; the migration cost (DNS, webhooks, Turbo config) produces marginal gains on a Vite stack. Revisit if `apps/web` moves to Next.js.

### For `apps/contentful-poc` (Next.js + Contentful on Vercel)

**Stay on Vercel.** Already deployed. The correct platform for Next.js. No change.

### For future Sugartown projects

- **Next.js project of any kind:** Vercel. Platform alignment matters, Turbo Remote Cache integrates natively, Next.js features (ISR, `next/image`, edge middleware) work without a plugin.
- **Vite/React SPA or static site:** Either platform. If already on Netlify, no reason to move. If starting fresh, Vercel's free-tier build minute headroom (6,000 vs 300) is a practical advantage.
- **Client project with no existing platform preference:** Recommend Vercel. More headroom, better monorepo DX, easier onboarding story.

### On CMS agnosticism (the headline finding)

`packages/design-system` is **architecturally agnostic** — the components have zero Sanity imports, the token pipeline is CMS-unaware, and the same DS rendered correctly in both Sanity/Vite and Contentful/Next.js without modification to the package source.

The agnosticism **broke at the packaging layer** — the built artifact had never been consumed by a real app, had a broken `exports` map, and dropped CSS Modules. These are fixable engineering gaps, not architectural coupling. The POC fixed both (Decisions 11 and 12) and the result is a publishable DS package.

The coupling in both setups lives entirely in the adapter layer (`sanity.js` / `portableTextComponents.jsx` on one side; `contentful.ts` / `contentfulRichText.tsx` on the other). These adapters are intentionally not shared — the mirror pattern (Decision 5) makes the coupling visible and the diff reviewable. That is the finding: **the DS components are genuinely CMS-agnostic; the data-fetching and rich-text-rendering layers are necessarily CMS-specific, and that is correct**.
