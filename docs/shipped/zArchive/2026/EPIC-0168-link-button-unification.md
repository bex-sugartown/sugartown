# EPIC-0168: Link & Button Unification
# Sugartown — Claude Code Epic Prompt

**Epic ID:** EPIC-0168
**Status:** Complete
## EPIC NAME: Link & Button Unification

---

## Pre-Execution Completeness Gate

- [x] **Layout contract** — N/A (no new visual layout; this epic unifies existing rendering contracts)
- [x] **All prop value enumerations** — ctaButton.style: `primary | secondary | ghost` (from `ctaButton.ts` line 35–39)
- [x] **Correct audit file paths** — all files verified via read (see Files to Modify)
- [x] **Dark / theme modifier treatment** — Button tokens are theme-aware via `tokens.css` (dark default, light override). This epic changes token _values_, not the theming mechanism. Both files updated in same commit per drift rule.
- [x] **Studio schema changes scoped** — Yes, one schema change: rename ctaButton.style label from "Secondary (Seafoam)" to "Secondary (Lime)" (cosmetic, no stored value change). Own commit: `fix(studio):`
- [x] **Web adapter sync scoped** — Button web adapter is the primary target. No DS package Button change needed (DS Button has no `href` rendering).

---

## Context

### The Problem

A link/button audit revealed three structural inconsistencies:

**1. Two competing button rendering paths**
- `Button.jsx` (web adapter at `apps/web/src/design-system/components/button/`) — renders `<a href>` for links (plain anchor, no Router awareness, no internal/external detection)
- `Header.module.css` `.ctaButton*` classes — a completely separate button implementation applied to the `Link` atom via `className`, with its own color tokens (seafoam for secondary)

