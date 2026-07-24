---
**Epic:** SUG-242 — Vspec rename + prototype trigger (mock → visual spec)
**Linear Issue:** [SUG-242](https://linear.app/sugartown/issue/SUG-242/vspec-rename-prototype-trigger-mock-visual-spec)
**Status:** Backlog
**Priority:** 🟡 Medium — docs-only, no code impact, but blocks nothing else in the queue
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-242 — Vspec rename and prototype trigger

The Phase 0 artifact is renamed from **mock** to **vspec** (visual specification). It
gains a durability rule (approved copy preserved to `docs/shipped/`) and a fidelity
trigger (static by default, interactive when the epic introduces behavior a static
render can't convey). Documentation and convention change only — no code path is
touched.

**Source:** originally drafted as a standalone diff brief (`vspec-rename-diff.md`),
scoped to two files. Corrected here after grounding against the live repo — the actual
blast radius is six files, not two.

## Template adaptation — declared once

Convention-change epic. No Sanity schema, GROQ, or render-layer work; no code path
touched.

| Template section | Status | Reason |
|---|---|---|
| Component-Reuse Manifest | N/A | No component or visual surface created or modified |
| Doc Type Coverage Audit | N/A | No content doc type touched |
| Schema Field Proposal | N/A | No schema field added |
| Query Layer Checklist | N/A | No GROQ touched |
| Schema Enum Audit | N/A | No enum field rendered |
| Metadata Field Inventory | N/A | No metadata surface touched |
| Themed Colour Variant Audit | N/A | Documentation change only |
| Migration Script Constraints | N/A | No data transform |
| Human QA Walkthrough | N/A | No CSS/layout/rendering |
| Visual QA Gate | N/A | No visual output |

Phase 0 does not fire on this epic itself — renaming the artifact that Phase 0 produces
is not the same as producing one.

## Pre-Execution Completeness Gate [REQUIRED]

- [x] **Correct audit file paths** — all six files below confirmed to exist at the
  stated paths during the originating audit (`docs/drafts/workflow-audit-v0.3-grounded.md`
  Part 4, Correction 1)
- [x] **Scope ↔ Non-Goals consistency** — checked; shipped records are explicitly
  excluded in both Scope and Non-Goals, no contradiction
- [ ] **Instruction & Rule File Write Gate pre-flight** — every file this epic touches
  (`CLAUDE.md`, `docs/epic-template.md`, `docs/conventions/vqa-workflow.md`,
  `docs/conventions/design-handoff-template.md`,
  `docs/conventions/design-handoff-checklist-claude-design.md`,
  `.claude/agents/design-reviewer.md`) is rule-defining. Diff must be shown and approved
  before each write — this epic touches more rule files than any other in this batch.

## Context [REQUIRED]

CLAUDE.md's Phase 0 hard-stop names its artifact "the HTML mock," stored at
`docs/drafts/SUG-{N}-*.html`. The word appears throughout: the gate name, the sync rule,
the class-name rule, the violation statement, the reuse gate, the close-out visual QA
step, and the design handoff evaluation gate. `docs/epic-template.md` mirrors the
vocabulary. `docs/drafts/` is gitignored by an absolute rule, with one existing
exception: a draft that graduates is copied to its destination and the draft stays as a
local archive.

**Correction to the original brief's scope (found during the workflow audit, verified
directly against the live repo):**

| File | In original brief? | Why it's in scope |
|---|---|---|
| `CLAUDE.md` | Yes | 24 lines reference the artifact |
| `docs/epic-template.md` | Yes | 14 lines reference the artifact |
| `docs/conventions/vqa-workflow.md` | **No — missed** | Describes what the QA table judges against |
| `docs/conventions/design-handoff-template.md` | **No — missed** | References the artifact by name |
| `docs/conventions/design-handoff-checklist-claude-design.md` | **No — missed** | Same |
| `.claude/agents/design-reviewer.md` | **No — missed, highest risk** | Globs `docs/drafts/SUG-{N}-*.html` **at runtime** and is instructed "do not silently skip mock comparison when a mock is present." A rename to `.vspec.html` without updating this file keeps working today by luck (the glob still ends in `*.html`) — if that glob is ever tightened, the agent silently stops comparing against the spec and reports a clean table. This must be updated in the same commit as the rename, not discovered later. |

Also live in the repo, confirming the naming collision the rename is partly meant to
avoid: `apps/storybook/.storybook/main.ts` has a `storybook-mock-sanity` Vite plugin
resolving to `.storybook/mocks/{sanity,contentState,stats}.js` — "mock" already means
*test double* one directory away from where it means *Phase 0 output*. Not in scope to
modify (Storybook's own vocabulary is untouched), but confirms the rename's premise is
real, not theoretical.

No epic has previously touched this vocabulary.

## Objective [REQUIRED]

After this epic, the Phase 0 artifact is called a **vspec** rather than a mock. It is
stored at `docs/drafts/SUG-{N}-{slug}.vspec.html` while in flight and copied to
`docs/shipped/SUG-{N}-{slug}.vspec.html` at close-out, making acceptance criteria
durable and auditable — today the artifact the VQA table judges against lives in a
gitignored, unrecoverable directory. A mechanical **prototype trigger**, framed as an
escalation of the existing interaction-annotation rule rather than a new rule, determines
when a vspec must be interactive rather than static. No data layer, query layer, or
render layer is touched.

## Scope [REQUIRED]

**Phase 1 — CLAUDE.md, seven edit sites**
- [ ] Heading: "Phase 0 hard-stop (mockup gate)" → "Phase 0 hard-stop (visual spec gate)"
- [ ] Opening rule: replace "HTML mock" / "docs/drafts/SUG-{N}-*.html" language with
  vspec path + a new sentence: "A vspec is a visual specification, not a sketch. Its
  class names, spacing values, and annotated behaviours are binding on the
  implementation. It is the artifact the vspec-to-build comparison table judges against."
- [ ] Sync rule: "mock update" → "vspec update," "backlog doc and mock" → "backlog doc
  and vspec"
- [ ] Violation statement: "before mock approval" → "before vspec approval"
- [ ] Class name rule, **strengthened, not just renamed**: "Vspec class names are the
  production class names. Not a proxy, not a placeholder." Sub-rules (a)/(b)/(c) stay as
  written with "mock" → "vspec"; the `/* TBD */` escape hatch remains but a vspec that
  leans on it for most of its classes has not finished Phase 0.
- [ ] Entity detail page rule: "mock tab... HTML mock file" → "vspec tab... vspec file"
- [ ] Component reuse gate: "Produce an HTML mock at docs/drafts/SUG-{N}-*.html" →
  "Produce a vspec at docs/drafts/SUG-{N}-{slug}.vspec.html"; "Mock: not required" →
  "Vspec: not required, extending existing component"

**Phase 1 — CLAUDE.md, new subsection** (insert after the interaction annotation layer
rule)
- [ ] Add "Vspec fidelity — the prototype trigger": trigger list (scroll-spy, filtering,
  expand/collapse, tab/panel switching, sticky positioning whose effect depends on
  scroll, drag/reorder, persisted state); "build the interaction" means vanilla JS in a
  `<script>` tag, no framework, ~20 lines is normal; explicit statement that a prototype
  is the same artifact, same file, same gate, same comparison table — not a second
  artifact; annotation is not replaced by interaction, both are required when a trigger
  fires; if no trigger fires, do not add JS

**Phase 1 — CLAUDE.md, local-only directories + close-out sequence**
- [ ] Local-only directories: "HTML mocks" → "in-flight vspecs"; add the rule that an
  **approved** vspec is copied to `docs/shipped/SUG-{N}-{slug}.vspec.html` as step 6b of
  close-out, framed as the existing "draft that graduates gets copied" rule with
  `docs/shipped/` named as a destination
- [ ] Close-out step 3: "mock-to-implementation comparison table" →
  "vspec-to-build comparison table"
- [ ] New close-out step 6b, inserted between step 6 (move epic doc) and step 7
  (mini-release): "Preserve the vspec — copy the approved vspec from `docs/drafts/` to
  `docs/shipped/SUG-{N}-{slug}.vspec.html`. Commit with the step 6 doc move. Skip only
  if the epic had no vspec."

**Phase 1 — CLAUDE.md, design handoff evaluation gate**
- [ ] "originates from a design handoff (mock, gap-analysis doc, Figma export...)" →
  "originates from an *external* design handoff (gap-analysis doc, Figma export...)" —
  **drop the word, don't rename it**; in this sentence "mock" meant an inbound
  third-party artifact, not the Phase 0 output, and the vspec is what the handoff gets
  converted *into*, after the anti-checklist runs

**Phase 2 — the three missed convention docs**
- [ ] `docs/conventions/vqa-workflow.md` — update every "mock" reference to "vspec,"
  matching Phase 1's vocabulary exactly (this doc describes what the VQA table judges
  against — it must not fall out of sync with the artifact it describes)
- [ ] `docs/conventions/design-handoff-template.md` — same
- [ ] `docs/conventions/design-handoff-checklist-claude-design.md` — same

**Phase 3 — `.claude/agents/design-reviewer.md` (highest-risk file, do not skip)**
- [ ] Update the runtime glob from `docs/drafts/SUG-{N}-*.html` to
  `docs/drafts/SUG-{N}-*.vspec.html` (or broaden intentionally and say so) so the agent
  keeps finding the artifact it's instructed never to silently skip comparing against
- [ ] Update every "mock" reference in the agent's own instructions to "vspec"

**Phase 4 — `docs/epic-template.md`**
- [ ] Phase 0 heading: "Phase 0 — Mockup" → "Phase 0 — Vspec"
- [ ] Checklist item: "HTML mock produced and reviewed" → "Vspec produced and reviewed"
- [ ] Add checklist item: "Prototype trigger evaluated. If any trigger fired, the
  interaction is built in the vspec."
- [ ] Definition of Done: "mock-to-implementation table approved" →
  "vspec-to-build table approved"; add "Vspec copied to docs/shipped/"

**Phase 5 — local file rename (no history cost)**
- [ ] Rename existing files in `docs/drafts/` to `.vspec.html` — gitignored, local
  operation only, one file is sufficient as a naming smoke test (not all 47; see Non-Goals)

## Non-Goals [REQUIRED]

- **Renaming shipped records.** Everything in `docs/shipped/` keeps saying "mock" —
  deliberate. A record rewritten to match current vocabulary loses the ability to date a
  decision.
- **Retrofitting in-flight epics.** Apply on the next Phase 0, not mid-execution.
- **Building a prototype for anything.** This epic defines the trigger, it doesn't fire
  it.
- **Renaming all 47 files in `docs/drafts/`.** One renamed file is sufficient proof the
  naming convention works; the rest can be renamed opportunistically as they're touched.
  Some files in that directory aren't SUG-N vspecs at all (e.g.
  `AB-001_ledger_tradition.html`) and shouldn't be renamed at all.
