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

---

## Phase 0 — Baseline Audit (completed 2026-04-15)

**Methodology:**
- Tool: Chrome DevTools performance trace (via MCP)
- Emulation: Slow 4G network, 4× CPU throttling, 375×812 mobile viewport
- Mode: navigation (reload + auto-stop trace)
- Field data: CrUX reports "no data" for all URLs — site is too new for real-user data
- Notes: Each URL measured once. CWV values vary between runs; these are indicative baselines, not statistically stable medians.

### Results

| # | Page | URL | LCP (ms) | CLS | LCP ✓ | CLS ✓ |
|---|------|-----|----------|-----|-------|-------|
| 1 | Homepage | `/` | 1315 | 0.03 | ✅ | ✅ |
| 2 | Article archive | `/articles` | 1320 | **0.47** | ✅ | ❌ |
| 3 | Knowledge graph archive | `/knowledge-graph` | 1316 | 0.03 | ✅ | ✅ |
| 4 | Case studies archive | `/case-studies` | 1312 | **0.39** | ✅ | ❌ |
| 5 | Node detail | `/nodes/the-great-disconnection` → `/knowledge-graph/...` | **5006** | 0.03 | ❌ | ✅ |
| 6 | Article detail | `/articles/test-preview-post` | 1290 | **0.47** | ✅ | ❌ |
| 7 | Case study detail | `/case-studies/fx-networks` | 1301 | **0.47** | ✅ | ❌ |
| 8 | Taxonomy archive | `/categories` | 1899 | **0.14** | ✅ | ❌ |
| 9 | Taxonomy detail | `/tags/ai-collaboration` | 1911 | **0.31** | ✅ | ❌ |

**Pass rate:** LCP 8/9 (89%). CLS 3/9 (33%). INP not measured (requires user interaction — deferred to Phase 3 CI).

### Top 3 issues by impact

**Issue 1 — Systemic CLS on image-bearing pages (6/9 fail, up to 0.47 = 4.7× threshold)**

Every detail page and every image-grid archive page fails CLS. The pattern is consistent at 0.47 on article/case study detail pages and 0.39–0.47 on archive grids. Likely cause: hero images and card thumbnails rendered without explicit `width`/`height` or `aspect-ratio` reservations, so the layout reflows when images load.

Investigation paths:
- Hero image markup in `PageSections.jsx` heroSection renderer — verify width/height or aspect-ratio on `<img>`
- `SanityImage` component — confirm responsive srcset includes dimensions
- Card thumbnail rendering in `ContentCard` / archive grids — audit dimension hints
- Font swap may contribute (em dash appears at CLS event time ~60ms after FCP — suggests late-arriving content)

**Issue 2 — Node detail LCP 5006ms (2× threshold)**

The Great Disconnection node detail page has LCP load duration of 3681ms, dominating the budget. DevTools flagged an `ImageDelivery` insight with 42.1kB of wasted bytes — the hero image is larger than needed at the rendered size.

Investigation paths:
- Hero image size — is it being served at intrinsic resolution when a smaller version would do?
- `urlFor()` params — verify `?w=`, `&fit=`, `&auto=format` are applied
- `<link rel="preload">` — is the hero image preload hint present on detail pages? MEMORY.md EPIC-0182 says yes. Verify it's working post-SUG-52.
- Only this page type was checked. Article/case study detail hit 1290-1301ms, so the issue may be specific to this one doc's image size, not the template.

**Issue 3 — Uniform 1.2–1.3s load delay across all page types**

Every page except node detail shows ~1200-1900ms LCP dominated by either "Load delay" (time before image fetch starts) or "Render delay" (time between fetch and paint). This pattern is consistent with the known risk from the epic:

> Google Fonts via CSS `@import url()` in `globals.css` is a known render-blocking pattern

The render-blocking insight appeared on 8/9 pages but with "FCP 0ms, LCP 0ms" estimated savings — meaning Lighthouse judges these specific requests non-critical. However the 1200ms+ render delay across all pages suggests a render-blocking chain (likely fonts + CSS) is delaying the first paint.

Investigation paths:
- `apps/web/src/design-system/styles/globals.css` — audit `@import url()` for Google Fonts
- Switch Google Fonts to `<link rel="preconnect">` + `<link href>` in `index.html` with `font-display: swap`
- Bundle analyzer: run `npx vite-bundle-visualizer` in `apps/web/` to quantify JS bundle parse cost

