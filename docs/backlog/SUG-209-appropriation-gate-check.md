---
**Epic:** SUG-209 — Appropriation Gate Check
**Linear Issue:** [SUG-209](https://linear.app/sugartown/issue/SUG-209)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-209 — Appropriation Gate Check

Add a check that flags when Sugartown-published content (articles, nodes, case studies, glossary terms) reuses a named third party's proprietary framework, methodology, branded term, or copyrighted structure without attribution or license.

## Background

This surfaced as a bare parking-lot note during the `/red-pen` review of the node "The Control Group Kept Taking the Medicine" (2026-07-15) — Bex flagged "APPROPRIATION GATE CHECK" as a future feature with no scope beyond the name. At activation of this epic, Bex confirmed the scope: **third-party IP/content reuse** specifically (not voice/identity appropriation, and not cultural/stylistic appropriation — both explicitly excluded, see Non-Goals).

The gap this closes: Sugartown already has an Attribution principle (`docs/briefs/ai-ethics-and-operations.md` Principle 11, "Attribution Matters" — *"If a model trained on scraped data produces something suspiciously specific, verify provenance. Generators aren't citation engines."*) and an existing citation mechanism (`citationRef` markDefs, `sources[]` on `glossaryTerm`), but no check actually enforces the principle before publish. A named methodology, maturity model, or branded framework could land in an article or case study, presented as Sugartown's own thinking, with nothing catching it. The Content Write Gate (CLAUDE.md) governs *whether* AI-derived copy gets a human sign-off; this epic governs a specific *class* of thing that sign-off should be checking for and currently isn't named as a check item.

## Objective

After this epic: a defined, documented check for unattributed third-party framework/methodology/branded-term reuse, wired into the existing editorial tooling (most likely as a new red-pen pass or an extension of Pass 1 Accuracy — to be decided at Phase 1, see Scope), plus a one-time retrofit audit of already-published content against that check. This epic does **not** build a real-time CI scanner or an automated pre-publish blocker — see Non-Goals.

Layers touched: red-pen skill (`.claude/skills/red-pen/SKILL.md`), possibly Sanity schema (`apps/studio/schemas/objects/citationItem.ts` — only if the activation audit finds the existing citation mechanism insufficient), published content (retrofit audit, content edits via the standard Content Write Gate flow), and `docs/briefs/ai-ethics-and-operations.md` (cross-reference only, no rewrite).

## Scope

- [ ] **Define what counts as "in scope"** — layer: governance/content. Write a one-paragraph working definition distinguishing ordinary tool-name mentions (e.g. "built on Shopify," "uses MACH principles" — taxonomy, not appropriation) from adopting a *named person's or org's* proprietary framework/methodology/maturity model/branded term as if it were original Sugartown thinking. This must be approved by Bex before Phase 2 begins; it is the single most important open question in this epic and should not be guessed.
- [ ] **Decide the detection mechanism** — layer: tooling. Activation audit: read `.claude/skills/red-pen/SKILL.md` Pass 1 (Accuracy) and Pass 2 (Voice compliance) in full, then decide whether this check is (a) a new Pass 1.5/2.5 in red-pen, (b) folded into the existing Accuracy pass's "unverifiable claims" handling, or (c) a standalone pre-publish checklist item outside red-pen entirely. Document the decision and why.
- [ ] **Assess whether the existing citation mechanism is sufficient** — layer: schema. Activation audit: read `apps/studio/schemas/objects/citationItem.ts` and the `citationRef` markDef config in `apps/studio/schemas/objects/portableTextConfig.ts`. Determine whether flagging a third-party framework requires a new field (e.g. an attribution/license-status note on `source`) or whether `citationRef` + `sources[]` already covers it once the check tells an editor to add one.
- [ ] **Wire the check into red-pen** — layer: red-pen skill. Once the mechanism from the prior bullet is decided, add the check to `.claude/skills/red-pen/SKILL.md` per that decision, following the same current → proposed → why finding format as existing passes. Add at least one eval fixture (`.claude/skills/red-pen/evals/fixtures/`) planting an unattributed third-party framework, so the check is tested the same way gate-discipline and show-don't-tell are.
- [ ] **Retrofit audit of published content** — layer: content. Activation audit: query all published `article`, `caseStudy`, and `node` documents and grep/read for named third-party framework or methodology mentions (e.g. via a targeted GROQ pull of `body`/`sections` text, or a full-text read of the smaller candidate set — case studies and articles are more likely surfaces than nodes, given the register). Any finding goes through the standard Content Write Gate proposal flow (before/after table, explicit approval) — this epic does not silently patch content.
- [ ] **Cross-reference CLAUDE.md** — layer: documentation. Add a short pointer from the Content Write Gate section of CLAUDE.md to the new check, so the two composing gates (write-time approval, and this attribution check) are discoverable from either direction.

## Acceptance criteria

- [ ] A written, Bex-approved definition of what counts as in-scope third-party IP/content reuse exists (in this epic doc or `docs/brand/brand-voice-guide.md`), distinguishing it from ordinary tool/platform name mentions
- [ ] The detection mechanism decision (new pass vs. folded into Accuracy vs. standalone checklist) is documented with a stated rationale
- [ ] `.claude/skills/red-pen/SKILL.md` contains the check, with at least one passing eval fixture demonstrating detection and non-false-positiving on ordinary tool mentions
- [ ] The retrofit audit of published articles/case studies/nodes is complete; any findings are surfaced via the Content Write Gate proposal flow (before/after table shown, explicit approval obtained) before any patch — "it works" is not sufficient, the audit's findings list (even if empty) must be recorded in this epic's close-out
- [ ] CLAUDE.md's Content Write Gate section cross-references this check

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. This epic is editorial tooling and content governance, not a rendered surface.

## Technical notes

- **Content Write Gate**: this epic composes with, and extends discoverability of, CLAUDE.md's existing Content Write Gate. It does not replace it — the gate rule for content writes (before/after proposal + explicit approval) still applies to every patch this epic's retrofit audit produces.
- **Schema changes**: unresolved — see the "Assess whether the existing citation mechanism is sufficient" scope bullet. Do not add a new schema field speculatively; decide from the activation audit.
- **Upstream dependencies**: none blocking. Composes with the red-pen show-don't-tell/theme-discipline update (2026-07-15, same session that surfaced this parking-lot note) as prior art for "how to add a new pass to red-pen with an eval fixture." **Cross-referenced with SUG-210 (Content Pipeline Rules Consolidation)** — not blocking, but if SUG-210 has shipped by the time this epic activates, the "Wire the check into red-pen" scope bullet should target SUG-210's shared write-time-rules doc directly instead of patching `write-node-prompt.md`/`write-blog-prompt.md`/`write-casestudy-prompt.md`/`glossy-prompt.md` separately.
- **Activation audits** (do these before writing anything):
  1. Read `docs/briefs/ai-ethics-and-operations.md` in full, particularly Principle 11 ("Attribution Matters") and the "Licensing & Copyright" section, before drafting the in-scope definition.
  2. Read `.claude/skills/red-pen/SKILL.md` Pass 1 and Pass 2 in full to decide the detection-mechanism question.
  3. Read `apps/studio/schemas/objects/citationItem.ts` and the `citationRef` markDef in `apps/studio/schemas/objects/portableTextConfig.ts` before deciding on schema changes.
  4. Query published `article`, `caseStudy`, and `node` documents to scope the real size of the retrofit audit before committing to "audit everything" as a single scope bullet — if the corpus is large, this may need its own phase.
- **Model & Mode [REQUIRED]:** `/model sonnet` — this is a documentation/tooling/content-governance epic (defining a check, wiring it into an existing skill, a retrofit content audit), not an architecture epic. Sonnet 5 executes directly, no plan-mode handoff.

## Model & Mode [REQUIRED]

`/model sonnet` — same reasoning as above. No SSR, monorepo-boundary, or schema-ERD complexity here; the hardest part is the editorial judgment call in the first scope bullet, which is a human decision (Bex's), not a modeling decision.

## Non-Goals

- **Voice/identity appropriation** (AI-drafted content claiming firsthand experience, credentials, or lived events that didn't happen) — explicitly excluded from this epic per Bex's scoping decision at activation. May become its own future epic; do not fold it in here.
- **Cultural/stylistic appropriation** (borrowed aesthetic, dialect, or symbolism without context) — same, explicitly excluded.
- **Automated real-time scanning or a CI gate** — this epic defines the check and performs a one-time retrofit audit. Wiring it into an automated pre-publish blocker (if ever wanted) is separate, larger scope and not assumed here.
- **Rewriting `docs/briefs/ai-ethics-and-operations.md`** — this epic cross-references Principle 11, it does not revise the ethics doc itself.

## Related

- **Linear:** [SUG-209](https://linear.app/sugartown/issue/SUG-209)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **Prior art (same-session):** red-pen show-don't-tell + theme discipline update, 2026-07-15 — reference for "how to add a new pass to `.claude/skills/red-pen/SKILL.md` with a matching eval fixture"
- **`docs/briefs/ai-ethics-and-operations.md`** — Principle 11 ("Attribution Matters") is this epic's ethical grounding
- **`docs/reviews/red-pen/2026-07-15-the-control-group-kept-taking-the-medicine.md`** — origin of the parking-lot note
- **SUG-210** (`docs/backlog/SUG-210-content-pipeline-rules-consolidation.md`) — cross-referenced, not blocking; consolidates the write-\* prompt files this epic's mechanism decision would otherwise patch separately