- **Changing Storybook's own "mock" vocabulary.** `storybook-mock-sanity` and
  `.storybook/mocks/` stay exactly as named — they mean something different and correct
  in their own context.
- **Studio schema changes.** None are implied.

## Technical Constraints [REQUIRED]

- **Do not run sed across `CLAUDE.md` or `docs/epic-template.md`.** The design handoff
  evaluation gate's use of "mock" means something different (inbound third-party
  artifact) from every other use (Phase 0 output) — edit each site individually per the
  Scope list above, exactly as scoped, not via find-and-replace.
- Naive find-and-replace would also touch `docs/shipped/`, which must stay untouched —
  scope every edit to the six named files.

## Files to Modify [REQUIRED]

**Rule-defining docs (gated, diff shown before each write)**
- `CLAUDE.md` — seven edit sites, one new subsection, one new close-out step — Phase 1
- `docs/conventions/vqa-workflow.md` — Phase 2
- `docs/conventions/design-handoff-template.md` — Phase 2
- `docs/conventions/design-handoff-checklist-claude-design.md` — Phase 2
- `.claude/agents/design-reviewer.md` — runtime glob + vocabulary — Phase 3
- `docs/epic-template.md` — Phase 0 heading, two checklist items, two DoD lines — Phase 4

**Local, not committed**
- `docs/drafts/*.html` — one file renamed in place as smoke test — Phase 5

