---
**Epic:** SUG-185 — A/B testing — use case exploration and tooling evaluation for sugartown.io
**Linear Issue:** [SUG-185](https://linear.app/sugartown/issue/SUG-185/ab-testing-use-case-exploration-and-tooling-evaluation-for-sugartownio)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-185 — A/B testing — use case exploration and tooling evaluation for sugartown.io

Scope A/B testing for sugartown.io: identify what to test, evaluate tooling options against the Vite SPA + Netlify stack, and produce a go/no-go recommendation with a prioritised test backlog if approved.

## Background

sugartown.io has no experiment infrastructure today. The site is a Vite SPA deployed on Netlify with a Sanity CMS backend. All visitors receive an identical experience regardless of traffic source, referral context, or session behaviour. As the site shifts toward a consulting/contract conversion goal (SUG-90), certain surfaces — the hero CTA, the Services page framing, the Contact page entry point — are high-value enough to test. The question this epic answers is: is A/B testing worth the implementation overhead at current traffic levels, and if so, what is the minimum viable tooling choice that doesn't compromise the MACH architecture or introduce vendor lock-in?

The prior AEO and SEO epics (SUG-131, SUG-132, SUG-133) established organic visibility as a priority. A/B testing is the natural next step: once traffic is measurable and attributable, conversion rate optimisation becomes tractable. This epic is exploratory — no experiment code ships until the recommendation is reviewed and approved.

## Objective

After this epic, a written recommendation exists at `docs/reports/ab-testing-recommendation.md` covering: whether to implement A/B testing at all given current traffic, which tooling option best fits the stack, what the first three tests would be and their hypotheses, and a phased implementation plan (if recommended). If the recommendation is "not yet" or "hold", the specific threshold (traffic, conversion signal, tooling maturity) that would trigger a future activation is documented. No experiment code or Netlify configuration changes until the recommendation is reviewed.

## Scope

- [ ] **Traffic baseline audit** — pull current GSC + analytics data: monthly unique sessions, conversion events (contact form submits, Services page visits, outbound LinkedIn clicks), bounce rate on hero and Services. Assess whether traffic volume is sufficient to reach statistical significance within a reasonable test window (4–8 weeks). If not, document the threshold needed and close the epic as "hold". — layer: research / analytics
- [ ] **Use case inventory** — identify the 5–8 highest-leverage test surfaces on sugartown.io given the consulting conversion goal. Candidates: hero headline + CTA copy, Services page framing (problem-led vs. outcome-led), Contact page headline, article CTA placement, homepage layout order. Score each by expected impact × implementation effort × traffic exposure. — layer: research / product
- [ ] **Tooling evaluation** — assess 4 options against the Vite SPA + Netlify stack:
  - **Netlify Split Testing** (built-in branch deploys; no JS overhead; no feature flags; requires a separate branch per variant)
  - **GrowthBook** (open-source, self-hosted or cloud; feature flags + experiment SDK; works in SPA; free tier generous)
  - **Optimizely Web** (heavyweight; expensive; overkill for current scale — include for completeness)
  - **Custom cookie + variant routing** (zero vendor dependency; manual assignment logic; no analytics integration out of the box)
  - Evaluate on: SPA compatibility, Netlify integration, pricing, implementation effort (hours), statistical engine quality, GDPR/cookie consent implications. — layer: research / tooling
- [ ] **GDPR + consent implications** — any client-side experiment SDK that sets a persistent cookie or fingerprints users requires a cookie consent banner (ICO guidelines, GDPR Art. 6). sugartown.io has no consent banner today. Assess which tooling options require consent gates and what the implementation cost is. If consent infrastructure is a prerequisite, scope that as a blocker in the recommendation. — layer: research / compliance
- [ ] **Written recommendation** — produce `docs/reports/ab-testing-recommendation.md` with: executive summary (go / hold / no), traffic baseline findings, use case shortlist (top 3 with hypotheses and success metrics), tooling recommendation with pros/cons table, consent implication summary, and phased implementation plan or hold condition. — layer: documentation

## Phases

Single recommendation-first shape — no implementation code until the recommendation is reviewed and approved by Bex.

1. **Research** — complete all audit and evaluation bullets above.
2. **Recommendation doc** — write `docs/reports/ab-testing-recommendation.md`; present to Bex for go/hold/no decision.
3. **Implementation (conditional)** — only if the recommendation is "go". Separate epic or follow-on phase depending on tooling choice. This epic closes after Phase 2 regardless of the decision.

## Acceptance criteria

- [ ] Traffic baseline is documented with real numbers from GSC or analytics — not estimates
- [ ] Statistical significance threshold is assessed: given current monthly sessions, what sample size and test duration would a 10% lift on contact form conversion require?
- [ ] At least 4 tooling options are evaluated with an explicit recommendation and rationale
- [ ] GDPR/consent implications are addressed for the recommended tooling path
- [ ] `docs/reports/ab-testing-recommendation.md` exists, is self-contained (readable without repo context), and includes a go/hold/no decision
- [ ] If "go": a phased implementation plan exists with named tooling, integration points, and first 3 test hypotheses
- [ ] If "hold": the specific numeric threshold (monthly sessions, conversion events) that would trigger activation is stated

## Human QA Walkthrough — example local pages

Not applicable — research and documentation only. No shared CSS, token, or multi-page component changes in this epic. Any implementation code is out of scope until the recommendation is approved.

## Technical notes

- **Content Write Gate:** does not fire — no Sanity content writes.
- **Schema changes:** none.
- **No implementation code in this epic.** The recommendation doc may include code sketches (e.g. a GrowthBook SDK initialisation snippet) as illustrations, not as shipped code.
- **Netlify Split Testing constraints:** Netlify's built-in split testing works by routing traffic to different branch deploys at the CDN edge — no JS, no cookies, no consent required. However, it only supports full-page variants (different branch = different build), not in-page component variants. This is a hard constraint: if the desired tests are component-level (hero copy only, not full page rebuild), Netlify split testing is ruled out.
- **GrowthBook free tier:** as of 2026, GrowthBook Cloud free tier supports unlimited features/experiments with up to 3 team members. The SDK is MIT-licensed. Self-hosted option available. This is the most likely recommendation for a low-traffic SPA.
- **Statistical significance at low traffic:** a site with < 5,000 monthly sessions will struggle to reach 80% power on a 10% lift within 4–6 weeks for most conversion events. The traffic baseline audit may conclude that A/B testing is premature — that is a valid and useful outcome of this epic.
- **Analytics prerequisite:** meaningful A/B testing requires a working analytics event pipeline (conversion events, not just pageviews). Audit what events are currently tracked at activation. If conversion events (contact form submit, etc.) are not instrumented, that gap must be noted in the recommendation.
- **Upstream dependencies:** SUG-90 (consulting pivot) established the conversion goal. SUG-131/132/133 established SEO/AEO baseline. No hard upstream blockers.
- **Activation audits:** at activation, read `apps/web/src/pages/ContactPage.jsx` and `apps/web/src/pages/ServicesPage.jsx` to understand current CTA structure before writing the use case inventory. Check `apps/web/public/robots.txt` (post-SUG-184) for any crawl constraints that affect variant URLs.
- **Model & Mode:** `/model opus` — this is a pure architecture and product strategy epic. The deliverable is a recommendation document, not code. Opus reasons through the tradeoff space; no Sonnet execution phase until implementation is approved.

## Model & Mode [REQUIRED]

`/model opus` — pure research, tooling evaluation, and product strategy. The deliverable is a recommendation document. No code to execute in this epic.

## Non-Goals

- **No experiment code ships in this epic** — implementation is gated on the recommendation being approved.
- **No analytics instrumentation** — if conversion events are missing, this epic flags the gap; it does not wire the events (separate epic).
- **No consent banner implementation** — if consent infrastructure is required, this epic names it as a prerequisite; the banner itself is a separate epic.
- **No Optimizely, LaunchDarkly, or other paid enterprise tools** — the recommendation will cover these for completeness, but the implementation path will not be scoped here.
- **No multivariate testing (MVT)** — out of scope. A/B only (two variants per test) for initial exploration.

## Related

- **Linear:** [SUG-185](https://linear.app/sugartown/issue/SUG-185/ab-testing-use-case-exploration-and-tooling-evaluation-for-sugartownio)
- **SUG-90:** Consulting pivot — established conversion goal and CTA surfaces
- **SUG-131/132/133:** AEO and SEO epics — organic traffic baseline
- **SUG-184:** GSC indexing fixes — improves organic traffic that feeds test sample sizes
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, and Files to Modify at activation time
