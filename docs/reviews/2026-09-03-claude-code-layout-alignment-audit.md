# Alignment Audit — SUGARTOWN_DEV Claude Code layout vs. the 2026 Workflow Cheatsheet

**Date:** 2026-09-03
**Standard source:** "Claude Code Workflow Cheatsheet, 2026 Edition" (Brij Kishore Pandey), supplied as an image. Its twelve panels were used as the dimensions. Four mechanics the recommendations depend on were verified against `code.claude.com/docs` (memory.md, settings.md, hooks-guide.md) on 2026-09-03: ancestor `CLAUDE.md` loading, `.claude/rules/` with `paths:` frontmatter and its `~/.claude/rules/` user equivalent, `@path` imports including `@~/`, and the three settings levels with no parent-directory level.
**Scope of ecosystem reviewed:** `~/.claude/` (settings, plugins, projects/memory, absence of CLAUDE.md, skills, rules, hooks), `~/.claude.json` (MCP servers, project registry), `SUGARTOWN_DEV/` top level, `conventions/`, `sugartown/` (`CLAUDE.md`, `.claude/**`, `.mcp.json`, `.husky/`, `docs/ai/`, `docs/conventions/`), `resume-factory/CLAUDE.md`, `resume-factory/os/` (`CLAUDE.md`, git config, `.gitignore`), `cms-eval/CLAUDE.md`, `cms-eval/toolkit/` (same). `resume-factory/data/`, `resume-factory/private/` and `cms-eval/bound/` were not read; only their existence and git status were checked. Companion doc: `docs/briefs/multi-repo-operations-brief.md` (ST-108).

## Summary

Twelve dimensions: 4 Match, 5 Drift, 2 Gap, 1 N/A. The wrapper pattern that keeps `data/`, `private/` and `bound/` outside git is sound and is the part of the layout that most exceeds the standard. The biggest finding is the inverse of the cheatsheet's "never overwrite parent context" rule: the **global** layer carries **sugartown-specific** content (`~/.claude/settings.json` describes the repo as PUBLIC and names sugartown paths as routine), and it loads into every `resume-factory` and `cms-eval` session, where the repos are private and hold PII and client material. The second finding is that the two rules Bex cares most about (`bound/` never read, `private/` never uploaded) are convention-only; a single global `PreToolUse` hook would make them enforced-by-code, and the global layer is the only place such a hook can live.

## Findings

