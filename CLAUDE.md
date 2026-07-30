# Sugartown — Claude Code Conventions

> These conventions apply to all sessions in this repo. They supplement MEMORY.md
> (auto-loaded) and docs/epic-template.md (used for epic authoring).
>
> **Pink Moon is the canonical design system identity.** PRD v3.0:
> `docs/briefs/design-system/PROJ-003-design-system-prd.md`. Visual direction: sharp
> neutral surfaces, hot colour signal, EB Garamond headings,
> Courier Prime metadata, zero/minimal radius. Default mode: light.

---

## MCP Server

**Call `sugartown_get_epic()` and `sugartown_get_changelog(3)` at session start**, before acting.

Local MCP server at `packages/mcp-server`, started with `pnpm --filter @sugartown/mcp-server dev`. Tools: `sugartown_get_schema`, `sugartown_get_tokens`, `sugartown_get_component`, `sugartown_check_boundary`, `sugartown_get_rule`, `sugartown_validate_field`, `sugartown_get_epic`, `sugartown_get_changelog`.

## MCP Tool Aliases
When Bex uses a shorthand, map it to the full tool name:
  getschema      → sugartown_get_schema
  gettokens      → sugartown_get_tokens
  getcomponent   → sugartown_get_component
  checkboundary  → sugartown_check_boundary
  getrule        → sugartown_get_rule
  validatefield  → sugartown_validate_field
  getepic        → sugartown_get_epic
  getchangelog   → sugartown_get_changelog

## Session Discipline

### Epic close-out sequence

When an epic is complete, run these steps in order before starting the next epic:

1. **Commit** all epic changes with a scoped message (`feat(...)`, `refactor(...)`, etc.)
1b. **Route smoke tests** — `pnpm test:smoke` passes locally **and** the CI run for the merged commit concludes `success`. Five Playwright specs prove the app renders end-to-end, not just builds: homepage, one archive, one detail, one taxonomy route, a 404. A red suite blocks merge to `main` (SUG-240). **Record the run ID in the shipped doc** — `gh run list --branch main --workflow CI --limit 1 --json databaseId,conclusion`. "CI is green" is not an artifact; a named run is. If CI is known-red for reasons outside the epic, say so and name the tracking issue.
2. **Deploy schema** (if epic touched `apps/studio/schemas/`) — run `npx sanity schema deploy` from `apps/studio/`. Schema changes are not live until deployed. MCP tools, the Content Lake API, and embedded Studios all validate against the deployed schema, not local code. Skipping this step causes silent write failures.
3. **Visual QA gate (hard stop)** — wait for the literal text **"Visual QA approved"** before proceeding. The `docs/shipped/` move and mini-release are blocked until it arrives. If the epic has a vspec, produce the vspec-to-build comparison table (typography, spacing, colours, layout, each flagged Match / Drift / Missing) via the design-reviewer subagent (`.claude/agents/design-reviewer.md`, `docs/conventions/vqa-workflow.md`), which runs in a fresh context with no view of the session that wrote the code. **With no vspec, and only if every visual element was verified in-browser during implementation, cite that evidence per element instead of building a table** — rows all reading "Match", assembled afterwards from checks already run, give false confidence that a fresh review happened. The gate still fires and still blocks whenever a vspec exists or *any* element went unverified at implementation time; list those elements rather than padding the table with the ones that were. **If the epic shipped a detail, archive, or entity page**, open a sibling page of the same kind (e.g. new entity page vs `/tools/vercel`) and compare shell, folio, section labels, grids, chips. Unjustified structural divergence is a Drift row.
4. **Chromatic** — run Chromatic VRT. If deferred, annotate the shipped doc with `<!-- Chromatic: pending -->` and a note. Deferral is a checklist deferral only — it does not unblock the shipped/ move. **"Defer Chromatic" is not the same as "epic is closed."**
5. **Data pipeline gap check** — if the epic extended a build-time data pipeline (stats, CrUX, LHCI, etc.) and real data has not yet flowed through CI, document the gap in the shipped doc: what env var or cron is needed, what the expected data shape looks like, and what the current `stats.json` state represents (real vs seeded). Close-out is permitted but the gap must be explicit and visible.
5b. **Verify handoffs landed.** If close-out defers work to another epic, open that epic's doc and confirm each deferred item is in its **Scope** — not mentioned in prose, not assumed to be "that epic's axis". Add it if missing. (SUG-230 deferred three items to SUG-231; none reached its Scope.)
6. **Move epic doc** from `docs/backlog/` to `docs/shipped/` — commit: `docs: ship SUG-{N} {name}`. **If this move follows an edit to the doc in the same turn** (e.g. adding a close-out summary before moving it), run `git diff --cached --stat` (or `git show --stat HEAD` right after committing) to confirm the file actually carries the expected content change, not just a rename with 0 insertions/deletions. `git mv` does not guarantee a prior unstaged edit rides along silently — verify, don't assume.
6b. **Preserve the vspec** — copy the approved vspec from `docs/drafts/` to `docs/shipped/SUG-{N}-{slug}.vspec.html`. Commit with the step 6 doc move. Skip only if the epic had no vspec.
7. **Mini-release** — run `/mini-release` for a patch bump and CHANGELOG stub. **Only on `main`, after the epic's commits are merged, never on an unmerged branch**, because `package.json`'s version is a shared counter and a branch computes "next version" from a disconnected view of it. Merge first, then run it from `main`. **Whenever this step is deferred** (strategy (b), or any other reason), still add the epic's one-line summary to `CHANGELOG.md`'s `[Unreleased]` buffer at ship time. The CHANGELOG line and the version bump are separate obligations. A close-out doc saying "Done" with no `[Unreleased]` line is incompletely closed.
8. **Update Linear** — transition the SUG-{N} issue to **Done**
8b. **Incident log check** — if this epic fixed something already shipped (a regression that reached production, a gate found not firing, a published claim found false), append an entry to `docs/ai/agentic-caucus/incident-log.md` before closing, with both `Introduced` and `Noticed` dates — Mean Time To Notice needs both captured at the time. Run `pnpm mttn` afterwards. If the epic fixed nothing already-shipped, state "no incident" in the close-out; silence is not an answer.
9. **Clean tree** — confirm `git status` is clean before starting the next epic

Do not carry uncommitted changes across epic boundaries. If the tree is dirty when a new epic begins, commit or stash (`git stash push -m "WIP: SUG-{N} — <reason>"`) first. Narrative: [[rule-register]] §RULE-002.

### Verify before citing — don't trust a prior claim

