/**
 * Build-only entry for scripts/build-page-snapshots.mjs (#235, #236). Compiled with
 * `vite build --ssr` so the script runs the app's own queries, client and image-URL code instead
 * of a copy of them. Never imported by the app.
 */
export { client } from '../lib/sanity'
export { pageBySlugQuery, siteSettingsQuery } from '../lib/queries'
export { heroImageUrls, HERO_PHONE_MEDIA } from '../lib/heroImage'
export { SNAPSHOT_ELEMENT_IDS } from '../lib/buildSnapshot'
