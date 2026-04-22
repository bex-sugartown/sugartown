#!/usr/bin/env node
/**
 * export-taxonomy-csv.js — SUG-73 Phase 0
 *
 * Exports taxonomy data (categories, tags, tools, projects, nodes) from Sanity
 * to CSVs under output/audit/ for human review. Shipped as the prerequisite
 * step before the dynamic knowledge graph (SUG-73) and the taxonomy cleanup
 * epic that follows it.
 *
 * Usage:
 *   node apps/web/scripts/audit/export-taxonomy-csv.js
 */

import { createClient } from '@sanity/client'
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const envPath = resolve(__dirname, '../../.env')
  try {
    const raw = readFileSync(envPath, 'utf8')
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
loadEnv()

const projectId = process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'
const token = process.env.VITE_SANITY_TOKEN

if (!projectId) {
  console.error('ERROR: VITE_SANITY_PROJECT_ID is not set.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

function csvEscape(v) {
  if (v === null || v === undefined) return ''
  const s = String(v).replace(/\r?\n/g, ' ').trim()
  if (/[",]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(rows, headers) {
  const head = headers.join(',')
  const body = rows.map(r => headers.map(h => csvEscape(r[h])).join(',')).join('\n')
  return head + '\n' + body + '\n'
}

const outDir = resolve(__dirname, '../../../../output/audit')
mkdirSync(outDir, { recursive: true })

async function run() {
  console.log(`Exporting taxonomy CSVs from Sanity (${projectId}/${dataset})…`)

  // Categories
  const categories = await client.fetch(`
    *[_type == "category" && !(_id in path("drafts.**"))] | order(name asc) {
      "id": _id, "name": name, "slug": slug.current, description,
      "parent": parent->name,
      "articles": count(*[_type == "article" && references(^._id)]),
      "caseStudies": count(*[_type == "caseStudy" && references(^._id)]),
      "nodes": count(*[_type == "node" && references(^._id)])
    }
  `)
  const catRows = categories.map(c => ({
    ...c, total: (c.articles || 0) + (c.caseStudies || 0) + (c.nodes || 0)
  }))
  writeFileSync(resolve(outDir, 'categories.csv'),
    toCsv(catRows, ['id', 'name', 'slug', 'description', 'parent', 'articles', 'caseStudies', 'nodes', 'total']))
  console.log(`  categories.csv — ${catRows.length} rows`)

  // Tags
  const tags = await client.fetch(`
    *[_type == "tag" && !(_id in path("drafts.**"))] | order(name asc) {
      "id": _id, "name": name, "slug": slug.current, description,
      "articles": count(*[_type == "article" && references(^._id)]),
      "caseStudies": count(*[_type == "caseStudy" && references(^._id)]),
      "nodes": count(*[_type == "node" && references(^._id)])
    }
  `)
  const tagRows = tags.map(t => ({
    ...t, total: (t.articles || 0) + (t.caseStudies || 0) + (t.nodes || 0)
  }))
  writeFileSync(resolve(outDir, 'tags.csv'),
    toCsv(tagRows, ['id', 'name', 'slug', 'description', 'articles', 'caseStudies', 'nodes', 'total']))
  console.log(`  tags.csv — ${tagRows.length} rows`)

  // Tools
  const tools = await client.fetch(`
    *[_type == "tool" && !(_id in path("drafts.**"))] | order(name asc) {
      "id": _id, "name": name, "slug": slug.current, "toolType": toolType, description,
      "articles": count(*[_type == "article" && references(^._id)]),
      "caseStudies": count(*[_type == "caseStudy" && references(^._id)]),
      "nodes": count(*[_type == "node" && references(^._id)])
    }
  `)
  const toolRows = tools.map(t => ({
    ...t, total: (t.articles || 0) + (t.caseStudies || 0) + (t.nodes || 0)
  }))
  writeFileSync(resolve(outDir, 'tools.csv'),
    toCsv(toolRows, ['id', 'name', 'slug', 'toolType', 'description', 'articles', 'caseStudies', 'nodes', 'total']))
  console.log(`  tools.csv — ${toolRows.length} rows`)

  // Projects
  const projects = await client.fetch(`
    *[_type == "project" && !(_id in path("drafts.**"))] | order(name asc) {
      "id": _id, title, "slug": slug.current, description, "accentColor": accentColor.hex,
      "articles": count(*[_type == "article" && references(^._id)]),
      "caseStudies": count(*[_type == "caseStudy" && references(^._id)]),
      "nodes": count(*[_type == "node" && references(^._id)])
    }
  `)
  const projRows = projects.map(p => ({
    ...p, total: (p.articles || 0) + (p.caseStudies || 0) + (p.nodes || 0)
  }))
  writeFileSync(resolve(outDir, 'projects.csv'),
    toCsv(projRows, ['id', 'title', 'slug', 'description', 'accentColor', 'articles', 'caseStudies', 'nodes', 'total']))
  console.log(`  projects.csv — ${projRows.length} rows`)

  // Nodes (content docs, not taxonomy — included so graph edges can be reviewed)
  const nodes = await client.fetch(`
    *[_type == "node" && !(_id in path("drafts.**"))] | order(title asc) {
      "id": _id, title, "slug": slug.current,
      "categoryRefs": categories[]->name,
      "projectRefs": projects[]->name,
      "tagRefs": tags[]->name,
      "toolRefs": tools[]->name
    }
  `)
  const nodeRows = nodes.map(n => ({
    id: n.id,
    title: n.title,
    slug: n.slug,
    categories: (n.categoryRefs || []).join('; '),
    projects: (n.projectRefs || []).join('; '),
    tags: (n.tagRefs || []).join('; '),
    tools: (n.toolRefs || []).join('; ')
  }))
  writeFileSync(resolve(outDir, 'nodes.csv'),
    toCsv(nodeRows, ['id', 'title', 'slug', 'categories', 'projects', 'tags', 'tools']))
  console.log(`  nodes.csv — ${nodeRows.length} rows`)

  console.log(`\nOutput: ${outDir}`)
}

run().catch(err => { console.error(err); process.exit(1) })
