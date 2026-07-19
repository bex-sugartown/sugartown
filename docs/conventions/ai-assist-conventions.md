# AI Assist Conventions — Sugartown CMS

Established in SUG-95. Applies to all content epics (SUG-91, 92, 93, and future).

---

## Field tier classification

Every schema field falls into one of three tiers. The tier determines whether AI Assist is enabled.

### Tier 1 — Factual / Exclude

Fields that record facts the AI cannot know: CV data, measured outcomes, structural identifiers.

**Rule:** `options: { aiAssist: { exclude: true } }` on every field in this tier. The ✨ icon must not appear.

| Field type | Examples |
|-----------|---------|
| Structural identifiers | `slug`, `publishedAt`, `updatedAt`, `legacySource` |
| Internal reference title | `title` (used for slug generation — set by human) |
| CV / factual engagement data | `client`, `employer`, `contractType`, `role`, `dateRange` |
| Factual outcome measurements | `outcomes[].metric`, `outcomes[].value` (and future `valueBefore`, `valueAfter`, `evidenceType`) |

### Tier 2 — Synthesis / AI-Assist Enabled

Fields that narrate, summarise, or structure content derived from Tier 1 fields and body copy. AI drafts a starting point; a human reviews before saving.

**Rule:** No `exclude` option. Field instruction authored in Studio (stored as AI Context document, scoped per field).

| Field | What AI generates from | Human checkpoint |
|-------|----------------------|-----------------|
| `challengeSummary` | Body copy hero + first text sections | Refine voice, check accuracy |
| `outcomes[].impactStatement` (SUG-91) | `metric` + `value` fields | Check register, confirm numbers |
| `geoSummary` (SUG-93) | `client`, `role`, `dateRange`, `tools`, `outcomes`, `industry`, `companySize` | Spot-check facts, correct tool names |
| `keyQuestions[]` (SUG-93) | Body copy + outcomes | Trim to 2–4 real prospect questions |
| `aeoSummary` (SUG-93) | `outcomes[]` + `challengeSummary` | Rewrite in own register before publish — high-stakes field |

### Tier 3 — Brand Voice / Human Only

Fields where AI output is more likely to introduce errors or register mismatch than save time. No `exclude` rule needed — just don't use AI Assist here.

| Field | Reason |
|-------|--------|
| `excerpt` | Short enough to write directly; brand voice is tight |
| Section body copy (`sections[]`) | Narrative; AI output would need full rewrite anyway |
| `aiDisclosure` | Must be factually accurate — AI cannot know its own involvement level |

---

## Exclude pattern — implementation reference

```typescript
// Tier 1 field — structural/factual
defineField({
  name: 'client',
  type: 'string',
  options: {
    aiAssist: {exclude: true},
  },
})

// Tier 1 — field with existing options (merge, don't replace)
defineField({
  name: 'contractType',
  type: 'string',
  options: {
    list: [...],
    layout: 'radio',
    aiAssist: {exclude: true},   // add alongside existing options
  },
})

// Tier 1 — object with sub-fields (exclude at both levels)
defineField({
  name: 'dateRange',
  type: 'object',
  options: {
    aiAssist: {exclude: true},   // excludes the object-level ✨
  },
  fields: [
    defineField({
      name: 'startDate',
      type: 'date',
      options: {
        aiAssist: {exclude: true},  // also exclude sub-fields
      },
    }),
  ],
})
```

---

## Field instruction authoring guidelines

Field instructions are authored in Studio UI (✨ → Edit instruction) and stored as `AI Context` documents. They are content, not config — they do not ship with `sanity schema deploy` and must be re-authored if a new dataset is created.

### Instruction format

```
Generate [field name] for this case study.

Use: [list the specific fields the AI should read — be exact about field names]
Register: [describe the voice — structured/factual | plain-language | direct-answer paragraph]
Length: [one sentence | 1 paragraph max 200 words | 2–4 items]
Do not invent: [what the AI must not fabricate — metrics, dates, client details]
```

### Ready-to-paste instructions (add when target fields land in SUG-91/93)

