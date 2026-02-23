# Button — Visual Contract

> Handoff document for Figma. This spec defines every visual property of the
> Button component. Build the Figma component to match these values exactly.
> All values are expressed as design token names. Resolve tokens via
> `packages/design-system/src/styles/tokens.css`.

---

## Anatomy

```
┌─────────────────────────────────────┐
│  [icon slot — optional]  [label]    │
└─────────────────────────────────────┘
```

| Layer | Notes |
|---|---|
| **Container** | The `<button>` element. Carries background, border, radius, padding. |
| **Label** | Text content. Single line by default; wraps on narrow viewports. |
| **Icon slot** | Optional. Not yet implemented in code — reserve left-of-label position for future use. |

---

## Variants

Two valid `variant` prop values.

### Primary

| Property | Token | Resolved value |
|---|---|---|
| Background | `--st-color-brand-primary` | `#FF69B4` |
| Border | `--st-color-brand-primary` | `#FF69B4` |
| Label colour | `--st-white` | `#FFFFFF` |

### Secondary

| Property | Token | Resolved value |
|---|---|---|
| Background | `--st-white` | `#FFFFFF` |
| Border | `--st-gray` | `#6B7280` |
| Label colour | `--st-black` | `#000000` |

---

## States

### Primary variant

| State | Background | Border | Label | Cursor |
|---|---|---|---|---|
| Default | `--st-color-brand-primary` | `--st-color-brand-primary` | `--st-white` | `pointer` |
| Hover | `--st-black` | `--st-black` | `--st-white` | `pointer` |
| Focus | same as hover + 2px outline offset | | | |
| Disabled | `--st-color-brand-primary` at 50% opacity | same at 50% | same at 50% | `not-allowed` |

### Secondary variant

| State | Background | Border | Label | Cursor |
|---|---|---|---|---|
| Default | `--st-white` | `--st-gray` | `--st-black` | `pointer` |
| Hover | `--st-gray-light` | `--st-black` | `--st-black` | `pointer` |
| Focus | same as hover + 2px outline offset | | | |
| Disabled | `--st-white` at 50% opacity | `--st-gray` at 50% | `--st-black` at 50% | `not-allowed` |

> Disabled state is achieved via `opacity: 0.5` on the entire element — do not
> build separate fill colours for disabled in Figma. Use the component's
> base colour with 50% opacity applied to the container layer.

---

## Sizing

| Property | Token | Resolved value |
|---|---|---|
| Padding (block / vertical) | `--st-space-2` | `0.5rem` (8px) |
| Padding (inline / horizontal) | `--st-space-4` | `1rem` (16px) |
| Border radius | `--st-radius-sm` → `--st-radius-2` | `0.5rem` (8px) |
| Border width | — | `1px` |
| Font size | `--st-font-size-base` | `1rem` (16px) |
| Font weight | `--st-font-weight-semibold` | `600` |
| Font family | `--st-font-sans` | system-ui stack |
| Transition | — | `all 0.2s ease` |

---

## Focus Style

No explicit focus rule is in the current CSS — the browser default outline applies. In Figma, represent focus with a 2px solid `--st-color-brand-primary` outline, 2px offset from the container.

> **TODO (code):** Add an explicit `:focus-visible` rule to `Button.module.css` for WCAG 2.4.7 compliance.

---

## Loading State

No dedicated `loading` prop exists yet. The proxy pattern is `disabled: true` with label `"Loading…"`. In Figma, create a Loading variant using the disabled visual (50% opacity) with a spinner icon in the icon slot as a placeholder.

> **TODO (code):** Add `loading?: boolean` prop with spinner icon.

---

## Do / Don't

| | Rule |
|---|---|
| ✅ **Do** | Use `variant="secondary"` for all non-primary actions on a page — only one primary button should appear per visual group. |
| ❌ **Don't** | Override button colours inline or via utility classes. All colour changes must go through the token system so they propagate to both Figma and code simultaneously. |
