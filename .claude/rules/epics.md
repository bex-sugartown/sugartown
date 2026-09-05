---
paths:
  - "docs/backlog/**"
  - "docs/shipped/**"
  - "docs/epic-template.md"
  - ".claude/skills/new-epic/**"
  - ".claude/skills/new-tool/**"
---
# Epic authoring and execution

Loads when a session reads an epic doc, the template, or the epic-filing skills. These rules govern how an epic is filed, sequenced, and started; the close-out sequence and the tracker rules stay in CLAUDE.md because they run in every session. Moved verbatim from `CLAUDE.md` on 2026-09-04 (ST-112); rule-file edits go through the Instruction & Rule File Write Gate exactly as `CLAUDE.md` does.

### Epic authoring — issue-first workflow

When creating a new epic in `docs/backlog/`:

1. **Create the GitHub issue first** — its number is the epic's ID
   (`.claude/skills/new-epic/docs/new-epic-prompt.md` has the `gh issue create` mechanics)
2. **Name the file** `docs/backlog/ST-{github issue number}-{descriptive-name}.md`
3. **Link the issue** in the file header (`**GitHub Issue:** [#{n}](url)`)
4. **Prioritize on the board** — set `Priority` on the project item
5. **Decompose above the sizing gate** — epics with more than 5 Scope items carry a
   scope-to-phase mapping in the epic doc. Numbered phases do not trigger it. **One epic is
   one issue; never file sub-issues.** See
   `docs/conventions/user-story-conventions.md`

`docs/shipped/` holds shipped epics; `docs/backlog/` holds unscheduled and in-flight ones. Legacy `EPIC-NNNN` files in `docs/shipped/` stay as-is.

**Tools do not take this path.** A validator, gate, hook, script, generator or command is filed
with `/new-tool`: a GitHub issue and no backlog doc, because the issue body is the spec. That
skill carries its own activation gate, since §Incomplete epic doc hard stop reads a backlog file
and a tool has none. Use `/new-epic` when the work changes what a user sees, `/new-tool` when it
changes what the repo does to itself.

**Two ID eras, and they overlap.** `SUG-5`–`SUG-284` are IDs from Linear (retired 2026-09-05,
ST-117) on existing epics and never change. `ST-{n}` is a GitHub issue number on epics created
from 2026-08-16. The prefix carries the era because the ranges collide: `SUG-93` is a legacy
epic doc *and* GitHub issue #93 is a different epic. **Never mint a `SUG-` ID again, and never
derive an `ST-` number — GitHub assigns it.** Full rationale:
`docs/briefs/linear-to-github-migration-plan.md` §2.1.

### Multi-phase epic merge cadence

**Phases are execution units, not work items.** One epic is one issue, one backlog
doc, one ship, however many phases. Phases get checkboxes in the parent doc. A phase
that outgrows the epic's Objective splits out via `/new-epic`.

Strategy governs merge cadence only. Declare one in the epic doc header when the epic opens,
and stick to it:

- **(a) Merge-as-you-go** — each phase merges to `main` on completion.
- **(b) Single close-out** — all phases accumulate on one feature branch, merging once.

**Do not mix.** Merging Phase 1 and 1b while leaving 1c on a side branch is what stranded SUG-63 Phase 1c for days. At `/ship`, any branch ahead of `main` belonging to an (a)-strategy epic is resolved — merged, held with a stated reason, or abandoned — before it runs. (Renamed from `/eod`, 2026-08-19.)

**Never run `/ship --release` on a feature branch before merging.** Two epics mid-flight on separate branches each compute "next version" from a stale `package.json`, producing numbers that collide or silently mis-resolve at merge. A same-value bump on both sides resolves without conflict and is still wrong. Merge to `main` first. (Renamed from `/mini-release`, 2026-08-19 — the concern is identical: `package.json` is still a shared counter.)

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

Applies to all epic types, including pure content and editorial epics.

### Design handoff evaluation gate (SUG-163)

Before scoping any epic that originates from an *external* design handoff (gap-analysis doc, Figma export, or equivalent), evaluate the handoff against `docs/conventions/design-handoff-template.md`. Run the anti-checklist and flag every item that would introduce a framework assumption, invented schema field, literal URL path, content-type-prefixed CSS class, or PT-replacement array. Surface corrections in the epic doc's "Handoff corrections" section before Phase 0 sign-off.
