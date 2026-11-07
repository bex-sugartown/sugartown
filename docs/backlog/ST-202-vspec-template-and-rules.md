---
**Epic:** ST-202 — Vspec template and rules: light and dark, Pink Moon prototype, decisions log
**Issue:** [#202](https://github.com/bex-sugartown/sugartown/issues/202)
**Status:** In Progress
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-202-vspec-template-and-rules.vspec.html`
---

# ST-202 — Vspec template and rules: light and dark, Pink Moon prototype, decisions log

A versioned vspec template and a short rules spec, so every vspec shows both themes, is built on Pink Moon, and records the decisions and governance checks that applied to it.

## Background

Vspecs are written by hand each time. The #201 carousel vspec worked well because it showed the prototype, the before and after, the six nav annotations, measured contrast, the class naming table, the component choice audit, and a decisions-answered section. Nothing makes the next vspec do the same. Today a vspec shows one theme only (#201 had no light view until Bex asked), uses ad hoc colours instead of Pink Moon tokens, and lives in the gitignored `docs/drafts/`, so no template survives. Related open issues: #104 (vspecs do not survive their epic) and #156 (the design-reviewer passes vspec elements it never rendered). Affects `docs/conventions/`, the Phase 0 gate text, and `/new-epic`.

## Objective

After this epic there is one template file and one rules doc that a session copies when it starts Phase 0. The template renders in light and dark with a visible theme toggle, takes its colours, type, spacing and radius from the Pink Moon tokens (`theme.pink-moon.css` plus `tokens.css`), and has fixed sections for: prototype, before and after, behaviour annotations, measured contrast per theme, class naming table, component choice audit, token list, decisions answered (with date), and the Phase 0 checklist. Layers touched: docs and a static HTML template. No Sanity schema, GROQ, React or site CSS. Rule-file edits (the gate text, `CLAUDE.md` pointer, `/new-epic`) go through the Instruction & Rule File Write Gate.

## Metadata plan

Not applicable, no content piece.

## Scope

- [x] Phase 0: vspec for the template itself (this epic's own vspec, showing the template layout in both themes), approved by Bex — layer: vspec
- [x] `docs/conventions/vspec-template.html`: the copyable template, light and dark toggle, Pink Moon tokens only, one interactive-prototype slot — layer: docs
- [x] `docs/conventions/vspec-rules.md`: what a vspec must contain, when it becomes interactive, class names equal production names, decisions-answered section, evidence per claim, where finished vspecs go, and the **true representation rule**: a Before is a dated real screenshot or a render of the live component, never a hand-built mock; a prototype shows whatever the change touches, whole: a page layout, a section, a component, a style or a token (for a carousel: arrows, dots, caption and the peek slides, not the image alone); a state that is not live today is never shown as Before; every Before and After carries a BEFORE or AFTER tag (Bex, 2026-11-06, from #205, where a hypothetical Before panel showed buttons and a counter that do not exist) — layer: docs
- [x] Contrast section rule: each text pair measured in both themes, with the command that produced the figure — layer: docs
- [x] Pointer from `CLAUDE.md` §Phase 0 visual spec gate and from the `/new-epic` stub (`**Vspec:**` line) to the template — layer: rule file (gate applies)
- [x] Design-reviewer note: the review table must cite which template sections it checked and which it could only read as text (the agent has no browser, so look-dependent rows read "not rendered" until the orchestrating session renders them), to address #156 — layer: agent definition (gate applies)

## Phases

| Phase | Ships at the end | Gate | Done |
|---|---|---|---|
| 0 | Phase 0 vspec for the template (first Scope item) | Bex sign-off on the vspec | [x] 2026-11-07 |
| 1 | The template file, `docs/conventions/vspec-template.html` (second Scope item) | Rule-file diff approval (`docs/conventions/**`) | [x] 2026-11-07 |
| 2 | Rules doc and contrast section rule (third and fourth Scope items) | Rule-file diff approval (`docs/conventions/**`) | [x] 2026-11-07 |
| 3 | The `CLAUDE.md` and `/new-epic` pointers and the design-reviewer note (fifth and sixth Scope items) | Rule-file diff approval, one diff per file | [x] 2026-11-07 |

Each phase's no-approval work (writing the draft to a scratchpad copy, producing the diff) runs first; the stop is at the diff.

## Acceptance Criteria

- [x] `docs/conventions/vspec-template.html` opens in a browser, shows a theme toggle, and renders every section in both light and dark with no raw colour values (`pnpm validate:tokens --strict-colors` does not scan it, so the check is a grep for `#` and `rgb` in the file, run and quoted). Evidence 2026-11-07: `grep -n -E "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsl"` returned none; served over a local server, the toggle moved `data-theme` from `light-pink-moon` (canvas `rgb(242, 242, 243)`) to `dark-pink-moon` (canvas `rgb(13, 18, 38)`), 10 section headings, 2 stylesheets loaded.
- [ ] The template loads `tokens.css` and `theme.pink-moon.css` from the repo by relative path, and no colour, font or spacing value is defined locally.
- [ ] A copy of the template, filled in with the #201 carousel content, reproduces the #201 vspec sections one for one.
- [ ] The template's Before slot holds an image file and a capture date, not hand-built markup; the rules doc states that a Before is a real screenshot or a live render and that a prototype shows whatever the change touches, whole: a page layout, a section, a component, a style or a token (the #205 Before and #201 prototype are the two worked examples of getting it wrong).
- [x] `docs/conventions/vspec-rules.md` follows `instruction-writing-style.md` and the banned-words check returns nothing. Evidence 2026-11-07: the banned-words grep (plus em dash, "just", "simply", "obviously") returned none on the draft and the saved file.
- [x] `CLAUDE.md` and `/new-epic` point at the template, with the exact diff approved before the edit.
- [x] The followability walkthrough findings table is in each rule-file commit body (4d97f2fd, b31f8b74, d7118f59 and the Phase 3 commit).

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. The template is a static file under `docs/conventions/`, not rendered by the site.

## Technical notes

- **Content Write Gate:** does not fire; no Sanity writes.
- **Schema changes:** none.
- **Upstream dependencies:** none blocking. Activation audit: read #104 and #156 and state whether this epic closes, narrows or leaves each. The #201 vspec is the reference implementation and is not changed by this epic.
- **Activation audits:** read `docs/drafts/ST-201-image-carousel-controls-and-caption-legibility.vspec.html` and list each section it has; read `apps/web/src/design-system/styles/theme.pink-moon.css` light and dark blocks and list the semantic tokens the template will use (trace the dark block, it overrides surfaces with `rgba()`); read `.claude/agents/design-reviewer.md` and `docs/conventions/vqa-workflow.md` for what the reviewer reads today.
- **Where the template lives:** `docs/conventions/` is tracked, `docs/drafts/` is gitignored, so the template goes in conventions and each epic's filled copy goes in drafts. Finished vspecs still move to `docs/shipped/` at close-out per `CLAUDE.md` step 6b.
- **Building a mechanism:** no validator or generator in this epic. The readers of the template are the Phase 0 gate and the design-reviewer, both named above. A check that every vspec uses the template is a possible follow-up and is declined here.
- **Rule-file edits:** `docs/conventions/**`, `CLAUDE.md`, `.claude/agents/` edits each need the diff shown from a scratchpad copy and approved first.

## Model & Mode [REQUIRED]

`/model sonnet`: HTML template and convention docs, no architecture decision.

## Non-Goals

- No validator, generator or CI step for vspecs.
- No retrofit of existing vspecs in `docs/drafts/` or `docs/shipped/`.
- No change to the Phase 0 gate rules themselves beyond adding the pointer.
- No React, Storybook or site CSS. #104 (making vspecs survive their epic) stays its own issue.

## Related

- **GitHub:** [#202](https://github.com/bex-sugartown/sugartown/issues/202)
- Related: [#104](https://github.com/bex-sugartown/sugartown/issues/104), [#156](https://github.com/bex-sugartown/sugartown/issues/156), [#201](https://github.com/bex-sugartown/sugartown/issues/201), [#195](https://github.com/bex-sugartown/sugartown/issues/195)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
