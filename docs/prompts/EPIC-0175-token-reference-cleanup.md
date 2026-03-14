# EPIC TEMPLATE
# Sugartown — Claude Code Epic Prompt

---

## Epic Lifecycle

**Status:** IN PROGRESS

**Epic ID:** EPIC-0175
## EPIC NAME: Token Reference Cleanup — 52 Unknown `var(--st-*)` Refs

**Backlog ref:** Token reference cleanup — 52 unknown `var(--st-*)` refs across 19 CSS files
**Dependency:** None blocking. All issues are pre-existing legacy debt; none were introduced by recent epics.

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — No new interactive elements. This epic fixes broken CSS custom property references — all changes are CSS-only, replacing undefined `var(--st-*)` names with canonical equivalents from `tokens.css`. No components created or modified at the JSX level.
- [x] **Use case coverage** — N/A. No new component or utility created.
- [x] **Layout contract** — N/A. No new layout surface. Existing layouts will render correctly once broken tokens are resolved (currently falling back to UA defaults like Times New Roman).
- [x] **All prop value enumerations** — N/A. No schema enum fields involved.
- [x] **Correct audit file paths** — All 19 files verified via Read tool and validator output.
- [x] **Dark / theme modifier treatment** — Token replacements must respect the existing theme architecture. All replacements use tokens from `tokens.css` which already participate in `[data-theme]` overrides where applicable. No new theme-sensitive tokens are introduced. One new token (`--st-color-surface-subtle`) must be defined with per-theme values — see Themed Colour Variant Audit below.
- [x] **Studio schema changes scoped** — No schema changes. CSS-only epic.
- [x] **Web adapter sync scoped** — DS package CSS files have matching issues (Media, Callout, CodeBlock, Table) — these are component-scoped API tokens that are intentionally local and will be excluded from the validator rather than registered in `tokens.css`. See Phase C below.

---

## Context

**Current state:**
- Token validator (`pnpm validate:tokens`) reports **52 unknown token references** across **19 CSS files**
- The validator loads 312 tokens from each of the two canonical token files (`apps/web/src/design-system/styles/tokens.css` and `packages/design-system/src/styles/tokens.css`) and flags any `var(--st-*)` reference that doesn't match a defined token
- All 52 errors are pre-existing — none were introduced by v0.17.0 or any recent epic
- The browser silently falls back to UA defaults for undefined custom properties (e.g. Times New Roman for `font-family`, `0` for spacing, `transparent` for color)
- Three distinct root causes exist, requiring different fix strategies (see Scope below)

**Root cause analysis — 6 patterns identified:**

| Pattern | Count | Examples | Fix strategy |
|---------|-------|---------|-------------|
| **A. Legacy flat tokens** (App.css) | 14 refs / 9 unique | `--st-red`, `--st-space-md`, `--st-text-xl`, `--st-gray-medium` | Replace with canonical `--st-color-*` / `--st-spacing-*` / `--st-font-size-*` names |
| **B. Missing utility tokens** | 5 refs / 3 unique | `--st-transition-fast`, `--st-spacing-stack-2xl`, `--st-font-small` | Register new tokens in `tokens.css` or replace with literal values |
| **C. Component-scoped API tokens** (false positives) | 12 refs / 10 unique | `--st-media-overlay-*`, `--st-callout-icon-color`, `--st-code-font-size`, `--st-table-*` | Update validator to allow component-local `--st-*` definitions (these are intentional CSS API surfaces with fallback values) |
| **D. Token in wrong file** (`--st-page-gutter`) | 3 refs / 1 unique | `--st-page-gutter` (defined in `globals.css` not `tokens.css`) | Move to `tokens.css` or teach validator about `globals.css` |
| **E. Missing semantic token** | 2 refs / 1 unique | `--st-color-surface-subtle` | Register in both `tokens.css` files with per-theme values |
| **F. Orphaned parallel token file** | 3 refs / 3 unique | `--st-radius-4`, `--st-text-1`, `--st-text-2` (in `src/styles/design-tokens.css`) | Internal to the legacy file — resolve by deleting the file if no consumers remain, or by consolidating into canonical `tokens.css` |

