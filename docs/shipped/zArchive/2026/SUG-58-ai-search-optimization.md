**Linear Issue:** SUG-58
## EPIC: AI Search Optimization — JSON-LD Structured Data + llms.txt

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — no new interactive elements. This epic adds invisible JSON-LD `<script>` tags and static files. No UI components created.
- [x] **Use case coverage** — `generateJsonLd()` utility must cover: article, node, caseStudy, person (detail), page (About/Services), site-wide (Organization + WebSite). Each maps to a schema.org type.
- [x] **Layout contract** — N/A. No visible render surface.
- [x] **All prop value enumerations** — N/A. No enum fields rendered.
- [x] **Correct audit file paths** — verified via `ls` and schema reads.
- [x] **Dark / theme modifier treatment** — N/A. JSON-LD is invisible.
- [x] **Studio schema changes scoped** — **No schema changes.** All required data fields already exist on the Person, Article, Node, CaseStudy, and siteSettings schemas. See "Why No Schema Changes" section below.
- [x] **Web adapter sync scoped** — N/A. No DS component created.
- [x] **Composition overlap audit** — N/A. No schema composition.
- [x] **Atomic Reuse Gate** — `generateJsonLd()` is a new utility in `lib/`. No existing equivalent. Will be consumed by SeoHead (all pages) and potentially build-sitemap.js. API is composable: accepts `(doc, siteSettings)`, returns a JSON-LD object.

---

## Context

Sugartown already has solid SEO infrastructure:
- `SeoHead.jsx` — client-side meta/OG/Twitter injection, hero LCP preload
- `seoMetadata` object schema — reusable across all doc types, auto-generate mode
- `resolveSeo()` utility — GROQ fragments + fallback chain in `lib/seo.js`
- `build-sitemap.js` — generates XML sitemap + robots.txt at build time
- `siteSettings` doc — SEO defaults group (title, description, OG image)

What's missing: schema.org JSON-LD structured data, `llms.txt` for AI crawlers, and verification that AI bots can access the site.

The Person schema already has `socialLinks[]` with platform-typed URLs (LinkedIn, GitHub, etc.) — this IS the `sameAs` array. No new fields needed.

### Why No Schema Changes

| JSON-LD property | Source field | Schema | Status |
|-----------------|-------------|--------|--------|
| Person.name | `name` | person | exists |
| Person.jobTitle | `titles[0]` | person | exists |
| Person.description | `headline` | person | exists |
| Person.image | `image` | person | exists |
| Person.sameAs | `socialLinks[].url` | person | exists |
| Person.knowsAbout | `expertise[]` → category titles | person | exists |
| Person.address | `location` | person | exists |
| Article.headline | `title` | article/node/caseStudy | exists |
| Article.description | `excerpt` or `seo.description` | all content types | exists |
| Article.author | `authors[]` → person refs | article/node/caseStudy | exists |
| Article.datePublished | `publishedAt` | all content types | exists |
| Article.dateModified | `updatedAt` or `_updatedAt` | all content types | exists |
| Organization.name | `siteSettings.siteTitle` | siteSettings | exists |
| Organization.url | `siteSettings.siteUrl` | siteSettings | exists |
| Organization.logo | `siteSettings.defaultOgImage` | siteSettings | exists |

---

## Objective

After this epic, every page on sugartown.io has appropriate schema.org JSON-LD structured data injected in the document head. AI search engines (ChatGPT, Perplexity, Google AI Overviews) can extract structured entity data — author identity, article metadata, organization info — without relying on HTML parsing alone. An `llms.txt` file at the site root provides a curated AI-readable site description. AI crawlers are confirmed unblocked in `robots.txt`.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | ☑ Yes | ProfilePage JSON-LD for About/Services; WebPage for others |
| `article` | ☑ Yes | Article/BlogPosting JSON-LD |
| `caseStudy` | ☑ Yes | Article JSON-LD with `about` entities |
| `node` | ☑ Yes | Article/BlogPosting JSON-LD |
| `archivePage` | ☐ No | CollectionPage JSON-LD deferred — archive pages are listing surfaces, not entity pages. Low citation value. |
| `person` | ☑ Yes | Person JSON-LD on `/people/:slug` detail page |

---

## Scope

