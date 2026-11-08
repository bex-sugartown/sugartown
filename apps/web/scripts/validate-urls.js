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
import { judgeUrls, RESERVED_PAGE_SLUGS } from './lib/urls-rules.cjs'

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
  "releaseNotes": *[_type == "releaseNote" && defined(slug.current)] { _id, _type, title, "slug": slug.current },
  "archivePages": *[_type == "archivePage" && defined(slug.current)] { _id, _type, title, "slug": slug.current, contentTypes },
  "pagesNoSlug": *[_type == "page" && !defined(slug.current)] { _id, _type, title },
  "articlesNoSlug": *[_type == "article" && !defined(slug.current)] { _id, _type, title },
  "caseStudiesNoSlug": *[_type == "caseStudy" && !defined(slug.current)] { _id, _type, title },
  "nodesNoSlug": *[_type == "node" && !defined(slug.current)] { _id, _type, title },
  "releaseNotesNoSlug": *[_type == "releaseNote" && !defined(slug.current)] { _id, _type, title },
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

  const { pages, articles, caseStudies, nodes, releaseNotes, archivePages } = data
  // The judging half lives in lib/urls-rules.cjs so the liveness probe runs the same function.
  const { totalDocs, duplicates, missingSlug, reservedCollisions, navReport, errors, warnings } = judgeUrls(data)

  // ── B) Print URL Coverage Report ──────────────────────────────────────────

  console.log('📋  URL Coverage Report')
  console.log('──────────────────────────────────────────────')
  console.log(`   Total docs with slugs inspected: ${totalDocs}`)
  console.log(`     pages:        ${pages.length}`)
  console.log(`     articles:     ${articles.length}`)
  console.log(`     releaseNotes: ${releaseNotes.length}`)
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

  if (navReport.length === 0) {
    console.log('   (no navigation documents found)')
  }

  for (const nav of navReport) {
    console.log(`\n   Nav: "${nav.title || 'untitled'}"`)
    for (const item of nav.items) {
      console.log(`     ${item.ok ? '✅' : '⚠️ '}  "${item.label}" → ${item.url ?? '(no url)'}`)
      for (const child of item.children) {
        console.log(`       ${child.ok ? '  ✅' : '  ⚠️ '}  "${child.label}" → ${child.url ?? '(no url)'}`)
      }
    }
  }

  // ── E) Summary ────────────────────────────────────────────────────────────

  console.log('\n══════════════════════════════════════════════')
  // Reserved namespace collisions are hard errors — they would silently break routing.
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
