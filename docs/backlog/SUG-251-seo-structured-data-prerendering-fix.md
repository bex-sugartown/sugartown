---
**Epic:** SUG-251 — SEO meta & structured-data prerendering (fix CSR mainEntity race)
**Linear Issue:** [SUG-251](https://linear.app/sugartown/issue/SUG-251/seo-meta-and-structured-data-prerendering-fix-csr-mainentity-race)
**Status:** Backlog
**Priority:** 🟢 Next — high value, ready to pick up
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-251 — SEO meta & structured-data prerendering (fix CSR mainEntity race)

Fix the client-side-rendering race that causes intermittent Google Search Console
"missing mainEntity" failures on `/about`, by baking structured data and core SEO meta
into the HTML Google actually fetches, instead of depending on a client-side data fetch
completing before the crawler's render pass captures the page.

## Background

Google Search Console's Profile Page enhancement report has flagged `/about` for a
missing `mainEntity` field across two separate windows (late April–May and late
June–early July 2026), most recently validating on 7/10/26 — yet a fresh check shows
`mainEntity` missing again. Direct investigation (this epic's own diagnostic pass,
2026-07-27) ruled out a data or logic bug: the live Sanity query in
`apps/web/src/lib/queries.js` (`pageBySlugQuery`'s `primaryPerson` `select()`, shipped
2026-05-28 in SUG-131) currently resolves correctly to Bex's person document, and
`apps/web/src/lib/jsonLd.js`'s `buildPage()`/`mainEntity` wiring is unchanged and correct.
The real cause is architectural: Sugartown is a pure client-side SPA (Vite + React, no
SSR, confirmed via `netlify.toml`'s SPA catch-all). Every page's SEO meta and JSON-LD are
injected imperatively in a `useEffect` inside `SeoHead.jsx`, and `RootPage.jsx` (the
generic `/:slug` route handler serving `/about`, `/services`, `/contact`, and all
`platform/*` pages) renders nothing but a "Loading…" div — no `SeoHead` at all — until its
async Sanity fetch resolves. The static `apps/web/index.html` fallback (served before any
JS runs) has only a generic site-wide title/description and zero JSON-LD. Whether
Googlebot's structured-data check sees `mainEntity` is therefore a race between the
Sanity fetch and whenever Google snapshots the rendered DOM — not a deterministic
pass/fail tied to any single commit. That explains the oscillating GSC history and why a
page can validate on one crawl and fail the next with no code change in between.

## Objective

After this epic: every content-detail route that currently depends on a client-side
Sanity fetch to populate its SEO meta and JSON-LD (title, description, canonical, Open
Graph, and the doc-specific JSON-LD block — Article/Node/CaseStudy/Person/ProfilePage)
serves that content in the HTML a crawler receives, independent of whether client JS
executes or how long the data fetch takes. This epic touches: a build-time or
request-time rendering mechanism (the specific approach is a Phase 1 decision — options
include Netlify's built-in bot prerendering, a Netlify Edge Function serving
dynamically-rendered meta for bot user-agents, or a custom build-time static-HTML-per-slug
step extending the existing `apps/web/scripts/build-redirects.js` precedent) and,
depending on which option is chosen, possibly `apps/web/index.html`, Netlify config, or a
new build script. It explicitly does not touch: the JSON-LD schema shapes themselves
(`jsonLd.js`'s per-type builders are correct and unchanged), the Sanity schema, or the
underlying `pageBySlugQuery`/`primaryPerson` logic (already verified correct).

## Scope

- [ ] Audit every route that depends on a client-side Sanity fetch for per-page SEO
      meta/JSON-LD, cross-checked against the live route table in `apps/web/src/App.jsx`
      — confirmed so far: `/articles/:slug` (ArticlePage), `/nodes/:slug` (NodePage),
      `/case-studies/:slug` (CaseStudyPage), `/people/:slug` (PersonProfilePage), and the
      generic `/:slug` catch-all (RootPage — covers `/about`, `/services`, `/contact`, and
      every `platform/*` sub-page) — layer: audit/documentation
- [ ] Document current no-JS fallback behaviour precisely: `apps/web/index.html` serves
      only a generic site-wide `<title>`/description with zero per-page meta and zero
      JSON-LD when a crawler doesn't execute JS or times out before the fetch resolves —
      layer: audit/documentation
- [ ] Evaluate at least two real solution options with a written trade-off comparison —
      (1) Netlify's built-in Prerendering feature (bot-triggered snapshot serving,
      requires confirming plan-tier availability), (2) a Netlify Edge Function performing
      user-agent-based dynamic rendering (serves a pre-fetched meta+JSON-LD snippet to
      known bot UAs, human traffic unaffected), (3) a custom build-time static-HTML-per-
      slug generation step following `build-redirects.js`'s existing pattern of turning
      Sanity data into static build output — layer: architecture decision (Pre-Execution
      Gate under plan mode; get Bex's explicit approval on the chosen approach before
      Phase 2 begins)
- [ ] Implement the chosen mechanism for the confirmed route set (Scope item 1), ensuring
      it produces correct `<title>`, meta description, canonical URL, Open Graph tags,
      and doc-specific JSON-LD (including `/about`'s ProfilePage `mainEntity`) — layer:
      infrastructure/build tooling
- [ ] Verify against a real crawler-equivalent check (Google's Rich Results Test or URL
      Inspection Live Test, both of which independently render the page — not just a
      visual browser check) for `/about` specifically, plus at least two other affected
      route types (one article, one node) to confirm the fix generalizes — layer:
      verification

## Phases

**Phase 1 — Audit & solution selection.** Confirm the full affected-route list against
`App.jsx`, document the current no-JS fallback gap, evaluate the solution options above,
and get Bex's explicit sign-off on the chosen mechanism before any implementation begins.

**Phase 2 — Implementation.** Build and deploy the chosen mechanism for the confirmed
route set.

**Phase 3 — Verification.** Re-check `/about` and at least two other route types via
Google's Rich Results Test / URL Inspection Live Test against the deployed production
site, and record the evidence (screenshots or tool output) in the shipped doc.

## Acceptance criteria

- [ ] The route/meta audit table is complete and matches the live `App.jsx` route table —
      no route claimed as "affected" or "unaffected" without being checked directly
- [ ] A written comparison of at least two solution options exists, and Bex has given
      explicit approval on the chosen approach before Phase 2 implementation begins
- [ ] Post-implementation, a non-JS-executing fetch (or Google's Rich Results Test) of
      `/about` shows the full JSON-LD graph including `ProfilePage` + `mainEntity`,
      without requiring client JS to run first
- [ ] The same check passes for at least two other affected route types (one
      article-family route, one node-family route)
- [ ] Human traffic (real browsers) is unaffected — the fix does not change what a normal
      visitor sees or how the SPA behaves for them

## Human QA Walkthrough — example local pages

Not applicable in the CSS/layout sense — this epic changes what content a crawler
receives, not any visible UI, layout token, or rendered component. The equivalent
verification is crawler-facing, not visual: Google's Rich Results Test / URL Inspection
Live Test against the deployed production URLs, per the Phase 3 acceptance criteria above,
not a local dev-server visual check.

## Technical notes

- **Content Write Gate:** Not triggered — no Sanity content writes.
- **Instruction & Rule File Write Gate:** Not expected to trigger, but if Phase 1's chosen
  mechanism introduces a new architectural pattern worth codifying (e.g. "how Sugartown
  serves bot-visible meta"), consider whether a CLAUDE.md convention addition is warranted
  at close-out — treat that as a Phase 2/3 finding, not a pre-decided scope item.
- **Schema changes:** None. `primaryPerson`'s GROQ `select()` and all `jsonLd.js` builders
  are confirmed correct and are not part of this epic's fix.
- **Upstream dependencies:** None blocking. SUG-131 (shipped 2026-05-28) is the epic that
  introduced the `primaryPerson`/`mainEntity` logic whose fragility this epic addresses;
  it is not in-flight and does not gate activation.
- **Activation audits:**
  - Re-confirm the affected-route list against a fresh read of `apps/web/src/App.jsx` —
    the list captured during epic authoring (2026-07-27) is a snapshot; new routes may
    have been added since.
  - Confirm the Netlify account's plan tier supports the built-in Prerendering feature
    before including it as a viable Phase 1 option — this is typically a paid-tier
    feature and its availability directly gates whether option (1) is realistic.
  - Read `docs/reports/hosting-evaluation.md` in full before proposing an Edge
    Function-based approach — confirm it doesn't conflict with or duplicate an existing
    hosting decision recorded there.
  - Note the separate, pre-existing gap found during this epic's diagnostic pass (not in
    scope here): `ProjectDetailPage.jsx` and `ToolDetailPage.jsx` both call
    `generateJsonLd(null, siteSettings)` — they never emit type-specific JSON-LD at all,
    regardless of the render-timing issue. Worth a follow-up ticket, not part of this fix.

## Model & Mode [REQUIRED]

`/model opus` + plan mode. This is an SSR/rendering-strategy architecture decision — the
epic template names exactly this class of work ("architecture epics: SSR strategy...") as
the Opus + plan-mode case. Phase 1's solution comparison requires weighing hosting-tier
constraints, crawler behaviour, and build-pipeline trade-offs before Bex approves a
direction; Sonnet's default execution mode is the wrong tool for that decision, and plan
mode gives Bex the Pre-Execution Gate checkpoint before Phase 2 implementation starts.

## Non-Goals

- No migration of the frontend to a different framework (Next.js, Remix, etc.) purely to
  get SSR. Evaluate solutions within the current Vite + React SPA architecture first.
- No change to the JSON-LD schema shapes or field mappings in `jsonLd.js` — those are
  confirmed correct; this epic fixes delivery/timing, not content.
- No fix to `ProjectDetailPage`/`ToolDetailPage` passing `generateJsonLd(null, ...)` — a
  real, separate content-completeness gap found during diagnosis, but unrelated to the
  render-race this epic addresses. Flagged for a follow-up ticket instead.
- No addition of `ItemList`/`CollectionPage` JSON-LD to archive or home pages — they
  currently pass `null` deliberately and that's out of scope here.
- No change to the underlying Sanity `page.primaryPerson` derivation logic — verified
  correct and not the source of the bug.

## Related

- **Linear:** [SUG-251](https://linear.app/sugartown/issue/SUG-251/seo-meta-and-structured-data-prerendering-fix-csr-mainentity-race)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer
  Checklist, Schema Enum Audit, and Files to Modify at activation time
- **Prior related epic (shipped):** SUG-131 (AEO Technical Fundamentals — introduced the
  `primaryPerson`/`mainEntity` logic this epic's fix stabilizes)
- **Existing precedent for build-time Sanity → static output:**
  `apps/web/scripts/build-redirects.js`
- **Hosting context:** `docs/reports/hosting-evaluation.md` (read in full at activation)
