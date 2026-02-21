# Sugartown — WordPress Freeze & Cutover Plan

**Status:** DRAFT — fill in date placeholders before executing
**Timezone:** America/Los_Angeles
**Target cutover window:** [DATE TBD] — Saturday or Sunday, low-traffic period

---

## Overview

This document defines the complete procedure for freezing the legacy WordPress site
(sugartown.io) and cutting over to Sanity + Netlify as the single source of truth.

After cutover:
- WordPress is **read-only** (no new content edits)
- Sanity is the **canonical CMS**
- Netlify serves the React/Vite SPA
- WordPress domain redirects to Netlify (or DNS cut)

---

## Freeze Prerequisites Checklist

All items must be ✅ before scheduling the freeze window.

### Data Readiness
- [ ] `pnpm migrate:export` completed successfully — `artifacts/wp_export.ndjson` present
- [ ] `pnpm migrate:images` completed — `artifacts/image_manifest.json` present
- [ ] `artifacts/image_failures.csv` reviewed — all failures documented and accepted
  - Acceptable: 404s for images that were already broken on WP
  - Acceptable: Low-priority decorative images with documented alternatives
  - Not acceptable: Featured images or knowledge graph SVGs that are broken
- [ ] `artifacts/image_manifest.json` contains the knowledge graph SVG entry (`isPrioritySvg: true`)
- [ ] `pnpm migrate:transform` completed — `artifacts/sanity_import.ndjson` present
- [ ] `pnpm migrate:import` completed — documents in Sanity production dataset
- [ ] `artifacts/slug_collision_report.csv` reviewed — all collisions resolved

### Parity Validation
- [ ] `pnpm migrate:parity` exits with code **0** (all checks pass)
- [ ] `artifacts/parity_report.md` — zero FAIL rows
- [ ] Count parity: articles, pages, nodes, caseStudies, categories, tags, persons
- [ ] Zero documents with `_type === "post"` in Sanity
- [ ] Zero `wp-content/uploads` URLs remaining in any Sanity document content
- [ ] All migrated documents have `legacySource` block
- [ ] 15-URL spot-check table in `parity_report.md` is fully filled in and passing

### Redirect Readiness
- [ ] `pnpm migrate:redirects` run — `apps/web/public/_redirects` generated
- [ ] `_redirects` reviewed manually — WP pattern rules present, SPA fallback present
- [ ] Per-document redirects for `/?p=<wpId>` URLs identified and added (see Known Gaps)
- [ ] `_redirects` deployed to Netlify (included in next build push)
- [ ] Netlify preview deploy verified — sample legacy WP URLs redirect correctly

### Site Readiness
- [ ] React SPA tested at Netlify preview URL — all main routes work
- [ ] Taxonomy chips navigate to detail pages
- [ ] Archive pages filter correctly
- [ ] No console errors in production build
- [ ] SEO: canonical tags present on all pages (`<link rel="canonical">`)
- [ ] Sitemap updated (or generated) with new canonical URLs
- [ ] Google Search Console property ready for URL inspection post-cutover

### DNS & Infrastructure
- [ ] DNS TTL lowered to 300 seconds (5 min) — at least **48 hours before cutover**
- [ ] Netlify custom domain configured and tested at low-traffic URL
- [ ] SSL certificate provisioned for domain on Netlify
- [ ] Rollback plan confirmed (see below)

### Stakeholder Sign-off
- [ ] Content reviewed in Sanity Studio — no obviously missing or broken content
- [ ] Go/no-go confirmed by [NAME] at least 24 hours before window

---

## Freeze Steps

Execute these steps in order during the freeze window.

### 1. Lock WordPress (T+0)

**Goal:** prevent any new content from being published to WP after the final export.

1. Log into WordPress admin → Settings → Reading
2. Set site to "Coming Soon / Maintenance Mode" (use a plugin or custom template)
3. **OR** revoke write access for all editor accounts (change passwords, disable accounts)
4. Add maintenance banner notice: "Sugartown is upgrading. Back soon."
5. Confirm no new posts can be published

### 2. Final Export Run (T+15 min)

Run the full pipeline one final time against the frozen WP site:

```bash
# From repo root
pnpm migrate:export
pnpm migrate:images     # idempotent — skips already-uploaded images
pnpm migrate:transform
pnpm migrate:import     # createOrReplace — safe to re-run
pnpm migrate:redirects
pnpm migrate:parity     # must exit 0
```

If `migrate:parity` exits non-zero: **STOP**. Investigate failures before continuing.

### 3. Image Upload Verification (T+45 min)

```bash
# Check image_failures.csv
wc -l artifacts/image_failures.csv   # should be 1 (header only) if all succeeded

# Confirm knowledge graph SVG
node -e "
  const m = JSON.parse(require('fs').readFileSync('artifacts/image_manifest.json', 'utf8'));
  const svgs = Object.values(m).filter(v => v.isPrioritySvg);
  console.log('Priority SVGs:', svgs.length);
  svgs.forEach(s => console.log(' ', s.originalUrl));
"
```

Accept image failures only if documented in the prerequisites checklist above.

### 4. Redirect Artifact Verification (T+50 min)

```bash
# Spot-check _redirects file
grep "/blog/" apps/web/public/_redirects          # should show pattern rule
grep "/*" apps/web/public/_redirects | tail -1    # should be SPA fallback
```

### 5. Deploy to Netlify (T+55 min)

