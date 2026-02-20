# We Fixed the Same White Screen Three Times (And Then Built a Prompt to Prevent It)

*A brief meditation on AI-assisted development, branch hygiene, and the PM who kept asking the right questions*

---

There's a particular kind of embarrassment that comes from realising you've solved the same problem three times in ten days. It deepens considerably when you're the one who told the AI what was wrong every single time.

This is that story.

---

## The Setup

In late January 2026, Sugartown — a personal site and knowledge project — migrated from a WordPress/Python pipeline into a proper React + Sanity monorepo. Two legacy repos were subtree-imported into a single pnpm workspace. The history was preserved. The architecture was modern. The vibes were immaculate.

And then the header and footer kept disappearing.

---

## Three Fixes, Ten Days, One Bug

The root cause was mundane: during the migration, `Header.jsx` and `Footer.jsx` were half-migrated to a new `siteSettings` query pattern but still referenced the old variable names (`header`, `footer`) from the legacy queries. React threw a `ReferenceError`. The render tree died. White screen.

Simple. Obvious. In retrospect.

Here is how it got fixed:

**February 7 — Fix #1** (`429390d`, branch: `objective-newton`)
Minimal patch. Renamed the state variables. Fixed the wrong import. The commit message was clear, the fix was correct, the branch was never merged to `main`. It sat on a remote branch with an auto-generated name, quietly waiting to be discovered.

**February 8 — Fix #2** (`9ba8d22`, branch: `upbeat-galileo`)
New session, no memory of Fix #1. The white screen was encountered again. This time the response was more ambitious: threw out both components entirely, rewrote them as props-receiving components fed from a single top-level `siteSettings` fetch in `App.jsx`. Better architecture. Made it to `main`. Fix #1 was now unreachable and irrelevant, stranded on a remote branch no one was watching.

**February 17 — Fix #3** (`e9fcdfc`, branch: `integration/parity-check`)
Ten days later, during a major parity migration across eight sequential development stages. The white screen appeared in a new context. Fixed again — variable rename, query correction, import cleanup. Correct. Thorough. Completely unaware that `main` had already solved this with a superior architecture ten days prior.

Three sessions. Three fixes. One bug. Zero cross-session awareness.

---

## Why This Keeps Happening

Claude Code is, genuinely, astonishingly capable. It can read a codebase, trace a bug through component trees and query layers, write correct fixes, maintain architectural consistency across a complex multi-stage migration, and produce release documentation that a senior engineer would be proud of.

What it cannot do is remember that it fixed this last Tuesday.

Each session starts fresh. There is no ambient awareness of "oh, I saw something like this before." There is no internal alarm that says "wait — three branches touched this file in the last ten days, let me check whether this is already solved somewhere." The context window is wide but it is also bounded and it begins at zero every morning.

This is not a criticism. It is a constraint. An important one.

The irony is that the information needed to catch this was always present — in the git log, in the branch names, in the commit messages. The fix on `objective-newton` even had a clear commit message: *"fix undefined variable crashes in Header and Footer."* It just wasn't being looked at.

---

## The PM Who Kept Noticing

Here is the part that deserves a dedicated section.

Throughout this process, the human — a self-described lay person, a Product Manager who "doesn't really do code" — kept being the one to surface the pattern.

*"Isn't this the same white screen issue from before?"*
*"Didn't we fix the header already?"*
*"This feels familiar."*

This is not a small thing. The PM was functioning as the cross-session memory that the AI lacked. Not by reading commit hashes, but by holding the shape of the problem in their head over time. Pattern recognition across context boundaries. The thing that doesn't reset between sessions.

The PM kept handing the AI the thread it had dropped. The AI kept being surprised to find it.

This dynamic — lay person as the connective tissue between AI sessions — is worth naming explicitly, because it is almost certainly more common than anyone admits.

---

## What We Did About It

The response to discovering Fix #3 was to build a morning housekeeping prompt: a structured git audit that runs at the start of every session and produces a plain-English briefing before any new work begins.

It checks:
- What branch you're on and whether it's stale
- What files are uncommitted
- What branches exist, which ones have unmerged work, and which ones are abandoned orphans
- Whether any remote-only branches are hiding relevant history
- What stashes have been forgotten

It delivers a recommendation list in plain English, confirms each action before executing it, and refuses to merge, push, or delete anything without an explicit "yes."

It is, in essence, a prompt that compensates for the absence of cross-session memory by making the first act of each session an honest audit of what the last session left behind.

---

## What This Still Doesn't Solve

The housekeeping prompt is useful. It would have caught `objective-newton` on day two. It would have surfaced the unmerged fix before the second session encountered the same white screen.

But it only works if it's run. And it only works if the output is read. And it only works if the human reviewing the briefing has enough context to recognise that "three branches touched Footer.jsx this week" is a signal worth investigating.

Which brings us back to the PM noticing the pattern.

The honest version of this story is:
- AI is very good at executing within a session
- AI has no memory between sessions by default
- Documentation and git hygiene are the prosthetic memory
- The human is the archivist

---

## Recommendations (Succinct, As Promised)

**Run the morning housekeeping prompt.** Every session. Not when you remember to.

**Merge or close branches within 48 hours.** An unmerged branch is a question mark that compounds. `objective-newton` would have been harmless if it had been merged or closed the day it was created.

**Name your branches.** Auto-generated names (`distracted-hoover`, `upbeat-galileo`, `objective-newton`) are charming but they carry zero semantic information. A branch named `fix/header-footer-white-screen` gets noticed. A branch named `objective-newton` gets forgotten.

**One canonical fix, one place.** When a bug is fixed, the fix should land on `main` before the next session starts. A fix that doesn't reach `main` doesn't exist as far as the next session is concerned.

**Tell the AI what you remember.** If something feels familiar, say so at the start of the session. "I feel like we fixed something like this before" is a valid and useful input. The AI will go look. This is not cheating. This is correct use of the tool.

**Write it down.** The `MEMORY.md` file in this project exists for exactly this reason — persistent facts that survive context resets. Bug patterns, fixed issues, gotchas encountered — these belong there. Not because the AI will remember, but because the file will.

---

## Coda

We built a governance prompt to fix a governance problem that was itself caused by not having governance. This is either very on-brand for software development, or a perfect illustration of why process exists.

The header is rendering correctly now.

All three times.

---

*Part of the Sugartown knowledge graph — tools, workflows, and the occasional humbling lesson from the intersection of AI and product development.*
