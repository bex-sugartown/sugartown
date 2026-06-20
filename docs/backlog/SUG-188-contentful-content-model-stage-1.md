---
**Epic:** SUG-188 — Contentful content model Stage 1 — siteSettings nav, navigationItem, homepage page entry
**Linear Issue:** [SUG-188](https://linear.app/sugartown/issue/SUG-188/contentful-content-model-stage-1-sitesettings-nav-navigationitem)
**Status:** Backlog
**Priority:** 🔴 Now (blocks SUG-179)
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-188 — Contentful content model Stage 1 — siteSettings nav, navigationItem, homepage page entry

Extend the Contentful `siteSettings` content type and add `navigationMenu`, `navigationItem`, and `socialLink` content types so the DS Header and Footer can be wired to real Contentful data in SUG-179. Add the homepage `page` entry. All content model design is reviewed and approved before any authoring begins.

## Background

`apps/contentful-poc` has article, tag, and page routes. The Contentful `siteSettings` singleton only has `siteTitle` and `metaDescription`.

The DS `Header` and `Footer` components (Storybook: `Regions/Header`, `Regions/Footer`) accept a `siteSettings` prop containing `{ primaryNav, headerCta, preheader, footerColumns, socialLinks, copyrightText, licenseLabel, licenseUrl, siteLogo }`. The Sanity `siteSettings` schema (at `apps/studio/schemas/documents/siteSettings.ts`) is the reference implementation for what fields exist and how they compose.

The key architectural difference: Sanity uses inline objects (`navItem`, `socialLink`) embedded in the document. Contentful's atomic/modular model uses linked content type entries — each navigation item, each nav menu, each social link is its own content entry that can be referenced and reused independently. This is the correct pattern for a Contentful content model.

A **Phase 0 content model review** is required before any Contentful Studio authoring begins. The proposed content type map must be approved before Phase 1 executes.

## Objective

After this epic, the Contentful space has:
- Four new content types: `navigationMenu`, `navigationItem`, `socialLink`, `ctaButton`
- An extended `siteSettings` content type with all fields the DS Header and Footer consume
- A populated `siteSettings` entry with real nav and footer data
- A `page` entry with `slug: "home"` with at minimum a hero section and an article teaser section
- Updated TypeScript types and `getSiteSettings()` query returning the new fields

No changes to `apps/web` or `packages/design-system`. Code changes are confined to `apps/contentful-poc/src/lib/`.

---

## Phase 0 — Content model review (HARD STOP)

**Do not proceed to Phase 1 until the content model proposal below is explicitly approved.**

The review gate exists because the Contentful content model is harder to change than Sanity's. Once content entries are created against a content type, field name changes require a migration. Getting the field names and relationships right before authoring starts is materially cheaper than fixing them after.

**To approve:** read the proposed content type map below and the field proposal tables. Respond with explicit sign-off ("approved", "yes", "looks good") or feedback on specific fields before Phase 1 begins.

---

## Proposed content type map

### Architectural approach: linked entries (atomic)

Contentful content types are distinct from Sanity schema objects in one critical way: in Contentful, every reusable concept should be its own content type with its own entries. This enables:
- Each nav item to be updated independently without touching the menu
- A menu to be reused in multiple contexts (primary nav and a footer column use the same `navigationMenu` type)
- Social links to be audited and updated from a single entry list

The Sanity schema uses inline objects (`navItem` is embedded in the `navigation` document; `socialLink` is embedded in `siteSettings`). Contentful's equivalent is linked entries.

### Content type inventory

| Content Type | Type | Maps to Sanity | Purpose |
|-------------|------|----------------|---------|
| `siteSettings` | Singleton (extend existing) | `siteSettings` document | Global site config: logo, nav refs, footer refs, SEO defaults |
| `navigationMenu` | Entry (new) | `navigation` document | Named ordered list of linked `navigationItem` entries. Used for `primaryNav` (one menu) and `footerColumns` (array of menus, each menu = one column) |
| `navigationItem` | Entry (new) | `navItem` inline object | Atomic nav link: label + URL + openInNewTab. Linked from `navigationMenu.items[]` |
| `socialLink` | Entry (new) | `socialLink` inline object | Platform + URL + optional accessibility label. Linked from `siteSettings.socialLinks[]` |
| `ctaButton` | Entry (new) | `ctaButtonDoc` document | Header CTA: label + URL + style enum + openInNewTab. Linked from `siteSettings.headerCta` |

**Why `navigationMenu` instead of putting `navigationItem[]` directly on `siteSettings`?**
Footer columns require multiple menus (one per column), each with its own heading. The `navigationMenu.title` field serves as the column heading in the footer. This is the same pattern Sanity uses: `footerColumns` is an array of `navigation` document references, not a flat array of links.

**Stage 1 scope boundary:** `preheader` is excluded. The Sanity preheader is a document type with announcement copy and a CTA. For the shop site Stage 1, no preheader is needed. Add it to `siteSettings` in a future content model epic if required.

**`footerToolchain` is excluded.** The Sanity footer toolchain chips (`/tools/:slug` links) are specific to `sugartown.io`. The shop site footer does not need them at Stage 1.

---

### Field proposal: `navigationItem` (new content type)

| Field | Type | Required | Maps to Sanity `navItem` field | Notes |
|-------|------|----------|-------------------------------|-------|
| `label` | Short text | Yes | `label` | Display text. Max 50 chars. |
| `url` | Short text | Yes | `externalUrl` or resolved from `internalPage.slug` | Plain URL string. Contentful shop site uses URL-based routing; no Sanity-style reference + slug resolution needed. Includes internal paths (`/articles`) and external URLs (`https://...`). |
| `openInNewTab` | Boolean | No | `openInNewTab` | Default: false. Shown for all items (not conditionally hidden like in Sanity). |

**Why plain URL string (not a linked entry reference)?** The shop site has no Sanity reference graph. There are no `page` entries with resolvable slugs for all routes. A plain URL string is correct for Stage 1. If the content model grows to support full internal reference resolution, that is a future content model epic.

---

### Field proposal: `navigationMenu` (new content type)

| Field | Type | Required | Maps to Sanity | Notes |
|-------|------|----------|---------------|-------|
| `title` | Short text | Yes | `navigation.title` (internal name) | Internal name and footer column heading. E.g. "Primary Nav", "Footer: Content", "Footer: Legal". |
| `items` | References (array, max 10) | Yes | `navigation.items[]` (`navItem` objects) | Links to `navigationItem` entries. Ordered. |

---

### Field proposal: `socialLink` (new content type)

| Field | Type | Required | Maps to Sanity `socialLink` object | Notes |
|-------|------|----------|-----------------------------------|-------|
| `platform` | Short text (enum) | Yes | `platform` | Values: `github`, `linkedin`, `twitter`, `instagram`, `youtube`, `rss`, `email`, `bluesky`. Displayed as icon using the same `SOCIAL_PLATFORM_OPTIONS` enum that drives Sanity. |
| `url` | URL | Yes | `url` | Full profile URL including protocol. |
| `label` | Short text | No | `label` | Accessibility override. Falls back to platform name if empty. |

---

### Field proposal: `ctaButton` (new content type)

| Field | Type | Required | Maps to Sanity `ctaButtonDoc` | Notes |
|-------|------|----------|-------------------------------|-------|
| `label` | Short text | Yes | `label` | Button text. |
| `url` | Short text | Yes | `url` | Target URL (internal or external). |
| `style` | Short text (enum) | No | `style` | Values: `primary`, `secondary`, `tertiary`. Default: `primary`. Maps to DS Button `variant` prop. |
| `openInNewTab` | Boolean | No | `openInNewTab` | Default: false. |

---

### Field proposal: `siteSettings` (extend existing)

Fields to add (all existing fields are preserved):

| Field | Type | Required | Maps to Sanity `siteSettings` | Notes |
|-------|------|----------|-------------------------------|-------|
| `siteLogo` | Asset (image) | No | `siteLogo` | Used in header logo. Contentful asset — direct URL, no `urlFor()` transformation needed. |
| `tagline` | Short text | No | `tagline` | Optional brand tagline. Used in footer brand zone. |
| `primaryNav` | Reference → `navigationMenu` | No | `primaryNav` | One menu entry. Required for Header to render nav links. |
| `headerCta` | Reference → `ctaButton` | No | `headerCta` | Optional. Header CTA button. |
| `footerLogo` | Asset (image) | No | `footerLogo` | Optional. Falls back to `siteLogo` if not set. |
| `footerColumns` | References → `navigationMenu[]` (max 4) | No | `footerColumns` | Array of navigation menu entries; each menu's `title` is the column heading. |
| `socialLinks` | References → `socialLink[]` (max 8) | No | `socialLinks` | Array of social link entries. |
| `copyrightText` | Short text | No | `copyrightText` | Footer colophon suffix. E.g. "All rights reserved." |
| `licenseLabel` | Short text | No | `licenseLabel` | E.g. "Content CC BY-NC 4.0 · Code MIT" |
| `licenseUrl` | URL | No | `licenseUrl` | Optional link for the license label. |
| `siteUrl` | URL | No | `siteUrl` | Production base URL. E.g. `https://poc.sugartown.io`. Used for canonical URLs and OG tags. |
| `defaultOgImage` | Asset (image) | No | `defaultOgImage` | Fallback OG image for social sharing. 1200x630px recommended. |

**Fields NOT added (deferred):** `preheader`, `footerToolchain`, `favicon`. None are needed for Stage 1 DS Header/Footer wiring.

---

### Homepage `page` entry

The existing `page` content type already exists in Contentful with a `sections` array. The homepage entry requires:

| Field | Value |
|-------|-------|
| `title` | "Home" |
| `slug` | `home` |
| `sections` | At minimum: one `heroSection` entry + one `articlesSection` entry |

The section content types already exist — no new section types are needed for Stage 1.

---

## Scope

- [ ] **Phase 0 review gate** — Content model proposal approved before any Contentful authoring — layer: content model design
- [ ] Create `navigationItem` content type in Contentful with fields: `label`, `url`, `openInNewTab` — layer: Contentful content model
- [ ] Create `navigationMenu` content type in Contentful with fields: `title`, `items[]` (linked `navigationItem` entries) — layer: Contentful content model
- [ ] Create `socialLink` content type in Contentful with fields: `platform` (enum), `url`, `label` — layer: Contentful content model
- [ ] Create `ctaButton` content type in Contentful with fields: `label`, `url`, `style` (enum), `openInNewTab` — layer: Contentful content model
- [ ] Extend existing `siteSettings` content type with all fields in the field proposal table above — layer: Contentful content model
- [ ] Populate `siteSettings` entry: `siteLogo`, `primaryNav` (linked `navigationMenu` with 3+ items), at least one `footerColumn`, `socialLinks` (at least 2 entries), `copyrightText` — layer: Contentful content (authoring)
- [ ] Create homepage `page` entry: `slug: "home"`, sections array with a `heroSection` and an `articlesSection` — layer: Contentful content (authoring)
- [ ] Update `SiteSettingsSkeleton` TypeScript type in `apps/contentful-poc/src/lib/contentful.ts` to reflect new fields and linked entry types — layer: TypeScript
- [ ] Update `getSiteSettings()` in `apps/contentful-poc/src/lib/queries.ts` with `include: 2` to resolve `navigationMenu → navigationItem` depth — layer: query

## Phases

**Phase 0 — Content model review (HARD STOP):** Proposal reviewed and approved before execution begins.
**Phase 1 — Content type creation:** `navigationItem`, `navigationMenu`, `socialLink`, `ctaButton` created in Contentful Studio. `siteSettings` extended with new fields.
**Phase 2 — Content authoring:** `siteSettings` entry populated with real nav/footer data. Homepage `page` entry created.
**Phase 3 — TypeScript + query update:** `SiteSettingsSkeleton` and `getSiteSettings()` updated. TypeScript check passes.

## Acceptance criteria

- [ ] Phase 0 approved (explicit sign-off received) before Phase 1 begins
- [ ] All four new content types exist in Contentful Space (visible in Content Model view in Studio)
- [ ] `siteSettings` entry has `primaryNav` linked to a `navigationMenu` with at least 3 `navigationItem` entries
- [ ] `siteSettings` entry has at least one `footerColumn` (`navigationMenu`) and at least 2 `socialLink` entries
- [ ] Homepage `page` entry with `slug: "home"` exists with at least 2 sections
- [ ] `getSiteSettings()` with `include: 2` resolves `primaryNav.items[].label` and `primaryNav.items[].url` correctly — verify in dev via `console.log`
- [ ] `pnpm --filter contentful-poc typecheck` passes with zero TypeScript errors

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. Verification is via `getSiteSettings()` return value in dev and TypeScript check.

## Technical notes

**Phase 0 hard stop:** Do not touch Contentful Studio until the content model proposal above has explicit approval. Field name changes after entry creation require a migration script in Contentful. Getting this right before authoring is cheaper.

**Contentful content model changes are live immediately.** Unlike Sanity schema deployment, Contentful content type changes take effect in Studio as soon as saved via the Contentful web app or Management API. No deployment step needed for the model.

**Linked entry depth — `include: 2`:** `getSiteSettings()` currently fetches with no `include` parameter. To resolve `siteSettings → navigationMenu → navigationItem[]`, `include: 2` is required. To also resolve `siteSettings → footerColumns[] → navigationMenu → navigationItem[]`, `include: 3` is needed. Measure the response size before committing to `include: 3` — Contentful's CDA `include` parameter multiplies the included entries payload.

**TypeScript type pattern (Contentful SDK):** `SiteSettingsSkeleton` uses `EntrySkeletonType`. Linked entries use `EntrySkeletonType` for the referenced type:
```ts
import type { EntrySkeletonType, Entry } from "contentful"

export type NavigationItemSkeleton = EntrySkeletonType<{
  label: ContentfulTypeMap['Symbol']
  url: ContentfulTypeMap['Symbol']
  openInNewTab?: ContentfulTypeMap['Boolean']
}, 'navigationItem'>

export type NavigationMenuSkeleton = EntrySkeletonType<{
  title: ContentfulTypeMap['Symbol']
  items: Entry<NavigationItemSkeleton>[]
}, 'navigationMenu'>
```

**Social platform enum:** Use the same platform values as Sanity's `SOCIAL_PLATFORM_OPTIONS` in `apps/studio/schemas/lib/iconOptions.ts`. Activation audit: read that file to get the exact platform values before defining the `socialLink.platform` enum in Contentful.

**Activation audit:** Before Phase 3, read `apps/contentful-poc/src/lib/contentful.ts` and `apps/contentful-poc/src/lib/queries.ts` to see the exact current `SiteSettingsSkeleton` shape and `getSiteSettings()` projection — do not assume the current state matches this doc.

**Model & Mode [REQUIRED]:** `/model sonnet` — content model authoring, TypeScript type updates. No architecture decisions once Phase 0 is approved.

## Non-Goals

- No `preheader` content type — not needed for Stage 1 DS wiring
- No `footerToolchain` field — shop-specific feature, not applicable to the commerce surface
- No Sanity changes — this epic is Contentful-only
- No code changes to `apps/web` or `packages/design-system`
- No navigation dropdown / child nav items — `navigationItem` is flat for Stage 1

## Related

- **Linear:** [SUG-188](https://linear.app/sugartown/issue/SUG-188/contentful-content-model-stage-1-sitesettings-nav-navigationitem)
- **Blocks:** [SUG-179](https://linear.app/sugartown/issue/SUG-179/contentful-stage-1-build-out-ds-headerfooter-homepage-article-archive)
- **Sanity reference schema:** `apps/studio/schemas/documents/siteSettings.ts`
- **Sanity navItem object:** `apps/studio/schemas/objects/navItem.ts`
- **Sanity socialLink object:** `apps/studio/schemas/objects/socialLink.ts`
- **Storybook Regions:** `http://localhost:6006/?path=/docs/regions-header--docs`, `http://localhost:6006/?path=/docs/regions-footer--docs`
- **PRD:** `docs/briefs/platform-evolution-prd.md` Area 2 (Stage 1)
- **Epic template:** `docs/epic-template.md`
