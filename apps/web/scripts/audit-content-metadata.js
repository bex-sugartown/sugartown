#!/usr/bin/env node
/**
 * audit-content-metadata.js — EPIC-0183 Phase 1: Content Metadata Audit
 *
 * Queries all published content documents (article, caseStudy, node) and reports
 * taxonomy coverage: categories, tags, tools, projects, authors, excerpt, SEO.
 *
 * Also reports taxonomy utilization: usage counts for categories, tags, tools.
 *
 * Usage:
 *   node apps/web/scripts/audit-content-metadata.js
 *
 * Environment: reads from apps/web/.env (same as validate-content.js)
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Load env ────────────────────────────────────────────────────────────────

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
  } catch { /* .env not found */ }
}

loadEnv()

// ─── Sanity client ───────────────────────────────────────────────────────────

const projectId = process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'
const token = process.env.VITE_SANITY_TOKEN

if (!projectId) {
  console.error('ERROR: VITE_SANITY_PROJECT_ID is not set.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

// ─── Proposed minimums ───────────────────────────────────────────────────────

const MINIMUMS = {
  categories: 1,
  tags: 3,
  tools: { article: 1, node: 1, caseStudy: 0 }, // case studies exempt
  authors: 1,
}

// ─── GROQ queries ────────────────────────────────────────────────────────────

const CONTENT_QUERY = `*[_type in ["article", "caseStudy", "node"] && !(_id in path("drafts.**"))] | order(_type, title) {
  _id,
  _type,
  title,
  "slug": slug.current,
  "categoryCount": count(categories),
  "tagCount": count(tags),
  "toolCount": count(tools),
  "projectCount": count(projects),
  "authorCount": count(authors),
  "hasExcerpt": defined(excerpt) && excerpt != "",
  "hasSeoTitle": defined(seo.title) && seo.title != "",
  "hasSeoDescription": defined(seo.description) && seo.description != "",
  "categoryNames": categories[]->name,
  "tagNames": tags[]->name,
  "toolNames": tools[]->name,
  "authorNames": authors[]->name
}`

const TAXONOMY_USAGE_QUERY = `{
  "categories": *[_type == "category" && !(_id in path("drafts.**"))] {
    _id, name, "slug": slug.current,
    "articleCount": count(*[_type == "article" && references(^._id)]),
    "caseStudyCount": count(*[_type == "caseStudy" && references(^._id)]),
    "nodeCount": count(*[_type == "node" && references(^._id)])
  } | order(name),
  "tags": *[_type == "tag" && !(_id in path("drafts.**"))] {
    _id, name, "slug": slug.current,
    "articleCount": count(*[_type == "article" && references(^._id)]),
    "caseStudyCount": count(*[_type == "caseStudy" && references(^._id)]),
    "nodeCount": count(*[_type == "node" && references(^._id)])
  } | order(name),
  "tools": *[_type == "tool" && !(_id in path("drafts.**"))] {
    _id, name, "slug": slug.current,
    "articleCount": count(*[_type == "article" && references(^._id)]),
    "caseStudyCount": count(*[_type == "caseStudy" && references(^._id)]),
    "nodeCount": count(*[_type == "node" && references(^._id)])
  } | order(name),
  "people": *[_type == "person" && !(_id in path("drafts.**"))] {
    _id, name, "slug": slug.current,
    "articleCount": count(*[_type == "article" && references(^._id)]),
    "caseStudyCount": count(*[_type == "caseStudy" && references(^._id)]),
    "nodeCount": count(*[_type == "node" && references(^._id)])
  } | order(name)
}`

// ─── Run ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n📊  Sugartown Content Metadata Audit — EPIC-0183')
  console.log('══════════════════════════════════════════════════\n')
  console.log(`   Project: ${projectId}  |  Dataset: ${dataset}\n`)

  const [content, taxonomy] = await Promise.all([
    client.fetch(CONTENT_QUERY),
    client.fetch(TAXONOMY_USAGE_QUERY),
  ])

  // ── Section 1: Content coverage summary ──────────────────────────────────

  console.log('📋  CONTENT COVERAGE SUMMARY')
  console.log('──────────────────────────────────────────────────')

  const byType = { article: [], caseStudy: [], node: [] }
  for (const doc of content) {
    if (byType[doc._type]) byType[doc._type].push(doc)
  }

  for (const [type, docs] of Object.entries(byType)) {
    const total = docs.length
    if (total === 0) continue

    const toolMin = MINIMUMS.tools[type] ?? 0

    const catOk = docs.filter((d) => d.categoryCount >= MINIMUMS.categories).length
    const tagOk = docs.filter((d) => d.tagCount >= MINIMUMS.tags).length
    const toolOk = toolMin > 0 ? docs.filter((d) => d.toolCount >= toolMin).length : total
    const authOk = docs.filter((d) => d.authorCount >= MINIMUMS.authors).length
    const excOk = docs.filter((d) => d.hasExcerpt).length
    const seoTOk = docs.filter((d) => d.hasSeoTitle).length
    const seoDOk = docs.filter((d) => d.hasSeoDescription).length

    console.log(`\n   ${type} (${total} docs):`)
    console.log(`     categories ≥${MINIMUMS.categories}:  ${catOk}/${total}  ${catOk === total ? '✅' : `⚠️  ${total - catOk} below`}`)
    console.log(`     tags ≥${MINIMUMS.tags}:        ${tagOk}/${total}  ${tagOk === total ? '✅' : `⚠️  ${total - tagOk} below`}`)
    if (toolMin > 0) {
      console.log(`     tools ≥${toolMin}:       ${toolOk}/${total}  ${toolOk === total ? '✅' : `⚠️  ${total - toolOk} below`}`)
    } else {
      console.log(`     tools:          (exempt)`)
    }
    console.log(`     authors ≥${MINIMUMS.authors}:    ${authOk}/${total}  ${authOk === total ? '✅' : `⚠️  ${total - authOk} below`}`)
    console.log(`     excerpt:        ${excOk}/${total}  ${excOk === total ? '✅' : `ℹ️  ${total - excOk} missing`}`)
    console.log(`     seo.title:      ${seoTOk}/${total}  ${seoTOk === total ? '✅' : `ℹ️  ${total - seoTOk} missing`}`)
    console.log(`     seo.description:${seoDOk}/${total}  ${seoDOk === total ? '✅' : `ℹ️  ${total - seoDOk} missing`}`)
  }

  // ── Section 2: Documents below minimums (detail) ─────────────────────────

  console.log('\n\n📝  DOCUMENTS BELOW MINIMUMS')
  console.log('──────────────────────────────────────────────────')

  let belowCount = 0

  for (const doc of content) {
    const toolMin = MINIMUMS.tools[doc._type] ?? 0
    const issues = []

    if (doc.categoryCount < MINIMUMS.categories) issues.push(`categories: ${doc.categoryCount}/${MINIMUMS.categories}`)
    if (doc.tagCount < MINIMUMS.tags) issues.push(`tags: ${doc.tagCount}/${MINIMUMS.tags}`)
    if (toolMin > 0 && doc.toolCount < toolMin) issues.push(`tools: ${doc.toolCount}/${toolMin}`)
    if (doc.authorCount < MINIMUMS.authors) issues.push(`authors: ${doc.authorCount}/${MINIMUMS.authors}`)

    if (issues.length > 0) {
      belowCount++
      console.log(`\n   [${doc._type}] "${doc.title}" (/${doc.slug})`)
      console.log(`     Gaps: ${issues.join(', ')}`)
      if (doc.categoryNames?.length) console.log(`     Has categories: ${doc.categoryNames.join(', ')}`)
      if (doc.tagNames?.length) console.log(`     Has tags: ${doc.tagNames.join(', ')}`)
      if (doc.toolNames?.length) console.log(`     Has tools: ${doc.toolNames.join(', ')}`)
      if (doc.authorNames?.length) console.log(`     Has authors: ${doc.authorNames.join(', ')}`)
    }
  }

  if (belowCount === 0) {
    console.log('\n   ✅ All documents meet minimum taxonomy thresholds.')
  } else {
    console.log(`\n   ⚠️  ${belowCount} of ${content.length} documents below minimums`)
  }

  // ── Section 3: Taxonomy utilization ──────────────────────────────────────

  console.log('\n\n📈  TAXONOMY UTILIZATION')
  console.log('──────────────────────────────────────────────────')

  for (const [type, items] of Object.entries(taxonomy)) {
    const total = items.length
    const withUsage = items.map((i) => ({
      ...i,
      totalUsage: (i.articleCount || 0) + (i.caseStudyCount || 0) + (i.nodeCount || 0),
    }))
    const unused = withUsage.filter((i) => i.totalUsage === 0)
    const underused = withUsage.filter((i) => i.totalUsage > 0 && i.totalUsage <= 1)

    console.log(`\n   ${type} (${total} total):`)

    // Top 5 most used
    const sorted = [...withUsage].sort((a, b) => b.totalUsage - a.totalUsage)
    const top = sorted.slice(0, 5)
    console.log(`     Most used:`)
    for (const item of top) {
      console.log(`       ${item.name}: ${item.totalUsage} refs (a:${item.articleCount} cs:${item.caseStudyCount} n:${item.nodeCount})`)
    }

    if (unused.length > 0) {
      console.log(`     ⚠️  Unused (0 refs): ${unused.map((i) => i.name).join(', ')}`)
    }
    if (underused.length > 0) {
      console.log(`     ℹ️  Underused (1 ref): ${underused.map((i) => i.name).join(', ')}`)
    }
  }

  // ── Section 4: Cross-type coverage gaps ──────────────────────────────────

  console.log('\n\n🔍  CROSS-TYPE COVERAGE GAPS')
  console.log('──────────────────────────────────────────────────')

  for (const type of ['tags', 'tools']) {
    const items = taxonomy[type] || []
    const articleOnly = items.filter((i) => i.articleCount > 0 && i.nodeCount === 0 && i.caseStudyCount === 0)
    const nodeOnly = items.filter((i) => i.nodeCount > 0 && i.articleCount === 0 && i.caseStudyCount === 0)

    if (articleOnly.length > 0) {
      console.log(`\n   ${type} used in articles only: ${articleOnly.map((i) => i.name).join(', ')}`)
    }
    if (nodeOnly.length > 0) {
      console.log(`   ${type} used in nodes only: ${nodeOnly.map((i) => i.name).join(', ')}`)
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────

  console.log('\n\n══════════════════════════════════════════════════')
  console.log(`📊  AUDIT COMPLETE`)
  console.log(`    ${content.length} content documents audited`)
  console.log(`    ${belowCount} below minimum thresholds`)
  console.log(`    ${taxonomy.categories?.length ?? 0} categories, ${taxonomy.tags?.length ?? 0} tags, ${taxonomy.tools?.length ?? 0} tools, ${taxonomy.people?.length ?? 0} people`)
  console.log('══════════════════════════════════════════════════\n')
}

run().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
