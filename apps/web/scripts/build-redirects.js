#!/usr/bin/env node
/**
 * build-redirects.js — Netlify _redirects File Generator
 *
 * Fetches all active redirect documents from Sanity and writes
 * apps/web/public/_redirects in Netlify format.
 *
 * Always appends the SPA catch-all fallback as the final rule:
 *   /* /index.html 200
 *
 * Usage:
 *   pnpm --filter web build:redirects
 *
 * Wired into the web build pipeline (runs before `vite build`).
 * Can also be run standalone at any time — idempotent.
 *
 * Output file: apps/web/public/_redirects
 *
 * Netlify _redirects format (one rule per line):
 *   /from-path /to-path 301
 *   /gone-path 410
 *   /* /index.html 200
 *
 * Notes:
 *   - Only `isActive: true` redirects are included
 *   - 410 Gone rules use a single path (no destination) per Netlify format
 *   - Rules are sorted: 301 first, then 302, then 410, then alphabetical within each group
 *   - The SPA fallback (/* /index.html 200) is always last
 *
 * Environment variables required (reads from .env or process.env):
 *   VITE_SANITY_PROJECT_ID
 *   VITE_SANITY_DATASET
 *   VITE_SANITY_API_VERSION
 *   SANITY_AUTH_TOKEN   (optional — only needed if dataset is private)
 */

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Load env from .env file ──────────────────────────────────────────────────

function loadEnv() {
  const envPath = resolve(__dirname, '../.env')
  try {
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '')
      if (key && !(key in process.env)) process.env[key] = val
    }
  } catch {
    // .env not found — rely on process.env (CI/CD environment)
  }
}

loadEnv()

// ─── Sanity client ────────────────────────────────────────────────────────────

const projectId = process.env.VITE_SANITY_PROJECT_ID
const dataset   = process.env.VITE_SANITY_DATASET
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2024-01-01'
const token     = process.env.SANITY_AUTH_TOKEN

if (!projectId || !dataset) {
  console.error('❌  Missing VITE_SANITY_PROJECT_ID or VITE_SANITY_DATASET env vars')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,  // always fresh — this is a build-time script
  ...(token ? { token } : {}),
})

// ─── GROQ query ───────────────────────────────────────────────────────────────

const redirectsQuery = `
  *[_type == "redirect" && isActive == true] {
    _id,
    fromPath,
    toPath,
    statusCode
  }
`

// ─── Netlify _redirects format ────────────────────────────────────────────────

/**
 * Format a single redirect document as a Netlify _redirects line.
 *
 * Netlify format:
 *   /from /to 301
 *   /from /to 302
 *   /gone-page 410          ← 410 has no destination in Netlify format
 */
function formatRule(redirect) {
  const { fromPath, toPath, statusCode } = redirect

  if (statusCode === 410) {
    // Netlify renders 404 for 410 (closest equivalent) — document as 404 in output
    return `${fromPath}  /404  404`
  }

  if (!toPath) {
    console.warn(`  ⚠️  Redirect ${fromPath} has no toPath and is not 410 — skipping`)
    return null
  }

  return `${fromPath}  ${toPath}  ${statusCode}`
}

/**
 * Sort order: 301 → 302 → 410, then alphabetical within each group.
 * Netlify evaluates rules top-to-bottom; more specific rules should be first.
 * (For exact-match-only redirects, order within a status group doesn't matter
 * functionally, but alphabetical ordering makes the file easier to audit.)
 */
function sortRedirects(redirects) {
  const ORDER = { 301: 0, 302: 1, 410: 2 }
  return [...redirects].sort((a, b) => {
    const statusDiff = (ORDER[a.statusCode] ?? 99) - (ORDER[b.statusCode] ?? 99)
    if (statusDiff !== 0) return statusDiff
    return (a.fromPath ?? '').localeCompare(b.fromPath ?? '')
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔀  Sugartown Redirect Builder')
  console.log('══════════════════════════════════════════════\n')
  console.log(`   Project: ${projectId}  |  Dataset: ${dataset}\n`)

  // Fetch active redirects
  let redirects
  try {
    redirects = await client.fetch(redirectsQuery)
  } catch (err) {
    console.error('❌  Failed to fetch redirects from Sanity:')
    console.error(`    ${err.message}`)
    process.exit(1)
  }

  console.log(`   Found ${redirects.length} active redirect(s)\n`)

  // Build redirect lines
  const sorted = sortRedirects(redirects)
  const lines = []

  for (const r of sorted) {
    const line = formatRule(r)
    if (line) {
      lines.push(line)
      console.log(`   ${line}`)
    }
  }

  // Always append SPA fallback as final rule
  const SPA_FALLBACK = '/*  /index.html  200'
  lines.push('')
  lines.push('# SPA fallback — must be last')
  lines.push(SPA_FALLBACK)

  // Write output file
  const outputPath = resolve(__dirname, '../public/_redirects')
  const outputDir  = resolve(__dirname, '../public')

  mkdirSync(outputDir, { recursive: true })
  writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8')

  console.log('\n──────────────────────────────────────────────')
  console.log(`✅  Written: apps/web/public/_redirects`)
  console.log(`    ${lines.length - 2} redirect rule(s) + SPA fallback`)
  console.log('══════════════════════════════════════════════\n')
}

main().catch((err) => {
  console.error('❌  Unexpected error:', err)
  process.exit(1)
})
