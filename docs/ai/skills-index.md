# Skills Index

**Version:** v1.0
**Last updated:** June 2026
**Owner:** Bex Head

---

## What This Is

Two skill systems run in parallel for this project. This file is the inventory that covers both.

---

## Claude Code Skills (`.claude/skills/`)

Invokable via `/skill-name` in any Claude Code session. Skills live on disk in `.claude/skills/`.

| Skill | Trigger | What it does |
|---|---|---|
| `becky-boop` | `/becky-boop` | Generates a Becky Boop hero banner prompt for any AI image generator, contextualised to the current article or node |
| `chromatic` | `/chromatic` | Runs Chromatic VRT, reports visual diffs, gates on human approval, records status |
| `eod` | `/eod` | End-of-day: commits uncommitted work, single push to trigger one Netlify deploy, verifies deploy |
| `glossy` | `/glossy` | Two-gate flow: proposes a glossaryTerm for approval, then posts it live to sugartown.io/glossary |
| `morning` | `/morning` | Morning housekeeping: git health check, branch map, Linear status, service health. Read-only, executes with confirmation |
| `new-epic` | `/new-epic` | Creates a Linear issue + backlog stub + priority stack entry for a new epic |
| `restart` | `/restart` | Checks which Sugartown dev servers are running and restarts any that are down |
| `storybook-docs` | `/storybook-docs` | Authors or updates a Guidelines story for a DS component |
| `sugartown-epic-writer` | `/sugartown-epic-writer` | Writes a Claude Code execution epic in the Sugartown epic template format |
| `sugartown-prd-writer` | `/sugartown-prd-writer` | Writes a PRD for CMS/headless, design system, or ecom/platform work |
| `switch` | `/switch` | Syncs the repo across machines (desktop/laptop). ARRIVE and LEAVE modes for safe handoff |
| `update-cwv` | `/update-cwv` | Runs Lighthouse CI against production, updates PERF_BACKUP in CwvSnapshot.jsx, shows diff summary |
| `write-blog` | `/write-blog` | Drafts and creates an article as a Sanity draft — Bex voice, article schema, taxonomy pre-flight |
| `write-node` | `/write-node` | Drafts and creates a Knowledge Graph node as a Sanity draft — arc structure, agent voice, taxonomy pre-flight |

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

Not a skill. A prompt file in `docs/workflows/` pasted into Claude Code at the start of a
release session. No slash command.

| Prompt | File | What it does |
|---|---|---|
| Release assistant | `docs/workflows/release-assistant-prompt.md` | Seven-gate release pipeline: source of truth → CHANGELOG → release notes → commit. Nothing writes without approval |

---

## Notes

When a skill is deprecated, move it to a "Deprecated" section below rather than deleting
the row, so there is a record of what existed.

When a new Claude Code skill is added to `.claude/skills/`, add a row here in the same commit.
