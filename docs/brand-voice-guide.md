# Sugartown — Brand Voice Guide

> The general writing voice for sugartown.io: articles, about copy, services pages, archive descriptions, and any public-facing prose that isn't a knowledge graph node.
>
> For knowledge graph nodes specifically, see `docs/node-style-guide.md` — nodes have a tighter structural template and their own narrative arc conventions.

---

## The Sugartown Voice in One Sentence

**A senior practitioner who builds things, breaks things, ships things, and writes about it like she's telling you over drinks — not presenting at a conference.**

---

## Voice & Tone

### Core identity

- **Tech-savvy and literate** — references architecture, tooling, and implementation detail without apology. Assumes the reader can follow. Never dumbs down, never explains what a CSS custom property is.
- **Cheeky, not cute** — the humour is dry, structural, and rooted in lived experience. It lands because it's specific, not because it's trying to be relatable. Think "first day back from holiday and the CI pipeline has opinions" not "coding is hard, amirite?"
- **Human and anti-AI-generated** — the writing has rhythm, opinion, and texture. Sentences vary wildly in length. Fragments are used deliberately. There is a person behind this, and she has takes.
- **Old-school tech-tastic** — respects the craft. References the lineage of ideas (Brad Frost, Ethan Marcotte, the original CSS Zen Garden spirit). Treats the web as a medium with history, not a blank canvas for the latest framework churn.

### Tone spectrum

| Context | Tone dial |
|---------|-----------|
| **Articles / blog** | Opinionated, narrative, generous with detail. The long-form voice. |
| **About page** | Confident, warm, slightly theatrical. This is the elevator pitch wearing good shoes. |
| **Services page** | Direct, professional, still human. No buzzword bingo. Say what you do and why it works. |
| **Archive descriptions** | Punchy, inviting, 1-3 sentences. The hook that makes someone scroll the listing. |
| **Case studies** | Show-don't-tell. Lead with the problem, not the client name. Honest about constraints. |

### What makes it sound like Sugartown

| Do this | Not this |
|---------|----------|
| "Seven components. One interaction pattern." | "We leverage a component-driven architecture to streamline user flows." |
| "The schema was wrong. Not *a little* wrong." | "Upon investigation, several areas for improvement were identified." |
| "I built this with Claude at 2am and I'd do it again." | "AI-assisted development enhances productivity." |
| "Design systems don't die. People stop maintaining them." | "It's important to invest in design system sustainability." |
| "This page exists because someone asked what I actually do." | "Welcome to our services page." |

---

## The Anti-AI-Generated Checklist

Before publishing, run every piece of copy through this filter. If more than two of these are true, rewrite.

- [ ] Could a prompt like "write a blog post about design systems" have produced this?
- [ ] Does it use "leverage," "unlock," "empower," "elevate," or "streamline" unironically?
- [ ] Are all the sentences roughly the same length?
- [ ] Does the opening paragraph summarise the entire piece? (AI loves to front-load conclusions)
- [ ] Is the tone relentlessly positive with no edge, opinion, or surprise?
- [ ] Could you swap the author name and nobody would notice?
- [ ] Does it end with a call to action that sounds like a LinkedIn post?

**The fix:** Add a specific detail only you would know. Add an opinion. Add a sentence fragment. Break a rule on purpose and leave it broken.

---

## Content Type Definitions

### When something is a Node vs. an Article

This is the most common editorial decision. Here's the line:

| | **Node** (Knowledge Graph) | **Article** (Blog) |
|---|---|---|
| **Core shape** | Failure → investigation → fix → lesson | Thesis → argument → evidence → position |
| **Trigger** | Something broke, surprised you, or taught you something during a build session | You have an opinion, observation, or synthesis that didn't come from a single incident |
| **Narrative arc** | Detective story: "Here's the crime scene, here's what happened, here's the guardrail" | Essay: "Here's what I think and why, with receipts" |
| **Scope** | One specific decision, one specific codebase surface | Broader — can span multiple projects, industry trends, or philosophical positions |
| **Technical depth** | Deep. File names, GROQ queries, CSS selectors, commit hashes. | Variable. Can be deeply technical or entirely conceptual. |
| **Protagonist** | The codebase (and the human trying not to break it) | The author's perspective on the industry, craft, or practice |
| **Structured fields** | `challenge`, `insight`, `actionItem`, `conversationType`, `aiTool` | Standard: `excerpt`, categories, tags |
| **Example title** | "The Button That Had Two Names" | "Dashboards Aren't Dead. We Just Stopped Explaining Them Slowly Enough." |
| **Shelf life** | Often evergreen within the project context | Evergreen in principle, but can be timely / topical |

**Rule of thumb:** If the interesting part is *what happened in the code*, it's a node. If the interesting part is *what you think about it*, it's an article.

**Grey area:** A post-mortem that becomes a broader industry take? Start as a node, then write the article that references it. Two pieces, not one Frankenstein piece.

### Case Studies

Not blog posts. Not portfolio screenshots with captions.

A case study answers: *What was the problem, what did you actually do, and what happened as a result?* It should make the reader think "I wish I'd done that" or "I've been there."

