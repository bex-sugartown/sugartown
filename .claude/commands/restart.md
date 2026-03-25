Check which Sugartown dev servers are running and restart any that are down.

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
