# EPIC — PortableText Link & Divider Updates

**Epic ID:** (unassigned — backlog)
**Surface:** `apps/studio` + `apps/web`
**Priority:** 🟣 Soon
**Created:** 2026-03-15

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — The `link` annotation already exists in `portableTextConfig.ts` as a simple `{ href, openInNewTab }` object. The `linkItem` schema object (`apps/studio/schemas/objects/linkItem.ts`) already supports `internal` / `external` link types with reference resolution — but is NOT used in PortableText annotations. This epic extends the existing PT `link` annotation to support internal references (reusing the `linkItem` pattern), and adds a `divider` custom block type. On the web side, link rendering is currently duplicated across 3 components (`PageSections.jsx`, `ContentBlock.jsx`, `CardBuilderSection.jsx`) — none use the shared `linkUtils.js`. This epic consolidates to a single shared PT component set.
- [x] **Use case coverage** — Link annotation must support: (1) external URLs (http/https), (2) internal page references (page, article, caseStudy, node, archivePage), (3) mailto/tel URIs, (4) relative paths. Divider must support: horizontal rule between content blocks.
- [x] **Layout contract** — Divider: full-width `<hr>` within the content column, inheriting the parent's `max-width`. Vertical spacing: `var(--st-spacing-stack-lg)` above and below. No layout impact beyond the rule itself.
- [x] **All prop value enumerations** — Link `type` field: `internal` | `external` (matches `linkItem.ts` pattern). No other enums.
- [x] **Correct audit file paths** — verified:
  - `apps/studio/schemas/objects/portableTextConfig.ts` — PT configs (summary, standard, minimal)
  - `apps/studio/schemas/objects/linkItem.ts` — existing internal/external link schema
  - `apps/web/src/components/PageSections.jsx` — PT link renderer (inline, not shared)
  - `apps/web/src/components/ContentBlock.jsx` — PT link renderer (inline, duplicated)
  - `apps/web/src/components/CardBuilderSection.jsx` — PT link renderer (inline, duplicated)
  - `apps/web/src/components/portableTextComponents.jsx` — shared PT serializer (does NOT handle links currently)
  - `apps/web/src/lib/linkUtils.js` — `isExternalUrl()`, `getLinkProps()` (unused by PT renderers)
- [x] **Dark / theme modifier treatment** — Divider inherits border colour from `--st-color-border` token (already theme-aware). Link colours inherit from existing `--st-color-brand-primary` / `--st-color-text-link` tokens. No new tokens needed.
- [x] **Studio schema changes scoped** — Yes, two changes: (1) extend `link` annotation in `portableTextConfig.ts`, (2) add `divider` block type to PT configs. Both committed with `feat(studio):` prefix per convention.
- [x] **Web adapter sync scoped** — No DS component changes. All changes are in `apps/web` components and `apps/studio` schemas.

---

## Context

### Current link annotation

The `link` annotation in `portableTextConfig.ts` is a simple object:

```typescript
// Both summaryPortableText and standardPortableText
{
  name: 'link',
  type: 'object',
  fields: [
    { name: 'href', type: 'url', validation: uri(['http', 'https', 'mailto', 'tel']), allowRelative: true },
    { name: 'openInNewTab', type: 'boolean', initialValue: true }  // standardPortableText only
  ]
}
```

**Limitations:**
- External URLs only — no way to link to an internal page by reference
- If a page slug changes, all PT links to that page break silently (hardcoded relative URLs)
- Editors must know the target URL to create an internal link

### Existing internal link pattern (`linkItem.ts`)

The `linkItem` schema already supports internal references:

```typescript
{
  name: 'type',           // 'internal' | 'external'
  name: 'internalRef',    // reference to page, article, caseStudy, node, archivePage
  name: 'externalUrl',    // url field
  name: 'label',          // display text override
  name: 'openInNewTab',   // external only
}
```

This pattern is used for CTA buttons and navigation — but NOT for PortableText inline links.

### Link rendering (web) — duplicated 3×

