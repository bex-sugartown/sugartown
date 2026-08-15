# CLAUDE.md — sections removed by SUG-284 Phase 7

**Removed:** 2026-08-13 (commit `ad5d60ba`, originally `6af777e4` before a 2026-08-15 rebase)
**Epic:** SUG-284 — Unwind the governance/verification-review layer
**Archive written:** 2026-08-15 (retroactively — the Phase 7 checkbox called for this file
before the removal, and it was missed at the time; text recovered verbatim from
`git show ad5d60ba^:CLAUDE.md`)

Verbatim text of every CLAUDE.md section Phase 7 removed. Nothing here is a live instruction.
To restore any of it, paste the block back into CLAUDE.md at the position noted — but read
the epic's Background first, because each was removed for a stated reason.

---

## 1. §Verification review (blocking)

**Position:** between §Verify before citing — don't trust a prior claim and §Instruction writing style.

**Why removed:** the `verification-reviewer` subagent and the `control-register.md` it required
are both archived, and `pnpm validate:controls` no longer exists. The section instructed agents
to run tooling that was removed in Phases 2–4.

```markdown
### Verification review (blocking)

Before building anything that adds or changes a gate, validator, test, deploy path, or a
published claim about the platform, run the `verification-reviewer` subagent and add a row to
`docs/ai/agentic-caucus/control-register.md`. Run it as a subagent, not inline: a review inside
the session that wrote the plan ratifies its own reasoning.

Five questions per control: what artifact proves it ran, what broken input must make it fail,
what path reaches production without it, does it publish a claim (needs a measurement date and
a reproducing command), and who reads the result by when.

Enforced by `pnpm validate:controls`. Full rules: `docs/conventions/verification-review.md`.
```

Related archived artifacts: `claude-agents/verification-reviewer.md`,
`docs/conventions/verification-review.md`, `docs/ai/agentic-caucus/control-register.md`,
`scripts/validate-control-register.js`.

---

## 2. §Process feedback loop — three-strike retrospective trigger

**Position:** between §Epic authoring — Linear-first workflow and §Mid-epic commit checkpoints.

**Why removed:** this section was `docs/conventions/feedback-loop.md`'s only active consumer.

```markdown
### Process feedback loop — three-strike retrospective trigger

Every shipped epic doc's Post-Epic Close-Out states one sentence: what cost a correction commit this time (`none` is a valid answer — `docs/epic-template.md` step 3b). When the same friction — by plain-language similarity, a human judgment call, **not a string match** — appears in three shipped docs, run `/post-mortem` against that pattern. Full mechanics, the monthly product-evidence loop it pairs with, and why this stays a human read rather than a mechanized check: `docs/conventions/feedback-loop.md` (SUG-241).
```

Note: `docs/epic-template.md` step 3b kept the friction-line requirement itself; only the
three-strike-trigger sentence was removed from it.

---

## 3. §Scope creep (blocking)

**Position:** between §Linear status = workflow stage and §Multi-phase epic merge cadence.

**Why removed:** it routed findings into the same apparatus being removed, and its enforcement
(`pnpm validate:epic-docs`) is archived.

```markdown
### Scope creep (blocking)

Work found mid-epic that will not be done in this epic gets filed before the epic
continues. Claude files it, not the human.

Route by size, in this order:

1. **Already inside an approved epic's Scope?** Execute it. No new container.
2. **Otherwise, does a heavy gate fire** — new visual format, schema change, new
   gate/validator, or a new published claim?

| | Destination | Artifact |
|---|---|---|
| A heavy gate fires | `/new-epic` | Linear issue + backlog doc |
| No gate, fits one commit | Scope line on the nearest owning doc | doc edit |
| No gate, needs several commits | New phase on the nearest owning epic doc, with its Scope items mapped to it | doc edit (no Linear sub-issue) |

In the same turn the finding is recorded, Claude owns the artifact its row names, the
execution order relative to the current epic, and any `blockedBy`/`blocks` relation
(SUG-246). Priority is proposed, not set: the Linear queue stays the human's.

Does not fire for a finding fixed inline in the same session, or an observation with no
proposed change.

Verified at close-out step 5b and by `pnpm validate:epic-docs`. (2026-07-27→28: six issues
reached Linear with no doc.)
```

