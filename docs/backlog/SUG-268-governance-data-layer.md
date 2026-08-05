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
- [ ] Define the JSON Schema (or equivalent runtime validator) for the five entities per PRD
      §5.2 field tables — layer: tooling, new `governance/schema/` or equivalent
- [ ] Stand up `governance/source/` directory with the migrated shape for a *small* seed set
      (not the full 29 controls / 30 components — enough to exercise the schema, e.g. 3–5 of
      each) — layer: tooling
- [ ] First-cut `pnpm governance:build`: reads `governance/source/`, validates against schema,
      writes to a scratch/throwaway location (not the real generated paths yet) — layer: tooling
- [ ] `verification-reviewer` subagent review of the schema + build skeleton before Phase 2
      adds real gates, per CLAUDE.md §Verification review (this epic adds validators) —
      layer: process

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
- [ ] `governance/schema/` (or equivalent) validates a conforming seed record for each of the
      five entities and rejects a record with a bad enum value, naming the field
- [ ] `pnpm governance:build` runs against the seed source set and exits 0 without touching any
      currently-tracked generated file (`control-register.md`, `governance-coverage.md`,
      `GovernancePage.jsx`, `GovernanceDraftPage.jsx` all byte-identical before/after)
- [ ] `verification-reviewer` run recorded in `docs/ai/agentic-caucus/control-register.md`
      (no new row yet — Phase 1 ships no gate — but the review itself is recorded per CLAUDE.md
      §Verification review, ahead of Phase 2 adding CTL-031)

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
