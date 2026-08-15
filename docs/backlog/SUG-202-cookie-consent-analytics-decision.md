---
**Epic:** SUG-202 — Cookie consent + analytics decision: GA runs with no consent banner
**Linear Issue:** [SUG-202](https://linear.app/sugartown/issue/sug-202)
**Status:** Backlog
**Priority:** 🟠 High
**Labels:** AI Ethics, CMS
**Merge strategy:** (a) Merge-as-you-go
---

# SUG-202 — Cookie consent + analytics decision: GA runs with no consent banner

> **Backlog doc created 2026-08-15**, backfilled during migration Phase 2. This issue was open
> in Linear with no `docs/backlog/` doc — one of nine found by the first parity audit since
> `validate:epic-docs` was archived by SUG-284. The Background below is the Linear description
> verbatim; it was already substantive, so it is preserved rather than paraphrased.

## Background

Surfaced during [SUG-198](https://linear.app/sugartown/issue/SUG-198/gap-analysis-6-layers-of-effective-ai-governance) Phase 3 (Privacy page alignment).

**Finding:** The site loads Google Analytics (gtag, `G-00MF2Q9YJW`) on every production page with **no cookie-consent banner** and no GA consent-mode gating (verified in `index.html`; documented in `docs/ai/agentic-caucus/data-handling.md`). The contact form also calls Google reCAPTCHA.

[SUG-198](https://linear.app/sugartown/issue/SUG-198/gap-analysis-6-layers-of-effective-ai-governance) corrected the Privacy page to **document this reality accurately** (removed the inaccurate "privacy-friendly / non-identifying analytics" claim). That closes the honesty gap.

**Decision to make (the "fix the reality" path, deferred out of** [SUG-198](https://linear.app/sugartown/issue/SUG-198/gap-analysis-6-layers-of-effective-ai-governance)**):**

* Add a cookie-consent banner and/or GA consent-mode gating, or
* Switch to a genuinely privacy-friendly, cookieless analytics tool (e.g. Plausible/Fathom), or
* Accept current state as a documented, low-risk choice for a personal portfolio.

This is a product/compliance decision, not a content fix. [SUG-198](https://linear.app/sugartown/issue/SUG-198/gap-analysis-6-layers-of-effective-ai-governance) non-goals explicitly excluded building compliance tooling.

**Source:** `docs/ai/agentic-caucus/data-handling.md`, `apps/web/index.html` (GA snippet), `apps/web/src/components/Form.jsx` (reCAPTCHA).

## Scope

Scope is carried in the Background above, which came over from Linear complete. Before
executing, confirm it still holds — several of these were written between 2026-07-23 and
2026-08-09 and the platform has moved since (SUG-284 removed the governance layer; v0.33.0
shipped 2026-08-15).

## Related

- **Linear:** [SUG-202](https://linear.app/sugartown/issue/sug-202)
- Backfilled by the Phase 2 parity audit — `docs/briefs/linear-to-github-migration-plan.md` §5.1
