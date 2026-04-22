**Linear Issue:** [SUG-75](https://linear.app/sugartown/issue/SUG-75/sanity-content-hygiene-resolve-duplicate-slugs-and-missing-seo-fields)
**Status:** Backlog
**Priority:** High
**Surfaced:** v0.22.0 release — `pnpm validate:content` (2026-04-22)

---

## Scope

Studio content fixes surfaced by the v0.22.0 release validators. No code changes required.

---

## Errors — must fix before next content-dependent deploy

### Duplicate slug: `design-tokens` tag

`[tag]` slug `design-tokens` is used by 2 documents. One is a duplicate — either merged into the other or deleted.

**Fix in Studio:** `/tags` → find both `design-tokens` docs → reassign any content refs to the canonical one → delete the duplicate.

### Duplicate slug: `home` page

`[tag]` slug `home` is used by 2 `page` documents. The homepage can only have one published doc at this slug.

**Fix in Studio:** `/page` list → find both `home` docs → determine which is live → unpublish or delete the stale one.

---

## Warnings — non-blocking, address in a Studio pass

41 documents are missing `seo.title` and/or `seo.description`:

- Known affected: "We Never Actually Adopted Structured Content" (article), "Bunk: Use Your Own Product" (article), "test node" (node), "I Audited My Human's Table Input" (node) — and ~37 others.

**Fix in Studio:** Open each document → SEO tab → fill in title (50–60 chars) and description (120–160 chars).

**Acceptance:** `pnpm validate:content` exits with zero errors. SEO warnings at zero or each remaining omission documented as intentional (e.g. draft nodes not yet ready for indexing).

---

## Out of scope

The 14 `validate:urls` warnings are known unbuilt nav routes (Services, Platform, Contact, Library sub-pages, etc.). These are tracked in their own epics (SUG-71, SUG-72, IA brief). No action here.

---

## Definition of Done

- [ ] `pnpm validate:content` exits 0 (zero errors)
- [ ] Duplicate `design-tokens` tag resolved in Studio
- [ ] Duplicate `home` page resolved in Studio
- [ ] SEO fields filled in or omissions documented
- [ ] Epic doc moved `docs/backlog/` → `docs/shipped/`
- [ ] Linear SUG-75 → Done
