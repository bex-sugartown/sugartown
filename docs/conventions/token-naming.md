# CSS Token Naming Conventions

Tokens are named for the **concept** they represent, not the placement where they were first used.

---

## The core rule

A token name is a contract. Components that adopt the token inherit that contract. If the token name is a placement (`--st-card-folio-bg`), every downstream consumer that uses it somewhere other than a folio strip is silently violating the name -- but the CSS still works, so the violation is invisible until a rename is needed.

Name for concept. If the concept is "label cell background on structured surfaces", the name is `--st-card-label-bg`, not `--st-card-folio-bg`. If a component uses that token for a filter sidebar header, the name still makes sense. If the token had been named `--st-card-folio-bg`, the FilterBar would be borrowing a token whose name describes the wrong thing.

---

## Audit trigger: used in 2+ surfaces

When a token is referenced in more than two distinct components or contexts, stop and audit the name:

1. Does the name accurately describe all current usages?
2. Is the name tied to one specific placement (folio, footer, sidebar) while being used in others?
3. If yes to (2): rename before it spreads further. Update all references and both token files in the same commit.

The cost of a rename is proportional to how many files reference the token. Rename early.

---

## `--st-card-*` token register

These tokens belong to the Card family of structured surfaces and are available to all components that share the Ledger Tradition aesthetic (Card, MetadataCard, FilterBar, etc.).

| Token | Concept | Dark-pink-moon resolved value |
|-------|---------|-------------------------------|
| `--st-card-bg` | Card body background | `rgba(255,255,255,0.06)` (glassmorphism) |
| `--st-card-border` | Card outer border | `rgba(255,255,255,0.15)` |
| `--st-card-label-bg` | Label/folio/header cell background (solid, not glass) | `rgb(20, 24, 48)` (midnight-800) |

Note: `--st-card-bg` resolves to a semi-transparent glassmorphism value in dark-pink-moon. Do not use it for label cells or header strips that require a solid opaque background. Use `--st-card-label-bg` instead.

---

## Naming patterns by concept

| Concept | Pattern | Example |
|---------|---------|---------|
| Surface background | `--st-<scope>-bg` | `--st-card-bg`, `--st-modal-bg` |
| Label / header cell bg | `--st-<scope>-label-bg` | `--st-card-label-bg` |
| Border/divider | `--st-color-rule-*` | `--st-color-rule-accent` |
| Status state color | `--st-status-<state>-{bg,fg,border}` | `--st-status-draft-bg` |
| Typography | `--st-font-*` | `--st-font-family-ui`, `--st-label-font` |
| Spacing | `--st-space-*` | `--st-space-section-break-detail` |

---

## What NOT to name a token

- **Placement names** that describe one specific UI slot: `--st-card-folio-bg`, `--st-sidebar-header-bg`, `--st-nav-item-active-bar`. These couple the token to a DOM location. When the same color is needed elsewhere, the name becomes misleading.
- **State without scope**: `--st-active-bg` (active of what?). Always include the scope: `--st-chip-active-bg`.
- **Computed descriptions**: `--st-color-slightly-transparent-white`. Name the concept it fills, not the computed appearance.

---

## Renaming a token

1. Add the new name to `apps/web/src/design-system/styles/tokens.css`
2. Mirror to `packages/design-system/src/styles/tokens.css`
3. Update all `theme.pink-moon.css` override blocks in both packages
4. Find-replace all references in component CSS files (`grep -r 'old-name' --include='*.css'`)
5. Run `pnpm validate:tokens` from `apps/web/` -- zero errors
6. Commit all changes in one atomic commit scoped to the rename: `refactor(tokens): rename --st-old to --st-new`
7. Do not leave the old name as an alias unless a deprecation period is explicitly needed

A token rename that leaves the old name as a fallback accumulates two names for the same concept, doubling the surface for future confusion.
