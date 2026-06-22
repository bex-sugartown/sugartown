#!/bin/bash
# vercel-ignore-build.sh — Skip Vercel build when no contentful-poc-relevant files changed.
#
# Vercel calls this as the "Ignored Build Step" (ignoreCommand in vercel.json).
# Exit 0 = skip build. Exit 1 = proceed with build.
#
# Uses VERCEL_GIT_PREVIOUS_SHA / VERCEL_GIT_COMMIT_SHA env vars provided by Vercel.
# Falls back to HEAD^..HEAD for local testing.
#
# Relevant paths (any change triggers a build):
#   apps/contentful-poc/**
#   packages/design-system/**
#   pnpm-lock.yaml
#   turbo.json
#   package.json (root)

echo "Checking for contentful-poc-relevant changes..."

PREV=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}
CURR=${VERCEL_GIT_COMMIT_SHA:-HEAD}

echo "Diff: $PREV → $CURR"

git diff "$PREV" "$CURR" --name-only | grep -qE \
  '^(apps/contentful-poc/|packages/design-system/|pnpm-lock\.yaml|turbo\.json|package\.json)'

if [ $? -eq 0 ]; then
  echo "Relevant changes found — proceeding with build."
  exit 1
else
  echo "No relevant changes — skipping build."
  exit 0
fi
