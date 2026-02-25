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
| **Label** | Text content. Uppercase with letter-spacing. Single line by default; wraps on narrow viewports. |
| **Icon slot** | Optional. Not yet implemented in code — reserve left-of-label position for future use. |

---

## Variants

Three valid `variant` prop values.

### Primary

| Property | Token | Resolved value |
|---|---|---|
| Background | `--st-color-brand-primary` | `#ff247d` |
| Border | `--st-color-brand-primary` | `#ff247d` |
| Label colour | `--st-color-white` | `#FFFFFF` |

### Secondary

Lime accent button. Use for supporting / high-visibility actions alongside a Primary.

| Property | Token | Resolved value |
|---|---|---|
| Background | `--st-color-lime-500` | `#D1FF1D` |
| Border | `--st-color-lime-500` | `#D1FF1D` |
| Label colour | `--st-color-void-900` | `#0D1226` |

### Tertiary

Ghost / outline button. Use for low-emphasis actions, or over dark/void surfaces where the pink outline reads clearly on a transparent background.

| Property | Token | Resolved value |
|---|---|---|
| Background | `transparent` | — |
| Border | `--st-color-brand-primary` | `#ff247d` |
| Label colour | `--st-color-brand-primary` | `#ff247d` |

---

## States

### Primary variant

| State | Background | Border | Label | Transform | Shadow | Cursor |
|---|---|---|---|---|---|---|
| Default | `--st-color-brand-primary` | `--st-color-brand-primary` | `--st-color-white` | — | — | `pointer` |
| Hover | `--st-color-void-900` | `--st-color-void-900` | `--st-color-white` | `translateY(-2px)` | `--st-shadow-pink-glow` | `pointer` |
| Focus | same as hover | same as hover | same as hover | same as hover | same as hover + 2px outline | `pointer` |
| Disabled | — | — | — | — | — | `not-allowed` |

### Secondary variant

| State | Background | Border | Label | Transform | Shadow | Cursor |
|---|---|---|---|---|---|---|
| Default | `--st-color-lime-500` | `--st-color-lime-500` | `--st-color-void-900` | — | — | `pointer` |
| Hover | `--st-color-lime-500` | `--st-color-lime-500` | `--st-color-void-900` | `translateY(-2px)` | `--st-shadow-lime-glow` | `pointer` |
| Focus | same as hover | same as hover | same as hover | same as hover | same as hover + 2px outline | `pointer` |
| Disabled | — | — | — | — | — | `not-allowed` |

### Tertiary variant

| State | Background | Border | Label | Transform | Shadow | Cursor |
|---|---|---|---|---|---|---|
| Default | `transparent` | `--st-color-brand-primary` | `--st-color-brand-primary` | — | — | `pointer` |
| Hover | `--st-color-accent-soft` | `--st-color-brand-primary` | `--st-color-brand-primary` | `translateY(-2px)` | `--st-shadow-pink-glow` | `pointer` |
| Focus | same as hover | same as hover | same as hover | same as hover | same as hover + 2px outline | `pointer` |
| Disabled | — | — | — | — | — | `not-allowed` |

> Disabled state is achieved via `opacity: 0.5` on the entire element — do not
> build separate fill colours for disabled in Figma. Use the component's
> base colour with 50% opacity applied to the container layer.

---

## Hover Effect

All variants lift on hover via `transform: translateY(-2px)` with a brand-coloured glow shadow:

| Variant | Shadow token | Resolved value |
|---|---|---|
| Primary | `--st-shadow-pink-glow` | `0 4px 12px rgba(255, 36, 125, 0.3)` |
| Secondary | `--st-shadow-lime-glow` | `0 4px 12px rgba(209, 255, 29, 0.45)` |
| Tertiary | `--st-shadow-pink-glow` | `0 4px 12px rgba(255, 36, 125, 0.3)` |

---

## Sizing

| Property | Token | Resolved value |
|---|---|---|
| Padding (block / vertical) | `--st-space-2` | `0.5rem` (8px) |
| Padding (inline / horizontal) | `--st-space-4` | `1rem` (16px) |
| Border radius | `--st-radius-2` | `0.5rem` (8px) |
| Border width | — | `1px` |
| Font size | `--st-font-size-base` | `1rem` (16px) |
| Font weight | `--st-font-weight-semibold` | `600` |
| Font family | `--st-font-sans` | system-ui stack |
| Text transform | — | `uppercase` |
| Letter spacing | — | `0.06em` (~1px at 16px) |
| Transition | — | `transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease` |

---

## Focus Style

All variants use a 2px solid outline in the variant's primary colour, 2px offset from the container, applied via `:focus-visible` (WCAG 2.4.7).

