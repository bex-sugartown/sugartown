# Sugartown Technical Documentation Style Guide

> **The rule of thumb:** a doc succeeds when a technical PM who does not write code can make the decision or complete the task without asking a developer.

**Version:** v1.1
**Status:** Active (advisory)
**Owner:** Bex Head
**Last updated:** 2026-08-07
**Related:** [[machine-readable-docs]] (`docs/conventions/machine-readable-docs.md`), [[instruction-writing-style]] (`docs/conventions/instruction-writing-style.md`), [[usage-doc-style-guide]] (`docs/conventions/usage-doc-style-guide.md`), `docs/brand/brand-voice-guide.md`, `docs/brand/node-style-guide.md`, `CLAUDE.md`

---

## 0. Scope and Authority

### What this guide governs

Human-facing explanatory documentation in the Sugartown monorepo:

| Type | Purpose |
|---|---|
| PRD | What we are building and why, before anyone builds it |
| Architecture doc | How a system is shaped and why it is shaped that way |
| ADR | A single decision, its alternatives, and its consequences |
| Runbook | How to perform a recurring operation safely |
| Setup guide | How to get from zero to running |
| Brief | Constraints for a piece of work that is not yet scoped |
| Explanatory README prose | The parts of a README that teach rather than contract |

### What this guide does not govern

| Artifact | Governed by |
|---|---|
| Epic execution prompts | `epic-template.md` |
| Release notes, CHANGELOG, README contract sections | `release-assistant-prompt.md` |
| Component usage docs and Storybook Guidelines helpers | `usage-doc-style-guide.md` |
| Nodes, articles, case studies, marketing copy | `brand-voice-guide.md`, `node-style-guide.md` |

### One exception, and it lives in its own file

Structural rules for retrieval apply to every markdown file in the repo, not only the types
listed above. They are in `docs/conventions/machine-readable-docs.md`, which `CLAUDE.md`
references directly. This guide does not restate them; § 15 points at them.

They are a separate file because reach is the whole point of them, and reach here means a
`CLAUDE.md` pointer. That pointer puts the file into the instruction-surface budget measured
by `pnpm validate:doc-budget`, which this guide at its full length would exceed on its own.

### Authority

This guide is **advisory**. It does not block a release. Where it conflicts, the other doc
wins:

| Conflict | Winner |
|---|---|
| Anything in `CLAUDE.md` | `CLAUDE.md` |
| Tone in reader-facing content | `docs/brand/brand-voice-guide.md` |
| How a sentence in a followed doc is written | `docs/conventions/instruction-writing-style.md` |
| The structure of a type that has its own template | that template |

The third row is the one that needs stating. `instruction-writing-style.md` governs any doc
written to be followed, which includes the runbooks, setup guides and gates here. It decides
how a sentence reads; this guide decides which sections exist and what a decision block holds.

### Not governed by anything

Code comments, JSDoc, PR descriptions, and commit messages currently fall outside every Sugartown writing guide. This is a known gap. Commit messages in particular belong with the release process, since the CHANGELOG is built from them.

---

## 1. The Reader Contract

Every doc opens by naming two things: **who reads it** and **the one decision or action it enables**.

If a doc enables neither a decision nor an action, it is a node or an article. Move it.

**Required opening block:**

```markdown
**Reader:** Technical PM evaluating whether to adopt Sanity's Presentation tool
**You will be able to:** Decide whether Presentation is worth the setup cost for this site
**You will not find here:** Implementation steps (see the setup guide)
```

The third line is not decoration. Naming what is absent stops the reader hunting for something the doc was never going to give them.

**Right:**
> **Reader:** Anyone running a release. **You will be able to:** cut a release from a clean main branch without a developer present.

**Wrong:**
> This document provides an overview of the release process and covers various aspects of the release pipeline.

The wrong version tells you nothing about whether you should keep reading.

---

## 2. Document Type Registry

Each type has a fixed purpose and a fixed set of required sections. Pick the type before you write. Writing first and classifying later produces a doc that is three types at once and useful as none of them.

