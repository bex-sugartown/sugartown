# Sugartown — Knowledge Graph Node Style Guide

> Reference for writing, structuring, and tagging knowledge graph nodes.
> This captures the voice, conventions, and metadata patterns established across 40+ published nodes.

---

## Voice & Tone

**First-person, technically precise, conversationally delivered.** The voice of someone who builds systems for a living and has opinions about how badly things can go when you don't.

### Core principles

- **Peer address** — write as if the reader builds the same kind of things you do. Never lecture. Frame lessons as "what I should have done" not "what you should do."
- **Dry humor from specificity** — comedy comes from the gap between what *should* have happened and what *actually* happened. The funnier the failure, the more specific the detail.
- **Technical precision in casual containers** — exact file names, class names, GROQ projections, and CSS properties quoted inline. But wrapped in sentences that read like a conversation, not a spec.
- **Self-deprecating but never self-pitying** — mistakes are opportunities for comedy. "Ouch. Deserved." not "I'm terrible at this."

### Signature humor patterns

| Pattern | Example |
|---------|---------|
| **The escalating reveal** | Start with a simple ask, then reveal the absurd actual outcome: "PM asked for a button label fix. What she got: a new governance convention, two epic template additions, and a post-mortem." |
| **Punchy one-liners as paragraph breaks** | "Clean. Tidy. Dangerously incomplete." / "This is the moment I started questioning my life choices." |
| **Dialogue format** | PM-Claude exchanges with stage directions in italics: `*[uncomfortable pause]*`, `*[scrolling through 47 button variants]*` |
| **Running gag closers** | Status checkboxes: "Status: Reconciled (for real this time)" / "Emotional state: Exhausted but organized" / "Grass touching: Imminent" |
| **Pop-culture/literary allusion in titles** | Dr. Strangelove, Jane Eyre, film noir. Titles should make the reader smirk before they learn anything. |
| **The analogy punchline** | "Seven components. One interaction pattern: a user clicks a thing and goes somewhere." |

---

## Structure

### Title

Long-form, dramatic or ironic. Frequently uses colons or subtitle structure. Should make someone want to click even if they don't know the tech stack.

**Good:** "The Button That Had Two Names (And Why Your Design System Is Lying to You)"
**Bad:** "CTA Button Schema Refactoring Notes"

### Subtitle (optional h3, italic)

Always starts with "Or, How..." — a secondary hook that previews the specific failure:

> *Or, How We Discovered That "Just Add a Label Field" Is the Enterprise Equivalent of "Just One More Lane"*

### TL;DR (top of body)

Bold label, 1-3 sentences. Summarize the failure and the fix in plain English. This is the "elevator pitch" for the node.

### Body sections (h2 headings)

Short, punchy noun phrases following a narrative arc:

1. **The Setup / The Crime Scene** — immediate context (1-3 paragraphs)
2. **Why This Happens** — pattern recognition, industry context
3. **The Sprawl / The Multiplier** — what this looks like at scale
4. **The Fix** — concrete solution with code examples
5. **The Guardrail** — process/governance changes to prevent recurrence
6. **The Uncomfortable Truth / The Punchline** — synthesis, why it matters beyond this one case

### Inline conventions

- **Bold inline labels** for structured content: **"The Actual Problem:"**, **"The Fix:"**, **"The Rule:"**
- **Backtick code references** — always specific: file names, class names, field names, never vague
- **Tables** for structured comparisons (What We Had vs. What We Should Have Had)
- **Blockquotes** for principles or rules being codified
- **Numbered lists** for sequential processes; bullet lists for parallel items

### Sign-off (optional)

Either a humorous status block or a sign-off. Never a "thanks for reading."

---

## Structured Fields (Sanity schema)

Every node has structured metadata fields beyond the body `content`. Fill these before publishing.

| Field | Type | Purpose | Guidance |
|-------|------|---------|----------|
| `title` | string | Display title | Dramatic/ironic. See Title section above. |
| `slug` | slug | URL segment | Kebab-case, derived from title. Keep under 60 chars. |
| `excerpt` | text | Card/archive description | 1-2 sentences. Technical summary, not marketing copy. |
| `challenge` | text | Problem framing | The question or tension this node addresses. 1-2 sentences. |
| `insight` | text | Key takeaway | The lesson distilled to one paragraph. Should stand alone. |
| `actionItem` | text | Next step | Imperative voice. What should someone do after reading this? |
| `conversationType` | select | Content classification | `architecture`, `reflection`, `learning`, `code` |
| `status` | select | Lifecycle state | `exploring`, `explored`, `evergreen`, `operationalized` |
| `aiTool` | select | AI tool used | `claude`, `chatgpt`, `gemini`, `mixed`, etc. |

