# PROMPT — Epic 2: Redirect Rule Authoring & Import

**Epic:** Redirect Rule Authoring & Import (P0 — Depends on Epic 1)
**Run with:** Claude Code (Sugartown monorepo context required)
**Working directory:** `/Users/beckyalice/SUGARTOWN_DEV/sugartown`
**Prerequisite:** Epic 1 (URL Audit & Gap Analysis) must be complete. The following artifacts must exist:
- `scripts/audit/artifacts/redirect_gaps.md`
- `scripts/audit/artifacts/proposed_redirects.ndjson`
- `scripts/audit/artifacts/url_inventory.json`

**This epic WRITES to Sanity.** Unlike Epic 1 (read-only), this epic imports redirect documents into the production dataset. Every write requires explicit human approval.

---

## What this epic accomplishes

Takes the audit output from Epic 1 and turns it into real redirect rules stored in Sanity. By the end, `build-redirects.js` produces a `_redirects` file that covers every non-structural WordPress URL. Nothing is orphaned.

This is editorial + engineering work. Claude Code handles the tooling; you make the routing decisions.

---

## Phase 1 — Orient (review what Epic 1 produced)

Read the Epic 1 artifacts and the existing redirect infrastructure before doing anything else.

```bash
# Read the gap analysis report — this is your decision document
cat scripts/audit/artifacts/redirect_gaps.md

# Count what we're dealing with
cat scripts/audit/artifacts/url_inventory.json | node -e "
  const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  const counts = {};
  data.forEach(u => { counts[u.status] = (counts[u.status]||0) + 1; });
  console.log('Status breakdown:');
  Object.entries(counts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log('  ' + k + ': ' + v));
  console.log('  TOTAL: ' + data.length);
"

# Review what redirects already exist in Sanity
cat apps/web/public/_redirects

# Understand the redirect schema
cat apps/studio/schemas/documents/redirect.ts

# Understand how build-redirects.js works
cat apps/web/scripts/build-redirects.js

# Review the proposed auto-generated redirects
wc -l scripts/audit/artifacts/proposed_redirects.ndjson
head -5 scripts/audit/artifacts/proposed_redirects.ndjson

# Check current route namespace for reference
grep -A 20 "TYPE_NAMESPACES" apps/web/src/lib/routes.js
```

After reading, present me with a structured briefing using this format:

```
Epic 2 Briefing — Redirect Authoring
─────────────────────────────────────

📊 Inventory Summary
  Total WP URLs:           [N]
  Already covered:         [N] (matched + redirected + hardcoded)
  ⚠️  ORPHANED (need rules): [N]
  ℹ️  Taxonomy (need decisions): [N]
  ℹ️  Structural (can ignore): [N]

📋 Existing Redirects in Sanity: [N]
📋 Proposed New Redirects:        [N]

⚠️  Decisions Needed From You:
  1. [list each taxonomy URL or edge case that needs a human call]
  2. ...
```

Wait for my review and decisions before proceeding.

---

## Phase 2 — Editorial Triage

This phase is a conversation, not a script. Present each category of URLs that needs a decision, and I'll tell you what to do.

### 2A — Orphaned content URLs

For each ORPHANED URL from the gap report, present it in a decision table:

```
⚠️  Orphaned URLs — Need Redirect Targets
──────────────────────────────────────────
 #  | WP URL                        | Type      | Title                  | Suggested Target          | Action?
 1  | /blog/old-post-slug           | post      | Old Post Title         | /articles/old-post-slug   | [approve/edit/skip]
 2  | /gem/some-node                | gem       | Some Node              | /knowledge-graph/some-node| [approve/edit/skip]
 ...
```

I will respond with one of:
- **approve** — use the suggested target as-is
- **edit** — I'll provide a different target
- **skip** — do not create a redirect for this URL (document why in the note field)
- **410** — this content is intentionally gone; issue a 410 Gone instead of 301

