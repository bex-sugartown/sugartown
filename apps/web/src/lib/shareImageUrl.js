// shareImageUrl.js — the share image URL of a resolved SEO object, for JSON-LD `image` (#258).
// The same URL SeoHead writes to og:image, so the structured data and the meta tag cannot differ.
import { urlFor } from './sanity'
import { shareImageTags } from './shareImage.js'

export function seoShareImageUrl(seo) {
  const image = seo?.openGraph?.image
  if (!image) return null
  try {
    return shareImageTags(image, urlFor)?.url ?? null
  } catch {
    return null
  }
}
