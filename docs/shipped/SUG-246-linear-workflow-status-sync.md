---
**Epic:** SUG-246 — Linear workflow status sync — priority + dependency alignment
**Linear Issue:** [SUG-246](https://linear.app/sugartown/issue/SUG-246/linear-workflow-status-sync-priority-dependency-alignment)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-246 — Linear workflow status sync — priority + dependency alignment

Wire the existing Claude-driven epic workflow (`/new-epic`, activation, close-out) to keep each epic's Linear issue status, priority, and blocking relations synced to its real state in the Sugartown backlog, instead of Linear drifting out of date until someone manually clicks it into place.

## Background

Today the `/new-epic` skill creates a Linear issue in "Backlog" status and maps the Sugartown priority emoji (🔴🟢🟣⚪⬛) to Linear's 4-tier priority field at creation time (`.claude/skills/new-epic/docs/new-epic-prompt.md` Step 1). CLAUDE.md's "Linear Done = code on main" section separately requires transitioning an issue to "Done" at close-out. Between those two points — an epic moving into "Next" in the priority stack, and an epic being activated for implementation — nothing updates Linear at all; those states only exist in `docs/backlog/sugartown-backlog-priorities.md` prose. Cross-epic sequencing (e.g. "SUG-244 is blocked on SUG-245 Phase 1") is likewise only ever written as prose in the epic doc and the priority-stack file, never as a Linear-native relation, even though the Linear MCP's `save_issue` tool supports `blockedBy`/`blocks` directly. The trigger: Bex wants Linear to reflect the real Sugartown workflow stage automatically as Claude runs the existing skills, rather than needing a separate manual pass in the Linear UI.

Confirmed 2026-07-25 via the Sugartown Linear team's `list_issue_statuses`: the team has distinct `Backlog` (backlog), `Todo` (unstarted), `In Progress` (started), `In Review` (started), `Done` (completed), `Duplicate`, and `Canceled` states — so "Todo" and "In Progress" already exist as real, unused states for this workflow to target.

## Objective

After this epic, Linear status transitions happen as a side effect of the workflow steps that already exist — `/new-epic` (create), promotion to the top of `## 01 · Next` in the priority stack (→ "Todo"), Phase 0 sign-off / implementation start (→ "In Progress"), and the existing close-out step 8 (→ "Done") — without a human separately opening Linear to click a status. Linear's `priority` field continues to mirror the backlog priority tier (already true; this epic verifies no drift across current open epics and keeps it enforced going forward). Every backlog epic doc that states an explicit cross-epic dependency ("blocked on SUG-X") gets that dependency mirrored as a real Linear `blockedBy`/`blocks` relation via `save_issue`, not left as prose alone.

This epic touches: `.claude/skills/new-epic/docs/new-epic-prompt.md` (Step 1/4), CLAUDE.md (close-out sequence step 8, "Linear Done = code on main"), `docs/epic-template.md` (Phase 0 sign-off step), and `docs/backlog/sugartown-backlog-priorities.md` (as the source of dependency statements to backfill). It does not touch Sanity schema, GROQ queries, or any `apps/web` rendering code — this is process/tooling only, governed by the Instruction & Rule File Write Gate since it edits skill/CLAUDE.md files.

## Scope

- [ ] **Status transition convention (layer: skill/process)** — Define the explicit Sugartown-stage → Linear-status map (Backlog stub created → `Backlog`; promoted to top of `## 01 · Next` → `Todo`; Phase 0 sign-off passed / implementation begins → `In Progress`; close-out step 8 → `Done`) and write it into `.claude/skills/new-epic/docs/new-epic-prompt.md` and `docs/epic-template.md` as an explicit rule, not an assumption.
- [ ] **Activation → "In Progress" hook (layer: skill/process)** — Identify the exact point in the current activation flow (Phase 0 sign-off in `docs/epic-template.md`, or the "Stub activation gate" in the `new-epic` skill) where implementation begins, and add a `save_issue` call transitioning the Linear issue's `state` to `In Progress` at that point.
- [ ] **Priority-stack promotion → "Todo" hook (layer: skill/process)** — When an epic is added to or reordered within `## 01 · Next — high value, ready to pick up` in `sugartown-backlog-priorities.md`, transition the corresponding Linear issue's `state` to `Todo`. Name the concrete trigger point (likely `/new-epic` Step 4, plus any future "reprioritize" workflow).
- [ ] **Dependency relation backfill + convention (layer: skill/process, Linear MCP)** — Read `sugartown-backlog-priorities.md` in full and enumerate every currently-stated hard dependency between open epics (e.g. SUG-244 "blocked on SUG-245 Phase 1"); create the matching `blockedBy`/`blocks` relation on each pair via `save_issue`. Add a standing rule to `/new-epic` (and wherever epic docs declare a dependency going forward) that a stated "blocked on SUG-X" always gets mirrored as a Linear relation in the same edit.
- [ ] **Priority-field drift check (layer: process)** — Spot-check the current open backlog epics' `Priority:` header against their live Linear priority value; fix any that have drifted (informational check, not a rebuild of the mapping — the mapping itself is unchanged).
- [ ] **Ordering-parity investigation (layer: process/API)** — Activation audit (see Technical notes) to determine whether Linear exposes any settable manual-sort-order field beyond the 4-tier `priority` value; document the finding either as an implemented ordering hook or as an explicit, named gap.

## Acceptance criteria

- [ ] `.claude/skills/new-epic/docs/new-epic-prompt.md` documents the full Backlog → Todo → In Progress → Done transition map, with the concrete trigger for each transition named.
- [ ] A newly-activated epic (Phase 0 sign-off passed) has its Linear issue transitioned to `In Progress` as part of that activation step, verified on at least one real epic during this epic's own execution.
- [ ] An epic promoted to the top of `## 01 · Next` has its Linear issue transitioned to `Todo`, verified on at least one real epic.
- [ ] Every backlog epic doc containing an explicit "blocked on SUG-X" / "hard dependency" statement (enumerated from a full read of `sugartown-backlog-priorities.md`) has a matching `blockedBy` relation on its Linear issue — confirmed via `get_issue` with `includeRelations: true` for each pair.
- [ ] The ordering-parity question is resolved one way or the other: either a working ordering mechanism is implemented, or CLAUDE.md/this epic's ship doc explicitly states Linear has no API-exposed manual sort field reachable from this MCP and names the fallback (e.g. priority tier + Linear's own default sort).
- [ ] CLAUDE.md's close-out sequence step 8 and "Linear Done = code on main" section are reviewed and updated only if this epic's new transitions change their wording — otherwise explicitly confirmed unchanged-and-correct.
- [ ] This epic edits `.claude/skills/new-epic/docs/new-epic-prompt.md`, CLAUDE.md, and `docs/epic-template.md` — the Instruction & Rule File Write Gate fires for each: exact diff shown and approved before commit.

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, layout, or multi-page component changes. This epic touches only skill prompts, CLAUDE.md, and Linear issue state via MCP calls.

