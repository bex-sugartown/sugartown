# Agent Operability — Product Requirements Document

**PRD Version:** v0.1
**Status:** Draft for review
**Author:** Claude Code, from a workflow post-mortem (2026-08-08) and a Voice Governance Audit (chat, 2026-08-08)
**Domain:** Platform governance and agent instruction surface. No FE render surface, no Sanity schema.
**Last updated:** 2026-08-08
**ORIENT phase:** complete. Every "unverified" row in the source audit is resolved in §2.
**Related:** SUG-260 (shipped), SUG-268 (in progress), `docs/conventions/user-story-conventions.md`, `validate:doc-budget`

---

## 0. What this document is

Two investigations landed on the same day and turned out to be one problem.

1. A **workflow post-mortem** on the past week: executing SUG-260 and SUG-268 was slow and click-heavy, phases stalled with no prompt to continue, and CI kept going red on newly added gates.
2. A **Voice Governance Audit** written in claude.ai chat: editorial register is bleeding into technical surfaces, rules decay about a week after they are written.

They share a root cause. **The system accumulates governance faster than it accumulates the machinery to carry it**, and the instruction surface that would carry it has a hard capacity limit that is already binding.

This is the big-picture document. It is not an epic. §7 proposes a split into epics with sizes, for approval.

---

## 1. Problem statement

Three symptoms, one mechanism.

**Symptom A — the workflow stops and waits.** Phases defined in an epic doc do not execute without a human typing "execute phase N" each time. Close-out stops halfway. Measured 2026-08-08: **24 decision prompts against 19 human messages** in one session, and six occasions where Bex had to ask what happened next.

**Symptom B — CI goes red on bookkeeping, not defects.** Of the last 10 CI runs on `main`, 3 failed. **All 3 were caused by gates added in the previous 10 days. None caught a product defect.**

**Symptom C — register rules decay about a week after they are written.** Editorial voice guidance reaches technical surfaces; the technical guidance reaches nothing.

**The mechanism:** rules are written as prose into an instruction surface that (a) has a fixed word budget, (b) is read by only one of the two agent compartments, and (c) has no executor. A rule that is not executed by something is a rule a human has to drive by hand, and every new one adds to that manual load rather than reducing it.

---

## 2. ORIENT findings — the source audit corrected

The Voice Governance Audit was written from claude.ai chat, which cannot read this repository. It marked 8 rows and 2 findings unverified. All are now resolved.

### 2.1 Existence checks

| Audit claim | Verified state |
|---|---|
| `.claude/skills/` — existence unverified | **Exists. 17 project skills.** |
| `.claude/rules/` — existence unverified | **Does not exist.** D2 and D6 are greenfield, not migrations |
| `~/.claude/CLAUDE.md` — existence unverified | **Does not exist.** No machine-local layer to reconcile |
| `CLAUDE.local.md` | **Does not exist** |
| Pre-commit coverage unknown | **1 hook, 8 validators. Zero prose checks of any kind** |
| `CLAUDE.md` line count inferred | **836 lines, 10,491 words.** Audit's "well over 200" confirmed, by 4× |

### 2.2 F6 is void

The audit reports two node style guides with different content. **The repo contains exactly one:** `docs/brand/node-style-guide.md` (4,158 words). The duplicate exists only in claude.ai project knowledge. D9 is therefore a project-knowledge cleanup, not a repo change, and cannot be done by Claude Code.

### 2.3 F3 is understated: 49 files, not nine

`grep` for an em-dash rule across `docs/`, `CLAUDE.md` and `.claude/skills/` returns **49 files**. Companion counts: `anti-slop` 30, `adjective triad` 25, `filler transition` 17, `delve into` 10, `list-itis` 7.

Most are epic and shipped docs restating the rule rather than owning it, so 49 is not 49 sources of truth. It is 49 places a future edit has to be reconciled against, which is the same problem at a larger number than the audit assumed.

### 2.4 F8 is void as written, and the real finding is worse

The audit's F8 says the technical register is prohibition-only, with no richly specified positive target, and that a model therefore reaches for the editorial register.

**The premise is wrong.** `docs/conventions/technical-doc-style-guide.md` exists and is excellent: 5,419 words, defines the register positively, 10 example rows, names 11 governed surfaces.

**It is not referenced from `CLAUDE.md`, so it never loads in a Claude Code session.**

| Guide | Words | Positive register | Examples | Names surfaces | Loads? |
|---|---|:--:|:--:|:--:|:--:|
| `technical-doc-style-guide.md` | 5,419 | ✅ | ✅ 10 | ✅ 11 | **❌ never** |
| `instruction-writing-style.md` | 967 | ❌ | 2 | ❌ | ✅ |
| `usage-doc-style-guide.md` | 1,250 | ❌ | ❌ | ✅ | ✅ |

**The best technical-register document in the system loads nowhere, and the two that do load are prohibition-only.** F8's symptom is real; its cause is not absence, it is non-delivery.

