#!/usr/bin/env node
/**
 * scripts/migrate/image-audit-fixes.js
 *
 * Executes image asset fixes from Becky's audit CSV:
 *   1. Renames — patch originalFilename (metadata only, no CDN URL change)
 *   2. Thumbnail replacement — swap luxury article sm ref → full-size ref
 *   3. Archive — download images locally, remove refs from docs, delete assets
 *
 * Usage:
 *   node scripts/migrate/image-audit-fixes.js --dry-run    # preview changes
 *   node scripts/migrate/image-audit-fixes.js --execute     # apply changes
 *   node scripts/migrate/image-audit-fixes.js --archive     # download + delete orphans
 */

import { buildSanityClient, banner, section, ok, warn, fail, info, ensureDir, writeJson, ARTIFACTS_DIR } from './lib.js'
import { writeFileSync, createWriteStream } from 'fs'
import { resolve } from 'path'
import { Writable } from 'stream'
import { pipeline } from 'stream/promises'

const ARCHIVE_DIR = resolve(ARTIFACTS_DIR, 'archived-images')

// ─── Action definitions from Becky's audit ───────────────────────────────────

const RENAMES = [
  // article- → hero-
  { id: 'image-7a1bf3dad420b14f7746c081c05c55e858fffcee-1536x1024-png', from: 'article-doll-imac-1999.png', to: 'hero-doll-imac-1999.png' },
  { id: 'image-87fd542c85788d72bfac344342ca62f361d36693-1536x1024-png', from: 'article-doll-travel-agency-1986.png', to: 'hero-doll-travel-agency-1986.png' },
  { id: 'image-5dd197724f810653a84305de2b8d9ce5ff0bab60-1536x1024-png', from: 'article-dolly-mainframe-1978.png', to: 'hero-dolly-mainframe-1978.png' },

  // cs-bareminerals- → cs-beauty-
  { id: 'image-f7c6bbc8c72b40c3a5584e6c030e5c42f3ea864b-1584x1620-jpg', from: 'cs-bareminerals-content-model.webp', to: 'cs-beauty-content-model.webp' },
  { id: 'image-1d713b04049019d8cb62eba71f2a9fac9c0d1866-1318x308-png', from: 'cs-bareminerals-contentful-quote.png', to: 'cs-beauty-contentful-quote.png' },
  { id: 'image-fe296fa01516400a09c92db2c85ac3f26d279f36-1024x320-png', from: 'cs-bareminerals-homepage-banner.png', to: 'cs-beauty-homepage-banner.png' },
  { id: 'image-cbbac2e4e5a7640dcf7e91e5962a73232b977c08-1024x1024-png', from: 'cs-bareminerals-homepage.png', to: 'cs-beauty-homepage.png' },
  { id: 'image-bd42516c6b0f5100131c1409aaa24d0c90128c35-138x1024-png', from: 'cs-bareminerals-references-chart.png', to: 'cs-beauty-references-chart.png' },
  { id: 'image-e6d469439b843c74eedfa0df69298cf42236c67b-1024x406-png', from: 'cs-bareminerals-screenshot.png', to: 'cs-beauty-screenshot.png' },

  // site-retro-desk- → hero-retro-desk-
  { id: 'image-d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500-jpg', from: 'site-retro-desk-1.webp', to: 'hero-retro-desk-1.webp' },
  { id: 'image-571d156d28393fb9806756bb37d18a32cd07fdba-6000x4000-jpg', from: 'site-retro-desk-2.webp', to: 'hero-retro-desk-2.webp' },
  { id: 'image-98246b3c6b5a759d9cef6b64d24c888901e5d075-6000x4000-jpg', from: 'site-retro-desk-3.webp', to: 'hero-retro-desk-3.webp' },
  { id: 'image-cf4f583d1eff5dcf2c90e3959cf28b1ac48ff940-6000x4000-jpg', from: 'site-retro-desk-4.webp', to: 'hero-retro-desk-4.webp' },
  { id: 'image-fa6f97f14153a905916e572de10edb877eac7f45-6000x4000-jpg', from: 'site-retro-desk-5.webp', to: 'hero-retro-desk-5.webp' },
  { id: 'image-1639e4bee10a54fbef4c04289963bf38868160bc-6000x4000-jpg', from: 'site-retro-desk-6.webp', to: 'hero-retro-desk-6.webp' },
  { id: 'image-ae7a950a812e5f92ec7a3cb5f210de33e5eeaf08-6000x4000-jpg', from: 'site-retro-desk-7.webp', to: 'hero-retro-desk-7.webp' },
  { id: 'image-5fae24a2651ef9a67b716bf14c6ede64b87d3432-6000x4000-jpg', from: 'site-retro-desk-8.webp', to: 'hero-retro-desk-8.webp' },
]

