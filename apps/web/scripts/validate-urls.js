#!/usr/bin/env node
/**
 * validate-urls.js — Dev-time URL Authority Validator
 *
 * Checks ALL published Sanity documents that require canonical URLs for:
 *   A) Duplicate canonical URLs (two docs resolving to same path)
 *   B) Published docs missing a required slug
 *
 * Also validates navigation items against canonical route patterns.
 *
 * Usage:
 *   pnpm validate:urls
 *
 * Exits with code 1 if any errors are found, 0 if clean.
 *
 * Environment variables required (reads from .env or process.env):
 *   VITE_SANITY_PROJECT_ID
 *   VITE_SANITY_DATASET
 *   VITE_SANITY_API_VERSION
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
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
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env not found — rely on process.env (CI etc.)
  }
}

loadEnv()

// ─── Route registry (inline — mirrors src/lib/routes.js) ─────────────────────
// Duplicated here so the script has no bundler dependency.

const TYPE_NAMESPACES = {
  article: 'articles',
  caseStudy: 'case-studies',
  node: 'nodes',
}

function getCanonicalPath({ docType, slug }) {
  if (!slug) return null
  const s = slug.replace(/^\/+|\/+$/g, '').trim()
  if (!s) return null
  if (docType === 'page') return `/${s}`
  const prefix = TYPE_NAMESPACES[docType]
  if (!prefix) return null
  return `/${prefix}/${s}`
}

const ARCHIVE_PATHS = ['/articles', '/case-studies', '/knowledge-graph', '/nodes']
const TAXONOMY_BASE_PATHS = ['/tags', '/categories', '/projects', '/people', '/tools']

// Reserved namespace slugs that page documents must never use.
// A page slug matching any of these would shadow the canonical archive/taxonomy route.
const RESERVED_PAGE_SLUGS = [
  'articles',
  'case-studies',
  'knowledge-graph',
  'nodes',
  'tags',
  'categories',
  'projects',
  'people',
  'tools',
]

function validateNavItemUrl(rawUrl) {
  if (!rawUrl) return { valid: false, reason: 'url is empty/null' }
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return { valid: true }

  // Normalise trailing slash: /knowledge-graph/ → /knowledge-graph
  // (except root "/" which should stay as-is)
  const url = rawUrl.length > 1 ? rawUrl.replace(/\/+$/, '') : rawUrl

  if (url !== rawUrl) {
    // Trailing slash detected — warn about it but still check if the normalised path is valid
    const inner = validateNavItemUrl(url)
    if (inner.valid) {
      return {
        valid: false,
        reason: `trailing slash — canonical path is "${url}" (update in Sanity nav)`,
      }
    }
  }

  if (url === '/') return { valid: true }
  if (ARCHIVE_PATHS.includes(url)) return { valid: true }
  if (TAXONOMY_BASE_PATHS.some((b) => url === b || url.startsWith(b + '/'))) return { valid: true }
  const namespacePrefixes = Object.values(TYPE_NAMESPACES).map((p) => `/${p}/`)
  if (namespacePrefixes.some((prefix) => url.startsWith(prefix))) return { valid: true }
  const segments = url.replace(/^\//, '').split('/')
  const reserved = [
    ...Object.values(TYPE_NAMESPACES),
    ...ARCHIVE_PATHS.map((p) => p.replace(/^\//, '')),
    ...TAXONOMY_BASE_PATHS.map((p) => p.replace(/^\//, '')),
  ]
  if (segments.length === 1 && !reserved.includes(segments[0])) return { valid: true }
  return { valid: false, reason: `"${url}" does not match any canonical route pattern` }
}

// ─── Sanity client ────────────────────────────────────────────────────────────

const projectId = process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'

if (!projectId) {
  console.error('[validate-urls] ERROR: VITE_SANITY_PROJECT_ID is not set.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false })

// ─── Fetch all slugs ──────────────────────────────────────────────────────────

const query = `{
  "pages": *[_type == "page" && defined(slug.current)] { _id, _type, title, "slug": slug.current },
  "articles": *[_type == "article" && defined(slug.current)] { _id, _type, title, "slug": slug.current },
  "caseStudies": *[_type == "caseStudy" && defined(slug.current)] { _id, _type, title, "slug": slug.current },
  "nodes": *[_type == "node" && defined(slug.current)] { _id, _type, title, "slug": slug.current },
  "archivePages": *[_type == "archivePage" && defined(slug.current)] { _id, _type, title, "slug": slug.current, contentTypes },
  "pagesNoSlug": *[_type == "page" && !defined(slug.current)] { _id, _type, title },
  "articlesNoSlug": *[_type == "article" && !defined(slug.current)] { _id, _type, title },
  "caseStudiesNoSlug": *[_type == "caseStudy" && !defined(slug.current)] { _id, _type, title },
  "nodesNoSlug": *[_type == "node" && !defined(slug.current)] { _id, _type, title },
  "navItems": *[_type == "navigation"][0...10] {
    title,
    items[]{
      label,
      "url": link.url,
      children[]{
        label,
        "url": link.url
      }
    }
  }
}`

// ─── Run validation ───────────────────────────────────────────────────────────

async function run() {
  console.log('\n🔍  Sugartown URL Validator')
  console.log('══════════════════════════════════════════════\n')
  console.log(`   Project: ${projectId}  |  Dataset: ${dataset}\n`)

  let data
  try {
    data = await client.fetch(query)
  } catch (err) {
    console.error('[validate-urls] Sanity fetch failed:', err.message)
    process.exit(1)
  }

  const { pages, articles, caseStudies, nodes, archivePages } = data
  const missingSlug = [
    ...data.pagesNoSlug,
    ...data.articlesNoSlug,
    ...data.caseStudiesNoSlug,
    ...data.nodesNoSlug,
  ]

  // Build a set of published archive slugs for nav cross-reference
  const publishedArchiveSlugs = new Set(archivePages.map((a) => a.slug))

  // ── A) Build canonical URL map and detect duplicates ──────────────────────

  const urlMap = new Map() // canonical path → doc info
  const duplicates = []
  const allDocs = [
    ...pages.map((d) => ({ ...d, docType: 'page' })),
    ...articles.map((d) => ({ ...d, docType: 'article' })),
    ...caseStudies.map((d) => ({ ...d, docType: 'caseStudy' })),
    ...nodes.map((d) => ({ ...d, docType: 'node' })),
  ]

  let totalDocs = allDocs.length

  for (const doc of allDocs) {
    const path = getCanonicalPath({ docType: doc.docType, slug: doc.slug })
    if (!path) continue

    if (urlMap.has(path)) {
      duplicates.push({ path, docs: [urlMap.get(path), doc] })
    } else {
      urlMap.set(path, doc)
    }
  }

  // ── B) Print URL Coverage Report ──────────────────────────────────────────

  console.log('📋  URL Coverage Report')
  console.log('──────────────────────────────────────────────')
  console.log(`   Total docs with slugs inspected: ${totalDocs}`)
  console.log(`     pages:        ${pages.length}`)
  console.log(`     articles:     ${articles.length}`)
  console.log(`     caseStudies:  ${caseStudies.length}`)
  console.log(`     nodes:        ${nodes.length}`)
  console.log()

  console.log('📁  Published Archive Pages')
  console.log('──────────────────────────────────────────────')
  if (archivePages.length === 0) {
    console.log('   ⚠️   No published archivePage docs found — archive routes will render 404')
  } else {
    for (const ap of archivePages) {
      const hasSlashIssue = ap.slug && (ap.slug.startsWith('/') || ap.slug.endsWith('/'))
      const icon = hasSlashIssue ? '⚠️ ' : '✅'
      console.log(`   ${icon}  /${ap.slug}  →  [${(ap.contentTypes || []).join(', ')}]  "${ap.title}"`)
      if (hasSlashIssue) {
        console.log(`        ↳ Slug has leading/trailing slash — will not match route. Fix in Studio.`)
      }
    }
  }
  console.log()

  if (missingSlug.length === 0) {
    console.log('   ✅  No docs with missing slugs')
  } else {
    console.log(`   ⚠️   ${missingSlug.length} doc(s) missing required slug:`)
    for (const doc of missingSlug) {
      console.log(`        [${doc._type}] "${doc.title || 'untitled'}" — ${doc._id}`)
    }
  }

  console.log()

  if (duplicates.length === 0) {
    console.log('   ✅  No duplicate canonical URLs detected')
  } else {
    console.log(`   ❌  ${duplicates.length} duplicate canonical URL(s) detected:`)
    for (const dup of duplicates) {
      console.log(`\n        Path: ${dup.path}`)
      for (const doc of dup.docs) {
        console.log(
          `          → [${doc.docType}] "${doc.title || 'untitled'}" (${doc._id})`,
        )
      }
    }
  }

  // ── C) Reserved namespace collision check ────────────────────────────────
  // Page slugs must not collide with reserved URL namespace prefixes.
  // A page with slug "articles" would shadow /articles (the article archive).

  const reservedCollisions = pages.filter((p) => RESERVED_PAGE_SLUGS.includes(p.slug))

  console.log('\n🚫  Reserved Namespace Collision Check')
  console.log('──────────────────────────────────────────────')
  if (reservedCollisions.length === 0) {
    console.log('   ✅  No page slugs collide with reserved namespaces')
  } else {
    console.log(
      `   ❌  ${reservedCollisions.length} page slug(s) collide with reserved namespace(s):`,
    )
    for (const doc of reservedCollisions) {
      console.log(
        `        [page] slug="${doc.slug}" — shadows /${doc.slug} route  (${doc._id})`,
      )
    }
    console.log(
      `\n   Reserved slugs: ${RESERVED_PAGE_SLUGS.map((s) => `"${s}"`).join(', ')}`,
    )
  }
  console.log()

  // ── D) Print Nav Resolution Report ───────────────────────────────────────

  console.log('\n🧭  Nav Resolution Report')
  console.log('──────────────────────────────────────────────')

  const navWarnings = []
  const navItems = data.navItems ?? []

  if (navItems.length === 0) {
    console.log('   (no navigation documents found)')
  }

  for (const nav of navItems) {
    if (!nav.items?.length) continue
    console.log(`\n   Nav: "${nav.title || 'untitled'}"`)
    for (const item of nav.items) {
      const { valid, reason } = validateNavItemUrl(item.url)
      // Extra check: if url is an archive path, verify a published archivePage doc exists for it
      let archiveWarning = null
      if (valid && item.url) {
        const stripped = item.url.replace(/^\/|\/$/g, '')
        if (ARCHIVE_PATHS.includes(`/${stripped}`) && !publishedArchiveSlugs.has(stripped)) {
          archiveWarning = `no published archivePage doc with slug "${stripped}" — route will 404`
        }
      }
      const icon = (valid && !archiveWarning) ? '✅' : '⚠️ '
      console.log(`     ${icon}  "${item.label}" → ${item.url ?? '(no url)'}`)
      if (!valid) navWarnings.push({ label: item.label, url: item.url, reason })
      if (archiveWarning) navWarnings.push({ label: item.label, url: item.url, reason: archiveWarning })

      for (const child of item.children ?? []) {
        const cv = validateNavItemUrl(child.url)
        let childArchiveWarning = null
        if (cv.valid && child.url) {
          const stripped = child.url.replace(/^\/|\/$/g, '')
          if (ARCHIVE_PATHS.includes(`/${stripped}`) && !publishedArchiveSlugs.has(stripped)) {
            childArchiveWarning = `no published archivePage doc with slug "${stripped}" — route will 404`
          }
        }
        const ci = (cv.valid && !childArchiveWarning) ? '  ✅' : '  ⚠️ '
        console.log(`       ${ci}  "${child.label}" → ${child.url ?? '(no url)'}`)
        if (!cv.valid) navWarnings.push({ label: child.label, url: child.url, reason: cv.reason })
        if (childArchiveWarning) navWarnings.push({ label: child.label, url: child.url, reason: childArchiveWarning })
      }
    }
  }

  // ── E) Summary ────────────────────────────────────────────────────────────

  console.log('\n══════════════════════════════════════════════')
  // Reserved namespace collisions are hard errors — they would silently break routing.
  const errors = duplicates.length + reservedCollisions.length
  const warnings = missingSlug.length + navWarnings.length

  if (errors === 0 && warnings === 0) {
    console.log('✅  All checks passed — URL authority is clean.\n')
    process.exit(0)
  }

  if (duplicates.length > 0) {
    console.log(`❌  ${duplicates.length} ERROR(S) found — duplicate canonical URLs must be resolved.`)
  }
  if (reservedCollisions.length > 0) {
    console.log(`❌  ${reservedCollisions.length} ERROR(S) found — page slug(s) collide with reserved namespaces.`)
  }
  if (warnings > 0) {
    console.log(`⚠️   ${warnings} WARNING(S) found — review missing slugs and nav items.`)
  }
  console.log()

  process.exit(errors > 0 ? 1 : 0)
}

run()