### 2.5 The reason it cannot simply be referenced

`validate:doc-budget` caps the session-loaded instruction surface at **20,150 words**, currently at **19,946** — **204 words of headroom.** Referencing `technical-doc-style-guide.md` from `CLAUDE.md` would add 5,419 words and blow the cap by 5,215.

**The gate designed to protect the instruction surface is what prevents the instruction surface from being fixed.** That is the single most important finding in this document. Any plan that does not resolve it will fail the same way the last three attempts did.

### 2.6 Claude Code surfaces the audit omitted

The audit's inventory is claude.ai-weighted. Claude Code carries these, none listed:

| Surface | Scale | Governs register? |
|---|---|---|
| `.claude/skills/` | 17 project skills | Yes — `/red-pen`, `/glossy`, `write-*` each carry register |
| `.claude/agents/` | 2 subagents | Partially — `design-reviewer`, `verification-reviewer` |
| Auto-loaded memory | `MEMORY.md` 712 words + **44 memory files** | **Yes, and it is behavioural, not editorial** |
| `.claude/settings.local.json` | 828 permission entries | No, but it is instruction-surface-adjacent |
| MCP server | `sugartown_get_rule` and 7 others | Yes — serves rules on demand, budget-free |
| `.husky/pre-commit` | 8 validators | Enforcement |
| `validate:doc-budget` | the 20,150-word cap | **Meta-governance the audit did not know existed** |
| Nested `CLAUDE.md` | 2 files | Yes |

Two of these change the plan:

- **The MCP server already solves the budget problem in principle.** `sugartown_get_rule` serves rules on demand rather than loading them. A rule served by MCP costs zero budget words. The audit's D2 (`.claude/rules/`) and this are competing answers to the same question.
- **Memory is the surface that governs my behaviour**, and it is where the workflow post-mortem's worst finding lives: a memory rule already says *"never make Bex ask what's next"*, and I violated it six times in one session. Rules in memory decay the same way rules in `CLAUDE.md` do.

---

## 3. Consolidated findings

| # | Finding | Source | Confidence |
|---|---|---|---|
| **C1** | The instruction surface is at 99% of its cap, and the fix for the register problem needs 5,419 words that do not exist | ORIENT §2.5 | Verified |
| **C2** | The best technical-register guide loads in neither compartment | ORIENT §2.4 | Verified |
| **C3** | `CLAUDE.md` routes commit messages and doc prose to the *editorial* guide, with no competing route | Audit F1 | Verified (direct quote) |
| **C4** | Phases are specified but not executable; the workflow stalls between them | Post-mortem G1/G2 | Measured |
| **C5** | Gates are untiered: a rebase costs the same ceremony as a production migration | Post-mortem G3 | Measured, 24 vs 19 |
| **C6** | Close-out spans two skills with an unowned seam | Post-mortem G4 | Observed |
| **C7** | Validators doubled (8→16) and CI steps grew 17→30 in two weeks; every recent red run is a new gate, none a defect | Post-mortem G5 | Measured |
| **C8** | Register rules are restated across 49 files | Audit F3 / ORIENT §2.3 | Verified |
| **C9** | Chat and Claude Code read disjoint instruction sets; each register is deployed to the compartment it was not written for | Audit F2 | Verified |
| **C10** | Gate placement does not match the push model — `validate:doc-budget` is CI-only and cannot fail before a deploy | Post-mortem G7 | Verified |
| **C11** | A published FE surface violates the editorial rule it is governed by | Audit F5 | Verified |
| **C12** | Registers exist that no guide documents (glossary, chat execution) | Audit F7 | Verified |

---

## 4. Desired end state

1. An epic with defined phases **executes** to the next human gate without being driven turn by turn.
2. Human gates fire on **irreversible, outward-facing, or content-writing** actions, and nowhere else.
3. CI red means **something is broken**, not that a document grew.
4. Every writing surface maps to **exactly one register**, and that register **reaches the compartment that writes it**.
5. Rules that must hold are **executed by something**, not stated and hoped for.
6. The instruction surface has **headroom**, so the next correct rule can be added.

---

## 5. Open decisions for Bex

Not resolvable without you.

| # | Decision | Why it blocks |
|---|---|---|
| **B1** | **How do rules get delivered without consuming budget?** MCP-on-demand (`sugartown_get_rule`), `.claude/rules/` path-scoped, skills, or raise the cap | Determines the shape of nearly every fix. §2.5 |
| **B2** | **Two registers or three?** Chat execution is currently governed by nothing | Audit §8.1 |
| **B3** | **Does the em-dash ban survive on technical surfaces at all?** Dropping it removes a 3-exemption chain across 49 files | Audit §8.2 |
| **B4** | **Do bookkeeping gates block or warn** until green CI is routine? | C7. My recommendation: warn, temporarily, with a dated re-arm |
| **B5** | **Gate posture:** which actions genuinely need a click | C5 |
| **B6** | **Is manual claude.ai skill sync acceptable** as the price of one source of truth? | Audit §8.5 |