**Explicitly not modified**
- Everything in `docs/shipped/`
- `apps/storybook/.storybook/main.ts` and `.storybook/mocks/`

## Deliverables [REQUIRED]

1. All seven CLAUDE.md edit sites applied, plus the new subsection and close-out step
2. All three convention docs updated to match
3. `design-reviewer.md`'s runtime glob updated and verified against a real `.vspec.html`
   filename
4. `docs/epic-template.md` Phase 0 section, checklist, and Definition of Done updated
5. One local draft renamed to `.vspec.html`

## Acceptance Criteria [REQUIRED]

- [ ] `grep -rn "HTML mock\|mockup gate\|mock-to-implementation\|mock proxy" CLAUDE.md docs/epic-template.md docs/conventions/vqa-workflow.md docs/conventions/design-handoff-template.md docs/conventions/design-handoff-checklist-claude-design.md .claude/agents/design-reviewer.md` returns zero results
- [ ] `grep -rn "mock" docs/shipped/ | wc -l` returns a non-zero count, confirming
  shipped records were not rewritten
- [ ] The prototype trigger subsection contains an explicit trigger list, states a
  prototype is the same artifact as a vspec (not a second one), and states annotation
  is still required when a trigger fires
- [ ] Close-out step 6b exists between step 6 and step 7 and names the exact destination
  path
