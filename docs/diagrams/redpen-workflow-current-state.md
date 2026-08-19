# Red-pen — Epic Lifecycle Current State SVG

**Diagram source:** `docs/diagrams/diagram-workflow-current-state.svg`
**Origin:** `docs/drafts/workflow-audit-v0.3-grounded.md` (gitignored working audit, not
committed) and `docs/drafts/sugartown-workflow-future-state-v3.html` (gitignored working
diagram, not committed) — this SVG is a formalized, brand-compliant summary of that
working analysis, not a 1:1 port. The detailed 40-node annotated version (orphaned-validator
detail, retrospective/user-story notes) stays a drafting artifact by design; this
committed version carries only what's needed to back the claims below.
**Date:** 2026-07-24 · **Status:** source committed, not yet uploaded or embedded
anywhere live. This table gates that step per CLAUDE.md's technical diagram red-pen
rule — re-check before any Sanity upload, article/node embed, or (per SUG-244) live
`/governance` embed.

One row per box, arrow, marker, and label that asserts something about the system.
Classes: **enforced-by-code** (a validator/build step/platform guarantee makes it true) ·
**measured** (empirical result with a committed record, verified this session by direct
read) · **convention** (documented rule, true by discipline, not machinery) · **roadmap**
(not true yet).

| Diagram element | Evidence (file / mechanism) | Class |
|---|---|---|
| INTAKE box, "optional" | CLAUDE.md's Phase 1 has no hard-stop equivalent to Phase 0; Discovery and Brainstorm are explicitly conditional per the source audit's diagram reading of CLAUDE.md's own phase descriptions | convention |
| PLANNING box, "Linear-first" | CLAUDE.md §"Epic authoring — Linear-first workflow": "Create a Linear backlog item first — this assigns the SUG-{N} tracking ID." Verified directly against the section text | convention |
| DESIGN box, "Phase 0 gate" | CLAUDE.md §"Phase 0 hard-stop (mockup gate)": "No code... may be written until: 1. The HTML mock exists... 2. The user has reviewed the mock." Read directly | convention |
| IMPLEMENTATION box, "reviewer unwired" (pink) | `.claude/agents/design-reviewer.md` exists (fresh-context, read-only, six review dimensions, documented in `docs/conventions/vqa-workflow.md`). `grep -n "design-reviewer" CLAUDE.md` returns zero hits across 797 lines — run directly this session. Both halves of the claim (agent exists; CLAUDE.md never names it) independently verified, not inferred | measured |
| VERIFICATION box, "3 validators orphaned" (pink) | `validate:css-names`, `validate:taxonomy`, `validate:tokens:sync` present in `package.json` scripts; cross-referenced against `.husky/pre-commit` and every job in `.github/workflows/ci.yml` — none of the three appears in either. Command and result both captured this session, not copied from a prior audit doc | measured |
| CLOSE-OUT box, "merge ≠ shipped" | CLAUDE.md §"Done vs Shipped" (renamed from §Issue Done = code on main, 2026-08-19, SUG-100 S2): explicit verification command given (`git branch --contains <sha> | grep main`), and `Shipped` requires the merge, the deploy, and CI concluding `success` together. Read directly | convention |
| RELEASE box, "5 gates, kept" | `docs/workflows/release-assistant-prompt.md` — `grep -cE '^### ✅ GATE [0-9]+ — STOP'` returns **5**, not the 7 this row previously claimed (corrected 2026-08-18 while resolving SUG-100 §Non-Goals — the earlier count had gone unremeasured). Each gate is already an `AskUserQuestion` select-list per the shipped SUG-227 epic (`docs/shipped/SUG-227-formalize-ai-claude-workflow.md`) — gate count and conversion status both verified this session | measured |
| FEEDBACK box, "loop not closed" (pink) | `.github/workflows/stats.yml` runs daily, collects real data, fails its own job on stale collectors — confirmed via live `stats.json` timestamps, same-day. No script anywhere in `apps/web/package.json` or `scripts/` reads that data back into the backlog — confirmed by direct search. Measurement is real; the read-back is not | measured |
| Dashed pink loop, Feedback → Planning, "EVIDENCE LOOP — PROPOSED, NOT YET BUILT (SUG-241)" | No such connection exists today — this is the epic's Objective statement (`docs/backlog/SUG-241-phase-8-feedback-loop.md`), drawn dashed and explicitly labeled per the red-pen gate's own rule that roadmap items must never be drawn as current state | roadmap |
| Legend definitions (solid ink box / pink box / dashed pink line) | The diagram's own encoding, defined in this file and on the SVG itself — not an external claim | convention |
| Footer epic references (SUG-239, SUG-240, SUG-241, SUG-242, SUG-244, SUG-245) | All six created this session via `mcp__plugin_linear_linear__save_issue`, with matching `docs/backlog/SUG-{N}-*.md` docs committed alongside this diagram — verifiable directly via the Linear URLs in each doc's header | measured |
| L1 badge, Intake | Bex's request to tie the six-layer AI-governance model to the workflow; layer definitions from `docs/ai/agentic-caucus/governance-coverage.md` Layer 1 (AI Inventory: shadow-AI detection, system classification, risk tiering, ownership assignment, model registry) — Intake is where an agent/task gets implicitly classified, read against the doc's own layer description, not independently re-derived | convention (a mapping decision, not a measured fact) |
| L5 badges, Planning + Design | Layer 5 (Human Oversight) explicitly named "Strong (signature layer)" in `governance-coverage.md`; "Decision review — Strong — Epic gates, Phase 0 mock gate" is the doc's own listed evidence, and both nodes are exactly those two gates | convention |
| L6 badges, Implementation + Verification + Release + Feedback | Layer 6 (Compliance and Audit) doc lists "Policy enforcement — pre-commit hooks, validators" (Implementation/Verification), "Audit trails — CHANGELOG" (Release), "Incident reporting — session post-mortems" (Feedback) as its own evidence rows — each badge maps to the specific evidence row that names it | convention |
| L2 badge, Close-out | Layer 2 (Data Foundation) doc lists "Lineage mapping — Epic doc, commit, ship doc trace decision lineage" — Close-out is where the ship doc is produced | convention |
| Legend note, "L3/L4 don't map to a single phase" | Layer 3 (Data Security) is rated "Inherited" (Sanity/GitHub/Netlify, not a workflow step) and Layer 4 (Model Assurance) is rated "Partial" and spans multiple phases diffusely (model cards, drift detection) rather than concentrating in one — both per direct read of `governance-coverage.md`, not simplified without basis | convention |

