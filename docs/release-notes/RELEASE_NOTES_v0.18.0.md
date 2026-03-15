# Release Notes — v0.18.0

**Date:** 2026-03-15
**Scope:** Sugartown monorepo — apps/web, apps/studio, packages/design-system, scripts, docs

---

## What this release is

v0.18.0 delivers the first batch of IA brief infrastructure: footer and nav polish, SVG icons, schema exploration tooling, link atom consolidation, content data hygiene, CSS token integrity, and a formalized content state governance layer. Seven epics (EPIC-0170–0176) ship as a cohesive MINOR release aggregating patches 0.17.1–0.17.7.

---

## What changed

### Footer & Navigation (EPIC-0170, EPIC-0171)

Footer links now resolve correctly via `resolveNavLink()`, fixing external links that were previously unclickable. Column headings are editor-controlled through a new `header` field on the navigation document — no heading renders when the field is empty, replacing the previous fallback to internal menu titles. The brand column is centered with a pink separator.

Nav dropdown menus support two interaction modes: hover-triggered when the parent item has a URL (so clicking navigates), and click-triggered when the parent is label-only. Keyboard navigation, Escape-to-close, and click-outside-to-dismiss are supported.

### SVG Icons (EPIC-0171)

Emoji-based icons across SocialLink, ThemeToggle, and PersonProfilePage are replaced with tree-shakeable SVG components from Simple Icons (brand/social) and Lucide (UI). Social icons default to brand pink with a muted hover state. All Studio icon/platform option lists are consolidated into a shared `iconOptions.ts` file — a single source of truth across link, socialLink, and person schemas.

### Schema ERD Explorer (EPIC-0172)

An interactive schema explorer is available at `/platform/schema`. It renders 30 entities and 44 relationships from a static manifest, with group filter tabs (Content, Taxonomy, Section, Object, Config), click-to-select cards, and pink reference links in a sticky detail sidebar. The CTA button style enum was renamed from `ghost` to `tertiary` across both paired schemas.

### Link Atom Consolidation (EPIC-0173)

The `link` schema object is superseded by `linkItem`, which adds `label`, `openInNewTab`, and expanded URL validation (mailto, tel, relative paths). Active schemas across ctaButton, ctaButtonDoc, preheader, homepage, and siteSettings have been swapped to `linkItem`. The callout section body was upgraded from plain text to Portable Text with inline link support. A migration script (`link-to-linkItem.js`) with dry-run support is provided.

The homepage singleton is deprecated — its content is now served through the standard page/section system.

### Content Data Hygiene (EPIC-0174)

Legacy defensive code paths have been removed: `typeof` string-type guards for tool rendering, author string fallbacks, and stale status label maps. Three migration scripts cleaned Sanity production data: 25 duplicate tag documents deleted, 132 orphan tags removed (256 → 92), and 35 node documents backfilled with a default author.

### CSS Token Integrity (EPIC-0175)

14 broken legacy token names in `App.css` were replaced with canonical equivalents — error states, loading states, and empty states now render with correct colours and spacing instead of falling back to browser defaults. 24 legacy alias references were migrated to canonical names across 12 component CSS files. An orphaned `design-tokens.css` file with no consumers was deleted.

The token validator now scans all CSS files for unknown `var(--st-*)` references and supports a component-scoped API token allowlist for intentional CSS API surfaces (Media, Callout, CodeBlock, Table components).

### Content State Governance (EPIC-0176)

The published-only content posture — previously implicit via a single line in `sanity.js` — is now explicit, documented, and enforced:

- **Content state helper** (`contentState.js`) centralizes the perspective decision and exports `getContentPerspective()`, `isPreviewMode()`, and `logPreviewWarning()`
- **Build-time safety** — a Vite plugin blocks production builds when `VITE_SANITY_PREVIEW=true` is set, preventing draft content from shipping
- **Preview mode** — setting `VITE_SANITY_PREVIEW=true` in local `.env` switches to `previewDrafts` perspective (dev-only)
- **Draft-only detection** — `validate-content.js` check G warns when documents exist only as drafts with slugs that would 404 in production
- **Policy documentation** — `docs/content-state-policy.md` covers the full contract

---

## Not in this release

- **Full preview UI** — preview mode infrastructure is in place (env var toggle, perspective switch, console warning), but no visual preview chrome, draft badges, or editing overlay exists yet
- **Card adapter migration** — the web Card adapter still uses the old slot-based API; migration to the DS Card's named-prop API is not yet scoped
- **IA brief content pages** — Services, Contact, About rewrite, Platform sub-pages are deferred to future epics
- **Schema ERD Sanity hybrid** — the ERD page uses a static manifest; live Sanity schema introspection is a separate backlog item

---

## Validator state at release

```
Token validator: 0 errors, 33 value mismatches (expected — web=dark-first, DS=light-first)
Content validator: 1 error (pre-existing duplicate slug), 9 warnings (nav items with missing URLs — known Sanity content issues)
Draft-only detection: 0 draft-only documents
```