### Phase 1 recommendations (priority order)

1. **Fix CLS root cause** — add `width`/`height` or `aspect-ratio` to hero images and card thumbnails. This alone would move 6 pages from fail to pass. Biggest impact, smallest code change.
2. **Audit hero image preload** — verify EPIC-0182 `<link rel="preload">` still works post-SUG-52 and that `urlFor()` params produce the correct responsive size for each hero surface.
3. **Google Fonts loading strategy** — move from CSS `@import` in `globals.css` to `<link>` tags in `index.html` (same pattern as Storybook — see MEMORY.md §Google Fonts Loading Rules).

Phases 2 (code splitting, bundle analysis) and 3 (Lighthouse CI) deferred pending Phase 1 results. If Phase 1 fixes land 9/9 at Good, Phase 2 structural work may not be needed.

### Phase 1 decision

Phase 1 is a separate execution — not bundled into this epic's baseline deliverable. Top 3 issues are now documented; fixes require code changes that should be scoped as their own epic or committed here as Phase 1 follow-ups.

**Recommendation:** Ship Phase 0 as the baseline artifact. Schedule Phase 1 as a new session (estimated 1–2 hours) focused on the three issues above. Re-run the baseline after Phase 1 lands to verify pass/fail shifts.

---

## Phase 1 — Quick wins (landed 2026-04-15)

### Fixes applied

**Issue 1 — CLS: Card image dimensions (both DS + web adapter)**

- `packages/design-system/src/components/Card/Card.tsx` — added `width="1600" height="900"` to default-variant thumbnail `<img>`, `width="400" height="225"` to listing-variant thumbnail `<img>`
- `apps/web/src/design-system/components/card/Card.jsx` — same changes (DS parity)
- `packages/design-system/src/components/Card/Card.module.css` — added `aspect-ratio: 16 / 9` to `.thumbnailRail`
- `apps/web/src/design-system/components/card/Card.module.css` — same (DS parity)

Width/height attrs give the browser intrinsic 16:9 ratio before the image bytes arrive, so CSS can compute final dimensions without reflow. Final rendered size still controlled by CSS (`width: 100%`, `object-fit: cover`).

**Issue 3 — Google Fonts: stale font list + render-blocking chain**

Audit discovered the production `index.html` `<link rel="stylesheet">` was loading **Playfair Display + Fira Sans** — a stale set from before the SUG-21 Pink Moon switch. Meanwhile, `globals.css` `@import` was loading the **correct** Pink Moon stack (EB Garamond + Fira Sans + Courier Prime). Production was downloading both — stale fonts that rendered nowhere AND the current stack.

Fix:
- `apps/web/index.html` — updated `<link>` to load the correct 3 Pink Moon fonts (EB Garamond + Fira Sans + Courier Prime) with preconnect hints
- `apps/web/src/design-system/styles/globals.css` — removed duplicate `@import` (now loaded via `<link>` in HTML head, earlier in waterfall)
- MEMORY.md — updated §Google Fonts Loading Rules to document the new strategy + note the SUG-63 regression it caught

**Issue 2 — Node detail LCP 5006ms**

Not addressed in Phase 1. The ImageDelivery insight flagged 42kB wasted bytes on a single node's hero image — likely a content-side fix (replace the hero asset with a smaller version, or verify `urlFor()` params are applying). Deferred to Phase 2 or content pass (SUG-64).

### Verification

Post-deploy re-audit is **pending** — changes are committed locally but not yet pushed/deployed. Production audit against current `origin/main` will show the Phase 0 numbers, not the Phase 1 improvements. After `/eod` pushes these commits and Netlify builds, re-run the audit on the 3 worst baseline pages:

- `/articles/test-preview-post` (CLS was 0.47)
- `/case-studies/fx-networks` (CLS was 0.47)
- `/articles` (CLS was 0.47)

Expected improvements:
- Card-CLS pages: **0.47 → near 0** (entire CLS budget recovers when thumbnails have reserved space)
- Render delay: modest reduction (~100-300ms) from earlier font discovery + one less @import chain
- LCP on node detail: unchanged (Issue 2 not addressed)

### Phase status

| Phase | Status |
|---|---|
| Phase 0 baseline | ✅ Shipped |
| Phase 1 quick wins | ✅ Shipped (verification pending deploy) |
| Phase 2 structural | ⏸ Reassess after Phase 1 verification |
| Phase 3 CI monitoring | ⏸ Deferred |
