#!/usr/bin/env node
/**
 * build-sitemap.js — XML Sitemap + robots.txt Generator
 *
 * Fetches all published Sanity documents with slugs and generates:
 *   - dist/sitemap.xml  — valid sitemaps.org XML
 *   - dist/robots.txt   — with Sitemap: reference
 *
 * Runs AFTER `vite build` so output goes directly to dist/.
 *
 * Usage:
 *   pnpm --filter web build:sitemap
 *
 * Environment variables required (reads from .env or process.env):
 *   VITE_SANITY_PROJECT_ID
 *   VITE_SANITY_DATASET
 *   VITE_SANITY_API_VERSION
 *   SANITY_AUTH_TOKEN   (optional — only needed if dataset is private)
 *   VITE_SITE_URL       (optional — defaults to https://sugartown.io)
 */

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
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

// ─── Config ──────────────────────────────────────────────────────────────────

const projectId  = process.env.VITE_SANITY_PROJECT_ID
const dataset    = process.env.VITE_SANITY_DATASET
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2024-01-01'
const token      = process.env.SANITY_AUTH_TOKEN
const SITE_URL   = (process.env.VITE_SITE_URL || 'https://sugartown.io').replace(/\/+$/, '')

if (!projectId || !dataset) {
  console.error('❌  Missing VITE_SANITY_PROJECT_ID or VITE_SANITY_DATASET env vars')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // always fresh — build-time script
  ...(token ? { token } : {}),
})

// ─── URL construction (mirrors routes.js logic) ─────────────────────────────

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
  tool: 'tools',
}

function getCanonicalPath(docType, slug) {
  if (!slug) return null
  if (docType === 'page' || docType === 'archivePage') return `/${slug}`
  const contentPrefix = TYPE_NAMESPACES[docType]
  if (contentPrefix) return `/${contentPrefix}/${slug}`
  const taxonomyPrefix = TAXONOMY_NAMESPACES[docType]
  if (taxonomyPrefix) return `/${taxonomyPrefix}/${slug}`
  return `/${slug}`
}

// ─── Priority & changefreq heuristics ────────────────────────────────────────

const PRIORITY_MAP = {
  page: { priority: '0.8', changefreq: 'monthly' },
  article: { priority: '0.7', changefreq: 'monthly' },
  caseStudy: { priority: '0.7', changefreq: 'monthly' },
  node: { priority: '0.6', changefreq: 'weekly' },
  archivePage: { priority: '0.6', changefreq: 'weekly' },
  category: { priority: '0.4', changefreq: 'monthly' },
  tag: { priority: '0.4', changefreq: 'monthly' },
  project: { priority: '0.4', changefreq: 'monthly' },
  person: { priority: '0.3', changefreq: 'yearly' },
  tool: { priority: '0.3', changefreq: 'yearly' },
}

// ─── Static routes (not in Sanity) ──────────────────────────────────────────

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/sitemap', priority: '0.3', changefreq: 'weekly' },
  { path: '/platform/schema', priority: '0.2', changefreq: 'monthly' },
]

// ─── GROQ query ─────────────────────────────────────────────────────────────

const sitemapQuery = `
  *[
    _type in [
      "page", "article", "caseStudy", "node", "archivePage",
      "category", "tag", "project", "person", "tool"
    ]
    && defined(slug.current)
  ] {
    _type,
    "slug": slug.current,
    _updatedAt,
    "noIndex": coalesce(seo.noIndex, false),
    "canonicalUrl": seo.canonicalUrl
  }
`

