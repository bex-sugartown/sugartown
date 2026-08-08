---
**Epic:** SUG-260 — Migrate wp.* dotted document IDs — 110 docs invisible to anonymous reads
**Linear Issue:** [SUG-260](https://linear.app/sugartown/issue/SUG-260/migrate-wp-dotted-document-ids-133-docs-invisible-to-anonymous-reads)
**Status:** In Progress — Phase 0 audit complete 2026-08-08
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — audit and tooling phases ship independently;
the migration-execution phase is internally atomic (see Non-Goals)
---

# SUG-260 — Migrate wp.* dotted document IDs

## Background

Sanity treats dots in `_id` as path segments. A dataset's public-read grant covers path
`*` (one segment), so **any document whose id contains a dot is invisible to anonymous
queries** — even on a `public` dataset. The WordPress migration minted ids as
`wp.<type>.<id>`.

**Measured 2026-08-08** (supersedes the 2026-07-28 figures this doc previously carried).
Reproduce with:

```bash
TOKEN=$(grep '^SANITY_AUTH_TOKEN=' apps/web/.env | cut -d= -f2)
Q='%2A%5B%5D'
curl -s -H "Authorization: Bearer $TOKEN" "https://poalmzla.api.sanity.io/v2025-02-02/data/query/production?query=$Q" -o /tmp/auth.json
curl -s "https://poalmzla.api.sanity.io/v2025-02-02/data/query/production?query=$Q" -o /tmp/anon.json
```

| Type | Published | Anonymous-visible | Hidden |
|---|---|---|---|
| tag | 64 | 20 | **44** |
| node | 52 | 15 | **37** |
| category | 14 | 4 | **10** |
| article | 15 | 8 | **7** |
| caseStudy | 8 | 1 | **7** |
| page | 10 | 6 | **4** |
| person | 1 | 0 | **1** |
| tool · project · glossaryTerm | 140 | 140 | 0 ✅ |
| **content subtotal** | | | **110** |
| Sanity-owned (`_.system.*`, `sanity.*`) | 24 | 0 | **24** |
| **Total** | **779** | **645** | **134** |

Dotted ⟺ hidden correlation: **exact, 0 mismatches in either direction.**

### The transform set is 110, not 133

The prior version of this doc said "audit all 133 dotted ids". That number conflates two
sets, and its own table summed to 110 across its rows while stating 133. Corrected:

| ID namespace | Count | Disposition |
|---|---|---|
| `wp.*` | **110** published + **1** draft | **Migrate.** All exactly `wp.<type>.<id>`, 3 segments, 0 exceptions |
| `_.system.*` | 13 | **Sanity-owned. Never touch.** `system.group` ×11, `system.retention`, `system.schema` |
| `sanity.*` | 11 | **Sanity-owned. Never touch.** `sanity.assist.task.status` ×10, `sanity.assist.schemaType.annotations` |

The 24 Sanity-owned documents are dotted by Sanity's own design and stay hidden
permanently and correctly. A migration executed against "all 133" would rewrite Sanity's
internal platform documents.

### Why it matters

**The live site is not broken.** `apps/web/src/lib/sanity.js` ships a viewer token to the
browser and documents why. The cost is architectural, not a live incident:

- **A public-by-construction credential.** `VITE_`-prefixed values inline at build time; the
  `web-frontend-read` viewer token is extractable from the deployed bundle. Read-only, no
  write or delete exposure, and Bex has confirmed no drafts are sensitive, so confidentiality
  impact is nil today. It still cannot be scoped or rotated without a redeploy.
- **Every consumer must authenticate.** SUG-255 hit this directly: `validate:taxonomy`
  reported 63 dangling tag refs and 24 dangling author refs that resolve fine for the live
  (authenticated) site — a false-negative-shaped gate.
- **The failure mode is silent and inverted.** Works for Studio, local scripts and the
  deployed site, every authenticated path. Breaks only for the unauthenticated case, which is
  the one nobody tests day to day.
- **It blocks SUG-187.** Seven of eight case studies are invisible to anonymous reads, so the
  case-study rebuild is sequenced behind this epic (decided 2026-08-08).

Migrating the ids lets the token be **removed entirely**, not merely rotated.

## Phase 0 audit — complete 2026-08-08

Read-only. All figures below came from a fresh fetch of all 789 documents (779 published,
10 drafts), walked recursively for every `_ref`.

### Blast radius: 222 documents, not 110

| Set | Count |
|---|---|
| IDs that must change (`wp.*` targets) | 110 published + 1 draft |
| Documents rewritten because they **reference** a `wp.*` id | **166** |
| Both at once (id changes **and** contains refs) | 55 |
| **Distinct documents touched** | **222** |

The prior scope was drawn by *which documents are hidden*. The migration also rewrites
*everything pointing at them*, and those are different sets. `glossaryTerm` is the clearest
case: the table above marks it `0 hidden ✅`, so it read as out of scope. It is the largest
single reference source in the dataset — **61 documents carrying 88 refs** into `wp.*`
targets.

Reference-source types the prior scope never named: `glossaryTerm` (61 docs), `page` (8),
`project` (6), `ctaButtonDoc` (4), `navigation` (3), `series` (1), `archivePage` (1).

### The reference graph: 39 field paths, 612 edges

The prior scope named four paths under an "including". The complete enumeration:

**Top level — 27 paths, 567 edges**

| Source type | Field path | Refs | Target types |
|---|---|---|---|
| `node` | `tags[]` | 149 | tag ×149 |
| `node` | `categories[]` | 76 | category ×76 |
| `glossaryTerm` | `categories[]` | 67 | category ×67 |
| `node` | `authors[]` | 55 | person ×55 |
| `article` | `tags[]` | 52 | tag ×52 |
| `article` | `categories[]` | 26 | category ×26 |
| `caseStudy` | `tags[]` | 22 | tag ×22 |
| `article` | `authors[]` | 17 | person ×17 |
| `glossaryTerm` | `relatedTags[]` | 13 | tag ×13 |
| `article` | `related[]` | 13 | article ×5, node ×5, caseStudy ×3 |
| `caseStudy` | `categories[]` | 13 | category ×13 |
| `project` | `categories[]` | 9 | category ×9 |
| `caseStudy` | `authors[]` | 8 | person ×8 |
| `node` | `related[]` | 7 | node ×6, article ×1 |
| `project` | `tags[]` | 6 | tag ×6 |
| `caseStudy` | `related[]` | 6 | caseStudy ×5, article ×1 |
| `page` | `authors[]` | 5 | person ×5 |
| `ctaButtonDoc` | `link.internalRef` | 4 | page ×2, article ×1, node ×1 |
| `navigation` | `items[](navItem).internalPage` | 4 | page ×4 |
| `glossaryTerm` | `relatedContent[](articleRef)` | 3 | article ×3 |
| `glossaryTerm` | `relatedContent[](caseStudyRef)` | 3 | caseStudy ×3 |
| `page` | `categories[]` | 2 | category ×2 |
| `glossaryTerm` | `relatedContent[](nodeRef)` | 2 | node ×2 |
| `person` | `expertise[]` | 2 | category ×2 |
| `navigation` | `items[](navItem).children[](childNavItem).internalPage` | 1 | page ×1 |
| `series` | `parts[]` | 1 | page ×1 |
| `archivePage` | `featuredItems[]` | 1 | article ×1 |

**Nested in Portable Text and section arrays — 12 paths, 45 edges.** These are what a
top-level field sweep silently misses.

| Source type | Field path | Refs | Target types |
|---|---|---|---|
| `page` | `sections[](cardBuilderSection).cards[](cardBuilderItem).tags[]` | 28 | tag ×28 |
| `node` | `sections[](textSection).content[](block).markDefs[](link).internalRef` | 5 | node ×4, page ×1 |
| `page` | `sections[](textSection).content[](block).markDefs[](link).internalRef` | 3 | page ×2, article ×1 |
| `article` | `sections[](textSection).content[](block).markDefs[](link).internalRef` | 1 | article ×1 |
| `page` | `sections[](cardBuilderSection).cards[](cardBuilderItem).citations[](cardCitation).link.internalRef` | 1 | article ×1 |
| `page` | `sections[](ctaSection).buttons[](ctaButton).link.internalRef` | 1 | page ×1 |
| `caseStudy` | `sections[](textSection).content[](block).markDefs[](link).internalRef` | 1 | caseStudy ×1 |
| `article` | `sections[](imageGallery).images[](galleryImage).link.internalRef` | 1 | node ×1 |
| `article` | `sections[](heroSection).ctas[](ctaButton).link.internalRef` | 1 | page ×1 |
| `article` | `sections[](textSection).content[](richImage).link.internalRef` | 1 | caseStudy ×1 |
| `page` | `sections[](accordionSection).items[](accordionItem).content[](block).markDefs[](link).internalRef` | 1 | page ×1 |
| `page` | `sections[](heroSection).ctas[](ctaButton).link.internalRef` | 1 | node ×1 |

**The migration must walk documents recursively for `_ref`, not enumerate known fields.**
This table is a verification artifact, not the script's input: a field list goes stale the
first time an editor adds a link inside a new section type.

### Three findings that reduce risk

1. **Zero dangling references today.** The graph is currently whole, so any dangling
   reference after the migration is unambiguously the migration's fault. Clean before/after.
2. **28 `wp.*` documents are referenced by nothing** — node ×23, caseStudy ×3, article ×1,
   tag ×1. They migrate with no reference updates at all.
3. **Only one draft carries a `wp.*` id:** `drafts.wp.node.1654`, "AI Illustration Review:
   Ethics, Accessibility & IP Guardrails". It has **no published twin** — a node that has
   never been live. Its `publishedAt: 2026-01-01` is import metadata, not a publish event.
   Six other drafts contain `wp.*` references and need rewriting but keep their own ids.

### ID scheme — decided 2026-08-08 by Bex

**`<type>-<slug.current>`, slug capped at 50 characters, truncated at a hyphen boundary.**
The `wp` prefix is dropped entirely.

```
wp.person.bhead      →  person-bex
wp.tag.12            →  tag-ux
wp.category.290      →  category-design-systems
wp.caseStudy.166     →  caseStudy-beauty-retail-from-monolith-to-microservice
wp.caseStudy.388     →  caseStudy-prestige-beauty-pilot-headless-cms-enterprise
drafts.wp.node.1654  →  drafts.node-ai-illustration-review-ethics-accessibility-ip
```

Verified against all 789 existing ids: **0 internal duplicates, 0 collisions, 0 needing
WP-number disambiguation, 0 documents without a slug.** 13 slugs exceeded the cap and were
cut at a hyphen. Lengths run 6 to 59, mean 29.

Rejected alternative: `<type>-<wp-number>` (`caseStudy-388`). It drops the `wp.` prefix in
letter while preserving the WordPress origin as a permanent number on 109 of 110 documents.

This scheme also matches what the dataset already does. **215 existing non-`wp` documents
are on exactly this convention** (`category-ai`, `glossaryTerm-context-engineering`,
`tool-storybook`), so migrated documents become indistinguishable from natively created ones.

**Disambiguation rule, unused today but required in the script:** if two documents of the
same type produce the same capped base, append the source WP number. A draft always takes
`drafts.` plus its published twin's final id, computed from the published core id so the
pair can never diverge.

## Phase 1 — tooling, dry run green 2026-08-08

- `scripts/migrate/dedot-id-map.js` — pure mapping and reference-walk functions, no I/O
- `scripts/migrate/dedot-ids.js` — the migration; dry-run by default, `--execute` to apply
- `pnpm migrate:dedot-ids`

Dry-run output, nothing written:

```
Pre-flight
  ✅ documents in scope                   111 (expected 111)
  ✅ reference edges to remap             612 (expected 612)
  ✅ id collisions with existing docs     0
  ✅ duplicate generated ids              0
  ✅ in-scope docs with no slug           0
  ✅ dangling refs before migration       0
Plan
  111 renamed · 111 patched in place · 222 touched · 612 references rewritten
  by type: node ×38, article ×7, caseStudy ×7, category ×10, page ×4, person ×1, tag ×44
  transaction payload: 1.59 MB
Simulated post-state
  ✅ dangling references                      0
  ✅ documents still carrying a wp.* id       0
  ✅ references still pointing at a wp.* id   0
  ✅ total documents                          789
```

The script simulates the whole post-migration dataset in memory and asserts it is
referentially whole **before** queuing a single mutation. Baselines (111 documents, 612
edges) are asserted, not assumed: a filter that silently drops documents fails the run
instead of migrating a subset.

**Payload is 1.59 MB across 333 mutations**, comfortably inside Sanity's transaction limits,
so Phase 2 stays a single atomic commit with no chunking and therefore no partial-state risk.

### Two corrections the dry run forced

**The Phase 0 "both" figure was 54, not 55.** The audit's `wp_ids` set was built with
`startswith('wp.')`, which excludes `drafts.wp.node.1654`. The same one-document blind spot
that produced a 110-entry map where 111 was correct, in a second place. The blast-radius
table above is corrected. `166` and `222` were unaffected.

**"Zero dangling references today" was scoped to `wp.*` targets only.** Checked across all
references, the pre-flight found one on its first run:
`drafts.55a784b8-…` (`tasks.task`) → `a7a11a1c-…` at `target.document`. It is a **weak
cross-dataset reference** — `_weak: true`, `_type: "crossDatasetReference"` — belonging to
Sanity's own Tasks feature. Weak references are designed to survive a missing target, and a
cross-dataset reference resolves against a different dataset, so checking either against
local ids is wrong by construction. The check was fixed to skip both; the baseline was not
adjusted to make a red run go green.

## Objective

Every `wp.*` id (and `drafts.wp.*`) is migrated to the scheme above, every inbound reference
rewritten in the same atomic operation, the viewer token removed from the web client,
`web-frontend-read` deleted, and `validate:taxonomy` passes with no token.

## Scope

- [x] **Phase 0 audit** — 110 migratable ids classified, 39-path reference graph enumerated,
      222-document blast radius measured, ID scheme decided. **Complete 2026-08-08** — layer: docs
- [ ] **ID mapping module**, generating the 111-entry map from live data rather than a
      checked-in table, with the disambiguation rule — layer: tooling
- [ ] **Migration script:** recursive `_ref` walk, rewriting documents **and** every
      reference in one transaction — layer: tooling
- [ ] **Pre-flight assertions in the script itself** (see Risks) — layer: tooling
- [ ] **Dry-run mode** writing a full before/after report with no mutation — layer: tooling
- [ ] **Execute the migration** against `production` — layer: Sanity data
- [ ] **Remove `token` from the web client**; confirm anonymous rendering of authors, tags,
      categories — layer: frontend
- [ ] **Delete `web-frontend-read`**; drop `CI_SANITY_READ_TOKEN` from `ci.yml` — layer: infra
- [ ] **Re-run `validate:taxonomy` with no token** — the acceptance test — layer: tooling
- [ ] **Update SUG-187's stale `_id` references** (`wp.caseStudy.388` and siblings) — layer: docs

Ten Scope items and numbered phases, so this decomposes into user-story sub-issues per
`docs/conventions/user-story-conventions.md`. **The Linear workspace is at its free issue
limit as of 2026-08-07**, so sub-issues are recorded here until that clears. Their absence
from Linear is not a scope reduction.

## Phases

| Phase | Ships | Gate |
|---|---|---|
| **0** | Audit, classification, ID scheme | ✅ complete 2026-08-08 |
| **1** | ID mapping module + migration script + dry-run report | Dry run reviewed by Bex before Phase 2 |
| **2** | Migration executed against `production` | **Internally atomic.** Backup taken first; all-or-nothing |
| **3** | Token removed from web client, `web-frontend-read` deleted, CI secret dropped | Anonymous render confirmed in-browser before the token is deleted |
| **4** | `validate:taxonomy` green with no token; SUG-187 unblocked | The acceptance test |

Phase 2 is one transaction. Phases 1, 3 and 4 merge independently.

## Acceptance Criteria

- [ ] `pnpm validate:taxonomy` passes with no `CI_SANITY_READ_TOKEN` set
- [ ] **Anonymous and authenticated counts match across the 7 content types**
      (`person`, `tag`, `category`, `node`, `article`, `caseStudy`, `page`). The 24
      Sanity-owned documents stay hidden and are excluded from this check — "0 hidden"
      overall is unachievable by design, which the prior version of this criterion missed
- [ ] Zero documents remain whose `_id` matches `wp.*`
- [ ] **Dangling reference count is 0 after migration**, measured the same way as the
      pre-migration baseline of 0
- [ ] Reference edge count after migration is **612**, matching the pre-migration count
- [ ] `web-frontend-read` deleted from Sanity; no `VITE_SANITY_*` token in the web bundle
- [ ] Migration report lists every rewritten id and every reference updated, with
      before/after counts
- [ ] `drafts.node-ai-illustration-review-ethics-accessibility-ip` exists and is still a
      draft. **Nothing in this epic publishes anything**

## Non-Goals

- **Widening the dataset ACL from `*` to `**`.** This would make anonymous reads work
  instantly and **expose every unpublished draft to the open internet** — drafts are stored
  as `drafts.<id>`, also dotted. The convenient fix is the dangerous one, and stays dangerous
  regardless of whether today's drafts are sensitive.
- **A non-atomic, incremental id migration.** Partial state is worse than the current state
  (real dangling refs, not merely hidden docs). This is why Phase 2 is internally atomic even
  though the epic merges phase by phase.
- **Touching the 24 Sanity-owned dotted documents.** They are platform-internal and correctly
  hidden.
- **Publishing anything.** The one `wp.*` draft is migrated as a draft and stays one.
- **Rewriting case study content.** That is SUG-187, sequenced behind this epic.

## Risks

- **A field-list-driven script misses the 12 nested paths.** 45 edges live inside Portable
  Text `markDefs` and section arrays. Mitigation: recursive `_ref` walk, and assert the
  script finds exactly 612 edges before it writes anything.
- **A filter that misses `drafts.wp.*`.** Reproduced during this audit: a
  `startswith('wp.')` filter silently dropped `drafts.wp.node.1654`, producing a 110-entry
  map where 111 was correct. Mitigation: the script asserts its own input count and fails
  closed on a mismatch, rather than trusting the filter.
- **Sanity has no rename.** A document id change is create-new plus delete-old. If the delete
  half fails, both copies exist and references point at one of them. Mitigation: a single
  transaction, and a dataset export taken immediately before Phase 2.
- **`_createdAt` resets on all 111 renamed documents.** Sanity has no rename, so a renamed
  document is a new document and the server sets a fresh `_createdAt`. **`publishedAt` is a
  user field and survives untouched**, so every displayed date is unaffected; nothing in
  `apps/web` was found reading `_createdAt`. Accepted rather than mitigated. Confirm at
  Phase 2 that no Studio view or query orders by it.
- **A full-document replace clobbers concurrent edits.** Phase 2 writes whole documents, so
  anything edited in Studio between the dry run and the commit is overwritten. Mitigation:
  take the export immediately before, and do not run Phase 2 while anyone is in Studio.
- **Stale `_id` references in other docs.** SUG-187's epic doc names `wp.caseStudy.388`
  throughout; anything keyed to an old id is wrong after Phase 2. Mitigation: a Scope item,
  and re-query by slug rather than by id.

## Related

- **Linear:** [SUG-260](https://linear.app/sugartown/issue/SUG-260)
- **Blocks:** [SUG-187](SUG-187-case-study-content-refresh.md) — case study rebuild, sequenced
  behind this epic 2026-08-08
- **Origin:** found 2026-07-28 during SUG-255, when `validate:taxonomy` ran in CI for the
  first time in its existence and reported anonymous-only dangling references
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer
  Checklist and Files to Modify at Phase 1 activation
