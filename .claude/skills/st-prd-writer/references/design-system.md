# Design System Reference — PRD Writer

Use this file when writing a PRD for any work touching tokens, components, Storybook,
or the `packages/design-system` package.

---

## Stack

- **Package:** `packages/design-system` (TypeScript, CSS Modules)
- **Web adapter:** `apps/web/src/design-system/components/` (JSX, not TypeScript)
- **Storybook:** `apps/storybook`
- **Namespace:** `st-*` with BEM methodology
- **Typography:** IBM Plex Mono (mono/code) + DM Sans (body/UI)
- **Zero hardcoded values** in component CSS — everything via CSS custom property

---

## Token Architecture (Three Layers)

| Layer | What it contains | File |
|-------|-----------------|------|
| Primitive | Raw values (`#ff247d`, `16px`) | `tokens/primitives.css` |
| Semantic | Contextual aliases (`--st-color-accent`, `--st-spacing-md`) | `tokens/semantic.css` |
| Component | Component-scoped overrides | within component `.module.css` |

**When writing a PRD:** state which semantic tokens are relevant. Never hardcode primitive
values in component specs — always route through semantic layer.

### Brand Colour Tokens

| Name | Value | Usage |
|------|-------|-------|
| `--st-color-pink` | `#ff247d` | Primary accent |
| `--st-color-seafoam` | `#2bd4aa` | Secondary accent |
| `--st-color-lime` | `#D1FF1D` | Highlight / code |
| `--st-color-midnight` | `#0a0f1a` | Dark canvas |

---

## Component Contract Requirements

Every PRD for a new component must specify:

1. **Component name** — PascalCase, maps to file name
2. **Props interface** — every prop: name, TypeScript type, required/optional, default value
3. **Variant inventory** — every named visual variant
4. **States** — default, hover, focus, disabled, loading, error (as applicable)
5. **Accessibility requirements** — ARIA role, keyboard behaviour, focus management
6. **Storybook stories required** — minimum one per variant + one for each meaningful state

**Do not leave props as "TBD."** Downstream epics block on this. If unknown, state the open
decision with an owner.

### Example Props Table

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `status` | `'active' \| 'archived' \| 'draft'` | Yes | — | Drives colour variant |
| `label` | `string` | No | derived from `status` | Override display text |
| `size` | `'sm' \| 'md'` | No | `'md'` | |

---

## Theme Variant Requirements

Themes in scope: **dark** (default) | **light** | **pink-moon**

Every component PRD must state explicitly per-theme:

| Surface | Dark | Light | Pink Moon | Token |
|---------|------|-------|-----------|-------|
| Background | value or token | value or token | value or token | `--st-[component]-bg` |
| Text | value or token | value or token | value or token | `--st-[component]-color` |
| Border | value or token | value or token | value or token | `--st-[component]-border` |

"Will inherit from parent" is only acceptable if the parent token is named explicitly.

---

## Storybook-First Rule

Components are validated in Storybook **before** site implementation. Build success alone
is not a completion signal for visual work. The PRD must specify:

- Which stories are required (name + variant/state shown)
- Whether Chromatic visual regression is in scope (current: gated on zero-cost process gates)

---

## Web Adapter Rule

`apps/web` does not import from `packages/design-system` directly. Every DS component
requires a matching web adapter:

1. `apps/web/src/design-system/components/[Name]/[Name].jsx` — thin JSX wrapper
2. `apps/web/src/design-system/components/[Name]/[Name].module.css` — copied from DS
3. Export added to `apps/web/src/design-system/index.js`
4. Runtime deps added to `apps/web/package.json` if the DS component uses new libraries

The PRD must state whether the adapter is in scope for this work or deferred. If deferred,
name the follow-on epic.

---

## Prohibited Patterns

- `featuredImage` — deprecated. Never use. Source images from `hero.media[0]` or `sections[]`.
- Hardcoded hex values in component CSS — every value must come from a token.
- Page-specific CSS in place of reusable components.
- New CSS classes outside the `st-*` namespace.
- `!important` except as a temporary bridge (must be documented as technical debt).

---

## Common PRD Failure Modes (Design System Domain)

- Props interface incomplete — downstream implementation guesses; drift begins immediately
- Variant inventory missing states (hover, focus, disabled) — engineer ships interactive component
  with no visual feedback
- Storybook stories not specified — component ships without documentation; Storybook-first
  rule is violated
- Web adapter not addressed — component works in DS package but breaks in `apps/web`
- Theme variant table missing — post-delivery request: "make it work in light mode"
- Token specified at primitive layer instead of semantic — hardcodes the value; breaks theming
