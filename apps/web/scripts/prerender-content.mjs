#!/usr/bin/env node
/**
 * prerender-content.mjs — SUG-183
 *
 * Generates static HTML snapshots for article, node, and case-study routes.
 * Runs after `vite build` so bots and importers (Medium, Googlebot, social
 * card scrapers) receive real content instead of the empty SPA shell.
 *
 * Each route gets dist/<prefix>/<slug>/index.html containing:
 *   - Full <head> with title, description, canonical, and OG tags
 *   - Article body as serialised HTML inside <div id="root">
 *   - The Vite bundle <script>/<link> tags so React loads and re-renders
 *
 * React uses createRoot (not hydrateRoot) so the pre-rendered content is
 * replaced by the full React app on client load — no hydration mismatch.
 *
 * Usage: node scripts/prerender-content.mjs
 * Called automatically from the `build` script in package.json.
 *
 * Env vars (same as build-sitemap.js):
 *   VITE_SANITY_PROJECT_ID
 *   VITE_SANITY_DATASET
 *   VITE_SANITY_API_VERSION
 *   SANITY_AUTH_TOKEN   (optional — only needed for private datasets)
 *   VITE_SITE_URL       (optional — defaults to https://sugartown.io)
 */

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '../dist')

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
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '')
      if (key && !(key in process.env)) process.env[key] = val
    }
  } catch {
    // .env not found — rely on process.env (CI/CD)
  }
}

loadEnv()

const projectId  = process.env.VITE_SANITY_PROJECT_ID
const dataset    = process.env.VITE_SANITY_DATASET
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2024-01-01'
const token      = process.env.SANITY_AUTH_TOKEN
const SITE_URL   = (process.env.VITE_SITE_URL || 'https://sugartown.io').replace(/\/+$/, '')

if (!projectId || !dataset) {
  console.error('[prerender] Missing VITE_SANITY_PROJECT_ID or VITE_SANITY_DATASET')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
  ...(token ? { token } : {}),
})

// ─── Route map (mirrors routes.js TYPE_NAMESPACES) ────────────────────────────

const TYPE_PREFIX = {
  article:   'articles',
  node:      'nodes',
  caseStudy: 'case-studies',
}

// ─── Lightweight Portable Text → HTML serialiser ─────────────────────────────
// Produces readable text for crawlers — not a full PT renderer.
// htmlSection SVG/chart blocks are stripped to their text content.

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
}

function spanToHtml(span, markDefs) {
  let text = escHtml(span.text || '')
  if (!text) return ''

  // Resolve annotation marks (links, citationRefs)
  for (const markKey of (span.marks || [])) {
    const def = markDefs?.find(d => d._key === markKey)
    if (def?._type === 'link' && def.href) {
      text = `<a href="${escAttr(def.href)}">${text}</a>`
    }
    // citationRef — just keep the text, skip the footnote mark
  }

  // Inline style marks
  if (span.marks?.includes('strong')) text = `<strong>${text}</strong>`
  if (span.marks?.includes('em')) text = `<em>${text}</em>`
  if (span.marks?.includes('code')) text = `<code>${text}</code>`

  return text
}

function ptBlocksToHtml(blocks) {
  if (!blocks?.length) return ''
  const lines = []
  let inUl = false
  let inOl = false

  for (const block of blocks) {
    if (block._type !== 'block') continue

    const isBullet = block.listItem === 'bullet'
    const isNumber = block.listItem === 'number'
    const markDefs = block.markDefs || []
    const inner = (block.children || []).map(c => spanToHtml(c, markDefs)).join('')

    if (!isBullet && inUl) { lines.push('</ul>'); inUl = false }
    if (!isNumber && inOl) { lines.push('</ol>'); inOl = false }
    if (isBullet  && !inUl) { lines.push('<ul>');  inUl = true }
    if (isNumber  && !inOl) { lines.push('<ol>');  inOl = true }

    if (isBullet || isNumber) {
      lines.push(`<li>${inner}</li>`)
      continue
    }

    switch (block.style) {
      case 'h1': lines.push(`<h1>${inner}</h1>`); break
      case 'h2': lines.push(`<h2>${inner}</h2>`); break
      case 'h3': lines.push(`<h3>${inner}</h3>`); break
      case 'h4': lines.push(`<h4>${inner}</h4>`); break
      case 'blockquote': lines.push(`<blockquote>${inner}</blockquote>`); break
      default: if (inner) lines.push(`<p>${inner}</p>`)
    }
  }

  if (inUl) lines.push('</ul>')
  if (inOl) lines.push('</ol>')
  return lines.join('\n')
}