| # | Dimension (from standard) | Verdict | Evidence | Notes |
|---|---|---|---|---|
| 1 | Getting Started (`/init`, starter memory file) | N/A | All three projects already carry a `CLAUDE.md`; `/init` is a bootstrap step, not a steady-state one | Nothing to do |
| 2 | Understanding CLAUDE.md (tech stack, directory map, architecture, commands, workflows, gotchas) | Drift | `sugartown/CLAUDE.md` is gates and process (MCP call, close-out, Tier 1 gates, CSS triage); the stack map and file locations live in auto-memory (`~/.claude/projects/-Users-beckyalice-SUGARTOWN-DEV-sugartown/memory/reference_stack.md`, `reference_key_file_locations.md`). `resume-factory/os/CLAUDE.md` and `cms-eval/toolkit/CLAUDE.md` do carry the "where things are" table | The "what" half of sugartown's project context is machine-local and untracked. `/switch` syncs the repo across desktop and laptop; `~/.claude/projects/` does not travel with it |
| 3 | Memory file hierarchy (global → parent → project → subfolder; each <200 lines; subfolders append, never overwrite parent) | Drift | No `~/.claude/CLAUDE.md`, no `~/CLAUDE.md`, no `SUGARTOWN_DEV/CLAUDE.md`. Parent layer for the two private projects exists as stubs: `resume-factory/CLAUDE.md` (54 lines), `cms-eval/CLAUDE.md` (28 lines). Line counts: `sugartown/CLAUDE.md` 1000, `resume-factory/os/CLAUDE.md` 430, `cms-eval/toolkit/CLAUDE.md` 106. Stray tracked subfolder file: `sugartown/docs/briefs/design-system/audit-26-06-03/design_handoff_component_codification/CLAUDE.md` (committed 2026-06-03, a handoff package's own charter, loads whenever a session reads files there) | Global and top-parent layers are empty; the shared rules that belong there sit in `conventions/` reached by prose pointer only. Two of three project files exceed the 200-line guideline by 2× and 5×. The stub-parent / versioned-child shape for the private projects is a correct use of the hierarchy, not a defect |
| 4 | CLAUDE.md best practices (specific, gotchas, `@filename` references, concise, committed) | Drift | `grep -c '^@' sugartown/CLAUDE.md` = 0. Gotchas are strong (skip-ci trap, hooks-order, `container-type`). All three project files are committed | The cheatsheet's `@filename` mechanism is unused; every reference to `docs/conventions/*.md` is a prose path the session may or may not open. Splitting the 1000-line file is possible without losing anything because the target files already exist |
| 5 | Project file structure (`CLAUDE.md`, `.claude/settings.json`, `settings.local.json`, `skills/`, `commands/`, `agents/`, `.gitignore`) | Drift | `sugartown/.claude/`: `agents/` (1), `commands/` (5), `skills/` (16 live + `zArchive/`), `launch.json`, `settings.local.json` (gitignored, 74 KB, 828 allow entries, 665 of them `Bash(...)`, plus 4 `env` secrets). **No tracked `.claude/settings.json`.** `resume-factory/os` and `cms-eval/toolkit`: no `.claude/` directory at all; their `.gitignore` files do not mention `.claude/`, so a future `settings.local.json` there would be committable | Sugartown has the shape minus the shared settings file, so nothing about permissions or hooks is versioned or shared. `commands/morning.md` and `commands/restart.md` coexist with `skills/morning/` and `skills/restart/`; one shadows the other |
| 6 | Skills (project vs personal; `description` field critical) | Match, with one Drift | All 16 live `SKILL.md` files carry `description:` frontmatter. No `~/.claude/skills/`. Cross-project skills `glossy`, `morning`, `switch`, `sugartown-epic-writer`, `sugartown-prd-writer` also appear as `anthropic-skills:*` (claude.ai account skills, not on this disk); `docs/ai/skills-index.md` is a hand-maintained 39-row register that ST-103 found listing a retired skill and omitting six real ones (`CHANGELOG.md` `[Unreleased]`) | Project skills are done well. Two second-copy problems: the claude.ai duplicates, and the hand-maintained index, which CLAUDE.md §Building a mechanism rule 3 says should be generated or not exist |
| 7 | Skill ideas for AI engineers | N/A | Suggestion list, not a requirement | — |
| 8 | Hooks (`PreToolUse` / `PostToolUse` / `Notification` in `settings.json`) | Gap | `grep '"hooks"'` across `~/.claude/settings.json`, `~/.claude/settings.local.json`, `sugartown/.claude/settings.local.json`: none. Enforcement exists at the git layer instead: `sugartown/.husky/{pre-commit,post-commit}`, `core.hooksPath=scripts/hooks` in both private repos | Git hooks fire at commit time. The rules "`bound/` is never read, copied or staged" and "`private/` is never uploaded" have no enforcement before commit: a session can `Read` either directory today and nothing stops it. This is the one place the cheatsheet's L3 layer would buy something the git layer cannot |
| 9 | Permissions & safety (`allow` / `deny` in `settings.json`) | Drift | `~/.claude/settings.json`: 7 `allow` rules (git-lock housekeeping, correct at global scope), 12 plugins, and an `autoMode.environment` block whose lines read "Repository visibility: PUBLIC — bex-sugartown/sugartown", "Trusted repo: bex-sugartown/sugartown", "Routine under repo prefix: docs/backlog/, apps/web/src/ …". No `deny` list anywhere. `~/.claude/settings.local.json` hard-codes two sugartown paths. `settings copy.json` (Aug 15) is a stray backup. `sugartown/.claude/settings.local.json` `env` holds a Chromatic token and a Contentful management token | The global file is loaded by every session on the machine. In a `cms-eval/toolkit` or `resume-factory/os` session the environment description is wrong on visibility, wrong on the trusted repo, and silent on `bound/` and `private/` as sensitive locations. This is project context in the global layer, the inverse of "never overwrite parent context". The secrets are gitignored and not leaked; the point is that the 828-rule allowlist is per-session accretion, not a designed policy |
| 10 | 4-layer architecture (L1 CLAUDE.md, L2 skills, L3 hooks, L4 agents) | Drift | L1 present in all three. L2: sugartown only. L3: absent (dim. 8). L4: `sugartown/.claude/agents/design-reviewer.md`; none elsewhere | Sugartown is a three-layer project; the two private projects are one-layer. Not every layer is owed to every project, but L3 is the one that maps to the IP requirement |
| 11 | Daily workflow (plan mode, describe intent, `/compact`, commit frequently, new session per feature) | Match | ST-108 epic doc mandates plan mode for its Phase 1; CLAUDE.md §Mid-epic commit checkpoints and the `post-commit` wip-mirror; one-epic-per-session discipline; `/morning` and `/ship` bookend the day | No evidence either way on `/compact`; not a finding |
| 12 | Quick reference | N/A | Keyboard reference | — |

### Top-level `SUGARTOWN_DEV/` cruft (outside the standard's dimensions, observed in passing)

`QUICK_START.md` and `SUGARTOWN_MONOREPO_SUMMARY.md` (Feb 2026), `epic-6-migration-prompt-v2.md`, `sugartown-erd.jsx`, and `sugartown-sanity.code-workspace` pointing at `sugartown-frontend/` and `sugartown-sanity/`, which now live under `_archive/`. `03 RESUME FACTORY.code-workspace` opens the iCloud archive that `resume-factory/CLAUDE.md` says nothing should write to. `~/.claude.json` registers 45 project paths, most of them dead worktrees under `~/.claude-worktrees/sugartown-pink/` and `~/.claude-worktrees/sugartown-frontend/`. None of this is harmful; all of it is noise a `SUGARTOWN_DEV/CLAUDE.md` would have to explain away.

## Recommendations

Ordered by the IP requirement first, then by how much each closes.

- **Dim. 8, hooks — add one global `PreToolUse` hook that blocks `Read`, `Edit`, `Write`, `Glob`, `Grep` and `Bash` calls whose input names `cms-eval/bound/` or `resume-factory/private/`** (exit code 2, in `~/.claude/settings.json`). This is the shared, global, enforced-by-code version of the two standing rules, and the user level is the only settings level that reaches paths outside any repo. It goes through the Instruction & Rule File Write Gate (diff shown, approval asked). Keep it path-based, not repo-based, so it holds in a session opened at `SUGARTOWN_DEV/` itself.

- **Dim. 9, permissions — move the sugartown-specific `autoMode.environment` block out of `~/.claude/settings.json` into a new tracked `sugartown/.claude/settings.json`**, and leave the global file with what is true everywhere on the machine (git-lock housekeeping, plugins, notification prefs). Write short equivalents for the two private repos, each naming its own sensitive location (`bound/`, `private/`, `data/`) and its own visibility. Delete `settings copy.json`. This is the single change that makes the global layer stop misdescribing two of three projects.

- **Dim. 3 and 4, hierarchy — fill the two empty layers, one pointer each, no summaries.**
  - `~/.claude/CLAUDE.md` (global): how sessions talk to Bex. It should contain one line, `@~/SUGARTOWN_DEV/conventions/README.md`, plus a `@` import for each of the four convention files. That converts `conventions/` from prose-pointer to auto-loaded on this machine, in every project, and the three hand-copied pointer blocks (`sugartown/CLAUDE.md:90`, `resume-factory/os/CLAUDE.md:41-58`, `cms-eval/toolkit/CLAUDE.md:10-27`) can shrink to their Cowork mount caveat. This is consistent with the brief's "keep the bare pointer, no inlining" rule: it is one pointer moved up a level, not a fourth copy. If D2 promotes `conventions/` to a repo, the import path does not change.
  - `SUGARTOWN_DEV/CLAUDE.md` (parent, auto-loaded by all three projects): the topology table from the brief's "Current topology" section and the three "never `git init` here" rules, so a session opened at the parent level, which is where `/sweep` will run, has them. Keep it under 40 lines. Do not let it become a fourth rules file.
  - Cowork bridge sessions mount one folder under `$HOME/mnt/` and see neither `~/.claude/CLAUDE.md` nor the parent, so the per-project "say so rather than guessing" caveat stays exactly where it is.

- **Dim. 3 and 4, size — split `sugartown/CLAUDE.md` (1000 lines) using `.claude/rules/` with `paths:` frontmatter**, which is the mechanism the standard's `@filename` advice has grown into. Candidates that only matter when their files are touched: CSS Triage Protocol, `container-type` guardrail, bg-through-gap rule, Section Layout Contract, GROQ projection audit, Portable Text required fields, DS Documentation Authoring gates, Token-First Rule, Storybook rules. Path-scope each to `apps/web/src/**/*.css`, `apps/studio/schemas/**`, `packages/design-system/**`, `apps/storybook/**` as appropriate. What stays in `CLAUDE.md` is what must apply to every session: the MCP call, the session discipline, the Tier 1 gates, the tracker rules. Same treatment for `resume-factory/os/CLAUDE.md` at 430 lines once it has a second reader. Rule-file edits run the followability walkthrough and go through the write gate.

- **Dim. 3, stray subfolder file — untrack `docs/briefs/design-system/audit-26-06-03/design_handoff_component_codification/CLAUDE.md`** by renaming it to `CHARTER.md` inside the handoff package. It is a different project's charter that currently loads as Sugartown context whenever a session reads that folder.

- **Dim. 5, duplicates and gitignore — resolve `commands/morning.md` vs `skills/morning/` and `commands/restart.md` vs `skills/restart/`** in favour of the skill (the skill carries the description; the command does not). Add `.claude/settings.local.json` to the two private repos' `.gitignore` now, before a session creates one there.

- **Dim. 5 and 9, allowlist — run `/fewer-permission-prompts` once against the transcripts** to produce a curated, tracked `sugartown/.claude/settings.json` allowlist, leaving `settings.local.json` for the four secrets only. 828 accreted rules is not a policy anyone can read.

- **Dim. 6, second copies — pick one home for the five skills that exist both in `sugartown/.claude/skills/` and as claude.ai account skills**, and make `docs/ai/skills-index.md` generated from the `SKILL.md` frontmatter or delete it. Both are the second-copy problem the brief and CLAUDE.md §Building a mechanism rule 3 already rule on.

- **Dim. 2, memory that does not travel — decide whether the `reference_*` memory files that describe the repo (stack, key file locations, registries) belong in the repo instead**, as a short `docs/ai/repo-map.md` imported from `CLAUDE.md`. Auto-memory is per machine and per path; the laptop `/switch`es to has none of it. Feedback and project memories can stay personal.

## Follow-up questions, 2026-09-03

### Q1. Does `~/Documents/Claude` need relocating?

**No. It is not a configuration layer and nothing in the hierarchy reads it.** Measured: 1.5 MB, not a git repository, no `CLAUDE.md`, no `.claude/`, not registered as a Claude Code project in `~/.claude.json`, referenced by nothing under `SUGARTOWN_DEV/` or in memory. The desktop app owns the folder and writes two things there:

| Path | What it is | State |
|---|---|---|
| `Artifacts/{colibri-airecomm-casestudy, eliza-master-timeline, p2-triage-queue}` | Published-artifact working copies: `index.html`, `versions/*.html`, `thumbnail.png`, `debug.jsonl` | App-managed cache of pages the app also hosts. Last write 2026-08-22 |
| `Scheduled/{bluehost-jd0064-followup, gmail-inbox-engine, job-sourcing-scan}/SKILL.md` | Scheduled-task prompt definitions | **Orphaned.** `list_scheduled_tasks` returns none, so all three are unregistered. All three reference the iCloud `03 RESUME FACTORY/` path that `resume-factory/CLAUDE.md` says nothing reads any more, and PRDs that now live in `os/01 PRIVATE/` |

Two action items, neither of which is a relocation:

- **Leave the folder where the app expects it.** Moving it gains nothing and breaks whatever the app writes next.
- **The three `Scheduled/*/SKILL.md` files are the only authored content there, and they are stale.** The two daily engines are job-search operating rules, which `resume-factory/CLAUDE.md` says flow into `os/`. If they are to be revived, write them into `resume-factory/os/` (versioned, paths updated to `../data`) and re-register from there; if not, they are Bex's to prune with the iCloud archive. Either way `/sweep` need not report this folder: it holds nothing that is one-copy-only and current.

### Q2. With a `SUGARTOWN_DEV/CLAUDE.md` at the root, is a `conventions/` repo still needed, or should the shared rules sit at the root?

**Keep `conventions/` as a subfolder, and make it the repo. The root file is a loader, not a home.** Three reasons, in order of weight:

1. **The root cannot be a repository, so nothing at the root can have history.** A `git init` at `SUGARTOWN_DEV/` sits above `resume-factory/data/`, `resume-factory/private/` and `cms-eval/bound/`, which is the rule both wrapper stubs state one level down ("never `git init` at this level"), applied one level higher. `.gitignore` does not answer the confidentiality point in the brief's F1, and nested repositories inside a parent repository are submodules or ignored trees, the developer tax option D already rejected. So "organise it at the root" and "version it" are mutually exclusive. The subfolder boundary is what lets the shared rules be a repo at all, exactly as `os/` and `toolkit/` are load-bearing for their parents.
2. **A root `CLAUDE.md` makes the repo more necessary, not less.** Today `conventions/` is read when a session follows a prose pointer. With a root loader importing it, every desktop and terminal session in all three projects loads those four files automatically. A silently corrupted or lost file then degrades every session with no history to diff against; the stated recovery path, `sugartown/docs/conventions/`, differs from the shared versions by 216 lines and is not a restore.
3. **The root file itself can ride in the repo.** Keep `SUGARTOWN_DEV/CLAUDE.md` as a symlink to `conventions/CLAUDE.md`, so the loader and the files it imports are versioned together and the root carries no unversioned content. Verify on first run that the loader follows the symlink; if it does not, the root file is a 6-line plain file whose entire content is `@` imports and is regenerable from the repo's README.

What the root `CLAUDE.md` should contain, and no more: the `@conventions/...` imports, the topology table from the brief, and the three "never `git init` here / never read `bound/` / never upload `private/`" rules as one-liners pointing at the stubs that own them. Under 40 lines. Anything that starts to read as a rule with a rationale belongs in `conventions/`.

**This revises the hierarchy recommendation above.** With the imports in the root loader, the proposed `~/.claude/CLAUDE.md` is redundant for every project under `SUGARTOWN_DEV/`, and a global file would also load into unrelated folders. So: **parent layer carries the conventions imports; global layer carries only what has no parent equivalent**, which is the `PreToolUse` hook and the machine-wide permissions, because settings files have no parent-directory level. One import site, not two.

Two consequences to record in ST-108 when D2 is settled:

- **D4 becomes simpler.** `/sweep` rules go in the `conventions/` repo, and the command can live there too, since it is now a repo that every session loads. That removes the inversion the brief flags (a three-repo sweep living inside one of the repos it sweeps).
- **The laptop needs a bootstrap line.** `/switch` syncs `sugartown` only. The `conventions/` clone and the root symlink have to exist on the second machine before any of this loads there; one line in `conventions/README.md` under "Reaching this folder" covers it.

## Execution plan, 2026-09-03

Every finding above now has a home. Three new issues were filed from this audit (#110, #111, #112); the rest landed in ST-108's scope. #107 and #109 predate the audit and are placed in the order because they share files or readers with it. Nothing here is a fourth copy of a spec: each issue body is the spec, and this table is the order.

### Bex's own actions, outside any issue

| When | Action | Why it is not an issue |
|---|---|---|
| Now (in progress) | Create the private `conventions/` repo from the existing five files | D2, decided 2026-09-03. A session cannot create a repo on Bex's GitHub account |
| At #110 and #111 | Apply the two prepared diffs to `~/.claude/settings.json` | Human-only file (memory: `reference_git_lock_recovery`); one diff for both |
| Any time | Confirm the first completed Time Machine backup: `tmutil latestbackup` returns a path on `/Volumes/Angelique` | D1 acceptance criterion; a session cannot read it reliably |
| Any time | Prune `~/Documents/Claude/Scheduled/` (three orphaned task files) with the iCloud `03 RESUME FACTORY` archive | Personal content outside every repo; if the two daily engines return they are rewritten into `resume-factory/os/` |

### Order

| # | Item | Status · Priority | Why here | Size |
|---|---|---|---|---|
| 1 | **#109** post-commit mirror races itself during a rebase | Todo · High | Independent, three lines, and its log is what `/sweep` reads. Every `/ship` rebase until then writes a spurious `FAIL` | Under an hour |
| 2 | **ST-108 Phase 1** decisions, root loader, pointer trims, laptop line | Todo · High | Needs the `conventions/` repo to exist. Settles D4, which is where #110's script and `/sweep` live. Trims `sugartown/CLAUDE.md:90`, which #112 would otherwise collide with. Stays on the epic's single close-out branch | Half a day |
| 3 | **#110** PreToolUse guard hook for `bound/` and `private/` | Todo · High | The IP requirement, enforced-by-code. Script into the `conventions/` repo; Bex applies the global-settings diff | Half a day, plus the self-test |
| 4 | **#111** settings relayering | Todo · High | Same global-file edit session as #110, so `~/.claude/settings.json` changes once. Ends the PUBLIC misdescription in private-repo sessions. Run `/fewer-permission-prompts` here | Half a day |
| 5 | **ST-108 Phases 2 and 3** `/sweep` read-only, then push and wire | Todo · High | Picks up #110's self-test as a `guard:` line. Close-out ships the whole epic per strategy (b) | One to two days |
| 6 | **#112** CLAUDE.md split into `.claude/rules/`, strays, skills index | Backlog · Medium | After Phase 1's trim and after the settings move, so the rule-file gates are extended once (#112 step 1) and every later rule edit is covered. Gated, walkthrough on each moved section | One to two days |
| 7 | **#107** `/release` tags, milestone, GitHub Release | Todo · no priority | Independent of everything above. Do it before the next `/ship --release` if that release should be tagged automatically; otherwise tag by hand once more | Half a day |

Two board contradictions noticed while placing these, both outside this audit's remit and left for Bex: #105 is `High` at `Backlog`, and #107 is `Todo` with no priority. CLAUDE.md §Issue status = workflow stage says `High` means `Todo`; #107's priority is Bex's call.

### What this plan does not do

- It does not reorder the epics around a Netlify deploy. Items 1 to 5 are all shippable in one `/ship`; a mid-plan ship after item 2 is fine if the wip-mirror log needs to be trusted sooner.
- It does not touch `resume-factory/os/CLAUDE.md` (430 lines). Same treatment as #112 when that repo has a second reader.
- It does not file anything for `~/Documents/Claude` or the iCloud archive; both are Bex's to prune.

## Framing caveats

- The cheatsheet assumes one developer, one repo per project, and no non-git material beside the repo. The wrapper pattern (non-repo parent holding `data/`, `private/`, `bound/`, with the repo one level down, and a stub `CLAUDE.md` at the parent) is not in the standard and is the correct answer to a requirement the standard does not have. The ancestor-loading behaviour verified in the docs is what makes it work: a session in `os/` or `toolkit/` loads the parent stub and the versioned rules together. Two of the three "Drift" verdicts on hierarchy are about the layers above that wrapper, not the wrapper itself.
- The cheatsheet's "parent, monorepo root" layer is `~/CLAUDE.md`. In this layout the equivalent is `SUGARTOWN_DEV/CLAUDE.md`, because `~` also holds unrelated folders. The recommendations use that mapping.
- Cowork bridge sessions do not see the user or parent layers at all, so every recommendation above improves the desktop and terminal case and leaves the bridge case where the brief already left it: pointer plus caveat.
- The "sugartown-specific global settings" finding is about which file the content sits in, not the content. The `autoMode.environment` text is accurate for sugartown and should survive the move unchanged.
- No measurement here was copied from a prior doc. Line counts are `wc -l`; the allowlist composition is a `json` load of the file; the hook and import facts are the docs pages named at the top.
