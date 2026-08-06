---
name: glossy
description: Research, draft, and publish Sugartown glossaryTerm(s) to /glossary. Accepts one term, a pasted list, or an uploaded file (txt/md/csv/Evernote enex export). Extracts source links from the export and adds canonical authoritative sources for credibility. Two gates — Gate 1 researches and proposes the term(s) (cheeky, opinionated, succinct, digital-content register) in an inline table for approval, no hallucination; Gate 2 posts approved rows live to sugartown.io/glossary only after explicit human sign-off. Use for "add a glossary term", "define X", "batch add glossary terms", "/glossy".
---

Base directory for this skill: ./.claude/skills/glossy

Read and follow all instructions in `docs/glossy-prompt.md` (repo root, not under this skill's own base directory).

**Argument:** the source term(s) to define, plus any related content or context. If no term is given, ask first.

This is a two-gate skill. Do not skip the gate boundary:
- **Gate 1** — research the term (web + Sanity pre-flight), fill as much of the `glossaryTerm` schema as the evidence supports, and present an inline proposal table. No Sanity writes. No hallucination — every claim sourced, unverified optional fields left blank.
- **Gate 2** — only after explicit approval ("yes" / "approved" / "looks good"), create and publish the term to `/glossary`.
