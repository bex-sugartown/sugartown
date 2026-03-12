# WP URL Spider + Redirect Gap Analysis — Task Spec

| Field | Value |
|---|---|
| **Epic** | 1 — Routing & 301s |
| **IA Brief Ref** | `docs/briefs/ia-brief.md` §7 (Route Namespace), §8 (Phase Gates) |
| **Status** | In Progress |
| **Script** | `scripts/audit/wp-url-spider.js` |
| **Run** | `pnpm audit:urls` or `node scripts/audit/wp-url-spider.js [--verbose]` |

## Purpose

Crawl the live WordPress site (sugartown.io), compare every published URL against the Sanity content inventory + redirect rules, and produce a gap analysis showing which WP URLs are covered, which are orphaned, and what redirect rules need to be created before DNS cutover.

## Context

- 327 documents already imported into Sanity from WP
- Redirect infrastructure: `apps/studio/schemas/documents/redirect.ts` + `apps/web/scripts/build-redirects.js`
- Existing redirects from v0.10.0 migration (`scripts/migrate/redirects.js`)
- Parity report: `scripts/migrate/artifacts/parity_report.md`
- Legacy source metadata on every imported doc: `legacySource.wpSlug`, `legacySource.wpId`, `legacySource.wpType`
- In-app redirects in `App.jsx`: `/blog/*`, `/post/*`, `/posts/*`, `/nodes/*` → new routes

## Steps

### Step 1 — Crawl WordPress (two sources)

**1a. WP REST API** — Fetch all published content:
- `GET /wp-json/wp/v2/posts?per_page=100&page=N`
- `GET /wp-json/wp/v2/pages?per_page=100&page=N`
- `GET /wp-json/wp/v2/categories?per_page=100`
- `GET /wp-json/wp/v2/tags?per_page=100`
- Custom post types (try both hyphen/underscore, 404 = skip):
  - `/wp-json/wp/v2/gem`, `/wp-json/wp/v2/case-study`, `/wp-json/wp/v2/case_study`

**1b. Sitemap** — Fetch `sitemap.xml` or `wp-sitemap.xml`, parse all `<loc>` URLs.

Deduplicate across both sources by URL.

### Step 2 — Query Sanity for current state

- All docs with `legacySource` metadata
- All `redirect` documents
- Current `_redirects` file

### Step 3 — Gap analysis

Classify every WP URL:

| Status | Meaning |
|---|---|
| ✅ MATCHED | Sanity doc exists with matching slug at correct new route |
| ✅ REDIRECTED | Sanity redirect document covers this URL |
| ✅ HARDCODED | In-app redirect in App.jsx covers this URL pattern |
| ⚠️ ORPHANED | No Sanity doc or redirect covers it |
| ℹ️ TAXONOMY | WP category/tag archive — review needed |
| ℹ️ STRUCTURAL | Date/author/pagination/feed URLs — typically fine as 404 |

### Step 4 — Output artifacts

All written to `scripts/audit/artifacts/`:

1. **`url_inventory.json`** — Complete machine-readable inventory
2. **`redirect_gaps.md`** — Human-readable report for editorial review
3. **`proposed_redirects.ndjson`** — Ready-to-import Sanity mutations for orphaned URLs

### Step 5 — Summary to stdout

## Constraints

- Node 18+ native fetch only (no HTTP deps)
- `@sanity/client` for Sanity queries
- Read-only — never writes to Sanity
- `--verbose` flag for detailed per-URL logging
- Handle WP API pagination (`X-WP-TotalPages` header)
- Handle percent-encoded slugs (decode + normalize)
- Graceful 404 handling for custom post type endpoints

## Success Criteria

- Script runs to completion without errors
- Every WP sitemap URL accounted for in a status category
- Zero ORPHANED URLs before DNS cutover
- `redirect_gaps.md` clear enough for non-technical review
