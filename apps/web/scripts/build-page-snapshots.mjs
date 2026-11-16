#!/usr/bin/env node
/**
 * build-page-snapshots.mjs — #235, #236
 *
 * Makes first render independent of the Sanity queries it used to wait on:
 *   1. Copies the plain SPA shell dist/index.html to dist/app.html. Every route except `/`
 *      falls back to app.html (public/_redirects, written by build-redirects.js).
 *   2. Writes site settings into both index.html and app.html, so the header and pre-header paint
 *      with the page instead of pushing it down when they arrive (#236).
 *   3. Writes the homepage's Sanity document into index.html only, plus <link rel="preload"> tags
 *      for the hero background so the image starts before the JS runs (#235).
 * src/lib/buildSnapshot.js reads them; the app still refetches live data.
 *
 * Runs last in `pnpm build`, after prerender-content.mjs, which copies index.html's <link> tags
 * into every prerendered page and must not pick up the homepage preload.
 *
 * Queries, client and image URLs come from the app's own modules, compiled by
 * `vite build --ssr src/ssr/pageSnapshots.entry.js` into dist-ssr/, so they cannot drift.
 *
 * A failed or empty fetch skips that snapshot and the build continues: the page then loads as it
 * did before the snapshot existed.
 */
import { execFileSync } from 'child_process'
import { copyFileSync, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB = resolve(__dirname, '..')
const DIST = resolve(WEB, 'dist')
const SSR_OUT = resolve(WEB, 'dist-ssr')
const INDEX = resolve(DIST, 'index.html')
const APP = resolve(DIST, 'app.html')

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')

// '<' escaped so no value can close the <script> element.
const dataTag = (id, data) =>
  `<script type="application/json" id="${id}">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`

function addAfterRoot(file, tag) {
  const html = readFileSync(file, 'utf-8')
  writeFileSync(file, html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${tag}`), 'utf-8')
}

async function fetchOrSkip(label, fn) {
  try {
    const data = await fn()
    if (data) return data
    console.warn(`    ⚠️  ${label}: query returned nothing, snapshot skipped`)
  } catch (err) {
    console.warn(`    ⚠️  ${label}: fetch failed, snapshot skipped: ${err.message}`)
  }
  return null
}

async function run() {
  console.log('\n📸  Page snapshots (#235, #236)')
  copyFileSync(INDEX, APP)
  console.log('    dist/app.html written (SPA shell for every route but /)')

  execFileSync('npx', ['vite', 'build', '--ssr', 'src/ssr/pageSnapshots.entry.js', '--outDir', SSR_OUT, '--emptyOutDir', '--logLevel', 'warn'], {
    cwd: WEB,
    stdio: 'inherit',
  })
  const { client, pageBySlugQuery, siteSettingsQuery, heroImageUrls, HERO_PHONE_MEDIA, SNAPSHOT_ELEMENT_IDS } =
    await import(pathToFileURL(resolve(SSR_OUT, 'pageSnapshots.entry.js')).href)

  const settings = await fetchOrSkip('site settings', () => client.fetch(siteSettingsQuery))
  if (settings) {
    const tag = dataTag(SNAPSHOT_ELEMENT_IDS.siteSettings, settings)
    addAfterRoot(INDEX, tag)
    addAfterRoot(APP, tag)
    console.log(`    site settings: ${(tag.length / 1024).toFixed(1)} KB into index.html and app.html`)
  }

  const page = await fetchOrSkip('homepage', () => client.fetch(pageBySlugQuery, { slug: 'home' }))
  if (!page) return
  const tag = dataTag(SNAPSHOT_ELEMENT_IDS.home, page)
  addAfterRoot(INDEX, tag)

  // Preload the first hero's background at the size HeroSection will ask for.
  const hero = (page.sections ?? []).find((s) => s?._type === 'heroSection' && s.backgroundImage?.asset)
  if (hero) {
    const urls = heroImageUrls(hero.backgroundImage)
    const preloadTags = [
      `<link rel="preload" as="image" fetchpriority="high" href="${escAttr(urls.phone)}" media="${HERO_PHONE_MEDIA}">`,
      `<link rel="preload" as="image" fetchpriority="high" href="${escAttr(urls.wide)}" media="not all and ${HERO_PHONE_MEDIA}">`,
    ].join('\n    ')
    const html = readFileSync(INDEX, 'utf-8')
    writeFileSync(INDEX, html.replace('</head>', `    ${preloadTags}\n  </head>`), 'utf-8')
  }
  console.log(`    homepage: ${(tag.length / 1024).toFixed(1)} KB into index.html, hero preload ${hero ? 'yes' : 'none (no hero image)'}`)
}

run().catch((err) => {
  console.error('[page-snapshots] failed:', err)
  process.exit(1)
})
