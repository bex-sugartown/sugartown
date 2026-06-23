---
**Epic:** SUG-194 — Update DS Architecture FigJam Diagram
**Linear Issue:** [SUG-194](https://linear.app/sugartown/issue/SUG-194/update-ds-architecture-figjam-diagram)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-194 — Update DS Architecture FigJam Diagram

Update the Sugartown Design System Architecture FigJam board to reflect shipped items, remove stale 🔮 future markers, and add new layers added since the board was last authored.

## Background

The FigJam board at `https://www.figma.com/board/W8TpyE6jZbDgLW8B3jDPBA/` was authored when several key infrastructure items were still aspirational (marked 🔮). As of v0.28.0, Style Dictionary is live, `validate:style-mirror` is a pre-commit gate, `theme.shop.css` exists as a third theme, and the Contentful POC (`apps/contentful-poc/`) is a new consumer layer. The board also has stale counts (Storybook "4 groups"), missing validators, and a Skills list that no longer matches reality. A diagram that describes the past as the future erodes its value as an onboarding and governance reference.

## Objective

After this epic, the FigJam board accurately reflects the shipped DS architecture as of v0.28.0: Style Dictionary is shown as live infrastructure (not future), the token pipeline shows dual-output targets, the theme layer includes all three themes, the Contract layer includes all seven validators, the Implementation layer reflects the Contentful POC consumer, and all 🔮 markers are either promoted to shipped or removed. No new architecture is designed — this is a documentation update only.

## Scope

- [ ] **② Token Pipeline** — mark Style Dictionary as shipped; update node to show `pnpm tokens:build` command and dual output (`apps/web/src/design-system/styles/tokens.css` + `packages/design-system/src/styles/tokens.css`). Layer: diagram
- [ ] **② Token Pipeline** — add `theme.shop.css` as a third theme variant alongside Pink Moon light + dark. Layer: diagram
- [ ] **⑤ Contract + Test Layer** — promote "Token Sync Check (DS ↔ web drift)" from 🔮 to shipped (`validate:style-mirror`, pre-commit). Layer: diagram
- [ ] **⑤ Contract + Test Layer** — add missing validators: `validate:filters`, `validate:taxonomy`, `validate:css-names`, `apps/studio/scripts/validate-schema-parity.js`. Layer: diagram
- [ ] **④ Implementation** — update Storybook node from "4 groups" to "2 categories: Components + Patterns". Layer: diagram
- [ ] **④ Implementation** — add `apps/contentful-poc/` as a new consumer node (multi-brand POC consuming DS via `theme.shop.css`). Layer: diagram
- [ ] **③ AI Agent Layer** — update Skills node to reflect current skill set or replace with "see CLAUDE.md" pointer (the enumerated list is stale). Layer: diagram
- [ ] **③ AI Agent Layer** — confirm and update or remove `llms.txt` and `component-registry.json` nodes based on whether they shipped. Layer: diagram

## Acceptance criteria

- [ ] No 🔮 marker remains for Style Dictionary — it is shown as live infrastructure with build command
- [ ] Theme layer shows three themes: Pink Moon light, Pink Moon dark, Shop (multi-brand POC)
- [ ] `validate:style-mirror` appears in the Contract layer as a shipped pre-commit validator
- [ ] Storybook node says "2 categories" not "4 groups"
- [ ] Contentful POC appears as a consumer node in the Implementation section
- [ ] `llms.txt` and `component-registry.json` nodes are either confirmed shipped (with detail) or removed
- [ ] All remaining 🔮 nodes are either promoted or explicitly labelled "deferred"

## Human QA Walkthrough

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

**Activation audits:**
1. Confirm whether `llms.txt` exists: `find /Users/beckyalice/SUGARTOWN_DEV/sugartown -name "llms.txt" -not -path "*/node_modules/*"`
2. Confirm whether `component-registry.json` / `pnpm registry:build` exists: `grep -r "registry:build" package.json apps/web/package.json`
3. Confirm current Storybook category count by reading `.storybook/main.ts` stories globs and cross-referencing MEMORY.md (which records "Components + Patterns — 2 categories")

**No code changes** — this epic touches only the FigJam board via Figma MCP. No schema, no CSS, no JSX.

**Model & Mode [REQUIRED]:** `/model sonnet` — documentation-only update, no code changes. Use `mcp__725c8944-0f7e-4ae2-8c6a-71127d0e15c4__get_figjam` to read current board state and `use_figma` or FigJam edit tools to update nodes.

## Non-Goals

- No new architecture is designed — this is a sync pass only
- No code, schema, or CSS changes
- No redesign of the board layout or colour coding — update node content only
- Do not expand the board to cover the Contentful POC in detail — a single consumer node is sufficient

## Related

- **Linear:** [SUG-194](https://linear.app/sugartown/issue/SUG-194/update-ds-architecture-figjam-diagram)
- **FigJam board:** `https://www.figma.com/board/W8TpyE6jZbDgLW8B3jDPBA/Sugartown-Design-System-Architecture--Vertical-`
- **Epic template:** `docs/epic-template.md`
- **DS architecture audit:** conducted 2026-06-23 — source of truth for all updates above
