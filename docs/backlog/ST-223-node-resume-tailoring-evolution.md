---
**Epic:** ST-223 — Node: how the resume tailoring evolved, from one base resume to the Resume Factory
**Issue:** [#223](https://github.com/bex-sugartown/sugartown/issues/223)
**Status:** Backlog
**Priority:** unset (set once goals and scope are complete)
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** no (one node draft on the existing node template; no new visual format)
---

# ST-223 — Node: how the resume tailoring evolved, from one base resume to the Resume Factory

A knowledge-graph node on the four phases of Bex's resume tailoring, and what each phase added: base resumes, rules against fabrication, a story bank, and accuracy audits.

## Background

ST-162's draft framed the first cohort (Jul 2025 to May 2026) as untailored. A file audit on 2026-11-14 showed otherwise: category variants from Aug 2025, and from 2026-03-02 one prototype resume tailored per JD by AI under a written no-fabrication prompt (v2 to v5), three months before the Resume Factory. The full evidence is in §Resume tailoring audit, before and after the pipeline, in `docs/backlog/ST-162-article-ai-screening-followup.md`. That story does not fit ST-162's word budget, and Bex decided on 2026-11-14 to give it its own node. ST-162 keeps one sentence and links here.

## Objective

One Sanity `node` draft that tells the four phases (one base, category variants, prototype plus AI with written rules, Resume Factory), using only figures from the ST-162 audit section or re-run commands. Layer touched: content (one `drafts.*` node). No schema, GROQ, React or CSS changes.

## Metadata plan

Activation audit: fill from `docs/write-pipeline-prompt.md` §1a, after the taxonomy pre-flight query in CLAUDE.md §Taxonomy pre-flight. Candidates to check against existing documents, not to create: tools Claude, Cowork; a job-search or career category if one exists; glossary terms for ATS and hallucination if they exist.

| Type | Existing (use) | New (recommend) |
|---|---|---|
| Categories | activation audit | activation audit |
| Tags | activation audit | activation audit |
| Tools | activation audit | activation audit |
| Glossary terms | activation audit | activation audit |

## Scope

- [ ] Arc and outline for the node: the four phases, what each changed, and the cold-yield split by phase with its caveat (layer: content, editorial)
- [ ] Every figure re-read from its source: the phase table and Fisher results in the ST-162 audit section, the prompt text in `resume-tailor-prompt-v5.docx`, the correction entries in `PROTOTYPE-INDEX_and_CHANGELOG.md` (layer: content)
- [ ] Node drafted with `/write-node` and created as `drafts.*` after the Content Write Gate proposal is approved (layer: content)
- [ ] ST-162 article carries one sentence linking to this node (layer: content, applied under ST-162's own Content Write Gate)

## Phases

Single phase.

## Acceptance Criteria

- [ ] Outline approved by Bex before any draft copy is written
- [ ] Every number in the node names the file or command it came from, in the epic doc
- [ ] No resume content or company name appears that `check_tiers.py --publish` (run in `resume-factory/os`) would fail
- [ ] Node exists as `drafts.*` in Sanity with taxonomy attached; proposal approved before the write; nothing published without Bex's standalone instruction
- [ ] ST-162's link sentence is in its draft

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate** fires on the node draft and on the ST-162 link sentence.
- **Privacy:** the source files live in `resume-factory/data/` and `~/Documents/GDRIVE RECOVERY/`, which are never gitted. Quote rules and dates, not resume text, company names or contact details. The v5 prompt header carries contact details; never paste it.
- **Upstream dependency:** ST-162's audit section is the source. If ST-162's figures are re-cut, re-read them before drafting.
- **Statistics:** the phase split (6 of 74, 1 of 31, 3 of 91) is inside chance on every comparison. The node may say where a change would have shown, never that tailoring changed the rate.

## Model & Mode [REQUIRED]

`/model sonnet`. Editorial epic with its evidence already gathered; no architectural ambiguity.

## Non-Goals

- No schema, query, component or CSS work.
- No re-analysis of the funnel beyond the phase split already in ST-162.
- No changes to the resume-factory prototypes or the tailor skill.
- No publish. Bex publishes.

## Related

- **GitHub:** [#223](https://github.com/bex-sugartown/sugartown/issues/223)
- **Parent:** [ST-162](ST-162-article-ai-screening-followup.md), §Resume tailoring audit, before and after the pipeline
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage and Files to Modify at activation time
