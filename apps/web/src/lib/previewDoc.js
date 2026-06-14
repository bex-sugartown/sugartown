/**
 * previewDoc — dev-only store for the document currently shown in preview mode.
 *
 * Detail pages register their { id, type } so the PreviewBanner's Studio link can
 * deep-link straight to that document instead of the Studio home. Uses a tiny
 * external store (no context provider needed). In production nothing subscribes,
 * so the setter just updates an unread module variable — effectively a no-op.
 *
 * SUG-166 follow-up.
 */
const STUDIO_URL = import.meta.env.VITE_SANITY_STUDIO_URL || 'http://localhost:3333'

let current = null
const listeners = new Set()

export function setPreviewDoc(doc) {
  current = doc
  listeners.forEach((l) => l())
}

export function getPreviewDoc() {
  return current
}

export function subscribePreviewDoc(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Structure-agnostic Studio deep link. The intent route lets Studio resolve the
 * document to wherever it lives in the desk, regardless of type. Falls back to
 * the Studio home when no document is registered.
 */
export function studioEditUrl(doc) {
  if (!doc?.id || !doc?.type) return `${STUDIO_URL}/`
  const baseId = doc.id.replace(/^drafts\./, '') // Studio resolves published id → its draft
  return `${STUDIO_URL}/intent/edit/id=${encodeURIComponent(baseId)};type=${encodeURIComponent(doc.type)}/`
}
