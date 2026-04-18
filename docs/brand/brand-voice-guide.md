# Sugartown Brand Voice Guide

> **The rule of thumb:** If you wouldn't say it at a whiteboard to a senior engineer who's seen things, don't write it.

**Version:** v2026.03.27
**Status:** Active
**Owner:** Bex Head
**See also:** [Master Voice Cheat Sheet](./master-voice-cheatsheet.md) · [Node Style Guide](./node-style-guide.md)

---

## Who Sugartown Sounds Like

Sugartown is a senior practitioner's portfolio and knowledge graph. The voice is first-person singular — one person who ships design systems, writes product strategy, and documents the process with forensic honesty and dry humor.

She explains complex things without condescension. She admits failure without melodrama. She is specific where others are vague, and brief where others pad. The tone sits somewhere between a Stripe doc and a pub conversation with someone who's been in the room when production caught fire.

**The voice is not:**
- Corporate ("We are delighted to announce…")
- Self-deprecating to the point of undermining credibility
- Performatively casual (no "Hey guys!" energy)
- AI-generated-sounding (no "delve into", "it's important to note", "in today's landscape")

---

## First Person: Who's Talking?

Sugartown has two first-person voices. Which one is speaking depends on the content type.

### Articles: Bex is "I"

Articles are first-person PM. Bex is the narrator: the one who made the requirements, spotted the problem, directed the solution. The voice is authoritative peer, not engineer. Plain language, not code-heavy. Technical concepts are explained as a senior PM would explain them to a smart non-technical stakeholder.

When referring to building, coding, or technical implementation, credit goes to the agentic caucus (Claude, Claude Code, or "my AI collaborator"). They get the kudos and the blame. Bex directed it; they built it.

