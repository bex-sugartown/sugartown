# Phase 8 Feedback Loop

**Origin:** SUG-241 (2026-07-25). Closes the only gap in the Sugartown workflow that's a
missing loop rather than a missing link: `stats.yml` runs daily, collects real Lighthouse
CI, CrUX, security, GitHub, Sanity, and GitHub Projects roadmap data, and that data renders on
`/governance` — then stops. Nothing measured after ship fed back into planning. Priority
in the backlog came from judgment, not evidence.

Two loops close that gap. This doc is their single source of truth — CLAUDE.md and
`docs/epic-template.md` reference it rather than duplicating it.

---

## Loop 1 — the monthly product loop

`scripts/monthly-evidence-digest.js` reads `apps/web/src/generated/stats.json` (real,
daily-collected pipeline output — see CLAUDE.md §Generated stats files) and writes a
dated block into `docs/reports/evidence-digest.md`'s
**📊 Evidence Digest** section: four numbers, three sentences.

```bash
pnpm collect:evidence-digest
```

**The four numbers, every one traced to a live `stats.json` field:**

| Number | Source field |
|---|---|
| Homepage Lighthouse performance | `perf.runs['https://sugartown.io/'].desktop.performance` |
| Dependency vulnerabilities | `security.vulnerabilities.total` |
| Published content documents | sum of `sanity.counts.{article,node,caseStudy,page}` |
| Open GitHub backlog items | `githubRoadmap.backlog.length` |

If a source is unavailable (e.g. CrUX has no API key configured), the block says
**`unavailable`** — never a defaulted zero. A measurement loop reading fabricated numbers
is worse than no loop at all.

**Idempotent per calendar day.** Running it twice in one day replaces that day's block in
place rather than duplicating it. Blocks are stored newest-first, re-sorted from parsed
data on every write — not positionally inserted — so a genuine historical backfill (an
older date added after newer ones already exist) still sorts correctly.

**Backfilling from history:** `stats.json` is a live snapshot, not a time series — the
real history lives in its own git log (CI commits it daily via
`chore(stats): update trust signals [skip ci]`). To backfill a real historical block:

```bash
git show <sha>:apps/web/src/generated/stats.json > /tmp/stats-<date>.json
pnpm collect:evidence-digest -- --stats-path /tmp/stats-<date>.json --date <YYYY-MM-DD>
```

**Cadence:** monthly is the intended rhythm, not enforced by a cron — run it by hand (or
wire a scheduled job later) when reviewing backlog priority. The idempotency guarantee
means running it more often than monthly costs nothing but noise; running it less often
just means the digest is stale until the next run, same as any manual step.

---

## Loop 2 — the process loop and the three-strike retrospective trigger

Every shipped epic doc's Post-Epic Close-Out (step 3b, `docs/epic-template.md`) states
one sentence: **"What cost a correction commit this time."** `none` is a valid, honest
answer — most epics should say it.

**The three-strike rule:** when the *same* friction — by plain-language similarity, a
human judgment call, **not a string match** — appears in three shipped docs' friction
lines, run `/post-mortem` against that pattern. Output lands in
`docs/reviews/post-mortem/{date}-{slug}.md`, the same home the skill already uses (one
entry exists as of this writing: `2026-07-19-chromatic-footer-version-freeze.md`).

**Why this stays a human read, not a mechanized check:** two friction lines can describe
the same underlying failure in completely different words ("forgot to update the CI
workflow" and "the new validator never got wired into `.husky/pre-commit`" are the same
pattern — an enforcement mechanism shipped without being connected to anything that runs
it). No string-match or keyword heuristic reliably catches that. CLAUDE.md should say so
plainly, so a future session doesn't try to mechanize what's meant to stay a human read.

**What counts as a strike:** read the last several shipped docs' friction lines at
close-out time (or periodically) and ask: does this line describe the same underlying
problem as two others already on record? If yes, that's three — fire `/post-mortem`. This
is a spot-check a human or an agent session performs, not a script.

**Friction-line fatigue is a known risk.** If every shipped doc's line becomes a rote
`none`, the loop produces no signal. Not solved mechanically by this convention — worth a
spot-check after the first 5–10 shipped docs post-launch to confirm the line is being used
honestly, not as a rubber stamp.

---

## Non-Goals

- **Analytics or instrumentation.** Both loops read what `stats.yml` already collects.
  Neither loop instruments anything new.
- **Automating the post-mortem itself.** The three-strike trigger is mechanical (a human
  spot-check, not a script) — the retrospective analysis is human-directed work using the
  existing `/post-mortem` skill.
- **A second retrospective output location.** `docs/reviews/post-mortem/` already works.
  Neither loop relocates it.
