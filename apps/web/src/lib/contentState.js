/**
 * contentState.js — Content State Governance
 *
 * Centralizes the Sanity content perspective decision:
 *   - Production + default dev: `perspective: 'published'` — drafts never leak
 *   - Explicit preview mode:    `perspective: 'previewDrafts'` — opt-in, dev-only
 *
 * Preview mode is activated by setting VITE_SANITY_PREVIEW=true in .env.
 * The build-time safety check in vite.config.js prevents this from shipping
 * to production — see docs/content-state-policy.md for the full contract.
 *
 * EPIC-0176 · Content State Governance
 */

/**
 * Returns the Sanity content perspective for the current environment.
 *
 * @returns {'published' | 'previewDrafts'}
 */
export function getContentPerspective() {
  const previewRequested = import.meta.env.VITE_SANITY_PREVIEW === 'true'

  if (previewRequested && !import.meta.env.PROD) {
    return 'previewDrafts'
  }

  return 'published'
}

/**
 * Returns true if the app is running in preview mode (draft content visible).
 * Use this to show visual indicators that the user is seeing unpublished content.
 *
 * @returns {boolean}
 */
export function isPreviewMode() {
  return getContentPerspective() === 'previewDrafts'
}

/**
 * Logs a console warning when preview mode is active.
 * Called once at app startup from sanity.js client initialization.
 */
export function logPreviewWarning() {
  if (isPreviewMode()) {
    console.warn(
      '%c⚠ PREVIEW MODE ACTIVE — draft content visible.\n' +
        'Production will show published content only.',
      'background: #ff247d; color: white; padding: 4px 8px; font-weight: bold;',
    )
  }
}
