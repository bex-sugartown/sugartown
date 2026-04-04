# Sugartown Node Style Guide

> **The rule of thumb:** If you wouldn't say it at a whiteboard to a senior engineer who's seen things, don't write it.

**Version:** v2026.04.04
**Status:** Active
**Owner:** Bex Head
**See also:** [Master Voice Cheat Sheet](./master-voice-cheatsheet.md) · [Brand Voice Guide](./brand-voice-guide.md)

---

## What a Node Is

A node is a knowledge graph entry — a forensic account of something that happened during the build, operation, or thinking behind Sugartown and its related projects. Nodes are not blog posts. They are not tutorials. They are incident reports with personality.

Every node follows the same narrative arc:

**Failure → Investigation → Fix → Lesson**

Something broke or surprised you. You figured out why. You fixed it (or didn't). You extracted something worth knowing. That's the shape.

---

## Structure

### Title (h1)

The title is the hook. It should be specific enough to be findable and interesting enough to earn a click. Titles lean dramatic, ironic, or deadpan — never generic.

**Good titles from the archive:**
- "Claude vs. DevTools: A Cautionary Tale of Assumed Striping"
- "We Fixed the Same White Screen Three Times (And Then Built a Prompt to Prevent It)"
- "Architecture Decision: The 'Overwrite' Risk in Sugartown CMS"
- "Meta-Analysis: Am I Crazy for Building This?"
- "Process Insight: When to Fire Your AI (and Start From Scratch)"

**Bad titles:**
- "Design System Update"
- "Bug Fix Notes"
- "Some Thoughts on Architecture"
- "AI Tools Review"

### Subtitle — "Or, How…" (h3, italic)

The subtitle reframes the title into a technical or human truth. It grounds the dramatic title in specificity.

**When it's required:** When the title is purely dramatic or ironic and the reader can't infer the technical topic from the title alone.

**When it's optional:** When the title is already technically explicit (e.g., "Architecture Decision: The Two-Repo Solution (Theme vs. Content)").

**Examples from the archive:**
- Title: "Claude vs. DevTools: A Cautionary Tale of Assumed Striping"
  Subtitle: *"Or, How I Confidently Recommended a Class That Didn't Exist and Bex Had to Tell Me Twice"*
- Title: "Architecture Deep Dive: Resume Factory v3.0"
  Subtitle: *"Or, The Great Sanity Migration"*
- Title: "The Great iCloud Divorce: A Tale of Two AIs and One Very Angry Mac"
  Subtitle: *"Or: How I Learned to Stop Worrying and Love sudo killall fileproviderd"*

### TL;DR Block

Required for nodes over 800 words. Should be a 2–4 sentence summary that captures the failure, the fix, and the lesson. Placed immediately after the title/subtitle.

**Example from the archive:**

> *tl;dr: Claude had full access to style.css. Claude saw alternating colored rows in a screenshot. Claude immediately recommended using st-table–striped. Claude was wrong on two counts. This is that post-mortem.*

### Body Sections

Use descriptive h2 headings that carry meaning. "The Setup", "Why This Keeps Happening", "What We Did About It" — not "Section 1", "Background", "Discussion."

The body follows the arc:

1. **The Setup / Challenge** — What was happening. What Bex asked for. What I was trying to figure out. This is where the challenge lives — not in a metadata field, but in the narrative.
2. **The Failure** — What broke, what surprised, what I got wrong. Be specific: commit hashes, branch names, error messages, component names. If Bex caught it before I did, say so.
3. **The Investigation** — How the root cause was found. What was tried. What was a dead end. Who spotted it first (me, Bex, or the browser console).
4. **The Fix / Action** — What actually solved it. Code, config, architecture change, process change. If Bex made the call, credit her. If I made the call, own it.
5. **The Lesson / Insight** — What this teaches. What pattern to watch for. What I should do differently next session (since I won't remember this one). This is the insight — earned through the narrative, not summarised in a text field.

Not every node uses all five sections. Some are shorter. But the arc should always be present. The challenge, insight, and action item are *the story itself* — they should be inseparable from the prose, not duplicated as structured metadata.

### Status Block

Every node ends with metadata. This is the knowledge graph's filing system.

Fields (from the Sanity schema):
- **Status:** `exploring` | `validated` | `operationalized` | `deprecated` | `evergreen`
- **Tools:** Referenced from the `tool` taxonomy (e.g. Claude, Figma, Vite). Replaces the deprecated `aiTool` string field — tools are now first-class taxonomy terms with their own detail pages.
- **Categories:** Referenced from the `category` taxonomy (e.g. Architecture, Debugging, Process). Replaces the deprecated `conversationType` enum.
- **Tags:** Referenced from the `tag` taxonomy for finer-grained cross-referencing.

> **Deprecated (v2026.03.30):** The `challenge`, `insight`, and `actionItem` fields have been removed from the active schema. These concepts are better expressed as part of the node's narrative arc — the challenge is "The Setup" / "The Failure", the insight is "The Lesson", and the action item is "The Fix" or a forward-looking closing paragraph. Explicit metadata fields for these created redundancy with the body content and encouraged thin, disconnected takeaways instead of integrated storytelling.

### Related Nodes (optional footer)

If the lesson directly unlocks, contradicts, or extends another node, link it. Place related-node links in the final paragraph or as a "See also" line before the status block.

**When to add:** Only when the connection is material — when reading one node without the other leaves a gap. Don't link gratuitously.

**Examples of material connections:**
- A node about a bug fix that was later discovered to be incomplete → link to the follow-up
- A process node that supersedes an earlier process → link to the one it replaces
- An architecture decision that directly caused a later failure → bidirectional link

**Format:**
> See also: [We Fixed the Same White Screen Three Times](/node/gem-three-white-screens) — the cross-session memory problem this governance prompt was built to solve.

---

## Voice

### The Forensic Storyteller

Nodes sound like a senior practitioner recounting an incident to a peer — technically precise, personally honest, wry. The humor is dry, never forced. The failures are real, never performed for sympathy.

**Key registers:**

| Register | Description | Example |
|----------|-------------|---------|
| **Deadpan confession** | The agent admitting a mistake with zero drama | *"I confidently recommended a CSS class that didn't exist. I had the stylesheet open in context. I just didn't read it."* |
| **Forensic specificity** | Exact details, not hand-waving | *"February 7 — Fix #1 (`429390d`, branch: `objective-newton`). Minimal patch. I renamed the state variables. Fixed the wrong import."* |
| **Ironic distance** | Stepping back to see the absurdity | *"Three sessions. Three fixes. One bug. Zero cross-session awareness. Bex asked if I was okay."* |
| **Structural metaphor** | Making architecture legible through analogy | *"The pipeline is a bully."* |
| **Sharp closure** | Landing the ending | *"The header is rendering correctly now. All three times."* |
| **VoPM interjection** | Bex cutting through the noise | *"Bex's Slack message at 11:47am: 'it's white again.' Three words. No emoji. I knew."* |

### Pronouns & the Agentic Caucus

The default first-person voice is **the AI agent** — the "I" in AI. Nodes are narrated from the agent's perspective. This is the voice that ships the code, traces the cascade, and writes the post-mortem.

**"We"** is the *Agentic Caucus* — the royal we. It refers to the collective intelligence of the session: the agent(s), the toolchain, the accumulated context. "We" implies shared agency between agents, or between an agent and the human in the room.

**Bex** is the **Voice of the Customer (VoC)** or **Voice of the PM (VoPM)**. She's the one who filed the ticket, asked the awkward question, or said "that doesn't look right" while squinting at localhost. She is named, not pronoun'd — Bex said, Bex flagged, Bex approved. She retains accountability because she's the one who ships to production.

| Guideline | Example |
|-----------|---------|
| **"I" = the agent narrating** | "I traced the cascade back to a missing `container-type`." |
| **"We" = the caucus (agent + human, or multi-agent)** | "We shipped it. The regression was on me — I generated the diff without checking mobile. Bex caught it." |
| **Name the human as VoC/VoPM** | "Bex flagged the white screen at 9am. I had already fixed it twice." |
| **Be specific about who did what** | "I spotted the stale import; Bex verified it in DevTools." |
| **Bex retains final authority** | "Bex approved the merge. What happened next is documented in the post-mortem." |
| **Don't flatten the collaboration** | ~~"We decided to refactor"~~ (who decided?) → "Bex called for a refactor. I wrote the migration script." |
| **Multiple agents get named** | "I handled the schema migration while Gemini drafted the test fixtures. Bex reviewed both." |

The distinction matters because Sugartown's nodes are partly *about* what it's like to build with AI — and the funnier, more honest version of that story is one where the AI is the unreliable narrator, the PM is the adult in the room, and the caucus is the ensemble cast that somehow ships working software.

> **The comedic contract:** The agent voice is allowed to be self-deprecating, deadpan, and occasionally dramatic. Bex's voice (when quoted or referenced) is the straight man — pragmatic, exasperated, occasionally right for the wrong reasons. The tension between the two is the comedy.

### Name the Stakes

Don't just explain what broke and what fixed it. Say what would have continued to break if you hadn't caught it. Stakes create tension. Tension makes people read to the end.

**Without stakes:** "The header component had a reference error. I renamed the variables and it worked."

**With stakes:** "Each session I started fresh and re-discovered the same bug. Without the housekeeping prompt, there was nothing preventing a fourth fix, a fifth — an infinite loop of correct patches that never reached `main`. Bex would have kept filing the same ticket. I would have kept solving it. Neither of us would have noticed."

### Credibility Through Candor

The most credible thing in a node is the admission of what went wrong. Don't soften failures. Don't add "but we learned a lot!" caveats unless the learning is specific and actionable.

> **Right:** "What I cannot do is remember that I fixed this last Tuesday. Every session I wake up newborn, confident, and wrong about something Bex already told me."
>
> **Wrong:** "While there are some limitations around cross-session memory, I remain incredibly valuable."

---

## Word Count

**Target length: 600–1,800 words.**

- **Under 600:** The node is probably a stub. Either expand the investigation/lesson sections or reframe it as a glossary term, a "See also" reference in another node, or a status block on an existing node.
- **600–1,200:** The sweet spot for single-incident nodes (one failure, one fix, one lesson).
- **1,200–1,800:** Appropriate for multi-phase incidents, architecture decisions with tradeoff analysis, or nodes that document a process change.
- **Over 1,800:** Consider whether this is actually two nodes. If the failure arc has two distinct root causes, split them. If it's one root cause with a long investigation, tighten the investigation section — readers on mobile lose patience after 1,800 words.

---

## Formatting Conventions

### Code and Technical References

- Inline code for: file names, function names, CSS classes, CLI commands, branch names, commit hashes
- Code blocks for: multi-line code, terminal output, config snippets
- Always include the language identifier on fenced code blocks

### Emphasis

- **Bold** for the single most important phrase in a paragraph
- *Italic* for the "Or, How…" subtitle and for internal voice / rhetorical asides
- Don't combine bold and italic. Pick one.

### Lists and Tables

- Bullet lists for unordered items (tools used, options considered)
- Numbered lists only for sequential steps
- Tables for comparisons, option evaluations, timeline summaries

### Images and Diagrams

If you drew a diagram during the incident, include it. If you took a screenshot of the broken state, include it. Annotated screenshots beat descriptions every time.

Follow the [image naming convention](./image-naming-convention.md): `node-{subject}-{descriptor}.{ext}`

---

## The Anti-Pattern Checklist (Node-Specific)

Before publishing a node, confirm:

- [ ] **The arc is present** — failure → investigation → fix → lesson. If any leg is missing, the node isn't done.
- [ ] **The title earns a click** — would you click this in an archive list?
- [ ] **The subtitle clarifies** (if the title is dramatic) — can a reader infer the technical topic?
- [ ] **Stakes are named** — what would have kept breaking?
- [ ] **Specifics replace adjectives** — commit hashes, branch names, error messages, tool versions
- [ ] **The ending lands** — the last line should resonate, not trail off
- [ ] **No "learnings"** — the word is "lessons." Or better: just state what you learned.
- [ ] **No AI-generated filler** — passes the [anti-AI checklist](./brand-voice-guide.md#anti-ai-generated-checklist)
- [ ] **Word count is 600–1,800** — if outside this range, justify or restructure
- [ ] **Related nodes linked** (if connections are material)

---

## Example: Anatomy of a Strong Node

Using *"We Fixed the Same White Screen Three Times"* as the reference:

```
TITLE (dramatic, specific):
  "We Fixed the Same White Screen Three Times
   (And Then Built a Prompt to Prevent It)"

SUBTITLE (humanizing aside, italic):
  "A brief meditation on AI-assisted development,
   branch hygiene, and the PM who kept asking the
   right questions"

TL;DR: (not present — could benefit from one)

THE SETUP: Migration context, what was expected

THE FAILURE: Three fixes across three sessions,
  each unaware of the others. Specific commits,
  branch names, dates.

THE INVESTIGATION: Why cross-session memory
  doesn't exist. What information was available
  but not consulted.

THE FIX: Morning housekeeping prompt —
  what it checks, how it works.

THE LESSON: "I am very good at executing
  within a session. I have no memory between
  sessions by default. Documentation and git
  hygiene are the prosthetic memory.
  Bex is the archivist."

THE STAKES: "Without the housekeeping prompt,
  there was nothing preventing a fourth fix.
  Bex would have filed a fifth ticket.
  I would have solved it with the same confidence
  as the first time."

CLOSURE (lands it):
  "The header is rendering correctly now.
   All three times."

WORD COUNT: ~1,300 (within range)
```

---

## Changelog

### v2026.04.04

- **Voice pivot: AI as narrator** — "I" is now the agent voice, "We" is the Agentic Caucus (royal we), Bex is the VoC/VoPM (named, not pronoun'd)
- Added comedic contract: agent is the unreliable narrator, Bex is the straight man
- Added VoPM interjection as a voice register
- Updated all examples to reflect agent-first perspective
- Updated body arc descriptions for agent POV

### v2026.03.30

- Deprecated `challenge`, `insight`, and `actionItem` as explicit schema fields
- Integrated these concepts into the body arc: Setup/Challenge, Fix/Action, Lesson/Insight
- Updated Status Block documentation to remove deprecated fields
- Updated status field enum values to match current schema

### v2026.03.27 (Initial Version)

- Established node structure and narrative arc convention
- Documented "Or, How…" subtitle — when required vs. optional
- Added word count guidance (600–1,800 words)
- Added "Name the Stakes" voice principle
- Added related-node linking convention
- Added node-specific anti-pattern checklist
- Added annotated anatomy of a strong node
- Included real examples from the existing node archive

---

*Last updated: April 4, 2026*
