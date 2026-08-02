---
**Epic:** SUG-256 — Re-derive the GovernancePage coverage tally from measured enforcement liveness
**Linear Issue:** [SUG-256](https://linear.app/sugartown/issue/SUG-256/re-derive-governancepage-coverage-tally-from-measured-enforcement)
**Status:** In Progress (since 2026-07-29)
**Priority:** 🟢 Next — High. Reputational exposure, not technical debt
**Merge strategy:** (a) Merge-as-you-go. Phase 1 is a research output and ships on its own.
---

# SUG-256 — Governance tally from measured liveness

**Doc created 2026-08-01**, backfilling a gap: this epic reached In Progress on 2026-07-29 with
its Background and Scope living only in Linear and no `docs/backlog/` file at all. Creating it
satisfies SUG-262 Phase 1's "Stub for SUG-256" item, ticked there in the same commit.

## Background

`/platform/governance` §05 published **"30 checkpoints · 0 gaps"** with no measurement date and
no source, while the pipeline behind the claim had failed every CI run on `main` since
2026-05-10.

A partial fix landed 2026-07-27 in `52a86dbb`: the kicker became `30 checkpoints · mapped
2026-07-26`, `governance-coverage.md` went to v1.3 with a liveness caveat and three ⚠️ rows, and
the tally was deliberately **not** re-asserted. This epic does the other half — replacing "not
asserted" with a measured number.

The failure was never the wrong number. It was a claim about the platform's own rigour that
nothing re-verified. SUG-245 ran a GovernancePage accuracy pass on 2026-07-26 and closed it
"re-verified accurate as of this entry, not carried forward unchecked" — one day before the
pipeline was found red for three months. That re-verification was real, but it checked
validators were *wired*, not that anything *ran*.

## The blocker found before execution (2026-08-01 audit)

**The epic as scoped in Linear is not executable as written.** Linear says "re-measure all 30
components against real liveness data". There is no path from the liveness data to those 30
components, because they are counted in a different registry.

| Source | Holds | Used by the page? | Measured 2026-08-01 by |
|---|---|---|---|
| `docs/ai/agentic-caucus/governance-coverage.md` v1.3 | ~30 components; tally **18 / 5 / 2 / 5** | **yes** — copied verbatim into `GovernancePage.jsx:191` | reading the file |
| `docs/ai/agentic-caucus/control-register.md` | **26** controls, each with probe / reader / bypass (25 when this was first measured; CTL-027 landed in Phase 2) | no | `grep -c "^| CTL-"` |
| `pnpm validate:enforcement-liveness` | **13 gates proven live**, 0 inert, 1 skipped | no | running it |

**Two registries, two taxonomies, no mapping.** Liveness describes the control register's rows.
The published tally describes governance-coverage's components. Deriving a number in one from
measurements in the other is not possible until something maps them, and nothing does.

It is not simply "13 of 30 are measurable" either. **15 of the 26 control rows have no probe**,
nine of them `enforced-by-code` — CTL-008, 009, 010, 011, 013, 014, 016, 017, 018. They are wired
and they run; nothing proves they would fail against broken input. So even inside the control
register, most rows carry no liveness evidence.

```bash
# reproduce both figures
grep -c "^| CTL-" docs/ai/agentic-caucus/control-register.md
node scripts/validate-enforcement-liveness.js | grep -E "proven live|inert|skipped"
```

## Objective

`/platform/governance` publishes a coverage claim that carries a measurement date and a named
reproducing command, where every number is derived from something that ran — and where anything
not measurable is shown as such rather than folded into a total.

## Scope

**Phase 1 — Map the two registries (research; no page changes)**

- [ ] Produce a mapping table: each `governance-coverage.md` component → the `CTL-NNN` row(s)
      that enforce it, or `no control` where none exists
- [ ] For each mapped row, record whether it has a probe and whether that probe passed
- [ ] **Name the unmeasurable set explicitly.** Components with no control, and controls with no
      probe, cannot contribute to a measured tally. The size of that set is a finding in itself
- [ ] Decide where the mapping lives so it cannot drift: a column in `governance-coverage.md`, a
      column in `control-register.md`, or a third file. **Whichever is chosen, name what keeps it
      current** — an unmaintained mapping recreates this epic

**Phase 1 output — the mapping (completed 2026-08-01)**

All 30 components classified by whether their status depends on a control *firing* or on an
artifact *existing*. Measured by parsing the six layer tables in `governance-coverage.md` v1.3
and cross-referencing `control-register.md`.

**5 of 30 are control-dependent. 25 are not.**

| # | Component | Layer | Status | Controls it rests on | Liveness evidence |
|---|---|---|---|---|---|
| 1 | Quality validation | 2 | Strong ⚠️ | CTL-001 `validate:tokens`, CTL-007 `pnpm lint`, CTL-008 `validate:urls` | 2 of 3 probed — **CTL-008 has none** |
| 2 | Performance benchmarks | 4 | N/A ⚠️ | CTL-019 Chromatic | probe proves *reachability*, not detection |
| 3 | Drift detection | 4 | Strong | CTL-003 `validate:style-mirror` | probed, passing |
| 4 | Output validation | 5 | Strong | validator suite + human QA gates | suite mostly probed; gates are `convention` |
| 5 | Policy enforcement | 6 | Strong ⚠️ | 6 pre-commit validators + the CI gates | pre-commit probed; **most CI gates unprobed** |

The other 25 rest on an artifact existing — a document, a git property, or a platform
guarantee. Liveness data says nothing about them, and no probe ever will. Examples: Risk
tiering rests on `risk-tiers.md`; Encryption rests on Sanity/GitHub/Netlify; Override authority
rests on a sentence in `CLAUDE.md`.

**This reframes the epic.** "Re-derive the tally from measured liveness" moves **5 rows at
most**. The remaining 25 need a different check — does the named artifact still exist and still
say what the row claims — which is artifact verification, not liveness. Conflating the two is
what produced an undated "0 gaps" in the first place.

Two corrections found while mapping, both by reading files rather than trusting a search:

- A `grep` of `.husky/pre-commit` appeared to show `validate:urls` and `validate:content`
  running at pre-commit, contradicting CTL-008, CTL-012 and the coverage doc. Reading the file
  showed both names appear only in a **comment** on line 3. The hook invokes six `validate:*`
  scripts plus `pnpm lint`. All three sources were correct; the search was not.
- That same comment says `validate:urls` runs "manually pre-PR", while CTL-008 records it in CI
  at `ci.yml:76`. The comment is stale. Cosmetic, but it is the kind of stale note that becomes
  a false premise later.

**Where the mapping lives — decided.** A `Enforced by` column in `governance-coverage.md`
itself, naming the `CTL-NNN` rows or `artifact` for the other 25. Not a third file: two
registries already disagree, and an unmaintained third would make it worse. What keeps it
current: **decided 2026-08-01 after testing the assumption and finding it false.**

The Phase 1 draft of this section claimed `validate:controls` already fails on a dangling
`CTL-NNN` reference, so the coverage doc would fall inside an existing gate's reach for free.
**It does not.** `scripts/validate-control-register.js` reads exactly two files —
`control-register.md` and `validate-enforcement-liveness.js` — and checks that *probe*
references inside the register resolve against the `PROBES` array. It has no concept of a
`CTL-NNN` cited from anywhere else, so a dangling reference in `governance-coverage.md` would be
invisible to it. Verified by reading the script's `REGISTER`/`LIVENESS` constants and its
`COLUMNS` check.

The alternative placement is no cheaper: `COLUMNS` enforces exact column names and count
(`validate-control-register.js:99,183`), so adding a `Covers` column to the register would fail
the validator until the script is updated too.

**Chosen: extend `validate:controls` to scan `governance-coverage.md` and require every
`CTL-NNN` it cites to exist in the register.** Small — one more file read, one more check — and
it extends an existing control rather than adding one. Only 5 of the 30 rows carry a `CTL-NNN`,
so the policed surface is deliberately tiny.

This changes a gate, so `verification-reviewer` runs first and is blocking
(CLAUDE.md §Verification review).

**Verification review — 2026-08-01, `verification-reviewer` subagent, blocking**

Returned **1 Blocker** and resequenced this epic. Findings, all verified against files:

- **Blocker.** The existing `validate:controls` probe mutates only `control-register.md`
  (`validate-enforcement-liveness.js:399-419`). The proposed cross-reference check would have
  shipped with its new code path unexercised — the same `STAYED GREEN against a known
  violation` shape SUG-243 hit when a hardcoded probe injection stopped violating a tightened
  cap.
- **The cross-reference check guards the wrong drift mode.** The register is append-only with
  never-reused IDs, so a dangling reference needs a deliberate deletion. The drift that has
  *already happened* is the page drifting from its source doc: `GovernancePage.jsx` cited
  coverage-doc v1.1, a version that never existed.
- **A whole-file `CTL-\d{3}` scan would break on history.** `governance-coverage.md` carries a
  45-line append-only Changelog, and Phase 3 adds an entry naming CTL-021. Retiring any control
  later would turn a correct historical sentence into an unfixable CI failure.
- **Latent false positive in the gate itself.** `readProbeGates`
  (`validate-control-register.js:125`) matches `/gate:\s*'([^']+)'/g` — single quotes only. The
  four `boundary:` probes use a template literal, so the validator sees 10 probes where 14
  exist and would reject a legitimate row citing `boundary: apps/web`.
- **Four `Reader` cells already cite the wrong `ci.yml` line** — CTL-011, CTL-014, CTL-017,
  CTL-018. The same drift class this epic proposes to police, already live inside the register.

**Resequenced accordingly.** Deriving the tally makes page-vs-doc drift impossible to ship and
supplies the reproducing command AC 2 requires, because the command is the script name. The
cross-reference check drops to Phase 4 with the reviewer's four required changes recorded.

Baseline verified 2026-08-01 — all three sources agree, which is why this is the moment to lock
it:

```bash
awk '/^### Layer/{inl=1;next} /^### Tally|^---/{inl=0} inl && /^\|/ {split($0,a,"|"); s=a[3]; gsub(/[⚠️ ]/,"",s); if(s!="Status" && s !~ /^-*$/) print s}' \
  docs/ai/agentic-caucus/governance-coverage.md | sort | uniq -c
# 18 Strong · 5 Partial · 5 N/A · 2 Inherited  — matches the doc's Tally and GovernancePage.jsx:192
```

**Phase 2 — Derive the tally and enforce it (CTL-027)**

- [x] `scripts/validate-governance-tally.js`: parses the six layer tables, compares against the
      doc's own `### Tally` block **and** `COVERAGE_TALLY` in `GovernancePage.jsx`. Fails on any
      disagreement. Verified both directions: injecting `18→19` on the page, and flipping one
      layer row's status, each produce a named failure. Wired into CI as *Validate governance
      tally*
- [x] Probe added, asserting on output text. **The first version was wrong**: it passed an
      `assert` key that `gateProbe` does not accept, so it would have been silently ignored and
      the probe would have passed on any non-zero exit — the exact false-assurance path the
      review flagged. Rewritten to post-process `result.out` per the boundary-probe precedent
- [x] `CTL-027` row added. Liveness now reports **14 gates proven live, 0 inert** (was 13)
- [x] `readProbeGates` blind spot fixed. It matched single quotes only, so the four
      `` `boundary: ${scope}` `` probes were invisible and a legitimate row citing one would
      have been rejected as dangling. Now handles all three quote styles; a template literal
      captures source text rather than its resolved value, so interpolated gates are matched by
      the literal prefix before `${`. Verified it accepts `boundary: apps/web` and still rejects
      `validate:nonexistent`
- [x] **Stale `Reader` references fixed by changing their format, not their digits.** The review
      found four cells citing the wrong `ci.yml` line. Correcting the numbers broke itself:
      inserting the new CI step shifted every line below it, so four freshly-corrected
      references were wrong again before being committed. All eight now name the CI step
      (`ci.yml` step *Build*), matched against the workflow's own `- name:` values — a
      reference that survives insertion. Each of the nine cited names verified to exist

**Phase 3 verification review — 2026-08-01, blocking. 4 Blockers. PAUSED.**

Phase 3 is **not written**. The review reshaped it beyond what the phase was scoped to hold, so
scope is being decided fresh rather than absorbed silently.

| # | Blocker | Evidence |
|---|---|---|
| 1 | **`validate:governance-tally` has never run in CI.** The proposed kicker cites it as the command behind a published number, while the gate has no CI artifact — wiring, not liveness, which is the distinction this epic exists to fix | `gh run list` latest `30550425440` @ `1a498e3f`; the script does not exist at that commit |
| 2 | **The change touches two files the plan said it would not.** `STATUS_TO_LABEL` hardcodes `Strong → 'Automated checks'`; the probe's `breakIt` hardcodes the same string twice. Renaming a tile breaks both — loudly, but unlisted | `validate-governance-tally.js:41`, `validate-enforcement-liveness.js:465-466` |
| 3 | **Tile 1's body would be the strongest liveness sentence on the page, in the one cell nothing checks.** 2 of the 4 control-backed rows still carry the ⚠️ "re-measure after SUG-255" caveat, and Quality validation rests on CTL-008, which has no probe. The page would read more confident than its source doc | `governance-coverage.md:6,79,119`; `control-register.md` CTL-008 |
| 4 | **`Vulnerabilities · 0` is a string literal** inside CTL-021's page-wide scope — no date, no source, nothing fails when it stops being true. Structurally identical to the "0 gaps" claim this epic corrects, three sections above it | `GovernancePage.jsx:227` |

**Where it corrected this epic's own judgement**

- `Owned in code` is a softer mechanism claim, not the absence of one. `risk-tiers.md` is not code. Adopting the source doc's phrase *after* Phase 1 measured it false for 14 of 18 is worse than inheriting it unexamined.
- `committed artifacts` covers roughly 7 of the 14. Five rest on **convention** — human discipline a document describes but does not create — and two cite Linear, which is committed nowhere. Phase 1 said "a document, a git property, or a platform guarantee"; the proposed copy compressed three categories into the most flattering one and dropped the register's own word.
- One date was covering two things: today's count and 2026-07-27's status judgements. `counted`, not `derived`, and the status date stated separately.
- On withholding "0 gaps": **ban the phrase, not the number.** Otherwise a future session reads "we do not publish gaps" and omits a real one. The honest rigour statistic is available and measured — **15 of 26 controls have no probe.**
- "CTL-027 makes drift unshippable" is **false**, and this doc said it. CI-only, `[skip ci]` commits are routine, and Netlify publishes regardless of CI (CTL-020). Drift is detectable after publication, not unshippable. The cheap close is `.husky/pre-commit` — the script runs in 0.08s, filesystem-only.

**Proposed copy, held for the rescope** (reviewer's wording, better than this epic's):

```js
{ label: 'Owned here', value: 18, body: '4 backed by validators; 14 by documents and process.' }
```

plus a `Callout` under the tally stating what the command does not prove, and
`kicker="30 components · counted 2026-08-01 by pnpm validate:governance-tally"`.

**Rows the review proposes, held with it:** CTL-021 amended (values only; body copy and kicker
unparsed by anything), **CTL-028** (`governance-coverage.md` status values — `convention`, no
machine can assert a status), **CTL-029** (hero statistics, incl. the hardcoded
`Vulnerabilities · 0`).

**Also found: this doc's own figures were stale.** It said 25 controls and "15 of the 25";
`grep -c "^| CTL-"` returns **26** as of 2026-08-01, because CTL-027 landed in Phase 2 after the
text was written. Corrected above. Same class the epic corrects.

**Phase 3 — Fix the published surface**

- [ ] Recompute `Automated / Documented / Vendor-owned / Out-of-scope` from the Phase 1 mapping
- [ ] Decide the true `Gap` count. **0 remains a legitimate outcome** — but measured, not carried
      forward
- [ ] Update the tally on `/platform/governance` with a measurement date and named source
- [ ] **Fix the `AUTOMATED CHECKS · 18` tile.** It reads "Enforced by code and pre-commit hooks",
      which overstates: only 6 validators run at pre-commit; the rest are CI-only, and CI-only is
      unenforced locally. Flagged in `52a86dbb` and deliberately left
- [ ] Update CTL-021's register row — it currently carries a liveness caveat pending this epic
- [ ] Decide whether the tally should be generated rather than hand-maintained. It is a hardcoded
      array at `GovernancePage.jsx:191` sourced verbatim from markdown, and that copy has already
      drifted once: the page cited v1.1, a version that never existed, while the doc header read
      v1.0 and its changelog ran to v1.2

**Phase 4 — Coverage cross-reference (CTL-026), with the review's required changes**

- [ ] Scan the `Enforced by` column of the six layer tables only, never the whole file
- [ ] Widen the pattern to `/\bCTL-\d+\b/i` once column-scoped, catching `CTL-01`/`ctl-021` typos
- [ ] Allocate **CTL-026** rather than widening CTL-015, so the new probe is cited by a row
- [ ] Dedicated probe, gate string `validate:controls (coverage xref)`, sentinel `CTL-998` —
      not `CTL-999`, which the existing probe already uses
- [ ] State the residual gap in the row and the doc: **dangling IDs only.** An ID that resolves
      but names the wrong control is invisible to it

## Non-Goals

- **Building probes for the 15 unprobed controls.** That is SUG-256 follow-up work already named
  in the control register's §Known coverage gaps. This epic reports the gap honestly; it does not
  close it.
- **Re-measuring anything CI cannot reach.** If a control has no probe, the honest output is
  "unmeasured", not an estimate.
- Redesigning `/platform/governance`. Numbers and their evidence only.

## Technical Constraints

- Any published figure carries a measurement date and a reproducing command.
- A number that cannot be derived from something that ran is not published as if it were.
- Phase 3 touches a rendered page, so the Phase 0 visual-spec gate must be assessed before any
  JSX change — see Pre-Execution Gate below.

## Files to Modify

- `docs/ai/agentic-caucus/governance-coverage.md` (mapping + tally)
- `docs/ai/agentic-caucus/control-register.md` (CTL-021 row) — **gated**
- `apps/web/src/pages/platform/GovernancePage.jsx` (tally array ~:191, kicker ~:319, tile copy)

## Pre-Execution Completeness Gate

- [x] **Background** — from the Linear issue, 2026-07-27
- [x] **Scope** — three phases, sequenced 2026-08-01
- [x] **Audit file paths verified** — `GovernancePage.jsx:191` and `:319` confirmed by `grep -n`;
      `governance-coverage.md` v1.3 confirmed by reading its header
- [x] **Figures measured, not quoted** — 25 control rows, 15 without a probe, 13 gates proven
      live, all measured 2026-08-01 with the commands recorded above
- [ ] **Phase 0 assessment** — Phase 3 changes rendered output on `/platform/governance`. The
      gate's test is "would this change render something a human has not signed off on?" Changing
      numbers and one tile's body copy inside an existing, already-reviewed layout is arguably
      not a new visual format — **but that decision must be recorded before Phase 3 starts**, not
      assumed here
- [ ] **Verification review** — Phase 3 changes a published claim, which CLAUDE.md
      §Verification review makes blocking. Run `verification-reviewer` as a subagent before
      Phase 3

## Acceptance Criteria

- [ ] Every component in the published tally traces to a control, or is shown as having none
- [ ] The claim carries a measurement date and a command that reproduces it
- [ ] The unmeasurable set is stated on the page or in its linked doc, not omitted
- [ ] `AUTOMATED CHECKS · 18`'s body copy matches what actually enforces those checks
- [ ] A named mechanism keeps the mapping current, or a recorded decision says why none is needed

## Risks

- **Publishing a smaller, honest number reads as a regression.** It is not — it is the first
  number with evidence behind it. Say so on the page rather than letting the drop speak.
- **The mapping becomes a third thing that drifts.** Two registries already disagree; a third
  artifact with no maintainer makes it worse. Phase 1's last item exists for this.
- **Scope pull toward building the 15 missing probes.** Explicitly a Non-Goal. Filing them is
  fine; building them here is not.

## Post-Epic Close-Out

1. Visual QA: required if Phase 3 changes rendered output beyond numbers
2. Record before/after tally figures with their commands
3. Move to `docs/shipped/`
4. `/mini-release`
5. Transition SUG-256 to Done in Linear
6. **Incident log:** likely yes. This corrects a published claim found false — the log's stated
   bar. Needs `Introduced` (when "0 gaps" was first published) and `Noticed` (2026-07-27)
