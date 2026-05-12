# SUG-112 · Sidebar Nav Primitives — `useScrollspy` + `SidebarNav` + ESLint cleanup

**Linear Issue:** [SUG-112](https://linear.app/sugartown/issue/SUG-112)
**Status:** Backlog
**Merge strategy:** merge-as-you-go (each phase merges independently)

---

## Background

SUG-111 shipped PlatformSidebar and PageSidebar as two independent sidebar nav surfaces. Both implement scrollspy, hash-seeded active state, and anchor-link behaviour from scratch. The duplication was necessary to ship Phase II on schedule, but it leaves the codebase with two diverging nav primitives.

Post-mortem on SUG-111 surfaced this as the highest-priority system improvement: nav interaction behaviour (active state, scrollspy, hash anchor, sticky, mobile collapse, click side-effects) must be defined once and shared — not re-derived per surface. The gap is not a missing spec; PageSidebar already has a working reference implementation. The gap is the absence of a shared abstraction that surfaces can call rather than reimplement.

Additionally, `apps/web/src/` has accumulated 43 ESLint errors (including a live `react-hooks/rules-of-hooks` violation at line 462 in a non-platform file) that prevent the pre-commit ESLint gate from being activated. This is a code-quality liability that will compound with each new feature.

---

## Scope

### Phase 1 — `useScrollspy` shared hook

Extract scrollspy logic from `PageSidebar.jsx` into `apps/web/src/lib/useScrollspy.js`.

**Hook API:**
```js
const activeId = useScrollspy(ids, { rootMargin: '0px 0px -60% 0px' })
```

- `ids`: string[] of element IDs to observe
- Returns the ID of the topmost visible section
- Uses `IntersectionObserver` with configurable `rootMargin`
- No side effects — pure observer, returns active ID only

**Callers to update after extraction:**
- `PlatformSidebar.jsx` — replace inline scrollspy with `useScrollspy(navItems.map(i => i.id))`
- `PageSidebar.jsx` — replace inline scrollspy with `useScrollspy(headings.map(h => h.id))`

Acceptance: both sidebars pass visual QA (active link highlights on scroll, hash seeded correctly on load) and the hook file has a Storybook story or test demonstrating the behaviour.

### Phase 2 — `SidebarNav` web adapter component

Create `apps/web/src/design-system/components/SidebarNav/` as a web adapter that encapsulates:
- Anchor link rendering with active state styling
- `useScrollspy` integration
- Mobile collapse behaviour (matching the existing PageSidebar collapse pattern)
- Sticky positioning when sidebar context requires it

**Component API (proposed):**
```jsx
<SidebarNav
  items={[{ id: 'section-id', label: 'Section Label', href: '#section-id' }]}
  collapsible={true}
  defaultOpen={true}
  label="On this page"
/>
```

This replaces the duplicated nav list rendering in both PlatformSidebar and PageSidebar. Each sidebar shell keeps its own layout wrapper (the outer container, sticky positioning, mobile toggle button) but delegates link list rendering to `SidebarNav`.

Acceptance: PlatformSidebar and PageSidebar both consume `SidebarNav`. The Storybook story covers: default open, collapsed state, active link, long label truncation, and empty state.

### Phase 3 — ESLint baseline cleanup

Resolve all 43 existing ESLint errors so the pre-commit ESLint gate can be activated.

**Known errors (from SUG-111 session):**
- 1× `react-hooks/rules-of-hooks` violation (non-platform file, line ~462 in a component)
- Remaining errors: `react-hooks/exhaustive-deps` warnings and `no-unused-vars`

**Steps:**
1. Run `pnpm --filter web lint` and export the full error list
2. Fix hooks violations first (blocking — these cause runtime bugs)
3. Fix unused-vars (usually safe deletes)
4. Fix exhaustive-deps (review each — some require useCallback/useMemo, some are genuine bugs)
5. Add ESLint to `.husky/pre-commit`: `pnpm --filter web lint || exit 1`
6. Confirm pre-commit passes on a clean working tree

Acceptance: `pnpm --filter web lint` exits 0. Pre-commit hook includes lint gate. Zero new lint errors introduced.

---

## Phases

| Phase | Deliverable | Blocks |
|-------|-------------|--------|
| 1 | `lib/useScrollspy.js` extracted, both sidebars updated | Phase 2 |
| 2 | `SidebarNav` web adapter, both sidebars consuming it | Phase 3 |
| 3 | ESLint baseline clean, pre-commit gate activated | — |

---

## Out of scope

- Right-rail PageSidebar layout changes (content is already correct)
- New nav surfaces (platform mobile nav, footer nav) — those are separate epics
- Any Sanity schema changes