**2. Color identity mismatch: lime vs seafoam**
- `Button.module.css` secondary: `--st-button-secondary-bg: var(--st-color-lime)` → renders **lime** (#D1FF1D)
- `Header.module.css` `.ctaButtonSecondary`: `--st-color-seafoam-500` → renders **seafoam** (#2BD4AA)
- Sanity schema `ctaButton.ts` labels secondary as "Secondary (Seafoam)" — but the main Button component renders lime
- Result: the same `style: 'secondary'` value renders a different color depending on which component consumes it

**3. No shared internal/external link resolution for buttons**
- `Link.jsx` atom has centralized `isExternal` detection (URL prefix → Router `<Link>` or `<a target="_blank">`)
- `Button.jsx` does not use this — renders plain `<a href>` regardless, meaning internal button links cause full page reloads instead of SPA navigation
- `Hero.jsx` and `PageSections.jsx` manually apply `target`/`rel` on every Button call site
- `NavigationItem.jsx` has its own duplicate isExternal implementation

### Files Already Involved

| File | Current Role |
|------|-------------|
| `apps/web/src/design-system/components/button/Button.jsx` | Web button adapter — renders `<a>` or `<button>`, no link intelligence |
| `apps/web/src/design-system/components/button/Button.module.css` | Button styles — secondary = lime via `--st-button-secondary-bg` |
| `apps/web/src/components/atoms/Link.jsx` | Link atom — centralized isExternal detection, Router `<Link>` for internal |
| `apps/web/src/components/atoms/NavigationItem.jsx` | Nav link — duplicate isExternal logic |
| `apps/web/src/components/Hero.jsx` | Hero — manually passes target/rel to Button |
| `apps/web/src/components/PageSections.jsx` | Sections — manually passes target/rel to Button (HeroSection, CTASection) |
| `apps/web/src/components/Header.jsx` | Header — uses Link atom with `.ctaButton*` CSS classes (not Button component) |
| `apps/web/src/components/Header.module.css` | Header CTA styles — secondary = seafoam (divergent from Button) |
| `apps/studio/schemas/objects/ctaButton.ts` | CTA schema — labels secondary as "Seafoam" |
| `apps/studio/schemas/objects/link.ts` | Link object — flat url/label/openInNewTab |
| `apps/studio/schemas/objects/linkItem.ts` | Link item — explicit internal/external type with ref resolution |
| `apps/web/src/design-system/styles/tokens.css` | Token definitions — `--st-button-secondary-bg: var(--st-color-lime)` |
| `packages/design-system/src/styles/tokens.css` | DS token definitions — must stay in sync |

---

## Objective

After this epic, every clickable button/CTA surface in the web app (excluding PortableText inline links) will:

1. **Use a single shared `resolveLink()` utility** that detects internal vs external URLs, returns the correct element (`<Link>` vs `<a>`), and applies `target="_blank" rel="noopener noreferrer"` for external links — eliminating manual target/rel at every call site
2. **Render through the same `Button` component** — the Header CTA will use `Button` (not `Link` atom with CSS class overrides), so all buttons share one visual contract
3. **Use a single consistent color for "secondary"** — lime (#D1FF1D), matching the design system token `--st-button-secondary-bg` already defined in `tokens.css`
4. **Have correct schema labels** — the ctaButton schema will label secondary as "Lime" (not "Seafoam"), matching what actually renders

**Data layer:** One cosmetic schema label fix (no stored value change, no migration needed).
**Query layer:** No GROQ changes (link data shapes unchanged).
**Render layer:** Button component gains Router awareness; all CTA call sites simplified; Header CTA migrated to Button.

---

## Doc Type Coverage Audit

This epic does not add new fields, section types, or schema objects to content doc types. It refactors rendering of existing CTA/link data.

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | Yes | Pages render `sections[]` containing `ctaSection` and `heroSection` — both use Button |
| `article`   | Yes | Articles render `sections[]` — same CTA surfaces |
| `caseStudy` | Yes | Case studies render `sections[]` — same CTA surfaces |
| `node`      | Yes | Nodes render `sections[]` — same CTA surfaces |
| `archivePage` | No | Archive pages do not render CTA buttons or hero sections |

---

## Scope

- [x] **Phase 1 — Shared link utility** (`apps/web/src/lib/linkUtils.js`)
  - [x] Extract `isExternalUrl(url)` — returns boolean
  - [x] Extract `getLinkProps(url, openInNewTab)` — returns `{ isExternal, target, rel }` for `<a>` or `{ to }` for Router
- [x] **Phase 2 — Button gains Router awareness** (`Button.jsx`)
  - [x] When `href` is internal → render React Router `<Link>` (SPA navigation)
  - [x] When `href` is external → render `<a target="_blank" rel="noopener noreferrer">`
  - [x] Accept optional `openInNewTab` prop to force external behavior
  - [x] Remove need for callers to pass `target`/`rel`
- [x] **Phase 3 — Unify Header CTA** (`Header.jsx`, `Header.module.css`)
  - [x] Replace `Link` atom + `.ctaButton*` CSS classes with `Button` component + variant prop
  - [x] Remove `.ctaButton`, `.ctaButtonSecondary`, `.ctaButtonGhost` CSS rules from Header.module.css
  - [x] Remove `getButtonStyleClass()` function
- [x] **Phase 4 — Simplify all CTA call sites**
  - [x] `Hero.jsx` — remove manual `target`/`rel`, let Button handle it
  - [x] `PageSections.jsx` (HeroSection, CTASection) — remove manual `target`/`rel`
- [x] **Phase 5 — Deduplicate isExternal in atoms**
  - [x] `Link.jsx` — import from `linkUtils.js` instead of inline detection
  - [x] `NavigationItem.jsx` — import from `linkUtils.js` instead of inline detection
- [x] **Phase 6 — Fix color identity**
  - [x] Schema label: rename "Secondary (Seafoam)" → "Secondary (Lime)" in `ctaButton.ts`
  - [x] Remove seafoam Header CTA styles (covered by Phase 3)
  - [x] Confirm `--st-button-secondary-bg: var(--st-color-lime)` is the single source of truth (already correct in tokens.css)

---

## Query Layer Checklist

No GROQ changes needed. The link data shapes (`url`, `label`, `openInNewTab`, `style`) are unchanged — only the rendering pipeline changes.

- `pageBySlugQuery` — excluded: no field changes
- `articleBySlugQuery` — excluded: no field changes
- `caseStudyBySlugQuery` — excluded: no field changes
- `nodeBySlugQuery` — excluded: no field changes

---

## Schema Enum Audit

| Field name | Schema file | `value` → Display title |
|-----------|-------------|--------------------------|
| `style` | `ctaButton.ts` | `primary` → "Primary (Sugartown Pink)", `secondary` → "Secondary (Lime)" (**changed from "Seafoam"**), `ghost` → "Ghost (Outline)" |

No new enum fields added. The `CTA_STYLE_TO_VARIANT` map in `PageSections.jsx` is unchanged: `{ primary: 'primary', secondary: 'secondary', ghost: 'tertiary' }`.

---

## Themed Colour Variant Audit

| Surface / component | Dark | Light | Pink Moon | Token(s) |
|---------------------|------|-------|-----------|----------|
| Button secondary bg | `var(--st-color-lime)` (#D1FF1D) | `var(--st-color-lime)` | Inherits dark | `--st-button-secondary-bg` |
| Button secondary text | `var(--st-color-midnight)` | `var(--st-color-midnight)` | Inherits dark | `--st-button-secondary-text` |
| Button secondary hover | `var(--st-shadow-lime-glow)` | `var(--st-shadow-lime-glow)` | Inherits dark | `--st-button-secondary-hover-shadow` |

No token value changes. The Header's seafoam styles are removed (they were never theme-token-based — they used hardcoded fallbacks like `#2BD4AA`). After this epic, the Header CTA inherits the same themed token path as all other buttons.

---

## Non-Goals

- **PortableText inline links** — excluded from this audit. Inline link marks in body content use a different rendering path (`<a>` in PT serializers) and are architecturally distinct from CTA buttons.
- **linkItem schema adoption for CTAs** — the `linkItem` object (explicit internal/external radio + reference) is a better content model than the flat `link` object, but migrating `ctaButton` and `ctaButtonDoc` to use it requires a data migration of existing CTA content. Deferred to a future epic.
- **DS package Button changes** — the `packages/design-system/src/components/Button/Button.tsx` is a pure `<button>` (no `href`). Router awareness is web-layer concern only.
- **Chip link handling** — Chips use the web Chip adapter which already renders React Router `<Link>`. No changes needed.
- **CardBuilderSection title links** — already uses `linkItem` schema with explicit `resolveHref()`. No changes needed.
- **Social links** — always external, simple `<a>`, no unification needed.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/web` is the only package touched for rendering changes
- No migration script needed (schema label change only, no stored value change)

**Schema (Studio)**
- One cosmetic change in `ctaButton.ts`: the `title` string for the secondary option. No field type, name, or stored value changes.
- Commit separately: `fix(studio): correct secondary button label from Seafoam to Lime`

**Query (GROQ)**
- No query changes. The `style` field still stores `'secondary'` — only the Studio UI label changes.

**Render (Frontend)**
- `Button.jsx` must remain backward-compatible: callers that still pass `target`/`rel` should not break (spread `...props` already handles this)
- `linkUtils.js` is a new file — pure functions, no React dependencies, importable by any component
- React Router's `<Link>` must only be used inside a `<BrowserRouter>` context — Button will import from `react-router-dom` (safe: all pages render inside BrowserRouter in `main.jsx`)

**Design System → Web Adapter Sync**
- No DS package changes. The web adapter `Button.jsx` gains Router awareness — this is a web-layer-only concern (the DS Button is a pure `<button>` with no href).

---

## Files to Modify

**Studio**
- `apps/studio/schemas/objects/ctaButton.ts` — change option title string (line 37)

**Frontend — New**
- `apps/web/src/lib/linkUtils.js` — CREATE: `isExternalUrl()`, `getLinkProps()`

**Frontend — Modify**
- `apps/web/src/design-system/components/button/Button.jsx` — add Router `<Link>` for internal hrefs, add `openInNewTab` prop
- `apps/web/src/components/atoms/Link.jsx` — import `isExternalUrl` from linkUtils
- `apps/web/src/components/atoms/NavigationItem.jsx` — import `isExternalUrl` from linkUtils
- `apps/web/src/components/Hero.jsx` — remove manual `target`/`rel` props from Button calls
- `apps/web/src/components/PageSections.jsx` — remove manual `target`/`rel` props from Button calls (HeroSection, CTASection)
- `apps/web/src/components/Header.jsx` — replace Link atom + getButtonStyleClass with Button component
- `apps/web/src/components/Header.module.css` — remove `.ctaButton`, `.ctaButtonSecondary`, `.ctaButtonGhost` rules

---

## Deliverables

1. **linkUtils.js** — `isExternalUrl(url)` and `getLinkProps(url, openInNewTab)` exist, exported, tested by usage
2. **Button Router awareness** — `Button.jsx` renders `<Link to>` for internal paths, `<a target="_blank" rel="noopener noreferrer">` for external
3. **Header CTA unified** — Header renders `Button` component for CTA, `getButtonStyleClass` and `.ctaButton*` CSS rules removed
4. **Call site simplification** — Hero.jsx and PageSections.jsx no longer pass `target`/`rel` to Button
5. **Atom deduplication** — Link.jsx and NavigationItem.jsx import `isExternalUrl` from linkUtils
6. **Schema label fix** — ctaButton.ts secondary option reads "Secondary (Lime)"
7. **Color consistency** — every secondary button on every page renders lime (#D1FF1D), never seafoam

---

## Acceptance Criteria

- [ ] **Single color for secondary:** navigate to any page with a secondary CTA button — background is lime (#D1FF1D), not seafoam (#2BD4AA). Applies to Hero, CTA sections, and Header CTA.
- [ ] **SPA navigation for internal buttons:** click a CTA button with an internal URL (e.g. `/contact`) — page transitions via React Router (no full page reload, URL changes in address bar without network request for HTML)
- [ ] **External links open new tab:** click a CTA button with an external URL (e.g. `https://example.com`) — opens in new tab with `rel="noopener noreferrer"`
- [ ] **Header CTA uses Button component:** inspect Header CTA in devtools — it renders the same `.button` + `.buttonSecondary` (or appropriate variant) classes as hero/section CTAs, not `.ctaButton*` classes
- [ ] **No manual target/rel in callers:** grep for `target.*_blank` in Hero.jsx and PageSections.jsx — zero matches (Button handles it internally)
- [ ] **No duplicate isExternal:** grep for `startsWith.*http` in Link.jsx and NavigationItem.jsx — zero inline implementations (both import from linkUtils)
- [ ] **Schema label accuracy:** open Sanity Studio, edit any ctaButton field — secondary option reads "Secondary (Lime)", not "Secondary (Seafoam)"
- [ ] **Backward compat:** any caller still passing `target`/`rel` as props does not break (props spread through)
- [ ] **Studio hot-reload:** `apps/studio` dev server reloads without error after schema label change

---

## Risks / Edge Cases

**Schema risks**
- [ ] Label-only change — no stored value change, so no existing content is affected. `style: 'secondary'` documents continue to work.
- [ ] `ctaButtonDoc.ts` also has a style field — verify it references the same option list or update it too

**Render risks**
- [ ] Button.jsx now imports `react-router-dom` — must only be used inside `<BrowserRouter>`. Verify Storybook stories still work (Storybook wraps stories in a MemoryRouter decorator — confirm this exists, or add one)
- [ ] `mailto:` and `tel:` URLs — `isExternalUrl` must NOT treat these as internal (they don't start with `http`). Ensure they render as plain `<a>` without Router wrapping
- [ ] Empty/null href — Button should still render as `<button>` (current behavior), not crash on Router `<Link to={null}>`
- [ ] Header CTA sizing — removing `.ctaButton*` CSS and switching to Button component may change padding/font-size. Verify visual parity or accept the alignment to the DS Button sizing as intentional.

---

## Commit Plan

1. `fix(studio): correct secondary button label from Seafoam to Lime (EPIC-XXXX)` — schema-only
2. `feat(web): add linkUtils and unify Button/CTA rendering (EPIC-XXXX)` — all frontend changes

---

## Post-Epic Close-Out

1. **Confirm clean tree** — `git status` must show nothing staged or unstaged
2. **Run mini-release** — `/mini-release EPIC-XXXX Link & Button Unification`
3. **Start next epic** — only after mini-release commit is confirmed
