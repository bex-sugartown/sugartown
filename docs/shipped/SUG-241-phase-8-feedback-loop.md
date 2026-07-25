---
**Epic:** SUG-241 — Phase 8 feedback loop (monthly evidence read-back + retrospective trigger)
**Linear Issue:** [SUG-241](https://linear.app/sugartown/issue/SUG-241/phase-8-feedback-loop-monthly-evidence-read-back-retrospective-trigger)
**Status:** Backlog
**Priority:** 🟣 Soon — the most valuable gap in the audit, sequenced after the ones that make its evidence trustworthy
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-241 — Phase 8 feedback loop

Closes the only gap in the workflow that's a missing loop rather than a missing link.
Nothing measured after ship currently feeds back into planning.

## Template adaptation — declared once

Process/tooling epic. No Sanity schema, GROQ, or render-layer work.

| Template section | Status | Reason |
|---|---|---|
| Component-Reuse Manifest | N/A | No visual surface |
| Doc Type Coverage Audit | N/A | No content doc type touched |
| Schema Field Proposal | N/A | No schema field added |
| Query Layer Checklist | N/A | No GROQ touched |
| Schema Enum Audit | N/A | No enum field rendered |
| Metadata Field Inventory | N/A | No metadata surface touched |
| Themed Colour Variant Audit | N/A | No themed surface touched |
| Migration Script Constraints | N/A | No Sanity document written |
| Human QA Walkthrough | N/A | No CSS/layout/rendering |
| Visual QA Gate | N/A | No visual output |

Phase 0 does not fire.

## Pre-Execution Completeness Gate [REQUIRED]

- [x] **Correct audit file paths** — `apps/web/src/generated/stats.json`,
  `docs/backlog/sugartown-backlog-priorities.md`, `docs/post-mortem-prompt.md`,
  `docs/reviews/post-mortem/` all confirmed present during the originating audit
- [x] **Scope ↔ Non-Goals consistency** — checked
- [ ] **Instruction & Rule File Write Gate pre-flight** — Phase 2 adds the three-strike
  trigger rule to CLAUDE.md. Diff must be shown and approved before writing.

## Context [REQUIRED]

`stats.yml` runs daily at 06:00 UTC: collects Lighthouse CI, CrUX, security headers,
GitHub, Sanity, and the Linear roadmap, **fails its own job if a critical collector
returns stale data**, then commits `apps/web/src/generated/stats.json`. This is real,
running data — not seeded, not a scaffold (verified directly against live timestamps
during the originating audit, all same-day).

That data renders on `/governance` and then stops. Nothing reads it back into Phase 2
planning. Backlog priority in `docs/backlog/sugartown-backlog-priorities.md` comes from
judgment, not evidence.

Separately: the system post-mortem skill (`/post-mortem`, `docs/post-mortem-prompt.md`)
exists and has a real, already-used output home
(`docs/reviews/post-mortem/{date}-{slug}.md` — one entry exists,
`2026-07-19-chromatic-footer-version-freeze.md`). Retrospectives happen when something
has already hurt enough to prompt one, not on any trigger.

## Objective [REQUIRED]

After this epic, two loops run. A **monthly product loop** reads `stats.json` and writes
a dated evidence block into `docs/backlog/sugartown-backlog-priorities.md`. A **per-epic
process loop** adds one friction line to every shipped doc's close-out, and a three-strike
rule (the same friction line appearing in three shipped docs) mechanically fires
`/post-mortem`, whose output lands in `docs/reviews/post-mortem/` — a home that already
exists and already works. Priority order in Linear becomes traceable to evidence rather
than judgment alone.

## Scope [REQUIRED]

**Phase 1 — Monthly product loop**
- [x] `scripts/monthly-evidence-digest.js`: reads `apps/web/src/generated/stats.json`,
  writes a dated block to `docs/backlog/sugartown-backlog-priorities.md` — four numbers,
  three sentences
- [x] Idempotent per calendar day (re-running on the same day doesn't duplicate the block)
- [x] If a source is unavailable, write `unavailable` — never a defaulted zero
- [x] Add `collect:evidence-digest` script entry — **correction: added to root
  `package.json`, not `apps/web/package.json` as originally scoped.** The script is
  root-located (`scripts/monthly-evidence-digest.js`, per this doc's own Files to Modify)
  and operates cross-package — reads from `apps/web/src/generated/`, writes to
  `docs/backlog/` at repo root — matching the pattern of other root scripts
  (`registry:build`, `migrate:taxonomy`), not a workspace-scoped one.

**Phase 2 — Process loop + retrospective trigger**
- [x] Add a friction line to `docs/epic-template.md`'s Post-Epic Close-Out and
  Definition of Done: "What cost a correction commit this time" (one sentence,
  required, `none` is a valid answer) — added to Post-Epic Close-Out (step 3b) and
  Acceptance Criteria (no literal "Definition of Done" heading exists in this file)
- [x] Document the three-strike counting rule in CLAUDE.md: when the same friction
  (by plain-language similarity, human judgment call, not string matching) appears in
  three shipped docs, run `/post-mortem` against the pattern. **Diff shown, approved,
  before writing.**
- [x] Write `docs/conventions/feedback-loop.md` describing the monthly cadence and the
  three-strike rule in one place, referenced from CLAUDE.md and the epic template rather
  than duplicated in both

**Phase 3 — Proof of format**
- [x] One backfilled evidence block, written from the last month of real
  `stats.json` history, as proof the script's output format is actually useful before
  relying on it going forward — real git history (`git show <sha>:...stats.json` from
  2026-06-25), not synthetic data; delivered as part of Phase 1's commit

## Non-Goals [REQUIRED]

- **Adding analytics or instrumentation.** This epic reads what already exists in
  `stats.json`. It does not instrument anything new.
- **Audience research.** Still deferred (see `docs/drafts/workflow-audit-v0.3-grounded.md`
  "Why Phase 1 is thin"). A separate one-off study, not a process change.
- **Automating the post-mortem itself.** The trigger is mechanical. The post-mortem is
  human-directed work using the existing `/post-mortem` skill — this epic wires the
  trigger, not the analysis.
- **A second output location for retrospectives.** `docs/reviews/post-mortem/` already
  works. This epic does not relocate it.

## Technical Constraints [REQUIRED]

- `scripts/monthly-evidence-digest.js` reads a single local JSON file — no network calls,
  no new dependency.
- The three-strike rule is explicitly a **human judgment call** on friction similarity,
  not a string-match — CLAUDE.md should say so plainly, to avoid a future session trying
  to mechanize what's meant to stay a human read.

## Files to Modify [REQUIRED]

- `scripts/monthly-evidence-digest.js` — CREATE — Phase 1
- `apps/web/package.json` — new script entry — Phase 1
- `docs/backlog/sugartown-backlog-priorities.md` — first dated block appended — Phase 1/3
- `docs/epic-template.md` — friction line in close-out + DoD — Phase 2
- `CLAUDE.md` — three-strike rule, gated — Phase 2
- `docs/conventions/feedback-loop.md` — CREATE — Phase 2

## Deliverables [REQUIRED]

1. Monthly digest script exists and produces a correctly formatted dated block
2. Friction line present in the epic template's close-out and Definition of Done
3. Three-strike trigger documented with an explicit, honest "this is a judgment call"
   framing
4. One real backfilled evidence block in the backlog priorities file

## Acceptance Criteria [REQUIRED]

- [x] Script runs and appends a correctly formatted dated block — verified live,
  `pnpm collect:evidence-digest`
- [x] Re-running on the same day does not duplicate the block (idempotent) — verified
  live across 4 runs (today twice, a historical backfill, today again after the
  backfill); caught and fixed two real bugs in the process (see Phase 1 commit message)
- [x] Every value in the block traces to a real `stats.json` source — zero fabricated or
  defaulted numbers; unavailable sources write `unavailable`, not `0` — verified: CrUX
  is genuinely unavailable in the live data (`no-api-key`) and the block says so
- [x] Friction line present in `docs/epic-template.md` — no literal "Definition of Done"
  heading exists (same grounding gap SUG-242 hit in this file); added to both
  Acceptance Criteria and Post-Epic Close-Out step 3b instead
- [x] Three-strike trigger documented in CLAUDE.md with an explicit counting rule and an
  explicit statement that similarity judgment is human, not mechanical — new
  "Process feedback loop" subsection, points to `docs/conventions/feedback-loop.md`
- [x] One backfilled block written from real historical `stats.json` data, as proof the
  format works — `git show`'d the real 2026-06-25 commit of `stats.json` (not
  synthetic data) and ran the script against it with `--stats-path`/`--date`; both the
  2026-06-25 and 2026-07-25 blocks are live in `docs/backlog/sugartown-backlog-priorities.md`
- [x] The CLAUDE.md diff was shown and approved before writing — confirmed; also caught
  and corrected mid-epic that `docs/epic-template.md` and the new
  `docs/conventions/feedback-loop.md` file are equally covered by the same gate (both
  are explicitly named in CLAUDE.md's Instruction & Rule File Write Gate scope) — those
  two were written before the gate fired and corrected retroactively before committing

## Risks / Edge Cases [REQUIRED]

- **A measurement loop reading fabricated numbers is worse than no loop.** If any source
  in `stats.json` turns out to be seeded rather than real by the time this epic executes,
  stop and re-verify against the live pipeline before writing the script — don't assume
  the audit's July 2026 verification still holds indefinitely.
- **Friction-line fatigue.** If every shipped doc's friction line becomes a rote "none,"
  the loop produces no signal. Not solved by this epic mechanically — worth a spot-check
  after the first 5–10 shipped docs post-launch to confirm the line is actually being
  used honestly.

## Friction line [REQUIRED — step 3b]

Two rule-defining files (`docs/epic-template.md`, `docs/conventions/feedback-loop.md`)
were written before the Instruction & Rule File Write Gate fired for them — both are
explicitly in its scope, and I initially only gated the CLAUDE.md edit. Caught and
corrected before committing (diff shown, approved retroactively), so no separate
correction commit resulted — but it's the same failure shape as any other missed gate,
worth recording rather than letting the clean outcome erase the near-miss.

## Post-Epic Close-Out [REQUIRED]

1. Visual QA gate — N/A
2. Chromatic — N/A
3. Data pipeline gap check — N/A (this epic *is* the pipeline gap check, applied to
   itself: confirm `stats.json` is still real, not seeded, before Phase 1 begins)
4. Move `docs/backlog/SUG-241-phase-8-feedback-loop.md` →
   `docs/shipped/SUG-241-phase-8-feedback-loop.md`
5. Confirm clean tree
6. `/mini-release SUG-241 Phase 8 feedback loop`
7. Transition SUG-241 to **Done** in Linear
8. Start next epic only after mini-release commit is confirmed
