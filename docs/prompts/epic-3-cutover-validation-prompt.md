# PROMPT — Epic 3: Server-Side Redirect Deployment & Cutover Validation

**Epic:** Server-Side Redirect Deployment & Cutover Validation (P0 — Final cutover gate)
**Run with:** Claude Code (Sugartown monorepo context required)
**Working directory:** `/Users/beckyalice/SUGARTOWN_DEV/sugartown`
**Prerequisites:**
- Epic 1 (URL Audit) ✅ — all WordPress URLs inventoried
- Epic 2 (Redirect Authoring) ✅ — all redirect rules imported into Sanity, `_redirects` regenerated
- **Hosting platform decision** ⚠️ — must be resolved before Phase 2

**This epic is irreversible once DNS is switched.** Every step has a confirmation gate. The cutover runbook at `docs/briefs/wp-freeze-cutover.md` is the authoritative procedure; this prompt supplements it with redirect-specific validation.

---

## What this epic accomplishes

Validates that redirects work at the HTTP level (not just client-side), deploys the new site to its production hosting, and executes DNS cutover from WordPress to the new platform. By the end, `curl -I https://sugartown.io/blog/old-slug` returns a real 301 from the hosting edge — not a JavaScript redirect.

---

## Phase 0 — Gate Check (do not proceed if any fail)

Before starting any work, confirm the prerequisites are met:

```bash
# 1. Epic 2 artifacts exist and are committed
git log --oneline -5  # should show Epic 2 commit
ls scripts/audit/artifacts/approved_redirects.ndjson

# 2. _redirects file is populated
wc -l apps/web/public/_redirects
echo "--- First 10 lines ---"
head -10 apps/web/public/_redirects

# 3. URL validators pass clean
pnpm validate:urls

# 4. Audit shows zero orphaned content URLs
pnpm audit:urls 2>/dev/null | tail -10

# 5. The app builds successfully
pnpm build

# 6. Cutover runbook exists
cat docs/briefs/wp-freeze-cutover.md
```

Present a gate check summary:

```
Epic 3 Gate Check
─────────────────
✅/❌ Epic 2 committed and merged
✅/❌ _redirects file has [N] rules
✅/❌ validate:urls passes
✅/❌ audit:urls shows 0 orphaned
✅/❌ Build succeeds
✅/❌ Cutover runbook present

⚠️  Hosting platform: [NOT YET DECIDED / decided: ___]

Ready to proceed? [all gates must pass]
```

If any gate fails, stop and resolve before continuing.

---

## Phase 1 — Hosting Platform Decision

This is the external dependency. The right answer determines everything in Phases 2–5. Present the options and help me decide.

```
Hosting Platform Decision
─────────────────────────

Your existing tooling supports:
  • build-redirects.js outputs Netlify/Cloudflare Pages `_redirects` format
  • Vite build produces a static `dist/` folder
  • CI is GitHub Actions

Option A: Netlify
  ✅ _redirects file works as-is (edge-level, no changes needed)
  ✅ Free tier generous for this scale
  ✅ Preview deploys per branch
  ✅ Native form handling if needed later
  → Zero additional redirect work needed

Option B: Cloudflare Pages
  ✅ _redirects file works as-is (same format as Netlify)
  ✅ Faster global edge network
  ✅ Free tier very generous
  ✅ Can add Workers for dynamic behavior later
  → Zero additional redirect work needed

Option C: Vercel
  ⚠️  Requires converting _redirects → vercel.json rewrites
  ⚠️  Need to build an adapter script (new work)
  ✅ Good Next.js ecosystem (not relevant for Vite)
  ✅ Preview deploys per branch
  → Moderate additional work

Option D: Self-hosted / VPS
  ⚠️  Need nginx config or .htaccess generation
  ⚠️  Manual SSL, CDN, deploy pipeline
  ⚠️  Most operational overhead
  → Significant additional work

Recommendation: Option A or B — both consume _redirects natively.
Your build-redirects.js already outputs the right format.
No adapter scripts, no format conversion, no new infrastructure.

Which platform are you going with?
```

Wait for my decision. Everything below branches based on this answer.

---

## Phase 2 — Platform-Specific Redirect Configuration

