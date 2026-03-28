#!/bin/bash
# start-dev.sh — Start all three Sugartown dev servers
# Run from repo root in a dedicated terminal tab:
#   ./scripts/start-dev.sh
#
# Stop all three: Ctrl+C in that tab

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

trap 'kill 0; exit' INT TERM

echo "Starting Sugartown dev servers..."
echo ""

pnpm --filter web dev &
echo "  Web        → http://localhost:5173"

(cd apps/studio && pnpm sanity dev --port 3333) &
echo "  Studio     → http://localhost:3333"

pnpm --filter storybook storybook &
echo "  Storybook  → http://localhost:6006"

echo ""
echo "All servers running. Ctrl+C to stop all."
wait
