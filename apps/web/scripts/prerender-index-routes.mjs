#!/usr/bin/env node
/**
 * prerender-index-routes.mjs — #256 (Inbound Visibility E1.4)
 *
 * The homepage and the archive index pages (/articles, /case-studies, /releases, /nodes, /library,
 * /knowledge-graph) shipped the bare SPA shell, so a crawler that skips JavaScript saw no title,
 * description or canonical. This step writes them into the HTML.
 *
 *   /            into dist/index.html (in place), with the heading in <noscript> so JavaScript
 *                users see no extra content and no layout shift (#213 watches homepage CLS/LCP)
 *   /<archive>   dist/<slug>.html from the shell dist/app.html, same pattern as #127
 *
 * Title, description, canonical, robots, og:* and JSON-LD come from the app's own resolveSeo() and
 * generateJsonLd(), compiled by build-page-snapshots.mjs into dist-ssr/, so the static HTML and the
 * browser cannot disagree. Runs after build-page-snapshots.mjs, which creates dist/app.html and
 * dist-ssr/. A failed fetch skips that route and the build continues.
 *
 * Not covered here: /tags, /categories, /projects, /people, /tools and /glossary. The taxonomy
 * index pages set no SEO of their own and the glossary page hard-codes its strings in JSX.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '..', 'dist')
const SSR_ENTRY = resolve(__dirname, '..', 'dist-ssr', 'pageSnapshots.entry.js')

const escHtml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escAttr = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')

function jsonLdScript(jsonLd) {
  if (!jsonLd) return ''
  return `<script type="application/ld+json" data-prerendered>${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
}

/** The head tags for one route, from resolveSeo() output. */
export function headTags(seo, share, jsonLd) {
  const og = seo.openGraph
  const tags = [
    `<meta name="description" content="${escAttr(seo.description)}" />`,
    seo.canonicalUrl ? `<link rel="canonical" href="${escAttr(seo.canonicalUrl)}" />` : '',
    seo.robots?.index === false || seo.robots?.follow === false
      ? `<meta name="robots" content="${[seo.robots.index === false ? 'noindex' : 'index', seo.robots.follow === false ? 'nofollow' : 'follow'].join(', ')}" />`
      : '',
    `<meta property="og:type" content="${escAttr(og.type)}" />`,
    `<meta property="og:title" content="${escAttr(og.title)}" />`,
    `<meta property="og:description" content="${escAttr(og.description)}" />`,
    seo.canonicalUrl ? `<meta property="og:url" content="${escAttr(seo.canonicalUrl)}" />` : '',
    share ? `<meta property="og:image" content="${escAttr(share.url)}" />` : '',
    share?.width ? `<meta property="og:image:width" content="${share.width}" />` : '',
    share?.height ? `<meta property="og:image:height" content="${share.height}" />` : '',
    share?.alt ? `<meta property="og:image:alt" content="${escAttr(share.alt)}" />` : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escAttr(og.title)}" />`,
    `<meta name="twitter:description" content="${escAttr(og.description)}" />`,
    jsonLdScript(jsonLd),
  ]
  return tags.filter(Boolean).map((t) => `    ${t}`).join('\n')
}

/** Replace the shell's <title> and description, drop any canonical, add the route's tags. */
export function applyHead(html, seo, share, jsonLd) {
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${escHtml(seo.title)}</title>`)
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace(/\s*<link rel="canonical"[^>]*>/g, '')
    .replace('</head>', `${headTags(seo, share, jsonLd)}\n  </head>`)
}

async function run() {
  console.log('\n🗂   Index-route prerender (#256)')
  if (!existsSync(SSR_ENTRY) || !existsSync(resolve(DIST, 'app.html'))) {
    console.warn('    ⚠️  dist-ssr or dist/app.html missing: run build-page-snapshots.mjs first. Skipped.')
    return
  }
  const m = await import(pathToFileURL(SSR_ENTRY).href)
  const { client, pageBySlugQuery, siteSettingsQuery, archivePageBySlugQuery, resolveSeo, generateJsonLd, ARCHIVE_PATHS, SHARE_IMAGE_FIELDS, shareImageTags, urlFor } = m

  const settings = await client.fetch(siteSettingsQuery)
  const shareSite = await client.fetch(`*[_type == "siteSettings"][0]{ defaultOgImage { ${SHARE_IMAGE_FIELDS} } }`)
  const site = { ...settings, defaultOgImage: shareSite?.defaultOgImage }
  const siteUrl = (site?.siteUrl || process.env.VITE_SITE_URL || 'https://sugartown.io').replace(/\/$/, '')
  const siteWithUrl = { ...site, siteUrl }
  const jsonLd = generateJsonLd(null, siteWithUrl)

  // ── Homepage ────────────────────────────────────────────────────────────────
  const home = await client.fetch(pageBySlugQuery, { slug: 'home' })
  if (home) {
    const seo = { ...resolveSeo(home, siteWithUrl), canonicalUrl: `${siteUrl}/` }
    const share = shareImageTags(seo.openGraph.image, urlFor)
    const hero = (home.sections ?? []).find((s) => s?._type === 'heroSection')
    const h1 = hero?.heading ? `<noscript><h1>${escHtml(hero.heading)}</h1><p>${escHtml(seo.description)}</p></noscript>` : ''
    const file = resolve(DIST, 'index.html')
    let html = applyHead(readFileSync(file, 'utf-8'), seo, share, jsonLd)
    if (h1) html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${h1}`)
    writeFileSync(file, html, 'utf-8')
    console.log(`    /  title: "${seo.title}"`)
  } else {
    console.warn('    ⚠️  homepage doc not found, / left as the shell')
  }

  // ── Archive index pages ─────────────────────────────────────────────────────
  const shell = readFileSync(resolve(DIST, 'app.html'), 'utf-8')
  let written = 0
  for (const path of ARCHIVE_PATHS) {
    const slug = path.slice(1)
    const doc = await client.fetch(archivePageBySlugQuery, { slug })
    if (!doc) {
      console.warn(`    ⚠️  ${path}: no published archivePage, skipped`)
      continue
    }
    const seo = resolveSeo(doc, siteWithUrl)
    const share = shareImageTags(seo.openGraph.image, urlFor)
    const body = `<h1>${escHtml(doc.title)}</h1>${doc.description ? `<p>${escHtml(doc.description)}</p>` : ''}`
    const html = applyHead(shell, seo, share, jsonLd).replace('<div id="root"></div>', `<div id="root"><main>${body}</main></div>`)
    writeFileSync(resolve(DIST, `${slug}.html`), html, 'utf-8')
    written++
    console.log(`    ${path}  title: "${seo.title}"`)
  }
  console.log(`    ${written} archive route(s) + homepage written`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((err) => {
    console.error('[index-routes] failed:', err)
    process.exit(1)
  })
}
