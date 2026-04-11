# AI Ethics & Operations (A.K.A. How Not To Build Skynet)

**Version:** v2026.04.11
**Status:** Active
**Next Review:** October 2026
**Owner:** Bex Head ([contact bex](https://sugartown.io/contact/))

---

## TL;DR (The 30-Second Version)

AI is a tool, not a teammate. Humans stay accountable. Transparency beats magic. Data requires consent. Bias exists, plan for it. Document everything. Don't let models make decisions they can't explain. Review regularly. Unicorns are allowed; just keep them away from production.

---

## What This Is (And Isn't)

This isn't a manifesto. It's not a shield against liability. It's the operating system for how I use AI at Sugartown and out IRL, and if you're here reading this, probably how you should think about it too.

The technology is new. It's powerful, it's controversial, and the rules are still being written. That makes it more important, not less, to think about ethics and guardrails early, often, and in public. This page is part of that effort: a transparent accounting of where and how AI is used in my work, what I consider acceptable, and where I draw the lines.

**Where AI shows up in this project:**

- **Claude Code** writes code, runs migrations, generates components, and manages the git workflow. Every commit in this monorepo is co-authored with an AI agent.
- **Sanity Studio** content is authored, edited, and sometimes drafted by AI, then reviewed and published by a human. The knowledge graph nodes are narrated from the AI agent's perspective by design.
- **Design system tokens, schemas, and validators** are generated and maintained by AI within human-defined constraints (the PRD, CLAUDE.md conventions, epic specs).
- **Content strategy, editorial decisions, and architectural choices** stay human. AI proposes; I decide, approve, and ship.

The accountability is mine. The code co-pilot is Claude. The thinking is a collaboration, but the signature on every deploy is a person's.

**What This Page Isn't:**
- A legal shield (talk to a lawyer)
- A substitute for critical thinking (you still have to use your brain)
- A promise that we're perfect (we are not)
- Permission to be reckless if you follow the rules (rules are not ethics autopilot)

---

## The Operating Principles

### 1. Humans Stay Accountable
*Every decision traces back to a name, not a model version.*

AI can suggest, draft, summarize, remix, and hallucinate politely. Humans own decisions, outcomes, and apologies. If something ships, publishes, or impacts a person, a human signs for it.

**In practice:** Every commit in this repo carries a `Co-Authored-By: Claude` tag, but every merge to `main` is a human decision. Every Sanity document is published by a human. Node content is narrated by the AI agent, but Bex reviews, edits, and approves before it goes live. The agent writes the post-mortem; the human decides if the lesson is correct.

### 2. Purpose Before Power
*If grep handles it in 3 seconds, AI is cosplaying innovation.*

Use AI because it reduces toil, improves clarity, or unlocks creativity, not because it's shiny. If the AI output doesn't make work better, faster, or more humane, put the unicorn out to pasture.

**In practice:** If you're using AI to solve a problem that `grep` handles in 3 seconds, you're cosplaying innovation.

### 3. Transparency Beats Magic
*No deceptive automation cosplay.*

People should know when AI is involved, at least at a conceptual level. You don't need a blinking "AI DID THIS" banner, just no deceptive automation cosplay.

**In practice:** Knowledge graph nodes are explicitly AI-narrated (the agent is the "I" in the story). Articles are first-person PM, with AI collaboration credited. Every git commit is co-authored. The site's brand voice guide documents the split: articles = human narrator, nodes = AI narrator. No sock puppets.

**Regulatory context (2026):** The EU AI Act Article 50 transparency obligations become enforceable August 2026, requiring disclosure of AI interactions and labelling of synthetic content. Washington State signed AI disclosure and watermarking requirements into law in March 2026. This principle already aligns with where regulation is heading.

### 4. Data Is Not a Free Buffet
*If you wouldn't paste it into a public doc, don't feed it to a model.*

Only use data you are allowed to use, understand the provenance of, and would feel okay explaining out loud to a lawyer, user, journalist, or your dad.

**Consent matters.** If someone didn't agree to have their data used for training, inference, or fine-tuning, you don't get to treat it like public domain just because it's technically accessible.

**In practice:** Client work stays in client contexts. Personal data never trains models. Scraped content gets side-eyed before use.

### 5. Bias Exists. Plan Accordingly.
*Assume bias is present. Design review before harm shows up in production.*

AI reflects the internet, history, and power structures, none of which are neutral. Assume bias is present. Design review, testing, and escalation paths before harm shows up in production.

**In practice:** Test outputs with diverse inputs. Challenge assumptions. If a model's answer feels off, trust your instincts and dig deeper.

### 6. Augment, Don't Replace Judgment
*AI is a very fast intern with perfect recall, zero lived experience, and a tendency to confuse "sounds right" with "is right."*

AI is great at pattern detection, drafting, summarizing, and exploring possibilities. AI is bad at moral reasoning, contextual nuance, accountability, and formatting output according to spec.

**In practice:** AI can draft the spec. Humans decide if it ships. AI can suggest copy. Humans verify it's not confidently wrong.

### 7. Fail Softly
*No silent automation cliffs. No "oops, the model decided" moments.*

Design systems so AI mistakes are reversible, inspectable, and non-catastrophic.

**In practice:** Sanity content is created as drafts; a human publishes. Migration scripts run in dry-run mode first (always). Validators (`validate:tokens`, `validate:urls`, `validate:content`) catch drift before it ships. Schema changes require explicit deployment. The epic close-out sequence enforces commit, deploy, ship, verify as a mandatory sequence.

### 8. Governance Is a Feature
*If you can't explain why the AI did something, you don't understand your own system.*

Logs, versioning, audits, prompts-as-artifacts, and clear ownership are not bureaucracy. They are how you prove you're not running a chaos engine with vibes.

**Prompts are documentation.** Versioning is a safety rail.

**In practice:** `CLAUDE.md` defines conventions the AI agent must follow. `MEMORY.md` persists architectural decisions across sessions. Epic specs in `docs/backlog/` are the prompts that drive implementation. Every session runs `/morning` (health check) and `/eod` (wrap-up). Post-mortem findings are codified as rules, not just learned. Prompts are version-controlled artifacts, not ephemeral chat.

**Industry context (2026):** ISO/IEC 42001 (AI Management System) is now the auditable standard for AI governance. The G7 Hiroshima AI Process calls for documented risk management policies. Regulators are increasingly asking for demonstrable controls (training data documentation, risk assessments, bias testing, incident response plans), not aspirational ethics statements.

### 9. Creative Play Is Allowed
*Unicorns are allowed. Just keep them away from production.*

Yes, you may brainstorm with AI, use metaphors, generate unicorns, diagrams, thought experiments, and hilarious self-portraits. Just don't confuse play with truth or fiction with policy.

**In practice:** AI-generated mockups, diagrams, and concept art? Great. AI-generated legal advice, financial projections, or hiring decisions? Absolutely not.

### 10. Revisit Regularly
*Responsible AI is not a checkbox.*

Models change. Context changes. Stakes change. Review assumptions like you review dependencies.

**In practice:** This page gets reviewed every 6 months. Principles update when failures teach us something. The changelog is public.

### 11. Attribution Matters
*Credit your tools like you'd credit a co-author.*

If AI helps write, design, or code something, that's collaboration, not plagiarism, not magic. Credit your tools like you'd credit a co-author. If a model trained on scraped data produces something suspiciously specific, verify provenance. Generators aren't citation engines.

**In practice:** Every git commit carries `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`. The brand voice guide explicitly documents which content types are AI-narrated (nodes) versus human-narrated (articles). AI-generated diagrams cite the tool. The site itself is the portfolio for this collaboration, not a secret.

### 12. Compute Has a Carbon Cost
*Efficiency is an ethics problem, not just an ops problem.*

Every API call burns electricity. Every training run has a footprint. Use AI where it creates value, not where it's a lazy substitute for a search query or a bash script.

**In practice:** Use cached results when possible. Don't regenerate content unnecessarily. Batch API calls. Choose smaller models when they suffice.

### 13. AI-Generated Content Requires Labelling
*If a machine made it, say so. If a machine changed it, say so.*

**New for v2026.04.** As AI-generated text, images, and media become indistinguishable from human-created content, disclosure is a baseline ethical obligation, not just a legal one. This applies to published content, client deliverables, and internal documentation.

**In practice:** Published articles drafted with AI include a disclosure. AI-generated images carry metadata and visible attribution. Synthetic media (audio, video) is labelled before distribution. The Sugartown node system credits the AI agent as narrator by design; articles credit AI collaboration in the byline.

**Regulatory context:** EU AI Act Article 50 (August 2026) requires AI-generated and AI-manipulated content to be identifiable via visible labels, metadata, or watermarking. US states (Washington, California) are enacting similar disclosure laws. This principle operationalizes compliance.

---

## When Things Go Wrong (Not If)

AI will fail. Models will hallucinate. Bias will surface. When that happens:

1. **Stop the system.** Pull it offline if harm is occurring.
2. **Document the failure.** Logs, inputs, outputs, context.
3. **Communicate transparently.** Tell affected people what happened.
4. **Fix the root cause.** Not just the symptom.
5. **Update this page.** Your ethics are only as good as your learning loop.

**Escalation path:** Issues go to [contact bex](https://sugartown.io/contact/). Critical failures pause all automated systems until root cause analysis completes.

---

## Accessibility Commitment

### AI Must Not Break Accessibility

If AI generates content, it must:
- Provide alt text for images
- Use semantic HTML
- Work with screen readers
- Not rely on visual-only cues
- Generate WCAG 2.1 AA-compliant output (minimum)

**If a model outputs inaccessible garbage, that's a bug, not a feature.**

**In practice:** AI-generated images include descriptive alt text. Code snippets include ARIA labels. Content follows semantic heading hierarchy. Automated checks run before publish.

---

## Canonical References (When You Want Receipts)

### Standards & Frameworks

- **NIST AI Risk Management Framework (AI RMF):** Practical, risk-based, and refreshingly grounded.
  https://www.nist.gov/itl/ai-risk-management-framework

- **OECD AI Principles:** The global baseline most policies quietly borrow from.
  https://oecd.ai/en/ai-principles

- **ISO/IEC 42001 (AI Management System):** The auditable management system standard for AI governance. The grown-up version of "we have an AI policy."
  https://www.iso.org/standard/81230.html

- **ISO/IEC 23894 (AI Risk Management):** Risk management guidance for AI systems.
  https://www.iso.org/artificial-intelligence.html

- **G7 Hiroshima AI Process:** International consensus on AI governance principles, including risk-based approaches and interoperability of frameworks.

### Regulatory & Policy

- **EU AI Act:** The regulatory hammer. Prohibited systems banned February 2025. GPAI transparency August 2025. Article 50 content labelling August 2026. High-risk system requirements phased through 2027.
  https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai

- **US Executive Order on AI (December 2025):** Federal coordination of AI governance, with states remaining primary enforcement drivers.

- **US State Laws:** Colorado AI Act, Washington AI disclosure/watermarking law (March 2026), California AI transparency bills. Fragmented but increasingly specific.

- **UK AI Safety Institute / Bletchley Declaration:** Safety-testing frameworks for frontier models.

### Model Providers & Safety Research

- **Anthropic Responsible Scaling Policy (RSP):** How the people who built Claude think about catastrophic risk. Since we use Claude extensively, worth knowing their red lines.
  https://www.anthropic.com/news/anthropics-responsible-scaling-policy

- **OpenAI Safety & Governance:** Useful for understanding how frontier-model builders think about risk.
  https://openai.com/safety

### Practical Case Studies

- **Partnership on AI:** Real-world examples of AI doing weird, unexpected things in production.
  https://partnershiponai.org

### Licensing & Copyright

- **Creative Commons AI & Licensing Considerations:** What copyright means when machines do the remixing.
  https://creativecommons.org/ai/

---

## The Quiet Truth Beneath the Cheeky Attitude

Responsible AI isn't about neutering creativity or slowing teams down. It's about making AI boring in the ways that matter, so it can be powerful where it helps.

You can have unicorns. You can brainstorm with models, generate absurd diagrams, and let Claude write your first draft.

Just don't let them run payroll, justice, hiring decisions, or prod deploys unsupervised.

And if something breaks? A human apologizes. Not a model.

---

**Last updated:** April 11, 2026
**Next review:** October 2026
**Questions?** [contact bex](https://sugartown.io/contact/) (Human. Probably.)

---

## Changelog

### v2026.04.11

- **Opening statement rewritten** with transparency rationale and categorised AI usage (Claude Code, Sanity Studio, design system, editorial decisions).
- **New principle: #13 AI-Generated Content Requires Labelling.** Operationalizes EU AI Act Article 50 and US state disclosure laws. Applies to text, images, and synthetic media.
- **"In practice" sections updated** across principles #1, #3, #7, #8, #11 to reflect actual monorepo architecture (CLAUDE.md, MEMORY.md, epic specs, validators, co-authored commits, brand voice guide narrator split).
- **Regulatory context added** to principles #3 (Transparency) and #8 (Governance) with 2026 enforcement timelines.
- **Updated references:** Added ISO/IEC 42001, G7 Hiroshima AI Process, UK AI Safety Institute, US Executive Order (Dec 2025), Washington State AI disclosure law (March 2026).
- **Review cadence** moved from June 2026 to October 2026 (just reviewed).
- **Page restructured** for SUG-61 rebuild: principles rendered as accordion (H3 = accordion items), narrative sections remain inline text (H2 = inline). Accordion content styleguide authored in `docs/backlog/SUG-61-ai-ethics-rebuild.md`.

### v2025.12.29 (Initial Public Version)

- Established 12 core operating principles
- Added incident response protocol
- Defined accessibility commitments
- Compiled canonical reference library
- Set 6-month review cadence

**Rationale:** Formalized existing practices into documented policy. Sugartown.io has been operating under these principles implicitly; this makes them explicit and auditable.
