# Hosting Platform Evaluation — DNS Cutover Decision

**Date:** 2026-03-15
**Status:** ✅ Decided — Netlify selected (2026-03-15)
**Decision gates:** DNS cutover timeline, redirect strategy, preview URL workflow

---

## Context

Sugartown is a React 19 + Vite 7 SPA served as static files. The site fetches content from Sanity at runtime (client-side). The build produces a `dist/` folder with `index.html` + JS/CSS bundles. Redirects for 326 legacy WordPress URLs are managed via a `_redirects` file generated at build time from Sanity redirect documents, plus a `netlify.toml` for query-parameter redirects.

Current state: Netlify is configured (dashboard + `netlify.toml` committed) but no production domain is pointed at it yet. WordPress remains the live site.

### Requirements

| Requirement | Weight | Notes |
|-------------|--------|-------|
| **Static SPA hosting** | Must | `dist/` folder, `index.html` catch-all for client-side routing |
| **Redirect file compatibility** | Must | 296 exact-match `_redirects` rules + 3 query-param rules in `netlify.toml` |
| **Preview/deploy URLs** | Must | Branch/PR deploys for visual QA before merge |
| **Sanity webhook → rebuild** | Should | Content editors change redirects or published state; site should rebuild without manual intervention |
| **Custom domain + HTTPS** | Must | `sugartown.io` with automatic TLS |
| **GitHub Actions CI** | Must | Existing pipeline validates, builds; deployment should integrate cleanly |
| **Cost** | Nice | Personal/portfolio site — low traffic (~500 visits/month initially) |
| **Build speed** | Nice | Current build: ~2s Vite + redirect fetch. Monorepo install matters more. |

---

## Candidates

### 1. Netlify

**Current state:** Already configured. `netlify.toml` committed. Dashboard build settings exist (base: `apps/web`, command: `pnpm build`, publish: `apps/web/dist`).

| Criterion | Assessment |
|-----------|------------|
| Static SPA hosting | ✅ Native. `/* /index.html 200` fallback in `_redirects` works as-is. |
| Redirect compatibility | ✅ **Best fit.** Both `_redirects` file format and `netlify.toml` `[[redirects]]` with `query = {}` tables are Netlify-native. The 3 query-param redirects (`/?p=`, `/?cat=`, `/?tag=`) use Netlify-specific syntax that no other platform supports without rewriting. |
| Preview URLs | ✅ Automatic deploy previews on every PR. URL format: `deploy-preview-{n}--{site}.netlify.app`. No config needed — enabled by default when GitHub repo is connected. |
| Sanity webhook → rebuild | ✅ Incoming webhook URL (build hook). Point Sanity's outgoing webhook at the Netlify build hook URL. Rebuild triggers on content publish. Can scope to specific dataset/document types via Sanity webhook filters. |
| Custom domain + HTTPS | ✅ Automatic Let's Encrypt. DNS via CNAME or Netlify DNS nameservers. |
| GitHub Actions integration | ✅ Can deploy via `netlify-cli` in CI, or let Netlify's own GitHub integration handle builds (current setup). Dual-build risk: if both Netlify and GH Actions build on push, you get redundant builds. Solvable by using GH Actions for CI checks only and Netlify for deploy. |
| Cost | ✅ **Free tier** covers this site: 100 GB bandwidth/month, 300 build minutes/month, 1 concurrent build. |
| Build speed | ✅ Monorepo builds need `pnpm install` of full workspace, but Netlify caches `node_modules`. Typical cold build: ~90s. Cached: ~45s. |

**Migration effort:** Zero. Already configured.

**Risks:**
- Netlify free tier limits to 300 build minutes/month. With Sanity webhooks triggering rebuilds on every content change, frequent editorial sessions could burn minutes. Mitigatable: batch webhook triggers with a 5-minute cooldown, or use Sanity's webhook filter to only trigger on redirect document changes.
- Monorepo detection: Netlify's base directory setting (`apps/web`) means it only watches that subtree for changes. Commits touching only `packages/design-system` won't trigger a rebuild unless you configure `NETLIFY_BUILD_BASE` or add a custom `netlify.toml` `[build]` `ignore` script. Not a problem today (DS changes always accompany web changes), but could cause stale deploys if DS-only commits happen in the future.

---

### 2. Cloudflare Pages

