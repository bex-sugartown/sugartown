# Agentic Caucus — Risk Tiers

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** June 2026
**Related:** [[methodology]] (`docs/ai/agentic-caucus/methodology.md`), [[governance-coverage]] (`docs/ai/agentic-caucus/governance-coverage.md`)

---

## Purpose

This writes down the risk tiering that already operates implicitly across `CLAUDE.md`. Every
action an agent takes falls into one of four tiers, and each tier carries a gate and a named
authority for who executes the irreversible step. It closes the Risk Tiering (Layer 1) gap in
[[governance-coverage]].

The principle: autonomy scales inversely with reversibility. Mechanical, reversible work runs
without a gate. Outward-facing, irreversible work is human-executed. The tier is set by the
blast radius of the action, not by how hard the work is.

---

## The Tiers

### Tier A — Autonomous

Reversible, internal, low blast radius. The agent executes and commits; the human reviews
after the fact.

- **Actions:** formatting, lint fixes, internal refactors with passing tests, backlog and
  draft doc edits, query design notes.
- **Gate:** none before execution. Pre-commit validators (`validate:tokens`, lint) run on every
  commit regardless.
- **Authority:** agent executes. Human reviews asynchronously.

### Tier B — Gated execution

Ships to the codebase but stays inside the repo. Recoverable via Git.

- **Actions:** feature code, CSS, new components, schema changes, migration scripts.
- **Gate:** epic gates apply. Phase 0 mock gate before any visual JSX. Visual QA gate before
  close-out. CSS proposal table before a new class. Schema changes get their own commit and a
  `npx sanity schema deploy`.
- **Authority:** agent executes and commits. Merge to `main` runs through the epic close-out
  sequence. Pre-commit hooks are the enforcement floor.

### Tier C — Proposal required

Writes content or removes data. Derived from interpretation rather than literal instruction.

- **Actions:** any Sanity content write derived from a brief, copy, headings, body text, CTAs,
  removals (unset operations on arrays), AI-drafted prose.
- **Gate:** the Content Write Gate. Agent produces a before/after table and waits for explicit
  approval before the write. Verbatim user-dictated values are exempt; pure structural patches
  (taxonomy backfill, slug fixes) are exempt.
- **Authority:** agent proposes. Human approves in writing before the write executes.

### Tier D — Human only

Outward-facing or irreversible. The agent prepares but does not execute the final step.

- **Actions:** publishing or unpublishing content live, sending anything to an external service
  or audience, irreversible deletes, financial actions, external communications.
- **Gate:** the human-publishes rule. Drafts require a human to publish. The agent never runs
  the publish, the send, or the destructive command.
- **Authority:** human executes. The agent's role ends at the prepared draft or the proposed
  command.

---

## Tier Assignment Quick Reference

| Action | Tier |
|---|---|
| Lint fix, formatting, internal refactor | A |
| Backlog or draft doc edit | A |
| Feature code, CSS, new component | B |
| Schema change + deploy | B |
| Sanity content write from a brief | C |
| Removing bullets, sections, or cards | C |
| Publishing or unpublishing a document | D |
| Sending an email or external message | D |
| Irreversible delete, financial action | D |

When an action is ambiguous between two tiers, assign the higher tier. A wrong guess toward
caution costs a confirmation; a wrong guess toward autonomy costs a recovery.

---

## Changelog

### v1.0 — June 2026
Initial document. Four tiers (Autonomous, Gated execution, Proposal required, Human only)
mapped to existing `CLAUDE.md` gates and a quick-reference assignment table.
