# Skills Index

**Version:** v1.1
**Last updated:** 2026-08-25
**Owner:** Bex Head

---

## What This Is

Two skill systems run in parallel for this project. This file is the inventory that covers both.

---

## Claude Code Skills and Commands

Invokable via `/skill-name` in any Claude Code session. Most live in `.claude/skills/`;
a few are thin commands in `.claude/commands/` that point at a prompt file in `docs/`.
The `Where` column says which.

| Skill | Trigger | Where | What it does |
|---|---|---|---|
| `alignment-audit` | `/alignment-audit` | `skills/` | Audits something in the repo against an external standard; Match / Drift / Gap findings report |
| `becky-boop` | `/becky-boop` | `skills/` | Generates a Becky B00p hero banner prompt for any AI image generator, contextualised to the current article or node |
| `chromatic` | `/chromatic` | `skills/` | Runs Chromatic VRT, reports visual diffs, gates on human approval, records status |
| `glossy` | `/glossy` | `skills/` | Two-gate flow: proposes a glossaryTerm for approval, then posts it live to sugartown.io/glossary |
| `morning` | `/morning` | `commands/` + `skills/` | Morning housekeeping: git health, branch map, board status, service health. Reads first, executes with confirmation. Prompt: `docs/workflows/morning-housekeeping-prompt.md` |
| `new-epic` | `/new-epic` | `skills/` | Creates a GitHub issue + backlog stub for a new epic, and boards it |
| `new-tool` | `/new-tool` | `skills/` | Files a tool — validator, gate, hook, script, generator, command. GitHub issue only, no backlog doc; the issue body is the spec. Carries its own activation gate, since the backlog-doc hard stop cannot apply |
| `post-mortem` | `/post-mortem` | `commands/` | Runs a post-mortem. Prompt: `docs/post-mortem-prompt.md` |
| `red-pen` | `/red-pen` | `skills/` | Editorial review of Sugartown content against the brand voice guides. Reviewer, not writer — never rewrites without row-level approval |
| `release` | `/release` | `commands/` | Cuts a version. Prompt: `docs/workflows/release-assistant-prompt.md`. Normally invoked by `/ship --release`, not run alone |
| `restart` | `/restart` | `commands/` + `skills/` | Checks which Sugartown dev servers are running and restarts any that are down |
| `ship` | `/ship`, `/ship --release` | `commands/` | Pushes everything currently `Done` live: one Netlify deploy, CI verified to a conclusion, `Done` → `Shipped`. Prompt: `docs/ship-prompt.md` |
| `sugartown-epic-writer` | `/sugartown-epic-writer` | `skills/` | Writes a Claude Code execution epic in the Sugartown epic template format |
| `sugartown-prd-writer` | `/sugartown-prd-writer` | `skills/` | Writes a PRD for CMS/headless, design system, or ecom/platform work |
| `switch` | `/switch`, `/switch out` | `skills/` | Syncs the repo across machines (desktop/laptop). ARRIVE and LEAVE modes for safe handoff |
| `update-cwv` | `/update-cwv` | `skills/` | Runs Lighthouse CI against production, updates PERF_BACKUP in CwvSnapshot.jsx, shows diff summary |
| `write-blog` | `/write-blog` | `skills/` | Drafts and creates an article as a Sanity draft — Bex voice, article schema, taxonomy pre-flight |
| `write-casestudy` | `/write-casestudy` | `skills/` | Drafts and creates a portfolio case study as a Sanity draft — canonical section order, no invented proof points |
| `write-node` | `/write-node` | `skills/` | Drafts and creates a Knowledge Graph node as a Sanity draft — arc structure, agent voice, taxonomy pre-flight |

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

When a new Claude Code skill is added to `.claude/skills/`, add a row here in the same commit.
