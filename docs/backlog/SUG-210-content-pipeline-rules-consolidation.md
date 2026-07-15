---
**Epic:** SUG-210 — Content Pipeline Rules Consolidation
**Linear Issue:** [SUG-210](https://linear.app/sugartown/issue/SUG-210)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-210 — Content Pipeline Rules Consolidation

Extract the write-time rules currently duplicated across `write-node-prompt.md`, `write-blog-prompt.md`, `write-casestudy-prompt.md`, and `glossy-prompt.md` into a single shared doc. Each write-\* prompt keeps only its register-specific voice delta ("the blah" — node/blog/casestudy/glossy) and references the shared doc instead of repeating it.

## Background

This surfaced directly out of SUG-209 (Appropriation Gate Check) scoping, and the same session produced live proof of the problem: the 2026-07-15 red-pen show-don't-tell update was patched into `write-node-prompt.md` and `write-blog-prompt.md`, and `write-casestudy-prompt.md` was missed on the first pass — caught only because Bex asked "has write-casestudy been updated with all this new stuff since it is newer?" A grep run during that catch confirmed the shape of the problem is not hypothetical:

- The banned-vocabulary list (`leverage`, `utilize`, `delve into`, `facilitate`, `synergize`, `ideate`, `learnings`, `passionate about`, `excited to announce`, `in today's landscape`, `robust`, `scalable`, `seamless`, `cutting-edge`, `game-changing`, `innovative`, `unlock`) is byte-identical, copy-pasted, in `write-node-prompt.md` and `write-casestudy-prompt.md`'s Step 2.5 sections, and repeated in abbreviated form in `write-blog-prompt.md`.
- "Step 2.6 — Disclosure & attribution" is structurally identical across `write-node-prompt.md`, `write-blog-prompt.md`, and `write-casestudy-prompt.md`: same heading, same citation of `docs/briefs/ai-ethics-and-operations.md` Principles 3/11/13, same EU AI Act Article 50 reference, same "Tools field as attribution" closing pattern — with only the register-specific `aiDisclosure` string options differing.
- Step 0's "read the voice guides" reading list, the skim-skeleton self-check, and (as of this session) the show-don't-tell self-check follow the same pattern: one canonical idea, independently copied into three-to-four files, with no mechanism forcing them to stay in sync.

Every future rule added to "how write-time drafting works" (this epic's own motivating example, plus SUG-209's eventual attribution check) has to be manually threaded through 3-4 files by hand, and the write-casestudy miss shows that "manually" reliably fails at least once per update.

## Objective

After this epic: one shared doc (working name `docs/write-pipeline-prompt.md`, confirm final name during Phase 1) holds every register-agnostic write-time rule — the anti-slop/banned-vocabulary checklist, disclosure & attribution mechanics, Content Write Gate composition, skim-skeleton self-check, show-don't-tell self-check, and (once SUG-209 lands) the appropriation/attribution check. Each `write-*-prompt.md` file is rewritten to reference the shared doc for those rules and retains only what's genuinely register-specific: node's forensic arc + TL;DR voice, blog's Bex-first-person plain-language register, case study's outcome-tile-as-table pattern + enterprise-deck-phrasing ban, glossy's cheeky/succinct two-gate register.

This epic does not change what any rule *says* — only where it lives. If a rule's content itself needs to change, that's a separate brand-voice-guide or node-style-guide edit, not in scope here.

Layers touched: documentation only (`docs/write-*-prompt.md`, new shared doc, `.claude/skills/red-pen/SKILL.md`'s Step 2 register table if it needs to point at the new doc). No schema, no frontend, no Sanity content.

## Scope

- [ ] **Full duplication audit** — layer: documentation. Read all four files in full, side by side (the grep in Background found Step 0/2.5/2.6 overlap; a full read may surface more, e.g. taxonomy pre-flight patterns in each file's Step 1). Produce a table: rule → which files currently have it → proposed canonical location (shared doc vs. stays register-specific).
- [ ] **Design the shared doc's structure** — layer: documentation. Draft `docs/write-pipeline-prompt.md` (or the name agreed after the audit) containing every rule marked "shared" in the audit table. Confirm it doesn't duplicate `docs/brand/brand-voice-guide.md` or `docs/brand/master-voice-cheatsheet.md` — those stay canonical for tone/voice; this new doc is canonical for write-time *mechanics* (gates, disclosure, self-checks) that currently live redundantly inside each write-*-prompt.md.
- [ ] **Rewrite each write-\*-prompt.md to reference, not repeat** — layer: documentation. `write-node-prompt.md`, `write-blog-prompt.md`, `write-casestudy-prompt.md`, `glossy-prompt.md` each get their shared-rule sections replaced with a short pointer to the new doc, keeping only the register-specific delta content. Glossy's two-gate Sanity-write mechanics (`create_documents`/`publish_documents` flow) are explicitly out of scope for consolidation — only its voice/self-check rules that overlap with the other three move.
- [ ] **Update red-pen's Step 2 register table** — layer: red-pen skill. If the shared doc changes which file is canonical for a given rule, update `.claude/skills/red-pen/SKILL.md` Step 2's "Primary guide" column so review-time and write-time reference the same source.
- [ ] **Regression check** — layer: documentation. After the split, grep the new shared doc plus all four write-\*-prompt.md files for every rule identified in the audit table and confirm each exists in exactly one canonical location (not zero, not two). Present the before/after table to Bex before calling this done — silently dropping a rule during extraction is the exact failure mode this epic exists to prevent, and it would be an embarrassing way to reintroduce it.

## Acceptance criteria

- [ ] A single shared doc exists containing every register-agnostic write-time rule identified in the audit
- [ ] `write-node-prompt.md`, `write-blog-prompt.md`, `write-casestudy-prompt.md`, and `glossy-prompt.md` each reference the shared doc instead of repeating its rules; each retains only genuinely register-specific content
- [ ] The banned-vocabulary list, Content Write Gate composition note, disclosure & attribution mechanics, and skim-skeleton/show-don't-tell self-checks each exist in exactly one file — confirmed by grep, not assumed
- [ ] `.claude/skills/red-pen/SKILL.md`'s Step 2 register table is updated if the canonical-file mapping changed
- [ ] A before/after audit table (each duplicated rule → new canonical location) is presented and Bex confirms nothing was lost before this epic is marked done

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. This epic is documentation/prompt architecture only.

## Technical notes

- **Content Write Gate**: not itself changed. The shared doc becomes the canonical place documenting how write-time skills compose with CLAUDE.md's Content Write Gate — cross-reference it, don't restate it.
- **Schema changes**: none.
- **Upstream dependencies**: related to SUG-209 (Appropriation Gate Check), cross-linked in Linear, **not blocking either direction**. If SUG-209 activates before this epic ships, its "wire the check into red-pen" scope bullet should note this epic's existence and target the future shared-doc location directly rather than patching four files again — flag that explicitly in SUG-209's own doc if execution order works out that way.
- **Activation audits**:
  1. Read `write-node-prompt.md`, `write-blog-prompt.md`, `write-casestudy-prompt.md`, and `glossy-prompt.md` in full, side by side, before drafting the shared doc's table of contents.
  2. Read `.claude/skills/red-pen/SKILL.md` Step 2's register table to decide whether/how it should reference the new shared doc.
  3. Read `docs/brand/master-voice-cheatsheet.md` and `docs/brand/brand-voice-guide.md` first to confirm the boundary: those stay canonical for voice/tone; the new doc is canonical for write-time mechanics only. Do not duplicate the voice guides into the new doc.
- **Model & Mode [REQUIRED]:** `/model sonnet` — straightforward documentation refactor, no architecture ambiguity. Sonnet 5 executes directly, no plan-mode handoff.

## Model & Mode [REQUIRED]

`/model sonnet` — same reasoning as above.

## Non-Goals

- **Does not change any rule's content** — this is a de-duplication/relocation refactor. If a rule needs to change in substance (e.g. the banned-vocabulary list itself), that's a separate `brand-voice-guide.md` edit.
- **Does not fold SUG-209 into this epic** — kept as a separate, cross-referenced Linear issue (SUG-209 relatedTo SUG-210 and vice versa).
- **Does not touch glossy's two-gate Sanity-write mechanics** (`create_documents_from_json`/`publish_documents` flow, batch/ENEX parsing) — only the voice/self-check rules that overlap with write-node/write-blog/write-casestudy move to the shared doc.
- **Does not add new rules** — SUG-209's attribution check, if and when it ships, adds itself to the shared doc as its own follow-up commit, not as part of this epic's scope.

## Related

- **Linear:** [SUG-210](https://linear.app/sugartown/issue/SUG-210)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **SUG-209** (`docs/backlog/SUG-209-appropriation-gate-check.md`) — cross-referenced, not blocking; SUG-209's eventual attribution check is a natural future addition to this epic's shared doc
- **Motivating incident (same session, 2026-07-15):** red-pen show-don't-tell update patched into write-node and write-blog, missed write-casestudy on the first pass
