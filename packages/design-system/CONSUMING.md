# Consuming the Sugartown Design System

How to apply a brand theme to a new app that uses `packages/design-system`.

Sections 1–7 cover theming. **[Section 8](#8-wire-the-link-seam-navigation) covers
navigation** — if your app is client-routed (Next.js, React Router), wire the link
seam or every DS link will trigger a full page load.

---

## 1. Install

Add the DS package to your app via pnpm workspace reference:

```json
// apps/your-app/package.json
{
  "dependencies": {
    "@sugartown/design-system": "workspace:*"
  }
}
```

Run `pnpm install` from the repo root.

---

## 2. Import the base style layer

In your app entry point (e.g. `main.jsx`, `_app.tsx`, `layout.tsx`):

```js
import '@sugartown/design-system/styles/tokens.css'
import '@sugartown/design-system/styles/globals.css'
import '@sugartown/design-system/styles/utilities.css'
import '@sugartown/design-system/styles/theme.pink-moon.css'  // base theme — always required
```

`tokens.css` defines all `--st-*` primitives and semantic defaults. `theme.pink-moon.css` overrides semantics for the Pink Moon brand. Import your brand theme file on top of this base layer.

---

## 3. Create a brand theme file

Theme files override Tier 2 semantic tokens only. They must not:
- Introduce new `--st-*` token names (names are owned by the DS namespace)
- Use raw colour values (hex, rgba, hsla) — only `var(--st-primitive)` references
- Redeclare primitives already defined in `tokens.css`

Naming convention: `theme.<brand>.css`

```css
/* theme.shop.css — example: commerce brand using amber accent */

[data-theme~="light-shop"],
[data-theme="light-shop"] {
  --st-color-brand-primary: var(--st-color-amber-600);
}

[data-theme~="dark-shop"],
[data-theme="dark-shop"] {
  --st-color-brand-primary: var(--st-color-amber-600);
}
```

The `~=` attribute selector supports additive themes: `data-theme="light-pink-moon light-shop"` activates the Pink Moon base and the shop brand override simultaneously. Always include the exact-match variant (`[data-theme="light-shop"]`) for contexts where only the brand theme is set.

If your brand requires a new colour that has no matching primitive in `tokens.css`, add the primitive to `tokens/source/tokens.json` and run `pnpm tokens:build` first — then reference the generated primitive in your theme file.

---

## 4. Activate the theme

Set `data-theme` on the root `<html>` element. Combine the base Pink Moon mode with your brand override:

```html
<!-- Light base + shop brand -->
<html data-theme="light-pink-moon light-shop">

<!-- Dark base + shop brand -->
<html data-theme="dark-pink-moon dark-shop">
```

For a React SPA, set this in the app entry:

```js
document.documentElement.setAttribute('data-theme', 'light-pink-moon light-shop')
```

For SSR/static output, include an inline script before the first render to avoid a theme flash:

```html
<script>
  (function () {
    var t = localStorage.getItem('st-theme')
    var valid = ['light-pink-moon light-shop', 'dark-pink-moon dark-shop']
    document.documentElement.setAttribute(
      'data-theme',
      valid.indexOf(t) !== -1 ? t : 'light-pink-moon light-shop'
    )
  })()
</script>
```

---

## 5. Required vs optional token overrides

**Required** — all consuming apps must resolve these (they have defaults in `tokens.css` but may look wrong for your brand):

| Token | What it controls | Example override |
|-------|-----------------|------------------|
| `--st-color-brand-primary` | Primary accent colour — buttons, links, active states | `var(--st-color-amber-600)` |

**Optional** — override only if your brand diverges from Pink Moon defaults:

| Token | What it controls |
|-------|-----------------|
| `--st-color-brand-secondary` | Secondary accent |
| `--st-color-bg-surface` | Card and panel backgrounds |
| `--st-color-bg-page` | Page background |
| `--st-color-text-primary` | Body text |
| `--st-color-text-secondary` | Subdued / metadata text |
| `--st-font-family-heading` | Heading typeface |
| `--st-font-family-body` | Body typeface |
| `--st-font-family-mono` | Code / label typeface |

Do not override tokens that are not listed here without first checking whether the token is used across enough components to justify the change.

---

## 6. Register your theme file in validate:style-mirror

The DS package and the web app each carry a copy of every theme file. They must be byte-identical. Register your new theme in `apps/web/scripts/validate-style-mirror.js`:

```js
const MIRRORED = [
  'tokens.css',
  'theme.pink-moon.css',
  'theme.light.css',
  'theme.shop.css',
  'your-theme.css',   // ← add here
  'globals.css',
  'utilities.css',
]
```

Place the file in both:
- `apps/web/src/design-system/styles/your-theme.css` (canonical — edit here)
- `packages/design-system/src/styles/your-theme.css` (mirror — copy with `cp`)

Run `pnpm validate:style-mirror` to confirm zero drift. This check runs as a pre-commit hook.

---

## 7. Add your theme to Storybook

In `apps/storybook/.storybook/preview.ts`:

1. Import the theme CSS file:
   ```ts
   import '../../../packages/design-system/src/styles/theme.shop.css'
   ```

2. Add a background entry to `THEME_BG`:
   ```ts
   const THEME_BG: Record<string, string> = {
     'dark-pink-moon':        '#0D1226',
     'light-pink-moon':       '#ffffff',
     'light-pink-moon light-shop': '#ffffff',   // ← add
   }
   ```

3. Add toolbar items:
   ```ts
   items: [
     { value: 'light-pink-moon',            title: 'Pink Moon Light (default)' },
     { value: 'dark-pink-moon',             title: 'Pink Moon Dark' },
     { value: 'light-pink-moon light-shop', title: 'Shop Light' },   // ← add
   ],
   ```

---

## 8. Wire the link seam (navigation)

The package renders no router. `Card`, `Chip`, `Breadcrumb`, `IndexCell`, and `List`
resolve their links through an injectable seam, so each app supplies its own link
component (SUG-230).

**With nothing injected, every link is a plain `<a href>`.** That is the documented
default and it works — it just costs a full document load in a client-routed app.

### Next.js (App Router)

`next/link` already takes `href` plus the standard anchor attributes, so it is close to
a drop-in. The provider must be a client component; `children` stay server-rendered.

```tsx
// components/DesignSystemProvider.tsx
"use client";

import NextLink from "next/link";
import { LinkProvider } from "@sugartown/design-system";
import type { LinkRenderProps } from "@sugartown/design-system";

function NextLinkAdapter({ href, children, ...rest }: LinkRenderProps) {
  return <NextLink href={href} {...rest}>{children}</NextLink>;
}

export function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  return <LinkProvider component={NextLinkAdapter}>{children}</LinkProvider>;
}
```

```tsx
// app/layout.tsx — wrap the tree once
<body>
  <DesignSystemProvider>{children}</DesignSystemProvider>
</body>
```

### React Router

React Router's `Link` takes `to`, not `href`, so it needs a one-line adapter:

```jsx
import { Link as RouterLink } from 'react-router-dom'
import { LinkProvider } from '@sugartown/design-system'

function RouterLinkAdapter({ href, children, ...rest }) {
  return <RouterLink to={href} {...rest}>{children}</RouterLink>
}

// Mount inside the router, above your routes:
<BrowserRouter>
  <LinkProvider component={RouterLinkAdapter}>
    <App />
  </LinkProvider>
</BrowserRouter>
```

### Declare the adapter at module scope

`LinkProvider`'s `component` must be a **stable reference**. Declaring the adapter at
module scope (as above) is enough. Passing a fresh inline arrow:

```tsx
// Wrong — a new element type on every render
<LinkProvider component={props => <NextLink {...props} />}>
```

gives React a different component identity each render, which unmounts and remounts
every link beneath the provider, losing focus and DOM state. It fails quietly, so it is
worth getting right once.

### What the seam deliberately does not route

| Href | Falls back to `<a>` because |
|------|------------------------------|
| `https://…`, `mailto:…`, `tel:…`, any scheme | a router cannot navigate off-origin |
| `//cdn.example.com/…` (protocol-relative) | leaves the origin without naming a scheme |
| `#footnotes` (bare fragment) | a fragment is not a route |

A path that merely *contains* a hash (`/articles/x#section`) is a real route and is
routed normally.

The seam does **not** add `target="_blank"` / `rel="noopener noreferrer"` to external
links — whether an external link opens in a new tab is an app-level editorial choice.
Pass `target`/`rel` at the call site if you want it.

### Pass links via each component's own `href` props

Once the provider is mounted, do **not** wrap a DS component in your router's link:

```tsx
// Right
<Card title="…" href="/articles/slug" category={{ label: "…", href: "/categories/x" }} />
<Chip label="Vercel" href="/tags/vercel" />

// Wrong — Card renders its own internal links, so this nests anchors (invalid HTML)
<NextLink href="/articles/slug"><Card title="…" /></NextLink>
```

`Card` seams five links (title, category, project, footer category, KPI) and renders
`Chip`s internally for its tag and tool rows. Those inner chips read the same context,
so nothing needs threading through.

### Exports

```ts
import { LinkProvider, useLinkComponent, Link, isExternalHref, isFragmentHref } from '@sugartown/design-system'
import type { LinkComponent, LinkRenderProps, LinkProviderProps, LinkProps } from '@sugartown/design-system'
```

Reference implementation: `apps/contentful-poc/src/components/DesignSystemProvider.tsx`.
Live demo of both paths: Storybook → `Foundations/Link Seam`.

---

## Summary checklist for a new brand theme

- [ ] Brand colour primitives added to `tokens/source/tokens.json` and built via `pnpm tokens:build`
- [ ] `theme.<brand>.css` created in `apps/web/src/design-system/styles/`
- [ ] Mirrored to `packages/design-system/src/styles/` (byte-identical)
- [ ] Registered in `validate-style-mirror.js`
- [ ] `pnpm validate:style-mirror` passes
- [ ] `pnpm validate:tokens` passes
- [ ] `pnpm validate:tokens --strict-colors` passes (no raw colour values)
- [ ] Imported and added to Storybook theme switcher
- [ ] `data-theme` activation verified in the consuming app
- [ ] Link seam wired (section 8) if the app is client-routed — verified by clicking a
      Card title and confirming no full page reload