- [ ] `generateJsonLd(doc, siteSettings)` utility — `apps/web/src/lib/jsonLd.js` — CREATE
- [ ] Organization + WebSite JSON-LD — injected site-wide via SeoHead
- [ ] Article/BlogPosting JSON-LD — articles, nodes, case studies
- [ ] Person JSON-LD — `/people/:slug` detail pages, with `sameAs` from `socialLinks[]`
- [ ] WebPage / ProfilePage JSON-LD — pages (type varies by slug: About → ProfilePage, others → WebPage)
- [ ] JSON-LD injection mechanism — extend `SeoHead.jsx` or create `JsonLdHead.jsx`
- [ ] GROQ query updates — author refs need dereferencing for `Person` sub-objects in Article JSON-LD
- [ ] `llms.txt` — static file in `apps/web/public/`
- [ ] `robots.txt` audit — verify AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) are not blocked in `build-sitemap.js`
- [ ] SSR investigation spike — document whether client-injected JSON-LD is visible to AI crawlers, and if not, what the remediation path is

---

## Query Layer Checklist

> JSON-LD generation needs author data dereferenced. Current slug queries project `authors[]` as references but may not dereference person fields.

- [ ] `articleBySlugQuery` — verify `authors[]->{ name, slug, image, socialLinks, titles, headline }` is projected
- [ ] `nodeBySlugQuery` — same author projection
- [ ] `caseStudyBySlugQuery` — same author projection
- [ ] `pageBySlugQuery` — no author field, but needs siteSettings for Organization JSON-LD
- [ ] `personBySlugQuery` (in TaxonomyDetailPage or PersonProfilePage) — verify `socialLinks`, `titles`, `expertise[]->`, `headline`, `location` are projected
- [ ] `siteSettingsQuery` — verify `siteTitle`, `siteUrl`, `defaultOgImage` are available (already used by `resolveSeo()`)

---

## Non-Goals

- **No schema changes.** All data fields already exist. If a field is missing from a query projection, that's a GROQ change, not a schema change.
- **No new pages or routes.** JSON-LD is injected into existing pages.
- **No SSR implementation.** The spike documents the risk and options; actual SSR/prerendering is a separate infrastructure epic.
- **No DefinedTerm JSON-LD.** That ships with SUG-35 (Glossary).
- **No BreadcrumbList JSON-LD.** That ships with SUG-51 (Page URL Nesting).
- **No FAQPage JSON-LD.** Only appropriate if genuine Q&A content exists. Not forced.
- **No content rewrites for extractability.** Content structure guidance goes in the brand voice guide, not in code.

---

## Technical Constraints

**Monorepo / tooling**
- Utility lives in `apps/web/src/lib/jsonLd.js` — same layer as `seo.js`
- `llms.txt` is a static file in `apps/web/public/` — Vite copies it to `dist/` at build time
- `robots.txt` is generated by `build-sitemap.js` — AI crawler rules go there

**Query (GROQ)**
- Author dereferencing must use `->` with explicit field projection (not bare `->` which returns the full doc)
- siteSettings is already queried in `seo.js` via `SITE_SEO_FRAGMENT` — reuse or extend

**Render (Frontend)**
- JSON-LD injection via `<script type="application/ld+json">` in document head
- Two options: extend `SeoHead.jsx` to accept a `jsonLd` prop, or create a sibling `JsonLdHead.jsx` component
- Recommendation: extend `SeoHead.jsx` — it already manages head tags and cleans up on unmount
- JSON-LD must be valid JSON — use `JSON.stringify()`, not template literals

**SSR Risk**
- Sugartown is a Vite SPA (client-rendered). JSON-LD injected via `useEffect` may not be present when AI crawlers fetch the page.
- Google's crawler renders JS, so Google AI Overviews likely see it.
- ChatGPT/Perplexity crawlers may not render JS — they often fetch raw HTML only.
- The spike should: (1) test with `curl` whether JSON-LD appears in the raw HTML response, (2) check if `@vite/plugin-ssr` or `vite-plugin-prerender` can inject JSON-LD at build time, (3) document the decision.

---

## Files to Modify

**New files**
- `apps/web/src/lib/jsonLd.js` — CREATE: `generateJsonLd()` utility
- `apps/web/public/llms.txt` — CREATE: AI-facing site description

