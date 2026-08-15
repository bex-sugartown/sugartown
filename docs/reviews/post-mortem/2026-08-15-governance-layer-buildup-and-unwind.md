# Post-Mortem — The Governance Layer: Buildup and Unwind (Minimal + Surgical, extended)

**Date:** 2026-08-15
**Period analysed:** 2026-06-25 → 2026-08-15
**Trigger:** SUG-284 removed the governance/verification-review layer built across waves 2 and 3. Bex requested a post-mortem covering what the layer was for, what kept going wrong, why it had to come out, what made it hard for a human to work through, and how to rebuild the parts worth keeping.
**Method:** every figure in this document was measured during the writing session. None is quoted from a prior doc. Commands are named inline.

---

## 1. What was expected

The layer addressed a real and repeatedly-evidenced problem. The incident log holds 14 entries (INC-001 → INC-014, `grep -c '^### INC-0' docs/ai/agentic-caucus/incident-log.md`). The dominant failure shape is **a mechanism that exists, reports success, and does nothing**:

| Incident | Mechanism | Inert for |
|---|---|---|
| INC-004 | Root `validate-tokens.js` orphaned and stale | 127 days |
| INC-005 | `__APP_VERSION__` unfrozen in Storybook | 94 days |
| INC-011 | Four ESLint boundary rules declared, none firing | 176 days |
| INC-009 | Chromatic died before its first line, every CI run | 36 days |
| INC-010 | CI workflow had never passed | 212 runs |
| INC-007 | "0 gaps" published publicly while false | undated claim |

Six of fourteen incidents are the same bug. The intended features followed directly from it:

1. **Liveness** — prove a gate fails on deliberately broken input, rather than confirming it exists
2. **A control register** — every gate, validator, deploy path and published claim in one table, each naming its probe, its reader, and a re-read date
3. **Claim honesty** — no published statistic about the platform's own rigour without a measurement date and a reproducing command
4. **A rule register** — stable IDs for all 60 CLAUDE.md rules, classified by enforcement type
5. **A doc-budget cap** — keep the session-loaded instruction surface small enough to actually be read
6. **A governance data layer** — a schema-validated source of truth for all of the above
7. **Gate tiering** — make each rule's cost explicit; Tier 1 stops and asks, Tier 2 reports, Tier 3 is automated

None of these is a bad idea. Every one traces to a real incident.

---

## 2. What we got

| Measure | Peak (pre-unwind) | Now | How measured |
|---|---|---|---|
| `docs/ai/agentic-caucus/` | **18,743 words** | 8,714 | `git ls-tree -r 189cc24d^` piped to `wc -w` |
| CLAUDE.md | 12,307 words (2026-07-30) | 10,093 | `git show <sha>:CLAUDE.md \| wc -w` |
| Governance/audit code | **4,103 lines, 188K** | 0 | `cat zArchive/.../scripts/*.js \| wc -l` |
| Real validators (survived) | 2,776 lines | 2,776 | `find … -name 'validate-*.js' \| xargs wc -l` |
| `validate:*` / `governance:*` scripts | 18 | 8 | `grep -c` on `package.json` |
| CI steps | 32 | 18 | `grep -c '^      - name:'` on `ci.yml` |
| Linear issues in the lineage | 12+ | 7 cancelled by SUG-284 | SUG-198, 227, 243, 254, 255, 256, 262, 268, 276, 281, 282, 284 |

Two numbers carry the story.

**The audit apparatus was 1.5x larger than the thing it audited.** 4,103 lines of governance code against 2,776 lines of actual validators.

**The corpus grew 7.6x in five weeks.** 2,481 words on 2026-06-24 to 18,743 at peak, overtaking CLAUDE.md itself.

---

## 3. Gaps and misalignment

### 3.1 The doc-budget cap could not see the corpus that grew

The cap's scope was one regex, in `zArchive/2026-08-sug284-governance-layer/scripts/validate-doc-budget.js`:

```js
const REFERENCE_PATTERN = /docs\/conventions\/[a-z0-9-]+\.md/g
```

It measured CLAUDE.md plus referenced `docs/conventions/` files. `docs/ai/agentic-caucus/` was **structurally invisible to it**, while CLAUDE.md's §Verification review instructed every session to open and write to `docs/ai/agentic-caucus/control-register.md`.

The script's own header anticipated the loophole, one directory too narrowly:

> "Capping CLAUDE.md alone is met by moving text into `docs/conventions/`, which a session then follows a link to and reads anyway."

It guarded the displacement path it imagined and not the one that was used.

### 3.2 When the surface breached the cap, the cap moved

Raised 20,150 → 26,000 on 2026-08-09 (SUG-281 Phase 1), recorded in the script's own comments. The limit adapted to the breach.

### 3.3 The apparatus became an instance of the failure it existed to catch

`governance.json` was generated on every build, validated by three validators, and had **zero consumers anywhere in the app**.

