---
**Epic:** SUG-111 — Platform IA Phase II — nested multi-section architecture for /platform/
**Linear Issue:** [SUG-111](https://linear.app/sugartown/issue/SUG-111/platform-ia-phase-ii-nested-multi-section-architecture-for-platform)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-111 — Platform IA Phase II — nested multi-section architecture for /platform/

Enable a 2-level nested IA under /platform/ with section hubs (Governance, Monorepo, CMS, Design System), a PlatformLayout sidebar nav wrapper, and leaf pages for roadmap, content model docs, architecture diagrams, and the component registry.

## Background

The current `/platform` is a single Sanity section-builder page, with only `/platform/schema` as a hard-coded route alongside it. The IA brief (locked 2026-02-26) deferred sub-pages until content volume justified them — that threshold has now been reached: SUG-110 (Linear roadmap), SUG-103 (component registry), the Schema ERD page, and planned CMS/DS architecture docs all need homes in a coherent namespace.

Without a structured `/platform/` IA, each new platform page gets a one-off route with no navigation context. The result is a collection of orphaned pages with no way to browse between them.

The IA brief anticipated `/platform/roadmap`, `/platform/architecture`, `/platform/design-system`, and `/platform/release-notes`. This epic formalises that structure, adds a sidebar nav, and establishes the section hub pattern so future platform pages have a home without requiring another routing epic.

## Objective

After this epic, `/platform/` is a navigable 2-level product docs section. Four section hubs exist at `/platform/{section}` — each hub is a static React layout page with editorial prose and links to its leaf pages. Leaf pages with variable content are Sanity-backed. A `PlatformLayout` wrapper component renders a persistent sidebar nav on all `/platform/*` routes. The existing `/platform/schema` route migrates to its new home in the Monorepo section. SUG-103 (component registry) and SUG-110 (roadmap) can ship their leaf pages without any further routing work.

Layers touched: `apps/web/src/App.jsx` (route restructure), `apps/web/src/pages/` (new pages), `apps/web/src/components/` (PlatformLayout + PlatformSidebar), `apps/web/src/lib/routes.js` (new route constants). No Sanity schema changes for section hubs. Optional Sanity schema for leaf pages with editorial content.

## Scope

**Phase 1 — Layout shell + routing**

- [ ] `PlatformLayout` wrapper component: persistent sidebar nav on all `/platform/*` routes; renders `<Outlet />` for child routes — layer: frontend
- [ ] `PlatformSidebar` nav component: 4 sections (Governance, Monorepo, CMS, Design System), each with their leaf page links; active-state highlighting via `useMatch`; collapses to top nav on mobile — layer: frontend
- [ ] Register nested route structure in `App.jsx` under a `<Route path="/platform" element={<PlatformLayout />}>` parent; migrate existing `/platform/schema` into Monorepo section — layer: frontend
- [ ] Add `/platform/*` route constants to `routes.js` — layer: frontend
- [ ] Phase 0 mock required: sidebar nav layout, section hub page anatomy, mobile treatment — layer: design

**Phase 2 — Section hubs (static React pages)**

Static pages — no Sanity doc required. Each hub renders: section heading, one-paragraph description, and a card grid linking to leaf pages.

- [ ] `/platform/governance` — Governance hub: links to Roadmap (`/platform/roadmap`), CHANGELOG (external `TRUST_LINKS.changelog`) — layer: frontend
- [ ] `/platform/monorepo` — Monorepo hub: links to Architecture docs, Diagrams (migrated from `/platform/schema`) — layer: frontend
- [ ] `/platform/cms` — CMS hub: links to Content Model doc (phase-gated, see Phase 3), Diagrams — layer: frontend
- [ ] `/platform/design-system` — DS hub: links to Component Registry (SUG-103), Storybook (external `TRUST_LINKS.storybook`), Diagrams — layer: frontend
- [ ] Update `/platform` top-level page to serve as the master hub with links to all four sections — layer: content (Sanity patch)

**Phase 3 — Leaf pages (Sanity-backed where variable)**

- [ ] `/platform/roadmap` — wire SUG-110 `linearRoadmap` data (unblocked once SUG-110 Phase 2 ships) — layer: frontend
- [ ] `/platform/diagrams` — shared diagrams hub; migrate `SchemaErdPage` content here; route `/platform/schema` redirects to new path — layer: frontend
- [ ] `/platform/design-system/registry` — component registry page (SUG-103 Phase 1 implementation) — layer: frontend
- [ ] `/platform/cms/content-model` — dynamic content model doc; **Phase 0 gate applies** (needs design alignment before any JSX); placeholder stub page acceptable at this phase — layer: frontend/schema (TBD at Phase 0)

## Phases

**Phase 1 — Layout shell + routing:** `PlatformLayout`, `PlatformSidebar`, `App.jsx` route restructure, `routes.js` constants. Merge independently once sidebar renders correctly on existing `/platform` and `/platform/schema` routes.

**Phase 2 — Section hubs:** Four static hub pages + `/platform` top-level update. Merge independently.

**Phase 3 — Leaf pages:** Roadmap, diagrams migration, component registry, content model stub. Each leaf page can merge independently within this phase.

## Acceptance criteria

- [ ] All `/platform/*` routes render inside `PlatformLayout` with the sidebar nav visible
- [ ] Sidebar nav links are active-highlighted on the current route
- [ ] Sidebar collapses to a horizontal nav strip (or hamburger) below 768px — no overflow or hidden content on mobile
- [ ] `/platform/schema` redirects to the new diagrams path with no 404
- [ ] `validateNavItem()` passes for all new `/platform/*` routes
- [ ] Phase 0 mock approved before any `PlatformLayout` or hub page JSX is written
- [ ] SUG-103 and SUG-110 can register their leaf pages with no App.jsx changes (route slots exist)
- [ ] No hardcoded path strings outside `routes.js`

## Technical notes

- **Activation audit:** Read `apps/web/src/App.jsx` lines around the existing `/platform/schema` route before touching routing — confirm no other `/platform/*` routes exist that would conflict.
- **Nested routes in react-router-dom v7:** Section hubs use `<Route path="/platform" element={<PlatformLayout />}>` with `<Route index element={<PlatformPage />} />` for the root and child `<Route path="governance" ...>` etc. `PlatformLayout` must render `<Outlet />` for the child to mount.
- **Static vs Sanity-backed hubs:** Section hubs (Governance, Monorepo, CMS, DS) are static React pages — no Sanity `page` doc required. They are not section-builder pages. Leaf pages with variable content (content model docs, architecture prose) may be Sanity-backed if editorial flexibility is needed — decide at Phase 3 activation.
- **`/platform/schema` migration:** `SchemaErdPage` currently registered at `/platform/schema`. New path: `/platform/diagrams` (or `/platform/monorepo/diagrams` — decide at Phase 0). Add a `<Route path="schema" element={<Navigate to="/platform/diagrams" replace />} />` to preserve existing links.
- **Sidebar nav active state:** Use `useMatch` or `NavLink`'s built-in `isActive` from react-router-dom. Sidebar sections should be open/highlighted when any child route is active, not just the exact section path.
- **PlatformSidebar mobile:** At `< 768px`, the sidebar should convert to a compact nav — either a horizontal scroll strip or a `<details>`-based collapsed section. The Pattern to follow is the existing `PageSidebar` component (sticky rail on desktop, inline below content on mobile).
- **SUG-103 dependency:** Phase 3 `/platform/design-system/registry` unblocks SUG-103 Phase 1 implementation. SUG-103 can stay in backlog until Phase 3 routes exist.
- **SUG-110 dependency:** Phase 3 `/platform/roadmap` unblocks SUG-110 Phase 2. SUG-110 Phase 1 (data collector) is independent and can ship anytime.
- **Content model leaf page:** `/platform/cms/content-model` is explicitly phase-gated behind a design alignment. A placeholder stub (heading + "coming soon" Callout) is acceptable at Phase 3. The dynamic ERD-style content model rendering is a separate sub-epic.
- **Model recommendation:** Phase 1 (layout/routing) → `sonnet`. Phase 2 (static hubs) → `sonnet`. Phase 3 (leaf pages) → `sonnet`.

## Non-Goals

- No 3-level URL nesting (e.g. `/platform/cms/docs/content-model`). Two levels max.
- No new Sanity schema for section hub pages — they are static React pages.
- No mega-nav or dropdown nav changes to the site header. Platform sub-navigation lives in the `PlatformSidebar` only.
- No Changelog page (`/platform/changelog`) — CHANGELOG.md is the authoritative artifact; `TRUST_LINKS.changelog` links directly to GitHub. A Sanity proxy adds sync debt with no benefit.
- No Storybook embed or iframe — `TRUST_LINKS.storybook` links to `pinkmoon.sugartown.io`. A proxy page is overhead.
- No content authoring for leaf page prose in this epic — section hubs ship with placeholder/minimal copy. Full editorial pass is a content epic.

## Execution order

The full platform build has 7 epics with ordering constraints. Sequence:

```
SUG-111 Phase 1 — PlatformLayout + routing shell
  ↓ (unblocks all sub-routes)
SUG-111 Phase 2 — Section hubs (Governance, Monorepo, CMS, DS)
  ↓
SUG-20 Phase 1 — Schema ERD DS alignment
  (must ship before diagrams leaf page — cleans the component before migration)
  ↓
SUG-111 Phase 3 — Leaf pages:
  /platform/roadmap         → unblocks SUG-110 Phase 2 (Linear roadmap UI)
  /platform/diagrams        → migrates SUG-20 SchemaERD (post-alignment)
  /platform/design-system/registry → unblocks SUG-103 Phase 1 (component registry)
  /platform/cms/content-model    → placeholder stub; full dynamic version is a follow-on epic
  ↓
SUG-110 Phase 2 — Roadmap page component (wire linearRoadmap data)
SUG-103 Phase 1 — Component registry page
SUG-20 Phase 2 (optional) — schemaErdSection Sanity Hybrid (retire hardcoded route)
```

**Hard dependencies:**
- SUG-111 Phase 1 must merge before any Phase 2 or Phase 3 work starts — it creates the layout shell all sub-routes render inside
- SUG-20 Phase 1 must merge before SUG-111 Phase 3 ships the `/platform/diagrams` route — migrating a component with DS violations is a known-bad pattern
- SUG-110 Phase 1 (data collector) is independent and can ship any time — no routing dependency

**SUG-20 note:** Phase 0 mock completed 2026-05-11 at `docs/drafts/SUG-20-schema-erd-ds-mock.html`. Gaps are documented. Phase 1 is unblocked.

## Related

- **Linear:** [SUG-111](https://linear.app/sugartown/issue/SUG-111/platform-ia-phase-ii-nested-multi-section-architecture-for-platform)
- **IA brief:** `docs/briefs/ia-brief.md` — locked 2026-02-26; anticipated `/platform/*` sub-pages
- **SUG-20:** `docs/backlog/SUG-20-schema-erd-sanity-hybrid.md` — DS alignment + section builder; Phase 0 mock complete
- **SUG-103:** `docs/backlog/SUG-103-component-registry-platform-docs.md` — unblocked by Phase 3 route
- **SUG-110:** `docs/backlog/SUG-110-dynamically-generated-roadmap-from-linear.md` — unblocked by Phase 3 route
- **Route registry:** `apps/web/src/lib/routes.js`
- **Existing platform page:** `apps/web/src/pages/PlatformPage.jsx` (or equivalent)
- **PageSidebar reference:** `apps/web/src/components/PageSidebar.jsx` — mobile collapse pattern to follow
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