**Before recording any claim about a file you did not just read, check it directly.** Confirm the path resolves, and measure counts and values with a direct check (`grep -c`, opening the file, rendering it) rather than copying a prior audit doc's number. A wrong reference becomes the next session's false starting assumption. (SUG-192: three of SUG-191's audit rows named a file that does not exist.)

**This applies to all epic authoring, not only audit epics.** Check two claim types before writing them into an epic doc: (a) claims about a prior epic's outputs — open the files and confirm the output exists; (b) "no blocking dependencies" — read the backlog for in-flight epics touching the same files or layer, and state why each is or isn't blocking. (SUG-224 got both wrong.)

**To measure a gate's state, run it locally and read the output.** Do not summarise from a CI log. `turbo run` stops at the first failing package, so CI logs undercount. (SUG-255: CI showed 7 lint errors, a local run found 84 across three packages.)

Narrative: [[rule-register]] §RULE-003.

### Verification review (blocking)

Before building anything that adds or changes a gate, validator, test, deploy path, or a
published claim about the platform, run the `verification-reviewer` subagent and add a row to
`docs/ai/agentic-caucus/control-register.md`. Run it as a subagent, not inline: a review inside
the session that wrote the plan ratifies its own reasoning.

Five questions per control: what artifact proves it ran, what broken input must make it fail,
what path reaches production without it, does it publish a claim (needs a measurement date and
a reproducing command), and who reads the result by when.

Enforced by `pnpm validate:controls`. Full rules: `docs/conventions/verification-review.md`.

### Instruction writing style

Anything written to be followed rather than read follows
`docs/conventions/instruction-writing-style.md`: instruction first, said once, no closing
aphorism, rationale gets one clause or its own file. Applies to this file, skills,
conventions, epic docs and session replies alike. `docs/brand/brand-voice-guide.md` covers
reader-facing content only.

### Epic authoring — Linear-first workflow

When creating a new epic in `docs/backlog/`:

1. **Create a Linear backlog item first** — this assigns the SUG-{N} tracking ID
2. **Name the file** `docs/backlog/SUG-{N}-{descriptive-name}.md`
3. **Link the Linear issue** in the file header (`**Linear Issue:** SUG-{N}`)
4. **Prioritize in Linear** — the Linear queue is the single source of truth for priority order

`docs/shipped/` holds shipped epics; `docs/backlog/` holds unscheduled and in-flight ones. Legacy `EPIC-NNNN` files in `docs/shipped/` stay as-is.

### Process feedback loop — three-strike retrospective trigger

Every shipped epic doc's Post-Epic Close-Out states one sentence: what cost a correction commit this time (`none` is a valid answer — `docs/epic-template.md` step 3b). When the same friction — by plain-language similarity, a human judgment call, **not a string match** — appears in three shipped docs, run `/post-mortem` against that pattern. Full mechanics, the monthly product-evidence loop it pairs with, and why this stays a human read rather than a mechanized check: `docs/conventions/feedback-loop.md` (SUG-241).

### Mid-epic commit checkpoints

Commit after each independently-working feature. Do not save it all for one end-of-epic commit. If a session may run out of context, commit work-in-progress with a `wip(epic):` prefix before it ends.

**Push the feature branch after each checkpoint.** Branch pushes do not trigger Netlify deploys, so they are free, and code on one disk is one hardware failure from gone.

**When the epic runs directly on `main`**, pushing triggers a deploy, so the free-push escape hatch does not apply. **Above ~15 unpushed commits, or at any session end, either push and accept one deploy or create a `wip/<epic>` branch and push that.** (SUG-231: 48 commits existed nowhere but one disk for two days.)

### Linear Done = code on main

**Before transitioning any Linear issue to Done, confirm the work is merged to `origin/main`**, not merely pushed to a feature branch:
```bash
git branch --contains <commit-sha> | grep -qE '^(\*|\s)+ main$' && echo "on main" || echo "NOT on main"
```

The close-out sequence enforces this naturally (merge → mini-release → ship doc → Linear Done). This rule is the backstop for a skipped or partial close-out, e.g. a multi-phase epic where one phase did not merge.

### Linear status = workflow stage

Linear issue status is a byproduct of running the existing Sugartown epic workflow, not a
separately maintained field:

| Sugartown stage | Trigger | Linear status |
|---|---|---|
| Epic created | `/new-epic` Step 1 | `Backlog` |
| Promoted to `## 01 · Next` in the priority stack | `/new-epic` Step 4, or any later reprioritization | `Todo` |
| Implementation begins | Pre-Execution Completeness Gate passes (`docs/epic-template.md`) | `In Progress` |
| Epic ships | Close-out sequence step 8 (below) | `Done` |

Full mechanics: `.claude/skills/new-epic/docs/new-epic-prompt.md` and `docs/epic-template.md`
§Epic Lifecycle. Cross-epic dependencies stated as "blocked on SUG-X" in a backlog doc must
also exist as a real Linear `blockedBy`/`blocks` relation (Linear MCP `save_issue`) — a
dependency written only as prose is invisible to anyone using Linear as the priority queue.
Linear's priority field (4 tiers) mirrors the backlog priority emoji; there is no API-exposed
manual sort-order field, so exact drag-order parity within a tier is not guaranteed — priority
tier + Linear's own default sort is the accepted fallback (SUG-246).

### Scope creep (blocking)

Work found mid-epic that will not be done in this epic gets filed before the epic
continues. Claude files it, not the human.

| The finding | Destination | Artifact |
|---|---|---|
| Belongs to the current epic | Scope line, assigned to a phase | doc edit |
| Belongs to an existing epic | Sub-issue under it, plus a Scope line in its doc | Linear + doc edit |
| Net-new | `/new-epic`: Linear issue, backlog stub, priority row | full stub |

In the same turn the finding is recorded, Claude owns: the Linear issue or sub-issue, the
backlog doc or Scope line, a proposed priority, the execution order relative to the current
epic, and any `blockedBy`/`blocks` relation (SUG-246). Priority is proposed, not set: the
Linear queue stays the human's.

Does not fire for a finding fixed inline in the same session, or an observation with no
proposed change.

Verified at close-out step 5b, and by `pnpm validate:epic-docs` once it exists. Sub-issues
depend on SUG-238; until it lands, use a Scope line in the target epic's doc for the middle
row. (2026-07-27→28: six issues reached Linear with no doc and no priority row.)

### Multi-phase epic merge cadence

When an epic has numbered phases, declare one of two strategies in the epic doc header when the epic opens, and stick to it:

- **(a) Merge-as-you-go** — each phase merges to `main` on completion with its own mini-release. Phase N is "Done" in Linear only after its own merge.
- **(b) Single close-out** — all phases accumulate on one feature branch. Nothing merges until the epic ships. One mini-release at the end.

**Do not mix.** Merging Phase 1 and 1b while leaving 1c on a side branch is what stranded SUG-63 Phase 1c for days. At `/eod`, any branch ahead of `main` belonging to an (a)-strategy epic is resolved — merged, held with a stated reason, or abandoned — before the day closes.

**Never run `/mini-release` on a feature branch before merging.** Two epics mid-flight on separate branches each compute "next version" from a stale `package.json`, producing numbers that collide or silently mis-resolve at merge. A same-value bump on both sides resolves without conflict and is still wrong. Merge to `main` first.

### Merge conflict cleanup

Never end a session with an unresolved merge conflict. Either resolve it and commit the merge, or abort it (`git merge --abort`) and document why. One left overnight blocks the next session's morning housekeeping and leaves the working tree state unclear.

### Browser testing pre-flight

Before asking the user to test anything in their browser:

1. **Confirm they have pulled the latest code** — "Have you pulled the branch? `git pull origin <branch>`"
2. **Never claim a dev server is reachable at `localhost`** unless the session runs on the user's own machine. If the environment is remote, tell them to start the server from their local terminal.
3. **In a worktree session, check which tree the server is serving** before any preview verification. The main app and each worktree run independent servers on different ports:
   ```bash
   lsof -ti:5173 | xargs -I{} lsof -p {} 2>/dev/null | grep cwd
   ```
   If the `cwd` path does not contain the current worktree name, that server belongs to another tree. Start one from inside the worktree; it binds to `5173`, or the next free port.

### Local-only directories (gitignored)

**`docs/drafts/` is local-only: gitignored, never committed.** It holds working drafts, manifestos, in-flight vspecs, GIFs, and exploration docs, which stay on Bex's machine until they move elsewhere (Sanity, `docs/briefs/`, `docs/shipped/`).

- Never `git add` a file there, and never ask whether to commit drafts. The answer is no.
- When a draft graduates to a brief or a Sanity document, copy it to the destination and leave the draft in place as a local archive.
- If `git status` shows one as "deleted", it was previously tracked — untrack it with `git rm --cached`.

### Generated stats files — dirty tree behaviour

`apps/web/src/generated/stats.json` and `stats.last-good.json` are **tracked files** that the CI stats pipeline updates on every build, committed as `chore(stats): update trust signals [skip ci]` rather than by local sessions.

**Showing as modified is their normal state: do not commit them manually and do not treat them as a dirty-tree blocker.** Ignore them when checking tree cleanliness before a mini-release or `/eod`. `.gitignore` blocks `git add <path>` but not `git add -u`, so they can still end up staged — in which case committing them is fine. CI is the authoritative committer.

### Phase 0 hard-stop (visual spec gate)

**What triggers this gate: an unreviewed visual format reaching a user.** Not an epic's structure, and not whether a phase is labelled "Phase 0". The test: would this change render something a human has not signed off on? If the work adopts an already-shipped, already-reviewed design — porting a canonical component to a second copy, or a change whose only rendered surface is Storybook — the gate does not fire; record that decision in the epic doc. An epic with no phase called "Phase 0" still trips the gate the moment it invents a visual format. Narrative: [[rule-register]] §RULE-017.

**No code in `apps/web/src/`, `apps/studio/schemas/`, or any other implementation path until** (a) the vspec exists at `docs/drafts/SUG-{N}-{slug}.vspec.html`, and (b) the user has reviewed it and the Phase 0 checkboxes are marked complete. Permitted before sign-off: backlog doc edits, schema planning notes, query design notes. Not permitted: any JSX, CSS, schema TypeScript, or migration scripts. Committing FE code before vspec approval is a process failure.

A vspec is a specification, not a sketch: its class names, spacing values, and annotated behaviours bind the implementation, and it is what the vspec-to-build comparison table judges against. Updating the backlog spec triggers a vspec update in the same response, so the two stay in sync.

**Response mechanism:** a select-list gate per `docs/conventions/human-gate-conventions.md` — present the vspec, then ask via a single select option.

Three cases look exempt and are not:

- **A new block on an existing page.** A new data-backed block (challenge summary, outcomes strip, sidebar widget) needs a vspec even though the page template exists. The test is whether the block's visual format has been reviewed, not the size of the change.
- **A new entity detail page** (Person, Project, Tool, Client) even when a general shell exists. Each has a folio: logo/avatar plus identity block with eyebrow, name, description, metadata. Lock the folio layout, thumbnail size, eyebrow content, and any interactive links in the vspec before writing JSX. "The shell exists, I'll figure out the folio interactively" is a violation. A new entity type needs its own approved vspec tab.
- **A navigation surface**, which needs the annotation layer below.

**A nav surface must annotate behaviour, not just show it.** Any sidebar, nav rail, tab bar, or anchor-bearing surface annotates all six before sign-off:

- Active state (which item, and how — border, colour, weight)
- Hash/anchor behaviour (does clicking scroll? does the URL update?)
- Scroll-spy (does the active item update on scroll?)
- Sticky/fixed behaviour (does the nav stay in view while content scrolls?)
- Mobile collapse (below the breakpoint)
- Click side-effects (scroll-to-top, panel open/close)

Reusing an existing behaviour is annotated as such — "same as PageSidebar scrollspy" — not left blank, or the behaviour gets re-discovered and re-implemented. A vspec showing nav items without these six is incomplete for sign-off.

**A vspec becomes an interactive prototype when any of these fires:**

- Scroll-spy (active state that changes on scroll)
- Filtering (visible content changes on user input)
- Expand/collapse
- Tab or panel switching
- Sticky positioning whose effect depends on scroll
- Drag/reorder
- Persisted state (survives navigation or reload)

Build the interaction as vanilla JS in a `<script>` tag in the vspec file — no framework, no build step, ~20 lines is normal. It is the same artifact: same file, same gate, same comparison table, not a second review. Annotation is still required alongside a working prototype. If no trigger fires, add no JS.

**Vspec class names are the production class names.** They are the first expression of a CSS class's name, so `.tag-row` in a vspec ships as `.tag-row`. Use the semantic name you intend to ship (`.listRow`, `.flatGridRow`); if it is not settled, use a generic placeholder (`.list-row`, `.btn-strip`) marked `/* TBD */`; never name a class after its content type (`.tag-row`, `.tool-folio`, `.tax-item`). A vspec class that would fail the CSS pre-implementation reuse audit is a violation, and a vspec leaning on `/* TBD */` for most of its classes has not finished Phase 0.

### Incomplete epic doc hard stop

Before executing any epic from `docs/backlog/SUG-{N}-*.md`, check the file for completeness. If any of the following are unresolved, **stop and surface the gap before touching any file, Sanity document, or schema:**

1. **Background is `TODO`** — the motivation is unclear; execution without it is guesswork
2. **Scope items are incomplete or contain `TODO`** — no defined acceptance surface means no defined stopping point
3. **Phases are undefined** — multi-phase work cannot be sequenced
4. **"All pages" scope without an `App.jsx` routing read** — any epic claiming to cover "all pages", "all archive pages", "all detail pages", or any broad page category must read `apps/web/src/App.jsx` and diff the listed pages against the actual routes before Scope is complete. Memory and agent outputs are not authoritative
5. **Mechanical-transform scope without a verified per-item classification** — any epic proposing the same operation across a set of files ("replace every X with Y", "migrate all N components") must classify every item first. Do not infer the set's uniformity from one representative file or a TODO comment. (SUG-224: "44 mirrors" was 26 mirrors, 6 adapters, 6 diverged, and 6 with no counterpart.)
6. **A Scope item that names no phase** — `Scope ∖ Phases` must be empty. An item outside every phase never gets sequenced. (SUG-231: one survived four phases of review.)
7. **Scope amended without re-reading Non-Goals** — when Scope gains an item, re-read Non-Goals in the same edit and reconcile any conflict before writing code. (SUG-231: Scope and Non-Goals contradicted each other for a day.)

**Correct response:** name the stub sections ("Background is TODO, Phases are undefined"), then offer either (a) fill the doc collaboratively, or (b) run an audit pass and wait for approval before implementing. Do not fill in the blanks yourself and proceed.

Applies to all epic types, including pure content and editorial epics. Narrative: [[rule-register]] §RULE-018.

### Design handoff evaluation gate (SUG-163)

Before scoping any epic that originates from an *external* design handoff (gap-analysis doc, Figma export, or equivalent), evaluate the handoff against `docs/conventions/design-handoff-template.md`. Run the anti-checklist and flag every item that would introduce a framework assumption, invented schema field, literal URL path, content-type-prefixed CSS class, or PT-replacement array. Surface corrections in the epic doc's "Handoff corrections" section before Phase 0 sign-off.

### React hooks — Outlet context pre-flight

Before adding `useOutletContext()`, `useContext()`, or any new hook to a component that already has conditional early returns (`if (loading) return`, `if (notFound) return`, template guards, etc.):

1. **Scan the component for all early returns** — list them.
2. **Confirm all hook calls appear before the first early return** — hooks must be called unconditionally on every render.
3. If the hook's _logic_ depends on data that isn't available yet (e.g. `leadHero` before the page loads), put the guard inside the hook's callback or effect — not around the hook call itself.

This is a React Rules of Hooks enforcement step. A hooks-order violation crashes silently in dev (React error boundary) and produces a blank page with a cryptic "change in order of Hooks" warning. The fix is always the same — move the hook up — but it costs a correction commit. The pre-flight costs 30 seconds.

### No speculative fixes

When the user reports a bug (white screen, crash, visual regression):

1. **Request the error first** — ask for the browser console output or a screenshot before writing code.
2. **Do not commit a fix based on a guess.** Speculative patches add noise commits and can mask the real issue.
3. If a fix commit turns out to be wrong, squash it into the original commit before merging.

### Worktree path discipline

When a session is running inside a git worktree (`.claude/worktrees/<name>/`), **all `Edit` and `Write` tool calls must target the worktree path**, not the main app tree.

Before the first file write in any worktree session:

1. Confirm the target path starts with the worktree root: `.claude/worktrees/<worktree-name>/`
2. If the environment block shows `Primary working directory: /Users/.../sugartown/.claude/worktrees/<name>`, every file path in `Edit`/`Write` calls must use that prefix — not `/Users/.../sugartown/apps/web/...`

**The failure mode:** writing shared CSS (e.g. `pages.module.css`) to the main app's copy instead of the worktree's copy produces a silent visual regression — the main tree's dev server shows the change, but the worktree branch does not. The build succeeds; the layout breaks.

**Recovery:** if a wrong-path write has occurred, read the worktree file to confirm it's missing the change, then re-apply the edit to the correct path. Do not assume the file state is correct without verifying the path.

### CSS Triage Protocol

Before writing a CSS fix for overflow, scrollbar, or layout collapse: **identify the exact DOM element** that owns the misbehavior (via DevTools screenshot or `preview_inspect`). Document:
1. The element's class name
2. Its computed `overflow`, `width`, and `box-sizing` values
3. Its parent's containment context

Do not write CSS until this is documented. Guessing which container has the overflow leads to multi-round blind patching.

**bg-through-gap pattern documentation rule:** When a container uses `background-color: var(--st-color-rule-accent)` with `gap: 1px` to produce hairline dividers, every child element that covers the gap background must carry an explicit `background` declaration — even if it looks redundant. Annotate it:

```css
background: var(--st-card-bg); /* covers parent --st-color-rule-accent gap bg */
```

Removing this annotation-less `background` declaration is a recurring mistake: the repair looks like dead code but is load-bearing. If a bg-through-gap pattern is not serving the layout (because all dividers can be expressed as `border` rules on adjacent siblings), replace the pattern entirely with `> * + *` adjacent-sibling border rules — and document the replacement in the commit message — so it cannot be misread as dead code in future.

### CSS layout fix escalation rule

When a CSS layout fix fails and requires a follow-up commit, **stop and diagnose before patching**. Write a 1-paragraph root-cause analysis covering the full cascade (containment → flex/grid → margin → max-width → child sizing) before writing the next fix.

If 2+ fix commits address the same layout surface in sequence, treat it as a signal to step back, map the full constraint chain, and fix the root cause, not the symptom.

**Self-check after every CSS fix commit:** grep for the same selector(s) in the prior 3 commits. If the same surface appears in a recent fix, halt and write the root-cause paragraph before the next fix. Two consecutive fix commits on the same CSS surface without a documented root-cause analysis is a process failure.

### `container-type` guardrail

`container-type: inline-size` establishes size containment that can interfere with flex-grow negotiation. Before applying it:

1. Verify the element does **not** use `margin: auto` on the inline axis (auto margins + containment prevents stretch)
2. Verify the element's parent flex/grid context does not rely on the child growing beyond its basis
3. If the element is a flex child, add `width: 100%` explicitly — do not rely on `align-items: stretch` surviving containment

If a layout collapses after adding `container-type`, remove the containment first and replace the `@container` query with a `@media` query or intrinsic grid sizing (`minmax()`).

### Studio schema changes get their own commit

Any change to `apps/studio/schemas/` that is **not** a direct consequence of a DS component API decision belongs in a separate commit scoped to a studio concern — it must **not** be bundled into a component, tooling, or web epic commit.

Commit prefix: `feat(studio):` or `fix(studio):`.

If a schema change is needed to unblock a component epic, commit the schema change first, then begin the component work in a subsequent commit.

**Schema changes are not live until deployed.** The local Studio uses your code directly, but MCP tools (`create_documents`, `patch_documents`, etc.) and the Content Lake API validate against the **deployed** schema. After any schema change, run:

```bash
npx sanity schema deploy
```

If you skip this step, MCP writes will fail with validation errors listing the old allowed types, even though Studio works fine locally. This is the single most common cause of "the schema has the field but MCP rejects it" confusion.

### Paired schema convention

When an **object schema** and a **document schema** represent the same logical concept, they are a linked pair. Any change to option labels, field names, validation rules, or field descriptions on one must be reviewed against the other in the same commit.

Known pairs:
- `ctaButton` (object, `schemas/objects/ctaButton.ts`) ↔ `ctaButtonDoc` (document, `schemas/documents/ctaButtonDoc.ts`)

When adding a new object/document pair, register it in this list. A fix to one half of a pair that misses the other is a bug, not a follow-up.

### Single Field Authority

Each user-facing concept (label, title, description, URL) must resolve from **exactly one field**. If a sub-object (e.g. `linkItem`) brings a field that overlaps with a parent schema field (e.g. `ctaButton.text` vs `linkItem.label`), one must be canonical and the other must be hidden or removed in the same commit.

Two fields that could plausibly hold the same value is a bug, not a feature. When composing a sub-object into an existing schema, audit the parent for field-purpose overlap before merging.

### Section Layout Contract

All page sections rendered by `PageSections.jsx` follow these rules. The principle behind 1–5: **internal padding is the component's concern, external spacing is the layout's.**

1. **Parent owns gap.** In `context="detail"`, `.detailContext` owns inter-section spacing via `display: flex; flex-direction: column; gap: var(--st-space-section-break-detail)`. Sections carry **zero vertical margin and zero vertical padding** there. Internal component padding is fine; external margin is not. (Without this, adjacent sections stacked 40+40=80px.)
2. **Flex child width.** All direct children of `.detailContext` need `width: 100%`, or they shrink to content width — heroes collapse to their inner max-width, callouts hug text, CTA sections shrink to button width. `.detailPage` controls max-width (760px); children stretch to fill.
3. **Catch-all over whitelist.** The `.detailContext` override uses `> *`, so new section types inherit the rules without registration, including those with their own CSS modules. Apply targeted exceptions (e.g. hero `overflow: visible` for overlays) as named overrides after the catch-all.
4. **Component margin zero.** A component with `margin-block` in its own CSS module needs a zero-margin override in detail context: `.detailContext .calloutSection :global(aside) { margin-block: 0 }`.
5. **Boundary elements.** Elements between two spacing contexts (e.g. MetadataCard between the hero and `.detailContext`) belong to neither flex container and need explicit margin: `.detailPage > aside:first-child { margin-bottom: var(--st-space-section-break-detail) }`. When adding an element to a detail page template, check which side of the `.detailContext` wrapper it falls on.
6. **Typography.** Body text uses `var(--st-font-heading-4)`, headings the `var(--st-font-heading-*)` scale, h2 colour `var(--st-color-brand-primary)`.
7. **Container width pre-flight before adding a grid.** A 2-col `<Grid spacing="lg">` needs `2 × 200px + 32px = 432px` minimum content width. If the container is `--st-width-detail` (760px) or narrower, check whether that width was chosen for prose density rather than grids — entity detail pages with content grids need `--st-width-detail-wide` (1080px). Update the container in the same commit as the grid.

**When adding a new section type:** verify it renders next to existing section types on a real page, not in isolation; test both `context="detail"` and `context="full"`; confirm it stretches to full width; add a zero-margin override in `PageSections.module.css` if the component has its own `margin-block`; and check spacing against `/articles/test-preview-post`, which covers every section type and transition.

### `Grid spacing="0"` takes borderless children only

A `<Grid spacing="0">` draws its hairlines with a bg-through-gap pattern, so its children must be borderless tile primitives (`StatCard`, or any component with no `border` declaration of its own). Never put `<Card>` inside one — it carries `border: 1px solid var(--st-card-border)`, which stacks against the grid's outer border and renders a double border. Full usage rules: `Foundations/Layout/Grid` in Storybook (SUG-152 Phase 7).

### GROQ projection audit for nested image types

When writing a GROQ projection for an array of objects that contain image fields, verify the depth of the asset reference. Schema types that wrap `image` in another object (like `richImage`) require flattening:

```groq
// richImage: asset is a field of type 'image', which itself contains asset._ref
images[] {
  "asset": asset.asset->,   // dereference the INNER reference
  "hotspot": asset.hotspot,
  "crop": asset.crop,
  alt,
  caption
}
```

Do **not** write `asset->` on a `richImage` — that dereferences the `image` object, not the reference inside it, and silently returns null.

### Content Write Gate (hard stop — all Sanity MCP writes)

Before writing any content to Sanity via `patch_documents`, `create_documents`, or any equivalent MCP tool — when the content was not explicitly pre-specified by the user — produce a proposal and wait for explicit approval.

**Proposal format:** For each document being changed, show a before/after table:

| Document | Field path | Current value | Proposed value |
|----------|-----------|---------------|----------------|

**The gate fires when:**
- Copy, headings, body text, or CTAs are derived from the AI's interpretation of a brief rather than literal user instruction
- Content is being removed (unset operations on Sanity arrays — bullets, items, sections, cards)
- The epic doc that scoped the work had `TODO` placeholders in Background or Scope
- The user's instruction was directional ("reframe the About page") rather than explicit ("set the hero heading to X")

**The gate does NOT fire for:**
- Field values explicitly dictated word-for-word by the user in their message
- Pure structural/technical patches: taxonomy backfill, slug fixes, schema migration, field reordering — no human-readable copy touched
- Publish/unpublish operations (governed separately — see §The Human-Publishes Rule below)

**Wait for** explicit approval — "yes", "confirmed", "looks good", or equivalent — before executing any patch. A follow-up question from the user is not approval.

This rule operationalizes `ai-ethics-and-operations.md` Principle 6 ("AI can suggest copy; humans verify it isn't confidently wrong") and Principle 7 ("every AI-generated output has a human checkpoint") as a structural enforcement gate rather than aspiration. The fail-softly layer (drafts require human publish) is the last line; this gate is the first.

**Response mechanism:** a select-list gate per `docs/conventions/human-gate-conventions.md` — present the before/after table, then ask via a single select option rather than requiring a typed word.

### The Human-Publishes Rule (hard stop — publish/unpublish operations)

The agent drafts. The agent proposes. The agent patches Sanity documents once a proposal is approved. The agent never publishes them.

**Scope:** every action that makes a Sanity document, or an edit to one, go live — `publish_documents` and `unpublish_documents`, and any equivalent tool call, on any document type, in any dataset. No exceptions by content type: this covers glossary terms, articles, nodes, case studies, taxonomy, schema-adjacent content, everything.

**No prior approval carries forward to publish.** Approving a proposal under the Content Write Gate authorizes the write to the *draft*. It does not authorize the publish. These are two separate actions requiring two separate sign-offs, even when they happen in the same conversation. "Yes, that copy looks good" approves the draft. It is not "yes, publish it."

**The only way the agent publishes something is an explicit, standalone instruction to do so** — "publish that," "make it live," "go ahead and publish" — given as its own instruction, not inferred from approval of the content itself. Absent that explicit instruction, every skill and every session stops at the draft and tells the human what's ready and where to find it — typically: open it in Studio and click Publish.

This is the fail-softly layer referenced above: even a Content Write Gate failure — content written without a proper proposal — stays contained to a draft nobody sees until a human deliberately publishes it. Every skill that writes to Sanity (`/glossy`, `/write-blog`, `/write-node`, `/write-casestudy`, `/red-pen`) stops at this same line.

**Response mechanism:** a negative/absence gate per `docs/conventions/human-gate-conventions.md` — no prompt shown; block on the absence of a standalone publish instruction, message kept to one sentence.

### Instruction & Rule File Write Gate (hard stop — skill/CLAUDE.md/governance doc edits)

The agent — or any subagent it spawns — never edits a rule-defining file (`.claude/skills/**`, this file, `docs/epic-template.md`, or anything under `docs/ai/agentic-caucus/`, `docs/conventions/`, or `docs/diagrams/`) without first showing the human the exact diff and getting explicit approval. Applies even when the edit is accurate and well-intentioned.

**Why its own gate:** Sanity content has a draft/published split — an unapproved write stays inert until a human publishes it. Rule files don't have that boundary. A committed change to CLAUDE.md or a skill definition is load-bearing immediately, for every future session.

**Scope:** covers the orchestrating session *and* any subagent it spawns. A subagent told to review X has no implicit authority to also edit X's own instructions, however reasonable the addition looks.

**For subagents specifically:** when a task could plausibly touch a rule-defining file, forbid it from writing there and have it return proposed changes as text in its report instead. A subagent's own commit is never the final word — the orchestrating session reviews before surfacing anything to the human.

**Response mechanism:** a select-list gate per `docs/conventions/human-gate-conventions.md` — show the exact diff, then ask via a single select option.

### Sanity MCP content writes — no AI rewriting

> **Note:** This rule governs the *tool* used to write content (no AI rewriting pipeline). The Content Write Gate above governs *whether* to write at all without prior human approval. Both apply independently.

When writing content to Sanity via MCP tools, **assume all content is final, proofed copy**. Do not use tools that pass content through Sanity's AI pipeline unless the user explicitly requests AI-assisted drafting.

**Default tools (verbatim, no rewriting):**
- `patch_documents` — sets exact field values
- `create_documents` — creates docs with precise content, structured JSON only
- `@sanity/client` via migration scripts — direct API, no intermediary

**AI-assisted tools (rewrite content — require explicit user consent):**
- `create_version` with an `instruction` param — intentional AI rewrite of a document
- `generate_image` / `transform_image` — AI image generation

**Rule:** If a user provides copy to write to Sanity, use `patch_documents`/`create_documents` with exact JSON values, or the Sanity client directly. Never route authored content through an AI rewriting layer without saying so. If AI-assisted drafting would be helpful, ask first: "Want me to use Sanity AI to help draft this, or should I save it exactly as written?"

### Portable Text blocks written via MCP — required fields

**Every block must include `markDefs: []` and every span must include `marks: []`**, even when empty. `patch_documents`/`create_documents` omit empty arrays during serialisation, and Sanity's PT editor needs them to enable the toolbar — without them a block renders read-only (toolbar greyed out, style dropdown shows "No style").

Correct shape:
```json
{
  "_key": "b01", "_type": "block", "style": "normal",
  "markDefs": [],
  "children": [
    { "_key": "s01", "_type": "span", "marks": [], "text": "Plain text." }
  ]
}
```

Omitting either field saves and renders correctly on the web but cannot be edited in Studio. Refreshing Studio and deploying the schema do not fix it; the blocks must be re-patched.

**`citationRef` is safe in `sections[].content`, including via MCP writes**, provided the block has well-formed `markDefs: []`/`marks: []`. If a genuine citationRef-specific lock recurs, capture the document ID, whether `markDefs`/`marks` were well-formed, and any console errors before adding a rule here. Do not restate the causal claim from memory. Narrative: [[rule-register]] §RULE-035.

### Anti-Slop Content Rules

All AI-drafted content must pass the anti-slop checks documented in `docs/brand/brand-voice-guide.md`.

**Scope:** these rules apply in full to *reader-facing* content — anything shipped to a human audience: Sanity content (articles, nodes, case studies, glossary terms, page copy), alt text, meta descriptions, and commit messages (public in repo history). *Internal planning docs* (`docs/backlog/`, `docs/shipped/`, `docs/reviews/`, `docs/diagrams/`, epic docs, post-mortems) are exempt from the **em dash ban specifically** — they are structural working documents, not prose anyone reads for AI tells. Every other rule below still applies to them. If internal doc text is lifted into published content, the full ban applies at the point of lift.

The key enforcement rules:

**Banned in all non-node content:**
- **Em dashes** (`—`) in reader-facing content. Use commas, parentheses, colons, or separate sentences. Em dashes are the single most reliable structural AI tell. **Exceptions:** `Title — Subtitle` separator usage in headings (a typographic convention, not a prose pattern); and internal planning docs per the scope note above.
- **Decorative emoji/icons.** No `🚀`, `✨`, `🌟` garnish. If an emoji doesn't earn its place through humour or irony, it doesn't appear.
- **Filler transitions:** "That said," / "With that in mind," / "That being said," / "It's worth noting that" / "At the end of the day." If the next paragraph follows logically, it doesn't need a bridge.
- **AI vocabulary:** "delve into", "leverage", "utilize", "facilitate", "synergize", "ideate", "learnings", "passionate about", "excited to announce", "in today's landscape."
- **Hedge stacking:** "I think maybe this could possibly" — pick a position.
- **Empty adjective triads:** "robust, scalable, and maintainable" — use one specific adjective or a number.
- **Sentence-opening repetition:** Three consecutive sentences starting with the same word is a rewrite signal.
- **List-itis:** Bullets are for parallel items, not for avoiding prose.

**Node exemptions:** Nodes (AI-narrated, forensic storyteller voice) are exempt from the em dash and emoji bans. Em dashes are part of the register. Emoji in nodes is used sarcastically or as deadpan humour only.

**Source of truth:** `docs/brand/brand-voice-guide.md` (full checklist with examples and rationale).

---

## DS Documentation Authoring — Pre-Authoring Gates (blocking)

Full rules and rationale: `docs/conventions/usage-doc-style-guide.md`.

### Gate 1 — API stability (hard stop)

Before writing any section of a Guidelines helper or usage doc beyond Overview:

- Is the component's prop API frozen for this release cycle? No pending renames, no deprecated props without confirmed replacements, no open decisions about adding or removing props?

If **no**: write the Overview section only. Mark detail sections `<!-- PENDING: API not frozen -->`. Do not write Usage Guidelines, Accessibility, or Token sections until the API is stable.

A doc written during an API redesign will contradict itself within the same session. See SUG-152 Chip docs failure.

### Gate 2 — Template lock (hard stop before any content)

Before writing content for a component doc, present a structure table and wait for explicit sign-off:

| Section | Applicable? | Scope (one sentence) |
|---------|-------------|----------------------|
| Overview | Yes | … |
| Usage Guidelines | Yes/No | … |
| Accessibility | Yes/No | … |
| Design Tokens | Yes/No | … |

Wait for "yes", "looks good", or equivalent before writing section content.

**Response mechanism:** a select-list gate per `docs/conventions/human-gate-conventions.md` — present the structure table, then ask via a single select option rather than requiring a typed word.

### Gate 3 — Framework-agnostic constraint

Component docs describe prop API and visual behaviour only. Do not reference:
- Sanity field names (`project.colorHex`, `colorHex` as a CMS field)
- Schema type names or document types
- CMS lifecycle vocabulary (draft, published, versioned)

Use the **prop name**, not the data source. `dotColor` is a component concern. `project.colorHex` is a data concern — exclude it.

### Section dependency map

When writing a new component helper (`helpers/*Docs.tsx`), add a comment block at the top of the component function declaring cross-section fact dependencies. Update it when any referenced section changes:

```tsx
// Section dependencies:
// Overview lists the four modes → Usage Guidelines §Tag and §Badge must match exactly
// Usage Guidelines §dot rule → Accessibility §color-not-only-signal must reference it
// Design Tokens table → Overview deprecation callout must reference the same token names
```

When the Overview is updated, treat this map as a checklist — every downstream section that references the same fact must be reviewed in the same edit.

---

## Schema Conventions

Full schema authoring rules are in `docs/conventions/schema-conventions.md`. Key rules enforced here:

- **Taxonomy primary field is `name`** — all five taxonomy types (`tag`, `category`, `person`, `project`, `tool`) use `name` as the field identifier, not `title`. GROQ queries use `->name`; never `->title`. The `queries.js` fragments alias it as `"title": name` for component consumption.
- **Preview block** must use `select: { title: 'name' }` so Studio lists display correctly.
- When creating a new taxonomy type, follow the required-fields table in `docs/conventions/schema-conventions.md`.
- **Field descriptions must state validation limits inline** — any field with a `Rule.max()`/`Rule.min()` char or count constraint states it in `description`, one parenthetical, e.g. `(max. 100 characters)` / `(soft max. 125 characters)` / `(min. 1)`. Merge into an existing trailing parenthetical rather than stacking a second one. Applies to any structured-content schema in the monorepo, not just Sanity. See `docs/conventions/schema-conventions.md` §Field descriptions.

---

## Image Asset Naming

All images uploaded to Sanity must follow the naming convention in `docs/conventions/image-naming-convention.md`:

```
{docType}-{subject}-{descriptor}[-{index}].{ext}
```

- Prefixes: `article-`, `cs-`, `node-`, `project-`, `tool-`, `diagram-`, `site-`
- Formats: `.webp` (photos), `.png` (diagrams), `.svg` (icons/logos)
- Never upload with default camera/screenshot names (`IMG_1234.jpg`, `Screenshot 2026-...`)

---

## URL Authority Rule (blocking)

All internal URLs must be built via `getCanonicalPath({ docType, slug })` from `apps/web/src/lib/routes.js`. This applies everywhere — components, pages, config maps, and constants.

**Specifically prohibited:**
- Hard-coded path strings like `'/ai-ethics'` or `'/contact'` outside of `routes.js`
- A `LEGAL_LINKS`, `NAV_LINKS`, or similar constant array inside a component file that contains path strings
- Any `to="..."` or `href="..."` with a literal path that isn't derived from `getCanonicalPath()` or a registered route constant

**The only exception:** redirects in `App.jsx` that explicitly map legacy routes (e.g. `/blog → /articles`). These are route definitions, not link targets.

If a utility link set (e.g. footer legal row) needs hardcoded paths, those paths must be registered as named constants in `routes.js` and imported from there — not defined inline in the component.

---

## Atomic Reuse Gate (blocking)

Before creating any new **schema object** or **shared utility** (`lib/` function, cross-cutting helper), answer these questions **in writing** (in the epic doc, commit message, or inline comment):

1. **Does this pattern already exist?** — Search all 5 layers per MEMORY.md §Before You Build. If yes, extend — do not fork or duplicate.
2. **Will this be consumed by more than one caller?** — If yes, it must live in a shared location (`lib/`, `schemas/objects/`), never inline in a page file.
3. **Is the API composable?** — Fields/params should be named so it can be extended without forking.

This is the "Before You Build" reuse audit formalized as a **blocking checklist**, not a suggestion. A new schema object or utility that fails any of these three checks is a process failure.

**New CSS classes and new JSX components/blocks have their own, more specific gates — see "CSS class pre-implementation reuse audit" and "Component choice gate" below. Don't re-run this generic checklist for those; their gates supersede it.**

### Taxonomy pre-flight (blocking)

Before creating **any** new taxonomy document (`tag`, `category`, `person`, `tool`, `project`), run a pre-flight query:

```groq
*[_type == "tag"]{ _id, name, slug }          // or category / person / tool / project
```

Then:

1. **Diff the requested label against existing `name` values.** If an 80%+ semantic match exists, use the existing document — do not create a new one.
2. **Check Linear/backlog for an active cleanup or dedup epic** (e.g. SUG-74). If one is in-flight, do not add new taxonomy without explicit user approval.
3. **Check the field is correct for the type** — all five taxonomy primitives use `name` as the display field (not `title`). GROQ projects `"title": name` in fragments. Querying `title` directly will return null and make existing docs look empty.
4. **Flag tool/platform names** — the tag schema vocabulary says tool names (Figma, Sanity, Shopify, etc.) belong in `tools[]` on content documents, not as `tag` docs. If a requested tag label is a tool or platform name, surface this before creating: "This is a platform name — confirm it should be a tag rather than a tool ref."

Shape content to the schema, not the schema to the content. If a requested label has no good match, note what doesn't exist and create only those — not everything on the list.

### CSS class pre-implementation reuse audit (blocking — fires before any new CSS class)

For any new detail/entity page, start from the canonical component map: `docs/conventions/detail-page-recipe.md` (ToolDetailPage is the reference implementation). The epic doc must contain a filled-in **Component-Reuse Manifest** (see `docs/epic-template.md`) before any JSX or CSS is written — its absence is an incomplete-epic-doc hard stop.

Before writing any new CSS class for a detail page, taxonomy page, or shared layout surface, enumerate candidates explicitly:

1. **Check `pages.module.css`** — shared entity page classes (`entityFolio`, `entityThumbnail`, `narrativeHeading`, `entityDescription`, `entityDetailPage`, `backLink`, `archiveEmpty`, `detailEyebrow`). If any covers the need at 80%+, use it — do not add a new class.
2. **Check DS tokens** — spacing, color, and type decisions must reference `--st-*` tokens, not new local values. If a token doesn't exist, add it via `tokens/source/tokens.json` first.
3. **Check DS components** — `Grid`, `SectionLabel`, `Card`, `Chip`, `ContentCard` before writing any layout CSS. State why each doesn't fit if you decide to skip them.
4. **Output the audit in writing** — in the commit message or epic doc before any `Edit`/`Write` call to a CSS file. One sentence per candidate checked. "I checked X and it covers Y" is sufficient. Silence is a process failure.

Location-named or page-scoped class names (e.g. `toolUrl`, `lv-*`, `folioHead`, `.profileHeadline`) are a signal the audit was skipped. Semantic, reusable names only.

**Proposal table gate (hard stop — fires before first Edit to a CSS module file):** Before writing the first new CSS class name, produce a naming proposal table and wait for explicit approval:

| Proposed class name | Closest existing pattern | Reuse decision |
|---------------------|--------------------------|----------------|
| `.myNewClass` | `pages.module.css .entityFolio` (80% match) | Extend existing |
| `.listRow` | None found — new semantic pattern | New class approved |

Do not make any `Edit` or `Write` call to a CSS module file until this table has been shown and the user has confirmed the names. "Looks good", "yes", or equivalent is sufficient approval. A new CSS class written without a prior proposal table is a process failure.

**Response mechanism:** a select-list gate per `docs/conventions/human-gate-conventions.md` — present the naming proposal table, then ask via a single select option rather than requiring a typed word.

### Component choice gate (blocking — fires before any new JSX surface)

When a new block, container, or layout surface is needed, run this audit **before writing any JSX or CSS**:

1. **Name the candidate existing components.** List every DS or app-level component that could plausibly render this content — Card, Callout, StatTile, MetadataCard, blockquote, etc. If the content is prose/text, explicitly check Callout and blockquote before inventing a new container.
2. **State why each candidate doesn't fit** (or why it does). One sentence per candidate. If a candidate covers 80%+ of the use case, extend it via props — do not fork.
3. **If no existing component fits**, stop — this triggers the Phase 0 hard-stop (visual spec gate) above. Produce the vspec there; don't restate that process here.

**This gate is not optional for "small" blocks.** A coloured callout container, a stat grid wrapper, a challenge summary card — all are new visual surfaces that require this audit. The size of the block does not determine whether the gate fires; the novelty of the visual format does.

**Variant-first rule (hard stop):** A visual variation of an existing DS primitive is ALWAYS a prop on that primitive — never a new component. "Same component, different header color" is `tone="subdued"`, not `<RoadmapTable>`. "Same component, different label position" is `captionSide="bottom"`, not `<LabeledTable>`. If you find yourself writing a new component that renders an `<table>` (or any other primitive's root element), stop. The correct path is: define the prop on the DS primitive, then compose from it. A new component that wraps or reimplements a primitive without extending it is a fork — and forks diverge.

Example audit (correct):
```
New block: challenge summary
Candidates checked:
- Callout (aside): covers prose + left accent. Missing: label + coloured bg. → 80% fit — extend via prop.
- Card: covers bg + border. Missing: left accent, no title slot. → 60% fit.
Decision: Extend Callout with a label prop, or use it as-is and add label via SectionLabel above.
Vspec: not required — extending existing component.
```

---

## DS Component Authoring — Token-First Rule (blocking)

Applies to any component CSS file in `apps/web/src/design-system/` or `packages/design-system/src/`. A hardcoded value bypasses the token graph: the theme system cannot override it and the validator cannot audit it. Narrative: [[rule-register]] §RULE-049.

**Verify every token name exists before writing it** — `grep "token-name" apps/web/src/design-system/styles/tokens.css`. Tokens are named by concept (`--st-font-family-narrative`), not by analogy (`--st-font-family-heading`). Pre-commit catches this, but catching it there costs a correction commit.

**Verify the computed value, not just the name.** For typography or spacing, grep the resolved value in `tokens.css` and cross-check it against `/story/foundations-typography-conventions--default` in Storybook. A name can exist at the wrong tier: `--st-font-heading-2` resolves to 2.25rem (36px), not the 48px page-H1 spec. Record the resolved value. A mismatch needs a new semantic token before implementation begins.

**No raw colour value in a component CSS file.** Every colour resolves through a `--st-*` token reference. If the token does not exist yet, add it to `tokens.css` first, in a separate commit.

**Inline CSS custom property injection on DS components is banned.** `style={{ '--st-table-header-bg': '#fff' }}` bypasses the token graph and has to be removed every time the token is renamed. To vary a visual zone from the call site, add a `tone` value: define the prop, add the token to `tokens.json`, apply it in the component CSS.

**Fallback syntax:** `var(--st-token, #hex)` is banned. The only permitted form is `var(--st-token, var(--st-primitive))`. If no matching primitive exists, add it to `tokens.css` first. If no fallback is needed, omit it.

**Token names are contracts, not descriptions.** A token used in 2+ distinct surfaces needs a name that works for all of them. A placement-specific name (`--st-card-folio-bg`) also used in FilterBar headers and MetadataCard label cells is renamed to the shared concept (`--st-card-label-bg`). Full rules: `docs/conventions/token-naming.md`.

**Theme files are override-only.** `theme.light.css`, `theme.pink-moon.css`, and any future theme file may only override existing `--st-*` names with other token references. They may not introduce a colour value (hex, rgba, hsla) with no primitive anchor in `tokens.css`; add the primitive first.

**A component with chip/badge/status colour states** defines all `--st-status-<state>-{bg,fg,border}` tokens for every state in `tokens.css`, plus light-theme overrides, before the component CSS is written. Not deferrable: Card's status chips accumulated 90 hardcoded values by skipping it.

**Trace the theme cascade before using any token for a `background`.** Pink Moon's dark block overrides semantic `--st-color-bg-surface*` tokens to semi-transparent `rgba()` values rather than the solid dark primitives in `tokens.css`:

1. `tokens.css` — default value
2. `theme.pink-moon.css` light block
3. `theme.pink-moon.css` dark block — most likely to surprise

If the dark-block value is `rgba(...)`, that token produces a glassmorphism wash, not a solid surface. Use a raw primitive (`--st-color-midnight-800`) or an alias pointing straight at one. Already overridden in dark-pink-moon: `--st-color-bg-surface`, `--st-color-bg-surface-strong`, `--st-card-bg`.

---

## Pre-Commit Checklist for CSS Token Changes

Both `tokens.css` files are **generated** — do not edit them directly. Edit `tokens/source/tokens.json` and run `pnpm tokens:build` to regenerate both files. The pre-commit hook blocks staged changes to these files if they already carry the "Do not edit directly" header.

Whenever `tokens/source/tokens.json` is edited, or whenever any component CSS file is created or modified:

1. Run `pnpm tokens:build` to regenerate both `tokens.css` files.
2. Run `pnpm validate:tokens` from `apps/web/` and confirm **zero errors** before committing.
3. Run `pnpm validate:tokens --strict-colors` from `apps/web/` and confirm **zero hardcoded color violations** before committing.
4. Commit `tokens/source/tokens.json` + both generated `tokens.css` files together.

**Token pipeline (SUG-86):**
- Source of truth: `tokens/source/tokens.json`
- Build command: `pnpm tokens:build` (runs `sd.config.mjs` via Style Dictionary v5)
- Outputs: `apps/web/src/design-system/styles/tokens.css` + `packages/design-system/src/styles/tokens.css`
- Theme overrides (`theme.pink-moon.css`, `theme.light.css`, `theme.shop.css`) remain hand-authored — they are NOT generated files, but they ARE duplicated to both the web and DS-package style dirs and **must be kept byte-identical by hand** (see Mirrored File Registry below).

`validate:tokens` catches: undefined `var(--st-*)` references, renamed tokens with lingering references.
`validate:tokens --strict-colors` catches: raw hex, rgba, or hsla values in any component or theme CSS file outside `tokens.css`.
`validate:style-mirror` catches: drift between the duplicated DS style files (theme/tokens/globals/utilities) across web ↔ DS package.

**`validate:tokens` does NOT check theme-file parity.** It verifies that every `var(--st-*)` reference *resolves* — not that the two theme files carry the same override *set*. A token missing from one theme file still resolves via the shared `tokens.css`, so theme drift is invisible to it. "Refs resolve" ≠ "themes match". Theme/style-file parity is enforced by `validate:style-mirror`, not `validate:tokens`. (Origin: the `theme.pink-moon.css` drift post-mortem, 2026-06-13 — the DS-package copy had silently decayed to a stale subset of 93 missing tokens, breaking DS components in Storybook while production looked fine.)

### Mirrored File Registry (must-be-identical pairs)

Some files exist in two locations and **must be byte-identical**. Each must have a named enforcement mechanism — never rely on "remember to mirror it":

| File(s) | Locations | Source of truth | Enforced by |
|---------|-----------|-----------------|-------------|
| `tokens.css` | `apps/web/src/design-system/styles/` ↔ `packages/design-system/src/styles/` | generated from `tokens/source/tokens.json` | `pnpm tokens:build` + pre-commit "Do not edit directly" block + `validate:style-mirror` |
| `theme.pink-moon.css`, `theme.light.css`, `theme.shop.css`, `globals.css`, `utilities.css` | same two style dirs | **web copy is canonical** (hand-authored) | `validate:style-mirror` (pre-commit) |
~~DS component CSS mirrors~~ — **retired 2026-07-24 (SUG-224).** `apps/web` now consumes `@sugartown/design-system` directly; the mirror-adapter pattern no longer exists. `apps/web/src/design-system/components/` holds only `SidebarNav` and `Tile` (genuine app coupling, no package counterpart) — nothing left to mirror. `validate:style-mirror` pass 2 still runs (harmless no-op: 0 pairs to compare) as a backstop against the pattern reappearing.

When you edit a hand-authored mirrored file (any theme/style file), update **both** copies in the same commit, or `validate:style-mirror` will block the commit. When adding a new must-be-identical pair, register it here and wire it into `validate-style-mirror.js`.

---

## Visual Verification Rules

Build success does not equal visual correctness. Never declare CSS or layout work "done" based solely on a clean build or runtime error absence.

### Pre-audit branch check

Before running any **post-deploy verification** against production (Lighthouse, Chromatic prod, link checker, CWV audit, etc.), confirm the commits under test are on `origin/main`. Auditing production for an effect that lives on an unmerged feature branch wastes time and produces misleading "no improvement" readings.

Recipe:
```bash
git branch --contains <commit-sha>     # must list main
git log origin/main..<branch>          # must be empty (branch merged)
```

If the commits are not on `origin/main`, halt the audit and surface the gap to the user before running anything.

### When a vspec exists

Produce a **vspec-to-build comparison table** before requesting close-out. The table must list every visual element in the vspec (field order, spacing values, chip styles, typography, colours) and flag each as Match, Drift, or Missing. Present this table to Bex for review. Do not close the epic until "Visual QA approved."

### Technical diagram red-pen gate (blocking — fires before any diagram is uploaded or published)

Applies to any technical or architecture diagram destined for a published surface: Sanity upload, case study, article, docs site, social post.

**This gate also fires on published governance statistics** — any rendered count, tally, or coverage claim about the platform's own rigour (`/platform/governance`'s "30 checkpoints · 0 gaps", validator counts, enforcement tallies). Same claim table and evidence classes, plus two requirements: the claim carries a **measurement date**, and its Evidence cell names the command or file producing the number, not the intent behind it. A tally that is true when written and never re-measured becomes a false public claim silently. Narrative: [[rule-register]] §RULE-055.

1. **Source is committed first.** The diagram's source (SVG or Mermaid) lives in `docs/diagrams/` and is committed before upload. `docs/drafts/` does not count — it is local-only and gitignored. A published diagram with no committed source cannot be fact-checked later except by reconstructing it.
2. **Red-pen accuracy pass.** Before upload, produce a claim table — one row per box, arrow, or label that asserts something about the system. Captions and alt text are claims too; include them as rows. Each row names the file or mechanism that makes it true and classifies it:

   | Diagram element | Evidence (file / mechanism) | Class |
   |---|---|---|
   | e.g. "one token source" | `tokens/source/tokens.json` → `pnpm tokens:build` | enforced-by-code |
   | e.g. "0 component changes" | `docs/shipped/SUG-127-*.md` | measured |
   | e.g. "Content Write Gate" | CLAUDE.md §Content Write Gate | convention |
   | e.g. "apps/web consumes DS package" | open TODO in `Card.jsx` | roadmap |

   **Classes:** `enforced-by-code` (a validator, hook, build step, or platform guarantee makes it true), `measured` (an empirical result with a committed record — name the record), `convention` (a documented rule agents follow — true by discipline, not machinery), `roadmap` (not true yet).
3. **Roadmap items may not be drawn as current state.** Label them (dashed stroke, "roadmap" tag) or cut them. A convention drawn as if it were a technical layer must be labelled as governance, not infrastructure. If an element's Evidence cell is blank, the element is cut or the diagram doesn't ship.

The table lives in the owning epic doc, or in `docs/diagrams/redpen-{target}.md` for diagrams without an epic. A diagram uploaded without a committed source and claim table is a process failure — same severity as a Phase 0 violation.

### For every CSS property you write

Confirm:
1. The value is a token reference (`var(--st-*)`) not a hardcoded value. If hardcoded, state why.
2. The computed layout matches the dimensional contract. Show the arithmetic (e.g. "Vspec: 3-col grid at 1200px. Card 340px, gap 24px. 340x3 + 24x2 = 1068px + padding = 1200px").
3. Spacing and gap values match the vspec. Numbers, not vibes.

### Dark mode surface work — pre-flight

Before any structured-surface dark mode CSS pass (MetadataCard, Card, FilterBar, any component with label or folio strips), **inspect the reference component's computed values in the browser first**:

1. Open the reference component (e.g. standard `Card`) in Storybook on `dark-pink-moon` theme
2. Use DevTools to inspect computed `background-color`, `border-color`, and `color` on each visual zone (card bg, folio/label strip, body, dividers)
3. Record the exact computed values and trace them back to their tokens via `tokens.css` and `theme.pink-moon.css`

Only then write the target component's CSS to match. Working forward from token names ("I'll use `--st-card-bg`") without verifying what those tokens resolve to in dark theme leads to glassmorphism surprises. The MetadataCard dark mode repair cycle (3+ correction rounds) was caused by this exact failure.

### Storybook — build-time globals must be frozen

Any `__VARIABLE__` injected by `vite.config.js` `define:` that changes at build time (dates, commit SHAs, env-specific values, **version numbers**) **must be overridden to a fixed sentinel in Storybook's `viteFinal` define block**. Otherwise Chromatic will diff the story on every build even when nothing visual changed.

**Freeze every instance, not just the one that prompted the fix.** `apps/web/vite.config.js`'s `define` block currently has two build-time globals, and Storybook's `viteFinal` must freeze both:
```ts
// apps/storybook/.storybook/main.ts — viteFinal
viteConfig.define = {
  ...viteConfig.define,
  __BUILD_DATE__: JSON.stringify('2026-01-01'),
  __APP_VERSION__: JSON.stringify('0.0.0-storybook'),
}
```

When a `define:` entry is added to `apps/web/vite.config.js`, check whether it produces visible output in any story. If it does, add the freeze in the same commit, and re-check every *existing* entry at the same time. Narrative: [[rule-register]] §RULE-058.

### Storybook coverage requirement

Every new or modified component that has visual output must have a Storybook story before close-out. The story must cover: default state, all meaningful variants, and at least one edge case (long text, missing fields, empty arrays). Components without stories are invisible to Chromatic VRT.

**Dark mode is a shipping AC, not a follow-up task.** A DS component that ships without a `dark-pink-moon` story has an open gap — it is not done. "Untested" in the dark mode column of the component registry is a blocking state. Before close-out, every story must render correctly on both `default` and `dark-pink-moon` themes and that must be confirmed via Storybook (not assumed). A component added to the registry with dark mode marked "Untested" must have a Linear issue open for the gap before the epic closes.

### Honesty over confidence

List visual elements you cannot verify without a browser. "I cannot confirm the hover state transition timing matches the vspec" is acceptable. "Everything looks good" without evidence is not.
