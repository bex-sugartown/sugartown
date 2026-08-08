import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import { getContentPerspective, logPreviewWarning } from './contentState.js'

/**
 * Preview-only read token. Never present in a production bundle.
 *
 * SUG-260 de-dotted every `wp.*` content id, so published content no longer
 * needs authentication. Drafts still do: they are stored as `drafts.<id>`, and
 * a dot in an id makes a document invisible to anonymous queries regardless of
 * the dataset's public-read grant.
 *
 * Production never reads drafts — `getContentPerspective()` returns 'published'
 * whenever `PROD` is set, and the `contentStateSafety` plugin in vite.config.js
 * hard-fails a production build that sets VITE_SANITY_PREVIEW=true.
 *
 * The guard is `import.meta.env.PROD` rather than `isPreviewMode()` on purpose:
 * Vite replaces it with a literal `true` at build time, so the minifier folds
 * the branch and the token string never reaches the bundle. A cross-module call
 * would not reliably eliminate. Verified by grepping the built assets.
 */
const previewToken = import.meta.env.PROD ? undefined : import.meta.env.VITE_SANITY_TOKEN

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  token: previewToken,
  // CDN enabled in production only. CDN is not used in preview mode because
  // draft content is not cached.
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
  token: previewToken,
  useCdn: false,
  perspective: 'raw',
})

// Log a visible warning when preview mode is active
logPreviewWarning()

// Helper for generating image URLs
const builder = createImageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source).auto('format')
}
