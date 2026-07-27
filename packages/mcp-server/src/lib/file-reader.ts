import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { repoPath } from './repo-root.js'

export function readRepoFile(...segments: string[]): string {
  const path = repoPath(...segments)
  if (!existsSync(path)) {
    throw new Error(`File not found: ${segments.join('/')} (resolved to ${path})`)
  }
  return readFileSync(path, 'utf-8')
}

export function repoFileExists(...segments: string[]): boolean {
  return existsSync(repoPath(...segments))
}

export interface RepoDirEntry {
  name: string
  path: string
  mtimeMs: number
  isDirectory: boolean
}

export function listRepoDir(...segments: string[]): RepoDirEntry[] {
  const dirPath = repoPath(...segments)
  if (!existsSync(dirPath)) {
    throw new Error(`Directory not found: ${segments.join('/')} (resolved to ${dirPath})`)
  }
  return readdirSync(dirPath).map((name) => {
    const full = join(dirPath, name)
    const stat = statSync(full)
    return { name, path: full, mtimeMs: stat.mtimeMs, isDirectory: stat.isDirectory() }
  })
}

/** Returns the entry with the most recent mtime among files matching `filter`. */
export function mostRecentFile(dirSegments: string[], filter: (name: string) => boolean): RepoDirEntry | undefined {
  const entries = listRepoDir(...dirSegments).filter((e) => !e.isDirectory && filter(e.name))
  if (entries.length === 0) return undefined
  return entries.reduce((latest, entry) => (entry.mtimeMs > latest.mtimeMs ? entry : latest))
}
