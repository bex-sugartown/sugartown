/**
 * sanity.js — sanity namespace collector (SUG-67)
 *
 * Counts published documents by type using the existing Sanity client config.
 * Uses the same env vars as the web app.
 *
 * Output shape:
 * {
 *   fetchedAt: "2026-04-22T...",
 *   counts: { article: 42, node: 18, caseStudy: 6, ... }
 * }
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const envPath = resolve(__dirname, '../../.env')
  try {
    const raw = readFileSync(envPath, 'utf-8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i === -1) continue
      const k = t.slice(0, i).trim()
      const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[k]) process.env[k] = v
    }
  } catch {}
}

const DOC_TYPES = ['article', 'node', 'caseStudy', 'page', 'tag', 'category', 'project', 'person', 'tool']

export async function collectSanity() {
  loadEnv()

  const projectId  = process.env.VITE_SANITY_PROJECT_ID
  const dataset    = process.env.VITE_SANITY_DATASET ?? 'production'
  const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'
  const token      = process.env.VITE_SANITY_TOKEN

  if (!projectId) throw new Error('VITE_SANITY_PROJECT_ID not set')

  const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token, perspective: 'published' })

  // Run all counts in parallel
  const results = await Promise.all(
    DOC_TYPES.map(async type => {
      const count = await client.fetch(`count(*[_type == $type])`, { type })
      return [type, count]
    })
  )

  const counts = Object.fromEntries(results)

  return {
    fetchedAt: new Date().toISOString(),
    counts,
  }
}
