# PROMPT — Epic 1: URL Audit & Gap Analysis

**Epic:** URL Audit & Gap Analysis (P0 — Launch Routing prerequisite)
**Run with:** Claude Code (Sugartown monorepo context required)
**Working directory:** `/Users/beckyalice/SUGARTOWN_DEV/sugartown`
**Reads from:** WordPress REST API, Sanity production, local codebase
**Writes to:** Sanity — NEVER. This entire epic is read-only against external systems.

---

## What this epic accomplishes

Produces a complete, classified inventory of every URL that exists on the WordPress site (sugartown.io) and determines whether each one is accounted for in the new Sanity + React system. The output is a set of artifacts that a non-technical reviewer can use to approve redirect decisions before DNS cutover.

This epic has **zero external dependencies**. Everything it needs already exists in the monorepo and in the live WordPress site.

---

## Phase 1 — Orient (read before building anything)

Before writing any code, read these files to understand existing conventions and infrastructure. Do not skip this step.

```bash
# Understand the URL namespace and route config
cat apps/web/src/lib/routes.js

# Understand existing redirect infrastructure
cat apps/studio/schemas/documents/redirect.ts
cat apps/web/scripts/build-redirects.js

# Understand the migration pipeline patterns (especially sanitiseSlug)
cat scripts/migrate/lib.js
cat scripts/migrate/transform.js | head -100

# Understand what hardcoded redirects already exist in the frontend
grep -n "Navigate\|redirect\|legacy" apps/web/src/App.jsx

# Check current state of generated redirects
cat apps/web/public/_redirects

# Read the existing parity report from the v0.10.0 migration
cat scripts/migrate/artifacts/parity_report.md

# Read the detailed task spec for the spider script
cat docs/briefs/url-audit-spider-spec.md

# Check existing validate scripts for pattern conventions
cat apps/web/scripts/validate-urls.js | head -60
```

After reading all of the above, summarize what you now understand about:
1. The canonical route namespace (TYPE_NAMESPACES in routes.js)
2. Which legacy URL patterns are already handled by in-app redirects in App.jsx
3. How `sanitiseSlug()` works (percent-decoding, non-ASCII stripping)
4. What redirect documents already exist in Sanity
5. How `build-redirects.js` generates the `_redirects` file

Wait for my confirmation that your understanding is correct before proceeding to Phase 2.

---

## Phase 2 — Build the WP URL Spider

Create the script at `scripts/audit/wp-url-spider.js` following the detailed specification in `docs/briefs/url-audit-spider-spec.md`.

**Key implementation constraints** (these override anything ambiguous in the spec):

### Dependencies
- Use native `fetch` (Node 18+). No axios, no node-fetch, no got.
- Use `@sanity/client` for Sanity queries — it is already installed in the monorepo. Import it and configure with project `poalmzla`, dataset `production`, API version `2024-01-01`, and the `VITE_SANITY_TOKEN` env var for authentication (required because imported docs use `wp.*` dot-namespace IDs that are invisible to unauthenticated queries).
- No other external dependencies. Everything else is Node built-ins (`fs`, `path`, `url`).

### File structure
```
scripts/
├── audit/
│   ├── wp-url-spider.js          ← the main script
│   └── artifacts/                ← output directory (gitignored except .gitkeep)
│       ├── .gitkeep
│       ├── url_inventory.json    ← generated
│       ├── redirect_gaps.md      ← generated
│       └── proposed_redirects.ndjson  ← generated
```

### Slug normalization
Reuse the `sanitiseSlug()` logic from `scripts/migrate/lib.js` — don't reinvent it. Either import it directly or copy the function with attribution. The key behaviors: `decodeURIComponent()`, strip non-ASCII, collapse multiple dashes, trim leading/trailing dashes, lowercase.

### Hardcoded redirect awareness
The script must read `App.jsx` programmatically (or maintain a hardcoded list derived from it) to know which legacy patterns are handled by client-side redirects. Based on the current codebase, these are:
- `/blog/*` → `/articles/*`
- `/post/*` → `/articles/*`
- `/posts/*` → `/articles/*`
- `/nodes/*` → `/knowledge-graph/*`
- `/articles/%f0%9f%92%8e-luxury-dot-com-%f0%9f%92%8e` → `/articles/luxury-dot-com`