// Thumbnail to replace: swap -sm ref → full-size ref in referencing docs
const THUMB_REPLACEMENT = {
  oldAssetId: 'image-b98d5ff642daaffbc11311e7296b059d1a532b1f-1024x683-png',     // article-luxury-dot-com-illustration-sm.png
  newAssetId: 'image-e866a7e1175c5d1ccdf81ebce595838ba8bd4dd5-1536x1024-png',     // article-luxury-dot-com-illustration.png
  oldName: 'article-luxury-dot-com-illustration-sm.png',
  newName: 'article-luxury-dot-com-illustration.png',
}

// Assets to archive (download + delete) — orphans with no refs
const ARCHIVE_ORPHANS = [
  { id: 'image-b4017a1fe05b6e39341c1154b47745e63e529829-972x750-jpg', name: 'article-luxury-dot-com-feature.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/b4017a1fe05b6e39341c1154b47745e63e529829-972x750.jpg' },
  { id: 'image-4cab06596537405a2e1be2abdd3f4424525f6a83-466x331-jpg', name: 'beckyalice.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/4cab06596537405a2e1be2abdd3f4424525f6a83-466x331.jpg' },
  { id: 'image-3f3a352c79942f0447ade44d856fdc7f94fee55c-984x798-jpg', name: 'beebaby_of_berkeley.jpeg', url: 'https://cdn.sanity.io/images/poalmzla/production/3f3a352c79942f0447ade44d856fdc7f94fee55c-984x798.jpg' },
  { id: 'image-e50fbf05af934d3815752018655e8371b7533535-360x428-jpg', name: 'beehead_1990.jpeg', url: 'https://cdn.sanity.io/images/poalmzla/production/e50fbf05af934d3815752018655e8371b7533535-360x428.jpg' },
  { id: 'image-fb1c8486c646ec9b8d992dcd14bbbeeb88102e14-1024x850-jpg', name: 'beehead_feature.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/fb1c8486c646ec9b8d992dcd14bbbeeb88102e14-1024x850.jpg' },
  { id: 'image-7d6449059fcde2e48fee2f6f38fd089ff68cdb1b-1024x514-jpg', name: 'beehead01_banner.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/7d6449059fcde2e48fee2f6f38fd089ff68cdb1b-1024x514.jpg' },
  { id: 'image-aa2edc7aee9f9fe0cc6b4cecd6cfafd97dc4a7b7-150x150-jpg', name: 'content-model-150x150.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/aa2edc7aee9f9fe0cc6b4cecd6cfafd97dc4a7b7-150x150.jpg' },
  { id: 'image-ef76629a9d8b821d0e053da0e026505cb3dbcab6-1584x1620-jpg', name: 'content-model.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/ef76629a9d8b821d0e053da0e026505cb3dbcab6-1584x1620.jpg' },
  { id: 'image-c7ffc41cd5817a2733881685bd90a9cb60d972ee-1890x1185-png', name: 'diagram-knowledge-graph-latest.png', url: 'https://cdn.sanity.io/images/poalmzla/production/c7ffc41cd5817a2733881685bd90a9cb60d972ee-1890x1185.png' },
  { id: 'image-103e670840378157fc1b14cd0175da9f299224f0-2515x1447-png', name: 'diagram-screenshot-2026-01-alt.png', url: 'https://cdn.sanity.io/images/poalmzla/production/103e670840378157fc1b14cd0175da9f299224f0-2515x1447.png' },
  { id: 'image-e00c03568d8bf8abe742629fd8f573daf7d7ac45-2560x1432-png', name: 'diagram-screenshot-2026-01.png', url: 'https://cdn.sanity.io/images/poalmzla/production/e00c03568d8bf8abe742629fd8f573daf7d7ac45-2560x1432.png' },
  { id: 'image-6ed42ed189688c4809a9e5f2012d33391b813b21-2431x1072-jpg', name: 'fx-networks-featured.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/6ed42ed189688c4809a9e5f2012d33391b813b21-2431x1072.jpg' },
  { id: 'image-83c37b40a617854262ddd7c454605c027d38ba52-150x150-jpg', name: 'global-content-model-150x150.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/83c37b40a617854262ddd7c454605c027d38ba52-150x150.jpg' },
  { id: 'image-10451e4ee11f8bb38f77ea052a3240aea7c6c946-972x750-jpg', name: 'luxury_dot_com-feature.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/10451e4ee11f8bb38f77ea052a3240aea7c6c946-972x750.jpg' },
  { id: 'image-d9b404689e009c9c70aa2f594e2fdcac6d34059c-6000x4000-jpg', name: 'retro-computer-desk-arrangement-3.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/d9b404689e009c9c70aa2f594e2fdcac6d34059c-6000x4000.jpg' },
  { id: 'image-2169f1af72cafd5da7399633682d8a51b300e6c5-2560x1707-jpg', name: 'retro-computer-desk-arrangement-2-scaled.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/2169f1af72cafd5da7399633682d8a51b300e6c5-2560x1707.jpg' },
  { id: 'image-0c9d9948a1f2b10a982e9d9a80138ba800b8e85e-6000x4000-jpg', name: 'retro-computer-desk-arrangement-2.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/0c9d9948a1f2b10a982e9d9a80138ba800b8e85e-6000x4000.jpg' },
  { id: 'image-539a42700ba08998f12bd4ed3a49c6503b23514e-6000x4000-jpg', name: 'retro-computer-desk-arrangement-3b.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/539a42700ba08998f12bd4ed3a49c6503b23514e-6000x4000.jpg' },
  { id: 'image-e9a3f734afdd3ae8f7f6631a8b30aa548ec8e8d1-6000x4000-jpg', name: 'retro-computer-desk-arrangement-4.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/e9a3f734afdd3ae8f7f6631a8b30aa548ec8e8d1-6000x4000.jpg' },
  { id: 'image-51d35dd51b932f0d330a558c2aa3fafd3e97473a-6000x4000-jpg', name: 'retro-computer-desk-arrangement-5.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/51d35dd51b932f0d330a558c2aa3fafd3e97473a-6000x4000.jpg' },
  { id: 'image-6de9f87c0262e89887c7daa89976f8c2d5fa9402-6000x4000-jpg', name: 'retro-computer-desk-arrangement-6.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/6de9f87c0262e89887c7daa89976f8c2d5fa9402-6000x4000.jpg' },
  { id: 'image-4b305982dfa58915a8fe74a39ce26e8f0035b7ef-6000x4000-jpg', name: 'retro-computer-desk-arrangement-7.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/4b305982dfa58915a8fe74a39ce26e8f0035b7ef-6000x4000.jpg' },
  { id: 'image-d83fe4bd5a7b45dfbf9768d820ec59da476ec28a-6000x4500-jpg', name: 'retro-computer-desk-arrangement.jpg', url: 'https://cdn.sanity.io/images/poalmzla/production/d83fe4bd5a7b45dfbf9768d820ec59da476ec28a-6000x4500.jpg' },
  { id: 'image-fb47bebdf1d866f3ce3a19a1bef238f4c972f5c0-360x428-jpg', name: 'site-beckyalice-1990.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/fb47bebdf1d866f3ce3a19a1bef238f4c972f5c0-360x428.jpg' },
  { id: 'image-a451c11990c4dba6e5efea93d1a18eddbcf2918f-984x798-jpg', name: 'site-beckyalice-beebaby.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/a451c11990c4dba6e5efea93d1a18eddbcf2918f-984x798.jpg' },
  { id: 'image-527e7373087778c3fe09800b53438dd6409877af-1024x850-jpg', name: 'site-beckyalice-feature.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/527e7373087778c3fe09800b53438dd6409877af-1024x850.jpg' },
  { id: 'image-6f6d3bc20192d9c2ccba9d2731b41ce76299f43e-743x1024-png', name: 'site-beelady-alt-transparent.png', url: 'https://cdn.sanity.io/images/poalmzla/production/6f6d3bc20192d9c2ccba9d2731b41ce76299f43e-743x1024.png' },
  { id: 'image-a6c037bbe530d9d216c40c5c1c1b89138d738496-896x898-png', name: 'site-beelady-favicon-lg.png', url: 'https://cdn.sanity.io/images/poalmzla/production/a6c037bbe530d9d216c40c5c1c1b89138d738496-896x898.png' },
  { id: 'image-d59f6f4577ca0fca2368410964bb77b5aadb8332-1284x1213-png', name: 'site-beelady-feature-transparent.png', url: 'https://cdn.sanity.io/images/poalmzla/production/d59f6f4577ca0fca2368410964bb77b5aadb8332-1284x1213.png' },
  { id: 'image-13f0834d17179f2bb892a8e4555a9abb33f26dfc-900x1349-png', name: 'site-beelady-transparent.png', url: 'https://cdn.sanity.io/images/poalmzla/production/13f0834d17179f2bb892a8e4555a9abb33f26dfc-900x1349.png' },
  { id: 'image-4f7b855d4b117b0e90b83ec80721cc5c7f776559-200x191-png', name: 'site-favicon.png', url: 'https://cdn.sanity.io/images/poalmzla/production/4f7b855d4b117b0e90b83ec80721cc5c7f776559-200x191.png' },
  { id: 'image-23790581beab46a679da8c7904ab8fdf88014a98-1536x1024-png', name: 'site-illustration-landscape.png', url: 'https://cdn.sanity.io/images/poalmzla/production/23790581beab46a679da8c7904ab8fdf88014a98-1536x1024.png' },
  { id: 'image-8a2d0e5a884fd043170f120b2a49b570aa3e1872-1536x1024-png', name: 'site-illustration-portrait-1.png', url: 'https://cdn.sanity.io/images/poalmzla/production/8a2d0e5a884fd043170f120b2a49b570aa3e1872-1536x1024.png' },
  { id: 'image-78b316a17e7224e361c81eebba8c1a3da17e520a-576x575-png', name: 'site-mushroom-illustration.png', url: 'https://cdn.sanity.io/images/poalmzla/production/78b316a17e7224e361c81eebba8c1a3da17e520a-576x575.png' },
  { id: 'image-da5fb7d0bad72d78d03ac606e47e2d4896bd84e6-2560x1707-jpg', name: 'site-retro-desk-3-scaled.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/da5fb7d0bad72d78d03ac606e47e2d4896bd84e6-2560x1707.jpg' },
  { id: 'image-2efc98059ba9c28d93312c2e51f63feb76f8a3b6-30x30-svg', name: 'site-submit-spinner.svg', url: 'https://cdn.sanity.io/images/poalmzla/production/2efc98059ba9c28d93312c2e51f63feb76f8a3b6-30x30.svg' },
  { id: 'image-7b8598e0a9d61db14bde7c634208b442aa811ec1-1536x1024-png', name: 'site-sugartown-logo-2026-a.png', url: 'https://cdn.sanity.io/images/poalmzla/production/7b8598e0a9d61db14bde7c634208b442aa811ec1-1536x1024.png' },
  { id: 'image-819778f97ba84e271f2ce2e7e74db9a86d9c8dc3-1536x1024-png', name: 'site-sugartown-logo-2026-b.png', url: 'https://cdn.sanity.io/images/poalmzla/production/819778f97ba84e271f2ce2e7e74db9a86d9c8dc3-1536x1024.png' },
  { id: 'image-8b84de48aec61651f5f980a8e5bd4d0e13c20e9e-1536x1024-png', name: 'site-sugartown-logo-2026-c.png', url: 'https://cdn.sanity.io/images/poalmzla/production/8b84de48aec61651f5f980a8e5bd4d0e13c20e9e-1536x1024.png' },
  { id: 'image-8312230227f1c1b2545bcfe811a42f51f59371fc-1536x1024-png', name: 'site-sugartown-logo-sm-dark-2026.png', url: 'https://cdn.sanity.io/images/poalmzla/production/8312230227f1c1b2545bcfe811a42f51f59371fc-1536x1024.png' },
]

