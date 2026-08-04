---
**Epic:** SUG-260 — Migrate wp.* dotted document IDs — 133 docs invisible to anonymous reads
**Linear Issue:** [SUG-260](https://linear.app/sugartown/issue/SUG-260/migrate-wp-dotted-document-ids-133-docs-invisible-to-anonymous-reads)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — audit/decision phases ship independently;
the migration-execution phase is internally atomic (see Non-Goals)
---

# SUG-260 — Migrate wp.* dotted document IDs

## Background

Sanity treats dots in `_id` as path segments. A dataset's public-read grant covers path
`*` (one segment), so **any document whose id contains a dot is invisible to anonymous
queries** — even on a `public` dataset. The WordPress migration minted ids as
`wp.<type>.<id>`. Measured 2026-07-28 against `poalmzla/production`:

| Type | Published | Anonymous-visible | Hidden |
|---|---|---|---|
| person | 1 | 0 | **1** |
| tag | 64 | 20 | **44** |
| category | 14 | 4 | **10** |
| node | 52 | 15 | **37** |
| article | 15 | 8 | **7** |
| caseStudy | 8 | 1 | **7** |
| page | 10 | 6 | **4** |
| tool · project · glossaryTerm | 140 | 140 | 0 ✅ |
| **Total** | **770** | **636** | **133** |

Documents with a dotted id that are publicly visible: **0**. Exact correlation.

**The live site is not broken.** `apps/web/src/lib/sanity.js` ships a viewer token to
the browser and documents why: dot-namespace ids are only visible to authenticated
queries even on a public dataset. The cost is architectural, not a live incident:

- **A public-by-construction credential.** `VITE_`-prefixed values inline at build
  time; the `web-frontend-read` viewer token is extractable from the deployed bundle.
  Read-only, no write/delete exposure, Bex has confirmed no drafts are sensitive — so
  confidentiality impact is nil today. It still can't be scoped or rotated without a
  redeploy.
- **Every consumer must authenticate.** SUG-255 hit this directly: `validate:taxonomy`
  reported 63 dangling tag refs and 24 dangling author refs that resolve fine for the
  live (authenticated) site — a false-negative-shaped gate.
- **The failure mode is silent and inverted.** Works for Studio, local scripts, the
  deployed site — every authenticated path. Breaks only for the unauthenticated case,
  which is the one nobody tests day to day.

Migrating the ids lets the token be **removed entirely**, not merely rotated.

## Objective

Every `wp.*`-prefixed document id (and every `drafts.wp.*`) is migrated to a dot-free
scheme, every inbound reference rewritten in the same atomic operation, the viewer
token removed from the web client, `web-frontend-read` deleted, and `validate:taxonomy`
passes anonymously.

## Scope (sketch — Phase 0 required at activation)

- [ ] **Phase 0 (activation):** audit all 133 dotted ids by type and every inbound
      reference — including `person.expertise[]` → `wp.category.*`, `authors[]` →
      `wp.person.bhead`, `tags[]`/`categories[]` across article/node/caseStudy/page.
      Decide the target id scheme (UUID vs slug-derived dot-free, e.g. `wp-person-bhead`)
- [ ] Migration script rewriting documents **and** every reference atomically — a
      partial run leaves dangling refs that are real, not merely apparent
- [ ] Remove `token` from the web client; confirm anonymous rendering of authors, tags,
      categories
- [ ] Delete `web-frontend-read`; drop the temporary `CI_SANITY_READ_TOKEN` from `ci.yml`
- [ ] Re-run `validate:taxonomy` with **no token** — the acceptance test

## Non-Goals

- **Widening the dataset ACL from `*` to `**`.** This would make anonymous reads "work"
  instantly and **expose every unpublished draft to the open internet** — drafts are
  stored as `drafts.<id>`, also dotted. The convenient fix is the dangerous one; stays
  dangerous regardless of whether today's drafts are sensitive
- **A non-atomic, incremental id migration.** Partial state is worse than the current
  state (dangling refs, not merely hidden docs) — this is why the migration-execution
  phase is internally atomic even though the epic overall merges phase-by-phase

## Acceptance Criteria

- [ ] `pnpm validate:taxonomy` passes with no `CI_SANITY_READ_TOKEN` set
- [ ] Anonymous query of author, tag, category counts matches Studio's authenticated
      count (0 hidden)
- [ ] `web-frontend-read` token deleted from Sanity; no `VITE_SANITY_*` token in the
      web client bundle
- [ ] Migration report documents every rewritten id and every reference updated,
      counts matching before/after

## Related

- **Linear:** [SUG-260](https://linear.app/sugartown/issue/SUG-260)
- **Origin:** found 2026-07-28 during SUG-255, when `validate:taxonomy` ran in CI for
  the first time in its existence and reported anonymous-only dangling references
