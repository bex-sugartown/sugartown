# Sugartown — Claude Code Conventions

> These conventions apply to all sessions in this repo. They supplement MEMORY.md
> (auto-loaded) and docs/epic-template.md (used for epic authoring).
>
> **Pink Moon is the canonical design system identity.** PRD v3.0:
> `docs/briefs/design-system/PROJ-003-design-system-prd.md`. Visual direction: sharp
> neutral surfaces, hot colour signal, EB Garamond headings,
> Courier Prime metadata, zero/minimal radius. Default mode: light.
>
> **Tier 1 gates stop and ask.** Sections below carry the label inline; the closed list and
> the full tier model live in `docs/conventions/human-gate-conventions.md`.
>
> **This file holds what applies to every session.** Rules that apply only when a kind of file
> is being worked on live in `.claude/rules/` and load when such a file is read (§Path-scoped
> rules).

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

## Path-scoped rules

`.claude/rules/*.md` files with `paths:` frontmatter load when a session reads a matching file,
and not otherwise (measured 2026-09-04 on Claude Code 2.1.207, ST-112). Each is verbatim text
that used to sit in this file; the Instruction & Rule File Write Gate and the followability
walkthrough cover them exactly as they cover this file. `ls .claude/rules/` is the list; the
frontmatter of each says what it loads on. If a rule below seems missing from context, the
file it governs has not been read yet in this session.

| File | Loads when a session reads |
|---|---|
| `epics.md` | `docs/backlog/**`, `docs/shipped/**`, `docs/epic-template.md`, the epic-filing skills |
| `react.md` | app JSX and JS, design-system TSX |
| `css-layout.md` | any stylesheet, `apps/web/src/components/**` |
| `tokens.md` | `tokens/**`, any stylesheet, design-system code |
| `sanity-schema.md` | `apps/studio/schemas/**` and Studio TypeScript |
| `groq.md` | `apps/web/src/lib/**`, `apps/web/src/pages/**` |
| `storybook.md` | Storybook config, stories, `packages/storybook-docs/**`, design-system code |

## Session Discipline

### Epic close-out sequence

When an epic is complete, run these steps in order before starting the next epic.

Steps 1, 1b, 7, 8 and 9 always run. **Steps 2–6b fire only on their stated trigger**; a
step whose trigger did not fire is recorded as N/A with the reason, never silently skipped.

