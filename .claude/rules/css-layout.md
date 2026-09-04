---
paths:
  - "**/*.css"
  - "apps/web/src/components/**"
---
# CSS layout, triage and class naming

Loads when a session reads a stylesheet or a component under apps/web/src/components. Moved verbatim from `CLAUDE.md` on 2026-09-04 (ST-112); rule-file edits go through the Instruction & Rule File Write Gate exactly as `CLAUDE.md` does.

### CSS Triage Protocol

Before writing a CSS fix for overflow, scrollbar, or layout collapse: **identify the exact DOM element** that owns the misbehavior (via DevTools screenshot or `preview_inspect`). Document:
1. The element's class name
2. Its computed `overflow`, `width`, and `box-sizing` values
3. Its parent's containment context

Do not write CSS until this is documented; guessing which container overflows leads to rounds of blind patching.

**bg-through-gap pattern documentation rule:** When a container uses `background-color: var(--st-color-rule-accent)` with `gap: 1px` to produce hairline dividers, every child element that covers the gap background must carry an explicit `background` declaration — even if it looks redundant. Annotate it:

```css
background: var(--st-card-bg); /* covers parent --st-color-rule-accent gap bg */
```

Without the annotation the declaration looks like dead code and gets removed, though it is load-bearing. If the pattern is not serving the layout, because every divider can be a `border` on adjacent siblings, replace it with `> * + *` border rules and say so in the commit message.

### CSS layout fix escalation rule

**When a CSS layout fix needs a follow-up commit, write a one-paragraph root-cause analysis before patching again**, covering the full cascade: containment → flex/grid → margin → max-width → child sizing.

**Self-check after every CSS fix commit:** grep for the same selectors in the prior 3 commits. If that surface appears in a recent fix, write the root-cause paragraph before the next fix rather than patching the symptom again.

### `container-type` guardrail

`container-type: inline-size` establishes size containment that can interfere with flex-grow negotiation. Before applying it:

1. Verify the element does **not** use `margin: auto` on the inline axis (auto margins + containment prevents stretch)
2. Verify the element's parent flex/grid context does not rely on the child growing beyond its basis
3. If the element is a flex child, add `width: 100%` explicitly — do not rely on `align-items: stretch` surviving containment

If a layout collapses after adding `container-type`, remove the containment first and replace the `@container` query with a `@media` query or intrinsic grid sizing (`minmax()`).

### Section Layout Contract

All page sections rendered by `PageSections.jsx` follow these rules. The principle behind 1–5: **internal padding is the component's concern, external spacing is the layout's.**

1. **Parent owns gap.** In `context="detail"`, `.detailContext` owns inter-section spacing via `display: flex; flex-direction: column; gap: var(--st-space-section-break-detail)`. Sections carry **zero vertical margin and zero vertical padding** there. Internal component padding is fine; external margin is not. (Without this, adjacent sections stacked 40+40=80px.)
2. **Flex child width.** All direct children of `.detailContext` need `width: 100%`, or they shrink to content width — heroes collapse to their inner max-width, callouts hug text, CTA sections shrink to button width. `.detailPage` controls max-width (760px); children stretch to fill.
3. **Catch-all over whitelist.** The `.detailContext` override uses `> *`, so new section types inherit the rules without registration, including those with their own CSS modules. Apply targeted exceptions (e.g. hero `overflow: visible` for overlays) as named overrides after the catch-all.
4. **Component margin zero.** A component with `margin-block` in its own CSS module needs a zero-margin override in detail context: `.detailContext .calloutSection :global(aside) { margin-block: 0 }`.
5. **Boundary elements.** Elements between two spacing contexts (e.g. MetadataCard between the hero and `.detailContext`) belong to neither flex container and need explicit margin: `.detailPage > aside:first-child { margin-bottom: var(--st-space-section-break-detail) }`. When adding an element to a detail page template, check which side of the `.detailContext` wrapper it falls on.
6. **Typography.** Body text uses `var(--st-font-heading-4)`, headings the `var(--st-font-heading-*)` scale, h2 colour `var(--st-color-brand-primary)`.
7. **Container width pre-flight before adding a grid.** A 2-col `<Grid spacing="lg">` needs `2 × 200px + 32px = 432px` minimum content width. If the container is `--st-width-detail` (760px) or narrower, check whether that width was chosen for prose density rather than grids — entity detail pages with content grids need `--st-width-detail-wide` (1080px). Update the container in the same commit as the grid.

