# Red-pen — Epic Lifecycle Full Detail SVG

**Diagram source:** `docs/diagrams/diagram-workflow-full-detail.svg`
**Companion:** `docs/diagrams/diagram-workflow-current-state.svg` (short summary) +
`docs/diagrams/redpen-workflow-current-state.md` (its claim table) — **this table does
not re-derive claims already covered there.** Where a node in this diagram makes the
same claim as a node in the short one (orphaned validators, unwired reviewer, feedback
loop not closed, release gate count), the row below says "see short-diagram table" and
is not re-verified independently — checking a claim twice against the same evidence
doesn't strengthen it, it just duplicates the citation.
**Origin:** `docs/drafts/workflow-audit-v0.3-grounded.md` and
`docs/drafts/sugartown-workflow-future-state-v3.html` (both gitignored working
artifacts) — this SVG is the full-detail formalization Bex asked for as a companion to
the short summary, not a 1:1 port of the drafts (drafts used a dark neon palette; this
uses the brand's actual Pink Moon light system).
**Date:** 2026-07-24 · **Status:** source committed, not yet uploaded or embedded
anywhere live. Per Bex's decision, this stays a linked static asset (referenced from the
short diagram / GovernancePage per SUG-244), not a new page route — no Phase 0 mock
required for a linked file.

Classes: **enforced-by-code** · **measured** (verified this session by direct read) ·
**convention** (documented rule, true by discipline) · **roadmap** (not true yet).

## Claims shared with the short diagram (not re-verified here)

| Diagram element | See |
|---|---|
| DESIGN-REVIEWER (pink, Phase 4) | `redpen-workflow-current-state.md` — IMPLEMENTATION box row |
| VALIDATORS (pink, Phase 5) | same file — VERIFICATION box row |
| STATS.YML · DAILY, MONTHLY DIGEST, RETROSPECTIVE, RE-PRIORITIZE, evidence loop (Phase 8) | same file — FEEDBACK box + loop rows |
| Footer epic references | same file — footer row |

## New claims — full detail only

