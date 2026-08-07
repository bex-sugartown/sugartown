# Machine-Readable Docs

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-08-07
**Related:** [[instruction-writing-style]] (`docs/conventions/instruction-writing-style.md`), `docs/conventions/technical-doc-style-guide.md`

---

## What this covers

Write every section so it survives being pulled out of its document and read alone.

This applies to every markdown file in the repo, whichever guide owns its content:
`CLAUDE.md`, epic docs, skills, conventions, release artifacts, READMEs. Retrieval does not
respect jurisdiction: an agent loading context, or a search returning a fragment, gets a
slice with everything around it stripped.

These rules are structural. They do not override any guide's rules on content, tone, or
evidence.

## The rules

**Sections stand alone.** Every H2 makes sense with nothing above it. No "as discussed
above", no "this" pointing across a heading boundary.

**Front-load the answer.** The first sentence of a section states the conclusion, not the
setup.

**Headings use the words someone would search for.** "How to cut a release" beats "Release".

**Resolve pronouns at section starts.** "The Studio requires Node 20", not "It requires Node
20". Repeat the subject even where it reads redundantly top to bottom.

**Define a term in each section that depends on it.** One clause. A retrieved chunk cannot
follow a link to a glossary.

**Use plain definitional sentences.** "Pink Moon is the Sugartown design system." Subject,
verb, definition.

**Give every table a lead-in line** saying what it compares.

**State negations.** "This does not cover authentication." Absence reads as an oversight, not
a boundary.

**Do not nest past H3.** If a section needs H4, the H2 above it is two sections.

**Tag every code block with its language.**

**Dates are ISO:** `2026-08-07`, not `Aug 7 2026`.

## Restate or link

Restating a definition costs little when it drifts; restating a procedure costs an incident.

| Content | Rule |
|---|---|
| Procedures, decisions, full explanations | Link. One canonical location. |
| A definition the section depends on | Restate in one clause, every time. |
| A fact another doc owns | Link, plus a one-line summary so the chunk is not a dead end. |
