# EPIC TEMPLATE
# Sugartown — Claude Code Epic Prompt

---

## Epic Lifecycle

**Status:** COMPLETE

**Epic ID:** EPIC-0170
## EPIC NAME: Footer Update — Wire IA Brief Footer Links

**Backlog ref:** Item #6 (Nav/Footer update — wire IA brief footer links)
**Dependency:** Icon & Emoji Preload Strategy epic (deferred) — social link icons currently use emoji fallbacks (`SocialLink.jsx`). This epic scopes the footer *structure and links* only. Icon replacement (SVG sprite, `@sanity/icons`, etc.) is explicitly deferred to the Icon & Emoji epic.

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — Footer exists (`apps/web/src/components/Footer.jsx`). Link atom exists (`apps/web/src/components/atoms/Link.jsx`). `resolveNavLink()` exists in `apps/web/src/lib/resolveNavUrl.js` and handles all link types (internal, archive, external, legacy fallback). Navigation document schema (`apps/studio/schemas/documents/navigation.ts`) supports typed `navItem` with `linkType` + conditional fields. Two navigation docs already exist in Sanity: "Legal Links" (2 items) and "Primary Nav" (6 items). No new components needed — extending Footer to use the same link resolution pattern as Header.
- [x] **Use case coverage** — Footer links must support: internal SPA routes (page refs), archive page refs, external URLs, and legacy `link.url` fallback. All covered by `resolveNavLink()` utility already used by Header.
- [x] **Layout contract** — Footer bottom bar gains a legal links row. CSS classes `.legalLinks` and `.legalLink` already exist in `Footer.module.css` (lines 101–113) but are unused. The row sits inside `.bottom` alongside copyright text, using `justify-content: space-between`. Mobile: stacks vertically via existing `flex-direction: column` breakpoint.
- [x] **All prop value enumerations** — No new enum fields. `link.icon` options are not in scope (Icon & Emoji epic).
- [x] **Correct audit file paths** — All paths verified via Read tool.
- [x] **Dark / theme modifier treatment** — Footer is always rendered on `--st-color-bg-midnight` (dark). Legal links inherit `.legalLink` styling (muted text, white on hover). No theme variants needed — footer is not themed.
- [x] **Studio schema changes scoped** — Yes, in scope: add optional `header` display field to `navigation` document schema. Own commit prefix: `feat(studio):`.
- [x] **Web adapter sync scoped** — No DS component created or modified. N/A.

---

## Context

