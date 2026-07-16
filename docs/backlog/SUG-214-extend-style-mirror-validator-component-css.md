---
**Epic:** SUG-214 — Extend style-mirror validator to cover DS component CSS mirrors
**Linear Issue:** [SUG-214](https://linear.app/sugartown/issue/SUG-214)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-214 — Extend style-mirror validator to cover DS component CSS mirrors

Extend `validate-style-mirror.js` (or add a sibling check) so DS **component** `.module.css` mirrors are compared for byte-identity between `apps/web` and `packages/design-system`, not just the six style-dir files.

## Background

- **Current state:** `apps/web/scripts/validate-style-mirror.js` has a hard-coded `MIRRORED` array of exactly six files (`tokens.css`, `theme.pink-moon.css`, `theme.light.css`, `theme.shop.css`, `globals.css`, `utilities.css`) under the two `styles/` dirs. DS **component** CSS mirrors (e.g. `CodeBlock.module.css`, `IndexCell.module.css`) are governed only by a manual "drift rule" in the CLAUDE.md Mirrored File Registry — nothing automated compares them.
- **Why now:** SUG-212 found the `CodeBlock.module.css` web↔package pair had silently drifted across 7 areas (inline-code colours, block radius, a missing `.mermaid .pre` variant, `overflow` behaviour, and `[data-theme=]` vs `[data-theme~=]` selectors). It survived invisibly because CI never diffed it. The manual drift rule is not a control.
- **Reference surfaces:** `apps/web/scripts/validate-style-mirror.js`, the two component dirs `apps/web/src/design-system/components/**` ↔ `packages/design-system/src/components/**`, the pre-commit hook that runs `validate:style-mirror`, and the CLAUDE.md Mirrored File Registry table.

## Objective

After this epic, a CI/pre-commit check compares every DS component `.module.css` file that exists in both `apps/web/src/design-system/components/**` and `packages/design-system/src/components/**` and fails on any byte difference, with a clear per-file report matching the existing style-mirror output. A newly-introduced drift (like SUG-212's) is caught at commit time, not discovered epics later. Layers touched: **tooling only** (a Node validation script + its pre-commit wiring) and **docs** (Mirrored File Registry). No component CSS, tokens, schema, or render logic change.

## Scope

- [ ] **Pair-discovery logic** — layer: tooling. Enumerate component `.module.css` files present in both trees. Handle the directory naming/case mismatch (web `components/codeblock/CodeBlock.module.css` vs package `components/CodeBlock/CodeBlock.module.css`) — match by filename, not by path, or via an explicit pair map. Decide and document which (auto-glob vs explicit registry) at activation.
- [ ] **Byte-identity diff + report** — layer: tooling. For each discovered pair, compare bytes and emit a pass/fail line per file, mirroring the existing `validate-style-mirror.js` output format. Non-zero exit on any drift.
- [ ] **Decide: extend vs sibling script** — layer: tooling. Either grow the existing `MIRRORED`/loop in `validate-style-mirror.js` to include component pairs, or add a `validate:component-mirror` script. Wire whichever into the same pre-commit hook that runs `validate:style-mirror` today.
- [ ] **Handle intentional non-mirrored files** — layer: tooling. Some component CSS may legitimately exist in only one tree (web-only adapter styles). The check must not false-positive on files that have no counterpart; only *pairs that exist in both* are compared. Document how a deliberately one-sided file is expressed.
- [ ] **Register coverage in CLAUDE.md** — layer: docs. Update the Mirrored File Registry so the enforcement mechanism column reads the new automated check instead of "drift rule (manual)".

## Phases

Single-phase (all bullets are the one tooling change + its doc update). Ships as one commit + one mini-release.

## Acceptance criteria

- [ ] Running the check with the trees in sync passes with a per-pair report.
- [ ] Introducing a one-byte difference into any component `.module.css` pair (temporarily, as a test) makes the check fail with a non-zero exit and names the drifted file. Revert the test change before commit.
- [ ] The check is wired into the pre-commit hook and runs alongside `validate:style-mirror`.
- [ ] A component CSS file that exists in only one tree does not cause a false failure.
- [ ] The CLAUDE.md Mirrored File Registry row for DS component CSS mirrors names the automated check.
- [ ] `pnpm validate:style-mirror` (and the new/extended check) pass on a clean tree.

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. This epic changes a Node validation script and its pre-commit wiring only; there is no rendered surface to walk through.

## Technical notes

- **Content Write Gate:** not triggered — no content/copy.
- **Schema changes:** none.
- **Upstream dependencies:** none. SUG-212 (shipped v0.28.7) already made the CodeBlock pair identical, so the new check should pass immediately on the current tree — a good first proof it works without flagging pre-existing drift.
- **Activation audits:**
  - Read `apps/web/scripts/validate-style-mirror.js` in full to understand the `MIRRORED` loop, path resolution, and output format before extending it.
  - `find apps/web/src/design-system/components packages/design-system/src/components -name '*.module.css'` and diff the two lists to enumerate real pairs, one-sided files, and any case/naming mismatches before writing discovery logic.
  - Confirm the pre-commit hook entry that invokes `validate:style-mirror` (Husky/lint-staged or the repo's hook script) so the new check is wired into the same gate.
- **Model & Mode [REQUIRED]:** `/model sonnet` — a self-contained Node script change plus a docs update, following the existing `validate-style-mirror.js` pattern. No architecture ambiguity.

## Model & Mode [REQUIRED]

`/model sonnet` — bounded tooling script + doc update, mirrors an existing validator's structure.

## Non-Goals

- **Does not reconcile any existing drift** — SUG-212 already fixed CodeBlock; if the enumeration surfaces *other* drifted component pairs, list them for follow-up tickets rather than fixing them here (fixing drift is per-component design work, not this tooling epic's scope).
- **Does not cover non-CSS mirrors** (JSX/adapter mirrors) — scope is `.module.css` only.
- **Does not change the six style-dir file checks** — those already work; this only adds component coverage.
- **Does not add auto-fix/auto-sync** — the check reports and fails; reconciliation stays a human decision (which copy is canonical is a per-file call).

## Related

- **Linear:** [SUG-214](https://linear.app/sugartown/issue/SUG-214)
- **Epic template:** `docs/epic-template.md` — complete Files to Modify at activation time
- **SUG-212** (`docs/shipped/SUG-212-codeblock-inline-code-mirror-reconciliation.md`) — the reconciliation that surfaced this gap; its close-out summary names the root cause this epic closes.