Three components each implement their own PT link renderer with slightly different logic:

| Component | Detection method | Uses `linkUtils.js`? | Uses React Router `<Link>`? | Respects `openInNewTab`? |
|-----------|-----------------|---------------------|---------------------------|------------------------|
| `PageSections.jsx` | `href?.startsWith('http')` | No | No | No (hardcoded from URL prefix) |
| `ContentBlock.jsx` | `href?.startsWith('http')` | No | No | No |
| `CardBuilderSection.jsx` | `href?.startsWith('http')` | No | No | No |

All three should be consolidated into `portableTextComponents.jsx` using `getLinkProps()` from `linkUtils.js`.

### Divider support

No divider or separator block type exists anywhere in the PortableText configuration. Editors currently have no way to insert a horizontal rule between content blocks.

---

## Objective

Extend the PortableText `link` annotation to support internal page references (matching the `linkItem` pattern already used elsewhere), and add a `divider` custom block type for horizontal rules. Consolidate the 3 duplicated link renderers into a single shared component that uses `linkUtils.js` and React Router `<Link>` for internal navigation.

**Data layer:** Extend `link` annotation schema in `portableTextConfig.ts` to support `type: 'internal' | 'external'` with conditional fields. Add `divider` block type to `standardPortableText` and `summaryPortableText`.
**Query layer:** Update GROQ projections for sections/content that use PortableText to dereference `internalRef` on link marks.
**Render layer:** Create shared `LinkAnnotation` and `DividerBlock` components in `portableTextComponents.jsx`. Remove duplicated link renderers from `PageSections.jsx`, `ContentBlock.jsx`, `CardBuilderSection.jsx`.

---

## Doc Type Coverage Audit

