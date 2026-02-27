#!/usr/bin/env node
/**
 * wp-url-spider.js — WP URL Spider + Redirect Gap Analysis
 *
 * Epic 1 of Launch Routing. Read-only audit that crawls the live WordPress
 * site (REST API + sitemap), cross-references against Sanity documents and
 * existing redirect infrastructure, and classifies every legacy URL.
 *
 * This script NEVER writes to Sanity. All output goes to local artifacts.
 *
 * Usage:
 *   node scripts/audit/wp-url-spider.js [--verbose]
 *   pnpm audit:urls [--verbose]
 *
 * Outputs (scripts/audit/artifacts/):
 *   url_inventory.json         — machine-readable classified inventory
 *   redirect_gaps.md           — human-readable gap report for editorial review
 *   proposed_redirects.ndjson  — import-ready Sanity mutation documents
 *
 * Spec: docs/tasks/url-audit-spider-spec.md
 *
 * Environment variables (reads from apps/web/.env or process.env):
 *   VITE_SANITY_PROJECT_ID
 *   VITE_SANITY_DATASET
 *   VITE_SANITY_API_VERSION
 *   VITE_SANITY_TOKEN  (required — wp.* dot-namespace IDs need authenticated queries)
 */

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../../')
const ARTIFACTS_DIR = resolve(__dirname, 'artifacts')

const VERBOSE = process.argv.includes('--verbose')
const WP_BASE = 'https://sugartown.io'

// ─── Logging (matches monorepo style from migrate/lib.js) ────────────────────

function banner(title) {
  console.log()
  console.log(`🕷️  ${title}`)
  console.log('══════════════════════════════════════════════')
  console.log()
}

function section(label) {
  console.log(`\n${label}`)
  console.log('──────────────────────────────────────────────')
}

function ok(msg) { console.log(`   ✅  ${msg}`) }
function warn(msg) { console.warn(`   ⚠️   ${msg}`) }
function fail(msg) { console.error(`   ❌  ${msg}`) }
function info(msg) { console.log(`   ${msg}`) }
function verbose(msg) { if (VERBOSE) console.log(`   · ${msg}`) }

// ─── Env loading (mirrors migrate/lib.js) ────────────────────────────────────

