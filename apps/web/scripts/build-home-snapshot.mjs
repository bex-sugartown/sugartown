#!/usr/bin/env node
/**
 * build-home-snapshot.mjs — #235
 *
 * Makes the homepage's first render independent of the Sanity query:
 *   1. Copies the plain SPA shell dist/index.html to dist/app.html. Every route except `/`
 *      falls back to app.html (public/_redirects, written by build-redirects.js).
 *   2. Writes the homepage's published Sanity document into dist/index.html as JSON, read by
 *      src/lib/homeSnapshot.js, plus <link rel="preload"> tags for the hero background so the
 *      image starts downloading before the JS runs.
 *
 * Runs last in `pnpm build`, after prerender-content.mjs, which copies index.html's <link> tags
 * into every prerendered page and must not pick up the homepage preload.
 *
 * The query, client and image URLs come from the app's own modules, compiled by
 * `vite build --ssr src/ssr/homeSnapshot.entry.js` into dist-ssr/, so they cannot drift.
 *
 * If the Sanity fetch fails, index.html is left as the plain shell and the build continues:
 * the homepage then loads exactly as it did before #235.
 */
import { execFileSync } from 'child_process'
import { copyFileSync, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB = resolve(__dirname, '..')
const DIST = resolve(WEB, 'dist')
const SSR_OUT = resolve(WEB, 'dist-ssr')

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')

async function run() {
  console.log('\n🏠  Home snapshot (#235)')
  const indexPath = resolve(DIST, 'index.html')
  copyFileSync(indexPath, resolve(DIST, 'app.html'))
  console.log('    dist/app.html written (SPA shell for every route but /)')

  execFileSync('npx', ['vite', 'build', '--ssr', 'src/ssr/homeSnapshot.entry.js', '--outDir', SSR_OUT, '--emptyOutDir', '--logLevel', 'warn'], {
    cwd: WEB,
    stdio: 'inherit',
  })
  const { client, pageBySlugQuery, heroImageUrls, HERO_PHONE_MEDIA, HOME_SNAPSHOT_ELEMENT_ID } =
    await import(pathToFileURL(resolve(SSR_OUT, 'homeSnapshot.entry.js')).href)

  let page
  try {
    page = await client.fetch(pageBySlugQuery, { slug: 'home' })
  } catch (err) {
    console.warn(`    ⚠️  Sanity fetch failed, homepage left as the plain shell: ${err.message}`)
    return
  }
  if (!page) {
    console.warn('    ⚠️  No page with slug "home"; homepage left as the plain shell')
    return
  }

  // '<' escaped so no value can close the <script> element.
  const json = JSON.stringify(page).replace(/</g, '\\u003c')
  const dataTag = `<script type="application/json" id="${HOME_SNAPSHOT_ELEMENT_ID}">${json}</script>`

  // Preload the first hero's background at the size HeroSection will ask for.
  const hero = (page.sections ?? []).find((s) => s?._type === 'heroSection' && s.backgroundImage?.asset)
  let preloadTags = ''
  if (hero) {
    const urls = heroImageUrls(hero.backgroundImage)
    preloadTags = [
      `<link rel="preload" as="image" fetchpriority="high" href="${escAttr(urls.phone)}" media="${HERO_PHONE_MEDIA}">`,
      `<link rel="preload" as="image" fetchpriority="high" href="${escAttr(urls.wide)}" media="not all and ${HERO_PHONE_MEDIA}">`,
    ].join('\n    ')
  }

  let html = readFileSync(indexPath, 'utf-8')
  if (preloadTags) html = html.replace('</head>', `    ${preloadTags}\n  </head>`)
  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${dataTag}`)
  writeFileSync(indexPath, html, 'utf-8')
  console.log(`    dist/index.html: homepage data ${(json.length / 1024).toFixed(1)} KB, hero preload ${hero ? 'yes' : 'none (no hero image)'}`)
}

run().catch((err) => {
  console.error('[home-snapshot] failed:', err)
  process.exit(1)
})