**Bonus pattern — legacy aliases (not errors but tech debt):**
- `--st-pink` (8 refs), `--st-gray-light` (1 ref), `--st-font-mono` (9 refs) — these work via back-compat aliases in `tokens.css` but should migrate to canonical names (`--st-color-brand-primary`, `--st-color-neutral-100`, `--st-font-family-mono`)

**Recent relevant epics:**
- EPIC-0156 (Card Component) — established component token architecture
- EPIC-0169 (Citations) — added `--st-citation-*` component tokens correctly

**Files already in play:**
- `apps/web/src/design-system/styles/tokens.css` — web canonical token file (312 tokens)
- `packages/design-system/src/styles/tokens.css` — DS package token file (312 tokens, must stay in sync)
- `apps/web/src/design-system/styles/globals.css` — defines `--st-page-gutter` outside token files
- `apps/web/src/styles/design-tokens.css` — orphaned legacy token file (predates canonical system)
- `apps/web/scripts/validate-tokens.js` — token reference validator

---

## Objective

After this epic, `pnpm validate:tokens` reports **zero errors**. Every `var(--st-*)` reference in the codebase either:
1. Resolves to a token defined in the canonical `tokens.css` files, OR
2. Is a component-scoped API token that the validator explicitly allows (because it has a fallback value and is meant to be overridden by consumers, not globally defined)

**Data layer:** No schema changes.
**Query layer:** No GROQ changes.
**Render layer:** No JSX changes. CSS-only fixes — replacing undefined token names with canonical equivalents, registering missing tokens, and updating the validator to handle component-scoped API tokens.

Bonus: legacy alias references (`--st-pink`, `--st-font-mono`, `--st-gray-light`) are migrated to canonical names, reducing future confusion about which name is "correct."

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | No | CSS-only epic — no doc type rendering affected at the schema/query level |
| `article` | No | Same |
| `caseStudy` | No | Same |
| `node` | No | Same |
| `archivePage` | No | Same |

---

## Scope

### Phase A — Fix broken references in app-level CSS (14 errors → 0)

Replace all undefined legacy token names in `App.css` with canonical equivalents:

| Broken reference | Canonical replacement | Notes |
|-----------------|----------------------|-------|
| `--st-text-xl` | `--st-font-size-xl` | `1.4rem` (22px) |
| `--st-text-lg` | `--st-font-size-lg` | `1.125rem` (18px) |
| `--st-text-sm` | `--st-font-size-sm` | `0.875rem` (14px) |
| `--st-space-3xl` | `--st-space-8` | `40px` — largest in scale, closest to 3xl intent |
| `--st-space-2xl` | `--st-space-7` | `32px` |
| `--st-space-md` | `--st-spacing-stack-md` | `16px` (maps to `--st-space-4`) |
| `--st-space-xs` | `--st-spacing-stack-xs` | `4px` (maps to `--st-space-1`) |
| `--st-gray-medium` | `--st-color-softgrey` | `#94A3B8` — muted body text colour |
| `--st-red` | `--st-color-danger` | Maps to `--st-color-maroon` — semantic error colour |

Also in this phase — fix broken references in other component CSS files:
| File | Broken reference | Canonical replacement |
|------|-----------------|----------------------|
| `SocialLink.module.css:24` | `--st-text-lg` | `--st-font-size-lg` |
| `HomepageHero.module.css:7` | `--st-spacing-stack-2xl` | `--st-space-8` (40px — largest stack value) |
| `PageSections.module.css:277` | `--st-font-small` | `--st-font-caption` (maps to `--st-font-size-xs`) |

### Phase B — Register missing utility tokens (5 errors → 0)

Add to both `tokens.css` files:

| Token to register | Value | Rationale |
|-------------------|-------|-----------|
| `--st-transition-fast` | `150ms ease` | Used by Link, Logo, SocialLink atoms for hover transitions. Standard UI micro-interaction timing. |
| `--st-color-surface-subtle` | See Themed Colour Variant Audit below | Used by PersonProfilePage and TaxonomyArchivePage for subtle background surfaces. |

For `--st-spacing-stack-2xl`: rather than registering a new stack tier, replace the single reference in `HomepageHero.module.css` with `--st-space-8` directly (handled in Phase A). The spacing scale intentionally caps at `xl`.

### Phase C — Handle component-scoped API tokens (12 false positives → 0)

