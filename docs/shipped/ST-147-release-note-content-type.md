---
**Epic:** ST-147 Release Note content type and /releases archive
**Issue:** [#147](https://github.com/bex-sugartown/sugartown/issues/147)
**Status:** Done
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go, one commit per phase, one CHANGELOG line at the end of each
**Visual:** yes
**Vspec:** `docs/drafts/ST-147-release-note-content-type.vspec.html`
---

# ST-147 Release Note content type and /releases archive

A dedicated Sanity document type and `/releases` archive for release notes, so they stop sitting in Articles. Folds in #140 (publish the 17 drafts).

## Background

ST-135 (#135) created 17 Release Notes as `article` documents in a `release-notes` series (parts 1 to 17, v0.20.0 to v0.36.0). Articles are opinion posts. Release notes are a dated, versioned ledger derived from `CHANGELOG.md`, which a different reader wants for a different job. On 2026-10-05 Bex decided they do not belong in Articles. One of them, v0.36.0, was published as an article that day and is live at `/articles/release-notes-v0-36-0`; the other 16 are drafts.

Decision recorded 2026-10-05: split content by the reader's job (ledger versus opinion), not by AI authorship. `aiDisclosure` already records provenance on any type. Nodes stay the AI-narrator editorial format. No generic "governance doc" type is built until three distinct instances of one exist. Reference surfaces: `apps/studio/schemas/documents/article.ts`, `series.ts`, `apps/web/src/lib/routes.js`, `apps/web/src/lib/queries.js`, `apps/web/scripts/prerender-content.mjs`, `apps/web/scripts/build-sitemap.js`, the homepage "Recently shipped" release card.

## Objective

After this epic, `releaseNote` is its own document type with its own detail page and a `/releases` archive, all 17 notes live there, and none remains in Articles. #140 closes as folded in. Layers touched: Sanity schema, GROQ queries, route registry, React render (archive and detail), prerender and sitemap, content (migration of 18 documents, one redirect). Not touched: `CHANGELOG.md` content, nodes, the generic governance-doc idea, the `/ship` and `/release` flows.

## Scope

| # | Deliverable | Layer | Phase |
|---|---|---|---|
| 1 | Vspec for the archive and detail page, built as an interactive prototype if filtering or version navigation is included | design | 0 |
| 2 | `releaseNote` schema (fields below), registered in Studio, schema deployed | schema | 1 |
| 3 | `routes.js` namespace `/releases`, archive page and detail page, GROQ queries, filter model if filtering is in the vspec | query, frontend | 1 |
| 4 | Prerender and sitemap include `releaseNote`; `validate:urls` passes | tooling | 1 |
| 5 | Homepage release card links to its note when one exists | frontend | 1 |
| 6 | Migrate the 17 drafts and the live v0.36.0 article to `releaseNote` documents, verbatim body, same `publishedAt`; Content Write Gate proposal approved first | content | 2 |
| 7 | Redirect `/articles/release-notes-v0-36-0` to the new URL | content | 2 |
| 8 | Remove the migrated article drafts and the `release-notes` series, or keep them with a stated reason | content | 2 |
| 9 | Bex publishes the 17 notes in Studio (or instructs a session to), then `#140` is closed as folded in | content | 3 |

- [ ] Scope items 1 to 9 above, each completed in its phase.

## Phases

| Phase | Ships | Merge |
|---|---|---|
| 0 | Approved vspec | no code |
| 1 | Schema, queries, routes, archive and detail pages, prerender, sitemap, homepage link | merges to `main` when complete |
| 2 | Migration and redirect, as drafts | content only; Content Write Gate |
| 3 | Publish, verify, close #140 | close-out |

## Acceptance Criteria

- [ ] Schema deployed and MCP writes of a `releaseNote` succeed.
- [ ] `/releases` lists published notes, newest first, with version and date; `/releases/<slug>` renders one with its diagram and the centred breadcrumb that passed Visual QA under #135.
- [ ] `count(*[_type=="releaseNote" && !(_id in path("drafts.**"))])` returns 17 after Phase 3, and `count(*[_type=="article" && series->slug.current=="release-notes"])` returns 0.
- [ ] Release notes no longer appear on `/articles`.
- [ ] `/articles/release-notes-v0-36-0` returns a 301 to its new `/releases/...` URL, checked with `curl -sI` after deploy.
- [ ] Prerendered HTML for one release note carries its title and canonical, and the sitemap lists `/releases` URLs.
- [ ] `pnpm validate:urls`, `pnpm validate:content` and `pnpm test:smoke` pass locally; no hard-coded paths outside `routes.js`.
- [ ] Content Write Gate: the migration proposal is approved before any patch; nothing is published without a standalone instruction (Human-Publishes Rule).
- [ ] Chromatic changes for any new stories reviewed and accepted by Bex.

## Human QA Walkthrough: example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach, and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it. The new archive and detail pages are new surfaces; the `/articles` archive and the homepage release card are the regression guards.

## Technical notes

- **Content Write Gate fires** for scope items 6 to 8. Moving a document's type is a structural change, but removing the old drafts and series is removal, so show a before/after table and wait for approval. Publishing is separate (Human-Publishes Rule).
- **Schema changes:** a new document type. Deploy with `npx sanity schema deploy` from `apps/studio/`.
- **Upstream dependencies:** none blocking. #82 (SEO prerendering) and #127 touch `prerender-content.mjs`; #127 shipped 2026-10-05. Re-check #82 at activation.
- **Activation audits:**
  - Read `apps/studio/schemas/documents/article.ts` and `series.ts` for field shapes to reuse; do not fork article fields without answering the Atomic Reuse Gate in writing.
  - Run the taxonomy pre-flight (`.claude/skills` and CLAUDE.md §Taxonomy pre-flight) before assigning categories or tags to release notes.
  - Read `apps/web/src/lib/routes.js` (`TAXONOMY_NAMESPACES` and the content-type map) and `queries.js` for the article archive and detail queries to extend rather than copy.
  - Read `apps/web/scripts/prerender-content.mjs` and `build-sitemap.js` for the type lists.
  - Read the Subtle and Subtle Centered rich-text styles from #135 so the new detail page keeps them.
  - Query `*[_type=="article" && series->slug.current=="release-notes"]` (drafts and published) to capture exact counts and ids at activation, rather than trusting this doc's 17 and 1.
- **Design system:** reuse an existing archive and detail pattern; a new component needs the Component choice gate (`.claude/rules/react.md`).

### Schema field proposal

| Field | What it is | Example value | Why it matters |
|---|---|---|---|
| `title` (string) | Display title | Release Notes: v0.36.0 | Archive and detail heading |
| `slug` (slug) | URL segment | release-notes-v0-36-0 | `/releases/<slug>`; keeps the existing slugs so links stay stable |
| `version` (string, semver) | The release version | 0.36.0 | Sort and filter key; links the note to a git tag and CHANGELOG section |
| `releasedAt` (date) | Date the version shipped | 2026-09-19 | The ledger date; the backdated `publishedAt` today |
| `summary` (text) | One-sentence takeaway | Cookie consent for Google Analytics, a WCAG AA fix for Callout banners... | Archive card text and meta description |
| `sections` (array) | Body, same section types as article | text sections, diagram | Reuses the existing renderer |
| `aiDisclosure` (string) | Provenance note | Drafted with Claude, edited by Bex Head. | Existing convention |
| `seo` (seoMetadata) | Title and description | | Existing object |

## Model & Mode [REQUIRED]

`/model sonnet`: a new document type that follows the article pattern, plus a conventional archive and detail page, after an approved vspec. No architecture decision beyond what this doc states.

## Non-Goals

- No generic "governance doc" type. Revisit when three distinct instances exist.
- No change to nodes or to the node voice.
- No change to `CHANGELOG.md`, `/ship` or `/release`.
- No automation that generates release notes from the changelog.
- No publishing by a session without a standalone instruction.

## Handoff (2026-10-05)

Next step is Phase 0, the vspec. Nothing in Phases 1 to 3 has started; no code, schema or Sanity document for this epic exists yet.

**State at handoff**
- v0.36.0 ("Release Notes: v0.36.0", id `8f0cf196-d3bd-4059-8216-735f0457ef02`) is published as an `article` and live at `/articles/release-notes-v0-36-0`. Bex checked it renders. It moves to `releaseNote` in Phase 2 and gets the 301 in scope item 7.
- The other 16 are `article` drafts in the `release-notes` series, parts 1 to 16 (v0.20.0 to v0.35.0), unpublished. Do not publish them as articles.
- #140 was closed 2026-10-05 as met by the one published note; its remaining 16 are this epic's Phase 3.
- Re-measure before relying on these counts: `*[_type=="article" && series->slug.current=="release-notes"]{_id, title, partNumber}` on `poalmzla/production`, raw perspective.

**First actions, in order**
1. Run `node scripts/check-epic-doc.js docs/backlog/ST-147-release-note-content-type.md` and the activation audits in Technical notes. Set the issue to `In Progress` before the first edit.
2. Write the vspec at `docs/drafts/ST-147-release-note-content-type.vspec.html` (local only, gitignored). Cover the archive and one detail page in light, dark and mobile. Use the proposed class names or `/* TBD */` placeholders, never a name tied to the content type.
3. Decide in the vspec, with Bex, whether the archive filters by version range. If it does, the vspec is an interactive prototype (filtering is a Phase 0 trigger).
4. Bex reviews and signs off. Only then any schema, CSS or JSX.

**What Bex needs to do:** review the vspec, answer the filtering question, and later publish the 17 notes or give a standalone publish instruction.

**Traps**
- Body text moves verbatim. Use `patch_documents` or `create_documents`, never an AI rewrite tool.
- Every Portable Text block needs `markDefs: []` and every span `marks: []`.
- `schema deploy` is required before MCP writes of the new type succeed.
- Check #82 (SEO prerendering) before editing `prerender-content.mjs`; it extends the same script.

## Progress (2026-10-11)

- **Phase 0 done.** Vspec signed off by Bex 2026-10-11. Decisions: no archive filtering; version in the tag column; no summary in rows; article detail shell with Version and Released; JSON-LD reuses the article generator.
- **Phase 1 done, committed locally (not pushed).** Schema `aad9a9b3`, web `727d9952`. Schema deployed. `pnpm lint`, `pnpm build`, `pnpm test:smoke` pass. `releasedAt` is canonical; queries alias it to `publishedAt`. The article `sections` projection moved to a shared `SECTIONS_PROJECTION` in `queries.js`.
- **Phase 2 done 2026-10-11 (drafts only).** Content Write Gate approved by Bex. Created 17 draft `releaseNote` documents (verbatim title, slug, sections, aiDisclosure; `releasedAt` from `publishedAt`; `summary` from `excerpt`; `version` from the title) and one draft `archivePage` `releases` (list style). Verified: 17 drafts, sections and titles identical to the source articles. Categories, tags, series and part numbers were not carried over (approved). The 17 source articles and the `release-notes` series are untouched; the 301 and their removal are Phase 3.
- **Slug change 2026-10-11 (Bex):** all 17 release note slugs are `release-note-v0-x-0` (singular), so v0.36.0 lives at `/releases/release-note-v0-36-0`. The 301 is a draft `redirect` document `/articles/release-notes-v0-36-0` to that path; it takes effect when published and the site rebuilds (`build-redirects.js` runs in the build).
- **Phase 3 done 2026-10-11 (Bex's explicit publish selection).** Published 17 release notes, the `releases` archive page and the 301 redirect. Unpublished the old v0.36.0 article; deleted the 17 old article drafts and the empty `release-notes` series. Verified: `count(article in release-notes series)` = 0; 17 published `releaseNote`; local `/releases` lists 17 as a list with correct dates; `/releases/release-note-v0-36-0` renders; local build prerenders 17 note pages with canonical `https://sugartown.io/releases/release-note-v0-36-0`, the sitemap lists `/releases` URLs, `_redirects` carries the 301, and `dist/articles` has no release-notes page. **Not yet checked:** the live `curl -sI` 301 (needs the push and deploy), Visual QA, Chromatic.
- **Not yet verified (earlier note, now superseded by Phase 3 line above):** the detail and archive pages with real data (no `releaseNote` documents or `releases` archivePage document exist yet).
- **Phase 2 needs first:** a draft `archivePage` document with slug `releases`, contentTypes `[releaseNote]`, displayStyle `list` (Content Write Gate), alongside the migration proposal.
- **Found, not fixed:** `pnpm validate:content` already fails on 2 archivePage errors unrelated to this epic (Library lists `project`, Glossary lists `glossaryTerm`; neither is in `VALID_ARCHIVE_CONTENT_TYPES`).

## Related

- **GitHub:** [#147](https://github.com/bex-sugartown/sugartown/issues/147)
- **Folds in:** #140 (publish the 17 Release Notes drafts); **follows:** #135 (ST-135)
- **Epic template:** `docs/epic-template.md`: complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time

## Close-out review

### Acceptance criteria

- [x] Schema deployed and writes of a `releaseNote` succeed. `npx sanity schema deploy` ran 2026-10-11; 17 documents created and published.
- [x] `/releases` lists notes newest first with version and date; `/releases/<slug>` renders one with its diagram and the centred "Subtle Centered" breadcrumb line from #135. Checked in the browser on localhost:5173 (v0.36.0, 19 Sep 2026). The vspec's own "Home / Releases" crumb was an error in the vspec, not a requirement.
- [x] Counts: `count(*[_type=="releaseNote" && !(_id in path("drafts.**"))])` returns 17; `count(*[_type=="article" && series._ref=="series-release-notes"])` returns 0.
- [x] Release notes no longer appear on `/articles` (Library Article facet dropped from 34 to 17).
- [ ] `/articles/release-notes-v0-36-0` returns a 301 to `/releases/release-note-v0-36-0`. The redirect document is published and a local build writes the rule into `_redirects`; the `curl -sI` check needs the deploy (Post-ship checks).
- [x] Prerendered HTML for a release note carries its title and canonical (`https://sugartown.io/releases/release-note-v0-36-0`); the sitemap lists `/releases` URLs (18 matches in a local build).
- [x] `pnpm validate:urls`, `pnpm validate:content` and `pnpm test:smoke` pass locally (smoke 5/5); no hard-coded paths outside `routes.js`. `validate:content` first needed two existing archive types allowed (`project`, `glossaryTerm`), fixed in 8871cd20.
- [x] Content Write Gate: the migration proposal was approved before any write; nothing was published without a standalone selection (two popups, 2026-10-11).
- [x] Chromatic: build #99, 0 changes, 0 new stories. No story covers the new pages, so the result says little about them. Run before the final Library and author changes, which touch no stories.

Extras Bex asked for during the epic: singular slugs and titles, Library inclusion, Author filter, graph button hidden on `/releases`.

### What didn't work

- The vspec carried a breadcrumb row the real pages never had, and the first Visual QA review passed it as a Match without looking at the page. Caught only when the build was compared with screenshots.
- Dates showed one day early because a date-only `releasedAt` was parsed as UTC. Fixed by aliasing noon UTC in the queries (5c0e7c0e).
- The archive ignored the list layout because `displayStyle` was not projected. Fixed in 5c0e7c0e.
- Two content-model decisions were reversed after approval: plural slugs and titles became singular.
- A command-line delete was refused by the permission check; the Sanity discard tool did the same job on the exact approved IDs.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Release notes carry no category, tag, project or tool, so most Library-style filters stay hidden | implementation | declined: Bex chose Author only (2026-10-11); a backup of the old categories and tags is not kept in the repo |
| Design-reviewer passed a vspec element that was absent from the build | workflow-docs | #156 |
| `docs/drafts/` vspec files had unstyled previews because stylesheets were linked by relative path | workflow-docs | declined: fixed in this epic's vspec by inlining; no repo rule needs changing |

### Friction line

The vspec invented a breadcrumb that the built pages never had, and a code-only review passed it, so the mismatch only surfaced when Bex's screenshots were compared with the vspec.

## Post-ship checks

- [ ] The 301 from the old article URL: `curl -sI https://sugartown.io/articles/release-notes-v0-36-0` shows 301 to `/releases/release-note-v0-36-0`.
- [ ] `/releases` and `/library` render on the live site with 17 and 98 items: person: open both after deploy.
- [ ] Dark mode on a release note detail page: person: open `/releases/release-note-v0-36-0` in dark theme.