**D8 and D9 from the source audit require you personally** — claude.ai memory and project knowledge are not reachable from Claude Code.

---

## 6. Non-goals

- Rewriting published FE content. The editorial register works on its target surfaces.
- Changing the brand voice itself.
- Sanity schema changes.
- Splitting the claude.ai project. Rejected in the source audit for reasons that still hold.
- Adding any new validator until C7 is resolved.

---

## 7. Proposed epic split

Sizes are session-based: **S** = one session · **M** = two to three · **L** = four or more.

### Track 1 — Workflow operability (from the post-mortem)

| Epic | Scope | Size | Priority | Depends on |
|---|---|:--:|---|---|
| **W1 — Phase auto-advance** | Epic phases execute to the next declared gate without per-phase prompting. Updates CLAUDE.md §Session discipline + `docs/epic-template.md` | **S** | 🔴 Now | — |
| **W2 — Gate severity tiers** | Rewrite `human-gate-conventions.md` with a 3-tier model. Reclassify all 15 CLAUDE.md gate sections | **M** | 🔴 Now | B5 |
| **W3 — Close-out runner** | `/close-out` skill executing steps 1b–9, reporting N/A with reasons. Removes the `/eod` seam | **M** | 🟢 Next | W1 |
| **W4 — Gate placement + posture** | `validate:doc-budget` to pre-commit or advisory; bookkeeping gates to warn with a dated re-arm; freeze new validators until N green runs | **S** | 🔴 Now | B4 |
| **W5 — Paused-epic resume** | `/morning` names In Progress epics with open phases and offers to resume | **S** | 🟣 Soon | — |

### Track 2 — Register delivery (from the audit)

| Epic | Scope | Size | Priority | Depends on |
|---|---|:--:|---|---|
| **V1 — Rule delivery mechanism** | Resolve B1. Build the chosen carrier so a rule can load without consuming budget. **Everything else in this track is blocked on it** | **L** | 🔴 Now | **B1** |
| **V2 — Route the technical register** | Deliver `technical-doc-style-guide.md` to Claude Code. Rescope the CLAUDE.md Anti-Slop routing line (audit D1) so commit messages and doc prose route technically | **S** | 🔴 Now | V1 |
| **V3 — Surface census + register map** | The audit's §6.6. Every writing surface → exactly one register. Prerequisite for de-duplication | **M** | 🟢 Next | — |
| **V4 — Rule de-duplication** | Collapse the 49-file restatement to one canonical location per rule, everything else links | **L** | 🟢 Next | V3, V1 |
| **V5 — Prose enforcement hook** | Path-scoped anti-slop pre-commit check, warn-only first. The system has zero prose checks today | **M** | 🟣 Soon | V3, B4 |
| **V6 — Chat-side delivery** | Upload the technical guides to claude.ai project knowledge (D7); rescope the memory register entry (D8, Bex only) | **S** | 🟢 Next | B2 |
| **V7 — Undocumented registers + violations** | Add glossary and chat registers to the tone spectrum (D10); fix `ai-ethics-and-operations.md` (D12); resolve the PK duplicate node guide (D9, Bex only) | **S** | 🟣 Soon | V3 |

**Total: 12 epics.** 5 workflow, 7 register.

### Sequencing

```
B1 decision ──▶ V1 ──▶ V2 ──▶ V4
                 │             ▲
                 └──▶ V6       │
                               │
V3 ────────────────────────────┴──▶ V5, V7

W1 ──▶ W3
W2, W4, W5 independent
```

**Recommended first three, in order:** W4 (stop CI hurting), W1 (stop the stalling), B1 decision then V1 (unblock everything else). W4 and W1 are both **S** and independent; they could ship in one session.

---

## 8. Success criteria

- [ ] An epic with N phases runs to its next declared gate without N prompts
- [ ] Decision prompts per session drop below one per human message
- [ ] Ten consecutive CI runs on `main` where every failure is a real defect
- [ ] Every surface in the V3 census maps to exactly one register
- [ ] Every register rule has exactly one canonical location
- [ ] Both compartments can reach the register that governs them
- [ ] The instruction surface has more than 1,000 words of headroom
- [ ] Rules that must hold are enforced by hooks, not stated as instruction
- [ ] The plan states how drift is **detected** next time, not only corrected

---

## 9. Provenance

- **Workflow post-mortem:** run 2026-08-08 against 2026-08-01→08 git history. Measurements reproducible from `git log`, `gh run list`, and the session transcript.
- **Voice Governance Audit:** authored in claude.ai chat 2026-08-08. Verified, corrected and extended here; two of its findings are void (F6, F8-as-written) and one is understated (F3).
- **ORIENT:** run 2026-08-08 in this repo. Every "No" row in the audit's §2 verification table is now resolved.
