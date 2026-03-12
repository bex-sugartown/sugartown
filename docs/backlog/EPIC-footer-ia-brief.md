# EPIC TEMPLATE
# Sugartown — Claude Code Epic Prompt

---

## Epic Lifecycle

**Status:** BACKLOG (unscheduled — awaiting prioritization)

**Epic ID:** EPIC-0000
## EPIC NAME: Footer Update — Wire IA Brief Footer Links

**Backlog ref:** Item #6 (Nav/Footer update — wire IA brief footer links)
**Dependency:** Icon & Emoji Preload Strategy epic (deferred) — social link icons currently use emoji fallbacks (`SocialLink.jsx`). This epic scopes the footer *structure and links* only. Icon replacement (SVG sprite, `@sanity/icons`, etc.) is explicitly deferred to the Icon & Emoji epic.

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — Footer exists (`apps/web/src/components/Footer.jsx`). SocialLink atom exists (`apps/web/src/components/atoms/SocialLink.jsx`). Link atom exists (`apps/web/src/components/atoms/Link.jsx`). `linkUtils.js` provides `isExternalUrl()` / `getLinkProps()`. No new components needed — extending Footer to render a legal links row using existing Link atom. No fork required.
- [x] **Use case coverage** — Legal links must support: internal SPA routes (`/privacy`, `/terms`, `/accessibility`), internal page routes (`/contact`), and potentially external URLs (if any legal page is hosted elsewhere). All covered by existing Link atom + `isExternalUrl()`.
- [x] **Layout contract** — Footer bottom bar gains a legal links row. CSS classes `.legalLinks` and `.legalLink` already exist in `Footer.module.css` (lines 101–113) but are unused. The row sits inside `.bottom` alongside copyright text, using `justify-content: space-between`. Mobile: stacks vertically via existing `flex-direction: column` breakpoint.
- [x] **All prop value enumerations** — No new enum fields. `link.icon` options are not in scope (Icon & Emoji epic).
- [x] **Correct audit file paths** — All paths verified via Read tool.
- [x] **Dark / theme modifier treatment** — Footer is always rendered on `--st-color-bg-midnight` (dark). Legal links inherit `.legalLink` styling (muted text, white on hover). No theme variants needed — footer is not themed.
- [x] **Studio schema changes scoped** — Yes, in scope: add `legalLinks` field to `siteSettings.ts` footer group. Own commit prefix: `feat(studio):`.
- [x] **Web adapter sync scoped** — No DS component created or modified. N/A.

---

## Context