function loadEnv() {
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

// ─── Slug sanitiser (copied from scripts/migrate/transform.js) ──────────────
// Decode percent-encoded WP slugs, strip non-ASCII, collapse dashes.

function sanitiseSlug(slug) {
  if (!slug) return slug
  let decoded = slug
  try {
    decoded = decodeURIComponent(slug)
  } catch {
    // malformed percent-encoding — keep original
  }
  return decoded
    .replace(/[^\x00-\x7F]/g, '')   // remove non-ASCII
    .replace(/-{2,}/g, '-')          // collapse consecutive dashes
    .replace(/^-|-$/g, '')           // trim leading/trailing dashes
    .toLowerCase()
    || slug                          // fallback to original if result is empty
}

// ─── Route namespace (mirrors apps/web/src/lib/routes.js) ────────────────────

const TYPE_NAMESPACES = {
  article: 'articles',
  caseStudy: 'case-studies',
  node: 'nodes',
}

const TAXONOMY_NAMESPACES = {
  tag: 'tags',
  category: 'categories',
  project: 'projects',
  person: 'people',
}

function getCanonicalPath(docType, slug) {
  const s = (slug || '').replace(/^\/+|\/+$/g, '').trim()
  if (!s) return '/'
  if (docType === 'page') return `/${s}`
  const prefix = TYPE_NAMESPACES[docType] || TAXONOMY_NAMESPACES[docType]
  if (prefix) return `/${prefix}/${s}`
  return `/${s}`
}

// ─── Hardcoded in-app redirects (derived from App.jsx) ───────────────────────
// These are client-side <Navigate> redirects. They work for SPA navigation but
// will NOT intercept server-side requests. Before DNS cutover, equivalent
// server-side rules are needed (that's Epic 3's concern, not this script's).

const HARDCODED_PATTERNS = [
  // Pattern: [regex to match WP URL path, target description]
  { pattern: /^\/blog\/?$/, target: '/articles', note: 'App.jsx: /blog → /articles' },
  { pattern: /^\/blog\/(.+)$/, target: '/articles', note: 'App.jsx: /blog/:slug → /articles (loses slug — client-side only)' },
  { pattern: /^\/posts?\/?$/, target: '/articles', note: 'App.jsx: /posts → /articles' },
  { pattern: /^\/post\/(.+)$/, target: '/articles', note: 'App.jsx: /post/:slug → /articles (loses slug — client-side only)' },
  { pattern: /^\/nodes\/?$/, target: '/knowledge-graph', note: 'App.jsx: /nodes → /knowledge-graph' },
  { pattern: /^\/nodes\/(.+)$/, targetFn: (m) => `/knowledge-graph/${m[1]}`, note: 'App.jsx: /nodes/:slug → /knowledge-graph/:slug' },
  { pattern: /^\/articles\/%f0%9f%92%8e-luxury-dot-com-%f0%9f%92%8e\/?$/i, target: '/articles/luxury-dot-com', note: 'App.jsx: emoji slug redirect' },
]

function matchHardcoded(urlPath) {
  for (const rule of HARDCODED_PATTERNS) {
    const m = urlPath.match(rule.pattern)
    if (m) {
      const target = rule.targetFn ? rule.targetFn(m) : rule.target
      return { target, note: rule.note }
    }
  }
  return null
}

// ─── WP type → Sanity type mapping ──────────────────────────────────────────

const WP_TO_SANITY_TYPE = {
  post: 'article',
  page: 'page',
  gem: 'node',
  'case-study': 'caseStudy',
  case_study: 'caseStudy',
  category: 'category',
  tag: 'tag',
}

// ─── WP URL → expected Sanity route mapping ─────────────────────────────────
// Given a WP URL path, determine what Sanity route it should map to.

function wpUrlToExpectedRoute(wpUrl, wpType, wpSlug) {
  const path = normalisePath(wpUrl)

  // WP pages live at root — /:slug
  if (wpType === 'page') {
    return `/${sanitiseSlug(wpSlug)}`
  }

  // WP posts lived at /blog/:slug or /:year/:month/:slug — map to /articles/:slug
  if (wpType === 'post') {
    return `/articles/${sanitiseSlug(wpSlug)}`
  }

  // WP gems → /nodes/:slug (canonical content route, archive at /knowledge-graph)
  if (wpType === 'gem') {
    return `/nodes/${sanitiseSlug(wpSlug)}`
  }

  // WP case studies → /case-studies/:slug
  if (wpType === 'case-study' || wpType === 'case_study') {
    return `/case-studies/${sanitiseSlug(wpSlug)}`
  }

  // WP categories → /categories/:slug
  if (wpType === 'category') {
    return `/categories/${sanitiseSlug(wpSlug)}`
  }

  // WP tags → /tags/:slug
  if (wpType === 'tag') {
    return `/tags/${sanitiseSlug(wpSlug)}`
  }

  return null
}

// ─── URL helpers ─────────────────────────────────────────────────────────────

function normalisePath(url) {
  if (!url) return '/'
  try {
    const u = new URL(url, WP_BASE)
    // Strip trailing slash (except root)
    let p = u.pathname
    if (p.length > 1) p = p.replace(/\/+$/, '')
    return p || '/'
  } catch {
    // Already a path
    let p = url
    if (p.length > 1) p = p.replace(/\/+$/, '')
    return p || '/'
  }
}

function extractSlugFromPath(path) {
  const segments = path.replace(/^\/+|\/+$/g, '').split('/')
  return segments[segments.length - 1] || ''
}

// ─── Step 1a: WP REST API Crawl ─────────────────────────────────────────────

const REQUEST_TIMEOUT_MS = 20_000
const REQUEST_DELAY_MS = 300

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Fetch a single URL with timeout. Returns { data, headers } or throws.
 */
async function wpApiFetch(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'sugartown-url-audit/1.0 (wp-spider)',
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }
    const data = await res.json()
    return { data, headers: res.headers }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Paginated WP REST API fetch. Returns flat array of items.
 * Gracefully returns empty array on 404 (endpoint not registered).
 */
async function wpFetchAll(endpoint, label) {
  const items = []
  let page = 1
  const PER_PAGE = 100

  verbose(`Fetching ${label} from ${endpoint}`)

  while (true) {
    const url = `${endpoint}?per_page=${PER_PAGE}&page=${page}`
    let result
    try {
      result = await wpApiFetch(url)
    } catch (err) {
      if (err.message.includes('404')) {
        verbose(`  ${label}: endpoint returned 404 — skipping (not registered)`)
        return []
      }
      if (err.message.includes('400') && page > 1) {
        // Past last page
        break
      }
      throw err
    }

    const { data, headers } = result
    if (!Array.isArray(data) || data.length === 0) break

    items.push(...data)

    const totalPages = parseInt(headers.get('X-WP-TotalPages') || '1', 10)
    verbose(`  ${label}: page ${page}/${totalPages} (${data.length} items)`)

    if (page >= totalPages) break
    page++
    await sleep(REQUEST_DELAY_MS)
  }

  return items
}

/**
 * Extract a normalized record from a WP REST API item.
 */
function extractRestRecord(item, wpType) {
  const wpUrl = item.link ? normalisePath(item.link) : null
  const title = item.title?.rendered || item.name || item.title || '(untitled)'
  const wpSlug = item.slug || ''
  const wpId = item.id

  return {
    wpId,
    wpType,
    wpSlug,
    wpUrl: wpUrl || `/${wpSlug}`,
    title: title.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"'),
    source: 'rest_api',
  }
}

async function crawlRestApi() {
  const allItems = []

  // Standard endpoints
  const endpoints = [
    { url: `${WP_BASE}/wp-json/wp/v2/posts`, type: 'post', label: 'Posts' },
    { url: `${WP_BASE}/wp-json/wp/v2/pages`, type: 'page', label: 'Pages' },
    { url: `${WP_BASE}/wp-json/wp/v2/categories`, type: 'category', label: 'Categories' },
    { url: `${WP_BASE}/wp-json/wp/v2/tags`, type: 'tag', label: 'Tags' },
  ]

  // Custom post types — try multiple endpoint variants, 404 = skip
  const customEndpoints = [
    { url: `${WP_BASE}/wp-json/wp/v2/gem`, type: 'gem', label: 'Gems' },
    { url: `${WP_BASE}/wp-json/wp/v2/case-study`, type: 'case-study', label: 'Case Studies (hyphen)' },
    { url: `${WP_BASE}/wp-json/wp/v2/case_study`, type: 'case_study', label: 'Case Studies (underscore)' },
  ]

  for (const ep of [...endpoints, ...customEndpoints]) {
    try {
      const items = await wpFetchAll(ep.url, ep.label)
      const records = items.map((item) => extractRestRecord(item, ep.type))
      allItems.push(...records)
      if (items.length > 0) {
        info(`${ep.label}: ${items.length} item(s)`)
      } else {
        verbose(`${ep.label}: 0 items`)
      }
    } catch (err) {
      warn(`${ep.label}: ${err.message}`)
    }
    await sleep(REQUEST_DELAY_MS)
  }

  return allItems
}

// ─── Step 1b: Sitemap Crawl ─────────────────────────────────────────────────

async function fetchSitemap() {
  const urls = []
  const sitemapCandidates = [
    `${WP_BASE}/sitemap.xml`,
    `${WP_BASE}/wp-sitemap.xml`,
    `${WP_BASE}/sitemap_index.xml`,
  ]

  let sitemapXml = null
  let sitemapSource = null

  for (const candidate of sitemapCandidates) {
    try {
      verbose(`Trying sitemap: ${candidate}`)
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      const res = await fetch(candidate, {
        signal: controller.signal,
        headers: { 'User-Agent': 'sugartown-url-audit/1.0 (wp-spider)' },
      })
      clearTimeout(timer)

      if (res.ok) {
        sitemapXml = await res.text()
        sitemapSource = candidate
        break
      }
    } catch {
      verbose(`  Sitemap not found at ${candidate}`)
    }
  }

  if (!sitemapXml) {
    warn('No sitemap found at any candidate URL')
    return []
  }

  info(`Sitemap found: ${sitemapSource}`)

  // Check if this is a sitemap index (contains <sitemap> elements with child sitemaps)
  const childSitemapUrls = [...sitemapXml.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/gi)]
    .map((m) => m[1].trim())

  if (childSitemapUrls.length > 0) {
    verbose(`  Sitemap index with ${childSitemapUrls.length} child sitemap(s)`)

    for (const childUrl of childSitemapUrls) {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
        const res = await fetch(childUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'sugartown-url-audit/1.0 (wp-spider)' },
        })
        clearTimeout(timer)

        if (res.ok) {
          const childXml = await res.text()
          const childUrls = [...childXml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/gi)]
            .map((m) => m[1].trim())
          urls.push(...childUrls)
          verbose(`  ${childUrl}: ${childUrls.length} URL(s)`)
        }
      } catch (err) {
        warn(`  Failed to fetch child sitemap ${childUrl}: ${err.message}`)
      }
      await sleep(REQUEST_DELAY_MS)
    }
  }

  // Also extract any <url><loc> directly in the top-level sitemap
  const topLevelUrls = [...sitemapXml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/gi)]
    .map((m) => m[1].trim())
  urls.push(...topLevelUrls)

  return urls.map((url) => normalisePath(url))
}