## Notes for whoever uploads or embeds this next

- This diagram deliberately does **not** carry the level of detail the working audit
  found — no per-validator breakdown, no retrospective/user-story annotations, no
  simplification notes (S1–S6 in the audit doc). Those live in
  `docs/drafts/workflow-audit-v0.3-grounded.md` for now, gitignored. If that analysis
  ever needs to go public, it needs its own red-pen pass — don't assume this table covers
  it.
- Every pink-marked gap here has a real, already-created Linear epic behind it
  (SUG-239, SUG-240, SUG-241). **When any of those ships, this diagram goes stale on
  purpose** — it documents the pre-fix state, matching the same discipline used in
  `redpen-sugartown-ontology-map-core-content-taxonomy.md`'s own note. Either update the
  affected box's marker from pink to ink and remove its gap sub-label, or retire this
  version and produce an "after" diagram — don't silently edit this one to claim a gap
  is closed before its epic has actually shipped and been verified.
- The "RELEASE box, 7 gates, kept" row asserts something slightly different from what a
  naive reading of the earlier draft audits implied: the *count* of gates (seven) is
  unchanged from before SUG-227, but their *mechanism* changed (typed exact-phrase →
  `AskUserQuestion` select-list). If a future session updates this diagram, don't
  conflate "gate count is stable" with "gates are unchanged" — the audit's own
  Simplification S1 explicitly corrected an earlier draft that got this wrong by
  recommending gate collapse without knowing SUG-227 had already shipped.
