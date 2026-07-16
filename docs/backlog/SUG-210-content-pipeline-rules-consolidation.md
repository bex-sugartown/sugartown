---
**Epic:** SUG-210 — Content Pipeline Rules Consolidation
**Linear Issue:** [SUG-210](https://linear.app/sugartown/issue/SUG-210)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-210 — Content Pipeline Rules Consolidation

Extract the write-time rules currently duplicated across `write-node-prompt.md`, `write-blog-prompt.md`, `write-casestudy-prompt.md`, and `glossy-prompt.md` into a single shared doc. Each write-\* prompt keeps only its register-specific voice delta ("the blah" — node/blog/casestudy/glossy) and references the shared doc instead of repeating it. Also documents a verified metadata reference field matrix (categories/tags/tools/related content/glossary terms/citations) across every content type, with tiered recommendations for the gaps found.

## Background

This surfaced directly out of SUG-209 (Appropriation Gate Check) scoping, and the same session produced live proof of the problem: the 2026-07-15 red-pen show-don't-tell update was patched into `write-node-prompt.md` and `write-blog-prompt.md`, and `write-casestudy-prompt.md` was missed on the first pass — caught only because Bex asked "has write-casestudy been updated with all this new stuff since it is newer?" A grep run during that catch confirmed the shape of the problem is not hypothetical:

- The banned-vocabulary list (`leverage`, `utilize`, `delve into`, `facilitate`, `synergize`, `ideate`, `learnings`, `passionate about`, `excited to announce`, `in today's landscape`, `robust`, `scalable`, `seamless`, `cutting-edge`, `game-changing`, `innovative`, `unlock`) is byte-identical, copy-pasted, in `write-node-prompt.md` and `write-casestudy-prompt.md`'s Step 2.5 sections, and repeated in abbreviated form in `write-blog-prompt.md`.
- "Step 2.6 — Disclosure & attribution" is structurally identical across `write-node-prompt.md`, `write-blog-prompt.md`, and `write-casestudy-prompt.md`: same heading, same citation of `docs/briefs/ai-ethics-and-operations.md` Principles 3/11/13, same EU AI Act Article 50 reference, same "Tools field as attribution" closing pattern — with only the register-specific `aiDisclosure` string options differing.
- Step 0's "read the voice guides" reading list, the skim-skeleton self-check, and (as of this session) the show-don't-tell self-check follow the same pattern: one canonical idea, independently copied into three-to-four files, with no mechanism forcing them to stay in sync.

Every future rule added to "how write-time drafting works" (this epic's own motivating example, plus SUG-209's eventual attribution check) has to be manually threaded through 3-4 files by hand, and the write-casestudy miss shows that "manually" reliably fails at least once per update.

## Metadata reference field matrix (per content type)

Added at Bex's request: a writer using the shared doc needs to know not just *how* to write (voice rules) but *what's available to tag* — the metadata reference fields each content type actually supports. Audited directly against live schema files (Explore agent read, then independently spot-verified line-by-line against `apps/studio/schemas/documents/*.ts`; every cell below is grep/read-confirmed, not inferred from convention).

| Content type | categories | tags | tools | related content | glossary terms | citations |
|---|---|---|---|---|---|---|
| **article** | `categories` (max 2) `:235` | `tags` `:253` | `tools` `:221` | `related` → node\|article\|caseStudy `:168` | `relatedTerms` `:271` + inline `glossaryTermRef` | `citations[]` (`citationItem`) `:95` + inline `citationRef` |
| **node** | `categories` (max 2) `:300` | `tags` `:318` | `tools` `:284` | `related` → node\|article\|caseStudy `:351` | `relatedTerms` `:336` + inline `glossaryTermRef` | `citations[]` (`citationItem`) `:106` + inline `citationRef` |
| **caseStudy** | `categories` (max 2) `:348` | `tags` `:365` | `tools` `:334` | `related` → node\|article\|caseStudy `:398` | `relatedTerms` `:383` + inline `glossaryTermRef` | `citations[]` (`citationItem`) `:93` + inline `citationRef` |
| **glossaryTerm** | `categories` (no max) `:82` | `relatedTags` (⚠ different name) `:99` | `relatedTools` (⚠ different name) `:107` | `relatedContent` → article\|caseStudy\|node\|page\|person\|project\|tool (⚠ different name + shape) `:115` | `relatedTerms` (bidirectional — adding here also updates the target's Related Terms on publish) `:89` + inline `glossaryTermRef` | `sources[]` — plain `{text, url}`, **not** the shared `citationItem` type `:131` |
| **page** | `categories` `:164` — **`hidden: true`**, editors can't set it | `tags` `:178` — **`hidden: true`** | `tools` `:206` (visible) | **none** | **none** (inline `glossaryTermRef` only, no curated array) | `citations[]` (`citationItem`) `:116` + inline `citationRef` (added via SUG-48, was previously missing) |
| **project** | `categories` `:176` | `tags` `:189` | `tools` `:162` | — | — | — (no Portable Text field on this schema, so no inline mechanism either) |
| **person** | `expertise` → category (⚠ different name) `:136` | — | — | — | — (inline `glossaryTermRef` possible in `bio`, no backing array) | — (inline `citationRef` possible in `bio`, no `citations[]` to resolve against) |
| **series** | — | — | — | `parts` → article\|node\|caseStudy\|page (⚠ third field name for the same concept) `:43` | — | — |
| **tool** | — | — | — | — | — | — (pure taxonomy leaf, zero content-type fields — expected, not a gap) |

### Recommendations, tiered by risk

**Tier 1 — additive, low-risk, precedented, recommended to execute (pending Bex's approval — this is a schema change, see Technical notes):**
- Unhide `page.ts`'s `categories` and `tags` (`hidden: true` at `:164`/`:178`) — article, node, and caseStudy all expose theirs; there's no documented reason page editors specifically can't organize by category/tag.
- Add `relatedTerms` and `related` to `page.ts` — article/node/caseStudy all have both; page currently has neither, only inline `glossaryTermRef` marks with no curated array. This is the exact same shape of gap `SUG-48` closed for page's missing `citations[]` field (see that epic's own in-code comment: *"citations added to page (was missing — present on node, article, caseStudy)"*) — same pattern, same fix, one cycle later.

**Tier 2 — real gaps, need a decision before any execution, not just a docs fix:**
- `glossaryTerm.sources[]` uses its own `{text, url}` shape instead of the shared `citationItem` type (`text`, `url`, `label`) that article/node/caseStudy/page all share. Decision needed: migrate to `citationItem` for consistency (breaking — existing `sources[]` data would need a migration script), or keep it deliberately lighter-weight since a glossary definition's sourcing is a different job than a narrative citation. Not a bug, but worth a deliberate answer instead of an accident of two people building two features at different times.
- `person.bio` (and `glossaryTerm.definition`, more narrowly) permits inline `citationRef`/`glossaryTermRef` Portable Text marks with **no backing array to resolve them against** — the same class of problem as SUG-211's orphaned-token finding, but at the schema level: an editor *could* insert a citation marker in a person's bio today and it would have nowhere to point. Worth a validator or a schema-level fix (either remove the mark from `bio`'s PT config, or add `citations[]`/expose `relatedTerms[]` on `person`), not urgent since it requires an editor to actually do it, but a landmine.

**Tier 3 — real inconsistency, out of scope for this epic, spin-off candidate:**
- Three different field names do the same "related content" job with three different allowed-type sets: `related` (article/node/caseStudy → node\|article\|caseStudy only), `relatedContent` (glossaryTerm → 7 types including page/person/project/tool), `parts` (series → article\|node\|caseStudy\|page). Normalizing this is a real, valuable cleanup but it's a cross-cutting schema epic in its own right (query changes, migration, every consuming component) — too large to fold into a docs-consolidation epic.
- `glossaryTerm`'s `relatedTags`/`relatedTools` vs. everyone else's plain `tags`/`tools` is a naming inconsistency, but renaming a live, populated field is a breaking schema change requiring a content migration — not a docs fix, and not a quick win like the Tier 1 items.

## Objective

After this epic: one shared doc (working name `docs/write-pipeline-prompt.md`, confirm final name during Phase 1) holds every register-agnostic write-time rule — the anti-slop/banned-vocabulary checklist, disclosure & attribution mechanics, Content Write Gate composition, skim-skeleton self-check, show-don't-tell self-check, the metadata reference field matrix (above), and (once SUG-209 lands) the appropriation/attribution check. Each `write-*-prompt.md` file is rewritten to reference the shared doc for those rules and retains only what's genuinely register-specific: node's forensic arc + TL;DR voice, blog's Bex-first-person plain-language register, case study's outcome-tile-as-table pattern + enterprise-deck-phrasing ban, glossy's cheeky/succinct two-gate register. Each file's existing "Pre-flight taxonomy" step (Step 1) points at the matrix instead of writers having to remember or re-derive what fields a given content type supports.

This epic does not change what any rule *says* — only where it lives. If a rule's content itself needs to change, that's a separate brand-voice-guide or node-style-guide edit, not in scope here. The metadata matrix is documentation of current state plus recommendations; Tier 1 schema recommendations are scoped for approval, not silently executed (see Technical notes).

Layers touched: documentation (`docs/write-*-prompt.md`, new shared doc, `.claude/skills/red-pen/SKILL.md`'s Step 2 register table if it needs to point at the new doc) — plus, conditionally and only after explicit approval, a small Studio schema change (Tier 1 recommendations: unhide two fields, add two fields to `page.ts`). No frontend changes, no Sanity content writes.

## Scope

- [ ] **Full duplication audit** — layer: documentation. Read all four files in full, side by side (the grep in Background found Step 0/2.5/2.6 overlap; a full read may surface more, e.g. taxonomy pre-flight patterns in each file's Step 1). Produce a table: rule → which files currently have it → proposed canonical location (shared doc vs. stays register-specific).
- [ ] **Design the shared doc's structure** — layer: documentation. Draft `docs/write-pipeline-prompt.md` (or the name agreed after the audit) containing every rule marked "shared" in the audit table. Confirm it doesn't duplicate `docs/brand/brand-voice-guide.md` or `docs/brand/master-voice-cheatsheet.md` — those stay canonical for tone/voice; this new doc is canonical for write-time *mechanics* (gates, disclosure, self-checks) that currently live redundantly inside each write-*-prompt.md.
- [ ] **Rewrite each write-\*-prompt.md to reference, not repeat** — layer: documentation. `write-node-prompt.md`, `write-blog-prompt.md`, `write-casestudy-prompt.md`, `glossy-prompt.md` each get their shared-rule sections replaced with a short pointer to the new doc, keeping only the register-specific delta content. Glossy's two-gate Sanity-write mechanics (`create_documents`/`publish_documents` flow) are explicitly out of scope for consolidation — only its voice/self-check rules that overlap with the other three move.
- [ ] **Update red-pen's Step 2 register table** — layer: red-pen skill. If the shared doc changes which file is canonical for a given rule, update `.claude/skills/red-pen/SKILL.md` Step 2's "Primary guide" column so review-time and write-time reference the same source.
- [ ] **Regression check** — layer: documentation. After the split, grep the new shared doc plus all four write-\*-prompt.md files for every rule identified in the audit table and confirm each exists in exactly one canonical location (not zero, not two). Present the before/after table to Bex before calling this done — silently dropping a rule during extraction is the exact failure mode this epic exists to prevent, and it would be an embarrassing way to reintroduce it.
- [x] **Metadata reference field matrix** — layer: documentation. Done (see section above, this session) — audited and verified against live schema files. Include it verbatim (or lightly reformatted) in the new shared doc, cross-referenced from each write-\*-prompt.md's Pre-flight taxonomy step.
- [ ] **Tier 1 schema recommendations — present for approval, do not execute unilaterally** — layer: schema (Studio). Unhide `page.ts` `categories`/`tags`; add `relatedTerms` + `related` fields to `page.ts`, matching article/node/caseStudy's shape. Present as a before/after proposal (per CLAUDE.md's schema conventions) and wait for explicit approval before touching `apps/studio/schemas/documents/page.ts`. **This is a separate `feat(studio):` commit, not bundled into the docs-consolidation commits** (CLAUDE.md: "Studio schema changes get their own commit"), and requires `npx sanity schema deploy` after merge before MCP/Studio writes against the new fields will validate.

  **Explicitly scope-limited to the schema field only — this epic does not wire GROQ projection or rendering for the new page fields.** A schema field an editor can populate but that never resolves in a query or renders on the page is a real, precedented failure mode in this codebase (a live example: `calloutSection.body` currently has no Portable Text projection in `queries.js`, so 4 `glossaryTermRef` tags on the live "Sugartown: The Platform Is the Portfolio" case study are stored correctly but render as inert plain text — see `docs/reviews/red-pen/2026-07-16-sugartown-platform-is-the-portfolio.md`, item 10). If Tier 1 ships schema-only, say so explicitly in the close-out doc so it isn't mistaken for a completed, renderable feature — wiring the query/render is separate follow-on scope, not implied by adding the field.
- [ ] **Tier 2 gaps — surface as open decisions, no default action** — layer: documentation (this epic) / schema (future). Record both Tier 2 findings (glossaryTerm's `sources[]` vs. shared `citationItem` divergence; `person.bio`'s orphaned-annotation risk) in the shared doc as known, undecided gaps — do not silently pick a resolution. If Bex wants either resolved, that's new scope for this epic or a quick follow-on, not an assumed default.

## Acceptance criteria

- [ ] A single shared doc exists containing every register-agnostic write-time rule identified in the audit
- [ ] `write-node-prompt.md`, `write-blog-prompt.md`, `write-casestudy-prompt.md`, and `glossy-prompt.md` each reference the shared doc instead of repeating its rules; each retains only genuinely register-specific content
- [ ] The banned-vocabulary list, Content Write Gate composition note, disclosure & attribution mechanics, and skim-skeleton/show-don't-tell self-checks each exist in exactly one file — confirmed by grep, not assumed
- [ ] `.claude/skills/red-pen/SKILL.md`'s Step 2 register table is updated if the canonical-file mapping changed
- [ ] A before/after audit table (each duplicated rule → new canonical location) is presented and Bex confirms nothing was lost before this epic is marked done
- [x] Metadata reference field matrix is documented in the shared doc, verified against live schema (not assumed from convention)
- [ ] Tier 1 schema recommendations (unhide page categories/tags; add page relatedTerms/related) are either explicitly approved and executed as their own `feat(studio):` commit with a schema deploy, or explicitly declined — not left ambiguous
- [ ] Tier 2 gaps are recorded as open decisions in the shared doc, not silently resolved either way

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. This epic is documentation/prompt architecture only.

## Technical notes

- **Content Write Gate**: not itself changed. The shared doc becomes the canonical place documenting how write-time skills compose with CLAUDE.md's Content Write Gate — cross-reference it, don't restate it.
- **Schema changes**: conditional. The core docs-consolidation scope touches no schema. The Tier 1 metadata recommendations (unhide `page.ts` categories/tags; add `page.ts` relatedTerms/related) do touch schema, are gated on explicit approval (see Scope), and — per CLAUDE.md — get their own `feat(studio):` commit, separate from every docs-only commit in this epic, plus a required `npx sanity schema deploy` before the new/unhidden fields are usable via MCP or Studio.
- **Upstream dependencies**: related to SUG-209 (Appropriation Gate Check), cross-linked in Linear, **not blocking either direction**. If SUG-209 activates before this epic ships, its "wire the check into red-pen" scope bullet should note this epic's existence and target the future shared-doc location directly rather than patching four files again — flag that explicitly in SUG-209's own doc if execution order works out that way.
- **Prior art**: `docs/shipped/SUG-48-schema-field-audit.md` closed the exact same class of gap for `page.ts`'s `citations[]` field ("was missing — present on node, article, caseStudy"). The Tier 1 recommendations here are the same fix pattern, one cycle later, for `relatedTerms`/`related`/visibility instead of `citations`.
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
- **Does not normalize the three "related content" field names/shapes** (`related` vs `relatedContent` vs `parts`) — real inconsistency (see Tier 3), but a cross-cutting schema epic in its own right (query changes, every consuming component), too large for a docs-consolidation epic. Candidate for its own future ticket if Bex wants it addressed.
- **Does not rename `glossaryTerm.relatedTags`/`relatedTools`** to match the `tags`/`tools` naming used elsewhere — a breaking rename on a live, populated field requiring a content migration, not a docs fix or a quick win.
- **Does not resolve the Tier 2 gaps** (glossaryTerm citation-shape divergence; `person.bio`'s orphaned-annotation risk) — recorded as open decisions, not defaulted either direction.

## Related

- **Linear:** [SUG-210](https://linear.app/sugartown/issue/SUG-210)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **SUG-209** (`docs/backlog/SUG-209-appropriation-gate-check.md`) — cross-referenced, not blocking; SUG-209's eventual attribution check is a natural future addition to this epic's shared doc
- **SUG-48** (`docs/shipped/SUG-48-schema-field-audit.md`) — prior art for the Tier 1 recommendations: closed the identical class of gap for `page.ts`'s missing `citations[]` field
- **Motivating incident (same session, 2026-07-15):** red-pen show-don't-tell update patched into write-node and write-blog, missed write-casestudy on the first pass