## Technical notes

- **Content Write Gate**: does not apply — no Sanity content is written.
- **Schema changes**: none.
- **Upstream dependencies**: none blocking. Independent of the in-flight 2026-07-24 process-hardening batch (SUG-239/240/241/242/243), though it edits some of the same rule files (CLAUDE.md, `docs/epic-template.md`) — sequence after SUG-243 (CLAUDE.md split) if both are picked up close together, to avoid two overlapping CLAUDE.md diffs in flight, per the same reasoning SUG-238 already applies to SUG-243.
- **Activation audits**:
  - Read `.claude/skills/new-epic/docs/new-epic-prompt.md` Step 1 and Step 4 in full to confirm the exact current Linear write calls before changing them.
  - Read `docs/epic-template.md`'s Phase 0 sign-off section to find (or add) the concrete point where "implementation begins" is declared — that is the `In Progress` hook.
  - Read CLAUDE.md's "Linear Done = code on main" section and close-out sequence step 8 in full before editing, so the new transitions are added without contradicting the existing Done rule.
  - Read `docs/backlog/sugartown-backlog-priorities.md` in full (361 lines as of 2026-07-25) to enumerate every stated cross-epic dependency for the backfill AC — do not infer from memory or from this stub's examples (SUG-244/SUG-245) alone; there may be others.
  - Confirm via the Linear MCP tool schema (already checked 2026-07-25: `save_issue` supports `state`, `priority` 0–4, `blockedBy`/`blocks`, `relatedTo` — no exposed manual-sort-order field) whether any other available Linear MCP tool exposes issue ordering; if not, the ordering-parity AC resolves to "documented gap," not silent omission.
- **Model & Mode [REQUIRED]:** `/model sonnet` — this is skill-prompt and CLAUDE.md editing work (structured, moderate ambiguity only on the Linear-ordering question), not an architecture decision. Sonnet 5 executes directly; no plan-mode handoff needed. If the ordering-parity investigation turns up something structurally ambiguous (e.g. requires a new custom field or a different Linear feature entirely), pause and surface that specific finding before proceeding rather than guessing.

