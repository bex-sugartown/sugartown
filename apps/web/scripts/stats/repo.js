/**
 * repo.js — repo namespace collector (SUG-67)
 *
 * Counts total git commits and shipped epics from docs/shipped/.
 */

import { execSync } from 'child_process'
import { readdirSync } from 'fs'
import { resolve } from 'path'

const SHIPPED_DIR = resolve(process.cwd(), '../../docs/shipped')
const GIT_ROOT    = resolve(process.cwd(), '../../')

export function collectRepo() {
  let commits = 0
  try {
    commits = parseInt(
      execSync('git rev-list --count HEAD', { cwd: GIT_ROOT }).toString().trim(),
      10
    )
  } catch {}

  let epicsShipped = 0
  try {
    epicsShipped = readdirSync(SHIPPED_DIR).filter(f => /\.md$/.test(f)).length
  } catch {}

  return { commits, epicsShipped }
}