1. **Commit** all epic changes with a scoped message (`feat(...)`, `refactor(...)`, etc.)
1b. **Route smoke tests, local half** — `pnpm test:smoke` passes locally before the epic reaches `Done`. Five Playwright specs prove the app renders end-to-end, not just builds: homepage, one archive, one detail, one taxonomy route, a 404. A red suite blocks the epic from closing (SUG-240). If CI is known-red for reasons outside the epic, say so and name the tracking issue. **The CI-conclusion half moves to the ship step** — watching the pushed commit's CI run to a `success` conclusion, not stopping at "the deploy responded". That step is `/ship` Phase 3 step 5 (SUG-100 S1, consolidated 2026-08-19 — Phase 3b).
2. **Deploy schema** (if epic touched `apps/studio/schemas/`) — run `npx sanity schema deploy` from `apps/studio/`. Schema changes are not live until deployed. MCP tools, the Content Lake API, and embedded Studios all validate against the deployed schema, not local code. Skipping this step causes silent write failures.
3. **Visual QA gate (Tier 1 — stop and ask)** — wait for the literal text **"Visual QA approved"** before proceeding. The `docs/shipped/` move is blocked until it arrives. If the epic has a vspec, produce the vspec-to-build comparison table (typography, spacing, colours, layout, each flagged Match / Drift / Missing) via the design-reviewer subagent (`.claude/agents/design-reviewer.md`, `docs/conventions/vqa-workflow.md`), which runs in a fresh context with no view of the session that wrote the code. **With no vspec, and only if every visual element was verified in-browser during implementation, cite that evidence per element instead of building a table** — rows all reading "Match", assembled afterwards from checks already run, give false confidence that a fresh review happened. The gate still fires and still blocks whenever a vspec exists or *any* element went unverified at implementation time; list those elements rather than padding the table with the ones that were. **If the epic shipped a detail, archive, or entity page**, open a sibling page of the same kind (e.g. new entity page vs `/tools/vercel`) and compare shell, folio, section labels, grids, chips. Unjustified structural divergence is a Drift row.
4. **Chromatic (Tier 1 — stop and ask)** — a push to `origin/main` touching CSS, component JSX, or Storybook stories needs one human-approved Chromatic VRT pass before it lands. Run it now, at close-out, or defer to the ship step — either is fine. If deferred, annotate the shipped doc with `<!-- Chromatic: pending -->` and a note. Deferral is a checklist deferral only — it does not unblock the shipped/ move. **"Defer Chromatic" is not the same as "epic is closed."** This is the one place the run-now-or-defer rule is defined; `/ship` executes it and may still
note its own edge cases (a misconfigured or failing Chromatic install is advisory there, not
blocking) — but the defer decision itself is not restated (SUG-100 S3). `/mini-release` retired
2026-08-19, absorbed into `/ship` (SUG-100 S9, S16).
5. **Data pipeline gap check** — if the epic extended a build-time data pipeline (stats, CrUX, LHCI, etc.) and real data has not yet flowed through CI, document the gap in the shipped doc: what env var or cron is needed, what the expected data shape looks like, and what the current `stats.json` state represents (real vs seeded). Close-out is permitted but the gap must be explicit and visible.
5b. **Verify handoffs landed.** If close-out defers work to another epic, open that epic's doc and confirm each deferred item is in its **Scope** — not mentioned in prose, not assumed to be "that epic's axis". Add it if missing. (SUG-230 deferred three items to SUG-231; none reached its Scope.)
6. **Move epic doc** from `docs/backlog/` to `docs/shipped/` — commit: `docs: ship SUG-{N} {name}`. **If this move follows an edit to the doc in the same turn** (e.g. adding a close-out summary before moving it), run `git diff --cached --stat` (or `git show --stat HEAD` right after committing) to confirm the file actually carries the expected content change, not just a rename with 0 insertions/deletions. `git mv` does not guarantee a prior unstaged edit rides along silently — verify, don't assume.
6b. **Preserve the vspec** — copy the approved vspec from `docs/drafts/` to `docs/shipped/SUG-{N}-{slug}.vspec.html`. Commit with the step 6 doc move. Skip only if the epic had no vspec.
7. **CHANGELOG line now, version bump at ship — they are separate obligations and happen at different times.** Add the epic's one-line summary to `CHANGELOG.md`'s `[Unreleased]` buffer at `Done`, every time, regardless of how long until the next ship. The version bump is not this step's job: it happens at the ship step — `/ship --release`, which invokes `/release` rather than
reimplementing it (SUG-100 S9, consolidated 2026-08-19). The ship step operates on **everything currently `Done`**, not just this epic — the observed interval between ship events is 1–14 days, so scoping any step to "today's work" silently drops what accumulated on the days nobody ran it (SUG-100 S14). A close-out doc saying "Done" with no `[Unreleased]` line is incompletely closed, whether or not a version has been cut yet.
8. **Update the tracker** — transition the epic's issue to **Done**. Until 2026-09-09 the write goes to GitHub only — see §Tracker writes go to GitHub only.
9. **Clean tree** — confirm `git status` is clean before starting the next epic

Do not carry uncommitted changes across epic boundaries. If the tree is dirty when a new epic begins, commit or stash (`git stash push -m "WIP: SUG-{N} — <reason>"`) first.

### Commit messages and the `[skip ci]` trap

GitHub scans the **whole commit message** for a skip marker, not just the subject line. A
commit whose *body* quotes `[skip ci]` — describing the marker rather than invoking it —
suppresses its own CI run just as effectively as using it deliberately. Traced to a commit made
during SUG-256; discovered and confirmed live 2026-08-02 during SUG-265's investigation — a commit
whose body quoted the marker produced no CI run at all.

**When referring to the marker in prose, spell it `skip-ci`** (hyphenated, no brackets). Reserve
`[skip ci]` for the one place it should trigger — the stats bot's actual commit trailer, below.
SUG-100 S7.

### Verify before citing — don't trust a prior claim