| Criterion | Assessment |
|-----------|------------|
| Static SPA hosting | ✅ Native static hosting with edge distribution across 300+ cities. |
| Redirect compatibility | ⚠️ **Partial.** Cloudflare Pages supports a `_redirects` file with the same syntax as Netlify for exact-match and splat rules. However, **query-parameter matching is not supported** in `_redirects` or `_headers`. The 3 `netlify.toml` query-param redirects (`/?p=`, `/?cat=`, `/?tag=`) would need to be rewritten as a Cloudflare Pages Function (serverless JS at the edge) or a Cloudflare Worker. |
| Preview URLs | ✅ Automatic branch deploy previews. URL format: `{branch}.{project}.pages.dev`. |
| Sanity webhook → rebuild | ⚠️ **Indirect.** No native incoming build hook URL. Would need a Cloudflare Worker or a GitHub Actions workflow triggered by Sanity webhook → `repository_dispatch` to rebuild and deploy via `wrangler pages deploy`. More plumbing than Netlify. |
| Custom domain + HTTPS | ✅ Automatic TLS. If Cloudflare manages DNS (nameserver delegation), additional benefits: DDoS protection, WAF, caching rules. |
| GitHub Actions integration | ✅ `wrangler pages deploy dist/` in CI. Clean integration. |
| Cost | ✅ **Free tier** is generous: unlimited bandwidth, 500 builds/month, 1 concurrent build. |
| Build speed | ✅ Similar to Netlify. CF Pages caches dependencies. Edge distribution is faster for global visitors. |

**Migration effort:** Medium.
1. Add `_headers` file for cache control (optional).
2. Rewrite 3 query-param redirects as a Pages Function or Worker (~20 lines of JS).
3. Set up build hook plumbing for Sanity webhook (Worker → GH Actions dispatch or direct Wrangler deploy).
4. Remove `netlify.toml`.
5. Add Cloudflare project config (dashboard or `wrangler.toml`).

