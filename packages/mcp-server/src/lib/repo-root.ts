import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const WORKSPACE_MARKER = 'pnpm-workspace.yaml'

let cachedRoot: string | undefined

// Anchored to this module's own location (import.meta.url), not process.cwd(), so the built
// server resolves the repo root correctly regardless of the directory it's launched from.
export function getRepoRoot(): string {
  if (cachedRoot) return cachedRoot

  const startDir = dirname(fileURLToPath(import.meta.url))
  let dir = startDir

  for (;;) {
    if (existsSync(join(dir, WORKSPACE_MARKER))) {
      cachedRoot = dir
      return dir
    }
    const parent = dirname(dir)
    if (parent === dir) {
      throw new Error(`Could not locate monorepo root: no ${WORKSPACE_MARKER} found walking up from ${startDir}`)
    }
    dir = parent
  }
}

export function repoPath(...segments: string[]): string {
  return join(getRepoRoot(), ...segments)
}
