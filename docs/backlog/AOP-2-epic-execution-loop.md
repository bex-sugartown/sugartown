---
**Epic:** AOP-2 — Epic execution loop
**Linear Issue:** ⚠️ **NONE — PLACEHOLDER.** Linear issue budget exhausted 2026-08-09. This doc is the container until an ID exists. **Before execution:** file the Linear issue, rename this file to `SUG-{N}-epic-execution-loop.md` (`git mv`), and replace this line.
**Source PRD:** `docs/briefs/agent-operability-prd.md` v1.0 §7 — covers **W1**, **W3**, **W5**
**Status:** Backlog
**Priority:** 🔴 Now — W1 is second of the PRD's recommended three
**Merge strategy:** (a) Merge-as-you-go — W1 must be live and proven before the close-out runner is built on it
**Depends on:** AOP-1 (the runner must know the tier model to know what to stop for)
**Blocks:** —
---

# AOP-2 — Epic execution loop

One epic, because these three are the same loop: **start it (W5), run it to the next gate
(W1), finish it (W3)**. W3 depends on W1 in the PRD's own sequencing. Building the close-out
runner before phases auto-advance means building a runner nothing can reach without manual
driving.

## Context

From PRD §3:

- **C4** — phases are specified but not executable; the workflow stalls between them (measured, post-mortem G1/G2)
- **C6** — close-out spans two skills with an unowned seam (observed, G4)

The lived symptom, from the post-mortem: executing SUG-260 and SUG-268 was slow and
click-heavy, and phases stalled with no prompt to continue.

## Objective

An epic with defined phases executes to the next human gate without being driven turn by
turn, and closes out through one owner rather than a seam between two skills.

## Why AOP-1 first

W3's runner executes close-out steps 1b–9, several of which *are* gates. If it is built
before AOP-1 assigns tiers, it will hardcode today's undifferentiated ceremony and need
rewriting the moment tiers land. The dependency is real, not hygiene.

## Scope

**W1 — phase auto-advance**

- [ ] Define what "the next declared gate" means precisely enough to be executable — a phase boundary is not a gate, a Tier 1 gate is
- [ ] Update `CLAUDE.md` §Session discipline so a phase completing advances to the next without a prompt
- [ ] Update `docs/epic-template.md` so phases declare their terminating gate

**W3 — close-out runner**

- [ ] `/close-out` skill executing close-out steps 1b–9
- [ ] Each step reports **done, or N/A with the reason** — never silently skipped (this is the existing close-out rule; the runner enforces it mechanically rather than by discipline)
- [ ] Remove the `/eod` seam: one owner for close-out, with `/eod` calling it or deferring to it — decide which and record why

**W5 — paused-epic resume**

- [ ] `/morning` names In Progress epics with open phases and offers to resume

## Scope-to-phase mapping

Seven Scope items, above the 5-item sizing gate.

| Phase | Scope items | Ships when |
|---|---|---|
| **Phase 1 — W1 auto-advance** | items 1–3 | A multi-phase epic runs to its next Tier 1 gate with no intervening prompt |
| **Phase 2 — W3 close-out runner** | items 4–6 | `/close-out` runs 1b–9 end to end, N/A rows carry reasons |
| **Phase 3 — W5 resume** | item 7 | `/morning` offers to resume a paused epic |

## Non-Goals

- Changing which actions are gates. That is AOP-1's decision; this tranche consumes it.
- Removing human gates. Auto-advance runs *to* a gate, never *through* one.
- Any register or voice work — that is AOP-3 through AOP-5.

## Technical constraints

- **Instruction & Rule File Write Gate applies.** `CLAUDE.md`, `docs/epic-template.md`, and `.claude/skills/**` are all in scope. Scratchpad copy, diff, approve, then write.
- **Auto-advance must not be able to cross a Tier 1 gate.** Build the stop condition first and prove it stops, before building the advance. A runner that can skip a content-write or publish gate is worse than the manual driving it replaces.
- `/morning` already reads Linear In Progress state (verified 2026-08-09); W5 extends that read rather than adding a second Linear client.

## Files to modify

- `CLAUDE.md` §Session discipline
- `docs/epic-template.md` — phase declares terminating gate
- `.claude/skills/close-out/` — new
- `.claude/skills/eod/`, `docs/workflows/morning-housekeeping-prompt.md`

## Acceptance criteria

- [ ] A real epic with N phases runs to its next declared gate **without N prompts** — demonstrated on an actual epic, not a contrived one (PRD §8 criterion 1)
- [ ] Auto-advance **stops** at a deliberately placed Tier 1 gate — proven by running it, not by reading the code
- [ ] `/close-out` produces a close-out record where every step of 1b–9 is done or N/A-with-reason
- [ ] Decision prompts per session drop below one per human message (PRD §8 criterion 2)
- [ ] `/morning` names a paused epic and offers resumption

## Risks

- **Auto-advance running past a gate** is the serious failure mode. Mitigated by building and proving the stop condition first.
- **The close-out runner reporting N/A generously** to get to green. Mitigate: N/A requires a reason string, and an empty or generic reason fails the step.
- W5 is small and independent; if Phases 1–2 overrun, it can split out without stranding anything.

## Post-Epic Close-Out

- [ ] Friction line
- [ ] Incident log: C4/C6 are shipped-behaviour defects, so an entry is expected
