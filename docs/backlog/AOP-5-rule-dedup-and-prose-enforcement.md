---
**Epic:** AOP-5 — Rule de-duplication and prose enforcement
**Linear Issue:** ⚠️ **NONE — PLACEHOLDER.** Linear issue budget exhausted 2026-08-09. This doc is the container until an ID exists. **Before execution:** file the Linear issue, rename this file to `SUG-{N}-rule-dedup-and-prose-enforcement.md` (`git mv`), and replace this line.
**Source PRD:** `docs/briefs/agent-operability-prd.md` v1.0 §7 — covers **V4** and **V5**
**Status:** Backlog
**Priority:** 🟢 Next — last in sequence, blocked on two tranches
**Merge strategy:** (a) Merge-as-you-go — V4 merges before V5's hook is pointed at it
**Depends on:** **AOP-3** (V1's carrier — there is nowhere to collapse *into* without it) and **AOP-4** (V3's census — there is no way to know what to collapse without it). Also B4, resolved
**Blocks:** —
---

# AOP-5 — Rule de-duplication and prose enforcement

V4 collapses the restatement; V5 stops it coming back. Pairing them is the point: PRD §8's
last success criterion is that the plan states **how drift is detected next time, not only
corrected**. V4 alone is a correction with no detector, and the PRD's own diagnosis is that
rules decay about a week after they are written.

## Context

From PRD §3:

- **C8** — register rules are restated across **49 files** (ORIENT §2.3 corrected the source audit's "nine" — trust 49)
- The system has **zero prose checks today**, so nothing has ever detected the restatement drifting

## Objective

Every register rule has exactly one canonical location, everything else links to it, and a
hook detects the next restatement rather than waiting for an audit to find it.

## Scope

**V4 — rule de-duplication**

- [ ] Collapse the 49-file restatement to **one canonical location per rule**; every other mention becomes a link
- [ ] **Write down B3 and B3a's surface map** — this is the epic the PRD names as the one that records the em-dash decision. It carries a live contradiction until it does: `CLAUDE.md:499` still bans alt text and meta descriptions, and B3a allows them
- [ ] Rescope `CLAUDE.md:499`'s Anti-Slop scope sentence to match the B3/B3a map
- [ ] Verify the collapse against AOP-4's census: one canonical location per rule, per surface

**V5 — prose enforcement hook**

- [ ] Path-scoped anti-slop pre-commit check, **warn-only first** per B4
- [ ] Scope the hook's paths from AOP-4's register map, so an editorial rule never fires on a technical surface — the exact failure the whole PRD exists to fix
- [ ] Dated re-arm for the warn→block transition, consistent with AOP-1's re-arm mechanism

## Scope-to-phase mapping

Seven Scope items, above the 5-item sizing gate.

| Phase | Scope items | Ships when |
|---|---|---|
| **Phase 1 — V4 collapse** | items 1–4 | Every rule has one canonical location; the em-dash map is written down and the contradiction closes |
| **Phase 2 — V5 detector** | items 5–7 | The hook fires warn-only on a deliberately bad file, and stays silent on a technical one |

## Non-Goals

- Rewriting published FE content (PRD §6). The collapse changes where rules live, not what content says.
- Changing any rule's substance. De-duplication preserves meaning; a rule that needs changing is its own epic.
- Blocking on the hook. V5 ships warn-only; the block transition is a later, dated decision.

## Technical constraints

- **Verification review is blocking** — V5 adds a gate. `verification-reviewer` runs before implementation, and the hook gets a control-register row naming its probe, its reader and its next-read date.
- **Instruction & Rule File Write Gate applies at maximum surface.** This tranche edits the canonical location of essentially every rule, including `CLAUDE.md`, `docs/conventions/**`, `.claude/skills/**` and `docs/ai/agentic-caucus/**`. Scratchpad-copy-then-diff is not optional here; it is the only safe way to review a diff this wide.
- **The new validator freeze from AOP-1 applies to V5.** PRD §6 forbids adding a validator until C7 clears, and AOP-1 sets the N-green-runs condition. **Confirm N has been met before building the hook.** If it has not, Phase 1 still ships; Phase 2 waits.
- **A link is only a de-duplication if it resolves.** After collapsing, every link must be checked to resolve — a broken link to a canonical rule is strictly worse than the restatement it replaced, because the rule then reaches nobody.

## Files to modify

- Up to 49 files carrying restated rules — enumerate from AOP-4's census, do not infer the set
- `CLAUDE.md` — `:499` scope sentence, plus rules collapsed to links
- `docs/conventions/**`, `docs/brand/**`, `.claude/skills/**`
- Pre-commit hook config, `scripts/` — the V5 check
- `docs/ai/agentic-caucus/control-register.md`

## Acceptance criteria

- [ ] Every register rule has **exactly one** canonical location (PRD §8 criterion 5) — measured by grep count per rule, run and recorded, not asserted
- [ ] Rules that must hold are **enforced by hooks, not stated as instruction** (PRD §8 criterion 8)
- [ ] The plan states how drift is **detected** next time (PRD §8 criterion 9)
- [ ] The hook fires on a deliberately bad file and stays silent on a technical surface — both proven by running it
- [ ] `CLAUDE.md:499` agrees with B3 + B3a; the alt-text contradiction is closed
- [ ] Every link introduced by the collapse resolves

## Risks

- **The widest diff in the whole PRD**, across up to 49 files, against the instruction surface itself. Phase it, and enumerate the file set from the census rather than from a grep run once and trusted.
- **A mechanical-transform scope with an unverified per-item classification is an incomplete-epic hard stop** (CLAUDE.md). Before Phase 1 writes anything, classify all 49 files individually — SUG-224's "44 mirrors" was really 26 mirrors, 6 adapters, 6 diverged and 6 with no counterpart.
- **Blocked on two tranches.** If either AOP-3 or AOP-4 slips, this slips. It is the correct place to absorb slack, being last.

## Post-Epic Close-Out

- [ ] Friction line
- [ ] Incident log: C8 is a shipped-state defect and this tranche closes a live published-rule contradiction, so an entry is expected
