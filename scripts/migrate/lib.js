#!/usr/bin/env node
/**
 * scripts/migrate/lib.js — Shared utilities for the WP → Sanity migration pipeline
 *
 * Used by all migrate:* scripts. Handles:
 *   - Env loading (.env from apps/web/.env or process.env)
 *   - Sanity client construction (write-capable)
 *   - WordPress REST API fetching with pagination
 *   - NDJSON read/write helpers
 *   - Deterministic _id generation
 *   - MD5 hash utility (for importHash)
 *   - Image URL extraction from HTML
 *   - HTML → Portable Text conversion (with risky-content fallback)
 *   - Logging helpers
 */

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { createHash } from 'crypto'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

export const __dirname = dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = resolve(__dirname, '../../')
export const ARTIFACTS_DIR = resolve(REPO_ROOT, 'artifacts')
export const DOCS_MIGRATION_DIR = resolve(REPO_ROOT, 'docs/migration')

// ─── Env loading ──────────────────────────────────────────────────────────────

export function loadEnv() {
  // Try apps/web/.env first, then repo root .env
  const candidates = [
    resolve(REPO_ROOT, 'apps/web/.env'),
    resolve(REPO_ROOT, '.env'),
  ]
  for (const envPath of candidates) {
    if (!existsSync(envPath)) continue
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
    } catch { /* skip */ }
  }
}

// ─── Sanity client ────────────────────────────────────────────────────────────

export function buildSanityClient() {
  loadEnv()
  const projectId = process.env.VITE_SANITY_PROJECT_ID
  const dataset   = process.env.VITE_SANITY_DATASET ?? 'production'
  const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2024-01-01'
  const token     = process.env.SANITY_AUTH_TOKEN

  if (!projectId) {
    console.error('❌  Missing VITE_SANITY_PROJECT_ID env var')
    process.exit(1)
  }
  if (!token) {
    console.error('❌  Missing SANITY_AUTH_TOKEN env var (write token required for migration)')
    process.exit(1)
  }
  return createClient({ projectId, dataset, apiVersion, useCdn: false, token })
}

// ─── WordPress REST API ───────────────────────────────────────────────────────

export function getWpBase() {
  loadEnv()
  const base = process.env.WP_BASE_URL ?? 'https://sugartown.io'
  return base.replace(/\/$/, '')
}

const REQUEST_TIMEOUT_MS = 20_000
const REQUEST_DELAY_MS   = 250

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function wpFetch(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'sugartown-migration/1.0 (wp-to-sanity)',
        Accept: 'application/json',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Fetch all paginated items from a WP REST endpoint.
 * Returns flat array of all items across all pages.
 */
export async function wpFetchAll(endpoint, extraParams = {}) {
  const items = []
  let page = 1
  const PER_PAGE = 100

  while (true) {
    const params = new URLSearchParams({
      per_page: String(PER_PAGE),
      page: String(page),
      ...extraParams,
    })
    const url = `${endpoint}?${params}`
    let batch
    try {
      batch = await wpFetch(url)
    } catch (err) {
      if (err.message.includes('HTTP 400') && page > 1) break // past last page
      throw err
    }
    if (!Array.isArray(batch) || batch.length === 0) break
    items.push(...batch)
    if (batch.length < PER_PAGE) break
    page++
    await sleep(REQUEST_DELAY_MS)
  }
  return items
}

// ─── NDJSON helpers ───────────────────────────────────────────────────────────

export function writeNdjson(filePath, records) {
  ensureDir(dirname(filePath))
  const lines = records.map((r) => JSON.stringify(r)).join('\n')
  writeFileSync(filePath, lines + '\n', 'utf8')
}

export function readNdjson(filePath) {
  if (!existsSync(filePath)) return []
  const raw = readFileSync(filePath, 'utf8')
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l))
}

export function writeJson(filePath, data) {
  ensureDir(dirname(filePath))
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

export function readJson(filePath) {
  if (!existsSync(filePath)) return null
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

export function writeCsv(filePath, rows, columns) {
  ensureDir(dirname(filePath))
  const header = columns.join(',')
  const lines = rows.map((r) =>
    columns.map((c) => csvEscape(r[c] ?? '')).join(',')
  )
  writeFileSync(filePath, [header, ...lines].join('\n') + '\n', 'utf8')
}

function csvEscape(val) {
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true })
}

