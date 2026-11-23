/**
 * Build-only entry for scripts/build-page-snapshots.mjs (#235, #236). Compiled with
 * `vite build --ssr` so the script runs the app's own queries, client and image-URL code instead
 * of a copy of them. Never imported by the app.
 */
export { client } from '../lib/sanity'
export { pageBySlugQuery, siteSettingsQuery } from '../lib/queries'
export { heroImageUrls, HERO_PHONE_MEDIA } from '../lib/heroImage'
export { SNAPSHOT_ELEMENT_IDS } from '../lib/buildSnapshot'
// #256: scripts/prerender-index-routes.mjs writes the same head tags SeoHead sets in the browser.
export { archivePageBySlugQuery } from '../lib/queries'
export { resolveSeo } from '../lib/seo'
export { generateJsonLd } from '../lib/jsonLd'
export { ARCHIVE_PATHS } from '../lib/routes'
export { SHARE_IMAGE_FIELDS, shareImageTags } from '../lib/shareImage'
export { urlFor } from '../lib/sanity'