// WP thumbnails with refs — need ref removal from docs before deletion
const ARCHIVE_WP_THUMBS = [
  { id: 'image-be4d47e6c8d4b6b1addaf82f3e2d09f2fcc6039b-150x150-png', name: 'cs-bareminerals-content-model-template-thumb.png', url: 'https://cdn.sanity.io/images/poalmzla/production/be4d47e6c8d4b6b1addaf82f3e2d09f2fcc6039b-150x150.png' },
  { id: 'image-93718476b67a2ae067d9d998d54549a64d6e6b97-150x150-jpg', name: 'cs-bareminerals-content-model-thumb.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/93718476b67a2ae067d9d998d54549a64d6e6b97-150x150.jpg' },
  { id: 'image-3011ba81607d38864d0b286ce097ab5aabfe5e8a-150x150-jpg', name: 'cs-bareminerals-global-content-model-thumb.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/3011ba81607d38864d0b286ce097ab5aabfe5e8a-150x150.jpg' },
  { id: 'image-e9cc8b52a9cc0858f671ee1f9a73d7cfab6e906f-150x150-png', name: 'cs-bareminerals-homepage-thumb.png', url: 'https://cdn.sanity.io/images/poalmzla/production/e9cc8b52a9cc0858f671ee1f9a73d7cfab6e906f-150x150.png' },
  { id: 'image-f81c07d02aad4d1b59a61ebd232cec6cb53d93e9-150x150-png', name: 'cs-bareminerals-references-thumb.png', url: 'https://cdn.sanity.io/images/poalmzla/production/f81c07d02aad4d1b59a61ebd232cec6cb53d93e9-150x150.png' },
  { id: 'image-b7e8ce0f3bdf8a7c28a888cacf2137cb74cedc85-150x150-png', name: 'cs-bareminerals-screenshot-thumb.png', url: 'https://cdn.sanity.io/images/poalmzla/production/b7e8ce0f3bdf8a7c28a888cacf2137cb74cedc85-150x150.png' },
  { id: 'image-30dc4dc8c2dff2b485923f8f01e1e1f909031472-150x150-png', name: 'cs-bareminerals-detail-1-thumb.png', url: 'https://cdn.sanity.io/images/poalmzla/production/30dc4dc8c2dff2b485923f8f01e1e1f909031472-150x150.png' },
  { id: 'image-1f5972024664cb180ea4b030bb3ff0e58481449d-150x150-png', name: 'cs-bareminerals-detail-2-thumb.png', url: 'https://cdn.sanity.io/images/poalmzla/production/1f5972024664cb180ea4b030bb3ff0e58481449d-150x150.png' },
  { id: 'image-ba0a971011caec4aa811b00e63fae7f3ff45692c-150x150-webp', name: 'cs-beringer-homepage-thumb.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/ba0a971011caec4aa811b00e63fae7f3ff45692c-150x150.webp' },
  { id: 'image-1bcb892558c92e97616749e95b57c237d1f3c99d-150x150-webp', name: 'cs-beringer-recipes-thumb.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/1bcb892558c92e97616749e95b57c237d1f3c99d-150x150.webp' },
  { id: 'image-48fefe3e8fe3db3c93171851aa569acc6fb303cd-150x150-webp', name: 'cs-lyris-app-create-thumb.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/48fefe3e8fe3db3c93171851aa569acc6fb303cd-150x150.webp' },
  { id: 'image-56bd50367c7ba5c4aa78eae6062d43c717a30ead-150x150-webp', name: 'cs-lyris-app-thumb.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/56bd50367c7ba5c4aa78eae6062d43c717a30ead-150x150.webp' },
  { id: 'image-95931cf6f131ad879e4af05c06b58e4549c18988-150x150-webp', name: 'cs-lyris-landing-pages-thumb.webp', url: 'https://cdn.sanity.io/images/poalmzla/production/95931cf6f131ad879e4af05c06b58e4549c18988-150x150.webp' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function downloadFile(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`)
  const fileStream = createWriteStream(destPath)
  // Node 18+ readable stream from fetch body
  const reader = res.body.getReader()
  const writable = new Writable({
    write(chunk, encoding, callback) {
      fileStream.write(chunk, callback)
    },
  })
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    fileStream.write(value)
  }
  fileStream.end()
  return new Promise((resolve, reject) => {
    fileStream.on('finish', resolve)
    fileStream.on('error', reject)
  })
}

/**
 * Walk a document tree and find all paths where _ref matches a target asset ID.
 * Returns array of {path, key} objects where path is the JSON path and key is the
 * _key of the array item containing the ref (for unset operations).
 */
function findRefPaths(obj, targetRef, currentPath = '') {
  const results = []
  if (!obj || typeof obj !== 'object') return results

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const item = obj[i]
      results.push(...findRefPaths(item, targetRef, `${currentPath}[${i}]`))
    }
  } else {
    if (obj._ref === targetRef) {
      results.push({ path: currentPath, key: obj._key })
    }
    for (const [key, val] of Object.entries(obj)) {
      if (key.startsWith('_') && key !== '_key') continue // skip _id, _type, _rev etc for perf
      results.push(...findRefPaths(val, targetRef, currentPath ? `${currentPath}.${key}` : key))
    }
  }
  return results
}

/**
 * For a Portable Text content array, find _key values of image blocks
 * that reference a given asset ID.
 */
function findPTImageBlockKeys(contentArray, assetId) {
  if (!Array.isArray(contentArray)) return []
  const keys = []
  for (const block of contentArray) {
    if (block._type === 'image' && block.asset?._ref === assetId) {
      keys.push(block._key)
    }
    // Also check richImage type
    if (block._type === 'richImage' && block.asset?.asset?._ref === assetId) {
      keys.push(block._key)
    }
  }
  return keys
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const mode = process.argv[2]

if (!mode || !['--dry-run', '--execute', '--archive'].includes(mode)) {
  console.log(`
Usage:
  node scripts/migrate/image-audit-fixes.js --dry-run    Preview all changes
  node scripts/migrate/image-audit-fixes.js --execute    Apply renames + thumb swap
  node scripts/migrate/image-audit-fixes.js --archive    Download + delete archive assets
`)
  process.exit(0)
}

const isDryRun = mode === '--dry-run'
const isArchive = mode === '--archive'
const isExecute = mode === '--execute'

const client = buildSanityClient()

// ═══════════════════════════════════════════════════════════════════════════════
// Phase 1: Renames (metadata only — patch originalFilename)
// ═══════════════════════════════════════════════════════════════════════════════

if (isDryRun || isExecute) {
  banner('Phase 1: Metadata Renames')
  info(`${RENAMES.length} assets to rename`)

  for (const r of RENAMES) {
    if (isDryRun) {
      info(`  [rename] ${r.from} → ${r.to}`)
    } else {
      try {
        await client.patch(r.id).set({ originalFilename: r.to }).commit()
        ok(`${r.from} → ${r.to}`)
      } catch (err) {
        fail(`${r.from}: ${err.message}`)
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Phase 2: Thumbnail replacement — swap luxury -sm ref → full-size
// ═══════════════════════════════════════════════════════════════════════════════

if (isDryRun || isExecute) {
  banner('Phase 2: Thumbnail Replacement')
  const { oldAssetId, newAssetId, oldName, newName } = THUMB_REPLACEMENT

  // Find all documents referencing the old asset
  const referencingDocs = await client.fetch(
    `*[references($assetId)] { _id, _type, title }`,
    { assetId: oldAssetId }
  )
  info(`${oldName} → ${newName}`)
  info(`  Found ${referencingDocs.length} referencing doc(s)`)

  for (const doc of referencingDocs) {
    if (isDryRun) {
      info(`  [swap ref] ${doc._type}: ${doc.title || doc._id}`)
      info(`    ${oldAssetId} → ${newAssetId}`)
    } else {
      // Fetch full doc to find all ref paths
      const fullDoc = await client.getDocument(doc._id)
      const paths = findRefPaths(fullDoc, oldAssetId)
      info(`  ${doc._type}: ${doc.title || doc._id} — ${paths.length} ref(s)`)

      if (paths.length > 0) {
        // Build patch: for each path ending in _ref, set it to new asset ID
        let patch = client.patch(doc._id)
        for (const p of paths) {
          // p.path looks like "content[3].asset._ref" or "images[0].asset.asset._ref"
          // We need to set the parent object's _ref
          patch = patch.set({ [`${p.path}._ref`]: newAssetId })
        }
        try {
          await patch.commit()
          ok(`  Swapped ${paths.length} ref(s) in ${doc._id}`)
        } catch (err) {
          fail(`  ${doc._id}: ${err.message}`)
        }
      }
    }
  }

  // After swapping refs, archive the old -sm asset
  if (!isDryRun) {
    info(`  Marking ${oldName} for deletion (now unreferenced)`)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Phase 3: Archive — download and delete
// ═══════════════════════════════════════════════════════════════════════════════

if (isDryRun || isArchive) {
  const allArchive = [...ARCHIVE_ORPHANS, ...ARCHIVE_WP_THUMBS]
  // Include the luxury sm asset after ref swap
  allArchive.push({
    id: THUMB_REPLACEMENT.oldAssetId,
    name: THUMB_REPLACEMENT.oldName,
    url: 'https://cdn.sanity.io/images/poalmzla/production/b98d5ff642daaffbc11311e7296b059d1a532b1f-1024x683.png',
  })

  banner('Phase 3: Archive + Delete')
  info(`${allArchive.length} assets to archive`)
  info(`  ${ARCHIVE_ORPHANS.length} orphans (no refs)`)
  info(`  ${ARCHIVE_WP_THUMBS.length} WP thumbnails (refs will be removed)`)
  info(`  1 luxury sm thumbnail (refs already swapped in Phase 2)`)

  if (isDryRun) {
    section('Orphans to delete')
    for (const a of ARCHIVE_ORPHANS) {
      info(`  [delete] ${a.name} (${a.id})`)
    }
    section('WP thumbnails — refs to remove then delete')
    for (const a of ARCHIVE_WP_THUMBS) {
      info(`  [remove refs + delete] ${a.name} (${a.id})`)
    }
    section('Luxury sm thumbnail')
    info(`  [delete after ref swap] ${THUMB_REPLACEMENT.oldName}`)
  }

  if (isArchive) {
    ensureDir(ARCHIVE_DIR)

    // Step 1: Download all archive assets
    section('Downloading assets')
    let downloaded = 0
    for (const a of allArchive) {
      const ext = a.url.split('.').pop().split('?')[0]
      const safeName = a.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const destPath = resolve(ARCHIVE_DIR, safeName)
      try {
        await downloadFile(a.url, destPath)
        downloaded++
        ok(`${a.name} → ${safeName}`)
      } catch (err) {
        fail(`${a.name}: ${err.message}`)
      }
    }
    info(`Downloaded ${downloaded}/${allArchive.length} assets to artifacts/archived-images/`)

    // Step 2: Remove refs from documents for WP thumbs
    section('Removing WP thumbnail references from documents')
    for (const thumb of ARCHIVE_WP_THUMBS) {
      const refs = await client.fetch(
        `*[references($assetId)] { _id, _type, title }`,
        { assetId: thumb.id }
      )
      if (refs.length === 0) {
        info(`  ${thumb.name}: no refs to remove`)
        continue
      }

      for (const doc of refs) {
        const fullDoc = await client.getDocument(doc._id)
        if (!fullDoc) {
          warn(`  ${doc._id} not found — skipping`)
          continue
        }

        // Strategy: find image blocks in content/body arrays that ref this asset
        // and unset them by _key
        let removed = false

        // Check all array fields for image blocks referencing this asset
        for (const [field, val] of Object.entries(fullDoc)) {
          if (!Array.isArray(val)) continue

          const blockKeys = []
          for (const item of val) {
            if (!item || typeof item !== 'object') continue
            // Direct image block: { _type: 'image', asset: { _ref: '...' } }
            if (item._type === 'image' && item.asset?._ref === thumb.id && item._key) {
              blockKeys.push(item._key)
            }
            // Rich image: { _type: 'richImage', asset: { asset: { _ref: '...' } } }
            if (item._type === 'richImage' && item.asset?.asset?._ref === thumb.id && item._key) {
              blockKeys.push(item._key)
            }
            // Gallery item with asset ref
            if (item.asset?._ref === thumb.id && item._key) {
              blockKeys.push(item._key)
            }
          }

          if (blockKeys.length > 0) {
            const unsetPaths = blockKeys.map(k => `${field}[_key=="${k}"]`)
            try {
              await client.patch(doc._id).unset(unsetPaths).commit()
              ok(`  Removed ${blockKeys.length} image block(s) from ${doc._id}.${field}`)
              removed = true
            } catch (err) {
              fail(`  ${doc._id}.${field}: ${err.message}`)
            }
          }
        }

        if (!removed) {
          // Fallback: try to find any nested ref and log it
          const paths = findRefPaths(fullDoc, thumb.id)
          if (paths.length > 0) {
            warn(`  ${doc._id}: found ${paths.length} ref(s) at unusual paths — manual fix needed`)
            for (const p of paths) info(`    → ${p.path}`)
          }
        }
      }
    }

    // Step 3: Delete all archive assets
    section('Deleting archived assets from Sanity')
    let deleted = 0
    let skipped = 0
    for (const a of allArchive) {
      // Verify no remaining refs before deletion
      const remaining = await client.fetch(
        `count(*[references($assetId)])`,
        { assetId: a.id }
      )
      if (remaining > 0) {
        warn(`  ${a.name}: still has ${remaining} ref(s) — skipping deletion`)
        skipped++
        continue
      }

      try {
        await client.delete(a.id)
        deleted++
        ok(`Deleted ${a.name}`)
      } catch (err) {
        fail(`${a.name}: ${err.message}`)
      }
    }
    info(`\nDeleted ${deleted}/${allArchive.length} assets (${skipped} skipped due to remaining refs)`)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════════════════════

banner('Summary')
info(`Mode: ${mode}`)
info(`Renames:             ${RENAMES.length}`)
info(`Thumbnail swaps:     1`)
info(`Archive (orphans):   ${ARCHIVE_ORPHANS.length}`)
info(`Archive (WP thumbs): ${ARCHIVE_WP_THUMBS.length}`)
info(`Archive (sm thumb):  1`)
info(`Total archive:       ${ARCHIVE_ORPHANS.length + ARCHIVE_WP_THUMBS.length + 1}`)

if (isDryRun) {
  info('\n⚡ This was a dry run. Use --execute for renames/swaps, then --archive for downloads/deletions.')
}