This epic modifies the PortableText schema objects, which are consumed by `sections[]` on all content types. The PT config is shared — changes apply wherever `standardPortableText` or `summaryPortableText` is used.

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | ✅ Yes | Uses `sections[]` with `textSection` (standardPortableText) |
| `article` | ✅ Yes | Uses `sections[]` with `textSection`; also has legacy `content[]` (standardPortableText) |
| `caseStudy` | ✅ Yes | Uses `sections[]` with `textSection` |
| `node` | ✅ Yes | Uses `sections[]` with `textSection`; also has legacy `content[]` |
| `archivePage` | ✅ Yes | `description` field uses `text` today (upgrade to `summaryPortableText` is in EPIC-studio-ux-polish — this epic's link changes will apply there too) |

---

## Scope

### 1. Studio schema — extend `link` annotation

- [ ] Modify `link` annotation in `portableTextConfig.ts` to support internal references:
  - Add `type` field: `string`, options `'internal' | 'external'`, default `'external'`, layout `'radio'`
  - Add `internalRef` field: `reference` to `[page, article, caseStudy, node, archivePage]`, hidden when `type !== 'internal'`
  - Rename existing `href` to `externalUrl` (or keep as `href` with conditional visibility), hidden when `type !== 'external'`
  - Keep `openInNewTab` for external links only
- [ ] Apply to both `summaryPortableText` and `standardPortableText` annotations
- [ ] `minimalPortableText` — no change (no marks/annotations by design)
- [ ] Verify Studio hot-reloads without errors and the link annotation dialog shows type toggle

**Decision at activation:** Keep the existing `href` field name and add `type` + `internalRef` alongside it (backward compatible — existing `href` values still work), OR rename `href` → `externalUrl` to match `linkItem` naming (requires migration of existing PT link marks). Recommend: keep `href` for backward compat, add `type` and `internalRef` as new optional fields. When `type` is absent, treat as external (legacy behaviour).

### 2. Studio schema — add `divider` block type

- [ ] Add `divider` custom block type to `portableTextConfig.ts`:
  ```typescript
  defineArrayMember({
    name: 'divider',
    type: 'object',
    title: 'Divider',
    icon: MinusIcon,  // from @sanity/icons
    fields: [
      defineField({
        name: 'style',
        type: 'string',
        title: 'Style',
        options: { list: [
          { title: 'Default', value: 'default' },
          { title: 'Subtle', value: 'subtle' },
        ]},
        initialValue: 'default',
      })
    ],
    preview: {
      prepare: () => ({ title: '── Divider ──' })
    }
  })
  ```
- [ ] Add to `standardPortableText` block types (alongside `richImage`, `codeBlock`, `tableBlock`)
- [ ] Add to `summaryPortableText` block types (dividers are useful even in short text)
- [ ] `minimalPortableText` — no change

### 3. GROQ projection updates

- [ ] Update GROQ projections for PortableText content that includes `markDefs`:
  ```groq
  markDefs[] {
    ...,
    _type == "link" && type == "internal" => {
      "internalType": internalRef->_type,
      "internalSlug": internalRef->slug.current
    }
  }
  ```
- [ ] Apply to every query that projects PortableText with link annotations (see Query Layer Checklist)

### 4. Web — shared link annotation component

- [ ] Create or extend `apps/web/src/components/portableTextComponents.jsx` with a `LinkAnnotation` component:
  ```jsx
  function LinkAnnotation({ value, children }) {
    // Determine href: internal ref → getCanonicalPath(), external → value.href
    const href = value?.type === 'internal' && value?.internalSlug
      ? getCanonicalPath({ docType: value.internalType, slug: value.internalSlug })
      : value?.href || value?.externalUrl

    if (!href) return <>{children}</>

    const { isExternal, linkProps } = getLinkProps(href, value?.openInNewTab)
    return isExternal
      ? <a {...linkProps}>{children}</a>
      : <Link {...linkProps}>{children}</Link>
  }
  ```
- [ ] Export from `portableTextComponents.jsx` as part of the shared component set
- [ ] Remove duplicated link renderers from `PageSections.jsx`, `ContentBlock.jsx`, `CardBuilderSection.jsx`
- [ ] Verify internal links use React Router `<Link>` (SPA navigation, no full page reload)
- [ ] Verify external links open in new tab with `rel="noopener noreferrer"`
- [ ] Verify mailto/tel links render as plain `<a>` with no `target="_blank"`

### 5. Web — divider block component

- [ ] Add `DividerBlock` component to `portableTextComponents.jsx`:
  ```jsx
  function DividerBlock({ value }) {
    const style = value?.style || 'default'
    return <hr className={`${styles.divider} ${styles[`divider--${style}`]}`} />
  }
  ```
- [ ] CSS in `portableTextComponents.module.css` (or `PageSections.module.css` if that's where PT styles live):
  ```css
  .divider {
    border: none;
    border-top: 1px solid var(--st-color-border);
    margin-block: var(--st-spacing-stack-lg);
    width: 100%;
  }
  .divider--subtle {
    opacity: 0.4;
  }
  ```
- [ ] Register `divider` type handler in all PT renderer configurations

### 6. Backward compatibility

- [ ] Existing PT content with `link` marks that only have `href` (no `type` field) must still render correctly
- [ ] Fallback: if `type` is absent, treat as external link (legacy behaviour)
- [ ] No migration script needed for existing link marks — the schema extension is additive

---

## Query Layer Checklist

Every slug query that projects PortableText sections with `markDefs` needs the internal link dereference:

- [ ] `pageBySlugQuery` — sections[].content markDefs dereference for internal links
- [ ] `articleBySlugQuery` — sections[].content + legacy content[] markDefs
- [ ] `caseStudyBySlugQuery` — sections[].content markDefs
- [ ] `nodeBySlugQuery` — sections[].content + legacy content[] markDefs
- [ ] Archive queries (`allArticlesQuery`, `allCaseStudiesQuery`, `allNodesQuery`) — excluded: archive cards don't render PT content inline. No change needed.

---

## Schema Enum Audit

| Field name | Schema file | `value` → Display title |
|-----------|-------------|--------------------------|
| `link.type` | `portableTextConfig.ts` | `internal` → Internal Page, `external` → External URL |
| `divider.style` | `portableTextConfig.ts` | `default` → Default, `subtle` → Subtle |

---

## Metadata Field Inventory

N/A — no MetadataCard changes.

---

## Themed Colour Variant Audit

| Surface / component | Dark | Light | Pink Moon | Token(s) to set |
|---------------------|------|-------|-----------|-----------------|
| Divider border | `var(--st-color-border)` | `var(--st-color-border)` | `var(--st-color-border)` | Inherits — no new token needed |
| Link text colour | `var(--st-color-brand-primary)` | `var(--st-color-brand-primary)` | `var(--st-color-brand-primary)` | Inherits — no new token needed |

Both surfaces inherit from existing theme-aware tokens. No per-theme overrides needed.

---

## Non-Goals

- Does **not** add a full WYSIWYG link picker with URL preview/validation — the Studio annotation dialog is sufficient
- Does **not** migrate existing `href` values to the new `type: 'external'` shape — backward compat handles this
- Does **not** add anchor link support (linking to `#heading-id` within the same page) — separate concern
- Does **not** change the `linkItem` schema object — that remains for CTAs and navigation
- Does **not** add divider to `minimalPortableText` — minimal config is intentionally restrictive

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`
- No migration scripts needed — schema extension is additive

**Schema (Studio)**
- `portableTextConfig.ts` exports reusable PT configurations consumed by section schemas
- Annotations are `defineArrayMember` entries in the `marks.annotations` array
- Custom block types are `defineArrayMember` entries in the `of` array (alongside `block`)
- The `link` annotation name must remain `'link'` — Sanity's default PT editor binds keyboard shortcuts (Cmd+K) to annotations named `'link'`
- **Explicit field types:**
  - `link.type`: `string` (radio, options: `internal` | `external`)
  - `link.internalRef`: `reference` (to: `page`, `article`, `caseStudy`, `node`, `archivePage`)
  - `link.href`: `url` (existing, kept for backward compat)
  - `link.openInNewTab`: `boolean`
  - `divider.style`: `string` (dropdown, options: `default` | `subtle`)

**Query (GROQ)**
- PortableText `markDefs` are stored inline in the content array — they need explicit dereferencing for references
- The `internalRef->` dereference must resolve `_type` and `slug.current` so the web renderer can call `getCanonicalPath()`
- Projection must be added to every query that projects PT content blocks (see Query Layer Checklist)

**Render (Frontend)**
- `@portabletext/react` uses `components.marks` for annotations and `components.types` for custom block types
- The `link` mark component receives `{ value, children }` where `value` is the annotation object from `markDefs`
- Internal links must use React Router `<Link to={path}>` for SPA navigation (no full page reload)
- External links must use `<a href={url} target="_blank" rel="noopener noreferrer">`
- `getLinkProps()` from `linkUtils.js` already handles this distinction — use it

---

## Files to Modify

**Studio**
- `apps/studio/schemas/objects/portableTextConfig.ts` — extend `link` annotation, add `divider` block type

**Frontend**
- `apps/web/src/components/portableTextComponents.jsx` — add `LinkAnnotation` and `DividerBlock` components
- `apps/web/src/components/portableTextComponents.module.css` — CREATE if needed, or add to existing CSS module for PT styles
- `apps/web/src/components/PageSections.jsx` — remove inline link renderer, use shared component
- `apps/web/src/components/ContentBlock.jsx` — remove inline link renderer, use shared component
- `apps/web/src/components/CardBuilderSection.jsx` — remove inline link renderer, use shared component
- `apps/web/src/lib/queries.js` — add `markDefs` dereference projection to 4 slug queries

---

## Deliverables

1. **Schema — link annotation** — `link` annotation in `portableTextConfig.ts` supports `type: 'internal' | 'external'` with conditional `internalRef` / `href` fields
2. **Schema — divider** — `divider` custom block type exists in `standardPortableText` and `summaryPortableText`
3. **GROQ projections** — all 4 slug queries dereference `internalRef` in `markDefs` for internal links
4. **Shared link component** — `LinkAnnotation` in `portableTextComponents.jsx` uses `getLinkProps()` and React Router `<Link>`
5. **Shared divider component** — `DividerBlock` in `portableTextComponents.jsx` renders themed `<hr>`
6. **Deduplication** — inline link renderers removed from `PageSections.jsx`, `ContentBlock.jsx`, `CardBuilderSection.jsx`

---

## Acceptance Criteria

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors
- [ ] Studio hot-reloads; link annotation dialog shows type toggle (Internal Page / External URL)
- [ ] Selecting "Internal Page" shows a reference picker for page, article, caseStudy, node, archivePage
- [ ] Selecting "External URL" shows the existing `href` field
- [ ] Studio: divider block appears in the "Insert" menu for `standardPortableText` and `summaryPortableText` fields
- [ ] Studio: divider renders as "── Divider ──" in the editor preview
- [ ] Web: existing content with plain `href` links (no `type` field) still renders correctly (backward compat)
- [ ] Web: new internal links navigate via React Router (no full page reload) — verify with browser devtools Network tab
- [ ] Web: new external links open in new tab with `rel="noopener noreferrer"`
- [ ] Web: mailto/tel links render as plain `<a>` with no `target="_blank"`
- [ ] Web: divider renders as a themed `<hr>` with correct spacing (`--st-spacing-stack-lg`) in both dark and light themes
- [ ] Web: divider "subtle" variant renders at reduced opacity
- [ ] Inline link renderers removed from `PageSections.jsx`, `ContentBlock.jsx`, `CardBuilderSection.jsx` — all PT link rendering goes through `portableTextComponents.jsx`
- [ ] GROQ: slug queries return `internalType` and `internalSlug` for internal link marks
- [ ] **Visual QA:** render a page with both internal and external links, plus a divider. Verify at desktop and mobile breakpoints. Check link colours match `--st-color-brand-primary` in both themes.

---

## Risks / Edge Cases

**Schema risks**
- [ ] The `link` annotation name must remain `'link'` — renaming breaks Sanity's Cmd+K keyboard shortcut binding
- [ ] `internalRef` references must include all doc types that have slugs — missing a type means editors can't link to it
- [ ] Conditional field visibility (`hidden` based on `type`) must work in the annotation popup dialog, not just full document forms — verify in Studio

**Query risks**
- [ ] `internalRef->` dereference adds a join to every PT content query — performance impact should be negligible for single-document fetches but verify on the slowest page
- [ ] If `internalRef` points to a deleted/unpublished document, the dereference returns null — the `LinkAnnotation` component must handle `null` slug gracefully (render as plain text, not a broken link)
- [ ] All 4 slug queries in the Query Layer Checklist have been updated — do NOT rely on memory

**Render risks**
- [ ] Backward compatibility: existing link marks without `type` field must still render. The `LinkAnnotation` component must check `value?.type === 'internal'` with explicit equality — not truthiness, since absent `type` should fall through to external
- [ ] React Router `<Link>` must only be used for internal paths, never for external URLs or mailto/tel — the `getLinkProps()` utility already handles this correctly
- [ ] Deduplicating link renderers across 3 files — verify no component has custom link styling that would be lost

---

## Post-Epic Close-Out

1. **Activate the epic file:**
   - Assign the next sequential EPIC number (check `docs/prompts/` for the latest)
   - Move: `docs/backlog/EPIC-portable-text-updates.md` → `docs/prompts/EPIC-{NNNN}-portable-text-updates.md`
   - Update the **Epic ID** field inside the file
   - Commit: `docs: activate EPIC-{NNNN} PortableText Link & Divider Updates`
2. **Confirm clean tree** — `git status` must show nothing staged or unstaged
3. **Run mini-release** — `/mini-release EPIC-{NNNN} PortableText Link & Divider Updates`
4. **Start next epic** — only after mini-release commit is confirmed

---

*Created 2026-03-15. Extends existing `link` annotation and deduplicates 3 inline PT link renderers. No migration script needed — schema changes are additive and backward compatible.*
