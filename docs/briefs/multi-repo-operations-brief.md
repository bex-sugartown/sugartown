# Multi-Repo Operations Brief

| Field | Value |
|---|---|
| **Document** | Multi-Repo Operations Brief v1.0 |
| **Status** | 🟢 Decided — D1 through D5 decided; D1 stays open only until the first completed Time Machine backup is verified by listing it |
| **Owner** | Bex Head |
| **Executing epic** | [ST-108 / #108](https://github.com/bex-sugartown/sugartown/issues/108) — Multi-repo operations and /sweep command · `Todo` · High |
| **Epic doc** | `docs/backlog/ST-108-multi-repo-operations-and-sweep-command.md` |
| **Scope** | Repository topology across `sugartown`, `resume-factory/os`, `cms-eval/toolkit` and `conventions/` (a repo since 2026-09-03); where shared conventions live; unversioned-content risk; the `/sweep` command |
| **Constrains** | ST-108 and any future cross-repo tooling. Does not constrain work inside a single repo. |
| **Decisions** | D1 decided 2026-09-02 (Time Machine to `/Volumes/Angelique`). D2 decided 2026-09-03 (promote `conventions/` to a private repo; Bex sets it up). D3, D4, D5 decided 2026-09-03 in ST-108 Phase 1 (`/sweep`; hosted in the `conventions/` repo; fetches per repo). |
| **Audit input** | `docs/reviews/2026-09-03-claude-code-layout-alignment-audit.md` — Claude Code layout audit; its Q2 settles why `conventions/` stays a subfolder and adds the root loader below |
| **Related issues** | [#106](https://github.com/bex-sugartown/sugartown/issues/106) wip-mirror stale-ref bug · `Shipped` — its log is what `/sweep` reads<br>[#109](https://github.com/bex-sugartown/sugartown/issues/109) wip-mirror rebase race · `Backlog` — same log, different failure |
| **Project ID** | N/A — umbrella operations doc, not a single project (per `docs/briefs/README.md` litmus test) |
| **Supersedes** | Nothing. First doc covering work outside the `sugartown` repo. |
| **Created** | 2026-09-02 |
| **Last reviewed** | 2026-09-02 |

---

## Why this exists

`/ship` covers one repo. Bex now runs three, plus a shared folder that is not a repo, plus
several hundred megabytes of working content that is versioned nowhere. No command answers the
question that actually matters at the end of a day: **is all of my work safe.**

This brief locks the topology, names the risks with measurements, recommends a target
architecture, and specifies the sweep command that operates it.

Triggered 2026-09-01, when a Cowork bridge session committed work in two repos and could push
neither, and stale git locks from a single incident were found sitting in all three.

---

## Current topology, measured 2026-09-02

`SUGARTOWN_DEV/` is a plain directory, not a repository. Everything below sits inside it.

| Path | Git | Remote | Visibility | Notes |
|---|---|---|---|---|
| `sugartown/` | repo | `bex-sugartown/sugartown` (HTTPS) | **public** | Netlify, CI, project board, `/ship` |
| `resume-factory/os/` | repo | `bex-sugartown/resume-factory-os` (HTTPS; switched from SSH 2026-09-03) | private | no deploy, no board |
| `resume-factory/data/` | none | none | — | **510 MB, 775 files** |
| `resume-factory/private/` | none | none | — | **324 MB, 30 files** |
| `cms-eval/toolkit/` | repo | `bex-sugartown/cms-eval` (HTTPS) | private | no deploy, no board |
| `cms-eval/bound/` | none | none | — | 14 MB, confidential client source. Standing rule: never read, staged, copied or gitted |
| `cms-eval/instances/` | symlink | — | — | → Google Drive `cms-eval/clients` |
| `cms-eval/published/` | symlink | — | — | → Google Drive `cms-eval/_artifacts` |
| `conventions/` | repo (since 2026-09-03, first commit `3c3ea58`) | `bex-sugartown/conventions` (HTTPS) | private | 5 files, 28 KB. Canonical cross-project rules. Hosts `/sweep` and the #110 hook script per D4 |
| `_archive/`, `codesnippets/`, `cursor/`, `jessiecowan/`, `sanity-backups/`, `wordpress/` | mixed | — | — | Out of scope for the sweep |

Two archived repos exist under `_archive/` (`sugartown-frontend`, `sugartown-sanity`). They are
historical and out of scope.

---

## Findings

### F1 — 834 MB of working content exists in exactly one place (severity: highest)

`resume-factory/data/` and `resume-factory/private/` are not in git, have no Google Drive
symlink, and have no other visible copy. `cms-eval` solved the same problem with two Drive
symlinks. Resume Factory has no equivalent.

Backup posture could not be confirmed from the shell, and the signals are poor:
`tmutil latestbackup` returns nothing, the destination named `Victoria` resolves to `/` (the
boot volume itself), and only `com.apple.TimeMachine.localsnapshots` are present. Local APFS
snapshots do not survive a disk failure. `SUGARTOWN_DEV` is *included* in Time Machine, so this
is not an exclusion problem.

**This outranks every other finding here.** A missing EOD command costs an afternoon. This costs
the content.

**Resolved 2026-09-02: Time Machine to `/Volumes/Angelique`**, covering all of
`SUGARTOWN_DEV/`. Bex reconfigures the destination in System Settings; a session cannot change
Time Machine configuration.

Syncing the parent directory to Google Drive was considered and rejected. `SUGARTOWN_DEV/` is
21 GB, and four things make it the wrong tool at that scope:

1. **5.4 GB is regenerable.** `node_modules` across 11 directories, 3.4 GB in `sugartown/`
   alone. It returns from a lockfile; backing it up is waste.
2. **`.git` corruption risk.** 5 repositories, 5,364 files inside `.git` directories. Cloud
   sync clients copy `.git` internals non-atomically, so refs, index and packfiles can land
   out of step. Time Machine snapshots are atomic.
3. **Symlink loop.** `cms-eval/instances` and `cms-eval/published` point *into* Google Drive.
   Syncing the parent into Drive means Drive syncing a folder that links back into Drive.
4. **Confidentiality.** `cms-eval/bound/` is 14 MB of client source under a standing rule that
   it is never read, staged, copied or gitted. A parent-directory Drive sync copies it to
   third-party cloud storage silently. This is a contract question, not a technical one, and it
   is the reason the decision is not merely a performance preference.

`/Volumes/Angelique` is 1.8 TB with 1.1 TB free. The prior Time Machine destination, named
`Victoria`, resolved to `/` — the boot volume, which is 92% full and offers no protection
against the failure of the disk it lives on.

### F2 — no command covers work outside sugartown

`/ship` is sugartown-shaped: Netlify credit accounting, the project board, `Done` → `Shipped`,
CHANGELOG. None of it applies to the other two repos, so they are swept by hand or not at all.
On 2026-09-01 both sat with unpushed commits that a human had to notice.

### F3 — shared conventions have no history and do not travel

`conventions/` holds the rules all three projects depend on, in five plain files. No history on
the one document set with the widest blast radius. It does not travel with any clone, and the
folder's own README names the consequence: a Cowork session that mounts one project cannot see
it, so the pointer resolves to nothing exactly when an agent needs the rule.

### F4 — credential asymmetry between execution environments

A Cowork bridge VM holds no GitHub credential, so it can commit but never push. Work
accumulates on a disk the human is not watching. Nothing detects this state.

**Narrowed 2026-09-03.** `resume-factory-os` was the one repo on SSH; it was switched to HTTPS
so all four repos ride the single `gh` token in the macOS keychain (verified: fetch succeeds,
`main` in sync with `origin/main`). The asymmetry that remains is between environments, not
repos: the desktop has one credential for everything, the bridge has none.

### F5 — the sweep problem is not only about pushing

The 2026-09-01 incident left stale `index.lock` files in all three repos from one event, and 55
orphaned git temp objects in one. A sweep that only pushes would have reported everything fine
while `resume-factory/os` could not accept its next commit.

---

## Recommended architecture

### Constraint that rules out the obvious answer

**A single monorepo is not available.** The three repos hold three different visibility classes:
`sugartown` is public, `cms-eval` carries confidential client source under `bound/`, and
`resume-factory` carries personal job-search data. Merging them would place client and personal
material in a tree whose sibling is public. Rejected on that basis alone, before convenience is
considered.

### Options considered

| # | Option | Verdict |
|---|---|---|
| A | Status quo: 3 repos + plain `conventions/` | Workable single-machine. Fails F3 outright. |
| B | Add a small private `sugartown-conventions` repo | **Recommended.** 5 files, gains history, travels, mountable alongside one project. |
| C | Single monorepo | **Rejected** — mixes three visibility classes (above). |
| D | `conventions/` as a git submodule in each repo | Rejected — submodule mechanics are a developer tax, and Bex is not a developer (`conventions/human-instruction-style.md`). |
| E | Fold conventions into `sugartown/docs/conventions/` | Rejected — collapses a deliberate split. The shared files were generalised from the Sugartown originals and differ by 216 diff lines; they are different documents, not copies. Also inverts the hierarchy, putting cross-project rules inside one project. |

### The recommendation has two parts, and the second matters more

**1. Storage — promote `conventions/` to a small private repo (option B).** Five files. Buys
history on the highest-blast-radius documents, and lets a Cowork session mount it beside a
single project.

**2. Reachability is a mount problem, not a documentation problem. Keep the bare pointer.**
Connect `conventions/` alongside whichever project a Cowork session mounts. Zero copies, zero
drift.

**No project's `CLAUDE.md` carries a summary of a shared rule.** An earlier draft of this brief
recommended the opposite, and it was wrong. The pointer exists to deter drift: a rule inlined in
four places must be changed in four places, and the one that gets missed is silently incomplete
with nothing to detect it. That is the second-copy problem this repo has ruled on repeatedly —
"there is one priority queue and no second copy", §Building a mechanism rule 3 ("a register is
generated or it does not exist"), and the Mirrored File Registry, which permits duplication only
where a named mechanism enforces it. `tokens.css` is duplicated because `pnpm tokens:build`
generates it and `validate:style-mirror` fails the commit when the copies diverge. A
hand-written summary has neither.

The two failure cases that motivated the summary do not survive inspection. A public clone of
`sugartown` resolving `../conventions/` to nothing is cosmetic: nobody forking a public repo
needs a rule about how instructions are written for Bex. A Cowork session that mounted one
project alone is real, but the fix is what gets mounted. `conventions/README.md` already states
the correct fallback when it does not resolve — *"say so rather than guessing at the standard"* —
and `resume-factory/os/CLAUDE.md` and `cms-eval/toolkit/CLAUDE.md` already carry that caveat.

**If a shared rule ever must exist in more than one place, it is generated and validated, never
hand-written.** That is a build step and a checker, on the `tokens.css` model. Anything less
reintroduces the drift the pointer exists to prevent.

**Do part 2 first.** It costs nothing — it is the current design, correctly left alone. Part 1
is the only change on the table.

### Root loader, added 2026-09-03

Claude Code loads `CLAUDE.md` from the working directory and every directory above it
(verified against `code.claude.com/docs/en/memory.md`, 2026-09-03). So a `SUGARTOWN_DEV/CLAUDE.md`
is auto-loaded by every desktop and terminal session in all three projects, and it can carry
the `conventions/` files as `@` imports. That converts the pointer from prose a session may
or may not follow into context that is simply present, with **one** import site.

Three constraints keep this consistent with the no-second-copy rule above:

1. **The root cannot be a repository.** A `git init` at `SUGARTOWN_DEV/` sits above `data/`,
   `private/` and `bound/`, the same rule both wrapper stubs state one level down. So the
   root file is kept inside the `conventions/` repo as `conventions/CLAUDE.md` and reached
   by a symlink at `SUGARTOWN_DEV/CLAUDE.md`. Verify on first run that the loader follows
   the symlink; if it does not, the root file is a six-line plain file of `@` imports,
   regenerable from the repo README.
2. **The root file is a loader, not a home.** It holds the `@` imports, the topology table
   from this brief, and one-line pointers to the three "never `git init` here / never read
   `bound/` / never upload `private/`" rules. Under 40 lines. Anything that starts to read
   as a rule with a rationale belongs in `conventions/`.
3. **Per-project pointer blocks shrink to their Cowork caveat.** A bridge session mounts one
   folder under `$HOME/mnt/` and sees neither the root nor `~/.claude/`, so the "say so rather
   than guessing" line stays in each project's `CLAUDE.md`. The tables listing the four
   convention files come out; the loader has them.

Consequence for D4: the `conventions/` repo is now a repo every session loads, so `/sweep`
and its rules can both live there. That removes the inversion flagged under "Where the rules
live" below. The laptop needs one bootstrap line in `conventions/README.md` ("Reaching this
folder"): clone the repo, create the symlink. `/switch` syncs `sugartown` only.

### Content architecture — close F1 before anything else

Give `resume-factory` the treatment `cms-eval` already has: an offsite copy for the content that
is deliberately outside git. Options, in preference order:

1. **Google Drive symlinks**, mirroring `cms-eval/instances` and `cms-eval/published`. Consistent
   with an existing, working pattern in this tree. Confirm Drive's quota covers 834 MB first.
2. A dedicated private repo with Git LFS. More machinery; only if the content needs history.
3. Confirmed Time Machine to an external volume, plus one offsite copy.

Whichever is chosen, the sweep command reports the content directories as **unversioned and
unmirrored** until one is in place, so the risk stays visible rather than assumed-handled.

---

## Recommended operations: the sweep command

### Name

**`/sweep`, not `/eod`.** `/eod` was retired on 2026-08-19 and absorbed into `/ship`
(SUG-100 Phase 3b). Reviving the name would point at two different behaviours across the repo's
own history, and `docs/shipped/ST-100-close-out-eod-boundary.md` records the retirement. Open
decision if Bex prefers otherwise — see below.

### What it does, per repo

Read-only assessment first, action second, exactly as `/ship` does.

1. **Stale-lock sweep** — a lock that is 0 bytes, carries an old timestamp, and has no running
   git process is stale. Clear it. A lock seen mid-poll is live and clears itself; do not touch
   it. (`reference_git_lock_recovery`.)
2. **Mirror-log check** — read `.git/st-mirror.log`. A `FAIL` line means commits may exist only
   on this disk.
3. **Tree state** — dirty files, ahead/behind, stashes, branches ahead of `main`.
4. **Unversioned content** — report `resume-factory/data` and `resume-factory/private` as
   at-risk until F1 is verified. `conventions/` left this list on 2026-09-03 (D2); the sweep
   treats it as the fourth repository instead.

### What it does about pushing, which differs by repo

| Repo | Push behaviour | Why |
|---|---|---|
| `resume-factory/os` | push freely | private, no deploy, no CI cost |
| `cms-eval/toolkit` | push freely | private, no deploy, no CI cost |
| `conventions` | push freely | private, no deploy, no CI cost. Added 2026-09-03 when it became a repo |
| `sugartown` | **report only, never push** | a push is a Netlify production deploy (15 credits). Defer to `/ship`. |

### What it must not do

- **Never reimplement `/ship`.** For sugartown it reports and stops. CLAUDE.md §Building a
  mechanism forbids forking a mechanism that exists.
- **Never touch `cms-eval/bound/`.** Standing rule, no exceptions.
- **Never commit on the human's behalf without showing the message**, per the existing
  confirmation model.
- **Never push `sugartown`.** Stated twice on purpose.

### Where the rules live

The sweep is cross-repo, so its rules and its command both live in the `conventions/` repo
(D4, decided 2026-09-03). An earlier draft weighed `sugartown/.claude/skills/` because that
repo had the skill infrastructure, at the cost of a four-repo sweep living inside one of the
repos it sweeps. The root loader removed the reason for that trade: `conventions/` is now a
repo every session loads, so a skill defined there is reachable from every project on the
desktop. How the skill is made discoverable from there is ST-108 Phase 3's last scope item.

---

## Open decisions

| # | Decision | Recommendation |
|---|---|---|
| D1 | Close F1 by Drive symlink, LFS repo, or confirmed Time Machine | **Decided 2026-09-02 — Time Machine to `/Volumes/Angelique`.** Parent-directory Drive sync rejected on four grounds, recorded under F1. Open until the first completed backup is verified by listing it |
| D2 | Promote `conventions/` to a repo, or keep plain files | **Decided 2026-09-03 — promote.** Bex sets up the private repo. Reason: the root loader (above) makes every session load these files, so a lost or corrupted one degrades every session with no history to recover from; and the root itself cannot be a repository, so the subfolder boundary is the only place history can live. Open until the first clone exists and the symlink loads |
| D3 | `/sweep` or another name | **Decided 2026-09-03 — `/sweep`.** `/eod` was retired into `/ship` on 2026-08-19 and `docs/shipped/ST-100-close-out-eod-boundary.md` records it; reviving the name would point at two behaviours across the repo's own history |
| D4 | Where the sweep command lives | **Decided 2026-09-03 — the `conventions/` repo, rules and command together.** It is a repo every session loads (root loader), so a cross-repo command has a cross-repo home and the inversion of hosting a four-repo sweep inside one of the repos it sweeps goes away. Prior recommendation was `sugartown/.claude/skills/`; superseded |
| D5 | Whether the sweep runs `git fetch` in each repo | **Decided 2026-09-03 — yes.** Ahead/behind is meaningless without it, it is free, and ST-113 showed the mirror's own `--force-with-lease` depends on a fresh tracking ref |

---

## Non-goals

- Merging any repos. Ruled out by visibility classes.
- Adding CI, deploys or a project board to `resume-factory` or `cms-eval`.
- Managing `_archive/`, `codesnippets/`, `cursor/`, `jessiecowan/`, `sanity-backups/`, `wordpress/`.
- Replacing `/ship`. The sweep reports on sugartown and defers.
- Syncing the two Linear/GitHub records during the migration trial.

---

## Acceptance criteria

1. `resume-factory/data` and `resume-factory/private` have a confirmed second copy, verified by
   listing it, not by assuming a backup ran. For the D1 route that means `tmutil latestbackup`
   returning a path on `/Volumes/Angelique`, and `tmutil listbackups` showing more than one —
   a destination that is configured but has never completed a backup is what this criterion
   exists to catch.
2. Every dependent project's `CLAUDE.md` reaches `conventions/` by pointer (or, on this
   machine, by the root loader) and states the mount caveat, and **no project inlines a
   summary of a shared rule.** Verified by grepping the three
   `CLAUDE.md` files for the pointer and for the absence of duplicated rule text, not by reading
   for intent. A shared rule that exists in two places without a generator and a validator is a
   defect, not a convenience.
3. One command reports all four repos' state, and pushes the three that are free to push.
4. A stale lock in any of the four is detected and cleared by that command.
5. Running it against a clean tree in all four reports "nothing to do" and exits.