| Type | Answers | Required sections | Lifecycle |
|---|---|---|---|
| **PRD** | What are we building, for whom, and how will we know it worked? | The 13 in `.claude/skills/sugartown-prd-writer/SKILL.md` §PRD Section Order | Draft → Active → Superseded |
| **Architecture doc** | How is this shaped and what constrains it? | Context, Structure, Data flow, Boundaries, Trade-offs accepted | Active → Superseded |
| **ADR** | Why did we choose this? | Context, Options considered, Decision, Consequences, Reversibility | Proposed → Accepted → Superseded |
| **Runbook** | How do I do this safely, again? | Prerequisites, Steps, Verification, Failure modes, Rollback | Active → Deprecated |
| **Setup guide** | How do I get from nothing to running? | Prerequisites, Steps, Verification, Common failures | Active → Deprecated |
| **Brief** | What are the constraints on work not yet scoped? | What this is, Constraints, Inventory, What this does not cover | Draft → Consumed |

**The out-of-scope section is mandatory on every type.** A doc without an explicit boundary invites scope creep in review and misreading in execution. State deferrals as facts, not roadmap promises. "Not in scope" beats "coming soon."

---

## 3. Front Matter

Every doc carries this block, immediately after the H1 and the rule-of-thumb line:

```markdown
**Version:** vN.N
**Status:** Draft | Active | Superseded | Deprecated
**Owner:** <name>
**Last updated:** YYYY-MM-DD
**Related:** [[doc-name]] (`path/to/doc.md`), `path/to/other.md`
**Supersedes:** <link, if applicable>
```

This is the shape already in `instruction-writing-style.md`, `verification-review.md`,
`user-story-conventions.md` and `machine-readable-docs.md`. Match it rather than starting a
second one.

Rules:

- **Status is not optional.** An undated doc with no status is treated as stale by default.
- **A doc without an owner is nobody's job to fix.** Name a person, not a team.
- **`Related` uses the `[[wikilink]] (path)` form** for docs inside the repo, so the link
  survives a file move and still resolves by name.
- **`Supersedes` is a link, not a description.** If you cannot link the thing you replaced, you have not replaced it.

---

## 4. Plain Language

The Node Style Guide's "write for the smart outsider" principle is advice for nodes. Here it is the rule.

### The one-sentence-of-context rule

Explain the thing before you depend on it. One sentence of context earns you the rest of the paragraph.

> **Right:** "GROQ is Sanity's query language. It is how the site asks the CMS for content, the way SQL asks a database for rows. Four GROQ queries reference the slug field, and all four must change together."
>
> **Wrong:** "The four GROQ slug queries must be updated in lockstep to preserve referential integrity across the projection."

The right version costs one sentence and gains every reader who has not written GROQ.

### Jargon policy

- **Define on first use, inline, in one clause.** No glossary detours, no callout boxes. "Turborepo (the tool that decides which parts of the monorepo need rebuilding when something changes)."
- **Expand every acronym once per document.** Not once per repo. Readers arrive mid-way.
- **Analogy is a first-class tool.** A well-chosen analogy does more work than a paragraph of accurate jargon. Use it freely.
- **Do not define the same term twice in one doc.** Once is teaching. Twice is condescension.

### Sentence and paragraph discipline

- One idea per sentence. If you need a semicolon to hold it together, it is two sentences.
- Paragraphs cap at four sentences in a technical doc. Beyond that, the reader is skimming and you have lost control of what they take away.
- The first sentence of every section is a standalone summary. A reader who reads only first sentences should get the shape of the doc.

### Banned constructions

Inherited from the Brand Voice Guide and non-negotiable here:

- No em dashes. Use commas, parentheses, colons, or two sentences. Exception: the `Title — Subtitle` heading separator.
- No "leverage," "utilize," "facilitate." Use "use," "use," "help."
- No adjective triads. "Robust, scalable, and maintainable" is decoration. Use one specific adjective or a number.
- No filler transitions. "That said," "With that in mind," "It's worth noting that," "At the end of the day."
- No hedge stacking. "I think this could possibly" is a position you have not taken.
- No future-tense promises about shipped capability.
- No decorative emoji.

Read it aloud. If it sounds like a chatbot, rewrite it.

---

## 5. Decision Blocks

This is the section that does the work you asked for.

