---
name: glossy
description: Research, draft, and publish a Sugartown glossaryTerm to /glossary. Two gates — Gate 1 researches and proposes the term (cheeky, opinionated, succinct, digital-content register) in an inline table for approval, no hallucination; Gate 2 posts it live to sugartown.io/glossary only after explicit human sign-off. Use for "add a glossary term", "define X", "/glossy".
---

Base directory for this skill: /Users/beckyalice/SUGARTOWN_DEV/sugartown/.claude/skills/glossy

Read and follow all instructions in `docs/glossy-prompt.md`.

**Argument:** the source term(s) to define, plus any related content or context. If no term is given, ask first.

This is a two-gate skill. Do not skip the gate boundary:
- **Gate 1** — research the term (web + Sanity pre-flight), fill as much of the `glossaryTerm` schema as the evidence supports, and present an inline proposal table. No Sanity writes. No hallucination — every claim sourced, unverified optional fields left blank.
- **Gate 2** — only after explicit approval ("yes" / "approved" / "looks good"), create and publish the term to `/glossary`.
