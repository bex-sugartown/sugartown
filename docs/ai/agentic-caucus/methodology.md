# Agentic Caucus — Methodology

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** June 2026
**Next review:** December 2026
**Public page:** sugartown.io/ai-ethics (adjacent doc)

---

## What This Is

The Agentic Caucus is a governed multi-agent AI collaboration framework. It deploys different AI
tools based on documented strengths and failure modes, with a PM (Bex) holding final authority
over every architectural decision.

It is not a product. It is not a brand. It is a methodology: systematic AI collaboration with
documented failure modes, strategic tool selection, and a human who holds the vision while agents
propose, iterate, and occasionally contradict each other.

The name is deliberate. A caucus implies structured deliberation, not chaos. Agents propose.
Bex decides.

---

## Why It Exists

It emerged from building the Sugartown Knowledge Graph in late 2025. Three agents each played
a distinct role. The only thing keeping the work coherent was a consistent human decision-maker
and the discipline to document what each tool was good at and what it got wrong.

The lesson: multi-agent collaboration is not additive by default. Without governance, you get
three tools confidently proposing contradictory things and no clear record of what was decided
or why. With governance, you get specialisation, coverage, and an audit trail.

---

## Core Principles

**1. PM holds the vision.** Agents propose. Bex decides. The Caucus does not run itself. Every
architectural conflict is adjudicated by a human. This is not a limitation of the methodology,
it is the methodology.

**2. Document failure modes, not just strengths.** Every tool in the Caucus has a documented
failure mode. Knowing when a tool fails is as important as knowing when it excels. Failure modes
are first-class citizens in this framework.

**3. Source control is the backstop.** When an agent creates a parallel implementation or
proposes a breaking change, Git is how you recover. The repo is the ground truth, not any
agent's memory of what was decided.

**4. Context degrades. Documentation bridges sessions.** Agents have no memory across sessions
by default. Comprehensive docs, CLAUDE.md, and the epic format exist specifically to re-establish
context without a meeting.

**5. Autonomy is not the goal. Reliability is.** The Caucus is not trying to run without human
input. It is trying to produce consistent, auditable, recoverable outputs at speed. Reliability
over autonomy, every time.

---

## The Agents and Their Roles

### Claude — The Architect

**Primary use:** Architecture, documentation, governance, systematic rebuilds, planning-layer
work. Runs as Claude Code (terminal/desktop) for monorepo execution and as claude.ai for
planning, writing, and strategy.

**Strengths:** Clean rebuilds from first principles. Systematic versioning. Comprehensive
documentation. The release governance model, epic format, and CLAUDE.md operating contract
all emerged from Claude sessions.

**Failure modes:**
- Over-documents. Will generate exhaustive reference material when a short answer would do.
- Session-stateless without Claude Projects setup. Early sessions required manual context
  re-upload every time; this is solved now via Projects and CLAUDE.md.
- Can be over-cautious in execution, preferring to confirm rather than proceed. The orient-before-
  acting protocol in CLAUDE.md formalises this as a feature rather than a friction.

**Current deployment:** Primary tool for all monorepo work (Claude Code), all planning and
writing sessions (claude.ai), and all skill/prompt authoring.

---

### ChatGPT — The Integrator

**Primary use:** Fresh architectural perspective, execution speed, integration work where a
second opinion on approach is valuable.

**Strengths:** Sees a problem without the context weight of an existing long session. Tends
toward "here is what ships today" rather than "here is the ideal architecture." Useful when
a Claude session has accumulated too much context debt and a clean read is needed.

**Failure modes:**
- Too willing to move forward. Will build parallel implementations rather than refactor existing
  ones. Once created an entire duplicate theme attempting to add features without breaking the
  original. The result was two incompatible themes and a CSS debugging session.
- Lesson: Integration requires discipline, not just velocity. Use ChatGPT for fresh perspective,
  not for ongoing ownership of a codebase surface.

