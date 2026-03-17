import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { getContentPerspective, logPreviewWarning } from './contentState.js'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  // Token required: wp.* dot-namespace IDs are only visible to authenticated
  // queries even on a public dataset. VITE_SANITY_TOKEN should be a read-only
  // viewer token (create one at sanity.io/manage → API → Tokens).
  token: import.meta.env.VITE_SANITY_TOKEN,
  // CDN enabled in production only — freshly imported docs (wp.* IDs) may not
  // propagate to the CDN cache immediately. CDN is not used in preview mode
  // because draft content is not cached.
  useCdn: import.meta.env.PROD,
  // Content perspective decision delegated to contentState.js.
  // Default: 'published' — prevents empty drafts from shadowing published docs.
  // Preview: 'previewDrafts' — opt-in via VITE_SANITY_PREVIEW=true (dev only).
  perspective: getContentPerspective(),
})

// Raw client — bypasses perspective overlay so we can detect draft documents
// by their actual _id (including the "drafts." prefix). Only used in preview mode
// for draft badge detection. Never use for content rendering.
export const rawClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: false,
  perspective: 'raw',
})

// Log a visible warning when preview mode is active
logPreviewWarning()

// Helper for generating image URLs
const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source).auto('format')
}