The following tokens are **intentionally undefined** in `tokens.css` — they are CSS custom property API surfaces that components define locally with fallback values, allowing consumers to override them:

| Component | API tokens | Fallback pattern |
|-----------|-----------|-----------------|
| Media | `--st-media-duotone-shadow`, `--st-media-overlay-gradient`, `--st-media-overlay-color`, `--st-media-overlay-opacity`, `--st-media-overlay-blend` | `var(--st-media-overlay-color, rgba(0,0,0,0.5))` |
| Callout | `--st-callout-icon-color` | `var(--st-callout-icon-color, var(--st-color-brand-primary))` |
| CodeBlock | `--st-code-font-size` | `var(--st-code-font-size, 0.9em)` |
| Table | `--st-table-max-width`, `--st-table-min-width` | `var(--st-table-max-width, 100%)` |

**Fix:** Update `validate-tokens.js` to support an allowlist of component-scoped tokens that are expected to be undefined at the global level. These tokens must have fallback values in their CSS usage — the validator should verify this.

### Phase D — Move `--st-page-gutter` to canonical location (3 errors → 0)

`--st-page-gutter` is currently defined in `globals.css` (line 14) as `var(--st-spacing-stack-lg)`. It is used by `PageSections.module.css`, `ContentBlock.module.css`, and `Hero.module.css`.

**Fix:** Move the definition from `globals.css` to both `tokens.css` files (layout section, after spacing stack tokens). Remove the definition from `globals.css`. This aligns with the convention that all `--st-*` tokens are defined in the canonical token files.

### Phase E — Resolve orphaned `design-tokens.css` (3 errors → 0)

`apps/web/src/styles/design-tokens.css` is an older parallel token file that predates the canonical `tokens.css` system. It defines its own foundation scale (`--st-space-1..8`, `--st-radius-1..4`, `--st-text-1..2`) and semantic aliases (`--st-space-xs/sm/md/lg/xl`, `--st-text-sm/md`). The validator flags 3 internal cross-references (`--st-radius-4`, `--st-text-1`, `--st-text-2`).

**Fix strategy:**
1. Check if any CSS file imports or references `design-tokens.css` — if no consumers, delete it
2. If consumers exist, migrate them to canonical `tokens.css` names and then delete the file
3. The foundation tokens it defines (`--st-space-1..8`, etc.) already exist in canonical `tokens.css` — no data loss from deletion

### Phase F — Migrate legacy aliases to canonical names (bonus, 18 refs)

Not strictly broken (aliases work), but reduces confusion and future debt:

| Legacy alias | Canonical name | Files affected |
|-------------|---------------|---------------|
| `--st-pink` | `--st-color-brand-primary` | App.css (2), SocialLink (2), Link (2), Logo (1) = 7 refs |
| `--st-gray-light` | `--st-color-neutral-100` | SocialLink (1) = 1 ref |
| `--st-font-mono` | `--st-font-family-mono` | globals.css (1), MetadataCard (4), ContentBlock (1), ContentNav (1), FilterBar (2), Chip (1) = 10 refs |

**Gate:** Phase F is optional. If the epic is too large, defer alias migration to a follow-up. The aliases remain functional via back-compat mappings in `tokens.css`.

---

## Query Layer Checklist

No query changes needed. CSS-only epic.

- [ ] `pageBySlugQuery` — not affected
- [ ] `articleBySlugQuery` — not affected
- [ ] `caseStudyBySlugQuery` — not affected
- [ ] `nodeBySlugQuery` — not affected
- [ ] Archive queries — not affected

---

## Schema Enum Audit

No enum fields added or rendered by this epic.

---

## Metadata Field Inventory

Not applicable — this epic does not touch MetadataCard's data contract. Phase F optionally updates `MetadataCard.module.css` to use `--st-font-family-mono` instead of the legacy alias `--st-font-mono`, but this is a CSS-only change with no visual effect (the alias resolves to the same value).

---

## Themed Colour Variant Audit

| Surface / component | Dark | Light | Pink Moon | Token(s) to set |
|---------------------|------|-------|-----------|-----------------|
| Surface subtle (PersonProfilePage, TaxonomyArchivePage) | `var(--st-color-softgrey-900)` | `var(--st-color-neutral-100)` | `var(--st-color-softgrey-800)` | `--st-color-surface-subtle` |