// ─── Deterministic _id generation ─────────────────────────────────────────────

/**
 * Deterministic Sanity _id for migrated content.
 * Pattern: wp.<docType>.<wpId>
 * For person: wp.person.<wpAuthorLogin>
 *
 * Examples:
 *   wp.article.42
 *   wp.node.17
 *   wp.caseStudy.99
 *   wp.page.5
 *   wp.person.becky
 *   wp.category.3
 *   wp.tag.8
 *   wp.project.12
 */
export function makeId(docType, wpKey) {
  // Sanity _ids may only contain [a-zA-Z0-9._-]
  // Sanitize wpKey just in case (e.g. logins with special chars)
  const safe = String(wpKey).replace(/[^a-zA-Z0-9._-]/g, '-')
  return `wp.${docType}.${safe}`
}

// ─── Content hashing ──────────────────────────────────────────────────────────

export function md5(str) {
  return createHash('md5').update(str ?? '').digest('hex')
}

// ─── Image URL extraction from HTML ──────────────────────────────────────────

const IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi

/**
 * Extract all unique image URLs from an HTML string.
 * Returns an array of absolute URLs.
 */
export function extractImageUrls(html) {
  if (!html) return []
  const urls = new Set()
  let match
  IMG_SRC_RE.lastIndex = 0
  while ((match = IMG_SRC_RE.exec(html)) !== null) {
    const src = match[1]
    if (src && !src.startsWith('data:')) urls.add(src)
  }
  return [...urls]
}

// ─── HTML → Portable Text conversion ─────────────────────────────────────────
//
// This is a BEST-EFFORT conversion. For simple content (paragraphs, headings,
// bold, italic, links) it produces valid Portable Text blocks. For complex
// content (tables, shortcodes, embeds, custom WP blocks) it falls back to
// storing raw HTML in legacySource.legacyHtml.
//
// The converter does NOT handle inline images — those are substituted during
// the import step using the image manifest produced by migrate:images.

const { nanoid } = await import('nanoid').catch(() => ({
  nanoid: () => Math.random().toString(36).slice(2, 11)
}))

/**
 * Determine whether HTML content is safe to convert to Portable Text.
 * Returns true if the content is simple enough for our converter.
 * Complex content (shortcodes, tables, iframes, WP block comments) → false.
 */
export function isConversionSafe(html) {
  if (!html) return true
  // WP block comment markers, shortcodes, tables, iframes → unsafe
  const UNSAFE_PATTERNS = [
    /<!-- wp:/,           // Gutenberg block markup
    /\[[\w-]+/,          // Shortcodes like [gallery], [caption]
    /<table[\s>]/i,
    /<iframe[\s>]/i,
    /<script[\s>]/i,
    /<style[\s>]/i,
    /<form[\s>]/i,
  ]
  return !UNSAFE_PATTERNS.some((re) => re.test(html))
}

/**
 * Convert simple HTML to Portable Text blocks.
 * Only handles: p, h1-h6, ul/ol/li, strong/b, em/i, a, br, img (placeholder).
 *
 * Returns { blocks, usedFallback }
 *   blocks       — array of Portable Text block objects
 *   usedFallback — true if the input was too complex and raw HTML was returned
 */
export function htmlToPortableText(html, docId) {
  if (!html?.trim()) return { blocks: [], usedFallback: false }

  if (!isConversionSafe(html)) {
    return { blocks: [], usedFallback: true }
  }

  const blocks = []

  // Strip WP-specific noise
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '')     // HTML comments (incl. WP block markers)
    .replace(/<\/?div[^>]*>/gi, '\n')    // divs → newlines
    .replace(/<br\s*\/?>/gi, '\n')       // br → newlines
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")

  // Match block-level elements
  const BLOCK_RE = /<(p|h[1-6]|ul|ol|li|img)[^>]*>([\s\S]*?)<\/\1>|<(img)[^>]+\/?>|<(hr)\s*\/?>/gi
  let lastIndex = 0
  let match

  BLOCK_RE.lastIndex = 0
  while ((match = BLOCK_RE.exec(cleaned)) !== null) {
    const tag = (match[1] || match[3] || match[4] || '').toLowerCase()
    const inner = match[2] ?? ''

    if (tag === 'p') {
      const spans = parseInlineMarkup(inner.trim())
      if (spans.length) {
        blocks.push({
          _type: 'block',
          _key: nanoid(),
          style: 'normal',
          markDefs: extractMarkDefs(spans),
          children: spans,
        })
      }
    } else if (/^h[1-6]$/.test(tag)) {
      const level = tag[1]
      const styleMap = { '1': 'h1', '2': 'h2', '3': 'h3', '4': 'h4', '5': 'h5', '6': 'h6' }
      const text = stripTags(inner).trim()
      if (text) {
        blocks.push({
          _type: 'block',
          _key: nanoid(),
          style: styleMap[level] ?? 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: nanoid(), text, marks: [] }],
        })
      }
    } else if (tag === 'img') {
      // Placeholder — will be replaced by migrate:import using image_manifest.json
      const srcMatch = match[0].match(/src=["']([^"']+)["']/)
      const altMatch = match[0].match(/alt=["']([^"']*)["']/)
      if (srcMatch) {
        blocks.push({
          _type: 'image',
          _key: nanoid(),
          _wpImageUrl: srcMatch[1],     // temporary field — replaced at import time
          alt: altMatch?.[1] ?? '',
        })
      }
    } else if (tag === 'hr') {
      // Horizontal rules → omit (no PT equivalent)
    }
    lastIndex = BLOCK_RE.lastIndex
  }

  // If nothing parsed, treat as a single normal paragraph
  if (!blocks.length && cleaned.trim()) {
    const text = stripTags(cleaned).trim()
    if (text) {
      blocks.push({
        _type: 'block',
        _key: nanoid(),
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: nanoid(), text, marks: [] }],
      })
    }
  }

  return { blocks, usedFallback: false }
}

