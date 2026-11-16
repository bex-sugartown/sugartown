/**
 * Build-only entry for scripts/build-home-snapshot.mjs (#235). Compiled with `vite build --ssr`
 * so the script runs the app's own query, client and image-URL code instead of a copy of it.
 * Never imported by the app.
 */
export { client } from '../lib/sanity'
export { pageBySlugQuery } from '../lib/queries'
export { heroImageUrls, HERO_PHONE_MEDIA } from '../lib/heroImage'
export { HOME_SNAPSHOT_ELEMENT_ID } from '../lib/homeSnapshot'