**Current state:**
- Footer renders brand (logo + tagline), navigation columns, social links, and copyright text
- Footer data comes from `siteSettings` singleton in Sanity, queried via `siteSettingsQuery`
- CSS classes `.legalLinks` and `.legalLink` exist in `Footer.module.css` but are **not used** — they were scaffolded but never wired
- `siteSettings.ts` has no `legalLinks` field (a deprecated `footer.ts` schema had one, but it's not in use)
- IA brief (locked 2026-02-26) specifies footer nav: **Contact, Privacy, Terms, Accessibility Statement**
- Privacy, Terms, and Accessibility Statement pages likely do not exist as Sanity `page` documents yet
- Social links currently use emoji fallbacks (SocialLink.jsx hardcodes `💼`, `🐙`, etc.) — this is an Icon & Emoji epic concern, not this epic
- `link` schema object supports `url`, `label`, `openInNewTab`, `icon` — sufficient for legal links (icon field not needed for legal links)

**Recent relevant epics:**
- EPIC-0168 (Link & Button Unification) — established `linkUtils.js` as the canonical link resolver
- EPIC-0167 (Section Layout Cohesion) — unified detail page layout contract

**Files already in play:**
- `apps/web/src/components/Footer.jsx` — render component
- `apps/web/src/components/Footer.module.css` — styles (includes unused `.legalLinks`)
- `apps/studio/schemas/documents/siteSettings.ts` — schema (footer group, lines 95–144)
- `apps/web/src/lib/queries.js` — `siteSettingsQuery` (lines 105–191)

---

## Objective

After this epic, the footer renders a legal links row (Contact, Privacy, Terms, Accessibility Statement) sourced from a new `legalLinks` field on `siteSettings`. The links are editable in Studio without code changes. Minimal Sanity `page` documents exist for Privacy, Terms, and Accessibility Statement (stub content — editorial fill-in is a separate content task). The footer structure matches the IA brief footer specification.

**Data layer:** New `legalLinks` array field on `siteSettings` (array of `link` objects).
**Query layer:** `siteSettingsQuery` updated to project `legalLinks[]`.
**Render layer:** `Footer.jsx` renders legal links in the `.bottom` section using the existing `.legalLinks` / `.legalLink` CSS classes.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | Yes | Privacy, Terms, Accessibility Statement created as minimal `page` documents |
| `article` | No | Footer is a site-level concern, not a content type concern |
| `caseStudy` | No | Same as article |
| `node` | No | Same as article |
| `archivePage` | No | Same as article |
| `siteSettings` | Yes | `legalLinks` field added to footer group |

---

## Scope

- [x] **Studio schema change** — Add `legalLinks` field (array of `link` objects) to `siteSettings.ts` footer group
- [ ] **GROQ query update** — Add `legalLinks[]` projection to `siteSettingsQuery`
- [ ] **Footer rendering** — Wire `legalLinks` into `Footer.jsx` using existing `.legalLinks` / `.legalLink` CSS classes
- [ ] **Sanity content creation** — Create minimal `page` documents for Privacy, Terms, Accessibility Statement (stub content with slug)
- [ ] **Sanity content wiring** — Populate `legalLinks` in siteSettings with links to Contact (`/contact`), Privacy (`/privacy`), Terms (`/terms`), Accessibility Statement (`/accessibility`)
- [ ] **IA brief amendment** — Update `docs/briefs/ia-brief.md` footer section if any URLs differ from the brief's expectation (user review required)

**Not in scope:**
- [ ] Migration script — no existing data to migrate, `legalLinks` is a new field
- [ ] Web adapter sync — no DS component created or modified

---

## Query Layer Checklist

- [x] `siteSettingsQuery` — add `legalLinks[]{ url, label, openInNewTab }` projection
- [ ] `pageBySlugQuery` — not affected (footer is site-level, not page-level)
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

- **Icon replacement for social links** — SocialLink.jsx emoji fallbacks (`💼`, `🐙`, etc.) are not touched. This is deferred to the Icon & Emoji Preload Strategy epic. The dependency is acknowledged but does not block the footer link structure work.
- **Footer layout redesign** — The existing 3-column grid (brand | columns | social) is preserved. Only the `.bottom` section gains a legal links row.
- **Editorial content for legal pages** — This epic creates stub `page` documents with placeholder content. Real privacy policy / terms of service / accessibility statement copy is an editorial task, not a code epic.
- **Contact page content** — Contact page (`/contact`) should already exist or be created as part of the IA brief page sequence (About → Platform → Homepage teasers). This epic only links to it from the footer — it does not create the Contact page content.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`
- No migration script needed — `legalLinks` is a new field with no existing data

**Schema (Studio)**
- `legalLinks` field: `type: 'array'`, of `link` objects (reusing existing `link` schema object)
- Added to `siteSettings.ts` footer group, after `copyrightText`
- `link` object already supports `url`, `label`, `openInNewTab` — all needed for legal links
- `icon` field on `link` is optional and will be left empty for legal links

**Query (GROQ)**
- `siteSettingsQuery` in `apps/web/src/lib/queries.js` — add `legalLinks[]{ url, label, openInNewTab }` after `copyrightText` projection
- No other queries affected

**Render (Frontend)**
- `Footer.jsx` destructures `legalLinks` from `siteSettings`
- Renders inside `.bottom` div, after copyright, using existing `.legalLinks` / `.legalLink` CSS classes
- Each legal link rendered via the existing `Link` atom (handles internal/external routing)
- Separator between links: CSS-only (e.g. `gap` or `::before` pipe character) — no JS separator logic

**Design System → Web Adapter Sync**
- Not applicable — no DS component created or modified

---

## Sanity Content Plan

**GATE: User must review and approve all URLs before content is created.**

Proposed content documents and link URLs:

| Link label | Target URL | Page doc needed? | Notes |
|-----------|-----------|-----------------|-------|
| Contact | `/contact` | Depends — may already exist from IA brief page sequence | If not, create stub `page` doc with slug `contact` |
| Privacy | `/privacy` | Yes — create minimal `page` doc | Slug: `privacy`. Stub content: "Privacy policy — content forthcoming." |
| Terms | `/terms` | Yes — create minimal `page` doc | Slug: `terms`. Stub content: "Terms of service — content forthcoming." |
| Accessibility | `/accessibility` | Yes — create minimal `page` doc | Slug: `accessibility`. Stub content: "Accessibility statement — content forthcoming." |

**IA brief alignment:** The brief says "Accessibility Statement" as the label. Proposed URL `/accessibility` (short, clean). The brief does not specify exact slugs — user confirmation needed.

After page docs are created and published, `legalLinks` on siteSettings is populated with links pointing to the above URLs.

---

## Files to Modify

**Studio**
- `apps/studio/schemas/documents/siteSettings.ts` — ADD `legalLinks` field to footer group

**Frontend**
- `apps/web/src/lib/queries.js` — ADD `legalLinks[]` projection to `siteSettingsQuery`
- `apps/web/src/components/Footer.jsx` — WIRE `legalLinks` rendering in `.bottom` section
- `apps/web/src/components/Footer.module.css` — VERIFY existing `.legalLinks` / `.legalLink` styles are sufficient (may need minor adjustments for separator styling)

**Docs**
- `docs/briefs/ia-brief.md` — AMEND if any footer URLs differ from brief expectations (user review gate)

---

## Deliverables

1. **Schema** — `legalLinks` field exists in `siteSettings.ts`, accepts array of `link` objects, appears in Studio footer group
2. **GROQ** — `siteSettingsQuery` projects `legalLinks[]{ url, label, openInNewTab }`
3. **Render** — Footer renders legal links row in `.bottom` section when `legalLinks` has entries; renders nothing extra when empty
4. **Content** — Minimal page documents exist for Privacy, Terms, Accessibility Statement (published, with slugs)
5. **Wiring** — `legalLinks` on siteSettings populated with 4 links (Contact, Privacy, Terms, Accessibility)
6. **IA brief** — `docs/briefs/ia-brief.md` updated if URLs changed (user-approved)

---

## Acceptance Criteria

- [ ] Studio: `legalLinks` field visible in siteSettings footer tab, accepts link objects
- [ ] Studio: adding/removing legal links saves without errors
- [ ] GROQ: `siteSettingsQuery` returns `legalLinks` array when queried
- [ ] Frontend: Footer renders 4 legal links (Contact, Privacy, Terms, Accessibility Statement) in the bottom bar
- [ ] Frontend: Legal links render as internal SPA links via React Router (no full page reload)
- [ ] Frontend: Legal links have correct hover state (muted → white)
- [ ] Frontend: Footer degrades gracefully when `legalLinks` is empty/null (no empty row, no errors)
- [ ] Frontend: Mobile breakpoint — legal links stack vertically, copyright and links don't overlap
- [ ] Routing: Clicking each legal link navigates to the correct page (`/contact`, `/privacy`, `/terms`, `/accessibility`) without 404
- [ ] Content: Page documents for Privacy, Terms, Accessibility exist and are published in Sanity
- [ ] Visual QA: Legal links row aligns with existing footer bottom bar, consistent font size and colour tokens, pipe or gap separator between links

---

## Risks / Edge Cases

**Schema risks**
- [ ] `legalLinks` name does not collide with any existing field on `siteSettings` — verified: no collision
- [ ] Reuses existing `link` schema object — no new type registration needed

**Query risks**
- [ ] Only `siteSettingsQuery` needs updating — footer data is fetched once at app level, not per-page

**Render risks**
- [ ] What renders when `legalLinks` is null/empty? — Conditional render: if no legal links, `.legalLinks` container is not rendered. Copyright row still appears.
- [ ] What renders when a legal link has no `url`? — Link atom already handles this (renders `<span>` fallback for missing URLs)
- [ ] Separator styling: if using CSS `::before` pipe separator, ensure first-child exclusion to avoid leading pipe

**Content risks**
- [ ] Stub page documents may be published before real content is ready — acceptable as long as they render cleanly with placeholder text
- [ ] Contact page may not exist yet — epic must check and create if needed, or defer linking until the Contact page epic ships

**Dependency risks**
- [ ] Icon & Emoji epic is deferred — social link emoji fallbacks remain unchanged. This is cosmetic only and does not block footer link structure work.
- [ ] If the Icon & Emoji epic later replaces SocialLink rendering, that change is contained within SocialLink.jsx and does not affect the legal links row added by this epic.

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
