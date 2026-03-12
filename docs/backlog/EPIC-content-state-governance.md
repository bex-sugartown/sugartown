# EPIC TEMPLATE
# Sugartown — Claude Code Epic Prompt

---

## Epic Lifecycle

**Status:** BACKLOG (unscheduled — awaiting prioritization)

**Epic ID:** EPIC-0000
## EPIC NAME: Content State Governance — Draft vs Published Enforcement

**Backlog ref:** Content State Governance — IA brief §5.3 dependency
**Dependency:** None blocking. This epic formalizes and extends an already-functional published-only posture. Can be executed independently.

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — No new interactive elements. This epic modifies infrastructure: Sanity client configuration, GROQ query guards, validation scripts, and content state documentation. Existing components (`NotFoundPage`, `useSanityDoc`, detail pages) are verified and extended, not forked.
- [x] **Use case coverage** — Three consumption modes must be supported: (1) production builds — published-only, no drafts ever; (2) local development default — published-only (matches prod behavior); (3) explicit preview mode — opt-in via env var, includes drafts, clearly labelled. All three are covered by environment-aware client config + optional preview toggle.
- [x] **Layout contract** — N/A. No visual components created or modified. This epic is infrastructure-only (client config, query guards, validation, documentation).
- [x] **All prop value enumerations** — N/A. No schema enum fields added or rendered.
- [x] **Correct audit file paths** — All paths verified via Read tool during pre-flight audit.
- [x] **Dark / theme modifier treatment** — N/A. No visual surface touched.
- [x] **Studio schema changes scoped** — No schema changes. This epic is web + scripts + docs only.
- [x] **Web adapter sync scoped** — N/A. No DS component created or modified.

---

## Context

**Current state (verified by codebase audit):**

The system is already in a better position than the original specification assumed:

- `apps/web/src/lib/sanity.js` (line 17) **already hard-codes** `perspective: 'published'` — drafts cannot leak to the web app in any environment (dev or prod)
- `useCdn: import.meta.env.PROD` — CDN enabled in production only, raw API in dev
- `useSanityDoc` returns `{ data, loading, notFound }` — sets `notFound` when query returns null. All detail pages consistently check `if (notFound || !data) return <NotFoundPage />`
- No `drafts.*` exclusion patterns exist in GROQ queries — **and none are needed**, because the `perspective: 'published'` setting on the client already filters them out before queries execute
- No preview mode exists anywhere in the codebase — there is no way to opt into draft visibility
- Only one `.env` file exists (no `.env.production` / `.env.development` variants)
- `validate-content.js` checks for missing fields, orphaned refs, duplicate slugs, HTML entities — but does **not** detect draft-only documents (docs that exist as drafts but have never been published)
- Read-only viewer token (`VITE_SANITY_TOKEN`) is used for authenticated queries (required for `wp.*` dot-namespace IDs)

**What's missing (this epic's value):**
1. The published-only posture is **implicit** — it works because of a single line in `sanity.js`, not because it's documented, tested, or enforced at build time
2. No preview mode exists for content editors who need to see draft content before publishing
3. Validators don't detect "draft-only" documents — content that was never published but has a slug that would resolve to a route
4. No documentation explains the content state contract or the implications of unpublishing
5. No build-time safety check prevents someone from changing `perspective` to `'previewDrafts'` and shipping it

**Recent relevant epics:**
- EPIC-0162 (Tools Taxonomy) — introduced migration script patterns and `validate-content.js` enhancements
- EPIC-0168 (Link & Button Unification) — established `linkUtils.js` as canonical link resolver
- EPIC-0169 (Citations in Content Body) — latest completed epic

**Files already in play:**
- `apps/web/src/lib/sanity.js` — Sanity client config (perspective: 'published')
- `apps/web/src/lib/queries.js` — all GROQ queries
- `apps/web/src/lib/useSanityDoc.js` — data fetching hooks
- `apps/web/scripts/validate-content.js` — content quality validator
- All detail pages: `ArticlePage.jsx`, `CaseStudyPage.jsx`, `NodePage.jsx`, `RootPage.jsx`
- Archive pages: `ArticlesArchivePage.jsx`, `CaseStudiesArchivePage.jsx`, `KnowledgeGraphArchivePage.jsx`

---

## Objective

After this epic, Sugartown's content state contract is **explicit, documented, enforced, and extensible**:

**Data layer:** No schema changes. The published-only posture is enforced at the client level, not the schema level.

**Query layer:** A centralized content state helper (`src/lib/contentState.js`) provides the preview-aware client factory and any shared guard logic. GROQ queries remain untouched — the `perspective` setting handles filtering before queries execute. This is a key insight from the audit: per-query `!(_id in path("drafts.**"))` filters are unnecessary and would be redundant with the client perspective.