`/eod` step 6 described itself as "its only reader" of a warn-gate breach signal. By 2026-08-15 that signal no longer existed: the annotations, both warn gates, and the third CI job it iterated had all been removed. Left in place it would have iterated two jobs, matched nothing, and reported silence, which is indistinguishable from "no gate fired."

That is INC-011's exact shape, reproduced inside machinery built to prevent INC-011.

### 3.4 Six ID namespaces, no index

`SUG-NNN` (Linear), `CTL-NNN` (control register), `RULE-NNN` (rule register), `INC-NNN` (incident log), `AOP-N` (proposal docs), and `P9`-style register rows. A human asking "what governs X?" had to already know which register to open.

### 3.5 Every artifact required another artifact

To add a gate: run a verification review, add a control-register row, name a probe, add a liveness-harness entry, set a `nextRead` date, schedule the re-read. Each link defensible. The chain was not traversable in one sitting.

### 3.6 Counts were wrong in every direction, repeatedly

SUG-281 found the PRD said 15 gate sections, Appendix A said 24, the epic said 16, and against 62 headings roughly 49 actually gated an action. SUG-243 reported four wrong figures. SUG-192 found three of SUG-191's audit rows named a file that did not exist. The registers were hand-maintained and drifted faster than they were read.

### 3.7 Five pieces of residue survived the removal, found only by reading

`CLAUDE-md-removed-sections.md` was never written despite the archive README listing it; two dangling convention references remained; close-out step 1b kept its evidence-recording ceremony; `/eod` step 6 kept its dead reader. A fifth turned up in `release-assistant-prompt.md` during the v0.33.0 release.

Each was caught by asking "does this rule still have a referent?" None was caught by the scope list, because Phase 7's scope enumerated **sections of one file** rather than surfaces.

---

## 4. Root cause

| # | Gap | Category |
|---|---|---|
| 3.1 | Cap's regex excluded the fastest-growing corpus | **Tooling/config drift** — guard scoped to the wrong surface |
| 3.2 | Cap raised to fit the breach | **Process gap** — no rule that a breach is fixed, not accommodated |
| 3.3 | `governance.json` zero consumers; step 6 reading nothing | **Assumption (unstated, untested)** — that generating an artifact means someone consumes it |
| 3.4 | Six ID namespaces | **Component abstraction gap** — five registers, no shared index |
| 3.5 | Artifact chains | **Scope creep** — each increment small, compounding cost unmeasured |
| 3.6 | Persistently wrong counts | **Process gap** — hand-maintained registers with no generation step |
| 3.7 | Residue survived removal | **Prompt/spec gap** — removal scope enumerated sections, not surfaces |

**The single root cause underneath all seven:** the layer measured *conformance to itself* rather than *outcomes in the product*. Nothing in it was wired to a consequence a human would notice. `governance.json` had no consumer, the coverage tally had no reader, the registers had no generator.

A system whose only feedback loop is its own bookkeeping cannot tell you it has stopped being useful. That is why it took a human judgement call on 2026-08-13, and not a validator, to stop it.

---

## 5. Why it was hard for a human to work through

Four mechanisms, in order of impact.

**Reading cost outran any single sitting.** At peak the mandatory-read surface was 12,307 words (CLAUDE.md) plus 18,743 (agentic-caucus), or **31,050 words**, against a cap of 26,000 that measured only part of it. Roughly two hours of careful reading before writing a line of code.

**No entry point.** Five registers, five ID schemes, no index. There was no single place to answer "what applies to the change I am about to make?" The map had to be held in your head, and it changed weekly.

**The work item was never the work.** Adding one gate produced six artifacts, only one of which was the gate. The ratio was legible in the code: 4,103 lines of audit against 2,776 lines of validator.

**Correctness was unverifiable by inspection.** Because the registers were hand-maintained, no count could be trusted without re-running something. The layer's own rule said exactly that: "any figure you report carries the command that produced it." Correct, and exhausting. It made every claim in the system provisional until re-measured.

The system was internally coherent and locally reasonable at every step. It was not comprehensible as a whole, and it had no mechanism for telling anyone so.

---

## 6. System improvements

**6.1 — Consumer-first rule for any generated artifact.** No generator ships before the thing that reads its output exists. *New rule in CLAUDE.md.* **Must-have.**

**6.2 — A guard may not be widened to accommodate a breach.** If a cap is exceeded, the surface is cut or the cap is retired with a stated reason. It is not raised. *New rule in CLAUDE.md.* **Must-have.**

**6.3 — Measure the whole instructed surface, or do not cap it.** Any future cap globs every path a session is instructed to read, derived from the instructions themselves rather than a hardcoded directory. *Guardrail spec, held for whenever a cap returns.* **Nice-to-have** (no cap currently exists).

**6.4 — Registers are generated or they do not exist.** A register that cannot be regenerated from the repo is a stale document with a table in it. *New rule in CLAUDE.md.* **Must-have.**

