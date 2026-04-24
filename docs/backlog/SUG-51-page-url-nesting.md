# SUG-51 — Page URL Nesting

**Linear Issue:** SUG-51

---

## Model & Mode [REQUIRED]

> Use Claude Code's `opusplan` alias for this epic. Opus handles planning
> (Pre-Execution Gate → Files to Modify), Sonnet handles execution
> (code changes, migration runs, acceptance tests). The handoff is automatic
> when you exit plan mode.
>
> **Session setup:**
> 1. `/model opusplan` — set once at session start
> 2. `Shift+Tab` until status bar reads "plan mode"
> 3. Paste this epic as the first prompt
> 4. Review Opus's plan against the gates below; push back until aligned
> 5. Exit plan mode (`Shift+Tab`) — Sonnet takes over for execution
>
> **Override rule:** if Sonnet stalls during execution on something that's
> architectural rather than mechanical (e.g. an unexpected cross-workspace
> type error, a token cascade that isn't resolving), type `/model opus`
> for that single question, then `/model opusplan` to return. Note the
> override in the epic's post-mortem so we learn where Sonnet's ceiling is.
>
> **When to deviate from opusplan:**
> - Pure copy/content epics (no code): use `/model sonnet` — no planning depth needed
> - Pure architecture epics (Schema ERD, SSR strategy, monorepo boundary changes): use `/model opus` — execution benefits from sustained depth too

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — routes.js `getCanonicalPath()` is the URL authority. App.jsx defines route patterns. No new components — extends existing routing.
- [ ] **Use case coverage** — pages with `parent` reference resolve to `/parent-slug/child-slug/`. Pages without parent unchanged (`/:slug`).
- [ ] **Layout contract** — N/A (routing, not layout)
- [ ] **All prop value enumerations** — N/A
- [ ] **Correct audit file paths** — verified
- [ ] **Dark / theme modifier treatment** — N/A
- [ ] **Studio schema changes scoped** — NO. `parent` field already exists on page schema (moved to content tab in SUG-48). This epic wires it into route resolution.
- [ ] **Web adapter sync scoped** — N/A
- [ ] **Composition overlap audit** — Nav `children` hierarchy is independent of page `parent` — nav defines menu structure, `parent` defines URL structure. Both can coexist.
- [ ] **Atomic Reuse Gate** — extends `getCanonicalPath()` in routes.js. No new utilities.

---

## Context

The `parent` reference field on the page schema enables hierarchical page nesting. Navigation already supports item hierarchy via navItem `children`. This epic wires the `parent` field into URL route resolution so nested pages resolve correctly at `/parent-slug/child-slug/`.

Currently all pages resolve at `/:slug` regardless of parent. After this epic, pages with a `parent` reference resolve at `/:parentSlug/:childSlug/`.

## Objective

Wire the `parent` field into route resolution. Update GROQ projection to include parent slug chain. Add route pattern to App.jsx for nested pages. Update `getCanonicalPath()` to build nested paths.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | ☑ Yes | Only doc type with `parent` field |
| `node` | ☐ No | Nodes use `/nodes/:slug`, no nesting |
| `article` | ☐ No | Articles use `/articles/:slug`, no nesting |
| `caseStudy` | ☐ No | Case studies use `/case-studies/:slug`, no nesting |
| `archivePage` | ☐ No | Archive pages are top-level by definition |

---

## Scope

- [ ] GROQ projection — add `parentSlug` to `pageBySlugQuery`
- [ ] routes.js — update `getCanonicalPath()` for page type to support parent prefix
- [ ] App.jsx — add route pattern `/:parentSlug/:childSlug` (or use catch-all with resolution)
- [ ] RootPage.jsx — resolve page by slug, checking both direct and nested paths
- [ ] Breadcrumb consideration — nested pages may want parent → child breadcrumb (note for future)

---

## Query Layer Checklist

- [ ] `pageBySlugQuery` — add `"parentSlug": parent->slug.current` projection
- [ ] Archive queries — N/A (pages don't appear in archive grids)
- [ ] Nav queries — N/A (nav hierarchy is independent of page parent)

---

## Non-Goals

- No schema changes (parent field already exists)
- No nav structure changes (nav hierarchy is separate from URL hierarchy)
- No depth > 2 nesting (only one level: parent/child, not grandparent/parent/child)
- No breadcrumb component (note for future epic)

## AEO Cross-Reference (SUG-58)

**BreadcrumbList JSON-LD should ship with this epic.** Nested URLs create the hierarchy that `schema.org/BreadcrumbList` marks up. If SUG-58 has shipped, use the `generateJsonLd()` utility to emit breadcrumb JSON-LD on nested pages. If not, implement inline and refactor later. The breadcrumb schema includes `itemListElement` with `position`, `name`, and `item` (URL) for parent and child. URL hierarchy without breadcrumb markup is a missed SEO signal.

---

## Technical Constraints

**Route ambiguity:** `/:slug` and `/:parentSlug/:childSlug` can conflict. Resolution strategy: try exact slug match first. If no match, try `parentSlug/childSlug` split. This is the same pattern used by WordPress and most CMS routers.

**Redirect consideration:** If a page has a parent but someone visits `/:childSlug` directly, should it redirect to `/:parentSlug/:childSlug`? Recommend yes — add to `netlify.toml` redirects or handle in-app.

**URL validator:** `validate:urls` needs updating to check nested page paths.

---

## Files to Modify

- `apps/web/src/lib/routes.js` — extend `getCanonicalPath()` for nested pages
- `apps/web/src/lib/queries.js` — add parentSlug to page projection
- `apps/web/src/App.jsx` — add nested page route pattern
- `apps/web/src/pages/RootPage.jsx` — resolve nested page slugs

---

## Acceptance Criteria

- [ ] Page with parent resolves at `/:parentSlug/:childSlug/`
- [ ] Page without parent still resolves at `/:slug` (no regression)
- [ ] `getCanonicalPath()` builds correct nested path for pages with parent
- [ ] Direct visit to `/:childSlug` redirects to `/:parentSlug/:childSlug/` (if parent exists)
- [ ] `pnpm validate:urls` passes with nested page URLs

---

## Risks / Edge Cases

- [ ] Circular parent references (page A → parent B → parent A) — schema filter prevents selecting self, but not transitive loops. Add a GROQ guard or depth limit.
- [ ] Orphaned children — if parent page is unpublished, child page URL breaks. Guard: fall back to `/:childSlug` if parent is not published.
- [ ] Slug collisions — `/:parentSlug` could match a top-level page with that slug. Resolution order matters.

---

*Created 2026-04-08.*