- [ ] `docs/epic-template.md`'s Definition of Done includes both "vspec-to-build table
  approved" and "vspec copied to docs/shipped/"
- [ ] `.claude/agents/design-reviewer.md`'s glob matches a real `.vspec.html` filename
  (test against the Phase 5 renamed file)
- [ ] At least one file in `docs/drafts/` has been renamed to `.vspec.html`
- [ ] `git status` shows only the six rule-defining files as modified — if `docs/drafts/`
  appears in `git status`, the gitignore rule has been broken; stop
- [ ] Every rule-file diff was shown and approved before writing

## Risks / Edge Cases [REQUIRED]

- **The design handoff sentence gets corrupted by a careless edit.** That sentence's
  "mock" means something different from every other instance in these six files. Edit it
  individually, verify the sentence reads correctly after the edit, before moving to the
  next site.
- **`design-reviewer.md`'s glob silently stops matching.** This is the highest-risk file
  in the epic — if the glob update is wrong or skipped, the agent keeps running but
  silently stops comparing against the vspec, and nothing in its own output would flag
  that (it would just report a clean table because it found nothing to compare against).
  The AC above requiring a live test against a real renamed file exists specifically to
  catch this.

## Post-Epic Close-Out [REQUIRED]

1. Visual QA gate — N/A
2. Chromatic — N/A
3. Data pipeline gap check — N/A
4. Move `docs/backlog/SUG-242-vspec-rename-prototype-trigger.md` →
   `docs/shipped/SUG-242-vspec-rename-prototype-trigger.md`
5. Confirm clean tree
6. `/mini-release SUG-242 Vspec rename and prototype trigger`
7. Transition SUG-242 to **Done** in Linear
8. Start next epic only after mini-release commit is confirmed
