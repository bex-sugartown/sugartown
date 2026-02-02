import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  useCdn: true, // Use CDN for faster, cached responses
})

// Helper for generating image URLs
const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
