---
**Epic:** ST-183 — AiLabel: rename to a use-case-neutral image overlay
**Issue:** [#183](https://github.com/bex-sugartown/sugartown/issues/183)
**Status:** Done
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** no (names change, not the look; Chromatic must show zero visual change)
---

# ST-183 — AiLabel: rename to a use-case-neutral image overlay

`AiLabel` and `.aiLabel` are named for their use case. Since ST-181 the look is a `Chip` variant; this renames the positioning wrapper that remains to a neutral name and moves the AI wording to the caller. No visual change.

## Background

SUG-178 built `AiLabel` as its own component, and ST-181 rebuilt its look as `Chip variant="badge" tone="inverse" size="fluid"`. The wrapper that is left (placement on the image, width tiers, the expand-on-hover detail, the `frame` layer) is still named for one use case. That breaks two rules that already existed: CLAUDE.md §Phase 0 visual spec gate ("never name a class after its content type") and `.claude/rules/react.md` §Component choice gate, variant-first rule. Found in the 2026-10-31 post-mortem (G1), where Bex pointed out the rules were there and were not applied. Reference surfaces: the DS package, the web app's image surfaces (inline images, hero, cards, gallery, lightbox), and the stamping tool that reads the label's CSS.

## Objective

After this epic, the image-overlay wrapper has a use-case-neutral component name, class names and props (text and detail supplied by the caller), and every AI-specific word lives in the caller: the web app passes "AI" / "AI-generated" / the tool name. Rendered output is pixel-identical. Layers touched: DS component and stories, web app callers, `scripts/ai-provenance/` (spec and drift test read the label's CSS), docs that name the component. Not touched: Sanity schema field names (`aiGenerated`, `aiTool`, `provenanceFiles` are data, correctly named for what they record), GROQ, content.

## Metadata plan

Not applicable, no content piece.

## Scope

- [x] **Naming decision (Phase 0, approved 2026-10-31 by Bex: `MediaLabel`; DS takes a label object from the caller)** — propose the component name, class names and prop names in the CSS class naming proposal table (`.claude/rules/css-layout.md`) and get sign-off. Candidates to weigh, not decided: `MediaLabel`, `ImageOverlayLabel`. The content-type rule applies to every proposed name. — layer: design
- [x] **DS component (done)** — rename `packages/design-system/src/components/AiLabel/` (component, CSS module, index, stories) to the approved name; props become generic (`text` per width tier, optional `detail`, `frame`, `interactive`); `toolLabel` and the AI tool map move out of the DS. Keep a deprecated `AiLabel` re-export for one release only if the Phase 0 audit finds an outside consumer. — layer: Design System
- [x] **Callers (done; `aiLabelProps` and `aiMediaProps` in `apps/web/src/lib/provenance.js`)** — `Media`, `Card`, `PageSections.jsx` (hero), `ImageLightbox.jsx`, `apps/web/src/design-system/index.js`, `packages/design-system/src/index.ts`, `Hero.stories.tsx`: pass the AI wording and tool name from the web app. — layer: frontend
- [x] **Stamping tool (done; 21 tests pass)** — `scripts/ai-provenance/test_stamp.py` reads `AiLabel.module.css` and `AiLabel.tsx` by path; repoint to the new files. `label-spec.json` comment and `stamp.py` docstring updated. `pnpm validate:ai-provenance` passes. — layer: tooling
- [x] **Docs (done: workflow doc and registry row; `docs/diagrams/README.md` and `docs/ai/ai-generated-images.md` never named the component, so unchanged)** — `docs/workflows/ai-image-provenance.md`, `docs/diagrams/README.md` rule 4, `docs/ai/ai-generated-images.md`, `docs/conventions/component-registry.md` (if it lists AiLabel): name the new component. Rule-defining files go through the diff-approval gate. — layer: docs
- [x] **Stories (done: the four stories renamed to Components/MediaLabel, none added)** — one story per variant (`.claude/rules/storybook.md`): the renamed component keeps the four consolidated stories; no story added for the rename. — layer: Storybook

## Phases

Single phase, after the Phase 0 naming sign-off.

## Acceptance Criteria

- [x] No component, class, prop or file in `packages/design-system/src/` contains "ai" as a use-case word. Evidence: `grep -rn -i -E "AiLabel|aiLabel" packages/design-system/src apps/web/src scripts` returns only data fields (`aiGenerated`, `aiTool`) and the deprecated re-export if one is kept. Result 2026-10-31: only the "Renamed from AiLabel" comments and the web helper `aiLabelProps`; no re-export was needed (no outside consumer).
- [x] Chromatic shows zero visual changes on every story. Evidence: build 107, 4 changes, all four the renamed MediaLabel stories under new IDs, reviewed and accepted by Bex; story count unchanged at 391.
- [x] The web app renders the same label on inline images, hero, cards, gallery and lightbox. Evidence: the sizes measured in ST-181 (129.7 x 25.8 at 480 px) re-measured in Storybook, and the lightbox checked on the case study page. Result: identical at every width (129.7 x 25.8, 95.4 x 19.4, 84.1 x 17.3, 24.7 x 17.3, hidden at 80 px); case study shows the hero label and four inline labels (130 px wide), lightbox label at 17 px inset; cards show no detail and are not focusable.
- [x] `pnpm validate:ai-provenance`, `pnpm --filter web lint`, `pnpm validate:tokens` and `pnpm test:smoke` pass locally. Result: 21 tests, lint clean (one pre-existing warning in Card.tsx), tokens and style mirror green, `pnpm test:smoke` 13 passed.
- [x] Phase 0 naming table approved before any file is renamed (2026-10-31).

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

The case study `/case-studies/sugartown-platform-is-the-portfolio` has flagged inline, hero and diagram images and is the main regression page.

## Technical notes

- **Content Write Gate:** does not fire; no content changes.
- **Schema changes:** none. `aiGenerated`, `aiTool`, `aiToolVersion`, `provenanceFiles` stay: they name data, not a component.
- **Upstream dependencies:** none blocking. Activation audit: `grep -rln -E "AiLabel|aiLabel" apps packages scripts docs` (excluding `node_modules`, `dist`, `storybook-static`) for the full file list, and confirm no in-flight epic in `docs/backlog/` edits `Media.tsx`, `Card.tsx` or `ImageLightbox.jsx`.
- **Existing-system check (start review):** confirm whether anything outside this repo imports `AiLabel` from the DS package before deciding on a deprecated re-export.
- **Model & Mode:** see below.

## Model & Mode [REQUIRED]

`/model sonnet` — a mechanical rename across known files with a fixed visual contract; the one judgement call (the name) is made at Phase 0 sign-off.

## Non-Goals

- No visual or behaviour change. Any pixel difference in Chromatic is a defect, not a design change.
- No schema or content change; the AI data fields keep their names.
- No new variant on `Chip`.

## Related

- **GitHub:** [#183](https://github.com/bex-sugartown/sugartown/issues/183)
- **Origin:** post-mortem 2026-10-31, G1; ST-181 (`docs/shipped/ST-181-ai-image-provenance-compliance-gaps.md`) built the Chip variant
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time

---

## Close-out review

### Acceptance criteria

All five met, evidence beside each above. Close-out steps: 2 (schema) N/A, no schema change; 3 (Visual QA gate) N/A, no vspec and every visual element verified in the browser during implementation (sizes, fill, cards, lightbox above); 4 (Chromatic) run, build 107 approved; 5 and 5b N/A.

### What didn't work

- The registry row was written with code formatting (backticks) around paths and prop names; the text Bex approved at Phase 0 was the same words without it. Recorded rather than silently accepted.
- Renamed story files register as new stories in Chromatic, so a pure rename still costs four accepted baselines.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Card's older `aiTool` prop (the "AI: tool" footer line) is also AI-named in the DS API | implementation | declined: it names data (which agent drafted a card), the same way `aiGenerated` names data on the schema; rename only if that footer becomes a generic slot |

### Friction line

none

---

## Post-ship checks

- [ ] The labels on the live case study page and its lightbox still show after the next ship: session: open `/case-studies/sugartown-platform-is-the-portfolio` on sugartown.io, measure a label (130 px wide at desktop width) and open one lightbox.