**Before recording any claim about a file you did not just read, check it directly.** Confirm the path resolves, and measure counts and values with a direct check (`grep -c`, opening the file, rendering it) rather than copying a prior audit doc's number. A wrong reference becomes the next session's false starting assumption. (SUG-192: three of SUG-191's audit rows named a file that does not exist.)

**This applies to all epic authoring, not only audit epics.** Check two claim types before writing them into an epic doc: (a) claims about a prior epic's outputs — open the files and confirm the output exists; (b) "no blocking dependencies" — read the backlog for in-flight epics touching the same files or layer, and state why each is or isn't blocking. (SUG-224 got both wrong.)

**To measure a gate's state, run it locally and read the output.** Do not summarise from a CI log. `turbo run` stops at the first failing package, so CI logs undercount. (SUG-255: CI showed 7 lint errors, a local run found 84 across three packages.)

### Instruction writing style

Anything written to be followed rather than read follows
`docs/conventions/instruction-writing-style.md`: instruction first, said once, no closing
aphorism, rationale gets one clause or its own file. Applies to this file, skills,
conventions, epic docs and session replies alike. `docs/brand/brand-voice-guide.md` covers
reader-facing content only.

**Instructions written for Bex to follow, rather than for a session, are governed by
`../conventions/human-instruction-style.md`.** Bex is not a developer, and that file states how
steps are written for her. Read it before writing any. In a Cowork bridge session the connected
folders mount separately and it may not resolve; say so rather than guessing at the standard,
the same caveat `resume-factory/os/CLAUDE.md` and `cms-eval/toolkit/CLAUDE.md` carry.

Every markdown file in the repo also follows `docs/conventions/machine-readable-docs.md`:
sections that stand alone, front-loaded answers, resolved pronouns, ISO dates. Retrieval
chunks all files the same way, whichever guide owns the content.

### Mid-epic commit checkpoints

Commit after each independently-working feature. Do not save it all for one end-of-epic commit. If a session may run out of context, commit work-in-progress with a `wip(epic):` prefix before it ends.

**Disk safety no longer depends on remembering a push threshold, on any branch.** A `post-commit`
hook mirrors every commit — on `main` or a feature branch — to `wip/<date>-<branch>` on `origin`,
automatically, for free (`.husky/post-commit`, SUG-100 S13). The earlier advice — push a feature
branch after each checkpoint; above ~15 unpushed commits on `main` or at any session end, push and
accept a deploy or create a `wip/<epic>` branch — existed only to manufacture that safety by hand.
The hook does it continuously now; there is no threshold left to state. (SUG-231: 48 commits
existed nowhere but one disk for two days — this is what closes that gap.)

The hook records each attempt in `.git/st-mirror.log` and prints a warning on the *next* commit
when the last one failed, so a failed mirror surfaces one commit late rather than at the time.

**Pushing `origin/main` itself stays a separate, deliberate act.** It triggers a Netlify deploy (15
credits) and is the ship step's job, not a mid-epic habit.

### Done vs Shipped

**Renamed from §Issue Done = code on main, 2026-08-19 (SUG-100 S2).** The old rule required
`origin/main` before `Done`; that boundary moves to `Shipped` below, because it made two real
epics (#98, #99) close with their own close-out commits stranded on one disk pending a later push.

**`Done`** — work complete, committed locally, local smoke green (close-out step 1b). Not merged.
Transition the issue and move the epic doc to `docs/shipped/` at this point; nothing about `Done`
requires a push.

**`Shipped`** — on `origin/main`, deployed, **and** CI concluded `success`. Confirm before citing
either state:
```bash
git branch --contains <commit-sha> | grep -qE '^(\*|\s)+ main$' && echo "on main" || echo "NOT on main"
```

Set `Shipped` **after** closing the issue, never before: the `Item closed` project workflow sets
`Status: Done` on close, so setting `Shipped` first is silently overwritten (SUG-100 G2, proven
live on #98, 2026-08-18 — set, persisted, reverted). `/ship` performs this transition automatically (SUG-100 Phase 3b, 2026-08-19), gated on the
pushed commit's CI run concluding `success` — a red run leaves everything `Done`, no un-`Done`.
Full procedure: `docs/ship-prompt.md` PHASE 3 step 6.

### Issue status = workflow stage

Issue status is a byproduct of running the existing Sugartown epic workflow, not a separately
maintained field:

| Sugartown stage | Trigger | Status |
|---|---|---|
| Epic created | `/new-epic` Step 1 | `Backlog` |
| Prioritized for pickup | `Priority` set to `Urgent` or `High`, at creation or later | `Todo` |
| Implementation begins | Pre-Execution Completeness Gate passes (`docs/epic-template.md`) | `In Progress` |
| Paused for any reason | Set by the human | `On Hold` |
| Epic complete | Close-out sequence step 8 (below) | `Done` |
| Code live and verified | Push reaches `origin/main`, CI concludes `success` (§Done vs Shipped) | `Shipped` |

**`Priority` and `Status` are not independent at the top of the scale.** `Urgent` and `High`
both mean ready to pick up, so an issue carrying either belongs at `Todo`, whether it was
created that way or promoted later. `Medium` and `Low` sit at `Backlog`. A `High` issue at
`Backlog` is a contradiction between two fields, and whichever one a reader trusts, the board
has misled them. `/new-epic` and `/new-tool` both set this at creation.

**Set `In Progress` before the first `Edit`/`Write` call of an epic, not after.** The trigger is
the Pre-Execution Completeness Gate coming clean (`docs/epic-template.md`). An epic whose work
has started while its issue still reads `Todo` is invisible to anyone looking at the board.

**A non-epic issue executed directly — "execute {n}" — follows the same statuses without an
epic doc.** Bugs, gaps and chores filed as bare issues have no `/new-epic` step and no
Pre-Execution Completeness Gate, so none of the triggers above fire and the issue sits at
`Todo` while the work happens and finishes. #106 did exactly that on 2026-09-01: filed,
executed, committed and evidenced, still reading `Todo`.

| Stage | Trigger | Status |
|---|---|---|
| Execution accepted | Issue read, first action planned, before the first `Edit`/`Write` | `In Progress` |
| Work committed, local checks green | Committed, and whatever verifies it has passed | `Done` |
| Live and verified | `/ship` pushes it and CI concludes `success` | `Shipped` |

Set `In Progress` by editing the project item's `Status`. Set `Done` with `gh issue close {n}`
and let the `Item closed` workflow stamp the status — do not set the field by hand, for the
same ordering reason as §Done vs Shipped. `/ship` step 6 handles `Shipped`.

```bash
# item id for issue {n}
gh project item-list 1 --owner bex-sugartown --limit 200 --format json \
  | jq -r '.items[] | select(.content.number=={n}) | .id'
# In Progress (option ids via: gh project field-list 1 --owner bex-sugartown)
gh project item-edit --id {item_id} --project-id PVT_kwHODqg2Fc4BP7M2 \
  --field-id PVTSSF_lAHODqg2Fc4BP7M2zg-MUFI --single-select-option-id be99b80c
```

Three rules make this safe:

1. **Set `In Progress` before the first `Edit`/`Write`.** Same reason as an epic: work in
   flight on a `Todo` issue is invisible to anyone reading the board.
2. **Do not set `Done` until the work is committed.** `/ship` step 6 sweeps *everything*
   currently `Done` into `Shipped` on a green CI run, so a `Done` issue whose work is
   uncommitted gets marked shipped by the next ship regardless of what it contains.
3. **Comment the evidence on the issue when setting `Done`** — what changed, and what verified
   it. `Done` with no evidence is a status nobody can check.

Abandoning execution returns the issue to `Todo`, or `On Hold` if blocked. Never leave it at
`In Progress`.

**`On Hold` is the one status a workflow step does not set.** It covers both a blocker outside
your control and work deliberately parked, and it is the human's call in both directions.
Exits to `In Progress` when work resumes, or to `Canceled` if it never does.

`On Hold` exists on the GitHub board only; Linear has no equivalent, so the two are not a
strict mirror. That ends with the trial (§Tracker writes go to GitHub only).

**Write "issue", not "Linear issue" or "GitHub issue".** Every rule in this repo outlives the
tracker it was written under, and naming one bakes a migration into the prose. Name a platform
only where the mechanics are platform-specific — a `gh` command, a field ID, a trial-scoped
instruction about which tracker to write to. Everywhere else the word is `issue`.

**There is one priority queue and no second copy.** During the trial it is the GitHub board
(§Tracker writes go to GitHub only).
`docs/backlog/sugartown-backlog-priorities.md` was retired 2026-08-05.
`/platform/governance` renders priority data from `stats.linearRoadmap`.

Full mechanics: `.claude/skills/new-epic/docs/new-epic-prompt.md` and `docs/epic-template.md`
§Epic Lifecycle. Cross-epic dependencies stated as "blocked on SUG-X" in a backlog doc must
also exist as a real Linear `blockedBy`/`blocks` relation (Linear MCP `save_issue`) — a
dependency written only as prose is invisible to anyone using Linear as the priority queue.

### Tracker writes go to GitHub only, until 2026-09-09

**Temporary. Delete this section at the 2026-09-09 review** — see
`docs/briefs/linear-to-github-migration-plan.md` §13.

**Every tracker write in this file, `docs/epic-template.md`, and the skills goes to GitHub.
Write nothing to Linear.** Create, status transition, close, relation: GitHub. This is the
migration plan's own dual-system rule — GitHub is where work happens, Linear is frozen in
practice — and the reason is that two writable backlogs is the second-copy problem v0.33.0
ended.

| Operation | Where |
|---|---|
| Create issue | `gh issue create --title "{title}"` — no ID in the title. Add to project 1, set `Priority`. The number it returns is the epic's `ST-{n}` ID |
| Status `Backlog` / `Todo` / `In Progress` | The project item's `Status` field |
| Status `Done` (close-out step 8) | `gh issue close {n}` — the `Item closed` workflow sets `Status: Done` |
| `blockedBy` / `blocks` relation | State it in the issue body; GitHub has no relation field |
| Gap issue (e.g. dark-mode untested) | GitHub |

**Linear is read-only for the trial, and cannot accept new issues regardless:** the workspace
has been at its 250-issue lifetime cap since 2026-08-09, and auto-archive does not clear the
bulk until roughly 2026-09-08. Reading Linear is still fine — it holds the priority ordering
for the 58 migrated issues, and the stats collector queries its GraphQL API for
`stats.linearRoadmap`. Neither is affected.

**Migrated issues keep two records that will diverge.** That is expected and is not reconciled
during the trial; the 2026-09-09 decision resolves it in one direction. Do not hand-sync them.

One thing this does not do: **it does not close pre-existing drift.** The `Item closed`
workflow is forward-looking only, so an issue closed before the automation existed keeps a
stale `Status` and is corrected by hand.

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

**Showing as modified is their normal state: do not commit them manually and do not treat them as a dirty-tree blocker.** Ignore them when checking tree cleanliness before a ship. `.gitignore` blocks `git add <path>` but not `git add -u`, so they can still end up staged — in which case committing them is fine. CI is the authoritative committer.

**Two more tracked files are build outputs, and a full local build dirties them too:**
`apps/web/public/_redirects` and `apps/web/src/data/content-models.json`. Both are
regenerated by `pnpm build` (via `scripts/build-redirects.js` and
`generate-content-models.mjs`) from live Sanity data, so Netlify rebuilds them on every
deploy regardless of what is committed. A local `pnpm build` — including the one
`pnpm test:smoke` runs — leaves them modified. Revert them (`git checkout --`) rather than
committing, unless the diff carries real content you want in git; `content-models.json`
usually differs only by its `generatedAt` date.

### Phase 0 visual spec gate (Tier 1 — stop and ask)

**What triggers this gate: an unreviewed visual format reaching a user.** Not an epic's structure, and not whether a phase is labelled "Phase 0". The test: would this change render something a human has not signed off on? If the work adopts an already-shipped, already-reviewed design — porting a canonical component to a second copy, or a change whose only rendered surface is Storybook — the gate does not fire; record that decision in the epic doc. An epic with no phase called "Phase 0" still trips the gate the moment it invents a visual format.

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

### Building a mechanism — three rules

A mechanism is anything built to make a rule hold: a validator, a generator, a cap, a register,
a gate. All three rules come from the 2026-08-15 governance post-mortem, which is the record of
what happens without them.

**1. Name the reader before building the writer.** No generator ships before the thing that
consumes its output exists. If you cannot name the file, page, or check that reads it, do not
build it. (`governance.json` was generated on every build and read by nothing, for seven weeks.)

**2. A guard is never widened to fit a breach.** When a cap, threshold, or limit is exceeded,
either cut what breached it or retire the guard with a stated reason. Raising the number is not
a third option. (The doc-budget cap was raised twice to accommodate the surface it existed to
constrain.)

**3. A register is generated or it does not exist.** Any table mapping IDs to owners, files to
states, or rules to enforcement is derived from the repo by a command, never hand-maintained.
A register you cannot regenerate is a stale document with a table in it, and every number in it
is unverifiable without re-measuring by hand. (Five hand-maintained registers produced wrong
counts in every direction, repeatedly.)

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

Writing shared CSS (e.g. `pages.module.css`) to the main app's copy instead of the worktree's produces a silent regression: the build succeeds, the main tree's dev server shows the change, the worktree branch does not. **To recover**, read the worktree file to confirm it is missing the change, then re-apply the edit to the correct path.

### Content Write Gate (Tier 1 — stop and ask; all Sanity MCP writes)

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

### The Human-Publishes Rule (Tier 1 — stop and ask; publish/unpublish operations)

The agent drafts. The agent proposes. The agent patches Sanity documents once a proposal is approved. The agent never publishes them.

**Scope:** every action that makes a Sanity document, or an edit to one, go live — `publish_documents` and `unpublish_documents`, and any equivalent tool call, on any document type, in any dataset. No exceptions by content type: this covers glossary terms, articles, nodes, case studies, taxonomy, schema-adjacent content, everything.

**No prior approval carries forward to publish.** Approving a proposal under the Content Write Gate authorizes the write to the *draft*. It does not authorize the publish. These are two separate actions requiring two separate sign-offs, even when they happen in the same conversation. "Yes, that copy looks good" approves the draft. It is not "yes, publish it."

**The only way the agent publishes something is an explicit, standalone instruction to do so** — "publish that," "make it live," "go ahead and publish" — given as its own instruction, not inferred from approval of the content itself. Absent that explicit instruction, every skill and every session stops at the draft and tells the human what's ready and where to find it — typically: open it in Studio and click Publish.

This is the fail-softly layer referenced above: even a Content Write Gate failure — content written without a proper proposal — stays contained to a draft nobody sees until a human deliberately publishes it. Every skill that writes to Sanity (`/glossy`, `/write-blog`, `/write-node`, `/write-casestudy`, `/red-pen`) stops at this same line.

**Response mechanism:** a negative/absence gate per `docs/conventions/human-gate-conventions.md` — no prompt shown; block on the absence of a standalone publish instruction, message kept to one sentence.

### Instruction & Rule File Write Gate (Tier 1 — stop and ask; skill/CLAUDE.md/governance doc edits)

The agent — or any subagent it spawns — never edits a rule-defining file (`.claude/skills/**`, `.claude/rules/**`, this file, `docs/epic-template.md`, or anything under `docs/ai/agentic-caucus/`, `docs/conventions/`, or `docs/diagrams/`) without first showing the human the exact diff and getting explicit approval. Applies even when the edit is accurate and well-intentioned.

**Produce the diff from a copy, not from the file.** Write the change to a scratchpad copy and diff it against the original.

**Why its own gate:** Sanity content has a draft/published split — an unapproved write does nothing until a human publishes it. Rule files don't have that boundary. A committed change to CLAUDE.md or a skill definition is load-bearing immediately, for every future session.

**Scope:** covers the orchestrating session *and* any subagent it spawns. A subagent told to review X has no implicit authority to also edit X's own instructions, however reasonable the addition looks.

**For subagents specifically:** when a task could plausibly touch a rule-defining file, forbid it from writing there and have it return proposed changes as text in its report instead. A subagent's own commit is never the final word — the orchestrating session reviews before surfacing anything to the human.

**Response mechanism:** a select-list gate per `docs/conventions/human-gate-conventions.md` — show the exact diff, then ask via a single select option.

### Rule-file followability walkthrough

**Scope is the gate's scope above (which includes `.claude/rules/**`), plus `docs/workflows/**`,
`docs/ship-prompt.md`, and `docs/switch-prompt.md`.** Wider on purpose: the gate governs *authority to edit*, this governs
*whether the result can be followed*, and these prompts are followed by later sessions exactly as
this file is. Two of the first three runs found defects in prompt files. **Updated 2026-08-19:**
`docs/mini-release-prompt.md` retired; `docs/ship-prompt.md` is its functional successor and
`docs/switch-prompt.md` is added — it mirrors the command this scope already covered under its
old name and was never listed, which is itself the class of gap this walkthrough exists to catch.

After editing any file in that scope, and before committing it:

1. **Name the workflows the change touches**, from the write-site audit that motivated the edit. Defects cluster in the files that *consume* the edited rule, not in the rule text: 7 of the first 9 findings were in prompts and templates the change never opened.
2. **Walk one mock instance end to end, reading only the edited text** — not from memory of what it used to say.
3. **For each step, record whether it can be done today** — the tool exists, the quota allows it, the referenced file and section resolve.
4. **Flag every step that is unfollowable, ambiguous, or points at something that does not exist.**

Output is a findings table in the commit message for the change it audited. No new file, no register, no validator.

**Renaming a heading obliges a grep for inbound references to the old text**, in the same commit. It was the only defect class to repeat across the first three runs and it reached six files at once. Shipped docs keep the old name: a shipped doc records what was true when it shipped. `node scripts/check-renamed-headings.js <file>` runs this grep mechanically (ST-101 S1) — a session-run aid for step 1 above, not a pre-commit or CI gate; it found a live orphaned reference from 2026-08-16's rename on its first real run, five days after the fact.

Retire this when three consecutive rule changes pass with no finding. Record and review: `docs/shipped/ST-99-rules-change-qa.md`.

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

**`citationRef` is safe in `sections[].content`, including via MCP writes**, provided the block has well-formed `markDefs: []`/`marks: []`. If a genuine citationRef-specific lock recurs, capture the document ID, whether `markDefs`/`marks` were well-formed, and any console errors before adding a rule here. Do not restate the causal claim from memory.

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

## Image Asset Naming

All images uploaded to Sanity must follow the naming convention in `docs/conventions/image-naming-convention.md`:

```
{docType}-{subject}-{descriptor}[-{index}].{ext}
```

- Prefixes: `article-`, `cs-`, `node-`, `project-`, `tool-`, `diagram-`, `site-`
- Formats: `.webp` (photos), `.png` (diagrams), `.svg` (icons/logos)
- Never upload with default camera/screenshot names (`IMG_1234.jpg`, `Screenshot 2026-...`)

---

## Atomic Reuse Gate (blocking)

Before creating any new **schema object** or **shared utility** (`lib/` function, cross-cutting helper), answer these questions **in writing** (in the epic doc, commit message, or inline comment):

1. **Does this pattern already exist?** — Search all 5 layers per MEMORY.md §Before You Build. If yes, extend — do not fork or duplicate.
2. **Will this be consumed by more than one caller?** — If yes, it must live in a shared location (`lib/`, `schemas/objects/`), never inline in a page file.
3. **Is the API composable?** — Fields/params should be named so it can be extended without forking.

**New CSS classes and new JSX components or blocks have their own, more specific gates** — `.claude/rules/css-layout.md` §CSS class pre-implementation reuse audit and `.claude/rules/react.md` §Component choice gate, which load when those files are read. Do not re-run this generic checklist for those; their gates supersede it.

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

### Visual QA approval — when a vspec exists (Tier 1 — stop and ask)

Produce a **vspec-to-build comparison table** before requesting close-out. The table must list every visual element in the vspec (field order, spacing values, chip styles, typography, colours) and flag each as Match, Drift, or Missing. Present this table to Bex for review. Do not close the epic until "Visual QA approved."

### Technical diagram red-pen gate (Tier 1 — stop and ask; fires before any diagram is uploaded or published)

Applies to any technical or architecture diagram destined for a published surface: Sanity upload, case study, article, docs site, social post.

**Any figure you report carries the command that produced it.** A count, size, line number or measurement in a shipped doc, release note, commit message or Linear description names the command, not the document you read it from. Quoting a figure from a prior doc is how it goes stale without anyone noticing. (SUG-243 reported four wrong numbers this way, each corrected by running something.)

**This gate also fires on published governance statistics** — any rendered count, tally, or coverage claim about the platform's own rigour (`/platform/governance`'s "30 checkpoints · 0 gaps", validator counts, enforcement tallies). Same claim table and evidence classes, plus two requirements: the claim carries a **measurement date**, and its Evidence cell names the command or file producing the number, not the intent behind it. A tally that is true when written and never re-measured becomes a false public claim silently.

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

### Honesty over confidence

List visual elements you cannot verify without a browser. "I cannot confirm the hover state transition timing matches the vspec" is acceptable. "Everything looks good" without evidence is not.