```bash
git add apps/web/public/_redirects
git commit -m "chore: update _redirects for WP cutover"
git push origin main
```

Netlify auto-deploys. Wait for deploy to complete (~2 min).

Verify on Netlify deploy preview:
- `https://sugartown.io/blog/[a-real-wp-slug]` → 301 → `/articles/[slug]`
- `https://sugartown.io/gem/[a-real-wp-slug]` → 301 → `/nodes/[slug]`
- `https://sugartown.io/articles` → 200, content visible
- `https://sugartown.io/knowledge-graph` → 200, content visible

### 6. DNS Cutover (T+60 min)

1. Log into DNS provider (Cloudflare / namecheap / etc.)
2. Update `A` record (or `CNAME`) to point to Netlify:
   - CNAME: `sugartown.netlify.app` (replace with actual Netlify domain)
   - Or use Netlify DNS delegation for full control
3. Remove or redirect old WP hosting A record
4. Record exact time of DNS change

DNS propagation: 5 min (if TTL was lowered in advance) to 48 hours (worst case).
Use https://dnschecker.org to monitor propagation.

### 7. Verification (T+90 min)

After DNS propagates to your local resolver:

```
# Test from local machine after propagation
curl -I https://sugartown.io/blog/hello-world
# Expected: HTTP/1.1 301 → Location: /articles/hello-world

curl -I https://sugartown.io/articles
# Expected: HTTP/1.1 200

curl -I https://sugartown.io/knowledge-graph
# Expected: HTTP/1.1 200
```

Check browser:
- Open sugartown.io in incognito — React SPA loads
- Open sugartown.io/articles — article list renders
- Click a taxonomy chip — navigates to taxonomy detail page

---

## Go / No-Go Checklist (Final Gate)

**All boxes must be checked before issuing the DNS change.**

| | Check |
|---|---|
| ☐ | Parity report passes (exit 0) |
| ☐ | Zero image_failures OR all failures accepted |
| ☐ | Knowledge graph SVG confirmed in manifest |
| ☐ | `_redirects` deployed and verified on Netlify |
| ☐ | SPA loads correctly at Netlify URL |
| ☐ | Spot-check 15 URLs manually (see parity_report.md) |
| ☐ | DNS TTL was lowered 48h ago |
| ☐ | Rollback plan confirmed and accessible |
| ☐ | Go/no-go sign-off obtained |

---

## Rollback Plan

If critical issues are found after DNS cutover:

### Option A — Quick Rollback (< 1 hour after cutover)
1. Revert DNS to old WP hosting IP/CNAME
2. DNS TTL is 300s — propagation ~5 min
3. Remove maintenance mode from WP
4. WP is live again

### Option B — Extended Rollback (if WP hosting has been decommissioned)
1. Restore WP from most recent backup (pre-freeze backup)
2. Deploy backup to any PHP host
3. Update DNS to new WP host
4. Document what went wrong and re-plan migration

### Sanity data is safe
- Sanity is a separate system — data written during migration is not affected by rollback
- Re-running `pnpm migrate:import` (createOrReplace) is always safe

---

## Post-Cutover Monitoring

Monitor for 72 hours after cutover:

### 404 Monitoring
```bash
# Netlify provides 404 logs in the dashboard
# Check for patterns: /wp-content/, /?p=, /blog/, /gem/
# Any unexpected 404 patterns → add redirect rule and redeploy
```

### Redirect Hit Rates
- Check Netlify Analytics or your analytics provider for redirect traffic
- Verify `/blog/*` redirect rule is firing (not 404ing)

### Google Search Console
- Inspect top WP URLs — confirm they redirect correctly
- Monitor for coverage errors
- Submit updated sitemap

### Broken Image Scan
```bash
# Run a crawl against the live site checking for broken images
# Tools: wget --spider, or a visual regression tool
# Look for any remaining wp-content/uploads URLs in page source
```

### First Week
- [ ] Monitor 404 rate in Netlify dashboard (target: < 1% of traffic)
- [ ] Monitor redirect hit rates (expect high volume for /blog/* initially)
- [ ] Check Google Search Console for crawl errors
- [ ] Verify canonical tags are correct on all indexed pages
- [ ] Confirm no broken images on any migrated page
- [ ] Review Sanity Studio — confirm editors can create new content

---

## Known Gaps (Document Before Cutover)

1. **`/?p=<wpId>` URL pattern** — cannot be handled by static Netlify `_redirects`.
   Resolution: generate per-document entries in `_redirects` after import:
   ```bash
   # Query Sanity for all migrated articles with their wpId
   # For each: generate: /?p=<wpId>  /articles/<slug>  301
   # Append to _redirects before deploying
   ```

2. **WordPress comments** — not migrated. If comments were public, consider
   a static comment archive or a brief note on migrated articles.

3. **WordPress page hierarchy** — WP parent-child page slugs (e.g. `/parent/child/`)
   become flat slugs in Sanity (`/child/`). If WP had nested page URLs, add
   per-document redirect entries for the nested paths.

4. **`/author/<login>` URLs** — WP author archive pages. These map to `/people/<slug>`
   in the new taxonomy system but the route requires the person to be published in
   Sanity and linked to their articles. Add redirect entries if needed.

5. **RSS feed** — `/feed/` URL will 404. If RSS was used by subscribers, add:
   `/feed/  https://[your-feed-service-url]  302`

---

*Last updated: 2026-02-21*
