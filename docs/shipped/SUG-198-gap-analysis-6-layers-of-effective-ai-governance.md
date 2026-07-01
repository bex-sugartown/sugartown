---
**Epic:** SUG-198 — Gap analysis: 6 layers of effective AI governance
**Linear Issue:** [SUG-198](https://linear.app/sugartown/issue/SUG-198/gap-analysis-6-layers-of-effective-ai-governance)
**Status:** Shipped ✓ 2026-07-01 (v0.28.4)
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-198 — Gap analysis: 6 layers of effective AI governance

Close the two remaining Agentic Caucus governance gaps (standing incident log, data-handling note) and surface the governance coverage publicly, with an alignment pass on the AI ethics and legal docs.

> **Shipped 2026-07-01 (v0.28.4).** Standing incident log + data-handling/GDPR note closed Layer 6 gaps. Added `--st-posture-{strong,partial,inherited,na}` semantic tokens (with dark-pink-moon overrides) and a §05 AI Governance Coverage block on `/platform/governance`. This epic completed its work on `bex/sug-198-gap-analysis-6-layers-of-effective-ai-governance`, which sat unmerged for several hours (branched independently of, and in parallel with, the SUG-192 session); merged to `main` and re-versioned at `/eod` after its own pre-merge mini-release collided with another stranded branch's version number. See CLAUDE.md's mini-release-on-main-only rule.

## Background

SUG-196 created `docs/ai/` and the Agentic Caucus governance suite. A coverage map (`docs/ai/agentic-caucus/governance-coverage.md`) scores the Caucus against a six-layer AI governance model. Risk tiering (`risk-tiers.md`) and agent cards (`agent-cards.md`) have already shipped, closing two of the four named gaps. Two fills remain (incident log, data-handling note), and the coverage analysis itself is not surfaced anywhere on the live site. The AI ethics doc (`sugartown.io/ai-ethics`) and the legal docs (Privacy, Terms, Accessibility Statement in the footer) predate this governance work and have not been reviewed for alignment with it.

Why now: the governance coverage is a credibility surface for the consulting pivot (SUG-90) and a genuine differentiator — enforced policy in code, not a PDF. It is currently invisible to anyone who does not read the repo.

Reference surfaces: `docs/ai/agentic-caucus/`, the AI ethics doc source (`docs/briefs/`), Sanity legal pages (Privacy, Terms, Accessibility), and one or more platform/governance render surfaces in `apps/web/src/`.

## Objective

After this epic: the two remaining governance fills exist as docs in `docs/ai/agentic-caucus/`; the governance coverage is surfaced on the live site in one reviewed location; and the AI ethics and legal docs have been read against the governance suite and either confirmed aligned or updated. Layers touched: documentation (`docs/ai/`), Sanity content (legal pages, possibly AI ethics doc body), React render (one new or extended governance surface), and content (Studio copy). Explicitly out of scope: any change to the Caucus methodology itself, any new schema field unless the surfacing option requires one (decided at Phase 0), and the N/A-by-design layers (EU AI Act, fairness/bias testing).

## Scope

- [ ] Standing incident log — append-only home for confirmed failure modes. Decide between (a) a node-schema-backed log and (b) a structured appendix to `failure-modes.md`; spec both in Phase 1 and pick one. Layer: documentation (+ schema only if option (a)).
- [ ] Data-handling / GDPR note — short doc covering what the site collects (Netlify Forms contact, any analytics) and how AI is used in the build. Layer: documentation. Decide at Phase 3 whether it also needs a public-facing summary on the Privacy page.
- [ ] Site surfacing of governance coverage — choose one surface (options below) and build it. Layer: frontend (+ content). Phase 0 mock gate applies — any new visual block needs a mock at `docs/drafts/SUG-198-*.html` and review before JSX.
- [ ] AI ethics doc alignment pass — read the live AI ethics doc against the governance suite; confirm aligned or propose updates. Layer: content (Content Write Gate fires).
- [ ] Privacy / Terms / Accessibility alignment pass — read the three legal pages; confirm aligned with the data-handling note or propose updates. Layer: content (Content Write Gate fires).

### Site surfacing options (decide at Phase 2 Phase 0)

1. **Extend `/platform/governance`** — add a governance-coverage block (the six-layer map + tally) to the existing governance page. Lowest new surface area; reuses an existing page.
2. **Section on the AI ethics page** — fold the coverage summary into the public ethics doc as a "how we govern our own AI use" section. Best narrative fit for the consulting story.
3. **Dedicated coverage page** — a standalone `/platform/ai-governance` page with the six-layer visual and per-layer detail. Most prominent; highest build cost; needs a route + nav decision.

Recommendation to confirm at Phase 0: option 1 or 2 (reuse a surface) over option 3, per the Atomic Reuse Gate.

## Phases

**Phase 1 — Docs.** Incident log (spec both options, pick one, build it) + data-handling note. Pure markdown unless the incident log uses option (a) node schema. Ships: two new docs in `docs/ai/agentic-caucus/`.

**Phase 2 — Site surfacing.** Phase 0 mock of the chosen surface → review → build. Ships: one governance-coverage surface live on the site.

**Phase 3 — Content alignment.** AI ethics doc + legal pages read against the governance suite; Content Write Gate proposal for any changes. Ships: confirmed-aligned or updated public docs.

Single close-out: all three phases on one branch, one mini-release at the end.

## Acceptance criteria

- [ ] `docs/ai/agentic-caucus/` contains an incident-log doc with a defined append format and the chosen mechanism documented (and, if option (a), the schema is deployed and an MCP write succeeds)
- [ ] A data-handling note exists covering site data collection and AI-in-build usage; `governance-coverage.md` GDPR row updated from Gap to Partial/Strong
- [ ] `governance-coverage.md` "Gaps Worth Filling" items 3 and 4 marked Done; tally updated
- [ ] One governance-coverage surface renders on the live site, matching an approved Phase 0 mock (Visual QA approved before close-out)
- [ ] AI ethics doc read against the governance suite; either a "confirmed aligned" note in the epic or a Content Write Gate proposal approved and published
- [ ] Privacy, Terms, and Accessibility pages read; either confirmed aligned or a Content Write Gate proposal approved and published
- [ ] No invented claims in any public doc — every governance statement traces to a real mechanism in `docs/ai/agentic-caucus/`

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS the Phase 2 surfacing can reach, and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per affected page-type and datestamp it. This is required once the Phase 2 surface is chosen — the option determines which routes are touched.

## Technical notes

- **Content Write Gate:** fires in Phase 3 (AI ethics + legal page edits) and possibly Phase 2 (any Studio copy on the new surface). Produce a before/after proposal table per affected document and wait for explicit approval before any Sanity write.
- **Phase 0 mock gate:** fires in Phase 2. The governance-coverage surface is a new visual block — mock at `docs/drafts/SUG-198-*.html`, reviewed before any JSX. If a six-layer visual is reused from the analysis, the mock references it rather than reinventing.
- **Schema changes:** only if the incident log uses option (a) (node-schema-backed). If so, the field/type changes get their own `feat(studio):` commit and a `npx sanity schema deploy` before any MCP write. Default recommendation is option (b) (markdown appendix) — no schema change.
- **Activation audits:** (1) read `apps/web/src/App.jsx` for the route→component map before Phase 2; (2) read the live AI ethics doc source in `docs/briefs/` and the Sanity Privacy/Terms/Accessibility documents before Phase 3; (3) query Sanity for the legal page `_id`s and current body before drafting any proposal.
- **Atomic Reuse Gate:** the six-layer coverage visual already exists (produced in the governance analysis). Phase 2 should reuse or adapt it, not author a new one. Surfacing option 1 or 2 reuses an existing page over a new route.
- **Upstream dependencies:** none. SUG-196 is shipped; the governance suite is in place.

## Model & Mode [REQUIRED]

`/model opusplan` — mixed epic: Opus plans each phase (Pre-Execution Gate, Files to Modify, Phase 0 mock review), Sonnet executes docs and content after plan-mode exit. Phase 3 content work is pure Sonnet once proposals are approved.

## Non-Goals

- Changing the Agentic Caucus methodology, agent cards, or risk tiers — this epic surfaces and aligns, it does not revise the framework
- Filling the N/A-by-design layers (EU AI Act mapping, fairness/bias testing, model benchmarking) — these remain deliberately out of scope per `governance-coverage.md`
- Building enterprise compliance tooling (audit automation, formal DPIA) — disproportionate at this size
- A standalone governance page (option 3) unless Phase 0 explicitly selects it over reusing an existing surface

## Related

- **Linear:** [SUG-198](https://linear.app/sugartown/issue/SUG-198/gap-analysis-6-layers-of-effective-ai-governance)
- **Source analysis:** `docs/ai/agentic-caucus/governance-coverage.md` §Gaps Worth Filling
- **Governance suite:** `docs/ai/agentic-caucus/` (methodology, failure-modes, governance-coverage, agent-cards, risk-tiers)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
