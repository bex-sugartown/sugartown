**Linear Issue:** [SUG-75](https://linear.app/sugartown/issue/SUG-75/sanity-content-hygiene-resolve-duplicate-slugs-and-missing-seo-fields)
**Status:** Done
**Priority:** High
**Surfaced:** v0.22.0 release — `pnpm validate:content` (2026-04-22)
**Closed:** 2026-04-22

---

## Scope

Studio content fixes surfaced by the v0.22.0 release validators. No code changes required (except validator fix).

---

## Errors — ✅ Both resolved (2026-04-22)

`pnpm validate:content` exits 0 as of 2026-04-22.

### ✅ Duplicate slug: `design-tokens` tag

Duplicate tag document deleted in Studio. Canonical `design-tokens` tag retained.

### ✅ Duplicate slug: `home` page

Stale page slug updated to `home-old` and document unpublished. Live homepage
(`home`) is the only published doc at that slug.

---

## Warnings — SEO fields — ✅ All resolved (2026-04-22)

`pnpm validate:content` check J reports `✅ All content docs have SEO title and description`.

### Resolution summary

**Auto-patched via `patch_document_from_json` (7 documents):**

| Document | seo.title |
|----------|-----------|
| "I Built a Spreadsheet Inside My CMS" | "I Built a Spreadsheet Inside My CMS — Sugartown" |
| "I Audited My Human's Table Input" | "I Audited My Human's Table Input — Sugartown" |
| "Post-Mortems as System Upgrades" | "Post-Mortems as System Upgrades — Sugartown" |
| "The Button That Had Two Names" | "The Button That Had Two Names — Sugartown" |
| "The Em Dash That Came Back From the Dead" | "The Em Dash That Came Back From the Dead — Sugartown" |
| "The Great Disconnection" | "The Great Disconnection — Sugartown" |
| `"I Can't Do That" (Yes I Can)` | `"I Can't Do That" (Yes I Can) — Sugartown` |

**Intentional omissions:**

| Document | Decision |
|----------|----------|
| "Test Preview Post" | Unpublished draft — SEO intentionally blank |
| "test node" | Unpublished draft — SEO intentionally blank |

**Validator fix:** `validate-content.js` now uses `perspective: 'published'` explicitly
(commit `fb1f9b4`) so unpublished drafts no longer appear in SEO check J.

---

## Out of scope

The remaining 25 warnings from `pnpm validate:content` are:
- Draft-only document detection (check G) — unrelated to this epic
- Taxonomy coverage (check H) — unrelated to this epic
- 14 known unbuilt nav route stubs (check F) — tracked in SUG-71, SUG-72, IA brief

---

## Definition of Done — ✅ All complete

- [x] `pnpm validate:content` exits 0 (zero errors)
- [x] Duplicate `design-tokens` tag resolved in Studio
- [x] Duplicate `home` page resolved in Studio (`home-old`, unpublished)
- [x] Test docs disposition decided — unpublished drafts, intentionally blank
- [x] Validator fix: `perspective: 'published'` added to `validate-content.js` (commit `fb1f9b4`)
- [x] SEO auto-patched for 7 published documents and published in Studio
- [x] Check J clean: `✅ All content docs have SEO title and description`
- [x] Epic doc moved `docs/backlog/` → `docs/shipped/`
- [x] Linear SUG-75 → Done