// ─── Step 1: Merge and deduplicate ──────────────────────────────────────────

async function crawlWordPress() {
  section('Step 1a — WP REST API')
  const restRecords = await crawlRestApi()
  info(`Total REST API records: ${restRecords.length}`)

  section('Step 1b — Sitemap')
  const sitemapPaths = await fetchSitemap()
  info(`Total sitemap URLs: ${sitemapPaths.length}`)

  // Build a map keyed by normalised path for deduplication
  const urlMap = new Map()

  // REST API records first (they have richer metadata)
  for (const record of restRecords) {
    const path = normalisePath(record.wpUrl)
    if (!urlMap.has(path)) {
      urlMap.set(path, record)
    }
  }

  // Sitemap URLs — add any that REST API missed
  for (const path of sitemapPaths) {
    if (path === '/') continue // skip homepage from sitemap

    if (!urlMap.has(path)) {
      // Infer type from URL pattern
      const wpType = inferWpTypeFromPath(path)
      urlMap.set(path, {
        wpId: null,
        wpType,
        wpSlug: extractSlugFromPath(path),
        wpUrl: path,
        title: '(from sitemap)',
        source: 'sitemap',
      })
    } else {
      // Enrich existing record to note it was also in sitemap
      const existing = urlMap.get(path)
      if (existing.source === 'rest_api') {
        existing.source = 'both'
      }
    }
  }

  return [...urlMap.values()]
}