### If Netlify (Option A):

```bash
# Verify _redirects is included in build output
pnpm --filter web build
ls -la apps/web/dist/_redirects

# If _redirects is NOT in dist/, it's because Vite doesn't copy public/ files.
# Check that the public dir is configured:
grep -n "public" apps/web/vite.config.*
```

If `_redirects` is in `dist/`, no further work needed. If not, create a minimal build step:

```bash
# Add a postbuild copy if needed
# This should already work because Vite copies public/ to dist/ by default
```

Create or verify `netlify.toml` at the repo root:

```toml
[build]
  base = "apps/web"
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  VITE_SANITY_PROJECT_ID = "poalmzla"
  VITE_SANITY_DATASET = "production"
```

**Important:** The `_redirects` file takes precedence over `netlify.toml` redirects. Since `build-redirects.js` already generates this file, no `[[redirects]]` blocks are needed in `netlify.toml`.

Show me the config and wait for confirmation.

### If Cloudflare Pages (Option B):

Same as Netlify — `_redirects` format is identical. Create or verify `wrangler.toml` or project config:

```bash
# Verify _redirects is in build output
pnpm --filter web build
ls -la apps/web/dist/_redirects
```

Cloudflare Pages limits: max 2,000 static redirects in `_redirects`, plus 100 dynamic rules. Verify we're under the limit:

```bash
wc -l apps/web/public/_redirects
# Must be < 2000
```

Show me the count and wait for confirmation.

### If Vercel (Option C):

Build an adapter that converts the `_redirects` file to `vercel.json` format:

```bash
# Create adapter script
cat > apps/web/scripts/build-vercel-redirects.js << 'SCRIPT'
// Converts _redirects (Netlify format) to vercel.json redirects
// Run after build-redirects.js
const fs = require('fs');
const path = require('path');

const redirectsFile = path.join(__dirname, '..', 'public', '_redirects');
const vercelJsonPath = path.join(__dirname, '..', '..', '..', 'vercel.json');

const lines = fs.readFileSync(redirectsFile, 'utf8')
  .split('\n')
  .filter(l => l.trim() && !l.startsWith('#'));

const redirects = lines.map(line => {
  const [source, destination, statusCode = '301'] = line.trim().split(/\s+/);
  return {
    source,
    destination,
    statusCode: parseInt(statusCode, 10),
    permanent: parseInt(statusCode, 10) === 301
  };
});

// Read existing vercel.json or create new
let config = {};
if (fs.existsSync(vercelJsonPath)) {
  config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
}
config.redirects = redirects;

fs.writeFileSync(vercelJsonPath, JSON.stringify(config, null, 2));
console.log(`✅ Wrote ${redirects.length} redirects to vercel.json`);
SCRIPT
```

Show me the script and generated `vercel.json` before proceeding.

### If self-hosted (Option D):

Generate nginx config or .htaccess from the `_redirects` file. This requires more discussion about the hosting setup before I can write the adapter. Stop and ask me for details about the server environment.

---

## Phase 3 — Staging Deploy & HTTP Validation

Deploy to a staging/preview URL and validate redirects with real HTTP requests. Do NOT touch DNS yet.

### 3A — Deploy to staging

The exact steps depend on the platform chosen in Phase 1:

```bash
# Netlify: connect repo or use CLI
# npx netlify deploy --dir=apps/web/dist

# Cloudflare: use wrangler or dashboard
# npx wrangler pages deploy apps/web/dist

# Vercel: use CLI
# npx vercel --cwd apps/web
```

After deploy, capture the preview URL (e.g., `https://abc123.netlify.app` or `https://sugartown-xyz.pages.dev`).

Tell me the staging URL and I'll build the validation script.

### 3B — Build redirect validation script

Create `scripts/audit/validate-redirects-live.js`:

```bash
# This script will:
# 1. Read the _redirects file
# 2. For each redirect rule, send a HEAD request to the staging URL
# 3. Verify the response is the correct status code (301/302/410)
# 4. Verify the Location header points to the correct destination
# 5. Report pass/fail for each rule
```

