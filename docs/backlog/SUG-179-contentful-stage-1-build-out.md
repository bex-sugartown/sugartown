---
**Epic:** SUG-179 — Contentful Stage 1 build-out — DS header/footer, homepage, article archive
**Linear Issue:** [SUG-179](https://linear.app/sugartown/issue/SUG-179/contentful-stage-1-build-out-ds-headerfooter-homepage-article-archive)
**Status:** Backlog
**Priority:** 🟢 Next (blocked by SUG-188)
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-179 — Contentful Stage 1 build-out — DS header/footer, homepage, article archive

Replace the hardcoded HTML header and footer in `apps/contentful-poc/src/app/layout.tsx` with DS `Header` / `Footer` components wired to Contentful `siteSettings` data. Add the `/` homepage route. Confirm article routes use DS components. Add `theme.shop.css` for visual brand separation from `sugartown.io`.

## Background

`apps/contentful-poc` was built as a proof that `packages/design-system` works without Sanity. That proof is established (SUG-127). But the site still has a raw HTML `<header>` and `<footer>` in `layout.tsx` — it does not demonstrate DS Regions components in a Next.js context.

The DS `Header` and `Footer` components (Storybook: `Regions/Header`, `Regions/Footer`) accept a `siteSettings` prop and render nav, CTA, preheader, footer columns, and social links. They currently use `urlFor` (Sanity image URL builder) and React Router `Link` — both need adapter replacements for the Next.js / Contentful context.

SUG-188 (Contentful content model Stage 1) is the prerequisite: it extends the Contentful `siteSettings` type to include nav, footer, and social data. This epic cannot begin until SUG-188 is complete and `getSiteSettings()` returns those fields.

## Objective

After this epic, `poc.sugartown.io` renders:
- A DS `Header` (or a Next.js-adapted variant) powered by Contentful `siteSettings` nav data
- A DS `Footer` powered by Contentful `siteSettings` footer data
- A `/` homepage route built from a Contentful `page` entry (hero + article teasers)
- `/articles` and `/articles/[slug]` confirmed using DS `Card` / `Grid` / `ContentCard`
- A `theme.shop.css` token override file creating visual separation from `sugartown.io`

No DS component is modified. All coupling between Contentful data and DS components lives in `apps/contentful-poc/src/lib/` and `apps/contentful-poc/src/components/`.

## Scope

- [ ] Audit `Header.jsx` and `Footer.jsx` for Sanity-specific imports (`urlFor`, React Router `Link`) — document the exact seam points — layer: investigation
- [ ] Create `apps/contentful-poc/src/components/SiteHeader.tsx` — wraps DS `Header` (or a compatible local implementation using DS `Container` + `Button` + `NavigationItem`) adapted for Next.js `Image` and `Link`; accepts `siteSettings` from Contentful — layer: Next.js component
- [ ] Create `apps/contentful-poc/src/components/SiteFooter.tsx` — wraps DS `Footer` adapted for Next.js; accepts `siteSettings` from Contentful — layer: Next.js component
- [ ] Wire `SiteHeader` and `SiteFooter` into `apps/contentful-poc/src/app/layout.tsx` — remove raw HTML `<header>` / `<footer>` — layer: layout
- [ ] Add `/` homepage route: `apps/contentful-poc/src/app/page.tsx` — fetches `page` entry with `slug: "home"` from Contentful; renders via existing `SectionList.tsx` dispatcher — layer: Next.js route
- [ ] Verify `/articles` and `/articles/[slug]` use DS `Card` / `Grid` / `ContentCard` — document findings; fix any raw-HTML fallbacks — layer: audit + fix
- [ ] Create `theme.shop.css` in both `apps/web/src/design-system/styles/` and `packages/design-system/src/styles/` with at minimum one semantic token override (brand primary or bg surface) — layer: DS tokens / theme
- [ ] Register `theme.shop.css` in `validate:style-mirror` — run `pnpm validate:style-mirror` to confirm zero drift — layer: tooling

## Phases

**Phase 1 — Header/Footer adapter components:** SiteHeader.tsx, SiteFooter.tsx, wired into layout.tsx.
**Phase 2 — Homepage route:** `app/page.tsx` fetching and rendering Contentful `home` page entry.
**Phase 3 — Article route audit + theme.shop.css:** Confirm DS components on article routes; create and register theme file.

## Acceptance criteria

- [ ] DS Header renders on all routes with Contentful `siteSettings` nav data — no raw `<header>` HTML in `layout.tsx`
- [ ] DS Footer renders on all routes with Contentful `siteSettings` footer/social data — no raw `<footer>` HTML in `layout.tsx`
- [ ] `/` homepage returns HTTP 200 and renders at least one DS section (hero or card grid) from Contentful content
- [ ] `/articles` and `/articles/[slug]` use DS `Card` / `Grid` — verified by reading component tree, not just visual inspection
- [ ] `theme.shop.css` exists in both style dirs with at minimum one token override
- [ ] `pnpm validate:style-mirror` passes with `theme.shop.css` registered
- [ ] No DS component file modified — all Contentful coupling in `apps/contentful-poc/src/lib/` or `src/components/`
- [ ] `pnpm --filter contentful-poc build` passes with zero TypeScript errors

## Human QA Walkthrough — example local pages

Activation audit: read `apps/contentful-poc/src/app/` to list all routes. Build the Human QA Walkthrough table (one example local URL per route, including unchanged routes as regression guards) per `docs/epic-template.md` §Human QA Walkthrough at activation time.

## Technical notes

**Prerequisite — SUG-188 must be complete:** `getSiteSettings()` must return `primaryNav`, `footerColumns`, and `socialLinks` before Phase 1 can proceed. Do not start this epic until those fields exist in the Contentful space and are returned by the query.

**Header/Footer adapter strategy:** The existing `Header.jsx` uses `urlFor()` (Sanity image URL builder) for the logo image and React Router `Link` for nav links. For the Contentful adapter: replace `urlFor()` with Next.js `<Image>` (logo URL from Contentful's CDN is already a direct URL, no transformation needed); replace React Router `Link` with Next.js `Link`. The DS Container, Button, NavigationItem, and Drawer components are framework-agnostic — they do not use React Router internally and do not need modification.

**`"use client"` boundary:** The Header has a scroll listener (`useEffect`) and mobile open state (`useState`) — it is a client component. The page root layout can remain a server component; `SiteHeader` must be marked `"use client"` (established pattern from SUG-127 Decision 10). Document this in code comment.

**theme.shop.css rules (CLAUDE.md enforced):**
- Only `var(--st-primitive)` references — no hex, rgba, or hsla values
- Only semantic `--st-*` token overrides — no new token names
- Must be byte-identical in both style dirs
- Must be registered in `validate:style-mirror` before the epic closes

**Activation audit:** read `apps/contentful-poc/src/app/layout.tsx` to see the exact current header/footer HTML before writing adapters.

**Model & Mode [REQUIRED]:** `/model opusplan` — Opus plans (Pre-Execution Gate → Files to Modify), Sonnet executes after plan-mode exit.

## Non-Goals

- No `preheader` support in Stage 1 — `Preheader` component exists but Contentful `siteSettings` Stage 1 does not include a preheader field
- No navigation dropdowns — `navigationItem` is flat for Stage 1
- No article archive filter UI (tag filter, sort) — that is Stage 2 scope within this epic; Stage 1 confirms DS component usage only
- No `apps/web` changes — this epic is `apps/contentful-poc` only
- No `apps/contentful-poc` rename to `apps/shop` — that is SUG-181 scope

## Related

- **Linear:** [SUG-179](https://linear.app/sugartown/issue/SUG-179/contentful-stage-1-build-out-ds-headerfooter-homepage-article-archive)
- **Blocked by:** [SUG-188](https://linear.app/sugartown/issue/SUG-188/contentful-content-model-stage-1-sitesettings-nav-navigationitem)
- **Blocks:** [SUG-181](https://linear.app/sugartown/issue/SUG-181/shopify-stage-3-rename-appscontentful-poc-appsshop-add-shopify)
- **PRD:** `docs/briefs/platform-evolution-prd.md` Area 2 (Stage 1)
- **Storybook Regions:** `http://localhost:6006/?path=/docs/regions-header--docs`, `http://localhost:6006/?path=/docs/regions-footer--docs`
- **Epic template:** `docs/epic-template.md`
