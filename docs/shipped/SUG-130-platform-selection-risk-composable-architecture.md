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

## Research notes / angles to explore

### Headless preview as an unsolved problem

The preview experience for non-technical stakeholders is a known failure mode across headless stacks. Vercel preview URLs, Netlify deploy previews, Sanity's visual editing layer — all of these are developer-friendly but routinely unusable for the producers and stakeholders who need to approve content before publish. The URL is a random string. There's no context. Logging in requires a platform account. The content team has to be trained, retrained after every release, and still routinely asks for a screenshot instead.

This is a problem worth exploring in more depth — both as a practitioner who has watched it fail repeatedly, and as a thread in the article. The composable architecture argument is incomplete if the content workflow is a stumbling block. A system that is technically portable but practically inaccessible to the people who operate it is not a solved system.

Questions to dig into:
- What does the current state of headless preview actually look like across Sanity (Visual Editing / Presentation Tool), Contentful (preview environments), and Vercel (branch deploys)? Is any of it genuinely usable for a non-technical stakeholder without setup friction?
- Is the gap a tooling problem, a configuration problem, or a cultural problem (i.e. teams expecting stakeholders to adapt to dev infrastructure)?
- What would a genuinely producer-friendly preview workflow look like? Shareable URL, branded context, no login required, in-context edit triggers?

This is a potential future node or article on its own. For SUG-130, it belongs in Section 3 or as a coda: composable architecture reduces platform risk, but it doesn't automatically reduce operational friction — the preview gap is where that friction shows up most visibly.

### Campaign-aware preview as a possible offshoot article or node

**Background from practice:** At Sephora (and likely at any org running campaign-driven e-commerce or content marketing at scale), the preview requirement goes beyond "show me this draft before it publishes." The requirement is: give me a named campaign or a date window, let me set personalization parameters and scheduled banner states, and show me the complete experience as a specific user would see it on a specific day. All platform layers live — A/B test variants, segment rules, scheduled content, campaign-specific overrides.

