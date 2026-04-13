# SUG-63 — Core Web Vitals Audit + Phased Improvement Plan

**Linear Issue:** SUG-63
**Created:** 2026-04-13
**Priority:** P2 High

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — Phase 0 is audit-only. Phases 1-3 may touch image components, font loading, route definitions, and build config. Specific files TBD after baseline results.
- [x] **Use case coverage** — all page types audited (9 URL patterns)
- [x] **Layout contract** — N/A for audit phase; Phase 1-2 changes must not alter layout contracts
- [x] **All prop value enumerations** — N/A
- [x] **Correct audit file paths** — verified
- [x] **Dark / theme modifier treatment** — N/A for audit; Phase 1 font/image changes are theme-agnostic
- [x] **Studio schema changes scoped** — no schema changes in any phase
- [x] **Web adapter sync scoped** — N/A
- [x] **Composition overlap audit** — N/A
- [x] **Atomic Reuse Gate** — N/A for audit. Phase 1 utilities (if created) will follow reuse gate.

---

## Context

No baseline Core Web Vitals measurement exists for Sugartown. The site is a React 19 + Vite 7 SPA deployed on Netlify CDN, with all rendering client-side (no SSR/SSG). Content images served via Sanity CDN. Google Fonts loaded via CSS `@import` in `globals.css`. Performance has never been measured or optimised.

With the site transitioning to a live portfolio for job/consulting searches (SUG-64), performance is a credibility signal. A slow site undermines the "I build good things" message.

---

## Objective

Establish a CWV baseline across all page types, identify and fix quick wins, implement structural improvements where warranted, and set up CI monitoring to prevent regressions. After this epic, every PR gets a Lighthouse score and the site passes CWV thresholds on all key pages.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | Yes | Homepage + static pages are high-traffic landing surfaces |
| `article` | Yes | Detail page performance (LCP dominated by hero image) |
| `caseStudy` | Yes | Detail page with potentially heavy image content |
| `node` | Yes | Detail page, primary content type |
| `archivePage` | Yes | List pages with card grids, multiple image loads |

---

## Scope

### Phase 0: Baseline audit (this phase ships first)

- [ ] Run Lighthouse CI against 9 production URLs (see audit matrix below)
- [ ] Run PageSpeed Insights for field data (CrUX) if available
- [ ] Record LCP, CLS, INP, FCP, TTFB per page type
- [ ] Record total bundle size (JS + CSS), largest resource, render-blocking resources
- [ ] Deliver baseline audit table with pass/fail per metric
- [ ] Identify top 3 issues by impact

### Audit matrix

| Page type | URL | Notes |
|-----------|-----|-------|
| Homepage | `/` | First impression, highest traffic |
| Archive (articles) | `/articles` | Card grid, multiple images |
| Archive (knowledge graph) | `/knowledge-graph` | Card grid |
| Archive (case studies) | `/case-studies` | Card grid with thumbnails |
| Detail (node) | `/nodes/the-great-disconnection` | Long-form content, hero image |
| Detail (article) | `/articles/test-preview-post` | All section types, worst-case content |
| Detail (case study) | `/case-studies/fx-networks` | Heavy content, potential video embed |
| Taxonomy archive | `/categories` | Simple list page |
| Taxonomy detail | `/tags/ai-collaboration` | Card grid filtered by taxonomy |

### CWV targets

| Metric | Target | Threshold |
|--------|--------|-----------|
| LCP | < 2.5s | Good |
| CLS | < 0.1 | Good |
| INP | < 200ms | Good |
| FCP | < 1.8s | Good |
| TTFB | < 800ms | Good |

### Phase 1: Quick wins (no architectural changes)

Scope depends on Phase 0 findings. Likely candidates:
- [ ] Image optimisation: verify all Sanity images use `?w=`, `&fm=webp`, `&fit=` params via `urlFor()`
- [ ] Font loading: audit `font-display: swap` on Google Fonts imports
- [ ] Preload critical assets: hero images on landing pages, above-fold fonts
- [ ] Lazy load below-fold images (native `loading="lazy"`)
- [ ] Eliminate render-blocking CSS if any exists outside Vite bundle

### Phase 2: Structural improvements

Scope depends on Phase 0 findings. Possible areas:
- [ ] Route-level code splitting (`React.lazy` + `Suspense` for page components)
- [ ] Sanity query waterfall audit (sequential vs parallel data fetching)
- [ ] CSS containment (`content-visibility: auto` on below-fold sections)
- [ ] Bundle analysis (identify large deps, tree-shaking gaps)
- [ ] Service worker / caching strategy for repeat visitors

### Phase 3: CI monitoring

