/**
 * graph.js — graph namespace collector (SUG-73)
 *
 * Builds the force-graph data artifact from Sanity at build time.
 * Rides the SUG-67 stats pipeline; registered as a network collector in collect-stats.js.
 *
 * Output shape (stats.graph):
 * {
 *   generatedAt: "ISO string",
 *   nodes: [
 *     { id, type: "project"|"category"|"item", label, href, size: "large"|"medium"|"small" },
 *     { id, type: "item", label, href, size: "small", tags: ["slug", ...] }
 *   ],
 *   edges: [
 *     { source, target, kind: "membership" },
 *     { source, target, kind: "sharedTag", weight: N }  // Option B lateral edges
 *   ]
 * }
 *
 * Edge semantics: Option B — membership edges + dashed lateral edges between
 * knowledge nodes that share 2+ tags (threshold: LATERAL_THRESHOLD).
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
  } catch {}
}

export async function collectGraph() {
  loadEnv()

  const projectId  = process.env.VITE_SANITY_PROJECT_ID
  const dataset    = process.env.VITE_SANITY_DATASET ?? 'production'
  const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'
  const token      = process.env.VITE_SANITY_TOKEN

  if (!projectId) throw new Error('VITE_SANITY_PROJECT_ID not set')

  const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token, perspective: 'published' })

  // Fetch all published nodes with their taxonomy refs
  const rawNodes = await client.fetch(`
    *[_type == "node" && defined(slug.current)] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      "projects": projects[]->{_id, name, "slug": slug.current},
      "categories": categories[]->{_id, name, "slug": slug.current},
      "tags": tags[]->{_id, "slug": slug.current}
    }
  `)

  // Collect unique hub nodes (projects + categories) from node refs
  const projectMap  = new Map()
  const categoryMap = new Map()

  for (const n of rawNodes) {
    for (const p of (n.projects ?? [])) {
      if (p?.slug) projectMap.set(p.slug, p)
    }
    for (const c of (n.categories ?? [])) {
      if (c?.slug) categoryMap.set(c.slug, c)
    }
  }

  // Build nodes array: projects (large) → categories (medium) → items (small)
  const nodes = []

  for (const p of projectMap.values()) {
    nodes.push({
      id:    `project:${p.slug}`,
      type:  'project',
      label: p.name,
      href:  `/projects/${p.slug}`,
      size:  'large',
    })
  }

  for (const c of categoryMap.values()) {
    nodes.push({
      id:    `category:${c.slug}`,
      type:  'category',
      label: c.name,
      href:  `/categories/${c.slug}`,
      size:  'medium',
    })
  }

  for (const n of rawNodes) {
    nodes.push({
      id:    `item:${n.slug}`,
      type:  'item',
      label: n.title,
      href:  `/nodes/${n.slug}`,
      size:  'small',
      tags:  (n.tags ?? []).map(t => t.slug).filter(Boolean),
    })
  }

  // Build edges: membership (item → project, item → category)
  const edges = []

  for (const n of rawNodes) {
    const itemId = `item:${n.slug}`
    for (const p of (n.projects ?? [])) {
      if (p?.slug) edges.push({ source: itemId, target: `project:${p.slug}`, kind: 'membership' })
    }
    for (const c of (n.categories ?? [])) {
      if (c?.slug) edges.push({ source: itemId, target: `category:${c.slug}`, kind: 'membership' })
    }
  }

  // Option B lateral edges: pairs of items sharing LATERAL_THRESHOLD+ tags
  const items = rawNodes.filter(n => (n.tags ?? []).length > 0)
  for (let i = 0; i < items.length; i++) {
    const slugsA = new Set((items[i].tags ?? []).map(t => t.slug).filter(Boolean))
    for (let j = i + 1; j < items.length; j++) {
      const slugsB = (items[j].tags ?? []).map(t => t.slug).filter(Boolean)
      const shared = slugsB.filter(s => slugsA.has(s))
      if (shared.length >= LATERAL_THRESHOLD) {
        edges.push({
          source: `item:${items[i].slug}`,
          target: `item:${items[j].slug}`,
          kind:   'sharedTag',
          weight: shared.length,
        })
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    nodes,
    edges,
  }
}
