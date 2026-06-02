# AI Ethics & Operations (A.K.A. How Not To Build Skynet)

**Version:** v2026.06.01  
**Status:** Active  
**Next Review:** December 2026  
**Owner:** Bex Head ([contact bex](https://sugartown.io/contact/))

---

## TL;DR (The 30-Second Version)

AI is a tool, not a teammate. Humans stay accountable. Transparency beats magic. Data requires consent. Bias exists—plan for it. Document everything. Don't let models make decisions they can't explain. Review regularly. Unicorns are allowed; just keep them away from production.

---

## Table of Contents

- [AI Ethics & Operations (A.K.A. How Not To Build Skynet)](#ai-ethics-operations-aka-how-not-to-build-skynet)
  - [TL;DR (The 30-Second Version)](#tldr-the-30-second-version)
  - [Table of Contents](#table-of-contents)
  - [What This Is (And Isn't)](#what-this-is-and-isnt)
    - [What This Page Isn't](#what-this-page-isnt)
  - [The Operating Principles](#the-operating-principles)
    - [1. Humans Stay Accountable](#1-humans-stay-accountable)
    - [2. Purpose Before Power](#2-purpose-before-power)
    - [3. Transparency Beats Magic](#3-transparency-beats-magic)
    - [4. Data Is Not a Free Buffet](#4-data-is-not-a-free-buffet)
    - [5. Bias Exists. Plan Accordingly.](#5-bias-exists-plan-accordingly)
    - [6. Augment, Don't Replace Judgment](#6-augment-dont-replace-judgment)
    - [7. Fail Softly](#7-fail-softly)
    - [8. Governance Is a Feature](#8-governance-is-a-feature)
    - [9. Creative Play Is Allowed](#9-creative-play-is-allowed)
    - [10. Revisit Regularly](#10-revisit-regularly)
    - [11. Attribution Matters](#11-attribution-matters)
    - [12. Compute Has a Carbon Cost](#12-compute-has-a-carbon-cost)
    - [13. AI-Generated Content Requires Labelling](#13-ai-generated-content-requires-labelling)
  - [When Things Go Wrong (Not If)](#when-things-go-wrong-not-if)
  - [Accessibility Commitment](#accessibility-commitment)
    - [AI Must Not Break Accessibility](#ai-must-not-break-accessibility)
  - [Canonical References (When You Want Receipts)](#canonical-references-when-you-want-receipts)
    - [Standards & Frameworks](#standards--frameworks)
    - [Regulatory & Policy](#regulatory--policy)
    - [Humanitarian & Institutional Ethics](#humanitarian--institutional-ethics)
    - [Model Providers & Safety Research](#model-providers--safety-research)
    - [Practical Case Studies](#practical-case-studies)
    - [Licensing & Copyright](#licensing--copyright)
  - [The Quiet Truth Beneath the Cheeky Attitude](#the-quiet-truth-beneath-the-cheeky-attitude)
  - [Changelog](#changelog)

---

## What This Is (And Isn't)

This isn't a manifesto. It's not a shield against liability. It's the operating system for how I use AI at Sugartown and out IRL—and if you're here reading this, probably how you should think about it too.

We use AI. A lot. Claude drafts. Python scripts publish. Diagrams generate themselves. But the *thinking* stays human, and the *accountability* stays mine.

Here's how that works.

### What This Page Isn't

- **A legal shield** (talk to a lawyer)
- **A substitute for critical thinking** (you still have to use your brain)
- **A promise that we're perfect** (we are not)
- **Permission to be reckless if you follow the rules** (rules ≠ ethics autopilot)

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

## The Operating Principles

### 1. Humans Stay Accountable

AI can suggest, draft, summarize, remix, and hallucinate politely. Humans own decisions, outcomes, and apologies. If something ships, publishes, or impacts a person, a human signs for it.

**In practice:** Every published node has a human author. Every deployment has a human who clicked "merge." Every user-facing decision traces back to a name, not a model version.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 2. Purpose Before Power

Use AI because it reduces toil, improves clarity, or unlocks creativity—not because it's shiny. If the AI output doesn't make work better, faster, or more humane, put the unicorn out to pasture.

The useful test: is this use of AI *serving* the work, or is it just optimising for dominance—speed, scale, competitive edge—as an end in itself? Those are different things with different consequences.

Gandalf said it better, and Leo XIV agreed enough to put it in a papal encyclical:

> "It is not our part to master all the tides of the world, but to do what is in us for the succour of those years wherein we are set, uprooting the evil in the fields that we know, so that those who live after may have clean earth to till." [1]

The argument isn't "do nothing grand." It's "do the right thing at the scale you actually operate." For an AI-assisted publishing platform, that means: ship with integrity, govern the system you've built, don't optimise for dominance. Clean earth to till.

*(Personal note: this quote landing in a document about AI ethics is extremely on-brand for someone who grew up with two Galadriels and a Gandalf. Berkeley Girl Core™ activated.)*

**In practice:** If you're using AI to solve a problem that `grep` handles in 3 seconds, you're cosplaying innovation.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 3. Transparency Beats Magic

People should know when AI is involved, at least at a conceptual level. You don't need a blinking "AI DID THIS" banner—just no deceptive automation cosplay.

**In practice:** If AI writes a draft, we say "drafted with AI, edited by human." If AI generates an image, alt text says so. No sock puppets.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 4. Data Is Not a Free Buffet

Only use data you:
- Are allowed to use
- Understand the provenance of
- Would feel okay explaining out loud to a lawyer, user, journalist, or your dad

If you wouldn't paste it into a public doc, don't feed it to a model.

**Consent matters.** If someone didn't agree to have their data used for training, inference, or fine-tuning, you don't get to treat it like public domain just because it's *technically* accessible.

*(For what it's worth, the Pope agrees: "ownership of data cannot be left solely in private hands." — Magnifica Humanitas, Leo XIV, 2026)*

**In practice:** Client work stays in client contexts. Personal data never trains models. Scraped content gets side-eyed before use.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 5. Bias Exists. Plan Accordingly.

AI reflects the internet, history, and power structures—none of which are neutral. Assume bias is present. Design review, testing, and escalation paths before harm shows up in production.

**In practice:** Test outputs with diverse inputs. Challenge assumptions. If a model's answer feels *off*, trust your instincts and dig deeper.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 6. Augment, Don't Replace Judgment

AI is great at:
- Pattern detection
- Drafting
- Summarizing
- Exploring possibilities

AI is bad at:
- Moral reasoning
- Contextual nuance
- Accountability
- Formatting output according to spec

Treat it like a very fast intern with perfect recall, zero lived experience, and a tendency to confuse "sounds right" with "is right."

**In practice:** AI can draft the spec. Humans decide if it ships. AI can suggest copy. Humans verify it's not confidently wrong.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 7. Fail Softly

Design systems so AI mistakes are:
- Reversible
- Inspectable
- Non-catastrophic

No silent automation cliffs. No "oops, the model decided" moments.

**In practice:** Every automated publish has a rollback mechanism. Every AI-generated output has a human checkpoint. Logs capture everything.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 8. Governance Is a Feature

Logs, versioning, audits, prompts-as-artifacts, and clear ownership are not bureaucracy. They are how you prove you're not running a chaos engine with vibes.

**Prompts are documentation.** Versioning is a safety rail. If you can't explain *why* the AI did something, you don't understand your own system.

**On external accountability:** Governance isn't only internal. If your AI system affects users, they should have a meaningful way to flag issues and influence how the system behaves—not just a contact form that goes into the void. Communities affected by AI decisions shouldn't be passive recipients of choices made elsewhere.

**In practice:** Prompts live in version control. API calls log to structured storage. Every node has a creation timestamp and authorship trail.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 9. Creative Play Is Allowed

Yes, you may:
- Brainstorm with AI
- Use metaphors
- Generate unicorns, diagrams, thought experiments, and hilarious self-portraits

Just don't confuse play with truth or fiction with policy.

**In practice:** AI-generated mockups, diagrams, and concept art? Great. AI-generated legal advice, financial projections, or hiring decisions? Absolutely not.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 10. Revisit Regularly

Responsible AI is not a checkbox. Models change. Context changes. Stakes change. Review assumptions like you review dependencies.

**In practice:** This page gets reviewed every 6 months. Principles update when failures teach us something. The changelog is public.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 11. Attribution Matters

If AI helps write, design, or code something, that's collaboration—not plagiarism, not magic. Credit your tools like you'd credit a co-author. If a model trained on scraped data produces something suspiciously specific, verify provenance. Generators aren't citation engines.

**In practice:** Claude gets credit in project docs. AI-generated images cite the model. If something feels too polished to be original, we verify sources before publishing.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 12. Compute Has a Carbon Cost

Every API call burns electricity. Every training run has a footprint. Use AI where it creates value, not where it's a lazy substitute for a search query or a bash script. Efficiency is an ethics problem, not just an ops problem.

**In practice:** Use cached results when possible. Don't regenerate content unnecessarily. Batch API calls. Choose smaller models when they suffice.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

### 13. AI-Generated Content Requires Labelling

If a machine made it, say so. This isn't about apologising for using AI — it's about not deceiving people. Audiences, clients, and collaborators have a right to know when the thing in front of them originated from a model rather than a person. Labelling is a baseline act of respect.

This is distinct from #3 (Transparency about AI involvement at the system level) and #11 (Attribution of tools and co-authorship). This principle is narrower and more concrete: the output itself should carry a signal.

**In practice:** Published articles drafted with AI carry an editorial note. AI-generated images include a caption or alt text flag. Automated copy in production UI is documented as such in the component spec. When in doubt, label it.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

## When Things Go Wrong (Not If)

AI will fail. Models will hallucinate. Bias will surface. When that happens:

1. **Stop the system** — Pull it offline if harm is occurring
2. **Document the failure** — Logs, inputs, outputs, context
3. **Communicate transparently** — Tell affected people what happened
4. **Fix the root cause** — Not just the symptom
5. **Update this page** — Your ethics are only as good as your learning loop

**Escalation path:** Issues go to [contact bex](https://sugartown.io/contact/). Critical failures pause all automated systems until root cause analysis completes.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

## Accessibility Commitment

### AI Must Not Break Accessibility

If AI generates content, it must:
- Provide alt text for images
- Use semantic HTML
- Work with screen readers
- Not rely on visual-only cues
- Generate WCAG 2.1 AA-compliant output

**If a model outputs inaccessible garbage, that's a bug, not a feature.**

**In practice:** AI-generated images include descriptive alt text. Code snippets include ARIA labels. Content follows semantic heading hierarchy. Automated checks run before publish.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

## Canonical References (When You Want Receipts)

These are widely accepted, boring-in-the-best-way references:

### Standards & Frameworks

- **NIST — AI Risk Management Framework (AI RMF):** Practical, risk-based, and refreshingly grounded.
  https://www.nist.gov/itl/ai-risk-management-framework

- **OECD — AI Principles:** The global baseline most policies quietly borrow from.
  https://oecd.ai/en/ai-principles

- **ISO/IEC 23894 & 42001:** Management-system thinking for AI governance (for grown-ups with compliance needs).
  https://www.iso.org/artificial-intelligence.html

### Regulatory & Policy

- **EU AI Act:** The regulatory hammer that makes "AI governance" a compliance requirement, not a philosophy degree.
  https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai

- **US Federal & State Regulation:** The regulatory landscape is actively shifting. Track current federal executive guidance and state-level AI bills (California, Colorado, and Illinois are most active) separately from this document. Cite a specific law only when it directly governs your operations — linking to something rescinded or superseded does more damage than no link at all.

### Humanitarian & Institutional Ethics

- **Pope Leo XIV — Magnifica Humanitas (2026):** The Catholic Church's first full encyclical on AI. Secular or not, the governance argument is serious: data ownership, participatory oversight, AI in warfare, and the concentration of decision-making power in the hands of a few developers. Worth reading as a moral-philosophy counterweight to the technical frameworks above.
  https://www.vatican.va/content/leo-xiv/en/encyclicals/documents/20260515-magnifica-humanitas.html

- **Vatican — Rome Call for AI Ethics (2020):** The precursor document, signed by Microsoft, IBM, and Cisco. Established the Vatican's position on human dignity and algorithmic accountability before it was fashionable.
  https://www.romecall.org

### Model Providers & Safety Research

- **Anthropic — Responsible Scaling Policy (RSP):** How the people who built Claude think about catastrophic risk. Since we use Claude extensively, worth knowing their red lines.
  https://www.anthropic.com/news/anthropics-responsible-scaling-policy

- **OpenAI — Safety & Governance Approach:** Useful for understanding how frontier-model builders think about risk.
  https://openai.com/safety

### Practical Case Studies

- **Partnership on AI — Case Studies:** Real-world examples of AI doing weird, unexpected things in production.
  https://partnershiponai.org

### Licensing & Copyright

- **Creative Commons — AI & Licensing Considerations:** What copyright means when machines do the remixing.
  https://creativecommons.org/ai/

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

## The Quiet Truth Beneath the Cheeky Attitude

Responsible AI isn't about neutering creativity or slowing teams down. It's about making AI *boring in the ways that matter*, so it can be powerful where it helps.

You can have unicorns. You can brainstorm with models, generate absurd diagrams, and let Claude write your first draft.

Just don't let them run payroll, justice, hiring decisions, or prod deploys unsupervised.

And if something breaks? A human apologizes. Not a model.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)

---

**Last updated:** June 1, 2026  
**Next review:** December 2026  
**Questions?** [contact bex](https://sugartown.io/contact/) (Human. Probably.)

---

## Footnotes

[1] J.R.R. Tolkien, The Lord of the Rings: The Return of the King, Part III, Book Five, Chapter IX (New York: Houghton Mifflin, 1965), p. 190. Spoken by Gandalf the White. Cited in Pope Leo XIV, Magnifica Humanitas, §213, Vatican City, 25 May 2026. This is the first appearance of Tolkien in a papal encyclical — the highest form of ordinary Catholic teaching. Tolkien described The Lord of the Rings as "a fundamentally religious and Catholic work." The quote is used in the encyclical to argue that civilisational change emerges from accumulated small, principled acts, not singular heroic gestures.

---

## Changelog

### v2026.06.01 (June Review — Magnifica Humanitas Update)

- Added Humanitarian & Institutional Ethics sub-section to Canonical References, including Magnifica Humanitas (Leo XIV, 2026) and the Rome Call for AI Ethics (2020)
- Strengthened Principle 4 with data ownership note drawn from encyclical
- Added external accountability note to Principle 8 on participatory governance
- Expanded Principle 2 with Gandalf quote (§213, Magnifica Humanitas), contextual gloss, personal aside, and footnote [1]
- Added Principle 13: AI-Generated Content Requires Labelling (restored from Sanity source; distinct from #3 and #11)
- Added US Federal & State Regulation catch-all to Regulatory & Policy references
- Fixed Magnifica Humanitas Vatican URL to direct encyclical path (20260515-magnifica-humanitas.html)
- Confirmed §213 paragraph number against published text
- Bumped next review to December 2026
- Rationale: June cadence review; Magnifica Humanitas published May 25, 2026 — governance arguments directly relevant to existing principles

### v2025.12.29 (Initial Public Version)

- Established 12 core operating principles
- Added incident response protocol
- Defined accessibility commitments
- Compiled canonical reference library
- Set 6-month review cadence

**Rationale:** Formalized existing practices into documented policy. Sugartown.io has been operating under these principles implicitly; this makes them explicit and auditable.

[↑ Back to top](#ai-ethics-operations-aka-how-not-to-build-skynet)
