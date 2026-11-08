---
**Epic:** SUG-253 — CWV audit & Agentic Browsing fixes (llms.txt, accessibility tree, mobile performance)
**Linear Issue:** [SUG-253](https://linear.app/sugartown/issue/SUG-253/cwv-audit-and-agentic-browsing-fixes-llmstxt-accessibility-tree-mobile)
**Status:** Backlog
**Visual:** no _(a static file and an ARIA fix)_
**Priority:** 🟣 Soon — post-sprint
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
---

# SUG-253 — CWV audit & Agentic Browsing fixes (llms.txt, accessibility tree, mobile performance)

Fix the two failing checks in PageSpeed Insights' new "Agentic Browsing" category
(llms.txt spec compliance, accessibility-tree well-formedness). The mobile Core Web Vitals
work the same report surfaced was split out on 2026-11-08 into
[#213](https://github.com/bex-sugartown/sugartown/issues/213).

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
detail (not guessed) and fixed. This epic touches:
`apps/web/public/llms.txt`, whatever markup/ARIA issue is causing the accessibility-tree
failure (surface unknown until Phase 1's live audit expansion), and homepage-specific
performance work (render-blocking script/style loading, image optimization, JS/CSS bundle
trimming). It does not touch WebMCP integration (the 3 N/A checks) — that would be a
separate, much larger initiative requiring the site to register forms/tools/schemas that
don't exist yet.

## Scope

- [x] Expand and read the full "Accessibility tree is not well-formed" audit detail (via
      the PSI report UI or the PageSpeed Insights API with a valid key — the public
      unkeyed endpoint hit a 429 during epic authoring) to identify the specific
      violation(s) before proposing any fix — layer: audit
- [x] Fetch and read the current llms.txt spec recommendation (linked from the audit —
      "browsable websites for AI agents") and diff `apps/web/public/llms.txt`'s existing
      prose-under-headings format against it — layer: audit
- [x] Rewrite `apps/web/public/llms.txt` to the compliant format (likely: H1 site name,
      optional blockquote summary, H2 sections containing markdown link lists
      `- [Title](url): description` rather than prose paragraphs) while preserving the
      real content already documented (site structure, key topics, author info, technical
      notes, sitemap reference, update cadence) — layer: content/static file
- [x] Fix the accessibility-tree well-formedness issue found in the first audit item —
      layer: frontend (scope narrows once the specific violation is known)
- [ ] Re-run PageSpeed Insights (or Lighthouse's agentic-browsing config) against the deployed
      homepage post-fix and record before and after for the two Agentic Browsing checks —
      layer: verification

## Phases

**Phase 1 — Agentic Browsing fixes.** Expand the accessibility-tree audit detail, fix
llms.txt to spec, fix the accessibility-tree issue. Ships independently — merge-as-you-go.

**Phase 2 — moved.** Mobile CWV performance remediation is now
[#213](https://github.com/bex-sugartown/sugartown/issues/213) (ST-213).

## Acceptance criteria

- [x] `apps/web/public/llms.txt` passes the "llms.txt does not follow recommendations"
      check. Evidence: Lighthouse agentic-browsing config, `llms-txt` 0 on production, 1 on the local build, 2026-11-08. The deployed re-run is a post-ship check.
- [x] The "accessibility tree is not well-formed" check passes, root cause documented: `<footer role="doc-endnotes">` (aria-allowed-role) then `<p role="doc-endnote">` in Citation. Evidence: `agent-accessibility-tree` 0 before, 1 after, local build, 2026-11-08. The deployed re-run is a post-ship check.
- [ ] Before and after for the two checks on the deployed site: moved to Post-ship checks

## Human QA Walkthrough — example local pages

Not applicable in the CSS/layout-token sense for Phase 1 (llms.txt is a static file
outside the app; the accessibility-tree fix's actual surface is unknown until audited).
Phase 2 moved to #213.

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
  - The Phase 2 activation audits (Lighthouse baseline, CLS discrepancy) moved to #213.

## Model & Mode [REQUIRED]

`/model sonnet` — default. Phase 1 is a scoped content-format fix (llms.txt) plus a
diagnostic-then-fix task (accessibility tree) once the audit detail is read. The former Phase 2
is standard frontend performance work, now #213 (render-blocking, image optimization, bundle trimming)
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

- No mobile performance work: that is #213.

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

---

## Close-out review

### Acceptance criteria

Ticked above with evidence. The deployed re-run of both checks is in Post-ship checks.

### What didn't work

none

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Mobile Core Web Vitals work (this epic's former Phase 2) | implementation | #213 |
| `ard-schema` Agentic Browsing check fails (no `/.well-known/ard.json`) | implementation | #214 |
| #164 (deprecated Citation roles) is fixed by this epic's Citation change and its allowlist rows are gone | implementation | #164 closes once production passes axe |

### Friction line

My first answer to "what moves #84 to Done" required a deployed re-run, which is Shipped, not Done (CLAUDE.md §Done vs Shipped).

---

## Post-ship checks

- [ ] `llms-txt` and `agent-accessibility-tree` both pass on the deployed homepage: run `npx lighthouse https://sugartown.io/ --config-path=<lighthouse>/core/config/agentic-browsing-config.js`, or re-run PageSpeed Insights (mobile and desktop)
- [ ] Axe passes on production with the #164 rows removed, then close #164: person, after the deploy