Both current callers provide hardcoded fallbacks (`#f5f5f5`, `#fafafa`) which are light-mode-only values. The token must be defined with per-theme values to work correctly in dark mode. Current dark mode rendering of these pages uses the fallback value (a light grey on a dark background — visually broken but not noticed because these pages may not have been dark-mode tested).

All other token replacements in this epic use tokens that already have correct per-theme values. No additional themed overrides needed.

---

## Non-Goals

- **Token naming convention overhaul** — This epic fixes broken references and registers missing tokens. It does not redesign the naming hierarchy (foundation → semantic → component tiers). The existing convention is functional — the problem is incomplete coverage, not wrong architecture.
- **Removing legacy aliases from `tokens.css`** — Aliases like `--st-pink`, `--st-font-mono`, `--st-gray-light` are defined in `tokens.css` for backward compatibility. Phase F migrates callers away from them, but the alias definitions themselves stay in `tokens.css` (removing them could break code not covered by the validator, e.g. inline styles, Storybook).
- **DS package CSS component token duplication** — Several DS components (Media, Blockquote, Callout, CodeBlock, Table) locally re-define `--st-*` tokens that also exist in `tokens.css`. This is a maintenance concern (component overrides global) but not broken. De-duplicating is a separate epic.
- **Schema changes** — None. CSS-only.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`, `packages/design-system`
- No migration script — all changes are CSS file edits
- Must run `pnpm validate:tokens` from `apps/web/` after each phase to verify error count reduction

**Schema (Studio)**
- No schema changes.

**Query (GROQ)**
- No query changes.

**Render (Frontend)**
- No JSX changes. CSS-only.
- Token replacements must be **visually equivalent** — the canonical token must resolve to the same (or intentionally better) value as what the browser was falling back to. For broken tokens with no fallback, the browser uses the property's initial value (e.g. `inherit` for `color`, `0` for `margin`, `normal` for `font-size`).

**Token file sync (critical)**
- Both `tokens.css` files must be updated in the same commit whenever tokens are added or moved.
- `apps/web/src/design-system/styles/tokens.css` (web canonical)
- `packages/design-system/src/styles/tokens.css` (DS package)
- Per CLAUDE.md: run `pnpm validate:tokens` from `apps/web/` and confirm zero errors before committing.

**Validator enhancement (Phase C)**
- The validator must support an allowlist for component-scoped API tokens that are intentionally undefined at the global level.
- Allowlisted tokens should still be checked for fallback values in their CSS usage — a `var(--st-media-overlay-color)` without a fallback would be a real error, even if the token is on the allowlist.

**Design System → Web Adapter Sync**
- Phase C affects both `apps/web/src/design-system/components/` and `packages/design-system/src/components/` CSS files equally — they have the same component-scoped tokens. The validator fix handles both.

---

## Migration Script Constraints

N/A — no migration script. All changes are CSS file edits and validator code updates.

---

## Files to Modify

**Token files (Phase B, D)**
- `apps/web/src/design-system/styles/tokens.css` — ADD `--st-transition-fast`, `--st-color-surface-subtle`, `--st-page-gutter`
- `packages/design-system/src/styles/tokens.css` — ADD same tokens (sync)

**App-level CSS (Phase A)**
- `apps/web/src/App.css` — REPLACE 14 broken `var()` references with canonical names

**Component CSS (Phase A)**
- `apps/web/src/components/HomepageHero.module.css` — REPLACE `--st-spacing-stack-2xl`
- `apps/web/src/components/PageSections.module.css` — REPLACE `--st-font-small`
- `apps/web/src/components/atoms/SocialLink.module.css` — REPLACE `--st-text-lg`

**Pages CSS (Phase B)**
- `apps/web/src/pages/PersonProfilePage.module.css` — now resolves via registered `--st-color-surface-subtle`
- `apps/web/src/pages/TaxonomyArchivePage.module.css` — same

**Globals CSS (Phase D)**
- `apps/web/src/design-system/styles/globals.css` — REMOVE `--st-page-gutter` definition (moved to tokens.css)

**Legacy file (Phase E)**
- `apps/web/src/styles/design-tokens.css` — DELETE (after confirming no consumers) or MIGRATE consumers

**Validator (Phase C)**
- `apps/web/scripts/validate-tokens.js` — ADD component-scoped token allowlist with fallback verification

**Optional — alias migration (Phase F)**
- `apps/web/src/App.css` — REPLACE `--st-pink` → `--st-color-brand-primary`
- `apps/web/src/components/atoms/SocialLink.module.css` — REPLACE `--st-pink`, `--st-gray-light`
- `apps/web/src/components/atoms/Link.module.css` — REPLACE `--st-pink`
- `apps/web/src/components/atoms/Logo.module.css` — REPLACE `--st-pink`
- `apps/web/src/design-system/styles/globals.css` — REPLACE `--st-font-mono` → `--st-font-family-mono`
- `apps/web/src/components/MetadataCard.module.css` — REPLACE `--st-font-mono` (4 refs)
- `apps/web/src/components/ContentBlock.module.css` — REPLACE `--st-font-mono`
- `apps/web/src/components/ContentNav.module.css` — REPLACE `--st-font-mono`
- `apps/web/src/components/FilterBar.module.css` — REPLACE `--st-font-mono` (2 refs)
- `apps/web/src/design-system/components/chip/Chip.module.css` — REPLACE `--st-font-mono`

---

## Deliverables

1. **Phase A complete** — All 17 broken legacy/flat token references replaced with canonical names across App.css, SocialLink, HomepageHero, PageSections
2. **Phase B complete** — `--st-transition-fast` and `--st-color-surface-subtle` registered in both `tokens.css` files; `--st-color-surface-subtle` has per-theme values
3. **Phase C complete** — `validate-tokens.js` supports component-scoped API token allowlist; 12 false positives resolved without global registration
4. **Phase D complete** — `--st-page-gutter` moved from `globals.css` to both `tokens.css` files; 3 errors resolved
5. **Phase E complete** — `design-tokens.css` deleted or consolidated; 3 self-referencing errors resolved
6. **Phase F complete** (optional) — 18 legacy alias references migrated to canonical names
7. **Validator clean** — `pnpm validate:tokens` reports zero errors
8. **Visual parity** — Pages render correctly after token replacement — no visual regressions from the swap (verified via preview screenshot or manual inspection)

---

## Acceptance Criteria

- [ ] `pnpm validate:tokens` reports **0 errors** (down from 52)
- [ ] Both `tokens.css` files remain in sync (same token count, same names)
- [ ] `--st-transition-fast` is defined and used by Link, Logo, SocialLink for hover transitions
- [ ] `--st-color-surface-subtle` is defined with per-theme values and renders correctly in dark mode on PersonProfilePage and TaxonomyArchivePage
- [ ] `--st-page-gutter` is defined in `tokens.css` (not `globals.css`) and PageSections/ContentBlock/Hero still use it correctly
- [ ] Component-scoped API tokens (Media, Callout, CodeBlock, Table) are on the validator allowlist and verified to have CSS fallback values
- [ ] `design-tokens.css` is deleted or consolidated — no orphaned parallel token file
- [ ] `App.css` no longer references any retired token names (`--st-red`, `--st-space-md`, `--st-text-xl`, etc.)
- [ ] **Visual QA**: Loading state, empty state, and error state in App.css render with correct colours, spacing, and font sizes (not UA defaults)
- [ ] **Visual QA**: HomepageHero top spacing is correct (not `0` from undefined token)
- [ ] **Visual QA**: SocialLink hover transition is smooth (not instant from missing transition token)
- [ ] No CSS files import or reference `design-tokens.css` after Phase E
- [ ] (If Phase F done) No CSS file references `--st-pink`, `--st-gray-light`, or `--st-font-mono` — all use canonical tier-1 or semantic names

---

## Risks / Edge Cases

**Token replacement risks**
- [ ] `--st-red` → `--st-color-danger` changes the colour from "undefined/transparent" to `--st-color-maroon` (#b91c68, a deep pink-red). This is intentionally correct for error states but is a visible change — verify it looks right in context.
- [ ] `--st-gray-medium` → `--st-color-softgrey` changes from "undefined/inherit" to `#94A3B8`. Verify the `.empty-state p` colour is appropriate against the page background in both themes.
- [ ] `--st-space-3xl` replacement with `--st-space-8` (40px) may be smaller than the original intent of "3xl". If the empty-state margin looks cramped, consider using a raw value like `64px` with a comment.

