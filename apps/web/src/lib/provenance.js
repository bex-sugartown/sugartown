/**
 * provenance — image URL choice for AI-generated images (ST-178).
 *
 * The Sanity image CDN strips embedded metadata, so a flagged image that has stamped copies is
 * served from them (file assets, served as-is). Everything else keeps the normal Sanity URL.
 */
import { urlFor } from './sanity'

// ST-178: GROQ fragment for the stamped copies of an image. Spliced into every projection that
// carries aiGenerated (queries.js, seo.js). One definition, so the shape cannot drift.
export const AI_PROVENANCE_PROJECTION = `"provenance": provenanceFiles[] { width, "url": file.asset->url }`

/** The stamped copies of a flagged image, widest last, or null. */
export function stampedCopies(image) {
  if (!image?.aiGenerated || !image.provenance?.length) return null
  return [...image.provenance].sort((a, b) => a.width - b.width)
}

/** URL for an image at about `width` px: the smallest stamped copy that is wide enough, else the Sanity URL. */
export function imageUrlFor(image, width) {
  const copies = stampedCopies(image)
  if (copies) return (copies.find((c) => c.width >= width) ?? copies[copies.length - 1]).url
  return urlFor(image.asset).width(width).quality(90).url()
}

/**
 * ST-181: URL for a social share image (og:image). A flagged share image with a stamped copy is
 * served from it, because the Sanity image CDN would strip the metadata and the baked mark.
 * Returns null when there is no stamped copy; the caller keeps its normal URL.
 */
export function shareImageUrl(image) {
  const copies = stampedCopies(image)
  return copies ? copies[copies.length - 1].url : null
}
