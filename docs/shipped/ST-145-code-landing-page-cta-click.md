---
**Epic:** ST-145 /code landing page + site-wide cta_click GA4 event
**Issue:** [#145](https://github.com/bex-sugartown/sugartown/issues/145)
**Status:** Done
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go, one commit per phase, one CHANGELOG line at the end of each
**Visual:** no
---

# ST-145 /code landing page + site-wide cta_click GA4 event

A measurable `sugartown.io/code` landing page that hands visitors on to GitHub, plus a consent-guarded `cta_click` GA4 event fired from the CMS CTA renderers.

## Background

Resumes and cover letters are adding a link to this repo. A link straight to `github.com` cannot be measured: GitHub does not run our GA4 tag, so UTM parameters on it are dropped. A page on sugartown.io can be measured, then hands the visitor on. It must be a landing page, not an auto-forward: `apps/web/src/lib/consent.js` runs Consent Mode v2 (basic), so gtag.js is not requested until the visitor accepts the banner, and a page that forwards on load leaves before anyone can accept.

GA4 enhanced measurement already records a click from `/code` to `github.com` as an outbound `click`, but only the destination URL: not the button label, style or section, and not internal links at all. A custom `cta_click` event fired from the CMS CTA renderers answers "which button" on `/code` and on every page that uses `ctas`.

Reference surfaces: `page` document rendered by the existing `/:slug` route (`RootPage`); `apps/web/src/components/PageSections.jsx`; `apps/web/src/components/Hero.jsx`; `apps/web/src/lib/consent.js`; `apps/web/src/lib/linkUtils.js`.

## Objective

After this epic, `sugartown.io/code` exists as a Studio-authored `page` (heroSection with two CTAs, one section of tertiary links), `/github` 301s to it, and every CMS CTA click sends `cta_click` to GA4 when consent is granted. Layers touched: frontend (`apps/web/src/lib/` helper and three render sites), content (one `page` document and one `redirect` document in Sanity), manual GA4 admin. Not touched: schema, GROQ queries, design-system `Button`, CSS, consent behaviour.

## Scope

- [x] `trackCtaClick()` helper in `apps/web/src/lib/` next to `consent.js`; sends `cta_click` with `cta_label`, `cta_style`, `cta_section`, `link_url`, `outbound` only when `getConsent() === 'granted'`, never pushing to `dataLayer` otherwise. Phase 1. Layer: frontend.
- [x] Wire the helper into `onClick` of the CMS CTA render sites: `PageSections.jsx` (heroSection primary/secondary/tertiary, ctaSection `buttons.map`) and `Hero.jsx` (primary/secondary). Phase 1. Layer: frontend.
- [x] `PlatformHero.jsx`: read it, wire only if it renders CMS `ctas`. (Checked 2026-10-04: it hardcodes `ctas: []`, so nothing to wire.) Phase 1. Layer: frontend.
- [x] Unit test for the helper: granted sends once with the right params; denied pushes nothing. Phase 1. Layer: frontend.
- [x] Studio `page` document `code`: heroSection (eyebrow "Code", heading "The sugartown.io monorepo", one-line subheading, primary "View the repo on GitHub", secondary "Read the README") plus one section with tertiary links (Changelog, Project board, Platform governance), SEO title and description. Phase 2. Layer: content.
- [x] Studio `redirect` document `/github` to `/code`, 301, active. Phase 2. Layer: content.
- [x] Verify the `/github?utm_source=test` query string survives the 301. Phase 3. Layer: content.
- [ ] Manual GA4 checks in DebugView, consent on and off. Phase 3. Layer: tooling.
- [x] Bex, manual: create event-scoped custom dimensions `cta_label`, `cta_style`, `cta_section` in GA4 Admin. Phase 3.
- [x] Decide on dropping `noreferrer` for `github.com` only (so GitHub Traffic credits the site), or file separately. Phase 3. Layer: frontend.

## Phases

| Phase | Ships | Merge |
|---|---|---|
| 1 | `cta_click` helper, call sites, unit test. `feat(web):`, one commit | merges to `main` when complete |
| 2 | `code` page and `/github` redirect in Sanity (drafts; human publishes) | content only, no git change |
| 3 | DebugView verification, GA4 custom dimensions, `noreferrer` decision | close-out |

Phase 1 has no dependency on Phase 2 and is the only phase a cloud session could take (see Technical notes).

## Acceptance Criteria

- [ ] `https://sugartown.io/code` returns 200 and renders one primary and one secondary hero button plus three tertiary links.
- [ ] Both hero buttons and the external tertiary links open `github.com` in a new tab.
- [ ] `https://sugartown.io/github?utm_source=test` lands on `/code?utm_source=test` (query string survives the 301; verified, not assumed).
- [ ] Consent accepted: GA4 DebugView shows `page_view` on `/code` with the test `utm_source`, and a `click` with `outbound: true` and `link_domain: github.com` on the primary button.
- [ ] Consent declined: the page works and no request goes to `googletagmanager.com`.
- [ ] Consent accepted: each of the five CTAs on `/code` sends one `cta_click` with the right `cta_label`, `cta_style`, `cta_section`, `link_url`, `outbound`; the internal governance link sends `outbound: false`.
- [ ] Consent declined: clicking a CTA pushes nothing to `window.dataLayer`, and accepting afterwards does not replay earlier clicks.
- [ ] A CTA on one other existing page also sends `cta_click` (site-wide, not `/code` only).
- [ ] Internal CTA navigation still works with no delay (no `preventDefault`).
- [ ] Light and dark theme both render correctly, with no new CSS.
- [ ] Content Write Gate: the before/after proposal for the `page` and `redirect` documents is approved before any patch. Drafts only; the human publishes (Human-Publishes Rule).
- [ ] `pnpm validate:urls` and `pnpm test:smoke` pass locally.

## Human QA Walkthrough: example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type that renders a heroSection, ctaSection or `Hero.jsx` CTA, and build the Human QA Walkthrough table (one example local URL per page-type, including unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it. Phase 1 changes only `onClick` handlers on these, so the regression check is that CTA navigation is unchanged.

## Technical notes

- **Content Write Gate fires** for the `page` and `redirect` documents. Copy in the issue is proposed, not dictated word for word (subheading is "one line"), so show a before/after table and wait for approval. No publish without a standalone instruction.
- **Schema changes:** none. No deploy needed.
- **Upstream dependencies:** none blocking. Checked `docs/backlog/` for in-flight epics touching `PageSections.jsx`, `Hero.jsx` or `consent.js` by name at filing: none found by filename; re-check at activation.
- **Activation audits:**
  - Read `apps/web/src/lib/consent.js` for the exact `getConsent()` export and how gtag is invoked.
  - Read `apps/web/src/lib/linkUtils.js` for `isExternalUrl()` and the `rel` handling.
  - Read `apps/studio/schemas/objects/ctaButton.ts` for the `style` option values.
  - Read `apps/web/src/components/PlatformLayout/PlatformHero.jsx` to see whether it renders CMS `ctas`.
  - Read `apps/web/scripts/build-redirects.js` for how `redirect` documents become `_redirects`, and whether query strings are preserved.
- **Design system:** `Button` stays analytics-free; tracking attaches at the call site in apps/web.
- **Known limits (accepted):** only consenting visitors are counted; UTM survives only if consent is given on the landing page; Consent Mode advanced is a separate privacy-posture issue.
- **Cloud:** not a whole-epic cloud candidate. Phase 2 writes to Sanity (cloud never writes) and Phase 3 needs a browser and GA4. Phase 1 alone fits a `cloud` session (a unit test and the build verify it, Visual: no). Bex's call: label #145 `cloud` only if Phase 1 is split out as its own issue first, since a `cloud` issue must be fully verifiable by a command.
- **Model & Mode:** see below.

## Model & Mode [REQUIRED]

`/model sonnet`: a small helper, three call sites, and two Studio documents. No architecture or ambiguity that needs plan mode.

## Non-Goals

- No new component, schema field, route or CSS.
- No change to consent behaviour.
- No change to enhanced-measurement outbound clicks; `cta_click` sits alongside them. Outbound `click` stays for non-CTA links.
- No README or CHANGELOG content changes (beyond the epic's own `[Unreleased]` line at close-out).
- No Consent Mode advanced migration.

## Related

- **GitHub:** [#145](https://github.com/bex-sugartown/sugartown/issues/145)
- **Source draft:** `docs/drafts/code-landing-page.issue.md` (local only, gitignored)
- **Epic template:** `docs/epic-template.md`: complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time

---

## Close-out review

### Acceptance criteria

- [x] `/code` returns 200: Bex confirmed live 2026-10-05 (GA4 Realtime listed 'Code | Sugartown Digital', 3 views).
- [x] `/github?utm_source=test` 301 to `/code?utm_source=test`: checked live 2026-10-05 (issue comment).
- [x] Consent accepted, `cta_click` reaches GA4: Realtime showed `cta_click` count 2 for two clicks (GitHub hero button, Platform governance link).
- [x] Content Write Gate: proposal approved by Bex 2026-10-04 before any write; drafts only, Bex published.
- [x] Internal navigation unchanged: handlers use `onClickCapture` with no `preventDefault`; `pnpm test:smoke` 5 of 5.
- [x] Consent declined pushes nothing to `dataLayer`: unit test, `pnpm --filter web test:unit` 5 of 5.
- [x] Per-button `cta_label` and `cta_style` values: GA4 Overview card (Bex screenshots 2026-10-07) showed `cta_label` Changelog, Platform governance, Project board, README (1 each) and `cta_style` tertiary 3, secondary 1.
- [ ] `cta_section` values: not seen in Realtime. Explore showed `(not set)` for all three dimensions on the 11 `cta_click` events, which fits GA4's delay on new custom dimensions (cause not confirmed). Moved to Post-ship checks.
- [ ] Consent declined sends no request to `googletagmanager.com`: not verified in a browser. Moved to Post-ship checks.
- [ ] `outbound: false` on the governance link and `link_url` per button: not verified. `link_url` and `outbound` have no custom dimension.
- [ ] Hero buttons and tertiary links open `github.com` in a new tab, five CTAs counted, light and dark theme: not verified in a browser (the browser pane was refused localhost access 2026-10-04).
- [ ] A CTA on one other existing page sends `cta_click`: not verified; the governance click on `/code` is the only second source seen.
- [ ] `pnpm validate:urls`: no run recorded. Smoke passed.

### What didn't work

The built-in browser pane was refused access to localhost, so every browser-only criterion fell back to GA4 after deploy. Explore also lags on new custom dimensions, so per-button values were confirmed from the Overview card instead.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Custom dimensions for `link_url` and `outbound` | implementation | declined: Bex created only the three label dimensions; add them if a report needs them |
| Drop `noreferrer` on github.com links | implementation | declined: Bex decided 2026-10-05 to keep it |

### Friction line

none

---

## Post-ship checks

- [ ] Explore shows values for `cta_label`, `cta_style`, `cta_section`: person: GA4 Explore, free form, filter Event name exactly matches `cta_click`; all three read `(not set)` on 2026-10-07, so recheck after a day or two. Also confirms `cta_section`.
- [ ] Consent declined sends nothing to `googletagmanager.com`: person: browser DevTools, Network tab, filter `googletagmanager`, decline consent, click a CTA.