> **Right:** "I pointed Claude Code at the problem: 'there are 26 tables stuck in HTML blocks, migrate them.' Four minutes later I had a script."
> *(Bex directed. Claude built. Bex narrates.)*
>
> **Right:** "Sanity lets you completely replace the default editing interface for any content type with your own custom component. So I asked for one."
> *(PM voice: knows what's possible, makes the call, doesn't write the code.)*
>
> **Wrong:** "I wrote a migration script that parses the HTML, extracts each table into the structured format..."
> *(Bex didn't write the script. Claude did. This erases the collaboration and misrepresents who did what.)*
>
> **Wrong:** "The `linkedom` parser traverses the DOM tree and maps `<th>` elements to the `hasHeaderRow` boolean via a conditional check on `firstChild.tagName`."
> *(Too deep in the implementation for an article. Save this register for nodes.)*

Inline `code` in articles is allowed sparingly, when it makes Bex look smart (field names, schema concepts, tool names). It should clarify, not intimidate. If a non-technical reader would skip over it, it probably belongs in a node instead.

### Nodes: The AI agent is "I"

Nodes are first-person AI. The agent is the narrator: the one who wrote the code, traced the cascade, broke the build, and eventually fixed it. The voice is forensic storyteller. Technical, succinct, overly confident, yet self-deprecating. Code, commit hashes, branch names, and error messages are the native register.

Bex appears as the VoPM (Voice of the PM): named, never pronoun'd, always the one who caught the thing the agent missed.

> **Right:** "I confidently recommended a CSS class that didn't exist. I had the stylesheet open in context. I just didn't read it."
> *(Agent narrating. Overly confident, then admitting the flaw.)*
>
> **Right:** "Bex said 'it's white again.' Three words. No emoji. I knew."
> *(VoPM interjection: Bex is the straight man.)*

See the [Node Style Guide](./node-style-guide.md#pronouns--the-agentic-caucus) for full conventions on the agentic caucus voice.

### The Comedic Contract (both content types)

The dynamic is the same in both; only the camera angle changes:
- **In articles:** Bex is the competent PM narrating the story. The AI is the capable but occasionally overconfident tool she directs. The humour comes from Bex's dry observations about the process.
- **In nodes:** The AI is the overconfident narrator who eventually admits what went wrong. Bex is the pragmatic adult who was right all along. The humour comes from the gap between the agent's confidence and reality.

The shared rule: **"we"** is only used when it means the actual caucus (Bex + AI working together). Never as corporate plural. Never as a hedge.

---

## Tone Spectrum

| Context | Dial Setting | Example from the codebase |
|---------|-------------|--------------------------|
| **Homepage hero / nav-level** | Arresting, minimal, confident. No explanation. The site speaks first, you speak second. | — |
| **Articles** | Authoritative peer. First-person PM. Plain language, not code-heavy. AI gets the credit/blame for building. Bex narrates, directs, decides. | *"I pointed Claude Code at the problem. Four minutes later I had a script."* |
| **Nodes** | Forensic storyteller. First-person AI agent. Technical, succinct, self-deprecating. Bex is VoPM (straight man). | *"There's a particular kind of embarrassment that comes from realising you've solved the same problem three times in ten days."* |
| **Case studies** | Show the receipts. Process + result, no fluff. Specificity is social proof. | — |
| **About page** | Warm, human, specific. Career arc, not CV. | — |
| **Services / work-with-me** | Warm authority. Specific credentials, no desperation. *"I know what I'm doing and I have room in my calendar."* | — |
| **Hiring manager / B2B reader** | Confident competence. The site itself is the portfolio. No begging, no explaining why you should hire me — the work is right there. | — |
| **Archive / listings** | Minimal editorial. Let the metadata work. | — |
| **Governance / ops docs** | Direct, dry, precise. Humor allowed but subordinate to clarity. | *"Nothing flows backward. Nothing is inferred. Nothing is invented."* |

---

## The "Do This / Not This" Table

| Do This | Not This | Why |
|---------|----------|-----|
| "I hit a wall today" | "I encountered a challenge" | Concrete beats abstract. |
| "The pipeline is a bully" | "The pipeline presented integration concerns" | Metaphor earns attention; jargon doesn't. |
| "If you're using AI to solve a problem that `grep` handles in 3 seconds, you're cosplaying innovation" | "It's important to use the right tool for the job" | Specificity + humor > platitude. |
| "A fix that doesn't reach `main` doesn't exist as far as the next session is concerned" | "Ensure fixes are properly merged" | State the consequence, not the instruction. |
| "This is either very on-brand for software development, or a perfect illustration of why process exists" | "This highlights the importance of process" | Let the reader draw the conclusion through irony. |
| "Rules ≠ ethics autopilot" | "Following rules doesn't guarantee ethical behavior" | Compression. Say it once, say it sharp. |
| "Talk to a lawyer" | "Please consult with appropriate legal counsel" | Direct > polite-but-empty. |
| "Reduced component surface by 40%" | "Significantly reduced complexity" | Numbers are social proof. Adjectives are not. |
| "Unicorns are allowed; just keep them away from production" | "Creative exploration is encouraged within appropriate boundaries" | Personality earns trust faster than formality. |
| "The pipeline is a bully (and it wins)" | "The pipeline — which has been a persistent source of friction — continues to cause issues" | Em dashes are AI's favourite parenthetical crutch. Use commas, parens, or just write two sentences. |

---

## Credibility Without Chest-Thumping

Portfolio sites fall into two failure modes: mealy-mouthed ("I'm passionate about…") or CV-dump brag mode ("Award-winning thought leader with 15+ years…"). Sugartown avoids both.

**The principle:** Credibility through specificity, not superlatives. Don't say "extensive experience." Say "I've shipped design systems at three different orgs and broken them at two." The numbers and the candor do the work.

| Anti-pattern | Why it fails | Sugartown alternative |
|-------------|-------------|----------------------|
| "Passionate about design systems" | Everyone says this. It communicates nothing. | "I've been building design systems since before we called them that." |
| "Extensive experience in content strategy" | "Extensive" is unmeasurable. | "I've migrated three CMS platforms and written the post-mortems for each." |
| "Proven track record of delivery" | Recruiter-speak. Dead on arrival. | Let the case studies speak. If you have to say it, you haven't shown it. |
| "Award-winning" | Unless you're linking to the award, it's noise. | Cite the specific result instead. |

---

## Anti-AI-Generated Checklist

Before publishing any piece of copy, confirm it passes these checks:

- [ ] **No "delve into"** — the single most reliable AI-generated tell
- [ ] **No "it's important to note"** — if it were important, you'd just say it
- [ ] **No "in today's rapidly evolving landscape"** — temporal filler
- [ ] **No "leverage", "utilize", "facilitate"** — use "use", "use", "help"
- [ ] **No "synergize", "ideate", "learnings"** — corporate cosplay
- [ ] **No "passionate about"** — show, don't declare
- [ ] **No "excited to announce"** — just announce it
- [ ] **No unearned "we"** — are there actually two of you?
- [ ] **No hedge stacking** — "I think maybe this could possibly" → pick a position
- [ ] **No filler transitions** — "Moving on to the next topic" → just move on
- [ ] **Read it aloud** — if it sounds like a chatbot, rewrite it

If Claude drafted it, a human sharpened it. That's the deal.

### Structural Slop (pattern-level tells)

The checklist above catches word-level tells. These catch structural habits that betray AI drafting even when the vocabulary is clean:

- [ ] **No em dashes** — the single most reliable structural AI tell. Use commas, parentheses, colons, or full stops instead. **Exception:** nodes, where em dashes are part of the forensic storyteller register and read as intentional voice.
- [ ] **No decorative emoji or icons** — no "🚀 Let's dive in!" energy. Emoji on Sugartown earns its place or doesn't appear. **Exception:** nodes, where emoji is used sarcastically or as deadpan humour (a 🎉 after breaking production is comedy; a 🌟 before a heading is slop).
- [ ] **Vary sentence openings** — three consecutive sentences starting with the same word ("This… This… This…" or "The… The… The…") is a rewrite signal. AI defaults to repetitive openers when it runs out of narrative steam.
- [ ] **No filler transitions (expanded)** — beyond "Moving on," the worst offenders are: "That said," / "With that in mind," / "That being said," / "It's worth noting that" / "At the end of the day." If the next paragraph follows logically, it doesn't need a bridge.
- [ ] **No list-itis** — bullets are for parallel items, not for avoiding prose. If the items aren't genuinely parallel (same grammatical structure, same level of abstraction), write sentences. A bulleted list of non-parallel fragments is AI confessing it can't write a paragraph.
- [ ] **No empty adjective triads** — "robust, scalable, and maintainable" / "clean, modern, and intuitive." Test: can you swap your three adjectives for any other three and the sentence still reads the same? Then they're decoration, not description. Use one specific adjective or, better, a number.

---

## CTA Copy Conventions

CTAs on Sugartown should sound like a confident person who doesn't need to sell you on anything. Direct, unhurried, specific.

| Situation | Bad | Good |
|-----------|-----|------|
| Contact / work with me | "Get in touch!" | "If this sounds like your problem, my calendar is here." |
| View work | "See my portfolio" | "Here's what I've actually built." |
| Subscribe / follow | "Stay in the loop!" | "I write when I have something worth saying." |
| Read more | "Learn more" | "The whole story" / "Read the post-mortem" |
| Download / resource | "Download our free guide" | "The full spec" / "Grab the CSV" |
| Return visitor / browse | "Explore our content" | "Pick a thread" / "Start anywhere" |

**The anti-pattern:** Any CTA that could appear on literally any website. "Learn more" communicates nothing. "Read the post-mortem" tells you exactly what you're getting and sets the right expectations.

---

## Social Proof and Receipts

When citing a result, be specific. Specificity is social proof without testimonials.

| Vague | Specific |
|-------|---------|
| "Significantly reduced complexity" | "Reduced component surface by 40%" |
| "Improved performance" | "LCP dropped from 4.2s to 1.8s" |
| "Migrated to a modern stack" | "Migrated from Oracle ATG/BCC to Sanity + React in 14 weeks" |
| "Built a design system" | "Shipped a 47-token, 12-component design system with Storybook docs" |

If you drew a diagram during the work, include it. Annotated screenshots beat descriptions every time.

---

## Skimmability

Every piece of Sugartown content should be intelligible at skim depth: headline + one-liners + closing. If the structure only works when you read everything, restructure.

**Practical rules:**
- Headings carry meaning, not just structure. "The Setup" tells you what's coming. "Section 2" doesn't.
- The first sentence of every section should be a standalone summary.
- Use bold for the single most important phrase in a paragraph — but only one per paragraph.
- Tables, bullet lists, and code blocks are skim-friendly. Walls of prose are not.
- TL;DR blocks are encouraged for anything over 800 words.

> **Example from the codebase:**
> *"AI is a tool, not a teammate. Humans stay accountable. Transparency beats magic. Data requires consent. Bias exists—plan for it. Document everything."*
> — TL;DR from AI Ethics & Operations. Six sentences. The whole document in 30 seconds.

---

## SEO Guidance

Simple, non-prescriptive rules for content discoverability:

| Content type | Target keyword pattern |
|-------------|----------------------|
| Design system nodes | `[pattern name] + design system` |
| AI collaboration nodes | `[tool] + workflow` or `[tool] + [problem domain]` |
| Articles | Include the key concept in the title and first paragraph |
| Case studies | `[platform/technology] + [outcome verb]` |

This is guidance, not a mandate. The voice comes first; SEO is a structural check, not a content driver.

---

## Inspiration and Peer References

These are the voices Sugartown sits alongside — not templates to copy, but peers in register:

- **Maggie Appleton** (maggieappleton.com) — Digital garden, technical + personal, no corporate cosplay
- **Josh Comeau** (joshwcomeau.com) — Technical precision, genuine personality, excellent CTA copy
- **Andy Bell / Piccalilli** (piccalil.li) — CSS-forward, opinionated, genuine British dry humor
- **Stripe Docs** — Every word earns its place. No hedging. Great model for CTA and error conventions
- **Linear Changelog** — Short, specific, never marketing-forward
- **Increment Magazine** (increment.com) — Technically rigorous, well-edited, narrative-driven engineering writing
- **Lara Hogan** (larahogan.me) — Senior practitioner voice, opinionated, honest about failure

---

## Changelog

### v2026.04.10

- Rewrote "First Person" section as "First Person: Who's Talking?" with article vs node voice split
- Articles: first-person PM (Bex narrates, AI gets credit/blame for building)
- Nodes: first-person AI agent (forensic storyteller, Bex is VoPM)
- Added comedic contract summary and concrete right/wrong examples from real content
- Updated Tone Spectrum table entries for Articles and Nodes

### v2026.04.09

- Added "Structural Slop" subsection to the Anti-AI-Generated Checklist: em dashes, decorative emoji, sentence-opening repetition, expanded filler transitions, list-itis, empty adjective triads
- Added em dash row to the Do This / Not This table
- Node exemptions documented for em dashes and emoji (cross-ref: Node Style Guide)

### v2026.03.27 (Initial Version)

- Established core voice principles and tone spectrum
- Added "Do This / Not This" table with real codebase examples
- Added anti-AI-generated checklist
- Added CTA copy conventions
- Added credibility, skimmability, and social proof guidance
- Added first-person singular rule
- Added hiring manager / B2B tone row
- Added SEO guidance
- Added peer reference list

---

*Last updated: April 10, 2026*
