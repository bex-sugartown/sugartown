---
**Epic:** SUG-268 — Governance Data Layer — Phase 1: resolve open decisions + source schema skeleton
**Linear Issue:** [SUG-268](https://linear.app/sugartown/issue/SUG-268/governance-data-layer-phase-1-resolve-open-decisions-source-schema)
**Status:** In Progress — Phase 1 (decisions resolved 2026-08-05; schema code not yet written)
**Priority:** 🟢 Next — high value, ready to pick up
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
---

# SUG-268 — Governance Data Layer

Replace the hand-maintained, regex-parsed governance substrate (`control-register.md`,
`governance-coverage.md`, hardcoded arrays in `GovernancePage.jsx`/`GovernanceDraftPage.jsx`)
with a single structured, schema-validated source that generates all of them — the same
shape as the token pipeline (`tokens/source/tokens.json` → `pnpm tokens:build` → generated
`tokens.css`).

## Background

`docs/briefs/governance-data-layer-prd.md` v1.0 (drafted 2026-08-02, verification-reviewed
the same day — "architecture sound, no redesign required," 3 blockers and 10 gaps returned
and incorporated) specifies this in full. This epic is the first implementing epic against
that PRD; the PRD itself is the spec, not this doc — sections below reference it rather than
restate it.

**Why now:** SUG-256 (closed 2026-08-04) hit four concrete failures in one week while working
this exact substrate by hand: a `|` in a table cell broke a validator's column count, a doc
comment restating a declaration made a parser lock onto prose and drop a tile, a liveness
probe hardcoded a value and whitespace copied from the JSX file it mutates, and a published
statistic (`Vulnerabilities: 0`) sat as a string literal while its derived, dated value
existed unused in `stats.json`. Every failure traces to the same root the PRD names in its
Problem Statement (§2): the data layer is prose, and every consumer reimplements a fragile
parser for it.

**Reference surfaces:** `docs/ai/agentic-caucus/control-register.md` (29 rows),
`docs/ai/agentic-caucus/governance-coverage.md` (30 components), `apps/web/src/pages/platform/GovernancePage.jsx`,
`apps/web/src/pages/platform/GovernanceDraftPage.jsx`, `scripts/validate-governance-tally.js`,
`scripts/validate-control-register.js`.

**SUG-256 Phase 4 is absorbed here**, not built standalone — deferred 2026-08-04 (see
SUG-256's close-out) because the PRD's closed-world `enforcedBy` validation (§5.2, §5.3) is a
strict superset of the regex-scan cross-reference Phase 4 would have built, and adds
retirement protection the scan never had.

## Objective

After this epic's Phase 1: the six Open Decisions in PRD §8 are resolved and recorded, and
`governance/source/*.json` exists with a schema-validated shape for the five entity types
(`control`, `component`, `claim`, `probe`, `crosswalk` — PRD §5.2), plus a first-cut
`pnpm governance:build` that can read source and write *something* to the generated paths
(not yet the full pipeline — that's Phase 2). No existing consumer (`validate-governance-tally.js`,
`validate-control-register.js`, `GovernancePage.jsx`, `GovernanceDraftPage.jsx`) is touched or
retired in Phase 1. This phase is additive and reversible: the old substrate keeps running
untouched until Phase 2+ cut consumers over.

Layers touched: tooling (`scripts/`, new `governance/` directory), documentation (`CLAUDE.md`
Rule File Write Gate scope — PRD §8 decision). Not touched: Sanity schema (PRD §3 Non-Goal —
"Storing governance data in Sanity"), React render surfaces (Phase 1 ships no consumer cutover),
GROQ (none exists for this data).

## Scope

### Phase 1 — Resolve open decisions + source schema skeleton (this Linear issue)

- [x] Resolve PRD §8's six Open Decisions with Bex, in session, before writing schema code —
      layer: process. **Done 2026-08-05** — see §Open Decisions Log. Each has a stated
      recommendation already; confirm or override each:
  1. Source format: JSON vs YAML (PRD recommends JSON)
  2. Framework anchor: six-layer model + NIST AI RMF crosswalk vs AI RMF as primary vs
     dual-publish (PRD recommends keep six-layer + crosswalk)
  3. Gated-file scope: Rule File Write Gate moves from `docs/ai/agentic-caucus/**` to
     `governance/source/**` — requires a CLAUDE.md edit, itself gated
  4. Harness interface for the two-way probe↔gate check: `--list-gates` JSON flag vs a shared
     module both import (regex over harness JS is forbidden either way)
  5. `stats.json` relationship: separate pipeline (PRD recommends, different cadences) vs merge
  6. Rule register (RULE-NNN) migration: in v1 scope or deferred to v2 (PRD recommends defer)
- [x] Record each decision's resolution in this doc's §Open Decisions Log before proceeding — layer: docs. **Done 2026-08-05**
- [x] Define the JSON Schema (or equivalent runtime validator) for the five entities per PRD
      §5.2 field tables — layer: tooling, new `governance/schema/` or equivalent.
      **Done 2026-08-05** — `governance/schema/entities.js` (declarative field specs) +
      `governance/schema/validate.js` (engine: field validation, then closed-world referential
      integrity). Hand-rolled, no dependency, per Decision 1's "zero new dependencies" rationale
      and PRD §9's "plain Node script, no framework" mitigation.
- [x] Stand up `governance/source/` directory with the migrated shape for a *small* seed set
      (not the full 29 controls / 30 components — enough to exercise the schema, e.g. 3–5 of
      each) — layer: tooling. **Done 2026-08-05** — 17 records drawn from the *real* registers,
      not invented: 4 controls (CTL-010, CTL-012, CTL-015, plus CTL-026 as a `reserved` row to
      exercise that variant), 4 components, 3 claims, 3 probes, 3 crosswalk rows.
- [x] First-cut `pnpm governance:build`: reads `governance/source/`, validates against schema,
      writes to a scratch/throwaway location (not the real generated paths yet) — layer: tooling.
      **Done 2026-08-05** — `scripts/governance-build.js`, wired as `pnpm governance:build`.
      Writes only to `.governance-build/` (gitignored). Takes `--source` so the schema can be run
      against a deliberately broken fixture; `--reference-date` and `--out` for the Phase 2 probe.
- [x] `verification-reviewer` subagent review of the schema + build skeleton before Phase 2
      adds real gates, per CLAUDE.md §Verification review (this epic adds validators) —
      layer: process. **Done 2026-08-05** — 4 blockers returned, all reproduced independently
      and closed; see §Verification review above.

### Phase 2 — Generator + structural agreement (not detailed here — see PRD §5.1, §5.3, §10)

Full pipeline: `governance:build` writes real generated `control-register.md`,
`governance-coverage.md` tables/tally, and `apps/web/src/generated/governance.json`.
`governance:diff-clean` guard (regenerate-into-scratch, byte-compare against staged/committed
bytes). `governance:validate` (schema + referential integrity + overdue `nextRead` + outside-source
scan) — CTL-031.

### Phase 3 — Migration (see PRD §5.4)

Migrate the real 29 control rows and 30 components. `scripts/verify-migration.js` byte-compares
against the pinned pre-cutover SHA using the *old* regex parsers as independent verifier. Cutover
is an atomic single-branch merge (PRD §5.4 step 3) — this is a property of the migration step
itself, not a departure from this epic's overall (a) merge-as-you-go cadence: the phase completes
in full before it merges, same as any other phase boundary.

**Two pre-existing register defects are fixed here** (folded in 2026-08-05, Bex's call, rather
than filed as a separate epic — Phase 3 rewrites this file anyway, so fixing them in the
migration avoids touching a gated file twice):

- [ ] **`CTL-026` has no row in `control-register.md`** — the reservation lives only in PRD/epic
      prose and in `governance/source/controls.json`. A first-free-ID computation over the
      register as it stands today would reallocate it. The generated register must emit reserved
      rows, and the migration's count check must include the reservation (PRD §10, US-009) —
      layer: docs (generated), tooling
- [ ] **`CTL-014`'s Bypass cell is stale** — it reads "probes only the 8 gates in `PROBES`".
      `PROBES` now composes 13 static entries plus the runtime `BOUNDARY_PROBES` spread
      (`scripts/validate-enforcement-liveness.js:630`). Re-measure the real number at migration
      time with a command, per CLAUDE.md's "any figure you report carries the command that
      produced it" — do not copy 13 from this line — layer: docs (generated)

### Phase 4 — Consumer cutover + new controls (see PRD §5.3, §11)

`GovernancePage.jsx`/`GovernanceDraftPage.jsx` import `governance.json`. `validate-governance-tally.js`
deleted (§10 success criterion). CTL-027 amended to cover `governance:diff-clean`.
CTL-032 (crosswalk), CTL-033 (`governance:no-literal-stats` lint) added. Netlify build command
runs `governance:validate` (check-only).

*Phases 2–4 are named here for sequencing visibility only. Each gets its own Pre-Execution
Completeness Gate pass at activation — do not treat the one-paragraph summaries above as
sufficient Scope detail to start Phase 2+ from.*

## Acceptance Criteria (Phase 1 only)

- [x] All six PRD §8 Open Decisions have a recorded resolution (owner: Bex) in this doc — **met 2026-08-05**
- [x] `governance/schema/` (or equivalent) validates a conforming seed record for each of the
      five entities and rejects a record with a bad enum value, naming the field — **met
      2026-08-05, proven by deliberate violation, not by inspection.** See §Phase 1 liveness
      evidence below: a broken fixture produced 15 findings, exit 1, each naming entity, record
      and field. The valid seed set exits 0.
- [x] `pnpm governance:build` runs against the seed source set and exits 0 without touching any
      currently-tracked generated file (`control-register.md`, `governance-coverage.md`,
      `GovernancePage.jsx`, `GovernanceDraftPage.jsx` all byte-identical before/after) — **met
      2026-08-05**, `git status --porcelain` returns empty for all four after a build run.
- [x] `verification-reviewer` run recorded — **met 2026-08-05**, in §Verification review of this
      doc. No `control-register.md` row was added and none should be: Phase 1 ships no gate, and
      `validate:controls` cross-references every `enforced-by-code` row's probe against the real
      `PROBES` array, so a CTL-031 row landing before Phase 2's gate and probe would turn CI red.
      The proposed row text is held for Phase 2 to paste in the same commit as the gate.

## Human QA Walkthrough — example local pages

Not applicable — Phase 1 ships no rendered surface, no CSS, no shared component. (Phase 4 will
need this section at its own activation, once `GovernancePage.jsx`/`GovernanceDraftPage.jsx`
are touched.)

## Open Decisions Log

*Filled during Phase 1 activation, before schema code is written. Do not proceed past the
first Scope checkbox until this section has six resolved rows.*

All six resolved 2026-08-05, before any schema code was written. Decisions 1, 2, 3, 5 and 6
are Bex's per PRD §8; decision 4 is assigned to the implementing epic, resolved here on
evidence read from the harness (rationale below the table).

| # | Decision | Resolution | Date | Resolved by |
|---|----------|-----------|------|-------------|
| 1 | Source format | **A — JSON.** Matches the `tokens/source/tokens.json` precedent, no new parser dependency, native Node parsing. Prose-as-string accepted; revisit only if hand-editing friction proves real | 2026-08-05 | Bex |
| 2 | Framework anchor | **A — six-layer model stays primary, plus a machine-readable NIST AI RMF crosswalk.** AI RMF is public and freely citable where ISO/IEC 42001 is paywalled; a full remap would churn shipped content for no reader benefit | 2026-08-05 | Bex |
| 3 | Gated-file scope | **Move at cutover (Phase 3), gating both paths.** `governance/source/**` is added to the Rule File Write Gate and `docs/ai/agentic-caucus/**` is *retained* rather than swapped out, so generated registers cannot be hand-edited unnoticed. The CLAUDE.md edit ships on the cutover branch and is itself gated | 2026-08-05 | Bex |
| 4 | Harness interface | **A — `--list-gates` JSON flag on `validate-enforcement-liveness.js`** | 2026-08-05 | Claude (implementing epic, per PRD §8) |
| 5 | `stats.json` relationship | **A — separate pipelines.** Different cadences: stats is CI-cron, governance is commit-time | 2026-08-05 | Bex |
| 6 | Rule register migration | **Defer to v2.** Different lifecycle (narrative incident records, CLAUDE.md coupling). Revisit at the cutover retrospective, per PRD §12 | 2026-08-05 | Bex |

**Decision 3 note:** gating both paths closes the PRD §9 risk "the Rule File Write Gate
briefly covers neither source nor output during cutover" outright, rather than mitigating it
by sequencing.

**Decision 4 rationale** — read from `scripts/validate-enforcement-liveness.js` (713 lines)
on 2026-08-05, not assumed:

1. `BOUNDARY_PROBES` (line 223) is **computed at runtime** from `Object.keys(SCOPES)`, imported
   from `packages/eslint-config/boundaries.js`. Option B (gate names in a shared static module
   both import) cannot express that without duplicating the derivation, which recreates the
   two-sources-of-truth failure this PRD exists to kill.
2. The final `PROBES` array is composed by spread at line 630 (`...BOUNDARY_PROBES`). Only
   executing the harness's own composition reports the true gate list; any static declaration
   is a second copy that can drift.
3. The harness has **no `process.argv` handling today**, so `--list-gates` is purely additive
   and cannot alter existing invocations.
4. Each probe already carries a `gate: string` field (e.g. `'validate:tokens'`, line 293), so
   the JSON emission needs no new data shape.

This satisfies PRD §5.2's constraint that the two-way probe↔gate check is built against a
machine-readable interface, never regex over the harness source.

## Phase 1 liveness evidence

Per CLAUDE.md's Pre-Execution Gate item *"Enforcement liveness — declared is not effective"*:
proof is a deliberate violation that fails, not a passing run. Phase 1 ships no gate, so this
proves the **schema** rejects, ahead of Phase 2 wiring it into `governance:validate` (CTL-031).

Reproduce:

```bash
node scripts/governance-build.js                      # valid seed  → exit 0
node scripts/governance-build.js --source <fixture>   # broken      → exit 1, 15 findings
```

A fixture breaking ten rule classes at once returned 15 findings, every one naming entity,
record and field:

| Rule class | Finding |
|---|---|
| Bad enum | `control CTL-010.class — "stongly-enforced" is not a valid value — expected one of: enforced-by-code, measured, convention, roadmap` |
| Forbidden field on a `reserved` row | `control CTL-026.bypass — must be absent on this record (status: reserved)` |
| Integer out of range | `component COMP-001.layer — must be <= 6, got 9` |
| Future date | `component COMP-001.statusDate — "2099-01-01" is in the future (reference date 2026-08-05)` |
| Required field missing | `claim CLM-001.measuredAt — is required but missing` |
| Conditional requirement | `probe PRB-001.staticJustification — is required but missing` |
| Bad array item enum | `crosswalk 1.airmfFunctions[1] — "SUPERVISE" is not valid` |
| Dangling reference | `control CTL-015.probeId — cites probe "PRB-999", which does not exist` |
| **Typo form rejected, not skipped** | `component COMP-001.enforcedBy[1] — "ctl-015" matches no recognized form — expected a CTL-NNN id or an "artifact:<path>" entry` |
| Missing artifact path | `component COMP-001.enforcedBy[2] — names artifact path "docs/does-not-exist.md", which does not exist on disk` |
| Retirement protection (both directions) | `component COMP-001.enforcedBy[3] — cites CTL-015, which is retired` and `control CTL-015.status — is retired but still cited by: COMP-001` |

The typo-form row is the one that matters most: PRD §5.3 makes closed-world rejection the
condition on which SUG-256 Phase 4's absorption is a strict superset of the regex scan it
replaces. A `ctl-015` that merged silently would break that claim.

### Verification review — 4 blockers returned, all closed 2026-08-05

Run as a subagent per CLAUDE.md §Verification review, against the schema and build
skeleton. Verdict: *"the schema design is sound and does not need redesign,"* with 4
blockers scoped to Phase 2 gate-readiness. Every blocker was reproduced independently
before being accepted, and every fix is proven by the command shown.

The review's framing correction is the most valuable thing it returned, and it is now
the rule this pipeline is built on:

> PRD §3's determinism goal binds **generated output bytes**, not the validator's
> comparison reference. A wall-clock read for a validation-only comparison breaks
> nothing, *provided the date is never written into output*.

Phase 1 had that backwards — it avoided the clock, then wrote the reference date into the
artifact, realising PRD §9's named High risk (*"a non-deterministic generator turns
diff-clean into a flake, then normalized into being ignored"*).

| # | Blocker | Fix | Proof |
|---|---|---|---|
| B1 | `--reference-date garbage` disabled every not-in-the-future check while the banner reported it as configured — the same silent-pass class this epic exists to kill, through a second door | Reference is ISO-validated before use; an unusable one aborts the build | `node scripts/governance-build.js --reference-date garbage` → exit 1 |
| B2 | The git-unavailable path printed *"This is not a pass"* and then **exited 0**. A gate reads the exit code, not the prose above it | Refuses to validate rather than reporting an unearned pass | git removed from `PATH` → exit 1 |
| B3 | `referenceDate` was written into the artifact, so identical source hashed differently on different days | Removed from output; records additionally sorted by ID so array order in source cannot affect output bytes | Two runs, reference dates `2026-08-05` and `2026-12-31`, produce byte-identical output (sha256 `8a18d2de…`) |
| B4 | `governance:*` sits outside the `validate:*` prefix that `validate:validators` and `validate-control-register` use to auto-discover gates, so a deleted CI step or missing register row would go undetected | **Decision:** Phase 2's gate is named `validate:governance`, not `governance:validate`. `governance:build` keeps its name — it is a build, matching `tokens:build` and `registry:build`, and builds are correctly outside the gate net | `scripts/validate-validators.js:63`, `scripts/validate-control-register.js:176` both filter on `startsWith('validate:')` |

Gaps also closed in the same pass, each proven by an adversarial fixture:

- **`ref`/`refStatus` were declared on two fields and read by nothing** — an inert control inside the tool built to eliminate inert controls. The engine now resolves `ref` generically from the field spec, and the hand-coded duplicates are gone.
- **`artifact:` paths accepted anything `existsSync` liked**: absolute paths, traversal that escaped and re-entered, directories, and wrong-case spellings. The case one was the sharpest — macOS is case-insensitive and Linux CI is not, so `DOCS/…` passed pre-commit and would have failed CI on identical bytes. Canonical form is now enforced via `realpathSync.native`.
- **`probe.gate` had no uniqueness constraint** despite being the join key for Phase 2's two-way probe↔harness check. Added now; it would need a migration later.
- **Reserved control rows accepted `noProbeReason` and `nextRead`**, against PRD §5.2's "reserved rows carry only `id`, `status`, `reservedFor`".
- **Claims could cite a retired control.** Retirement protection previously covered `component.enforcedBy` only.
- **`2026-02-30` was accepted** — `Date.parse` rolls invalid days forward. Now round-tripped.

Two items deliberately **not** fixed in Phase 1, both recorded rather than silently carried:

- **`claim.command` existence check** (PRD §5.2). It is a `governance:validate` behaviour, not a shape rule, so it belongs to Phase 2 — on two conditions the reviewer set and this doc adopts: it enters the CTL-031 fixture, and the seed's three commands all resolve today, which they do.
- **A pre-commit timing flake.** HEAD is the *parent* commit inside a pre-commit hook, so the day's first commit adding a record dated today would fail. Phase 2 must pass an explicit `--reference-date` in the hook rather than relying on the HEAD default.

The reviewer also flagged, about the **existing** register rather than this epic: `CTL-026` has no row in `control-register.md`, so a first-free-ID computation over that table today would reallocate it. Its `reserved` record now exists in `governance/source/controls.json`, but the reservation is only load-bearing once the register is generated from source (Phase 3). Proposed CTL-031 row text is held in the reviewer's report and is deliberately **not** pasted into the register — `validate:controls` cross-references every `enforced-by-code` row's probe against the real `PROBES` array, so pasting before Phase 2 lands the gate would turn CI red.

### Defect found and fixed during Phase 1

The first implementation derived the not-in-the-future reference date from the newest date in
source. That was wrong twice over: `nextRead` values are legitimately in the future, so the
maximum sat ahead of every real measurement; and a reference drawn from the data under test
always passes its own newest record. The check rendered as configured while catching nothing —
precisely the failure class this pipeline exists to kill, reproduced inside the tool built to
kill it.

Now: HEAD's committer date (`git show -s --format=%cs`), deterministic per commit and external
to the records. When git is unavailable the check is **skipped loudly** rather than run against
a fabricated reference, on the same principle as `validate:epic-docs`'s "This is NOT a pass".

## Phase 1 close-out

**Data pipeline gap check (close-out step 5) — gap is open and stated.**

`pnpm governance:build` is a new build-time pipeline, and **no real data has flowed through
it**. What exists today:

| | |
|---|---|
| What the source holds | A **17-record seed**: 4 controls, 4 components, 3 claims, 3 probes, 3 crosswalk rows |
| What the real substrate holds | **29 control rows** (`control-register.md`) and **30 components** (`governance-coverage.md`) |
| Seed provenance | Drawn from the real registers (CTL-010, CTL-012, CTL-015, CTL-026), not invented — but a deliberately small subset chosen to exercise the schema |
| What produces real data | Phase 3's migration, verified by `scripts/verify-migration.js` against a pinned pre-cutover SHA using the *old* regex parsers as independent verifier |
| CI status | The pipeline runs in **no CI job**. Phase 1 wires nothing; `validate:governance` is Phase 2 |
| Expected shape once migrated | Same five entity files, same schema, ~59+ records instead of 17 |

Nothing consumes this output. `.governance-build/governance.snapshot.json` is gitignored scratch,
explicitly labelled "not a consumer contract" in its own `_note` field.

**Close-out steps not applicable, with reasons:**

| Step | Status |
|---|---|
| 2 · Schema deploy | N/A — no `apps/studio/schemas/` change; Sanity is a PRD §3 Non-Goal |
| 3 · Visual QA gate | N/A — Phase 1 ships no rendered surface, no CSS, no component |
| 4 · Chromatic | N/A — no visual output to diff |
| 6 · `docs/shipped/` move | **Does not apply** — this doc owns Phases 2–4 and stays in `docs/backlog/` |
| 8b · Incident log | **No incident.** The defects fixed this phase were in code written this phase; nothing already shipped was found broken. The two register defects below are pre-existing but are being fixed in Phase 3, not here |

**Deferred to `/eod` (Bex's call, 2026-08-05):** close-out steps 1b (CI run ID), 7 (mini-release)
and 8 (Linear → Done). Pushing mid-session triggers a Netlify deploy, and step 1b needs a *named*
green CI run rather than an assertion — so the 5 commits batch to `/eod`, and Phase 1 formally
closes when that run is green and recorded here.

**Friction line (step 3b):** what cost a correction commit this time — **a determinism
requirement applied to the wrong artifact.** PRD §3 binds generated output bytes; I read it as
binding the validator's comparison reference, which produced a reference date derived from the
data under test, then that same date written into the output. Both were caught by the
verification review, not by me, and both are the failure class this epic exists to eliminate.

### Findings ledger

| Finding | Destination | Artifact |
|---|---|---|
| `claim.command` existence check unimplemented (PRD §5.2) | SUG-268 Phase 2 | §Verification review, with the reviewer's two conditions adopted |
| Pre-commit HEAD-is-parent date flake | SUG-268 Phase 2 | §Verification review — Phase 2 passes `--reference-date` explicitly |
| `governance:*` outside `validate:*` auto-discovery | Decided in Phase 1 | Phase 2's gate is named `validate:governance`; recorded as B4 |
| PRD §5.2 claim table omits `value`/`statsKey`, contradicting §3 and US-005 | **Open — needs Bex** | Fields added to `entities.js` with an inline note; the PRD itself is unedited |
| `CTL-026` has no `control-register.md` row | SUG-268 Phase 3 | Scope line added above |
| `CTL-014` bypass cell says "8 gates", now stale | SUG-268 Phase 3 | Scope line added above |
| Duplicate CTL id inside one `enforcedBy` array is accepted | Decided against fixing | Redundant, not incorrect; generated output dedupes at render. Recorded rather than silently skipped |
| SUG-269 lacked a backlog doc + priority row, would have failed `validate:epic-docs` | Cancelled 2026-08-05 | Scope absorbed into `docs/backlog/SUG-177-*.md` |

## Technical notes

- **Instruction & Rule File Write Gate**: Open Decision 3 (gated-file scope move) requires a
  CLAUDE.md edit. Per CLAUDE.md's own gate, show the exact diff from a scratch copy and get
  explicit approval before writing it — even though this epic doc authorizes the change in
  principle, epic approval is not diff approval.
- **Verification review**: this epic adds validators/gates in Phase 2+ (CTL-031 etc.), so
  CLAUDE.md §Verification review fires before each is built, run as a subagent, not inline.
  Phase 1 itself ships no gate but reviews the schema design ahead of that, per the Scope item
  above.
- **No schema changes owned by other epics, no Sanity, no new tokens, no new routes** — PRD §9
  dependency check, reconfirmed here.
- **Upstream**: SUG-256 (Done) — this epic's Background section names exactly what SUG-256's
  build surfaced. SUG-262 (`validate:epic-docs`) is unrelated but touches the same
  `docs/backlog/` parity concern; no blocking relation.
- **Activation audit**: before Phase 1 begins, re-read `docs/briefs/governance-data-layer-prd.md`
  §5.2 in full (field tables) — do not work from this doc's summary of it, which is deliberately
  abbreviated.

## Model & Mode [REQUIRED]

`/model opus` with plan mode (Shift+Tab) for the Pre-Execution Gate — this is a schema/architecture
epic (new data-layer design, six unresolved decisions with real tradeoffs, a generator pattern
copied from but not identical to the token pipeline). Exit plan mode to execute once the Open
Decisions Log is filled and the Pre-Execution Completeness Gate passes.

## Non-Goals

- **Building probes for the 15 unprobed controls** — unchanged from SUG-256's own Non-Goal,
  carried through the PRD (§3) and here
- **Redesigning `/platform/governance` or the draft page** — display decisions come after the
  data layer exists, per PRD §3
- **Storing governance data in Sanity** — PRD §3: controls version with the code they describe
- **A UI for editing governance data** — PRD §3: editors are Bex and agent sessions in-repo
- **Migrating the real 29/30 records in Phase 1** — that's Phase 3; Phase 1 uses a small seed
  set to exercise the schema without the migration's own verification machinery
- **Cutting over any consumer in Phase 1** — `validate-governance-tally.js`,
  `validate-control-register.js`, and both `GovernancePage`/`GovernanceDraftPage` keep running
  on the existing hand-maintained files until Phase 4

## Related

- **Linear:** [SUG-268](https://linear.app/sugartown/issue/SUG-268)
- **PRD (full spec):** `docs/briefs/governance-data-layer-prd.md`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer
  Checklist, Schema Enum Audit, and Files to Modify at Phase 1 activation
- **Predecessor:** `docs/shipped/SUG-256-governance-tally-measured-liveness.md` (once moved
  from backlog at its own close-out) — names the four concrete failures motivating this epic