Wait for my response on every orphaned URL before proceeding.

### 2B — Taxonomy URLs

WP generates archive URLs for categories and tags (e.g., `/category/ai-tools/`, `/tag/design-systems/`). These need a policy decision, not per-URL triage. Present the full list, then ask me:

```
ℹ️  Taxonomy URLs — Policy Decision Needed
───────────────────────────────────────────
Found [N] WordPress taxonomy archive URLs:

Categories:
  /category/engineering-dx/
  /category/ai-automation/
  ...

Tags:
  /tag/design-systems/
  /tag/python/
  ...

Options:
  A) Redirect all to new canonical taxonomy pages (/categories/:slug, /tags/:slug)
  B) Redirect all to the main archive page (/articles)
  C) Let them 404 (no redirects — these were low-value archive pages)
  D) Mixed — redirect categories, let tags 404
  E) Something else — tell me your preference
```

Wait for my decision.

### 2C — Structural URLs

Date archives (`/2025/01/`), author archives (`/author/bex/`), feed URLs (`/feed/`), pagination (`/page/2/`). Present the list and recommend:

```
ℹ️  Structural URLs — Recommendation
─────────────────────────────────────
These are WordPress infrastructure URLs with no 1:1 equivalent in the new system:

  /2025/01/          (date archive)
  /2025/02/          (date archive)
  /author/bex/       (author archive)
  /feed/             (RSS feed)
  /feed/atom/        (Atom feed)
  /page/2/           (pagination)
  ...

Recommendation: Do NOT create individual redirects.
These are best handled by a catch-all 404 page in the new system.
If you want /feed/ to redirect somewhere specific (e.g., an RSS endpoint), let me know.

Approve recommendation? [yes/no/modify]
```

Wait for my decision.

---

## Phase 3 — Build the Final Redirect Set

After all decisions are made, create the import-ready file.

### 3A — Generate the approved ndjson

Create a script at `scripts/audit/prepare-redirects.js` that:

1. Reads `proposed_redirects.ndjson` from Epic 1 as the starting point
2. Applies the editorial decisions from Phase 2 (hardcoded into the script as a decision manifest)
3. Adds any taxonomy redirects based on the policy decision
4. Removes any URLs I marked as "skip"
5. Converts any "410" decisions to `statusCode: 410`
6. Writes the final approved set to `scripts/audit/artifacts/approved_redirects.ndjson`

The script should also produce a summary diff:

```
Redirect Preparation Summary
─────────────────────────────
📥 Input (proposed):     [N] redirects
✅ Approved (301):       [N]
🚫 Skipped:              [N]
⛔ Gone (410):           [N]
🏷  Taxonomy (added):    [N]
📤 Output (approved):    [N] redirects

Written to: scripts/audit/artifacts/approved_redirects.ndjson
```

**Important:** Every redirect document must follow the existing schema:
```json
{
  "_type": "redirect",
  "_id": "redirect.audit.[hash-or-sequential]",
  "from": "/old/path",
  "to": "/new/path",
  "statusCode": 301,
  "note": "Source: Epic 2 URL audit — [brief context]"
}
```

The `_id` namespace `redirect.audit.*` distinguishes these from the v0.10.0 migration redirects (`redirect.wp.*` created by `scripts/migrate/redirects.js`).

Show me the complete script and the generated `approved_redirects.ndjson` before proceeding.

---

## Phase 4 — Import into Sanity

**This is the write step. Do not proceed without explicit confirmation.**

### 4A — Dry run validation

Before importing, validate the ndjson:

```bash
# Count lines (each line = one document)
wc -l scripts/audit/artifacts/approved_redirects.ndjson

# Validate JSON structure of each line
cat scripts/audit/artifacts/approved_redirects.ndjson | node -e "
  const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\n');
  let valid = 0, invalid = 0;
  const issues = [];
  lines.forEach((line, i) => {
    try {
      const doc = JSON.parse(line);
      if (!doc._type || doc._type !== 'redirect') issues.push('Line ' + (i+1) + ': wrong _type');
      if (!doc.from) issues.push('Line ' + (i+1) + ': missing from');
      if (!doc.to && doc.statusCode !== 410) issues.push('Line ' + (i+1) + ': missing to');
      if (!doc.statusCode) issues.push('Line ' + (i+1) + ': missing statusCode');
      if (!doc._id) issues.push('Line ' + (i+1) + ': missing _id');
      valid++;
    } catch(e) {
      invalid++;
      issues.push('Line ' + (i+1) + ': invalid JSON');
    }
  });
  console.log('Valid documents: ' + valid);
  console.log('Invalid documents: ' + invalid);
  if (issues.length) { console.log('Issues:'); issues.forEach(i => console.log('  ⚠️  ' + i)); }
  else console.log('✅ All documents valid');
"

# Check for duplicates (same 'from' path)
cat scripts/audit/artifacts/approved_redirects.ndjson | node -e "
  const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\n');
  const froms = {};
  lines.forEach((line, i) => {
    const doc = JSON.parse(line);
    if (froms[doc.from]) console.log('⚠️  Duplicate from: ' + doc.from + ' (lines ' + froms[doc.from] + ' and ' + (i+1) + ')');
    froms[doc.from] = i + 1;
  });
  if (Object.keys(froms).length === lines.length) console.log('✅ No duplicate source paths');
"

# Check for conflicts with existing redirects in Sanity
node -e "
  const {createClient} = require('@sanity/client');
  const fs = require('fs');
  const client = createClient({
    projectId: 'poalmzla',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: process.env.VITE_SANITY_TOKEN,
    useCdn: false
  });
  async function check() {
    const existing = await client.fetch('*[_type == \"redirect\"]{ _id, from, to }');
    const proposed = fs.readFileSync('scripts/audit/artifacts/approved_redirects.ndjson','utf8')
      .trim().split('\n').map(l => JSON.parse(l));
    const existingFroms = new Set(existing.map(r => r.from));
    const conflicts = proposed.filter(p => existingFroms.has(p.from));
    if (conflicts.length) {
      console.log('⚠️  ' + conflicts.length + ' redirects conflict with existing Sanity documents:');
      conflicts.forEach(c => console.log('  ' + c.from + ' → ' + c.to));
      console.log('These will be OVERWRITTEN by createOrReplace. Review above before proceeding.');
    } else {
      console.log('✅ No conflicts with existing redirects');
    }
    console.log('Existing redirects in Sanity: ' + existing.length);
    console.log('New redirects to import: ' + proposed.length);
    console.log('Post-import total: ' + (existing.length + proposed.length - conflicts.length));
  }
  check();
"
```

Present all validation results and wait for my explicit "go" before importing.

### 4B — Import

After I confirm:

```bash
# Import using the Sanity CLI with createOrReplace (idempotent)
node -e "
  const {createClient} = require('@sanity/client');
  const fs = require('fs');
  const client = createClient({
    projectId: 'poalmzla',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: process.env.VITE_SANITY_TOKEN,
    useCdn: false
  });
  async function importRedirects() {
    const lines = fs.readFileSync('scripts/audit/artifacts/approved_redirects.ndjson','utf8')
      .trim().split('\n').map(l => JSON.parse(l));
    console.log('Importing ' + lines.length + ' redirect documents...');
    const tx = client.transaction();
    lines.forEach(doc => tx.createOrReplace(doc));
    const result = await tx.commit();
    console.log('✅ Import complete. Transaction ID: ' + result.transactionId);
    console.log('Documents written: ' + lines.length);
  }
  importRedirects().catch(err => { console.error('❌ Import failed:', err.message); process.exit(1); });
"
```

After import, immediately verify:

```bash
# Query Sanity to confirm documents landed
node -e "
  const {createClient} = require('@sanity/client');
  const client = createClient({
    projectId: 'poalmzla',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: process.env.VITE_SANITY_TOKEN,
    useCdn: false
  });
  async function verify() {
    const all = await client.fetch('*[_type == \"redirect\"]{ _id, from, to, statusCode }');
    const auditOnes = all.filter(r => r._id.startsWith('redirect.audit.'));
    console.log('Total redirects in Sanity: ' + all.length);
    console.log('From this import (redirect.audit.*): ' + auditOnes.length);
    console.log('Pre-existing (other namespaces): ' + (all.length - auditOnes.length));
  }
  verify();
"
```

---

## Phase 5 — Rebuild and Validate _redirects

Now test that the full pipeline works end-to-end.

### 5A — Regenerate the _redirects file

```bash
# Run the existing build-redirects script
node apps/web/scripts/build-redirects.js

# Check the output
wc -l apps/web/public/_redirects
echo "---"
cat apps/web/public/_redirects
```

Verify that:
1. The file contains all pre-existing redirects (from v0.10.0 migration)
2. The file contains all newly imported redirects from this epic
3. No duplicate `from` paths exist
4. Format matches what the hosting platform expects (Netlify/Cloudflare: `from to statusCode`)

### 5B — Run existing validators

```bash
# URL authority check — should still pass clean
pnpm validate:urls

# Taxonomy check — should still pass clean
pnpm validate:taxonomy
```

### 5C — Cross-reference against the audit

Run the Epic 1 spider again to confirm zero orphaned URLs remain:

```bash
pnpm audit:urls
```

The summary should now show:
- **ORPHANED: 0** (or only structural URLs you deliberately chose not to redirect)
- Everything that was ORPHANED in Epic 1 should now be REDIRECTED

If any orphaned URLs remain that aren't structural, stop and investigate.

---

## Phase 6 — Commit

When everything validates:

```bash
git checkout -b epic/redirect-authoring

# Add the new script and artifacts
git add scripts/audit/prepare-redirects.js
git add scripts/audit/artifacts/approved_redirects.ndjson

# Add the regenerated _redirects file
git add apps/web/public/_redirects

git commit -m "feat: author and import redirect rules from URL audit

Epic 2 of Launch Routing. Reviews Epic 1 gap analysis, applies
editorial decisions for orphaned/taxonomy/structural URLs, and
imports approved redirect documents into Sanity production.

- [N] new redirect documents imported (redirect.audit.* namespace)
- [N] taxonomy URLs handled per policy: [brief description]
- [N] structural URLs intentionally excluded
- _redirects file regenerated with full coverage
- validate:urls passes clean
- audit:urls shows 0 orphaned content URLs

Depends on: Epic 1 (URL Audit & Gap Analysis)"
```

Do NOT push. Do NOT merge. Wait for my final review.

---

## Definition of Done

- [ ] Every ORPHANED URL from Epic 1 has been triaged (approved, edited, skipped, or 410'd)
- [ ] Taxonomy URL policy decided and implemented
- [ ] Structural URL policy decided (likely: ignore)
- [ ] `approved_redirects.ndjson` generated and validated
- [ ] Redirect documents imported into Sanity production
- [ ] `build-redirects.js` produces a complete `_redirects` file
- [ ] `pnpm validate:urls` passes clean
- [ ] `pnpm audit:urls` shows 0 orphaned content URLs
- [ ] Committed on `epic/redirect-authoring` branch, not pushed

---

## What this epic does NOT do

- Does not configure server-side redirect behavior at the hosting level (that's Epic 3)
- Does not modify the `redirect` schema in Studio
- Does not modify `build-redirects.js` (it should already work — if it doesn't, that's a bug to fix, not a feature to add)
- Does not touch App.jsx or client-side redirect logic
- Does not handle DNS cutover (that's Epic 3)

This epic gets the redirect *data* right. Epic 3 gets the redirect *infrastructure* right.
