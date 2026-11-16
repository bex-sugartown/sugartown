/**
 * homeSnapshot — the homepage's Sanity data, written into dist/index.html at build time (#235).
 *
 * scripts/build-home-snapshot.mjs writes it; HomePage reads it so the first render does not wait
 * on the Sanity query. The app still refetches and swaps in live data, so a stale snapshot shows
 * only until that fetch returns.
 */
import { isPreviewMode } from './contentState'

export const HOME_SNAPSHOT_ELEMENT_ID = 'st-home-snapshot'

/**
 * The build-time homepage document, or undefined. Only on `/`, and never in preview mode
 * (preview shows drafts; the snapshot is published content).
 */
export function readHomeSnapshot() {
  if (typeof document === 'undefined' || window.location.pathname !== '/' || isPreviewMode()) return undefined
  const el = document.getElementById(HOME_SNAPSHOT_ELEMENT_ID)
  if (!el) return undefined
  try {
    return JSON.parse(el.textContent) ?? undefined
  } catch {
    return undefined
  }
}
