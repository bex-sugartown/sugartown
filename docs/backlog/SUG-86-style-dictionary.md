---
**Epic:** SUG-86 — Style Dictionary token pipeline build tool
**Linear Issue:** [SUG-86](https://linear.app/sugartown/issue/SUG-86)
**Status:** Backlog
**Priority:** Low
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-86 — Style Dictionary

Replace the hand-authored, dual-file token system with a build pipeline that generates both `tokens.css` files from a single source of truth. Makes SUG-85 drift structurally impossible rather than just detectable.

## Background

Two token files currently maintained by hand:
- `apps/web/src/design-system/styles/tokens.css`
- `packages/design-system/src/styles/tokens.css`

These must stay in sync per CLAUDE.md token drift rules. SUG-85 audits the existing drift (86 value mismatches found 2026-04-27). Style Dictionary solves the root cause: when both files are generated from the same source, they cannot diverge.

Style Dictionary is the `🔮 Style Dictionary (multi-format output)` node at the bottom of ② Token Pipeline in the [FigJam architecture diagram](https://www.figma.com/board/W8TpyE6jZbDgLW8B3jDPBA/) (node `1:31`).

## Relationship to SUG-85

SUG-85 is a patch: audit drift, resolve value conflicts, extend the validator with `--check-sync`. SUG-86 is the structural fix: once Style Dictionary generates both files, `--check-sync` becomes a no-op and SUG-85's drift can never recur.

Recommended sequencing: execute SUG-85 first to clean up the existing drift, then SUG-86 to lock in the single-source architecture. SUG-86 Phase 1 baseline generation should produce output that matches the post-SUG-85 clean file exactly.

## Token source format

Style Dictionary supports JSON, JSONC, and JS config. Recommended structure for this project:

```
tokens/
  primitive.json    # Tier 1: raw values (pink-500, space-4, etc.)
  semantic.json     # Tier 2: aliases (brand-primary → pink-500)
  component.json    # Tier 3: component-specific (card-border, chip-bg)
  theme/
    light.json      # Pink Moon Light overrides
    dark.json       # Pink Moon Dark overrides
```

Each token follows Style Dictionary's standard format:
```json
{
  "color": {
    "pink": {
      "500": { "value": "#FF247D", "type": "color" }
    }
  }
}
```

## Phases

### Phase 0 — Spike
1. Install `style-dictionary` (v4, ESM-native)
2. Author `tokens/primitive.json` with the first 20 primitives
3. Generate a test output and verify it matches the hand-authored format
4. Document any gaps (custom CSS selector structure, `:root` vs `[data-theme]` selectors)

Style Dictionary's default CSS output uses `:root {}` — Sugartown's dark-first architecture requires `:root {}` for dark defaults and `[data-theme="light-pink-moon"] {}` for light overrides. A custom formatter or `selector` config will be needed.

### Phase 1 — Source format + single output
- Author all Tier 1 (primitive) and Tier 2 (semantic) tokens in `tokens/` JSON
- Configure Style Dictionary to output `packages/design-system/src/styles/tokens.css`
- Gate: `diff` against current hand-authored file — zero meaningful differences

### Phase 2 — Dual output
- Add second platform config targeting `apps/web/src/design-system/styles/tokens.css`
- Add `pnpm tokens:build` script to root `package.json`
- Both files now generated — add a `@generated` comment to signal read-only
- Gate: `pnpm validate:tokens` passes, `pnpm validate:tokens --check-sync` passes (if SUG-85 is done)

### Phase 3 — Theme outputs (optional, scope depends on complexity)
- Generate `packages/design-system/src/styles/theme.pink-moon.css` from source
- Light + dark overrides expressed as token relationships in source JSON, not manual CSS

### Phase 4 — Lock + deprecation
- Add pre-commit check: block direct edits to generated `tokens.css` files (they must be edited via the source JSON and regenerated)
- Update `validate:tokens` docs to note the source-of-truth shift
- Optionally gitignore generated files (if treating as build artefacts) — or commit them for editor/Claude Code discoverability

## Acceptance criteria

- [ ] `pnpm tokens:build` generates both `tokens.css` files from `tokens/` source
- [ ] Generated output matches the post-SUG-85 clean files exactly (diff is empty)
- [ ] `pnpm validate:tokens` — 0 errors
- [ ] `pnpm validate:tokens --check-sync` — 0 sync errors (gates on SUG-85 completion)
- [ ] Editing `tokens/primitive.json` and running `tokens:build` propagates the change to both output files

## Technical notes

- Style Dictionary v4 is ESM-native, which matches the monorepo's `"type": "module"` config
- The dark-first `:root` architecture requires a custom `selector` or `formatter` — document this decision in the spike
- Component-scoped tokens (e.g. `--st-media-overlay-color` used as local API surfaces) may not belong in Style Dictionary source — they're defined locally in component CSS. Document the boundary.
- Theme CSS selector structure (`[data-theme="light-pink-moon"]`) will need a custom formatter since Style Dictionary defaults to `:root`

## Related

- **SUG-85** — Token sync audit (patch; execute before SUG-86)
- **[FigJam ② Token Pipeline](https://www.figma.com/board/W8TpyE6jZbDgLW8B3jDPBA/)** — node `1:31`
- **CLAUDE.md** — Token drift rules, pre-commit checklist