**Validator enhancement risks**
- [ ] The component-scoped token allowlist must be maintained — when a new component adds `--st-*` API tokens, they must be added to the allowlist or the validator will flag them. Document this in the validator file header.
- [ ] Fallback verification for allowlisted tokens: the validator must parse `var(--st-token-name, fallback)` syntax correctly. CSS `var()` can be nested — ensure the parser handles `var(--st-foo, var(--st-bar, #fff))`.

**Legacy file deletion risks**
- [ ] `design-tokens.css` may be imported by a file not covered by the validator (e.g. a Storybook config, a test file, or a CSS file that doesn't use `--st-*` names). Search for `design-tokens` across the entire repo before deleting.
- [ ] If `design-tokens.css` is imported in `main.jsx` or `App.jsx`, removing the import may cause currently-functional (but legacy-named) tokens to break in files that depend on them. Audit the full import chain.

**Theme risks**
- [ ] `--st-color-surface-subtle` does not exist yet — the proposed per-theme values must be visually tested. The light-mode value (`--st-color-neutral-100` = `#f5f5f5`) matches the hardcoded fallback currently in use. The dark-mode value must be reviewed — `--st-color-softgrey-900` may be too close to the canvas background (`--st-color-bg-canvas`).

**Sync risks**
- [ ] Every token addition/modification must touch both `tokens.css` files in the same commit. Per CLAUDE.md, run `pnpm validate:tokens` before committing.

---

## Appendix: Complete Token Replacement Map

For reference during execution — every broken reference and its canonical replacement:

| # | File | Line(s) | Broken token | Replacement | Value |
|---|------|---------|-------------|-------------|-------|
| 1 | App.css | 22 | `--st-text-xl` | `--st-font-size-xl` | `1.4rem` |
| 2 | App.css | 40 | `--st-text-lg` | `--st-font-size-lg` | `1.125rem` |
| 3 | App.css | 54 | `--st-text-sm` | `--st-font-size-sm` | `0.875rem` |
| 4 | App.css | 28 | `--st-space-3xl` | `--st-space-8` | `40px` |
| 5 | App.css | 29 | `--st-space-2xl` | `--st-space-7` | `32px` |
| 6 | App.css | 35, 47 | `--st-space-md` | `--st-spacing-stack-md` | `16px` |
| 7 | App.css | 55 | `--st-space-xs` | `--st-spacing-stack-xs` | `4px` |
| 8 | App.css | 39 | `--st-gray-medium` | `--st-color-softgrey` | `#94A3B8` |
| 9 | App.css | 45,49,53,61,66 | `--st-red` | `--st-color-danger` | `var(--st-color-maroon)` |
| 10 | SocialLink | 24 | `--st-text-lg` | `--st-font-size-lg` | `1.125rem` |
| 11 | HomepageHero | 7 | `--st-spacing-stack-2xl` | `--st-space-8` | `40px` |
| 12 | PageSections | 277 | `--st-font-small` | `--st-font-caption` | `var(--st-font-size-xs)` |
| 13 | Link, Logo, SocialLink | various | `--st-transition-fast` | Register new token | `150ms ease` |
| 14 | PersonProfile, TaxonomyArchive | various | `--st-color-surface-subtle` | Register new token | per-theme |
| 15 | PageSections, ContentBlock, Hero | various | `--st-page-gutter` | Move to tokens.css | `var(--st-spacing-stack-lg)` |
| 16 | design-tokens.css | internal | `--st-radius-4`, `--st-text-1`, `--st-text-2` | Delete file | N/A |

---

## Post-Epic Close-Out

1. **Activate the epic file:**
   - Assign the next sequential EPIC number (currently EPIC-0169 is the latest)
   - Move: `docs/backlog/EPIC-token-reference-cleanup.md` → `docs/prompts/EPIC-{NNNN}-token-reference-cleanup.md`
   - Update the **Epic ID** field to match
   - Commit: `docs: activate EPIC-{NNNN} Token Reference Cleanup`
2. **Confirm clean tree** — `git status` must show nothing staged or unstaged
3. **Run mini-release** — `/mini-release EPIC-{NNNN} Token Reference Cleanup`
4. **Start next epic** — only after mini-release commit is confirmed
