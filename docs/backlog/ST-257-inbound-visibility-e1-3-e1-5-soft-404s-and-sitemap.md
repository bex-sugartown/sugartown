---
**Epic:** ST-257 — Inbound Visibility E1.3 + E1.5: soft 404 rule and a clean sitemap
**Issue:** [#257](https://github.com/bex-sugartown/sugartown/issues/257)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** no
---

# ST-257 — Inbound Visibility E1.3 + E1.5: soft 404 rule and a clean sitemap

Decide the 27 Search Console soft 404s by class, retire what is dead, and regenerate the sitemap with only indexable 200 URLs.

## Background

Search Console (baseline Aug 15 to Nov 14, 2026) lists 27 soft 404s: 19 `/tags/` pages, 5 `/nodes/` URLs (4 pages, one also listed with a trailing slash), `/series/release-notes`, and 2 root-level roadmap pages (`/knowledge-graph-roadmap/`, `/sugartown-platform-roadmap/`). The tag pages are also in the sitemap, so they are live pages Google judges empty. 51 URLs are crawled but not indexed, including two real articles (`/articles/core-web-vitals-dont-belong-to-frontend`, `/articles/site-that-built-itself`). Google last read `/sitemap.xml` on May 30, 2026 and found 122 pages; the live file lists 265. A second submitted entry, `https://sugartown.io/sitemap`, shows 1 error: that URL is the site's own HTML `SitemapPage` route, not an XML file. 61 noindex pages sit in the not-indexed report. Plan: `resume-factory/Claude outputs/Inbound-Visibility/Inbound-Visibility_EXECUTION-PLAN.md` (steps E1.3, E1.5; findings S9, S12 to S14).

## Objective

After this epic every one of the 27 URLs has a recorded decision, retired URLs return 404 or 410, `sitemap.xml` lists only indexable 200 URLs, and Search Console holds the resubmitted sitemap with the bad `/sitemap` entry removed. Layers touched: `apps/web/scripts/build-sitemap.js`, `_redirects` / `build-redirects.js`, the prerender (tag pages), Search Console (human step), content only if a node needs a fix. Not touched: Sanity schema.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Phase 0 data check: confirm each of the 27 URLs live (status, body, noindex) and save the list — layer: tooling (read only)
- [ ] Tag rule (decision D3): tags with 3 or more posts render prerendered real content; the rest get noindex and leave the sitemap — layer: tooling / frontend
- [ ] 5 `/nodes/` URLs and `/series/release-notes`: check each is live, fix the trailing-slash duplicate — layer: tooling
- [ ] 2 root-level roadmap URLs: redirect to the current page or return 404/410 — layer: Netlify config
- [ ] Run URL Inspection on the two unindexed articles, check canonical and trailing-slash handling, request indexing after #256 deploys — layer: Search Console (Bex or Claude in Chrome)
- [ ] Regenerate the sitemap without noindex and retired URLs — layer: tooling (`build-sitemap.js`)
- [ ] Resubmit `/sitemap.xml` and remove the `/sitemap` entry — layer: Search Console (Bex)
- [ ] Log the decision table and deploy date in the Inbound Visibility report — layer: docs (resume-factory)

## Phases

| Phase | Ships | Gate |
|---|---|---|
| 1 | Decision table for all 27 URLs | Bex decides tag rule D3 (select-list gate) |
| 2 | Redirects, 404/410 and tag rule applied | none |
| 3 | Sitemap regenerated; resubmit and cleanup in Search Console | none |

## Acceptance Criteria

- [ ] Every one of the 27 URLs has a written decision in the epic doc
- [ ] Retired URLs return 404 or 410: `curl -sI <url>` for each
- [ ] `grep -c "<loc>" dist/sitemap.xml` equals the count of indexable 200 URLs, and no URL in it carries noindex or a redirect
- [ ] The sitemap lists the two unindexed articles
- [ ] Search Console shows `/sitemap.xml` resubmitted with a current "pages found" count and no `/sitemap` entry (post-ship check, Bex)
- [ ] Netlify deploy preview checked before production

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Decision D3 (plan, recommended):** keep tags with 3 or more posts and prerender them; noindex the rest and drop them from the sitemap. Ask Bex via `AskUserQuestion` in Phase 1; do not decide for her.
- **Activation audits:** read `apps/web/scripts/build-sitemap.js` (how noindex and tags are filtered today), `apps/web/src/pages/` for `TaxonomyPlaceholderPage` (the tag detail page) and how it sets robots, and `_redirects` for any existing roadmap rules. Count posts per tag with GROQ before applying D3: list the values, do not `count(defined())` a nested filter.
- **Upstream:** #256 (a working 404 and prerendered index routes). **Downstream:** plan step E1.8 (Validate Fix), which is a human step done only after this epic and #255 and #256 are live.
- **Do not click Validate Fix** in this epic.
- **Push is a production deploy.** Check the Netlify deploy preview; one deploy per batch (plan rule 4).
- **Search Console is read and click work for Bex or Claude in Chrome**, with Chrome site approval. This session does not touch it.

## Model & Mode [REQUIRED]

`/model sonnet` — sitemap script and redirect work; the one judgment call (D3) goes to Bex.

## Non-Goals

- The real 404 mechanism and index prerender (#256).
- Schema cleanup (#258).
- Reading the Search Console generative AI report.
- Changing noindex policy for content types beyond tags.

## Related

- **GitHub:** [#257](https://github.com/bex-sugartown/sugartown/issues/257). Blocked on #256.
- **Epic template:** `docs/epic-template.md`