Mark URLs matching these patterns as `HARDCODED` in the gap analysis. Include a comment in the script noting that these are client-side only and will need server-side equivalents before cutover (that's Epic 3's concern, not this script's).

### WordPress API pagination
Follow the `X-WP-TotalPages` response header. Paginate with `?per_page=100&page=N`. Stop when the response is an empty array or when page exceeds total pages. Handle 404 gracefully for custom post type endpoints that may not be registered.

### Console output
Print a summary table to stdout when the script finishes. Match the style of existing validators in the monorepo (clean, emoji-prefixed status lines). Example:

```
URL Audit — 2026-02-27
──────────────────────
📊 Total WP URLs found:     342
✅ Matched in Sanity:        287
✅ Already redirected:         31
✅ Hardcoded (client-side):    12
⚠️  ORPHANED (action needed):   4
ℹ️  Taxonomy (review):           6
ℹ️  Structural (ignore):         2
──────────────────────
📁 Artifacts written to scripts/audit/artifacts/
```

### Script registration
Register in root `package.json`:
```json
"audit:urls": "node scripts/audit/wp-url-spider.js"
```

### Flags
- `--verbose` — log each URL as it's classified
- Default (no flag) — summary only

After building the script, do NOT run it yet. Show me the complete file first and wait for confirmation.

---

## Phase 3 — Run and verify

After I confirm the script looks correct:

```bash
pnpm audit:urls --verbose
```

Review the output together. Specifically check:
1. Does the total URL count seem reasonable? (We know 327 docs were imported in v0.10.0)
2. Are there any unexpected ORPHANED URLs?
3. Are taxonomy URLs classified correctly?
4. Does the `redirect_gaps.md` make sense to a human reader?

If errors occur, debug and fix. The script should run to clean completion with zero unhandled exceptions.

---

## Phase 4 — Validate artifacts

After a clean run:

```bash
# Confirm artifacts exist
ls -la scripts/audit/artifacts/

# Spot-check the inventory
cat scripts/audit/artifacts/url_inventory.json | node -e "
  const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  const counts = {};
  data.forEach(u => { counts[u.status] = (counts[u.status]||0) + 1; });
  console.log(counts);
"

# Review the gap report
cat scripts/audit/artifacts/redirect_gaps.md

# Check proposed redirects are valid ndjson
cat scripts/audit/artifacts/proposed_redirects.ndjson | head -5
```

### Cross-reference with existing validators
```bash
# Run the existing URL validator to confirm no regressions
pnpm validate:urls
```

The audit script and the existing `validate:urls` should not contradict each other. If `validate:urls` passes clean but the audit finds orphaned URLs, that's expected — the audit is checking WordPress URLs that the existing validator doesn't know about.

---

## Phase 5 — Commit

When everything looks correct:

```bash
git checkout -b epic/url-audit
git add scripts/audit/
git add package.json  # for the audit:urls script registration
git commit -m "feat: add WP URL spider and redirect gap analysis

Epic 1 of Launch Routing. Read-only audit that crawls WordPress
REST API + sitemap, cross-references against Sanity documents and
existing redirects, and classifies every legacy URL.

Outputs:
- scripts/audit/artifacts/url_inventory.json (machine-readable)
- scripts/audit/artifacts/redirect_gaps.md (human review)
- scripts/audit/artifacts/proposed_redirects.ndjson (import-ready)

Registered as: pnpm audit:urls [--verbose]"
```

Do NOT push. Do NOT merge. Wait for my review of the artifacts before proceeding.

---

## Definition of Done

- [ ] `scripts/audit/wp-url-spider.js` exists and runs without errors
- [ ] `pnpm audit:urls` is registered and works from repo root
- [ ] Three artifacts generated in `scripts/audit/artifacts/`
- [ ] Every WP URL is classified into exactly one status category
- [ ] `redirect_gaps.md` is readable by a non-technical reviewer
- [ ] `proposed_redirects.ndjson` contains valid Sanity mutation documents
- [ ] `pnpm validate:urls` still passes clean (no regressions)
- [ ] Committed on `epic/url-audit` branch, not pushed

---

## What this epic does NOT do

- Does not write anything to Sanity (that's Epic 2)
- Does not configure server-side redirects (that's Epic 3)
- Does not make hosting platform decisions (that's Epic 3)
- Does not modify App.jsx or any frontend code
- Does not modify any existing redirect documents

This is pure discovery. It tells us the complete truth about the URL surface so we can make informed redirect decisions in Epic 2.
