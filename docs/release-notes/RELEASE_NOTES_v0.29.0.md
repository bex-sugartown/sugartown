# Release Notes — v0.29.0

**Date:** 2026-07-19
**Scope:** apps/web, apps/studio, packages/design-system, apps/storybook, Sanity production data

---

## What this release is

Fourteen mini-releases' worth of work aggregated into one MINOR version: glossary/taxonomy display fixes, a case study schema cleanup that closed out accumulated legacy-field drift, a round of AI-governance tooling and documentation, and the first Rules & Tools Audit calibration run.

---

## What changed

### Glossary and category display

Categories that were only ever referenced by glossary terms used to show up as a false "no content" page — a dedicated query now surfaces them correctly in a "Glossary Terms" section, and the `/glossary` archive's filter chips gained color and description. Separately, `calloutSection` (the Challenge callout used on case studies, articles, and nodes) now resolves `glossaryTermRef` tags across all four content types — four previously-inert tags on the Platform case study now render as working links, and a `citationRef` annotation was added to the same field without locking Studio editing. Glossary chips also switched to preferring a term's `abbreviation` over its full name where one exists, alongside a new inline-term visual treatment (a lime/pink annotation pill, and a recolored recessive seafoam treatment for inline code site-wide).

### Case study schema cleanup

A live bug — case study outcome tiles rendering blank across all seven published case studies — traced back to a field left orphaned by an earlier schema rename. Fixing it was the occasion to also retire three other legacy fields that had been superseded by the same consolidated content path, and to extract a piece of duplicated sidebar-positioning logic into a shared helper.

### AI governance tooling

A read-only design-review subagent now produces Match/Drift/Missing tables for visual QA in a fresh context, independent of the implementing session. A governance-coverage summary was added to the platform's `/governance` page, backed by new semantic status tokens. An editorial-review skill (`/red-pen`) was added alongside new self-check gates in the content-writing skills, and the write-time rules that had been duplicated across four separate write-skill prompts were consolidated into one shared reference doc.

### Rules & Tools Audit — calibration run 1

The audit's runbook is now standing infrastructure, and its first full-corpus run found and fixed 24 stale references (several instances of a nonexistent MCP tool name, a few moved or superseded file paths, a couple of self-contradicting counts) and reviewed 15 governance gates for redundancy — one gate was folded into another, one was narrowed to the two artifact types it still uniquely covers, and three unrelated orphaned files (an inactive skill, a stale duplicate validator script, a reference doc for a different tech stack entirely) were retired. A check for the specific failure class that motivated the audit — a content-writing skill publishing without explicit approval — came back clean everywhere.

### Tooling and process

Chromatic's story count across six components was cut roughly in half (39→19) without losing coverage. The style-mirror validator now also diffs individual component CSS files between the web app and the design-system package, catching a class of drift that had been invisible until now. A handful of small standalone fixes landed alongside all of the above: a gallery thumbnail radius mismatch, Mermaid diagrams not rendering on three internal pages, a Storybook rebuild trigger gap, and two diagram-rendering bugs in published SVGs.

### Sanity content

Fifty of sixty tools in the taxonomy now carry a description, URL, and logo. Four AI-governance glossary terms were published, and six documents were migrated off three inconsistent legacy annotation types onto the canonical one.

---

## Not in this release

- **Tier 2 metadata-field gaps** identified during the write-pipeline consolidation are recorded as open decisions, not yet resolved.
- **Two tools** (Celum, ChatGPT (Canvas)) remain unscoped in the taxonomy backfill — flagged, not executed.
- **`page.ts`'s new `relatedTerms`/`related` fields** are schema-only this release; no rendering is wired up yet.
- **Nav-doc URL data** was left as-is in the relative-links fix — the code-level normalization covers it, but the schema itself has no `allowRelative` flag yet.
- **The Rules & Tools Audit's open decisions** (steady-state cadence, Linear tracking shape, trigger mechanism, whether to script the staleness sweep) all wait on a second calibration run.

---

## Validator state at release

```
✅  pnpm validate:tokens        — 655 unique tokens, all var(--st-*) refs resolve
✅  pnpm validate:tokens:strict — zero hardcoded color violations
✅  pnpm validate:style-mirror  — style + component mirrors byte-identical (11 pairs grandfathered on KNOWN_DRIFT, burning down via SUG-217/218/219)
✅  pnpm lint                   — zero ESLint errors
```
