---
**Epic:** SUG-268 — Governance Data Layer
**Linear Issue:** [SUG-268](https://linear.app/sugartown/issue/SUG-268/governance-data-layer) — one issue covers all four phases (retitled 2026-08-05, per CLAUDE.md §Multi-phase: phases are execution units, not work items)
**Status:** In Progress — **Phase 1 complete and merged** (2026-08-05, CI 31026674863 green). Phases 2–4 outstanding.
**Priority:** 🟢 Next — high value, ready to pick up
**Merge strategy:** (a) Merge-as-you-go — each phase merges to `main` on completion. One mini-release for the epic, at Phase 4.
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

### Phase 1 — Resolve open decisions + source schema skeleton ✅ COMPLETE 2026-08-05

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

### Phase 2 — Gates, against the seed only (activated 2026-08-06)

**Scope redrawn at activation**, after a `verification-reviewer` run returned 7 blockers against
the original one-paragraph summary. Full findings and reproductions: §Phase 2 verification review
below. The headline: writing the real `control-register.md` from source *is* the migration, so
the original Phase 2 and Phase 3 were mutually inconsistent. Phase 2 now builds and proves the
gates against the 17-record seed and one new tracked artifact; Phase 3 owns every write to an
existing consumer path.

Phase 2 writes **no** file under `docs/ai/agentic-caucus/`. That is deliberate and has a second
benefit: Decision 3's Rule File Write Gate scope move stays a Phase 3 concern, with no interval
in which the generator writes a gated path before the CLAUDE.md edit lands.

- [x] **Generator writes `apps/web/src/generated/governance.json` only** — a new artifact no
      consumer reads until Phase 4, so regenerating it destroys nothing. The two Markdown
      registers stay hand-maintained until Phase 3. Generator owns pipe-escaping now, though
      nothing exercises it until Phase 3 — layer: tooling
- [x] **Un-ignore the output path.** `.gitignore:76` ignores `apps/web/src/generated/`, so
      `governance.json` cannot be staged or committed and the diff-clean check would have nothing
      to compare against, passing vacuously forever. Add a `!` negation for this one file, in the
      same commit as the generator. Unlike `stats.json`, which survives being ignored only because
      Vite regenerates it every build, this is a commit-time pipeline (Decision 5) — a clean clone
      would have no file at all — layer: tooling
- [x] **`validate:governance-diff`** (regenerate into scratch, byte-compare) — **renamed** from
      the PRD's `governance:diff-clean`. Under a `governance:` prefix it is invisible to both
      `validate-validators.js:63` and `validate-control-register.js:176`, so deleting its
      pre-commit line and its CI step leaves every meta-check green while the probe still reports
      it live. B4's "builds sit outside the gate net" reasoning covers `governance:build`; this is
      a gate, not a build — layer: tooling
- [x] **Diff-clean compares against the index, not the working tree.** Materialise the staged
      state into scratch (`git checkout-index`, or `git ls-files -s` + `git cat-file`) and build
      from that. Building from the worktree and comparing against the index passes when the
      generated output is staged and its source is not, committing output that does not
      correspond to committed source. Handle three cases explicitly: output staged without source,
      source staged without output, output deleted — layer: tooling
- [ ] **`validate:governance`** — schema + closed-world referential integrity + overdue
      `nextRead` + outside-source scan + the two-way probe↔harness check. CTL-031 — layer: tooling
- [x] **Fix `validate-control-register.js`'s completeness check to delimited-token matching.**
      It currently does `blob.includes(name)` (`:267-276`), so `validate:governance` is satisfied
      by CTL-027's existing `validate:governance-tally` cell and the new gate could ship with no
      register row at all. `validate-validators.js:74-78` already matches correctly; copy that.
      This is a change to a shared meta-check, so it lands with its own probe proving the masked
      case now fails — layer: tooling
- [ ] **Seed all 16 probe records before the two-way check goes blocking.** The harness composes
      12 static `gate:` literals plus 4 `BOUNDARY_PROBES` from `Object.keys(SCOPES)`;
      `governance/source/probes.json` holds 3. The check as specified fails 13 times on a clean
      tree, and because `gateProbe`'s control run reads a non-zero exit, CTL-031 would report
      `PROBE INVALID` and take the whole liveness job red — reporting an unverified gate rather
      than a missing record. Probe records are four fields; seeding them here is cheap — layer: tooling
- [ ] **`--list-gates` JSON flag on `validate-enforcement-liveness.js`, spawned as a subprocess,
      never imported.** `main()` runs at module scope and calls `process.exit`, so importing it
      inside a pre-commit hook would execute all 16 probes, mutating `package.json`,
      `control-register.md`, `globals.css` and `GovernanceDraftPage.jsx` and deleting a backlog
      doc. The flag short-circuits before `main()`. The consuming check asserts a non-empty list:
      an empty array would make the harness→record direction pass vacuously — layer: tooling
- [ ] **`claim.command` existence check, with a closed-world runner list.** PRD §5.2's algorithm
      ("first token resolves to a `package.json` script or an existing repo path") rejects all
      three seed claims, whose first token is `pnpm`. Enumerate runner prefixes
      (`pnpm`/`npm`/`npx`/`node`/`bash`/`sh`/`git`/`curl`) and check the next token; an
      unrecognised first token is an error, never a skip. CTL-031's fixture carries a claim whose
      command does not resolve — layer: tooling
- [ ] **Two date references with distinct semantics.** `--reference-date` drives the
      not-in-the-future checks. Overdue `nextRead` needs wall-clock today, because it is the decay
      catcher (`validate-control-register.js:184-188` reads `new Date()` on purpose). One flag
      driving both would let the pre-commit `--reference-date` suppress overdue detection. Also
      decide how an overdue date reports, since a clean-tree exit 1 currently surfaces as
      `PROBE INVALID` — layer: tooling
- [ ] **Outside-source scan, specified against silent-no-match.** Fail if the scanned corpus is
      zero files; fail if any allowlist entry resolves to no existing file; anchor paths on
      `resolve(__dirname, '..')`, never `process.cwd()`; report the file count scanned. The probe
      injects into a scanned, non-allowlisted file and asserts the **message**, not just the exit
      code. This is the Phase 2 item most likely to ship matching nothing, which is this epic's
      founding failure class — layer: tooling
- [ ] **Register rows: CTL-031 and CTL-034**, committed with their gates. **CTL-027 is not
      amended in Phase 2** — `validate:governance-tally` stays in `package.json` until Phase 4, so
      rewriting its Control cell now would leave no row naming that script and turn CI red.
      Allocate CTL-034 for `validate:governance-diff`; amend and retire CTL-027 at Phase 4, in the
      same commit that deletes the script — layer: docs, tooling
- [x] **Two one-line corrections, since both files are open anyway:**
      `validate-control-register.js:280` reads `probeGates.size` on a `{gates, prefixes}` object
      and publishes `undefined probes in the liveness harness` — a control misreporting its own
      coverage. And this doc's Phase 3 scope line below said "13 static entries"; measured, it is
      12 static and 16 total — layer: tooling, docs

**Deferred out of Phase 2, recorded rather than dropped:**

- `claim.statsKey`'s "must resolve in `stats.json`" is declared in PRD §5.2 and enforced by
  nothing (`governance/schema/entities.js:117-122`) — a declared rule read by nothing, inside the
  pipeline built to kill declared rules read by nothing. `stats.json` is itself gitignored and
  regenerated per build, so resolution is machine-dependent. Decide at Phase 3 with the migration,
  or state the deferral with a date.
- Seed record **CLM-003** is internally incoherent: `value: "0 known vulnerabilities"` against
  `statsKey: security.vulnerabilities`, which resolves to an object rather than a scalar, with an
  unrelated `command`. Fix during Phase 3's migration when real claims land.
- **US-007's crosswalk completeness** ("maps each layer") is unenforced; `crosswalk.json` covers
  layers 1, 2 and 6 of 6. Add the check with the real records in Phase 3.

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
      Measured 2026-08-06: **12** static `gate:` literals plus **4** `BOUNDARY_PROBES` derived
      from `Object.keys(SCOPES)` = **16** runtime gates. Re-measure at migration time rather than
      copying 16 from this line, per CLAUDE.md's "any figure you report carries the command that
      produced it" — layer: docs (generated)

      ```bash
      node -e "const s=require('fs').readFileSync('scripts/validate-enforcement-liveness.js','utf8');console.log((s.match(/gate:\s*'[^']+'/g)||[]).length)"
      node --input-type=module -e "import {SCOPES} from './packages/eslint-config/boundary-rules.js';console.log(Object.keys(SCOPES).length)"
      ```

      *This line previously read "13 static entries", uncommanded, inside its own instruction not
      to copy figures. Corrected 2026-08-06 by the Phase 2 verification review.*

- [ ] **The real-path write, moved here from Phase 2** (2026-08-06). `governance:build` begins
      generating `control-register.md` and `governance-coverage.md` tables/tally at their existing
      paths. This is the same operation as the migration and cannot precede it: regenerating from
      the 17-record seed would delete 25 of the register's 29 rows, after which `validate:controls`
      errors once per `validate:*` script with no row, and CTL-013's CI-red issue is the only thing
      that notices — after Netlify has deployed `main` (CTL-020). Decision 3's Rule File Write Gate
      scope move lands on this same branch — layer: tooling, docs (generated)

**One field decision rides with the migration** (added 2026-08-06, external prior art — see
§External prior art below):

- [ ] **Decide whether entities carry an SDLC `stage` (`design | implementation | runtime`), and
      if adopted, land it in this migration rather than after it.** Cloudflare names stage
      metadata as their own next step, for scoping which statements an agent loads at a given
      lifecycle point. The argument is cost asymmetry, not certainty: one field while 59 records
      are already being rewritten, versus a second migration later — layer: tooling

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
by sequencing. Reinforced 2026-08-06: Phase 2 now writes no file under
`docs/ai/agentic-caucus/`, so there is no interval in which the generator writes a gated path
before the CLAUDE.md edit lands.

### Phase 2 activation decisions (2026-08-06)

Taken at Phase 2 activation, before any code. Decisions 7 and 8 are Bex's; 9 and 10 follow from
the verification review's reproduced findings and are recorded here rather than left in a session.

| # | Decision | Resolution | Date | Resolved by |
|---|----------|-----------|------|-------------|
| 7 | Does `class` conflate strength, blocking behaviour and mechanism? | **Keep one enum for v1.** The two-axis split buys a soak period between "flagged" and "blocking"; a single human and her agents do not need that runway. Revisit at the cutover retrospective with the deferred RULE-NNN question | 2026-08-06 | Bex |
| 8 | PRD says `governance:validate` 13×; B4 renamed it `validate:governance` | **Keep `validate:governance`; bump the PRD to v1.2** to match. The `validate:` prefix is what `validate:validators` and `validate-control-register` auto-discover on | 2026-08-06 | Bex |
| 9 | Phase 2 vs Phase 3 boundary | **Phase 2 builds gates against the seed; every write to an existing consumer path moves to Phase 3.** Writing the real register from source is the migration, and no intermediate state has both the generator and `validate:controls` correct | 2026-08-06 | Bex |
| 10 | `validate:governance` masked by substring match | **Fix the check, not the name.** `validate-control-register.js:267-276` uses `blob.includes()`, so any gate whose name prefixes another is silently exempt. The weakness is general; the fix lands with its own probe | 2026-08-06 | Bex |

**Decision 8 caveat, found after the fact:** the rename alone does not achieve what B4 chose it
for. `'validate:governance-tally'.includes('validate:governance')` is `true`, so CTL-027's
existing row satisfies the completeness check for the new gate. Decision 10 is what actually
closes it. B4 was right about the prefix and wrong to treat the rename as sufficient.

### Phase 2 verification review — 7 blockers, scope redrawn

Run as a subagent 2026-08-06 per CLAUDE.md §Verification review, against the proposed Phase 2
design **before any code**. Verdict: *"The plan does not clear the verification gate."* Every
load-bearing finding was reproduced independently before being accepted, per the discipline
Phase 1 set.

| # | Blocker | Reproduced | Resolution |
|---|---|---|---|
| B1 | `validate:governance` is masked by `validate:governance-tally` in the register completeness check, so the gate could ship with no row and `validate:controls` stay green | `'validate:governance-tally'.includes('validate:governance')` → `true`; CTL-027's row confirmed at `control-register.md:72` | Decision 10 — fix the check to delimited-token matching, with its own probe |
| B2 | `apps/web/src/generated/` is gitignored, so `governance.json` can never be staged and diff-clean has nothing to compare against | `git check-ignore -v` → `.gitignore:76` | Phase 2 scope — `!` negation for the one file, same commit as the generator |
| B3 | Pre-commit diff-clean builds from the worktree and compares against the index: staging the output without its source is a false pass | design read; the failing sequence is stated in the scope item | Phase 2 scope — materialise the index into scratch and build from that |
| B4 | Phase 2's real-path write and Phase 3's migration are the same operation; doing the first from a 17-record seed deletes 25 of 29 register rows | 29 rows vs 4 source records, both measured | Decision 9 — real-path write moved to Phase 3 |
| B4a | Amending CTL-027 in Phase 2 leaves no row naming `validate:governance-tally`, which stays in `package.json` until Phase 4 → CI red | same `blob.includes` loop over the register | Phase 2 scope — allocate CTL-034; amend and retire CTL-027 at Phase 4 |
| B5 | The two-way probe↔harness check fails 13 times on a clean tree and misreports as `PROBE INVALID`, taking the liveness job red for a working gate | 12 static `gate:` literals + 4 `SCOPES` keys = 16 runtime gates; `probes.json` holds 3 | Phase 2 scope — seed all 16 probe records before the check goes blocking |
| B6 | `governance:diff-clean` sits outside the `validate:` prefix, so unwiring it from pre-commit and CI leaves both meta-checks green while the probe still reports it live | `validate-validators.js:63`, `validate-control-register.js:176` | Phase 2 scope — renamed `validate:governance-diff` |
| B7 | `claim.command`'s specified algorithm rejects all three seed claims | ran the algorithm over `claims.json`: every first token is `pnpm`, neither a script nor a path | Phase 2 scope — closed-world runner-prefix list; unrecognised token is an error |

**B7 is the one worth naming plainly.** Phase 1's close-out recorded this check's deferral
condition as *"the seed's three commands all resolve today, which they do."* That was asserted,
not run. A claim about verification, published in the epic that exists to stop claims being
published without verification, one day after the phase that recorded it.

Non-blocking gaps also returned and folded into the scope above: silent-no-match risk in the
outside-source scan, the two-date-semantics collision, `--list-gates` needing a subprocess rather
than an import, the empty-gate-list floor, `claim.statsKey` declared and unenforced, CLM-003's
incoherence, and US-007's unenforced crosswalk completeness.

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

**Step 1b — route smoke tests + CI: satisfied 2026-08-05.** Run
[31026674863](https://github.com/bex-sugartown/sugartown/actions/runs/31026674863) concluded
`success` on `a9c516e0`, the merge commit carrying all of Phase 1. A named run, not an
assertion that CI is green.

Reproduce: `gh run list --branch main --workflow CI --limit 1 --json databaseId,conclusion`

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
| PRD §5.2 claim table omits `value`/`statsKey`, contradicting §3 and US-005 | Closed 2026-08-05 | PRD bumped to v1.1 with both fields specified; `entities.js` comment now cites it |
| `CTL-026` has no `control-register.md` row | SUG-268 Phase 3 | Scope line added above |
| `CTL-014` bypass cell says "8 gates", now stale | SUG-268 Phase 3 | Scope line added above |
| Duplicate CTL id inside one `enforcedBy` array is accepted | Decided against fixing | Redundant, not incorrect; generated output dedupes at render. Recorded rather than silently skipped |
| SUG-269 lacked a backlog doc + priority row, would have failed `validate:epic-docs` | Cancelled 2026-08-05 | Scope absorbed into `docs/backlog/SUG-177-*.md` |
| `class` may be conflating requirement strength, blocking behaviour and enforcement mechanism | SUG-268 Phase 2 | Scope line added above; source in §External prior art |
| Entities carry no SDLC `stage`; one field during migration vs a second migration after | SUG-268 Phase 3 | Scope line added above; source in §External prior art |
| `apps/web/.env.local.example` documents a mechanism that does not work | One-commit doc fix, **not SUG-268 scope** | §Local environment hazard below — evidence recorded, fix unassigned |
| Env vars in `~/.zshrc` are invisible to non-interactive shells, which is what husky hooks are | SUG-268 Phase 2 | §Local environment hazard below — second pre-commit hazard, alongside the HEAD-is-parent flake |

### Local environment hazard

*Recorded 2026-08-06 after `validate:epic-docs` was found skipping locally for a day. Both rows
above are evidence-complete; neither is a governance-data-layer design defect, and the first is
not this epic's to fix.*

**`apps/web/.env.local.example` is wrong.** It instructs the reader to put `LINEAR_API_KEY` in
`apps/web/.env.local` to "collect live data locally". That value reaches neither consumer.
`scripts/validate-epic-docs.js` imports `collectLinear`, which reads `process.env.LINEAR_API_KEY`
directly (`apps/web/scripts/stats/linear.js:84`); nothing in that path loads a `.env` file, and
`dotenv` is not a dependency of this repo. The dev-server path is the same: `statsPlugin` spawns
the collector with `spawnSync(..., { cwd, stdio: 'inherit' })` and no `env` option
(`apps/web/vite.config.js:90`), so the child inherits the Vite process's environment, and Vite
does not write `.env` values into `process.env`.

Proven by three runs on 2026-08-06, not by reading the code:

| Test | Setup | Result |
|---|---|---|
| A | `.env.local` present with a dummy key, standalone `node scripts/collect-stats.js` | `LINEAR_API_KEY not set — using last-good data` |
| B | Same `.env.local`, collector spawned by Vite | Live fetch succeeded — so the dummy was **not** what it used |
| C | `.env.local` **deleted**, collector spawned by Vite | Live fetch still succeeded — proving the key came from the shell, never the file |

A dummy value was used throughout; no real credential was handled. The distinguishing signal is
that `collectLinear` warns and returns without a network call when the var is absent, but throws
on Linear's response when it is present and invalid, so the two states cannot be confused.

**What actually works** is a shell-level export, which is how `CHROMATIC_PROJECT_TOKEN` was
already being supplied.

**The Phase 2 half.** The export lives in `~/.zshrc`, which zsh sources for *interactive* shells
only. A login+interactive `zsh -lic` sees the variable; a non-interactive shell does not. Husky
pre-commit hooks run non-interactively. This is not biting today — `validate:epic-docs` is wired
to CI only (`.github/workflows/ci.yml:103`), never to `.husky/pre-commit`, and CI supplies the
value from `secrets.LINEAR_SUGARTOWN_STATS`. It becomes live the moment any env-dependent gate is
added to pre-commit. Phase 2 adds `validate:governance` to pre-commit, so the check is: if that
gate ever reads an env var, it must fail loudly on absence rather than skip, and `~/.zshenv`
(sourced by all shells, and currently absent on this machine) is the file that would carry it.

This is the same failure class the epic exists to close, arriving through the environment rather
than the data: a check that reported as configured and examined nothing. Its own output said so
plainly — *"This is NOT a pass"* — which is why it cost a morning and not three months.

### External prior art

**Cloudflare, "How Cloudflare enforces engineering standards using AI," 2026-08-04**
(`https://blog.cloudflare.com/engineering-standards-enforcement/`), read 2026-08-05, one day
after Phase 1 merged. Their Codex is the same architecture this epic is building: normative
statements extracted from prose into structured JSON with stable per-statement IDs that survive
edits to their source document, consumed by review agents and published to a generated site.
Independently arrived at. It is the reason the two scope items above exist.

Confirms, needing no action: JSON over Markdown for the source (they started in Markdown and
moved, for filterability); stable IDs as the join key for tracking a statement across systems
over time; mechanically-checkable rules going to linters while the rest go to LLM review, which
is `enforced-by-code` vs `convention`; and a review agent that runs outside the authoring
session, which is `verification-reviewer`'s rationale.

**Does not transfer:** their RFC review rounds, domain-owner model, and internal publication
site are large-org shapes with no analogue here.

**Not evidence this design works.** Their post reports throughput — violations flagged, merges
blocked — not whether a blocked merge should have been blocked, and none of it was measured
against this repo. Treating convergent design as verification would reproduce the error
`docs/drafts/node-outline-the-fire-alarm.md` documents. The only local evidence remains the
Phase 1 liveness evidence above: a broken fixture, a non-zero exit code, 17 records.

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