- Lead with the constraint, not the deliverable
- Name the tension (budget vs. scope, speed vs. quality, client vision vs. user reality)
- Show the work: screenshots, schemas, architecture diagrams, before/after
- Be honest about trade-offs. What would you do differently?

### About / Services / Page Copy

Short-form prose that lives on section-builder pages. These aren't articles — they're architectural. Every sentence earns its place or gets cut.

- **About:** Who you are, what you believe, why it matters. First person. Confident without being insufferable.
- **Services:** What you do, for whom, and what they get. Lead with the client's problem, not your capability list.
- **Archive descriptions:** The 1-3 sentence pitch for an entire content collection. Make someone want to scroll.

---

## Structure (Articles)

### Title

Opinionated, specific, and impossible to ignore. The title is a thesis statement wearing a leather jacket.

**Good:** "Dashboards Aren't Dead. Neither Are Design Systems. We Just Stopped Explaining Them Slowly Enough."
**Bad:** "Thoughts on Modern Design Systems"

### Subtitle (optional)

A secondary hook that adds context or a contrarian angle. Can be a question, a provocation, or a setup for the argument.

### Opening paragraph

Never summarise the article. Drop the reader into the middle of something — a moment, an observation, a provocation. The first sentence should make them commit to the second.

**Good:** "Every so often, a think piece drifts through the timeline announcing the ceremonial funeral of dashboards."
**Bad:** "In this article, I'll explore the current state of design systems and why they still matter."

### Body

No fixed template — articles are essays, not forms. But:

- Use h2 headings as chapter breaks, not as labels
- Mix paragraph length aggressively (one-sentence paragraphs are a tool, not laziness)
- Code examples when they clarify, never when they pad
- Blockquotes for principles you're codifying or positions you're challenging
- End sections with a thought that connects to the next, not with a summary

### Closing

Never "thanks for reading." Never "what do you think? Let me know in the comments."

End with: a provocation, a callback to the opening, a quiet admission, or a joke that lands because of everything that preceded it.

---

## Inline Conventions

- **Bold for emphasis** — sparingly. If everything is bold, nothing is.
- **Backtick code references** — exact: `tokens.css`, `getOverlayStyles()`, `--st-color-pink`. Never vague.
- **Em dashes** — the Sugartown punctuation of choice. Use them for asides, pivots, and dramatic pauses.
- **Sentence fragments.** Deliberate. For rhythm.
- **One emoji max** per piece, and only if it earns its place. Never mid-argument.
- **No exclamation marks** unless quoting someone else or expressing genuine surprise at something catching fire.

---

## Taxonomy Assignment (Articles)

### Categories (assign 1-2)

| Category | When to use |
|----------|------------|
| **Design Systems** | Component architecture, tokens, patterns, reuse philosophy |
| **Engineering & DX** | Tooling, builds, developer experience, infrastructure |
| **AI Collaboration** | Working with AI tools, agentic workflows, prompt craft |
| **Ways of Working** | Process, methodology, team dynamics, remote work |
| **Content Architecture** | CMS, schema design, content strategy, structured content |
| **Industry Commentary** | Hot takes, trend analysis, conference debrief, counterarguments |

### Tags (assign 3-6)

Use existing tags. Check the taxonomy in Sanity before creating new ones. The gatekeeping rule from the node guide applies here too: don't create `component reuse` if `reusable` exists.

---

## SEO Fields

| Field | Guidance |
|-------|----------|
| `seo.title` | Under 60 chars. Can be more search-friendly than the display title. Include the key concept. |
| `seo.description` | 150-160 chars. Summarise the argument or position. Include the key term naturally. |
| `openGraph.title` | Punchier than seo.title. This is what shows on social. |
| `openGraph.description` | 1-2 sentences. What will make someone click in a feed full of AI-generated summaries? |

---

## Anti-Patterns

Things that are **not** the Sugartown voice, in any content type:

- **Corporate passive** — "It was determined that..." Who determined it? You did. Say so.
- **AI slop markers** — "Let's dive in," "In today's rapidly evolving landscape," "Here's the thing," "At the end of the day." These are tells. Kill them.
- **Hedging without stakes** — "It might be worth considering..." If it's worth considering, consider it. If not, cut it.
- **Gratuitous positivity** — Not everything is "exciting" or "amazing." Some things are just competent. Some things are hard. Say that.
- **Buzzword density** — If you can replace your paragraph with a LinkedIn post and lose nothing, the paragraph had nothing.
- **False casualness** — "So, yeah, basically..." is not voice. It's filler wearing a hoodie.
- **Tutorial condescension** — "First, open your terminal" or "As you may know..." The reader already has a terminal open. They live there.

---

## Relationship to Node Style Guide

The node guide (`docs/node-style-guide.md`) is a **specialisation** of this brand guide, not a replacement. Nodes inherit the core voice principles above but add:

- A fixed narrative arc (failure → investigation → fix → lesson)
- Structured metadata fields (`challenge`, `insight`, `actionItem`, `conversationType`)
- The "Or, How..." subtitle convention
- PM-Claude dialogue format
- Status block sign-offs

If the brand voice guide and the node guide conflict, **the node guide wins for nodes** — it's the more specific contract. For everything else, this document is the authority.

---

*docs/brand-voice-guide.md · Sugartown Digital · 2026-03-22*