A technical doc frequently asks the reader to choose. Most documentation presents the choice and stops, which leaves a non-developer reader unable to act. A decision block presents the choice **and everything needed to make it**.

### The template

```markdown
### Decision: <the thing being decided, phrased as a noun>

**Who decides:** <role or name>
**Reversible:** Yes | No | Reversible but costly
**Blocks:** <what cannot proceed until this is decided>
**Decide by:** <date or milestone, or "no deadline">

| Option | What it means in practice | Effort | What it costs you later |
|---|---|---|---|
| A. <name> | <plain language, no jargon> | <S/M/L or hours> | <the real trade-off> |
| B. <name> | | | |

**Recommendation:** B.

**Why:** <two sentences maximum. The reason, not the summary.>

**What I need from you:** a letter.

**Decided:** <letter · YYYY-MM-DD · who> — filled in when the answer arrives, in this block.
```

### The rules

1. **Never present a bare choice.** "We could use Option A or Option B" without a recommendation is passing the work back to the reader. State a recommendation even when the options are close, and say they are close.

2. **"What it means in practice" is written for the person who will live with it, not the person who will build it.** Not "introduces a build-time transform step." Instead: "adds about 20 seconds to every build, and a new failure mode when tokens are malformed."

3. **Reversibility is the most important field and the most commonly omitted.** A reversible decision made quickly is cheap. An irreversible decision made quickly is expensive. Say which one this is, because it tells the reader how much time to spend.

4. **"What it costs you later" is not the same as effort.** Effort is what it takes to build. Cost is what you are stuck with. A one-hour choice can carry a two-year cost.

5. **Two to four options.** One option is not a decision, write it as a statement. Five options means you have not done the thinking yet.

6. **Do not hide the recommendation in prose.** It goes on its own line, in bold, with a letter.

7. **Record the answer in the block, not in the conversation that produced it.** A decision block with no `Decided` line is still open, whatever was agreed verbally. A block past its `Decide by` date with no `Decided` line is a finding at the next review of that doc.

### Right

> ### Decision: Where the design system package boundary sits
>
> **Who decides:** Bex
> **Reversible:** Reversible but costly. Moving it later means touching every import in `apps/web`.
> **Blocks:** Storybook setup cannot start until this is settled.
>
> | Option | What it means in practice | Effort | What it costs you later |
> |---|---|---|---|
> | A. Web imports the design system directly | Fastest to set up. Components and app code drift together. | S | The design system stops being portable. Swapping the frontend means rewriting it. |
> | B. Web goes through an adapter layer | One extra file per component. A lint rule enforces the boundary. | M | Slightly more ceremony on every new component, forever. |
>
> **Recommendation:** B.
>
> **Why:** Portability is the entire claim the monorepo is making. Option A quietly retires that claim in exchange for about a day of setup time.
>
> **What I need from you:** a letter.

### Wrong

> There are a couple of approaches to the package boundary. We could import directly, which is simpler, or use an adapter layer, which is more architecturally sound but adds complexity. Both have trade-offs and it depends on priorities.

Nobody can act on that paragraph.

---

## 6. Gates and Prerequisites

A gate is any point where the reader must stop and confirm something before continuing. Sugartown uses gates heavily and correctly. This section is about writing them so they can actually be cleared.

**A gate that says what to check but not how to check it is a blocker disguised as a rule.** The non-developer reader hits it and stops, because they have no way to know whether they passed.

### The four required parts

Every gate states all four. Missing any one makes the gate unclearable by someone outside the code.

```markdown
### Gate N: <short name>

**Blocking:** Yes | No
**What it checks:** <one sentence>
**How to verify:** <exact, observable steps. A command, a file to open, a screen to look at.>
**What must make it fail:** <the deliberately broken input that proves it still fires, or
  "no probe — <reason>">
**What reaches production without it:** <every path that skips it, or "none known">
**If it fails:** <what to do, and who to ask>
**Who can waive:** <name, or "nobody">
```

The last two fields are the Canary and Bypass questions from
`docs/conventions/verification-review.md`. A gate documented here that also exists in code
belongs in `docs/ai/agentic-caucus/control-register.md`; fill these two fields from its row
rather than writing a second answer.

