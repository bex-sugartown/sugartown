# AI Tooling — Index

**Last updated:** June 2026
**Owner:** Bex Head

---

## What This Directory Is

`docs/ai/` is the inventory for all AI tooling at Sugartown. It does not contain the
tools themselves. It documents what exists, where it lives, how it is governed, and
what has been learned from using it.

The goal: any session (human or AI) that needs to understand the AI layer of this
project starts here.

---

## Directory Structure

```
docs/ai/
├── README.md                         # this file
├── agentic-caucus/
│   ├── methodology.md                # the framework: what it is, how it works, core principles
│   ├── failure-modes.md              # documented failure modes per tool, cross-agent patterns
│   ├── agent-cards.md                # per-agent registry: model, strengths, failure modes, use rules
│   ├── risk-tiers.md                 # action risk tiers (A–D) mapped to CLAUDE.md gates
│   ├── incident-log.md               # append-only registry of confirmed dated incidents
│   └── data-handling.md              # what the site collects, processors, build-only AI boundary
└── skills-index.md                   # inventory of Claude Code skills + claude.ai skills
```

---

## Quick Reference

### System prompt
`CLAUDE.md` at the repo root is the operating contract for every Claude Code session.
It loads automatically. It is the single source of truth for how Claude Code behaves
on this codebase. If CLAUDE.md and anything else conflict, CLAUDE.md wins.

### Workflow prompts (Claude Code)
Paste into Claude Code at session start:

| What | File |
|---|---|
| Morning housekeeping | `docs/workflows/morning-housekeeping-prompt.md` |
| Ship (push, deploy, verify) | `docs/ship-prompt.md` |
| Release pipeline | `docs/workflows/release-assistant-prompt.md` |

### Skills (Claude Code + claude.ai)
Two systems. Full inventory: `docs/ai/skills-index.md`.

Frequently used:
- `/new-epic` — create a GitHub issue + backlog stub
- `/new-tool` — file a validator, gate, hook or script; issue only, no backlog doc
- `/write-blog` — draft an article as a Sanity draft
- `/write-node` — draft a Knowledge Graph node as a Sanity draft
- `/glossy` — add a glossary term to sugartown.io
- `/morning` — morning housekeeping (git health, branch map, Linear status)

### Agentic Caucus
The multi-agent collaboration framework. Full doc: `docs/ai/agentic-caucus/methodology.md`.
Documented failure modes: `docs/ai/agentic-caucus/failure-modes.md`.

**One-line version:** Gemini for vision. ChatGPT for fresh perspective. Claude for
architecture, execution, and governance. Bex decides everything.

---

## What Is Not Here

- The skills themselves (Claude Code skills in `.claude/skills/`; claude.ai skills in project knowledge)
- The epic archive (`docs/backlog/` for active, `docs/shipped/` for shipped)
- The release notes archive (in `docs/release-notes/`)
- The brand and voice docs (in `docs/brand/`)
- The AI ethics public doc (published at `sugartown.io/ai-ethics`, source in `docs/briefs/`)

---

## Maintenance

This directory should be updated when:
- A Claude Code skill or command is added or removed (run `pnpm docs:skills-index`; the table is generated); a deprecation is a hand-written row in its Deprecated table
- A new failure mode is confirmed (update `failure-modes.md`)
- A workflow prompt is significantly revised (update the version note in `skills-index.md`'s Workflow Prompts table, which is hand-maintained)
- The Agentic Caucus methodology changes materially (update `methodology.md`)

There is no automated sync between this directory and claude.ai. The skills index is the
manual bridge. Keep it current.
