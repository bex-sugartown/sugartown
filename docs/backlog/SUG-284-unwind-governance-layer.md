---
**Epic:** SUG-284 — Unwind the governance/verification-review layer
**Linear Issue:** [SUG-284](https://linear.app/sugartown/issue/SUG-284/unwind-the-governanceverification-review-layer-waves-2-3-since-2026-07)
**Status:** In Progress — Phases 1–8 done, Phase 9 CHANGELOG entry done, mini-release deferred
**Priority:** 🟠 High
**Merge strategy:** (a) Merge-as-you-go — each phase merges to `main` on completion.
---

# SUG-284 — Unwind the governance/verification-review layer

## Background

Over 2026-06-25 to 2026-08-13, three escalating waves of process/audit machinery grew on top
of the repo's normal engineering conventions: a narrative "agentic caucus" methodology corpus
(wave 1), a gate taxonomy + rule register + doc-budget cap + verification-review-before-any-gate
requirement (wave 2), and a governance data layer + gate tiering (wave 3). `docs/ai/agentic-caucus/`
alone reached 18,743 words — more than CLAUDE.md itself (10,574 words) — and the SUG-268
generator pipeline produces `apps/web/src/generated/governance.json`, which has zero consumers
anywhere in the app.

Bex requested a full unwind plan 2026-08-13. Full evidence, timeline, and every locked decision:
`docs/drafts/governance-layer-unwind-plan.md` (local-only, gitignored — not committed. If this
plan needs to survive past this machine, copy its content into this doc or a shipped doc before
relying on it in a future session).

## Objective

Remove wave 2 and wave 3 (everything from 07-21 onward) via forward-moving commits, not a git
history rewrite — the governance commits are interleaved with ~150+ unrelated commits, some
genuinely mixed with real fixes. History stays intact and readable.

## Archive, not hard-delete

Locked decision, 2026-08-13: everything decommissioned moves to `zArchive/2026-08-sug284-governance-layer/`
(mirroring original paths) via `git mv`, not `rm`. Extends the existing `docs/shipped/zArchive/2026/`
convention to code, not just docs. CI/pre-commit config lines and `package.json` entries aren't
standalone files — those get recorded in the archive `README.md` instead. Full structure in
`docs/drafts/governance-layer-unwind-plan.md` §Archive, don't hard-delete.

## Scope

### Phase 1 — Freeze + archive skeleton — **done 2026-08-13**
- [x] Create `zArchive/2026-08-sug284-governance-layer/README.md` — index, epic link, resurrection instructions
- [x] `git mv` AOP-2/3/4/5 backlog docs into the archive (not tracked in Linear — pure proposals, nothing implemented)
- [x] Cancel Linear issues superseded by this epic: SUG-243, 256, 262, 268, 276, 281, 282 (**not** SUG-255 —
      evaluated and kept as Done, see Phase 8 note)
- [x] SUG-268 confirmed not left "In Progress" — cancelled

### Phase 2 — CI + pre-commit first — **done 2026-08-13** (`6e17f8fa`)
- [x] Strip the 6 governance steps from `.github/workflows/ci.yml` (control register, doc-budget,
      governance-diff, governance, governance-tally, epic-docs) + the entire `liveness` job
      (enforcement-liveness)
- [x] `ci-failure-alert.yml` checked — it never had WARN-GATE-specific logic (that lived in
      `ci.yml` itself, removed above); no changes needed
- [x] Strip the 3 governance steps from `.husky/pre-commit` (governance-diff, governance,
      validate:validators)

### Phase 3 — Scripts + package.json — **done 2026-08-13** (`99666f30`, `6e17f8fa`)
- [x] `git mv` `scripts/governance-build.js`, `validate-governance.js`, `validate-governance-diff.js`,
      `validate-governance-tally.js`, `validate-control-register.js`, `validate-doc-budget.js`,
      `validate-enforcement-liveness.js`, `validate-epic-docs.js`, `mttn.js`, `validate-validators.js`
      into `zArchive/2026-08-sug284-governance-layer/scripts/`
- [x] Removed the 10 corresponding `package.json` script entries (recorded in archive README, not archived as files)

### Phase 4 — Generated artifacts + agent
- [ ] `git mv` `governance/` (schema + source, 8 files) into the archive; `rm -rf .governance-build/` (gitignored, untracked, nothing to preserve)
- [ ] `git mv` `apps/web/src/generated/governance.json` into the archive **and** remove its `.gitignore`
      negation (`!apps/web/src/generated/governance.json`) in the same commit
- [ ] `git mv` `.claude/agents/verification-reviewer.md` into the archive

### Phase 5 — The governance-draft page — **done 2026-08-13** (`70a2d42e`)
- [x] `git mv` `apps/web/src/pages/platform/GovernanceDraftPage.jsx` into the archive
- [x] Removed its route from `App.jsx` and `routes.js`
- [x] Removed the `robots.txt` disallow line and the `netlify.toml` header block
- [x] `.claude/launch.json` checked — no entry existed
- [x] Bonus: `GovernancePage.jsx` §05's "COVERAGE MAP" callout claimed the tally was
      "being re-measured, tracked as SUG-256" — now false since SUG-256 is cancelled.
      Removed as a factual correction, verified in-browser (renders clean, 0 console errors,
      `/platform/governance-draft` 404s correctly)

### Phase 6 — Docs corpus — **done 2026-08-13**
- [x] `git mv` `control-register.md`, `rule-register.md`, `governance-coverage.md`,
      `docs/conventions/verification-review.md` into the archive
- [x] Kept `incident-log.md`, `methodology.md`, `failure-modes.md`, `risk-tiers.md`,
      `agent-cards.md`, `data-handling.md` — locked decision, inert reference, nothing gates on them.
      Left their internal cross-references to the archived docs untouched — they're a historical
      snapshot, not live instructions
- [x] Trimmed `docs/ai/README.md` — removed `governance-coverage.md` from the directory listing
      and the Quick Reference section (2 small edits, not a rewrite)
- [ ] **Found during Phase 6, deferred to Phase 7:** `docs/conventions/human-gate-conventions.md`
      (line ~38) and `docs/conventions/technical-doc-style-guide.md` (lines ~126, ~279-282, ~324)
      — both kept — contain prescriptive instructions pointing at `verification-review.md` and
      `control-register.md` (e.g. "fill these two fields from its row"). These need editing
      alongside CLAUDE.md's Verification Review section since they're the same concept's
      downstream documentation, not a separate concern. Not touched yet — both are CLAUDE.md-
      adjacent conventions docs, so the Instruction & Rule File Write Gate applies.

### Phase 7 — CLAUDE.md (Instruction & Rule File Write Gate applies — diff from a scratch copy,
explicit approval, before this file is touched)
- [ ] Copy every removed section's verbatim text into `zArchive/2026-08-sug284-governance-layer/CLAUDE-md-removed-sections.md` before removing it from CLAUDE.md
- [ ] Remove §Verification review (blocking)
- [ ] Remove §Process feedback loop — three-strike retrospective trigger
- [ ] Remove §Scope creep (blocking)
- [ ] Remove/simplify the "gate tiers" note at the top of the file
- [ ] Remove epic close-out step 8b's hard requirement (keep `incident-log.md` as reference only)
- [ ] Trim §Instruction & Rule File Write Gate's "copy-first method" elaboration — **keep the
      gate itself**, locked decision

