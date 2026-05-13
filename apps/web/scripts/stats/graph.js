/**
 * graph.js — graph namespace collectors (SUG-73 + SUG-81)
 *
 * collectGraph()     — nodes-only (DEPRECATED, kept for transition safety)
 * collectSiteGraph() — site-wide: article + caseStudy + node (SUG-81 Phase 2)
 *
 * Output shape (stats.siteGraph):
 * {
 *   generatedAt: "ISO string",
 *   nodes: [
 *     { id, type: "project"|"category"|"item", docType, label, href, size }
 *     // docType set on item nodes: "article" | "caseStudy" | "node"
 *   ],
 *   edges: [
 *     { source, target, kind: "membership" },
 *     { source, target, kind: "sharedTag", weight: N }
 *   ]
 * }
 *
 * Node ID scheme: "item:${docType}:${slug}" — unique across types.
 * Lateral edges: cross-type confirmed — items sharing 2+ tags are connected.
 */

import { createClient } from '@sanity/client'
import { readFileSync }  from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath }   from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const LATERAL_THRESHOLD = 2  // min shared tags to draw a lateral edge

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
  } catch { /* empty */ }
}

function makeClient() {
  loadEnv()
  const projectId  = process.env.VITE_SANITY_PROJECT_ID
  const dataset    = process.env.VITE_SANITY_DATASET ?? 'production'
  const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'
  const token      = process.env.VITE_SANITY_TOKEN
  if (!projectId) throw new Error('VITE_SANITY_PROJECT_ID not set')
  return createClient({ projectId, dataset, apiVersion, useCdn: false, token, perspective: 'published' })
}

// ── Shared edge builder ────────────────────────────────────────────────────────

function buildEdges(rawItems, getItemId) {
  const edges = []

  for (const item of rawItems) {
    const itemId = getItemId(item)
    for (const p of (item.projects ?? [])) {
      if (p?.slug) edges.push({ source: itemId, target: `project:${p.slug}`, kind: 'membership' })
    }
    for (const c of (item.categories ?? [])) {
      if (c?.slug) edges.push({ source: itemId, target: `category:${c.slug}`, kind: 'membership' })
    }
  }

  // Lateral edges: pairs sharing LATERAL_THRESHOLD+ tags (cross-type allowed)
  const withTags = rawItems.filter(n => (n.tags ?? []).length > 0)
  for (let i = 0; i < withTags.length; i++) {
    const slugsA = new Set((withTags[i].tags ?? []).map(t => t.slug).filter(Boolean))
    for (let j = i + 1; j < withTags.length; j++) {
      const slugsB = (withTags[j].tags ?? []).map(t => t.slug).filter(Boolean)
      const shared = slugsB.filter(s => slugsA.has(s))
      if (shared.length >= LATERAL_THRESHOLD) {
        edges.push({
          source: getItemId(withTags[i]),
          target: getItemId(withTags[j]),
          kind:   'sharedTag',
          weight: shared.length,
        })
      }
    }
  }

  return edges
}

// ── collectSiteGraph — site-wide, all content types (SUG-81) ─────────────────

export async function collectSiteGraph() {
  const client = makeClient()

  const rawItems = await client.fetch(`
    *[_type in ["article", "caseStudy", "node"] && defined(slug.current)] | order(title asc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      "projects":   projects[]->{_id, name, "slug": slug.current},
      "categories": categories[]->{_id, name, "slug": slug.current},
      "tags":       tags[]->{_id, "slug": slug.current, name}
    }
  `)

  const hrefPrefix = { article: '/articles', caseStudy: '/case-studies', node: '/nodes' }

  const projectMap  = new Map()
  const categoryMap = new Map()
  const tagMap      = new Map()
  for (const item of rawItems) {
    for (const p of (item.projects ?? [])) { if (p?.slug) projectMap.set(p.slug, p) }
    for (const c of (item.categories ?? [])) { if (c?.slug) categoryMap.set(c.slug, c) }
    for (const t of (item.tags ?? [])) { if (t?.slug) tagMap.set(t.slug, t) }
  }

  const nodes = []
  for (const p of projectMap.values()) {
    nodes.push({ id: `project:${p.slug}`, type: 'project', label: p.name, href: `/projects/${p.slug}`, size: 'large' })
  }
  for (const c of categoryMap.values()) {
    nodes.push({ id: `category:${c.slug}`, type: 'category', label: c.name, href: `/categories/${c.slug}`, size: 'medium' })
  }
  for (const t of tagMap.values()) {
    nodes.push({ id: `tag:${t.slug}`, type: 'tag', label: t.name, href: `/tags/${t.slug}`, size: 'small' })
  }
  for (const item of rawItems) {
    nodes.push({
      id:      `item:${item._type}:${item.slug}`,
      _id:     item._id,
      type:    'item',
      docType: item._type,
      slug:    item.slug,
      label:   item.title,
      href:    `${hrefPrefix[item._type]}/${item.slug}`,
      size:    'small',
      tags:    (item.tags ?? []).map(t => ({ slug: t.slug, label: t.name })).filter(t => t.slug),
    })
  }

  const edges = buildEdges(rawItems, item => `item:${item._type}:${item.slug}`)
  // Tag-membership edges: item → tag hub
  for (const item of rawItems) {
    const itemId = `item:${item._type}:${item.slug}`
    for (const t of (item.tags ?? [])) {
      if (t?.slug) edges.push({ source: itemId, target: `tag:${t.slug}`, kind: 'tag-membership' })
    }
  }

  return { generatedAt: new Date().toISOString(), nodes, edges }
}

