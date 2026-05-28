---
**Epic:** SUG-131 — AEO Technical Fundamentals — Person JSON-LD, meta/OG audit, sitemap
**Linear Issue:** [SUG-131](https://linear.app/sugartown/issue/SUG-131/aeo-technical-fundamentals-person-json-ld-metaog-audit-sitemap)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-131 — AEO Technical Fundamentals — Person JSON-LD, meta/OG audit, sitemap

Add Person structured data (JSON-LD) to /about, audit title/meta description and OG tags on key pages, and confirm sitemap submission to Google Search Console.

## Background

AI answer engines (Perplexity, Gemini AI Overviews, SearchGPT) use structured data to establish entity facts. Without a Person JSON-LD block on /about, they must infer who Becky Head is from prose — which produces lower-confidence entity associations. This is the highest-ROI AEO signal missing from the site.

Additionally, SeoHead.jsx output has not been audited for title/meta density (name + domain + role co-occurring on key pages) or for OG image URL completeness (a known partial-implementation issue with siteSettings.defaultOgImage). The sitemap.xml exists (shipped SUG-15) but submission to Google Search Console is unconfirmed.

This epic addresses the technical layer only. Content edits (page answer leads, Agentic Caucus article) are SUG-132. Off-site signals (LinkedIn, GitHub) are SUG-133.

## Objective

After this epic: /about emits a valid Person JSON-LD block that AI crawlers can use to establish Becky Head's entity profile. Homepage, /about, and /services each have a title tag containing her name and one domain term. OG tags output fully qualified image URLs. Sitemap.xml is confirmed submitted and indexed in Google Search Console.

Layers touched: React (SeoHead.jsx), Sanity (siteSettings if OG image URL fix requires it), tooling (GSC submission). No schema changes needed. No content changes — copy edits belong in SUG-132.

## Scope

- [ ] Add Person JSON-LD structured data to /about — `name`, `jobTitle`, `url`, `sameAs` (LinkedIn + GitHub). Layer: frontend (AboutPage.jsx or SeoHead.jsx)
- [ ] Audit `<title>` tags on homepage, /about, /services — each must contain "Becky Head" and at least one domain term (e.g. "headless CMS", "product manager", "fractional PM"). Layer: frontend (SeoHead.jsx + Sanity page content)
- [ ] Audit `<meta name="description">` on same pages — must be 120–160 chars, contain name + role + one differentiator. Layer: frontend (SeoHead.jsx + Sanity page content)
- [ ] Audit OG `og:image` tags — confirm URLs are fully qualified (`https://sugartown.io/...`), not relative paths. Fix if broken. Layer: frontend (SeoHead.jsx)
- [ ] Confirm `/sitemap.xml` is submitted to Google Search Console and indexed. Document status. Layer: tooling/ops (no code change if already submitted)
- [ ] Verify `robots.txt` does not inadvertently block AEO crawlers (GPTBot, PerplexityBot, ClaudeBot). Layer: tooling

## Phases

Single-phase. All items are in the same technical layer (SeoHead.jsx + ops verification). Ship together.

## Acceptance criteria

- [ ] `/about` page source includes `<script type="application/ld+json">` with a valid Person schema containing at minimum: `@type: Person`, `name: "Becky Head"`, `jobTitle`, `url: "https://sugartown.io"`, `sameAs: [LinkedIn URL, GitHub URL]`
- [ ] `<title>` on `/` contains "Becky Head" and a role/domain term
- [ ] `<title>` on `/about` contains "Becky Head" and a role/domain term
- [ ] `<title>` on `/services` contains "Becky Head" and a role/domain term
- [ ] `og:image` on all key pages resolves to a fully qualified URL (no 404, no relative path)
- [ ] Google Search Console: sitemap.xml listed and status is not "Couldn't fetch" or "Has errors"
- [ ] `robots.txt` does not block `GPTBot`, `PerplexityBot`, or `ClaudeBot`

## Technical notes

**Activation audit:** Read `apps/web/src/components/SeoHead.jsx` to understand current title/OG construction before writing any changes. The OG image issue is a known partial implementation — check whether `siteSettings.defaultOgImage` resolves to a relative or absolute URL.

**Person JSON-LD placement:** Options are (a) injected via SeoHead.jsx with a conditional when `docType === 'about'`, or (b) a standalone `JsonLd` component imported by AboutPage.jsx. Audit the existing SeoHead pattern first.

**robots.txt:** Check `apps/web/public/robots.txt`. Common AEO crawlers to allow: `GPTBot` (OpenAI), `PerplexityBot`, `ClaudeBot` (Anthropic), `Google-Extended` (Gemini). Do not block any of these. If the file uses `Disallow: /` for any bot, that is a bug.

**Sitemap:** The sitemap was shipped in SUG-15. GSC submission is an ops step. If GSC shows "Submitted and indexed: 0 URLs", that is a separate issue (likely authentication or verification). Document the current state.

**Model & Mode [REQUIRED]:** `/model opusplan` — SeoHead.jsx audit + JSON-LD injection is a focused code change but requires reading the component API carefully before writing.

## Non-Goals

- Content rewrites (page answer leads, Agentic Caucus article) — those are SUG-132
- Off-site authority signals (LinkedIn, GitHub, external publishing) — those are SUG-133
- Organization schema for Sugartown Digital — low priority, post-launch if needed
- FAQPage or HowTo structured data — post-launch
- Google Search Console historic data analysis — ops only, no code

## Related

- **Linear:** [SUG-131](https://linear.app/sugartown/issue/SUG-131/aeo-technical-fundamentals-person-json-ld-metaog-audit-sitemap)
- **Related epics:** SUG-132 (content pass), SUG-133 (authority building)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
