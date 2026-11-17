// shareImage.js — which image a page shares (og:image) and its URL (#239).
// No imports on purpose: scripts/prerender-content.mjs runs in plain Node and shares these with
// seo.js, provenance.js and SeoHead.jsx, so the static HTML and the page cannot pick different images.

// ST-178: GROQ fragment for the stamped copies of an image. One definition; provenance.js re-exports it.
export const AI_PROVENANCE_PROJECTION = `"provenance": provenanceFiles[] { width, "url": file.asset->url }`

/** Fields of a share image. hotspot and crop let fit('crop') keep the editor's focal point. */
export const SHARE_IMAGE_FIELDS = `asset->, hotspot, crop, alt, aiGenerated, aiTool, ${AI_PROVENANCE_PROJECTION}`

/** The first hero's background image, the fallback when seo.openGraph.image is empty. Document-level field. */
export const HERO_SHARE_IMAGE_PROJECTION =
  `"heroShareImage": sections[_type in ["heroSection", "hero"]][0].backgroundImage { ${SHARE_IMAGE_FIELDS} }`

export const SHARE_IMAGE_WIDTH = 1200
export const SHARE_IMAGE_HEIGHT = 630

/** The stamped copies of a flagged image, widest last, or null. */
export function stampedCopies(image) {
  if (!image?.aiGenerated || !image.provenance?.length) return null
  return [...image.provenance].sort((a, b) => a.width - b.width)
}

/**
 * ST-181: URL of the stamped copy for a flagged share image, because the Sanity image CDN would
 * strip the metadata and the baked mark. Null when there is no stamped copy.
 */
export function shareImageUrl(image) {
  const copies = stampedCopies(image)
  return copies ? copies[copies.length - 1].url : null
}

/** Share image for a doc: its SEO share image, else its hero image, else the site default. */
export function resolveShareImage(doc, site) {
  const candidates = [doc?.seo?.openGraph?.image, doc?.heroShareImage, site?.defaultOgImage]
  return candidates.find((img) => img?.asset) ?? null
}

/**
 * Share image URL and its tag values. `urlFor` is the caller's @sanity/image-url builder, passed in
 * so this file stays import-free. A stamped copy keeps its own size, so width and height are null.
 */
export function shareImageTags(image, urlFor) {
  if (!image?.asset) return null
  const stamped = shareImageUrl(image)
  return {
    url: stamped ?? urlFor(image).width(SHARE_IMAGE_WIDTH).height(SHARE_IMAGE_HEIGHT).fit('crop').url(),
    width: stamped ? null : SHARE_IMAGE_WIDTH,
    height: stamped ? null : SHARE_IMAGE_HEIGHT,
    alt: image.alt || null,
  }
}
