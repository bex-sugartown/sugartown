---
**Epic:** ST-255 — Inbound Visibility E1.1: one canonical host
**Issue:** [#255](https://github.com/bex-sugartown/sugartown/issues/255)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** no
---

# ST-255 — Inbound Visibility E1.1: one canonical host

Make the homepage answer on one host, with `www` and `/home` redirecting to it.

## Background

Search Console (2026-11-16, Aug 15 to Nov 14) shows the homepage split across three URLs: `www.sugartown.io/` holds 280 impressions, bare `sugartown.io/` holds 31, and `/home` is a third variant. All 10 indexed examples and the submitted sitemap use bare `sugartown.io`, so bare is the declared host (plan decision D2, Likely, confirm in Netlify). The site is Netlify-hosted; `SITE_URL` defaults to `https://sugartown.io` in `build-sitemap.js` and `prerender-content.mjs`. Plan: `resume-factory/Claude outputs/Inbound-Visibility/Inbound-Visibility_EXECUTION-PLAN.md` (finding S11, step E1.1).

## Objective

After this epic `https://www.sugartown.io/*`, `http://` variants and `/home` each 301 to the bare-host equivalent, and `rel=canonical` on every page names the bare host. Layers touched: Netlify config (dashboard primary domain and `_redirects` or `netlify.toml`), React render only if a canonical tag disagrees. Not touched: Sanity schema, GROQ, content.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Confirm the Netlify primary domain and which host currently serves 200 vs redirects — layer: tooling (read only)
- [ ] 301 the non-canonical host to the canonical host, path preserved — layer: Netlify config
- [ ] 301 `/home` to `/` — layer: Netlify config or `build-redirects.js`
- [ ] Verify `rel=canonical` in `SeoHead.jsx` and the prerender agree with the chosen host — layer: frontend / tooling
- [ ] Log the deploy date in the Inbound Visibility report Change log — layer: docs (resume-factory)

## Phases

Single phase.

## Acceptance Criteria

- [ ] `curl -sI https://www.sugartown.io/` returns 301 with `location: https://sugartown.io/`
- [ ] `curl -sI https://sugartown.io/home` returns 301 to `/`
- [ ] `curl -s https://sugartown.io/ | grep canonical` names the bare host on the homepage, one article and one node
- [ ] Search Console URL Inspection on all three homepage URLs reports the bare host as canonical (post-ship check, read a week after deploy)
- [ ] Deploy preview checked before production

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Activation audits:** read the Netlify primary-domain setting (Netlify dashboard or the Netlify MCP `netlify-project-services-reader`); read `apps/web/public/_redirects` head and `scripts/build-redirects.js` for where host and `/home` rules can live. Netlify host redirects need a `https://www.sugartown.io/* https://sugartown.io/:splat 301!` rule, which `_redirects` supports with a full URL source.
- **Decision D2 (plan):** keep bare `sugartown.io` unless Netlify's primary domain is `www`. If it is `www`, stop and ask: switching means moving the sitemap, canonicals and indexed pages.
- **Upstream:** none. **Downstream:** #256 (prerender and 404) needs this host decision.
- **Push is a production deploy.** Check the deploy preview first, and batch with other site changes per plan rule 4 (one deploy per batch).
- **Do not click Validate Fix in Search Console.** That is plan step E1.8 and waits for this epic, #256 and #257 to be live.

## Model & Mode [REQUIRED]

`/model sonnet` — redirect config and a canonical check; no architecture decision beyond D2.

## Non-Goals

- Sitemap regeneration (#257).
- Prerendering the homepage (#256).
- Any LinkedIn change.

## Related

- **GitHub:** [#255](https://github.com/bex-sugartown/sugartown/issues/255)
- **Shipped context:** #127 (prerender trailing-slash canonical), #239 (og:image, E1.6, done)
- **Epic template:** `docs/epic-template.md`