The script should:
- Accept the staging base URL as an argument: `node scripts/audit/validate-redirects-live.js https://abc123.netlify.app`
- Use native `fetch` (Node 18+)
- Follow redirect: `{ redirect: 'manual' }` to capture the 301 without following it
- Output a clear pass/fail report:

```
Live Redirect Validation — https://abc123.netlify.app
─────────────────────────────────────────────────────
✅ /blog/some-post → /articles/some-post (301)
✅ /post/another → /articles/another (301)
✅ /gem/a-node → /knowledge-graph/a-node (301)
❌ /category/old-cat → /categories/old-cat (EXPECTED 301, GOT 404)
...
─────────────────────────────────────────────────────
Results: [N] passed, [N] failed, [N] total
```

Register as a script:
```json
"validate:redirects-live": "node scripts/audit/validate-redirects-live.js"
```

Show me the script, run it against the staging URL, and present results. **Every redirect must pass before proceeding to DNS cutover.**

### 3C — Spot-check client-side redirects too

The in-app redirects in `App.jsx` (e.g., `/blog/*` → `/articles/*`) still exist as a fallback. Verify they work on the staging deploy by opening a few in a browser:

```
Manual spot-checks (open in browser):
  [ ] https://[staging]/blog/any-slug → should land on /articles/any-slug
  [ ] https://[staging]/nodes/any-slug → should land on /knowledge-graph/any-slug
  [ ] https://[staging]/post/any-slug → should land on /articles/any-slug
```

These are defense-in-depth — the server-side `_redirects` should catch them first, but the React Router redirects are a safety net for any that slip through.

Confirm spot-checks pass.

---

## Phase 4 — WordPress Preparation

Before DNS cutover, WordPress needs to be frozen and configured to hand off cleanly.

### 4A — Review the cutover runbook

```bash
cat docs/briefs/wp-freeze-cutover.md
```

Present the runbook steps as a checklist. Do not improvise — follow the documented procedure.

### 4B — Content freeze

Per the runbook:
- Notify that WordPress is now read-only
- No new posts, no edits, no media uploads
- Document the freeze timestamp

### 4C — WordPress catch-all redirect (post-cutover)

After DNS points to the new hosting, the WordPress instance should either:

**Option 1: Shut down WordPress entirely** — if DNS no longer points to the WP server, there's nothing to configure. This is the cleanest option.

**Option 2: Keep WP running temporarily with a catch-all redirect** — if there's a period where some DNS resolvers still see the old IP:

```php
// In WordPress .htaccess or functions.php
// Redirect ALL traffic to the new site
RewriteEngine On
RewriteCond %{HTTP_HOST} ^sugartown\.io$ [NC]
RewriteRule ^(.*)$ https://new-hosting-url.com/$1 [R=301,L]
```

Present both options and ask which approach I want.

---

## Phase 5 — DNS Cutover

**This is the point of no return for search engines.** Once Google sees the new site, rolling back means re-earning authority from scratch.

### 5A — Pre-cutover checklist

Present as a final go/no-go:

```
DNS Cutover — Go / No-Go Checklist
───────────────────────────────────
✅/❌ All redirects validated on staging (Phase 3B — 0 failures)
✅/❌ Client-side redirects spot-checked (Phase 3C)
✅/❌ WordPress content frozen (Phase 4B)
✅/❌ Build passes: pnpm build
✅/❌ All validators pass: validate:urls, validate:taxonomy
✅/❌ _redirects file in build output
✅/❌ Staging site renders all pages correctly (manual spot-check)
✅/❌ Sanity Studio accessible and functioning
✅/❌ Environment variables set in hosting platform
✅/❌ SSL/HTTPS configured on hosting platform
✅/❌ Custom domain (sugartown.io) configured in hosting dashboard (but DNS not switched yet)
✅/❌ Rollback plan documented and understood

Decision: GO / NO-GO
```

**Do not proceed unless I say GO.**

### 5B — Execute DNS switch

Per the cutover runbook, the DNS change involves updating the A record (or CNAME) for `sugartown.io` to point to the new hosting platform. The exact steps depend on the DNS provider.

```
DNS Change Required:
  Domain: sugartown.io
  Current: [WordPress hosting IP/CNAME]
  New:     [hosting platform value from Phase 1]
  TTL:     Set to 300 (5 min) before cutover for fast propagation

  ⚠️  This must be done manually in the domain registrar / DNS dashboard.
  Claude Code cannot make DNS changes.
```

