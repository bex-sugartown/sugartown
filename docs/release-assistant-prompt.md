# PROMPT — Sugartown Release Assistant
**Version:** v3 (2026-02-22)
**Supersedes:** v2 (2026-02-20)

> **v2 → v3 changes:**
> - Human checkpoint gates are now explicit STOP blocks — AI must pause and wait for approval before proceeding to the next step. "Human verifies and edits" was insufficient; AI was skipping gates.
> - Step 1 output format tightened: Source of Truth bullets must be grouped by surface with explicit ✅ STOP after output.
> - Step 2 now requires human to reply "Approved" (or edits) before AI touches any file.
> - Step 3A (CHANGELOG) now outputs proposed entry to chat only — AI must not write to CHANGELOG.md until human replies "Write it".
> - Step 3B (Release Notes) now outputs proposed content to chat only — AI must not write files until human replies "Write it".
> - Step 3C (file writes + commit) now requires explicit "Commit it" from human.
> - Steps are numbered sequentially; AI must announce which step it is on.
> - Missing artifacts checklist added at end of each release so the human can track what is still outstanding.

---

**Canonical hierarchy:**
Reality → Changelog → Release Notes

**Invariants:**
- Changelog is the canonical ledger.
- Release Notes are derived from the Changelog.
- Nothing flows backward.
- Nothing is inferred.
- Nothing is invented.

**Monorepo surfaces:**
- `apps/web`
- `apps/studio`
- `apps/storybook`
- `packages/design-system`
- `packages/*`

---

## HOW TO USE THIS PROMPT

Paste this entire prompt into Claude Code at the start of a release session.

The release process has **7 gates**. The AI stops at each gate and waits for your response before proceeding. Nothing is written to disk until you explicitly say so.

Expected human responses at each gate:
- Gate 1 (Step 1): Edit the bullets, or reply **"Approved"** to accept as-is.
- Gate 2 (Step 2): Edit the normalized list, or reply **"Approved"** to accept.
- Gate 3 (Step 3A): Edit the CHANGELOG entry, or reply **"Write it"** to write to disk.
- Gate 4 (Step 3B): Edit the Release Notes, or reply **"Write it"** to write to disk.
- Gate 5 (Step 3C): Review the commit plan, then reply **"Commit it"** to commit.
- Gate 6 (Step 4): Review the backlog reconciliation, or reply **"Write it"** to update the backlog file.
- Gate 7 (Step 4): Review the backlog commit plan, then reply **"Commit it"** to commit.

---

## STEP 0 — COLLECT SIGNALS

AI runs:

```bash
git diff --name-status <lastReleaseRef>..HEAD
git log --oneline <lastReleaseRef>..HEAD
```

If no git tag exists for the last release, use the last release commit hash from the CHANGELOG or git log.

AI groups changed files by surface:
- `apps/web`
- `apps/studio`
- `apps/storybook`
- `packages/design-system`
- other packages / root

Output:
- Raw factual file list per surface, with one-line description of what changed (from diff, not inference)
- No interpretation
- No marketing language
- No inferred intent

Step 0 has no gate — it is purely mechanical signal collection. AI proceeds directly to Step 1.

---

## STEP 1 — SOURCE OF TRUTH (Messy Reality)

AI generates one outcome-focused bullet per real change, grouped by surface.

```
apps/web:
• ...

apps/studio:
• ...

packages/design-system:
• ...

apps/storybook:
• ...
```

Rules:
- Outcome-only bullets. Not file-level diffs — actual behavioural outcomes.
- If a change cannot be supported by file diff or explicit human confirmation, exclude it.
- Refactors are included.
- Internal migrations are included.
- Non-goals excluded.
- Bug fixes included with exact symptoms where known.

### ✅ GATE 1 — STOP

AI outputs the Source of Truth bullets to chat, then prints:

```
━━━ GATE 1 — SOURCE OF TRUTH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Review the bullets above. This is the input to the CHANGELOG.
Edit any bullet, add missing items, or remove incorrect ones.
When satisfied: reply "Approved" to continue to Step 2.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not proceed to Step 2 until the human replies.**

---

## STEP 2 — NORMALIZE (Mechanical Reduction)

AI takes the human-approved Step 1 bullets and reduces them to:
- Deduplicated bullets
- Flat structure
- Outcome-only
- No interpretation
- No narrative framing

This is the canonical change input for Step 3.

### ✅ GATE 2 — STOP

AI outputs the normalized list to chat, then prints:

```
━━━ GATE 2 — NORMALIZED CHANGE LIST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Review the normalized list above. This is what goes into the CHANGELOG.
Edit if needed, or reply "Approved" to continue to Step 3A.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not proceed to Step 3A until the human replies.**