**6.5 — Removal scope enumerates surfaces, not sections.** CLAUDE.md, `.claude/skills/**`, `docs/workflows/`, `docs/conventions/`, `docs/epic-template.md`, CI config. *Update to `docs/epic-template.md`.* **Must-have.**

**6.6 — One index, or one ID scheme.** If registers return, they share `SUG-NNN`, or there is a single generated index mapping every ID to its owner. *Precondition on any rebuild.* **Must-have.**

**6.7 — Every new process carries a kill criterion at birth.** A stated condition under which it is removed, and a date to check it. The layer ran seven weeks with no such condition. *New field in `docs/epic-template.md` for process-building epics.* **Must-have.**

**6.8 — Rebuild one feature at a time, each proving value before the next.** See below.

---

## 7. Build-back plan

Ordered by evidence of need, measured against the incident log.

| # | Feature | Why it earns a slot | Kill criterion |
|---|---|---|---|
| **1** | **Liveness probes only, no register.** A probe per gate proving it fails on broken input. Nothing else: no control register, no `nextRead`, no tally. | 6 of 14 incidents are inert-mechanism bugs. Highest-value single item. | If it finds nothing new in 60 days, retire it. |
| **2** | **Claim honesty for published statistics.** Any rendered count about the platform's own rigour carries a measurement date and the command that produced it, or is not published. | INC-007 shipped a false public claim. Already partly live in CLAUDE.md's technical-diagram red-pen gate. | Retire if no such statistic is published for 90 days. |
| **3** | **A generated index, if and only if 1 and 2 both prove out.** Regenerated from the repo, never hand-maintained, one ID scheme. | 3.4 and 3.6 make this a precondition for anything register-shaped. | Never hand-edit. If it drifts, delete it. |

**Explicitly not rebuilt:** MTTN, the rule register, the doc-budget cap, gate tiering in CLAUDE.md, and the governance data layer. The first four cost more than they returned. The fifth had no consumer.

**Normalizing discipline between each step.** Ship item 1 alone. Run it for one full epic cycle. Then answer in writing: did it catch anything a human would not have? Only a yes unlocks item 2. Two consecutive noes end the rebuild.

The layer's original failure was that all seven features arrived in five weeks with no interval in which to judge any of them.

---

## 8. Disposition

Recorded 2026-08-15. Recommendation 9 (file this document) actioned immediately.

### 8.1 The Linear capacity constraint

Measured 2026-08-15 from the Linear workspace UI, not inferred:

| Fact | Value |
|---|---|
| Issues used | **260 of 250** (free plan, over cap) |
| Issues in `Done` | **193** |
| Active working set | ~67 (58 backlog + Todo + in-flight, per `stats.linearRoadmap`) |
| Lift available | Basic plan, $10/user/month billed yearly, unlimited issues |

**Done issues are not archived and continue to count.** An earlier working assumption in this session was that archiving would reclaim slots; the UI disproves it. The free plan caps *lifetime* issues, not active ones, so 74% of the quota is held by completed work that will never be reopened. Deletion is not a workaround either: per SUG-269's own description, a deleted issue holds its slot for a month.

**This collides with a decision shipped in v0.33.0.** The backlog priority stack (`docs/backlog/sugartown-backlog-priorities.md`, 499 lines) was retired on 2026-08-05, making Linear the single priority queue with no second copy, and CLAUDE.md now states that as a rule. Linear ran out of room ten issues later. The workflow mandates a single queue; the queue cannot accept new entries. Either the plan changes or the "no second copy" rule needs a stated exception.

The constraint has already distorted the record once: SUG-269's ID was reused for unrelated scope because no new slot was available, so that identifier means two different things depending on the date, and the issue description now carries a warning about itself.

### 8.2 Execution plan for recommendations 1 through 8

The capacity blocker gates far less than it first appears. Only one of the eight needs a Linear slot.

| Route | Recommendations | Artifact | Blocked by Linear? |
|---|---|---|---|
| **Doc edits** | 6.1, 6.2, 6.4 (CLAUDE.md); 6.5, 6.6, 6.7 (`docs/epic-template.md`) | Rule changes, not work items. One session, one commit each or one batched commit under the Instruction & Rule File Write Gate. | **No** |
| **Needs an epic** | 6.8 — the three-step build-back (liveness probes → claim honesty → generated index) | `/new-epic`: Linear issue + backlog doc | **Yes** |
| **Held in reserve** | 6.3 — measure-the-whole-surface spec | Nothing to log; no cap currently exists | **No** — nothing to do |

Six of eight can proceed immediately without consuming any capacity. 6.8 waits on either a plan upgrade or a deliberate exception to the single-queue rule.

### 8.3 Standing note on adding rules

6.1, 6.2, 6.4 and 6.7 all add rules to the instruction surface, in a post-mortem about that surface growing too fast. Roughly 150 words against CLAUDE.md's 10,093. Defensible, but it is the same motion that started this, and warrants an explicit decision rather than an assumed one.
