---
paths:
  - "apps/web/src/**/*.jsx"
  - "apps/web/src/**/*.js"
  - "packages/design-system/**/*.tsx"
---
# React, routing and new JSX surfaces

Loads when a session reads app or design-system component code. Moved verbatim from `CLAUDE.md` on 2026-09-04 (ST-112); rule-file edits go through the Instruction & Rule File Write Gate exactly as `CLAUDE.md` does.

### React hooks — Outlet context pre-flight

Before adding `useOutletContext()`, `useContext()`, or any new hook to a component that already has conditional early returns (`if (loading) return`, `if (notFound) return`, template guards, etc.):

1. **Scan the component for all early returns** — list them.
2. **Confirm all hook calls appear before the first early return** — hooks must be called unconditionally on every render.
3. If the hook's _logic_ depends on data that isn't available yet (e.g. `leadHero` before the page loads), put the guard inside the hook's callback or effect — not around the hook call itself.

A hooks-order violation renders a blank page with a cryptic "change in order of Hooks" warning. The fix is always to move the hook up.

## URL Authority Rule (blocking)

All internal URLs must be built via `getCanonicalPath({ docType, slug })` from `apps/web/src/lib/routes.js`. This applies everywhere — components, pages, config maps, and constants.

**Specifically prohibited:**
- Hard-coded path strings like `'/ai-ethics'` or `'/contact'` outside of `routes.js`
- A `LEGAL_LINKS`, `NAV_LINKS`, or similar constant array inside a component file that contains path strings
- Any `to="..."` or `href="..."` with a literal path that isn't derived from `getCanonicalPath()` or a registered route constant

**The only exception:** redirects in `App.jsx` that explicitly map legacy routes (e.g. `/blog → /articles`). These are route definitions, not link targets.

A utility link set (e.g. the footer legal row) registers its paths as named constants in `routes.js` and imports them, rather than defining them inline.

### Component choice gate (blocking — fires before any new JSX surface)

When a new block, container, or layout surface is needed, run this audit **before writing any JSX or CSS**:

1. **Name the candidate existing components.** List every DS or app-level component that could plausibly render this content — Card, Callout, StatTile, MetadataCard, blockquote, etc. If the content is prose/text, explicitly check Callout and blockquote before inventing a new container.
2. **State why each candidate doesn't fit** (or why it does). One sentence per candidate. If a candidate covers 80%+ of the use case, extend it via props — do not fork.
3. **If no existing component fits**, stop — this triggers the Phase 0 hard-stop (`CLAUDE.md` §Phase 0 visual spec gate). Produce the vspec there; don't restate that process here.

**The gate is not optional for "small" blocks.** A coloured callout container, a stat grid wrapper, a challenge summary card all require the audit. Novelty of the visual format decides whether it fires, not size.

**Variant-first rule (hard stop):** A visual variation of an existing DS primitive is ALWAYS a prop on that primitive — never a new component. "Same component, different header color" is `tone="subdued"`, not `<RoadmapTable>`. "Same component, different label position" is `captionSide="bottom"`, not `<LabeledTable>`. If you find yourself writing a new component that renders an `<table>` (or any other primitive's root element), stop. Define the prop on the DS primitive, then compose from it. A component that wraps or reimplements a primitive without extending it is a fork.

Example audit (correct):
```
New block: challenge summary
Candidates checked:
- Callout (aside): covers prose + left accent. Missing: label + coloured bg. → 80% fit — extend via prop.
- Card: covers bg + border. Missing: left accent, no title slot. → 60% fit.
Decision: Extend Callout with a label prop, or use it as-is and add label via SectionLabel above.
Vspec: not required — extending existing component.
```