### Right

> ### Gate 2: Storybook validation before template work
>
> **Blocking:** Yes
> **What it checks:** The component renders correctly in isolation before it goes anywhere near a page.
> **How to verify:** Run `pnpm storybook`, open the component's story in the browser, and compare it against the vspec side by side. Produce the comparison table. Do not accept a self-assessment from the agent.
> **What must make it fail:** A story with a deliberate token swap (a hardcoded hex where the vspec specifies `--st-color-brand-primary`) must produce a Drift row. If it does not, the comparison is being read, not run.
> **What reaches production without it:** A component edited directly in `apps/web/src/` with no story. Storybook only sees components that have one.
> **If it fails:** Stop. The component is not ready for a template. Return to component work and re-run this gate.
> **Who can waive:** Nobody. This gate exists because self-certified visual correctness has failed before.

### Wrong

> **Gate 2:** Components must be validated in Storybook before template integration.

That is a rule, not a gate. The reader cannot tell what "validated" means or how to know when it is done.

### Additional rules

- **Say whether the gate is blocking.** A non-blocking gate the reader treats as blocking costs a day. A blocking gate the reader treats as advisory costs a release.
- **"How to verify" must be observable.** "Confirm the API is stable" is not observable. "Confirm no open PRs rename a prop, and no prop is marked deprecated without a named replacement" is.
- **Name the input that must make it fail.** A gate that has never been shown failing is a gate nobody has confirmed fires. (INC-011: four architectural boundary rules were declared on 2026-02-01 and noticed to have never fired on 2026-07-27.)
- **List the paths that skip it.** "None known" is someone's assertion and is worth writing down as one. A gate with no stated bypass has usually not been asked the question.
- **Name who can waive it.** "Nobody" is a valid and useful answer. An unwaivable gate with no stated waiver authority gets waived by whoever is in a hurry.
- **State the reason for hard gates in one clause.** A gate whose cost is visible and whose benefit is not will be routed around. "This gate exists because X failed in SUG-152" buys compliance that "this is required" does not.

---

## 7. Terminology

### Where terms are defined

This guide defines no terms. Each is owned by the doc closest to the thing it names:

| Terms | Owner |
|---|---|
| `--st-*` names, token tiers, aliases | `docs/conventions/token-naming.md` |
| vspec, prototype trigger, Phase 0 | `CLAUDE.md` §Phase 0 hard-stop, SUG-242 |
| Node, Article, case study, glossary term | `docs/brand/node-style-guide.md`, `docs/brand/brand-voice-guide.md` |
| Liveness, Canary, Bypass, Claim, Reader | `docs/conventions/verification-review.md` |
| Words to avoid in instructions | `docs/conventions/instruction-writing-style.md` |

A term with no owner in this table has none. Say so when you use it, rather than defining it
here and creating a second answer.

**One rule has no owner and stays here until it gets one:** `featuredImage` never appears in a
new implementation, and any reference to it carries an explicit deprecation label. Grepped
2026-08-07 across `docs/conventions/` and `CLAUDE.md`: this guide is the only place it is
stated. `schema-conventions.md` is where it belongs.

### Naming discipline

- **Use the same word for the same thing throughout a doc.** Synonym variety is good prose and bad documentation. If it is a "gate" in section 2, it is not a "checkpoint" in section 5.
- **Use the field name, not the concept, when precision matters.** And use the concept, not the field name, when the reader does not need the field.
- **Do not invent a term when one exists.** Check the glossary and the existing docs first.

---

## 8. Formatting

### Structure

- **Headings carry meaning.** "The Setup" tells the reader what is coming. "Section 2" does not.
- **Heading levels are semantic, never chosen for visual weight.** Do not skip from H2 to H4 because H3 looks too big.
- **Every doc over 800 words opens with a TL;DR block.**

### Tables over prose

Above two comparison dimensions, use a table. A paragraph narrating three options across three attributes is a table that has not been written yet.

### Lists

Bullets are for parallel items. Same grammatical structure, same level of abstraction. If the items are not parallel, write sentences. A bulleted list of non-parallel fragments is prose avoidance.

Numbered lists are for sequences only. If order does not matter, use bullets.