**When adding a new section type:** verify it renders next to existing section types on a real page, not in isolation; test both `context="detail"` and `context="full"`; confirm it stretches to full width; add a zero-margin override in `PageSections.module.css` if the component has its own `margin-block`; and check spacing against `/articles/test-preview-post`, which covers every section type and transition.

### `Grid spacing="0"` takes borderless children only

A `<Grid spacing="0">` draws its hairlines with a bg-through-gap pattern, so its children must be borderless tile primitives (`StatCard`, or any component with no `border` declaration of its own). Never put `<Card>` inside one — it carries `border: 1px solid var(--st-card-border)`, which stacks against the grid's outer border and renders a double border. Full usage rules: `Foundations/Layout/Grid` in Storybook (SUG-152 Phase 7).

### CSS class pre-implementation reuse audit (blocking — fires before any new CSS class)

For any new detail/entity page, start from the canonical component map: `docs/conventions/detail-page-recipe.md` (ToolDetailPage is the reference implementation). The epic doc must contain a filled-in **Component-Reuse Manifest** (see `docs/epic-template.md`) before any JSX or CSS is written — its absence is an incomplete-epic-doc hard stop.

Before writing any new CSS class for a detail page, taxonomy page, or shared layout surface, enumerate candidates explicitly:

1. **Check `pages.module.css`** — shared entity page classes (`entityFolio`, `entityThumbnail`, `narrativeHeading`, `entityDescription`, `entityDetailPage`, `backLink`, `archiveEmpty`, `detailEyebrow`). If any covers the need at 80%+, use it — do not add a new class.
2. **Check DS tokens** — spacing, color, and type decisions must reference `--st-*` tokens, not new local values. If a token doesn't exist, add it via `tokens/source/tokens.json` first.
3. **Check DS components** — `Grid`, `SectionLabel`, `Card`, `Chip`, `ContentCard` before writing any layout CSS. State why each doesn't fit if you decide to skip them.
4. **Output the audit in writing** — in the commit message or epic doc before any `Edit`/`Write` call to a CSS file. One sentence per candidate checked. "I checked X and it covers Y" is sufficient. Silence is a process failure.

Location-named or page-scoped class names (e.g. `toolUrl`, `lv-*`, `folioHead`, `.profileHeadline`) are a signal the audit was skipped. Semantic, reusable names only.

**Proposal table gate (hard stop — fires before first Edit to a CSS module file):** Before writing the first new CSS class name, produce a naming proposal table and wait for explicit approval:

| Proposed class name | Closest existing pattern | Reuse decision |
|---------------------|--------------------------|----------------|
| `.myNewClass` | `pages.module.css .entityFolio` (80% match) | Extend existing |
| `.listRow` | None found — new semantic pattern | New class approved |

Do not `Edit` or `Write` a CSS module file until the table has been shown and the names confirmed. "Looks good" or "yes" is sufficient.

**Response mechanism:** a select-list gate per `docs/conventions/human-gate-conventions.md` — present the naming proposal table, then ask via a single select option rather than requiring a typed word.

### For every CSS property you write

Confirm:
1. The value is a token reference (`var(--st-*)`) not a hardcoded value. If hardcoded, state why.
2. The computed layout matches the dimensional contract. Show the arithmetic (e.g. "Vspec: 3-col grid at 1200px. Card 340px, gap 24px. 340x3 + 24x2 = 1068px + padding = 1200px").
3. Spacing and gap values match the vspec. Numbers, not vibes.
