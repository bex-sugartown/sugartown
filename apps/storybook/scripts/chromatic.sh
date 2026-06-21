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

set -a; . ./.env 2>/dev/null; set +a

CHANGED=$(git diff --name-only HEAD~1 2>/dev/null)

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