**Modified files**
- `apps/web/src/components/SeoHead.jsx` — extend to inject JSON-LD script tag
- `apps/web/src/lib/queries.js` — update author projections if needed
- `apps/web/scripts/build-sitemap.js` — add AI crawler User-Agent rules to robots.txt output

**Pages consuming JSON-LD** (via SeoHead, no direct changes unless projection updates needed)
- `apps/web/src/pages/ArticlePage.jsx`
- `apps/web/src/pages/NodePage.jsx`
- `apps/web/src/pages/CaseStudyPage.jsx`
- `apps/web/src/pages/PersonProfilePage.jsx`
- `apps/web/src/pages/RootPage.jsx`

---

## Phases

### Phase 1: Infrastructure + Site-Wide (1 commit)
1. Create `jsonLd.js` with `generateOrganizationJsonLd(siteSettings)` and `generateWebSiteJsonLd(siteSettings)`
2. Extend `SeoHead.jsx` to accept and inject JSON-LD
3. Wire Organization + WebSite JSON-LD into the app shell (every page)
4. Audit `build-sitemap.js` robots.txt output — add `Allow` rules for GPTBot, ClaudeBot, PerplexityBot, Google-Extended

### Phase 2: Content Type JSON-LD (1 commit)
1. Add `generateArticleJsonLd(doc, siteSettings)` — covers articles, nodes, case studies
2. Add `generatePersonJsonLd(doc, siteSettings)` — covers `/people/:slug`
3. Add `generatePageJsonLd(doc, siteSettings)` — WebPage default, ProfilePage for About/Services
4. Update GROQ projections to dereference author fields if not already projected
5. Wire into each page component via SeoHead

### Phase 3: llms.txt (1 commit)
1. Draft `llms.txt` — who Sugartown is, what the site contains, key topic areas, important page URLs
2. Place in `apps/web/public/`
3. Verify it's accessible at `/llms.txt` after build

### Phase 4: SSR Investigation Spike (documentation only)
1. Test: `curl https://sugartown.io/articles/[slug]` — is JSON-LD in the raw HTML?
2. If not: evaluate `vite-plugin-prerender` or `@vite/plugin-ssr` for build-time injection
3. Document findings and recommendation as a decision record

#### Decision Record (April 2026)

**Finding:** `curl https://sugartown.io/` returns a bare Vite SPA shell. The raw HTML
response contains no `<script type="application/ld+json">` tags, no resolved `<title>`,
and no populated meta tags. JSON-LD is injected by React's `useEffect` post-hydration —
it is not present in the static HTML served to crawlers.

**Implication by crawler type:**
- **Googlebot / Google AI Overviews** — Google's full crawler renders JavaScript. JSON-LD
  injected via `useEffect` will be visible after rendering. Google Rich Results Test
  should pass once these changes are deployed.
- **ChatGPT / PerplexityBot / other raw-fetch crawlers** — these crawlers typically fetch
  raw HTML without executing JavaScript. They will NOT see the JSON-LD. The structured
  data is invisible to them.

**Remediation options evaluated:**
1. `vite-plugin-prerender` — builds static HTML snapshots at build time. Each route gets
   a pre-rendered HTML file with all head tags (including JSON-LD) already present.
   Pros: no runtime changes, works with the existing Vite config, JSON-LD is in static HTML.
   Cons: requires a route manifest, build time increases proportionally to content count,
   does not solve dynamic data (content changes require a rebuild).
2. `@vite/plugin-ssr` (now Vike) — full SSR or pre-rendering. More powerful but a
   significant infrastructure change (server, edge functions, or static generation).
   Pros: solves the problem completely. Cons: major architectural change.
3. **Accept the limitation** — JSON-LD ships now, visible to Google. Non-rendering
   crawlers miss it. The `llms.txt` file fills the gap for AI crawlers that use it.
   Google AI Overviews and Bing are the high-value targets; both render JS.

**Recommendation:** Accept the limitation for now. Ship JSON-LD for Google (high value),
ship `llms.txt` for non-rendering AI crawlers. Track pre-rendering as a separate
infrastructure epic when content volume justifies the build-time cost. This is a known
limitation, not a blocker.

---

## Deliverables

