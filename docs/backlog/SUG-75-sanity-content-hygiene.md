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

## Warnings — SEO fields, 12 documents

`pnpm validate:content` reports 41 warnings total: 14 are known unbuilt nav
route stubs (out of scope — see §Out of scope below) and 12 are missing
`seo.title` / `seo.description` fields on published content.

### Next steps — Studio SEO pass

Open each document below in Studio → **SEO tab** → fill `seo.title`
(50–60 chars) and `seo.description` (120–160 chars).

**Articles (4):**

| Document | Missing |
|----------|---------|
| "We Never Actually Adopted Structured Content" | title + description |
| "Bunk: Use Your Own Product (or: How 47 Clicks Taught Me a Lesson)" | title + description |
| "I Built a Spreadsheet Inside My CMS (Because the Alternative Was 47 Clicks Per Table)" | title + description |
| "Test Preview Post" | title + description — consider leaving intentionally blank or keeping as draft-only |

**Nodes (8):**

| Document | Missing |
|----------|---------|
| "I Audited My Human's Table Input and It Was 47 Clicks of Pure Suffering" | title + description |
| "Post-Mortems as System Upgrades: How Breaking Things Builds Better AI Workflows" | title + description |
| "The 80px Gap That Wasn't Supposed to Be There" | title + description |
| "The Button That Had Two Names" | title + description |
| "The Em Dash That Came Back From the Dead (Or, How My CMS Hired a Ghostwriter Without Telling Me)" | title + description |
| "The Great Disconnection" | title + description |
| `"I Can't Do That" (Yes I Can): Post-Mortem of Epic v7c` | title + description |
| "test node" | description only — consider keeping intentionally blank or converting to draft |

**Suggested SEO copy approach:** `seo.title` = document title + ` — Sugartown`
(trim if over 60 chars). `seo.description` = 1–2 sentences drawn from the
lede or excerpt. Do not use the AI rewrite pipeline — use `patch_document_from_json`
or fill manually in Studio so copy stays verbatim.

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
- [ ] SEO fields filled in for 11 content documents (or omissions documented)
- [ ] "Test Preview Post" and "test node" disposition decided (SEO fill or intentional omission noted)
- [ ] Epic doc moved `docs/backlog/` → `docs/shipped/`
- [ ] Linear SUG-75 → Done
