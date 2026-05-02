---
**Epic:** SUG-95 — Sanity AI Assist POC — case study field generation
**Linear Issue:** [SUG-95](https://linear.app/sugartown/issue/SUG-95)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-95 — Sanity AI Assist POC — case study field generation

Install and configure the `@sanity/assist` plugin. Define `exclude` rules for fields that must never be AI-generated. Author field instructions for the case study AEO/GEO fields. Test the Content Agent bulk-pass on a single case study. This epic establishes the pattern all subsequent content epics (SUG-91, 92, 93) inherit — it ships before SUG-91 activates.

## Background

Sanity has three distinct AI tools: AI Assist (Studio inline, `@sanity/assist` plugin), Content Agent (Dashboard conversational agent), and Agent Actions (programmatic API). All three are confirmed available on the Growth plan. None are currently installed or configured on this project.

The fields being added in SUG-91–93 — `challengeSummary`, `geoSummary`, `aeoSummary`, `keyQuestions[]`, `outcomes[].impactStatement` — are precisely the kind of AI-generatable synthesis fields these tools are designed for. Without this POC first, each content epic would independently decide how AI Assist interacts with its fields, creating inconsistent behaviour across the schema.

This epic settles three questions once: which fields get AI assist, which are explicitly excluded, and what the human review checkpoints look like in practice. The answers become schema conventions inherited by SUG-91+.

## Objective

After this epic: `@sanity/assist` is installed and active in `apps/studio`. All sensitive/factual fields carry `options.aiAssist: { exclude: true }`. The five target case study fields have authored field instructions accessible via the ✨ menu in Studio. The Content Agent workflow for a bulk case study pass has been tested on one document. A conventions doc captures the exclude pattern and instruction authoring guidelines for future schema epics. Layers touched: schema (options config), Studio plugin config, documentation.

## Schema field proposal

No new fields. This epic adds `options.aiAssist` configuration to existing and forthcoming fields — it does not create them.

| Field | AI Assist config | Rationale |
|-------|-----------------|-----------|
| `slug`, `publishedAt`, `updatedAt`, `legacySource` | `exclude: true` | Structural/factual — AI must never touch |
| `title` | `exclude: true` | Internal reference title — set by human, used for slugs |
| `client`, `employer`, `contractType`, `role`, `dateRange` | `exclude: true` | Factual CV data — AI cannot know these |
| `outcomes[].metric`, `valueBefore`, `valueAfter`, `evidenceType` | `exclude: true` | Factual measurements — AI cannot invent |
| `challengeSummary` | AI Assist enabled, field instruction authored | Synthesis from body copy — AI drafts, human refines |
| `outcomes[].impactStatement` | AI Assist enabled, field instruction authored | Narration of metric + value — AI drafts, human refines |
| `geoSummary` | AI Assist enabled, field instruction authored | Structured fact synthesis from schema fields |
| `aeoSummary` | AI Assist enabled, field instruction authored | Direct-answer draft — human must rewrite before publish |
| `keyQuestions[]` | AI Assist enabled, field instruction authored | Extraction from body + outcomes — human trims to 2–4 |

## Scope

- [ ] Install `@sanity/assist` plugin: `pnpm add @sanity/assist` from `apps/studio/` — layer: tooling
- [ ] Register `assist()` in `apps/studio/sanity.config.ts` with `temperature: 0.3` — layer: schema
- [ ] Add `options.aiAssist: { exclude: true }` to all factual/structural fields across `caseStudy.ts` (see table above) — layer: schema
- [ ] Author field instructions for `challengeSummary`, `impactStatement`, `geoSummary`, `aeoSummary`, `keyQuestions[]` in Studio UI (stored as `AI Context` documents, not in schema code) — layer: content configuration
- [ ] Test AI Assist generation for each of the five fields on one case study document — layer: QA
- [ ] Test Content Agent bulk-pass: use Dashboard agent to draft `geoSummary` for all case studies in one conversational pass, review proposed changes before confirming — layer: QA
- [ ] Write `docs/conventions/ai-assist-conventions.md` — exclude pattern rules, instruction authoring guidelines, field tier classification (factual/synthesis/brand-voice) — layer: documentation
- [ ] Update `sugartown-backlog-priorities.md` to mark SUG-95 as prerequisite for SUG-91

## Phases

Single phase — plugin install, configuration, instruction authoring, and POC test are all low-risk and ship together.

## Acceptance criteria

- [ ] `@sanity/assist` installed; ✨ icon appears on target fields in Studio for a `caseStudy` document
- [ ] ✨ icon does NOT appear on excluded fields (slug, title, client, role, dateRange, outcomes metrics)
- [ ] Clicking ✨ on `challengeSummary` shows an authored instruction, not a blank prompt
- [ ] Running the `challengeSummary` instruction on a published case study produces a coherent draft in the field — editor reviews before saving
- [ ] Content Agent: sending "Draft geoSummary for all case studies based on client, role, tools, and outcomes fields" produces a Changes tab with reviewable proposals — nothing written to dataset until Confirm clicked
- [ ] `docs/conventions/ai-assist-conventions.md` exists and documents: the three field tiers, the exclude pattern, the instruction authoring format, and the Content Agent bulk-pass workflow
- [ ] All existing `validate:tokens` checks pass (no schema token changes in this epic)

## Technical notes

- **Growth plan required**: AI Assist and Content Agent are paid features. Confirm project plan before activating. Token is created via Studio UI (✨ → Enable) — not via config file or environment variable.
- **`AI Context` document type**: the `@sanity/assist` plugin registers a new document type. If `apps/studio` uses Structure Builder, add `S.documentTypeListItem(contextDocumentTypeName)` to the structure config. Import `contextDocumentTypeName` from `@sanity/assist`.
- **Field instructions live in Sanity, not schema**: the authored instructions (the text you type in the ✨ panel) are stored as `AI Context` documents in the dataset, not in schema code. They are content, not config. This means they don't ship with a schema deploy — they must be re-authored per dataset if a new dataset is created.
- **Agent Actions (programmatic)**: not in scope for this POC. `client.agent.action.generate()` requires `apiVersion: 'vX'` (experimental) and a deployed schema ID. Defer to SUG-93 if a scripted bulk-generation pass proves useful. For now, Content Agent (Dashboard UI) covers the bulk use case with a built-in human gate.
- **Human-in-the-loop summary** (document for conventions doc):
  - AI Assist: editor clicks Generate → reviews output in field → saves draft → publishes. Two human checkpoints.
  - Content Agent: agent proposes Changes → editor Confirms → drafts created → editor publishes. Two human checkpoints.
  - Agent Actions (programmatic): writes directly to drafts. Content Write Gate in CLAUDE.md is the only gate. Treat as MCP-equivalent — proposal table required before use.
- **Temperature**: `0.3` default (repeatable, not creative). Raise to `0.5` for `keyQuestions[]` if the output is too formulaic — `aeoSummary` and `geoSummary` should stay at `0.3`.
- **Schema deploy not required**: this epic adds `options.aiAssist` to existing fields — no new fields, no type changes, no migration. However, a schema deploy after the options are added ensures MCP tools see the updated configuration.
- **Doc Type Coverage**: `caseStudy` only for the POC. Conventions established here apply to `article` and `node` in future passes.
- **Model recommendation**: `/model sonnet` — no architectural decisions, configuration and documentation work only.

## Non-Goals

- AI-assisted image generation (requires `options.aiAssist.imageInstructionField` config — separate concern)
- Embeddings index for reference field AI assist (Embeddings Index API deprecated; replacement not yet available per Sanity docs)
- Agent Actions scripted pipeline (programmatic bulk generation) — defer to SUG-93 if needed
- `article` or `node` AI Assist configuration — conventions established here apply, but configuration is out of scope
- Full content pass on case studies — that is SUG-91, 92, 93

## Related

- **Linear:** [SUG-95](https://linear.app/sugartown/issue/SUG-95)
- **SUG-91:** [Case study outcomes narrative](https://linear.app/sugartown/issue/SUG-91) — upstream dependency on this epic; SUG-95 ships first
- **SUG-93:** [Case study AEO/GEO content layer](https://linear.app/sugartown/issue/SUG-93) — aeoSummary/geoSummary/keyQuestions[] field instructions authored here are the generation substrate for SUG-93's editorial pass
- **Sanity AI Assist docs:** `https://www.sanity.io/docs/studio/install-and-configure-sanity-ai-assist`
- **Sanity Content Agent docs:** `https://www.sanity.io/docs/content-agent/introduction`
- **Epic template:** `docs/epic-template.md`