1. **Utility** — `jsonLd.js` exists in `lib/`, exports generation functions per content type
2. **Site-wide JSON-LD** — every page has Organization + WebSite JSON-LD in the head
3. **Content JSON-LD** — article, node, caseStudy detail pages have Article/BlogPosting JSON-LD; person detail pages have Person JSON-LD with `sameAs`; root pages have WebPage/ProfilePage JSON-LD
4. **SeoHead extension** — SeoHead accepts and renders a `jsonLd` prop as `<script type="application/ld+json">`
5. **llms.txt** — accessible at `/llms.txt`, under 2,000 words, describes site purpose and content
6. **robots.txt** — AI crawlers confirmed not blocked
7. **SSR spike** — decision record documenting whether client-injected JSON-LD is visible to AI crawlers

---

## Acceptance Criteria

- [ ] Every article detail page has a valid `Article` or `BlogPosting` JSON-LD block in the document head (verify via browser DevTools: `document.querySelector('script[type="application/ld+json"]')`)
- [ ] Every node detail page has valid Article JSON-LD with `author.sameAs` array populated from `socialLinks[]`
- [ ] `/people/beehead` has valid `Person` JSON-LD with `sameAs` array containing social profile URLs
- [ ] Organization JSON-LD appears on every page (spot-check homepage, an article, a taxonomy page)
- [ ] `llms.txt` is accessible at `https://sugartown.io/llms.txt` (or `localhost:5173/llms.txt` in dev)
- [ ] `robots.txt` does not contain `Disallow` rules for GPTBot, ClaudeBot, PerplexityBot, or Google-Extended
- [ ] JSON-LD passes Google's Rich Results Test (https://search.google.com/test/rich-results) for at least one article and one person page
- [ ] SSR spike is documented with a clear recommendation

---

## Risks / Edge Cases

**Query risks**
- [ ] Author dereferencing: if `authors[]->` is not projected with the right fields, Person sub-object in Article JSON-LD will be incomplete. Verify projection includes `name`, `slug`, `socialLinks`, `titles`.
- [ ] siteSettings fields: `siteUrl` may not exist as a field — verify and add to siteSettings schema if missing (this would be the one potential schema change).

**Render risks**
- [ ] JSON-LD with invalid JSON (unescaped quotes in title/description) will break the script tag. Use `JSON.stringify()`, never template literals.
- [ ] Multiple JSON-LD blocks on one page (Organization + Article) is valid per spec — but verify Google's Rich Results Test accepts it.
- [ ] SeoHead cleanup: ensure JSON-LD script tags are removed on route change (same pattern as existing meta tag cleanup).

**SSR risks**
- [ ] If AI crawlers don't render JS, all JSON-LD is invisible. This is the highest-impact risk. The spike must answer this definitively before claiming AEO victory.

**Content risks**
- [ ] `llms.txt` needs manual updates when significant content ships. Add a reminder to the epic close-out checklist or `/eod` prompt.

---

## Relationship to Other Epics

| Epic | Relationship | Action |
|------|-------------|--------|
| **SUG-35** (Glossary) | `DefinedTerm` + `DefinedTermSet` JSON-LD ships with glossary | Add a phase to SUG-35 that calls `generateJsonLd()` for glossary term pages |
| **SUG-51** (Page URL Nesting) | `BreadcrumbList` JSON-LD ships with nested URLs | Add breadcrumb generation to `jsonLd.js` when SUG-51 ships |
| **SUG-55** (readingTime, series) | `readingTime` feeds `timeRequired` in Article schema; series feeds `isPartOf` | Update `generateArticleJsonLd()` when SUG-55 fields are available |
| **SUG-56** (Computed Enrichments) | `wordCount` feeds Article.wordCount; entity extraction feeds `mentions[]` | Update `generateArticleJsonLd()` when SUG-56 fields are available |
| **SUG-57** (Academic Layer) | Bibliography → `citation[]`; figure captions → `ImageObject` | Update JSON-LD when SUG-57 components ship |

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-58-ai-search-optimization.md` → `docs/shipped/SUG-58-ai-search-optimization.md`
2. Confirm clean tree
3. Run `/mini-release SUG-58 AI Search Optimization`
4. Transition SUG-58 to **Done** in Linear
5. Update `llms.txt` if any content shipped alongside this epic