---

## STEP 3 — GENERATE ARTIFACTS

### Artifact Hierarchy Rule (LOCKED)

1. Generate CHANGELOG entry first.
2. Generate Release Notes ONLY from the CHANGELOG entry.
3. Release Notes may summarize or group.
4. Release Notes may NOT introduce new changes.
5. Release Notes may NOT imply roadmap intent.
6. Release Notes may NOT reinterpret refactors as features.

If violated → FAIL and output a rule violation report.

---

### STEP 3A — Generate CHANGELOG.md Entry (Canonical Ledger)

**Version format:** `[MAJOR.MINOR.PATCH]` using SemVer with date annotation.
Do not use date-only versions (`vYYYY.MM.DD`).

**If mini-release patches exist since the last MINOR:** The new MINOR entry must include an `aggregates` line in its descriptor (e.g. `aggregates 0.14.1–0.14.4`) so the CHANGELOG stays navigable. The MINOR entry's bullet lists summarize across patches — they do not duplicate every bullet already recorded in the patch stubs.

**Format:**

```markdown
## [X.Y.Z] — YYYY-MM-DD

Brief descriptor. Branch: `feature-branch` → `main` (if a merge release).

### apps/web

#### Added
- ...

#### Changed
- ...

#### Fixed
- ...

### apps/studio

#### Added
- ...

#### Changed
- ...

#### Fixed
- ...

### packages/design-system

#### Added
- ...

### apps/storybook

#### Added
- ...

### Sanity production data

- ...

### Other

- ...
```

**Rules:**
- Use Keep a Changelog section headers (`Added`, `Changed`, `Fixed`, `Removed`) within each surface.
- Omit surfaces with no changes — do not include empty `### apps/storybook` sections.
- Must include every normalized change from Step 2.
- Must include refactors.
- Must include migrations.
- Must include bug fixes with the specific behavior that was broken and what was changed.
- Must label breaking changes explicitly under `#### Breaking` or with a `**Breaking:**` prefix.
- No marketing tone.
- No summarization beyond grouping by surface and change type.
- Supplementary blocks (canonical route tables, taxonomy surface tables, schema registry snapshots) are allowed after the bullet lists if they aid legibility — they are additive, not substitutes for bullets.

This is the permanent historical record.

### ✅ GATE 3 — STOP

AI outputs the proposed CHANGELOG entry to chat only. **AI must not write to CHANGELOG.md yet.**

```
━━━ GATE 3 — CHANGELOG ENTRY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Review the proposed CHANGELOG entry above.
Edit if needed, or reply "Write it" to prepend it to CHANGELOG.md.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not write to CHANGELOG.md until the human replies "Write it".**

---

### STEP 3B — Generate Release Notes (Derived Narrative)

**Input:** The approved CHANGELOG entry only.

**Format:**

```markdown
# Release Notes — vX.Y.Z

**Date:** YYYY-MM-DD
**Branch:** `feature-branch` → `main`
**Scope:** Sugartown monorepo (surfaces touched)

---

## What this release is