### Phase 8 — Linear cleanup + archive the retired epic docs — **done 2026-08-13**
- [x] Cancel SUG-243, 256, 262, 268, 276, 281, 282 with a comment linking to this epic
- [x] SUG-255 evaluated and **kept as Done** — its core deliverable (green CI, real lint/Chromatic/typecheck
      fixes) is not being reverted; only its Ph4/Ph5 tail (`validate-enforcement-liveness.js`) is governance
      output and gets archived alongside the rest. Comment recorded on the issue.
- [x] Of the 7 cancelled issues, only 3 had a live backlog doc — the other 4 (SUG-243, 256, 262, 281)
      had already shipped, so their docs stay in `docs/shipped/` per the shipped-docs-stay-as-is
      convention. `git mv` SUG-268, SUG-276, SUG-282's backlog docs into
      `zArchive/2026-08-sug284-governance-layer/docs/backlog/`
- [x] Leave SUG-198, 227, 254 as historical — their wave-1/2 doc output partially survives

### Phase 9 — Release
- [x] `[Unreleased]` → `Removed` CHANGELOG section written — **done 2026-08-13**
- [ ] Actual `/mini-release` (version bump) — deferred per CLAUDE.md §Mini-release: "whenever
      this step is deferred, still add the epic's one-line summary to CHANGELOG.md's
      `[Unreleased]` buffer at ship time" (satisfied above). Run at next natural release point.

## Non-Goals

- Rewriting git history. The mechanism is forward commits only.
- Touching Content Write Gate, Human-Publishes Rule (SUG-90 lineage), Phase 0/VQA/Chromatic
  gates (Pink Moon lineage), token/CSS/URL rules, `packages/mcp-server/src/tools/governance.ts`
  (real MCP tools, not audit apparatus), the Instruction & Rule File Write Gate itself, the
  epic-authoring workflow, or the writing-style conventions (`instruction-writing-style.md`,
  `user-story-conventions.md`, `machine-readable-docs.md`) — all confirmed separate lineage or
  explicitly kept by locked decision.
- Deleting `docs/ai/agentic-caucus/incident-log.md`, `methodology.md`, `failure-modes.md`,
  `risk-tiers.md`, `agent-cards.md`, `data-handling.md`, or the Tier 1/2/3 taxonomy in
  `human-gate-conventions.md` — locked decision, kept as inert reference.

## Related

- **Linear:** [SUG-284](https://linear.app/sugartown/issue/SUG-284/unwind-the-governanceverification-review-layer-waves-2-3-since-2026-07)
- Supersedes SUG-243, 255, 256, 262, 268, 276, 281, 282
- Full plan and evidence: `docs/drafts/governance-layer-unwind-plan.md` (local-only)
