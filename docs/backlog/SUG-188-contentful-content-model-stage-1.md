---
**Epic:** SUG-188 — Contentful content model Stage 1 — siteSettings nav, navigationItem, homepage page entry
**Linear Issue:** [SUG-188](https://linear.app/sugartown/issue/SUG-188/contentful-content-model-stage-1-sitesettings-nav-navigationitem)
**Status:** Backlog
**Priority:** 🔴 Now (blocks SUG-179)
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-188 — Contentful content model Stage 1 — siteSettings nav, navigationItem, homepage page entry

Extend the Contentful `siteSettings` content type and add a `navigationItem` linked content type so the DS Header and Footer can be wired to real Contentful nav data in SUG-179. Add the homepage `page` entry with section content so the `/` homepage route has content to render.

## Background

`apps/contentful-poc` currently has article list/detail, tag archive, and page routes. The Contentful `siteSettings` singleton only carries `siteTitle` and `metaDescription` — no nav links, no CTA, no footer columns, no social links.

The DS `Header` and `Footer` components (documented under Regions in Storybook) accept a single `siteSettings` prop carrying `{ primaryNav, headerCta, preheader, footerColumns, socialLinks, copyrightText, licenseUrl, footerToolchain }`. Until the Contentful content model provides these fields, SUG-179 cannot wire DS components to real data — it would be wiring to a stub.

Additionally, the PRD specifies a homepage route (`/`) powered by a Contentful `page` entry with `slug: "home"` and a sections array. No such entry exists in the Contentful space.

## Objective

After this epic, the Contentful space has:
- An extended `siteSettings` content type with all fields the DS Header and Footer consume
- A `navigationItem` content type for nav links (label + url + optional children for dropdowns)
- At least one populated `siteSettings` entry with real nav and footer data
- A `page` entry with `slug: "home"` containing at minimum a hero section and an article teaser section

No code is written in this epic. This is purely a Contentful content model and content authoring epic. The code wiring happens in SUG-179.

## Scope

- [ ] Extend Contentful `siteSettings` content type with fields: `primaryNav` (linked `navigationItem` entries array), `headerCta` (object: label + url + openInNewTab), `footerColumns` (array of column objects: heading + links array), `socialLinks` (array: platform + url), `copyrightText` (short text), `licenseUrl` (short text, optional) — layer: Contentful content model
- [ ] Create Contentful `navigationItem` content type: `label` (short text, required), `url` (short text, required), `openInNewTab` (boolean, optional) — layer: Contentful content model
- [ ] Populate the existing `siteSettings` singleton entry with real nav links (Articles, Tags, Pages), a minimal footer column, and copyright text — layer: Contentful content (authoring)
- [ ] Verify the Contentful TypeScript types in `apps/contentful-poc/src/lib/contentful.ts` reflect the new fields — layer: TypeScript type update
- [ ] Update `getSiteSettings()` in `apps/contentful-poc/src/lib/queries.ts` to project the new fields — layer: query update
- [ ] Create the homepage `page` entry in Contentful with `slug: "home"` and at minimum one `heroSection` and one `articlesSection` section entry — layer: Contentful content (authoring)

## Phases

**Phase 1 — Content model extension:** Extend `siteSettings`, create `navigationItem` in Contentful. Verify in Studio.
**Phase 2 — Content authoring:** Populate `siteSettings` with real data. Create homepage `page` entry.
**Phase 3 — TypeScript + query update:** Update `SiteSettingsSkeleton` type and `getSiteSettings()` to include new fields. Verify no TypeScript errors.

## Acceptance criteria

- [ ] Contentful `siteSettings` content type has `primaryNav`, `headerCta`, `footerColumns`, `socialLinks`, `copyrightText` fields visible in Contentful Studio
- [ ] `navigationItem` content type exists with `label`, `url`, `openInNewTab` fields
- [ ] The live `siteSettings` entry has at least 3 nav links and at least one footer column populated
- [ ] A `page` entry with `slug: "home"` exists in Contentful with at least 2 sections
- [ ] `getSiteSettings()` returns the new fields — verify via `console.log` in dev or a quick fetch test
- [ ] `SiteSettingsSkeleton` TypeScript type reflects new fields — `pnpm --filter contentful-poc typecheck` passes

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. This epic is content model and query changes only.

## Technical notes

**Content Write Gate:** This epic authors content directly in Contentful Studio — not via MCP tools. All nav link values are structural (label + url pairs) and do not require a Content Write Gate proposal. If any copy (e.g. footer copyright text) diverges from an explicitly agreed value, propose before saving.

**Contentful content model changes are live immediately** — unlike Sanity schema deployment, Contentful content type changes take effect in the Studio as soon as they are saved. No deployment step required for the model itself.

**TypeScript types are generated or hand-maintained** — `apps/contentful-poc/src/lib/contentful.ts` currently defines `SiteSettingsSkeleton` by hand. Activation audit: read that file to confirm whether types are generated (codegen) or hand-maintained before updating. If generated, re-run the codegen; if hand-maintained, update manually.

**Activation audit:** read `apps/contentful-poc/src/lib/queries.ts` and `apps/contentful-poc/src/lib/contentful.ts` before adding any new fields to confirm the exact current shape of `SiteSettingsSkeleton` and the `getSiteSettings()` projection.

**Upstream dependency:** This epic has no code dependencies. It must complete before SUG-179 execution begins.

### Schema field proposal

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `primaryNav` (linked entries array of `navigationItem`) | Ordered list of top-level nav links | `[{ label: "Articles", url: "/articles" }, { label: "Tags", url: "/tags" }]` | Powers the Header nav loop |
| `headerCta` (object: label + url + openInNewTab) | Optional CTA button in the header | `{ label: "Get in touch", url: "/contact", openInNewTab: false }` | Optional Header CTA button |
| `footerColumns` (array of objects: heading + links[]) | Footer nav columns | `[{ heading: "Content", links: [{ label: "Articles", url: "/articles" }] }]` | Powers Footer multi-column nav |
| `socialLinks` (array: platform + url) | Social icon links in footer brand zone | `[{ platform: "github", url: "https://github.com/..." }]` | Footer social strip |
| `copyrightText` (short text) | Footer colophon copyright line | `"© 2026 Sugartown Digital"` | Footer colophon |
| `licenseUrl` (short text, optional) | Footer license hyperlink target | `"https://creativecommons.org/licenses/by-nc/4.0/"` | Optional license link in colophon |

## Model & Mode [REQUIRED]

`/model sonnet` — this epic is content model authoring and query updates; no architecture decisions, no component work.

## Non-Goals

- No code changes to `apps/web` or `packages/design-system` — this epic is `apps/contentful-poc` only
- No new Contentful section types beyond what already exists (heroSection, articlesSection) — homepage content uses existing section content types
- No navigation dropdown / multi-level nav — `navigationItem` is flat (label + url) for Stage 1
- No `footerToolchain` field — that carries version/toolchain chip data specific to the Sanity site; the shop site footer does not need it at Stage 1

## Related

- **Linear:** [SUG-188](https://linear.app/sugartown/issue/SUG-188/contentful-content-model-stage-1-sitesettings-nav-navigationitem)
- **Blocks:** [SUG-179](https://linear.app/sugartown/issue/SUG-179/contentful-stage-1-build-out-ds-headerfooter-homepage-article-archive)
- **PRD:** `docs/briefs/platform-evolution-prd.md` Area 2 (Stage 1)
- **Epic template:** `docs/epic-template.md`
