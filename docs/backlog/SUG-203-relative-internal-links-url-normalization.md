---
**Epic:** SUG-203 — Relative internal links — same-origin URL normalization + nav data fix
**Linear Issue:** [SUG-203](https://linear.app/sugartown/issue/SUG-203/relative-internal-links-same-origin-url-normalization-nav-data-fix)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-203 — Relative internal links — same-origin URL normalization + nav data fix

Internal pages are linked with absolute prod URLs (`https://sugartown.io/...`) instead of relative paths, so on localhost they bounce to production and even in prod they trigger a full page reload instead of client-side SPA routing.

## Background

The header "Platform ▾" dropdown links to four sub-pages that take the user to `sugartown.io` even when browsing on `localhost`. Root cause (confirmed via Sanity): the `navigation` document (`89b0c0bc-826f-4647-ba9a-fb5262b6b669`, referenced by `siteSettings.primaryNav`) stores the Platform children — Governance, Monorepo, CMS, Design System — as `linkType: 'external'` with absolute `https://sugartown.io/platform/*` URLs. Those four `/platform/*` pages are React code routes in `App.jsx`, not Sanity page docs, so the nav's `internal` link type (which needs an `internalPage` reference) had nothing to point at, and they were entered as external absolute URLs. The link layer (`isExternalUrl` in `lib/linkUtils.js`) sees `https://` and renders them as `<a target="_blank">`, producing the prod bounce + full reload. Reference surfaces: `apps/web/src/lib/linkUtils.js`, `apps/web/src/lib/resolveNavUrl.js`, `apps/web/src/components/Header.jsx`, `apps/web/src/components/Footer.jsx`, the `navigation` Sanity doc.

## Objective

After this epic, an absolute URL whose host is the site's own domain renders as a relative React Router link (SPA navigation) instead of an external `<a>`, in dev and prod alike. The fix lives in the link-resolution layer (`lib/linkUtils.js`) so it covers the header, footer, and any future same-origin self-link, and the four offending nav-doc entries are repointed to relative paths so the stored data is also correct. Layers touched: app utility (`lib/linkUtils.js`) and Sanity content (the `navigation` doc — structural URL fix only, no human-readable copy). Explicitly out of scope: the nav schema itself (no new link type), and creating Sanity page docs for the code-routed `/platform/*` pages.

## Scope

- [ ] Same-origin normalization in `apps/web/src/lib/linkUtils.js` — a helper that, given a URL whose host is `sugartown.io`, `www.sugartown.io`, or the current `window.location.host`, returns the relative `pathname + search + hash`; `isExternalUrl` / `getLinkProps` treat such URLs as internal (React Router `to`). Prerender-safe (guard `typeof window`). Layer: app utility.
- [ ] Repoint the 4 Platform nav children in the `navigation` doc (`89b0c0bc-...`) from absolute `externalUrl` to relative paths (`/platform/governance`, `/platform/monorepo`, `/platform/cms`, `/platform/design-system`). Layer: Sanity content (structural). Patch lands as a draft; human publishes.
- [ ] Audit for any other absolute same-origin self-links (footer, CTAs, body links, nav top-level items) and confirm they normalize correctly or list any that need data fixes. Layer: validation.

## Acceptance criteria

- [ ] On `localhost`, clicking the Platform dropdown items (Governance / Monorepo / CMS / Design System) stays on `localhost` and navigates via SPA (no full reload, no prod bounce).
- [ ] `getLinkProps('https://sugartown.io/platform/governance')` returns `{ isExternal: false, linkProps: { to: '/platform/governance' } }`; `getLinkProps('https://pinkmoon.sugartown.io/')` and `getLinkProps('https://github.com/...')` remain external.
- [ ] `isExternalUrl` still returns true for `mailto:`, `tel:`, and genuinely external hosts; relative paths still internal.
- [ ] Prerender (`prerender-content.mjs`) runs without a `window is not defined` error from the new helper.
- [ ] The 4 nav-doc children resolve to relative paths (draft patched; published by human). Structural URL change only — Content Write Gate does not fire (no copy).
- [ ] Existing `linkUtils` consumers (Button, Link atom, NavigationItem, Footer) render unchanged for external and relative inputs (no regression).

## Human QA Walkthrough — example local pages

> Activation audit: `lib/linkUtils.js` is consumed by Header, Footer, NavigationItem, Button — components rendered on every page. Read `apps/web/src/App.jsx` for the route map, then verify on at least: `/` (homepage header + footer nav), `/platform/governance` (the reported dropdown), and one content page (e.g. `/articles/<slug>`) that external links (GitHub, Storybook `pinkmoon.sugartown.io`, social) still open externally while same-origin links route via SPA. This is behavioural (href/routing), not a visual/CSS change — no Chromatic snapshot needed.

## Technical notes

- **Content Write Gate:** does NOT fire — the nav-doc change is a structural URL fix (no human-readable copy). The Sanity patch lands as a draft for human publish per the human-publishes rule.
- **Blast radius:** `isExternalUrl` / `getLinkProps` are shared by Button, Link atom, NavigationItem, Footer. The change must be additive (same-origin absolute → internal) and leave external/mailto/tel/relative behaviour unchanged. Add unit-style verification via the AC examples.
- **Same-origin host list:** `sugartown.io`, `www.sugartown.io`, plus runtime `window.location.host`. Use `new URL(url, base)` inside a try/catch; on parse failure leave the URL untouched. Subdomains like `pinkmoon.sugartown.io` are NOT in the list — they stay external.
- **Prerender safety:** the helper must guard `typeof window === 'undefined'` (the prerender step runs in Node) and fall back to the static host list only.
- **Activation audits:** (1) read `lib/linkUtils.js` + `lib/resolveNavUrl.js` before editing; (2) re-query the `navigation` doc `89b0c0bc-...` for current child `_key`s before patching (Sanity may reassign keys).
- **Model & Mode [REQUIRED]:** `/model opusplan` — small but shared-utility change with regression risk; Opus plans the `linkUtils` edit + consumer check, Sonnet executes.

## Non-Goals

- No nav schema change (no new link type for code-routed pages) — the relative-path approach works within the existing schema.
- No creation of Sanity page docs for the code-routed `/platform/*` pages — they remain React routes.
- No redirect/canonical changes — SEO canonical URLs (which are correctly absolute) are untouched; this is about clickable navigation only.

## Related

- **Linear:** [SUG-203](https://linear.app/sugartown/issue/SUG-203/relative-internal-links-same-origin-url-normalization-nav-data-fix)
- **Surfaced during:** [SUG-198](https://linear.app/sugartown/issue/SUG-198) Phase 3
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, and Files to Modify at activation time
