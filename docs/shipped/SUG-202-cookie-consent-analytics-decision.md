---
**Epic:** SUG-202 — Cookie consent + analytics decision: GA runs with no consent banner
**GitHub Issue:** [#65](https://github.com/bex-sugartown/sugartown/issues/65) (legacy ID SUG-202; Linear retired 2026-09-05)
**Status and priority:** on the board ([project 1](https://github.com/users/bex-sugartown/projects/1)), not copied here
**Labels:** AI Ethics, CMS
**Merge strategy:** (a) Merge-as-you-go
---

# SUG-202 — Cookie consent + analytics decision: GA runs with no consent banner

## Verified 2026-09-19

Re-measured against the repo and production. The Background still holds.

- **GA still loads with no consent banner and no consent-mode gating.** `apps/web/index.html:9-22` injects `gtag.js` (`G-00MF2Q9YJW`) outside localhost. No consent code exists under `apps/web/src`.
- **reCAPTCHA is still on the contact form** (`apps/web/src/components/Form.jsx:5-13`).
- **`docs/ai/agentic-caucus/data-handling.md` still exists**; SUG-284 did not archive it.
- **New: GA does not run on prerendered article, node and case-study pages** (#128). So today GA only counts visitors who arrive on SPA-shell pages. Fixing #128 extends tracking to every entry page, which is why #128 is recorded as blocked by this issue.
- Moved to Todo 2026-09-19 so the decision lands before #128.

> **Backlog doc created 2026-08-15**, backfilled during migration Phase 2. This issue was open
> in Linear with no `docs/backlog/` doc — one of nine found by the first parity audit since
> `validate:epic-docs` was archived by SUG-284. The Background below is the Linear description
> verbatim; it was already substantive, so it is preserved rather than paraphrased.

## Decision, 2026-09-19 (Bex)

**Cookie-consent banner plus Google Analytics Consent Mode v2.** They are one mechanism: the banner collects the choice, consent mode passes it to GA.

| Setting | Decided |
|---|---|
| Default state | `denied` for analytics storage; GA sends nothing until the visitor accepts |
| Consent mode implementation | Basic, not Advanced (Advanced sends cookieless pings before consent, which regulators dispute) |
| Banner | In-house Pink Moon component, not a third-party consent tool (third-party tools add script weight and look generic) |
| Form | Non-modal bar at the bottom of the page, shown on first visit only |
| Choices | Accept and Reject with equal visual weight |
| Persistence | Choice is remembered; a "Cookie settings" link in the footer utility nav reopens it |
| reCAPTCHA | Covered by the banner copy, or loaded only when the contact form is opened |

**Why:** the portfolio is meant to read as a small enterprise-grade platform, and this is the pattern enterprise clients run themselves.

**Rejected:**
- Cookieless analytics (Plausible, Fathom): needs no banner, but loses GA, and it is not the pattern enterprise clients will recognise.
- Leave as is: the Privacy page already states there is no banner.

**Known cost:** GA will count only visitors who accept, so reported numbers drop.

**Before code:**
- Phase 0 vspec for the banner and the settings link. It is a new visual format, so the gate applies.
- Confirm that Google's certified-CMP requirement applies only to its ad products, not GA alone. Believed true, not yet checked against Google's current policy.
- The Privacy page copy update goes through the Content Write Gate.

**Unblocks #128** (GA on prerendered pages), which should load GA through the same consent path.

## Background

Surfaced during SUG-198 Phase 3 (Privacy page alignment).

**Finding:** The site loads Google Analytics (gtag, `G-00MF2Q9YJW`) on every production page with **no cookie-consent banner** and no GA consent-mode gating (verified in `index.html`; documented in `docs/ai/agentic-caucus/data-handling.md`). The contact form also calls Google reCAPTCHA.

SUG-198 corrected the Privacy page to **document this reality accurately** (removed the inaccurate "privacy-friendly / non-identifying analytics" claim). That closes the honesty gap.

**Decision to make (the "fix the reality" path, deferred out of** SUG-198**):**

* Add a cookie-consent banner and/or GA consent-mode gating, or
* Switch to a genuinely privacy-friendly, cookieless analytics tool (e.g. Plausible/Fathom), or
* Accept current state as a documented, low-risk choice for a personal portfolio.

This is a product/compliance decision, not a content fix. SUG-198 non-goals explicitly excluded building compliance tooling.

**Source:** `docs/ai/agentic-caucus/data-handling.md`, `apps/web/index.html` (GA snippet), `apps/web/src/components/Form.jsx` (reCAPTCHA).

## Objective

Visitors choose whether Google Analytics runs. GA loads nothing until they accept. The choice is remembered and can be changed from the footer. The banner reads as a designed part of Pink Moon, not a bolt-on.

## Scope

- [x] Phase 0 vspec at `docs/drafts/SUG-202-cookie-consent-banner.vspec.html`: first-visit banner (bottom bar, light and dark, mobile), the reopened state, and the footer "Cookie settings" control. The persisted-state prototype trigger fires, so the vspec includes a working toggle — layer: design
- [x] Consent Mode v2 default in `apps/web/index.html:9-24`: set every consent type to `denied` before `config`. Basic mode, so `gtag.js` is not injected at all until consent is granted. Keep the existing localhost suppression — layer: web
- [x] Consent storage in `localStorage['st-consent']`, the same pattern as `ThemeToggle.jsx` (`st-theme`) — layer: web
- [x] Banner component, placed per `.claude/rules/react.md` §Component choice gate at activation (design-system package or web) — layer: web
- [x] "Cookie settings" button in the footer utility row (`apps/web/src/components/Footer.jsx:97-100`). That row is built from `apps/web/src/lib/routes.js:130`, not Sanity nav, so this is a button next to the links, not a nav item — layer: web
- [x] Privacy page copy (`page-privacy-and-terms`) updated to describe the banner and name reCAPTCHA. Content Write Gate; Bex publishes — layer: content
- [x] reCAPTCHA needs no code change: it already loads only when a `Form` with an `action` mounts (`Form.jsx:60-63`), not site-wide — layer: content
- [x] Confirm Google's certified-CMP requirement covers ad products only, not GA alone, against Google's current policy page — layer: process
- [x] Update `docs/ai/agentic-caucus/data-handling.md` to match — layer: docs

## Execution log

- **2026-09-19, Pre-Execution Completeness Gate clean.** #65 set to In Progress.
  - Certified-CMP check resolved: Google's requirement covers publishers serving ads through AdSense, Ad Manager or AdMob in the EEA, UK and Switzerland, not GA-only sites ([AdSense Help 13554116](https://support.google.com/adsense/answer/13554116)).
  - Component-Reuse Manifest, layout contract, contrast table and behaviour spec live in the vspec, `docs/drafts/SUG-202-cookie-consent-banner.vspec.html`, §2 to §5. Decisions: extend DS `Callout` banner (optional `role` and `aria-label` props; light-theme label colour to `--st-color-text-brand`, 4.82:1, from pink at 2.85:1); use DS `Button` secondary sm for both choices; new `.fixedBar` and `.consentBody`; `button.utilityLink` in the footer.
  - Dark mode: token inheritance only.
- **2026-09-19, Phase 0 signed off by Bex** ("Approved: start implementation"), including the banner copy.
- **2026-09-19, Phase 1 committed** (`94c7554a`): GA moves out of `index.html` into `apps/web/src/lib/consent.js`, called from `main.jsx`. Consent Mode v2 basic. Because loading now comes from the bundle, prerendered pages get it too, which covers most of #128.
- **2026-09-19, Phase 2 CSS class names approved by Bex** (naming table shown after the module was written; disclosed at the time). Two Callout layout changes beyond the approved props were approved with it: `.bannerBody` fills the row, and the banner stacks below 640px. The vspec showed these as existing; they were not.
- **2026-09-19, Phase 3:** Privacy copy approved under the Content Write Gate and written to `drafts.page-privacy-and-terms` (three spans; marks and list formatting unchanged). Not published: Bex publishes after the code ships. `data-handling.md` v1.1 approved as a diff and committed.

## Phases

| Phase | Ships | Gate |
|---|---|---|
| 0 | Vspec, reviewed and signed off | Tier 1: no code before sign-off |
| 1 | Consent plumbing: denied default, gated `gtag.js` load, storage. No UI; testable by setting storage by hand | none |
| 2 | Banner and footer control, built to the approved vspec | Visual QA |
| 3 | Privacy page copy and `data-handling.md` | Content Write Gate, then Bex publishes |

#128 (GA on prerendered pages) starts after Phase 1, loading GA through the same consent check.

## Acceptance criteria

- [ ] Fresh visit on production with storage cleared: no request to `googletagmanager.com` before a choice (DevTools Network)
- [ ] Accept: `gtag.js` loads and a hit shows in GA Realtime; the choice survives a reload
- [ ] Reject: no GA request after reload; the banner stays dismissed
- [ ] Footer "Cookie settings" reopens the banner; switching to Reject stops GA from the next page load
- [ ] Banner does not cover page content, is reachable by keyboard with visible focus, and meets WCAG AA contrast in light and dark
- [x] Localhost still sends nothing to GA
- [x] Vspec-to-build comparison table approved ("Visual QA approved", 2026-09-19)
- [ ] Privacy copy approved under the Content Write Gate before the patch, and published by Bex
- [x] `pnpm test:smoke` green (5/5, 2026-09-19)

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

The banner renders on every page, so every page-type is in reach.

## Non-Goals

- Cookieless analytics (rejected in the decision above)
- Advanced consent mode
- Showing the banner only to EU and UK visitors
- GA on prerendered pages (#128, next)
- A third-party consent tool

## Model & Mode

`/model sonnet`. One component, a small script change and a copy update, all extending existing patterns. No architectural ambiguity.

## Related

- **GitHub:** [#65](https://github.com/bex-sugartown/sugartown/issues/65)
- Backfilled by the Phase 2 parity audit — `docs/briefs/linear-to-github-migration-plan.md` §5.1

<!-- Chromatic: pending -->

## Close-out, 2026-09-19

**Done, not yet Shipped.** Commits `94c7554a` (Phase 1), `0d1546a0` (Phase 2), `2995d61d` (Phase 3), `8a19f310` (CHANGELOG). Local only until the next `/ship`.

| Step | Result |
|---|---|
| 1 Commit | done |
| 1b Smoke | `pnpm test:smoke` 5/5 green |
| 2 Schema deploy | N/A, no `apps/studio/schemas/` change |
| 3 Visual QA | vspec-to-build table (design-reviewer subagent plus in-browser measurements); "Visual QA approved" by Bex. Four drifts, all disclosed: gutter 32px and elevation shadow (vspec used wrong token values), `.consentActions` override, Callout `.bannerBody` flex and stacking (approved with class names) |
| 4 Chromatic | **deferred to `/ship`** (CSS and a new story changed) |
| 5 Data pipeline | N/A |
| 5b Handoffs | #128: loading GA from the bundle already covers prerendered pages (build checked: prerendered article carries the entry chunk containing `lib/consent.js`, no inline gtag). Commented on #128; what is left there is a production check |
| 6, 6b | this move; vspec copied to `docs/shipped/SUG-202-cookie-consent-banner.vspec.html` |
| 7 CHANGELOG | `[Unreleased]` line added |

**Open after ship, in Acceptance criteria:** the three production checks (no GA request before a choice; accept gives a GA Realtime hit; reject stops GA), and Bex publishing `drafts.page-privacy-and-terms`. Publish the Privacy draft only after the code is live.

**Friction line:** the vspec presented two Callout layout rules as existing DS behaviour when they were new, and the CSS naming table was shown after the module file was written rather than before. Both were disclosed and approved, but each cost a correction round.

## Close-out review

Added 2026-09-19 under ST-130, before this epic reached Shipped, so `/ship` can read its post-ship checks.

### Acceptance criteria

Ticked above with evidence where checkable locally: localhost sends nothing, Visual QA approved, `pnpm test:smoke` 5/5. The three production criteria and the Privacy publish move to Post-ship checks. Keyboard reach, focus return and contrast were verified in the dev app (Phase 2 commit message) and in the Visual QA table.

### What didn't work

The vspec presented two Callout layout rules as existing DS behaviour when they were new, and the CSS naming table was shown after the module file was written. The Privacy draft was published early by mistake and restored the same day; the live page never described the banner for more than a few minutes.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Phase 0 sign-off should include the class-name table and DS changes | workflow-docs | #130 |
| Post-ship checks need a home `/ship` reads | workflow-docs | #130 |
| GA on prerendered pages, production check | implementation | #128 |
| `Table.module.css:26` self-referencing custom property | implementation | #74 |
| `Header.jsx` and `Footer.jsx` are excluded from ESLint | implementation | #86 (background lint session reports there) |
| Privacy page hero heading stored as `Privacy &#038; Terms of Use` | implementation | declined: renders correctly, the web app decodes the entity; stored-data tidiness only |

### Friction line

The vspec presented two Callout layout rules as existing DS behaviour when they were new, and the CSS naming table came after the module was written; each cost a correction round.

## Post-ship checks

- [ ] Fresh visit on https://sugartown.io with storage cleared: no request to `googletagmanager.com` before a choice (session: browser pane, network requests)
- [ ] Accept: `gtag.js` loads (session: network requests) and a hit shows in GA Realtime (person: Bex)
- [ ] Reject, then reload: no GA request (session: browser pane)
- [ ] Publish `drafts.page-privacy-and-terms` once the banner is live (person: Bex, in Studio)
