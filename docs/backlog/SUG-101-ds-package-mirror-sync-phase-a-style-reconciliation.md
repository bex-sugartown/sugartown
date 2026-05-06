**Linear Issue:** [SUG-101](https://linear.app/sugartown/issue/SUG-101/ds-package-mirror-sync-phase-a-style-reconciliation)

## EPIC NAME: DS Package Mirror Sync — Phase A Style Reconciliation

---

## Model & Mode

Pure infrastructure sync — no new components, no schema changes. Use `/model sonnet`. No planning depth required; this is mechanical file application with a token validator gate.

---

## Context

Two token/style files must stay in sync at all times per MEMORY.md §Token Drift Rules:
- **Canonical:** `apps/web/src/design-system/styles/tokens.css`
- **Mirror:** `packages/design-system/src/styles/tokens.css`

Claude Design performed an independent audit of the DS package (`packages/design-system/src/styles/`) against the web canonical and produced a Phase A diff report. The output was delivered as a zip containing 5 reconciled files at `/tmp/ds-sync/synced/packages/design-system/src/styles/`.

Phase A scope is **structural reconciliation only** — no canonical token values changed, no new components added, no deprecated token removal. This is mirror cleanup: removing legacy selectors, correcting one known wrong value, and adding a missing `utilities.css` file.

**Dependency chain:**
- SUG-101 (this epic) must land **before** SUG-86 (Style Dictionary). SUG-86 generates both files from a JSON source; if the mirror is dirty when SUG-86 runs, the first-run diff will be noisy and hard to validate. A clean mirror is a prerequisite for a clean Style Dictionary baseline.
- SUG-100 (CWV Snapshot Widget) will add `--st-cwv-*` and `--st-segmented-*` tokens to both files. That epic should follow SUG-101 to avoid re-dirtying the mirror.

**Prior related epics:** SUG-85 (token file sync audit), SUG-83 (retire legacy theme selectors).

---

## Objective

After this epic, `packages/design-system/src/styles/` is a verified, clean mirror of `apps/web/src/design-system/styles/`. The embedded `[data-theme="light"]` block in the mirror's `tokens.css` is removed (it was a vestige of when the mirror maintained its own theme logic — the canonical has superseded it). One known wrong value (`--st-status-draft-fg`) is corrected to match the canonical's intent (amber, not red). A `utilities.css` file is added to the DS package so Storybook can import it. `pnpm validate:tokens --check-sync` reports 0 drift errors. SUG-86 has a clean baseline to build from.

This epic does NOT change the web canonical files, does NOT change any component JSX or CSS, and does NOT modify the web app at all.

---

## Doc Type Coverage Audit

N/A — this epic touches no Sanity schema and no document types.

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | No | Infrastructure only — no schema or render changes |
| `article`   | No | Infrastructure only |
| `caseStudy` | No | Infrastructure only |
| `node`      | No | Infrastructure only |
| `archivePage` | No | Infrastructure only |

---

## Scope

- [x] **Phase 0** — N/A (infrastructure, no visual surface)
- [ ] Apply 5 reconciled style files from Claude Design sync output to `packages/design-system/src/styles/`
- [ ] Remove embedded `[data-theme="light"]` block from mirror `tokens.css` (Edit 4 in SYNC-DIFF.md)
- [ ] Correct `--st-status-draft-fg` from red (`var(--st-color-error)`) to amber-800 in light theme (approved value change)
- [ ] Add `utilities.css` to `packages/design-system/src/styles/` (new file — contains reset/utility rules)
- [ ] Update `apps/storybook/.storybook/preview.ts` to import `@sugartown/design-system/styles/utilities.css`
- [ ] Run `pnpm validate:tokens` — zero errors
- [ ] Run `pnpm validate:tokens --strict-colors` — zero violations
- [ ] Run `pnpm validate:tokens --check-sync` — zero drift errors
- [ ] Confirm Storybook renders without console errors after `utilities.css` import

---

## Phase A File Manifest

Five files from Claude Design's sync output (`/tmp/ds-sync/synced/packages/design-system/src/styles/`):

| File | Change type | Key change |
|------|------------|-----------|
| `tokens.css` | Edit | Remove embedded `[data-theme="light"]` block (lines 962–981); correct `--st-status-draft-fg` |
| `theme.light.css` | Edit | Align with canonical light theme overrides |
| `theme.pink-moon.css` | Edit | Align with canonical pink moon theme |
| `theme.dark.css` | Edit | Align with canonical dark theme |
| `utilities.css` | **Create** | New file — missing from DS package; required for Storybook import |

One additional action item from SYNC-DIFF.md:
- `apps/storybook/.storybook/preview.ts` — add `import '@sugartown/design-system/styles/utilities.css'` after existing style imports

---

## Non-Goals

- No changes to `apps/web/src/design-system/styles/` (the canonical) — this epic only touches the mirror
- No deprecated token removal — that is Phase C, gated on SUG-86 (Style Dictionary). Removing deprecated aliases before SUG-86 risks breaking Storybook stories that reference them
- No component JS/JSX changes
- No Sanity schema changes
- No GROQ or query changes
- Phase B (component parity decisions — grid, section-container, section-label, tile ports, ContentNav stories, FilterBar promotion) is a separate follow-on epic

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; Storybook in `apps/storybook/`
- DS package: `packages/design-system/`
- Token validator: `apps/web/scripts/validate-tokens.js`
- Run validators from `apps/web/` directory

**Sync rules (non-negotiable)**
- The mirror's header comment (line 6: "Source of truth: apps/web/src/design-system/styles/tokens.css — This file mirrors the canonical token set so Storybook renders identically to the web app.") must be preserved
- No token name or value may be added to the mirror that doesn't exist in the canonical
- Theme files in the DS package are override-only — they may only override `--st-*` names that exist in the canonical `tokens.css`

**Active themes only**
Per confirmed audit (index.html + preview.ts): only `light-pink-moon` and `dark-pink-moon` are active. `:root` dark defaults and `[data-theme="dark"]` are legacy/unreachable in production. The Phase A sync must not reintroduce unreachable selectors.

**Approved value change**
`--st-status-draft-fg` in the light theme block:
- Current (wrong): `var(--st-color-error)` (resolves to red `#ff4757`)
- Approved: `var(--st-color-amber-800)` (or equivalent amber from the token scale)
- Reason: draft status should signal "pending review" (amber), not "error" (red). The canonical `tokens.css` didn't have this wrong — the mirror introduced it independently.

---

## Files to Modify

**DS Package (mirror)**
- `packages/design-system/src/styles/tokens.css` — EDIT (remove `[data-theme="light"]` block, correct `--st-status-draft-fg`)
- `packages/design-system/src/styles/theme.light.css` — EDIT (align with canonical)
- `packages/design-system/src/styles/theme.pink-moon.css` — EDIT (align with canonical)
- `packages/design-system/src/styles/theme.dark.css` — EDIT (align with canonical)
- `packages/design-system/src/styles/utilities.css` — **CREATE**

**Storybook**
- `apps/storybook/.storybook/preview.ts` — EDIT (add `utilities.css` import)

**No changes to:**
- `apps/web/src/design-system/styles/` (canonical — read-only for this epic)
- Any component JSX, CSS modules, or page files
- Any Sanity schema files

---

## Deliverables

1. **5 reconciled style files** applied to `packages/design-system/src/styles/`
2. **`utilities.css`** exists at `packages/design-system/src/styles/utilities.css`
3. **`preview.ts`** imports `utilities.css`
4. **`pnpm validate:tokens`** from `apps/web/` reports 0 errors
5. **`pnpm validate:tokens --strict-colors`** reports 0 violations
6. **`pnpm validate:tokens --check-sync`** reports 0 drift errors
7. **Storybook** starts and renders stories without console errors related to missing styles

---

## Acceptance Criteria

- [ ] `packages/design-system/src/styles/tokens.css` no longer contains an embedded `[data-theme="light"]` block
- [ ] `--st-status-draft-fg` in the light theme resolves to amber (not red/error)
- [ ] `packages/design-system/src/styles/utilities.css` exists and is non-empty
- [ ] `apps/storybook/.storybook/preview.ts` imports `@sugartown/design-system/styles/utilities.css`
- [ ] `pnpm validate:tokens` from `apps/web/` — 0 errors
- [ ] `pnpm validate:tokens --strict-colors` from `apps/web/` — 0 violations
- [ ] `pnpm validate:tokens --check-sync` from `apps/web/` — 0 drift errors (if flag exists; if not, manual diff confirms sync)
- [ ] Storybook builds and renders without style-related console errors
- [ ] No changes to `apps/web/src/design-system/styles/` (canonical untouched — verified via `git diff`)

---

## Risks / Edge Cases

- **`--check-sync` flag availability** — `validate-tokens.js` may not have this flag yet (added in SUG-85 scope). If not present, manual diff of `:root` blocks across both files is the acceptance gate.
- **`utilities.css` import path** — verify the DS package `package.json` exports map includes `./styles/utilities.css` or adjust the Storybook import path to use the relative path.
- **`[data-theme="light"]` removal** — removing this block removes light-theme overrides that were only in the mirror (not in canonical). Storybook stories should still render correctly because they use `light-pink-moon` theme, not `light`. Verify no story relies on bare `[data-theme="light"]` selector.
- **`-webkit-font-smoothing`** — SYNC-DIFF.md flagged that removing this from the Storybook body (a side effect of `utilities.css` changes) may produce subtle font rendering differences in Chromatic. Not a blocker; note it in the commit message.

---

## Post-Epic Close-Out

1. Move: `docs/backlog/SUG-101-ds-package-mirror-sync-phase-a-style-reconciliation.md` → `docs/shipped/`
2. `git status` clean
3. `/mini-release SUG-101 DS package mirror sync Phase A`
4. Update Linear SUG-101 → **Done**
5. Proceed to next priority (SUG-100 implementation or SUG-98)
