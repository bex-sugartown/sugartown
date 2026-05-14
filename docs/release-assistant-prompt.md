# PROMPT — Sugartown Release Assistant
**Version:** v4 (2026-05-14)
**Supersedes:** v3 (2026-02-22)

> **v3 → v4 changes:**
> - Clarified two-tier release model: `/release` always produces a MINOR bump (X.(Y+1).0). Patch numbers are owned by mini-releases only. Full releases never target a patch version.
> - Step 0: [Unreleased] section of CHANGELOG.md is now the primary signal source — it accumulates changes from mini-releases. Git log is the verification layer.
> - Step 3A: Removed the obsolete "aggregates" patch-stub note. Patch stubs are not written. [Unreleased] is the accumulation; the MINOR entry replaces it.
> - Step 3C: Clarified that the version bump in a full release is always to `X.(Y+1).0`, never to an arbitrary patch.
> - Backlog file references updated: `.html` → `.md` throughout.

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

**Primary source:** Read the `[Unreleased]` section of `CHANGELOG.md`. This section accumulates all changes from mini-releases since the last MINOR release. It is the AI-curated input for the next full release.

**Verification source:** Run git log and diff to confirm the [Unreleased] entries are complete and nothing was missed:

```bash
git log --oneline <lastMinorReleaseCommit>..HEAD
git diff --name-status <lastMinorReleaseCommit>..HEAD
```

To find the last MINOR release commit, look for the most recent `chore(release): mini-release` commit following the last `docs: release vX.Y.0` commit in `git log --oneline`.

AI groups changed files by surface:
- `apps/web`
- `apps/studio`
- `apps/storybook`
- `packages/design-system`
- other packages / root

Output:
- The [Unreleased] section content as the primary signal
- Any changes found in git log that are missing from [Unreleased] (gaps to flag)
- No interpretation
- No marketing language
- No inferred intent

Step 0 has no gate — it is purely mechanical signal collection. AI proceeds directly to Step 1.

---

## STEP 1 — SOURCE OF TRUTH (Messy Reality)

AI generates one outcome-focused bullet per real change, grouped by surface. Source is the [Unreleased] section, verified against git log.

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
- If a change cannot be supported by [Unreleased] content or git diff, exclude it.
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

**Version format:** Full releases are always MINOR bumps: `[X.(Y+1).0]` with date annotation.

- Current version: read from `package.json`. It will be at some patch level (e.g. `0.23.27`).
- Next full release version: increment MINOR, reset PATCH to 0 (e.g. `0.24.0`).
- Do NOT use the current patch version for the full release entry. Do NOT use date-only versions.

The new MINOR entry replaces the `[Unreleased]` section — it is the same content, now versioned and dated.

**Format:**

```markdown
## [X.(Y+1).0] — YYYY-MM-DD

Brief descriptor. Aggregates vX.Y.1–vX.Y.Z (the patch mini-releases since the last MINOR).

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
Edit if needed, or reply "Write it" to:
  - Replace [Unreleased] with the new [X.(Y+1).0] entry in CHANGELOG.md
  - Reset [Unreleased] to an empty accumulation block
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not write to CHANGELOG.md until the human replies "Write it".**

---

### STEP 3B — Generate Release Notes (Derived Narrative)

**Input:** The approved CHANGELOG entry only.

**Format:**

```markdown
# Release Notes — vX.(Y+1).0

**Date:** YYYY-MM-DD
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

[Output of any relevant validation scripts, e.g. `pnpm validate:tokens`, `pnpm lint`.]
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
AI will: archive existing RELEASE_NOTES.md → docs/release-notes/RELEASE_NOTES_vX.Y.Z.md,
         then write new RELEASE_NOTES.md (vX.(Y+1).0) and docs/release-notes/RELEASE_NOTES_vX.(Y+1).0.md.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not write any files until the human replies "Write it".**

---

### STEP 3C — Output Artifacts and Version Bump

On "Write it" for Gate 4, AI writes to disk in this order:

1. Archive existing `RELEASE_NOTES.md` → `docs/release-notes/RELEASE_NOTES_vPREV.md` (if not already archived)
2. Write `RELEASE_NOTES.md` (repo root) — current release only
3. Write `docs/release-notes/RELEASE_NOTES_vX.(Y+1).0.md` — permanent archive copy
4. Bump version in `package.json` (root) from `X.Y.Z` → `X.(Y+1).0`
5. Bump version in `apps/web/package.json` to `X.(Y+1).0`

**Release notes file convention:**
- `RELEASE_NOTES.md` (repo root) — always reflects the current MINOR release. Replaced on each full release.
- `docs/release-notes/RELEASE_NOTES_vX.Y.0.md` — permanent per-MINOR-version archive. Never modified after creation.
- Filename format: `RELEASE_NOTES_vMAJOR.MINOR.0.md` (e.g. `RELEASE_NOTES_v0.24.0.md`).

### ✅ GATE 5 — STOP

AI prints the proposed commit plan:

