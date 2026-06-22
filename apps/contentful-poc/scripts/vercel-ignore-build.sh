#!/bin/bash
# vercel-ignore-build.sh — Skip Vercel build when no contentful-poc-relevant files changed.
#
# Vercel calls this as the "Ignored Build Step" command.
# Exit 0 = skip build. Exit 1 = proceed with build.
#
# Relevant paths (any change here triggers a build):
#   apps/contentful-poc/**
#   packages/design-system/**
#   pnpm-lock.yaml
#   turbo.json
#   package.json (root)

echo "Checking for contentful-poc-relevant changes..."

git diff HEAD^ HEAD --name-only | grep -qE \
  '^(apps/contentful-poc/|packages/design-system/|pnpm-lock\.yaml|turbo\.json|package\.json)'

if [ $? -eq 0 ]; then
  echo "Relevant changes found — proceeding with build."
  exit 1
else
  echo "No relevant changes — skipping build."
  exit 0
fi