## Non-Goals

- **No fully automated bidirectional sync.** This epic does not build a Linear webhook or polling job that updates the repo from Linear changes. Updates are one-directional (repo workflow → Linear) and only fire when a human runs an existing Sugartown skill (`/new-epic`, activation, close-out) — not on a timer or in response to Linear-side edits.
- **No guarantee of exact manual drag-order parity in Linear's UI** if the ordering-parity activation audit finds no API-exposed field for it. If that's the case, this epic documents the gap rather than building a workaround (e.g. a custom Linear field) without explicit approval, since that would be a Linear workspace configuration change outside this epic's assumed scope.
- **No changes to non-epic Linear issues.** Ad hoc bugs or tasks filed outside the `/new-epic` workflow are not in scope.
- **No re-litigation of the existing priority-emoji → Linear-priority-tier mapping.** That mapping (🔴→1, 🟢→2, 🟣→3, ⚪→4, ⬛→4) already exists and is correct; this epic only adds a drift check, not a redesign.

## Related

- **Linear:** [SUG-246](https://linear.app/sugartown/issue/SUG-246/linear-workflow-status-sync-priority-dependency-alignment)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time (Doc Type Coverage / Query Layer / Schema Enum Audit are not applicable to this epic since it touches no schema or GROQ; Files to Modify should be completed from the activation audits above).

## Close-out summary (2026-07-25)

All Scope items shipped in a single pass:

- **Status transition convention**: documented as a 4-stage map (Backlog → Todo → In Progress → Done) in a new CLAUDE.md `### Linear status = workflow stage` section, `docs/epic-template.md`'s rewritten `## Epic Lifecycle` (now 3 stages: Backlog / Active / Shipped), and the `new-epic` skill's Invariants + Step 4 + Enforcement rules.
- **Activation → In Progress hook**: `docs/epic-template.md` now instructs the transition immediately after the Pre-Execution Completeness Gate, before the first `Edit`/`Write` call. Verified live on this epic itself (SUG-246 was moved to `In Progress` at that exact point during its own execution).
- **Priority-stack promotion → Todo hook**: added to `/new-epic` Step 4. Verified live — SUG-246 was moved to `Todo` when it was filed at the top of `## 01 · Next`.
- **Dependency relation backfill**: the epic doc's original assumption — that no "blocked on SUG-X" prose statement had ever been mirrored to Linear — was **wrong**. Checked all 5 stated dependencies directly against live Linear relations (not doc text): `SUG-223→SUG-222` and `SUG-197→SUG-196` already had correct `blockedBy` relations. Three real gaps found and fixed: `SUG-244` (added `blockedBy SUG-245`), `SUG-72` (added `blockedBy SUG-71`), `SUG-181` (added `blockedBy SUG-179, SUG-71, SUG-72` — previously only loose `relatedTo` links, missing SUG-179 entirely). Confirmed via `get_issue(includeRelations: true)` after writing.
- **Priority-field drift check**: spot-checked 6 open epics with canonical priority-emoji headers against live Linear values. Found and fixed 2 real drifts: `SUG-205` and `SUG-160` were both marked 🟢 Next (should be Linear priority 2/High) but sat at 3/Medium — corrected. Also surfaced a separate, out-of-scope finding: the 2026-07-24 process-hardening batch (SUG-238–245) uses a non-canonical priority-label vocabulary ("🔴 High" / "🟡 Medium" / "⚪ Low") that doesn't map unambiguously onto the Sugartown scheme — flagged as a background task rather than fixed here, since normalizing 8 epic docs' priority vocabulary is a larger, separate change than this epic's drift *check*.
- **Ordering-parity investigation**: resolved as a documented gap, not implemented. Confirmed via the Linear MCP `save_issue` tool schema that only a 4-tier `priority` field is exposed — no manual sort-order field. CLAUDE.md's new section states the fallback explicitly: priority tier + Linear's own default sort.

All three rule-file edits (CLAUDE.md, `docs/epic-template.md`, `.claude/skills/new-epic/docs/new-epic-prompt.md`) went through the Instruction & Rule File Write Gate — exact diff shown, approved by Bex before any edit was made.

**Merge strategy note:** filed as (b) single close-out but the work was small enough to land in one session on `feat/sug-246-linear-workflow-status-sync`, merged to `main`, then closed out per the standard sequence.
