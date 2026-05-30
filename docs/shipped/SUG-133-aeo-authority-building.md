---
**Epic:** SUG-133 — AEO Authority Building — LinkedIn, GitHub, external publishing, /now cadence
**Linear Issue:** [SUG-133](https://linear.app/sugartown/issue/SUG-133/aeo-authority-building-linkedin-github-external-publishing-now-cadence)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-133 — AEO Authority Building — LinkedIn, GitHub, external publishing, /now cadence

Establish off-site authority signals: update LinkedIn and GitHub profiles to cite sugartown.io, publish first external mirror post with rel=canonical, and set a quarterly /now page update cadence.

## Background

AI systems build entity profiles from multiple corroborating sources. A site that cites itself is weaker than a site corroborated by LinkedIn, GitHub, and external publications. For Becky Head, the gap is: sugartown.io exists and is well-structured, but the off-site signals (LinkedIn profile URL, GitHub bio, external articles) do not yet form a consistent, crawlable entity cluster pointing back to the same canonical identity.

This epic is the third phase of the AEO initiative. SUG-131 (technical fundamentals) and SUG-132 (content pass) build the on-site foundation. SUG-133 builds the off-site corroboration layer that elevates entity confidence in AI systems.

The /now page is the single strongest ongoing crawlability signal for active practitioners — it proves the site is maintained, not abandoned. A quarterly update cadence formalises this as a practice rather than a one-off.

## Objective

After this epic: LinkedIn and GitHub profiles both cite sugartown.io as the canonical URL. At least one article published at sugartown.io has been mirrored to LinkedIn (or Medium) with a rel=canonical back-link. The /now page has been updated within the last 30 days. A quarterly /now update reminder is documented or scheduled.

Layers touched: off-site profiles (LinkedIn, GitHub — manual steps, no code), Sanity content (/now page update, first external article mirror). No schema changes. No frontend code changes.

## Scope

- [ ] **LinkedIn profile update** — add sugartown.io as website URL; update current position to include "Independent Practice / Sugartown.io". Manual step, no code. Layer: off-site ops
- [ ] **GitHub profile update** — add sugartown.io to GitHub profile bio/website field. Manual step. Layer: off-site ops
- [ ] **First external mirror post** — identify the best article from /articles/ for external publishing (the Agentic Caucus article from SUG-132 is the recommended candidate). Publish or cross-post to LinkedIn Articles or Medium with `rel=canonical` pointing back to sugartown.io. Layer: off-site content ops + Sanity (confirm canonical URL is correct)
- [ ] **rel=canonical audit** — verify that sugartown.io article pages emit a correct `<link rel="canonical">` tag in SeoHead.jsx. If not present, add it. Required before any external mirror. Layer: frontend (SeoHead.jsx)
- [ ] **/now page refresh** — update the /now page in Sanity to reflect current availability, active projects, and recent work. Must be current within 30 days of epic close-out. Layer: Sanity content
- [ ] **Quarterly /now cadence** — document the quarterly update commitment in `docs/conventions/` or equivalent. Activation audit: check if a /loop or /schedule hook can surface this as a reminder. Layer: docs/ops

## Phases

Single-phase. All items are ops/content with one frontend check (rel=canonical). Ship together.

## Acceptance criteria

- [ ] LinkedIn profile `Website` field resolves to `https://sugartown.io`
- [ ] LinkedIn current experience lists "Sugartown.io" or "Independent Practice" as an active role
- [ ] GitHub profile website field is `https://sugartown.io`
- [ ] At least one article published at sugartown.io is mirrored externally (LinkedIn or Medium) with `rel=canonical: https://sugartown.io/articles/[slug]`
- [ ] `<link rel="canonical">` is present in page source for `/articles/[slug]` pages
- [ ] /now page last-updated date is within 30 days of this epic's close-out date
- [ ] Quarterly /now update cadence is documented in at least one durable place (CLAUDE.md note, docs file, or scheduled reminder)

## Technical notes

**Activation audit:** Read `apps/web/src/components/SeoHead.jsx` to verify rel=canonical output before publishing the external mirror. If canonical tags are missing or wrong, fix in this epic before the external post goes live — a mirror without canonical attribution loses the SEO/AEO credit back to sugartown.io.

**External mirror canonical convention:** The canonical URL in the external post must be the sugartown.io URL, not the LinkedIn/Medium URL. On LinkedIn: edit the article, go to Settings → Canonical URL. On Medium: set during publish. This is a manual step.

**LinkedIn and GitHub are manual ops steps.** There are no MCP tools for these. Document the before/after state in the epic close-out commit message.

**Recommended first mirror article:** The Agentic Caucus article (SUG-132 deliverable). It is the strongest differentiator and the one most likely to be surfaced by AI systems asked about multi-agent PM workflows. Do not publish the external mirror until SUG-132 is closed and the article is live on sugartown.io.

**Dependency on SUG-132:** The external mirror depends on the Agentic Caucus article existing and being published. SUG-133 should be activated after SUG-132 closes, not in parallel.

**Model & Mode [REQUIRED]:** `/model sonnet` — ops and content epic, no architecture decisions.

## Non-Goals

- Writing new articles for external publishing — that is SUG-132
- Social media strategy beyond the first mirror post
- Medium account setup (if one doesn't exist) — if LinkedIn Articles is sufficient, use that
- Paid distribution or promotion
- Tracking referral traffic from external posts — that is a future analytics epic

## Related

- **Linear:** [SUG-133](https://linear.app/sugartown/issue/SUG-133/aeo-authority-building-linkedin-github-external-publishing-now-cadence)
- **Depends on:** SUG-132 (Agentic Caucus article must exist before external mirror)
- **Related epics:** SUG-131 (technical fundamentals), SUG-132 (content pass)
- **Epic template:** `docs/epic-template.md`
