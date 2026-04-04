/**
 * Storybook mock for apps/web/src/lib/contentState.js
 *
 * Always returns non-preview mode by default. Stories that need
 * preview mode can override window.__STORYBOOK_PREVIEW_MODE__.
 */

export function getContentPerspective() {
  return window.__STORYBOOK_PREVIEW_MODE__ ? 'previewDrafts' : 'published'
}

export function isPreviewMode() {
  return getContentPerspective() === 'previewDrafts'
}

export function logPreviewWarning() {}
