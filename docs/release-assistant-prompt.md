# PROMPT — Sugartown Release Assistant
**Version:** v2 (2026-02-20)
**Supersedes:** v1 (original WP/Python pipeline era prompt, pasted into Claude Code conversation)

> **v1 → v2 changes:**
> - Version format corrected from `vYYYY.MM.DD` to SemVer `[X.Y.Z]` (Keep a Changelog convention, matching actual CHANGELOG.md)
> - `RELEASE_STATE.json` retired — see note in Step 3C
> - Keep a Changelog sub-sections (`Added`, `Changed`, `Fixed`, `Removed`) now required within each surface block
> - Empty surfaces explicitly forbidden in CHANGELOG output
> - Supplementary reference blocks (route tables, schema snapshots) explicitly permitted as additive-only
> - "Not in this release" section added to Release Notes format — required when partial implementations exist
> - "Validator state at release" section added to Release Notes format — required when validation scripts were run
> - Bug fix narration explicitly permitted in Release Notes (symptoms + resolution prose)
> - Commit message format updated to conventional commits (`docs:` prefix)
> - Version increment guidance (MAJOR/MINOR/PATCH) added

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

## STEP 0 — COLLECT SIGNALS

Use Claude Code to gather:

```bash
git diff --name-status <lastReleaseRef>..HEAD
git log --oneline <lastReleaseRef>..HEAD
```

Group changed files by surface:
- `apps/web`
- `apps/studio`
- `apps/storybook`
- `packages/design-system`
- other packages

Output:
- Raw factual bullet list per surface
- No interpretation
- No marketing language
- No inferred intent

---

## STEP 1 — SOURCE OF TRUTH (Messy Reality)

AI generates:

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
- Outcome-only bullets.
- If a change cannot be supported by file diff or explicit human confirmation, exclude it.
- Refactors allowed.
- Internal migrations allowed.
- Non-goals excluded.
- Bug fixes included with exact symptoms where known.

Human verifies and edits.
Approved artifact becomes: **🧾 Source of Truth — What Was Done**

---

## STEP 2 — NORMALIZE (Mechanical Reduction)

AI reduces Step 1 into:
- Deduplicated bullets
- Flat structure
- Outcome-only
- No interpretation
- No narrative framing

Human approves.
This artifact becomes the canonical change input.

---

## STEP 3 — CHANGELOG GENERATION

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

---

### STEP 3B — Generate Release Notes (Derived Narrative)

**Input:** The generated CHANGELOG entry only.

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

---

### STEP 3C — Output Artifacts

AI must output:

1. **CHANGELOG entry** (Markdown) — ready to prepend to `CHANGELOG.md`
2. **RELEASE_NOTES.md** (Markdown) — full file content
3. **Commit messages** — use conventional commits; suggest separate commits:
   - `docs: add CHANGELOG entry for vX.Y.Z`
   - `docs: add RELEASE_NOTES for vX.Y.Z`

> **Note — RELEASE_STATE.json (retired):**
> This artifact was carried over from the WP/Python pipeline era (`repos/sugartown-cms/.RELEASE_STATE.json`), where it functioned as a manually maintained accountability ledger — proof that the release had been consciously reviewed. It was never consumed programmatically by any script, CMS, or frontend. Its role in that era (tracking `gems_published`, `followup_items`, `verification` checklists) has no direct equivalent in the monorepo. The monorepo's equivalent accountability artifacts are `pnpm validate:urls` and `pnpm validate:filters` output, which are captured in the Release Notes "Validator state" section. Do not generate `RELEASE_STATE.json` unless automated release tooling is introduced that reads it.

---

## Enforcement Rules (Hard Fail Conditions)

Fail if:
- Release Notes include a change not present in CHANGELOG.
- CHANGELOG omits a normalized change from Step 2.
- Marketing language appears in CHANGELOG.
- Roadmap/future language appears anywhere (except "Not in this release" — which describes deferrals, not promises).
- Breaking changes exist but are not explicitly labeled.
- Empty surfaces are included in CHANGELOG (e.g. `### apps/storybook` with no bullets).
- Version format in CHANGELOG does not match the project's established versioning convention.

If failure, output:

```
FAILURE REPORT
Rule violated: [exact rule]
Missing evidence: [what should be there]
Return to step: [0 / 1 / 2 / 3A / 3B]
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
  - `PATCH`: bug fixes, internal refactors with no schema or API surface change
  - `MINOR`: new features, new schema fields, new page components, new validators
  - `MAJOR`: breaking schema changes, URL namespace changes, removed public APIs
- When uncertain, ask the human before generating.
