---
name: alignment-audit
description: Run a systematic, evidence-based audit comparing something you have (a codebase, a team's workflow, a product, an org's process) against an external standard (a course curriculum, a framework, a spec, a policy, best-practice guidelines, WCAG, a vendor's compliance requirements). Produces a structured findings report — Match / Drift / Gap per dimension, with recommendations — not just a summary or opinion. Use this whenever the user asks things like "how does X align with Y," "audit our Z against this standard," "what's the gap between what we do and what this course/framework/spec teaches," "are we compliant with," or wants a systematic comparison rather than a casual read-through. Covers design system audits, content audits, accessibility (WCAG) audits, vendor/security audits, and ecosystem-vs-external-standard alignment audits (e.g. "does our AI workflow match what this course teaches").
---

# Alignment Audit

An audit is not a summary and it is not an opinion. It is a **systematic, evidence-based comparison against a defined standard that ends in named findings** — gaps, risks, or non-conformances, each with a recommendation. If you skip straight to "here's how we compare," you've written a book report, not an audit. The discipline is what makes it useful: someone reading the findings should be able to act on them without re-deriving the analysis themselves.

Five things distinguish an audit from a casual comparison, and each one has a concrete failure mode if you skip it:

- **Systematic** — you follow the same method across every dimension, not a deeper dive on the parts you find interesting and a wave-through on the rest. Skipping this means the report reflects what caught your attention, not what's actually there.
- **Independent** — you're not grading your own homework from memory. Even when auditing your own team's work, go back to the actual artifacts rather than trusting your mental model of "what we probably do."
- **Evidence-based** — every claim in the findings traces to something you actually read: a file, a fetched page, a config, a commit. "We probably handle this" is not a finding; "here's the line in `CLAUDE.md` that does/doesn't handle this" is.
- **Against a standard** — you need the benchmark defined *before* you start comparing, or you'll unconsciously redefine "good" to match whatever you already do. Extract the standard's actual structure first; resist the urge to paraphrase it into your own framing.
- **Produces findings** — the deliverable is a report with a verdict per dimension and a recommendation, not a narrative essay. If someone can't skim the table and know what to fix, the audit didn't produce findings.

## The method

Run these steps in order. Don't jump to writing the report before step 3 is done — the whole point of an audit is that the standard and the evidence are locked in before the comparison happens.

### 1. Define the standard

Identify exactly what you're auditing against. If it's a URL (a course page, a spec, a policy doc), fetch it — don't reconstruct it from what you already know about "what these courses usually cover." If it's a written policy or framework the user hands you, read the whole thing rather than skimming for keywords.

Extract the standard's **actual structure** — its stages, modules, principles, or clauses, in its own terms. Resist collapsing it into a framework you already have in your head; if the standard names five stages, your audit should have (up to) five dimensions that map to them, not three because two felt redundant to you.

### 2. Define the scope and gather artifacts (the ecosystem side)

Figure out what "the thing being audited" actually is — a codebase, a set of docs, a workflow, a product, a team's practices — and go read the real artifacts: the actual conventions doc, the actual schema files, the actual commit history, the actual component code. Not your memory of the codebase from three conversations ago. If you're auditing your own work, this is the moment to be independent from yourself — check the file, don't trust the summary you'd give someone at a standup.

If an artifact plausibly relevant to a dimension doesn't exist, that's evidence too — "no file addresses this" is a finding, not a blocker.

### 3. Map standard dimensions to evidence questions

For each dimension in the standard, write down the specific question you're going to answer with evidence: not "do we do AI governance" but "does this repo have a written incident-response process, and where." This step is what keeps step 4 systematic instead of impressionistic — you're committing to what "evidence" looks like before you go looking for it, so you don't quietly lower the bar for dimensions where you already suspect the answer is bad.

Flag dimensions that plausibly don't apply to this ecosystem at all (e.g. a course module on customer-facing AI UX patterns, audited against a project that has no customer-facing AI features). Mark these **N/A** rather than forcing a Match/Drift/Gap verdict — a fabricated "Match" on a dimension that doesn't apply is worse than an honest N/A, and an audit that pretends everything applies to everything isn't being systematic, it's being evasive.

### 4. Gather evidence and assign a verdict per dimension

For each dimension (that isn't N/A), gather the actual evidence and assign one of:

- **Match** — the ecosystem substantively addresses this dimension. Cite the specific file/section/practice that does it.
- **Drift** — something exists, but it diverges from the standard in a specific way (different terminology for the same idea, a partial implementation, an outdated version of a practice the standard has moved past). Name the divergence precisely — "we do X, the standard wants Y, the difference is Z" — not just "somewhat different."
- **Gap** — nothing in the ecosystem addresses this dimension. Say so plainly; don't soften a real gap into "an opportunity for future exploration" if the honest read is "this doesn't exist here."

A verdict without a citation isn't a finding — it's an assertion. If you can't point to the evidence, you don't have a verdict yet; go find the evidence or mark it a Gap.

### 5. Write the findings report

Use the template below. Every row must have a real citation. The report ends with recommendations — each finding that isn't a clean Match should suggest what closing it would look like, even briefly. Don't recommend fixing an N/A; explain in one line why it doesn't apply instead.

## Report template

```markdown
# Alignment Audit — [Ecosystem name] vs. [Standard name]

**Date:** [date]
**Standard source:** [URL or document reference]
**Scope of ecosystem reviewed:** [what you actually looked at — files, repos, docs]

## Summary

[2-4 sentences: how many dimensions, how many Match/Drift/Gap/N/A, the single
biggest finding. Not a restatement of every row — the headline.]

## Findings

| Dimension (from standard) | Verdict | Evidence | Notes |
|---|---|---|---|
| [Dimension 1 name] | Match / Drift / Gap / N/A | [file/section/practice cited] | [one line: what it does or doesn't do] |
| ... | | | |

## Recommendations

- **[Dimension with Drift or Gap]** — [what closing this would look like, briefly]
- ...

## Framing caveats

[Any structural reason the comparison itself is imperfect — e.g. the standard
assumes a different context than the ecosystem operates in. This isn't a
hedge on your findings; it's evidence-based context the reader needs to
weigh them correctly.]
```

## Evidence-gathering notes

- **Standard side:** use WebFetch for URLs. If the page is thin (marketing copy, JS-rendered content that doesn't fully resolve), say so in the report rather than padding the dimension list with inferred content the fetch didn't actually surface.
- **Ecosystem side:** read the real files. For a codebase or monorepo, that means the actual conventions doc (e.g. `CLAUDE.md`), schema files, recent commits — not a description of the codebase from earlier in the conversation. For a workflow or team practice, that means whatever's actually written down (runbooks, process docs) plus, if you have access, a look at recent artifacts (recent PRs, recent tickets) rather than the stated process alone — stated process and actual practice can diverge, and that divergence is itself worth a Drift finding.
- **Don't force the standard's vocabulary onto the ecosystem or vice versa.** If the standard calls something a "5-Question Framework" and the ecosystem does something structurally similar under a different name, that's a Match with a note on the terminology difference — not a Gap because the exact phrase doesn't appear anywhere.

## Common audit flavors this template covers

The five-step method above is the same regardless of flavor — only "the standard" and "the artifacts" change:

| Flavor | Standard | Artifacts |
|---|---|---|
| Design system audit | Design system spec, token conventions, a11y guidelines | Component code, Storybook stories, token files |
| Content audit | Editorial style guide, content model, IA brief | CMS documents, page templates, taxonomy |
| Accessibility audit | WCAG success criteria | Rendered pages, component markup, contrast ratios |
| Vendor/security audit | Compliance framework, security policy, procurement checklist | Vendor docs, contracts, architecture diagrams |
| Ecosystem alignment audit | A course, framework, methodology, or best-practices doc | A team's actual workflow, conventions, and tooling |

## Worked example

`docs/reports/alignment-audit-maven-ai-pm-vs-sugartown-ai-workflow.md` in this repo is a real, filled-in audit produced with this method: the Maven "AI Product Management Certification" course curriculum as the standard, this repo's own documented AI-assisted workflow (`CLAUDE.md`, the epic/skill system, the mini-release process) as the ecosystem. Read it as a reference for the level of specificity and citation expected — not as a template to copy content from.