// ─── XML generation ─────────────────────────────────────────────────────────

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildUrlEntry({ loc, lastmod, changefreq, priority }) {
  const lines = ['  <url>']
  lines.push(`    <loc>${escapeXml(loc)}</loc>`)
  if (lastmod) lines.push(`    <lastmod>${lastmod.split('T')[0]}</lastmod>`)
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`)
  if (priority) lines.push(`    <priority>${priority}</priority>`)
  lines.push('  </url>')
  return lines.join('\n')
}

function buildSitemapXml(entries) {
  const header = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ].join('\n')

  const footer = '</urlset>'
  const body = entries.map(buildUrlEntry).join('\n')

  return `${header}\n${body}\n${footer}\n`
}

// ─── robots.txt ─────────────────────────────────────────────────────────────

function buildRobotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# AI search crawlers — explicitly welcomed',
    '# Sugartown is a portfolio site; we want to be cited, not protected.',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    'User-agent: Amazonbot',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🗺️  Sugartown Sitemap Builder')
  console.log('══════════════════════════════════════════════\n')
  console.log(`   Project: ${projectId}  |  Dataset: ${dataset}`)
  console.log(`   Site URL: ${SITE_URL}\n`)

  // Fetch all published documents with slugs
  let docs
  try {
    docs = await client.fetch(sitemapQuery)
  } catch (err) {
    console.error('❌  Failed to fetch documents from Sanity:')
    console.error(`    ${err.message}`)
    process.exit(1)
  }

  if (!docs || docs.length === 0) {
    console.warn('⚠️  No documents found — generating sitemap with static routes only')
  }

  console.log(`   Found ${docs.length} published document(s) with slugs`)

  // Filter out noIndex documents and build URL entries
  const indexable = docs.filter(d => !d.noIndex)
  const excluded = docs.length - indexable.length
  console.log(`   ${indexable.length} indexable, ${excluded} excluded (noIndex)\n`)

  // Collect all URLs — deduplicate by path
  const seen = new Set()
  const entries = []

  // Static routes first
  for (const route of STATIC_ROUTES) {
    const loc = `${SITE_URL}${route.path}`
    if (!seen.has(route.path)) {
      seen.add(route.path)
      entries.push({
        loc,
        lastmod: new Date().toISOString(),
        changefreq: route.changefreq,
        priority: route.priority,
      })
    }
  }

  // Sanity documents
  for (const doc of indexable) {
    // Respect canonical URL override
    let path
    if (doc.canonicalUrl) {
      // If it's a full URL, use as-is; if relative, prepend site URL
      if (doc.canonicalUrl.startsWith('http')) {
        // External canonical — skip from our sitemap (it belongs to another site)
        continue
      }
      path = doc.canonicalUrl
    } else {
      path = getCanonicalPath(doc._type, doc.slug)
    }

    if (!path || seen.has(path)) continue
    seen.add(path)

    const meta = PRIORITY_MAP[doc._type] || { priority: '0.5', changefreq: 'monthly' }

    entries.push({
      loc: `${SITE_URL}${path}`,
      lastmod: doc._updatedAt,
      changefreq: meta.changefreq,
      priority: meta.priority,
    })
  }

  // Generate XML and robots.txt
  const sitemapXml = buildSitemapXml(entries)
  const robotsTxt = buildRobotsTxt()

  // Write to dist/ (post vite build)
  const distDir = resolve(__dirname, '../dist')
  if (!existsSync(distDir)) {
    console.warn('⚠️  dist/ does not exist — creating it (expected after vite build)')
    mkdirSync(distDir, { recursive: true })
  }

  const sitemapPath = resolve(distDir, 'sitemap.xml')
  const robotsPath = resolve(distDir, 'robots.txt')

  writeFileSync(sitemapPath, sitemapXml, 'utf8')
  writeFileSync(robotsPath, robotsTxt, 'utf8')

  // Summary
  console.log('──────────────────────────────────────────────')
  console.log(`✅  Written: dist/sitemap.xml (${entries.length} URLs)`)
  console.log(`✅  Written: dist/robots.txt`)

  // Breakdown by type
  const typeCounts = {}
  for (const doc of indexable) {
    typeCounts[doc._type] = (typeCounts[doc._type] || 0) + 1
  }
  console.log('\n   URL breakdown:')
  console.log(`     Static routes: ${STATIC_ROUTES.length}`)
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${type}: ${count}`)
  }
  if (excluded > 0) {
    console.log(`     (${excluded} noIndex document(s) excluded)`)
  }

  console.log('\n══════════════════════════════════════════════\n')
}

main().catch((err) => {
  console.error('❌  Unexpected error:', err)
  process.exit(1)
})
