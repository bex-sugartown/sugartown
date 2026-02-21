import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  // Token required: wp.* dot-namespace IDs are only visible to authenticated
  // queries even on a public dataset. VITE_SANITY_TOKEN should be a read-only
  // viewer token (create one at sanity.io/manage → API → Tokens).
  token: import.meta.env.VITE_SANITY_TOKEN,
  // CDN disabled: freshly imported docs (wp.* IDs) may not propagate to
  // the CDN cache immediately. Re-enable for production builds once content is stable.
  useCdn: import.meta.env.PROD,
})

// Helper for generating image URLs
const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