### Callouts

Three types. No others.

| Type | Markup | Use for |
|---|---|---|
| Note | `> **Note:**` | Useful context the reader can skip |
| Warning | `> **Warning:**` | Something that will cost time or money if ignored |
| Blocking | `> **Stop:**` | Do not proceed past this point until resolved |

Do not use a warning where a note will do. Inflation makes the real warnings invisible.

### Bold

One bolded phrase per paragraph, maximum. It marks the single thing the skimmer must catch. Bold everywhere marks nothing.

---

## 9. Commands and Code

This section exists because a non-developer running a command they do not understand is the highest-risk moment in any doc.

### Every command block gets a preceding plain-English line

State what it does and what changes as a result.

**Right:**
> Install the dependencies for every app and package in the repo. This creates a `node_modules` folder and takes two to three minutes on a first run.
> ```bash
> pnpm install
> ```

**Wrong:**
> ```bash
> pnpm install
> ```

### Placeholders

Use `<ANGLE_BRACKETS_IN_CAPS>` for anything the reader substitutes. Say what goes there.

> Replace `<BRANCH_NAME>` with the branch you are working on, for example `feat/SUG-201-chip-docs`.
> ```bash
> git checkout -b <BRANCH_NAME>
> ```

### Destructive commands

Any command that deletes, overwrites, force-pushes, or touches production carries a `> **Stop:**` callout above it stating what is lost and whether it is recoverable.

### Verification

Every procedure ends with a verification step: what the reader should see if it worked. "You should see `Local: http://localhost:5173` in the terminal." Without it, the reader cannot distinguish success from silent failure.

### Failure modes

List the two or three most common failures with their fixes. Not every possible failure. The common ones.

### Inline code

Use inline code for file paths, field names, commands, and package names. Do not use it for emphasis.

---

## 10. Diagrams and Screenshots

### When a diagram is required

- Any pipeline or sequence with more than three steps.
- Any relationship between more than three entities.
- Any architecture doc. An architecture doc without a diagram is a description of a diagram.

Prose narrating a flow is a diagram that has not been drawn yet.

### Conventions

- **Mermaid is the default** for flows, sequences, and entity relationships. It lives in version control and diffs cleanly.
- **Screenshots are for UI only,** never for text or code. A screenshot of a terminal cannot be copied, searched, or read by a screen reader.
- **Annotate screenshots.** An unannotated screenshot asks the reader to guess what they are looking at.
- **Every diagram and screenshot carries alt text** describing what it shows, not what it is. "Content flows from Sanity through the adapter to the web app" beats "architecture diagram."
- **Every diagram carries a caption** stating the one thing it proves.

---

## 11. Cross-References and Source of Truth

### Point, do not copy

When information lives in another doc, link to it. Do not restate it. Restated content drifts, and the drifted copy is indistinguishable from the correct one.

The exception: a one-line summary plus a link is acceptable when the reader needs the gist to keep reading. A full restatement is not.

> **Right:** "Web does not import from the design system directly. The boundary is enforced by ESLint. See [Architecture § Boundaries](#)."
>
> **Wrong:** A three-paragraph reproduction of the boundary rules.

### Every figure carries the command that produced it

A count, size, duration, line number or percentage names the command or file that produces it,
and the date it was run. Quote a figure from another doc and you have copied a number that was
true once, with nothing attached that would tell a reader it has stopped being true.

> **Right:** "13 genuine hits (`grep -rnoiE "<list>" CLAUDE.md docs/conventions/ …`, 2026-08-07)."
>
> **Wrong:** "The check returns zero hits."

This is `CLAUDE.md`'s red-pen rule applied to prose rather than diagrams. It is the most
repeated correction in this repo's recent history: SUG-243 carried three stale figures in its
own Scope, SUG-245 cost three correction commits, and SUG-256 exists because a published
tally was true when written and never re-measured.

A figure you cannot attach a command to is an estimate. Label it as one.

### Conflict resolution

When two docs disagree:

1. `CLAUDE.md` wins on operating rules.
2. The doc with the more recent `Last updated` wins on facts.
3. If neither resolves it, the disagreement is a bug. File it, do not pick a side silently.

