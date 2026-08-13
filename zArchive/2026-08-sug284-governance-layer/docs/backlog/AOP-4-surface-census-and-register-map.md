---
**Epic:** AOP-4 — Surface census and register map
**Linear Issue:** ⚠️ **NONE — PLACEHOLDER.** Linear issue budget exhausted 2026-08-09. This doc is the container until an ID exists. **Before execution:** file the Linear issue, rename this file to `SUG-{N}-surface-census-and-register-map.md` (`git mv`), and replace this line.
**Source PRD:** `docs/briefs/agent-operability-prd.md` v1.0 §7 — covers **V3**, **V6**, **V7**
**Status:** Backlog
**Priority:** 🟢 Next — independent of AOP-3, so it can run in parallel
**Merge strategy:** (a) Merge-as-you-go
**Depends on:** B2, resolved (PRD §10). **Not** blocked on AOP-3
**Blocks:** AOP-5 (V4 de-duplicates against this census; V5 scopes its hook by it)
---

# AOP-4 — Surface census and register map

One epic because all three answer **"which register governs this surface, and can the
compartment that writes it actually reach that register?"** V3 builds the map, V7 fills the
holes it exposes, V6 delivers it to the compartment currently reading nothing.

Independent of AOP-3 by design: the census is a documentation exercise, not a delivery one.
Running the two tranches in parallel is the intended shape, and it is what stops AOP-5 being
blocked twice in series.

## Context

From PRD §3:

- **C9** — chat and Claude Code read disjoint instruction sets; each register is deployed to the compartment it was not written for
- **C11** — a published FE surface violates the editorial rule it is governed by
- **C12** — registers exist that no guide documents (glossary, chat execution)

## Objective

Every writing surface maps to exactly one register, and every register reaches the
compartment that writes in it.

## Scope

**V3 — surface census and register map**

- [ ] Enumerate every writing surface in the system (audit §6.6): FE content types, technical docs, conventions, epics, PRDs, commit messages, PR descriptions, alt text, meta descriptions, chat, code comments, JSDoc
- [ ] Map each to **exactly one** register. A surface mapping to two registers is a defect to resolve, not a row to record
- [ ] Carry B3 and B3a's surface map through verbatim — the em-dash column is already decided for six surface classes plus the two resolved on 2026-08-09; do not re-derive it

**V7 — undocumented registers and violations**

- [ ] Add the **glossary** and **chat execution** registers to the tone spectrum (audit D10) — C12
- [ ] Fix `ai-ethics-and-operations.md` (audit D12) — C11, a published FE surface violating its own governing rule
- [ ] Resolve the PK duplicate node guide (audit D9) — **requires Bex personally**, not reachable from Claude Code

**V6 — chat-side delivery**

- [ ] Upload the technical guides to claude.ai project knowledge (audit D7) — **requires Bex personally**
- [ ] Rescope the memory register entry (audit D8) — **requires Bex personally**
- [ ] Record the manual sync as accepted cost per B6, with a stated re-sync trigger

## Scope-to-phase mapping

Nine Scope items, above the 5-item sizing gate.

| Phase | Scope items | Ships when |
|---|---|---|
| **Phase 1 — V3 census** | items 1–3 | Every surface has exactly one register; the map is committed |
| **Phase 2 — V7 holes and violations** | items 4–6 | Glossary and chat registers documented; the FE violation fixed |
| **Phase 3 — V6 chat delivery** | items 7–9 | Both compartments reach their register |

## Non-Goals

- Collapsing the 49-file restatement. The census is the *prerequisite* for that; the collapse is AOP-5.
- Rewriting published FE content beyond the single `ai-ethics-and-operations.md` violation (PRD §6).
- Changing the brand voice itself.
- Splitting the claude.ai project — rejected in the source audit, still rejected.

## Technical constraints

- **Three Scope items require Bex personally** (V7 item 6, V6 items 7–8). claude.ai memory and project knowledge are not reachable from Claude Code (PRD §5). **Phase 3 cannot be agent-completed** — plan it as a prepare-then-hand-off phase: the agent produces the exact upload payload and the exact memory-entry text, Bex performs the upload. Do not mark Phase 3 done on the agent's half alone.
- **Instruction & Rule File Write Gate applies** to the tone spectrum, `docs/conventions/**` and `docs/ai/agentic-caucus/**`.
- **The census is a claim about the system**, so every row names the file that makes it true. A surface listed with no governing file is a hole, and holes are V7's Scope, not decoration.
- `ai-ethics-and-operations.md` is reader-facing, so its fix is a **content change** and passes the Content Write Gate before any patch.

## Files to modify

- `docs/brand/` — tone spectrum, glossary and chat registers
- `docs/conventions/` — the census/register map (new file)
- `docs/ai/agentic-caucus/` — audit dispositions
- `ai-ethics-and-operations.md` — the C11 violation
- claude.ai project knowledge — **manual, Bex only**

## Acceptance criteria

- [ ] Every surface in the census maps to **exactly one** register (PRD §8 criterion 4)
- [ ] **Both compartments** can reach the register that governs them (PRD §8 criterion 6) — verified by retrieval from each, not by upload confirmation
- [ ] No surface in the census lacks a governing file
- [ ] `ai-ethics-and-operations.md` no longer violates its governing rule
- [ ] The em-dash column matches B3 + B3a exactly

## Risks

- **Phase 3 stalls on Bex's availability.** Mitigate by ordering it last and making Phases 1–2 independently shippable, so a stall does not block AOP-5's dependency on the census.
- **The census growing into an audit.** It maps surfaces to registers; it does not assess whether each surface complies. Compliance is V5's hook (AOP-5).
- Manual claude.ai sync drifts. B6 accepts this; the mitigation is the stated re-sync trigger in item 9, not a promise to remember.

## Post-Epic Close-Out

- [ ] Friction line
- [ ] Incident log: C11 is a shipped published-surface violation, so an entry is expected
