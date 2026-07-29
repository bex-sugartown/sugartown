# Instruction Writing Style

**Version:** v1.1
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-07-29
**Related:** `docs/brand/brand-voice-guide.md`, `docs/conventions/verification-review.md`

---

## What this covers

Anything written to be followed rather than read. The surface does not matter:

- `CLAUDE.md`
- `.claude/skills/**/SKILL.md`
- `docs/epic-template.md`
- `docs/conventions/*.md`
- `docs/ai/agentic-caucus/*.md`
- README and setup docs
- Session replies that recommend, compare, or propose a course of action (a briefing
  asked for in full is a report, not an instruction)

`docs/brand/brand-voice-guide.md` covers reader-facing content: articles, nodes, case
studies, page copy. That guide is about personality. This one is about speed.

They are different jobs. Published content is read once, closely, by a person deciding
what they think of you. An instruction is scanned hundreds of times by someone trying to
get on with a task. Personality costs nothing in the first case. In the second it costs
attention, and attention is what makes a rule fire.

## The test

**Can someone follow the rule after reading only the first sentence?**

If not, the first sentence is not the instruction. Move it up.

## Six rules

**1. Instruction first.** The first sentence says what to do. Motivation, history, and
consequences come after, or not at all.

**2. Say it once.** State the rule, then stop. Do not restate it as a consequence, then
again as a summary, then again as a memorable line. Repetition reads as emphasis while
you are writing it and as padding when someone is scanning it.

**3. No closing aphorism.** "Configured is not enforced." "A rule that cannot be enforced
is not governance." These are second copies of the sentence above them. Cut them.

**4. Rationale gets one clause, or its own file.** If knowing why is needed to follow the
rule correctly, give it a clause in brackets. If it is a story with dates and epic
numbers, it belongs in the incident log, the failure-mode registry, or a rules audit.
Link to it.

**5. Short sentences. Plain words.** One idea per sentence. Prefer "use" over "utilise",
"stops" over "terminates", "check" over "verify the state of". No metaphors. No
rhetorical questions.

**6. Structure over prose.** A set of things is a table or a list. Three or more
conditions is a table. Do not write a paragraph that a reader has to parse into a list.

## Before and after

From CLAUDE.md, 82 words:

> **CI logs are not an audit oracle.** When measuring the state of a gate (lint errors,
> test failures, validator results), run it locally and read the real output — never
> summarise from a CI log. `turbo run <task>` is fail-fast: it reports the first failing
> package and never reaches the rest, so a CI log systematically *understates* breakage.
> This bit SUG-255's own scoping — the CI log showed 7 lint errors in one package; a
> local run found 84 across three. An audit quoting a CI log is quoting a truncated view.

Rewritten, 38 words:

> **To measure a gate's state, run it locally and read the output.** Do not summarise
> from a CI log. `turbo run` stops at the first failing package, so CI logs undercount.
> (SUG-255: CI showed 7 lint errors, a local run showed 84.)

Same instruction. Same evidence. Half the words. The epic number stays because it makes
the claim checkable.

## Words to avoid

These are the ones that keep appearing. Plain replacements on the right.

| Avoid | Use |
|---|---|
| brevity | shorter, fewer words |
| fortnight | two weeks |
| archaeology | reading back through, reconstructing |
| an order of magnitude | much, 10x |
| inert | does nothing, does not fire |
| theatre | does nothing, is not read |
| launder | hide, disguise |
| folklore | undocumented, tribal knowledge |
| by construction | by design, always |
| in miniature | a small version of |
| contagious, spreads | copied, picked up |

Check before committing:

```bash
grep -onE "brevity|fortnight|archaeology|order of magnitude|inert|theatre|launder|folklore|by construction|in miniature|contagious" <file>
```

The list is not exhaustive. Add to it when a new one shows up.

## What not to cut

Do not compress a rule until it stops working. Specifically, keep:

- File paths, commands, token names, and exact numbers. These are the checkable parts.
- Epic and incident IDs. One per rule is enough.
- The condition that makes a rule fire. "Before writing any CSS class" is not padding.
- A short "why" where the rule looks arbitrary without it. One clause.

A rule nobody can follow is worse than a rule that runs long.

## Em dashes

The reader-facing ban does not apply here. Plain English rarely needs one anyway. If a
comma or a full stop works, use it.

## Applying this

New agent-facing docs follow this from the start. Existing docs are rewritten when they
are next edited for another reason, or in a dedicated pass. Do not open a doc solely to
restyle it while the rule it contains is under review.