### Link text

Link text describes the destination. "See the [release process](#)" beats "click [here](#)." Screen reader users navigate by link list, where "here" is useless.

---

## 12. Status, Versioning, and Deprecation

### Status vocabulary

| Status | Meaning |
|---|---|
| `Draft` | In progress. Do not act on it. |
| `Active` | Current and trustworthy. |
| `Superseded` | Replaced. The header links to the replacement. |
| `Deprecated` | The thing it documents is going away. The header says by when and what replaces it. |

### Deprecation

Deprecating a doc means editing it, not deleting it. Add a banner at the top:

```markdown
> **Deprecated as of v2026.08.07.** This describes the WordPress publishing flow, which is no longer in use. See [the Sanity publishing guide](#).
```

Deleting a deprecated doc breaks every link to it and erases the record of what changed. Sugartown's claim is that it versions its own history. Deleting is inconsistent with that.

### When a doc changes

- **Substantive change:** bump the version, update `Last updated`, add a changelog entry at the bottom of the doc.
- **Typo or formatting:** update `Last updated` only.
- **Contract or behavior change:** follow `release-assistant-prompt.md`. That is outside this guide's jurisdiction.

Every doc over 500 words carries a changelog section at the bottom. Newest entry first.

---

## 13. Accessibility

Baseline is WCAG 2.1 AA, matching the accessibility gate in the release pipeline.

- **Heading order is never skipped.** H2 follows H1. H3 follows H2. Screen reader users navigate by heading structure, and a skipped level reads as a missing section.
- **Alt text on every image and diagram.** Describe the content, not the medium.
- **Link text is descriptive.** Never "here," "this," or a bare URL.
- **No meaning conveyed by color alone.** If a table uses green and red to signal pass and fail, it also uses the words "pass" and "fail."
- **Tables have header rows.** A table without a header row is unreadable to a screen reader.
- **Do not use tables for layout.** Tables mean tabular data.

---

## 14. AI Chat Guidance

This section governs how Claude behaves in a Sugartown planning conversation, not just what it writes into files. The same standards apply, because a chat answer is documentation with a shorter half-life.

### Orient before acting

Read, report what was found, propose an approach, and wait for confirmation before making changes. Epic gates enforce this. In chat, it means: do not start producing the artifact until the shape of the artifact is agreed.

### Present decisions, not options

Every choice offered in chat uses the same discipline as § 5: labeled options, a stated recommendation, the reason, and the cost of being wrong. An answer that lays out possibilities and stops has moved the work back to the reader.

### Surface non-obvious implications

Do not just execute the request. If the choice has a consequence the reader has not named, name it. This is the difference between a tool and a collaborator.

### Never invent

Do not invent file paths, field names, version numbers, commit hashes, dates, or metrics. If the fact is not in context, say so and offer to look it up. An invented file path costs more time to disprove than it saved to produce.

Say "I do not know" plainly. It is a complete answer.

### Lead with the product consequence

When explaining code or architecture to a non-developer reader, open with what it means for the product, then go into how it works. Not the reverse. The reader may not need the second half, and they will know after the first sentence.

### Do not self-certify

Visual correctness, accessibility compliance, and test coverage are human-gated. Produce the comparison table or the evidence, and let a human make the call.

### Match the register

Governance and technical docs are direct, dry, and precise. Nothing flows backward. Nothing is inferred. Nothing is invented.

---

## 15. Machine-Readable Structure

Structural rules for retrieval live in `docs/conventions/machine-readable-docs.md`. They
apply to every markdown file in the repo, including the types this guide does not otherwise
govern.

They are not restated here. A second copy of a rule drifts from the first, and § 11 of this
guide is the rule against exactly that.

The § 16 checklist below carries the same rules as tick items. If the two ever disagree,
`machine-readable-docs.md` is correct and this checklist is stale.

---

## 16. Pre-Publish Checklist

Advisory. Run it before sharing a doc.

**Reader and scope**
- [ ] The doc names its reader and the decision or action it enables
- [ ] The doc names what it does not cover
- [ ] The document type is one of the six in § 2, and carries that type's required sections

