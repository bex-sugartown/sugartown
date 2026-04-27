---
**Epic:** SUG-85 — Token file sync audit
**Linear Issue:** [SUG-85](https://linear.app/sugartown/issue/SUG-85)
**Status:** Backlog
**Priority:** High
**Merge strategy:** (a) Merge-as-you-go — single commit, single mini-release
---

# SUG-85 — Token file sync audit

Resolve structural drift between the two canonical token files. Identified incidentally during SUG-84 when `pnpm validate:tokens` reported 86 value mismatches.

## Background

Two token files must stay in sync per CLAUDE.md token drift rules:
- **Web (canonical):** `apps/web/src/design-system/styles/tokens.css`
- **DS package:** `packages/design-system/src/styles/tokens.css`

The validator confirms all `var(--st-*)` references resolve — so nothing is broken in production — but the two files have diverged in ways that will cause silent visual inconsistencies between Storybook (which loads packages/) and the web app (which loads apps/web/).

## Drift inventory (found 2026-04-27)

### Value conflicts — same token name, different resolved value

| Token | Web value | Packages value | Notes |
|-------|-----------|----------------|-------|
| `--st-card-hover-shadow` | `0 18px 55px rgba(0,0,0,0.22)` | `0 6px 20px rgba(0,0,0,0.08)` | Web is dark-first (deeper shadow); packages is light-first |
| `--st-card-shadow` | Two definitions (dark default + light comment) | One definition (light value only) | Web added a dark-mode override; packages missed it |
| `--st-code-inline-bg` | `rgba(209,255,29,0.10)` (lime pill, dark-first) | `var(--st-color-softgrey-100)` (light-first) | Architecture mismatch — web is dark-first, packages is light-first |
| `--st-code-inline-color` / `--st-code-inline-text` | `var(--st-color-lime)` | `var(--st-color-maroon)` | Dark vs light default |
| `--st-code-inline-border` | `rgba(209,255,29,0.30)` | `1px solid var(--st-color-softgrey-200)` | Same drift pattern |

### Tokens in packages only (missing from web)

| Token | Notes |
|-------|-------|
| `--st-callout-bg-light` | Light-theme callout wash — web Callout component (Ledger Tradition) doesn't use this pattern |
| `--st-shadow-table-card-light`, `--st-shadow-table-light` | Table card shadow light variants — may be unused |
| `--st-color-amber-700` | Color scale step — web may need this for Callout warn label in light mode |
| `--st-color-lime-800` | Color scale step |
| `--st-color-seafoam-700`, `--st-color-seafoam-800` | Color scale steps |
| `--st-color-sky-700` | Color scale step |
| `--st-color-softgrey-200`, `--st-color-softgrey-300` | Color scale steps |
| `--st-color-violet-600` | Color scale step |
| `--st-color-orange-700` | Color scale step |
| `--st-color-charcoal` | Alias — packages has this, web has `--st-color-charcoal-400` |

### Tokens in web only (not in packages)

| Token | Notes |
|-------|-------|
| `--st-color-red-500` | Legacy alias pointing to maroon — probably deletable |
| `--st-color-bg-secondary`, `--st-color-bg-tertiary` | Old surface layer aliases — check if anything references them |
| `--st-color-pt-divider-dark`, `--st-color-pt-divider-dark-mid`, `--st-color-pt-divider-dark-subtle` | PortableText HR divider tokens — web-specific |
| `--st-color-pt-divider-light`, `--st-color-pt-divider-light-strong` | Same |
| `--st-color-preview-bg`, `--st-color-preview-fg` | Preview mode lime/dark — web-only by design |

## Approach

### Phase 0 — Audit (no writes yet)
1. For each value conflict: determine which file is canonical (the web app is what ships; packages/ feeds Storybook)
2. For packages-only tokens: check if any web component references them via `grep -r "var(--st-X)" apps/web/src`
3. For web-only tokens: check if any DS package component references them

### Phase 1 — Resolve value conflicts
Update whichever file has the wrong value to match the canonical one. The dark-first pattern (`:root` = dark, `[data-theme="light-pink-moon"]` = light overrides) is the established architecture — packages/ may need updating to match.

### Phase 2 — Sync missing tokens
- Add missing color scale steps to web if web components reference them
- Add missing web-only tokens to packages if Storybook stories need them
- Delete confirmed-dead tokens from both

### Phase 3 — Extend validator
Add a `--check-sync` flag to `validate-tokens.js` that diffs both files and errors on value conflicts. This makes drift detectable in CI rather than manual audits.

## Acceptance criteria

- [ ] `diff <(grep "^\s*--st-" apps/web/.../tokens.css | sort) <(grep "^\s*--st-" packages/.../tokens.css | sort)` — zero meaningful differences (comments and order excluded)
- [ ] `pnpm validate:tokens` — 0 errors
- [ ] `pnpm validate:tokens --strict-colors` — 0 errors
- [ ] `pnpm validate:tokens --check-sync` (new flag) — 0 sync errors

## Notes

- The web token file is dark-first (`:root` defaults are dark). The packages file appears to be light-first in some sections. This architectural inconsistency is the root cause of most value conflicts.
- `--st-color-preview-bg/fg` are intentionally web-only (preview mode UI) — these should be excluded from the sync check.
- PortableText divider tokens (`--st-color-pt-divider-*`) are web-only by design — same exclusion.
