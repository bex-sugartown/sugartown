---
**Epic:** AOP-3 — Rule delivery carrier
**Linear Issue:** ⚠️ **NONE — PLACEHOLDER.** Linear issue budget exhausted 2026-08-09. This doc is the container until an ID exists. **Before execution:** file the Linear issue, rename this file to `SUG-{N}-rule-delivery-carrier.md` (`git mv`), and replace this line.
**Source PRD:** `docs/briefs/agent-operability-prd.md` v1.0 §7 — covers **V1** and **V2**
**Status:** Backlog
**Priority:** 🔴 Now — third of the PRD's recommended three, and the whole register track is blocked on it
**Merge strategy:** (a) Merge-as-you-go
**Depends on:** B1, resolved (PRD §10)
**Blocks:** AOP-5 (V4 cannot de-duplicate into a carrier that does not exist)
---

# AOP-3 — Rule delivery carrier

V1 builds the carrier; V2 is its first real consumer and the thing that proves it works.
Shipping V1 alone proves nothing — a delivery mechanism with no rule delivered through it is
untested infrastructure.

## Context

From PRD §3:

- **C1** — the instruction surface is at **99% of its cap**, and the fix for the register problem needs **5,419 words that do not exist**
- **C2** — the best technical-register guide loads in neither compartment
- **C3** — `CLAUDE.md` routes commit messages and doc prose to the *editorial* guide, with no competing route
- **C9** — chat and Claude Code read disjoint instruction sets; each register is deployed to the compartment it was not written for

C1 is why this is size **L** and why everything else in the register track waits on it.

## Objective

A rule can load when it is needed without permanently consuming the instruction budget, and
`technical-doc-style-guide.md` is the first rule delivered that way.

## Scope

**V1 — rule delivery mechanism**

- [ ] Implement B1's resolution: raise the cap (or suspend `validate:doc-budget`) **until CI-green is proven** — note SUG-281 already sets the cap to 26,000 enforcing, so confirm the two decisions agree before building, and reconcile in the PRD if not
- [ ] Choose and build the carrier from B1's candidates: MCP-on-demand (`sugartown_get_rule`), `.claude/rules/` path-scoped, or skills. Record why the others lost
- [ ] Prove a rule loads through the carrier **without** appearing in the session-loaded surface — measured by `validate:doc-budget`'s word count before and after

**V2 — route the technical register**

- [ ] Deliver `docs/conventions/technical-doc-style-guide.md` to Claude Code through the V1 carrier
- [ ] Rescope the CLAUDE.md Anti-Slop routing line (audit D1) so commit messages and doc prose route **technically**, not editorially — this is C3, and it is a `CLAUDE.md:499` edit
- [ ] Confirm the rescoped routing does not contradict B3/B3a's surface map (PRD §B3)

## Scope-to-phase mapping

Six Scope items, above the 5-item sizing gate.

| Phase | Scope items | Ships when |
|---|---|---|
| **Phase 1 — V1 carrier** | items 1–3 | A rule loads on demand; the word count drops measurably |
| **Phase 2 — V2 first consumer** | items 4–6 | The technical guide reaches Claude Code; CLAUDE.md routes technically |

## Non-Goals

- De-duplicating the 49-file restatement. That is AOP-5 (V4), and it needs this carrier plus AOP-4's census.
- Building the chat-side half. That is AOP-4 (V6).
- Rewriting the brand voice itself (PRD §6).
- Adding any new validator (PRD §6, until C7 clears — SUG-281's job).

## Technical constraints

- **Verification review is blocking.** V1 changes how rules reach a session, which is the substrate every other gate stands on. `verification-reviewer` runs before implementation; control-register rows for the carrier and for the budget change.
- **Instruction & Rule File Write Gate applies.** `CLAUDE.md:499`, `docs/conventions/**`, `.claude/rules/**` and `.claude/skills/**` are all in scope.
- **A rule that loads on demand must be *reachable*, not merely *stored*.** The acceptance test is a session actually retrieving it, not the file existing at a path. C2 is precisely the failure of a good guide sitting where nothing loads it.
- **B1 vs SUG-281 conflict is live and must be resolved before Phase 1 starts.** B1 says raise-or-suspend; PRD §B1's caveat and SUG-281 both say raise to 26,000 and keep enforcing. They are compatible only if "raise" is chosen over "suspend". Confirm, and record the resolution in the PRD rather than in this doc.

## Files to modify

- `packages/mcp-server/` or `.claude/rules/` or `.claude/skills/` — depending on the carrier chosen
- `CLAUDE.md` — the Anti-Slop routing line (`:499`)
- `docs/conventions/technical-doc-style-guide.md` — delivered, possibly relocated
- `scripts/validate-doc-budget.js` — cap
- `docs/ai/agentic-caucus/control-register.md`

## Acceptance criteria

- [ ] The instruction surface has **more than 1,000 words of headroom** (PRD §8 criterion 7)
- [ ] A Claude Code session can reach `technical-doc-style-guide.md` — demonstrated by retrieving it in a session, not by pointing at the file
- [ ] Commit messages and doc prose route to the technical register; `CLAUDE.md:499` no longer sends them editorially
- [ ] The routing change agrees with B3/B3a's surface map
- [ ] `pnpm validate:doc-budget` passes, enforcing, at the agreed cap

## Risks

- **Size L, and the highest-leverage change in the PRD.** Everything in AOP-5 waits on it. If it slips, AOP-4 (independent) should proceed in parallel rather than idle.
- **A carrier that is technically live but never actually consulted** would reproduce C2 one layer up. The acceptance test is retrieval in a real session, precisely to catch that.
- Choosing MCP-on-demand couples rule delivery to the MCP server running. Record that trade-off if that carrier wins.

## Post-Epic Close-Out

- [ ] Friction line
- [ ] Incident log: C1/C2/C3 are shipped-state defects; an entry is expected
