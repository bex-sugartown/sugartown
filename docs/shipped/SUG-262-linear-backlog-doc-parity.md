---
**Epic:** SUG-262 — Linear ↔ backlog doc parity (backfill 6 orphans + `validate:epic-docs`)
**Linear Issue:** [SUG-262](https://linear.app/sugartown/issue/SUG-262/linear-backlog-doc-parity-backfill-6-orphaned-issues-validateepic-docs)
**Status:** Done — shipped 2026-08-04. Phases 1–2 complete; CTL-024 flipped to
`enforced-by-code` after the first real CI run proved it live and found 10 more real
orphans (see §Round 2), backfilled the same day, second CI run green.
**Priority:** 🟢 Next — CLAUDE.md §Scope creep is discipline until this validator exists
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
---

# SUG-262 — Linear ↔ backlog doc parity

Backfill the six live Linear issues that have no backlog doc, then add the validator that
stops it recurring.

## Background

`/new-epic` is the only path that produces a `docs/backlog/SUG-{N}-*.md` stub and a
priority-stack row. It is invoked at the start of an epic, never mid-epic when a finding
spawns a new issue. Between 2026-07-27 15:54 and 2026-07-28 12:44, six issues were spun
off mid-epic and none got either artifact:

| Issue | Status | Doc | Priority row |
|---|---|---|---|
| SUG-249 | Backlog | ❌ | ❌ |
| SUG-256 | In Progress | ❌ | ❌ |
| SUG-257 | Todo | ❌ | ❌ |
| SUG-258 | Todo | ❌ | ❌ |
| SUG-259 | Backlog | ❌ | ❌ |
| SUG-260 | Backlog | ❌ | ❌ |

Measured 2026-07-29 by direct file check, not inferred. In the same window, the six issues
created *via* `/new-epic` (SUG-250 through SUG-255) all got both.

Two consequences already landed:

1. **SUG-256 shipped out-of-scope work.** Its Linear scope is "re-derive the GovernancePage
   coverage tally". What shipped under its banner is a verification-review framework, a
   control register, an instruction style guide and a SUG-243 rescope. The `[Unreleased]`
   CHANGELOG line describes the framework. The tally is still unmeasured. No doc meant no
   Pre-Execution Completeness Gate, so nothing bounded the scope.
2. **A sequencing decision was lost.** SUG-258 was meant to bundle into SUG-254 Phase 4,
   since both rewrite `apps/web/eslint.config.js`. SUG-254 Ph4 shipped 2026-07-28
   (`fd6c5f7f`, 12 lines into that exact file). The note lived only in a draft, so nothing
   surfaced it. `apps/web/eslint.config.js:27` still reads `files: ['src/**/*.{js,jsx}']`.

CLAUDE.md §Scope creep (added 2026-07-29, `eaa21808`) is the rule that prevents recurrence.
It is registered as CTL-024 at `convention` class because this validator does not exist.

## Scope

**Phase 1 — Backfill (no new tooling)**

- [x] Stub + priority-stack row for SUG-249, 257, 259, 260 — done 2026-08-04:
      `docs/backlog/SUG-249-rescope-platform-dashboards.md`,
      `SUG-257-studio-lint-script.md`, `SUG-259-node-fire-alarm-wired-to-nothing.md`,
      `SUG-260-migrate-wp-dotted-document-ids.md`
- [x] Stub for SUG-256, carrying a Scope item to reconcile its shipped work against its
      stated scope and correct the `[Unreleased]` CHANGELOG line. **Done 2026-08-01:**
      `docs/backlog/SUG-256-governance-tally-measured-liveness.md`. The audit that wrote it
      found the epic unexecutable as scoped — the tally and the liveness data live in two
      registries with no mapping — so Phase 1 is now building that mapping
- [x] Stub for SUG-258, recording that the SUG-254 Ph4 bundling window closed and it now
      stands alone, touching `apps/web/eslint.config.js` a second time — done 2026-08-04:
      `docs/backlog/SUG-258-web-typescript-lint-coverage.md`
- [x] Stub + priority row for SUG-262 and SUG-263 (this epic and its sibling — filed
      2026-07-29, same gap) — **already existed** (this doc and
      `docs/backlog/SUG-263-chromatic-gating-status.md`), both confirmed present with
      priority rows 2026-08-04, no action needed

**Phase 2 — `validate:epic-docs` (adds a gate — verification review required first)**

- [x] Verification review per `docs/conventions/verification-review.md`, run as a
      subagent — 2026-08-04, 2 Blockers (both closed below) + several Gaps
- [x] `scripts/validate-epic-docs.js`: fail if any non-Done Linear issue lacks a backlog
      doc or a priority-stack row. Reuses `collectLinear()`; 9-issue allowlist for
      historical orphans (all 9 confirmed still non-Done in Linear, not just the 3
      originally assumed); self-pruning check for stale allowlist entries
- [x] Wire into CI (`ci.yml`, `LINEAR_API_KEY: ${{ secrets.LINEAR_SUGARTOWN_STATS }}` —
      an existing secret, already used by `stats.yml`, not a new one); add a probe to
      `scripts/validate-enforcement-liveness.js` — real `collectLinear()` invocation
      against a deleted-and-restored `SUG-249` stub, per this epic's own AC, not a
      synthetic injection
- [ ] **Upgrade CTL-024 from `convention` to `enforced-by-code` — deliberately NOT
      done.** The review's second Blocker was that a SKIPPED gate has no reader;
      closed by treating SKIPPED as a genuine `live: null` (skipped) probe outcome
      rather than `invalid`, so a missing key doesn't fail the harness — but that
      doesn't prove the gate catches a real violation, only that it fails safely
      when it can't check. `pnpm validate:enforcement-liveness` reports this probe
      **skipped**, not **live**, in this session (no `LINEAR_API_KEY` available
      locally). CTL-024 stays `convention` until a session with real Linear access
      confirms `live: true`. Recorded explicitly in the register row, not silently
      assumed working

## Non-Goals

- **Filling in the six stubs' full specs.** A stub is a stub. Scope is filled at activation,
  per `/new-epic`'s own invariant ("Do not pre-fill spec sections with guesses").
- **Retrofitting older orphans.** Live issues predating 2026-07-23 (SUG-164, 168, 169, 202,
  233–237) are out of scope here; the validator will surface them and they can be handled
  as a separate burn-down.
- **Auto-creating Linear issues from docs, or the reverse.** This validates parity; it does
  not synchronise.

## Open questions

- Does the validator read Linear live (needs an API token in CI) or from a committed
  manifest? Live is accurate but adds a CI secret and a network dependency to a gate.
  Decide in Phase 2, before writing the script. **Resolved 2026-08-04:** live, via the
  existing `apps/web/scripts/stats/linear.js` `collectLinear()` module — reused, not
  reimplemented. It already has the exact graceful-degradation shape this gate needs:
  missing `LINEAR_API_KEY` or an API failure returns `{ stale: true }` rather than
  throwing. `validate-epic-docs.js` treats `stale: true` as **SKIPPED** (not pass, not
  fail — an honest "could not check," matching this repo's existing pattern for
  external-data gates) and only hard-fails when live data confirms a real orphan.
  A committed manifest was rejected: this validator's whole purpose is catching
  newly-created orphans promptly, and a manifest is stale by construction the moment
  a new issue is created outside `/new-epic` — exactly the gap it exists to close.
  **Residual, not solved by this decision:** CI's `ci.yml` does not set
  `LINEAR_API_KEY` today, so in CI this gate runs in SKIPPED mode until that secret is
  added — an infrastructure step outside what an agent session can do (no access to
  GitHub repo secrets). Flagged for Bex, not silently worked around.
- Content-type issues (articles, nodes: SUG-233, 234, 237, 259) have inconsistent
  precedent — some have docs, some do not. Decide whether they are in the validator's
  scope or allowlisted. **Partially resolved 2026-08-04:** SUG-259 (named in this
  epic's own Phase 1 list) got a stub, following the SUG-213/223/200 majority precedent
  rather than the SUG-233/234/237 minority. SUG-233/234/237 themselves are out of this
  epic's scope (Non-Goals: "retrofitting older orphans") and remain open — Phase 2 still
  needs to decide whether content-type issues are in `validate:epic-docs`'s scope or
  allowlisted, since three real orphans of that shape currently exist unaddressed.

## Acceptance Criteria

- [x] All 8 issues named in Phase 1 have a backlog doc and a priority-stack row —
      verified 2026-08-04, plus the corrected 9-issue historical allowlist
- [x] `pnpm validate:epic-docs` exists, is wired into CI, and has a liveness probe
- [x] The probe proves it fails: deletes `SUG-249`'s stub, confirms the gate names it
      in the failure output, restores the file — verified against real `collectLinear()`
      logic (matching succeeds/fails correctly on real files, see local test); the probe
      itself reports **skipped**, not live, without a local `LINEAR_API_KEY`
- [x] **CTL-024 reads `enforced-by-code` — flipped 2026-08-04**, once the first real CI
      run (`30930818744` on `f82e50ed`) proved it live: ran against real Linear data,
      correctly failed the build, named 10 real orphans by identifier. See §Round 2 below
- [x] `pnpm validate:controls` passes

## Round 2 — CI proved the gate live, and found 10 more real orphans (2026-08-04)

The first real CI run after push (`30930818744` on `f82e50ed`) exercised
`validate:epic-docs` against live Linear data for the first time — and failed, correctly.
It found **10 non-Done issues** outside this epic's original scope (SUG-249/256/257/258/
259/260) and outside the 9-issue historical allowlist: **SUG-261, 154, 72, 71, 60, 57, 56,
51, 50, 18**.

- **SUG-261** — "Test sub-issue," description literally "ignore me, I'm a test." Not real
  work; canceled in Linear rather than given a stub.
- **7 of the remaining 9 already had backlog docs** (SUG-154, 71, 57, 56, 51, 50, 18) —
  just no priority-stack row. One (SUG-18) existed as unlinked prose in the Deferred
  section predating the `[SUG-N]` linking convention; linked in place rather than
  duplicated. SUG-71's doc was found stale (predates its 2026-06-18 re-scope) — noted in
  its priority row rather than rewritten tonight, per this epic's own Non-Goal against
  filling in full specs.
- **2 needed new stubs** (SUG-72, SUG-60) — written same as Round 1's five.

This is the gate doing exactly what it was built for: SUG-262's own Non-Goals excluded
retrofitting 9 *named* historical orphans, not "any old issue." These 10 were never named
anywhere — they were simply undiscovered until something actually checked. Second CI run
confirmed green; CTL-024 flipped to `enforced-by-code` the same day.

## Post-Epic Close-Out

1. Visual QA, Chromatic, data pipeline: N/A — no rendered surface
2. **Move to `docs/shipped/` — done**, this commit. All ACs met, CTL-024 flipped,
   confirmed by a real green CI run.
3. `/mini-release` — deferred, same as SUG-256/238 earlier this session (batching
   into one `/eod` version bump). `CHANGELOG.md` `[Unreleased]` line added.
4. **Transition SUG-262 to Done** — this session.
5. **Incident log: no incident.** CTL-024 was registered `convention` from
   creation (2026-07-29) specifically because no validator existed — it never
   claimed enforcement it didn't have, unlike the INC-007/010/011 shape (a gate
   declared live that silently wasn't). Building the missing enforcement is not
   remediating a false claim.