/**
 * Infer WP content type from a URL path pattern.
 */
function inferWpTypeFromPath(path) {
  if (/^\/blog\//.test(path)) return 'post'
  if (/^\/post\//.test(path)) return 'post'
  if (/^\/posts\//.test(path)) return 'post'
  if (/^\/gem\//.test(path)) return 'gem'
  if (/^\/case-stud(y|ies)\//.test(path)) return 'case-study'
  if (/^\/category\//.test(path)) return 'category'
  if (/^\/tag\//.test(path)) return 'tag'
  if (/^\/author\//.test(path)) return 'author'
  // Date archives: /2024/01/some-post
  if (/^\/\d{4}\/\d{2}\//.test(path)) return 'date_archive'
  if (/^\/\d{4}\/\d{2}\/?$/.test(path)) return 'date_archive'
  if (/^\/\d{4}\/?$/.test(path)) return 'date_archive'
  // Feed URLs
  if (/\/feed\/?$/.test(path)) return 'feed'
  // Pagination
  if (/\/page\/\d+\/?$/.test(path)) return 'pagination'
  // Default: assume page (root-level slug)
  return 'page'
}

// ─── Step 2: Query Sanity ────────────────────────────────────────────────────

function buildSanityReadClient() {
  loadEnv()
  const projectId = process.env.VITE_SANITY_PROJECT_ID
  const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
  const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2024-01-01'
  const token = process.env.VITE_SANITY_TOKEN || process.env.SANITY_AUTH_TOKEN

  if (!projectId) {
    fail('Missing VITE_SANITY_PROJECT_ID env var')
    process.exit(1)
  }
  if (!token) {
    fail('Missing VITE_SANITY_TOKEN or SANITY_AUTH_TOKEN env var (required for wp.* ID visibility)')
    process.exit(1)
  }

  return createClient({ projectId, dataset, apiVersion, useCdn: false, token })
}

async function querySanity() {
  const client = buildSanityReadClient()

  section('Step 2a — Sanity content with legacySource')
  const legacyDocs = await client.fetch(`
    *[defined(legacySource)] {
      _id,
      _type,
      "slug": slug.current,
      legacySource
    }
  `)
  info(`Documents with legacySource: ${legacyDocs.length}`)

  section('Step 2b — Sanity redirect documents')
  const redirectDocs = await client.fetch(`
    *[_type == "redirect"] {
      _id,
      fromPath,
      toPath,
      statusCode,
      isActive,
      notes
    }
  `)
  info(`Redirect documents: ${redirectDocs.length} (${redirectDocs.filter((r) => r.isActive).length} active)`)

  section('Step 2c — _redirects file')
  const redirectsFilePath = resolve(REPO_ROOT, 'apps/web/public/_redirects')
  let fileRedirects = []
  if (existsSync(redirectsFilePath)) {
    const raw = readFileSync(redirectsFilePath, 'utf8')
    fileRedirects = raw.split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l !== '/*  /index.html  200')
      .map((l) => {
        const parts = l.split(/\s+/)
        return { from: parts[0], to: parts[1], code: parseInt(parts[2], 10) }
      })
      .filter((r) => r.from && r.from !== '/*')
    info(`_redirects file rules: ${fileRedirects.length} (excluding SPA fallback)`)
  } else {
    info('_redirects file: not found')
  }

  return { legacyDocs, redirectDocs, fileRedirects }
}

// ─── Step 3: Gap Analysis ────────────────────────────────────────────────────

/**
 * Build lookup structures from Sanity data for fast matching.
 */
function buildLookups(legacyDocs, redirectDocs, fileRedirects) {
  // Map: sanitised slug → Sanity document (for matching WP slugs to Sanity docs)
  const slugToDoc = new Map()
  // Map: wpId → Sanity document
  const wpIdToDoc = new Map()

  for (const doc of legacyDocs) {
    const slug = doc.slug
    const sanityType = doc._type
    if (slug) {
      const key = `${sanityType}::${slug}`
      slugToDoc.set(key, doc)
      // Also index by sanitised slug in case WP slug differs
      const sanitised = sanitiseSlug(slug)
      if (sanitised !== slug) {
        slugToDoc.set(`${sanityType}::${sanitised}`, doc)
      }
    }
    // Index by WP ID
    const wpId = doc.legacySource?.wpId
    if (wpId) {
      wpIdToDoc.set(String(wpId), doc)
    }
    // Also index by WP slug from legacySource
    const wpSlug = doc.legacySource?.wpSlug
    if (wpSlug && slug) {
      const sanitisedWp = sanitiseSlug(wpSlug)
      slugToDoc.set(`${sanityType}::${sanitisedWp}`, doc)
    }
  }

  // Map: fromPath → redirect document (for matching WP URLs to existing redirects)
  const redirectFromMap = new Map()
  for (const r of redirectDocs) {
    if (r.fromPath) {
      redirectFromMap.set(normalisePath(r.fromPath), r)
    }
  }

  // Also include file-based redirects
  const fileRedirectMap = new Map()
  for (const r of fileRedirects) {
    if (r.from) {
      fileRedirectMap.set(normalisePath(r.from), r)
    }
  }

  return { slugToDoc, wpIdToDoc, redirectFromMap, fileRedirectMap }
}

/**
 * Classify a single WP URL record against the Sanity inventory.
 */
function classifyUrl(record, lookups) {
  const { wpUrl, wpType, wpSlug, wpId } = record
  const path = normalisePath(wpUrl)
  const { slugToDoc, wpIdToDoc, redirectFromMap, fileRedirectMap } = lookups

  // ─── Structural URLs (date archives, feeds, pagination, author) ─────────
  if (['date_archive', 'feed', 'pagination', 'author'].includes(wpType)) {
    return {
      status: 'STRUCTURAL',
      sanityId: null,
      sanityRoute: null,
      redirectFrom: null,
      redirectTo: null,
      note: `Structural: ${wpType} — typically handled by 404 or not worth redirecting`,
    }
  }

  // ─── Taxonomy URLs ──────────────────────────────────────────────────────
  if (wpType === 'category' || wpType === 'tag') {
    // Check if this taxonomy term exists in Sanity
    const sanityType = wpType // category/tag are the same in Sanity
    const sanitised = sanitiseSlug(wpSlug)
    const key = `${sanityType}::${sanitised}`
    const doc = lookups.slugToDoc.get(key)

    if (doc) {
      const route = getCanonicalPath(sanityType, doc.slug)
      return {
        status: 'TAXONOMY',
        sanityId: doc._id,
        sanityRoute: route,
        redirectFrom: null,
        redirectTo: null,
        note: `Taxonomy term exists in Sanity. WP URL was /category/ or /tag/ prefix — new route: ${route}`,
      }
    }

    return {
      status: 'TAXONOMY',
      sanityId: null,
      sanityRoute: null,
      redirectFrom: null,
      redirectTo: null,
      note: 'WP taxonomy URL — term may not exist in Sanity. Review whether redirect is needed.',
    }
  }

  // ─── Check hardcoded in-app redirects ───────────────────────────────────
  const hardcoded = matchHardcoded(path)
  if (hardcoded) {
    return {
      status: 'HARDCODED',
      sanityId: null,
      sanityRoute: hardcoded.target,
      redirectFrom: path,
      redirectTo: hardcoded.target,
      note: hardcoded.note,
    }
  }

  // ─── Check existing Sanity redirect documents ──────────────────────────
  const sanityRedirect = redirectFromMap.get(path)
  if (sanityRedirect && sanityRedirect.isActive) {
    return {
      status: 'REDIRECTED',
      sanityId: sanityRedirect._id,
      sanityRoute: sanityRedirect.toPath,
      redirectFrom: sanityRedirect.fromPath,
      redirectTo: sanityRedirect.toPath,
      note: `Sanity redirect: ${sanityRedirect.statusCode}`,
    }
  }

  // ─── Check _redirects file rules ────────────────────────────────────────
  const fileRedirect = fileRedirectMap.get(path)
  if (fileRedirect) {
    return {
      status: 'REDIRECTED',
      sanityId: null,
      sanityRoute: fileRedirect.to,
      redirectFrom: fileRedirect.from,
      redirectTo: fileRedirect.to,
      note: `_redirects file rule: ${fileRedirect.code}`,
    }
  }

  // ─── Try to match against Sanity documents ─────────────────────────────
  const sanityType = WP_TO_SANITY_TYPE[wpType]
  if (sanityType) {
    const sanitised = sanitiseSlug(wpSlug)

    // Try slug match
    const key = `${sanityType}::${sanitised}`
    let doc = slugToDoc.get(key)

    // Also try by wpId
    if (!doc && wpId) {
      doc = wpIdToDoc.get(String(wpId))
    }

    if (doc) {
      const route = getCanonicalPath(doc._type, doc.slug)
      return {
        status: 'MATCHED',
        sanityId: doc._id,
        sanityRoute: route,
        redirectFrom: null,
        redirectTo: null,
        note: `Sanity doc found: ${doc._type}/${doc.slug}`,
      }
    }
  }

  // ─── For page types: try root-level slug match ─────────────────────────
  if (wpType === 'page' || (!sanityType && path.split('/').filter(Boolean).length === 1)) {
    const slug = extractSlugFromPath(path)
    const sanitised = sanitiseSlug(slug)
    const key = `page::${sanitised}`
    const doc = slugToDoc.get(key)
    if (doc) {
      const route = getCanonicalPath('page', doc.slug)
      return {
        status: 'MATCHED',
        sanityId: doc._id,
        sanityRoute: route,
        redirectFrom: null,
        redirectTo: null,
        note: `Sanity page found: ${doc.slug}`,
      }
    }
  }

  // ─── ORPHANED — no match found ─────────────────────────────────────────
  const expectedRoute = wpUrlToExpectedRoute(wpUrl, wpType, wpSlug)
  return {
    status: 'ORPHANED',
    sanityId: null,
    sanityRoute: null,
    redirectFrom: path,
    redirectTo: expectedRoute,
    note: `No Sanity document or redirect found for this WP URL. Suggested target: ${expectedRoute || '(unknown)'}`,
  }
}

function runGapAnalysis(wpRecords, sanityData) {
  const lookups = buildLookups(sanityData.legacyDocs, sanityData.redirectDocs, sanityData.fileRedirects)
  const results = []

  for (const record of wpRecords) {
    const classification = classifyUrl(record, lookups)
    results.push({
      wpUrl: normalisePath(record.wpUrl),
      wpId: record.wpId,
      wpType: record.wpType,
      wpSlug: record.wpSlug,
      title: record.title,
      source: record.source,
      ...classification,
    })

    verbose(`${classification.status.padEnd(12)} ${normalisePath(record.wpUrl)} → ${classification.sanityRoute || classification.redirectTo || '—'}`)
  }

  return results
}

// ─── Step 4: Output artifacts ────────────────────────────────────────────────

function writeInventory(results) {
  const outputPath = resolve(ARTIFACTS_DIR, 'url_inventory.json')
  mkdirSync(ARTIFACTS_DIR, { recursive: true })
  writeFileSync(outputPath, JSON.stringify(results, null, 2) + '\n', 'utf8')
  return outputPath
}

function writeGapReport(results) {
  const outputPath = resolve(ARTIFACTS_DIR, 'redirect_gaps.md')
  const date = new Date().toISOString().split('T')[0]

  const counts = {
    MATCHED: results.filter((r) => r.status === 'MATCHED').length,
    REDIRECTED: results.filter((r) => r.status === 'REDIRECTED').length,
    HARDCODED: results.filter((r) => r.status === 'HARDCODED').length,
    ORPHANED: results.filter((r) => r.status === 'ORPHANED').length,
    TAXONOMY: results.filter((r) => r.status === 'TAXONOMY').length,
    STRUCTURAL: results.filter((r) => r.status === 'STRUCTURAL').length,
  }

  const lines = [
    `# Redirect Gap Analysis — ${date}`,
    '',
    '## Summary',
    '',
    `- **Total WP URLs found:** ${results.length}`,
    `- ✅ Matched in Sanity: ${counts.MATCHED}`,
    `- ✅ Already redirected: ${counts.REDIRECTED}`,
    `- ✅ Hardcoded (client-side): ${counts.HARDCODED}`,
    `- ⚠️ **ORPHANED (action needed): ${counts.ORPHANED}**`,
    `- ℹ️ Taxonomy (review): ${counts.TAXONOMY}`,
    `- ℹ️ Structural (ignore): ${counts.STRUCTURAL}`,
    '',
    '---',
    '',
  ]

  // Orphaned URLs
  const orphaned = results.filter((r) => r.status === 'ORPHANED')
  lines.push('## ⚠️ Orphaned URLs (Need Redirect Rules)')
  lines.push('')
  if (orphaned.length === 0) {
    lines.push('None! All WP URLs are accounted for. 🎉')
  } else {
    lines.push('| WP URL | WP Type | Title | Suggested Target |')
    lines.push('|---|---|---|---|')
    for (const r of orphaned) {
      lines.push(`| \`${r.wpUrl}\` | ${r.wpType} | ${r.title} | \`${r.redirectTo || '?'}\` |`)
    }
  }
  lines.push('')

  // Taxonomy URLs
  const taxonomy = results.filter((r) => r.status === 'TAXONOMY')
  lines.push('## ℹ️ Taxonomy URLs (Review)')
  lines.push('')
  if (taxonomy.length === 0) {
    lines.push('No taxonomy URLs found.')
  } else {
    lines.push('| WP URL | WP Type | Sanity Route | Notes |')
    lines.push('|---|---|---|---|')
    for (const r of taxonomy) {
      lines.push(`| \`${r.wpUrl}\` | ${r.wpType} | ${r.sanityRoute || '—'} | ${r.note} |`)
    }
  }
  lines.push('')

  // Structural URLs
  const structural = results.filter((r) => r.status === 'STRUCTURAL')
  lines.push('## ℹ️ Structural URLs (Typically Ignore)')
  lines.push('')
  if (structural.length === 0) {
    lines.push('No structural URLs found.')
  } else {
    lines.push(`${structural.length} structural URL(s) found (date archives, feeds, pagination, author pages).`)
    lines.push('These typically return 404 in the new system and do not need individual redirects.')
    lines.push('')
    lines.push('<details>')
    lines.push('<summary>Show all structural URLs</summary>')
    lines.push('')
    lines.push('| WP URL | Type | Notes |')
    lines.push('|---|---|---|')
    for (const r of structural) {
      lines.push(`| \`${r.wpUrl}\` | ${r.wpType} | ${r.note} |`)
    }
    lines.push('')
    lines.push('</details>')
  }
  lines.push('')

  // Covered summary
  const covered = results.filter((r) => ['MATCHED', 'REDIRECTED', 'HARDCODED'].includes(r.status))
  lines.push('## ✅ Covered (No Action)')
  lines.push('')
  lines.push(`${covered.length} URL(s) are already accounted for:`)
  lines.push(`- ${counts.MATCHED} matched directly to Sanity documents`)
  lines.push(`- ${counts.REDIRECTED} covered by existing redirect rules`)
  lines.push(`- ${counts.HARDCODED} covered by client-side redirects in App.jsx`)
  lines.push('')
  lines.push('<details>')
  lines.push('<summary>Show all covered URLs</summary>')
  lines.push('')
  lines.push('| WP URL | Status | Sanity Route | Notes |')
  lines.push('|---|---|---|---|')
  for (const r of covered) {
    lines.push(`| \`${r.wpUrl}\` | ${r.status} | ${r.sanityRoute || '—'} | ${r.note} |`)
  }
  lines.push('')
  lines.push('</details>')
  lines.push('')

  // Footer
  lines.push('---')
  lines.push('')
  lines.push(`*Generated by \`pnpm audit:urls\` on ${date}. See \`url_inventory.json\` for machine-readable data.*`)
  lines.push('')

  writeFileSync(outputPath, lines.join('\n'), 'utf8')
  return outputPath
}

function writeProposedRedirects(results) {
  const outputPath = resolve(ARTIFACTS_DIR, 'proposed_redirects.ndjson')
  const orphaned = results.filter((r) => r.status === 'ORPHANED' && r.redirectTo)

  const mutations = orphaned.map((r, i) => {
    const idSuffix = r.wpId ? `wp${r.wpId}` : sanitiseSlug(extractSlugFromPath(r.wpUrl)) || `url${i}`
    return JSON.stringify({
      _type: 'redirect',
      _id: `redirect.auto.${idSuffix}`,
      fromPath: r.wpUrl,
      toPath: r.redirectTo,
      statusCode: 301,
      isActive: true,
      notes: `Auto-generated from WP spider audit (${new Date().toISOString().split('T')[0]})`,
    })
  })

  writeFileSync(outputPath, mutations.length ? mutations.join('\n') + '\n' : '', 'utf8')
  return { path: outputPath, count: mutations.length }
}

// ─── Step 5: Console summary ─────────────────────────────────────────────────

function printSummary(results) {
  const date = new Date().toISOString().split('T')[0]
  const counts = {
    MATCHED: results.filter((r) => r.status === 'MATCHED').length,
    REDIRECTED: results.filter((r) => r.status === 'REDIRECTED').length,
    HARDCODED: results.filter((r) => r.status === 'HARDCODED').length,
    ORPHANED: results.filter((r) => r.status === 'ORPHANED').length,
    TAXONOMY: results.filter((r) => r.status === 'TAXONOMY').length,
    STRUCTURAL: results.filter((r) => r.status === 'STRUCTURAL').length,
  }

  section(`URL Audit — ${date}`)
  info(`📊  Total WP URLs found:      ${String(results.length).padStart(4)}`)
  info(`✅  Matched in Sanity:         ${String(counts.MATCHED).padStart(4)}`)
  info(`✅  Already redirected:        ${String(counts.REDIRECTED).padStart(4)}`)
  info(`✅  Hardcoded (client-side):   ${String(counts.HARDCODED).padStart(4)}`)
  info(`⚠️   ORPHANED (action needed):  ${String(counts.ORPHANED).padStart(4)}`)
  info(`ℹ️   Taxonomy (review):         ${String(counts.TAXONOMY).padStart(4)}`)
  info(`ℹ️   Structural (ignore):       ${String(counts.STRUCTURAL).padStart(4)}`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  banner(`WP URL Spider + Redirect Gap Analysis`)
  info(`WordPress: ${WP_BASE}`)
  info(`Verbose: ${VERBOSE ? 'on' : 'off'}`)

  // Step 1: Crawl WordPress
  section('Step 1 — Crawl WordPress')
  const wpRecords = await crawlWordPress()
  info(`\nTotal deduplicated WP URLs: ${wpRecords.length}`)

  // Step 2: Query Sanity
  section('Step 2 — Query Sanity')
  const sanityData = await querySanity()

  // Step 3: Gap analysis
  section('Step 3 — Gap Analysis')
  const results = runGapAnalysis(wpRecords, sanityData)

  // Step 4: Write artifacts
  section('Step 4 — Write Artifacts')
  mkdirSync(ARTIFACTS_DIR, { recursive: true })

  const inventoryPath = writeInventory(results)
  ok(`url_inventory.json (${results.length} entries)`)

  const gapReportPath = writeGapReport(results)
  ok(`redirect_gaps.md`)

  const { path: redirectsPath, count: proposedCount } = writeProposedRedirects(results)
  ok(`proposed_redirects.ndjson (${proposedCount} proposed redirect(s))`)

  // Step 5: Summary
  printSummary(results)
  console.log('──────────────────────────────────────────────')
  info(`📁  Artifacts written to scripts/audit/artifacts/`)
  console.log('══════════════════════════════════════════════\n')
}

main().catch((err) => {
  fail(`Unexpected error: ${err.message}`)
  console.error(err)
  process.exit(1)
})