### Status values explained

| Status | Meaning |
|--------|---------|
| `exploring` | Active investigation, conclusions not yet firm |
| `explored` | Investigation complete, findings documented |
| `evergreen` | Durable principle or pattern — unlikely to change |
| `operationalized` | Pattern encoded in codebase/process (CLAUDE.md, epic template, etc.) |

### Conversation types explained

| Type | When to use |
|------|-------------|
| `architecture` | Design decisions, system structure, component composition |
| `reflection` | Lessons learned, post-mortems, process improvements |
| `learning` | New technique discovered, tutorial-style content |
| `code` | Deep technical implementation, debugging narrative |

---

## Taxonomy Assignment

### Categories (assign 1-2)

Pick from the most relevant. The full list is in Sanity, but common choices for nodes:

| Category | When to use |
|----------|------------|
| **Design Systems** | Component architecture, tokens, reuse patterns |
| **Engineering & DX** | Developer experience, tooling, build systems |
| **Ways of Working** | Process, governance, conventions |
| **Content Architecture** | Schema design, content modeling, GROQ |
| **AI Collaboration** | Human-AI pair work patterns |
| **Governance** | Rules, gates, checklists, quality enforcement |
| **Process Insight** | Workflow learnings, retrospectives |

### Tags (assign 3-6)

Use existing tags from Sanity. Check the taxonomy before creating new ones. Common tags for design system / architecture nodes:

`atomic design`, `design system`, `reusable`, `composable`, `design tokens`, `architecture`, `best practices`, `separation of concerns`, `system thinking`, `refactoring`, `tech debt`, `governance`, `content modeling`

**Gatekeeping rule:** Do not create a new tag if an existing one covers the concept. Check for synonyms (e.g., don't create `component reuse` if `reusable` exists).

### Tools (assign 1-3)

Reference the tools actually used or discussed in the node. Common tool assignments:

| Tool | When relevant |
|------|--------------|
| `sanity` | Schema design, GROQ, Studio UX |
| `react` | Component architecture, JSX, hooks |
| `css` | Tokens, layout, theming |
| `figma` | Design system, visual design references |
| `storybook` | Component development, visual testing |
| `claude-code` | AI-assisted development workflow |

---

## Citations

Use numbered bracket markers `[1]`, `[2]` in body text. List full citations in a **Notes** section at the bottom of the body content:

```
[1] Author, *Title* — URL
[2] Author, *Title* — URL
```

When the structured `citations[]` field is available (EPIC-0169), use `citationRef` marks in PortableText instead of plain-text brackets. The footnotes render automatically via `CitationNote` components.

**Preferred citation sources:** Primary sources (original methodology authors, official docs), peer-reviewed studies, recognized industry voices (Brad Frost, Nathan Curtis, Sparkbox, CSS-Tricks). Avoid SEO-farm blog posts.

---

## SEO Fields

| Field | Guidance |
|-------|----------|
| `seo.title` | Can differ from display title. Optimize for search: include key concept + "design system" or relevant qualifier. Under 60 chars. |
| `seo.description` | 150-160 chars. Summarize the problem and the solution. Include the key term. |
| `openGraph.title` | Can be shorter/punchier than seo.title. This shows in social shares. |
| `openGraph.description` | 1-2 sentences. What will make someone click this in a social feed? |

---

## Anti-Patterns

Things that are **not** the Sugartown node voice:

- **Listicles** — "7 Tips for Better Design Systems" is not a node. Nodes are narratives with a specific failure → fix → lesson arc.
- **Tutorial tone** — "First, open your terminal..." Nodes assume competence.
- **Marketing copy** — "Unlock the power of atomic design!" Nodes are honest, sometimes painfully so.
- **Emoji-heavy prose** — One emoji at most, typically in a closing status block. Never mid-paragraph.
- **Passive voice** — "The button was rendered incorrectly" → "I rendered the button incorrectly."
- **Hedging without commitment** — "It might be worth considering..." → "Do this. Here's why."

---

*docs/node-style-guide.md · Sugartown Digital · 2026-03-16*