- [ ] Lighthouse CI in GitHub Actions for PR checks
- [ ] CWV budget thresholds (fail PR if LCP > 3s, CLS > 0.15)
- [ ] Optional: Real User Monitoring via `web-vitals` library + GA4 custom events

---

## Query Layer Checklist

N/A. No schema or query changes in any phase.

---

## Schema Enum Audit

N/A. No enum fields touched.

---

## Non-Goals

- No SSR/SSG migration (major architectural change, separate epic if ever needed)
- No CDN migration (Netlify is the deployment target)
- No schema changes
- No visual design changes (performance improvements must be invisible to users)
- No content changes (image replacement, copy changes are SUG-64 territory)

---

## Technical Constraints

**Monorepo / tooling**
- Lighthouse CI runs against production URLs (deployed site)
- Local dev server performance is not representative (no CDN, no compression)
- Bundle analysis via `npx vite-bundle-visualizer` in `apps/web/`

**SPA architecture**
- TTFB is Netlify CDN + static HTML shell (fast by default)
- FCP depends on JS bundle parse + initial render
- LCP is dominated by: (1) Sanity image fetch for hero, (2) Google Fonts download, (3) React hydration
- INP is client-side React event handling (should be fast given minimal interactivity)
- CLS risk areas: images without dimensions, font swap flash, late-loading content

**Known risks**
- Google Fonts via CSS `@import url()` in `globals.css` is a known render-blocking pattern
- Sanity image CDN is fast but `urlFor()` params must be correct for responsive sizing
- No image dimension hints in current card/hero markup (potential CLS source)

---

## Migration Script Constraints

N/A.

---

## Files to Modify

**Phase 0 (audit only)**
- No file changes. Deliverable is the audit table.

**Phase 1 (likely candidates, confirmed after Phase 0)**
- `apps/web/src/design-system/styles/globals.css` — font loading strategy
- `apps/web/index.html` — preload hints
- `apps/web/src/components/PageSections.jsx` — image lazy loading attributes
- `apps/web/src/lib/sanity.js` — `urlFor()` default params audit

**Phase 2 (confirmed after Phase 0)**
- `apps/web/src/App.jsx` — route-level code splitting
- `apps/web/vite.config.js` — build optimisation config

**Phase 3**
- `.github/workflows/lighthouse.yml` — CREATE
- `apps/web/lighthouserc.js` — CREATE (Lighthouse CI config)

---

## Deliverables

1. **Baseline audit table** — CWV metrics for 9 page types, pass/fail per metric
2. **Issue ranking** — top 3 issues by estimated impact
3. **Phase 1 fixes** — implemented and verified (re-run Lighthouse to confirm improvement)
4. **Phase 2 fixes** — implemented and verified (if warranted by Phase 0 findings)
5. **CI gate** — Lighthouse CI runs on PRs, blocks merge on CWV regression

---

## Acceptance Criteria

- [ ] Baseline audit table delivered with all 9 page types measured
- [ ] All pages score "Good" on LCP (< 2.5s) after Phase 1
- [ ] All pages score "Good" on CLS (< 0.1) after Phase 1
- [ ] All pages score "Good" on INP (< 200ms) after Phase 1
- [ ] No visual regressions from any performance change
- [ ] Lighthouse CI runs on at least one PR and reports results
- [ ] Bundle size documented (baseline and post-optimisation)

---

## Risks / Edge Cases

- [ ] **Sanity CDN latency** — image LCP depends on Sanity CDN response time, which we don't control. Mitigation: preload hints, responsive sizing, WebP format.
- [ ] **Google Fonts** — switching from `@import` to `<link>` with `preconnect` may change font loading order. Test for FOUT/FOIT.
- [ ] **Code splitting** — lazy-loaded routes show a loading flash on first navigation. Need a Suspense fallback that doesn't cause CLS.
- [ ] **CI flakiness** — Lighthouse scores vary between runs. Use median of 3 runs in CI config.
- [ ] **SUG-52 interaction** — margin column adds DOM and sticky JS. Run CWV after SUG-52 ships to catch regressions.

---

## Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| SUG-52 margin column | Backlog | May affect LCP on detail pages (additional DOM) |
| SUG-50 card image from hero | Backlog | Affects archive page image loading patterns |
| SUG-58 JSON-LD | Backlog | Adds inline script per page (small overhead) |
| SUG-64 content polish | Backlog | New content may change image/asset profile |

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-63-cwv-audit.md` to `docs/shipped/SUG-63-cwv-audit.md`
2. Confirm clean tree
3. Run `/mini-release`
4. Transition SUG-63 to Done in Linear