The term used at Sephora for this capability: **contextual preview**. (Confirmed first-hand. AEM and Sitecore use the same term; it's the closest thing to an industry standard.)

**A note on Contentful's native scheduling (as of 2022):** Contentful's built-in date and release tools had significant data limitations — insufficient for the campaign complexity at Sephora's scale. The solution was custom-built: date selectors pulling directly from the API, with the full contextual parameter set managed outside Contentful's native UI. Worth noting in any article that references Contentful as part of the composable stack story — "composable" also means "bring your own scheduling when the platform's native tools don't cut it."

**Industry vocabulary for this capability:**

- **Contextual preview** — the primary term. Preview mode where you define a context (named campaign, date window, audience segment, locale, A/B variant) and the system renders what that specific user would see in that specific context. Used by AEM, Sitecore, and Sephora's custom implementation.
- **Time-travel preview** (or date simulation) — preview the site as it will render on a target date, with all scheduled content activated. Adobe AEM calls their implementation "Timewarp." Contentful has scheduled publishing but no combined preview UI.
- **Audience simulation** / **visitor group preview** — preview as a specific segment, persona, or visitor group. Optimizely calls these "visitor groups." AEM calls it contextual preview. Sitecore has "Experience Explorer."
- **Campaign simulation** — the full combination: named campaign + date range + p13n settings + scheduled content rendered simultaneously in one preview context.
- **Full-fidelity preview** — preview that includes all layers: CDN-delivered content, A/B variant, personalization rules, scheduled banners. The absence of full fidelity is the operational gap — content teams approve something in preview that is not what ships.

**Tools that get closest:**

- **Adobe AEM + Target** — Timewarp (date) + audience simulation + campaign targeting. Most complete native solution. Also most expensive and operationally heavy.
- **Optimizely CMS** (formerly Episerver) — visitor group preview + scheduled content. Reasonable for mid-complexity.
- **Sitecore** — Experience Editor with date/audience simulation. Enterprise only.
- **Uniform** — a composition/personalization layer that sits on top of headless CMSes (Contentful, Sanity) and adds campaign/audience/A/B simulation to stacks that don't have it natively. Closest to "add this to a composable stack."
- **Builder.io** — visual editing + scheduling + A/B preview in one surface. More accessible than AEM/Sitecore.
- **Ninetailed** — personalization layer for headless stacks, has audience preview. No scheduling.
- **LaunchDarkly** — feature flag simulation per audience. No content preview; needs pairing with a CMS preview layer.

**The honest gap:** No headless-native stack has the full contextual preview capability out of the box. Monolithic CMSes (AEM, Optimizely, Sitecore) built it because they own the full stack. Composable stacks require assembling it from: a preview layer (Sanity Presentation Tool / Contentful Preview API) + a personalization layer (Uniform / Ninetailed) + a feature flag layer (LaunchDarkly / Vercel Feature Flags) + a scheduling layer. It is technically achievable but it is integration work, and almost no teams complete it. This is the real operational cost of composable that the architecture argument alone does not address.

**Graceful degradation in preview — a principle worth naming explicitly:**

The Sephora contextual preview was, in practice, deeply buggy. The complexity of the full campaign simulation meant the preview environment was often broken or wrong. The failure mode: developers held out for "all the things" — the complete contextual preview with every layer wired up — which meant producers had no usable preview at all when any layer was broken or incomplete.

The principle that was missing: **graceful degradation**. A preview experience should degrade gracefully when a layer is unavailable:
- If the personalization layer is broken, still show the content draft.
- If the scheduling simulation fails, still show the published-or-draft state.
- If the campaign context can't be resolved, fall back to the baseline experience.

"All or nothing" preview is a design failure. Producers need to be able to approve content even when campaign simulation is partially broken. Developers defaulting to "preview isn't ready yet" because the full-fidelity context isn't wired up is a process failure with a real human cost — it is the thing that makes producers cry, because they have no way to see what they're publishing.

Graceful degradation in preview should be a first-class acceptance criterion in any contextual preview implementation, not an afterthought.

**Possible offshoot:** A node documenting what a well-designed contextual preview system looks like on a composable stack — layer-by-layer tool map, graceful degradation spec, and the Sephora benchmark (can non-technical stakeholders QA a campaign before it goes live?) as a rubric for evaluating whether a platform is genuinely enterprise-ready.

---

### TCO for composable tooling

The cost argument comes up in almost every platform evaluation. Contentful, Sanity, Vercel, Netlify — these are not cheap at scale, and the pricing models are non-trivial to compare against each other or against a self-hosted alternative. The common objection from engineering: "we could just run WordPress/Drupal/a custom CMS on our own infrastructure."

What the TCO calculation usually misses:
- Developer time to build and maintain a custom CMS is not free — it compounds. Every feature request, every schema change, every upgrade cycle lands on in-house engineering.
- Headless SaaS vendors absorb CDN, edge delivery, security patching, and API availability. The infrastructure is not gone; it's off the balance sheet.
- The cost of a platform migration (when the wrong CMS was chosen) is measured in months of engineering time, not license fees. Composable architecture reduces that exposure — which has a real dollar value that belongs in the TCO calculation.
- Usage-based pricing (Contentful API calls, Sanity seat costs, Vercel bandwidth) creates unpredictability at scale. Worth documenting the breakpoints where self-hosting becomes rational.

For the article: the audience is PMs and technical leads preparing for or debriefing from a platform evaluation. TCO framing should be honest — these tools have real costs — but should also name the costs that don't appear on the invoice. The argument isn't "composable SaaS is always cheaper" but "the full cost of the alternative is usually underestimated."

Adoption context: headless CMS and modern deploy platforms remain poorly understood outside engineering-forward orgs. Mid-market companies and agencies often have no in-house headless experience; even well-funded enterprise teams frequently treat Contentful or Sanity as a surprise when they first encounter them in a vendor eval. The article can acknowledge this directly — the tools exist, they work, and the gap is awareness and operational readiness, not technical capability.

---

## Acceptance criteria

- [ ] Published as article (not node) at `/articles/platform-selection-risk-composable-architecture`
- [ ] Cross-links to node `poc-platform-agnostic-by-design`
- [ ] Series metadata set on both documents
- [ ] Passes anti-slop checks (no em dashes outside node register, no AI vocabulary)
- [ ] VoPM voice — Bex's POV, first person where appropriate, practitioner register