**Front matter**
- [ ] Version, status, owner, last updated are present
- [ ] `Supersedes` links to the replaced doc, if applicable

**Language**
- [ ] Every acronym expanded on first use
- [ ] Every piece of jargon defined inline on first use
- [ ] No em dashes, no adjective triads, no filler transitions, no hedge stacking
- [ ] No "leverage," "utilize," "facilitate"
- [ ] No future-tense promises about shipped capability
- [ ] Read aloud once

**Decisions and gates**
- [ ] Every choice carries a recommendation, a reason, and a reversibility statement
- [ ] Every resolved choice carries a `Decided` line with the letter, the date, and who
- [ ] Every gate states what it checks, how to verify, what must make it fail, what reaches production without it, what to do on failure, and who can waive
- [ ] Every "how to verify" step is observable by someone who does not read code

**Commands**
- [ ] Every command block has a plain-English line above it
- [ ] Every destructive command carries a Stop callout
- [ ] Every procedure ends with a verification step
- [ ] Placeholders use `<CAPS_IN_BRACKETS>` and are explained

**Structure**
- [ ] Any comparison above two dimensions is a table
- [ ] Any flow above three steps has a diagram
- [ ] Headings carry meaning and skip no levels
- [ ] First sentence of each section is a standalone summary

**Accessibility**
- [ ] Alt text on every image and diagram
- [ ] Descriptive link text, no bare URLs or "click here"
- [ ] No meaning carried by color alone
- [ ] Tables have header rows

**References**
- [ ] No procedure or explanation restated from another doc, only linked
- [ ] Every figure names the command that produced it and the date it was run
- [ ] No term defined here that § 7 assigns to another doc
- [ ] All links resolve

**Machine-readable**
- [ ] Every section makes sense pulled out of the doc and read alone
- [ ] No "as discussed above" or cross-heading "this"
- [ ] Subjects repeated at section starts, not left as pronouns
- [ ] Terms defined inline in each section where they carry weight
- [ ] Tables have a lead-in line saying what they compare
- [ ] Code blocks are language-tagged
- [ ] No headings below H3
- [ ] Dates in front matter are ISO format

### Automatable later

If this ever moves from advisory to enforced, these are the items a linter could catch without judgment: em dashes, heading level skips, headings below H3, missing alt text, bare "click here" link text, missing or malformed front matter fields, non-ISO dates, untagged code blocks, broken links, banned words. The rest need a human.

Note that most of § 15 is machine-checkable, which makes it the cheapest section to enforce if enforcement ever becomes worthwhile.

---

## Changelog

### v1.1 — 2026-08-07

- § 0 authority became a table, adding the row for `instruction-writing-style.md`: it owns how a sentence in a followed doc is written, this guide owns which sections exist.
- § 2's PRD row now points at `sugartown-prd-writer`'s 13 sections instead of naming a conflicting 6.
- § 3 front matter matches the shape four convention docs already use: `vN.N`, ISO dates, `Related` with `[[wikilink]] (path)`.
- § 5 decision blocks gain a `Decided` line. A block with no `Decided` line is open, whatever was agreed in conversation.
- § 7 stopped defining terms and now names the doc that owns each. `featuredImage` is the one rule with no owner elsewhere and stays until it has one.
- § 11 gains the rule that every figure carries its command and date.
- Version scheme moved from `vYYYY.MM.DD` to `vN.N` to match the rest of `docs/conventions/`.

### v2026.08.07

- Initial version. Scoped to human-facing docs. Advisory posture. Sections 5 (Decision Blocks) and 6 (Gates and Prerequisites) written as the core of the guide, on the principle that a doc which asks a non-developer to decide must supply the basis for deciding.
- Added § 15 (Machine-Readable Structure), covering in-repo agent and retrieval consumption. Includes an explicit resolution of the conflict between § 11's point-do-not-copy rule and chunk self-containment.
- Carved § 15 out of the guide's normal jurisdiction: it applies to every markdown file in the repo, because retrieval chunks all files identically regardless of which guide owns them. Requires a pointer from `CLAUDE.md` to take effect.
- Named code comments, JSDoc, PR descriptions, and commit messages as ungoverned by any current writing guide.

---

*Last updated: August 7, 2026*
