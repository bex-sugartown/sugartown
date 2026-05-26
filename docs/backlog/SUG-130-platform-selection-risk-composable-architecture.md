# SUG-130 — Article: Platform selection risk and why composable architecture changes the calculus

**Linear Issue:** SUG-130
**Type:** Article (blog) — VoPM voice, authored by Bex
**Status:** Backlog
**Related node:** `poc-platform-agnostic-by-design` (the technical receipts)
**Series:** Platform-agnostic architecture (node + article, linked via series metadata)

---

## Background

The SUG-127 Contentful + Vercel POC proved the monorepo's founding doctrine in practice. But the *why* behind that POC — the career experience that made the question feel urgent — belongs in a different format and a different voice.

This article is the PM/practitioner companion to the node. Where the node documents what was built and what was found, this article explains why someone would run a POC like this in the first place, what platform evaluation risk actually feels like from inside an organisation, and what composable architecture concretely buys you when that moment arrives.

Audience: product managers, technical leads, and engineering managers who have sat in — or are about to sit in — a platform evaluation. Not primarily developers.

---

## Working title

*Platform selection risk is real. Here's what reduces it.*

Alternatives:
- *After fifteen years of platform decisions, here's what composable architecture actually buys you*
- *The platform you choose matters less than you think (and here's the proof)*

Slug: `platform-selection-risk-composable-architecture`

---

## Scope / outline

**Hook:** The leadership shiver. Someone says "platform evaluation" in a room and the energy changes. The risk feels total — pick the wrong CMS and you're locked in for a decade.

**Section 1 — What that shiver is about**
Career arc: practitioner inheriting whatever had been selected before she arrived, then PM owning the selection process outright. Formal enterprise RFPs: briefing docs, vendor demos, scoring matrices, stakeholder alignment, procurement commitments. The pattern that repeats.

**Section 2 — What actually relieves it**
Not a feature comparison. Not a pricing spreadsheet. A working build that demonstrates the same content model on two different headless tools. When developers can see the data architecture holds across both, the platform decision becomes what it actually is: important, but not existential.

**Section 3 — The permanent properties**
Composability, modularity, reusability are properties of the system, not the platform. Platforms come and go. If your components accept any data source and your content model is expressed in atomic concepts, you're insulated from the churn. Same principle for component libraries and frontend frameworks.

**Section 4 — SUG-127 as the proof**
This is what the Sugartown monorepo PRD and CMS canonical PRD were grounded in — not faith in a platform, but confidence in the architecture. SUG-127 was the first time it was tested in practice. Link to the node for the technical findings.

**CTA / close:** What this means for teams evaluating platforms now.

---

## Not in scope

- Technical implementation details (those live in the node)
- Vendor comparison specifics (those live in the ADR and node)
- Sugartown product promotion — this is a practitioner perspective piece, not marketing

---

## Dependencies

- Node `poc-platform-agnostic-by-design` must be published first (provides the receipts the article references)
- Series metadata field on both article and node types (to be linked once both are published)

---

## Phase 0

HTML mock not required for a prose article. Draft the article copy directly, review, then create in Sanity as draft.

---

## Seed content

Raw paragraphs from the node draft — Bex's voice, captured in session. Use as first-draft material; rewrite freely for article register.

> The instinct behind this POC isn't abstract. Bex has spent most of her career inside platform decisions — first as a practitioner who inherited whatever had been selected before she arrived, then as a Product Manager who owned the selection process outright. That second half included formal enterprise RFPs for content platforms: the briefing docs, the vendor demos, the scoring matrices, the stakeholder alignment, and then the implementation that follows when you've committed to a choice in front of a procurement committee.
>
> The recurring pattern: leadership shivers when they hear "platform evaluation." The risk feels total — pick the wrong CMS and you're locked in for a decade. What relieves that shiver, consistently, is a well-run POC that demonstrates the same content model implemented on two different headless tools. Not a feature comparison. Not a pricing spreadsheet. A working build. When the developers can see that the data architecture holds across both, the platform decision becomes what it actually is: important, but not existential.
>
> The same principle extends to component libraries and frontend frameworks. Composability, modularity, reusability — these are permanent properties of well-designed systems. Platforms come and go. If your components accept any data source and your content model is expressed in atomic concepts rather than CMS-specific constructs, you're insulated from the churn.
>
> This is what grounded the Sugartown monorepo PRD and the CMS canonical PRD: not faith in a particular platform, but confidence in the architecture. The claim had been made. The documentation was in place. SUG-127 was the first time it had been tested in practice.

---

## Acceptance criteria

- [ ] Published as article (not node) at `/articles/platform-selection-risk-composable-architecture`
- [ ] Cross-links to node `poc-platform-agnostic-by-design`
- [ ] Series metadata set on both documents
- [ ] Passes anti-slop checks (no em dashes outside node register, no AI vocabulary)
- [ ] VoPM voice — Bex's POV, first person where appropriate, practitioner register
