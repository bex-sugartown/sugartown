# Skills Index

**Version:** v1.1
**Last updated:** 2026-09-04 (generated block)
**Owner:** Bex Head

---

## What This Is

Two skill systems run in parallel for this project. This file is the inventory that covers both.

---

## Claude Code Skills and Commands

Invokable via `/skill-name` in any Claude Code session. Most live in `.claude/skills/`;
a few are thin commands in `.claude/commands/` that point at a prompt file in `docs/`.
The `Where` column says which. **The table between the markers is generated** by
`pnpm docs:skills-index` from each `SKILL.md`'s frontmatter and each command file; edit those,
not the table. `pnpm docs:skills-index --check` fails when it is stale.

<!-- generated:claude-code-skills:start -->
| Skill | Trigger | Where | What it does |
|---|---|---|---|
| `alignment-audit` | `/alignment-audit` | `skills/` | Run a systematic, evidence-based audit comparing something you have (a codebase, a team's workflow, a product, an org's process) against an external standard (a course curriculum, a framework, a spec, a policy, best-prac |
| `becky-boop` | `/becky-boop` | `skills/` | Generate a self-contained Becky B00p hero banner prompt for any AI image generator — contextualised to the article, node, or post currently being worked on, or to text passed after the slash command. |
| `chromatic` | `/chromatic` | `skills/` | Run Chromatic VRT, report visual diffs, gate on human approval, record status |
| `glossy` | `/glossy` | `skills/` | Research, draft, and publish Sugartown glossaryTerm(s) to /glossary. |
| `morning` | `/morning` | `skills/` | Run the Sugartown morning housekeeping check — git health, service status, branch briefing and recommended actions |
| `new-epic` | `/new-epic` | `skills/` | Create a new Sugartown epic — GitHub issue + backlog stub + commit |
| `new-tool` | `/new-tool` | `skills/` | File a new Sugartown tool — validator, gate, hook, script, generator, command or skill. |
| `post-mortem` | `/post-mortem` | `commands/` | Thin command. Prompt: `docs/post-mortem-prompt.md` |
| `red-pen` | `/red-pen` | `skills/` | Editorial review of Sugartown content (articles, nodes, case studies, glossary terms, page copy) against the brand voice guides, with accuracy checking, sharpness recommendations, and a two-gate approval flow before any  |
| `release` | `/release` | `commands/` | Thin command. Prompt: `docs/workflows/release-assistant-prompt.md` |
| `restart` | `/restart` | `skills/` | Check which Sugartown dev servers are running and restart any that are down. |
| `ship` | `/ship` | `commands/` | Thin command. Prompt: `docs/ship-prompt.md` |
| `sugartown-epic-writer` | `/sugartown-epic-writer` | `skills/` | Write a Claude Code epic execution prompt for Sugartown monorepo implementation work. |
| `sugartown-prd-writer` | `/sugartown-prd-writer` | `skills/` | Write a human-facing Product Requirements Document for CMS/headless architecture, design system governance, or ecommerce/platform implementation work. |
| `switch` | `/switch` | `skills/` | Sync the Sugartown repo across machines (desktop ⇄ laptop). |
| `update-cwv` | `/update-cwv` | `skills/` | Run Lighthouse CI against production, update PERF_BACKUP in CwvSnapshot.jsx, show diff summary, offer to commit |
| `write-blog` | `/write-blog` | `skills/` | Draft and create an article (blog post) as a Sanity draft — Bex voice, article schema, taxonomy pre-flight, creates drafts.* document |
| `write-casestudy` | `/write-casestudy` | `skills/` | Draft and create a portfolio case study as a Sanity draft — Bex voice ("show the receipts"), caseStudy schema, canonical section order (Challenge callout, outcome tiles, Overview, FAQ accordion with semantic="faq" for AE |
| `write-node` | `/write-node` | `skills/` | Draft and create a Knowledge Graph node post as a Sanity draft — follows arc, agent voice, taxonomy pre-flight, creates drafts.* document |
<!-- generated:claude-code-skills:end -->

### Deprecated

Kept per the Notes below: a retired row stays as a record of what existed.

| Skill | Retired | Replaced by |
|---|---|---|
| `eod` (`/eod`) | 2026-08-19, SUG-100 S9/S16 | `/ship` — same push/deploy/CI-verify job, run on demand rather than at end of day |
| `mini-release` (`/mini-release`) | 2026-08-19, SUG-100 S9/S16 | `/ship --release` — the per-epic PATCH tier was retired with it |
| `storybook-docs` (`/storybook-docs`) | not on disk; date unrecorded | none — Guidelines stories are authored directly |

---

## claude.ai Project Skills

Live in claude.ai project knowledge — not on disk in this repo. Invoked by describing the task
in claude.ai; no slash command. `glossy`, `switch`, `sugartown-epic-writer`, and `sugartown-prd-writer`
exist in both systems — the Claude Code versions are the repo-execution layer; the claude.ai
versions are the planning/drafting layer for the same capability.

| Skill | Trigger | What it does | Last updated |
|---|---|---|---|
| `sugartown-epic-writer` | "write an epic", "write a Claude Code prompt", "brief Claude Code on X" | Produces a Claude Code execution epic in the Sugartown epic template format | 2026-04 |
| `sugartown-prd-writer` | "write a PRD", "scope this out", "requirements doc" | Produces a human-facing PRD for CMS/headless, design system, or ecom/platform work | 2026-04 |
| `sugartown-resume-tailor` | "tailor my resume", "cover letter", "I'm applying for" | Tailors the prototype resume to a specific JD and writes the matching cover letter. Strict anti-hallucination rules | 2026-03 |
| `sugartown-interview-prep` | Company name in interview context, "interview prep", "panel prep", "Q&A doc" | Builds interview prep artifacts: HTML case study and role-grouped Q&A doc. Evolves across rounds | 2026-03 |
| `sugartown-interview-debrief` | "that interview was", "debrief", "how did I do", transcript shared | Post-interview debrief. Feeds back into case study and Q&A doc | 2026-03 |
| `sugartown-interview-postmortem` | "rejected", "close out [company]", "post-mortem", process has ended | Close-out analysis after a process ends. Portable lessons, re-engagement plan if applicable | 2026-03 |
| `glossy` | `/glossy`, "add a glossary term", "define X for the glossary" | Two-gate flow: proposes a glossaryTerm for approval, then posts it live to sugartown.io/glossary | 2026-03 |
| `switch` | `/switch` | Syncs the repo across machines (desktop/laptop). ARRIVE and LEAVE modes for safe handoff | 2026-03 |

---

## Workflow Prompts — Release Pipeline

A prompt file in `docs/workflows/`, invoked by the `/release` command and by `/ship --release`.
Can also be pasted into Claude Code directly at the start of a release session.

| Prompt | File | What it does |
|---|---|---|
| Release assistant | `docs/workflows/release-assistant-prompt.md` | Five-gate release pipeline: source of truth → CHANGELOG → release notes → commit. Nothing writes without approval. Ends at a local commit — it does not push |

---

## Notes

When a skill is deprecated, move it to a "Deprecated" section below rather than deleting
the row, so there is a record of what existed.

When a Claude Code skill or command is added or removed, run `pnpm docs:skills-index` in the same commit; the table is not edited by hand.