Related archived artifact: `scripts/validate-epic-docs.js`.

---

## 4. Epic close-out step 8b — Incident log check

**Position:** in §Epic close-out sequence, between step 8 (Update Linear) and step 9 (Clean tree).

**Why removed:** `docs/ai/agentic-caucus/incident-log.md` is kept as reference, but the
mandatory always-run step and `pnpm mttn` (archived) are not.

```markdown
8b. **Incident log check** — if this epic fixed something already shipped (a regression that reached production, a gate found not firing, a published claim found false), append an entry to `docs/ai/agentic-caucus/incident-log.md` before closing, with both `Introduced` and `Noticed` dates — Mean Time To Notice needs both captured at the time. Run `pnpm mttn` afterwards. If the epic fixed nothing already-shipped, state "no incident" in the close-out; silence is not an answer.
```

The sequence's preamble changed in the same edit:

```diff
-Steps 1, 1b, 7, 8, 8b and 9 always run. **Steps 2–6b fire only on their stated trigger**; a
+Steps 1, 1b, 7, 8 and 9 always run. **Steps 2–6b fire only on their stated trigger**; a
```

Related archived artifact: `scripts/mttn.js`.

---

## 5. The 10 dangling `[[rule-register]]` citations

`docs/ai/agentic-caucus/rule-register.md` is archived, so every `Narrative: [[rule-register]]
§RULE-NNN` pointer was cut. **Each rule's actual instruction text is untouched** — only the
trailing citation was removed. Mapping preserved here so a rule can still be traced to its
register entry inside the archived file.

| CLAUDE.md section the citation hung off | Citation removed |
|---|---|
| §Epic close-out sequence — "Do not carry uncommitted changes across epic boundaries…" | `Narrative: [[rule-register]] §RULE-002.` |
| §Verify before citing — don't trust a prior claim | `Narrative: [[rule-register]] §RULE-003.` (standalone line) |
| §Phase 0 visual spec gate — "What triggers this gate…" | `Narrative: [[rule-register]] §RULE-017.` |
| §Incomplete epic doc hard stop — "Applies to all epic types…" | `Narrative: [[rule-register]] §RULE-018.` |
| §Instruction & Rule File Write Gate — "Produce the diff from a copy, not from the file." | `Narrative: [[rule-register]] §RULE-033.` |
| §Portable Text blocks written via MCP — "`citationRef` is safe in `sections[].content`…" | `Narrative: [[rule-register]] §RULE-035.` |
| §DS Component Authoring — Token-First Rule | `Narrative: [[rule-register]] §RULE-049.` |
| §Mirrored File Registry — "One pair was retired in SUG-224" | `: [[rule-register]] §Retired.` |
| §Technical diagram red-pen gate — "This gate also fires on published governance statistics…" | `Narrative: [[rule-register]] §RULE-055.` |
| §Storybook — build-time globals must be frozen | `Narrative: [[rule-register]] §RULE-058.` |

Archived at `docs/ai/agentic-caucus/rule-register.md` in this same archive directory.

---

## 6. Downstream rule files edited in the same commit

Phase 7 touched four more files, each only where it pointed at a now-archived doc. These are
edits rather than whole-section removals, so the full text is not reproduced here — see
`git show ad5d60ba` for the exact diffs.

| File | Change |
|---|---|
| `docs/conventions/human-gate-conventions.md` | **kept** — Tier 3's dangling `control-register.md` pointer trimmed |
| `docs/conventions/technical-doc-style-guide.md` | **kept** — 3 edits removing `verification-review.md` references and its Canary/Bypass terminology |
| `docs/epic-template.md` | removed the "Control register rows" checklist item; trimmed "Enforcement liveness" to drop its `validate:validators`-specific clause; removed the three-strike-trigger sentence from step 3b (kept the friction-line requirement itself) |
| `.claude/skills/sugartown-prd-writer/SKILL.md` | removed PRD §11 "Verification & Ownership" wholesale, renumbered §12→11 and §13→12 |

Confirmed untouched by Phase 7: the Content Write Gate, the Human-Publishes Rule, the Phase 0 /
VQA / Chromatic gates, and the Instruction & Rule File Write Gate itself (which gated this
commit).