**Current state:**
- Footer renders brand (logo + tagline), navigation columns, social links, and copyright text
- Footer data comes from `siteSettings` singleton in Sanity, queried via `siteSettingsQuery`
- `footerColumns[]` are **references** to `navigation` documents — two nav docs already exist in Sanity: "Legal Links" (2 items: privacy-and-terms, ai-ethics) and "Primary Nav" (6 items)
- **BUG — external links not clickable in footer:** The `footerColumns` GROQ projection only fetches the **legacy** `link{ url, label, openInNewTab }` field. It does NOT project the new typed fields (`linkType`, `internalPage`, `archiveRef`, `externalUrl`). Nav items created with `linkType: 'external'` have no legacy `link.url` value, so the Link atom receives `url=undefined` and renders a non-clickable `<span>`. The Header works because it uses `resolveNavLink()` which handles all link types.
- **BUG — internal titles showing as column headers:** The `navigation` document `title` field is described as "Internal identifier" but is rendered as column headings in the footer (`column.title`). There is no separate display header field — editors see their internal titles ("Legal Links", "Primary Nav") displayed publicly.
- **STYLE — brand column alignment:** Logo and tagline are left-aligned in `.brand` (flex column, no centering). Tagline should be centered beneath the logo. The brand column should stretch to fit the logo width, with the tagline centered within that width.
- **STYLE — bottom bar separator:** `.bottom` uses `border-top: 1px solid var(--st-color-border-default)` — a neutral/grey rule. Should use brand pink (`var(--st-color-brand-primary)` / `var(--st-color-pink)`) to match brand identity.
- CSS classes `.legalLinks` and `.legalLink` exist in `Footer.module.css` but are **not used** — they were scaffolded but never wired
- `siteSettings.ts` has no `legalLinks` field (a deprecated `footer.ts` schema had one, but it's not in use) — **this epic does NOT add a `legalLinks` field**; legal links are managed via the existing `navigation` document + `footerColumns` references
- IA brief (locked 2026-02-26) specifies footer nav: **Contact, Privacy, Terms, Accessibility Statement**
- Privacy & Terms page exists (slug: `privacy-and-terms`), AI Ethics page exists (slug: `ai-ethics`) — **do not create placeholder pages for these**
- Social links currently use emoji fallbacks (SocialLink.jsx hardcodes `💼`, `🐙`, etc.) — this is an Icon & Emoji epic concern, not this epic

**Root cause — external link bug:**
```
Header path (working):
  primaryNav GROQ → projects linkType, internalPage->, archiveRef->, externalUrl
  Header.jsx → resolveNavLink(item) → { url, openInNewTab }

Footer path (broken):
  footerColumns GROQ → projects ONLY legacy link{ url, label, openInNewTab }
  Footer.jsx → item.link?.url → undefined for new-style nav items
```

**Recent relevant epics:**
- EPIC-0168 (Link & Button Unification) — established `linkUtils.js` as the canonical link resolver
- EPIC-0167 (Section Layout Cohesion) — unified detail page layout contract

**Files already in play:**
- `apps/web/src/components/Footer.jsx` — render component
- `apps/web/src/components/Footer.module.css` — styles (includes unused `.legalLinks`)
- `apps/web/src/lib/resolveNavUrl.js` — `resolveNavLink()` utility (used by Header, not yet by Footer)
- `apps/studio/schemas/documents/siteSettings.ts` — schema (footer group, lines 95–144)
- `apps/studio/schemas/documents/navigation.ts` — navigation document + navItem schema
- `apps/web/src/lib/queries.js` — `siteSettingsQuery` (lines 105–191)

---

## Objective

After this epic:

1. **External links work in footer** — `footerColumns` GROQ projection matches `primaryNav` (includes `linkType`, `internalPage`, `archiveRef`, `externalUrl`), and `Footer.jsx` uses `resolveNavLink()` for all nav items
2. **Column headers are editor-controlled** — Navigation schema gains an optional `header` field (display text). Footer renders `column.header || column.title` as column heading, so editors can set a public-facing heading separate from the internal menu title
3. **Legal links row** — Footer bottom bar renders legal links sourced from a designated `footerColumns` entry (the existing "Legal Links" nav doc), using the existing `.legalLinks` / `.legalLink` CSS classes
4. **No new schema fields on siteSettings** — Legal links use the existing `footerColumns` reference array pointing at `navigation` documents. No `legalLinks` field needed.
5. **No placeholder page creation** — `privacy-and-terms` and `ai-ethics` pages already exist in Sanity
6. **Brand column centered** — Logo and tagline are center-aligned; the brand column stretches to fit the logo, tagline centered beneath it
7. **Bottom separator is brand pink** — The `hr` line between the top grid and the bottom bar uses `var(--st-color-brand-primary)` instead of the neutral border colour

**Data layer:** Update `footerColumns` GROQ to project typed link fields. Add optional `header` field to `navigation` schema.
**Query layer:** `siteSettingsQuery` `footerColumns` projection updated to match `primaryNav` projection pattern.
**Render layer:** `Footer.jsx` uses `resolveNavLink()` for link resolution (same pattern as Header).

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `navigation` | Yes | Add optional `header` display field |
| `siteSettings` | Yes | GROQ projection update (no schema change) |
| `page` | No | Existing pages cover legal links; no new stubs needed |
| `article` | No | Footer is a site-level concern |
| `caseStudy` | No | Same as article |
| `node` | No | Same as article |
| `archivePage` | No | Same as article |

---

## Scope

- [x] **Studio schema change** — Add optional `header` field (string, max 50 chars) to `navigation` document schema, below `title`. Description: "Optional display heading shown in the footer. If empty, the internal Menu Title is used."
- [ ] **GROQ query update** — Update `footerColumns[]->{...}` projection in `siteSettingsQuery` to include `header`, `linkType`, `internalPage->`, `archiveRef->`, `externalUrl`, `openInNewTab` (matching `primaryNav` projection pattern)
- [ ] **Footer link resolution** — Import `resolveNavLink` in `Footer.jsx`, replace `item.link?.url` / `item.link?.openInNewTab` with `resolveNavLink(item)` destructuring
- [ ] **Footer column heading** — Render `column.header || column.title` as column heading (prefer display header, fall back to internal title)
- [ ] **Legal links row** — Wire legal links into `.bottom` section using existing `.legalLinks` / `.legalLink` CSS classes. Legal links are the items from the "Legal Links" nav doc (already referenced in `footerColumns`). Rendered as a separate row beneath copyright.
- [ ] **Brand column centering** — Update `.brand` CSS to center-align tagline beneath logo. Column width stretches to logo width (intrinsic sizing via `width: max-content` on grid column or `align-items: center` on flex column). Tagline text-centered within the column.
- [ ] **Bottom bar separator colour** — Change `.bottom` `border-top` from `var(--st-color-border-default)` to `var(--st-color-brand-primary)` (brand pink)
- [ ] **Sanity content update** — Set `header` field on "Legal Links" nav doc (e.g. blank or "Legal") and "Primary Nav" nav doc (e.g. "Navigate" or blank — user review required)

**Not in scope:**
- [ ] Migration script — no data migration needed, `header` is an optional new field
- [ ] New `legalLinks` field on siteSettings — legal links use existing `footerColumns` reference pattern
- [ ] Placeholder page creation — `privacy-and-terms` and `ai-ethics` already exist
- [ ] Web adapter sync — no DS component created or modified

---

## Query Layer Checklist

- [x] `siteSettingsQuery` — update `footerColumns[]->{...}` to project: `title, header, items[]{ label, linkType, "internalPage": internalPage->{ _type, "slug": slug.current }, "archiveRef": archiveRef->{ _type, "slug": slug.current }, externalUrl, openInNewTab, link{ url, openInNewTab } }`
- [ ] `pageBySlugQuery` — not affected
- [ ] `articleBySlugQuery` — not affected
- [ ] `caseStudyBySlugQuery` — not affected
- [ ] `nodeBySlugQuery` — not affected
- [ ] Archive queries — not affected

---

## Schema Enum Audit

No enum fields added or rendered by this epic.

---

## Metadata Field Inventory

Not applicable — this epic does not touch MetadataCard or any metadata surface.

---

## Themed Colour Variant Audit

| Surface / component | Dark | Light | Pink Moon | Token(s) to set |
|---------------------|------|-------|-----------|-----------------|
| Legal links (footer) | Inherits from `.legalLink` — `var(--st-color-text-muted)`, hover: `var(--st-color-white)` | N/A | N/A | No new tokens — footer is always midnight theme |

Footer is always rendered on `--st-color-bg-midnight`. No per-theme overrides needed.

---

## Non-Goals

- **Icon replacement for social links** — SocialLink.jsx emoji fallbacks (`💼`, `🐙`, etc.) are not touched. This is deferred to the Icon & Emoji Preload Strategy epic.
- **Footer layout redesign** — The existing 3-column grid (brand | columns | social) is preserved. Only the `.bottom` section gains a legal links row.
- **New `legalLinks` schema field** — Legal links are managed via existing `navigation` document references in `footerColumns`. No separate field needed on `siteSettings`.
- **Placeholder page creation** — `privacy-and-terms` and `ai-ethics` pages already exist. Contact and Accessibility Statement pages are editorial concerns, not this epic.
- **`linkItem` schema migration** — The navigation schema already uses typed `navItem` with `linkType` + conditional fields. The existing `link` (legacy) field is preserved for backward compatibility. No schema migration needed — this epic fixes the GROQ/render gap.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`
- No migration script needed — `header` is an optional new field with no existing data

**Schema (Studio)**
- `navigation.ts`: add `header` field (type: `string`, optional, max 50 chars) after `title`
- Description: "Optional display heading for this menu (e.g. shown as footer column heading). If empty, the Menu Title is used."
- No changes to `siteSettings.ts` — footer columns are already `references` to `navigation` docs

**Query (GROQ)**
- `siteSettingsQuery` in `apps/web/src/lib/queries.js` — update `footerColumns[]->{...}` to match `primaryNav` projection pattern:
  ```groq
  footerColumns[]->{
    title,
    header,
    items[]{
      label,
      linkType,
      "internalPage": internalPage->{ _type, "slug": slug.current },
      "archiveRef": archiveRef->{ _type, "slug": slug.current },
      externalUrl,
      openInNewTab,
      link{ url, openInNewTab }
    }
  }
  ```
- No other queries affected

**Render (Frontend)**
- `Footer.jsx` imports `resolveNavLink` from `../lib/resolveNavUrl`
- Column heading: `column.header || column.title`
- Each nav item resolved via `resolveNavLink(item)` → `{ url, openInNewTab }`, then rendered via existing `Link` atom
- Legal links row: items from the legal-links column rendered in `.bottom` using `.legalLinks` / `.legalLink` CSS
- Separator between legal links: CSS-only (e.g. `gap` or `::before` pipe character) — no JS separator logic

**CSS (Footer.module.css)**
- `.brand` — add `align-items: center` to center logo + tagline within the column. The brand grid column should use intrinsic sizing (e.g. `auto` instead of `1fr`) so the column width is driven by the logo, and the tagline centers beneath it. `.tagline` gets `text-align: center`.
- `.bottom` — change `border-top` colour from `var(--st-color-border-default)` to `var(--st-color-brand-primary)` (brand pink)

**Design System → Web Adapter Sync**
- Not applicable — no DS component created or modified

---

## Sanity Content Plan

**GATE: User must review and approve column header values before content is updated.**

Proposed content updates to existing navigation documents:

| Nav doc | Current `title` | Proposed `header` value | Notes |
|---------|----------------|------------------------|-------|
| Legal Links | Legal Links | "" (blank — suppressed) or "Legal" | User to decide if legal column gets a visible heading |
| Primary Nav | Primary Nav | "Navigate" or "Explore" or "" (blank) | User to decide on public-facing column heading |

No new page documents need to be created. Existing pages:
- `privacy-and-terms` — exists ✅
- `ai-ethics` — exists ✅

---

## Files to Modify

**Studio**
- `apps/studio/schemas/documents/navigation.ts` — ADD `header` field (optional display heading)

**Frontend**
- `apps/web/src/lib/queries.js` — UPDATE `footerColumns[]->{...}` projection to include typed link fields + `header`
- `apps/web/src/components/Footer.jsx` — IMPORT `resolveNavLink`, use for all nav item link resolution; render `column.header || column.title` as heading; wire legal links row in `.bottom`
- `apps/web/src/components/Footer.module.css` — UPDATE `.brand` (center-align), `.top` grid columns (`auto` for brand column instead of `1fr`), `.tagline` (`text-align: center`), `.bottom` border colour (brand pink). VERIFY `.legalLinks` / `.legalLink` styles sufficient.

---

## Deliverables

1. **Bug fix — external links** — Footer nav items using `linkType: 'external'` render as clickable links (matching header behavior)
2. **Bug fix — internal links** — Footer nav items using `linkType: 'internal'` / `'archive'` resolve to correct SPA routes via `resolveNavLink()`
3. **Schema** — `navigation` document gains optional `header` field for display heading
4. **GROQ** — `siteSettingsQuery` `footerColumns` projection includes all typed link fields
5. **Render** — Footer column headings use `header` (display) with `title` (internal) as fallback
6. **Legal links row** — Footer renders legal links in `.bottom` section when present; renders nothing extra when empty
7. **Brand column** — Logo and tagline center-aligned; column stretches to logo width
8. **Bottom separator** — Brand pink `border-top` on `.bottom` bar
9. **Content** — `header` values set on "Legal Links" and "Primary Nav" nav docs (user-approved values)

---

## Acceptance Criteria

- [ ] Studio: `header` field visible on navigation documents, accepts optional string
- [ ] Studio: adding/editing `header` saves without errors
- [ ] GROQ: `siteSettingsQuery` returns `header` and typed link fields for `footerColumns` items
- [ ] Frontend: Footer external links are clickable (was broken — items using `linkType: 'external'` now resolve via `resolveNavLink()`)
- [ ] Frontend: Footer internal links navigate via SPA (React Router, no full page reload)
- [ ] Frontend: Footer column headings show `header` when set, fall back to `title` when `header` is empty/null
- [ ] Frontend: Legal links render in the bottom bar (Contact, Privacy & Terms, AI Ethics, Accessibility Statement — as available)
- [ ] Frontend: Legal links have correct hover state (muted → white)
- [ ] Frontend: Footer degrades gracefully when `footerColumns` is empty/null (no errors)
- [ ] Frontend: Mobile breakpoint — legal links stack vertically, copyright and links don't overlap
- [ ] Frontend: Brand column — logo and tagline are center-aligned, column width driven by logo (not stretched to `1fr`)
- [ ] Frontend: Bottom bar separator is brand pink (`var(--st-color-brand-primary)`), not neutral grey
- [ ] Visual QA: Legal links row aligns with existing footer bottom bar, consistent font size and colour tokens

---

## Risks / Edge Cases

**Schema risks**
- [ ] `header` field does not collide with any existing field on `navigation` — verified: no collision
- [ ] `header` is optional — existing nav docs without it continue to render `title` as column heading

**Query risks**
- [ ] Only `siteSettingsQuery` needs updating — footer data is fetched once at app level, not per-page
- [ ] Legacy `link` field still projected for backward compat — items stored before typed migration keep working via `resolveNavLink()` default case

**Render risks**
- [ ] What renders when `footerColumns` is null/empty? — Conditional render: columns section not rendered. Copyright row still appears.
- [ ] What renders when a nav item has no URL? — `resolveNavLink()` returns `{ url: null }`, Link atom renders `<span>` fallback
- [ ] What renders when `header` is empty? — Falls back to `title` (column heading still shows)
- [ ] Separator styling for legal links: if using CSS `::before` pipe separator, ensure first-child exclusion to avoid leading pipe

**Content risks**
- [ ] "Legal Links" nav doc currently has 2 items (privacy-and-terms, ai-ethics). Additional items (Contact, Accessibility Statement) are editorial additions — not code changes
- [ ] If a nav item references a page that doesn't exist, `resolveNavLink()` returns `{ url: null }` — safe fallback

**Dependency risks**
- [ ] Icon & Emoji epic is deferred — social link emoji fallbacks remain unchanged. This is cosmetic only and does not block footer link structure work.
- [ ] `resolveNavLink()` is already tested via Header usage — no new utility to create, reducing risk

---

## Post-Epic Close-Out

1. **Activate the epic file:**
   - Assign the next sequential EPIC number (currently EPIC-0169 is the latest → this becomes EPIC-0170 or later depending on sequence)
   - Move: `docs/backlog/EPIC-footer-ia-brief.md` → `docs/prompts/EPIC-{NNNN}-footer-ia-brief.md`
   - Update the **Epic ID** field to match
   - Commit: `docs: activate EPIC-{NNNN} Footer IA Brief Links`
2. **Confirm clean tree** — `git status` must show nothing staged or unstaged
3. **Run mini-release** — `/mini-release EPIC-{NNNN} Footer IA Brief Links`
4. **Start next epic** — only after mini-release commit is confirmed