| Diagram element | Evidence (file / mechanism) | Class |
|---|---|---|
| Phase 1 header, "optional" | No hard-stop equivalent to Phase 0 exists for Phase 1 in CLAUDE.md — read directly, absence confirmed by scanning the file for a matching gate name | convention |
| INTENT, BRIEF / IA (Phase 1, ink) | Phase 1's two non-conditional steps per CLAUDE.md's own phase description, read directly | convention |
| DISCOVERY?, BRAINSTORM (Phase 1, "optional") | CLAUDE.md text describes both as explicitly conditional | convention |
| AUDIENCE CHECK (pink) | `docs/drafts/workflow-audit-v0.3-grounded.md` "Why Phase 1 is thin" section: deferred deliberately, distinct reason from the rest of Phase 1's thinness (external readers, not a lone-VoPM structural fact) — this is a documented editorial decision, not a code claim | convention |
| LINEAR SUG-N, "ID assigned first" | CLAUDE.md §"Epic authoring — Linear-first workflow": "Create a Linear backlog item first — this assigns the SUG-{N} tracking ID," read directly | convention |
| PRD, EPIC DOC (Phase 2, ink) | Standard planning artifacts named throughout CLAUDE.md and `docs/epic-template.md`, no code enforcement | convention |
| COMPLETENESS GATE, "7 conditions checked" | CLAUDE.md §"Incomplete epic doc hard stop" — `grep -c "^[0-9]\. \*\*"` between that heading and the next returns exactly 7, re-verified this session, not carried from memory | measured |
| REUSE MANIFEST | `docs/epic-template.md` §"Component-Reuse Manifest [REQUIRED if epic adds any page, section, or visual surface]" — read directly | convention |
| HAS UI?, REUSE AUDIT, INTERACTION ANNOTATION, PHASE 0 SIGN-OFF (Phase 3, ink) | CLAUDE.md's Phase 0 hard-stop section and interaction-annotation-layer rule, both read directly | convention |
| VSPEC (pink), "still 'mock' today · SUG-242" | The artifact is still literally called "mock" in live CLAUDE.md as of this writing — SUG-242 (this session's own epic) proposes the rename and has not shipped. **Corrected 2026-07-24, same session:** the node originally led with "MOCK" (the current, accurate term) with the rename noted as a caveat — technically defensible per the red-pen gate, but Bex flagged it as confusing given the whole engagement has been discussing vspec as the settled plan. Flipped to lead with the target term instead, still pink-bordered, still captioned with the current reality — same underlying fact, clearer presentation | roadmap (the "VSPEC" label); "still 'mock' today" caveat is **measured** |
| ORIENT, CONFIRM, BUILD + COMMIT, STORY + DARK MODE (Phase 4, ink) | CLAUDE.md's Session Discipline and Storybook coverage requirement sections, read directly | convention |
| CI · LINT/TYPE/BUILD, "+ Chromatic, advisory" | `.github/workflows/ci.yml` job structure (lint → typecheck → validate → build) plus the Chromatic job's `--exit-zero-on-changes` flag — both confirmed by direct read this session | measured |
| SMOKE TESTS (pink), "don't exist" | Zero test-runner dependencies in any `package.json`, no `playwright.config.*` anywhere in the repo — confirmed by direct `find` this session (same finding SUG-240 is built on) | measured |
| AXE / A11Y (pink), "installed, not gated" | `@storybook/addon-a11y@^10.3.4` present and registered in `apps/storybook/.storybook/main.ts`'s `addons` array — confirmed by direct read. Not wired as a CI-blocking gate — confirmed by reading `.github/workflows/ci.yml` and finding no test-runner job at all (SUG-161 Phase 2 scope) | measured |
| VSPEC-TO-BUILD (pink), "still 'mock-to-impl.' · SUG-242" | CLAUDE.md's Visual QA gate names the human sign-off phrase "Visual QA approved" — that text is real today regardless of the rename. The *table name* is what's pending: current CLAUDE.md text still says "mock-to-implementation comparison table." **Corrected 2026-07-24:** originally drawn ink-bordered (inconsistent — the border said "verified" while the caption said "roadmap pending SUG-242"). Now pink-bordered to match its own caption, consistent with the VSPEC node above | convention (the "Visual QA approved" gate itself); "VSPEC-TO-BUILD" as the exact table name is **roadmap** |
| MERGE TO MAIN, "branch ≠ shipped" | CLAUDE.md §"Issue Done = code on main" — explicit verification command given in that section, read directly | convention |
| SHIP DOC, MINI-RELEASE, LINEAR DONE | CLAUDE.md's close-out sequence steps 4/7/9, read directly | convention |
| FRICTION CHECK (pink), "proposed · SUG-241" | No friction-line requirement or three-strike counting rule exists anywhere in current CLAUDE.md or `docs/epic-template.md` — confirmed by grep this session, zero hits. This is SUG-241 Phase 2's proposed scope, not yet written | roadmap |
| COLLECT SIGNALS, SOURCE OF TRUTH, NORMALIZE (Phase 7, ink) | `docs/workflows/release-assistant-prompt.md` Steps 1–2 / Gates 1–2, read directly | convention |
| CHANGELOG + NOTES, "Gates 3–4" | Same file, Gates 3 and 4 (Step 3A/3B) grouped into one diagram node for space — both gate numbers verified present via `grep -c "^### ✅ GATE"` = 7 total this session | measured |
| COMMIT + BACKLOG, "Gates 5–7, all select-list" | Same file, Gates 5/6/7 grouped. "All select-list" verified via `grep -c "AskUserQuestion"` in the same file returning 9 hits (more than one per gate in places) this session, and cross-referenced against the shipped `docs/shipped/SUG-227-formalize-ai-claude-workflow.md` epic confirming the conversion | measured |
| "Why Phase 1 is thin" callout box | Full text sourced verbatim from `docs/drafts/workflow-audit-v0.3-grounded.md`'s own section of the same name — an editorial/structural rationale, not an independently checkable code claim | convention |
| Legend | Diagram's own encoding, defined here and on the SVG — not an external claim | convention |

## Notes for whoever uploads or embeds this next

- **This diagram will go stale faster than the short one**, precisely because it carries
  more detail. Every pink marker has a real epic behind it (SUG-238 through SUG-245); the
  moment any one ships, its node's marker and sub-label are wrong until updated. Treat
  "update this diagram" as a standing line item on each of those epics' close-out, not an
  optional follow-up.
- **Both Design and Verification's vspec-related nodes now lead with "VSPEC," pink-bordered, captioned with the current reality ("still 'mock' today").** This was a real
  inconsistency in the first pass — the Design node led with "MOCK" (current term) while
  the Verification node led with "VSPEC-TO-BUILD" (target term) with no visual marker on
  the border to match, and Bex caught it as confusing rather than as two independently
  defensible choices. **When SUG-242 actually ships**, flip both nodes' borders from pink
  to ink and drop the "still 'mock'..." captions — don't leave one updated and the other
  stale, the same discipline as every other pink marker on this diagram.
- Same discipline as the short diagram's own note: once a pink-marked epic ships, either
  flip that node's marker to ink and remove the gap sub-label, or retire this version and
  produce an "after" diagram. Don't silently edit this one to claim a gap is closed
  before its epic has actually shipped and been verified.
