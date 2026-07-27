import { z } from 'zod'
import { listRepoDir, mostRecentFile, readRepoFile } from '../lib/file-reader.js'

const BACKLOG_DIR = ['docs', 'backlog']

export const getEpicInputSchema = {
  id: z.string().optional().describe('Epic ID, e.g. "SUG-225" — matches a filename prefix. Omit to get the most recently modified epic in docs/backlog/'),
}

export interface EpicResult {
  file: string
  content: string
}

export function getEpic(id?: string): EpicResult {
  if (id) {
    const match = listRepoDir(...BACKLOG_DIR).find((e) => !e.isDirectory && e.name.startsWith(id))
    if (!match) {
      throw new Error(`No epic file in docs/backlog/ matching "${id}"`)
    }
    return { file: match.name, content: readRepoFile(...BACKLOG_DIR, match.name) }
  }

  const latest = mostRecentFile(BACKLOG_DIR, (name) => name.endsWith('.md'))
  if (!latest) {
    throw new Error('No epic files found in docs/backlog/')
  }
  return { file: latest.name, content: readRepoFile(...BACKLOG_DIR, latest.name) }
}
