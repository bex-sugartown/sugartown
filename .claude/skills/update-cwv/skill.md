---
name: update-cwv
description: Run Lighthouse CI against production, update PERF_BACKUP in CwvSnapshot.jsx, show diff summary, offer to commit
---

# /update-cwv — Update CWV backup data

This skill refreshes the static `PERF_BACKUP` constant in `CwvSnapshot.jsx` with a fresh Lighthouse CI run against `https://sugartown.io`.

---

## What it does

1. Runs `lhci autorun` from the repo root against production
2. Runs `pnpm --filter web update:backup` to patch `PERF_BACKUP` in `CwvSnapshot.jsx`
3. Shows a summary of the new scores (mobile + desktop per URL)
4. Asks whether to commit

---

## Steps

### STEP 1 — Run Lighthouse CI

```bash
pnpm exec lhci autorun --config=lighthouserc.cjs
```

Run from the repo root. This writes JSON result files to `.lighthouseci/`.

- If it fails (Chrome not found, network error), report the error and stop.
- `continue-on-error` is intentional in CI but here we want clean results — if the run fails, do not proceed to patching.

### STEP 2 — Update backup constants

```bash
pnpm --filter web update:backup
```

This runs `apps/web/scripts/update-perf-backup.js`, which:
- Reads `.lighthouseci/*.json`
- Builds the new `PERF_BACKUP` object
- Patches `CwvSnapshot.jsx` in-place
- Prints a score summary

### STEP 3 — Show summary

Print the output from the script verbatim. Then add a comparison table against the previous values:

| URL | Form factor | Perf | A11y | Best P | SEO | LCP | CLS | INP | Rating |
|-----|-------------|------|------|--------|-----|-----|-----|-----|--------|
| (new values from script output) |

Read the previous values from the current `PERF_BACKUP` block in `CwvSnapshot.jsx` *before* the patch runs (or from git diff). Flag any score that dropped by more than 5 points.

### STEP 4 — Offer to commit

If any score dropped by more than 5 points (per Step 3), ask via `AskUserQuestion` before offering the commit at all:

```
Question: "[metric] dropped [N] points on [URL] — investigate before committing?"
Options:
  - "Investigate first — don't commit yet"
  - "Commit anyway — I'll look into it separately"
```

Otherwise (or once the regression question is resolved as "Commit anyway"), ask via `AskUserQuestion`:

```
Question: "Scores look good — commit with chore(stats): update PERF_BACKUP from LHCI run YYYY-MM-DD?"
Options:
  - "Commit it — use this message"
  - "Not yet"
```

On "Commit it":

```bash
git add apps/web/src/components/CwvSnapshot.jsx
git commit -m "chore(stats): update PERF_BACKUP from LHCI run $(date +%Y-%m-%d)"
```

---

## Flags (optional arguments)

- `--skip-run` — skip `lhci autorun`, use existing `.lighthouseci/` results (useful if you just ran Lighthouse manually)
- `--no-commit` — patch the file but skip the commit prompt

---

## Notes

- CrUX (`CRUX_BACKUP`) is **not** updated by this skill — CrUX data is field data from real users and cannot be synthesised from a Lighthouse run. Update it manually when real CrUX data is available.
- The `.lighthouseci/` directory is gitignored — results are local only.
- If mobile best-practices score is below 70, print a warning and suggest running `/update-cwv --skip-run` after investigating with Chrome DevTools Lighthouse in mobile preset.
