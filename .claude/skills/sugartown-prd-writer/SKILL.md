---
name: sugartown-prd-writer
description: >
  Write a human-facing Product Requirements Document for CMS/headless architecture, design system
  governance, or ecommerce/platform implementation work. Serves engineers, designers, and
  stakeholders simultaneously. Use this skill whenever Bex says "write a PRD", "write a brief",
  "scope this out", "requirements doc", or describes a new feature/surface/system at a level above
  implementation — even if she doesn't use the word PRD. Also triggers on "what should we build",
  "what's in scope", or "help me think through the requirements for X". The output is a structured
  Markdown document readable by a senior engineer, a designer, and a stakeholder without
  translation. Always produce a file, never inline prose.
---

# Sugartown PRD Writer

Produces a human-facing Product Requirements Document. Not an epic. Not an AI execution prompt.
This is the upstream artifact — the one that justifies *why*, defines *what*, and sets the success
bar. Epics implement it. This document governs scope for those epics.

---

## Audiences (All Three, Simultaneously)

A good PRD for Sugartown's domain serves three readers in a single pass:

| Reader | What they need from this doc |
|--------|------------------------------|
| **Engineer** | Concrete scope boundaries, field types, integration contracts, what's explicitly out of scope |
| **Designer** | Component surface, token constraints, variant logic, states and edge cases |
| **Stakeholder** | Business rationale, success criteria they can verify without opening the code |

Write to the engineer first. The designer and stakeholder benefit from precision — they don't need
it softened.

---

## Intake: What to Ask Before Writing

If the request is ambiguous, ask only what's needed to unblock the PRD. One question at a time.
Never more than three total. Default assumptions listed below — use them unless contradicted.

**Required to proceed:**
- Project name / working title
- Domain (CMS/headless, design system, ecom/platform, or mixed)
- One sentence on the problem being solved

**Default assumptions (state them in the PRD; flag if wrong):**
- Stack: React + Sanity monorepo (pnpm/Turborepo), Storybook, Netlify
- Design system: Sugartown Pink (`st-*` namespace, CSS Modules, BEM, zero hardcoded values)
- Content: Sanity is the source of truth; no WordPress dependencies
- Versioning: SemVer on a CHANGELOG-driven release process
- Audience: FTE-first, consultant-secondary

---

## Output Format

Produce a single Markdown file. Filename: `[project-slug]-prd.md`.
Write it with the Write tool to `docs/briefs/` in the repo.

**Never output the PRD as inline prose.** It's a document, not a chat response.

---

## PRD Section Order

Every PRD uses this structure. Omit a section only if it is genuinely not applicable — and say
why. "Not yet decided" is not a reason to omit; it's content for the section (state the open
decision and who owns it).

---

### 1. Header Block

```
# [Project Name] — Product Requirements Document
**PRD Version:** v1.0
**Status:** Draft | In Review | Approved
**Author:** Bex Head
**Domain:** CMS/Headless | Design System | Ecom/Platform | Mixed
**Last updated:** [date]
**Related epics:** [EPIC-XXXX if known, otherwise TBD]
```

---

### 2. Problem Statement

Two to four sentences. What breaks, costs time, or doesn't exist? No marketing framing.
Be specific. Name the system or surface that has the problem.

> Right: "Archive pages have no filter persistence. A visitor who filters to `#CMS` and
> clicks an article loses their filter state on back-navigation. This costs the taxonomy
> graph its primary navigation surface."
>
> Wrong: "Users need a better experience browsing content."

---

### 3. Goals & Non-Goals

Two-column table. Goals are outcomes, not features. Non-goals are explicit exclusions with reasons.

| Goal | Description |
|------|-------------|
| [outcome] | [one sentence, measurable if possible] |

| Non-Goal | Why excluded |
|----------|-------------|
| [thing not being built] | [architectural reason or deferred epic] |

**Domain-specific goal patterns:**

*CMS/Headless:* Goals name the content model change, the query layer impact, and the render
surface. "Authors can set a `featured` boolean on any article" + "Archive page queries respect
it" + "Featured articles surface in a distinct visual slot."

*Design System:* Goals name the token layer, the component contract, and the Storybook deliverable.
"A `StatusBadge` component exists in `packages/design-system`" + "Renders all six status values
from `options.list` without a display-label map in the consumer" + "Documented in Storybook with
each variant."

*Ecom/Platform:* Goals name the data source, the integration contract, and the page-level outcome.
"Product detail pages are powered by Sanity + a headless commerce API" + "Price and inventory read
from the commerce layer, not Sanity" + "Sanity owns editorial copy; commerce owns transactional data."

---

### 4. User Stories

Markdown table. Use INVEST criteria mentally (Independent, Negotiable, Valuable, Estimable, Small,
Testable). Acceptance criteria must be falsifiable — "it works" is not acceptable.

| ID | Title | User Story | Acceptance Criteria | Priority |
|----|-------|-----------|---------------------|----------|
| US-001 | | As a [role], I want [action] so that [outcome] | [testable condition] | P0/P1/P2 |

**Priority definitions:**
- P0: Blocks launch or breaks a core flow. Ship nothing until this is met.
- P1: Required for the feature to be useful. High confidence it ships in this scope.
- P2: Nice-to-have. Ships if time allows; deferred otherwise.

---

### 5. Technical Architecture

**Do not write code here.** Describe contracts, boundaries, and data flow in prose and tables.
Engineers write the code; this section tells them what the code must satisfy.