**Risks:**
- Query-param redirect rewrite is a one-time cost but introduces a serverless function dependency for 3 legacy redirect rules. If those WP query-param URLs have minimal inbound traffic (likely — they're WordPress internal permalink format), consider whether 3 rules justify the added complexity, or accept a small SEO loss.
- Cloudflare Pages Functions execute at the edge, which is great for performance but adds a debugging surface that doesn't exist with Netlify's declarative redirect config.

---

### 3. Vercel

| Criterion | Assessment |
|-----------|------------|
| Static SPA hosting | ✅ Native. Detects Vite SPA automatically. `vercel.json` `rewrites` for SPA fallback. |
| Redirect compatibility | ⚠️ **Partial.** `vercel.json` supports `redirects[]` with `source`, `destination`, `statusCode` — covers all exact-match rules. Query-parameter matching is supported via `has: [{ type: "querystring", key: "p" }]` syntax — so the 3 `netlify.toml` rules **can** be expressed, but require rewriting all 296+ rules from `_redirects` format into `vercel.json` JSON format. The `build-redirects.js` script would need to output JSON instead of Netlify flat-file format. |
| Preview URLs | ✅ Automatic deploy previews on every push. Best-in-class preview UX with comment integration. |
| Sanity webhook → rebuild | ✅ Native deploy hook URL. Same pattern as Netlify — Sanity webhook POSTs to Vercel deploy hook. |
| Custom domain + HTTPS | ✅ Automatic TLS. |
| GitHub Actions integration | ✅ Vercel CLI or GitHub integration. Same dual-build consideration as Netlify. |
| Cost | ⚠️ **Hobby tier is free** but limited: 100 GB bandwidth, builds are generous. **Commercial use requires Pro ($20/month)** — Vercel's ToS restricts Hobby tier to personal, non-commercial projects. If Sugartown is a professional portfolio that generates business leads, this is arguably commercial use. |
| Build speed | ✅ Fast builds. Vercel's monorepo support is strong (Turborepo is a Vercel product). |

**Migration effort:** High.
1. Rewrite `build-redirects.js` to output `vercel.json` redirects array instead of `_redirects` flat file.
2. Convert structural redirects (splats) to Vercel rewrite syntax.
3. Convert 3 query-param redirects to `has` conditions.
4. Remove `netlify.toml` and `_redirects`.
5. Add `vercel.json` with rewrites, redirects, and build config.
6. Monorepo root detection: Vercel needs `vercel.json` at root with `rootDirectory` pointing to `apps/web`, or use Vercel's monorepo project settings.

**Risks:**
- Commercial use ambiguity on Hobby tier. A professional portfolio site is a grey area.
- Redirect format migration is significant — 296 rules need format conversion, and the build-time generation script needs rearchitecting.
- Vercel's opinionated framework detection may conflict with the plain Vite SPA setup (wants to detect Next.js, Nuxt, etc.). Solvable with explicit config, but adds friction.

---

### 4. Self-hosted (VPS + Caddy/Nginx)

| Criterion | Assessment |
|-----------|------------|
| Static SPA hosting | ✅ Caddy or Nginx serves `dist/` with `try_files $uri /index.html`. Full control. |
| Redirect compatibility | ✅ **Full control.** All redirect types expressible in Caddy/Nginx config. Query-param matching, regex, rewrite — no limitations. |
| Preview URLs | ❌ **Manual.** No automatic deploy previews. Would need to build a preview infrastructure: deploy PR branches to `pr-{n}.preview.sugartown.io` subdomains, configure wildcard DNS, write deployment scripts. Significant effort. |
| Sanity webhook → rebuild | ⚠️ **Custom.** Need a lightweight webhook receiver (Express/Fastify endpoint on the VPS, or a GitHub Actions `repository_dispatch` triggered by Sanity) that pulls, builds, and deploys. ~50 lines of code, but another thing to maintain. |
| Custom domain + HTTPS | ✅ Caddy auto-TLS with Let's Encrypt. Nginx + certbot. |
| GitHub Actions integration | ⚠️ CI deploys via SSH/rsync to VPS. Need to manage SSH keys, deploy user, firewall rules. |
| Cost | ⚠️ **$5–12/month** for a small VPS (Hetzner, DigitalOcean, Linode). Not free, and requires ongoing maintenance (OS updates, security patches). |
| Build speed | ✅ Build runs wherever CI runs. Deploy is a file copy — sub-second. |

**Migration effort:** High.
1. Provision VPS, configure Caddy/Nginx, TLS, firewall.
2. Write deployment script (rsync from CI to VPS).
3. Convert all redirects to Caddy/Nginx syntax.
4. Build preview URL infrastructure (or accept no previews).
5. Build webhook receiver.
6. Ongoing maintenance burden: OS patches, uptime monitoring.

**Risks:**
- Single point of failure (one VPS). No CDN edge distribution unless fronted by Cloudflare.
- Maintenance burden is ongoing and unbounded — security patches, disk space, certificate renewal issues.
- No preview URLs without significant infrastructure investment.
- Overkill for a static SPA with no server-side rendering requirements.

---

## Decision Matrix

| Criterion | Weight | Netlify | CF Pages | Vercel | Self-hosted |
|-----------|--------|---------|----------|--------|-------------|
| Redirect compat | Must | ✅ Native | ⚠️ 3 rules need Worker | ⚠️ Format rewrite | ✅ Full control |
| Preview URLs | Must | ✅ Automatic | ✅ Automatic | ✅ Best-in-class | ❌ Manual |
| Webhook rebuild | Should | ✅ Build hook | ⚠️ Needs plumbing | ✅ Deploy hook | ⚠️ Custom |
| Cost | Nice | ✅ Free | ✅ Free | ⚠️ $0–20/mo | ⚠️ $5–12/mo |
| Migration effort | — | ✅ Zero | Medium | High | High |
| Edge performance | Nice | Good | ✅ Best | Good | ⚠️ Single region |

---

## Recommendation

**Netlify** — stay where you are.

### Rationale

1. **Zero migration cost.** The infrastructure is already configured and committed. `netlify.toml`, `_redirects`, and `build-redirects.js` are Netlify-native. Every other option requires rewriting the redirect layer.

2. **Query-param redirects are a differentiator.** The 3 `netlify.toml` `[[redirects]]` rules with `query = {}` matching are unique to Netlify's config format. Cloudflare and Vercel can handle them, but require serverless functions or format rewrites respectively. For 3 rules serving legacy WordPress `/?p=` URLs, the rewrite cost exceeds the benefit.

3. **Deploy previews and build hooks are native.** Both Sanity webhook integration and PR preview URLs work out of the box with no custom code.

4. **Free tier is sufficient.** 100 GB bandwidth and 300 build minutes/month covers a low-traffic portfolio site. The only risk is excessive webhook-triggered rebuilds, mitigatable with Sanity webhook filters (trigger only on `redirect` document changes, not all content).

### What to do now

1. **Connect the GitHub repo to Netlify** (if not already) for automatic deploy previews on PRs.
2. **Set up a Sanity webhook** → Netlify build hook URL, filtered to `redirect` document type changes. This ensures the `_redirects` file stays current without manual rebuilds.
3. **Configure the custom domain** (`sugartown.io`) in Netlify dashboard when ready for DNS cutover.
4. **DNS cutover:** Update `sugartown.io` nameservers to Netlify DNS (or add CNAME record if keeping existing DNS provider). Netlify provisions TLS automatically.

### When to reconsider

- **If global edge performance becomes critical** (e.g., significant international audience), consider Cloudflare Pages for its 300+ city edge network. Migration cost at that point: ~1 day to rewrite 3 query-param rules as a Pages Function.
- **If the site grows beyond static SPA** (SSR, API routes, edge middleware), Vercel or Cloudflare Workers would offer more runtime flexibility.
- **If build minutes become a constraint** due to frequent content-triggered rebuilds, Cloudflare Pages' 500 builds/month free tier is more generous.

---

*sugartown.io · docs/reports/hosting-evaluation · 2026-03-15*