After DNS change, wait for propagation and verify:

```bash
# Check DNS resolution
dig sugartown.io +short

# Check that the new site responds
curl -I https://sugartown.io

# Verify a redirect works via the real domain
curl -I https://sugartown.io/blog/any-known-slug
# Should return: 301 with Location: https://sugartown.io/articles/any-known-slug
```

### 5C — Post-cutover validation sweep

Run the full redirect validator against the live domain:

```bash
node scripts/audit/validate-redirects-live.js https://sugartown.io
```

Also run a broader crawl check:

```bash
# Quick smoke test of critical pages
for path in "/" "/articles" "/case-studies" "/knowledge-graph" "/tags" "/categories"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://sugartown.io${path}")
  echo "${STATUS} https://sugartown.io${path}"
done
```

All should return 200. Any 404 or 500 is a launch blocker.

---

## Phase 6 — Post-Cutover Monitoring

### 6A — Google Search Console

Within 24 hours of DNS cutover:

1. Verify site ownership in Google Search Console for the new hosting
2. Submit the sitemap: `https://sugartown.io/sitemap.xml` (if it exists — if not, flag this as a follow-up)
3. Use the URL Inspection tool to check 5–10 key pages
4. Monitor the Coverage report daily for the first week — look for spikes in "Excluded" or "Error" URLs

```
Search Console Monitoring — First Week
───────────────────────────────────────
Day 1: Submit sitemap, inspect 10 URLs, baseline coverage count
Day 3: Check coverage report for new errors
Day 7: Compare indexed page count to pre-cutover baseline
Day 14: Final comparison — indexed count should stabilize

⚠️  If "Page with redirect" errors spike, investigate immediately.
⚠️  If indexed pages drop >20%, check for crawl issues.
```

### 6B — Commit final state

```bash
git checkout -b epic/cutover-validation

# Add any new scripts or configs created
git add scripts/audit/validate-redirects-live.js
git add netlify.toml  # or vercel.json or equivalent
git add package.json  # if validate:redirects-live was registered

git commit -m "feat: cutover validation tooling and hosting config

Epic 3 of Launch Routing. Adds live redirect validation script,
hosting platform configuration, and documents cutover execution.

- Hosting platform: [platform name]
- Live redirect validation: [N] rules, 0 failures
- DNS cutover executed: [date]
- Post-cutover smoke tests: all pages returning 200
- Search Console: sitemap submitted, monitoring initiated

Depends on: Epic 1 (URL Audit), Epic 2 (Redirect Authoring)"
```

---

## Definition of Done

- [ ] Hosting platform chosen and configured
- [ ] `_redirects` (or platform equivalent) included in build output
- [ ] Live redirect validation passes 100% against staging
- [ ] WordPress frozen per cutover runbook
- [ ] DNS switched to new hosting
- [ ] `curl -I https://sugartown.io/blog/old-slug` returns 301 with correct Location header
- [ ] All critical pages return 200
- [ ] Google Search Console sitemap submitted
- [ ] Monitoring plan in place for first 14 days
- [ ] Committed on `epic/cutover-validation` branch

---

## What this epic does NOT do

- Does not create redirect rules (that was Epic 2)
- Does not audit WordPress URLs (that was Epic 1)
- Does not set up CI/CD for ongoing deployments (that's a separate infrastructure epic)
- Does not implement a sitemap generator (flag as follow-up if missing)
- Does not handle image migration to hosting CDN (separate concern)

This epic gets the site live on its new home with working redirects. Everything else is post-launch.

---

## Rollback Plan

If something goes catastrophically wrong after DNS cutover:

1. **Revert DNS** — point `sugartown.io` back to WordPress hosting IP
2. DNS propagation takes up to TTL duration (5 min if set to 300 pre-cutover)
3. WordPress was frozen but not deleted — it will resume serving immediately
4. No Sanity data is affected — the redirect documents remain for retry
5. Investigate what failed, fix, and re-attempt cutover

The key: **do not delete or modify the WordPress site until at least 14 days post-cutover with clean Search Console reports.**
