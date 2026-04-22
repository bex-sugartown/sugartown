**Linear Issue:** [SUG-75](https://linear.app/sugartown/issue/SUG-75/sanity-content-hygiene-resolve-duplicate-slugs-and-missing-seo-fields)
**Status:** In Progress
**Priority:** High
**Surfaced:** v0.22.0 release — `pnpm validate:content` (2026-04-22)

---

## Scope

Studio content fixes surfaced by the v0.22.0 release validators. No code changes required.

---

## Errors — ✅ Both resolved (2026-04-22)

`pnpm validate:content` exits 0 as of 2026-04-22.

### ✅ Duplicate slug: `design-tokens` tag

Duplicate tag document deleted in Studio. Canonical `design-tokens` tag retained.

### ✅ Duplicate slug: `home` page

Stale page slug updated to `home-old` and document unpublished. Live homepage
(`home`) is the only published doc at that slug.

---

## Warnings — SEO fields

`pnpm validate:content` reports warnings for missing `seo.title` / `seo.description`
on published content documents, plus 14 known unbuilt nav route stubs (out of scope).

### ✅ SEO patches applied via MCP (2026-04-22)

The following 7 published documents were patched via `patch_document_from_json`
(verbatim copy, no AI rewrite pipeline). Drafts created — **pending Studio publish**.

**Articles (1):**

| Document | seo.title | Status |
|----------|-----------|--------|
| "I Built a Spreadsheet Inside My CMS" | "I Built a Spreadsheet Inside My CMS — Sugartown" | Draft pending publish |

**Nodes (6):**

| Document | seo.title | Status |
|----------|-----------|--------|
| "I Audited My Human's Table Input" | "I Audited My Human's Table Input — Sugartown" | Draft pending publish |
| "Post-Mortems as System Upgrades" | "Post-Mortems as System Upgrades — Sugartown" | Draft pending publish |
| "The Button That Had Two Names" | "The Button That Had Two Names — Sugartown" | Draft pending publish |
| "The Em Dash That Came Back From the Dead" | "The Em Dash That Came Back From the Dead — Sugartown" | Draft pending publish |
| "The Great Disconnection" | "The Great Disconnection — Sugartown" | Draft pending publish |
| `"I Can't Do That" (Yes I Can)` | `"I Can't Do That" (Yes I Can) — Sugartown` | Draft pending publish |

### Remaining SEO — Studio manual pass required

The following documents still need SEO fields. These were not auto-patched because
copy must be written from scratch or confirmed by a human:

| Document | Missing | Note |
|----------|---------|------|
| "We Never Actually Adopted Structured Content" | title + description | Article |
| "Bunk: Use Your Own Product (or: How 47 Clicks Taught Me a Lesson)" | title + description | Article |
| "The 80px Gap That Wasn't Supposed to Be There" | title + description | Node |

### Intentional omissions (2026-04-22)

| Document | Decision |
|----------|----------|
| "Test Preview Post" | Unpublished draft — SEO intentionally blank. Validator fix (perspective: 'published') excludes it. |
| "test node" | Unpublished draft — SEO intentionally blank. Excluded by same fix. |

`validate-content.js` now uses `perspective: 'published'` explicitly (commit `fb1f9b4`),
so unpublished drafts no longer appear as SEO warnings.

---

## Out of scope

The 14 `validate:urls` warnings are known unbuilt nav routes (Services, Platform,
Contact, Library sub-pages, etc.). Tracked in their own epics (SUG-71, SUG-72,
IA brief). No action here.

---

## Definition of Done

- [x] `pnpm validate:content` exits 0 (zero errors) — confirmed 2026-04-22
- [x] Duplicate `design-tokens` tag resolved in Studio
- [x] Duplicate `home` page resolved in Studio (`home-old`, unpublished)
- [x] Test docs disposition decided — unpublished drafts, intentionally blank, excluded by validator fix
- [x] Validator fix: `perspective: 'published'` added to `validate-content.js` (commit `fb1f9b4`)
- [x] SEO auto-patched for 7 published documents — drafts pending Studio publish
- [ ] Publish 7 SEO drafts in Studio
- [ ] Studio manual SEO pass for 3 remaining documents
- [ ] Re-run `pnpm validate:content` after publish to confirm warning count drops
- [ ] Epic doc moved `docs/backlog/` → `docs/shipped/`
- [ ] Linear SUG-75 → Done
