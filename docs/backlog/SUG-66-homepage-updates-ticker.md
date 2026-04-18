**Linear Issue:** [SUG-66](https://linear.app/sugartown/issue/SUG-66/homepage-updates-ticker-skinny-banner-of-recent-platform-content)

## EPIC NAME: Homepage updates ticker — skinny banner of recent platform + content updates

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — search for existing skinny-banner/marquee/announcement components across all 5 layers. The current `AnnouncementBar` (top stripe: "Welcome to my new site on Sanity.io!") is the closest existing surface; confirm whether it can be extended to support a multi-item rotating/marquee mode, or whether this needs a sibling component. List existing changelog/recent-updates utilities in `lib/`.
- [ ] **Use case coverage** — list interaction patterns: passive marquee (no user input), pause-on-hover, click-through to detail page, click-through to `/changelog` aggregator. Confirm reduced-motion fallback (no scroll animation if `prefers-reduced-motion: reduce`).
- [ ] **Layout contract** — positive statement of the banner contract: full-width strip, height ≤ 36px, sits between top announcement stripe and sticky header (or between sticky header and hero — pick one in Phase 0). Mobile collapse behaviour declared.
- [ ] **All prop value enumerations** — N/A unless a Studio enum is added (e.g. `release.kind`)
- [ ] **Correct audit file paths** — verify `apps/web/src/components/AnnouncementBar.*` (or equivalent) exists at the stated path before referencing it
- [ ] **Dark / theme modifier treatment** — explicit statement: ticker uses `--st-color-bg-canvas` / `--st-color-text-default` token pair, no per-theme override needed beyond what the announcement stripe already does
- [ ] **Studio schema changes scoped** — depends on data-source decision (see Open Questions). If a `release` doc type is added, that schema work is **in scope** for this epic with `feat(studio):` prefix. If we parse `CHANGELOG.md` instead, schema is N/A.
- [ ] **Web adapter sync scoped** — N/A unless we promote the ticker to a DS primitive (recommend: keep app-level, single consumer)
- [ ] **Composition overlap audit** — N/A (no schema sub-objects added)
- [ ] **Atomic Reuse Gate** — confirm: (1) no existing ticker/marquee component, (2) single consumer (homepage only — justified as a HP-specific surface, not promoted to DS), (3) API composable via `items[]` prop so future routes could mount it if needed.

---

## Context

**Existing surfaces this epic touches:**
- `apps/web/src/components/AnnouncementBar.jsx` (or equivalent — the lime-on-pink top stripe component)
- `apps/web/src/pages/HomePage.jsx` — the only consumer
- `apps/web/src/lib/queries.js` — new query for recent content updates
- `CHANGELOG.md` (root) — version + release entries from `/mini-release` workflow
- `apps/web/src/lib/version.js` (or wherever footer version strip reads from) — already has build-time version + date injection (SUG-65)

**Recent epics on the same surface:**
- SUG-65 (Footer Reset) — added the version strip + colophon block; this epic surfaces equivalent "site is alive" signal above the fold
- SUG-58 (AI Search Optimization) — JSON-LD utility may want to emit a `DataFeed` for `/changelog` if we add that route

**Doc types in scope for "content updates" feed:** `article`, `node`, `caseStudy` (the three published-content types). `page` and `archivePage` excluded — page edits aren't editorial events.

---

## Objective

Add a homepage-only skinny ticker banner that surfaces the most recent updates from two streams (platform releases + content publishes/updates), making the site's "actively shipped" claim live above the fold rather than buried in the footer version strip. After this epic, a visitor lands on `/` and within the first viewport sees: announcement stripe → updates ticker → header → hero, with the ticker showing the last 3–5 dated events linked to their detail pages or to a `/changelog` aggregator.

The data layer is the open question (see Phase 0): either parse `CHANGELOG.md` for releases or add a `release` Sanity doc type. The query layer adds a recent-content query (last N updated articles/nodes/case studies). The render layer is one new HP-only component.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ No      | Page edits are not editorial events; surfacing them as updates is noise |
| `article`   | ☑ Yes     | Source for "content updates" feed (last published/updated) |
| `caseStudy` | ☑ Yes     | Source for "content updates" feed |
| `node`      | ☑ Yes     | Source for "content updates" feed |
| `archivePage` | ☐ No    | Archive page edits are configuration, not editorial |

If a `release` doc type is added (Phase 0 decision), it joins the audit as a 6th in-scope type and feeds the platform-changelog stream.

---

## Phase 0 — Data source + display decision (mockup gate)

> No code in `apps/web/src/` or `apps/studio/schemas/` may be written until this phase is signed off.

**Phase 0 deliverables:**

1. **Data source decision (changelog stream):**
   - **Option A:** Parse root `CHANGELOG.md` at build time (already produced by `/mini-release`). Pros: zero new schema, single source of truth. Cons: build-time only — new releases require a deploy to surface; parsing brittle if format drifts.
   - **Option B:** Add a `release` Sanity doc type (`version`, `date`, `summary`, `linearIssueId`, `kind: enum`). Pros: editor can publish a release announcement without a deploy; queryable like any other doc. Cons: duplicates information that already lives in CHANGELOG.md and the version manifest.
   - **Option C:** Hybrid — auto-generate `release` documents from CHANGELOG.md via the mini-release workflow (script writes the Sanity doc as part of the release process). Best of both, most build cost.

2. **Display decision:**
   - **Marquee** (continuous horizontal scroll, pause on hover) — most "ticker-y", most attention-grabbing, accessibility cost
   - **Rotating slot** (one item visible, fades to next every N seconds) — calmer, still active, easier on reduced-motion
   - **Static last-N list** (3 inline items, no animation) — simplest, most accessible, least "ticker"

3. **Mock at** `docs/drafts/SUG-66-updates-ticker-mock.html` — must include desktop and mobile, light and dark mode, with realistic sample items from each stream (release + content).

4. **Item shape:**
   - `[date] [kind label] [linked title]` (e.g. `2026-04-16 · RELEASE · v0.21.3 — Footer reset`)
   - Or `[kind icon] [title] [meta]`
   - Pick in Phase 0 with mock.

5. **Mobile behaviour:** collapse to single rotating slot, scroll horizontally, or hide entirely below 768px.

**Phase 0 sign-off** is a human gate. Bex reviews the mock and confirms before any implementation work begins.

---

## Scope

- [ ] **Phase 0:** data source decision + HTML mock (no code yet)
- [ ] Studio schema changes — only if Option B or C is chosen (`release` doc type)
- [ ] Schema registration (`index.ts`) — if release doc added
- [ ] GROQ query for recent content updates (last N articles/nodes/case studies by `_updatedAt`)
- [ ] GROQ query for recent releases — if release doc added; otherwise CHANGELOG parser utility in `lib/`
- [ ] CHANGELOG parser utility — `apps/web/src/lib/changelog.js` (if Option A or C)
- [ ] Combined feed builder — merges both streams into a single sorted `items[]`
- [ ] `UpdatesTicker` component (HP-only) — `apps/web/src/components/UpdatesTicker.jsx`
- [ ] CSS module — `UpdatesTicker.module.css`
- [ ] Reduced-motion fallback (no scroll/fade animation if `prefers-reduced-motion: reduce`)
- [ ] HomePage wiring — mount component above hero
- [ ] Storybook story covering: marquee/rotating/static state per Phase 0 decision, empty state (no items), single-item state, mobile breakpoint, reduced-motion state
- [ ] Migration script — N/A unless Option C requires backfilling release docs from existing CHANGELOG entries

---

## Query Layer Checklist

- [ ] **NEW** `recentContentUpdatesQuery` — `*[_type in ["article", "caseStudy", "node"] && defined(slug.current) && status == "active"] | order(_updatedAt desc) [0...5] { _type, _updatedAt, title, "slug": slug.current }`
- [ ] **NEW** `recentReleasesQuery` — only if Option B/C: `*[_type == "release"] | order(date desc) [0...5] { version, date, summary, kind, linearIssueId }`
- [ ] `pageBySlugQuery` — N/A (homepage doesn't render `sections[]` for the ticker; ticker is a fixed HP component)
- [ ] `articleBySlugQuery` — N/A
- [ ] `caseStudyBySlugQuery` — N/A
- [ ] `nodeBySlugQuery` — N/A
- [ ] Archive queries — N/A

---

## Schema Enum Audit

Only relevant if Option B/C adds `release` doc type with a `kind` field.

| Field name | Schema file | `value` → Display title (copy from `options.list`) |
|-----------|-------------|-----------------------------------------------------|
| `kind` (release) | `release.ts` (TBD Phase 0) | e.g. `patch → Patch`, `minor → Minor`, `major → Major`, `epic → Epic Ship` |

---

## Metadata Field Inventory

N/A — this epic does not render MetadataCard or modify any existing metadata surface. Ticker items render inline in their own component.

---

## Themed Colour Variant Audit

Token files: `apps/web/src/design-system/styles/tokens.css` + `packages/design-system/src/styles/tokens.css`

| Surface / component | Dark | Light | Pink Moon | Token(s) to set |
|---------------------|------|-------|-----------|-----------------|
| Ticker background | `var(--st-color-bg-surface)` | `var(--st-color-bg-surface)` | inherits | (uses existing surface token — no new token needed) |
| Ticker border-bottom | `var(--st-color-border-default)` | `var(--st-color-border-default)` | inherits | (existing token) |
| Ticker text | `var(--st-color-text-secondary)` | `var(--st-color-text-secondary)` | inherits | (existing token) |
| Ticker date/meta | `var(--st-color-text-muted)` | `var(--st-color-text-muted)` | inherits | (existing token, mono font) |
| Ticker link hover | `var(--st-color-text-brand)` | `var(--st-color-text-brand)` | inherits | (existing token) |
| Kind label (RELEASE etc.) | `var(--st-color-lime)` | `var(--st-color-brand-primary)` | inherits | (matches eyebrow pattern) |

No new tokens — ticker reuses the announcement stripe + eyebrow palette to feel like a sibling surface.

---

## Non-Goals

- **Not a page section type.** This is a homepage-only chrome element. Do not register it in `PageSections.jsx`. If a future epic needs a recent-updates surface elsewhere, lift the data layer (`buildUpdatesFeed`) and re-mount the component on that route — but do not retrofit it as a section type.
- **No `/changelog` aggregator route in this epic.** That's a follow-on. Ticker click-through targets either the item's detail page or, for releases, the GitHub commit URL. A dedicated `/changelog` page is deferred.
- **No editor-managed ticker copy.** The ticker is data-driven; we don't add a Sanity field for "editor-pinned ticker message." If editorial messaging is needed, that's the existing `AnnouncementBar` (top stripe), not this component.
- **No real-time updates.** Ticker is built at request time (or build time for the changelog stream depending on Option A/B/C). No websocket, no polling.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; the changelog parser (if Option A/C) reads `CHANGELOG.md` from repo root via Vite's `?raw` import or a build-time loader
- If Option C: mini-release workflow gains a step that writes a `release` doc to Sanity — extend `docs/mini-release-prompt.md`

**Schema (Studio)**
- Only if Option B/C: new `release` doc type at `apps/studio/schemas/documents/release.ts`
  - Fields (explicit types): `version: string`, `date: datetime`, `summary: text`, `kind: string` (enum: patch/minor/major/epic), `linearIssueId: string`, `commitSha: string`
  - Registered in `apps/studio/schemas/index.ts`
  - No `sections[]` — release docs are flat metadata records

**Query (GROQ)**
- New queries in `apps/web/src/lib/queries.js`
- Neither query touches `sections[]` — both project flat fields
- The combined feed builder lives in `apps/web/src/lib/updatesFeed.js` (new file): merges, sorts by date desc, dedupes, slices to N items

**Render (Frontend)**
- New component `apps/web/src/components/UpdatesTicker.jsx` — HP-only consumer
- Wired in `apps/web/src/pages/HomePage.jsx`, mounted between announcement stripe and hero (or between header and hero — Phase 0 decision)
- `prefers-reduced-motion: reduce` disables animation and falls back to static last-3 list
- Mobile: per Phase 0 — hide, collapse to single rotating, or horizontal scroll
- Click-through: internal items use `Link` from react-router-dom (SPA nav); release commits open new tab

**Design System → Web Adapter Sync**
- N/A — `UpdatesTicker` is app-level, not a DS primitive (single consumer, justified per Atomic Reuse Gate)

---

## Migration Script Constraints

Only if Option C: backfill `release` docs from existing `CHANGELOG.md` entries.

**Target doc count:** TBD after parsing `CHANGELOG.md` — count distinct release entries. As of 2026-04-18 there are roughly ~10 mini-release entries.

**Skip condition:** skip if `release` doc with same `version` already exists (idempotent re-run).

**Idempotency:** re-running produces 0 patches because the version-uniqueness check prevents duplicates.

If Option A or B is chosen: N/A.

---

## Files to Modify

**Studio** (only if Option B/C)
- `apps/studio/schemas/documents/release.ts` — CREATE
- `apps/studio/schemas/index.ts` — register

**Frontend**
- `apps/web/src/lib/queries.js` — `recentContentUpdatesQuery` (always); `recentReleasesQuery` (Option B/C)
- `apps/web/src/lib/changelog.js` — CREATE (Option A/C) — CHANGELOG.md parser
- `apps/web/src/lib/updatesFeed.js` — CREATE — merges streams, sorts, slices
- `apps/web/src/components/UpdatesTicker.jsx` — CREATE
- `apps/web/src/components/UpdatesTicker.module.css` — CREATE
- `apps/web/src/pages/HomePage.jsx` — mount ticker above hero

**Storybook**
- `apps/storybook/src/stories/UpdatesTicker.stories.jsx` — CREATE

**Scripts** (only if Option C)
- `scripts/migrate/backfill-releases-from-changelog.js` — CREATE
- `package.json` — `migrate:releases` script entry

**Docs**
- `docs/mini-release-prompt.md` — extend if Option C (add Sanity write step)

---

## Deliverables

1. **Phase 0 mock** — `docs/drafts/SUG-66-updates-ticker-mock.html` exists, covers desktop/mobile + light/dark + display variant, signed off by Bex
2. **Schema** (if Option B/C) — `release.ts` exists, registered, deployed via `npx sanity schema deploy`
3. **Queries** — `recentContentUpdatesQuery` (and `recentReleasesQuery` if applicable) added to `queries.js` and verified against live Sanity data
4. **Feed builder** — `updatesFeed.js` exports `buildUpdatesFeed({ contentItems, releaseItems, limit })` returning a sorted, deduped, sliced array
5. **Component** — `UpdatesTicker` renders on `/` between announcement stripe and hero, displays N items per Phase 0 decision, respects reduced-motion
6. **Storybook story** — covers all states listed in Scope
7. **Migration** (if Option C) — dry-run reports expected count, `--execute` runs cleanly, idempotent

---

## Acceptance Criteria

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors (if schema added)
- [ ] Studio hot-reloads without errors; new `release` doc type appears in Studio nav (if added)
- [ ] HomePage `/` renders ticker above the hero with at least 3 items from real Sanity + changelog data — not blank, not error
- [ ] No other route renders the ticker (verified by grep — `UpdatesTicker` imported in `HomePage.jsx` only)
- [ ] Reduced-motion: with `prefers-reduced-motion: reduce` set in browser/devtools, ticker shows static list with no animation
- [ ] Click-through: clicking a content item navigates SPA-style to the detail page; clicking a release item opens commit/changelog in new tab
- [ ] Mobile: ticker behaves per Phase 0 decision (hide / collapse / scroll) — verified at 375px viewport
- [ ] **Visual QA**: ticker height ≤ 36px on desktop; spacing matches mock; typography uses `--st-font-family-mono` for date/meta and `--st-font-family-ui` for titles
- [ ] **Mock fidelity**: agent produces mock-to-implementation comparison table in Visual QA Gate; Bex approves
- [ ] **Empty state**: if both streams return zero items, ticker renders nothing (not an empty bar)
- [ ] **Token compliance**: zero hardcoded colour or font values in `UpdatesTicker.module.css`

---

## Visual QA Gate

### Evidence the agent must prepare:

1. **Storybook story exists** for `UpdatesTicker`
   - Default (3 items, mixed streams)
   - Single item
   - Empty (renders nothing)
   - Reduced-motion
   - Mobile breakpoint
   - Light + dark mode

2. **Mock-to-implementation comparison table** — list every visual element from the Phase 0 mock and mark Match/Drift/Missing

3. **Token compliance audit** — `grep` `UpdatesTicker.module.css` for hex colours, px font sizes, font stacks. Report count.

4. **Cross-surface spot check** — confirm `UpdatesTicker` is mounted on `/` only. Grep for the import. Confirm no regression on adjacent components (announcement stripe, hero, header).

### Human gate:
Agent presents evidence. Bex reviews on `/` with real data + Storybook. Approves or returns with corrections. Agent does not proceed to close-out until "Visual QA approved."

---

## Risks / Edge Cases

**Schema risks** (if Option B/C)
- [ ] `release` field names — does `version` collide with anything? (No — no other doc type has a `version` field)
- [ ] No references out — release is a flat metadata record

**Query risks**
- [ ] `recentContentUpdatesQuery` orders by `_updatedAt` — confirm this gives the right "freshness" signal vs `_createdAt` or a custom `publishedAt`. Drafts must be excluded (`status == "active"` filter).
- [ ] If a doc is updated for a typo fix, it surfaces as "recent" — acceptable noise or a problem? Decide in Phase 0.

**Render risks**
- [ ] What renders if both streams are empty? **Component returns `null`** — no empty bar, no skeleton.
- [ ] Marquee animation + sticky header overlap: ensure z-index layering is correct so the ticker doesn't disappear behind the frosted header on scroll
- [ ] `prefers-reduced-motion` must disable animation — verify via DevTools toggle, not just the media query existing in CSS
- [ ] Long titles truncate with ellipsis — confirm in mobile and constrained widths
- [ ] **Hydration**: if the changelog parser runs at build time (Option A), confirm the parsed data is available in the bundle without a network round-trip

**Mini-release coupling** (Option C only)
- [ ] If the mini-release script gains a Sanity write step, what happens if the Sanity write fails mid-release? Document the rollback / retry path in `docs/mini-release-prompt.md`.

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-66-homepage-updates-ticker.md` → `docs/shipped/SUG-66-homepage-updates-ticker.md`. Commit: `docs: ship SUG-66 homepage updates ticker`
2. Confirm clean tree (`git status`)
3. Run `/mini-release SUG-66 Homepage updates ticker`
4. Update Linear: SUG-66 → Done
5. Start next epic
