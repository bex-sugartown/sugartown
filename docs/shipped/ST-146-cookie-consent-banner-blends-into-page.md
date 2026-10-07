---
**Epic:** ST-146 Cookie consent banner blends into the page
**Issue:** [#146](https://github.com/bex-sugartown/sugartown/issues/146)
**Status:** Done
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

- [x] Vspec for the banner (light, dark, mobile, scrolled to page bottom) approved before any CSS. Phase 0. Layer: design. **Built as an interactive prototype** (same file, vanilla JS): two Phase 0 triggers fire, sticky positioning whose effect depends on scroll (the overlap only shows at the page bottom) and persisted state (accept and reject). It lets the reviewer scroll to the bottom and toggle both choices.
- [x] Banner surface, border and shadow changed so it separates from the page in both themes, meeting contrast for its rules and text. Phase 1. Layer: design-system CSS, tokens only, no raw colours. Approved 2026-10-07: light = white fill (`--st-callout-banner-bg`) plus `--st-color-border-strong` edges; dark = brighter edge only, fill unchanged.
- [x] Bottom clearance so the fixed bar does not cover the last footer rows while the banner is open. Phase 1. Layer: web JS (corrected from web CSS, approved 2026-10-07): `ConsentBanner.jsx` pads `#root` instead of `<body>`, because `globals.css` sets `body { height: 100% }`.
- [x] Confirm whether other `Callout variant="banner"` uses change (Storybook Snapshot, Preheader, Header stories) and approve those diffs. Phase 1. Layer: Storybook. Result: Snapshot and Banner stories change; Preheader does not use Callout; Header stories not opened.
- [ ] Chromatic baselines for the changed banner stories accepted. Phase 1. Layer: Storybook. <!-- Chromatic: pending --> Deferred to the ship step; changed stories are Callout Banner, Multi Line, Banner Multi Line, Snapshot, and ConsentBanner.

## Phases

| Phase | Ships | Merge |
|---|---|---|
| 0 | Approved interactive vspec (prototype) | no code |
| 1 | Banner CSS, bottom clearance, stories | merges to `main` when complete |

## Acceptance Criteria

- [x] In light theme the banner's surface differs visibly from the page background; border or surface contrast measured and recorded in the shipped doc.
- [x] In dark theme the banner stays visible; contrast measured and recorded.
- [x] With the banner open and the page scrolled to the bottom, the version and toolchain rows are fully readable.
- [x] `pnpm validate:tokens --strict-colors` and `pnpm validate:style-mirror` pass; no raw colour values added.
- [ ] Callout `banner` stories and ConsentBanner stories render correctly in both themes; Chromatic changes reviewed and accepted by Bex.
- [x] Banner Accept and Reject still work, and the choice persists (no behaviour change).
- [x] `pnpm test:smoke` passes locally.

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

---

## Close-out review

### Acceptance criteria

- Light surface differs from page: met. White fill (`--st-callout-banner-bg`) with `--st-color-border-strong` edges. Contrast figures (edge 6.98:1 light, 3.20:1 dark, meta line 5.23:1) are from the approved vspec, computed from token hex; not re-measured in a browser.
- Dark stays visible: met by the brighter edge only, fill unchanged (vspec, 3.20:1).
- Footer rows readable at page bottom: met by design (`#root` padded instead of `<body>`); Bex approved Visual QA. I did not drive this in a browser: the built-in browser refused the app's localhost server.
- `validate:tokens --strict-colors` and `validate:style-mirror`: pass, 2026-10-07.
- Stories render in both themes: Callout docs and Banner Multi Line viewed in light only by the session; Bex approved Visual QA. Chromatic baselines pending (see Post-ship checks).
- Accept and Reject unchanged: no behaviour code touched beyond the padding target.
- `pnpm test:smoke`: 5 of 5 passed locally, 2026-10-07.

### What didn't work

- The epic filed the clearance fix as web CSS; the cause was the JS target (`body` padding with `body { height: 100% }`). The vspec found it and the scope was corrected.
- The banner body text sat above the row's centre line. Cause: `globals.css` gives `p` a bottom margin and `.bannerBody p` had no reset. Present since SUG-202, fixed in `6bf0de0a` after Bex spotted it.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Callout docs page has no description block (file-level comment is not attached to the component) | implementation | declined: cosmetic, not part of this epic |
| Header stories not checked for `Callout variant="banner"` | implementation | declined: Header has no Callout import; confirm at Chromatic review |
| Row-variant Callouts not reviewed for the same alignment | implementation | declined: the row variant already resets paragraph margins and centres both columns |

### Friction line

The Callout banner text offset shipped in SUG-202 and was found by Bex looking at it, because no check compares a Storybook story to its row-variant sibling.

---

## Post-ship checks

- [ ] Chromatic baselines for Callout (Banner, Multi Line, Banner Multi Line, Snapshot) and ConsentBanner accepted: person, in Chromatic at ship.
- [ ] Banner visible on production in light theme and clears the footer at page bottom: person, open sugartown.io/code, choose Cookie settings, scroll to the bottom.
