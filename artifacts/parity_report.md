# Sugartown — Migration Parity Report

Generated: 2026-02-21T16:20:14.937Z

## Check Results

| Status | Check | Detail |
|--------|-------|--------|
| ✅ | Count: article | WP: 7 | Sanity: 7 |
| ✅ | Count: page | WP: 8 | Sanity: 8 |
| ✅ | Count: node | WP: 38 | Sanity: 38 |
| ✅ | Count: caseStudy | WP: 7 | Sanity: 7 |
| ✅ | Count: category | WP: 20 | Sanity: 20 |
| ✅ | Count: tag | WP: 246 | Sanity: 246 |
| ✅ | Count: person | WP: 1 | Sanity: 1 |
| ✅ | _type "post" count = 0 | Found: 0 |
| ✅ | Zero wp-content/uploads URLs in content | Found: 0 |
| ⚠️ | Image failures reviewed | 1 failure(s) in image_failures.csv |
| ✅ | Knowledge graph SVG(s) in manifest | 5 priority SVG(s) confirmed |
| ✅ | _redirects contains WP pattern rules | Pattern rules present |
| ✅ | SPA fallback (/*) present | Present |

## Counts

| Type | WP Export | Sanity | Match |
|------|-----------|--------|-------|
| article | 7 | 7 | ✅ |
| page | 8 | 8 | ✅ |
| node | 38 | 38 | ✅ |
| caseStudy | 7 | 7 | ✅ |
| category | 20 | 20 | ✅ |
| tag | 246 | 246 | ✅ |
| person | 1 | 1 | ✅ |

## Known Gaps

- WordPress `/?p=<id>` URLs are not handled by static Netlify rules.
  Generate per-document entries after import using `legacySource.wpId`.
- Slug collision resolutions: review `artifacts/slug_collision_report.csv`.
- PT fallback documents: search Sanity for `defined(legacySource.legacyHtml)`
  to find documents where raw HTML was stored instead of Portable Text.

## 15-URL Spot-Check

Fill in after migration with real slugs from your dataset:

| # | Type | Old URL | New URL | Redirect? | Status |
|---|------|---------|---------|-----------|--------|
| 1 | article (with image) | /blog/<slug> | /articles/<slug> | 301 | ☐ |
| 2 | article | /blog/<slug> | /articles/<slug> | 301 | ☐ |
| 3 | page | /<slug> | /<slug> | none | ☐ |
| 4 | page | /<slug> | /<slug> | none | ☐ |
| 5 | node (KG SVG) | /gem/<slug> | /nodes/<slug> | 301 | ☐ |
| 6 | node | /gem/<slug> | /nodes/<slug> | 301 | ☐ |
| 7 | caseStudy | /case-studies/<slug> | /case-studies/<slug> | none | ☐ |
| 8 | caseStudy | /case-study/<slug> | /case-studies/<slug> | 301 | ☐ |
| 9 | category | /category/<slug> | /categories/<slug> | 301 | ☐ |
| 10 | tag | /tag/<slug> | /tags/<slug> | 301 | ☐ |
| 11 | person | /author/<login> | /people/<slug> | (future epic) | ☐ |
| 12 | legacy (WP post) | /blog/<slug> | /articles/<slug> | 301 | ☐ |
| 13 | legacy (WP gem) | /gem/<slug> | /nodes/<slug> | 301 | ☐ |
| 14 | clean page | /<slug> | /<slug> | none | ☐ |
| 15 | clean page | /<slug> | /<slug> | none | ☐ |