**Current deployment:** Secondary. Used for second opinions on architecture decisions and for
tasks where Claude has hit a context ceiling.

---

### Gemini — The Strategist

**Primary use:** Conceptual foundation work, vision-level thinking, market/competitive research,
Google Workspace integration tasks (email triage etc.).

**Strengths:** Strong opinions. Proposed the entire conceptual foundation of the Knowledge Graph:
structured content over blog posts, topology over chronology, Python as source of truth. Useful
for "what should this be" questions before "how do we build it" questions.

**Failure modes:**
- Context degrades mid-session. Will confidently re-propose things already implemented.
- Typical pattern: "We should build X." You: "We built X yesterday." Gemini: "Excellent idea,
  here's how we'll do it." This is not a joke, it is a documented failure mode.
- Native Google Workspace integration creates a temptation to use it for everything. Resist.

**Current deployment:** Used for strategic/vision work at the start of new problem spaces
and for Google Workspace tasks where native integration is genuinely useful.

---

## Tool Selection Heuristic

Before starting a task, answer these questions:

| Question | Implication |
|---|---|
| Does this require deep monorepo context? | Claude Code |
| Is this a planning, writing, or strategy task? | claude.ai |
| Do I need a fresh read on an existing architecture decision? | ChatGPT |
| Am I defining what something should be, not how to build it? | Gemini or claude.ai |
| Does this involve Google Workspace data directly? | Gemini |
| Is this a new problem space where vision matters more than execution? | Start with Gemini or claude.ai, hand off to Claude Code |

The default is Claude. Escalate to a second agent only when there is a documented reason.
"I feel like trying ChatGPT on this" is not a documented reason.

---

## Governance Mechanisms

### CLAUDE.md
The operating contract for every Claude Code session. Loaded automatically at session start.
Contains: architectural rules, naming conventions, deprecated fields, migration script defaults,
anti-patterns, and process rules. The single source of truth for how Claude Code behaves on
this codebase.

### Epic format
Structured Markdown execution briefs for Claude Code. Contain: pre-execution gates,
file modification tables, confirmation gates, rollback plans, and Definition of Done checklists.
Agents execute epics. Humans approve gates.

### Release pipeline
Seven-gate workflow with explicit human STOP blocks. Nothing writes to disk until Bex approves.
The pipeline is a workflow, not an agent: every decision point is pre-mapped.

### Node schema
The `node` Sanity document type exists specifically to document Agentic Caucus sessions:
AI tool used, conversation type, challenge, insight, action item, status lifecycle
(Explored → Validated → Implemented → Evergreen). The system documents itself.

### Skills
Two skill systems run in parallel. Claude Code skills live in `.claude/skills/` in the repo,
invokable via `/skill-name` in any Claude Code session. claude.ai project skills live in
claude.ai project knowledge (not on disk); they tell claude.ai how to behave for specific
writing and planning tasks. Full inventory: `docs/ai/skills-index.md`.

### Risk tiers and agent cards
Every agent action falls into one of four risk tiers (Autonomous, Gated execution, Proposal
required, Human only), each mapped to a gate and a named authority: `docs/ai/agentic-caucus/risk-tiers.md`.
Each agent has a registry card recording its model, strengths, and failure modes:
`docs/ai/agentic-caucus/agent-cards.md`.

---

## What This Is Not

- A fully autonomous system. There is always a human in the loop.
- A prompt collection. The methodology governs when and how tools are used, not just what
  to say to them.
- A claim that AI is replacing PM work. The agents build. The PM decides what to build,
  reviews what was built, and owns the outcomes.
- Finished. The failure modes above are real and current. This document will be updated
  as new failure modes are discovered and as tooling changes.

---

## Changelog

### v1.0 — June 2026
Initial formal document. Extracted from Knowledge Graph gem in `content_store.py` and
expanded with current tool deployment state, governance mechanisms, and tool selection
heuristic.
