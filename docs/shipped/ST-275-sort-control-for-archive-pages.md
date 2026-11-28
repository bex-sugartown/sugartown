---
**Epic:** ST-275 — Sort control for archive pages
**Issue:** [#275](https://github.com/bex-sugartown/sugartown/issues/275)
**Status:** Done
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at the end of each
**Visual:** yes
**Vspec:** `docs/drafts/ST-275-sort-control-for-archive-pages.vspec.html`
---

# ST-275 — Sort control for archive pages

Archive pages sort by a fixed `publishedAt` order; readers get a sort control, and a stale `publishedAt` stops hiding content.

## Background

Every archive query hard-codes `order(publishedAt desc)` (`ARCHIVE_QUERIES` in `apps/web/src/pages/ArchivePage.jsx`, lines 100 to 153; corrected 2026-11-28, the `queries.js` lines this doc first cited are other queries), and the merged `/library` view re-sorts client-side on the same field (`apps/web/src/pages/ArchivePage.jsx:198`). The node "AI Illustration Review" (#116) was published on 2026-11-28 with `publishedAt` 2026-01-01 (its original draft date), so it sorts to the bottom of `/library?contentType=node` and was not found. The node schema's `initialValue` is the creation time (`apps/studio/schemas/documents/node.ts:211`), so the cause is a rewritten old document keeping its first date, not a missing default. Affected surfaces: `/library`, `/nodes`, `/articles`, `/case-studies`, `/releases`.

## Objective

After this epic a reader can change an archive's sort order (newest published, recently updated, title A to Z), and the archives no longer depend on `publishedAt` alone. Layers touched: GROQ query (sort inputs and an updated date), React render (the control and client-side ordering), Sanity schema only if Phase 2 decides a field is needed, content (re-dating the #116 node, through the Content Write Gate). Excluded: taxonomy archives, glossary, search, filter model changes.

## Metadata plan

Not applicable, no content piece.

## Scope

- [x] Vspec for the sort control: placement, options, default, active state, mobile, URL behaviour — layer: design
- [x] Sort options defined and mapped to fields (`publishedAt`, `_updatedAt`, `title`) per archive type, with the default staying newest published — layer: query
- [x] Archive queries return every field the sort options need (`_updatedAt` at minimum) — layer: query
- [x] Sort control component, reusing an existing DS primitive if one fits (Component choice audit first) — layer: frontend
- [x] Sort state in the URL query string, alongside existing filter params, so a sorted view is shareable and survives reload — layer: frontend
- [x] Control wired into every archive route that lists documents (read `App.jsx`; see Technical notes) — layer: frontend
- [x] Storybook story for the control, one multi-case story — layer: Storybook
- [x] Decide what `publishedAt` means for a rewritten document, then apply it: either a Studio field description and validation hint, or an `updatedAt`-style field with a schema deploy — layer: schema (decided 2026-11-28: description only, see Phase 2 decision)
- [~] Re-date the #116 node's `publishedAt` once Bex picks the date, proposed as a before/after table first — layer: content (dropped 2026-11-28 by Bex: the node is unpublished and on hold, and its local draft already shows 27 Nov 2026)

## Phases

| Phase | Ships | Gate |
|---|---|---|
| 1 | Vspec, sort options, query inputs, control, URL state, all archive routes, Storybook story | Vspec sign-off before any code (Phase 0) |
| 2 | `publishedAt` semantics decision and its schema or Studio change, plus the #116 re-date | Decision on field approach before any schema edit |

## Acceptance Criteria

- [ ] On `/library?contentType=node`, choosing "Recently updated" puts the #116 node above nodes with later `publishedAt` and an earlier `_updatedAt`
- [ ] Each sort option reorders the list in both directions where the option offers one, and the choice appears in the URL query string
- [ ] Reloading or sharing a sorted URL shows the same order
- [ ] With no sort param, every archive renders in the same order as before this epic (newest published first)
- [ ] The control appears on every archive route listed in the Activation audit, and on none of the routes that do not list documents
- [ ] Control passes `pnpm validate:tokens`, the axe gate in both themes, and `pnpm test:smoke`
- [ ] Phase 2: a written decision on `publishedAt` semantics is in this doc, and the #116 node's date is changed only after an approved proposal (Content Write Gate)
- [ ] If Phase 2 adds a schema field: schema deployed and an MCP write to it succeeds

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Phase 2 decision (2026-11-28)

`publishedAt` means the date a rewrite went live. When an old piece is rewritten and published again, the author sets it to the new date. Applied as a Studio field description on `article.ts`, `caseStudy.ts` and `node.ts` (`releaseNote.releasedAt` is a ship date and is unchanged); no new field. Schema deployed with `npx sanity schema deploy` (1 of 1). The Updated sort (`_updatedAt`) is the safety net when the date is not reset. Rejected: a separate editorial "last revised" field (schema change on four types plus a backfill).

Found while reading, not acted on: `archivePage.ts` already has a `sortBy` field ("Sort Order (coming soon)", Deferred tab, not wired in the web app) and `node.ts` already has an `updatedAt` field. A per-archive default sort could read `sortBy`, which belongs with #37.

<!-- Chromatic: pending -->
Chromatic deferred to the ship step by Bex, 2026-11-28. Phase 1 touched CSS, component JSX and three stories.

## Technical notes

- **Content Write Gate:** fires for the #116 re-date. Re-fetch the live document before patching and show a before/after table. Publish is a separate instruction (Human-Publishes Rule), and the date change on an already-published node still needs the patch published.
- **Schema changes:** Phase 2 only, and only if the decision adds a field. If so, name the field and run `npx sanity schema deploy` from `apps/studio/` before close-out.
- **Activation audits:** (1) read `apps/web/src/pages/ArchivePage.jsx` and list how each archive is fed (per-type query vs the `/library` client-side merge at line 198); (2) read `apps/web/src/lib/filterModel.js` and `docs/conventions` filter docs to decide whether sort belongs in the filter model or beside it; (3) run `pnpm validate:filters` after any change; (4) read `apps/web/src/pages/ArchivePage.jsx` for how `archivePage` Sanity docs (display and advanced tabs, #37, #210) configure layout, and check whether a default sort belongs in that config.
- **Upstream dependencies:** none blocking. Read the backlog for in-flight epics touching `ArchivePage.jsx` or `queries.js` at activation and state why each is or is not blocking. #37 (archive deferred fields) is adjacent: it wires Display and Advanced tab configs on the same page type.
- **Phase 0 inputs to settle in one batch at sign-off:** the vspec, the CSS class naming table, the Component choice audit for the control, and copy for the option labels.
- **Model & Mode:** see below.

## Model & Mode [REQUIRED]

`/model sonnet`: a DS control, query inputs and URL state across known routes, with no architecture decision. Phase 2's field decision is a short written choice, not a design problem.

## Non-Goals

- Sorting on taxonomy index pages, the glossary and search, which are not document archives with a shared query.
- Reworking the filter model or filter sidebar.
- Bulk re-dating of any other document. Only the #116 node is in scope for content.
- Pagination or infinite-scroll changes.

## Related

- **GitHub:** [#275](https://github.com/bex-sugartown/sugartown/issues/275)
- **Triggered by:** [#116](https://github.com/bex-sugartown/sugartown/issues/116)
- **Adjacent:** [#37](https://github.com/bex-sugartown/sugartown/issues/37), [#210](https://github.com/bex-sugartown/sugartown/issues/210)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time

## Close-out review

Collaboration: 1h 55m active across 1 day, 2026-11-28 · 12 messages from Bex · measured 2026-11-28 by `pnpm collab:time 275`.

### Acceptance criteria

- [x] On `/library?contentType=node`, "Updated" puts #116 above nodes with a later `publishedAt`: browser check 2026-11-28 with `?sort=updated`, first row is the #116 node (draft preview, since the node is unpublished). The live-site half is a Post-ship check.
- [x] Each option reorders in both directions and the choice is in the URL: clicked Updated (flip), Alphabetical (flip) and Published in the browser, URLs `?sort=updated&order=asc`, `?sort=title`, `?sort=title&order=desc`, then none. `apps/web/src/lib/archiveSort.test.js`, 8 tests.
- [x] Reloading a sorted URL shows the same order: loaded `/library?contentType=node&sort=updated` directly, chip and order matched.
- [x] No sort param renders newest published first, as before: default unit test, and the first two rows matched the pre-change screenshot (`docs/drafts/ST-275-before-live-2026-11-28.webp`).
- [x] The control appears on every archive route and on none of the others: present on `/articles`, `/nodes`, `/case-studies`, `/releases`, `/library`; absent on `/library?view=graph`, `/glossary`, `/tags`.
- [x] `pnpm validate:tokens` (and `--strict-colors`), `pnpm test:smoke` (84 passed) pass. Axe: the committed gate does not scan `/library`; an ad hoc axe pass on `/library` grid and list in both themes found no violations. Gate coverage is #276.
- [x] Phase 2: the decision on `publishedAt` is in this doc (§Phase 2 decision). The #116 re-date was dropped from scope by Bex on 2026-11-28, so no content was changed.
- [x] No schema field added: description text only on three schemas; schema deployed (1 of 1).

### What didn't work

- The vspec said the list column header would reuse `.archiveToolbarKicker`. That class is app-level and a DS `List` cannot import it, so the build needed a new `.columnHeads` class, which went back to Bex for approval.
- The web app reads the design-system package from `dist`. The new props did not show until the package was rebuilt (`pnpm --filter @sugartown/design-system build`); the first browser check showed no arrow and no label.
- Three chips did not fit at 375px. The "Sort by" label now hides below 768px.
- The design-reviewer flagged three hardcoded values in `pages.module.css` as drift. All three predate this epic (checked with `git show 54d98f0e~1`), so they were left alone.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Add `/library` grid and list to the axe gate | implementation | #276 |
| Wire `archivePage.sortBy` ("Sort Order (coming soon)", Deferred tab) as a per-archive default sort | implementation | declined: #37 already lists "sort options" among the unwired Advanced fields |
| Check the three new stories (SegmentedControl, List, Card) in Storybook on default and `dark-pink-moon` | implementation | declined: done in this epic, 2026-11-28. Rendered and axe-scanned all six story and theme pairs (no violations, no page errors); screenshots read for dark |
| Archive toolbar padding, divider margin and kicker size are hardcoded px | implementation | declined: existing values on surfaces this epic did not change |

### Friction line

A vspec line promised no new class for the list column header without checking that the class it named was reachable from the design system.

---

## Post-ship checks

- [ ] Chromatic: run at the ship step, approve the three new stories and the toolbar change (`<!-- Chromatic: pending -->` above): person approves in Chromatic
- [ ] Live sort: on production `/library?contentType=node`, choose Updated and confirm the order changes and the URL carries `?sort=updated`: `curl -s https://sugartown.io/library` cannot show it, so person
- [ ] Case study dates: production `/case-studies` cards show "PUB" dates (they showed none before): person