```
━━━ GATE 5 — COMMIT PLAN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files to commit:
  CHANGELOG.md          ([Unreleased] → [X.(Y+1).0], empty [Unreleased] restored)
  RELEASE_NOTES.md      (updated to vX.(Y+1).0)
  docs/release-notes/RELEASE_NOTES_vX.(Y+1).0.md
  package.json          (X.Y.Z → X.(Y+1).0)
  apps/web/package.json (X.Y.Z → X.(Y+1).0)

Proposed commit message:
  docs: release vX.(Y+1).0 — [brief descriptor]

Reply "Commit it" to create the commit.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not commit until the human replies "Commit it".**

> **Note — RELEASE_STATE.json (retired):**
> This artifact was carried over from the WP/Python pipeline era. Its role has no direct equivalent in the monorepo. The monorepo's accountability artifacts are `pnpm validate:tokens`, `pnpm lint`, and validator output, captured in the Release Notes "Validator state" section. Do not generate `RELEASE_STATE.json`.

---

## STEP 4 — BACKLOG RECONCILIATION

After the release commit lands, reconcile the backlog priority stack (`docs/backlog/sugartown-backlog-priorities.md`) against reality.

### 4A — Ship completed items

Cross-reference the CHANGELOG entry against the backlog. For every backlog item that was delivered in this release:

1. Move it to the **Shipped** section at the bottom of the file.
2. Update its entry with the release version and date (e.g. "Shipped v0.24.0, 2026-05-14").
3. Mark with `✅ Shipped` tag.

### 4B — Log new scope items

Review the release scope for work that surfaced during implementation but was **not** completed. Sources:

- "Not in this release" section of the Release Notes
- Tech debt, TODOs, or partial implementations noted in commit messages or epic close-out docs
- New epic prompts created in `docs/shipped/` that have no backlog entry yet
- Validator warnings or errors that represent actionable future work

For each new item, draft a backlog entry with: title, summary, tags, and a suggested priority tier (Now / Next / Soon / Later / Deferred).

### 4C — Re-prioritize the queue

With shipped items moved and new items added, re-sequence the remaining backlog:

1. Renumber active items sequentially — shipped items have no rank.
2. Update the `> Updated` header line with current date, version, and shipped epic range.
3. Update the `⚑ Current focus` block to reflect what shipped and what's next.
4. Update footer date.

### ✅ GATE 6 — STOP

AI outputs the proposed backlog changes to chat as a summary:

```
━━━ GATE 6 — BACKLOG RECONCILIATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shipped (moved to bottom):
  - [item title] — was rank N, now shipped vX.(Y+1).0
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

On "Write it", AI updates `docs/backlog/sugartown-backlog-priorities.md` in place.

### ✅ GATE 7 — STOP

AI prints the proposed commit plan for the backlog update:

```
━━━ GATE 7 — BACKLOG COMMIT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files to commit:
  docs/backlog/sugartown-backlog-priorities.md

Proposed commit message:
  docs(backlog): reconcile priority stack after vX.(Y+1).0 release

Reply "Commit it" to create the commit.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AI must not commit until the human replies "Commit it".**

---

## RELEASE COMPLETION CHECKLIST

After all gates are confirmed, AI prints this checklist so the human can track what was produced:

```
━━━ RELEASE vX.(Y+1).0 COMPLETE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Artifacts:
  ✅  CHANGELOG.md — [X.(Y+1).0] entry written, [Unreleased] reset
  ✅  RELEASE_NOTES.md — updated to vX.(Y+1).0
  ✅  docs/release-notes/RELEASE_NOTES_vX.(Y+1).0.md — archived
  ✅  Committed: [commit hash]

Version bumps confirmed:
  ✅  package.json → X.(Y+1).0
  ✅  apps/web/package.json → X.(Y+1).0

Validators run:
  [paste final validator output here or note "not run"]

Backlog reconciled:
  ✅  docs/backlog/sugartown-backlog-priorities.md — shipped items moved, new items added, priorities restacked
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
- The full release version is a patch number (e.g. `[0.23.27]`) — full releases must always be MINOR (`[0.24.0]`).
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
- The Release Notes file header uses `vX.Y.Z` (with `v` prefix).
- Increment guidance:
  - `PATCH`: per-epic mini-releases only — one epic, version bump + backlog cleanup, no CHANGELOG entry, no release notes
  - `MINOR`: full releases — always `X.(Y+1).0`, aggregates all [Unreleased] changes into a single CHANGELOG entry with release notes
  - `MAJOR`: breaking schema changes, URL namespace changes, removed public APIs
- When uncertain, ask the human before generating.

### Two-tier release model

| Tier | Command | Version bump | CHANGELOG | Release notes |
|------|---------|-------------|-----------|---------------|
| **Mini-release** | `/mini-release` | PATCH (X.Y.Z+1) | None — changes accumulate in `[Unreleased]` | None |
| **Full release** | `/release` | MINOR (X.(Y+1).0) | Promotes `[Unreleased]` → `[X.(Y+1).0]`, resets `[Unreleased]` | Yes — derived from CHANGELOG |

**[Unreleased] is the accumulation buffer.** Mini-releases do not touch CHANGELOG.md. The `[Unreleased]` section is maintained by the AI as changes ship (via epic close-out and backlog cleanup steps). When `/release` runs, it reads [Unreleased] as its primary signal, promotes the content to a MINOR entry, and resets [Unreleased] to an empty block.
