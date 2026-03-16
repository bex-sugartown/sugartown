# Platform Behaviors Journal

> Non-obvious behaviors discovered through debugging. Each entry prevents re-learning
> the same lesson. Organized by platform.

---

## Sanity

### `previewDrafts` perspective strips `drafts.` prefix from all `_id` values

**Discovered:** 2026-03-16 (EPIC-0177 Preview UI)

The `previewDrafts` perspective returns draft content overlaid on published content, but it **strips the `drafts.` prefix from ALL `_id` values** — including documents that are draft-only (never published).

This means:
- `_id.startsWith('drafts.')` will **never** be true in `previewDrafts` perspective
- GROQ subqueries like `defined(*[_id == ("drafts." + ^._id)][0])` also run in the same perspective, so they also can't see the `drafts.` prefix
- `_id in path("drafts.**")` returns nothing

**Workaround:** Create a second Sanity client with `perspective: 'raw'` to query actual `_id` values:
```js
export const rawClient = createClient({ ...config, perspective: 'raw' })
// Then: rawClient.fetch(`*[_type == $type && _id in path("drafts.**")]._id`, { type })
```

**Files affected:** `apps/web/src/lib/sanity.js` (rawClient), `apps/web/src/lib/useSanityDoc.js` (useDraftIds, useDocHasDraft)

---

## Vite

### CSS `@import url()` inside JS-imported CSS files may be stripped

**Discovered:** Pre-EPIC era (Google Fonts loading)

Vite 7 preserves CSS `@import` in CSS files that are loaded as CSS (e.g. `<link>` tags or CSS `@import` chains). But `@import url()` inside a CSS file that is imported from JS/JSX (e.g. `import './App.css'`) may be silently stripped.

**Workaround:** Load external CSS (Google Fonts) only from sanctioned locations:
- Web app: `@import url()` in `apps/web/src/design-system/styles/globals.css`
- Storybook: `<link>` tags in `apps/storybook/.storybook/preview-head.html`

**Files affected:** See MEMORY.md §Google Fonts Loading Rules

---

## React / PortableText

### Multiple serializer instances — marks must be registered in ALL of them

**Discovered:** 2026-03-16 (EPIC-0177/0178)

`@portabletext/react` renders unknown marks with CSS class `unknown__pt__mark__X` — no error, no console warning. If a mark (e.g. `citationRef`) is registered in one PortableText `components` object but not another, it silently fails in the second renderer.

The codebase has multiple PortableText serializer configs (see MEMORY.md §PortableText Serializer Registry). When adding a new mark or block type, ALL instances must be updated.

**Detection:** Search for `unknown__pt__mark__` in the browser DOM. If present, a mark handler is missing.

---
