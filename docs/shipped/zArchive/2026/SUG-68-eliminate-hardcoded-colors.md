**Linear Issue:** [SUG-68](https://linear.app/sugartown/issue/SUG-68/eliminate-hardcoded-color-values-across-ds-theme-layers-no-raw-hex-or)

## EPIC NAME: Eliminate hardcoded color values across DS + theme layers

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — enumerate every file currently holding a raw color literal outside `tokens.css`. Confirmed from audit:
  - `apps/web/src/design-system/components/card/Card.module.css` + DS mirror
  - `apps/web/src/design-system/components/chip/Chip.module.css` + DS mirror
  - `apps/web/src/design-system/components/button/Button.module.css` + DS mirror
  - `apps/web/src/design-system/components/media/Media.module.css` + DS mirror
  - `apps/web/src/design-system/components/blockquote/Blockquote.module.css` + DS mirror
  - `apps/web/src/design-system/components/callout/Callout.module.css` + DS mirror
  - `apps/web/src/design-system/components/codeblock/CodeBlock.module.css` + DS mirror
  - `apps/web/src/design-system/components/accordion/Accordion.module.css` + DS mirror
  - `apps/web/src/design-system/components/table/Table.module.css` + DS mirror
  - `packages/design-system/src/components/FilterBar/FilterBar.module.css` (DS-only)
  - `apps/web/src/design-system/styles/theme.pink-moon.css` + DS mirror
  - `apps/web/src/design-system/styles/theme.light.css` + DS mirror
  - `apps/web/src/design-system/styles/utilities.css`
- [ ] **Use case coverage** — every status chip state currently rendered (draft, active, archived, implemented, evergreen, validated, deprecated, exploring, operationalized, dreaming, designing, developing, testing, deploying, iterating) gets a matching semantic token trio: bg, fg, border. List the 15 states + confirm the token set exists after this epic.
- [ ] **Layout contract** — N/A (no layout change).
- [ ] **All prop value enumerations** — status chip enum (15 states above) must be cross-referenced against the actual Sanity schema values (`article.status`, `node.status`, `caseStudy.status`, etc.) so no state is tokenized that never renders and no rendered state is missed.
- [ ] **Correct audit file paths** — all paths listed above verified via grep audit on 2026-04-18.
- [ ] **Dark / theme modifier treatment** — every new semantic token must have a light-mode override in `theme.light.css` AND a dark-mode default in `theme.pink-moon.css`. The current hardcoded status chip values differ between modes (`.statusDraft` at line 144 vs `[data-theme="light"] .statusDraft` at line 483) — that pattern must survive tokenization.
- [ ] **Studio schema changes scoped** — N/A.
- [ ] **Web adapter sync scoped** — **in scope.** Every file touched in `apps/web/src/design-system/` has a mirror in `packages/design-system/src/`. Both must be updated in lockstep per MEMORY.md §Card Component Architecture and §Token Drift Rules.
- [ ] **Composition overlap audit** — N/A.
- [ ] **Atomic Reuse Gate** —
  1. Existing tokens — extend token set, don't fork new CSS variables outside the `--st-*` namespace
  2. Consumed everywhere (all components + themes) — tokenization pays for itself many-fold
  3. API composable — status tokens follow the `--st-status-<state>-{bg,fg,border}` pattern, consistent and extensible

---

## Context

**Why this epic exists:**
The "Zero hardcoded color values" claim we want on `/platform` is currently false. Audit on 2026-04-18 found raw `#hex` and `rgba()` literals across 13+ component CSS files plus both theme files. The bulk of violations live in:
- The Card status chip system (~25 lines of raw rgba in Card.module.css)
- Theme files defining callout/footer/header/shadow tokens with inline rgba
- A few component shadow edges and fallback hex values after `var()` (e.g. `var(--st-color-text-muted, #94A3B8)` — the fallback is itself a hardcoded literal)

**Single source of truth contract:**
After this epic:
- `tokens.css` is the ONLY file permitted to contain hex literals (primitive scales)
- Every other CSS file (themes, components, utilities) resolves color through the token layer
- `validate-tokens.js` enforces this with a new `--strict-colors` rule, CI-failing

**Recent epics on the same surface:**
- SUG-21 (Pink Moon) — established the token scale and the two themes
- SUG-67 (Stats pipeline, pending) — consumes the DS token counts; this epic unlocks its "zero hardcoded" assertion

**Doc types in scope:** none (pure CSS + tokens work).

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ No | CSS-only epic; no schema or content changes. |
| `article`   | ☐ No | Same. |
| `caseStudy` | ☐ No | Same. |
| `node`      | ☐ No | Same. |
| `archivePage` | ☐ No | Same. |

---

## Phase 0 — Token plan

> No CSS edits before this phase is signed off.

**Phase 0 deliverables:**

1. **Complete violation inventory** committed as a text file artifact (`docs/drafts/SUG-68-violations.txt`) — grep output of every offending line with `file:line:content`.

2. **Proposed semantic token set** covering every violation category:
   - **Shadow tokens:** `--st-shadow-card-light`, `--st-shadow-card-hover-light`, `--st-shadow-table`, `--st-shadow-table-card`, `--st-shadow-button-edge-light`, `--st-shadow-button-edge-dark`, `--st-shadow-elevation-float-light`, `--st-shadow-elevation-float-dark`
   - **Status tokens:** for each of 15 states, three tokens: `--st-status-<state>-{bg,fg,border}`, each with light + dark values
   - **Chip modifier tokens:** `--st-chip-violet`, `--st-chip-amber`, `--st-chip-grey` (already partially tokenized via `--st-color-*`; finish the job)
   - **Overlay tokens:** `--st-media-overlay-default`, `--st-media-duotone-shadow-light`, `--st-media-duotone-shadow-dark`
   - **Glow tokens:** `--st-hero-glow-gradient` (two-stop gradient as a single token)
   - **Border subtle tokens:** replace `rgba(255,255,255,0.12)` etc. with `--st-color-border-subtle-dark` derived from primitive alpha

3. **Decision on fallback hex in `var()` calls.** Currently widespread: `var(--st-color-text-muted, #94A3B8)`. Two options:
   - **Option A:** Drop all fallbacks. If the token is undefined, CSS falls back to `initial` (usually `currentColor` or inherited) — visible breakage, fail-loud.
   - **Option B:** Keep fallbacks but enforce they reference another token: `var(--st-color-text-muted, var(--st-color-softgrey-400))` — fail-quiet but still token-graph-pure.
   - **Recommended:** Option B. Fallbacks protect against load-order issues on initial paint and are standard DS practice.

4. **Validator rule spec:**
   - `--strict-colors` flag extends `validate-tokens.js`
   - Allow-list: `tokens.css` in both DS locations (primitive definitions)
   - Deny: any `#[0-9a-fA-F]{3,8}` or `rgba?(` or `hsla?(` outside the allow-list
   - Exception for `var(--*, <primitive-ref>)` fallbacks per Phase 0 decision above
   - CI integration: add `pnpm validate:tokens --strict-colors` to the pre-merge check that already runs `pnpm validate:tokens`

5. **Execution order decided.** Recommend:
   - Phase 1: theme files (least risky, centralises the most tokens)
   - Phase 2: component files (themes already have the new tokens to reference)
   - Phase 3: validator rule turned on + CI wired
   - Phase 4: `/platform` callout copy updated + callout re-verified

---

## Scope

- [ ] Phase 1 — Tokenize `theme.pink-moon.css` + `theme.light.css` (both DS mirrors)
- [ ] Phase 2 — Tokenize each component CSS file in lockstep across both DS mirrors:
  - [ ] Card.module.css (status chips — largest surface)
  - [ ] Chip.module.css
  - [ ] Button.module.css
  - [ ] Media.module.css
  - [ ] Blockquote.module.css
  - [ ] Callout.module.css
  - [ ] CodeBlock.module.css
  - [ ] Accordion.module.css
  - [ ] Table.module.css
  - [ ] FilterBar.module.css (DS-only; still requires a web adapter audit)
  - [ ] utilities.css
- [ ] Phase 3 — Extend `apps/web/scripts/validate-tokens.js` with `--strict-colors`; wire into CI
- [ ] Phase 4 — Update `/platform` governance callout copy + add Storybook test confirming zero violations
- [ ] New token definitions added to BOTH `tokens.css` files in the same commit (MEMORY.md §Token Drift Rules)
- [ ] Updated Storybook stories for Card status variants (verify visual parity before/after)
- [ ] Visual QA: Chromatic or manual diff confirming no unintended color shift

---

## Query Layer Checklist

N/A.

---

## Technical Constraints

- **Zero visual change.** This is a refactor, not a redesign. Every before/after pixel must match. Storybook VRT or manual comparison is required.
- **Lockstep DS sync.** Per MEMORY.md §Token Drift Rules, every new token and every replacement must land in both `tokens.css` files in the same commit. Same rule applies to component CSS mirrors.
- **Semantic token names.** Don't invent `--st-card-statusdraft-bg-color` — use `--st-status-draft-bg`. Names describe intent, not nesting.
- **Token fallback syntax consistency.** Pick a fallback policy in Phase 0 and apply it repo-wide. Mixed styles across files are worse than no fallbacks.
- **Validator rule must be CI-hard.** A soft warning gets ignored; a hard failure forces tokenization on every future change.
- **`color-mix()` is allowed** (e.g. `color-mix(in srgb, var(--chip-color) 85%, #000)` in Chip). The `#000` here is an intentional hardcoded black for contrast math — validator can exempt `#000`/`#fff` inside `color-mix()` OR replace with `var(--st-color-black)` / `var(--st-color-white)` for consistency. Decide in Phase 0.

---

## Acceptance Criteria

1. `pnpm validate:tokens --strict-colors` exits 0 across the entire repo.
2. `grep -rE '(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()' apps/web/src/design-system packages/design-system/src --include='*.css' | grep -v tokens.css` returns zero non-comment hits (or only the Phase 0-approved `color-mix()` exceptions).
3. Every status chip state renders identically in Storybook before and after the refactor (screenshot compare).
4. Light-mode + dark-mode Storybook runs produce no Axe or visual regressions.
5. CI fails if a future PR introduces a raw color literal outside `tokens.css`.
6. `/platform` governance callout truthfully reads "7 primitives. 79 component tokens. Zero hardcoded color values." (numbers sourced from SUG-67 variables if that ships first, otherwise inline).
7. At least one commit references SUG-68 on `origin/main` before Done (CLAUDE.md §Linear Done = code in remote).

---

## Non-Goals

- Redesigning any component or palette (pure refactor)
- Adding new themes beyond `pink-moon` and `light`
- Tokenizing `.js`/`.jsx` inline styles (this epic is CSS-only; JSX inline colors can follow in a sibling epic if discovered)
- Touching `CSS` inside `apps/web/src/pages/` or `apps/web/src/components/` outside the design system (out of scope — different surface area)

---

## Rollback Plan

Each phase is independently revertable:
1. Theme tokenization — revert theme file pair commit
2. Component tokenization — revert per-component commit (intentionally one commit per component)
3. Validator rule — revert the validate-tokens.js commit; the tokens remain harmless

No data migration, no schema, no content.

---

## Definition of Done

- All acceptance criteria pass
- `validate-tokens --strict-colors` green in CI
- Storybook visual diff clean for every component touched
- Token count on `/platform` updated to reflect new semantic tokens
- Epic doc moved from `docs/backlog/` to `docs/shipped/` and Linear SUG-68 transitioned to Done