Required sub-sections per domain:

**CMS/Headless**
- Content model: new document types, fields, field types (explicit — no "TBD" on field types)
- Query contract: which GROQ queries are affected; what projection is required
- Render contract: which page templates / components consume the new data
- Integration points: third-party APIs, webhooks, preview URLs

**Design System**
- Token layer: which CSS custom properties are created or modified; which token file owns them
- Component contract: props interface (name, type, required/optional, default); do not omit any prop
- Variant inventory: every visual variant, named and described
- Storybook deliverable: which stories are required (one per variant minimum)
- Web adapter: whether `apps/web` adapter is in scope or deferred (name the epic if deferred)
- `featuredImage` prohibition: this field is deprecated. Never reference it. Use `hero.media[0]`
  or `sections[]` as the image source.

**Ecom/Platform**
- Data authority map: which system owns which field (Sanity vs commerce API vs both)
- Integration contract: API name, endpoint pattern, auth method, rate limit notes
- Cache/revalidation strategy: ISR interval, webhook-triggered revalidation, or static
- Fallback behaviour: what renders if the commerce API is unavailable

---

### 6. Content Model (CMS projects only)

Table of every new or modified Sanity field. Types must be explicit.

| Field name | Sanity type | Required? | Validation | Notes |
|------------|-------------|-----------|-----------|-------|
| `fieldName` | `string` / `text` / `boolean` / `reference` / `array` / `image` / `slug` / `number` | Yes/No | [rule if any] | |

**Enum fields:** list every `options.list` value. No "etc." No abbreviation. This table becomes
the source of truth for display-label maps downstream.

| Field | Value | Display title |
|-------|-------|---------------|
| `status` | `active` | Active |
| `status` | `archived` | Archived |

---

### 7. Design Constraints

- **Namespace:** `st-*` with BEM. No page-specific CSS. No hardcoded values.
- **Tokens:** every colour, spacing, and type decision references a CSS custom property from
  `tokens.css`. State which tokens are relevant.
- **Storybook-first:** components are validated in Storybook before site implementation.
  Build success alone is not a completion signal for visual work.
- **Dark/light/themed variants:** explicit statement for every component — which themes apply,
  how they're implemented (`[data-theme]`, `accentColor`, token override, "not applicable").
- **Typography:** IBM Plex Mono + DM Sans. No substitutions.
- **Responsive:** state the breakpoint contract if the component has layout changes below 768px.

---

### 8. Open Decisions

One row per unresolved decision. Every row must have an owner and a resolution target.
"TBD" without an owner is not a valid open decision — it's a gap.

| Decision | Options | Owner | Target resolution |
|----------|---------|-------|------------------|
| [question] | A / B / C | [name or role] | [date or milestone] |

---

### 9. Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| [what could go wrong] | High/Med/Low | [concrete action, not "monitor closely"] |

**Dependency types to always check:**
- Schema changes owned by a different epic
- Third-party API contracts not yet confirmed
- Design tokens that don't exist yet
- Routes that don't exist yet (tool-related redirects must defer to the Tools epic)
- `featuredImage` references anywhere in scope (deprecated — must be removed, not migrated)

---

### 10. Success Criteria

Verifiable. Every metric must be checkable without opening a ticket.

| Area | Metric |
|------|--------|
| Performance | [e.g. LCP < 2.5s on the affected page, measured in PageSpeed Insights] |
| Content model | [e.g. all five primary doc types can carry the new section type] |
| Design system | [e.g. Storybook documents all N variants; zero hardcoded hex values in component CSS] |
| Accessibility | [e.g. WCAG 2.1 AA on all interactive elements in the new surface] |
| Data integrity | [e.g. migration dry-run reports expected doc count; re-run reports 0] |

---

### 11. Out of Scope (Deferred)

Explicit list of things that came up during scoping but are not in this PRD.
Name the epic, backlog item, or decision that owns them.

---

### 12. Authoring Checklist

Before marking the PRD as "In Review":

- [ ] Every claim references a real system, not an aspiration
- [ ] Field types are explicit — no "TBD" in the content model table
- [ ] Enum values are exhaustive — no "etc."
- [ ] Non-goals name the reason for exclusion, not just the exclusion
- [ ] Open decisions have owners
- [ ] Success criteria are independently verifiable
- [ ] `featuredImage` does not appear anywhere (it's deprecated)
- [ ] Brand voice check: no em dashes, no adjective triads, no future-tense promises on shipped surfaces
- [ ] A senior engineer could start writing epics from this doc without a meeting

---

## Domain Reference Files

Read the relevant reference file before writing for a specific domain:

- `references/cms-headless.md` — CMS/headless patterns, GROQ contract conventions, section builder rules
- `references/design-system.md` — Token architecture, component contract patterns, Storybook requirements
- `references/ecom-platform.md` — Data authority maps, integration contract patterns, commerce API conventions

---

## Voice Constraints (Hard Rules)

These apply to all PRD copy, regardless of section:

- Em dashes prohibited. Use a colon, a period, or restructure the sentence.
- No adjective triads ("robust, scalable, and maintainable").
- No future-tense promises on shipped surfaces ("will support" → "supports" or scope it explicitly).
- No "we" unless it means Bex + the AI working together. Never corporate plural.
- Specificity over cleverness. If it could mean two things, it means the wrong one.
- Present tense for capability statements. Past tense for completed work.
