# Agentic Caucus — Agent Cards

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** June 2026
**Related:** [[methodology]] (`docs/ai/agentic-caucus/methodology.md`), [[failure-modes]] (`docs/ai/agentic-caucus/failure-modes.md`), [[governance-coverage]] (`docs/ai/agentic-caucus/governance-coverage.md`)

---

## Purpose

A registry entry for each agent in the Caucus. This is the lightweight equivalent of a
model card: what the agent is, which model backs it, what it is good at, where it fails, and
the rule for when to reach for it. It closes the Model Registry (Layer 1) and Model Cards
(Layer 4) gaps named in [[governance-coverage]].

Version pinning note: Claude model IDs are exact because the repo controls them. ChatGPT and
Gemini run as the latest model their consumer product serves; those are not pinned and the
"Model" field records the product surface, not a frozen version.

---

## Card — Claude · The Architect

| Field | Value |
|---|---|
| **Role** | Architecture, documentation, governance, systematic rebuilds, execution. |
| **Model** | Claude Sonnet 4.6 (`claude-sonnet-4-6`) default; Opus 4.8 (`claude-opus-4-8`) for heavy reasoning. |
| **Surface** | Claude Code (terminal, monorepo execution) and claude.ai (planning, writing, strategy). |
| **Strengths** | Clean rebuilds from first principles, systematic versioning, comprehensive documentation, governance design. |
| **Known failure modes** | FM-C-01 context inflation, FM-C-02 over-documentation under uncertainty, FM-C-03 speculative fixes, FM-C-04 worktree path confusion, FM-C-05 CSS fix cascade. See [[failure-modes]]. |
| **When to use** | The default. All monorepo work, all planning and writing, all skill and prompt authoring. |
| **When not to use** | When a session has accumulated context debt and needs a clean read; hand to ChatGPT for a fresh perspective. |

---

## Card — ChatGPT · The Integrator

| Field | Value |
|---|---|
| **Role** | Fresh architectural perspective, execution speed, second opinion on approach. |
| **Model** | Latest model served in ChatGPT. Not pinned. |
| **Surface** | chatgpt.com. Not wired into the monorepo. |
| **Strengths** | Sees a problem without the context weight of a long session. Biases toward "what ships today." |
| **Known failure modes** | FM-GPT-01 parallel implementation (builds a duplicate rather than extending), FM-GPT-02 velocity over correctness. See [[failure-modes]]. |
| **When to use** | A second opinion on an architecture decision; a clean read when Claude has hit a context ceiling. |
| **When not to use** | Ongoing ownership of a codebase surface. Work requiring deep knowledge of Sugartown's architectural constraints. |

---

## Card — Gemini · The Strategist

| Field | Value |
|---|---|
| **Role** | Conceptual foundation, vision-level thinking, market and competitive research, Google Workspace tasks. |
| **Model** | Latest model served in the Gemini app. Not pinned. |
| **Surface** | gemini.google.com. Native Google Workspace integration. |
| **Strengths** | Strong opinions early in a problem space. Good at "what should this be" before "how do we build it." |
| **Known failure modes** | FM-G-01 context collapse mid-session (re-proposes decided work), FM-G-02 scope expansion. See [[failure-modes]]. |
| **When to use** | The start of a new problem space where vision matters more than execution; Google Workspace data tasks. |
| **When not to use** | Multi-session implementation work. Any task where context must persist across a long conversation. |

---

## Maintenance

When an agent's backing model changes tier or a new failure mode is confirmed, update the
card in the same commit. When a new agent joins the Caucus, add a card here and a row to the
coverage tally in [[governance-coverage]].

---

## Changelog

### v1.0 — June 2026
Initial registry. Cards for Claude, ChatGPT, and Gemini with model, surface, strengths,
failure-mode cross-references, and use rules.
