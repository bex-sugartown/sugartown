**Linear Issue:** [SUG-148](https://linear.app/sugartown/issue/SUG-148/ds-phase-2-leaf-primitives-box-metric-meter-skeleton-descriptionlist)

## EPIC SUG-148: DS Phase 2 — Leaf primitives

**Replaces:** SUG-144 Phase 0 + SUG-145 Phase 1
**Depends on:** SUG-147 (drift catalogue confirms token names; Input status confirmed)
**Unblocks:** SUG-149 (Card re-codification and layout primitives both build on these)

Codify every atomic leaf primitive. Nothing composes these — they are the foundation layer. Each ships with: DS primitive (`packages/design-system/src/components/`) + web adapter (`apps/web/src/design-system/components/`) + Storybook story + registry row. Tokens only — `pnpm validate:tokens --strict-colors` must pass before each commit.

---

## Model & Mode

Use `opusplan` for the pre-execution gate. Sonnet executes.

---

## Pre-Execution Completeness Gate

- [ ] SUG-147 drift catalogue exists at `docs/briefs/design-system/audit-26-06-03/drift-catalogue.md`
- [ ] Input codification status confirmed from SUG-147 — know whether to build Input or skip it
- [ ] Reuse audit run for each primitive: grep all 5 layers before writing anything
- [ ] Token names verified to exist before use in CSS: `grep "token-name" apps/web/src/design-system/styles/tokens.css`
- [ ] Web adapter sync scoped: every DS primitive created here has a matching web adapter in Files to Modify
- [ ] Dark mode treatment documented for each primitive

---

## Primitives in scope

### Box (first — foundation for everything else)

`Box` is the token-aware style base. `Container`, `Page`, `Surface`, and `Stack` all build on it. Must ship before any other primitive in this epic.

- Props: `as` (polymorphic element), `padding`, `paddingX`, `paddingY`, `margin`, `background`, `borderRadius`, `borderWidth`, `borderColor` — all map to `--st-*` token keys, never raw values
- No layout logic of its own — purely token-driven styling
- Story: `Primitives/Layout/Box`

### Cluster A — Card primitives (from SUG-144 Phase 0)

**Metric** — value + label + optional trend indicator
- Props: `value` (string/number), `label` (string), `trend` (up/down/neutral, optional)
- Story: `Primitives/Metric` — default, with trend up, with trend down

**Meter** — `role="meter"`, value-in-range bar
- DECISION-NEEDED at execution: confirm vs `Progress` — are they the same primitive? Check audit note for `Meter` row. If they overlap, one is a synonym pointer.
- Props: `value`, `min`, `max`, `label` (a11y)
- Story: `Primitives/Meter`

**Skeleton** — loading placeholder shapes
- Props: `variant` (text | block | circle), `width`, `height` (token keys)
- Story: `Primitives/Skeleton` — text, block, circle variants; multiple in sequence

**DescriptionList** — `<dl>` key/value grid (the MetadataCard field grid)
- Props: `items` array of `{ label, value }`; `columns` (1 | 2)
- Story: `Primitives/DescriptionList` — single col, two col, long values

**Avatar** — image or initials fallback, multiple sizes
- Props: `src` (optional), `name` (for initials fallback), `size` (sm | md | lg)
- Story: `Primitives/Avatar` — with image, initials only, all sizes

### Cluster B — Form primitives (from SUG-145 Phase 1)

**Input** — single-line text control (if not already codified per SUG-147)
- Canonical name: `Input`. If SUG-147 found a story → skip this item and note "confirmed In system".
- Props: `type` (text | email | password | search | url | tel | number), `id`, `name`, `value`, `placeholder`, `disabled`, `aria-describedby`
- Single-line only. No `multiline` prop — Textarea is a sibling primitive.
- Story: `Primitives/Input` — default, filled, disabled, error state

**Label** — `<label htmlFor>` form caption. NOT SectionLabel (eyebrow/headings).
- Props: `htmlFor` (required), `required` (boolean, adds indicator)
- Story: `Primitives/Label` — default, required

**Textarea** — multiline control. Separate sibling to Input; never folded into it.
- Props: `id`, `name`, `rows`, `value`, `placeholder`, `disabled`, `aria-describedby`
- Story: `Primitives/Textarea`

**HelperText** — guidance caption below a control
- Props: `id` (for `aria-describedby` wiring), `children`
- Story: `Primitives/HelperText`

**ErrorMessage** — inline validation feedback
- Props: `id` (for `aria-describedby` wiring), `children`; renders with `role="alert"` or `aria-live="polite"`
- Story: `Primitives/ErrorMessage`

**Field** — composes Label + control slot + HelperText + ErrorMessage; owns a11y wiring
- Props: `label`, `htmlFor`, `helperText`, `errorMessage`, `required`, `children` (the control)
- Wires: `htmlFor` → control `id`; `aria-describedby` on control → HelperText/ErrorMessage `id`
- Story: `Primitives/Field` — empty, filled, with helper, with error, disabled

---

## Commit strategy

One commit per primitive (or per closely related pair). Do not batch all primitives into a single commit. Sequence:

1. `feat(ds): codify Box primitive` (first, unblocks everything)
2. Cluster A primitives: Metric → Meter → Skeleton → DescriptionList → Avatar
3. Cluster B primitives: Input (if needed) → Label → Textarea → HelperText → ErrorMessage → Field

Each commit includes: DS file + web adapter + Storybook story. Registry rows can be batched at end of each cluster.

---

## Files to Modify

**DS primitives (create)**
- `packages/design-system/src/components/Box/Box.tsx` + `Box.module.css` + `index.ts`
- `packages/design-system/src/components/Metric/Metric.tsx` + `Metric.module.css` + `index.ts`
- `packages/design-system/src/components/Meter/Meter.tsx` + `Meter.module.css` + `index.ts`
- `packages/design-system/src/components/Skeleton/Skeleton.tsx` + `Skeleton.module.css` + `index.ts`
- `packages/design-system/src/components/DescriptionList/DescriptionList.tsx` + css + `index.ts`
- `packages/design-system/src/components/Avatar/Avatar.tsx` + `Avatar.module.css` + `index.ts`
- `packages/design-system/src/components/Input/` — CREATE or VERIFY (per SUG-147)
- `packages/design-system/src/components/Label/Label.tsx` + css + `index.ts`
- `packages/design-system/src/components/Textarea/Textarea.tsx` + css + `index.ts`
- `packages/design-system/src/components/HelperText/HelperText.tsx` + css + `index.ts`
- `packages/design-system/src/components/ErrorMessage/ErrorMessage.tsx` + css + `index.ts`
- `packages/design-system/src/components/Field/Field.tsx` + `Field.module.css` + `index.ts`
- `packages/design-system/src/index.ts` — add all new exports

**Web adapters (create)**
- `apps/web/src/design-system/components/Box/Box.jsx` + `Box.module.css`
- `apps/web/src/design-system/components/Metric/Metric.jsx` + css
- `apps/web/src/design-system/components/Meter/Meter.jsx` + css
- `apps/web/src/design-system/components/Skeleton/Skeleton.jsx` + css
- `apps/web/src/design-system/components/DescriptionList/DescriptionList.jsx` + css
- `apps/web/src/design-system/components/Avatar/Avatar.jsx` + css
- `apps/web/src/design-system/components/Input/` — create or verify
- `apps/web/src/design-system/components/Label/Label.jsx` + css
- `apps/web/src/design-system/components/Textarea/Textarea.jsx` + css
- `apps/web/src/design-system/components/HelperText/HelperText.jsx` + css
- `apps/web/src/design-system/components/ErrorMessage/ErrorMessage.jsx` + css
- `apps/web/src/design-system/components/Field/Field.jsx` + `Field.module.css`
- `apps/web/src/design-system/index.js` — add all new exports

**Storybook**
- `apps/storybook/src/stories/Box.stories.jsx`
- `apps/storybook/src/stories/Metric.stories.jsx`
- `apps/storybook/src/stories/Meter.stories.jsx`
- `apps/storybook/src/stories/Skeleton.stories.jsx`
- `apps/storybook/src/stories/DescriptionList.stories.jsx`
- `apps/storybook/src/stories/Avatar.stories.jsx`
- `apps/storybook/src/stories/Input.stories.jsx` — if not already present
- `apps/storybook/src/stories/Label.stories.jsx`
- `apps/storybook/src/stories/Textarea.stories.jsx`
- `apps/storybook/src/stories/HelperText.stories.jsx`
- `apps/storybook/src/stories/ErrorMessage.stories.jsx`
- `apps/storybook/src/stories/Field.stories.jsx`

**Docs**
- `docs/conventions/component-registry.md` — add rows for all new primitives

---

## Acceptance Criteria

- [ ] Box ships first; every subsequent primitive's CSS imports only `--st-*` tokens, no raw values
- [ ] `pnpm validate:tokens --strict-colors` zero violations after every commit
- [ ] Every primitive has DS file + web adapter + Storybook story + registry row before this epic closes
- [ ] Field a11y wiring verified: every control has associated Label; errors linked via `aria-describedby`; ErrorMessage uses `aria-live`
- [ ] Storybook: all stories render without console errors on default + dark-pink-moon theme
- [ ] Meter DECISION-NEEDED resolved: either distinct primitive or synonym pointer to Progress recorded in audit

---

## Visual QA Gate

Agent prepares: Storybook screenshots of each primitive on default + dark-pink-moon; token compliance grep (zero hardcoded values); Field story covers all states (empty/filled/error/disabled).

Human gate: "Visual QA approved" before close-out.

---

## Post-Epic Close-Out

1. Visual QA gate
2. Chromatic VRT
3. Audit flips: Box/Metric/Meter/Skeleton/DescriptionList/Avatar/Label/Textarea/HelperText/ErrorMessage/Field → `present`; Input → `present` (if newly codified)
4. Move `docs/backlog/SUG-148-ds-phase-2-leaf-primitives.md` → `docs/shipped/`
5. `/mini-release SUG-148`
6. Transition SUG-148 to Done in Linear
