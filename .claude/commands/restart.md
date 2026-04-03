Check which Sugartown dev servers are running and restart any that are down.

## Environment Guard

**IMPORTANT:** Dev servers started inside a remote/cloud Claude Code session are NOT reachable from the user's local browser. Before starting any server:

1. Check if `lsof` can see ports — if it can't, or if the environment is clearly remote (e.g. `/home/user/` not `/Users/`), **warn the user** that servers must be started from their local terminal.
2. If the environment is local (macOS paths like `/Users/`), proceed normally.
3. Never tell the user a server is "ready at localhost" unless you have confirmed the environment is local.

## Ports

| Service    | Port | Start command |
|------------|------|---------------|
| Web (Vite) | 5173 | `pnpm --filter web dev` (from repo root) |
| Studio     | 3333 | `cd apps/studio && pnpm sanity dev --port 3333` |
| Storybook  | 6006 | `pnpm --filter storybook storybook` (from repo root) |

## Procedure

1. For each port (5173, 3333, 6006), check if a process is listening: `lsof -ti:{port}`
2. Report status of all three services (running / stopped)
3. For any service that is **not** running, start it in the background
4. For any service that **is** running but the user explicitly asked to restart, kill it first (`lsof -ti:{port} | xargs kill -9`) then start it fresh
5. After starting, briefly confirm which services were (re)started

## Notes

- Always kill the port before starting to avoid "port in use" conflicts
- Start each server using `run_in_background` so they don't block
- If the user says just `/restart` with no arguments, check all three and restart any that are down
- If the user says `/restart 5173` or `/restart web`, only restart that one service
- Accepted aliases: `web` = 5173, `studio` = 3333, `storybook` or `sb` = 6006
