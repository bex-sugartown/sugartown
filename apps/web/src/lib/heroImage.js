/**
 * heroImage — the one definition of which hero background size a viewport gets (#213, #235).
 *
 * Read by HeroSection (PageSections.jsx) at render, and by scripts/build-page-snapshots.mjs to
 * write the homepage's <link rel="preload"> tags. Both must pick the same URL or the preload is
 * wasted, so the media query and widths live here only.
 */
import { imageUrlFor } from './provenance'

/** Viewports matching this query get the phone-sized image. */
export const HERO_PHONE_MEDIA = '(max-width: 768px)'

export const HERO_IMAGE_WIDTHS = { phone: 1080, wide: 1920 }

/** URLs for both sizes of a hero background image. */
export function heroImageUrls(image) {
  return {
    phone: imageUrlFor(image, HERO_IMAGE_WIDTHS.phone),
    wide: imageUrlFor(image, HERO_IMAGE_WIDTHS.wide),
  }
}

/** The URL this browser should load. Falls back to the wide image outside a browser. */
export function heroImageUrl(image) {
  const urls = heroImageUrls(image)
  const isPhone = typeof window !== 'undefined' && window.matchMedia?.(HERO_PHONE_MEDIA).matches
  return isPhone ? urls.phone : urls.wide
}
