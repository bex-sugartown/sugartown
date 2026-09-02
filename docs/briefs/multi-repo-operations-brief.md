# Multi-Repo Operations Brief

**Status:** Draft — D1 decided 2026-09-02, D2 through D5 open
**Owner:** Bex Head
**Project ID:** N/A — umbrella operations doc, not a single project (per `docs/briefs/README.md` litmus test)
**Date:** 2026-09-02
**Supersedes:** nothing. First doc covering work outside the sugartown repo.

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
| `resume-factory/os/` | repo | `bex-sugartown/resume-factory-os` (**SSH**) | private | no deploy, no board |
| `resume-factory/data/` | none | none | — | **510 MB, 775 files** |
| `resume-factory/private/` | none | none | — | **324 MB, 30 files** |
| `cms-eval/toolkit/` | repo | `bex-sugartown/cms-eval` (HTTPS) | private | no deploy, no board |
| `cms-eval/bound/` | none | none | — | 14 MB, confidential client source. Standing rule: never read, staged, copied or gitted |
| `cms-eval/instances/` | symlink | — | — | → Google Drive `cms-eval/clients` |
| `cms-eval/published/` | symlink | — | — | → Google Drive `cms-eval/_artifacts` |
| `conventions/` | none | none | — | 5 files, 28 KB. Canonical cross-project rules |
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

`resume-factory-os` uses SSH; the other two use HTTPS. A Cowork bridge VM has neither, so it can
commit but never push. Work accumulates on a disk the human is not watching. Nothing detects
this state.

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

**2. Reachability — every project's `CLAUDE.md` carries a self-contained summary of each shared
rule it depends on, not a bare pointer.** This is the durable fix and it holds under option A or
B. A pointer to `../conventions/` breaks in a public clone and in any session that mounted one
project alone. A summary in the rule file itself never does.

The pattern was applied to `sugartown/CLAUDE.md` on 2026-09-01 for the human-instruction rule:
the paragraph states the whole rule, then names the fuller version and says explicitly that the
paragraph governs wherever that file does not resolve. Follow that shape for every shared rule.

**Do part 2 first.** It is cheap, it is reversible, and it closes F3's real damage. Part 1 is
tidiness by comparison.

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
4. **Unversioned content** — report `resume-factory/data`, `resume-factory/private` and
   `conventions/` as at-risk until F1 and F3 are closed.

### What it does about pushing, which differs by repo

| Repo | Push behaviour | Why |
|---|---|---|
| `resume-factory/os` | push freely | private, no deploy, no CI cost |
| `cms-eval/toolkit` | push freely | private, no deploy, no CI cost |
| `sugartown` | **report only, never push** | a push is a Netlify production deploy (15 credits). Defer to `/ship`. |

### What it must not do

- **Never reimplement `/ship`.** For sugartown it reports and stops. CLAUDE.md §Building a
  mechanism forbids forking a mechanism that exists.
- **Never touch `cms-eval/bound/`.** Standing rule, no exceptions.
- **Never commit on the human's behalf without showing the message**, per the existing
  confirmation model.
- **Never push `sugartown`.** Stated twice on purpose.

### Where the rules live

The sweep is cross-repo, so its rules belong in `conventions/`, with the command itself in
whichever repo hosts it. Hosting it in `sugartown/.claude/skills/` is pragmatic — that repo
already has the skill infrastructure — but it means a sweep of three repos lives inside one of
them. Note the inversion; accept it only if the alternative is not building it.

---

## Open decisions

| # | Decision | Recommendation |
|---|---|---|
| D1 | Close F1 by Drive symlink, LFS repo, or confirmed Time Machine | **Decided 2026-09-02 — Time Machine to `/Volumes/Angelique`.** Parent-directory Drive sync rejected on four grounds, recorded under F1. Open until the first completed backup is verified by listing it |
| D2 | Promote `conventions/` to a repo, or keep plain files | Promote. Bex chose plain files on 2026-09-01 with the tradeoff stated; this brief revisits it because F3's cost is now measured, not theoretical |
| D3 | `/sweep` or another name | `/sweep`; `/eod` collides with a retired command |
| D4 | Where the sweep command lives | `sugartown/.claude/skills/`, with rules in `conventions/` |
| D5 | Whether the sweep runs `git fetch` in each repo | Yes — ahead/behind is meaningless without it, and it is free |

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
2. Every shared rule in `conventions/` has a self-contained summary in each dependent project's
   `CLAUDE.md`, verified by opening a clone with no access to `conventions/` and confirming the
   rule is still followable.
3. One command reports all three repos' state, and pushes the two that are free to push.
4. A stale lock in any of the three is detected and cleared by that command.
5. Running it against a clean tree in all three reports "nothing to do" and exits.
