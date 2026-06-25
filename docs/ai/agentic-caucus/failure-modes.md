# Agentic Caucus: Documented Failure Modes

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** June 2026
**Related:** `docs/ai/agentic-caucus/methodology.md`, `docs/ai/agentic-caucus/governance-coverage.md`

---

## Purpose

This document records confirmed failure modes for every AI tool in the Agentic Caucus.
A failure mode is confirmed when it has occurred in a real session and produced a real
consequence (wasted work, a broken build, a lost session, a misleading output).

Suspected failure modes are not listed here. Anecdotal failures that didn't cost anything
are not listed here. Only confirmed, consequential, reproducible patterns.

This document exists because planning for failure is cheaper than recovering from it.

---

## Failure Mode Registry

---

### Claude

#### FM-C-01: Context inflation
**Description:** In long sessions, Claude accumulates context weight and begins to prefer
confirming prior decisions over re-evaluating them. The longer the session, the more
likely it is to miss that a constraint has changed.

**Consequence:** Incorrect assumptions about the current state of the codebase. Stale
advice about which files exist or what a schema currently contains.

**Mitigation:** Start a new session for new epics. Use `/morning` to re-establish ground
truth from the actual repo state rather than session memory. The orient-before-acting
protocol in CLAUDE.md exists specifically because of this failure mode.

---

#### FM-C-02: Over-documentation under uncertainty
**Description:** When Claude does not have enough information to proceed, its default is
to generate documentation rather than ask a focused question. Early in the project this
produced dozens of markdown files with session resumption templates that were never used.

**Consequence:** Noise in the repo. False confidence that context has been preserved when
it hasn't. (The actual solution was Claude Projects.)

**Mitigation:** CLAUDE.md now instructs Claude Code to read, report findings, and confirm
a proposed approach before writing anything. One focused question is better than five
reference documents.

---

#### FM-C-03: Speculative fixes
**Description:** When given a bug report without a stack trace or console output, Claude
will produce a plausible fix based on pattern-matching rather than diagnosis. The fix
is sometimes correct. When it isn't, it adds a noise commit that can mask the real issue.

**Consequence:** A wrong fix commit that has to be squashed. Occasionally a harder-to-
debug state than the original.

**Mitigation:** CLAUDE.md rule: "When the user reports a bug, request the error first.
Do not commit a fix based on a guess."

---

#### FM-C-04: Worktree path confusion
**Description:** When running inside a git worktree, Claude Code can write files to the
main app tree rather than the worktree path if the working directory is not explicitly
confirmed at session start.

**Consequence:** Changes land in the wrong tree. The worktree and main tree diverge in
ways that are not immediately visible.

**Mitigation:** CLAUDE.md worktree section requires an explicit path confirmation before
the first file write in any worktree session.

---

#### FM-C-05: CSS fix cascade
**Description:** Claude will fix a CSS symptom without tracing the constraint chain,
producing a sequence of fix commits on the same surface. Each fix addresses a symptom
of the previous fix.

**Consequence:** Three commits doing one fix's worth of work. The root cause is not
addressed until the cascade becomes obvious.

**Mitigation:** CLAUDE.md rule: self-check after every CSS fix commit. Grep for the same
selector in the prior three commits. If the same surface appears, halt and write the
root-cause paragraph before the next fix.

---

### ChatGPT

#### FM-GPT-01: Parallel implementation
**Description:** When asked to add a feature to an existing system, ChatGPT will sometimes
build a parallel implementation rather than extend the existing one. The result is two
systems that both work in isolation and conflict in practice.

**Real instance:** Asked to add features to the Sugartown Pink theme without breaking
the existing theme. ChatGPT created an entirely separate theme file. The "backward
compatible" result was two incompatible themes.

**Consequence:** A CSS debugging session to reconcile two theme systems. One of the two
had to be deleted.

**Mitigation:** When handing a task to ChatGPT that involves extending existing code,
explicitly state the constraint: "extend this file, do not create a new one." Provide
the existing file content, not just the requirement.

---

#### FM-GPT-02: Velocity over correctness
**Description:** ChatGPT optimises for shipping. It will produce working code quickly
and defer edge case handling. In a codebase with enforced architectural boundaries
(ESLint, token constraints, BEM namespace rules), "working" and "correct" are not the
same thing.

**Consequence:** Code that passes a quick visual check but violates `apps/web` import
rules, uses hardcoded values instead of tokens, or introduces a CSS class outside the
`st-*` namespace.

**Mitigation:** Do not use ChatGPT for work that requires deep knowledge of Sugartown's
architectural constraints. Use it for fresh perspective on decisions, not for execution
in the monorepo.

---

### Gemini

#### FM-G-01: Context collapse mid-session
**Description:** Gemini's session context degrades over a long conversation. It will
re-propose things already decided, implemented, or explicitly rejected, with full
confidence.

**Real instance:** Gemini proposed a taxonomy architecture. Bex confirmed it and
implementation began. Four messages later, Gemini proposed the same architecture as
if it were new. When told "we built this yesterday," Gemini responded "Excellent idea,
here's how we'll do it."

**Consequence:** Time wasted re-explaining decisions already made. Risk of implementing
a variation that diverges from the original decision.

**Mitigation:** Keep Gemini sessions short and vision-focused. Do not use Gemini for
multi-session implementation work. Capture any decision from a Gemini session in a
written doc before the session ends.

---

#### FM-G-02: Scope expansion
**Description:** Gemini interprets requests broadly and proposes more than was asked for.
A request for a blog post became a full headless CMS architecture. This is sometimes
useful and frequently not.

**Consequence:** Scope creep from the first session. A lot of interesting ideas that
weren't the thing that needed to be built.

**Mitigation:** Frame Gemini prompts with explicit scope constraints. "I need X, not a
broader rethinking of the system" is a legitimate constraint to include in the prompt.

---

## Cross-Agent Failure Modes

#### FM-X-01: Undocumented handoffs
**Description:** When work moves from one agent to another without a handoff doc, the
second agent inherits none of the first agent's context. Decisions made in the first
session are invisible to the second.

**Consequence:** The second agent reverses decisions made by the first. Neither agent
knows this has happened.

**Mitigation:** Any time work moves between agents, write a handoff note: what was
decided, what was deferred, what constraints are in play. Even three bullet points
is enough. The epic format exists partly to solve this problem.

---

#### FM-X-02: Confidence without verification
**Description:** All three agents will state things confidently that are not true. This
is a property of language models, not a bug in any specific tool. The confidence of the
output is not correlated with its accuracy.

**Consequence:** Incorrect schema field names, non-existent CSS classes, wrong file
paths, fabricated API behaviours.

**Mitigation:** The orient-before-acting protocol. Read the actual files. Confirm against
the actual codebase. Do not trust an agent's memory of what a file contains without
reading it.

---

## Changelog

### v1.0 — June 2026
Initial document. Failure modes extracted from CLAUDE.md, session post-mortems, and
the Knowledge Graph gem in `content_store.py`. FM-C-01 through FM-C-05, FM-GPT-01
through FM-GPT-02, FM-G-01 through FM-G-02, and FM-X-01 through FM-X-02 confirmed
and recorded.