[1–3 sentence framing of the release's overall scope and significance.]

---

## What changed

### [Heading per meaningful theme]

[Prose or bullets explaining user-facing impact. 1–4 paragraphs per section.]

---

## Not in this release

- [Deferred work that is related enough to be worth calling out explicitly.]
- [Placeholder routes / partial implementations.]
- [Surfaces with no changes.]

---

## Validator state at release

[Output of any relevant validation scripts, e.g. `pnpm validate:urls`, `pnpm validate:filters`.]
```

**Content rules:**
- 3–8 thematic sections OR equivalent prose.
- User-facing explanation — write for a developer who didn't write the code.
- May omit internal-only changes (pure refactors with no surface effect).
- May group related CHANGELOG entries into a single narrative section.
- Must not add anything not present in CHANGELOG.
- Must not expand beyond factual scope.
- Must not describe future plans (the "Not in this release" section lists deferrals — it does not promise them).
- Bug fixes may be narrated with symptoms and resolution, not just listed.
- The "Not in this release" section is required when there are partial implementations, placeholder routes, or deferred work that could cause confusion.
- The "Validator state at release" section is required when validation scripts exist and were run.

**Tone:**
- Clear.
- Contextual.
- Impact-oriented.
- Not promotional.

**Allowed transformation examples:**

| CHANGELOG | Release Notes |
|---|---|
| `Migrated string authors to person references` | `Author attribution is now standardized using reusable Person profiles.` |
| `Async slug-uniqueness validators removed from all schemas` | `Studio reference pills no longer ghost — async validators were blocking pill preview resolution across all content types.` |

**Forbidden transformation examples:**

| CHANGELOG | Forbidden Release Notes |
|---|---|
| `Renamed post schema to article` | `Introduced a powerful new publishing model for structured content.` ← adds interpretation |
| `buildFilterModel() derives facet options at query time` | `A dynamic real-time filter system is now available.` ← overstates scope |

### ✅ GATE 4 — STOP

AI outputs the proposed Release Notes to chat only. **AI must not write any files yet.**

```
━━━ GATE 4 — RELEASE NOTES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Review the proposed Release Notes above.
Edit if needed, or reply "Write it" to write the files.
AI will: archive existing RELEASE_NOTES.md → docs/release-notes/,
         then write new RELEASE_NOTES.md and docs/release-notes/RELEASE_NOTES_vX.Y.Z.md.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not write any files until the human replies "Write it".**

---

### STEP 3C — Output Artifacts

On "Write it" for Gate 4, AI writes to disk in this order:

1. Archive existing `RELEASE_NOTES.md` → `docs/release-notes/RELEASE_NOTES_vPREV.md` (if it exists and hasn't been archived yet)
2. Write `RELEASE_NOTES.md` (repo root) — current release only
3. Write `docs/release-notes/RELEASE_NOTES_vX.Y.Z.md` — permanent archive copy

**Release notes file convention:**
- `RELEASE_NOTES.md` (repo root) — always reflects the current/latest release. Replaced on each release.
- `docs/release-notes/RELEASE_NOTES_vX.Y.Z.md` — permanent per-version archive. Never modified after creation.
- Before writing a new `RELEASE_NOTES.md`, save the existing one to `docs/release-notes/` first.
- Filename format: `RELEASE_NOTES_vMAJOR.MINOR.PATCH.md` (e.g. `RELEASE_NOTES_v0.9.0.md`).

### ✅ GATE 5 — STOP

AI prints the proposed commit plan:

```
━━━ GATE 5 — COMMIT PLAN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files to commit:
  CHANGELOG.md
  RELEASE_NOTES.md
  docs/release-notes/RELEASE_NOTES_vX.Y.Z.md
  package.json (version bump if not already committed)
  apps/web/package.json (version bump if not already committed)

Proposed commit message:
  docs: release vX.Y.Z — [brief descriptor]

Reply "Commit it" to create the commit.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not commit until the human replies "Commit it".**

> **Note — RELEASE_STATE.json (retired):**
> This artifact was carried over from the WP/Python pipeline era. Its role has no direct equivalent in the monorepo. The monorepo's accountability artifacts are `pnpm validate:urls`, `pnpm validate:filters`, and `pnpm validate:taxonomy` output, captured in the Release Notes "Validator state" section. Do not generate `RELEASE_STATE.json`.

---

## STEP 4 — BACKLOG RECONCILIATION

After the release commit lands, reconcile the backlog priority stack (`docs/backlog/sugartown-backlog-priorities.html`) against reality.

### 4A — Ship completed items

Cross-reference the CHANGELOG entry against the backlog. For every backlog item that was delivered in this release:

1. Move it to the **Shipped** section at the bottom of the file.
2. Change its CSS class to `item--shipped`, rank to `✓` (`item__rank--check`), and priority badge to `priority--shipped`.
3. Update its summary with the release version and date (e.g. "Shipped v0.17.0, 2026-03-12").
4. Update the shipped tag: `<span class="tag tag--shipped">Shipped vX.Y.Z</span>`.

### 4B — Log new scope items

Review the release scope for work that surfaced during implementation but was **not** completed. Sources:

- "Not in this release" section of the Release Notes
- Tech debt, TODOs, or partial implementations noted in commit messages or epic close-out docs
- New epic prompts created in `docs/prompts/` that have no backlog entry yet
- Validator warnings or errors that represent actionable future work

For each new item, draft a backlog entry with: title, summary, tags, and a suggested priority tier (Now / Next / Soon / Later / Deferred).

### 4C — Re-prioritize the queue

With shipped items removed and new items added, re-sequence the remaining backlog:

1. Renumber active items (ranks 1, 2, 3…) — shipped items have no rank.
2. Update the **header meta** line (`page-header__meta`) with the current date, shipped epic range, and current focus.
3. Update the **blocker** block to reflect the new current focus and next priorities.
4. Update the **Shipped section heading** label to include the new version range (e.g. `v0.14.x–0.17.x`).
5. Update the **footer** date.

### ✅ GATE 6 — STOP

AI outputs the proposed backlog changes to chat as a summary:

```
━━━ GATE 6 — BACKLOG RECONCILIATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shipped (moved to bottom):
  - [item title] — was rank N, now shipped
  - ...

New items added:
  - [item title] — [priority tier] — [1-line reason]
  - ...

Priority restack:
  1. [new rank 1 title] — [tier]
  2. [new rank 2 title] — [tier]
  ...

Review above. Edit if needed, or reply "Write it" to update the backlog file.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not write to the backlog file until the human replies "Write it".**

On "Write it", AI updates `docs/backlog/sugartown-backlog-priorities.html` in place.

### ✅ GATE 7 — STOP

AI prints the proposed commit plan for the backlog update:

```
━━━ GATE 7 — BACKLOG COMMIT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files to commit:
  docs/backlog/sugartown-backlog-priorities.html

Proposed commit message:
  docs(backlog): reconcile priority stack after vX.Y.Z release

Reply "Commit it" to create the commit.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not commit until the human replies "Commit it".**

---

## RELEASE COMPLETION CHECKLIST

After all gates are confirmed, AI prints this checklist so the human can track what was produced:

```
━━━ RELEASE vX.Y.Z COMPLETE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Artifacts:
  ✅  CHANGELOG.md — [X.Y.Z] entry prepended
  ✅  RELEASE_NOTES.md — updated to vX.Y.Z
  ✅  docs/release-notes/RELEASE_NOTES_vX.Y.Z.md — archived
  ✅  Committed: [commit hash]

Version bumps confirmed:
  ✅  package.json → X.Y.Z
  ✅  apps/web/package.json → X.Y.Z

Validators run:
  [paste final validator output here or note "not run"]

Backlog reconciled:
  ✅  docs/backlog/sugartown-backlog-priorities.html — shipped items moved, new items added, priorities restacked
  ✅  Committed: [commit hash]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Enforcement Rules (Hard Fail Conditions)

Fail if:
- AI skips a gate without explicit human approval.
- Release Notes include a change not present in CHANGELOG.
- CHANGELOG omits a normalized change from Step 2.
- Marketing language appears in CHANGELOG.
- Roadmap/future language appears anywhere (except "Not in this release" — which describes deferrals, not promises).
- Breaking changes exist but are not explicitly labeled.
- Empty surfaces are included in CHANGELOG (e.g. `### apps/storybook` with no bullets).
- Version format in CHANGELOG does not match the project's established versioning convention.
- AI writes to disk before human approval at the relevant gate.

If failure, output:

```
FAILURE REPORT
Rule violated: [exact rule]
Missing evidence: [what should be there]
Return to step: [0 / 1 / 2 / 3A / 3B / 3C]
```

---

## Conceptual Model (Do Not Violate)

| | |
|---|---|
| **Changelog** | Database transaction log |
| **Release Notes** | Dashboard summary |
| **Changelog answers** | What changed? |
| **Release Notes answer** | Why should anyone care? |

The ledger is infrastructure.
The narrative is communication.
Ledger always precedes narrative.

---

## Version Conventions (Sugartown)

- Format: SemVer `MAJOR.MINOR.PATCH` in Keep a Changelog brackets: `## [X.Y.Z] — YYYY-MM-DD`
- Do NOT use date-only versions in the CHANGELOG header.
- The Release Notes file header and branch metadata use `vX.Y.Z` (with `v` prefix).
- Increment guidance:
  - `PATCH`: per-epic mini-releases (see below) — one epic, version bump only, no CHANGELOG entry
  - `MINOR`: full releases — aggregates one or more patch mini-releases into a single CHANGELOG entry with release notes
  - `MAJOR`: breaking schema changes, URL namespace changes, removed public APIs
- When uncertain, ask the human before generating.

### Mini-release cadence

Sugartown uses a two-tier release model:

| Tier | Command | Version bump | CHANGELOG | Release notes |
|------|---------|-------------|-----------|---------------|
| **Mini-release** | `/mini-release` | PATCH | None | None |
| **Full release** | `/release` | MINOR (or MAJOR) | Aggregated narrative entry | Yes |

Mini-releases only bump the version and clean up the backlog. The CHANGELOG is **only written during full releases**, which pull data from `git log` and `git diff` to construct the aggregated entry. This avoids redundant patch stubs that duplicate the MINOR entry.

**Full release Step 0 adjustment:** Use `git log` and `git diff` since the last MINOR release tag to collect all changes across patch mini-releases. Group by epic ID from commit messages.