**Render layer:** No component changes. Detail pages already handle `notFound` gracefully. Archive pages already default to empty arrays via `useSanityList`.

**Validation layer:** `validate-content.js` gains a new check (G) that detects draft-only documents — docs with slugs that would resolve to routes but have never been published. This catches the "local works, prod 404s" scenario.

**Build layer:** A build-time assertion ensures `perspective: 'published'` cannot be accidentally changed to `'previewDrafts'` in production builds.

**Documentation:** A content state policy doc explains the draft/published contract, unpublish implications, slug parity, and preview mode usage.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | Yes | Subject to published-only enforcement and draft-only detection |
| `article` | Yes | Same as page |
| `caseStudy` | Yes | Same as page |
| `node` | Yes | Same as page |
| `archivePage` | No | archivePage documents configure archive behavior — they are infrastructure, not content. If an archivePage is unpublished, the archive route still renders (empty state). Draft-only detection is not meaningful for this type. |

---

## Scope

- [x] **Content state helper** — Create `src/lib/contentState.js` with environment-aware client factory and preview mode toggle
- [ ] **Build-time safety check** — Add assertion to Vite build config or pre-build script that fails if `perspective` is not `'published'` in production
- [ ] **Preview mode infrastructure** — Environment variable (`VITE_SANITY_PREVIEW`) that, when explicitly set, switches client to `'previewDrafts'` perspective. Dev-only — blocked in production by build check.
- [ ] **Validator enhancement** — Add check (G) to `validate-content.js`: detect draft-only documents with slugs matching known route patterns
- [ ] **Documentation** — Create `docs/content-state-policy.md` explaining the content state contract
- [ ] **Sanity client refactor** — Extract client creation from `sanity.js` into `contentState.js`, making the perspective decision explicit and testable

**Not in scope:**
- [ ] Migration script — no data to migrate, this is infrastructure-only
- [ ] Web adapter sync — no DS component created or modified
- [ ] GROQ query modifications — queries do not need `drafts.**` filters because `perspective: 'published'` handles this at the client level (confirmed by audit)
- [ ] Page component modifications — all detail pages already handle `notFound` gracefully via `<NotFoundPage />`

---

## Query Layer Checklist

No query changes needed. The `perspective: 'published'` setting on the Sanity client filters drafts before any query executes. Adding per-query `!(_id in path("drafts.**"))` guards would be redundant and violate the "must not duplicate query logic" constraint.

- [ ] `pageBySlugQuery` — not affected (client perspective handles draft filtering)
- [ ] `articleBySlugQuery` — not affected (same reason)
- [ ] `caseStudyBySlugQuery` — not affected (same reason)
- [ ] `nodeBySlugQuery` — not affected (same reason)
- [ ] Archive queries — not affected (same reason)
- [ ] `siteSettingsQuery` — not affected (same reason)

---

## Schema Enum Audit

No enum fields added or rendered by this epic.

---

## Metadata Field Inventory

Not applicable — this epic does not touch MetadataCard or any metadata surface.

---

## Themed Colour Variant Audit

Not applicable — no visual surface touched by this epic.

---

## Non-Goals