function parseInlineMarkup(html) {
  const spans = []
  const INLINE_RE = /<(strong|b|em|i|a)[^>]*>([\s\S]*?)<\/\1>|([^<]+)/gi
  let match
  while ((match = INLINE_RE.exec(html)) !== null) {
    const tag = (match[1] ?? '').toLowerCase()
    const inner = match[2]
    const text = match[3]

    if (text) {
      spans.push({ _type: 'span', _key: nanoid(), text, marks: [] })
    } else if (tag === 'strong' || tag === 'b') {
      const innerText = stripTags(inner)
      if (innerText) spans.push({ _type: 'span', _key: nanoid(), text: innerText, marks: ['strong'] })
    } else if (tag === 'em' || tag === 'i') {
      const innerText = stripTags(inner)
      if (innerText) spans.push({ _type: 'span', _key: nanoid(), text: innerText, marks: ['em'] })
    } else if (tag === 'a') {
      const hrefMatch = match[0].match(/href=["']([^"']+)["']/)
      const href = hrefMatch?.[1] ?? ''
      const markKey = nanoid()
      const innerText = stripTags(inner)
      if (innerText) {
        spans.push({
          _type: 'span',
          _key: nanoid(),
          text: innerText,
          marks: [markKey],
          _linkHref: href,   // stored temporarily for extractMarkDefs
          _linkMarkKey: markKey,
        })
      }
    }
  }
  return spans
}

function extractMarkDefs(spans) {
  const defs = []
  for (const span of spans) {
    if (span._linkHref && span._linkMarkKey) {
      defs.push({ _type: 'link', _key: span._linkMarkKey, href: span._linkHref })
      delete span._linkHref
      delete span._linkMarkKey
    }
  }
  return defs
}

function stripTags(html) {
  return (html ?? '').replace(/<[^>]+>/g, '')
}

// ─── Taxonomy reference builder ───────────────────────────────────────────────

/** Build a Sanity reference object for use in arrays */
export function ref(id) {
  return { _type: 'reference', _ref: id }
}

/** Build a Sanity reference array item (needs _key for array membership) */
export function refItem(id) {
  return { _type: 'reference', _ref: id, _key: nanoid() }
}

// ─── Logging ──────────────────────────────────────────────────────────────────

export function banner(title) {
  console.log()
  console.log(`🔄  ${title}`)
  console.log('══════════════════════════════════════════════')
  console.log()
}

export function section(label) {
  console.log(`\n${label}`)
  console.log('──────────────────────────────────────────────')
}

export function ok(msg) { console.log(`   ✅  ${msg}`) }
export function warn(msg) { console.warn(`   ⚠️   ${msg}`) }
export function fail(msg) { console.error(`   ❌  ${msg}`) }
export function info(msg) { console.log(`   ${msg}`) }
