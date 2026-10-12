---
**Epic:** SUG-164 — Chip neutral border contrast — 1.3:1 non-text contrast (system token review)
**Linear Issue:** [SUG-164](https://linear.app/sugartown/issue/sug-164)
**Status:** In Progress
**Priority:** 🟢 Next
**Labels:** Design System
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** `docs/drafts/SUG-164-chip-neutral-border-contrast.vspec.html`
**Issue:** [#51](https://github.com/bex-sugartown/sugartown/issues/51)
---

# SUG-164 — Chip neutral border contrast — 1.3:1 non-text contrast (system token review)

> **Backlog doc created 2026-08-15**, backfilled during migration Phase 2. This issue was open
> in Linear with no `docs/backlog/` doc — one of nine found by the first parity audit since
> `validate:epic-docs` was archived by SUG-284. The Background below is the Linear description
> verbatim; it was already substantive, so it is preserved rather than paraphrased.

## Background

Logged from the [SUG-162](https://linear.app/sugartown/issue/SUG-162/glossary-term-detail-design-handoff-implementation-reuse-first) design handoff (Open Item 1): the neutral Chip border (`--st-chip-border` → neutral-300) measures ~1.3:1 non-text contrast against the page background. WCAG 1.4.11 requires 3:1 for meaningful UI component boundaries, though chips with adjacent text labels may pass via the text itself.

Scope: system-level token review of `--st-chip-border` (and any other hairline borders that carry meaning) across light + dark Pink Moon themes. Deliberately NOT fixed locally in [SUG-162](https://linear.app/sugartown/issue/SUG-162/glossary-term-detail-design-handoff-implementation-reuse-first) — a local override would fork the token graph.

Affected surfaces: all `Chip variant="status"` / `variant="tag"` neutral chassis, including the [SUG-162](https://linear.app/sugartown/issue/SUG-162/glossary-term-detail-design-handoff-implementation-reuse-first) abbreviation badge and tag chips.

## Objective

After this epic, the neutral chip border meets WCAG 1.4.11 (3:1 non-text contrast) in the light and dark Pink Moon themes, set by one token change and no per-component overrides. Layers touched: design tokens (`tokens/source/tokens.json`, generated `tokens.css` in both copies, `theme.pink-moon.css`) and Storybook docs. No schema, GROQ, JSX or component CSS changes: every consumer already reads `--st-chip-border`.

## Scope

- [x] **1. Vspec** (Phase 0 gate): before and after of the neutral chip on the canvas, a card and the dark theme, with measured ratios and the exact token values, signed off by Bex — layer: docs
- [x] **2. Light value:** add `--st-color-neutral-450` (`#878789`, 3.20:1 on the `#F2F2F3` canvas, 3.59:1 on white) and point `--st-chip-border` at it — layer: tokens
- [x] **3. Dark value:** override `--st-chip-border` in `dark-pink-moon` to a value at 3:1 or more against `--st-color-midnight-700` (`#1c2240`) and the dark canvas; the vspec proposes `#8a90a8` (4.91:1 against the chip fill, 5.86:1 against the card surround; revised from `#767b92` on 2026-10-12 after review) — layer: tokens
- [ ] **4. Verify every consumer:** chips render correctly everywhere `--st-chip-border` is read (see Technical notes) in both themes, and the axe baseline is unchanged — layer: verification

## Phases

| Phase | Ships | Scope items |
|---|---|---|
| 0 | Vspec, signed off by Bex | 1 |
| 1 | Token values, both themes, both `tokens.css` copies, regenerated | 2, 3 |
| 2 | Consumer check across pages, Storybook, close-out | 4 |

## Acceptance Criteria

- [ ] `--st-chip-border` measures at least 3:1 against the page canvas and the chip fill in the light theme, and against the chip fill and canvas in the dark theme, each ratio stated with the command that computed it
- [ ] `pnpm tokens:build` regenerates both `tokens.css` copies and `pnpm validate:style-mirror` and `pnpm validate:tokens` pass
- [ ] No component CSS or JSX file changes in the diff (`git diff --stat` shows only token and theme files plus docs)
- [ ] The vspec-to-build comparison table has no Drift or Missing rows, and Bex has written "Visual QA approved"
- [ ] The five ST-159 axe routes still pass (`pnpm test:smoke`), and the allowlist is unchanged
- [ ] The chip border value in the Storybook Chip story matches the shipped token

## Human QA Walkthrough — example local pages

Slugs captured 2026-10-12 from `apps/web/dist/` after the Phase 1 build (`ls apps/web/dist/<type>`). Routes read from `apps/web/src/App.jsx`.

| Page type | Local URL | Look for | Expected |
|---|---|---|---|
| Articles archive | `http://localhost:5173/articles` | tool chips (Claude, ChatGPT, Gemini), DRAFT badge | firmer grey outline |
| Article detail | `http://localhost:5173/articles/claude-code-joins-the-agentic-caucus` | tag and tool chips | firmer grey outline |
| Node detail | `http://localhost:5173/nodes/80px-gap-section-spacing-framework` | tag chips | firmer grey outline |
| Case study detail | `http://localhost:5173/case-studies/bare-minerals-from-bottlenecks-to-brilliance` | tag chips | firmer grey outline |
| Release note | `http://localhost:5173/releases/release-note-v0-20-0` | chips and badges | firmer grey outline |
| Tool detail | `http://localhost:5173/tools/chatgpt-canvas` | chips | firmer grey outline |
| Knowledge graph | `http://localhost:5173/knowledge-graph` | the Article, Case and Node filter chips | firmer grey outline |
| Glossary archive | `http://localhost:5173/glossary` | regression guard | chips as above |
| Archive filter buttons | `http://localhost:5173/articles` | the filter controls on the left | unchanged and paler (known, see #167) |
| Dark theme | any page above, with the moon toggle in the header | chips | grey-blue outline, clearly visible on the dark fill |

## Technical notes

- **Content Write Gate:** does not fire. No Sanity writes.
- **Schema changes:** none.
- **Why one token:** `--st-chip-border` is read by `Chip.module.css` (`.chip` neutral rule and `.ruleDot`), `Card.module.css` (`.statusBadge`, `.folioStatus`), `--st-chip-rubric-border`, and the knowledge-graph chip tokens in `theme.pink-moon.css`. ST-150 (#150) pointed all of them at it, so a local override would fork the token graph. Verify the list with `grep -rn chip-border packages/design-system/src apps/web/src --exclude-dir=node_modules` at activation.
- **Light value:** neutral-300 (`#c6c6c8`) is 1.71:1 on white and about 1.5:1 on the canvas. Existing neutral-400 (`#a3a3a3`) is 2.52:1 on white, so it does not reach 3:1; neutral-500 (`#6c6c6f`) does but reads as a dark rule, not a hairline. The new step sits between them.
- **Dark value:** the dark theme sets `--st-color-rule-accent` to `rgba(255,255,255,0.15)`, which is also far under 3:1. The override applies to `--st-chip-border` only, leaving `rule-accent` and every divider as they are.
- **Upstream dependencies:** none blocking. #160 (`validate:contrast`) lands after this so it needs no allowlist entry for the chip pair. Reviewed 2026-10-12: no in-flight epic touches `tokens.css` chip tokens.
- **Found at build (2026-10-12):** `.filterChip` on archive pages (`apps/web/src/pages/pages.module.css:508`) uses `--st-color-border-medium`, not `--st-chip-border`, so it stays pale. It is a different token and outside the signed vspec, so it is left alone and filed as #167.
- **Chromatic:** this push touches CSS tokens, so one human-approved Chromatic pass is owed; deferred to the ship step. <!-- Chromatic: pending -->
- **WCAG note:** 1.4.11 also allows a text label to identify a component without a visible boundary. This epic does not rely on that exception, which is why the border is darkened rather than documented away.
- **Token pipeline:** edit `tokens/source/tokens.json`, then `pnpm tokens:build`; never hand-edit `tokens.css`.
- **Model & Mode:** see below.

## Model & Mode [REQUIRED]

`/model sonnet`. A two-token change with a fixed spec and no architecture decisions.

## Non-Goals

- Other hairlines that carry meaning (`--st-color-border-wrap`, table cell borders, button rules). #160 will flag them and each gets its own issue.
- Chip fill, text colour, status dots or tinted (opt-in colour) chips.
- Any change to `--st-color-rule-accent` or to dividers.
- A conformance claim. That is #153.

## Related

- **Linear:** [SUG-164](https://linear.app/sugartown/issue/sug-164)
- Backfilled by the Phase 2 parity audit — `docs/briefs/linear-to-github-migration-plan.md` §5.1
