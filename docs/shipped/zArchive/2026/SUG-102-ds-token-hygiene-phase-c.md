**Linear Issue:** [SUG-102](https://linear.app/sugartown/issue/SUG-102/ds-token-hygiene-phase-c-off-scale-color-promotion-legacy-alias-audit)

## EPIC NAME: DS Token Hygiene — Phase C: Off-Scale Color Promotion + Legacy Alias Audit

---

## Model & Mode

Audit-heavy infrastructure. Use `/model sonnet` — execution is mechanical grep work followed by a human-gated proposal. No planning depth needed; the audit phase is the planning.

---

## Context

Phase C of the DS package sync sequence. SUG-101 (Phase A) cleaned the mirror structurally. SUG-100 will add new `--st-cwv-*` and `--st-segmented-*` tokens. SUG-86 (Style Dictionary) will replace the hand-authored dual token files with a build pipeline.

**This epic must not execute before SUG-86 is complete.** Removing or renaming tokens manually would require dual-file edits, and then SUG-86's first run would need to absorb those changes, producing a noisy baseline. The correct execution path: SUG-86 builds the pipeline first, then Phase C removals are made in the Style Dictionary JSON source and both files regenerate cleanly.

**This epic produces an audit report and a proposal first. No token is renamed, promoted, or removed until Bex gives explicit sign-off** — the "governance-touching" flag in the original Phase C spec is operationalized here as a blocking human gate between audit and execution.

**Dependency chain:** SUG-101 ✅ → SUG-100 → SUG-98 → SUG-86 → **SUG-102 (this epic)**

**Prior related epics:** SUG-68 (eliminate hardcoded color values), SUG-85 (token file sync audit), SUG-101 (Phase A mirror sync).

---

## Objective

After this epic, every color value in `tokens.css` either:
1. Is a named Tier-1 primitive (`--st-color-*`) with a semantic rationale, or
2. Is documented as a locked Tier-3 leaf with an explicit "no promotion" comment

And every legacy alias token (`--st-color-grey-*`, `--st-color-void-900`, `--st-pink`, etc.) is either:
1. Removed (zero active references confirmed), via the Style Dictionary pipeline, or
2. Retained with a documented reason (e.g. "still referenced in X component — schedule removal in SUG-NNN")

This makes the token graph auditable, removes the ambiguity that caused SUG-68 (386 hardcoded values), and gives SUG-86's Style Dictionary a clean JSON source to work from.

---

## Doc Type Coverage Audit

N/A — no Sanity schema changes.

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | No | Infrastructure only |
| `article`   | No | Infrastructure only |
| `caseStudy` | No | Infrastructure only |
| `node`      | No | Infrastructure only |
| `archivePage` | No | Infrastructure only |

---

## Scope

### Item 9 — Off-scale color promotion audit

- [ ] Grep `tokens.css` (canonical) for all raw hex, rgba, and hsla values that appear in semantic or component tokens (i.e. not in the `:root` Tier-1 primitive block)
- [ ] For each: identify the color, its current usage context, and whether a named Tier-1 primitive already covers it
- [ ] Produce a proposal table (see Gate format below)
- [ ] **GATE: human sign-off required before any change is written**
- [ ] On approval: add missing Tier-1 primitives to `tokens.css` + update both files in same commit via Style Dictionary (if SUG-86 is complete) or dual-file edit (if Style Dictionary is not yet live — document which path was taken)

Known candidates surfaced during Phase A sync (not exhaustive — full audit required):
- `amber-mid #f0b429` — appears in status chip tokens; no named primitive
- `red-400 #f87171` — appears in error/danger tokens; may overlap with `--st-color-error`
- Others TBD from grep

### Item 10 — Legacy alias removal eligibility audit

- [ ] Grep all legacy alias tokens for active references across: `tokens.css` (both files), all `*.module.css` in `apps/web/src/`, `apps/storybook/.storybook/`, `packages/design-system/src/`
- [ ] Known alias candidates: `--st-color-grey-*`, `--st-color-void-900`, `--st-pink`, `--st-font-sans`, `--st-font-mono`, `--st-color-brand` (check if still referenced anywhere)
- [ ] Produce a removal eligibility table (see Gate format below)
- [ ] **GATE: human sign-off required before any alias is removed**
- [ ] On approval: removals execute via Style Dictionary source JSON, not manual dual-file edit

---

## Human Gate Format

Before writing any change, produce this table for sign-off:

**Item 9 — Promotion proposals:**

| Token | Current value | Proposed Tier-1 primitive | Action | Keep/Change/Remove |
|-------|--------------|--------------------------|--------|-------------------|
| e.g. `--st-status-warn-bg` | `#f0b429` | `--st-color-amber-mid` | Add primitive, update reference | Pending |

**Item 10 — Alias removal proposals:**

| Alias token | References found | Removal safe? | Action | Keep/Remove |
|-------------|-----------------|---------------|--------|------------|
| e.g. `--st-pink` | 0 | Yes | Remove from both files | Pending |

Wait for explicit approval ("yes", "approved", equivalent) before writing. A follow-up question is not approval.

---

## Non-Goals

- No component JSX or CSS changes
- No Sanity schema changes
- No new token names for SUG-100 CWV tokens — those are scoped to SUG-100
- Phase B component parity decisions — those are scoped to SUG-98
- Storybook story changes unless a story directly references a removed alias

---

## Technical Constraints

**Execution gate — Style Dictionary**
Ideally all changes in this epic are made to the Style Dictionary JSON source (SUG-86) and both CSS files regenerate. If SUG-86 is not yet complete when this epic executes, fall back to dual-file manual edits per the standard token drift rules, and add a note to the commit message: "Manual dual-file edit — Style Dictionary not yet live."

**Validator gates**
- `pnpm validate:tokens` from `apps/web/` — 0 errors
- `pnpm validate:tokens --strict-colors` — 0 violations
Both must pass before commit.

**Fallback syntax rule**
`var(--st-token, #hex)` is banned. If promoting a color removes the only place a raw hex appeared, confirm the token reference chain is complete before committing.

---

## Files to Modify

Depends on audit findings. Expected:
- `apps/web/src/design-system/styles/tokens.css` — add Tier-1 primitives, update references, remove aliases
- `packages/design-system/src/styles/tokens.css` — same changes (dual-file sync, or Style Dictionary regeneration)
- Potentially: component CSS files that reference a removed alias (update to canonical token)

---

## Deliverables

1. **Audit report** — proposal tables for Item 9 and Item 10, with human sign-off
2. **Tier-1 primitives** added for every previously anonymous hex that warranted promotion
3. **Locked Tier-3 leaves** documented with inline comments for values that stay anonymous intentionally
4. **Legacy alias removals** committed (or documented as retained with reason)
5. `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` — 0 errors/violations

---

## Acceptance Criteria

- [ ] No raw hex value exists in a semantic or component token in `tokens.css` without either a named Tier-1 primitive backing it or an explicit "locked Tier-3 leaf" comment
- [ ] All legacy alias tokens have a status: removed (with confirmed zero references) or retained (with documented reason)
- [ ] `pnpm validate:tokens` — 0 errors
- [ ] `pnpm validate:tokens --strict-colors` — 0 violations
- [ ] Human explicitly approved the proposal table before any change was written
- [ ] Both token files updated in the same commit (no drift)

---

## Risks / Edge Cases

- **SUG-86 not complete at execution time** — fall back to dual-file manual edit, document in commit. Not ideal but not blocking.
- **Alias still referenced in a component** — do not remove; add to "retained" table with component reference. Schedule removal as a follow-on when the component is updated.
- **Chromatic diffs** — promoting an off-scale color to a named primitive with a different hex value (even slightly) will produce Chromatic diffs. Treat these as expected and document them in the commit message.

---

## Post-Epic Close-Out

1. Move: `docs/backlog/SUG-102-ds-token-hygiene-phase-c.md` → `docs/shipped/`
2. `git status` clean
3. `/mini-release SUG-102 DS token hygiene Phase C`
4. Update Linear SUG-102 → **Done**
