---
**Epic:** ST-146 Cookie consent banner blends into the page
**Issue:** [#146](https://github.com/bex-sugartown/sugartown/issues/146)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go, one commit per phase, one CHANGELOG line at the end of each
**Visual:** yes
**Vspec:** `docs/drafts/ST-146-cookie-consent-banner-blends-into-page.vspec.html`
---

# ST-146 Cookie consent banner blends into the page

Make the consent banner clearly visible in both themes and stop it covering the page's last rows.

## Background

Seen on production 2026-10-05, on `/code`, in a regular window after choosing "Cookie settings". In light theme the banner is pale grey on a light grey page and only the thin rules and a faint shadow separate the two. At the bottom of the page it sits over the footer's version and toolchain rows. In dark theme it is visible but low contrast. Storybook's Callout Snapshot (Chromatic) shows the same grey strip for the `banner` variant, so the fix may belong in the design system, not only in the web wrapper.

The banner is the Callout `banner` variant (SUG-202, #65). Reference surfaces: `packages/design-system/src/components/Callout/Callout.module.css` (`.banner` fills with `--st-card-label-bg`), `apps/web/src/components/ConsentBanner.module.css` (`position: fixed`, no page bottom clearance), `apps/web/src/components/ConsentBanner.stories.tsx`. Consent gates the new `cta_click` measurement (#145), so a banner visitors do not see is a measurement problem as well as a design one.

## Objective

After this epic the consent banner is clearly distinguishable from the page in light and dark themes, and it never hides footer content when scrolled to the bottom. Layers touched: design-system CSS, web CSS, Storybook stories. Not touched: consent behaviour, copy, GA loading, schema, GROQ, Sanity content.

## Scope

- [ ] Vspec for the banner (light, dark, mobile, scrolled to page bottom) approved before any CSS. Phase 0. Layer: design. **Built as an interactive prototype** (same file, vanilla JS): two Phase 0 triggers fire, sticky positioning whose effect depends on scroll (the overlap only shows at the page bottom) and persisted state (accept and reject). It lets the reviewer scroll to the bottom and toggle both choices.
- [ ] Banner surface, border and shadow changed so it separates from the page in both themes, meeting contrast for its rules and text. Phase 1. Layer: design-system CSS, tokens only, no raw colours.
- [ ] Bottom clearance so the fixed bar does not cover the last footer rows while the banner is open. Phase 1. Layer: web CSS.
- [ ] Confirm whether other `Callout variant="banner"` uses change (Storybook Snapshot, Preheader, Header stories) and approve those diffs. Phase 1. Layer: Storybook.
- [ ] Chromatic baselines for the changed banner stories accepted. Phase 1. Layer: Storybook.

## Phases

| Phase | Ships | Merge |
|---|---|---|
| 0 | Approved interactive vspec (prototype) | no code |
| 1 | Banner CSS, bottom clearance, stories | merges to `main` when complete |

## Acceptance Criteria

- [ ] In light theme the banner's surface differs visibly from the page background; border or surface contrast measured and recorded in the shipped doc.
- [ ] In dark theme the banner stays visible; contrast measured and recorded.
- [ ] With the banner open and the page scrolled to the bottom, the version and toolchain rows are fully readable.
- [ ] `pnpm validate:tokens --strict-colors` and `pnpm validate:style-mirror` pass; no raw colour values added.
- [ ] Callout `banner` stories and ConsentBanner stories render correctly in both themes; Chromatic changes reviewed and accepted by Bex.
- [ ] Banner Accept and Reject still work, and the choice persists (no behaviour change).
- [ ] `pnpm test:smoke` passes locally.

## Human QA Walkthrough: example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach, and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it. The banner is global, so every page-type is reached; the bottom clearance change is the one most likely to affect page layout.

## Technical notes

- **Content Write Gate:** does not fire. No Sanity content changes.
- **Schema changes:** none, no deploy.
- **Upstream dependencies:** none blocking. At activation, check `docs/backlog/` for in-flight epics touching `Callout.module.css` or `ConsentBanner.module.css` by name.
- **Activation audits:**
  - Read `Callout.module.css` and `Callout.tsx` for every consumer of `variant="banner"` before choosing whether the fix lives in the design system or the web wrapper.
  - Run `node apps/web/scripts/validate-style-mirror.js` to confirm whether Callout CSS has a web mirror.
  - Read `docs/shipped/SUG-202-cookie-consent-analytics-decision.md` and its vspec for the intended banner appearance, so the fix restores intent rather than inventing a new look.
  - Read `.claude/rules/css-layout.md` §CSS class pre-implementation reuse audit before adding any class.
- **Design system:** a change to `packages/design-system` needs Chromatic review at ship.

## Model & Mode [REQUIRED]

`/model sonnet`: a small CSS change in one component and one wrapper, after an approved vspec. No architecture or ambiguity that needs plan mode.

## Non-Goals

- No change to consent behaviour, banner copy, buttons or GA loading.
- No redesign of the Callout row variants (info, tip, warn, danger).
- No new component.

## Related

- **GitHub:** [#146](https://github.com/bex-sugartown/sugartown/issues/146)
- **Origin:** SUG-202 (#65), `docs/shipped/SUG-202-cookie-consent-analytics-decision.md`
- **Related:** #145 (consent gates `cta_click`)
- **Epic template:** `docs/epic-template.md`: complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
