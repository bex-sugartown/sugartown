**Linear Issue:** [SUG-153](https://linear.app/sugartown/issue/SUG-153/mobile-responsive-layout-sidebar-drawer-multi-column-collapse)
## EPIC NAME: Mobile responsive layout — sidebar drawer + multi-column collapse

---

## Model & Mode

`/model opusplan` — interaction design decisions (drawer vs appendix, MobileNav integration) need planning depth. Sonnet handles CSS/JSX execution after Phase 0 sign-off.

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — Sidebar (`mobileAppendix`/`mobileStrip` `<details>` pattern), MobileNav (existing slide-out drawer with focus trap), TwoColumnLayout (stacks at bpMd/bpLg), PageSidebar (article/node/caseStudy), PlatformLayout (platform pages). Decision: extend MobileNav drawer or introduce a separate drawer primitive. Must be resolved in Phase 0.
- [x] **Use case coverage** — Three sidebar contexts: (1) page section TOC on article/node/caseStudy (PageSidebar), (2) platform section nav (PlatformLayout/SidebarNav), (3) any future two-column surface using TwoColumnLayout. All three must work from the same pattern or the decision to diverge must be explicit.
- [ ] **Layout contract** — Phase 0 must produce annotated mock covering: drawer trigger placement, drawer width, overlay behaviour, close affordance, scroll behaviour while drawer open. See Phase 0 annotation requirements in CLAUDE.md.
- [x] **All prop value enumerations** — Sidebar has `mobileStyle` prop: `"appendix"` | `"strip"`. Any new mobile mode must either replace these or be added as a new value.
- [x] **Correct audit file paths** — Verified: `apps/web/src/design-system/components/two-column-layout/TwoColumnLayout.module.css`, `apps/web/src/design-system/components/sidebar/Sidebar.module.css`, `apps/web/src/components/MobileNav.jsx`, `apps/web/src/components/PageSidebar.jsx`, `apps/web/src/components/PlatformLayout/PlatformLayout.jsx`
- [ ] **Sidebar column architecture decision** — Phase 0 must resolve whether `Page` DS primitive grows a `sidebar` slot or TwoColumnLayout remains the desktop column mechanism. `PageSidebar` + `SidebarNav` unification is in scope: both components must be represented in the mock as the content of the sidebar slot, not as independent wiring. See Objective §Expanded scope.
- [ ] **Dark / theme modifier treatment** — Drawer overlay and panel must use `--st-*` tokens for background and border. Verify drawer bg in dark-pink-moon theme before implementation (glassmorphism risk on `--st-color-bg-surface`).
- [x] **Studio schema changes scoped** — None. Frontend/DS only.
- [x] **Web adapter sync scoped** — If Sidebar DS primitive gains a new `mobileStyle` value, web adapter CSS module must be updated in the same commit.
- [x] **Composition overlap audit** — MobileNav already implements a slide-out drawer (drawerRef, focus trap, aria-modal). **Decision recorded (2026-06-04):** extract a shared `Drawer` DS primitive consumed by both MobileNav and the sidebar. Two independent implementations is a fork.
- [x] **Atomic Reuse Gate** — **Decision recorded (2026-06-04):** `Drawer` is a DS primitive (`packages/design-system/src/components/Drawer/`). MobileNav and sidebar both compose from it. Phase 0 mock will show both surfaces using the same drawer shell.
- [ ] **Component registry update** — If a new `Drawer` primitive is created, add it to `docs/conventions/component-registry.md`. If Sidebar gains a new mobile mode, update its registry row.

---

## Context

**Current mobile behaviour:**

Multi-column layouts (`TwoColumnLayout`) stack to a single column below their breakpoint — `bpMd` (768px) or `bpLg` (1024px). The sidebar content doesn't disappear; it moves to an accordion `<details>` element via the Sidebar component's `mobileStyle` prop:

- `mobileStyle="appendix"` — sidebar collapses to a `<details>` block appended below main content
- `mobileStyle="strip"` — sidebar collapses to a narrow strip toggle

`MobileNav` (`apps/web/src/components/MobileNav.jsx`) already implements a proper slide-out drawer: `drawerRef`, focus trap (Tab cycles within), `aria-modal`, close-on-nav-click, `drawerOpen` CSS class toggle. It is rendered by `Header.jsx` below the mobile breakpoint.

**Affected layouts:**

| Surface | Component | Current mobile behaviour |
|---------|-----------|--------------------------|
| Article/Node/CaseStudy pages | `PageSidebar` → `Sidebar mobileStyle="appendix"` | Stacks below content |
| Platform pages (Governance, Monorepo, CMS, DS) | `PlatformLayout` → `TwoColumnLayout` + `SidebarNav` | Stacks below content at 1023px |
| Any page using `TwoColumnLayout` | `TwoColumnLayout` | Stacks at bpMd/bpLg |

---

## Objective

After this epic: sidebar content on multi-column pages is accessible on mobile via a drawer, not stacked below the fold. The drawer integrates with the existing hamburger/MobileNav system — either as a second panel within MobileNav or as a separate "Contents" trigger that reuses the same drawer primitive.

**Expanded scope (added 2026-06-05):** The sidebar column is also unified at the desktop architecture level. `PageSidebar` and `SidebarNav` are currently two separate components; callers assemble them ad-hoc. The `Page` DS primitive should represent the sidebar column (left or right) as a first-class layout slot — the sidebar becomes a named prop/slot on `Page`, not a separate wiring concern. `PageSidebar` becomes either a thin content-provider composing into that slot, or is absorbed. Phase 0 mock must cover both the desktop column layout and the mobile drawer — they are the same sidebar, two breakpoint expressions.

Reference: `/nodes/poc-platform-agnostic-by-design` shows the target desktop layout (right-rail nav column).

Scope decisions:
1. ~~One drawer primitive shared by MobileNav and sidebar, or sidebar-specific?~~ **Resolved: shared `Drawer` DS primitive used by both MobileNav and sidebar.**
2. Trigger: extend hamburger menu to include "Contents" entry, or separate floating/sticky button? — resolve in Phase 0 mock.
3. Which surfaces are in scope: all three, or Platform-only for Phase 1? — resolve in Phase 0 mock.
4. **Page column slot architecture** — Phase 0 must decide: does `Page` grow a `sidebar` prop/slot (right | left | none), or does TwoColumnLayout remain the desktop mechanism and Page gains a sidebar-aware variant? The mock must show both the slot API and how PageSidebar/SidebarNav content flows into it.

Schema layer: not touched. Query layer: not touched. Render layer: DS Sidebar, TwoColumnLayout, PageSidebar, possibly MobileNav/Header.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ No | Root pages don't use TwoColumnLayout |
| `article`   | ✅ Yes | Uses PageSidebar (TOC + series) |
| `caseStudy` | ✅ Yes | Uses PageSidebar |
| `node`      | ✅ Yes | Uses PageSidebar |
| `archivePage` | ☐ No | Archive pages are single-column |

Platform pages (Governance, Monorepo, CMS, DS) use `PlatformLayout` — in scope but not Sanity doc types.

---

## Schema Field Proposal

N/A — no schema changes.

---

## Scope

### Phase 0 — Design exploration + mock (HARD STOP — no code until complete)

- [ ] Produce HTML mock at `docs/drafts/SUG-153-mobile-sidebar-mock.html`
- [ ] Mock must annotate (per CLAUDE.md Phase 0 nav requirements):
  - Drawer trigger placement (within hamburger menu vs separate "Contents" button)
  - Drawer width and overlay behaviour (full-width, partial, no overlay)
  - Active/highlighted nav item state in drawer
  - Close affordance (X button, overlay tap, swipe)
  - Scroll behaviour while drawer open (body locked or not)
  - Whether Platform sidebar nav and article TOC use the same drawer pattern or differ
- [ ] Decision record: one shared `Drawer` primitive vs sidebar-specific implementation
- [ ] **Phase 0 sign-off required before any JSX/CSS changes**

### Phase 1 — Implementation (post Phase 0 sign-off)

Scope TBD based on Phase 0 decisions. Likely includes:

- [ ] If shared `Drawer` primitive: create `packages/design-system/src/components/Drawer/` + web adapter
- [ ] Update `Sidebar` component — new `mobileStyle="drawer"` value (or replace `appendix`/`strip`)
- [ ] Update `TwoColumnLayout` — drawer trigger rendered below breakpoint
- [ ] Update `PageSidebar` — pass `mobileStyle="drawer"` (or equivalent) to Sidebar
- [ ] Update `PlatformLayout` — same
- [ ] If MobileNav integration: update `MobileNav.jsx` and `Header.jsx`
- [ ] CSS: drawer panel styles (bg, width, z-index, transition) using `--st-*` tokens
- [ ] Accessibility: focus trap in drawer, `aria-modal`, `aria-expanded` on trigger
- [ ] Storybook story: `Sidebar` mobile drawer variant

---

## Query Layer Checklist

N/A — no query changes.

---

## Schema Enum Audit

**`Sidebar` `mobileStyle` prop** — current values: `"appendix"` | `"strip"`. If a new value is added (e.g. `"drawer"`), update all callsites. Current callsites:

```
apps/web/src/components/PageSidebar.jsx — mobileStyle="appendix"
apps/web/src/components/PlatformLayout/PlatformLayout.jsx — (check)
```

---

## Metadata Field Inventory

N/A.

---

## Themed Colour Variant Audit

To be completed at Phase 1. Key surfaces to verify:

| Surface | Token(s) | Risk |
|---------|----------|------|
| Drawer panel background | `--st-color-bg-surface` | Glassmorphism in dark-pink-moon — verify before use |
| Drawer overlay (scrim) | TBD — no token exists yet | May need `--st-color-overlay` primitive |
| Drawer border/divider | `--st-color-border-default` | Low risk |
| Trigger button | Inherits from Button/Chip pattern | Low risk |

---

## Non-Goals

- No changes to Sanity schema, GROQ queries, or content model
- Does not change the desktop layout (sidebar stays in-place at breakpoint and above)
- Does not change MobileNav's existing site navigation items — only extends it (if that path is chosen)
- Does not introduce swipe gestures — trigger + close button only for Phase 1
- Does not cover archive page filter bar mobile behaviour (separate concern)
- Does not rename IndexGroup/IndexCell → SegmentedControl — that decision is tracked in SUG-155 Phase 0

---

## Technical Constraints

**Monorepo / tooling**
- DS Sidebar lives in `packages/design-system/src/components/Sidebar/` AND web adapter at `apps/web/src/design-system/components/sidebar/`
- Any CSS change to DS Sidebar must be mirrored to web adapter in the same commit
- If a new `Drawer` primitive is created, it needs both DS + web adapter + index export

**Existing drawer pattern (MobileNav)**
- `apps/web/src/components/MobileNav.jsx` — slide-out drawer reference implementation
- Has: `drawerRef`, focus trap (focusable elements query), `aria-modal="true"`, close on nav click, `Escape` key close
- Any new drawer must match this accessibility model — do not implement independently

**CSS**
- Drawer `z-index` must sit above content but below modals — check existing z-index stack
- `body` scroll lock when drawer open: use `overflow: hidden` on `<body>` or `position: fixed` — must not break scroll position on close
- All colours via `var(--st-*)` tokens. No hex. Overlay/scrim token may need to be added to `tokens.json` first.

**Breakpoints**
- `PageSidebar` hides at `@media (max-width: 1023.98px)` currently (per `PageSidebar.module.css`)
- `TwoColumnLayout` stacks at `bpMd` (768px) or `bpLg` (1024px)
- Drawer trigger should appear at the same breakpoint where the column layout stacks

**Schema / Query / Render** — N/A for schema/query. Render: see Scope Phase 1.

---

## Migration Script Constraints

N/A.

---

## Files to Modify

Confirmed after Phase 0 sign-off. Likely:

**DS + web adapter (if Drawer primitive created)**
- `packages/design-system/src/components/Drawer/Drawer.tsx` — CREATE
- `packages/design-system/src/components/Drawer/Drawer.module.css` — CREATE
- `packages/design-system/src/index.ts` — add export
- `apps/web/src/design-system/components/drawer/Drawer.jsx` — CREATE (web adapter)
- `apps/web/src/design-system/components/drawer/Drawer.module.css` — COPY from DS
- `apps/web/src/design-system/index.js` — add export

**DS Sidebar**
- `packages/design-system/src/components/Sidebar/Sidebar.tsx` — UPDATE (`mobileStyle`)
- `packages/design-system/src/components/Sidebar/Sidebar.module.css` — UPDATE
- `apps/web/src/design-system/components/sidebar/Sidebar.jsx` — UPDATE (mirror)
- `apps/web/src/design-system/components/sidebar/Sidebar.module.css` — UPDATE (mirror)

**Web app**
- `apps/web/src/design-system/components/two-column-layout/TwoColumnLayout.jsx` — UPDATE (drawer trigger)
- `apps/web/src/design-system/components/two-column-layout/TwoColumnLayout.module.css` — UPDATE
- `apps/web/src/components/PageSidebar.jsx` — UPDATE
- `apps/web/src/components/PlatformLayout/PlatformLayout.jsx` — UPDATE
- `apps/web/src/components/MobileNav.jsx` — UPDATE (if integration path chosen)
- `apps/web/src/components/Header.jsx` — UPDATE (if MobileNav integration)

**Tokens (if overlay token needed)**
- `tokens/source/tokens.json` — add `--st-color-overlay`
- Run `pnpm tokens:build`

**Storybook**
- `apps/storybook/.storybook/stories/` — Sidebar mobile drawer story

---

## Deliverables

1. Phase 0: HTML mock at `docs/drafts/SUG-153-mobile-sidebar-mock.html`, annotated and approved
2. Phase 1: Sidebar renders drawer on mobile instead of stacking appendix
3. Platform pages: sidebar nav accessible on mobile via drawer
4. Article/node/caseStudy: TOC accessible on mobile via drawer
5. Storybook story covering the mobile drawer state

---

## Acceptance Criteria

- [ ] Phase 0 mock approved by Bex before any code is written
- [ ] On a viewport < breakpoint, the sidebar is not rendered inline below content — a drawer trigger is present instead
- [ ] Drawer opens and closes correctly; focus is trapped while open; Escape closes it
- [ ] `aria-modal="true"` on drawer panel; trigger has `aria-expanded` state
- [ ] Body scroll is locked while drawer is open; scroll position is restored on close
- [ ] Drawer renders correctly in both `light-pink-moon` and `dark-pink-moon` themes — no glassmorphism on solid surfaces
- [ ] `pnpm validate:tokens --strict-colors` passes — zero hardcoded colour values
- [ ] Desktop layout is unchanged (sidebar stays in-place at breakpoint and above)
- [ ] Storybook story for Sidebar mobile variant renders without console errors

---

## Visual QA Gate

Phase 0: mock reviewed and annotated — human approves before Phase 1 starts.

Phase 1: test on real device or DevTools mobile viewport on:
- `/articles/<any-slug>` — article with TOC sidebar
- `/platform/governance` — platform sidebar nav
- Both `light-pink-moon` and `dark-pink-moon` themes

Human gate: "Visual QA approved" required before close-out.

---

## Risks / Edge Cases

**Schema risks** — N/A.

**Query risks** — N/A.

**Render risks**
- [ ] Two independent drawer implementations (MobileNav + sidebar) will diverge — decision on shared primitive is blocking
- [ ] Glassmorphism on `--st-color-bg-surface` in dark-pink-moon — drawer background may need a raw primitive (`--st-color-midnight-800`) rather than the semantic token
- [ ] Scroll lock (`overflow: hidden` on body) can cause layout shift on desktop if scrollbar disappears — guard with `@media (max-width: breakpoint)`
- [ ] Platform sidebar nav has scrollspy — ensure scrollspy continues to work when sidebar is in a drawer
- [ ] `PageSidebar` currently hides at `1023.98px`; `TwoColumnLayout bpMd` stacks at 768px — breakpoint mismatch must be reconciled in Phase 0

---

## Post-Epic Close-Out

1. Phase 0 mock approved (hard stop)
2. All acceptance criteria met
3. Visual QA gate — test on mobile viewport, both themes, both surface types (article + platform)
4. Chromatic VRT — run before close-out
5. Move `docs/backlog/SUG-153-mobile-responsive-sidebar-drawer.md` → `docs/shipped/`
6. `/mini-release`
7. Update Linear SUG-153 → Done
