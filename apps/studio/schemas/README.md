# Sugartown Studio — Schema Governance

## Quick reference

| Schema file | Type | Purpose |
|---|---|---|
| `documents/siteSettings.ts` | Singleton | Global site config: branding, nav, SEO defaults |
| `documents/navigation.ts` | Document | Reusable nav menus (header, footer, mobile) |
| `documents/preheader.ts` | Document | Announcement bar with scheduling |
| `documents/article.ts` | Document | Editorial content at `/articles/:slug` |
| `documents/caseStudy.ts` | Document | Work portfolio at `/case-studies/:slug` |
| `documents/node.ts` | Document | Knowledge graph at `/knowledge-graph/:slug` |
| `documents/page.ts` | Document | General pages at `/:slug` |
| `documents/archivePage.ts` | Document | Archive index pages (config only) |
| `documents/person.ts` | Document | People taxonomy |
| `documents/project.ts` | Document | Project taxonomy |
| `documents/category.ts` | Document | Category taxonomy |
| `documents/tag.ts` | Document | Tag taxonomy |
| `objects/seoMetadata.ts` | Object | Embedded SEO (title, description, OG, robots) |
| `objects/link.ts` | Object | Reusable link (url + label + openInNewTab + icon) |
| `objects/richImage.ts` | Object | Image with alt, caption, credit, overlay |

---

## Site Settings Governance

**File:** `documents/siteSettings.ts`
**Type:** Singleton (`__experimental_singleton: true`)

### What lives here

| Group | Field | Notes |
|---|---|---|
| General | `siteTitle` | Required. Used in SEO fallbacks and copyright line |
| General | `tagline` | Short strapline; renders in footer with lime colour |
| General | `siteLogo` | Header logo. Also footer fallback if `footerLogo` is not set |
| General | `favicon` | PNG/ICO/SVG. 32×32 or 64×64 recommended |
| Header | `primaryNav` | Reference → navigation document |
| Header | `headerCta` | Reference → ctaButtonDoc |
| Header | `preheader` | Reference → preheader document |
| Footer | `footerLogo` | Optional. If set, overrides `siteLogo` in the footer only |
| Footer | `footerColumns` | Array of navigation references (max 4) |
| Footer | `socialLinks` | Array of link objects with icon |
| Footer | `copyrightText` | Appended after "© {year} {siteTitle}." |
| SEO | `siteUrl` | Production base URL — no trailing slash |
| SEO | `defaultMetaTitle` | Fallback for pages with no custom SEO |
| SEO | `defaultMetaDescription` | Fallback description |
| SEO | `defaultOgImage` | Fallback social share image |

### What does NOT live here

**Brand colors.** Do not add color picker fields to Site Settings.
The frontend never reads `siteSettings.brandColors.*` — colors are managed
exclusively via CSS custom properties in the design token files:

- **Canonical:** `packages/design-system/src/styles/tokens.css`
- **Web mirror:** `apps/web/src/design-system/styles/tokens.css`

Both files must be kept in sync. A token that exists in one but not the other
causes `guaranteed-invalid` CSS values (browser falls back to UA defaults).

---

## Navigation — Typed Link Migration

**File:** `documents/navigation.ts`

Nav items support three link types. Use the `linkType` radio to select:

| `linkType` | Field shown | URL resolution |
|---|---|---|
| `internal` | `internalPage` (reference → page) | `/${page.slug}` — survives slug changes |
| `archive` | `archiveRef` (reference → archivePage) | `/${archivePage.slug}` — survives slug changes |
| `external` | `externalUrl` + `openInNewTab` | Raw URL, user-supplied |

**Legacy `link` field** is hidden in Studio but preserved in the schema for backward
compatibility. Existing nav items stored as `link.url` will continue to resolve in
the frontend via the `default` branch of `resolveNavLink()`. Migrate items one-by-one
by selecting a `linkType`.

**Frontend resolver:** `apps/web/src/lib/resolveNavUrl.js` → `resolveNavLink(item)`

---

## SEO Metadata — Auto-Generate Toggle

**File:** `objects/seoMetadata.ts`

The `autoGenerate` toggle (default: `true`) controls whether the `title` field is visible:

- **ON (default):** Title field is hidden. The frontend derives the title at render time
  from the document's `title`, excerpt, or body text via `resolveSeo()` in `apps/web/src/lib/seo.js`.
- **OFF:** Title field appears. Enter an exact override for search engines.

`description` is always visible — it overrides the auto-generated description in both modes.

**Fallback chain** (resolved in `resolveSeo()`):
```
page.seo.title → page.title → siteSettings.defaultMetaTitle
page.seo.description → excerpt/body → siteSettings.defaultMetaDescription
page.seo.openGraph.image → siteSettings.defaultOgImage
```

---

## Token Rules (enforced)

1. **No hex values in component CSS.** Use `var(--st-color-*)` tokens only.
2. **No hex fallbacks** in `var()` calls — fallbacks bypass the token layer and
   bake stale values into the build.
3. **Token drift:** When adding/renaming/removing a token, update **both** canonical
   files in the same commit. CI will catch drift once the token-lint script is added.
4. **Semantic over primitive:** Prefer `var(--st-color-brand-primary)` over
   `var(--st-color-pink-500)` in component CSS so theme overrides propagate.

---

*Last updated: EPIC-0150 (2026-03-01)*