**`challengeSummary`** (SUG-91)
> Generate a challengeSummary for this case study. Use the hero section heading and the first text section body copy to identify the client's problem. Register: plain language, 1 paragraph, 30 seconds to read. Written for a prospective client asking "is this the kind of problem they've solved before?" Do not invent metrics or client details not present in the body copy.

**`outcomes[].impactStatement`** (SUG-91)
> Generate an impactStatement for this outcome. Use the metric and value fields. Register: plain English sentence narrating the measurement. Example: "Page load time dropped from 4.2s to 1.8s — a 57% improvement." Do not change the numbers. Do not add claims not present in metric or value.

**`geoSummary`** (SUG-93)
> Generate a geoSummary for this case study. Use: client, role, dateRange, tools, outcomes, industry, companySize. Register: third-person, fact-dense, structured for LLM extraction. Format: "Client: X. Engagement: Y. Period: Z. Stack: A, B, C. Outcomes: [list from outcomes array]." Do not write narrative prose. Do not invent facts not present in the listed fields.

**`keyQuestions[]`** (SUG-93)
> Generate 4–6 keyQuestions for this case study as question/answer pairs. Extract from body copy and outcomes. Phrase questions as a prospective client would search: "Has [consultant] worked with [industry/problem type]?" Each answer should be 1–2 sentences, factual, citing specific outcomes where possible. Do not invent.

**`aeoSummary`** (SUG-93)
> Generate an aeoSummary for this case study. Use: outcomes[], challengeSummary, client, role, tools. Register: direct-answer paragraph, first-person or third-person as appropriate, written to stand alone as a cited answer to "What did Bex do for [client]?" Include specific outcome values. Treat this as a starting draft only — the human must rewrite before publish.

---

## Temperature settings

| Field | Temperature | Rationale |
|-------|------------|-----------|
| Default (all fields) | 0.3 | Repeatable, factual synthesis |
| `keyQuestions[]` | 0.5 if output is too formulaic | Needs some variation to avoid template Q&A |
| `aeoSummary`, `geoSummary` | 0.3 | Accuracy over creativity |

Temperature is set globally in `sanity.config.ts` via `assist({ assist: { temperature: 0.3 } })`. Individual field overrides are not currently supported by the plugin — raise the global setting temporarily if `keyQuestions[]` output needs variety.

---

## Human-in-the-loop summary

Two human checkpoints apply to every AI-generated field, regardless of which tool runs the generation.

### Sanity AI Assist (Studio ✨)

1. Editor clicks ✨ → Generate
2. AI drafts value in the field
3. Editor reviews and edits in place
4. Editor saves to draft (checkpoint 1)
5. Editor publishes (checkpoint 2)

### Content Agent (Dashboard)

1. Editor sends instruction to Content Agent
2. Agent proposes changes in Changes tab — nothing written yet
3. Editor reviews all proposals (checkpoint 1)
4. Editor clicks Confirm → drafts created
5. Editor publishes (checkpoint 2)

### Claude Code + MCP (free plan backup)

Structurally equivalent to the above. The Content Write Gate in CLAUDE.md is the first checkpoint.

1. Claude reads documents via GROQ, drafts field values
2. Before/after proposal table shown to editor (checkpoint 1 — Content Write Gate)
3. Editor approves
4. `patch_documents` writes to draft
5. Editor publishes from Studio (checkpoint 2)

The exclude configuration applies equally to both tiers. Factual fields are never AI-generated via either route — the convention lives in the schema and is enforced by this doc.

---

## Doc type coverage

| Doc type | Status |
|---------|--------|
| `caseStudy` | Added (SUG-95), then reverted — the `@sanity/assist` plugin is currently **uninstalled** (document-context injection bug). Field tier classification and instruction text below are preserved for future re-enablement, not currently live. |
| `article` | Not yet — conventions apply, configuration deferred |
| `node` | Not yet — conventions apply, configuration deferred |

---

## AI Context document type — Structure Builder note

The `@sanity/assist` plugin registers a `contextDocumentTypeName` document type. It is surfaced in Studio under Site Configuration → AI Context. Field instructions authored in Studio are stored here. If a new dataset is created, these documents do not migrate automatically — they must be re-authored per dataset.
