#!/bin/sh
# Chromatic VRT runner with snapshot budget guards.
#
# Guards applied (in order):
#   1. Skip gate  — exits early if all changed files are non-visual.
#                   Saves the Storybook build + any remaining Chromatic build quota.
#   2. TurboSnap  -- only-changed traces the dependency graph and snapshots only
#                   stories affected by the diff, not the full suite.
#
# Non-visual paths (safe to skip — no Storybook story can render these):
#   apps/studio/         Sanity CMS schema + config
#   apps/contentful-poc/ Next.js POC app
#   docs/                markdown documentation
#   .claude/             Claude Code session files
#   apps/web/src/lib/    GROQ queries, hooks, utilities
#   apps/web/src/generated/  CI-produced stats files
#   apps/web/scripts/    build scripts

# Load local secrets if present. `.env` is gitignored, so it never exists in CI —
# CHROMATIC_PROJECT_TOKEN comes from the workflow environment there instead.
#
# The existence check is load-bearing, not defensive. The POSIX dot command is a
# *special builtin*: if the file is missing it terminates a non-interactive shell
# outright, and a trailing 2>/dev/null hides the message without preventing the exit.
# The unguarded form killed this script before its first echo on every CI run from
# 2026-06-21 to 2026-07-28 — 36 days with no visual regression testing, and no output
# to indicate why (SUG-255 / INC-009).
if [ -f ./.env ]; then
  set -a; . ./.env; set +a
fi

# Compare against the last PUSHED commit, not HEAD~1.
#
# HEAD~1 is only correct when every commit is pushed individually. This repo
# batches commits between /eod pushes, so HEAD~1 asks "did the tip commit touch
# visual files?" when the real question is "did anything since the last push?".
# An epic that ends on a docs commit — which every close-out does — then skips
# VRT for its entire batch.
#
# This fired for real on SUG-231 (2026-07-22): the tip commit was docs-only, so
# CHANGED held one .md file, VISUAL came back empty, and the script would have
# exited 0 while 43 changed component/story files went unsnapshotted. Chromatic
# had to be invoked manually to get build 78.
#
# origin/main is the correct baseline: it is what production/Chromatic last saw.
# Falls back to HEAD~1 only when there is no origin/main to compare against.
BASE=$(git rev-parse --verify --quiet origin/main || echo "HEAD~1")
CHANGED=$(git diff --name-only "$BASE"...HEAD 2>/dev/null)

echo "[chromatic] Comparing against $BASE ($(printf '%s\n' "$CHANGED" | grep -c . ) changed file(s))"

if [ -z "$CHANGED" ]; then
  echo "[chromatic] No changed files detected — skipping"
  exit 0
fi

VISUAL=$(printf '%s\n' "$CHANGED" | grep -Ev \
  '^apps/studio/|^apps/contentful-poc/|^docs/|^\.claude/|^apps/web/src/lib/|^apps/web/src/generated/|^apps/web/scripts/|\.md$')

if [ -z "$VISUAL" ]; then
  echo "[chromatic] All changed files are non-visual — skipping VRT (snapshot budget preserved)"
  printf '%s\n' "$CHANGED" | sed 's/^/  /'
  exit 0
fi

echo "[chromatic] Visual files detected — running VRT with TurboSnap"
chromatic --build-script-name=storybook:build --exit-zero-on-changes --only-changed
