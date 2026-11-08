---
**Epic:** ST-213 — Homepage mobile Core Web Vitals remediation
**Issue:** [#213](https://github.com/bex-sugartown/sugartown/issues/213)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** no
---

# ST-213 — Homepage mobile Core Web Vitals remediation

Raise the homepage's mobile PageSpeed score and cut its LCP by fixing the four opportunities the 2026-07-27 report names.

## Background

A PageSpeed Insights run on `https://sugartown.io` (2026-07-27, homepage) scored mobile Performance 65/100 with LCP 6.6s. That matches the long-standing "poor" baseline in `PERF_BACKUP` in `apps/web/src/components/CwvSnapshot.jsx` (mobile `performance: 61, lcp: 6500`), so it is a known gap, not a new regression, and it has never had its own remediation epic. This epic was Phase 2 of #84 (SUG-253) and was split out on 2026-11-08 because it can only be proven by a re-run on the deployed site, while #84's Agentic Browsing fixes can close first. The report names four opportunities: render-blocking requests (about 1,650ms), image delivery (about 63KiB), unused JavaScript (about 156KiB), unused CSS (about 28KiB). The same report shows desktop CLS 0.148 (failing) and mobile CLS 0 (passing), which is not yet explained.

## Objective

After this epic, the homepage's mobile Performance score is measurably above 65/100 and LCP is below 6.6s, with before and after numbers from real Lighthouse runs recorded in the shipped doc, and `PERF_BACKUP` refreshed to match. The epic touches the frontend build and loading layer (`apps/web`: script and style loading, image delivery, bundle size) and the verification pipeline (`lighthouserc.cjs` read-only, `/update-cwv`). It does not touch Sanity schema, GROQ queries or content, and it does not change how any page looks.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Re-run Lighthouse CI against the production homepage to record a current mobile and desktop baseline before any change — layer: verification
- [ ] Remove or defer the render-blocking requests the report names (about 1,650ms) — layer: frontend/build
- [ ] Reduce image delivery on the homepage (about 63KiB: size, format, dimensions, loading) — layer: frontend
- [ ] Reduce unused JavaScript on the homepage (about 156KiB) — layer: frontend/build
- [ ] Reduce unused CSS on the homepage (about 28KiB) — layer: frontend/build
- [ ] Re-run Lighthouse on the deployed homepage, record before and after for Performance, LCP, FCP and CLS, and refresh `PERF_BACKUP` with `/update-cwv` — layer: verification
- [ ] Re-run the desktop CLS check (0.148 against mobile 0) and record whether it is a real desktop-only shift or run-to-run variance — layer: verification

## Phases

| Phase | What ships at the end of it | Gate | Done |
|---|---|---|---|
| 1 | Baseline recorded, then the four fixes, one commit each | none | [ ] |
| 2 | Deployed re-run, `PERF_BACKUP` refreshed, CLS discrepancy resolved | a push (`/ship`) | [ ] |

Scope items 1 to 5 ship in Phase 1. Items 6 and 7 ship in Phase 2.

## Acceptance Criteria

- [ ] A baseline Lighthouse mobile run on production is recorded in the epic doc before the first fix, with its date and command
- [ ] A Lighthouse mobile run on the deployed homepage after `/ship` shows Performance above 65 and LCP below 6.6s; "no measurable change" is not an acceptable close-out
- [ ] Each of the four opportunities is either gone from the post-fix report or recorded with the reason it was not fixed
- [ ] `PERF_BACKUP` in `CwvSnapshot.jsx` shows the post-fix scores, not the pre-fix baseline
- [ ] The desktop CLS discrepancy has a recorded verdict: real or variance, with the runs that show it
- [ ] `pnpm test:smoke` passes locally, and the homepage looks the same before and after in a browser at mobile and desktop widths

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Content Write Gate:** not triggered, no Sanity writes.
- **Instruction & Rule File Write Gate:** not triggered, no rule-file edits expected.
- **Schema changes:** none.
- **Upstream dependencies:** none blocking. Relates to #84 (SUG-253), which this was split from, and to the existing `/update-cwv` skill and `lighthouserc.cjs`, which this epic uses and does not change.
- **Activation audits:**
  - Run `pnpm exec lhci autorun --config=lighthouserc.cjs` (or `/update-cwv`) and record the baseline before reading any code; the `PERF_BACKUP` values in Background are a snapshot that may be stale.
  - Expand the report's opportunity rows to get the actual file names behind the render-blocking, unused JS and unused CSS figures before choosing a fix.
  - Read the homepage's image sources and `loading`/`fetchpriority` attributes in `apps/web/src/pages/HomePage.jsx` before changing image delivery.
  - Any fix that changes how an image or hero looks stops the epic and sets **Visual: yes**, which brings the Phase 0 visual spec gate (`CLAUDE.md`).
- **Chromatic:** a push touching CSS or component JSX needs one human-approved Chromatic pass (`CLAUDE.md` close-out step 4).

## Model & Mode [REQUIRED]

`/model sonnet`. The work is standard frontend performance fixes against four named, already-quantified opportunities, with no architecture decision to make.

## Non-Goals

- No WebMCP integration, which is a separate, much larger initiative.
- No other routes (`/articles`, `/case-studies` and others). Extending the same fixes there is a reasonable follow-on, not committed here.
- No change to `/update-cwv`'s mechanics or `lighthouserc.cjs`'s monitored URL list. This epic uses that pipeline and does not redesign it.
- No visual change to the homepage.

## Related

- **GitHub:** [#213](https://github.com/bex-sugartown/sugartown/issues/213)
- **Split from:** [#84](https://github.com/bex-sugartown/sugartown/issues/84) (SUG-253), Phase 2
- **PSI report (source):** [Mobile](https://pagespeed.web.dev/analysis/https-sugartown-io/3i7vwoq7b0?utm_source=search_console&form_factor=mobile&hl=en)
- **Existing tooling:** `.claude/skills/update-cwv/`, `apps/web/src/components/CwvSnapshot.jsx`, `lighthouserc.cjs`
- **Epic template:** `docs/epic-template.md`
