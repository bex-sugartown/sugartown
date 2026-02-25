# Post-Mortem Prompts

Three versions — escalating depth. Pick the one that fits the moment.

---

## 🔁 Minimal + Surgical

Run a post-mortem on work executed during:
[time period or release version — e.g., last 48 hours / release 0.11.0 / sprint 12]

Keep this concise and structured:

1. What was expected
2. What we got
3. Gaps / misalignment (list each; don't collapse to a single item)
4. Root cause — categorise each gap:
   - Process gap (missing or unclear step)
   - Prompt / spec gap (ambiguity, missing constraint)
   - Scope creep or scope misread
   - Tooling / config drift (tokens, env parity, build pipeline)
   - Data / content pipeline issue
   - Assumption (unstated, untested)
   - Component abstraction gap (duplication, shared component missing)
5. System improvements — for each fix, state:
   - The fix itself
   - **Where it lives**: new process, update to existing process, prompt update, project structure change, or guardrail / validation step
   - Priority (must-have vs nice-to-have)

Focus on improving the system, not assigning blame.
Be specific and actionable.

---

## ⚙️ Sharper Systems Lens

Conduct a post-mortem for: [time window or release tag]

Output only:

- Expected outcome
- Actual outcome
- **Divergences** (list each separately — do not flatten to a single "primary" divergence)
- Why each happened — categorise:
  assumption | ambiguity | missing constraint | unclear spec | tooling/config drift | cross-environment parity failure | data pipeline issue | component abstraction gap
- Exact changes required to prompts, specs, epics, or workflows to prevent recurrence — for each change, state whether it belongs in a new process or updates an existing one

Prioritize structural fixes over surface tweaks.

---

## 🧬 Release Discipline Version

Run a system-level post-mortem for [release version / date range].

Evaluate:

- Spec clarity
- Prompt precision
- Constraint enforcement
- Validation coverage — specifically:
  - Cross-environment parity (e.g., Storybook vs FE, staging vs prod)
  - Data / content quality (import pipelines, encoding, field completeness)
  - Component parity (shared abstractions used consistently across pages)
- Decision logging

Provide:

1. Failure points (with severity: critical / medium / low)
2. Missing guardrails
3. Prompt revisions (rewrite them in full)
4. Workflow adjustments — for each, specify:
   - New process to add, OR
   - Existing process to update (name it)
   - Owner / location (epic, CLAUDE.md, CI step, etc.)

Keep it under 400 words.
