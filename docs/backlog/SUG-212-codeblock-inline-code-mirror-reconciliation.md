---
**Epic:** SUG-212 — CodeBlock inline-code mirror reconciliation + orphan token cleanup
**Linear Issue:** [SUG-212](https://linear.app/sugartown/issue/SUG-212)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-212 — CodeBlock inline-code mirror reconciliation + orphan token cleanup

Reconcile the drifted web↔package `CodeBlock.module.css` inline-code mirror and resolve the orphaned `--st-code-inline-bg-dark` token, both surfaced during SUG-211.

## Background

- **Current state:** The two `CodeBlock` CSS copies have silently drifted in their dark-theme `.inline` override. The web copy (`apps/web/src/design-system/components/codeblock/CodeBlock.module.css:94-99`) renders a **maroon** pill using `--st-code-inline-bg-dark-maroon` / `--st-color-maroon-300` / `--st-code-inline-border-dark-maroon`, under the exact selector `[data-theme="dark-pink-moon"]`. The package copy (`packages/design-system/src/components/CodeBlock/CodeBlock.module.css:102-105`) overrides only `--st-code-inline-bg` → `--st-code-inline-bg-dark` (a lime tint), under the tilde selector `[data-theme~="dark-pink-moon"]`. The two mirrors differ in **both** the tokens used and the selector syntax.
- **Why now:** SUG-211 reassigned the global `--st-code-inline-*` tokens to the recessive seafoam "Option E" treatment. As a side effect, `CodeBlock`'s `.inline` **light** mode now inherits seafoam, while its **dark** mode remains maroon (web) / lime-tint (package) — a three-way inconsistency. SUG-211's audit also mis-labelled `--st-code-inline-bg-dark` as a deletable orphan; it is in fact live in the package mirror, so SUG-211 deliberately left it and deferred the cleanup here.
- **Reference surfaces:** `CodeBlock` renders inline code (`.inline`) and code blocks across article/node/case-study body content (PortableText) wherever inline `code` marks appear. The global inline-code path (`globals.css :not(pre) > code`) is already on Option E and is **not** in scope except as the reference treatment.

## Objective

After this epic, the `CodeBlock` component has one canonical inline-code treatment expressed identically in both the web adapter and the DS-package source, on both themes, driven only by `--st-*` tokens. The web↔package `CodeBlock.module.css` pair is byte-identical for the inline-code rules (same tokens, same selector syntax). Any token left unreferenced after reconciliation (e.g. `--st-code-inline-bg-dark`, and possibly the `*-dark-maroon` pair) is removed from `tokens/source/tokens.json` in the same pass. Layers touched: **design tokens** (`tokens.json` → `tokens:build`) and **component CSS** (both CodeBlock mirrors). No schema, GROQ, or React render-logic changes. The global `:not(pre) > code` path (SUG-211) is out of scope.

## Scope

- [ ] **Decision — canonical CodeBlock inline-code treatment** — layer: design. Decide whether `CodeBlock .inline` keeps its maroon design language or aligns to the SUG-211 seafoam Option E. This is a visual/design call and gates the rest; record it in this doc before writing CSS. If "align to Option E," `CodeBlock .inline` should stop overriding at all and inherit the global `--st-code-inline-*` (letting it match `:not(pre) > code`). If "keep maroon," both mirrors must carry the identical maroon override on both themes.
- [ ] **Reconcile the two CodeBlock CSS mirrors** — layer: component CSS. Make the inline-code rules byte-identical across `apps/web/src/design-system/components/codeblock/CodeBlock.module.css` and `packages/design-system/src/components/CodeBlock/CodeBlock.module.css`, including selector syntax (`[data-theme~="dark-pink-moon"]` is the repo convention — confirm at activation). Per the Mirrored File Registry, resolve which copy is canonical for DS component CSS.
- [ ] **Remove tokens left unreferenced after reconciliation** — layer: tokens. Grep every `--st-code-inline-bg-dark`, `--st-code-inline-bg-dark-maroon`, `--st-code-inline-border-dark-maroon` reference; delete from `tokens/source/tokens.json` any that end up with zero references, run `pnpm tokens:build`, and confirm `validate:tokens` passes (undefined-reference guard proves nothing still points at a deleted token).
- [ ] **Register/confirm the CodeBlock mirror in the drift-enforcement mechanism** — layer: tooling. Confirm whether `validate:style-mirror` covers DS component CSS mirrors or only the style-dir files; if CodeBlock is not covered, note the gap (the drift this epic fixes was invisible to automated checks — that is the real root cause).

## Phases

Single close-out (strategy b), but sequence matters: (1) make the design decision and record it; (2) reconcile both mirrors + delete dead tokens + `tokens:build`; (3) verify (validators + Human QA Walkthrough in both themes). Nothing merges until all three are done and Visual-QA-approved.

## Acceptance criteria

- [ ] The canonical CodeBlock inline-code treatment is decided and written into this doc before any CSS is edited.
- [ ] `CodeBlock.module.css` inline-code rules are byte-identical across the web and package copies (same tokens, same selector syntax) — verified by diff.
- [ ] Every token that is unreferenced after reconciliation is deleted from `tokens/source/tokens.json`; `pnpm tokens:build` regenerated both `tokens.css` files; `pnpm validate:tokens` and `--strict-colors` pass with zero errors.
- [ ] `pnpm validate:style-mirror` passes; if it does not cover CodeBlock component CSS, the gap is documented in the ship doc.
- [ ] Inline code renders with the decided treatment on a real published page in **both** `light-pink-moon` and `dark-pink-moon` (Human QA Walkthrough), with no maroon/seafoam/lime inconsistency between light and dark.
- [ ] No raw color values in either CodeBlock CSS file (`--strict-colors` clean).

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach (any page rendering PortableText body content with inline `code` marks — articles, nodes, case studies, plus any DS/Storybook CodeBlock story), and build the Human QA Walkthrough table (one example local URL per page-type, including an unchanged page as a regression guard) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type that contains inline code and datestamp it. Verify in both `light-pink-moon` and `dark-pink-moon`. Confirm the Storybook `CodeBlock` story renders on both themes.

## Technical notes

- **Content Write Gate:** not triggered — no content/copy is written; this is CSS + token reconciliation.
- **Schema changes:** none.
- **Upstream dependencies:** SUG-211 (shipped v0.28.6) — this epic assumes the Option E global inline-code reassignment is already on `main`. Do not start until SUG-211 is on `origin/main`.
- **Activation audits:**
  - `grep -rn "code-inline-bg-dark\|code-inline-bg-dark-maroon\|code-inline-border-dark-maroon" apps packages` — enumerate every reference before deleting any token.
  - Read both `CodeBlock.module.css` copies in full and diff them to catch any drift beyond the inline-code block (block bg, shadow, line-numbers, selectors).
  - Read `apps/web/scripts/validate-style-mirror.js` to confirm whether DS component CSS mirrors are in its coverage set or only the 6 style-dir files.
  - Confirm the repo-canonical dark-theme selector form (`[data-theme~="dark-pink-moon"]` vs `[data-theme="dark-pink-moon"]`) by grepping usage counts across both packages.
- **Token cleanup risk:** `--st-code-inline-bg-dark` is currently the SUG-211 audit-correction case — it is referenced by the package CodeBlock mirror only. It becomes safe to delete **only after** that reference is removed or repointed during reconciliation. Delete tokens last, after the CSS no longer references them, then `tokens:build` + `validate:tokens`.
- **Model & Mode [REQUIRED]:** `/model sonnet` — bounded DS CSS + token reconciliation following an established pattern (the SUG-211 token-first pipeline). The only non-mechanical step is the maroon-vs-seafoam design decision, which is a single call recorded up front, not architecture ambiguity.

## Model & Mode [REQUIRED]

`/model sonnet` — same reasoning as above: scoped two-file CSS reconciliation + token deletion via the existing token pipeline, no cross-component architecture work.

## Non-Goals

- **Does not change the global `:not(pre) > code` inline-code treatment** (SUG-211's Option E) — that is the reference, already shipped.
- **Does not change `CodeBlock`'s code-block (`.block`, `pre`) styling, line-numbers, or shadows** — scope is the inline (`.inline`) variant only, unless the mirror diff reveals block-level drift, in which case reconciling it is in scope but restyling it is not.
- **Does not add new inline-code visual states** — this is consolidation, not expansion.
- **Does not touch the glossary annotation trigger** (`--st-glossary-annotation-*`, SUG-211) — separate concern.

## Related

- **Linear:** [SUG-212](https://linear.app/sugartown/issue/SUG-212)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **SUG-211** (`docs/shipped/SUG-211-glossary-chip-abbreviation-preference.md`) — the epic that surfaced this drift and deliberately deferred the orphan-token cleanup; see its close-out summary for the exact deviation note.