function sectionToHtml(section) {
  switch (section._type) {
    case 'heroSection':
      return [
        section.heading   ? `<h1>${escHtml(section.heading)}</h1>` : '',
        section.subheading ? `<p><em>${escHtml(section.subheading)}</em></p>` : '',
      ].filter(Boolean).join('\n')

    case 'textSection': {
      const heading = section.heading ? `<h2>${escHtml(section.heading)}</h2>` : ''
      // Filter out richImage blocks before serialising (they have no text)
      const textBlocks = (section.content || []).filter(b => b._type === 'block')
      return [heading, ptBlocksToHtml(textBlocks)].filter(Boolean).join('\n')
    }

    case 'calloutSection': {
      const label = [section.number, section.title].filter(Boolean).join(' — ')
      const labelHtml = label ? `<p><strong>${escHtml(label)}</strong></p>` : ''
      return `<blockquote>${labelHtml}${ptBlocksToHtml(section.body || [])}</blockquote>`
    }

    case 'accordionSection': {
      const heading = section.heading ? `<h2>${escHtml(section.heading)}</h2>` : ''
      const items = (section.items || []).map((item, i) => {
        const prefix = section.numbered
          ? `${section.numberPrefix || ''}${i + 1}: `
          : ''
        return `<h3>${escHtml(prefix + item.title)}</h3>\n${ptBlocksToHtml(item.content || [])}`
      }).join('\n')
      return [heading, items].filter(Boolean).join('\n')
    }

    case 'cardSection': {
      const name = section.name ? `<h3>${escHtml(section.name)}</h3>` : ''
      const items = (section.items || []).map(item =>
        `<p><strong>${escHtml(item.metric)}:</strong> ${escHtml(item.valueAfter || '')}</p>`
      ).join('\n')
      return [name, items].filter(Boolean).join('\n')
    }

    case 'htmlSection':
      // Strip all tags — keep only text nodes for crawlers
      return `<p>${(section.html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}</p>`

    case 'richImage':
      return section.alt ? `<figure><figcaption>${escHtml(section.alt)}</figcaption></figure>` : ''

    default:
      return ''
  }
}

function sectionsToHtml(sections) {
  return (sections || []).map(sectionToHtml).filter(Boolean).join('\n')
}

// ─── Vite asset injection ─────────────────────────────────────────────────────
// Read the built dist/index.html and extract <link> and <script> tags so the
// React app loads and re-renders on the client after the static HTML is served.

function getViteAssets() {
  try {
    const indexHtml = readFileSync(resolve(DIST, 'index.html'), 'utf-8')
    const links   = [...indexHtml.matchAll(/<link[^>]+>/g)].map(m => m[0]).join('\n    ')
    const scripts = [...indexHtml.matchAll(/<script[^>]+><\/script>/g)].map(m => m[0]).join('\n    ')
    return { links, scripts }
  } catch {
    console.warn('[prerender] dist/index.html not found — asset injection skipped')
    return { links: '', scripts: '' }
  }
}

// ─── HTML template ────────────────────────────────────────────────────────────

function buildHtml({ title, description, canonicalUrl, ogImageUrl, bodyHtml, assets }) {
  const safeTitle = escHtml(title)
  const safeDesc  = escAttr(description || '')
  const safeUrl   = escAttr(canonicalUrl)
  const ogImg     = ogImageUrl ? `\n  <meta property="og:image" content="${escAttr(ogImageUrl)}" />` : ''

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} — Sugartown</title>
  <meta name="description" content="${safeDesc}" />
  <link rel="canonical" href="${safeUrl}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escAttr(title)}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${safeUrl}" />${ogImg}
  ${assets.links}
</head>
<body>
  <div id="root"><article>
${bodyHtml}
  </article></div>
  ${assets.scripts}
</body>
</html>`
}

// ─── File writer ──────────────────────────────────────────────────────────────

function writeRouteHtml(urlPath, html) {
  const segments = urlPath.split('/').filter(Boolean)
  const dir = resolve(DIST, ...segments)
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, 'index.html'), html, 'utf-8')
}

// ─── Sanity queries ───────────────────────────────────────────────────────────

const CONTENT_QUERY = (type) => `*[
  _type == "${type}" &&
  defined(slug.current) &&
  !(_id in path("drafts.**"))
]{
  _id,
  title,
  "slug": slug.current,
  "description": coalesce(excerpt, seo.description, ""),
  sections[]
}`

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  if (!existsSync(DIST)) {
    console.error('[prerender] dist/ not found — run vite build first')
    process.exit(1)
  }

  console.log('[prerender] Fetching published content from Sanity...')
  const assets = getViteAssets()

  const [articles, nodes, caseStudies] = await Promise.all([
    client.fetch(CONTENT_QUERY('article')),
    client.fetch(CONTENT_QUERY('node')),
    client.fetch(CONTENT_QUERY('caseStudy')),
  ])

  const routes = [
    ...articles.map(doc  => ({ doc, prefix: TYPE_PREFIX.article })),
    ...nodes.map(doc     => ({ doc, prefix: TYPE_PREFIX.node })),
    ...caseStudies.map(doc => ({ doc, prefix: TYPE_PREFIX.caseStudy })),
  ]

  console.log(`[prerender] Writing ${routes.length} route snapshots...`)
  let written = 0

  for (const { doc, prefix } of routes) {
    if (!doc.slug) continue
    const canonicalUrl = `${SITE_URL}/${prefix}/${doc.slug}`
    const bodyHtml     = sectionsToHtml(doc.sections)
    const html         = buildHtml({
      title: doc.title || '',
      description: doc.description || '',
      canonicalUrl,
      bodyHtml,
      assets,
    })
    writeRouteHtml(`/${prefix}/${doc.slug}`, html)
    written++
  }

  console.log(`[prerender] Done — ${written} routes written to dist/`)
  console.log(`[prerender]   articles:    ${articles.length}`)
  console.log(`[prerender]   nodes:       ${nodes.length}`)
  console.log(`[prerender]   case-studies: ${caseStudies.length}`)
}

run().catch(err => {
  console.error('[prerender] Fatal error:', err)
  process.exit(1)
})
