---
**Epic:** ST-256 — Inbound Visibility E1.2 + E1.4: real 404 and prerendered home and index routes
**Issue:** [#256](https://github.com/bex-sugartown/sugartown/issues/256)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** no
---

# ST-256 — Inbound Visibility E1.2 + E1.4: real 404 and prerendered home and index routes

Prerender the homepage and index routes with real metadata, and make unknown URLs return HTTP 404.

## Background

`apps/web/public/_redirects` ends with `/* /app.html 200`, so every unknown URL returns 200 (finding S2). Changing that line to 404 would also 404 real client routes that are not prerendered: `/`, `/tags`, `/categories`, archives, `/platform/*`, `/knowledge-graph`, `/sitemap`, `/library` (see `apps/web/src/App.jsx`). Separately, the homepage and index routes ship an empty shell to crawlers (S1), the homepage title lacks name and role (S4) and `/`, `/about`, `/cv-resume`, `/contact` and the case study lack descriptions (S3). Claude's web search read only the title and meta description of sugartown.io in the 2026-11-17 GEO baseline. Both steps need one valid-route list, so they are one epic (plan steps E1.2 and E1.4, plan: `resume-factory/Claude outputs/Inbound-Visibility/Inbound-Visibility_EXECUTION-PLAN.md`).

## Objective

After this epic raw HTML with no JavaScript shows title, H1, description and canonical on `/`, `/about`, `/cv-resume`, `/contact`, the case study and each index route, and a nonsense path returns HTTP 404. Layers touched: prerender script (`apps/web/scripts/prerender-content.mjs`), Netlify routing (`_redirects` or an Edge Function), React render only for the not-found page, and content (Studio copy edit for descriptions and the homepage title). Not touched: Sanity schema.

## Metadata plan

Not applicable, no content piece. Descriptions and the homepage title use the years wording decided 2026-11-16 (E0.5): 9+ years in product, 28 years in digital since 1998. The 34-year career count stays in the article only.

## Scope

- [ ] Build one list of valid routes from `App.jsx` plus Sanity slugs, shared by the prerender and the 404 check — layer: tooling
- [ ] Prerender `/` and index routes (archives, taxonomy indexes, `/platform/*` that crawlers need) with title, H1, description, canonical — layer: tooling / frontend
- [ ] Return a real 404 for unknown URLs: either prerender every valid route then end `_redirects` with a 404, or a Netlify Edge Function that checks the list — layer: Netlify config
- [ ] Not-found page returns 404 and keeps its current body — layer: frontend
- [ ] Set the homepage title with name and role, and write descriptions for `/`, `/about`, `/cv-resume`, `/contact` and the case study — layer: content (Content Write Gate)
- [ ] Smoke spec: raw HTML check for the prerendered routes and a 404 check — layer: tooling

## Phases

| Phase | Ships | Gate |
|---|---|---|
| 1 | Valid-route list and index-route prerender, with metadata | none |
| 2 | Real 404 mechanism, picked from the Phase 1 route list | none |
| 3 | Descriptions and homepage title in Sanity | Content Write Gate proposal approved |

## Acceptance Criteria

- [ ] `curl -s https://sugartown.io/ | grep -E "<title>|<h1|description|canonical"` shows all four with no JavaScript, on `/`, `/about`, `/cv-resume`, `/contact` and the case study page
- [ ] `curl -sI https://sugartown.io/zz-not-a-page` returns HTTP 404
- [ ] `curl -sI` returns 200 for `/tags`, `/categories`, `/articles`, `/platform/cms` and `/sitemap`
- [ ] The valid-route list covers every `App.jsx` route, checked by diff
- [ ] Descriptions proposal approved before any Sanity patch; drafts only, Bex publishes
- [ ] `pnpm test:smoke` passes; Netlify deploy preview checked before production

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate fires** for the homepage title and the five descriptions. Show a before/after table first. The Human-Publishes Rule applies: the agent stops at the draft.
- **Activation audits:** read `apps/web/src/App.jsx` and diff every route against the prerender output list; read `prerender-content.mjs` `run()` and `buildHtml()` (it already writes og:image, twitter tags and JSON-LD, #239 and #82); read `apps/web/public/_redirects` and `apps/web/scripts/build-redirects.js`. Check how `pageBySlug` and `RootPage` (`/:slug`) resolve, since `/about` and `/contact` are root pages.
- **Decision for Phase 2, in the epic:** prerender-all-then-404, or an Edge Function. Netlify note in `netlify.toml`: `_redirects` is processed before `netlify.toml`, and an Edge Function runs before both. Pick one and say why, per the plan's E1.2 row.
- **Upstream:** #255 (host decision). **Downstream:** #257, #258.
- **Do not break the SPA** for tags, categories and `/platform/*`: they are not prerendered today and a blanket 404 would kill them. The Phase 1 list prevents it.
- **Push is a production deploy.** Check the Netlify deploy preview first; one deploy per batch (plan rule 4).

## Model & Mode [REQUIRED]

`/model opus` with plan mode for the Phase 2 mechanism choice (prerender-all vs Edge Function), then exit to execute. Phases 1 and 3 are routine.

## Non-Goals

- Deciding the 27 soft 404s or the sitemap (#257).
- JSON-LD schema cleanup (#258).
- Prerendering tag pages with real content (decided in #257, decision D3).
- LinkedIn changes and clicking Validate Fix (plan E1.8).

## Related

- **GitHub:** [#256](https://github.com/bex-sugartown/sugartown/issues/256). Blocked on #255.
- **Shipped context:** #239 (og:image, E1.6), #82 and #212 (prerender JSON-LD), SUG-251
- **Epic template:** `docs/epic-template.md`