| Variant | Outline colour | Token |
|---|---|---|
| Primary | `#ff247d` | `--st-color-brand-primary` |
| Secondary | `#D1FF1D` | `--st-color-lime-500` |
| Tertiary | `#ff247d` | `--st-color-brand-primary` |

---

## Loading State

No dedicated `loading` prop exists yet. The proxy pattern is `disabled: true` with label `"Loading…"`. In Figma, create a Loading variant using the disabled visual (50% opacity) with a spinner icon in the icon slot as a placeholder.

> **TODO (code):** Add `loading?: boolean` prop with spinner icon.

---

## Do / Don't

| | Rule |
|---|---|
| ✅ **Do** | Use `variant="secondary"` for supporting / high-visibility CTA alongside a Primary. |
| ✅ **Do** | Use `variant="tertiary"` for low-emphasis actions or ghost buttons over void/dark backgrounds. |
| ✅ **Do** | Keep to one Primary button per visual group. |
| ❌ **Don't** | Override button colours inline or via utility classes. All colour changes must go through the token system so they propagate to both Figma and code simultaneously. |
| ❌ **Don't** | Use Secondary (lime) as the sole CTA — lime reads as accent/supporting, not as the primary action. |

---

## Pink Moon Theme

**Marketing name:** Sugartown Pink Moon / Pink Moon
**Activation:** `data-st-theme="pink-moon"` on `:root` or any ancestor container.

Pink Moon is a theme evolution — not a redesign. It overrides Tier 2 semantic tokens to shift the system toward milky translucency, hairline borders, and gentle elevation. Pink moves from bold fill into edge-lighting, focus rings, and ambient glow. All component contracts, token governance, and accessibility targets remain unchanged; only resolved values differ.

### Theme token overrides

| Token | Default | Pink Moon |
|---|---|---|
| `--st-color-bg-surface` | `#FFFFFF` | `rgba(255, 255, 255, 0.72)` |
| `--st-color-bg-surface-strong` | `#FFFFFF` | `rgba(255, 255, 255, 0.86)` |
| `--st-color-border-default` | `rgba(13, 18, 38, 0.08)` | `rgba(13, 18, 38, 0.10)` |
| `--st-effect-backdrop-blur-md` | `0` | `14px` |
| `--st-effect-accent-glow` | `transparent` | `rgba(255, 36, 125, 0.18)` |
| `--st-shadow-elevation-float` | `var(--st-shadow-1)` | `0 12px 30px rgba(13, 18, 38, 0.10)` |

### Button in Pink Moon

All three variants adopt a **frosted glass pill** substrate. Variant identity shifts from fill colour to **inset edge-light**.

| Property | Pink Moon value |
|---|---|
| Background | `--st-color-bg-surface` — 72% white |
| Border | `--st-color-border-default` — hairline void |
| Border radius | `--st-radius-full` — pill |
| Backdrop filter | `blur(var(--st-effect-backdrop-blur-md))` — 14px |
| Base shadow | `--st-shadow-sm` |
| Hover background | `--st-color-bg-surface-strong` — 86% white |
| Hover transform | `translateY(-2px)` |
| Hover shadow | `--st-shadow-elevation-float` |
| Focus ring | 2px solid `--st-color-brand-primary` (#ff247d), 2px offset — unchanged |

#### Variant edge-lights in Pink Moon

| Variant | Default inset edge | Hover inset edge | Additional hover |
|---|---|---|---|
| Primary | `rgba(255, 36, 125, 0.28)` | `rgba(255, 36, 125, 0.50)` | `0 0 14px --st-effect-accent-glow` (pink ambient) |
| Secondary | `rgba(209, 255, 29, 0.40)` | `rgba(209, 255, 29, 0.65)` | — |
| Tertiary | `border-color rgba(255, 36, 125, 0.38)` | `border-color rgba(255, 36, 125, 0.65)` | `0 0 14px --st-effect-accent-glow` (pink ambient) |

### Figma guidance (Pink Moon)

- Replace solid fills with **Fill → Solid White @ 72% opacity** + **Background Blur: 14**
- Borders become **1px stroke, Void 900 @ 10% opacity**
- Variant identity is expressed via **inner stroke** (not fill) at the variant's brand colour, 28–50% opacity
- Border radius: **Radius = ∞** (pill shape)
- Hover: increase inner stroke to 50–65% opacity + drop shadow `0 12 30 Void @ 10%`
- Primary/Tertiary hover: add ambient glow `0 0 14 Pink @ 18%`

> **Structural note:** Pink Moon does not introduce new React component types or new token names.
> It is a pure CSS variable override layer. New frosted component patterns (cards, hero sections,
> filter bars, chips) will be specified separately when React implementations are scoped.
