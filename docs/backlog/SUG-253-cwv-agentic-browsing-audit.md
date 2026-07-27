---
**Epic:** SUG-253 — CWV audit & Agentic Browsing fixes (llms.txt, accessibility tree, mobile performance)
**Linear Issue:** [SUG-253](https://linear.app/sugartown/issue/SUG-253/cwv-audit-and-agentic-browsing-fixes-llmstxt-accessibility-tree-mobile)
**Status:** Backlog
**Priority:** 🟣 Soon — post-sprint
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
---

# SUG-253 — CWV audit & Agentic Browsing fixes (llms.txt, accessibility tree, mobile performance)

Fix the two failing checks in PageSpeed Insights' new "Agentic Browsing" category
(llms.txt spec compliance, accessibility-tree well-formedness), and address the mobile
Core Web Vitals gap the same report surfaces on the homepage.

## Background

A fresh PageSpeed Insights run against `https://sugartown.io` (2026-07-27, homepage,
report links: [desktop](https://pagespeed.web.dev/analysis/https-sugartown-io/3i7vwoq7b0?utm_source=search_console&form_factor=desktop&hl=en),
[mobile](https://pagespeed.web.dev/analysis/https-sugartown-io/3i7vwoq7b0?utm_source=search_console&form_factor=mobile&hl=en))
shows a new "Agentic Browsing" audit category — Google's own description: "checks ensure
high-quality, browsable websites for AI agents and validate the correctness of WebMCP
integrations. This category is still under development and subject to change." Sugartown
scores **0/3 on desktop, 1/3 on mobile**. Two checks fail on both form factors:
"Accessibility tree is not well-formed" and "llms.txt does not follow recommendations."
Three checks are Not Applicable on both (WebMCP form coverage, WebMCP tools registered,
WebMCP schemas are valid) — expected, since the site has no WebMCP integration.
`apps/web/public/llms.txt` already exists (added SUG-58 Phase 3, "last reviewed April
2026" per its own footer) but is written as prose under markdown headings rather than the
canonical linked-list format the emerging llms.txt spec (llmstxt.org) and this new PSI
check expect — a concrete, likely quick fix once confirmed against the spec. The
"accessibility tree is not well-formed" failure has no expanded detail captured in this
epic's authoring pass (the PSI report's row was collapsed in the screenshots supplied, and
a live PSI API pull hit a 429 rate limit) — Phase 1 must expand this audit's detail rows
directly before diagnosing a fix. Separately, the same report shows the homepage's mobile
Core Web Vitals in the same range as the already-tracked "poor" baseline recorded in
`CwvSnapshot.jsx`'s `PERF_BACKUP` constant (mobile `performance: 61, lcp: 6500`) — this
report's mobile Performance 65/100, LCP 6.6s is consistent with a known, longstanding gap,
not a fresh regression, but it has never had a dedicated remediation epic.

## Objective

After this epic: (1) `apps/web/public/llms.txt` conforms to the llms.txt spec format
Google's Agentic Browsing check validates against, and passes that check on both form
factors; (2) the "accessibility tree is not well-formed" failure is diagnosed with real
detail (not guessed) and fixed; (3) the homepage's mobile CWV performance score improves
measurably from the 65/100, 6.6s-LCP baseline via the specific opportunities this report
names (render-blocking requests, image delivery, unused JS/CSS). This epic touches:
`apps/web/public/llms.txt`, whatever markup/ARIA issue is causing the accessibility-tree
failure (surface unknown until Phase 1's live audit expansion), and homepage-specific
performance work (render-blocking script/style loading, image optimization, JS/CSS bundle
trimming). It does not touch WebMCP integration (the 3 N/A checks) — that would be a
separate, much larger initiative requiring the site to register forms/tools/schemas that
don't exist yet.

## Scope

- [ ] Expand and read the full "Accessibility tree is not well-formed" audit detail (via
      the PSI report UI or the PageSpeed Insights API with a valid key — the public
      unkeyed endpoint hit a 429 during epic authoring) to identify the specific
      violation(s) before proposing any fix — layer: audit
- [ ] Fetch and read the current llms.txt spec recommendation (linked from the audit —
      "browsable websites for AI agents") and diff `apps/web/public/llms.txt`'s existing
      prose-under-headings format against it — layer: audit
- [ ] Rewrite `apps/web/public/llms.txt` to the compliant format (likely: H1 site name,
      optional blockquote summary, H2 sections containing markdown link lists
      `- [Title](url): description` rather than prose paragraphs) while preserving the
      real content already documented (site structure, key topics, author info, technical
      notes, sitemap reference, update cadence) — layer: content/static file
- [ ] Fix the accessibility-tree well-formedness issue found in the first audit item —
      layer: frontend (scope narrows once the specific violation is known)
- [ ] Address the report's named mobile-performance opportunities on the homepage:
      render-blocking requests (~1,650ms estimated savings), image delivery (~63KiB),
      reduce unused JavaScript (~156KiB), reduce unused CSS (~28KiB) — layer:
      frontend/build
- [ ] Re-run PageSpeed Insights (or `/update-cwv`'s Lighthouse CI) against the deployed
      homepage post-fix and record the before/after scores for all four categories
      (Performance, Accessibility, Agentic Browsing) plus the specific metrics (LCP, FCP,
      CLS) — layer: verification

## Phases

**Phase 1 — Agentic Browsing fixes.** Expand the accessibility-tree audit detail, fix
llms.txt to spec, fix the accessibility-tree issue. Ships independently — merge-as-you-go.

**Phase 2 — Mobile CWV performance remediation.** Address the render-blocking, image
delivery, and unused JS/CSS opportunities named in the mobile report. Re-run
PageSpeed/Lighthouse to confirm improvement and record the new baseline.

## Acceptance criteria

- [ ] `apps/web/public/llms.txt` passes the "llms.txt does not follow recommendations"
      check on a re-run PageSpeed Insights report (both form factors)
- [ ] The "accessibility tree is not well-formed" check passes on a re-run report (both
      form factors), with the root cause documented (not just "it passed now")
- [ ] Homepage mobile Performance score improves measurably from the 65/100 baseline,
      with LCP reduced from 6.6s — exact target set once Phase 2's specific fixes are
      chosen, but "no measurable change" is not an acceptable close-out state
- [ ] `/update-cwv`'s `PERF_BACKUP` constant in `CwvSnapshot.jsx` is refreshed to reflect
      the post-fix scores, not left showing the pre-fix "poor" baseline
- [ ] Before/after scores for both phases are recorded in the shipped doc, sourced from a
      real re-run, not estimated

## Human QA Walkthrough — example local pages

Not applicable in the CSS/layout-token sense for Phase 1 (llms.txt is a static file
outside the app; the accessibility-tree fix's actual surface is unknown until audited).
**Phase 2 does apply** if any performance fix touches image/script loading on shared
layout components — re-visit this section once Phase 2's specific implementation is
scoped, per `docs/epic-template.md` §Human QA Walkthrough, since homepage performance
fixes commonly touch hero/image-loading patterns used on more than one page.

## Technical notes

- **Content Write Gate:** Not triggered — `llms.txt` is a static file in
  `apps/web/public/`, not a Sanity content write. The Content Write Gate governs Sanity
  MCP writes specifically; this is a repo file edit.
- **Instruction & Rule File Write Gate:** Not triggered — no CLAUDE.md/skill/governance
  file edits expected.
- **Schema changes:** None expected, pending Phase 1's audit findings.
- **Upstream dependencies:** None blocking. Relates to SUG-58 Phase 3 (shipped — original
  llms.txt addition) and the existing `/update-cwv` skill + `lighthouserc.cjs` CI pipeline,
  neither of which is in-flight or gates activation.
- **Activation audits:**
  - Expand the "Accessibility tree is not well-formed" row in the linked PSI reports (or
    pull the full Lighthouse JSON via an authenticated PageSpeed Insights API call — the
    unkeyed public endpoint 429'd during this epic's authoring) before writing any fix
    code. Do not guess at the ARIA/DOM issue from the category name alone.
  - Read the current llms.txt spec at the "browsable websites for AI agents" link Google's
    audit cites, and confirm the exact expected format before rewriting the file.
  - Re-run `pnpm exec lhci autorun --config=lighthouserc.cjs` (or the `/update-cwv` skill
    end-to-end) to get a current, calibrated mobile/desktop baseline before Phase 2 work
    begins — the PERF_BACKUP values referenced in this doc's Background are a snapshot
    that may already be stale by activation time.
  - Confirm whether the CLS discrepancy noted between this report's desktop (0.148,
    failing) and mobile (0, passing) reflects a real desktop-only layout-shift regression
    or run-to-run variance — worth one extra re-run before treating it as a finding.

## Model & Mode [REQUIRED]

`/model sonnet` — default. Phase 1 is a scoped content-format fix (llms.txt) plus a
diagnostic-then-fix task (accessibility tree) once the audit detail is read; Phase 2 is
standard frontend performance work (render-blocking, image optimization, bundle trimming)
against named, already-quantified opportunities. Neither phase involves the kind of
open-ended architecture decision that would call for Opus + plan mode.

## Non-Goals

- No WebMCP integration (forms/tools/schemas registration) — the 3 Not Applicable checks
  reflect the site genuinely having no WebMCP surface yet; building one is a separate,
  much larger initiative and not implied by this epic just because PSI lists the category.
- No site-wide CWV remediation across every route — this epic's Phase 2 scope is the
  homepage specifically, per the report supplied. Extending the same fixes to other
  high-traffic routes (`/articles`, `/case-studies`, etc.) is a reasonable follow-on but
  not pre-committed here.
- No change to the existing `/update-cwv` skill's mechanics or `lighthouserc.cjs`'s
  monitored URL list — this epic consumes that pipeline for verification, it doesn't
  redesign it.

## Related

- **Linear:** [SUG-253](https://linear.app/sugartown/issue/SUG-253/cwv-audit-and-agentic-browsing-fixes-llmstxt-accessibility-tree-mobile)
- **Epic template:** `docs/epic-template.md`
- **PSI reports (source of this epic):**
  [Desktop](https://pagespeed.web.dev/analysis/https-sugartown-io/3i7vwoq7b0?utm_source=search_console&form_factor=desktop&hl=en),
  [Mobile](https://pagespeed.web.dev/analysis/https-sugartown-io/3i7vwoq7b0?utm_source=search_console&form_factor=mobile&hl=en)
- **Prior related work:** SUG-58 Phase 3 (original llms.txt), SUG-67/SUG-100/SUG-106
  (Lighthouse CI setup, per `lighthouserc.cjs`'s own header comment)
- **Existing tooling:** `.claude/skills/update-cwv/`, `apps/web/src/components/CwvSnapshot.jsx`,
  `lighthouserc.cjs`