- **Full preview UI with live draft overlay** — This epic adds the infrastructure for preview mode (env var toggle, perspective switch), but does not build a visual preview chrome, draft badges, or editing UI. That is a future epic.
- **Scheduled publishing automation** — Out of scope. Sanity's scheduling feature is a Studio plugin concern, not a content state enforcement concern.
- **Content version history UI** — Sanity provides this natively in Studio. No frontend surface needed.
- **Dataset migration between environments** — Single dataset (`production`) with single perspective. Multi-environment dataset strategy is deferred.
- **Workflow approval states** — Future governance concern. This epic establishes the published/draft binary; approval workflows layer on top.
- **Studio document badges or custom actions** — Originally considered in the backlog item description, but deferred. The value of surfacing publication state in Studio is lower now that we know the web app already enforces published-only. A Studio badge epic can be scoped separately if editorial workflow demands it.
- **Per-query draft filters** — Explicitly excluded. The `perspective` setting on the Sanity client is the correct enforcement point. Adding `!(_id in path("drafts.**"))` to individual queries would be redundant, harder to maintain, and violate the centralized query constraint.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`
- No migration script needed — infrastructure-only changes
- Build-time check can be a Vite plugin or a pre-build script in `package.json`

**Schema (Studio)**
- No schema changes in this epic.

**Query (GROQ)**
- No query changes. `perspective: 'published'` on the client is the enforcement point.
- All queries in `apps/web/src/lib/queries.js` — must remain centralized.
- Must not introduce per-query filtering hacks.

**Render (Frontend)**
- No component changes. All detail pages already handle null/notFound gracefully.
- Must preserve canonical route system (`routes.js`).
- Must preserve SPA deep linking (Vite `historyApiFallback: true`).
- Must not break archive aggregation logic (empty arrays, not errors, when no content matches).

**Content State Helper (`contentState.js`)**
- Centralizes the perspective decision: `getContentPerspective()` returns `'published'` by default, `'previewDrafts'` only when `VITE_SANITY_PREVIEW=true` AND not in production build
- Exports a `createSanityClient()` factory that `sanity.js` delegates to
- Preview mode env var: `VITE_SANITY_PREVIEW` (must be `VITE_`-prefixed for Vite to expose it to client code)

**Build-time Safety**
- Production build must fail if `VITE_SANITY_PREVIEW=true` is set — prevents accidental draft leakage in deployed builds
- Implementation: Vite plugin in `vite.config.js` that checks `mode === 'production' && env.VITE_SANITY_PREVIEW === 'true'` and throws
- Alternative: `prebuild` script in `package.json` that checks env before `vite build`

**Design System → Web Adapter Sync**
- Not applicable — no DS component created or modified

---

## Migration Script Constraints

N/A — no migration script in this epic.

---

## Files to Modify

**Frontend — Core**
- `apps/web/src/lib/contentState.js` — CREATE: environment-aware perspective helper, preview mode toggle, build safety assertion
- `apps/web/src/lib/sanity.js` — MODIFY: delegate client creation to `contentState.js`, preserve existing API surface (`client`, `urlFor`)
- `apps/web/vite.config.js` — MODIFY: add production safety plugin that fails build if preview mode is enabled

**Scripts**
- `apps/web/scripts/validate-content.js` — MODIFY: add check (G) for draft-only documents with public slugs

**Docs**
- `docs/content-state-policy.md` — CREATE: content state contract documentation

**Page Components — NO CHANGES**
- `ArticlePage.jsx` — verified: already handles `notFound` via `<NotFoundPage />`
- `CaseStudyPage.jsx` — verified: same pattern
- `NodePage.jsx` — verified: same pattern
- `RootPage.jsx` — verified: same pattern
- Archive pages — verified: `useSanityList` defaults to empty array, no draft leakage possible

---

## Deliverables

1. **Content state helper** — `src/lib/contentState.js` exists, exports `getContentPerspective()` and `createSanityClient()`, respects `VITE_SANITY_PREVIEW` env var
2. **Sanity client refactor** — `sanity.js` delegates to `contentState.js` for client creation, preserves existing `client` and `urlFor` exports (no breaking changes to consumers)
3. **Build-time safety** — `vite.config.js` includes a plugin or `package.json` includes a prebuild script that fails production builds when `VITE_SANITY_PREVIEW=true`
4. **Preview mode** — Setting `VITE_SANITY_PREVIEW=true` in local `.env` switches perspective to `'previewDrafts'`, allowing content editors to see draft content in dev
5. **Validator enhancement** — `validate-content.js` check (G) reports draft-only documents that have slugs matching known route patterns (`/articles/:slug`, `/:slug`, etc.)
6. **Documentation** — `docs/content-state-policy.md` covers: published-only contract, preview mode usage, unpublish implications, slug parity, and the "why" behind each decision

---

## Acceptance Criteria

- [ ] **Published-only default**: `sanity.js` client uses `perspective: 'published'` in all environments by default (verified by reading the client config, not by testing)
- [ ] **Preview mode works**: Setting `VITE_SANITY_PREVIEW=true` in `.env` and starting dev server causes `perspective: 'previewDrafts'` to be used (verified by console log or debug output)
- [ ] **Build safety**: Running `pnpm build` with `VITE_SANITY_PREVIEW=true` set fails with a clear error message (not a silent pass)
- [ ] **Build safety negative**: Running `pnpm build` without the preview env var succeeds normally (no false positives)
- [ ] **No API surface breakage**: All existing imports of `client` and `urlFor` from `sanity.js` continue to work without changes to consumers
- [ ] **Validator draft detection**: `pnpm validate:content` reports draft-only documents (if any exist) with their slugs and the routes they would shadow
- [ ] **Validator clean run**: If no draft-only documents exist, check (G) reports "0 draft-only documents" (not an error, not silence)
- [ ] **404 enforcement**: Unpublished document returns 404 in production build — this is already true (verified by audit) and must remain true after refactor
- [ ] **Archive integrity**: Archive pages do not list draft-only content — this is already true (verified by audit) and must remain true after refactor
- [ ] **No regression**: All existing routes render correctly after the refactor. Smoke-test at minimum: homepage, one article detail, one archive page.
- [ ] **Documentation**: `docs/content-state-policy.md` exists and covers all six topics listed in Deliverable #6

---

## Risks / Edge Cases

**Client refactor risks**
- [ ] Extracting client creation into `contentState.js` must not break the import chain — `sanity.js` must continue to export `client` and `urlFor` at the module level (not lazily). Verify all imports still resolve.
- [ ] `VITE_SANITY_PREVIEW` env var must be `VITE_`-prefixed or Vite will not expose it to client code. Non-prefixed env vars are silently undefined in the browser bundle.

**Build safety risks**
- [ ] The build check must not fire during `vite dev` (dev server) — only during `vite build --mode production`. A false positive in dev would block local development.
- [ ] CI/CD pipelines that set env vars globally must not accidentally set `VITE_SANITY_PREVIEW=true` — document this in the policy doc.

**Preview mode risks**
- [ ] Preview mode in dev may show content that doesn't exist in production — the "local works, prod 404s" problem. Mitigation: preview mode logs a visible console warning on every page load: "PREVIEW MODE ACTIVE — draft content visible. Production will show published content only."
- [ ] Preview mode must not affect the CDN setting — `useCdn` must remain `import.meta.env.PROD` regardless of preview state. Draft content is not cached on CDN.

**Validator risks**
- [ ] Draft-only detection requires querying with `perspective: 'raw'` (to see both drafts and published) and comparing — the validator's own client config must use a different perspective than the web app's. The validator already creates its own client instance, so this is safe.
- [ ] A document can exist as both draft and published with different slugs — the validator should flag this as a "slug drift" warning (draft slug differs from published slug).

**Slug parity risks**
- [ ] When a document is unpublished, its slug becomes unreachable — any internal links pointing to that slug will 404. The validate-content.js orphaned reference check (existing check C) partially covers this, but only for Sanity references, not for hardcoded URL strings in `link` objects.
- [ ] `validate-urls.js` checks route registry against actual routes — but does not check whether the content behind those routes is published. This epic's validator enhancement closes that gap.

**Archive empty state risks**
- [ ] If all documents of a type are unpublished, the archive page renders empty (not an error). This is already handled by `useSanityList` returning `[]`. Verify no archive page treats empty array as an error condition.

---

## Post-Epic Close-Out

1. **Activate the epic file:**
   - Assign the next sequential EPIC number (currently EPIC-0169 is the latest)
   - Move: `docs/backlog/EPIC-content-state-governance.md` → `docs/prompts/EPIC-{NNNN}-content-state-governance.md`
   - Update the **Epic ID** field to match
   - Commit: `docs: activate EPIC-{NNNN} Content State Governance`
2. **Confirm clean tree** — `git status` must show nothing staged or unstaged
3. **Run mini-release** — `/mini-release EPIC-{NNNN} Content State Governance`
4. **Start next epic** — only after mini-release commit is confirmed

---

## Appendix: Audit Findings Summary

The following findings from the pre-flight codebase audit shaped the scope reduction from the original specification:

| Original assumption | Audit finding | Impact on scope |
|---|---|---|
| "Local dev likely resolves drafts" | `perspective: 'published'` already hard-coded in `sanity.js` — drafts never leak | No GROQ query changes needed. No per-query filters. |
| "Need 404 enforcement for draft-only slugs" | All detail pages already return `<NotFoundPage />` when `notFound \|\| !data` | No page component changes needed. |
| "Need to update all page components" | Consistent `notFound` handling across all 4 detail page types | Pages are already correct — refactor is client-level only. |
| "Archive pages may list drafts" | `useSanityList` returns `[]` on empty results; client perspective prevents draft inclusion | No archive page changes needed. |
| "Need `.env.production` lock" | Only one `.env` file exists; Vite build mode is the enforcement point | Build-time Vite plugin is simpler and more reliable than env file splitting. |
| "Need per-query `drafts.**` exclusion" | Client `perspective` setting handles this globally | Redundant filters would violate "must not duplicate query logic" constraint. |

**Net result:** The epic is significantly smaller than originally scoped. The core value is in making the implicit posture explicit (documentation, build safety, preview toggle, validator) — not in fixing broken behavior, because the behavior is already correct.

---

## Philosophical Note

> Right now the system behaves like: "Show me what is contractually public."
> But it does so **accidentally** — by virtue of a single line in `sanity.js`.
>
> After this epic it will behave the same way, but **intentionally** — documented, enforced at build time, detectable by validators, and extensible with preview mode.
>
> The difference between "it happens to work" and "it is designed to work" is the difference between a CMS playground and a production content engine.
